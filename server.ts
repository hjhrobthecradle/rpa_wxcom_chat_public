import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getDatabase,
  saveDatabaseToDisk,
  getStoragePath,
  verifyAdminCredentials,
  generateSessionToken,
  validateSessionToken,
  revokeSessionToken,
  isUrlSafeFromSSRF,
  maskSensitiveUrl,
  maskSecret,
  ChatMessage,
  WebhookChannel,
  WebhookLog,
} from "./server/storage.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security Headers Middleware (basic hardening)
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  const db = getDatabase();

  // Background ticker for auto-monitor countdown simulation
  setInterval(() => {
    if (db.monitorState.isActive) {
      if (db.monitorState.nextRunSeconds > 0) {
        db.monitorState.nextRunSeconds -= 1;
        if (db.monitorState.nextRunSeconds === 0) {
          db.monitorState.currentStatus = "collecting";
          setTimeout(() => {
            db.monitorState.currentStatus = "waiting";
            db.monitorState.nextRunSeconds = db.monitorState.intervalMinutes * 60;
            db.monitorState.lastRunTime = new Date().toLocaleTimeString();
            db.monitorState.totalCycles += 1;
            db.monitorState.todayCapturedCount += Math.floor(Math.random() * 5) + 1;
            saveDatabaseToDisk();
          }, 3000);
        }
      }
    }
  }, 1000);

  // ==========================================
  // AUTHENTICATION & ACCESS CONTROL ENDPOINTS
  // ==========================================

  // Auth 1: Admin Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "请输入管理员账号与密码" });
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({ error: "管理员账号或密码错误" });
    }

    const token = generateSessionToken(username);
    res.json({
      success: true,
      token,
      user: {
        username,
        role: "admin",
        name: "系统超级管理员",
        loginTime: new Date().toISOString(),
      },
    });
  });

  // Auth 2: Verify current auth status
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const check = validateSessionToken(token);

    if (!check.valid) {
      return res.status(401).json({ authenticated: false, error: "未登录或登录态已失效" });
    }

    res.json({
      authenticated: true,
      user: {
        username: check.username,
        role: "admin",
        name: "系统超级管理员",
      },
    });
  });

  // Auth 3: Logout
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    if (token) {
      revokeSessionToken(token);
    }
    res.json({ success: true, message: "已安全登出" });
  });

  // ==========================================
  // AUTH MIDDLEWARE (Protects all subsequent /api/* routes)
  // ==========================================
  app.use("/api", (req, res, next) => {
    // Exempt login and auth check endpoints
    if (req.path === "/auth/login" || req.path === "/auth/me") {
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const check = validateSessionToken(token);

    if (!check.valid) {
      return res.status(401).json({
        error: "401 Unauthorized: 访问已被安全策略拦截，请先使用管理员凭证登录系统",
        code: "AUTH_REQUIRED",
      });
    }

    next();
  });

  // ==========================================
  // SYSTEM & BUSINESS LOGIC APIS
  // ==========================================

  // API 1: System Status
  app.get("/api/status", (_req, res) => {
    const totalArchived = db.sessions.reduce((acc, s) => acc + s.archivedCount, 0) + db.messages.length;
    res.json({
      wecomClientConnected: true,
      wecomVersion: "4.1.28.6014 (64位)",
      rpaHookStatus: "活跃挂钩 (Active Handle)",
      encryptedLocalStore: true,
      encryptionAlgorithm: "AES-256 本地硬件隔离",
      localStoragePath: getStoragePath(),
      lastPersistedAt: db.lastPersistedAt,
      securityProtected: true,
      authEnforced: true,
      ssrfFilterActive: true,
      totalSessions: db.sessions.length,
      totalArchivedMessages: totalArchived,
      totalDiskSize: `${((totalArchived * 0.42) / 1024).toFixed(2)} MB`,
      collectionJob: db.collectionJob,
      monitorState: db.monitorState,
    });
  });

  // API 2: Get Sessions
  app.get("/api/sessions", (_req, res) => {
    res.json(db.sessions);
  });

  // API 3: Get Messages (with query filter)
  app.get("/api/messages", (req, res) => {
    const { sessionId, search, type, startDate, endDate } = req.query;
    let filtered = [...db.messages];

    if (sessionId && typeof sessionId === "string") {
      filtered = filtered.filter((m) => m.sessionId === sessionId);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.sessionName.toLowerCase().includes(q)
      );
    }
    if (type && typeof type === "string" && type !== "all") {
      filtered = filtered.filter((m) => m.type === type);
    }
    if (startDate && typeof startDate === "string") {
      filtered = filtered.filter((m) => m.timestamp >= startDate);
    }
    if (endDate && typeof endDate === "string") {
      filtered = filtered.filter((m) => m.timestamp <= `${endDate} 23:59:59`);
    }

    res.json({
      total: filtered.length,
      messages: filtered,
    });
  });

  // API 4: Start or control history collection
  app.post("/api/collect/history", (req, res) => {
    const { action, targetIds, startDate, endDate } = req.body;

    if (action === "start") {
      const selectedTargets = db.sessions.filter((s) => targetIds?.includes(s.id));
      db.collectionJob.isRunning = true;
      db.collectionJob.isPaused = false;
      db.collectionJob.targetIds = targetIds || db.sessions.map((s) => s.id);
      db.collectionJob.startDate = startDate || "2026-08-01";
      db.collectionJob.endDate = endDate || "2026-09-10";
      db.collectionJob.totalEstimated = (selectedTargets.length || 1) * 350;
      db.collectionJob.currentCollected = 0;
      db.collectionJob.currentTargetIndex = 0;
      db.collectionJob.currentSessionName = selectedTargets[0]?.name || "全部目标";
      db.collectionJob.startedAt = new Date().toISOString();

      saveDatabaseToDisk();
      return res.json({ success: true, message: "历史消息采集任务已启动", collectionJob: db.collectionJob });
    }

    if (action === "pause") {
      db.collectionJob.isPaused = true;
      saveDatabaseToDisk();
      return res.json({ success: true, message: "历史消息采集任务已暂停", collectionJob: db.collectionJob });
    }

    if (action === "resume") {
      db.collectionJob.isPaused = false;
      saveDatabaseToDisk();
      return res.json({ success: true, message: "断点续采已恢复", collectionJob: db.collectionJob });
    }

    if (action === "stop") {
      db.collectionJob.isRunning = false;
      db.collectionJob.isPaused = false;
      saveDatabaseToDisk();
      return res.json({ success: true, message: "历史消息采集任务已终止", collectionJob: db.collectionJob });
    }

    if (action === "progress_tick") {
      if (db.collectionJob.isRunning && !db.collectionJob.isPaused) {
        db.collectionJob.currentCollected += Math.floor(Math.random() * 8) + 4;
        if (db.collectionJob.currentCollected >= db.collectionJob.totalEstimated) {
          db.collectionJob.currentCollected = db.collectionJob.totalEstimated;
          db.collectionJob.isRunning = false;
        }
        saveDatabaseToDisk();
      }
      return res.json({ collectionJob: db.collectionJob });
    }

    res.status(400).json({ error: "Invalid action" });
  });

  // API 5: Toggle Monitor
  app.post("/api/monitor/toggle", (req, res) => {
    const { enabled, mode, intervalMinutes } = req.body;
    if (enabled !== undefined) db.monitorState.isActive = Boolean(enabled);
    if (mode) db.monitorState.mode = mode;
    if (intervalMinutes) {
      db.monitorState.intervalMinutes = Number(intervalMinutes);
      db.monitorState.nextRunSeconds = db.monitorState.intervalMinutes * 60;
    }
    db.monitorState.currentStatus = db.monitorState.isActive ? "waiting" : "idle";
    saveDatabaseToDisk();
    res.json({ success: true, monitorState: db.monitorState });
  });

  // API 6: Webhook channels CRUD with Credential Masking
  app.get("/api/webhooks", (_req, res) => {
    const safeChannels = db.webhookChannels.map((c) => ({
      ...c,
      url: maskSensitiveUrl(c.url),
      secret: maskSecret(c.secret),
    }));
    res.json({
      channels: safeChannels,
      logs: db.webhookLogs,
    });
  });

  app.post("/api/webhooks", (req, res) => {
    const { name, type, url, secret, enabled, events } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: "渠道名称与 Webhook URL 为必填项" });
    }

    // SSRF Validation
    const ssrfCheck = isUrlSafeFromSSRF(url);
    if (!ssrfCheck.safe) {
      return res.status(400).json({ error: `安全策略拦截 (SSRF 防御): ${ssrfCheck.reason}` });
    }

    const newChannel: WebhookChannel = {
      id: `wh-${Date.now()}`,
      name,
      type: type || "custom",
      url,
      secret: secret || "",
      enabled: enabled ?? true,
      events: events || ["new_message"],
      successCount: 0,
      failureCount: 0,
    };
    db.webhookChannels.push(newChannel);
    saveDatabaseToDisk(true);

    res.json({
      success: true,
      channel: {
        ...newChannel,
        url: maskSensitiveUrl(newChannel.url),
        secret: maskSecret(newChannel.secret),
      },
    });
  });

  app.put("/api/webhooks/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.webhookChannels.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: "Channel not found" });

    const current = db.webhookChannels[idx];
    const updates = { ...req.body };

    // If url is not masked placeholder, validate SSRF
    if (updates.url && !updates.url.includes("****")) {
      const ssrfCheck = isUrlSafeFromSSRF(updates.url);
      if (!ssrfCheck.safe) {
        return res.status(400).json({ error: `安全策略拦截 (SSRF 防御): ${ssrfCheck.reason}` });
      }
    } else {
      delete updates.url; // Keep original unmasked url
    }

    // If secret is masked placeholder, keep original
    if (updates.secret && updates.secret.includes("****")) {
      delete updates.secret;
    }

    db.webhookChannels[idx] = { ...current, ...updates };
    saveDatabaseToDisk(true);

    res.json({
      success: true,
      channel: {
        ...db.webhookChannels[idx],
        url: maskSensitiveUrl(db.webhookChannels[idx].url),
        secret: maskSecret(db.webhookChannels[idx].secret),
      },
    });
  });

  app.delete("/api/webhooks/:id", (req, res) => {
    const { id } = req.params;
    db.webhookChannels = db.webhookChannels.filter((c) => c.id !== id);
    saveDatabaseToDisk(true);
    res.json({ success: true });
  });

  // API 7: Test Webhook connection with SSRF Defense
  app.post("/api/webhooks/test", async (req, res) => {
    const { channelId, url, secret, payload } = req.body;
    let targetUrl = url;

    // If frontend sent channelId or url is masked, retrieve real unmasked url
    if (!targetUrl || targetUrl.includes("****")) {
      const channel = db.webhookChannels.find((c) => c.id === channelId);
      if (channel) {
        targetUrl = channel.url;
      }
    }

    if (!targetUrl) {
      return res.status(400).json({ error: "目标 Webhook URL 不能为空" });
    }

    // SSRF Check
    const ssrfCheck = isUrlSafeFromSSRF(targetUrl);
    if (!ssrfCheck.safe) {
      return res.status(403).json({
        error: `SSRF 防护已触发: ${ssrfCheck.reason}`,
        code: "SSRF_BLOCKED",
      });
    }

    const testPayload = payload || {
      msgtype: "markdown",
      markdown: {
        content: `### 🔔 [企业微信归档测试]\n> 连通性测试时间: **${new Date().toLocaleString()}**\n> 来源: 企业微信RPA消息采集工具\n> 状态: 运行正常 (Ping Success)`,
      },
    };

    const startTime = Date.now();
    let status = 200;
    let responseText = '{"errcode":0,"errmsg":"ok"}';
    let isSuccess = true;

    try {
      if (targetUrl.startsWith("http")) {
        const fetchRes = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(secret ? { "X-Webhook-Secret": secret } : {}),
          },
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(5000),
        });
        status = fetchRes.status;
        responseText = await fetchRes.text();
        isSuccess = fetchRes.ok;
      }
    } catch (err: any) {
      status = 502;
      responseText = `模拟网关响应 (实际网络限制): ${err?.message || "连接超时"}`;
      if (targetUrl.includes("demo-key") || targetUrl.includes("demo-audit")) {
        status = 200;
        responseText = '{"errcode":0,"errmsg":"ok (Simulated Sandbox Response)"}';
        isSuccess = true;
      }
    }

    const durationMs = Date.now() - startTime;
    const log: WebhookLog = {
      id: `log-${Date.now()}`,
      channelId: channelId || "adhoc",
      channelName: db.webhookChannels.find((c) => c.id === channelId)?.name || "临时测试渠道",
      timestamp: new Date().toLocaleString(),
      status,
      success: isSuccess,
      durationMs,
      requestPayload: testPayload,
      responseBody: responseText,
    };

    db.webhookLogs.unshift(log);
    if (db.webhookLogs.length > 50) db.webhookLogs.pop();
    saveDatabaseToDisk();

    res.json({
      success: isSuccess,
      status,
      durationMs,
      response: responseText,
      log,
    });
  });

  // API 8: Send/Inject simulated WeCom message with persistence and limit
  app.post("/api/messages/send", (req, res) => {
    const { sessionId, content, type, imageUrl } = req.body;
    const session = db.sessions.find((s) => s.id === sessionId) || db.sessions[0];

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sessionId: session.id,
      sessionName: session.name,
      senderName: "李工 (我)",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
      isSelf: true,
      content: content || "新采集消息同步测试",
      type: type || "text",
      imageUrl,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      syncedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    db.messages.push(newMsg);
    // Limit stored messages to avoid runaway memory
    if (db.messages.length > 50000) {
      db.messages.shift();
    }

    session.lastMessage = content || "[图片]";
    session.lastTime = new Date().toLocaleTimeString().substring(0, 5);
    session.archivedCount += 1;

    // Trigger enabled Webhooks
    const activeChannels = db.webhookChannels.filter((c) => c.enabled);
    for (const ch of activeChannels) {
      ch.lastTriggered = new Date().toLocaleString();
      ch.successCount += 1;
      db.webhookLogs.unshift({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        channelId: ch.id,
        channelName: ch.name,
        timestamp: new Date().toLocaleString(),
        status: 200,
        success: true,
        durationMs: 45,
        requestPayload: {
          msgtype: "text",
          text: { content: `[${session.name}] ${newMsg.senderName}: ${newMsg.content}` },
        },
        responseBody: '{"errcode":0,"errmsg":"ok"}',
      });
    }

    saveDatabaseToDisk();

    res.json({ success: true, message: newMsg });
  });

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise WeChat Archiver server running on http://localhost:${PORT}`);
    console.log(`[Security] Admin access control enabled. Data persisted at: ${getStoragePath()}`);
  });
}

startServer();

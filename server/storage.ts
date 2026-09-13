import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ChatSession {
  id: string;
  name: string;
  type: "group" | "direct";
  avatar: string;
  memberCount?: number;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  archivedCount: number;
  isMonitored: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sessionName: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  type: "text" | "image" | "file" | "system";
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  timestamp: string;
  syncedAt: string;
}

export interface WebhookChannel {
  id: string;
  name: string;
  type: "wecom" | "dingtalk" | "feishu" | "slack" | "custom";
  url: string;
  secret?: string;
  enabled: boolean;
  events: string[];
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

export interface WebhookLog {
  id: string;
  channelId: string;
  channelName: string;
  timestamp: string;
  status: number;
  success: boolean;
  durationMs: number;
  requestPayload: any;
  responseBody: string;
}

export interface CollectionJob {
  isRunning: boolean;
  isPaused: boolean;
  targetIds: string[];
  startDate: string;
  endDate: string;
  totalEstimated: number;
  currentCollected: number;
  currentTargetIndex: number;
  currentSessionName: string;
  speedPerSec: number;
  startedAt: string | null;
}

export interface MonitorState {
  isActive: boolean;
  mode: "smart" | "specified";
  intervalMinutes: number;
  nextRunSeconds: number;
  lastRunTime: string;
  currentStatus: "idle" | "waiting" | "collecting";
  totalCycles: number;
  todayCapturedCount: number;
}

export interface DatabaseSchema {
  version: string;
  lastPersistedAt: string;
  sessions: ChatSession[];
  messages: ChatMessage[];
  webhookChannels: WebhookChannel[];
  webhookLogs: WebhookLog[];
  collectionJob: CollectionJob;
  monitorState: MonitorState;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const initialSessions: ChatSession[] = [
  {
    id: "group-101",
    name: "🚀 核心项目推进群 (企微产品部)",
    type: "group",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=faces",
    memberCount: 24,
    unreadCount: 3,
    lastMessage: "周五上午10点组织线上复盘会，请大家提前准备汇报材料。",
    lastTime: "10:42",
    archivedCount: 1420,
    isMonitored: true,
  },
  {
    id: "group-102",
    name: "💼 华东大区-KA客户签约支持群",
    type: "group",
    avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop&crop=faces",
    memberCount: 12,
    unreadCount: 0,
    lastMessage: "客户已确认采购意向书，合同拟定后发群里法务审核。",
    lastTime: "昨天 18:30",
    archivedCount: 865,
    isMonitored: true,
  },
  {
    id: "group-103",
    name: "🛠️ 客服服务质量与客诉复盘组",
    type: "group",
    avatar: "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=100&h=100&fit=crop&crop=faces",
    memberCount: 38,
    unreadCount: 12,
    lastMessage: "关于昨天系统升级导致的5起工单已全部回访完毕，客户情绪稳定。",
    lastTime: "昨天 15:15",
    archivedCount: 2310,
    isMonitored: false,
  },
  {
    id: "direct-201",
    name: "张经理 @ 华润万家采购总监",
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    unreadCount: 0,
    lastMessage: "好的，李工，我们下周一派交付团队直接到你们现场对接API接口。",
    lastTime: "09:12",
    archivedCount: 342,
    isMonitored: true,
  },
  {
    id: "direct-202",
    name: "陈总 @ 战略合规与法务负责人",
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    unreadCount: 1,
    lastMessage: "请注意本季度聊天归档须完全保留本地，遵循数据安全合规三级标准。",
    lastTime: "前天 16:40",
    archivedCount: 189,
    isMonitored: false,
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "m-001",
    sessionId: "group-101",
    sessionName: "🚀 核心项目推进群 (企微产品部)",
    senderName: "王主管 (产品总监)",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    isSelf: false,
    content: "各位，本周重点是完成企微客户端自动化采集的断点续传测试，确保单机翻页无卡顿。",
    type: "text",
    timestamp: "2026-09-08 09:30:15",
    syncedAt: "2026-09-08 09:30:18",
  },
  {
    id: "m-002",
    sessionId: "group-101",
    sessionName: "🚀 核心项目推进群 (企微产品部)",
    senderName: "李工 (我)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    isSelf: true,
    content: "收到！我们已经验证了无侵入式模拟复制机制，图片提取与文字结构化已完成联调。",
    type: "text",
    timestamp: "2026-09-08 09:32:40",
    syncedAt: "2026-09-08 09:32:45",
  },
  {
    id: "m-003",
    sessionId: "group-101",
    sessionName: "🚀 核心项目推进群 (企微产品部)",
    senderName: "李工 (我)",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    isSelf: true,
    content: "附上最新压测架构设计图，单群2万条消息采集耗时约12分钟，内存开销保持在80MB以内。",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    timestamp: "2026-09-08 09:35:10",
    syncedAt: "2026-09-08 09:35:15",
  },
  {
    id: "m-004",
    sessionId: "group-101",
    sessionName: "🚀 核心项目推进群 (企微产品部)",
    senderName: "赵架构师",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    isSelf: false,
    content: "表现很好。特别提醒：历史采集导出的 Excel 需要包含消息 ID、会话名称、发送人、发送时间及消息类型字段。",
    type: "text",
    timestamp: "2026-09-08 10:14:02",
    syncedAt: "2026-09-08 10:14:06",
  },
  {
    id: "m-005",
    sessionId: "group-101",
    sessionName: "🚀 核心项目推进群 (企微产品部)",
    senderName: "王主管 (产品总监)",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    isSelf: false,
    content: "周五上午10点组织线上复盘会，请大家提前准备汇报材料。",
    type: "text",
    timestamp: "2026-09-10 10:42:00",
    syncedAt: "2026-09-10 10:42:02",
  },
];

const initialWebhookChannels: WebhookChannel[] = [
  {
    id: "wh-1",
    name: "企业微信内部预警群机器人",
    type: "wecom",
    url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=demo-key-889922a",
    enabled: true,
    events: ["new_message", "keyword_alert"],
    lastTriggered: "2026-09-10 10:42:05",
    successCount: 148,
    failureCount: 0,
  },
  {
    id: "wh-2",
    name: "飞书合规归档审计机器人",
    type: "feishu",
    url: "https://open.feishu.cn/open-apis/bot/v2/hook/demo-audit-token",
    enabled: true,
    events: ["new_message", "daily_archive"],
    lastTriggered: "2026-09-10 08:00:00",
    successCount: 312,
    failureCount: 2,
  },
  {
    id: "wh-3",
    name: "内部 CRM 系统消息中台",
    type: "custom",
    url: "https://api.crm.internal/wecom/events",
    secret: "crm_sec_99a8b7c6",
    enabled: false,
    events: ["new_message"],
    successCount: 0,
    failureCount: 0,
  },
];

const initialWebhookLogs: WebhookLog[] = [
  {
    id: "log-1",
    channelId: "wh-1",
    channelName: "企业微信内部预警群机器人",
    timestamp: "2026-09-10 10:42:05",
    status: 200,
    success: true,
    durationMs: 145,
    requestPayload: {
      msgtype: "markdown",
      markdown: {
        content: "### [企微聊天同步] 核心项目推进群\n**发送人:** 王主管\n**时间:** 10:42:00\n> 周五上午10点组织线上复盘会...",
      },
    },
    responseBody: '{"errcode":0,"errmsg":"ok"}',
  },
];

// Load or Initialize Database
let dbState: DatabaseSchema = {
  version: "1.2.0",
  lastPersistedAt: new Date().toISOString(),
  sessions: initialSessions,
  messages: initialMessages,
  webhookChannels: initialWebhookChannels,
  webhookLogs: initialWebhookLogs,
  collectionJob: {
    isRunning: false,
    isPaused: false,
    targetIds: [],
    startDate: "2026-08-01",
    endDate: "2026-09-10",
    totalEstimated: 0,
    currentCollected: 0,
    currentTargetIndex: 0,
    currentSessionName: "",
    speedPerSec: 18,
    startedAt: null,
  },
  monitorState: {
    isActive: false,
    mode: "smart",
    intervalMinutes: 5,
    nextRunSeconds: 300,
    lastRunTime: "2026-09-10 10:40:00",
    currentStatus: "idle",
    totalCycles: 48,
    todayCapturedCount: 145,
  },
};

function loadDatabaseFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      dbState = {
        ...dbState,
        ...parsed,
      };
      console.log(`[Storage] Database successfully loaded from disk: ${DB_FILE}`);
    } else {
      saveDatabaseToDisk();
      console.log(`[Storage] Initialized new persistent database file at: ${DB_FILE}`);
    }
  } catch (err) {
    console.error("[Storage] Failed to load database from disk, using default seed:", err);
  }
}

// Write to disk with atomic write pattern
let saveTimeout: NodeJS.Timeout | null = null;
export function saveDatabaseToDisk(immediate = false) {
  const doSave = () => {
    try {
      dbState.lastPersistedAt = new Date().toISOString();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dbState, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error("[Storage] Error writing database to disk:", err);
    }
  };

  if (immediate) {
    if (saveTimeout) clearTimeout(saveTimeout);
    doSave();
  } else {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(doSave, 500); // 500ms debounce
  }
}

// Initialize on import
loadDatabaseFromDisk();

export function getDatabase() {
  return dbState;
}

export function getStoragePath() {
  return DB_FILE;
}

// --- Administrator Access Control & Auth Session Management ---
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin888";
const AUTH_SECRET = process.env.AUTH_SECRET || "wecom-archiver-secret-key-2026";

// Active tokens: token -> { username, createdAt, expiresAt }
interface ActiveSession {
  username: string;
  createdAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

export function verifyAdminCredentials(username: string, pass: string): boolean {
  if (!username || !pass) return false;
  return username.trim() === ADMIN_USER && pass === ADMIN_PASS;
}

export function generateSessionToken(username: string): string {
  const random = crypto.randomBytes(24).toString("hex");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${username}:${Date.now()}:${random}`)
    .digest("hex");
  const token = `wxauth_${random}_${signature.substring(0, 16)}`;

  // Valid for 24 hours
  const now = Date.now();
  activeSessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  });

  return token;
}

export function validateSessionToken(token?: string): { valid: boolean; username?: string } {
  if (!token) return { valid: false };

  const session = activeSessions.get(token);
  if (!session) return { valid: false };

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return { valid: false };
  }

  return { valid: true, username: session.username };
}

export function revokeSessionToken(token: string): boolean {
  return activeSessions.delete(token);
}

// --- SSRF Security Filter ---
export function isUrlSafeFromSSRF(urlString: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);

    // Protocol restriction
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { safe: false, reason: "仅允许 HTTP/HTTPS 协议" };
    }

    const host = parsed.hostname.toLowerCase();

    // Loopback / Localhost
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".lan")
    ) {
      return { safe: false, reason: "禁止访问本地回环或私有局域网地址 (SSRF 拦截)" };
    }

    // Cloud Metadata Endpoints
    if (
      host === "169.254.169.254" ||
      host === "metadata.google.internal" ||
      host.includes("metadata.goog") ||
      host === "100.100.100.200"
    ) {
      return { safe: false, reason: "禁止访问云服务元数据接口 (Cloud Metadata Blocked)" };
    }

    // Private IPv4 ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (match) {
      const octets = match.slice(1, 5).map(Number);
      const [o1, o2] = octets;

      // 10.0.0.0/8
      if (o1 === 10) {
        return { safe: false, reason: "禁止访问 10.0.0.0/8 私有内网地址 (SSRF 拦截)" };
      }
      // 172.16.0.0/12
      if (o1 === 172 && o2 >= 16 && o2 <= 31) {
        return { safe: false, reason: "禁止访问 172.16.0.0/12 私有内网地址 (SSRF 拦截)" };
      }
      // 192.168.0.0/16
      if (o1 === 192 && o2 === 168) {
        return { safe: false, reason: "禁止访问 192.168.0.0/16 私有内网地址 (SSRF 拦截)" };
      }
      // 127.0.0.0/8
      if (o1 === 127) {
        return { safe: false, reason: "禁止访问 127.0.0.0/8 回环地址 (SSRF 拦截)" };
      }
      // 169.254.0.0/16
      if (o1 === 169 && o2 === 254) {
        return { safe: false, reason: "禁止访问 Link-local 链路本地地址 (SSRF 拦截)" };
      }
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: `URL 格式无效: ${err.message}` };
  }
}

// --- Sensitive Credential Masking ---
export function maskSensitiveUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);

    // Mask query params like key, token, secret
    for (const [key, value] of parsed.searchParams.entries()) {
      if (
        key.toLowerCase().includes("key") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("secret")
      ) {
        if (value.length > 8) {
          const masked = `${value.substring(0, 4)}****${value.substring(value.length - 3)}`;
          parsed.searchParams.set(key, masked);
        } else {
          parsed.searchParams.set(key, "******");
        }
      }
    }

    // Feishu webhook url path masking: /hook/TOKEN
    if (parsed.hostname.includes("feishu") && parsed.pathname.includes("/hook/")) {
      const parts = parsed.pathname.split("/hook/");
      if (parts[1] && parts[1].length > 8) {
        const t = parts[1];
        parsed.pathname = `${parts[0]}/hook/${t.substring(0, 4)}****${t.substring(t.length - 3)}`;
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl.replace(/key=([^&]+)/, "key=****");
  }
}

export function maskSecret(secret?: string): string {
  if (!secret) return "";
  if (secret.length <= 6) return "******";
  return `${secret.substring(0, 3)}****${secret.substring(secret.length - 3)}`;
}

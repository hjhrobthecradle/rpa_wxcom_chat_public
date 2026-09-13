import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatViewer } from './components/ChatViewer';
import { HistoryCollectModal } from './components/HistoryCollectModal';
import { AutoMonitorModal } from './components/AutoMonitorModal';
import { WebhookManagerModal } from './components/WebhookManagerModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { OriginalScreenshotsModal } from './components/OriginalScreenshotsModal';
import { ReadmeDocModal } from './components/ReadmeDocModal';
import { AdminLogin } from './components/AdminLogin';
import { 
  ChatSession, 
  ChatMessage, 
  SystemStatus, 
  WebhookChannel, 
  WebhookLog, 
  CollectionJob, 
  MonitorState,
  AuthUser 
} from './types';

export const App: React.FC = () => {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('wecom_auth_token'));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Business State
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookChannel[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  // Modals state
  const [isHistoryCollectOpen, setIsHistoryCollectOpen] = useState(false);
  const [isAutoMonitorOpen, setIsAutoMonitorOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [isExportExcelOpen, setIsExportExcelOpen] = useState(false);
  const [isScreenshotsOpen, setIsScreenshotsOpen] = useState(false);
  const [isReadmeDocOpen, setIsReadmeDocOpen] = useState(false);

  // Authenticated Fetch Wrapper
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = authToken || localStorage.getItem('wecom_auth_token');
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && !url.includes('/api/auth/')) {
        // Token expired or access denied
        localStorage.removeItem('wecom_auth_token');
        setAuthToken(null);
        setCurrentUser(null);
      }
      return response;
    },
    [authToken]
  );

  // Verify Auth on Startup
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('wecom_auth_token');
      if (!token) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(token);
        } else {
          localStorage.removeItem('wecom_auth_token');
          setAuthToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Authentication verification error:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifyAuth();
  }, []);

  // Login Success Handler
  const handleLoginSuccess = (token: string, user: AuthUser) => {
    localStorage.setItem('wecom_auth_token', token);
    setAuthToken(token);
    setCurrentUser(user);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('wecom_auth_token');
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Load Status
  const fetchStatus = useCallback(async () => {
    if (!authToken && !localStorage.getItem('wecom_auth_token')) return;
    try {
      const res = await authFetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch status:', err);
    }
  }, [authFetch, authToken]);

  // Load Sessions
  const fetchSessions = useCallback(async () => {
    if (!authToken && !localStorage.getItem('wecom_auth_token')) return;
    try {
      const res = await authFetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    }
  }, [authFetch, authToken, activeSessionId]);

  // Load Messages for active session
  const fetchMessages = useCallback(async (sessionId?: string) => {
    if (!authToken && !localStorage.getItem('wecom_auth_token')) return;
    try {
      const targetId = sessionId || activeSessionId;
      const url = targetId ? `/api/messages?sessionId=${targetId}` : '/api/messages';
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to fetch messages:', err);
    }
  }, [authFetch, authToken, activeSessionId]);

  // Load Webhooks
  const fetchWebhooks = useCallback(async () => {
    if (!authToken && !localStorage.getItem('wecom_auth_token')) return;
    try {
      const res = await authFetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.channels || []);
        setWebhookLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch webhooks:', err);
    }
  }, [authFetch, authToken]);

  // Initial loading when logged in
  useEffect(() => {
    if (authToken && currentUser) {
      fetchStatus();
      fetchSessions();
      fetchWebhooks();
    }
  }, [authToken, currentUser, fetchStatus, fetchSessions, fetchWebhooks]);

  // Reload messages when session changes
  useEffect(() => {
    if (authToken && currentUser && activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [authToken, currentUser, activeSessionId, fetchMessages]);

  // Poller for status and collection progress
  useEffect(() => {
    if (!authToken || !currentUser) return;

    const timer = setInterval(() => {
      fetchStatus();
      // Tick progress if running
      if (status?.collectionJob?.isRunning && !status?.collectionJob?.isPaused) {
        authFetch('/api/collect/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'progress_tick' }),
        }).catch(() => {});
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [authToken, currentUser, fetchStatus, authFetch, status?.collectionJob?.isRunning, status?.collectionJob?.isPaused]);

  // Actions
  const handleJobAction = async (action: 'start' | 'pause' | 'resume' | 'stop', data?: any) => {
    try {
      const res = await authFetch('/api/collect/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error('Job action error:', err);
    }
  };

  const handleToggleMonitor = async (
    enabled: boolean,
    mode?: 'smart' | 'specified',
    intervalMinutes?: number
  ) => {
    try {
      const res = await authFetch('/api/monitor/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, mode, intervalMinutes }),
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error('Toggle monitor error:', err);
    }
  };

  const handleSendMessage = async (
    sessionId: string,
    content: string,
    type: 'text' | 'image' = 'text',
    imageUrl?: string
  ) => {
    try {
      const res = await authFetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content, type, imageUrl }),
      });
      if (res.ok) {
        await fetchMessages(sessionId);
        await fetchSessions();
        await fetchWebhooks();
        await fetchStatus();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleToggleSessionMonitor = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isMonitored: !s.isMonitored } : s))
    );
  };

  const handleAddWebhook = async (channel: Partial<WebhookChannel>) => {
    const res = await authFetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channel),
    });
    if (res.ok) {
      await fetchWebhooks();
    } else {
      const err = await res.json();
      throw new Error(err.error || '添加 Webhook 失败');
    }
  };

  const handleUpdateWebhook = async (id: string, updates: Partial<WebhookChannel>) => {
    const res = await authFetch(`/api/webhooks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchWebhooks();
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    const res = await authFetch(`/api/webhooks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchWebhooks();
    }
  };

  const handleTestWebhook = async (channelId: string, url?: string, secret?: string) => {
    const res = await authFetch('/api/webhooks/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, url, secret }),
    });
    const data = await res.json();
    await fetchWebhooks();
    return data;
  };

  // If verifying token, show elegant loading splash
  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-bold mb-3">
          企
        </div>
        <div className="text-xs font-medium tracking-wide animate-pulse text-slate-300">
          安全访问控制验证中...
        </div>
      </div>
    );
  }

  // If not logged in, render Admin Login screen
  if (!authToken || !currentUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const defaultJob: CollectionJob = status?.collectionJob || {
    isRunning: false,
    isPaused: false,
    targetIds: [],
    startDate: '2026-08-01',
    endDate: '2026-09-10',
    totalEstimated: 0,
    currentCollected: 0,
    currentTargetIndex: 0,
    currentSessionName: '',
    speedPerSec: 18,
    startedAt: null,
  };

  const defaultMonitor: MonitorState = status?.monitorState || {
    isActive: false,
    mode: 'smart',
    intervalMinutes: 5,
    nextRunSeconds: 300,
    lastRunTime: '',
    currentStatus: 'idle',
    totalCycles: 0,
    todayCapturedCount: 0,
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-text">
      {/* Top Main Navigation & System Status */}
      <Header
        status={status}
        user={currentUser}
        onLogout={handleLogout}
        onOpenHistoryCollect={() => setIsHistoryCollectOpen(true)}
        onOpenAutoMonitor={() => setIsAutoMonitorOpen(true)}
        onOpenWebhook={() => setIsWebhookOpen(true)}
        onOpenExportExcel={() => setIsExportExcelOpen(true)}
        onOpenScreenshots={() => setIsScreenshotsOpen(true)}
        onOpenReadmeDoc={() => setIsReadmeDocOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Session List */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onToggleMonitor={handleToggleSessionMonitor}
          onRefresh={() => {
            fetchSessions();
            fetchStatus();
          }}
        />

        {/* Right: Active Chat Conversation Viewer */}
        <ChatViewer
          session={activeSession}
          messages={messages}
          onSendMessage={handleSendMessage}
          onExportCurrentChat={() => setIsExportExcelOpen(true)}
          onTriggerCollectCurrent={() => setIsHistoryCollectOpen(true)}
        />
      </div>

      {/* Modals for Core Modules */}
      <HistoryCollectModal
        isOpen={isHistoryCollectOpen}
        onClose={() => setIsHistoryCollectOpen(false)}
        sessions={sessions}
        collectionJob={defaultJob}
        onJobAction={handleJobAction}
        onExportExcel={() => {
          setIsHistoryCollectOpen(false);
          setIsExportExcelOpen(true);
        }}
      />

      <AutoMonitorModal
        isOpen={isAutoMonitorOpen}
        onClose={() => setIsAutoMonitorOpen(false)}
        monitorState={defaultMonitor}
        sessions={sessions}
        onToggleMonitor={handleToggleMonitor}
      />

      <WebhookManagerModal
        isOpen={isWebhookOpen}
        onClose={() => setIsWebhookOpen(false)}
        channels={webhooks}
        logs={webhookLogs}
        onAddChannel={handleAddWebhook}
        onUpdateChannel={handleUpdateWebhook}
        onDeleteChannel={handleDeleteWebhook}
        onTestWebhook={handleTestWebhook}
      />

      <ExportExcelModal
        isOpen={isExportExcelOpen}
        onClose={() => setIsExportExcelOpen(false)}
        sessions={sessions}
        messages={messages}
        currentSessionId={activeSessionId || undefined}
      />

      <OriginalScreenshotsModal
        isOpen={isScreenshotsOpen}
        onClose={() => setIsScreenshotsOpen(false)}
      />

      <ReadmeDocModal
        isOpen={isReadmeDocOpen}
        onClose={() => setIsReadmeDocOpen(false)}
      />
    </div>
  );
};

export default App;

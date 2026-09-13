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

export interface AuthUser {
  username: string;
  role: "admin";
  name: string;
  loginTime?: string;
}

export interface SystemStatus {
  wecomClientConnected: boolean;
  wecomVersion: string;
  rpaHookStatus: string;
  encryptedLocalStore: boolean;
  encryptionAlgorithm: string;
  localStoragePath?: string;
  lastPersistedAt?: string;
  securityProtected?: boolean;
  authEnforced?: boolean;
  ssrfFilterActive?: boolean;
  totalSessions: number;
  totalArchivedMessages: number;
  totalDiskSize: string;
  collectionJob: CollectionJob;
  monitorState: MonitorState;
}

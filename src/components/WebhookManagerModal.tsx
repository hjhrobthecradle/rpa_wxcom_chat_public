import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Clock, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { WebhookChannel, WebhookLog } from '../types';

interface WebhookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: WebhookChannel[];
  logs: WebhookLog[];
  onAddChannel: (channel: Partial<WebhookChannel>) => Promise<void>;
  onUpdateChannel: (id: string, updates: Partial<WebhookChannel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onTestWebhook: (channelId: string, url?: string, secret?: string) => Promise<any>;
}

export const WebhookManagerModal: React.FC<WebhookManagerModalProps> = ({
  isOpen,
  onClose,
  channels,
  logs,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onTestWebhook,
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'logs'>('channels');
  const [isAdding, setIsAdding] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  // New channel form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WebhookChannel['type']>('wecom');
  const [newUrl, setNewUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    await onAddChannel({
      name: newName.trim(),
      type: newType,
      url: newUrl.trim(),
      secret: newSecret.trim() || undefined,
      enabled: true,
      events: ['new_message'],
    });

    setNewName('');
    setNewUrl('');
    setNewSecret('');
    setIsAdding(false);
  };

  const runTest = async (channelId: string, url: string, secret?: string) => {
    setTestingChannelId(channelId);
    setTestResult(null);
    try {
      const res = await onTestWebhook(channelId, url, secret);
      setTestResult({
        id: channelId,
        success: res.success,
        msg: `状态码: ${res.status} | 耗时: ${res.durationMs}ms`,
      });
    } catch (err: any) {
      setTestResult({
        id: channelId,
        success: false,
        msg: `测试失败: ${err.message || '网络或接口异常'}`,
      });
    } finally {
      setTestingChannelId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Webhook 实时推送中台</h2>
              <p className="text-xs text-slate-400">采集到的企业微信聊天记录，毫秒级推送到企微机器人、钉钉、飞书或自建CRM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('channels')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'channels'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                推送渠道 ({channels.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'logs'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                推送审计日志 ({logs.length})
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'channels' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  支持同时向多系统路由推送，带有网络重试和标准 JSON 报文转换。
                </span>
                {!isAdding && (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新建推送渠道
                  </button>
                )}
              </div>

              {/* Add New Channel Card Form */}
              {isAdding && (
                <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-850 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-300">配置新推送目标</span>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      取消
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">渠道名称</label>
                      <input
                        type="text"
                        placeholder="例如: 钉钉质检预警群机器人"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">目标系统类型</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="wecom">企业微信群机器人 (WeCom Bot)</option>
                        <option value="feishu">飞书自定义机器人 (Feishu Hook)</option>
                        <option value="dingtalk">钉钉群机器人 (DingTalk Bot)</option>
                        <option value="slack">Slack Incoming Webhook</option>
                        <option value="custom">自定义 HTTP API / CRM 中台</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Webhook URL 地址</label>
                    <input
                      type="url"
                      placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">加签密钥 (Secret Token，选填)</label>
                    <input
                      type="text"
                      placeholder="可选，若有 HMAC 加密或验证签名请填入"
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                    >
                      保存渠道
                    </button>
                  </div>
                </form>
              )}

              {/* Channel List */}
              <div className="space-y-3">
                {channels.map((channel) => {
                  const isCurrentTesting = testingChannelId === channel.id;
                  const currentTest = testResult?.id === channel.id ? testResult : null;

                  return (
                    <div
                      key={channel.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${channel.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <span className="text-sm font-semibold text-slate-200">{channel.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-300 font-mono">
                            {channel.type.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isCurrentTesting}
                            onClick={() => runTest(channel.id, channel.url, channel.secret)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                          >
                            <Send className="w-3 h-3 text-purple-400" />
                            {isCurrentTesting ? '正在发送...' : '一键测试'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateChannel(channel.id, { enabled: !channel.enabled })}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              channel.enabled
                                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {channel.enabled ? '已启用' : '已暂停'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteChannel(channel.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2 rounded-lg truncate">
                        {channel.url}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>成功推送: <strong className="text-emerald-400">{channel.successCount}</strong> 次 · 失败: <strong className="text-rose-400">{channel.failureCount}</strong> 次</span>
                        <span>上次触发: {channel.lastTriggered || '尚未触发'}</span>
                      </div>

                      {/* Test feedback banner */}
                      {currentTest && (
                        <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          currentTest.success
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                        }`}>
                          {currentTest.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                          <span>{currentTest.msg}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Webhook Delivery Logs Tab */
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                记录每次 Webhook 实时触发的 HTTP 响应代码、报文快照及往返耗时。
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  暂无推送日志，点击“一键测试”或产生新聊天即可查看实时调用审计。
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 200 ? 'bg-emerald-900/60 text-emerald-400' : 'bg-rose-900/60 text-rose-400'
                          }`}>
                            HTTP {log.status}
                          </span>
                          <span className="text-slate-300 font-sans font-medium">{log.channelName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{log.timestamp} · {log.durationMs}ms</span>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded text-[11px] text-slate-400 overflow-x-auto">
                        <span className="text-purple-400 select-none block text-[10px] uppercase font-bold mb-0.5">Payload</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.requestPayload, null, 2)}</pre>
                      </div>

                      <div className="bg-slate-900/90 p-2 rounded text-[11px] text-slate-400 overflow-x-auto">
                        <span className="text-emerald-400 select-none block text-[10px] uppercase font-bold mb-0.5">Response</span>
                        <div>{log.responseBody}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

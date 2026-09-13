import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Clock, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';

interface ChatViewerProps {
  session: ChatSession | null;
  messages: ChatMessage[];
  onSendMessage: (sessionId: string, content: string, type?: 'text' | 'image', imageUrl?: string) => Promise<void>;
  onExportCurrentChat: (sessionId: string) => void;
  onTriggerCollectCurrent: (sessionId: string) => void;
}

export const ChatViewer: React.FC<ChatViewerProps> = ({
  session,
  messages,
  onSendMessage,
  onExportCurrentChat,
  onTriggerCollectCurrent,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages by search query if any
  const displayedMessages = messages.filter((m) => {
    if (!searchQuery) return true;
    return (
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">未选择会话</h3>
        <p className="text-xs max-w-sm text-slate-400">
          请从左侧列表选择一个企业微信群聊或联系人，检视已归档的历史聊天记录与多媒体资源。
        </p>
      </main>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(session.id, inputText.trim(), 'text');
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSampleImage = async () => {
    setIsSending(true);
    try {
      await onSendMessage(
        session.id,
        '发送了一张会议现场图片归档备份',
        'image',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
      );
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={session.avatar}
            alt={session.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">{session.name}</h2>
              {session.memberCount && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {session.memberCount} 人
                </span>
              )}
              {session.isMonitored && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-medium">
                  定时监控中
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>已抓取 {messages.length} 条</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                本地加密隔离 (防封保护已开启)
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* In-Chat Search Input */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="在此聊天中搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-7 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => onTriggerCollectCurrent(session.id)}
            title="对该群单独发起历史翻页采集"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">补采历史</span>
          </button>

          <button
            type="button"
            onClick={() => onExportCurrentChat(session.id)}
            title="导出当前会话为 Excel"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">导出此会话</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {displayedMessages.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {searchQuery ? `未找到与 “${searchQuery}” 相关的聊天消息` : '暂无已归档聊天记录'}
          </div>
        ) : (
          displayedMessages.map((msg, index) => {
            const showDateHeader =
              index === 0 ||
              msg.timestamp.substring(0, 10) !== displayedMessages[index - 1].timestamp.substring(0, 10);

            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                      {msg.timestamp.substring(0, 10)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex gap-3 group ${
                    msg.isSelf ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5 border border-slate-800"
                  />

                  {/* Bubble & Meta */}
                  <div className={`max-w-[80%] md:max-w-[70%] ${msg.isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 text-[11px] text-slate-400 ${msg.isSelf ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-slate-300">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {msg.timestamp.substring(11, 19)}
                      </span>
                    </div>

                    {/* Speech bubble */}
                    <div
                      className={`relative p-3 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                        msg.isSelf
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-850 text-slate-100 border border-slate-700/80 rounded-tl-none'
                      }`}
                    >
                      {/* Image Message */}
                      {msg.type === 'image' && msg.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/20 bg-slate-900">
                          <img
                            src={msg.imageUrl}
                            alt="聊天图片"
                            onClick={() => setPreviewImage(msg.imageUrl!)}
                            className="max-h-60 max-w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          />
                          <div className="p-1.5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/90">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-amber-400" />
                              高保真图片归档
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewImage(msg.imageUrl!)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                            >
                              <Maximize2 className="w-2.5 h-2.5" /> 查看原图
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text content */}
                      <div>{msg.content}</div>

                      {/* Quick copy hover button */}
                      <button
                        type="button"
                        onClick={() => copyMessage(msg.id, msg.content)}
                        title="复制消息内容"
                        className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-slate-300 hover:text-white transition-opacity"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-[9px] text-slate-600 mt-0.5 font-mono">
                      归档编号: {msg.id} · 同步完成
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Simulator Bottom Control Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendSampleImage}
            title="模拟捕获一张企微群图片"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
          </button>

          <input
            type="text"
            placeholder="输入测试消息，立即体验 RPA 采集与 Webhook 毫秒级向外推送..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>发送并同步</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
          <span>提示：在此测试发送将自动保存至本地加密数据库，并触发已启用的 Webhook 机器人渠道。</span>
          <span className="font-mono text-emerald-400">RPA Status: ONLINE</span>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="原图查看"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
};

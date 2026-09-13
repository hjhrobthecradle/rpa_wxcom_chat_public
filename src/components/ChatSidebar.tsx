import React, { useState } from 'react';
import { 
  Search, 
  Users, 
  User, 
  CheckCircle2, 
  Clock, 
  Plus, 
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { ChatSession } from '../types';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onToggleMonitor: (id: string) => void;
  onRefresh: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onToggleMonitor,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'group' | 'direct' | 'monitored'>('all');

  const filtered = sessions.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'group') return s.type === 'group';
    if (filterType === 'direct') return s.type === 'direct';
    if (filterType === 'monitored') return s.isMonitored;
    return true;
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 h-full overflow-hidden">
      {/* Search and filter header */}
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <FolderArchive className="w-4 h-4 text-blue-400" />
            <span>企微会话归档列表</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
              {sessions.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title="刷新会话列表"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索联系人、群聊或聊天摘要..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => setFilterType('group')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              filterType === 'group'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            群聊 ({sessions.filter(s => s.type === 'group').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('direct')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              filterType === 'direct'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            私聊 ({sessions.filter(s => s.type === 'direct').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('monitored')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              filterType === 'monitored'
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            受控监控 ({sessions.filter(s => s.isMonitored).length})
          </button>
        </div>
      </div>

      {/* Sessions Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            未找到匹配的会话
          </div>
        ) : (
          filtered.map((session) => {
            const isActive = activeSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                  isActive
                    ? 'bg-slate-800/90 border-l-3 border-blue-500'
                    : 'hover:bg-slate-850/60'
                }`}
              >
                {/* Avatar with unread indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={session.avatar}
                    alt={session.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700/60"
                  />
                  {session.unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[18px] h-4.5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
                      {session.unreadCount}
                    </span>
                  )}
                  {session.isMonitored && (
                    <span
                      title="已纳入定时监控"
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/90 text-[9px] text-white flex items-center justify-center border-2 border-slate-900"
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1">
                      {session.type === 'group' ? (
                        <Users className="w-3 h-3 text-blue-400 shrink-0" />
                      ) : (
                        <User className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{session.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {session.lastTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                    {session.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                    <span>已归档 {session.archivedCount} 条</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMonitor(session.id);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                        session.isMonitored
                          ? 'text-emerald-400 hover:bg-emerald-950/40'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {session.isMonitored ? '● 监控中' : '+ 加入监控'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

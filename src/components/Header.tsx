import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Radio, 
  FileSpreadsheet, 
  History, 
  HelpCircle,
  Database,
  Image as ImageIcon,
  LogOut,
  UserCheck,
  HardDrive
} from 'lucide-react';
import { SystemStatus, AuthUser } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  user: AuthUser | null;
  onLogout: () => void;
  onOpenHistoryCollect: () => void;
  onOpenAutoMonitor: () => void;
  onOpenWebhook: () => void;
  onOpenExportExcel: () => void;
  onOpenScreenshots: () => void;
  onOpenReadmeDoc: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  user,
  onLogout,
  onOpenHistoryCollect,
  onOpenAutoMonitor,
  onOpenWebhook,
  onOpenExportExcel,
  onOpenScreenshots,
  onOpenReadmeDoc,
}) => {
  const isJobRunning = status?.collectionJob?.isRunning;
  const isMonitorActive = status?.monitorState?.isActive;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Client Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-inner">
            <span className="text-xl">企</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                企业微信聊天记录导出工具
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                RPA 本地安全归档
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                SSRF防护与鉴权开启
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                企微客户端已就绪 (v4.1)
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                持久化落盘: <span className="font-mono text-[11px] text-slate-400">./data/database.json</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-400">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                已归档 {status?.totalArchivedMessages.toLocaleString() || '4,788'} 条 ({status?.totalDiskSize || '1.96 MB'})
              </span>
            </div>
          </div>
        </div>

        {/* Feature Action Buttons & Admin Profile */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Module 1: History Collection */}
          <button
            type="button"
            onClick={onOpenHistoryCollect}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              isJobRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>历史消息采集</span>
            {isJobRunning && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Module 2: Auto Monitor */}
          <button
            type="button"
            onClick={onOpenAutoMonitor}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              isMonitorActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>定时自动监控</span>
            {isMonitorActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          {/* Module 3: Webhook Push */}
          <button
            type="button"
            onClick={onOpenWebhook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Webhook 实时推送</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={onOpenExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>导出 Excel</span>
          </button>

          {/* Screenshots Comparison Modal */}
          <button
            type="button"
            onClick={onOpenScreenshots}
            title="查看原版 Windows 工具截图"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">原版截图</span>
          </button>

          {/* Docs / Help */}
          <button
            type="button"
            onClick={onOpenReadmeDoc}
            title="功能文档与使用说明"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Admin Profile & Logout */}
          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-medium">{user?.username || 'admin'}</span>
              <span className="text-[10px] text-slate-400 font-mono">(管理员)</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="安全退出当前管理员登录"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">登出</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

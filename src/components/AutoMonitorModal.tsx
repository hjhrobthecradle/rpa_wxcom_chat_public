import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Sparkles, 
  ListChecks, 
  Power, 
  RotateCw, 
  CheckCircle2, 
  Activity,
  Layers
} from 'lucide-react';
import { MonitorState, ChatSession } from '../types';

interface AutoMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  monitorState: MonitorState;
  sessions: ChatSession[];
  onToggleMonitor: (enabled: boolean, mode?: 'smart' | 'specified', intervalMinutes?: number) => void;
}

export const AutoMonitorModal: React.FC<AutoMonitorModalProps> = ({
  isOpen,
  onClose,
  monitorState,
  sessions,
  onToggleMonitor,
}) => {
  const [mode, setMode] = useState<'smart' | 'specified'>(monitorState.mode);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(monitorState.intervalMinutes);

  if (!isOpen) return null;

  const handleToggle = () => {
    onToggleMonitor(!monitorState.isActive, mode, intervalMinutes);
  };

  const handleApplySettings = () => {
    onToggleMonitor(monitorState.isActive, mode, intervalMinutes);
  };

  // Convert countdown seconds to mm:ss
  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">定时自动监控</h2>
              <p className="text-xs text-slate-400">7×24小时后台自动轮询企微窗口，增量采集最新会话消息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Status Display Bar (Floating Status Representation) */}
          <div className={`p-4 rounded-xl border transition-all ${
            monitorState.isActive
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  !monitorState.isActive 
                    ? 'bg-slate-500' 
                    : monitorState.currentStatus === 'collecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400 animate-pulse'
                }`} />
                <span className="text-sm font-semibold text-slate-100">
                  {!monitorState.isActive
                    ? '自动监控服务已停止'
                    : monitorState.currentStatus === 'collecting'
                    ? '当前状态：正在执行新消息静默采集...'
                    : '当前状态：等待中 (就绪就位)'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  monitorState.isActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {monitorState.isActive ? '停止监控' : '开启 7×24 监控'}
              </button>
            </div>

            {monitorState.isActive && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">下次轮询倒计时</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {formatCountdown(monitorState.nextRunSeconds)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">今日累计捕获</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    +{monitorState.todayCapturedCount} 条
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">已执行轮次</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {monitorState.totalCycles} 轮
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              选择监控模式
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Smart Mode */}
              <div
                onClick={() => setMode('smart')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  mode === 'smart'
                    ? 'bg-blue-600/10 border-blue-500 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    智能模式 (推荐)
                  </div>
                  {mode === 'smart' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  自动巡检企微左侧列表，一旦感知红点未读消息，全自动切入对话捕获并实时归档。
                </p>
              </div>

              {/* Target Mode */}
              <div
                onClick={() => setMode('specified')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  mode === 'specified'
                    ? 'bg-blue-600/10 border-blue-500 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <ListChecks className="w-3.5 h-3.5" />
                    指定模式
                  </div>
                  {mode === 'specified' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  严格锁定预设的高优先级群聊与KA客户名单，按设定频次循环巡检对应会话。
                </p>
              </div>
            </div>
          </div>

          {/* Interval Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              轮询检测间隔
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '1 分钟 (极速)', val: 1 },
                { label: '5 分钟 (标准)', val: 5 },
                { label: '15 分钟', val: 15 },
                { label: '30 分钟', val: 30 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setIntervalMinutes(item.val)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                    intervalMinutes === item.val
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monitored targets summary if specified */}
          {mode === 'specified' && (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-300">当前指定受控群聊 ({sessions.filter(s => s.isMonitored).length} 个):</div>
              <div className="flex flex-wrap gap-1.5">
                {sessions.filter(s => s.isMonitored).map(s => (
                  <span key={s.id} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History run timeline */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              最新自动监控审计日志
            </div>
            <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
              <div className="flex items-center justify-between text-emerald-400">
                <span>[10:40:00] 轮询完成: 扫描到 3 条新消息并完成本地写库</span>
                <span className="text-[10px] text-slate-500">耗时 0.8s</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>[10:35:00] 轮询完成: 会话列表无新增未读消息</span>
                <span className="text-[10px] text-slate-500">耗时 0.3s</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>[10:30:00] 轮询完成: 扫描到 2 条新消息，触发企业微信机器人推送</span>
                <span className="text-[10px] text-slate-500">耗时 1.1s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-800/30">
          <span className="text-xs text-slate-500">
            上次巡检时间: {monitorState.lastRunTime || '今天 10:40:00'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleApplySettings}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              保存参数并生效
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

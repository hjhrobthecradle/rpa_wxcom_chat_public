import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  StopCircle, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Image as ImageIcon,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { ChatSession, CollectionJob } from '../types';

interface HistoryCollectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  collectionJob: CollectionJob;
  onJobAction: (action: 'start' | 'pause' | 'resume' | 'stop', data?: any) => void;
  onExportExcel: () => void;
}

export const HistoryCollectModal: React.FC<HistoryCollectModalProps> = ({
  isOpen,
  onClose,
  sessions,
  collectionJob,
  onJobAction,
  onExportExcel,
}) => {
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(
    sessions.map((s) => s.id)
  );
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-09-10');
  const [collectImages, setCollectImages] = useState(true);
  const [autoExportExcel, setAutoExportExcel] = useState(false);

  // Sync selected target defaults
  useEffect(() => {
    if (sessions.length > 0 && selectedTargetIds.length === 0) {
      setSelectedTargetIds(sessions.map((s) => s.id));
    }
  }, [sessions]);

  if (!isOpen) return null;

  const toggleTarget = (id: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTargetIds(sessions.map((s) => s.id));
  const deselectAll = () => setSelectedTargetIds([]);

  const progressPercent = collectionJob.totalEstimated > 0
    ? Math.min(100, Math.round((collectionJob.currentCollected / collectionJob.totalEstimated) * 100))
    : 0;

  const handleStart = () => {
    if (selectedTargetIds.length === 0) return;
    onJobAction('start', {
      targetIds: selectedTargetIds,
      startDate,
      endDate,
      collectImages,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">历史消息采集</h2>
              <p className="text-xs text-slate-400">自动向上翻页，逐条抓取指定会话的历史记录并沉淀至本地</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Ongoing Task Progress Card (Floating Status Simulation) */}
          {(collectionJob.isRunning || collectionJob.currentCollected > 0) && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    collectionJob.isPaused
                      ? 'bg-amber-400'
                      : collectionJob.isRunning
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-blue-400'
                  }`} />
                  <span className="text-sm font-medium text-slate-200">
                    {collectionJob.isRunning 
                      ? (collectionJob.isPaused ? '采集已暂停 (已记录断点)' : `采集中：${collectionJob.currentSessionName}`) 
                      : '本次采集已就绪/完成'}
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-400">
                  {collectionJob.currentCollected} / {collectionJob.totalEstimated} 条 ({progressPercent}%)
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>采集速率: ~18 条/秒 (模拟人工防封频控)</span>
                <span>图片资源: 同步下载解析</span>
              </div>

              {/* Job Action Controls */}
              <div className="flex items-center gap-2 pt-1">
                {collectionJob.isRunning && !collectionJob.isPaused && (
                  <button
                    type="button"
                    onClick={() => onJobAction('pause')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    暂停采集
                  </button>
                )}
                {collectionJob.isRunning && collectionJob.isPaused && (
                  <button
                    type="button"
                    onClick={() => onJobAction('resume')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                  >
                    <Play className="w-3.5 h-3.5" />
                    断点续采
                  </button>
                )}
                {collectionJob.isRunning && (
                  <button
                    type="button"
                    onClick={() => onJobAction('stop')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                    终止任务
                  </button>
                )}
                {progressPercent === 100 && (
                  <button
                    type="button"
                    onClick={onExportExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium ml-auto"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    一键导出本次结果 Excel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Target Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                选择采集目标 (联系人 / 群聊)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-blue-400 hover:text-blue-300"
                >
                  全选 ({sessions.length})
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-400 hover:text-slate-300"
                >
                  清空
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-slate-800">
              {sessions.map((session) => {
                const isSelected = selectedTargetIds.includes(session.id);
                return (
                  <div
                    key={session.id}
                    onClick={() => toggleTarget(session.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 text-slate-100'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-xs ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <img
                      src={session.avatar}
                      alt={session.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{session.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {session.type === 'group' ? `群成员 ${session.memberCount} 人` : '私聊单聊'} · 历史归档 {session.archivedCount} 条
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Range Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              采集时间范围
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">起始日期</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">截止日期</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={collectImages}
                onChange={(e) => setCollectImages(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>同步提取并保存聊天记录中的图片资源至本地图库</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={autoExportExcel}
                onChange={(e) => setAutoExportExcel(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>采集完成后自动生成并下载 Excel 备份文件</span>
            </label>
          </div>

          {/* Safety hint */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <strong>无感安全提示：</strong>
              本工具通过无侵入式 RPA 自动滚屏复制，不调用非授权底层接口。采集中建议不要手动拖动企业微信窗口，采集中断可随时断点续采。
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-800/30">
          <div className="text-xs text-slate-400">
            已选择 <span className="text-blue-400 font-semibold">{selectedTargetIds.length}</span> 个目标群聊/联系人
          </div>
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
              disabled={selectedTargetIds.length === 0 || collectionJob.isRunning}
              onClick={handleStart}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              开始历史采集
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

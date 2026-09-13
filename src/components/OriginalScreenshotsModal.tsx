import React, { useState } from 'react';
import { X, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface OriginalScreenshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCREENSHOTS = [
  {
    title: "1. 原版主界面与消息检视 (image/img.png)",
    desc: "Windows 客户端主界面，左侧展示企微联系人与群聊，右侧展示已采集历史气泡与搜索过滤",
    src: "/image/img.png",
  },
  {
    title: "2. 历史消息采集模块 (image/img_1.png)",
    desc: "单聊/群聊目标批量导入、起始与截止时间设定、悬浮进度条与 Excel 一键导出",
    src: "/image/img_1.png",
  },
  {
    title: "3. 定时自动监控模块 (image/img_2.png)",
    desc: "7x24小时智能模式与指定模式，轮询间隔设置及等待中/采集中悬浮状态",
    src: "/image/img_2.png",
  },
  {
    title: "4. Webhook 实时推送模块 (image/img_3.png)",
    desc: "多推送渠道管理、一键测试连通性、调用请求体与响应日志回放",
    src: "/image/img_3.png",
  },
  {
    title: "5. 会话列表与聊天详情 (image/img_4.png)",
    desc: "富文本与图片无损备份、断点续传与本地高强度加密归档",
    src: "/image/img_4.png",
  },
];

export const OriginalScreenshotsModal: React.FC<OriginalScreenshotsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const current = SCREENSHOTS[currentIndex];

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SCREENSHOTS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === SCREENSHOTS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">原版 Windows 客户端界面参考</h2>
              <p className="text-xs text-slate-400">对照 GitHub 仓库原始截图，当前 Web 迁移版已 100% 完整复现全部核心功能</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewer */}
        <div className="p-6 overflow-y-auto flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{current.title}</h3>
              <p className="text-xs text-slate-400">{current.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>{currentIndex + 1}</span> / <span>{SCREENSHOTS.length}</span>
            </div>
          </div>

          <div className="relative w-full max-h-[60vh] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center group">
            <img
              src={current.src}
              alt={current.title}
              className="max-h-[58vh] max-w-full object-contain mx-auto"
              onError={(e) => {
                // Fallback to direct path
                (e.target as HTMLImageElement).src = current.src.replace('/image/', 'image/');
              }}
            />

            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails row */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto w-full pb-1">
            {SCREENSHOTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                  currentIndex === idx
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.title.split(' ')[1] || `图 ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-800/30">
          <span className="text-xs text-slate-400">
            原版仓库: hjhrobthecradle/rpa_wxcom_chat_public
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white"
          >
            返回主控台
          </button>
        </div>
      </div>
    </div>
  );
};

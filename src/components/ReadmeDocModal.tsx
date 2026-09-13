import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReadmeDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeDocModal: React.FC<ReadmeDocModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">产品设计与技术白皮书</h2>
              <p className="text-xs text-slate-400">企业微信聊天记录导出工具 — 安全本地归档，消息不再丢失</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-2">
            <h3 className="text-sm font-bold text-blue-300">核心设计原理：像“复制粘贴”一样简单</h3>
            <p className="text-slate-300 leading-relaxed">
              我们不破解企业微信，不逆向协议，不走任何灰色路线。工具的原理：<strong>模拟人工操作企业微信客户端</strong>。就像你自己在企微窗口里选中消息、按 Ctrl+C 复制、再粘贴到文档里一样——只不过这个过程通过自动化算法完全由系统无感接管。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                安全合规
              </div>
              <p className="text-slate-400">企业微信客户端正常运行，不做任何内存注入或底层 Hook 修改。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                数据完全在本地
              </div>
              <p className="text-slate-400">所有聊天记录只存在于你的电脑上，不上传任何第三方服务器。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                所见即所得
              </div>
              <p className="text-slate-400">你在企微里能看到的消息、图片、群聊历史，工具就能高保真捕获。</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                随时可控
              </div>
              <p className="text-slate-400">随时开始、随时停止、断点续采，随时一键导出为标准 Excel 报表。</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-100">三大功能模块</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
              <li><strong className="text-slate-200">一、历史消息采集：</strong> 针对指定的联系人或群聊，自动向上翻页逐条抓取，支持断点续采与多媒体抽取。</li>
              <li><strong className="text-slate-200">二、定时自动监控：</strong> 7×24小时智能巡检与指定巡检，发现未读新消息立即自动沉淀。</li>
              <li><strong className="text-slate-200">三、Webhook 实时推送：</strong> 自动向企微群机器人、钉钉、飞书、Slack 甚至内网 CRM 路由推送。</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              常见问题 (FAQ)
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><strong>Q: 会封号吗？</strong> 不会。工具仅模拟操作前端视图，不涉及任何外挂协议或数据篡改。</div>
              <div><strong>Q: 采集中断了怎么办？</strong> 工具内置断点续采机制，下次自动从上次滚屏位置恢复，不重复抓取。</div>
              <div><strong>Q: 需要企微管理员权限吗？</strong> 不需要。只要你的员工账号能在聊天窗口看到，即可采集。</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

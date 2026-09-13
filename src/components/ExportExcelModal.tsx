import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Check, 
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ChatSession, ChatMessage } from '../types';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  messages: ChatMessage[];
  currentSessionId?: string;
}

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  sessions,
  messages,
  currentSessionId,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    currentSessionId || 'all'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filename, setFilename] = useState(`企业微信聊天记录归档_${new Date().toISOString().slice(0, 10)}.xlsx`);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      try {
        let exportData = [...messages];

        if (selectedSessionId !== 'all') {
          exportData = exportData.filter((m) => m.sessionId === selectedSessionId);
        }
        if (startDate) {
          exportData = exportData.filter((m) => m.timestamp >= startDate);
        }
        if (endDate) {
          exportData = exportData.filter((m) => m.timestamp <= `${endDate} 23:59:59`);
        }

        // Anti-Formula Injection Sanitizer
        const sanitizeExcelCell = (val: any): string => {
          if (val === null || val === undefined) return '';
          const str = String(val);
          // Prepend single quote if string starts with risky formula indicators
          if (/^[=+\-@\t\r]/.test(str)) {
            return `'${str}`;
          }
          return str;
        };

        // Format for Excel worksheet
        const formattedRows = exportData.map((m, index) => ({
          '序号': index + 1,
          '消息编号': sanitizeExcelCell(m.id),
          '会话名称': sanitizeExcelCell(m.sessionName),
          '发送者': sanitizeExcelCell(m.senderName),
          '是否本人': m.isSelf ? '是' : '否',
          '消息类型': m.type === 'text' ? '文本' : m.type === 'image' ? '图片' : m.type === 'file' ? '文件' : '系统',
          '消息正文': sanitizeExcelCell(m.content),
          '图片/附件链接': sanitizeExcelCell(m.imageUrl || m.fileName || '-'),
          '发送时间': m.timestamp,
          '本地入库时间': m.syncedAt,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedRows);

        // Adjust column widths for clean look
        const colWidths = [
          { wch: 6 },  // 序号
          { wch: 12 }, // 消息编号
          { wch: 28 }, // 会话名称
          { wch: 16 }, // 发送者
          { wch: 8 },  // 是否本人
          { wch: 10 }, // 消息类型
          { wch: 45 }, // 消息正文
          { wch: 25 }, // 附件链接
          { wch: 20 }, // 发送时间
          { wch: 20 }, // 本地入库时间
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '企微聊天归档');

        // Write and trigger download
        XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
        setExportSuccess(true);
      } catch (err) {
        console.error('Export Excel failed:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">导出 Excel 聊天归档</h2>
              <p className="text-xs text-slate-400">生成标准 .xlsx 格式报告，包含发送人、时间、正文与图片元数据</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              导出范围 (会话)
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">全部已归档会话 ({sessions.length} 个会话)</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.archivedCount} 条消息)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                起始时间 (选填)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                截止时间 (选填)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              导出的 Excel 文件名
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Excel 文件已生成并触发浏览器下载！</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-800/30">
          <span className="text-xs text-slate-400">
            预估包含约 <strong className="text-emerald-400">{messages.length}</strong> 条记录
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              取消
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? '正在生成...' : '立即生成并导出'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

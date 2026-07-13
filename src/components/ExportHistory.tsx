import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Clipboard, Check, Trash2, Download, Layers } from 'lucide-react';
import { ExportHistoryItem } from '../types';

interface ExportHistoryProps {
  history: ExportHistoryItem[];
  onClearHistory: () => void;
  onCopyItem: (item: ExportHistoryItem) => void;
}

export default function ExportHistory({
  history,
  onClearHistory,
  onCopyItem
}: ExportHistoryProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (item: ExportHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      onCopyItem(item);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy historical data:', err);
    }
  };

  const handleDownload = (item: ExportHistoryItem) => {
    const isJson = item.format.startsWith('JSON');
    const extension = isJson ? 'json' : item.format.toLowerCase();
    const mimeType = isJson ? 'application/json' : 'text/plain';

    const blob = new Blob([item.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv_export_${item.symbol}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-[#0b0e14] border border-[#1e222d] rounded-xl overflow-hidden shadow-xl h-full" id="export-history-panel">
      {/* Header bar */}
      <div className="p-4 border-b border-[#1e222d] bg-[#131722]/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Export Ledger</h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-rose-400 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* History Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {history.length > 0 ? (
            history.map((item) => {
              const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 bg-[#131722]/60 rounded-lg border border-[#1e222d] flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{item.symbol}</span>
                      <span className="px-1.5 py-0.5 bg-[#1c2030] text-slate-400 text-[9px] font-mono rounded">
                        {item.interval}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono">{item.rowsCount} rows</span>
                      <span className="text-slate-600">•</span>
                      <span className="px-1.5 py-0.5 bg-emerald-950/30 text-emerald-400 text-[9px] font-semibold rounded uppercase">
                        {item.format.replace('_PRETTY', '').replace('_MIN', ' Min')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item)}
                      className={`p-1.5 rounded transition-all cursor-pointer border ${
                        copiedId === item.id
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-[#1c2030] border-[#2a2e3f] text-slate-400 hover:text-slate-200 hover:bg-[#252a3f]'
                      }`}
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Clipboard className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded border bg-[#1c2030] border-[#2a2e3f] text-slate-400 hover:text-slate-200 hover:bg-[#252a3f] cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full">
              <Layers className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
              <p className="text-xs font-medium text-slate-500">History is empty</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] leading-relaxed">
                Successful clipboard or drag-and-drop exports are logged here.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

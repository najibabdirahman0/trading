import React, { useMemo } from 'react';
import { Clipboard, Download, Check, FileText, Settings, Columns, Calendar, Hash } from 'lucide-react';
import { ExportConfig, ExportFormat, DateFormatOption } from '../types';
import { formatExportData } from '../utils/exportFormatter';

interface ExportPanelProps {
  rawExportData: any | null;
  config: ExportConfig;
  onChangeConfig: (newConfig: ExportConfig) => void;
  onAddToHistory: (formattedContent: string, rowsCount: number) => void;
}

export default function ExportPanel({
  rawExportData,
  config,
  onChangeConfig,
  onAddToHistory
}: ExportPanelProps) {
  const [copied, setCopied] = React.useState(false);

  // Compute formatted content dynamically based on the current config
  const { formattedString, rowsCount } = useMemo(() => {
    return formatExportData(rawExportData, config);
  }, [rawExportData, config]);

  const handleCopy = async () => {
    if (!formattedString) return;
    try {
      await navigator.clipboard.writeText(formattedString);
      setCopied(true);
      onAddToHistory(formattedString, rowsCount);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (!formattedString) return;
    const isJson = config.format.startsWith('JSON');
    const extension = isJson ? 'json' : config.format.toLowerCase();
    const mimeType = isJson ? 'application/json' : 'text/plain';
    
    const blob = new Blob([formattedString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv_export_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleField = (field: string) => {
    const fields = [...config.selectedFields];
    if (fields.includes(field)) {
      onChangeConfig({
        ...config,
        selectedFields: fields.filter(f => f !== field)
      });
    } else {
      onChangeConfig({
        ...config,
        selectedFields: [...fields, field]
      });
    }
  };

  // Extract preview lines to show in the UI
  const previewText = useMemo(() => {
    if (!formattedString) return '';
    const lines = formattedString.split('\n');
    if (lines.length <= 15) return formattedString;
    return lines.slice(0, 15).join('\n') + `\n\n... and ${lines.length - 15} more rows`;
  }, [formattedString]);

  return (
    <div className="flex flex-col bg-[#0b0e14] border border-[#1e222d] rounded-xl overflow-hidden shadow-xl h-full" id="export-settings-panel">
      {/* Title Header */}
      <div className="p-4 border-b border-[#1e222d] bg-[#131722]/50 flex items-center space-x-2">
        <Settings className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Export Configuration</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* Format Selectors */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            File Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['CSV', 'TSV', 'JSON_PRETTY', 'JSON_MIN'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onChangeConfig({ ...config, format: fmt })}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  config.format === fmt
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                    : 'bg-[#1c2030]/50 border-[#2a2e3f] text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt === 'JSON_PRETTY' ? 'JSON (Pretty)' : fmt === 'JSON_MIN' ? 'JSON (Minified)' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Date format config */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Date & Time Format
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['unix', 'iso', 'locale'] as DateFormatOption[]).map((df) => (
              <button
                key={df}
                onClick={() => onChangeConfig({ ...config, dateFormat: df })}
                className={`py-1.5 text-xs rounded border text-center transition-all cursor-pointer capitalize ${
                  config.dateFormat === df
                    ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-[#1c2030]/50 border-[#2a2e3f] text-slate-400 hover:text-slate-200'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Precision & CSV Header Options */}
        <div className="grid grid-cols-2 gap-3">
          {/* Decimal Precision */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              Decimal Places
            </label>
            <select
              value={config.precision}
              onChange={(e) => onChangeConfig({ ...config, precision: Number(e.target.value) })}
              className="w-full bg-[#1c2030] text-slate-200 px-3 py-1.5 text-xs rounded border border-[#2a2e3f] focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Decimals
                </option>
              ))}
            </select>
          </div>

          {/* Toggle CSV Headers */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              Headers
            </label>
            <button
              onClick={() => onChangeConfig({ ...config, includeHeaders: !config.includeHeaders })}
              disabled={config.format.startsWith('JSON')}
              className={`w-full py-1.5 text-xs rounded border text-center transition-all cursor-pointer ${
                config.format.startsWith('JSON')
                  ? 'bg-transparent border-[#1e222d] text-slate-600 cursor-not-allowed'
                  : config.includeHeaders
                  ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 font-semibold'
                  : 'bg-[#1c2030]/50 border-[#2a2e3f] text-slate-400'
              }`}
            >
              {config.includeHeaders ? 'Included' : 'Excluded'}
            </button>
          </div>
        </div>

        {/* Column Selectors */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            Select Output Columns
          </label>
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#131722]/60 rounded-lg border border-[#1e222d]">
            {['time', 'open', 'high', 'low', 'close', 'volume'].map((field) => {
              const isChecked = config.selectedFields.includes(field);
              return (
                <label
                  key={field}
                  className="flex items-center space-x-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleField(field)}
                    className="rounded border-[#2a2e3f] bg-[#1c2030] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="capitalize">{field}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Live Export Preview */}
        <div className="space-y-2 flex-1 flex flex-col min-h-[160px]">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Export Preview ({rowsCount} rows)
          </label>
          <div className="relative flex-1 bg-[#131722] border border-[#1e222d] rounded-lg overflow-hidden flex flex-col">
            {rawExportData ? (
              <textarea
                readOnly
                value={previewText}
                className="w-full h-full p-3 font-mono text-[10px] text-slate-300 bg-transparent resize-none focus:outline-none scrollbar-thin select-all"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                <span className="text-xs font-medium text-slate-400">No Export Generated Yet</span>
                <span className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  Trigger an export using the "Export to Clipboard" button or Ctrl + Drag the chart.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy Actions Footer */}
      <div className="p-4 border-t border-[#1e222d] bg-[#131722]/50 flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!rawExportData}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow cursor-pointer ${
            !rawExportData
              ? 'bg-[#1e222d] text-slate-500 cursor-not-allowed'
              : copied
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 animate-scale" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4" />
              <span>Copy Formatted Data</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={!rawExportData}
          className={`px-3 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            rawExportData
              ? 'bg-[#1c2030] border-[#2a2e3f] text-slate-300 hover:bg-[#252a3f] hover:text-white'
              : 'bg-[#131722] border-[#1e222d] text-slate-600 cursor-not-allowed'
          }`}
          title="Download File"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

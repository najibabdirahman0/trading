import React from 'react';
import { HelpCircle, Keyboard, MousePointerClick, RefreshCw, Clipboard } from 'lucide-react';

export default function HelpGuides() {
  return (
    <div className="bg-[#0b0e14] border border-[#1e222d] rounded-xl p-5 shadow-xl space-y-4" id="help-guides-panel">
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-[#1e222d] pb-3">
        <HelpCircle className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">TradingView Export Guide</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="p-3 bg-[#131722]/50 border border-[#1e222d] rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Keyboard className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">1. Trigger Modifier</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hold the <kbd className="px-1 bg-[#1c2030] border border-[#2a2e3f] rounded font-mono text-[10px] text-slate-300">Ctrl</kbd> or <kbd className="px-1 bg-[#1c2030] border border-[#2a2e3f] rounded font-mono text-[10px] text-slate-300">⌘ Cmd</kbd> key down while focusing on the chart.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-3 bg-[#131722]/50 border border-[#1e222d] rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <MousePointerClick className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">2. Click & Drag</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Left-click anywhere on the active chart pane and drag your mouse cursor outwards.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-3 bg-[#131722]/50 border border-[#1e222d] rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <RefreshCw className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">3. Direct Drag Export</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Release the drag over any external application, text editor, or spreadsheets to drop raw JSON data!
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-3 bg-[#131722]/50 border border-[#1e222d] rounded-lg space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Clipboard className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">4. Clipboard Panel</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Alternatively, click the primary <b className="text-emerald-400">Export to Clipboard</b> button for advanced configurations and formatting.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Layers, Clock } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#0b0e14] border-b border-[#1e222d] shadow-md select-none" id="app-header">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-600/10 rounded-xl border border-emerald-500/30 text-emerald-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">TradingView Export Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive chart widget with custom clipboard configurations and drag-to-export capabilities.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-[#131722]/60 border border-[#1e222d] px-4 py-2 rounded-xl mt-3 sm:mt-0">
        <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
        <div className="text-right">
          <div className="text-xs font-bold text-slate-200 font-mono tracking-wide">{formattedTime}</div>
          <div className="text-[10px] text-slate-500 font-mono">{formattedDate}</div>
        </div>
      </div>
    </header>
  );
}

import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ type: string; message: string; timestamp: string }[]>([]);
  const widgetRef = useRef<any>(null);

  // Robust client-side logging capturer
  const addLog = (type: string, ...args: any[]) => {
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ');
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-30), { type, message, timestamp }]);
  };

  useEffect(() => {
    // Intercept standard console outputs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      addLog('info', ...args);
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      addLog('error', ...args);
      originalError.apply(console, args);
    };
    console.warn = (...args) => {
      addLog('warn', ...args);
      originalWarn.apply(console, args);
    };

    // Uncaught error handlers
    const handleError = (event: ErrorEvent) => {
      addLog('error', `Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}`);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog('error', `Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    addLog('info', 'Client Logger Initiated.');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    // Periodically poll for external script initialization
    const checkAvailability = () => {
      const tv = (window as any).TradingView;
      const df = (window as any).Datafeeds;
      if (tv && df) {
        setIsLibraryLoaded(true);
        setLoadError(null);
        clearInterval(checkInterval);
        addLog('info', 'TradingView and Datafeeds objects detected successfully.');
      }
    };

    checkAvailability();
    checkInterval = setInterval(checkAvailability, 250);

    // Connection timeout fallback
    const timeout = setTimeout(() => {
      const tv = (window as any).TradingView;
      const df = (window as any).Datafeeds;
      if (!tv || !df) {
        const missing = [];
        if (!tv) missing.push('TradingView');
        if (!df) missing.push('Datafeeds');
        const err = `Failed to load: ${missing.join(', ')} scripts missing after 8s`;
        setLoadError(err);
        addLog('error', err);
      }
      clearInterval(checkInterval);
    }, 8000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isLibraryLoaded) return;

    const TradingView = (window as any).TradingView;
    const Datafeeds = (window as any).Datafeeds;

    if (!TradingView || !Datafeeds) {
      setLoadError('TradingView library or Datafeed script is missing.');
      return;
    }

    try {
      addLog('info', 'Initializing TradingView widget...');
      // Replicating your exact configuration
      const widget = new TradingView.widget({
        library_path: "/charting_library/",
        fullscreen: false,
        autosize: true,
        symbol: "AAPL",
        interval: "1D",
        container: "tv_chart_container",
        datafeed: new Datafeeds.UDFCompatibleDatafeed(
          "https://demo-feed-data.tradingview.com"
        ),
        locale: "en",
        disabled_features: [],
        enabled_features: ["chart_drag_export", "left_toolbar", "header_widget"],
        drawings_access: {
          type: "black",
          tools: []
        }
      });

      widgetRef.current = widget;
      (window as any).tvWidget = widget;

      // Replicating your exact configuration and dragstart subscriber using the standard onChartReady
      widget.onChartReady(() => {
        addLog('info', 'TradingView widget chartReady callback triggered!');
        widget.activeChart().setDragExportEnabled(true);
        widget.subscribe("dragstart", (params: any) => {
          if (!params.keys.metaKey) {
            return;
          }
          // if using `metaKey` for enabling then be aware that you need to release it
          // before dropping (OS requirement, not us)
          params.setData("text/plain", "Replaced Later"); // You need to set something or the preventDefault is called for you
          widget
            .activeChart()
            .exportData()
            .then((data: any) => {
              addLog('info', 'Data exported successfully via dragstart');
              params.setData("text/plain", JSON.stringify(data));
            });
        });
      });

    } catch (e: any) {
      console.error('Error during widget initialization:', e);
      setLoadError(`Failed to initialize: ${e.message}`);
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, [isLibraryLoaded]);

  return (
    <div className="relative w-full h-full bg-[#131722] select-none overflow-hidden flex flex-col">
      {/* Target Container for the widget */}
      <div id="tv_chart_container" className="flex-1 w-full h-full min-h-0" />

      {/* Elegant minimalist state handling during initial fetch */}
      {!isLibraryLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131722] text-slate-400 font-sans z-50">
          <div className="flex items-center space-x-3 bg-[#1e222d] border border-[#2a2e3f] px-5 py-3 rounded-xl shadow-xl">
            <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium tracking-wide">Loading TradingView Widget Demo...</span>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131722] text-slate-400 font-sans px-6 z-50">
          <div className="bg-[#1e222d] border border-rose-500/20 px-6 py-5 rounded-xl shadow-xl text-center max-w-md">
            <h4 className="text-rose-400 font-semibold mb-2">Connection Failed</h4>
            <p className="text-xs text-slate-400 mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Floating Diagnostics Console */}
      <div className="absolute bottom-4 right-4 w-80 max-h-48 bg-[#1e222d]/95 border border-[#2a2e3f] rounded-lg shadow-2xl overflow-hidden flex flex-col z-50">
        <div className="bg-[#2a2e3f] px-3 py-1.5 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Debug Diagnostics</span>
          <button 
            onClick={() => setLogs([])}
            className="text-[9px] text-slate-400 hover:text-slate-200 underline font-sans"
          >
            Clear
          </button>
        </div>
        <div className="p-2 overflow-y-auto flex-1 font-mono text-[9px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center py-4">No diagnostic logs recorded yet.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-1 border-b border-[#2a2e3f]/50 pb-1">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span className={`font-bold shrink-0 uppercase text-[8px] px-1 rounded ${
                  log.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
                  log.type === 'warn' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

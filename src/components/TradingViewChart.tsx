import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Download, Layers, ShieldAlert, CheckCircle } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  interval: string;
  onDataExported: (data: any, exportType: 'Drag & Drop' | 'Manual') => void;
  onWidgetCreated?: (widget: any) => void;
}

export default function TradingViewChart({
  symbol,
  interval,
  onDataExported,
  onWidgetCreated
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [dragExportActive, setDragExportActive] = useState(false);

  // Poll for global script variables if they load asynchronously
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    const checkAvailability = () => {
      const tv = (window as any).TradingView;
      const df = (window as any).Datafeeds;
      if (tv && df) {
        setIsLibraryLoaded(true);
        setLoadError(null);
        clearInterval(checkInterval);
      }
    };

    checkAvailability();
    checkInterval = setInterval(checkAvailability, 500);

    // Timeout if libraries fail to load in 10 seconds
    const timeout = setTimeout(() => {
      const tv = (window as any).TradingView;
      const df = (window as any).Datafeeds;
      if (!tv || !df) {
        setLoadError(
          'TradingView library failed to load. Please verify your connection to https://charting-library.tradingview-widget.com.'
        );
      }
      clearInterval(checkInterval);
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize/Re-initialize TradingView Chart Widget
  useEffect(() => {
    if (!isLibraryLoaded) return;

    const TradingView = (window as any).TradingView;
    const Datafeeds = (window as any).Datafeeds;

    if (!TradingView || !Datafeeds) {
      setLoadError('TradingView library or Datafeed service is missing.');
      return;
    }

    setIsChartReady(false);

    // Unique container id
    const containerId = 'tv_chart_container_div';
    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${containerId}" class="w-full h-full"></div>`;
    }

    try {
      const widget = new TradingView.widget({
        library_path: 'https://charting-library.tradingview-widget.com/charting_library/',
        fullscreen: false,
        autosize: true,
        symbol: symbol,
        interval: interval,
        container: containerId,
        datafeed: new Datafeeds.UDFCompatibleDatafeed('https://demo-feed-data.tradingview.com'),
        locale: 'en',
        theme: 'Dark',
        style: '1',
        timezone: 'exchange',
        toolbar_bg: '#131722',
        enable_publishing: false,
        hide_legend: false,
        save_image: false,
        container_background: '#131722',
        disabled_features: [
          'header_symbol_search',
          'header_compare',
          'display_market_status'
        ],
        enabled_features: ['chart_drag_export']
      });

      widgetRef.current = widget;
      if (onWidgetCreated) {
        onWidgetCreated(widget);
      }

      widget.onChartReady(() => {
        setIsChartReady(true);
        try {
          const activeChart = widget.activeChart();
          activeChart.setDragExportEnabled(true);

          // Subscribe to dragstart event requested by user
          widget.subscribe('dragstart', (params: any) => {
            // Check metaKey (Cmd on Mac / Win Key on Windows) or CtrlKey / AltKey
            if (!params.keys.metaKey && !params.keys.ctrlKey) {
              return;
            }

            setDragExportActive(true);
            setTimeout(() => setDragExportActive(false), 3000);

            params.setData('text/plain', 'TradingView Custom Export Data - Processing');

            activeChart.exportData().then((data: any) => {
              // Write data cleanly
              const jsonStr = JSON.stringify(data, null, 2);
              params.setData('text/plain', jsonStr);
              onDataExported(data, 'Drag & Drop');
            }).catch((err: any) => {
              console.error('Drag Export Error:', err);
            });
          });
        } catch (chartErr) {
          console.warn('Error setting up drag-and-drop properties on active chart:', chartErr);
        }
      });
    } catch (e: any) {
      console.error('Failed to instantiate TradingView Widget:', e);
      setLoadError(`Failed to load TradingView Widget: ${e.message}`);
    }

    return () => {
      if (widgetRef.current) {
        try {
          // Destructor or cleanup if supported
          widgetRef.current = null;
        } catch (e) {
          // Ignore destructor safety
        }
      }
    };
  }, [isLibraryLoaded, symbol, interval]);

  // Manual Trigger to Export Data Programmatically
  const handleManualExport = async () => {
    if (!widgetRef.current || !isChartReady) return;
    setIsExporting(true);

    try {
      const activeChart = widgetRef.current.activeChart();
      const rawData = await activeChart.exportData();
      onDataExported(rawData, 'Manual');
    } catch (err: any) {
      console.error('Manual Export failed:', err);
      alert('Could not export chart data. Please make sure the chart has fully loaded.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#131722] border border-[#1e222d] rounded-xl overflow-hidden shadow-xl" id="chart-viewport-panel">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0b0e14] border-b border-[#1e222d] select-none">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Live Chart: {symbol}
          </span>
          <span className="px-2 py-0.5 bg-[#1e222d] text-slate-400 text-[10px] font-mono rounded border border-[#2a2e3f]">
            {interval}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualExport}
            disabled={!isChartReady || isExporting}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              isChartReady && !isExporting
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                : 'bg-[#1e222d] text-slate-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export to Clipboard</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full min-h-[400px] relative" ref={containerRef}>
        {!isLibraryLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131722] text-slate-400">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <span className="text-sm">Connecting to TradingView Charting Library...</span>
            <span className="text-xs text-slate-500 mt-1">Verifying standalone script bundles</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131722] p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
            <h4 className="text-base font-semibold text-slate-200">Library Connection Failed</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
              {loadError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-950/40 text-rose-300 border border-rose-500/30 rounded-lg text-xs hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {isLibraryLoaded && !isChartReady && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131722] text-slate-400">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
            <span className="text-xs">Preparing technical chart and UDF feeds...</span>
          </div>
        )}
      </div>

      {/* Interactive overlays for user triggers */}
      <AnimatePresence>
        {dragExportActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md text-emerald-100 rounded-lg py-2.5 px-4 flex items-center justify-between shadow-2xl z-50"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">
                Drag-and-Drop Export complete!
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              Copied raw JSON to clipboard
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Instructions Footer */}
      <div className="px-4 py-2 bg-[#0b0e14] border-t border-[#1e222d] flex justify-between items-center text-[11px] text-slate-400 select-none">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          Data Provider: Demo Feed
        </span>
        <span>
          💡 Hold <kbd className="px-1.5 py-0.5 bg-[#1c2030] text-slate-300 border border-[#2a2e3f] rounded font-mono font-semibold">Ctrl</kbd> or <kbd className="px-1.5 py-0.5 bg-[#1c2030] text-slate-300 border border-[#2a2e3f] rounded font-mono font-semibold">⌥ Cmd</kbd> and drag chart to trigger custom export.
        </span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, DollarSign, Coins, Globe, Plus } from 'lucide-react';
import { Asset, AssetCategory } from '../types';

interface SymbolSelectorProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

const PRESET_ASSETS: Asset[] = [
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stock', description: 'Technology • NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stock', description: 'Technology • NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', category: 'stock', description: 'Consumer Cyclical • NASDAQ' },
  { symbol: 'GOOG', name: 'Alphabet Inc.', category: 'stock', description: 'Technology • NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'stock', description: 'Consumer Cyclical • NASDAQ' },
  
  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin / USD', category: 'crypto', description: 'Cryptocurrency • Binance/Coinbase' },
  { symbol: 'ETHUSD', name: 'Ethereum / USD', category: 'crypto', description: 'Cryptocurrency • Binance/Coinbase' },
  { symbol: 'SOLUSD', name: 'Solana / USD', category: 'crypto', description: 'Cryptocurrency • Binance' },
  
  // Forex
  { symbol: 'EURUSD', name: 'EUR / USD', category: 'forex', description: 'Foreign Exchange • Interbank' },
  { symbol: 'GBPUSD', name: 'GBP / USD', category: 'forex', description: 'Foreign Exchange • Interbank' },
  { symbol: 'USDJPY', name: 'USD / JPY', category: 'forex', description: 'Foreign Exchange • Interbank' },
  
  // Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'indices', description: 'Equity Index • NYSE Arca' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'indices', description: 'Equity Index • NASDAQ' }
];

export default function SymbolSelector({ selectedSymbol, onSelectSymbol }: SymbolSelectorProps) {
  const [activeTab, setActiveTab] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const filteredAssets = PRESET_ASSETS.filter((asset) => {
    const matchesTab = activeTab === 'all' || asset.category === activeTab;
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymbol.trim()) {
      const upperSymbol = customSymbol.trim().toUpperCase();
      onSelectSymbol(upperSymbol);
      setCustomSymbol('');
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'stock':
        return <TrendingUp className="w-4 h-4" />;
      case 'crypto':
        return <Coins className="w-4 h-4" />;
      case 'forex':
        return <Globe className="w-4 h-4" />;
      case 'indices':
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#1e222d] rounded-xl overflow-hidden shadow-xl" id="symbol-selector-panel">
      {/* Search Header */}
      <div className="p-4 border-b border-[#1e222d] space-y-3 bg-[#131722]/50">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Select Market Asset</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full bg-[#1c2030] text-slate-200 pl-9 pr-4 py-2 text-sm rounded-lg border border-[#2a2e3f] focus:outline-none focus:border-emerald-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 gap-1 border-b border-[#1e222d] overflow-x-auto scrollbar-none bg-[#131722]/30">
        {(['all', 'stock', 'crypto', 'forex', 'indices'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#1e222d] text-emerald-400 shadow-sm border border-[#2a2e3f]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Preset List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const isSelected = selectedSymbol === asset.symbol;
            return (
              <button
                key={asset.symbol}
                onClick={() => onSelectSymbol(asset.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group border ${
                  isSelected
                    ? 'bg-[#1b2330] border-emerald-500/40 text-emerald-400'
                    : 'bg-transparent border-transparent hover:bg-[#131722]/50 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-[#1c2030] text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-wide">{asset.symbol}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono hidden sm:block">
                  {asset.category.toUpperCase()}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No presets found. Try custom symbol below!
          </div>
        )}
      </div>

      {/* Custom Symbol Input Footer */}
      <div className="p-4 border-t border-[#1e222d] bg-[#131722]/60">
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">Add Custom Ticker</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. NVDA, SOLUSD"
              className="flex-1 bg-[#1c2030] text-slate-200 px-3 py-1.5 text-sm rounded-lg border border-[#2a2e3f] uppercase focus:outline-none focus:border-emerald-500 transition-colors"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

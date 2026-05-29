import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Cpu, Database, Network, Download, Flame, CloudLightning, Mountain, Crosshair } from 'lucide-react';

export default function DashboardSidebar({ latestEvent, eventsList, packetsIngested, activeFilter, setActiveFilter, isFollowing, setIsFollowing }) {
  const jsonSize = 180;
  const binSize = 10;
  const ratio = ((jsonSize - binSize) / jsonSize * 100).toFixed(1);

  const filterConfig = [
    { key: 'All', icon: null, color: null },
    { key: 'Wildfires', icon: Flame, color: '#ef4444' },
    { key: 'Severe Storms', icon: CloudLightning, color: '#06b6d4' },
    { key: 'Volcanoes', icon: Mountain, color: '#f59e0b' },
    { key: 'Earthquakes', icon: Activity, color: '#a855f7' },
  ];

  return (
    <aside className="w-full md:w-[380px] h-full bg-[#0a0a0c]/70 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 md:p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-y-auto font-sans">
      
      {/* header */}
      <div className="mb-5">
        <Link href="/" className="inline-flex items-center text-[11px] font-medium text-gray-500 hover:text-accent-white transition-colors mb-4 group tracking-widest uppercase">
          <ArrowLeft size={13} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to Uplink
        </Link>
        <div className="flex items-center space-x-3 mb-1.5">
          <Activity className="text-accent-mint animate-pulse" size={24} />
          <h1 className="text-2xl font-extrabold text-white tracking-tight glow-text-white">NEXUS-EDGE</h1>
        </div>
        <p className="text-[10px] font-semibold text-accent-retro uppercase tracking-[0.2em] pl-[36px]">
          Earth Observatory Natural Event Tracker
        </p>
      </div>

      {/* connection status */}
      <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-mint opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-mint"></span>
          </span>
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">EONET v3 Connected</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 tabular-nums" suppressHydrationWarning>
          {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* 2x2 metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-panel rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ingested</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-accent-mint glow-text-mint tabular-nums">{packetsIngested}</span>
            <span className="text-[10px] font-medium text-gray-500">pkts</span>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Event</p>
          <span className="text-xl font-bold text-accent-white glow-text-white tabular-nums">{latestEvent ? `#${latestEvent.id}` : '---'}</span>
        </div>
        <div className="glass-panel rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Events</p>
          <span className="text-xl font-bold text-accent-retro glow-text-retro tabular-nums">{eventsList ? eventsList.length : 0}</span>
        </div>
        <div className="glass-panel rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Packet Size</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-accent-white glow-text-white">10</span>
            <span className="text-[10px] font-medium text-gray-500">bytes</span>
          </div>
        </div>
      </div>

      {/* compression stats */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <Database size={12} className="mr-1.5 text-accent-retro" /> Compression Efficiency
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-[10px] font-medium text-gray-500 mb-0.5">JSON</div>
            <div className="text-sm text-gray-400 line-through">180B</div>
          </div>
          <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-gray-600 via-accent-mint to-gray-600 opacity-30"></div>
          <div className="text-center">
            <div className="text-[10px] font-medium text-accent-mint mb-0.5">Savings</div>
            <div className="text-2xl font-extrabold glow-text-mint tabular-nums">{ratio}%</div>
          </div>
          <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-gray-600 via-accent-mint to-gray-600 opacity-30"></div>
          <div className="text-center">
            <div className="text-[10px] font-medium text-gray-500 mb-0.5">Binary</div>
            <div className="text-sm font-bold text-accent-white">10B</div>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Event Filters</h3>
        <div className="grid grid-cols-2 gap-2">
          {filterConfig.map(({ key, icon: FilterIcon, color }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                activeFilter === key
                  ? 'bg-accent-mint text-[#0a0a0c] shadow-[0_0_20px_rgba(207,255,226,0.5)]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {FilterIcon && <FilterIcon size={14} style={activeFilter === key ? {} : { color }} />}
              <span>{key}</span>
            </button>
          ))}
        </div>
        
        {/* auto-follow toggle */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crosshair size={14} className={isFollowing ? "text-accent-mint animate-pulse" : "text-gray-500"} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Auto-Follow Latest</span>
          </div>
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`relative w-8 h-4 rounded-full transition-colors duration-300 ease-in-out ${isFollowing ? 'bg-accent-mint' : 'bg-gray-700'}`}
          >
            <span className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-300 ease-in-out ${isFollowing ? 'translate-x-4' : 'translate-x-0'}`}></span>
          </button>
        </div>
      </div>

      {/* export button & footer */}
      <div className="mt-auto space-y-3">
        <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-accent-white transition-all flex items-center justify-center space-x-2 hover:shadow-[0_0_15px_rgba(246,246,246,0.15)]">
          <Download size={14} />
          <span>Export Feed (JSON)</span>
        </button>
        <div className="text-[9px] font-medium text-gray-600 flex justify-between items-center tracking-widest uppercase">
          <span suppressHydrationWarning>SYS: {new Date().toISOString().slice(0,19)}</span>
          <span>NODE: VERCEL-IAD1</span>
        </div>
      </div>
    </aside>
  );
}

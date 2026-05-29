import React, { useEffect, useRef } from 'react';

export default function TerminalFeed({ logs }) {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-full bg-black/60 rounded-2xl p-5 flex flex-col overflow-hidden border border-white/5 shadow-inner">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pb-3 border-b border-white/10 flex items-center">
        <span className="w-2 h-2 rounded-full bg-accent-retro animate-pulse mr-2"></span>
        Live Telemetry Feed
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 text-[10px] md:text-xs font-mono tracking-tight leading-relaxed pb-2" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)' }}>
        {logs.map((log, i) => (
          <div key={i} className={`${log.message.includes('[ERROR]') ? 'text-[#ef4444]' : log.message.includes('[OK]') ? 'text-accent-mint' : 'text-gray-300'}`}>
            <span className="text-gray-500">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]</span>{' '}
            {log.message}
          </div>
        ))}
        <div ref={endOfMessagesRef} />
        <div className="flex items-center mt-3 opacity-70">
          <span className="text-accent-mint mr-3">{'>'}</span>
          <span className="w-2.5 h-4 bg-accent-mint animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

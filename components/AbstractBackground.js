'use client';
import React from 'react';

export default function AbstractBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0a0c]">
      {/* high-tech grid bg */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)'
        }}
      ></div>

      {/* glowing orbs based on system colors */}
      {/* mint orb */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#CFFFE2] opacity-[0.03] blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      {/* retro orb */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#A2D5C6] opacity-[0.04] blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      {/* cyan/blue tech orb */}
      <div className="absolute top-[30%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[#06b6d4] opacity-[0.04] blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* fake telemetry data streams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#CFFFE2] to-transparent opacity-30 animate-[data-stream_4s_linear_infinite]"></div>
        <div className="absolute top-0 left-[50%] w-[2px] h-full bg-gradient-to-b from-transparent via-[#A2D5C6] to-transparent opacity-40 animate-[data-stream_7s_linear_infinite_1s]"></div>
        <div className="absolute top-0 left-[80%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#06b6d4] to-transparent opacity-30 animate-[data-stream_5s_linear_infinite_2.5s]"></div>
        
        {/* horizontal scans */}
        <div className="absolute top-[30%] left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#F6F6F6] to-transparent opacity-10 animate-[data-scan_8s_linear_infinite_2s]"></div>
        <div className="absolute top-[70%] left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#CFFFE2] to-transparent opacity-10 animate-[data-scan_10s_linear_infinite_4s]"></div>
      </div>
    </div>
  );
}

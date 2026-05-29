'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AbstractBackground from '@/components/AbstractBackground';
import { Globe, Database, Zap, Activity, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [bootSequence, setBootSequence] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBootSequence(prev => (prev < 3 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="h-screen w-screen bg-[#0a0a0c] text-gray-200 font-sans relative overflow-hidden flex items-center justify-center p-6 lg:p-12">
      {/* Animated Telemetry Background */}
      <AbstractBackground />
      {/* Content inside Floating Glass Panel */}
      <div className="z-10 w-full max-w-6xl bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-16 flex flex-col items-center text-center space-y-16 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-y-auto max-h-full">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-accent-mint animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-accent-white uppercase">Live Edge Telemetry Active</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
            NEXUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-mint to-accent-retro">-EDGE</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Earth Observatory Natural Event Tracker. A real-time geospatial dashboard demonstrating advanced edge computing, binary stream processing, and low-overhead networking.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-accent-mint/50 transition-all flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-accent-retro/10 mb-6 group-hover:scale-110 transition-transform">
              <Globe size={28} className="text-accent-mint" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">Global Tracking</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Live monitoring of Wildfires, Storms, and Volcanoes across the Earth.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-accent-mint/50 transition-all flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-accent-retro/10 mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} className="text-accent-mint" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">Edge Streaming</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Sub-millisecond Serverless endpoints handling continuous event injection.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-accent-mint/50 transition-all flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-accent-retro/10 mb-6 group-hover:scale-110 transition-transform">
              <Database size={28} className="text-accent-mint" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">Binary Telemetry</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Heavy REST JSON payloads crushed into ultra-lean 10-byte data packets.</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-8 h-24 flex flex-col items-center justify-center">
          {bootSequence < 3 ? (
            <div className="flex flex-col items-center space-y-4 text-accent-mint">
              <div className="flex space-x-2">
                <div className={`w-2 h-2 rounded-full bg-accent-mint ${bootSequence >= 0 ? 'opacity-100' : 'opacity-20'}`}></div>
                <div className={`w-2 h-2 rounded-full bg-accent-mint ${bootSequence >= 1 ? 'opacity-100' : 'opacity-20'}`}></div>
                <div className={`w-2 h-2 rounded-full bg-accent-mint ${bootSequence >= 2 ? 'opacity-100' : 'opacity-20'}`}></div>
              </div>
              <p className="text-xs tracking-widest uppercase font-mono animate-pulse">Establishing Edge Uplink...</p>
            </div>
          ) : (
            <Link 
              href="/dashboard" 
              className="group inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-[#0a0a0c] transition-all bg-accent-mint backdrop-blur-md border border-accent-mint/50 rounded-full hover:bg-accent-white hover:border-accent-white hover:shadow-[0_0_40px_rgba(246,246,246,0.4)]"
            >
              Initialize System <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        
      </div>
    </main>
  );
}

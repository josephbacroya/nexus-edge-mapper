'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Flame, CloudLightning, Mountain } from 'lucide-react';

const CATEGORY_CONFIG = {
  'Wildfires': { icon: Flame, color: '#ef4444', label: 'Wildfire Detected' },
  'Severe Storms': { icon: CloudLightning, color: '#06b6d4', label: 'Severe Storm Alert' },
  'Volcanoes': { icon: Mountain, color: '#f59e0b', label: 'Volcanic Activity' },
  'Earthquakes': { icon: AlertTriangle, color: '#a855f7', label: 'Earthquake Detected' },
};

export default function AlertToast({ event }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    setLeaving(false);

    const hideTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => setVisible(false), 400);
    }, 4000);

    return () => clearTimeout(hideTimer);
  }, [event]);

  if (!visible || !event) return null;

  const config = CATEGORY_CONFIG[event.category] || {
    icon: AlertTriangle, color: '#CFFFE2', label: 'Event Detected'
  };
  const IconComponent = config.icon;

  return (
    <div
      className="fixed top-6 right-6 z-50 pointer-events-auto"
      style={{
        animation: leaving ? 'toast-out 0.4s ease-in forwards' : 'toast-in 0.4s ease-out forwards',
      }}
    >
      <div className="flex items-center space-x-4 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-sm">
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <IconComponent size={20} style={{ color: config.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: config.color }}>
            {config.label}
          </p>
          <p className="text-sm font-medium text-accent-white truncate">
            Event #{event.id} — [{event.lat}, {event.lng}]
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: config.color, boxShadow: `0 0 10px ${config.color}` }}
        ></div>
      </div>
    </div>
  );
}

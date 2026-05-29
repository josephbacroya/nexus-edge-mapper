import React from 'react';

export default function MetricCard({ title, value, unit, icon: Icon, colorClass = "text-accent-white" }) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4">
      {Icon && (
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${colorClass}`}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-bold tracking-tight ${colorClass.replace('text-', 'glow-text-')}`}>{value}</span>
          {unit && <span className="text-xs font-medium text-gray-500 ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

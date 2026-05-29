'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import DashboardSidebar from '@/components/DashboardSidebar';
import TerminalFeed from '@/components/TerminalFeed';
import AlertToast from '@/components/AlertToast';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0a0a0c] text-accent-mint animate-pulse font-mono text-sm">Initializing Geospatial Engine...</div>
});

export default function Dashboard() {
  const [eventsList, setEventsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFollowing, setIsFollowing] = useState(true);
  const [logs, setLogs] = useState([]);
  const [packetsIngested, setPacketsIngested] = useState(0);
  const [alertEvent, setAlertEvent] = useState(null);
  const lastAlertTime = useRef(0);

  useEffect(() => {
    setLogs([
      { timestamp: new Date().toISOString(), message: '[SYS] Initializing Nexus-Edge UI...' },
      { timestamp: new Date().toISOString(), message: '[SYS] Connected to Redis rolling stream cluster.' }
    ]);
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toISOString(), message: msg }]);
  };

  useEffect(() => {
    let intervalId;

    const fetchTelemetryStream = async () => {
      try {
        const res = await fetch('/api/stream-event');
        if (!res.ok) return;

        const data = await res.json();

        // Target the plural data array returned by your updated route.js
        if (data.events && Array.isArray(data.events)) {

          // Check if we have received a new item that isn't currently in local state
          if (data.events.length > 0) {
            const mostRecentIncoming = data.events[0]; // First element is newest from LPUSH
            const isBrandNew = !eventsList.some(e => e.id === mostRecentIncoming.id && e.timestamp === mostRecentIncoming.timestamp);

            if (isBrandNew && eventsList.length > 0) {
              setPacketsIngested(p => p + 1);
              addLog(`[EDGE] Stream payload synchronized. Ingested packet cluster.`);
              addLog(`[STREAM] Unpacking telemetry ID: ${mostRecentIncoming.id} | Category: ${mostRecentIncoming.category}`);
              addLog(`[MAP] Re-indexing target coordinates matrix...`);

              // Throttle alerts: only trigger one every 6 seconds max
              const now = Date.now();
              if (now - lastAlertTime.current > 6000) {
                lastAlertTime.current = now;
                setAlertEvent({ ...mostRecentIncoming, _ts: now });
              }
            }
          }

          // Directly set the full collection of global markers
          setEventsList(data.events);
        }
      } catch (error) {
        console.error('[STREAM POLL ERROR]', error);
      }
    };

    // Initialize immediate fetch and begin poll loop every 2.5 seconds
    fetchTelemetryStream();
    intervalId = setInterval(fetchTelemetryStream, 2500);
    return () => clearInterval(intervalId);
  }, [eventsList]);

  const latestEvent = eventsList[0] || null;

  return (
    <main className="h-screen w-screen bg-[#0a0a0c] text-gray-200 font-sans relative overflow-hidden">
      {/* Full-screen Map Container */}
      <div className="absolute inset-0 z-0">
        <MapView eventsList={eventsList} activeFilter={activeFilter} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
      </div>

      {/* Dynamic Telemetry Notification Toast */}
      <AlertToast event={alertEvent} />

      {/* Floating Control Center Sidebar */}
      <div className="absolute inset-x-0 top-0 md:inset-y-0 md:right-auto z-20 pointer-events-none p-3 md:p-5 flex flex-col md:block">
        <div className="pointer-events-auto w-full md:w-auto h-auto max-h-[50vh] md:max-h-none md:h-full">
          <DashboardSidebar
            latestEvent={latestEvent}
            eventsList={eventsList}
            packetsIngested={packetsIngested}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing}
          />
        </div>
      </div>

      {/* Diagnostics Terminal Stream Feed */}
      <div className="absolute bottom-3 inset-x-3 md:bottom-5 md:right-5 md:left-[420px] z-20 pointer-events-none h-24 md:h-44">
        <div className="pointer-events-auto w-full h-full shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-xl">
          <TerminalFeed logs={logs} />
        </div>
      </div>
    </main>
  );
}
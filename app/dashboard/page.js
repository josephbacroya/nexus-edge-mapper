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
      { timestamp: new Date().toISOString(), message: '[SYS] Connecting to NASA EONET API v3 stream...' }
    ]);
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-49), { timestamp: new Date().toISOString(), message: msg }]);
  };

  useEffect(() => {
    let intervalId;

    const fetchLatestEvent = async () => {
      try {
        const res = await fetch('/api/stream-event');
        if (!res.ok) return;

        const data = await res.json();

        if (data.event) {
          setEventsList(prev => {
            const isDuplicate = prev.some(e => e.id === data.event.id && e.timestamp === data.event.timestamp);
            if (!isDuplicate) {
              setPacketsIngested(p => p + 1);
              addLog(`[EDGE] Binary packet received...`);
              addLog(`[STREAM] Decoding telemetry... ID: ${data.event.id} | Cat: ${data.event.category}`);
              addLog(`[MAP] Plotting [${data.event.lat}, ${data.event.lng}]`);

              // Throttle alerts: only show one every 6 seconds
              const now = Date.now();
              if (now - lastAlertTime.current > 6000) {
                lastAlertTime.current = now;
                setAlertEvent({ ...data.event, _ts: now });
              }

              return [...prev, data.event];
            }
            return prev;
          });
        }
      } catch (error) {
        // Silent catch for polling
      }
    };

    intervalId = setInterval(fetchLatestEvent, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const latestEvent = eventsList[eventsList.length - 1] || null;

  return (
    <main className="h-screen w-screen bg-[#0a0a0c] text-gray-200 font-sans relative overflow-hidden">
      {/* Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView eventsList={eventsList} activeFilter={activeFilter} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
      </div>

      {/* Alert Toast (top-right, non-spammy) */}
      <AlertToast event={alertEvent} />

      {/* Floating Sidebar */}
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

      {/* Floating Terminal — bottom right */}
      <div className="absolute bottom-3 inset-x-3 md:bottom-5 md:right-5 md:left-[420px] z-20 pointer-events-none h-24 md:h-44">
        <div className="pointer-events-auto w-full h-full shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-xl">
          <TerminalFeed logs={logs} />
        </div>
      </div>
    </main>
  );
}


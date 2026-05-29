'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import DashboardSidebar from '@/components/DashboardSidebar';
import TerminalFeed from '@/components/TerminalFeed';
import AlertToast from '@/components/AlertToast';

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

  // Track known IDs using a ref to prevent terminal spam/re-render loops
  const knownEventIdsRef = useRef(new Set());
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
    const fetchTelemetryStream = async () => {
      try {
        const res = await fetch('/api/stream-event');
        if (!res.ok) return;

        const data = await res.json();

        if (data.events && Array.isArray(data.events)) {
          let brandNewPacketsCount = 0;
          let newestMatch = null;

          // Iterate backward (oldest to newest) to print logs chronologically
          for (let i = data.events.length - 1; i >= 0; i--) {
            const ev = data.events[i];
            // Create a unique footprint matching your Redis cache keys
            const uniqueKey = `${ev.id}-${ev.timestamp}`;

            if (!knownEventIdsRef.current.has(uniqueKey)) {
              knownEventIdsRef.current.add(uniqueKey);
              brandNewPacketsCount++;
              newestMatch = ev;
            }
          }

          // Only update logs and counters if fresh packets actually landed
          if (brandNewPacketsCount > 0 && newestMatch) {
            setPacketsIngested(p => p + brandNewPacketsCount);
            addLog(`[EDGE] Ingested ${brandNewPacketsCount} new binary telemetry packets.`);
            addLog(`[STREAM] Active Event Cluster ID: ${newestMatch.id} | Cat: ${newestMatch.category}`);
            addLog(`[MAP] Synchronizing layout coordinate vectors...`);

            const now = Date.now();
            if (now - lastAlertTime.current > 6000) {
              lastAlertTime.current = now;
              setAlertEvent({ ...newestMatch, _ts: now });
            }
          }

          // Smoothly overlay the cluster arrays
          setEventsList(data.events);
        }
      } catch (error) {
        // Silent catch for polling resilience
      }
    };

    fetchTelemetryStream();
    const intervalId = setInterval(fetchTelemetryStream, 2500);
    return () => clearInterval(intervalId);
  }, []); // Drop eventsList dependency to kill the infinite re-polling triggers!

  const latestEvent = eventsList[0] || null;

  return (
    <main className="h-screen w-screen bg-[#0a0a0c] text-gray-200 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapView eventsList={eventsList} activeFilter={activeFilter} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
      </div>

      <AlertToast event={alertEvent} />

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

      <div className="absolute bottom-3 inset-x-3 md:bottom-5 md:right-5 md:left-[420px] z-20 pointer-events-none h-24 md:h-44">
        <div className="pointer-events-auto w-full h-full shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-xl">
          <TerminalFeed logs={logs} />
        </div>
      </div>
    </main>
  );
}
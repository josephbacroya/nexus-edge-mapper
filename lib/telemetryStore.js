// lib/telemetryStore.js
// A simple in-memory store to hold the latest parsed telemetry event.
// In a true distributed Edge environment, this would be backed by Redis (e.g., Upstash)
// or another low-latency KV store. For this portfolio simulation, we use global memory.

const globalStore = globalThis;

if (typeof globalStore.latestEvent === 'undefined') {
  globalStore.latestEvent = null;
}

export const getLatestEvent = () => {
  return globalStore.latestEvent;
};

export const setLatestEvent = (event) => {
  globalStore.latestEvent = event;
};

// lib/telemetryStore.js
// in-memory store for the latest event
// would use redis in prod, but global memory is fine for this demo

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

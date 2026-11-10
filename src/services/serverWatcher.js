/**
 * serverWatcher.js
 * Automatic Background Server Health & Real-time Recovery Engine
 *
 * Automatically detects when the backend server finishes starting or reconnects,
 * and immediately re-hydrates all data (Orders, Products, Dashboard, Categories, Settings)
 * without requiring the user to manually refresh the page!
 */

import { getSocket } from './socket';

let isServerDown = false;
let healthPollTimer = null;
let lastKnownOnlineTime = Date.now();

const getHealthUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return apiUrl.replace(/\/api\/v1\/?$/, '') + '/health';
};

/**
 * Triggered as soon as the server is verified back online
 */
export function triggerServerReconnected() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Throttle events so rapid reconnects don't flood calls (min 1.5s interval)
  if (now - lastKnownOnlineTime < 1500 && !isServerDown) return;

  lastKnownOnlineTime = now;
  isServerDown = false;

  if (healthPollTimer) {
    clearInterval(healthPollTimer);
    healthPollTimer = null;
  }

  console.log('⚡ [ServerWatcher] Backend server is ONLINE & READY! Triggering automatic data re-hydration.');
  window.dispatchEvent(new CustomEvent('picky_server_reconnected'));
  window.dispatchEvent(new CustomEvent('picky_catalog_updated'));
}

/**
 * Called when an API network failure occurs or socket disconnects
 */
export function notifyServerOffline() {
  if (typeof window === 'undefined') return;
  if (isServerDown && healthPollTimer) return; // already actively polling

  isServerDown = true;
  console.warn('⚠️ [ServerWatcher] Backend server appears offline or booting. Auto-recovery active...');

  if (healthPollTimer) clearInterval(healthPollTimer);

  healthPollTimer = setInterval(async () => {
    try {
      const res = await fetch(getHealthUrl(), { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        triggerServerReconnected();
      }
    } catch (_) {
      // Server still starting up, continue checking every 2 seconds
    }
  }, 2000);
}

/**
 * Initialize automatic server monitoring on app startup
 */
export function initServerWatcher() {
  if (typeof window === 'undefined') return;

  // 1. Socket.IO connection event triggers instant recovery
  try {
    const socket = getSocket();
    if (socket) {
      socket.on('connect', () => {
        triggerServerReconnected();
      });
      socket.on('disconnect', () => {
        notifyServerOffline();
      });
      socket.on('connect_error', () => {
        notifyServerOffline();
      });
    }
  } catch (_) {}

  // 2. Window focus / visibility change triggers instant check if was marked down
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isServerDown) {
      fetch(getHealthUrl(), { method: 'GET', cache: 'no-store' })
        .then((r) => {
          if (r.ok) triggerServerReconnected();
        })
        .catch(() => {});
    }
  });

  window.addEventListener('focus', () => {
    if (isServerDown) {
      fetch(getHealthUrl(), { method: 'GET', cache: 'no-store' })
        .then((r) => {
          if (r.ok) triggerServerReconnected();
        })
        .catch(() => {});
    }
  });

  // 3. Initial check on mount
  fetch(getHealthUrl(), { method: 'GET', cache: 'no-store' })
    .then((r) => {
      if (r.ok) {
        isServerDown = false;
      } else {
        notifyServerOffline();
      }
    })
    .catch(() => {
      notifyServerOffline();
    });
}


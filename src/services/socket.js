import { io } from 'socket.io-client';
import { broadcastCatalogUpdate } from '../utils/realtimeSync';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAuthStore } from '../store/authStore';

let socket = null;

/**
 * Resolve the latest valid JWT token from memory or Zustand stores
 */
export function resolveActiveToken(providedToken = null) {
  if (providedToken && typeof providedToken === 'string') return providedToken;
  try {
    const adminToken = useAdminAuthStore?.getState()?.accessToken;
    if (adminToken) return adminToken;
  } catch (_) {}
  try {
    const userToken = useAuthStore?.getState()?.accessToken;
    if (userToken) return userToken;
  } catch (_) {}
  return null;
}

/**
 * Determine the backend WebSocket URL accurately across dev and production
 */
export function getSocketServerUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      const u = new URL(apiUrl);
      return `${u.protocol}//${u.host}`;
    } catch (_) {}
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
}

/**
 * Get or initialize the singleton Socket.IO connection
 */
export function getSocket(token = null) {
  if (typeof window === 'undefined') return null;

  const currentToken = resolveActiveToken(token);

  if (!socket) {
    const socketUrl = getSocketServerUrl();

    socket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 25,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      auth: (cb) => {
        const latestToken = resolveActiveToken();
        cb(latestToken ? { token: latestToken } : {});
      },
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to live WebSocket server:', socket.id);
      const activeToken = resolveActiveToken();
      if (activeToken) {
        socket.emit('user:authenticate', { token: activeToken });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Socket.IO] Connection notice:', err.message);
    });

    // Automatically pipe server catalog updates to local cross-tab BroadcastChannel
    socket.on('catalog:update', (data) => {
      console.log('🔄 [Socket.IO] Catalog update received from server:', data?.type);
      try {
        broadcastCatalogUpdate(data?.type || 'CATALOG_UPDATED', data?.payload);
      } catch (_) {}
    });

    // Forward server notifications to window event for AdminLayout & UI
    socket.on('notification:new', (notif) => {
      try {
        window.dispatchEvent(new CustomEvent('picky_notifications_updated', { detail: notif }));
      } catch (_) {}
    });
  }

  // Update auth token dynamically if changed
  if (currentToken && socket) {
    socket.auth = { token: currentToken };
  }

  return socket;
}

/**
 * Join admin dashboard room to receive instant live orders & alerts
 */
export function joinAdminRoom() {
  const s = getSocket();
  if (!s) return;

  const doJoin = () => {
    const token = resolveActiveToken();
    s.emit('admin:join', token ? { token } : {});
    console.log('👑 [Socket.IO] Requested join admin room');
  };

  if (s.connected) {
    doJoin();
  } else {
    s.once('connect', doJoin);
  }
}

/**
 * Watch real-time delivery status for a specific customer order
 */
export function watchOrder(orderId, callback) {
  const s = getSocket();
  if (!s || !orderId || typeof callback !== 'function') return () => {};

  const idStr = String(orderId).trim();
  const doWatch = () => s.emit('order:watch', idStr);

  if (s.connected) {
    doWatch();
  } else {
    s.once('connect', doWatch);
  }

  const handler = (data) => {
    if (!data) return;
    const incomingId = String(data.orderId || data.orderNumber || '').toUpperCase();
    if (incomingId === idStr.toUpperCase()) {
      callback(data);
    }
  };

  s.on('order:track_update', handler);
  s.on('order:status_changed', handler);

  return () => {
    s.emit('order:unwatch', idStr);
    s.off('order:track_update', handler);
    s.off('order:status_changed', handler);
  };
}

/**
 * Listen for live orders (for Admin Dashboard & Admin Orders)
 */
export function subscribeToOrders(callback) {
  const s = getSocket();
  if (!s || typeof callback !== 'function') return () => {};

  joinAdminRoom();

  const handler = (data) => {
    callback(data);
  };

  s.on('order:change', handler);
  return () => {
    s.off('order:change', handler);
  };
}

/**
 * Listen for live admin notifications
 */
export function subscribeToNotifications(callback) {
  const s = getSocket();
  if (!s || typeof callback !== 'function') return () => {};

  joinAdminRoom();

  const handler = (data) => {
    callback(data);
  };

  s.on('notification:new', handler);
  return () => {
    s.off('notification:new', handler);
  };
}

/**
 * Disconnect socket cleanly
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


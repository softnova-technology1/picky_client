import { io } from 'socket.io-client';
import { broadcastCatalogUpdate } from '../utils/realtimeSync';

let socket = null;

/**
 * Get or initialize the singleton Socket.IO connection
 */
export function getSocket(token = null) {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    // In dev & prod, Nginx/Vite proxies /socket.io to server port 5000
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    socket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {},
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to live WebSocket server:', socket.id);
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
  }

  // Update auth token dynamically if changed
  if (token && socket) {
    socket.auth = { token };
  }

  return socket;
}

/**
 * Join admin dashboard room to receive instant live orders
 */
export function joinAdminRoom() {
  const s = getSocket();
  if (s) {
    s.emit('admin:join');
    console.log('👑 [Socket.IO] Requested join admin room');
  }
}

/**
 * Watch real-time delivery status for a specific customer order
 */
export function watchOrder(orderId, callback) {
  const s = getSocket();
  if (!s || !orderId) return () => {};

  s.emit('order:watch', orderId);
  const handler = (data) => {
    if (data?.orderId === orderId) {
      callback(data);
    }
  };
  s.on('order:track_update', handler);

  return () => {
    s.emit('order:unwatch', orderId);
    s.off('order:track_update', handler);
  };
}

/**
 * Listen for live orders (for Admin Dashboard)
 */
export function subscribeToOrders(callback) {
  const s = getSocket();
  if (!s) return () => {};

  s.on('order:change', callback);
  return () => {
    s.off('order:change', callback);
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


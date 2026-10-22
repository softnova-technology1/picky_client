import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useUiStore } from '../store/uiStore';

const STORAGE_KEY_SETTINGS = 'picky_admin_settings';
const STORAGE_KEY_LAST_ACTIVE = 'picky_admin_last_active';
export const SESSION_KEY_LOGOUT_REASON = 'picky_admin_logout_reason';
export const SESSION_KEY_TIMEOUT_MINS = 'picky_admin_timeout_mins';

/**
 * Reads the active timeout in minutes from saved settings.
 * If 0 or negative -> disabled (never timeout).
 * Defaults to 60 minutes if not configured.
 */
export function getSavedTimeoutMinutes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sessionTimeoutMinutes !== undefined) {
        return Math.max(0, parseInt(parsed.sessionTimeoutMinutes, 10) || 0);
      }
    }
  } catch (_) {}
  return 60;
}

export function useAdminIdleTimeout() {
  const { isLoggedIn, logout } = useAdminAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();
  const lastActiveRef = useRef(Date.now());
  const timeoutMinutesRef = useRef(getSavedTimeoutMinutes());

  useEffect(() => {
    if (!isLoggedIn) return;

    // Load active saved timeout
    timeoutMinutesRef.current = getSavedTimeoutMinutes();

    // Mark current time as active on mount
    const now = Date.now();
    lastActiveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, String(now));
    } catch (_) {}

    // Throttle user activity tracking (at most once every 1.5 seconds)
    let lastActivityTracked = 0;
    const handleUserActivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivityTracked > 1500) {
        lastActivityTracked = currentTime;
        lastActiveRef.current = currentTime;
        try {
          localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, String(currentTime));
        } catch (_) {}
      }
    };

    // User interaction events to monitor
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Listen for setting changes saved in AdminSettings page
    const handleTimeoutConfigUpdated = (e) => {
      const newMins = e?.detail?.timeoutMinutes !== undefined
        ? Math.max(0, parseInt(e.detail.timeoutMinutes, 10) || 0)
        : getSavedTimeoutMinutes();
      timeoutMinutesRef.current = newMins;
      const resetTime = Date.now();
      lastActiveRef.current = resetTime;
      try {
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, String(resetTime));
      } catch (_) {}
    };

    window.addEventListener('picky_admin_timeout_updated', handleTimeoutConfigUpdated);

    // Periodically check elapsed idle time
    const intervalId = setInterval(() => {
      const activeTimeout = timeoutMinutesRef.current;
      // 0 means NEVER timeout (Disabled)
      if (activeTimeout <= 0) return;

      const timeoutMs = activeTimeout * 60 * 1000;
      let lastActive = lastActiveRef.current;
      try {
        const storedLastActive = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE);
        if (storedLastActive) {
          const parsed = parseInt(storedLastActive, 10);
          if (!isNaN(parsed) && parsed > lastActive) {
            lastActive = parsed;
            lastActiveRef.current = parsed;
          }
        }
      } catch (_) {}

      const elapsed = Date.now() - lastActive;

      if (elapsed >= timeoutMs) {
        // Idle timeout reached!
        try {
          sessionStorage.setItem(SESSION_KEY_LOGOUT_REASON, 'timeout');
          sessionStorage.setItem(SESSION_KEY_TIMEOUT_MINS, String(activeTimeout));
        } catch (_) {}

        logout();
        navigate('/softpicky-sn2026', { replace: true });
        showToast(`Your session timed out after ${activeTimeout}m of inactivity.`, 'warning');
      }
    }, 3000); // Check every 3 seconds

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener('picky_admin_timeout_updated', handleTimeoutConfigUpdated);
      clearInterval(intervalId);
    };
  }, [isLoggedIn, logout, navigate, showToast]);
}

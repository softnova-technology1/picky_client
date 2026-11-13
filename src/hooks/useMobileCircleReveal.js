import { useEffect, useLayoutEffect } from 'react';

const MOBILE_MAX_WIDTH = 768;
const TAP_MAX_AGE_MS = 1200;
const STRICT_MODE_DEDUP_MS = 200;
const FALLBACK_REVEAL_MS = 560;
const REVEAL_CSS_VARS = ['--cr-x', '--cr-y', '--cr-r'];
const ADMIN_PREFIXES = ['/softpicky-sn2026', '/softpicky_sn2026'];

let lastTap = null;
let lastRouteKey = null;
let activeTransition = null;

function isAdminPath(pathname) {
  return ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  if (window.innerWidth > MOBILE_MAX_WIDTH) return false;
  if (isAdminPath(window.location.pathname || '')) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

/**
 * Derive a route key that animates page/section switches (including switching to Deals)
 * without re-triggering full-screen reveals on minor shop filter query updates.
 */
export function buildRevealRouteKey(location) {
  if (!location) return '/';
  const params = new URLSearchParams(location.search || '');
  const isDealsSort = params.get('sort') === 'discount';
  return `${location.pathname}${isDealsSort ? '?deals' : ''}`;
}

function getTapOriginFallback() {
  const vw = window.innerWidth || 390;
  const vh = window.innerHeight || 844;
  return { x: vw * 0.5, y: vh * 0.92 };
}

function getRevealOrigin(routeKey) {
  const now = Date.now();

  if (lastRouteKey === null) {
    lastRouteKey = routeKey;
    activeTransition = null;
    return null;
  }

  if (lastRouteKey !== routeKey) {
    const hasFreshTap = lastTap && now - lastTap.timestamp <= TAP_MAX_AGE_MS;
    const origin = hasFreshTap ? { x: lastTap.x, y: lastTap.y } : getTapOriginFallback();
    lastRouteKey = routeKey;
    activeTransition = { routeKey, x: origin.x, y: origin.y, startedAt: now };
    return origin;
  }

  if (
    activeTransition &&
    activeTransition.routeKey === routeKey &&
    now - activeTransition.startedAt <= STRICT_MODE_DEDUP_MS
  ) {
    return { x: activeTransition.x, y: activeTransition.y };
  }

  return null;
}

function clearRevealStyles(el, className) {
  if (!el) return;
  el.classList.remove(className);
  for (const cssVar of REVEAL_CSS_VARS) {
    el.style.removeProperty(cssVar);
  }
}

/**
 * Captures the most recent tap/click coordinate on mobile storefront screens
 * so page circle reveals expand outward directly from the tapped button or tab.
 */
export function useMobileTapTracker() {
  useEffect(() => {
    if (lastRouteKey === null && typeof window !== 'undefined') {
      lastRouteKey = buildRevealRouteKey(window.location);
    }

    function recordEventOrigin(event) {
      if (!isMobileViewport()) return;

      let x = event.clientX;
      let y = event.clientY;

      if ((!x && !y) && event.target instanceof Element) {
        const rect = event.target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      if (typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y)) {
        lastTap = { x, y, timestamp: Date.now() };
      }
    }

    document.addEventListener('pointerdown', recordEventOrigin, { capture: true, passive: true });
    document.addEventListener('click', recordEventOrigin, { capture: true, passive: true });

    return () => {
      document.removeEventListener('pointerdown', recordEventOrigin, { capture: true });
      document.removeEventListener('click', recordEventOrigin, { capture: true });
    };
  }, []);
}

/**
 * Applies a transient mobile-only circular reveal animation on `elementRef`
 * whenever `routeKey` changes, and removes the class upon completion so
 * fixed-positioned overlays and sticky bars remain unaffected.
 */
export function useCircleRevealTransition(elementRef, routeKey, revealClass, { skipSelector = '' } = {}) {
  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || !revealClass || !isMobileViewport()) return undefined;
    if (skipSelector && el.closest(skipSelector)) return undefined;

    const origin = getRevealOrigin(routeKey);
    if (!origin) return undefined;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth || rect.width || 390;
    const vh = window.innerHeight || rect.height || 844;
    const localX = origin.x - rect.left;
    const localY = origin.y - rect.top;
    const maxRadius = Math.ceil(
      Math.hypot(Math.max(origin.x, vw - origin.x), Math.max(origin.y, vh - origin.y))
    ) + 24;

    el.classList.remove(revealClass);
    el.style.setProperty('--cr-x', `${Math.round(localX)}px`);
    el.style.setProperty('--cr-y', `${Math.round(localY)}px`);
    el.style.setProperty('--cr-r', `${maxRadius}px`);
    void el.offsetWidth;
    el.classList.add(revealClass);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearRevealStyles(el, revealClass);
    };

    const handleAnimationEnd = (e) => {
      if (e.target === el) finish();
    };

    el.addEventListener('animationend', handleAnimationEnd);
    const fallbackTimer = window.setTimeout(finish, FALLBACK_REVEAL_MS);

    return () => {
      el.removeEventListener('animationend', handleAnimationEnd);
      window.clearTimeout(fallbackTimer);
      clearRevealStyles(el, revealClass);
    };
  }, [elementRef, routeKey, revealClass, skipSelector]);
}

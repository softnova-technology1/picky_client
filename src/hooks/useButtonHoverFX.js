import { useEffect } from 'react';

/**
 * useButtonHoverFX
 * ─────────────────────────────────────────────────────────────
 * Universally attaches a cursor-tracking neon spotlight to
 * EVERY <button> and anchor-style button on the page — no
 * matter what class name they use.
 *
 * It sets CSS custom properties --btn-mx / --btn-my that the
 * button-hover-fx.css sheet reads to render a radial glow
 * that follows the cursor inside each button.
 *
 * Exclusions: nav icon buttons, tiny icon-only buttons (<36px),
 * and explicitly excluded elements (.no-hover-fx).
 */

// Selects every interactive button-like element site-wide
const SELECTOR = [
  'button:not(.no-hover-fx)',
  'a[class*="btn"]:not(.no-hover-fx)',
  'a[class*="-btn"]:not(.no-hover-fx)',
  '[class*="-btn"]:not(svg):not(.no-hover-fx)',
  '[class*="btn-"]:not(svg):not(.no-hover-fx)',
].join(', ');

export function useButtonHoverFX() {
  useEffect(() => {
    const attached = new WeakSet();

    function onMouseMove(e) {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--btn-mx', `${x}%`);
      el.style.setProperty('--btn-my', `${y}%`);
    }

    function onMouseLeave(e) {
      e.currentTarget.style.setProperty('--btn-mx', '50%');
      e.currentTarget.style.setProperty('--btn-my', '50%');
    }

    function attach(el) {
      if (attached.has(el)) return;
      // Skip tiny icon buttons (e.g. quantity ±, close X, scroll-to-top)
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && w < 36 && h < 36) return;
      // Skip nav/icon-only buttons that shouldn't animate
      if (el.closest('.no-hover-fx')) return;

      attached.add(el);
      el.style.setProperty('--btn-mx', '50%');
      el.style.setProperty('--btn-my', '50%');
      el.addEventListener('mousemove', onMouseMove, { passive: true });
      el.addEventListener('mouseleave', onMouseLeave, { passive: true });
    }

    function scanAndAttach() {
      document.querySelectorAll(SELECTOR).forEach(attach);
    }

    // Initial scan
    scanAndAttach();

    // Re-scan whenever React mounts new elements (route changes, lazy loads)
    const observer = new MutationObserver(scanAndAttach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll(SELECTOR).forEach((el) => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);
}

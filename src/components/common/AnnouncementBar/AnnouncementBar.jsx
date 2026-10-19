import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Truck,
  Sparkles,
  ShieldCheck,
  Gift,
  Flame,
  Percent,
  Megaphone,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { useCustomizationStore } from '../../../store/customizationStore';
import './AnnouncementBar.css';

// ─── Real Lucide Vector Icon Resolver (Supports 'none' to hide icon) ───────────
function getAnnouncementRealIcon(iconName) {
  if (!iconName || iconName === 'none' || iconName === 'None') {
    return null;
  }

  const iconMap = {
    Tag: <Tag size={13} className="announcement-real-icon" />,
    tag: <Tag size={13} className="announcement-real-icon" />,
    Truck: <Truck size={13} className="announcement-real-icon" />,
    truck: <Truck size={13} className="announcement-real-icon" />,
    Sparkles: <Sparkles size={13} className="announcement-real-icon" />,
    sparkles: <Sparkles size={13} className="announcement-real-icon" />,
    ShieldCheck: <ShieldCheck size={13} className="announcement-real-icon" />,
    shield: <ShieldCheck size={13} className="announcement-real-icon" />,
    Gift: <Gift size={13} className="announcement-real-icon" />,
    gift: <Gift size={13} className="announcement-real-icon" />,
    Flame: <Flame size={13} className="announcement-real-icon" />,
    flame: <Flame size={13} className="announcement-real-icon" />,
    Percent: <Percent size={13} className="announcement-real-icon" />,
    percent: <Percent size={13} className="announcement-real-icon" />,
    Megaphone: <Megaphone size={13} className="announcement-real-icon" />,
    megaphone: <Megaphone size={13} className="announcement-real-icon" />,
    RotateCcw: <RotateCcw size={13} className="announcement-real-icon" />,
    returns: <RotateCcw size={13} className="announcement-real-icon" />,
    ShoppingBag: <ShoppingBag size={13} className="announcement-real-icon" />,
    shop: <ShoppingBag size={13} className="announcement-real-icon" />,
  };

  return iconMap[iconName] || null;
}


// ─── Dynamic Running Marquee Ticker (Customizable via Admin CMS) ───────────────
export default function AnnouncementBar() {
  const [isPaused, setIsPaused] = useState(false);

  // Subscribe to live sync timestamp and store state for immediate 0ms reactive re-render
  const lastSyncTimestamp = useCustomizationStore((state) => state.lastSyncTimestamp);
  const barSection = useCustomizationStore((state) => {
    const inGlobal = state.pageSections?.global_header?.find(
      (s) => s.id === 'announcement_bar' || s.key === 'announcement_bar'
    );
    if (inGlobal) return inGlobal;

    const inFlat = state.sections?.find(
      (s) => s.id === 'announcement_bar' || s.key === 'announcement_bar'
    );
    if (inFlat) return inFlat;

    const pages = state.pageSections || {};
    for (const pageKey of Object.keys(pages)) {
      const found = pages[pageKey]?.find(
        (s) => s.id === 'announcement_bar' || s.key === 'announcement_bar'
      );
      if (found) return found;
    }
    return null;
  });

  // Strict On/Off: When disabled in Admin, DO NOT render on client side!
  if (!barSection || barSection.enabled === false) {
    return null;
  }

  const settings = barSection?.settings || {};
  const {
    lines = [],
    bgColor = '#7c3aed',
    textColor = '#ffffff',
    fontSize = '13px',
    autoplaySpeed = 4000,
    text: fallbackText,
    linkText: fallbackLinkText,
    linkUrl: fallbackLinkUrl,
    badge: fallbackBadge,
  } = settings;

  // Resolve active lines list (Strictly honors enabled !== false, text/badge presence)
  const activeLines = (() => {
    if (Array.isArray(lines) && lines.length > 0) {
      const filtered = lines.filter((l) => l && l.enabled !== false && (l.text || l.badge));
      if (filtered.length > 0) return filtered;
    }
    if (fallbackText) {
      return [
        {
          id: 1,
          icon: 'Tag',
          text: fallbackText,
          linkText: fallbackLinkText,
          linkUrl: fallbackLinkUrl || '/shop',
          badge: fallbackBadge,
        },
      ];
    }
    return [];
  })();

  if (activeLines.length === 0) {
    return null;
  }

  // Duplicate lines array enough times for a continuous loop across any monitor width
  const loopMultiplier = activeLines.length <= 2 ? 4 : 3;
  const loopItems = Array.from({ length: loopMultiplier }, () => activeLines).flat();

  // Speed calculation: duration in seconds for one full loop
  const speedSeconds = Math.max(22, Math.min(55, Math.round(activeLines.length * 8 * (autoplaySpeed / 4000))));

  return (
    <div
      role="region"
      aria-label="Store Promotional Announcement Ticker"
      className="announcement-marquee-bar no-hover-fx"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: bgColor,
        color: textColor,
        fontSize: fontSize,
      }}
    >
      <div
        className={`announcement-marquee-track ${isPaused ? 'is-paused' : ''}`}
        style={{
          animationDuration: `${speedSeconds}s`,
        }}
      >
        {loopItems.map((line, idx) => {
          const destination = line.linkUrl || '/shop';
          const isExternal = destination.startsWith('http');
          const realIcon = getAnnouncementRealIcon(line.icon);

          const innerContent = (
            <span className="announcement-ticker-item-content">
              {/* Icon (Hidden if 'none' or null) */}
              {realIcon && (
                <span className="announcement-ticker-icon" aria-hidden="true">
                  {realIcon}
                </span>
              )}


              {/* Promotional Badge */}
              {line.badge && (
                <span className="announcement-ticker-badge">
                  {line.badge}
                </span>
              )}

              {/* Text Message */}
              <span className="announcement-ticker-text">{line.text}</span>

              {/* Action Link Text */}
              {line.linkText && (
                <span className="announcement-ticker-cta">
                  <span>{line.linkText}</span>
                  <span className="announcement-ticker-arrow">→</span>
                </span>
              )}

              {/* Separator */}
              <span className="announcement-ticker-sep" aria-hidden="true">✦</span>
            </span>
          );

          if (isExternal) {
            return (
              <a
                key={idx}
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                className="announcement-ticker-link no-hover-fx"
                title={line.text || 'Visit page'}
              >
                {innerContent}
              </a>
            );
          }

          return (
            <Link
              key={idx}
              to={destination}
              className="announcement-ticker-link no-hover-fx"
              title={line.text || 'Visit page'}
            >
              {innerContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

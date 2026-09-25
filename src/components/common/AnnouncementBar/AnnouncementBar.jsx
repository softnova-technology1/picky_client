import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCustomizationStore } from '../../../store/customizationStore';

// ─── Announcement Bar ─────────────────────────────────────────────────────────
// Reads directly from MOCK_STORE_CUSTOMIZATION.sections[announcement_bar].
// When Admin updates the customization text, this component reflects it.

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const { getSection } = useCustomizationStore();

  const barSection = getSection('announcement_bar');

  if (!barSection || !barSection.enabled || dismissed) return null;

  const { text, linkUrl, linkText, badge, bgColor, textColor } = barSection.settings;

  return (
    <div
      style={{
        background: bgColor || '#7c3aed',
        color: textColor || '#ffffff',
        fontSize: '0.82rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.5rem 1rem',
        position: 'relative',
        zIndex: 100,
        textAlign: 'center',
        letterSpacing: '0.01em',
        flexWrap: 'wrap',
      }}
    >
      {badge && (
        <span
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            padding: '0.1rem 0.4rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}
        >
          {badge}
        </span>
      )}
      <span>{text}</span>
      {linkUrl && linkText && (
        <Link
          to={linkUrl}
          style={{
            color: textColor || '#ffffff',
            fontWeight: 800,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          {linkText} →
        </Link>
      )}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: textColor || '#ffffff',
          cursor: 'pointer',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          padding: '0.2rem',
        }}
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}

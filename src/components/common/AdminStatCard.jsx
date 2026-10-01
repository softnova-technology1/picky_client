import React from 'react';

const COLOR_MAP = {
  purple: {
    label: '#6b21a8',
    value: '#1e1b4b',
    iconBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    iconShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
    trackBg: '#ede8f8',
    barBg: 'linear-gradient(90deg, #7c3aed, #a855f7)',
    footerVal: '#7c3aed',
  },
  amber: {
    label: '#b45309',
    value: '#1e1b4b',
    iconBg: 'linear-gradient(135deg, #d97706, #b45309)',
    iconShadow: '0 4px 16px rgba(217, 119, 6, 0.35)',
    trackBg: '#fef3c7',
    barBg: 'linear-gradient(90deg, #f59e0b, #d97706)',
    footerVal: '#d97706',
  },
  orange: {
    label: '#c2410c',
    value: '#1e1b4b',
    iconBg: 'linear-gradient(135deg, #ea580c, #c2410c)',
    iconShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
    trackBg: '#ffedd5',
    barBg: 'linear-gradient(90deg, #fb923c, #ea580c)',
    footerVal: '#ea580c',
  },
  blue: {
    label: '#1d4ed8',
    value: '#1e1b4b',
    iconBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    iconShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
    trackBg: '#dbeafe',
    barBg: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
    footerVal: '#2563eb',
  },
  green: {
    label: '#15803d',
    value: '#16a34a',
    iconBg: 'linear-gradient(135deg, #16a34a, #15803d)',
    iconShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
    trackBg: '#dcfce7',
    barBg: 'linear-gradient(90deg, #22c55e, #16a34a)',
    footerVal: '#15803d',
  },
  emerald: {
    label: '#047857',
    value: '#059669',
    iconBg: 'linear-gradient(135deg, #059669, #047857)',
    iconShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
    trackBg: '#d1fae5',
    barBg: 'linear-gradient(90deg, #10b981, #059669)',
    footerVal: '#059669',
  },
  red: {
    label: '#be123c',
    value: '#be123c',
    iconBg: 'linear-gradient(135deg, #e11d48, #be123c)',
    iconShadow: '0 4px 16px rgba(225, 29, 72, 0.35)',
    trackBg: '#ffe4e6',
    barBg: 'linear-gradient(90deg, #f43f5e, #be123c)',
    footerVal: '#e11d48',
  },
};

/**
 * Standardized KPI Progress Stat Card for all Admin Pages
 * Follows the high-conversion circular glowing badge + bottom progress bar blueprint.
 */
export default function AdminStatCard({
  title,
  value,
  icon,
  variant = 'purple',
  footerLabel,
  footerValue,
  progress = 100,
  showProgress = true,
  isActive = false,
  onClick,
  style = {},
  className = '',
  titleStyle = {},
  valueStyle = {},
}) {
  const theme = COLOR_MAP[variant] || COLOR_MAP.purple;
  const clampedProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const isClickable = typeof onClick === 'function';
  const hasProgress = showProgress && progress !== false && progress !== null;
  const hasBottom = Boolean((footerLabel || footerValue !== undefined) || hasProgress);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`stat-progress-card variant-${variant} ${isActive ? 'is-active' : ''} ${
        isClickable ? 'is-clickable' : ''
      } ${!hasBottom ? 'no-bottom' : ''} ${className}`}
      style={{
        ...style,
        justifyContent: hasBottom ? 'space-between' : 'center',
      }}
    >
      <div className="stat-progress-card-top">
        <div>
          <span
            className="stat-progress-card-label"
            style={{ color: theme.label, ...titleStyle }}
          >
            {title}
          </span>
          <strong
            className="stat-progress-card-value"
            style={{ color: theme.value, ...valueStyle }}
          >
            {value}
          </strong>
        </div>

        <div
          className="stat-progress-card-icon-wrap"
          style={{
            background: theme.iconBg,
            boxShadow: theme.iconShadow,
          }}
        >
          {icon}
        </div>
      </div>

      {hasBottom && (
        <div className="stat-progress-card-bottom">
          {(footerLabel || footerValue !== undefined) && (
            <div
              className="stat-progress-card-footer-info"
              style={{
                marginBottom: hasProgress ? '0.4rem' : 0,
              }}
            >
              {footerLabel && <span>{footerLabel}</span>}
              {footerValue !== undefined && (
                <span style={{ color: theme.footerVal, fontWeight: 700 }}>
                  {footerValue}
                </span>
              )}
            </div>
          )}

          {hasProgress && (
            <div
              className="stat-progress-card-track"
              style={{ background: theme.trackBg }}
            >
              <div
                className="stat-progress-card-bar"
                style={{
                  width: `${clampedProgress}%`,
                  background: theme.barBg,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

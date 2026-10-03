import React from 'react';
import { CheckCircle2, Truck, Package, Clock, XCircle, Sparkles } from 'lucide-react';

export default function Badge({ status, text, variant, showIcon = true, pulse = true }) {
  const normalizedStatus = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  const statusConfigs = {
    confirmed: {
      label: 'Order Confirmed',
      icon: CheckCircle2,
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
      color: '#0369a1',
      border: '#7dd3fc',
      dotColor: '#0284c7',
      glow: 'rgba(2, 132, 199, 0.2)',
    },
    packing: {
      label: 'Order Packing',
      icon: Package,
      bg: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)',
      color: '#7c3aed',
      border: '#c4b5fd',
      dotColor: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.2)',
    },
    shipped: {
      label: 'Order Shipping',
      icon: Truck,
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
      color: '#b45309',
      border: '#fcd34d',
      dotColor: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    out_for_delivery: {
      label: 'Order Shipping',
      icon: Truck,
      bg: 'linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)',
      color: '#6d28d9',
      border: '#c4b5fd',
      dotColor: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.2)',
    },
    delivered: {
      label: 'Order Delivered',
      icon: Sparkles,
      bg: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
      color: '#15803d',
      border: '#86efac',
      dotColor: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.2)',
    },
    cancelled: {
      label: 'Cancelled Order',
      icon: XCircle,
      bg: 'linear-gradient(135deg, #fee2e2 0%, #fff1f2 100%)',
      color: '#b91c1c',
      border: '#fca5a5',
      dotColor: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      bg: 'linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)',
      color: '#a16207',
      border: '#fde047',
      dotColor: '#eab308',
      glow: 'rgba(234, 179, 8, 0.2)',
    },
  };

  const config = statusConfigs[normalizedStatus];

  if (!config) {
    const badgeClass = variant ? `badge-${variant}` : 'badge-primary';
    return (
      <span className={`badge ${badgeClass}`}>
        {text || status}
      </span>
    );
  }

  const IconComponent = config.icon;
  const displayText = text || (status === 'out_for_delivery' ? 'Out for Delivery' : config.label);

  return (
    <span
      className="badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.42rem',
        padding: '0.35rem 0.85rem',
        borderRadius: '9999px',
        background: config.bg,
        color: config.color,
        border: `1.5px solid ${config.border}`,
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        boxShadow: `0 2px 8px ${config.glow}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {pulse && (
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: config.dotColor,
            boxShadow: `0 0 0 2px rgba(255,255,255,0.9), 0 0 6px ${config.dotColor}`,
            display: 'inline-block',
          }}
        />
      )}
      {showIcon && IconComponent && <IconComponent size={13} strokeWidth={2.5} />}
      <span>{displayText}</span>
    </span>
  );
}

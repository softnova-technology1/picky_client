import React from 'react';
import { XCircle } from 'lucide-react';
import styles from './TrackingStepper.module.css';

const STEPS = [
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    sub: 'Payment received',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <rect x="4" y="7" width="20" height="15" rx="3" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 12h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M9 17h4M16 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'processing',
    label: 'Packed',
    sub: 'Ready to ship',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M5 10.5L14 5l9 5.5V20a1 1 0 01-1 1H6a1 1 0 01-1-1v-9.5z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M10 21v-8h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'shipped',
    label: 'Dispatched',
    sub: 'AWB generated',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M4 11h14v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M18 14h3.5l2.5 3.5V21h-6v-7z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="8" cy="22" r="2" fill="currentColor"/>
        <circle cx="20" cy="22" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'in_transit',
    label: 'In Transit',
    sub: 'On the way',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M14 3C10.134 3 7 6.134 7 10c0 6.5 7 15 7 15s7-8.5 7-15c0-3.866-3.134-7-7-7z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="14" cy="10" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'delivered',
    label: 'Delivered',
    sub: 'Order complete',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M5 13.5l5.5 5.5L23 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const STATUS_ORDER = {
  confirmed: 0,
  processing: 1,
  packed: 1,
  shipped: 2,
  in_transit: 3,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export default function TrackingStepper({ currentStatus }) {
  const normalized = (currentStatus || 'confirmed').toLowerCase();
  const currentIdx = STATUS_ORDER[normalized] ?? 0;

  const getStepState = (idx) => {
    if (normalized === 'cancelled') return 'cancelled';
    if (currentIdx > idx) return 'completed';
    if (currentIdx === idx) return 'active';
    return 'pending';
  };

  const progressPct = {
    delivered: 100,
    in_transit: 75,
    out_for_delivery: 75,
    shipped: 50,
    processing: 25,
    packed: 25,
    confirmed: 0,
  }[normalized] ?? 0;

  if (normalized === 'cancelled') {
    return (
      <div className={styles.cancelledBanner}>
        <XCircle size={20} strokeWidth={2.5} />
        <span>This order has been cancelled by the store administrator.</span>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Progress rail */}
      <div className={styles.rail}>
        <div className={styles.railFill} style={{ width: `${progressPct}%` }} />
      </div>

      {/* Steps */}
      <div className={styles.steps}>
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          return (
            <div key={step.id} className={`${styles.step} ${styles[state]}`}>
              {/* Step circle */}
              <div className={styles.circleWrap}>
                {state === 'active' && <span className={styles.activeRing} />}
                <div className={styles.circle}>
                  {step.icon}
                </div>
                {state === 'completed' && (
                  <div className={styles.checkBadge}>
                    <svg viewBox="0 0 10 10" width="9" height="9" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={styles.label}>
                <span className={styles.labelMain}>{step.label}</span>
                <span className={styles.labelSub}>{step.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

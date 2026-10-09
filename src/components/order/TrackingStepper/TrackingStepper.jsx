import React from 'react';
import { XCircle } from 'lucide-react';
import styles from './TrackingStepper.module.css';

const STEPS = [
  {
    id: 'confirmed',
    label: 'Confirm',
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
    id: 'shipping',
    label: 'Shipping',
    sub: 'On the way',
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
    id: 'delivered',
    label: 'Delivery',
    sub: 'Order completed',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" width="22" height="22">
        <path d="M5 13.5l5.5 5.5L23 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const STATUS_ORDER = {
  confirmed: 0,
  processing: 0,
  packed: 0,
  shipping: 1,
  shipped: 1,
  in_transit: 1,
  out_for_delivery: 1,
  delivery: 2,
  delivered: 2,
  cancelled: -1,
};

export default function TrackingStepper({ currentStatus }) {
  const normalized = (currentStatus || 'confirmed').toLowerCase();
  const currentIdx = STATUS_ORDER[normalized] ?? 0;

  const getStepState = (idx) => {
    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'delivered' || normalized === 'delivery') return 'completed';
    if (currentIdx > idx) return 'completed';
    if (currentIdx === idx) return 'active';
    return 'pending';
  };

  const progressPct = {
    delivery: 100,
    delivered: 100,
    in_transit: 50,
    out_for_delivery: 50,
    shipping: 50,
    shipped: 50,
    processing: 0,
    packed: 0,
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

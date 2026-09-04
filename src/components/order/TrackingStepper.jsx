import React from 'react';

const STEPS = [
  { id: 'confirmed', label: 'Order Confirmed', icon: '📝' },
  { id: 'shipped', label: 'Shipped', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '📦' },
];

export default function TrackingStepper({ currentStatus }) {
  const normalized = (currentStatus || 'confirmed').toLowerCase();

  const getStepState = (stepIndex) => {
    const statusOrder = { confirmed: 0, shipped: 1, delivered: 2, cancelled: -1 };
    const currentIdx = statusOrder[normalized] ?? 0;

    if (normalized === 'cancelled') return 'cancelled';
    if (currentIdx > stepIndex) return 'completed';
    if (currentIdx === stepIndex) return 'active';
    return 'pending';
  };

  const getProgressWidth = () => {
    if (normalized === 'delivered') return '100%';
    if (normalized === 'shipped') return '50%';
    return '0%';
  };

  if (normalized === 'cancelled') {
    return (
      <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: 'var(--radius)', color: '#b91c1c', textAlign: 'center', fontWeight: 700 }}>
        ❌ This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="stepper-container">
      {/* Background track */}
      <div className="stepper-track">
        <div className="stepper-progress" style={{ width: getProgressWidth() }} />
      </div>

      {/* Step nodes */}
      {STEPS.map((step, idx) => {
        const state = getStepState(idx);
        return (
          <div key={step.id} className={`stepper-step ${state}`}>
            <div className="stepper-circle">
              {state === 'completed' ? '✓' : step.icon}
            </div>
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

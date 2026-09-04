import React from 'react';

const STEPS = [
  { id: 'confirmed', label: 'Confirmed & Paid', icon: '💳' },
  { id: 'shipped', label: 'Dispatched', icon: '📦' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function TrackingStepper({ currentStatus }) {
  const normalized = (currentStatus || 'confirmed').toLowerCase();

  const getStepState = (stepIndex) => {
    const statusOrder = { confirmed: 0, shipped: 1, out_for_delivery: 2, delivered: 3, cancelled: -1 };
    const currentIdx = statusOrder[normalized] ?? 0;

    if (normalized === 'cancelled') return 'cancelled';
    if (currentIdx > stepIndex) return 'completed';
    if (currentIdx === stepIndex) return 'active';
    return 'pending';
  };

  const getProgressWidth = () => {
    if (normalized === 'delivered') return '100%';
    if (normalized === 'out_for_delivery') return '66%';
    if (normalized === 'shipped') return '33%';
    return '0%';
  };

  if (normalized === 'cancelled') {
    return (
      <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca', color: '#b91c1c', textAlign: 'center', fontWeight: 700 }}>
        ❌ This order has been cancelled by store administrator.
      </div>
    );
  }

  return (
    <div className="stepper-container" style={{ margin: '1.5rem 0' }}>
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

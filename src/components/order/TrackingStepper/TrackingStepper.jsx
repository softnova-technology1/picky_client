import React from 'react';
import { CreditCard, PackageCheck, Truck, MapPin, CheckCircle2, Check, XCircle } from 'lucide-react';

const STEPS = [
  { id: 'confirmed', label: 'Order Placed & Paid', icon: CreditCard },
  { id: 'processing', label: 'Packed at Warehouse', icon: PackageCheck },
  { id: 'shipped', label: 'Dispatched & AWB', icon: Truck },
  { id: 'in_transit', label: 'In Transit', icon: MapPin },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function TrackingStepper({ currentStatus }) {
  const normalized = (currentStatus || 'confirmed').toLowerCase();

  const getStepState = (stepIndex) => {
    const statusOrder = {
      confirmed: 0,
      processing: 1,
      packed: 1,
      shipped: 2,
      in_transit: 3,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: -1,
    };
    const currentIdx = statusOrder[normalized] ?? 0;

    if (normalized === 'cancelled') return 'cancelled';
    if (currentIdx > stepIndex) return 'completed';
    if (currentIdx === stepIndex) return 'active';
    return 'pending';
  };

  const getProgressWidth = () => {
    if (normalized === 'delivered') return '100%';
    if (normalized === 'in_transit' || normalized === 'out_for_delivery') return '75%';
    if (normalized === 'shipped') return '50%';
    if (normalized === 'processing' || normalized === 'packed') return '25%';
    return '0%';
  };

  if (normalized === 'cancelled') {
    return (
      <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca', color: '#b91c1c', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <XCircle size={20} /> This order has been cancelled by store administrator.
      </div>
    );
  }

  return (
    <div className="stepper-container" style={{ margin: '1.75rem 0' }}>
      {/* Background track */}
      <div className="stepper-track">
        <div className="stepper-progress" style={{ width: getProgressWidth(), background: 'linear-gradient(90deg, #10b981, #7c3aed)' }} />
      </div>

      {/* 5 Step nodes */}
      {STEPS.map((step, idx) => {
        const state = getStepState(idx);
        const IconComponent = step.icon;

        return (
          <div key={step.id} className={`stepper-step ${state}`}>
            <div className="stepper-circle">
              {state === 'completed' ? <Check size={16} strokeWidth={3} /> : <IconComponent size={16} />}
            </div>
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

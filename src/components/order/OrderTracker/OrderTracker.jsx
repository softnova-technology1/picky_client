import React from 'react';
import { useOrderTracking } from '../../../hooks/useOrderTracking';
import TrackingStepper from '.././TrackingStepper';
import AWBBox from '.././AWBBox';
import StatusTimeline from '.././StatusTimeline';
import Spinner from '../../ui/Spinner';

export default function OrderTracker({ orderId, initialData }) {
  const { data: liveData, isLoading } = useOrderTracking(orderId);
  const data = liveData?.data || initialData;

  if (isLoading && !data) {
    return <Spinner size={28} />;
  }

  if (!data) return null;

  return (
    <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Order Tracking
          </span>
          <h3 style={{ margin: '0.2rem 0 0' }}>Order #{data.orderNumber}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#16a34a', background: '#dcfce7', padding: '0.3rem 0.65rem', borderRadius: '9999px', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 1s infinite' }} />
          Auto-updating (30s)
        </div>
      </div>

      <TrackingStepper currentStatus={data.status} />

      <AWBBox
        trackingId={data.trackingId || 'DTDC-TN-' + (data.orderNumber ? data.orderNumber.replace(/\D/g, '') : '9823412')}
        courier={data.courier || 'DTDC Priority Air Express'}
      />

      {data.statusHistory && data.statusHistory.length > 0 && (
        <StatusTimeline statusHistory={data.statusHistory} />
      )}
    </div>
  );
}

import React from 'react';
import { useOrderTracking } from '../../../hooks/useOrderTracking';
import TrackingStepper from '../TrackingStepper';
import AWBBox from '../AWBBox';
import StatusTimeline from '../StatusTimeline';
import Spinner from '../../ui/Spinner';
import { Activity } from 'lucide-react';
import styles from './OrderTracker.module.css';

export default function OrderTracker({ orderId, initialData }) {
  const { data: liveData, isLoading } = useOrderTracking(orderId);
  const data = liveData?.data || initialData;

  if (isLoading && !data) {
    return <Spinner size={28} />;
  }

  if (!data) return null;

  return (
    <div className={styles.trackerCard}>
      <div className={styles.trackerHeader}>
        <div className={styles.headerTitleBox}>
          <span className={styles.liveTag}>
            <Activity size={15} />
            Live Shipment Tracker
          </span>
          <h3 className={styles.trackerMainTitle}>Order #{data.orderNumber}</h3>
        </div>
        <div className={styles.livePill}>
          <span className={styles.livePulseDot} />
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

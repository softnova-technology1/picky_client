import React, { useState } from 'react';
import { Copy, Check, Truck, ExternalLink } from 'lucide-react';
import styles from '../OrderTracker/OrderTracker.module.css';

export default function AWBBox({ trackingId, courier }) {
  const [copied, setCopied] = useState(false);

  if (!trackingId) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={styles.awbContainer}>
      <div>
        <div className={styles.awbLabel}>
          <Truck size={15} />
          Courier Partner: <span className={styles.courierBadge}>{courier || 'Express Delivery'}</span>
        </div>
        <div className={styles.awbNumberRow}>
          <span className={styles.awbCode}>{trackingId}</span>
          <button
            onClick={handleCopy}
            className={`${styles.copyAwbBtn} ${copied ? styles.copied : ''}`}
          >
            {copied ? (
              <>
                <Check size={16} /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy AWB
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.awbNoteText}>
        <ExternalLink size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
        <span>Track package live via courier portal using your AWB number. Real-time updates are also broadcast to WhatsApp.</span>
      </div>
    </div>
  );
}

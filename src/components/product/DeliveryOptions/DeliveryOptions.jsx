import React, { useState, useRef } from 'react';
import { Truck, CheckCircle2, Banknote, RotateCcw, X } from 'lucide-react';
import styles from './DeliveryOptions.module.css';

export default function DeliveryOptions() {
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem('picky_delivery_pincode') || '';
  });
  const [isVerified, setIsVerified] = useState(() => {
    return Boolean(localStorage.getItem('picky_delivery_pincode'));
  });
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const inputRef = useRef(null);

  // Dynamic delivery date calculation (3-4 days from today)
  const getEstimatedDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    return `${dayName}, ${monthName} ${dayNum}`;
  };

  const handleCheck = (e) => {
    e.preventDefault();
    const cleanPin = pincode.trim() || '614804'; // Default to example pin if submitted empty
    setPincode(cleanPin);
    setIsVerified(true);
    try {
      localStorage.setItem('picky_delivery_pincode', cleanPin);
    } catch (_) {}
  };

  const handleChange = () => {
    setIsVerified(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  };

  return (
    <div className={styles['delivery-container']}>
      {/* Title Header */}
      <div className={styles['delivery-header']}>
        <h4 className={styles['delivery-title']}>DELIVERY OPTIONS</h4>
        <Truck size={18} className={styles['delivery-truck-icon']} strokeWidth={2.2} />
      </div>

      {/* Pincode Check / Display Box */}
      {!isVerified ? (
        <form onSubmit={handleCheck}>
          <div className={styles['pincode-box']}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter pincode"
              className={styles['pincode-input']}
            />
            <button type="submit" className={styles['action-btn']}>
              Check
            </button>
          </div>
          <p className={styles['helper-text']}>
            Please enter PIN code to check delivery time &amp; Pay on Delivery Availability
          </p>
        </form>
      ) : (
        <div>
          <div className={styles['pincode-box']}>
            <div className={styles['checked-pincode-group']}>
              <span className={styles['checked-pincode-value']}>{pincode}</span>
              <CheckCircle2 size={17} color="#10b981" fill="#ecfdf5" strokeWidth={2.2} />
            </div>
            <button type="button" onClick={handleChange} className={styles['action-btn']}>
              Change
            </button>
          </div>

          {/* Verified Delivery Options List with Lucide Icons */}
          <div className={styles['delivery-features-list']}>
            {/* Speed delivery estimate */}
            <div className={styles['feature-row']}>
              <div className={styles['feature-left']}>
                <div className={styles['feature-icon-wrap']}>
                  <Truck size={19} color="#1e293b" strokeWidth={2} />
                </div>
                <span className={styles['feature-text']}>
                  Get it by {getEstimatedDate()}
                </span>
              </div>
            </div>

            {/* Pay on delivery */}
            <div className={styles['feature-row']}>
              <div className={styles['feature-left']}>
                <div className={styles['feature-icon-wrap']}>
                  <Banknote size={19} color="#1e293b" strokeWidth={2} />
                </div>
                <span className={styles['feature-text']}>
                  Pay on delivery available
                </span>
              </div>
            </div>

            {/* Easy 14 days return */}
            <div className={styles['feature-row']}>
              <div className={styles['feature-left']}>
                <div className={styles['feature-icon-wrap']}>
                  <RotateCcw size={19} color="#1e293b" strokeWidth={2} />
                </div>
                <span className={styles['feature-text']}>
                  Easy 14 days return available
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreInfo(true)}
                className={styles['more-info-link']}
              >
                MORE INFO &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Policy More Info Modal */}
      {showMoreInfo && (
        <div className={styles['info-modal-backdrop']} onClick={() => setShowMoreInfo(false)}>
          <div className={styles['info-modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['info-modal-header']}>
              <h3 className={styles['info-modal-title']}>Return &amp; Exchange Policy</h3>
              <button
                type="button"
                onClick={() => setShowMoreInfo(false)}
                className={styles['info-modal-close']}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
            <div className={styles['info-modal-body']}>
              <p>
                Easy 14 days return and exchange policy. Return pickup will be arranged at your doorstep at no extra cost.
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Product must be in original condition with tags intact.</li>
                <li>Refund will be initiated to your source payment method within 24 hours of pickup.</li>
                <li>Cash on Delivery orders will be refunded to your verified UPI or Bank account.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

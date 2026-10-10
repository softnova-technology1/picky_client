import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, ShieldCheck, Sparkles, Check } from 'lucide-react';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        const data = res?.data || res;
        if (data && (data.orderNumber || data._id)) {
          setOrder(data);
        }
      } catch (err) {
        console.warn('Failed to load order details from server:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id]);

  return (
    <PageWrapper>
      <div className={styles['success-section']}>
        <div className={styles['container']}>

          {/* ── 4-STEP STEPPER HEADER BAR WITH CONFIRM ACTIVE ── */}
          <div className={styles['stepper-wrapper']}>
            <div className={styles['stepper-header']}>
              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>BAG</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CHECKOUT</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>PAYMENT</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['active']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CONFIRM</span>
              </div>
            </div>
          </div>

          <div className={styles['success-card-wrapper']}>
            
            {/* Circle Checkmark Icon */}
            <div className={styles['check-icon-circle']}>
              <Check size={42} strokeWidth={3} />
            </div>

            {/* Thank You Title */}
            <h1 className={styles['success-title']}>
              Thank You for Choosing Picky Store
            </h1>

            {/* Subheading Quote */}
            <p className={styles['success-quote']}>
              "Your order has been successfully placed and our artisans are preparing your handcrafted order with the utmost care."
            </p>

            {/* Order Info Card */}
            {loading && !order ? (
              <div style={{ padding: '2rem 0' }}>
                <Spinner size={32} />
              </div>
            ) : order ? (
              <div className={styles['order-info-box']}>
                
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Order Number</span>
                  <strong className={styles['info-num']}>#{order.orderNumber}</strong>
                </div>

                {order.razorpayPaymentId && (
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>Payment Reference ID</span>
                    <strong className={styles['info-num']} style={{ color: '#656d4a', fontFamily: 'monospace' }}>
                      {order.razorpayPaymentId}
                    </strong>
                  </div>
                )}

                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Order Date</span>
                  <span className={styles['info-val']}>{formatDate(order.createdAt || new Date())}</span>
                </div>

                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Dispatch Mode</span>
                  <span className={styles['info-val']} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={16} color="#656d4a" /> {order.courier || 'Standard Courier Dispatch'}
                  </span>
                </div>

                <div className={styles['info-row-last']}>
                  <span className={styles['info-label']}>Total Paid</span>
                  <strong className={styles['info-total']}>{formatPrice(order.totalAmount || order.total || 0)}</strong>
                </div>

              </div>
            ) : null}

            {/* Action Buttons */}
            <div className={styles['actions-row']}>
              <Link
                to={`/orders/${id || order?._id || order?.orderNumber}`}
                className={`${styles['action-btn']} ${styles['primary']}`}
              >
                <span>Track Live Order Timeline</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className={`${styles['action-btn']} ${styles['secondary']}`}
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

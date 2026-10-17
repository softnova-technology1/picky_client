import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, ShieldCheck, Sparkles, Check, Gift } from 'lucide-react';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const startTime = Date.now();
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
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
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

                {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                  <div className={styles['info-row']} style={{ background: '#fff1f2', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    <span className={styles['info-label']} style={{ color: '#be123c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Gift size={15} /> Gift Wrapping
                    </span>
                    <span className={styles['info-val']} style={{ color: '#881337', fontWeight: 600 }}>
                      Included {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                    </span>
                  </div>
                )}

                <div className={styles['info-row-last']}>
                  <span className={styles['info-label']}>Total Paid</span>
                  <strong className={styles['info-total']}>{formatPrice(order.totalAmount || order.total || 0)}</strong>
                </div>

              </div>
            ) : null}

            {/* Action Buttons */}
            <div className={styles['actions-row']}>
              {order?.orderNumber && (
                <Link
                  to={`/track-order?id=${order.orderNumber}`}
                  className={`${styles['action-btn']} ${styles['primary']}`}
                >
                  <span>Track Live Order Timeline</span>
                  <ArrowRight size={18} />
                </Link>
              )}

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

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
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
        if (data) setOrder(data);
      } catch (err) {
        console.warn('Failed to load confirmed order details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id]);

  return (
    <PageWrapper>
      <div className={`section ${styles['success-section']}`}>
        <div className={`container ${styles['success-container']}`}>
          <div className={`card ${styles['success-card']}`}>
            {/* Animated Celebration Icon */}
            <div className={styles['check-icon-circle']}>
              <CheckCircle2 size={44} />
            </div>

            <div className={styles['verified-pill']}>
              <Sparkles size={16} /> Payment Verified & Confirmed
            </div>

            <h1 className={styles['success-title']}>
              Thank You For Your Order!
            </h1>

            <p className={styles['success-desc']}>
              Your festival order has been placed successfully. A real-time receipt and AWB dispatch update will be sent to your WhatsApp number.
            </p>

            {/* Order Details Mini Card */}
            {loading ? (
              <Spinner size={32} />
            ) : order ? (
              <div className={styles['order-info-box']}>
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Order Number</span>
                  <strong className={styles['info-num']}>#{order.orderNumber}</strong>
                </div>

                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Order Date</span>
                  <span className={styles['info-date']}>{formatDate(order.createdAt)}</span>
                </div>

                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Estimated Dispatch</span>
                  <span className={styles['info-dispatch']}>
                    <Truck size={15} /> 24-48 Hours Express
                  </span>
                </div>

                <div className={styles['info-row-last']}>
                  <span className={styles['info-label']}>Total Paid</span>
                  <strong className={styles['info-total']}>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className={styles['actions-row']}>
              <Link
                to={`/orders/${id}`}
                className={`btn btn-primary ${styles['action-btn']}`}
              >
                Track Live Order <ArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className={`btn btn-secondary ${styles['action-btn']}`}
              >
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { useOrderStore } from '../../store/orderStore';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { Package, Search, ArrowRight } from 'lucide-react';
import styles from './Orders.module.css';

export default function Orders() {
  const { orders: mockOrders } = useOrderStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderService.list();
        const apiOrders = res?.data?.data || res?.data || [];
        if (apiOrders.length > 0) {
          setOrders(apiOrders);
        } else {
          // Fallback: use shared mock order store (shows customer's session orders + mock seed)
          setOrders(mockOrders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [mockOrders]);

  return (
    <PageWrapper>
      <div className="section">
        <div className={`container ${styles['orders-container']}`}>
          <h1 className={styles['orders-title']}>My Orders</h1>
          <p className={styles['orders-subtitle']}>Track and manage all your festival purchases and deliveries in real-time.</p>

          {loading ? (
            <Spinner size={36} />
          ) : orders.length === 0 ? (
            <div className={`card ${styles['empty-card']}`}>
              <div className={styles['empty-icon-wrap']}>
                <Package size={40} />
              </div>
              <h3>No Orders Placed Yet</h3>
              <p className={styles['empty-desc']}>
                When you place an order, you will be able to track live shipping updates and AWB details right here.
              </p>
              <Link to="/products" className={`btn btn-primary ${styles['shop-now-btn']}`}>
                Start Shopping Now <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className={styles['orders-list']}>
              {orders.map((order) => (
                <div key={order._id} className={`card ${styles['order-card']}`}>
                  <div className={styles['order-card-header']}>
                    <div>
                      <span className={styles['order-num-label']}>Order Number</span>
                      <h4 className={styles['order-num-title']}>#{order.orderNumber}</h4>
                      <span className={styles['order-date-text']}>Placed on {formatDate(order.createdAt)}</span>
                    </div>

                    <div className={styles['order-actions']}>
                      <Badge status={order.status} />
                      <Link to={`/orders/${order._id}`} className={`btn btn-outline btn-sm ${styles['track-order-btn']}`}>
                        <Search size={14} /> Track Order
                      </Link>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className={styles['order-items-scroll']}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className={styles['order-item-chip']}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                          alt={item.name}
                          className={styles['order-item-img']}
                        />
                        <div className={styles['order-item-info']}>
                          <span className={styles['order-item-name']}>
                            {item.name}
                          </span>
                          <span className={styles['order-item-qty']}>
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles['order-card-footer']}>
                    <span className={styles['order-payment-text']}>
                      Payment: <strong className={styles['order-payment-method']}>{order.paymentMethod || order.courier || 'Online'}</strong>
                    </span>
                    <div>
                      <span className={styles['order-total-label']}>Total:</span>
                      <strong className={styles['order-total-value']}>{formatPrice(order.totalAmount || order.total)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

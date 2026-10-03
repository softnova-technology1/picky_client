import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { useOrderStore } from '../../store/orderStore';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { Package, Search, ArrowRight, Filter } from 'lucide-react';
import styles from './Orders.module.css';

export default function Orders() {
  const { orders: mockOrders } = useOrderStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderService.list();
        const apiOrders = res?.data?.data || res?.data || [];
        if (apiOrders.length > 0) {
          setOrders(apiOrders);
        } else {
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

  const filterOptions = [
    { key: 'all', label: 'All Orders', color: '#7c3aed', bg: '#ede9fe', activeBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', activeColor: '#fff' },
    { key: 'confirmed', label: 'Confirmed', color: '#0369a1', bg: '#e0f2fe', activeBg: 'linear-gradient(135deg, #0284c7, #0369a1)', activeColor: '#fff' },
    { key: 'packing', label: 'Packing', color: '#7c3aed', bg: '#f3e8ff', activeBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', activeColor: '#fff' },
    { key: 'shipped', label: 'Shipping', color: '#b45309', bg: '#fef3c7', activeBg: 'linear-gradient(135deg, #d97706, #b45309)', activeColor: '#fff' },
    { key: 'delivered', label: 'Delivered', color: '#15803d', bg: '#dcfce7', activeBg: 'linear-gradient(135deg, #16a34a, #15803d)', activeColor: '#fff' },
    { key: 'cancelled', label: 'Cancelled', color: '#b91c1c', bg: '#fee2e2', activeBg: 'linear-gradient(135deg, #dc2626, #b91c1c)', activeColor: '#fff' },
  ];

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter((o) => {
        const st = (o.status || '').toLowerCase();
        if (orderFilter === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
        return st === orderFilter;
      });

  return (
    <PageWrapper>
      <div className="section">
        <div className={`container ${styles['orders-container']}`}>
          <h1 className={styles['orders-title']}>My Orders</h1>
          <p className={styles['orders-subtitle']}>Track and manage all your festival purchases and deliveries in real-time.</p>

          {!loading && orders.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                margin: '1.25rem 0 1.75rem',
                padding: '0.85rem 1rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #ede9fe',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.05)',
              }}
            >
              <Filter size={15} color="#7c3aed" style={{ marginRight: '0.25rem', flexShrink: 0 }} />
              {filterOptions.map((opt) => {
                const isActive = orderFilter === opt.key;
                const statusCount = opt.key === 'all'
                  ? orders.length
                  : orders.filter((o) => {
                      const st = (o.status || '').toLowerCase();
                      if (opt.key === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                      return st === opt.key;
                    }).length;
                if (opt.key !== 'all' && statusCount === 0) return null;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setOrderFilter(opt.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: isActive ? opt.activeBg : opt.bg,
                      color: isActive ? opt.activeColor : opt.color,
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {opt.label}
                    <span
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                        borderRadius: '999px',
                        padding: '0 0.42rem',
                        fontSize: '0.72rem',
                      }}
                    >
                      {statusCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
          ) : filteredOrders.length === 0 ? (
            <div className={`card ${styles['empty-card']}`} style={{ padding: '2.5rem 1.5rem' }}>
              <Package size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                No <strong>{orderFilter}</strong> orders found.
              </p>
            </div>
          ) : (
            <div className={styles['orders-list']}>
              {filteredOrders.map((order) => (
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
                      Payment: <strong className={styles['order-payment-method']}>{order.paymentMethod || (order.paymentStatus === 'Paid' || order.isPaid ? 'Prepaid (Card/UPI)' : 'Online')}</strong>
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

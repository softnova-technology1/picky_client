import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { orderService } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderService.list();
        setOrders(res?.data?.data || res?.data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>My Orders</h1>
          <p style={{ marginBottom: '2rem' }}>Track and manage all your purchases and deliveries in real-time.</p>

          {loading ? (
            <Spinner size={36} />
          ) : orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>📦</span>
              <h3>No Orders Placed Yet</h3>
              <p style={{ maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                When you place an order, you will be able to track live shipping updates and AWB details right here.
              </p>
              <Link to="/products" className="btn btn-primary">
                Start Shopping Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => (
                <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order Number</span>
                      <h4 style={{ margin: '0.1rem 0 0.25rem', fontSize: '1.1rem' }}>#{order.orderNumber}</h4>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Placed on {formatDate(order.createdAt)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Badge status={order.status} />
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                        Track Order 🔍
                      </Link>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                          alt={item.name}
                          style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748b' }}>
                      Payment: <strong style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</strong>
                    </span>
                    <div>
                      <span style={{ color: '#64748b', marginRight: '0.5rem' }}>Total:</span>
                      <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{formatPrice(order.total)}</strong>
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

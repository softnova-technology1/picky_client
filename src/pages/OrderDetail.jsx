import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import OrderTracker from '../components/order/OrderTracker';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { orderService } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        setOrder(res?.data || res);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="section"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Order Not Found</h2>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to My Orders
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            <Link to="/orders">My Orders</Link> ➔ <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Order #{order.orderNumber}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Order #{order.orderNumber}</h1>
              <p style={{ margin: 0, color: '#475569' }}>
                Placed on {formatDate(order.createdAt)} • <span style={{ color: '#16a34a', fontWeight: 600 }}>💳 Paid via Razorpay</span>
                {order.razorpayPaymentId && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>({order.razorpayPaymentId})</span>}
              </p>
            </div>
            <Badge status={order.status} />
          </div>

          {/* Live Order Tracker */}
          <OrderTracker orderId={order._id} initialData={order} />

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Items Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                Purchased Items ({order.items?.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                        {item.name}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Invoice Breakdown */}
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount Applied</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Delivery</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                Delivery Address
              </h3>
              <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.92rem' }}>
                <strong>{order.shippingAddress?.street}</strong><br />
                {order.shippingAddress?.landmark && <span>Landmark: {order.shippingAddress.landmark}<br /></span>}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.82rem', color: '#64748b' }}>
                💬 <strong>Need Help with this Order?</strong><br />
                Reach out to our customer support team or reply directly on your WhatsApp order thread.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

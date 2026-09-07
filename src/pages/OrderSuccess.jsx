import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import { orderService } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/formatDate';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

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
      <div className="section" style={{ minHeight: '85vh', background: '#faf5ff', display: 'flex', alignItems: 'center', padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div
            className="card"
            style={{
              padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)',
              borderRadius: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(124, 58, 237, 0.12)',
              border: '1px solid #e9d5ff',
              background: '#ffffff',
            }}
          >
            {/* Animated Celebration Icon */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
              }}
            >
              <CheckCircle2 size={44} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              <Sparkles size={16} /> Payment Verified & Confirmed
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: '#0f172a', margin: '0 0 0.5rem' }}>
              Thank You For Your Order!
            </h1>

            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 auto 1.75rem', maxWidth: '480px' }}>
              Your festival order has been placed successfully. A real-time receipt and AWB dispatch update will be sent to your WhatsApp number.
            </p>

            {/* Order Details Mini Card */}
            {loading ? (
              <Spinner size={32} />
            ) : order ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  textAlign: 'left',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Number</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>#{order.orderNumber}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Date</span>
                  <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{formatDate(order.createdAt)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Estimated Dispatch</span>
                  <span style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={15} /> 24-48 Hours Express
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Paid</span>
                  <strong style={{ fontSize: '1.2rem', color: '#7c3aed' }}>{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to={`/orders/${id}`}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.95rem',
                }}
              >
                Track Live Order <ArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className="btn btn-secondary"
                style={{
                  padding: '0.85rem 1.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.95rem',
                }}
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

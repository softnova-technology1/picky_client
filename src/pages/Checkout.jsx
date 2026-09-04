import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { orderService } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, couponDiscount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useUiStore();

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.line1 || '',
    city: user?.addresses?.[0]?.city || 'Chennai',
    state: user?.addresses?.[0]?.state || 'Tamil Nadu',
    pincode: user?.addresses?.[0]?.pincode || '',
    landmark: '',
  });

  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const total = Math.max(0, subtotal - (couponDiscount || 0));

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>No items to checkout</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Store
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address.street.trim() || !address.pincode.trim()) {
      showToast('Please fill in complete delivery address details', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await orderService.checkout({ shippingAddress: address });
      const order = res?.data || res;

      clearCart();
      showToast('🎉 Order placed successfully! Check your WhatsApp for updates.', 'success');
      navigate(`/orders/${order._id || order.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            <Link to="/cart">Cart</Link> ➔ <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Checkout</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Checkout & Delivery</h1>

          <form onSubmit={handleSubmitOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
              {/* Address Details Left */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  1. Delivery Address
                </h3>

                <Input
                  label="Street Address / Door No / Flat"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  placeholder="e.g. Flat 3B, Sunshine Apartments, 12th Cross Road"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <Input
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="PIN Code"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 600028"
                    required
                  />
                </div>

                <Input
                  label="Landmark (Optional)"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Apollo Hospital"
                />

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                    2. Payment Method
                  </h3>
                  <div style={{ padding: '1rem 1.25rem', border: '2px solid var(--color-primary)', borderRadius: '8px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="radio" checked readOnly style={{ accentColor: 'var(--color-primary)' }} />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-primary-dark)' }}>💵 Cash on Delivery (COD)</strong>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>Pay safely when your package arrives at your doorstep.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Right */}
              <div className="card" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  Order Review ({items.length} items)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                      <span style={{ color: '#334155', maxWidth: '65%' }}>
                        {item.quantity} × {item.name}
                      </span>
                      <strong style={{ color: '#0f172a' }}>
                        {formatPrice((item.discountPrice || item.price || 0) * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Shipping</span>
                    <strong style={{ color: '#16a34a' }}>FREE</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <span>Total Pay</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  loading={loading}
                >
                  Confirm Order & Place (COD) ➔
                </Button>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  💬 You will receive immediate WhatsApp confirmation with order summary.
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

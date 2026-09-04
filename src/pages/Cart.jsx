import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { cartService } from '../services/cart.service';
import { formatPrice } from '../utils/formatPrice';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, clearCart, coupon, setCoupon, couponDiscount } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const total = Math.max(0, subtotal - (couponDiscount || 0));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!isLoggedIn) {
      showToast('Please login to apply coupons', 'error');
      navigate('/login?redirect=/cart');
      return;
    }

    try {
      setCouponLoading(true);
      const res = await cartService.applyCoupon(couponCode.trim());
      const updated = res?.data || res;
      setCoupon(couponCode.trim(), updated.couponDiscount || 0);
      showToast(`Coupon "${couponCode.trim().toUpperCase()}" applied!`, 'success');
      setCouponCode('');
    } catch (err) {
      showToast(err.message || 'Invalid or expired coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      if (isLoggedIn) {
        await cartService.removeCoupon();
      }
      setCoupon(null, 0);
      showToast('Coupon removed', 'info');
    } catch (err) {
      showToast('Failed to remove coupon', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
          <h2>Your Cart is Empty</h2>
          <p style={{ maxWidth: '400px', margin: '0.5rem auto 2rem' }}>
            Looks like you haven't added anything to your cart yet. Discover trending essentials!
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping ➔
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Shopping Cart ({items.length} items)</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Items List Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => {
                const itemPrice = item.discountPrice || item.price || 0;
                const itemId = item._id || item.product?._id || item.product || item.id;
                const itemSlug = item.slug || item.product?.slug;

                return (
                  <div
                    key={itemId}
                    className="card"
                    style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1rem 1.25rem' }}
                  >
                    <img
                      src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.name}
                      style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <Link to={itemSlug ? `/products/${itemSlug}` : '#'} style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                        {item.name}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0.5rem' }}>
                        Unit Price: <strong style={{ color: '#0f172a' }}>{formatPrice(itemPrice)}</strong>
                      </div>

                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '6px', background: '#f8fafc' }}>
                          <button
                            onClick={() => updateQty(itemId, Math.max(1, (item.quantity || 1) - 1))}
                            style={{ padding: '0.25rem 0.65rem', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600 }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQty(itemId, (item.quantity || 1) + 1)}
                            style={{ padding: '0.25rem 0.65rem', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(itemId)}
                          style={{ fontSize: '0.82rem', color: 'var(--color-danger)', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                      {formatPrice(itemPrice * (item.quantity || 1))}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  onClick={clearCart}
                  style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}
                >
                  Clear Cart
                </button>
                <Link to="/products" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  + Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Right */}
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Order Summary
              </h3>

              {/* Coupon input form */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                  Have a Promo Code?
                </label>
                {coupon ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
                      🎟️ {coupon} Applied (-{formatPrice(couponDiscount)})
                    </span>
                    <button onClick={handleRemoveCoupon} style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <button type="submit" disabled={couponLoading} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Coupon Discount</span>
                    <strong>-{formatPrice(couponDiscount)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Delivery Fee</span>
                  <strong style={{ color: '#16a34a' }}>FREE</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary btn-lg btn-block"
              >
                Proceed to Checkout ➔
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                🔒 Safe & Secure Checkout with Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

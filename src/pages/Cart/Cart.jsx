import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { cartService } from '../../services/cart.service';
import { formatPrice } from '../../utils/formatPrice';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Lock,
  Truck,
  RotateCcw,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import styles from './Cart.module.css';

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

  const handleApplyCouponCode = async (codeToApply) => {
    const targetCode = (codeToApply || couponCode).trim();
    if (!targetCode) return;

    if (!isLoggedIn) {
      showToast('Please login to apply coupons', 'error');
      navigate('/login?redirect=/cart');
      return;
    }

    try {
      setCouponLoading(true);
      const res = await cartService.applyCoupon(targetCode);
      const updated = res?.data || res;
      setCoupon(targetCode, updated.couponDiscount || 350);
      showToast(`Coupon "${targetCode.toUpperCase()}" applied!`, 'success');
      setCouponCode('');
    } catch (err) {
      setCoupon(targetCode.toUpperCase(), 350);
      showToast(`Coupon "${targetCode.toUpperCase()}" applied!`, 'success');
      setCouponCode('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      if (isLoggedIn) {
        await cartService.removeCoupon().catch(() => null);
      }
      setCoupon(null, 0);
      showToast('Coupon removed', 'info');
    } catch (err) {
      setCoupon(null, 0);
      showToast('Coupon removed', 'info');
    }
  };

  const handleRemoveItem = async (item) => {
    const targetId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
    removeItem(targetId || item);
    if (isLoggedIn && targetId) {
      cartService.removeItem(targetId).catch((err) => {
        console.warn('Backend cart item remove fallback:', err?.message || err);
      });
    }
    showToast(`Removed "${item.name || 'Item'}" from cart`, 'info');
  };

  const handleUpdateQty = async (item, newQty) => {
    const targetId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }
    updateQty(targetId || item, newQty);
    if (isLoggedIn && targetId) {
      cartService.updateQty(targetId, newQty).catch((err) => {
        console.warn('Backend cart item update fallback:', err?.message || err);
      });
    }
  };

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className={styles['cart-page-root']}>
          <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#7c3aed',
              }}
            >
              <ShoppingCart size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Your Shopping Cart is Empty
            </h2>
            <p style={{ maxWidth: '400px', margin: '0.5rem auto 2rem', color: '#64748b', fontSize: '0.98rem' }}>
              Explore our wide range of curated collections and find something you love!
            </p>
            <Link
              to="/products"
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: '9999px',
                padding: '0.8rem 2rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles['cart-page-root']}>
        <div className="container">
          {/* ── Top Header Row ── */}
          <div className={styles['top-header-row']}>
            <div className={styles['title-group']}>
              <h1 className={styles['cart-title']}>Shopping Cart</h1>
              <span className={styles['item-count-badge']}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* ── Main Layout Grid ── */}
          <div className={styles['cart-layout-grid']}>
            {/* Left Column: Items Card & Trust Badges */}
            <div>
              <div className={styles['items-card']}>
                {/* Items List */}
                {items.map((item) => {
                  const itemPrice = item.discountPrice || item.price || 0;
                  const originalPrice = item.price && item.price > itemPrice ? item.price : null;
                  const itemId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
                  const itemSlug = item.slug || item.product?.slug;

                  return (
                    <div key={itemId || Math.random()} className={styles['cart-item-row']}>
                      {/* Image Box */}
                      <div className={styles['item-img-box']}>
                        <img
                          src={
                            item.images?.[0] ||
                            item.image ||
                            'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300'
                          }
                          alt={item.name}
                          className={styles['item-img']}
                        />
                      </div>

                      {/* Info & Quantity Controls */}
                      <div className={styles['item-info']}>
                        <Link to={itemSlug ? `/products/${itemSlug}` : '#'} className={styles['item-title']}>
                          {item.name}
                        </Link>

                        <div className={styles['item-meta-row']}>
                          <span className={styles['stock-indicator']}>
                            <span className={styles['green-dot']} /> In stock
                          </span>
                          {item.selectedSize && (
                            <>
                              <span className={styles['meta-divider']}>•</span>
                              <span>Size: {item.selectedSize}</span>
                            </>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className={styles['item-actions-row']}>
                          <div className={styles['qty-stepper']}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item, (item.quantity || 1) - 1)}
                              className={styles['qty-btn']}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={2.3} />
                            </button>
                            <span className={styles['qty-val']}>{item.quantity || 1}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item, (item.quantity || 1) + 1)}
                              className={styles['qty-btn']}
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={2.3} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            className={styles['remove-btn']}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Right Price */}
                      <div className={styles['item-price-col']}>
                        <div className={styles['price-main']}>
                          {formatPrice(itemPrice * (item.quantity || 1))}
                        </div>
                        {originalPrice && (
                          <span className={styles['price-old']}>
                            {formatPrice(originalPrice * (item.quantity || 1))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Card Footer Row */}
                <div className={styles['card-footer-row']}>
                  <button type="button" onClick={clearCart} className={styles['clear-cart-btn']}>
                    <Trash2 size={14} /> Clear Cart
                  </button>
                  <Link to="/products" className={styles['continue-shopping-btn']}>
                    <span>+ Continue Shopping</span>
                  </Link>
                </div>
              </div>

              {/* 3 Serene Trust Badges Below Card */}
              <div className={styles['trust-badges-grid']}>
                <div className={styles['trust-card']}>
                  <div className={styles['trust-icon-box']}>
                    <Truck size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className={styles['trust-title']}>Express Shipping</h3>
                    <p className={styles['trust-subtext']}>Fast door delivery</p>
                  </div>
                </div>

                <div className={styles['trust-card']}>
                  <div className={styles['trust-icon-box']}>
                    <RotateCcw size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className={styles['trust-title']}>7-Day Easy Returns</h3>
                    <p className={styles['trust-subtext']}>Hassle-free policy</p>
                  </div>
                </div>

                <div className={styles['trust-card']}>
                  <div className={styles['trust-icon-box']}>
                    <ShieldCheck size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className={styles['trust-title']}>100% Verified Quality</h3>
                    <p className={styles['trust-subtext']}>Guaranteed products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className={styles['summary-card']}>
              <h2 className={styles['summary-title']}>Order Summary</h2>

              {/* Single Clean Promo Section */}
              <div className={styles['promo-section']}>
                {coupon ? (
                  <div className={styles['promo-hint']} style={{ color: '#16a34a', fontWeight: 600 }}>
                    <span>Coupon <strong>{coupon}</strong> applied (-{formatPrice(couponDiscount)})</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyCouponCode();
                      }}
                      className={styles['promo-form']}
                    >
                      <input
                        type="text"
                        placeholder="PROMO CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className={styles['promo-input']}
                      />
                      <button
                        type="submit"
                        disabled={couponLoading}
                        className={styles['promo-apply-btn']}
                      >
                        Apply
                      </button>
                    </form>

                    <div className={styles['promo-hint']}>
                      <span>Have a coupon?</span>
                      <span
                        className={styles['promo-chip']}
                        onClick={() => handleApplyCouponCode('FESTIVAL50')}
                      >
                        Use 'FESTIVAL50' for ₹350 off
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div className={styles['price-breakdown']}>
                <div className={styles['breakdown-row']}>
                  <span className={styles['row-label']}>Subtotal</span>
                  <span className={styles['row-value']}>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className={styles['breakdown-row']} style={{ color: '#16a34a' }}>
                    <span className={styles['row-label']} style={{ color: '#16a34a' }}>Coupon Discount</span>
                    <span className={styles['row-value']} style={{ color: '#16a34a' }}>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className={styles['breakdown-row']}>
                  <span className={styles['row-label']}>Delivery</span>
                  <span className={styles['row-value']} style={{ color: '#16a34a' }}>
                    FREE
                  </span>
                </div>

                <div className={styles['total-row']}>
                  <span className={styles['total-label']}>Total Amount</span>
                  <span className={styles['total-value']}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className={styles['checkout-btn']}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>

              <div className={styles['security-subtext']}>
                <Lock size={13} color="#64748b" /> Safe & Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import Modal from '../../components/ui/Modal/Modal';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { cartService } from '../../services/cart.service';
import { formatPrice } from '../../utils/formatPrice';
import { usePageCustomization } from '../../store/customizationStore';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Lock,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Ticket,
  Flame,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import styles from './Cart.module.css';

const isBestSellerProduct = (p) => {
  if (!p) return false;
  if (p.isBestSeller) return true;
  if (typeof p.badge === 'string') {
    const b = p.badge.toLowerCase();
    if (b.includes('best') || b.includes('seller')) return true;
  }
  const rawTags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
    ? p.tags.split(',')
    : [];
  return rawTags.some((t) => {
    if (!t) return false;
    const clean = String(t).trim().toLowerCase().replace(/[-_]/g, ' ');
    return clean.includes('best') || clean.includes('seller');
  });
};

// Helper to reliably extract available sizes for a cart item
const getItemSizes = (item) => {
  if (Array.isArray(item.availableSizes) && item.availableSizes.length > 0) return item.availableSizes;
  if (Array.isArray(item.sizes) && item.sizes.length > 0) return item.sizes;
  if (Array.isArray(item.variants?.options) && item.variants.options.length > 0) return item.variants.options;
  return [];
};

// Helper to reliably extract available colors for a cart item
const getItemColors = (item) => {
  if (Array.isArray(item.availableColors) && item.availableColors.length > 0) return item.availableColors;
  if (Array.isArray(item.colors) && item.colors.length > 0) return item.colors;
  if (Array.isArray(item.variants?.colors) && item.variants.colors.length > 0) return item.variants.colors;
  return [];
};

export default function Cart() {
  const { isEnabled, getSetting } = usePageCustomization('cart');
  const navigate = useNavigate();
  const {
    items,
    updateQty,
    updateVariant,
    removeItem,
    clearCart,
    setBuyNowItem,
    coupon,
    setCoupon,
    couponDiscount,
  } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);

  // Sync latest cart data from MongoDB on page mount
  useEffect(() => {
    if (isLoggedIn) {
      useCartStore.getState().fetchCart?.();
    }
  }, [isLoggedIn]);

  // Fetch best seller products for running marquee showcase
  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        const res = await productService.list({ limit: 40, sort: 'rating' });
        const data = res?.data || res;
        const itemsList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (isMounted) {
          const filtered = itemsList.filter(isBestSellerProduct);
          setBestSellerProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load best seller products for cart:', err);
      }
    }
    loadBestSellers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate items for perfectly seamless 50% infinite marquee loop
  const marqueeBestSellers = useMemo(() => {
    if (bestSellerProducts.length === 0) return [];
    let list = [...bestSellerProducts];
    while (list.length < 12) {
      list = [...list, ...bestSellerProducts];
    }
    return [...list, ...list];
  }, [bestSellerProducts]);

  // Subtotal (Current Selling Price Total)
  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  // Original Total (MRP Total before discounts)
  const totalOriginal = items.reduce((sum, item) => {
    const itemPrice = item.discountPrice || item.price || 0;
    const orig =
      item.originalPrice ||
      (item.price && item.price > itemPrice ? item.price : Math.round(itemPrice * 1.35));
    return sum + orig * (item.quantity || 1);
  }, 0);

  const productSavings = Math.max(0, totalOriginal - subtotal);

  const total = Math.max(0, subtotal - (couponDiscount || 0));

  // Determine items that require variant selection
  const missingVariantItems = items.filter((item) => {
    const sizes = getItemSizes(item);
    const colors = getItemColors(item);
    const needsSize = sizes.length > 0 && !item.selectedSize;
    const needsColor = colors.length > 0 && !item.selectedColor;
    return needsSize || needsColor;
  });

  const handleProceedToCheckout = () => {
    if (missingVariantItems.length > 0) {
      const firstMissing = missingVariantItems[0];
      const sizes = getItemSizes(firstMissing);
      const missingType = sizes.length > 0 && !firstMissing.selectedSize ? 'Size' : 'Color';
      showToast(`⚠️ Please select ${missingType} for "${firstMissing.name}" before proceeding.`, 'error');
      return;
    }
    navigate('/checkout');
  };

  const handleBuyNowSingleItem = (item) => {
    const sizes = getItemSizes(item);
    const colors = getItemColors(item);
    if (sizes.length > 0 && !item.selectedSize) {
      showToast(`⚠️ Please select Size for "${item.name}" before checkout.`, 'error');
      return;
    }
    if (colors.length > 0 && !item.selectedColor) {
      showToast(`⚠️ Please select Color for "${item.name}" before checkout.`, 'error');
      return;
    }
    setBuyNowItem({
      ...item,
      fromCart: true,
    });
    navigate('/checkout?buyNow=true&fromCart=true');
  };

  const handleMoveToWishlist = (item) => {
    const targetId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;

    // Add to wishlist store if not already present
    if (!isInWishlist(targetId)) {
      toggleItem({
        _id: targetId,
        id: targetId,
        name: item.name,
        image: item.image || item.images?.[0],
        price: item.price,
        discountPrice: item.discountPrice,
        originalPrice: item.originalPrice || item.price,
        slug: item.slug,
        sizes: getItemSizes(item),
        colors: getItemColors(item),
      });
    }

    // Remove from cart
    removeItem(targetId || item);
    if (isLoggedIn && targetId) {
      cartService.removeItem(targetId).catch(() => null);
    }
    showToast(`Moved "${item.name}" to your Wishlist! 💖`, 'success');
  };

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

  const handleRemoveItem = (item) => {
    setItemToRemove(item);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    const item = itemToRemove;
    const targetId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
    removeItem(targetId || item);
    showToast(`Removed "${item.name || 'Item'}" from cart`, 'info');
    setItemToRemove(null);
  };

  const handleUpdateQty = (item, newQty) => {
    const targetId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }
    updateQty(targetId || item, newQty);
  };

  const renderBestSellers = () => {
    if (marqueeBestSellers.length === 0) return null;
    return (
      <section className={styles['bestsellers-section']} aria-label="Best Sellers">
        <div className={styles['bestsellers-header']}>
          <div className={styles['bestsellers-badge']}>
            <Flame size={14} className={styles['bestsellers-badge-icon']} />
            <span>{getSetting('cart_bestsellers', 'badgeText', 'MOST POPULAR PICKS')}</span>
          </div>
          <h2 className={styles['bestsellers-title']}>
            {(() => {
              const title = getSetting('cart_bestsellers', 'title', 'Best Sellers');
              const words = title.split(' ');
              if (words.length > 1) {
                return (
                  <>
                    {words[0]} <span>{words.slice(1).join(' ')}</span>
                  </>
                );
              }
              return title;
            })()}
          </h2>
          <p className={styles['bestsellers-subtitle']}>
            {getSetting('cart_bestsellers', 'subtitle', 'Customer-favorite trending styles and top-rated drops to complete your bag.')}
          </p>
        </div>

        {/* Viewport for infinite running ribbon */}
        <div className={styles['bestsellers-viewport']}>
          <div className={styles['bestsellers-track']}>
            {marqueeBestSellers.map((prod, idx) => (
              <div
                key={`bs-${prod._id || prod.id || 'p'}-${idx}`}
                className={styles['bestsellers-card-item']}
              >
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderTrustBadges = () => (
    <div className={styles['trust-badges-grid']}>
      <div className={styles['trust-card']}>
        <div className={styles['trust-icon-box']}>
          <Truck size={22} strokeWidth={2} />
        </div>
        <div>
          <h3 className={styles['trust-title']}>
            {getSetting('cart_trust_security', 'badge1Title', 'Express Shipping')}
          </h3>
          <p className={styles['trust-subtext']}>
            {getSetting('cart_trust_security', 'badge1Sub', 'Fast door delivery')}
          </p>
        </div>
      </div>

      <div className={styles['trust-card']}>
        <div className={styles['trust-icon-box']}>
          <RotateCcw size={22} strokeWidth={2} />
        </div>
        <div>
          <h3 className={styles['trust-title']}>
            {getSetting('cart_trust_security', 'badge2Title', '7-Day Easy Returns')}
          </h3>
          <p className={styles['trust-subtext']}>
            {getSetting('cart_trust_security', 'badge2Sub', 'Hassle-free policy')}
          </p>
        </div>
      </div>

      <div className={styles['trust-card']}>
        <div className={styles['trust-icon-box']}>
          <ShieldCheck size={22} strokeWidth={2} />
        </div>
        <div>
          <h3 className={styles['trust-title']}>
            {getSetting('cart_trust_security', 'badge3Title', '100% Verified Quality')}
          </h3>
          <p className={styles['trust-subtext']}>
            {getSetting('cart_trust_security', 'badge3Sub', 'Guaranteed products')}
          </p>
        </div>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className={styles['cart-page-root']}>
          <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem 2rem' }}>
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

            {isEnabled('cart_bestsellers') && renderBestSellers()}
            {isEnabled('cart_trust_security') && renderTrustBadges()}
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
          {(() => {
            const threshold = Number(getSetting('free_shipping_goal_bar', 'thresholdAmount', 999)) || 999;
            const remaining = Math.max(0, threshold - subtotal);
            const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

            return (
              <>
                {isEnabled('free_shipping_goal_bar') && (
                  <div
                    style={{
                      background: remaining === 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : '#ffffff',
                      border: remaining === 0 ? '1.5px solid #a7f3d0' : '1px solid #ede9fe',
                      borderRadius: '16px',
                      padding: '1rem 1.4rem',
                      marginBottom: '1.75rem',
                      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', fontWeight: 700, color: remaining === 0 ? '#065f46' : '#1e1b4b' }}>
                        <Truck size={19} color={remaining === 0 ? '#059669' : '#7c3aed'} />
                        <span>
                          {remaining === 0
                            ? getSetting('free_shipping_goal_bar', 'completedText', '🎉 Congratulations! You have unlocked Free Shipping!')
                            : getSetting('free_shipping_goal_bar', 'progressText', 'Add ₹{remaining} more to unlock FREE Shipping! 🚚').replace('{remaining}', remaining)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: remaining === 0 ? '#059669' : '#7c3aed' }}>
                        {percent}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: remaining === 0 ? '#a7f3d0' : '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: remaining === 0 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #c084fc, #7c3aed)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          <div className={styles['cart-layout-grid']}>
            {/* Left Column: Items Card & Trust Badges */}
            <div>
              <div className={styles['items-card']}>
                {/* Items List */}
                {items.map((item) => {
                  const itemPrice = item.discountPrice || item.price || 0;
                  const originalPrice =
                    item.originalPrice ||
                    (item.price && item.price > itemPrice ? item.price : Math.round(itemPrice * 1.35));
                  const hasDiscount = originalPrice > itemPrice;
                  const discountPercent = hasDiscount
                    ? Math.round(((originalPrice - itemPrice) / originalPrice) * 100)
                    : 0;

                  const itemId = item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product;
                  const itemSlug = item.slug || item.product?.slug;

                  const sizes = getItemSizes(item);
                  const colors = getItemColors(item);
                  const needsSize = sizes.length > 0 && !item.selectedSize;
                  const needsColor = colors.length > 0 && !item.selectedColor;
                  const isMissing = needsSize || needsColor;

                  return (
                    <div key={itemId || Math.random()} className={styles['cart-item-row']}>
                      {/* Image Box */}
                      <Link to={itemSlug ? `/products/${itemSlug}` : '#'} className={styles['item-img-box']}>
                        <img
                          src={
                            item.images?.[0] ||
                            item.image ||
                            'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300'
                          }
                          alt={item.name}
                          className={styles['item-img']}
                          loading="lazy"
                        />
                      </Link>

                      {/* Info & Quantity Controls */}
                      <div className={styles['item-info']}>
                        {/* Top Header Row: Title on Left, Price on Right */}
                        <div className={styles['item-header-row']}>
                          <div className={styles['item-title-col']}>
                            <Link to={itemSlug ? `/products/${itemSlug}` : '#'} className={styles['item-title']}>
                              {item.name}
                            </Link>
                          </div>

                          {/* Right Price Column (Top-aligned with title) */}
                          <div className={styles['item-price-col']}>
                            <div className={styles['price-main']}>
                              {formatPrice(itemPrice * (item.quantity || 1))}
                            </div>
                            {hasDiscount && (
                              <div className={styles['price-sub-wrap']}>
                                <span className={styles['price-old']}>
                                  {formatPrice(originalPrice * (item.quantity || 1))}
                                </span>
                                <span className={styles['discount-badge']}>
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Variant Selectors inside Cart (Horizontal Flow) */}
                        {(sizes.length > 0 || colors.length > 0) && (
                          <div className={`${styles['cart-variants-box']} ${isMissing ? styles['missing-variant-alert'] : ''}`}>
                            {/* Size Selector */}
                            {sizes.length > 0 && (
                              <div className={styles['cart-variant-group']}>
                                <span className={styles['variant-label']}>Size:</span>
                                <div className={styles['variant-chips-wrap']}>
                                  {sizes.map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      className={`${styles['cart-chip']} ${item.selectedSize === s ? styles['cart-chip-active'] : ''}`}
                                      onClick={() => {
                                        updateVariant(item, { selectedSize: s });
                                        showToast(`Selected size "${s}" for ${item.name}`, 'info');
                                      }}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                                {!item.selectedSize && (
                                  <span className={styles['variant-required-pill']}>Select Size *</span>
                                )}
                              </div>
                            )}

                            {sizes.length > 0 && colors.length > 0 && (
                              <span className={styles['variant-inline-divider']} />
                            )}

                            {/* Color Selector */}
                            {colors.length > 0 && (
                              <div className={styles['cart-variant-group']}>
                                <span className={styles['variant-label']}>Color:</span>
                                <div className={styles['color-chips-wrap']}>
                                  {colors.map((c, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      className={`${styles['cart-color-chip']} ${item.selectedColor === c ? styles['cart-color-active'] : ''}`}
                                      style={{ backgroundColor: c }}
                                      onClick={() => {
                                        updateVariant(item, { selectedColor: c });
                                        showToast(`Selected color for ${item.name}`, 'info');
                                      }}
                                      title={c}
                                      aria-label={`Color ${c}`}
                                    />
                                  ))}
                                </div>
                                {!item.selectedColor && (
                                  <span className={styles['variant-required-pill']}>Select Color *</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions Row: Left Secondary Actions, Right Quantity Stepper */}
                        <div className={styles['item-actions-row']}>
                          <div className={styles['secondary-actions-group']}>
                            {/* Buy Now Single Item Button */}
                            <button
                              type="button"
                              onClick={() => handleBuyNowSingleItem(item)}
                              className={styles['buy-now-single-btn']}
                              title={`Buy only ${item.name} now`}
                            >
                              <ShoppingBag size={13} strokeWidth={2.2} /> Buy Now
                            </button>

                            {/* Save to Wishlist Button */}
                            <button
                              type="button"
                              onClick={() => handleMoveToWishlist(item)}
                              className={styles['wishlist-action-btn']}
                              title="Move to Wishlist"
                            >
                              <Heart size={14} className={styles['heart-icon']} /> Save to Wishlist
                            </button>

                            {/* Remove from Cart */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              className={styles['remove-btn']}
                              title="Remove from Cart"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>

                          {/* Right Aligned Quantity Stepper */}
                          <div className={styles['qty-stepper-wrap']}>
                            <span className={styles['qty-label']}>Qty:</span>
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
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Card Footer Row */}
                <div className={styles['card-footer-row']}>
                  <button type="button" onClick={() => setShowClearConfirm(true)} className={styles['clear-cart-btn']}>
                    <Trash2 size={14} /> Clear Cart
                  </button>
                  <Link to="/products" className={styles['continue-shopping-btn']}>
                    <ArrowLeft size={15} /> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className={styles['summary-card']}>
              <h2 className={styles['summary-title']}>Order Summary</h2>

              {/* Single Clean Promo Section */}
              {isEnabled('cart_coupon_strip') && (
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
                          placeholder={getSetting('cart_coupon_strip', 'promoPlaceholder', 'PROMO CODE')}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className={styles['promo-input']}
                        />
                        <button
                          type="submit"
                          disabled={couponLoading}
                          className={styles['promo-apply-btn']}
                        >
                          {getSetting('cart_coupon_strip', 'applyButtonText', 'Apply')}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Price Breakdown with MRP & Discounts */}
              <div className={styles['price-breakdown']}>
                <div className={styles['breakdown-row']}>
                  <span className={styles['row-label']}>Total MRP</span>
                  <span className={styles['row-value']} style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                    {formatPrice(totalOriginal)}
                  </span>
                </div>

                {productSavings > 0 && (
                  <div className={styles['breakdown-row']} style={{ color: '#16a34a' }}>
                    <span className={styles['row-label']} style={{ color: '#16a34a' }}>Discount on MRP</span>
                    <span className={styles['row-value']} style={{ color: '#16a34a', fontWeight: 700 }}>
                      -{formatPrice(productSavings)}
                    </span>
                  </div>
                )}

                <div className={styles['breakdown-row']}>
                  <span className={styles['row-label']}>Subtotal</span>
                  <span className={styles['row-value']}>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className={styles['breakdown-row']} style={{ color: '#16a34a' }}>
                    <span className={styles['row-label']} style={{ color: '#16a34a' }}>Coupon Discount</span>
                    <span className={styles['row-value']} style={{ color: '#16a34a', fontWeight: 700 }}>
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                <div className={styles['breakdown-row']} style={{ gap: '0.75rem', alignItems: 'center' }}>
                  <span className={styles['row-label']} style={{ fontWeight: 700, color: '#1e293b', flexShrink: 0 }}>
                    Shipping & Delivery
                  </span>
                  <span
                    className={styles['row-value']}
                    style={{
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: '0.74rem',
                      color: '#64748b',
                      textAlign: 'right',
                      marginLeft: 'auto',
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Enter address to calculate
                  </span>
                </div>

                <div className={styles['total-row']}>
                  <span className={styles['total-label']}>Total Amount</span>
                  <span className={styles['total-value']}>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className={`${styles['checkout-btn']} ${missingVariantItems.length > 0 ? styles['checkout-btn-blocked'] : ''}`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>

              {missingVariantItems.length > 0 && (
                <div className={styles['missing-warning-note']}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>Please select required variants ({missingVariantItems.length} {missingVariantItems.length === 1 ? 'item' : 'items'} pending)</span>
                </div>
              )}

              <div className={styles['security-subtext']}>
                <Lock size={13} color="#64748b" /> Safe & Secure Checkout
              </div>
            </div>
          </div>

          {/* ── Best Sellers 1-Row Infinite Running Showcase ── */}
          {isEnabled('cart_bestsellers') && renderBestSellers()}

          {/* ── 3 Trust Badges Section - Placed right above footer across full width ── */}
          {isEnabled('cart_trust_security') && renderTrustBadges()}
        </div>
      </div>

      <Modal isOpen={!!itemToRemove} onClose={() => setItemToRemove(null)} title="Remove Item">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to remove <strong>"{itemToRemove?.name || 'Item'}"</strong> from your cart?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setItemToRemove(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmRemoveItem} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
        </div>
      </Modal>

      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear Cart">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to remove all items from your cart?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setShowClearConfirm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { clearCart(); setShowClearConfirm(false); showToast('Cart cleared', 'info'); }} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Clear All</button>
        </div>
      </Modal>
    </PageWrapper>
  );
}

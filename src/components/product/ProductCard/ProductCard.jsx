import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { wishlistService } from '../../../services/wishlist.service';

export default function ProductCard({ product, actionText = 'Add to Cart', onAction, onRemoveWishlist }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

  const isFashionProduct =
    product.category?.slug === 'womens-fashion' ||
    product.category?.name?.toLowerCase().includes('fashion') ||
    product.subCategory?.slug === 'kurtis' ||
    product.subCategory?.slug === 'sarees' ||
    product.tags?.includes('T-Shirt') ||
    product.tags?.includes('Cotton');

  const availableSizes = ['S', 'M', 'L', 'XL'];

  // Setup carousel images for each product (only if multiple images exist)
  const carouselImages = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 1) {
      const validUniqueImages = Array.from(new Set(product.images.filter(Boolean)));
      if (validUniqueImages.length > 1) {
        return validUniqueImages.slice(0, 4);
      }
    }

    const baseImg = product.images?.[0] || product.image || '/images/products/saree.png';
    return [baseImg];
  }, [product.images, product.image]);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex(index);
  };

  const handleQuickAdd = (e, size = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAction) {
      onAction(product, size);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
      return;
    }

    const itemToAdd = size ? { ...product, selectedSize: size } : product;
    addItem(itemToAdd, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);

    const sizeMsg = size ? ` (Size ${size})` : '';
    showToast(`Added "${product.name}"${sizeMsg} to cart!`, 'success');
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onRemoveWishlist) {
      onRemoveWishlist(product);
      return;
    }

    toggleItem(product);

    if (isLoggedIn) {
      try {
        await wishlistService.toggle(product._id || product.id);
      } catch (_) {}
    }

    showToast(
      inWishlist ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist!`,
      'info'
    );
  };

  const currentPrice = product.discountPrice || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? originalPrice - currentPrice : 0;

  // Dynamic Marketing Badge (Top-Left) with High-Contrast Solid Backgrounds
  const badgeType =
    product.badge ? 'custom' :
    product.isNewArrival ? 'new-arrival' :
    product.isBestSeller ? 'best-seller' :
    (discountPercent >= 40 ? 'mega-deal' : 'new-arrival');

  const marketingBadge =
    product.badge ||
    (product.isNewArrival ? 'NEW ARRIVAL' :
     product.isBestSeller ? 'BEST SELLER' :
     (discountPercent >= 40 ? 'MEGA DEAL' : 'NEW ARRIVAL'));

  // Stock Status Indicator (Bottom of Image)
  // Only display if stock is critical (<= 5) or out of stock (0). Normal stock items (> 5) do NOT show "In Stock".
  const stockCount = typeof product.stock === 'number' ? product.stock : 99;
  const isOutOfStock = stockCount === 0;
  const isCriticalStock = stockCount > 0 && stockCount <= 5;
  const showStockBadge = isOutOfStock || isCriticalStock;

  const stockStatusClass = isOutOfStock ? 'stock-out' : 'stock-critical';
  const stockStatusText = isOutOfStock ? 'Out of Stock' : `Only ${stockCount} left`;

  return (
    <div className="lumina-product-card">
      {/* ── 1. Image Stage ── */}
      <div className="lumina-stage" data-pin-nopin="true">
        {/* Top-Left: High-Contrast Solid Marketing Tag */}
        <div className={`lumina-tag-pill tag-${badgeType}`}>
          {marketingBadge}
        </div>

        {/* Image Bottom-Left: Urgency Stock Indicator (Rendered ONLY if stock <= 5 or out of stock) */}
        {showStockBadge && (
          <div className={`lumina-bottom-stock-pill ${stockStatusClass}`}>
            <span className={`stock-status-dot ${isCriticalStock ? 'pulse' : ''}`} />
            <span className="stock-status-label">{stockStatusText}</span>
          </div>
        )}

        {/* Image Carousel Track */}
        <Link to={`/products/${product.slug}`} className="lumina-image-link">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${activeImgIndex * 100}%)` }}
          >
            {carouselImages.map((src, i) => (
              <div key={i} className="carousel-slide">
                <img
                  src={src}
                  alt={`${product.name} - view ${i + 1}`}
                  className="lumina-floating-img"
                  loading="lazy"
                  data-pin-nopin="true"
                />
              </div>
            ))}
          </div>
        </Link>

        {/* Carousel Navigation Arrows & Dashes (Rendered ONLY if product has multiple images) */}
        {carouselImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="carousel-nav-btn btn-prev"
              title="Previous view"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleNextImage}
              className="carousel-nav-btn btn-next"
              title="Next view"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            <div className="carousel-dashes">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => handleDotClick(e, i)}
                  className={`carousel-dash-pill ${activeImgIndex === i ? 'active' : ''}`}
                  title={`View slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── 2. Card Content Body ── */}
      <div className="lumina-card-content">
        {/* Product Name (Bold, 2 lines max, uniform dark slate text) */}
        <Link to={`/products/${product.slug}`} className="lumina-title-link">
          <h3 className="lumina-title-text" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Price Row: Bold Large Price + Strike-through Original Price + Discount % Tag */}
        <div className="lumina-price-row">
          <span className="lumina-current-price">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <>
              <span className="lumina-original-price">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="lumina-discount-pill">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Bottom Action Row: [ Add to Cart (flex: 1) ] [ ♡ Wishlist (Subordinate) ] */}
        <div className="lumina-action-container">
          {/* Main Action Button */}
          {isFashionProduct ? (
            <div className="lumina-action-wrapper">
              <button
                onClick={(e) => handleQuickAdd(e, 'M')}
                className={`lumina-primary-btn ${justAdded ? 'btn-success-state' : ''}`}
              >
                {justAdded ? (
                  <>
                    <Check size={16} strokeWidth={2.8} />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} strokeWidth={2.3} />
                    <span>{actionText}</span>
                  </>
                )}
              </button>

              {/* Hover Overlay: Instant Quick-Size Selector Drawer */}
              <div className="lumina-size-drawer">
                <span className="size-drawer-label">Size:</span>
                <div className="size-chips-list">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(e, size)}
                      className="size-chip-btn"
                      title={`Add Size ${size} to cart`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => handleQuickAdd(e)}
              className={`lumina-primary-btn ${justAdded ? 'btn-success-state' : ''}`}
            >
              {justAdded ? (
                <>
                  <Check size={16} strokeWidth={2.8} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} strokeWidth={2.3} />
                  <span>{actionText}</span>
                </>
              )}
            </button>
          )}

          {/* Wishlist Button: Subordinate Compact Action Beside Add to Cart */}
          <button
            onClick={handleToggleWishlist}
            className={`lumina-wishlist-btn ${inWishlist ? 'active-wishlist' : ''}`}
            title={onRemoveWishlist ? 'Remove from wishlist' : inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            {onRemoveWishlist ? (
              <X size={15} color="#ef4444" strokeWidth={2.5} />
            ) : (
              <Heart
                size={15}
                color={inWishlist ? '#e11d48' : '#64748b'}
                fill={inWishlist ? '#e11d48' : 'transparent'}
                strokeWidth={2.2}
              />
            )}
          </button>
        </div>
      </div>

      <style>{`
        /* ── Lumina Canvas Card Architecture ── */
        .lumina-product-card {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 18px;
          border: 1.5px solid #ede9fe;
          padding: 0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px -4px rgba(124, 58, 237, 0.07), 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .lumina-product-card:hover {
          transform: translateY(-6px);
          border-color: #a855f7 !important;
          box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.20), 0 8px 20px rgba(0, 0, 0, 0.04) !important;
        }

        /* ── Standardized Clean Neutral Image Stage ── */
        .lumina-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          border-radius: 17px 17px 0 0;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: background 0.35s ease;
        }

        .lumina-product-card:hover .lumina-stage {
          background: #f1f5f9;
        }

        /* ── Carousel Slides & Track ── */
        .lumina-image-link {
          display: flex;
          width: 100%;
          height: 100%;
          text-decoration: none;
          overflow: hidden;
        }

        .carousel-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
          overflow: hidden;
        }

        .lumina-floating-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lumina-product-card:hover .lumina-floating-img {
          transform: scale(1.05);
        }

        /* ── 1. Top-Left: High-Contrast Solid Marketing Badges ── */
        .lumina-tag-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          color: #ffffff !important;
          font-size: 0.67rem;
          font-weight: 800;
          padding: 0.26rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
          z-index: 3;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          pointer-events: none;
        }

        .lumina-tag-pill.tag-mega-deal {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        }

        .lumina-tag-pill.tag-new-arrival {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
        }

        .lumina-tag-pill.tag-best-seller {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        }

        .lumina-tag-pill.tag-custom {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
        }

        /* ── Bottom-Left of Image: Urgency Stock Indicator (≤ 5 items) ── */
        .lumina-bottom-stock-pill {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          padding: 0.2rem 0.55rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid rgba(221, 214, 254, 0.85);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          z-index: 3;
          pointer-events: none;
        }

        .stock-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .stock-status-label {
          font-size: 0.66rem;
          font-weight: 700;
          line-height: 1;
        }

        .lumina-bottom-stock-pill.stock-critical {
          color: #c2410c;
          border-color: #fed7aa;
          background: rgba(255, 247, 237, 0.96);
        }
        .lumina-bottom-stock-pill.stock-critical .stock-status-dot {
          background: #ea580c;
          box-shadow: 0 0 7px rgba(234, 88, 12, 0.6);
        }

        .lumina-bottom-stock-pill.stock-out {
          color: #dc2626;
          border-color: #fecaca;
          background: rgba(254, 242, 242, 0.96);
        }
        .lumina-bottom-stock-pill.stock-out .stock-status-dot {
          background: #ef4444;
        }

        .stock-status-dot.pulse {
          animation: urgencyPulse 1.6s infinite ease-in-out;
        }

        @keyframes urgencyPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.45); opacity: 0.65; }
        }

        /* ── Carousel Nav Arrows ── */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(221, 214, 254, 0.85);
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          pointer-events: none;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
          z-index: 4;
        }

        .lumina-product-card:hover .carousel-nav-btn {
          opacity: 1;
          pointer-events: auto;
        }

        .btn-prev { left: 8px; }
        .btn-next { right: 8px; }

        .carousel-nav-btn:hover {
          background: #7c3aed;
          color: #ffffff;
          border-color: #7c3aed;
          transform: translateY(-50%) scale(1.12);
        }

        /* ── Carousel Dots ── */
        .carousel-dashes {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 4;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(6px);
          padding: 3px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(237, 233, 254, 0.8);
        }

        .carousel-dash-pill {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: rgba(124, 58, 237, 0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;
        }

        .carousel-dash-pill.active {
          width: 14px;
          background: #7c3aed;
        }

        /* ── Card Content Body ── */
        .lumina-card-content {
          padding: 0.85rem 0.9rem 0.9rem 0.9rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        a.lumina-title-link,
        a.lumina-title-link:visited,
        a.lumina-title-link:active {
          text-decoration: none !important;
          display: block;
          margin-bottom: 0.55rem;
          color: #0f172a !important;
        }

        /* Line 1: Product Name (Bold, 2 lines max, uniform dark slate text) */
        .lumina-title-text {
          font-size: 0.93rem;
          font-weight: 700;
          color: #0f172a !important;
          margin: 0;
          line-height: 1.32;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.45rem;
          transition: color 0.2s ease;
        }

        .lumina-product-card:hover .lumina-title-text,
        a.lumina-title-link:hover .lumina-title-text {
          color: #0f172a !important;
        }

        /* Line 2: Price Row (Current price bold+large, strikethrough, discount pill) */
        .lumina-price-row {
          height: 26px;
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          margin-bottom: 0.75rem;
        }

        .lumina-current-price {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .lumina-original-price {
          font-size: 0.84rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 500;
          line-height: 1;
        }

        .lumina-discount-pill {
          font-size: 0.70rem;
          font-weight: 800;
          color: #16a34a;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 0.12rem 0.42rem;
          border-radius: 4px;
          line-height: 1;
          margin-left: 0.2rem;
        }

        /* Line 3: Action Container [ Add to Cart (flex: 1) ] [ ♡ Wishlist (36px subordinate) ] */
        .lumina-action-container {
          position: relative;
          height: 42px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: auto;
        }

        .lumina-action-wrapper {
          position: relative;
          flex: 1;
          height: 100%;
        }

        .lumina-primary-btn {
          width: 100%;
          flex: 1;
          height: 42px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 0.86rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28);
          letter-spacing: 0.02em;
        }

        .lumina-primary-btn:hover {
          background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
          transform: translateY(-1px);
        }

        .btn-success-state {
          background: #059669 !important;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35) !important;
        }

        /* ── Wishlist Heart Button: Subordinate Compact Design ── */
        .lumina-wishlist-btn {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lumina-wishlist-btn:hover {
          transform: scale(1.08);
          background: #fff1f2;
          border-color: #f43f5e;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.18);
        }

        .lumina-wishlist-btn.active-wishlist {
          background: #ffe4e6 !important;
          border-color: #f43f5e !important;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.22) !important;
          animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .lumina-wishlist-btn.active-wishlist svg {
          fill: #e11d48 !important;
          color: #e11d48 !important;
        }

        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* ── Quick Size Selector Drawer (Reveals on Hover) ── */
        .lumina-size-drawer {
          position: absolute;
          inset: 0;
          background: #ffffff;
          border: 1.5px solid #c084fc;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.5rem;
          opacity: 0;
          pointer-events: none;
          transform: translateY(4px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.20);
        }

        .lumina-action-wrapper:hover .lumina-size-drawer {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .size-drawer-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #7c3aed;
          padding-left: 0.35rem;
        }

        .size-chips-list {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .size-chip-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #faf5ff;
          border: 1px solid #ddd6fe;
          color: #6d28d9;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .size-chip-btn:hover {
          background: #7c3aed;
          color: #ffffff;
          border-color: #7c3aed;
          transform: scale(1.15);
        }

        /* ── Mobile 2-Cards Per Row Optimization ── */
        @media (max-width: 768px) {
          .lumina-card-content {
            padding: 0.65rem 0.65rem 0.75rem 0.65rem;
          }
          .lumina-title-text {
            font-size: 0.82rem;
            height: 2.15rem;
          }
          .lumina-current-price {
            font-size: 1.05rem;
          }
          .lumina-original-price {
            font-size: 0.74rem;
          }
          .lumina-discount-pill {
            font-size: 0.60rem;
            padding: 0.08rem 0.3rem;
          }
          .lumina-action-container {
            height: 36px;
            gap: 0.35rem;
          }
          .lumina-primary-btn {
            height: 36px;
            font-size: 0.76rem;
            gap: 0.3rem;
          }
          .lumina-wishlist-btn {
            width: 32px;
            height: 32px;
          }
          .lumina-wishlist-btn svg {
            width: 14px;
            height: 14px;
          }
          .lumina-bottom-stock-pill {
            bottom: 6px;
            left: 6px;
            padding: 0.14rem 0.42rem;
          }
          .stock-status-label {
            font-size: 0.58rem;
          }
          .lumina-tag-pill {
            top: 6px;
            left: 6px;
            font-size: 0.60rem;
            padding: 0.15rem 0.45rem;
          }
        }
      `}</style>
    </div>
  );
}

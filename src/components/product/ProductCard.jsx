import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';

export default function ProductCard({ product }) {
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

  // Setup 3 carousel images for each product (with model & multi-angle views)
  const carouselImages = useMemo(() => {
    const baseImg = product.images?.[0] || product.image || '/images/products/saree.png';

    if (product.images && product.images.length >= 3) {
      return product.images.slice(0, 3);
    }

    const fallbackTrioMap = {
      'saree.png': ['/images/products/saree.png', '/images/pill_model_saree.png', '/images/products/saree.png'],
      'pill_model_kurti.png': ['/images/pill_model_kurti.png', '/images/pill_model_western.png', '/images/pill_model_kurti.png'],
      'tshirt.png': ['/images/products/tshirt.png', '/images/streetwear_hero_girl_clean.png', '/images/products/tshirt.png'],
      'necklace.png': ['/images/products/necklace.png', '/images/pill_model_jewellery.png', '/images/products/gold_ring.png'],
      'jhumkas.png': ['/images/products/jhumkas.png', '/images/pill_model_jewellery.png', '/images/products/necklace.png'],
      'gold_ring.png': ['/images/products/gold_ring.png', '/images/pill_model_jewellery.png', '/images/products/necklace.png'],
      'chopper.png': ['/images/products/chopper.png', '/images/products/chopper.png', '/images/products/chopper.png'],
      'kadai.png': ['/images/products/kadai.png', '/images/products/kadai.png', '/images/products/kadai.png'],
      'backpack.png': ['/images/products/backpack.png', '/images/products/backpack.png', '/images/products/backpack.png'],
    };

    for (const [key, trio] of Object.entries(fallbackTrioMap)) {
      if (baseImg?.includes(key)) return trio;
    }

    return [baseImg, baseImg, baseImg];
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

    const itemToAdd = size ? { ...product, selectedSize: size } : product;
    addItem(itemToAdd, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);

    const sizeMsg = size ? ` (Size ${size})` : '';
    showToast(`Added "${product.name}"${sizeMsg} to bag!`, 'success');
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Short 1-line subtitle description
  const shortDesc =
    product.description ||
    product.subtext ||
    (product.characteristics && product.characteristics.length > 0
      ? `${product.characteristics[0].key}: ${product.characteristics[0].value}`
      : 'Premium handcrafted quality guaranteed');

  return (
    <div className="lumina-product-card">
      {/* ── 1. Full-Width Edge-to-Edge 3-Image Carousel Stage ── */}
      <div className="lumina-stage" data-pin-nopin="true">
        {/* Sleek Frosted Glass Island Badge (Top-Left) */}
        <div className="lumina-badge-pill">
          {discountPercent > 0 ? (
            <span>✦ {discountPercent}% OFF</span>
          ) : (
            <span>✦ New Drop</span>
          )}
        </div>

        {/* Floating Wishlist Heart Button (Top-Right) */}
        <button
          onClick={handleToggleWishlist}
          className="lumina-heart-btn"
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={16}
            color={inWishlist ? '#e11d48' : '#64748b'}
            fill={inWishlist ? '#e11d48' : 'transparent'}
            strokeWidth={2.3}
          />
        </button>

        {/* 3-Image Carousel Track */}
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
                  className={`lumina-floating-img ${
                    i === 1 && carouselImages[0] === src ? 'img-zoom-detail' : ''
                  }`}
                  loading="lazy"
                  data-pin-nopin="true"
                />
              </div>
            ))}
          </div>
        </Link>

        {/* Carousel Navigation Arrows (Hover Triggered) */}
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

        {/* Segment Dash Progress Indicators */}
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
      </div>

      {/* ── 2. Card Content Area (Decluttered & Spacious) ── */}
      <div className="lumina-card-content">
        {/* Product Title (Line 1: Name) & Line 2: Subtitle Description */}
        <Link to={`/products/${product.slug}`} className="lumina-title-link">
          <h3 className="lumina-title-text" title={product.name}>
            {product.name}
          </h3>
          <p className="lumina-desc-text" title={shortDesc}>
            {shortDesc}
          </p>
        </Link>

        {/* Clean Luxury Price Row */}
        <div className="lumina-price-row">
          <span className="lumina-current-price">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="lumina-original-price">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* ── 3. Single Commanding Action Pill with Quick-Size Drawer on Hover ── */}
        <div className="lumina-action-container">
          {isFashionProduct ? (
            /* Fashion/Apparel: Morph into Quick-Size Selector on Hover */
            <div className="lumina-action-wrapper">
              <button
                onClick={(e) => handleQuickAdd(e, 'M')}
                className={`lumina-primary-btn ${justAdded ? 'btn-success-state' : ''}`}
              >
                {justAdded ? (
                  <>
                    <Check size={16} strokeWidth={2.8} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} strokeWidth={2.3} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Hover Overlay: Instant Quick-Size Selector Drawer */}
              <div className="lumina-size-drawer">
                <span className="size-drawer-label">Pick Size:</span>
                <div className="size-chips-list">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(e, size)}
                      className="size-chip-btn"
                      title={`Add Size ${size} to bag`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Non-Apparel: Single Instant Tactile Add Button */
            <button
              onClick={(e) => handleQuickAdd(e)}
              className={`lumina-primary-btn ${justAdded ? 'btn-success-state' : ''}`}
            >
              {justAdded ? (
                <>
                  <Check size={16} strokeWidth={2.8} />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={15} strokeWidth={2.3} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* ── Lumina Canvas Card Architecture ── */
        .lumina-product-card {
          width: 100%;
          max-width: 285px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          border: 1.5px solid #ede9fe;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 20px -4px rgba(124, 58, 237, 0.07), 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .lumina-product-card:hover {
          transform: translateY(-6px);
          border-color: #a855f7 !important;
          box-shadow: 0 22px 45px -10px rgba(124, 58, 237, 0.22), 0 8px 20px rgba(0, 0, 0, 0.04) !important;
        }

        /* ── Full-Width 3-Image Carousel Stage ── */
        .lumina-stage {
          position: relative;
          width: 100%;
          background: radial-gradient(circle at 50% 40%, rgba(243, 232, 255, 0.95) 0%, rgba(250, 245, 255, 0.6) 55%, #faf8ff 100%);
          border-radius: 22px 22px 0 0;
          border-bottom: 1px solid rgba(237, 233, 254, 0.85);
          aspect-ratio: 1 / 1.05;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .lumina-product-card:hover .lumina-stage {
          background: radial-gradient(circle at 50% 40%, rgba(237, 222, 255, 1) 0%, rgba(245, 238, 255, 0.75) 55%, #faf8ff 100%);
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
          padding: 0.8rem 0.8rem 1.6rem 0.8rem;
          flex-shrink: 0;
        }

        .lumina-floating-img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease;
          filter: drop-shadow(0 10px 18px rgba(124, 58, 237, 0.14));
        }

        .img-zoom-detail {
          transform: scale(1.15);
        }

        .lumina-product-card:hover .lumina-floating-img:not(.img-zoom-detail) {
          transform: scale(1.06);
          filter: drop-shadow(0 16px 26px rgba(124, 58, 237, 0.22));
        }

        /* ── Carousel Nav Arrows (Appear on Card Hover) ── */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
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

        /* ── Segment Dash Progress Indicators ── */
        .carousel-dashes {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 4;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(6px);
          padding: 3px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(237, 233, 254, 0.7);
        }

        .carousel-dash-pill {
          width: 6px;
          height: 5px;
          border-radius: 9999px;
          background: rgba(124, 58, 237, 0.28);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;
        }

        .carousel-dash-pill.active {
          width: 16px;
          background: #7c3aed;
        }

        /* ── Sleek Frosted Glass Island Badge ── */
        .lumina-badge-pill {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          color: #7c3aed;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.22rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid rgba(221, 214, 254, 0.9);
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
          z-index: 3;
          letter-spacing: 0.02em;
          pointer-events: none;
        }

        /* ── Floating Wishlist Heart ── */
        .lumina-heart-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(221, 214, 254, 0.8);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 3;
        }

        .lumina-heart-btn:hover {
          transform: scale(1.15);
          background: #ffffff;
          border-color: #c4b5fd;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
        }

        /* ── Card Content Body with Clean Internal Padding ── */
        .lumina-card-content {
          padding: 0.85rem 0.9rem 0.9rem 0.9rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .lumina-title-link {
          text-decoration: none;
          display: block;
          margin-bottom: 0.65rem;
        }

        /* Line 1: Product Name */
        .lumina-title-text {
          font-size: 0.91rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.18rem 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .lumina-product-card:hover .lumina-title-text {
          color: #7c3aed !important;
        }

        /* Line 2: Product Short Description */
        .lumina-desc-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          margin: 0;
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Clean Luxury Price Row ── */
        .lumina-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
          margin-bottom: 0.75rem;
        }

        .lumina-current-price {
          font-size: 1.18rem;
          font-weight: 900;
          color: #7c3aed;
          letter-spacing: -0.02em;
        }

        .lumina-original-price {
          font-size: 0.84rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }

        /* ── Single Commanding Action Pill ── */
        .lumina-action-container {
          position: relative;
          height: 42px;
        }

        .lumina-action-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .lumina-primary-btn {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.30);
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
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, X, Zap, Flame, Star, Award, RotateCcw, Truck, Sparkles } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { wishlistService } from '../../../services/wishlist.service';
import { extractProductTag, getTagDesign } from '../../../utils/productTagHelper';

import './ProductCard.css';

export default function ProductCard({ product, actionText = 'Add to Cart', onAction, onRemoveWishlist, badgeText, hideBadge = false }) {
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const [justAdded, setJustAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [now, setNow] = useState(Date.now());

  if (!product) return null;

  const endDateRaw = product.offerEndDate || product.validTill || product.endDate;

  // Active ticking timer for offers with end dates
  useEffect(() => {
    if (!endDateRaw) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endDateRaw]);

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

  const primaryImage = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const valid = product.images.find(Boolean);
      if (valid) return valid;
    }
    return product.image || '';
  }, [product.images, product.image]);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAction) {
      onAction(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
      return;
    }

    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product._id || product.id || product.slug;
    setBuyNowItem({
      _id: prodId,
      id: prodId,
      productId: prodId,
      slug: product.slug,
      name: product.name,
      image: primaryImage || '',
      images: product.images || (primaryImage ? [primaryImage] : []),
      price: product.discountPrice || product.price || 0,
      discountPrice: product.discountPrice || product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      quantity: 1,
      stock: typeof product.stock === 'number' ? product.stock : 10,
    });
    navigate('/checkout?buyNow=true');
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
      } catch (_) { }
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

  const getBadgeInfo = () => {
    let customBadge = badgeText || product.badge;

    // Prioritize top product badge if featured or tagged with top
    if (!customBadge && (product.isFeatured || product.tags?.some((t) => t.toLowerCase().includes('top')))) {
      customBadge = 'TOP PRODUCT';
    }

    if (!customBadge && Array.isArray(product.tags) && product.tags.length > 0) {
      const priorityTags = ['top product', 'limited deals', 'trending now', 'new arrivals', 'best sellers'];
      const matched = product.tags.find((t) =>
        priorityTags.some((pt) => t.toLowerCase().includes(pt) || pt.includes(t.toLowerCase()))
      );
      if (matched) {
        customBadge = matched;
      }
    }

    if (!customBadge) return null;

    const upper = customBadge.toUpperCase().trim();
    if (upper.includes('TOP')) {
      return { text: 'TOP PRODUCT', icon: Award, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
    }
    if (upper.includes('LIMITED') || upper.includes('DEAL')) {
      return { text: 'LIMITED DEALS', icon: Zap, color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
    }
    if (upper.includes('TREND')) {
      return { text: 'TRENDING NOW', icon: Flame, color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' };
    }
    if (upper.includes('NEW') || upper.includes('ARRIVAL')) {
      return { text: 'NEW ARRIVALS', icon: Sparkles, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    }
    if (upper.includes('BEST') || upper.includes('SELLER')) {
      return { text: 'BEST SELLERS', icon: Flame, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
    }
    return { text: upper, icon: Sparkles, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
  };
  const badgeInfo = getBadgeInfo();
  const BadgeIcon = badgeInfo?.icon;

  return (
    <div className="ref-product-card">
      {/* Top Section */}
      <div className="ref-card-top">
        {/* Background shapes */}
        <div className="ref-bg-circle ref-circle-1"></div>
        <div className="ref-bg-circle ref-circle-2"></div>
        <div className="ref-bg-circle ref-circle-3"></div>

        {/* Sparkles */}
        <div className="ref-sparkle ref-sparkle-1">✦</div>
        <div className="ref-sparkle ref-sparkle-2">✦</div>
        <div className="ref-sparkle ref-sparkle-3">✦</div>
        <div className="ref-sparkle ref-sparkle-4">✦</div>

        <div className="ref-top-bar">
          {!hideBadge && badgeInfo && (
            <div className="ref-mega-deal" style={{ color: badgeInfo.color, background: badgeInfo.bg, border: `1px solid ${badgeInfo.border}` }}>
              <span className="ref-deal-icon"><BadgeIcon size={12} fill={badgeInfo.color} color={badgeInfo.color} /></span>
              <span className="ref-deal-text" style={{ color: badgeInfo.color }}>{badgeInfo.text}</span>
            </div>
          )}
          <button
            className={`ref-wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
            aria-label="Toggle Wishlist"
          >
            {onRemoveWishlist ? (
              <X size={16} color="#6d28d9" />
            ) : (
              <Heart size={16} color="#6d28d9" fill={inWishlist ? "#6d28d9" : "transparent"} strokeWidth={inWishlist ? 0 : 2} />
            )}
          </button>
        </div>

        <Link to={`/products/${product.slug}`} className="ref-img-wrapper">
          {primaryImage && !imgFailed ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="ref-product-img"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="ref-product-placeholder">
              <div className="ref-placeholder-icon">
                <Sparkles size={22} color="#7c3aed" />
              </div>
              <span className="ref-placeholder-brand">PICKY</span>
              <span className="ref-placeholder-sub">{product.category?.name || product.subCategory || 'Curated'}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Bottom Info Section */}
      <div className="ref-card-bottom">

        <div className="ref-title-rating">
          <div className="ref-title-section">
            <Link to={`/products/${product.slug}`} className="ref-title-link">
              <h3 className="ref-product-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
            </Link>
          </div>
        </div>

        <div className="ref-price-row">
          <span className="ref-current-price">₹{currentPrice?.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <>
              <span className="ref-original-price">₹{originalPrice?.toLocaleString('en-IN')}</span>
              <span className="ref-discount-pill">{discountPercent}% OFF</span>
            </>
          )}
        </div>


        <div className="ref-actions-row">
          <button className="ref-add-cart-btn" onClick={handleQuickAdd}>
            {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
            <span>{justAdded ? 'Added' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

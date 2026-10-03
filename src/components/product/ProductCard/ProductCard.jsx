import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, X, Zap, Flame, Star, Award, RotateCcw, Truck, Sparkles } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { wishlistService } from '../../../services/wishlist.service';

import './ProductCard.css';

export default function ProductCard({ product, actionText = 'Add to Cart', onAction, onRemoveWishlist, badgeText, hideBadge = false }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

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
    addItem(product, 1);
    navigate('/checkout');
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
    const customBadge = badgeText || product.badge;
    if (customBadge) {
      const upper = customBadge.toUpperCase();
      if (upper.includes('HOT') || upper.includes('TREND')) {
        return { text: upper, icon: Flame, color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' };
      }
      if (upper.includes('POPULAR') || upper.includes('BEST')) {
        return { text: upper, icon: Sparkles, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
      }
      if (upper.includes('SPECIAL') || upper.includes('EDITION')) {
        return { text: upper, icon: Zap, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
      }
      return { text: upper, icon: Sparkles, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
    }
    if (product.isTrending) return { text: 'TRENDING', icon: Flame, color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' };
    if (discountPercent >= 50) return { text: 'MEGA DEAL', icon: Zap, color: '#6d28d9', bg: '#f3e8ff', border: '#d8b4fe' };
    if (discountPercent >= 40) return { text: 'POPULAR', icon: Sparkles, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    if (discountPercent >= 25) return { text: 'HOT PICK', icon: Flame, color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' };
    return { text: 'SELLING FAST', icon: Zap, color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
  };
  const badgeInfo = getBadgeInfo();
  const BadgeIcon = badgeInfo.icon;

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
          <img src={carouselImages[0]} alt={product.name} className="ref-product-img" />
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

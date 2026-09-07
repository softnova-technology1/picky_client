import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showToast(`Added "${product.name}" to cart!`, 'success');
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

  const imageSrc =
    product.images?.[0] ||
    product.image ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const percentageOff = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-card">
      <div style={{ position: 'relative', overflow: 'hidden', background: '#f8fafc', aspectRatio: '1 / 1' }}>
        <Link to={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={imageSrc}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
              zIndex: 2,
            }}
          >
            {percentageOff}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: inWishlist ? '#fff1f2' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            border: inWishlist ? '1.5px solid #f43f5e' : '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 2,
          }}
          className="wishlist-btn"
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={17}
            color={inWishlist ? '#e11d48' : '#64748b'}
            fill={inWishlist ? '#e11d48' : 'transparent'}
            strokeWidth={2.2}
          />
        </button>

        {/* Rating Pill overlay at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            padding: '0.18rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            zIndex: 2,
          }}
        >
          <Star size={11} fill="#fbbf24" color="#fbbf24" />
          <span>{product.rating || '4.8'}</span>
          <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>({product.reviewsCount || 80})</span>
        </div>
      </div>

      <div className="product-card-body" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category Name */}
        {product.category?.name && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#7c3aed',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.3rem',
            }}
          >
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            className="product-card-title"
            style={{
              fontSize: '0.98rem',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 0.5rem',
              lineHeight: 1.35,
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div style={{ marginTop: 'auto', marginBottom: '1rem', paddingTop: '0.4rem' }}>
          <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="sm" />
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          className="btn btn-primary btn-sm btn-block"
          style={{
            borderRadius: '10px',
            padding: '0.6rem 1rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            transition: 'all 0.2s ease',
          }}
        >
          <ShoppingBag size={15} /> Add to Cart
        </button>
      </div>

      <style>{`
        .product-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(124, 58, 237, 0.12), 0 4px 8px rgba(0,0,0,0.04);
          border-color: #c084fc;
        }
        .product-card:hover .product-card-image {
          transform: scale(1.05);
        }
        .product-card .wishlist-btn:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}


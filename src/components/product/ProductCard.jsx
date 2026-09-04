import React from 'react';
import { Link } from 'react-router-dom';
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

  const inWishlist = isInWishlist(product);

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
      inWishlist ? `Removed from wishlist` : `Saved "${product.name}" to wishlist! ❤️`,
      'info'
    );
  };

  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  return (
    <div className="product-card">
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <Link to={`/products/${product.slug}`} style={{ display: 'block' }}>
          <img
            src={imageSrc}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        </Link>
        <button
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: inWishlist ? '#fee2e2' : 'rgba(255, 255, 255, 0.85)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s ease',
          }}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-card-body">
        {product.category?.name && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {product.category.name}
          </span>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        <div style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
          <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="sm" />
        </div>
        <button
          onClick={handleAddToCart}
          className="btn btn-primary btn-sm btn-block"
          style={{ marginTop: 'auto' }}
        >
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
}

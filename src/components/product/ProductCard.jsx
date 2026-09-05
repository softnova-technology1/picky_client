import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
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
      inWishlist ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist!`,
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
            background: inWishlist ? '#fdf2f8' : 'rgba(255, 255, 255, 0.9)',
            border: inWishlist ? '1.5px solid #f43f5e' : '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            color={inWishlist ? '#e11d48' : '#64748b'}
            fill={inWishlist ? '#e11d48' : 'transparent'}
            strokeWidth={2.2}
          />
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
          style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <ShoppingCart size={15} /> Add to Cart
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import PriceDisplay from '../components/product/PriceDisplay';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { wishlistService } from '../services/wishlist.service';

export default function Wishlist() {
  const { items, removeItem, setWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadServerWishlist() {
      if (isLoggedIn) {
        try {
          setLoading(true);
          const res = await wishlistService.get();
          const serverProducts = res?.data?.products || [];
          if (serverProducts.length > 0) {
            setWishlist(serverProducts);
          }
        } catch (err) {
          console.error('Failed to load server wishlist:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadServerWishlist();
  }, [isLoggedIn, setWishlist]);

  const handleMoveToCart = async (product) => {
    addItem(product, 1);
    removeItem(product._id || product.id || product);

    if (isLoggedIn) {
      try {
        await wishlistService.remove(product._id || product.id || product);
      } catch (_) {}
    }

    showToast(`Moved "${product.name}" to cart! 🛒`, 'success');
  };

  const handleRemove = async (productId) => {
    removeItem(productId);
    if (isLoggedIn) {
      try {
        await wishlistService.remove(productId);
      } catch (_) {}
    }
    showToast('Item removed from wishlist', 'info');
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>
              My Wishlist ({items.length})
            </h1>
            <p>Save items you like and move them to cart whenever you're ready.</p>
          </div>

          {items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🤍</span>
              <h2>Your Wishlist is Empty</h2>
              <p style={{ margin: '0.5rem 0 1.75rem', color: '#64748b' }}>
                Explore curated trending products and tap the heart icon to save your favorites!
              </p>
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore Store ➔
              </Link>
            </div>
          ) : (
            <div className="grid-4">
              {items.map((product) => {
                const pId = product._id || product.id || product;
                const imageSrc =
                  product.images?.[0] ||
                  product.image ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

                return (
                  <div key={pId} className="product-card">
                    <div style={{ position: 'relative' }}>
                      <Link to={`/products/${product.slug || ''}`}>
                        <img
                          src={imageSrc}
                          alt={product.name || 'Product'}
                          className="product-card-image"
                        />
                      </Link>
                      <button
                        onClick={() => handleRemove(pId)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#ef4444',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                        title="Remove from wishlist"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="product-card-body">
                      {product.category?.name && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          {product.category.name}
                        </span>
                      )}
                      <Link to={`/products/${product.slug || ''}`}>
                        <h3 className="product-card-title">{product.name}</h3>
                      </Link>

                      <div style={{ margin: '0.5rem 0 1rem' }}>
                        <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="sm" />
                      </div>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="btn btn-primary btn-sm btn-block"
                        style={{ marginTop: 'auto' }}
                      >
                        Move to Cart 🛒
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

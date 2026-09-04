import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Gallery from '../components/product/Gallery';
import PriceDisplay from '../components/product/PriceDisplay';
import Spinner from '../components/ui/Spinner';
import { productService } from '../services/product.service';
import { wishlistService } from '../services/wishlist.service';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        setProduct(res?.data || res);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="section"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Product Not Found</h2>
          <p>The product you are looking for might have been moved or removed.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Products
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const inWishlist = isInWishlist(product._id);

  const handleToggleWishlist = async () => {
    toggleItem(product);
    showToast(
      inWishlist ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist ❤️`,
      'success'
    );
    if (isLoggedIn) {
      try {
        await wishlistService.toggle(product._id);
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`Added ${quantity} × "${product.name}" to cart!`, 'success');
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
            <Link to="/">Home</Link> ➔ <Link to="/products">Products</Link> ➔{' '}
            {product.category && (
              <>
                <Link to={`/categories/${product.category.slug || ''}`}>{product.category.name}</Link> ➔{' '}
              </>
            )}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{product.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
            {/* Gallery Left */}
            <div>
              <Gallery images={product.images} />
            </div>

            {/* Product Details Right */}
            <div>
              {product.category?.name && (
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.category.name}
                </span>
              )}
              <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 1rem' }}>{product.name}</h1>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="lg" />
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                  Inclusive of all taxes. Free shipping on all orders.
                </span>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#1e293b' }}>Description</h4>
                <p style={{ lineHeight: 1.7, color: '#475569' }}>{product.description}</p>
              </div>

              {/* Quantity Controls & Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: '8px', background: 'white' }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '0.6rem 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ padding: '0.6rem 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                  ✓ In Stock & Ready to Ship
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-outline btn-lg"
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  Add to Cart 🛒
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  Buy Now ⚡
                </button>
                <button
                  onClick={handleToggleWishlist}
                  aria-label="Wishlist"
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  style={{
                    padding: '0 1.25rem',
                    borderRadius: '8px',
                    border: inWishlist ? '1.5px solid #ef4444' : '1.5px solid var(--color-border)',
                    background: inWishlist ? '#fee2e2' : 'white',
                    color: inWishlist ? '#ef4444' : '#64748b',
                    fontSize: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {inWishlist ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>💵</span> <strong>Cash on Delivery</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>💬</span> <strong>WhatsApp Notifications</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>🚚</span> <strong>Fast 24-Hour Dispatch</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>🛡️</span> <strong>100% Quality Checked</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

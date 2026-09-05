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
import { getProductBySlug } from '../data';
import {
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  MessageSquare,
  Banknote,
  Star,
  Check,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(() => getProductBySlug(slug));
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await productService.getBySlug(slug);
        const item = res?.data || res;
        if (item && item.name) {
          setProduct(item);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        const fallback = getProductBySlug(slug);
        if (fallback) setProduct(fallback);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading && !product) {
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

  const pId = product._id || product.id || slug;
  const inWishlist = isInWishlist(pId);

  const handleToggleWishlist = async () => {
    toggleItem(product);
    showToast(
      inWishlist ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist!`,
      'success'
    );
    if (isLoggedIn) {
      try {
        await wishlistService.toggle(pId);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/">Home</Link> <ChevronRight size={14} /> <Link to="/products">Products</Link>{' '}
            {product.category && (
              <>
                <ChevronRight size={14} />
                <Link to={`/categories/${product.category.slug || ''}`}>{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={14} />
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
              <h1 style={{ fontSize: '2rem', margin: '0.4rem 0 0.5rem' }}>{product.name}</h1>

              {product.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  <span style={{ background: '#f3e8ff', color: '#6d28d9', border: '1px solid #e9d5ff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={13} fill="#7c3aed" color="#7c3aed" /> {product.rating}
                  </span>
                  <span style={{ color: '#64748b' }}>({product.reviewsCount || 100}+ verified reviews)</span>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#faf5ff', borderRadius: 'var(--radius)', border: '1px solid #e9d5ff', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.04)' }}>
                <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="lg" />
                <span style={{ fontSize: '0.82rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontWeight: 600 }}>
                  <Check size={14} color="#059669" /> Inclusive of all taxes. Free express shipping on festival orders!
                </span>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#1e293b' }}>Description</h4>
                <p style={{ lineHeight: 1.7, color: '#475569' }}>{product.description}</p>
              </div>

              {/* Specifications / Characteristics */}
              {product.characteristics && product.characteristics.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1e293b' }}>Specifications & Highlights</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                    {product.characteristics.map((spec, idx) => (
                      <div key={idx} style={{ background: '#f1f5f9', padding: '0.55rem 0.85rem', borderRadius: '6px', fontSize: '0.84rem' }}>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>{spec.key}</span>
                        <strong style={{ color: '#1e293b' }}>{spec.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Controls & Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-border)', borderRadius: '8px', background: 'white' }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '0.6rem 0.85rem', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Minus size={15} />
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ padding: '0.6rem 0.85rem', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={16} /> In Stock & Ready to Ship
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-outline btn-lg"
                  style={{ flex: 1, minWidth: '160px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, minWidth: '160px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                >
                  <Zap size={18} /> Buy Now
                </button>
                <button
                  onClick={handleToggleWishlist}
                  aria-label="Wishlist"
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  style={{
                    padding: '0 1.25rem',
                    borderRadius: '8px',
                    border: inWishlist ? '1.5px solid #f43f5e' : '1.5px solid var(--color-border)',
                    background: inWishlist ? '#fff1f2' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Heart
                    size={22}
                    color={inWishlist ? '#e11d48' : '#64748b'}
                    fill={inWishlist ? '#e11d48' : 'transparent'}
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <Banknote size={18} color="#059669" /> <strong>Cash on Delivery</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <MessageSquare size={18} color="#0284c7" /> <strong>WhatsApp Notifications</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <Truck size={18} color="#7c3aed" /> <strong>Fast 24-Hour Dispatch</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                  <ShieldCheck size={18} color="#7c3aed" /> <strong>100% Quality Checked</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

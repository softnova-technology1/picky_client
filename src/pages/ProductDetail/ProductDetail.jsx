import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Gallery from '../../components/product/Gallery';
import PriceDisplay from '../../components/product/PriceDisplay';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { wishlistService } from '../../services/wishlist.service';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { getProductBySlug, getProducts, storeInfo } from '../../data';
import {
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  MessageCircle,
  Banknote,
  Star,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  RotateCcw,
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
        } else {
          const fallback = getProductBySlug(slug);
          if (fallback) setProduct(fallback);
        }
      } catch (err) {
        const fallback = getProductBySlug(slug);
        if (fallback) setProduct(fallback);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const relatedProducts = useMemo(() => {
    if (!product || !product.category) return [];
    const catSlug = product.category.slug || product.category._id;
    return getProducts({ category: catSlug })
      .filter((p) => p.slug !== slug && p._id !== product._id)
      .slice(0, 5);
  }, [product, slug]);

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
        <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            The item you are looking for might have been moved or is currently unavailable.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Browse All Products
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
      } catch (_) {}
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`Added ${quantity} × "${product.name}" to your cart!`, 'success');
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const savings = hasDiscount ? product.price - product.discountPrice : 0;
  const percentageOff = hasDiscount ? Math.round((savings / product.price) * 100) : 0;

  const whatsappPhone = storeInfo.supportPhone.replace(/[^0-9]/g, '') || '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hi Picky Store! I want to order "${product.name}" (Price: ₹${product.discountPrice || product.price}). Please share order details.`
  )}`;

  return (
    <PageWrapper>
      <div style={{ background: '#ffffff', minHeight: '80vh', padding: '2rem 0 5rem' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: '#64748b',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" style={{ color: '#64748b' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/categories" style={{ color: '#64748b' }}>Categories</Link>
            {product.category && (
              <>
                <ChevronRight size={14} />
                <Link to={`/categories/${product.category.slug || ''}`} style={{ color: '#64748b' }}>
                  {product.category.name}
                </Link>
              </>
            )}
            {product.subCategory && (
              <>
                <ChevronRight size={14} />
                <Link
                  to={`/products?category=${product.category?.slug || ''}&subCategory=${product.subCategory.slug || ''}`}
                  style={{ color: '#64748b' }}
                >
                  {product.subCategory.name}
                </Link>
              </>
            )}
            <ChevronRight size={14} />
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>{product.name}</span>
          </div>

          {/* Product Overview Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.05)',
              border: '1.5px solid #f1f5f9',
              marginBottom: '3.5rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'clamp(2rem, 4vw, 3.5rem)',
                alignItems: 'start',
              }}
            >
              {/* Gallery Left */}
              <div>
                <Gallery images={product.images || [product.image]} />
              </div>

              {/* Product Details Right */}
              <div>
                {/* Category & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {product.category?.name && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#7c3aed',
                        background: '#f3e8ff',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {product.category.name}
                    </span>
                  )}
                  {product.subCategory?.name && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                      • {product.subCategory.name}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', margin: '0.2rem 0 0.65rem', color: '#0f172a', lineHeight: 1.25 }}>
                  {product.name}
                </h1>

                {/* Rating & Verified Buyer Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                      color: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Star size={13} fill="#ffffff" color="#ffffff" /> {product.rating || '4.8'}
                  </span>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>
                    ({product.reviewsCount || 120}+ verified buyer reviews)
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={14} /> Verified Quality
                  </span>
                </div>

                {/* Price & Savings Box */}
                <div
                  style={{
                    marginBottom: '1.75rem',
                    padding: '1.35rem',
                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                    borderRadius: '16px',
                    border: '1.5px solid #e9d5ff',
                  }}
                >
                  <PriceDisplay price={product.price} discountPrice={product.discountPrice} size="lg" />

                  {hasDiscount && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: '0.65rem',
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                      }}
                    >
                      <Sparkles size={14} /> You save ₹{savings.toLocaleString('en-IN')} ({percentageOff}% OFF)
                    </div>
                  )}

                  <div style={{ fontSize: '0.82rem', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', fontWeight: 600 }}>
                    <Check size={14} color="#059669" /> Inclusive of all taxes • Free express shipping on orders above ₹499
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h4 style={{ fontSize: '0.98rem', marginBottom: '0.5rem', color: '#1e293b', fontWeight: 700 }}>
                    Product Description
                  </h4>
                  <p style={{ lineHeight: 1.7, color: '#475569', fontSize: '0.94rem', margin: 0 }}>
                    {product.description}
                  </p>
                </div>

                {/* Specifications & Highlights */}
                {product.characteristics && product.characteristics.length > 0 && (
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h4 style={{ fontSize: '0.98rem', marginBottom: '0.65rem', color: '#1e293b', fontWeight: 700 }}>
                      Highlights & Specifications
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                      {product.characteristics.map((spec, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700 }}>
                            {spec.key}
                          </span>
                          <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{spec.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Controls & Stock Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '10px', background: 'white', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ padding: '0.65rem 0.95rem', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <span style={{ minWidth: '42px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      style={{ padding: '0.65rem 0.95rem', color: '#334155', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    In Stock & Ready to Ship (24h Dispatch)
                  </span>
                </div>

                {/* Action Buttons: Add to Cart + Buy Now + Wishlist */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-outline btn-lg"
                    style={{
                      flex: 1,
                      minWidth: '160px',
                      borderRadius: '12px',
                      borderColor: '#7c3aed',
                      color: '#7c3aed',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="btn btn-primary btn-lg"
                    style={{
                      flex: 1,
                      minWidth: '160px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Zap size={18} /> Buy Now
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    aria-label="Wishlist"
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    style={{
                      padding: '0 1.25rem',
                      borderRadius: '12px',
                      border: inWishlist ? '1.5px solid #f43f5e' : '1.5px solid #e2e8f0',
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

                {/* WhatsApp Direct Order Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <MessageCircle size={18} /> Order Directly via WhatsApp
                </a>

                {/* Trust Badges */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#475569' }}>
                    <Banknote size={19} color="#059669" /> <strong>Cash on Delivery Available</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#475569' }}>
                    <Truck size={19} color="#7c3aed" /> <strong>Fast 24-48h Dispatch</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#475569' }}>
                    <RotateCcw size={19} color="#0284c7" /> <strong>7 Days Easy Replacement</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#475569' }}>
                    <ShieldCheck size={19} color="#7c3aed" /> <strong>100% Quality Checked</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Items in this Department */}
          {relatedProducts.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={18} color="#7c3aed" /> You May Also Like
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.86rem' }}>
                    More popular items from {product.category?.name || 'our catalog'}
                  </p>
                </div>
                <Link
                  to={`/products?category=${product.category?.slug || ''}`}
                  style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="product-grid-5">
                {relatedProducts.map((relProd) => (
                  <ProductCard key={relProd._id || relProd.id} product={relProd} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}


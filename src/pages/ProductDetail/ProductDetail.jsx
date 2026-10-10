import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Gallery from '../../components/product/Gallery';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { wishlistService } from '../../services/wishlist.service';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { getProductReviews } from '../../data';
import styles from './ProductDetail.module.css';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import ProductVariantSelector from '../../components/product/ProductVariantSelector/ProductVariantSelector';
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState('description');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Category-aware variant state — derived from product.variants ──
  const [selectedVariant, setSelectedVariant] = useState(null);

  const productReviews = useMemo(() => getProductReviews(product), [product]);

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const categorySlug = product?.category?.slug;
  const subCategorySlug = product?.subCategory?.slug;
  const pId = product?._id || product?.id || slug;

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        const item = res?.data || res;
        if (item && item.name) {
          setProduct(item);
          // Re-init variant when product loads
          const v = item.variants;
          if (v && v.type !== 'none') {
            setSelectedVariant(v.default || (v.options && v.options[0]) || null);
          } else {
            setSelectedVariant(null);
          }

          // Fetch real related products from DB matching category
          try {
            const catId = typeof item.category === 'object' ? (item.category?._id || item.category?.id) : item.category;
            const relatedRes = await productService.list(catId ? { category: catId, limit: 6 } : { limit: 6 });
            let rItems = relatedRes?.data?.data || relatedRes?.data || [];
            if (!Array.isArray(rItems) || rItems.length <= 1) {
              const allRes = await productService.list({ limit: 6 });
              rItems = allRes?.data?.data || allRes?.data || [];
            }
            if (Array.isArray(rItems)) {
              const currentId = item._id || item.id || slug;
              const filtered = rItems.filter((p) => (p._id || p.id || p.slug) !== currentId);
              setRelatedProducts(filtered.slice(0, 4));
            }
          } catch (rErr) {
            console.warn('Could not load related products:', rErr);
            setRelatedProducts([]);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className={styles['container']} style={{ textAlign: 'center', padding: '5rem 0' }}>
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

  const inWishlist = isInWishlist(pId);

  const handleToggleWishlist = async () => {
    toggleItem(product);
    showToast(
      inWishlist ? `Removed "${product.name}" from saved` : `Saved "${product.name}"!`,
      'success'
    );
    if (isLoggedIn) {
      try {
        await wishlistService.toggle(pId);
      } catch (_) {}
    }
  };

  const handleAddToCart = () => {
    const variantLabel = selectedVariant ? ` (${selectedVariant})` : '';
    addItem({ ...product, selectedVariant }, quantity);
    showToast(`Added ${quantity} × "${product.name}"${variantLabel} to your bag!`, 'success');
  };

  const handleBuyNow = () => {
    addItem({ ...product, selectedVariant }, quantity);
    navigate('/checkout');
  };

  const currentPrice = product.discountPrice || product.price || 2499;
  const originalPrice = product.price ? product.price + 1000 : 3499;
  const hasDiscount = true;
  const percentageOff = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 20;
  const savingsAmount = originalPrice - currentPrice;

  return (
    <PageWrapper>
      <div className={styles['product-detail-wrapper']}>
        <div className={styles['container']}>
          {/* Main Target Showcase Card */}
          <div className={styles['showcase-card']}>
            <div className={styles['showcase-grid']}>
              {/* Left Column: Gallery with Floating Wishlist */}
              <div>
                <Gallery
                  images={product.images || [product.image]}
                  productName={product.name}
                  inWishlist={inWishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              </div>

              {/* Right Column: Product Details & Controls */}
              <div className={styles['details-col']}>
                {/* ── Clickable Multi-Level Breadcrumb Nav (Item 9) ── */}
                <nav className={styles['breadcrumb-nav']} aria-label="Breadcrumb">
                  <Link to="/" className={styles['breadcrumb-link']}>Home</Link>
                  <span className={styles['breadcrumb-sep']}>/</span>
                  <Link to="/products" className={styles['breadcrumb-link']}>Products</Link>
                  {product.category?.name && (
                    <>
                      <span className={styles['breadcrumb-sep']}>/</span>
                      <Link
                        to={`/products?category=${product.category?.slug || ''}`}
                        className={styles['breadcrumb-link']}
                      >
                        {product.category.name}
                      </Link>
                    </>
                  )}
                  {product.subCategory?.name && (
                    <>
                      <span className={styles['breadcrumb-sep']}>/</span>
                      <span className={styles['breadcrumb-sub']}>{product.subCategory.name}</span>
                    </>
                  )}
                </nav>

                {/* Main Product Title */}
                <h1 className={styles['product-title']}>
                  {product.name || 'MUSTARD EMBROIDERED KURTA'}
                </h1>

                {/* Subtitle / Tagline */}
                <p className={styles['product-subtitle']}>
                  A contemporary take on traditional craftsmanship.
                </p>

                {/* Product Metadata & Trust Bar (Rating, Urgency Stock, Clickable Authentic Tag) */}
                <div className={styles['product-meta-bar']}>
                  <div className={styles['rating-block']}>
                    <div className={styles['stars']}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span className={styles['rating-num']}>
                      {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
                    </span>
                  </div>

                  {/* Scarcity Messaging (Item 4) */}
                  {product.stock !== undefined ? (
                    <span
                      className={`${styles['stock-pill']} ${
                        product.stock > 0
                          ? product.stock <= 5
                            ? styles['critical-stock']
                            : product.stock <= 10
                            ? styles['low-stock']
                            : styles['in-stock']
                          : styles['out-of-stock']
                      }`}
                    >
                      <span
                        className={`${styles['stock-dot']} ${
                          product.stock > 0 && product.stock <= 10 ? styles['pulse'] : ''
                        }`}
                      />
                      {product.stock > 0
                        ? product.stock <= 5
                          ? `Only ${product.stock} left in stock!`
                          : product.stock <= 10
                          ? `Only ${product.stock} left in stock`
                          : 'In Stock'
                        : 'Out of Stock'}
                    </span>
                  ) : (
                    <span className={`${styles['stock-pill']} ${styles['in-stock']}`}>
                      <span className={styles['stock-dot']} />
                      In Stock
                    </span>
                  )}

                  {/* Clickable 100% Authentic Badge (Item 8) */}
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className={styles['meta-tag-pill']}
                    title="Click to view authenticity certification & guarantees"
                  >
                    <ShieldCheck size={14} color="#7c3aed" />
                    <span>100% Authentic</span>
                    <Info size={12} color="#7c3aed" />
                  </button>
                </div>

                {/* Clean Dedicated Luxury Price Row with Concrete Savings (Item 1) */}
                <div className={styles['price-row']}>
                  <span className={styles['main-price']}>
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className={styles['strike-price']}>
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className={styles['discount-pill']}>
                        Save ₹{savingsAmount.toLocaleString('en-IN')} ({percentageOff}% OFF)
                      </span>
                    </>
                  )}
                </div>

                <div className={styles['section-divider']} />

                {/* ── Dynamic Variant Selector — category-aware ── */}
                {product.variants && product.variants.type !== 'none' && (
                  <div className={styles['size-section']}>
                    <ProductVariantSelector
                      variants={product.variants}
                      selected={selectedVariant}
                      onChange={setSelectedVariant}
                      categorySlug={categorySlug}
                      product={product}
                    />
                  </div>
                )}

                {/* Quantity Section */}
                <div className={styles['quantity-section']}>
                  <span className={styles['section-label']}>QUANTITY</span>
                  <div className={styles['quantity-stepper']}>
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className={styles['stepper-btn']}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles['stepper-val']}>{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className={styles['stepper-btn']}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row: [ ADD TO CART ] and [ BUY NOW ] Side-by-Side */}
                <div className={styles['action-row']}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={styles['btn-add-cart-outline']}
                    title="Add item to your shopping bag"
                  >
                    <ShoppingCart size={19} strokeWidth={2.2} />
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className={styles['btn-buy-now-solid']}
                    title="Proceed directly to checkout"
                  >
                    <span>BUY NOW</span>
                  </button>
                </div>

                {/* Trust Features Strip */}
                <div className={styles['trust-strip']}>
                  <div className={styles['trust-col']}>
                    <Truck size={22} className={styles['trust-icon']} />
                    <span className={styles['trust-title']}>Free Shipping</span>
                    <span className={styles['trust-desc']}>on orders above ₹999</span>
                  </div>

                  <div className={styles['trust-col']}>
                    <RotateCcw size={22} className={styles['trust-icon']} />
                    <span className={styles['trust-title']}>Easy Returns</span>
                    <span className={styles['trust-desc']}>5-7 days</span>
                  </div>

                  <div className={styles['trust-col']}>
                    <ShieldCheck size={22} className={styles['trust-icon']} />
                    <span className={styles['trust-title']}>Secure Payment</span>
                    <span className={styles['trust-desc']}>100% safe</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Product Details & Specifications & Reviews Tabs Section (Matching Screenshots 2, 3, 4) */}
          <div className={styles['tabs-section-wrapper']}>
            <div className={styles['tabs-nav-bar-container']}>
              <div className={styles['tabs-nav-bar']}>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab('description')}
                  className={`${styles['detail-tab-btn']} ${
                    activeDetailTab === 'description' ? styles['active'] : ''
                  }`}
                >
                  Description
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('specs')}
                  className={`${styles['detail-tab-btn']} ${
                    activeDetailTab === 'specs' ? styles['active'] : ''
                  }`}
                >
                  Specifications
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailTab('reviews')}
                  className={`${styles['detail-tab-btn']} ${
                    activeDetailTab === 'reviews' ? styles['active'] : ''
                  }`}
                >
                  Rating &amp; Reviews
                </button>
              </div>
            </div>

            <div className={styles['tab-panel-content']}>
              {/* Tab 1: Description Panel (Matching Image 4) */}
              {activeDetailTab === 'description' && (
                <div className={styles['description-panel-inner']}>
                  <h2 className={styles['desc-hero-title']}>
                    Unparalleled Design &amp; Quality
                  </h2>
                  <p className={styles['desc-hero-text']}>
                    {product.description ||
                      `This ${product.name || 'product'} is a premium piece from our catalog, designed with excellence in mind for the Picky platform. Engineered for maximum performance and reliability. Features durable build quality, premium material selection, and an intuitive user experience for everyday efficiency.`}
                  </p>

                  <div className={styles['features-grid']}>
                    <div className={styles['feature-bubble-col']}>
                      <div className={styles['feature-icon-circle']}>
                        <ShieldCheck size={28} />
                      </div>
                      <span className={styles['feature-bubble-title']}>
                        Premium Authenticity
                      </span>
                    </div>

                    <div className={styles['feature-bubble-col']}>
                      <div className={styles['feature-icon-circle']}>
                        <RotateCcw size={28} />
                      </div>
                      <span className={styles['feature-bubble-title']}>
                        Sustainable Practices
                      </span>
                    </div>

                    <div className={styles['feature-bubble-col']}>
                      <div className={styles['feature-icon-circle']}>
                        <Zap size={28} />
                      </div>
                      <span className={styles['feature-bubble-title']}>
                        Cutting-edge Utility
                      </span>
                    </div>

                    <div className={styles['feature-bubble-col']}>
                      <div className={styles['feature-icon-circle']}>
                        <Truck size={28} />
                      </div>
                      <span className={styles['feature-bubble-title']}>
                        Free Global Shipping
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Specifications Panel (Matching Image 3) */}
              {activeDetailTab === 'specs' && (
                <div className={styles['specs-table-card']}>
                  <div className={styles['specs-table-header']}>
                    <span className={styles['specs-table-header-title']}>Technical Spec</span>
                    <span className={styles['specs-table-header-title']}>Detail</span>
                  </div>

                  {product.characteristics && product.characteristics.length > 0 ? (
                    product.characteristics.map((spec, i) => (
                      <div key={i} className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>{spec.key}</span>
                        <strong className={styles['spec-table-list-value']}>{spec.value}</strong>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>Connectivity</span>
                        <strong className={styles['spec-table-list-value']}>Bluetooth 5.2, USB-C</strong>
                      </div>
                      <div className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>Driver Type</span>
                        <strong className={styles['spec-table-list-value']}>40mm Dynamic Drivers</strong>
                      </div>
                      <div className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>Battery Life</span>
                        <strong className={styles['spec-table-list-value']}>40 Hours (ANC On)</strong>
                      </div>
                      <div className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>Frequency</span>
                        <strong className={styles['spec-table-list-value']}>20Hz - 40,000Hz</strong>
                      </div>
                      <div className={styles['spec-table-list-row']}>
                        <span className={styles['spec-table-list-label']}>Weight</span>
                        <strong className={styles['spec-table-list-value']}>260g</strong>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 3: Rating & Reviews Panel */}
              {activeDetailTab === 'reviews' && (
                <div style={{ maxWidth: '780px', margin: '0.5rem auto' }}>
                  {/* Clean Top Rating Score Banner */}
                  <div
                    style={{
                      maxWidth: '380px',
                      margin: '0 auto 2rem',
                      textAlign: 'center',
                      padding: '1.75rem 1.5rem',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#7c3aed',
                        background: '#f3e8ff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        display: 'inline-block',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Customer Rating
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '3.4rem',
                          fontWeight: 900,
                          color: '#0f172a',
                          lineHeight: 1,
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
                      </span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 600, color: '#94a3b8' }}>
                        / 5.0
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>

                  {/* Customer Reviews Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '0 0 0.25rem 0',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Verified Customer Reviews
                    </h3>

                    {productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '1.4rem 1.6rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            {rev.avatar ? (
                              <img
                                src={rev.avatar}
                                alt={rev.name}
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '1.5px solid #f1f5f9',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  background: '#f3e8ff',
                                  color: '#7c3aed',
                                  fontWeight: 800,
                                  fontSize: '0.92rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {rev.initials || rev.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                                {rev.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#64748b',
                                  marginTop: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                {rev.verified && (
                                  <span style={{ color: '#16a34a', fontWeight: 600 }}>
                                    Verified Buyer
                                  </span>
                                )}
                                {rev.city && <span>• {rev.city}</span>}
                                {rev.date && <span>• {rev.date}</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                            ))}
                          </div>
                        </div>

                        <p
                          style={{
                            color: '#334155',
                            fontSize: '0.92rem',
                            lineHeight: 1.6,
                            margin: '0',
                            fontWeight: 400,
                          }}
                        >
                          “{rev.comment}”
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── You May Also Like Section ── */}
        {relatedProducts.length > 0 && (
          <div className={styles['related-section']}>
            <div className={styles['related-inner']}>
              <div className={styles['related-header']}>
                <div className={styles['related-header-left']}>
                  <span className={styles['related-eyebrow']}>Curated For You</span>
                  <h2 className={styles['related-title']}>You May Also Like</h2>
                </div>
                <Link to="/products" className={styles['related-view-all']}>
                  View All
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
              </div>
              <div className={styles['related-grid']}>
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id || p.id || p.slug} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 100% Authenticity Guarantee Modal (Item 8) ── */}
        {showAuthModal && (
          <div className={styles['auth-modal-overlay']} onClick={() => setShowAuthModal(false)}>
            <div className={styles['auth-modal-card']} onClick={(e) => e.stopPropagation()}>
              <div className={styles['auth-modal-header']}>
                <div className={styles['auth-modal-title-wrap']}>
                  <ShieldCheck size={26} color="#7c3aed" />
                  <h3 className={styles['auth-modal-title']}>100% Authenticity Guarantee</h3>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className={styles['auth-modal-close']}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div className={styles['auth-modal-body']}>
                <div className={styles['auth-feature-item']}>
                  <div className={styles['auth-feature-badge']}>✓</div>
                  <div className={styles['auth-feature-content']}>
                    <strong>Direct Artisan & Certified Brand Sourcing</strong>
                    <p>Every product is sourced directly from verified master weavers, registered artisans, and authorized manufacturer hubs across India.</p>
                  </div>
                </div>

                <div className={styles['auth-feature-item']}>
                  <div className={styles['auth-feature-badge']}>✓</div>
                  <div className={styles['auth-feature-content']}>
                    <strong>3-Tier Quality Inspection</strong>
                    <p>Rigorous physical verification of raw materials, weave strength, stitching, color-fastness, and finishing standards before packaging.</p>
                  </div>
                </div>

                <div className={styles['auth-feature-item']}>
                  <div className={styles['auth-feature-badge']}>✓</div>
                  <div className={styles['auth-feature-content']}>
                    <strong>Tamper-Evident Packaging</strong>
                    <p>Packaged in specialized security-sealed bags with unique QC batch seals to ensure zero transit tampering.</p>
                  </div>
                </div>

                <div className={styles['auth-feature-item']}>
                  <div className={styles['auth-feature-badge']}>✓</div>
                  <div className={styles['auth-feature-content']}>
                    <strong>7-Day Doorstep Replacement / Refund</strong>
                    <p>If you find any deviation from the promised quality or authenticity, claim an instant doorstep pickup with 100% full refund.</p>
                  </div>
                </div>
              </div>

              <div className={styles['auth-modal-footer']}>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className={styles['auth-modal-btn']}
                >
                  Close & Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>{/* end .product-detail-wrapper */}
    </PageWrapper>
  );
}

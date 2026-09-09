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
import { getProductBySlug, getProducts } from '../../data';
import styles from './ProductDetail.module.css';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Zap
} from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(() => getProductBySlug(slug));
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeDetailTab, setActiveDetailTab] = useState('description');

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

  const pId = product._id || product.id || slug;
  const inWishlist = isInWishlist(pId);

  const relatedProducts = useMemo(() => {
    const all = getProducts();
    const exclude = (p) => (p._id || p.id || p.slug) === pId || p.slug === slug;

    // Primary: same category or matching tags
    const primary = all.filter((p) => {
      if (exclude(p)) return false;
      return (
        (product.category?.slug && p.category?.slug === product.category.slug) ||
        (product.category?.name && p.category?.name === product.category.name) ||
        (product.tags && p.tags && p.tags.some((t) => product.tags.includes(t)))
      );
    });

    // Fallback: anything else to fill up to 4
    const fallback = all.filter(
      (p) => !exclude(p) && !primary.find((x) => (x._id || x.id || x.slug) === (p._id || p.id || p.slug))
    );

    return [...primary, ...fallback].slice(0, 4);
  }, [product, pId, slug]);

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
    addItem({ ...product, selectedSize }, quantity);
    showToast(`Added ${quantity} × "${product.name}" (${selectedSize}) to your bag!`, 'success');
  };

  const currentPrice = product.discountPrice || product.price || 2499;
  const originalPrice = product.price ? product.price + 1000 : 3499;
  const hasDiscount = true;
  const percentageOff = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 20;

  return (
    <PageWrapper>
      <div className={styles['product-detail-wrapper']}>
        <div className={styles['container']}>
          {/* Main Target Showcase Card */}
          <div className={styles['showcase-card']}>
            <div className={styles['showcase-grid']}>
              {/* Left Column: Gallery (Vertical Thumbnails + Main Hero Image + Script Overlay) */}
              <div>
                <Gallery
                  images={product.images || [product.image]}
                  productName={product.name}
                />
              </div>

              {/* Right Column: Product Details & Controls (Matching Image 1 Exactly) */}
              <div className={styles['details-col']}>
                {/* Category Breadcrumb */}
                <div className={styles['category-tag']}>
                  {product.category?.name || 'WOMEN'} / {product.subCategory?.name || 'KURTAS'}
                </div>

                {/* Main Product Title */}
                <h1 className={styles['product-title']}>
                  {product.name || 'MUSTARD EMBROIDERED KURTA'}
                </h1>

                {/* Subtitle / Tagline */}
                <p className={styles['product-subtitle']}>
                  A contemporary take on traditional craftsmanship.
                </p>

                {/* Pricing & Rating Row */}
                <div className={styles['price-rating-row']}>
                  <span className={styles['main-price']}>
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className={styles['strike-price']}>
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className={styles['discount-pill']}>
                        {percentageOff}% OFF
                      </span>
                    </>
                  )}

                  <div className={styles['rating-block']}>
                    <div className={styles['stars']}>
                      <Star size={14} fill="#d9a04a" color="#d9a04a" />
                      <Star size={14} fill="#d9a04a" color="#d9a04a" />
                      <Star size={14} fill="#d9a04a" color="#d9a04a" />
                      <Star size={14} fill="#d9a04a" color="#d9a04a" />
                      <Star size={14} fill="#d9a04a" color="#d9a04a" />
                    </div>
                    <span>4.8</span>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span>128 Reviews</span>
                  </div>
                </div>

                <div className={styles['section-divider']} />

                {/* Select Size Section */}
                <div className={styles['size-section']}>
                  <div className={styles['size-header-row']}>
                    <span className={styles['section-label']}>SELECT SIZE</span>
                  </div>

                  <div className={styles['size-grid']}>
                    {sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`${styles['size-btn']} ${
                          selectedSize === sz ? styles['selected'] : ''
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

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

                {/* Action Buttons Row */}
                <div className={styles['action-row']}>
                  <button onClick={handleAddToCart} className={styles['btn-add-bag']}>
                    <div className={styles['btn-icon-bubble-left']}>
                      <ShoppingCart size={20} color="#ffffff" />
                    </div>
                    <div className={styles['btn-divider']} />
                    <span className={styles['btn-title']}>ADD TO BAG</span>
                    <div className={styles['btn-icon-bubble-right']}>
                      <ArrowRight size={20} color="#ffffff" />
                    </div>
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className={`${styles['btn-save-wishlist']} ${
                      inWishlist ? styles['active'] : ''
                    }`}
                  >
                    <div className={styles['btn-save-bubble']}>
                      <Heart
                        size={20}
                        fill={inWishlist ? '#e11d48' : 'transparent'}
                        color={inWishlist ? '#e11d48' : '#e11d48'}
                        strokeWidth={2.2}
                      />
                    </div>
                    <div className={styles['btn-save-divider']} />
                    <span className={styles['btn-save-title']}>SAVE</span>
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
                    <span className={styles['trust-desc']}>7 days</span>
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
                  Reviews
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

              {/* Tab 3: Reviews Panel (Matching Image 2) */}
              {activeDetailTab === 'reviews' && (
                <div className={styles['reviews-grid-container']}>
                  {/* Left Column: Rating Details & Write Review CTA */}
                  <div className={styles['rating-details-col']}>
                    <h3 className={styles['reviews-section-title']}>Rating Details</h3>

                    <div className={styles['rating-bars-list']}>
                      <div className={styles['rating-bar-row']}>
                        <span className={styles['rating-star-num']}>5</span>
                        <div className={styles['progress-track']}>
                          <div className={styles['progress-fill']} style={{ width: '82%' }} />
                        </div>
                        <span className={styles['rating-percent-val']}>82%</span>
                      </div>

                      <div className={styles['rating-bar-row']}>
                        <span className={styles['rating-star-num']}>4</span>
                        <div className={styles['progress-track']}>
                          <div className={styles['progress-fill']} style={{ width: '12%' }} />
                        </div>
                        <span className={styles['rating-percent-val']}>12%</span>
                      </div>

                      <div className={styles['rating-bar-row']}>
                        <span className={styles['rating-star-num']}>3</span>
                        <div className={styles['progress-track']}>
                          <div className={styles['progress-fill']} style={{ width: '4%' }} />
                        </div>
                        <span className={styles['rating-percent-val']}>4%</span>
                      </div>

                      <div className={styles['rating-bar-row']}>
                        <span className={styles['rating-star-num']}>2</span>
                        <div className={styles['progress-track']}>
                          <div className={styles['progress-fill']} style={{ width: '1%' }} />
                        </div>
                        <span className={styles['rating-percent-val']}>1%</span>
                      </div>

                      <div className={styles['rating-bar-row']}>
                        <span className={styles['rating-star-num']}>1</span>
                        <div className={styles['progress-track']}>
                          <div className={styles['progress-fill']} style={{ width: '1%' }} />
                        </div>
                        <span className={styles['rating-percent-val']}>1%</span>
                      </div>
                    </div>

                    <div className={styles['write-review-box']}>
                      <p className={styles['write-review-prompt']}>
                        Are you a customer? Share your experience with Picky Premium Store.
                      </p>
                      <button type="button" className={styles['btn-write-review']}>
                        Write a Review
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Latest Customer Reviews */}
                  <div className={styles['reviews-list-col']}>
                    <div className={styles['reviews-header-row']}>
                      <h3 className={styles['reviews-section-title']} style={{ margin: 0 }}>
                        Latest Customer Reviews
                      </h3>
                      <div className={styles['reviews-header-right']}>
                        <span className={styles['sort-text']}>Sort by: <strong>Most Recent</strong></span>
                        <span className={styles['view-all-link']}>View All &rarr;</span>
                      </div>
                    </div>

                    {/* Review Card 1 */}
                    <div className={styles['review-card']}>
                      <div className={styles['review-card-header']}>
                        <div className={styles['reviewer-profile']}>
                          <div className={styles['reviewer-avatar']}>SL</div>
                          <div className={styles['reviewer-info']}>
                            <span className={styles['reviewer-name']}>Sarah L.</span>
                            <span className={styles['reviewer-verified']}>
                              Verified Buyer &bull; October 12, 2025
                            </span>
                          </div>
                        </div>

                        <div className={styles['review-stars']}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        </div>
                      </div>

                      <p className={styles['review-text-content']}>
                        &ldquo;Absolutely incredible! The quality exceeded my expectations and the delivery was super fast. Highly recommend.&rdquo;
                      </p>

                      <div className={styles['review-thumbnails-row']}>
                        <img
                          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt="Review attachment"
                          className={styles['review-thumb']}
                        />
                        <img
                          src={product.images?.[1] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt="Review attachment"
                          className={styles['review-thumb']}
                        />
                      </div>
                    </div>

                    {/* Review Card 2 */}
                    <div className={styles['review-card']}>
                      <div className={styles['review-card-header']}>
                        <div className={styles['reviewer-profile']}>
                          <div className={styles['reviewer-avatar']} style={{ background: '#bfdbfe', color: '#1e40af' }}>MR</div>
                          <div className={styles['reviewer-info']}>
                            <span className={styles['reviewer-name']}>Michael R.</span>
                            <span className={styles['reviewer-verified']}>
                              Verified Buyer &bull; September 28, 2025
                            </span>
                          </div>
                        </div>

                        <div className={styles['review-stars']}>
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        </div>
                      </div>

                      <p className={styles['review-text-content']}>
                        &ldquo;A premium product through and through. The detailing is perfect and it feels extremely durable in hand.&rdquo;
                      </p>

                      <div className={styles['review-thumbnails-row']}>
                        <img
                          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt="Review attachment"
                          className={styles['review-thumb']}
                        />
                      </div>
                    </div>
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
      </div>{/* end .product-detail-wrapper */}
    </PageWrapper>

  );
}

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useMockStockStore } from '../../store/mockStockStore';
import { wishlistService } from '../../services/wishlist.service';
import styles from './Wishlist.module.css';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { usePageCustomization } from '../../store/customizationStore';
import {
  Heart,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Tag,
  AlertTriangle,
  Trash2,
  Check,
  Flame,
  Zap,
  ShieldCheck,
  Truck,
  Headphones,
  RotateCcw
} from 'lucide-react';

// Sample Kurta Collection items for manual Demo testing
export const DEFAULT_WISHLIST_ITEMS = [
  {
    _id: 'w_item_1',
    id: 'w_item_1',
    name: 'Embroidered Kurta',
    slug: 'embroidered-kurta',
    price: 3499,
    discountPrice: 2499,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    colors: ['#eab308', '#fef08a', '#78350f', '#991b1b'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' },
    stock: 12,
  },
  {
    _id: 'w_item_2',
    id: 'w_item_2',
    name: 'Printed Anarkali',
    slug: 'printed-anarkali',
    price: 2699,
    discountPrice: 1899,
    originalPrice: 2699,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    colors: ['#f472b6', '#d97706', '#a16207', '#18181b'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Anarkalis', slug: 'womens-fashion' },
    stock: 3, // Low stock demo!
  },
  {
    _id: 'w_item_3',
    id: 'w_item_3',
    name: 'Chikankari Kurta',
    slug: 'chikankari-kurta',
    price: 3999,
    discountPrice: 2999,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80',
    colors: ['#fef08a', '#f472b6', '#fb7185', '#0284c7'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' },
    stock: 0, // Out of Stock demo!
  },
  {
    _id: 'w_item_4',
    id: 'w_item_4',
    name: 'A-Line Kurta',
    slug: 'a-line-kurta',
    price: 2499,
    discountPrice: 1799,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
    colors: ['#15803d', '#86198f', '#1e1b4b', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' },
    stock: 18,
  }
];

export const ASSURANCE_FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Verified Authentic',
    desc: 'Directly sourced from certified brands and master artisans with verifiable hallmark purity and authenticity.',
  },
  {
    icon: Truck,
    title: 'Free Insured Shipping',
    desc: 'Complimentary priority doorstep delivery across India with 100% zero-loss tamper-proof transit insurance.',
  },
  {
    icon: Headphones,
    title: 'Dedicated VIP Concierge',
    desc: 'Personalized 1-on-1 styling assistance, custom size guidance, and 24/7 dedicated customer care.',
  },
  {
    icon: RotateCcw,
    title: 'Hassle-Free 7-Day Returns',
    desc: 'Instant seamless return requests and complimentary doorstep pickups with 100% direct account refunds.',
  },
];

export default function Wishlist() {
  const { isEnabled, getSetting } = usePageCustomization('wishlist');
  const { items, removeItem, setWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const { stockMap } = useMockStockStore();

  const [sortBy, setSortBy] = useState('recent');
  const [productToRemove, setProductToRemove] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState({});
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Fetch recommended trending drops for running marquee showcase
  useEffect(() => {
    let isMounted = true;
    async function loadRecommended() {
      try {
        const res = await productService.list({ limit: 12, sort: '-rating' });
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (isMounted) {
          if (items.length > 0) {
            setRecommendedProducts(items);
          } else {
            setRecommendedProducts(DEFAULT_WISHLIST_ITEMS);
          }
        }
      } catch (err) {
        console.error('Failed to load recommended products:', err);
        if (isMounted) {
          setRecommendedProducts(DEFAULT_WISHLIST_ITEMS);
        }
      }
    }
    loadRecommended();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate items for perfectly seamless 50% infinite translation loop
  const marqueeRecommended = useMemo(() => {
    if (recommendedProducts.length === 0) return [];
    let list = [...recommendedProducts];
    while (list.length < 12) {
      list = [...list, ...recommendedProducts];
    }
    return [...list, ...list];
  }, [recommendedProducts]);

  // Real store logic: If logged in, load server wishlist. Do NOT auto-inject mock items!
  useEffect(() => {
    async function loadServerWishlist() {
      if (isLoggedIn) {
        try {
          const res = await wishlistService.get();
          const serverProducts = res?.data?.products || [];
          if (serverProducts.length > 0) {
            setWishlist(serverProducts);
          }
        } catch (err) {
          console.error('Failed to load server wishlist:', err);
        }
      }
    }
    loadServerWishlist();
  }, [isLoggedIn, setWishlist]);

  // Stock resolution helper
  const getProductStock = (product) => {
    const pId = product._id || product.id;
    if (stockMap && stockMap[pId] !== undefined) return stockMap[pId];
    if (typeof product.stock === 'number') return product.stock;
    if (product.isOutOfStock) return 0;
    return 10;
  };

  // Size helper
  const getProductSizes = (product) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) return product.sizes;
    if (Array.isArray(product.variants?.options) && product.variants.options.length > 0) return product.variants.options;
    return ['XS', 'S', 'M', 'L', 'XL'];
  };

  // Default size helper
  const getDefaultSize = (product) => {
    const sizes = getProductSizes(product);
    if (product.variants?.default && sizes.includes(product.variants.default)) {
      return product.variants.default;
    }
    return sizes.includes('M') ? 'M' : sizes[0] || 'Free Size';
  };

  // Color helper
  const getProductColors = (product) => {
    if (Array.isArray(product.colors) && product.colors.length > 0) return product.colors;
    if (Array.isArray(product.variants?.colors) && product.variants.colors.length > 0) return product.variants.colors;
    return [];
  };

  const displayItems = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return list;
  }, [items, sortBy]);

  const wishlistValue = displayItems.reduce((sum, p) => sum + (p.discountPrice || p.price || 0), 0);
  const potentialSavings = displayItems.reduce((sum, p) => {
    const orig = p.originalPrice || p.price || 0;
    const curr = p.discountPrice || p.price || 0;
    return sum + Math.max(0, orig - curr);
  }, 0);


  const handleRemoveItem = (product) => {
    if (!product) return;
    if (typeof product === 'object') {
      setProductToRemove(product);
    } else {
      const found = displayItems.find((i) => (i._id || i.id) === product);
      setProductToRemove(found || { _id: product, id: product, name: 'Product' });
    }
  };

  const confirmRemove = async () => {
    if (!productToRemove) return;
    const pId = productToRemove._id || productToRemove.id;
    const pName = productToRemove.name || 'Item';

    removeItem(pId);
    if (isLoggedIn) {
      try {
        await wishlistService.remove(pId);
      } catch (_) {}
    }

    showToast(`Removed "${pName}" from wishlist`, 'info');
    setProductToRemove(null);
  };

  const handleMoveToCart = (product) => {
    const pId = product._id || product.id || product.slug;
    const stock = getProductStock(product);

    if (stock <= 0) {
      showToast(`"${product.name}" is currently out of stock.`, 'error');
      return;
    }

    addItem({
      ...product,
      selectedSize: null,
      selectedColor: null,
    }, 1);

    setAddedFeedback((prev) => ({ ...prev, [pId]: true }));
    setTimeout(() => {
      setAddedFeedback((prev) => ({ ...prev, [pId]: false }));
    }, 1600);

    showToast(`Added "${product.name}" to cart! Select size in bag.`, 'success');
  };

  const handleMoveAllToCart = async () => {
    if (items.length === 0) return;

    const inStockItems = items.filter((prod) => getProductStock(prod) > 0);
    const outOfStockCount = items.length - inStockItems.length;

    if (inStockItems.length === 0) {
      showToast('All items in your wishlist are currently out of stock.', 'error');
      return;
    }

    inStockItems.forEach((prod) => {
      addItem({
        ...prod,
        selectedSize: null,
        selectedColor: null,
      }, 1);
    });

    if (isLoggedIn) {
      try {
        await wishlistService.clear?.();
      } catch (_) {}
    }

    clearWishlist();

    if (outOfStockCount > 0) {
      showToast(`Moved ${inStockItems.length} items to bag! (${outOfStockCount} out-of-stock item kept in wishlist)`, 'info');
    } else {
      showToast(`Moved all ${items.length} items to your bag! Select size in bag.`, 'success');
    }
  };

  const handleLoadSampleItems = () => {
    setWishlist(DEFAULT_WISHLIST_ITEMS);
    showToast('Loaded sample festive Kurtas to your Wishlist!', 'info');
  };

  return (
    <PageWrapper>
      <div className={styles['wishlist-wrapper']}>
        <div className={styles['container']}>
          {/* ── Luxury Stats Strip (Page Header) ── */}
          {isEnabled('wishlist_stats') && (
          <div className={styles['stats-strip']}>
            <div className={styles['stats-cards-row']}>
              {/* Stat 1 – Total Items */}
              {getSetting('wishlist_stats', 'showTotalItems', true) && (
              <div className={`${styles['stat-card-wrapper']} ${styles['active-wrapper']}`}>
                <div className={`${styles['stat-card']} ${styles['stat-card-active']}`}>
                  <div className={styles['stat-icon-wrap']}>
                    <Heart size={22} strokeWidth={1.8} />
                  </div>
                  <div className={styles['stat-value']}>
                    {String(displayItems.length).padStart(2, '0')}
                  </div>
                  <div className={styles['stat-label']}>TOTAL ITEMS</div>
                  <div className={styles['stat-underline']} />
                </div>
              </div>
              )}

              {getSetting('wishlist_stats', 'showTotalItems', true) && getSetting('wishlist_stats', 'showWishlistValue', true) && (
              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>
              )}

              {/* Stat 2 – Wishlist Value */}
              {getSetting('wishlist_stats', 'showWishlistValue', true) && (
              <div className={styles['stat-card-wrapper']}>
                <div className={styles['stat-card']}>
                  <div className={styles['stat-icon-wrap']}>
                    <ShoppingCart size={22} strokeWidth={1.8} />
                  </div>
                  <div className={styles['stat-value']}>
                    ₹{wishlistValue.toLocaleString('en-IN')}
                  </div>
                  <div className={styles['stat-label']}>WISHLIST VALUE</div>
                  <div className={styles['stat-underline']} />
                </div>
              </div>
              )}

              {getSetting('wishlist_stats', 'showWishlistValue', true) && getSetting('wishlist_stats', 'showPotentialSavings', true) && (
              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>
              )}

              {/* Stat 3 – Potential Savings */}
              {getSetting('wishlist_stats', 'showPotentialSavings', true) && (
              <div className={styles['stat-card-wrapper']}>
                <div className={styles['stat-card']}>
                  <div className={styles['stat-icon-wrap']}>
                    <Tag size={22} strokeWidth={1.8} />
                  </div>
                  <div className={styles['stat-value']}>
                    ₹{potentialSavings.toLocaleString('en-IN')}
                  </div>
                  <div className={styles['stat-label']}>POTENTIAL SAVINGS</div>
                  <div className={styles['stat-underline']} />
                </div>
              </div>
              )}
            </div>
          </div>
          )}

          {/* ── Controls Bar ── */}
          {displayItems.length > 0 && (
            <div className={styles['controls-bar']}>
              <div className={styles['item-count-label']}>
                MY WISHLIST ({displayItems.length} {displayItems.length === 1 ? 'ITEM' : 'ITEMS'})
              </div>

              <div className={styles['controls-right-group']}>
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  className={styles['btn-move-all']}
                >
                  <Sparkles size={16} />
                  Move All to Bag
                </button>

                <div className={styles['sort-select-wrapper']}>
                  <span className={styles['sort-label']}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={styles['sort-dropdown']}
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Product Grid or Empty State ── */}
          {isEnabled('wishlist_grid') && (
            displayItems.length === 0 ? (
            <div className={styles['empty-card']}>
              <div className={styles['empty-icon-bubble']}>
                <Heart size={38} />
              </div>
              <h2 className={styles['empty-title']}>
                {getSetting('wishlist_grid', 'emptyTitle', 'Your Wishlist is Empty')}
              </h2>
              <p className={styles['empty-desc']}>
                {getSetting('wishlist_grid', 'emptySubtitle', 'Explore our festive collections and tap the heart icon to save your favorites!')}
              </p>
              <Link
                to="/products"
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {getSetting('wishlist_grid', 'shopButtonText', 'Explore Store')} <ArrowRight size={18} />
              </Link>

              <div>
                <button
                  type="button"
                  onClick={handleLoadSampleItems}
                  className={styles['empty-demo-btn']}
                >
                  Load Sample Kurtas (Demo Preview)
                </button>
              </div>
            </div>
          ) : (
            <div className={styles['wishlist-grid']}>
              {displayItems.map((product) => {
                const pId = product._id || product.id || product.slug;
                const stock = getProductStock(product);
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 5;
                const isAdded = !!addedFeedback[pId];

                const currentPrice = product.discountPrice || product.price || 0;
                const originalPrice = product.originalPrice || product.price || 0;
                const hasDiscount = originalPrice > currentPrice;
                const discountPercent = hasDiscount
                  ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                  : 0;

                const badgeInfo = isOutOfStock
                  ? { text: 'OUT OF STOCK', icon: Zap, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
                  : isLowStock
                  ? { text: `ONLY ${stock} LEFT`, icon: Zap, color: '#d97706', bg: '#fef3c7', border: '#fde68a' }
                  : discountPercent >= 50
                  ? { text: 'MEGA DEAL', icon: Zap, color: '#6d28d9', bg: '#f3e8ff', border: '#d8b4fe' }
                  : discountPercent >= 25
                  ? { text: 'TRENDING', icon: Flame, color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3' }
                  : { text: 'SELLING FAST', icon: Zap, color: '#d97706', bg: '#fef3c7', border: '#fde68a' };

                const BadgeIcon = badgeInfo.icon;

                return (
                  <div
                    key={pId}
                    className={`${styles['wishlist-card']} ${isOutOfStock ? styles['card-out-of-stock'] : ''}`}
                  >
                    {/* Top Image Section with Shop styling */}
                    <div className={styles['card-top']}>
                      {/* Background decorative circles */}
                      <div className={`${styles['ref-bg-circle']} ${styles['ref-circle-1']}`}></div>
                      <div className={`${styles['ref-bg-circle']} ${styles['ref-circle-2']}`}></div>
                      <div className={`${styles['ref-bg-circle']} ${styles['ref-circle-3']}`}></div>

                      {/* Sparkles */}
                      <div className={`${styles['ref-sparkle']} ${styles['ref-sparkle-1']}`}>✦</div>
                      <div className={`${styles['ref-sparkle']} ${styles['ref-sparkle-2']}`}>✦</div>
                      <div className={`${styles['ref-sparkle']} ${styles['ref-sparkle-3']}`}>✦</div>
                      <div className={`${styles['ref-sparkle']} ${styles['ref-sparkle-4']}`}>✦</div>

                      {/* Top Bar with Badge & Wishlist Heart */}
                      <div className={styles['ref-top-bar']}>
                        <div
                          className={styles['ref-mega-deal']}
                          style={{
                            color: badgeInfo.color,
                            background: badgeInfo.bg,
                            border: `1px solid ${badgeInfo.border}`,
                          }}
                        >
                          <span className={styles['ref-deal-icon']}>
                            <BadgeIcon size={12} fill={badgeInfo.color} color={badgeInfo.color} />
                          </span>
                          <span className={styles['ref-deal-text']} style={{ color: badgeInfo.color }}>
                            {badgeInfo.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={styles['ref-wishlist-btn']}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveItem(product);
                          }}
                          title="Remove from wishlist"
                          aria-label="Remove from wishlist"
                        >
                          <Heart size={16} color="#6d28d9" fill="#e11d48" strokeWidth={0} />
                        </button>
                      </div>

                      {/* Product Image */}
                      <Link to={`/products/${product.slug || pId}`} className={styles['ref-img-wrapper']}>
                        <img
                          src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700'}
                          alt={product.name}
                          className={styles['ref-product-img']}
                          loading="lazy"
                        />
                      </Link>
                    </div>

                    {/* Bottom Info Section */}
                    <div className={styles['ref-card-bottom']}>
                      <div className={styles['ref-title-rating']}>
                        <div className={styles['ref-title-section']}>
                          <Link to={`/products/${product.slug || pId}`} className={styles['ref-title-link']}>
                            <h3 className={styles['ref-product-title']} title={product.name}>
                              {product.name}
                            </h3>
                          </Link>
                          {(product.shortDescription || product.description) && (
                            <p
                              className={styles['ref-product-desc']}
                              title={product.shortDescription || product.description}
                            >
                              {product.shortDescription || product.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles['ref-price-row']}>
                        <span className={styles['ref-current-price']}>
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className={styles['ref-original-price']}>
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className={styles['ref-discount-pill']}>
                              {discountPercent}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className={styles['ref-actions-row']}>
                        <button
                          type="button"
                          className={styles['ref-add-cart-btn']}
                          onClick={() => handleMoveToCart(product)}
                          disabled={isOutOfStock}
                        >
                          {isOutOfStock ? (
                            <span>Out of Stock</span>
                          ) : isAdded ? (
                            <>
                              <Check size={15} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={15} />
                              <span>Move to Bag</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className={styles['ref-delete-btn']}
                          onClick={() => handleRemoveItem(product)}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

          {/* ── Recommended Products Running Showcase (Infinite 1-Row Marquee Loop) ── */}
          {isEnabled('wishlist_recommended') && marqueeRecommended.length > 0 && (
            <section className={styles['recommended-section']} aria-label="Recommended Products">
              <div className={styles['recommended-header']}>
                <div className={styles['recommended-badge']}>
                  <Sparkles size={14} className={styles['recommended-sparkle']} />
                  <span>{getSetting('wishlist_recommended', 'badgeText', 'CURATED PICKS FOR YOU')}</span>
                </div>
                <h3 className={styles['recommended-title']}>
                  {(() => {
                    const title = getSetting('wishlist_recommended', 'title', 'Recommended Products');
                    const words = title.split(' ');
                    if (words.length > 1) {
                      return (
                        <>
                          {words[0]} <span>{words.slice(1).join(' ')}</span>
                        </>
                      );
                    }
                    return title;
                  })()}
                </h3>
                <p className={styles['recommended-subtitle']}>
                  {getSetting('wishlist_recommended', 'subtitle', 'Trending favorites and top-rated drops handpicked to match your style.')}
                </p>
              </div>

              {/* Viewport for infinite running ribbon */}
              <div className={styles['recommended-viewport']}>
                <div className={styles['recommended-track']}>
                  {marqueeRecommended.map((prod, idx) => (
                    <div
                      key={`rec-${prod._id || prod.id || 'p'}-${idx}`}
                      className={styles['recommended-card-item']}
                    >
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── 4. Luxury Picky E-Commerce Curated Parallax Banner (100% Full Width & Fixed BG) ── */}
        {isEnabled('wishlist_parallax_banner') && (
        <section
          className={styles['wardrobe-banner-section']}
          aria-label="Curate Your Entire Wardrobe"
        >
          <div className={styles['wardrobe-banner-overlay']} />

          <div className={styles['wardrobe-banner-content']}>
            <span className={styles['wardrobe-atelier-tag']}>
              <Sparkles size={13} />
              <span>{getSetting('wishlist_parallax_banner', 'tagText', 'THE PICKY FLAGSHIP ATELIER')}</span>
            </span>

            <h2 className={styles['wardrobe-title']}>
              {getSetting('wishlist_parallax_banner', 'title', 'Curate Your Entire Wardrobe')}
            </h2>

            <div className={styles['wardrobe-sparkle-divider']}>✦</div>

            <p className={styles['wardrobe-desc']}>
              {getSetting('wishlist_parallax_banner', 'desc', 'Explore our latest arrivals across Fashion, Tech, Jewellery, and Lifestyle. Handcrafted and handpicked for your statement aesthetic.')}
            </p>

            <Link to={getSetting('wishlist_parallax_banner', 'ctaLink', '/new-arrivals')} className={styles['wardrobe-cta-btn']}>
              <span>{getSetting('wishlist_parallax_banner', 'ctaText', 'DISCOVER NEW ARRIVALS')}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        )}

        {/* ── 5. The Picky Assurance & Quality Guarantee Section ── */}
        {isEnabled('wishlist_assurance') && (
        <section
          className={styles['assurance-section']}
          aria-label="The Picky Assurance & Quality Guarantee"
        >
          <div className={styles['container']}>
            <div className={styles['assurance-header']}>
              <span className={styles['assurance-tag']}>
                {getSetting('wishlist_assurance', 'tagText', 'THE PICKY ASSURANCE')}
              </span>
              <h2 className={styles['assurance-title']}>
                {getSetting('wishlist_assurance', 'title', 'Authentic Service & Quality Guarantee')}
              </h2>
            </div>

            <div className={styles['assurance-grid']}>
              {ASSURANCE_FEATURES.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className={styles['assurance-card']}>
                    <div className={styles['assurance-icon-bubble']}>
                      <IconComponent size={24} strokeWidth={1.8} />
                    </div>
                    <h3 className={styles['assurance-card-title']}>{item.title}</h3>
                    <p className={styles['assurance-card-desc']}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        )}
      </div>

      {/* ── Remove Confirmation Modal ── */}
      {productToRemove && (
        <div className={styles['modal-overlay']} onClick={() => setProductToRemove(null)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-icon-box']}>
              <AlertTriangle size={28} strokeWidth={2.3} />
            </div>
            <h3 className={styles['modal-title']}>Remove from Wishlist?</h3>
            <p className={styles['modal-text']}>
              Are you sure you want to remove <strong>"{productToRemove.name}"</strong> from your saved wishlist?
            </p>
            <div className={styles['modal-actions']}>
              <button
                type="button"
                className={styles['modal-cancel-btn']}
                onClick={() => setProductToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles['modal-confirm-btn']}
                onClick={confirmRemove}
              >
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

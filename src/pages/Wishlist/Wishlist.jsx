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
  const { items, removeItem, setWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const { stockMap } = useMockStockStore();

  const [sortBy, setSortBy] = useState('recent');
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
          <div className={styles['stats-strip']}>
            <div className={styles['stats-cards-row']}>
              {/* Stat 1 – Total Items */}
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

              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>

              {/* Stat 2 – Wishlist Value */}
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

              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>

              {/* Stat 3 – Potential Savings */}
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
            </div>
          </div>

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
          {displayItems.length === 0 ? (
            <div className={styles['empty-card']}>
              <div className={styles['empty-icon-bubble']}>
                <Heart size={38} className={styles['empty-icon']} />
              </div>
              <h2 className={styles['empty-title']}>Your Wishlist is Empty</h2>
              <p className={styles['empty-desc']}>
                Explore our festive collections and tap the heart icon to save your favorites!
              </p>
              <Link
                to="/products"
                className={`btn btn-primary ${styles['empty-store-btn']}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <span>Explore Store</span> <ArrowRight size={16} />
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
              {displayItems.map((product) => (
                <ProductCard
                  key={product._id || product.id || product.slug}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* ── Recommended Products Running Showcase (Infinite 1-Row Marquee Loop) ── */}
          {marqueeRecommended.length > 0 && (
            <section className={styles['recommended-section']} aria-label="Recommended Products">
              <div className={styles['recommended-header']}>
                <div className={styles['recommended-badge']}>
                  <Sparkles size={14} className={styles['recommended-sparkle']} />
                  <span>CURATED PICKS FOR YOU</span>
                </div>
                <h3 className={styles['recommended-title']}>
                  Recommended <span>Products</span>
                </h3>
                <p className={styles['recommended-subtitle']}>
                  Trending favorites and top-rated drops handpicked to match your style.
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
        <section
          className={styles['wardrobe-banner-section']}
          aria-label="Curate Your Entire Wardrobe"
        >
          <div className={styles['wardrobe-banner-overlay']} />

          <div className={styles['wardrobe-banner-content']}>
            <span className={styles['wardrobe-atelier-tag']}>
              <Sparkles size={13} />
              <span>THE PICKY FLAGSHIP ATELIER</span>
            </span>

            <h2 className={styles['wardrobe-title']}>
              Curate Your Entire Wardrobe
            </h2>

            <div className={styles['wardrobe-sparkle-divider']}>✦</div>

            <p className={styles['wardrobe-desc']}>
              Explore our latest arrivals across Fashion, Tech, Jewellery, and Lifestyle. Handcrafted and handpicked for your statement aesthetic.
            </p>

            <Link to="/new-arrivals" className={styles['wardrobe-cta-btn']}>
              <span>DISCOVER NEW ARRIVALS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── 5. The Picky Assurance & Quality Guarantee Section ── */}
        <section
          className={styles['assurance-section']}
          aria-label="The Picky Assurance & Quality Guarantee"
        >
          <div className={styles['container']}>
            <div className={styles['assurance-header']}>
              <span className={styles['assurance-tag']}>
                THE PICKY ASSURANCE
              </span>
              <h2 className={styles['assurance-title']}>
                Authentic Service & Quality Guarantee
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
      </div>
    </PageWrapper>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductCard from '../../components/product/ProductCard';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';
import styles from './Wishlist.module.css';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Bell,
  Tag,
  AlertTriangle
} from 'lucide-react';

// Default Kurta Collection items matching User Screenshot exactly
const DEFAULT_WISHLIST_ITEMS = [
  {
    _id: 'w_item_1',
    id: 'w_item_1',
    name: 'Embroidered Kurta',
    price: 2499,
    discountPrice: 2499,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    colors: ['#eab308', '#fef08a', '#78350f', '#991b1b'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' }
  },
  {
    _id: 'w_item_2',
    id: 'w_item_2',
    name: 'Printed Anarkali',
    price: 1899,
    discountPrice: 1899,
    originalPrice: 2699,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    colors: ['#f472b6', '#d97706', '#a16207', '#18181b'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Anarkalis', slug: 'womens-fashion' }
  },
  {
    _id: 'w_item_3',
    id: 'w_item_3',
    name: 'Chikankari Kurta',
    price: 2999,
    discountPrice: 2999,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80',
    colors: ['#fef08a', '#f472b6', '#fb7185', '#0284c7'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' }
  },
  {
    _id: 'w_item_4',
    id: 'w_item_4',
    name: 'A-Line Kurta',
    price: 1799,
    discountPrice: 1799,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80',
    colors: ['#15803d', '#86198f', '#1e1b4b', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: { name: 'Kurtas', slug: 'womens-fashion' }
  }
];

export default function Wishlist() {
  const { items, removeItem, setWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const [sortBy, setSortBy] = useState('recent');
  const [productToRemove, setProductToRemove] = useState(null);

  // Populate default items if store items array is empty on initial render
  useEffect(() => {
    if (!items || items.length === 0) {
      setWishlist(DEFAULT_WISHLIST_ITEMS);
    }
  }, []);

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
  const priceDrops = displayItems.filter((p) => p.discountPrice && p.discountPrice < p.price).length;

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

  const handleMoveAllToCart = async () => {
    if (items.length === 0) return;

    items.forEach((prod) => {
      addItem(prod, 1);
    });

    if (isLoggedIn) {
      try {
        await wishlistService.clear?.();
      } catch (_) {}
    }

    clearWishlist();
    showToast(`Moved all ${items.length} items to your cart!`, 'success');
  };

  return (
    <PageWrapper>
      <div className={styles['wishlist-wrapper']}>
        <div className={styles['container']}>
          {/* ── Luxury Stats Strip (Page Header) ── */}
          <div className={styles['stats-strip']}>
            <div className={styles['stats-cards-row']}>
              {/* Stat 1 – Total Items */}
              <div className={styles['stat-card']}>
                <div className={styles['stat-icon-wrap']}>
                  <Heart size={22} strokeWidth={1.8} />
                </div>
                <div className={styles['stat-value']}>
                  {String(displayItems.length).padStart(2, '0')}
                </div>
                <div className={styles['stat-label']}>TOTAL ITEMS</div>
                <div className={styles['stat-underline']} />
              </div>

              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>

              {/* Stat 2 – Wishlist Value */}
              <div className={styles['stat-card']}>
                <div className={styles['stat-icon-wrap']}>
                  <ShoppingBag size={22} strokeWidth={1.8} />
                </div>
                <div className={styles['stat-value']}>
                  ₹{wishlistValue.toLocaleString('en-IN')}
                </div>
                <div className={styles['stat-label']}>WISHLIST VALUE</div>
                <div className={styles['stat-underline']} />
              </div>

              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>

              {/* Stat 3 – Potential Savings */}
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

              <div className={styles['stat-connector']}>
                <span className={styles['connector-dot']} />
                <div className={styles['connector-line']} />
                <span className={styles['connector-dot']} />
              </div>

              {/* Stat 4 – Price Drops */}
              <div className={styles['stat-card']}>
                <div className={styles['stat-icon-wrap']}>
                  <Bell size={22} strokeWidth={1.8} />
                </div>
                <div className={styles['stat-value']}>
                  {String(priceDrops).padStart(2, '0')}
                </div>
                <div className={styles['stat-label']}>PRICE DROPS</div>
                <div className={styles['stat-underline']} />
              </div>
            </div>
          </div>

          {/* ── Controls Bar ── */}
          {displayItems.length > 0 && (
            <div className={styles['controls-bar']}>
              <div className={styles['item-count-label']}>
                MY WISHLIST ({displayItems.length} ITEMS)
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

          {/* Wishlist Product Items Grid using Standard ProductCard */}
          {displayItems.length === 0 ? (
            <div className={styles['empty-card']}>
              <div className={styles['empty-icon-bubble']}>
                <Heart size={38} />
              </div>
              <h2 className={styles['empty-title']}>Your Wishlist is Empty</h2>
              <p className={styles['empty-desc']}>
                Explore our festive collections and tap the heart icon to save your favorites!
              </p>
              <Link
                to="/products"
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Explore Store <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles['wishlist-grid']}>
              {displayItems.map((product) => {
                const pId = product._id || product.id || product.slug;
                return (
                  <ProductCard
                    key={pId}
                    product={product}
                    onRemoveWishlist={handleRemoveItem}
                  />
                );
              })}
            </div>
          )}
        </div>
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

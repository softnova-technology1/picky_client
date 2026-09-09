import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';
import styles from './Wishlist.module.css';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  LayoutGrid,
  List,
  Sparkles,
  Bell,
  Tag,
  X
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
    category: { name: 'Kurtas' }
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
    category: { name: 'Anarkalis' }
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
    category: { name: 'Kurtas' }
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
    category: { name: 'Kurtas' }
  }
];

export default function Wishlist() {
  const { items, removeItem, setWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [itemSizes, setItemSizes] = useState({});

  // Populate default items if store items array is empty on initial render
  useEffect(() => {
    if (items.length === 0) {
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
    let list = [...items];
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

  const allSelected = displayItems.length > 0 && selectedIds.length === displayItems.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayItems.map((item) => item._id || item.id));
    }
  };

  const handleToggleSelectCard = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleMoveSingleToCart = async (product) => {
    const pId = product._id || product.id;
    const chosenSize = itemSizes[pId] || 'M';
    addItem({ ...product, selectedSize: chosenSize }, 1);
    removeItem(pId);
    setSelectedIds((prev) => prev.filter((i) => i !== pId));

    if (isLoggedIn) {
      try {
        await wishlistService.remove(pId);
      } catch (_) {}
    }

    showToast(`Moved "${product.name}" (${chosenSize}) to your bag!`, 'success');
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedIds.length === 0) {
      showToast('Please select items to move to bag', 'info');
      return;
    }

    const itemsToMove = displayItems.filter((i) => selectedIds.includes(i._id || i.id));
    itemsToMove.forEach((product) => {
      const pId = product._id || product.id;
      const chosenSize = itemSizes[pId] || 'M';
      addItem({ ...product, selectedSize: chosenSize }, 1);
      removeItem(pId);
    });

    setSelectedIds([]);
    showToast(`Moved ${itemsToMove.length} item(s) to your bag!`, 'success');
  };

  const handleRemoveItem = async (productId) => {
    removeItem(productId);
    setSelectedIds((prev) => prev.filter((i) => i !== productId));
    if (isLoggedIn) {
      try {
        await wishlistService.remove(productId);
      } catch (_) {}
    }
    showToast('Item removed from wishlist', 'info');
  };

  const handleSizeChange = (pId, size) => {
    setItemSizes((prev) => ({ ...prev, [pId]: size }));
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


          {/* Wishlist Product Items Grid */}
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
                const pId = product._id || product.id;
                const isSelected = selectedIds.includes(pId);
                const imageSrc =
                  product.images?.[0] ||
                  product.image ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';

                const currentPrice = product.discountPrice || product.price || 2499;
                const originalPrice = product.originalPrice || (product.price ? product.price + 1000 : 3499);
                const swatches = product.colors || ['#eab308', '#fef08a', '#78350f', '#991b1b'];

                return (
                  <div key={pId} className={styles['wishlist-card']}>
                    {/* Card Image Box */}
                    <div className={styles['card-image-wrapper']}>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(pId)}
                        className={styles['card-heart-badge']}
                        title="Remove from saved"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>

                      <Link to={`/products/${product.slug || ''}`}>
                        <img
                          src={imageSrc}
                          alt={product.name || 'Product'}
                          className={styles['card-img']}
                        />
                      </Link>
                    </div>

                    {/* Card Details Body */}
                    <div className={styles['card-body']}>
                      <Link to={`/products/${product.slug || ''}`}>
                        <h3 className={styles['card-title']}>{product.name}</h3>
                      </Link>

                      <div className={styles['price-row']}>
                        <span className={styles['current-price']}>
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                        {originalPrice > currentPrice && (
                          <span className={styles['original-price']}>
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Swatches & Size Select Row */}
                      <div className={styles['swatch-size-row']}>
                        <div className={styles['color-swatches']}>
                          {swatches.map((col, idx) => (
                            <span
                              key={idx}
                              className={styles['color-dot']}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>

                        <select
                          value={itemSizes[pId] || 'M'}
                          onChange={(e) => handleSizeChange(pId, e.target.value)}
                          className={styles['size-select-pill']}
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>

                      {/* Action Buttons Row: Move to Bag + Trash */}
                      <div className={styles['card-actions-row']}>
                        <button
                          type="button"
                          onClick={() => handleMoveSingleToCart(product)}
                          className={styles['btn-card-move']}
                        >
                          <ShoppingBag size={15} />
                          <span>Move to Bag</span>
                        </button>
                      </div>
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';
import { Heart, ShoppingBag, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const { items, removeItem, setWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

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

  // Handler for "Move to Cart" button on ProductCard
  const handleMoveToCart = async (product, size = null) => {
    const pId = product._id || product.id || product.slug;
    const itemToAdd = size ? { ...product, selectedSize: size } : product;
    
    addItem(itemToAdd, 1);
    removeItem(pId);

    if (isLoggedIn) {
      try {
        await wishlistService.remove(pId);
      } catch (_) {}
    }

    const sizeMsg = size ? ` (Size ${size})` : '';
    showToast(`Moved "${product.name}"${sizeMsg} to cart!`, 'success');
  };

  // Handler to open confirmation modal
  const promptRemoveProduct = (product) => {
    setProductToRemove(product);
  };

  // Confirmed deletion handler
  const confirmRemove = async () => {
    if (!productToRemove) return;
    const pId = productToRemove._id || productToRemove.id || productToRemove.slug;
    const pName = productToRemove.name || 'Product';

    removeItem(pId);
    if (isLoggedIn) {
      try {
        await wishlistService.remove(pId);
      } catch (_) {}
    }

    showToast(`Removed "${pName}" from wishlist`, 'info');
    setProductToRemove(null);
  };

  // Move All to Cart handler
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
      <div className={styles['wishlist-root']}>
        <div className="container">
          {/* ── Header Section ── */}
          <div className={styles['wishlist-header-row']}>
            <div className={styles['header-left']}>
              <div className={styles['header-title-group']}>
                <h1 className={styles['wishlist-title']}>My Wishlist</h1>
                <span className={styles['item-count-badge']}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className={styles['wishlist-subtitle']}>
                Save items you like and move them to cart whenever you're ready.
              </p>
            </div>

            {items.length > 0 && (
              <div className={styles['header-actions']}>
                <button
                  type="button"
                  onClick={() => clearWishlist()}
                  className={styles['clear-btn']}
                >
                  <Trash2 size={14} /> Clear All
                </button>
                <button
                  type="button"
                  onClick={handleMoveAllToCart}
                  className={styles['move-all-btn']}
                >
                  <ShoppingBag size={15} /> Move All to Cart
                </button>
              </div>
            )}
          </div>

          {/* ── Content Grid or Empty State ── */}
          {items.length === 0 ? (
            <div className={styles['empty-card']}>
              <div className={styles['empty-icon-box']}>
                <Heart size={38} strokeWidth={2.2} />
              </div>
              <h2 className={styles['empty-title']}>Your Wishlist is Empty</h2>
              <p className={styles['empty-subtext']}>
                Explore our collections and tap the heart icon on any product to save your favorites!
              </p>
              <Link to="/products" className={styles['explore-btn']}>
                <span>Explore Products</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          ) : (
            <div className={styles['wishlist-grid']}>
              {items.map((product) => {
                const pId = product._id || product.id || product.slug;
                return (
                  <ProductCard
                    key={pId}
                    product={product}
                    actionText="Move to Cart"
                    onAction={handleMoveToCart}
                    onRemoveWishlist={promptRemoveProduct}
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

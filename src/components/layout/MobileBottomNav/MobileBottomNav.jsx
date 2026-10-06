import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const location = useLocation();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalWishlistCount = (wishlistItems || []).length;

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {/* 1. Home */}
        <Link
          to="/"
          className={`mobile-nav-tab ${isActive('/') ? 'active' : ''}`}
          aria-label="Home"
        >
          <div className="mobile-nav-icon-wrap">
            <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
          </div>
          <span className="mobile-nav-label">Home</span>
        </Link>

        {/* 2. Category */}
        <Link
          to="/categories"
          className={`mobile-nav-tab ${isActive('/categories') ? 'active' : ''}`}
          aria-label="Categories"
        >
          <div className="mobile-nav-icon-wrap">
            <LayoutGrid size={20} strokeWidth={isActive('/categories') ? 2.5 : 2} />
          </div>
          <span className="mobile-nav-label">Category</span>
        </Link>

        {/* 3. Deals (Special highlighted center button) */}
        <Link
          to="/products?sort=discount"
          className={`mobile-nav-tab mobile-nav-deals-tab ${currentPath.includes('deals') ? 'active' : ''}`}
          aria-label="Deals"
        >
          <div className="mobile-deals-bubble">
            <Sparkles size={18} strokeWidth={2.4} />
          </div>
          <span className="mobile-nav-label">Deals</span>
        </Link>

        {/* 4. Saved / Wishlist */}
        <Link
          to="/wishlist"
          className={`mobile-nav-tab ${isActive('/wishlist') ? 'active' : ''}`}
          aria-label="Wishlist"
        >
          <div className="mobile-nav-icon-wrap">
            <Heart size={20} strokeWidth={isActive('/wishlist') ? 2.5 : 2} />
            {totalWishlistCount > 0 && (
              <span className="mobile-nav-badge wishlist-badge">{totalWishlistCount}</span>
            )}
          </div>
          <span className="mobile-nav-label">Saved</span>
        </Link>

        {/* 5. Cart */}
        <Link
          to="/cart"
          className={`mobile-nav-tab ${isActive('/cart') ? 'active' : ''}`}
          aria-label="Cart"
        >
          <div className="mobile-nav-icon-wrap">
            <ShoppingBag size={20} strokeWidth={isActive('/cart') ? 2.5 : 2} />
            {totalCartCount > 0 && (
              <span className="mobile-nav-badge cart-badge">{totalCartCount}</span>
            )}
          </div>
          <span className="mobile-nav-label">Cart</span>
        </Link>
      </div>
    </nav>
  );
}

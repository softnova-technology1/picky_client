import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sparkles, Heart, User } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { usePageCustomization } from '../../../store/customizationStore';
import './MobileBottomNav.css';

export default function MobileBottomNav() {
  const { getSetting, isEnabled } = usePageCustomization('global_header');
  const showMobileBottomNav = isEnabled('sticky_action_bar', true) && getSetting('sticky_action_bar', 'showMobileBottomNav', true) !== false;

  const location = useLocation();
  const { isLoggedIn } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const totalWishlistCount = (wishlistItems || []).length;

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const isProfileActive =
    isActive('/profile') ||
    isActive('/account') ||
    isActive('/orders') ||
    (!isLoggedIn && (isActive('/login') || isActive('/signup')));

  if (!showMobileBottomNav || currentPath.startsWith('/checkout') || currentPath.startsWith('/order-success')) {
    return null;
  }

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
          className={`mobile-nav-tab mobile-nav-deals-tab ${currentPath.includes('deals') || currentPath.includes('discount') ? 'active' : ''}`}
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

        {/* 5. Profile */}
        <Link
          to={isLoggedIn ? '/profile' : '/login'}
          state={!isLoggedIn ? { from: { pathname: '/profile' } } : undefined}
          className={`mobile-nav-tab ${isProfileActive ? 'active' : ''}`}
          aria-label="Profile"
        >
          <div className="mobile-nav-icon-wrap">
            <User size={20} strokeWidth={isProfileActive ? 2.5 : 2} />
          </div>
          <span className="mobile-nav-label">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

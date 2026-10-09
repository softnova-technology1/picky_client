import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ArrowRight,
  Package,
  LogOut,
  Truck,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useCategoryStore } from '../../../store/categoryStore';
import CategoryIcon from '../../common/CategoryIcon';
import GlamicsMarqueeTicker from '../../category/GlamicsMarqueeTicker';
import Modal from '../../ui/Modal/Modal';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const categoryDropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
  const userTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
      categoryTimeoutRef.current = null;
    }
    setIsCategoryOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 180);
  };

  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
      userTimeoutRef.current = null;
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMouseLeave = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    userTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
      if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  
  const megaMenuCategories = useCategoryStore((state) => state.getMegaMenu());

  const totalCartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalWishlistCount = wishlistItems.length;

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close category & user popups
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target) &&
        (!dropdownMenuRef.current || !dropdownMenuRef.current.contains(event.target))
      ) {
        setIsCategoryOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchTerm('');
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/products?q=${encodeURIComponent(term)}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ── 1. Top Running Marquee Announcement Bar (Replaces Static Row) ── */}
      <GlamicsMarqueeTicker />

      {/* ── 2. Floating Pill Navbar (Desktop Only: > 768px) ────────────── */}
      <header className="floating-nav-container desktop-nav-only">
        <div className="floating-nav-pill">
          {/* Brand & Divider (Left) */}
          <Link to="/" className="nav-brand-cluster" title="Picky Home">
            <img src="/images/logo.png" alt="Picky Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
            <div className="nav-vertical-divider" />
          </Link>

          {/* Center Navigation Links (Clean Text Only, Minimalist) */}
          <nav className="nav-center-links" aria-label="Main Navigation">
            {/* Shop */}
            <div className="nav-item-rel">
              <Link
                to="/shop"
                className={`nav-pill-link ${isNavActive('/shop') || (isNavActive('/products') && !location.search) ? 'active' : ''}`}
              >
                <span>Shop</span>
              </Link>
            </div>

            {/* Categories Link */}
            <div
              className="nav-item-rel"
              ref={categoryDropdownRef}
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <Link
                to="/categories"
                className={`nav-pill-link ${isNavActive('/categories') ? 'active' : ''}`}
                onClick={() => setIsCategoryOpen(false)}
                aria-expanded={isCategoryOpen}
              >
                <span>Categories</span>
                <ChevronDown
                  size={12}
                  style={{
                    transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </Link>
            </div>

            {/* New Arrivals */}
            <div className="nav-item-rel">
              <Link
                to="/new-arrivals"
                className={`nav-pill-link ${isNavActive('/new-arrivals') ? 'active' : ''}`}
              >
                <span>New Arrivals</span>
              </Link>
            </div>

            {/* Best Sellers */}
            <div className="nav-item-rel">
              <Link
                to="/best-sellers"
                className={`nav-pill-link ${isNavActive('/best-sellers') || isNavActive('/bestsellers') ? 'active' : ''}`}
              >
                <span>Best Sellers</span>
              </Link>
            </div>

            {/* About Us */}
            <div className="nav-item-rel">
              <Link
                to="/about"
                className={`nav-pill-link ${isNavActive('/about') ? 'active' : ''}`}
              >
                <span>About Us</span>
              </Link>
            </div>

            {/* Contact Us */}
            <div className="nav-item-rel">
              <Link
                to="/contact"
                className={`nav-pill-link ${isNavActive('/contact') ? 'active' : ''}`}
              >
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Blog */}
            <div className="nav-item-rel">
              <Link
                to="/blog"
                className={`nav-pill-link ${isNavActive('/blog') ? 'active' : ''}`}
              >
                <span>Blog</span>
              </Link>
            </div>
          </nav>

          {/* Right Action Icons, Elongated Search & Auth */}
          <div className="nav-actions-cluster">
            {/* Elongated Search Bar Button */}
            <button
              type="button"
              className="nav-search-bar-btn"
              onClick={() => setIsSearchOpen(true)}
              title="Search products"
              aria-label="Search products"
            >
              <Search size={14} style={{ color: '#7c3aed', flexShrink: 0 }} />
              <span className="nav-search-placeholder">Search products...</span>
            </button>

            {/* Wishlist Button with Counter Badge */}
            <Link
              to="/wishlist"
              className="nav-icon-btn"
              title="My Wishlist"
              aria-label={`Wishlist: ${totalWishlistCount} items`}
            >
              <Heart size={17} />
              {totalWishlistCount > 0 && (
                <span className="nav-action-badge nav-action-badge-rose">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button (Clean Icon Button Only) */}
            <Link
              to="/cart"
              className="nav-icon-btn"
              title="View Cart"
              aria-label={`Cart: ${totalCartCount} items`}
            >
              <ShoppingCart size={17} />
              {totalCartCount > 0 && (
                <span className="nav-action-badge">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Restored Auth: Profile Chip vs. Violet Gradient Sign In CTA */}
            {isLoggedIn ? (
              <div
                className="nav-item-rel"
                ref={userMenuRef}
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <button
                  type="button"
                  className="nav-user-chip"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/profile?tab=profile');
                  }}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="nav-user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="nav-user-name">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      color: '#7c3aed',
                      transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="nav-user-menu"
                    onMouseEnter={handleUserMouseEnter}
                    onMouseLeave={handleUserMouseLeave}
                  >
                    <div style={{ padding: '0.35rem 0.65rem 0.2rem', fontSize: '0.78rem', color: '#64748b' }}>
                      Signed in as <strong style={{ color: '#1e1b4b', display: 'block' }}>{user?.email || user?.name}</strong>
                    </div>
                    <div className="nav-user-menu-divider" />
                    <Link
                      to="/profile?tab=profile"
                      className="nav-user-menu-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      className="nav-user-menu-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={15} />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="nav-user-menu-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Heart size={15} />
                      <span>Wishlist ({totalWishlistCount})</span>
                    </Link>
                    <div className="nav-user-menu-divider" />
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="nav-user-menu-link"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: '#e11d48',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-cta-btn">
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle (Shown on tablet/mobile) */}
            <button
              type="button"
              className="nav-mobile-toggle-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Full-Width All-Categories Multi-Column Mega Menu (Exact Screenshot Layout) */}
        {isCategoryOpen && (
          <div
            ref={dropdownMenuRef}
            className="nav-dropdown-menu nav-dropdown-full-width"
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <div className="nav-all-categories-strip">
              {megaMenuCategories.map((cat, idx) => (
                <div
                  key={cat.slug}
                  className={`nav-mega-column ${idx % 2 === 1 ? 'shaded' : ''}`}
                >
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="nav-mega-column-title"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    {cat.title}
                  </Link>
                  <div className="nav-mega-links-list">
                    {cat.links.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        to={`/categories/${cat.slug}/${item.slug}`}
                        className="nav-mega-link-item"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── 2b. Mobile Header & Search (Mobile Only: 320px - 768px) ────────────── */}
      <header className="mobile-nav-header mobile-nav-only">
        <div className="mobile-nav-top-row">
          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            className="mobile-nav-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} color="#1e1b4b" strokeWidth={2.2} />
          </button>

          {/* Centered Picky Logo */}
          <Link to="/" className="mobile-nav-brand-logo" title="Picky">
            <img src="/images/logo.png" alt="Picky Logo" />
          </Link>

          {/* Right Action Icons: Wishlist & Cart */}
          <div className="mobile-nav-actions">
            <Link to="/wishlist" className="mobile-nav-icon-link" aria-label="Wishlist">
              <Heart size={20} color="#1e1b4b" strokeWidth={2} />
              {totalWishlistCount > 0 && (
                <span className="mobile-header-badge mobile-badge-rose">{totalWishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="mobile-nav-icon-link" aria-label="Cart">
              <ShoppingCart size={20} color="#1e1b4b" strokeWidth={2} />
              {totalCartCount > 0 && (
                <span className="mobile-header-badge">{totalCartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Row */}
        <div className="mobile-nav-search-row">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <Search size={16} className="mobile-search-icon" color="#94a3b8" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search products, brands, options, jewelry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className="mobile-search-filter-btn"
              onClick={() => navigate('/products')}
              aria-label="Filter"
            >
              <SlidersHorizontal size={15} color="#64748b" />
            </button>
          </form>
        </div>
      </header>

      {/* ── 3. Quick Search Modal Popover ──────────────────────────────── */}
      {isSearchOpen && (
        <div
          className="nav-search-modal-backdrop"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="nav-search-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e1b4b', fontSize: '1.05rem' }}>
                <Search size={20} style={{ color: '#7c3aed' }} />
                <span>Search Picky Catalog</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div className="nav-search-input-wrap">
                <Search size={18} style={{ color: '#7c3aed' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="nav-search-input"
                  placeholder="Search premium headphones, watches, apparel, shoes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.45rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Search
                </button>
              </div>
            </form>

            <div className="nav-search-quick-tags">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>TRENDING:</span>
              <button
                type="button"
                className="nav-search-quick-tag"
                onClick={() => handleQuickSearch('Wireless Headphones')}
              >
                Wireless Headphones
              </button>
              <button
                type="button"
                className="nav-search-quick-tag"
                onClick={() => handleQuickSearch('Smart Watch')}
              >
                Smart Watch
              </button>
              <button
                type="button"
                className="nav-search-quick-tag"
                onClick={() => handleQuickSearch('Sneakers')}
              >
                Sneakers
              </button>
              <button
                type="button"
                className="nav-search-quick-tag"
                onClick={() => handleQuickSearch('Backpack')}
              >
                Backpack
              </button>
              <button
                type="button"
                className="nav-search-quick-tag"
                onClick={() => handleQuickSearch('Hoodie')}
              >
                Hoodie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Mobile Drawer Menu ──────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mobile-drawer-header">
              <Link to="/" className="nav-brand-cluster" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/images/logo.png" alt="Picky Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <div className="nav-search-input-wrap" style={{ padding: '0.5rem 0.85rem' }}>
                <Search size={16} style={{ color: '#7c3aed' }} />
                <input
                  type="text"
                  className="nav-search-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {/* Navigation Links */}
            <div className="mobile-drawer-links">
              <Link to="/products" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Shop Catalog</span>
              </Link>
              <Link to="/categories" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Categories</span>
              </Link>
              <Link to="/new-arrivals" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>New Arrivals</span>
              </Link>
              <Link to="/best-sellers" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Best Sellers</span>
              </Link>
              <Link to="/about" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>About Us</span>
              </Link>
              <Link to="/contact" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Contact Us</span>
              </Link>
              <Link to="/blog" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Blog / Insights</span>
              </Link>
              <Link to="/orders" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>Track Order</span>
              </Link>
            </div>

            {/* Quick Actions at bottom */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #ede8f8' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <Link
                  to="/wishlist"
                  className="mobile-drawer-link"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart size={16} style={{ color: '#e11d48' }} />
                  <span>Wishlist ({totalWishlistCount})</span>
                </Link>
                <Link
                  to="/cart"
                  className="mobile-drawer-link"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart size={16} style={{ color: '#7c3aed' }} />
                  <span>Cart ({totalCartCount})</span>
                </Link>
              </div>

              {isLoggedIn ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    to="/profile"
                    className="nav-cta-btn"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>My Account ({user?.name || 'User'})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '9999px',
                      padding: '0.55rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="nav-cta-btn"
                  style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Sign Out">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to sign out of your account?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setShowLogoutConfirm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { logout(); setShowLogoutConfirm(false); setIsUserMenuOpen(false); setIsMobileMenuOpen(false); }} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </Modal>
    </>
  );
}

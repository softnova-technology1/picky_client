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
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { MOCK_CATEGORIES } from '../../data/adminMockData';
import { CATEGORY_COLUMNS, MEGAMENU_ALL_CATEGORIES } from '../../data/categoriesData';
import CategoryIcon from '../common/CategoryIcon';
import GlamicsMarqueeTicker from '../category/GlamicsMarqueeTicker';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState('womens-fashion');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const activeCat = useMemo(() => {
    return MOCK_CATEGORIES.find((c) => c.slug === activeCategorySlug) || MOCK_CATEGORIES[0];
  }, [activeCategorySlug]);

  const columnData = useMemo(() => {
    return CATEGORY_COLUMNS[activeCategorySlug] || CATEGORY_COLUMNS['womens-fashion'];
  }, [activeCategorySlug]);

  const categoryDropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const categoryTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);
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

  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

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

      {/* ── 2. Floating Pill Navbar (Restored Clean Pill Style) ────────────── */}
      <header className="floating-nav-container">
        <div className="floating-nav-pill">
          {/* Brand & Divider (Left) */}
          <Link to="/" className="nav-brand-cluster" title="Picky Home">
            <div className="nav-brand-logo-icon">P</div>
            <span className="nav-brand-name">Picky</span>
            <div className="nav-vertical-divider" />
          </Link>

          {/* Center Navigation Links (Clean Text Only, Minimalist) */}
          <nav className="nav-center-links" aria-label="Main Navigation">
            {/* Shop */}
            <div className="nav-item-rel">
              <Link
                to="/products"
                className={`nav-pill-link ${isNavActive('/products') && !location.search ? 'active' : ''}`}
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
                to="/products?sort=rating"
                className={`nav-pill-link ${location.search.includes('rating') ? 'active' : ''}`}
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
              <div className="nav-item-rel" ref={userMenuRef}>
                <button
                  type="button"
                  className="nav-user-chip"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="nav-user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="nav-user-name">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={13} style={{ color: '#7c3aed' }} />
                </button>

                {isUserMenuOpen && (
                  <div className="nav-user-menu">
                    <div style={{ padding: '0.35rem 0.65rem 0.2rem', fontSize: '0.78rem', color: '#64748b' }}>
                      Signed in as <strong style={{ color: '#1e1b4b', display: 'block' }}>{user?.email || user?.name}</strong>
                    </div>
                    <div className="nav-user-menu-divider" />
                    <Link
                      to="/account?tab=profile"
                      className="nav-user-menu-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/account?tab=orders"
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
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
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
              {MEGAMENU_ALL_CATEGORIES.map((cat, idx) => (
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
                        to={
                          item.slug
                            ? `/categories/${cat.slug}?sub=${item.slug}`
                            : `/categories/${cat.slug}`
                        }
                        className={`nav-mega-link-item ${itemIdx === 0 ? 'highlight-top' : ''}`}
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
                <div className="nav-brand-logo-icon">P</div>
                <span className="nav-brand-name">Picky</span>
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
              <Link to="/products?sort=rating" className="mobile-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
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
                    to="/account"
                    className="nav-cta-btn"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>My Account ({user?.name || 'User'})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
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
    </>
  );
}

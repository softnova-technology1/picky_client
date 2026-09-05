import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Sparkles, User, LogOut, Gift, Menu, X, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { PICKY_CATEGORIES } from '../../data/categoriesData';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
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
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchTerm('');
    }
  };

  const isContactPage = location.pathname === '/contact';

  return (
    <header className="picky-header">
      <div className="container picky-nav-container">
        {/* Left: Picky Brand Logo */}
        <Link to="/" className="picky-logo-link">
          <div className="picky-logo-disc">
            <span className="picky-logo-letter">P</span>
          </div>
          <div>
            <span className="picky-brand-name">Picky</span>
            <span className="picky-brand-sub">Shop More. Live Better.</span>
          </div>
        </Link>

        {/* Center: Main Navigation Links */}
        <nav className="picky-center-nav">
          <Link to="/" className={`picky-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/products" className={`picky-nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
            Shop
          </Link>
          <Link to="/categories" className={`picky-nav-link ${location.pathname.startsWith('/categories') && location.pathname !== '/categories/combo-packs' ? 'active' : ''}`}>
            Categories
          </Link>
          <Link to="/categories/combo-packs" className={`picky-nav-link ${location.pathname === '/categories/combo-packs' ? 'active' : ''}`}>
            Offers
          </Link>
          <Link to="/orders" className={`picky-nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
            Track Order
          </Link>
          <Link to="/contact" className={`picky-nav-link ${isContactPage ? 'active-pill' : ''}`}>
            Contact
          </Link>
        </nav>

        {/* Right: Search & Utility Disc Buttons */}
        <div className="picky-right-nav">
          {/* Minimal Search input */}
          <form onSubmit={handleSearch} className="picky-nav-search">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="picky-search-input"
            />
            <Search size={16} className="picky-search-icon" />
          </form>

          {/* Wishlist Disc */}
          <Link to="/wishlist" title="Wishlist" className="nav-icon-disc">
            <Heart
              size={19}
              color="#7c3aed"
              fill={totalWishlistCount > 0 ? '#7c3aed' : 'transparent'}
              strokeWidth={2.2}
            />
            {totalWishlistCount > 0 && (
              <span className="nav-icon-badge">{totalWishlistCount}</span>
            )}
          </Link>

          {/* Cart Disc */}
          <Link to="/cart" title="Shopping Cart" className="nav-icon-disc">
            <ShoppingCart size={19} color="#7c3aed" strokeWidth={2.2} />
            {totalCartCount > 0 && (
              <span className="nav-icon-badge">{totalCartCount}</span>
            )}
          </Link>

          {/* Account */}
          {isLoggedIn ? (
            <div className="picky-user-group">
              <Link to="/account" className="picky-account-btn">
                <User size={16} color="#7c3aed" />
                <span className="user-short-name">{user?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
              <button onClick={logout} className="picky-logout-icon-btn" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="picky-login-btn">
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="picky-mobile-menu-btn"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="picky-mobile-drawer">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
          <Link to="/categories/combo-packs" onClick={() => setIsMobileMenuOpen(false)}>Offers</Link>
          <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="active-pill">Contact</Link>
        </div>
      )}

      <style>{`
        .picky-header {
          background: #ffffff;
          border-bottom: 1px solid #ede9fe;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 16px rgba(124, 58, 237, 0.04);
        }

        .picky-nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 1.5rem;
        }

        .picky-logo-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }

        .picky-logo-disc {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #9333ea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .picky-logo-letter {
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1;
          color: #ffffff;
          letter-spacing: -0.04em;
        }

        .picky-brand-name {
          font-weight: 900;
          font-size: 1.35rem;
          color: #0f172a;
          display: block;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .picky-brand-sub {
          font-size: 0.65rem;
          font-weight: 700;
          color: #7c3aed;
          letter-spacing: 0.04em;
          display: block;
        }

        .picky-center-nav {
          display: flex;
          align-items: center;
          gap: 1.6rem;
        }

        @media (max-width: 960px) {
          .picky-center-nav {
            display: none;
          }
        }

        .picky-nav-link {
          font-weight: 600;
          font-size: 0.92rem;
          color: #475569;
          text-decoration: none;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }
        .picky-nav-link:hover {
          color: #7c3aed;
        }
        .picky-nav-link.active {
          color: #7c3aed;
          font-weight: 700;
        }
        .picky-nav-link.active-pill {
          color: #6d28d9;
          background: #ede9fe;
          font-weight: 700;
          padding: 0.32rem 0.85rem;
          border-radius: 9999px;
        }

        .picky-right-nav {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .picky-nav-search {
          position: relative;
          width: 200px;
        }
        @media (max-width: 1140px) {
          .picky-nav-search {
            display: none;
          }
        }

        .picky-search-input {
          width: 100%;
          padding: 0.5rem 0.85rem 0.5rem 2.1rem;
          border-radius: 9999px;
          border: 1.5px solid #ede9fe;
          background: #f8fafc;
          font-size: 0.86rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }
        .picky-search-input:focus {
          border-color: #7c3aed;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .picky-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .nav-icon-disc {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid #e9d5ff;
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.25s ease;
          text-decoration: none;
        }
        .nav-icon-disc:hover {
          transform: translateY(-2px);
          border-color: #7c3aed;
          box-shadow: 0 8px 18px rgba(124, 58, 237, 0.22);
        }

        .nav-icon-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 19px;
          height: 19px;
          padding: 0 4px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .picky-user-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .picky-account-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          background: #f3e8ff;
          color: #6d28d9;
          font-size: 0.86rem;
          font-weight: 700;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .picky-account-btn:hover {
          background: #e9d5ff;
        }

        .picky-logout-icon-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          padding: 0.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .picky-login-btn {
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          color: white;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          transition: all 0.2s ease;
        }
        .picky-login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.45);
        }

        .picky-mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: #1e293b;
          cursor: pointer;
          padding: 0.3rem;
        }
        @media (max-width: 960px) {
          .picky-mobile-menu-btn {
            display: block;
          }
        }

        .picky-mobile-drawer {
          padding: 1rem 1.5rem 1.5rem;
          background: #ffffff;
          border-top: 1px solid #ede9fe;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .picky-mobile-drawer a {
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 700;
          color: #334155;
          padding: 0.4rem 0;
        }
        .picky-mobile-drawer a.active-pill {
          color: #7c3aed;
        }
      `}</style>
    </header>
  );
}

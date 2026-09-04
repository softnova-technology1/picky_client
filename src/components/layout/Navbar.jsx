import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const totalCartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalWishlistCount = wishlistItems.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          <span style={{ background: 'var(--color-primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '1.2rem' }}>P</span>
          Picky
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, maxWidth: '480px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search products, brands, essentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: '9999px',
              border: '1.5px solid var(--color-border)',
              background: '#f8fafc',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'var(--transition)',
            }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.95rem' }}>
            🔍
          </span>
        </form>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/products" style={{ fontWeight: 600, fontSize: '0.92rem', color: '#475569' }}>
            Shop
          </Link>
          <Link to="/categories" style={{ fontWeight: 600, fontSize: '0.92rem', color: '#475569' }}>
            Categories
          </Link>

          {/* Wishlist Icon */}
          <Link to="/wishlist" title="My Wishlist" style={{ position: 'relative', padding: '0.4rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}>❤️</span>
            {totalWishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '19px',
                  height: '19px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalWishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" title="Shopping Cart" style={{ position: 'relative', padding: '0.4rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.35rem' }}>🛒</span>
            {totalCartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '19px',
                  height: '19px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* User Auth Menu */}
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/orders"
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-light)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                }}
              >
                My Orders
              </Link>
              <Link to="/account" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
                👤 {user?.name || 'Account'}
              </Link>
              <button
                onClick={logout}
                style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600, padding: '0.3rem 0.5rem' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                transition: 'var(--transition)',
              }}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

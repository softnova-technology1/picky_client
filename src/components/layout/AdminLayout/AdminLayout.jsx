import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Layers,
  Users,
  BarChart3,
  Ticket,
  Settings,
  Search,
  Bell,
  Menu,
  ChevronDown,
  ExternalLink,
  LogOut,
  Sparkles,
  ArrowRight,
  Package,
  Tag,
  FolderTree,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import '../../../styles/admin.css';

const ADMIN = '/pickyadmin-softnova2026';

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Keyboard shortcut Ctrl+K focus on search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('admin-global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="admin-layout">
      {/* ─── Modern White & Lavender Sidebar ─── */}
      <aside className="admin-sidebar" style={{ width: collapsed ? '80px' : '250px', minWidth: collapsed ? '80px' : '250px' }}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <Link to={ADMIN} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img src="/images/logo.png" alt="Picky Admin Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            {!collapsed && (
              <div>
                <div className="admin-logo-text" style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>
                  Picky <span className="admin-logo-badge-small">Admin</span>
                </div>
                <span className="admin-logo-subtitle">Merchant Portal</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="admin-sidebar-nav">
          <NavLink to={ADMIN} end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to={`${ADMIN}/orders`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Orders & AWB Dispatch
          </NavLink>

          <NavLink to={`${ADMIN}/products`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Tag size={18} /> Products Catalog
          </NavLink>

          <NavLink to={`${ADMIN}/categories`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FolderTree size={18} /> Categories
          </NavLink>

          <NavLink to={`${ADMIN}/customers`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Customers
          </NavLink>

          <NavLink to={`${ADMIN}/reports`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} /> Sales & Reports
          </NavLink>

          <NavLink to={`${ADMIN}/coupons`} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <div className="admin-nav-item-left">
              <Ticket size={19} />
              {!collapsed && <span>Coupons</span>}
            </div>
          </NavLink>

        </nav>

        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid #1e293b', background: '#090d16' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#c4b5fd',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(124, 58, 237, 0.15)',
              marginBottom: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <Store size={16} /> View Customer Store ➔
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.4rem 0.75rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> Logout of Admin
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="admin-main">
        {/* Modern Frosted Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="admin-toggle-sidebar-btn"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar with Ctrl+K */}
            <div className="admin-search-wrap">
              <Search size={16} className="admin-search-icon" />
              <input
                id="admin-global-search"
                type="text"
                placeholder="Search orders, products, customers..."
                className="admin-search-input"
              />
              <span className="admin-search-kbd">Ctrl + K</span>
            </div>
          </div>

          {/* Topbar Right Actions */}
          <div className="admin-topbar-right">
            {/* Notification Bell with alert dot */}
            <button className="admin-notif-btn" title="Notifications" aria-label="Notifications">
              <Bell size={18} />
              <span className="admin-notif-dot"></span>
            </button>

            {/* User Profile Chip */}
            <div style={{ position: 'relative' }}>
              <div
                className="admin-user-chip"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="admin-avatar">
                  {(user?.name || user?.email || 'A')[0].toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="admin-user-name">{user?.name || 'Aglishwaran S'}</div>
                  <div className="admin-user-role">Administrator</div>
                </div>
                <ChevronDown size={14} style={{ color: '#94a3b8' }} />
              </div>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '200px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '1px solid #eeecf6',
                    padding: '0.5rem',
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      color: '#334155',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ExternalLink size={15} color="#7c3aed" /> Customer Store
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
}

import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Toast from '../ui/Toast';
import '../../styles/admin.css';
import {
  LayoutDashboard,
  Package,
  Tag,
  FolderTree,
  Users,
  BarChart3,
  Store,
  LogOut,
} from 'lucide-react';

const ADMIN = '/pickyadmin-softnova2026';

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="admin-logo-badge">C</span>
            <div>
              <strong style={{ color: 'white', fontSize: '1.1rem', display: 'block' }}>Crackly Admin</strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Merchant Portal</span>
            </div>
          </div>
        </div>

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

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#0f172a' }}>{title || 'Dashboard'}</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Store Management Portal</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                A
              </div>
              <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                {user?.name || user?.email || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
}

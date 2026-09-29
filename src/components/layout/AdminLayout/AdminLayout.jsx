import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  BarChart3,
  ShoppingBag,
  Package,
  Tag,
  Settings,
  Store,
  Menu,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Search,
  Bell,
  X,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Boxes,
  FolderTree,
  Palette,
  TrendingUp,
  Share2,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS } from '../../../data/adminMockData';
import Toast from '../../ui/Toast';
import '../../../styles/admin.css';

const ADMIN = '/pickyadmin-softnova2026';

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const quickAddRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);

  const isDashboard = location.pathname === ADMIN || location.pathname === `${ADMIN}/`;

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) {
        setQuickAddOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search, Esc to close all dropdowns
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserMenuOpen(false);
        setQuickAddOpen(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminName = user?.name || 'Aglishwaran S';
  const adminEmail = user?.email || 'aglish@softnova.dev';

  // Instant Search Results
  const trimmed = searchQuery.trim().toLowerCase();
  const searchResults = trimmed.length > 0 ? {
    orders: (MOCK_ORDERS || []).filter(o =>
      o.orderNumber?.toLowerCase().includes(trimmed) ||
      o.customerName?.toLowerCase().includes(trimmed) ||
      o.shippingCity?.toLowerCase().includes(trimmed)
    ).slice(0, 3),
    products: (MOCK_PRODUCTS || []).filter(p =>
      p.name?.toLowerCase().includes(trimmed) ||
      p.category?.toLowerCase().includes(trimmed)
    ).slice(0, 3),
    customers: (MOCK_CUSTOMERS || []).filter(c =>
      c.name?.toLowerCase().includes(trimmed) ||
      c.mobile?.includes(trimmed) ||
      c.city?.toLowerCase().includes(trimmed)
    ).slice(0, 3),
  } : null;

  const totalResultsCount = searchResults
    ? searchResults.orders.length + searchResults.products.length + searchResults.customers.length
    : 0;

  const handleSearchSelect = (url) => {
    navigate(url);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    if (searchResults?.orders.length > 0) {
      navigate(`${ADMIN}/orders`);
    } else if (searchResults?.products.length > 0) {
      navigate(`${ADMIN}/products`);
    } else if (searchResults?.customers.length > 0) {
      navigate(`${ADMIN}/customers`);
    } else {
      navigate(`${ADMIN}/orders`);
    }
    setSearchOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* ─── Ultra-Luxury Light Purple Sidebar (290px) ─── */}
      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: collapsed ? '80px' : '290px',
          minWidth: collapsed ? '80px' : '290px',
        }}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <Link to={ADMIN} className="admin-sidebar-brand-link" title="Picky Admin Dashboard">
            {/* White Picky Brand Logo (Centered & Enlarged) */}
            <img
              src="/images/logo.png"
              alt="Picky Logo"
              className="admin-sidebar-logo-img"
              style={{
                height: collapsed ? '38px' : '58px',
                width: 'auto',
                maxWidth: collapsed ? '52px' : '200px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                display: 'block',
                margin: '0 auto',
                transition: 'all 0.25s ease',
              }}
            />
          </Link>
        </div>

        {/* Navigation List - Flat Single-Level Clean Luxury Sidebar */}
        <nav className="admin-sidebar-nav">
          {/* 1. Dashboard */}
          <NavLink
            to={ADMIN}
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Dashboard"
          >
            <div className="admin-nav-icon-wrap">
              <LayoutDashboard size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Dashboard</span>}
          </NavLink>

          {/* 2. Orders */}
          <NavLink
            to={`${ADMIN}/orders`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Orders"
          >
            <div className="admin-nav-icon-wrap">
              <ShoppingBag size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Orders</span>}
          </NavLink>

          {/* 3. Products */}
          <NavLink
            to={`${ADMIN}/products`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Products"
          >
            <div className="admin-nav-icon-wrap">
              <Package size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Products</span>}
          </NavLink>


          {/* 5. Sub-Categories */}
          <NavLink
            to={`${ADMIN}/subcategories`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Sub-Categories"
          >
            <div className="admin-nav-icon-wrap">
              <FolderTree size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Sub-Categories</span>}
          </NavLink>

          {/* 6. Inventory */}
          <NavLink
            to={`${ADMIN}/inventory`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Inventory"
          >
            <div className="admin-nav-icon-wrap">
              <Boxes size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Inventory</span>}
          </NavLink>

          {/* 7. Customers */}
          <NavLink
            to={`${ADMIN}/customers`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Customers"
          >
            <div className="admin-nav-icon-wrap">
              <Users size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Customers</span>}
          </NavLink>

          {/* 8. Coupons */}
          <NavLink
            to={`${ADMIN}/coupons`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Coupons"
          >
            <div className="admin-nav-icon-wrap">
              <Tag size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Coupons</span>}
          </NavLink>

          {/* 9. Reports */}
          <NavLink
            to={`${ADMIN}/reports`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Reports"
          >
            <div className="admin-nav-icon-wrap">
              <BarChart3 size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Reports</span>}
          </NavLink>

          {/* 10. Customization */}
          <NavLink
            to={`${ADMIN}/customization`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Customization"
          >
            <div className="admin-nav-icon-wrap">
              <Palette size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Customization</span>}
          </NavLink>
        </nav>

        {/* ─── Bottom View Customer Store Section ─── */}
        <div className="admin-sidebar-bottom-section">
          {!collapsed ? (
            <div className="admin-sidebar-pro-store-card">
              {/* Center 3D Luxury Storefront Visual */}
              <div className="admin-pro-icon-container">
                <div className="admin-pro-icon-box">
                  <img
                    src="/images/picky_3d_store_icon.jpg"
                    alt="Picky Storefront"
                    className="admin-pro-3d-img"
                  />
                </div>
              </div>

              {/* Store Identity & Subtext */}
              <div className="admin-pro-card-content">
                <div className="admin-pro-card-text">
                  <h4 className="admin-pro-card-title">Picky Official Store</h4>
                  <p className="admin-pro-card-sub">Accepting live customer orders</p>
                </div>

                {/* Primary Action Button: View Store */}
                <Link
                  to="/"
                  target="_blank"
                  className="admin-pro-card-pill-btn"
                  title="Open live customer storefront in a new tab"
                >
                  <span>View Store</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <Link
              to="/"
              target="_blank"
              className="admin-sidebar-store-icon-btn"
              title="View Customer Store"
            >
              <img
                src="/images/picky_3d_store_icon.jpg"
                alt="Picky Store"
                className="admin-pro-3d-img-collapsed"
              />
            </Link>
          )}
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <div className="admin-main">
        {/* ─── Top Navbar with Breathing Room & Quick Actions ─── */}
        <header className="admin-topbar">
          {/* Left: Sidebar Toggle + Heading + Store Status Badge */}
          <div className="admin-topbar-left">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="admin-toggle-sidebar-btn"
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="admin-topbar-title-wrap">
              <h2 className="admin-topbar-heading">{title || 'Dashboard Overview'}</h2>
            </div>
          </div>

          {/* Center: Global Search Bar (Clean, simple & perfectly aligned) */}
          <div className="admin-topbar-search-wrap" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="admin-topbar-search-form">
              <div className="admin-topbar-search-box">
                <Search size={16} className="admin-topbar-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search orders, products, customers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="admin-topbar-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="admin-search-clear-btn"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Quick Live Search Results Dropdown */}
            {searchOpen && trimmed.length > 0 && (
              <div className="admin-search-results-dropdown">
                {totalResultsCount === 0 ? (
                  <div className="admin-search-empty">
                    <span>No matches found for "{searchQuery}"</span>
                  </div>
                ) : (
                  <>
                    {searchResults?.orders.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Orders</span>
                        {searchResults.orders.map((ord) => (
                          <div
                            key={ord._id || ord.orderNumber}
                            className="admin-search-result-row"
                            onClick={() => handleSearchSelect(`${ADMIN}/orders`)}
                          >
                            <ShoppingBag size={14} className="admin-search-row-icon" />
                            <div className="admin-search-row-text">
                              <span className="admin-search-row-main">{ord.orderNumber} — {ord.customerName}</span>
                              <span className="admin-search-row-sub">₹{ord.totalAmount?.toLocaleString()} • {ord.status}</span>
                            </div>
                            <span className="admin-search-badge badge-order">Order</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults?.products.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Products</span>
                        {searchResults.products.map((p) => (
                          <div
                            key={p._id || p.id}
                            className="admin-search-result-row"
                            onClick={() => handleSearchSelect(`${ADMIN}/products`)}
                          >
                            <Package size={14} className="admin-search-row-icon" />
                            <div className="admin-search-row-text">
                              <span className="admin-search-row-main">{p.name}</span>
                              <span className="admin-search-row-sub">₹{p.price?.toLocaleString()} • {p.category}</span>
                            </div>
                            <span className="admin-search-badge badge-product">Product</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults?.customers.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Customers</span>
                        {searchResults.customers.map((c) => (
                          <div
                            key={c._id || c.id}
                            className="admin-search-result-row"
                            onClick={() => handleSearchSelect(`${ADMIN}/customers`)}
                          >
                            <Users size={14} className="admin-search-row-icon" />
                            <div className="admin-search-row-text">
                              <span className="admin-search-row-main">{c.name}</span>
                              <span className="admin-search-row-sub">{c.mobile || c.phone} • {c.city || 'Tamil Nadu'}</span>
                            </div>
                            <span className="admin-search-badge badge-customer">Customer</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Action + Notifications + Profile Chip */}
          <div className="admin-topbar-right">
            {/* Quick Actions Button with High Z-Index Luxury Dropdown */}
            <div className="admin-quick-add-wrap admin-quick-actions-wrap" ref={quickAddRef}>
              <button
                className="admin-quick-add-btn admin-quick-actions-btn"
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                title="Quick Store Actions & Shortcuts"
                aria-expanded={quickAddOpen}
              >
                <Zap size={14} className="admin-quick-action-btn-icon" />
                <span>Quick Actions</span>
                <ChevronDown size={13} className={`admin-quick-action-chevron ${quickAddOpen ? 'rotate-180' : ''}`} />
              </button>

              {quickAddOpen && (
                <div className="admin-quick-add-dropdown admin-quick-actions-dropdown">
                  <div className="admin-quick-actions-header">
                    <span className="admin-quick-actions-title">Store Shortcuts</span>
                    <span className="admin-quick-actions-pill">⚡ Fast Access</span>
                  </div>

                  <div className="admin-quick-actions-list">
                    <Link
                      to={`${ADMIN}/products`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-purple">
                        <Package size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Add New Product</span>
                        <span className="admin-quick-action-sub">Create catalog items</span>
                      </div>
                      <ArrowUpRight size={13} className="admin-quick-action-arrow" />
                    </Link>

                    <Link
                      to={`${ADMIN}/inventory`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-indigo">
                        <Boxes size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Stock & Inventory</span>
                        <span className="admin-quick-action-sub">Manage variants & units</span>
                      </div>
                      <ArrowUpRight size={13} className="admin-quick-action-arrow" />
                    </Link>

                    <Link
                      to={`${ADMIN}/coupons`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-amber">
                        <Tag size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Create Coupon Code</span>
                        <span className="admin-quick-action-sub">Promotions & vouchers</span>
                      </div>
                      <ArrowUpRight size={13} className="admin-quick-action-arrow" />
                    </Link>

                    <Link
                      to={`${ADMIN}/orders`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-emerald">
                        <ShoppingBag size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Manage Orders</span>
                        <span className="admin-quick-action-sub">Track sales & dispatch</span>
                      </div>
                      <ArrowUpRight size={13} className="admin-quick-action-arrow" />
                    </Link>

                    <Link
                      to={`${ADMIN}/customization`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-pink">
                        <Palette size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Store Customization</span>
                        <span className="admin-quick-action-sub">Banners & theme layout</span>
                      </div>
                      <ArrowUpRight size={13} className="admin-quick-action-arrow" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="admin-topbar-notif-wrap" ref={notifRef}>
              <button
                className="admin-topbar-notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                title="Notifications & Tasks"
              >
                <Bell size={17} />
                <span className="admin-topbar-notif-dot" />
              </button>

              {notifOpen && (
                <div className="admin-topbar-notif-dropdown">
                  <div className="admin-notif-header">
                    <strong>Store Notifications</strong>
                    <span className="admin-notif-badge">3 New</span>
                  </div>
                  <div className="admin-notif-list">
                    <div
                      className="admin-notif-item"
                      onClick={() => {
                        navigate(`${ADMIN}/orders`);
                        setNotifOpen(false);
                      }}
                    >
                      <div className="admin-notif-dot-active" />
                      <div className="admin-notif-content">
                        <p className="admin-notif-title">Dispatch AWB: ORD-2026-8802</p>
                        <span className="admin-notif-time">Pending shipment assignment</span>
                      </div>
                    </div>
                    <div
                      className="admin-notif-item"
                      onClick={() => {
                        navigate(`${ADMIN}/orders`);
                        setNotifOpen(false);
                      }}
                    >
                      <div className="admin-notif-dot-active" />
                      <div className="admin-notif-content">
                        <p className="admin-notif-title">Track DTDC-TN-9823412</p>
                        <span className="admin-notif-time">ORD-2026-8801 in transit</span>
                      </div>
                    </div>
                    <div
                      className="admin-notif-item"
                      onClick={() => {
                        navigate(`${ADMIN}/products`);
                        setNotifOpen(false);
                      }}
                    >
                      <div className="admin-notif-dot-active" />
                      <div className="admin-notif-content">
                        <p className="admin-notif-title">Low Stock Alert: 3 Left</p>
                        <span className="admin-notif-time">Anarkali Kurti catalog inventory</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-notif-footer">
                    <Link
                      to={`${ADMIN}/orders`}
                      onClick={() => setNotifOpen(false)}
                      className="admin-notif-view-all"
                    >
                      View all tasks & alerts →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Chip & Enhanced Dropdown with Breathing Room */}
            <div className="admin-topbar-profile-wrap" ref={dropdownRef}>
              <div
                className="admin-user-chip"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title="Admin Profile Menu"
              >
                <div className="admin-user-avatar-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt={adminName}
                    className="admin-topbar-avatar"
                  />
                  <span className="admin-avatar-status-dot" />
                </div>
                <div className="admin-topbar-user-info">
                  <span className="admin-topbar-user-name">{adminName}</span>
                  <span className="admin-topbar-user-role">Super Admin</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`admin-topbar-chevron ${userMenuOpen ? 'open' : ''}`}
                />
              </div>

              {/* Enhanced Rich Profile Dropdown */}
              {userMenuOpen && (
                <div className="admin-topbar-dropdown-menu">
                  {/* Rich Profile Header */}
                  <div className="admin-dropdown-header-card">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt={adminName}
                      className="admin-dropdown-avatar"
                    />
                    <div className="admin-dropdown-info">
                      <strong className="admin-dropdown-name">{adminName}</strong>
                      <span className="admin-dropdown-email">{adminEmail}</span>
                      <span className="admin-dropdown-badge">
                        <ShieldCheck size={11} /> Super Admin
                      </span>
                    </div>
                  </div>

                  <div className="admin-dropdown-section-title">Navigation & Quick Links</div>

                  <Link
                    to="/"
                    target="_blank"
                    className="admin-dropdown-item admin-dropdown-store-highlight"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="admin-dropdown-item-icon">
                      <Store size={15} />
                    </div>
                    <div className="admin-dropdown-item-text">
                      <span>View Customer Store</span>
                      <small>Live storefront in new tab</small>
                    </div>
                    <ArrowUpRight size={13} className="admin-dropdown-item-arrow" />
                  </Link>

                  <Link
                    to={`${ADMIN}/orders`}
                    className="admin-dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="admin-dropdown-item-icon">
                      <ShoppingBag size={15} />
                    </div>
                    <div className="admin-dropdown-item-text">
                      <span>Orders & Shipments</span>
                    </div>
                  </Link>

                  <Link
                    to={`${ADMIN}/products`}
                    className="admin-dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="admin-dropdown-item-icon">
                      <Package size={15} />
                    </div>
                    <div className="admin-dropdown-item-text">
                      <span>Product Catalog</span>
                    </div>
                  </Link>

                  <Link
                    to={`${ADMIN}/reports`}
                    className="admin-dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="admin-dropdown-item-icon">
                      <BarChart3 size={15} />
                    </div>
                    <div className="admin-dropdown-item-text">
                      <span>Store Analytics & Reports</span>
                    </div>
                  </Link>

                  <div className="admin-dropdown-divider" />

                  <button
                    onClick={handleLogout}
                    className="admin-dropdown-item admin-dropdown-logout"
                  >
                    <div className="admin-dropdown-item-icon">
                      <LogOut size={15} />
                    </div>
                    <div className="admin-dropdown-item-text">
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className={`admin-content ${isDashboard ? 'admin-content-dashboard' : ''}`}>
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
}

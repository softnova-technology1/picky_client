import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  ShoppingBag,
  Package,
  Tag,
  Percent,
  Settings,
  Store,
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight,
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
  RotateCcw,
  Star,
  ShoppingCart,
  MessageCircle,
  Flame,
  MessageSquareText,
} from 'lucide-react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useUiStore } from '../../../store/uiStore';
import { useCategoryStore } from '../../../store/categoryStore';
import { useReturnStore } from '../../../store/returnStore';
import { useReviewStore } from '../../../store/reviewStore';
import { useAbandonedCartStore } from '../../../store/abandonedCartStore';
import { useBroadcastStore } from '../../../store/broadcastStore';
import { adminService } from '../../../services/admin.service';
import { productService } from '../../../services/product.service';
import { contactService } from '../../../services/contact.service';
import Toast from '../../ui/Toast';
import '../../../styles/admin.css';

const ADMIN = '/softpicky-sn2026';

export default function AdminLayout({ children, title }) {
  const { adminUser: user, logout } = useAdminAuthStore();
  const { showToast } = useUiStore();
  const { categories, fetchCategories } = useCategoryStore();
  const pendingReturnsCount = useReturnStore((s) => s.returns.filter((r) => r.status === 'pending').length);
  const unreadReviewsCount = useReviewStore((s) => s.unreadCount);
  const markReviewsAsViewed = useReviewStore((s) => s.markReviewsAsViewed);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const pendingCartsCount = useAbandonedCartStore((s) => s.carts.filter((c) => c.status === 'pending').length);
  const campaigns = useBroadcastStore((s) => s.campaigns);
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Real-time synced admin notifications state
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);

  const refreshInquiriesCount = async () => {
    try {
      const res = await contactService.list({ limit: 1 });
      setUnreadInquiriesCount(res?.data?.unreadCount || 0);
    } catch (e) {}
  };

  const [adminNotifications, setAdminNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => n && n.id && !String(n.id).startsWith('notif-'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const refreshAdminNotifications = async () => {
    try {
      const res = await contactService.getNotifications({ limit: 10 }).catch(() => null);
      const apiNotifs = res?.data?.notifications || res?.data;
      if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
        const formatted = apiNotifs.filter((n) => n && n.type !== 'product' && n.type !== 'coupon' && !String(n.title || '').includes('Product in Catalog')).map((n) => ({
          ...n,
          id: n.id || n._id,
          relativeTime: n.relativeTime || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'),
        }));
        setAdminNotifications(formatted);
        localStorage.setItem('picky_admin_notifications', JSON.stringify(formatted));
        return;
      }
    } catch (e) {
      // ignore
    }
    try {
      const saved = localStorage.getItem('picky_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAdminNotifications(parsed.filter((n) => n && n.id && !String(n.id).startsWith('notif-')));
        }
      }
    } catch {}
  };

  useEffect(() => {
    refreshAdminNotifications();
    refreshInquiriesCount();
    const handleStorage = (e) => {
      if (e.key === 'picky_admin_notifications') {
        try {
          if (e.newValue) {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setAdminNotifications(parsed.filter((n) => n && n.id && !String(n.id).startsWith('notif-')));
            }
          }
        } catch {}
      }
    };
    const handleCustomUpdate = () => {
      refreshAdminNotifications();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('picky_notifications_updated', handleCustomUpdate);
    window.addEventListener('picky_inquiries_updated', refreshInquiriesCount);
    window.addEventListener('focus', refreshAdminNotifications);

    // Periodic real-time sync (every 6s when active)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshAdminNotifications();
        refreshInquiriesCount();
      }
    }, 6000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('picky_notifications_updated', handleCustomUpdate);
      window.removeEventListener('picky_inquiries_updated', refreshInquiriesCount);
      window.removeEventListener('focus', refreshAdminNotifications);
      clearInterval(pollInterval);
    };
  }, []);

  const unreadCount = adminNotifications.filter((n) => n.unread).length;
  const displayNotifs = adminNotifications.slice(0, 5);

  useEffect(() => {
    fetchCategories();
    fetchReviews();
  }, [fetchCategories, fetchReviews]);

  const dropdownRef = useRef(null);
  const quickAddRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);
  const notifTimerRef = useRef(null);

  const isDashboard = location.pathname === ADMIN || location.pathname === `${ADMIN}/`;

  // Notification hover handlers with 350ms graceful delay
  const handleNotifMouseEnter = () => {
    if (notifTimerRef.current) {
      clearTimeout(notifTimerRef.current);
      notifTimerRef.current = null;
    }
    setNotifOpen(true);
  };

  const handleNotifMouseLeave = () => {
    if (notifTimerRef.current) {
      clearTimeout(notifTimerRef.current);
    }
    notifTimerRef.current = setTimeout(() => {
      setNotifOpen(false);
    }, 350);
  };

  const handleNotifToggle = (e) => {
    e.stopPropagation();
    if (notifTimerRef.current) {
      clearTimeout(notifTimerRef.current);
      notifTimerRef.current = null;
    }
    setNotifOpen((prev) => !prev);
  };

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
        if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
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
        if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
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

  // Instant Search Results from live database
  const trimmed = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!trimmed) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [ordersRes, productsRes, customersRes] = await Promise.all([
          adminService.getOrders({ search: trimmed, limit: 3 }).catch(() => null),
          productService.list({ search: trimmed, limit: 3 }).catch(() => null),
          adminService.getCustomers({ search: trimmed, limit: 3 }).catch(() => null),
        ]);

        const oRaw = ordersRes?.data?.orders || ordersRes?.data || ordersRes;
        const pRaw = productsRes?.data?.products || productsRes?.data || productsRes;
        const cRaw = customersRes?.data?.customers || customersRes?.data || customersRes;

        const oList = Array.isArray(oRaw) ? oRaw : (Array.isArray(oRaw?.data) ? oRaw.data : []);
        const pList = Array.isArray(pRaw) ? pRaw : (Array.isArray(pRaw?.data) ? pRaw.data : []);
        const cList = Array.isArray(cRaw) ? cRaw : (Array.isArray(cRaw?.data) ? cRaw.data : []);

        setSearchResults({
          orders: oList.slice(0, 3),
          products: pList.slice(0, 3),
          customers: cList.slice(0, 3),
        });
      } catch (err) {
        setSearchResults({ orders: [], products: [], customers: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [trimmed]);

  const totalResultsCount = searchResults
    ? (searchResults.orders?.length || 0) + (searchResults.products?.length || 0) + (searchResults.customers?.length || 0)
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
      navigate(`${ADMIN}/orders?q=${encodeURIComponent(trimmed)}`);
    } else if (searchResults?.products.length > 0) {
      navigate(`${ADMIN}/products?q=${encodeURIComponent(trimmed)}`);
    } else if (searchResults?.customers.length > 0) {
      navigate(`${ADMIN}/customers?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`${ADMIN}/orders?q=${encodeURIComponent(trimmed)}`);
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
                height: collapsed ? '32px' : '42px',
                width: 'auto',
                maxWidth: collapsed ? '48px' : '160px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                display: 'block',
                margin: '0 auto',
                transition: 'all 0.25s ease',
              }}
            />
          </Link>
        </div>

        {/* Navigation List - Structured SaaS Luxury Sidebar */}
        <nav className="admin-sidebar-nav">
          {/* ── OVERVIEW ── */}
          {!collapsed && <div className="admin-nav-section-title">Overview</div>}
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

          {/* ── SALES & FULFILLMENT ── */}
          {!collapsed && <div className="admin-nav-section-title">Sales & Fulfillment</div>}
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

          <NavLink
            to={`${ADMIN}/returns`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Returns & Refunds"
          >
            <div className="admin-nav-icon-wrap">
              <RotateCcw size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Returns & Refunds</span>
                {pendingReturnsCount > 0 && (
                  <span className="admin-nav-badge" title={`${pendingReturnsCount} pending review`}>
                    {pendingReturnsCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to={`${ADMIN}/abandoned-carts`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Abandoned Carts Recovery"
          >
            <div className="admin-nav-icon-wrap">
              <ShoppingCart size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Abandoned Carts</span>
                {pendingCartsCount > 0 && (
                  <span className="admin-nav-badge" style={{ background: '#ef4444', color: '#ffffff' }} title={`${pendingCartsCount} pending recovery alert`}>
                    {pendingCartsCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* ── CATALOG & STOCK ── */}
          {!collapsed && <div className="admin-nav-section-title">Catalog & Stock</div>}
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

          <NavLink
            to={`${ADMIN}/categories`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Categories"
          >
            <div className="admin-nav-icon-wrap">
              <Layers size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Categories</span>}
          </NavLink>

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

          <NavLink
            to={`${ADMIN}/reviews`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Product Reviews & Ratings"
            onClick={() => {
              markReviewsAsViewed();
            }}
          >
            <div className="admin-nav-icon-wrap">
              <Star size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Reviews & Ratings</span>
                {unreadReviewsCount > 0 && location.pathname !== `${ADMIN}/reviews` && (
                  <span
                    className="admin-nav-badge notif-pulse"
                    title={`${unreadReviewsCount} new unread review${unreadReviewsCount > 1 ? 's' : ''}`}
                  >
                    {unreadReviewsCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* ── CUSTOMERS & OFFERS ── */}
          {!collapsed && <div className="admin-nav-section-title">Customers & Offers</div>}
          <NavLink
            to={`${ADMIN}/customers`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Users & Customers"
          >
            <div className="admin-nav-icon-wrap">
              <Users size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Users / Customers</span>}
          </NavLink>

          <NavLink
            to={`${ADMIN}/coupons`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Coupons & Promo Codes"
          >
            <div className="admin-nav-icon-wrap">
              <Tag size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Coupons</span>}
          </NavLink>

          <NavLink
            to={`${ADMIN}/discounts`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Automatic Cart Discounts"
          >
            <div className="admin-nav-icon-wrap">
              <Percent size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Discounts</span>}
          </NavLink>

          <NavLink
            to={`${ADMIN}/broadcast`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="WhatsApp Broadcast & Marketing Center"
          >
            <div className="admin-nav-icon-wrap">
              <MessageCircle size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">WhatsApp Broadcast</span>
                <span
                  className="admin-nav-badge"
                  style={{ background: '#059669', color: '#ffffff', fontSize: '0.66rem' }}
                  title="Meta Cloud API Connected"
                >
                  LIVE
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to={`${ADMIN}/flash-sales`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Flash Sales & Festival Campaigns"
          >
            <div className="admin-nav-icon-wrap">
              <Flame size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Flash Sales & Events</span>
                <span
                  className="admin-nav-badge"
                  style={{ background: '#dc2626', color: '#ffffff', fontSize: '0.66rem' }}
                  title="Active Flash Deals"
                >
                  HOT
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to={`${ADMIN}/inquiries`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Customer Inquiries (Homepage and Contact Page)"
          >
            <div className="admin-nav-icon-wrap">
              <MessageSquareText size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Inquiries</span>
                {unreadInquiriesCount > 0 && (
                  <span
                    className="admin-nav-badge notif-pulse"
                    title={`${unreadInquiriesCount} unread customer inquir${unreadInquiriesCount > 1 ? 'ies' : 'y'}`}
                  >
                    {unreadInquiriesCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* ── STOREFRONT & SYSTEM ── */}
          {!collapsed && <div className="admin-nav-section-title">Storefront & System</div>}
          <NavLink
            to={`${ADMIN}/customization`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Store Customization"
          >
            <div className="admin-nav-icon-wrap">
              <Palette size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Customization (CMS)</span>}
          </NavLink>

          <NavLink
            to={`${ADMIN}/notifications`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Notifications & Activity Feed"
          >
            <div className="admin-nav-icon-wrap">
              <Bell size={19} />
            </div>
            {!collapsed && (
              <>
                <span className="admin-nav-label">Notifications</span>
                {unreadCount > 0 && (
                  <span
                    className="admin-nav-badge notif-pulse"
                    title={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                  >
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to={`${ADMIN}/settings`}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            title="Store Settings"
          >
            <div className="admin-nav-icon-wrap">
              <Settings size={19} />
            </div>
            {!collapsed && <span className="admin-nav-label">Settings</span>}
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
                {searchLoading ? (
                  <div className="admin-search-empty" style={{ padding: '1rem', color: '#64748b' }}>
                    <span>Searching database...</span>
                  </div>
                ) : totalResultsCount === 0 ? (
                  <div className="admin-search-empty">
                    <span>No matches found for "{searchQuery}"</span>
                  </div>
                ) : (
                  <>
                    {searchResults?.orders?.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Orders</span>
                        {searchResults.orders.map((ord) => {
                          const orderCustomer = ord.customer?.name || ord.user?.name || ord.customerName || ord.shippingAddress?.fullName || 'Customer';
                          const orderAmount = ord.pricing?.finalTotal ?? ord.total ?? ord.totalAmount ?? 0;
                          return (
                            <div
                              key={ord._id || ord.orderNumber}
                              className="admin-search-result-row"
                              onClick={() => handleSearchSelect(`${ADMIN}/orders?q=${encodeURIComponent(ord.orderNumber)}`)}
                            >
                              <ShoppingBag size={14} className="admin-search-row-icon" />
                              <div className="admin-search-row-text">
                                <span className="admin-search-row-main">{ord.orderNumber} — {orderCustomer}</span>
                                <span className="admin-search-row-sub">₹{Number(orderAmount).toLocaleString()} • {ord.status}</span>
                              </div>
                              <span className="admin-search-badge badge-order">Order</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {searchResults?.products?.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Products</span>
                        {searchResults.products.map((p) => {
                          const catName = typeof p.category === 'object' ? p.category?.name : (p.category || 'Product');
                          const price = p.discountPrice || p.price || 0;
                          return (
                            <div
                              key={p._id || p.id}
                              className="admin-search-result-row"
                              onClick={() => handleSearchSelect(`${ADMIN}/products`)}
                            >
                              <Package size={14} className="admin-search-row-icon" />
                              <div className="admin-search-row-text">
                                <span className="admin-search-row-main">{p.name}</span>
                                <span className="admin-search-row-sub">₹{Number(price).toLocaleString()} • {catName}</span>
                              </div>
                              <span className="admin-search-badge badge-product">Product</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {searchResults?.customers?.length > 0 && (
                      <div className="admin-search-group">
                        <span className="admin-search-group-title">Users</span>
                        {searchResults.customers.map((c) => (
                          <div
                            key={c._id || c.id}
                            className="admin-search-result-row"
                            onClick={() => handleSearchSelect(`${ADMIN}/customers?q=${encodeURIComponent(c.name)}`)}
                          >
                            <Users size={14} className="admin-search-row-icon" />
                            <div className="admin-search-row-text">
                              <span className="admin-search-row-main">{c.name}</span>
                              <span className="admin-search-row-sub">{c.phone || c.email || 'User'} • {c.city || 'Tamil Nadu'}</span>
                            </div>
                            <span className="admin-search-badge badge-customer">User</span>
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
                <Plus size={14} strokeWidth={2.5} className="admin-quick-action-btn-icon" />
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
                      to={`${ADMIN}/discounts`}
                      className="admin-quick-add-item admin-quick-action-item"
                      onClick={() => setQuickAddOpen(false)}
                    >
                      <div className="admin-quick-action-icon-box icon-purple">
                        <Percent size={15} />
                      </div>
                      <div className="admin-quick-action-text">
                        <span className="admin-quick-action-main">Create Automatic Offer</span>
                        <span className="admin-quick-action-sub">Cart discounts & rules</span>
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

            {/* Notification Bell Dropdown (Hover & Click with Real-Time Synced Notifications) */}
            <div
              className="admin-topbar-notif-wrap"
              ref={notifRef}
              onMouseEnter={() => {
                refreshAdminNotifications();
                handleNotifMouseEnter();
              }}
              onMouseLeave={handleNotifMouseLeave}
            >
              <button
                type="button"
                className="admin-topbar-notif-btn"
                onClick={(e) => {
                  refreshAdminNotifications();
                  handleNotifToggle(e);
                }}
                title="Notifications (Hover to preview, Click to open)"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="admin-topbar-notif-dot" />}
              </button>

              {notifOpen && (
                <div
                  className="admin-topbar-notif-dropdown"
                  onMouseEnter={handleNotifMouseEnter}
                  onMouseLeave={handleNotifMouseLeave}
                >
                  <div className="admin-notif-header">
                    <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#1e1b4b' }}>
                      <Bell size={15} style={{ color: '#7025fb' }} /> Notifications
                    </span>
                    <span className="admin-notif-badge">
                      {unreadCount > 0 ? `${unreadCount} New` : 'All caught up'}
                    </span>
                  </div>

                  <div className="admin-notif-list">
                    {displayNotifs.length > 0 ? (
                      displayNotifs.map((n) => {
                        const isContact = n.type === 'contact';
                        const dotColor = isContact ? '#7c3aed' : (n.type === 'inventory' ? '#f59e0b' : (n.type === 'coupon' ? '#10b981' : '#7025fb'));
                        return (
                          <div
                            key={n.id}
                            className="admin-notif-item"
                            onClick={() => {
                              if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
                              setNotifOpen(false);
                              navigate(n.link || `${ADMIN}/notifications`);
                            }}
                          >
                            <span className="admin-notif-dot-active" style={{ background: dotColor }} />
                            <div className="admin-notif-content">
                              <div className="admin-notif-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{n.title}</span>
                                {(n.hasAttachment || n.metadata?.hasAttachment) && (
                                  <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: '#ede9fe', color: '#6d28d9', fontWeight: 600 }}>
                                    📎 File
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'block', marginTop: '2px', lineHeight: 1.3 }}>
                                {n.message}
                              </span>
                              <span className="admin-notif-time">{n.relativeTime || n.time || 'Recent'}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        No new notifications
                      </div>
                    )}
                  </div>

                  <div className="admin-notif-footer">
                    <button
                      type="button"
                      className="admin-notif-view-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
                        setNotifOpen(false);
                        navigate(`${ADMIN}/notifications`);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        padding: '0.35rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontFamily: 'inherit',
                      }}
                    >
                      Show More Notifications & Settings →
                    </button>
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

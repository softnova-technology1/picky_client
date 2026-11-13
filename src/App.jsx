import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';
import LoginPopupModal from './components/common/LoginPopupModal/LoginPopupModal';
import { useButtonHoverFX } from './hooks/useButtonHoverFX';

// ── Critical Path Customer Pages (Synchronous for instantaneous launch) ──
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategorySubcategories from './pages/CategorySubcategories';
import ProductList from './pages/ProductList';
import NewArrivals from './pages/NewArrivals';
import BestSellers from './pages/BestSellers';
import Discounts from './pages/Discounts';
import ProductDetail from './pages/ProductDetail';
import ProductCustomize from './pages/ProductCustomize/ProductCustomize';
import CustomizedOrder from './pages/CustomizedOrder/CustomizedOrder';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';

// ── Lazy-Loaded Customer Support & Secondary Pages ───────────
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Account = lazy(() => import('./pages/Account'));
const Contact = lazy(() => import('./pages/contact/Contact'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy/ReturnPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy/ShippingPolicy'));
const Faq = lazy(() => import('./pages/Faq/Faq'));
const SizeGuide = lazy(() => import('./pages/SizeGuide/SizeGuide'));

// ── Lazy-Loaded Admin Operations Portal (Single unified chunk, isolated from customer bundle) ──
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'));

// Minimal, zero-overhead sleek page loading spinner
function PageLoader() {
  return (
    <div style={{
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        border: '3px solid #ede8f8',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const ADMIN = '/softpicky-sn2026';
const ADMIN_ALT = '/softpicky_sn2026';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

import { useCustomizationStore } from './store/customizationStore';
import { adminService } from './services/admin.service';
import { settingsService } from './services/settings.service';
import { useCategoryStore } from './store/categoryStore';
import { useBlogStore } from './store/blogStore';
import { getSocket } from './services/socket';
import { initServerWatcher } from './services/serverWatcher';

export default function App() {
  useButtonHoverFX();
  const { setSections, setPageSections } = useCustomizationStore();

  useEffect(() => {
    try { getSocket(); } catch (_) {}
    try { initServerWatcher(); } catch (_) {}
    const fetchLatestCustomizations = () => {
      adminService
        .getCustomizations()
        .then((res) => {
          const data = res?.data || res;
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            for (const [pageId, sections] of Object.entries(data)) {
              if (Array.isArray(sections) && sections.length > 0) {
                setPageSections(pageId, sections, false);
              }
            }
          }
        })
        .catch(() => {});
    };

    // 1. Initial fetch on mount
    fetchLatestCustomizations();
    settingsService.getSettings().catch(() => {});

    // 2. Fetch real DB categories & blog configuration for frontend navigation
    useCategoryStore.getState().fetchCategories();
    useBlogStore.getState().fetchBlogFromApi();

    // 3. Auto-recovery when backend server starts or reconnects
    const handleServerRecovery = () => {
      console.log('⚡ [App] Backend server reconnected. Auto-syncing application state...');
      fetchLatestCustomizations();
      settingsService.getSettings().catch(() => {});
      useCategoryStore.getState().fetchCategories(true);
      useBlogStore.getState().fetchBlogFromApi();
      try { qc.invalidateQueries(); } catch (_) {}
    };

    window.addEventListener('picky_server_reconnected', handleServerRecovery);

    // 4. Tab visibility / Window focus revalidation (throttled to avoid connection flooding):
    let lastFocusSyncAt = 0;
    const isAdminRoute = () =>
      window.location.pathname.startsWith(ADMIN) || window.location.pathname.startsWith(ADMIN_ALT);

    const handleRevalidate = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastFocusSyncAt < 15000) return;
      lastFocusSyncAt = now;

      // Avoid storefront sync flooding when navigating inside the Admin Portal
      if (isAdminRoute()) return;

      fetchLatestCustomizations();
      settingsService.getSettings().catch(() => {});
      useCategoryStore.getState().fetchCategories(true);
      useBlogStore.getState().fetchBlogFromApi();
      window.dispatchEvent(new CustomEvent('picky_catalog_updated'));
    };

    window.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);

    // 5. Lightweight background sync & DB auto-reconnect poll (every 25s when on storefront)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        if (useCategoryStore.getState().categories.length === 0) {
          useCategoryStore.getState().fetchCategories(true);
        }
        if (!isAdminRoute()) {
          fetchLatestCustomizations();
          useBlogStore.getState().fetchBlogFromApi();
        }
      }
    }, 25000);

    return () => {
      window.removeEventListener('picky_server_reconnected', handleServerRecovery);
      window.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
      clearInterval(pollInterval);
    };
  }, [setPageSections]);


  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    'picky-dev-placeholder.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
        <ScrollToTop />
        <LoginPopupModal />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* ── Customer Core Catalog & Browsing ─────── */}
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategorySubcategories />} />
          <Route path="/categories/:slug/:subSlug" element={<ProductList />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/best-sellers" element={<BestSellers />} />
          <Route path="/bestsellers" element={<BestSellers />} />
          <Route path="/limited-deals" element={<Discounts />} />
          <Route path="/limiteddeals" element={<Navigate to="/limited-deals" replace />} />
          <Route path="/discounts" element={<Navigate to="/limited-deals" replace />} />
          <Route path="/deals" element={<Navigate to="/limited-deals" replace />} />
          <Route path="/offers" element={<Navigate to="/limited-deals" replace />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/products/:slug/customize" element={<ProductCustomize />} />
          <Route path="/product/:slug/customize" element={<ProductCustomize />} />
          <Route path="/customize/:slug" element={<ProductCustomize />} />
          <Route path="/customized-order" element={<CustomizedOrder />} />
          <Route path="/products/:slug/customized-order" element={<CustomizedOrder />} />
          <Route path="/search" element={<ProductList />} />

          {/* ── Customer Shopping Funnel ─────────────── */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          {/* ── Customer Authentication ──────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Customer Profile Hub & Orders ────────── */}
          <Route path="/profile" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/profile/*" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account" element={<Navigate to="/profile" replace />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

          {/* ── Support & Legal ──────────────────────── */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/returns" element={<ReturnPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/shipping" element={<Navigate to="/shipping-policy" replace />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/help" element={<Faq />} />
          <Route path="/size-guide" element={<SizeGuide />} />

          {/* ── Admin Protected Portal ───────────────── */}
          <Route path={`${ADMIN}/*`} element={<AdminRoutes />} />
          <Route path={`${ADMIN_ALT}/*`} element={<AdminRoutes />} />


            {/* ── Catch-all 404 Page ───────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

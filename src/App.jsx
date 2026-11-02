import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop';
import LoginPopupModal from './components/common/LoginPopupModal/LoginPopupModal';
import { useButtonHoverFX } from './hooks/useButtonHoverFX';

// Customer Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategorySubcategories from './pages/CategorySubcategories';
import ProductList from './pages/ProductList';
import NewArrivals from './pages/NewArrivals';
import BestSellers from './pages/BestSellers';
import Discounts from './pages/Discounts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import TrackOrder from './pages/TrackOrder';
import Account from './pages/Account';
import Contact from './pages/contact/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ReturnPolicy from './pages/ReturnPolicy/ReturnPolicy';
import ShippingPolicy from './pages/ShippingPolicy/ShippingPolicy';
import Faq from './pages/Faq/Faq';
import SizeGuide from './pages/SizeGuide/SizeGuide';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminReturns from './pages/admin/AdminReturns';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubCategories from './pages/admin/AdminSubCategories';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminCustomization from './pages/admin/AdminCustomization';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAbandonedCarts from './pages/admin/AdminAbandonedCarts';
import AdminBroadcast from './pages/admin/AdminBroadcast';
import AdminFlashSales from './pages/admin/AdminFlashSales';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminBlog from './pages/admin/AdminBlog';

const ADMIN = '/softpicky-sn2026';
const ADMIN_ALT = '/softpicky_sn2026';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

import { useEffect } from 'react';
import { useCustomizationStore } from './store/customizationStore';
import { adminService } from './services/admin.service';
import { settingsService } from './services/settings.service';
import { useCategoryStore } from './store/categoryStore';
import { getSocket } from './services/socket';

export default function App() {
  useButtonHoverFX();
  const { setSections, setPageSections } = useCustomizationStore();

  useEffect(() => {
    try { getSocket(); } catch (_) {}
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

    // 2. Fetch real DB categories for frontend navigation
    useCategoryStore.getState().fetchCategories();

    // 3. Tab visibility / Window focus revalidation:
    // When switching from Admin tab back to Storefront tab, instantly revalidate
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestCustomizations();
        settingsService.getSettings().catch(() => {});
        useCategoryStore.getState().fetchCategories(true);
        window.dispatchEvent(new CustomEvent('picky_catalog_updated'));
      }
    };

    window.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);

    // 4. Lightweight background sync & DB auto-reconnect poll (every 3.5s when tab is active)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLatestCustomizations();
        // If DB was offline on initial load and categories are still empty, keep auto-retrying!
        if (useCategoryStore.getState().categories.length === 0) {
          useCategoryStore.getState().fetchCategories(true);
        }
      }
    }, 3500);

    return () => {
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
          <Route path={ADMIN} element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path={ADMIN_ALT} element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/orders`} element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/orders`} element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/orders/:id`} element={<AdminProtectedRoute><AdminOrderDetail /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/orders/:id`} element={<AdminProtectedRoute><AdminOrderDetail /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/returns`} element={<AdminProtectedRoute><AdminReturns /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/returns`} element={<AdminProtectedRoute><AdminReturns /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/abandoned-carts`} element={<AdminProtectedRoute><AdminAbandonedCarts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/abandoned-carts`} element={<AdminProtectedRoute><AdminAbandonedCarts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/broadcast`} element={<AdminProtectedRoute><AdminBroadcast /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/broadcast`} element={<AdminProtectedRoute><AdminBroadcast /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/flash-sales`} element={<AdminProtectedRoute><AdminFlashSales /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/flash-sales`} element={<AdminProtectedRoute><AdminFlashSales /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/products`} element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/products`} element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/categories`} element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/categories`} element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/subcategories`} element={<AdminProtectedRoute><AdminSubCategories /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/subcategories`} element={<AdminProtectedRoute><AdminSubCategories /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/inventory`} element={<AdminProtectedRoute><AdminInventory /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/inventory`} element={<AdminProtectedRoute><AdminInventory /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/reviews`} element={<AdminProtectedRoute><AdminReviews /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/reviews`} element={<AdminProtectedRoute><AdminReviews /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/coupons`} element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/coupons`} element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/discounts`} element={<AdminProtectedRoute><AdminDiscounts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/discounts`} element={<AdminProtectedRoute><AdminDiscounts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/customers`} element={<AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/customers`} element={<AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/customization`} element={<AdminProtectedRoute><AdminCustomization /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/customization`} element={<AdminProtectedRoute><AdminCustomization /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/settings`} element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/settings`} element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/notifications`} element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/notifications`} element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/inquiries`} element={<AdminProtectedRoute><AdminInquiries /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/inquiries`} element={<AdminProtectedRoute><AdminInquiries /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/blog`} element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />
          <Route path={`${ADMIN_ALT}/blog`} element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />


          {/* ── Catch-all 404 Page ───────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

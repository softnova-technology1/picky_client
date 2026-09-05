import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategorySubcategories from './pages/CategorySubcategories';
import CategoryProducts from './pages/CategoryProducts';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import Contact from './pages/contact/Contact';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReports from './pages/admin/AdminReports';

const ADMIN = '/pickyadmin-softnova2026';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* ── Customer Routes ─────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategorySubcategories />} />
          <Route path="/categories/:slug/:subSlug" element={<CategoryProducts />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />

          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* ── Protected Customer Routes ────────────── */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

          {/* ── Admin Routes ─────────────────────────── */}
          <Route path={ADMIN} element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/orders`} element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/orders/:id`} element={<AdminProtectedRoute><AdminOrderDetail /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/products`} element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/categories`} element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/customers`} element={<AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>} />
          <Route path={`${ADMIN}/reports`} element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

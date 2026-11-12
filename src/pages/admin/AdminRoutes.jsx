import { Routes, Route } from 'react-router-dom';
import { AdminProtectedRoute } from '../../components/layout/AdminProtectedRoute';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminOrderDetail from './AdminOrderDetail';
import AdminCustomizedOrders from './AdminCustomizedOrders';
import AdminReturns from './AdminReturns';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminSubCategories from './AdminSubCategories';
import AdminInventory from './AdminInventory';
import AdminCustomers from './AdminCustomers';
import AdminCoupons from './AdminCoupons';
import AdminDiscounts from './AdminDiscounts';
import AdminCustomization from './AdminCustomization';
import AdminSettings from './AdminSettings';
import AdminReviews from './AdminReviews';
import AdminAbandonedCarts from './AdminAbandonedCarts';
import AdminBroadcast from './AdminBroadcast';
import AdminFlashSales from './AdminFlashSales';
import AdminNotifications from './AdminNotifications';
import AdminInquiries from './AdminInquiries';
import AdminBlog from './AdminBlog';
import NotFound from '../NotFound';

/**
 * Unified Admin Portal Route Bundle
 * Kept as a single lazy boundary from customer storefront while ensuring
 * instantaneous zero-spinner transitions between all admin pages.
 */
export default function AdminRoutes() {
  return (
    <AdminProtectedRoute>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customized-orders" element={<AdminCustomizedOrders />} />
        <Route path="customized-order" element={<AdminCustomizedOrders />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
        <Route path="broadcast" element={<AdminBroadcast />} />
        <Route path="flash-sales" element={<AdminFlashSales />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="subcategories" element={<AdminSubCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="discounts" element={<AdminDiscounts />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customization" element={<AdminCustomization />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminProtectedRoute>
  );
}

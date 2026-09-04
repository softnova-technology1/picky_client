import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

const ADMIN = '/pickyadmin-softnova2026';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sumRes, ordRes] = await Promise.all([
          adminService.getSalesSummary(),
          adminService.getOrders({ limit: 5 }),
        ]);
        setSummary(sumRes?.data || sumRes);
        setRecentOrders(ordRes?.data?.data || ordRes?.data || []);
      } catch (err) {
        console.error('Failed to load admin summary:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminLayout title="Admin Overview & Metrics">
      {loading ? (
        <Spinner size={40} />
      ) : (
        <>
          {/* Metrics Row */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                💰
              </div>
              <div>
                <div className="metric-val">{formatPrice(summary?.totalRevenue || 0)}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                📦
              </div>
              <div>
                <div className="metric-val">{summary?.totalOrders || 0}</div>
                <div className="metric-label">Total Orders</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                👥
              </div>
              <div>
                <div className="metric-val">{summary?.totalCustomers || 0}</div>
                <div className="metric-label">Customers</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                🏷️
              </div>
              <div>
                <div className="metric-val">{summary?.totalProducts || 0}</div>
                <div className="metric-label">Active Products</div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Link to={`${ADMIN}/orders`} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
              <div>
                <h4 style={{ margin: 0 }}>Manage Shipments</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Enter AWB & dispatch</span>
              </div>
              <span style={{ fontSize: '1.5rem' }}>🚚</span>
            </Link>

            <Link to={`${ADMIN}/products`} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div>
                <h4 style={{ margin: 0 }}>Add New Product</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Update catalog & inventory</span>
              </div>
              <span style={{ fontSize: '1.5rem' }}>➕</span>
            </Link>
          </div>

          {/* Recent Orders Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Recent Orders</h3>
              <Link to={`${ADMIN}/orders`} style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                View All Orders ➔
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0' }}>No orders placed yet.</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>#{order.orderNumber}</strong>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.items?.length || 0} item(s)</td>
                        <td><strong>{formatPrice(order.total)}</strong></td>
                        <td><Badge status={order.status} /></td>
                        <td>
                          <Link to={`${ADMIN}/orders/${order._id}`} className="btn btn-primary btn-sm">
                            Manage & AWB ➔
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [sumRes, topRes, coupRes] = await Promise.all([
          adminService.getSalesSummary(),
          adminService.getTopProducts(5),
          adminService.getCoupons(),
        ]);
        setSummary(sumRes?.data || sumRes);
        setTopProducts(topRes?.data || topRes || []);
        setCoupons(coupRes?.data || coupRes || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <AdminLayout title="Reports & Financial Analytics">
      {loading ? (
        <Spinner size={40} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Revenue Breakdown */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                💵
              </div>
              <div>
                <div className="metric-val">{formatPrice(summary?.totalRevenue || 0)}</div>
                <div className="metric-label">Gross Revenue</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                🏷️
              </div>
              <div>
                <div className="metric-val">{formatPrice(summary?.totalDiscount || 0)}</div>
                <div className="metric-label">Total Discounts Given</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                📦
              </div>
              <div>
                <div className="metric-val">{summary?.confirmedOrders || 0}</div>
                <div className="metric-label">Fulfilled Orders</div>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Top 5 Best Selling Products</h3>
            {topProducts.length === 0 ? (
              <p style={{ color: '#64748b' }}>No sales data recorded yet.</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Total Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt={p.name}
                              style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td><strong>{p.unitsSold} units</strong></td>
                        <td><strong style={{ color: 'var(--color-primary)' }}>{formatPrice(p.totalRevenue)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Coupons & Promotions */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Promotional Coupons</h3>
            {coupons.length === 0 ? (
              <p style={{ color: '#64748b' }}>No active coupons configured.</p>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount Type</th>
                      <th>Value</th>
                      <th>Min Order</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id}>
                        <td><code>{c.code}</code></td>
                        <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                        <td><strong>{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</strong></td>
                        <td>{formatPrice(c.minOrderAmount || 0)}</td>
                        <td>
                          <span style={{ color: c.isActive ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

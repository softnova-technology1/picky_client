import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

const ADMIN = '/pickyadmin-softnova2026';
const STATUS_TABS = ['all', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const params = {};
        if (activeTab !== 'all') params.status = activeTab;
        const res = await adminService.getOrders(params);
        setOrders(res?.data?.data || res?.data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [activeTab]);

  const filteredOrders = orders.filter((o) =>
    (o.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <AdminLayout title="Orders & Shipment Management">
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: activeTab === tab ? 'var(--color-primary)' : '#f1f5f9',
                  color: activeTab === tab ? 'white' : '#475569',
                  transition: 'var(--transition)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by Order #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ maxWidth: '280px', padding: '0.45rem 0.85rem' }}
          />
        </div>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Total Paid</th>
                <th>Tracking (AWB)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order.orderNumber}</strong>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td><strong>{formatPrice(order.total)}</strong></td>
                    <td>
                      {order.trackingId ? (
                        <div>
                          <strong style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{order.trackingId}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>({order.courier})</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Not assigned</span>
                      )}
                    </td>
                    <td><Badge status={order.status} /></td>
                    <td>
                      <Link to={`${ADMIN}/orders/${order._id}`} className="btn btn-outline btn-sm">
                        Manage & Enter AWB ➔
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

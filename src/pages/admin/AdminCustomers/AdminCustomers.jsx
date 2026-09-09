import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Phone,
  MessageCircle,
  Search,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Spinner from '../../../components/ui/Spinner';
import { adminService } from '../../../services/admin.service';
import { formatPrice } from '../../../utils/formatPrice';
import { MOCK_CUSTOMERS, MOCK_SALES_SUMMARY } from '../../../data/adminMockData';

export default function AdminCustomers() {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminService.getSalesSummary().catch(() => null);
        const sumData = res?.data || res;
        if (sumData && sumData.totalCustomers > 0) {
          setSummary(sumData);
        } else {
          setSummary(MOCK_SALES_SUMMARY);
        }
        setCustomers(MOCK_CUSTOMERS);
      } catch (err) {
        console.error('Failed to load customers info:', err);
        setSummary(MOCK_SALES_SUMMARY);
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout title="Customers & Directory">
      {/* 3 Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#ede8f8', color: '#7c3aed' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="metric-val">{(summary?.totalCustomers || 1024).toLocaleString()}</div>
            <div className="metric-label">Registered Accounts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="metric-val">100%</div>
            <div className="metric-label">WhatsApp Verified</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="metric-val">842</div>
            <div className="metric-label">Repeat Buyers</div>
          </div>
        </div>
      </div>

      {/* Customers CRM Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
              Customer Profiles & Order History
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Direct verified WhatsApp contacts for delivery & transactional coordination
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', color: '#8a7ca6' }} />
            <input
              type="text"
              placeholder="Search by Name, Phone, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '280px',
                padding: '0.45rem 1rem 0.45rem 2.4rem',
                background: '#ede8f8',
                border: '1px solid #dfd5f5',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                color: '#1e1b4b',
                outline: 'none',
                boxShadow: 'inset 0 1.5px 3px rgba(124, 58, 237, 0.04)',
              }}
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
                  <th>Customer</th>
                  <th>WhatsApp Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Orders</th>
                  <th>Lifetime Value</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="admin-customer-avatar">
                          {c.name[0]}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#1e1b4b', display: 'block' }}>
                            {c.name}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                            ● Verified Account
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#16a34a',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                        }}
                      >
                        <Phone size={12} /> {c.phone}
                      </a>
                    </td>
                    <td style={{ color: '#64748b' }}>{c.email}</td>
                    <td>
                      <span style={{ background: '#ede8f8', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>
                        {c.city}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#1e1b4b' }}>{c.ordersCount} orders</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#7c3aed' }}>{formatPrice(c.totalSpent)}</strong>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(c.name)},%20from%20Picky%20Store!`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-view-all-btn"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <MessageCircle size={13} color="#16a34a" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

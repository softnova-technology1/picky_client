import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';

export default function AdminCustomers() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminService.getSalesSummary();
        setSummary(res?.data || res);
      } catch (err) {
        console.error('Failed to load customers info:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminLayout title="Customers & Users">
      <div style={{ marginBottom: '1.5rem' }}>
        <p>Registered customer profiles authenticated via WhatsApp OTP.</p>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {summary?.totalCustomers || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Customers</div>
            </div>

            <div style={{ padding: '1.25rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                100%
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>WhatsApp Verified</div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: '#ede9fe', borderRadius: '8px', color: '#5b21b6', fontSize: '0.9rem' }}>
            🔒 <strong>Customer Security & Privacy:</strong> Customer phone numbers are strictly used for delivery OTP verification and transactional order tracking on WhatsApp.
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

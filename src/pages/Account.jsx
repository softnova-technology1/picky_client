import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuthStore } from '../store/authStore';

export default function Account() {
  const { user, logout } = useAuthStore();

  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '700px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>My Account</h1>

          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
                {user?.name ? user.name[0].toUpperCase() : '👤'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{user?.name || 'Picky Customer'}</h3>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.phone}</span>
                <span style={{ display: 'inline-block', marginLeft: '0.5rem', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link to="/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}>
                📦 View Order History
              </Link>
              <Link to="/cart" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}>
                🛒 Open Cart
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Account Security</h4>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              You are securely authenticated using WhatsApp OTP verification.
            </p>
            <button
              onClick={logout}
              className="btn btn-danger btn-sm"
            >
              Log Out of Account
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

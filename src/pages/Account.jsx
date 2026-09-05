import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuthStore } from '../store/authStore';
import { User, Package, ShoppingCart, LogOut, ShieldCheck } from 'lucide-react';

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
                {user?.name ? user.name[0].toUpperCase() : <User size={30} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{user?.name || 'Crackly Customer'}</h3>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.phone}</span>
                <span style={{ display: 'inline-block', marginLeft: '0.5rem', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Link to="/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#7c3aed" /> View Order History
              </Link>
              <Link to="/cart" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={18} color="#7c3aed" /> Open Cart
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#059669" /> Account Security
            </h4>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem', color: '#64748b' }}>
              You are securely authenticated using WhatsApp OTP verification.
            </p>
            <button
              onClick={logout}
              className="btn btn-danger btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LogOut size={15} /> Log Out of Account
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

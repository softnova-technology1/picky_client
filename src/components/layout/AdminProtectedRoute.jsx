import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import Button from '../ui/Button';

export function AdminProtectedRoute({ children }) {
  const { isLoggedIn, user, login, logout } = useAuthStore();
  const [email, setEmail] = useState('admin@picky.com');
  const [password, setPassword] = useState('Admin@Picky2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. If logged in and role is admin -> grant access immediately!
  if (isLoggedIn && user?.role === 'admin') {
    return children;
  }

  // 2. If logged in as customer (non-admin)
  if (isLoggedIn && user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '2.5rem 2rem', color: 'white', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⛔</span>
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Access Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You are currently signed in as a customer. Please sign in with an authorized Administrator account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => logout()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Sign In to Admin Portal ➔
            </button>
            <a
              href="/"
              style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              Return to Customer Store
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. If not logged in -> Show direct Admin Email & Password Login right on this URL!
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both admin email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.adminLogin(email.trim(), password);
      const data = res?.data || res;
      login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2.5rem 2rem', color: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: 'white', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem' }}>
            🔒 PICKY ADMIN PORTAL
          </div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', margin: '0.2rem 0 0.4rem' }}>Admin Sign In</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Enter your admin credentials to access live order dispatch and inventory operations.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@picky.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0f172a',
                border: '1.5px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Encrypted Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0f172a',
                border: '1.5px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <Button type="submit" variant="primary" block size="lg" loading={loading}>
            Sign In to Dashboard ➔
          </Button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
          <a href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Customer Store
          </a>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { authService } from '../../../services/auth.service';
import Button from '../../ui/Button';

export function AdminProtectedRoute({ children }) {
  const { isLoggedIn, adminUser, login } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. If logged in as admin -> grant access immediately!
  if (isLoggedIn && adminUser?.role === 'admin') {
    return children;
  }

  // 2. Direct Admin Authentication Form
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both admin email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.adminLogin(cleanEmail, cleanPassword);
      const payload = res?.data?.user ? res.data : (res?.user ? res : (res?.data || res));
      const user = payload?.user || payload;

      if (user?.role !== 'admin') {
        setError('Access denied: You must sign in with an authorized Administrator account.');
        return;
      }

      login(user, payload?.accessToken, payload?.refreshToken);
    } catch (err) {
      console.error('Admin Login Error:', err);
      const msg = err?.error || err?.response?.data?.message || err?.message || 'Invalid administrator credentials or server unavailable.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2.5rem 2rem', color: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#7c3aed', color: 'white', padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem' }}>
            🔒 PICKY ADMIN PORTAL
          </div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', margin: '0.2rem 0 0.4rem', fontWeight: 700 }}>Admin Sign In</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Authorized Administrator credentials required.
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
              placeholder="Enter admin email"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0f172a',
                border: '1.5px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.8rem 0.75rem 1rem',
                  background: '#0f172a',
                  border: '1.5px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" block size="lg" loading={loading} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
              Sign In to Dashboard ➔
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
          <a href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Customer Store
          </a>
        </div>
      </div>
    </div>
  );
}

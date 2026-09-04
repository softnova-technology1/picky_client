import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', paddingTop: '3.5rem', paddingBottom: '2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '1.4rem', color: 'white', marginBottom: '0.75rem' }}>
              <span style={{ background: 'var(--color-primary)', color: 'white', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>P</span>
              Picky
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Curated essentials, best prices, and lightning-fast WhatsApp order updates directly to your phone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Shop Picky</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <Link to="/products" style={{ transition: 'var(--transition)' }}>All Products</Link>
              <Link to="/categories" style={{ transition: 'var(--transition)' }}>Categories</Link>
              <Link to="/cart" style={{ transition: 'var(--transition)' }}>My Cart</Link>
              <Link to="/orders" style={{ transition: 'var(--transition)' }}>Track Orders</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact & Support</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
            </div>
          </div>

          {/* WhatsApp Support Info */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Instant Updates</h4>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Receive live shipment updates and AWB tracking instantly on WhatsApp.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', color: '#4ade80', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>💬</span> WhatsApp Verified
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          © {new Date().getFullYear()} Picky Inc. Single-Vendor E-Commerce Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

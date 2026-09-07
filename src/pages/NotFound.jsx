import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { Home, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <PageWrapper>
      <div
        className="section"
        style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          padding: '4rem 1rem',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
            borderRadius: '28px',
            boxShadow: '0 20px 50px rgba(124, 58, 237, 0.12)',
            border: '1px solid #e9d5ff',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(4.5rem, 9vw, 6.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#7c3aed',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} /> Page Not Found
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', color: '#0f172a', margin: '0 0 0.75rem' }}>
            Looking for something festive?
          </h2>

          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 auto 2rem', maxWidth: '420px' }}>
            We couldn&rsquo;t find the page you were looking for. It might have been moved, renamed, or is temporarily unavailable.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
              }}
            >
              <Home size={16} /> Return to Home
            </Link>

            <Link
              to="/products"
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
              }}
            >
              <ShoppingBag size={16} /> Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

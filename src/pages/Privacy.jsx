import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

export default function Privacy() {
  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Privacy Policy</h1>
          <div className="card" style={{ padding: '2.5rem', lineHeight: 1.8, color: '#475569' }}>
            <p style={{ marginBottom: '1rem' }}>
              Last updated: September 2026. At Picky, we value your privacy and are committed to protecting your personal information.
            </p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>1. Information We Collect</h4>
            <p>We collect your mobile phone number for OTP authentication and delivery notifications, along with your delivery address to fulfill orders.</p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>2. WhatsApp Communications</h4>
            <p>We only send transactional messages (OTP codes, order confirmations, AWB tracking numbers, and delivery updates) to your WhatsApp number.</p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>3. Data Protection</h4>
            <p>We do not sell, rent, or trade your personal information with third parties. All data is securely encrypted in transit and at rest.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

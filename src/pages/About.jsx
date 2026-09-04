import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

export default function About() {
  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>About Picky</h1>
          <div className="card" style={{ padding: '2.5rem', lineHeight: 1.8 }}>
            <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '1.5rem' }}>
              <strong>Picky</strong> was founded with a singular mission: eliminating the clutter and decision paralysis of endless low-quality e-commerce choices.
            </p>
            <h3 style={{ margin: '1.5rem 0 0.5rem', color: '#0f172a' }}>Our Philosophy</h3>
            <p style={{ color: '#475569', marginBottom: '1rem' }}>
              Instead of listing thousands of unvetted products from random third-party sellers, Picky operates as a <strong>curated single-vendor store</strong>. Every single product in our catalog is physically inspected, tested, and stored in our dedicated fulfillment center before it is listed online.
            </p>
            <h3 style={{ margin: '1.5rem 0 0.5rem', color: '#0f172a' }}>Real-Time Transparency</h3>
            <p style={{ color: '#475569', marginBottom: '1rem' }}>
              We know waiting for deliveries can be frustrating. That is why every Picky order triggers automatic live updates via WhatsApp — from dispatch with courier AWB tracking to real-time milestone delivery notifications.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

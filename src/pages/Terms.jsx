import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';

export default function Terms() {
  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Terms & Conditions</h1>
          <div className="card" style={{ padding: '2.5rem', lineHeight: 1.8, color: '#475569' }}>
            <p style={{ marginBottom: '1rem' }}>
              By accessing and shopping on Picky, you agree to the following terms:
            </p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>1. Ordering & Payment</h4>
            <p>All orders placed on Picky are confirmed with Cash on Delivery (COD). Customers agree to provide accurate delivery addresses and accept deliveries upon courier arrival.</p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>2. Shipping & Delivery</h4>
            <p>Orders are dispatched within 24-48 business hours. An AWB tracking number will be provided via WhatsApp as soon as your parcel is with our courier partner.</p>
            <h4 style={{ color: '#0f172a', margin: '1.25rem 0 0.25rem' }}>3. Coupon Usage</h4>
            <p>Promotional coupons are subject to minimum order requirements and valid expiration dates. Only one coupon code may be redeemed per order.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

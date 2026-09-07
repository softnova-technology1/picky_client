import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../ui/Toast';

export default function PageWrapper({ children, hideFooter = false }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <Navbar />
      <main style={{ flex: 1, background: '#ffffff' }}>{children}</main>
      {!hideFooter && <Footer />}
      <Toast />
    </div>
  );
}

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../ui/Toast';
import FloatingActions from '../common/FloatingActions';

export default function PageWrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <Navbar />
      <main style={{ flex: 1, background: '#ffffff' }}>{children}</main>
      <Footer />
      <FloatingActions />
      <Toast />
    </div>
  );
}

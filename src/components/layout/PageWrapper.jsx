import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../ui/Toast';

export default function PageWrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <Toast />
    </div>
  );
}

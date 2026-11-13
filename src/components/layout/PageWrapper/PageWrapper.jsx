import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FloatingActions from '../../common/FloatingActions';
import MobileBottomNav from '../MobileBottomNav';
import ErrorBoundary from '../../common/ErrorBoundary';
import styles from './PageWrapper.module.css';

export default function PageWrapper({ children, hideFooter = false }) {
  const location = useLocation();

  return (
    <div className={styles['page-wrapper-root']}>
      <Navbar />
      <main key={location.key || (location.pathname + location.search)} className={styles['page-wrapper-main']}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      {!hideFooter && <Footer />}
      <FloatingActions />
      <MobileBottomNav />
    </div>
  );
}

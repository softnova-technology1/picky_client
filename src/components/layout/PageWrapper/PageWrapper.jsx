import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Toast from '../../ui/Toast';
import FloatingActions from '../../common/FloatingActions';
import styles from './PageWrapper.module.css';

export default function PageWrapper({ children, hideFooter = false }) {
  const location = useLocation();

  return (
    <div className={styles['page-wrapper-root']}>
      <Navbar />
      <main key={location.key || (location.pathname + location.search)} className={styles['page-wrapper-main']}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <FloatingActions />
      <Toast />
    </div>
  );
}

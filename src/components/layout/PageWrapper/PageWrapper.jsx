import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Toast from '../../ui/Toast';
import FloatingActions from '../../common/FloatingActions';
import AnnouncementBar from '../../common/AnnouncementBar/AnnouncementBar';
import styles from './PageWrapper.module.css';

export default function PageWrapper({ children, hideFooter = false }) {
  return (
    <div className={styles['page-wrapper-root']}>
      <AnnouncementBar />
      <Navbar />
      <main className={styles['page-wrapper-main']}>{children}</main>
      {!hideFooter && <Footer />}
      <FloatingActions />
      <Toast />
    </div>
  );
}

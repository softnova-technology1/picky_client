import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import FloatingActions from '../../common/FloatingActions';
import MobileBottomNav from '../MobileBottomNav';
import { buildRevealRouteKey, useCircleRevealTransition } from '../../../hooks/useMobileCircleReveal';
import styles from './PageWrapper.module.css';

export default function PageWrapper({ children, hideFooter = false }) {
  const location = useLocation();
  const mainRef = useRef(null);
  const routeKey = buildRevealRouteKey(location);

  useCircleRevealTransition(mainRef, routeKey, styles['is-circle-revealing'], {
    skipSelector: '.picky-login-underlying-site',
  });

  return (
    <div className={styles['page-wrapper-root']}>
      <Navbar />
      <main
        ref={mainRef}
        key={location.key || (location.pathname + location.search)}
        className={styles['page-wrapper-main']}
      >
        {children}
      </main>
      {!hideFooter && <Footer />}
      <FloatingActions />
      <MobileBottomNav />
    </div>
  );
}

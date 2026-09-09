import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { Home, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className={`section ${styles['not-found-section']}`}>
        <div className={`card ${styles['not-found-card']}`}>
          <div className={styles['not-found-code']}>
            404
          </div>

          <div className={styles['not-found-badge']}>
            <Sparkles size={14} /> Page Not Found
          </div>

          <h2 className={styles['not-found-title']}>
            Looking for something festive?
          </h2>

          <p className={styles['not-found-desc']}>
            We couldn&rsquo;t find the page you were looking for. It might have been moved, renamed, or is temporarily unavailable.
          </p>

          <div className={styles['not-found-actions']}>
            <Link
              to="/"
              className={`btn btn-primary ${styles['action-btn']}`}
            >
              <Home size={16} /> Return to Home
            </Link>

            <Link
              to="/products"
              className={`btn btn-secondary ${styles['action-btn']}`}
            >
              <ShoppingBag size={16} /> Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className={styles['not-found-container']}>
        <div className={styles['image-section']}>
          <img 
            src="/images/404-illustration.jpg" 
            alt="Person searching in a box" 
            className={styles['illustration']} 
          />
        </div>
        
        <div className={styles['content-section']}>
          <h1 className={styles['error-code']}>404</h1>
          <h2 className={styles['error-title']}>Something's missing</h2>
          <p className={styles['error-desc']}>
            This page is missing or you assembled the link incorrectly.
          </p>
          
          <Link to="/" className={styles['back-link']}>
            <ArrowLeft size={18} strokeWidth={2.5} /> Go back to Home
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

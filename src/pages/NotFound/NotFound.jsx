import React from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft } from 'lucide-react';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className={styles['not-found-container']}>
        <div className={styles['lottie-container']}>
          <DotLottieReact
            src="/cat-404.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%', maxWidth: '750px', maxHeight: '550px' }}
          />
        </div>
        
        <h1 className={styles['error-title']}>Page Not Found</h1>
        
        <Link to="/" className={styles['back-link']}>
          <ArrowLeft size={18} strokeWidth={2.5} /> Go back to Home
        </Link>
      </div>
    </PageWrapper>
  );
}

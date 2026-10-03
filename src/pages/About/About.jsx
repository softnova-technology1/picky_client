import React from 'react';
import styles from './About.module.css';
import PageWrapper from '../../components/layout/PageWrapper';
import AboutHeroSection from './components/AboutHeroSection';
import AboutFeatureSection from './components/AboutFeatureSection';
import GlassCountersSection from './components/GlassCountersSection';
import BuyerProtectionSection from './components/BuyerProtectionSection';

export default function About() {
  return (
    <PageWrapper>
      {/* Full-Width Edge-to-Edge Hero Section */}
      <AboutHeroSection />

      <div className={styles['section']} style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className={styles['container']}>
          {/* About Us Feature Section */}
          <AboutFeatureSection />
        </div>
      </div>

      {/* Standalone Parallax Mission & Vision Section with background-attachment: fixed */}
      <section className={styles['about-parallax-mission-section']}>
        <div className={styles['about-parallax-mission-overlay']} />
        <div className={styles['about-parallax-mission-content']}>
          <div className={styles['about-parallax-glass-card']}>
            <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
              <span style={{ 
                display: 'inline-block',
                padding: '0.4rem 1.2rem', 
                borderRadius: '20px', 
                background: 'rgba(168, 85, 247, 0.25)', 
                border: '1px solid rgba(192, 132, 252, 0.4)',
                color: '#e9d5ff',
                fontWeight: '700',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.25rem'
              }}>
                ✦ OUR MISSION & VISION ✦
              </span>
              <h2 style={{ fontSize: '2.4rem', color: '#ffffff', marginBottom: '1.25rem', fontWeight: 800, lineHeight: 1.25 }}>
                Making Online Shopping <br />
                <span style={{ color: '#c084fc' }}>Simple & Trustworthy</span>
              </h2>
              <p style={{ fontSize: '1.15rem', color: '#f3e8ff', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                <strong style={{ color: '#ffffff' }}>Picky</strong> was created to make everyday online shopping easier, clearer, and more convenient. We bring carefully selected products together in one simple shopping experience.
              </p>
              <p style={{ fontSize: '1.05rem', color: '#e9d5ff', lineHeight: 1.7 }}>
                Our vision is to build a store where customers can discover useful products, shop with confidence, and enjoy a smooth experience from browsing to delivery.
              </p>
            </div>

            {/* 3D Purple Circular Glass Counters */}
            <GlassCountersSection />
          </div>
        </div>
      </section>

      {/* ── Final Section: Picky Buyer Protection Assurance ── */}
      <BuyerProtectionSection />
    </PageWrapper>
  );
}

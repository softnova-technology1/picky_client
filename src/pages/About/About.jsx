import React from 'react';
import styles from './About.module.css';
import '../../styles/home-premium.css';
import { ArrowRight } from 'lucide-react';
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

      {/* ── Final Community CTA Banner ── */}
      <section className="hp-final-cta-section" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div className="hp-final-cta-container">
          <div className="hp-final-cta-box">
            <span className="hp-final-cta-badge">✦ JOIN OUR COMMUNITY</span>
            <h2 className="hp-final-title">Connect With Us @picky.co.in</h2>
            <p className="hp-final-subtitle">
              Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.
            </p>
            <div className="hp-final-cta-btn-group no-hover-fx">
              <button
                type="button"
                className="hp-final-cta-btn no-hover-fx"
                onClick={() => window.open('https://www.instagram.com/picky.co.in/', '_blank', 'noopener,noreferrer')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>Follow on Instagram</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="hp-final-cta-outline-btn no-hover-fx"
                onClick={() => window.open('https://wa.me/918300295721?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.', '_blank', 'noopener,noreferrer')}
                aria-label="Join WhatsApp Group"
                title="Join WhatsApp Group"
              >
                <svg className="hp-cta-wa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </svg>
                <span className="hp-cta-wa-label">
                  <span>Join WhatsApp Group</span>
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

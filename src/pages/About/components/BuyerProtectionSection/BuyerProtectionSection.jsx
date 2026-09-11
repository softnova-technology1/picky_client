import React from 'react';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import styles from './BuyerProtectionSection.module.css';

export default function BuyerProtectionSection() {
  const trustPillars = [
    {
      step: '01',
      id: 'quality',
      icon: ShieldCheck,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#2563eb',
      iconBg: '#eff6ff',
      shadowColor: 'rgba(37, 99, 235, 0.32)',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: '100% Quality Tested',
      desc: 'Every item physically inspected at our Madurai hub before packaging and dispatch.',
      badge: 'Zero Defect Policy',
    },
    {
      step: '02',
      id: 'dispatch',
      icon: Truck,
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      color: '#0d9488',
      iconBg: '#f0fdfa',
      shadowColor: 'rgba(13, 148, 136, 0.32)',
      badgeBg: '#f0fdfa',
      badgeColor: '#0f766e',
      badgeBorder: '#99f6e4',
      title: '24-48h Express Dispatch',
      desc: 'Direct courier partners with instant SMS updates and live real-time AWB tracking to your doorstep.',
      badge: 'Live AWB Tracking',
    },
    {
      step: '03',
      id: 'replacement',
      icon: RefreshCw,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      color: '#7c3aed',
      iconBg: '#f5f3ff',
      shadowColor: 'rgba(124, 58, 237, 0.32)',
      badgeBg: '#f5f3ff',
      badgeColor: '#6d28d9',
      badgeBorder: '#ddd6fe',
      title: '7-Day Easy Replacement',
      desc: 'Zero-hassle instant replacement guarantee on any size mismatch, transit damage, or defect.',
      badge: 'Hassle-Free Return',
    },
    {
      step: '04',
      id: 'support',
      icon: Headphones,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      color: '#db2777',
      iconBg: '#fdf2f8',
      shadowColor: 'rgba(219, 39, 119, 0.32)',
      badgeBg: '#fdf2f8',
      badgeColor: '#9d174d',
      badgeBorder: '#fbcfe8',
      title: '24/7 Dedicated Support',
      desc: 'Instant WhatsApp chat and phone assistance with real friendly humans whenever you need help.',
      badge: 'Direct WhatsApp Help',
    },
  ];

  return (
    <section className={styles.protectionSection}>
      {/* Subtle Ambient Glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      <div className={styles.protectionContainer}>
        {/* ── Section Header ── */}
        <div className={styles.headerWrapper}>
          <div className={styles.trustBadgePill}>
            <Sparkles size={13} className={styles.trustBadgeIcon} />
            <span>Picky Buyer Assurance</span>
          </div>

          <h2 className={styles.mainTitle}>
            <span className={styles.titleGradient}>Picky Buyer Protection</span>
          </h2>

          <p className={styles.subTitle}>
            Our 4-step quality assurance guarantee for every single order dispatched from our Madurai hub.
          </p>

          {/* Decorative Diamond Ornament Divider */}
          <div className={styles.ornamentDivider}>
            <div className={styles.dividerLineLeft} />
            <span className={styles.dividerDiamonds}>✦ ❖ ✦</span>
            <div className={styles.dividerLineRight} />
          </div>
        </div>

        {/* ── Innovative 3D Infographic Cards Grid ── */}
        <div className={styles.infographicGrid}>
          {trustPillars.map((pillar) => {
            const IconComp = pillar.icon;

            return (
              <div key={pillar.id} className={styles.cardItem}>
                {/* 3D Offset Gradient Backplate */}
                <div
                  className={styles.cardBackplate}
                  style={{
                    background: pillar.gradient,
                    boxShadow: `0 16px 32px -8px ${pillar.shadowColor}`,
                  }}
                />

                {/* Foreground Card */}
                <div className={styles.frontCard}>
                  {/* Top Icon Pod */}
                  <div
                    className={styles.iconPod}
                    style={{
                      background: pillar.iconBg,
                      color: pillar.color,
                      border: `1.5px solid ${pillar.badgeBorder}`,
                      boxShadow: `0 8px 18px ${pillar.shadowColor}`,
                    }}
                  >
                    <IconComp size={28} strokeWidth={2.3} />
                  </div>

                  {/* Pillar Title */}
                  <h3 className={styles.cardTitle}>{pillar.title}</h3>

                  {/* Pillar Description */}
                  <p className={styles.cardDesc}>{pillar.desc}</p>

                  {/* Verified Badge Pill */}
                  <div
                    className={styles.badgePill}
                    style={{
                      background: pillar.badgeBg,
                      color: pillar.badgeColor,
                      border: `1px solid ${pillar.badgeBorder}`,
                    }}
                  >
                    <CheckCircle2 size={13} strokeWidth={2.8} />
                    <span>{pillar.badge}</span>
                  </div>

                  {/* Bottom Center Solid Step Disc */}
                  <div
                    className={styles.stepDisc}
                    style={{
                      background: pillar.gradient,
                      boxShadow: `0 8px 22px -4px ${pillar.shadowColor}`,
                    }}
                  >
                    <span>{pillar.step}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

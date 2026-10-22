import React from 'react';
import styles from '../../About.module.css';
import { BadgeCheck, ShoppingCart, ShieldCheck, Headphones } from 'lucide-react';
import { usePageCustomization } from '../../../../store/customizationStore';

export default function AboutHeroSection() {
  const { getSetting } = usePageCustomization('about_us');
  const badgeText = getSetting('about_hero', 'badgeText', 'About Picky');
  const headline = getSetting('about_hero', 'headline');
  const subtitle = getSetting('about_hero', 'subtitle', 'Discover thoughtfully selected products across fashion, lifestyle, home, and more.');

  const features = [
    {
      id: 'selected',
      icon: BadgeCheck,
      title: 'Carefully Selected Products',
    },
    {
      id: 'simple-shopping',
      icon: ShoppingCart,
      title: 'Simple Shopping Experience',
    },
    {
      id: 'secure-orders',
      icon: ShieldCheck,
      title: 'Secure & Reliable Orders',
    },
    {
      id: 'support',
      icon: Headphones,
      title: 'Customer Support',
    },
  ];

  return (
    <section className={styles['about-hero-wrapper']}>
      <div className={styles['about-hero-overlay']} />
      
      {/* Centered Main Hero Content */}
      <div className={styles['about-hero-content']}>
        <div className={styles['about-hero-pill-badge']}>
          {badgeText}
        </div>

        <h1 className={styles['about-hero-title']}>
          {headline ? (
            headline.includes('.') ? (
              <>
                {headline.split('.')[0]}. <span>{headline.split('.').slice(1).join('.')}</span>
              </>
            ) : (
              headline
            )
          ) : (
            <>
              Simple Shopping. <span>Trusted Products.</span>
            </>
          )}
        </h1>
        
        <p className={styles['about-hero-subtitle']}>
          {subtitle}
        </p>

        {/* Decorative Cyan Squiggly Wave Separator */}
        <div className={styles['about-hero-wave']}>
          <svg viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 2 10 Q 14 2, 26 10 T 50 10 T 74 10 T 98 10"
              stroke="#a855f7"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 4 Feature Items Grid with innovative shape & vertical dividers */}
        <div className={styles['about-hero-features']}>
          <div className={styles['about-hero-features-badge']}>
            ✦ Core Store Highlights ✦
          </div>
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <div className={styles['about-feature-item']} key={item.id}>
                <div className={styles['about-feature-icon-wrapper']}>
                  <IconComponent size={26} strokeWidth={2.2} />
                </div>
                <div className={styles['about-feature-title']}>
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

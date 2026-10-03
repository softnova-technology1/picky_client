import React from 'react';
import styles from '../../About.module.css';
import { Check } from 'lucide-react';

export default function AboutFeatureSection() {
  const checkItems = [
    { title: "Carefully Selected Products" },
    { title: "Clear Pricing & Simple Shopping" },
    { title: "Reliable Delivery & Customer Support" },
    { title: "Trusted Shopping Experience", subtitle: "Customer-first service" }
  ];

  return (
    <section className={styles['about-feature-block-wrapper']}>
      <div className={styles['about-feature-container']}>
        {/* Left Column: Innovative Border Radius Image Showcase */}
        <div className={styles['about-feature-image-col']}>
          <div className={styles['about-feature-image-backdrop']} />
          <div className={styles['about-feature-image-box']}>
            <img
              src="/images/about_showroom_featured.jpg"
              alt="Picky Luxury Showroom"
              className={styles['about-feature-img']}
            />
          </div>
        </div>

        {/* Right Column: Content matching image typography */}
        <div className={styles['about-feature-content-col']}>
          <span className={styles['about-feature-tag']}>ABOUT PICKY</span>

          <h2 className={styles['about-feature-main-heading']}>
            Simple Shopping. <br />
            <span className={styles['about-feature-heading-italic']}>Trusted Products.</span>
          </h2>

          <p className={styles['about-feature-lead']}>
            Everything you need, selected for everyday life.
          </p>

          <p className={styles['about-feature-description']}>
            Picky brings together thoughtfully selected products across fashion, jewellery, home & kitchen, lifestyle, and more — with a simple shopping experience from discovery to delivery.
          </p>

          <ul className={styles['about-feature-checklist']}>
            {checkItems.map((item, idx) => (
              <li key={idx} className={styles['about-feature-check-item']}>
                <span className={styles['check-icon-wrapper']}>
                  <Check size={16} strokeWidth={3} />
                </span>
                <div className={styles['check-text-group']}>
                  <span className={styles['check-text-content']}>{item.title}</span>
                  {item.subtitle && (
                    <span className={styles['check-subtext-content']}>{item.subtitle}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

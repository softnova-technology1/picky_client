import React from 'react';
import styles from '../../About.module.css';
import { Check } from 'lucide-react';

export default function AboutFeatureSection() {
  const checkItems = [
    "24 Month / 100% Quality Warranty & Inspection Guarantee",
    "Curabitur dapibus nisl a urna congue, in pharetra urna accumsan.",
    "Customer Rewards Program and excellent technology"
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
            {/* Innovative Floating Badge */}
            <div className={styles['about-feature-floating-badge']}>
              <div className={styles['badge-icon-circle']}>✓</div>
              <div className={styles['badge-text-group']}>
                <span className={styles['badge-main-text']}>100% Verified</span>
                <span className={styles['badge-sub-text']}>Single-Vendor Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content matching image typography */}
        <div className={styles['about-feature-content-col']}>
          <span className={styles['about-feature-tag']}>ABOUT US</span>

          <h2 className={styles['about-feature-main-heading']}>
            Most Safe & Rated Store <br />
            <span className={styles['about-feature-heading-italic']}>In India.</span>
          </h2>

          <p className={styles['about-feature-description']}>
            Morbi tortor urna, placerat vel arcu quis, fringilla egestas neque. Morbi sit amet porta
            erat, quis rutrum risus. Vivamus et gravida nibh, quis posuere felis. In commodo mi
            lectus, Integer ligula lorem, finibus vitae lorem vitae tincidunt dolor consequat quis.
          </p>

          <ul className={styles['about-feature-checklist']}>
            {checkItems.map((item, idx) => (
              <li key={idx} className={styles['about-feature-check-item']}>
                <span className={styles['check-icon-wrapper']}>
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className={styles['check-text-content']}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

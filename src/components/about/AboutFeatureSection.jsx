import React from 'react';
import { Check } from 'lucide-react';

export default function AboutFeatureSection() {
  const checkItems = [
    "24 Month / 100% Quality Warranty & Inspection Guarantee",
    "Curabitur dapibus nisl a urna congue, in pharetra urna accumsan.",
    "Customer Rewards Program and excellent technology"
  ];

  return (
    <section className="about-feature-block-wrapper">
      <div className="about-feature-container">
        {/* Left Column: Innovative Border Radius Image Showcase */}
        <div className="about-feature-image-col">
          <div className="about-feature-image-backdrop" />
          <div className="about-feature-image-box">
            <img
              src="/images/about_showroom_featured.jpg"
              alt="Picky Luxury Showroom"
              className="about-feature-img"
            />
            {/* Innovative Floating Badge */}
            <div className="about-feature-floating-badge">
              <div className="badge-icon-circle">✓</div>
              <div className="badge-text-group">
                <span className="badge-main-text">100% Verified</span>
                <span className="badge-sub-text">Single-Vendor Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content matching image typography */}
        <div className="about-feature-content-col">
          <span className="about-feature-tag">ABOUT US</span>

          <h2 className="about-feature-main-heading">
            Most Safe & Rated Store <br />
            <span className="about-feature-heading-italic">In India.</span>
          </h2>

          <p className="about-feature-description">
            Morbi tortor urna, placerat vel arcu quis, fringilla egestas neque. Morbi sit amet porta
            erat, quis rutrum risus. Vivamus et gravida nibh, quis posuere felis. In commodo mi
            lectus, Integer ligula lorem, finibus vitae lorem vitae tincidunt dolor consequat quis.
          </p>

          <ul className="about-feature-checklist">
            {checkItems.map((item, idx) => (
              <li key={idx} className="about-feature-check-item">
                <span className="check-icon-wrapper">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className="check-text-content">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

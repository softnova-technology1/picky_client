import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { usePageCustomization } from '../../../store/customizationStore';
import '../../../styles/bestseller_hero.css';

export default function BestSellersHeroSection() {
  const { getSetting } = usePageCustomization('best_sellers');
  const rawHeadline = getSetting('best_sellers_hero', 'headline', 'The best place to discover and shop for best sellers');
  const headline = rawHeadline === 'Most Loved South Indian Masterpieces' ? 'The best place to discover and shop for best sellers' : (rawHeadline || 'The best place to discover and shop for best sellers');
  const subheadline = getSetting(
    'best_sellers_hero',
    'subheadline',
    'Handpicked by thousands of happy homes across India and worldwide.'
  );
  const ctaText = getSetting('best_sellers_hero', 'ctaText', 'Get started');
  const titleColor = getSetting('best_sellers_hero', 'titleColor', getSetting('best_sellers_hero', 'textColor', '#111827'));
  const subtitleColor = getSetting('best_sellers_hero', 'subtitleColor', '#475569');
  const badgeText = getSetting(
    'best_sellers_hero',
    'badgeText',
    ''
  );
  const bgImage = getSetting('best_sellers_hero', 'bannerBgImage', getSetting('best_sellers_hero', 'bannerBgColor', ''));

  const scrollToGrid = () => {
    const el = document.getElementById('bestsellers-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatHeadline = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    if (lower.includes('discover') || lower.includes('shop')) {
      const parts = text.split(/(discover|shop)/gi);
      return parts.map((part, idx) => {
        const pLower = part.toLowerCase();
        if (pLower === 'discover') {
          return (
            <span key={idx} className="playful-script-purple">
              {part}
            </span>
          );
        }
        if (pLower === 'shop') {
          return (
            <span key={idx} className="playful-script-yellow">
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    }
    return text;
  };

  return (
    <section
      className="bestseller-playful-hero-wrapper"
      style={
        bgImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(248, 240, 255, 0.25) 100%), url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }
          : {}
      }
    >
      <div className="bestseller-playful-container">
        {/* Dynamic Headline Stack */}
        <div className="playful-title-stack">
          <h1 className="playful-title-line" style={{ color: titleColor }}>
            {formatHeadline(headline)}
          </h1>
        </div>

        {/* Dynamic Centered Subtitle */}
        {subheadline && (
          <p className="playful-subtitle" style={{ color: subtitleColor }}>
            {subheadline}
          </p>
        )}

        {/* Dynamic CTA Button */}
        <button type="button" className="playful-cta-pill" onClick={scrollToGrid}>
          <span>{ctaText}</span>
          <div className="playful-cta-arrow-circle">
            <ArrowUpRight size={18} />
          </div>
        </button>

        {/* Dynamic Hero Badge Pill with Pulsing Dot */}
        {badgeText && (
          <div className="bestsellers-hero-badge-pill">
            <span className="bestsellers-hero-badge-dot" />
            <span>{badgeText}</span>
          </div>
        )}
      </div>
    </section>
  );
}


import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { usePageCustomization } from '../../../store/customizationStore';
import '../../../styles/bestseller_hero.css';

export default function BestSellersHeroSection() {
  const { getSetting } = usePageCustomization('best_sellers');

  // Pull all content dynamically from Admin Customization / DB
  const rawHeadline = getSetting('best_sellers_hero', 'headline', '');
  const isDefaultOrStitch =
    !rawHeadline ||
    rawHeadline.trim() === 'Most Loved South Indian Masterpieces' ||
    rawHeadline.trim() === 'The best place to discover and shop for best sellers';

  const headline = isDefaultOrStitch
    ? 'The best place to discover and shop for best sellers'
    : rawHeadline;

  const subheadline = getSetting(
    'best_sellers_hero',
    'subheadline',
    'Handpicked by thousands of happy homes across India and worldwide.'
  );

  const rawBadge = getSetting('best_sellers_hero', 'badgeText', '');
  const badgeText =
    !rawBadge || rawBadge === 'TOP RATED & VERIFIED'
      ? 'Authentic Handloom, Brassware & Curated Daily Essentials'
      : rawBadge;

  const ctaText = getSetting('best_sellers_hero', 'ctaText', 'Get started');
  const titleColor =
    getSetting('best_sellers_hero', 'titleColor', '') ||
    getSetting('best_sellers_hero', 'textColor', '') ||
    '#111827';
  const subtitleColor = getSetting('best_sellers_hero', 'subtitleColor', '#475569');
  const bgImage = getSetting(
    'best_sellers_hero',
    'bannerBgImage',
    getSetting('best_sellers_hero', 'bannerBgColor', '/images/bestseller_category_bg.jpg')
  );

  const scrollToGrid = () => {
    const el = document.getElementById('bestsellers-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Format headline with discover (purple italic) and shop (amber italic) scripts and wave underlines
  const formatHeadline = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    if (lower.includes('discover') && lower.includes('shop')) {
      return (
        <>
          <span>The best place to</span>
          <br className="bestsellers-mobile-br" />
          {' '}
          <span className="playful-script-purple">
            discover
            <svg className="playful-purple-wave-underline" viewBox="0 0 160 20" fill="none">
              <path
                d="M 5 10 Q 30 2, 55 10 T 105 10 T 155 10"
                stroke="#c084fc"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="playful-normal-and"> and </span>
          <span className="playful-script-yellow">
            shop
            <svg className="playful-yellow-brush-underline" viewBox="0 0 140 20" fill="none">
              <path
                d="M 5 12 Q 45 4, 135 8"
                stroke="#f59e0b"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br className="bestsellers-mobile-br" />
          {' '}for best sellers
        </>
      );
    }
    return text;
  };

  return (
    <section
      className="bestseller-playful-hero-wrapper"
      style={
        bgImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(248, 240, 255, 0.48) 100%), url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      <div className="bestseller-playful-container">
        {/* Dynamic Headline Stack */}
        <div className="playful-title-stack">
          <h1
            className="playful-title-line"
            style={{ color: titleColor, whiteSpace: 'pre-line' }}
          >
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

        {/* Dynamic Heritage Trust Badge Pill */}
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
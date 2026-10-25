import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { useCategoryStore } from '../../../store/categoryStore';
import { usePageCustomization } from '../../../store/customizationStore';
import styles from './CategoryHeroCarousel.module.css';

// Curated pastel themes for each department card matching reference screenshot
const PASTEL_THEMES = [
  { bg: '#e4edf4', isLightBtn: false }, // 01 Electronics / Mobiles: Ice Slate
  { bg: '#e2ede6', isLightBtn: false }, // 02 Fashion: Soft Sage / Mint
  { bg: '#f1e5d7', isLightBtn: true },  // 03 Beauty & Care: Warm Sand / Cream
  { bg: '#eee6da', isLightBtn: true },  // 04 Home & Living: Warm Beige
  { bg: '#eae5f5', isLightBtn: false }, // 05 Jewellery: Lavender Lilac
  { bg: '#f6e7e1', isLightBtn: false }, // 06 Snacks & Foods: Warm Terracotta
  { bg: '#f4edd8', isLightBtn: true },  // 07 Traditional Tamil: Warm Gold
  { bg: '#e6eff6', isLightBtn: false }, // 08 Home Décor: Soft Sky
  { bg: '#fae8ea', isLightBtn: false }, // 09 Kids: Soft Rose
  { bg: '#e9efe3', isLightBtn: false }, // 10 Fitness: Soft Olive
];

// Helper to format headline text with newlines or smart breaks
const renderFormattedHeadline = (text) => {
  if (!text) return 'YOUR EVERYTHING STORE';
  if (text.includes('\n')) {
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  }
  const words = text.split(' ');
  if (words.length >= 2 && words.length <= 4) {
    return words.map((w, i, arr) => (
      <React.Fragment key={i}>
        {w}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  }
  return text;
};

// Helper to format subheadline
const renderFormattedSubheadline = (text) => {
  if (!text) return 'Shop Your Daily Essentials & More';
  if (text.includes('\n')) {
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  }
  return text;
};

// Fallback high-res editorial category photography if DB image is not yet uploaded by admin
const FALLBACK_CATEGORY_IMAGES = {
  'mobile-accessories': '/images/dept_electronics.jpg',
  'womens-fashion': '/images/dept_fashion.jpg',
  'fashion': '/images/dept_fashion.jpg',
  'beauty-personal-care': '/images/dept_beauty.jpg',
  'home-kitchen': '/images/dept_home.jpg',
  'artificial-jewellery': '/images/dept_jewellery.jpg',
  'snacks-foods': '/images/dept_snacks.jpg',
  'traditional-tamil-products': '/images/dept_traditional_tamil.jpg',
  'home-decor': '/images/dept_home_decor.jpg',
  'kids-products': '/images/dept_kids.jpg',
  'fitness-products': '/images/dept_fitness.jpg',
};

export default function CategoryHeroCarousel({ categories = [] }) {
  const navigate = useNavigate();
  const subcategories = useCategoryStore((state) => state.subcategories);
  const trackRef = useRef(null);

  // Read Live Customization settings for categories_hero
  const { getSetting } = usePageCustomization('categories');
  const headline = getSetting('categories_hero', 'headline', 'YOUR EVERYTHING STORE');
  const subheadline = getSetting('categories_hero', 'subheadline', 'Shop Your Daily Essentials & More');
  const startingPriceLabel = getSetting('categories_hero', 'startingPriceLabel', 'Starting From');
  const startingPrice = getSetting('categories_hero', 'startingPrice', '₹129');
  const buttonText = getSetting('categories_hero', 'buttonText', 'SHOP NOW');
  const buttonLink = getSetting('categories_hero', 'buttonLink', '/products');
  const heroImage = getSetting('categories_hero', 'heroImage', '/images/categories_hero_3d.png');
  const autoplaySpeed = Number(getSetting('categories_hero', 'autoplaySpeed', 4000)) || 3000;

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Ensure safe categories array from live DB
  const safeCategories = useMemo(() => {
    return Array.isArray(categories) && categories.length > 0 ? categories : [];
  }, [categories]);

  // Map subcategories for each category from real DB
  const categorySubtitles = useMemo(() => {
    const map = {};
    safeCategories.forEach((cat) => {
      const catSubs = (subcategories || [])
        .filter((s) => {
          const sCatId = s.categoryId?._id || s.categoryId;
          return sCatId === cat._id || s.categoryId?.slug === cat.slug;
        })
        .map((s) => s.name);

      if (catSubs.length > 0) {
        map[cat._id || cat.slug] = catSubs.slice(0, 3).join(', ');
      } else if (cat.description) {
        map[cat._id || cat.slug] = cat.description;
      } else if (cat.subtext) {
        map[cat._id || cat.slug] = cat.subtext;
      } else {
        map[cat._id || cat.slug] = 'Explore Collections';
      }
    });
    return map;
  }, [safeCategories, subcategories]);

  // Update scroll boundaries & active indicator on scroll
  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 230; // approximate card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(index, safeCategories.length - 1)));
  }, [safeCategories.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => track.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-play state: move cards automatically every 2 seconds
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 2 seconds with seamless loop
  useEffect(() => {
    if (isPaused || safeCategories.length <= 1) return;

    const timer = setInterval(() => {
      if (!trackRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      const isNearEnd = scrollLeft >= scrollWidth - clientWidth - 20;

      if (isNearEnd) {
        trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const firstCard = trackRef.current.querySelector(`.${styles.departmentCard}`);
        const cardStep = firstCard ? firstCard.offsetWidth + 19 : 250;
        trackRef.current.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, autoplaySpeed || 3000);

    return () => clearInterval(timer);
  }, [isPaused, safeCategories.length]);

  // Scroll actions
  const scroll = (direction) => {
    if (!trackRef.current) return;
    const firstCard = trackRef.current.querySelector(`.${styles.departmentCard}`);
    const step = firstCard ? firstCard.offsetWidth + 19 : 250;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (idx) => {
    if (!trackRef.current) return;
    const cardWidth = 230;
    trackRef.current.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth',
    });
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // See All smooth scroll handler
  const handleSeeAllClick = (e) => {
    e.preventDefault();
    const target = document.querySelector('.explore-more-categories-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/products');
    }
  };

  return (
    <div className={styles.heroWrapper}>
      {/* ── Top Header Navigation Bar (Arrows & See All) ── */}
      <div className={styles.topHeaderBar}>
        <div className={styles.navControls}>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            title="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next categories"
            title="Next"
          >
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSeeAllClick}
          className={styles.seeAllLink}
          aria-label="See all categories"
        >
          <span>See All ({Math.max(safeCategories.length, 10)}+)</span>
          <ArrowRight size={17} strokeWidth={2.4} />
        </button>
      </div>

      {/* ── Main Hero Layout Grid ── */}
      <div className={styles.heroGrid}>
        {/* ── 1. Left Card: Customizable "Everything Store" Banner ── */}
        <div className={styles.everythingCard}>
          <div className={styles.everythingContent}>
            {/* Dynamic Headline */}
            <h1 className={styles.heroHeading}>
              {renderFormattedHeadline(headline)}
            </h1>

            {/* Dynamic Subheading */}
            <p className={styles.heroSubheading}>
              {renderFormattedSubheadline(subheadline)}
            </p>

            {/* Dynamic Price Callout */}
            <div className={styles.featurePills}>
              <div className={styles.startingPricePill}>
                <span className={styles.startingLabel}>{startingPriceLabel}</span>
                <span className={styles.startingAmount}>{startingPrice}</span>
              </div>
            </div>

            {/* Dynamic Primary Action Button */}
            <Link to={buttonLink || '/products'} className={styles.shopNowBtn}>
              <span>{buttonText}</span>
              <ArrowUpRight size={18} strokeWidth={2.6} />
            </Link>
          </div>

          {/* 3D Composition Right Graphic */}
          <div className={styles.compositionVisual}>
            <img
              src={heroImage || '/images/categories_hero_3d.png'}
              alt={headline || 'Picky Everything Store'}
              className={styles.compositionImg}
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = '/images/categories_hero_3d.png';
              }}
            />
          </div>
        </div>

        {/* ── 2. Right Carousel Track: Department Cards ── */}
        <div
          className={styles.carouselSection}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className={styles.carouselTrackContainer}>
            <div
              ref={trackRef}
              className={`${styles.cardsTrack} ${isDragging ? styles.isDragging : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              {safeCategories.map((cat, idx) => {
                const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length];
                const subtitle =
                  categorySubtitles[cat._id || cat.slug] || 'Explore Collections';
                const imgSrc =
                  cat.image && cat.image.trim() !== ''
                    ? cat.image
                    : FALLBACK_CATEGORY_IMAGES[cat.slug] || '/images/dept_fashion.jpg';

                return (
                  <Link
                    key={cat._id || cat.slug || idx}
                    to={`/categories/${cat.slug}`}
                    className={styles.departmentCard}
                    style={{ background: theme.bg }}
                  >
                    {/* Top Info */}
                    <div className={styles.cardTopInfo}>
                      <h3 className={styles.cardTitle}>{cat.name}</h3>
                      <p className={styles.cardSubtitle} title={subtitle}>
                        {subtitle}
                      </p>
                    </div>

                    {/* Center Product Image */}
                    <div className={styles.cardImageContainer}>
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className={styles.cardImg}
                        loading="lazy"
                      />
                    </div>

                    {/* Bottom Info & CTA */}
                    <div className={styles.cardBottomInfo}>
                      <div className={styles.cardBottomTitle}>{cat.name}</div>
                      <div className={styles.cardBottomSub} title={subtitle}>
                        {subtitle}
                      </div>

                      <div
                        className={`${styles.exploreBtn} ${
                          theme.isLightBtn ? styles.exploreBtnLight : styles.exploreBtnDark
                        }`}
                      >
                        <span>Explore</span>
                        <ArrowUpRight size={15} strokeWidth={2.4} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Floating Next Button on Right Edge of Track */}
            {canScrollRight && (
              <button
                type="button"
                className={styles.floatingNextBtn}
                onClick={() => scroll('right')}
                aria-label="Scroll next"
                title="Next"
              >
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            )}
          </div>

          {/* ── Bottom Segmented Dots Tracker ── */}
          <div className={styles.dotsTracker}>
            {safeCategories.map((cat, idx) => (
              <button
                key={cat._id || cat.slug || idx}
                type="button"
                className={`${styles.dotIndicator} ${
                  activeIndex === idx ? styles.activeDot : ''
                }`}
                onClick={() => scrollToIndex(idx)}
                aria-label={`Jump to ${cat.name}`}
                title={cat.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

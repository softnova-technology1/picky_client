import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import styles from './Gallery.module.css';

export default function Gallery({
  images = [],
  productName = '',
  inWishlist = false,
  onToggleWishlist,
}) {
  const defaultImages =
    images && images.length > 0
      ? images
      : ['/images/about_showroom_featured.jpg'];

  const [selectedIdx, setSelectedIdx] = useState(0);

  const displayImages =
    images && images.length > 0
      ? images
      : ['/images/about_showroom_featured.jpg'];

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles['gallery-container']}>
      {/* Left Column: Clean Vertical Thumbnails for Up to 10+ Images */}
      <div
        className={styles['thumb-column']}
        style={{
          maxHeight: '560px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {displayImages.map((imgUrl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`${styles['thumb-item']} ${selectedIdx === idx ? styles['active'] : ''}`}
            title={`View image ${idx + 1}`}
          >
            <div className={styles['thumb-box']}>
              <img
                src={imgUrl}
                alt={`${productName || 'Product'} thumbnail ${idx + 1}`}
                className={styles['thumb-img']}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Center Main Hero Image Box */}
      <div className={styles['main-hero-column']}>
        <img
          src={displayImages[selectedIdx] || displayImages[0]}
          alt={productName || 'Product hero'}
          className={styles['main-hero-img']}
        />

        {/* Floating Wishlist Heart Button (Top-Right of Main Product Image) */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            className={`${styles['floating-wishlist-btn']} ${
              inWishlist ? styles['active-wishlist'] : ''
            }`}
            title={inWishlist ? 'Remove from saved' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              size={20}
              fill={inWishlist ? '#e11d48' : 'transparent'}
              color={inWishlist ? '#e11d48' : '#64748b'}
              strokeWidth={2.2}
            />
          </button>
        )}

        {/* Top-Left Active Image Index Pill */}
        {displayImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              letterSpacing: '0.05em',
              zIndex: 4,
            }}
          >
            {selectedIdx + 1} / {displayImages.length}
          </div>
        )}

        {/* Circular Arrow Navigation Controls */}
        {displayImages.length > 1 && (
          <div className={styles['arrow-nav-group']}>
            <button onClick={handlePrev} className={styles['arrow-btn']} title="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNext} className={styles['arrow-btn']} title="Next image">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

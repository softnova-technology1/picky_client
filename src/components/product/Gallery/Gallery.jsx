import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Gallery.module.css';

export default function Gallery({ images = [], productName = '' }) {
  const defaultImages =
    images && images.length > 0
      ? images
      : ['/images/about_showroom_featured.jpg'];

  const [selectedIdx, setSelectedIdx] = useState(0);

  // Labels for the 4 thumbnails
  const thumbMeta = [
    { num: '01', label: 'SILHOUETTE' },
    { num: '02', label: 'DETAIL' },
    { num: '03', label: 'CRAFT' },
    { num: '04', label: 'BACK VIEW' },
  ];

  // Ensure 4 thumbnail slots exist
  const displayImages = Array.from({ length: 4 }).map((_, i) => {
    return defaultImages[i % defaultImages.length];
  });

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles['gallery-container']}>
      {/* Left Column: Vertical Thumbnails with Numbers & Labels */}
      <div className={styles['thumb-column']}>
        {displayImages.map((imgUrl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`${styles['thumb-item']} ${selectedIdx === idx ? styles['active'] : ''}`}
          >
            <span className={styles['thumb-num']}>{thumbMeta[idx].num}</span>
            <span className={styles['thumb-label']}>{thumbMeta[idx].label}</span>
            <div className={styles['thumb-box']}>
              <img src={imgUrl} alt={`View ${idx + 1}`} className={styles['thumb-img']} />
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



        {/* Circular Arrow Navigation Controls */}
        <div className={styles['arrow-nav-group']}>
          <button onClick={handlePrev} className={styles['arrow-btn']} title="Previous image">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNext} className={styles['arrow-btn']} title="Next image">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

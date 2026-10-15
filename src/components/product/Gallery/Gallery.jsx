import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Search,
  Maximize2,
  X,
  Check
} from 'lucide-react';
import styles from './Gallery.module.css';

export default function Gallery({
  images = [],
  productName = '',
  inWishlist = false,
  onToggleWishlist,
}) {
  const displayImages =
    images && images.length > 0
      ? images
      : ['/images/about_showroom_featured.jpg'];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // ── Magnifier Lens Zoom State ──
  const [isLensActive, setIsLensActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, percentX: 0, percentY: 0, show: false });
  const [viewportDim, setViewportDim] = useState({ width: 500, height: 500 });
  const viewportRef = useRef(null);

  // Cancel lens zoom on Escape key
  useEffect(() => {
    if (!isLensActive) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLensActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLensActive]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setSelectedIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    } catch {
      // fallback
    }
  };

  // ── Lens Zoom Mouse Interaction Handlers ──
  const handleMouseMove = (e) => {
    if (!isLensActive || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));
    const percentX = (clampedX / rect.width) * 100;
    const percentY = (clampedY / rect.height) * 100;

    setViewportDim({ width: rect.width, height: rect.height });
    setLensPos({
      x: clampedX,
      y: clampedY,
      percentX,
      percentY,
      show: true,
    });
  };

  const handleMouseLeave = () => {
    setLensPos((prev) => ({ ...prev, show: false }));
  };

  const handleViewportClick = () => {
    if (isLensActive) return; // Prevent opening modal while actively inspecting with lens
    setIsLightboxOpen(true);
  };

  const toggleLens = (e) => {
    e.stopPropagation();
    setIsLensActive((prev) => !prev);
  };

  const currentImage = displayImages[selectedIdx] || displayImages[0];

  return (
    <>
      <div className={styles['gallery-card']}>
        {/* Top Header Bar: Clean Non-Overlapping Cancel Button on Left, Action Icons on Right */}
        <div className={styles['gallery-header-bar']}>
          {isLensActive ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLensActive(false);
              }}
              className={styles['exit-zoom-btn']}
              title="Click to cancel zoom"
            >
              <Search size={13} className={styles['pulse-search-icon']} />
              <span>Zoom Active • Cancel</span>
              <span className={styles['exit-zoom-x']}>✕</span>
            </button>
          ) : (
            <div />
          )}

          <div className={styles['gallery-header-actions']}>
            {onToggleWishlist && (
              <button
                type="button"
                onClick={onToggleWishlist}
                className={`${styles['circle-action-btn']} ${
                  inWishlist ? styles['active-wishlist'] : ''
                }`}
                title={inWishlist ? 'Remove from saved' : 'Save to wishlist'}
                aria-label="Wishlist"
              >
                <Heart
                  size={17}
                  fill={inWishlist ? '#e11d48' : 'transparent'}
                  color={inWishlist ? '#e11d48' : '#475569'}
                  strokeWidth={2}
                />
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className={styles['circle-action-btn']}
              title={copiedShare ? 'Link copied!' : 'Share product'}
              aria-label="Share"
            >
              {copiedShare ? (
                <Check size={16} color="#16a34a" strokeWidth={2.5} />
              ) : (
                <Share2 size={16} color="#475569" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Center Main Product Image Viewport */}
        <div
          ref={viewportRef}
          className={`${styles['main-image-viewport']} ${
            isLensActive ? styles['lens-active-mode'] : ''
          }`}
          onClick={handleViewportClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          title={isLensActive ? 'Move cursor over product to inspect with lens' : 'Click to view full size'}
        >
          <img
            src={currentImage}
            alt={productName || 'Product hero'}
            className={styles['main-img']}
          />

          {/* Interactive Magnifying Loupe Lens */}
          {isLensActive && lensPos.show && (
            <div
              className={styles['zoom-lens']}
              style={{
                left: `${lensPos.x}px`,
                top: `${lensPos.y}px`,
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${lensPos.percentX}% ${lensPos.percentY}%`,
                backgroundSize: `${viewportDim.width * 2.8}px ${viewportDim.height * 2.8}px`,
              }}
            >
              <div className={styles['zoom-lens-crosshair']} />
              <span className={styles['zoom-lens-badge']}>2.8x</span>
            </div>
          )}

          {/* Floating Image Counter Pill (Bottom Center: e.g. 1/5) */}
          <div className={styles['floating-counter-pill']}>
            {selectedIdx + 1}/{displayImages.length}
          </div>

          {/* Floating Zoom & Fullscreen Buttons (Bottom Right) */}
          <div className={styles['floating-tools-group']}>
            <button
              type="button"
              onClick={toggleLens}
              className={`${styles['tool-circle-btn']} ${
                isLensActive ? styles['tool-circle-btn-active'] : ''
              }`}
              title={isLensActive ? 'Turn off Lens Zoom' : 'Activate Magnifier Lens Zoom'}
            >
              <Search
                size={15}
                color={isLensActive ? '#ffffff' : '#334155'}
                strokeWidth={2.4}
              />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className={styles['tool-circle-btn']}
              title="Fullscreen view"
            >
              <Maximize2 size={15} color="#334155" strokeWidth={2.2} />
            </button>
          </div>

          {/* Left/Right Arrow Navigation (Visible when multiple images) */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className={`${styles['nav-arrow-btn']} ${styles['nav-arrow-left']}`}
                title="Previous image"
              >
                <ChevronLeft size={18} color="#0f172a" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`${styles['nav-arrow-btn']} ${styles['nav-arrow-right']}`}
                title="Next image"
              >
                <ChevronRight size={18} color="#0f172a" strokeWidth={2.4} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Horizontal Thumbnails Row */}
        <div className={styles['thumbnails-row']}>
          {displayImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`${styles['thumb-card']} ${
                selectedIdx === idx ? styles['active-thumb'] : ''
              }`}
              title={`View angle ${idx + 1}`}
            >
              <img
                src={imgUrl}
                alt={`${productName || 'Product'} thumbnail ${idx + 1}`}
                className={styles['thumb-img']}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox Fullscreen Modal ── */}
      {isLightboxOpen && (
        <div
          className={styles['lightbox-overlay']}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className={styles['lightbox-close-btn']}
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            title="Close modal"
          >
            <X size={22} color="#0f172a" strokeWidth={2.5} />
          </button>

          <div
            className={styles['lightbox-content']}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayImages[selectedIdx] || displayImages[0]}
              alt={productName || 'Fullscreen view'}
              className={styles['lightbox-img']}
            />

            {displayImages.length > 1 && (
              <div className={styles['lightbox-nav-row']}>
                <button
                  type="button"
                  onClick={handlePrev}
                  className={styles['lightbox-nav-btn']}
                >
                  <ChevronLeft size={22} color="#0f172a" />
                </button>
                <span className={styles['lightbox-counter']}>
                  {selectedIdx + 1} / {displayImages.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className={styles['lightbox-nav-btn']}
                >
                  <ChevronRight size={22} color="#0f172a" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import styles from './ProductVariantSelector.module.css';
import { Ruler, Droplets, Zap, Link2, Scale } from 'lucide-react';

/**
 * ProductVariantSelector
 * Renders the correct UI widget per product category variant type.
 *
 * variants.type options:
 *   'clothing-size' | 'free-size' | 'weight' | 'volume' |
 *   'resistance' | 'bangle-size' | 'cable-length' | 'none'
 */
export default function ProductVariantSelector({ variants, selected, onChange, product }) {
  if (!variants || variants.type === 'none' || !variants.type) return null;

  const { type, options = [], note } = variants;

  /* FREE SIZE — Sarees, Dupattas, Sungudi Sarees */
  if (type === 'free-size') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Ruler size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SIZE</span>
        </div>
        <div className={styles['free-size-tag']}>
          <span className={styles['free-size-pill']}>
            <span className={styles['free-size-badge']}>Free Size</span>
            {note && <span className={styles['free-size-note']}>{note}</span>}
          </span>
        </div>
      </div>
    );
  }

  /* CLOTHING SIZE — Kurtis, Tops, T-Shirts */
  if (type === 'clothing-size') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Ruler size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT SIZE</span>
        </div>
        <div className={styles['pill-grid']}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[styles['size-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className={styles['size-hint']}>Standard Indian sizing applies.</p>
      </div>
    );
  }

  /* WEIGHT — Snacks & Foods */
  if (type === 'weight') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Scale size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT PACK SIZE</span>
        </div>
        <div className={styles['pill-grid']}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[styles['weight-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* VOLUME — Beauty Oils, Fitness Bottles */
  if (type === 'volume') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Droplets size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT SIZE</span>
        </div>
        <div className={styles['pill-grid']}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[styles['volume-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* RESISTANCE — Fitness Resistance Bands */
  if (type === 'resistance') {
    const resistanceMeta = {
      'Light':    { sub: '10-15 lbs' },
      'Medium':   { sub: '20-30 lbs' },
      'Heavy':    { sub: '35-45 lbs' },
      'Set of 3': { sub: 'All levels' },
    };
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Zap size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT RESISTANCE</span>
        </div>
        <div className={styles['resistance-grid']}>
          {options.map((opt) => {
            const meta = resistanceMeta[opt] || {};
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={[styles['resistance-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
                aria-pressed={selected === opt}
              >
                <span className={styles['resistance-name']}>{opt}</span>
                {meta.sub && <span className={styles['resistance-sub']}>{meta.sub}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* BANGLE SIZE — Artificial Jewellery (Bangles sub-category) */
  if (type === 'bangle-size') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Ruler size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT BANGLE SIZE</span>
        </div>
        <div className={styles['pill-grid']}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[styles['size-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className={styles['size-hint']}>
          Measure wrist circumference in cm to find your size.
        </p>
      </div>
    );
  }

  /* CABLE LENGTH — Mobile Accessories (Cables) */
  if (type === 'cable-length') {
    return (
      <div className={styles['variant-section']}>
        <div className={styles['variant-label-row']}>
          <Link2 size={14} className={styles['variant-icon']} />
          <span className={styles['variant-label']}>SELECT LENGTH</span>
        </div>
        <div className={styles['pill-grid']}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[styles['weight-pill'], selected === opt ? styles['selected'] : ''].filter(Boolean).join(' ')}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

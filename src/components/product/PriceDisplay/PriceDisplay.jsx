import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './PriceDisplay.module.css';

export default function PriceDisplay({ price, discountPrice, size = 'md' }) {
  const hasDiscount = discountPrice && discountPrice < price;
  const percentageOff = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const currentSizeClass = size === 'lg' ? styles['price-lg'] : size === 'sm' ? styles['price-sm'] : styles['price-md'];
  const origSizeClass = size === 'lg' ? styles['orig-lg'] : styles['orig-default'];

  return (
    <div className={styles['price-row']}>
      <span className={`price-current ${currentSizeClass}`}>
        {formatPrice(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <>
          <span className={`price-original ${origSizeClass}`}>
            {formatPrice(price)}
          </span>
          <span className="price-discount-tag">
            {percentageOff}% OFF
          </span>
        </>
      )}
    </div>
  );
}

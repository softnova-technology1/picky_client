import React from 'react';
import { formatPrice } from '../../utils/formatPrice';

export default function PriceDisplay({ price, discountPrice, size = 'md' }) {
  const hasDiscount = discountPrice && discountPrice < price;
  const percentageOff = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span className="price-current" style={{ fontSize: size === 'lg' ? '1.75rem' : size === 'sm' ? '1rem' : '1.25rem' }}>
        {formatPrice(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <>
          <span className="price-original" style={{ fontSize: size === 'lg' ? '1.1rem' : '0.88rem' }}>
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

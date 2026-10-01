import React from 'react';
import styles from './CategoryBadges.module.css';
import { Baby, ShieldCheck, MapPin } from 'lucide-react';

/* Kids Age + Safety Badge — shown prominently near product title */
export function KidsBadge({ characteristics }) {
  if (!characteristics) return null;
  const ageSpec = characteristics.find((c) => c.key === 'Age Group');
  const safetySpec = characteristics.find((c) => c.key === 'Safety');
  if (!ageSpec && !safetySpec) return null;
  return (
    <div className={styles['kids-badge-row']}>
      {ageSpec && (
        <div className={styles['age-badge']}>
          <Baby size={16} />
          <div>
            <span className={styles['badge-eyebrow']}>Recommended Age</span>
            <span className={styles['badge-value']}>{ageSpec.value}</span>
          </div>
        </div>
      )}
      {safetySpec && (
        <div className={styles['safety-badge']}>
          <ShieldCheck size={15} />
          <span>{safetySpec.value}</span>
        </div>
      )}
    </div>
  );
}

/* Artisan Heritage Card — Traditional Tamil Products */
export function ArtisanCard({ artisanInfo }) {
  if (!artisanInfo) return null;
  return (
    <div className={styles['artisan-card']}>
      <div className={styles['artisan-header']}>
        <span className={styles['artisan-icon']}>🏺</span>
        <div>
          <span className={styles['artisan-eyebrow']}>Artisan Heritage</span>
          <span className={styles['artisan-craft']}>{artisanInfo.craft}</span>
        </div>
      </div>
      <div className={styles['artisan-detail']}>
        <MapPin size={12} />
        <span>{artisanInfo.region}</span>
        {artisanInfo.guild && (
          <span className={styles['artisan-guild']}>&middot; {artisanInfo.guild}</span>
        )}
      </div>
    </div>
  );
}

/* Food Safety Badges — Snacks & Foods: Dietary + Oil Used */
export function FoodBadges({ characteristics }) {
  if (!characteristics) return null;
  const dietary = characteristics.find((c) => c.key === 'Dietary');
  const oil = characteristics.find((c) => c.key === 'Oil Used');
  if (!dietary && !oil) return null;
  return (
    <div className={styles['food-badges-row']}>
      {dietary &&
        dietary.value.split('.').map((tag, i) => (
          <span key={i} className={styles['food-badge-pill']}>
            {tag.trim()}
          </span>
        ))}
      {oil && <span className={styles['oil-badge-pill']}>{oil.value}</span>}
    </div>
  );
}

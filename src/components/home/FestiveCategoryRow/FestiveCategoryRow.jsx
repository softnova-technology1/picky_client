import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../../data';
import { ArrowRight } from 'lucide-react';
import styles from './FestiveCategoryRow.module.css';

const BUTTON_COLORS = {
  sparklers: '#7c3aed',
  fountains: '#6d28d9',
  'aerial-shots': '#581c87',
  'combo-packs': '#9333ea',
  'ground-spinners': '#4c1d95',
  'novelty-items': '#86198f',
};

export default function FestiveCategoryRow() {
  const categoryList = categories || [];

  return (
    <section className={`festive-category-section ${styles['festive-section']}`}>
      <div className="container">
        {/* Category Row Container */}
        <div className={styles['festive-grid']}>
          {categoryList.map((cat) => {
            const btnColor = BUTTON_COLORS[cat.slug] || '#7c3aed';

            return (
              <Link
                key={cat._id || cat.slug}
                to={`/categories/${cat.slug}`}
                className={styles['festive-cat-card']}
              >
                {/* Slanted / Rounded Image Container */}
                <div className={styles['img-wrapper']}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles['festive-cat-img']}
                  />
                  {/* Subtle Inner Glow Overlay */}
                  <div className={styles['glow-overlay']} />
                </div>

                {/* Bottom Pill Label & Action Button */}
                <div className={styles['card-footer']}>
                  <span className={styles['cat-name']}>
                    {cat.name}
                  </span>

                  {/* Circular Arrow Button */}
                  <div
                    style={{ backgroundColor: btnColor }}
                    className={styles['festive-arrow-btn']}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

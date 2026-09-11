import React from 'react';
import { Star } from 'lucide-react';
import styles from '../../About.module.css';
import { REVIEWS_DATA } from '../../../../data/reviewsData';

export default function AboutReviewsSection() {
  // Select 4 rich Indian customer reviews from centralized dataset
  const testimonials = [
    {
      id: REVIEWS_DATA[0].id,
      name: `${REVIEWS_DATA[0].name} (${REVIEWS_DATA[0].city.split(',')[0]})`,
      rating: 5,
      quote: REVIEWS_DATA[0].comment,
      avatar: REVIEWS_DATA[0].avatar,
      avatarPosition: 'left',
    },
    {
      id: REVIEWS_DATA[2].id,
      name: `${REVIEWS_DATA[2].name} (${REVIEWS_DATA[2].city.split(',')[0]})`,
      rating: 5,
      quote: REVIEWS_DATA[2].comment,
      avatar: REVIEWS_DATA[2].avatar,
      avatarPosition: 'right',
    },
    {
      id: REVIEWS_DATA[1].id,
      name: `${REVIEWS_DATA[1].name} (${REVIEWS_DATA[1].city.split(',')[0]})`,
      rating: 5,
      quote: REVIEWS_DATA[1].comment,
      avatar: REVIEWS_DATA[1].avatar,
      avatarPosition: 'left',
    },
    {
      id: REVIEWS_DATA[3].id,
      name: `${REVIEWS_DATA[3].name} (${REVIEWS_DATA[3].city.split(',')[0]})`,
      rating: 5,
      quote: REVIEWS_DATA[3].comment,
      avatar: REVIEWS_DATA[3].avatar,
      avatarPosition: 'right',
    },
  ];

  return (
    <section className={styles['testimony-section-wrapper']}>
      {/* Background Leaf Shadow Watermarks */}
      <div className={styles['testimony-leaf-shadow-top']} />
      <div className={styles['testimony-leaf-shadow-bottom']} />

      {/* Header matching image typography */}
      <div className={styles['testimony-header']}>
        <h2 className={styles['testimony-main-title']}>Testimony</h2>
        <div className={styles['testimony-author-credit']}>- Picky Customer Stories</div>
      </div>

      {/* Vertical Alternating Testimonial List matching exact image structure */}
      <div className={styles['testimony-cards-container']}>
        {testimonials.map((item) => (
          <div
            className={`testimony-card-box testimony-align-${item.avatarPosition}`}
            key={item.id}
          >
            {/* Floating Circular Avatar overlapping card edge */}
            <div className={`testimony-floating-avatar avatar-${item.avatarPosition}`}>
              <img src={item.avatar} alt={item.name} />
            </div>

            {/* Content Inside Card */}
            <div className={styles['testimony-card-content']}>
              <h3 className={styles['testimony-user-name']}>{item.name}</h3>

              <div className={styles['testimony-stars']}>
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>

              <p className={styles['testimony-text']}>{item.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

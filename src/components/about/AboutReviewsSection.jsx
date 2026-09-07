import React from 'react';
import { Star } from 'lucide-react';
import '../../styles/about.css';

export default function AboutReviewsSection() {
  const testimonials = [
    {
      id: 'test-1',
      name: 'Saanchi Singhvi',
      rating: 5,
      quote:
        'You welcomed my shy daughter into your classroom with such warmth. Thanks to your gentle guidance, she\'s now making friends, speaking up, and loving school every day.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      avatarPosition: 'left',
    },
    {
      id: 'test-2',
      name: 'Ansh Suvarna',
      rating: 5,
      quote:
        'Our son cried a little on his first day, but soon he was thriving—he loves school. Your dedication truly sets the tone for his love of learning.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      avatarPosition: 'right',
    },
    {
      id: 'test-3',
      name: 'Adyan Shoeb',
      rating: 5,
      quote:
        'Our child has blossomed in your Pre-KG class—her drawings are now vibrant and detailed, he confidently writes his name and simple words, and excitedly narrates his creations at home. Thank you for nurturing her creativity and expression',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      avatarPosition: 'left',
    },
    {
      id: 'test-4',
      name: 'Vinayak Sivagurunathan',
      rating: 5,
      quote:
        'Our son has started loving numbers and developed interest in Mathematics due to your positive reinforcement and encouragement.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      avatarPosition: 'right',
    },
  ];

  return (
    <section className="testimony-section-wrapper">
      {/* Background Leaf Shadow Watermarks */}
      <div className="testimony-leaf-shadow-top" />
      <div className="testimony-leaf-shadow-bottom" />

      {/* Header matching image typography */}
      <div className="testimony-header">
        <h2 className="testimony-main-title">Testimony</h2>
        <div className="testimony-author-credit">- Picky Customer Stories</div>
      </div>

      {/* Vertical Alternating Testimonial List matching exact image structure */}
      <div className="testimony-cards-container">
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
            <div className="testimony-card-content">
              <h3 className="testimony-user-name">{item.name}</h3>

              <div className="testimony-stars">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>

              <p className="testimony-text">{item.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

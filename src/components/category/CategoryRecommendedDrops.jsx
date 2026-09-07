import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Award } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { MOCK_PRODUCTS } from '../../data/adminMockData';

export default function CategoryRecommendedDrops() {
  // 4 handpicked, highest-rated customer favorites across departments
  const recommendedSlugs = [
    'authentic-manapparai-crispy-rice-murukku-500g',
    'embroidered-rayon-anarkali-kurti-pant-set',
    'traditional-kemp-pearl-bell-jhumka-earrings',
    'boompulse-360-portable-wireless-bluetooth-speaker',
  ];

  const recommendedProducts = recommendedSlugs
    .map((slug) => MOCK_PRODUCTS.find((p) => p.slug === slug))
    .filter(Boolean);

  // Fallback to next 4 products if slugs don't match
  const displayProducts =
    recommendedProducts.length === 4 ? recommendedProducts : MOCK_PRODUCTS.slice(4, 8);

  return (
    <section className="category-recommended-drops-section" style={{ marginBottom: '4.5rem' }}>
      {/* ── Section Header (Centered) ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#1e1b4b',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.025em',
          }}
        >
          Most Recommended Products
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748b',
            margin: '0 0 0.85rem',
            fontWeight: 500,
          }}
        >
          Handpicked customer favorites with 4.8+ ratings & verified reviews
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #34d399)' }} />
          <span style={{ color: '#059669', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #34d399, transparent)' }} />
        </div>
      </div>

      {/* ── 4 Cards in 1 Row (Lumina Product Cards) ── */}
      <div
        className="category-recommended-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {displayProducts.map((prod, idx) => (
          <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
        ))}
      </div>

      {/* Centered View Best Rated CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          to="/best-sellers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.6rem',
            borderRadius: '9999px',
            background: '#ffffff',
            color: '#059669',
            fontWeight: 800,
            fontSize: '0.84rem',
            textDecoration: 'none',
            border: '1.5px solid #d1fae5',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)',
            transition: 'all 0.2s ease',
          }}
          className="recommended-view-all-link"
        >
          <span>View All Recommended</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <style>{`
        .recommended-view-all-link:hover {
          background: #059669 !important;
          color: #ffffff !important;
          border-color: #059669 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.28) !important;
        }
        @media (max-width: 1100px) {
          .category-recommended-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 600px) {
          .category-recommended-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </section>
  );
}

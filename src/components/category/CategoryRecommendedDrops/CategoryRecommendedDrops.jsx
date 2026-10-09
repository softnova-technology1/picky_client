import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Award } from 'lucide-react';
import ProductCard from '../../product/ProductCard';
import { productService } from '../../../services/product.service';

export default function CategoryRecommendedDrops() {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top 10 recommended products (or fallback to latest 10)
    productService.list({ limit: 10, sort: '-rating' })
      .then((res) => {
        setDisplayProducts(res.data || []);
      })
      .catch((err) => console.error('Failed to load recommended drops', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="category-recommended-drops-section" style={{ marginBottom: '4.5rem' }}>
      {/* ── Section Header (Centered) ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.32rem 0.95rem',
            borderRadius: '9999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.85rem',
          }}
        >
          <Award size={13} />
          <span>Customer Choice • 10 Verified Favorites</span>
        </div>

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
          Top customer favorites with 4.8+ ratings & verified reviews across 10 departments
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #34d399)' }} />
          <span style={{ color: '#059669', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #34d399, transparent)' }} />
        </div>
      </div>

      {/* ── 10 Cards in 2 Rows (5 columns × 2 rows on desktop) ── */}
      <div
        className="category-recommended-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>Loading recommended products...</div>
        ) : displayProducts.length > 0 ? (
          displayProducts.map((prod, idx) => (
            <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No recommended products found.
          </div>
        )}
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
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .category-recommended-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
}

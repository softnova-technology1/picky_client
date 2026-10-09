import React from 'react';
import ProductCard from '.././ProductCard';
import { ShoppingCart } from 'lucide-react';

export default function ProductGrid({ products = [], loading = false }) {
  if (loading) {
    return (
      <div className="product-grid-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div
            key={n}
            className="card"
            style={{
              height: '340px',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'pulse 1.5s infinite',
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#7c3aed' }}>
          <ShoppingCart size={32} />
        </div>
        <h3>No products found</h3>
        <p style={{ color: '#64748b' }}>Try searching with a different term or browse categories.</p>
      </div>
    );
  }

  return (
    <div className="product-grid-5">
      {products.map((product, idx) => (
        <ProductCard key={`${product._id || product.id || 'prod'}-${idx}`} product={product} />
      ))}
    </div>
  );
}

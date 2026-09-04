import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  if (!category) return null;
  const imageSrc = category.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500';

  return (
    <Link
      to={`/categories/${category.slug}`}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '1.5rem',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
      }}
      className="card-hover"
    >
      <img
        src={imageSrc}
        alt={category.name}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
          zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, color: 'white' }}>
        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.2rem' }}>{category.name}</h3>
        {category.description && (
          <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0 }}>{category.description}</p>
        )}
      </div>
    </Link>
  );
}

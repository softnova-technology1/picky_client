import React, { useEffect, useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CategoryCard from '../components/product/CategoryCard';
import Spinner from '../components/ui/Spinner';
import { categoryService } from '../services/category.service';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await categoryService.list();
        setCategories(res?.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore Everything
            </span>
            <h1 style={{ marginTop: '0.25rem' }}>All Categories</h1>
            <p>Browse our handpicked catalogue organized by department.</p>
          </div>

          {loading ? (
            <Spinner size={40} />
          ) : (
            <div className="grid-3">
              {categories.map((cat) => (
                <CategoryCard key={cat._id || cat.slug} category={cat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

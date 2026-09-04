import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProductGrid from '../components/product/ProductGrid';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';

export default function CategoryProducts() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const catRes = await categoryService.getBySlug(slug);
        const catData = catRes?.data || catRes;
        setCategory(catData);

        if (catData?._id) {
          const prodRes = await productService.list({ category: catData._id, sort });
          setProducts(prodRes?.data?.data || prodRes?.data || []);
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, sort]);

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            <Link to="/">Home</Link> ➔ <Link to="/categories">Categories</Link> ➔ <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{category?.name || slug}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{category?.name || 'Category'}</h1>
              {category?.description && <p style={{ margin: 0 }}>{category.description}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>Sort By:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 1rem' }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  );
}

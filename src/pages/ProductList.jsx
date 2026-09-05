import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProductGrid from '../components/product/ProductGrid';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { getProducts, categories as defaultCategories } from '../data';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState(() => getProducts({ category: selectedCategory, sort }));
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoryService.list();
        const items = res?.data || res;
        if (Array.isArray(items) && items.length > 0) {
          setCategories(items);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const params = { sort };
        if (selectedCategory) params.category = selectedCategory;
        const res = await productService.list(params);
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items)) {
          setProducts(items);
        }
      } catch (err) {
        console.error(err);
        setProducts(getProducts({ category: selectedCategory, sort }));
      }
    }
    load();
  }, [selectedCategory, sort]);


  const handleCategoryChange = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (catId) next.set('category', catId);
    else next.delete('category');
    setSearchParams(next);
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    setSearchParams(next);
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>All Products</h1>
              <p>Explore all available items in the Picky store.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
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

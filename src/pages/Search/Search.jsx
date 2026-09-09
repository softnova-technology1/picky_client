import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import { productService } from '../../services/product.service';
import { searchProducts } from '../../data';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState(() => (query ? searchProducts(query) : []));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    async function doSearch() {
      try {
        const res = await productService.search(query);
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items)) {
          setProducts(items);
        }
      } catch (err) {
        console.error('Search error:', err);
        setProducts(searchProducts(query));
      }
    }
    doSearch();
  }, [query]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto 3rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Search Store</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products by keyword..."
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                Search
              </button>
            </form>
          </div>

          {query && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '1rem' }}>
                Showing search results for: <strong style={{ color: 'var(--color-primary)' }}>"{query}"</strong> ({products.length} items)
              </p>
            </div>
          )}

          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  );
}

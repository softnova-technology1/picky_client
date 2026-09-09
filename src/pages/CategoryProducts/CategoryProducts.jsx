import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { getCategoryBySlug, getSubcategoryBySlug, getProducts } from '../../data';
import { ChevronRight, Sparkles, FolderTree, ArrowLeft } from 'lucide-react';

export default function CategoryProducts() {
  const { slug, subSlug } = useParams();
  const [sort, setSort] = useState('newest');

  const [category, setCategory] = useState(() => getCategoryBySlug(slug));
  const [subCategory, setSubCategory] = useState(() => (subSlug ? getSubcategoryBySlug(slug, subSlug) : null));
  const [products, setProducts] = useState(() => {
    const cat = getCategoryBySlug(slug);
    const sub = subSlug ? getSubcategoryBySlug(slug, subSlug) : null;
    return getProducts({
      category: cat?._id || slug,
      subCategory: sub?._id || subSlug,
      sort: 'newest',
    });
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await categoryService.getBySlug(slug);
        const catData = catRes?.data || catRes;
        if (catData) setCategory(catData);

        if (subSlug) {
          const foundSub = getSubcategoryBySlug(slug, subSlug);
          if (foundSub) setSubCategory(foundSub);
        } else {
          setSubCategory(null);
        }

        const catId = catData?._id || slug;
        const subId = subSlug ? (getSubcategoryBySlug(slug, subSlug)?._id || subSlug) : undefined;

        const prodRes = await productService.list({
          category: catId,
          subCategory: subId,
          sort,
        });
        const items = prodRes?.data?.data || prodRes?.data;
        if (Array.isArray(items)) {
          setProducts(items);
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
        const fallbackCat = getCategoryBySlug(slug);
        const fallbackSub = subSlug ? getSubcategoryBySlug(slug, subSlug) : null;
        if (fallbackCat) {
          setCategory(fallbackCat);
          setSubCategory(fallbackSub);
          setProducts(
            getProducts({
              category: fallbackCat._id,
              subCategory: fallbackSub?._id,
              sort,
            })
          );
        }
      }
    }
    load();
  }, [slug, subSlug, sort]);

  const allSubcategories = category?.subcategories || [];

  return (
    <PageWrapper>
      <div style={{ background: '#ffffff', minHeight: '80vh', padding: '2rem 0 5rem' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/categories" style={{ color: '#64748b', textDecoration: 'none' }}>Categories</Link>
            <ChevronRight size={14} />
            <Link to={`/categories/${category?.slug || slug}`} style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
              {category?.name || slug} (Sub-Categories)
            </Link>
            {subCategory && (
              <>
                <ChevronRight size={14} />
                <span style={{ color: '#9333ea', fontWeight: 700 }}>{subCategory.name}</span>
              </>
            )}
          </div>

          {/* Subcategory Pills Bar to quickly switch */}
          {allSubcategories.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.65rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              <Link
                to={`/categories/${category?.slug || slug}`}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '9999px',
                  background: !subSlug ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : '#ffffff',
                  color: !subSlug ? '#ffffff' : '#581c87',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: !subSlug ? '#7c3aed' : '#e9d5ff',
                  boxShadow: !subSlug ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <FolderTree size={14} /> All Sub-Categories
              </Link>

              {allSubcategories.map((sub) => {
                const isCurrent = sub.slug === subSlug;
                return (
                  <Link
                    key={sub._id || sub.slug}
                    to={`/categories/${category?.slug || slug}/${sub.slug}`}
                    style={{
                      padding: '0.55rem 1.25rem',
                      borderRadius: '9999px',
                      background: isCurrent ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#475569',
                      fontWeight: isCurrent ? 800 : 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      border: '1px solid',
                      borderColor: isCurrent ? '#7c3aed' : '#e9d5ff',
                      boxShadow: isCurrent ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Header Title & Sorting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Sparkles size={14} /> {category?.name || 'Category'}
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', margin: '0.2rem 0 0.25rem', color: '#0f172a' }}>
                {subCategory ? subCategory.name : `${category?.name || 'Category'} Products`}
              </h1>
              <p style={{ margin: 0, color: '#64748b' }}>
                {subCategory?.description || category?.description || 'Explore our verified Sivakasi fireworks selection.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Sort By:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: 600 }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured Picks</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  );
}

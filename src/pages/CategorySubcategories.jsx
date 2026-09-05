import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import { categoryService } from '../services/category.service';
import { getCategoryBySlug, getSubcategoriesByCategory } from '../data';
import { Sparkles, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CategorySubcategories() {
  const { slug } = useParams();
  const [category, setCategory] = useState(() => getCategoryBySlug(slug));
  const [subcategories, setSubcategories] = useState(() => getSubcategoriesByCategory(slug));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await categoryService.getBySlug(slug);
        const catData = catRes?.data || catRes;
        if (catData) {
          setCategory(catData);
          const subList = catData.subcategories || getSubcategoriesByCategory(slug);
          setSubcategories(subList);
        }
      } catch (err) {
        console.error('Failed to load category subcategories:', err);
        const fallbackCat = getCategoryBySlug(slug);
        if (fallbackCat) {
          setCategory(fallbackCat);
          setSubcategories(fallbackCat.subcategories || []);
        }
      }
    }
    load();
  }, [slug]);

  if (!category) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2>Category Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            The category you are looking for does not exist or has been moved.
          </p>
          <Link to="/categories" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Back to All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%)', minHeight: '80vh', padding: '2rem 0 5rem' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/categories" style={{ color: '#64748b', textDecoration: 'none' }}>Categories</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>{category.name}</span>
          </div>

          {/* Category Banner Header */}
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 30px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f3e8ff',
                  color: '#6d28d9',
                  border: '1px solid #e9d5ff',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem',
                }}
              >
                <Sparkles size={14} color="#7c3aed" /> Department Showcase
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', margin: '0 0 0.5rem', color: '#0f172a' }}>
                {category.name} Sub-Categories
              </h1>
              <p style={{ color: '#64748b', fontSize: '1.02rem', margin: 0, lineHeight: 1.6 }}>
                {category.description || 'Select a sub-category below to view curated products and special festival packs.'}
              </p>
            </div>

            <Link
              to="/categories"
              className="btn btn-outline"
              style={{
                borderRadius: '9999px',
                borderColor: '#c084fc',
                color: '#6d28d9',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ArrowLeft size={16} /> All Categories
            </Link>
          </div>

          {/* Sub-Categories Grid */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>
                Choose a Collection ({subcategories.length})
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {subcategories.map((sub) => (
                <Link
                  key={sub._id || sub.slug}
                  to={`/categories/${category.slug}/${sub.slug}`}
                  style={{
                    textDecoration: 'none',
                    background: 'white',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.06)',
                    border: '1.5px solid rgba(192, 132, 252, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="subcategory-card"
                >
                  {/* Image with Aspect Ratio */}
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '16 / 10',
                      overflow: 'hidden',
                      background: '#1e1035',
                    }}
                  >
                    <img
                      src={sub.image || category.image}
                      alt={sub.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease',
                      }}
                      className="subcategory-img"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(30, 16, 53, 0.82)',
                        backdropFilter: 'blur(8px)',
                        color: '#f3e8ff',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: '1px solid rgba(192, 132, 252, 0.4)',
                      }}
                    >
                      {sub.itemCount ? `${sub.itemCount} Items` : 'Available'}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 0.5rem', fontWeight: 800 }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem', flex: 1 }}>
                      {sub.description}
                    </p>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        borderRadius: '12px',
                        background: '#f3e8ff',
                        color: '#6d28d9',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        transition: 'all 0.2s ease',
                      }}
                      className="subcat-action-btn"
                    >
                      <span>Explore Products</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Option to browse all products in this category */}
          <div
            style={{
              textAlign: 'center',
              padding: '2.2rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(243, 232, 255, 0.8) 0%, rgba(233, 213, 255, 0.45) 100%)',
              borderRadius: '20px',
              border: '1.5px dashed #a855f7',
            }}
          >
            <p style={{ margin: '0 0 0.85rem', color: '#581c87', fontWeight: 700, fontSize: '1.02rem' }}>
              Want to see all {category.name} crackers without filtering by sub-category?
            </p>
            <Link
              to={`/products?category=${category._id || category.slug}`}
              className="btn btn-primary"
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 2rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Browse All {category.name} ({category.itemCount || 10}+ Items) <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .subcategory-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(124, 58, 237, 0.18), 0 4px 12px rgba(0,0,0,0.06) !important;
          border-color: #a855f7 !important;
        }
        .subcategory-card:hover .subcategory-img {
          transform: scale(1.08);
        }
        .subcategory-card:hover .subcat-action-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </PageWrapper>
  );
}

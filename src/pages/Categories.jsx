import React, { useEffect, useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import HeroCarousel from '../components/home/HeroCarousel';
import FestiveCategoryRow from '../components/home/FestiveCategoryRow';
import CategoryCard from '../components/product/CategoryCard';
import Spinner from '../components/ui/Spinner';
import { categoryService } from '../services/category.service';
import { categories as defaultCategories } from '../data';

export default function Categories() {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await categoryService.list();
        const items = res?.data || res;
        if (Array.isArray(items) && items.length > 0) {
          setCategories(items);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    load();
  }, []);

  return (
    <PageWrapper>
      {/* ── Festive Hero Carousel ──────────────────────────────────── */}
      <HeroCarousel />

      {/* ── 6 Stylized Festive Category Cards Row ───────────────────── */}
      <FestiveCategoryRow />

      {/* ── All Categories Detailed Grid ────────────────────────────── */}
      <div className="section" style={{ background: '#faf5ff', padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Curated Fireworks Catalogue
            </span>
            <h1 style={{ marginTop: '0.35rem', fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', color: '#0f172a' }}>
              Explore All Categories
            </h1>
            <p style={{ maxWidth: '520px', margin: '0.5rem auto 0', color: '#64748b' }}>
              Browse our complete range of certified green crackers, sparklers, sky shots, and festive combo gift boxes.
            </p>
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

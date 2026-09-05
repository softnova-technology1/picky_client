import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import HeroCarousel from '../components/home/HeroCarousel';
import FestiveCategoryRow from '../components/home/FestiveCategoryRow';
import ProductGrid from '../components/product/ProductGrid';
import { productService } from '../services/product.service';
import { promoOffer, products as defaultProducts } from '../data';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(defaultProducts.filter((p) => p.isFeatured));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await productService.list({ sort: 'featured', limit: 8 });
        const pItems = prodRes?.data?.data || prodRes?.data;
        if (Array.isArray(pItems) && pItems.length > 0) {
          setFeaturedProducts(pItems);
        }
      } catch (err) {
        console.error('Home load error:', err);
      }
    }
    loadData();
  }, []);

  return (
    <PageWrapper>
      {/* ── Hero Carousel with Fireworks & Festive Artwork ──────────────── */}
      <HeroCarousel />

      {/* ── 6 Stylized Festive Category Cards Row ───────────────────────── */}
      <FestiveCategoryRow />

      {/* ── Featured & Trending Crackers Collection ──────────────────────── */}
      <section className="section" style={{ background: '#ffffff', padding: '4rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                <Sparkles size={16} /> Sivakasi Fresh Stock
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#0f172a' }}>
                Trending Festive Fireworks
              </h2>
            </div>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              See Full Catalog <ArrowRight size={16} />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* ── Promotional Special Offer Banner ─────────────────────────────── */}
      <section className="section" style={{ padding: '2rem 0 5rem', background: '#faf5ff' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1035 0%, #3b0764 45%, #6d28d9 100%)',
              color: 'white',
              borderRadius: '28px',
              padding: 'clamp(2.5rem, 5vw, 3.8rem) clamp(1.5rem, 4vw, 3rem)',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(109, 40, 217, 0.35)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(192, 132, 252, 0.35)',
            }}
          >
            {/* Decorative festive sparkle dots */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Sparkles size={14} color="#fde047" /> {promoOffer.badge}
            </span>

            <h2 style={{ color: 'white', margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem, 4vw, 2.8rem)', lineHeight: 1.2 }}>
              {promoOffer.title}
            </h2>

            <p style={{ color: '#f3e8ff', maxWidth: '540px', margin: '0 auto 1.8rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Use coupon code <strong style={{ color: '#ffffff', background: 'rgba(124, 58, 237, 0.5)', border: '1px solid rgba(192, 132, 252, 0.5)', padding: '0.25rem 0.65rem', borderRadius: '6px', letterSpacing: '0.04em' }}>{promoOffer.couponCode}</strong> at checkout for an instant discount!
            </p>

            <Link
              to="/products"
              className="btn btn-lg"
              style={{
                background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)',
                color: '#3b0764',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '0.9rem 2.5rem',
                borderRadius: '9999px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {promoOffer.buttonText} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

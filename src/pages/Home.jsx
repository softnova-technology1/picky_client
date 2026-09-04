import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProductGrid from '../components/product/ProductGrid';
import CategoryCard from '../components/product/CategoryCard';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.list({ sort: 'featured', limit: 8 }),
          categoryService.list(),
        ]);
        setFeaturedProducts(prodRes?.data?.data || prodRes?.data || []);
        setCategories(catRes?.data || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <PageWrapper>
      {/* ── Hero Banner Section ─────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2563eb 100%)', color: 'white', padding: '4.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <span>✨</span> Single-Vendor Quality Store
            </div>
            <h1 style={{ color: 'white', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '1rem', lineHeight: 1.15 }}>
              Handpicked Essentials. <br />
              <span style={{ color: '#fde047' }}>Delivered Fast.</span>
            </h1>
            <p style={{ color: '#e0e7ff', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '500px', lineHeight: 1.6 }}>
              Discover strictly quality-tested electronics, apparel, and home essentials with instant live shipment tracking on WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn btn-lg" style={{ background: '#fde047', color: '#1e1b4b', fontWeight: 800 }}>
                Explore Products ➔
              </Link>
              <Link to="/categories" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                Browse Categories
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', maxWidth: '420px', width: '100%' }}>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                alt="Featured Product"
                style={{ borderRadius: '16px', width: '100%', aspectRatio: '4/3', objectFit: 'cover', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'white', margin: 0 }}>AeroSound Pro ANC</h4>
                  <span style={{ color: '#fde047', fontWeight: 700, fontSize: '1.1rem' }}>₹2,499 <s style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>₹3,999</s></span>
                </div>
                <Link to="/products/aerosound-pro-wireless-headphones" className="btn btn-sm" style={{ background: 'white', color: '#1e1b4b', fontWeight: 700 }}>
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Propositions Bar ───────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📦</span>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>Cash on Delivery</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay when you receive</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem' }}>💬</span>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>WhatsApp Tracking</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant AWB & status</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>Fast Dispatch</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ships in 24 hours</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>Quality Checked</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>100% verified items</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Grid ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Curated Collections
              </span>
              <h2 style={{ marginTop: '0.2rem' }}>Popular Categories</h2>
            </div>
            <Link to="/categories" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.92rem' }}>
              View All ➔
            </Link>
          </div>

          <div className="grid-4">
            {categories.slice(0, 4).map((cat) => (
              <CategoryCard key={cat._id || cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────────── */}
      <section className="section" style={{ background: 'white', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Top Rated Picks
              </span>
              <h2 style={{ marginTop: '0.2rem' }}>Trending Products</h2>
            </div>
            <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.92rem' }}>
              See All ➔
            </Link>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* ── Promotional Banner ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow)',
            }}
          >
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
              LIMITED TIME OFFER
            </span>
            <h2 style={{ color: 'white', margin: '1rem 0 0.5rem', fontSize: '2.2rem' }}>
              Get 10% Off On Your First Order
            </h2>
            <p style={{ color: '#c7d2fe', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '1rem' }}>
              Use coupon code <strong style={{ color: '#fde047', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>WELCOME10</strong> at checkout!
            </p>
            <Link to="/products" className="btn btn-lg" style={{ background: 'var(--color-primary)', color: 'white', fontWeight: 700 }}>
              Shop Now 🛒
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

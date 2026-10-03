import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import '../../styles/blog.css';

export default function Blog() {
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const topicClusters = [
    {
      id: 'topic-1',
      title: 'Tech Teardowns',
      count: '12 Articles',
      icon: <Zap size={24} />,
    },
    {
      id: 'topic-2',
      title: 'Quality Verification',
      count: '18 Articles',
      icon: <ShieldCheck size={24} />,
    },
    {
      id: 'topic-3',
      title: 'Smart Buying Guides',
      count: '15 Articles',
      icon: <BookOpen size={24} />,
    },
    {
      id: 'topic-4',
      title: 'Single-Vendor Direct',
      count: '9 Articles',
      icon: <Award size={24} />,
    },
  ];

  const faqs = [
    {
      q: 'Why does Picky operate as a single-vendor store instead of a multi-vendor marketplace?',
      a: 'Multi-vendor marketplaces often suffer from counterfeit products, inconsistent quality, and poor warranty support. Picky operates 100% as a single-vendor store—meaning every item is inspected, stored, and fulfilled directly by us to guarantee authenticity and instant live WhatsApp tracking.',
    },
    {
      q: 'How frequently are new products and blog insights added to Picky?',
      a: 'We drop fresh curated inventory and deep-dive technical articles every week. Only items that pass our rigorous 5-step quality inspection make it into our live store catalog.',
    },
    {
      q: 'Can I track my delivery updates directly on WhatsApp?',
      a: 'Yes! As soon as your order is dispatched from our fulfillment center, automated live tracking alerts are sent directly to your WhatsApp with real-time status updates.',
    },
    {
      q: 'How do product returns and warranty claims work on Picky?',
      a: 'Because we store and fulfill all items directly, returns and replacements are processed instantly without waiting for third-party sellers to respond. Simply raise a ticket under your Account dashboard.',
    },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <PageWrapper>
      {/* ── 1. Editorial Fashion Hero Section (Matching Reference Design) ── */}
      <section className="editorial-hero-wrapper">
        <div className="editorial-hero-card">
          {/* Top In-Hero Minimal Header Bar */}
          <div className="editorial-top-bar">
            <div className="editorial-logo">
              <span className="editorial-logo-bag">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#eb4d2e">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
                </svg>
              </span>
              <span className="editorial-logo-text">shops</span>
            </div>

            <nav className="editorial-nav-links">
              <a href="#topics" className="editorial-nav-link active">Home</a>
              <a href="#topics" className="editorial-nav-link">Collection</a>
              <a href="#topics" className="editorial-nav-link">Brands</a>
              <a href="#faqs" className="editorial-nav-link">Our Areas</a>
              <a href="#newsletter" className="editorial-nav-link">Contact</a>
            </nav>

            <div className="editorial-header-actions">
              <button type="button" className="editorial-icon-btn" aria-label="Search"><Search size={19} /></button>
              <button type="button" className="editorial-icon-btn" aria-label="Shopping Bag"><ShoppingBag size={19} /></button>
              <button type="button" className="editorial-icon-btn" aria-label="User Account"><User size={19} /></button>
            </div>
          </div>

          {/* Main 2-Column Hero Body */}
          <div className="editorial-hero-body">
            {/* Left Content Column */}
            <div className="editorial-left-col">
              <h1 className="editorial-main-title">
                Fashion Gives<br />
                Impression
              </h1>

              {/* Connecting Divider Line and Arch Framing Box */}
              <div className="editorial-content-frame">
                <div className="editorial-sub-grid">
                  <div className="editorial-desc-col">
                    <div className="editorial-divider-line" />
                    <p className="editorial-desc-text">
                      Provide construction and consulting services to clients who value the highest levels of quality and service for their commercial, residential.
                    </p>
                  </div>

                  {/* Architectural Arch Frame with enclosing black bounding box */}
                  <div className="editorial-arch-box">
                    <div className="editorial-arch-outer">
                      <div className="editorial-arch-frame">
                        <img
                          src="/images/blog/arch_pink_model.jpg"
                          alt="Fashion Impression Style Model"
                          className="editorial-arch-img"
                        />
                      </div>
                    </div>
                    <div className="editorial-arch-base-line" />
                  </div>
                </div>
              </div>

              {/* Action Buttons & Hand-drawn Arrow */}
              <div className="editorial-actions-row">
                <button
                  type="button"
                  className="editorial-btn-solid"
                  onClick={() => {
                    const el = document.getElementById('topics');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  SHOP NOW
                </button>

                <button
                  type="button"
                  className="editorial-btn-outline"
                  onClick={() => {
                    const el = document.getElementById('faqs');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  EXPLORE OUR SHOP
                </button>

                {/* Hand Drawn Organic Curved Arrow pointing to the left */}
                <div className="editorial-arrow-wrapper">
                  <svg
                    className="editorial-curved-arrow"
                    viewBox="0 0 100 55"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M88 6C82 36 52 46 16 46"
                      stroke="#424242"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M26 36L14 46L26 56"
                      stroke="#424242"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Collage Column */}
            <div className="editorial-right-col">
              <div className="editorial-collage-container">
                {/* Yellow Geometric Background Block with Black Border */}
                <div className="editorial-yellow-block" />

                {/* Oval/Circle Framed Photo with Clothes Rack & Thick White Border */}
                <div className="editorial-oval-frame">
                  <img
                    src="/images/blog/clothing_rack_model.jpg"
                    alt="Boutique Fashion Studio"
                    className="editorial-oval-img"
                  />
                </div>

                {/* Overlapping Transparent Cutout Model */}
                <div className="editorial-model-container">
                  <img
                    src="/images/blog/fashion_hero_model.png"
                    alt="Fashion Gives Impression Featured Model"
                    className="editorial-model-cutout"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" id="topics" style={{ paddingTop: '3rem' }}>
        {/* ── Topic Clusters Grid ────────────────────────────────── */}
        <div className="blog-section-header">
          <span className="blog-section-tag">✦ Explore Categories ✦</span>
          <h2 className="blog-section-heading">Browse Insights by Topic</h2>
        </div>

        <div className="blog-topics-grid">
          {topicClusters.map((topic) => (
            <div className="blog-topic-card" key={topic.id}>
              <div className="blog-topic-icon-frame">{topic.icon}</div>
              <h3 className="blog-topic-card-title">{topic.title}</h3>
              <span className="blog-topic-card-count">{topic.count}</span>
            </div>
          ))}
        </div>

        {/* ── Shopper FAQ Accordion Section ─────────────────────── */}
        <div className="blog-faq-section-wrapper" id="faqs" style={{ marginTop: '4rem' }}>
          <div className="blog-section-header" style={{ marginBottom: '2rem' }}>
            <span className="blog-section-tag">✦ Shopper Guide ✦</span>
            <h2 className="blog-section-heading">Frequently Asked Questions</h2>
          </div>

          <div className="blog-faq-container">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="blog-faq-item"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <div className="blog-faq-question">
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp size={18} style={{ color: '#7c3aed' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: '#94a3b8' }} />
                  )}
                </div>
                {openFaq === index && <p className="blog-faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Newsletter Subscription Banner ─────────────────────── */}
        <div className="blog-newsletter-card" id="newsletter">
          <div className="blog-newsletter-content">
            <h2 className="blog-newsletter-title">Stay Ahead of Picky Drops & Keynotes</h2>
            <p className="blog-newsletter-sub">
              Subscribe to receive exclusive single-vendor store teardowns, logistics updates, and curated buying guides delivered straight to your inbox.
            </p>

            {isSubscribed ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  borderRadius: '30px',
                  padding: '0.85rem 1.5rem',
                  color: '#6ee7b7',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={18} />
                <span>You're subscribed! Welcome to the Picky Insights newsletter.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="blog-newsletter-form">
                <input
                  type="email"
                  className="blog-newsletter-input"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="blog-newsletter-btn">
                  Subscribe ✦
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

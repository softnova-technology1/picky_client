import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import {
  ArrowUpRight,
  Play,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Video,
} from 'lucide-react';
import '../styles/blog.css';

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

  const videoClips = [
    {
      id: 'v-1',
      title: 'Inside Picky Fulfillment: How 100% Items Are Physically Tested',
      duration: '3:45',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'v-2',
      title: 'Unboxing Q3 New Arrivals: Premium Audio & Desk Gear',
      duration: '4:20',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'v-3',
      title: 'Why We Don\'t Allow Third-Party Sellers on Picky',
      duration: '2:15',
      image: 'https://images.unsplash.com/photo-1556742049-0a67daf4005a?w=600&auto=format&fit=crop&q=80',
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
      {/* ── 1. Midnight Purple Hero Section ──────────────────────────── */}
      <section className="blog-hero-wrapper">
        <div className="blog-hero-glow-1" />
        <div className="blog-hero-glow-2" />

        {/* Floating Accents */}
        <span className="blog-accent-chevron">&gt;</span>
        <span className="blog-accent-star">✦</span>
        <div className="blog-accent-lightning">⚡</div>

        <div className="blog-hero-content">
          <div className="blog-hero-top-badge">
            <Sparkles size={14} style={{ color: '#c084fc' }} />
            <span>Picky Insights & Keynotes</span>
          </div>

          <h1 className="blog-hero-title">
            Innovating Your Digital <br />
            World With Us
          </h1>

          <p className="blog-hero-subtitle">
            Discover curated shopping guides, product quality teardowns, and single-vendor logistics stories from the Picky team. Built for shoppers who refuse to settle for clutter.
          </p>

          <button
            type="button"
            className="blog-hero-cta-btn"
            onClick={() => {
              const el = document.getElementById('spotlight-story');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Explore Keynotes</span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      {/* ── 2. Featured Video / Interactive Presentation Frame ───────── */}
      <div className="blog-showcase-wrapper">
        <div className="blog-showcase-frame">
          <img
            src="/images/blog_featured_presentation.jpg"
            alt="Picky Live Keynote Presentation"
            className="blog-showcase-img"
          />

          <div className="blog-showcase-overlay">
            <div className="blog-showcase-play-btn" title="Watch Keynote Presentation">
              <Play size={28} style={{ marginLeft: '4px' }} />
            </div>
            <div className="blog-showcase-badge">
              <span className="blog-live-dot" />
              <span>Picky Product Keynote & Quality Verification Showcase</span>
            </div>
          </div>
        </div>

        {/* 3D Stacked Platform Base Effect Underneath */}
        <div className="blog-showcase-3d-base-1" />
        <div className="blog-showcase-3d-base-2" />
      </div>

      <div className="container" id="spotlight-story">
        {/* ── 3. Editor's Choice Spotlight Story ───────────────────── */}
        <div className="blog-section-header">
          <span className="blog-section-tag">✦ Spotlight Story ✦</span>
          <h2 className="blog-section-heading">Featured Story of the Month</h2>
        </div>

        <div className="blog-spotlight-card">
          <div className="blog-spotlight-img-box">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"
              alt="Quality Inspection Warehouse"
            />
          </div>

          <div className="blog-spotlight-content">
            <span className="blog-spotlight-badge">Editor's Choice</span>
            <h3 className="blog-spotlight-title">
              Behind the Scenes: How Picky Physically Inspects Every Single Product
            </h3>
            <p className="blog-spotlight-excerpt">
              Unlike open multi-vendor marketplaces where unvetted sellers list products online, Picky operates as a single-vendor store. Every item is unboxed, stress-tested, and verified in our hub before shipment.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7c3aed', fontWeight: 700 }}>
                <Clock size={15} /> 6 Min Read
              </span>
              <span>•</span>
              <span>Published by Picky QC Team</span>
            </div>

            <button type="button" className="blog-hero-cta-btn" style={{ padding: '0.7rem 1.6rem', fontSize: '0.9rem' }}>
              <span>Read Full Story</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* ── 4. Topic Clusters Grid ────────────────────────────────── */}
        <div className="blog-section-header" style={{ marginTop: '4rem' }}>
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

        {/* ── 5. Video Keynote Micro-Clips Grid ──────────────────────── */}
        <div className="blog-section-header" style={{ marginTop: '4rem' }}>
          <span className="blog-section-tag">✦ Video Highlights ✦</span>
          <h2 className="blog-section-heading">Watch Keynote Demos & Teardowns</h2>
        </div>

        <div className="blog-video-grid">
          {videoClips.map((clip) => (
            <div className="blog-video-card" key={clip.id}>
              <div className="blog-video-thumb-box">
                <img src={clip.image} alt={clip.title} />
                <div className="blog-video-play-overlay">
                  <div className="blog-mini-play-btn">
                    <Play size={20} style={{ marginLeft: '2px' }} />
                  </div>
                </div>
                <span className="blog-video-duration">{clip.duration}</span>
              </div>
              <div className="blog-video-card-body">
                <h4 className="blog-video-card-title">{clip.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* ── 6. Shopper FAQ Accordion Section ─────────────────────── */}
        <div className="blog-faq-section-wrapper">
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

        {/* ── 7. Newsletter Subscription Banner ─────────────────────── */}
        <div className="blog-newsletter-card">
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

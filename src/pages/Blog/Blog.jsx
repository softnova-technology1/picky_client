import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Clock, Sparkles, ArrowUpRight } from 'lucide-react';
import { blogStories } from '../../data/data';
import { usePageCustomization } from '../../store/customizationStore';
import '../../styles/blog.css';

export default function Blog() {
  const { isEnabled, getSetting } = usePageCustomization('blog');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categoriesList = [
    'All',
    'Shopping Guides',
    'Product Tips',
    'Lifestyle',
    'Fashion',
    'Home & Kitchen',
    'Picky Updates'
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  const stories = blogStories || [];

  const filteredStories = stories.filter(story => {
    return activeCategory === 'All' || story.category === activeCategory;
  });

  return (
    <PageWrapper>
      {/* ─── Hero Section ─── */}
      {isEnabled('blog_hero') && (
      <div className="blog-hero-fullwidth">
        <section className="blog-hero">
          {/* Ambient Glowing Orbs */}
          <div className="hero-gradient-orb orb-purple"></div>
          <div className="hero-gradient-orb orb-pink"></div>

          <div className="blog-hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>{getSetting('blog_hero', 'badgeText', 'THE PICKY JOURNAL')}</span>
            </div>
            <h1 className="blog-hero-title">
              {(() => {
                const title = getSetting('blog_hero', 'title', 'Discover Better. Shop Smarter.');
                const words = title.split(' ');
                if (words.length > 2) {
                  return (
                    <>
                      {words.slice(0, 2).join(' ')}<br/> {words.slice(2, -1).join(' ')} <span className="highlight-italic">{words[words.length - 1]}</span>
                    </>
                  );
                }
                return title;
              })()}
            </h1>
            <p className="blog-hero-desc">
              {getSetting('blog_hero', 'subtitle', 'Helpful ideas, product guides, shopping tips, and stories to make everyday choices easier.')}
            </p>
            <div className="blog-hero-actions">
              <button className="btn btn-primary btn-lg">{getSetting('blog_hero', 'primaryButtonText', 'Explore Stories')}</button>
              <button className="btn btn-secondary btn-lg">{getSetting('blog_hero', 'secondaryButtonText', 'Shop Products')}</button>
            </div>
          </div>

          {/* ─── Exact Staggered Capsule Slash Layout (Right Side) ─── */}
          <div className="blog-hero-images slash-layout">
            <div className="slash-image-container">
              <img src={getSetting('blog_hero', 'imageUrl', '/images/blog/blog_hero_slash.jpg')} alt="Blog Hero Visual" />
            </div>
          </div>
        </section>
      </div>
      )}

      <div className="blog-page-container">
        {/* ─── Interactive Filter & Article Grid ─── */}
        {isEnabled('blog_feed') && (
        <section className="blog-section articles-section">
          {/* Category Filter Pills */}
          {getSetting('blog_feed', 'showCategoryPills', true) && (
          <div className="category-pills">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          )}

          {/* Article Cards Grid */}
          <div className="stories-grid">
            {filteredStories.map((story) => (
              <article key={story.id} className="story-card">
                <div className="story-img-container">
                  <img src={story.image} alt={story.title} />
                  <span className="story-category-tag">{story.category}</span>

                  {/* Hover Light Blur & Link Overlay */}
                  <div className="story-hover-overlay">
                    <button className="story-read-btn">
                      <span>{getSetting('blog_feed', 'readMoreText', 'Read Story')}</span>
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="story-content">
                  <div className="story-meta">
                    <span>{story.date}</span>
                    <span>•</span>
                    <span className="read-time"><Clock size={13} /> {story.readTime}</span>
                  </div>
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-excerpt">{story.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {/* ─── Newsletter Banner ─── */}
        {isEnabled('blog_newsletter') && (
        <section className="blog-newsletter">
          <div className="newsletter-content">
            <div className="newsletter-icon">✉</div>
            <h2>{getSetting('blog_newsletter', 'heading', 'Your next favorite find is waiting.')}</h2>
            <p>{getSetting('blog_newsletter', 'subheading', 'Get first-look updates on tech teardowns, curated drops, and exclusive buying guides.')}</p>

            {isSubscribed ? (
              <div className="subscribed-msg">Thanks for subscribing! Check your inbox soon.</div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">{getSetting('blog_newsletter', 'buttonText', 'SUBSCRIBE')}</button>
              </form>
            )}

            <div className="newsletter-links">
              <span>Read Updates</span> • <span>Shop Recommended</span> • <span>Contact Customer Service</span>
            </div>
          </div>
        </section>
        )}
      </div>
    </PageWrapper>
  );
}

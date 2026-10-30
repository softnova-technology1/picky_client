import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Sparkles, Play, Pause, Check, X, Volume2, Maximize2, Settings, MoreVertical, 
  ArrowRight, Video, ShieldCheck, ShoppingBag, Star, LayoutGrid, Shirt, UtensilsCrossed, 
  Gem, Smartphone, Flame, Coffee, Home, Smile, Dumbbell 
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useBlogStore, INITIAL_BLOG_DATA } from '../../store/blogStore';
import '../../styles/blog.css';
import '../../styles/home-premium.css';

const ICON_MAP = {
  LayoutGrid,
  Shirt,
  UtensilsCrossed,
  Gem,
  Sparkles,
  Smartphone,
  Flame,
  Coffee,
  Home,
  Smile,
  Dumbbell,
  Video,
  ShieldCheck,
  ShoppingBag,
  Star,
};

export default function Blog() {
  const blogData = useBlogStore((state) => state.blogData) || INITIAL_BLOG_DATA;
  const hero = blogData.hero || INITIAL_BLOG_DATA.hero;
  const metrics = blogData.metrics || INITIAL_BLOG_DATA.metrics;
  const categories = blogData.categories || INITIAL_BLOG_DATA.categories;
  const shoppableShorts = blogData.shoppableShorts || INITIAL_BLOG_DATA.shoppableShorts;
  const masterclass = blogData.masterclass || INITIAL_BLOG_DATA.masterclass;
  const buyingGuides = blogData.buyingGuides || INITIAL_BLOG_DATA.buyingGuides;
  const customerReviews = blogData.customerReviews || INITIAL_BLOG_DATA.customerReviews;
  const communityBanner = blogData.communityBanner || INITIAL_BLOG_DATA.communityBanner;

  const fetchBlogFromApi = useBlogStore((state) => state.fetchBlogFromApi);
  const [, setLiveTick] = useState(0);
  React.useEffect(() => {
    if (fetchBlogFromApi) fetchBlogFromApi();
    const handleLiveSync = () => setLiveTick((t) => t + 1);
    window.addEventListener('picky_blog_updated', handleLiveSync);
    return () => window.removeEventListener('picky_blog_updated', handleLiveSync);
  }, [fetchBlogFromApi]);

  const [addedId, setAddedId] = useState(null);
  const [activeShortModal, setActiveShortModal] = useState(null);
  const [isPlayingMasterclass, setIsPlayingMasterclass] = useState(false);
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const addItem = useCartStore((state) => state.addItem);

  const rawShorts = shoppableShorts.items || INITIAL_BLOG_DATA.shoppableShorts.items;
  const filteredShorts = activeCategory === 'all'
    ? rawShorts
    : rawShorts.filter((s) => {
        const cat = (s.category || '').toLowerCase();
        if (activeCategory === 'womens-fashion') return cat.includes('fashion') || cat.includes('kurti');
        if (activeCategory === 'home-kitchen') return cat.includes('kitchen') || cat.includes('home');
        if (activeCategory === 'artificial-jewellery') return cat.includes('jewel') || cat.includes('accessories');
        if (activeCategory === 'beauty-personal-care') return cat.includes('beauty') || cat.includes('skincare') || cat.includes('serum');
        if (activeCategory === 'mobile-accessories') return cat.includes('tech') || cat.includes('mobile') || cat.includes('earbuds');
        if (activeCategory === 'traditional-tamil-products') return cat.includes('tamil') || cat.includes('traditional');
        if (activeCategory === 'snacks-foods') return cat.includes('snack') || cat.includes('food');
        if (activeCategory === 'home-decor') return cat.includes('decor') || cat.includes('home');
        if (activeCategory === 'kids-products') return cat.includes('kid') || cat.includes('toy');
        if (activeCategory === 'fitness-products') return cat.includes('fit') || cat.includes('health');
        return true;
      });

  const handleAddToBag = (e, item) => {
    e.stopPropagation();
    addItem({
      _id: item.productId || item.id,
      name: item.title,
      price: item.price,
      image: item.image,
      stock: 15,
      category: item.category || 'General',
    }, 1);

    setAddedId(item.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1800);
  };

  const isBlogPageEnabled = blogData.isBlogPageEnabled !== false;

  if (!isBlogPageEnabled) {
    return (
      <PageWrapper>
        <div style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '3.5rem 2rem', boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={30} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem' }}>
              Blog Journal Coming Soon
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 2rem' }}>
              Our editorial team is currently updating this page with fresh stories, product guides, and video reviews. Please check back soon!
            </p>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none' }}>
              <span>Explore Picky Store</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* ─── Hero Section ─── */}
      {hero.enabled !== false && (
        <div className="blog-hero-fullwidth">
          <section className="blog-hero">
            {/* Ambient Glowing Orbs */}
            <div className="hero-gradient-orb orb-purple"></div>
            <div className="hero-gradient-orb orb-pink"></div>

            <div className="blog-hero-content">
              <div className="hero-badge">
                <Sparkles size={14} className="badge-icon" />
                <span>{hero.badgeText || 'THE PICKY JOURNAL'}</span>
              </div>
              <h1 className="blog-hero-title">
                {(() => {
                  const title = hero.title || 'Discover Better. Shop Smarter.';
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
                {hero.subtitle || 'Helpful ideas, product guides, shopping tips, and stories to make everyday choices easier.'}
              </p>
              <div className="blog-hero-actions">
                <button className="btn btn-primary btn-lg">{hero.primaryButtonText || 'Explore Stories'}</button>
                <button className="btn btn-secondary btn-lg">{hero.secondaryButtonText || 'Shop Products'}</button>
              </div>
            </div>

            {/* ─── Exact Staggered Capsule Slash Layout (Right Side) ─── */}
            <div className="blog-hero-images slash-layout">
              <div className="slash-image-container">
                <img src={hero.imageUrl || 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/blog/blog_hero_slash.jpg'} alt="Blog Hero Visual" />
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="blog-page-container">
        {/* ─── Hero Underbar: Trust Metrics & Category Quick Filter ─── */}
        {(metrics.enabled !== false || categories.enabled !== false) && (
          <section className="blog-metrics-and-filter-wrapper">
            {/* 1. Trust Metrics Grid */}
            {metrics.enabled !== false && (
              <div className="blog-trust-metrics-grid">
                {(metrics.items || []).map((metric, idx) => {
                  const IconComponent = (typeof metric.icon === 'function' ? metric.icon : ICON_MAP[metric.iconName]) || Sparkles;
                  return (
                    <div key={metric.id || idx} className="blog-metric-card">
                      <div className="blog-metric-icon-wrap">
                        <IconComponent size={20} />
                      </div>
                      <div className="blog-metric-info">
                        <span className="blog-metric-value">{metric.value}</span>
                        <span className="blog-metric-label">{metric.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Category Quick-Filter Circles (Real Icons & Circular Design) */}
            {categories.enabled !== false && (
              <div className="blog-category-filter-wrapper">
                <div className="blog-category-circles-scroll">
                  {(categories.items || []).map((cat) => {
                    const CategoryIcon = (typeof cat.icon === 'function' ? cat.icon : ICON_MAP[cat.iconName]) || LayoutGrid;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`blog-circle-item ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        aria-label={cat.label}
                      >
                        <div className="blog-circle-avatar">
                          <CategoryIcon size={22} strokeWidth={1.8} />
                          <span className="blog-circle-count-badge">{cat.count}</span>
                        </div>
                        <span className="blog-circle-label">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── Trending Shoppable Shorts (Multi-Product Carousel) ─── */}
        {shoppableShorts.enabled !== false && (
          <section className="shoppable-shorts-section">
            <div className="shoppable-shorts-header">
              <h2 className="shoppable-shorts-title">{shoppableShorts.title || 'Trending Shoppable Shorts'}</h2>
              <p className="shoppable-shorts-subtitle">{shoppableShorts.subtitle || 'Carousel video reels on a carousel with trending categories.'}</p>
            </div>

            <div className="shoppable-shorts-carousel">
              {filteredShorts.map((short) => (
                <div 
                  key={short.id} 
                  className="short-card"
                  onClick={() => setActiveShortModal(short)}
                >
                  <div className="short-media-container">
                    <img src={short.image} alt={short.title} className="short-media-img" />
                  </div>

                  {/* Docked White Bottom Pill */}
                  <div className="short-dock-pill" onClick={(e) => e.stopPropagation()}>
                    <div className="short-dock-info">
                      <span className="short-dock-name">{short.title}</span>
                      <span className="short-dock-price">{short.priceFormatted || `₹${short.price}`}</span>
                    </div>
                    <button 
                      className={`short-dock-add-btn ${addedId === short.id ? 'added' : ''}`}
                      onClick={(e) => handleAddToBag(e, short)}
                    >
                      {addedId === short.id ? (
                        <>
                          <Check size={12} />
                          Added
                        </>
                      ) : (
                        'Add to Bag'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Video Masterclass & Dual Shelves Section ─── */}
        {masterclass.enabled !== false && (
          <section className="masterclass-section">
            <div className="masterclass-header">
              <div className="masterclass-badge">
                <Sparkles size={14} />
                <span>{masterclass.badgeText || 'IN-DEPTH VIDEO REVIEW & GUIDE'}</span>
              </div>
              <h2 className="masterclass-title">{masterclass.title || 'The Everyday Essentials Guide'}</h2>
              <p className="masterclass-subtitle">
                {masterclass.subtitle || 'Watch our complete 16:9 walkthrough testing top Picky finds across Tech, Kitchen, Fashion & Skincare with direct quick-add shelves.'}
              </p>
            </div>

            <div className="masterclass-layout">
              {/* Left Product Shelf (3 Items) */}
              <div className="masterclass-shelf left-shelf">
                {(masterclass.leftShelf || []).map((item) => (
                  <div key={item.id} className="shelf-card">
                    <img src={item.image} alt={item.title} className="shelf-card-thumb" />
                    <div className="shelf-card-details">
                      <h4 className="shelf-card-title">{item.title}</h4>
                      <p className="shelf-card-price">{item.priceFormatted || `₹${item.price}`}</p>
                      <button 
                        className={`shelf-card-btn ${addedId === item.id ? 'added' : ''}`}
                        onClick={(e) => handleAddToBag(e, item)}
                      >
                        {addedId === item.id ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          'Add to Bag'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Center 16:9 Video Player & Chapter Markers */}
              <div className="masterclass-player-wrapper">
                <div className="masterclass-player-top">
                  <div className="player-brand-pill">
                    <div className="player-logo-icon">P</div>
                    <span className="player-brand-title">{masterclass.title || 'The Everyday Essentials Guide'}</span>
                  </div>
                  <button className="player-more-btn" aria-label="Video options">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="masterclass-screen">
                  <img 
                    src={masterclass.videoImage || '/images/blog/masterclass_host.jpg'} 
                    alt={masterclass.title} 
                    className="masterclass-video-img" 
                  />

                  <button 
                    className="masterclass-play-center"
                    onClick={() => setIsPlayingMasterclass(!isPlayingMasterclass)}
                    aria-label="Play masterclass video"
                  >
                    {isPlayingMasterclass ? (
                      <Pause size={26} fill="#ffffff" stroke="none" />
                    ) : (
                      <Play size={26} fill="#ffffff" stroke="none" style={{ marginLeft: '3px' }} />
                    )}
                  </button>

                  {/* Video Controls Bar */}
                  <div className="masterclass-controls">
                    <div className="player-progress-bar">
                      <div className="player-progress-fill"></div>
                    </div>

                    <div className="player-buttons-row">
                      <div className="player-left-controls">
                        <button 
                          style={{ color: '#fff', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onClick={() => setIsPlayingMasterclass(!isPlayingMasterclass)}
                        >
                          {isPlayingMasterclass ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <Volume2 size={16} style={{ cursor: 'pointer' }} />
                        <span className="player-time">{masterclass.videoDuration || '5:00 / 8:40'}</span>
                      </div>

                      <div className="player-right-controls">
                        <Settings size={16} style={{ cursor: 'pointer' }} />
                        <Maximize2 size={16} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Chapter Markers Timeline */}
                <div className="masterclass-chapters">
                  <div className="chapter-dots-line">
                    {(masterclass.chapters || []).map((chap) => (
                      <span 
                        key={chap.id} 
                        className={`chapter-dot ${activeChapter === chap.id ? 'active' : ''}`}
                        onClick={() => setActiveChapter(chap.id)}
                        style={{ cursor: 'pointer' }}
                      ></span>
                    ))}
                  </div>
                  <div className="chapter-labels-row">
                    {(masterclass.chapters || []).map((chap) => (
                      <span 
                        key={chap.id} 
                        className={`chapter-label ${activeChapter === chap.id ? 'active' : ''}`}
                        onClick={() => setActiveChapter(chap.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {chap.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Product Shelf (3 Items) */}
              <div className="masterclass-shelf right-shelf">
                {(masterclass.rightShelf || []).map((item) => (
                  <div key={item.id} className="shelf-card">
                    <img src={item.image} alt={item.title} className="shelf-card-thumb" />
                    <div className="shelf-card-details">
                      <h4 className="shelf-card-title">{item.title}</h4>
                      <p className="shelf-card-price">{item.priceFormatted || `₹${item.price}`}</p>
                      <button 
                        className={`shelf-card-btn ${addedId === item.id ? 'added' : ''}`}
                        onClick={(e) => handleAddToBag(e, item)}
                      >
                        {addedId === item.id ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          'Add to Bag'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Shoppable Buying Guides ─── */}
        {buyingGuides.enabled !== false && (
          <section className="shoppable-guides-section">
            <div className="shoppable-guides-header">
              <h2 className="shoppable-guides-title">{buyingGuides.title || 'Shoppable Buying Guides'}</h2>
              <p className="shoppable-guides-subtitle">{buyingGuides.subtitle || 'High-resolution photos with interactive hotspots.'}</p>
            </div>

            <div className="shoppable-guides-grid">
              {(buyingGuides.items || []).map((guide) => (
                <div 
                  key={guide.id} 
                  className="shoppable-guide-card"
                  onClick={() => setActiveHotspot(null)}
                >
                  <img src={guide.image} alt={guide.title} className="shoppable-guide-img" />

                  {/* Interactive Hotspots with concentric glowing rings */}
                  {(guide.hotspots || []).map((hs) => (
                    <div 
                      key={hs.id} 
                      className={`guide-hotspot ${hs.positionClass || ''} ${activeHotspot === hs.id ? 'active' : ''}`}
                      style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(activeHotspot === hs.id ? null : hs.id);
                      }}
                    >
                      <button 
                        className="hotspot-trigger"
                        aria-label={`View ${hs.title}`}
                      >
                        <span className="hotspot-pulse-ring"></span>
                        <span className="hotspot-inner-dot"></span>
                      </button>

                      {/* Hotspot Floating Popover */}
                      <div className="hotspot-popover" onClick={(e) => e.stopPropagation()}>
                        <span className="hotspot-popover-category">{hs.category}</span>
                        <h4 className="hotspot-popover-title">{hs.title}</h4>
                        <div className="hotspot-popover-price">{hs.priceFormatted || `₹${hs.price}`}</div>
                        <button 
                          className={`hotspot-popover-btn ${addedId === hs.id ? 'added' : ''}`}
                          onClick={(e) => handleAddToBag(e, hs)}
                        >
                          {addedId === hs.id ? (
                            <>
                              <Check size={14} /> Added
                            </>
                          ) : (
                            'Add to Bag'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Bottom Title Overlay */}
                  <div className="shoppable-guide-title-overlay">
                    <h3 className="shoppable-guide-card-title">{guide.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Customer Video Reviews Section ─── */}
        {customerReviews.enabled !== false && (
          <section className="customer-reviews-section">
            <div className="customer-reviews-header">
              <h2 className="customer-reviews-title">{customerReviews.title || 'Customer Video Reviews'}</h2>
              <p className="customer-reviews-subtitle">
                {customerReviews.subtitle || 'Submitted by tech enthusiasts, home cooks, and fashion shoppers.'}
              </p>
            </div>

            <div className="customer-reviews-carousel">
              {(customerReviews.items || []).map((rev) => (
                <div 
                  key={rev.id} 
                  className="customer-review-card"
                  onClick={() => setActiveReviewModal(rev)}
                >
                  <div className="review-thumb-wrapper">
                    <img src={rev.image} alt={rev.category} className="review-thumb-img" />
                    <div className="review-play-btn">
                      <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>

                  <div className="review-meta-row">
                    <span className="review-category-name">{rev.category}</span>
                    <span className="review-duration">{rev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Final Community CTA Banner ─── */}
        {communityBanner.enabled !== false && (
          <section className="hp-final-cta-section" style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
            <div className="hp-final-cta-container">
              <div className="hp-final-cta-box">
                <span className="hp-final-cta-badge">
                  {communityBanner.badgeText || '✦ JOIN OUR COMMUNITY'}
                </span>
                <h2 className="hp-final-title">
                  {communityBanner.title || 'Connect With Us @picky.co.in'}
                </h2>
                <p className="hp-final-subtitle">
                  {communityBanner.subtitle || 'Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.'}
                </p>
                <div className="hp-final-cta-btn-group no-hover-fx">
                  <button
                    type="button"
                    className="hp-final-cta-btn no-hover-fx"
                    onClick={() => window.open(communityBanner.instagramLink || 'https://www.instagram.com/picky.co.in/', '_blank', 'noopener,noreferrer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Follow on Instagram</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    className="hp-final-cta-outline-btn no-hover-fx"
                    onClick={() => {
                      const wa = (communityBanner.whatsappNumber || '918300295721').replace(/\D/g, '');
                      window.open(`https://wa.me/${wa}?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.`, '_blank', 'noopener,noreferrer');
                    }}
                    aria-label="Join WhatsApp Group"
                    title="Join WhatsApp Group"
                  >
                    <svg className="hp-cta-wa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                    <span className="hp-cta-wa-label">
                      <span>Join WhatsApp Group</span>
                      <ArrowRight size={16} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shoppable Shorts Quick-Add Modal */}
        {activeShortModal && (
          <div className="shorts-modal-overlay" onClick={() => setActiveShortModal(null)}>
            <div className="shorts-modal-container" onClick={(e) => e.stopPropagation()}>
              <button 
                className="shorts-modal-close" 
                onClick={() => setActiveShortModal(null)}
                aria-label="Close short modal"
              >
                <X size={20} />
              </button>

              <img 
                src={activeShortModal.image} 
                alt={activeShortModal.title} 
                className="shorts-modal-media" 
              />

              <div className="shorts-modal-footer">
                <div className="shorts-modal-product-info">
                  <h4>{activeShortModal.title}</h4>
                  <p>{activeShortModal.priceFormatted || `₹${activeShortModal.price}`}</p>
                </div>
                <button 
                  className={`btn btn-primary ${addedId === activeShortModal.id ? 'added' : ''}`}
                  style={{ minWidth: '120px' }}
                  onClick={(e) => handleAddToBag(e, activeShortModal)}
                >
                  {addedId === activeShortModal.id ? '✓ Added' : 'Add to Bag'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Review Video Modal */}
        {activeReviewModal && (
          <div className="shorts-modal-overlay" onClick={() => setActiveReviewModal(null)}>
            <div className="shorts-modal-container" onClick={(e) => e.stopPropagation()}>
              <button 
                className="shorts-modal-close" 
                onClick={() => setActiveReviewModal(null)}
                aria-label="Close review modal"
              >
                <X size={20} />
              </button>

              <img 
                src={activeReviewModal.image} 
                alt={activeReviewModal.category} 
                className="shorts-modal-media" 
              />

              <div className="shorts-modal-footer">
                <div className="shorts-modal-product-info">
                  <h4>{activeReviewModal.category} Review</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                    {activeReviewModal.title} • Verified Customer ({activeReviewModal.author})
                  </p>
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ minWidth: '90px' }}
                  onClick={() => setActiveReviewModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

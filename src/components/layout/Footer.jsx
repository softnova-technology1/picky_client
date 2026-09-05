import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { PICKY_CATEGORIES } from '../../data/categoriesData';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="picky-footer-root" role="contentinfo">
      {/* ── 1. Compact Skyline & Product Hills Vector Canvas ─────────────── */}
      <div className="footer-skyline-canvas-wrap" aria-hidden="true">
        <svg
          className="footer-skyline-svg"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Front Hill Lighter Radiant Purple Gradient */}
            <linearGradient id="footerFrontHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a1478" />
              <stop offset="100%" stopColor="#380d5e" />
            </linearGradient>

            {/* Back Hill Gradient */}
            <linearGradient id="footerBackHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#350b57" />
              <stop offset="100%" stopColor="#24053e" />
            </linearGradient>

            {/* Product Accent Gradients (Unified Purple/Magenta Neon) */}
            <linearGradient id="sneakerAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>

            <linearGradient id="headphoneAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Silhouette Gradient (Harmonious Deep Purple) */}
            <linearGradient id="citySilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#581a8c" />
              <stop offset="100%" stopColor="#2c0747" />
            </linearGradient>
          </defs>

          {/* ── Layer 1: Background Silhouette City & Skyline Elements ── */}
          <g fill="url(#citySilGrad)" opacity="0.95">
            {/* Hot Air Balloon */}
            <g transform="translate(940, 10) scale(0.65)">
              <path d="M16 0 C24 0, 32 8, 30 20 C28 27, 20 34, 17 38 L15 38 C12 34, 4 27, 2 20 C0 8, 8 0, 16 0 Z" fill="#6b21a8" />
              <rect x="11" y="42" width="10" height="5" rx="1.5" fill="#4c1d95" />
            </g>

            {/* Left Skyline Towers */}
            <rect x="35" y="55" width="10" height="25" rx="1" />
            <rect x="50" y="45" width="14" height="35" rx="1" />
            <rect x="68" y="58" width="12" height="22" rx="1" />

            {/* Center Skyline Towers & Ferris Wheel */}
            <rect x="660" y="45" width="14" height="40" rx="1" />
            <polygon points="667,32 660,45 674,45" />
            <rect x="680" y="52" width="18" height="33" rx="1" />
            <rect x="702" y="38" width="16" height="47" rx="1" />
            <line x1="710" y1="26" x2="710" y2="38" stroke="#7e22ce" strokeWidth="2" />
            <rect x="722" y="48" width="12" height="37" rx="1" />
            <rect x="738" y="56" width="15" height="29" rx="1" />

            {/* Ferris Wheel */}
            <g transform="translate(775, 42) scale(0.7)">
              <circle cx="28" cy="28" r="26" stroke="#7e22ce" strokeWidth="2" fill="none" />
              <circle cx="28" cy="28" r="14" stroke="#7e22ce" strokeWidth="1.5" fill="none" />
              <circle cx="28" cy="28" r="4" fill="#a855f7" />
              <line x1="28" y1="2" x2="28" y2="54" stroke="#7e22ce" strokeWidth="1.2" />
              <line x1="2" y1="28" x2="54" y2="28" stroke="#7e22ce" strokeWidth="1.2" />
              <line x1="10" y1="10" x2="46" y2="46" stroke="#7e22ce" strokeWidth="1.2" />
              <line x1="10" y1="46" x2="46" y2="10" stroke="#7e22ce" strokeWidth="1.2" />
              <circle cx="28" cy="2" r="3" fill="#c084fc" />
              <circle cx="28" cy="54" r="3" fill="#c084fc" />
              <circle cx="2" cy="28" r="3" fill="#c084fc" />
              <circle cx="54" cy="28" r="3" fill="#c084fc" />
              <polygon points="28,28 14,60 42,60" fill="#581c87" />
            </g>

            {/* Right High-rises */}
            <rect x="840" y="48" width="15" height="40" rx="1" />
            <rect x="860" y="36" width="18" height="52" rx="1" />
            <polygon points="869,24 860,36 878,36" />
            <rect x="884" y="52" width="14" height="36" rx="1" />

            {/* Foliage Trees */}
            <circle cx="95" cy="62" r="11" />
            <circle cx="112" cy="58" r="14" />
            <circle cx="625" cy="65" r="13" />
            <circle cx="642" cy="60" r="16" />
            <circle cx="1020" cy="58" r="14" />
            <circle cx="1038" cy="52" r="18" />
            <circle cx="1370" cy="60" r="14" />
            <circle cx="1390" cy="54" r="18" />
          </g>

          {/* ── Layer 2: Back Rolling Hill Wave ── */}
          <path
            d="M0,75 Q280,35 640,65 T1440,55 L1440,120 L0,120 Z"
            fill="url(#footerBackHillGrad)"
          />

          {/* ── Layer 3: Front Rolling Hill Wave with Smooth Crests ── */}
          <path
            d="M0,55 Q240,22 480,55 T960,65 T1440,45 L1440,120 L0,120 Z"
            fill="url(#footerFrontHillGrad)"
          />

          {/* ── Layer 4: Products on Hills (Original Iconic Vectors) ── */}

          {/* Wireless ANC Headphones on Left Hill (x: 80, y: 15) */}
          <g transform="translate(80, 15) scale(0.6)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))">
            <path
              d="M18,65 C18,20 45,5 75,5 C105,5 132,20 132,65"
              fill="none"
              stroke="#260442"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M30,55 C30,26 50,14 75,14 C100,14 120,26 120,55"
              fill="none"
              stroke="url(#headphoneAccentGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g transform="translate(8, 52)">
              <rect x="0" y="0" width="22" height="36" rx="10" fill="#260442" />
              <rect x="2" y="2" width="18" height="32" rx="8" fill="url(#headphoneAccentGrad)" />
            </g>
            <g transform="translate(120, 52)">
              <rect x="0" y="0" width="22" height="36" rx="10" fill="#260442" />
              <rect x="2" y="2" width="18" height="32" rx="8" fill="url(#headphoneAccentGrad)" />
            </g>
          </g>

          {/* Signature Athletic Sneaker on Right Hill (x: 1180, y: 12) */}
          <g transform="translate(1180, 14) scale(0.55)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.45))">
            <path
              d="M12,78 C35,78 60,82 100,82 C145,82 175,76 195,68 C202,65 204,58 198,54 C185,46 160,45 142,42 C125,40 115,22 96,18 C85,16 75,20 68,26 L55,40 C45,45 32,50 18,52 C10,53 6,60 8,66 Z"
              fill="#260442"
            />
            <path
              d="M10,74 C35,74 65,77 102,77 C145,77 175,72 196,65 C198,63 197,60 193,58 C175,54 150,56 102,57 C65,57 32,56 12,62 C9,63 8,68 10,74 Z"
              fill="url(#sneakerAccentGrad)"
            />
            <path
              d="M38,62 C65,60 100,58 135,46 C155,38 168,42 182,48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* ── 2. Main Footer Body (Lighter Radiant Purple Gradient) ─────────── */}
      <div className="picky-footer-body">
        <div className="footer-container">
          <div className="footer-grid">
            {/* ── Col 1: Newsletter & VIP Club ── */}
            <div className="footer-col-newsletter">
              <h3 className="footer-heading">Picky's Newsletter</h3>
              <p className="footer-newsletter-text">
                Subscribe for private drops, flash sales & <strong>₹200 instant discount coupons</strong> directly to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <div className="footer-input-wrap">
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="footer-newsletter-input"
                    aria-label="Email for newsletter"
                  />
                </div>
                <button type="submit" className="footer-subscribe-btn">
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 size={15} /> Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe <Send size={13} />
                    </>
                  )}
                </button>
              </form>

              {/* Follow Picky */}
              <div className="footer-social-title">Follow Picky</div>
              <div className="footer-social-row">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-icon"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-icon"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-icon"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-icon"
                  title="Twitter / X"
                  aria-label="Twitter"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Col 2: User's Core Categories ── */}
            <div>
              <h4 className="footer-heading">Top Categories</h4>
              <ul className="footer-links-list">
                {PICKY_CATEGORIES.slice(0, 6).map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/categories/${cat.slug}`} className="footer-link">
                      <span>{cat.name}</span>
                      {cat.badge && <span className="footer-link-badge">{cat.badge}</span>}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="footer-link" style={{ color: '#c084fc', fontWeight: 700 }}>
                    <span>All 10 Categories</span> <ArrowRight size={12} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Col 3: Customer Care & Support ── */}
            <div>
              <h4 className="footer-heading">Customer Care</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/orders" className="footer-link">
                    <Truck size={13} style={{ color: '#c084fc' }} />
                    <span>Track Order (AWB)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    About Picky
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    Help Center & FAQs
                  </Link>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    <RotateCcw size={13} style={{ color: '#c084fc' }} />
                    <span>7-Day Easy Replacement</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    <Truck size={13} style={{ color: '#c084fc' }} />
                    <span>Express 24-48h Dispatch</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    <Headphones size={13} style={{ color: '#c084fc' }} />
                    <span>WhatsApp Order Support</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Col 4: Legal & Policies (Strictly NO COD) ── */}
            <div>
              <h4 className="footer-heading">Legal & Policies</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/terms" className="footer-link">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="footer-link">
                    Return & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="footer-link">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    <ShieldCheck size={13} style={{ color: '#4ade80' }} />
                    <span>100% Genuine Quality</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link" style={{ cursor: 'default' }}>
                    <Lock size={13} style={{ color: '#38bdf8' }} />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Col 5: Contact Softnova ── */}
            <div className="footer-col-contact">
              <h4 className="footer-heading">Contact Us</h4>
              <div className="footer-contact-item">
                <MapPin size={15} className="footer-contact-icon" />
                <div>
                  <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.84rem' }}>Softnova Hub India</strong>
                  <span>Victoria Tower, Anna Salai, Chennai, TN</span>
                </div>
              </div>

              <div className="footer-contact-item">
                <Phone size={15} className="footer-contact-icon" />
                <div>
                  <span>Toll-Free: <strong>1800-098-8300</strong></span>
                </div>
              </div>

              <div className="footer-contact-item">
                <Mail size={15} className="footer-contact-icon" />
                <div>
                  <span>care@pickystore.com</span>
                </div>
              </div>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-chip"
                title="Direct WhatsApp Support"
              >
                <span>💬</span>
                <span>Live WhatsApp Support</span>
              </a>
            </div>
          </div>

          {/* ── 3. Bottom Bar (Centered Copyright) ───── */}
          <div className="footer-bottom-bar">
            {/* Centered Copyright */}
            <p className="footer-copyright">
              © {new Date().getFullYear()} <strong>Picky</strong> Inc. Single-Vendor Quality Store. Handpicked Essentials Delivered Fast. Crafted by <strong>Softnova Technologies</strong>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

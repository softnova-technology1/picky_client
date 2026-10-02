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
  Info,
  HelpCircle,
  FileText,
  Shield,
  RefreshCw,
  Package,
  Zap,
  MessageSquare,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { PICKY_CATEGORIES } from '../../../data/categoriesData';

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
      {/* ── 1. Footer Skyline Banner (foo.png repeated in 2-column flex layout) ─────────────── */}
      <div className="footer-skyline-canvas-wrap" aria-hidden="true">
        <img
          src="/images/footer-final.png"
          alt="Footer Skyline Banner 1"
          className="footer-skyline-img"
        />
        <img
          src="/images/footer-final.png"
          alt="Footer Skyline Banner 2"
          className="footer-skyline-img"
        />
      </div>

      {/* ── 2. Main Footer Body (Color Matched Royal Purple Theme) ─────────── */}
      <div className="picky-footer-body">
        <div className="footer-container">
          <div className="footer-grid">

            {/* ── Col 1: Newsletter & Social VIP ── */}
            <div className="footer-col-newsletter">
              <div style={{ marginBottom: '0.85rem' }}>
                <img src="/images/logo.png" alt="Picky Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 className="footer-heading">Picky's Newsletter</h3>
              <p className="footer-newsletter-text">
                Subscribe for private drops, flash sales & <strong>₹200 instant discount coupons</strong> directly to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <div className="footer-input-wrap">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="footer-newsletter-input"
                    aria-label="Email for newsletter"
                  />
                </div>
                <button type="submit" className="footer-subscribe-btn">
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 size={16} /> Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe <Send size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Follow Picky */}
              <div className="footer-social-section">
                <span className="footer-social-title">Follow Picky</span>
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
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
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
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
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
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* ── Col 2: Core Categories ── */}
            <div className="footer-col">
              <h4 className="footer-heading">Top Categories</h4>
              <ul className="footer-links-list">
                {PICKY_CATEGORIES.slice(0, 6).map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/categories/${cat.slug}`} className="footer-link">
                      <Sparkles size={13} className="footer-icon-accent" />
                      <span>{cat.name}</span>
                      {cat.badge && <span className="footer-link-badge">{cat.badge}</span>}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/categories" className="footer-link footer-link-all">
                    <span>All 10 Categories</span> <ArrowRight size={13} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Col 3: Customer Care & Support ── */}
            <div className="footer-col">
              <h4 className="footer-heading">Customer Care</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/account?tab=orders" className="footer-link">
                    <Truck size={15} className="footer-icon-accent" />
                    <span>Track Order (AWB)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    <Info size={15} className="footer-icon-accent" />
                    <span>About Picky</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    <HelpCircle size={15} className="footer-icon-accent" />
                    <span>Help Center & FAQs</span>
                  </Link>
                </li>
                <li>
                  <span className="footer-link footer-link-static">
                    <RotateCcw size={15} className="footer-icon-accent" />
                    <span>7-Day Easy Replacement</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link footer-link-static">
                    <Zap size={15} className="footer-icon-accent" />
                    <span>Express 24-48h Dispatch</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link footer-link-static">
                    <MessageSquare size={15} className="footer-icon-accent" />
                    <span>WhatsApp Order Support</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Col 4: Legal & Policies ── */}
            <div className="footer-col">
              <h4 className="footer-heading">Legal & Policies</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/terms" className="footer-link">
                    <FileText size={15} className="footer-icon-accent" />
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="footer-link">
                    <Shield size={15} className="footer-icon-accent" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="footer-link">
                    <RefreshCw size={15} className="footer-icon-accent" />
                    <span>Return & Refund Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="footer-link">
                    <Package size={15} className="footer-icon-accent" />
                    <span>Shipping Policy</span>
                  </Link>
                </li>
                <li>
                  <span className="footer-link footer-link-static">
                    <ShieldCheck size={15} className="footer-icon-green" />
                    <span>100% Genuine Quality</span>
                  </span>
                </li>
                <li>
                  <span className="footer-link footer-link-static">
                    <Lock size={15} className="footer-icon-cyan" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* ── Col 5: Contact Us ── */}
            <div className="footer-col footer-col-contact">
              <h4 className="footer-heading">Contact Us</h4>

              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <div className="footer-contact-icon-bg">
                    <MapPin size={15} className="footer-contact-icon" />
                  </div>
                  <div>
                    <strong className="footer-contact-title">Softnova Hub India</strong>
                    <span className="footer-contact-sub">Victoria Tower, Anna Salai, Chennai, TN</span>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon-bg">
                    <Phone size={15} className="footer-contact-icon" />
                  </div>
                  <div>
                    <span className="footer-contact-sub">Toll-Free: <strong>1800-098-8300</strong></span>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="footer-contact-icon-bg">
                    <Mail size={15} className="footer-contact-icon" />
                  </div>
                  <div>
                    <span className="footer-contact-sub">care@pickystore.com</span>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-chip"
                title="Direct WhatsApp Support"
              >
                <span className="whatsapp-status-dot"></span>
                <span>Live WhatsApp Support</span>
              </a>
            </div>

          </div>

          {/* ── 3. Bottom Bar (Trust Badges & Copyright) ───── */}
          <div className="footer-bottom-bar">
            <div className="footer-trust-chips">
              <span className="trust-chip-item">
                <Lock size={13} className="trust-icon" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </span>
              <span className="trust-chip-item">
                <CreditCard size={13} className="trust-icon" />
                <span>Instant Payment via UPI, Cards & NetBanking</span>
              </span>
              <span className="trust-chip-item">
                <Zap size={13} className="trust-icon" />
                <span>Express Dispatch Across India</span>
              </span>
            </div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} <strong>Picky</strong> Inc. Single-Vendor Quality Store. Handpicked Essentials Delivered Fast. Crafted by <strong>Softnova Technologies</strong>.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}

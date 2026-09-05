import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="picky-footer">
      <div className="container">
        <div className="picky-footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo-wrap">
              <div className="footer-logo-disc">
                <span>P</span>
              </div>
              <div>
                <span className="footer-brand-name">Picky</span>
                <span className="footer-brand-tagline">Shop More. Live Better.</span>
              </div>
            </Link>
            <p className="footer-desc">
              Your destination for premium curated fashion and lifestyle essentials delivered to your doorstep.
            </p>
            <div className="footer-social-row">
              <a href="#instagram" title="Instagram" className="footer-social-btn ig">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#whatsapp" title="WhatsApp" className="footer-social-btn wa">
                <MessageCircle size={16} />
              </a>
              <a href="#youtube" title="YouTube" className="footer-social-btn yt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff" />
                </svg>
              </a>
              <a href="#facebook" title="Facebook" className="footer-social-btn fb">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Shop</h4>
            <div className="footer-link-list">
              <Link to="/products">All Products</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/categories/combo-packs">Offers</Link>
              <Link to="/products">New Arrivals</Link>
            </div>
          </div>

          {/* Support Column */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Support</h4>
            <div className="footer-link-list">
              <Link to="/orders">Track Order</Link>
              <Link to="/about">Returns</Link>
              <Link to="/contact">Shipping</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/contact#faqs">FAQs</Link>
            </div>
          </div>

          {/* Company Column */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Company</h4>
            <div className="footer-link-list">
              <Link to="/about">About Us</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} Picky. All rights reserved.</span>
          <span className="footer-bullet">•</span>
          <span>Crafted for happy shopping experiences</span>
        </div>
      </div>

      <style>{`
        .picky-footer {
          background: #ffffff;
          border-top: 1px solid #ede9fe;
          padding: 4rem 0 2rem;
          margin-top: auto;
          color: #64748b;
        }

        .picky-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3.5rem;
        }

        @media (max-width: 900px) {
          .picky-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-brand-col {
            grid-column: span 2;
          }
        }
        @media (max-width: 540px) {
          .picky-footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-brand-col {
            grid-column: span 1;
          }
        }

        .footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .footer-logo-disc {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 1.3rem;
        }

        .footer-brand-name {
          font-weight: 900;
          font-size: 1.3rem;
          color: #0f172a;
          display: block;
          line-height: 1.1;
        }

        .footer-brand-tagline {
          font-size: 0.65rem;
          font-weight: 700;
          color: #7c3aed;
          display: block;
        }

        .footer-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.6;
          max-width: 320px;
          margin: 0 0 1.5rem;
        }

        .footer-social-row {
          display: flex;
          gap: 0.65rem;
        }

        .footer-social-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .footer-social-btn:hover {
          transform: translateY(-2px);
        }
        .footer-social-btn.ig { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
        .footer-social-btn.wa { background: #22c55e; }
        .footer-social-btn.yt { background: #ef4444; }
        .footer-social-btn.fb { background: #2563eb; }

        .footer-heading {
          color: #0f172a;
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 1.25rem;
        }

        .footer-link-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-link-list a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .footer-link-list a:hover {
          color: #7c3aed;
        }

        .footer-bottom-bar {
          border-top: 1px solid #ede9fe;
          padding-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-size: 0.82rem;
          color: #94a3b8;
          flex-wrap: wrap;
        }
        .footer-bullet {
          color: #c4b5fd;
        }
      `}</style>
    </footer>
  );
}

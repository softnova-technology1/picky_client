import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  FileText,
  UserCheck,
  Store,
  Key,
  CreditCard,
  Truck,
  RotateCcw,
  Tag,
  ShieldAlert,
  Scale,
  Mail,
  Share2,
  Calendar,
  Check
} from 'lucide-react';
import '../../styles/legal.css';

const TERMS_SECTIONS = [
  { id: 'welcome', label: 'Introduction', icon: FileText },
  { id: 'eligibility', label: 'User Eligibility & Rights', icon: UserCheck },
  { id: 'vendor-model', label: 'Single-Vendor Model', icon: Store },
  { id: 'account', label: 'Account Management', icon: Key },
  { id: 'pricing', label: 'Payment & Pricing Policy', icon: CreditCard },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'returns', label: 'Returns & Refund Policy', icon: RotateCcw },
  { id: 'coupons', label: 'Discount & Coupon Terms', icon: Tag },
  { id: 'intellectual-property', label: 'Intellectual Property Rights', icon: ShieldAlert },
  { id: 'liability', label: 'Governing Law & Liability', icon: Scale },
  { id: 'contact', label: 'Contact Information', icon: Mail },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of TERMS_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <PageWrapper>
      <div className="legal-page-wrapper">
        {/* ── 1. Zyra Dark Executive Hero Header ── */}
        <section className="legal-hero-wrapper">
          <div className="legal-hero-container">
            <h1 className="legal-hero-title">Terms of Service</h1>
            <p className="legal-hero-subtitle">
              Understanding Your Rights, Obligations and Platform Policies
            </p>

            <div className="legal-hero-meta">
              <span className="legal-meta-item">
                <Calendar size={14} />
                <span>Last Updated: September 07, 2026</span>
              </span>
              <span>•</span>
              <button type="button" className="legal-share-btn" onClick={handleShare}>
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. Two-Column Layout (TOC + Content) ── */}
        <div className="legal-body-container">
          <div className="legal-layout-grid">
            {/* Left Sticky Table of Contents Sidebar */}
            <aside className="legal-sidebar">
              <h2 className="toc-header">Table of contents</h2>
              <nav className="toc-nav">
                <ul className="toc-nav-list">
                  {TERMS_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          className={`toc-item-btn ${isActive ? 'active' : ''}`}
                          onClick={() => scrollToSection(section.id)}
                        >
                          <Icon size={18} className="toc-icon" />
                          <span className="toc-label">{section.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Right Main Content Panel */}
            <main className="legal-main-content">
              {/* SECTION: WELCOME */}
              <section id="welcome" className="legal-section">
                <h2 className="legal-section-title">Welcome to our website!</h2>
                <p className="legal-paragraph">
                  We're thrilled to have you here and hope you find our products and services useful.
                </p>
                <p className="legal-paragraph">
                  In these Terms of Use, any use of the words <strong>"you"</strong>, <strong>"yours"</strong> or similar expressions shall mean any customer or visitor of this website and app. Terms such as <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong> or similar expressions shall mean Picky E-Commerce Solutions Private Limited.
                </p>
                <p className="legal-paragraph">
                  This website, <a href="https://www.picky.in" className="legal-link" target="_blank" rel="noreferrer">www.picky.in</a> (the <strong>"Website"</strong>), and the Picky mobile application (the <strong>"App"</strong>) are operated by Picky E-Commerce Solutions Private Limited, a registered retail enterprise headquartered at Softnova Tech Park, Indiranagar, Bengaluru 560038.
                </p>
                <p className="legal-paragraph">
                  Please read this page carefully as it sets out the terms that apply to your use of the Website and App, and any part of their content. By accessing or using our Services, you confirm that you accept these Terms of Service and agree to comply with them. If you do not agree to these Terms, please refrain from using the Website and App.
                </p>
              </section>

              {/* SECTION: ELIGIBILITY */}
              <section id="eligibility" className="legal-section">
                <h2 className="legal-section-title">User Eligibility and Responsibilities</h2>
                <p className="legal-paragraph">
                  Our website and services are intended for individuals who are at least 18 years old. By using our website or services, you represent and warrant that you are legally capable of entering into binding contracts.
                </p>
                <p className="legal-paragraph">
                  If you are under 18, you may need your parent or guardian to assist you with your use of the Website and App and with understanding these Terms and Conditions. If anything is unclear, please ask your parent/guardian to explain or contact our compliance desk at <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a>.
                </p>
                <p className="legal-paragraph">
                  If you are aged 13 or under, you cannot register for a Picky customer account without the explicit consent and verified supervision of your parent or legal guardian.
                </p>
              </section>

              {/* SECTION: VENDOR MODEL */}
              <section id="vendor-model" className="legal-section">
                <h2 className="legal-section-title">Single-Vendor Operating Model & Catalog Guarantee</h2>
                <p className="legal-paragraph">
                  Unlike multi-vendor online marketplaces, Picky operates strictly as a single-vendor retail store. Every item listed on our Website or App is physically stocked, quality-inspected, and dispatched directly from our regional fulfillment warehouse.
                </p>
                <div className="legal-highlight-box">
                  <strong>Single-Vendor Quality Guarantee:</strong> We do not host third-party sellers. 100% of products undergo physical multi-point stress testing and serial barcode verification before being carefully packed for shipment.
                </div>
              </section>

              {/* SECTION: ACCOUNT */}
              <section id="account" className="legal-section">
                <h2 className="legal-section-title">Account Creation and Management</h2>
                <p className="legal-paragraph">
                  To use our services, you may be required to create an account. You must provide accurate, complete, and updated information when creating your profile.
                </p>
                <p className="legal-paragraph">
                  You are responsible for maintaining the confidentiality of your account login information, including your password and OTPs. You are also responsible for any activities or transactions that occur under your account credentials.
                </p>
                <p className="legal-paragraph">
                  You may not use our website or services for any unlawful purpose or in a way that violates any applicable local or international laws. We reserve the right to suspend or terminate your account at any time for policy breaches.
                </p>
              </section>

              {/* SECTION: PRICING */}
              <section id="pricing" className="legal-section">
                <h2 className="legal-section-title">Product Prices, Payments & Offers</h2>
                <p className="legal-paragraph">
                  All prices listed on Picky are in Indian Rupees (INR) and include applicable Goods and Services Tax (GST) unless explicitly stated otherwise. We reserve the right to revise prices, product specifications, and availability without prior notice.
                </p>
                <ul className="legal-list">
                  <li><strong>Cash on Delivery (COD):</strong> COD is available for select pincodes up to maximum order values specified during checkout.</li>
                  <li><strong>Online Payments:</strong> We accept Credit/Debit Cards, Net Banking, UPI, and Digital Wallets via secure PCI-DSS compliant payment gateways.</li>
                </ul>
              </section>

              {/* SECTION: SHIPPING */}
              <section id="shipping" className="legal-section">
                <h2 className="legal-section-title">Shipping, Dispatch & Live WhatsApp Tracking</h2>
                <p className="legal-paragraph">
                  Orders are processed and dispatched within 24 to 48 business hours from our central fulfillment center. Priority packed items ship with trusted tier-1 logistics partners across all serviceable pincodes in India.
                </p>
                <p className="legal-paragraph">
                  Once dispatched, automated live dispatch notifications and AWB courier tracking links will be sent directly to your registered WhatsApp number and email for transparent real-time updates.
                </p>
              </section>

              {/* SECTION: RETURNS */}
              <section id="returns" className="legal-section">
                <h2 className="legal-section-title">Warranties, Returns & Refund Policy</h2>
                <p className="legal-paragraph">
                  We stand firmly behind every item we ship. We offer a hassle-free 7-day return and replacement policy for defective, damaged, or mismatched items.
                </p>
                <p className="legal-paragraph">
                  Return requests can be initiated directly under your Customer Account portal. Refunds are credited to the original payment source or via bank transfer for COD orders upon QA verification at our warehouse.
                </p>
              </section>

              {/* SECTION: COUPONS */}
              <section id="coupons" className="legal-section">
                <h2 className="legal-section-title">Promotional Coupons & Discount Policies</h2>
                <p className="legal-paragraph">
                  Promotional coupon codes (such as PICKY10 or WELCOME100) are valid for a single order per user and are subject to minimum cart order thresholds.
                </p>
                <p className="legal-paragraph">
                  Coupon discounts cannot be combined with other ongoing site-wide mega sales or clearance deals unless explicitly stated in the promotional campaign terms.
                </p>
              </section>

              {/* SECTION: INTELLECTUAL PROPERTY */}
              <section id="intellectual-property" className="legal-section">
                <h2 className="legal-section-title">Intellectual Property Rights</h2>
                <p className="legal-paragraph">
                  All content on our website, including text, graphics, logos, images, UI design systems, and software code, is the exclusive intellectual property of Picky E-Commerce Solutions Private Limited or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="legal-paragraph">
                  Unauthorized copying, reproduction, extraction, or commercial redistribution of any site materials is strictly prohibited without prior written permission.
                </p>
              </section>

              {/* SECTION: LIABILITY */}
              <section id="liability" className="legal-section">
                <h2 className="legal-section-title">Governing Law and Dispute Resolution</h2>
                <p className="legal-paragraph">
                  These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of India.
                </p>
                <p className="legal-paragraph">
                  Any disputes or claims arising out of or in connection with these Terms or your use of the website shall be subject to the exclusive jurisdiction of the competent courts located in Bengaluru, Karnataka, India.
                </p>
              </section>

              {/* SECTION: CONTACT */}
              <section id="contact" className="legal-section">
                <h2 className="legal-section-title">Contact Information</h2>
                <p className="legal-paragraph">
                  If you have any questions, clarifications, or feedback regarding these Terms of Service, please reach out to our legal compliance and support team:
                </p>
                <div className="legal-contact-card">
                  <h3 className="legal-contact-title">Picky Legal & Customer Compliance Desk</h3>
                  <p className="legal-contact-text">Email: <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a></p>
                  <p className="legal-contact-text">Phone: +91 80 4920 8888 (Mon - Sat, 10:00 AM - 7:00 PM IST)</p>
                  <p className="legal-contact-text">Address: Softnova Tech Park, Indiranagar, Bengaluru, Karnataka 560038</p>
                </div>
              </section>
            </main>
          </div>
        </div>

        {/* Share Toast */}
        {showToast && (
          <div className="legal-toast">
            <Check size={16} />
            <span>Page link copied to clipboard!</span>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

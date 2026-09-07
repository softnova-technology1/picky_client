import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { Share2, Search, Calendar, ShieldCheck, Check } from 'lucide-react';
import '../styles/legal.css';

export default function Terms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <PageWrapper>
      {/* ── 1. Full-Width Hero Header with Magenta Geometric Ribbons ── */}
      <section className="legal-hero-wrapper">
        <div className="legal-hero-ribbon-1" />
        <div className="legal-hero-ribbon-2" />
        <div className="legal-hero-ribbon-3" />

        <div className="legal-hero-container">
          <h1 className="legal-hero-title">Terms and Conditions</h1>

          <button type="button" className="legal-share-btn" onClick={handleShare}>
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </section>

      {/* ── 2. Main Legal Content Container ──────────────────────────── */}
      <div className="legal-body-container">
        {/* Top Vibrant Magenta Accent Bar matching reference image */}
        <div className="legal-accent-bar" />

        {/* Quick Tools & Metadata Bar */}
        <div className="legal-tools-bar">
          <div className="legal-update-date">
            <Calendar size={15} style={{ color: '#e11d48' }} />
            <span>Last Updated: September 07, 2026</span>
          </div>

          <div className="legal-search-box">
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              className="legal-search-input"
              placeholder="Search terms (e.g. refund, shipping)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Document Body Text matching exact tone & layout of reference */}
        <div className="legal-content">
          <p className="legal-paragraph">
            In these Terms of Use, any use of the words <strong style={{ color: '#0f172a' }}>"you"</strong>, <strong style={{ color: '#0f172a' }}>"yours"</strong> or similar expressions shall mean any user of this website and the app whatsoever. Terms such as <strong style={{ color: '#0f172a' }}>"we"</strong>, <strong style={{ color: '#0f172a' }}>"us"</strong>, <strong style={{ color: '#0f172a' }}>"our"</strong> or similar expressions shall mean Picky E-Commerce Solutions Private Limited.
          </p>

          <p className="legal-paragraph">
            This website, <a href="https://www.picky.in" className="legal-link" target="_blank" rel="noreferrer">www.picky.in</a> (the <strong style={{ color: '#0f172a' }}>"Website"</strong>), and the Picky mobile application (the <strong style={{ color: '#0f172a' }}>"App"</strong>) are operated by Picky E-Commerce Solutions Private Limited, a company registered in India with registered headquarters at Softnova Tech Park, Indiranagar, Bengaluru 560038.
          </p>

          <p className="legal-paragraph">
            Please read this page carefully as it sets out the terms that apply to your use of the Website and the App, and any part of their content and all materials appearing on them. By using the Website or App, you confirm that you accept these Terms of Use and you agree to comply with them. If you do not agree to these Terms of Use, please refrain from using the Website and App.
          </p>

          {/* SECTION: UNDER 18 */}
          <h2 className="legal-section-heading">YOUR USE OF THE WEBSITE IF YOU ARE UNDER 18</h2>

          <p className="legal-paragraph">
            If you are under 18, you may need your parent/guardian to help you with your use of the Website and the App and with reading these Terms and Conditions. If anything is hard to understand, please ask your parent/guardian to explain. If you still have any questions, you or your parent/guardian can contact us at: <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a>.
          </p>

          <p className="legal-paragraph">
            If you are aged 13 or under, you cannot register for a Picky customer account (<strong style={{ color: '#0f172a' }}>"Account"</strong>) without the explicit consent and supervision of your parent or legal guardian.
          </p>

          {/* SECTION 1 */}
          <h2 className="legal-section-heading">1. INTRODUCTION AND ACCEPTANCE OF TERMS</h2>
          <p className="legal-paragraph">
            These Terms and Conditions constitute a legally binding agreement made between you and Picky concerning your access to and use of our e-commerce platform. By accessing the site or placing an order, you warrant that you are legally capable of entering into binding contracts.
          </p>

          {/* SECTION 2 */}
          <h2 className="legal-section-heading">2. SINGLE-VENDOR OPERATING MODEL & CATALOG GUARANTEE</h2>
          <p className="legal-paragraph">
            Unlike multi-vendor marketplaces, Picky operates strictly as a single-vendor retail store. Every item listed on our Website or App is physically stocked, quality-checked, and dispatched from our dedicated fulfillment warehouse.
          </p>

          <div className="legal-highlight-box">
            <strong>Single-Vendor Quality Guarantee:</strong> We do not host third-party sellers. 100% of products undergo physical stress testing and serial verification before being packed for shipment.
          </div>

          {/* SECTION 3 */}
          <h2 className="legal-section-heading">3. ACCOUNT REGISTRATION, SECURITY & PASSWORDS</h2>
          <p className="legal-paragraph">
            When creating an Account on Picky, you must provide accurate, current, and complete information. You are solely responsible for safeguarding the password that you use to access your account and for any activities or actions under your account password.
          </p>

          {/* SECTION 4 */}
          <h2 className="legal-section-heading">4. PRODUCT PRICES, PAYMENTS & OFFERS</h2>
          <p className="legal-paragraph">
            All prices listed on Picky are in Indian Rupees (INR) and include applicable Goods and Services Tax (GST) unless specified otherwise. We reserve the right to revise prices, product specifications, and availability without prior notice.
          </p>
          <ul className="legal-list">
            <li><strong>Cash on Delivery (COD):</strong> COD is available for select pincodes up to maximum order values specified at checkout.</li>
            <li><strong>Online Payments:</strong> We accept Credit/Debit Cards, Net Banking, UPI, and Digital Wallets via secure PCI-DSS compliant payment gateways.</li>
          </ul>

          {/* SECTION 5 */}
          <h2 className="legal-section-heading">5. SHIPPING, DISPATCH & LIVE WHATSAPP TRACKING</h2>
          <p className="legal-paragraph">
            Orders are processed and dispatched within 24 to 48 business hours from our central warehouse. Once dispatched, automated live dispatch notifications and AWB tracking links will be sent directly to your registered WhatsApp number and email.
          </p>

          {/* SECTION 6 */}
          <h2 className="legal-section-heading">6. RETURNS, REFUNDS & ORDER CANCELLATIONS</h2>
          <p className="legal-paragraph">
            We offer a hassle-free 7-day return policy for defective or damaged items. Return requests can be initiated directly under your Customer Account portal. Refunds are credited to the original payment source or via bank transfer for COD orders upon inspection.
          </p>

          {/* SECTION 7 */}
          <h2 className="legal-section-heading">7. PROMOTIONAL COUPONS & DISCOUNT POLICIES</h2>
          <p className="legal-paragraph">
            Promotional coupon codes (such as PICKY10 or WELCOME100) are valid for a single order per user and are subject to minimum order thresholds. Coupon discounts cannot be combined with other ongoing site-wide sale promotions.
          </p>

          {/* SECTION 8 */}
          <h2 className="legal-section-heading">8. INTELLECTUAL PROPERTY & BRAND RIGHTS</h2>
          <p className="legal-paragraph">
            The Picky name, logo, graphics, user interface designs, visual assets, and software code are the exclusive intellectual property of Picky E-Commerce Solutions Private Limited. Unauthorized copying or redistribution is strictly prohibited.
          </p>

          {/* SECTION 9 */}
          <h2 className="legal-section-heading">9. LIMITATION OF LIABILITY & GOVERNING LAW</h2>
          <p className="legal-paragraph">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
          </p>

          {/* SECTION 10 */}
          <h2 className="legal-section-heading">10. CONTACT INFORMATION</h2>
          <p className="legal-paragraph">
            If you have any questions or feedback regarding these Terms and Conditions, please reach out to our legal compliance team:
          </p>
          <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Picky Support & Legal Desk</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Email: <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a></p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Phone: +91 80 4920 8888 (Mon-Sat 10:00 AM - 7:00 PM IST)</p>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showToast && (
        <div className="legal-toast">
          <Check size={16} style={{ color: '#10b981', display: 'inline', marginRight: '6px' }} />
          <span>Page link copied to clipboard!</span>
        </div>
      )}
    </PageWrapper>
  );
}

import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import { Share2, Search, Calendar, ShieldCheck, Check, Lock } from 'lucide-react';
import '../../styles/legal.css';
import styles from './Privacy.module.css';

export default function Privacy() {
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
      {/* ── 1. Full-Width Hero Header with Purple Geometric Ribbons ── */}
      <section className="legal-hero-wrapper">
        <div className="legal-hero-ribbon-1" />
        <div className="legal-hero-ribbon-2" />
        <div className="legal-hero-ribbon-3" />

        <div className="legal-hero-container">
          <h1 className="legal-hero-title">Privacy Policy</h1>

          <button type="button" className="legal-share-btn" onClick={handleShare}>
            <Share2 size={15} />
            <span>Share</span>
          </button>
        </div>
      </section>

      {/* ── 2. Main Legal Content Container ──────────────────────────── */}
      <div className="legal-body-container">
        {/* Top Purple Accent Line Bar matching Terms design */}
        <div className="legal-accent-bar" />

        {/* Quick Tools & Metadata Bar */}
        <div className="legal-tools-bar">
          <div className="legal-update-date">
            <Calendar size={15} className={styles['calendar-icon']} />
            <span>Last Updated: September 07, 2026</span>
          </div>

          <div className="legal-search-box">
            <Search size={14} className={styles['search-icon']} />
            <input
              type="text"
              className="legal-search-input"
              placeholder="Search policy (e.g. cookies, data)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Document Body Text matching exact layout of Terms page */}
        <div className="legal-content">
          <p className="legal-paragraph">
            At Picky E-Commerce Solutions Private Limited (<strong className={styles['strong-dark']}>"Picky"</strong>, <strong className={styles['strong-dark']}>"we"</strong>, <strong className={styles['strong-dark']}>"us"</strong>, or <strong className={styles['strong-dark']}>"our"</strong>), we hold your privacy in the highest regard. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website <a href="https://www.picky.in" className="legal-link" target="_blank" rel="noreferrer">www.picky.in</a> or use our mobile shopping application.
          </p>

          <p className="legal-paragraph">
            Please read this policy carefully. By accessing or shopping on Picky, you consent to the collection and use of your information in accordance with this Privacy Policy and applicable data protection laws of India.
          </p>

          <div className="legal-highlight-box">
            <strong>Data Security Promise:</strong> Picky operates strictly as a single-vendor store. We never rent, trade, or sell your personal information or mobile number to third-party brokers or advertisers.
          </div>

          {/* SECTION 1 */}
          <h2 className="legal-section-heading">1. INFORMATION WE COLLECT</h2>
          <p className="legal-paragraph">
            We collect personal information that you voluntarily provide to us when registering an account, placing an order, subscribing to newsletters, or contacting customer support.
          </p>
          <ul className="legal-list">
            <li><strong>Personal Contact Data:</strong> Full Name, Email Address, Phone/Mobile Number, Delivery Address, Pincode, and Landmark.</li>
            <li><strong>Authentication Data:</strong> Mobile OTP verification codes and encrypted password credentials.</li>
            <li><strong>Transactional History:</strong> Details of orders placed, payment status, AWB shipment tracking numbers, and customer service inquiries.</li>
            <li><strong>Technical Device Data:</strong> IP address, browser type, device identifiers, operating system, and session cookies.</li>
          </ul>

          {/* SECTION 2 */}
          <h2 className="legal-section-heading">2. WHATSAPP & SMS TRANSACTIONAL COMMUNICATIONS</h2>
          <p className="legal-paragraph">
            To provide an efficient shopping experience, Picky uses automated transactional WhatsApp & SMS notifications. By providing your phone number during checkout or login, you consent to receiving:
          </p>
          <ul className="legal-list">
            <li>Instant One-Time Passwords (OTP) for secure login and checkout authorization.</li>
            <li>Real-time order dispatch notifications and live AWB courier tracking links.</li>
            <li>Delivery status updates and Cash on Delivery (COD) verification alerts.</li>
          </ul>

          {/* SECTION 3 */}
          <h2 className="legal-section-heading">3. HOW WE USE YOUR PERSONAL INFORMATION</h2>
          <p className="legal-paragraph">
            We utilize the collected information strictly for legitimate operational purposes:
          </p>
          <ul className="legal-list">
            <li>To process, fulfill, and dispatch your product orders directly from our central warehouse.</li>
            <li>To communicate real-time delivery status updates via WhatsApp and Email.</li>
            <li>To handle returns, refunds, and customer care requests promptly.</li>
            <li>To detect, prevent, and address fraudulent transactions or security vulnerabilities.</li>
          </ul>

          {/* SECTION 4 */}
          <h2 className="legal-section-heading">4. SINGLE-VENDOR DATA PROTECTION & WAREHOUSE DISPATCH</h2>
          <p className="legal-paragraph">
            Because Picky is a single-vendor direct store, your order details are managed exclusively by our internal warehouse team. Unlike open marketplaces, your phone number and address are never broadcasted to external third-party sellers.
          </p>

          {/* SECTION 5 */}
          <h2 className="legal-section-heading">5. COOKIES & TRACKING TECHNOLOGIES</h2>
          <p className="legal-paragraph">
            We use essential cookies and web analytics to enhance your browsing session, remember your shopping cart items, and optimize site performance. You may disable cookies through your browser settings, though certain interactive features of the store may become unavailable.
          </p>

          {/* SECTION 6 */}
          <h2 className="legal-section-heading">6. THIRD-PARTY PAYMENT GATEWAY SECURITY</h2>
          <p className="legal-paragraph">
            All online financial transactions are processed through PCI-DSS compliant, bank-grade encrypted payment gateways (such as Razorpay / Cashfree). Picky does not store or process your complete credit card details or net banking credentials on our servers.
          </p>

          {/* SECTION 7 */}
          <h2 className="legal-section-heading">7. DATA RETENTION & YOUR PRIVACY RIGHTS</h2>
          <p className="legal-paragraph">
            We retain your personal data for as long as necessary to fulfill orders and comply with statutory tax and legal obligations. You have the right to request access to, correction of, or deletion of your customer account profile at any time by contacting our support team.
          </p>

          {/* SECTION 8 */}
          <h2 className="legal-section-heading">8. CHILDREN'S PRIVACY PROTECTION</h2>
          <p className="legal-paragraph">
            Picky does not knowingly solicit or collect personal information from children under 13 years of age. If a parent or guardian becomes aware that their child has provided us with personal information without consent, please contact us immediately for account deletion.
          </p>

          {/* SECTION 9 */}
          <h2 className="legal-section-heading">9. UPDATES TO THIS PRIVACY POLICY</h2>
          <p className="legal-paragraph">
            We may update this Privacy Policy from time to time to reflect changes in our operational procedures or legal requirements. The updated policy will be posted on this page with a revised "Last Updated" date.
          </p>

          {/* SECTION 10 */}
          <h2 className="legal-section-heading">10. CONTACT US & DATA PROTECTION OFFICER</h2>
          <p className="legal-paragraph">
            If you have questions, concerns, or requests regarding this Privacy Policy or data handling practices, please contact our Data Protection Office:
          </p>
          <div className={styles['privacy-box']}>
            <p className={styles['privacy-title']}>Picky Data Privacy Desk</p>
            <p className={styles['privacy-text']}>Email: <a href="mailto:privacy@picky.in" className="legal-link">privacy@picky.in</a> or <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a></p>
            <p className={styles['privacy-text']}>Address: Softnova Tech Park, Indiranagar, Bengaluru, KA 560038</p>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showToast && (
        <div className="legal-toast">
          <Check size={16} className={styles['toast-icon']} />
          <span>Privacy Policy link copied to clipboard!</span>
        </div>
      )}
    </PageWrapper>
  );
}

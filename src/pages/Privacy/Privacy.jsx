import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  FileText,
  Database,
  MessageSquare,
  Activity,
  ShieldCheck,
  Cookie,
  Lock,
  UserCheck,
  Users,
  RefreshCw,
  Mail,
  Share2,
  Calendar,
  Check
} from 'lucide-react';
import '../../styles/legal.css';

const PRIVACY_SECTIONS = [
  { id: 'intro', label: 'Privacy Commitment', icon: FileText },
  { id: 'data-collection', label: 'Information We Collect', icon: Database },
  { id: 'communications', label: 'WhatsApp & SMS Alerts', icon: MessageSquare },
  { id: 'usage', label: 'How We Use Your Data', icon: Activity },
  { id: 'single-vendor', label: 'Single-Vendor Security', icon: ShieldCheck },
  { id: 'cookies', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'payments', label: 'Payment Gateway Security', icon: Lock },
  { id: 'rights', label: 'Data Retention & Rights', icon: UserCheck },
  { id: 'children', label: "Children's Privacy", icon: Users },
  { id: 'updates', label: 'Policy Updates', icon: RefreshCw },
  { id: 'contact', label: 'Data Protection Officer', icon: Mail },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('intro');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of PRIVACY_SECTIONS) {
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
            <h1 className="legal-hero-title">Privacy Policy</h1>
            <p className="legal-hero-subtitle">
              Understanding How We Safeguard, Process, and Respect Your Personal Data
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
                  {PRIVACY_SECTIONS.map((section) => {
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
              {/* SECTION: INTRO */}
              <section id="intro" className="legal-section">
                <h2 className="legal-section-title">Privacy Commitment & Scope</h2>
                <p className="legal-paragraph">
                  At Picky E-Commerce Solutions Private Limited (<strong>"Picky"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), we hold your personal privacy in the highest regard. This Privacy Policy sets out how we collect, handle, protect, and process your personal data when you visit our website <a href="https://www.picky.in" className="legal-link" target="_blank" rel="noreferrer">www.picky.in</a> or use our mobile applications.
                </p>
                <p className="legal-paragraph">
                  Please read this privacy policy carefully. By accessing or placing an order through Picky, you acknowledge and consent to the collection and use of your information in accordance with this Privacy Policy and applicable data protection laws of India.
                </p>
                <div className="legal-highlight-box">
                  <strong>Zero Third-Party Brokerage Guarantee:</strong> Picky operates strictly as a verified single-vendor direct store. We never rent, monetize, or sell your personal details or mobile phone numbers to external marketing brokers or third-party advertisers.
                </div>
              </section>

              {/* SECTION: COLLECTION */}
              <section id="data-collection" className="legal-section">
                <h2 className="legal-section-title">Information We Collect</h2>
                <p className="legal-paragraph">
                  We collect personal information that you voluntarily provide to us when you register a customer account, purchase products, sign up for notifications, or interact with our support desk.
                </p>
                <ul className="legal-list">
                  <li><strong>Personal Contact Data:</strong> Full Name, Email Address, Primary Phone/Mobile Number, Delivery Address, Pincode, City, State, and Landmark.</li>
                  <li><strong>Authentication Information:</strong> Secure Mobile OTP verification tokens and encrypted password hashes.</li>
                  <li><strong>Transactional History:</strong> Details of orders placed, payment status, AWB courier tracking identifiers, and customer service history.</li>
                  <li><strong>Technical Device Telemetry:</strong> IP address, device model, browser type, operating system, and anonymous session cookies.</li>
                </ul>
              </section>

              {/* SECTION: COMMUNICATIONS */}
              <section id="communications" className="legal-section">
                <h2 className="legal-section-title">WhatsApp & SMS Transactional Communications</h2>
                <p className="legal-paragraph">
                  To provide an efficient and transparent retail shopping experience, Picky uses automated transactional WhatsApp and SMS notifications. By entering your phone number at checkout or login, you consent to receiving:
                </p>
                <ul className="legal-list">
                  <li>Instant One-Time Passwords (OTP) for secure login and payment authorization.</li>
                  <li>Live order dispatch confirmation, courier assignment, and active AWB tracking links.</li>
                  <li>Out-for-delivery alerts and Cash on Delivery (COD) verification notifications.</li>
                </ul>
              </section>

              {/* SECTION: USAGE */}
              <section id="usage" className="legal-section">
                <h2 className="legal-section-title">How We Use Your Personal Information</h2>
                <p className="legal-paragraph">
                  We utilize your collected personal data strictly for legitimate operational purposes:
                </p>
                <ul className="legal-list">
                  <li>To verify, process, pack, and dispatch your product orders directly from our regional warehouse.</li>
                  <li>To provide transparent, real-time shipment updates via WhatsApp, SMS, and Email.</li>
                  <li>To process returns, exchanges, and instant bank or source refunds promptly.</li>
                  <li>To detect, prevent, and mitigate fraudulent transactions, unauthorized account access, or security threats.</li>
                </ul>
              </section>

              {/* SECTION: SINGLE VENDOR */}
              <section id="single-vendor" className="legal-section">
                <h2 className="legal-section-title">Single-Vendor Data Security Guarantee</h2>
                <p className="legal-paragraph">
                  Because Picky is a direct single-vendor brand rather than an open marketplace, your shipping address and personal contact details are accessible exclusively by our verified warehouse dispatch team and dedicated courier partners.
                </p>
                <p className="legal-paragraph">
                  Your personal phone number is never exposed or distributed to unvetted third-party merchants or marketing syndicates.
                </p>
              </section>

              {/* SECTION: COOKIES */}
              <section id="cookies" className="legal-section">
                <h2 className="legal-section-title">Cookies & Tracking Technologies</h2>
                <p className="legal-paragraph">
                  We use strictly necessary cookies, security tokens, and performance analytics to keep your cart active, maintain your logged-in state across pages, and optimize website loading speeds.
                </p>
                <p className="legal-paragraph">
                  You can configure your browser to decline cookies, though certain essential functions of the store (such as shopping bag persistence and checkout) may be affected.
                </p>
              </section>

              {/* SECTION: PAYMENTS */}
              <section id="payments" className="legal-section">
                <h2 className="legal-section-title">Payment Gateway & Financial Security</h2>
                <p className="legal-paragraph">
                  All online payments on Picky are processed through PCI-DSS Level 1 compliant, bank-grade encrypted payment gateways (such as Razorpay and Cashfree).
                </p>
                <p className="legal-paragraph">
                  Picky does not store or process your complete credit/debit card numbers, CVVs, or Net Banking login credentials on our servers. All transactions adhere to Reserve Bank of India (RBI) tokenization guidelines.
                </p>
              </section>

              {/* SECTION: RIGHTS */}
              <section id="rights" className="legal-section">
                <h2 className="legal-section-title">Data Retention & Your Privacy Rights</h2>
                <p className="legal-paragraph">
                  We retain your order records only as long as necessary to complete fulfillment, honor warranty and return windows, and satisfy statutory tax and commercial accounting regulations.
                </p>
                <p className="legal-paragraph">
                  You have the right to request a copy of your stored personal information, request corrections, or request complete account erasure by contacting our privacy compliance desk.
                </p>
              </section>

              {/* SECTION: CHILDREN */}
              <section id="children" className="legal-section">
                <h2 className="legal-section-title">Children's Privacy Protection</h2>
                <p className="legal-paragraph">
                  Our services are not intended for unsupervised children under 13 years of age. We do not knowingly solicit or collect personal identifiable information from children without explicit parental authorization.
                </p>
                <p className="legal-paragraph">
                  If you believe a child has provided us with personal details without verified consent, please notify us immediately for prompt deletion.
                </p>
              </section>

              {/* SECTION: UPDATES */}
              <section id="updates" className="legal-section">
                <h2 className="legal-section-title">Changes to This Privacy Policy</h2>
                <p className="legal-paragraph">
                  We may periodically revise this Privacy Policy to reflect operational improvements, security enhancements, or statutory legal updates.
                </p>
                <p className="legal-paragraph">
                  Any updates will be posted directly to this page with an updated "Last Updated" revision date. We encourage you to review this policy periodically.
                </p>
              </section>

              {/* SECTION: CONTACT */}
              <section id="contact" className="legal-section">
                <h2 className="legal-section-title">Contact Us & Data Protection Officer</h2>
                <p className="legal-paragraph">
                  If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is managed, please contact our Data Protection Officer:
                </p>
                <div className="legal-contact-card">
                  <h3 className="legal-contact-title">Picky Data Protection & Privacy Office</h3>
                  <p className="legal-contact-text">Email: <a href="mailto:privacy@picky.in" className="legal-link">privacy@picky.in</a> or <a href="mailto:support@picky.in" className="legal-link">support@picky.in</a></p>
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
            <span>Privacy Policy link copied to clipboard!</span>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

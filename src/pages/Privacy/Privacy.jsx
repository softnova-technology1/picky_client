import React, { useState, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  FileText,
  Database,
  MessageSquare,
  Activity,
  ShieldCheck,
  Cookie,
  CreditCard,
  UserCheck,
  Users,
  RefreshCw,
  Mail,
  Share2,
  Calendar,
  Check,
  Shield,
  User,
  Key,
  Package,
  Smartphone,
  ChevronRight,
  Lock,
  Lightbulb,
  Scale,
  Building2,
  PhoneCall
} from 'lucide-react';
import '../../styles/legal.css';
import styles from './Privacy.module.css';

const PRIVACY_SECTIONS = [
  { id: 'intro', label: 'Privacy Commitment', icon: FileText },
  { id: 'data-collection', label: 'Information We Collect', icon: Database },
  { id: 'communications', label: 'WhatsApp & SMS Alerts', icon: MessageSquare },
  { id: 'usage', label: 'How We Use Your Data', icon: Activity },
  { id: 'single-vendor', label: 'Single-Vendor Security', icon: ShieldCheck },
  { id: 'cookies', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'payments', label: 'Payment Gateway Security', icon: CreditCard },
  { id: 'rights', label: 'Data Retention & Rights', icon: UserCheck },
  { id: 'children', label: "Children's Privacy", icon: Users },
  { id: 'updates', label: 'Policy Updates', icon: RefreshCw },
  { id: 'contact', label: 'Data Protection Officer', icon: Mail },
];

const MOBILE_QUICK_JUMP = [
  { id: 'sec-01', label: 'Commitment', icon: FileText },
  { id: 'sec-02', label: 'Info We Collect', icon: Database },
  { id: 'sec-03', label: 'WhatsApp & SMS', icon: MessageSquare },
  { id: 'sec-04', label: 'How We Use', icon: Activity },
  { id: 'sec-05', label: 'Single-Vendor', icon: ShieldCheck },
  { id: 'sec-06', label: 'Cookies', icon: Cookie },
  { id: 'sec-07', label: 'Payment', icon: CreditCard },
  { id: 'sec-08', label: 'Data Retention', icon: UserCheck },
  { id: 'sec-09', label: 'Children', icon: Users },
  { id: 'sec-10', label: 'Updates', icon: RefreshCw },
  { id: 'sec-11', label: 'DPO Office', icon: Building2 },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('intro');
  const [activeMobileSec, setActiveMobileSec] = useState('sec-01');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      // Desktop TOC update
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

      // Mobile Quick Rail update
      for (const sec of MOBILE_QUICK_JUMP) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveMobileSec(sec.id);
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

  const scrollToMobileSection = (id) => {
    setActiveMobileSec(id);
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
        {/* ── 1. Desktop View (Unchanged, min-width: 769px) ── */}
        <div className={styles.desktopWrapper}>
          {/* Zyra Dark Executive Hero Header */}
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

          {/* Two-Column Layout (TOC + Content) */}
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
        </div>

        {/* ── 2. Dedicated Mobile View (Strictly 320px - 768px ONLY) ── */}
        <div className={styles.mobileWrapper}>
          {/* Mobile Hero Header */}
          <header className={styles.mobileHero}>
            <div className={styles.mobileHeroBadge}>
              <Shield size={11} />
              <span>DATA PRIVACY &amp; COMPLIANCE</span>
            </div>
            <h1 className={styles.mobileHeroTitle}>Privacy Policy</h1>
            <p className={styles.mobileHeroSubtitle}>
              Understanding How We Safeguard, Process, and Respect Your Personal Data
            </p>
            <div className={styles.mobileHeroMeta}>
              <Calendar size={13} />
              <span>Last Updated: Sep 07, 2026</span>
            </div>
          </header>

          {/* 1. Sticky Horizontal Quick Jump Rail */}
          <nav className={styles.stickyRail}>
            <div className={styles.railScroll}>
              {MOBILE_QUICK_JUMP.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeMobileSec === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToMobileSection(sec.id)}
                    className={`${styles.railPill} ${isActive ? styles.railPillActive : ''}`}
                  >
                    <Icon size={12} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* 2. Main Privacy Policy Clauses (01 to 11) */}
          <main className={styles.mainClauses}>
            {/* 01 Privacy Commitment & Scope */}
            <article id="sec-01" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>01</span>
                <h2 className={styles.clauseTitle}>Privacy Commitment &amp; Scope</h2>
              </div>
              <p className={styles.clauseParagraph}>
                At Picky E-Commerce Solutions Private Limited (<strong>"Picky"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), we hold your personal privacy in the highest regard. This Privacy Policy sets out how we collect, handle, protect, and process your personal data when you visit our website <a href="https://www.picky.in" target="_blank" rel="noreferrer" className={styles.purpleLink}>www.picky.in</a> or use our mobile applications.
              </p>
              <p className={styles.clauseParagraph}>
                Please read this privacy policy carefully. By accessing or placing an order through Picky, you acknowledge and consent to the collection and use of your information in accordance with this Privacy Policy and applicable data protection laws of India.
              </p>
              {/* Lavender Callout: Zero Third-Party Guarantee */}
              <div className={styles.zeroThirdPartyCallout}>
                <div className={styles.calloutHeader}>
                  <Shield size={14} />
                  <span>Zero Third-Party Brokerage Guarantee</span>
                </div>
                <p className={styles.calloutText}>
                  Picky operates strictly as a verified single-vendor direct store. We <strong>never rent, monetize, or sell</strong> your personal details or mobile phone numbers to external marketing brokers or third-party advertisers.
                </p>
              </div>
            </article>

            {/* 02 Information We Collect */}
            <article id="sec-02" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>02</span>
                <h2 className={styles.clauseTitle}>Information We Collect</h2>
              </div>
              <p className={styles.clauseParagraph}>
                We collect personal information that you voluntarily provide to us when you register a customer account, purchase products, sign up for notifications, or interact with our support desk.
              </p>
              <div className={styles.dataTilesStack}>
                {/* Tile 1 */}
                <div className={styles.dataTileItem}>
                  <div className={`${styles.dataTileIcon} ${styles.iconBlue}`}>
                    <User size={15} />
                  </div>
                  <div>
                    <h4 className={styles.dataTileTitle}>Personal Contact Data</h4>
                    <p className={styles.dataTileDesc}>Full Name, Email Address, Primary Phone/Mobile Number, Delivery Address, Pincode, City, State, and Landmark.</p>
                  </div>
                </div>
                {/* Tile 2 */}
                <div className={styles.dataTileItem}>
                  <div className={`${styles.dataTileIcon} ${styles.iconAmber}`}>
                    <Key size={15} />
                  </div>
                  <div>
                    <h4 className={styles.dataTileTitle}>Authentication Information</h4>
                    <p className={styles.dataTileDesc}>Secure Mobile OTP verification tokens and encrypted password hashes.</p>
                  </div>
                </div>
                {/* Tile 3 */}
                <div className={styles.dataTileItem}>
                  <div className={`${styles.dataTileIcon} ${styles.iconPurple}`}>
                    <Package size={15} />
                  </div>
                  <div>
                    <h4 className={styles.dataTileTitle}>Transactional History</h4>
                    <p className={styles.dataTileDesc}>Details of orders placed, payment status, AWB courier tracking identifiers, and customer service history.</p>
                  </div>
                </div>
                {/* Tile 4 */}
                <div className={styles.dataTileItem}>
                  <div className={`${styles.dataTileIcon} ${styles.iconIndigo}`}>
                    <Smartphone size={15} />
                  </div>
                  <div>
                    <h4 className={styles.dataTileTitle}>Technical Device Telemetry</h4>
                    <p className={styles.dataTileDesc}>IP address, device model, browser type, operating system, and anonymous session cookies.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* 03 WhatsApp & SMS Alerts */}
            <article id="sec-03" className={styles.clauseCard}>
              <div className={styles.cardHeaderBetween}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={styles.clauseNumberBadge}>03</span>
                  <h2 className={styles.clauseTitle}>WhatsApp &amp; SMS Alerts</h2>
                </div>
                <span className={styles.verifiedBadge}>● Verified</span>
              </div>
              <p className={styles.clauseParagraph}>
                To provide an efficient and transparent retail shopping experience, Picky uses automated transactional WhatsApp and SMS notifications. By entering your phone number at checkout or login, you consent to receiving:
              </p>
              <div className={styles.whatsappAlertBox}>
                <div className={styles.whatsappItem}>
                  <Check size={13} strokeWidth={3} />
                  <p style={{ margin: 0 }}>Instant One-Time Passwords (OTP) for secure login and payment authorization.</p>
                </div>
                <div className={styles.whatsappItem}>
                  <Check size={13} strokeWidth={3} />
                  <p style={{ margin: 0 }}>Live order dispatch confirmation, courier assignment, and active AWB tracking links.</p>
                </div>
                <div className={styles.whatsappItem}>
                  <Check size={13} strokeWidth={3} />
                  <p style={{ margin: 0 }}>Out-for-delivery alerts and Cash on Delivery (COD) verification notifications.</p>
                </div>
              </div>
            </article>

            {/* 04 How We Use Your Info */}
            <article id="sec-04" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>04</span>
                <h2 className={styles.clauseTitle}>How We Use Your Info</h2>
              </div>
              <p className={styles.clauseParagraph}>
                We utilize your collected personal data strictly for legitimate operational purposes:
              </p>
              <div className={styles.purposeStack}>
                <div className={styles.purposeItem}>
                  <ChevronRight size={13} />
                  <p className={styles.purposeText}>To verify, process, pack, and dispatch your product orders directly from our regional warehouse.</p>
                </div>
                <div className={styles.purposeItem}>
                  <ChevronRight size={13} />
                  <p className={styles.purposeText}>To provide transparent, real-time shipment updates via WhatsApp, SMS, and Email.</p>
                </div>
                <div className={styles.purposeItem}>
                  <ChevronRight size={13} />
                  <p className={styles.purposeText}>To process returns, exchanges, and instant bank or source refunds promptly.</p>
                </div>
                <div className={styles.purposeItem}>
                  <ChevronRight size={13} />
                  <p className={styles.purposeText}>To detect, prevent, and mitigate fraudulent transactions, unauthorized account access, or security threats.</p>
                </div>
              </div>
            </article>

            {/* 05 Single-Vendor Data Security (CORE PROMISE CARD) */}
            <article id="sec-05" className={styles.darkMidnightCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadgePurple}>05</span>
                <h2 className={styles.clauseTitleWhite}>Single-Vendor Data Security</h2>
              </div>
              <p className={styles.clauseParagraphLight}>
                Because Picky is a direct single-vendor brand rather than an open marketplace, your shipping address and personal contact details are accessible <strong>exclusively by our verified warehouse dispatch team and dedicated courier partners</strong>.
              </p>
              <div className={styles.darkGlassBox}>
                <Lock size={16} />
                <p className={styles.darkGlassText}>
                  Your personal phone number is <strong>never exposed or distributed</strong> to unvetted third-party merchants or marketing syndicates.
                </p>
              </div>
            </article>

            {/* 06 Cookies & Tracking */}
            <article id="sec-06" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>06</span>
                <h2 className={styles.clauseTitle}>Cookies &amp; Tracking</h2>
              </div>
              <p className={styles.clauseParagraph}>
                We use strictly necessary cookies, security tokens, and performance analytics to keep your cart active, maintain your logged-in state across pages, and optimize website loading speeds.
              </p>
              <div className={styles.amberCalloutBox}>
                <Lightbulb size={14} />
                <p className={styles.amberCalloutText}>
                  You can configure your browser to decline cookies, though certain essential functions of the store (such as shopping bag persistence and checkout) may be affected.
                </p>
              </div>
            </article>

            {/* 07 Payment & Financial Security */}
            <article id="sec-07" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>07</span>
                <h2 className={styles.clauseTitle}>Payment &amp; Financial Security</h2>
              </div>
              <p className={styles.clauseParagraph}>
                All online payments on Picky are processed through <strong>PCI-DSS Level 1 compliant</strong>, bank-grade encrypted payment gateways (such as Razorpay and Cashfree).
              </p>
              <div className={styles.purpleCalloutBox}>
                <ShieldCheck size={14} />
                <p className={styles.purpleCalloutText}>
                  Picky does not store or process your complete credit/debit card numbers, CVVs, or Net Banking login credentials on our servers. All transactions adhere to Reserve Bank of India (RBI) tokenization guidelines.
                </p>
              </div>
            </article>

            {/* 08 Data Retention & Rights */}
            <article id="sec-08" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>08</span>
                <h2 className={styles.clauseTitle}>Data Retention &amp; Rights</h2>
              </div>
              <p className={styles.clauseParagraph}>
                We retain your order records only as long as necessary to complete fulfillment, honor warranty and return windows, and satisfy statutory tax and commercial accounting regulations.
              </p>
              <div className={styles.grayCalloutBox}>
                <Scale size={14} />
                <p className={styles.grayCalloutText}>
                  You have the right to request a copy of your stored personal information, request corrections, or request complete account erasure by contacting our privacy compliance desk.
                </p>
              </div>
            </article>

            {/* 09 Children's Privacy */}
            <article id="sec-09" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>09</span>
                <h2 className={styles.clauseTitle}>Children's Privacy</h2>
              </div>
              <p className={styles.clauseParagraph}>
                Our services are not intended for unsupervised children under 13 years of age. We do not knowingly solicit or collect personal identifiable information from children without explicit parental authorization. If you believe a child has provided us with personal details without verified consent, please notify us immediately for prompt deletion.
              </p>
            </article>

            {/* 10 Policy Updates & Revisions */}
            <article id="sec-10" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>10</span>
                <h2 className={styles.clauseTitle}>Policy Updates &amp; Revisions</h2>
              </div>
              <p className={styles.clauseParagraph}>
                We may periodically revise this Privacy Policy to reflect operational improvements, security enhancements, or statutory legal updates. Any updates will be posted directly to this page with an updated "Last Updated" revision date. We encourage you to review this policy periodically.
              </p>
            </article>

            {/* 11 Contact Us & DPO Office */}
            <article id="sec-11" className={styles.clauseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.clauseNumberBadge}>11</span>
                <h2 className={styles.clauseTitle}>Contact Us &amp; DPO Office</h2>
              </div>
              <p className={styles.clauseParagraph}>
                If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is managed, please contact our Data Protection Officer:
              </p>
              <div className={styles.dpoOfficeCard}>
                <div className={styles.dpoOfficeHeader}>
                  <div className={styles.dpoOfficeTitle}>
                    <Building2 size={13} />
                    <span>Picky Data Protection &amp; Privacy Office</span>
                  </div>
                  <span className={styles.officialBadge}>Official</span>
                </div>
                <div className={styles.contactGrid}>
                  <span className={styles.contactLabel}>Email:</span>
                  <p style={{ margin: 0 }}>
                    <a href="mailto:privacy@picky.in" className={styles.purpleLink}>privacy@picky.in</a> or <a href="mailto:support@picky.in" className={styles.purpleLink}>support@picky.in</a>
                  </p>
                  <span className={styles.contactLabel}>Phone:</span>
                  <span className={styles.contactVal}>+91 80 4920 8888 (Mon–Sat, 10:00 AM – 7:00 PM IST)</span>
                  <span className={styles.contactLabel}>Address:</span>
                  <span className={styles.contactVal} style={{ color: '#475569' }}>Softnova Tech Park, Indiranagar, Bengaluru, Karnataka 560038</span>
                </div>
              </div>
            </article>

            {/* Bottom DPO Escalation Action Box */}
            <div className={styles.bottomDpoBox}>
              <div className={styles.bottomDpoPrompt}>
                <MessageSquare size={16} />
                <span>Questions regarding your personal data?</span>
              </div>
              <p className={styles.bottomDpoSubtitle}>Our privacy compliance desk typically replies within 24 business hours.</p>
              <div className={styles.bottomButtonsGrid}>
                <a
                  href="https://wa.me/918300295721"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.whatsappDpoBtn}
                >
                  <PhoneCall size={14} />
                  <span>WhatsApp DPO</span>
                </a>
                <a
                  href="mailto:privacy@picky.in"
                  className={styles.emailDpoBtn}
                >
                  <Mail size={14} />
                  <span>Email DPO</span>
                </a>
              </div>
            </div>
          </main>
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

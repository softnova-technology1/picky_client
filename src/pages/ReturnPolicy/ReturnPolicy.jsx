import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  Clock,
  AlertTriangle,
  CreditCard,
  MessageCircle,
  Mail,
  PackageCheck,
  RefreshCw,
  Check,
  ArrowRight,
} from 'lucide-react';
import { usePageCustomization } from '../../store/customizationStore';
import '../../styles/legal.css';
import styles from './ReturnPolicy.module.css';

const RETURN_SECTIONS = [
  { id: 'overview', num: '01', label: 'Policy Overview & Our Commitment', icon: RotateCcw },
  { id: 'eligibility', num: '02', label: '7-Day Return Eligibility', icon: ShieldCheck },
  { id: 'non-returnable', num: '03', label: 'Non-Returnable Items', icon: AlertTriangle },
  { id: 'damaged', num: '04', label: 'Damaged or Defective Items', icon: PackageCheck },
  { id: 'process', num: '05', label: 'How to Initiate a Return', icon: RefreshCw },
  { id: 'refunds', num: '06', label: 'Refund Timeline & Modes', icon: CreditCard },
  { id: 'cancellation', num: '07', label: 'Order Cancellation', icon: Clock },
  { id: 'contact', num: '08', label: 'Help Desk & Contact', icon: MessageCircle },
];

const MOBILE_RETURN_SECTIONS = [
  { id: 'sec-01', label: '01 Overview' },
  { id: 'sec-02', label: '02 Eligibility' },
  { id: 'sec-03', label: '03 Exemptions' },
  { id: 'sec-04', label: '04 Damaged Items' },
  { id: 'sec-05', label: '05 How to Return' },
  { id: 'sec-06', label: '06 Timelines' },
  { id: 'sec-07', label: '07 Cancellation' },
  { id: 'sec-08', label: '08 Helpdesk' },
];

export default function ReturnPolicy() {
  const { isEnabled, getSetting } = usePageCustomization('content_pages');
  const [activeSection, setActiveSection] = useState('overview');
  const [activeMobileSec, setActiveMobileSec] = useState('sec-01');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      // Desktop TOC update
      for (const section of RETURN_SECTIONS) {
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

      // Mobile Quick Jump update
      for (const section of MOBILE_RETURN_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveMobileSec(section.id);
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
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToMobileSection = (id) => {
    setActiveMobileSec(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <PageWrapper>
      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          DESKTOP VIEW (> 768px) ΓÇö 100% UNTOUCHED & INTACT
          ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className={styles.desktopWrapper}>
        <div className="legal-page-wrapper">
          {/* ΓöÇΓöÇ 1. Hero Banner ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
          <header className="legal-hero-wrapper">
            <div className="legal-hero-container">
              <div className="legal-badge-pill">
                <RotateCcw size={13} className="legal-badge-icon" />
                <span>100% BUYER SATISFACTION GUARANTEE</span>
              </div>
              <h1 className="legal-hero-title">
                Return, Replacement &amp;<br />
                <span className="legal-hero-highlight">Refund Policy</span>
              </h1>
              <p className="legal-hero-subtitle">
                We stand behind the heritage craftsmanship of every handloom saree, brass vilakku, and native item. Enjoy a hassle-free 7-day replacement and transparent refund guarantee.
              </p>
              <div className="legal-meta-row">
                <span>Effective: October 2024</span>
                <span className="legal-meta-dot">ΓÇó</span>
                <span>7-Day Replacement Policy</span>
                <span className="legal-meta-dot">ΓÇó</span>
                <span>100% Bank Refunds</span>
              </div>
            </div>
          </header>

          {/* ΓöÇΓöÇ 2. Quick Highlight 4-Card Grid ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
          <div className="legal-grid-container" style={{ marginTop: '-2.75rem', position: 'relative', zIndex: 10 }}>
            <div className="legal-highlights-grid">
              <div className="legal-highlight-card">
                <div className="legal-card-icon-wrap purple">
                  <Clock size={22} />
                </div>
                <h4 className="legal-card-title">7-Day Replacement</h4>
                <p className="legal-card-desc">
                  Free replacement or exchange if items arrive damaged, defective, or mismatch expectations.
                </p>
              </div>

              <div className="legal-highlight-card">
                <div className="legal-card-icon-wrap green">
                  <Truck size={22} />
                </div>
                <h4 className="legal-card-title">Doorstep Reverse Pickup</h4>
                <p className="legal-card-desc">
                  Our courier partners (DTDC, Blue Dart) arrange doorstep pickup directly from your address.
                </p>
              </div>

              <div className="legal-highlight-card">
                <div className="legal-card-icon-wrap blue">
                  <CreditCard size={22} />
                </div>
                <h4 className="legal-card-title">3-5 Days Direct Refund</h4>
                <p className="legal-card-desc">
                  Funds reversed directly to your original payment method, UPI account, or direct bank transfer.
                </p>
              </div>

              <div className="legal-highlight-card">
                <div className="legal-card-icon-wrap gold">
                  <MessageCircle size={22} />
                </div>
                <h4 className="legal-card-title">Direct WhatsApp Help</h4>
                <p className="legal-card-desc">
                  Chat live with human support at +91 83002 95721 with photo proof for instant approvals.
                </p>
              </div>
            </div>
          </div>

          {/* ΓöÇΓöÇ 3. Main Policy Content & Sticky Sidebar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
          <div className="legal-grid-container">
            <div className="legal-layout-grid">
              {/* Sticky Navigation Sidebar */}
              <aside className="legal-sidebar-sticky">
                <nav className="legal-nav-card" aria-label="Policy Sections">
                  <div className="legal-nav-header">
                    <span className="legal-nav-title">POLICY NAVIGATION</span>
                  </div>
                  <div className="legal-nav-list">
                    {RETURN_SECTIONS.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => scrollToSection(sec.id)}
                          className={`legal-nav-btn ${isActive ? 'active' : ''}`}
                        >
                          <span className="legal-nav-num">{sec.num}</span>
                          <span className="legal-nav-label">{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </aside>

              {/* Main Policy Text Article */}
              <main className="legal-content-card">
                {/* Section 01 */}
                <section id="overview" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">01</span>
                    <h2 className="legal-section-title">Policy Overview &amp; Our Commitment</h2>
                  </div>
                  <p className="legal-paragraph">
                    At Picky, we celebrate authentic South Indian craftsmanship ΓÇö bringing Madurai Sungudi sarees, Nachiarkoil brass lamps, and traditional handmade goods directly into your homes. We inspect every single item prior to dispatch to ensure pure quality.
                  </p>
                  <p className="legal-paragraph">
                    However, if you are not fully delighted with your purchase due to a manufacturing defect, transit damage, or size mismatch, our return and replacement process is designed to be effortless, transparent, and completely fair to you.
                  </p>
                </section>

                {/* Section 02 */}
                <section id="eligibility" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">02</span>
                    <h2 className="legal-section-title">7-Day Replacement &amp; Return Eligibility</h2>
                  </div>
                  <p className="legal-paragraph">
                    You may request a return or replacement within <strong>7 calendar days</strong> from the date your order is successfully delivered by our courier partners.
                  </p>
                  <ul className="legal-list">
                    <li>
                      <strong>Unworn &amp; Unaltered Condition:</strong> Sarees, apparel, and home decor must be unworn, unwashed, and free of stains, perfumes, or tailoring alterations.
                    </li>
                    <li>
                      <strong>Original Tags &amp; Packaging:</strong> Original brand labels, tags, and artisan authentication cards must remain intact.
                    </li>
                    <li>
                      <strong>Complete Inclusions:</strong> Any accessories, complimentary items, or brass accessories included in the original package must be returned together.
                    </li>
                  </ul>
                </section>

                {/* Section 03 */}
                <section id="non-returnable" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">03</span>
                    <h2 className="legal-section-title">Non-Returnable &amp; Exempted Items</h2>
                  </div>
                  <p className="legal-paragraph">
                    For hygiene and safety reasons, certain categories cannot be returned once delivered:
                  </p>
                  <div className="policy-callout-warning">
                    <div className="policy-callout-warning-title">Exempted Items:</div>
                    <ul className="policy-callout-list">
                      <li>
                        <strong>Native Sweets &amp; Snacks:</strong> Traditional food items, podis, and sweets once sold &amp; broken (unless damaged/expired upon arrival).
                      </li>
                      <li>
                        <strong>Personalized / Custom Stitched:</strong> Sarees stitched with bespoke fall/pico or blouses tailored to personalized measurements.
                      </li>
                      <li>
                        <strong>Fragrance &amp; Kumkum:</strong> Unsealed pooja oils, dhoop, and kumkum powders.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Section 04 */}
                <section id="damaged" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">04</span>
                    <h2 className="legal-section-title">Damaged or Defective Items Received</h2>
                  </div>
                  <p className="legal-paragraph">
                    In the rare event that your product arrives defective, damaged during transit, or missing a part:
                  </p>
                  <ol className="policy-numbered-list">
                    <li>
                      Please inform us within <strong>48 hours of delivery</strong> with unboxing photos or a short video showing the outer courier seal and defect.
                    </li>
                    <li>
                      You can share the images via WhatsApp at <strong>+91 83002 95721</strong> or email <strong>care@pickystore.in</strong>.
                    </li>
                    <li>
                      Our quality team will review within <strong>2 to 4 hours</strong> and immediately dispatch a brand-new replacement at zero additional delivery charge.
                    </li>
                  </ol>
                </section>

                {/* Section 05 */}
                <section id="process" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">05</span>
                    <h2 className="legal-section-title">How to Initiate a Return</h2>
                  </div>
                  <p className="legal-paragraph">
                    You can initiate a return directly online or via WhatsApp:
                  </p>
                  <div className="policy-steps-list">
                    <div className="policy-step-item">
                      <div className="policy-step-badge">1</div>
                      <div className="policy-step-text">
                        <strong>Via Your Account:</strong> Navigate to <Link to="/orders" className="legal-link">My Orders</Link>, open your order detail page, and click <strong>"Request Return / Replacement"</strong>.
                      </div>
                    </div>
                    <div className="policy-step-item">
                      <div className="policy-step-badge">2</div>
                      <div className="policy-step-text">
                        <strong>Via WhatsApp:</strong> Send your Order Number (e.g. <code>#PK-2024-8192</code>) to <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" className="legal-link"><strong>+91 83002 95721</strong></a>.
                      </div>
                    </div>
                    <div className="policy-step-item">
                      <div className="policy-step-badge">3</div>
                      <div className="policy-step-text">
                        <strong>Doorstep Pickup:</strong> Our courier executive will collect the item from your home within <strong>24ΓÇô48 hours</strong>. Keep the box ready.
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 06 */}
                <section id="refunds" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">06</span>
                    <h2 className="legal-section-title">Refund Processing Timelines &amp; Modes</h2>
                  </div>
                  <p className="legal-paragraph">
                    Once your returned package reaches our fulfillment center and passes basic verification, your refund will be credited according to your original payment mode:
                  </p>
                  <div className="policy-table-wrapper">
                    <table className="policy-table">
                      <thead>
                        <tr>
                          <th>Payment Method</th>
                          <th>Refund Mode</th>
                          <th>Expected Timeline</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="policy-table-cell-bold">UPI (GPay / PhonePe / Paytm)</td>
                          <td>Direct UPI Reverse / Refund</td>
                          <td><span className="timeline-pill-success">24 - 48 Hours</span></td>
                        </tr>
                        <tr>
                          <td className="policy-table-cell-bold">Credit / Debit Card</td>
                          <td>Original Bank Card Account</td>
                          <td>3 - 5 Business Days</td>
                        </tr>
                        <tr>
                          <td className="policy-table-cell-bold">Net Banking</td>
                          <td>Original Bank Account</td>
                          <td>3 - 5 Business Days</td>
                        </tr>
                        <tr>
                          <td className="policy-table-cell-bold">Cash on Delivery (COD)</td>
                          <td>Bank NEFT / Direct UPI Transfer</td>
                          <td>3 - 4 Business Days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Section 07 */}
                <section id="cancellation" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">07</span>
                    <h2 className="legal-section-title">Order Cancellation Policy</h2>
                  </div>
                  <p className="legal-paragraph">
                    You can easily cancel your order online prior to dispatch:
                  </p>
                  <ul className="legal-list">
                    <li>
                      <strong>Before Dispatch:</strong> If your order status is <code>Confirmed</code> or <code>Packing</code>, you can cancel directly from <Link to="/orders" className="legal-link">My Orders</Link> with zero cancellation charges. Instant 100% refund is initiated immediately.
                    </li>
                    <li>
                      <strong>After Dispatch:</strong> If the package has already been handed over to DTDC or Blue Dart, it cannot be cancelled in transit. You may decline delivery when the courier arrives, or initiate a standard return upon receipt.
                    </li>
                  </ul>
                </section>

                {/* Section 08 */}
                <section id="contact" className="legal-section">
                  <div className="legal-section-header">
                    <span className="legal-section-num">08</span>
                    <h2 className="legal-section-title">Customer Care &amp; Support Helpdesk</h2>
                  </div>
                  <p className="legal-paragraph">
                    Have questions regarding your return or refund status? Our dedicated support team is available Mon-Sat from 9:30 AM to 7:00 PM IST.
                  </p>
                  <div className="policy-helpdesk-card">
                    <div className="policy-helpdesk-row">
                      <MessageCircle size={18} color="#16a34a" className="policy-helpdesk-icon" />
                      <span><strong>WhatsApp Support:</strong> <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700 }}>+91 83002 95721</a></span>
                    </div>
                    <div className="policy-helpdesk-row">
                      <Mail size={18} color="#7c3aed" className="policy-helpdesk-icon" />
                      <span><strong>Email:</strong> <a href="mailto:care@pickystore.in" style={{ color: '#7c3aed', fontWeight: 700 }}>care@pickystore.in</a></span>
                    </div>
                    <div className="policy-helpdesk-row">
                      <Clock size={18} color="#0284c7" className="policy-helpdesk-icon" />
                      <span><strong>Working Hours:</strong> Monday ΓÇô Saturday: 9:30 AM ΓÇô 7:00 PM IST</span>
                    </div>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
          MOBILE VIEW (<= 768px) ΓÇö OPTIMIZED CARDS & ZERO INFORMAL EMOJIS
          ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div className={styles.mobileWrapper}>
        {/* ΓöÇΓöÇ 0. Mobile Hero Header ΓöÇΓöÇ */}
        <header className={styles.mobileHero}>
          <div className={styles.heroBadge}>
            <ShieldCheck size={11} />
            <span>100% BUYER SATISFACTION GUARANTEE</span>
          </div>
          <h1 className={styles.heroTitle}>
            Return, Replacement &amp; Refund Policy
          </h1>
          <p className={styles.heroSubtitle}>
            We stand behind the heritage craftsmanship of every handloom saree, brass vilakku, and native item. Enjoy a hassle-free 7-day replacement and transparent refund guarantee.
          </p>
          <div className={styles.heroPillsRow}>
            <span className={styles.heroPill}>Effective: Oct 2024</span>
            <span className={`${styles.heroPill} ${styles.heroPillActive}`}>7-Day Replacement</span>
            <span className={`${styles.heroPill} ${styles.heroPillGreen}`}>100% Bank Refunds</span>
          </div>
        </header>

        {/* ΓöÇΓöÇ 1. 2x2 Interactive Trust Pillar Tiles ΓöÇΓöÇ */}
        <section className={styles.trustPillarsGrid}>
          {/* Pillar 1 */}
          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.pillarIconPurple}`}>
              <Clock size={16} />
            </div>
            <div>
              <h4 className={styles.pillarTitle}>7-Day Replacement</h4>
              <p className={styles.pillarDesc}>
                Free replacement or exchange if items arrive damaged, defective, or mismatch expectations.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.pillarIconPurple}`}>
              <RotateCcw size={16} />
            </div>
            <div>
              <h4 className={styles.pillarTitle}>Doorstep Reverse Pickup</h4>
              <p className={styles.pillarDesc}>
                Our courier partners DTDC, Blue Dart arrange doorstep pickup directly from your address.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.pillarIconAmber}`}>
              <CreditCard size={16} />
            </div>
            <div>
              <h4 className={styles.pillarTitle}>3ΓÇô5 Days Direct Refund</h4>
              <p className={styles.pillarDesc}>
                Funds reversed directly to your original payment method, UPI account, or direct bank transfer.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.pillarIconEmerald}`}>
              <MessageCircle size={16} />
            </div>
            <div>
              <h4 className={styles.pillarTitle}>Direct WhatsApp Help</h4>
              <p className={styles.pillarDesc}>
                Chat live with human support at +91 83002 95721 with photo proof for instant approvals.
              </p>
            </div>
          </div>
        </section>

        {/* ΓöÇΓöÇ 2. Sticky Horizontal "Policy Navigation" Quick Jump Rail ΓöÇΓöÇ */}
        <nav className={styles.stickyRail} aria-label="Policy Navigation Quick Jump">
          <div className={styles.railInner}>
            <span className={styles.jumpToLabel}>JUMP TO:</span>
            {MOBILE_RETURN_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToMobileSection(sec.id)}
                className={`${styles.railPill} ${activeMobileSec === sec.id ? styles.railPillActive : ''}`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ΓöÇΓöÇ 3. Policy Clauses Cards Container (01 to 08) ΓöÇΓöÇ */}
        <main className={styles.mainClauses}>
          {/* 01 Policy Overview & Our Commitment */}
          <article id="sec-01" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>01</span>
              <h2 className={styles.cardTitle}>Policy Overview &amp; Our Commitment</h2>
            </div>
            <p className={styles.cardText}>
              At Picky, we celebrate authentic South Indian craftsmanship ΓÇö bringing Madurai Sungudi sarees, Nachiarkoil brass lamps, and traditional handmade goods directly into your homes. We inspect every single item prior to dispatch to ensure pure quality.
            </p>
            <p className={styles.cardText}>
              However, if you are not fully delighted with your purchase due to a manufacturing defect, transit damage, or size mismatch, our return and replacement process is designed to be effortless, transparent, and completely fair to you.
            </p>
          </article>

          {/* 02 7-Day Replacement & Return Eligibility */}
          <article id="sec-02" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>02</span>
              <h2 className={styles.cardTitle}>7-Day Replacement &amp; Return Eligibility</h2>
            </div>
            <p className={styles.cardText}>
              You may request a return or replacement within <strong style={{ color: '#111827', fontWeight: 600 }}>7 calendar days</strong> from the date your order is successfully delivered by our courier partners.
            </p>
            <div className={styles.checklistWrap}>
              <div className={styles.checklistItem}>
                <Check size={14} className={styles.checkIcon} />
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#111827', fontWeight: 600 }}>Unworn &amp; Unaltered Condition:</strong> Sarees, apparel, and home decor must be unworn, unwashed, and free of stains, perfumes, or tailoring alterations.
                </p>
              </div>
              <div className={styles.checklistItem}>
                <Check size={14} className={styles.checkIcon} />
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#111827', fontWeight: 600 }}>Original Tags &amp; Packaging:</strong> Original brand labels, tags, and artisan authentication cards must remain intact.
                </p>
              </div>
              <div className={styles.checklistItem}>
                <Check size={14} className={styles.checkIcon} />
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#111827', fontWeight: 600 }}>Complete Inclusions:</strong> Any accessories, complimentary items, or brass accessories included in the original package must be returned together.
                </p>
              </div>
            </div>
          </article>

          {/* 03 Non-Returnable & Exempted Items */}
          <article id="sec-03" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardNumBadge} ${styles.cardNumBadgeAmber}`}>03</span>
              <h2 className={styles.cardTitle}>Non-Returnable &amp; Exempted Items</h2>
            </div>
            <p className={styles.cardText}>
              For hygiene and safety reasons, certain categories cannot be returned once delivered:
            </p>
            <div className={styles.amberWarningBox}>
              <div className={styles.amberItem}>
                <span className={styles.amberDot} />
                <p style={{ margin: 0 }}>
                  <strong style={{ fontWeight: 700, color: '#451a03' }}>Native Sweets &amp; Snacks:</strong> Traditional food items, podis, and sweets once sold &amp; broken (unless damaged/expired upon arrival).
                </p>
              </div>
              <div className={styles.amberItem}>
                <span className={styles.amberDot} />
                <p style={{ margin: 0 }}>
                  <strong style={{ fontWeight: 700, color: '#451a03' }}>Personalized / Custom Stitched:</strong> Sarees stitched with bespoke fall/pico or blouses tailored to personalized measurements.
                </p>
              </div>
              <div className={styles.amberItem}>
                <span className={styles.amberDot} />
                <p style={{ margin: 0 }}>
                  <strong style={{ fontWeight: 700, color: '#451a03' }}>Fragrance &amp; Kumkum:</strong> Unsealed pooja oils, dhoop, and kumkum powders.
                </p>
              </div>
            </div>
          </article>

          {/* 04 Damaged or Defective Items Received */}
          <article id="sec-04" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>04</span>
              <h2 className={styles.cardTitle}>Damaged or Defective Items Received</h2>
            </div>
            <p className={styles.cardText}>
              In the rare event that your product arrives defective, damaged during transit, or missing a part:
            </p>
            <div className={styles.stepsList}>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>1</span>
                <div className={styles.stepContent}>
                  Please inform us within <strong style={{ color: '#111827', fontWeight: 600 }}>48 hours of delivery</strong> with unboxing photos or a short video showing the outer courier seal and defect.
                </div>
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>2</span>
                <div className={styles.stepContent}>
                  You can share the images via WhatsApp at <a href="https://wa.me/918300295721" className={styles.linkAccent}>+91 83002 95721</a> or email <a href="mailto:care@pickystore.in" className={styles.linkAccent}>care@pickystore.in</a>.
                </div>
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>3</span>
                <div className={styles.stepContent}>
                  Our quality team will review within <strong style={{ color: '#111827', fontWeight: 600 }}>2 to 4 hours</strong> and immediately dispatch a brand-new replacement at zero additional delivery charge.
                </div>
              </div>
            </div>
          </article>

          {/* 05 How to Initiate a Return */}
          <article id="sec-05" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>05</span>
              <h2 className={styles.cardTitle}>How to Initiate a Return</h2>
            </div>
            <p className={styles.cardText}>
              You can initiate a return directly online or via WhatsApp:
            </p>
            <div className={styles.stepsList}>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>1</span>
                <div className={styles.stepContent}>
                  <div className={styles.stepContentTitle}>Via Your Account</div>
                  <div>
                    Navigate to <Link to="/orders" className={styles.linkAccent}>My Orders</Link>, open your order detail page, and click <span className={styles.linkAccent}>"Request Return / Replacement"</span>.
                  </div>
                </div>
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>2</span>
                <div className={styles.stepContent}>
                  <div className={styles.stepContentTitle}>Via WhatsApp</div>
                  <div>
                    Send your Order Number (e.g. <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1f2937' }}>#PK-2024-8192</span>) to <strong className={styles.linkAccent}>+91 83002 95721</strong>.
                  </div>
                </div>
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepBadge}>3</span>
                <div className={styles.stepContent}>
                  <div className={styles.stepContentTitle}>Doorstep Pickup</div>
                  <div>
                    Our courier executive will collect the item from your home within <strong style={{ color: '#111827', fontWeight: 600 }}>24ΓÇô48 hours</strong>. Keep the box ready.
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* 06 Refund Processing Timelines & Modes */}
          <article id="sec-06" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>06</span>
              <h2 className={styles.cardTitle}>Refund Processing Timelines &amp; Modes</h2>
            </div>
            <p className={styles.cardText}>
              Once your returned package reaches our fulfillment center and passes basic verification, your refund will be credited according to your original payment mode:
            </p>
            <div className={styles.refundModesList}>
              {/* UPI Mode */}
              <div className={`${styles.refundModeCard} ${styles.refundModeCardEmerald}`}>
                <div>
                  <h4 className={styles.refundModeTitle}>UPI (GPay / PhonePe / Paytm)</h4>
                  <p className={styles.refundModeSub}>Direct UPI Reverse / Refund</p>
                </div>
                <span className={`${styles.refundTimePill} ${styles.refundTimePillEmerald}`}>24 - 48 Hours</span>
              </div>

              {/* Cards */}
              <div className={styles.refundModeCard}>
                <div>
                  <h4 className={styles.refundModeTitle}>Credit / Debit Card</h4>
                  <p className={styles.refundModeSub}>Original Bank Card Account</p>
                </div>
                <span className={`${styles.refundTimePill} ${styles.refundTimePillPurple}`}>3 - 5 Business Days</span>
              </div>

              {/* Net Banking */}
              <div className={styles.refundModeCard}>
                <div>
                  <h4 className={styles.refundModeTitle}>Net Banking</h4>
                  <p className={styles.refundModeSub}>Original Bank Account</p>
                </div>
                <span className={`${styles.refundTimePill} ${styles.refundTimePillPurple}`}>3 - 5 Business Days</span>
              </div>

              {/* COD */}
              <div className={styles.refundModeCard}>
                <div>
                  <h4 className={styles.refundModeTitle}>Cash on Delivery (COD)</h4>
                  <p className={styles.refundModeSub}>Bank NEFT / Direct UPI Transfer</p>
                </div>
                <span className={`${styles.refundTimePill} ${styles.refundTimePillPurple}`}>3 - 4 Business Days</span>
              </div>
            </div>
          </article>

          {/* 07 Order Cancellation Policy */}
          <article id="sec-07" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>07</span>
              <h2 className={styles.cardTitle}>Order Cancellation Policy</h2>
            </div>
            <p className={styles.cardText}>
              You can easily cancel your order online prior to dispatch:
            </p>
            <div className={styles.cancellationBoxPurple}>
              <div className={styles.cancellationTitle}>Before Dispatch:</div>
              <p className={styles.cancellationText}>
                If your order status is <strong style={{ color: '#111827', fontWeight: 600 }}>Confirmed</strong> or <strong style={{ color: '#111827', fontWeight: 600 }}>Packing</strong>, you can cancel directly from <Link to="/orders" className={styles.linkAccent}>My Orders</Link> with zero cancellation charges. Instant 100% refund is initiated immediately.
              </p>
            </div>
            <div className={styles.cancellationBoxGray}>
              <div className={styles.cancellationTitle}>After Dispatch:</div>
              <p className={styles.cancellationText}>
                If the package has already been handed over to DTDC or Blue Dart, it cannot be cancelled in transit. You may decline delivery when the courier arrives, or initiate a standard return upon receipt.
              </p>
            </div>
          </article>

          {/* 08 Customer Care & Support Helpdesk */}
          <article id="sec-08" className={styles.clauseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNumBadge}>08</span>
              <h2 className={styles.cardTitle}>Customer Care &amp; Support Helpdesk</h2>
            </div>
            <p className={styles.cardText}>
              Have questions regarding your return or refund status? Our dedicated support team is available MonΓÇôSat from 9:30 AM to 7:00 PM IST.
            </p>

            <div className={styles.helpdeskContacts}>
              {/* WhatsApp Help */}
              <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" className={`${styles.contactRow} ${styles.contactRowGreen}`}>
                <div className={`${styles.contactIconBox} ${styles.contactIconBoxGreen}`}>
                  <MessageCircle size={16} />
                </div>
                <div>
                  <span className={styles.contactLabel}>WhatsApp Support</span>
                  <p className={`${styles.contactVal} ${styles.contactValGreen}`}>+91 83002 95721</p>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:care@pickystore.in" className={`${styles.contactRow} ${styles.contactRowPurple}`}>
                <div className={`${styles.contactIconBox} ${styles.contactIconBoxPurple}`}>
                  <Mail size={16} />
                </div>
                <div>
                  <span className={styles.contactLabel}>Email</span>
                  <p className={`${styles.contactVal} ${styles.contactValDark}`}>care@pickystore.in</p>
                </div>
              </a>

              {/* Working Hours */}
              <div className={`${styles.contactRow} ${styles.contactRowGray}`}>
                <div className={`${styles.contactIconBox} ${styles.contactIconBoxGray}`}>
                  <Clock size={16} />
                </div>
                <div>
                  <span className={styles.contactLabel}>Working Hours</span>
                  <p className={`${styles.contactVal} ${styles.contactValMedium}`}>Monday ΓÇô Saturday: 9:30 AM ΓÇô 7:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* Instant Help WhatsApp Direct CTA */}
            <div className={styles.instantHelpBanner}>
              <div>
                <h4 className={styles.instantHelpTitle}>Need instant help?</h4>
                <p className={styles.instantHelpSub}>Average reply time: 3 mins</p>
              </div>
              <a
                href="https://wa.me/918300295721"
                target="_blank"
                rel="noreferrer"
                className={styles.instantHelpBtn}
              >
                <span>WhatsApp</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </article>
        </main>
      </div>
    </PageWrapper>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  Truck,
  Clock,
  ShieldCheck,
  MapPin,
  Package,
  CreditCard,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Zap,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  Calendar,
  Navigation,
  Building2,
  Send,
  Globe,
  Mail,
  Gift,
  Search,
  User,
  PackageCheck,
} from 'lucide-react';
import { usePageCustomization } from '../../store/customizationStore';
import styles from './ShippingPolicy.module.css';
import '../../styles/legal.css';

function WhatsAppIcon({ size = 18, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

const DESKTOP_SHIPPING_SECTIONS = [
  { id: 'dispatch', label: 'Dispatch & Processing', icon: Zap },
  { id: 'timelines', label: 'Delivery Timelines', icon: Clock },
  { id: 'charges', label: 'Shipping Charges & Free Delivery', icon: CreditCard },
  { id: 'tracking', label: 'Order Tracking (AWB)', icon: Truck },
  { id: 'packaging', label: 'Fragile Packaging Standards', icon: Package },
  { id: 'cod', label: 'Cash on Delivery (COD)', icon: Building },
  { id: 'rto', label: 'Non-Delivery & Address Updates', icon: MapPin },
  { id: 'support', label: 'Shipping Helpdesk', icon: Phone },
];

const MOBILE_SHIPPING_SECTIONS = [
  { id: 'sec-01', num: '01', label: 'Dispatch' },
  { id: 'sec-02', num: '02', label: 'Timelines' },
  { id: 'sec-03', num: '03', label: 'Free Delivery' },
  { id: 'sec-04', num: '04', label: 'Tracking' },
  { id: 'sec-05', num: '05', label: 'Packaging' },
  { id: 'sec-06', num: '06', label: 'COD Policy' },
  { id: 'sec-07', num: '07', label: 'Reschedule' },
  { id: 'sec-08', num: '08', label: 'Helpdesk' },
];

export default function ShippingPolicy() {
  const { isEnabled, getSetting } = usePageCustomization('content_pages');
  const turnaroundBlurb = getSetting('policy_shipping_content', 'turnaroundBlurb', 'Dispatched within 24 to 48 hours via trusted couriers (DTDC, Blue Dart & Delhivery).');
  const expressTimeline = getSetting('policy_shipping_content', 'expressTimeline', '2 to 4 business days across Tamil Nadu, 4 to 6 business days nationwide.');
  const [activeSection, setActiveSection] = useState('dispatch');
  const [activeMobileSec, setActiveMobileSec] = useState('sec-01');

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        const scrollPosition = window.scrollY + 120;
        for (const sec of MOBILE_SHIPPING_SECTIONS) {
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
      } else {
        const scrollPosition = window.scrollY + 160;
        for (const section of DESKTOP_SHIPPING_SECTIONS) {
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
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToDesktopSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToMobileSec = (id) => {
    setActiveMobileSec(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -60;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <PageWrapper>
      {/* ══════════════════════════════════════════════════════════════════════
          1. DESKTOP VIEW (> 768px) - 100% UNTOUCHED ORIGINAL LAYOUT
          ══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopView}>
        <div className="legal-page-wrapper">
          {/* Desktop Hero Banner */}
          <header className="legal-hero-wrapper">
            <div className="legal-hero-container">
              <div className="legal-badge-pill">
                <Truck size={14} className="legal-badge-icon" />
                <span>SWIFT, SAFE &amp; INSURED LOGISTICS</span>
              </div>
              <h1 className="legal-hero-title">
                Shipping &amp; Delivery<br />
                <span className="legal-hero-highlight">Policy &amp; Timelines</span>
              </h1>
              <p className="legal-hero-subtitle">
                Authentic heritage products dispatched directly from our Tamil Nadu fulfillment hubs. Track your packages in real-time with reliable doorstep delivery.
              </p>
              <div className="legal-meta-row">
                <span className="legal-meta-pill">
                  <Clock size={13} /> Dispatch: 24 - 48 Hours
                </span>
                <span className="legal-meta-pill">
                  <ShieldCheck size={13} /> Insured Shipments
                </span>
                <span className="legal-meta-pill">
                  <Truck size={13} /> Blue Dart, DTDC, India Post
                </span>
              </div>
            </div>
          </header>

          {/* Quick Highlight 4-Card Grid */}
          <div className="legal-grid-container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1.5px solid #ede8f8',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
              }}>
                <div style={{ color: '#7c3aed', marginBottom: '0.65rem' }}>
                  <Zap size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                  24–48h Dispatch
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Orders packaged and handed to primary courier logistics within 1 to 2 business days.
                </p>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1.5px solid #ede8f8',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
              }}>
                <div style={{ color: '#16a34a', marginBottom: '0.65rem' }}>
                  <CreditCard size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                  FREE Shipping &gt; ₹999
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Zero shipping charge on all prepaid and COD orders valued above ₹999 across India.
                </p>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1.5px solid #ede8f8',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
              }}>
                <div style={{ color: '#0284c7', marginBottom: '0.65rem' }}>
                  <Truck size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                  Trusted Logistics
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Couriers handled by DTDC, Blue Dart Air Express, and India Post Speed Post.
                </p>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1.5px solid #ede8f8',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
              }}>
                <div style={{ color: '#d97706', marginBottom: '0.65rem' }}>
                  <Package size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                  Double-Box Packaging
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Multi-layer air bubble cushion protection specifically for brass vilakku &amp; handlooms.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content & Sticky Sidebar */}
          <div className="legal-grid-container">
            <div className="legal-layout-grid">
              {/* Sticky Navigation Sidebar */}
              <aside className="legal-sidebar-sticky">
                <nav className="legal-nav-card" aria-label="Shipping Sections">
                  <div className="legal-nav-header">
                    <span className="legal-nav-title">SHIPPING NAVIGATION</span>
                  </div>
                  <div className="legal-nav-list">
                    {DESKTOP_SHIPPING_SECTIONS.map((sec) => {
                      const Icon = sec.icon;
                      const isActive = activeSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => scrollToDesktopSection(sec.id)}
                          className={`legal-nav-btn ${isActive ? 'active' : ''}`}
                        >
                          <Icon size={16} className="legal-nav-icon" />
                          <span>{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </aside>

              {/* Main Policy Text Article */}
              <main className="legal-content-card">
                {/* Section 1 */}
                <section id="dispatch" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">01</div>
                    <h2 className="legal-section-title">Order Dispatch &amp; Processing</h2>
                  </div>
                  <p className="legal-paragraph">
                    All orders placed on <strong>Picky</strong> are carefully inspected, quality-checked, and packed at our regional fulfillment centers in Madurai and Chennai, Tamil Nadu.
                  </p>
                  <ul className="legal-list">
                    <li>
                      <strong>Standard Processing:</strong> Orders confirmed before 1:00 PM IST on business days are usually dispatched on the same day or next business morning (24–48 hours).
                    </li>
                    <li>
                      <strong>Festive Seasons:</strong> During Diwali, Pongal, and festive drops, high-volume artisanal items might require up to 48 hours for special packaging.
                    </li>
                    <li>
                      <strong>Sunday &amp; Public Holidays:</strong> Couriers do not operate dispatch on Sundays and national public holidays; processing resumes on the next working morning.
                    </li>
                  </ul>
                </section>

                {/* Section 2 */}
                <section id="timelines" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">02</div>
                    <h2 className="legal-section-title">Estimated Delivery Timelines by Region</h2>
                  </div>
                  <p className="legal-paragraph">
                    Once your shipment is handed over to our courier partners, expected transit times are as follows:
                  </p>
                  <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #ede8f8' }}>
                      <thead>
                        <tr style={{ background: '#f5f0fe', color: '#5b21b6', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Destination Region</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Estimated Delivery Time</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Courier Partners</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Tamil Nadu (All 38 Districts)</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 700 }}>2 – 4 Business Days</td>
                          <td style={{ padding: '0.75rem 1rem' }}>DTDC, Blue Dart, Professional Couriers</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>South India (KL, KA, AP, TS)</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 700 }}>3 – 5 Business Days</td>
                          <td style={{ padding: '0.75rem 1rem' }}>Blue Dart Surface &amp; Air, DTDC</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Metro Cities (Mumbai, Delhi, Kolkata)</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#0284c7', fontWeight: 700 }}>3 – 6 Business Days</td>
                          <td style={{ padding: '0.75rem 1rem' }}>Blue Dart Air Express</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Rest of India &amp; Remote Areas</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#0284c7', fontWeight: 700 }}>4 – 7 Business Days</td>
                          <td style={{ padding: '0.75rem 1rem' }}>India Post Speed Post, DTDC</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="charges" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">03</div>
                    <h2 className="legal-section-title">Shipping Charges &amp; Free Delivery Threshold</h2>
                  </div>
                  <p className="legal-paragraph">
                    We believe in completely upfront, transparent pricing without hidden surcharges:
                  </p>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '14px',
                    padding: '1.1rem 1.35rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                  }}>
                    <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>FREE SHIPPING on Orders Above ₹999</strong>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#166534' }}>
                        Add products worth ₹999 or more to your cart to automatically qualify for complimentary free delivery.
                      </p>
                    </div>
                  </div>
                  <p className="legal-paragraph">
                    For orders below ₹999, a nominal standard handling and courier charge of <strong>₹40</strong> is applied at checkout to cover safe transit and packaging.
                  </p>
                </section>

                {/* Section 4 */}
                <section id="tracking" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">04</div>
                    <h2 className="legal-section-title">Real-Time Order Tracking (AWB)</h2>
                  </div>
                  <p className="legal-paragraph">
                    As soon as your package is scanned by our logistics partner, we provide complete live tracking transparency:
                  </p>
                  <ul className="legal-list">
                    <li>
                      <strong>Automated WhatsApp &amp; SMS Updates:</strong> You will receive an instant WhatsApp alert containing your Air Waybill (AWB) number and direct courier tracking URL.
                    </li>
                    <li>
                      <strong>Track Online Anytime:</strong> Visit our dedicated <Link to="/track-order" style={{ color: '#7c3aed', textDecoration: 'underline' }}>Track Order Page</Link> and enter your Order Number (e.g. <code>PKY-202610-001</code>) to see real-time updates.
                    </li>
                    <li>
                      <strong>My Orders Portal:</strong> Logged-in customers can view step-by-step progress directly in <Link to="/orders" style={{ color: '#7c3aed', textDecoration: 'underline' }}>My Orders</Link>.
                    </li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section id="packaging" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">05</div>
                    <h2 className="legal-section-title">Fragile &amp; Heritage Packaging Standards</h2>
                  </div>
                  <p className="legal-paragraph">
                    Handcrafted South Indian items require specialized logistics care:
                  </p>
                  <ul className="legal-list">
                    <li>
                      <strong>Brass Vilakku &amp; Metal Sculptures:</strong> Packed inside custom-molded high-density foam, wrapped in double-layer air bubbles, and housed inside reinforced 5-ply corrugated master cartons with "FRAGILE / HANDLE WITH CARE" tamper seals.
                    </li>
                    <li>
                      <strong>Sungudi Sarees &amp; Handlooms:</strong> Sealed in moisture-barrier virgin polybags to guard against rain, dust, and humidity during transit.
                    </li>
                    <li>
                      <strong>Gift Wrapping:</strong> If you select Gift Wrap (+₹30) at checkout, your items are dressed in premium textured paper and accompanied by your printed personalized greeting message.
                    </li>
                  </ul>
                </section>

                {/* Section 6 */}
                <section id="cod" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">06</div>
                    <h2 className="legal-section-title">Cash on Delivery (COD) Guidelines</h2>
                  </div>
                  <p className="legal-paragraph">
                    We offer Cash on Delivery across most serviceable Indian pincodes:
                  </p>
                  <ul className="legal-list">
                    <li>
                      COD orders may receive an automated verification SMS/WhatsApp confirmation prior to dispatch.
                    </li>
                    <li>
                      Please ensure the exact cash amount is ready at the time of delivery. Many delivery partners also accept UPI QR payment at your doorstep upon delivery.
                    </li>
                    <li>
                      Open-delivery is not permitted before payment as per standard courier carrier guidelines; however, you are fully covered under our <Link to="/returns" style={{ color: '#7c3aed', textDecoration: 'underline' }}>7-Day Replacement Policy</Link>.
                    </li>
                  </ul>
                </section>

                {/* Section 7 */}
                <section id="rto" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">07</div>
                    <h2 className="legal-section-title">Non-Delivery &amp; Address Updates</h2>
                  </div>
                  <p className="legal-paragraph">
                    Our courier partners attempt delivery up to <strong>3 times</strong> before returning an undelivered parcel to our warehouse.
                  </p>
                  <p className="legal-paragraph">
                    If you need to update your address or reschedule a delivery date due to travel, please message our support team on WhatsApp at <strong>+91 83002 95721</strong> before the 2nd delivery attempt.
                  </p>
                </section>

                {/* Section 8 */}
                <section id="support" className="legal-section">
                  <div className="legal-section-header">
                    <div className="legal-section-num">08</div>
                    <h2 className="legal-section-title">Shipping Helpdesk &amp; Inquiries</h2>
                  </div>
                  <p className="legal-paragraph">
                    Need an urgent delivery for a wedding, pooja, or celebration? Contact our dispatch desk:
                  </p>
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <MessageCircle size={18} color="#16a34a" />
                      <span><strong>Live WhatsApp Tracking:</strong> <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700 }}>+91 83002 95721</a></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Phone size={18} color="#7c3aed" />
                      <span><strong>Customer Hotline:</strong> <a href="tel:+918300295721" style={{ color: '#7c3aed', fontWeight: 700 }}>+91 83002 95721</a></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Building size={18} color="#0284c7" />
                      <span><strong>Fulfillment Hub:</strong> 128, West Masi Street, Madurai, Tamil Nadu 625001</span>
                    </div>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MOBILE VIEW (<= 768px) - CLEAN SVG ICONS, 0 EMOJIS, STRICT TYPOGRAPHY
          ══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobileView}>
        {/* Mobile Hero */}
        <header className={styles.mobileHero}>
          <div className={styles.badgePill}>
            <ShieldCheck size={12} color="#E9D5FF" />
            <span>SWIFT, SAFE &amp; INSURED LOGISTICS</span>
          </div>
          <h1 className={styles.heroTitle}>
            Shipping &amp; Delivery<br />
            <span className={styles.heroTitleHighlight}>Policy &amp; Timelines</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Authentic heritage products dispatched directly from our Tamil Nadu fulfillment hubs. Track your packages in real-time with reliable doorstep delivery.
          </p>
          <div className={styles.metaPillsRow}>
            <span className={styles.metaPill}>
              <Clock size={11} color="#E2D9F3" /> Dispatch: 24 – 48 Hours
            </span>
            <span className={styles.metaPill}>
              <ShieldCheck size={11} color="#E2D9F3" /> Insured Shipments
            </span>
            <span className={styles.metaPill}>
              <Truck size={11} color="#E2D9F3" /> Blue Dart, DTDC, India Post
            </span>
          </div>
        </header>

        {/* 1. 2x2 Quick Trust Pillars */}
        <section className={styles.trustGrid} aria-label="Key Shipping Benefits">
          {/* Card 1 */}
          <div className={styles.trustCard}>
            <div className={`${styles.trustIconWrap} ${styles.iconAmber}`}>
              <Zap size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className={styles.trustCardTitle}>24–48h Dispatch</h4>
              <p className={styles.trustCardDesc}>Couriers assigned within 1 to 2 business days.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.trustCard}>
            <div className={`${styles.trustIconWrap} ${styles.iconEmerald}`}>
              <CreditCard size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className={styles.trustCardTitle}>FREE Shipping &gt; ₹999</h4>
              <p className={styles.trustCardDesc}>Zero shipping fee on prepaid &amp; COD orders &gt; ₹999.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.trustCard}>
            <div className={`${styles.trustIconWrap} ${styles.iconPurple}`}>
              <Truck size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className={styles.trustCardTitle}>Trusted Logistics</h4>
              <p className={styles.trustCardDesc}>DTDC, Blue Dart Express &amp; India Speed Post.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className={styles.trustCard}>
            <div className={`${styles.trustIconWrap} ${styles.iconAmberDark}`}>
              <Package size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className={styles.trustCardTitle}>Double-Box Pack</h4>
              <p className={styles.trustCardDesc}>Multi-layer bubble wrap for brass vilakku &amp; silks.</p>
            </div>
          </div>
        </section>

        {/* 2. Sticky Horizontal Policy Quick Jump Rail */}
        <nav className={styles.jumpNavRail} aria-label="Quick Jump Shipping Sections">
          <div className={styles.jumpNavScroll}>
            {MOBILE_SHIPPING_SECTIONS.map((sec) => {
              const isActive = activeMobileSec === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToMobileSec(sec.id)}
                  className={`${styles.jumpNavBtn} ${isActive ? styles.jumpNavBtnActive : ''}`}
                >
                  {sec.num} {sec.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 3. Policy Clauses Cards Container (01 to 08) */}
        <main className={styles.clausesContainer}>
          {/* 01 Order Dispatch & Processing */}
          <article id="sec-01" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>01</span>
              <h2 className={styles.clauseTitle}>Order Dispatch &amp; Processing</h2>
            </div>
            <p className={styles.clauseText}>
              All orders placed on <strong style={{ color: '#19152B', fontWeight: 600 }}>PICKY</strong> are carefully inspected, quality-checked, and packed at our regional fulfillment centers in <strong style={{ color: '#19152B', fontWeight: 600 }}>Madurai and Chennai, Tamil Nadu</strong>.
            </p>
            <div className={styles.highlightList}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#F5EEFF', color: '#8738F5' }}>
                  <Clock size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>Standard Processing</h4>
                  <p className={styles.highlightDesc}>
                    Orders confirmed before 1:00 PM IST on business days are usually dispatched on the same day or next business morning (24–48 hours).
                  </p>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <Sparkles size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>Festive Seasons</h4>
                  <p className={styles.highlightDesc}>
                    During Diwali, Pongal, and festive spikes, high-volume artisanal items might require up to 48 hours for special packaging.
                  </p>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <Calendar size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>Sunday &amp; Public Holidays</h4>
                  <p className={styles.highlightDesc}>
                    Couriers do not operate dispatch on Sundays and national public holidays; processing resumes on the next working morning.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* 02 Estimated Delivery Timelines by Region */}
          <article id="sec-02" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>02</span>
              <h2 className={styles.clauseTitle}>Estimated Delivery Timelines by Region</h2>
            </div>
            <p className={styles.clauseText}>
              Once handed over to logistics partners, expected transit times:
            </p>
            <div className={styles.regionList}>
              {/* Tamil Nadu */}
              <div className={`${styles.regionCard} ${styles.regionCardEmerald}`}>
                <div>
                  <div className={styles.regionHeader}>
                    <MapPin size={13} strokeWidth={2.5} color="#059669" />
                    <h4 className={styles.regionTitle}>
                      Tamil Nadu <span className={styles.regionDistricts}>(All 38 Districts)</span>
                    </h4>
                  </div>
                  <p className={styles.regionCourier} style={{ color: '#047857' }}>
                    <Truck size={11} strokeWidth={2.2} /> DTDC, Blue Dart, Professional Couriers
                  </p>
                </div>
                <span className={`${styles.regionPill} ${styles.regionPillEmerald}`}>2 – 4 Days</span>
              </div>

              {/* South India */}
              <div className={`${styles.regionCard} ${styles.regionCardPurple}`}>
                <div>
                  <div className={styles.regionHeader}>
                    <Navigation size={13} strokeWidth={2.5} color="#8738F5" />
                    <h4 className={styles.regionTitle}>
                      South India <span className={styles.regionDistricts}>(KL, KA, AP, TS)</span>
                    </h4>
                  </div>
                  <p className={styles.regionCourier} style={{ color: '#64748B' }}>
                    <Truck size={11} strokeWidth={2.2} /> Blue Dart Surface &amp; Air, DTDC
                  </p>
                </div>
                <span className={`${styles.regionPill} ${styles.regionPillPurple}`}>3 – 5 Days</span>
              </div>

              {/* Metro Cities */}
              <div className={`${styles.regionCard} ${styles.regionCardPurple}`}>
                <div>
                  <div className={styles.regionHeader}>
                    <Building2 size={13} strokeWidth={2.5} color="#8738F5" />
                    <h4 className={styles.regionTitle}>
                      Metro Cities <span className={styles.regionDistricts}>(Mumbai, Delhi, etc.)</span>
                    </h4>
                  </div>
                  <p className={styles.regionCourier} style={{ color: '#64748B' }}>
                    <Send size={11} strokeWidth={2.2} /> Blue Dart Air Express
                  </p>
                </div>
                <span className={`${styles.regionPill} ${styles.regionPillPurple}`}>3 – 6 Days</span>
              </div>

              {/* Rest of India */}
              <div className={`${styles.regionCard} ${styles.regionCardGray}`}>
                <div>
                  <div className={styles.regionHeader}>
                    <Globe size={13} strokeWidth={2.5} color="#475569" />
                    <h4 className={styles.regionTitle}>Rest of India &amp; Remote</h4>
                  </div>
                  <p className={styles.regionCourier} style={{ color: '#64748B' }}>
                    <Mail size={11} strokeWidth={2.2} /> India Post Speed Post, DTDC
                  </p>
                </div>
                <span className={`${styles.regionPill} ${styles.regionPillGray}`}>4 – 7 Days</span>
              </div>
            </div>
          </article>

          {/* 03 Shipping Charges & Free Delivery Threshold */}
          <article id="sec-03" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>03</span>
              <h2 className={styles.clauseTitle}>Shipping Charges &amp; Free Delivery Threshold</h2>
            </div>
            <p className={styles.clauseText}>
              We believe in completely upfront, transparent pricing without hidden surcharges:
            </p>

            {/* Emerald Free Shipping Callout */}
            <div className={styles.freeShippingCallout}>
              <div className={styles.freeShippingHeader}>
                <Gift size={15} strokeWidth={2.4} color="#059669" />
                <span>FREE SHIPPING on Orders Above ₹999</span>
              </div>
              <p className={styles.freeShippingText}>
                Add products worth ₹999 or more to your cart to automatically qualify for complimentary free express delivery.
              </p>
            </div>

            {/* Nominal fee card */}
            <div className={styles.feeCard}>
              <strong style={{ color: '#19152B', fontWeight: 600 }}>Orders below ₹999:</strong> A nominal standard handling and courier charge of <strong style={{ color: '#8738F5', fontWeight: 700 }}>₹40</strong> is applied at checkout to cover safe transit and protective packaging.
            </div>
          </article>

          {/* 04 Real-Time Order Tracking (AWB) */}
          <article id="sec-04" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>04</span>
              <h2 className={styles.clauseTitle}>Real-Time Order Tracking (AWB)</h2>
            </div>
            <p className={styles.clauseText}>
              As soon as your package is scanned by our logistics partner, we provide complete live tracking transparency:
            </p>
            <div className={styles.highlightList}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#ECFDF5', color: '#059669' }}>
                  <WhatsAppIcon size={15} color="#059669" />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>Automated WhatsApp &amp; SMS Updates</h4>
                  <p className={styles.highlightDesc}>
                    Receive an instant WhatsApp alert containing your Air Waybill (AWB) number and direct carrier tracking URL.
                  </p>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#F5EEFF', color: '#8738F5' }}>
                  <Search size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>Track Online Anytime</h4>
                  <p className={styles.highlightDesc}>
                    Visit our designated <Link to="/track-order" style={{ color: '#8738F5', fontWeight: 600, textDecoration: 'underline' }}>Track Order Page</Link> and enter your Order Number (e.g. <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#19152B' }}>PKY-202610-001</span>).
                  </p>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIconWrap} style={{ background: '#F5EEFF', color: '#8738F5' }}>
                  <User size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <h4 className={styles.highlightTitle}>My Orders Portal</h4>
                  <p className={styles.highlightDesc}>
                    Logged-in customers can view step-by-step progress directly in <Link to="/orders" style={{ color: '#8738F5', fontWeight: 600, textDecoration: 'underline' }}>My Orders</Link>.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* 05 Fragile & Heritage Packaging Standards */}
          <article id="sec-05" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>05</span>
              <h2 className={styles.clauseTitle}>Fragile &amp; Heritage Packaging Standards</h2>
            </div>
            <p className={styles.clauseText}>
              Handcrafted South Indian items require specialized logistics care:
            </p>
            <div className={styles.highlightList}>
              <div className={`${styles.packagingCard} ${styles.packagingAmber}`}>
                <div className={styles.packagingHeader}>
                  <ShieldCheck size={14} strokeWidth={2.4} color="#D97706" />
                  <h4 className={styles.packagingTitle}>Brass Vilakku &amp; Metal Sculptures</h4>
                </div>
                <p className={styles.packagingDesc}>
                  Packed inside custom-molded high-density foam, wrapped in double-layer air bubbles, and housed inside reinforced 5-ply corrugated master cartons with <strong style={{ color: '#DC2626', fontWeight: 700 }}>"FRAGILE / HANDLE WITH CARE"</strong> tamper seals.
                </p>
              </div>

              <div className={`${styles.packagingCard} ${styles.packagingPurple}`}>
                <div className={styles.packagingHeader}>
                  <PackageCheck size={14} strokeWidth={2.4} color="#8738F5" />
                  <h4 className={styles.packagingTitle}>Sungudi Sarees &amp; Handlooms</h4>
                </div>
                <p className={styles.packagingDesc}>
                  Sealed in moisture-barrier virgin polybags to guard against rain, dust, and humidity during transit.
                </p>
              </div>

              <div className={`${styles.packagingCard} ${styles.packagingEmerald}`}>
                <div className={styles.packagingHeader}>
                  <Gift size={14} strokeWidth={2.4} color="#059669" />
                  <h4 className={styles.packagingTitle}>Gift Wrapping (+₹30)</h4>
                </div>
                <p className={styles.packagingDesc}>
                  If selected at checkout, your items are dressed in premium textured paper and accompanied by your printed personalized greeting message.
                </p>
              </div>
            </div>
          </article>

          {/* 06 Cash on Delivery (COD) Guidelines */}
          <article id="sec-06" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>06</span>
              <h2 className={styles.clauseTitle}>Cash on Delivery (COD) Guidelines</h2>
            </div>
            <p className={styles.clauseText}>
              We offer Cash on Delivery across most serviceable Indian pincodes:
            </p>
            <div className={styles.bulletList}>
              <div className={styles.bulletItem}>
                <span className={styles.bulletDot}></span>
                <p className={styles.clauseSubtext} style={{ color: '#4B5563' }}>
                  COD orders may receive an automated verification SMS/WhatsApp confirmation prior to dispatch.
                </p>
              </div>
              <div className={styles.bulletItem}>
                <span className={styles.bulletDot}></span>
                <p className={styles.clauseSubtext} style={{ color: '#4B5563' }}>
                  Please ensure the exact cash amount is ready at the time of delivery. Many delivery partners also accept UPI QR payment upon delivery.
                </p>
              </div>
              <div className={styles.bulletItem}>
                <span className={styles.bulletDot}></span>
                <p className={styles.clauseSubtext} style={{ color: '#4B5563' }}>
                  Open-delivery is not permitted before payment as per standard courier carrier guidelines; however, you are fully covered under our <Link to="/returns" style={{ color: '#8738F5', fontWeight: 600, textDecoration: 'underline' }}>7-Day Replacement Policy</Link>.
                </p>
              </div>
            </div>
          </article>

          {/* 07 Non-Delivery & Address Updates */}
          <article id="sec-07" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>07</span>
              <h2 className={styles.clauseTitle}>Non-Delivery &amp; Address Updates</h2>
            </div>
            <p className={styles.clauseText}>
              Our courier partners attempt delivery up to <strong style={{ color: '#19152B', fontWeight: 600 }}>3 times</strong> before returning an undelivered parcel to our warehouse.
            </p>
            <div style={{ background: 'rgba(245, 238, 255, 0.6)', border: '1px solid #EDE8F8', borderRadius: '12px', padding: '0.85rem' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#19152B', margin: '0 0 0.25rem' }}>
                Need to update address or reschedule date?
              </h4>
              <p className={styles.clauseSubtext} style={{ color: '#4B5563' }}>
                Please message our support team on WhatsApp at <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" style={{ color: '#8738F5', fontWeight: 700, textDecoration: 'underline' }}>+91 83002 95721</a> before the 2nd delivery attempt.
              </p>
            </div>
          </article>

          {/* 08 Shipping Helpdesk & Inquiries */}
          <article id="sec-08" className={styles.clauseArticle}>
            <div className={styles.clauseHeader}>
              <span className={styles.numBadge}>08</span>
              <h2 className={styles.clauseTitle}>Shipping Helpdesk &amp; Inquiries</h2>
            </div>
            <p className={styles.clauseText}>
              Need an urgent delivery for a wedding, pooja, or celebration? Contact our dispatch desk:
            </p>
            <div className={styles.helpdeskList}>
              {/* WhatsApp */}
              <a
                href="https://wa.me/918300295721"
                target="_blank"
                rel="noreferrer"
                className={`${styles.helpdeskRowCard} ${styles.helpdeskWa}`}
              >
                <div className={`${styles.helpdeskIconWrap} ${styles.iconBgGreen}`}>
                  <WhatsAppIcon size={18} color="#ffffff" />
                </div>
                <div>
                  <span className={styles.helpdeskLabel}>Live WhatsApp Tracking</span>
                  <p className={styles.helpdeskValGreen}>+91 83002 95721</p>
                </div>
              </a>

              {/* Phone */}
              <div className={`${styles.helpdeskRowCard} ${styles.helpdeskPhone}`}>
                <div className={`${styles.helpdeskIconWrap} ${styles.iconBgPurple}`}>
                  <Phone size={17} color="#ffffff" />
                </div>
                <div>
                  <span className={styles.helpdeskLabel}>Customer Helpline</span>
                  <p className={styles.helpdeskValDark}>+91 83002 95721</p>
                </div>
              </div>

              {/* Hub Address */}
              <div className={`${styles.helpdeskRowCard} ${styles.helpdeskHub}`}>
                <div className={`${styles.helpdeskIconWrap} ${styles.iconBgRed}`}>
                  <MapPin size={17} color="#DC2626" />
                </div>
                <div>
                  <span className={styles.helpdeskLabel}>Fulfillment Hub</span>
                  <p className={styles.helpdeskValMuted}>
                    128, West Masi Street, Madurai, Tamil Nadu 625001
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Urgent Pooja & Wedding Orders Direct Dispatch Banner */}
          <div className={styles.urgentBanner}>
            <div>
              <span className={styles.urgentEyebrow}>Urgent Pooja &amp; Wedding Orders?</span>
              <h4 className={styles.urgentHeading}>Direct Dispatch Desk Support</h4>
            </div>
            <a
              href="https://wa.me/918300295721"
              target="_blank"
              rel="noreferrer"
              className={styles.urgentChatBtn}
            >
              <span>Chat Now</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </a>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}

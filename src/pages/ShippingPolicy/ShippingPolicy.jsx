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
} from 'lucide-react';
import { usePageCustomization } from '../../store/customizationStore';
import '../../styles/legal.css';

const SHIPPING_SECTIONS = [
  { id: 'dispatch', label: 'Dispatch & Processing', icon: Zap },
  { id: 'timelines', label: 'Delivery Timelines', icon: Clock },
  { id: 'charges', label: 'Shipping Charges & Free Delivery', icon: CreditCard },
  { id: 'tracking', label: 'Order Tracking (AWB)', icon: Truck },
  { id: 'packaging', label: 'Fragile Packaging Standards', icon: Package },
  { id: 'cod', label: 'Cash on Delivery (COD)', icon: Building },
  { id: 'rto', label: 'Non-Delivery & Address Updates', icon: MapPin },
  { id: 'support', label: 'Shipping Helpdesk', icon: Phone },
];

export default function ShippingPolicy() {
  const { isEnabled, getSetting } = usePageCustomization('content_pages');
  const turnaroundBlurb = getSetting('policy_shipping_content', 'turnaroundBlurb', 'Dispatched within 24 to 48 hours via trusted couriers (DTDC, Blue Dart & Delhivery).');
  const expressTimeline = getSetting('policy_shipping_content', 'expressTimeline', '2 to 4 business days across Tamil Nadu, 4 to 6 business days nationwide.');
  const [activeSection, setActiveSection] = useState('dispatch');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of SHIPPING_SECTIONS) {
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
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <PageWrapper>
      <div className="legal-page-wrapper">
        {/* ── 1. Hero Banner ──────────────────────────────────────────────── */}
        <header className="legal-hero-wrapper">
          <div className="legal-hero-container">
            <div className="legal-badge-pill">
              <Truck size={14} className="legal-badge-icon" />
              <span>SWIFT, SAFE & INSURED LOGISTICS</span>
            </div>
            <h1 className="legal-hero-title">
              Shipping & Delivery<br />
              <span className="legal-hero-highlight">Policy & Timelines</span>
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

        {/* ── 2. Quick Highlight 4-Card Grid ─────────────────────────────── */}
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
                Multi-layer air bubble cushion protection specifically for brass vilakku & handlooms.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Main Content & Sticky Sidebar ────────────────────────────── */}
        <div className="legal-grid-container">
          <div className="legal-layout-grid">
            {/* Sticky Navigation Sidebar */}
            <aside className="legal-sidebar-sticky">
              <nav className="legal-nav-card" aria-label="Shipping Sections">
                <div className="legal-nav-header">
                  <span className="legal-nav-title">SHIPPING NAVIGATION</span>
                </div>
                <div className="legal-nav-list">
                  {SHIPPING_SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
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
                  <h2 className="legal-section-title">Order Dispatch & Processing</h2>
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
                    <strong>Sunday & Public Holidays:</strong> Couriers do not operate dispatch on Sundays and national public holidays; processing resumes on the next working morning.
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
                        <td style={{ padding: '0.75rem 1rem' }}>Blue Dart Surface & Air, DTDC</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Metro Cities (Mumbai, Delhi, Kolkata)</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#0284c7', fontWeight: 700 }}>3 – 6 Business Days</td>
                        <td style={{ padding: '0.75rem 1rem' }}>Blue Dart Air Express</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Rest of India & Remote Areas</td>
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
                  <h2 className="legal-section-title">Shipping Charges & Free Delivery Threshold</h2>
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
                    <strong>Automated WhatsApp & SMS Updates:</strong> You will receive an instant WhatsApp alert containing your Air Waybill (AWB) number and direct courier tracking URL.
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
                  <h2 className="legal-section-title">Fragile & Heritage Packaging Standards</h2>
                </div>
                <p className="legal-paragraph">
                  Handcrafted South Indian items require specialized logistics care:
                </p>
                <ul className="legal-list">
                  <li>
                    <strong>Brass Vilakku & Metal Sculptures:</strong> Packed inside custom-molded high-density foam, wrapped in double-layer air bubbles, and housed inside reinforced 5-ply corrugated master cartons with "FRAGILE / HANDLE WITH CARE" tamper seals.
                  </li>
                  <li>
                    <strong>Sungudi Sarees & Handlooms:</strong> Sealed in moisture-barrier virgin polybags to guard against rain, dust, and humidity during transit.
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
                  <h2 className="legal-section-title">Non-Delivery & Address Updates</h2>
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
                  <h2 className="legal-section-title">Shipping Helpdesk & Inquiries</h2>
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
    </PageWrapper>
  );
}

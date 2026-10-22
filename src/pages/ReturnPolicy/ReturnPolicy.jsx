import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  CreditCard,
  MessageCircle,
  FileText,
  ArrowRight,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { usePageCustomization } from '../../store/customizationStore';
import '../../styles/legal.css';

const RETURN_SECTIONS = [
  { id: 'overview', label: 'Policy Overview', icon: RotateCcw },
  { id: 'eligibility', label: '7-Day Return Eligibility', icon: ShieldCheck },
  { id: 'non-returnable', label: 'Non-Returnable Items', icon: AlertTriangle },
  { id: 'damaged', label: 'Damaged or Defective Items', icon: PackageCheck },
  { id: 'process', label: 'How to Initiate a Return', icon: RefreshCw },
  { id: 'refunds', label: 'Refund Timeline & Mode', icon: CreditCard },
  { id: 'cancellation', label: 'Order Cancellation', icon: Clock },
  { id: 'contact', label: 'Help Desk & Contact', icon: MessageCircle },
];

export default function ReturnPolicy() {
  const { isEnabled, getSetting } = usePageCustomization('content_pages');
  const returnDays = getSetting('policy_return_content', 'returnDays', 7);
  const returnBlurb = getSetting('policy_return_content', 'returnBlurb', 'Enjoy a hassle-free 7-day replacement and transparent refund guarantee.');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
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
              <RotateCcw size={14} className="legal-badge-icon" />
              <span>100% BUYER SATISFACTION GUARANTEE</span>
            </div>
            <h1 className="legal-hero-title">
              Return, Replacement &<br />
              <span className="legal-hero-highlight">Refund Policy</span>
            </h1>
            <p className="legal-hero-subtitle">
              We stand behind the heritage craftsmanship of every handloom saree, brass vilakku, and native item. Enjoy a hassle-free 7-day replacement and transparent refund guarantee.
            </p>
            <div className="legal-meta-row">
              <span className="legal-meta-pill">
                <Clock size={13} /> Effective: October 2026
              </span>
              <span className="legal-meta-pill">
                <ShieldCheck size={13} /> 7-Day Window
              </span>
              <span className="legal-meta-pill">
                <CreditCard size={13} /> Instant UPI & Bank Refunds
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
                <Clock size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                7-Day Replacement
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Free replacement or exchange if items arrive damaged, defective, or mismatch expectations.
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
                <Truck size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                Doorstep Reverse Pickup
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Our courier partners (DTDC, Blue Dart) arrange doorstep pickup directly from your address.
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
                <CreditCard size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                3-5 Days Direct Refund
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Funds returned directly to your original payment method, UPI account, or direct bank transfer.
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
                <MessageCircle size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
                Direct WhatsApp Help
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Chat live with human support at +91 83002 95721 with photo proof for instant approvals.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Main Policy Content & Sticky Sidebar ────────────────────── */}
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
              <section id="overview" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">01</div>
                  <h2 className="legal-section-title">Policy Overview & Our Commitment</h2>
                </div>
                <p className="legal-paragraph">
                  At <strong>Picky</strong>, we celebrate authentic South Indian craftsmanship — bringing Madurai Sungudi sarees, Nachiarkoil brass lamps, and traditional handmade goods directly into your homes. We inspect every single item prior to dispatch to ensure pure quality.
                </p>
                <p className="legal-paragraph">
                  However, if you are not fully delighted with your purchase due to a manufacturing defect, transit damage, or size mismatch, our return and replacement process is designed to be effortless, transparent, and completely fair to you.
                </p>
              </section>

              {/* Section 2 */}
              <section id="eligibility" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">02</div>
                  <h2 className="legal-section-title">7-Day Replacement & Return Eligibility</h2>
                </div>
                <p className="legal-paragraph">
                  You may request a return or replacement within <strong>7 calendar days</strong> from the date your order is successfully delivered by our courier partners.
                </p>
                <ul className="legal-list">
                  <li>
                    <strong>Unused & Unaltered Condition:</strong> Sarees, apparel, and home decor must be unworn, unwashed, and free of stains, perfumes, or tailoring alterations.
                  </li>
                  <li>
                    <strong>Original Tags & Packaging:</strong> Original brand labels, tags, and artisan authentication cards must remain intact.
                  </li>
                  <li>
                    <strong>Complete Inclusions:</strong> Any accessories, complimentary items, or brass accessories included in the original package must be returned together.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="non-returnable" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">03</div>
                  <h2 className="legal-section-title">Non-Returnable & Exempted Items</h2>
                </div>
                <p className="legal-paragraph">
                  For hygiene and safety reasons, certain categories cannot be returned once delivered:
                </p>
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#991b1b', lineHeight: 1.5 }}>
                    <strong>Exempted Items:</strong>
                    <br />• <strong>Native Sweets & Snacks:</strong> Traditional food items, podis, and sweets once seal is broken (unless damaged/expired upon arrival).
                    <br />• <strong>Personalized / Custom Stitched:</strong> Sarees stitched with fall/pico or blouses tailored to personal measurements.
                    <br />• <strong>Fragrance & Kumkum:</strong> Unsealed pooja oils, dhoop, and kumkum powders.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="damaged" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">04</div>
                  <h2 className="legal-section-title">Damaged or Defective Items Received</h2>
                </div>
                <p className="legal-paragraph">
                  In the rare event that your product arrives defective, damaged during transit, or missing a part:
                </p>
                <ol className="legal-list">
                  <li>
                    Please inform us within <strong>48 hours of delivery</strong> with unboxing photos or a short video showing the outer courier label and defect.
                  </li>
                  <li>
                    You can share the images via WhatsApp at <strong>+91 83002 95721</strong> or email <strong>care@pickystore.in</strong>.
                  </li>
                  <li>
                    Our quality team will review within 2 to 4 hours and immediately dispatch a brand-new replacement at zero additional delivery charge.
                  </li>
                </ol>
              </section>

              {/* Section 5 */}
              <section id="process" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">05</div>
                  <h2 className="legal-section-title">How to Initiate a Return</h2>
                </div>
                <p className="legal-paragraph">
                  You can initiate a return directly online or via WhatsApp:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ede8f8', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <strong style={{ color: '#1e1b4b' }}>Via Your Account:</strong> Navigate to <Link to="/orders" style={{ color: '#7c3aed', textDecoration: 'underline' }}>My Orders</Link>, open your order detail page, and click <strong>"Request Return / Replacement"</strong>.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ede8f8', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <strong style={{ color: '#1e1b4b' }}>Via WhatsApp:</strong> Send your Order Number (e.g. <code>PKY-202610-001</code>) to <strong>+91 83002 95721</strong>.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ede8f8', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <strong style={{ color: '#1e1b4b' }}>Doorstep Pickup:</strong> Our courier executive will collect the item from your home within 24–48 hours. Keep the box ready.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="refunds" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">06</div>
                  <h2 className="legal-section-title">Refund Processing Timelines & Modes</h2>
                </div>
                <p className="legal-paragraph">
                  Once your returned package reaches our fulfillment center and passes basic verification, your refund will be credited according to your original payment mode:
                </p>
                <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #ede8f8' }}>
                    <thead>
                      <tr style={{ background: '#f5f0fe', color: '#5b21b6', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Payment Method</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Refund Mode</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Expected Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>UPI (GPay / PhonePe / Paytm)</td>
                        <td style={{ padding: '0.75rem 1rem' }}>Direct UPI Reverse Transfer</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 700 }}>24 - 48 Hours</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Credit / Debit Card</td>
                        <td style={{ padding: '0.75rem 1rem' }}>Original Bank Card Account</td>
                        <td style={{ padding: '0.75rem 1rem' }}>3 - 5 Business Days</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1eafa' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Net Banking</td>
                        <td style={{ padding: '0.75rem 1rem' }}>Original Bank Account</td>
                        <td style={{ padding: '0.75rem 1rem' }}>3 - 5 Business Days</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Cash on Delivery (COD)</td>
                        <td style={{ padding: '0.75rem 1rem' }}>Bank NEFT / Direct UPI Transfer</td>
                        <td style={{ padding: '0.75rem 1rem' }}>2 - 4 Business Days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 7 */}
              <section id="cancellation" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">07</div>
                  <h2 className="legal-section-title">Order Cancellation Policy</h2>
                </div>
                <p className="legal-paragraph">
                  You can easily cancel your order online prior to dispatch:
                </p>
                <ul className="legal-list">
                  <li>
                    <strong>Before Dispatch:</strong> If your order status is <code>Confirmed</code> or <code>Packing</code>, you can cancel directly from <Link to="/orders" style={{ color: '#7c3aed', textDecoration: 'underline' }}>My Orders</Link> with zero cancellation charges. Instant 100% refund is initiated immediately.
                  </li>
                  <li>
                    <strong>After Dispatch:</strong> If the package has already been handed over to DTDC or Blue Dart, it cannot be cancelled in transit. You may decline delivery when the courier arrives, or initiate a standard return upon receipt.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section id="contact" className="legal-section">
                <div className="legal-section-header">
                  <div className="legal-section-num">08</div>
                  <h2 className="legal-section-title">Customer Care & Support Helpdesk</h2>
                </div>
                <p className="legal-paragraph">
                  Have questions regarding your return or refund status? Our dedicated support team is available Mon–Sat from 9:30 AM to 7:00 PM IST:
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
                    <span><strong>WhatsApp Support:</strong> <a href="https://wa.me/918300295721" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700 }}>+91 83002 95721</a></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FileText size={18} color="#7c3aed" />
                    <span><strong>Email:</strong> <a href="mailto:care@pickystore.in" style={{ color: '#7c3aed', fontWeight: 700 }}>care@pickystore.in</a></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Clock size={18} color="#0284c7" />
                    <span><strong>Working Hours:</strong> Monday – Saturday: 9:30 AM – 7:00 PM IST</span>
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

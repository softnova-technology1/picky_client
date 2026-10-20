import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  Search,
  X,
  ChevronDown,
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  Ruler,
  Sparkles,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  PackageCheck,
  FileText
} from 'lucide-react';
import styles from './Faq.module.css';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'orders', label: 'Orders & Tracking', icon: Truck },
  { id: 'payments', label: 'Payments & COD', icon: CreditCard },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'sizing', label: 'Sizing & Saree Guide', icon: Ruler },
  { id: 'authenticity', label: 'Artisans & Craft', icon: Sparkles },
];

const FAQ_DATA = [
  {
    id: 1,
    category: 'orders',
    question: 'How do I track my order status in real time?',
    answer: 'Once your order is dispatched, you will receive an automated WhatsApp and SMS notification with your dedicated courier AWB tracking number. You can also track your package anytime directly from our "Track Order" page or through your Picky Account under "My Orders".',
    highlight: 'Real-time live milestone updates are synced directly with DTDC, Blue Dart, and India Post speed post logistics.',
    tags: ['track', 'awb', 'courier', 'dispatch', 'status']
  },
  {
    id: 2,
    category: 'orders',
    question: 'How long does delivery take across India?',
    answer: 'Orders are dispatched within 24 to 48 hours of order confirmation. Delivery timelines:\n• Within Tamil Nadu: 2 to 4 business days\n• Other South Indian States (KA, KL, AP, TS): 3 to 5 business days\n• Rest of India & Metro Cities: 4 to 7 business days\n• Remote & North-East Locations: 6 to 9 business days.',
    highlight: 'Free standard shipping is applicable on all prepaid and COD orders above ₹999.',
    tags: ['delivery', 'timeline', 'shipping', 'days', 'speed']
  },
  {
    id: 3,
    category: 'orders',
    question: 'Can I cancel my order before it is shipped?',
    answer: 'Yes! You have full self-service control. Simply navigate to "My Orders", open the specific Order Details, and click the "Cancel Order" button. If the order has not yet been dispatched, it will be cancelled immediately and your refund will be automatically triggered.',
    highlight: 'Once an order is marked as "Shipped" or "Out for Delivery", cancellation is disabled and you can opt for 7-day hassle-free return upon delivery.',
    tags: ['cancel', 'cancellation', 'modify', 'stop order']
  },
  {
    id: 4,
    category: 'payments',
    question: 'Is Cash on Delivery (COD) available for my pincode?',
    answer: 'Yes, Cash on Delivery is available across 19,000+ serviceable postal pin codes in India for orders up to ₹5,000. For orders exceeding ₹5,000 or custom artisan-engraved items, secure prepaid checkout is required to secure our weaver reservation.',
    highlight: 'An automated OTP or WhatsApp confirmation call may be triggered for high-value COD orders before dispatch.',
    tags: ['cod', 'cash on delivery', 'payment', 'pincode']
  },
  {
    id: 5,
    category: 'payments',
    question: 'Are online payments secure on Picky?',
    answer: '100% secure. All online transactions are processed through Razorpay with 256-bit bank-grade TLS encryption and RBI-mandated Two-Factor Authentication (2FA). We do not store your debit/credit card numbers or CVV on our servers.',
    highlight: 'We support all major payment modes: Google Pay, PhonePe, Paytm UPI, Rupay, Visa, MasterCard, and NetBanking across 50+ Indian banks.',
    tags: ['secure', 'payment', 'razorpay', 'upi', 'gpay', 'phonepe', 'card']
  },
  {
    id: 6,
    category: 'payments',
    question: 'What happens if my payment fails but money was deducted?',
    answer: 'In rare banking gateway timeouts, your bank automatically holds the amount in an escrow reversal pool. The deduction usually auto-reverses to your original bank account or UPI handle within 24 to 48 hours. If you need confirmation, share your bank reference UTR number with our support team.',
    highlight: 'Our customer support verifies gateway logs within 15 minutes during business hours.',
    tags: ['payment failure', 'deducted', 'bank refund', 'razorpay']
  },
  {
    id: 7,
    category: 'returns',
    question: 'What is Picky’s Return & Replacement Policy?',
    answer: 'We provide a customer-first 7-Day Replacement & Return Guarantee for all handloom sarees, apparel, and brass decor from the date of physical delivery. If your item is damaged, defective, or incorrect, you can initiate a return directly from your Order Detail page.',
    highlight: 'Our courier partner will arrange a doorstep reverse pickup from your registered address with zero return shipping charge.',
    tags: ['returns', 'replacement', 'damaged', '7 days', 'exchange']
  },
  {
    id: 8,
    category: 'returns',
    question: 'How long will my refund take after returning an item?',
    answer: 'Once the returned item is collected and passes our basic quality inspection at the local fulfillment hub, your refund is credited:\n• UPI & Wallets: 24 to 48 hours\n• Net Banking & Credit/Debit Cards: 3 to 5 business days\n• Cash on Delivery (COD): Refund is credited to your provided UPI ID or verified bank account via instant IMPS/NEFT.',
    highlight: 'You will receive an official Razorpay Refund Reference ID via email and SMS for instant bank tracking.',
    tags: ['refund', 'money back', 'reversal', 'time', 'neft']
  },
  {
    id: 9,
    category: 'returns',
    question: 'Which items are non-returnable?',
    answer: 'Perishable South Indian traditional snacks/sweets, intimate wear, and personalized brass statues that have custom family names engraved are strictly non-returnable unless received physically damaged in transit.',
    highlight: 'For damaged transit claims on brass or fragile artifacts, an unboxing photo or short clip is appreciated for swift processing.',
    tags: ['non-returnable', 'sweets', 'custom engraving', 'exceptions']
  },
  {
    id: 10,
    category: 'sizing',
    question: 'What is the standard length and blouse piece of Madurai Sungudi & Silk Sarees?',
    answer: 'All authentic Picky sarees adhere strictly to traditional Indian handloom dimensions:\n• Total Length: 6.30 meters (Full Saree 5.5 meters + 0.8 meter matching unstitched blouse piece).\n• Saree Width: 44 to 47 inches.\n• Weight: Sungudi cottons weigh approximately 450g to 550g, ideal for breathable all-day elegance.',
    highlight: 'Detailed draping guidelines, blouse chest measurements, and care instructions are available on our dedicated Size Guide page.',
    tags: ['saree length', 'sungudi', 'blouse piece', 'size', 'meters', 'cotton']
  },
  {
    id: 11,
    category: 'sizing',
    question: 'How do I choose the right Dhoti / Veshti and Kurta size?',
    answer: 'Our traditional South Indian dhotis/veshtis come in standard 4 Muzham (2 meters for single) and 8 Muzham (3.8 meters for double) specifications with 100% combed cotton. For Kurtas and Shirts, we provide standard chest measurements from 38 (M) to 46 (XXL) with pre-shrunk cotton fabric.',
    highlight: 'Check our interactive Size Guide for centimeter and inch conversion charts.',
    tags: ['veshti', 'dhoti', 'kurta', 'size guide', 'measurement']
  },
  {
    id: 12,
    category: 'authenticity',
    question: 'Are all Madurai Sungudi sarees genuinely hand-dyed?',
    answer: 'Yes! Every Picky Sungudi saree is procured directly from heritage weaver cooperatives in Madurai, Tamil Nadu. They feature genuine tie-and-dye (bandhani knots), natural wax prints, and traditional zari borders created by multigenerational artisan families.',
    highlight: 'Each saree includes a certified Handloom & Craft Authenticity Seal with the weaver cluster designation.',
    tags: ['handloom', 'madurai', 'sungudi', 'pure', 'authentic', 'weavers']
  },
  {
    id: 13,
    category: 'authenticity',
    question: 'Are the Brass Vilakku (lamps) and deities made of solid brass?',
    answer: 'Yes. Our Nachiarkoil and Swamimalai collection brass lamps (Kuthu Vilakku, Annam Vilakku, Kamakshi Vilakku) are hand-cast using traditional lost-wax sand-casting techniques with pure heavy virgin brass alloy. They are not thin electroplated sheet metals.',
    highlight: 'They feature an artisan protective coat to maintain their divine golden luster without rapid tarnishing.',
    tags: ['brass', 'kuthu vilakku', 'solid brass', 'weight', 'pooja']
  },
  {
    id: 14,
    category: 'authenticity',
    question: 'Can I download an official GST Tax Invoice for my business or accounts?',
    answer: 'Yes, every order placed on Picky generates an official GST Tax Invoice compliant with Indian Tax regulations, showing our registered GSTIN, HSN codes, and CGST/SGST breakdowns. You can download and print this PDF anytime directly from your Order Detail page.',
    highlight: 'GST input tax credit (B2B) can be availed if you mention your GSTIN during checkout.',
    tags: ['gst', 'invoice', 'tax', 'download pdf', 'bill']
  }
];

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState([1, 7]); // Keep first order & return item open initially

  const toggleAccordion = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickSearch = (keyword) => {
    setSearchQuery(keyword);
    setActiveCategory('all');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter logic
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchQuestion = item.question.toLowerCase().includes(q);
      const matchAnswer = item.answer.toLowerCase().includes(q);
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchQuestion || matchAnswer || matchTags;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageWrapper>
      <div className={styles.pageWrapper}>
        {/* Executive Hero Banner */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <HelpCircle size={15} /> Picky Help Center & Customer Care
            </div>
            <h1 className={styles.title}>
              How can we <span className={styles.titleHighlight}>help you today?</span>
            </h1>
            <p className={styles.subtitle}>
              Find instant answers to questions regarding your orders, regional deliveries, 7-day returns, Sungudi sarees, and solid brass temple crafts.
            </p>

            {/* Live Search Input */}
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={22} />
              <input
                type="text"
                placeholder="Search by topic, e.g. 'track order', 'returns', 'saree length', 'COD'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={styles.clearSearchBtn}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            <div className={styles.quickPills}>
              <span className={styles.quickPillLabel}>Popular topics:</span>
              <button
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickSearch('track order')}
              >
                📦 Track Order
              </button>
              <button
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickSearch('return')}
              >
                🔄 7-Day Returns
              </button>
              <button
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickSearch('cod')}
              >
                💵 Cash on Delivery
              </button>
              <button
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickSearch('saree length')}
              >
                📐 Saree Measurements
              </button>
              <button
                type="button"
                className={styles.quickPill}
                onClick={() => handleQuickSearch('invoice')}
              >
                📄 GST Tax Invoice
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className={styles.container}>
          {/* Category Tabs */}
          <div className={styles.categoryBar}>
            {FAQ_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${styles.categoryTab} ${
                    isActive ? styles.categoryTabActive : ''
                  }`}
                >
                  <Icon size={16} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className={styles.faqList}>
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={`${styles.faqItem} ${
                      isOpen ? styles.faqItemOpen : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className={styles.faqHeader}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.questionLeft}>
                        <div className={styles.qIconBox}>
                          <HelpCircle size={18} />
                        </div>
                        <span className={styles.questionText}>
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`${styles.chevronIcon} ${
                          isOpen ? styles.chevronRotated : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className={styles.faqAnswer}>
                        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                          {faq.answer}
                        </p>
                        {faq.highlight && (
                          <div className={styles.answerHighlight}>
                            <strong>Key Point:</strong> {faq.highlight}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={28} />
              </div>
              <h3 className={styles.emptyTitle}>No matching questions found</h3>
              <p className={styles.emptyDesc}>
                We couldn't find any questions matching "{searchQuery}". Try searching with different keywords or contact our team directly.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '0.65rem 1.4rem' }}
              >
                Clear Search Filter
              </button>
            </div>
          )}

          {/* Quick Policy Navigation Cards */}
          <div className={styles.quickNavGrid}>
            <Link to="/returns" className={styles.quickNavCard}>
              <div className={styles.quickNavIcon}>
                <RotateCcw size={20} />
              </div>
              <div>
                <div className={styles.quickNavTitle}>Return & Refund Policy</div>
                <div className={styles.quickNavSub}>7-day replacement & reversal guide</div>
              </div>
            </Link>

            <Link to="/shipping-policy" className={styles.quickNavCard}>
              <div className={styles.quickNavIcon}>
                <Truck size={20} />
              </div>
              <div>
                <div className={styles.quickNavTitle}>Shipping & Delivery</div>
                <div className={styles.quickNavSub}>Timelines, courier partners & rates</div>
              </div>
            </Link>

            <Link to="/size-guide" className={styles.quickNavCard}>
              <div className={styles.quickNavIcon}>
                <Ruler size={20} />
              </div>
              <div>
                <div className={styles.quickNavTitle}>Size & Fit Guide</div>
                <div className={styles.quickNavSub}>Saree, blouse, dhoti & brass dimensions</div>
              </div>
            </Link>

            <Link to="/terms" className={styles.quickNavCard}>
              <div className={styles.quickNavIcon}>
                <FileText size={20} />
              </div>
              <div>
                <div className={styles.quickNavTitle}>Terms of Service</div>
                <div className={styles.quickNavSub}>Buyer protection & store policies</div>
              </div>
            </Link>
          </div>

          {/* Live Support Banner */}
          <div className={styles.supportBanner}>
            <div className={styles.supportLeft}>
              <h3 className={styles.supportTitle}>Still need assistance? We're here for you!</h3>
              <p className={styles.supportDesc}>
                Our customer care team and craft specialists are available Monday to Saturday, 9:30 AM to 7:00 PM IST to assist you with order tracking, custom saree inquiries, or bulk brass orders.
              </p>
            </div>
            <div className={styles.supportActions}>
              <a
                href="https://wa.me/919876543210?text=Hello%20Picky%20Support,%20I%20have%20a%20question%20regarding%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
              <Link to="/contact" className={styles.callBtn}>
                <PhoneCall size={18} /> Contact Support
              </Link>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}

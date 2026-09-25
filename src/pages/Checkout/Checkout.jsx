import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { orderService } from '../../services/order.service';
import { addOrderToStore } from '../../data';
import { formatPrice } from '../../utils/formatPrice';
import { MOCK_COUPONS } from '../../data/adminMockData';
import { useOrderStore } from '../../store/orderStore';
import styles from './Checkout.module.css';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  Sparkles,
  User,
  Phone,
  Mail,
  X,
  ShoppingBag,
  Building2,
  QrCode,
  Tag,
  Minus,
  Plus,
  Edit3
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, updateQty, coupon, couponDiscount, setCoupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useUiStore();
  const { addOrder } = useOrderStore();

  // Workflow step: 1 = 'checkout' (Shipping & Delivery Form), 2 = 'payment' (Payment Method & Order Summary)
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Customer Contact & Shipping Address Form State (Always 100% empty by default)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
    landmark: '',
  });

  // Ensure any cached legacy test data is purged so the form starts 100% empty
  React.useEffect(() => {
    try {
      localStorage.removeItem('picky-saved-addresses');
    } catch (_) {}
  }, []);

  // Delivery Mode Selection: 'standard' | 'pickup'
  const [deliveryMode, setDeliveryMode] = useState('standard');

  // Selected Payment Method: 'card' | 'upi' | 'netbanking'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Promo Code Input
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Payment processing & Razorpay Modal state
  const [loading, setLoading] = useState(false);
  const [showRzModal, setShowRzModal] = useState(false);
  const [rzTab, setRzTab] = useState('card');
  const [upiId, setUpiId] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate pricing breakdown
  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  // Original total before discounts for strikethrough effect
  const originalSubtotal = items.reduce((sum, item) => {
    const origPrice = item.price && item.discountPrice && item.price > item.discountPrice
      ? item.price
      : Math.round((item.discountPrice || item.price || 0) * 1.25);
    return sum + origPrice * (item.quantity || 1);
  }, 0);

  // Shipping & Delivery Fee: ₹60 for Standard Delivery, ₹0 for Self Pickup
  const deliveryFee = deliveryMode === 'pickup' ? 0 : 60;
  
  // Fixed Convenience Fee as shown in reference design: ₹2
  const convenienceFee = items.length > 0 ? 2 : 0;

  // Final Payable
  const finalPayable = Math.max(0, subtotal + deliveryFee + convenienceFee - (couponDiscount || 0));

  // Handle Promo Code Application — validated against centralized MOCK_COUPONS
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code');
      return;
    }

    // Find matching active coupon from MOCK_COUPONS
    const matched = MOCK_COUPONS.find(
      (c) => c.code.toUpperCase() === code && c.isActive
    );

    if (!matched) {
      const inactive = MOCK_COUPONS.find((c) => c.code.toUpperCase() === code);
      if (inactive) {
        setPromoError(`Coupon "${code}" has expired or is no longer active.`);
      } else {
        const activeCodes = MOCK_COUPONS.filter((c) => c.isActive).map((c) => c.code).join(', ');
        setPromoError(`Invalid coupon. Try: ${activeCodes}`);
      }
      showToast('Coupon code is invalid or inactive', 'error');
      return;
    }

    if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
      setPromoError(
        `Minimum order of ${formatPrice(matched.minOrderAmount)} required for coupon "${code}".`
      );
      showToast(`Min. order ${formatPrice(matched.minOrderAmount)} needed`, 'error');
      return;
    }

    let discount = 0;
    if (matched.type === 'percentage') {
      discount = Math.round((subtotal * matched.value) / 100);
      if (matched.maxDiscountAmount) {
        discount = Math.min(discount, matched.maxDiscountAmount);
      }
    } else {
      // flat
      discount = Math.min(subtotal, matched.value);
    }

    setCoupon(code, discount);
    const savingText = matched.type === 'percentage'
      ? `${matched.value}% OFF — saved ${formatPrice(discount)}`
      : `₹${matched.value} OFF applied`;
    showToast(`🎉 Coupon "${code}" applied! ${savingText}.`, 'success');
    setPromoCodeInput('');
  };

  const handleRemovePromo = () => {
    setCoupon(null, 0);
    showToast('Coupon code removed', 'info');
  };

  // Step 1 Validation & Proceeding to Payment Step
  const handleConfirmDetails = (e) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    if (!formData.pincode.trim()) {
      showToast('Please enter your PIN code', 'error');
      return;
    }
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim()) {
      showToast('Please fill in your full address (Flat/House, City, State)', 'error');
      return;
    }

    // Advance to Payment step where right side order summary column is displayed
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Payment Initiation
  const handleInitiatePayment = async () => {
    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (isLoaded && window.Razorpay) {
        try {
          const cartPayload = items.map((i) => ({
            productId: i.productId || i._id || i.id,
            quantity: i.quantity || 1,
          }));

          const rzInitRes = await orderService.createRazorpayOrder({
            shippingAddress: formData,
            items: cartPayload,
          });

          if (rzInitRes?.data?.razorpayOrderId) {
            const rzData = rzInitRes.data;
            const options = {
              key: rzData.keyId,
              amount: rzData.amount,
              currency: 'INR',
              name: 'Picky Store',
              description: `Order Payment (${items.length} items)`,
              image: '/images/logo.png',
              order_id: rzData.razorpayOrderId,
              prefill: {
                name: formData.fullName,
                contact: formData.phone,
                email: formData.email,
              },
              theme: { color: '#7c3aed' },
              handler: async (response) => {
                const orderId = 'ord_' + Date.now();
                const newOrder = {
                  _id: orderId,
                  id: orderId,
                  orderNumber: 'ORD-2026-' + Math.floor(10000 + Math.random() * 90000),
                  customer: { name: formData.fullName, phone: formData.phone, email: formData.email },
                  shippingAddress: formData,
                  deliveryMode: deliveryMode === 'pickup' ? 'Self Pickup' : 'Standard Delivery',
                  paymentMethod: paymentMethod,
                  items: [...items],
                  subtotal,
                  deliveryFee,
                  convenienceFee,
                  discountAmount: couponDiscount || 0,
                  totalAmount: finalPayable,
                  total: finalPayable,
                  status: 'confirmed',
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  courier: deliveryMode === 'pickup' ? 'Self Store Pickup' : 'Standard Surface Delivery',
                  createdAt: new Date().toISOString(),
                };
                addOrderToStore(newOrder);
                addOrder(newOrder);
                clearCart();
                showToast('🎉 Payment Successful! Order placed successfully.', 'success');
                navigate(`/order-success/${newOrder._id}`);
              },
              modal: { ondismiss: () => setLoading(false) },
            };
            const rzInstance = new window.Razorpay(options);
            rzInstance.open();
            return;
          }
        } catch (_) {}
      }
    } catch (_) {}

    // Fallback: Simulated Test Payment Modal
    setLoading(false);
    setRzTab(paymentMethod);
    setShowRzModal(true);
  };

  // Confirm Simulated Payment in Modal
  const handleConfirmSimulatedPayment = () => {
    setShowRzModal(false);
    setLoading(true);

    setTimeout(() => {
      const orderId = 'ord_' + Date.now();
      const newOrder = {
        _id: orderId,
        id: orderId,
        orderNumber: 'ORD-2026-' + Math.floor(10000 + Math.random() * 90000),
        customer: { name: formData.fullName, phone: formData.phone, email: formData.email },
        shippingAddress: formData,
        deliveryMode: deliveryMode === 'pickup' ? 'Self Pickup' : 'Standard Delivery',
        paymentMethod: paymentMethod,
        items: [...items],
        subtotal,
        deliveryFee,
        convenienceFee,
        discountAmount: couponDiscount || 0,
        totalAmount: finalPayable,
        total: finalPayable,
        status: 'confirmed',
        razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
        razorpayOrderId: 'rzp_order_' + Math.random().toString(36).substring(2, 10),
        courier: deliveryMode === 'pickup' ? 'Self Store Pickup' : 'Standard Surface Delivery',
        createdAt: new Date().toISOString(),
      };

      addOrderToStore(newOrder);
      addOrder(newOrder);
      clearCart();
      setLoading(false);
      showToast('🎉 Payment Confirmed! Order placed successfully.', 'success');
      navigate(`/order-success/${newOrder._id}`);
    }, 1000);
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className={styles['checkout-wrapper']}>
          <div className={styles['container']} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2>Your shopping bag is empty</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Add items to your bag to proceed with checkout.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles['checkout-wrapper']}>
        <div className={styles['container']}>

          {/* ── BREADCRUMB ── */}
          <nav className={styles['breadcrumb-nav']} aria-label="Breadcrumb">
            <Link to="/" className={styles['breadcrumb-item']}>Home</Link>
            <span className={styles['breadcrumb-separator']}>/</span>
            <span className={styles['breadcrumb-current']}>Checkout</span>
          </nav>

          {/* ── 4-STEP HIGH-VISIBILITY FLOATING STEPPER HEADER BAR ── */}
          <div className={styles['stepper-wrapper']}>
            <div className={styles['stepper-header']}>
              {/* Step 1: BAG */}
              <Link to="/cart" className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>BAG</span>
              </Link>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              {/* Step 2: CHECKOUT */}
              <div
                className={`${styles['step-item']} ${checkoutStep === 1 ? styles['active'] : styles['completed']}`}
                onClick={() => checkoutStep > 1 && setCheckoutStep(1)}
                style={{ cursor: checkoutStep > 1 ? 'pointer' : 'default' }}
              >
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      {checkoutStep > 1 ? <Check size={11} strokeWidth={3.5} /> : null}
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CHECKOUT</span>
              </div>

              <div className={`${styles['step-connector']} ${checkoutStep === 2 ? styles['active'] : ''}`} />

              {/* Step 3: PAYMENT */}
              <div className={`${styles['step-item']} ${checkoutStep === 2 ? styles['active'] : ''}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']} />
                  </div>
                </div>
                <span className={styles['step-label']}>PAYMENT</span>
              </div>

              <div className={styles['step-connector']} />

              {/* Step 4: CONFIRM */}
              <div className={styles['step-item']}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']} />
                  </div>
                </div>
                <span className={styles['step-label']}>CONFIRM</span>
              </div>
            </div>
          </div>

          {/* ── CHECKOUT LAYOUT ── */}
          <div className={checkoutStep === 1 ? styles['checkout-layout-single'] : styles['checkout-layout']}>

            {/* ── LEFT PANEL CONTENT ── */}
            <div className={styles['left-panel']}>

              {/* ── STEP 1: SHIPPING DETAILS & DELIVERY MODE ── */}
              {checkoutStep === 1 && (
                <div className={styles['step-content-box']}>
                  
                  {/* Shipping Details Section */}
                  <div className={styles['section-block']}>
                    <h2 className={styles['section-heading']}>Shipping Details</h2>
                    
                    <form onSubmit={handleConfirmDetails} id="checkout-form">
                      <div className={styles['form-grid']}>
                        
                        {/* Full Name */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>FULL NAME *</label>
                          <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* Email Address */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>EMAIL ADDRESS *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* Phone Number */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>PHONE NUMBER *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter 10-digit mobile number"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* Pin Code */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>PIN CODE *</label>
                          <input
                            type="text"
                            name="pincode"
                            required
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="Enter 6-digit PIN code"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* Flat, House No., Apartment */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>FLAT, HOUSE NO., APARTMENT *</label>
                          <input
                            type="text"
                            name="street"
                            required
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="House / Flat No., Building, Street Name"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* Landmark */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>LANDMARK (OPTIONAL)</label>
                          <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            placeholder="E.g. Near Apollo Hospital, Park, etc."
                            className={styles['field-input']}
                          />
                        </div>

                        {/* City / Town */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>CITY / TOWN *</label>
                          <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter City / Town"
                            className={styles['field-input']}
                          />
                        </div>

                        {/* State */}
                        <div className={styles['form-group']}>
                          <label className={styles['field-label']}>STATE *</label>
                          <input
                            type="text"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter State"
                            className={styles['field-input']}
                          />
                        </div>

                      </div>
                    </form>
                  </div>

                  {/* Delivery Mode Section */}
                  <div className={styles['section-block']} style={{ marginTop: '2.5rem' }}>
                    <h2 className={styles['section-heading']}>Delivery Mode</h2>
                    
                    <div className={styles['delivery-mode-grid']}>
                      
                      {/* Option 1: Standard Delivery */}
                      <div
                        className={`${styles['delivery-mode-card']} ${deliveryMode === 'standard' ? styles['selected'] : ''}`}
                        onClick={() => setDeliveryMode('standard')}
                      >
                        <div className={styles['mode-info']}>
                          <span className={styles['mode-title']}>STANDARD DELIVERY</span>
                          <span className={styles['mode-desc']}>Delivery in 5–7 business days</span>
                        </div>
                        <div className={styles['mode-price']}>₹60</div>
                      </div>

                      {/* Option 2: Self Pickup */}
                      <div
                        className={`${styles['delivery-mode-card']} ${deliveryMode === 'pickup' ? styles['selected'] : ''}`}
                        onClick={() => setDeliveryMode('pickup')}
                      >
                        <div className={styles['mode-info']}>
                          <span className={styles['mode-title']}>SELF PICKUP</span>
                          <span className={styles['mode-desc']}>
                            ANA Complex– 1st Floor, Sethu Road, Peravurani, Thanjavur, Tamil Nadu, India 614804
                          </span>
                        </div>
                        <div className={`${styles['mode-price']} ${styles['free']}`}>FREE</div>
                      </div>

                    </div>
                  </div>

                  {/* Form Action Row: Continue to Next Step */}
                  <div className={styles['step1-actions-row']}>
                    <Link to="/cart" className={styles['btn-back-cart']}>
                      <ArrowLeft size={16} /> Back to Bag
                    </Link>
                    <button
                      type="button"
                      onClick={handleConfirmDetails}
                      className={styles['btn-confirm-details']}
                    >
                      <span>CONFIRM DETAILS</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>

                </div>
              )}

              {/* ── STEP 2: ADDRESS REVIEW & SECURE PAYMENT ── */}
              {checkoutStep === 2 && (
                <div className={styles['step-content-box']}>
                  
                  {/* 1. Delivery & Contact Information Summary Card */}
                  <div className={styles['address-summary-card']}>
                    <div className={styles['address-card-header']}>
                      <h3 className={styles['address-card-title']}>
                        <MapPin size={17} style={{ color: '#8b5cf6' }} /> Delivery & Contact Information
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(1)}
                        className={styles['btn-edit-address']}
                      >
                        <Edit3 size={12} /> Edit Address
                      </button>
                    </div>

                    <div className={styles['address-details-grid']}>
                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Full Name</span>
                        <span className={styles['detail-value']}>{formData.fullName || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Email Address</span>
                        <span className={styles['detail-value']}>{formData.email || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Phone Number</span>
                        <span className={styles['detail-value']}>{formData.phone || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Delivery Mode</span>
                        <span className={styles['detail-value']}>
                          <span className={styles['delivery-badge']}>
                            <Truck size={12} />
                            {deliveryMode === 'pickup' ? 'Self Store Pickup (FREE)' : 'Standard Delivery (₹60)'}
                          </span>
                        </span>
                      </div>

                      <div className={`${styles['detail-col']} ${styles['full-row']}`}>
                        <span className={styles['detail-label']}>Shipping Address</span>
                        <span className={styles['detail-value']}>
                          {formData.street}{formData.landmark ? `, Landmark: ${formData.landmark}` : ''}, {formData.city}, {formData.state} - {formData.pincode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Ultra-Neat Instant Payment & Security Banner */}
                  <div className={styles['payment-gateway-card']}>
                    <div className={styles['gateway-card-header']}>
                      <div className={styles['gateway-icon-badge']}>
                        <Lock size={18} />
                      </div>
                      <div className={styles['gateway-header-text']}>
                        <h4 className={styles['gateway-title']}>Instant & Encrypted Payment</h4>
                        <p className={styles['gateway-subtitle']}>
                          Powered by Razorpay with 256-bit SSL bank-grade encryption
                        </p>
                      </div>
                    </div>

                    <div className={styles['gateway-features-grid']}>
                      <div className={styles['gateway-feature-pill']}>
                        <QrCode size={15} className={styles['feature-icon']} />
                        <span>GPay / PhonePe / Paytm UPI</span>
                      </div>
                      <div className={styles['gateway-feature-pill']}>
                        <CreditCard size={15} className={styles['feature-icon']} />
                        <span>Visa, Mastercard & RuPay</span>
                      </div>
                      <div className={styles['gateway-feature-pill']}>
                        <Building2 size={15} className={styles['feature-icon']} />
                        <span>Net Banking (50+ Banks)</span>
                      </div>
                      <div className={styles['gateway-feature-pill']}>
                        <ShieldCheck size={15} className={styles['feature-icon']} />
                        <span>100% Refund Protection</span>
                      </div>
                    </div>

                    <div className={styles['gateway-footer-note']}>
                      <ShieldCheck size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span>Click <strong>Complete Order 🔒</strong> to open the secure payment portal.</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* ── RIGHT PANEL: ORDER SUMMARY SIDEBAR ── */}
            {checkoutStep === 2 && (
              <div className={styles['right-panel']}>
                <div className={styles['order-summary-card']}>
                  
                  <h3 className={styles['summary-title']}>Order Summary</h3>

                  {/* Cart Items List with Quantity Controls */}
                  <div className={styles['cart-items-wrapper']}>
                    {items.map((item, index) => {
                      const price = item.discountPrice || item.price || 0;
                      const origPrice = item.price && item.discountPrice && item.price > item.discountPrice
                        ? item.price
                        : Math.round(price * 1.25);
                      const qty = item.quantity || 1;

                      return (
                        <div key={item._id || item.id || index} className={styles['summary-cart-item']}>
                          <img
                            src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}
                            alt={item.name}
                            className={styles['cart-item-img']}
                          />

                          <div className={styles['cart-item-details']}>
                            <span className={styles['cart-item-name']}>{item.name}</span>
                            
                            {/* Quantity Counter (- 1 +) */}
                            <div className={styles['qty-counter-row']}>
                              <span className={styles['qty-label']}>Qty:</span>
                              <div className={styles['qty-btn-group']}>
                                <button
                                  type="button"
                                  className={styles['qty-btn']}
                                  onClick={() => updateQty(item, qty - 1)}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className={styles['qty-num']}>{qty}</span>
                                <button
                                  type="button"
                                  className={styles['qty-btn']}
                                  onClick={() => updateQty(item, qty + 1)}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Prices: Strikethrough original price & current price */}
                          <div className={styles['cart-item-pricing']}>
                            <span className={styles['strikethrough-price']}>
                              {formatPrice(origPrice * qty)}
                            </span>
                            <span className={styles['final-item-price']}>
                              {formatPrice(price * qty)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Have a Promo / Coupon Code? Dotted Box */}
                  <div className={styles['promo-box-container']}>
                    <div className={styles['promo-header']}>
                      <Tag size={16} className={styles['promo-tag-icon']} />
                      <span>Have a Promo / Coupon Code?</span>
                    </div>

                    {coupon ? (
                      <div className={styles['promo-applied-bar']}>
                        <span className={styles['applied-code']}>
                          Coupon <strong>{coupon}</strong> (-{formatPrice(couponDiscount)})
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className={styles['btn-remove-coupon']}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className={styles['promo-form']}>
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value);
                            setPromoError('');
                          }}
                          placeholder="E.G. MAZHAI10"
                          className={styles['promo-input']}
                        />
                        <button type="submit" className={styles['btn-apply-promo']}>
                          Apply
                        </button>
                      </form>
                    )}

                    {promoError && (
                      <div className={styles['promo-error-text']}>{promoError}</div>
                    )}
                  </div>

                  {/* Breakdown Costs */}
                  <div className={styles['pricing-breakdown']}>
                    {/* Subtotal */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Subtotal</span>
                      <div className={styles['breakdown-value-wrap']}>
                        <span className={styles['breakdown-strikethrough']}>
                          {formatPrice(originalSubtotal)}
                        </span>
                        <span className={styles['breakdown-val']}>
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Shipping & Delivery */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Shipping & Delivery</span>
                      <span className={`${styles['breakdown-val']} ${deliveryFee === 0 ? styles['free'] : ''}`}>
                        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                      </span>
                    </div>

                    {/* Convenience Fee */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Convenience Fee</span>
                      <span className={styles['breakdown-val']}>₹{convenienceFee}</span>
                    </div>

                    {/* Coupon Discount */}
                    {couponDiscount > 0 && (
                      <div className={`${styles['breakdown-row']} ${styles['discount-row']}`}>
                        <span className={styles['breakdown-label']}>Coupon Discount</span>
                        <span className={styles['discount-val']}>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Final Payable Total */}
                  <div className={styles['final-payable-row']}>
                    <span className={styles['final-payable-label']}>Final Payable</span>
                    <span className={styles['final-payable-amount']}>
                      {formatPrice(finalPayable)}
                    </span>
                  </div>

                  {/* Complete Order Action Button */}
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    disabled={loading}
                    className={styles['btn-action-primary']}
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>COMPLETE ORDER</span>
                        <Lock size={16} />
                      </>
                    )}
                  </button>

                  {/* 100% SECURE TRANSACTIONS Footer */}
                  <div className={styles['summary-footer-badge']}>
                    <ShieldCheck size={14} className={styles['secure-badge-icon']} />
                    <span>100% SECURE TRANSACTIONS</span>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── SIMULATED RAZORPAY MODAL ── */}
      {showRzModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowRzModal(false)}>
          <div className={styles['rz-modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['rz-modal-header']}>
              <div className={styles['rz-logo-wrap']}>
                <Lock size={20} color="#854d0e" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1917' }}>Razorpay Secure</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRzModal(false)}
                style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['rz-modal-body']}>
              <div className={styles['rz-amount-banner']}>
                <div className={styles['rz-amount-label']}>Final Payable Amount</div>
                <div className={styles['rz-amount-val']}>{formatPrice(finalPayable)}</div>
              </div>

              <div className={styles['pay-method-tabs']}>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'card' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('card')}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'upi' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('upi')}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'netbanking' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('netbanking')}
                >
                  NetBanking
                </button>
              </div>

              {rzTab === 'card' && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    readOnly
                    value="4111 1111 1111 1111 (Test Card)"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      readOnly
                      value="12 / 28"
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                    />
                    <input
                      type="text"
                      readOnly
                      value="CVV: 123"
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                    />
                  </div>
                </div>
              )}

              {rzTab === 'upi' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`${app.toLowerCase()}@razorpay`)}
                        style={{
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: upiId.includes(app.toLowerCase()) ? '2px solid #57534e' : '1px solid #e7e5e4',
                          background: upiId.includes(app.toLowerCase()) ? '#f5f5f4' : '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#292524',
                          cursor: 'pointer',
                        }}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              {rzTab === 'netbanking' && (
                <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                    <div
                      key={bank}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e7e5e4',
                        background: '#fafaf9',
                        color: '#292524',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Building2 size={16} style={{ display: 'block', margin: '0 auto 0.2rem' }} />
                      {bank}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSimulatedPayment}
                className={styles['btn-action-primary']}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <span>Pay {formatPrice(finalPayable)}</span>
                <Check size={18} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

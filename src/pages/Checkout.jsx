import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { orderService } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';

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
  const { items, couponDiscount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useUiStore();

  const [address, setAddress] = useState({
    street: user?.defaultAddress?.street || user?.addresses?.[0]?.street || '',
    city: user?.defaultAddress?.city || user?.addresses?.[0]?.city || 'Chennai',
    state: user?.defaultAddress?.state || user?.addresses?.[0]?.state || 'Tamil Nadu',
    pincode: user?.defaultAddress?.pincode || user?.addresses?.[0]?.pincode || '',
    landmark: user?.defaultAddress?.landmark || '',
  });

  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const total = Math.max(0, subtotal - (couponDiscount || 0));

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>No items in your checkout</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Your shopping bag is currently empty.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Browse Catalog ➔
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    if (!address.street.trim() || !address.pincode.trim() || !address.city.trim()) {
      showToast('Please fill in your complete delivery address', 'error');
      return;
    }

    try {
      setLoading(true);
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        showToast('Razorpay SDK failed to load. Please check your internet connection.', 'error');
        setLoading(false);
        return;
      }

      const cartPayload = items.map((i) => ({
        productId: i.productId || i._id || i.id,
        quantity: i.quantity || 1,
      }));

      // 1. Initialize Razorpay Order on server
      const rzInitRes = await orderService.createRazorpayOrder({
        shippingAddress: address,
        items: cartPayload,
      });
      const rzData = rzInitRes?.data || rzInitRes;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: rzData.keyId,
        amount: rzData.amount, // in paise
        currency: rzData.currency || 'INR',
        name: 'Picky',
        description: `Order Payment (${items.length} items)`,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
        order_id: rzData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          contact: user?.phone || '',
          email: user?.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
        handler: async (response) => {
          try {
            setLoading(true);
            // 3. Verify Payment Signature on Backend
            const verifyRes = await orderService.verifyRazorpayPayment({
              shippingAddress: address,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cartPayload,
            });

            const order = verifyRes?.data || verifyRes;
            clearCart();
            showToast('🎉 Payment Successful! Order placed and confirmed.', 'success');
            navigate(`/orders/${order._id || order.id}`);
          } catch (err) {
            showToast(err.message || 'Payment verification failed', 'error');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showToast('Payment window closed. Order was not placed.', 'info');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      showToast(err.message || 'Failed to initialize payment. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            <Link to="/cart">Cart</Link> ➔ <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Prepaid Checkout</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Checkout & Online Payment</h1>

          <form onSubmit={handleRazorpayPayment}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
              {/* Address Details Left */}
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  1. Shipping & Delivery Details
                </h3>

                <Input
                  label="Street Address / Door No / Flat *"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  placeholder="e.g. Flat 3B, Sunshine Apartments, 12th Cross Road"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <Input
                    label="City *"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="State *"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="PIN Code *"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 600028"
                    required
                  />
                </div>

                <Input
                  label="Landmark (Optional)"
                  name="landmark"
                  value={address.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Apollo Hospital"
                />

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                    2. Payment Method
                  </h3>
                  <div style={{ padding: '1.25rem', border: '2px solid var(--color-primary)', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800 }}>
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
                        ⚡ 100% Secure Online Payment (Razorpay)
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#6b21a8' }}>
                        UPI (GPay / PhonePe / Paytm), Credit / Debit Cards, NetBanking, and Wallets supported.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Right */}
              <div className="card" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  Order Review ({items.length} items)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                      <span style={{ color: '#334155', maxWidth: '65%' }}>
                        {item.quantity} × {item.name}
                      </span>
                      <strong style={{ color: '#0f172a' }}>
                        {formatPrice((item.discountPrice || item.price || 0) * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Express Delivery</span>
                    <strong style={{ color: '#16a34a' }}>FREE</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  loading={loading}
                >
                  Pay with Razorpay ⚡ ➔
                </Button>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  🔒 256-Bit SSL Encrypted & Instant WhatsApp Order Confirmation.
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

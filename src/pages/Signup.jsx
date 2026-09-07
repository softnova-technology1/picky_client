import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authService } from '../services/auth.service';
import { cartService } from '../services/cart.service';
import { wishlistService } from '../services/wishlist.service';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useUiStore } from '../store/uiStore';
import { Sparkles, User, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateUser, isLoggedIn } = useAuthStore();
  const { items: localCartItems, setServerCart } = useCartStore();
  const { items: localWishlistItems, setWishlist } = useWishlistStore();
  const { showToast } = useUiStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanName || cleanName.length < 2) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`;

    try {
      setLoading(true);
      await authService.sendOTP(formattedPhone);
      setFormData((prev) => ({ ...prev, phone: formattedPhone }));
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      showToast('Verification OTP sent to your WhatsApp number!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send OTP. Please check your number.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 6-digit OTP received on WhatsApp', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOTP(formData.phone, otp.trim());
      const data = res?.data || res;

      // Log in with returned tokens
      login(data.user, data.accessToken, data.refreshToken);

      // Now immediately update user profile with their real name & email
      try {
        const updatePayload = { name: formData.name.trim() };
        if (formData.email && formData.email.trim()) {
          updatePayload.email = formData.email.trim();
        }
        const updatedUser = await authService.updateProfile(updatePayload);
        if (updatedUser) {
          updateUser(updatedUser);
        } else {
          updateUser(updatePayload);
        }
      } catch (profileErr) {
        console.warn('Profile name sync fallback:', profileErr);
        updateUser({ name: formData.name.trim(), email: formData.email.trim() });
      }

      showToast(`🎉 Welcome to Picky, ${formData.name.trim()}! Account created successfully.`, 'success');

      // Sync guest cart & wishlist if present
      try {
        if (localCartItems && localCartItems.length > 0) {
          const payload = localCartItems.map((i) => ({
            productId: i.productId || i._id,
            quantity: i.quantity || 1,
          }));
          const mergedCartRes = await cartService.merge(payload);
          if (mergedCartRes?.data) setServerCart(mergedCartRes.data);
        } else {
          const serverCartRes = await cartService.get();
          if (serverCartRes?.data) setServerCart(serverCartRes.data);
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      }

      try {
        if (localWishlistItems && localWishlistItems.length > 0) {
          const productIds = localWishlistItems.map((i) => i._id || i.id || i);
          const mergedWishlistRes = await wishlistService.merge(productIds);
          if (mergedWishlistRes?.data?.products) {
            setWishlist(mergedWishlistRes.data.products);
          }
        }
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }

      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="section" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', background: '#ffffff', padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '460px' }}>
          <div
            className="card"
            style={{
              padding: '2.5rem 2rem',
              boxShadow: '0 12px 36px rgba(124, 58, 237, 0.12)',
              border: '1px solid #e9d5ff',
              borderRadius: '24px',
              background: '#ffffff',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  border: '1px solid #d8b4fe',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                }}
              >
                ✨
              </div>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', color: '#0f172a' }}>
                {step === 'details' ? 'Create Your Account' : 'Verify Phone Number'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                {step === 'details'
                  ? 'Join Picky to enjoy instant WhatsApp order tracking & exclusive member discounts.'
                  : `Enter the 6-digit OTP code sent to ${formData.phone}`}
              </p>
            </div>

            {step === 'details' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <Input
                    label="Full Name *"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="WhatsApp Mobile Number *"
                    name="phone"
                    placeholder="10-digit number (e.g. 9876543210)"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem' }}>
                    <ShieldCheck size={13} /> Used for live shipment dispatch updates on WhatsApp
                  </span>
                </div>

                <div>
                  <Input
                    label="Email Address (Optional)"
                    name="email"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  block
                  loading={loading}
                  style={{ marginTop: '0.5rem', padding: '0.85rem' }}
                >
                  Continue with WhatsApp OTP ➔
                </Button>

                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
                    Sign In ➔
                  </Link>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  By signing up, you agree to our <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <Input
                  label="6-Digit OTP"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  maxLength={6}
                  required
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.25em', fontWeight: 800 }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem', fontSize: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    style={{ color: '#64748b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ← Edit Details
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{ color: 'var(--color-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Resend in {timer}s</span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  block
                  loading={loading}
                  style={{ padding: '0.85rem' }}
                >
                  Verify & Create Account ➔
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

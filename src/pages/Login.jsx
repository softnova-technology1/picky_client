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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuthStore();
  const { items: localCartItems, setServerCart } = useCartStore();
  const { items: localWishlistItems, setWishlist } = useWishlistStore();
  const { showToast } = useUiStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

    try {
      setLoading(true);
      await authService.sendOTP(formattedPhone);
      showToast('OTP sent to your WhatsApp / SMS!', 'success');
      setPhone(formattedPhone);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the OTP you received', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOTP(phone, otp.trim());
      const data = res?.data || res;
      login(data.user, data.accessToken, data.refreshToken);
      showToast(`Welcome back, ${data.user?.name || 'Customer'}!`, 'success');

      // ── Guest Cart & Wishlist Merge to Server ───────────
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
        } else {
          const serverWishlistRes = await wishlistService.get();
          if (serverWishlistRes?.data?.products) {
            setWishlist(serverWishlistRes.data.products);
          }
        }
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }

      // If user is admin, redirect to admin panel
      if (data.user?.role === 'admin') {
        navigate('/pickyadmin-softnova2026', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP. Please recheck.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="section" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 56, height: 56, background: 'var(--color-primary-light)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1rem' }}>
                💬
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
                {step === 'phone' ? 'Login or Sign Up' : 'Enter Verification Code'}
              </h2>
              <p style={{ fontSize: '0.88rem' }}>
                {step === 'phone'
                  ? 'We will send a fast 6-digit OTP to your WhatsApp.'
                  : `Enter the code sent to ${phone}`}
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp}>
                <Input
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  block
                  loading={loading}
                  style={{ marginTop: '1.25rem', padding: '0.85rem' }}
                >
                  Send OTP ➔
                </Button>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  By signing in, you agree to our <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
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
                    onClick={() => setStep('phone')}
                    style={{ color: '#64748b', fontWeight: 600 }}
                  >
                    ← Change Phone
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{ color: 'var(--color-primary)', fontWeight: 700 }}
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
                  Verify & Continue ➔
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

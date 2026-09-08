import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { cartService } from '../services/cart.service';
import { wishlistService } from '../services/wishlist.service';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useUiStore } from '../store/uiStore';
import { X, Phone, Lock, Mail, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Home from './Home';

export default function Login({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useAuthStore();
  const { items: localCartItems, setServerCart } = useCartStore();
  const { items: localWishlistItems, setWishlist } = useWishlistStore();
  const { showToast } = useUiStore();

  // Active top tab: 'login' | 'signup'
  const isSignupRoute = location.pathname.includes('signup');
  const [activeTab, setActiveTab] = useState(isSignupRoute ? 'signup' : initialTab);

  // Customer WhatsApp OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  // Optional Admin Email mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Guest Cart & Wishlist sync
  const syncGuestData = async () => {
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
  };

  // ── Handle Send OTP (Login / Signup) ───────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const rawPhone = activeTab === 'signup' ? signupPhone : phone;
    const cleanPhone = rawPhone.trim();

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (activeTab === 'signup' && (!signupName.trim() || signupName.trim().length < 2)) {
      showToast('Please enter your full name', 'error');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+')
      ? cleanPhone
      : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`;

    try {
      setLoading(true);
      await authService.sendOTP(formattedPhone);
      showToast('OTP sent to your WhatsApp / SMS!', 'success');

      if (activeTab === 'signup') {
        setSignupPhone(formattedPhone);
      } else {
        setPhone(formattedPhone);
      }

      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      showToast(err.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the OTP you received', 'error');
      return;
    }

    const activePhone = activeTab === 'signup' ? signupPhone : phone;

    try {
      setLoading(true);
      const res = await authService.verifyOTP(activePhone, otp.trim());
      const data = res?.data || res;
      login(data.user, data.accessToken, data.refreshToken);

      // If user registered with name / email in signup tab, update profile
      if (activeTab === 'signup' && signupName.trim()) {
        try {
          const updatePayload = { name: signupName.trim() };
          if (signupEmail.trim()) updatePayload.email = signupEmail.trim();
          await authService.updateProfile(updatePayload);
        } catch (profileErr) {
          console.warn('Profile sync fallback:', profileErr);
        }
      }

      showToast(`Welcome back, ${data.user?.name || signupName || 'Customer'}!`, 'success');

      await syncGuestData();

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

  // ── Handle Admin Email/Password Login ──────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      showToast('Please enter admin email', 'error');
      return;
    }
    if (!adminPassword) {
      showToast('Please enter admin password', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.adminLogin(adminEmail.trim(), adminPassword);
      const data = res?.data || res;
      login(data.user, data.accessToken, data.refreshToken);
      showToast(`Welcome back, Administrator!`, 'success');
      await syncGuestData();
      navigate('/pickyadmin-softnova2026', { replace: true });
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="picky-login-page-container">
      {/* ── Real Picky Website (Blurred in background) ── */}
      <div className="picky-login-underlying-site" aria-hidden="true">
        <Home />
      </div>

      {/* ── Modal Overlay Backdrop with Frosted Glass Blur ── */}
      <div
        className="picky-login-modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Main Luxury Modal Card with equal height and side-interchanging classes */}
        <div className={`picky-auth-card ${activeTab === 'signup' ? 'is-signup' : 'is-login'}`}>
          {/* Fixed Universal Close Button */}
          <button
            type="button"
            className="picky-auth-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>

        {/* ── VISUAL PANEL: LUXURY FASHION CURATION & BADGES ── */}
        <div
          className="picky-auth-left"
          style={{ backgroundImage: `url('/images/login_luxury_bg.jpg')` }}
        >
          {/* Floating Pill and Glowing Orb on dividing seam */}
          <div className="picky-floating-member-badge">
            <span className="sparkle">✦</span>
            <span>Premium Member</span>
          </div>
          <div className="picky-seam-orb" title="Picky Elite" />

          <div className="picky-auth-left-content">
            {/* Top Spacer (Rating Badge Removed as requested) */}
            <div className="picky-auth-left-top" />

            {/* Bottom Elements: 1st Order Special Gift Glass Badge & Brand Logo */}
            <div className="picky-auth-left-bottom">
              <div className="picky-glass-promo-badge">
                <div className="picky-promo-tag">1ST ORDER</div>
                <div className="picky-promo-value">Special Gift 🎁</div>
                <div className="picky-promo-desc">Exclusive surprise with your first order</div>
              </div>

              <div className="picky-brand-typography">
                <h1 className="picky-brand-title">P I C K Y</h1>
                <p className="picky-brand-tagline">BECAUSE EVERY CHOICE MATTERS</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM PANEL: INTERACTIVE FORM (WITH LUXURY IMAGE BEHIND FROSTED GLASS) ── */}
        <div className="picky-auth-right">
          <div className="picky-auth-right-content">
            <div className="picky-form-top-section">
              {/* Header */}
              <div className="picky-auth-header">
                <h2>
                  {isAdminMode
                    ? 'Admin Portal'
                    : activeTab === 'signup'
                    ? 'Create an Account'
                    : step === 'phone'
                    ? 'Login to Picky'
                    : 'Enter Verification Code'}
                </h2>
                <p>
                  {isAdminMode
                    ? 'Sign in with your administrator credentials'
                    : activeTab === 'signup'
                    ? step === 'phone'
                      ? 'Enter your mobile number to receive verification code.'
                      : `Enter the code sent to ${signupPhone}`
                    : step === 'phone'
                    ? 'We will send a fast 6-digit OTP to your WhatsApp.'
                    : `Enter the code sent to ${phone}`}
                </p>
              </div>

              {/* Segmented Capsule Tabs [ LOGIN | SIGN UP ] */}
              {!isAdminMode && (
                <div className="picky-auth-tabs">
                  <button
                    type="button"
                    className={`picky-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('login');
                      setStep('phone');
                    }}
                  >
                    LOGIN
                  </button>
                  <button
                    type="button"
                    className={`picky-auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('signup');
                      setStep('phone');
                    }}
                  >
                    SIGN UP
                  </button>
                </div>
              )}

              {/* ── 1. CUSTOMER LOGIN (PHONE OTP) ── */}
              {!isAdminMode && activeTab === 'login' && (
                <>
                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="picky-auth-form">
                      <div className="picky-input-group">
                        <span className="picky-input-icon">
                          <Phone size={18} />
                        </span>
                        <input
                          type="tel"
                          className="picky-pill-input"
                          placeholder="Phone Number (e.g. 9876543210)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          autoComplete="tel"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <span>CONTINUE</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="picky-auth-form">
                      <div className="picky-input-group">
                        <input
                          type="text"
                          maxLength={6}
                          className="picky-pill-input picky-otp-input"
                          placeholder="• • • • • •"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <div className="picky-otp-controls">
                        <button
                          type="button"
                          className="picky-otp-back-btn"
                          onClick={() => setStep('phone')}
                        >
                          ← Change Phone
                        </button>

                        {canResend ? (
                          <button
                            type="button"
                            className="picky-otp-resend-btn"
                            onClick={handleSendOtp}
                          >
                            Resend OTP
                          </button>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>Resend in {timer}s</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <span>VERIFY & CONTINUE</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ── 2. CUSTOMER SIGNUP (NAME, PHONE, OTP) ── */}
              {!isAdminMode && activeTab === 'signup' && (
                <>
                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="picky-auth-form">
                      <div className="picky-input-group">
                        <span className="picky-input-icon">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          className="picky-pill-input"
                          placeholder="Full Name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          autoComplete="name"
                          autoFocus
                        />
                      </div>

                      <div className="picky-input-group">
                        <span className="picky-input-icon">
                          <Phone size={18} />
                        </span>
                        <input
                          type="tel"
                          className="picky-pill-input"
                          placeholder="Phone Number for OTP"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          required
                          autoComplete="tel"
                        />
                      </div>

                      <div className="picky-input-group">
                        <span className="picky-input-icon">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="picky-pill-input"
                          placeholder="Email Address (Optional)"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          autoComplete="email"
                        />
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <span>CONTINUE</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="picky-auth-form">
                      <div className="picky-input-group">
                        <input
                          type="text"
                          maxLength={6}
                          className="picky-pill-input picky-otp-input"
                          placeholder="• • • • • •"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <div className="picky-otp-controls">
                        <button
                          type="button"
                          className="picky-otp-back-btn"
                          onClick={() => setStep('phone')}
                        >
                          ← Change Phone
                        </button>

                        {canResend ? (
                          <button
                            type="button"
                            className="picky-otp-resend-btn"
                            onClick={handleSendOtp}
                          >
                            Resend OTP
                          </button>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>Resend in {timer}s</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <span>CONFIRM & JOIN PICKY</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ── 3. ADMIN PORTAL MODE ── */}
              {isAdminMode && (
                <form onSubmit={handleAdminLogin} className="picky-auth-form">
                  <div className="picky-input-group">
                    <span className="picky-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="picky-pill-input"
                      placeholder="admin@picky.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <div className="picky-input-group">
                    <span className="picky-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      className="picky-pill-input"
                      placeholder="••••••••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="picky-input-end-btn"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showAdminPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="picky-auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="picky-auth-spinner" />
                    ) : (
                      <>
                        <span>CONTINUE</span>
                        <span className="arrow">→</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="picky-otp-back-btn"
                    style={{ textAlign: 'center', marginTop: '0.5rem', display: 'block', width: '100%' }}
                    onClick={() => setIsAdminMode(false)}
                  >
                    ← Back to Customer Login
                  </button>
                </form>
              )}

              {/* Terms & Privacy */}
              {!isAdminMode && (
                <div className="picky-auth-terms">
                  By signing in, you agree to our{' '}
                  <Link to="/terms">Terms of Service</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>.
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="picky-auth-footer">
              {!isAdminMode && (
                <>
                  {activeTab === 'login' ? (
                    <div>
                      New to Picky?
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setStep('phone');
                        }}
                      >
                        Create an Account ➔
                      </button>
                    </div>
                  ) : (
                    <div>
                      Already have an account?
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setStep('phone');
                        }}
                      >
                        Sign in ➔
                      </button>
                    </div>
                  )}

                  <span
                    className="picky-admin-login-link"
                    onClick={() => {
                      setIsAdminMode(true);
                      setAdminEmail('admin@picky.com');
                      setAdminPassword('');
                    }}
                  >
                    Admin Sign In →
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

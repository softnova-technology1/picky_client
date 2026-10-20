import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { cartService } from '../../services/cart.service';
import { wishlistService } from '../../services/wishlist.service';
import { useAuthStore } from '../../store/authStore';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUiStore } from '../../store/uiStore';
import { X, Phone, Lock, Mail, User, ArrowRight, Eye, EyeOff, Zap, Calendar } from 'lucide-react';
import Home from '../Home';

const WhatsAppIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.12-.533-1.666-.693-2.73-2.39-2.813-2.5-.083-.11-.664-.882-.664-1.682 0-.8.419-1.194.568-1.356.148-.162.325-.202.434-.202.108 0 .216.002.311.007.1.005.234-.038.366.279.136.327.464 1.132.505 1.215.041.083.068.18.014.288-.054.11-.081.18-.162.275-.081.095-.17.212-.243.285-.081.082-.166.172-.072.334.095.162.421.694.904 1.124.622.554 1.146.726 1.309.807.162.081.257.068.351-.041.095-.108.405-.473.514-.635.108-.162.216-.135.365-.081.148.054.946.446 1.109.527.162.081.27.122.311.19.041.067.041.391-.103.796z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.398C8.423 21.503 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.61 0-3.13-.45-4.43-1.23l-.32-.19-3.27.92.93-3.18-.21-.34C3.84 14.86 3.4 13.48 3.4 12c0-4.74 3.86-8.6 8.6-8.6s8.6 3.86 8.6 8.6-3.86 8.6-8.6 8.6z" />
  </svg>
);

export default function Login({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, user } = useAuthStore();
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
  const [signupDob, setSignupDob] = useState('');

  // Optional Admin Email mode
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === 'admin') {
        navigate('/softpicky-sn2026', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isLoggedIn, user?.role, navigate, from]);

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
      showToast('Please enter a valid 10-digit WhatsApp number', 'error');
      return;
    }

    if (activeTab === 'signup' && (!signupName.trim() || signupName.trim().length < 2)) {
      showToast('Please enter your full name', 'error');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+')
      ? cleanPhone
      : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`;

    const startTime = Date.now();
    try {
      setLoading(true);
      await authService.sendOTP(formattedPhone);
      showToast('6-digit OTP sent to your WhatsApp!', 'success');

      if (activeTab === 'signup') {
        setSignupPhone(formattedPhone);
      } else {
        setPhone(formattedPhone);
      }

      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error('Backend send OTP error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to send WhatsApp OTP. Please check your WhatsApp number and try again.';
      showToast(msg, 'error');
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 2000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
      setLoading(false);
    }
  };

  // ── Handle Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 6-digit WhatsApp OTP you received', 'error');
      return;
    }

    const activePhone = activeTab === 'signup' ? signupPhone : phone;
    const startTime = Date.now();

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
          if (signupDob) updatePayload.dob = signupDob;
          const profileRes = await authService.updateProfile(updatePayload);
          const updatedUser = profileRes?.data || profileRes;
          if (updatedUser) {
            useAuthStore.getState().updateUser(updatedUser);
          }
        } catch (profileErr) {
          console.warn('Profile sync fallback:', profileErr);
        }
      }

      showToast(`Welcome back, ${data.user?.name || signupName || 'Customer'}!`, 'success');

      await syncGuestData();

      if (data.user?.role === 'admin') {
        navigate('/softpicky-sn2026', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Backend verify OTP error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Invalid or expired WhatsApp OTP. Please enter the correct code.';
      showToast(msg, 'error');
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 2000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
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

    const startTime = Date.now();
    try {
      setLoading(true);
      const res = await authService.adminLogin(adminEmail.trim(), adminPassword);
      const payload = res?.data?.user ? res.data : (res?.user ? res : (res?.data || res));
      const adminUser = payload?.user || payload;
      useAdminAuthStore.getState().login(adminUser, payload?.accessToken, payload?.refreshToken);
      showToast(`Welcome back, Administrator!`, 'success');
      navigate('/softpicky-sn2026', { replace: true });
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Invalid administrator credentials. Please check your email and password.';
      showToast(msg, 'error');
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 2000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
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
          style={{ 
            backgroundImage: `url('/images/auth_luxury_concept.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 0.65s ease-in-out'
          }}
        >

          <div className="picky-auth-left-content">
            {/* Top Spacer (Rating Badge Removed as requested) */}
            <div className="picky-auth-left-top" />

            {/* Bottom Brand Logo & Tagline */}
            <div className="picky-auth-left-bottom">
              <div className="picky-brand-typography" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/images/logo.png" alt="Picky Logo" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
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
                    : 'Verify WhatsApp Code'}
                </h2>
                <p>
                  {isAdminMode
                    ? 'Sign in with your administrator credentials'
                    : activeTab === 'signup'
                    ? step === 'phone'
                      ? 'Enter your WhatsApp number to receive your verification code.'
                      : `Enter the 6-digit code sent to your WhatsApp at ${signupPhone}`
                    : step === 'phone'
                    ? 'Enter your WhatsApp number to log in. We will send a fast 6-digit OTP exclusively to your WhatsApp.'
                    : `Enter the 6-digit code sent to your WhatsApp at ${phone}`}
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


              {/* ── 1. CUSTOMER LOGIN (WHATSAPP OTP) ── */}
              {!isAdminMode && activeTab === 'login' && (
                <>
                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="picky-auth-form">
                      <div className="picky-input-group picky-wa-input-group">
                        <span className="picky-input-icon picky-wa-icon-wrap">
                          <WhatsAppIcon size={19} color="#25D366" />
                        </span>
                        <span className="picky-wa-country-badge">+91</span>
                        <input
                          type="tel"
                          className="picky-pill-input picky-wa-pill-input"
                          placeholder="WhatsApp Number (e.g. 9876543210)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required
                          autoComplete="tel"
                          autoFocus
                          maxLength={10}
                        />
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn picky-wa-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <WhatsAppIcon size={17} color="#ffffff" />
                            <span>CONTINUE WITH WHATSAPP</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="picky-auth-form">
                      <div className="picky-wa-otp-notice">
                        <WhatsAppIcon size={16} color="#25D366" />
                        <span>OTP sent to WhatsApp: <strong>{phone}</strong></span>
                      </div>
                      <div className="picky-input-group">
                        <input
                          type="text"
                          maxLength={6}
                          className="picky-pill-input picky-otp-input"
                          placeholder="• • • • • •"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                          ← Change WhatsApp Number
                        </button>

                        {canResend ? (
                          <button
                            type="button"
                            className="picky-otp-resend-btn"
                            onClick={handleSendOtp}
                          >
                            Resend WhatsApp OTP
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
                            <span>VERIFY & LOG IN</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* ── 2. CUSTOMER SIGNUP (NAME, WHATSAPP, OTP) ── */}
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

                      <div className="picky-input-group picky-wa-input-group">
                        <span className="picky-input-icon picky-wa-icon-wrap">
                          <WhatsAppIcon size={19} color="#25D366" />
                        </span>
                        <span className="picky-wa-country-badge">+91</span>
                        <input
                          type="tel"
                          className="picky-pill-input picky-wa-pill-input"
                          placeholder="WhatsApp Number for OTP"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required
                          autoComplete="tel"
                          maxLength={10}
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

                      <div className="picky-input-group">
                        <span className="picky-input-icon">
                          <Calendar size={18} />
                        </span>
                        <input
                          type="date"
                          className="picky-pill-input"
                          placeholder="Date of Birth (Optional)"
                          value={signupDob}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSignupDob(e.target.value)}
                          title="Date of Birth"
                        />
                      </div>

                      <button
                        type="submit"
                        className="picky-auth-submit-btn picky-wa-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="picky-auth-spinner" />
                        ) : (
                          <>
                            <WhatsAppIcon size={17} color="#ffffff" />
                            <span>CONTINUE WITH WHATSAPP</span>
                            <span className="arrow">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="picky-auth-form">
                      <div className="picky-wa-otp-notice">
                        <WhatsAppIcon size={16} color="#25D366" />
                        <span>OTP sent to WhatsApp: <strong>{signupPhone}</strong></span>
                      </div>
                      <div className="picky-input-group">
                        <input
                          type="text"
                          maxLength={6}
                          className="picky-pill-input picky-otp-input"
                          placeholder="• • • • • •"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                          ← Change WhatsApp Number
                        </button>

                        {canResend ? (
                          <button
                            type="button"
                            className="picky-otp-resend-btn"
                            onClick={handleSendOtp}
                          >
                            Resend WhatsApp OTP
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
                      placeholder="Enter admin email"
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
                      setAdminEmail('');
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

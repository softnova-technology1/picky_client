import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { cartService } from '../../../services/cart.service';
import { wishlistService } from '../../../services/wishlist.service';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useUiStore } from '../../../store/uiStore';
import { useGoogleLogin } from '@react-oauth/google';
import styles from './LoginPopupModal.module.css';

const GoogleIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" className={styles.googleSvg}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const WhatsAppIcon = ({ color = '#25D366', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={styles.whatsappSvg}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.12-.533-1.666-.693-2.73-2.39-2.813-2.5-.083-.11-.664-.882-.664-1.682 0-.8.419-1.194.568-1.356.148-.162.325-.202.434-.202.108 0 .216.002.311.007.1.005.234-.038.366.279.136.327.464 1.132.505 1.215.041.083.068.18.014.288-.054.11-.081.18-.162.275-.081.095-.17.212-.243.285-.081.082-.166.172-.072.334.095.162.421.694.904 1.124.622.554 1.146.726 1.309.807.162.081.27.122.311.19.041.067.041.391-.103.796z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.398C8.423 21.503 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.61 0-3.13-.45-4.43-1.23l-.32-.19-3.27.92.93-3.18-.21-.34C3.84 14.86 3.4 13.48 3.4 12c0-4.74 3.86-8.6 8.6-8.6s8.6 3.86 8.6 8.6-3.86 8.6-8.6 8.6z" />
  </svg>
);

export default function LoginPopupModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuthStore();
  const { items: localCartItems, setServerCart } = useCartStore();
  const { items: localWishlistItems, setWishlist } = useWishlistStore();
  const { showToast } = useUiStore();

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const dismissedRef = useRef(false);

  // ── Automatic 10-Second Timer when Site Opens ────────────────────────────
  useEffect(() => {
    // Clear any previous persistent dismissal flag so refreshing/reopening always triggers
    try {
      sessionStorage.removeItem('picky_login_popup_dismissed');
    } catch (e) {}

    // Expose global opener for testing anytime from console: window.openPickyLogin()
    window.openPickyLogin = () => setIsOpen(true);

    if (isLoggedIn) {
      console.log('[Picky] User is already authenticated. Login popup is suppressed.');
      setIsOpen(false);
      return;
    }

    const currentPath = window.location.pathname;
    const isExcluded =
      currentPath.startsWith('/softpicky-sn2026') ||
      currentPath.startsWith('/login') ||
      currentPath.startsWith('/signup') ||
      currentPath.startsWith('/order-success');

    if (isExcluded) return;

    console.log('[Picky] ⏱️ 10-second timer started for Welcome Login Popup...');

    const popupTimer = setTimeout(() => {
      const activePath = window.location.pathname;
      const isRouteExcluded =
        activePath.startsWith('/softpicky-sn2026') ||
        activePath.startsWith('/login') ||
        activePath.startsWith('/signup') ||
        activePath.startsWith('/order-success');

      const userLoggedIn = useAuthStore.getState().isLoggedIn;

      if (!userLoggedIn && !dismissedRef.current && !isRouteExcluded) {
        console.log('[Picky] 🚀 10s elapsed: Displaying Welcome Login Popup');
        setIsOpen(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(popupTimer);
  }, [isLoggedIn]);

  // ── Countdown Timer for Resend OTP ─────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isOpen && step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, timer]);

  // ── Dismiss / Close Action ─────────────────────────────────────────────────
  const handleClose = () => {
    setIsOpen(false);
    dismissedRef.current = true;
    setStep('phone');
    setOtp('');
  };

  // ── Navigate to Dedicated Sign Up on Login Page ────────────────────────────
  const handleCreateAccountClick = (e) => {
    if (e) e.preventDefault();
    handleClose();
    navigate('/signup');
  };

  // ── Sync Cart & Wishlist on Auth ───────────────────────────────────────────
  const syncUserData = async () => {
    try {
      if (localCartItems && localCartItems.length > 0) {
        const payload = localCartItems.map((item) => ({
          productId: item.productId || item.product?._id || item.product?.id || item.product || item._id,
          variant: item.variant || null,
          quantity: item.quantity || 1,
          price: item.price,
        }));
        const mergedCartRes = await cartService.merge(payload);
        if (mergedCartRes?.data) {
          setServerCart(mergedCartRes.data?.cart || mergedCartRes.data);
        }
      } else {
        const serverCartRes = await cartService.get();
        if (serverCartRes?.data) {
          setServerCart(serverCartRes.data?.cart || serverCartRes.data);
        }
      }
    } catch (err) {
      console.error('Cart sync error:', err);
    }

    try {
      if (localWishlistItems && localWishlistItems.length > 0) {
        const productIds = localWishlistItems.map((i) => i._id || i.id || i.product?._id || i.product || i);
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

  // ── Handle Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim();

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit WhatsApp number', 'error');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('+')
      ? cleanPhone
      : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`;

    try {
      setLoading(true);
      await authService.sendOTP(formattedPhone);
      showToast('6-digit OTP sent to your WhatsApp!', 'success');
      setPhone(formattedPhone);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error('Send WhatsApp OTP error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send WhatsApp OTP. Please check your WhatsApp number.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 6-digit WhatsApp OTP you received', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOTP(phone, otp.trim());
      const data = res?.data || res;
      const user = data.user;
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;

      if (!accessToken) throw new Error('No authentication token received.');

      login(user, accessToken, refreshToken);
      showToast(`Welcome back, ${user?.name || 'Customer'}!`, 'success');
      await syncUserData();
      setIsOpen(false);
    } catch (err) {
      console.error('WhatsApp OTP verify error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Invalid or expired WhatsApp OTP.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Customer Google OAuth Login ─────────────────────────────────────
  const handleGoogleAuthSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      const res = await authService.googleLogin({ accessToken: tokenResponse.access_token });
      const data = res?.data || res;
      login(data.user, data.accessToken || data.token, data.refreshToken);
      showToast(`Welcome back, ${data.user?.name || 'Customer'}!`, 'success');
      await syncUserData();
      setIsOpen(false);
    } catch (err) {
      console.error('Customer Google Auth Error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Google login failed. Please try WhatsApp login.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleAuthSuccess,
    onError: (error) => {
      console.error('Google Login Error:', error);
      showToast('Google Sign-in was cancelled or encountered an error.', 'error');
    },
  });

  const handleGoogleAuthClick = () => {
    const rawId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!rawId || rawId.trim() === '' || rawId.includes('placeholder')) {
      showToast('Google Sign-in is not configured yet. Please continue with WhatsApp.', 'info');
      return;
    }
    try {
      loginWithGoogle();
    } catch (e) {
      console.error('Google login trigger error:', e);
    }
  };

  // Don't render modal when closed or when user is authenticated
  if (!isOpen || isLoggedIn) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picky-login-modal-title"
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={styles.card}>
        {/* Top-Right 3D Artwork Layer with Organic Shelf Curve and White Shadow */}
        <div className={styles.artBackdrop} aria-hidden="true">
          <img
            src="/images/picky_popup_artwork_exact.png"
            alt="Picky 3D Shopping Curation Bag"
            className={styles.artImage}
            loading="eager"
          />
        </div>

        {/* Circular Close Button */}
        <button
          type="button"
          aria-label="Close dialog"
          className={styles.closeButton}
          onClick={handleClose}
        >
          <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          {/* Header: Logo & Category Navigation Tagline */}
          <header className={styles.header}>
            <div className={styles.brandRow}>
              {/* Storefront Logo Icon */}
              <svg className={styles.brandIcon} fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h16a1 1 0 0 1 1 1v2a3 3 0 0 1-2.2 2.89A3 3 0 0 1 16 9.89 3 3 0 0 1 13.2 9.89 3 3 0 0 1 10.8 9.89 3 3 0 0 1 8 9.89 3 3 0 0 1 5.2 9.89 3 3 0 0 1 3 7V5a1 1 0 0 1 1-1zm-.7 8.35A4.98 4.98 0 0 0 5 13c1.15 0 2.2-.4 3-1.07.8.67 1.85 1.07 3 1.07s2.2-.4 3-1.07c.8.67 1.85 1.07 3 1.07.7 0 1.35-.15 1.95-.4V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6.65zM10 15v4h4v-4h-4z" />
              </svg>
              {/* Brand Wordmark */}
              <span className={styles.brandWordmark}>Picky</span>
            </div>
            <p className={styles.tagline}>
              FASHION • BEAUTY • LIFESTYLE
            </p>
          </header>

          {step === 'otp' ? (
            /* ── STEP 2: OTP VERIFICATION MODE ── */
            <div>
              <section className={styles.headlineSection}>
                <h2 className={styles.headline}>
                  <span className={styles.serifWelcome}>Verify</span>
                  <span className={styles.serifPicky}>Code</span>
                </h2>
                <p className={styles.subtitleText}>
                  Enter the 6-digit WhatsApp code to continue
                </p>
              </section>

              <form onSubmit={handleVerifyOtp} className={styles.inputForm}>
                <div className={styles.waOtpNotice}>
                  <WhatsAppIcon size={16} color="#25D366" />
                  <span>OTP sent to WhatsApp: <strong>{phone}</strong></span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  className={styles.otpInput}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                />

                <div className={styles.otpControls}>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={() => setStep('phone')}
                  >
                    ← Change WhatsApp Number
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      className={styles.textBtn}
                      onClick={handleSendOtp}
                    >
                      Resend WhatsApp OTP
                    </button>
                  ) : (
                    <span className={styles.timerText}>
                      Resend in {timer}s
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <>
                      <span>VERIFY & LOG IN</span>
                      <span className={styles.btnArrow}>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ── STEP 1: MOBILE NUMBER LOGIN ── */
            <div>
              {/* Main Headline & Subtitle */}
              <section className={styles.headlineSection}>
                <h1 className={styles.headline}>
                  <span className={styles.serifWelcome}>Welcome to</span>
                  <span className={styles.serifPicky}>
                    Picky
                    <span className={styles.heartEmoji}>💜</span>
                    <span className={styles.sparkle}>✦</span>
                  </span>
                </h1>
                <p className={`${styles.subtitleText} ${styles.welcomeSubtitle}`}>
                  Your next favourite find is just one step.
                </p>
              </section>

              {/* Key Benefits / Trust Badges */}
              <section aria-label="Key Benefits" className={styles.benefitsSection}>
                {/* Feature 1: Fast Shopping */}
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM2 5h12v12H2V5zm12 4h4l3 3v5h-7V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className={styles.benefitText}>
                    Fast<br />Shopping
                  </div>
                </div>

                <div aria-hidden="true" className={styles.benefitDivider} />

                {/* Feature 2: Safe & Secure */}
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className={styles.benefitText}>
                    Safe &amp;<br />Secure
                  </div>
                </div>

                <div aria-hidden="true" className={styles.benefitDivider} />

                {/* Feature 3: Personalized Experience */}
                <div className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className={styles.benefitText}>
                    Personalized<br />Experience
                  </div>
                </div>
              </section>

              {/* Input Form matching exact login page UI */}
              <form onSubmit={handleSendOtp} className={styles.inputForm}>
                <div>
                  <div className={styles.inputContainer}>
                    {/* WhatsApp Icon */}
                    <span className={styles.waIconWrap}>
                      <WhatsAppIcon size={19} color="#25D366" />
                    </span>
                    {/* Country Code */}
                    <span className={styles.waCountryBadge}>+91</span>
                    {/* Divider */}
                    <div className={styles.verticalSeparator} />
                    {/* WhatsApp Phone Input */}
                    <input
                      id="picky-mobile-input"
                      type="tel"
                      maxLength={10}
                      className={styles.phoneInput}
                      placeholder="WhatsApp Number (e.g. 9876543210)"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Primary WhatsApp CTA Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                  data-purpose="submit-mobile-button"
                >
                  {loading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <>
                      <WhatsAppIcon size={18} color="#ffffff" />
                      <span>CONTINUE WITH WHATSAPP</span>
                      <span className={styles.btnArrow}>→</span>
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className={styles.orDivider}>
                  <span>OR</span>
                </div>

                {/* Continue with Google Button */}
                <button
                  type="button"
                  className={styles.googleButton}
                  onClick={handleGoogleAuthClick}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span>CONTINUE WITH GOOGLE</span>
                </button>

                {/* Footer Legal & Account Switcher redirecting to /signup */}
                <div className={styles.footerLegal}>
                  <p className={styles.termsText}>
                    By signing in, you agree to our{' '}
                    <Link to="/terms" onClick={handleClose} className={styles.termsLink}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" onClick={handleClose} className={styles.termsLink}>
                      Privacy Policy
                    </Link>.
                  </p>

                  <div className={styles.accountPrompt}>
                    <span>New to Picky?</span>
                    <button
                      type="button"
                      className={styles.accountActionBtn}
                      onClick={handleCreateAccountClick}
                    >
                      Create an Account →
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowUp } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';

const WhatsAppIcon = ({ size = 22, color = '#ffffff', className = '' }) => (
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

export default function FloatingActions() {
  const navigate = useNavigate();
  const cartItems = useCartStore((s) => s.items) || [];
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 280) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Bottom Left: Scroll To Top Button ── */}
      <button
        type="button"
        className={`picky-float-btn picky-float-scroll ${showScroll ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to Top"
      >
        <ArrowUp size={19} />
        <span className="picky-float-scroll-sub">^</span>
      </button>

      {/* ── Bottom Right: Floating Chat & Cart Stack ── */}
      <div className="picky-float-stack-right">
        {/* WhatsApp Live Consulting Chat Bubble */}
        <a
          href="https://wa.me/918300295721?text=Hi%20Picky!%20I%20would%20like%20to%20consult%20regarding%20products."
          target="_blank"
          rel="noopener noreferrer"
          className="picky-float-btn picky-float-chat"
          aria-label="Chat on WhatsApp"
          title="WhatsApp Consulting: +91 83002 95721"
        >
          <WhatsAppIcon size={22} color="#ffffff" />
          <span className="picky-chat-ping-badge" />
        </a>

        {/* Floating Quick Cart Button */}
        <button
          type="button"
          className="picky-float-btn picky-float-cart"
          onClick={() => navigate('/cart')}
          aria-label="View shopping cart"
          title={`Cart (${cartCount} items)`}
        >
          <ShoppingCart size={20} color="#ffffff" />
          {cartCount > 0 && (
            <span className="picky-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </button>
      </div>
    </>
  );
}

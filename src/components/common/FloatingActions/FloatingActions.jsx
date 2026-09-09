import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ShoppingCart, ArrowUp } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';

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
        {/* WhatsApp Live Support Chat Bubble */}
        <a
          href="https://wa.me/919876543210?text=Hi%20Picky%20Support!%20I%20have%20a%20question."
          target="_blank"
          rel="noopener noreferrer"
          className="picky-float-btn picky-float-chat"
          aria-label="Chat on WhatsApp"
          title="Direct WhatsApp Support"
        >
          <MessageCircle size={22} color="#ffffff" />
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

import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Gift,
  Heart,
  Sparkles,
  Cake,
  Award,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import styles from './AdminGiftCard.module.css';

/**
 * Intelligent Occasion & Theme Detector
 * Analyzes the customer's gift message text to automatically select the matching aesthetic card theme.
 */
function detectOccasionTheme(message = '') {
  const text = (message || '').toLowerCase();
  if (/birth|bday|hbd|born|age|turning|piranthanal|pirantha/i.test(text)) {
    return 'birthday';
  }
  if (/love|anniversary|wedding|sweetheart|darling|husband|wife|kaadhal|kadhal|heart|forever|miss you|babe|honey|soulmate|valentine/i.test(text)) {
    return 'love';
  }
  if (/congrat|proud|success|milestone|promotion|graduat|winner|achievement|bravo/i.test(text)) {
    return 'congrats';
  }
  if (/thank|thanks|grateful|gratitude|appreciat|nandri|kindness/i.test(text)) {
    return 'thankyou';
  }
  return 'classic';
}

/**
 * Preset Theme Definitions with Typography, Headers & Default Messages
 */
const THEMES = {
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    icon: Cake,
    tag: 'Celebration of Life',
    title: 'Happy Birthday!',
    subtitle: 'Wishing You A Day Filled With Endless Smiles & Sunshine',
    defaultMessage: 'May your birthday be blessed with endless happiness, great joy, and all the sweet moments your heart can hold. Here’s to a marvelous year ahead!',
    emblem: '🎂',
    sealText: 'BIRTHDAY SPECIAL',
  },
  love: {
    id: 'love',
    name: 'Love & Romance',
    icon: Heart,
    tag: 'From The Heart',
    title: 'With All My Heart',
    subtitle: 'A Cherished Token of Love Just For You',
    defaultMessage: 'Every single moment with you is a treasure. Thank you for filling my world with love and brightness. Sending you endless affection today and always.',
    emblem: '💖',
    sealText: 'PULSE OF LOVE',
  },
  congrats: {
    id: 'congrats',
    name: 'Congratulations',
    icon: Award,
    tag: 'Milestone Achievement',
    title: 'Heartiest Congratulations!',
    subtitle: 'Celebrating Your Hard Work, Dedication & Success',
    defaultMessage: 'So extraordinarily proud of your grand achievement! May this milestone be the beginning of many more triumphs and brilliant adventures.',
    emblem: '🌟',
    sealText: 'GOLDEN VICTORY',
  },
  thankyou: {
    id: 'thankyou',
    name: 'Thank You',
    icon: Sparkles,
    tag: 'Sincere Gratitude',
    title: 'A Heartfelt Thank You',
    subtitle: 'With Deep Appreciation For Your Kind Spirit',
    defaultMessage: 'Your kindness and genuine support mean more than words can express. Thank you wholeheartedly for being such a wonderful blessing in my life.',
    emblem: '🌿',
    sealText: 'PURE GRATITUDE',
  },
  classic: {
    id: 'classic',
    name: 'Classic Luxury',
    icon: Gift,
    tag: 'Warmest Wishes',
    title: 'A Special Gift For You',
    subtitle: 'Handpicked With Care Especially For You',
    defaultMessage: 'Wishing you wonderful moments of joy, smiles, and pure happiness. May this thoughtful gift bring warmth and delight to your day!',
    emblem: '🎁',
    sealText: 'PICKY LUXURY SEAL',
  },
};

/**
 * Scalable Victorian Filigree Corner Flourish SVG
 */
function CornerFlourish({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={`${styles.cornerOrnament} ${className}`}>
      <path
        d="M2 38 C 2 12, 12 2, 38 2 M8 38 C 8 16, 16 8, 38 8 M14 38 C 14 22, 22 14, 38 14 M2 2 Q 10 2, 10 10 Q 2 10, 2 2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="6" cy="6" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function AdminGiftCard({ order, onClose }) {
  if (!order) return null;

  // Extract initial values from order
  const rawMessage = order.giftWrap?.message?.trim() || '';
  const initialTheme = useMemo(() => detectOccasionTheme(rawMessage), [rawMessage]);

  const [activeTheme, setActiveTheme] = useState(initialTheme);
  const [showEditor, setShowEditor] = useState(false);
  const [cardWidth, setCardWidth] = useState('520px'); // 520px (5x7) vs 440px (4x6)

  // Recipient, Message, and Sender fields
  const defaultRecipient =
    order.shippingAddress?.fullName ||
    order.shippingAddress?.name ||
    order.user?.name ||
    'Dearest Friend';

  const defaultSender =
    order.customer?.name ||
    order.user?.name ||
    'With Warmest Wishes';

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [sender, setSender] = useState(defaultSender);
  const [customMessage, setCustomMessage] = useState(
    rawMessage && rawMessage.toLowerCase() !== 'no message'
      ? rawMessage
      : THEMES[initialTheme].defaultMessage
  );

  const themeConfig = THEMES[activeTheme] || THEMES.classic;

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    const origTheme = detectOccasionTheme(rawMessage);
    setActiveTheme(origTheme);
    setRecipient(defaultRecipient);
    setSender(defaultSender);
    setCustomMessage(
      rawMessage && rawMessage.toLowerCase() !== 'no message'
        ? rawMessage
        : THEMES[origTheme].defaultMessage
    );
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* ── 1. Modal Top Bar ── */}
        <div className={styles.modalHeaderBar}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBadge}>
              <Gift size={20} />
            </div>
            <div>
              <h3 className={styles.headerTitle}>Printable Gift Greeting Card</h3>
              <p className={styles.headerSubtitle}>
                Order #{order.orderNumber || order._id} • {order.items?.length || 1} Item(s)
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={handlePrint}
              className={styles.printBtn}
              title="Print High-Resolution Cardstock Gift Card"
            >
              <Printer size={16} />
              <span>Print Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── 2. Toolbar: Theme Detection & Live Controls ── */}
        <div className={styles.toolbar}>
          <div className={styles.themeSelector}>
            <span className={styles.toolbarLabel}>Card Style:</span>
            {Object.values(THEMES).map((thm) => {
              const IconComp = thm.icon;
              const isActive = activeTheme === thm.id;
              return (
                <button
                  key={thm.id}
                  type="button"
                  className={`${styles.themePill} ${isActive ? styles.themePillActive : ''}`}
                  onClick={() => {
                    setActiveTheme(thm.id);
                    // If current text was empty/default, update message to new theme's default
                    if (!rawMessage || rawMessage.toLowerCase() === 'no message') {
                      setCustomMessage(thm.defaultMessage);
                    }
                  }}
                >
                  <IconComp size={13} />
                  <span>{thm.name}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.toolbarTools}>
            <button
              type="button"
              className={`${styles.toolToggleBtn} ${showEditor ? styles.toolToggleBtnActive : ''}`}
              onClick={() => setShowEditor(!showEditor)}
              title="Customize To, From & Message text"
            >
              <Edit3 size={13} />
              <span>{showEditor ? 'Hide Editor' : 'Edit Text'}</span>
            </button>

            <button
              type="button"
              className={styles.toolToggleBtn}
              onClick={() => setCardWidth(cardWidth === '520px' ? '440px' : '520px')}
              title="Switch between 5x7 and 4x6 proportions"
            >
              <span>{cardWidth === '520px' ? 'Size: 5" × 7"' : 'Size: 4" × 6"'}</span>
            </button>
          </div>
        </div>

        {/* ── 3. Quick Customizer Drawer (Optional) ── */}
        {showEditor && (
          <div className={styles.editDrawer}>
            <div className={styles.editGroup}>
              <label className={styles.editLabel}>Recipient (To):</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient name..."
                className={styles.editInput}
              />
            </div>

            <div className={styles.editGroup}>
              <label className={styles.editLabel}>Sender (From):</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Sender name..."
                className={styles.editInput}
              />
            </div>

            <div className={styles.editGroup}>
              <label className={styles.editLabel}>Greeting Message:</label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Personal heartfelt message..."
                className={styles.editInput}
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className={styles.resetBtn}
              title="Reset to original order data"
            >
              <RotateCcw size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Reset
            </button>
          </div>
        )}

        {/* ── 4. Card Preview Canvas ── */}
        <div className={styles.previewCanvas}>
          <div
            className={`${styles.cardStage} ${styles[`theme_${activeTheme}`]}`}
            style={{ width: cardWidth }}
          >
            {/* Victorian / Ornate Border Framing */}
            <div className={styles.cardOuterBorder} />
            <CornerFlourish className={styles.cornerTL} />
            <CornerFlourish className={styles.cornerTR} />
            <CornerFlourish className={styles.cornerBL} />
            <CornerFlourish className={styles.cornerBR} />

            {/* Content Container */}
            <div className={styles.cardInnerContent}>
              
              {/* Header Cluster */}
              <div className={styles.cardHeaderSection}>
                <div className={styles.cardEmblem}>
                  {themeConfig.emblem}
                </div>
                <span className={styles.themeTag}>
                  {themeConfig.tag}
                </span>
                <h1 className={styles.cardTitle}>
                  {themeConfig.title}
                </h1>
                <p className={styles.cardSubtitle}>
                  {themeConfig.subtitle}
                </p>

                <div className={styles.dividerLine}>
                  <span />
                  <Sparkles size={14} />
                  <span />
                </div>
              </div>

              {/* Body: Recipient, Message, Sender */}
              <div className={styles.cardBodySection}>
                <div className={styles.recipientBox}>
                  <span className={styles.recipientLabel}>Specially For:</span>
                  <div className={styles.recipientName}>
                    {recipient || 'Beloved Recipient'}
                  </div>
                </div>

                <div className={styles.quoteContainer}>
                  <span className={styles.quoteMarkLeft}>“</span>
                  <p className={styles.quoteText}>
                    {customMessage || themeConfig.defaultMessage}
                  </p>
                  <span className={styles.quoteMarkRight}>”</span>
                </div>

                <div className={styles.senderBox}>
                  <span className={styles.senderLabel}>With Love & Warmth,</span>
                  <div className={styles.senderName}>
                    {sender || 'Someone Special'}
                  </div>
                </div>
              </div>

              {/* Footer Section: Royal Seal & Picky Brand Stamp */}
              <div className={styles.cardFooterSection}>
                <div className={styles.sealBadge}>
                  <Sparkles size={11} />
                  <span>★ {themeConfig.sealText} ★</span>
                </div>

                <div className={styles.footerOrderMeta}>
                  <div><strong>Picky Luxury Gifting</strong></div>
                  <div>Order #{order.orderNumber || order._id} • {formattedDate}</div>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.previewTip}>
            <span>💡 <strong>Tip:</strong> Click "Print Card" above. The preview is calibrated for standard 5"×7" cardstock or photo paper.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

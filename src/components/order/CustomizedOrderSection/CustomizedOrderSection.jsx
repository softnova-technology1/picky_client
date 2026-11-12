import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  Layers,
  Palette,
  Maximize2,
  X,
  ExternalLink,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './CustomizedOrderSection.module.css';

const getColorHex = (color) => {
  if (!color) return '#1e293b';
  if (typeof color === 'string') return color.startsWith('#') || color.startsWith('rgb') ? color : '#1e293b';
  if (typeof color === 'object') return color.hex || '#1e293b';
  return '#1e293b';
};

const getColorName = (color) => {
  if (!color) return 'Custom Color';
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.name || color.hex || 'Custom Color';
  return 'Custom Color';
};

export default function CustomizedOrderSection({ order, isAdmin = false }) {
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  if (!order) return null;

  // Find all items in this order that have customization
  const items = Array.isArray(order.items) ? order.items : [];
  const customizedItems = items.filter(
    (item) => item.isCustomized || item.customization || (order.isCustomized && items.length === 1)
  );

  if (customizedItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* ── Section Header Banner with Customized Order Badge ── */}
      <div className={styles.header}>
        <div className={styles['header-left']}>
          <div className={styles['header-icon']}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className={styles.title}>Customized Orders</h2>
            <p className={styles.subtitle}>
              Bespoke manufacturing specifications &amp; artisan production parameters
            </p>
          </div>
        </div>

        {/* Counterpart to the Gift Wrap Badge */}
        <span className={styles['customized-badge']}>
          <Sparkles size={12} /> Customized Order
        </span>
      </div>

      <div className={styles.body}>
        {customizedItems.map((item, idx) => {
          const cust = item.customization || {};
          const isCust = Boolean(item.isCustomized || item.customization);
          const customCost = Number(item.customizationCost || 0);
          const basePrice = Number(
            item.basePrice !== undefined
              ? item.basePrice
              : Math.max(0, Number(item.price || 0) - customCost)
          );
          const unitPrice = Number(item.price || basePrice + customCost);
          const qty = Number(item.quantity) || 1;
          const totalItemPrice = unitPrice * qty;

          const frontImages = Array.isArray(cust.frontImages) ? cust.frontImages : [];
          const backImages = Array.isArray(cust.backImages) ? cust.backImages : [];
          const colorHex = getColorHex(cust.color);
          const colorName = getColorName(cust.color);

          const productSlug =
            item.product?.slug ||
            item.slug ||
            item.product?._id ||
            item.productId ||
            item.product ||
            item._id;
          const productLink = productSlug ? `/products/${productSlug}` : null;

          return (
            <div key={idx} className={styles['item-wrapper']}>
              {/* ── 1. Originating Product Overview Card ── */}
              <div className={styles['origin-card']}>
                <div className={styles['origin-left']}>
                  <img
                    src={
                      item.image ||
                      (Array.isArray(item.images) ? item.images[0] : null) ||
                      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
                    }
                    alt={item.name}
                    className={styles['origin-img']}
                  />
                  <div className={styles['origin-info']}>
                    {productLink && !isAdmin ? (
                      <Link to={productLink} className={styles['origin-name']}>
                        {item.name}
                      </Link>
                    ) : (
                      <span className={styles['origin-name']}>{item.name}</span>
                    )}
                    <div className={styles['origin-meta']}>
                      <span>Originating Product</span>
                      <span>•</span>
                      <span>Quantity: <strong>{qty} Unit(s)</strong></span>
                      {cust.orderId && (
                        <>
                          <span>•</span>
                          <span>Ref: <strong>#{cust.orderId}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles['origin-pricing']}>
                  <span className={styles['price-label']}>Total Unit Price</span>
                  <span className={styles['price-total']}>{formatPrice(unitPrice)}</span>
                  <span className={styles['price-subbreakdown']}>
                    Base: {formatPrice(basePrice)} + Customization: +{formatPrice(customCost)}
                  </span>
                </div>
              </div>

              {/* ── 2. Specifications Grid: Front and Backside Customization ── */}
              <div className={styles['specs-grid']}>
                {/* 2A. Front Customization */}
                <div className={styles['spec-card']}>
                  <div className={styles['spec-header']}>
                    <span className={styles['spec-title']}>
                      <Type size={16} color="#0284c7" /> Front Customization
                    </span>
                    <span className={styles['font-pill']}>
                      {cust.frontFont || 'Modern Sans'}
                    </span>
                  </div>

                  <div className={styles['text-display-box']}>
                    <div className={styles['text-display-label']}>FRONT TEXT DISPLAY</div>
                    <p className={styles['text-display-content']}>
                      "{cust.frontText || cust.text || 'No text specified'}"
                    </p>
                  </div>

                  <div className={styles['font-detail-row']}>
                    <span className={styles['font-detail-label']}>Selected Font Style</span>
                    <span className={styles['font-detail-val']}>
                      {cust.frontFont || 'Modern Sans'}
                    </span>
                  </div>

                  {/* Uploaded Front Images */}
                  <div className={styles['images-section']}>
                    <span className={styles['images-label']}>
                      Uploaded Front Images ({frontImages.length}/4)
                    </span>
                    <div className={styles['images-grid']}>
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const imgItem = frontImages[slotIdx];
                        const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                        return (
                          <div
                            key={slotIdx}
                            className={styles['image-thumb-box']}
                            onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                            title={imgUrl ? 'Click to preview high resolution artwork' : 'Slot empty'}
                          >
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={`Front Artwork ${slotIdx + 1}`}
                                className={styles['image-thumb']}
                              />
                            ) : (
                              <div className={styles['image-empty']}>
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2B. Backside Customization */}
                <div className={styles['spec-card']}>
                  <div className={styles['spec-header']}>
                    <span className={styles['spec-title']}>
                      <Type size={16} color="#0284c7" /> Backside Customization
                    </span>
                    <span className={styles['font-pill']}>
                      {cust.backFont || 'Elegant Serif'}
                    </span>
                  </div>

                  <div className={styles['text-display-box']}>
                    <div className={styles['text-display-label']}>BACKSIDE TEXT DISPLAY</div>
                    <p className={styles['text-display-content']}>
                      "{cust.backText || 'No text specified'}"
                    </p>
                  </div>

                  <div className={styles['font-detail-row']}>
                    <span className={styles['font-detail-label']}>Selected Font Style</span>
                    <span className={styles['font-detail-val']}>
                      {cust.backFont || 'Elegant Serif'}
                    </span>
                  </div>

                  {/* Uploaded Backside Images */}
                  <div className={styles['images-section']}>
                    <span className={styles['images-label']}>
                      Uploaded Backside Images ({backImages.length}/4)
                    </span>
                    <div className={styles['images-grid']}>
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const imgItem = backImages[slotIdx];
                        const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                        return (
                          <div
                            key={slotIdx}
                            className={styles['image-thumb-box']}
                            onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                            title={imgUrl ? 'Click to preview high resolution artwork' : 'Slot empty'}
                          >
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={`Backside Artwork ${slotIdx + 1}`}
                                className={styles['image-thumb']}
                              />
                            ) : (
                              <div className={styles['image-empty']}>
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3. General Specifications (Material, Size, Color, Mockups) ── */}
              <div className={styles['general-card']}>
                <div className={styles['spec-header']}>
                  <span className={styles['spec-title']}>
                    <Layers size={16} color="#0284c7" /> General Specifications
                  </span>
                  <span className={styles['font-pill']}>Fabric &amp; Examples</span>
                </div>

                <div className={styles['general-grid']}>
                  <div className={styles['general-item']}>
                    <span className={styles['general-item-label']}>MATERIAL / FABRIC TYPE</span>
                    <span className={styles['general-item-value']}>
                      {cust.material || 'Heavyweight French Terry Fleece'}
                    </span>
                  </div>

                  <div className={styles['general-item']}>
                    <span className={styles['general-item-label']}>SELECTED SIZE</span>
                    <span className={styles['general-item-value']}>
                      {cust.size || item.selectedSize || 'M'}
                    </span>
                  </div>

                  <div className={styles['general-item']}>
                    <span className={styles['general-item-label']}>CUSTOM COLOR</span>
                    <span className={styles['general-item-value']}>
                      <span className={styles['color-dot']} style={{ backgroundColor: colorHex }} />
                      {colorName}
                    </span>
                  </div>
                </div>

                {/* Uploaded Example Mockups */}
                {(cust.frontExampleImage || cust.backExampleImage) && (
                  <div className={styles['mockup-item']}>
                    <span className={styles['general-item-label']}>UPLOADED EXAMPLE MOCKUPS</span>
                    <div className={styles['mockups-grid']}>
                      {cust.frontExampleImage && (
                        <div
                          className={styles['mockup-preview-card']}
                          onClick={() => setActiveLightboxImg(cust.frontExampleImage)}
                          title="Click to view front example mockup"
                        >
                          <img
                            src={cust.frontExampleImage}
                            alt="Front Example Mockup"
                            className={styles['mockup-thumb']}
                          />
                          <span className={styles['mockup-label']}>Front Example Mockup</span>
                        </div>
                      )}
                      {cust.backExampleImage && (
                        <div
                          className={styles['mockup-preview-card']}
                          onClick={() => setActiveLightboxImg(cust.backExampleImage)}
                          title="Click to view back example mockup"
                        >
                          <img
                            src={cust.backExampleImage}
                            alt="Back Example Mockup"
                            className={styles['mockup-thumb']}
                          />
                          <span className={styles['mockup-label']}>Back Example Mockup</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── 4. Financial Price Calculation Breakdown ── */}
              <div className={styles['pricing-summary']}>
                <div className={styles['pricing-row']}>
                  <span>Base Product Price ({formatPrice(basePrice)} × {qty})</span>
                  <span>{formatPrice(basePrice * qty)}</span>
                </div>
                <div className={`${styles['pricing-row']} ${styles['pricing-row-highlight']}`}>
                  <span>Customization Fee ({formatPrice(customCost)} × {qty})</span>
                  <span>+{formatPrice(customCost * qty)}</span>
                </div>
                <div className={styles['pricing-row']}>
                  <span>Quantity</span>
                  <span>{qty} Unit(s)</span>
                </div>
                <div className={styles['pricing-total-row']}>
                  <span className={styles['pricing-total-label']}>Total Customized Order Amount</span>
                  <span className={styles['pricing-total-val']}>{formatPrice(totalItemPrice)}</span>
                </div>
                <p className={styles['pricing-note']}>
                  ✓ Base product price and customization cost are tracked separately in your invoice &amp; accounting ledger.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Lightbox Image Modal ── */}
      {activeLightboxImg && (
        <div
          className={styles['lightbox-overlay']}
          onClick={() => setActiveLightboxImg(null)}
        >
          <div
            className={styles['lightbox-content']}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles['lightbox-close']}
              onClick={() => setActiveLightboxImg(null)}
            >
              <X size={24} /> Close
            </button>
            <img
              src={activeLightboxImg}
              alt="High Resolution Artwork Preview"
              className={styles['lightbox-img']}
            />
          </div>
        </div>
      )}
    </div>
  );
}

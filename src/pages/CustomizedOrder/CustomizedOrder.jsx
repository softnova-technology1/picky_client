import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Edit2,
  Eye,
  X,
  Package,
  Layers,
  Palette,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import styles from './CustomizedOrder.module.css';

export default function CustomizedOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCartStore();
  const { showToast } = useUiStore();

  const [orderData, setOrderData] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    // Read from state or sessionStorage
    const stateData = location.state?.customizedOrder;
    if (stateData) {
      setOrderData(stateData);
    } else {
      try {
        const stored = sessionStorage.getItem('picky_customized_order');
        if (stored) {
          setOrderData(JSON.parse(stored));
        }
      } catch (_) {}
    }
  }, [location.state]);

  if (!orderData) {
    return (
      <PageWrapper>
        <div className={styles['page-container']} style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <Package size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>No Active Customized Order</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>
            Please select a customizable product to begin tailoring your specifications.
          </p>
          <Link
            to="/products"
            className={styles['btn-add-cart']}
            style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}
          >
            <ArrowLeft size={16} /> Explore Products
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const { product, front, backside, general, pricing, orderId } = orderData;
  const quantity = pricing.quantity || 1;

  const buildCustomizedProductItem = () => {
    const rawId = product._id || product.id || product.productId;
    const prodId = (rawId || '').toString().includes('_custom_') ? rawId.toString().split('_custom_')[0] : (rawId || product.slug);
    const cartItemId = `${prodId}_custom_${orderId}`;

    return {
      ...product,
      _id: prodId,
      id: prodId,
      productId: prodId,
      cartItemId,
      isCustomized: true,
      basePrice: pricing.basePrice,
      customizationCost: pricing.customizationCost,
      price: pricing.totalUnitPrice,
      discountPrice: pricing.totalUnitPrice,
      originalPrice: (product.originalPrice || pricing.basePrice) + pricing.customizationCost,
      selectedSize: general.size || null,
      selectedColor: (typeof general.color === 'object' ? general.color?.name : general.color) || null,
      customization: {
        orderId,
        frontText: front.text,
        frontFont: front.font,
        frontImages: front.images,
        backText: backside.text,
        backFont: backside.font,
        backImages: backside.images,
        material: general.material,
        size: general.size,
        color: general.color,
        frontExampleImage: general.frontExampleImage,
        backExampleImage: general.backExampleImage,
      },
      quantity,
    };
  };

  // Add Customized Order to Bag & View Cart
  const handleAddToCartAndProceed = () => {
    const customizedItem = buildCustomizedProductItem();
    addItem(customizedItem, quantity);
    showToast(`Customized Order #${orderId} added to your bag!`, 'success');
    navigate('/cart');
  };

  // Instant direct checkout for customized order
  const handleInstantCheckout = () => {
    const customizedItem = buildCustomizedProductItem();
    setBuyNowItem(customizedItem);
    showToast(`Proceeding to checkout for Customized Order #${orderId}...`, 'info');
    navigate('/checkout?buyNow=true');
  };

  return (
    <PageWrapper>
      <div className={styles['page-container']}>
        {/* Breadcrumb Navigation */}
        <nav className={styles['breadcrumbs']} aria-label="Breadcrumb">
          <Link to="/" className={styles['breadcrumb-link']}>Home</Link>
          <span>/</span>
          <Link to="/products" className={styles['breadcrumb-link']}>Products</Link>
          <span>/</span>
          <Link to={`/products/${product.slug}`} className={styles['breadcrumb-link']}>{product.name}</Link>
          <span>/</span>
          <span className={styles['breadcrumb-current']}>Customized Order</span>
        </nav>

        {/* ── 1. Page Header & Ref Meta ── */}
        <div className={styles['header-banner']}>
          <div className={styles['header-title-col']}>
            <h1 className={styles['order-main-title']}>Customized Order Review</h1>
            <div className={styles['order-ref-meta']}>
              <span>Order Reference: <strong>#{orderId}</strong></span>
              <span>•</span>
              <span>Status: Ready for Production &amp; Checkout</span>
            </div>
          </div>
          <Link
            to={`/products/${product.slug}/customize`}
            className={styles['btn-edit-custom']}
            style={{ color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
          >
            <Edit2 size={14} /> Edit Specifications
          </Link>
        </div>

        {/* ── 2. The Customized Order Badge Card (Similar to Gift Wrap Service Box & Badge) ── */}
        <div className={styles['customized-order-banner']}>
          <div className={styles['banner-header']}>
            <span className={styles['banner-title']}>
              <Sparkles size={18} /> Bespoke Manufacturing Specification
            </span>
            {/* The Badge — counterpart to 'gift wrap' badge */}
            <span className={styles['customized-order-badge']}>
              <Sparkles size={12} /> Customized Order
            </span>
          </div>
          <p className={styles['banner-sub']}>
            This order originated from <strong>"{product.name}"</strong> and includes customized front, backside, fabric, and color specifications.
          </p>
        </div>

        {/* ── 3. Product from which the Order Originated ── */}
        <div className={styles['origin-card']}>
          <div className={styles['origin-left']}>
            <img src={product.image} alt={product.name} className={styles['origin-thumb']} />
            <div className={styles['origin-details']}>
              <Link to={`/products/${product.slug}`} className={styles['origin-name']}>
                {product.name}
              </Link>
              <div className={styles['origin-submeta']}>
                <span>SKU: {product.sku || 'PRD'}</span>
                <span>•</span>
                <span>Category: {product.category || 'Apparel'}</span>
                <span>•</span>
                <span>Quantity: <strong>{quantity} Item(s)</strong></span>
              </div>
            </div>
          </div>

          <div className={styles['origin-price-box']}>
            <span className={styles['unit-price-label']}>Total Unit Price</span>
            <span className={styles['unit-price-val']}>{formatPrice(pricing.totalUnitPrice)}</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Base: {formatPrice(pricing.basePrice)} + Customization: +{formatPrice(pricing.customizationCost)}
            </span>
          </div>
        </div>

        {/* ── 4. All Customization Details (Front, Backside, General) ── */}
        <div className={styles['details-grid']}>
          {/* Section: Front Specifications */}
          <div className={styles['spec-card']}>
            <div className={styles['spec-header']}>
              <div className={styles['spec-title']}>
                <span>Front Customization</span>
              </div>
              <span className={styles['spec-badge']}>Font: {front.font || 'Default'}</span>
            </div>

            {/* Custom Text Display rendered with the font style */}
            <div className={styles['text-preview-box']}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
                Front Text Display
              </div>
              <div className={styles['text-render']} style={front.fontStyle || {}}>
                {front.text ? `"${front.text}"` : <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No text specified</span>}
              </div>
            </div>

            <div className={styles['spec-meta-row']}>
              <span>Selected Font Style</span>
              <strong>{front.font}</strong>
            </div>

            {/* Front Uploaded Images */}
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Uploaded Front Images ({front.images?.length || 0}/4):
              </span>
              {front.images && front.images.length > 0 ? (
                <div className={styles['thumbs-row']}>
                  {front.images.map((img, i) => (
                    <img
                      key={img.id || i}
                      src={img.url}
                      alt={`Front ${i + 1}`}
                      className={styles['thumb-item']}
                      onClick={() => setLightboxUrl(img.url)}
                      title="Click to view full size"
                    />
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  No front images attached
                </div>
              )}
            </div>
          </div>

          {/* Section: Backside Specifications */}
          <div className={styles['spec-card']}>
            <div className={styles['spec-header']}>
              <div className={styles['spec-title']}>
                <span>Backside Customization</span>
              </div>
              <span className={styles['spec-badge']}>Font: {backside.font || 'Default'}</span>
            </div>

            {/* Custom Text Display rendered with the font style */}
            <div className={styles['text-preview-box']}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem', fontWeight: 700 }}>
                Backside Text Display
              </div>
              <div className={styles['text-render']} style={backside.fontStyle || {}}>
                {backside.text ? `"${backside.text}"` : <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No text specified</span>}
              </div>
            </div>

            <div className={styles['spec-meta-row']}>
              <span>Selected Font Style</span>
              <strong>{backside.font}</strong>
            </div>

            {/* Backside Uploaded Images */}
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Uploaded Backside Images ({backside.images?.length || 0}/4):
              </span>
              {backside.images && backside.images.length > 0 ? (
                <div className={styles['thumbs-row']}>
                  {backside.images.map((img, i) => (
                    <img
                      key={img.id || i}
                      src={img.url}
                      alt={`Back ${i + 1}`}
                      className={styles['thumb-item']}
                      onClick={() => setLightboxUrl(img.url)}
                      title="Click to view full size"
                    />
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  No backside images attached
                </div>
              )}
            </div>
          </div>

          {/* Section: General Specifications (Material, Size, Color, Example Images) */}
          <div className={`${styles['spec-card']} ${styles['spec-card-full']}`}>
            <div className={styles['spec-header']}>
              <div className={styles['spec-title']}>
                <Layers size={16} />
                <span>General Specifications</span>
              </div>
              <span className={styles['spec-badge']}>Fabric &amp; Examples</span>
            </div>

            <div className={styles['general-specs-grid']}>
              {/* Material */}
              <div className={styles['general-spec-item']}>
                <div className={styles['general-spec-label']}>Material / Fabric Type</div>
                <div className={styles['general-spec-val']}>{general.material || 'Standard Fabric'}</div>
              </div>

              {/* Size */}
              <div className={styles['general-spec-item']}>
                <div className={styles['general-spec-label']}>Selected Size</div>
                <div className={styles['general-spec-val']}>{general.size || 'Standard'}</div>
              </div>

              {/* Custom Color Setting */}
              <div className={styles['general-spec-item']}>
                <div className={styles['general-spec-label']}>Custom Color</div>
                <div className={styles['general-spec-val']}>
                  <span className={styles['color-dot']} style={{ background: general.color?.hex || '#8b5cf6' }} />
                  <span>{general.color?.name || 'Custom Color'}</span>
                </div>
              </div>

              {/* Example Images */}
              <div className={styles['general-spec-item']} style={{ gridColumn: 'span 2' }}>
                <div className={styles['general-spec-label']}>Uploaded Example Mockups</div>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                  {general.frontExampleImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={general.frontExampleImage}
                        alt="Front example"
                        className={styles['thumb-item']}
                        onClick={() => setLightboxUrl(general.frontExampleImage)}
                      />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>Front Example Mockup</span>
                    </div>
                  )}
                  {general.backExampleImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={general.backExampleImage}
                        alt="Back example"
                        className={styles['thumb-item']}
                        onClick={() => setLightboxUrl(general.backExampleImage)}
                      />
                      <span style={{ fontSize: '0.78rem', color: '#475569' }}>Back Example Mockup</span>
                    </div>
                  )}
                  {!general.frontExampleImage && !general.backExampleImage && (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No example mockups uploaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. Pricing Summary & Final Order Submission Card ── */}
        <div className={styles['order-summary-card']}>
          <div className={styles['summary-rows-wrap']}>
            <div className={styles['summary-row']}>
              <span>Base Product Price ({formatPrice(pricing.basePrice)} × {quantity})</span>
              <strong>{formatPrice(pricing.basePrice * quantity)}</strong>
            </div>
            <div className={styles['summary-row']} style={{ color: '#38bdf8' }}>
              <span>Customization Fee ({formatPrice(pricing.customizationCost)} × {quantity})</span>
              <strong>+{formatPrice(pricing.customizationCost * quantity)}</strong>
            </div>
            <div className={styles['summary-row']}>
              <span>Quantity</span>
              <strong>{quantity} Unit(s)</strong>
            </div>
            <div className={styles['summary-total-row']}>
              <span>Total Customized Order Amount</span>
              <span className={styles['total-number']}>{formatPrice(pricing.totalOrderPrice)}</span>
            </div>
          </div>

          <div className={styles['actions-row']}>
            <button
              type="button"
              onClick={handleInstantCheckout}
              className={styles['btn-add-cart']}
              title="Instant direct checkout for this customized order"
            >
              <ShoppingBag size={20} />
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={handleAddToCartAndProceed}
              className={styles['btn-edit-custom']}
              style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.4)', color: '#ffffff' }}
              title="Add to bag and open cart"
            >
              <ShoppingBag size={16} />
              <span>Add to Bag &amp; View Cart</span>
            </button>

            <Link
              to={`/products/${product.slug}/customize`}
              className={styles['btn-edit-custom']}
            >
              <Edit2 size={15} /> Edit Specifications
            </Link>
          </div>
        </div>

        {/* Fullscreen Lightbox Modal */}
        {lightboxUrl && (
          <div className={styles['modal-overlay']} onClick={() => setLightboxUrl(null)}>
            <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className={styles['modal-close-btn']}
                title="Close"
              >
                <X size={20} />
              </button>
              <img src={lightboxUrl} alt="Preview" className={styles['modal-img']} />
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { settingsService } from '../../services/settings.service';
import { DEFAULT_CUSTOMIZER_FORM_CONFIG } from '../admin/AdminCustomizerBuilder/AdminCustomizerBuilder';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  Trash2,
  Plus,
  Minus,
  Check,
  Upload,
  AlertCircle,
  X,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import styles from './ProductCustomize.module.css';

// Default Fonts fallback
const DIRECT_FONTS = [
  { id: 'sans', name: 'Modern Sans', style: { fontFamily: 'system-ui, -apple-system, sans-serif' }, sample: 'Aa Bb 123' },
  { id: 'serif', name: 'Elegant Serif', style: { fontFamily: 'Georgia, serif' }, sample: 'Aa Bb 123' },
  { id: 'script', name: 'Script Style', style: { fontFamily: '"Brush Script MT", cursive, sans-serif' }, sample: 'Aa Bb 123' },
];

const DROPDOWN_FONTS = [
  { id: 'bold', name: 'Bold Athletic', style: { fontFamily: '"Impact", "Arial Black", sans-serif' }, sample: 'AA BB 123' },
  { id: 'mono', name: 'Cyber Mono', style: { fontFamily: '"Courier New", monospace' }, sample: 'Aa Bb 123' },
  { id: 'gothic', name: 'Vintage Gothic', style: { fontFamily: '"Cinzel", "Times New Roman", serif' }, sample: 'Aa Bb 123' },
  { id: 'casual', name: 'Playful Casual', style: { fontFamily: '"Comic Sans MS", "Caveat", cursive' }, sample: 'Aa Bb 123' },
  { id: 'deco', name: 'Minimal Deco', style: { fontFamily: '"Trebuchet MS", "Century Gothic", sans-serif' }, sample: 'Aa Bb 123' },
  { id: 'roman', name: 'Classic Roman', style: { fontFamily: '"Palatino", "Book Antiqua", serif' }, sample: 'Aa Bb 123' },
  { id: 'display', name: 'Neon Display', style: { fontFamily: '"Copperplate", "Arial", sans-serif' }, sample: 'Aa Bb 123' },
];

const DEFAULT_COLORS = [
  { id: 'black', name: 'Jet Black', hex: '#111827', textColor: '#ffffff' },
  { id: 'white', name: 'Pure White', hex: '#ffffff', textColor: '#0f172a' },
  { id: 'navy', name: 'Navy Blue', hex: '#1e3a8a', textColor: '#ffffff' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626', textColor: '#ffffff' },
  { id: 'olive', name: 'Olive Green', hex: '#3f6212', textColor: '#ffffff' },
];

const FABRIC_MATERIALS = [
  '100% Bio-Wash Combed Cotton',
  'Heavyweight French Terry Fleece',
  'Premium Poly-Cotton Blend (Breathable)',
  'Pure Khadi Handloom Linen',
  'Organic Bamboo Cotton',
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export default function ProductCustomize() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUiStore();

  const initialSizeFromState = location.state?.initialSize || null;
  const initialColorFromState = location.state?.initialColor || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Customizer Form Settings from MongoDB Admin
  const [formConfig, setFormConfig] = useState(() => {
    try {
      const cached = settingsService.getCachedStoreSettings();
      if (cached?.customizerForm && typeof cached.customizerForm === 'object') {
        return cached.customizerForm;
      }
    } catch (_) {}
    return DEFAULT_CUSTOMIZER_FORM_CONFIG;
  });

  // Dynamic inputs state for every section: { [secId]: { text, font, images, material, size, color, frontExampleImage, backExampleImage } }
  const [sectionData, setSectionData] = useState(() => {
    const init = {};
    if (initialSizeFromState) {
      init['general'] = { size: initialSizeFromState };
    }
    if (initialColorFromState) {
      init['general'] = { ...(init['general'] || {}), color: initialColorFromState };
    }
    return init;
  });

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Fullscreen Preview Lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Color picker refs by section ID
  const colorInputRefs = useRef({});

  // Compute all sections from DB
  const sections = useMemo(() => {
    if (Array.isArray(formConfig?.sections) && formConfig.sections.length > 0) {
      return formConfig.sections;
    }
    const secs = [];
    if (formConfig?.front) secs.push({ ...formConfig.front, id: 'front' });
    if (formConfig?.backside) secs.push({ ...formConfig.backside, id: 'backside' });
    if (formConfig?.general) secs.push({ ...formConfig.general, id: 'general' });
    return secs.length > 0 ? secs : DEFAULT_CUSTOMIZER_FORM_CONFIG.sections;
  }, [formConfig]);

  // Product level overrides (if any)
  const productCfg = product?.customizationConfig || {};

  // Enabled sections
  const enabledSections = useMemo(() => {
    return sections.filter((s) => {
      // 1. Check explicit product sectionVisibility map if configured
      if (productCfg.sectionVisibility && productCfg.sectionVisibility[s.id] !== undefined) {
        if (productCfg.sectionVisibility[s.id] === false) return false;
      } else {
        // 2. Backwards compatibility for core 3 sections
        if (s.id === 'front' && productCfg.showFront === false) return false;
        if (s.id === 'backside' && productCfg.showBack === false) return false;
        if (s.id === 'general' && productCfg.showGeneral === false) return false;
      }
      return s.enabled !== false;
    });
  }, [sections, productCfg]);

  const anySectionEnabled = enabledSections.length > 0;

  // Stepper Wizard steps
  const availableSteps = useMemo(() => {
    return enabledSections.map((sec, idx) => ({
      id: sec.id,
      title: sec.title,
      shortTitle: sec.title,
      desc: sec.subtitle,
      stepNumber: idx + 1,
    }));
  }, [enabledSections]);

  const [activeStep, setActiveStep] = useState('front');

  useEffect(() => {
    if (availableSteps.length > 0 && !availableSteps.some((s) => s.id === activeStep)) {
      setActiveStep(availableSteps[0].id);
    }
  }, [availableSteps, activeStep]);

  const currentStepIndex = availableSteps.findIndex((s) => s.id === activeStep);
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex === availableSteps.length - 1;
  const nextStep = !isLastStep ? availableSteps[currentStepIndex + 1] : null;
  const prevStep = !isFirstStep ? availableSteps[currentStepIndex - 1] : null;

  // Load live DB customizer settings
  useEffect(() => {
    let isMounted = true;
    async function fetchCustomizerSettings() {
      try {
        const res = await settingsService.getSettings();
        const data = res?.data || res;
        if (isMounted && data?.customizerForm && typeof data.customizerForm === 'object') {
          setFormConfig(data.customizerForm);
        }
      } catch (err) {
        console.warn('Live customizer settings load notice:', err);
      }
    }
    fetchCustomizerSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Product Details
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await productService.getBySlug(slug);
        const data = res?.data || res;
        if (isMounted) {
          if (!data) {
            setError('Product not found');
          } else {
            setProduct(data);
          }
        }
      } catch (err) {
        if (isMounted) setError('Failed to load product details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Section Data Helpers
  const getSecText = (secId) => sectionData[secId]?.text || '';
  const setSecText = (secId, text) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), text },
    }));
  };

  const getSecDirectFonts = (sec) => {
    const list = sec.fontStyle?.directFonts;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((f) => ({
        id: f.id,
        name: f.name,
        sample: f.sample || 'Aa Bb 123',
        style: f.style || { fontFamily: f.fontFamily || 'inherit' },
      }));
    }
    return DIRECT_FONTS;
  };

  const getSecDropdownFonts = (sec) => {
    const list = sec.fontStyle?.dropdownFonts;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((f) => ({
        id: f.id,
        name: f.name,
        sample: f.sample || 'Aa Bb 123',
        style: f.style || { fontFamily: f.fontFamily || 'inherit' },
      }));
    }
    return DROPDOWN_FONTS;
  };

  const getSecFont = (sec, secId) => {
    const current = sectionData[secId]?.font;
    if (current) return current;
    const directs = getSecDirectFonts(sec);
    return directs[0] || DIRECT_FONTS[0];
  };

  const setSecFont = (secId, font) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), font },
    }));
  };

  const getSecImages = (secId) => sectionData[secId]?.images || [];
  const setSecImages = (secId, updater) => {
    setSectionData((prev) => {
      const current = prev[secId]?.images || [];
      const updated = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        [secId]: { ...(prev[secId] || {}), images: updated },
      };
    });
  };

  const getSecMaterials = (sec) => {
    if (Array.isArray(productCfg.materials) && productCfg.materials.length > 0) {
      return productCfg.materials;
    }
    if (Array.isArray(sec.materials?.options) && sec.materials.options.length > 0) {
      return sec.materials.options;
    }
    return FABRIC_MATERIALS;
  };

  const getSecMaterial = (sec, secId) => {
    const current = sectionData[secId]?.material;
    if (current) return current;
    const opts = getSecMaterials(sec);
    return opts[0] || FABRIC_MATERIALS[0];
  };

  const setSecMaterial = (secId, material) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), material },
    }));
  };

  const getSecSizes = (sec) => {
    if (Array.isArray(product?.variants?.options) && product.variants.options.length > 0) {
      return product.variants.options.map((o) => (typeof o === 'object' && o !== null ? o.label : o));
    }
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      return product.sizes.map((o) => (typeof o === 'object' && o !== null ? o.label : o));
    }
    if (Array.isArray(sec.sizes?.options) && sec.sizes.options.length > 0) {
      return sec.sizes.options;
    }
    return STANDARD_SIZES;
  };

  const getSecSize = (sec, secId) => {
    const current = sectionData[secId]?.size;
    if (current) return current;
    const opts = getSecSizes(sec);
    return opts[0] || 'M';
  };

  const setSecSize = (secId, size) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), size },
    }));
  };

  const getSecColors = (sec) => {
    if (Array.isArray(product?.variants?.colors) && product.variants.colors.length > 0) {
      return product.variants.colors;
    }
    if (Array.isArray(sec.colors?.defaultPalette) && sec.colors.defaultPalette.length > 0) {
      return sec.colors.defaultPalette;
    }
    return DEFAULT_COLORS;
  };

  const getSecColor = (sec, secId) => {
    const current = sectionData[secId]?.color;
    if (current) return current;
    const palette = getSecColors(sec);
    return palette[0] || DEFAULT_COLORS[0];
  };

  const setSecColor = (secId, color) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), color },
    }));
  };

  const getSecMockup = (secId, type) => sectionData[secId]?.[type] || null;
  const setSecMockup = (secId, type, url) => {
    setSectionData((prev) => ({
      ...prev,
      [secId]: { ...(prev[secId] || {}), [type]: url },
    }));
  };

  // Section Image Upload Handlers
  const handleSectionImagesUpload = (secId, maxImages, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const current = getSecImages(secId);
    const remainingSlots = maxImages - current.length;
    if (remainingSlots <= 0) return;
    const toProcess = files.slice(0, remainingSlots);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setSecImages(secId, (prev) => {
          if (prev.length >= maxImages) return prev;
          return [...prev, { id: Date.now() + Math.random(), url: reader.result, name: file.name }];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    showToast(`Added image(s)`, 'success');
  };

  const removeSectionImage = (secId, idx) => {
    setSecImages(secId, (prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSectionMockupUpload = (secId, type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSecMockup(secId, type, reader.result);
      showToast(`Uploaded mockup image`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Look up if a size is selected across sections
  const selectedSize = useMemo(() => {
    if (sectionData['general']?.size) return sectionData['general'].size;
    for (const sec of enabledSections) {
      if (sectionData[sec.id]?.size) return sectionData[sec.id].size;
    }
    const genSec = enabledSections.find((s) => s.id === 'general' || s.sizes?.enabled);
    if (genSec) return getSecSize(genSec, genSec.id);
    return null;
  }, [sectionData, enabledSections]);

  // Look up if the selected size has a variant-specific price from product.variants.options
  const selectedVariantPrice = useMemo(() => {
    if (!selectedSize || !Array.isArray(product?.variants?.options)) return null;
    const matchedOption = product.variants.options.find(
      (opt) => (typeof opt === 'object' && opt !== null ? opt.label : opt) === selectedSize
    );
    if (matchedOption && typeof matchedOption === 'object' && matchedOption.price !== undefined && matchedOption.price !== null && matchedOption.price !== '') {
      const num = Number(matchedOption.price);
      if (!isNaN(num) && num > 0) return num;
    }
    return null;
  }, [selectedSize, product?.variants?.options]);

  // Price calculations: variant-specific price overrides base price if available
  const basePrice = selectedVariantPrice !== null
    ? selectedVariantPrice
    : Number(product?.discountPrice || product?.price || 0);
  const customizationCost = Number(product?.customizationPrice || 0);
  const totalUnitPrice = basePrice + customizationCost;
  const totalOrderPrice = totalUnitPrice * quantity;
  const mainImage = product?.images?.[0] || product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  if (loading) {
    return (
      <PageWrapper>
        <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={40} />
        </div>
      </PageWrapper>
    );
  }

  if (error || !product) {
    return (
      <PageWrapper>
        <div className={styles['page-container']} style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Product Not Found</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>{error || 'Unable to load customization options.'}</p>
          <Link to="/products" className={styles['btn-proceed-order']} style={{ textDecoration: 'none' }}>
            Return to Shop
          </Link>
        </div>
      </PageWrapper>
    );
  }

  // Proceed to Customized Order page
  const handleProceedToCustomizedOrder = (e) => {
    e.preventDefault();

    // Map backwards-compatible front, backside, general:
    const frontSec = enabledSections.find((s) => s.id === 'front');
    const backSec = enabledSections.find((s) => s.id === 'backside');
    const genSec = enabledSections.find((s) => s.id === 'general');

    const frontObj = frontSec ? {
      text: getSecText('front').trim(),
      font: getSecFont(frontSec, 'front')?.name || 'Default',
      fontStyle: getSecFont(frontSec, 'front')?.style || {},
      images: getSecImages('front'),
    } : null;

    const backObj = backSec ? {
      text: getSecText('backside').trim(),
      font: getSecFont(backSec, 'backside')?.name || 'Default',
      fontStyle: getSecFont(backSec, 'backside')?.style || {},
      images: getSecImages('backside'),
    } : null;

    const genObj = genSec ? {
      material: getSecMaterial(genSec, 'general'),
      size: getSecSize(genSec, 'general'),
      color: getSecColor(genSec, 'general'),
      frontExampleImage: getSecMockup('general', 'frontExampleImage'),
      backExampleImage: getSecMockup('general', 'backExampleImage'),
    } : null;

    // All sections data including any custom sections added by the admin:
    const allSectionsData = enabledSections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      subtitle: sec.subtitle,
      text: getSecText(sec.id).trim(),
      font: sec.fontStyle?.enabled !== false ? getSecFont(sec, sec.id)?.name : null,
      fontStyle: sec.fontStyle?.enabled !== false ? getSecFont(sec, sec.id)?.style : null,
      images: sec.images?.enabled !== false ? getSecImages(sec.id) : [],
      material: sec.materials?.enabled ? getSecMaterial(sec, sec.id) : null,
      size: sec.sizes?.enabled ? getSecSize(sec, sec.id) : null,
      color: sec.colors?.enabled ? getSecColor(sec, sec.id) : null,
      frontExampleImage: sec.mockups?.enabled ? getSecMockup(sec.id, 'frontExampleImage') : null,
      backExampleImage: sec.mockups?.enabled ? getSecMockup(sec.id, 'backExampleImage') : null,
    }));

    const customizedOrderData = {
      orderId: `CUST-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      product: {
        _id: product._id || product.id,
        name: product.name,
        slug: product.slug || slug,
        sku: product.sku || 'PRD',
        image: mainImage,
        price: product.price,
        discountPrice: product.discountPrice,
        basePrice,
        customizationPrice: customizationCost,
        category: product.category?.name || 'Catalog',
      },
      front: frontObj,
      backside: backObj,
      general: genObj,
      sections: allSectionsData,
      customSections: allSectionsData.filter((s) => s.id !== 'front' && s.id !== 'backside' && s.id !== 'general'),
      pricing: {
        basePrice,
        customizationCost,
        totalUnitPrice,
        quantity,
        totalOrderPrice,
        selectedSize: selectedSize || null,
        variantPriceOverridden: selectedVariantPrice !== null,
      },
    };

    try {
      sessionStorage.setItem('picky_customized_order', JSON.stringify(customizedOrderData));
    } catch (_) {}

    showToast('Customization saved! Leading to Customized Order page...', 'success');
    navigate('/customized-order', { state: { customizedOrder: customizedOrderData } });
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
          <Link to={`/products/${product.slug || slug}`} className={styles['breadcrumb-link']}>{product.name}</Link>
          <span>/</span>
          <span className={styles['breadcrumb-current']}>Customization</span>
        </nav>

        {/* Product Origin Banner */}
        <div className={styles['page-header']}>
          <div className={styles['origin-product-strip']}>
            <img src={mainImage} alt={product.name} className={styles['origin-img']} />
            <div className={styles['origin-info']}>
              <h1 className={styles['origin-title']}>{product.name}</h1>
              <div className={styles['origin-meta']}>
                <span>SKU: {product.sku || 'PRD'}</span>
                <span>•</span>
                <span>Base Price: <strong>{formatPrice(basePrice)}</strong></span>
                <span>•</span>
                <span className={styles['price-pill']}>Customization Fee: +{formatPrice(customizationCost)}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Total Unit Price</span>
            <strong style={{ fontSize: '1.45rem', color: '#0284c7' }}>{formatPrice(totalUnitPrice)}</strong>
          </div>
        </div>

        {/* ── STEPPER / TABS WIZARD BAR ── */}
        {anySectionEnabled && availableSteps.length > 1 && (
          <div className={styles['stepper-wrapper']}>
            <div className={styles['stepper-nav']}>
              {availableSteps.map((step) => {
                const isCurrent = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={`${styles['stepper-tab']} ${isCurrent ? styles['stepper-tab-active'] : ''}`}
                  >
                    <div className={styles['stepper-badge']}>
                      {step.stepNumber}
                    </div>
                    <div className={styles['stepper-info']}>
                      <span className={styles['stepper-step-label']}>Step {step.stepNumber} of {availableSteps.length}</span>
                      <span className={styles['stepper-step-title']}>{step.shortTitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleProceedToCustomizedOrder} className={styles['sections-flow']}>
          {/* ══════════════════════════════════════════════════
              DYNAMIC SECTIONS RENDERING (Front, Backside, General & Any Custom Section)
              ══════════════════════════════════════════════════ */}
          {enabledSections.map((sec, idx) => {
            const isVisible = availableSteps.length <= 1 || activeStep === sec.id;
            if (!isVisible) return null;

            const secDirectFonts = getSecDirectFonts(sec);
            const secDropdownFonts = getSecDropdownFonts(sec);
            const currentFont = getSecFont(sec, sec.id);
            const currentText = getSecText(sec.id);
            const currentImages = getSecImages(sec.id);
            const maxImages = Number(sec.images?.maxImages) || 4;

            const secMaterials = getSecMaterials(sec);
            const currentMaterial = getSecMaterial(sec, sec.id);

            const secSizes = getSecSizes(sec);
            const currentSize = getSecSize(sec, sec.id);

            const secColors = getSecColors(sec);
            const currentColor = getSecColor(sec, sec.id);

            const frontMockup = getSecMockup(sec.id, 'frontExampleImage');
            const backMockup = getSecMockup(sec.id, 'backExampleImage');

            const isDropdownActive = secDropdownFonts.some((df) => df.id === currentFont?.id);
            const hasFieldsBelowImages = Boolean(
              (sec.materials?.enabled && secMaterials.length > 0) ||
              (sec.sizes?.enabled && secSizes.length > 0) ||
              (sec.colors?.enabled && secColors.length > 0) ||
              sec.mockups?.enabled
            );
            const showButtonsInImageRow = sec.images?.enabled !== false && !hasFieldsBelowImages;

            return (
              <div key={sec.id} className={styles['section-card']}>
                <div className={styles['section-header']}>
                  <div className={styles['section-title-wrap']}>
                    <div className={styles['section-number-badge']}>{idx + 1}</div>
                    <div>
                      <h2 className={styles['section-title']}>{sec.title}</h2>
                      <p className={styles['section-desc']}>{sec.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* 1. Custom Text Input */}
                {sec.textField?.enabled !== false && (
                  <div className={styles['field-group']}>
                    <label className={styles['field-label']}>
                      <span>{sec.textField?.label || 'Custom Text'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {currentText.length}/{sec.textField?.maxChars || 40} Characters
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={sec.textField?.placeholder || 'Enter custom text...'}
                      value={currentText}
                      maxLength={sec.textField?.maxChars || 40}
                      onChange={(e) => setSecText(sec.id, e.target.value)}
                      className={styles['text-input']}
                    />
                  </div>
                )}

                {/* 2. Typography Font Style */}
                {sec.fontStyle?.enabled !== false && (
                  <div className={styles['field-group']}>
                    <div className={styles['field-label']}>
                      <span>{sec.fontStyle?.label || 'Font Style'}</span>
                      <span className={styles['selected-font-pill']}>
                        <Sparkles size={12} /> Style: {currentFont?.name || 'Default'}
                      </span>
                    </div>

                    <div className={styles['font-selection-wrap']}>
                      <div className={styles['direct-fonts-grid']}>
                        {secDirectFonts.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSecFont(sec.id, f)}
                            className={`${styles['font-card']} ${currentFont?.id === f.id ? styles['active'] : ''}`}
                          >
                            <span className={styles['font-sample']} style={f.style}>{f.sample}</span>
                            <span className={styles['font-name']}>{f.name}</span>
                          </button>
                        ))}

                        {/* Dropdown in the same row */}
                        {secDropdownFonts.length > 0 && (
                          <div className={`${styles['font-dropdown-card']} ${isDropdownActive ? styles['active'] : ''}`}>
                            <span
                              className={styles['font-sample']}
                              style={isDropdownActive ? currentFont?.style : { fontSize: '0.92rem' }}
                            >
                              {isDropdownActive ? currentFont?.sample : 'More Fonts ▾'}
                            </span>
                            <span className={styles['font-name']}>
                              {isDropdownActive ? currentFont?.name : 'Select Style'}
                            </span>
                            <select
                              className={styles['font-dropdown-select-overlay']}
                              value={isDropdownActive ? currentFont?.id : ''}
                              onChange={(e) => {
                                const matched = secDropdownFonts.find((df) => df.id === e.target.value);
                                if (matched) {
                                  setSecFont(sec.id, matched);
                                  showToast(`Selected font: ${matched.name}`, 'info');
                                }
                              }}
                              title="Select more font styles"
                            >
                              <option value="" disabled>-- Select Additional Font Style --</option>
                              {secDropdownFonts.map((df) => (
                                <option key={df.id} value={df.id}>
                                  {df.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Image / Artwork Uploads */}
                {sec.images?.enabled !== false && (
                  <div className={`${styles['field-group']} ${showButtonsInImageRow ? styles['field-group-last'] : ''}`}>
                    <label className={styles['field-label']}>
                      <span>{sec.images?.label || `Images / Artworks (Upload up to ${maxImages})`}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {currentImages.length}/{maxImages} Uploaded
                      </span>
                    </label>

                    <div className={styles['upload-and-actions-row']}>
                      <div className={styles['images-upload-grid']}>
                        {currentImages.map((img, i) => (
                          <div key={img.id || i} className={styles['image-thumb-card']}>
                            <img src={img.url} alt={`Upload ${i + 1}`} className={styles['image-thumb']} />
                            <div className={styles['image-hover-overlay']}>
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(img.url)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                                title="Preview Full Image"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSectionImage(sec.id, i)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                                title="Remove Image"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {currentImages.length < maxImages && (
                          <label className={styles['image-upload-slot']}>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleSectionImagesUpload(sec.id, maxImages, e)}
                              style={{ display: 'none' }}
                            />
                            <Upload size={20} color="#0284c7" />
                            <span className={styles['upload-slot-text']}>Upload Image</span>
                            <span className={styles['upload-slot-sub']}>Slot {currentImages.length + 1} of {maxImages}</span>
                          </label>
                        )}
                      </div>

                      {/* Wizard Navigation Buttons aligned in same row as images */}
                      {showButtonsInImageRow && availableSteps.length > 1 && (
                        <div className={styles['inline-step-actions']}>
                          {prevStep && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStep(prevStep.id);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                              className={styles['btn-step-prev']}
                            >
                              <ArrowLeft size={16} />
                              <span>Back to {prevStep.shortTitle}</span>
                            </button>
                          )}
                          {nextStep && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStep(nextStep.id);
                                window.scrollTo({ top: 120, behavior: 'smooth' });
                              }}
                              className={styles['btn-step-next']}
                            >
                              <span>Next: {nextStep.shortTitle}</span>
                              <ArrowRight size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Materials / Fabric Options */}
                {sec.materials?.enabled && (
                  <div className={styles['field-group']}>
                    <label className={styles['field-label']}>
                      <span>{sec.materials?.label || 'Material (Type of Fabric)'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>{currentMaterial}</span>
                    </label>
                    <div className={styles['material-grid']}>
                      {secMaterials.map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setSecMaterial(sec.id, mat)}
                          className={`${styles['material-chip']} ${currentMaterial === mat ? styles['active'] : ''}`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Sizes */}
                {sec.sizes?.enabled && (
                  <div className={styles['field-group']}>
                    <label className={styles['field-label']}>
                      <span>{sec.sizes?.label || 'Size'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Selected: {currentSize}</span>
                    </label>
                    <div className={styles['size-chips']}>
                      {secSizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSecSize(sec.id, sz)}
                          className={`${styles['size-chip']} ${currentSize === sz ? styles['active'] : ''}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Color Palette & Picker */}
                {sec.colors?.enabled && (
                  <div className={styles['field-group']}>
                    <div className={styles['field-label']}>
                      <span>{sec.colors?.label || 'Custom Color'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                        Selected: {currentColor?.name || 'Color'}
                      </span>
                    </div>

                    <div className={styles['colors-row']}>
                      {secColors.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSecColor(sec.id, c)}
                          title={c.name}
                          style={{ background: c.hex }}
                          className={`${styles['color-swatch']} ${currentColor?.id === c.id ? styles['active'] : ''}`}
                        >
                          {currentColor?.id === c.id && (
                            <Check size={18} color={c.textColor || '#ffffff'} strokeWidth={3} />
                          )}
                        </button>
                      ))}

                      {sec.colors?.allowCustomColorPicker !== false && (
                        <div
                          className={`${styles['custom-color-picker-box']} ${currentColor?.isCustom ? styles['active-custom-color'] : ''}`}
                          onClick={() => {
                            colorInputRefs.current[sec.id]?.click();
                          }}
                          title="Click to choose custom color"
                        >
                          <span
                            className={styles['color-swatch']}
                            style={{
                              background: currentColor?.hex || '#8b5cf6',
                              width: '38px',
                              height: '38px',
                              marginRight: '0.45rem',
                              cursor: 'pointer',
                            }}
                          >
                            {currentColor?.isCustom && <Check size={16} color="#ffffff" strokeWidth={3} />}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: currentColor?.isCustom ? '#0284c7' : '#334155' }}>
                              Custom Color
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              {(currentColor?.hex || '#8B5CF6').toUpperCase()}
                            </span>
                          </div>
                          <Palette size={16} color="#0284c7" style={{ marginLeft: '0.5rem' }} />
                          <input
                            type="color"
                            ref={(el) => (colorInputRefs.current[sec.id] = el)}
                            value={currentColor?.hex || '#8b5cf6'}
                            onChange={(e) => {
                              const hex = e.target.value;
                              setSecColor(sec.id, {
                                id: 'custom-color',
                                name: `Custom Color (${hex.toUpperCase()})`,
                                hex,
                                textColor: '#ffffff',
                                isCustom: true,
                              });
                            }}
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. Example Mockup Uploads */}
                {sec.mockups?.enabled && (
                  <div className={styles['field-group']}>
                    <label className={styles['field-label']}>
                      <span>Example Mockup Images</span>
                    </label>

                    <div className={styles['example-images-grid']}>
                      {/* Primary Mockup */}
                      <div className={styles['example-box']}>
                        <div className={styles['example-label']}>
                          <span>{sec.mockups?.frontMockupLabel || 'Front Mockup (Example)'}</span>
                          {frontMockup && <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>✓ Uploaded</span>}
                        </div>
                        {frontMockup ? (
                          <div className={styles['image-thumb-card']} style={{ height: '140px' }}>
                            <img src={frontMockup} alt="Mockup 1" className={styles['image-thumb']} />
                            <div className={styles['image-hover-overlay']}>
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(frontMockup)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSecMockup(sec.id, 'frontExampleImage', null)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className={styles['image-upload-slot']} style={{ height: '140px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionMockupUpload(sec.id, 'frontExampleImage', e)}
                              style={{ display: 'none' }}
                            />
                            <ImageIcon size={24} color="#0284c7" />
                            <span className={styles['upload-slot-text']}>Upload Mockup</span>
                            <span className={styles['upload-slot-sub']}>PNG, JPG or WEBP</span>
                          </label>
                        )}
                      </div>

                      {/* Secondary Mockup */}
                      <div className={styles['example-box']}>
                        <div className={styles['example-label']}>
                          <span>{sec.mockups?.backMockupLabel || 'Back Mockup (Example)'}</span>
                          {backMockup && <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>✓ Uploaded</span>}
                        </div>
                        {backMockup ? (
                          <div className={styles['image-thumb-card']} style={{ height: '140px' }}>
                            <img src={backMockup} alt="Mockup 2" className={styles['image-thumb']} />
                            <div className={styles['image-hover-overlay']}>
                              <button
                                type="button"
                                onClick={() => setLightboxUrl(backMockup)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSecMockup(sec.id, 'backExampleImage', null)}
                                className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className={styles['image-upload-slot']} style={{ height: '140px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionMockupUpload(sec.id, 'backExampleImage', e)}
                              style={{ display: 'none' }}
                            />
                            <ImageIcon size={24} color="#0284c7" />
                            <span className={styles['upload-slot-text']}>Upload Mockup</span>
                            <span className={styles['upload-slot-sub']}>PNG, JPG or WEBP</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback Wizard Navigation Buttons when section does not place buttons in image row */}
                {!showButtonsInImageRow && availableSteps.length > 1 && (
                  <div className={styles['inline-step-actions']} style={{ marginTop: '1.25rem' }}>
                    {prevStep && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(prevStep.id);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className={styles['btn-step-prev']}
                      >
                        <ArrowLeft size={16} />
                        <span>Back to {prevStep.shortTitle}</span>
                      </button>
                    )}
                    {nextStep && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(nextStep.id);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className={styles['btn-step-next']}
                      >
                        <span>Next: {nextStep.shortTitle}</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Alert if no sections are enabled */}
          {!anySectionEnabled && (
            <div className={styles['section-card']} style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <AlertCircle size={40} color="#0284c7" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                No Customization Sections Enabled
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                All customization sections have been turned off in the Admin panel.
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SUBMIT & PROCEED BAR -> LEADS TO 'CUSTOMIZED ORDER' PAGE
              ══════════════════════════════════════════════════ */}
          <div className={styles['submit-card']}>
            <div className={styles['submit-pricing-col']}>
              <span className={styles['pricing-title']}>Customized Total Calculation</span>
              <div className={styles['pricing-total']}>{formatPrice(totalOrderPrice)}</div>
              <span className={styles['pricing-breakdown-sub']}>
                Base: {formatPrice(basePrice)}{selectedSize ? ` (${selectedSize})` : ''} + Customization: {formatPrice(customizationCost)} × {quantity} Item(s)
              </span>
            </div>

            <div className={styles['submit-actions-group']}>
              {/* Order Quantity Stepper */}
              <div className={styles['quantity-stepper']}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={styles['stepper-btn']}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className={styles['stepper-val']}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className={styles['stepper-btn']}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button type="submit" className={styles['btn-proceed-order']}>
                <span>Proceed to Customized Order</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* Fullscreen Lightbox Modal for Image Previews */}
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

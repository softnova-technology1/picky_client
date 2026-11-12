import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import { productService } from '../../services/product.service';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import {
  Sparkles,
  ArrowRight,
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

// 4 Direct Font Options
const DIRECT_FONTS = [
  { id: 'sans', name: 'Modern Sans', style: { fontFamily: 'system-ui, -apple-system, sans-serif' }, sample: 'Aa Bb 123' },
  { id: 'serif', name: 'Elegant Serif', style: { fontFamily: 'Georgia, serif' }, sample: 'Aa Bb 123' },
  { id: 'script', name: 'Script Style', style: { fontFamily: '"Brush Script MT", cursive, sans-serif' }, sample: 'Aa Bb 123' },
  { id: 'bold', name: 'Bold Athletic', style: { fontFamily: '"Impact", "Arial Black", sans-serif' }, sample: 'AA BB 123' },
];

// Dropdown Fonts for the rest
const DROPDOWN_FONTS = [
  { id: 'mono', name: 'Cyber Mono', style: { fontFamily: '"Courier New", monospace' }, sample: 'Aa Bb 123' },
  { id: 'gothic', name: 'Vintage Gothic', style: { fontFamily: '"Cinzel", "Times New Roman", serif' }, sample: 'Aa Bb 123' },
  { id: 'casual', name: 'Playful Casual', style: { fontFamily: '"Comic Sans MS", "Caveat", cursive' }, sample: 'Aa Bb 123' },
  { id: 'deco', name: 'Minimal Deco', style: { fontFamily: '"Trebuchet MS", "Century Gothic", sans-serif' }, sample: 'Aa Bb 123' },
  { id: 'roman', name: 'Classic Roman', style: { fontFamily: '"Palatino", "Book Antiqua", serif' }, sample: 'Aa Bb 123' },
  { id: 'display', name: 'Neon Display', style: { fontFamily: '"Copperplate", "Arial", sans-serif' }, sample: 'Aa Bb 123' },
];

// 5 Default Colors
const DEFAULT_COLORS = [
  { id: 'black', name: 'Jet Black', hex: '#111827', textColor: '#ffffff' },
  { id: 'white', name: 'Pure White', hex: '#ffffff', textColor: '#0f172a' },
  { id: 'navy', name: 'Navy Blue', hex: '#1e3a8a', textColor: '#ffffff' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626', textColor: '#ffffff' },
  { id: 'olive', name: 'Olive Green', hex: '#3f6212', textColor: '#ffffff' },
];

// Default Fabric Materials
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
  const { showToast } = useUiStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── 1. Front Section State ──
  const [frontText, setFrontText] = useState('');
  const [frontFont, setFrontFont] = useState(DIRECT_FONTS[0]);
  const [frontImages, setFrontImages] = useState([]); // up to 4 images: [{ id, url, name }]

  // ── 2. Backside Section State ──
  const [backText, setBackText] = useState('');
  const [backFont, setBackFont] = useState(DIRECT_FONTS[0]);
  const [backImages, setBackImages] = useState([]); // up to 4 images: [{ id, url, name }]

  // ── 3. General Section State ──
  const [material, setMaterial] = useState(FABRIC_MATERIALS[0]);
  const [size, setSize] = useState('M');
  const [customColorHex, setCustomColorHex] = useState('#8b5cf6');
  const [selectedColor, setSelectedColor] = useState({
    id: 'custom-color',
    name: 'Custom Color (#8B5CF6)',
    hex: '#8b5cf6',
    textColor: '#ffffff',
    isCustom: true,
  });
  const [frontExampleImage, setFrontExampleImage] = useState(null);
  const [backExampleImage, setBackExampleImage] = useState(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingExample, setUploadingExample] = useState({ front: false, back: false });

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Fullscreen Preview Lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const colorInputRef = useRef(null);

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
            const sizes = Array.isArray(data.variants?.options) && data.variants.options.length > 0
              ? data.variants.options
              : Array.isArray(data.sizes) && data.sizes.length > 0
              ? data.sizes
              : [];
            if (sizes.length > 0) {
              setSize(sizes[0]);
            }
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

  const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB Limit

  // Image Upload Handlers (Front & Backside, max 4 each) - Direct S3 upload with 10MB limit
  const handleFrontImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainingSlots = 4 - frontImages.length;
    const toProcess = files.slice(0, remainingSlots);

    // Validate 10MB limit
    const oversized = toProcess.find((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      showToast(`File "${oversized.name}" exceeds 10MB limit (${(oversized.size / (1024 * 1024)).toFixed(1)}MB). Please upload under 10MB.`, 'error');
      e.target.value = '';
      return;
    }

    try {
      setUploadingFront(true);
      showToast('Uploading image(s) directly to S3...', 'info');

      for (const file of toProcess) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await productService.uploadCustomizationImage(formData);
        const s3Url = res?.data?.data?.url || res?.data?.url;
        if (s3Url) {
          setFrontImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, { id: Date.now() + Math.random(), url: s3Url, name: file.name }];
          });
        }
      }
      showToast('Front image(s) uploaded to S3 successfully!', 'success');
    } catch (err) {
      console.error('Failed to upload image to S3:', err);
      showToast(err?.response?.data?.message || 'Failed to upload image to S3. Please try again.', 'error');
    } finally {
      setUploadingFront(false);
      e.target.value = '';
    }
  };

  const removeFrontImage = (idx) => {
    setFrontImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBackImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainingSlots = 4 - backImages.length;
    const toProcess = files.slice(0, remainingSlots);

    // Validate 10MB limit
    const oversized = toProcess.find((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      showToast(`File "${oversized.name}" exceeds 10MB limit (${(oversized.size / (1024 * 1024)).toFixed(1)}MB). Please upload under 10MB.`, 'error');
      e.target.value = '';
      return;
    }

    try {
      setUploadingBack(true);
      showToast('Uploading image(s) directly to S3...', 'info');

      for (const file of toProcess) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await productService.uploadCustomizationImage(formData);
        const s3Url = res?.data?.data?.url || res?.data?.url;
        if (s3Url) {
          setBackImages((prev) => {
            if (prev.length >= 4) return prev;
            return [...prev, { id: Date.now() + Math.random(), url: s3Url, name: file.name }];
          });
        }
      }
      showToast('Backside image(s) uploaded to S3 successfully!', 'success');
    } catch (err) {
      console.error('Failed to upload image to S3:', err);
      showToast(err?.response?.data?.message || 'Failed to upload image to S3. Please try again.', 'error');
    } finally {
      setUploadingBack(false);
      e.target.value = '';
    }
  };

  const removeBackImage = (idx) => {
    setBackImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // General Example Images - Direct S3 upload with 10MB limit
  const handleExampleUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(`File "${file.name}" exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload under 10MB.`, 'error');
      e.target.value = '';
      return;
    }

    try {
      setUploadingExample((prev) => ({ ...prev, [type]: true }));
      showToast(`Uploading ${type === 'front' ? 'Front' : 'Back'} Example to S3...`, 'info');

      const formData = new FormData();
      formData.append('image', file);
      const res = await productService.uploadCustomizationImage(formData);
      const s3Url = res?.data?.data?.url || res?.data?.url;

      if (s3Url) {
        if (type === 'front') setFrontExampleImage(s3Url);
        else setBackExampleImage(s3Url);
        showToast(`${type === 'front' ? 'Front' : 'Back'} Example uploaded to S3 successfully!`, 'success');
      }
    } catch (err) {
      console.error('Failed to upload example image to S3:', err);
      showToast(err?.response?.data?.message || 'Failed to upload example image to S3', 'error');
    } finally {
      setUploadingExample((prev) => ({ ...prev, [type]: false }));
      e.target.value = '';
    }
  };

  // Custom Color Change handler
  const handleCustomColorChange = (e) => {
    const hex = e.target.value;
    setCustomColorHex(hex);
    setSelectedColor({
      id: 'custom-color',
      name: `Custom Color (${hex.toUpperCase()})`,
      hex: hex,
      textColor: '#ffffff',
      isCustom: true,
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className={styles['page-container']} style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <Sparkles size={36} color="#0284c7" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Loading Customizer...</h2>
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

  // Price calculations
  const basePrice = Number(product.discountPrice || product.price || 0);
  const customizationCost = Number(product.customizationPrice || 0);
  const totalUnitPrice = basePrice + customizationCost;
  const totalOrderPrice = totalUnitPrice * quantity;
  const mainImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  // Proceed to Customized Order page
  const handleProceedToCustomizedOrder = (e) => {
    e.preventDefault();

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
      front: {
        text: frontText.trim(),
        font: frontFont.name,
        fontStyle: frontFont.style,
        images: frontImages,
      },
      backside: {
        text: backText.trim(),
        font: backFont.name,
        fontStyle: backFont.style,
        images: backImages,
      },
      general: {
        material,
        size,
        color: selectedColor,
        frontExampleImage,
        backExampleImage,
      },
      pricing: {
        basePrice,
        customizationCost,
        totalUnitPrice,
        quantity,
        totalOrderPrice,
      },
    };

    // Save to sessionStorage for persistence across pages
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

        <form onSubmit={handleProceedToCustomizedOrder} className={styles['sections-flow']}>
          {/* ══════════════════════════════════════════════════
              SECTION 1: 'FRONT'
              ══════════════════════════════════════════════════ */}
          <div className={styles['section-card']}>
            <div className={styles['section-header']}>
              <div className={styles['section-title-wrap']}>
                <div className={styles['section-number-badge']}>1</div>
                <div>
                  <h2 className={styles['section-title']}>Front</h2>
                  <p className={styles['section-desc']}>Customize text, typography style, and upload front graphics/artwork.</p>
                </div>
              </div>
            </div>

            {/* Element 1: Text Field */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Front Custom Text</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{frontText.length} Characters</span>
              </label>
              <input
                type="text"
                placeholder="Enter custom text for front side (e.g. Brand Name, Quote, Monogram)..."
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                className={styles['text-input']}
              />
            </div>

            {/* Element 2: Font Style (4 Direct Options + Dropdown for the Rest) */}
            <div className={styles['field-group']}>
              <div className={styles['field-label']}>
                <span>Font Style</span>
                <span className={styles['selected-font-pill']}>
                  <Sparkles size={12} /> Style: {frontFont.name}
                </span>
              </div>

              <div className={styles['font-selection-wrap']}>
                {/* 4 Direct Options */}
                <div className={styles['direct-fonts-grid']}>
                  {DIRECT_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrontFont(f)}
                      className={`${styles['font-card']} ${frontFont.id === f.id ? styles['active'] : ''}`}
                    >
                      <span className={styles['font-sample']} style={f.style}>{f.sample}</span>
                      <span className={styles['font-name']}>{f.name}</span>
                    </button>
                  ))}
                </div>

                {/* Dropdown Menu for the Rest */}
                <div className={styles['font-dropdown-row']}>
                  <span className={styles['font-dropdown-label']}>Or choose from more font styles:</span>
                  <select
                    className={styles['font-select']}
                    value={DROPDOWN_FONTS.some((df) => df.id === frontFont.id) ? frontFont.id : ''}
                    onChange={(e) => {
                      const matched = DROPDOWN_FONTS.find((df) => df.id === e.target.value);
                      if (matched) {
                        setFrontFont(matched);
                        showToast(`Selected font: ${matched.name}`, 'info');
                      }
                    }}
                  >
                    <option value="" disabled>-- Select Additional Font Style --</option>
                    {DROPDOWN_FONTS.map((df) => (
                      <option key={df.id} value={df.id}>
                        {df.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Element 3: Upload 4 Images (with preview and remove on hover) */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Front Images / Artworks (Upload up to 4 • Max 10MB each)</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{frontImages.length}/4 Uploaded</span>
              </label>

              <div className={styles['images-upload-grid']}>
                {frontImages.map((img, idx) => (
                  <div key={img.id || idx} className={styles['image-thumb-card']}>
                    <img src={img.url} alt={`Front upload ${idx + 1}`} className={styles['image-thumb']} />
                    {/* Hover Overlay with Preview & Remove */}
                    <div className={styles['image-hover-overlay']}>
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(img.url)}
                        className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                        title="Preview Full Image"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFrontImage(idx)}
                        className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                        title="Remove Image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button if less than 4 */}
                {frontImages.length < 4 && (
                  <label
                    className={styles['image-upload-slot']}
                    style={{
                      opacity: uploadingFront ? 0.7 : 1,
                      pointerEvents: uploadingFront ? 'none' : 'auto',
                      cursor: uploadingFront ? 'wait' : 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingFront}
                      onChange={handleFrontImagesUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={22} color="#0284c7" />
                    <span className={styles['upload-slot-text']}>
                      {uploadingFront ? 'Uploading to S3...' : 'Upload Image'}
                    </span>
                    <span className={styles['upload-slot-sub']}>Slot {frontImages.length + 1} of 4 • Max 10MB</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 2: 'BACKSIDE'
              ══════════════════════════════════════════════════ */}
          <div className={styles['section-card']}>
            <div className={styles['section-header']}>
              <div className={styles['section-title-wrap']}>
                <div className={styles['section-number-badge']}>2</div>
                <div>
                  <h2 className={styles['section-title']}>Backside</h2>
                  <p className={styles['section-desc']}>Customize back text, typography style, and upload backside graphics/artwork.</p>
                </div>
              </div>
            </div>

            {/* Element 1: Text Field */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Backside Custom Text</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{backText.length} Characters</span>
              </label>
              <input
                type="text"
                placeholder="Enter custom text for back side (e.g. Player Name & Number, Big Slogan)..."
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                className={styles['text-input']}
              />
            </div>

            {/* Element 2: Font Style (4 Direct Options + Dropdown for the Rest) */}
            <div className={styles['field-group']}>
              <div className={styles['field-label']}>
                <span>Font Style</span>
                <span className={styles['selected-font-pill']}>
                  <Sparkles size={12} /> Style: {backFont.name}
                </span>
              </div>

              <div className={styles['font-selection-wrap']}>
                {/* 4 Direct Options */}
                <div className={styles['direct-fonts-grid']}>
                  {DIRECT_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setBackFont(f)}
                      className={`${styles['font-card']} ${backFont.id === f.id ? styles['active'] : ''}`}
                    >
                      <span className={styles['font-sample']} style={f.style}>{f.sample}</span>
                      <span className={styles['font-name']}>{f.name}</span>
                    </button>
                  ))}
                </div>

                {/* Dropdown Menu for the Rest */}
                <div className={styles['font-dropdown-row']}>
                  <span className={styles['font-dropdown-label']}>Or choose from more font styles:</span>
                  <select
                    className={styles['font-select']}
                    value={DROPDOWN_FONTS.some((df) => df.id === backFont.id) ? backFont.id : ''}
                    onChange={(e) => {
                      const matched = DROPDOWN_FONTS.find((df) => df.id === e.target.value);
                      if (matched) {
                        setBackFont(matched);
                        showToast(`Selected backside font: ${matched.name}`, 'info');
                      }
                    }}
                  >
                    <option value="" disabled>-- Select Additional Font Style --</option>
                    {DROPDOWN_FONTS.map((df) => (
                      <option key={df.id} value={df.id}>
                        {df.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Element 3: Upload 4 Images (with preview and remove on hover) */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Backside Images / Artworks (Upload up to 4 • Max 10MB each)</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{backImages.length}/4 Uploaded</span>
              </label>

              <div className={styles['images-upload-grid']}>
                {backImages.map((img, idx) => (
                  <div key={img.id || idx} className={styles['image-thumb-card']}>
                    <img src={img.url} alt={`Back upload ${idx + 1}`} className={styles['image-thumb']} />
                    {/* Hover Overlay with Preview & Remove */}
                    <div className={styles['image-hover-overlay']}>
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(img.url)}
                        className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                        title="Preview Full Image"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBackImage(idx)}
                        className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                        title="Remove Image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button if less than 4 */}
                {backImages.length < 4 && (
                  <label
                    className={styles['image-upload-slot']}
                    style={{
                      opacity: uploadingBack ? 0.7 : 1,
                      pointerEvents: uploadingBack ? 'none' : 'auto',
                      cursor: uploadingBack ? 'wait' : 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingBack}
                      onChange={handleBackImagesUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={22} color="#0284c7" />
                    <span className={styles['upload-slot-text']}>
                      {uploadingBack ? 'Uploading to S3...' : 'Upload Image'}
                    </span>
                    <span className={styles['upload-slot-sub']}>Slot {backImages.length + 1} of 4 • Max 10MB</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION 3: 'GENERAL'
              ══════════════════════════════════════════════════ */}
          <div className={styles['section-card']}>
            <div className={styles['section-header']}>
              <div className={styles['section-title-wrap']}>
                <div className={styles['section-number-badge']}>3</div>
                <div>
                  <h2 className={styles['section-title']}>General</h2>
                  <p className={styles['section-desc']}>Specify fabric material, sizing, colors, and upload example mockups.</p>
                </div>
              </div>
            </div>

            {/* 1. Material (type of fabric) */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Material (Type of Fabric)</span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>{material}</span>
              </label>
              <div className={styles['material-grid']}>
                {FABRIC_MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setMaterial(mat)}
                    className={`${styles['material-chip']} ${material === mat ? styles['active'] : ''}`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Size */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Size</span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Selected: {size}</span>
              </label>
              <div className={styles['size-chips']}>
                {STANDARD_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`${styles['size-chip']} ${size === sz ? styles['active'] : ''}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Custom Color Setting (5 default color presets + 'Custom Color' option selected) */}
            <div className={styles['field-group']}>
              <div className={styles['field-label']}>
                <span>Custom Color</span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                  Selected: {selectedColor.name}
                </span>
              </div>

              <div className={styles['colors-row']}>
                {/* 5 Default Color Presets */}
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    title={c.name}
                    style={{ background: c.hex }}
                    className={`${styles['color-swatch']} ${selectedColor.id === c.id ? styles['active'] : ''}`}
                  >
                    {selectedColor.id === c.id && (
                      <Check size={18} color={c.textColor} strokeWidth={3} />
                    )}
                  </button>
                ))}

                {/* Dedicated 'Custom Color' Option (Selected) */}
                <div
                  className={`${styles['custom-color-picker-box']} ${selectedColor.isCustom ? styles['active-custom-color'] : ''}`}
                  onClick={() => {
                    setSelectedColor({
                      id: 'custom-color',
                      name: `Custom Color (${customColorHex.toUpperCase()})`,
                      hex: customColorHex,
                      textColor: '#ffffff',
                      isCustom: true,
                    });
                    colorInputRef.current?.click();
                  }}
                  title="Click to choose custom color"
                >
                  <span
                    className={styles['color-swatch']}
                    style={{
                      background: customColorHex,
                      width: '38px',
                      height: '38px',
                      marginRight: '0.45rem',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedColor.isCustom && (
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    )}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: selectedColor.isCustom ? '#0284c7' : '#334155' }}>
                      Custom Color
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {customColorHex.toUpperCase()}
                    </span>
                  </div>
                  <Palette size={16} color="#0284c7" style={{ marginLeft: '0.5rem' }} />
                  <input
                    type="color"
                    ref={colorInputRef}
                    value={customColorHex}
                    onChange={handleCustomColorChange}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Fields for 'Front Image' and 'Back Image' where users can upload example images */}
            <div className={styles['field-group']}>
              <label className={styles['field-label']}>
                <span>Example Mockup Images (Front &amp; Back • Max 10MB each)</span>
              </label>

              <div className={styles['example-images-grid']}>
                {/* Front Image Example */}
                <div className={styles['example-box']}>
                  <div className={styles['example-label']}>
                    <span>Front Image (Example)</span>
                    {frontExampleImage && <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>✓ Uploaded</span>}
                  </div>
                  {frontExampleImage ? (
                    <div className={styles['image-thumb-card']} style={{ height: '140px' }}>
                      <img src={frontExampleImage} alt="Front example" className={styles['image-thumb']} />
                      <div className={styles['image-hover-overlay']}>
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(frontExampleImage)}
                          className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFrontExampleImage(null)}
                          className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={styles['image-upload-slot']}
                      style={{
                        height: '140px',
                        opacity: uploadingExample.front ? 0.7 : 1,
                        pointerEvents: uploadingExample.front ? 'none' : 'auto',
                        cursor: uploadingExample.front ? 'wait' : 'pointer',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingExample.front}
                        onChange={(e) => handleExampleUpload('front', e)}
                        style={{ display: 'none' }}
                      />
                      <ImageIcon size={24} color="#0284c7" />
                      <span className={styles['upload-slot-text']}>
                        {uploadingExample.front ? 'Uploading to S3...' : 'Upload Front Example'}
                      </span>
                      <span className={styles['upload-slot-sub']}>PNG, JPG or WEBP • Max 10MB</span>
                    </label>
                  )}
                </div>

                {/* Back Image Example */}
                <div className={styles['example-box']}>
                  <div className={styles['example-label']}>
                    <span>Back Image (Example)</span>
                    {backExampleImage && <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>✓ Uploaded</span>}
                  </div>
                  {backExampleImage ? (
                    <div className={styles['image-thumb-card']} style={{ height: '140px' }}>
                      <img src={backExampleImage} alt="Back example" className={styles['image-thumb']} />
                      <div className={styles['image-hover-overlay']}>
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(backExampleImage)}
                          className={`${styles['hover-btn']} ${styles['hover-btn-view']}`}
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBackExampleImage(null)}
                          className={`${styles['hover-btn']} ${styles['hover-btn-del']}`}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={styles['image-upload-slot']}
                      style={{
                        height: '140px',
                        opacity: uploadingExample.back ? 0.7 : 1,
                        pointerEvents: uploadingExample.back ? 'none' : 'auto',
                        cursor: uploadingExample.back ? 'wait' : 'pointer',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingExample.back}
                        onChange={(e) => handleExampleUpload('back', e)}
                        style={{ display: 'none' }}
                      />
                      <ImageIcon size={24} color="#0284c7" />
                      <span className={styles['upload-slot-text']}>
                        {uploadingExample.back ? 'Uploading to S3...' : 'Upload Back Example'}
                      </span>
                      <span className={styles['upload-slot-sub']}>PNG, JPG or WEBP • Max 10MB</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className={styles['field-group']} style={{ marginBottom: 0 }}>
              <label className={styles['field-label']}>
                <span>Order Quantity</span>
              </label>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ padding: '0.65rem 1rem', border: 'none', background: '#f8fafc', cursor: 'pointer', color: '#334155' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '0.65rem 1.4rem', fontWeight: 700, fontSize: '1rem', minWidth: '30px', textAlign: 'center', background: '#ffffff' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ padding: '0.65rem 1rem', border: 'none', background: '#f8fafc', cursor: 'pointer', color: '#334155' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SUBMIT & PROCEED BAR -> LEADS TO 'CUSTOMIZED ORDER' PAGE
              ══════════════════════════════════════════════════ */}
          <div className={styles['submit-card']}>
            <div className={styles['submit-pricing-col']}>
              <span className={styles['pricing-title']}>Customized Total Calculation</span>
              <div className={styles['pricing-total']}>{formatPrice(totalOrderPrice)}</div>
              <span className={styles['pricing-breakdown-sub']}>
                Base: {formatPrice(basePrice)} + Customization: {formatPrice(customizationCost)} × {quantity} Item(s)
              </span>
            </div>

            <button type="submit" className={styles['btn-proceed-order']}>
              <span>Proceed to Customized Order</span>
              <ArrowRight size={18} />
            </button>
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

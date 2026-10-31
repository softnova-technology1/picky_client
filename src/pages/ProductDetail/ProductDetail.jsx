import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Gallery from '../../components/product/Gallery';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { wishlistService } from '../../services/wishlist.service';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useReviewStore } from '../../store/reviewStore';
import { getProductReviews } from '../../data';
import { reviewService } from '../../services/review.service';
import styles from './ProductDetail.module.css';
import { extractProductTag, getTagDesign } from '../../utils/productTagHelper';
import { usePageCustomization } from '../../store/customizationStore';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Info,
  Check,
  Camera,
  UploadCloud,
  X,
  Loader2,
  Heart,
  Share2,
  ShoppingBag,
  Tag,
  MapPin,
  Banknote,
} from 'lucide-react';
import '../../mobilestyle/productDetail.module.css';

const DEFAULT_CAPACITIES = ['128GB', '256GB', '512GB'];

export default function ProductDetail() {
  const { isEnabled, getSetting } = usePageCustomization('pdp');
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState('reviews'); // Default to 'reviews' matching reference image
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [apiReviews, setApiReviews] = useState([]);
  const [activeReviewLightbox, setActiveReviewLightbox] = useState(null);
  const [carouselPaused, setCarouselPaused] = useState(false);

  // Mobile Gallery state & helpers
  const [mobileSelectedImgIdx, setMobileSelectedImgIdx] = useState(0);

  useEffect(() => {
    setMobileSelectedImgIdx(0);
  }, [slug]);

  const productImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return ['/images/about_showroom_featured.jpg'];
  }, [product]);

  const activeMobileImg = productImages[mobileSelectedImgIdx] || productImages[0] || '/images/about_showroom_featured.jpg';

  const handleMobileShare = async (e) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || 'Picky Product',
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied to clipboard!', 'success');
      }
    } catch (_) {}
  };

  // Variant & Color states: null by default, only set if configured in DB
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { reviews: storeReviews } = useReviewStore();
  const { addItem, setBuyNowItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isLoggedIn, user } = useAuthStore();
  const { showToast } = useUiStore();

  // Auto-fill user profile name when Write a Review modal opens
  useEffect(() => {
    if (showWriteReviewModal && user) {
      const profileName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email?.split('@')[0] || '';
      if (profileName) {
        setReviewAuthor(profileName);
      }
    }
  }, [showWriteReviewModal, user]);

  const pId = product?._id || product?.id || slug;

  // Fetch real-time reviews from MongoDB backend for this product
  const fetchProductReviews = async (productId) => {
    if (!productId) return;
    try {
      const res = await reviewService.getByProduct(productId);
      const list = res?.reviews || [];
      setApiReviews(list);
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    }
  };

  // Real reviews filtered for this product
  const activeReviews = useMemo(() => {
    if (apiReviews && apiReviews.length > 0) return apiReviews;
    if (!product) return [];
    const prodId = String(product._id || product.id || slug);
    const prodSlug = String(product.slug || slug).toLowerCase();
    const prodName = String(product.name || '').toLowerCase();

    const matched = (storeReviews || []).filter((r) => {
      if (r.status !== 'published') return false;
      const rProdId = String(r.product?.id || r.product?._id || '');
      const rProdSlug = String(r.product?.slug || '').toLowerCase();
      const rProdName = String(r.product?.name || '').toLowerCase();
      return (
        (rProdId && rProdId === prodId) ||
        (rProdSlug && rProdSlug === prodSlug) ||
        (rProdName && (rProdName === prodName || prodName.includes(rProdName) || rProdName.includes(prodName)))
      );
    });

    return matched;
  }, [apiReviews, product, storeReviews, slug]);

  // Dynamic Rating Distribution calculation
  const ratingDistribution = useMemo(() => {
    const total = activeReviews.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (total === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0, average: product?.rating || 0 };
    }
    let sum = 0;
    activeReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
      sum += Number(r.rating) || 5;
    });
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
      total,
      average: (sum / total).toFixed(1),
    };
  }, [activeReviews, product]);

  // Handle Review Photo Upload directly to AWS S3 (compressed via Sharp)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (reviewPhotos.length + files.length > 5) {
      showToast('Maximum 5 photos allowed per review', 'warning');
      return;
    }

    setUploadingPhoto(true);
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          showToast(`"${file.name}" exceeds 5MB limit. Please choose an image under 5MB.`, 'error');
          continue;
        }
        const uploadedUrl = await reviewService.uploadPhoto(file);
        if (uploadedUrl) {
          setReviewPhotos((prev) => [...prev, uploadedUrl]);
        }
      }
      showToast('Photo uploaded to S3 successfully!', 'success');
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to upload photo to S3', 'error');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please enter your review comments', 'error');
      return;
    }
    const authorName = reviewAuthor.trim() || user?.name || user?.email?.split('@')[0] || 'Verified Customer';
    setSubmittingReview(true);
    try {
      await reviewService.create({
        productId: product?._id || product?.id || slug,
        rating: reviewRating,
        comment: reviewComment.trim(),
        photos: reviewPhotos,
        customer: {
          name: authorName,
          email: user?.email || '',
          location: user?.defaultAddress?.city ? `${user.defaultAddress.city}, Tamil Nadu` : 'Tamil Nadu, India',
          avatar: user?.avatar || user?.profilePic || user?.photo || '',
        },
      });

      showToast('🎉 Thank you! Your review has been submitted.', 'success');
      setShowWriteReviewModal(false);
      setReviewComment('');
      setReviewAuthor('');
      setReviewRating(5);
      setReviewPhotos([]);
      // Reload reviews for this product
      fetchProductReviews(product?._id || product?.id || slug);
    } catch (err) {
      console.error('Review submit error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    async function loadProduct() {
      const startTime = Date.now();
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        const item = res?.data || res;
        if (item && item.name) {
          setProduct(item);
          const stockVal = typeof item.stock === 'number' && !isNaN(item.stock) ? Math.max(0, item.stock) : 10;
          setQuantity(stockVal > 0 ? 1 : 0);
          fetchProductReviews(item._id || item.id || slug);

          // Re-init variant when product loads
          const v = item.variants;
          if (v && v.type !== 'none' && Array.isArray(v.options) && v.options.length > 0) {
            const firstOpt = v.default || v.options[0];
            setSelectedVariant(firstOpt);
            setSelectedSize(firstOpt);
          } else {
            setSelectedVariant(null);
            setSelectedSize(null);
          }

          if (v && Array.isArray(v.colors) && v.colors.length > 0) {
            const firstCol = v.colors[0];
            setSelectedColor(firstCol.id || firstCol.color || firstCol);
          } else {
            setSelectedColor(null);
          }

          // Fetch real related products from DB matching subCategory & category
          try {
            const catId = typeof item.category === 'object' ? (item.category?._id || item.category?.id) : item.category;
            const subCategoryName = item.subCategory ? String(item.subCategory).trim() : null;
            const currentId = item._id || item.id || slug;
            let matchedItems = [];

            // 1. First priority: Fetch products from the SAME sub-category
            if (subCategoryName) {
              try {
                const subRes = await productService.list({ subCategory: subCategoryName, limit: 20 });
                const rawSub = subRes?.data?.data || subRes?.data || [];
                if (Array.isArray(rawSub)) {
                  matchedItems = rawSub.filter((p) => {
                    const pid = String(p._id || p.id || p.slug);
                    return pid !== String(currentId);
                  });
                }
              } catch (subErr) {
                console.warn('Subcategory fetch error:', subErr);
              }
            }

            // 2. Second priority: If sub-category has less than 6 products, supplement with products from the same category
            if (matchedItems.length < 6 && catId) {
              try {
                const catRes = await productService.list({ category: catId, limit: 20 });
                const rawCat = catRes?.data?.data || catRes?.data || [];
                if (Array.isArray(rawCat)) {
                  const existingIds = new Set(matchedItems.map((p) => String(p._id || p.id || p.slug)));
                  const extraFromCat = rawCat.filter((p) => {
                    const pid = String(p._id || p.id || p.slug);
                    return pid !== String(currentId) && !existingIds.has(pid);
                  });
                  matchedItems = [...matchedItems, ...extraFromCat];
                }
              } catch (catErr) {
                console.warn('Category fetch error:', catErr);
              }
            }

            // 3. Third priority: Fallback to general store products if still low
            if (matchedItems.length < 4) {
              try {
                const allRes = await productService.list({ limit: 20 });
                const rawAll = allRes?.data?.data || allRes?.data || [];
                if (Array.isArray(rawAll)) {
                  const existingIds = new Set(matchedItems.map((p) => String(p._id || p.id || p.slug)));
                  const extraAll = rawAll.filter((p) => {
                    const pid = String(p._id || p.id || p.slug);
                    return pid !== String(currentId) && !existingIds.has(pid);
                  });
                  matchedItems = [...matchedItems, ...extraAll];
                }
              } catch (_) {}
            }

            setRelatedProducts(matchedItems);
          } catch (rErr) {
            console.warn('Could not load related products:', rErr);
            setRelatedProducts([]);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setProduct(null);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const productTagInfo = useMemo(() => {
    if (!product) return null;
    const rawTag = extractProductTag(product);
    if (!rawTag) return null;
    return getTagDesign(rawTag);
  }, [product]);

  if (loading && !product) {
    return (
      <PageWrapper>
        <div className="section"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className={styles['container']} style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>Product Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            The item you are looking for might have been moved or is currently unavailable.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Browse All Products
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const inWishlist = isInWishlist(pId);

  const handleToggleWishlist = async () => {
    toggleItem(product);
    showToast(
      inWishlist ? `Removed "${product.name}" from saved` : `Saved "${product.name}"!`,
      'success'
    );
    if (isLoggedIn) {
      try {
        await wishlistService.toggle(pId);
      } catch (_) {}
    }
  };

  const maxStock = typeof product?.stock === 'number' && !isNaN(product.stock) ? Math.max(0, product.stock) : 10;
  const isOutOfStock = maxStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This item is currently out of stock', 'error');
      return;
    }
    const finalQty = Math.min(Math.max(1, quantity), maxStock);
    const variantLabel = selectedVariant
      ? ` (${selectedVariant})`
      : selectedSize
      ? ` (${selectedSize})`
      : selectedCapacity
      ? ` (${selectedCapacity})`
      : '';
    addItem(
      {
        ...product,
        selectedVariant: selectedVariant || selectedSize || selectedCapacity,
        selectedSize: selectedSize || selectedVariant || null,
        selectedColor,
      },
      finalQty
    );
    showToast(`Added ${finalQty} × "${product.name}"${variantLabel} to your bag!`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast('This item is currently out of stock', 'error');
      return;
    }
    const finalQty = Math.min(Math.max(1, quantity), maxStock);
    const prodId = product._id || product.id || slug;
    setBuyNowItem({
      _id: prodId,
      id: prodId,
      productId: prodId,
      slug: product.slug || slug,
      name: product.name,
      image: product.images?.[0] || product.image || null,
      images: product.images || (product.image ? [product.image] : []),
      price: product.discountPrice || product.price || 0,
      discountPrice: product.discountPrice || product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      selectedVariant: selectedVariant || selectedCapacity,
      selectedSize: product.selectedSize || selectedVariant || selectedCapacity || null,
      selectedColor: selectedColor || null,
      quantity: finalQty,
      stock: maxStock,
    });
    navigate('/checkout?buyNow=true');
  };

  const hasDiscount = Boolean(
    product.discountPrice !== undefined &&
    product.discountPrice !== null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price)
  );
  const currentPrice = hasDiscount ? Number(product.discountPrice) : (Number(product.price) || 231);
  const originalPrice = Number(product.price) || Math.round(currentPrice * 1.25);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const TagIconComponent = productTagInfo?.icon;
  const formattedPrice = `₹${currentPrice.toLocaleString('en-IN')}`;

  // Capacity / Variant options: only use what's configured in DB — NO mock fallbacks
  const hasDbVariants = Boolean(
    product?.variants?.type &&
    product.variants.type !== 'none' &&
    Array.isArray(product.variants.options) &&
    product.variants.options.length > 0
  );

  const hasColorVariants = Boolean(
    Array.isArray(product?.variants?.colors) &&
    product.variants.colors.length > 0
  );

  const hasAnyVariants = hasColorVariants || hasDbVariants;

  const availableColors = hasColorVariants ? product.variants.colors : [];
  const availableSizes = hasDbVariants ? product.variants.options : [];

  const renderRelatedProductsRunningSection = (isMobile = false) => {
    if (!isEnabled('pdp_related_products')) return null;

    const baseList = relatedProducts && relatedProducts.length > 0 ? relatedProducts : [
      {
        _id: 'rel-1',
        id: 'rel-1',
        slug: product.slug || 'product',
        name: 'Vantage Mobile Model-2',
        price: 98,
        discountPrice: 78,
        tags: ['BEST SELLERS'],
        images: [product.images?.[0] || product.image || '/images/about_showroom_featured.jpg'],
      },
      {
        _id: 'rel-2',
        id: 'rel-2',
        slug: product.slug || 'product',
        name: 'Vantage Mobile Model-3',
        price: 2450,
        discountPrice: 1960,
        tags: ['TRENDING NOW'],
        images: [product.images?.[1] || product.images?.[0] || product.image || '/images/about_showroom_featured.jpg'],
      },
      {
        _id: 'rel-3',
        id: 'rel-3',
        slug: product.slug || 'product',
        name: 'Legacy Mobile Model-4',
        price: 1486,
        discountPrice: 1189,
        tags: ['TOP PRODUCT'],
        images: [product.images?.[2] || product.images?.[0] || product.image || '/images/about_showroom_featured.jpg'],
      },
      {
        _id: 'rel-4',
        id: 'rel-4',
        slug: product.slug || 'product',
        name: 'Vantage Mobile Model-5',
        price: 2077,
        discountPrice: 1662,
        tags: ['LIMITED DEALS'],
        images: [product.images?.[0] || product.image || '/images/about_showroom_featured.jpg'],
      },
    ];

    // Ensure at least 6 items for smooth infinite loop
    let loopItems = [...baseList];
    while (loopItems.length < 6) {
      loopItems = [...loopItems, ...baseList];
    }
    const marqueeItems = [...loopItems, ...loopItems];

    const rawLinkText = getSetting('pdp_related_products', 'viewAllLinkText', 'Shop Now');
    const displayLinkText = (!rawLinkText || rawLinkText === 'Access Database') ? 'Shop Now' : rawLinkText;
    const rawHeading = getSetting('pdp_related_products', 'sectionTitle', 'You May Also Love');
    const sectionHeading = (!rawHeading || rawHeading === 'Expand Your Arsenal') ? 'You May Also Love' : rawHeading;

    return (
      <div className={isMobile ? 'mobile-pdp-arsenal-wrap' : styles['arsenal-section']}>
        <div className={styles['arsenal-header-row']}>
          <h2 className={styles['arsenal-main-heading']}>
            {sectionHeading}
          </h2>
          <Link to="/products" className={styles['access-db-link']}>
            <span>{displayLinkText}</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <div
          className={styles['arsenal-running-wrapper']}
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onTouchStart={() => setCarouselPaused(true)}
          onTouchEnd={() => setCarouselPaused(false)}
        >
          <div
            className={styles['arsenal-running-track']}
            style={{ animationPlayState: carouselPaused ? 'paused' : 'running' }}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item._id || item.id || 'p'}-${idx}`}
                className={styles['arsenal-card-wrapper']}
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      {/* ── DESKTOP VIEW (Screens > 768px ONLY - 100% Preserved) ── */}
      <div className="desktop-pdp-container">
        <div className={styles['product-detail-wrapper']}>
          <div className={styles['container']}>

          {/* ═══════════════════════════════════════════════════════════════
              1. MAIN TOP SECTION: Gallery (Left) + Product Info (Right)
             ═══════════════════════════════════════════════════════════════ */}
          <div className={styles['top-showcase-grid']}>

            {/* Left Column: Gallery Card */}
            <div>
              <Gallery
                images={product.images || [product.image]}
                productName={product.name}
                inWishlist={inWishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>

            {/* Right Column: 3 Bento Cards (Matching Reference Image Exactly) */}
            <div className={styles['right-bento-column']}>
              
              {/* ── CARD 1: Top Hero Info Card ── */}
              <div className={styles['bento-hero-card']}>
                {/* Product Tag Badge & Stock Status Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {productTagInfo && (
                    <div
                      className="premium-running-tag"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.28rem 0.85rem',
                        borderRadius: '9999px',
                        background: productTagInfo.bg,
                        color: productTagInfo.color,
                        border: `1px solid ${productTagInfo.border}`,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        boxShadow: `0 2px 10px -2px ${productTagInfo.color}35`,
                      }}
                    >
                      <TagIconComponent size={13} color={productTagInfo.color} fill={productTagInfo.color} />
                      <span>{productTagInfo.displayName || productTagInfo.name}</span>
                    </div>
                  )}

                  {isOutOfStock ? (
                    <div className={styles['top-stock-badge']} style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                      <span className={styles['green-dot']} style={{ background: '#dc2626' }} />
                      <span>Out of Stock</span>
                    </div>
                  ) : maxStock <= (Number(getSetting('pdp_stock_delivery_pill', 'lowStockThreshold', 5)) || 5) ? (
                    <div className={styles['top-stock-badge']} style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                      <span className={styles['green-dot']} style={{ background: '#f59e0b' }} />
                      <span>Only {maxStock} Left in Stock</span>
                    </div>
                  ) : (
                    <div className={styles['top-stock-badge']}>
                      <span className={styles['green-dot']} />
                      <span>In Stock &amp; Ready to Ship</span>
                    </div>
                  )}
                </div>

                {isEnabled('pdp_stock_delivery_pill') && (
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '-0.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={14} />
                    <span>{getSetting('pdp_stock_delivery_pill', 'estimatedDeliveryText', '⚡ Usually delivered in 2 - 4 business days across Tamil Nadu')}</span>
                  </div>
                )}

                {/* Product Title */}
                <h1 className={styles['product-main-title']}>
                  {product.name || 'Origin Mobile Model-1'}
                </h1>

                {/* Price & Rating Row */}
                <div className={styles['price-rating-row']}>
                  <div className={styles['price-group']}>
                    <span className={styles['bold-price']}>
                      {formattedPrice}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className={styles['original-price']}>
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className={styles['discount-badge']}>
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className={styles['rating-pill']}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span className={styles['rating-text']}>
                      {ratingDistribution.average}
                    </span>
                    <span className={styles['reviews-count-text']}>
                      ({activeReviews.length > 0 ? `${activeReviews.length} reviews` : '2.4k reviews'})
                    </span>
                  </div>
                </div>
              </div>

              {/* ── CARD 2: Middle Grid with Standalone Cards ── */}
              <div className={`${styles['bento-middle-grid']} ${!hasAnyVariants ? styles['single-col'] : ''}`}>
                
                {/* Card 2A: Select Color & Select Size — ONLY rendered if at least one variant option is ON */}
                {hasAnyVariants && (
                  <div className={styles['bento-options-card']}>
                    {/* Select Color Variant (Only if color option is ON) */}
                    {hasColorVariants && (
                      <div className={styles['selector-group']}>
                        <span className={styles['selector-label']}>SELECT COLOR VARIANT</span>
                        <div className={styles['swatches-row']}>
                          {availableColors.map((swatch) => {
                            const swatchId = swatch.id || swatch.color || swatch;
                            return (
                              <button
                                key={swatchId}
                                type="button"
                                onClick={() => setSelectedColor(swatchId)}
                                className={`${styles['swatch-circle']} ${
                                  selectedColor === swatchId ? styles['active-swatch'] : ''
                                }`}
                                style={{ backgroundColor: swatch.color || swatch }}
                                title={swatch.name || swatch}
                                aria-label={swatch.name || swatch}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Divider only if BOTH color and size options are ON */}
                    {hasColorVariants && hasDbVariants && (
                      <div className={styles['card-inner-divider']} />
                    )}

                    {/* Select Size (Only if size option is ON) */}
                    {hasDbVariants && (
                      <div className={styles['selector-group']}>
                        <span className={styles['selector-label']}>
                          {product?.variants?.type === 'weight'
                            ? 'SELECT WEIGHT'
                            : product?.variants?.type === 'liquid' || product?.variants?.type === 'volume'
                            ? 'SELECT VOLUME'
                            : product?.variants?.type === 'storage'
                            ? 'STORAGE CAPACITY'
                            : 'SELECT SIZE'}
                        </span>
                        <div className={styles['size-pills-row']}>
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setSelectedSize(size);
                                setSelectedVariant(size);
                              }}
                              className={`${styles['size-pill-btn']} ${
                                (selectedSize === size || selectedVariant === size)
                                  ? styles['active-size-pill']
                                  : ''
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Card 2B: Quantity Stepper & Buy Actions */}
                <div className={styles['bento-purchase-card']}>
                  <div className={styles['selector-group']}>
                    <span className={styles['selector-label']}>QUANTITY</span>
                    
                    {/* Stepper Bar */}
                    <div className={styles['quantity-stepper-bar']}>
                      <button
                        type="button"
                        disabled={quantity <= 1 || isOutOfStock}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className={styles['stepper-action-btn']}
                        title={quantity <= 1 ? 'Minimum quantity reached' : 'Decrease quantity'}
                        aria-label="Decrease quantity"
                      >
                        —
                      </button>
                      <span className={styles['stepper-count-val']}>
                        {isOutOfStock ? 0 : quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= maxStock || isOutOfStock}
                        onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                        className={styles['stepper-action-btn']}
                        title={quantity >= maxStock ? `Maximum stock reached (${maxStock} available)` : 'Increase quantity'}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Stock helper status indicator */}
                  {!isOutOfStock && quantity >= maxStock && (
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600, display: 'block', marginTop: '-0.3rem', marginBottom: '0.1rem' }}>
                      Max stock reached ({maxStock} available)
                    </span>
                  )}

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={styles['btn-add-to-bag']}
                    style={{
                      opacity: isOutOfStock ? 0.5 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={styles['btn-buy-now']}
                    style={{
                      opacity: isOutOfStock ? 0.5 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isOutOfStock ? 'Out of Stock' : `Buy Now — ${formattedPrice}`}
                  </button>
                </div>

              </div>

              {/* ── CARD 3: Operation Briefing Card ── */}
              <div className={styles['bento-briefing-card']}>
                <span className={styles['selector-label']}>OPERATION BRIEFING</span>
                <p className={styles['briefing-text']}>
                  {product.shortDescription || product.description ||
                    `This ${product.name} is a premium piece from our collection, designed with excellence in mind for the Picky platform. Crafted with premium materials for maximum comfort and durability. This statement piece integrates seamlessly into any modern wardrobe.`}
                </p>

                <div className={styles['card-inner-divider']} />

                {/* Trust Badges Strip */}
                {isEnabled('pdp_trust_guarantee') && (
                <div className={styles['trust-pills-row']}>
                  <div className={styles['trust-pill-tag']}>
                    <Truck size={14} className={styles['trust-tag-icon']} />
                    <span>Priority Freight</span>
                  </div>

                  <div className={styles['trust-pill-tag']}>
                    <ShieldCheck size={14} className={styles['trust-tag-icon']} />
                    <span>100% Genuine</span>
                  </div>

                  <div className={styles['trust-pill-tag']}>
                    <RotateCcw size={14} className={styles['trust-tag-icon']} />
                    <span>{getSetting('pdp_trust_guarantee', 'returnPolicyDays', 7)}-Day Replacement</span>
                  </div>
                </div>
                )}
              </div>

            </div>{/* end .right-bento-column */}

          </div>{/* end .top-showcase-grid */}


          {/* ═══════════════════════════════════════════════════════════════
              2. MIDDLE SECTION: Tabs Card (Description, Specifications, Reviews)
             ═══════════════════════════════════════════════════════════════ */}
          <div className={styles['middle-tabs-card']}>
            
            {/* Top Navigation Bar: Description | Specifications | Reviews */}
            <div className={styles['tabs-nav-bar']}>
              <button
                type="button"
                onClick={() => setActiveDetailTab('description')}
                className={`${styles['nav-tab-btn']} ${
                  activeDetailTab === 'description' ? styles['active-tab-btn'] : ''
                }`}
              >
                Description
              </button>

              {getSetting('pdp_tabs_overview', 'showSpecsTab', true) && (
              <button
                type="button"
                onClick={() => setActiveDetailTab('specs')}
                className={`${styles['nav-tab-btn']} ${
                  activeDetailTab === 'specs' ? styles['active-tab-btn'] : ''
                }`}
              >
                Specifications
              </button>
              )}

              {getSetting('pdp_tabs_overview', 'showReviewsTab', true) && (
              <button
                type="button"
                onClick={() => setActiveDetailTab('reviews')}
                className={`${styles['nav-tab-btn']} ${
                  activeDetailTab === 'reviews' ? styles['active-tab-btn'] : ''
                }`}
              >
                Reviews
              </button>
              )}
            </div>

            {/* Tab 1: Description Panel */}
            {activeDetailTab === 'description' && (
              <div className={styles['desc-panel-wrap']}>
                <h3 className={styles['desc-section-title']}>
                  Unparalleled Design &amp; Craftsmanship
                </h3>
                <p className={styles['desc-paragraph']}>
                  {product.description ||
                    `This ${product.name} is a standout item on Picky, crafted with precision and authentic attention to detail. Every material is sustainably sourced and physically verified to deliver the ultimate luxury experience.`}
                </p>

                <div className={styles['desc-highlights-grid']}>
                  <div className={styles['desc-highlight-card']}>
                    <ShieldCheck size={26} color="#6d28d9" />
                    <strong>100% Authenticity</strong>
                    <span>Direct verified sourcing from certified manufacturer hubs.</span>
                  </div>
                  <div className={styles['desc-highlight-card']}>
                    <Truck size={26} color="#6d28d9" />
                    <strong>Express Delivery</strong>
                    <span>Priority transit and tracking directly to your doorstep.</span>
                  </div>
                  <div className={styles['desc-highlight-card']}>
                    <RotateCcw size={26} color="#6d28d9" />
                    <strong>Doorstep Inspection</strong>
                    <span>Full 30-day hassle-free window for exchange or return.</span>
                  </div>
                  <div className={styles['desc-highlight-card']}>
                    <Zap size={26} color="#6d28d9" />
                    <strong>Peak Performance</strong>
                    <span>Built to withstand daily demands with maximum durability.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Specifications Panel */}
            {activeDetailTab === 'specs' && (
              <div className={styles['specs-panel-wrap']}>
                {product.characteristics && product.characteristics.length > 0 ? (
                  <table className={styles['specs-table']}>
                    <thead>
                      <tr>
                        <th>Technical Spec</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.characteristics.map((c, i) => (
                        <tr key={i}>
                          <td className={styles['spec-label-cell']}>{c.key || c.name || 'Specification'}</td>
                          <td className={styles['spec-val-cell']}>
                            {Array.isArray(c.value) ? c.value.join(', ') : String(c.value || '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <Info size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
                      No Technical Specifications
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                      Specifications have not been added for this item yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Reviews Panel */}
            {activeDetailTab === 'reviews' && (
              <div className={styles['reviews-two-col-grid']}>
                
                {/* Left Column: Rating Details Breakdown */}
                <div className={styles['rating-details-col']}>
                  <h4 className={styles['col-block-heading']}>Rating Details</h4>

                  <div className={styles['rating-bars-list']}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className={styles['bar-row-item']}>
                        <span className={styles['star-num-label']}>{star}</span>
                        <div className={styles['progress-track']}>
                          <div
                            className={styles['progress-fill']}
                            style={{ width: `${ratingDistribution[star]}%` }}
                          />
                        </div>
                        <span className={styles['pct-label']}>{ratingDistribution[star]}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Experience CTA Box */}
                  <div className={styles['review-cta-box']}>
                    <p className={styles['review-cta-text']}>
                      Are you a customer? Share your experience with Picky Premium Store.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const profileName = user?.name || user?.firstName || user?.email?.split('@')[0] || '';
                        if (profileName) {
                          setReviewAuthor(profileName);
                        }
                        setShowWriteReviewModal(true);
                      }}
                      className={styles['btn-write-review']}
                    >
                      Write a Review
                    </button>
                  </div>
                </div>

                {/* Right Column: Customer Reviews */}
                <div className={styles['latest-reviews-col']}>
                  <div className={styles['reviews-header-line']}>
                    <h4 className={styles['col-block-heading']}>
                      Customer Reviews ({activeReviews.length})
                    </h4>
                    <div className={styles['reviews-header-right']}>
                      <span className={styles['sort-by-text']}>Sort by: <strong>Most Recent</strong></span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className={styles['review-cards-stack']}>
                    {activeReviews.length > 0 ? (
                      activeReviews.map((rev) => {
                        const custName = rev.customer?.name || 'Verified Customer';
                        const initials = custName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'VC';
                        const revStars = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
                        const dateFormatted = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Recent';

                        return (
                          <div key={rev.id || rev._id} className={styles['review-item-card']}>
                            <div className={styles['review-top-bar']}>
                              <div className={styles['author-info-group']}>
                                {rev.customer?.avatar ? (
                                  <img
                                    src={rev.customer.avatar}
                                    alt={custName}
                                    className={styles['customer-photo-avatar']}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={styles['mint-avatar-circle']}
                                  style={{ display: rev.customer?.avatar ? 'none' : 'flex' }}
                                >
                                  <span>{initials}</span>
                                </div>
                                <div>
                                  <span className={styles['author-name-text']}>{custName}</span>
                                  <div className={styles['author-meta-sub']}>
                                    <span className={styles['verified-buyer-tag']}>Verified Buyer</span>
                                    <span>• {dateFormatted}</span>
                                  </div>
                                </div>
                              </div>

                              <div className={styles['stars-gold-row']}>
                                {[...Array(revStars)].map((_, i) => (
                                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                                ))}
                              </div>
                            </div>

                            {rev.title && (
                              <p style={{ margin: '0.4rem 0 0.2rem 0', fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>
                                {rev.title}
                              </p>
                            )}

                            <p className={styles['review-body-text']}>
                              "{rev.comment}"
                            </p>

                            {/* Attached Review Photo Thumbnails */}
                            {Array.isArray(rev.photos) && rev.photos.length > 0 && (
                              <div className={styles['attached-photos-row']}>
                                {rev.photos.map((photoUrl, pIdx) => (
                                  <img
                                    key={pIdx}
                                    src={photoUrl}
                                    alt={`Review photo ${pIdx + 1}`}
                                    className={styles['attached-thumb-img']}
                                    style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                                    onClick={() => setActiveReviewLightbox(photoUrl)}
                                    title="Click to zoom photo"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Admin Reply */}
                            {rev.adminReply && (
                              <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#f5f3ff', borderRadius: '10px', borderLeft: '3px solid #7c3aed' }}>
                                <strong style={{ display: 'block', fontSize: '0.75rem', color: '#6d28d9', marginBottom: '0.2rem' }}>
                                  Response from {rev.adminReply.author || 'Picky Store Manager'}:
                                </strong>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                                  "{rev.adminReply.text}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <Star size={36} color="#fbbf24" style={{ marginBottom: '0.75rem' }} />
                        <h4 style={{ margin: '0 0 0.35rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 600 }}>
                          Be the First to Review
                        </h4>
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                          Share your experience and help other shoppers make the best choice.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowWriteReviewModal(true)}
                          className={styles['btn-write-review']}
                          style={{ margin: '0 auto' }}
                        >
                          Write a Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>{/* end .middle-tabs-card */}


          {/* ═══════════════════════════════════════════════════════════════
              3. BOTTOM SECTION: "You May Also Love" (Running Carousel)
             ═══════════════════════════════════════════════════════════════ */}
          {renderRelatedProductsRunningSection(false)}

        </div>{/* end .container */}
      </div>{/* end .product-detail-wrapper */}
    </div>{/* end .desktop-pdp-container */}

    {/* ═══════════════════════════════════════════════════════════════════
        MOBILE VIEW (max-width: 768px ONLY - Matches ShopApp Design)
       ═══════════════════════════════════════════════════════════════════ */}
    <div className="mobile-pdp-container">
      {/* ── 1. Image Gallery Showcase ── */}
      <div className="mobile-pdp-gallery-card">
        {hasDiscount && (
          <div className="mobile-pdp-discount-badge">
            {discountPercent}% OFF
          </div>
        )}

        <div className="mobile-pdp-gallery-actions">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="mobile-pdp-action-btn"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              fill={inWishlist ? '#e11d48' : 'none'}
              color={inWishlist ? '#e11d48' : '#630ed4'}
            />
          </button>
          <button
            type="button"
            onClick={handleMobileShare}
            className="mobile-pdp-action-btn"
            aria-label="Share product"
            title="Share product"
          >
            <Share2 size={17} color="#630ed4" />
          </button>
        </div>

        <div className="mobile-pdp-main-img-box">
          <img
            src={activeMobileImg}
            alt={product.name}
            className="mobile-pdp-main-img"
            loading="eager"
          />
        </div>

        {productImages.length > 1 && (
          <div className="mobile-pdp-dots-row">
            {productImages.map((_, idx) => (
              <span
                key={idx}
                className={`mobile-pdp-dot ${mobileSelectedImgIdx === idx ? 'active' : ''}`}
                onClick={() => setMobileSelectedImgIdx(idx)}
              />
            ))}
          </div>
        )}

        {productImages.length > 1 && (
          <div className="mobile-pdp-thumbs-row">
            {productImages.map((img, idx) => (
              <div
                key={idx}
                className={`mobile-pdp-thumb-item ${mobileSelectedImgIdx === idx ? 'active' : ''}`}
                onClick={() => setMobileSelectedImgIdx(idx)}
              >
                <img
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="mobile-pdp-thumb-img"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Title, Pricing & Offers Card ── */}
      <div className="mobile-pdp-card">
        <div className="mobile-pdp-category-kicker">
          {typeof product.category === 'object'
            ? (product.category?.name || product.brand || 'PICKY LUXURY')
            : (product.category || product.brand || 'PICKY LUXURY')}
        </div>

        <h2 className="mobile-pdp-product-title">
          {product.name}
        </h2>

        {(product.shortDescription || product.description) && (
          <p className="mobile-pdp-short-desc">
            {product.shortDescription || product.description}
          </p>
        )}

        <div className="mobile-pdp-rating-row">
          <div className="mobile-pdp-rating-badge">
            <span>{ratingDistribution.average || 4.2}</span>
            <Star size={11} fill="#ffffff" color="#ffffff" />
          </div>
          <span className="mobile-pdp-rating-meta">
            {activeReviews.length > 0
              ? `${activeReviews.length * 12 + 100} Ratings & ${activeReviews.length} Reviews`
              : '15,482 Ratings & 1,290 Reviews'}
          </span>
        </div>

        <div className="mobile-pdp-price-row">
          <span className="mobile-pdp-main-price">{formattedPrice}</span>
          {hasDiscount && (
            <>
              <span className="mobile-pdp-strike-price">₹{originalPrice.toLocaleString('en-IN')}</span>
              <span className="mobile-pdp-discount-text">{discountPercent}% OFF</span>
            </>
          )}
        </div>
        <p className="mobile-pdp-tax-note">Inclusive of all taxes</p>

      </div>

      {/* ── 3. Variants & Purchase Actions Card ── */}
      <div className="mobile-pdp-card">
        <div className="mobile-pdp-variants-wrap">
          {hasColorVariants && (
            <div>
              <span className="mobile-pdp-section-label">SELECT COLOR VARIANT</span>
              <div className="mobile-pdp-swatches-row">
                {availableColors.map((swatch) => {
                  const swatchId = swatch.id || swatch.color || swatch;
                  return (
                    <button
                      key={swatchId}
                      type="button"
                      onClick={() => setSelectedColor(swatchId)}
                      className={`mobile-pdp-swatch-circle ${selectedColor === swatchId ? 'active' : ''}`}
                      style={{ backgroundColor: swatch.color || swatch }}
                      title={swatch.name || swatch}
                      aria-label={swatch.name || swatch}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {hasDbVariants && (
            <div>
              <span className="mobile-pdp-section-label">
                {product?.variants?.type === 'weight'
                  ? 'SELECT WEIGHT'
                  : product?.variants?.type === 'liquid' || product?.variants?.type === 'volume'
                  ? 'SELECT VOLUME'
                  : product?.variants?.type === 'storage'
                  ? 'STORAGE CAPACITY'
                  : 'SELECT SIZE'}
              </span>
              <div className="mobile-pdp-pills-row">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedVariant(size);
                    }}
                    className={`mobile-pdp-size-btn ${
                      (selectedSize === size || selectedVariant === size) ? 'active' : ''
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mobile-pdp-qty-row">
            <span className="mobile-pdp-section-label" style={{ marginBottom: 0 }}>Quantity</span>
            <div className="mobile-pdp-qty-stepper">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="mobile-pdp-qty-btn"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="mobile-pdp-qty-val">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxStock || isOutOfStock}
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                className="mobile-pdp-qty-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {!isOutOfStock && quantity >= maxStock && (
            <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
              Max stock reached ({maxStock} available)
            </span>
          )}

        </div>
      </div>


      {/* ── 6. Segmented Tabs Hub Card (Description, Specifications, Reviews) ── */}
      <div className="mobile-pdp-card">
        <div className="mobile-pdp-tabs-nav">
          <button
            type="button"
            onClick={() => setActiveDetailTab('description')}
            className={`mobile-pdp-tab-btn ${activeDetailTab === 'description' ? 'active' : ''}`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveDetailTab('specs')}
            className={`mobile-pdp-tab-btn ${activeDetailTab === 'specs' ? 'active' : ''}`}
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveDetailTab('reviews')}
            className={`mobile-pdp-tab-btn ${activeDetailTab === 'reviews' ? 'active' : ''}`}
          >
            Reviews ({activeReviews.length})
          </button>
        </div>

        {activeDetailTab === 'description' && (
          <div>
            <p className="mobile-pdp-desc-text">
              {product.description ||
                `This ${product.name} is a standout item on Picky, crafted with precision and authentic attention to detail.`}
            </p>
            <div className="mobile-pdp-highlights-grid">
              <div className="mobile-pdp-highlight-box">
                <ShieldCheck size={20} color="#630ed4" />
                <strong>100% Authenticity</strong>
                <span>Direct verified sourcing from certified makers.</span>
              </div>
              <div className="mobile-pdp-highlight-box">
                <Truck size={20} color="#630ed4" />
                <strong>Express Delivery</strong>
                <span>Priority transit to your doorstep.</span>
              </div>
            </div>
          </div>
        )}

        {activeDetailTab === 'specs' && (
          <div>
            {product.characteristics && product.characteristics.length > 0 ? (
              <table className="mobile-pdp-specs-table">
                <tbody>
                  {product.characteristics.map((c, i) => (
                    <tr key={i}>
                      <td className="mobile-pdp-spec-label">{c.key || c.name || 'Feature'}</td>
                      <td className="mobile-pdp-spec-val">
                        {Array.isArray(c.value) ? c.value.join(', ') : String(c.value || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#7b7487', fontSize: '0.8rem' }}>
                Specifications have not been added for this item yet.
              </div>
            )}
          </div>
        )}

        {activeDetailTab === 'reviews' && (
          <div>
            <div className="mobile-pdp-reviews-header">
              <span className="mobile-pdp-section-label" style={{ marginBottom: 0 }}>Ratings &amp; Reviews</span>
              <button
                type="button"
                onClick={() => setShowWriteReviewModal(true)}
                className="mobile-pdp-rate-btn"
              >
                Rate Product
              </button>
            </div>

            <div className="mobile-pdp-review-score-box">
              <div className="mobile-pdp-score-left">
                <span className="mobile-pdp-big-score">{ratingDistribution.average || 4.2}</span>
                <div className="mobile-pdp-score-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span className="mobile-pdp-score-count">
                  {activeReviews.length > 0 ? `${activeReviews.length} Ratings` : '15.4k Ratings'}
                </span>
              </div>

              <div className="mobile-pdp-score-right">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="mobile-pdp-progress-row">
                    <span style={{ width: '10px' }}>{star}</span>
                    <div className="mobile-pdp-progress-track">
                      <div
                        className="mobile-pdp-progress-fill"
                        style={{ width: `${ratingDistribution[star]}%` }}
                      />
                    </div>
                    <span style={{ width: '28px', textAlign: 'right' }}>{ratingDistribution[star]}%</span>
                  </div>
                ))}
              </div>
            </div>

            {activeReviews.some((r) => Array.isArray(r.photos) && r.photos.length > 0) && (
              <div className="mobile-pdp-photos-strip">
                {activeReviews.flatMap((r) => r.photos || []).slice(0, 8).map((photoUrl, pIdx) => (
                  <div
                    key={pIdx}
                    className="mobile-pdp-photo-thumb"
                    onClick={() => setActiveReviewLightbox(photoUrl)}
                  >
                    <img src={photoUrl} alt="Review thumb" />
                  </div>
                ))}
              </div>
            )}

            {activeReviews.length > 0 ? (
              activeReviews.slice(0, 5).map((rev) => {
                const custName = rev.customer?.name || 'Verified Customer';
                const revStars = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
                const dateFormatted = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div key={rev.id || rev._id} className="mobile-pdp-review-card">
                    <div className="mobile-pdp-review-top">
                      <div className="mobile-pdp-reviewer-wrap">
                        <span className="mobile-pdp-rev-star-badge">
                          <span>{revStars}</span>
                          <Star size={9} fill="#ffffff" color="#ffffff" />
                        </span>
                        <span className="mobile-pdp-rev-author">{custName}</span>
                      </div>
                      <span className="mobile-pdp-rev-date">{dateFormatted}</span>
                    </div>
                    <p className="mobile-pdp-rev-comment">"{rev.comment}"</p>
                    <div className="mobile-pdp-verified-buyer">
                      <CheckCircle2 size={13} color="#047857" />
                      <span>Certified Buyer</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: '#7b7487', fontSize: '0.78rem' }}>
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 7. Related Products ("You May Also Love" Running Carousel) ── */}
      {renderRelatedProductsRunningSection(true)}
    </div>

    {/* ── 8. Fixed Bottom Purchase Dock (Mobile Only) ── */}
    <div className="mobile-pdp-sticky-dock">
      <div className="mobile-pdp-dock-price-group">
        <span className="mobile-pdp-dock-main-price">{formattedPrice}</span>
        {hasDiscount && (
          <span className="mobile-pdp-dock-sub-price">
            ₹{originalPrice.toLocaleString('en-IN')} ({discountPercent}% OFF)
          </span>
        )}
      </div>
      <div className="mobile-pdp-dock-actions">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="mobile-pdp-dock-btn-bag"
        >
          Add to Bag
        </button>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="mobile-pdp-dock-btn-buy"
        >
          Buy Now
        </button>
      </div>
    </div>

      {/* ── Modal for Write a Review ── */}
      {showWriteReviewModal && (
        <div
          className={styles['auth-modal-overlay']}
          onClick={() => setShowWriteReviewModal(false)}
        >
          <div
            className={styles['auth-modal-card']}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            <div className={styles['auth-modal-header']}>
              <h3 className={styles['auth-modal-title']}>Share Your Experience</h3>
              <button
                type="button"
                onClick={() => setShowWriteReviewModal(false)}
                className={styles['auth-modal-close']}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ padding: '1.25rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                How would you rate <strong>{product.name}</strong>?
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star
                      size={28}
                      fill={star <= reviewRating ? '#f59e0b' : 'transparent'}
                      color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                ))}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', alignSelf: 'center' }}>
                  {reviewRating} of 5 Stars
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Review Comments *
                </label>
                <textarea
                  required
                  placeholder="Share details of your experience with this item, build quality, fit, etc."
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    padding: '0.75rem',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Optional Review Photos Upload to AWS S3 (Max 5 photos, max 5MB) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Add Photos (Optional)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {reviewPhotos.length}/5 photos (Max 5MB each)
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                  {reviewPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '68px',
                        height: '68px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Upload preview ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setReviewPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          background: 'rgba(15, 23, 42, 0.75)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title="Remove photo"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}

                  {reviewPhotos.length < 5 && (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '68px',
                        height: '68px',
                        borderRadius: '10px',
                        border: '2px dashed #a855f7',
                        background: '#faf5ff',
                        cursor: uploadingPhoto ? 'wait' : 'pointer',
                        color: '#7c3aed',
                        transition: 'all 0.15s ease',
                      }}
                      title="Upload photo from device"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingPhoto || submittingReview}
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      {uploadingPhoto ? (
                        <Loader2 size={20} className={styles.spinning} color="#7c3aed" />
                      ) : (
                        <>
                          <Camera size={20} color="#7c3aed" />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '3px' }}>Upload</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {uploadingPhoto && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.74rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Loader2 size={12} className={styles.spinning} /> Compressing & uploading to S3...
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploadingPhoto || submittingReview}
                className={styles['btn-buy-now']}
                style={{ width: '100%', opacity: (uploadingPhoto || submittingReview) ? 0.7 : 1 }}
              >
                {submittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Lightbox Zoom Modal for Review Photos ── */}
      {activeReviewLightbox && (
        <div
          className={styles['auth-modal-overlay']}
          onClick={() => setActiveReviewLightbox(null)}
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeReviewLightbox}
              alt="Review full preview"
              style={{
                maxWidth: '85vw',
                maxHeight: '85vh',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
            <button
              type="button"
              onClick={() => setActiveReviewLightbox(null)}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                background: '#fff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              }}
              title="Close image"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

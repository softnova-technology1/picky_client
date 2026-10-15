import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Package,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Star,
  Eye,
  Download,
  Search,
  MessageSquare,
  Ruler,
  Palette,
  Scale,
  Droplet,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import ProductCard from '../../../components/product/ProductCard/ProductCard';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { useReviewStore } from '../../../store/reviewStore';
import { formatPrice } from '../../../utils/formatPrice';

const PREDEFINED_TAGS = [
  'Limited Deals',
  'Trending Now',
  'New Arrivals',
  'Best Sellers',
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STANDARD_WEIGHTS = ['25g', '50g', '100g', '200g', '250g', '500g', '1kg', '2kg', '5kg'];
const STANDARD_LIQUIDS = ['30ml', '50ml', '100ml', '200ml', '250ml', '500ml', '750ml', '1L', '2L', '5L'];

const DEFAULT_ADMIN_COLORS = [
  { id: 'navy', name: 'Dark Navy', color: '#1e2238' },
  { id: 'red', name: 'Coral Red', color: '#ef4444' },
  { id: 'blue', name: 'Vibrant Blue', color: '#3b82f6' },
  { id: 'green', name: 'Emerald Green', color: '#22c55e' },
];

const PRESET_COLOR_PALETTE = [
  { id: 'black', name: 'Pitch Black', color: '#09090b' },
  { id: 'white', name: 'Cloud White', color: '#ffffff' },
  { id: 'navy', name: 'Dark Navy', color: '#1e2238' },
  { id: 'red', name: 'Coral Red', color: '#ef4444' },
  { id: 'blue', name: 'Vibrant Blue', color: '#3b82f6' },
  { id: 'green', name: 'Emerald Green', color: '#22c55e' },
  { id: 'gray', name: 'Slate Gray', color: '#64748b' },
  { id: 'amber', name: 'Amber Gold', color: '#f59e0b' },
  { id: 'purple', name: 'Royal Purple', color: '#7c3aed' },
  { id: 'pink', name: 'Rose Pink', color: '#ec4899' },
];

export default function AdminProducts() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'table' | 'form'
  const [viewMode, setViewMode] = useState('table');
  const [modalLoading, setModalLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Filters and Tabs State
  const [activeTab, setActiveTab] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterCategory, filterStock, searchQuery]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    sku: '',
    price: '',
    discountPrice: '',
    shortDescription: '',
    description: '',
    tags: '',
    stock: '',
    isFeatured: false,
    isActive: true,
  });

  const [charValues, setCharValues] = useState({});
  const [customSpecs, setCustomSpecs] = useState([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Product Weight Options state (Disabled by default - starts from grams)
  const [hasWeights, setHasWeights] = useState(false);
  const [selectedWeights, setSelectedWeights] = useState(['50g', '100g', '250g', '500g', '1kg']);
  const [customWeightInput, setCustomWeightInput] = useState('');

  // Product Liquid / Volume Options state (Disabled by default - starts from milliliters)
  const [hasLiquids, setHasLiquids] = useState(false);
  const [selectedLiquids, setSelectedLiquids] = useState(['50ml', '100ml', '250ml', '500ml', '1L']);
  const [customLiquidInput, setCustomLiquidInput] = useState('');
  
  // Product Color Options state (Disabled by default)
  const [hasColors, setHasColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState(DEFAULT_ADMIN_COLORS);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1e2238');
  const [editingColorIndex, setEditingColorIndex] = useState(null);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewSeedForm, setReviewSeedForm] = useState({ author: '', rating: 5, comment: '' });
  const { reviews: allStoreReviews, addReview: addStoreReview } = useReviewStore();
  const [primaryFile, setPrimaryFile] = useState(null);
  const [secondaryFiles, setSecondaryFiles] = useState([]);
  const [primaryPreview, setPrimaryPreview] = useState(null);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);

  // Reviews matching the product currently being edited
  const currentProductReviews = useMemo(() => {
    if (!editingProduct) return [];
    const epId = String(editingProduct._id || editingProduct.id || '');
    const epSlug = String(editingProduct.slug || '').toLowerCase();
    const epName = String(editingProduct.name || '').toLowerCase();

    return (allStoreReviews || []).filter((r) => {
      const rId = String(r.product?.id || r.product?._id || '');
      const rSlug = String(r.product?.slug || '').toLowerCase();
      const rName = String(r.product?.name || '').toLowerCase();
      return (
        (rId && rId === epId) ||
        (rSlug && rSlug === epSlug) ||
        (rName && (rName === epName || epName.includes(rName) || rName.includes(epName)))
      );
    });
  }, [editingProduct, allStoreReviews]);

  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleCustomSpecChange = (index, field, val) => {
    setCustomSpecs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveCustomSpec = (index) => {
    setCustomSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSeedReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewSeedForm.comment.trim()) {
      showToast('Please enter a review comment', 'error');
      return;
    }
    addStoreReview({
      productId: editingProduct?._id || editingProduct?.id || 'prod-custom',
      productName: formData.name || editingProduct?.name || 'Product',
      productSlug: editingProduct?.slug || '',
      productImage: primaryPreview || editingProduct?.images?.[0] || '',
      category: typeof formData.category === 'object' ? formData.category?.name : (formData.category || ''),
      price: Number(formData.discountPrice) || Number(formData.price) || 0,
      author: reviewSeedForm.author.trim() || 'Verified Buyer',
      rating: Number(reviewSeedForm.rating) || 5,
      comment: reviewSeedForm.comment.trim(),
      status: 'published',
    });
    showToast('Verified customer review added successfully!', 'success');
    setShowAddReviewModal(false);
    setReviewSeedForm({ author: '', rating: 5, comment: '' });
  };

  // Live Card Preview Data computed from current form inputs
  const previewProductData = useMemo(() => {
    const catObj = categories.find((c) => c._id === formData.category || c.name === formData.category);
    const catName = catObj?.name || formData.category || 'Category';
    const numPrice = Number(formData.price) || 0;
    const numDiscount = Number(formData.discountPrice) || 0;

    const finalOriginalPrice = numPrice > 0 ? numPrice : (numDiscount > 0 ? numDiscount : 0);
    const finalSellingPrice = numDiscount > 0 ? numDiscount : (numPrice > 0 ? numPrice : 0);

    const imageList = primaryPreview
      ? [primaryPreview, ...secondaryPreviews]
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];

    const combinedCharacteristics = [
      ...Object.entries(charValues)
        .filter(([_, v]) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
        .map(([k, v]) => ({ key: k, value: Array.isArray(v) ? v.join(', ') : String(v) })),
      ...customSpecs
        .filter((s) => s.key && s.key.trim() && s.value && s.value.trim())
        .map((s) => ({ key: s.key.trim(), value: s.value.trim() })),
    ];

    return {
      _id: editingProduct?._id || 'preview-temp-id',
      id: editingProduct?._id || 'preview-temp-id',
      slug: editingProduct?.slug || 'preview-slug',
      name: formData.name.trim() || 'Product Name Preview',
      images: imageList,
      image: imageList[0],
      price: finalOriginalPrice,
      discountPrice: finalSellingPrice > 0 && finalSellingPrice < finalOriginalPrice ? finalSellingPrice : (finalSellingPrice || finalOriginalPrice),
      originalPrice: finalOriginalPrice,
      stock: formData.stock !== '' ? Number(formData.stock) : 10,
      tags: formData.tags ? [formData.tags] : [],
      category: catName,
      subCategory: formData.subCategory,
      characteristics: combinedCharacteristics,
      rating: editingProduct?.rating || 4.9,
      numReviews: currentProductReviews.length || editingProduct?.numReviews || 8,
      sku: formData.sku || 'SKU-PREVIEW',
    };
  }, [formData, primaryPreview, secondaryPreviews, categories, editingProduct, charValues, customSpecs, currentProductReviews]);

  async function loadData() {
    const startTime = Date.now();
    try {
      setLoading(true);
      const [prodRes, catRes, subRes] = await Promise.all([
        productService.list({ limit: 100, includeInactive: true }).catch(() => null),
        categoryService.list().catch(() => null),
        adminService.getSubCategories().catch(() => null),
      ]);
      const pList = prodRes ? (prodRes.data?.data || prodRes.data || []) : [];
      const cList = catRes ? (catRes.data?.data || catRes.data || []) : [];
      const sList = subRes ? (subRes.data?.data || subRes.data || []) : [];
      setProducts(pList);
      setCategories(cList);
      setSubcategories(sList);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
      setCategories([]);
      setSubcategories([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 2000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Open form workspace if action=add is triggered from Quick Actions
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, categories]);

  const generateSku = (catIdOrName, subName) => {
    let catCode = 'PRD';
    const cat = categories.find((c) => c._id === catIdOrName || c.name === catIdOrName || c.slug === catIdOrName);
    const catName = cat?.name || (typeof catIdOrName === 'string' ? catIdOrName : '');
    
    if (catName.toLowerCase().includes('women')) catCode = 'WF';
    else if (catName.toLowerCase().includes('men')) catCode = 'MF';
    else if (catName.toLowerCase().includes('kitchen') || catName.toLowerCase().includes('home')) catCode = 'HK';
    else if (catName.toLowerCase().includes('jewel')) catCode = 'AJ';
    else if (catName.toLowerCase().includes('beauty')) catCode = 'BP';
    else if (catName.toLowerCase().includes('mobile') || catName.toLowerCase().includes('gadget')) catCode = 'MA';
    else if (catName.toLowerCase().includes('snack') || catName.toLowerCase().includes('sweet')) catCode = 'SS';
    else if (catName.toLowerCase().includes('footwear') || catName.toLowerCase().includes('shoe')) catCode = 'FW';
    else if (catName.toLowerCase().includes('toy') || catName.toLowerCase().includes('baby')) catCode = 'TK';
    else if (catName.toLowerCase().includes('bag')) catCode = 'BW';
    else if (catName) {
      catCode = catName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() || 'PRD';
    }

    let subCode = 'GEN';
    if (subName) {
      subCode = subName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      if (subCode.length < 3) subCode = subCode.padEnd(3, 'X');
    }

    const randNum = String(Math.floor(100 + Math.random() * 900));
    return `${catCode}-${subCode}-${randNum}`;
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat = categories[0]?._id || '';
    const defaultCatObj = categories.find((c) => c._id === defaultCat);
    const defaultSub = defaultCatObj?.subcategories?.[0]?.name || '';
    const defaultSku = generateSku(defaultCat, defaultSub);
    setFormData({
      name: '',
      category: defaultCat,
      subCategory: defaultSub,
      sku: defaultSku,
      price: '',
      discountPrice: '',
      shortDescription: '',
      description: '',
      tags: '',
      stock: '',
      isFeatured: false,
      isActive: true,
    });
    setCharValues({});
    setCustomSpecs([]);
    setHasSizes(false);
    setSelectedSizes(['S', 'M', 'L', 'XL', 'XXL']);
    setCustomSizeInput('');
    setHasWeights(false);
    setSelectedWeights(['50g', '100g', '250g', '500g', '1kg']);
    setCustomWeightInput('');
    setHasLiquids(false);
    setSelectedLiquids(['50ml', '100ml', '250ml', '500ml', '1L']);
    setCustomLiquidInput('');
    setHasColors(false);
    setSelectedColors(DEFAULT_ADMIN_COLORS);
    setNewColorName('');
    setNewColorHex('#1e2238');
    setEditingColorIndex(null);
    setPrimaryFile(null);
    setSecondaryFiles([]);
    setPrimaryPreview(null);
    setSecondaryPreviews([]);
    setViewMode('form');
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const catId = p.category?._id || p.category || '';
    const subName = p.subCategory?.name || (typeof p.subCategory === 'string' ? p.subCategory : '');
    setFormData({
      name: p.name || '',
      category: catId,
      subCategory: subName,
      sku: p.sku || generateSku(catId, subName),
      price: p.price ? String(p.price) : '',
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags[0] : (typeof p.tags === 'string' ? p.tags.split(',')[0].trim() : ''),
      stock: p.stock !== undefined ? String(p.stock) : '',
      isFeatured: !!p.isFeatured,
      isActive: true,
    });

    // Populate characteristics (Preset vs Custom)
    const initialChars = {};
    const initialCustom = [];
    const catObj = categories.find((c) => c._id === catId);
    const catSpecs = catObj?.characteristics || [];
    const catSpecNames = new Set(catSpecs.map((s) => s.name || s.key));

    if (Array.isArray(p.characteristics)) {
      p.characteristics.forEach((item) => {
        if (item.key) {
          if (catSpecNames.has(item.key)) {
            initialChars[item.key] = item.value;
          } else {
            initialCustom.push({ key: item.key, value: item.value });
          }
        }
      });
    }
    setCharValues(initialChars);
    setCustomSpecs(initialCustom);

    // Populate variants (Clothing Sizes)
    const pVariants = p.variants;
    const vType = pVariants?.type;
    const vOptions = Array.isArray(pVariants?.options) ? pVariants.options : [];

    const hasClothingSizes = vType === 'clothing-size' && vOptions.length > 0;
    setHasSizes(hasClothingSizes);
    setSelectedSizes(hasClothingSizes ? [...vOptions] : ['S', 'M', 'L', 'XL', 'XXL']);
    setCustomSizeInput('');

    // Populate variants (Weight Options - starting from grams)
    const hasWeightVariants = vType === 'weight' && vOptions.length > 0;
    setHasWeights(hasWeightVariants);
    setSelectedWeights(hasWeightVariants ? [...vOptions] : ['50g', '100g', '250g', '500g', '1kg']);
    setCustomWeightInput('');

    // Populate variants (Liquid Options - starting from milliliters)
    const hasLiquidVariants = (vType === 'liquid' || vType === 'volume') && vOptions.length > 0;
    setHasLiquids(hasLiquidVariants);
    setSelectedLiquids(hasLiquidVariants ? [...vOptions] : ['50ml', '100ml', '250ml', '500ml', '1L']);
    setCustomLiquidInput('');

    // Populate variants (Color Options)
    const hasProductColors =
      Array.isArray(pVariants?.colors) &&
      pVariants.colors.length > 0;
    setHasColors(hasProductColors);
    setSelectedColors(
      hasProductColors
        ? pVariants.colors.map((c, i) =>
            typeof c === 'string'
              ? { id: `col-${i}`, name: c, color: '#3b82f6' }
              : { id: c.id || `col-${i}`, name: c.name || 'Color', color: c.color || '#3b82f6' }
          )
        : DEFAULT_ADMIN_COLORS
    );
    setNewColorName('');
    setNewColorHex('#1e2238');
    setEditingColorIndex(null);

    // Set image previews
    const imgs = p.images || (p.image ? [p.image] : []);
    setPrimaryPreview(imgs[0] || null);
    setSecondaryPreviews(imgs.slice(1));
    setPrimaryFile(null);
    setSecondaryFiles([]);
    setViewMode('form');
  };

  const handlePrimaryFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryPreview(URL.createObjectURL(file));
      setPrimaryFile(file);
    }
    e.target.value = '';
  };

  const handleSecondaryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 10 - secondaryPreviews.length;
      if (remainingSlots <= 0) {
        showToast('Maximum 10 secondary gallery images allowed', 'warning');
        return;
      }
      const filesToAdd = files.slice(0, remainingSlots);
      const newUrls = filesToAdd.map((f) => URL.createObjectURL(f));
      setSecondaryPreviews((prev) => [...prev, ...newUrls]);
      setSecondaryFiles((prev) => [...prev, ...filesToAdd]);
      if (files.length > remainingSlots) {
        showToast(`Added ${remainingSlots} images. (Limit is 10 max)`, 'info');
      }
    }
    e.target.value = '';
  };

  const handleSetAsCover = (index) => {
    const targetUrl = secondaryPreviews[index];
    const targetFile = secondaryFiles[index]; // Could be undefined if it's an existing URL
    if (!targetUrl) return;
    
    const oldPrimaryUrl = primaryPreview;
    const oldPrimaryFile = primaryFile;

    setPrimaryPreview(targetUrl);
    setPrimaryFile(targetFile || null);

    setSecondaryPreviews((prev) => {
      const updated = [...prev];
      if (oldPrimaryUrl) {
        updated[index] = oldPrimaryUrl;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });

    setSecondaryFiles((prev) => {
      const updated = [...prev];
      if (oldPrimaryFile) {
        updated[index] = oldPrimaryFile;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });

    showToast('Promoted gallery image to Primary Cover!', 'success');
  };

  const handleRemovePrimary = () => {
    if (secondaryPreviews.length > 0) {
      setPrimaryPreview(secondaryPreviews[0]);
      setPrimaryFile(secondaryFiles[0] || null);
      setSecondaryPreviews((prev) => prev.slice(1));
      setSecondaryFiles((prev) => prev.slice(1));
      showToast('First gallery image set as Primary Cover', 'info');
    } else {
      setPrimaryPreview(null);
      setPrimaryFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.discountPrice && Number(formData.discountPrice) > Number(formData.price)) {
      showToast('Selling Price cannot exceed M.R.P!', 'error');
      return;
    }
    if (!formData.name.trim() || !formData.price || !formData.category) {
      showToast('Please fill in required product fields (Name, Price, Category)', 'error');
      return;
    }

    const hasImage = primaryPreview || primaryFile || (editingProduct && editingProduct.images && editingProduct.images.length > 0);
    if (!hasImage) {
      showToast('Please upload at least 1 primary product image! Products cannot be added without an image.', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    if (formData.subCategory) payload.append('subCategory', formData.subCategory);
    if (formData.sku) payload.append('sku', formData.sku.trim().toUpperCase());
    payload.append('price', Number(formData.price));
    if (formData.discountPrice) payload.append('discountPrice', Number(formData.discountPrice));
    payload.append('stock', Number(formData.stock) || 0);
    payload.append('shortDescription', (formData.shortDescription || '').trim());
    payload.append('description', formData.description.trim());
    payload.append('isFeatured', formData.isFeatured);

    const singleTag = formData.tags ? formData.tags.split(',')[0].trim() : '';
    const tagsArray = singleTag ? [singleTag] : [];
    payload.append('tags', singleTag);
    tagsArray.forEach((t) => payload.append('tags[]', t));

    // Serialize category preset characteristics + dynamic custom specifications
    const presetList = Object.entries(charValues)
      .filter(([_, v]) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
      .map(([k, v]) => ({
        key: k,
        value: Array.isArray(v) ? v.join(', ') : String(v),
      }));

    const customList = customSpecs
      .filter((s) => s.key && s.key.trim() && s.value && s.value.trim())
      .map((s) => ({
        key: s.key.trim(),
        value: s.value.trim(),
      }));

    const characteristicsList = [...presetList, ...customList];

    if (characteristicsList.length > 0) {
      payload.append('characteristics', JSON.stringify(characteristicsList));
    }

    // Determine active primary unit variant type
    let variantType = 'none';
    let variantOptions = [];

    if (hasWeights && selectedWeights.length > 0) {
      variantType = 'weight';
      variantOptions = selectedWeights;
    } else if (hasLiquids && selectedLiquids.length > 0) {
      variantType = 'liquid';
      variantOptions = selectedLiquids;
    } else if (hasSizes && selectedSizes.length > 0) {
      variantType = 'clothing-size';
      variantOptions = selectedSizes;
    } else if (hasColors && selectedColors.length > 0) {
      variantType = 'color';
    }

    // Serialize variants (Clothing Sizes, Weights, Liquids & Colors - all turned off by default)
    const variantsData = {
      type: variantType,
      options: variantOptions,
      default: variantOptions[0] || (hasColors && selectedColors.length > 0 ? (selectedColors[0]?.name || '') : ''),
      colors: hasColors && selectedColors.length > 0 ? selectedColors : [],
    };
    payload.append('variants', JSON.stringify(variantsData));

    // Combine and send files
    const allSelectedFiles = [];
    const imagePositions = [];

    if (primaryPreview) {
      if (!primaryPreview.startsWith('blob:')) imagePositions.push(primaryPreview);
      else {
        imagePositions.push('file');
        if (primaryFile) allSelectedFiles.push(primaryFile);
      }
    }

    secondaryPreviews.forEach((url, i) => {
      if (url && !url.startsWith('blob:')) {
        imagePositions.push(url);
      } else {
        imagePositions.push('file');
        if (secondaryFiles[i]) allSelectedFiles.push(secondaryFiles[i]);
      }
    });

    if (allSelectedFiles.length > 0) {
      for (const file of allSelectedFiles) {
        payload.append('images', file);
      }
    }

    imagePositions.forEach(pos => payload.append('imagePositions[]', pos));

    try {
      setModalLoading(true);
      if (editingProduct) {
        const res = await adminService.updateProduct(editingProduct._id, payload);
        const updated = res?.data?.data || res?.data;
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id
              ? {
                  ...p,
                  ...(updated || {}),
                  name: formData.name,
                  sku: formData.sku ? formData.sku.trim().toUpperCase() : p.sku,
                  price: Number(formData.price),
                  discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
                  stock: Number(formData.stock),
                  tags: tagsArray,
                  isFeatured: formData.isFeatured,
                  images: primaryPreview ? [primaryPreview, ...secondaryPreviews] : p.images,
                  category: categories.find((c) => c._id === formData.category) || p.category,
                  subCategory: { name: formData.subCategory || 'General' },
                  variants: variantsData,
                }
              : p
          )
        );
        showToast('Product updated successfully', 'success');
        loadData();
      } else {
        const res = await adminService.createProduct(payload);
        const updated = res?.data?.data || res?.data;
        const newProduct = updated || {
          _id: `prod_${Date.now()}`,
          name: formData.name,
          sku: formData.sku ? formData.sku.trim().toUpperCase() : `PK-${Date.now().toString(36).toUpperCase()}`,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
          stock: Number(formData.stock),
          tags: tagsArray,
          isFeatured: formData.isFeatured,
          category: categories.find((c) => c._id === formData.category) || { name: 'General' },
          subCategory: { name: formData.subCategory || 'General' },
          images: primaryPreview ? [primaryPreview, ...secondaryPreviews] : [],
          variants: variantsData,
        };
        setProducts((prev) => [newProduct, ...prev]);
        showToast('Product created successfully', 'success');
        loadData();
      }
      setViewMode('table');
    } catch (err) {
      showToast(err?.error || err?.message || 'Failed to save product', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await adminService.deleteProduct(id).catch(() => null);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast('Product deactivated', 'info');
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast('Product deactivated', 'info');
    }
  };

  // Find currently selected category object to inspect characteristics
  const currentCategoryObj = categories.find((c) => c._id === formData.category);
  const currentCategorySpecs = currentCategoryObj?.characteristics || [];

  const availableSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return subcategories.filter((s) => {
      if (s.categoryId === formData.category || s.categoryId?._id === formData.category) return true;
      return false;
    });
  }, [formData.category, subcategories]);

  const toggleMultiSelect = (charName, val) => {
    const current = Array.isArray(charValues[charName]) ? charValues[charName] : [];
    const exists = current.includes(val);
    setCharValues({
      ...charValues,
      [charName]: exists ? current.filter((x) => x !== val) : [...current, val],
    });
  };

  // Stock status formatting rules:
  // stock <= 0 (or missing/negative) -> "Out of Stock"
  // stock >= 1 && stock <= 5 -> "{stock} Left"
  // stock > 5 -> "{stock} In Stock"
  const renderStockBadge = (stock) => {
    const qty = Number(stock);
    if (isNaN(qty) || qty <= 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.22rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            background: '#fff1f2',
            color: '#be123c',
            border: '1px solid #ffe4e6',
            whiteSpace: 'nowrap',
          }}
        >
          Out of Stock
        </span>
      );
    }
    if (qty >= 1 && qty <= 5) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.22rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            background: '#fffbe6',
            color: '#b45309',
            border: '1px solid #fef3c7',
            whiteSpace: 'nowrap',
          }}
        >
          {qty} Left
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.22rem 0.6rem',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 600,
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #dcfce7',
          whiteSpace: 'nowrap',
        }}
      >
        {qty} In Stock
      </span>
    );
  };

  // ─── Products Metric Calculations ─────────────────────────────────────────
  const totalProducts = products.length;
  const activeCount = useMemo(
    () => products.filter((p) => p.isActive !== false).length,
    [products]
  );
  
  const newProductsCount = useMemo(
    () => products.filter((p) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(', ').toLowerCase() : typeof p.tags === 'string' ? p.tags.toLowerCase() : '';
      return tags.includes('new');
    }).length,
    [products]
  );

  const discountedCount = useMemo(
    () => products.filter((p) => p.price && p.discountPrice && Number(p.discountPrice) < Number(p.price)).length,
    [products]
  );

  // ─── Filter & Tab Logic ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Tab Filter
    if (activeTab === 'Active') result = result.filter((p) => p.isActive !== false);
    if (activeTab === 'Out of Stock') result = result.filter((p) => (Number(p.stock) || 0) <= 0);
    if (activeTab === 'Featured') result = result.filter((p) => p.isFeatured);
    if (activeTab === 'On Sale') result = result.filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price));

    // 2. Category Filter
    if (filterCategory !== 'All') {
      result = result.filter((p) => p.category?.name === filterCategory || p.category?._id === filterCategory || p.category === filterCategory);
    }

    // 3. Stock Filter
    if (filterStock === 'In Stock') result = result.filter((p) => (Number(p.stock) || 0) > 5);
    if (filterStock === 'Low Stock') result = result.filter((p) => (Number(p.stock) || 0) >= 1 && (Number(p.stock) || 0) <= 5);
    if (filterStock === 'Out of Stock') result = result.filter((p) => (Number(p.stock) || 0) <= 0);

    // 4. Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const tagsStr = Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '');
        const tagMatch = tagsStr.toLowerCase().includes(q);
        return nameMatch || skuMatch || tagMatch;
      });
    }

    return result;
  }, [products, activeTab, filterCategory, filterStock, searchQuery]);

  // Pagination Logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <AdminLayout title="Product Catalog Management">

      {/* ── MODE 1: FULL WORKSPACE FORM (ADD / EDIT PRODUCT) ────────────────────────── */}
      {viewMode === 'form' ? (
        <div style={{ animation: 'ordAccordionIn 0.2s ease' }}>

          {/* Top Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              ← Back to Products Catalog
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 380px) 1fr',
                gap: '1.75rem',
                alignItems: 'start',
                marginBottom: '2rem',
              }}
            >
              {/* ── LEFT COLUMN: High-Impact Image Upload & Visual Gallery ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Media Container Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Primary Cover Image Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                      <span style={{ color: '#7c3aed' }}>★</span> PRIMARY COVER IMAGE <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                        Required
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#7c3aed', background: '#f3e8ff', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                        3:4 Ratio
                      </span>
                    </div>
                  </div>

                  {/* Primary Image Dropzone Box */}
                  <label
                    style={{
                      height: '310px',
                      borderRadius: '14px',
                      border: primaryPreview ? '1.5px solid #e2e8f0' : '2px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: primaryPreview ? '0 4px 16px rgba(0,0,0,0.04)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!primaryPreview) {
                        e.currentTarget.style.borderColor = '#7c3aed';
                        e.currentTarget.style.background = '#faf5ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!primaryPreview) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                  >
                    <input type="file" accept="image/*" onChange={handlePrimaryFileSelect} style={{ display: 'none' }} />

                    {primaryPreview ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img
                          src={primaryPreview}
                          alt="Primary Product Cover"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Top-Left Cover Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#7c3aed',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            zIndex: 2,
                          }}
                        >
                          ⭐ COVER IMAGE
                        </div>

                        {/* Hover Overlay with Change & Remove options */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            color: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            zIndex: 3,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click anywhere to change</span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleRemovePrimary();
                            }}
                            style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.8rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            🗑️ Remove Cover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.85rem',
                          }}
                        >
                          <Sparkles size={24} />
                        </div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Upload Cover Image
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Drag & drop or click to browse
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                          Recommended: 3:4 (e.g. 600×800px)
                        </span>
                      </div>
                    )}
                  </label>

                  {/* Secondary Gallery Images Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      GALLERY IMAGES <span style={{ color: '#7c3aed', fontWeight: 700 }}>({secondaryPreviews.length}/10 MAX)</span>
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Hover image to set cover
                    </span>
                  </div>

                  {/* 5-Column Compact Secondary Gallery Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {/* Render existing secondary previews */}
                    {secondaryPreviews.map((url, i) => (
                      <div
                        key={i}
                        style={{
                          height: '76px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        <img src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Index Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '3px',
                            background: 'rgba(15, 23, 42, 0.65)',
                            color: '#ffffff',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                          }}
                        >
                          #{i + 1}
                        </div>

                        {/* Hover Overlay with Cover Star & Delete */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.75)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(i)}
                            title="Promote to Primary Cover"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#7c3aed',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                            }}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSecondaryPreviews((prev) => prev.filter((_, idx) => idx !== i));
                              setSecondaryFiles((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                            title="Delete Image"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Gallery Images Tile if < 10 */}
                    {secondaryPreviews.length < 10 && (
                      <label
                        style={{
                          height: '76px',
                          borderRadius: '10px',
                          border: '1.5px dashed #cbd5e1',
                          background: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#64748b',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                          padding: '0.2rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7c3aed';
                          e.currentTarget.style.color = '#7c3aed';
                          e.currentTarget.style.background = '#faf5ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                      >
                        <input type="file" multiple accept="image/*" onChange={handleSecondaryFileSelect} style={{ display: 'none' }} />
                        <Plus size={16} style={{ marginBottom: '0.1rem' }} />
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.1 }}>
                          + Add ({10 - secondaryPreviews.length})
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: Structured Product Information Form Workspace ── */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.6rem 1.75rem 5.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* 1. Basic Details */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                    PRODUCT NAME <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Cotton Handloom Madurai Sungudi Saree / AeroSound Pro Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.72rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 2. Short Description / Operation Briefing */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      SHORT DESCRIPTION (OPERATION BRIEFING)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Appears in the Operation Briefing highlight box</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Brief highlights of this product (e.g. Crafted with precision for the Picky platform. Authenticated and verified for exceptional durability...)"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.72rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 3. Detailed Description */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                    DETAILED DESCRIPTION <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed product features, specifications, and washing/usage instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.72rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 3. Category & Subcategory Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                      CATEGORY <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const catObj = categories.find((c) => c._id === newCat);
                        const defaultSub = catObj?.subcategories?.[0]?.name || '';
                        const autoSku = generateSku(newCat, defaultSub);
                        setFormData((prev) => ({
                          ...prev,
                          category: newCat,
                          subCategory: defaultSub,
                          sku: autoSku,
                        }));
                        if (!editingProduct) setCharValues({});
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                      SUBCATEGORY
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        const autoSku = generateSku(formData.category, newSub);
                        setFormData((prev) => ({
                          ...prev,
                          subCategory: newSub,
                          sku: autoSku,
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubCategories.map((sub, i) => (
                        <option key={sub._id || i} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Pricing, Inventory & SKU Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        SKU
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, sku: generateSku(prev.category, prev.subCategory) }))}
                        title="Click to re-generate auto SKU"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7c3aed',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0 0.2rem',
                        }}
                      >
                        🔄 Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. WF-SAR-001"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: '#7c3aed',
                        outline: 'none',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                      Auto/Manual SKU
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        M.R.P PRICE (₹) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 3999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', minHeight: '24px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        SELLING PRICE (₹)
                      </label>
                      {formData.price && formData.discountPrice && Number(formData.price) > Number(formData.discountPrice) && (
                        <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          {Math.round(((Number(formData.price) - Number(formData.discountPrice)) / Number(formData.price)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 2499"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid',
                        borderColor: formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) ? '#ef4444' : '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) ? '#ef4444' : '#15803d',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) && (
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'block', marginTop: '0.35rem', fontWeight: 600 }}>
                        ⚠️ Selling price cannot exceed M.R.P
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        STOCK QUANTITY <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* 5. Clothing Sizes / Variants (Optional & Toggleable - Turned OFF by default) */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: hasSizes ? '1.5px solid #c4b5fd' : '1px solid #e2e8f0',
                    marginTop: '0.3rem',
                    transition: 'all 0.25s ease',
                    boxShadow: hasSizes ? '0 4px 18px rgba(124, 58, 237, 0.06)' : 'none',
                  }}
                >
                  {/* Header Row with Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: hasSizes ? '#ede9fe' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hasSizes ? '#7c3aed' : '#64748b',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Ruler size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.84rem', color: hasSizes ? '#5b21b6' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            CLOTHING SIZES / VARIANTS
                          </strong>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: hasSizes ? '#dcfce7' : '#f1f5f9',
                              color: hasSizes ? '#15803d' : '#64748b',
                            }}
                          >
                            {hasSizes ? 'Enabled' : 'Disabled (Default)'}
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                          Enable for apparel or products with sizes like S, M, L, XL, XXL.
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !hasSizes;
                        setHasSizes(next);
                        if (next) {
                          setHasWeights(false);
                          setHasLiquids(false);
                        }
                      }}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '9999px',
                        background: hasSizes ? '#7c3aed' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={hasSizes ? 'Click to disable sizes' : 'Click to enable sizes'}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transform: hasSizes ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Expanded Size Configuration Panel (Only shown when turned ON) */}
                  {hasSizes && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid #f1f5f9' }}>
                      {/* Presets Row */}
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                          Quick-Select Standard Sizes
                        </span>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {STANDARD_SIZES.map((sz) => {
                            const isSelected = selectedSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSizes(selectedSizes.filter((s) => s !== sz));
                                  } else {
                                    setSelectedSizes([...selectedSizes, sz]);
                                  }
                                }}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1.5px solid',
                                  borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                                  background: isSelected ? '#f5f3ff' : '#ffffff',
                                  color: isSelected ? '#6d28d9' : '#475569',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? `✓ ${sz}` : `+ ${sz}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Sizes List */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Configured Sizes ({selectedSizes.length})
                          </span>
                          {selectedSizes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedSizes([])}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {selectedSizes.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            {selectedSizes.map((sz, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  background: '#ffffff',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  border: '1px solid #c4b5fd',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#5b21b6',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}
                              >
                                <span>{sz}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSizes(selectedSizes.filter((_, i) => i !== idx))}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '0.85rem',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Remove size"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '0.75rem', background: '#fff1f2', borderRadius: '8px', border: '1px dashed #fca5a5', color: '#be123c', fontSize: '0.76rem' }}>
                            ⚠️ At least one size must be added when sizes option is enabled.
                          </div>
                        )}
                      </div>

                      {/* Add Custom Size Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Add custom size (e.g. 28, 30, 32, 4XL, Free Size)"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = customSizeInput.trim().toUpperCase();
                              if (val && !selectedSizes.includes(val)) {
                                setSelectedSizes([...selectedSizes, val]);
                                setCustomSizeInput('');
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.8rem',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customSizeInput.trim().toUpperCase();
                            if (val && !selectedSizes.includes(val)) {
                              setSelectedSizes([...selectedSizes, val]);
                              setCustomSizeInput('');
                            }
                          }}
                          style={{
                            padding: '0.55rem 0.95rem',
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          + Add Size
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5B. Product Weight Options / Variants (Starting from Grams - Disabled by default) */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: hasWeights ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    marginTop: '0.85rem',
                    transition: 'all 0.25s ease',
                    boxShadow: hasWeights ? '0 4px 18px rgba(5, 150, 105, 0.08)' : 'none',
                  }}
                >
                  {/* Header Row with Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: hasWeights ? '#d1fae5' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hasWeights ? '#059669' : '#64748b',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Scale size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.84rem', color: hasWeights ? '#065f46' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            PRODUCT WEIGHT OPTIONS (GRAMS / KG)
                          </strong>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: hasWeights ? '#d1fae5' : '#f1f5f9',
                              color: hasWeights ? '#047857' : '#64748b',
                            }}
                          >
                            {hasWeights ? 'Enabled' : 'Disabled (Default)'}
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                          Enable for food, grocery, or products sold by weight (e.g. 50g, 100g, 250g, 500g, 1kg).
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !hasWeights;
                        setHasWeights(next);
                        if (next) {
                          setHasSizes(false);
                          setHasLiquids(false);
                        }
                      }}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '9999px',
                        background: hasWeights ? '#059669' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={hasWeights ? 'Click to disable weight options' : 'Click to enable weight options'}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transform: hasWeights ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Expanded Weight Configuration Panel */}
                  {hasWeights && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid #f1f5f9' }}>
                      {/* Presets Row */}
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                          Quick-Select Standard Weights
                        </span>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {STANDARD_WEIGHTS.map((wt) => {
                            const isSelected = selectedWeights.includes(wt);
                            return (
                              <button
                                key={wt}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedWeights(selectedWeights.filter((w) => w !== wt));
                                  } else {
                                    setSelectedWeights([...selectedWeights, wt]);
                                  }
                                }}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1.5px solid',
                                  borderColor: isSelected ? '#059669' : '#cbd5e1',
                                  background: isSelected ? '#ecfdf5' : '#ffffff',
                                  color: isSelected ? '#047857' : '#475569',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? `✓ ${wt}` : `+ ${wt}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Configured Weights List */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Configured Weights ({selectedWeights.length})
                          </span>
                          {selectedWeights.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedWeights([])}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {selectedWeights.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            {selectedWeights.map((wt, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  background: '#ffffff',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  border: '1px solid #a7f3d0',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#047857',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}
                              >
                                <span>{wt}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedWeights(selectedWeights.filter((_, i) => i !== idx))}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '0.85rem',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Remove weight"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '0.75rem', background: '#fff1f2', borderRadius: '8px', border: '1px dashed #fca5a5', color: '#be123c', fontSize: '0.76rem' }}>
                            ⚠️ At least one weight option must be added when weight options are enabled.
                          </div>
                        )}
                      </div>

                      {/* Add Custom Weight Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Add custom weight (e.g. 75g, 150g, 750g, 10kg)"
                          value={customWeightInput}
                          onChange={(e) => setCustomWeightInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = customWeightInput.trim();
                              if (val && !selectedWeights.includes(val)) {
                                setSelectedWeights([...selectedWeights, val]);
                                setCustomWeightInput('');
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.8rem',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customWeightInput.trim();
                            if (val && !selectedWeights.includes(val)) {
                              setSelectedWeights([...selectedWeights, val]);
                              setCustomWeightInput('');
                            }
                          }}
                          style={{
                            padding: '0.55rem 0.95rem',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          + Add Weight
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5C. Product Liquid / Volume Options (Starting from Milliliters - Disabled by default) */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: hasLiquids ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    marginTop: '0.85rem',
                    transition: 'all 0.25s ease',
                    boxShadow: hasLiquids ? '0 4px 18px rgba(2, 132, 199, 0.08)' : 'none',
                  }}
                >
                  {/* Header Row with Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: hasLiquids ? '#e0f2fe' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hasLiquids ? '#0284c7' : '#64748b',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Droplet size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.84rem', color: hasLiquids ? '#0369a1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            LIQUID / VOLUME OPTIONS (ML / LITER)
                          </strong>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: hasLiquids ? '#e0f2fe' : '#f1f5f9',
                              color: hasLiquids ? '#0369a1' : '#64748b',
                            }}
                          >
                            {hasLiquids ? 'Enabled' : 'Disabled (Default)'}
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                          Enable for liquid goods, oils, cosmetics, or drinks (e.g. 50ml, 100ml, 250ml, 500ml, 1L).
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !hasLiquids;
                        setHasLiquids(next);
                        if (next) {
                          setHasSizes(false);
                          setHasWeights(false);
                        }
                      }}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '9999px',
                        background: hasLiquids ? '#0284c7' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={hasLiquids ? 'Click to disable liquid options' : 'Click to enable liquid options'}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transform: hasLiquids ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Expanded Liquid Configuration Panel */}
                  {hasLiquids && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid #f1f5f9' }}>
                      {/* Presets Row */}
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                          Quick-Select Standard Liquid Volumes
                        </span>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {STANDARD_LIQUIDS.map((liq) => {
                            const isSelected = selectedLiquids.includes(liq);
                            return (
                              <button
                                key={liq}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedLiquids(selectedLiquids.filter((l) => l !== liq));
                                  } else {
                                    setSelectedLiquids([...selectedLiquids, liq]);
                                  }
                                }}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: '1.5px solid',
                                  borderColor: isSelected ? '#0284c7' : '#cbd5e1',
                                  background: isSelected ? '#f0f9ff' : '#ffffff',
                                  color: isSelected ? '#0369a1' : '#475569',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? `✓ ${liq}` : `+ ${liq}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Configured Liquids List */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Configured Volumes ({selectedLiquids.length})
                          </span>
                          {selectedLiquids.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedLiquids([])}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {selectedLiquids.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            {selectedLiquids.map((liq, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  background: '#ffffff',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '8px',
                                  border: '1px solid #7dd3fc',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  color: '#0369a1',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}
                              >
                                <span>{liq}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedLiquids(selectedLiquids.filter((_, i) => i !== idx))}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '0.85rem',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Remove liquid volume"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '0.75rem', background: '#fff1f2', borderRadius: '8px', border: '1px dashed #fca5a5', color: '#be123c', fontSize: '0.76rem' }}>
                            ⚠️ At least one volume option must be added when liquid options are enabled.
                          </div>
                        )}
                      </div>

                      {/* Add Custom Liquid Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Add custom volume (e.g. 150ml, 350ml, 1.5L, 5L)"
                          value={customLiquidInput}
                          onChange={(e) => setCustomLiquidInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = customLiquidInput.trim();
                              if (val && !selectedLiquids.includes(val)) {
                                setSelectedLiquids([...selectedLiquids, val]);
                                setCustomLiquidInput('');
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.8rem',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customLiquidInput.trim();
                            if (val && !selectedLiquids.includes(val)) {
                              setSelectedLiquids([...selectedLiquids, val]);
                              setCustomLiquidInput('');
                            }
                          }}
                          style={{
                            padding: '0.55rem 0.95rem',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          + Add Volume
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Product Color Options / Variants (Optional & Toggleable - Turned OFF by default) */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: hasColors ? '1.5px solid #c4b5fd' : '1px solid #e2e8f0',
                    marginTop: '0.85rem',
                    transition: 'all 0.25s ease',
                    boxShadow: hasColors ? '0 4px 18px rgba(124, 58, 237, 0.06)' : 'none',
                  }}
                >
                  {/* Header Row with Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: hasColors ? '#ede9fe' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: hasColors ? '#7c3aed' : '#64748b',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Palette size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.84rem', color: hasColors ? '#5b21b6' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            COLOR OPTIONS / VARIANTS
                          </strong>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: hasColors ? '#dcfce7' : '#f1f5f9',
                              color: hasColors ? '#15803d' : '#64748b',
                            }}
                          >
                            {hasColors ? 'Enabled' : 'Disabled (Default)'}
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                          Enable for products with multiple color choices. Edit shades, names, hex codes, or pick from presets.
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setHasColors(!hasColors)}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '9999px',
                        background: hasColors ? '#7c3aed' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={hasColors ? 'Click to disable color options' : 'Click to enable color options'}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transform: hasColors ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Expanded Color Configuration Panel (Only shown when turned ON) */}
                  {hasColors && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid #f1f5f9' }}>
                      
                      {/* Presets Row */}
                      <div style={{ marginBottom: '1.1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                          Quick-Add Preset Colors
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {PRESET_COLOR_PALETTE.map((preset) => {
                            const isAlreadyAdded = selectedColors.some(
                              (c) => c.name.toLowerCase() === preset.name.toLowerCase() || c.color.toLowerCase() === preset.color.toLowerCase()
                            );
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  if (isAlreadyAdded) {
                                    setSelectedColors(selectedColors.filter((c) => c.name.toLowerCase() !== preset.name.toLowerCase()));
                                  } else {
                                    setSelectedColors([
                                      ...selectedColors,
                                      { id: preset.id, name: preset.name, color: preset.color }
                                    ]);
                                  }
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  border: '1.5px solid',
                                  borderColor: isAlreadyAdded ? '#7c3aed' : '#e2e8f0',
                                  background: isAlreadyAdded ? '#f5f3ff' : '#ffffff',
                                  color: isAlreadyAdded ? '#6d28d9' : '#475569',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: preset.color,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    display: 'inline-block',
                                  }}
                                />
                                <span>{isAlreadyAdded ? `✓ ${preset.name}` : `+ ${preset.name}`}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Configured Colors List */}
                      <div style={{ marginBottom: '1.1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Configured Colors ({selectedColors.length})
                          </span>
                          {selectedColors.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedColors([]);
                                setEditingColorIndex(null);
                              }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {selectedColors.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.6rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            {selectedColors.map((col, idx) => {
                              const isBeingEdited = editingColorIndex === idx;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                    background: isBeingEdited ? '#ede9fe' : '#ffffff',
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '8px',
                                    border: isBeingEdited ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
                                    <span
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: col.color || '#000000',
                                        border: '1.5px solid rgba(0,0,0,0.12)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                      <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {col.name}
                                      </span>
                                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                                        {col.color}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isBeingEdited) {
                                          setEditingColorIndex(null);
                                          setNewColorName('');
                                          setNewColorHex('#1e2238');
                                        } else {
                                          setEditingColorIndex(idx);
                                          setNewColorName(col.name);
                                          setNewColorHex(col.color || '#1e2238');
                                        }
                                      }}
                                      style={{
                                        border: 'none',
                                        background: isBeingEdited ? '#7c3aed' : '#f1f5f9',
                                        color: isBeingEdited ? '#ffffff' : '#64748b',
                                        borderRadius: '6px',
                                        padding: '0.25rem 0.45rem',
                                        fontSize: '0.72rem',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                      }}
                                      title="Edit this color"
                                    >
                                      {isBeingEdited ? 'Editing' : 'Edit'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (editingColorIndex === idx) {
                                          setEditingColorIndex(null);
                                        }
                                        setSelectedColors(selectedColors.filter((_, i) => i !== idx));
                                      }}
                                      style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '0.2rem 0.35rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '4px',
                                      }}
                                      title="Remove color"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ padding: '0.75rem', background: '#fff1f2', borderRadius: '8px', border: '1px dashed #fca5a5', color: '#be123c', fontSize: '0.76rem' }}>
                            ⚠️ At least one color must be added when color options are enabled.
                          </div>
                        )}
                      </div>

                      {/* Add / Edit Color Form Bar */}
                      <div
                        style={{
                          background: editingColorIndex !== null ? '#faf5ff' : '#f8fafc',
                          padding: '0.85rem',
                          borderRadius: '10px',
                          border: editingColorIndex !== null ? '1.5px solid #c4b5fd' : '1px solid #e2e8f0',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: '0.72rem', color: editingColorIndex !== null ? '#6d28d9' : '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                          {editingColorIndex !== null ? `Editing Color #${editingColorIndex + 1}: ${selectedColors[editingColorIndex]?.name}` : 'Add / Custom Color Editor'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Native HTML Color Picker */}
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="color"
                              value={newColorHex}
                              onChange={(e) => setNewColorHex(e.target.value)}
                              style={{
                                width: '38px',
                                height: '38px',
                                padding: '0',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: 'transparent',
                              }}
                              title="Pick a color from wheel"
                            />
                          </div>

                          {/* Hex Input */}
                          <input
                            type="text"
                            placeholder="#1E2238"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            style={{
                              width: '95px',
                              padding: '0.55rem 0.65rem',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontFamily: 'monospace',
                              color: '#0f172a',
                              outline: 'none',
                            }}
                          />

                          {/* Color Name Input */}
                          <input
                            type="text"
                            placeholder="Color Name (e.g. Royal Navy, Olive Green, Wine Red)"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const name = newColorName.trim();
                                if (!name) {
                                  showToast('Please enter a color name', 'error');
                                  return;
                                }
                                const hex = newColorHex.trim() || '#1e2238';
                                const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                if (editingColorIndex !== null) {
                                  setSelectedColors((prev) =>
                                    prev.map((c, i) => (i === editingColorIndex ? { ...c, name, color: hex, id: c.id || id } : c))
                                  );
                                  setEditingColorIndex(null);
                                  showToast(`Updated color "${name}"`, 'success');
                                } else {
                                  setSelectedColors((prev) => [...prev, { id, name, color: hex }]);
                                  showToast(`Added color "${name}"`, 'success');
                                }
                                setNewColorName('');
                                setNewColorHex('#1e2238');
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: '180px',
                              padding: '0.55rem 0.8rem',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              color: '#0f172a',
                              outline: 'none',
                            }}
                          />

                          {/* Save / Add Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const name = newColorName.trim();
                              if (!name) {
                                showToast('Please enter a color name', 'error');
                                return;
                              }
                              const hex = newColorHex.trim() || '#1e2238';
                              const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              if (editingColorIndex !== null) {
                                setSelectedColors((prev) =>
                                  prev.map((c, i) => (i === editingColorIndex ? { ...c, name, color: hex, id: c.id || id } : c))
                                );
                                setEditingColorIndex(null);
                                showToast(`Updated color "${name}"`, 'success');
                              } else {
                                setSelectedColors((prev) => [...prev, { id, name, color: hex }]);
                                showToast(`Added color "${name}"`, 'success');
                              }
                              setNewColorName('');
                              setNewColorHex('#1e2238');
                            }}
                            style={{
                              padding: '0.55rem 1rem',
                              background: '#7c3aed',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                            }}
                          >
                            {editingColorIndex !== null ? 'Save Changes' : '+ Add Color'}
                          </button>

                          {editingColorIndex !== null && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColorIndex(null);
                                setNewColorName('');
                                setNewColorHex('#1e2238');
                              }}
                              style={{
                                padding: '0.55rem 0.8rem',
                                background: '#ffffff',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* 6. Product Technical Specifications Builder */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    marginTop: '0.3rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        PRODUCT TECHNICAL SPECIFICATIONS
                      </strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                        Configure specifications to display in the customer Product Detail Specifications tab.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSpec}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                      }}
                    >
                      <Plus size={14} />
                      <span>Add Specification</span>
                    </button>
                  </div>

                  {/* Category-defined Preset Specs (if any configured on category) */}
                  {currentCategorySpecs.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                        Category Presets ({currentCategoryObj?.name})
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                        {currentCategorySpecs.map((char, idx) => (
                          <div key={idx} style={{ background: '#ffffff', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                              {char.name} {char.required && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>

                            {char.type === 'select' && (
                              <select
                                style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                value={charValues[char.name] || ''}
                                onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                                required={char.required}
                              >
                                <option value="">Select {char.name}...</option>
                                {char.values?.map((v, i) => (
                                  <option key={i} value={v}>{v}</option>
                                ))}
                              </select>
                            )}

                            {char.type === 'multi_select' && (
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                {char.values?.map((v, i) => {
                                  const current = Array.isArray(charValues[char.name]) ? charValues[char.name] : [];
                                  const isSelected = current.includes(v);
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => toggleMultiSelect(char.name, v)}
                                      style={{
                                        fontSize: '0.72rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '9999px',
                                        border: '1px solid',
                                        borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                                        background: isSelected ? '#f3e8ff' : '#ffffff',
                                        color: isSelected ? '#6d28d9' : '#475569',
                                        cursor: 'pointer',
                                        fontWeight: isSelected ? 600 : 400,
                                      }}
                                    >
                                      {isSelected ? `✓ ${v}` : v}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {(char.type === 'text' || char.type === 'number') && (
                              <input
                                type={char.type}
                                placeholder={`e.g. ${char.name}...`}
                                style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                                value={charValues[char.name] || ''}
                                onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                                required={char.required}
                              />
                            )}

                            {char.type === 'boolean' && (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setCharValues({ ...charValues, [char.name]: 'Yes' })}
                                  style={{
                                    flex: 1,
                                    fontSize: '0.75rem',
                                    padding: '0.3rem',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: charValues[char.name] === 'Yes' ? '#16a34a' : '#cbd5e1',
                                    background: charValues[char.name] === 'Yes' ? '#dcfce7' : '#fff',
                                    color: charValues[char.name] === 'Yes' ? '#15803d' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCharValues({ ...charValues, [char.name]: 'No' })}
                                  style={{
                                    flex: 1,
                                    fontSize: '0.75rem',
                                    padding: '0.3rem',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: charValues[char.name] === 'No' ? '#ef4444' : '#cbd5e1',
                                    background: charValues[char.name] === 'No' ? '#fff1f2' : '#fff',
                                    color: charValues[char.name] === 'No' ? '#be123c' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Specifications Rows */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                      Custom Specifications ({customSpecs.length})
                    </span>

                    {customSpecs.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {customSpecs.map((spec, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'center',
                              background: '#ffffff',
                              padding: '0.6rem 0.85rem',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div style={{ flex: '0 0 40%' }}>
                              <input
                                type="text"
                                placeholder="Spec Name (e.g. Strap Material, Battery Life)"
                                value={spec.key}
                                onChange={(e) => handleCustomSpecChange(sIdx, 'key', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.82rem',
                                  outline: 'none',
                                }}
                              />
                            </div>
                            <div style={{ flex: '1' }}>
                              <input
                                type="text"
                                placeholder="Value (e.g. Silicone & Titanium, 48 Hours)"
                                value={spec.value}
                                onChange={(e) => handleCustomSpecChange(sIdx, 'value', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.82rem',
                                  outline: 'none',
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSpec(sIdx)}
                              style={{
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.45rem 0.6rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Delete Specification"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                          No custom specifications added. Click <strong>+ Add Specification</strong> above to add custom specs like Battery Life, Material, Water Resistance, etc.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Tags & Options (Single Tag Only) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      PRODUCT TAG (SELECT ONLY ONE)
                    </label>
                    {formData.tags && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tags: '' })}
                        style={{
                          fontSize: '0.68rem',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          padding: 0
                        }}
                      >
                        Remove Tag
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Select or enter 1 tag (e.g. Limited Deals, Trending Now, New Arrivals, Best Sellers)"
                    value={formData.tags}
                    onChange={(e) => {
                      const val = e.target.value.split(',')[0].trim();
                      setFormData({ ...formData, tags: val });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.9rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      marginBottom: '0.6rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {PREDEFINED_TAGS.map(tag => {
                      const isSelected = formData.tags.trim().toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const newTag = isSelected ? '' : tag;
                            setFormData({ ...formData, tags: newTag });
                          }}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            border: '1px solid',
                            borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                            background: isSelected ? '#f3e8ff' : '#ffffff',
                            color: isSelected ? '#6d28d9' : '#475569',
                            cursor: 'pointer',
                            fontWeight: isSelected ? 700 : 400,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkbox Options Container */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                    ⭐ Featured Product
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                    ✅ Active Status
                  </label>
                </div>

                {/* 7. Customer Reviews & Ratings Management Card */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MessageSquare size={16} color="#7c3aed" />
                        Customer Reviews &amp; Ratings ({currentProductReviews.length})
                      </strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        View, seed initial verified reviews, or jump to moderation for this product.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddReviewModal(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          background: '#f5f3ff',
                          color: '#6d28d9',
                          border: '1px solid #ddd6fe',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Verified Review</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/softpicky-sn2026/reviews')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Moderate All Reviews →
                      </button>
                    </div>
                  </div>

                  {currentProductReviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {currentProductReviews.slice(0, 3).map((r, rIdx) => (
                        <div
                          key={rIdx}
                          style={{
                            background: '#f8fafc',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                                {r.customer?.name || 'Verified Customer'}
                              </span>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[...Array(Number(r.rating) || 5)].map((_, i) => (
                                  <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                                ))}
                              </div>
                              <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: r.status === 'published' ? '#dcfce7' : '#fef3c7', color: r.status === 'published' ? '#15803d' : '#b45309', fontWeight: 600 }}>
                                {r.status}
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                              "{r.comment}"
                            </p>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        No customer reviews logged yet for this product. Click <strong>+ Add Verified Review</strong> to seed an initial testimonial.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── STICKY BOTTOM ACTION BAR ────────────────────────────────── */}
            <div
              style={{
                position: 'sticky',
                bottom: '1.5rem',
                zIndex: 20,
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '0.9rem 1.4rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: modalLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                    opacity: modalLoading ? 0.75 : 1,
                  }}
                >
                  {modalLoading ? <Spinner size={16} color="#fff" /> : null}
                  <span>{editingProduct ? 'Save Product Changes' : 'Create Product'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* ── MODE 2: TABLE INVENTORY VIEW ─────────────────────────────────────── */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Live Store Inventory
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Manage catalog specifications, prices, and high-resolution media
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => showToast('Exporting products...', 'info')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="admin-period-select-btn"
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  borderColor: '#7c3aed',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                }}
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* ── Top 4 Metric KPI Progress Cards (Reference Design) ── */}
          <div className="kpi-progress-grid">
            <AdminStatCard
              title="TOTAL PRODUCTS"
              value={totalProducts}
              icon={<Package size={22} />}
              variant="purple"
              footerLabel="Live Catalog Volume"
              footerValue="100%"
              progress={100}
            />
            <AdminStatCard
              title="ACTIVE PRODUCTS"
              value={activeCount}
              icon={<Sparkles size={22} />}
              variant="green"
              footerLabel="Published Ratio"
              footerValue={`${totalProducts ? Math.round((activeCount / totalProducts) * 100) : 0}% Active`}
              progress={totalProducts ? (activeCount / totalProducts) * 100 : 0}
            />
            <AdminStatCard
              title="NEW PRODUCTS"
              value={newProductsCount}
              icon={<PackageCheck size={22} />}
              variant="amber"
              footerLabel="Recent Arrivals"
              footerValue={`${totalProducts ? Math.round((newProductsCount / totalProducts) * 100) : 0}% New`}
              progress={totalProducts ? (newProductsCount / totalProducts) * 100 : 0}
            />
            <AdminStatCard
              title="PRODUCTS ON SALE"
              value={discountedCount}
              icon={<TrendingUp size={22} />}
              variant="blue"
              footerLabel="Discounted Items"
              footerValue={`${totalProducts ? Math.round((discountedCount / totalProducts) * 100) : 0}% On Sale`}
              progress={totalProducts ? (discountedCount / totalProducts) * 100 : 0}
            />
          </div>

          {loading ? (
            <Spinner size={36} />
          ) : (
            <>
              {/* ── Tabs & Filters ───────────────────────────────────────── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {['All', 'Active', 'Out of Stock', 'Featured', 'On Sale'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: activeTab === tab ? '#7c3aed' : '#f1f5f9',
                        color: activeTab === tab ? '#ffffff' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters & Search */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '0.45rem 0.85rem 0.45rem 2rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        outline: 'none',
                        width: '180px',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="All">All Stock Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock (1-5)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div
                className="table-container"
                style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subcategory</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>M.R.P</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selling Price</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p, index) => {
                    const subCatName =
                      p.subCategory?.name ||
                      (typeof p.subCategory === 'string' ? p.subCategory : null) ||
                      '—';
                    return (
                      <tr
                        key={p._id}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Product Cell with Clean Truncated Title & Image Thumbnail */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: '280px' }}>
                            <img
                              src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt={p.name}
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                              }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong
                                title={p.name}
                                style={{
                                  fontSize: '0.86rem',
                                  color: '#0f172a',
                                  fontWeight: 600,
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.3,
                                }}
                              >
                                {p.name}
                              </strong>
                              <span style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '0.15rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                SKU: {p.sku || p._id?.slice(-6) || p.slug?.slice(0, 12) || 'PRD'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category Chip */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'left' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: '#f3e8ff',
                              color: '#6d28d9',
                              border: '1px solid #e9d8fd',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.category?.name || 'General'}
                          </span>
                        </td>

                        {/* Subcategory Chip */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'left' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 500,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {subCatName}
                          </span>
                        </td>

                        {/* MRP / Original Price */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', color: p.discountPrice ? '#94a3b8' : '#0f172a', fontWeight: p.discountPrice ? 500 : 600, textDecoration: p.discountPrice ? 'line-through' : 'none' }}>
                            {formatPrice(p.price)}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'right' }}>
                          {p.discountPrice ? (
                            <strong style={{ fontSize: '0.88rem', color: '#15803d', fontWeight: 700 }}>
                              {formatPrice(p.discountPrice)}
                            </strong>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>

                        {/* Stock Status Badge */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'center' }}>
                          {renderStockBadge(p.stock)}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'center' }}>
                          {p.isActive !== false ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #dcfce7',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Active
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions Buttons */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setViewingProduct(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#3b82f6',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Eye size={12} color="#3b82f6" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#6d28d9',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3e8ff';
                                e.currentTarget.style.borderColor = '#e9d8fd';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Edit2 size={12} color="#6d28d9" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#ef4444',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Trash2 size={12} color="#ef4444" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid', borderColor: currentPage === i + 1 ? '#7c3aed' : '#cbd5e1', background: currentPage === i + 1 ? '#7c3aed' : '#fff', color: currentPage === i + 1 ? '#fff' : '#334155', cursor: 'pointer' }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </>
      )}
      {/* Product Details Modal */}
      <Modal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title="Product Details"
        maxWidth={900}
      >
        {viewingProduct && (
          <div style={{ padding: '0.5rem 1rem 1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 45%', maxWidth: '400px' }}>
                <img
                  src={viewingProduct.images?.[0] || viewingProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                  alt={viewingProduct.name}
                  style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div style={{ flex: '2', minWidth: '300px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.35rem' }}>{viewingProduct.name}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                    {formatPrice(viewingProduct.discountPrice || viewingProduct.price)}
                  </span>
                  {viewingProduct.discountPrice && (
                    <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      {formatPrice(viewingProduct.price)}
                    </span>
                  )}
                  <span style={{ padding: '0.25rem 0.6rem', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    SKU: {viewingProduct.sku || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#f3e8ff', color: '#6d28d9', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {viewingProduct.category?.name || (typeof viewingProduct.category === 'string' ? viewingProduct.category : 'N/A')}
                  </span>
                  {viewingProduct.subCategory && (
                    <span style={{ padding: '0.25rem 0.75rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {viewingProduct.subCategory?.name || (typeof viewingProduct.subCategory === 'string' ? viewingProduct.subCategory : '')}
                    </span>
                  )}
                  {renderStockBadge(viewingProduct.stock)}
                </div>

                {viewingProduct.shortDescription && (
                  <div style={{ marginBottom: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Short Description (Operation Briefing)
                    </h4>
                    <p style={{ color: '#0f172a', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
                      {viewingProduct.shortDescription}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    {viewingProduct.description || 'No description available for this product.'}
                  </p>
                </div>

                {viewingProduct.variants?.type === 'clothing-size' && Array.isArray(viewingProduct.variants?.options) && viewingProduct.variants.options.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#6d28d9', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Available Clothing Sizes
                    </h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {viewingProduct.variants.options.map((sz) => (
                        <span key={sz} style={{ background: '#ffffff', border: '1px solid #c4b5fd', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 700, color: '#5b21b6' }}>
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingProduct.variants?.type === 'weight' && Array.isArray(viewingProduct.variants?.options) && viewingProduct.variants.options.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#047857', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Available Weight Variants (Grams / Kg)
                    </h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {viewingProduct.variants.options.map((wt) => (
                        <span key={wt} style={{ background: '#ffffff', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 700, color: '#065f46' }}>
                          {wt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(viewingProduct.variants?.type === 'liquid' || viewingProduct.variants?.type === 'volume') && Array.isArray(viewingProduct.variants?.options) && viewingProduct.variants.options.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#0369a1', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Available Liquid / Volume Variants (ml / L)
                    </h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {viewingProduct.variants.options.map((liq) => (
                        <span key={liq} style={{ background: '#ffffff', border: '1px solid #7dd3fc', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.78rem', fontWeight: 700, color: '#0284c7' }}>
                          {liq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(viewingProduct.variants?.colors) && viewingProduct.variants.colors.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.45rem 0', color: '#6d28d9', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Configured Color Variants
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {viewingProduct.variants.colors.map((col, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: '#ffffff',
                            border: '1px solid #c4b5fd',
                            borderRadius: '6px',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#4c1d95',
                          }}
                        >
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: col.color || '#000',
                              border: '1px solid rgba(0,0,0,0.15)',
                            }}
                          />
                          <span>{col.name || (typeof col === 'string' ? col : 'Color')}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingProduct.characteristics && Object.keys(viewingProduct.characteristics).length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {(Array.isArray(viewingProduct.characteristics) ? viewingProduct.characteristics : Object.entries(viewingProduct.characteristics).map(([k, v]) => ({ key: k, value: v }))).map((item, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 600 }}>{item.key || item.name || 'Spec'}</span>
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                            {Array.isArray(item.value) ? item.value.join(', ') : (typeof item.value === 'object' ? JSON.stringify(item.value) : item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Live Storefront Card Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Live Storefront Card Preview"
        maxWidth={720}
      >
        <div style={{ padding: '0.5rem 1rem 1.5rem', width: '100%' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#4c1d95', fontSize: '0.95rem' }}>
                Customer Storefront Appearance
              </p>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                This is exactly how customers see this product card in the Shop grid and carousels.
              </p>
            </div>
            <span
              style={{
                background: '#7c3aed',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}
            >
              Live Card
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* The Actual ProductCard Component */}
            <div
              onClickCapture={(e) => {
                const link = e.target.closest('a');
                if (link) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              style={{ width: '100%', maxWidth: '280px', flex: '0 0 280px' }}
            >
              <ProductCard
                product={previewProductData}
                onAction={() => showToast('Preview mode: "Add to Cart" clicked', 'info')}
              />
            </div>

            {/* Quick Details breakdown */}
            <div style={{ flex: '1', minWidth: '260px' }}>
              <h4 style={{ margin: '0 0 0.85rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>
                Live Card Attributes
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Selling Price</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>
                    {formatPrice(previewProductData.discountPrice || previewProductData.price)}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>M.R.P</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b', textDecoration: previewProductData.discountPrice && previewProductData.discountPrice < previewProductData.price ? 'line-through' : 'none' }}>
                    {formatPrice(previewProductData.price)}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Tag / Badge</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7c3aed' }}>
                    {previewProductData.tags?.[0] || 'None'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Stock Status</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: previewProductData.stock > 0 ? '#15803d' : '#dc2626' }}>
                    {previewProductData.stock > 0 ? `${previewProductData.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#faf5ff', border: '1px dashed #c084fc', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Category & SKU
                </span>
                <span style={{ fontSize: '0.85rem', color: '#3b0764', fontWeight: 600 }}>
                  {previewProductData.category} {previewProductData.subCategory ? `› ${previewProductData.subCategory}` : ''} • SKU: {previewProductData.sku}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Verified Customer Review Modal */}
      <Modal
        isOpen={showAddReviewModal}
        onClose={() => setShowAddReviewModal(false)}
        title="Add Verified Customer Review"
        maxWidth={500}
      >
        <form onSubmit={handleSeedReviewSubmit} style={{ padding: '0.5rem 1rem 1.5rem' }}>
          <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
            Add an authentic, verified review for <strong>{formData.name || 'this product'}</strong>. It will be published immediately to the customer storefront.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Rating
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewSeedForm((prev) => ({ ...prev, rating: s }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star
                    size={26}
                    fill={s <= reviewSeedForm.rating ? '#f59e0b' : 'transparent'}
                    color={s <= reviewSeedForm.rating ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginLeft: '0.5rem' }}>
                {reviewSeedForm.rating} / 5 Stars
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ananya S., Chennai"
              value={reviewSeedForm.author}
              onChange={(e) => setReviewSeedForm((prev) => ({ ...prev, author: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Review Comment *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write customer feedback (e.g. Loved the design, premium finish, fast delivery)..."
              value={reviewSeedForm.comment}
              onChange={(e) => setReviewSeedForm((prev) => ({ ...prev, comment: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowAddReviewModal(false)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              }}
            >
              Publish Review
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

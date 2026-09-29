import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Tag,
  Zap,
  Copy,
  Check,
  Search,
  Info,
  CheckCircle2,
  Sparkles,
  Clock,
  TrendingUp,
  Gift,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  useCouponStore,
  formatValidityDate,
  parseEndOfDay,
  getCouponStatus,
  getDiscountStatus,
  isExpiringSoon,
} from '../../../store/couponStore';

// Helper: Render Applicable On badge
function renderApplicableBadge(applicableOn) {
  if (!applicableOn || applicableOn === 'All Products' || (typeof applicableOn === 'object' && applicableOn.type === 'all')) {
    return (
      <span
        style={{
          fontSize: '0.76rem',
          fontWeight: 600,
          padding: '0.2rem 0.55rem',
          borderRadius: '6px',
          background: '#f1f5f9',
          color: '#475569',
          border: '1px solid #e2e8f0',
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        All Products
      </span>
    );
  }

  let label = '';
  if (typeof applicableOn === 'string') {
    label = applicableOn;
  } else if (applicableOn.type === 'category') {
    label = `Category: ${applicableOn.value}`;
  } else if (applicableOn.type === 'product') {
    label = `Product: ${applicableOn.value}`;
  } else {
    label = String(applicableOn.value || applicableOn);
  }

  return (
    <span
      style={{
        fontSize: '0.76rem',
        fontWeight: 600,
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        background: '#ede8f8',
        color: '#5b21b6',
        border: '1px solid #dfd5f5',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function AdminCoupons() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'discounts' || tabParam === 'automatic' || tabParam === 'offers' ? 'discounts' : 'coupons'
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'discounts' || t === 'automatic' || t === 'offers') {
      setActiveTab('discounts');
    } else if (t === 'coupons') {
      setActiveTab('coupons');
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('tab', tab);
      return sp;
    });
  };
  const [loading, setLoading] = useState(true);

  // Data lists from shared couponStore
  const {
    coupons,
    discounts,
    setCoupons,
    setDiscounts,
    toggleCoupon: storeToggleCoupon,
    updateCoupon: storeUpdateCoupon,
    addCoupon: storeAddCoupon,
    deleteCoupon: storeDeleteCoupon,
    toggleDiscount: storeToggleDiscount,
    updateDiscount: storeUpdateDiscount,
    addDiscount: storeAddDiscount,
    deleteDiscount: storeDeleteDiscount,
  } = useCouponStore();

  // Highlight parameter support from Reports page link
  const highlightCode = searchParams.get('highlight');
  const [highlightedRow, setHighlightedRow] = useState(null);

  useEffect(() => {
    if (highlightCode) {
      setActiveTab('coupons');
      const upper = highlightCode.toUpperCase();
      setHighlightedRow(upper);
      const timer = setTimeout(() => {
        const el = document.getElementById(`coupon-row-${upper}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
      const clearTimer = setTimeout(() => {
        setHighlightedRow(null);
      }, 4000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightCode]);

  // Search & Filter State (Promo Coupons tab only)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  // 300ms debounce on search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalLoading, setCouponModalLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimitPerCustomer: '1',
    validFrom: '',
    validTill: '',
    applicableType: 'all',
    applicableValue: '',
  });

  // Discount Modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountModalLoading, setDiscountModalLoading] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    name: '',
    type: 'flat',
    benefitType: 'flat',
    value: '',
    minOrderAmount: '500',
    maxDiscountAmount: '',
    appliesTo: 'all',
    condition: '',
    priority: '1',
    stackable: false,
    validFrom: '',
    validTill: '',
    applicableType: 'all',
    applicableValue: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      const [cRes, dRes] = await Promise.all([
        adminService.getCoupons().catch(() => null),
        adminService.getDiscounts().catch(() => null),
      ]);
      const cList = cRes?.data || [];
      const dList = dRes?.data || [];
      if (Array.isArray(cList) && cList.length > 0) {
        setCoupons(
          cList.map((c) => ({
            ...c,
            validTill: c.validTill || c.endsAt || null,
            validFrom: c.validFrom || c.startsAt || null,
            usageLimitPerCustomer:
              c.usageLimitPerCustomer !== undefined
                ? c.usageLimitPerCustomer
                : (c.maxUsagePerUser !== undefined ? c.maxUsagePerUser : null),
            applicableOn: c.applicableOn || 'All Products',
          }))
        );
      }
      if (Array.isArray(dList) && dList.length > 0) {
        setDiscounts(
          dList.map((d, index) => {
            const fallback = discounts[index] || {};
            return {
              ...fallback,
              ...d,
              benefitType: d.benefitType || d.type || fallback.benefitType || 'flat',
              condition: d.condition || fallback.condition || 'Order cart criteria met',
              priority: d.priority !== undefined ? d.priority : (fallback.priority || 1),
              stackable: d.stackable !== undefined ? d.stackable : (fallback.stackable || false),
              validFrom: d.validFrom !== undefined ? d.validFrom : (fallback.validFrom || null),
              validTill: d.validTill !== undefined ? d.validTill : (fallback.validTill || null),
              totalUses: d.totalUses !== undefined ? d.totalUses : (fallback.totalUses || 0),
              applicableOn: d.applicableOn || fallback.applicableOn || 'All Products',
              maxDiscountAmount: d.maxDiscountAmount !== undefined ? d.maxDiscountAmount : fallback.maxDiscountAmount,
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to load promotional data from server:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open coupon modal if triggered via Quick Actions ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAddCoupon();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Copy coupon code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied!`, 'success');
    setTimeout(() => {
      setCopiedCode((curr) => (curr === code ? null : curr));
    }, 2000);
  };

  // ── Coupon Handlers ──────────────────────────────────────────────────────────
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      usageLimitPerCustomer: '1',
      validFrom: '2026-09-29',
      validTill: '2026-12-31',
      applicableType: 'all',
      applicableValue: '',
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    let appType = 'all';
    let appVal = '';
    if (c.applicableOn && typeof c.applicableOn === 'object') {
      appType = c.applicableOn.type || 'all';
      appVal = c.applicableOn.value || '';
    } else if (c.applicableOn && c.applicableOn !== 'All Products') {
      appType = 'category';
      appVal = c.applicableOn;
    }

    const limit =
      c.usageLimitPerCustomer !== undefined && c.usageLimitPerCustomer !== null
        ? String(c.usageLimitPerCustomer)
        : (c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
        ? String(c.maxUsagePerUser)
        : '');

    setCouponForm({
      code: c.code || '',
      type: c.type || 'percentage',
      value: c.value !== undefined ? String(c.value) : '',
      minOrderAmount: c.minOrderAmount !== undefined ? String(c.minOrderAmount) : '0',
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : '',
      usageLimitPerCustomer: limit,
      validFrom: c.validFrom || '',
      validTill: c.validTill || '',
      applicableType: appType,
      applicableValue: appVal,
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.value) {
      showToast('Coupon code and discount value are required', 'error');
      return;
    }

    let applicableOn = 'All Products';
    if (couponForm.applicableType === 'category' && couponForm.applicableValue.trim()) {
      applicableOn = { type: 'category', value: couponForm.applicableValue.trim() };
    } else if (couponForm.applicableType === 'product' && couponForm.applicableValue.trim()) {
      applicableOn = { type: 'product', value: couponForm.applicableValue.trim() };
    }

    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
      usageLimitPerCustomer: couponForm.usageLimitPerCustomer !== '' ? Number(couponForm.usageLimitPerCustomer) : null,
      maxUsagePerUser: couponForm.usageLimitPerCustomer !== '' ? Number(couponForm.usageLimitPerCustomer) : null,
      validFrom: couponForm.validFrom || null,
      validTill: couponForm.validTill || null,
      applicableOn,
    };

    try {
      setCouponModalLoading(true);
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, payload).catch(() => null);
        storeUpdateCoupon(editingCoupon._id, payload);
        showToast(`Coupon "${payload.code}" updated!`, 'success');
      } else {
        const res = await adminService.createCoupon(payload).catch(() => null);
        const newCoupon = res?.data || {
          _id: `coup_${Date.now()}`,
          ...payload,
          isActive: true,
          usageCount: 0,
        };
        storeAddCoupon(newCoupon);
        showToast(`Coupon "${payload.code}" created!`, 'success');
      }
      setIsCouponModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save coupon', 'error');
    } finally {
      setCouponModalLoading(false);
    }
  };

  const handleToggleCoupon = async (c) => {
    storeToggleCoupon(c._id);
    try {
      await adminService.toggleCoupon(c._id).catch(() => null);
    } catch (_) {}
    showToast(`Coupon "${c.code}" ${c.isActive ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Permanently delete coupon code "${c.code}" from database?`)) return;
    storeDeleteCoupon(c._id);
    try {
      await adminService.deleteCoupon(c._id).catch(() => null);
    } catch (_) {}
    showToast(`Coupon "${c.code}" deleted`, 'success');
  };

  // Filtered coupons based on search and status
  const filteredCoupons = coupons.filter((c) => {
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      if (!c.code?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'ALL') {
      const status = getCouponStatus(c);
      if (status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });
  // ── Discount Handlers ────────────────────────────────────────────────────────
  const handleOpenAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountForm({
      name: '',
      type: 'flat',
      benefitType: 'flat',
      value: '',
      minOrderAmount: '500',
      maxDiscountAmount: '',
      appliesTo: 'all',
      condition: '',
      priority: '1',
      stackable: false,
      validFrom: '',
      validTill: '',
      applicableType: 'all',
      applicableValue: '',
    });
    setIsDiscountModalOpen(true);
  };

  const handleOpenEditDiscount = (d) => {
    setEditingDiscount(d);
    let appType = 'all';
    let appVal = '';
    if (d.applicableOn && typeof d.applicableOn === 'object') {
      appType = d.applicableOn.type || 'all';
      appVal = d.applicableOn.value || '';
    } else if (d.applicableOn && d.applicableOn !== 'All Products') {
      appType = 'category';
      appVal = d.applicableOn;
    }

    const bType = d.benefitType || d.type || 'flat';

    setDiscountForm({
      name: d.name || '',
      type: bType,
      benefitType: bType,
      value: d.value !== undefined ? String(d.value) : '',
      minOrderAmount: d.minOrderAmount !== undefined ? String(d.minOrderAmount) : '0',
      maxDiscountAmount: d.maxDiscountAmount ? String(d.maxDiscountAmount) : '',
      appliesTo: d.appliesTo || 'all',
      condition: d.condition || '',
      priority: d.priority !== undefined ? String(d.priority) : '1',
      stackable: Boolean(d.stackable),
      validFrom: d.validFrom || '',
      validTill: d.validTill || '',
      applicableType: appType,
      applicableValue: appVal,
    });
    setIsDiscountModalOpen(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!discountForm.name.trim() || !discountForm.value) {
      showToast('Discount name and value are required', 'error');
      return;
    }

    let applicableOn = 'All Products';
    if (discountForm.applicableType === 'category' && discountForm.applicableValue.trim()) {
      applicableOn = { type: 'category', value: discountForm.applicableValue.trim() };
    } else if (discountForm.applicableType === 'product' && discountForm.applicableValue.trim()) {
      applicableOn = { type: 'product', value: discountForm.applicableValue.trim() };
    }

    const payload = {
      name: discountForm.name.trim(),
      type: discountForm.benefitType || discountForm.type,
      benefitType: discountForm.benefitType || discountForm.type,
      value: Number(discountForm.value),
      minOrderAmount: Number(discountForm.minOrderAmount) || 0,
      maxDiscountAmount: discountForm.benefitType === 'flat' ? null : (discountForm.maxDiscountAmount ? Number(discountForm.maxDiscountAmount) : null),
      appliesTo: discountForm.appliesTo,
      condition: discountForm.condition.trim() || 'Cart criteria met',
      priority: Number(discountForm.priority) || 1,
      stackable: Boolean(discountForm.stackable),
      validFrom: discountForm.validFrom || null,
      validTill: discountForm.validTill || null,
      applicableOn,
      totalUses: editingDiscount ? (editingDiscount.totalUses || 0) : 0,
    };

    try {
      setDiscountModalLoading(true);
      if (editingDiscount) {
        await adminService.updateDiscount(editingDiscount._id, payload).catch(() => null);
        storeUpdateDiscount(editingDiscount._id, payload);
        showToast(`Discount rule "${payload.name}" updated!`, 'success');
      } else {
        const res = await adminService.createDiscount(payload).catch(() => null);
        const newDiscount = res?.data || {
          _id: `disc_${Date.now()}`,
          ...payload,
          isActive: true,
        };
        storeAddDiscount(newDiscount);
        showToast(`Discount rule "${payload.name}" created!`, 'success');
      }
      setIsDiscountModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save discount', 'error');
    } finally {
      setDiscountModalLoading(false);
    }
  };

  const handleToggleDiscount = async (d) => {
    storeToggleDiscount(d._id);
    try {
      await adminService.toggleDiscount(d._id).catch(() => null);
    } catch (_) {}
    showToast(`Discount rule ${d.isActive ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDeleteDiscount = async (d) => {
    if (!window.confirm(`Permanently delete discount rule "${d.name}" from database?`)) return;
    storeDeleteDiscount(d._id);
    try {
      await adminService.deleteDiscount(d._id).catch(() => null);
    } catch (_) {}
    showToast(`Discount rule "${d.name}" deleted permanently`, 'success');
  };

  // Derived KPIs for Promo & Offers Dashboard
  const totalCampaigns = coupons.length + discounts.length;
  const activeCouponsCount = useMemo(
    () => coupons.filter((c) => getCouponStatus(c) === 'Active').length,
    [coupons]
  );
  const activeDiscountsCount = useMemo(
    () => discounts.filter((d) => d.isActive !== false).length,
    [discounts]
  );
  const totalClaimsCount = useMemo(() => {
    const cCount = coupons.reduce((sum, c) => sum + (Number(c.usageCount) || 0), 0);
    const dCount = discounts.reduce((sum, d) => sum + (Number(d.totalUses || d.usageCount) || 0), 0);
    return cCount + dCount;
  }, [coupons, discounts]);

  return (
    <AdminLayout title="Coupons & Promotional Offers">
      {/* Header & Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Promotional Vouchers & Automated Campaigns
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Drive repeat purchases with checkout codes and tiered store discounts
          </span>
        </div>
      </div>

      {/* ── 1. Top 4 Metric KPI Progress Cards (Reference Design) ── */}
      <div className="kpi-progress-grid">
        <AdminStatCard
          title="TOTAL PROMOTIONS"
          value={totalCampaigns}
          icon={<Ticket size={22} />}
          variant="purple"
          footerLabel="Campaign Inventory"
          footerValue="100% Volume"
          progress={100}
        />
        <AdminStatCard
          title="ACTIVE COUPONS"
          value={activeCouponsCount}
          icon={<CheckCircle2 size={22} />}
          variant="green"
          footerLabel="Redeemable at Checkout"
          footerValue={`${coupons.length ? Math.round((activeCouponsCount / coupons.length) * 100) : 0}% Active`}
          progress={coupons.length ? (activeCouponsCount / coupons.length) * 100 : 0}
        />
        <AdminStatCard
          title="AUTOMATIC OFFERS"
          value={activeDiscountsCount}
          icon={<Zap size={22} />}
          variant="amber"
          footerLabel="Cart Tier Triggers"
          footerValue={`${activeDiscountsCount}/${discounts.length} Active`}
          progress={discounts.length ? (activeDiscountsCount / (discounts.length || 1)) * 100 : 0}
        />
        <AdminStatCard
          title="TOTAL REDEMPTIONS"
          value={totalClaimsCount.toLocaleString()}
          icon={<Sparkles size={22} />}
          variant="blue"
          footerLabel="Checkout Savings Claimed"
          footerValue={`${totalClaimsCount} Uses`}
          progress={100}
        />
      </div>

      {/* ── 2. Modern Segmented Tab Switcher & Action CTA Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            background: '#ffffff',
            padding: '5px',
            borderRadius: '9999px',
            border: '1.5px solid #ede8f8',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
            gap: '0.4rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('coupons')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.3rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              border: 'none',
              background: activeTab === 'coupons' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent',
              color: activeTab === 'coupons' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'coupons' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
            }}
          >
            <Tag size={15} color={activeTab === 'coupons' ? '#ffffff' : '#7c3aed'} />
            <span>Promo Coupons</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px',
                background: activeTab === 'coupons' ? 'rgba(255, 255, 255, 0.22)' : '#f3e8ff',
                color: activeTab === 'coupons' ? '#ffffff' : '#7c3aed',
              }}
            >
              {coupons.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('discounts')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.3rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              border: 'none',
              background: activeTab === 'discounts' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'transparent',
              color: activeTab === 'discounts' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'discounts' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
            }}
          >
            <Zap size={15} color={activeTab === 'discounts' ? '#ffffff' : '#f59e0b'} />
            <span>Automatic Offers</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px',
                background: activeTab === 'discounts' ? 'rgba(255, 255, 255, 0.22)' : '#fef3c7',
                color: activeTab === 'discounts' ? '#ffffff' : '#b45309',
              }}
            >
              {discounts.length}
            </span>
          </button>
        </div>

        {/* Primary Action Button */}
        {activeTab === 'coupons' ? (
          <button
            onClick={handleOpenAddCoupon}
            className="admin-period-select-btn"
            style={{
              height: '42px',
              padding: '0 1.35rem',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Coupon Code</span>
          </button>
        ) : (
          <button
            onClick={handleOpenAddDiscount}
            className="admin-period-select-btn"
            style={{
              height: '42px',
              padding: '0 1.35rem',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Automatic Offer</span>
          </button>
        )}
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : activeTab === 'coupons' ? (
        /* ── COUPONS TABLE ─────────────────────────────────────────────────── */
        <div>
          {/* Header Controls Row: Search + Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              {/* Search by coupon code */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '260px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '1rem', color: '#7c3aed', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="Search by coupon code (e.g. WELCOME100)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 1rem 0 2.6rem',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.84rem',
                    color: '#1e1b4b',
                    fontWeight: 500,
                    outline: 'none',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.18s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.03)';
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'Active', label: 'Active Codes' },
                  { value: 'Disabled', label: 'Disabled Codes' },
                  { value: 'Expired', label: 'Expired Codes' },
                ]}
                minWidth="155px"
              />
            </div>
          </div>

          {/* Luxury Ambient Info Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fbf9fe 0%, #f6f0ff 100%)',
              border: '1px solid #ede8f8',
              borderRadius: '12px',
              padding: '0.75rem 1.1rem',
              marginBottom: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 1px 4px rgba(124, 58, 237, 0.03)',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#ede8f8',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ticket size={16} />
            </div>
            <span style={{ fontSize: '0.82rem', color: '#4c1d95', fontWeight: 600, lineHeight: 1.4 }}>
              <strong>Promo Coupons:</strong> Customer manually enters coupon code at checkout to claim discounts.
            </span>
          </div>

          <div
            className="table-container"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '16px',
              border: '1.5px solid #ede8f8',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.04)',
              background: '#ffffff',
            }}
          >
            <table className="admin-table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 1rem' }}>Coupon Code</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Applicable On</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Discount Value</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Min. Order</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Max Cap</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Validity</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Total Uses</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Status</th>
                  <th style={{ whiteSpace: 'nowrap', textAlign: 'center', padding: '0.85rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#ede8f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                          }}
                        >
                          <Search size={22} />
                        </div>
                        <strong style={{ fontSize: '0.98rem', color: '#1e1b4b' }}>
                          {coupons.length === 0 ? 'No promo coupons created yet' : 'No coupons found'}
                        </strong>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '340px' }}>
                          {coupons.length === 0
                            ? 'Click "+ Create Coupon Code" to get started.'
                            : 'No promo coupons matched your search or status filter.'}
                        </span>
                        {coupons.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setDebouncedSearch('');
                              setStatusFilter('ALL');
                            }}
                            className="admin-period-select-btn"
                            style={{
                              marginTop: '0.4rem',
                              padding: '0.4rem 0.95rem',
                              fontSize: '0.8rem',
                              color: '#7c3aed',
                              borderColor: '#dfd5f5',
                              background: '#ffffff',
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((c, index) => {
                    const status = getCouponStatus(c);
                    const expiring = isExpiringSoon(c, status);
                    const limit =
                      c.usageLimitPerCustomer !== undefined && c.usageLimitPerCustomer !== null
                        ? c.usageLimitPerCustomer
                        : (c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
                        ? c.maxUsagePerUser
                        : null);

                    return (
                      <tr
                        key={c._id}
                        id={`coupon-row-${(c.code || '').toUpperCase()}`}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          transition: 'background-color 0.2s ease',
                          backgroundColor:
                            highlightedRow === (c.code || '').toUpperCase()
                              ? '#ede8f8'
                              : undefined,
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        {/* 1. COUPON CODE (Ticket Badge) */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            <code
                              style={{
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                background: '#f5f0ff',
                                color: '#6d28d9',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '8px',
                                border: '1.5px dashed #c084fc',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: 'inset 0 1px 2px rgba(124, 58, 237, 0.06)',
                              }}
                            >
                              <Ticket size={13} style={{ opacity: 0.75 }} />
                              {c.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(c.code)}
                              title={copiedCode === c.code ? 'Copied to Clipboard!' : 'Copy coupon code'}
                              aria-label={`Copy coupon code ${c.code}`}
                              style={{
                                background: copiedCode === c.code ? '#dcfce7' : '#ffffff',
                                border: `1px solid ${copiedCode === c.code ? '#86efac' : '#ddd6fe'}`,
                                borderRadius: '8px',
                                padding: '0.32rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: copiedCode === c.code ? '#15803d' : '#7c3aed',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              }}
                            >
                              {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>

                        {/* 2. APPLICABLE ON */}
                        <td style={{ padding: '0.85rem 0.85rem' }}>
                          {renderApplicableBadge(c.applicableOn)}
                        </td>

                        {/* 3. DISCOUNT VALUE */}
                        <td style={{ padding: '0.85rem 0.85rem' }}>
                          <strong style={{ color: '#1e1b4b', fontSize: '0.92rem', fontWeight: 800 }}>
                            {c.type === 'percentage' ? `${c.value}% OFF` : `${formatPrice(c.value)} Flat`}
                          </strong>
                        </td>

                        {/* 4. MIN. ORDER */}
                        <td style={{ padding: '0.85rem 0.85rem', color: '#475569', fontWeight: 600 }}>
                          {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                        </td>

                        {/* 5. MAX CAP */}
                        <td style={{ padding: '0.85rem 0.85rem', color: '#475569', fontWeight: 600 }}>
                          {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Unlimited'}
                        </td>

                        {/* 6. VALIDITY */}
                        <td style={{ padding: '0.85rem 0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {c.validFrom && c.validTill
                                ? `${formatValidityDate(c.validFrom)} - ${formatValidityDate(c.validTill)}`
                                : c.validTill
                                ? `Until ${formatValidityDate(c.validTill)}`
                                : 'Always Valid'}
                            </span>
                            {expiring && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  background: '#fff7ed',
                                  color: '#c2410c',
                                  border: '1px solid #ffedd5',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ⚠️ Expiring soon
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. TOTAL USES */}
                        <td style={{ padding: '0.85rem 0.85rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.86rem' }}>{c.usageCount || 0} times</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {limit !== null ? `Max ${limit} per customer` : 'No limit per customer'}
                            </span>
                          </div>
                        </td>

                        {/* 8. STATUS */}
                        <td style={{ padding: '0.85rem 0.85rem' }}>
                          {status === 'Expired' ? (
                            <span
                              className="adm-status-pill"
                              style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                            >
                              Expired
                            </span>
                          ) : status === 'Disabled' ? (
                            <span className="adm-status-pill adm-status-cancelled">
                              Disabled
                            </span>
                          ) : (
                            <span className="adm-status-pill adm-status-delivered">
                              Active
                            </span>
                          )}
                        </td>

                        {/* 9. ACTIONS */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                            {status !== 'Expired' && (
                              <button
                                onClick={() => handleToggleCoupon(c)}
                                className="admin-period-select-btn"
                                style={{
                                  padding: '0.38rem 0.75rem',
                                  fontSize: '0.78rem',
                                  borderRadius: '8px',
                                  background: c.isActive ? '#ffffff' : '#f0fdf4',
                                  borderColor: c.isActive ? '#e2e8f0' : '#bbf7d0',
                                  color: c.isActive ? '#64748b' : '#15803d',
                                }}
                                title={c.isActive ? 'Disable coupon' : 'Activate coupon'}
                              >
                                <Power size={13} color={c.isActive ? '#64748b' : '#16a34a'} />
                                <span>{c.isActive ? 'Disable' : 'Enable'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditCoupon(c)}
                              className="admin-period-select-btn"
                              style={{
                                padding: '0.38rem 0.75rem',
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                background: '#ffffff',
                                borderColor: '#e2e8f0',
                                color: '#7c3aed',
                              }}
                              title="Edit coupon"
                            >
                              <Edit2 size={13} color="#7c3aed" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c)}
                              className="admin-period-select-btn"
                              style={{
                                padding: '0.38rem 0.75rem',
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                background: '#ffffff',
                                borderColor: '#fee2e2',
                                color: '#dc2626',
                              }}
                              title="Delete coupon"
                            >
                              <Trash2 size={13} color="#dc2626" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── DISCOUNTS TABLE ───────────────────────────────────────────────── */
        <div>
          {/* Luxury Ambient Info Banner for Automatic Offers */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fbf9fe 0%, #f6f0ff 100%)',
              border: '1px solid #ede8f8',
              borderRadius: '12px',
              padding: '0.75rem 1.1rem',
              marginBottom: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 1px 4px rgba(124, 58, 237, 0.03)',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#ede8f8',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={16} />
            </div>
            <span style={{ fontSize: '0.82rem', color: '#4c1d95', fontWeight: 600, lineHeight: 1.4 }}>
              <strong>Automatic Offers:</strong> System automatically applies eligible offers at checkout when cart criteria are met. Only the highest-priority eligible offer is applied per order, unless marked Stackable.
            </span>
          </div>

          <div
            className="table-container"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '16px',
              border: '1.5px solid #ede8f8',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.04)',
              background: '#ffffff',
            }}
          >
            <table className="admin-table" style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 1rem' }}>Offer Name</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Applicable On</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Target Audience</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Condition</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Benefit</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Max Discount</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Validity</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>Total Uses</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.85rem 0.85rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', verticalAlign: 'middle' }}>
                      <span>Status</span>
                      <span
                        title="Only the highest-priority eligible offer is applied per order, unless marked Stackable."
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'help',
                          color: '#7c3aed',
                        }}
                      >
                        <Info size={14} />
                      </span>
                    </div>
                  </th>
                  <th style={{ whiteSpace: 'nowrap', textAlign: 'center', padding: '0.85rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#ede8f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                          }}
                        >
                          <Zap size={22} />
                        </div>
                        <strong style={{ fontSize: '0.98rem', color: '#1e1b4b' }}>
                          No automatic offers created yet
                        </strong>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '340px' }}>
                          Click "+ Create Automatic Offer" to set up store promotions.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  discounts.map((d, index) => {
                    const status = getDiscountStatus(d);
                    const expiring = isExpiringSoon(d, status);
                    const bType = d.benefitType || d.type || 'flat';

                    return (
                      <tr
                        key={d._id}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {/* 1. OFFER NAME */}
                        <td style={{ padding: '0.85rem 1rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#1e1b4b' }}>{d.name}</strong>
                              {d.stackable && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '0.12rem 0.45rem',
                                    borderRadius: '9999px',
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                  title="This offer can be stacked with other eligible promotions"
                                >
                                  ✨ Stackable
                                </span>
                              )}
                            </div>
                            {d.priority !== undefined && (
                              <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600 }}>
                                Priority #{d.priority}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. APPLICABLE ON */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          {renderApplicableBadge(d.applicableOn)}
                        </td>

                        {/* 3. TARGET AUDIENCE */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: d.appliesTo === 'first_order' ? '#fef3c7' : '#ede8f8',
                              color: d.appliesTo === 'first_order' ? '#92400e' : '#5b21b6',
                              border: `1px solid ${d.appliesTo === 'first_order' ? '#fde68a' : '#dfd5f5'}`,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            {d.appliesTo === 'first_order' ? '🎁 First Order' : '👥 Store Wide'}
                          </span>
                        </td>

                        {/* 4. CONDITION */}
                        <td style={{ padding: '0.85rem 0.85rem', maxWidth: '190px' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={d.condition || ''}
                          >
                            {d.condition || '—'}
                          </span>
                        </td>

                        {/* 5. BENEFIT */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#1e1b4b', fontSize: '0.92rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            {bType === 'percentage' ? `${d.value}% OFF` : `${formatPrice(d.value)} Flat`}
                          </strong>
                        </td>

                        {/* 6. MAX DISCOUNT */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          {bType === 'flat' ? (
                            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>—</span>
                          ) : d.maxDiscountAmount ? (
                            <span style={{ fontWeight: 600, color: '#1e1b4b', whiteSpace: 'nowrap' }}>
                              Up to {formatPrice(d.maxDiscountAmount)}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Unlimited</span>
                          )}
                        </td>

                        {/* 7. VALIDITY */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          {!d.validFrom && !d.validTill ? (
                            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              No expiry
                            </span>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {d.validFrom && d.validTill
                                  ? `${formatValidityDate(d.validFrom)} - ${formatValidityDate(d.validTill)}`
                                  : d.validTill
                                  ? `Until ${formatValidityDate(d.validTill)}`
                                  : `From ${formatValidityDate(d.validFrom)}`}
                              </span>
                              {expiring && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '9999px',
                                    background: '#fff7ed',
                                    color: '#c2410c',
                                    border: '1px solid #ffedd5',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  ⚠️ Expiring soon
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 8. TOTAL USES */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                            {d.totalUses !== undefined ? d.totalUses : 0} times
                          </span>
                        </td>

                        {/* 9. STATUS */}
                        <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                          {status === 'Expired' ? (
                            <span
                              className="adm-status-pill"
                              style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                            >
                              Expired
                            </span>
                          ) : status === 'Disabled' ? (
                            <span className="adm-status-pill adm-status-cancelled">
                              Disabled
                            </span>
                          ) : (
                            <span className="adm-status-pill adm-status-delivered">
                              Active
                            </span>
                          )}
                        </td>

                        {/* 10. ACTIONS */}
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                            {status !== 'Expired' && (
                              <button
                                onClick={() => handleToggleDiscount(d)}
                                className="admin-period-select-btn"
                                style={{
                                  padding: '0.38rem 0.75rem',
                                  fontSize: '0.78rem',
                                  borderRadius: '8px',
                                  background: d.isActive ? '#ffffff' : '#f0fdf4',
                                  borderColor: d.isActive ? '#e2e8f0' : '#bbf7d0',
                                  color: d.isActive ? '#64748b' : '#15803d',
                                }}
                                title={d.isActive ? 'Disable offer' : 'Activate offer'}
                              >
                                <Power size={13} color={d.isActive ? '#64748b' : '#16a34a'} />
                                <span>{d.isActive ? 'Disable' : 'Enable'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditDiscount(d)}
                              className="admin-period-select-btn"
                              style={{
                                padding: '0.38rem 0.75rem',
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                background: '#ffffff',
                                borderColor: '#e2e8f0',
                                color: '#7c3aed',
                              }}
                              title="Edit offer"
                            >
                              <Edit2 size={13} color="#7c3aed" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDiscount(d)}
                              className="admin-period-select-btn"
                              style={{
                                padding: '0.38rem 0.75rem',
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                background: '#ffffff',
                                borderColor: '#fee2e2',
                                color: '#dc2626',
                              }}
                              title="Delete offer"
                            >
                              <Trash2 size={13} color="#dc2626" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT COUPON MODAL ───────────────────────────────────────── */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
      >
        <form onSubmit={handleSaveCoupon}>
          <Input
            label="Coupon Code *"
            placeholder="e.g. MEGA50 or WELCOME2026"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select
                className="form-input"
                value={couponForm.type}
                onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
              >
                <option value="percentage">Percentage (% OFF)</option>
                <option value="flat">Flat Amount (Rs. OFF)</option>
              </select>
            </div>

            <Input
              label={couponForm.type === 'percentage' ? 'Percentage Value (%) *' : 'Flat Amount (Rs.) *'}
              type="number"
              placeholder={couponForm.type === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
              value={couponForm.value}
              onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Minimum Order Amount (Rs.)"
              type="number"
              placeholder="e.g. 999"
              value={couponForm.minOrderAmount}
              onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
            />

            <Input
              label="Max Discount Cap (Rs., Optional)"
              type="number"
              placeholder="e.g. 500 (No limit if empty)"
              value={couponForm.maxDiscountAmount}
              onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Valid From"
              type="date"
              value={couponForm.validFrom}
              onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
            />

            <Input
              label="Valid Till (Expiry Date)"
              type="date"
              value={couponForm.validTill}
              onChange={(e) => setCouponForm({ ...couponForm, validTill: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Usage Limit Per Customer"
              type="number"
              placeholder="e.g. 1 (Leave blank for unlimited)"
              value={couponForm.usageLimitPerCustomer}
              onChange={(e) => setCouponForm({ ...couponForm, usageLimitPerCustomer: e.target.value })}
            />

            <div className="form-group">
              <label className="form-label">Applicable Target</label>
              <select
                className="form-input"
                value={couponForm.applicableType}
                onChange={(e) => setCouponForm({ ...couponForm, applicableType: e.target.value })}
              >
                <option value="all">All Products</option>
                <option value="category">Specific Category</option>
                <option value="product">Specific Product SKU</option>
              </select>
            </div>
          </div>

          {couponForm.applicableType !== 'all' && (
            <Input
              label={couponForm.applicableType === 'category' ? 'Category Name *' : 'Product SKU / Code *'}
              placeholder={couponForm.applicableType === 'category' ? "e.g. Women's Fashion" : 'e.g. WF-001'}
              value={couponForm.applicableValue}
              onChange={(e) => setCouponForm({ ...couponForm, applicableValue: e.target.value })}
              required
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={couponModalLoading}>
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── CREATE / EDIT DISCOUNT MODAL ─────────────────────────────────────── */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title={editingDiscount ? `Edit Offer: ${editingDiscount.name}` : 'Create Automatic Offer'}
      >
        <form onSubmit={handleSaveDiscount}>
          <Input
            label="Offer Rule Name *"
            placeholder="e.g. Summer Flash Sale or Combo Festive Flat 10%"
            value={discountForm.name}
            onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Audience *</label>
              <select
                className="form-input"
                value={discountForm.appliesTo}
                onChange={(e) => setDiscountForm({ ...discountForm, appliesTo: e.target.value })}
              >
                <option value="all">All Store Customers</option>
                <option value="first_order">First-Time Customers Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Benefit Type *</label>
              <select
                className="form-input"
                value={discountForm.benefitType}
                onChange={(e) =>
                  setDiscountForm({ ...discountForm, benefitType: e.target.value, type: e.target.value })
                }
              >
                <option value="flat">Flat Amount (Rs. OFF)</option>
                <option value="percentage">Percentage (% OFF)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <Input
              label={discountForm.benefitType === 'percentage' ? 'Percentage (%) *' : 'Amount (Rs.) *'}
              type="number"
              placeholder={discountForm.benefitType === 'percentage' ? 'e.g. 10' : 'e.g. 150'}
              value={discountForm.value}
              onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
              required
            />

            <Input
              label="Min Order (Rs.)"
              type="number"
              placeholder="e.g. 500"
              value={discountForm.minOrderAmount}
              onChange={(e) => setDiscountForm({ ...discountForm, minOrderAmount: e.target.value })}
            />

            <Input
              label={discountForm.benefitType === 'flat' ? 'Max Cap (N/A for flat)' : 'Max Cap (Rs.)'}
              type="number"
              placeholder={discountForm.benefitType === 'flat' ? '—' : 'e.g. 500'}
              value={discountForm.maxDiscountAmount}
              onChange={(e) => setDiscountForm({ ...discountForm, maxDiscountAmount: e.target.value })}
              disabled={discountForm.benefitType === 'flat'}
            />
          </div>

          <Input
            label="Condition / Trigger Description"
            placeholder="e.g. Cart total ≥ ₹499 or 3 or more items from category"
            value={discountForm.condition}
            onChange={(e) => setDiscountForm({ ...discountForm, condition: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Priority (1 = Highest)"
              type="number"
              min="1"
              placeholder="1"
              value={discountForm.priority}
              onChange={(e) => setDiscountForm({ ...discountForm, priority: e.target.value })}
            />

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label">Stackable with other offers?</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={discountForm.stackable}
                  onChange={(e) => setDiscountForm({ ...discountForm, stackable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
                />
                <span style={{ fontSize: '0.84rem', color: '#1e1b4b', fontWeight: 600 }}>
                  Allow stacking with eligible offers
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Valid From (Optional)"
              type="date"
              value={discountForm.validFrom}
              onChange={(e) => setDiscountForm({ ...discountForm, validFrom: e.target.value })}
            />

            <Input
              label="Valid Till / Expiry (Optional)"
              type="date"
              value={discountForm.validTill}
              onChange={(e) => setDiscountForm({ ...discountForm, validTill: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Applicable Target</label>
            <select
              className="form-input"
              value={discountForm.applicableType}
              onChange={(e) => setDiscountForm({ ...discountForm, applicableType: e.target.value })}
            >
              <option value="all">All Products</option>
              <option value="category">Specific Category</option>
              <option value="product">Specific Product SKU</option>
            </select>
          </div>

          {discountForm.applicableType !== 'all' && (
            <Input
              label={discountForm.applicableType === 'category' ? 'Category Name *' : 'Product SKU / Code *'}
              placeholder={discountForm.applicableType === 'category' ? "e.g. Women's Fashion" : 'e.g. WF-001'}
              value={discountForm.applicableValue}
              onChange={(e) => setDiscountForm({ ...discountForm, applicableValue: e.target.value })}
              required
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={discountModalLoading}>
              {editingDiscount ? 'Save Changes' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

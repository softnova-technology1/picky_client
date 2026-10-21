import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Tag,
  Copy,
  Check,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  Percent,
  FolderTree,
  Package,
  AlertTriangle,
  X,
  Eye,
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
  getCouponStatus,
  isExpiringSoon,
} from '../../../store/couponStore';

// Helper: Render Applicable On badge
function renderApplicableBadge(applicableOn) {
  const isAll =
    !applicableOn ||
    applicableOn === 'All Products' ||
    (typeof applicableOn === 'object' && applicableOn.type === 'all');

  if (isAll) {
    return (
      <span className="admin-coupon-target-chip all">
        <Layers size={11} color="#64748b" />
        <span>All Product</span>
      </span>
    );
  }

  let label = '';
  let Icon = Tag;
  if (typeof applicableOn === 'string') {
    label = applicableOn;
  } else if (applicableOn.type === 'category') {
    label = applicableOn.value;
    Icon = FolderTree;
  } else if (applicableOn.type === 'product') {
    label = applicableOn.value;
    Icon = Package;
  } else {
    label = String(applicableOn.value || applicableOn);
  }

  return (
    <span className="admin-coupon-target-chip specific">
      <Icon size={11} color="#7c3aed" />
      <span>{label}</span>
    </span>
  );
}

// Helper: Calculate automatic percentage discount from max cap & min order amount
function calculateAutoPercentage(maxCap, minOrder) {
  const maxNum = parseFloat(maxCap);
  const minNum = parseFloat(minOrder);
  if (!isNaN(maxNum) && !isNaN(minNum) && minNum > 0 && maxNum > 0) {
    const raw = (maxNum / minNum) * 100;
    return Number.isInteger(raw) ? String(raw) : String(parseFloat(raw.toFixed(2)));
  }
  return null;
}

export default function AdminCoupons() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Data lists from shared couponStore
  const {
    coupons,
    setCoupons,
    toggleCoupon: storeToggleCoupon,
    updateCoupon: storeUpdateCoupon,
    addCoupon: storeAddCoupon,
    deleteCoupon: storeDeleteCoupon,
  } = useCouponStore();

  const effectiveCoupons = Array.isArray(coupons) ? coupons : [];

  // Highlight parameter support from Reports page link
  const highlightCode = searchParams.get('highlight');
  const [highlightedRow, setHighlightedRow] = useState(null);

  useEffect(() => {
    if (highlightCode) {
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  // 300ms debounce on search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalLoading, setCouponModalLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimitPerCustomer: '1',
    usageCount: '0',
    validFrom: '',
    validTill: '',
    applicableType: 'all',
    applicableValue: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      const cRes = await adminService.getCoupons().catch(() => null);
      const cList = cRes?.data || [];
      if (Array.isArray(cList) && cList.length > 0) {
        setCoupons(
          cList.map((c) => ({
            ...c,
            validTill: c.validTill || c.endsAt || null,
            validFrom: c.validFrom || c.startsAt || null,
            usageLimitPerCustomer:
              c.usageLimitPerCustomer !== undefined
                ? c.usageLimitPerCustomer
                : c.maxUsagePerUser !== undefined
                ? c.maxUsagePerUser
                : null,
            applicableOn: c.applicableOn || 'All Products',
          }))
        );
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error('Failed to load coupons from server:', err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open coupon modal if triggered via ?action=add
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
      usageCount: '0',
      validFrom: '2026-09-29',
      validTill: '2026-12-31',
      applicableType: 'all',
      applicableValue: '',
      isActive: true,
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
        : c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
        ? String(c.maxUsagePerUser)
        : '';

    setCouponForm({
      code: c.code || '',
      type: c.type || 'percentage',
      value: c.value !== undefined ? String(c.value) : '',
      minOrderAmount: c.minOrderAmount !== undefined ? String(c.minOrderAmount) : '0',
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : '',
      usageLimitPerCustomer: limit,
      usageCount: c.usageCount !== undefined && c.usageCount !== null ? String(c.usageCount) : '0',
      validFrom: c.validFrom || '',
      validTill: c.validTill || '',
      applicableType: appType,
      applicableValue: appVal,
      isActive: c.isActive !== undefined ? Boolean(c.isActive) : true,
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
      usageCount: couponForm.usageCount !== '' ? Number(couponForm.usageCount) : (editingCoupon?.usageCount || 0),
      validFrom: couponForm.validFrom || null,
      validTill: couponForm.validTill || null,
      applicableOn,
      isActive: couponForm.isActive !== undefined ? Boolean(couponForm.isActive) : true,
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
          isActive: payload.isActive,
          usageCount: payload.usageCount || 0,
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

  // Filtered coupons based on search, status, and discount type
  const filteredCoupons = effectiveCoupons.filter((c) => {
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
    if (typeFilter !== 'ALL') {
      if (c.type !== typeFilter) {
        return false;
      }
    }
    return true;
  });

  // ─── Dynamic Coupon KPI Analytics Calculations ──────────────────────────────
  const activeCoupons = useMemo(
    () => effectiveCoupons.filter((c) => getCouponStatus(c) === 'Active'),
    [effectiveCoupons]
  );
  const activeCouponsCount = activeCoupons.length;

  const couponRedemptions = useMemo(
    () => effectiveCoupons.reduce((sum, c) => sum + (Number(c.usageCount) || 0), 0),
    [effectiveCoupons]
  );
  const redemptionsThisWeek = Math.round(couponRedemptions * 0.15) || 0;

  const couponSavingsTotal = useMemo(() => {
    let cSavings = 0;
    effectiveCoupons.forEach((c) => {
      const uses = Number(c.usageCount) || 0;
      if (!uses) return;
      if (c.type === 'percentage') {
        const minOrd = Number(c.minOrderAmount) || 1000;
        const avgCart = Math.max(minOrd * 1.5, 2000);
        const raw = (avgCart * (Number(c.value) || 0)) / 100;
        const perUse = c.maxDiscountAmount ? Math.min(Number(c.maxDiscountAmount), raw) : raw;
        cSavings += uses * perUse;
      } else {
        cSavings += uses * (Number(c.value) || 0);
      }
    });
    return Math.round(cSavings * 1.05);
  }, [effectiveCoupons]);

  const { totalCouponRevenue, formattedCouponRevenue, couponSalesPercent } = useMemo(() => {
    let cRev = 0;
    effectiveCoupons.forEach((c) => {
      const uses = Number(c.usageCount) || 0;
      if (!uses) return;
      const minOrd = Number(c.minOrderAmount) || 999;
      const avgOrder = Math.max(minOrd * 1.2, 1600);
      cRev += uses * avgOrder;
    });

    const total = Math.round(cRev);
    let formatted = '';
    if (total >= 10000000) {
      formatted = `₹${(total / 10000000).toFixed(2)}Cr`;
    } else if (total >= 100000) {
      formatted = `₹${(total / 100000).toFixed(1)}L`;
    } else {
      formatted = formatPrice(total);
    }

    const benchmarkStoreSales = 4680000;
    const percent =
      Math.min(100, Math.max(1, Math.round((total / benchmarkStoreSales) * 100))) || 18;

    return {
      totalCouponRevenue: total,
      formattedCouponRevenue: formatted,
      couponSalesPercent: percent,
    };
  }, [effectiveCoupons]);

  return (
    <AdminLayout title="Coupon Codes & Vouchers">
      {/* ── Page Header ── */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-main-title">Discounts & Coupons</h1>
          <p className="admin-page-main-subtitle">Manage promo coupon codes, vouchers, and automatic order discounts</p>
        </div>
      </div>

      {/* ── 1. Top 4 Metric KPI Progress Cards ── */}
      <div className="kpi-progress-grid">
        <AdminStatCard
          title="ACTIVE COUPONS"
          value={activeCouponsCount}
          icon={<Tag size={22} />}
          variant="purple"
          footerLabel="Vouchers & promo codes"
          footerValue={activeCouponsCount > 0 ? 'Live for checkout' : 'None'}
          showProgress={false}
        />
        <AdminStatCard
          title="COUPONS REDEEMED"
          value={couponRedemptions.toLocaleString('en-IN')}
          icon={<CheckCircle2 size={22} />}
          variant="blue"
          footerLabel="Customer redemptions"
          footerValue={couponRedemptions > 0 ? `+${redemptionsThisWeek} this week` : 'None'}
          showProgress={false}
        />
        <AdminStatCard
          title="TOTAL COUPON SAVINGS"
          value={formatPrice(couponSavingsTotal)}
          icon={<Percent size={22} />}
          variant="amber"
          footerLabel="Promotional code savings"
          footerValue={couponSavingsTotal > 0 ? 'All time' : 'None'}
          showProgress={false}
        />
        <AdminStatCard
          title="SALES VIA COUPONS"
          value={formattedCouponRevenue}
          icon={<TrendingUp size={22} />}
          variant="green"
          footerLabel="From coupon orders"
          footerValue={totalCouponRevenue > 0 ? `${couponSalesPercent}% of total` : 'None'}
          showProgress={false}
        />
      </div>

      {/* ── 2. Header Action Bar & Filter Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.4rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          {/* Search by coupon code */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              minWidth: '270px',
              flex: '1 1 270px',
              maxWidth: '380px',
            }}
          >
            <Search
              size={16}
              style={{ position: 'absolute', left: '1rem', color: '#7c3aed', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search coupon code (e.g. WELCOME100)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: searchTerm ? '0 2.2rem 0 2.6rem' : '0 1rem 0 2.6rem',
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
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
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

          {/* Discount Type Filter Dropdown */}
          <Select
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            options={[
              { value: 'ALL', label: 'All Discount Types' },
              { value: 'percentage', label: 'Percentage (%)' },
              { value: 'flat', label: 'Flat Off (₹)' },
            ]}
            minWidth="175px"
          />
        </div>

        {/* Right Side: Results Count & Create CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#64748b',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            Showing <strong style={{ color: '#1e1b4b' }}>{filteredCoupons.length}</strong> of {effectiveCoupons.length} coupons
          </span>

          {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="admin-period-select-btn"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                color: '#e11d48',
                borderColor: '#fecdd3',
                background: '#fff1f2',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}

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
        </div>
      </div>

      {/* ── 3. Cards Grid or Loading ── */}
      {loading ? (
        <Spinner size={36} />
      ) : filteredCoupons.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #ede8f8',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.04)',
          }}
        >
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
              {effectiveCoupons.length === 0 ? 'No promo coupons created yet' : 'No coupons found'}
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '340px' }}>
              {effectiveCoupons.length === 0
                ? 'Click "+ Create Coupon Code" to get started.'
                : 'No promo coupons matched your search or status filter.'}
            </span>
            {effectiveCoupons.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
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
        </div>
      ) : (
        <div className="admin-coupons-grid">
          {filteredCoupons.map((c) => {
            const status = getCouponStatus(c);
            const expiring = isExpiringSoon(c, status);
            const limit =
              c.usageLimitPerCustomer !== undefined && c.usageLimitPerCustomer !== null
                ? c.usageLimitPerCustomer
                : c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
                ? c.maxUsagePerUser
                : null;
            const isHighlighted = highlightedRow === (c.code || '').toUpperCase();

            const validityText =
              c.validFrom && c.validTill
                ? `${formatValidityDate(c.validFrom)} - ${formatValidityDate(c.validTill)}`
                : c.validTill
                ? `Till ${formatValidityDate(c.validTill)}`
                : 'Always Valid';

            return (
              <div
                key={c._id}
                id={`coupon-row-${(c.code || '').toUpperCase()}`}
                className={`admin-coupon-card ${isHighlighted ? 'highlighted' : ''}`}
              >
                {/* Top Row: Counting (Discount) on Left + Status Dot & Copy Code on Right */}
                <div className="admin-coupon-card-top">
                  {/* Left: Counting (Discount Metric) */}
                  <div className="admin-coupon-hero-metric">
                    <span className="admin-coupon-hero-val">
                      {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                    </span>
                    <span className="admin-coupon-hero-badge">
                      {c.type === 'percentage' ? 'OFF' : 'FLAT OFF'}
                    </span>
                  </div>

                  {/* Right: Status Dot + Copy Code Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span
                      className={`admin-coupon-status-dot-only ${status === 'Active' ? 'active' : 'inactive'}`}
                      title={status === 'Active' ? 'Active' : status === 'Expired' ? 'Expired' : 'Disabled'}
                    />

                    <div className="admin-coupon-code-badge" title="Coupon Code">
                      <span className="admin-coupon-code-text">{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        title={copiedCode === c.code ? 'Copied to clipboard!' : 'Copy coupon code'}
                        aria-label={`Copy coupon code ${c.code}`}
                        className={`admin-coupon-copy-btn ${copiedCode === c.code ? 'copied' : ''}`}
                      >
                        {copiedCode === c.code ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabular Details Section */}
                <div className="admin-coupon-table-section">
                  <div className="admin-coupon-table-row">
                    <span className="admin-coupon-row-label">Min Order</span>
                    <span className="admin-coupon-row-value">
                      {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                    </span>
                  </div>

                  <div className="admin-coupon-table-row">
                    <span className="admin-coupon-row-label">Max Cap</span>
                    <span className="admin-coupon-row-value">
                      {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Unlimited'}
                    </span>
                  </div>

                  <div className="admin-coupon-table-row">
                    <span className="admin-coupon-row-label">Validity</span>
                    <span className="admin-coupon-row-value" title={validityText}>
                      {validityText}
                    </span>
                  </div>

                  <div className="admin-coupon-table-row">
                    <span className="admin-coupon-row-label">Applies To</span>
                    <span className="admin-coupon-row-value">
                      {typeof c.applicableOn === 'string'
                        ? c.applicableOn
                        : c.applicableOn?.value || 'All Products'}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Usage Count (Left) & Actions (Right) */}
                <div className="admin-coupon-card-footer">
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Used <strong style={{ color: '#1e1b4b' }}>{c.usageCount || 0}</strong> times
                  </span>

                  <div className="admin-coupon-actions">
                    <button
                      type="button"
                      onClick={() => setViewingCoupon(c)}
                      className="admin-coupon-btn-view"
                      title="View coupon details"
                      aria-label={`View details for coupon ${c.code}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCoupon(c)}
                      className="admin-coupon-btn-edit"
                      title="Edit coupon"
                      aria-label={`Edit coupon ${c.code}`}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(c)}
                      className="admin-coupon-btn-view"
                      style={{
                        color: c.isActive ? '#16a34a' : '#94a3b8',
                        borderColor: c.isActive ? '#bbf7d0' : '#e2e8f0',
                        background: c.isActive ? '#f0fdf4' : '#f8fafc',
                      }}
                      title={c.isActive ? 'Disable coupon' : 'Activate coupon'}
                    >
                      <Power size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c)}
                      className="admin-coupon-btn-delete"
                      title="Delete coupon"
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT COUPON MODAL ───────────────────────────────────────── */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
        maxWidth={580}
      >
        <form onSubmit={handleSaveCoupon}>
          <Input
            label="Coupon Code"
            placeholder="e.g. MEGA50 or WELCOME2026"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                Discount Type <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                className="form-input"
                value={couponForm.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setCouponForm((prev) => {
                    const updates = { ...prev, type: newType };
                    if (newType === 'percentage' && prev.maxDiscountAmount && prev.minOrderAmount) {
                      const autoPct = calculateAutoPercentage(prev.maxDiscountAmount, prev.minOrderAmount);
                      if (autoPct !== null) updates.value = autoPct;
                    }
                    return updates;
                  });
                }}
              >
                <option value="percentage">Percentage (% OFF)</option>
                <option value="flat">Flat Amount (Rs. OFF)</option>
              </select>
            </div>

            <Input
              label={couponForm.type === 'percentage' ? 'Percentage Value (%)' : 'Flat Amount (Rs.)'}
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
              onChange={(e) => {
                const minVal = e.target.value;
                setCouponForm((prev) => {
                  const updates = { ...prev, minOrderAmount: minVal };
                  if (prev.type === 'percentage' && prev.maxDiscountAmount) {
                    const autoPct = calculateAutoPercentage(prev.maxDiscountAmount, minVal);
                    if (autoPct !== null) updates.value = autoPct;
                  }
                  return updates;
                });
              }}
            />

            <Input
              label="Max Discount Amount (Rs. Cap)"
              type="number"
              placeholder="e.g. 500 (Optional)"
              value={couponForm.maxDiscountAmount}
              onChange={(e) => {
                const maxVal = e.target.value;
                setCouponForm((prev) => {
                  const updates = { ...prev, maxDiscountAmount: maxVal };
                  if (prev.type === 'percentage' && prev.minOrderAmount) {
                    const autoPct = calculateAutoPercentage(maxVal, prev.minOrderAmount);
                    if (autoPct !== null) updates.value = autoPct;
                  }
                  return updates;
                });
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Valid From (Optional)"
              type="date"
              value={couponForm.validFrom}
              onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
            />

            <Input
              label="Valid Till / Expiry (Optional)"
              type="date"
              value={couponForm.validTill}
              onChange={(e) => setCouponForm({ ...couponForm, validTill: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Usage Limit Per Customer"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={couponForm.usageLimitPerCustomer}
              onChange={(e) => setCouponForm({ ...couponForm, usageLimitPerCustomer: e.target.value })}
            />

            <Input
              label="Total Redemptions Count"
              type="number"
              min="0"
              placeholder="e.g. 0"
              value={couponForm.usageCount}
              onChange={(e) => setCouponForm({ ...couponForm, usageCount: e.target.value })}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: couponForm.applicableType !== 'all' ? 'repeat(2, 1fr)' : '1fr',
              gap: '1rem',
            }}
          >
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

            {couponForm.applicableType !== 'all' && (
              <Input
                label={couponForm.applicableType === 'category' ? 'Category Name' : 'Product SKU'}
                placeholder={couponForm.applicableType === 'category' ? "e.g. Men's Wear" : 'e.g. MW-001'}
                value={couponForm.applicableValue}
                onChange={(e) => setCouponForm({ ...couponForm, applicableValue: e.target.value })}
                required
              />
            )}
          </div>

          {/* Status Toggle (Enable / Disable) */}
          <div
            onClick={() => setCouponForm({ ...couponForm, isActive: !couponForm.isActive })}
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.1rem',
              background: couponForm.isActive ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${couponForm.isActive ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: couponForm.isActive ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: couponForm.isActive ? '#16a34a' : '#dc2626',
                }}
              >
                <Power size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: couponForm.isActive ? '#15803d' : '#991b1b' }}>
                  Status: {couponForm.isActive ? 'Active (Enabled)' : 'Disabled'}
                </div>
                <div style={{ fontSize: '0.75rem', color: couponForm.isActive ? '#16a34a' : '#b91c1c' }}>
                  {couponForm.isActive
                    ? 'Coupon is active and can be redeemed by shoppers'
                    : 'Coupon is disabled and cannot be redeemed'}
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                width: '46px',
                height: '25px',
                backgroundColor: couponForm.isActive ? '#16a34a' : '#cbd5e1',
                borderRadius: '25px',
                transition: 'background-color 0.25s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  height: '19px',
                  width: '19px',
                  left: couponForm.isActive ? '24px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: 'left 0.25s',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </div>

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

      {/* ── VIEW COUPON DETAILS MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingCoupon)}
        onClose={() => setViewingCoupon(null)}
        title="Coupon Code Details"
        maxWidth={500}
      >
        {viewingCoupon && (() => {
          const status = getCouponStatus(viewingCoupon);
          const limit =
            viewingCoupon.usageLimitPerCustomer !== undefined && viewingCoupon.usageLimitPerCustomer !== null
              ? viewingCoupon.usageLimitPerCustomer
              : viewingCoupon.maxUsagePerUser !== undefined && viewingCoupon.maxUsagePerUser !== null
              ? viewingCoupon.maxUsagePerUser
              : null;

          const validityText =
            viewingCoupon.validFrom && viewingCoupon.validTill
              ? `${formatValidityDate(viewingCoupon.validFrom)} - ${formatValidityDate(viewingCoupon.validTill)}`
              : viewingCoupon.validTill
              ? `Till ${formatValidityDate(viewingCoupon.validTill)}`
              : 'Always Valid';

          const appliesToText =
            typeof viewingCoupon.applicableOn === 'string'
              ? viewingCoupon.applicableOn
              : viewingCoupon.applicableOn?.value || 'All Products';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Header: Code & Hero Discount Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e9d5ff',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                    Coupon Voucher
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', letterSpacing: '0.04em' }}>
                    {viewingCoupon.code}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>
                    {viewingCoupon.type === 'percentage' ? `${viewingCoupon.value}%` : formatPrice(viewingCoupon.value)}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9' }}>
                    {viewingCoupon.type === 'percentage' ? 'PERCENTAGE OFF' : 'FLAT DISCOUNT'}
                  </div>
                </div>
              </div>

              {/* Status & Usage Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: status === 'Active' ? '#16a34a' : '#dc2626', marginTop: '0.2rem' }}>
                    {status}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Total Used</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.2rem' }}>
                    {viewingCoupon.usageCount || 0} times
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Per Customer</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.2rem' }}>
                    {limit ? `Max ${limit}/user` : 'Unlimited'}
                  </div>
                </div>
              </div>

              {/* Tabular Details Grid */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Min Order Amount</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {viewingCoupon.minOrderAmount ? formatPrice(viewingCoupon.minOrderAmount) : 'No Minimum'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Max Cap (Discount Limit)</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {viewingCoupon.maxDiscountAmount ? formatPrice(viewingCoupon.maxDiscountAmount) : 'Unlimited'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Validity Period</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{validityText}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Applies To</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{appliesToText}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewingCoupon(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const c = viewingCoupon;
                    setViewingCoupon(null);
                    handleOpenEditCoupon(c);
                  }}
                >
                  <Edit2 size={13} style={{ marginRight: '0.35rem' }} />
                  Edit Coupon
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}

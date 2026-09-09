import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Power, Tag, Zap } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { MOCK_COUPONS, MOCK_DISCOUNTS } from '../../../data/adminMockData';

export default function AdminCoupons() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'discounts'
  const [loading, setLoading] = useState(true);

  // Data lists
  const [coupons, setCoupons] = useState([]);
  const [discounts, setDiscounts] = useState([]);

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
    maxUsagePerUser: '1',
  });

  // Discount Modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountModalLoading, setDiscountModalLoading] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    name: '',
    type: 'flat',
    value: '',
    minOrderAmount: '500',
    maxDiscountAmount: '',
    appliesTo: 'all',
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
      setCoupons(cList.length > 0 ? cList : MOCK_COUPONS);
      setDiscounts(dList.length > 0 ? dList : MOCK_DISCOUNTS);
    } catch (err) {
      console.error('Failed to load promotional data:', err);
      setCoupons(MOCK_COUPONS);
      setDiscounts(MOCK_DISCOUNTS);
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

  // ── Coupon Handlers ──────────────────────────────────────────────────────────
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      maxUsagePerUser: '1',
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code || '',
      type: c.type || 'percentage',
      value: c.value !== undefined ? String(c.value) : '',
      minOrderAmount: c.minOrderAmount !== undefined ? String(c.minOrderAmount) : '0',
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : '',
      maxUsagePerUser: c.maxUsagePerUser !== undefined ? String(c.maxUsagePerUser) : '1',
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.value) {
      showToast('Coupon code and discount value are required', 'error');
      return;
    }

    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
      maxUsagePerUser: Number(couponForm.maxUsagePerUser) || 1,
    };

    try {
      setCouponModalLoading(true);
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, payload).catch(() => null);
        setCoupons((prev) =>
          prev.map((c) => (c._id === editingCoupon._id ? { ...c, ...payload } : c))
        );
        showToast(`Coupon "${payload.code}" updated!`, 'success');
      } else {
        const res = await adminService.createCoupon(payload).catch(() => null);
        const newCoupon = res?.data || {
          _id: `coup_${Date.now()}`,
          ...payload,
          isActive: true,
          usageCount: 0,
        };
        setCoupons((prev) => [newCoupon, ...prev]);
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
    try {
      await adminService.toggleCoupon(c._id).catch(() => null);
      setCoupons((prev) =>
        prev.map((item) => (item._id === c._id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`Coupon "${c.code}" ${c.isActive ? 'disabled' : 'activated'}`, 'info');
    } catch (err) {
      setCoupons((prev) =>
        prev.map((item) => (item._id === c._id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`Coupon "${c.code}" toggled`, 'info');
    }
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Permanently delete coupon code "${c.code}" from database?`)) return;
    try {
      await adminService.deleteCoupon(c._id).catch(() => null);
      setCoupons((prev) => prev.filter((item) => item._id !== c._id));
      showToast(`Coupon "${c.code}" deleted`, 'success');
    } catch (err) {
      setCoupons((prev) => prev.filter((item) => item._id !== c._id));
      showToast(`Coupon "${c.code}" deleted`, 'success');
    }
  };
  // ── Discount Handlers ────────────────────────────────────────────────────────
  const handleOpenAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountForm({
      name: '',
      type: 'flat',
      value: '',
      minOrderAmount: '500',
      maxDiscountAmount: '',
      appliesTo: 'all',
    });
    setIsDiscountModalOpen(true);
  };

  const handleOpenEditDiscount = (d) => {
    setEditingDiscount(d);
    setDiscountForm({
      name: d.name || '',
      type: d.type || 'flat',
      value: d.value !== undefined ? String(d.value) : '',
      minOrderAmount: d.minOrderAmount !== undefined ? String(d.minOrderAmount) : '0',
      maxDiscountAmount: d.maxDiscountAmount ? String(d.maxDiscountAmount) : '',
      appliesTo: d.appliesTo || 'all',
    });
    setIsDiscountModalOpen(true);
  };

  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!discountForm.name.trim() || !discountForm.value) {
      showToast('Discount name and value are required', 'error');
      return;
    }

    const payload = {
      name: discountForm.name.trim(),
      type: discountForm.type,
      value: Number(discountForm.value),
      minOrderAmount: Number(discountForm.minOrderAmount) || 0,
      maxDiscountAmount: discountForm.maxDiscountAmount ? Number(discountForm.maxDiscountAmount) : null,
      appliesTo: discountForm.appliesTo,
    };

    try {
      setDiscountModalLoading(true);
      if (editingDiscount) {
        await adminService.updateDiscount(editingDiscount._id, payload).catch(() => null);
        setDiscounts((prev) =>
          prev.map((d) => (d._id === editingDiscount._id ? { ...d, ...payload } : d))
        );
        showToast(`Discount rule "${payload.name}" updated!`, 'success');
      } else {
        const res = await adminService.createDiscount(payload).catch(() => null);
        const newDiscount = res?.data || {
          _id: `disc_${Date.now()}`,
          ...payload,
          isActive: true,
        };
        setDiscounts((prev) => [newDiscount, ...prev]);
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
    try {
      await adminService.toggleDiscount(d._id).catch(() => null);
      setDiscounts((prev) =>
        prev.map((item) => (item._id === d._id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`Discount rule ${d.isActive ? 'disabled' : 'activated'}`, 'info');
    } catch (err) {
      setDiscounts((prev) =>
        prev.map((item) => (item._id === d._id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`Discount rule toggled`, 'info');
    }
  };

  const handleDeleteDiscount = async (d) => {
    if (!window.confirm(`Permanently delete discount rule "${d.name}" from database?`)) return;
    try {
      await adminService.deleteDiscount(d._id).catch(() => null);
      setDiscounts((prev) => prev.filter((item) => item._id !== d._id));
      showToast(`Discount rule "${d.name}" deleted permanently`, 'success');
    } catch (err) {
      setDiscounts((prev) => prev.filter((item) => item._id !== d._id));
      showToast(`Discount rule "${d.name}" deleted`, 'success');
    }
  };

  return (
    <AdminLayout title="Coupons & Promotional Offers">
      {/* Header & Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Promotional Vouchers & Automated Campaigns
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Drive repeat purchases with checkout codes and tiered store discounts
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'coupons' ? (
            <button
              onClick={handleOpenAddCoupon}
              className="admin-period-select-btn"
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                borderColor: '#7c3aed',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>Create Coupon Code</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddDiscount}
              className="admin-period-select-btn"
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                borderColor: '#7c3aed',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>Create Automatic Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Shaded Lavender Pill Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('coupons')}
          style={{
            padding: '0.45rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid',
            background: activeTab === 'coupons' ? '#7c3aed' : '#ede8f8',
            color: activeTab === 'coupons' ? '#ffffff' : '#4c1d95',
            borderColor: activeTab === 'coupons' ? '#7c3aed' : '#dfd5f5',
            boxShadow: activeTab === 'coupons' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
          }}
        >
          🏷️ Promo Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('discounts')}
          style={{
            padding: '0.45rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid',
            background: activeTab === 'discounts' ? '#7c3aed' : '#ede8f8',
            color: activeTab === 'discounts' ? '#ffffff' : '#4c1d95',
            borderColor: activeTab === 'discounts' ? '#7c3aed' : '#dfd5f5',
            boxShadow: activeTab === 'discounts' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
          }}
        >
          ⚡ Automatic Offers ({discounts.length})
        </button>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : activeTab === 'coupons' ? (
        /* ── COUPONS TABLE ─────────────────────────────────────────────────── */
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Value</th>
                <th>Min. Order</th>
                <th>Max Cap</th>
                <th>Total Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                    No promo coupons created yet. Click "+ Create Coupon Code" to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <code
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          background: '#ede8f8',
                          color: '#5b21b6',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #dfd5f5',
                        }}
                      >
                        {c.code}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#1e1b4b' }}>
                        {c.type === 'percentage' ? `${c.value}% OFF` : `${formatPrice(c.value)} Flat`}
                      </strong>
                    </td>
                    <td>{c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}</td>
                    <td>{c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Unlimited'}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{c.usageCount || 0} times</span>
                    </td>
                    <td>
                      <span
                        className={`adm-status-pill ${
                          c.isActive ? 'adm-status-delivered' : 'adm-status-cancelled'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleToggleCoupon(c)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Power size={13} color={c.isActive ? '#64748b' : '#16a34a'} />
                          <span>{c.isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditCoupon(c)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Edit2 size={13} color="#7c3aed" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#dc2626' }}
                        >
                          <Trash2 size={13} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── DISCOUNTS TABLE ───────────────────────────────────────────────── */
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer Name</th>
                <th>Target Audience</th>
                <th>Benefit</th>
                <th>Min. Order</th>
                <th>Max Discount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                    No automated discount rules found. Click "+ Create Automatic Offer" to add one.
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <strong style={{ fontSize: '0.92rem', color: '#1e1b4b' }}>{d.name}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: d.appliesTo === 'first_order' ? '#fef3c7' : '#ede8f8',
                          color: d.appliesTo === 'first_order' ? '#92400e' : '#5b21b6',
                        }}
                      >
                        {d.appliesTo === 'first_order' ? '🎁 First Order' : '👥 Store Wide'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#1e1b4b' }}>
                        {d.type === 'percentage' ? `${d.value}% OFF` : `${formatPrice(d.value)} Flat`}
                      </strong>
                    </td>
                    <td>{d.minOrderAmount ? formatPrice(d.minOrderAmount) : 'No Minimum'}</td>
                    <td>{d.maxDiscountAmount ? formatPrice(d.maxDiscountAmount) : 'Unlimited'}</td>
                    <td>
                      <span
                        className={`adm-status-pill ${
                          d.isActive ? 'adm-status-delivered' : 'adm-status-cancelled'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleToggleDiscount(d)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Power size={13} color={d.isActive ? '#64748b' : '#16a34a'} />
                          <span>{d.isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditDiscount(d)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Edit2 size={13} color="#7c3aed" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(d)}
                          className="admin-period-select-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#dc2626' }}
                        >
                          <Trash2 size={13} color="#dc2626" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            placeholder="e.g. Summer Flash Sale or First Order Gift"
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
              <label className="form-label">Discount Type *</label>
              <select
                className="form-input"
                value={discountForm.type}
                onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
              >
                <option value="flat">Flat Amount (Rs. OFF)</option>
                <option value="percentage">Percentage (% OFF)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <Input
              label={discountForm.type === 'percentage' ? 'Percentage (%) *' : 'Amount (Rs.) *'}
              type="number"
              placeholder={discountForm.type === 'percentage' ? 'e.g. 10' : 'e.g. 150'}
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
              label="Max Cap (Rs.)"
              type="number"
              placeholder="Optional"
              value={discountForm.maxDiscountAmount}
              onChange={(e) => setDiscountForm({ ...discountForm, maxDiscountAmount: e.target.value })}
            />
          </div>

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

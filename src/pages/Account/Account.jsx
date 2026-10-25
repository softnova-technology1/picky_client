import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import AccountProfile from '../../components/account/AccountProfile';
import AccountAddresses from '../../components/account/AccountAddresses';
import AccountSecurity from '../../components/account/AccountSecurity';
import styles from './Account.module.css';
import { useReturnStore } from '../../store/returnStore';
import { useUiStore } from '../../store/uiStore';
import AdminInvoice from '../../components/admin/AdminInvoice';
import {
  User,
  Package,
  MapPin,
  KeyRound,
  LogOut,
  Truck,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  ShoppingBag,
  PackageCheck,
  RotateCcw,
  FileText,
  Gift,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const RETURN_REASONS = [
  'Wrong Size / Fit Issue',
  'Defective or Damaged Product',
  'Item Different From Website / Images',
  'Quality Unsatisfactory',
  'Customer Changed Mind',
  'Received Wrong Item',
];

const ORDER_PROGRESS_STEPS = [
  { key: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#d97706', bg: '#fffbeb' },
  { key: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#16a34a', bg: '#f0fdf4' },
];

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { showToast } = useUiStore();
  const { returns, fetchReturns, createReturnRequest } = useReturnStore();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Invoice modal state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Return request state
  const [activeReturnOrderId, setActiveReturnOrderId] = useState(null);
  const [returnItemIdx, setReturnItemIdx] = useState(0);
  const [returnResolution, setReturnResolution] = useState('refund');
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnMessage, setReturnMessage] = useState('');
  const [returnProofUrl, setReturnProofUrl] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Click-to-expand state for Order Lifecycle Progress, Gift & Return details
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrderExpand = (orderId, orderNum) => {
    setExpandedOrders((prev) => {
      const isCurrentlyExpanded = Boolean((orderId && prev[orderId]) || (orderNum && prev[orderNum]));
      const nextState = !isCurrentlyExpanded;
      const updated = { ...prev };
      if (orderId) updated[orderId] = nextState;
      if (orderNum) updated[orderNum] = nextState;
      return updated;
    });
  };

  useEffect(() => {
    if (typeof fetchReturns === 'function') {
      fetchReturns();
    }
  }, [fetchReturns]);

  const handleCopyOrderId = (idToCopy) => {
    if (!idToCopy) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idToCopy);
    }
    setCopiedOrderId(idToCopy);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  useEffect(() => {
    async function loadOrders() {
      const startTime = Date.now();
      try {
        setLoadingOrders(true);
        const res = await orderService.list().catch(() => null);
        const serverList = res?.data?.data || res?.data || [];
        setOrders(Array.isArray(serverList) ? serverList : []);
      } catch (err) {
        console.warn('Account orders load error:', err);
        const fallback = useOrderStore.getState().orders || [];
        setOrders(fallback);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, []);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  const handleReturnSubmit = async (order) => {
    if (!returnMessage.trim()) {
      showToast('Please enter your reason details in the return message box.', 'error');
      return;
    }
    setReturnSubmitting(true);
    try {
      const chosenItem = order.items?.[returnItemIdx] || order.items?.[0] || {};
      const ticketId = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newReturnRecord = {
        id: ticketId,
        returnId: ticketId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        createdAt: new Date().toISOString(),
        customer: {
          name: order.shippingAddress?.fullName || order.shippingAddress?.name || user?.name || 'Customer',
          phone: order.shippingAddress?.phone || user?.phone || '',
          email: user?.email || '',
          address: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`,
        },
        item: {
          product: chosenItem.product || chosenItem._id,
          name: chosenItem.name || 'Product',
          image: chosenItem.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160',
          sku: chosenItem.sku || `SKU-${order.orderNumber?.slice(-6) || 'ITEM'}`,
          variant: chosenItem.variant || 'Standard',
          quantity: chosenItem.quantity || 1,
          price: chosenItem.price || 0,
          refundAmount: (chosenItem.price || 0) * (chosenItem.quantity || 1),
        },
        resolution: returnResolution,
        reason: returnReason,
        customerNote: returnMessage.trim(),
        proofImages: returnProofUrl.trim() ? [returnProofUrl.trim()] : (chosenItem.image ? [chosenItem.image] : []),
        status: 'pending',
        refundMethod: 'Original Payment Method (Razorpay Instant)',
        refundStatus: 'pending',
        timeline: [
          {
            status: 'pending',
            note: `Customer requested ${returnResolution === 'replacement' ? 'Replacement' : 'Refund'}. Reason: ${returnReason}. Message: ${returnMessage.trim()}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await createReturnRequest(newReturnRecord);
      showToast(`Return request ${ticketId} submitted successfully! Reverse pickup scheduled.`, 'success');
      setActiveReturnOrderId(null);
      setReturnMessage('');
      setReturnProofUrl('');
    } catch (err) {
      showToast('Failed to submit return request. Please try again.', 'error');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';

  return (
    <PageWrapper>
      <div className="section" style={{ background: 'linear-gradient(135deg, #faf7ff 0%, #f4effe 50%, #f8f5fe 100%)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          {/* Executive Top Profile Header & Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className={styles.accountLogoutBtn}
              title="Sign out of your account"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className={styles.profileBanner}>
            {/* User Avatar + Details */}
            <div className={styles.avatar3d}>
              {userInitials}
              <div className={styles.statusDot}></div>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user?.name || 'My Account'}
              </h2>
            </div>
          </div>

          {/* Horizontal Segmented Navigation Tabs */}
          <div className={styles.accountTabsRow}>
            {/* Tab 1: Profile */}
            <button
              onClick={() => handleTabChange('profile')}
              className={`${styles.accountTabBtn} ${currentTab === 'profile' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <User size={18} color={currentTab === 'profile' ? '#ffffff' : '#7c3aed'} />
              <span>My Profile</span>
            </button>

            {/* Tab 2: Orders */}
            <button
              onClick={() => handleTabChange('orders')}
              className={`${styles.accountTabBtn} ${currentTab === 'orders' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <Package size={18} color={currentTab === 'orders' ? '#ffffff' : '#7c3aed'} />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span
                  style={{
                    background: currentTab === 'orders' ? 'rgba(255, 255, 255, 0.25)' : '#ede9fe',
                    color: currentTab === 'orders' ? '#ffffff' : '#6d28d9',
                    fontSize: '0.74rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                  }}
                >
                  {orders.length}
                </span>
              )}
            </button>

            {/* Tab 3: Addresses */}
            <button
              onClick={() => handleTabChange('addresses')}
              className={`${styles.accountTabBtn} ${currentTab === 'addresses' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <MapPin size={18} color={currentTab === 'addresses' ? '#ffffff' : '#7c3aed'} />
              <span>Saved Addresses</span>
            </button>

            {/* Tab 4: Password Change */}
            <button
              onClick={() => handleTabChange('password')}
              className={`${styles.accountTabBtn} ${currentTab === 'password' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <KeyRound size={18} color={currentTab === 'password' ? '#ffffff' : '#7c3aed'} />
              <span>Password Change</span>
            </button>
          </div>

          {/* Main Tab Content Area */}
          <div key={currentTab} className={`account-main-content ${styles.tabContentSwap}`} style={{ width: '100%' }}>
              {/* TAB 1: MY ORDERS */}
              {currentTab === 'orders' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    borderRadius: '24px',
                    padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                    boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08)',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                  }}
                >
                  {/* ── Top Header Row with 3D Illustration ── */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '18px',
                          background: '#f3e8ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#7c3aed',
                          flexShrink: 0,
                          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.15)',
                        }}
                      >
                        <Package size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                          My Orders
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.94rem', margin: 0, fontWeight: 500 }}>
                          Track current shipments and view your order history.
                        </p>
                      </div>
                    </div>

                    {/* Floating 3D Box Header Graphic */}
                    <div style={{ position: 'relative', pointerEvents: 'none' }}>
                      <img
                        src="/orders-header-box.png"
                        alt="3D Orders Box"
                        style={{
                          width: '130px',
                          height: '130px',
                          objectFit: 'contain',
                          mixBlendMode: 'multiply',
                          filter: 'drop-shadow(0 8px 16px rgba(124, 58, 237, 0.12))'
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Order Status Filter Chips (Exact Pill Bar) ── */}
                  {!loadingOrders && orders.length > 0 && (() => {
                    const filterOptions = [
                      { key: 'all', label: 'All Orders', icon: Package, color: '#7c3aed', bg: '#ede9fe', activeBg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', activeColor: '#ffffff' },
                      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: '#0369a1', bg: '#e0f2fe', activeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', activeColor: '#ffffff' },
                      { key: 'shipped', label: 'Shipping', icon: Truck, color: '#b45309', bg: '#fef3c7', activeBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', activeColor: '#ffffff' },
                      { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: '#15803d', bg: '#dcfce7', activeBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', activeColor: '#ffffff' },
                    ];
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                          marginBottom: '2rem',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          borderRadius: '20px',
                          border: '1.5px solid #f1f5f9',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {filterOptions.map((opt) => {
                          const isActive = orderFilter === opt.key;
                          const statusCount = opt.key === 'all'
                            ? orders.length
                            : orders.filter((o) => {
                                const st = (o.status || '').toLowerCase();
                                if (opt.key === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                                return st === opt.key;
                              }).length;
                          const IconComp = opt.icon;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => setOrderFilter(opt.key)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.55rem 1.15rem',
                                borderRadius: '999px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                background: isActive ? opt.activeBg : opt.bg,
                                color: isActive ? opt.activeColor : opt.color,
                                boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                                transform: isActive ? 'translateY(-1px)' : 'none',
                              }}
                            >
                              <IconComp size={15} />
                              <span>{opt.label}</span>
                              <span
                                style={{
                                  background: isActive ? '#ffffff' : 'rgba(0, 0, 0, 0.08)',
                                  color: isActive ? '#7c3aed' : opt.color,
                                  borderRadius: '999px',
                                  padding: '0.1rem 0.55rem',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  minWidth: '18px',
                                  textAlign: 'center',
                                }}
                              >
                                {statusCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {loadingOrders ? (
                    <Spinner size={36} />
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                      <Package size={40} color="#7c3aed" style={{ marginBottom: '1rem' }} />
                      <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a' }}>No orders yet</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                        Discover our authentic Tamil traditional crafts and place your first order!
                      </p>
                      <Link to="/shop" className="btn btn-primary">
                        Shop Now
                      </Link>
                    </div>
                  ) : (() => {
                    const filteredOrders = orderFilter === 'all'
                      ? orders
                      : orders.filter((o) => {
                          const st = (o.status || '').toLowerCase();
                          if (orderFilter === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                          return st === orderFilter;
                        });
                    return filteredOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                        <Package size={32} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                          No <strong>{orderFilter}</strong> orders found.
                        </p>
                      </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                      {filteredOrders.map((order) => {
                        const totalFormatted = formatPrice(order.total ?? order.totalAmount ?? 0);
                        const isShipping = (order.status || '').toLowerCase() === 'shipped' || (order.status || '').toLowerCase() === 'out_for_delivery';
                        const isConfirmed = (order.status || '').toLowerCase() === 'confirmed';
                        const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                        const orderStatusKey = (order.status || 'placed').toLowerCase();

                        const currentStepIdx = isDelivered ? 3
                          : (['shipped', 'shipping', 'in_transit', 'out_for_delivery'].includes(orderStatusKey) ? 2
                          : (['confirmed', 'packing', 'processing'].includes(orderStatusKey) ? 1 : 0));

                        const existingReturn = Array.isArray(returns) ? returns.find(
                          (r) => r.orderNumber === order.orderNumber || r.orderId === order._id || (r.order && r.order.toString() === order._id)
                        ) : null;

                        const isExpanded = Boolean(expandedOrders[order._id] || expandedOrders[order.orderNumber]);
                        
                        return (
                          <div
                            key={order._id}
                            style={{
                              position: 'relative',
                              borderRadius: '24px',
                              background: '#ffffff',
                              boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
                              border: '1.5px solid rgba(221, 214, 254, 0.75)',
                              overflow: 'hidden',
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                          >
                            {/* Left Accent Bar */}
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '5px',
                                background: isDelivered ? '#16a34a' : isShipping ? '#f59e0b' : isConfirmed ? '#3b82f6' : 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)',
                              }}
                            />

                            {/* Card Header Bar - Clickable to expand */}
                            <div
                              onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                              style={{
                                background: 'linear-gradient(135deg, #f8faff 0%, #f4f3ff 100%)',
                                borderBottom: '1px solid #f1f5f9',
                                padding: '1.15rem 1.6rem 1.15rem 1.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                cursor: 'pointer',
                              }}
                              title={isExpanded ? 'Click to hide tracking progress & details' : 'Click anywhere on card to view tracking progress & details'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '14px',
                                    background: isDelivered ? '#f0fdf4' : '#f3e8ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isDelivered ? '#16a34a' : '#7c3aed',
                                    flexShrink: 0,
                                    boxShadow: '0 3px 10px rgba(124, 58, 237, 0.12)',
                                  }}
                                >
                                  {isDelivered ? <PackageCheck size={20} color="#16a34a" /> : isShipping ? <Truck size={20} color="#d97706" /> : <Package size={20} />}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', display: 'block', letterSpacing: '-0.01em' }}>
                                      Order #{order.orderNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleCopyOrderId(order.orderNumber); }}
                                      title={copiedOrderId === order.orderNumber ? 'Copied to clipboard!' : 'Copy Order ID'}
                                      style={{
                                        background: copiedOrderId === order.orderNumber ? '#dcfce7' : '#f3e8ff',
                                        border: '1px solid',
                                        borderColor: copiedOrderId === order.orderNumber ? '#86efac' : '#d8b4fe',
                                        borderRadius: '6px',
                                        padding: '0.18rem 0.42rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        cursor: 'pointer',
                                        color: copiedOrderId === order.orderNumber ? '#15803d' : '#7c3aed',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        transition: 'all 0.18s ease',
                                      }}
                                    >
                                      {copiedOrderId === order.orderNumber ? (
                                        <>
                                          <Check size={12} strokeWidth={2.8} />
                                          <span>Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={12} strokeWidth={2} />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                                      Placed on {formatDate(order.createdAt)}
                                    </span>
                                    {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleOrderExpand(order._id, order.orderNumber); }}
                                        title={isExpanded ? 'Hide gift message' : 'View gift message'}
                                        style={{
                                          background: '#fff1f2',
                                          border: '1px solid #fecdd3',
                                          color: '#be123c',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                        }}
                                      >
                                        <Gift size={11} />
                                        <span>Gift Order</span>
                                      </button>
                                    )}
                                    {existingReturn && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleOrderExpand(order._id, order.orderNumber); }}
                                        title={isExpanded ? 'Hide return details' : 'View return details'}
                                        style={{
                                          background: existingReturn.status === 'refunded' ? '#dcfce7' : '#fef3c7',
                                          border: `1px solid ${existingReturn.status === 'refunded' ? '#86efac' : '#fde68a'}`,
                                          color: existingReturn.status === 'refunded' ? '#15803d' : '#b45309',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                        }}
                                      >
                                        <RotateCcw size={11} />
                                        <span>Return: {existingReturn.status.toUpperCase()}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Prominent Status Pill - CLICK TO EXPAND LIFECYCLE */}
                              <div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleOrderExpand(order._id, order.orderNumber); }}
                                  title={isExpanded ? 'Click to hide lifecycle progress' : 'Click to view order lifecycle progress'}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    padding: '0.45rem 1.15rem',
                                    borderRadius: '999px',
                                    background: isDelivered ? '#f0fdf4' : isShipping ? '#fff8e6' : isConfirmed ? '#e6fffa' : '#f5f3ff',
                                    border: `1.5px solid ${isDelivered ? '#bbf7d0' : isShipping ? '#ffe0b2' : isConfirmed ? '#a7f3d0' : '#ddd6fe'}`,
                                    color: isDelivered ? '#15803d' : isShipping ? '#d97706' : isConfirmed ? '#0d9488' : '#7c3aed',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.02em',
                                    cursor: 'pointer',
                                    boxShadow: isExpanded ? '0 3px 10px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.18s ease',
                                    outline: 'none',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                                >
                                  {isDelivered ? <PackageCheck size={14} /> : isShipping ? <Truck size={14} /> : isConfirmed ? <CheckCircle2 size={14} /> : <ShoppingBag size={14} />}
                                  <span>{isDelivered ? 'ORDER DELIVERED' : isShipping ? 'ORDER SHIPPING' : isConfirmed ? 'ORDER CONFIRMED' : (order.status || 'ORDER PLACED').toUpperCase()}</span>
                                  {isExpanded ? <ChevronUp size={14} strokeWidth={2.8} /> : <ChevronDown size={14} strokeWidth={2.8} />}
                                </button>
                              </div>
                            </div>

                            {/* ── Collapsible Order Lifecycle Progress & Details (Shows when clicked) ── */}
                            {isExpanded && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{ borderBottom: '1px solid #f1f5f9', background: '#fafcff' }}
                              >
                                {/* ── 1. ORDER LIFECYCLE PROGRESS (Exact Match to Image 2) ── */}
                                <div
                                  style={{
                                    margin: '1.15rem 1.6rem 0.5rem 1.8rem',
                                    padding: '1rem 1.3rem',
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1.5px solid #e2e8f0',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                      ORDER LIFECYCLE PROGRESS
                                    </span>
                                    {order.status === 'cancelled' ? (
                                      <span style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fee2e2', padding: '0.15rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                                        Cancelled
                                      </span>
                                    ) : isDelivered ? (
                                      <span style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                                        Completed
                                      </span>
                                    ) : null}
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
                                    {ORDER_PROGRESS_STEPS.map((step, i, arr) => {
                                      const stepIdx = i;
                                      const isDone = orderStatusKey !== 'cancelled' && stepIdx <= currentStepIdx;
                                      const isCurrent = orderStatusKey !== 'cancelled' && stepIdx === currentStepIdx;
                                      const StepIcon = step.icon;

                                      return (
                                        <React.Fragment key={step.key}>
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, textAlign: 'center' }}>
                                            <div
                                              style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: isDone ? step.bg : '#f8fafc',
                                                border: `2px solid ${isCurrent ? step.color : isDone ? step.color : '#cbd5e1'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: isCurrent ? `0 0 0 4px ${step.color}25` : 'none',
                                                transition: 'all 0.2s',
                                                marginBottom: '0.4rem',
                                              }}
                                            >
                                              <StepIcon size={16} color={isDone ? step.color : '#94a3b8'} strokeWidth={2.2} />
                                            </div>
                                            <strong style={{ fontSize: '0.78rem', fontWeight: isCurrent ? 800 : 600, color: isDone ? step.color : '#64748b', whiteSpace: 'nowrap' }}>
                                              {step.label}
                                            </strong>
                                          </div>

                                          {i < arr.length - 1 && (
                                            <div
                                              style={{
                                                flex: 1,
                                                height: '3px',
                                                background: stepIdx < currentStepIdx && orderStatusKey !== 'cancelled' ? '#2563eb' : '#e2e8f0',
                                                margin: '16px 4px 0 4px',
                                                borderRadius: '2px',
                                              }}
                                            />
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed #e2e8f0' }}>
                                    <Link
                                      to={`/track-order?id=${order.orderNumber || order._id}`}
                                      style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      <span>Open Full Courier Tracking Page</span>
                                      <span>↗</span>
                                    </Link>
                                  </div>
                                </div>

                                {/* ── 2. Gift Wrapping Service & Personalized Message ── */}
                                {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                                  <div
                                    style={{
                                      margin: '0.75rem 1.6rem 0.5rem 1.8rem',
                                      padding: '0.95rem 1.25rem',
                                      borderRadius: '14px',
                                      background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                                      border: '1.5px solid #fecdd3',
                                      boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <Gift size={16} /> Gift Wrapping Service Included {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                                      </span>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9f1239', background: '#fecdd3', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                                        Gift Order
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.86rem', color: '#881337', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                      <strong>Personalized Gift Message: </strong>
                                      <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239' }}>
                                        {(order.giftWrap?.message && order.giftWrap.message.trim()) ? `"${order.giftWrap.message.trim()}"` : 'No custom message added'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* ── 3. Active Return Ticket Banner ── */}
                                {existingReturn && (
                                  <div
                                    style={{
                                      margin: '0.75rem 1.6rem 0.75rem 1.8rem',
                                      padding: '1rem 1.3rem',
                                      borderRadius: '14px',
                                      background: existingReturn.status === 'refunded' ? '#f0fdf4' : existingReturn.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                                      border: `1.5px solid ${existingReturn.status === 'refunded' ? '#86efac' : existingReturn.status === 'rejected' ? '#fca5a5' : '#fde68a'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '1rem',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                      <RotateCcw size={22} color={existingReturn.status === 'refunded' ? '#16a34a' : '#d97706'} />
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                                            Return / Replacement Request: {existingReturn.id || existingReturn.returnId}
                                          </strong>
                                          <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            padding: '0.15rem 0.55rem',
                                            borderRadius: '999px',
                                            background: existingReturn.status === 'refunded' ? '#dcfce7' : '#fef3c7',
                                            color: existingReturn.status === 'refunded' ? '#15803d' : '#b45309',
                                          }}>
                                            Status: {existingReturn.status}
                                          </span>
                                        </div>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                                          <strong>Reason:</strong> {existingReturn.reason} • <strong>Resolution:</strong> {existingReturn.resolution || 'Refund'}
                                          {existingReturn.customerNote ? ` • Note: "${existingReturn.customerNote}"` : ''}
                                        </p>
                                        {existingReturn.awbNumber && (
                                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                            📦 Reverse Pickup via {existingReturn.courier || 'Delhivery Logistics'} (AWB: {existingReturn.awbNumber})
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Link to="/returns" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'underline' }}>
                                      Return Policy
                                    </Link>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ── 4. Interactive Return Form with Dedicated Message Box ── */}
                            {activeReturnOrderId === order._id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  margin: '0.75rem 1.6rem 0.5rem 1.8rem',
                                  padding: '1.35rem 1.5rem',
                                  borderRadius: '16px',
                                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ffffff 100%)',
                                  border: '1.5px solid #fde68a',
                                  boxShadow: '0 6px 20px rgba(217, 119, 6, 0.09)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #fde68a', paddingBottom: '0.65rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <RotateCcw size={18} color="#d97706" />
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
                                      Request Return or Replacement (7-Day Return Guarantee)
                                    </h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setActiveReturnOrderId(null)}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#92400e', padding: '0.2rem' }}
                                  >
                                    <X size={18} />
                                  </button>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); handleReturnSubmit(order); }}>
                                  {/* Item Selection (if multi-item) */}
                                  {order.items?.length > 1 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginBottom: '0.4rem' }}>
                                        Select Item to Return / Replace:
                                      </label>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {order.items.map((it, idx) => (
                                          <label
                                            key={idx}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.75rem',
                                              padding: '0.55rem 0.85rem',
                                              borderRadius: '10px',
                                              background: returnItemIdx === idx ? '#fef3c7' : '#ffffff',
                                              border: `1.5px solid ${returnItemIdx === idx ? '#d97706' : '#e2e8f0'}`,
                                              cursor: 'pointer',
                                              fontSize: '0.85rem',
                                            }}
                                          >
                                            <input
                                              type="radio"
                                              name={`return_item_${order._id}`}
                                              checked={returnItemIdx === idx}
                                              onChange={() => setReturnItemIdx(idx)}
                                            />
                                            <img src={it.image} alt={it.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{it.name}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(Qty: {it.quantity} • {formatPrice(it.price)})</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Resolution Type */}
                                  <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginBottom: '0.4rem' }}>
                                      Requested Resolution:
                                    </label>
                                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          value="refund"
                                          checked={returnResolution === 'refund'}
                                          onChange={(e) => setReturnResolution(e.target.value)}
                                        />
                                        <span>Instant Refund to Original Payment</span>
                                      </label>
                                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.86rem', fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          value="replacement"
                                          checked={returnResolution === 'replacement'}
                                          onChange={(e) => setReturnResolution(e.target.value)}
                                        />
                                        <span>Replacement / Exchange (Same Product)</span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* Reason Dropdown */}
                                  <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginBottom: '0.4rem' }}>
                                      Reason for Return:
                                    </label>
                                    <select
                                      value={returnReason}
                                      onChange={(e) => setReturnReason(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.65rem 0.9rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #d97706',
                                        background: '#ffffff',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        outline: 'none',
                                      }}
                                    >
                                      {RETURN_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Dedicated Message Box */}
                                  <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginBottom: '0.4rem' }}>
                                      Return Message / Reason Details (விளக்கம் / குறிப்பு) <span style={{ color: '#dc2626' }}>*</span>:
                                    </label>
                                    <textarea
                                      rows={3}
                                      required
                                      placeholder="Please enter your return message or detailed reason here so our admin team can verify and approve reverse pickup..."
                                      value={returnMessage}
                                      onChange={(e) => setReturnMessage(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem 0.9rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #d97706',
                                        background: '#ffffff',
                                        fontSize: '0.88rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                  </div>

                                  {/* Optional Proof Photo URL */}
                                  <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginBottom: '0.4rem' }}>
                                      Proof Photo URL (Optional - e.g. Image URL of damaged item/tag):
                                    </label>
                                    <input
                                      type="url"
                                      placeholder="https://example.com/photo.jpg"
                                      value={returnProofUrl}
                                      onChange={(e) => setReturnProofUrl(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.6rem 0.9rem',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff',
                                        fontSize: '0.86rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                  </div>

                                  {/* Form Action Buttons */}
                                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => setActiveReturnOrderId(null)}
                                      style={{
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: '10px',
                                        background: '#ffffff',
                                        border: '1.5px solid #cbd5e1',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#64748b',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={returnSubmitting}
                                      style={{
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                        border: 'none',
                                        fontSize: '0.86rem',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        cursor: returnSubmitting ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                      }}
                                    >
                                      {returnSubmitting ? (
                                        <>
                                          <Spinner size={16} />
                                          <span>Submitting Request...</span>
                                        </>
                                      ) : (
                                        <>
                                          <RotateCcw size={15} />
                                          <span>Submit Return Request</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Card Items Body - Clickable to expand except product link */}
                            <div
                              onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                              style={{
                                padding: '1.4rem 1.6rem 1.4rem 1.8rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.25rem',
                                cursor: 'pointer',
                              }}
                              title={isExpanded ? 'Click to hide tracking progress & details' : 'Click anywhere on card to view tracking progress & details'}
                            >
                              {order.items?.map((item, idx) => {
                                const productSlug = item.product?.slug || item.slug || item.product?._id || item.productId || item.product || item._id;
                                const productLink = productSlug ? `/products/${productSlug}` : '/products';

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '1.25rem',
                                      paddingBottom: idx !== order.items.length - 1 ? '1.25rem' : 0,
                                      borderBottom: idx !== order.items.length - 1 ? '1px dashed #e2e8f0' : 'none',
                                    }}
                                  >
                                    <Link
                                      to={productLink}
                                      onClick={(e) => e.stopPropagation()}
                                      title={`View product: ${item.name}`}
                                      style={{ display: 'inline-block', flexShrink: 0, textDecoration: 'none' }}
                                    >
                                      <img
                                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                                        alt={item.name}
                                        style={{
                                          width: '76px',
                                          height: '76px',
                                          borderRadius: '16px',
                                          objectFit: 'cover',
                                          border: '1.5px solid #ede9fe',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                          display: 'block',
                                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'scale(1.05)';
                                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.18)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'none';
                                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                                        }}
                                      />
                                    </Link>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <Link
                                        to={productLink}
                                        onClick={(e) => e.stopPropagation()}
                                        title={`View product: ${item.name}`}
                                        style={{ textDecoration: 'none', display: 'inline-block', maxWidth: '100%' }}
                                      >
                                        <h4
                                          style={{
                                            margin: '0 0 0.45rem',
                                            fontSize: '1rem',
                                            color: '#0f172a',
                                            fontWeight: 700,
                                            lineHeight: 1.4,
                                            letterSpacing: '-0.01em',
                                            transition: 'color 0.18s ease',
                                            cursor: 'pointer',
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#7c3aed';
                                            e.currentTarget.style.textDecoration = 'underline';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '#0f172a';
                                            e.currentTarget.style.textDecoration = 'none';
                                          }}
                                        >
                                          {item.name}
                                        </h4>
                                      </Link>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                        <span
                                          style={{
                                            background: '#f1f5f9',
                                            color: '#64748b',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            padding: '0.2rem 0.65rem',
                                            borderRadius: '8px',
                                          }}
                                        >
                                          Qty: {item.quantity}
                                        </span>
                                        {item.price && (
                                          <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.05rem' }}>
                                            {formatPrice(item.price)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Card Footer Bar - With Invoice, Return, and Track Order */}
                            <div
                              onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                              style={{
                                background: 'linear-gradient(135deg, #f8faff 0%, #f4f3ff 100%)',
                                borderTop: '1px solid #f1f5f9',
                                padding: '1.15rem 1.6rem 1.15rem 1.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                cursor: 'pointer',
                              }}
                              title={isExpanded ? 'Click to hide tracking progress & details' : 'Click anywhere on card to view tracking progress & details'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: '0.94rem', color: '#64748b', fontWeight: 500 }}>
                                  Total Paid:{' '}
                                  <strong style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 800, marginLeft: '0.35rem' }}>
                                    {totalFormatted}
                                  </strong>
                                </div>
                              </div>

                              {/* Right: Actions Group */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {/* 1. GST Tax Invoice Download / View Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedInvoiceOrder(order);
                                  }}
                                  title="View & Download Official GST Tax Invoice"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    borderRadius: '16px',
                                    padding: '0.65rem 1.15rem',
                                    fontWeight: 700,
                                    fontSize: '0.86rem',
                                    background: '#ffffff',
                                    color: '#475569',
                                    border: '1.5px solid #cbd5e1',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    transition: 'all 0.18s ease',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                                >
                                  <FileText size={15} />
                                  <span>GST Invoice</span>
                                </button>

                                {/* 2. Request Return / Replacement Button (Available on Delivered orders) */}
                                {isDelivered && !existingReturn && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeReturnOrderId === order._id) {
                                        setActiveReturnOrderId(null);
                                      } else {
                                        setActiveReturnOrderId(order._id);
                                        setReturnItemIdx(0);
                                        setReturnReason(RETURN_REASONS[0]);
                                        setReturnResolution('refund');
                                        setReturnMessage('');
                                        setReturnProofUrl('');
                                      }
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      borderRadius: '16px',
                                      padding: '0.65rem 1.25rem',
                                      fontWeight: 700,
                                      fontSize: '0.86rem',
                                      background: activeReturnOrderId === order._id ? '#fee2e2' : '#fef3c7',
                                      color: activeReturnOrderId === order._id ? '#b91c1c' : '#b45309',
                                      border: `1.5px solid ${activeReturnOrderId === order._id ? '#fca5a5' : '#fde68a'}`,
                                      cursor: 'pointer',
                                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)',
                                      transition: 'all 0.18s ease',
                                    }}
                                  >
                                    <RotateCcw size={15} />
                                    <span>{activeReturnOrderId === order._id ? 'Close Return Form' : 'Request Return / Exchange'}</span>
                                  </button>
                                )}

                                {/* 3. Track Order Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOrderExpand(order._id, order.orderNumber);
                                  }}
                                  className={styles.orderTrackBtn}
                                  style={{
                                    borderRadius: '16px',
                                    padding: '0.65rem 1.35rem',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    boxShadow: isExpanded ? '0 2px 8px rgba(124, 58, 237, 0.2)' : '0 4px 14px rgba(124, 58, 237, 0.35)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    cursor: 'pointer',
                                    border: 'none',
                                    background: isExpanded ? 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                    color: '#ffffff',
                                    transition: 'all 0.2s ease',
                                  }}
                                  title={isExpanded ? 'Click to hide tracking progress' : 'Click to track order progress & details'}
                                >
                                  <Truck size={16} strokeWidth={2.5} />
                                  <span>{isExpanded ? 'Hide Progress' : 'Track Order'}</span>
                                  {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {currentTab === 'profile' && (
                <div
                  style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    padding: 'clamp(2rem, 4vw, 3rem)',
                    boxShadow: '0 20px 40px -15px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Dot pattern decorative element */}
                  <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(4, 5px)', gap: '6px', opacity: 0.4 }}>
                    {Array(16).fill(0).map((_, i) => (
                       <div key={i} style={{ width: '5px', height: '5px', background: '#a78bfa', borderRadius: '50%' }} />
                    ))}
                  </div>
                  
                  {/* Soft Radial Glow behind decoration */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-20px', 
                      right: '-20px', 
                      width: '260px', 
                      height: '260px', 
                      background: 'radial-gradient(circle, rgba(221, 214, 254, 0.45) 0%, rgba(255, 255, 255, 0) 70%)', 
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} 
                  />

                  {/* Generated 3D e-commerce profile decoration on bottom right */}
                  <div style={{ position: 'absolute', bottom: '5px', right: '15px', pointerEvents: 'none', zIndex: 0 }}>
                    <img 
                      src="/profile-corner-3d.png" 
                      alt="Profile 3D Decoration" 
                      style={{ 
                        width: '200px', 
                        height: '200px', 
                        objectFit: 'contain', 
                        mixBlendMode: 'multiply',
                        filter: 'contrast(105%) brightness(102%) drop-shadow(0 10px 20px rgba(124, 58, 237, 0.1))' 
                      }} 
                    />
                  </div>

                  <AccountProfile />
                </div>
              )}

              {/* TAB 4: ADDRESSES */}
              {currentTab === 'addresses' && <AccountAddresses />}

              {/* TAB 5: SECURITY & LOGIN (PASSWORD CHANGE) */}
              {currentTab === 'password' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    borderRadius: '24px',
                    padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                    boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08)',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <AccountSecurity />
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Sign Out of Picky">
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            Are you sure you want to sign out? Your saved cart items and address book will remain securely synced when you return.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setLogoutModalOpen(false)}>
              Stay Signed In
            </Button>
            <Button variant="danger" onClick={handleConfirmLogout}>
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unified Official GST Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <AdminInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </PageWrapper>
  );
}

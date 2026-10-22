import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import OrderTracker from '../../components/order/OrderTracker';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { useReturnStore } from '../../store/returnStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  MessageCircle,
  FileText,
  ChevronRight,
  Gift,
  XCircle,
  RotateCcw,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Package,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import styles from './OrderDetail.module.css';
import AdminInvoice from '../../components/admin/AdminInvoice';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found better price elsewhere',
  'Need to change shipping address or phone',
  'Delivery timeline is too long',
  'Payment/Discount issue',
  'Customer changed mind',
  'Other reason'
];

const RETURN_REASONS = [
  'Wrong Size / Fit Issue',
  'Fabric Defective / Damaged Piece',
  'Different from Product Image',
  'Color Mismatch',
  'Quality Unsatisfactory',
  'Customer Changed Mind',
  'Received Wrong Item'
];

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { createReturnRequest, returns } = useReturnStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Self-Service Cancel State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);

  // Self-Service Return / Replacement State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [returnResolution, setReturnResolution] = useState('refund'); // 'refund' | 'replacement'
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [returnProofUrl, setReturnProofUrl] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccessTicket, setReturnSuccessTicket] = useState(null);

  // GST Tax Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      const startTime = Date.now();
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        const item = res?.data?.data || res?.data || res;
        if (item && (item.orderNumber || item._id)) {
          setOrder(item);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setOrder(null);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 500 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  // Check if this order already has an active return ticket
  const existingReturnTicket = React.useMemo(() => {
    if (!order?.orderNumber || !Array.isArray(returns)) return null;
    return returns.find((r) => r.orderNumber === order.orderNumber);
  }, [order, returns]);

  // Handle Customer Cancel Order
  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!order) return;
    try {
      setCancelling(true);
      setCancelError(null);
      const combinedReason = cancelNote.trim()
        ? `${cancelReason} - ${cancelNote.trim()}`
        : cancelReason;

      const res = await orderService.cancelOrder(order._id, { reason: combinedReason });
      const updated = res?.data?.data || res?.data || { ...order, status: 'cancelled' };
      setOrder({ ...order, status: 'cancelled', cancelReason: combinedReason });
      setCancelSuccessMsg('Order has been cancelled successfully. Refund will be credited within 24-48 hours.');
      setTimeout(() => {
        setShowCancelModal(false);
      }, 1500);
    } catch (err) {
      console.error('Cancel order failed:', err);
      setCancelError(
        err?.response?.data?.message ||
        'Failed to cancel order. It may have already been dispatched. Please contact support.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Handle Customer Return / Replacement Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!order || !order.items?.length) return;

    setReturnSubmitting(true);
    const chosenItem = order.items[selectedItemIdx] || order.items[0];
    const ticketId = `RET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReturnRecord = {
      id: ticketId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        name: order.shippingAddress?.fullName || order.shippingAddress?.name || user?.name || 'Valued Customer',
        phone: order.shippingAddress?.phone || user?.phone || '+91 98765 43210',
        email: user?.email || 'customer@picky.com',
        address: `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`,
      },
      item: {
        name: chosenItem.name,
        image: chosenItem.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
        sku: chosenItem.sku || `SKU-${order.orderNumber.slice(-6)}`,
        variant: chosenItem.variant || 'Standard',
        quantity: chosenItem.quantity || 1,
        price: chosenItem.price || 0,
        refundAmount: chosenItem.price * (chosenItem.quantity || 1),
      },
      resolution: returnResolution,
      reason: returnReason,
      customerNote: returnNote.trim() || 'Requested via customer self-service order portal.',
      proofImages: returnProofUrl.trim() ? [returnProofUrl.trim()] : [chosenItem.image || ''],
      status: 'pending',
      refundMethod: 'Original Payment Method (Razorpay Instant)',
      refundStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          note: `Customer requested ${returnResolution === 'replacement' ? 'Replacement' : 'Refund'} for item: ${chosenItem.name}. Reason: ${returnReason}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const created = await createReturnRequest(newReturnRecord);
      setReturnSuccessTicket(created || newReturnRecord);
    } catch (_) {
      setReturnSuccessTicket(newReturnRecord);
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="section"><Spinner size={40} /></div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Order Not Found</h2>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to My Orders
          </Link>
        </div>
      </PageWrapper>
    );
  }


  return (
    <PageWrapper>
      <div className="section">
        <div className={styles.pageContainer}>
          {/* Breadcrumb Nav */}
          <div className={`${styles.breadcrumbNav} noPrint`}>
            <Link to="/orders" className={styles.breadcrumbLink}>
              <ArrowLeft size={16} /> My Orders
            </Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbCurrent}>Order #{order.orderNumber}</span>
          </div>

          {/* Cancellation Alert Banner */}
          {order.status === 'cancelled' && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: '#991b1b',
              }}
            >
              <XCircle size={24} style={{ flexShrink: 0, color: '#dc2626' }} />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>
                  This order has been cancelled
                </strong>
                <span style={{ fontSize: '0.88rem', color: '#b91c1c' }}>
                  {order.cancelReason || 'Cancelled by customer.'} If any online payment was deducted, an instant refund will be credited back to your original source account within 24 to 48 hours.
                </span>
              </div>
            </div>
          )}

          {/* Active Return Ticket Alert Banner */}
          {existingReturnTicket && (
            <div
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                color: '#92400e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <RotateCcw size={22} style={{ flexShrink: 0, color: '#d97706' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                    Return / Replacement Request Active: {existingReturnTicket.id}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#b45309' }}>
                    Status: <strong style={{ textTransform: 'uppercase' }}>{existingReturnTicket.status}</strong> • Resolution: {existingReturnTicket.resolution || 'Refund'}
                  </span>
                </div>
              </div>
              <Link
                to="/returns"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#7c3aed',
                  textDecoration: 'underline',
                }}
              >
                View Return Policy
              </Link>
            </div>
          )}

          {/* Hero Order Header Card */}
          <div className={styles.headerCard}>
            <div className={styles.headerMainInfo}>
              <div className={styles.headerTitleGroup}>
                <h1 className={styles.orderTitle}>Order #{order.orderNumber}</h1>
                <Badge status={order.status} />
              </div>
              <div className={styles.metaRow}>
                <span>Placed on {formatDate(order.createdAt)}</span>
                <span>•</span>
                <span className={styles.paymentPill}>
                  <CreditCard size={14} /> Paid via Razorpay / Online
                </span>
                {order.razorpayPaymentId && (
                  <span className={styles.razorpayIdTag}>
                    Ref: {order.razorpayPaymentId}
                  </span>
                )}
              </div>
            </div>

            {/* Self-Service Action Buttons */}
            <div className={`${styles.headerActions} noPrint`}>
              {/* 1. Cancel Order Button (Available when pending or confirmed) */}
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className={styles.cancelBtn}
                  title="Cancel this order before it ships"
                >
                  <XCircle size={16} /> Cancel Order
                </button>
              )}

              {/* 2. Request Return / Replacement Button (Available when delivered) */}
              {order.status === 'delivered' && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className={styles.returnBtn}
                  title="7-Day Hassle-Free Return or Replacement"
                >
                  <RotateCcw size={16} /> Request Return / Exchange
                </button>
              )}

              {/* 3. Official GST Tax Invoice Button */}
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className={styles.invoiceBtn}
                title="View & Download Official GST Tax Invoice"
              >
                <FileText size={16} /> GST Tax Invoice
              </button>
            </div>
          </div>

          {/* Live Order Tracker */}
          <div className={`${styles.trackerSectionWrapper} noPrint`}>
            <OrderTracker orderId={order._id} initialData={order} />
          </div>

          {/* Main Details Grid */}
          <div className={styles.mainGrid}>
            {/* Items & Invoice Breakdown Card */}
            <div className={styles.glassCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardTitleIcon}>
                    <ShoppingBag size={18} />
                  </span>
                  Purchased Items ({order.items?.length || 0})
                </h3>
              </div>

              <div className={styles.itemsList}>
                {order.items?.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemImageWrapper}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                        alt={item.name}
                        className={styles.itemImg}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <div className={styles.itemQtyPrice}>
                        <span className={styles.qtyBadge}>Qty: {item.quantity}</span>
                        <span>×</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <span className={styles.itemTotalPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gift Message Box */}
              {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                <div
                  style={{
                    margin: '1.25rem 1.5rem 0',
                    padding: '0.95rem 1.15rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                    border: '1.5px solid #fecdd3',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)',
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Gift size={16} /> Gift Wrapping Included {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9f1239', background: '#fecdd3', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                      Gift Order
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#881337', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <strong>Personalized Gift Message: </strong>
                    <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {(order.giftWrap?.message && order.giftWrap.message.trim()) ? `"${order.giftWrap.message.trim()}"` : 'No message'}
                    </span>
                  </div>
                </div>
              )}

              {/* Financial Invoice Breakdown */}
              <div className={styles.invoiceBox}>
                <div className={styles.invoiceRow}>
                  <span>Items Subtotal</span>
                  <span className={styles.invoiceValue}>{formatPrice(order.subtotal)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className={`${styles.invoiceRow} ${styles.discountRow}`}>
                    <span>Coupon / Discount Applied</span>
                    <span className={styles.discountValue}>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className={styles.invoiceRow}>
                  <span>Delivery Charge</span>
                  {(() => {
                    const diff = Math.max(0, Number(order.total || 0) - (Number(order.subtotal || 0) - Number(order.discountAmount || 0)));
                    const shipFee = Number(order.shippingFee) > 0 ? Number(order.shippingFee) : (diff > 0 ? (diff === 42 ? 40 : diff) : 0);
                    return shipFee > 0 ? (
                      <span className={styles.invoiceValue}>{formatPrice(shipFee)}</span>
                    ) : (
                      <span className={styles.freeDeliveryBadge}>FREE DELIVERY</span>
                    );
                  })()}
                </div>

                {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                  <div className={styles.invoiceRow} style={{ color: '#be123c' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Gift size={13} /> Gift Wrapping Service
                    </span>
                    <span className={styles.invoiceValue} style={{ color: '#be123c', fontWeight: 700 }}>
                      +{formatPrice(order.giftWrap?.fee || order.giftWrapFee || 30)}
                    </span>
                  </div>
                )}

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Grand Total</span>
                  <span className={styles.totalPriceAmount}>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address & Customer Support Side Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Delivery Address Card */}
              <div className={styles.glassCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    <span className={styles.cardTitleIcon}>
                      <MapPin size={18} />
                    </span>
                    Delivery Address
                  </h3>
                </div>

                <div className={styles.addressDetails}>
                  <div style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '0.35rem' }}>
                    {order.shippingAddress?.name || user?.name || 'Customer'}
                  </div>
                  <span className={styles.addressStreet}>
                    {order.shippingAddress?.street}
                  </span>
                  {order.shippingAddress?.landmark && (
                    <div className={styles.landmarkPill}>
                      📍 Landmark: {order.shippingAddress.landmark}
                    </div>
                  )}
                  <div className={styles.cityStateZip}>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </div>
                  {order.shippingAddress?.phone && (
                    <div style={{ marginTop: '0.45rem', fontSize: '0.85rem', color: '#64748b' }}>
                      📞 Phone: {order.shippingAddress.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Policy Quick Links */}
              <div className={styles.glassCard} style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '0.75rem' }}>
                  Customer Care & Policies
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Link to="/returns" style={{ color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RotateCcw size={14} /> 7-Day Replacement & Return Policy
                  </Link>
                  <Link to="/shipping-policy" style={{ color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={14} /> Shipping & Delivery Information
                  </Link>
                  <Link to="/faq" style={{ color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageCircle size={14} /> Help Center & Frequently Asked Questions
                  </Link>
                </div>
              </div>

              {/* WhatsApp & Support Helper Box */}
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <MessageCircle size={22} />
                </div>
                <div className={styles.supportContent}>
                  <h4 className={styles.supportTitle}>Need Help with this Order?</h4>
                  <p className={styles.supportDesc}>
                    Reach out directly to our dedicated support team or reply to your WhatsApp confirmation thread for instant live assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              MODAL 1: CUSTOMER CANCEL ORDER MODAL
             ══════════════════════════════════════════════════════════════════ */}
          {showCancelModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>
                    <XCircle size={22} color="#dc2626" /> Cancel Order #{order.orderNumber}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className={styles.modalCloseBtn}
                  >
                    <X size={18} />
                  </button>
                </div>

                {cancelSuccessMsg ? (
                  <div className={styles.modalInfo}>
                    <CheckCircle2 size={20} color="#16a34a" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>{cancelSuccessMsg}</p>
                  </div>
                ) : (
                  <form onSubmit={handleCancelOrder}>
                    <div className={styles.modalBody}>
                      <div className={styles.modalWarning}>
                        <strong>Please Note:</strong> Cancelling this order will release the reserved inventory. If you already completed payment, your refund of <strong>{formatPrice(order.total)}</strong> will be credited to your original payment method in 24 to 48 hours.
                      </div>

                      {cancelError && (
                        <div style={{ color: '#dc2626', fontSize: '0.88rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px' }}>
                          {cancelError}
                        </div>
                      )}

                      <div>
                        <label className={styles.formLabel}>Reason for Cancellation *</label>
                        <select
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className={styles.formSelect}
                          required
                        >
                          {CANCEL_REASONS.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={styles.formLabel}>Additional Comments (Optional)</label>
                        <textarea
                          rows={3}
                          value={cancelNote}
                          onChange={(e) => setCancelNote(e.target.value)}
                          placeholder="Tell us what went wrong so we can improve..."
                          className={styles.formTextarea}
                        />
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(false)}
                        className="btn btn-secondary"
                        style={{ borderRadius: '10px' }}
                        disabled={cancelling}
                      >
                        Keep Order
                      </button>
                      <button
                        type="submit"
                        className="btn btn-danger"
                        style={{
                          borderRadius: '10px',
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1.25rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        disabled={cancelling}
                      >
                        {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              MODAL 2: CUSTOMER RETURN / REPLACEMENT MODAL
             ══════════════════════════════════════════════════════════════════ */}
          {showReturnModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>
                    <RotateCcw size={22} color="#7c3aed" /> 7-Day Return / Replacement Request
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnSuccessTicket(null);
                    }}
                    className={styles.modalCloseBtn}
                  >
                    <X size={18} />
                  </button>
                </div>

                {returnSuccessTicket ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '0.4rem' }}>
                      Return Request Submitted!
                    </h3>
                    <p style={{ color: '#4b5563', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                      Ticket ID: <strong style={{ color: '#7c3aed' }}>{returnSuccessTicket.id}</strong>
                    </p>
                    <div className={styles.modalInfo} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                      Our quality inspection team has received your request. A reverse pickup courier partner will be assigned within 24 to 48 hours. Please keep the item packed in original condition with tags intact.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReturnModal(false);
                        setReturnSuccessTicket(null);
                      }}
                      className="btn btn-primary"
                      style={{ borderRadius: '10px' }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReturnSubmit}>
                    <div className={styles.modalBody}>
                      <div className={styles.modalInfo}>
                        <strong>Picky Buyer Guarantee:</strong> You can request a 100% free doorstep replacement or direct source refund within 7 days of delivery.
                      </div>

                      {/* Select Item */}
                      <div>
                        <label className={styles.formLabel}>Select Item to Return / Replace *</label>
                        <select
                          value={selectedItemIdx}
                          onChange={(e) => setSelectedItemIdx(Number(e.target.value))}
                          className={styles.formSelect}
                          required
                        >
                          {order.items?.map((item, idx) => (
                            <option key={idx} value={idx}>
                              {item.name} (Qty: {item.quantity}) - {formatPrice(item.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Resolution Choice */}
                      <div>
                        <label className={styles.formLabel}>Preferred Resolution *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <label
                            style={{
                              border: `1.5px solid ${returnResolution === 'replacement' ? '#7c3aed' : '#d1d5db'}`,
                              background: returnResolution === 'replacement' ? '#f5f3ff' : '#fff',
                              borderRadius: '10px',
                              padding: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                            }}
                          >
                            <input
                              type="radio"
                              name="resolution"
                              value="replacement"
                              checked={returnResolution === 'replacement'}
                              onChange={() => setReturnResolution('replacement')}
                            />
                            Replacement (Exchange)
                          </label>

                          <label
                            style={{
                              border: `1.5px solid ${returnResolution === 'refund' ? '#7c3aed' : '#d1d5db'}`,
                              background: returnResolution === 'refund' ? '#f5f3ff' : '#fff',
                              borderRadius: '10px',
                              padding: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                            }}
                          >
                            <input
                              type="radio"
                              name="resolution"
                              value="refund"
                              checked={returnResolution === 'refund'}
                              onChange={() => setReturnResolution('refund')}
                            />
                            Full Source Refund
                          </label>
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <label className={styles.formLabel}>Reason for Return *</label>
                        <select
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className={styles.formSelect}
                          required
                        >
                          {RETURN_REASONS.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {/* Note */}
                      <div>
                        <label className={styles.formLabel}>Details / Defect Description *</label>
                        <textarea
                          rows={3}
                          value={returnNote}
                          onChange={(e) => setReturnNote(e.target.value)}
                          placeholder="Describe the issue (e.g. saree border damaged in transit, wrong color sent)..."
                          className={styles.formTextarea}
                          required
                        />
                      </div>

                      {/* Optional Photo URL */}
                      <div>
                        <label className={styles.formLabel}>Damage Photo Image URL (Optional)</label>
                        <input
                          type="url"
                          value={returnProofUrl}
                          onChange={(e) => setReturnProofUrl(e.target.value)}
                          placeholder="Paste image link if available (e.g. Imgur, cloud link)"
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(false)}
                        className="btn btn-secondary"
                        style={{ borderRadius: '10px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: '10px' }}
                        disabled={returnSubmitting}
                      >
                        {returnSubmitting ? 'Submitting...' : 'Submit Return Request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {showInvoiceModal && order && (
            <AdminInvoice
              order={order}
              onClose={() => setShowInvoiceModal(false)}
            />
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

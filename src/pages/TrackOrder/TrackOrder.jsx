import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import {
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  Check,
  FileText,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  BadgeCheck,
  XCircle,
  Printer,
} from 'lucide-react';
import styles from './TrackOrder.module.css';

// ─── Courier Link & Arrival Window Helpers ─────────────────────────────────
const getCourierUrl = (courierName, trackingId) => {
  const name = (courierName || '').toLowerCase();
  if (name.includes('st cour') || name.includes('stcour')) return 'https://stcourier.com/';
  if (name.includes('dtdc')) return 'https://www.dtdc.in/';
  if (name.includes('delhivery')) return 'https://www.delhivery.com/';
  if (name.includes('blue') || name.includes('dart')) return 'https://www.bluedart.com/';
  if (name.includes('india') || name.includes('post')) return 'https://www.indiapost.gov.in/';
  if (name.includes('shadowfax')) return 'https://www.shadowfax.in/';
  if (name.includes('xpressbees')) return 'https://www.xpressbees.com/';
  if (name.includes('ecom')) return 'https://ecomexpress.in/';
  return 'https://stcourier.com/';
};

const getEstimatedArrivalWindow = (createdAt, isDelivered) => {
  if (isDelivered) return 'Delivered to Doorstep';
  let base = createdAt ? new Date(createdAt) : new Date();
  if (isNaN(base.getTime())) {
    base = new Date();
  }
  const start = new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000);
  const end = new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000);
  const opts = { month: 'long', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} — ${end.toLocaleDateString('en-US', opts)}`;
};

// ─── Picky Admin Order Progress Lifecycle Steps ─────────────────────────────
const ADMIN_PROGRESS_STEPS = [
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: Clock,
    color: '#b45309',
    bg: '#fffbeb',
  },
  {
    key: 'shipped',
    label: 'Shipping',
    icon: Truck,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: BadgeCheck,
    color: '#15803d',
    bg: '#f0fdf4',
  },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const urlOrderNumber = searchParams.get('id') || searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || '');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resultRef = useRef(null);

  // Automatically track if order ID/number is passed via URL query parameter
  useEffect(() => {
    if (urlOrderNumber) {
      handleLocateShipment(null, urlOrderNumber);
    }
  }, [urlOrderNumber]);

  const handleLocateShipment = async (e, customId) => {
    if (e) e.preventDefault();
    const queryId = (customId !== undefined ? customId : orderNumber).trim();

    if (!queryId) {
      setErrorMsg('Please enter your order number (e.g. PKY-20261010-F26C295D) to locate your shipment.');
      setTrackedOrder(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let foundOrder = null;

      // 1. Fetch from real backend tracking endpoint by human-readable orderNumber or ID
      try {
        const res = await orderService.trackByOrderNumber(queryId);
        foundOrder = res?.data?.data || res?.data || res;
      } catch (err) {
        // Fallback: try getById directly
        try {
          const res = await orderService.getById(queryId);
          foundOrder = res?.data?.data || res?.data || res;
        } catch {
          // Fallback: search in customer's order list if authenticated
          try {
            const listRes = await orderService.list({ limit: 50 });
            const items = listRes?.data?.data || listRes?.data || [];
            foundOrder = items.find(
              (o) =>
                o._id === queryId ||
                o.orderNumber?.toUpperCase() === queryId.toUpperCase()
            );
          } catch {
            // no further fallbacks
          }
        }
      }

      if (foundOrder && (foundOrder._id || foundOrder.orderNumber)) {
        const rawStatus = (foundOrder.status || 'confirmed').toLowerCase();
        const status = rawStatus === 'processing' || rawStatus === 'pending' || rawStatus === 'packed' ? 'confirmed' : rawStatus;

        const isCancelled = status === 'cancelled';
        const isDelivered = status === 'delivered';
        const isShipped = status === 'shipped' || status === 'in_transit' || status === 'out_for_delivery';
        const isConfirmed = status === 'confirmed';

        const currentStepIdx = isCancelled ? -1 : (isDelivered ? 2 : (isShipped ? 1 : 0));

        let statusBadgeText = 'CONFIRMED';
        if (isDelivered) statusBadgeText = 'DELIVERED';
        else if (isShipped) statusBadgeText = 'IN TRANSIT';
        else if (isCancelled) statusBadgeText = 'CANCELLED';
        else statusBadgeText = 'CONFIRMED';

        const carrierName = foundOrder.courier || 'st cour';
        const trackingId =
          foundOrder.trackingId ||
          (foundOrder.orderNumber
            ? foundOrder.orderNumber.replace(/[^0-9]/g, '').slice(-6) || '574354'
            : '574354');
        const courierUrl = getCourierUrl(carrierName, trackingId);
        const estimatedArrival = getEstimatedArrivalWindow(foundOrder.createdAt, isDelivered);

        // Format Admin Stepper Steps
        const adminSteps = ADMIN_PROGRESS_STEPS.map((step, idx) => {
          const isDone = !isCancelled && idx <= currentStepIdx;
          const isCurrent = !isCancelled && idx === currentStepIdx;
          const isCompleted = !isCancelled && idx < currentStepIdx;

          let subText = '';
          if (step.key === 'confirmed') {
            subText = `Placed on ${formatDate(foundOrder.createdAt)}`;
          } else if (step.key === 'shipped') {
            subText = (isShipped || isDelivered)
              ? `${carrierName}${trackingId ? ` • ${trackingId}` : ''}`
              : 'Preparing for dispatch';
          } else if (step.key === 'delivered') {
            subText = isDelivered
              ? `Completed on ${formatDate(foundOrder.updatedAt || foundOrder.createdAt)}`
              : 'Estimated arrival soon';
          }

          return {
            ...step,
            isDone,
            isCurrent,
            isCompleted,
            subText,
          };
        });

        // Format Items
        const rawItems = Array.isArray(foundOrder.items) ? foundOrder.items : [];
        const itemsList = rawItems.map((it, idx) => ({
          id: it._id || it.product || `order-item-${idx}`,
          title: it.name || it.title || 'Soft Lichi Silk Saree',
          sku: it.sku || `MV-${(it._id || 'LS').toString().slice(-6).toUpperCase()}`,
          price: it.price || 0,
          quantity: it.quantity || 1,
          image: it.image || (Array.isArray(it.images) ? it.images[0] : null) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=160',
        }));

        const recipientName =
          foundOrder.shippingAddress?.fullName ||
          foundOrder.shippingAddress?.name ||
          foundOrder.customer?.name ||
          foundOrder.user?.name ||
          'Valued Patron';

        const line1 =
          foundOrder.shippingAddress?.street ||
          foundOrder.shippingAddress?.line1 ||
          foundOrder.shippingAddress?.address ||
          '';
        const city = foundOrder.shippingAddress?.city || '';
        const state = foundOrder.shippingAddress?.state || '';
        const pincode = foundOrder.shippingAddress?.pincode || foundOrder.shippingAddress?.postalCode || '';
        const addressText = line1
          ? `${line1}${city ? `, ${city}, ${state} - ${pincode}` : ''}`
          : 'Customer Address Preserved';

        setTrackedOrder({
          orderNumber: foundOrder.orderNumber || foundOrder._id,
          statusBadgeText,
          currentStepIdx,
          adminSteps,
          isCancelled,
          carrier: carrierName,
          trackingId,
          courierUrl,
          recipientName,
          addressText,
          estimatedArrival,
          items: itemsList,
          subtotal: foundOrder.subtotal || foundOrder.total,
          shippingFee: foundOrder.shippingFee !== undefined ? foundOrder.shippingFee : (foundOrder.total > 1000 ? 0 : 75),
          convenienceFee: foundOrder.convenienceFee || 0,
          discountAmount: foundOrder.discountAmount || 0,
          total: foundOrder.total || 0,
        });

        // ── Smooth Scroll Down to Results on Successful Lookup ──
        setTimeout(() => {
          if (resultRef.current) {
            const yOffset = -90;
            const y = resultRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 120);
      } else {
        setErrorMsg(`We couldn't find an order matching "${queryId}". Please verify your order number from your confirmation SMS or email.`);
        setTrackedOrder(null);
      }
    } catch (err) {
      console.warn('Error tracking order:', err);
      const errMsg =
        err?.response?.data?.message ||
        `No order found with number "${queryId}". Please check your order number and try again.`;
      setErrorMsg(errMsg);
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className={styles.trackOrderPage}>
        <div className={styles.mainContainer}>
          {/* ── Real-Time Tracking Header ────────────── */}
          <header className={styles.heroHeader}>
            <span className={styles.eyebrow}>REAL-TIME SHIPMENT TRACKING</span>
            <h1 className={styles.mainTitle}>Track Your Order</h1>
            <p className={styles.subtitle}>
              Follow every step of your Picky order in real-time as it journeys from our fulfillment hub to your doorstep.
            </p>
          </header>

          {/* ── Search Card ── */}
          <div className={styles.searchCard}>
            <form onSubmit={handleLocateShipment} className={styles.searchForm}>
              <div className={styles.inputsGrid}>
                {/* Order Number Field with Picky Pattern Placeholder */}
                <div className={styles.inputGroup}>
                  <label htmlFor="orderNumberInput" className={styles.inputLabel}>
                    ORDER NUMBER *
                  </label>
                  <input
                    id="orderNumberInput"
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. PKY-20261010-F26C295D"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    autoFocus={!urlOrderNumber}
                  />
                </div>

                {/* Optional Email Address Field */}
                <div className={styles.inputGroup}>
                  <label htmlFor="emailInput" className={styles.inputLabel}>
                    EMAIL ADDRESS (OPTIONAL)
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    className={styles.inputField}
                    placeholder="e.g. yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Locate Shipment Button */}
              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={styles.locateBtn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Searching Order Records...</>
                  ) : (
                    <>LOCATE SHIPMENT</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Error Notification ───────────────────────── */}
          {errorMsg && (
            <div className={styles.errorBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
                <AlertCircle size={18} color="#dc2626" />
                <p style={{ margin: 0, fontWeight: 600 }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* ── Order Tracking Details Result (Exact Reference Layout) ── */}
          {trackedOrder && (
            <div className={styles.resultSection} ref={resultRef}>
              {/* ════════════ CARD 1: Tracking & Stepper Card ════════════ */}
              <div className={styles.trackingCard}>
                {/* Header Row: Order Number + Tracking Pill + Status Pill */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeftCol}>
                    <div className={styles.orderTitleRow}>
                      <h2 className={styles.orderTitle}>
                        Order #{trackedOrder.orderNumber}
                      </h2>
                      {trackedOrder.trackingId && (
                        <span className={styles.trackingPill}>
                          <Package size={13} />
                          Tracking ID: {trackedOrder.trackingId}
                        </span>
                      )}
                    </div>
                    <div className={styles.estimatedArrivalRow}>
                      <span className={styles.estimatePrefix}>Estimated Arrival:</span>{' '}
                      <span className={styles.estimateDates}>
                        {trackedOrder.estimatedArrival}
                      </span>
                    </div>
                  </div>

                  {/* Top Right Status Outline Badge */}
                  <div className={styles.headerRightCol}>
                    <span
                      className={`${styles.statusOutlineBadge} ${
                        trackedOrder.statusBadgeText === 'DELIVERED'
                          ? styles.statusBadgeDelivered
                          : trackedOrder.statusBadgeText === 'CANCELLED'
                          ? styles.statusBadgeCancelled
                          : trackedOrder.statusBadgeText === 'IN TRANSIT'
                          ? styles.statusBadgeShipped
                          : styles.statusBadgeConfirmed
                      }`}
                    >
                      {trackedOrder.statusBadgeText}
                    </span>
                  </div>
                </div>

                {/* ── Admin Order Progress Stepper (Exact Admin Sync) ── */}
                <div className={styles.stepperSection}>
                  <div className={styles.orderProgressHeader}>
                    <span className={styles.orderProgressLabel}>ORDER PROGRESS</span>
                  </div>

                  {trackedOrder.isCancelled ? (
                    <div className={styles.cancelledBanner}>
                      <XCircle size={18} color="#dc2626" />
                      <span>This order has been cancelled by the store administrator.</span>
                    </div>
                  ) : (
                    <div className={styles.stepperWrapper}>
                      {/* Background Rail connecting circle centers */}
                      <div className={styles.stepperRail}>
                        <div
                          className={styles.stepperRailFill}
                          style={{
                            width: `${
                              trackedOrder.currentStepIdx <= 0
                                ? 0
                                : trackedOrder.currentStepIdx === 1
                                ? 50
                                : 100
                            }%`,
                            background:
                              trackedOrder.currentStepIdx === 1
                                ? 'linear-gradient(90deg, #b45309 0%, #7c3aed 100%)'
                                : trackedOrder.currentStepIdx >= 2
                                ? 'linear-gradient(90deg, #b45309 0%, #7c3aed 50%, #15803d 100%)'
                                : '#ede9fe',
                          }}
                        />
                      </div>

                      {/* 3 Step Nodes perfectly aligned */}
                      <div className={styles.stepsRow}>
                        {trackedOrder.adminSteps.map((step) => {
                          const StepIcon = step.icon;
                          return (
                            <div key={step.key} className={styles.stepNode}>
                              <div
                                className={styles.stepCircle}
                                style={{
                                  background: step.isDone ? step.bg : '#ffffff',
                                  borderColor: step.isCurrent
                                    ? step.color
                                    : step.isDone
                                    ? `${step.color}88`
                                    : '#ede9fe',
                                  boxShadow: step.isCurrent
                                    ? `0 0 0 5px ${step.color}22`
                                    : 'none',
                                }}
                              >
                                {step.isCompleted ? (
                                  <Check size={18} color={step.color} strokeWidth={2.8} />
                                ) : (
                                  <StepIcon
                                    size={18}
                                    color={step.isDone ? step.color : '#a78bfa'}
                                    strokeWidth={2.2}
                                  />
                                )}
                              </div>
                              <div className={styles.stepTextGroup}>
                                <span
                                  className={styles.stepMainLabel}
                                  style={{
                                    color: step.isDone ? step.color : '#64748b',
                                    fontWeight: step.isCurrent ? 700 : 600,
                                  }}
                                >
                                  {step.label}
                                </span>
                                <span className={styles.stepSubLabel}>
                                  {step.subText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Courier Service & Delivery Address Meta Section ── */}
                <div className={styles.metaGrid}>
                  {/* Left: Courier Service */}
                  <div className={styles.metaCol}>
                    <div className={styles.metaIcon}>
                      <Truck size={22} strokeWidth={1.7} />
                    </div>
                    <div className={styles.metaBody}>
                      <span className={styles.metaLabel}>COURIER SERVICE</span>
                      <span className={styles.metaCourierName}>
                        {trackedOrder.carrier}
                      </span>
                      <span className={styles.metaTrackingRow}>
                        Tracking ID: <strong>{trackedOrder.trackingId}</strong>
                      </span>
                      {trackedOrder.courierUrl && (
                        <a
                          href={trackedOrder.courierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.trackShipmentLink}
                        >
                          Track Shipment ↗ ({trackedOrder.courierUrl})
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Delivery Address */}
                  <div className={styles.metaCol}>
                    <div className={styles.metaIcon}>
                      <MapPin size={22} strokeWidth={1.7} />
                    </div>
                    <div className={styles.metaBody}>
                      <span className={styles.metaLabel}>DELIVERY ADDRESS</span>
                      <span className={styles.metaRecipientName}>
                        {trackedOrder.recipientName}
                      </span>
                      <span className={styles.metaAddressText}>
                        {trackedOrder.addressText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ════════════ CARD 2: Items in Order & Pricing Card ════════════ */}
              <div className={styles.itemsCard}>
                {/* Header: Items count + Total Paid */}
                <div className={styles.itemsCardHeader}>
                  <div className={styles.itemsCountTitle}>
                    <Package size={17} strokeWidth={2} />
                    <span>Items in Order ({trackedOrder.items.length})</span>
                  </div>
                  <div className={styles.itemsTotalPaid}>
                    Total Paid: {formatPrice(trackedOrder.total)}
                  </div>
                </div>

                {/* Items List */}
                <div className={styles.itemsListContainer}>
                  {trackedOrder.items.map((item, idx) => (
                    <div key={idx} className={styles.orderItemRow}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className={styles.orderItemThumb}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-product.png';
                        }}
                      />
                      <div className={styles.orderItemInfo}>
                        <span className={styles.orderItemName}>{item.title}</span>
                        {item.sku && (
                          <span className={styles.orderItemSku}>
                            SKU: {item.sku}
                          </span>
                        )}
                        <span className={styles.orderItemQtyPrice}>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </div>
                      <span className={styles.orderItemTotalPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary Box */}
                <div className={styles.pricingBreakdownBox}>
                  <div className={styles.breakdownRow}>
                    <span>Item Total (Subtotal):</span>
                    <span>{formatPrice(trackedOrder.subtotal)}</span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Shipping & Handling:</span>
                    <span>
                      {trackedOrder.shippingFee > 0 ? formatPrice(trackedOrder.shippingFee) : 'Free'}
                    </span>
                  </div>
                  {trackedOrder.convenienceFee > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Convenience Fee:</span>
                      <span>{formatPrice(trackedOrder.convenienceFee)}</span>
                    </div>
                  )}
                  {trackedOrder.discountAmount > 0 && (
                    <div className={styles.breakdownRow} style={{ color: '#16a34a' }}>
                      <span>Discount:</span>
                      <span>- {formatPrice(trackedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className={styles.breakdownDivider} />
                  <div className={styles.breakdownTotalRow}>
                    <span>Grand Total:</span>
                    <span>{formatPrice(trackedOrder.total)}</span>
                  </div>
                </div>

                {/* Card 2 Footer Action Buttons */}
                <div className={styles.cardActionsRow}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={styles.printInvoiceBtn}
                  >
                    <Printer size={15} />
                    <span>Print Tax Invoice</span>
                  </button>
                  <a
                    href={`https://wa.me/919840123456?text=${encodeURIComponent(`Hi Picky Store, I need an update on my Order #${trackedOrder.orderNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappSupportBtn}
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Store Support</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

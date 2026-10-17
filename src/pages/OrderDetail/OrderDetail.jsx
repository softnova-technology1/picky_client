import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import OrderTracker from '../../components/order/OrderTracker';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, MessageCircle, FileText, ChevronRight, Gift } from 'lucide-react';
import styles from './OrderDetail.module.css';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

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
          <Link to="/profile?tab=orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
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
          {/* Animated Breadcrumb Nav */}
          <div className={styles.breadcrumbNav}>
            <Link to="/profile?tab=orders" className={styles.breadcrumbLink}>
              <ArrowLeft size={16} /> My Orders
            </Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbCurrent}>Order #{order.orderNumber}</span>
          </div>

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
                  <CreditCard size={14} /> Paid via Razorpay
                </span>
                {order.razorpayPaymentId && (
                  <span className={styles.razorpayIdTag}>
                    Ref: {order.razorpayPaymentId}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.headerActions}>
              <button 
                onClick={() => window.print()}
                className={styles.actionBtn}
                title="Print or Save Invoice PDF"
              >
                <FileText size={16} /> Print Receipt
              </button>
            </div>
          </div>

          {/* Live Order Tracker - ALWAYS EXPANDED */}
          <div className={styles.trackerSectionWrapper}>
            <OrderTracker orderId={order._id} initialData={order} />
          </div>

          {/* Main Details Grid - ALWAYS EXPANDED, NO COLLAPSED WORKFLOWS */}
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

              {/* Gift Message Box (ONLY shown when order was placed with Gift Wrap) */}
              {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                <div
                  style={{
                    margin: '1.25rem 1.5rem 0',
                    padding: '0.95rem 1.15rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                    border: '1.5px solid #fecdd3',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Gift size={16} /> Gift Wrapping Included {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9f1239', background: '#fecdd3', padding: '0.15rem 0.55rem', borderRadius: '9999px' }}>
                      Gift Order
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#881337', lineHeight: 1.5 }}>
                    <strong>Personalized Gift Message: </strong>
                    <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239' }}>
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

                {(() => {
                  const diff = Math.max(0, Number(order.total || 0) - (Number(order.subtotal || 0) - Number(order.discountAmount || 0)));
                  const convFee = Number(order.convenienceFee) > 0 ? Number(order.convenienceFee) : (diff === 42 ? 2 : 0);
                  if (convFee > 0) {
                    return (
                      <div className={styles.invoiceRow}>
                        <span>Convenience Fee</span>
                        <span className={styles.invoiceValue}>{formatPrice(convFee)}</span>
                      </div>
                    );
                  }
                  return null;
                })()}

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
        </div>
      </div>
    </PageWrapper>
  );
}

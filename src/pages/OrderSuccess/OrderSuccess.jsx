import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PageWrapper from '../../components/layout/PageWrapper';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import {
  Check,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  Gift,
  FileText,
  Printer,
  Download,
  X,
  MapPin,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import styles from './OrderSuccess.module.css';
import AdminInvoice from '../../components/admin/AdminInvoice';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      const startTime = Date.now();
      try {
        setLoading(true);
        let orderData = null;

        // 1. Try tracking endpoint first (public, accepts both orderNumber and ObjectId)
        try {
          const trackRes = await orderService.trackByOrderNumber(id);
          orderData = trackRes?.data?.data || trackRes?.data || trackRes;
        } catch (_) {}

        // 2. If not found or failed, try getById
        if (!orderData || (!orderData.orderNumber && !orderData._id)) {
          try {
            const res = await orderService.getById(id);
            orderData = res?.data?.data || res?.data || res;
          } catch (_) {}
        }

        if (orderData && (orderData.orderNumber || orderData._id)) {
          setOrder(orderData);
        }
      } catch (err) {
        console.warn('Failed to load order details:', err);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 1000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id]);

  const handlePrintInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = () => {
    setShowInvoiceModal(true);
  };

  const orderSubtotal = order?.subtotal ?? (order?.total || 0);
  const orderDiscount = order?.discountAmount ?? 0;
  const orderShipping = order?.shippingFee ?? 0;
  const convenienceFee = order?.convenienceFee ?? 0;
  const giftWrapFee = order?.giftWrap?.fee ?? (order?.giftWrapFee || 0);
  const orderTotal = order?.totalAmount ?? (order?.total || 0);

  return (
    <PageWrapper>
      <div className={styles['success-section']}>
        <div className={styles['container']}>

          {/* ── 4-STEP STEPPER HEADER BAR WITH CONFIRM ACTIVE ── */}
          <div className={`${styles['stepper-wrapper']} ${styles.noPrint} noPrint`}>
            <div className={styles['stepper-header']}>
              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>BAG</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CHECKOUT</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['completed']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>PAYMENT</span>
              </div>

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              <div className={`${styles['step-item']} ${styles['active']}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      <Check size={11} strokeWidth={3.5} />
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CONFIRM</span>
              </div>
            </div>
          </div>

          <div className={`${styles['success-card-wrapper']} ${styles.noPrint} noPrint`}>
            
            {/* Circle Checkmark Icon */}
            <div className={styles['check-icon-circle']}>
              <Check size={42} strokeWidth={3} />
            </div>

            {/* Thank You Title */}
            <h1 className={styles['success-title']}>
              Thank You for Choosing Picky Store
            </h1>

            {/* Subheading Quote */}
            <p className={styles['success-quote']}>
              "Your order has been successfully placed and our artisans are preparing your handcrafted order with the utmost care."
            </p>

            {/* ── Order Details Section ── */}
            {loading && !order ? (
              <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                <Spinner size={36} />
              </div>
            ) : order ? (
              <div className={styles.orderDetailsCard}>
                
                {/* 1. Header Row: Order Number, Date & Invoice Button */}
                <div className={styles.orderHeaderBar}>
                  <div className={styles.orderHeaderLeft}>
                    <div className={styles.orderNumTag}>
                      <span>ORDER #</span>
                      <strong>{order.orderNumber || order._id}</strong>
                    </div>
                    <span className={styles.orderDateText}>
                      Placed on {formatDate(order.createdAt || new Date())}
                    </span>
                  </div>

                  {/* ── The 'Print Invoice' Button ── */}
                  <div className={styles.orderHeaderRight}>
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className={styles.invoiceBtn}
                      title="Print Official Tax Invoice"
                    >
                      <Printer size={16} />
                      <span>Print Invoice</span>
                    </button>
                  </div>
                </div>

                {/* 2. Purchased Items Section */}
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className={styles.itemsSection}>
                    <div className={styles.sectionHeading}>
                      <Package size={17} color="#7c3aed" />
                      <span>Ordered Items ({order.items.length})</span>
                    </div>

                    <div className={styles.itemsList}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <img
                            src={
                              item.image ||
                              item.product?.image ||
                              item.product?.images?.[0] ||
                              '/images/products/saree.png'
                            }
                            alt={item.name}
                            className={styles.itemImg}
                          />
                          <div className={styles.itemInfo}>
                            <h4 className={styles.itemName}>{item.name}</h4>
                            <div className={styles.itemMeta}>
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            </div>
                          </div>
                          <div className={styles.itemPrice}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Two-Column Grid: Delivery Address & Order Financial Summary */}
                <div className={styles.detailsTwoCol}>
                  
                  {/* Delivery Address & Mode */}
                  <div className={styles.addressBox}>
                    <div className={styles.sectionHeading}>
                      <MapPin size={17} color="#7c3aed" />
                      <span>Delivery Details</span>
                    </div>
                    
                    <div className={styles.addressContent}>
                      <strong>{order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.name || 'Customer'}</strong>
                      <p>{order.shippingAddress?.street || order.shippingAddress?.address || 'Street Address'}</p>
                      <p>
                        {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ''}
                        {order.shippingAddress?.state || ''}
                        {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                      </p>
                      {(order.shippingAddress?.phone || order.user?.phone) && (
                        <p className={styles.phoneText}>📞 {order.shippingAddress?.phone || order.user?.phone}</p>
                      )}
                    </div>

                    <div className={styles.dispatchModePill}>
                      <Truck size={15} color="#059669" />
                      <span>Dispatch: <strong>{order.courier || 'Express Courier Service'}</strong></span>
                    </div>

                    {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                      <div className={styles.giftPill}>
                        <Gift size={15} color="#e11d48" />
                        <div>
                          <strong>Gift Wrapping Included</strong>
                          {order.giftWrap?.message && (
                            <p className={styles.giftMsg}>"{order.giftWrap.message}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className={styles.summaryBox}>
                    <div className={styles.sectionHeading}>
                      <CreditCard size={17} color="#7c3aed" />
                      <span>Payment & Summary</span>
                    </div>

                    <div className={styles.summaryRows}>
                      <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>{formatPrice(orderSubtotal)}</span>
                      </div>

                      {orderDiscount > 0 && (
                        <div className={`${styles.summaryRow} ${styles.discountText}`}>
                          <span>Discount Applied:</span>
                          <span>-{formatPrice(orderDiscount)}</span>
                        </div>
                      )}

                      <div className={styles.summaryRow}>
                        <span>Shipping Fee:</span>
                        <span>{orderShipping > 0 ? formatPrice(orderShipping) : 'FREE'}</span>
                      </div>

                      {convenienceFee > 0 && (
                        <div className={styles.summaryRow}>
                          <span>Platform Fee:</span>
                          <span>{formatPrice(convenienceFee)}</span>
                        </div>
                      )}

                      {giftWrapFee > 0 && (
                        <div className={styles.summaryRow}>
                          <span>Gift Wrapping Fee:</span>
                          <span>{formatPrice(giftWrapFee)}</span>
                        </div>
                      )}

                      <div className={styles.summaryTotalRow}>
                        <span>Total Paid:</span>
                        <span className={styles.totalAmount}>{formatPrice(orderTotal)}</span>
                      </div>
                    </div>

                    <div className={styles.paymentMethodBadge}>
                      <ShieldCheck size={16} color="#059669" />
                      <span>Payment Verified • {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ONLINE'}</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#fbf9ff', borderRadius: '16px', border: '1.5px dashed #ddd6fe', margin: '1.75rem 0' }}>
                <Package size={40} color="#7c3aed" style={{ marginBottom: '0.65rem' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.4rem 0' }}>Order #{id} Confirmed!</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, maxWidth: '440px', display: 'inline-block' }}>
                  Your order has been recorded successfully. A confirmation message and invoice details are available on your account.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles['actions-row']}>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className={`${styles['action-btn']} ${styles['invoiceAction']}`}
                title="Download Official Tax Invoice as PDF"
              >
                <Download size={18} />
                <span>{downloading ? 'Downloading...' : 'Download Invoice'}</span>
              </button>

              {order?.orderNumber && (
                <Link
                  to={`/track-order?id=${order.orderNumber}`}
                  className={`${styles['action-btn']} ${styles['primary']}`}
                >
                  <span>Track Live Order Timeline</span>
                  <ArrowRight size={18} />
                </Link>
              )}

              <Link
                to="/products"
                className={`${styles['action-btn']} ${styles['secondary']}`}
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </Link>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════════════
              OFFICIAL GST TAX INVOICE (UNIFIED ADMIN & STOREFRONT INVOICE)
             ══════════════════════════════════════════════════════════════════ */}
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


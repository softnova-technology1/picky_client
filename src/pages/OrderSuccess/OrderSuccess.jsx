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
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      setDownloading(true);
      const invoiceElement = document.getElementById('printable-tax-invoice');
      if (!invoiceElement) {
        setDownloading(false);
        return;
      }

      // Clone element for clean off-screen rendering
      const clone = invoiceElement.cloneNode(true);
      clone.style.display = 'block';
      clone.style.position = 'fixed';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.zIndex = '-99999';
      clone.style.visibility = 'visible';
      clone.style.background = '#ffffff';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice-${order.orderNumber || order._id || 'Picky'}.pdf`);
    } catch (err) {
      console.error('Invoice PDF Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Tax calculations for GST invoice
  const orderTotal = Number(order?.totalAmount || order?.total || 0);
  const orderSubtotal = Number(order?.subtotal || orderTotal);
  const orderDiscount = Number(order?.discountAmount || 0);
  const orderShipping = Number(order?.shippingFee || 0);
  const convenienceFee = Number(order?.convenienceFee || 0);
  const giftWrapFee = Boolean(order?.giftWrap?.isGiftWrapped || order?.giftWrapFee > 0)
    ? Number(order?.giftWrap?.fee || order?.giftWrapFee || 30)
    : 0;
  const taxableBase = Math.max(0, (orderTotal - orderShipping - giftWrapFee - convenienceFee) / 1.05);
  const totalGst = (orderTotal - orderShipping - giftWrapFee - convenienceFee) - taxableBase;
  const halfGst = totalGst / 2;

  const renderTaxInvoiceBody = (containerId) => {
    if (!order) return null;
    return (
      <div id={containerId} className={styles.taxInvoiceWrapper}>
        {/* Header Row: Seller & Invoice Meta */}
        <div className={styles.invoiceHeaderRow}>
          <div>
            <div className={styles.sellerBrand}>PICKY CRAFTS & TEXTILES PVT. LTD.</div>
            <div className={styles.sellerMeta}>
              Registered Office: 42, Heritage Weavers Street, Madurai, Tamil Nadu - 625001<br />
              <strong>GSTIN:</strong> 33AABCP1234F1Z5 | <strong>PAN:</strong> AABCP1234F<br />
              <strong>State:</strong> 33 - Tamil Nadu | <strong>CIN:</strong> U52100TN2024PTC123456<br />
              <strong>Support Email:</strong> care@picky.in | <strong>Phone:</strong> +91 98765 43210
            </div>
          </div>
          <div className={styles.invoiceMetaBox}>
            <div className={styles.taxInvoiceTitle}>TAX INVOICE</div>
            <div><strong>Invoice No:</strong> INV-{order.orderNumber}</div>
            <div><strong>Invoice Date:</strong> {formatDate(order.createdAt || new Date())}</div>
            <div><strong>Order Ref:</strong> {order.orderNumber}</div>
            <div><strong>Place of Supply:</strong> {order.shippingAddress?.state || 'Tamil Nadu'} (Code: 33)</div>
          </div>
        </div>

        {/* Customer Billing & Shipping Address */}
        <div className={styles.invoiceAddressesGrid}>
          <div>
            <div className={styles.addressColTitle}>Billed To (Customer Details)</div>
            <strong>{order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.name || 'Customer'}</strong>
            <div>{order.shippingAddress?.street || order.shippingAddress?.address}</div>
            <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
            <div>Phone: {order.shippingAddress?.phone || order.user?.phone || 'N/A'}</div>
          </div>
          <div>
            <div className={styles.addressColTitle}>Shipped To (Delivery Destination)</div>
            <strong>{order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.name || 'Customer'}</strong>
            <div>{order.shippingAddress?.street || order.shippingAddress?.address}</div>
            <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
            <div>Country: India</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className={styles.invoiceTable}>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>Description of Goods / Services</th>
              <th style={{ width: '80px', textAlign: 'center' }}>HSN / SAC</th>
              <th style={{ width: '40px', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Unit Rate (₹)</th>
              <th style={{ width: '95px', textAlign: 'right' }}>Taxable Value (₹)</th>
              <th style={{ width: '85px', textAlign: 'right' }}>CGST (2.5%)</th>
              <th style={{ width: '85px', textAlign: 'right' }}>SGST (2.5%)</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => {
              const itemGross = Number(item.price) * Number(item.quantity);
              const itemBase = itemGross / 1.05;
              const itemGst = itemGross - itemBase;
              const itemHalfGst = itemGst / 2;
              return (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      SKU: {item.sku || `PKY-ITEM-${idx + 101}`}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>5208</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                  <td style={{ textAlign: 'right' }}>₹{itemBase.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{itemHalfGst.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{itemHalfGst.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}><strong>{formatPrice(itemGross)}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Breakdown Grid */}
        <div className={styles.invoiceSummaryGrid}>
          <div className={styles.invoiceSummaryBox}>
            <div className={styles.summaryRow}>
              <span>Subtotal (Gross):</span>
              <span>{formatPrice(orderSubtotal)}</span>
            </div>
            {orderDiscount > 0 && (
              <div className={styles.summaryRow} style={{ color: '#16a34a' }}>
                <span>Coupon Discount:</span>
                <span>-{formatPrice(orderDiscount)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Taxable Amount:</span>
              <span>₹{taxableBase.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>CGST (2.5%):</span>
              <span>₹{halfGst.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>SGST (2.5%):</span>
              <span>₹{halfGst.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Charges:</span>
              <span>{orderShipping > 0 ? formatPrice(orderShipping) : 'FREE'}</span>
            </div>
            {convenienceFee > 0 && (
              <div className={styles.summaryRow}>
                <span>Platform / Convenience Fee:</span>
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
              <span>Grand Total (INR):</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info & Signatory */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ fontSize: '11px', color: '#475569', maxWidth: '420px', lineHeight: '1.6' }}>
            <strong>Payment Information:</strong><br />
            Mode: {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ONLINE PAYMENT'}<br />
            {order.razorpayPaymentId && <span>Transaction ID: {order.razorpayPaymentId}<br /></span>}
            Status: Completed • Transaction Verified<br />
            Goods once sold are covered under Picky's 7-Day Replacement Policy.
          </div>
          <div style={{ textAlign: 'center', minWidth: '180px' }}>
            <div style={{ fontStyle: 'italic', color: '#7c3aed', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              Picky Authorized Signatory
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>This is a computer-generated official tax invoice.</div>
          </div>
        </div>
      </div>
    );
  };

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
            ) : null}

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
              OFFICIAL GST TAX INVOICE MODAL & VECTOR PDF PRINT TEMPLATE
             ══════════════════════════════════════════════════════════════════ */}
          {showInvoiceModal && order && (
            <div className={`${styles.invoiceModalOverlay} ${styles.printableInvoiceArea} printableInvoiceArea`}>
              <div className={styles.invoiceModalBox}>
                
                {/* Modal Top Bar - Hidden during print */}
                <div className={`${styles.modalHeader} ${styles.noPrint} noPrint`}>
                  <div className={styles.modalTitle}>
                    <FileText size={22} color="#7c3aed" />
                    <span>Official Tax Invoice — #{order.orderNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className={styles.printBtn}
                    >
                      <Printer size={16} />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInvoiceModal(false)}
                      className={styles.modalCloseBtn}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Printable Invoice Body */}
                {renderTaxInvoiceBody('modal-tax-invoice')}

              </div>
            </div>
          )}

          {/* Hidden off-screen invoice container permanently mounted for direct PDF download */}
          {order && (
            <div
              style={{
                position: 'fixed',
                left: '-99999px',
                top: 0,
                width: '800px',
                pointerEvents: 'none',
                opacity: 0,
                zIndex: -100,
              }}
            >
              {renderTaxInvoiceBody('printable-tax-invoice')}
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}


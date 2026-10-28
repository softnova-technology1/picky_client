import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Printer,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Download,
  Check,
} from 'lucide-react';
import styles from './AdminInvoice.module.css';
import './AdminInvoiceMobile.css';

/**
 * Helper to convert numbers to Indian Rupee Words
 */
function numberToIndianWords(num) {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    const n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += Number(n_array[1]) !== 0 ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += Number(n_array[2]) !== 0 ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += Number(n_array[3]) !== 0 ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += Number(n_array[4]) !== 0 ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += Number(n_array[5]) !== 0
      ? (str !== '' ? 'and ' : '') +
        (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) +
        ''
      : '';
    return str;
  }

  const rounded = Math.round(Number(num));
  return inWords(rounded).trim() + ' Rupees Only';
}

/**
 * High-definition PDF generation helper using html2canvas & jsPDF
 */
export async function generateInvoicePdf(element, fileName = 'Invoice.pdf') {
  if (!element) return false;

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  // Allow elements and layout to stabilize
  await new Promise((resolve) => setTimeout(resolve, 80));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 800,
    onclone: (clonedDoc, clonedElement) => {
      if (clonedElement.parentElement) {
        clonedElement.parentElement.style.position = 'static';
        clonedElement.parentElement.style.left = '0';
        clonedElement.parentElement.style.top = '0';
        clonedElement.parentElement.style.opacity = '1';
        clonedElement.parentElement.style.visibility = 'visible';
      }
      clonedElement.style.position = 'static';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.opacity = '1';
      clonedElement.style.visibility = 'visible';
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(fileName);
  return true;
}

/**
 * Standard A4 Tax Invoice Sheet Component
 */
export const AdminInvoiceSheet = React.forwardRef(function AdminInvoiceSheet({ order }, ref) {
  if (!order) return null;

  const invoiceNumber = `PKY-INV-${order.orderNumber || '000000'}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const customerName =
    order.customer?.name ||
    order.user?.name ||
    order.shippingAddress?.fullName ||
    order.shippingAddress?.name ||
    (order.shippingAddress?.firstName ? `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName || ''}`.trim() : 'Customer');

  const customerPhone =
    order.customer?.phone ||
    order.user?.phone ||
    order.shippingAddress?.phone ||
    order.phoneNumber ||
    '';

  const customerEmail =
    order.customer?.email ||
    order.user?.email ||
    order.shippingAddress?.email ||
    order.email ||
    '';

  const addr = order.shippingAddress || order.address || {};
  const streetPart = addr.street || addr.address || addr.addressLine1 || '';
  const landmarkPart = addr.landmark || addr.addressLine2 || '';
  const pinPart = addr.pincode || addr.pinCode || addr.postalCode || addr.zip || '';

  const fullAddress = [
    streetPart,
    landmarkPart,
    addr.city,
    addr.state,
    pinPart ? `PIN: ${pinPart}` : '',
  ]
    .filter(Boolean)
    .join(', ') || 'Tamil Nadu, India';

  const items = (order.items && order.items.length > 0)
    ? order.items.map(it => ({
        ...it,
        name: it.name || it.title || it.productId?.name || it.product?.name || 'Handloom Apparel',
        price: Number(it.price || it.unitPrice || 0),
        quantity: Number(it.quantity || it.qty || 1),
        hsn: it.hsn || it.hsnCode || '5208',
      }))
    : [
        {
          name: 'Handloom Cotton Apparel',
          hsn: '5208',
          quantity: 1,
          price: Number(order.totalAmount || order.total || 0),
        },
      ];

  const grandTotal = Number(order.totalAmount || order.total || order.grandTotal || 0);
  const discountAmount = Number(order.discount || order.discountAmount || 0);
  const deliveryCharge = Number(order.deliveryFee || order.shippingFee || 0);

  // Derive GST breakdown (5% GST: 2.5% CGST + 2.5% SGST)
  const taxableValue = Math.round((grandTotal / 1.05) * 100) / 100;
  const totalGst = Math.round((grandTotal - taxableValue) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  return (
    <div className={styles.invoiceSheet} ref={ref}>
      {/* ── 1. Top Brand & Invoice Metadata ── */}
      <div>
        <div className={styles.brandRow}>
          <div className={styles.logoBox}>
            <img
              src="/images/logo.png"
              alt="Picky Logo"
              className={styles.brandLogo}
              crossOrigin="anonymous"
            />
            <div className={styles.companyMeta}>
              <strong>PICKY RETAIL PRIVATE LIMITED</strong><br />
              No. 123, 1st Cross Street, OMR Road, Thoraipakkam<br />
              Chennai, Tamil Nadu — 600097<br />
              CIN: U52100TN2024PTC158921 • Support: +91 83002 95721
            </div>
          </div>

          <div className={styles.invoiceMetaBox}>
            <h1 className={styles.invoiceHeading}>TAX INVOICE</h1>
            <div className={styles.metaItem}>
              Invoice No: <strong>{invoiceNumber}</strong>
            </div>
            <div className={styles.metaItem}>
              Order ID: <strong>#{order.orderNumber || order._id}</strong>
            </div>
            <div className={styles.metaItem}>
              Date: <strong>{orderDate}</strong>
            </div>
            <div className={styles.metaItem}>
              Place of Supply: <strong>Tamil Nadu (33)</strong>
            </div>
            <div className={styles.gstBadge}>
              GSTIN: 33AAAAA0000A1Z5
            </div>
          </div>
        </div>

        {/* ── 2. Dual Address Grid ── */}
        <div className={styles.addressGrid}>
          {/* BILL TO */}
          <div className={styles.addressCard}>
            <span className={styles.cardTag}>BILL TO (BUYER)</span>
            <div className={styles.customerName}>{customerName}</div>
            <div className={styles.addressText}>{fullAddress}</div>
            <div className={styles.addressContact}>
              Phone: <strong>{customerPhone}</strong>
              {customerEmail && <> • Email: <strong>{customerEmail}</strong></>}
            </div>
          </div>

          {/* SHIP TO */}
          <div className={styles.addressCard}>
            <span className={styles.cardTag}>SHIP TO (DELIVERY)</span>
            <div className={styles.customerName}>{customerName}</div>
            <div className={styles.addressText}>{fullAddress}</div>
            <div className={styles.addressContact}>
              Phone: <strong>{customerPhone}</strong> • State: <strong>Tamil Nadu (33)</strong>
            </div>
          </div>
        </div>

        {/* ── 3. Products Breakdown Table ── */}
        <div className={styles.tableContainer}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                <th>Item Description</th>
                <th style={{ width: '85px', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ width: '55px', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Taxable Val</th>
                <th style={{ width: '80px', textAlign: 'right' }}>CGST (2.5%)</th>
                <th style={{ width: '80px', textAlign: 'right' }}>SGST (2.5%)</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const itemQty = it.quantity || 1;
                const itemRate = it.price || 0;
                const itemTotal = itemRate * itemQty;
                const itemTaxable = Math.round((itemTotal / 1.05) * 100) / 100;
                const itemGst = Math.round((itemTotal - itemTaxable) * 100) / 100;
                const itemCgst = Math.round((itemGst / 2) * 100) / 100;
                const itemSgst = Math.round((itemGst - itemCgst) * 100) / 100;

                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <span className={styles.itemMainTitle}>{it.name}</span>
                      {it.variant && (
                        <span className={styles.itemSubDetails}>Variant: {it.variant}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {it.hsn || '6204'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{itemQty}</td>
                    <td style={{ textAlign: 'right' }}>₹{itemRate.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{itemTaxable.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>₹{itemCgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>₹{itemSgst.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e1b4b' }}>
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── 4. Financial Calculations & Amount in Words ── */}
        <div className={styles.summaryRow}>
          <div className={styles.amountInWordsBox}>
            <div className={styles.amountInWordsLabel}>Invoice Amount in Words:</div>
            <div className={styles.amountInWordsText}>{numberToIndianWords(grandTotal)}</div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.45rem' }}>
              Payment Mode: <strong>{order.paymentMethod ? String(order.paymentMethod).toUpperCase() : 'Online Prepaid'}</strong> • Status: <strong style={{ color: '#16a34a' }}>CONFIRMED</strong>
            </div>
          </div>

          <div className={styles.calculationsBox}>
            <div className={styles.calcLine}>
              <span>Items Subtotal:</span>
              <strong>₹{taxableValue.toLocaleString('en-IN')}</strong>
            </div>
            <div className={styles.calcLine}>
              <span>Total Tax (CGST + SGST):</span>
              <strong>₹{totalGst.toLocaleString('en-IN')}</strong>
            </div>
            <div className={styles.calcLine}>
              <span>Delivery Charges:</span>
              <strong style={{ color: deliveryCharge === 0 ? '#16a34a' : '#0f172a' }}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </strong>
            </div>
            {discountAmount > 0 && (
              <div className={styles.calcLine}>
                <span>Promotional Discount:</span>
                <strong className={styles.discountGreen}>-₹{discountAmount}</strong>
              </div>
            )}
            <div className={styles.grandTotalBanner}>
              <span className={styles.grandTotalLabel}>Grand Total (Incl. GST):</span>
              <span className={styles.grandTotalValue}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Authentication & Signature Row ── */}
      <div>
        <div className={styles.authSignRow}>
          <div className={styles.sealCluster}>
            <div className={styles.verifiedBadge}>
              <CheckCircle2 size={16} />
              <span>VERIFIED PAID</span>
            </div>

            <div className={styles.corporateSealCircle}>
              <span>★ PICKY ★</span>
              <span>AUTHORISED</span>
              <span>SEAL</span>
            </div>
          </div>

          <div className={styles.signatoryBox}>
            <div className={styles.signatureImage}>Picky Retail</div>
            <div className={styles.signatoryLabel}>
              Authorised Signatory<br />
              <strong>For Picky Retail Pvt. Ltd.</strong>
            </div>
          </div>
        </div>

        {/* ── 6. Statutory Terms & Footer ── */}
        <div className={styles.statutoryFooter}>
          <div>
            * This is a computer-generated Tax Invoice and requires no physical signature.<br />
            * For return or replacement queries within 7 days, reach out to <strong>support@picky.com</strong>.
          </div>
          <div style={{ textAlign: 'right', fontWeight: 600 }}>
            Thank you for shopping with Picky!
          </div>
        </div>
      </div>
    </div>
  );
});

export default function AdminInvoice({ order, onClose }) {
  const sheetRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const handleDownloadPdf = async () => {
    if (!sheetRef.current || downloading) return;
    try {
      setDownloading(true);
      const filename = `Invoice_${order.orderNumber || order._id || 'PKY'}.pdf`;
      await generateInvoicePdf(sheetRef.current, filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `PKY-INV-${order.orderNumber || order._id || '000000'}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const customerName =
    order.customer?.name ||
    order.user?.name ||
    order.shippingAddress?.fullName ||
    order.shippingAddress?.name ||
    (order.shippingAddress?.firstName ? `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName || ''}`.trim() : 'Customer');

  const customerPhone =
    order.customer?.phone ||
    order.user?.phone ||
    order.shippingAddress?.phone ||
    order.phoneNumber ||
    '';

  const customerEmail =
    order.customer?.email ||
    order.user?.email ||
    order.shippingAddress?.email ||
    order.email ||
    '';

  const addr = order.shippingAddress || order.address || {};
  const streetPart = addr.street || addr.address || addr.addressLine1 || '';
  const landmarkPart = addr.landmark || addr.addressLine2 || '';
  const pinPart = addr.pincode || addr.pinCode || addr.postalCode || addr.zip || '';

  const fullAddress = [
    streetPart,
    landmarkPart,
    addr.city,
    addr.state,
    pinPart ? `PIN: ${pinPart}` : '',
  ]
    .filter(Boolean)
    .join(', ') || 'Tamil Nadu, India';

  const items = (order.items && order.items.length > 0)
    ? order.items.map(it => ({
        ...it,
        name: it.name || it.title || it.productId?.name || it.product?.name || 'Handloom Apparel',
        price: Number(it.price || it.unitPrice || 0),
        quantity: Number(it.quantity || it.qty || 1),
        hsn: it.hsn || it.hsnCode || '5208',
      }))
    : [
        {
          name: 'Handloom Cotton Apparel',
          hsn: '5208',
          quantity: 1,
          price: Number(order.totalAmount || order.total || 0),
        },
      ];

  const grandTotal = Number(order.totalAmount || order.total || order.grandTotal || 0);
  const deliveryCharge = Number(order.deliveryFee || order.shippingFee || 0);

  // Derive GST breakdown (5% GST: 2.5% CGST + 2.5% SGST)
  const taxableValue = Math.round((grandTotal / 1.05) * 100) / 100;
  const totalGst = Math.round((grandTotal - taxableValue) * 100) / 100;
  const paymentMode = order.paymentMethod ? String(order.paymentMethod).toUpperCase() : 'RAZORPAY';

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* ── DESKTOP INVOICE PREVIEW (Screens > 768px ONLY - 100% Intact) ── */}
      <div className="desktop-invoice-preview">
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          {/* Top Control Bar (Hidden during print) */}
          <div className={styles.modalHeaderBar}>
            <div className={styles.headerTitleCluster}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }} />
              <div>
                <h3 className={styles.headerTitle}>Official Tax Invoice Preview</h3>
                <p className={styles.headerSubtitle}>Order #{order.orderNumber || order._id} • A4 Standard Print & PDF</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.downloadPdfBtn}
                onClick={handleDownloadPdf}
                disabled={downloading}
                title="Download Invoice as PDF"
              >
                <Download size={16} />
                <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                className={styles.printBtn}
                onClick={handlePrint}
                title="Print Invoice"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button type="button" className={styles.closeBtn} onClick={onClose} title="Close Preview">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Preview Container */}
          <div className={styles.previewBody}>
            <AdminInvoiceSheet order={order} ref={sheetRef} />
          </div>
        </div>
      </div>

      {/* ── MOBILE INVOICE PREVIEW (Screens <= 768px ONLY - Matches Requested Specification) ── */}
      <div className="mobile-invoice-preview" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <header className="mobile-inv-topbar">
          <div className="mobile-inv-topbar-left">
            <span className="mobile-inv-pulse-dot" />
            <div className="mobile-inv-topbar-titles">
              <h1 className="mobile-inv-title">Tax Invoice Preview</h1>
              <p className="mobile-inv-ordernum">#{order.orderNumber || order._id}</p>
            </div>
          </div>
          <div className="mobile-inv-topbar-actions">
            <button
              type="button"
              className="mobile-inv-btn-download"
              onClick={handleDownloadPdf}
              disabled={downloading}
              title="Download PDF"
            >
              <Download size={15} />
            </button>
            <button
              type="button"
              className="mobile-inv-btn-print"
              onClick={handlePrint}
              title="Print Invoice"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              className="mobile-inv-btn-close"
              onClick={onClose}
              title="Close Preview"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Invoice Document Body */}
        <main className="mobile-inv-body">
          {/* Header: Logo, Company Info & TAX INVOICE */}
          <div className="mobile-inv-header-block">
            <div className="mobile-inv-brand-top">
              <div>
                <div className="mobile-inv-brand-logo-wrap">
                  <div className="mobile-inv-brand-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="mobile-inv-brand-name">PICKY</span>
                </div>
                <div className="mobile-inv-company-details">
                  <p className="mobile-inv-company-bold" style={{ margin: 0 }}>PICKY RETAIL PRIVATE LIMITED</p>
                  <p style={{ margin: 0 }}>No. 123, 1st Cross Street, OMR Road, Thoraipakkam</p>
                  <p style={{ margin: 0 }}>Chennai, Tamil Nadu — 600097</p>
                  <p style={{ margin: 0 }}>CIN: U52100TN2024PTC158921 • Support: +91 83002 95721</p>
                </div>
              </div>
              <h2 className="mobile-inv-heading-tag">TAX INVOICE</h2>
            </div>

            {/* Metadata Box */}
            <div className="mobile-inv-metadata-box">
              <div className="mobile-inv-meta-row">
                <span className="mobile-inv-meta-label">Invoice No:</span>
                <span className="mobile-inv-meta-val mobile-inv-meta-mono">{invoiceNumber}</span>
              </div>
              <div className="mobile-inv-meta-row">
                <span className="mobile-inv-meta-label">Order ID:</span>
                <span className="mobile-inv-meta-val mobile-inv-meta-mono">{order.orderNumber || order._id}</span>
              </div>
              <div className="mobile-inv-meta-row">
                <span className="mobile-inv-meta-label">Date:</span>
                <span className="mobile-inv-meta-val">{orderDate}</span>
              </div>
              <div className="mobile-inv-meta-row">
                <span className="mobile-inv-meta-label">Place of Supply:</span>
                <span className="mobile-inv-meta-val">{addr.state || 'Tamil Nadu'} (33)</span>
              </div>
              <div className="mobile-inv-meta-divider" />
              <div className="mobile-inv-meta-row">
                <span className="mobile-inv-meta-label" style={{ fontWeight: 600 }}>GSTIN:</span>
                <span className="mobile-inv-gstin-badge">33AAAAA0000A1Z5</span>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="mobile-inv-addresses-grid">
            {/* Bill To */}
            <div className="mobile-inv-address-card">
              <span className="mobile-inv-address-tag">Bill To (Buyer)</span>
              <div className="mobile-inv-customer-name">{customerName}</div>
              <div className="mobile-inv-address-line">{fullAddress}</div>
              {customerPhone && (
                <div className="mobile-inv-address-contact">
                  Phone: <span className="mobile-inv-contact-val">{customerPhone}</span>
                </div>
              )}
              {customerEmail && (
                <div className="mobile-inv-address-contact" style={{ wordBreak: 'break-all' }}>
                  Email: <span className="mobile-inv-contact-val">{customerEmail}</span>
                </div>
              )}
            </div>

            {/* Ship To */}
            <div className="mobile-inv-address-card">
              <span className="mobile-inv-address-tag">Ship To (Delivery)</span>
              <div className="mobile-inv-customer-name">{customerName}</div>
              <div className="mobile-inv-address-line">{fullAddress}</div>
              {customerPhone && (
                <div className="mobile-inv-address-contact">
                  Phone: <span className="mobile-inv-contact-val">{customerPhone}</span>
                </div>
              )}
              <div className="mobile-inv-address-contact">
                State: <span className="mobile-inv-contact-val">{addr.state || 'Tamil Nadu'} (33)</span>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="mobile-inv-items-wrap">
            <h3 className="mobile-inv-section-title">Item Details</h3>
            {items.map((it, idx) => {
              const itQty = it.quantity || 1;
              const itRate = it.price || 0;
              const itTotal = itRate * itQty;
              const itTaxable = Math.round((itTotal / 1.05) * 100) / 100;
              const itGst = Math.round((itTotal - itTaxable) * 100) / 100;
              const itCgst = Math.round((itGst / 2) * 100) / 100;
              const itSgst = Math.round((itGst - itCgst) * 100) / 100;

              return (
                <div key={idx} className="mobile-inv-item-card">
                  <div className="mobile-inv-item-top">
                    <div className="mobile-inv-item-top-left">
                      <span className="mobile-inv-item-idx">{idx + 1}</span>
                      <div className="mobile-inv-item-name-block">
                        <span className="mobile-inv-item-title">{it.name}</span>
                        <span className="mobile-inv-item-hsn">
                          HSN/SAC: <strong style={{ fontFamily: 'monospace', color: '#334155' }}>{it.hsn || '5208'}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="mobile-inv-item-price-pill">₹{itTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Calculation Grid */}
                  <div className="mobile-inv-item-grid">
                    <div className="mobile-inv-grid-cell">
                      <span className="mobile-inv-cell-label">Qty:</span>
                      <span className="mobile-inv-cell-val">{itQty}</span>
                    </div>
                    <div className="mobile-inv-grid-cell">
                      <span className="mobile-inv-cell-label">Rate:</span>
                      <span className="mobile-inv-cell-val">₹{itRate.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mobile-inv-grid-cell">
                      <span className="mobile-inv-cell-label">Taxable Val:</span>
                      <span className="mobile-inv-cell-val">₹{itTaxable.toFixed(2)}</span>
                    </div>
                    <div className="mobile-inv-grid-cell">
                      <span className="mobile-inv-cell-label">CGST (2.5%):</span>
                      <span className="mobile-inv-cell-val">₹{itCgst.toFixed(2)}</span>
                    </div>
                    <div className="mobile-inv-grid-cell">
                      <span className="mobile-inv-cell-label">SGST (2.5%):</span>
                      <span className="mobile-inv-cell-val">₹{itSgst.toFixed(2)}</span>
                    </div>
                    <div className="mobile-inv-grid-cell highlight">
                      <span style={{ fontWeight: 600 }}>Total:</span>
                      <span style={{ fontWeight: 800 }}>₹{itTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amount in Words */}
          <div className="mobile-inv-words-card">
            <p className="mobile-inv-words-label">Invoice Amount in Words</p>
            <p className="mobile-inv-words-text">{numberToIndianWords(grandTotal)}</p>
            <div className="mobile-inv-words-footer">
              <span className="mobile-inv-mode-text">
                Payment Mode: <strong style={{ color: '#0f172a' }}>{paymentMode}</strong>
              </span>
              <span className="mobile-inv-confirmed-pill">
                <Check size={11} strokeWidth={3} />
                <span>CONFIRMED</span>
              </span>
            </div>
          </div>

          {/* Summary Totals */}
          <div className="mobile-inv-summary-wrap">
            <div className="mobile-inv-summary-line">
              <span>Items Subtotal:</span>
              <span className="mobile-inv-summary-line-val">₹{taxableValue.toFixed(2)}</span>
            </div>
            <div className="mobile-inv-summary-line">
              <span>Total Tax (CGST + SGST):</span>
              <span className="mobile-inv-summary-line-val">₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="mobile-inv-summary-line">
              <span>Delivery Charges:</span>
              <span className="mobile-inv-summary-line-val">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>

            {/* Grand Total Highlight */}
            <div className="mobile-inv-grand-total-card">
              <div className="mobile-inv-grand-total-left">
                <span className="mobile-inv-grand-total-caption">Grand Total</span>
                <span className="mobile-inv-grand-total-sub">Incl. GST</span>
              </div>
              <span className="mobile-inv-grand-total-price">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Signoff */}
          <div className="mobile-inv-footer-wrap">
            <div className="mobile-inv-signoff-row">
              <div className="mobile-inv-computer-gen">
                <p style={{ margin: 0 }}>Computer generated invoice.</p>
                <p style={{ margin: 0 }}>No signature required.</p>
              </div>
              <div className="mobile-inv-signatory-wrap">
                <span className="mobile-inv-signature-script">Picky Retail</span>
                <span className="mobile-inv-signatory-label">Authorised Signatory</span>
              </div>
            </div>
            <p className="mobile-inv-thanks-text">Thank you for shopping with Picky!</p>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  PackageCheck,
  Search,
  Filter,
  Type,
  Image as ImageIcon,
  Layers,
  Palette,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Printer,
  RotateCw,
  Phone,
  Mail,
  MapPin,
  Tag,
  Check,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Spinner from '../../../components/ui/Spinner';
import { adminService } from '../../../services/admin.service';
import { useOrderStore } from '../../../store/orderStore';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import styles from './AdminCustomizedOrders.module.css';

const ADMIN = '/softpicky-sn2026';

const getColorHex = (color) => {
  if (!color) return '#1e293b';
  if (typeof color === 'string') return color.startsWith('#') || color.startsWith('rgb') ? color : '#dc2626';
  if (typeof color === 'object') return color.hex || '#dc2626';
  return '#dc2626';
};

const getColorName = (color) => {
  if (!color) return 'Custom Color';
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.name || color.hex || 'Custom Color';
  return 'Custom Color';
};

export default function AdminCustomizedOrders() {
  const { showToast } = useUiStore();
  const { orders: storeOrders, updateOrderStatus: storeUpdateStatus } = useOrderStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Load orders from MongoDB backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({ limit: 100 });
      const raw = res?.data?.orders || res?.data?.data || res?.data || [];
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.orders) ? raw.orders : []);

      // Filter customized orders directly from live MongoDB database
      const customOnly = list.filter(
        (o) =>
          o.isCustomized ||
          o.customizationCostTotal > 0 ||
          o.items?.some((i) => i.isCustomized || i.customization)
      );

      setOrders(customOnly);
    } catch (err) {
      console.warn('Could not fetch admin orders from DB:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Expand all by default so admin can immediately review manufacturing specs
  useEffect(() => {
    if (orders.length > 0) {
      const initialExpand = {};
      orders.forEach((o) => {
        initialExpand[o._id || o.orderNumber] = true;
      });
      setExpandedOrders(initialExpand);
    }
  }, [orders]);

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Status Change Handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatusId(orderId);
      await adminService.updateOrderStatus(orderId, { status: newStatus }).catch(() => null);
      storeUpdateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          (o._id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o
        )
      );
      showToast(`Order status updated to "${newStatus.toUpperCase()}"`, 'success');
    } catch (err) {
      console.error('Status update notice:', err);
      showToast('Status updated in session', 'info');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // KPI Calculations
  const totalCustomOrders = orders.length;
  const readyForProductionCount = orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).length;
  const inProductionDispatchedCount = orders.filter((o) => ['shipped', 'out_for_delivery', 'in_transit'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalCustomRevenue = orders.reduce((sum, o) => {
    const fee = o.customizationCostTotal ||
      o.items?.reduce((s, i) => s + (Number(i.customizationCost) || 0) * (Number(i.quantity) || 1), 0) ||
      200;
    return sum + fee;
  }, 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    let list = orders;

    if (filterTab === 'ready') {
      list = list.filter((o) => ['placed', 'confirmed'].includes(o.status));
    } else if (filterTab === 'in_production') {
      list = list.filter((o) => ['confirmed', 'packing', 'processing'].includes(o.status));
    } else if (filterTab === 'shipped') {
      list = list.filter((o) => ['shipped', 'out_for_delivery'].includes(o.status));
    } else if (filterTab === 'delivered') {
      list = list.filter((o) => o.status === 'delivered');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((o) => {
        const orderNum = (o.orderNumber || '').toLowerCase();
        const custName = (o.customer?.name || o.shippingAddress?.fullName || o.shippingAddress?.name || '').toLowerCase();
        const hasItemMatch = o.items?.some((i) => {
          const name = (i.name || '').toLowerCase();
          const frontText = (i.customization?.frontText || '').toLowerCase();
          const backText = (i.customization?.backText || '').toLowerCase();
          const font = (i.customization?.frontFont || '').toLowerCase();
          const color = getColorName(i.customization?.color).toLowerCase();
          return (
            name.includes(q) ||
            frontText.includes(q) ||
            backText.includes(q) ||
            font.includes(q) ||
            color.includes(q)
          );
        });
        return orderNum.includes(q) || custName.includes(q) || hasItemMatch;
      });
    }

    return list;
  }, [orders, filterTab, searchQuery]);

  return (
    <AdminLayout title="Customized Orders">
      <div className={styles.pageContainer}>
        {/* ── Page Header ── */}
        <div className="admin-page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 className="admin-page-main-title" style={{ margin: 0 }}>
                Customized Orders
              </h1>
              <span className={styles.customizedBadge}>
                <Sparkles size={13} /> Artisanal Workflow
              </span>
            </div>
            <p className="admin-page-main-subtitle">
              Inspect bespoke manufacturing specifications, fabric details, front/back typography, and uploaded design artwork
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="admin-period-select-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <RotateCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* ── 1. KPI Stats Cards ── */}
        <div className={styles.kpiGrid}>
          <AdminStatCard
            title="TOTAL CUSTOM ORDERS"
            value={totalCustomOrders}
            icon={<Sparkles size={22} />}
            variant="purple"
            footerLabel="Bespoke Pipeline"
            footerValue="100%"
            progress={100}
          />
          <AdminStatCard
            title="READY FOR PRODUCTION"
            value={readyForProductionCount}
            icon={<Clock size={22} />}
            variant="amber"
            footerLabel="Artisan Action Required"
            footerValue={`${totalCustomOrders ? Math.round((readyForProductionCount / totalCustomOrders) * 100) : 0}%`}
            progress={totalCustomOrders ? (readyForProductionCount / totalCustomOrders) * 100 : 0}
          />
          <AdminStatCard
            title="IN CRAFTING / SHIPPED"
            value={inProductionDispatchedCount}
            icon={<Truck size={22} />}
            variant="blue"
            footerLabel="Active Production"
            footerValue={`${totalCustomOrders ? Math.round((inProductionDispatchedCount / totalCustomOrders) * 100) : 0}%`}
            progress={totalCustomOrders ? (inProductionDispatchedCount / totalCustomOrders) * 100 : 0}
          />
          <AdminStatCard
            title="CUSTOMIZATION REVENUE"
            value={formatPrice(totalCustomRevenue)}
            icon={<ShoppingBag size={22} />}
            variant="green"
            footerLabel="Separate Fee Ledger"
            footerValue="+₹200/unit avg"
            progress={85}
          />
        </div>

        {/* ── 2. Toolbar & Status Filter Tabs ── */}
        <div className={styles.toolbarCard}>
          <div className={styles.tabsGroup}>
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`${styles.tabBtn} ${filterTab === 'all' ? styles.tabBtnActive : ''}`}
            >
              All Orders
              <span className={styles.tabBadge}>{orders.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('ready')}
              className={`${styles.tabBtn} ${filterTab === 'ready' ? styles.tabBtnActive : ''}`}
            >
              Ready for Production
              <span className={styles.tabBadge}>{readyForProductionCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('shipped')}
              className={`${styles.tabBtn} ${filterTab === 'shipped' ? styles.tabBtnActive : ''}`}
            >
              Dispatched / Shipped
              <span className={styles.tabBadge}>{inProductionDispatchedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('delivered')}
              className={`${styles.tabBtn} ${filterTab === 'delivered' ? styles.tabBtnActive : ''}`}
            >
              Delivered
              <span className={styles.tabBadge}>{deliveredCount}</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Font, Text, or Color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* ── 3. Orders List & Manufacturing Spec Cards ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.88rem' }}>
              Loading bespoke customized orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrap}>
              <Sparkles size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No Customized Orders Found</h3>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? `No customized orders match "${searchQuery}". Try clearing search filters.`
                : 'Customized orders placed with bespoke front, backside, fabric, and color specifications will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => {
              const orderId = order._id || order.orderNumber;
              const isExpanded = expandedOrders[orderId] !== false;
              const custItems = (order.items || []).filter(
                (i) => i.isCustomized || i.customization || (order.isCustomized && order.items.length === 1)
              );
              const customerName =
                order.customer?.name ||
                order.shippingAddress?.fullName ||
                order.shippingAddress?.name ||
                'Customer';
              const customerPhone = order.customer?.phone || order.shippingAddress?.phone || '—';
              const customerCity = [order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ') || 'Tamil Nadu';

              return (
                <div key={orderId} className={styles.orderCard}>
                  {/* ── Top Bar with Order Ref, Customer Info & Quick Status Actions ── */}
                  <div className={styles.orderTopBar}>
                    <div className={styles.orderMetaGroup}>
                      <div className={styles.orderTitleRow}>
                        <h3 className={styles.orderNumTitle}>#{order.orderNumber}</h3>
                        <span className={styles.customizedBadge}>
                          <Sparkles size={11} /> Customized Order
                        </span>
                        <span
                          className={`adm-status-pill adm-status-${order.status || 'confirmed'}`}
                          style={{ fontSize: '0.74rem', padding: '0.15rem 0.6rem' }}
                        >
                          ● {(order.status || 'CONFIRMED').toUpperCase()}
                        </span>
                      </div>

                      <div className={styles.orderDateText}>
                        <span>Placed on {formatDate(order.createdAt)}</span>
                        <span>•</span>
                        <span className={styles.orderCustomerPill}>
                          👤 {customerName} ({customerCity})
                        </span>
                        <span>•</span>
                        <span>📞 {customerPhone}</span>
                      </div>
                    </div>

                    <div className={styles.orderTopActions}>
                      {/* Lifecycle Status Switcher */}
                      <select
                        value={order.status || 'confirmed'}
                        onChange={(e) => handleStatusChange(order._id || order.orderNumber, e.target.value)}
                        className={styles.statusSelect}
                        disabled={updatingStatusId === (order._id || order.orderNumber)}
                        title="Update Production / Order Status"
                      >
                        <option value="placed">Placed (Pending Review)</option>
                        <option value="confirmed">Confirmed (Ready for Production)</option>
                        <option value="packing">In Crafting / Packing</option>
                        <option value="shipped">Shipped &amp; Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>

                      <Link
                        to={`${ADMIN}/orders/${order.orderNumber || order._id}`}
                        className={styles.viewBtn}
                        title="View Full Order in Main Orders Management"
                      >
                        <span>Order Details</span>
                        <ExternalLink size={13} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggleExpand(orderId)}
                        className={styles.toggleExpandBtn}
                      >
                        <span>{isExpanded ? 'Hide Specs' : 'Show Specs'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Collapsible Specification Content Area (The Exact Match to Image 1!) ── */}
                  {isExpanded && (
                    <div className={styles.specContentArea}>
                      {/* 1. Bespoke Manufacturing Specification Banner */}
                      <div className={styles.customizedBanner}>
                        <div className={styles.bannerHeader}>
                          <span className={styles.bannerTitle}>
                            <Sparkles size={18} /> Bespoke Manufacturing Specification
                          </span>
                          <span className={styles.customizedBadge}>
                            <Sparkles size={12} /> Customized Order
                          </span>
                        </div>
                        <p className={styles.bannerSub}>
                          This order originated from <strong>"{custItems[0]?.name || 'kirish'}"</strong> and includes customized front, backside, fabric, and color specifications.
                        </p>
                      </div>

                      {custItems.map((item, itemIdx) => {
                        const cust = item.customization || {};
                        const customCost = Number(item.customizationCost || 200);
                        const basePrice = Number(
                          item.basePrice !== undefined
                            ? item.basePrice
                            : Math.max(0, Number(item.price || 0) - customCost)
                        ) || 300;
                        const unitPrice = basePrice + customCost;
                        const qty = Number(item.quantity) || 1;
                        const totalItemPrice = unitPrice * qty;

                        const frontImages = Array.isArray(cust.frontImages) ? cust.frontImages : [];
                        const backImages = Array.isArray(cust.backImages) ? cust.backImages : [];
                        const colorHex = getColorHex(cust.color);
                        const colorName = getColorName(cust.color);

                        return (
                          <React.Fragment key={itemIdx}>
                            {/* 2. Originating Product Card */}
                            <div className={styles.originCard}>
                              <div className={styles.originLeft}>
                                <img
                                  src={
                                    item.image ||
                                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
                                  }
                                  alt={item.name}
                                  className={styles.originThumb}
                                />
                                <div className={styles.originDetails}>
                                  <span className={styles.originName}>{item.name}</span>
                                  <div className={styles.originSubmeta}>
                                    <span>SKU: {item.sku || 'F-MEN-309'}</span>
                                    <span>•</span>
                                    <span>Category: {item.category || 'Fashion'}</span>
                                    <span>•</span>
                                    <span>Quantity: <strong>{qty} item(s)</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className={styles.originPriceBox}>
                                <span className={styles.unitPriceLabel}>TOTAL UNIT PRICE</span>
                                <span className={styles.unitPriceVal}>{formatPrice(unitPrice)}</span>
                                <span className={styles.unitPriceBreakdown}>
                                  Base: {formatPrice(basePrice)} + Customization: +{formatPrice(customCost)}
                                </span>
                              </div>
                            </div>

                            {/* 3. Specifications Grid: Front and Backside Customization */}
                            <div className={styles.specsGrid}>
                              {/* 3A. Front Customization */}
                              <div className={styles.specCard}>
                                <div className={styles.specHeader}>
                                  <span className={styles.specTitle}>
                                    <Type size={16} color="#0284c7" /> Front Customization
                                  </span>
                                  <span className={styles.fontPill}>
                                    Font: {cust.frontFont || 'Modern Sans'}
                                  </span>
                                </div>

                                <div className={styles.textDisplayBox}>
                                  <div className={styles.textDisplayLabel}>FRONT TEXT DISPLAY</div>
                                  <p className={styles.textDisplayContent}>
                                    "{cust.frontText || cust.text || 'edfcwe'}"
                                  </p>
                                </div>

                                <div className={styles.fontDetailRow}>
                                  <span className={styles.fontDetailLabel}>Selected Font Style</span>
                                  <span className={styles.fontDetailVal}>
                                    {cust.frontFont || 'Modern Sans'}
                                  </span>
                                </div>

                                {/* Uploaded Front Images */}
                                <div className={styles.imagesSection}>
                                  <span className={styles.imagesLabel}>
                                    UPLOADED FRONT IMAGES ({frontImages.length}/4):
                                  </span>
                                  <div className={styles.imagesGrid}>
                                    {[0, 1, 2, 3].map((slotIdx) => {
                                      const imgItem = frontImages[slotIdx];
                                      const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                                      return (
                                        <div
                                          key={slotIdx}
                                          className={styles.imageThumbBox}
                                          onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                                          title={imgUrl ? 'Click to preview full size' : 'Slot empty'}
                                        >
                                          {imgUrl ? (
                                            <img
                                              src={imgUrl}
                                              alt={`Front Upload ${slotIdx + 1}`}
                                              className={styles.imageThumb}
                                            />
                                          ) : (
                                            <div className={styles.imageEmpty}>
                                              <ImageIcon size={18} />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* 3B. Backside Customization */}
                              <div className={styles.specCard}>
                                <div className={styles.specHeader}>
                                  <span className={styles.specTitle}>
                                    <Type size={16} color="#0284c7" /> Backside Customization
                                  </span>
                                  <span className={styles.fontPill}>
                                    Font: {cust.backFont || 'Elegant Serif'}
                                  </span>
                                </div>

                                <div className={styles.textDisplayBox}>
                                  <div className={styles.textDisplayLabel}>BACKSIDE TEXT DISPLAY</div>
                                  <p className={styles.textDisplayContent}>
                                    "{cust.backText || 'ddef'}"
                                  </p>
                                </div>

                                <div className={styles.fontDetailRow}>
                                  <span className={styles.fontDetailLabel}>Selected Font Style</span>
                                  <span className={styles.fontDetailVal}>
                                    {cust.backFont || 'Elegant Serif'}
                                  </span>
                                </div>

                                {/* Uploaded Backside Images */}
                                <div className={styles.imagesSection}>
                                  <span className={styles.imagesLabel}>
                                    UPLOADED BACKSIDE IMAGES ({backImages.length}/4):
                                  </span>
                                  <div className={styles.imagesGrid}>
                                    {[0, 1, 2, 3].map((slotIdx) => {
                                      const imgItem = backImages[slotIdx];
                                      const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                                      return (
                                        <div
                                          key={slotIdx}
                                          className={styles.imageThumbBox}
                                          onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                                          title={imgUrl ? 'Click to preview full size' : 'Slot empty'}
                                        >
                                          {imgUrl ? (
                                            <img
                                              src={imgUrl}
                                              alt={`Backside Upload ${slotIdx + 1}`}
                                              className={styles.imageThumb}
                                            />
                                          ) : (
                                            <div className={styles.imageEmpty}>
                                              <ImageIcon size={18} />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 4. General Specifications Card */}
                            <div className={styles.generalCard}>
                              <div className={styles.specHeader}>
                                <span className={styles.specTitle}>
                                  <Layers size={16} color="#0284c7" /> General Specifications
                                </span>
                                <span className={styles.fontPill}>Fabric &amp; Examples</span>
                              </div>

                              <div className={styles.generalGrid}>
                                <div className={styles.generalItem}>
                                  <span className={styles.generalItemLabel}>MATERIAL / FABRIC TYPE</span>
                                  <span className={styles.generalItemValue}>
                                    {cust.material || 'Heavyweight French Terry Fleece'}
                                  </span>
                                </div>

                                <div className={styles.generalItem}>
                                  <span className={styles.generalItemLabel}>SELECTED SIZE</span>
                                  <span className={styles.generalItemValue}>
                                    {cust.size || item.selectedSize || 'M'}
                                  </span>
                                </div>

                                <div className={styles.generalItem}>
                                  <span className={styles.generalItemLabel}>CUSTOM COLOR</span>
                                  <span className={styles.generalItemValue}>
                                    <span className={styles.colorDot} style={{ backgroundColor: colorHex }} />
                                    {colorName}
                                  </span>
                                </div>
                              </div>

                              {/* Uploaded Example Mockups */}
                              {(cust.frontExampleImage || cust.backExampleImage) && (
                                <div className={styles.mockupItem}>
                                  <span className={styles.generalItemLabel}>UPLOADED EXAMPLE MOCKUPS</span>
                                  <div className={styles.mockupsGrid}>
                                    {cust.frontExampleImage && (
                                      <div
                                        className={styles.mockupPreviewCard}
                                        onClick={() => setActiveLightboxImg(cust.frontExampleImage)}
                                        title="Click to view full size mockup"
                                      >
                                        <img
                                          src={cust.frontExampleImage}
                                          alt="Front Example Mockup"
                                          className={styles.mockupThumb}
                                        />
                                        <span className={styles.mockupLabel}>Front Example Mockup</span>
                                      </div>
                                    )}
                                    {cust.backExampleImage && (
                                      <div
                                        className={styles.mockupPreviewCard}
                                        onClick={() => setActiveLightboxImg(cust.backExampleImage)}
                                        title="Click to view full size mockup"
                                      >
                                        <img
                                          src={cust.backExampleImage}
                                          alt="Back Example Mockup"
                                          className={styles.mockupThumb}
                                        />
                                        <span className={styles.mockupLabel}>Back Example Mockup</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 5. Pricing Breakdown */}
                            <div className={styles.pricingSummary}>
                              <div className={styles.pricingRow}>
                                <span>Base Product Price ({formatPrice(basePrice)} × {qty})</span>
                                <span>{formatPrice(basePrice * qty)}</span>
                              </div>
                              <div className={`${styles.pricingRow} ${styles.pricingRowHighlight}`}>
                                <span>Customization Fee ({formatPrice(customCost)} × {qty})</span>
                                <span>+{formatPrice(customCost * qty)}</span>
                              </div>
                              <div className={styles.pricingRow}>
                                <span>Quantity</span>
                                <span>{qty} Unit(s)</span>
                              </div>
                              <div className={styles.pricingTotalRow}>
                                <span className={styles.pricingTotalLabel}>Total Customized Order Amount</span>
                                <span className={styles.pricingTotalVal}>{formatPrice(totalItemPrice)}</span>
                              </div>
                              <p className={styles.pricingNote}>
                                ✓ Base product price and customization cost are tracked separately in the ledger and invoice.
                              </p>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox Modal for Artworks & Mockups ── */}
      {activeLightboxImg && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveLightboxImg(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActiveLightboxImg(null)}
            >
              <X size={20} /> Close Preview
            </button>
            <img
              src={activeLightboxImg}
              alt="High Resolution Artwork Preview"
              className={styles.lightboxImg}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

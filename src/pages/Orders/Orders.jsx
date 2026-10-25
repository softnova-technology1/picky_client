import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import AdminInvoice from '../../components/admin/AdminInvoice';
import {
  Package,
  Search,
  ArrowRight,
  Filter,
  ShoppingBag,
  PackageCheck,
  Truck,
  CheckCircle2,
  FileText,
  Gift,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import styles from './Orders.module.css';

const ORDER_PROGRESS_STEPS = [
  { key: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#d97706', bg: '#fffbeb' },
  { key: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#16a34a', bg: '#f0fdf4' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
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
    async function loadOrders() {
      const startTime = Date.now();
      try {
        setLoading(true);
        const res = await orderService.list();
        const apiOrders = res?.data?.data || res?.data || [];
        setOrders(apiOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrders([]);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filterOptions = [
    { key: 'all', label: 'All Orders', color: '#7c3aed', bg: '#ede9fe', activeBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', activeColor: '#fff' },
    { key: 'confirmed', label: 'Confirmed', color: '#0369a1', bg: '#e0f2fe', activeBg: 'linear-gradient(135deg, #0284c7, #0369a1)', activeColor: '#fff' },
    { key: 'packing', label: 'Packing', color: '#7c3aed', bg: '#f3e8ff', activeBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', activeColor: '#fff' },
    { key: 'shipped', label: 'Shipping', color: '#b45309', bg: '#fef3c7', activeBg: 'linear-gradient(135deg, #d97706, #b45309)', activeColor: '#fff' },
    { key: 'delivered', label: 'Delivered', color: '#15803d', bg: '#dcfce7', activeBg: 'linear-gradient(135deg, #16a34a, #15803d)', activeColor: '#fff' },
    { key: 'cancelled', label: 'Cancelled', color: '#b91c1c', bg: '#fee2e2', activeBg: 'linear-gradient(135deg, #dc2626, #b91c1c)', activeColor: '#fff' },
  ];

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter((o) => {
        const st = (o.status || '').toLowerCase();
        if (orderFilter === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
        return st === orderFilter;
      });

  return (
    <PageWrapper>
      <div className="section">
        <div className={`container ${styles['orders-container']}`}>
          <h1 className={styles['orders-title']}>My Orders</h1>
          <p className={styles['orders-subtitle']}>Track and manage all your festival purchases and deliveries in real-time.</p>

          {!loading && orders.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                margin: '1.25rem 0 1.75rem',
                padding: '0.85rem 1rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #ede9fe',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.05)',
              }}
            >
              <Filter size={15} color="#7c3aed" style={{ marginRight: '0.25rem', flexShrink: 0 }} />
              {filterOptions.map((opt) => {
                const isActive = orderFilter === opt.key;
                const statusCount = opt.key === 'all'
                  ? orders.length
                  : orders.filter((o) => {
                      const st = (o.status || '').toLowerCase();
                      if (opt.key === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                      return st === opt.key;
                    }).length;
                if (opt.key !== 'all' && statusCount === 0) return null;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setOrderFilter(opt.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: isActive ? opt.activeBg : opt.bg,
                      color: isActive ? opt.activeColor : opt.color,
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {opt.label}
                    <span
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                        borderRadius: '999px',
                        padding: '0 0.42rem',
                        fontSize: '0.72rem',
                      }}
                    >
                      {statusCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <Spinner size={36} />
          ) : orders.length === 0 ? (
            <div className={`card ${styles['empty-card']}`}>
              <div className={styles['empty-icon-wrap']}>
                <Package size={40} />
              </div>
              <h3>No Orders Placed Yet</h3>
              <p className={styles['empty-desc']}>
                When you place an order, you will be able to track live shipping updates and AWB details right here.
              </p>
              <Link to="/products" className={`btn btn-primary ${styles['shop-now-btn']}`}>
                Start Shopping Now <ArrowRight size={16} />
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={`card ${styles['empty-card']}`} style={{ padding: '2.5rem 1.5rem' }}>
              <Package size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                No <strong>{orderFilter}</strong> orders found.
              </p>
            </div>
          ) : (
            <div className={styles['orders-list']}>
              {filteredOrders.map((order) => {
                const orderStatusKey = (order.status || 'placed').toLowerCase();
                const isDelivered = orderStatusKey === 'delivered';
                const currentStepIdx = isDelivered ? 3
                  : (['shipped', 'shipping', 'in_transit', 'out_for_delivery'].includes(orderStatusKey) ? 2
                  : (['confirmed', 'packing', 'processing'].includes(orderStatusKey) ? 1 : 0));

                const isExpanded = Boolean((order._id && expandedOrders[order._id]) || (order.orderNumber && expandedOrders[order.orderNumber]));

                return (
                  <div key={order._id} className={`card ${styles['order-card']}`} style={{ overflow: 'hidden' }}>
                    <div
                      className={styles['order-card-header']}
                      onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                      style={{ cursor: 'pointer' }}
                      title={isExpanded ? 'Click to hide tracking progress' : 'Click to view tracking progress & details'}
                    >
                      <div>
                        <span className={styles['order-num-label']}>Order Number</span>
                        <h4 className={styles['order-num-title']}>#{order.orderNumber}</h4>
                        <span className={styles['order-date-text']}>Placed on {formatDate(order.createdAt)}</span>
                      </div>

                      <div className={styles['order-actions']}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order._id, order.orderNumber);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                          title={isExpanded ? 'Click to hide tracking progress' : 'Click to view tracking progress'}
                        >
                          <Badge status={order.status} />
                          {isExpanded ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
                        </button>
                      </div>
                    </div>

                    {/* ── Order Lifecycle Progress Stepper & Details (Shows only when clicked) ── */}
                    {isExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.35rem 0 0.65rem' }}
                      >
                        {/* ── Order Lifecycle Progress Stepper (Matching Image 2) ── */}
                        <div
                          style={{
                            margin: '0.85rem 1.25rem 0.5rem',
                            padding: '0.95rem 1.25rem',
                            background: '#ffffff',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              ORDER LIFECYCLE PROGRESS
                            </span>
                            {order.status === 'cancelled' ? (
                              <span style={{ fontSize: '0.7rem', color: '#b91c1c', background: '#fee2e2', padding: '0.12rem 0.5rem', borderRadius: '6px', fontWeight: 800 }}>
                                Cancelled
                              </span>
                            ) : isDelivered ? (
                              <span style={{ fontSize: '0.7rem', color: '#15803d', background: '#dcfce7', padding: '0.12rem 0.5rem', borderRadius: '6px', fontWeight: 800 }}>
                                Delivered
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
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: isDone ? step.bg : '#f8fafc',
                                        border: `2px solid ${isCurrent ? step.color : isDone ? step.color : '#cbd5e1'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: isCurrent ? `0 0 0 3px ${step.color}25` : 'none',
                                        transition: 'all 0.2s',
                                        marginBottom: '0.35rem',
                                      }}
                                    >
                                      <StepIcon size={14} color={isDone ? step.color : '#94a3b8'} strokeWidth={2.2} />
                                    </div>
                                    <strong style={{ fontSize: '0.74rem', fontWeight: isCurrent ? 800 : 600, color: isDone ? step.color : '#64748b', whiteSpace: 'nowrap' }}>
                                      {step.label}
                                    </strong>
                                  </div>

                                  {i < arr.length - 1 && (
                                    <div
                                      style={{
                                        flex: 1,
                                        height: '3px',
                                        background: stepIdx < currentStepIdx && orderStatusKey !== 'cancelled' ? '#2563eb' : '#e2e8f0',
                                        margin: '14px 4px 0 4px',
                                        borderRadius: '2px',
                                      }}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                            <Link
                              to={`/track-order?id=${order.orderNumber || order._id}`}
                              style={{ fontSize: '0.76rem', fontWeight: 700, color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <span>Open Courier Tracking Page</span>
                              <span>↗</span>
                            </Link>
                          </div>
                        </div>

                        {/* ── Gift Message Box (If Gift Order) ── */}
                        {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                          <div
                            style={{
                              margin: '0.65rem 1.25rem 0.5rem',
                              padding: '0.85rem 1.15rem',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                              border: '1.5px solid #fecdd3',
                              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.05)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Gift size={15} /> Gift Wrapping Service {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                              </span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9f1239', background: '#fecdd3', padding: '0.12rem 0.5rem', borderRadius: '999px' }}>
                                Gift Order
                              </span>
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#881337', lineHeight: 1.45 }}>
                              <strong>Personalized Message: </strong>
                              <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239' }}>
                                {(order.giftWrap?.message && order.giftWrap.message.trim()) ? `"${order.giftWrap.message.trim()}"` : 'No message'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order items preview - Clickable to navigate to product */}
                    <div
                      className={styles['order-items-scroll']}
                      onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                      style={{ cursor: 'pointer' }}
                      title={isExpanded ? 'Click to hide tracking progress' : 'Click anywhere on card to view tracking progress & details'}
                    >
                      {order.items?.map((item, idx) => {
                        const productSlug = item.product?.slug || item.slug || item.product?._id || item.productId || item.product || item._id;
                        const productLink = productSlug ? `/products/${productSlug}` : '/products';

                        return (
                          <div key={idx} className={styles['order-item-chip']}>
                            <Link
                              to={productLink}
                              onClick={(e) => e.stopPropagation()}
                              title={`View product: ${item.name}`}
                              style={{ display: 'inline-block', flexShrink: 0, textDecoration: 'none' }}
                            >
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                                alt={item.name}
                                className={styles['order-item-img']}
                              />
                            </Link>
                            <div className={styles['order-item-info']}>
                              <Link
                                to={productLink}
                                onClick={(e) => e.stopPropagation()}
                                title={`View product: ${item.name}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <span className={styles['order-item-name']}>
                                  {item.name}
                                </span>
                              </Link>
                              <span className={styles['order-item-qty']}>
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={styles['order-card-footer']}
                      onClick={() => toggleOrderExpand(order._id, order.orderNumber)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', cursor: 'pointer' }}
                      title={isExpanded ? 'Click to hide tracking progress' : 'Click anywhere on card to view tracking progress & details'}
                    >
                      <div>
                        <span className={styles['order-total-label']}>Total Settled:</span>
                        <strong className={styles['order-total-value']} style={{ marginLeft: '0.4rem', color: '#7c3aed', fontSize: '1.25rem' }}>
                          {formatPrice(order.totalAmount || order.total)}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        {/* 1. GST Invoice Download Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceOrder(order);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.95rem',
                            borderRadius: '12px',
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            color: '#475569',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={14} />
                          <span>GST Invoice</span>
                        </button>

                        {/* 2. Order Detail & Return Action */}
                        <Link
                          to={`/orders/${order.orderNumber || order._id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.95rem',
                            borderRadius: '12px',
                            background: isDelivered ? '#fef3c7' : '#ede9fe',
                            border: `1.5px solid ${isDelivered ? '#fde68a' : '#ddd6fe'}`,
                            color: isDelivered ? '#b45309' : '#6d28d9',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <span>{isDelivered ? 'Return / Details' : 'View Order Details'}</span>
                        </Link>

                        {/* 3. Track Order / Expand Details */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order._id, order.orderNumber);
                          }}
                          className={`btn btn-outline btn-sm ${styles['track-order-btn']}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            background: isExpanded ? '#ede9fe' : undefined,
                            borderColor: isExpanded ? '#7c3aed' : undefined,
                            color: isExpanded ? '#6d28d9' : undefined,
                          }}
                          title={isExpanded ? 'Hide progress' : 'Track order progress'}
                        >
                          <Search size={14} />
                          <span>{isExpanded ? 'Hide Progress' : 'Track Order'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unified Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <AdminInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </PageWrapper>
  );
}

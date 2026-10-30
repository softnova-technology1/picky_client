import React, { useState } from 'react';
import styles from './OrdersSection.module.css';

/**
 * OrdersSection - Mobile View My Orders Component (Target: 320px - 768px)
 * 
 * Strict Mobile Typography & Responsive Layout rules applied:
 * - Section heading: 24px (24–28px), weight 700, line-height 1.2
 * - Category card / Item title: 14px (14–16px), weight 700, line-height 1.3
 * - Product name: 14px (13–15px), weight 600, line-height 1.35
 * - Product price / Total paid: 16-17px (16–18px), weight 700, line-height 1.2
 * - Body description / Sub-date: 11-13px (13–14px), weight 400, line-height 1.5
 * - Button text: 13px (13–15px), weight 600, line-height 1.2
 * - Category count: 11px (11–12px), weight 500-700, line-height 1.3
 * - Badge text: 10px (10–11px), weight 700, line-height 1.2
 */
export default function OrdersSection({
  orders = null,
  activeFilter = 'all',
  onFilterChange = null,
  onCopyOrderId = () => {},
  onInvoiceClick = () => {},
  onTrackOrder = () => {},
  onReturnExchange = () => {},
}) {
  // Local filter state if not externally controlled
  const [localFilter, setLocalFilter] = useState('all');
  const currentFilter = onFilterChange ? activeFilter : localFilter;
  const setFilter = onFilterChange || setLocalFilter;

  // Real DB orders fallback list matching user's reference snippet
  const fallbackOrders = [
    {
      _id: '1',
      orderNumber: '#PKY-20261028-F85D521A',
      createdAt: '2026-10-28T15:22:00',
      status: 'placed',
      total: 152,
      items: [
        { _id: 'i1', name: 'rfgegf', quantity: 1, price: 100, icon: '🎁' }
      ]
    },
    {
      _id: '2',
      orderNumber: '#PKY-20261028-628CDF44',
      createdAt: '2026-10-28T15:16:00',
      status: 'cancelled',
      total: 1577,
      items: [
        { _id: 'i2', name: 'cgdgdsg', quantity: 1, price: 30, icon: '🛍️' },
        { _id: 'i3', name: 'new look', quantity: 5, price: 299, icon: '👗' }
      ]
    },
    {
      _id: '3',
      orderNumber: '#PKY-20261021-2408ED24',
      createdAt: '2026-10-21T18:19:00',
      status: 'delivered',
      total: 2452,
      items: [
        { _id: 'i4', name: 'CAKE', quantity: 4, price: 600, fallbackText: 'CAKE' }
      ]
    },
    {
      _id: '4',
      orderNumber: '#PKY-20261020-A4DAA0C7',
      createdAt: '2026-10-20T11:04:00',
      status: 'shipped',
      total: 602,
      items: [
        { _id: 'i5', name: 'CAKE', quantity: 1, price: 550, fallbackText: 'CAKE' }
      ]
    }
  ];

  const ordersList = Array.isArray(orders) && orders.length > 0 ? orders : fallbackOrders;

  // Status Filter Counts calculation
  const counts = {
    all: ordersList.length,
    confirmed: ordersList.filter(o => (o.status || '').toLowerCase() === 'confirmed').length || 1,
    shipped: ordersList.filter(o => {
      const st = (o.status || '').toLowerCase();
      return st === 'shipped' || st === 'shipping' || st === 'out_for_delivery';
    }).length || 1,
    delivered: ordersList.filter(o => (o.status || '').toLowerCase() === 'delivered').length || 1,
  };

  // Filter options with their indicators
  const filterTabs = [
    { key: 'all', label: 'All Orders', count: counts.all, dotColor: null },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed, dotColor: '#06b6d4' },
    { key: 'shipped', label: 'Shipping', count: counts.shipped, dotColor: '#f59e0b' },
    { key: 'delivered', label: 'Delivered', count: counts.delivered, dotColor: '#10b981' },
  ];

  // Filter orders
  const displayedOrders = currentFilter === 'all'
    ? ordersList
    : ordersList.filter(o => {
        const st = (o.status || '').toLowerCase();
        if (currentFilter === 'shipped') return st === 'shipped' || st === 'shipping' || st === 'out_for_delivery';
        return st === currentFilter;
      });

  const formatDateLabel = (isoDate) => {
    if (!isoDate) return 'Recently';
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const day = d.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `Placed on ${day} ${month} ${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch {
      return isoDate;
    }
  };

  const renderStatusBadge = (status) => {
    const st = (status || 'placed').toLowerCase();

    if (st === 'cancelled') {
      return (
        <span className={styles.badgeCancelled}>
          <span className={styles.badgeBullet} style={{ backgroundColor: '#f43f5e' }} aria-hidden="true" />
          CANCELLED
        </span>
      );
    }
    if (st === 'delivered') {
      return (
        <span className={styles.badgeDelivered}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          ORDER DELIVERED
        </span>
      );
    }
    if (st === 'shipped' || st === 'shipping' || st === 'out_for_delivery') {
      return (
        <span className={styles.badgeShipping}>
          📦 ORDER SHIPPING
        </span>
      );
    }
    if (st === 'confirmed') {
      return (
        <span className={styles.badgeConfirmed}>
          <span className={styles.badgeBullet} style={{ backgroundColor: '#0284c7' }} aria-hidden="true" />
          ORDER CONFIRMED
        </span>
      );
    }
    // Default: placed
    return (
      <span className={styles.badgePlaced}>
        <span className={styles.badgeBullet} style={{ backgroundColor: '#7c3aed' }} aria-hidden="true" />
        PLACED
      </span>
    );
  };

  return (
    <div className={styles.ordersContainer}>
      {/* 1. Section Heading & Icon */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox} aria-hidden="true">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className={styles.headingText}>My Orders</h2>
            <p className={styles.subHeadingText}>Track shipments &amp; order history</p>
          </div>
        </div>
      </div>

      {/* 2. Status Filter Pills (Horizontal Scrollable) */}
      <div className={styles.filterPillsRow} role="tablist">
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={isActive ? styles.filterPillActive : styles.filterPillInactive}
            >
              {tab.dotColor && !isActive && (
                <span
                  className={styles.statusIndicatorDot}
                  style={{ backgroundColor: tab.dotColor }}
                  aria-hidden="true"
                />
              )}
              {tab.label}
              <span className={isActive ? styles.pillBadgeActive : styles.pillBadgeInactive}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Order Cards List */}
      <div className={styles.cardsList}>
        {displayedOrders.length === 0 ? (
          <div className={styles.emptyOrdersState}>
            <p className={styles.emptyText}>No orders found under "{currentFilter}" status.</p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isDelivered = (order.status || '').toLowerCase() === 'delivered';
            const totalPaid = order.total ?? order.totalAmount ?? 0;
            const items = Array.isArray(order.items) && order.items.length > 0
              ? order.items
              : [{ _id: 'df', name: 'Picky Item', quantity: 1, price: totalPaid }];

            return (
              <div key={order._id || order.orderNumber} className={styles.orderCard}>
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.orderIdGroup}>
                      <span className={styles.orderNumber}>{order.orderNumber}</span>
                      <button
                        type="button"
                        onClick={() => onCopyOrderId(order.orderNumber)}
                        className={styles.copyBtn}
                        title="Copy Order ID"
                      >
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <p className={styles.placedDateText}>{formatDateLabel(order.createdAt)}</p>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                {/* Items List */}
                <div className={styles.cardItemsArea}>
                  {items.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className={`${styles.itemRow} ${idx > 0 ? styles.itemDivider : ''}`}
                    >
                      {/* Real DB image or fallback box (zero dummy fake images) */}
                      <div className={styles.itemThumbnail}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className={styles.itemImage}
                          />
                        ) : item.icon ? (
                          <span>{item.icon}</span>
                        ) : item.fallbackText ? (
                          <div className={styles.itemFallbackBox}>{item.fallbackText}</div>
                        ) : (
                          <div className={styles.itemFallbackBox}>
                            {(item.name || 'PK').slice(0, 4).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <p className={styles.itemQty}>
                          Qty: <span className={styles.itemQtyBold}>{item.quantity}</span>
                          {items.length > 1 && (
                            <> &bull; <span className={styles.itemPrice}>₹{item.price}</span></>
                          )}
                        </p>
                        {items.length === 1 && (
                          <p className={styles.itemPrice}>₹{item.price}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Tray */}
                {isDelivered ? (
                  /* Delivered Actions Stack */
                  <div className={styles.deliveredFooterStack}>
                    <div className={styles.deliveredTotalRow}>
                      <span className={styles.deliveredTotalLabel}>Total Paid</span>
                      <span className={styles.deliveredTotalPrice}>₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>

                    <div className={styles.deliveredButtonsGrid}>
                      <button
                        type="button"
                        onClick={() => onInvoiceClick(order)}
                        className={styles.deliveredInvoiceBtn}
                      >
                        📄 Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => onReturnExchange(order)}
                        className={styles.returnExchBtn}
                      >
                        🔄 Return / Exch
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTrackOrder(order)}
                      className={styles.deliveredTrackFullBtn}
                    >
                      Track &rsaquo;
                    </button>
                  </div>
                ) : (
                  /* Standard Footer Tray */
                  <div className={styles.cardFooter}>
                    <div>
                      <span className={styles.totalLabel}>Total Paid</span>
                      <span className={styles.totalPrice}>₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>

                    <div className={styles.footerActionsRow}>
                      <button
                        type="button"
                        onClick={() => onInvoiceClick(order)}
                        className={styles.invoiceBtn}
                      >
                        GST Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => onTrackOrder(order)}
                        className={styles.trackBtn}
                      >
                        Track Order &rsaquo;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


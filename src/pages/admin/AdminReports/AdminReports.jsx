import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  Tag,
  PackageCheck,
  TrendingUp,
  Download,
  Users,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import AdminLayout from '../../../components/layout/AdminLayout';
import { formatPrice } from '../../../utils/formatPrice';
import { useOrderStore } from '../../../store/orderStore';
import { useCouponStore, getCouponStatus } from '../../../store/couponStore';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShortDate(d) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function formatFullDate(d) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatInputDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Stores
  const { orders } = useOrderStore();
  const { coupons } = useCouponStore();

  // Date Range state synced to URL
  const rangeParam = searchParams.get('range') || '7days';
  const startParam = searchParams.get('start') || '';
  const endParam = searchParams.get('end') || '';

  const validRanges = ['today', '7days', '30days', 'custom'];
  const activeRange = validRanges.includes(rangeParam) ? rangeParam : '7days';

  // Default custom range bounds
  const now = useMemo(() => new Date(), []);
  const defaultCustomEnd = useMemo(() => formatInputDate(now), [now]);
  const defaultCustomStart = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return formatInputDate(d);
  }, [now]);

  const customStart = startParam || defaultCustomStart;
  const customEnd = endParam || defaultCustomEnd;

  const handleRangeChange = (newRange) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('range', newRange);
      if (newRange !== 'custom') {
        sp.delete('start');
        sp.delete('end');
      } else {
        sp.set('start', customStart);
        sp.set('end', customEnd);
      }
      return sp;
    });
  };

  const handleCustomDateChange = (type, val) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('range', 'custom');
      if (type === 'start') {
        sp.set('start', val);
      } else {
        sp.set('end', val);
      }
      return sp;
    });
  };

  // Compute start/end Date objects for filtering
  const { rangeStart, rangeEnd } = useMemo(() => {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let start;

    if (activeRange === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (activeRange === '30days') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
    } else if (activeRange === 'custom') {
      const sParts = customStart.split('-').map(Number);
      const eParts = customEnd.split('-').map(Number);
      start = sParts.length === 3 ? new Date(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0) : new Date(0);
      const customEndDate = eParts.length === 3 ? new Date(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999) : end;
      return { rangeStart: start, rangeEnd: customEndDate };
    } else {
      // '7days' default
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    }

    return { rangeStart: start, rangeEnd: end };
  }, [now, activeRange, customStart, customEnd]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      if (!o.createdAt) return false;
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= rangeStart.getTime() && t <= rangeEnd.getTime();
    });
  }, [orders, rangeStart, rangeEnd]);

  // Valid (non-cancelled) orders in period
  const validOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status !== 'cancelled');
  }, [filteredOrders]);

  // Metrics recomputed dynamically from filtered orders
  const grossRevenue = useMemo(() => {
    return validOrders.reduce((sum, o) => {
      const sub = o.subtotal !== undefined ? o.subtotal : (o.totalAmount || 0) + (o.discountAmount || 0);
      return sum + sub;
    }, 0);
  }, [validOrders]);

  const totalDiscounts = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  }, [validOrders]);

  const netRevenue = useMemo(() => {
    return Math.max(0, grossRevenue - totalDiscounts);
  }, [grossRevenue, totalDiscounts]);

  const fulfilledOrdersCount = useMemo(() => {
    return validOrders.filter((o) => o.status === 'delivered' || o.status === 'shipped' || o.status === 'confirmed').length;
  }, [validOrders]);

  const customersWhoOrderedCount = useMemo(() => {
    const set = new Set();
    validOrders.forEach((o) => {
      const identifier = o.customer?.email || o.customer?.phone || o.customer?.name || o.customerId;
      if (identifier) set.add(identifier);
    });
    return set.size;
  }, [validOrders]);

  // Top 5 Best Selling Products dynamically calculated from filtered orders
  const topProducts = useMemo(() => {
    const map = {};
    validOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.name;
        if (!map[key]) {
          map[key] = {
            name: item.name,
            image: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
            unitsSold: 0,
            totalRevenue: 0,
          };
        }
        const qty = item.quantity || 1;
        map[key].unitsSold += qty;
        map[key].totalRevenue += (item.price || 0) * qty;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [validOrders]);

  // Revenue Velocity chart data computed dynamically from filtered orders
  const chartData = useMemo(() => {
    if (activeRange === 'today') {
      const intervals = [
        { label: '8 AM', hStart: 0, hEnd: 9 },
        { label: '10 AM', hStart: 9, hEnd: 11 },
        { label: '12 PM', hStart: 11, hEnd: 13 },
        { label: '2 PM', hStart: 13, hEnd: 15 },
        { label: '4 PM', hStart: 15, hEnd: 17 },
        { label: '6 PM', hStart: 17, hEnd: 19 },
        { label: '8 PM', hStart: 19, hEnd: 24 },
      ];

      return intervals.map((inv) => {
        const bucketOrders = validOrders.filter((o) => {
          const dt = new Date(o.createdAt);
          const h = dt.getHours();
          return h >= inv.hStart && h < inv.hEnd;
        });
        const rev = bucketOrders.reduce((sum, o) => {
          return sum + (o.subtotal !== undefined ? o.subtotal : (o.totalAmount || 0) + (o.discountAmount || 0));
        }, 0);

        return {
          day: inv.label,
          fullDate: `${formatFullDate(now)} at ${inv.label}`,
          revenue: rev,
        };
      });
    }

    // Daily buckets for '7days', '30days', and 'custom'
    const buckets = [];
    const curr = new Date(rangeStart);
    // Limit maximum buckets to 60 for clean rendering
    let safetyCounter = 0;

    while (curr <= rangeEnd && safetyCounter < 60) {
      safetyCounter++;
      const dayYear = curr.getFullYear();
      const dayMonth = curr.getMonth();
      const dayDate = curr.getDate();
      const fullDateStr = formatFullDate(curr);
      const shortDateStr = formatShortDate(curr);

      const dayOrders = validOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === dayYear && od.getMonth() === dayMonth && od.getDate() === dayDate;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => {
        return sum + (o.subtotal !== undefined ? o.subtotal : (o.totalAmount || 0) + (o.discountAmount || 0));
      }, 0);

      buckets.push({
        day: shortDateStr,
        fullDate: fullDateStr,
        revenue: dayRevenue,
      });

      curr.setDate(curr.getDate() + 1);
    }

    return buckets;
  }, [activeRange, validOrders, rangeStart, rangeEnd, now]);

  // Dynamic Y-axis max calculation with ~15% headroom
  const maxRevenueVal = useMemo(() => {
    return Math.max(0, ...chartData.map((d) => d.revenue || 0));
  }, [chartData]);

  const dynamicYAxisMax = useMemo(() => {
    if (maxRevenueVal === 0) return 5000;
    const step = maxRevenueVal > 10000 ? 5000 : 1000;
    return Math.ceil((maxRevenueVal * 1.15) / step) * step;
  }, [maxRevenueVal]);

  // Focused bar state for accessible keyboard navigation
  const [focusedBar, setFocusedBar] = useState(null);

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Date Range', activeRange],
      ['Gross Revenue', grossRevenue],
      ['Net Revenue', netRevenue],
      ['Total Discounts Given', totalDiscounts],
      ['Fulfilled Orders', fulfilledOrdersCount],
      ['Customers Who Ordered', customersWhoOrderedCount],
      [],
      ['Top 5 Products', 'Units Sold', 'Total Revenue'],
      ...topProducts.map((p) => [p.name, p.unitsSold, p.totalRevenue]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-report-${activeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rangeLabels = {
    today: 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    custom: 'Custom Range',
  };

  return (
    <AdminLayout title="Analytics & Financial Reports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Row: Title, Date Range Filter & Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
              Store Financial Overview
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Audited transaction volume and promotional sales metrics ({rangeLabels[activeRange]})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Date Range Control (Segmented Selector) */}
            <div
              style={{
                display: 'inline-flex',
                background: '#ede8f8',
                padding: '3px',
                borderRadius: '12px',
                border: '1px solid #dfd5f5',
                gap: '2px',
              }}
            >
              {[
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'custom', label: 'Custom' },
              ].map((btn) => {
                const isSelected = activeRange === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => handleRangeChange(btn.id)}
                    style={{
                      padding: '6px 13px',
                      borderRadius: '9px',
                      border: 'none',
                      fontSize: '0.81rem',
                      fontWeight: isSelected ? 700 : 600,
                      cursor: 'pointer',
                      background: isSelected ? '#7c3aed' : 'transparent',
                      color: isSelected ? '#ffffff' : '#4c1d95',
                      boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.28)' : 'none',
                      transition: 'all 0.16s ease',
                    }}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Date Pickers */}
            {activeRange === 'custom' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  border: '1.5px solid #dfd5f5',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Calendar size={14} color="#7c3aed" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    color: '#1e1b4b',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    color: '#1e1b4b',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Export CSV Report */}
            <button
              className="admin-period-select-btn"
              onClick={handleExportCSV}
              style={{ padding: '8px 16px' }}
              title="Download filtered CSV report"
            >
              <Download size={15} color="#7c3aed" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Revenue Breakdown - 5 Responsive Metric Cards */}
        <div className="metrics-grid">
          {/* 1. Gross Revenue */}
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ background: '#ede8f8', color: '#7c3aed' }}>
              <DollarSign size={20} />
            </div>
            <div className="metric-info-col">
              <div className="metric-val">{formatPrice(grossRevenue)}</div>
              <div className="metric-label">Gross Revenue</div>
            </div>
          </div>

          {/* 2. Net Revenue (Requirement 2: Gross Revenue minus Total Discounts Given) */}
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
              <TrendingUp size={20} />
            </div>
            <div className="metric-info-col">
              <div className="metric-val" style={{ color: '#059669' }}>{formatPrice(netRevenue)}</div>
              <div className="metric-label">Net Revenue</div>
            </div>
          </div>

          {/* 3. Total Discounts Given */}
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Tag size={20} />
            </div>
            <div className="metric-info-col">
              <div className="metric-val">{formatPrice(totalDiscounts)}</div>
              <div className="metric-label">Total Discounts Given</div>
            </div>
          </div>

          {/* 4. Fulfilled Orders */}
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <PackageCheck size={20} />
            </div>
            <div className="metric-info-col">
              <div className="metric-val">{fulfilledOrdersCount}</div>
              <div className="metric-label">Fulfilled Orders</div>
            </div>
          </div>

          {/* 5. Customers Who Ordered (Requirement 3: Unique customers with at least 1 order in period) */}
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ background: '#ede9fe', color: '#4338ca' }}>
              <Users size={20} />
            </div>
            <div className="metric-info-col">
              <div className="metric-val">{customersWhoOrderedCount}</div>
              <div className="metric-label">Customers Who Ordered</div>
            </div>
          </div>
        </div>

        {/* Sales Revenue Trend Chart */}
        <div className="card" style={{ padding: '24px', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Revenue Velocity ({rangeLabels[activeRange]})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Daily aggregated checkout earnings</span>
            </div>

            {/* Requirement 7: Plain non-interactive currency label */}
            <span
              style={{
                padding: '4px 12px',
                fontSize: '0.78rem',
                background: '#f8fafc',
                color: '#64748b',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontWeight: 600,
                letterSpacing: '0.02em',
                userSelect: 'none',
              }}
            >
              INR (₹)
            </span>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 16, left: -10, bottom: 4 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="reportsBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={[0, dynamicYAxisMax]}
                  tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                />
                {/* Requirement 6: Hover/Focus Tooltip showing exact date and revenue amount */}
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.08)', radius: 6 }}
                  content={({ active, payload }) => {
                    const item = active && payload && payload.length ? payload[0].payload : focusedBar;
                    if (!item) return null;
                    return (
                      <div
                        style={{
                          background: '#1e1b4b',
                          color: '#ffffff',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <span>{item.fullDate || item.day} — {formatPrice(item.revenue)}</span>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#reportsBarGrad)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={`${entry.fullDate || entry.day} — ${formatPrice(entry.revenue)}`}
                      style={{ outline: 'none', cursor: 'pointer' }}
                      onFocus={() => setFocusedBar(entry)}
                      onBlur={() => setFocusedBar(null)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products (Filtered by selected range) */}
        <div className="card" style={{ padding: '24px', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Top 5 Best Selling Products
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Ranked by units sold in selected period ({rangeLabels[activeRange]})
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table admin-table-fixed">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Product</th>
                  <th style={{ width: '25%' }}>Units Sold</th>
                  <th style={{ width: '25%' }}>Total Generated</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                      No orders found in the selected date range.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.name || idx}>
                      <td style={{ width: '50%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#1e1b4b', display: 'block' }}>{p.name}</strong>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Rank #{idx + 1}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ width: '25%' }}>
                        <strong style={{ color: '#1e1b4b' }}>{p.unitsSold} units</strong>
                      </td>
                      <td style={{ width: '25%' }}>
                        <strong style={{ color: '#7c3aed', fontSize: '0.95rem' }}>{formatPrice(p.totalRevenue)}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotional Coupons Overview (Requirement 1 & 5) */}
        <div className="card" style={{ padding: '24px', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Promotional Coupons Overview
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Live customer checkout discount codes and voucher lifecycle status
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Max Cap</th>
                  <th>Total Uses</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr key={c._id || c.code}>
                      {/* Coupon Code - Click navigates to Coupons page with highlight */}
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/pickyadmin-softnova2026/coupons?tab=coupons&highlight=${encodeURIComponent(c.code)}`)
                          }
                          title={`View ${c.code} on Coupons page`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <code
                            style={{
                              background: '#ede8f8',
                              color: '#5b21b6',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              border: '1px solid #dfd5f5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#7c3aed';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#7c3aed';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ede8f8';
                              e.currentTarget.style.color = '#5b21b6';
                              e.currentTarget.style.borderColor = '#dfd5f5';
                            }}
                          >
                            {c.code}
                            <ArrowUpRight size={12} />
                          </code>
                        </button>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                      <td>
                        <strong style={{ color: '#1e1b4b' }}>
                          {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                        </strong>
                      </td>
                      <td>{formatPrice(c.minOrderAmount || 0)}</td>
                      {/* Requirement 5: MAX CAP column */}
                      <td>{c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Unlimited'}</td>
                      {/* Requirement 5: TOTAL USES column */}
                      <td>
                        <strong style={{ color: '#334155' }}>{c.usageCount || 0} times</strong>
                      </td>
                      {/* Requirement 1: STATUS badge matching Coupons page */}
                      <td>
                        {status === 'Expired' ? (
                          <span
                            className="adm-status-pill"
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                          >
                            Expired
                          </span>
                        ) : status === 'Disabled' ? (
                          <span className="adm-status-pill adm-status-cancelled">
                            Disabled
                          </span>
                        ) : (
                          <span className="adm-status-pill adm-status-delivered">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

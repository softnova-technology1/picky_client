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
  CartesianGrid,
} from 'recharts';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
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

  // Focused and hovered bar state for interactive chart animation
  const [focusedBar, setFocusedBar] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

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

        {/* Revenue Breakdown - 5 Responsive Metric Progress Cards */}
        <div className="kpi-progress-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {/* 1. Gross Revenue */}
          <AdminStatCard
            title="GROSS REVENUE"
            value={formatPrice(grossRevenue)}
            icon={<DollarSign size={22} />}
            variant="purple"
            footerLabel="Total Sales Volume"
            footerValue="100%"
            progress={100}
          />

          {/* 2. Net Revenue (Gross Revenue minus Total Discounts Given) */}
          <AdminStatCard
            title="NET REVENUE"
            value={formatPrice(netRevenue)}
            icon={<TrendingUp size={22} />}
            variant="green"
            footerLabel="Earnings Margin"
            footerValue={`${grossRevenue ? Math.round((netRevenue / grossRevenue) * 100) : 100}% of Gross`}
            progress={grossRevenue ? (netRevenue / grossRevenue) * 100 : 100}
          />

          {/* 3. Total Discounts Given */}
          <AdminStatCard
            title="TOTAL DISCOUNTS"
            value={formatPrice(totalDiscounts)}
            icon={<Tag size={22} />}
            variant="amber"
            footerLabel="Promotional Savings"
            footerValue={`${grossRevenue ? Math.round((totalDiscounts / grossRevenue) * 100) : 0}% Deducted`}
            progress={grossRevenue ? (totalDiscounts / grossRevenue) * 100 : 0}
          />

          {/* 4. Fulfilled Orders */}
          <AdminStatCard
            title="FULFILLED ORDERS"
            value={fulfilledOrdersCount}
            icon={<PackageCheck size={22} />}
            variant="blue"
            footerLabel="Delivered Deliveries"
            footerValue={`${validOrders.length} In Range`}
            progress={validOrders.length ? (fulfilledOrdersCount / validOrders.length) * 100 : 0}
          />

          {/* 5. Customers Who Ordered */}
          <AdminStatCard
            title="ACTIVE BUYERS"
            value={customersWhoOrderedCount}
            icon={<Users size={22} />}
            variant="purple"
            footerLabel="Unique Accounts"
            footerValue={`${customersWhoOrderedCount} Customers`}
            progress={100}
          />
        </div>

        {/* Sales Revenue Trend Chart */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            margin: 0,
            borderRadius: '16px',
            border: '1.5px solid #ede8f8',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.04)',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
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

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 14, right: 16, left: -10, bottom: 6 }}
                barCategoryGap="24%"
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <defs>
                  {/* Default rich multi-stop gradient */}
                  <linearGradient id="reportsBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.88} />
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.4} />
                  </linearGradient>

                  {/* Active/Hover elevated gradient */}
                  <linearGradient id="reportsBarGradHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d28d9" stopOpacity={1} />
                    <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.65} />
                  </linearGradient>

                  {/* Ambient drop shadow filters for SVG bars */}
                  <filter id="barShadow" x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.16" />
                  </filter>
                  <filter id="activeBarShadow" x="-25%" y="-25%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.32" />
                  </filter>
                </defs>

                {/* Subtle dashed horizontal grid lines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e8ff" opacity={0.75} />

                <XAxis
                  dataKey="day"
                  axisLine={{ stroke: '#f1e8ff', strokeWidth: 1.5 }}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11.5, fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  domain={[0, dynamicYAxisMax]}
                  dx={-4}
                  tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `₹${v}`)}
                />

                {/* Floating dark glassmorphic tooltip */}
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)', radius: 8 }}
                  content={({ active, payload }) => {
                    const item = active && payload && payload.length ? payload[0].payload : focusedBar;
                    if (!item) return null;
                    return (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                          color: '#ffffff',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(124, 58, 237, 0.3)',
                          minWidth: '150px',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#a855f7',
                              display: 'inline-block',
                              boxShadow: '0 0 6px #c084fc',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {item.fullDate || item.day}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '5px',
                          }}
                        >
                          <span>{formatPrice(item.revenue)}</span>
                          <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>earnings</span>
                        </div>
                      </div>
                    );
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="url(#reportsBarGrad)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={38}
                >
                  {chartData.map((entry, index) => {
                    const isHovered = hoveredBarIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        tabIndex={0}
                        role="graphics-symbol"
                        aria-label={`${entry.fullDate || entry.day} — ${formatPrice(entry.revenue)}`}
                        style={{
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        fill={isHovered ? 'url(#reportsBarGradHover)' : 'url(#reportsBarGrad)'}
                        filter={isHovered ? 'url(#activeBarShadow)' : 'url(#barShadow)'}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        onFocus={() => {
                          setFocusedBar(entry);
                          setHoveredBarIndex(index);
                        }}
                        onBlur={() => {
                          setFocusedBar(null);
                          setHoveredBarIndex(null);
                        }}
                      />
                    );
                  })}
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

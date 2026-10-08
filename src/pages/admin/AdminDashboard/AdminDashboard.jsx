import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Download,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  MOCK_SALES_SUMMARY,
  MOCK_ORDERS,
  MOCK_ORDERS_EXTENDED,
  MOCK_TOP_PRODUCTS_REPORT,
} from '../../../data/adminMockData';
import styles from './AdminDashboard.module.css';

const ADMIN = '/pickyadmin-softnova2026';

const TIMEFRAME_OPTIONS = [
  { value: 'Week', label: 'Week' },
  { value: 'This Month', label: 'This Month' },
  { value: 'Year', label: 'Year' },
];

// ─── Timeframe-Specific Coordinated Analytics Data Matrix ────────────────────
const TIMEFRAME_CONFIG = {
  Week: {
    kpis: {
      totalRevenue: '₹28,450.00',
      totalOrders: '2,880',
      customers: '142',
      totalProducts: '72',
    },
    revenueCard: {
      headlineAmount: '₹28,450.00',
      growthPct: '+12.4%',
      growthSub: 'Than Last week',
      maxValue: 50000,
      gridLines: [50000, 40000, 30000, 20000, 10000, 0],
    },
    revenueData: [
      { day: 'Mon', revenue: 18400, ordersCount: 340, revenueFormatted: '₹18,400', label: 'Monday, Aug 31' },
      { day: 'Tue', revenue: 24800, ordersCount: 390, revenueFormatted: '₹24,800', label: 'Tuesday, Sep 01' },
      { day: 'Wed', revenue: 16200, ordersCount: 280, revenueFormatted: '₹16,200', label: 'Wednesday, Sep 02' },
      { day: 'Thu', revenue: 32600, ordersCount: 450, revenueFormatted: '₹32,600', label: 'Thursday, Sep 03' },
      { day: 'Fri', revenue: 28900, ordersCount: 410, revenueFormatted: '₹28,900', label: 'Friday, Sep 04' },
      { day: 'Sat', revenue: 46500, ordersCount: 530, revenueFormatted: '₹46,500', label: 'Saturday, Sep 05' },
      { day: 'Sun', revenue: 38200, ordersCount: 480, revenueFormatted: '₹38,200', label: 'Sunday, Sep 06' },
    ],
    ordersOverview: {
      totalOrders: 2880,
      breakdown: [
        { id: 'cancelled', name: 'Cancelled', count: 144, pct: 5.0, color: '#ef4444' },
        { id: 'shipped', name: 'Shipped', count: 806, pct: 28.0, color: '#6366f1' },
        { id: 'delivered', name: 'Delivered', count: 1296, pct: 45.0, color: '#0ea5e9' },
        { id: 'confirmed', name: 'Confirmed', count: 634, pct: 22.0, color: '#10b981' },
      ],
    },
  },
  'This Month': {
    kpis: {
      totalRevenue: '₹1,18,400.00',
      totalOrders: '7,900',
      customers: '580',
      totalProducts: '72',
    },
    revenueCard: {
      headlineAmount: '₹1,18,400.00',
      growthPct: '+18.2%',
      growthSub: 'Than Last month',
      maxValue: 200000,
      gridLines: [200000, 160000, 120000, 80000, 40000, 0],
    },
    revenueData: [
      { day: 'Wk 1', revenue: 92000, ordersCount: 1450, revenueFormatted: '₹92,000', label: 'Week 1 (Sep 01 - 07)' },
      { day: 'Wk 2', revenue: 134000, ordersCount: 1890, revenueFormatted: '₹1,34,000', label: 'Week 2 (Sep 08 - 14)' },
      { day: 'Wk 3', revenue: 148000, ordersCount: 2100, revenueFormatted: '₹1,48,000', label: 'Week 3 (Sep 15 - 21)' },
      { day: 'Wk 4', revenue: 175500, ordersCount: 2460, revenueFormatted: '₹1,75,500', label: 'Week 4 (Sep 22 - 28)' },
    ],
    ordersOverview: {
      totalOrders: 7900,
      breakdown: [
        { id: 'cancelled', name: 'Cancelled', count: 474, pct: 6.0, color: '#ef4444' },
        { id: 'shipped', name: 'Shipped', count: 2212, pct: 28.0, color: '#6366f1' },
        { id: 'delivered', name: 'Delivered', count: 3555, pct: 45.0, color: '#0ea5e9' },
        { id: 'confirmed', name: 'Confirmed', count: 1659, pct: 21.0, color: '#10b981' },
      ],
    },
  },
  Year: {
    kpis: {
      totalRevenue: '₹4,59,234.08',
      totalOrders: '56,700',
      customers: '3,420',
      totalProducts: '72',
    },
    revenueCard: {
      headlineAmount: '₹4,59,234.08',
      growthPct: '+24.6%',
      growthSub: 'Than Last year',
      maxValue: 1000000,
      gridLines: [1000000, 800000, 600000, 400000, 200000, 0],
    },
    revenueData: [
      { day: 'Jan', revenue: 450000, ordersCount: 6200, revenueFormatted: '₹4,50,000', label: 'January 2026' },
      { day: 'Mar', revenue: 620000, ordersCount: 8400, revenueFormatted: '₹6,20,000', label: 'March 2026' },
      { day: 'May', revenue: 510000, ordersCount: 7100, revenueFormatted: '₹5,10,000', label: 'May 2026' },
      { day: 'Jul', revenue: 840000, ordersCount: 11300, revenueFormatted: '₹8,40,000', label: 'July 2026' },
      { day: 'Sep', revenue: 760000, ordersCount: 10500, revenueFormatted: '₹7,60,000', label: 'September 2026' },
      { day: 'Nov', revenue: 980000, ordersCount: 13200, revenueFormatted: '₹9,80,000', label: 'November 2026' },
    ],
    ordersOverview: {
      totalOrders: 56700,
      breakdown: [
        { id: 'cancelled', name: 'Cancelled', count: 2268, pct: 4.0, color: '#ef4444' },
        { id: 'shipped', name: 'Shipped', count: 15876, pct: 28.0, color: '#6366f1' },
        { id: 'delivered', name: 'Delivered', count: 26649, pct: 47.0, color: '#0ea5e9' },
        { id: 'confirmed', name: 'Confirmed', count: 11907, pct: 21.0, color: '#10b981' },
      ],
    },
  },
};

// Formats Y-axis grid tick numbers gracefully (e.g. 1000k, 200k, 50k, 0)
function formatAxisTick(val) {
  if (val === 0) return '0';
  if (val >= 1000000) {
    return val % 1000000 === 0 ? `${val / 1000000}M` : `${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `${Math.round(val / 1000)}k`;
  }
  return `${val}`;
}

// ─── 1. Left Graph: Total Revenue Premium Spline Chart ───────────────────────
function RevenueWaveChart({
  data = [],
  activeIndex = 3,
  onSelectIndex,
  maxValue = 50000,
  gridLines = [50000, 40000, 30000, 20000, 10000, 0],
}) {
  const svgRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const chartWidth = 540;
  const chartHeight = 220;
  const paddingLeft = 48;
  const paddingRight = 20;
  const chartTop = 20;
  const chartBottom = 180;

  // Calculate point coordinates (Only current period)
  const points = useMemo(() => {
    if (!data.length) return [];
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const stepX = usableWidth / (data.length - 1);

    return data.map((item, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = chartBottom - (item.revenue / maxValue) * (chartBottom - chartTop);
      return { ...item, idx, x, y };
    });
  }, [data, maxValue]);

  // Generate smooth cubic bezier SVG path strings for Line and Area Gradient Fill
  const { pathLine, pathArea } = useMemo(() => {
    if (points.length < 2) return { pathLine: '', pathArea: '' };

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 4.5;
      const cp1y = p1.y + (p2.y - p0.y) / 4.5;
      const cp2x = p2.x - (p3.x - p1.x) / 4.5;
      const cp2y = p2.y - (p3.y - p1.y) / 4.5;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    const areaD = `${d} L ${points[points.length - 1].x},${chartBottom} L ${points[0].x},${chartBottom} Z`;

    return { pathLine: d, pathArea: areaD };
  }, [points, chartBottom]);

  // Dynamic real-time mouse move handler (smoothly tracks cursor when hovered)
  const handleMouseMove = (e) => {
    setIsHovered(true);
    if (!svgRef.current || !points.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDistance = Math.abs(svgX - points[0].x);

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(svgX - points[i].x);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== activeIndex) {
      onSelectIndex(closestIdx);
    }
  };

  // Tooltip position
  const activePt = points[activeIndex] || points[0];
  const tooltipLeftPercent = activePt ? (activePt.x / chartWidth) * 100 : 50;

  return (
    <div className={styles.chartContainer}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: '100%', overflow: 'visible', cursor: 'crosshair' }}
        preserveAspectRatio="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <defs>
          {/* Multi-stop Gradient Area Shade Fill */}
          <linearGradient id="purpleGradientShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b21b6" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.0" />
          </linearGradient>

          {/* Wave Curve Shadow Filter */}
          <filter id="cleanLineShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5b21b6" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* 1. Horizontal Dashed Grid lines */}
        {gridLines.map((val) => {
          const y = chartBottom - (val / maxValue) * (chartBottom - chartTop);
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fontSize="11"
                fontWeight="500"
                fill="#64748b"
                textAnchor="end"
                className={styles.graphAxisFont}
              >
                {formatAxisTick(val)}
              </text>
            </g>
          );
        })}

        {/* 2. Vertical Grid Ticks & X-Axis Day Labels */}
        {points.map((pt, idx) => (
          <g key={`vgrid-${idx}`}>
            <line
              x1={pt.x}
              y1={chartBottom}
              x2={pt.x}
              y2={chartBottom + 5}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            <text
              x={pt.x}
              y={204}
              fontSize="12"
              fontWeight={isHovered && idx === activeIndex ? '800' : '500'}
              fill={isHovered && idx === activeIndex ? '#5b21b6' : '#64748b'}
              textAnchor="middle"
              className={styles.graphAxisFont}
            >
              {pt.day}
            </text>
          </g>
        ))}

        {/* 3. Gradient Area Shade Fill beneath Primary Line */}
        {pathArea && (
          <path
            d={pathArea}
            fill="url(#purpleGradientShade)"
            style={{ transition: 'd 0.3s ease' }}
          />
        )}

        {/* 4. Primary Wave Spline Curve Line with Reduced Stroke (2.4px) */}
        {pathLine && (
          <path
            d={pathLine}
            fill="none"
            stroke="#5b21b6"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#cleanLineShadow)"
          />
        )}

        {/* 5. Active Scanning Beam Line (Only shown on hover) */}
        {isHovered && activePt && (
          <line
            x1={activePt.x}
            y1={chartTop}
            x2={activePt.x}
            y2={chartBottom}
            stroke="#5b21b6"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            style={{ opacity: 0.6, transition: 'x1 0.18s ease-out, x2 0.18s ease-out' }}
          />
        )}

        {/* Data Point Dots on Curve */}
        {points.map((pt, idx) => {
          const isSelected = isHovered && idx === activeIndex;
          return (
            <g key={idx} style={{ cursor: 'pointer' }}>
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 5.5 : 3.5}
                fill={isSelected ? '#ffffff' : '#5b21b6'}
                stroke="#5b21b6"
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{
                  filter: isSelected ? 'drop-shadow(0 2px 6px rgba(91, 33, 182, 0.4))' : 'none',
                  transition: 'all 0.18s ease-out',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip (Appears ONLY when hovering over graph line/canvas) */}
      {isHovered && data[activeIndex] && (
        <div
          className={styles.floatingTooltip}
          style={{ left: `${tooltipLeftPercent}%` }}
        >
          <div className={styles.tooltipTitle}>
            <span>{data[activeIndex].label || 'August 2026'}</span>
            <Sparkles size={12} color="#5b21b6" />
          </div>
          <div className={styles.tooltipRow}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.tooltipDot} style={{ background: '#5b21b6' }} />
              Revenue
            </span>
            <strong style={{ color: '#5b21b6', fontWeight: 800 }}>
              {data[activeIndex].revenueFormatted || '₹31,000'}
            </strong>
          </div>
          <div className={styles.tooltipRow}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.tooltipDot} style={{ background: '#64748b' }} />
              Orders
            </span>
            <strong style={{ color: '#0f172a', fontWeight: 800 }}>
              {data[activeIndex].ordersCount?.toLocaleString() || '440'} orders
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function: generates clean annular donut sector path with smooth gap separation
function createDonutSector(cx, cy, rIn, rOut, a0Deg, a1Deg, gapDeg = 3.5) {
  const span = a1Deg - a0Deg;
  // Scaled gap so tiny slices (< 8%) remain clear and proportional
  const effectiveGap = Math.min(gapDeg, span * 0.22);
  const a0 = (a0Deg + effectiveGap / 2) * (Math.PI / 180);
  const a1 = (a1Deg - effectiveGap / 2) * (Math.PI / 180);
  const angleSpan = a1 - a0;

  if (angleSpan <= 0.005) return '';

  const x1Out = cx + rOut * Math.cos(a0);
  const y1Out = cy + rOut * Math.sin(a0);
  const x2Out = cx + rOut * Math.cos(a1);
  const y2Out = cy + rOut * Math.sin(a1);

  const x2In = cx + rIn * Math.cos(a1);
  const y2In = cy + rIn * Math.sin(a1);
  const x1In = cx + rIn * Math.cos(a0);
  const y1In = cy + rIn * Math.sin(a0);

  const largeArc = angleSpan > Math.PI ? 1 : 0;

  return [
    `M ${x1Out.toFixed(2)} ${y1Out.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out.toFixed(2)} ${y2Out.toFixed(2)}`,
    `L ${x2In.toFixed(2)} ${y2In.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1In.toFixed(2)} ${y1In.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// ─── 2. Right Graph: Orders Overview Segmented Donut Breakdown Chart ─────────
function OrdersDonutChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cx = 135;
  const cy = 115;
  const rOut = 98;
  const rIn = 62;
  const rMid = (rOut + rIn) / 2;

  const totalOrders = data?.totalOrders ?? 2343;
  const orderBreakdown = data?.breakdown ?? [
    {
      id: 'cancelled',
      name: 'Cancelled',
      count: 141,
      pct: 6.0,
      color: '#ef4444', // Coral Red
    },
    {
      id: 'shipped',
      name: 'Shipped',
      count: 656,
      pct: 28.0,
      color: '#6366f1', // Indigo Violet
    },
    {
      id: 'delivered',
      name: 'Delivered',
      count: 984,
      pct: 42.0,
      color: '#0ea5e9', // Sky Cyan
    },
    {
      id: 'confirmed',
      name: 'Confirmed',
      count: 562,
      pct: 24.0,
      color: '#10b981', // Emerald Green
    },
  ];

  // Calculate clean annular sectors and center labels
  const slices = useMemo(() => {
    let currentAngle = -90;

    return orderBreakdown.map((item) => {
      const spanDeg = (item.pct / 100) * 360;
      const a0 = currentAngle;
      const a1 = currentAngle + spanDeg;
      const midAngle = (a0 + a1) / 2;

      const path = createDonutSector(cx, cy, rIn, rOut, a0, a1, 3.5);

      // Percentage label coordinates right in the middle of each sector
      const radMid = (midAngle * Math.PI) / 180;
      const textX = cx + rMid * Math.cos(radMid);
      const textY = cy + rMid * Math.sin(radMid);

      currentAngle += spanDeg;

      return {
        ...item,
        path,
        textX,
        textY,
      };
    });
  }, [orderBreakdown, cx, cy, rIn, rOut, rMid]);

  // Legend items order
  const legendOrder = ['shipped', 'delivered', 'confirmed', 'cancelled'];
  const legendItems = legendOrder.map((id) => orderBreakdown.find((item) => item.id === id)).filter(Boolean);

  const activeItem = hoveredIndex !== null ? orderBreakdown[hoveredIndex] : null;

  return (
    <div className={styles.donutWrapper}>
      <div className={styles.donutSvgContainer}>
        <svg
          viewBox="0 0 270 230"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Donut Slices with Smooth Center-Scaled Hover Interaction (Zero Jitter / No Override) */}
          {slices.map((slice, idx) => {
            const isHovered = hoveredIndex === idx;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <g
                key={slice.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  cursor: 'pointer',
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: isHovered ? 'scale(1.045)' : 'scale(1)',
                  transition: 'transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
                  opacity: isAnyHovered && !isHovered ? 0.45 : 1,
                }}
              >
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 6px 16px ${slice.color}85)`
                      : 'drop-shadow(0 1px 3px rgba(0,0,0,0.05))',
                    transition: 'filter 0.2s ease',
                  }}
                />
                {/* Percentage label inside the slice */}
                <text
                  x={slice.textX}
                  y={slice.textY}
                  fill="#ffffff"
                  fontSize={slice.pct < 6 ? '10' : '11'}
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
                  }}
                >
                  {slice.pct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Donut Readout */}
        <div className={styles.donutCenterText}>
          <div
            className={styles.donutValue}
            style={{
              color: activeItem ? activeItem.color : '#0f172a',
              transition: 'color 0.2s ease',
            }}
          >
            {activeItem ? activeItem.count.toLocaleString() : totalOrders.toLocaleString()}
          </div>
          <div className={styles.donutLabel}>
            {activeItem ? `${activeItem.name} (${activeItem.pct}%)` : 'TOTAL ORDERS'}
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Legend Badges */}
      <div className={styles.legendInlineRow}>
        {legendItems.map((item) => {
          const sliceIndex = orderBreakdown.findIndex((b) => b.id === item.id);
          const isHovered = hoveredIndex === sliceIndex;

          return (
            <div
              key={item.id}
              className={`${styles.legendInlineItem} ${isHovered ? styles.legendInlineItemActive : ''}`}
              onMouseEnter={() => setHoveredIndex(sliceIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className={styles.legendColorDot}
                style={{ background: item.color }}
              />
              <span className={styles.legendText}>
                {item.name}
              </span>
              <span className={styles.legendPctBadge} style={{ color: item.color }}>
                {item.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
export default function AdminDashboard() {
  const { showToast } = useUiStore();
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, confirmedOrders: 0, totalCustomers: 0, totalProducts: 0, dailySales: [] });
  const [activeBarIndex, setActiveBarIndex] = useState(3);
  const [timeframe, setTimeframe] = useState('Week');

  const [recentOrders, setRecentOrders] = useState(() => (MOCK_ORDERS_EXTENDED?.length >= 5 ? MOCK_ORDERS_EXTENDED : MOCK_ORDERS).slice(0, 5));
  const [topProducts, setTopProducts] = useState(() => MOCK_TOP_PRODUCTS_REPORT.slice(0, 5));

  // Fetch live statistics seamlessly
  useEffect(() => {
    async function fetchStats() {
      try {
        const [sumRes, topRes, ordRes] = await Promise.all([
          adminService.getSalesSummary().catch(() => null),
          adminService.getTopProducts(5).catch(() => null),
          adminService.getOrders({ limit: 5 }).catch(() => null),
        ]);
        
        const data = sumRes?.data?.data || sumRes?.data || sumRes;
        if (data && data.totalOrders !== undefined) {
          setSummary(data);
        } else {
          setSummary(MOCK_SALES_SUMMARY);
        }

        const tpList = topRes?.data?.data || topRes?.data || topRes;
        if (Array.isArray(tpList)) {
          setTopProducts(tpList);
        }

        const ordList = ordRes?.data?.data || ordRes?.data?.orders || ordRes?.data || ordRes;
        if (Array.isArray(ordList)) {
          setRecentOrders(ordList.slice(0, 5));
        }
      } catch (err) {
        // Leave summary as 0
      }
    }
    fetchStats();
  }, []);

  // Dynamically map real summary data or fallback to config
  const currentData = useMemo(() => {
    const baseConfig = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG['Week'];
    
    if (summary && summary.totalRevenue !== undefined && summary.totalOrders !== undefined) {
      return {
        ...baseConfig,
        kpis: {
          totalRevenue: formatPrice(summary.totalRevenue),
          totalOrders: summary.totalOrders.toLocaleString(),
          customers: (summary.totalCustomers || 0).toLocaleString(),
          totalProducts: (summary.totalProducts || 0).toLocaleString(),
        },
        revenueCard: {
          ...baseConfig.revenueCard,
          headlineAmount: formatPrice(summary.totalRevenue),
        },
        ordersOverview: {
          totalOrders: summary.totalOrders,
          breakdown: [
            { id: 'cancelled', name: 'Cancelled', count: summary.totalOrders - summary.confirmedOrders, pct: summary.totalOrders ? Math.round(((summary.totalOrders - summary.confirmedOrders) / summary.totalOrders) * 100) : 0, color: '#ef4444' },
            { id: 'shipped', name: 'Shipped', count: Math.floor(summary.confirmedOrders * 0.3), pct: summary.totalOrders ? Math.round((Math.floor(summary.confirmedOrders * 0.3) / summary.totalOrders) * 100) : 0, color: '#6366f1' },
            { id: 'delivered', name: 'Delivered', count: Math.floor(summary.confirmedOrders * 0.5), pct: summary.totalOrders ? Math.round((Math.floor(summary.confirmedOrders * 0.5) / summary.totalOrders) * 100) : 0, color: '#0ea5e9' },
            { id: 'confirmed', name: 'Confirmed', count: summary.confirmedOrders - Math.floor(summary.confirmedOrders * 0.3) - Math.floor(summary.confirmedOrders * 0.5), pct: summary.totalOrders ? Math.round(((summary.confirmedOrders - Math.floor(summary.confirmedOrders * 0.3) - Math.floor(summary.confirmedOrders * 0.5)) / summary.totalOrders) * 100) : 0, color: '#10b981' },
          ],
        },
        revenueData: summary.dailySales?.length ? summary.dailySales.map((s) => ({
          day: new Date(s._id).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: s.sales,
          ordersCount: s.orders,
          revenueFormatted: formatPrice(s.sales),
          label: new Date(s._id).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        })) : baseConfig.revenueData.map(d => ({ ...d, revenue: 0, ordersCount: 0, revenueFormatted: '₹0' }))
      };
    }
    
    // Completely clear baseConfig if summary is still loading or doesn't match
    return {
      ...baseConfig,
      kpis: { totalRevenue: '₹0', totalOrders: '0', customers: '0', totalProducts: '0' },
      revenueCard: { ...baseConfig.revenueCard, headlineAmount: '₹0' },
      revenueData: baseConfig.revenueData.map(d => ({ ...d, revenue: 0, ordersCount: 0, revenueFormatted: '₹0' })),
      ordersOverview: { totalOrders: 0, breakdown: baseConfig.ordersOverview.breakdown.map(b => ({...b, count: 0, pct: 0})) }
    };
  }, [timeframe, summary]);

  // Keep active index bounded when timeframe data length changes
  useEffect(() => {
    setActiveBarIndex((prev) => Math.min(prev, (currentData.revenueData.length || 1) - 1));
  }, [timeframe, currentData]);

  // Sparkline SVGs for KPI Cards without overflow leakage
  const sparkline1 = (
    <svg viewBox="0 0 120 45" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 38 Q 30 32, 60 20 T 120 8 L 120 45 L 0 45 Z" fill="url(#sparkGrad1)" />
      <path d="M0 38 Q 30 32, 60 20 T 120 8" fill="none" stroke="#2563eb" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline2 = (
    <svg viewBox="0 0 120 45" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 32 Q 35 38, 70 18 T 120 6 L 120 45 L 0 45 Z" fill="url(#sparkGrad2)" />
      <path d="M0 32 Q 35 38, 70 18 T 120 6" fill="none" stroke="#10b981" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline3 = (
    <svg viewBox="0 0 120 45" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 18 Q 40 32, 75 22 T 120 30 L 120 45 L 0 45 Z" fill="url(#sparkGrad3)" />
      <path d="M0 18 Q 40 32, 75 22 T 120 30" fill="none" stroke="#f97316" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline4 = (
    <svg viewBox="0 0 120 45" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 40 Q 35 28, 65 18 T 120 5 L 120 45 L 0 45 Z" fill="url(#sparkGrad4)" />
      <path d="M0 40 Q 35 28, 65 18 T 120 5" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className={styles.dashboardContainer}>
        {/* ─── 1. Header Overview Row ───────── */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Sales Overview</h1>
            <p className={styles.pageSubtitle}>Real-time store performance, growth metrics and analytics</p>
          </div>

          <div className={styles.headerActions}>
            {/* Timeframe Dropdown Selection */}
            <Select
              value={timeframe}
              onChange={(val) => {
                setTimeframe(val);
                showToast(`Viewing data for ${val}`, 'info');
              }}
              options={TIMEFRAME_OPTIONS}
              minWidth="92px"
              height="36px"
              borderRadius="9999px"
              buttonStyle={{
                border: '1.5px solid #ede8f8',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#1e1b4b',
                padding: '0 0.65rem',
                gap: '0.35rem',
                boxShadow: '0 1px 3px rgba(124, 58, 237, 0.04)',
              }}
              ariaLabel="Select timeframe"
            />

            {/* Export Button */}
            <button
              className={styles.exportBtn}
              onClick={() => showToast('Exporting dashboard sales report (CSV/PDF)...', 'info')}
              title="Export Report"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ─── 2. Top 4 Ultra-Premium KPI Cards ─── */}
        <div className={styles.kpiGrid}>
          {/* Card 1: Total Revenue */}
          <div className={styles.kpiCard}>
            {sparkline4}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.purple}`}>
                <DollarSign size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Revenue</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalRevenue}</div>
          </div>

          {/* Card 2: Total Orders */}
          <div className={styles.kpiCard}>
            {sparkline1}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.blue}`}>
                <ShoppingCart size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Orders</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalOrders}</div>
          </div>

          {/* Card 3: Customers */}
          <div className={styles.kpiCard}>
            {sparkline2}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.green}`}>
                <Users size={16} />
              </div>
              <span className={styles.kpiLabel}>Customers</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.customers}</div>
          </div>

          {/* Card 4: Total Products */}
          <div className={styles.kpiCard}>
            {sparkline3}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.orange}`}>
                <Package size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Products</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalProducts}</div>
          </div>
        </div>

        {/* ─── 3. Middle Row: Revenue Wave Chart + Orders Donut Status Breakdown ─ */}
        <div className={styles.middleGrid}>
          {/* Left Column: Total Revenue Spline Wave Chart */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Total Revenue</h2>
            </div>

            {/* Metric Summary Banner */}
            <div className={styles.revenueBannerRow}>
              <div className={styles.revenueBannerLeft}>
                <div className={styles.greenCircleBadge}>
                  <ArrowUpRight size={20} strokeWidth={2.8} />
                </div>
                <div className={styles.revenueBigAmount}>{currentData.revenueCard.headlineAmount}</div>
              </div>

              <div className={styles.revenueLiveBadge}>
                <span className={styles.livePulseDot} />
                <span className={styles.liveBadgeText}>Live Analytics</span>
              </div>
            </div>

            {/* Interactive Revenue Spline Wave Chart with Dynamic Scaling Y-Axis */}
            <RevenueWaveChart
              data={currentData.revenueData}
              maxValue={currentData.revenueCard.maxValue}
              gridLines={currentData.revenueCard.gridLines}
              activeIndex={activeBarIndex}
              onSelectIndex={setActiveBarIndex}
            />
          </div>

          {/* Right Column: Orders Status Donut Chart Breakdown */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <h2 className={styles.cardTitle}>Orders Overview</h2>
              </div>
              <div className={styles.ordersStatusBadge}>
                <span className={styles.bluePulseDot} />
                <span className={styles.ordersBadgeText}>Live Orders</span>
              </div>
            </div>

            {/* Modern Dynamic Segmented Donut Chart */}
            <OrdersDonutChart data={currentData.ordersOverview} />
          </div>
        </div>

        {/* ─── 4. Bottom Row: Recent Orders & Top Selling Products ─────────── */}
        <div className={styles.bottomGrid}>
          {/* Left Column: Recent Orders Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Orders</h2>
              <Link to={`${ADMIN}/orders`} className={styles.viewAllLink}>
                <span>View All Orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  let statusClass = styles.statusDelivered;
                  if (order.status === 'shipped') statusClass = styles.statusShipped;
                  else if (order.status === 'confirmed') statusClass = styles.statusConfirmed;
                  else if (order.status === 'cancelled') statusClass = styles.statusCancelled;

                  const customerInitials = order.customer?.name
                    ? order.customer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                    : 'CU';

                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={order._id}>
                      <td>
                        <strong style={{ color: '#7c3aed', fontSize: '0.84rem' }}>
                          {order.orderNumber}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className={styles.customerAvatarBadge}>{customerInitials}</span>
                          <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{order.customer?.name}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{formatPrice(order.totalAmount)}</strong>
                      </td>
                      <td>
                        <span className={`${styles.statusPill} ${statusClass}`}>
                          <span className={styles.statusPulseDot} />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{orderDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Column: Top Selling Products */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Top Products</h2>
              <Link to={`${ADMIN}/products`} className={styles.viewAllLink}>
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.topProductsList}>
              {topProducts.map((prod, idx) => (
                <div key={prod._id || prod.id} className={styles.topProductRow}>
                  <div className={styles.topProductLeft}>
                    <span
                      className={`${styles.topRankNum} ${
                        idx === 0
                          ? styles.topRankFirst
                          : idx === 1
                          ? styles.topRankSecond
                          : idx === 2
                          ? styles.topRankThird
                          : ''
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <img
                      src={
                        prod.image ||
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'
                      }
                      alt={prod.name}
                      className={styles.topProductImg}
                    />
                    <div>
                      <span className={styles.topProductName}>{prod.name}</span>
                      <span className={styles.topProductCat}>
                        {prod.category?.name || "Women's Fashion"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                      {formatPrice(prod.discountPrice || prod.price)}
                    </div>
                    <span className={styles.topProductSales}>{prod.unitsSold} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


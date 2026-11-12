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
  Truck,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  TicketPercent,
  CreditCard,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  Star,
  ShoppingBag,
  MapPin,
  Zap,
  Send,
  Plus,
  Tag,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './AdminDashboard.module.css';
import { joinAdminRoom, subscribeToOrders } from '../../../services/socket';

const ADMIN = '/softpicky-sn2026';

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
    return val % 1000 === 0 ? `${val / 1000}k` : `${(val / 1000).toFixed(1)}k`;
  }
  return `${val}`;
}

// Dynamically calculates Y-axis maximum and balanced grid intervals
function getDynamicChartScale(maxVal) {
  if (maxVal <= 0) {



    
    return {
      maxValue: 1000,
      gridLines: [1000, 800, 600, 400, 200, 0],
    };
  }

  const target = maxVal * 1.25;
  const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
  const normalized = target / magnitude;

  let step;
  if (normalized <= 2) step = 0.4 * magnitude;
  else if (normalized <= 5) step = 1 * magnitude;
  else step = 2 * magnitude;

  const maxValue = Math.ceil(target / step) * step;
  const gridLines = [];
  for (let i = 5; i >= 0; i--) {
    gridLines.push(Math.round((maxValue / 5) * i));
  }

  return { maxValue, gridLines };
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
    const stepX = data.length > 1 ? usableWidth / (data.length - 1) : 0;

    return data.map((item, idx) => {
      const x = paddingLeft + (data.length > 1 ? idx * stepX : usableWidth / 2);
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

// Module-level cache for instant revisit rendering (keyed by timeframe)
let cachedDashboardData = null;

function formatActivityRelativeTime(ts) {
  if (!ts) return 'Recent';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
export default function AdminDashboard() {
  const { showToast } = useUiStore();
  const [timeframe, setTimeframe] = useState('Week');
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [summary, setSummary] = useState(
    () =>
      cachedDashboardData?.summary || {
        totalRevenue: 0,
        totalOrders: 0,
        confirmedOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        avgOrderValue: 0,
        dailySales: [],
        timeframeSeries: [],
      }
  );
  const [activeBarIndex, setActiveBarIndex] = useState(0);

  const [recentOrders, setRecentOrders] = useState(() => cachedDashboardData?.recentOrders || []);
  const [topProducts, setTopProducts] = useState(() => cachedDashboardData?.topProducts || []);

  // Live updating 1-second Clock & Date ticker
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const liveDateDisplay = useMemo(
    () =>
      liveNow.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [liveNow]
  );

  const liveTimeDisplay = useMemo(
    () =>
      liveNow.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    [liveNow]
  );

  // Fetch live statistics seamlessly (updates when timeframe changes too)
  useEffect(() => {
    let isLoaded = Boolean(cachedDashboardData);
    let lastFocusSyncAt = 0;

    async function fetchStats() {
      try {
        const [sumRes, topRes, ordRes] = await Promise.all([
          adminService.getSalesSummary({ timeframe }).catch(() => null),
          adminService.getTopProducts(5).catch(() => null),
          adminService.getOrders({ limit: 5 }).catch(() => null),
        ]);

        const data = sumRes?.data?.data || sumRes?.data || sumRes;
        const tpList = topRes?.data?.data || topRes?.data || topRes;
        const ordList = ordRes?.data?.data || ordRes?.data?.orders || ordRes?.data || ordRes;

        const nextSummary =
          data && data.totalOrders !== undefined
            ? data
            : cachedDashboardData?.summary || {
                totalRevenue: 0,
                totalOrders: 0,
                confirmedOrders: 0,
                totalCustomers: 0,
                totalProducts: 0,
                avgOrderValue: 0,
                dailySales: [],
                timeframeSeries: [],
              };
        const nextTop = Array.isArray(tpList) ? tpList : cachedDashboardData?.topProducts || [];
        const nextRecent = Array.isArray(ordList)
          ? ordList.slice(0, 5)
          : cachedDashboardData?.recentOrders || [];

        if (data && data.totalOrders !== undefined) {
          isLoaded = true;
          cachedDashboardData = {
            summary: nextSummary,
            topProducts: nextTop,
            recentOrders: nextRecent,
          };
        }

        setSummary(nextSummary);
        setTopProducts(nextTop);
        setRecentOrders(nextRecent);
      } catch (err) {
        if (!cachedDashboardData) {
          setSummary({
            totalRevenue: 0,
            totalOrders: 0,
            confirmedOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            avgOrderValue: 0,
            dailySales: [],
            timeframeSeries: [],
          });
          setRecentOrders([]);
          setTopProducts([]);
        }
      }
    }
    fetchStats();

    // Auto-rehydrate silently when server reconnects or on throttled focus
    const handleServerOnline = () => {
      fetchStats();
    };
    const handleFocusSync = () => {
      const now = Date.now();
      if (now - lastFocusSyncAt < 15000) return;
      lastFocusSyncAt = now;
      fetchStats();
    };

    window.addEventListener('picky_server_reconnected', handleServerOnline);
    window.addEventListener('focus', handleFocusSync);

    // Retry every 5s ONLY if initial stats haven't loaded yet
    const retryInterval = setInterval(() => {
      if (!isLoaded && document.visibilityState === 'visible') {
        fetchStats();
      }
    }, 5000);

    let unsub = () => {};
    try {
      joinAdminRoom();
      unsub = subscribeToOrders(() => {
        fetchStats();
      });
    } catch (_) {}

    return () => {
      try {
        unsub();
      } catch (_) {}
      window.removeEventListener('picky_server_reconnected', handleServerOnline);
      window.removeEventListener('focus', handleFocusSync);
      clearInterval(retryInterval);
    };
  }, [timeframe]);

  // Dynamically map real summary data cleanly
  const currentData = useMemo(() => {
    const baseConfig = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG['Week'];

    if (summary && summary.totalRevenue !== undefined && summary.totalOrders !== undefined) {
      let revData = [];
      if (Array.isArray(summary.timeframeSeries) && summary.timeframeSeries.length > 0) {
        revData = summary.timeframeSeries.map((pt) => ({
          day: pt.day,
          label: pt.label || pt.day,
          revenue: Number(pt.revenue) || 0,
          ordersCount: Number(pt.ordersCount) || 0,
          revenueFormatted: formatPrice(Number(pt.revenue) || 0),
        }));
      } else {
        const salesByDay = {};
        if (Array.isArray(summary.dailySales)) {
          summary.dailySales.forEach((s) => {
            if (s && s._id) {
              const dayKey = new Date(s._id).toLocaleDateString('en-US', { weekday: 'short' });
              salesByDay[dayKey] = s;
            }
          });
        }
        revData = baseConfig.revenueData.map((d) => {
          const matchingSale = salesByDay[d.day];
          if (matchingSale) {
            return {
              ...d,
              revenue: matchingSale.sales || 0,
              ordersCount: matchingSale.orders || 0,
              revenueFormatted: formatPrice(matchingSale.sales || 0),
              label: new Date(matchingSale._id).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              }),
            };
          }
          return { ...d, revenue: 0, ordersCount: 0, revenueFormatted: '₹0' };
        });
      }

      const maxSale = Math.max(...revData.map((d) => d.revenue), 0);
      const chartScale = getDynamicChartScale(maxSale);

      // Real Order Status Breakdown from MongoDB (never guessed percentages)
      const osb = summary.orderStatusBreakdown;
      let breakdown;
      let breakdownTotal = summary.totalOrders;
      if (osb) {
        const confirmedCnt = (osb.placed || 0) + (osb.confirmed || 0);
        const shippedCnt = (osb.shipped || 0) + (osb.out_for_delivery || 0);
        const deliveredCnt = osb.delivered || 0;
        const cancelledCnt = osb.cancelled || 0;
        const statusSum = confirmedCnt + shippedCnt + deliveredCnt + cancelledCnt;
        breakdownTotal = statusSum || summary.totalOrders;
        const calcPct = (n) => (breakdownTotal > 0 ? Number(((n / breakdownTotal) * 100).toFixed(1)) : 0);
        breakdown = [
          { id: 'cancelled', name: 'Cancelled', count: cancelledCnt, pct: calcPct(cancelledCnt), color: '#ef4444' },
          { id: 'shipped', name: 'Shipped', count: shippedCnt, pct: calcPct(shippedCnt), color: '#6366f1' },
          { id: 'delivered', name: 'Delivered', count: deliveredCnt, pct: calcPct(deliveredCnt), color: '#0ea5e9' },
          { id: 'confirmed', name: 'Confirmed', count: confirmedCnt, pct: calcPct(confirmedCnt), color: '#10b981' },
        ];
      } else {
        breakdown = [
          {
            id: 'cancelled',
            name: 'Cancelled',
            count: Math.max(0, summary.totalOrders - summary.confirmedOrders),
            pct: summary.totalOrders
              ? Math.round(((summary.totalOrders - summary.confirmedOrders) / summary.totalOrders) * 100)
              : 0,
            color: '#ef4444',
          },
          { id: 'shipped', name: 'Shipped', count: 0, pct: 0, color: '#6366f1' },
          { id: 'delivered', name: 'Delivered', count: 0, pct: 0, color: '#0ea5e9' },
          {
            id: 'confirmed',
            name: 'Confirmed',
            count: summary.confirmedOrders || 0,
            pct: summary.totalOrders ? Math.round((summary.confirmedOrders / summary.totalOrders) * 100) : 0,
            color: '#10b981',
          },
        ];
      }

      const periodRevenue =
        summary.timeframeRevenue !== undefined ? summary.timeframeRevenue : summary.totalRevenue;

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
          headlineAmount: formatPrice(periodRevenue),
          growthPct: summary.growthPct !== undefined ? summary.growthPct : 0,
          maxValue: chartScale.maxValue,
          gridLines: chartScale.gridLines,
        },
        ordersOverview: {
          totalOrders: breakdownTotal,
          breakdown,
        },
        revenueData: revData,
      };
    }

    return {
      ...baseConfig,
      kpis: { totalRevenue: '₹0', totalOrders: '0', customers: '0', totalProducts: '0' },
      revenueCard: { ...baseConfig.revenueCard, headlineAmount: '₹0', growthPct: 0 },
      revenueData: baseConfig.revenueData.map((d) => ({
        ...d,
        revenue: 0,
        ordersCount: 0,
        revenueFormatted: '₹0',
      })),
      ordersOverview: {
        totalOrders: 0,
        breakdown: baseConfig.ordersOverview.breakdown.map((b) => ({ ...b, count: 0, pct: 0 })),
      },
    };
  }, [timeframe, summary]);

  // Derived Operational & Business Metrics
  const actionAlerts = summary?.actionAlerts || {
    readyToDispatch: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    pendingReturns: 0,
    unreadInquiries: 0,
    pendingReviews: 0,
  };
  const couponInsights = summary?.couponInsights || {
    totalCoupons: 0,
    activeCoupons: 0,
    scheduledCoupons: 0,
    totalRedemptions: 0,
    discountSaved: 0,
    salesViaCoupons: 0,
    topCoupon: null,
  };
  const abandonedCartInsights = summary?.abandonedCartInsights || {
    activeCount: 0,
    atRiskValue: 0,
    recoveredCount: 0,
    recoveredValue: 0,
  };
  const paymentBreakdown = summary?.paymentBreakdown || {
    onlineCount: 0,
    onlineAmount: 0,
    codCount: 0,
    codAmount: 0,
  };
  const categorySales = Array.isArray(summary?.categorySales) ? summary.categorySales : [];
  const liveActivity = Array.isArray(summary?.liveActivity) ? summary.liveActivity : [];
  const avgOrderValue =
    summary?.avgOrderValue !== undefined
      ? summary.avgOrderValue
      : summary?.confirmedOrders > 0
      ? Math.round((summary.totalRevenue || 0) / summary.confirmedOrders)
      : 0;

  const totalPaymentCount = paymentBreakdown.onlineCount + paymentBreakdown.codCount;
  const onlinePct =
    totalPaymentCount > 0 ? Math.round((paymentBreakdown.onlineCount / totalPaymentCount) * 100) : 0;
  const codPct = totalPaymentCount > 0 ? 100 - onlinePct : 0;
  const maxCategoryRevenue = Math.max(...categorySales.map((c) => c.revenue || 0), 1);

  const todaySnapshot = summary?.todaySnapshot || {
    orders: 0,
    revenue: 0,
    yesterdayOrders: 0,
    yesterdayRevenue: 0,
    revenueGrowthPct: 0,
    signups: 0,
  };
  const fulfillmentHealth = summary?.fulfillmentHealth || {
    awaitingAwb: 0,
    inTransit: 0,
    cancelledCount: 0,
    cancelledValue: 0,
    cancellationRatePct: 0,
    returnRequests: 0,
    refundedValue: 0,
  };
  const lowStockWatchlist = Array.isArray(summary?.lowStockWatchlist) ? summary.lowStockWatchlist : [];
  const locationInsights = summary?.locationInsights || {
    topCities: [],
    tnOrders: 0,
    tnRevenue: 0,
    otherOrders: 0,
    otherRevenue: 0,
  };
  const customerRetention = summary?.customerRetention || {
    totalCustomers: summary?.totalCustomers || 0,
    uniqueBuyers: 0,
    repeatBuyers: 0,
    repeatRatePct: 0,
    newUsersThisWeek: 0,
  };
  const activePromotions = summary?.activePromotions || {
    activeDiscountsCount: 0,
    discountedProductsCount: 0,
    highlights: [],
  };
  const totalRegionOrders = (locationInsights.tnOrders || 0) + (locationInsights.otherOrders || 0);
  const tnPct = totalRegionOrders > 0 ? Math.round((locationInsights.tnOrders / totalRegionOrders) * 100) : 0;
  const maxCityRevenue = Math.max(
    ...(locationInsights.topCities || []).map((c) => c.revenue || 0),
    1
  );

  // Real CSV Report Export Handler
  const handleExportDashboardReport = () => {
    try {
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['PICKY STORE EXECUTIVE DASHBOARD REPORT'],
        ['Generated At', `${liveDateDisplay} ${liveTimeDisplay}`],
        ['Selected Timeframe', timeframe],
        [],
        ['TODAY LIVE SNAPSHOT', 'VALUE'],
        ['Today Orders', todaySnapshot.orders],
        ['Today Revenue (INR)', todaySnapshot.revenue],
        ['Yesterday Revenue (INR)', todaySnapshot.yesterdayRevenue],
        ['Today New Signups', todaySnapshot.signups],
        [],
        ['STORE KPIs', 'VALUE'],
        ['Total Revenue', summary.totalRevenue || 0],
        ['Period Revenue (' + timeframe + ')', summary.timeframeRevenue ?? summary.totalRevenue ?? 0],
        ['Average Order Value (AOV)', avgOrderValue],
        ['Total Orders', summary.totalOrders || 0],
        ['Active Customers', summary.totalCustomers || 0],
        ['Repeat Customer Rate (%)', customerRetention.repeatRatePct],
        ['Active Products', summary.totalProducts || 0],
        [],
        ['FULFILLMENT & LOSS HEALTH', 'VALUE'],
        ['Awaiting Shiprocket AWB', fulfillmentHealth.awaitingAwb],
        ['In Transit Orders', fulfillmentHealth.inTransit],
        ['Cancelled Orders', fulfillmentHealth.cancelledCount],
        ['Cancellation Rate (%)', fulfillmentHealth.cancellationRatePct],
        ['Cancelled Value (INR)', fulfillmentHealth.cancelledValue],
        ['Refunded Return Value (INR)', fulfillmentHealth.refundedValue],
        [],
        ['ACTION ALERTS', 'COUNT'],
        ['Ready to Dispatch Orders', actionAlerts.readyToDispatch],
        ['Low Stock Items', actionAlerts.lowStockCount],
        ['Out of Stock Items', actionAlerts.outOfStockCount],
        ['Pending Return Requests', actionAlerts.pendingReturns],
        ['Unread Inquiries', actionAlerts.unreadInquiries],
        ['Pending Reviews', actionAlerts.pendingReviews],
        [],
        ['LOW STOCK WATCHLIST', 'SKU', 'REMAINING QTY'],
        ...lowStockWatchlist.map((p) => [p.name, p.sku || '-', p.quantity]),
        [],
        ['TOP DELIVERY CITIES', 'ORDERS', 'REVENUE (INR)'],
        ...(locationInsights.topCities || []).map((c) => [`${c.city}${c.state ? ', ' + c.state : ''}`, c.orders, c.revenue]),
        [],
        ['COUPON & ABANDONED CART INSIGHTS', 'VALUE'],
        ['Active Coupons', couponInsights.activeCoupons],
        ['Scheduled Coupons', couponInsights.scheduledCoupons],
        ['Coupon Redemptions', couponInsights.totalRedemptions],
        ['Total Coupon Savings', couponInsights.discountSaved],
        ['Abandoned Carts At Risk', abandonedCartInsights.activeCount],
        ['Abandoned Cart Value At Risk', abandonedCartInsights.atRiskValue],
        ['Recovered Carts', abandonedCartInsights.recoveredCount],
        ['Recovered Revenue', abandonedCartInsights.recoveredValue],
        [],
        ['REVENUE SERIES (' + timeframe + ')', 'REVENUE (INR)', 'ORDERS'],
        ...currentData.revenueData.map((r) => [r.label || r.day, r.revenue, r.ordersCount]),
        [],
        ['TOP CATEGORIES', 'REVENUE (INR)', 'UNITS SOLD'],
        ...categorySales.map((c) => [c.name, c.revenue, c.units]),
        [],
        ['TOP PRODUCTS', 'UNITS SOLD', 'REVENUE (INR)'],
        ...topProducts.map((p) => [p.name, p.unitsSold || 0, p.totalRevenue || 0]),
        [],
        ['RECENT ORDERS', 'CUSTOMER', 'TOTAL (INR)', 'STATUS', 'DATE'],
        ...recentOrders.map((o) => [
          o.orderNumber,
          o.user?.name || o.shippingAddress?.fullName || o.customer?.name || 'Customer',
          o.total ?? o.totalAmount ?? 0,
          o.status,
          new Date(o.createdAt).toLocaleString('en-IN'),
        ]),
      ];

      const csvContent = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `picky-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Dashboard report exported as CSV!', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to export dashboard report', 'error');
    }
  };

  // Set active bar index to the day with sales or keep bounded
  useEffect(() => {
    if (currentData.revenueData?.length) {
      const activeIdx = currentData.revenueData.findIndex((d) => d.revenue > 0);
      if (activeIdx !== -1) {
        setActiveBarIndex(activeIdx);
      } else {
        setActiveBarIndex(Math.max(0, currentData.revenueData.length - 1));
      }
    }
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

  const lowOutTotal = (actionAlerts.lowStockCount || 0) + (actionAlerts.outOfStockCount || 0);
  const msgReviewTotal = (actionAlerts.unreadInquiries || 0) + (actionAlerts.pendingReviews || 0);

  return (
    <AdminLayout title="Dashboard">
      <div className={styles.dashboardContainer}>
        {/* ─── 1. Header Overview Row with Live Date & Real-Time Clock ───────── */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Real-time store performance, operations, and growth analytics</p>
          </div>

          <div className={styles.headerActions}>
            {/* Live Timing & Date Pill */}
            <div className={styles.liveClockPill} title="Live Store Clock (IST)">
              <span className={styles.livePulseGreen} />
              <Calendar size={13} color="#64748b" />
              <span className={styles.liveClockDate}>{liveDateDisplay}</span>
              <span className={styles.liveClockDivider} />
              <Clock size={13} color="#7c3aed" />
              <span className={styles.liveClockTime}>{liveTimeDisplay}</span>
            </div>

            {/* Timeframe Dropdown Selection */}
            <Select
              value={timeframe}
              onChange={(val) => {
                setTimeframe(val);
              }}
              options={TIMEFRAME_OPTIONS}
              minWidth="98px"
              height="36px"
              borderRadius="9999px"
              buttonStyle={{
                border: '1.5px solid #ede8f8',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#1e1b4b',
                padding: '0 0.75rem',
                gap: '0.35rem',
                boxShadow: '0 1px 3px rgba(124, 58, 237, 0.04)',
              }}
              ariaLabel="Select timeframe"
            />

            {/* Real CSV Export Button */}
            <button
              type="button"
              className={styles.exportBtn}
              onClick={handleExportDashboardReport}
              title="Download CSV Sales & Analytics Report"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ─── 1.5 Today's Live Snapshot & Quick Actions Bar ─── */}
        <div className={styles.todayBanner}>
          <div className={styles.todayStatsGroup}>
            <span className={styles.todayBadge}>
              <Zap size={12} /> Today&apos;s Pulse
            </span>

            <div className={styles.todayStatItem}>
              <span className={styles.todayStatLabel}>Today Revenue</span>
              <div className={styles.todayStatValRow}>
                <span className={styles.todayStatVal}>{formatPrice(todaySnapshot.revenue)}</span>
                <span
                  className={
                    todaySnapshot.revenueGrowthPct >= 0
                      ? styles.todayStatDeltaUp
                      : styles.todayStatDeltaDown
                  }
                >
                  {todaySnapshot.revenueGrowthPct >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(todaySnapshot.revenueGrowthPct)}%
                </span>
              </div>
              <span className={styles.todayStatHint}>
                Yesterday: {formatPrice(todaySnapshot.yesterdayRevenue)}
              </span>
            </div>

            <div className={styles.todayStatItem}>
              <span className={styles.todayStatLabel}>Today Orders</span>
              <div className={styles.todayStatValRow}>
                <span className={styles.todayStatVal}>{todaySnapshot.orders}</span>
              </div>
              <span className={styles.todayStatHint}>Yesterday: {todaySnapshot.yesterdayOrders} orders</span>
            </div>

            <div className={styles.todayStatItem}>
              <span className={styles.todayStatLabel}>New Signups</span>
              <div className={styles.todayStatValRow}>
                <span className={styles.todayStatVal}>{todaySnapshot.signups}</span>
              </div>
              <span className={styles.todayStatHint}>
                Last 7 days: {customerRetention.newUsersThisWeek}
              </span>
            </div>
          </div>

          <div className={styles.quickActionsWrap}>
            <Link to={`${ADMIN}/products`} className={styles.quickActionPill}>
              <Plus size={13} /> Add Product
            </Link>
            <Link to={`${ADMIN}/coupons`} className={styles.quickActionPill}>
              <TicketPercent size={13} /> Create Coupon
            </Link>
            <Link to={`${ADMIN}/flash-sales`} className={styles.quickActionPill}>
              <Zap size={13} /> Flash Sales
            </Link>
            <Link to={`${ADMIN}/broadcast`} className={styles.quickActionPill}>
              <Send size={13} /> Broadcast
            </Link>
          </div>
        </div>

        {/* ─── 2. Top 4 Clickable Executive KPI Cards ─── */}
        <div className={styles.kpiGrid}>
          {/* Card 1: Total Revenue + AOV */}
          <Link to={`${ADMIN}/orders`} className={`${styles.kpiCard} ${styles.kpiClickable}`}>
            {sparkline4}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.purple}`}>
                <DollarSign size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Revenue</span>
              <span
                className={`${styles.trendBadge} ${
                  currentData.revenueCard.growthPct >= 0 ? styles.trendUp : styles.trendDown
                }`}
              >
                {currentData.revenueCard.growthPct >= 0 ? '↑' : '↓'} {Math.abs(currentData.revenueCard.growthPct)}%
              </span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalRevenue}</div>
            <div className={styles.kpiSubRow}>
              <span className={styles.kpiMetaPill}>AOV: {formatPrice(avgOrderValue)}</span>
              <span>View Orders →</span>
            </div>
          </Link>

          {/* Card 2: Total Orders */}
          <Link to={`${ADMIN}/orders`} className={`${styles.kpiCard} ${styles.kpiClickable}`}>
            {sparkline1}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.blue}`}>
                <ShoppingCart size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Orders</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalOrders}</div>
            <div className={styles.kpiSubRow}>
              <span>{summary.confirmedOrders || 0} active / completed</span>
              <span>Manage →</span>
            </div>
          </Link>

          {/* Card 3: Users */}
          <Link to={`${ADMIN}/customers`} className={`${styles.kpiCard} ${styles.kpiClickable}`}>
            {sparkline2}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.green}`}>
                <Users size={16} />
              </div>
              <span className={styles.kpiLabel}>Users</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.customers}</div>
            <div className={styles.kpiSubRow}>
              <span className={styles.kpiMetaPill}>Repeat: {customerRetention.repeatRatePct}%</span>
              <span>View Users →</span>
            </div>
          </Link>

          {/* Card 4: Total Products */}
          <Link to={`${ADMIN}/products`} className={`${styles.kpiCard} ${styles.kpiClickable}`}>
            {sparkline3}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.orange}`}>
                <Package size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Products</span>
            </div>
            <div className={styles.kpiVal}>{currentData.kpis.totalProducts}</div>
            <div className={styles.kpiSubRow}>
              <span>{lowOutTotal > 0 ? `${lowOutTotal} need restock` : 'All stock healthy'}</span>
              <span>Catalog →</span>
            </div>
          </Link>
        </div>

        {/* ─── 3. "Action Required" Live Operations Strip ─── */}
        <div className={styles.actionStripGrid}>
          <Link to={`${ADMIN}/orders`} className={styles.actionAlertCard}>
            <div className={styles.actionAlertLeft}>
              <div className={`${styles.actionIconBadge} ${styles.actionAmber}`}>
                <Truck size={18} />
              </div>
              <div className={styles.actionTextWrap}>
                <span className={styles.actionTitle}>Ready to Dispatch</span>
                <span className={styles.actionCount}>{actionAlerts.readyToDispatch || 0}</span>
              </div>
            </div>
            <span className={`${styles.actionStatusTag} ${(actionAlerts.readyToDispatch || 0) > 0 ? styles.tagPending : styles.tagClear}`}>
              {(actionAlerts.readyToDispatch || 0) > 0 ? 'Ship Now →' : 'All Clear'}
            </span>
          </Link>

          <Link to={`${ADMIN}/inventory`} className={styles.actionAlertCard}>
            <div className={styles.actionAlertLeft}>
              <div className={`${styles.actionIconBadge} ${styles.actionRose}`}>
                <AlertTriangle size={18} />
              </div>
              <div className={styles.actionTextWrap}>
                <span className={styles.actionTitle}>Low / Out of Stock</span>
                <span className={styles.actionCount}>{lowOutTotal}</span>
              </div>
            </div>
            <span className={`${styles.actionStatusTag} ${lowOutTotal > 0 ? styles.tagPending : styles.tagClear}`}>
              {lowOutTotal > 0 ? `${actionAlerts.outOfStockCount || 0} Out • Restock` : 'Healthy'}
            </span>
          </Link>

          <Link to={`${ADMIN}/returns`} className={styles.actionAlertCard}>
            <div className={styles.actionAlertLeft}>
              <div className={`${styles.actionIconBadge} ${styles.actionBlue}`}>
                <RotateCcw size={18} />
              </div>
              <div className={styles.actionTextWrap}>
                <span className={styles.actionTitle}>Pending Returns</span>
                <span className={styles.actionCount}>{actionAlerts.pendingReturns || 0}</span>
              </div>
            </div>
            <span className={`${styles.actionStatusTag} ${(actionAlerts.pendingReturns || 0) > 0 ? styles.tagPending : styles.tagClear}`}>
              {(actionAlerts.pendingReturns || 0) > 0 ? 'Review →' : 'None'}
            </span>
          </Link>

          <Link
            to={(actionAlerts.unreadInquiries || 0) > 0 ? `${ADMIN}/inquiries` : `${ADMIN}/reviews`}
            className={styles.actionAlertCard}
          >
            <div className={styles.actionAlertLeft}>
              <div className={`${styles.actionIconBadge} ${styles.actionPurple}`}>
                <MessageSquare size={18} />
              </div>
              <div className={styles.actionTextWrap}>
                <span className={styles.actionTitle}>Inquiries & Reviews</span>
                <span className={styles.actionCount}>{msgReviewTotal}</span>
              </div>
            </div>
            <span className={`${styles.actionStatusTag} ${msgReviewTotal > 0 ? styles.tagPending : styles.tagClear}`}>
              {msgReviewTotal > 0 ? `${actionAlerts.unreadInquiries || 0} Msg • ${actionAlerts.pendingReviews || 0} Rev` : 'Caught Up'}
            </span>
          </Link>
        </div>

        {/* ─── 4. Middle Row: Revenue Wave Chart + Real Orders Donut Breakdown ─ */}
        <div className={styles.middleGrid}>
          {/* Left Column: Total Revenue Spline Wave Chart */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{timeframe} Revenue</h2>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                {summary.timeframeOrders ?? summary.totalOrders ?? 0} orders in period
              </span>
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

          {/* Right Column: Orders Status Donut Chart Breakdown (Real DB Counts) */}
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

        {/* ─── 5. Business Insights Row: Coupons + Abandoned Carts + Payments & Categories ─ */}
        <div className={styles.insightsGrid}>
          {/* Card 1: Coupons & Discounts ROI */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <TicketPercent size={18} color="#7c3aed" />
                <h2 className={styles.cardTitle}>Coupons & Discounts</h2>
              </div>
              <Link to={`${ADMIN}/coupons`} className={styles.viewAllLink}>
                <span>Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.insightStatsRow}>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Active / Scheduled</span>
                <span className={styles.insightMiniVal}>
                  {couponInsights.activeCoupons}{' '}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>
                    (+{couponInsights.scheduledCoupons} sched)
                  </span>
                </span>
                <span className={styles.insightMiniSub}>{couponInsights.totalCoupons} total codes</span>
              </div>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Total Coupon Savings</span>
                <span className={styles.insightMiniVal}>{formatPrice(couponInsights.discountSaved)}</span>
                <span className={styles.insightMiniSub}>{couponInsights.totalRedemptions} redemptions</span>
              </div>
            </div>

            <div className={styles.topCouponHighlight}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Top Performing Coupon</span>
              {couponInsights.topCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.topCouponCode}>{couponInsights.topCoupon.code}</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    {couponInsights.topCoupon.usageCount || 0} uses
                  </span>
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>No coupons yet</span>
              )}
            </div>
          </div>

          {/* Card 2: Abandoned Cart Recovery */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <ShoppingBag size={18} color="#ea580c" />
                <h2 className={styles.cardTitle}>Abandoned Carts</h2>
              </div>
              <Link to={`${ADMIN}/abandoned-carts`} className={styles.viewAllLink}>
                <span>Recover</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.insightStatsRow}>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Carts at Risk</span>
                <span className={styles.insightMiniVal}>{formatPrice(abandonedCartInsights.atRiskValue)}</span>
                <span className={styles.insightMiniSub}>{abandonedCartInsights.activeCount} active bags</span>
              </div>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Won-Back Revenue</span>
                <span className={styles.insightMiniVal}>{formatPrice(abandonedCartInsights.recoveredValue)}</span>
                <span className={styles.insightMiniSub}>{abandonedCartInsights.recoveredCount} recovered</span>
              </div>
            </div>

            <div className={styles.topCouponHighlight}>
              <span style={{ color: '#475569', fontWeight: 600 }}>WhatsApp Recovery Ready</span>
              <Link
                to={`${ADMIN}/abandoned-carts`}
                style={{ fontWeight: 800, color: '#059669', textDecoration: 'none' }}
              >
                Send Alerts →
              </Link>
            </div>
          </div>

          {/* Card 3: Payment Split & Top Category Sales */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <CreditCard size={18} color="#2563eb" />
                <h2 className={styles.cardTitle}>Payments & Categories</h2>
              </div>
              <BarChart3 size={16} color="#94a3b8" />
            </div>

            {/* Online vs COD Payment Split Bar */}
            <div className={styles.paymentSplitBox}>
              <div className={styles.paymentLabelsRow}>
                <span style={{ color: '#7c3aed' }}>
                  Prepaid / Online: {onlinePct}% ({paymentBreakdown.onlineCount})
                </span>
                <span style={{ color: '#d97706' }}>
                  COD: {codPct}% ({paymentBreakdown.codCount})
                </span>
              </div>
              <div className={styles.paymentTrack}>
                <div className={styles.paymentFillOnline} style={{ width: `${onlinePct}%` }} />
              </div>
            </div>

            {/* Top Categories Leaderboard */}
            <div className={styles.catLeaderboard}>
              {categorySales.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '0.75rem 0' }}>
                  No category sales recorded yet
                </div>
              ) : (
                categorySales.slice(0, 4).map((cat) => {
                  const widthPct = Math.max(8, Math.round((cat.revenue / maxCategoryRevenue) * 100));
                  return (
                    <div key={cat.name} className={styles.catRow}>
                      <div className={styles.catRowTop}>
                        <span>{cat.name}</span>
                        <span style={{ color: '#7c3aed' }}>
                          {formatPrice(cat.revenue)} ({cat.units} pcs)
                        </span>
                      </div>
                      <div className={styles.catBarTrack}>
                        <div className={styles.catBarFill} style={{ width: `${widthPct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── 5.5 Operations, Stock Watchlist & Regional Delivery Insights ─── */}
        <div className={styles.insightsGrid}>
          {/* Card 1: Low / Out of Stock Product Watchlist */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <AlertTriangle size={18} color="#dc2626" />
                <h2 className={styles.cardTitle}>Low Stock Watchlist</h2>
              </div>
              <Link to={`${ADMIN}/inventory`} className={styles.viewAllLink}>
                <span>Restock</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {lowStockWatchlist.length === 0 ? (
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#059669',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                All active products are well stocked!
              </div>
            ) : (
              <div className={styles.watchlistContainer}>
                {lowStockWatchlist.map((item) => (
                  <Link
                    key={item._id}
                    to={`${ADMIN}/inventory`}
                    className={styles.watchlistItem}
                  >
                    <div className={styles.watchlistLeft}>
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80'
                        }
                        alt={item.name}
                        className={styles.watchlistThumb}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className={styles.watchlistName}>{item.name}</div>
                        <div className={styles.watchlistSku}>
                          {item.sku ? `SKU: ${item.sku} • ` : ''}Threshold: {item.threshold}
                        </div>
                      </div>
                    </div>
                    <span
                      className={
                        item.quantity <= 0 ? styles.stockBadgeCritical : styles.stockBadgeLow
                      }
                    >
                      {item.quantity <= 0 ? 'Out of Stock' : `${item.quantity} left`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Shiprocket Fulfillment & Cancellations / Return Health */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <Truck size={18} color="#2563eb" />
                <h2 className={styles.cardTitle}>Fulfillment &amp; Health</h2>
              </div>
              <Link to={`${ADMIN}/orders`} className={styles.viewAllLink}>
                <span>Orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.insightStatsRow}>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Awaiting AWB</span>
                <span className={styles.insightMiniVal}>{fulfillmentHealth.awaitingAwb}</span>
                <span className={styles.insightMiniSub}>Ready for Shiprocket</span>
              </div>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>In Transit</span>
                <span className={styles.insightMiniVal}>{fulfillmentHealth.inTransit}</span>
                <span className={styles.insightMiniSub}>Shipped / active</span>
              </div>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Cancellation Rate</span>
                <span className={styles.insightMiniVal}>
                  {fulfillmentHealth.cancellationRatePct}%
                </span>
                <span className={styles.insightMiniSub}>
                  {fulfillmentHealth.cancelledCount} cancelled
                </span>
              </div>
              <div className={styles.insightMiniBox}>
                <span className={styles.insightMiniLabel}>Cancelled &amp; Refunds</span>
                <span className={styles.insightMiniVal}>
                  {formatPrice(
                    (fulfillmentHealth.cancelledValue || 0) +
                      (fulfillmentHealth.refundedValue || 0)
                  )}
                </span>
                <span className={styles.insightMiniSub}>
                  {fulfillmentHealth.returnRequests} return req
                </span>
              </div>
            </div>

            <div className={styles.topCouponHighlight}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Repeat Customer Rate</span>
              <span style={{ fontWeight: 800, color: '#7c3aed' }}>
                {customerRetention.repeatBuyers}/{customerRetention.uniqueBuyers} buyers (
                {customerRetention.repeatRatePct}%)
              </span>
            </div>
          </div>

          {/* Card 3: Top Delivery Cities & Active Offers */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <MapPin size={18} color="#059669" />
                <h2 className={styles.cardTitle}>Top Regions &amp; Offers</h2>
              </div>
              <Link to={`${ADMIN}/discounts`} className={styles.viewAllLink}>
                <span>Offers</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.paymentSplitBox}>
              <div className={styles.paymentLabelsRow}>
                <span style={{ color: '#059669' }}>
                  Tamil Nadu: {tnPct}% ({locationInsights.tnOrders})
                </span>
                <span style={{ color: '#64748b' }}>
                  Rest of India: {totalRegionOrders > 0 ? 100 - tnPct : 0}% (
                  {locationInsights.otherOrders})
                </span>
              </div>
              <div className={styles.paymentTrack} style={{ background: '#e2e8f0' }}>
                <div className={styles.regionBarFillTn} style={{ width: `${tnPct}%` }} />
              </div>
            </div>

            <div className={styles.catLeaderboard}>
              {(locationInsights.topCities || []).length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '0.75rem 0' }}>
                  No city delivery data yet
                </div>
              ) : (
                locationInsights.topCities.slice(0, 4).map((c) => {
                  const widthPct = Math.max(8, Math.round((c.revenue / maxCityRevenue) * 100));
                  return (
                    <div key={`${c.city}-${c.state}`} className={styles.catRow}>
                      <div className={styles.catRowTop}>
                        <span>{c.city}</span>
                        <span style={{ color: '#059669' }}>
                          {formatPrice(c.revenue)} ({c.orders} ord)
                        </span>
                      </div>
                      <div className={styles.catBarTrack}>
                        <div
                          className={styles.catBarFill}
                          style={{
                            width: `${widthPct}%`,
                            background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.topCouponHighlight} style={{ marginTop: '14px' }}>
              <span style={{ color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={13} color="#7c3aed" />
                {activePromotions.discountedProductsCount} sale items • {activePromotions.activeDiscountsCount} deals
              </span>
              <Link
                to={`${ADMIN}/flash-sales`}
                style={{ fontWeight: 800, color: '#7c3aed', textDecoration: 'none' }}
              >
                Flash Sales →
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 6. Bottom Row: Recent Orders & Top Selling Products ─────────── */}
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                      No recent orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    let statusClass = styles.statusDelivered;
                    if (order.status === 'shipped' || order.status === 'out_for_delivery')
                      statusClass = styles.statusShipped;
                    else if (order.status === 'confirmed' || order.status === 'placed')
                      statusClass = styles.statusConfirmed;
                    else if (order.status === 'cancelled') statusClass = styles.statusCancelled;

                    const customerName =
                      order.user?.name ||
                      order.shippingAddress?.fullName ||
                      order.customer?.name ||
                      'Customer';

                    const customerInitials =
                      customerName
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'C';

                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });

                    const orderTotalAmount = order.total ?? order.totalAmount ?? 0;

                    return (
                      <tr key={order._id}>
                        <td>
                          <Link
                            to={`${ADMIN}/orders/${order._id}`}
                            style={{ color: '#7c3aed', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={styles.customerAvatarBadge}>{customerInitials}</span>
                            <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{customerName}</span>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{formatPrice(orderTotalAmount)}</strong>
                        </td>
                        <td>
                          <span className={`${styles.statusPill} ${statusClass}`}>
                            <span className={styles.statusPulseDot} />
                            {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{orderDate}</td>
                      </tr>
                    );
                  })
                )}
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
              {topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                  No top products found
                </div>
              ) : (
                topProducts.map((prod, idx) => (
                  <div key={prod._id || prod.id || idx} className={styles.topProductRow}>
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
                          {prod.category?.name || (typeof prod.category === 'string' ? prod.category : '') || 'General'}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                        {formatPrice(prod.totalRevenue ?? prod.discountPrice ?? prod.price ?? 0)}
                      </div>
                      <span className={styles.topProductSales}>{prod.unitsSold} sold</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── 7. Live Store Activity Timeline ─────────────────────────────── */}
        <div className={`${styles.card} ${styles.activityCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <Activity size={18} color="#7c3aed" />
              <h2 className={styles.cardTitle}>Live Store Activity</h2>
            </div>
            <Link to={`${ADMIN}/notifications`} className={styles.viewAllLink}>
              <span>Activity Feed</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {liveActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              No recent store activity yet
            </div>
          ) : (
            <div className={styles.activityGrid}>
              {liveActivity.map((act) => {
                let iconBg = '#faf5ff';
                let iconColor = '#7c3aed';
                let IconComp = ShoppingBag;
                if (act.type === 'return') {
                  iconBg = '#eff6ff';
                  iconColor = '#2563eb';
                  IconComp = RotateCcw;
                } else if (act.type === 'inquiry') {
                  iconBg = '#fffbeb';
                  iconColor = '#d97706';
                  IconComp = MessageSquare;
                } else if (act.type === 'review') {
                  iconBg = '#ecfdf5';
                  iconColor = '#059669';
                  IconComp = Star;
                }

                return (
                  <Link key={act.id} to={`${ADMIN}${act.link}`} className={styles.activityItem}>
                    <div
                      className={styles.activityIcon}
                      style={{ background: iconBg, color: iconColor }}
                    >
                      <IconComp size={16} />
                    </div>
                    <div className={styles.activityBody}>
                      <div className={styles.activityTitle}>{act.title}</div>
                      <div className={styles.activitySub}>{act.subtitle}</div>
                    </div>
                    <div className={styles.activityRight}>
                      {act.amount > 0 && (
                        <span className={styles.activityAmount}>{formatPrice(act.amount)}</span>
                      )}
                      <span className={styles.activityTime}>
                        {formatActivityRelativeTime(act.timestamp)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


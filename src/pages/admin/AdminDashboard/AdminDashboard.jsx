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
  TrendingUp,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  MOCK_SALES_SUMMARY,
  MOCK_ORDERS,
  MOCK_TOP_PRODUCTS_REPORT,
} from '../../../data/adminMockData';
import styles from './AdminDashboard.module.css';

const ADMIN = '/pickyadmin-softnova2026';

// ─── 1. Left Graph: Total Revenue Premium Spline Chart ───────────────────────
function RevenueWaveChart({ data = [], activeIndex = 3, onSelectIndex }) {
  const svgRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const maxValue = 40000;
  // Grid line Y values: 36k, 30k, 24k, 18k, 12k, 6k, 0
  const gridLines = [36000, 30000, 24000, 18000, 12000, 6000, 0];
  const chartWidth = 540;
  const chartHeight = 220;
  const paddingLeft = 45;
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
                x={paddingLeft - 10}
                y={y + 4}
                fontSize="11"
                fontWeight="500"
                fill="#64748b"
                textAnchor="end"
                className={styles.graphAxisFont}
              >
                {val === 0 ? '0' : `${val / 1000}k`}
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
              {data[activeIndex].ordersCount || '440'} orders
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function: generates true rounded spaced annular donut sector path
function createRoundedDonutSector(cx, cy, rIn, rOut, a0Deg, a1Deg, cornerRadius = 5.5, gapDeg = 4.0) {
  const span = a1Deg - a0Deg;
  const effectiveGap = Math.min(gapDeg, span * 0.25);
  const a0 = (a0Deg + effectiveGap / 2) * (Math.PI / 180);
  const a1 = (a1Deg - effectiveGap / 2) * (Math.PI / 180);
  const angleSpan = a1 - a0;

  if (angleSpan <= 0.01) return '';

  const crOut = Math.min(cornerRadius, (rOut - rIn) / 2.5, (rOut * angleSpan) / 3.5);
  const crIn = Math.min(cornerRadius, (rOut - rIn) / 2.5, (rIn * angleSpan) / 3.5);

  const daOut = crOut / rOut;
  const daIn = crIn / rIn;

  // Outer Arc Start & End
  const pOutStart = { x: cx + rOut * Math.cos(a0 + daOut), y: cy + rOut * Math.sin(a0 + daOut) };
  const pOutEnd = { x: cx + rOut * Math.cos(a1 - daOut), y: cy + rOut * Math.sin(a1 - daOut) };

  // Outer End Corner to Radial End
  const pRadOutEnd = { x: cx + (rOut - crOut) * Math.cos(a1), y: cy + (rOut - crOut) * Math.sin(a1) };
  const pRadInEnd = { x: cx + (rIn + crIn) * Math.cos(a1), y: cy + (rIn + crIn) * Math.sin(a1) };

  // Inner End Corner to Inner Arc
  const pInEnd = { x: cx + rIn * Math.cos(a1 - daIn), y: cy + rIn * Math.sin(a1 - daIn) };
  const pInStart = { x: cx + rIn * Math.cos(a0 + daIn), y: cy + rIn * Math.sin(a0 + daIn) };

  // Inner Start Corner to Radial Start
  const pRadInStart = { x: cx + (rIn + crIn) * Math.cos(a0), y: cy + (rIn + crIn) * Math.sin(a0) };
  const pRadOutStart = { x: cx + (rOut - crOut) * Math.cos(a0), y: cy + (rOut - crOut) * Math.sin(a0) };

  const largeArcOuter = (a1 - a0 - 2 * daOut) > Math.PI ? 1 : 0;
  const largeArcInner = (a1 - a0 - 2 * daIn) > Math.PI ? 1 : 0;

  return [
    `M ${pOutStart.x.toFixed(2)} ${pOutStart.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${largeArcOuter} 1 ${pOutEnd.x.toFixed(2)} ${pOutEnd.y.toFixed(2)}`,
    `A ${crOut} ${crOut} 0 0 1 ${pRadOutEnd.x.toFixed(2)} ${pRadOutEnd.y.toFixed(2)}`,
    `L ${pRadInEnd.x.toFixed(2)} ${pRadInEnd.y.toFixed(2)}`,
    `A ${crIn} ${crIn} 0 0 1 ${pInEnd.x.toFixed(2)} ${pInEnd.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${largeArcInner} 0 ${pInStart.x.toFixed(2)} ${pInStart.y.toFixed(2)}`,
    `A ${crIn} ${crIn} 0 0 1 ${pRadInStart.x.toFixed(2)} ${pRadInStart.y.toFixed(2)}`,
    `L ${pRadOutStart.x.toFixed(2)} ${pRadOutStart.y.toFixed(2)}`,
    `A ${crOut} ${crOut} 0 0 1 ${pOutStart.x.toFixed(2)} ${pOutStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// ─── 2. Right Graph: Orders Overview Segmented Donut Breakdown Chart ─────────
function OrdersDonutChart({ totalOrders = 2343 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const cx = 135;
  const cy = 115;
  const rOut = 98;
  const rIn = 62;
  const rMid = (rOut + rIn) / 2;

  // 4 Status Breakdown Categories (Cancelled, Shipped, Delivered, Confirmed)
  const orderBreakdown = [
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

  // Calculate 100% accurate rounded, spaced annular sectors with radial displacement vectors
  const slices = useMemo(() => {
    let currentAngle = -100.8;

    return orderBreakdown.map((item) => {
      const spanDeg = (item.pct / 100) * 360;
      const a0 = currentAngle;
      const a1 = currentAngle + spanDeg;
      const midAngle = (a0 + a1) / 2;

      const path = createRoundedDonutSector(cx, cy, rIn, rOut, a0, a1, 5.5, 4.0);

      // Percentage label coordinates right in the middle of each sector
      const radMid = (midAngle * Math.PI) / 180;
      const textX = cx + rMid * Math.cos(radMid);
      const textY = cy + rMid * Math.sin(radMid);

      // Radial pop-out vector for hover animation
      const offsetDist = 9;
      const dx = Math.cos(radMid) * offsetDist;
      const dy = Math.sin(radMid) * offsetDist;

      currentAngle += spanDeg;

      return {
        ...item,
        path,
        textX,
        textY,
        dx,
        dy,
      };
    });
  }, [cx, cy, rIn, rOut, rMid]);

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
          {/* Rounded, Spaced Donut Slices with Radial Hover Pop-out */}
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
                  transform: isHovered
                    ? `translate(${slice.dx.toFixed(2)}px, ${slice.dy.toFixed(2)}px)`
                    : 'translate(0px, 0px)',
                  transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
                  opacity: isAnyHovered && !isHovered ? 0.55 : 1,
                }}
              >
                <path
                  d={slice.path}
                  fill={slice.color}
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 8px 18px ${slice.color}85)`
                      : 'drop-shadow(0 2px 5px rgba(0,0,0,0.06))',
                    transition: 'filter 0.25s ease',
                  }}
                />
                {/* Percentage label inside the slice */}
                <text
                  x={slice.textX}
                  y={slice.textY}
                  fill="#ffffff"
                  fontSize="11"
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
  const [summary, setSummary] = useState(null);
  const [activeBarIndex, setActiveBarIndex] = useState(3);
  const [timeframe, setTimeframe] = useState('Week');

  // Fetch live statistics seamlessly falling back to MOCK_SALES_SUMMARY
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminService.getSalesSummary().catch(() => null);
        const data = res?.data || res;
        if (data && data.totalOrders > 0) {
          setSummary(data);
        } else {
          setSummary(MOCK_SALES_SUMMARY);
        }
      } catch (err) {
        setSummary(MOCK_SALES_SUMMARY);
      }
    }
    fetchStats();
  }, []);

  // Performance Data for Revenue Wave Chart (responsive to timeframe)
  const revenueWaveData = useMemo(() => {
    if (timeframe === 'Week') {
      return [
        { day: 'Mon', revenue: 18000, ordersCount: 380, revenueFormatted: '₹18,000', label: 'Aug 31, 2026' },
        { day: 'Tue', revenue: 24000, ordersCount: 410, revenueFormatted: '₹24,000', label: 'Sep 01, 2026' },
        { day: 'Wed', revenue: 12000, ordersCount: 290, revenueFormatted: '₹12,000', label: 'Sep 02, 2026' },
        { day: 'Thu', revenue: 31000, ordersCount: 440, revenueFormatted: '₹31,000', label: 'Sep 03, 2026' },
        { day: 'Fri', revenue: 26000, ordersCount: 390, revenueFormatted: '₹26,000', label: 'Sep 04, 2026' },
        { day: 'Sat', revenue: 36000, ordersCount: 465, revenueFormatted: '₹36,000', label: 'Sep 05, 2026' },
        { day: 'Sun', revenue: 21000, ordersCount: 340, revenueFormatted: '₹21,000', label: 'Sep 06, 2026' },
      ];
    } else if (timeframe === 'Year') {
      return [
        { day: 'Jan', revenue: 22000, ordersCount: 310, revenueFormatted: '₹22,000', label: 'January 2026' },
        { day: 'Mar', revenue: 29000, ordersCount: 420, revenueFormatted: '₹29,000', label: 'March 2026' },
        { day: 'May', revenue: 19000, ordersCount: 280, revenueFormatted: '₹19,000', label: 'May 2026' },
        { day: 'Jul', revenue: 35000, ordersCount: 490, revenueFormatted: '₹35,000', label: 'July 2026' },
        { day: 'Sep', revenue: 31000, ordersCount: 440, revenueFormatted: '₹31,000', label: 'September 2026' },
        { day: 'Nov', revenue: 38000, ordersCount: 520, revenueFormatted: '₹38,000', label: 'November 2026' },
      ];
    }
    // Default 'This Month'
    return [
      { day: 'Wk 1', revenue: 19000, ordersCount: 320, revenueFormatted: '₹19,000', label: 'Sep 01 - 07, 2026' },
      { day: 'Wk 2', revenue: 28000, ordersCount: 430, revenueFormatted: '₹28,000', label: 'Sep 08 - 14, 2026' },
      { day: 'Wk 3', revenue: 31000, ordersCount: 440, revenueFormatted: '₹31,000', label: 'Sep 15 - 21, 2026' },
      { day: 'Wk 4', revenue: 36000, ordersCount: 485, revenueFormatted: '₹36,000', label: 'Sep 22 - 28, 2026' },
    ];
  }, [timeframe]);

  // Keep active index bounded when timeframe data length changes
  useEffect(() => {
    setActiveBarIndex((prev) => Math.min(prev, revenueWaveData.length - 1));
  }, [revenueWaveData]);

  // Recent Orders (First 5 orders)
  const recentOrders = useMemo(() => {
    return MOCK_ORDERS.slice(0, 5);
  }, []);

  // Top Products (Top 5 products)
  const topProducts = useMemo(() => {
    return MOCK_TOP_PRODUCTS_REPORT.slice(0, 5);
  }, []);

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
            {/* Segmented Timeframe Control [ Week | This Month | Year ] */}
            <div className={styles.segmentedControl}>
              {['Week', 'This Month', 'Year'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.segmentedTab} ${timeframe === tab ? styles.segmentedTabActive : ''}`}
                  onClick={() => {
                    setTimeframe(tab);
                    showToast(`Viewing data for ${tab}`, 'info');
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

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
              <span className={`${styles.trendBadge} ${styles.trendUp}`}>
                <TrendingUp size={11} /> +14.2%
              </span>
            </div>
            <div className={styles.kpiVal}>$8,220.64</div>
          </div>

          {/* Card 2: Total Orders */}
          <div className={styles.kpiCard}>
            {sparkline1}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.blue}`}>
                <ShoppingCart size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Orders</span>
              <span className={`${styles.trendBadge} ${styles.trendUp}`}>
                <TrendingUp size={11} /> +8.5%
              </span>
            </div>
            <div className={styles.kpiVal}>2,500</div>
          </div>

          {/* Card 3: Customers */}
          <div className={styles.kpiCard}>
            {sparkline2}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.green}`}>
                <Users size={16} />
              </div>
              <span className={styles.kpiLabel}>Customers</span>
              <span className={`${styles.trendBadge} ${styles.trendUp}`}>
                <TrendingUp size={11} /> +12.1%
              </span>
            </div>
            <div className={styles.kpiVal}>110</div>
          </div>

          {/* Card 4: Total Products */}
          <div className={styles.kpiCard}>
            {sparkline3}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.orange}`}>
                <Package size={16} />
              </div>
              <span className={styles.kpiLabel}>Total Products</span>
              <span className={`${styles.trendBadge} ${styles.trendUp}`}>
                <TrendingUp size={11} /> +5.4%
              </span>
            </div>
            <div className={styles.kpiVal}>72</div>
          </div>
        </div>

        {/* ─── 3. Middle Row: Revenue Wave Chart + Orders Donut Status Breakdown ─ */}
        <div className={styles.middleGrid}>
          {/* Left Column: Total Revenue Spline Wave Chart (Matches Image 2 Design Reference) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Total Revenue</h2>

              <div className={styles.graphHeaderActions}>
                {/* Radio / Pill Selection (Monthly / Weekly matching Image 2) */}
                <div className={styles.radioPillGroup}>
                  <button
                    type="button"
                    className={`${styles.radioPillBtn} ${timeframe === 'This Month' || timeframe === 'Year' ? styles.radioPillActive : ''}`}
                    onClick={() => {
                      setTimeframe('This Month');
                      showToast('Viewing Monthly data', 'info');
                    }}
                  >
                    <span className={styles.radioDot} />
                    <span>Monthly</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.radioPillBtn} ${timeframe === 'Week' ? styles.radioPillActive : ''}`}
                    onClick={() => {
                      setTimeframe('Week');
                      showToast('Viewing Weekly data', 'info');
                    }}
                  >
                    <span className={styles.radioDot} />
                    <span>Weekly</span>
                  </button>
                </div>

                {/* More Options Button (⋮ matching Image 2) */}
                <button
                  className={styles.moreOptionsBtn}
                  onClick={() => showToast('Revenue analysis options', 'info')}
                  title="More Options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Metric Summary Banner (Green Circle Badge + Big Revenue Readout + Growth % matching Image 2) */}
            <div className={styles.revenueBannerRow}>
              <div className={styles.revenueBannerLeft}>
                <div className={styles.greenCircleBadge}>
                  <ArrowUpRight size={20} strokeWidth={2.8} />
                </div>
                <div className={styles.revenueBigAmount}>$ 459,234.08</div>
              </div>

              <div className={styles.revenueBannerRight}>
                <div className={styles.revenueGrowthPct}>+0.6%</div>
                <div className={styles.revenueGrowthSub}>Than Last week</div>
              </div>
            </div>

            {/* Interactive Revenue Spline Wave Chart */}
            <RevenueWaveChart
              data={revenueWaveData}
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
            </div>

            {/* Modern Segmented Donut Chart */}
            <OrdersDonutChart totalOrders={2343} />
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
                    <span className={`${styles.topRankNum} ${idx === 0 ? styles.topRankFirst : ''}`}>
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


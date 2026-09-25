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

// ─── 1. Left Graph: Revenue Overview Glowing Spline Wave Chart ───────────────
function RevenueWaveChart({ data = [], activeIndex = 3, onSelectIndex }) {
  const maxValue = 40000;
  const gridLines = [40000, 30000, 20000, 10000, 5000, 0];
  const chartWidth = 540;
  const chartHeight = 220;
  const paddingLeft = 60;
  const paddingRight = 35;
  const chartTop = 25;
  const chartBottom = 175;

  // Calculate points coordinates
  const points = useMemo(() => {
    if (!data.length) return [];
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const stepX = usableWidth / (data.length - 1);

    return data.map((item, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = chartBottom - (item.revenue / maxValue) * (chartBottom - chartTop);
      const yPrev = chartBottom - ((item.revenue * 0.78) / maxValue) * (chartBottom - chartTop);
      return { ...item, idx, x, y, yPrev };
    });
  }, [data, maxValue]);

  // Generate smooth cubic bezier SVG path string
  const { pathLine, pathArea, pathPrev } = useMemo(() => {
    if (points.length < 2) return { pathLine: '', pathArea: '', pathPrev: '' };

    const getBezierPath = (pts, keyY = 'y') => {
      let d = `M ${pts[0].x},${pts[0][keyY]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 5;
        const cp1y = p1[keyY] + (p2[keyY] - p0[keyY]) / 5;
        const cp2x = p2.x - (p3.x - p1.x) / 5;
        const cp2y = p2[keyY] - (p3[keyY] - p1[keyY]) / 5;

        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2[keyY]}`;
      }
      return d;
    };

    const lineD = getBezierPath(points, 'y');
    const prevD = getBezierPath(points, 'yPrev');
    const areaD = `${lineD} L ${points[points.length - 1].x},${chartBottom} L ${points[0].x},${chartBottom} Z`;

    return { pathLine: lineD, pathArea: areaD, pathPrev: prevD };
  }, [points, chartBottom]);

  // Tooltip position
  const activePt = points[activeIndex] || points[0];
  const tooltipLeftPercent = activePt ? (activePt.x / chartWidth) * 100 : 50;

  return (
    <div className={styles.chartContainer}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Picky Purple Wave Gradient Area */}
          <linearGradient id="purpleRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>

          {/* Stroke Glow Filter */}
          <filter id="glowRevenue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#7c3aed" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Horizontal Dashed Grid Lines & Y-Axis Labels */}
        {gridLines.map((val) => {
          const y = chartBottom - (val / maxValue) * (chartBottom - chartTop);
          return (
            <g key={val}>
              <line
                x1={paddingLeft - 5}
                y1={y}
                x2={chartWidth - paddingRight + 15}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 15}
                y={y + 4}
                fontSize="11"
                fontWeight="600"
                fill="#94a3b8"
                textAnchor="end"
              >
                {val >= 1000 ? `₹${val / 1000}k` : `₹${val}`}
              </text>
            </g>
          );
        })}

        {/* Previous Period Wave (Dashed reference line) */}
        {pathPrev && (
          <path
            d={pathPrev}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}

        {/* Area Gradient Fill */}
        {pathArea && <path d={pathArea} fill="url(#purpleRevGrad)" />}

        {/* Primary Glowing Spline Wave Curve */}
        {pathLine && (
          <path
            d={pathLine}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3.8"
            strokeLinecap="round"
            filter="url(#glowRevenue)"
          />
        )}

        {/* Active Day Vertical Scanning Beam Line */}
        {activePt && (
          <line
            x1={activePt.x}
            y1={chartTop}
            x2={activePt.x}
            y2={chartBottom}
            stroke="#7c3aed"
            strokeWidth="2"
            strokeDasharray="3 3"
            style={{ opacity: 0.7 }}
          />
        )}

        {/* Data Points on Curve & Interactive Nodes */}
        {points.map((pt, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <g
              key={idx}
              onClick={() => onSelectIndex(idx)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible Hitbox for Easy Clicking */}
              <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

              {/* Pulsing Concentric Outer Ring for Active Node */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                  opacity="0.4"
                />
              )}

              {/* Vertex Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 6 : 4}
                fill={isSelected ? '#7c3aed' : '#ffffff'}
                stroke="#7c3aed"
                strokeWidth={isSelected ? 3 : 2.5}
                style={{
                  transition: 'all 0.25s ease',
                  filter: isSelected
                    ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.8))'
                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                }}
              />

              {/* X-Axis Day Labels */}
              <text
                x={pt.x}
                y={202}
                fontSize="12"
                fontWeight={isSelected ? '800' : '600'}
                fill={isSelected ? '#7c3aed' : '#64748b'}
                textAnchor="middle"
              >
                {pt.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Dynamic Tooltip over selected node */}
      {data[activeIndex] && (
        <div
          className={styles.floatingTooltip}
          style={{ left: `${tooltipLeftPercent}%` }}
        >
          <div className={styles.tooltipTitle}>
            <span>{data[activeIndex].label || 'August 2026'}</span>
            <Sparkles size={12} color="#7c3aed" />
          </div>
          <div className={styles.tooltipRow}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.tooltipDot} style={{ background: '#7c3aed' }} />
              Revenue
            </span>
            <strong style={{ color: '#7c3aed', fontWeight: 800 }}>
              {data[activeIndex].revenueFormatted || '₹31,000'}
            </strong>
          </div>
          <div className={styles.tooltipRow}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span className={styles.tooltipDot} style={{ background: '#94a3b8' }} />
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
  const cy = 120;
  const rOut = 100;
  const rIn = 60;
  const rMid = (rOut + rIn) / 2;

  // 4 Status Breakdown Categories (Cancelled, Shipped, Delivered, Confirmed)
  // Ordered so Cancelled (6%) is perfectly centered at the top (-90°)
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
      color: '#5c67f5', // Blue / Violet
    },
    {
      id: 'delivered',
      name: 'Delivered',
      count: 984,
      pct: 42.0,
      color: '#00a5f7', // Sky Cyan
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
    // 6% = 21.6 deg. Centering Cancelled at -90 deg -> start at -90 - 10.8 = -100.8 deg
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

      // Radial pop-out vector for hover animation (outward along bisector)
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

  // Legend items in standard order (Shipped, Delivered, Confirmed, Cancelled)
  const legendOrder = ['shipped', 'delivered', 'confirmed', 'cancelled'];
  const legendItems = legendOrder.map((id) => orderBreakdown.find((item) => item.id === id)).filter(Boolean);

  const activeItem = hoveredIndex !== null ? orderBreakdown[hoveredIndex] : null;

  return (
    <div className={styles.donutWrapper}>
      <div className={styles.donutSvgContainer}>
        <svg
          viewBox="0 0 270 240"
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
                {/* Percentage label directly inside the slice */}
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

      {/* Horizontal Legend matching Reference Image 1 */}
      <div className={styles.legendInlineRow}>
        {legendItems.map((item) => {
          const sliceIndex = orderBreakdown.findIndex((b) => b.id === item.id);
          const isHovered = hoveredIndex === sliceIndex;

          return (
            <div
              key={item.id}
              className={styles.legendInlineItem}
              onMouseEnter={() => setHoveredIndex(sliceIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                cursor: 'pointer',
                opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1,
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                className={styles.legendColorDot}
                style={{ background: item.color }}
              />
              <span
                style={{
                  fontWeight: isHovered ? 800 : 700,
                  color: isHovered ? item.color : '#475569',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.name}
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
  const [timeframe, setTimeframe] = useState('This Month');

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

  // Sparkline SVGs for KPI Cards
  const sparkline1 = (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 35 Q 25 30, 45 18 T 100 8 L 100 40 L 0 40 Z" fill="url(#sparkGrad1)" />
      <path d="M0 35 Q 25 30, 45 18 T 100 8" fill="none" stroke="#2563eb" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline2 = (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 30 Q 30 35, 60 15 T 100 5 L 100 40 L 0 40 Z" fill="url(#sparkGrad2)" />
      <path d="M0 30 Q 30 35, 60 15 T 100 5" fill="none" stroke="#10b981" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline3 = (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 15 Q 35 30, 65 25 T 100 32 L 100 40 L 0 40 Z" fill="url(#sparkGrad3)" />
      <path d="M0 15 Q 35 30, 65 25 T 100 32" fill="none" stroke="#f97316" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sparkline4 = (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={styles.kpiSparklineBg}>
      <path d="M0 38 Q 30 25, 55 18 T 100 4 L 100 40 L 0 40 Z" fill="url(#sparkGrad4)" />
      <path d="M0 38 Q 30 25, 55 18 T 100 4" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
      <defs>
        <linearGradient id="sparkGrad4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className={styles.dashboardContainer}>
        {/* ─── 1. Header Overview Row (Matching 2nd Reference Image) ───────── */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Sales Overview</h1>
            <p className={styles.pageSubtitle}>Real-time store performance, growth metrics and analytics</p>
          </div>

          <div className={styles.headerActions}>
            {/* Segmented Timeframe Control [ Week | This Month | Year ] (Exact Match to 2nd Image) */}
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

            {/* Export Button (Exact Match to 2nd Image) */}
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

        {/* ─── 2. Top 4 Clean & Luxury KPI Cards (Total Revenue, Total Orders, Customers, Total Products) ─── */}
        <div className={styles.kpiGrid}>
          {/* Card 1: Total Revenue */}
          <div className={styles.kpiCard}>
            {sparkline4}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.purple}`}>
                <DollarSign size={15} />
              </div>
              <span className={styles.kpiLabel}>Total Revenue</span>
            </div>
            <div className={styles.kpiVal}>$8,220.64</div>
          </div>

          {/* Card 2: Total Orders */}
          <div className={styles.kpiCard}>
            {sparkline1}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.blue}`}>
                <ShoppingCart size={15} />
              </div>
              <span className={styles.kpiLabel}>Total Orders</span>
            </div>
            <div className={styles.kpiVal}>2,500</div>
          </div>

          {/* Card 3: Customers */}
          <div className={styles.kpiCard}>
            {sparkline2}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.green}`}>
                <Users size={15} />
              </div>
              <span className={styles.kpiLabel}>Customers</span>
            </div>
            <div className={styles.kpiVal}>110</div>
          </div>

          {/* Card 4: Total Products */}
          <div className={styles.kpiCard}>
            {sparkline3}
            <div className={styles.kpiHeaderRow}>
              <div className={`${styles.kpiMiniIcon} ${styles.orange}`}>
                <Package size={15} />
              </div>
              <span className={styles.kpiLabel}>Total Products</span>
            </div>
            <div className={styles.kpiVal}>72</div>
          </div>
        </div>

        {/* ─── 3. Middle Row: Revenue Wave Chart + Orders Donut Status Breakdown ─ */}
        <div className={styles.middleGrid}>
          {/* Left Column: Revenue Overview Spline Wave Chart */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Revenue Overview</h2>
              <button className={styles.cardDropdown}>
                <span>This Week</span>
                <ChevronDown size={13} className={styles.pillChevron} />
              </button>
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
              <h2 className={styles.cardTitle}>Orders Overview</h2>
            </div>

            {/* Modern Segmented Donut Chart (Delivered, Shipped, Confirmed, Cancelled) */}
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
                    <span className={styles.topRankNum}>#{idx + 1}</span>
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

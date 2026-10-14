import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Flame,
  Sparkles,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  RotateCcw,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  IndianRupee,
  ShoppingBag,
  Percent,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  Share2,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  X,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useUiStore } from '../../../store/uiStore';
import { useFlashSaleStore } from '../../../store/flashSaleStore';
import { CAMPAIGN_TYPES, CAMPAIGN_STATUS_CONFIG } from '../../../data/flashSaleMockData';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './AdminFlashSales.module.css';

const ADMIN = '/softpicky-sn2026';

const BANNER_PRESETS = [
  {
    name: '🥻 Pongal Silk Mahotsav',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700',
  },
  {
    name: '✨ Madurai Sungudi Summer',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700',
  },
  {
    name: '💎 Heritage Temple Gold',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700',
  },
  {
    name: '⚡ Midnight Flash Blitz',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700',
  },
];

export default function AdminFlashSales() {
  const { showToast } = useUiStore();
  const navigate = useNavigate();
  const {
    campaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    toggleStorefrontSync,
    addProductToCampaign,
    resetToDefault,
  } = useFlashSaleStore();

  // Accordion drawer state
  const [expandedId, setExpandedId] = useState('FS-2026-PONGAL');
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Filters state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ending_soon');

  // Real-time ticking clock for countdown timers
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('flash_hourly');
  const [newTagline, setNewTagline] = useState('');
  const [newDiscountType, setNewDiscountType] = useState('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState(35);
  const [newCouponCode, setNewCouponCode] = useState('FLASH35');
  const [newDurationHours, setNewDurationHours] = useState(24);
  const [newBannerImage, setNewBannerImage] = useState(BANNER_PRESETS[0].url);
  const [newStorefrontSync, setNewStorefrontSync] = useState(true);
  const fileInputRef = useRef(null);

  // Quick Add Product state (inside Card 2)
  const [quickProductTitle, setQuickProductTitle] = useState('');
  const [quickOrigPrice, setQuickOrigPrice] = useState('');
  const [quickFlashPrice, setQuickFlashPrice] = useState('');
  const [quickStock, setQuickStock] = useState('30');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // ─── KPI Calculations ───
  const kpis = useMemo(() => {
    const liveCamps = campaigns.filter((c) => c.status === 'live');
    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.stats?.revenueGenerated || 0), 0);
    const totalAllocated = campaigns.reduce((acc, c) => acc + (c.stats?.totalStockAllocated || 0), 0);
    const totalClaimed = campaigns.reduce((acc, c) => acc + (c.stats?.stockClaimed || 0), 0);
    const totalOrders = campaigns.reduce((acc, c) => acc + (c.stats?.ordersCount || 0), 0);
    const percentCamps = campaigns.filter((c) => c.discountType === 'percentage');
    const avgDiscount = percentCamps.length > 0
      ? Math.round(percentCamps.reduce((acc, c) => acc + (c.discountValue || 0), 0) / percentCamps.length)
      : 42;

    return {
      liveCount: liveCamps.length,
      totalRevenue,
      totalClaimed,
      totalAllocated,
      claimPercentage: totalAllocated > 0 ? ((totalClaimed / totalAllocated) * 100).toFixed(1) : '0',
      totalOrders,
      avgDiscount,
    };
  }, [campaigns]);

  // ─── Filter & Search Logic ───
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        // Tab filtering
        if (activeTab === 'live' && c.status !== 'live') return false;
        if (activeTab === 'scheduled' && c.status !== 'scheduled') return false;
        if (activeTab === 'draft' && c.status !== 'draft') return false;
        if (activeTab === 'ended' && c.status !== 'ended') return false;

        // Type filtering
        if (selectedTypeFilter !== 'all' && c.type !== selectedTypeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchCoupon = c.couponCode?.toLowerCase().includes(q);
          const matchTagline = c.tagline?.toLowerCase().includes(q);
          const matchId = c.id.toLowerCase().includes(q);
          if (!matchName && !matchCoupon && !matchTagline && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ending_soon') {
          return new Date(a.endDate) - new Date(b.endDate);
        }
        if (sortBy === 'highest_revenue') {
          return (b.stats?.revenueGenerated || 0) - (a.stats?.revenueGenerated || 0);
        }
        if (sortBy === 'most_claimed') {
          return (b.stats?.claimRate || 0) - (a.stats?.claimRate || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.startDate) - new Date(a.startDate);
        }
        return 0;
      });
  }, [campaigns, activeTab, selectedTypeFilter, searchQuery, sortBy]);

  // Format countdown string
  const getCountdown = (endDate) => {
    const diff = new Date(endDate).getTime() - now;
    if (diff <= 0) return { expired: true, text: 'Ended' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0) {
      return {
        expired: false,
        days,
        hours: remHours,
        minutes,
        seconds,
        text: `${days}d ${remHours}h ${minutes}m left`,
      };
    }

    return {
      expired: false,
      hours,
      minutes,
      seconds,
      text: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`,
    };
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setNewBannerImage(loadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Launch New Campaign
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Please enter a campaign name!', 'error');
      return;
    }

    const start = new Date();
    const end = new Date(start.getTime() + Number(newDurationHours) * 3600 * 1000);

    const created = createCampaign({
      name: newName.trim(),
      type: newType,
      status: 'live',
      tagline: newTagline.trim() || 'Exclusive Festive Handloom Offer',
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue) || 30,
      couponCode: newCouponCode.trim().toUpperCase() || 'FLASHDEAL',
      bannerImage: newBannerImage,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isStorefrontSynced: newStorefrontSync,
      totalStockAllocated: 120,
    });

    setIsComposerOpen(false);
    setNewName('');
    setNewTagline('');
    setExpandedId(created.id);
    showToast(
      `⚡ Flash Sale "${created.name}" launched and synced to Picky Storefront!`,
      'success'
    );
  };

  // Add quick product to expanded campaign
  const handleQuickAddProduct = (campaignId) => {
    if (!quickProductTitle.trim() || !quickFlashPrice) {
      showToast('Please provide product title and flash deal price!', 'error');
      return;
    }

    addProductToCampaign(campaignId, {
      title: quickProductTitle.trim(),
      originalPrice: Number(quickOrigPrice) || Number(quickFlashPrice) * 1.5,
      flashPrice: Number(quickFlashPrice),
      stockTotal: Number(quickStock) || 25,
      badge: 'NEW DEAL',
    });

    setQuickProductTitle('');
    setQuickOrigPrice('');
    setQuickFlashPrice('');
    setIsAddingProduct(false);
    showToast('Product added to this flash sale portfolio!', 'success');
  };

  return (
    <AdminLayout title="Flash Sales & Festival Campaigns">
      {/* ─── Hero Header & Status Banner ─── */}
      <div className={styles.heroSection}>
        <div className={styles.heroLeft}>
          <div className={styles.breadcrumb}>
            <Link to={ADMIN}>Overview</Link>
            <span>/</span>
            <span>Customers & Offers</span>
            <span>/</span>
            <span className={styles.activeCrumb}>Flash Sales & Festivals</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Flash Sales & Festival Campaigns</h1>
            <div className={styles.liveBannerBadge} title="Automated countdown & deal syncing active on storefront">
              <span className={styles.pulsingFlame} />
              <span>⚡ Storefront Deals Live Synced</span>
            </div>
          </div>
          <p className={styles.pageSubtitle}>
            Create urgent countdown flash deals, festival saree megasales (Pongal, Aadi, Diwali), and broadcast limited-time price drops directly to Picky storefront visitors.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.btnCreateCampaign}
            onClick={() => setIsComposerOpen(true)}
          >
            <Plus size={16} />
            <span>+ Create Flash Campaign</span>
          </button>

          <button
            type="button"
            className={styles.btnResetDemo}
            onClick={() => {
              resetToDefault();
              showToast('Demo flash sales refreshed!', 'info');
            }}
            title="Reset demo campaigns"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ─── 1. Five Top Metric KPI Cards ─── */}
      <div className={styles.kpisGrid}>
        {/* KPI 1: Live Flash Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Flash Sales Revenue</span>
            <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#059669' }}>
            {formatPrice(kpis.totalRevenue)}
          </div>
          <div className={styles.kpiMeta}>
            <span>Across all campaigns</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>+34.2% Lift</span>
          </div>
        </div>

        {/* KPI 2: Units Claimed / Sold */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Units Claimed</span>
            <div className={styles.kpiIconBox} style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#7c3aed' }}>
            {kpis.totalClaimed} / {kpis.totalAllocated}
          </div>
          <div className={styles.kpiMeta}>
            <span>Claim Rate: {kpis.claimPercentage}%</span>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>High Velocity</span>
          </div>
        </div>

        {/* KPI 3: Live Campaigns Active */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Active Live Deals</span>
            <div className={styles.kpiIconBox} style={{ background: '#fef2f2', color: '#dc2626' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#dc2626' }}>
            {kpis.liveCount} Deals
          </div>
          <div className={styles.kpiMeta}>
            <span>Ticking on Storefront</span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>Live Urgency</span>
          </div>
        </div>

        {/* KPI 4: Orders Driven */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Orders Driven</span>
            <div className={styles.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#2563eb' }}>
            {kpis.totalOrders} Orders
          </div>
          <div className={styles.kpiMeta}>
            <span>Instant checkout velocity</span>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>3.4x Faster</span>
          </div>
        </div>

        {/* KPI 5: Avg Discount */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Average Discount</span>
            <div className={styles.kpiIconBox} style={{ background: '#fff7ed', color: '#ea580c' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#ea580c' }}>
            {kpis.avgDiscount}% OFF
          </div>
          <div className={styles.kpiMeta}>
            <span>High conversion threshold</span>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>Optimal</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Filter Tabs Bar ─── */}
      <div className={styles.tabsBar}>
        {[
          { key: 'all', label: 'All Campaigns', count: campaigns.length, color: '#7c3aed' },
          { key: 'live', label: 'Live Now 🔥', count: campaigns.filter((c) => c.status === 'live').length, color: '#dc2626' },
          { key: 'scheduled', label: 'Scheduled ⏰', count: campaigns.filter((c) => c.status === 'scheduled').length, color: '#2563eb' },
          { key: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length, color: '#64748b' },
          { key: 'ended', label: 'Ended / Archive', count: campaigns.filter((c) => c.status === 'ended').length, color: '#94a3b8' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={isActive ? styles.tabBtnActive : styles.tabBtn}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className={isActive ? styles.tabBadge : styles.tabBadgeInactive}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. Search and Type Filter Toolbar ─── */}
      <div className={styles.searchToolbar}>
        <div className={styles.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search campaign name, coupon code, or collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          <div className={styles.selectWrap}>
            <span>Type:</span>
            <select
              className={styles.customSelect}
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
            >
              <option value="all">All Campaign Types</option>
              {CAMPAIGN_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrap}>
            <span>Sort:</span>
            <select
              className={styles.customSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="ending_soon">Ending Soonest</option>
              <option value="highest_revenue">Highest Revenue</option>
              <option value="most_claimed">Most Claimed %</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. Main Flash Campaigns Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th style={{ width: '24%' }} className={styles.thCell}>CAMPAIGN & EVENT</th>
                <th style={{ width: '20%' }} className={styles.thCell}>COUNTDOWN / TIMELINE</th>
                <th style={{ width: '16%' }} className={styles.thCell}>DISCOUNT & COUPON</th>
                <th style={{ width: '17%' }} className={styles.thCell}>STOCK CLAIM VELOCITY</th>
                <th style={{ width: '11%' }} className={styles.thCell}>REVENUE WON</th>
                <th style={{ width: '12%' }} className={styles.thCellCenter}>STATUS & ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <Flame size={40} color="#cbd5e1" style={{ display: 'block', margin: '0 auto' }} />
                    <div className={styles.emptyStateTitle}>No flash campaigns found</div>
                    <div className={styles.emptyStateSubtitle}>Try clearing filters or create a new flash sale.</div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp, index) => {
                  const statusCfg = CAMPAIGN_STATUS_CONFIG[camp.status] || CAMPAIGN_STATUS_CONFIG.live;
                  const StatusIcon = statusCfg.icon;
                  const isOpen = expandedId === camp.id;
                  const countdown = getCountdown(camp.endDate);
                  const typeCfg = CAMPAIGN_TYPES.find((t) => t.id === camp.type) || CAMPAIGN_TYPES[0];

                  return (
                    <React.Fragment key={camp.id}>
                      <tr
                        className={`${styles.trRow} ${isOpen ? styles.trRowOpen : ''}`}
                        onClick={() => toggleRow(camp.id)}
                        style={{
                          cursor: 'pointer',
                          background: isOpen ? '#faf5ff' : index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderLeft: isOpen ? '3.5px solid #7c3aed' : '3.5px solid transparent',
                          borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* 1. Campaign Name & Event Type */}
                        <td className={styles.tdCell}>
                          <div className={styles.campNameCol}>
                            <div className={styles.campNameText} title={camp.name}>
                              {camp.name}
                            </div>
                            <div className={styles.campMetaRow}>
                              <span
                                className={styles.typeBadge}
                                style={{ color: typeCfg.badgeColor, background: typeCfg.badgeBg }}
                              >
                                {typeCfg.label}
                              </span>
                              <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem' }}>
                                #{camp.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Timeline & Urgent Countdown */}
                        <td className={styles.tdCell}>
                          <div className={styles.timelineCol}>
                            {camp.status === 'live' ? (
                              <div className={styles.countdownBox}>
                                <Flame size={13} color="#dc2626" />
                                <span className={styles.countdownText}>{countdown.text}</span>
                              </div>
                            ) : camp.status === 'scheduled' ? (
                              <div className={styles.scheduledBox}>
                                <Calendar size={13} color="#2563eb" />
                                <span>Starts {new Date(camp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              </div>
                            ) : (
                              <div className={styles.endedBox}>
                                <span>{camp.status.toUpperCase()}</span>
                              </div>
                            )}
                            <span className={styles.dateSub}>
                              {new Date(camp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -{' '}
                              {new Date(camp.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </td>

                        {/* 3. Discount & Coupon */}
                        <td className={styles.tdCell}>
                          <div className={styles.discountCol}>
                            <span className={styles.discountValueText}>
                              {camp.discountType === 'percentage'
                                ? `${camp.discountValue}% FLAT OFF`
                                : `₹${camp.discountValue} FLAT OFF`}
                            </span>
                            {camp.couponCode && (
                              <span className={styles.couponChip}>
                                <Percent size={10} /> {camp.couponCode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Stock Claim Velocity */}
                        <td className={styles.tdCell}>
                          <div className={styles.stockCol}>
                            <div className={styles.stockTextRow}>
                              <span>
                                <strong>{camp.stats.stockClaimed}</strong> / {camp.stats.totalStockAllocated} Sold
                              </span>
                              <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                                {camp.stats.claimRate}%
                              </span>
                            </div>
                            <div className={styles.progressTrack}>
                              <div
                                className={styles.progressBar}
                                style={{
                                  width: `${Math.min(100, camp.stats.claimRate)}%`,
                                  background: camp.stats.claimRate > 70 ? '#dc2626' : '#7c3aed',
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 5. Revenue Won */}
                        <td className={styles.tdCell}>
                          <div className={styles.revenueCol}>
                            <span className={styles.revenueMainVal}>
                              {formatPrice(camp.stats.revenueGenerated)}
                            </span>
                            <span className={styles.ordersSub}>
                              {camp.stats.ordersCount} Orders
                            </span>
                          </div>
                        </td>

                        {/* 6. Status & Manage Button */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              className={styles.statusBadge}
                              style={{
                                background: statusCfg.bg,
                                color: statusCfg.color,
                                border: `1px solid ${statusCfg.border}`,
                              }}
                            >
                              <StatusIcon size={12} />
                              <span>{statusCfg.label}</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(camp.id);
                              }}
                              className={isOpen ? styles.manageBtnActive : styles.manageBtn}
                              title={isOpen ? 'Close drawer' : 'Inspect Flash Deal Products & Live Timer'}
                            >
                              {isOpen ? <ChevronUp size={12} /> : <ChevronsUpDown size={12} />}
                              <span>{isOpen ? 'Close' : 'Inspect'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ─── Expandable Details Drawer ─── */}
                      {isOpen && (
                        <tr className={styles.expandedRowTr}>
                          <td colSpan={6} className={styles.expandedColTd}>
                            <div className={styles.expandedDrawerWrap}>
                              <div className={styles.expandedGrid}>
                                {/* CARD 1: COUNTDOWN & PERFORMANCE */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Flame size={16} color="#dc2626" />
                                      Live Urgency & Velocity
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800 }}>
                                      {camp.status === 'live' ? '⚡ LIVE COUNTDOWN' : 'CAMPAIGN METRICS'}
                                    </span>
                                  </div>

                                  {/* Big Countdown Box */}
                                  {camp.status === 'live' && (
                                    <div className={styles.bigCountdownBox}>
                                      <div className={styles.countdownUnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(countdown.hours || 0).padStart(2, '0')}
                                        </div>
                                        <div className={styles.countdownSub}>HOURS</div>
                                      </div>
                                      <div className={styles.countdownColon}>:</div>
                                      <div className={styles.countdownUnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(countdown.minutes || 0).padStart(2, '0')}
                                        </div>
                                        <div className={styles.countdownSub}>MINS</div>
                                      </div>
                                      <div className={styles.countdownColon}>:</div>
                                      <div className={styles.countdownUnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(countdown.seconds || 0).padStart(2, '0')}
                                        </div>
                                        <div className={styles.countdownSub}>SECS</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Sales Performance Stats */}
                                  <div className={styles.statsSummaryBox}>
                                    <div className={styles.statRow}>
                                      <span>Direct Flash Revenue</span>
                                      <span style={{ color: '#059669', fontWeight: 800 }}>
                                        {formatPrice(camp.stats.revenueGenerated)}
                                      </span>
                                    </div>
                                    <div className={styles.statRow}>
                                      <span>Flash Orders Completed</span>
                                      <span style={{ fontWeight: 700 }}>{camp.stats.ordersCount} Orders</span>
                                    </div>
                                    <div className={styles.statRow}>
                                      <span>Storefront Visitors Viewed</span>
                                      <span style={{ fontWeight: 700 }}>{camp.stats.viewCount.toLocaleString()} Shoppers</span>
                                    </div>
                                    <div className={styles.statRow}>
                                      <span>Avg Order Value (AOV)</span>
                                      <span style={{ fontWeight: 700 }}>
                                        {camp.stats.ordersCount > 0
                                          ? formatPrice(Math.round(camp.stats.revenueGenerated / camp.stats.ordersCount))
                                          : '₹0'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Status Toggle Action */}
                                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '0.75rem' }}>
                                    {camp.status === 'live' ? (
                                      <button
                                        type="button"
                                        className={styles.btnEndCampaign}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCampaignStatus(camp.id, 'ended');
                                          showToast(`Campaign "${camp.name}" ended.`, 'info');
                                        }}
                                      >
                                        End Deal Now
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        className={styles.btnActivateCampaign}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleCampaignStatus(camp.id, 'live');
                                          showToast(`Campaign "${camp.name}" is now LIVE!`, 'success');
                                        }}
                                      >
                                        <Flame size={14} />
                                        Launch & Go Live Now
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* CARD 2: FLASH PRODUCTS CATALOG */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <ShoppingBag size={16} color="#7c3aed" />
                                      Flash Deal Products ({camp.products.length})
                                    </h4>
                                    <button
                                      type="button"
                                      className={styles.btnToggleAddProduct}
                                      onClick={() => setIsAddingProduct(!isAddingProduct)}
                                    >
                                      {isAddingProduct ? 'Cancel' : '+ Add Product'}
                                    </button>
                                  </div>

                                  {/* Inline Quick Add Product Form */}
                                  {isAddingProduct && (
                                    <div className={styles.quickAddForm}>
                                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7c3aed' }}>
                                        Attach Saree to this Flash Deal:
                                      </div>
                                      <input
                                        type="text"
                                        className={styles.formInputSmall}
                                        placeholder="Saree Title (e.g. Mustard Chettinad Silk)..."
                                        value={quickProductTitle}
                                        onChange={(e) => setQuickProductTitle(e.target.value)}
                                      />
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem' }}>
                                        <input
                                          type="number"
                                          className={styles.formInputSmall}
                                          placeholder="Orig ₹"
                                          value={quickOrigPrice}
                                          onChange={(e) => setQuickOrigPrice(e.target.value)}
                                        />
                                        <input
                                          type="number"
                                          className={styles.formInputSmall}
                                          placeholder="Flash ₹ *"
                                          value={quickFlashPrice}
                                          onChange={(e) => setQuickFlashPrice(e.target.value)}
                                        />
                                        <input
                                          type="number"
                                          className={styles.formInputSmall}
                                          placeholder="Stock (30)"
                                          value={quickStock}
                                          onChange={(e) => setQuickStock(e.target.value)}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className={styles.btnSubmitAddProduct}
                                        onClick={() => handleQuickAddProduct(camp.id)}
                                      >
                                        Add to Flash Sale
                                      </button>
                                    </div>
                                  )}

                                  {/* Products Scrollable List */}
                                  <div className={styles.productsListScroll}>
                                    {camp.products.length === 0 ? (
                                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                                        No products attached yet. Click "+ Add Product" to add sarees to this flash sale.
                                      </div>
                                    ) : (
                                      camp.products.map((p) => {
                                        const pClaimRate = p.stockTotal > 0 ? Math.round((p.stockSold / p.stockTotal) * 100) : 0;
                                        return (
                                          <div key={p.id} className={styles.productRow}>
                                            <img
                                              src={p.image}
                                              alt={p.title}
                                              className={styles.productThumb}
                                              onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                                              }}
                                            />
                                            <div className={styles.productDetails}>
                                              <span className={styles.productTitleText} title={p.title}>
                                                {p.title}
                                              </span>
                                              <div className={styles.priceRow}>
                                                <span className={styles.flashPriceText}>
                                                  {formatPrice(p.flashPrice)}
                                                </span>
                                                <span className={styles.origPriceText}>
                                                  {formatPrice(p.originalPrice)}
                                                </span>
                                                <span className={styles.discountBadgeSmall}>
                                                  {Math.round(((p.originalPrice - p.flashPrice) / p.originalPrice) * 100)}% OFF
                                                </span>
                                              </div>
                                              {/* Mini stock claim progress */}
                                              <div className={styles.pStockRow}>
                                                <span>{p.stockSold}/{p.stockTotal} Claimed</span>
                                                <span style={{ fontWeight: 700 }}>{pClaimRate}%</span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>

                                {/* CARD 3: STOREFRONT HOMEPAGE LIVE PREVIEW */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Eye size={16} color="#059669" />
                                      Storefront Customer Preview
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                      Live on Picky Homepage
                                    </span>
                                  </div>

                                  {/* Storefront Spotlight Banner Preview */}
                                  <div className={styles.storefrontSpotlightCard}>
                                    <img
                                      src={camp.bannerImage}
                                      alt="Flash Deal Banner"
                                      className={styles.spotlightBannerImg}
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700';
                                      }}
                                    />
                                    <div className={styles.spotlightOverlay}>
                                      <div className={styles.spotlightBadge}>
                                        <Flame size={12} /> {camp.name}
                                      </div>
                                      <div className={styles.spotlightTagline}>
                                        {camp.tagline}
                                      </div>
                                      <div className={styles.spotlightTimerBadge}>
                                        <span>⏳ {countdown.text}</span>
                                      </div>
                                      <div className={styles.spotlightCouponPill}>
                                        Use Code: <strong>{camp.couponCode}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions: Sync Storefront & WhatsApp Alert */}
                                  <div className={styles.storefrontSyncActions}>
                                    <button
                                      type="button"
                                      className={camp.isStorefrontSynced ? styles.btnSyncedActive : styles.btnSyncStorefront}
                                      onClick={() => {
                                        toggleStorefrontSync(camp.id);
                                        showToast(
                                          camp.isStorefrontSynced
                                            ? 'Deal unsynced from homepage banner'
                                            : '⚡ Deal synced to Picky Homepage Spotlight!',
                                          'success'
                                        );
                                      }}
                                    >
                                      <Zap size={14} />
                                      <span>
                                        {camp.isStorefrontSynced
                                          ? '✓ Synced on Storefront Banner'
                                          : 'Sync to Storefront Banner'}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      className={styles.btnPushWhatsApp}
                                      onClick={() => {
                                        navigate(`${ADMIN}/broadcast`);
                                        showToast('Opening WhatsApp Broadcast to announce this sale...', 'info');
                                      }}
                                    >
                                      <MessageCircle size={14} />
                                      <span>Announce via WhatsApp Broadcast</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. Compose New Flash Campaign Modal ─── */}
      {isComposerOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsComposerOpen(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Flame size={18} color="#dc2626" />
                <h3 className={styles.modalTitle}>Create New Flash Sale / Festival Event</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsComposerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.composerForm}>
              {/* Campaign Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Campaign / Festival Name *</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g. Pongal Handloom Mahotsav 2026, Midnight Silk Drop"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              {/* Event Type & Tagline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Event Type *</label>
                  <select
                    className={styles.formSelect}
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (Hours) *</label>
                  <select
                    className={styles.formSelect}
                    value={newDurationHours}
                    onChange={(e) => setNewDurationHours(e.target.value)}
                  >
                    <option value={6}>6 Hours (Lightning Blitz)</option>
                    <option value={12}>12 Hours (Half-Day Drop)</option>
                    <option value={24}>24 Hours (Daily Deal)</option>
                    <option value={48}>48 Hours (Weekend Megasale)</option>
                    <option value={120}>5 Days (Festival Mahotsav)</option>
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catchy Announcement Tagline</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Authentic Artisan Weaves with Up to 45% Instant OFF"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                />
              </div>

              {/* Discount & Coupon */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount Value *</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <input
                      type="number"
                      required
                      className={styles.formInput}
                      placeholder="e.g. 35"
                      value={newDiscountValue}
                      onChange={(e) => setNewDiscountValue(e.target.value)}
                    />
                    <select
                      className={styles.formSelect}
                      style={{ width: '90px' }}
                      value={newDiscountType}
                      onChange={(e) => setNewDiscountType(e.target.value)}
                    >
                      <option value="percentage">% OFF</option>
                      <option value="fixed">₹ FLAT</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Promotional Coupon Code</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. PONGAL45, FLASH35"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Banner Image Upload & Presets */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>
                    <ImageIcon size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#dc2626' }} />
                    Campaign Showcase Banner (Image)
                  </label>
                  <button
                    type="button"
                    className={styles.btnUploadImage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    <span>Upload Device Image</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>

                <div className={styles.imagePickerWrap}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Paste Image URL or pick preset below..."
                    value={newBannerImage}
                    onChange={(e) => setNewBannerImage(e.target.value)}
                  />

                  {/* Preset Quick Banner Buttons */}
                  <div className={styles.bannerPresetsRow}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                    {BANNER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={newBannerImage === preset.url ? styles.bannerPresetBtnActive : styles.bannerPresetBtn}
                        onClick={() => setNewBannerImage(preset.url)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Live Banner Preview inside Modal */}
                  {newBannerImage && (
                    <div className={styles.modalBannerPreviewBox}>
                      <div className={styles.modalBannerBadge}>
                        <Sparkles size={11} /> Live Deal Banner Preview
                      </div>
                      <img
                        src={newBannerImage}
                        alt="Flash Sale Banner Preview"
                        className={styles.modalBannerImg}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Storefront Sync Checkbox */}
              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newStorefrontSync}
                    onChange={(e) => setNewStorefrontSync(e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    ⚡ Sync instantly to Picky Storefront Homepage Spotlight Banner
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnModalCancel}
                  onClick={() => setIsComposerOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnModalSubmit}>
                  <Flame size={15} />
                  <span>Launch Flash Campaign Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

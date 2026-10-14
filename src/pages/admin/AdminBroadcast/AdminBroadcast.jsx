import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Percent,
  Sparkles,
  ShoppingBag,
  Truck,
  Heart,
  Crown,
  Zap,
  Search,
  Filter,
  Plus,
  RotateCcw,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  MessageCircle,
  IndianRupee,
  Calendar,
  Eye,
  Check,
  X,
  Phone,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useUiStore } from '../../../store/uiStore';
import { useBroadcastStore } from '../../../store/broadcastStore';
import {
  AUDIENCE_SEGMENTS,
  BROADCAST_TEMPLATES,
  CAMPAIGN_STATUS_CONFIG,
} from '../../../data/broadcastMockData';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './AdminBroadcast.module.css';

const ADMIN = '/softpicky-sn2026';

export default function AdminBroadcast() {
  const { showToast } = useUiStore();
  const {
    campaigns,
    segments,
    templates,
    createCampaign,
    deleteCampaign,
    resendCampaign,
    resetToDefault,
  } = useBroadcastStore();

  // Accordion drawer state
  const [expandedId, setExpandedId] = useState(null);
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Filters state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

const BANNER_PRESETS = [
  {
    name: '🥻 Kanchipuram Silk',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
  },
  {
    name: '✨ Madurai Sungudi',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
  },
  {
    name: '💎 Temple Jewelry',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
  },
  {
    name: '⚡ 48H Express Blitz',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600',
  },
];

  // Modal Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newSegmentId, setNewSegmentId] = useState(segments[0]?.id || 'seg_all');
  const [newTemplateId, setNewTemplateId] = useState(templates[0]?.id || 'tpl_festive_sale');
  const [newCouponCode, setNewCouponCode] = useState('FESTIVE20');
  const [newBannerImage, setNewBannerImage] = useState(
    templates[0]?.headerImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
  );
  const [newScheduleMode, setNewScheduleMode] = useState('now'); // 'now' | 'scheduled'
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [customMessageOverride, setCustomMessageOverride] = useState('');
  const fileInputRef = useRef(null);

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

  // ─── KPI Metrics ───
  const kpis = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter((c) => c.status === 'sent');
    const totalMessagesSent = sentCampaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
    const totalDelivered = sentCampaigns.reduce((acc, c) => acc + (c.stats?.delivered || 0), 0);
    const totalRead = sentCampaigns.reduce((acc, c) => acc + (c.stats?.read || 0), 0);
    const totalRevenue = sentCampaigns.reduce((acc, c) => acc + (c.stats?.revenueGenerated || 0), 0);

    const avgDeliveryRate = totalMessagesSent > 0 ? ((totalDelivered / totalMessagesSent) * 100).toFixed(1) : '98.5';
    const avgReadRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '85.2';

    return {
      totalCampaigns,
      totalMessagesSent,
      totalRevenue,
      avgDeliveryRate,
      avgReadRate,
    };
  }, [campaigns]);

  // ─── Filter & Search Logic ───
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => {
        // Tab filtering
        if (activeTab === 'sent' && c.status !== 'sent') return false;
        if (activeTab === 'scheduled' && c.status !== 'scheduled') return false;
        if (activeTab === 'draft' && c.status !== 'draft') return false;

        // Segment filtering
        if (selectedSegmentFilter !== 'all' && c.targetSegmentId !== selectedSegmentFilter) return false;

        // Search filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchCoupon = c.couponCode?.toLowerCase().includes(q);
          const matchSegment = c.targetSegment?.toLowerCase().includes(q);
          const matchId = c.id.toLowerCase().includes(q);
          if (!matchName && !matchCoupon && !matchSegment && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.sentAt || b.scheduledFor || 0) - new Date(a.sentAt || a.scheduledFor || 0);
        if (sortBy === 'highest_revenue') return (b.stats?.revenueGenerated || 0) - (a.stats?.revenueGenerated || 0);
        if (sortBy === 'most_delivered') return (b.stats?.delivered || 0) - (a.stats?.delivered || 0);
        return 0;
      });
  }, [campaigns, activeTab, selectedSegmentFilter, searchQuery, sortBy]);

  // Handle Launch Campaign from Composer
  const handleLaunchCampaignSubmit = (e) => {
    e.preventDefault();
    if (!newCampaignName.trim()) {
      showToast('Please enter a campaign name!', 'error');
      return;
    }

    const selectedTpl = templates.find((t) => t.id === newTemplateId) || templates[0];

    const campaign = createCampaign({
      name: newCampaignName.trim(),
      status: newScheduleMode === 'scheduled' ? 'scheduled' : 'sent',
      scheduledFor: newScheduleMode === 'scheduled' ? newScheduleDate || new Date().toISOString() : null,
      targetSegmentId: newSegmentId,
      templateId: selectedTpl.id,
      templateTitle: selectedTpl.name,
      couponCode: newCouponCode.trim().toUpperCase(),
      bannerImage: newBannerImage?.trim() || selectedTpl.headerImage,
      customMessage: customMessageOverride.trim() || null,
    });

    setIsComposerOpen(false);
    setNewCampaignName('');
    setCustomMessageOverride('');
    showToast(
      newScheduleMode === 'scheduled'
        ? `Broadcast campaign scheduled successfully!`
        : `🚀 Broadcast dispatched to ${campaign.recipientsCount.toLocaleString()} customers via WhatsApp API!`,
      'success'
    );
  };

  // 1-Click WhatsApp Live Test to Admin Phone
  const handleTestSendAdmin = (campaign, e) => {
    if (e) e.stopPropagation();
    const tpl = templates.find((t) => t.id === campaign.templateId) || templates[0];
    const message = campaign.customMessage || tpl.bodyText('Store Administrator', campaign.couponCode);
    const cleanPhone = '919840123456';
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showToast('Sent test WhatsApp preview to Admin (+91 9840123456)!', 'success');
  };

  // Resend to Unopened Contacts
  const handleResendUnopened = (campaignId, e) => {
    if (e) e.stopPropagation();
    resendCampaign(campaignId);
    showToast('Broadcast reminder dispatched to unopened customer contacts!', 'success');
  };

  return (
    <AdminLayout title="WhatsApp Broadcast & Marketing Center">
      {/* ─── Hero Header & Status Banner ─── */}
      <div className={styles.heroSection}>
        <div className={styles.heroLeft}>
          <div className={styles.breadcrumb}>
            <Link to={ADMIN}>Overview</Link>
            <span>/</span>
            <span>Customers & Offers</span>
            <span>/</span>
            <span className={styles.activeCrumb}>WhatsApp Broadcast</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>WhatsApp Broadcast & Marketing Center</h1>
            <div className={styles.watiLiveBadge} title="Meta Cloud API Connected with 99.8% SLA">
              <span className={styles.pulsingDot} />
              <span>WATI Official API Connected</span>
            </div>
          </div>
          <p className={styles.pageSubtitle}>
            Launch targeted festive announcements, exclusive VIP discount broadcasts, and new handloom arrival drops to customer segments via Meta WhatsApp API.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.btnLaunchCampaign}
            onClick={() => setIsComposerOpen(true)}
          >
            <Plus size={16} />
            <span>+ New Broadcast Campaign</span>
          </button>

          <button
            type="button"
            className={styles.btnResetDemo}
            onClick={() => {
              resetToDefault();
              showToast('Demo broadcast campaigns refreshed!', 'info');
            }}
            title="Reset demo campaigns"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ─── 1. Five Top Metric KPI Cards ─── */}
      <div className={styles.kpisGrid}>
        {/* KPI 1: Total Messages Sent */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Messages Dispatched</span>
            <div className={styles.kpiIconBox} style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <Send size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.totalMessagesSent.toLocaleString()}</div>
          <div className={styles.kpiMeta}>
            <span>Across all campaigns</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>+24.6% MoM</span>
          </div>
        </div>

        {/* KPI 2: Delivery Rate */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Delivery Rate</span>
            <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#059669' }}>{kpis.avgDeliveryRate}%</div>
          <div className={styles.kpiMeta}>
            <span>Meta verified sender</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>Optimal</span>
          </div>
        </div>

        {/* KPI 3: Avg Read Rate */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Open / Read Rate</span>
            <div className={styles.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Eye size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#2563eb' }}>{kpis.avgReadRate}%</div>
          <div className={styles.kpiMeta}>
            <span>5x higher than Email</span>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>High Impact</span>
          </div>
        </div>

        {/* KPI 4: Broadcast Sales Won */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Revenue Generated</span>
            <div className={styles.kpiIconBox} style={{ background: '#fef3c7', color: '#b45309' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#b45309' }}>
            {formatPrice(kpis.totalRevenue)}
          </div>
          <div className={styles.kpiMeta}>
            <span>Direct WhatsApp sales</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>18.4x ROI</span>
          </div>
        </div>

        {/* KPI 5: Active Campaigns */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total Campaigns</span>
            <div className={styles.kpiIconBox} style={{ background: '#f8fafc', color: '#475569' }}>
              <Radio size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.totalCampaigns}</div>
          <div className={styles.kpiMeta}>
            <span>Active & scheduled</span>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>Meta Cloud</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Filter Tabs Bar ─── */}
      <div className={styles.tabsBar}>
        {[
          { key: 'all', label: 'All Campaigns', count: campaigns.length, color: '#7c3aed' },
          { key: 'sent', label: 'Sent & Completed', count: campaigns.filter((c) => c.status === 'sent').length, color: '#059669' },
          { key: 'scheduled', label: 'Scheduled', count: campaigns.filter((c) => c.status === 'scheduled').length, color: '#2563eb' },
          { key: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length, color: '#64748b' },
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

      {/* ─── 3. Search and Segment Toolbar ─── */}
      <div className={styles.searchToolbar}>
        <div className={styles.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search campaign name, coupon code, or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          <div className={styles.selectWrap}>
            <span>Audience:</span>
            <select
              className={styles.customSelect}
              value={selectedSegmentFilter}
              onChange={(e) => setSelectedSegmentFilter(e.target.value)}
            >
              <option value="all">All Segments</option>
              {segments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.count})
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
              <option value="newest">Newest First</option>
              <option value="highest_revenue">Highest Revenue Won</option>
              <option value="most_delivered">Most Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. Main Campaign Data Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th style={{ width: '25%' }} className={styles.thCell}>CAMPAIGN / DATE</th>
                <th style={{ width: '18%' }} className={styles.thCell}>AUDIENCE SEGMENT</th>
                <th style={{ width: '16%' }} className={styles.thCell}>TEMPLATE & OFFER</th>
                <th style={{ width: '18%' }} className={styles.thCell}>PERFORMANCE (DEL / READ / CTR)</th>
                <th style={{ width: '11%' }} className={styles.thCell}>REVENUE WON</th>
                <th style={{ width: '12%' }} className={styles.thCellCenter}>STATUS & ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <Radio size={40} color="#cbd5e1" style={{ display: 'block', margin: '0 auto' }} />
                    <div className={styles.emptyStateTitle}>No broadcast campaigns found</div>
                    <div className={styles.emptyStateSubtitle}>Try clearing search or launching a new campaign.</div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp, index) => {
                  const statusCfg = CAMPAIGN_STATUS_CONFIG[camp.status] || CAMPAIGN_STATUS_CONFIG.sent;
                  const StatusIcon = statusCfg.icon;
                  const isOpen = expandedId === camp.id;

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
                        {/* 1. Campaign Name & Sent Date */}
                        <td className={styles.tdCell}>
                          <div className={styles.campNameCol}>
                            <div className={styles.campNameText} title={camp.name}>
                              {camp.name}
                            </div>
                            <div className={styles.campIdTime}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                                #{camp.id}
                              </span>
                              <span>•</span>
                              <span>
                                {camp.sentAt
                                  ? new Date(camp.sentAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : camp.scheduledFor
                                  ? `Scheduled for ${new Date(camp.scheduledFor).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}`
                                  : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Target Audience Segment */}
                        <td className={styles.tdCell}>
                          <div className={styles.segmentCol}>
                            <span className={styles.segmentNameText} title={camp.targetSegment}>
                              {camp.targetSegment}
                            </span>
                            <span className={styles.recipientBadge}>
                              <Users size={11} /> {camp.recipientsCount.toLocaleString()} Contacts
                            </span>
                          </div>
                        </td>

                        {/* 3. Template & Offer Coupon */}
                        <td className={styles.tdCell}>
                          <div className={styles.templateCol}>
                            <span className={styles.templateTitleText} title={camp.templateTitle}>
                              {camp.templateTitle}
                            </span>
                            {camp.couponCode && (
                              <span className={styles.couponChip}>
                                <Percent size={10} /> {camp.couponCode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. Performance Metrics */}
                        <td className={styles.tdCell}>
                          {camp.status === 'sent' ? (
                            <div className={styles.metricsCol}>
                              <div className={styles.metricRow}>
                                <span className={styles.metricDeliveredPill}>
                                  ✓ {camp.stats.deliveryRate}% Del
                                </span>
                                <span className={styles.metricReadPill}>
                                  👁 {camp.stats.readRate}% Read
                                </span>
                              </div>
                              <div className={styles.metricSub}>
                                CTR: <strong>{camp.stats.clickRate}%</strong> ({camp.stats.clicked} clicks)
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Queue awaiting dispatch
                            </span>
                          )}
                        </td>

                        {/* 5. Revenue Won */}
                        <td className={styles.tdCell}>
                          <div className={styles.revenueCol}>
                            <span className={styles.revenueMainVal}>
                              {camp.stats?.revenueGenerated ? formatPrice(camp.stats.revenueGenerated) : '₹0'}
                            </span>
                            <span className={styles.conversionSub}>
                              {camp.stats?.conversions ? `${camp.stats.conversions} Orders` : '0 Orders'}
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
                              title={isOpen ? 'Close drawer' : 'View Campaign Analytics & WhatsApp Bubble'}
                            >
                              {isOpen ? <ChevronUp size={12} /> : <ChevronsUpDown size={12} />}
                              <span>{isOpen ? 'Close' : 'Inspect'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expandable Details Drawer ── */}
                      {isOpen && (
                        <tr className={styles.expandedRowTr}>
                          <td colSpan={6} className={styles.expandedColTd}>
                            <div className={styles.expandedDrawerWrap}>
                              <div className={styles.expandedGrid}>
                                {/* CARD 1: CONVERSION FUNNEL & REVENUE */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <BarChart2 size={16} color="#7c3aed" />
                                      Funnel Analytics & ROI
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                      Live Campaign Metrics
                                    </span>
                                  </div>

                                  <div className={styles.funnelBarsWrap}>
                                    {/* Sent Bar */}
                                    <div className={styles.funnelStep}>
                                      <div className={styles.funnelStepLabel}>
                                        <span>Dispatched</span>
                                        <span>{camp.stats.sent}</span>
                                      </div>
                                      <div className={styles.progressTrack}>
                                        <div className={styles.progressBar} style={{ width: '100%', background: '#7c3aed' }} />
                                      </div>
                                    </div>

                                    {/* Delivered Bar */}
                                    <div className={styles.funnelStep}>
                                      <div className={styles.funnelStepLabel}>
                                        <span>Delivered</span>
                                        <span>{camp.stats.delivered} ({camp.stats.deliveryRate}%)</span>
                                      </div>
                                      <div className={styles.progressTrack}>
                                        <div className={styles.progressBar} style={{ width: `${camp.stats.deliveryRate}%`, background: '#2563eb' }} />
                                      </div>
                                    </div>

                                    {/* Read Bar */}
                                    <div className={styles.funnelStep}>
                                      <div className={styles.funnelStepLabel}>
                                        <span>Read / Opened</span>
                                        <span>{camp.stats.read} ({camp.stats.readRate}%)</span>
                                      </div>
                                      <div className={styles.progressTrack}>
                                        <div className={styles.progressBar} style={{ width: `${camp.stats.readRate}%`, background: '#059669' }} />
                                      </div>
                                    </div>

                                    {/* Clicked Bar */}
                                    <div className={styles.funnelStep}>
                                      <div className={styles.funnelStepLabel}>
                                        <span>Clicked Store Link</span>
                                        <span>{camp.stats.clicked} ({camp.stats.clickRate}%)</span>
                                      </div>
                                      <div className={styles.progressTrack}>
                                        <div className={styles.progressBar} style={{ width: `${camp.stats.clickRate}%`, background: '#f59e0b' }} />
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.roiSummaryBox}>
                                    <div className={styles.roiRow}>
                                      <span>Direct Revenue Won</span>
                                      <span style={{ color: '#059669', fontWeight: 800 }}>
                                        {formatPrice(camp.stats.revenueGenerated)}
                                      </span>
                                    </div>
                                    <div className={styles.roiRow}>
                                      <span>Completed Customer Orders</span>
                                      <span style={{ fontWeight: 700 }}>{camp.stats.conversions} Orders</span>
                                    </div>
                                    <div className={styles.roiRow}>
                                      <span>Avg Order Value (AOV)</span>
                                      <span style={{ fontWeight: 700 }}>
                                        {camp.stats.conversions > 0
                                          ? formatPrice(Math.round(camp.stats.revenueGenerated / camp.stats.conversions))
                                          : '₹0'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CARD 2: AUDIENCE SEGMENT BREAKDOWN & RECIPIENTS */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Users size={16} color="#7c3aed" />
                                      Audience & Delivery Audit Log
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                                      {camp.recipientsCount} Contacts
                                    </span>
                                  </div>

                                  <div className={styles.segmentSummaryBanner}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>
                                      {camp.targetSegment}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                      Meta WhatsApp Business API verified audience partition
                                    </div>
                                  </div>

                                  <div className={styles.recipientsLogWrap}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                                      Sample Delivery Feed
                                    </div>
                                    {camp.sampleRecipients && camp.sampleRecipients.length > 0 ? (
                                      <div className={styles.recipientsList}>
                                        {camp.sampleRecipients.map((rec, rIdx) => (
                                          <div key={rIdx} className={styles.recipientRow}>
                                            <div className={styles.recipInfo}>
                                              <span className={styles.recipName}>{rec.name}</span>
                                              <span className={styles.recipCity}>{rec.city} • {rec.phone}</span>
                                            </div>
                                            <div className={styles.recipMeta}>
                                              <span
                                                className={
                                                  rec.status === 'Converted'
                                                    ? styles.recipConvertedBadge
                                                    : rec.status === 'Read'
                                                    ? styles.recipReadBadge
                                                    : styles.recipDeliveredBadge
                                                }
                                              >
                                                {rec.status}
                                              </span>
                                              <span className={styles.recipTime}>{rec.deliveredAt}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                                        No delivery records in queue for draft.
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* CARD 3: WHATSAPP CHAT BUBBLE LIVE PREVIEW */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <MessageCircle size={16} color="#25d366" />
                                      WhatsApp Message Preview
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                      Meta Official Template
                                    </span>
                                  </div>

                                  {/* WhatsApp Bubble Preview Card */}
                                  <div className={styles.whatsappBubble}>
                                    {camp.bannerImage && (
                                      <img
                                        src={camp.bannerImage}
                                        alt="Campaign Banner"
                                        className={styles.bubbleHeaderImg}
                                        onError={(e) => {
                                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';
                                        }}
                                      />
                                    )}
                                    <div className={styles.bubbleContent}>
                                      <div className={styles.bubbleBodyText}>
                                        {(() => {
                                          const tpl = templates.find((t) => t.id === camp.templateId) || templates[0];
                                          return camp.customMessage || tpl.bodyText('Kavitha', camp.couponCode);
                                        })()}
                                      </div>
                                      <div className={styles.bubbleTimeRow}>
                                        <span>10:32 AM</span>
                                        <span style={{ color: '#53bdeb' }}>✓✓</span>
                                      </div>
                                    </div>

                                    {/* Action CTA Buttons */}
                                    <div className={styles.bubbleActions}>
                                      <div className={styles.bubbleActionBtn}>
                                        <ShoppingBag size={12} color="#00a884" />
                                        <span>Shop Festive Sale 🛍️</span>
                                      </div>
                                      <div className={styles.bubbleActionBtn}>
                                        <MessageCircle size={12} color="#00a884" />
                                        <span>Chat with Store Stylist 💬</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Dispatch Buttons */}
                                  <div className={styles.broadcastActionButtons}>
                                    <button
                                      type="button"
                                      className={styles.btnTestSendWhatsApp}
                                      onClick={(e) => handleTestSendAdmin(camp, e)}
                                      title="Open real WhatsApp with this campaign message"
                                    >
                                      <MessageCircle size={14} />
                                      <span>Send Test Preview to My WhatsApp</span>
                                    </button>

                                    {camp.status === 'sent' && (
                                      <button
                                        type="button"
                                        className={styles.btnResendUnopened}
                                        onClick={(e) => handleResendUnopened(camp.id, e)}
                                        title="Send an automated follow-up to unopened contacts"
                                      >
                                        <Send size={13} />
                                        <span>Resend to Unopened Contacts ({Math.max(0, camp.stats.delivered - camp.stats.read)})</span>
                                      </button>
                                    )}
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

      {/* ─── 5. Compose New Broadcast Campaign Modal ─── */}
      {isComposerOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsComposerOpen(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Send size={18} color="#7c3aed" />
                <h3 className={styles.modalTitle}>Compose New WhatsApp Broadcast</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsComposerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLaunchCampaignSubmit} className={styles.composerForm}>
              {/* Field 1: Campaign Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Campaign Name *</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g. Tamil New Year Handloom Carnival 2026"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
              </div>

              {/* Field 2: Audience Segment */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Target Audience Segment *</label>
                <div className={styles.segmentPickerGrid}>
                  {segments.map((seg) => {
                    const isPicked = newSegmentId === seg.id;
                    return (
                      <div
                        key={seg.id}
                        className={isPicked ? styles.segmentCardActive : styles.segmentCard}
                        onClick={() => setNewSegmentId(seg.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isPicked ? '#7c3aed' : '#0f172a' }}>
                            {seg.name}
                          </span>
                          <span className={styles.segContactCount}>{seg.count.toLocaleString()} Contacts</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '4px 0 0' }}>
                          {seg.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Template Selector */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meta Approved Template *</label>
                <select
                  className={styles.formSelect}
                  value={newTemplateId}
                  onChange={(e) => {
                    setNewTemplateId(e.target.value);
                    const tpl = templates.find((t) => t.id === e.target.value);
                    if (tpl?.couponCode) setNewCouponCode(tpl.couponCode);
                    if (tpl?.headerImage) setNewBannerImage(tpl.headerImage);
                  }}
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3b: WhatsApp Header Media Banner (Image) */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>
                    <ImageIcon size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#7c3aed' }} />
                    WhatsApp Header Media Banner (Image)
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
                        <Sparkles size={11} /> WhatsApp Header Live Preview
                      </div>
                      <img
                        src={newBannerImage}
                        alt="WhatsApp Header Banner Preview"
                        className={styles.modalBannerImg}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Field 4: Coupon Code */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Promotional Coupon Code</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. FESTIVE20, PONGALSPECIAL"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                />
              </div>

              {/* Field 5: Direct Custom Message Editor */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Custom WhatsApp Message Text (Optional Override)
                </label>
                <textarea
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Leave blank to use the pre-approved Meta template text, or type custom announcement..."
                  value={customMessageOverride}
                  onChange={(e) => setCustomMessageOverride(e.target.value)}
                />
              </div>

              {/* Field 6: Dispatch Timing */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Schedule Timing</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="schedule"
                      checked={newScheduleMode === 'now'}
                      onChange={() => setNewScheduleMode('now')}
                    />
                    <span>🚀 Launch Immediately (Real-time Broadcast)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="schedule"
                      checked={newScheduleMode === 'scheduled'}
                      onChange={() => setNewScheduleMode('scheduled')}
                    />
                    <span>⏰ Schedule for Future Date</span>
                  </label>
                </div>
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
                  <Send size={15} />
                  <span>
                    {newScheduleMode === 'scheduled' ? 'Schedule Broadcast' : 'Dispatch Broadcast Now'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

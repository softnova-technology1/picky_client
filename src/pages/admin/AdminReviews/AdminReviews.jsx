import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Sparkles,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Reply,
  ChevronUp,
  ChevronsUpDown,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Layers,
  User,
  ArrowUpDown,
  Plus,
  Send,
  MessageSquareOff,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useUiStore } from '../../../store/uiStore';
import { useReviewStore } from '../../../store/reviewStore';
import {
  REVIEW_STATUS_TABS,
  REVIEW_STATUS_CONFIG,
} from '../../../data/reviewsModerationMockData';
import styles from './AdminReviews.module.css';

const ADMIN = '/softpicky-sn2026';

const getCustomerInitials = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminReviews() {
  const { showToast } = useUiStore();
  const {
    reviews,
    kpis: storeKpis,
    loading,
    fetchReviews,
    markReviewsAsViewed,
    approveReview,
    rejectReview,
    flagReview,
    deleteReview,
    toggleFeatured,
    replyToReview,
    deleteReply,
    bulkApprove,
    bulkReject,
    bulkFlag,
    bulkDelete,
  } = useReviewStore();

  useEffect(() => {
    fetchReviews().then(() => {
      markReviewsAsViewed();
    });
  }, [fetchReviews, markReviewsAsViewed]);

  // Expandable row state
  const [expandedId, setExpandedId] = useState(null);
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Filters state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Multi-select state
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);

  // Reply Draft State per Review
  const [replyInputs, setReplyInputs] = useState({});

  // Lightbox photo modal state
  const [lightboxImg, setLightboxImg] = useState(null);

  // ─── KPI Metrics ───
  const kpis = useMemo(() => {
    const total = reviews.length;
    const avgScore = total > 0 ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / total).toFixed(1) : (storeKpis?.avgScore || '5.0');
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const published = reviews.filter((r) => r.status === 'published').length;
    const withPhotos = reviews.filter((r) => r.photos && r.photos.length > 0).length;

    return { total, avgScore, pending, published, withPhotos };
  }, [reviews, storeKpis]);

  // ─── Filter & Search Logic ───
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        // Tab filtering
        if (activeTab === 'pending' && r.status !== 'pending') return false;
        if (activeTab === 'published' && r.status !== 'published') return false;
        if (activeTab === 'flagged' && r.status !== 'flagged') return false;
        if (activeTab === 'photos' && (!r.photos || r.photos.length === 0)) return false;

        // Search filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const customerName = r.customer?.name || '';
          const customerEmail = r.customer?.email || '';
          const productName = r.product?.name || '';
          const comment = r.comment || '';
          const title = r.title || '';
          const matchCustomer = customerName.toLowerCase().includes(q) || customerEmail.toLowerCase().includes(q);
          const matchProduct = productName.toLowerCase().includes(q);
          const matchComment = comment.toLowerCase().includes(q) || title.toLowerCase().includes(q);
          if (!matchCustomer && !matchProduct && !matchComment) return false;
        }

        // Star rating filtering
        if (filterRating !== 'all') {
          if (filterRating === '1-2' && (r.rating > 2)) return false;
          if (filterRating !== '1-2' && String(r.rating) !== filterRating) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        if (sortBy === 'helpful') return (b.helpfulVotes || 0) - (a.helpfulVotes || 0);
        return 0;
      });
  }, [reviews, activeTab, searchQuery, filterRating, sortBy]);

  // ─── Multi-Select Selection Logic ───
  const isAllSelected =
    filteredReviews.length > 0 &&
    filteredReviews.every((r) => selectedReviewIds.includes(r.id));
  const isSomeSelected =
    selectedReviewIds.length > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(filteredReviews.map((r) => r.id));
    }
  };

  const handleToggleReviewSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ─── Bulk Action Handlers ───
  const handleBulkApprove = async () => {
    if (selectedReviewIds.length === 0) return;
    try {
      await bulkApprove(selectedReviewIds);
      showToast(`Approved & published ${selectedReviewIds.length} review(s)!`, 'success');
      setSelectedReviewIds([]);
    } catch (err) {
      showToast('Failed to bulk approve reviews', 'error');
    }
  };

  const handleBulkReject = async () => {
    if (selectedReviewIds.length === 0) return;
    try {
      await bulkReject(selectedReviewIds, 'Content does not meet store guidelines');
      showToast(`Rejected ${selectedReviewIds.length} review(s)`, 'info');
      setSelectedReviewIds([]);
    } catch (err) {
      showToast('Failed to bulk reject reviews', 'error');
    }
  };

  const handleBulkFlag = async () => {
    if (selectedReviewIds.length === 0) return;
    try {
      await bulkFlag(selectedReviewIds);
      showToast(`Flagged ${selectedReviewIds.length} review(s) as spam`, 'warning');
      setSelectedReviewIds([]);
    } catch (err) {
      showToast('Failed to bulk flag reviews', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviewIds.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedReviewIds.length} selected review(s)? This cannot be undone.`)) {
      try {
        await bulkDelete(selectedReviewIds);
        showToast(`Permanently deleted ${selectedReviewIds.length} review(s)`, 'info');
        setSelectedReviewIds([]);
      } catch (err) {
        showToast('Failed to bulk delete reviews', 'error');
      }
    }
  };

  const handleExportSelectedCSV = () => {
    const listToExport = filteredReviews.filter((r) => selectedReviewIds.includes(r.id));
    if (listToExport.length === 0) return;

    const headers = ['Review ID,Date,Customer,Email,Product,Rating,Title,Comment,Status,Helpful Votes'];
    const rows = listToExport.map((r) =>
      [
        `"${r.id}"`,
        `"${new Date(r.createdAt).toLocaleDateString()}"`,
        `"${r.customer.name}"`,
        `"${r.customer.email}"`,
        `"${r.product.name}"`,
        r.rating,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.comment.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        r.helpfulVotes || 0,
      ].join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picky_selected_reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`Exported ${listToExport.length} selected review(s) as CSV`, 'success');
  };

  // ─── Individual Action Handlers ───
  const handleApprove = (id, e) => {
    if (e) e.stopPropagation();
    approveReview(id);
    showToast('Review approved & published on storefront!', 'success');
  };

  const handleFlag = (id, e) => {
    if (e) e.stopPropagation();
    flagReview(id);
    showToast('Review marked as spam/flagged', 'warning');
  };

  const handleReject = (id, e) => {
    if (e) e.stopPropagation();
    rejectReview(id, 'Inappropriate or unverified content');
    showToast('Review rejected', 'info');
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this review permanently?')) {
      deleteReview(id);
      showToast('Review permanently deleted', 'info');
    }
  };

  const handleToggleFeatured = (id, e) => {
    if (e) e.stopPropagation();
    toggleFeatured(id);
    showToast('Updated homepage featured review status', 'success');
  };

  const handleSaveReply = (id) => {
    const text = replyInputs[id] || '';
    if (!text.trim()) {
      showToast('Please type a reply message first', 'warning');
      return;
    }
    replyToReview(id, { text: text.trim(), author: 'Picky Store Manager' });
    setReplyInputs((prev) => ({ ...prev, [id]: '' }));
    showToast('Official store reply published!', 'success');
  };

  const handleDeleteReply = (id) => {
    if (window.confirm('Delete this store reply?')) {
      deleteReply(id);
      showToast('Store reply deleted', 'info');
    }
  };

  // CSV Export (All Filtered)
  const handleExportCSV = () => {
    const listToExport = filteredReviews.length > 0 ? filteredReviews : reviews;
    if (listToExport.length === 0) {
      showToast('No reviews available to export', 'info');
      return;
    }

    const headers = ['Review ID,Date,Customer,Email,Product,Rating,Title,Comment,Status,Helpful Votes'];
    const rows = listToExport.map((r) =>
      [
        `"${r.id || r._id || ''}"`,
        `"${new Date(r.createdAt || Date.now()).toLocaleDateString()}"`,
        `"${(r.customer?.name || '').replace(/"/g, '""')}"`,
        `"${(r.customer?.email || '').replace(/"/g, '""')}"`,
        `"${(r.product?.name || '').replace(/"/g, '""')}"`,
        r.rating || 5,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.comment || '').replace(/"/g, '""')}"`,
        `"${r.status || 'published'}"`,
        r.helpfulVotes || r.likes || 0,
      ].join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picky_product_reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported reviews report as CSV', 'success');
  };

  return (
    <AdminLayout title="Product Reviews & Ratings Moderation">
      {/* ─── 0. Top Controls Bar (Duplicate title & subtitle removed) ─── */}
      <div className={styles.topControlBar}>
        <div className={styles.liveStatusPill}>
          <span className={styles.livePulseDot} />
          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}>
            Live Moderation Queue &bull; <strong>{reviews.length}</strong> Total Reviews
          </span>
        </div>
        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              fetchReviews();
              showToast('Refreshed real-time reviews from MongoDB', 'info');
            }}
            title="Refresh real-time reviews from live database"
          >
            <RotateCcw size={14} className={loading ? styles.spinning : ''} /> Refresh Live Data
          </button>
          <button
            type="button"
            className={styles.btnExport}
            onClick={handleExportCSV}
            title="Export filtered reviews to CSV"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ─── 1. Top 5 KPI Cards ─── */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Average Rating */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Average Rating</span>
            <div className={styles.kpiIconBox} style={{ background: '#fef3c7', color: '#d97706' }}>
              <Star size={18} fill="#d97706" />
            </div>
          </div>
          <div className={styles.kpiVal}>
            {kpis.avgScore}{' '}
            <Star
              size={18}
              fill="#f59e0b"
              color="#f59e0b"
              style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '4px' }}
            />
          </div>
          <div className={styles.kpiMeta}>
            <span>Out of 5.0 stars</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>98.2% Positive</span>
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total Reviews</span>
            <div className={styles.kpiIconBox} style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.total}</div>
          <div className={styles.kpiMeta}>
            <span>All-time customer reviews</span>
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Catalog Total</span>
          </div>
        </div>

        {/* KPI 3: Pending Moderation */}
        <div className={styles.kpiCard} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Pending Review</span>
            <div className={styles.kpiIconBox} style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: kpis.pending > 0 ? '#b45309' : '#0f172a' }}>
            {kpis.pending}
          </div>
          <div className={styles.kpiMeta}>
            <span>Awaiting admin moderation</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>Action Needed</span>
          </div>
        </div>

        {/* KPI 4: Published & Live */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Published & Live</span>
            <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.published}</div>
          <div className={styles.kpiMeta}>
            <span>Visible on product pages</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>Live On Store</span>
          </div>
        </div>

        {/* KPI 5: Photo Reviews */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>With Photos</span>
            <div className={styles.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Camera size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.withPhotos}</div>
          <div className={styles.kpiMeta}>
            <span>Customer unboxing photos</span>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>High Conversion</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Filter Status Tabs ─── */}
      <div className={styles.tabsBar}>
        {REVIEW_STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'all'
              ? reviews.length
              : tab.key === 'photos'
              ? reviews.filter((r) => r.photos && r.photos.length > 0).length
              : reviews.filter((r) => r.status === tab.key).length;

          const TabIcon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              className={isActive ? styles.tabBtnActive : styles.tabBtn}
              onClick={() => setActiveTab(tab.key)}
            >
              <TabIcon size={14} color={isActive ? '#ffffff' : tab.color} />
              <span>{tab.label}</span>
              <span className={isActive ? styles.tabBadge : styles.tabBadgeInactive}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. Search and Filter Bar ─── */}
      <div className={styles.searchToolbar}>
        <div className={styles.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by reviewer name, product, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterControls}>
          <div className={styles.selectWrap}>
            <SlidersHorizontal size={13} color="#64748b" />
            <span>Rating:</span>
            <select
              className={styles.customSelect}
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Stars (1 - 5)</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="1-2">1 - 2 Stars (Critical)</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <ArrowUpDown size={13} color="#64748b" />
            <span>Sort:</span>
            <select
              className={styles.customSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 4. Top Multi-Select Batch Action Bar (Light Theme) ─── */}
      {selectedReviewIds.length > 0 && (
        <div className={styles.topBatchActionBar}>
          <div className={styles.batchLeftGroup}>
            <div className={styles.batchCountBadge}>
              <CheckCircle2 size={15} color="#7c3aed" />
              <span>
                <strong>{selectedReviewIds.length}</strong> review{selectedReviewIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <span className={styles.batchQuickHint}>Batch Moderation Actions:</span>
          </div>

          <div className={styles.batchActionsGroup}>
            <button
              type="button"
              className={styles.batchBtnApprove}
              onClick={handleBulkApprove}
              title="Approve selected reviews and publish on storefront"
            >
              <Check size={14} /> Approve ({selectedReviewIds.length})
            </button>

            <button
              type="button"
              className={styles.batchBtnReject}
              onClick={handleBulkReject}
              title="Reject selected reviews from storefront"
            >
              <X size={14} /> Reject
            </button>

            <button
              type="button"
              className={styles.batchBtnFlag}
              onClick={handleBulkFlag}
              title="Flag selected reviews as spam"
            >
              <AlertTriangle size={14} /> Flag Spam
            </button>

            <button
              type="button"
              className={styles.batchBtnExport}
              onClick={handleExportSelectedCSV}
              title="Export selected reviews to CSV"
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              type="button"
              className={styles.batchBtnDelete}
              onClick={handleBulkDelete}
              title="Delete selected reviews permanently"
            >
              <Trash2 size={14} /> Delete
            </button>

            <button
              type="button"
              className={styles.batchBtnClear}
              onClick={() => setSelectedReviewIds([])}
              title="Clear selection"
            >
              <X size={14} /> Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. Main Reviews Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.thCheckbox}>
                  <input
                    type="checkbox"
                    className={styles.headerCheckbox}
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all reviews"
                  />
                </th>
                <th style={{ width: '17%' }} className={styles.thCell}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <User size={12} color="#64748b" /> CUSTOMER
                  </span>
                </th>
                <th style={{ width: '19%' }} className={styles.thCell}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Package size={12} color="#64748b" /> PRODUCT
                  </span>
                </th>
                <th style={{ width: '27%' }} className={styles.thCell}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" /> RATING & REVIEW
                  </span>
                </th>
                <th style={{ width: '12%' }} className={styles.thCellCenter}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <ShieldCheck size={12} color="#64748b" /> STATUS
                  </span>
                </th>
                <th style={{ width: '12%' }} className={styles.thCellCenter}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <Reply size={12} color="#64748b" /> STORE REPLY
                  </span>
                </th>
                <th style={{ width: '9%' }} className={styles.thCellCenter}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                    <SlidersHorizontal size={12} color="#64748b" /> ACTION
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <MessageSquare size={40} color="#cbd5e1" style={{ display: 'block', margin: '0 auto' }} />
                    <div className={styles.emptyStateTitle}>No reviews found</div>
                    <div className={styles.emptyStateSubtitle}>Try clearing filters or search queries.</div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev, index) => {
                  const statusCfg = REVIEW_STATUS_CONFIG[rev.status] || REVIEW_STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const isOpen = expandedId === rev.id;
                  const isSelected = selectedReviewIds.includes(rev.id);

                  return (
                    <React.Fragment key={rev.id}>
                      <tr
                        className={`${styles.trRow} ${isOpen ? styles.trRowOpen : ''} ${isSelected ? styles.trRowSelected : ''}`}
                        onClick={() => toggleRow(rev.id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? '#f5f3ff' : isOpen ? '#faf5ff' : index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderLeft: isOpen ? '3.5px solid #7c3aed' : isSelected ? '3.5px solid #a855f7' : '3.5px solid transparent',
                          borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* 0. Row Selection Checkbox */}
                        <td className={styles.tdCheckbox} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className={styles.rowCheckbox}
                            checked={isSelected}
                            onChange={(e) => handleToggleReviewSelect(rev.id, e)}
                            aria-label={`Select review by ${rev.customer?.name || 'Customer'}`}
                          />
                        </td>

                        {/* 1. Customer */}
                        <td className={styles.tdCell}>
                          <div className={styles.customerCol}>
                            {rev.customer?.avatar ? (
                              <img
                                src={rev.customer.avatar}
                                alt={rev.customer?.name || 'Customer'}
                                className={styles.customerAvatar}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={styles.customerAvatarFallback}
                              style={{ display: rev.customer?.avatar ? 'none' : 'flex' }}
                              title={rev.customer?.name || 'Customer'}
                            >
                              <span>{getCustomerInitials(rev.customer?.name)}</span>
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className={styles.customerName} title={rev.customer?.name}>
                                {rev.customer?.name || 'Customer'}
                              </div>
                              <div className={styles.customerCity} title={rev.customer?.city || rev.customer?.location}>
                                {rev.customer?.city || rev.customer?.location || 'Tamil Nadu'}
                              </div>
                              {(rev.customer?.verified || rev.customer?.isVerifiedBuyer) && (
                                <span className={styles.verifiedBadge}>
                                  <ShieldCheck size={11} color="#059669" /> Verified Buyer
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Product */}
                        <td className={styles.tdCell}>
                          <div className={styles.productCol}>
                            <img
                              src={rev.product?.image || rev.product?.images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300'}
                              alt={rev.product?.name || 'Product'}
                              className={styles.productThumb}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300';
                              }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className={styles.productName} title={rev.product?.name}>
                                {rev.product?.name || 'Handcrafted Product'}
                              </div>
                              <span className={styles.productCategory}>
                                <Layers size={10} style={{ marginRight: '3px', verticalAlign: '-1px' }} />
                                {rev.product?.category || rev.product?.subCategory || 'General'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Rating & Review */}
                        <td className={styles.tdCell}>
                          <div className={styles.ratingCol}>
                            <div className={styles.starsRow}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  color={star <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                                  fill={star <= rev.rating ? '#f59e0b' : 'none'}
                                />
                              ))}
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginLeft: '4px' }}>
                                {rev.rating}.0
                              </span>
                            </div>

                            <div className={styles.reviewTitleSnippet} title={rev.title}>
                              {rev.title}
                            </div>

                            <div className={styles.reviewCommentSnippet} title={rev.comment}>
                              "{rev.comment}"
                            </div>

                            {/* Photo thumbs snippet */}
                            {rev.photos && rev.photos.length > 0 && (
                              <div className={styles.photoThumbsMiniRow}>
                                {rev.photos.slice(0, 3).map((photoUrl, i) => (
                                  <img
                                    key={i}
                                    src={photoUrl}
                                    alt="Review thumbnail"
                                    className={styles.photoThumbMini}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImg(photoUrl);
                                    }}
                                    title="Click to zoom photo"
                                  />
                                ))}
                                <span className={styles.photoCountChip}>
                                  <Camera size={10} /> {rev.photos.length}
                                </span>
                              </div>
                            )}

                            <div className={styles.dateSnippet}>
                              <Clock size={11} style={{ marginRight: '3px', verticalAlign: '-1px', display: 'inline' }} />
                              {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <span
                              className={styles.statusBadge}
                              style={{
                                background: statusCfg.bg,
                                color: statusCfg.color,
                                border: `1px solid ${statusCfg.border}`,
                              }}
                            >
                              <StatusIcon size={12} style={{ flexShrink: 0 }} />
                              <span>{statusCfg.label}</span>
                            </span>
                          </div>
                        </td>

                        {/* 5. Store Reply Badge */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            {rev.adminReply ? (
                              <span className={styles.replyBadgeYes} title={`Replied by ${rev.adminReply.author}`}>
                                <Reply size={11} /> Replied
                              </span>
                            ) : (
                              <span className={styles.replyBadgeNo}>
                                <MessageSquareOff size={11} /> No reply
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Action Moderate Button */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(rev.id);
                              }}
                              className={isOpen ? styles.manageBtnActive : styles.manageBtn}
                              title={isOpen ? 'Close moderation drawer' : 'Open moderation drawer'}
                            >
                              {isOpen ? <ChevronUp size={13} /> : <ChevronsUpDown size={13} />}
                              <span>{isOpen ? 'Close' : 'Moderate'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expandable Details Drawer ── */}
                      {isOpen && (
                        <tr className={styles.expandedRowTr}>
                          <td colSpan={7} className={styles.expandedColTd}>
                            <div className={styles.expandedDrawerWrap}>
                              <div className={styles.expandedGrid}>
                                {/* CARD 1: REVIEW STATEMENT & DECISION BUTTONS */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <MessageSquare size={16} color="#7c3aed" />
                                      Review Content & Photos
                                    </h4>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                      ID: #{rev.id}
                                    </span>
                                  </div>

                                  <div className={styles.reviewStatementBox}>
                                    <div className={styles.reviewFullTitle}>{rev.title}</div>
                                    <div className={styles.reviewFullComment}>"{rev.comment}"</div>

                                    {/* Uploaded Photos Gallery */}
                                    {rev.photos && rev.photos.length > 0 && (
                                      <div className={styles.photoGalleryWrap}>
                                        <span className={styles.photoGalleryLabel}>
                                          Customer Uploaded Photos ({rev.photos.length})
                                        </span>
                                        <div className={styles.photoGalleryGrid}>
                                          {rev.photos.map((photo, pIdx) => (
                                            <img
                                              key={pIdx}
                                              src={photo}
                                              alt={`Customer upload ${pIdx + 1}`}
                                              className={styles.photoGalleryItem}
                                              onClick={() => setLightboxImg(photo)}
                                              title="Click to view full image"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Quick Decision Action Bar */}
                                  <div className={styles.reviewDecisionButtons}>
                                    {rev.status !== 'published' && (
                                      <button
                                        type="button"
                                        className={styles.btnPublish}
                                        onClick={(e) => handleApprove(rev.id, e)}
                                      >
                                        <Check size={13} /> Approve & Publish
                                      </button>
                                    )}

                                    {rev.status !== 'flagged' && (
                                      <button
                                        type="button"
                                        className={styles.btnFlag}
                                        onClick={(e) => handleFlag(rev.id, e)}
                                      >
                                        <AlertTriangle size={13} /> Flag as Spam
                                      </button>
                                    )}

                                    {rev.status !== 'rejected' && (
                                      <button
                                        type="button"
                                        className={styles.btnDelete}
                                        onClick={(e) => handleReject(rev.id, e)}
                                        title="Reject review from storefront"
                                      >
                                        <X size={13} /> Reject
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      className={styles.btnDelete}
                                      onClick={(e) => handleDelete(rev.id, e)}
                                      title="Delete permanently"
                                      style={{ marginLeft: 'auto', color: '#dc2626' }}
                                    >
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                </div>

                                {/* CARD 2: PRODUCT & FEATURED HOMEPAGE TOGGLE */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Package size={16} color="#7c3aed" />
                                      Purchased Product
                                    </h4>
                                    <Link
                                      to={`/product/${rev.product?.slug || ''}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        fontSize: '0.75rem',
                                        color: '#7c3aed',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.2rem',
                                      }}
                                    >
                                      <span>View Store</span> <ExternalLink size={10} />
                                    </Link>
                                  </div>

                                  <div className={styles.productPreviewCard}>
                                    <img
                                      src={rev.product?.image || rev.product?.images?.[0] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300'}
                                      alt={rev.product?.name || 'Product'}
                                      className={styles.productPreviewImg}
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300';
                                      }}
                                    />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>
                                        {rev.product?.name || 'Handcrafted Product'}
                                      </strong>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                        Category: <strong>{rev.product?.category || rev.product?.subCategory || 'General'}</strong>
                                      </span>
                                      <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                                        ₹{rev.product?.price || 0}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Feature on Homepage Switch */}
                                  <div className={styles.featureBox}>
                                    <div>
                                      <div className={styles.featureTitle}>
                                        <Sparkles size={14} color="#d97706" />
                                        Featured on Homepage Marquee
                                      </div>
                                      <div className={styles.featureSubtitle}>
                                        Display this testimonial on Picky's home carousel
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleFeatured(rev.id, e)}
                                      style={{
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '9999px',
                                        border: rev.isFeatured ? '1px solid #d97706' : '1px solid #cbd5e1',
                                        background: rev.isFeatured ? '#d97706' : '#ffffff',
                                        color: rev.isFeatured ? '#ffffff' : '#64748b',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      {rev.isFeatured ? (
                                        <>
                                          <Star size={12} fill="#ffffff" color="#ffffff" /> Featured
                                        </>
                                      ) : (
                                        <>
                                          <Plus size={12} /> Feature on Home
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* CARD 3: STORE ADMIN OFFICIAL REPLY */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Reply size={16} color="#7c3aed" />
                                      Official Store Reply
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      Publicly visible on PDP
                                    </span>
                                  </div>

                                  <div className={styles.replySectionBox}>
                                    {rev.adminReply ? (
                                      <div className={styles.existingReplyCard}>
                                        <div className={styles.replyAuthorRow}>
                                          <span>{rev.adminReply.author}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteReply(rev.id)}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              color: '#dc2626',
                                              cursor: 'pointer',
                                              fontSize: '0.7rem',
                                              fontWeight: 600,
                                            }}
                                            title="Delete this reply"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                        <div className={styles.replyTextContent}>
                                          "{rev.adminReply.text}"
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#7c3aed', marginTop: '4px' }}>
                                          Replied on {new Date(rev.adminReply.repliedAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                    ) : null}

                                    <div>
                                      <textarea
                                        className={styles.replyTextarea}
                                        rows={3}
                                        placeholder={
                                          rev.adminReply
                                            ? 'Update or edit store reply...'
                                            : 'Write official store reply (e.g. Thank you for your review! We are delighted...)'
                                        }
                                        value={replyInputs[rev.id] || ''}
                                        onChange={(e) =>
                                          setReplyInputs({ ...replyInputs, [rev.id]: e.target.value })
                                        }
                                      />
                                      <button
                                        type="button"
                                        className={styles.btnReplySubmit}
                                        onClick={() => handleSaveReply(rev.id)}
                                      >
                                        <Send size={13} />
                                        <span>{rev.adminReply ? 'Update Store Reply' : 'Publish Store Reply'}</span>
                                      </button>
                                    </div>
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

      {/* ─── Lightbox Modal for Photo Reviews ─── */}
      {lightboxImg && (
        <div className={styles.lightboxModalBackdrop} onClick={() => setLightboxImg(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxImg(null)}
              title="Close image"
            >
              <X size={18} />
            </button>
            <img src={lightboxImg} alt="Customer upload HD" className={styles.lightboxImg} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

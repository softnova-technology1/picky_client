import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Search,
  CheckCircle2,
  X,
  Paperclip,
  Eye,
  ShoppingBag,
  Boxes,
  Users,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MailOpen,
  ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { contactService } from '../../../services/contact.service';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminNotifications.module.css';

const ADMIN = '/softpicky-sn2026';

// Helper for exact relative time ("2 minutes ago", "15 minutes ago", "1 hour ago", etc.)
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recent';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 45) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (n) =>
              n &&
              n.id &&
              !String(n.id).startsWith('notif-') &&
              n.type !== 'product' &&
              n.type !== 'coupon' &&
              !String(n.title || '').includes('Product in Catalog')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'orders' | 'inventory' | 'payments' | 'customers' | 'system'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Inquiry preview modal
  const [selectedContactModal, setSelectedContactModal] = useState(null);
  const [contactFullData, setContactFullData] = useState(null);

  // Sync notifications from server (strictly live DB, never auto-recreates deleted items)
  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await contactService.getNotifications({ limit: 100 });
      const apiNotifs = res?.data?.notifications || res?.data;
      if (Array.isArray(apiNotifs)) {
        const cleanNotifs = apiNotifs
          .filter(
            (n) =>
              n &&
              n.type !== 'product' &&
              n.type !== 'coupon' &&
              !String(n.title || '').includes('Product in Catalog')
          )
          .map((n) => ({
            ...n,
            id: n.id || n._id,
            relativeTime: formatRelativeTime(n.createdAt),
          }));

        setNotifications(cleanNotifs);
        localStorage.setItem('picky_admin_notifications', JSON.stringify(cleanNotifs));
        window.dispatchEvent(new Event('picky_notifications_updated'));
      }
    } catch (err) {
      console.warn('Notification sync note:', err.message);
    } finally {
      if (!isBackground) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Periodic real-time background sync (every 6s when tab is active) + focus revalidation
  useEffect(() => {
    fetchNotifications();

    const handleFocus = () => fetchNotifications(true);
    const handleCustomEvent = () => {
      try {
        const saved = localStorage.getItem('picky_admin_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleCustomEvent);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleCustomEvent);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
    showToast('Notifications synced with live database', 'success');
  };

  const commitNotifications = (updatedList) => {
    setNotifications(updatedList);
    localStorage.setItem('picky_admin_notifications', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('picky_notifications_updated'));
  };

  // Mark single read / unread
  const handleToggleRead = async (id, e) => {
    if (e) e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target) return;
    const newStatus = !target.unread;

    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: newStatus } : n));
    commitNotifications(updated);

    try {
      if (target.unread) {
        await contactService.markNotificationRead(id).catch(() => {});
      }
    } catch {}
  };

  // Star / Unstar
  const handleToggleStar = async (e, id) => {
    e.stopPropagation();
    const updated = notifications.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n));
    commitNotifications(updated);

    try {
      if (contactService.toggleStarNotification) {
        await contactService.toggleStarNotification(id).catch(() => {});
      }
    } catch {}
  };

  // Delete notification (permanently deleted from MongoDB; NEVER reappears)
  const handleDeleteRow = async (e, id) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    commitNotifications(updated);

    try {
      await contactService.deleteNotification(id);
      showToast('Notification deleted permanently', 'info');
    } catch (err) {
      console.warn('Delete error:', err.message);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    commitNotifications(updated);
    try {
      await contactService.markAllNotificationsRead();
      showToast('All notifications marked as read', 'success');
    } catch {}
  };

  // Bulk Mark Read
  const handleBatchMarkRead = async () => {
    if (selectedIds.length === 0) return;
    const idsToMark = [...selectedIds];
    const updated = notifications.map((n) =>
      idsToMark.includes(n.id) ? { ...n, unread: false } : n
    );
    commitNotifications(updated);
    setSelectedIds([]);

    try {
      if (contactService.bulkReadNotifications) {
        await contactService.bulkReadNotifications(idsToMark);
      } else {
        await Promise.all(idsToMark.map((id) => contactService.markNotificationRead(id).catch(() => {})));
      }
      showToast(`Marked ${idsToMark.length} notifications as read`, 'success');
    } catch {}
  };

  // Bulk Delete (permanently deleted from MongoDB; NEVER reappears)
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const idsToDelete = [...selectedIds];
    const updated = notifications.filter((n) => !idsToDelete.includes(n.id));
    commitNotifications(updated);
    setSelectedIds([]);

    try {
      if (contactService.bulkDeleteNotifications) {
        await contactService.bulkDeleteNotifications(idsToDelete);
      } else {
        await Promise.all(idsToDelete.map((id) => contactService.deleteNotification(id).catch(() => {})));
      }
      showToast(`Bulk deleted ${count} notification(s) permanently`, 'success');
    } catch (err) {
      console.warn('Bulk delete error:', err.message);
      showToast('Failed to bulk delete notifications', 'error');
    }
  };

  // Delete All Read Notifications
  const handleDeleteAllRead = async () => {
    const readIds = notifications.filter((n) => !n.unread).map((n) => n.id);
    if (readIds.length === 0) {
      showToast('No read notifications to delete', 'info');
      return;
    }
    const count = readIds.length;
    const updated = notifications.filter((n) => n.unread);
    commitNotifications(updated);
    setSelectedIds((prev) => prev.filter((id) => !readIds.includes(id)));

    try {
      if (contactService.bulkDeleteNotifications) {
        await contactService.bulkDeleteNotifications(readIds);
      } else {
        await Promise.all(readIds.map((id) => contactService.deleteNotification(id).catch(() => {})));
      }
      showToast(`Deleted ${count} read notification(s) permanently`, 'success');
    } catch (err) {
      console.warn('Delete read error:', err.message);
    }
  };

  // Checkbox toggle
  const handleToggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Filter calculations
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const type = (n.type || '').toLowerCase();

      // Category tab filter
      if (activeTab === 'orders' && type !== 'order') return false;
      if (activeTab === 'inventory' && type !== 'inventory') return false;
      if (activeTab === 'payments' && type !== 'payment') return false;
      if (activeTab === 'customers' && type !== 'customer' && type !== 'contact') return false;
      if (activeTab === 'system' && type !== 'system') return false;

      // Status filter
      if (statusFilter === 'unread' && !n.unread) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (n.title || '').toLowerCase();
        const subtitle = (n.subtitle || '').toLowerCase();
        const msg = (n.message || '').toLowerCase();
        const ord = (n.metadata?.orderNumber || '').toLowerCase();
        const cust = (n.metadata?.customerName || n.metadata?.fullName || n.metadata?.name || '').toLowerCase();
        if (!title.includes(q) && !subtitle.includes(q) && !msg.includes(q) && !ord.includes(q) && !cust.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, statusFilter, searchQuery]);

  // Counts by category
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.unread).length;
  const readCount = notifications.filter((n) => !n.unread).length;
  const ordersCount = notifications.filter((n) => (n.type || '').toLowerCase() === 'order').length;
  const inventoryCount = notifications.filter((n) => (n.type || '').toLowerCase() === 'inventory').length;
  const paymentsCount = notifications.filter((n) => (n.type || '').toLowerCase() === 'payment').length;
  const customersCount = notifications.filter(
    (n) => (n.type || '').toLowerCase() === 'customer' || (n.type || '').toLowerCase() === 'contact'
  ).length;
  const systemCount = notifications.filter((n) => (n.type || '').toLowerCase() === 'system').length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + pageSize);

  const isAllPageSelected =
    paginatedNotifications.length > 0 &&
    paginatedNotifications.every((n) => selectedIds.includes(n.id));

  const isAllFilteredSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.includes(n.id));

  const handleToggleSelectAll = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedNotifications.map((n) => n.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const pageIds = paginatedNotifications.map((n) => n.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectEntireView = () => {
    const allFilteredIds = filteredNotifications.map((n) => n.id);
    setSelectedIds(allFilteredIds);
  };

  const handleSelectAllUnread = () => {
    const unreadFilteredIds = filteredNotifications.filter((n) => n.unread).map((n) => n.id);
    setSelectedIds(unreadFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Card click handler
  const handleCardClick = async (notif) => {
    if (notif.unread) {
      const updated = notifications.map((n) => (n.id === notif.id ? { ...n, unread: false } : n));
      commitNotifications(updated);
      contactService.markNotificationRead(notif.id).catch(() => {});
    }

    if (notif.type === 'contact' || notif.metadata?.inquiryId) {
      setSelectedContactModal(notif);
      const inquiryId = notif.metadata?.inquiryId;
      if (inquiryId) {
        try {
          const inqRes = await contactService.getById(inquiryId);
          if (inqRes?.data) setContactFullData(inqRes.data);
        } catch {}
      }
      return;
    }

    if (notif.link) {
      const targetLink = notif.link.includes('tab=notifications') ? `${ADMIN}/inquiries` : notif.link;
      navigate(targetLink);
    }
  };

  // Render Category Icon
  const renderIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'order') {
      return (
        <div className={`${styles.iconBox} ${styles.iconOrders}`}>
          <ShoppingBag size={20} />
        </div>
      );
    }
    if (t === 'inventory') {
      return (
        <div className={`${styles.iconBox} ${styles.iconInventory}`}>
          <AlertTriangle size={20} />
        </div>
      );
    }
    if (t === 'payment') {
      return (
        <div className={`${styles.iconBox} ${styles.iconPayments}`}>
          <CreditCard size={20} />
        </div>
      );
    }
    if (t === 'contact') {
      return (
        <div className={`${styles.iconBox} ${styles.iconSupport}`}>
          <Mail size={20} />
        </div>
      );
    }
    if (t === 'customer') {
      return (
        <div className={`${styles.iconBox} ${styles.iconCustomers}`}>
          <Users size={20} />
        </div>
      );
    }
    return (
      <div className={`${styles.iconBox} ${styles.iconSystem}`}>
        <ShieldCheck size={20} />
      </div>
    );
  };

  return (
    <AdminLayout title="Notifications">
      <div className={styles.container}>
        {/* ── Top Header Section ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Notifications</h1>
              {unreadCount > 0 ? (
                <div className={styles.unreadCountBadge}>
                  <span className={styles.unreadPulseDot} />
                  <span>{unreadCount} unread</span>
                </div>
              ) : (
                <div
                  className={styles.unreadCountBadge}
                  style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                >
                  <CheckCircle2 size={13} />
                  <span>All caught up</span>
                </div>
              )}
            </div>
            <p className={styles.subtitle}>Stay updated with store activity</p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={handleManualRefresh}
              title="Sync with live database"
            >
              <RefreshCw size={15} className={refreshing ? styles.spinning : ''} />
              <span>Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAllRead}
                title="Mark all notifications as read"
              >
                <CheckCheck size={16} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Controls Section: Category Tabs ── */}
        <div className={styles.controlsSection}>
          <div className={styles.categoryTabsRow} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`${styles.categoryTab} ${activeTab === 'all' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
            >
              <span>All</span>
              <span className={styles.tabBadge}>{totalCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              className={`${styles.categoryTab} ${activeTab === 'orders' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('orders');
                setCurrentPage(1);
              }}
            >
              <span>Orders</span>
              <span className={styles.tabBadge}>{ordersCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'inventory'}
              className={`${styles.categoryTab} ${activeTab === 'inventory' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('inventory');
                setCurrentPage(1);
              }}
            >
              <span>Inventory</span>
              <span className={styles.tabBadge}>{inventoryCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'payments'}
              className={`${styles.categoryTab} ${activeTab === 'payments' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('payments');
                setCurrentPage(1);
              }}
            >
              <span>Payments</span>
              <span className={styles.tabBadge}>{paymentsCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'customers'}
              className={`${styles.categoryTab} ${activeTab === 'customers' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('customers');
                setCurrentPage(1);
              }}
            >
              <span>Customers</span>
              <span className={styles.tabBadge}>{customersCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'system'}
              className={`${styles.categoryTab} ${activeTab === 'system' ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveTab('system');
                setCurrentPage(1);
              }}
            >
              <span>System</span>
              <span className={styles.tabBadge}>{systemCount}</span>
            </button>
          </div>

          {/* Sub Toolbar: Dedicated Select All Checkbox + Bulk Delete Bar + Search */}
          <div className={styles.subToolbar}>
            <div className={styles.subToolbarLeft}>
              {/* Dedicated Select All Checkbox */}
              <label
                className={styles.toolbarSelectAll}
                title={isAllPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
              >
                <input
                  type="checkbox"
                  checked={isAllPageSelected && paginatedNotifications.length > 0}
                  onChange={handleToggleSelectAll}
                  className={styles.checkbox}
                />
                <span className={styles.toolbarSelectLabel}>
                  {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
                </span>
              </label>

              {/* Bulk Actions when 1 or more items are selected */}
              {selectedIds.length > 0 ? (
                <div className={styles.bulkActionsGroup}>
                  <button
                    type="button"
                    className={styles.bulkDeleteBtn}
                    onClick={handleBatchDelete}
                    title={`Bulk delete ${selectedIds.length} selected notification(s) permanently`}
                  >
                    <Trash2 size={14} />
                    <span>Bulk Delete ({selectedIds.length})</span>
                  </button>

                  <button
                    type="button"
                    className={styles.bulkReadBtn}
                    onClick={handleBatchMarkRead}
                    title="Mark selected as read"
                  >
                    <MailOpen size={14} />
                    <span>Mark Read</span>
                  </button>

                  <button
                    type="button"
                    className={styles.deselectBtn}
                    onClick={handleDeselectAll}
                    title="Clear selection"
                  >
                    <X size={13} />
                    <span>Deselect</span>
                  </button>
                </div>
              ) : (
                /* Quick selection helper buttons when 0 items are selected */
                <div className={styles.quickSelectGroup}>
                  {filteredNotifications.length > pageSize && !isAllFilteredSelected && (
                    <button
                      type="button"
                      className={styles.quickSelectBtn}
                      onClick={handleSelectEntireView}
                      title={`Select all ${filteredNotifications.length} notifications across all pages`}
                    >
                      Select All ({filteredNotifications.length})
                    </button>
                  )}

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className={styles.quickSelectBtn}
                      onClick={handleSelectAllUnread}
                      title={`Select all ${unreadCount} unread notifications`}
                    >
                      Select Unread ({unreadCount})
                    </button>
                  )}

                  {readCount > 0 && (
                    <button
                      type="button"
                      className={styles.deleteReadBtn}
                      onClick={handleDeleteAllRead}
                      title="Permanently delete all read notifications"
                    >
                      <Trash2 size={12} />
                      <span>Delete Read ({readCount})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Status Filter Toggle (All | Unread) */}
              <div className={styles.statusFilterGroup}>
                <button
                  type="button"
                  className={`${styles.statusFilterBtn} ${
                    statusFilter === 'all' ? styles.statusFilterBtnActive : ''
                  }`}
                  onClick={() => {
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  All ({filteredNotifications.length})
                </button>
                <button
                  type="button"
                  className={`${styles.statusFilterBtn} ${
                    statusFilter === 'unread' ? styles.statusFilterBtnActive : ''
                  }`}
                  onClick={() => {
                    setStatusFilter('unread');
                    setCurrentPage(1);
                  }}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Instant Search Box */}
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.searchClearBtn}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Notification Feed Cards ── */}
        <div className={styles.feedList}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.emptyFeed}>
              <CheckCircle2 size={42} className={styles.emptyIcon} />
              <div className={styles.emptyTitle}>No notifications in this filter</div>
              <div className={styles.emptyText}>
                {statusFilter === 'unread'
                  ? 'All notifications have been read! ✨'
                  : 'You are completely caught up with your store activity.'}
              </div>
            </div>
          ) : (
            paginatedNotifications.map((notif) => {
              const isSelected = selectedIds.includes(notif.id);
              const notifType = (notif.type || '').toLowerCase();

              let catBadgeClass = styles.catBadgeSystem;
              if (notifType === 'order') catBadgeClass = styles.catBadgeOrders;
              else if (notifType === 'inventory') catBadgeClass = styles.catBadgeInventory;
              else if (notifType === 'payment') catBadgeClass = styles.catBadgePayments;
              else if (notifType === 'customer' || notifType === 'contact') catBadgeClass = styles.catBadgeCustomers;

              return (
                <div
                  key={notif.id}
                  className={`${styles.notifCard} ${
                    notif.unread ? styles.notifCardUnread : styles.notifCardRead
                  } ${isSelected ? styles.notifCardSelected : ''}`}
                  onClick={() => handleCardClick(notif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(notif);
                    }
                  }}
                >
                  {/* Checkbox Column */}
                  <div className={styles.checkCol} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={(e) => handleToggleSelect(e, notif.id)}
                      aria-label={`Select ${notif.title}`}
                    />
                  </div>

                  {/* Icon Box */}
                  {renderIcon(notif.type)}

                  {/* Card Content (Title, Subtitle, Message, Relative Time) */}
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeaderRow}>
                      <span className={styles.cardTitle}>{notif.title}</span>
                      <span className={`${styles.cardCategoryBadge} ${catBadgeClass}`}>
                        {notif.category || notif.type || 'Alert'}
                      </span>

                      {(notif.hasAttachment || notif.metadata?.hasAttachment || notif.metadata?.fileUrl) && (
                        <span className={styles.attachmentPill} title="File attachment included">
                          <Paperclip size={11} /> File
                        </span>
                      )}

                      {(notif.metadata?.isGiftWrapped || notif.title?.includes('[GIFT WRAP]')) && (
                        <span className={styles.giftWrapPill}>🎁 Gift Wrap</span>
                      )}
                    </div>

                    {/* Subtitle */}
                    {notif.subtitle ? (
                      <div className={styles.cardSubtitle}>{notif.subtitle}</div>
                    ) : null}

                    {/* Description message */}
                    <div className={styles.cardMessage}>{notif.message}</div>

                    {/* Relative Time (e.g. "2 minutes ago", "15 minutes ago", "1 hour ago") */}
                    <span className={styles.cardTime}>
                      {notif.relativeTime || formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Card Actions (Right Side) */}
                  <div className={styles.cardActions}>
                    {/* Star */}
                    <button
                      type="button"
                      className={styles.starBtn}
                      onClick={(e) => handleToggleStar(e, notif.id)}
                      title={notif.starred ? 'Starred' : 'Not starred'}
                    >
                      <Star
                        size={16}
                        fill={notif.starred ? '#f59e0b' : 'none'}
                        color={notif.starred ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>

                    {/* Direct link or details modal */}
                    {notif.type === 'contact' || notif.metadata?.inquiryId ? (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        title="Preview customer inquiry & attachment"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(notif);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                    ) : notif.link ? (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        title="Open related store page"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notif.unread) handleToggleRead(notif.id);
                          const targetLink = (notif.link || '').includes('tab=notifications') ? `${ADMIN}/inquiries` : notif.link;
                          navigate(targetLink);
                        }}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    ) : null}

                    {/* Read / Unread toggle */}
                    <button
                      type="button"
                      className={styles.actionBtn}
                      title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                      onClick={(e) => handleToggleRead(notif.id, e)}
                    >
                      {notif.unread ? <MailOpen size={15} /> : <Mail size={15} />}
                    </button>

                    {/* Delete permanently */}
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      title="Delete notification permanently"
                      onClick={(e) => handleDeleteRow(e, notif.id)}
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Unread indicator beacon */}
                    {notif.unread && <span className={styles.unreadDot} title="Unread alert" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination Footer ── */}
        {filteredNotifications.length > pageSize && (
          <div className={styles.paginationFooter}>
            <div>
              Showing {filteredNotifications.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, filteredNotifications.length)} of {filteredNotifications.length}
            </div>

            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`${styles.pageNumBtn} ${
                    pageNum === safeCurrentPage ? styles.pageNumBtnActive : ''
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Customer Inquiry & Attachment Modal ── */}
        <Modal
          isOpen={Boolean(selectedContactModal)}
          onClose={() => {
            setSelectedContactModal(null);
            setContactFullData(null);
          }}
          title="Customer Inquiry & Attached Files"
          maxWidth={620}
        >
          {selectedContactModal && (() => {
            const inquiry = contactFullData || selectedContactModal.metadata || {};
            const fullName =
              inquiry.fullName ||
              selectedContactModal.title.replace('New Support Inquiry from ', '') ||
              'Customer';
            const email = inquiry.email || selectedContactModal.metadata?.email || 'N/A';
            const phone = inquiry.phone || selectedContactModal.metadata?.phone || 'N/A';
            const message = inquiry.message || selectedContactModal.message || 'No message';
            const file =
              inquiry.file ||
              (selectedContactModal.metadata?.fileUrl
                ? {
                    url: selectedContactModal.metadata.fileUrl,
                    originalName: selectedContactModal.metadata.fileName,
                    mimeType: selectedContactModal.metadata.fileMime,
                    size: selectedContactModal.metadata.fileSize,
                  }
                : null);

            return (
              <div className={styles.inquiryModalBody}>
                <div className={styles.inquiryInfoCard}>
                  <div className={styles.inquiryInfoItem}>
                    <span className={styles.inquiryInfoLabel}>Customer Name</span>
                    <span className={styles.inquiryInfoVal}>{fullName}</span>
                  </div>

                  <div className={styles.inquiryInfoItem}>
                    <span className={styles.inquiryInfoLabel}>Email Address</span>
                    <span className={styles.inquiryInfoVal}>{email}</span>
                  </div>

                  <div className={styles.inquiryInfoItem}>
                    <span className={styles.inquiryInfoLabel}>Phone Number</span>
                    <span className={styles.inquiryInfoVal}>{phone}</span>
                  </div>

                  <div className={styles.inquiryInfoItem}>
                    <span className={styles.inquiryInfoLabel}>Time Received</span>
                    <span className={styles.inquiryInfoVal}>
                      {selectedContactModal.createdAt
                        ? new Date(selectedContactModal.createdAt).toLocaleString('en-IN')
                        : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className={styles.inquiryMessageBox}>
                  <div className={styles.inquiryMessageLabel}>Inquiry Message</div>
                  <div className={styles.inquiryMessageText}>{message}</div>
                </div>

                {file?.url && (
                  <div>
                    <div className={styles.attachmentCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Paperclip size={18} style={{ color: '#db2777' }} />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#831843' }}>
                          {file.originalName || 'Attached File'}
                        </span>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.attachmentBtn}
                      >
                        <Download size={14} /> Open Attachment
                      </a>
                    </div>

                    {file.url &&
                      (file.mimeType?.startsWith('image/') ||
                        /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(file.url)) && (
                        <img
                          src={file.url}
                          alt="Attachment Preview"
                          className={styles.attachmentPreviewImage}
                        />
                      )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => {
                      setSelectedContactModal(null);
                      setContactFullData(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    </AdminLayout>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquareText,
  Mail,
  Home,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  CheckCheck,
  Paperclip,
  Download,
  ExternalLink,
  Phone,
  Calendar,
  Filter,
  Check,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { contactService } from '../../../services/contact.service';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminInquiries.module.css';

// Helper for exact relative time ("2 minutes ago", "1 hour ago", "Yesterday", etc.)
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recent';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 45) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default function AdminInquiries() {
  const { showToast } = useUiStore();

  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({
    unreadCount: 0,
    contactCount: 0,
    homepageCount: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'contact_page' | 'homepage'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail & Delete Modals
  const [activeModalInquiry, setActiveModalInquiry] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // 'bulk' | inquiryId

  const fetchInquiries = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = {
          page: currentPage,
          limit: pageSize,
          source: sourceFilter,
          status: statusFilter,
          search: searchQuery.trim() || undefined,
        };

        const res = await contactService.list(params);
        const data = res?.data || {};

        setInquiries(Array.isArray(data.inquiries) ? data.inquiries : []);
        setCounts({
          unreadCount: data.unreadCount || 0,
          contactCount: data.contactCount || 0,
          homepageCount: data.homepageCount || 0,
          totalInquiries: data.totalInquiries || (data.inquiries?.length || 0),
        });

        const pagination = res?.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
        showToast('Failed to load inquiries from server', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, sourceFilter, statusFilter, searchQuery, showToast]
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Window events & background polling
  useEffect(() => {
    const handleUpdate = () => fetchInquiries();
    window.addEventListener('picky_inquiries_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('picky_inquiries_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchInquiries]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(inquiries.map((inq) => inq._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = inquiries.length > 0 && selectedIds.length === inquiries.length;

  // Single Mark Read / Unread
  const handleToggleRead = async (inquiry, e) => {
    if (e) e.stopPropagation();
    const nextReadState = !inquiry.isRead;
    try {
      await contactService.markAsRead(inquiry._id, nextReadState);
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === inquiry._id
            ? { ...item, isRead: nextReadState, status: nextReadState ? 'read' : 'unread' }
            : item
        )
      );
      setCounts((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount + (nextReadState ? -1 : 1)),
      }));

      window.dispatchEvent(new Event('picky_inquiries_updated'));
      window.dispatchEvent(new Event('picky_notifications_updated'));
      showToast(`Inquiry marked as ${nextReadState ? 'read' : 'unread'}`, 'info');
    } catch (err) {
      showToast('Failed to update inquiry status', 'error');
    }
  };

  // Bulk Mark Read / Unread
  const handleBulkRead = async (isRead) => {
    if (selectedIds.length === 0) return;
    try {
      await contactService.bulkReadInquiries(selectedIds, isRead);
      setInquiries((prev) =>
        prev.map((item) =>
          selectedIds.includes(item._id)
            ? { ...item, isRead, status: isRead ? 'read' : 'unread' }
            : item
        )
      );
      setSelectedIds([]);
      fetchInquiries();
      window.dispatchEvent(new Event('picky_inquiries_updated'));
      window.dispatchEvent(new Event('picky_notifications_updated'));
      showToast(`Selected inquiries marked as ${isRead ? 'read' : 'unread'}`, 'success');
    } catch (err) {
      showToast('Failed to update selected inquiries', 'error');
    }
  };

  // Mark All As Read
  const handleMarkAllRead = async () => {
    try {
      await contactService.markAllInquiriesRead();
      setInquiries((prev) => prev.map((inq) => ({ ...inq, isRead: true, status: 'read' })));
      setCounts((prev) => ({ ...prev, unreadCount: 0 }));
      window.dispatchEvent(new Event('picky_inquiries_updated'));
      window.dispatchEvent(new Event('picky_notifications_updated'));
      showToast('All inquiries marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirmTarget === 'bulk') {
        await contactService.bulkDeleteInquiries(selectedIds);
        showToast(`${selectedIds.length} inquiries deleted`, 'success');
        setSelectedIds([]);
      } else if (deleteConfirmTarget) {
        await contactService.delete(deleteConfirmTarget);
        showToast('Inquiry deleted successfully', 'success');
        if (activeModalInquiry?._id === deleteConfirmTarget) {
          setActiveModalInquiry(null);
        }
      }
      setDeleteConfirmTarget(null);
      fetchInquiries();
      window.dispatchEvent(new Event('picky_inquiries_updated'));
      window.dispatchEvent(new Event('picky_notifications_updated'));
    } catch (err) {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  // WhatsApp reply link generator
  const getWhatsAppLink = (phone, name) => {
    if (!phone) return null;
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const text = encodeURIComponent(
      `Hello ${name || 'Customer'}, thank you for contacting Picky! We received your inquiry and are happy to assist you.`
    );
    return `https://wa.me/${formattedNumber}?text=${text}`;
  };

  // Email reply link generator
  const getMailtoLink = (email, name) => {
    if (!email) return null;
    const subject = encodeURIComponent('Regarding your inquiry on Picky');
    const body = encodeURIComponent(`Hi ${name || 'Customer'},\n\nThank you for reaching out to Picky.\n\nBest regards,\nPicky Team`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <AdminLayout>
      <div className={styles.pageContainer}>
        {/* ── Page Header ────────────────────────────────────────────── */}
        <header className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <MessageSquareText size={22} />
              </div>
              <h1 className={styles.pageTitle}>Customer Inquiries</h1>
            </div>
            <p className={styles.pageSubtitle}>
              Live form submissions from Homepage and Contact Page
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              onClick={() => fetchInquiries(true)}
              disabled={loading || refreshing}
              className={`${styles.actionBtn} ${styles.refreshBtn}`}
              title="Refresh Inquiries Feed"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {counts.unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className={`${styles.actionBtn} ${styles.markAllBtn}`}
                title="Mark all unread inquiries as read"
              >
                <CheckCheck size={16} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Metric Summary Cards ───────────────────────────────────── */}
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIconWrap} style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <MessageSquareText size={20} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Inquiries</span>
              <span className={styles.metricValue}>{counts.totalInquiries}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrap} style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Mail size={20} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Unread Inquiries</span>
              <span className={styles.metricValue} style={{ color: counts.unreadCount > 0 ? '#7c3aed' : '#0f172a' }}>
                {counts.unreadCount}
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrap} style={{ background: '#f3e8ff', color: '#9333ea' }}>
              <Mail size={20} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Contact Page Form</span>
              <span className={styles.metricValue}>{counts.contactCount}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrap} style={{ background: '#ecfdf5', color: '#059669' }}>
              <Home size={20} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Homepage Form</span>
              <span className={styles.metricValue}>{counts.homepageCount}</span>
            </div>
          </div>
        </div>

        {/* ── Filter Bar (Source Tabs + Search + Status Select) ────────── */}
        <div className={styles.filterBar}>
          <div className={styles.sourceTabs}>
            <button
              onClick={() => { setSourceFilter('all'); setCurrentPage(1); }}
              className={`${styles.tabBtn} ${sourceFilter === 'all' ? styles.activeTab : ''}`}
            >
              <span>All Inquiries</span>
              <span className={styles.tabBadge}>{counts.totalInquiries}</span>
            </button>

            <button
              onClick={() => { setSourceFilter('contact_page'); setCurrentPage(1); }}
              className={`${styles.tabBtn} ${sourceFilter === 'contact_page' ? styles.activeTab : ''}`}
            >
              <Mail size={14} />
              <span>Contact Page</span>
              <span className={styles.tabBadge}>{counts.contactCount}</span>
            </button>

            <button
              onClick={() => { setSourceFilter('homepage'); setCurrentPage(1); }}
              className={`${styles.tabBtn} ${sourceFilter === 'homepage' ? styles.activeTab : ''}`}
            >
              <Home size={14} />
              <span>Homepage</span>
              <span className={styles.tabBadge}>{counts.homepageCount}</span>
            </button>
          </div>

          <div className={styles.searchAndControls}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search name, email, phone, message..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.statusFilterSelect}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>

        {/* ── Bulk Actions Floating Ribbon ────────────────────────────── */}
        {selectedIds.length > 0 && (
          <div className={styles.bulkBar}>
            <div className={styles.bulkInfo}>
              <CheckCircle2 size={16} />
              <span>{selectedIds.length} inquiry selected</span>
            </div>
            <div className={styles.bulkActions}>
              <button
                onClick={() => handleBulkRead(true)}
                className={`${styles.bulkBtn} ${styles.bulkReadBtn}`}
                title="Mark selected as read"
              >
                <Check size={14} />
                <span>Mark Read</span>
              </button>
              <button
                onClick={() => handleBulkRead(false)}
                className={`${styles.bulkBtn} ${styles.bulkUnreadBtn}`}
                title="Mark selected as unread"
              >
                <Mail size={14} />
                <span>Mark Unread</span>
              </button>
              <button
                onClick={() => setDeleteConfirmTarget('bulk')}
                className={`${styles.bulkBtn} ${styles.bulkDeleteBtn}`}
                title="Delete selected inquiries"
              >
                <Trash2 size={14} />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Main Inquiries Table ────────────────────────────────────── */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.inquiryTable}>
              <thead>
                <tr>
                  <th className={styles.checkboxCol}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className={styles.tableCheckbox}
                      title="Select all on this page"
                    />
                  </th>
                  <th>Source</th>
                  <th>Customer Info</th>
                  <th>Message</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ color: '#7c3aed', margin: '0 auto 0.5rem' }} />
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading customer inquiries...</p>
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                          <MessageSquareText size={32} />
                        </div>
                        <h3 className={styles.emptyTitle}>No inquiries found</h3>
                        <p className={styles.emptySubtitle}>
                          {searchQuery || sourceFilter !== 'all' || statusFilter !== 'all'
                            ? 'Try resetting your filters or search keyword.'
                            : 'Form submissions from the Contact Page and Homepage will appear here instantly.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => {
                    const isSelected = selectedIds.includes(inq._id);
                    const isUnread = !inq.isRead;
                    const isHomeSource = inq.source === 'homepage' || inq.source === 'footer';
                    const waLink = getWhatsAppLink(inq.phone, inq.fullName);
                    const mailLink = getMailtoLink(inq.email, inq.fullName);

                    return (
                      <tr
                        key={inq._id}
                        className={`${styles.inquiryRow} ${isUnread ? styles.unreadRow : ''} ${
                          isSelected ? styles.selectedRow : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className={styles.checkboxCol}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(inq._id)}
                            className={styles.tableCheckbox}
                          />
                        </td>

                        {/* Source Badge */}
                        <td>
                          {isHomeSource ? (
                            <span className={`${styles.sourceBadge} ${styles.sourceBadgeHome}`} title="Submitted from Homepage">
                              <Home size={12} />
                              <span>Homepage</span>
                            </span>
                          ) : (
                            <span className={`${styles.sourceBadge} ${styles.sourceBadgeContact}`} title="Submitted from Contact Page">
                              <Mail size={12} />
                              <span>Contact Page</span>
                            </span>
                          )}
                        </td>

                        {/* Customer Details */}
                        <td>
                          <div className={styles.customerCell}>
                            <div className={styles.customerName}>
                              {isUnread && <span className={styles.unreadDot} title="Unread inquiry" />}
                              <span>{inq.fullName}</span>
                            </div>
                            {inq.phone && (
                              <div className={styles.customerSub}>
                                <Phone size={12} />
                                <span>{inq.phone}</span>
                              </div>
                            )}
                            {inq.email && (
                              <div className={styles.customerSub}>
                                <Mail size={12} />
                                <span>{inq.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Message & Attachment */}
                        <td>
                          <div className={styles.messageCell}>
                            <p
                              className={styles.messageSnippet}
                              onClick={() => {
                                setActiveModalInquiry(inq);
                                if (!inq.isRead) handleToggleRead(inq);
                              }}
                              title="Click to view full message"
                            >
                              {inq.message}
                            </p>
                            {inq.file && inq.file.url && (
                              <button
                                type="button"
                                className={styles.attachmentBadge}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalInquiry(inq);
                                }}
                                title="Click to view attachment"
                              >
                                <Paperclip size={12} />
                                <span>{inq.file.originalName || 'View Attachment'}</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td>
                          <div className={styles.dateCell}>
                            <span>{formatRelativeTime(inq.createdAt)}</span>
                            <span className={styles.exactDate}>
                              {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td>
                          <div className={styles.actionBtnsRow} style={{ justifyContent: 'flex-end' }}>
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.iconBtn} ${styles.waBtn}`}
                                title={`Chat with ${inq.fullName} on WhatsApp`}
                              >
                                <Phone size={15} />
                              </a>
                            )}

                            {mailLink && (
                              <a
                                href={mailLink}
                                className={`${styles.iconBtn} ${styles.mailBtn}`}
                                title={`Send Email to ${inq.email}`}
                              >
                                <Mail size={15} />
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setActiveModalInquiry(inq);
                                if (!inq.isRead) handleToggleRead(inq);
                              }}
                              className={styles.iconBtn}
                              title="View Inquiry Details"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={(e) => handleToggleRead(inq, e)}
                              className={styles.iconBtn}
                              title={inq.isRead ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {inq.isRead ? <Mail size={15} /> : <CheckCircle2 size={15} style={{ color: '#7c3aed' }} />}
                            </button>

                            <button
                              onClick={() => setDeleteConfirmTarget(inq._id)}
                              className={`${styles.iconBtn} ${styles.deleteBtn}`}
                              title="Delete Inquiry"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && inquiries.length > 0 && (
            <div className={styles.pagination}>
              <span>
                Showing {inquiries.length} of {totalItems} total inquiries
              </span>
              <div className={styles.pageControls}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={styles.pageNavBtn}
                >
                  Previous
                </button>
                <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={styles.pageNavBtn}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Detail View Modal ───────────────────────────────────────── */}
        <Modal
          isOpen={Boolean(activeModalInquiry)}
          onClose={() => setActiveModalInquiry(null)}
          title="Customer Inquiry Details"
          size="lg"
        >
          {activeModalInquiry && (
            <div className={styles.modalBody}>
              <div className={styles.modalHeaderRow}>
                <div>
                  <h3 className={styles.modalCustomerName}>{activeModalInquiry.fullName}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Received on {new Date(activeModalInquiry.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                {activeModalInquiry.source === 'homepage' || activeModalInquiry.source === 'footer' ? (
                  <span className={`${styles.sourceBadge} ${styles.sourceBadgeHome}`}>
                    <Home size={13} />
                    <span>Homepage Submission</span>
                  </span>
                ) : (
                  <span className={`${styles.sourceBadge} ${styles.sourceBadgeContact}`}>
                    <Mail size={13} />
                    <span>Contact Page Submission</span>
                  </span>
                )}
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Phone Number</span>
                  <span className={styles.modalDetailVal}>
                    {activeModalInquiry.phone || 'Not provided'}
                  </span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Email Address</span>
                  <span className={styles.modalDetailVal}>
                    {activeModalInquiry.email || 'Not provided'}
                  </span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Status</span>
                  <span className={styles.modalDetailVal} style={{ textTransform: 'capitalize' }}>
                    {activeModalInquiry.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className={styles.modalDetailItem}>
                  <span className={styles.modalDetailLabel}>Inquiry ID</span>
                  <span className={styles.modalDetailVal} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {activeModalInquiry._id}
                  </span>
                </div>
              </div>

              <div className={styles.messageBox}>
                <div className={styles.messageBoxLabel}>Customer Inquiry Message</div>
                <div className={styles.messageBoxText}>{activeModalInquiry.message}</div>
              </div>

              {activeModalInquiry.file && activeModalInquiry.file.url && (
                <div className={styles.attachmentPreviewBox}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Paperclip size={16} style={{ color: '#60a5fa' }} />
                      <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                        {activeModalInquiry.file.originalName || 'Attached File'}
                      </span>
                    </div>
                    <a
                      href={activeModalInquiry.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.actionBtn}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#2563eb', textDecoration: 'none' }}
                      download
                    >
                      <Download size={14} />
                      <span>Download File</span>
                    </a>
                  </div>

                  {activeModalInquiry.file.mimeType?.startsWith('image/') && (
                    <img
                      src={activeModalInquiry.file.url}
                      alt="Inquiry Attachment"
                      className={styles.attachmentImage}
                    />
                  )}
                </div>
              )}

              <div className={styles.modalActionFooter}>
                <div className={styles.modalLeftActions}>
                  {getWhatsAppLink(activeModalInquiry.phone, activeModalInquiry.fullName) && (
                    <a
                      href={getWhatsAppLink(activeModalInquiry.phone, activeModalInquiry.fullName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionBtn} ${styles.waBtn}`}
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', textDecoration: 'none' }}
                    >
                      <Phone size={14} />
                      <span>Reply via WhatsApp</span>
                    </a>
                  )}

                  {getMailtoLink(activeModalInquiry.email, activeModalInquiry.fullName) && (
                    <a
                      href={getMailtoLink(activeModalInquiry.email, activeModalInquiry.fullName)}
                      className={`${styles.actionBtn} ${styles.mailBtn}`}
                      style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', textDecoration: 'none' }}
                    >
                      <Mail size={14} />
                      <span>Reply via Email</span>
                    </a>
                  )}
                </div>

                <div className={styles.modalRightActions}>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleRead(activeModalInquiry)}
                  >
                    {activeModalInquiry.isRead ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setDeleteConfirmTarget(activeModalInquiry._id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Confirm Delete Modal ────────────────────────────────────── */}
        <Modal
          isOpen={Boolean(deleteConfirmTarget)}
          onClose={() => setDeleteConfirmTarget(null)}
          title="Confirm Delete"
          size="sm"
        >
          <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <p>
              Are you sure you want to delete{' '}
              <strong>
                {deleteConfirmTarget === 'bulk'
                  ? `${selectedIds.length} selected inquiries`
                  : 'this inquiry'}
              </strong>
              ?
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              This action cannot be undone. Attached files and related notifications will also be permanently removed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setDeleteConfirmTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

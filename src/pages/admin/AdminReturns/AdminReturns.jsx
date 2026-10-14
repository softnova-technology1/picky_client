import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  Download,
  ExternalLink,
  Phone,
  MessageCircle,
  Package,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  X,
  Sparkles,
  Calendar,
  Layers,
  IndianRupee,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MapPin,
  UserCheck,
  Printer,
  FileText,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import {
  RETURN_STATUS_TABS,
  RETURN_STATUS_CONFIG,
  RETURN_REASONS,
  REVERSE_COURIERS,
  REFUND_METHODS,
} from '../../../data/returnsMockData';
import { useReturnStore } from '../../../store/returnStore';
import styles from './AdminReturns.module.css';

const ADMIN = '/softpicky-sn2026';

const RETURN_PROGRESS_STEPS = [
  { key: 'pending',    label: 'Requested',   icon: Clock,        color: '#d97706', bg: '#fef3c7' },
  { key: 'approved',   label: 'Pickup',      icon: Truck,        color: '#2563eb', bg: '#dbeafe' },
  { key: 'in_transit', label: 'In-Transit',  icon: RefreshCw,    color: '#0891b2', bg: '#cffafe' },
  { key: 'inspected',  label: 'QC Passed',   icon: ShieldCheck,  color: '#059669', bg: '#d1fae5' },
  { key: 'refunded',   label: 'Refunded',    icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
];

export default function AdminReturns() {
  const { showToast } = useUiStore();
  const { returns, approveReturn, markInTransit, markInspected, processRefund, rejectReturn } = useReturnStore();

  // Expandable row state (Exact Match to AdminOrders)
  const [expandedId, setExpandedId] = useState(null);
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Filters state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 1. Approve Pickup Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [pickupCourier, setPickupCourier] = useState(REVERSE_COURIERS[0]);
  const [pickupAwb, setPickupAwb] = useState('');
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 2. Razorpay Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNote, setRefundNote] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // 3. Inspection Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [tagsIntact, setTagsIntact] = useState(true);
  const [unwornCheck, setUnwornCheck] = useState(true);
  const [packagingCheck, setPackagingCheck] = useState(true);
  const [inspectNote, setInspectNote] = useState('');

  // 4. Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Product condition does not meet 7-day return policy criteria');

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = returns.length;
    const pending = returns.filter((r) => r.status === 'pending').length;
    const inTransit = returns.filter((r) => r.status === 'in_transit' || r.status === 'approved').length;
    const refundedList = returns.filter((r) => r.status === 'refunded');
    const totalRefundAmount = refundedList.reduce((sum, r) => sum + (r.item.refundAmount || r.item.price || 0), 0);

    return {
      total,
      pending,
      inTransit,
      refundedCount: refundedList.length,
      totalRefundAmount,
    };
  }, [returns]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const map = { all: returns.length };
    RETURN_STATUS_TABS.forEach((t) => {
      if (t.key !== 'all') {
        map[t.key] = returns.filter((r) => r.status === t.key).length;
      }
    });
    return map;
  }, [returns]);

  // Filtered & Sorted list
  const filteredReturns = useMemo(() => {
    let list = [...returns];

    // Status Tab
    if (activeTab !== 'all') {
      list = list.filter((r) => r.status === activeTab);
    }

    // Reason Filter
    if (filterReason !== 'all') {
      list = list.filter((r) => r.reason === filterReason);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.orderNumber.toLowerCase().includes(q) ||
          r.customer.name.toLowerCase().includes(q) ||
          r.customer.phone.includes(q) ||
          r.item.name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'amount_high') {
      list.sort((a, b) => (b.item.refundAmount || b.item.price) - (a.item.refundAmount || a.item.price));
    }

    return list;
  }, [returns, activeTab, filterReason, searchQuery, sortBy]);

  // Handlers
  const handleOpenApprove = (ret) => {
    setSelectedReturn(ret);
    setPickupCourier(REVERSE_COURIERS[0]);
    setPickupAwb(`REV-${Date.now().toString(36).toUpperCase()}`);
    setPickupDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedReturn) return;
    approveReturn(selectedReturn.id, {
      courier: pickupCourier,
      awbNumber: pickupAwb,
      scheduledPickupDate: pickupDate,
    });
    showToast(`Return #${selectedReturn.id} approved! Reverse pickup booked with ${pickupCourier}.`, 'success');
    setApproveModalOpen(false);
  };

  const handleOpenRefund = (ret) => {
    setSelectedReturn(ret);
    setRefundAmount(ret.item.refundAmount || ret.item.price);
    setRefundNote(`Instant Refund for Order #${ret.orderNumber}`);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = () => {
    if (!selectedReturn) return;
    setIsRefunding(true);
    setTimeout(() => {
      const genRzpId = `rfnd_${Math.random().toString(36).substring(2, 12)}`;
      processRefund(selectedReturn.id, {
        refundAmount: Number(refundAmount),
        razorpayRefundId: genRzpId,
        note: refundNote,
      });
      setIsRefunding(false);
      setRefundModalOpen(false);
      showToast(`Instant Refund of ₹${refundAmount} successfully transferred via Razorpay! Ref: ${genRzpId}`, 'success');
    }, 700);
  };

  const handleOpenInspect = (ret) => {
    setSelectedReturn(ret);
    setTagsIntact(true);
    setUnwornCheck(true);
    setPackagingCheck(true);
    setInspectNote('Tags intact and fabric quality confirmed in warehouse inspection.');
    setInspectModalOpen(true);
  };

  const handleConfirmInspect = () => {
    if (!selectedReturn) return;
    markInspected(selectedReturn.id, { note: inspectNote });
    showToast(`Return #${selectedReturn.id} passed quality inspection! Ready for refund release.`, 'success');
    setInspectModalOpen(false);
  };

  const handleOpenReject = (ret) => {
    setSelectedReturn(ret);
    setRejectReason('Item does not qualify under 7-day return window guidelines.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedReturn) return;
    rejectReturn(selectedReturn.id, { rejectionReason: rejectReason });
    showToast(`Return #${selectedReturn.id} has been marked as Rejected.`, 'info');
    setRejectModalOpen(false);
  };

  const handlePrintReturnSlip = (ret) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    const statusCfg = RETURN_STATUS_CONFIG[ret.status] || RETURN_STATUS_CONFIG.pending;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Return Reverse Manifest #${ret.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; margin: 0; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 22px; font-weight: 900; color: #7c3aed; letter-spacing: -0.02em; }
            .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #f3e8ff; color: #6d28d9; font-weight: 700; font-size: 12px; text-transform: uppercase; border: 1px solid #ddd6fe; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; line-height: 1.5; }
            .card-title { font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .total-box { margin-top: 24px; padding: 16px; background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 14px; font-weight: 700; color: #4c1d95; }
            .total-val { font-size: 20px; font-weight: 900; color: #6d28d9; }
            .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
            .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #7c3aed; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 20px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">PICKY — REVERSE LOGISTICS MANIFEST</div>
              <div class="meta">Return ID: #${ret.id} • Order #${ret.orderNumber} • Date: ${new Date(ret.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <span class="badge">${statusCfg.label}</span>
            </div>
          </div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Customer & Pickup Address</div>
              <strong style="font-size: 14px; color: #0f172a;">${ret.customer.name}</strong><br/>
              Phone: ${ret.customer.phone}<br/>
              ${ret.customer.email ? 'Email: ' + ret.customer.email + '<br/>' : ''}
              Pickup Address: ${ret.customer.address || 'Standard Address'}
            </div>
            <div class="card">
              <div class="card-title">Reverse Logistics Info</div>
              Reverse Carrier: <strong>${ret.courier || 'Pending Assignment'}</strong><br/>
              Reverse AWB: <strong>${ret.awbNumber || 'Pending Generation'}</strong><br/>
              Scheduled Pickup: ${ret.scheduledPickupDate ? new Date(ret.scheduledPickupDate).toLocaleDateString() : 'N/A'}<br/>
              Destination: Picky Central Fulfillment Hub, Chennai
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Returned Item</th>
                <th>SKU / Variant</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 120px;">Refund Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>${ret.item.name}</strong><br/><small style="color: #64748b;">Reason: ${ret.reason}</small></td>
                <td>${ret.item.sku} ${ret.item.variant ? '• ' + ret.item.variant : ''}</td>
                <td style="text-align: center;">${ret.item.quantity || 1}</td>
                <td style="text-align: right;"><strong>₹${ret.item.refundAmount || ret.item.price}</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <span class="total-label">Total Refund Approved</span>
            <span class="total-val">₹${ret.item.refundAmount || ret.item.price}</span>
          </div>
          <div class="footer">
            <p>Automated Reverse Logistics Manifest generated by Picky E-Commerce Admin System.</p>
            <button class="print-btn no-print" onclick="window.print()">Print Shipping Manifest Slip</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = ['Return ID', 'Order Number', 'Date', 'Customer Name', 'Customer Phone', 'Item Name', 'Price', 'Reason', 'Status', 'Courier', 'AWB', 'Refund Status', 'Razorpay Refund ID'];
    const rows = filteredReturns.map((r) => [
      r.id,
      r.orderNumber,
      new Date(r.createdAt).toLocaleDateString(),
      `"${r.customer.name}"`,
      r.customer.phone,
      `"${r.item.name}"`,
      r.item.price,
      `"${r.reason}"`,
      r.status,
      r.courier || 'N/A',
      r.awbNumber || 'N/A',
      r.refundStatus,
      r.razorpayRefundId || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `picky-returns-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Returns report exported to CSV successfully!', 'success');
  };

  return (
    <AdminLayout title="Returns & Refunds Management">
      {/* ── 1. Top 5 Universal Metric KPI Progress Cards ── */}
      <div className={styles.kpiGrid}>
        <AdminStatCard
          title="TOTAL RETURNS"
          value={kpis.total}
          icon={<RotateCcw size={20} color="#fff" />}
          variant="purple"
          footerLabel="All Time"
          footerValue="100%"
          progress={100}
        />
        <AdminStatCard
          title="PENDING REVIEW"
          value={kpis.pending}
          icon={<Clock size={20} color="#fff" />}
          variant="amber"
          footerLabel="Action Needed"
          footerValue={`${kpis.pending} requests`}
          progress={kpis.total ? (kpis.pending / kpis.total) * 100 : 0}
        />
        <AdminStatCard
          title="REVERSE IN-TRANSIT"
          value={kpis.inTransit}
          icon={<Truck size={20} color="#fff" />}
          variant="blue"
          footerLabel="Active Pickups"
          footerValue={`${kpis.inTransit} items`}
          progress={kpis.total ? (kpis.inTransit / kpis.total) * 100 : 0}
        />
        <AdminStatCard
          title="REFUNDED ORDERS"
          value={kpis.refundedCount}
          icon={<CheckCircle2 size={20} color="#fff" />}
          variant="green"
          footerLabel="Completed"
          footerValue={`${kpis.refundedCount} done`}
          progress={kpis.total ? (kpis.refundedCount / kpis.total) * 100 : 0}
        />
        <AdminStatCard
          title="TOTAL REFUNDED"
          value={formatPrice(kpis.totalRefundAmount)}
          icon={<IndianRupee size={20} color="#fff" />}
          variant="emerald"
          footerLabel="Via Razorpay"
          footerValue="Instant"
          progress={100}
        />
      </div>

      {/* ── 2. Unified Filter & Search Control Bar ── */}
      <div className={styles.controlCard}>
        {/* Status Filter Tabs (Single clean unbroken line) */}
        <div className={styles.tabsWrap}>
          {RETURN_STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${styles.tabPill} ${isActive ? styles.tabPillActive : ''}`}
              >
                <Icon size={14} style={{ color: isActive ? '#ffffff' : tab.color }} />
                <span>{tab.label}</span>
                <span className={`${styles.tabCount} ${isActive ? styles.tabCountActive : ''}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Search & Filter Toolbar Strip */}
        <div className={styles.controlRowBottom}>
          <div className={styles.searchFilterLeft}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search Return ID, Order #, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className={styles.dividerLine} />

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Reason:</span>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className={styles.selectInput}
              >
                <option value="all">All Reasons</option>
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.selectInput}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Refund Amount</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.exportBtn}
              onClick={handleExportCSV}
              title="Export filtered returns to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Returns Table (Exact Match to AdminOrders with Expandable Accordion Rows) ── */}
      <div className={styles.tableContainer}>
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th style={{ width: '16%' }} className={styles.thCell}>RETURN ID / ORDER</th>
                <th style={{ width: '14%' }} className={styles.thCell}>CUSTOMER</th>
                <th style={{ width: '18%' }} className={styles.thCell}>RETURNED ITEM</th>
                <th style={{ width: '13%' }} className={styles.thCell}>REASON</th>
                <th style={{ width: '13%' }} className={styles.thCell}>REFUND AMOUNT</th>
                <th style={{ width: '15%' }} className={styles.thCellCenter}>STATUS</th>
                <th style={{ width: '11%' }} className={styles.thCellCenter}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <RotateCcw size={40} className={styles.emptyStateIcon} />
                    <div className={styles.emptyStateTitle}>No return requests found</div>
                    <div className={styles.emptyStateSubtitle}>Try clearing filters or search queries.</div>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret, index) => {
                  const statusCfg = RETURN_STATUS_CONFIG[ret.status] || RETURN_STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const isOpen = expandedId === ret.id;

                  return (
                    <React.Fragment key={ret.id}>
                      {/* ── Main Collapsible Row (Clean, Proportional & Fully Aligned) ── */}
                      <tr
                        className={`${styles.trRow} ${isOpen ? styles.trRowOpen : ''}`}
                        onClick={() => toggleRow(ret.id)}
                        style={{
                          cursor: 'pointer',
                          background: isOpen ? '#faf5ff' : index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderLeft: isOpen ? '3.5px solid #7c3aed' : '3.5px solid transparent',
                          borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* 1. Return ID & Order Link */}
                        <td className={styles.tdCell}>
                          <div className={styles.returnIdCol}>
                            <div className={styles.returnIdText}>{ret.id}</div>
                            <Link
                              to={`${ADMIN}/orders/${ret.orderNumber}`}
                              className={styles.orderLink}
                              onClick={(e) => e.stopPropagation()}
                              title={`View Order #${ret.orderNumber}`}
                            >
                              <span>#{ret.orderNumber}</span> <ExternalLink size={10} style={{ flexShrink: 0 }} />
                            </Link>
                            <div className={styles.dateText}>
                              <Calendar size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                              {formatDate(ret.createdAt)}
                            </div>
                          </div>
                        </td>

                        {/* 2. Customer Avatar & WhatsApp */}
                        <td className={styles.tdCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className={styles.customerAvatar}>
                              {ret.customer.name[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <div className={styles.customerName}>{ret.customer.name}</div>
                              <a
                                href={`https://wa.me/${ret.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${ret.customer.name}, regarding your return request ${ret.id} on Picky Store...`)}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={styles.whatsappBtn}
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={11} /> {ret.customer.phone}
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* 3. Returned Item */}
                        <td className={styles.tdCell}>
                          <div className={styles.itemCellWrap}>
                            <img
                              src={ret.item.image}
                              alt={ret.item.name}
                              className={styles.itemThumb}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className={styles.itemName} title={ret.item.name}>
                                {ret.item.name}
                              </div>
                              <div className={styles.itemSku}>
                                SKU: {ret.item.sku} | Qty: {ret.item.quantity || 1}
                              </div>
                              {ret.item.variant && (
                                <span className={styles.itemVariant}>
                                  {ret.item.variant}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 4. Reason Tag & Snippet */}
                        <td className={styles.tdCell}>
                          <span className={styles.reasonTag}>
                            {ret.reason}
                          </span>
                          <div className={styles.customerNoteSnippet} title={ret.customerNote}>
                            "{ret.customerNote}"
                          </div>
                        </td>

                        {/* 5. Refund Amount */}
                        <td className={styles.tdCell}>
                          <div className={styles.refundAmount}>
                            {formatPrice(ret.item.refundAmount || ret.item.price)}
                          </div>
                          {ret.refundStatus === 'completed' ? (
                            <span className={styles.refundStatusCompleted}>
                              <CheckCircle2 size={11} /> Refunded
                            </span>
                          ) : (
                            <span className={styles.refundStatusPending}>
                              Pending Release
                            </span>
                          )}
                        </td>

                        {/* 6. Status Badge (Centered with ample width, no cut-off!) */}
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

                        {/* 7. Action Accordion Toggle Button (Centered under ACTION header) */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(ret.id);
                              }}
                              className={isOpen ? styles.manageBtnActive : styles.manageBtn}
                              title={isOpen ? 'Close details drawer' : 'Open details drawer & manage return'}
                            >
                              {isOpen ? <ChevronUp size={13} /> : <ChevronsUpDown size={13} />}
                              <span>{isOpen ? 'Close' : 'Manage'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── 4. Expandable Accordion Drawer Underneath (3-Column SaaS Panel) ── */}
                      {isOpen && (
                        <tr className={styles.expandedRowTr}>
                          <td colSpan={7} className={styles.expandedColTd}>
                            <div className={styles.expandedDrawerWrap}>
                              <div className={styles.expandedGrid}>
                                {/* ── CARD 1: RETURNED ITEM & REASON DETAILS ── */}
                                <div className={styles.expandedCard}>
                                  <div>
                                    <div className={styles.cardHeader}>
                                      <h4 className={styles.cardTitle}>
                                        <Package size={16} color="#7c3aed" />
                                        Returned Product & Reason
                                      </h4>
                                      <span className={styles.badgePurple}>
                                        Qty: {ret.item.quantity || 1}
                                      </span>
                                    </div>

                                    {/* Garment details */}
                                    <div className={styles.garmentBox}>
                                      <img
                                        src={ret.item.image}
                                        alt={ret.item.name}
                                        className={styles.garmentImg}
                                      />
                                      <div className={styles.garmentMeta}>
                                        <strong className={styles.garmentName}>{ret.item.name}</strong>
                                        <div className={styles.garmentSubInfo}>
                                          <span>SKU: <strong>{ret.item.sku}</strong></span>
                                          {ret.item.variant && (
                                            <span className={styles.variantChip}>{ret.item.variant}</span>
                                          )}
                                        </div>
                                        <div className={styles.garmentPrice}>
                                          Price: <strong>{formatPrice(ret.item.price)}</strong>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Reason box with customer statement */}
                                    <div className={styles.reasonBlock}>
                                      <div className={styles.reasonLabelWrap}>
                                        <span className={styles.reasonTag}>{ret.reason}</span>
                                        <span className={styles.policyTag}>✓ 7-Day Policy Valid</span>
                                      </div>
                                      <div className={styles.customerStatement}>
                                        <span className={styles.quoteMark}>“</span>
                                        {ret.customerNote || 'No description provided by customer.'}
                                        <span className={styles.quoteMark}>”</span>
                                      </div>
                                    </div>

                                    {/* Customer uploaded proof photos */}
                                    {ret.proofImages && ret.proofImages.length > 0 && (
                                      <div className={styles.proofBlock}>
                                        <span className={styles.proofLabel}>Customer Uploaded Photos ({ret.proofImages.length})</span>
                                        <div className={styles.proofGrid}>
                                          {ret.proofImages.map((img, i) => (
                                            <img
                                              key={i}
                                              src={img}
                                              alt="Customer Proof"
                                              className={styles.proofThumb}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(img, '_blank');
                                              }}
                                              title="Click to view full photo"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Financial summary breakdown */}
                                  <div className={styles.financialBox}>
                                    <div className={styles.financialRow}>
                                      <span>Original Item Price</span>
                                      <strong>{formatPrice(ret.item.price)}</strong>
                                    </div>
                                    <div className={styles.financialRow}>
                                      <span>Reverse Logistics Fee</span>
                                      <strong style={{ color: '#16a34a' }}>FREE (Store Borne)</strong>
                                    </div>
                                    <div className={styles.financialTotalRow}>
                                      <span>Total Refund Due</span>
                                      <strong className={styles.totalRefundVal}>
                                        {formatPrice(ret.item.refundAmount || ret.item.price)}
                                      </strong>
                                    </div>
                                  </div>
                                </div>

                                {/* ── CARD 2: REVERSE LOGISTICS & PICKUP TRACKER ── */}
                                <div className={styles.expandedCard}>
                                  <div>
                                    <div className={styles.cardHeader}>
                                      <h4 className={styles.cardTitle}>
                                        <Truck size={16} color="#7c3aed" />
                                        Reverse Logistics & Tracking
                                      </h4>
                                      <span className={styles.courierBadge}>
                                        {ret.courier ? ret.courier.split(' ')[0] : 'Unassigned'}
                                      </span>
                                    </div>

                                    {/* Customer Address Details */}
                                    <div className={styles.addressBox}>
                                      <div className={styles.addressBoxHeader}>
                                        <UserCheck size={14} color="#7c3aed" />
                                        <span>Customer Pickup Address</span>
                                      </div>
                                      <strong className={styles.custAddressName}>{ret.customer.name}</strong>
                                      <p className={styles.custAddressText}>
                                        <MapPin size={13} color="#7c3aed" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                                        {ret.customer.address || '42, South Masi Street, Madurai, Tamil Nadu - 625001'}
                                      </p>
                                      <div className={styles.addressContactRow}>
                                        <a
                                          href={`https://wa.me/${ret.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${ret.customer.name}, regarding your return request ${ret.id} on Picky Store...`)}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className={styles.whatsappPill}
                                        >
                                          <MessageCircle size={12} /> WhatsApp: {ret.customer.phone}
                                        </a>
                                        <a
                                          href={`tel:${ret.customer.phone}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className={styles.phonePill}
                                        >
                                          <Phone size={12} /> Call Customer
                                        </a>
                                      </div>
                                    </div>

                                    {/* Courier & AWB Tracking Info */}
                                    <div className={styles.trackingInfoBox}>
                                      <div className={styles.trackingRow}>
                                        <span className={styles.trackingKey}>Courier Partner:</span>
                                        <strong className={styles.trackingVal}>
                                          {ret.courier || 'Pending Admin Assignment'}
                                        </strong>
                                      </div>
                                      <div className={styles.trackingRow}>
                                        <span className={styles.trackingKey}>Reverse AWB:</span>
                                        <strong className={styles.trackingVal}>
                                          {ret.awbNumber ? (
                                            <span style={{ fontFamily: 'monospace', color: '#1d4ed8' }}>{ret.awbNumber}</span>
                                          ) : (
                                            <span style={{ color: '#94a3b8' }}>Auto-generated on approval</span>
                                          )}
                                        </strong>
                                      </div>
                                      <div className={styles.trackingRow}>
                                        <span className={styles.trackingKey}>Scheduled Date:</span>
                                        <strong className={styles.trackingVal}>
                                          {ret.scheduledPickupDate ? formatDate(ret.scheduledPickupDate) : 'Not scheduled yet'}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Reverse Logistics Stepper Pipeline */}
                                  <div className={styles.progressStepperBox}>
                                    <div className={styles.stepperHeader}>
                                      <span className={styles.stepperLabel}>Reverse Pipeline Status</span>
                                      <span className={styles.stepperStepCounter}>
                                        {ret.status === 'rejected'
                                          ? 'Rejected'
                                          : `Step ${Math.min(5, Math.max(1, ['pending', 'approved', 'in_transit', 'inspected', 'refunded'].indexOf(ret.status) + 1))} of 5`}
                                      </span>
                                    </div>

                                    <div className={styles.stepperContainer}>
                                      {/* Connector track line behind circles */}
                                      <div className={styles.stepperTrackLine}>
                                        <div
                                          className={styles.stepperTrackFill}
                                          style={{
                                            width: (() => {
                                              if (ret.status === 'rejected') return '0%';
                                              const stepOrder = ['pending', 'approved', 'in_transit', 'inspected', 'refunded'];
                                              const idx = stepOrder.indexOf(ret.status);
                                              if (idx <= 0) return '0%';
                                              return `${(idx / 4) * 100}%`;
                                            })(),
                                          }}
                                        />
                                      </div>

                                      {/* 5 Step Nodes */}
                                      <div className={styles.stepperStepsRow}>
                                        {RETURN_PROGRESS_STEPS.map((step) => {
                                          const stepOrder = ['pending', 'approved', 'in_transit', 'inspected', 'refunded'];
                                          const currentIdx = stepOrder.indexOf(ret.status);
                                          const stepIdx = stepOrder.indexOf(step.key);
                                          const isDone = ret.status !== 'rejected' && stepIdx <= currentIdx;
                                          const isCurrent = stepIdx === currentIdx;
                                          const StepIcon = step.icon;

                                          return (
                                            <div key={step.key} className={styles.stepperStepItem}>
                                              <div
                                                className={styles.stepperCircle}
                                                style={{
                                                  background: isCurrent ? step.color : isDone ? step.bg : '#ffffff',
                                                  border: `2px solid ${isCurrent ? step.color : isDone ? step.color : '#cbd5e1'}`,
                                                  boxShadow: isCurrent ? `0 0 0 3px ${step.color}25` : 'none',
                                                }}
                                              >
                                                <StepIcon
                                                  size={12}
                                                  color={isCurrent ? '#ffffff' : isDone ? step.color : '#94a3b8'}
                                                  style={{ flexShrink: 0 }}
                                                />
                                              </div>
                                              <span
                                                className={styles.stepperNodeText}
                                                style={{
                                                  color: isCurrent ? step.color : isDone ? '#0f172a' : '#94a3b8',
                                                  fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                                                }}
                                              >
                                                {step.label}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {ret.status === 'rejected' && (
                                      <div className={styles.rejectedStepperNotice}>
                                        <XCircle size={14} color="#dc2626" />
                                        <span>Return request was rejected</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* ── CARD 3: DECISION ACTIONS & INSTANT SETTLEMENT ── */}
                                <div className={styles.expandedCard}>
                                  <div>
                                    <div className={styles.cardHeader}>
                                      <h4 className={styles.cardTitle}>
                                        <RotateCcw size={16} color="#7c3aed" />
                                        Return Actions & Settlement
                                      </h4>
                                      <span
                                        className={styles.statusPillSmall}
                                        style={{
                                          background: statusCfg.bg,
                                          color: statusCfg.color,
                                          border: `1px solid ${statusCfg.border}`,
                                        }}
                                      >
                                        <StatusIcon size={12} />
                                        {statusCfg.label}
                                      </span>
                                    </div>

                                    {/* Action State Helper Banner */}
                                    <div className={styles.actionStateBox}>
                                      {ret.status === 'pending' && (
                                        <div className={styles.alertWarning}>
                                          <Clock size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>Awaiting Admin Review</strong>
                                            <p>Customer requested return. Verify the reason note, then assign courier partner for reverse pickup.</p>
                                          </div>
                                        </div>
                                      )}
                                      {ret.status === 'approved' && (
                                        <div className={styles.alertInfo}>
                                          <Truck size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>Pickup Scheduled with {ret.courier}</strong>
                                            <p>When the delivery executive picks up the package from customer, mark it In-Transit.</p>
                                          </div>
                                        </div>
                                      )}
                                      {ret.status === 'in_transit' && (
                                        <div className={styles.alertCyan}>
                                          <RefreshCw size={16} color="#0891b2" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>In-Transit to Warehouse</strong>
                                            <p>Package is en-route via {ret.courier}. Once received at warehouse, verify product condition.</p>
                                          </div>
                                        </div>
                                      )}
                                      {ret.status === 'inspected' && (
                                        <div className={styles.alertSuccess}>
                                          <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>Quality Inspection Passed</strong>
                                            <p>Tags and unworn condition verified. Ready to release instant Razorpay refund to customer.</p>
                                          </div>
                                        </div>
                                      )}
                                      {ret.status === 'refunded' && (
                                        <div className={styles.alertSuccess}>
                                          <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>Refund 100% Settled</strong>
                                            <p>₹{ret.item.refundAmount || ret.item.price} credited to customer via Razorpay Gateway.</p>
                                          </div>
                                        </div>
                                      )}
                                      {ret.status === 'rejected' && (
                                        <div className={styles.alertDanger}>
                                          <XCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <div>
                                            <strong>Return Request Rejected</strong>
                                            <p>{ret.rejectionReason || 'Item does not qualify under Picky return guidelines.'}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Controls based on status */}
                                    <div className={styles.actionControls}>
                                      {ret.status === 'pending' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenApprove(ret);
                                            }}
                                            className={styles.btnApproveFull}
                                          >
                                            <Truck size={15} /> Approve & Schedule Reverse Pickup
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenReject(ret);
                                            }}
                                            className={styles.btnRejectFull}
                                          >
                                            <X size={14} /> Reject Return Request
                                          </button>
                                        </div>
                                      )}

                                      {ret.status === 'approved' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              markInTransit(ret.id);
                                              showToast(`Return #${ret.id} marked as In-Transit.`, 'info');
                                            }}
                                            className={styles.btnInTransitFull}
                                          >
                                            <RefreshCw size={15} /> Mark In-Transit (Courier Picked Up)
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePrintReturnSlip(ret);
                                            }}
                                            className={styles.btnSecondaryFull}
                                          >
                                            <Printer size={14} /> Print Reverse Shipping Slip
                                          </button>
                                        </div>
                                      )}

                                      {ret.status === 'in_transit' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenInspect(ret);
                                            }}
                                            className={styles.btnInspectFull}
                                          >
                                            <ShieldCheck size={15} /> Receive & Conduct Quality Inspection
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePrintReturnSlip(ret);
                                            }}
                                            className={styles.btnSecondaryFull}
                                          >
                                            <Printer size={14} /> Print Return Manifest
                                          </button>
                                        </div>
                                      )}

                                      {ret.status === 'inspected' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenRefund(ret);
                                            }}
                                            className={styles.btnRefundFull}
                                          >
                                            <CreditCard size={15} /> Release Instant Razorpay Refund ({formatPrice(ret.item.refundAmount || ret.item.price)})
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePrintReturnSlip(ret);
                                            }}
                                            className={styles.btnSecondaryFull}
                                          >
                                            <Printer size={14} /> Print Inspection Certificate
                                          </button>
                                        </div>
                                      )}

                                      {ret.status === 'refunded' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <div className={styles.refundSuccessSummary}>
                                            <div className={styles.rfRow}>
                                              <span>Razorpay Refund ID</span>
                                              <code>{ret.razorpayRefundId || 'rfnd_auto_synced'}</code>
                                            </div>
                                            <div className={styles.rfRow}>
                                              <span>Refund Amount</span>
                                              <strong>{formatPrice(ret.item.refundAmount || ret.item.price)}</strong>
                                            </div>
                                            <div className={styles.rfRow}>
                                              <span>Settlement Status</span>
                                              <span className={styles.rfDonePill}>✓ 100% Settled</span>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePrintReturnSlip(ret);
                                            }}
                                            className={styles.btnSecondaryFull}
                                          >
                                            <Printer size={14} /> Print Settlement Slip
                                          </button>
                                        </div>
                                      )}

                                      {ret.status === 'rejected' && (
                                        <div className={styles.actionBtnsStacked}>
                                          <div className={styles.rejectionReasonBox}>
                                            <span className={styles.rrTitle}>Rejection Reason:</span>
                                            <p className={styles.rrText}>{ret.rejectionReason || 'Item does not meet return policy criteria.'}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenApprove(ret);
                                            }}
                                            className={styles.btnSecondaryFull}
                                          >
                                            <RotateCcw size={14} /> Re-Evaluate & Approve
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Footer utility links */}
                                  <div className={styles.cardFooterUtils}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedReturn(ret);
                                        setDetailModalOpen(true);
                                      }}
                                      className={styles.ghostLinkBtn}
                                    >
                                      <Eye size={13} /> View Audit History Modal
                                    </button>
                                    <Link
                                      to={`${ADMIN}/orders/${ret.orderNumber}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className={styles.ghostLinkBtn}
                                    >
                                      <ExternalLink size={13} /> Go to Original Order #{ret.orderNumber}
                                    </Link>
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

        {/* ── MODAL 1: Approve Pickup & Book Reverse Logistics ── */}
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title="Approve Return & Book Reverse Logistics"
        >
          {selectedReturn && (
            <div>
              <p className={styles.modalDesc}>
                Schedule reverse pickup from customer for <strong>{selectedReturn.item.name}</strong>.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Select Reverse Courier Partner
                </label>
                <select
                  value={pickupCourier}
                  onChange={(e) => setPickupCourier(e.target.value)}
                  className={styles.selectFull}
                >
                  {REVERSE_COURIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Reverse Tracking AWB Number
                </label>
                <input
                  type="text"
                  value={pickupAwb}
                  onChange={(e) => setPickupAwb(e.target.value)}
                  placeholder="e.g. DEL-REV-982143098"
                  className={styles.inputControl}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.formLabel}>
                  Scheduled Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={styles.inputControl}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmApprove}>
                  <Truck size={15} /> Confirm Reverse Pickup
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── MODAL 2: 1-Click Razorpay Refund Trigger ── */}
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title="Process Razorpay Instant Refund"
        >
          {selectedReturn && (
            <div>
              <div className={styles.inspectionBanner}>
                <div className={styles.inspectionBannerTitle}>
                  <ShieldCheck size={18} /> Verified Quality Inspection
                </div>
                <p className={styles.inspectionBannerDesc}>
                  Garment condition passed warehouse inspection. Ready to release payment to customer.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className={styles.inputControl}
                  style={{ fontWeight: 700, fontSize: '0.95rem' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Refund Destination
                </label>
                <div className={styles.originalSourceBox}>
                  💳 Original Payment Source (Razorpay UPI / Bank / Card)
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.formLabel}>
                  Audit Note
                </label>
                <input
                  type="text"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className={styles.inputControl}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setRefundModalOpen(false)}>Cancel</Button>
                <Button variant="primary" loading={isRefunding} onClick={handleConfirmRefund} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
                  <CreditCard size={15} /> Release ₹{refundAmount} Refund ➔
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── MODAL 3: Warehouse Quality Inspection ── */}
        <Modal
          isOpen={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title="Warehouse Quality Inspection Checklist"
        >
          {selectedReturn && (
            <div>
              <p className={styles.modalDesc}>
                Verify standard checklist criteria before approving customer refund for <strong>{selectedReturn.item.name}</strong>.
              </p>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={tagsIntact} onChange={(e) => setTagsIntact(e.target.checked)} className={styles.checkboxInput} />
                  <span>Original brand tags & price labels are intact and untampered</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={unwornCheck} onChange={(e) => setUnwornCheck(e.target.checked)} className={styles.checkboxInput} />
                  <span>Item is unworn, unwashed, and free of stains or perfume odors</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={packagingCheck} onChange={(e) => setPackagingCheck(e.target.checked)} className={styles.checkboxInput} />
                  <span>Returned in original packaging / polybag with invoice copy</span>
                </label>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.formLabel}>
                  Inspector Remarks
                </label>
                <input
                  type="text"
                  value={inspectNote}
                  onChange={(e) => setInspectNote(e.target.value)}
                  className={styles.inputControl}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setInspectModalOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  disabled={!tagsIntact || !unwornCheck || !packagingCheck}
                  onClick={handleConfirmInspect}
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  <ShieldCheck size={15} /> Pass Inspection & Enable Refund
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── MODAL 4: Reject Return ── */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Customer Return Request"
        >
          {selectedReturn && (
            <div>
              <p className={styles.modalDesc}>
                Please specify the reason for rejecting return #{selectedReturn.id}. This note will be sent to customer support.
              </p>

              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.formLabel}>
                  Rejection Reason / Justification
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={styles.textareaControl}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmReject} style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                  <XCircle size={15} /> Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── MODAL 5: Full Return Details & Timeline ── */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={selectedReturn ? `Return Request: #${selectedReturn.id}` : 'Return Details'}
        >
          {selectedReturn && (
            <div>
              <div className={styles.detailGrid}>
                <div>
                  <div className={styles.detailLabel}>Customer</div>
                  <div className={styles.detailVal}>{selectedReturn.customer.name}</div>
                  <div className={styles.detailSub}>{selectedReturn.customer.phone}</div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Linked Order</div>
                  <div className={styles.detailVal} style={{ color: '#7c3aed' }}>#{selectedReturn.orderNumber}</div>
                  <div className={styles.detailSub}>Refund: {formatPrice(selectedReturn.item.refundAmount || selectedReturn.item.price)}</div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Reverse Courier</div>
                  <div className={styles.detailVal}>{selectedReturn.courier || 'Pending'}</div>
                  <div className={styles.detailSub} style={{ color: '#2563eb' }}>{selectedReturn.awbNumber || 'No AWB'}</div>
                </div>
              </div>

              {/* Customer Note */}
              <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                <div className={styles.detailLabel} style={{ marginBottom: '0.35rem' }}>
                  CUSTOMER REASON & REMARKS
                </div>
                <div className={styles.detailCustomerNote}>
                  "{selectedReturn.customerNote}"
                </div>
              </div>

              {/* Timeline Stepper */}
              <div>
                <div className={styles.detailLabel} style={{ marginBottom: '0.75rem' }}>
                  ACTIVITY & AUDIT TIMELINE
                </div>
                <div className={styles.timelineWrapper}>
                  {selectedReturn.timeline.map((step, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineNote}>{step.note}</div>
                        <div className={styles.timelineDate}>{formatDate(step.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
    </AdminLayout>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Percent,
  Sparkles,
  Truck,
  Search,
  Filter,
  Download,
  ExternalLink,
  RotateCcw,
  ChevronUp,
  ChevronsUpDown,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  User,
  IndianRupee,
  Trash2,
  Check,
  Package,
  Tag,
  Edit3,
  Zap,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useUiStore } from '../../../store/uiStore';
import { useAbandonedCartStore } from '../../../store/abandonedCartStore';
import { formatPrice } from '../../../utils/formatPrice';
import styles from './AdminAbandonedCarts.module.css';

const ADMIN = '/softpicky-sn2026';

// Status Tabs Configuration
const CART_STATUS_TABS = [
  { key: 'all',       label: 'All Carts',       icon: ShoppingCart, color: '#7c3aed' },
  { key: 'pending',   label: 'Pending Alert',   icon: Clock,        color: '#d97706' },
  { key: 'sent',      label: 'Alert Sent',      icon: Send,         color: '#2563eb' },
  { key: 'recovered', label: 'Recovered',       icon: CheckCircle2, color: '#16a34a' },
  { key: 'expired',   label: 'Expired',         icon: XCircle,      color: '#64748b' },
];

// Status Badges & Styling Configuration
const CART_STATUS_CONFIG = {
  pending: {
    label: 'Pending Alert',
    icon: Clock,
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
  },
  sent: {
    label: 'Alert Sent',
    icon: Send,
    bg: '#eff6ff',
    color: '#2563eb',
    border: '#bfdbfe',
  },
  recovered: {
    label: 'Recovered Order',
    icon: CheckCircle2,
    bg: '#ecfdf5',
    color: '#059669',
    border: '#a7f3d0',
  },
  partial_recovery: {
    label: 'Partial Recovered',
    icon: CheckCircle2,
    bg: '#f0fdf4',
    color: '#059669',
    border: '#bbf7d0',
  },
  expired: {
    label: 'Expired Cart',
    icon: XCircle,
    bg: '#f8fafc',
    color: '#64748b',
    border: '#e2e8f0',
  },
};

// WhatsApp Recovery Message Templates
const RECOVERY_TEMPLATES = [
  {
    id: 'tpl_discount_5',
    name: 'Special 5% Comeback Discount (Highest Conversion)',
    icon: Percent,
    badge: 'Recommended',
    badgeColor: '#059669',
    discountCode: 'COMEBACK5',
    message: (customerName, itemsText, checkoutUrl) =>
      `Vanakkam ${customerName}! 🛍️\n\nWe noticed you left some authentic handcrafted favorites in your Picky bag:\n${itemsText}\n\nTo make your shopping extra sweet, here is an exclusive 5% OFF coupon just for you: *COMEBACK5*\n\nTap below to complete your order before stock runs out:\n${checkoutUrl}\n\nNeed help? Reply to this message anytime! - Picky Official Team`,
  },
  {
    id: 'tpl_gentle_reminder',
    name: 'Gentle Reminder (No Discount)',
    icon: Clock,
    badge: 'Standard',
    badgeColor: '#2563eb',
    discountCode: null,
    message: (customerName, itemsText, checkoutUrl) =>
      `Hello ${customerName}! 👋\n\nYour selected handcrafted treasures are waiting for you at Picky:\n${itemsText}\n\nOur artisans pack each order fresh. Tap here to continue your secure checkout:\n${checkoutUrl}\n\nHappy Shopping! - Picky Store`,
  },
  {
    id: 'tpl_free_shipping',
    name: 'Free Express Shipping Upgrade',
    icon: Truck,
    badge: 'Express',
    badgeColor: '#7c3aed',
    discountCode: 'FREEDELIVERY',
    message: (customerName, itemsText, checkoutUrl) =>
      `Vanakkam ${customerName}! 🚚\n\nComplete your Picky order today and get *FREE Express Priority Delivery* to your doorstep!\n\nYour items:\n${itemsText}\n\nUse Code: *FREEDELIVERY* at checkout:\n${checkoutUrl}\n\nHave questions? Chat with our live store representative right here.`,
  },
  {
    id: 'tpl_custom_offer',
    name: '✍️ Manual Offer & Direct Template Editor',
    icon: Edit3,
    badge: 'Direct Editor',
    badgeColor: '#059669',
    discountCode: 'SAVE15',
    isCustom: true,
    message: (customerName, itemsText, checkoutUrl) =>
      `Vanakkam ${customerName}! 🛍️\n\nWe noticed you left handcrafted treasures in your Picky bag:\n${itemsText}\n\nHere is an exclusive offer just for you: *15% SPECIAL DISCOUNT* using coupon code *SAVE15*!\n\nTap below to complete your order before stock runs out:\n${checkoutUrl}\n\nNeed assistance? Chat with our live store representative right here! - Picky Official Team`,
  },
];


// Helper: Extract all purchased / won-back products from cart history or cart.purchasedItems
export const getPurchasedItemsForCart = (cart) => {
  if (!cart) return [];
  if (Array.isArray(cart.purchasedItems) && cart.purchasedItems.length > 0) {
    return cart.purchasedItems;
  }
  const list = [];
  const timeline = cart.timeline || [];
  for (const step of timeline) {
    if (step.event && step.event.startsWith('Converted') && step.note) {
      const orderMatch = step.note.match(/Order #([^\s|]+)/i);
      const orderNumber = orderMatch ? orderMatch[1] : (cart.recoveredOrderNumber || 'WON-BACK');
      const timeMatch = step.note.match(/Time:\s*([^|]+)/i);
      const timeStr = timeMatch ? timeMatch[1].trim() : (step.timestamp ? new Date(step.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');

      const prodRegex = /"([^"]+)"\s*\(([^,]+),\s*Qty:\s*(\d+)\)/g;
      let m;
      while ((m = prodRegex.exec(step.note)) !== null) {
        list.push({
          name: m[1],
          priceFormatted: m[2],
          quantity: m[3],
          orderNumber,
          time: timeStr,
          timestamp: step.timestamp,
        });
      }
    }
  }
  return list;
};

export default function AdminAbandonedCarts() {
  const { showToast } = useUiStore();
  const {
    carts,
    loading,
    fetchCarts,
    sendRecoveryAlert,
    markAsRecovered,
    revertConversion,
    deleteTimelineEntry,
    markAsExpired,
    deleteCart,
    bulkSendAlerts,
  } = useAbandonedCartStore();

  useEffect(() => {
    try {
      localStorage.removeItem('picky_admin_abandoned_carts_v1');
    } catch (_) {}
    fetchCarts();

    // Live auto-polling every 25 seconds when tab is visible for real-time customer cart synchronization
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchCarts(true);
      }
    }, 25000);

    return () => clearInterval(timer);
  }, [fetchCarts]);

  // Accordion drawer state
  const [expandedId, setExpandedId] = useState(null);
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Filters state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected recovery template per cart in drawer
  const [selectedTemplates, setSelectedTemplates] = useState({});

  // Direct editable message state per cart in drawer: { [cartId]: { text: string, isSaved: boolean } }
  const [editableMessages, setEditableMessages] = useState({});

  // Track if manual template is in edit mode vs preview mode: { [cartId]: boolean }
  const [isEditingMessage, setIsEditingMessage] = useState({});

  // 🎯 Single & Multi targeted product selection per cart:
  // { [cartId]: string[] } (Array of selected SKUs, or empty if all items)
  const [selectedProductsPerCart, setSelectedProductsPerCart] = useState({});

  // 🔲 Main table multi-cart selection state: array of cart IDs
  const [selectedCartIds, setSelectedCartIds] = useState([]);

  const toggleProductSelection = (cartId, sku) => {
    setSelectedProductsPerCart((prev) => {
      const currentList = prev[cartId] || [];
      let nextList;
      if (currentList.includes(sku)) {
        nextList = currentList.filter((s) => s !== sku);
      } else {
        nextList = [...currentList, sku];
      }
      setEditableMessages((msgs) => {
        const copy = { ...msgs };
        delete copy[cartId];
        return copy;
      });
      return {
        ...prev,
        [cartId]: nextList,
      };
    });
  };

  const selectOnlyOneProduct = (cartId, sku, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedProductsPerCart((prev) => {
      const currentList = prev[cartId] || [];
      const nextList = currentList.length === 1 && currentList[0] === sku ? [] : [sku];
      setEditableMessages((msgs) => {
        const copy = { ...msgs };
        delete copy[cartId];
        return copy;
      });
      return {
        ...prev,
        [cartId]: nextList,
      };
    });
  };

  const toggleSelectAllProducts = (cartId, allSkus) => {
    setSelectedProductsPerCart((prev) => {
      const currentList = prev[cartId] || [];
      const nextList = currentList.length === allSkus.length ? [] : [...allSkus];
      setEditableMessages((msgs) => {
        const copy = { ...msgs };
        delete copy[cartId];
        return copy;
      });
      return {
        ...prev,
        [cartId]: nextList,
      };
    });
  };

  const isCartEditing = (cartId) => {
    if (isEditingMessage[cartId] !== undefined) {
      return isEditingMessage[cartId];
    }
    return true;
  };

  // Helper: Get items to include in WhatsApp message
  const getItemsForCartMessage = (cart) => {
    const selectedSkus = selectedProductsPerCart[cart.id];
    if (selectedSkus && selectedSkus.length > 0) {
      const filtered = cart.items.filter((i) => selectedSkus.includes(i.sku));
      return filtered.length > 0 ? filtered : cart.items;
    }
    return cart.items;
  };

  // Helper: Format items list for WhatsApp
  const formatItemsForWhatsApp = (cart) => {
    const items = getItemsForCartMessage(cart);
    return items.map((i) => `• ${i.name} (Qty: ${i.quantity}) - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
  };

  // Helper: Generate initial full template text for a cart
  const getInitialTemplateMessage = (cart, tplId = 'tpl_discount_5') => {
    const items = getItemsForCartMessage(cart);
    const itemsText = formatItemsForWhatsApp(cart);
    const isSingle = items.length === 1;
    const isSubset = items.length < cart.items.length;
    const itemsQuery = isSingle
      ? `&item=${items[0].sku}`
      : isSubset
      ? `&items=${items.map((i) => i.sku).join(',')}`
      : '';

    if (tplId === 'tpl_discount_5') {
      const checkoutUrl = `https://picky.store/checkout?cart=${cart.id}${itemsQuery}&coupon=COMEBACK5`;
      const lead = isSingle
        ? `We noticed you left this authentic handcrafted favorite in your Picky bag:\n${itemsText}`
        : `We noticed you left these authentic handcrafted favorites in your Picky bag:\n${itemsText}`;
      return `Vanakkam ${cart.customer.name}! 🛍️\n\n${lead}\n\nTo make your shopping extra sweet, here is an exclusive 5% OFF coupon just for you: *COMEBACK5*\n\nTap below to complete your order before stock runs out:\n${checkoutUrl}\n\nNeed help? Reply to this message anytime! - Picky Official Team`;
    }

    if (tplId === 'tpl_gentle_reminder') {
      const checkoutUrl = `https://picky.store/checkout?cart=${cart.id}${itemsQuery}`;
      const lead = isSingle
        ? `Your selected handcrafted treasure is waiting for you at Picky:\n${itemsText}`
        : `Your selected handcrafted treasures are waiting for you at Picky:\n${itemsText}`;
      return `Hello ${cart.customer.name}! 👋\n\n${lead}\n\nOur artisans pack each order fresh. Tap here to continue your secure checkout:\n${checkoutUrl}\n\nHappy Shopping! - Picky Store`;
    }

    if (tplId === 'tpl_free_shipping') {
      const checkoutUrl = `https://picky.store/checkout?cart=${cart.id}${itemsQuery}&coupon=FREEDELIVERY`;
      return `Vanakkam ${cart.customer.name}! 🚚\n\nComplete your Picky order today and get *FREE Express Priority Delivery* to your doorstep!\n\nYour item${items.length > 1 ? 's' : ''}:\n${itemsText}\n\nUse Code: *FREEDELIVERY* at checkout:\n${checkoutUrl}\n\nHave questions? Chat with our live store representative right here.`;
    }

    // Default for Manual / Custom Offer:
    const checkoutUrl = `https://picky.store/checkout?cart=${cart.id}${itemsQuery}&coupon=SAVE15`;
    const lead = isSingle
      ? `We noticed you left this handcrafted treasure in your Picky bag:\n${itemsText}`
      : `We noticed you left handcrafted treasures in your Picky bag:\n${itemsText}`;
    return `Vanakkam ${cart.customer.name}! 🛍️\n\n${lead}\n\nHere is an exclusive offer just for you: *15% SPECIAL DISCOUNT* using coupon code *SAVE15*!\n\nTap below to complete your order before stock runs out:\n${checkoutUrl}\n\nNeed assistance? Chat with our live store representative right here! - Picky Official Team`;
  };

  // Get current message text for cart
  const getCartMessageText = (cart, tplId = 'tpl_discount_5') => {
    if (editableMessages[cart.id]?.text !== undefined) {
      return editableMessages[cart.id].text;
    }
    return getInitialTemplateMessage(cart, tplId);
  };

  // Update text while typing
  const handleUpdateMessageText = (cartId, newText) => {
    setEditableMessages((prev) => ({
      ...prev,
      [cartId]: {
        text: newText,
        isSaved: false,
      },
    }));
  };

  // Save text explicitly and switch to preview mode
  const handleSaveMessageText = (cartId) => {
    setEditableMessages((prev) => ({
      ...prev,
      [cartId]: {
        text: prev[cartId]?.text !== undefined ? prev[cartId].text : '',
        isSaved: true,
      },
    }));
    setIsEditingMessage((prev) => ({
      ...prev,
      [cartId]: false, // Switch to preview mode!
    }));
    showToast('Template saved! Showing preview below.', 'success');
  };

  // Reset to original default text
  const handleResetMessageText = (cart, tplId) => {
    const initial = getInitialTemplateMessage(cart, tplId);
    setEditableMessages((prev) => ({
      ...prev,
      [cart.id]: {
        text: initial,
        isSaved: false,
      },
    }));
    showToast('Reset back to original template!', 'info');
  };

  // ─── KPI Metrics ───
  const kpis = useMemo(() => {
    const total = carts.length;
    const recoveredCount = carts.filter((c) => c.status === 'recovered' || c.status === 'partial_recovery' || (c.recoveredAmount && c.recoveredAmount > 0)).length;
    const recoveredRevenue = carts.reduce((acc, c) => {
      if (c.recoveredAmount && c.recoveredAmount > 0) return acc + c.recoveredAmount;
      if (c.status === 'recovered') return acc + c.totalAmount;
      return acc;
    }, 0);
    const totalCartValue = carts.reduce((acc, c) => acc + c.totalAmount, 0);
    const lostRevenue = Math.max(0, totalCartValue - recoveredRevenue);
    const recoveryRate = totalCartValue > 0 ? ((recoveredRevenue / totalCartValue) * 100).toFixed(1) : '0.0';
    const pendingAlerts = carts.filter((c) => c.status === 'pending').length;

    return { total, recoveredCount, recoveredRevenue, lostRevenue, recoveryRate, pendingAlerts };
  }, [carts]);

  // ─── Filter & Search Logic ───
  const filteredCarts = useMemo(() => {
    return carts
      .filter((c) => {
        // Tab filtering
        if (activeTab === 'pending' && c.status !== 'pending') return false;
        if (activeTab === 'sent' && c.status !== 'sent') return false;
        if (activeTab === 'recovered' && c.status !== 'recovered' && c.status !== 'partial_recovery' && !(c.recoveredAmount > 0)) return false;
        if (activeTab === 'expired' && c.status !== 'expired') return false;

        // Search filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCustomer = c.customer.name.toLowerCase().includes(q) || c.customer.phone.includes(q) || c.customer.email.toLowerCase().includes(q);
          const matchId = c.id.toLowerCase().includes(q);
          const matchProduct = c.items.some((item) => item.name.toLowerCase().includes(q));
          if (!matchCustomer && !matchId && !matchProduct) return false;
        }

        // Cart Value filtering
        if (filterValue === 'under1k' && c.totalAmount >= 1000) return false;
        if (filterValue === '1k-3k' && (c.totalAmount < 1000 || c.totalAmount > 3000)) return false;
        if (filterValue === 'above3k' && c.totalAmount <= 3000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'highest') return b.totalAmount - a.totalAmount;
        if (sortBy === 'lowest') return a.totalAmount - b.totalAmount;
        return 0;
      });
  }, [carts, activeTab, searchQuery, filterValue, sortBy]);

  // ─── 1-Click WhatsApp Trigger ───
  const handleLaunchWhatsApp = (cart, e) => {
    if (e) e.stopPropagation();

    const templateId = selectedTemplates[cart.id] || RECOVERY_TEMPLATES[0].id;
    const template = RECOVERY_TEMPLATES.find((t) => t.id === templateId) || RECOVERY_TEMPLATES[0];

    const cleanPhone = cart.customer.phone.replace(/\D/g, '');
    const messageToSend = getCartMessageText(cart, templateId);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageToSend)}`;

    // Open WhatsApp Web
    window.open(whatsappUrl, '_blank');

    // Update state
    sendRecoveryAlert(cart.id, {
      templateName: template.isCustom ? 'Custom Direct Edited Template' : template.name,
      discountCode: template.discountCode || 'CUSTOM',
      channel: 'WhatsApp',
    });

    showToast(`WhatsApp recovery alert dispatched to ${cart.customer.name}!`, 'success');
  };

  // Mark as Recovered (Full or Single/Selected Product)
  const handleMarkRecovered = (cartId, e, specificSku = null) => {
    if (e) e.stopPropagation();
    const cart = carts.find((c) => c.id === cartId || c._id === cartId);
    if (!cart) return;

    let targetItems = [];
    let targetSkus = null;

    if (specificSku) {
      targetSkus = [specificSku];
      const match = cart.items.find((i) => i.sku === specificSku || i.name === specificSku);
      if (match) targetItems = [match];
    } else {
      const selectedSkus = selectedProductsPerCart[cartId] || [];
      if (selectedSkus.length > 0 && selectedSkus.length < cart.items.length) {
        targetSkus = selectedSkus;
        targetItems = cart.items.filter((i) => selectedSkus.includes(i.sku) || selectedSkus.includes(i.name));
      } else {
        targetItems = cart.items.filter((i) => !(cart.recoveredProducts || []).includes(i.sku) && !(cart.recoveredProducts || []).includes(i.name));
        if (targetItems.length === 0) targetItems = cart.items;
        targetSkus = targetItems.map((i) => i.sku);
      }
    }

    markAsRecovered(cartId, null, {
      convertedProducts: targetSkus,
      convertedItems: targetItems,
    });

    if (targetItems.length === 1) {
      showToast(`Product "${targetItems[0]?.name || 'Item'}" marked as Converted!`, 'success');
    } else if (targetItems.length > 1) {
      showToast(`${targetItems.length} products marked as Converted!`, 'success');
    } else {
      showToast('Items marked as Converted Order!', 'success');
    }
  };

  // Remove / Revert Converted Status (Single Product or All)
  const handleRevertConversion = (cartId, e, specificSku = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const cart = carts.find((c) => c.id === cartId || c._id === cartId);
    if (!cart) return;

    revertConversion(cartId, { sku: specificSku });

    if (specificSku) {
      const match = cart.items.find((i) => i.sku === specificSku || i.name === specificSku);
      showToast(`Conversion removed for "${match?.name || 'Item'}"!`, 'info');
    } else {
      showToast('Conversion removed for all products!', 'info');
    }
  };

  // Delete single Timeline record from Audit & Conversion History
  const handleDeleteTimelineEntry = (cartId, index, step, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (window.confirm(`Delete this history record "${step.event}"?`)) {
      deleteTimelineEntry(cartId, {
        index,
        entryId: step._id || step.id,
        timestamp: step.timestamp,
        event: step.event,
      });
      showToast('History record removed!', 'info');
    }
  };

  // Bulk WhatsApp Broadcast
  const handleBulkBroadcast = () => {
    const pendingCartIds = carts.filter((c) => c.status === 'pending').map((c) => c.id);
    if (pendingCartIds.length === 0) {
      showToast('No pending carts to dispatch recovery alerts!', 'info');
      return;
    }
    if (window.confirm(`Dispatch automated WhatsApp recovery alerts to all ${pendingCartIds.length} pending carts?`)) {
      bulkSendAlerts(pendingCartIds, { templateName: 'Special 5% Comeback Discount', channel: 'WATI WhatsApp' });
      showToast(`Bulk recovery alerts dispatched to ${pendingCartIds.length} customer carts!`, 'success');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Cart ID,Date,Customer Name,Phone,Email,City,Total Value,Items Count,Stage,Status,Alerts Sent'];
    const rows = filteredCarts.map((c) =>
      [
        `"${c.id}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`,
        `"${c.customer.name}"`,
        `"${c.customer.phone}"`,
        `"${c.customer.email}"`,
        `"${c.customer.city}"`,
        c.totalAmount,
        c.itemCount,
        `"${c.abandonedStage}"`,
        `"${c.status}"`,
        c.alertsSentCount || 0,
      ].join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picky_abandoned_carts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported abandoned carts report as CSV', 'success');
  };

  // ─── Main Table Multi-Selection Logic ───
  const isAllSelected = filteredCarts.length > 0 && filteredCarts.every((c) => selectedCartIds.includes(c.id));
  const isIndeterminate = selectedCartIds.length > 0 && !isAllSelected && filteredCarts.some((c) => selectedCartIds.includes(c.id));

  const handleToggleCartSelect = (cartId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedCartIds((prev) =>
      prev.includes(cartId) ? prev.filter((id) => id !== cartId) : [...prev, cartId]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(filteredCarts.map((c) => c.id));
    }
  };

  // Bulk Action 1: Dispatch WhatsApp to Selected Carts
  const handleBulkWhatsAppSelected = async () => {
    const selectedList = carts.filter((c) => selectedCartIds.includes(c.id));
    if (selectedList.length === 0) return;
    for (const c of selectedList) {
      await sendRecoveryAlert(c.id, {
        templateName: 'Special 5% Comeback Discount (Highest Conversion)',
        discountCode: 'COMEBACK5',
        channel: 'WhatsApp',
      });
    }
    showToast(`Dispatched WhatsApp recovery alerts to ${selectedList.length} selected customers!`, 'success');
    setSelectedCartIds([]);
  };

  // Bulk Action 2: Mark All Selected as Recovered
  const handleBulkRecoverSelected = async () => {
    const selectedList = carts.filter((c) => selectedCartIds.includes(c.id));
    if (selectedList.length === 0) return;
    for (const c of selectedList) {
      await markAsRecovered(c.id);
    }
    showToast(`Marked ${selectedList.length} carts as Converted / Recovered! 🎉`, 'success');
    setSelectedCartIds([]);
  };

  // Bulk Action 3: Mark All Selected as Expired
  const handleBulkExpireSelected = async () => {
    const selectedList = carts.filter((c) => selectedCartIds.includes(c.id));
    if (selectedList.length === 0) return;
    for (const c of selectedList) {
      await markAsExpired(c.id);
    }
    showToast(`Marked ${selectedList.length} carts as Expired`, 'info');
    setSelectedCartIds([]);
  };

  // Bulk Action 4: Export Only Selected Carts to CSV
  const handleExportSelectedCSV = () => {
    const selectedList = carts.filter((c) => selectedCartIds.includes(c.id));
    if (selectedList.length === 0) return;
    const headers = [
      'Cart ID',
      'Created At',
      'Customer Name',
      'Phone',
      'Email',
      'City',
      'Cart Value (INR)',
      'Items Count',
      'Stage',
      'Status',
      'Alerts Sent',
    ];
    const rows = selectedList.map((c) =>
      [
        c.id,
        `"${c.abandonedAtFormatted || c.createdAt}"`,
        `"${c.customer.name}"`,
        `"${c.customer.phone}"`,
        `"${c.customer.email}"`,
        `"${c.customer.city}"`,
        c.totalAmount,
        c.itemCount,
        `"${c.abandonedStage}"`,
        `"${c.status}"`,
        c.alertsSentCount || 0,
      ].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picky_selected_carts_${selectedList.length}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`Exported ${selectedList.length} selected carts as CSV`, 'success');
  };

  return (
    <AdminLayout title="Abandoned Carts Recovery">
      {/* ─── 1. Top 5 KPI Cards ─── */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Lost Potential Revenue */}
        <div className={styles.kpiCard} style={{ borderLeft: '4px solid #ef4444' }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>At-Risk Revenue</span>
            <div className={styles.kpiIconBox} style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#dc2626' }}>
            {formatPrice(kpis.lostRevenue)}
          </div>
          <div className={styles.kpiMeta}>
            <span>Unrecovered cart total</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Sales At Risk</span>
          </div>
        </div>

        {/* KPI 2: Recovered Revenue */}
        <div className={styles.kpiCard} style={{ borderLeft: '4px solid #10b981' }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Recovered Revenue</span>
            <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: '#059669' }}>
            {formatPrice(kpis.recoveredRevenue)}
          </div>
          <div className={styles.kpiMeta}>
            <span>Sales brought back</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>+ Won Back</span>
          </div>
        </div>

        {/* KPI 3: Recovery Rate */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Recovery Rate</span>
            <div className={styles.kpiIconBox} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Percent size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>
            {kpis.recoveryRate}%
          </div>
          <div className={styles.kpiMeta}>
            <span>{kpis.recoveredCount} of {kpis.total} converted</span>
            <span style={{ color: '#7c3aed', fontWeight: 700 }}>Benchmark: 30%</span>
          </div>
        </div>

        {/* KPI 4: Pending Alerts */}
        <div className={styles.kpiCard} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Pending Alerts</span>
            <div className={styles.kpiIconBox} style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.kpiVal} style={{ color: kpis.pendingAlerts > 0 ? '#b45309' : '#0f172a' }}>
            {kpis.pendingAlerts}
          </div>
          <div className={styles.kpiMeta}>
            <span>Awaiting recovery alert</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>Action Needed</span>
          </div>
        </div>

        {/* KPI 5: Total Monitored */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Monitored Carts</span>
            <div className={styles.kpiIconBox} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className={styles.kpiVal}>{kpis.total}</div>
          <div className={styles.kpiMeta}>
            <span>Active cart sessions</span>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>Real-time</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Filter Tabs ─── */}
      <div className={styles.tabsBar}>
        {CART_STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'all'
              ? carts.length
              : carts.filter((c) => c.status === tab.key).length;

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
            placeholder="Search by customer name, phone, cart ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterGroupLeft}>
            <div className={styles.selectWrap}>
              <span>Cart Value:</span>
              <select
                className={styles.customSelect}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="all">All Values</option>
                <option value="under1k">Under ₹1,000</option>
                <option value="1k-3k">₹1,000 - ₹3,000</option>
                <option value="above3k">Above ₹3,000</option>
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
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.btnRefresh}
              onClick={() => {
                fetchCarts();
                showToast('Refreshed carts from live database', 'info');
              }}
              title="Refresh carts from live database"
            >
              <RotateCcw size={14} /> Refresh Data
            </button>
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.btnBroadcast}
              onClick={handleBulkBroadcast}
              title="Send bulk recovery WhatsApp to all pending carts"
            >
              <MessageCircle size={15} /> Bulk WhatsApp Alerts ({kpis.pendingAlerts})
            </button>
            <button
              type="button"
              className={styles.btnExport}
              onClick={handleExportCSV}
              title="Export filtered carts to CSV"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. Bulk Actions Bar Above Table (Light Theme) ─── */}
      {selectedCartIds.length > 0 && (
        <div className={styles.bulkActionBar}>
          <div className={styles.bulkInfo}>
            <span className={styles.bulkCountBadge}>
              <Check size={14} strokeWidth={3} />
              {selectedCartIds.length} {selectedCartIds.length === 1 ? 'Cart' : 'Carts'} Selected
            </span>
            <button
              type="button"
              className={styles.bulkClearBtn}
              onClick={() => setSelectedCartIds([])}
            >
              Clear Selection
            </button>
          </div>

          <div className={styles.bulkActionsGroup}>
            <button
              type="button"
              className={styles.bulkBtnWhatsApp}
              onClick={handleBulkWhatsAppSelected}
              title="Send recovery WhatsApp alerts to selected customers"
            >
              <MessageCircle size={14} /> Send WhatsApp Alert ({selectedCartIds.length})
            </button>

            <button
              type="button"
              className={styles.bulkBtnExport}
              onClick={handleExportSelectedCSV}
              title="Export only selected carts to CSV"
            >
              <Download size={14} /> Export Selected ({selectedCartIds.length})
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. Main Data Table ─── */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.adminTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th style={{ width: '48px', textAlign: 'center' }} className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    className={styles.tableCheckbox}
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleToggleSelectAll}
                    title="Select / Deselect all visible carts"
                  />
                </th>
                <th style={{ width: '15%' }} className={styles.thCell}>CART ID / TIME</th>
                <th style={{ width: '16%' }} className={styles.thCell}>CUSTOMER</th>
                <th style={{ width: '22%' }} className={styles.thCell}>ITEMS IN CART</th>
                <th style={{ width: '12%' }} className={styles.thCell}>CART VALUE</th>
                <th style={{ width: '13%' }} className={styles.thCellCenter}>STATUS</th>
                <th style={{ width: '11%' }} className={styles.thCellCenter}>WHATSAPP</th>
                <th style={{ width: '11%' }} className={styles.thCellCenter}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <ShoppingCart size={40} color="#cbd5e1" style={{ display: 'block', margin: '0 auto' }} />
                    <div className={styles.emptyStateTitle}>No abandoned carts found</div>
                    <div className={styles.emptyStateSubtitle}>Try clearing search or changing filters.</div>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart, index) => {
                  const wonBackList = getPurchasedItemsForCart(cart);
                  const isPartial = wonBackList.length > 0 && cart.items.length > 0;
                  const statusCfg = isPartial
                    ? { label: `Won Back (${wonBackList.length})`, icon: CheckCircle2, bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' }
                    : (CART_STATUS_CONFIG[cart.status] || CART_STATUS_CONFIG.pending);
                  const StatusIcon = statusCfg.icon;
                  const isOpen = expandedId === cart.id;
                  const isSelected = selectedCartIds.includes(cart.id);

                  return (
                    <React.Fragment key={cart.id}>
                      <tr
                        className={`${styles.trRow} ${isOpen ? styles.trRowOpen : ''} ${isSelected ? styles.trRowSelected : ''}`}
                        onClick={() => toggleRow(cart.id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected
                            ? '#faf5ff'
                            : isOpen
                            ? '#faf5ff'
                            : index % 2 === 0
                            ? '#ffffff'
                            : '#faf7ff',
                          borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* 0. Multi-Select Row Checkbox */}
                        <td style={{ width: '48px', textAlign: 'center' }} className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className={styles.tableCheckbox}
                            checked={isSelected}
                            onChange={(e) => handleToggleCartSelect(cart.id, e)}
                            title={`Select cart #${cart.id}`}
                          />
                        </td>

                        {/* 1. Cart ID & Stage */}
                        <td className={styles.tdCell}>
                          <div className={styles.cartIdCol}>
                            <span className={styles.cartIdText}>#{cart.id}</span>
                            <span className={styles.cartDateText}>
                              <Clock size={11} color="#94a3b8" />
                              {new Date(cart.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* 2. Customer */}
                        <td className={styles.tdCell}>
                          <div className={styles.customerCol}>
                            <div className={styles.customerAvatar}>
                              {cart.customer.name[0]?.toUpperCase() || 'C'}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div className={styles.customerName} title={cart.customer.name}>
                                {cart.customer.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {cart.customer.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Items in Cart */}
                        <td className={styles.tdCell}>
                          <div className={styles.itemsCol}>
                            <div className={styles.thumbsGallery}>
                              {cart.items.slice(0, 2).map((item, i) => (
                                <img
                                  key={i}
                                  src={item.image}
                                  alt={item.name}
                                  className={styles.itemThumbMini}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300';
                                  }}
                                />
                              ))}
                              {cart.items.length > 2 && (
                                <span className={styles.itemCountBadge}>+{cart.items.length - 2}</span>
                              )}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              {wonBackList.length > 0 && (
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.66rem',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  marginBottom: '3px',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  <Check size={10} strokeWidth={3} />
                                  Won Back: "{wonBackList[0].name}"
                                </div>
                              )}
                              <div className={styles.primaryItemName} title={cart.items[0]?.name}>
                                {wonBackList.length > 0 ? `${cart.items.length} in bag: ${cart.items[0]?.name}` : cart.items[0]?.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>
                                {cart.items[0]?.variant || `Qty: ${cart.items[0]?.quantity}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Cart Value */}
                        <td className={styles.tdCell}>
                          <div className={styles.cartValueText}>
                            {formatPrice(cart.totalAmount)}
                          </div>
                          <div className={styles.cartValueSub}>
                            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                          </div>
                        </td>

                        {/* 5. Status Badge */}
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

                        {/* 6. 1-Click WhatsApp Trigger */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            {cart.status === 'recovered' ? (
                              <span className={styles.btnRowRecoveredPill} title={`Order #${cart.recoveredOrderNumber}`}>
                                <Check size={11} /> Won Back
                              </span>
                            ) : cart.status === 'sent' ? (
                              <span className={styles.btnRowSentPill} title={`Alert sent ${cart.alertsSentCount} times`}>
                                <Send size={11} /> Sent ({cart.alertsSentCount})
                              </span>
                            ) : (
                              <button
                                type="button"
                                className={styles.btnRowWhatsApp}
                                onClick={(e) => handleLaunchWhatsApp(cart, e)}
                                title="Send 1-Click WhatsApp Recovery message"
                              >
                                <MessageCircle size={12} />
                                <span>Alert</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 7. Action Manage Button */}
                        <td className={styles.tdCellCenter}>
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(cart.id);
                              }}
                              className={isOpen ? styles.manageBtnActive : styles.manageBtn}
                              title={isOpen ? 'Close details drawer' : 'Open details drawer & trigger recovery'}
                            >
                              {isOpen ? <ChevronUp size={13} /> : <ChevronsUpDown size={13} />}
                              <span>{isOpen ? 'Close' : 'Manage'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expandable Details Drawer ── */}
                      {isOpen && (
                        <tr className={styles.expandedRowTr}>
                          <td colSpan={8} className={styles.expandedColTd}>
                            <div className={styles.expandedDrawerWrap}>
                              <div className={styles.expandedGrid}>
                                {/* CARD 1: ABANDONED ITEMS BREAKDOWN */}
                                <div className={styles.expandedCard}>
                                  {/* 🏆 Section 1A: WON BACK / PURCHASED PRODUCTS (CONVERTED BY THIS CUSTOMER) */}
                                  {wonBackList.length > 0 && (
                                    <div style={{
                                      background: '#f0fdf4',
                                      border: '1.5px solid #86efac',
                                      borderRadius: '10px',
                                      padding: '0.75rem',
                                      marginBottom: '0.85rem',
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <CheckCircle2 size={15} color="#16a34a" />
                                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#14532d' }}>
                                            Won Back / Purchased Products ({wonBackList.length})
                                          </span>
                                        </div>
                                        <span style={{ fontSize: '0.67rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                                          ✓ Order Confirmed
                                        </span>
                                      </div>

                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {wonBackList.map((p, pIdx) => (
                                          <div
                                            key={pIdx}
                                            style={{
                                              background: '#ffffff',
                                              border: '1px solid #bbf7d0',
                                              borderRadius: '8px',
                                              padding: '8px 10px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: '8px',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                              {p.image ? (
                                                <img
                                                  src={p.image}
                                                  alt={p.name}
                                                  style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                  onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300';
                                                  }}
                                                />
                                              ) : (
                                                <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                                                  <Package size={18} />
                                                </div>
                                              )}

                                              <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {p.name}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                                                  Order #{p.orderNumber || cart.recoveredOrderNumber || 'WON-BACK'} • {p.time || 'Converted'}
                                                </div>
                                              </div>
                                            </div>

                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>
                                                {p.priceFormatted || p.price || formatPrice(1500)}
                                              </div>
                                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                                Qty: {p.quantity || 1}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className={styles.cardHeader} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', paddingBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                      <h4 className={styles.cardTitle}>
                                        <Package size={16} color="#7c3aed" />
                                        {wonBackList.length > 0 ? `Still in Bag (Pending Recovery) (${cart.items.length})` : `Items Left in Bag (${cart.items.length})`}
                                      </h4>
                                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>
                                        ID: #{cart.id}
                                      </span>
                                    </div>

                                    {cart.items.length > 1 && (
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf5ff', border: '1px solid #ede9fe', padding: '4px 10px', borderRadius: '8px' }}>
                                        {(() => {
                                          const selectedSkus = selectedProductsPerCart[cart.id] || [];
                                          const isSubset = selectedSkus.length > 0 && selectedSkus.length < cart.items.length;
                                          const allSelected = selectedSkus.length === cart.items.length;
                                          return (
                                            <span style={{ fontSize: '0.72rem', color: '#6d28d9', fontWeight: 600 }}>
                                              {allSelected ? '✓ All Items Targeted' : isSubset ? `🎯 ${selectedSkus.length} of ${cart.items.length} Targeted` : 'None Targeted'}
                                            </span>
                                          );
                                        })()}

                                        <button
                                          type="button"
                                          onClick={() => toggleSelectAllProducts(cart.id, cart.items.map((i) => i.sku))}
                                          style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            background: '#ffffff',
                                            border: '1px solid #c4b5fd',
                                            color: '#6d28d9',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                            transition: 'all 0.15s ease',
                                          }}
                                          title="Toggle select all products"
                                        >
                                          {(selectedProductsPerCart[cart.id] || []).length === cart.items.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className={styles.itemListWrap}>
                                    {cart.items.map((item, idx) => {
                                      const isItemRecovered = wonBackList.length === 0 && ((cart.recoveredProducts || []).includes(item.sku) || (cart.recoveredProducts || []).includes(item.name));
                                      const selectedSkus = selectedProductsPerCart[cart.id] || [];
                                      const isSelected = selectedSkus.includes(item.sku);
                                      const isOnlyThisSelected = isSelected && selectedSkus.length === 1;

                                      return (
                                        <div
                                          key={item.sku || idx}
                                          className={`${styles.itemRow} ${isSelected ? styles.itemRowSelected : ''}`}
                                          onClick={() => toggleProductSelection(cart.id, item.sku)}
                                          title={isSelected ? 'Click to deselect from WhatsApp alert' : 'Click to select in WhatsApp recovery'}
                                        >
                                          {/* TOP ROW: Checkbox + Image + Details + Price/Qty */}
                                          <div className={styles.itemMainRow}>
                                            <div
                                              className={styles.itemCheckboxWrap}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProductSelection(cart.id, item.sku);
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                className={styles.itemCheckbox}
                                                checked={isSelected}
                                                onChange={() => toggleProductSelection(cart.id, item.sku)}
                                              />
                                            </div>

                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className={styles.itemImg}
                                              onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300';
                                              }}
                                            />

                                            <div className={styles.itemDetails}>
                                              <div className={styles.itemName} title={item.name}>
                                                {item.name}
                                              </div>
                                              <div className={styles.itemVariant} title={`${item.variant || ''} | SKU: ${item.sku}`}>
                                                {item.variant ? `${item.variant} • ` : ''}SKU: {item.sku}
                                              </div>
                                            </div>

                                            <div className={styles.itemPriceQty}>
                                              <div>{formatPrice(item.price * item.quantity)}</div>
                                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                Qty: {item.quantity}
                                              </div>
                                            </div>
                                          </div>

                                          {/* BOTTOM ACTION BAR: 'Only this' and 'Convert item' */}
                                          <div className={styles.itemActionBar} onClick={(e) => e.stopPropagation()}>
                                            {isItemRecovered ? (
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
                                                <span
                                                  style={{
                                                    fontSize: '0.68rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: '#ecfdf5',
                                                    border: '1px solid #a7f3d0',
                                                    color: '#059669',
                                                    fontWeight: 700,
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                  }}
                                                  title={cart.recoveredOrderNumber ? `Converted under Order #${cart.recoveredOrderNumber}` : 'Converted'}
                                                >
                                                  <Check size={11} /> Converted
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={(e) => handleRevertConversion(cart.id, e, item.sku)}
                                                  style={{
                                                    fontSize: '0.68rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #fecaca',
                                                    background: '#fef2f2',
                                                    color: '#dc2626',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.15s ease',
                                                  }}
                                                  title="Remove conversion status for this product"
                                                >
                                                  <RotateCcw size={11} />
                                                  <span>Remove conversion</span>
                                                </button>
                                              </div>
                                            ) : (
                                              <>
                                                {cart.items.length > 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => selectOnlyOneProduct(cart.id, item.sku, e)}
                                                    style={{
                                                      fontSize: '0.68rem',
                                                      padding: '2px 8px',
                                                      borderRadius: '6px',
                                                      border: isOnlyThisSelected ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                                                      background: isOnlyThisSelected ? '#7c3aed' : '#ffffff',
                                                      color: isOnlyThisSelected ? '#ffffff' : '#475569',
                                                      cursor: 'pointer',
                                                      fontWeight: 600,
                                                      whiteSpace: 'nowrap',
                                                      transition: 'all 0.15s ease',
                                                    }}
                                                    title="Single select: Target only this product in alert"
                                                  >
                                                    {isOnlyThisSelected ? '✓ Only This' : 'Only this'}
                                                  </button>
                                                )}

                                                <button
                                                  type="button"
                                                  onClick={(e) => handleMarkRecovered(cart.id, e, item.sku)}
                                                  style={{
                                                    fontSize: '0.68rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px dashed #059669',
                                                    background: '#f0fdf4',
                                                    color: '#059669',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.15s ease',
                                                  }}
                                                  title="Mark only this single product as converted"
                                                >
                                                  Convert item
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {(() => {
                                    const selectedSkus = selectedProductsPerCart[cart.id] || [];
                                    const targetedItems = getItemsForCartMessage(cart);
                                    const targetedAmount = targetedItems.reduce((s, i) => s + (i.price * i.quantity), 0);
                                    const isSubset = selectedSkus.length > 0 && selectedSkus.length < cart.items.length;

                                    return (
                                      <div className={styles.totalsBox}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span className={styles.totalLabel}>
                                            {isSubset ? `Targeted Value (${selectedSkus.length} items)` : 'Total Cart Value'}
                                          </span>
                                          {isSubset && (
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                              Total Bag: {formatPrice(cart.totalAmount)}
                                            </span>
                                          )}
                                        </div>
                                        <span className={styles.totalAmountVal}>
                                          {formatPrice(isSubset ? targetedAmount : cart.totalAmount)}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* CARD 2: CUSTOMER CONTACT, FULL ADDRESS & RECOVERY STATUS */}
                                <div className={`${styles.expandedCard} ${styles.customerCard}`}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <Clock size={16} color="#7c3aed" />
                                      Customer, Address & Recovery History
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700, textAlign: 'right' }}>
                                      {cart.abandonedStage || 'Payment Gateway (Razorpay Drop)'}
                                    </span>
                                  </div>

                                  {/* 1. Full Shipping & Delivery Address (First) */}
                                  <div style={{
                                    background: '#f8fafc',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '0.75rem 0.85rem',
                                    marginBottom: '0.75rem',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <MapPin size={13} color="#7c3aed" />
                                        FULL SHIPPING & DELIVERY ADDRESS
                                      </span>
                                      {cart.customer.pincode && (
                                        <span style={{ fontSize: '0.68rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                          PIN: {cart.customer.pincode}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.45 }}>
                                      {cart.customer.fullAddress || cart.customer.address || 'Address not provided yet'}
                                    </div>
                                    {cart.customer.city && (
                                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                                        Region: <b>{cart.customer.city}</b>{cart.customer.state ? `, ${cart.customer.state}` : ''}
                                      </div>
                                    )}
                                  </div>

                                  {/* 2. Structured Contact Details Box (Name, Number, Email) */}
                                  <div style={{
                                    background: '#ffffff',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '0.75rem 0.85rem',
                                    marginBottom: '0.75rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                  }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <User size={13} color="#2563eb" />
                                      CUSTOMER CONTACT DETAILS
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                        {/* Name */}
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.79rem', padding: '3px 0', borderBottom: '1px solid #f8fafc' }}>
                                          <span style={{ width: '85px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                                            <User size={13} color="#6366f1" />
                                            Name:
                                          </span>
                                          <span style={{ color: '#0f172a', fontWeight: 700, flex: 1, textAlign: 'left' }}>
                                            {cart.customer.name}
                                          </span>
                                        </div>

                                        {/* Phone Number */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.79rem', padding: '3px 0', borderBottom: '1px solid #f8fafc' }}>
                                          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <span style={{ width: '85px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                                              <Phone size={13} color="#059669" />
                                              Phone:
                                            </span>
                                            <span style={{ color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>
                                              {cart.customer.phone || 'Not available'}
                                            </span>
                                          </div>
                                          {cart.customer.phone && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                              <a
                                                href={`tel:${cart.customer.phone}`}
                                                style={{
                                                  fontSize: '0.68rem',
                                                  background: '#eff6ff',
                                                  color: '#2563eb',
                                                  border: '1px solid #bfdbfe',
                                                  padding: '2px 7px',
                                                  borderRadius: '5px',
                                                  textDecoration: 'none',
                                                  fontWeight: 700,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '3px',
                                                }}
                                                title="Voice Call Customer"
                                              >
                                                <Phone size={10} />
                                                Call
                                              </a>
                                              <a
                                                href={`https://wa.me/${cart.customer.phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  fontSize: '0.68rem',
                                                  background: '#ecfdf5',
                                                  color: '#059669',
                                                  border: '1px solid #a7f3d0',
                                                  padding: '2px 7px',
                                                  borderRadius: '5px',
                                                  textDecoration: 'none',
                                                  fontWeight: 700,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '3px',
                                                }}
                                                title="Open WhatsApp chat"
                                              >
                                                <MessageCircle size={10} />
                                                WhatsApp
                                              </a>
                                            </div>
                                          )}
                                        </div>

                                        {/* Email */}
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.79rem', padding: '3px 0' }}>
                                          <span style={{ width: '85px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600, flexShrink: 0 }}>
                                            <Mail size={13} color="#2563eb" />
                                            Email:
                                          </span>
                                          {cart.customer.email ? (
                                            <a
                                              href={`mailto:${cart.customer.email}`}
                                              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: '0.78rem', flex: 1, textAlign: 'left' }}
                                              title="Send Email"
                                            >
                                              {cart.customer.email}
                                            </a>
                                          ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                                              Not provided
                                            </span>
                                          )}
                                        </div>

                                        {/* Customer Purchase / Won Back Summary */}
                                        {wonBackList.length > 0 && (
                                          <div style={{
                                            marginTop: '8px',
                                            background: '#f0fdf4',
                                            border: '1px solid #86efac',
                                            borderRadius: '8px',
                                            padding: '7px 10px',
                                          }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                              <CheckCircle2 size={13} color="#16a34a" />
                                              PURCHASED FROM CART
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                                              {cart.customer.name} purchased: "{wonBackList[0].name}" {wonBackList.length > 1 ? `(+${wonBackList.length - 1} more)` : ''}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '1px' }}>
                                              Order #{wonBackList[0].orderNumber || 'WON-BACK'} • {cart.items.length} {cart.items.length === 1 ? 'item still in bag' : 'items still in bag'}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                  {/* 3. Converted Order Recovery Status & Conversion Action */}
                                  {(() => {
                                    const recoveredList = wonBackList.length > 0
                                      ? wonBackList
                                      : cart.items.filter((i) => (cart.recoveredProducts || []).includes(i.sku) || (cart.recoveredProducts || []).includes(i.name));
                                    const pendingItems = wonBackList.length > 0
                                      ? cart.items
                                      : cart.items.filter((i) => !(cart.recoveredProducts || []).includes(i.sku) && !(cart.recoveredProducts || []).includes(i.name));

                                    return (
                                      <>
                                        {/* If all items are converted, provide a clean revert option */}
                                        {pendingItems.length === 0 && recoveredList.length > 0 && (
                                          <div style={{
                                            background: '#f8fafc',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '0.6rem 0.85rem',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                          }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <CheckCircle2 size={15} color="#059669" />
                                              <span style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>
                                                All items converted ({recoveredList.length} items)
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={(e) => handleRevertConversion(cart.id, e, null)}
                                              style={{
                                                fontSize: '0.7rem',
                                                padding: '4px 9px',
                                                borderRadius: '6px',
                                                border: '1px solid #fecaca',
                                                background: '#fff1f2',
                                                color: '#e11d48',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                              }}
                                              title="Revert all items back to unconverted"
                                            >
                                              <RotateCcw size={11} />
                                              <span>Remove Converted</span>
                                            </button>
                                          </div>
                                        )}

                                        {/* B. Remaining Items Pending Conversion Action */}
                                        {pendingItems.length > 0 && (
                                          <div style={{
                                            background: '#fffbeb',
                                            border: '1.5px solid #fde68a',
                                            borderRadius: '10px',
                                            padding: '0.75rem 0.85rem',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.5rem',
                                          }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={13} color="#d97706" />
                                                {cart.status === 'sent' ? `ALERT SENT (${cart.alertsSentCount}x) - PENDING` : recoveredList.length > 0 ? 'REMAINING ITEMS PENDING' : 'NOT YET CONVERTED (ABANDONED)'}
                                              </div>
                                              <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px' }}>
                                                {(() => {
                                                  const selectedSkus = selectedProductsPerCart[cart.id] || [];
                                                  if (selectedSkus.length === 1) {
                                                    const item = cart.items.find((i) => i.sku === selectedSkus[0]);
                                                    return `Targeting: "${item?.name}" (${formatPrice((item?.price || 0) * (item?.quantity || 1))})`;
                                                  }
                                                  if (selectedSkus.length > 1) {
                                                    return `Targeting ${selectedSkus.length} selected items`;
                                                  }
                                                  return `Pending recovery value: ${formatPrice(pendingItems.reduce((s, i) => s + (i.price * i.quantity), 0))}`;
                                                })()}
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={(e) => handleMarkRecovered(cart.id, e)}
                                              style={{
                                                background: '#059669',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '5px 10px',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                boxShadow: '0 2px 5px rgba(5, 150, 105, 0.25)',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.15s ease',
                                              }}
                                              title="Mark selected product or cart as converted order"
                                            >
                                              <Check size={12} />
                                              <span>
                                                {(() => {
                                                  const selectedSkus = selectedProductsPerCart[cart.id] || [];
                                                  if (selectedSkus.length === 1) {
                                                    const item = cart.items.find((i) => i.sku === selectedSkus[0]);
                                                    return `Convert "${(item?.name || 'Item').slice(0, 10)}..."`;
                                                  }
                                                  if (selectedSkus.length > 1) {
                                                    return `Convert (${selectedSkus.length}) Items`;
                                                  }
                                                  return pendingItems.length < cart.items.length ? 'Convert Remaining' : 'Mark Converted';
                                                })()}
                                              </span>
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}

                                  {/* 4. Complete Session & Conversion History (Audit Timeline) */}
                                  <div className={styles.timelineWrap}>
                                    <div className={styles.timelineHeaderRow}>
                                      <span className={styles.timelineTitleText}>
                                        Audit & Conversion History ({(cart.timeline || []).length})
                                      </span>
                                      {(cart.timeline || []).length > 3 && (
                                        <span className={styles.scrollBadgeText}>
                                          ↕ Scrollable
                                        </span>
                                      )}
                                    </div>
                                    <div className={styles.timelineScrollBox}>
                                      {(cart.timeline || []).map((step, sIdx) => {
                                        const isRecoveryEvent = (step.event || '').toLowerCase().includes('recover') || (step.event || '').toLowerCase().includes('convert');
                                        const isAlertEvent = (step.event || '').toLowerCase().includes('alert') || (step.event || '').toLowerCase().includes('whatsapp');
                                        const dotColor = isRecoveryEvent ? '#059669' : isAlertEvent ? '#2563eb' : '#7c3aed';

                                        return (
                                          <div key={sIdx} className={styles.timelineItem}>
                                            <div className={styles.timelineDot} style={{ background: dotColor, borderColor: `${dotColor}40` }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                                                <div className={styles.timelineEvent} style={{ color: isRecoveryEvent ? '#059669' : '#0f172a', fontWeight: isRecoveryEvent ? 800 : 700 }}>
                                                  {step.event}
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={(e) => handleDeleteTimelineEntry(cart.id, sIdx, step, e)}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.15s ease',
                                                  }}
                                                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                                                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                                                  title="Delete this history record"
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                              </div>
                                              <div className={styles.timelineNote}>{step.note}</div>
                                              <div className={styles.timelineTime}>
                                                {new Date(step.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                                                {new Date(step.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* CARD 3: 1-CLICK WHATSAPP RECOVERY DISPATCHER */}
                                <div className={styles.expandedCard}>
                                  <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>
                                      <MessageCircle size={16} color="#25d366" />
                                      1-Click WhatsApp Dispatcher
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                                      Official WATI Format
                                    </span>
                                  </div>

                                  {/* Template Selector */}
                                  <div className={styles.templateSelector}>
                                    {RECOVERY_TEMPLATES.map((tpl) => {
                                      const isSelected =
                                        (selectedTemplates[cart.id] || RECOVERY_TEMPLATES[0].id) === tpl.id;
                                      const TplIcon = tpl.icon;

                                      return (
                                        <div
                                          key={tpl.id}
                                          className={isSelected ? styles.templateOptionActive : styles.templateOption}
                                          onClick={() =>
                                            setSelectedTemplates((prev) => ({ ...prev, [cart.id]: tpl.id }))
                                          }
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                            <TplIcon size={14} />
                                            <span>{tpl.name}</span>
                                          </div>
                                          <span
                                            style={{
                                              fontSize: '0.65rem',
                                              color: tpl.badgeColor,
                                              background: `${tpl.badgeColor}15`,
                                              padding: '0.1rem 0.35rem',
                                              borderRadius: '4px',
                                              fontWeight: 700,
                                            }}
                                          >
                                            {tpl.badge}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Dynamic Live Message Preview & Direct Template Editor */}
                                  {(() => {
                                    const currentTplId = selectedTemplates[cart.id] || RECOVERY_TEMPLATES[0].id;
                                    const tpl = RECOVERY_TEMPLATES.find((t) => t.id === currentTplId) || RECOVERY_TEMPLATES[0];
                                    const currentMsgText = getCartMessageText(cart, tpl.id);
                                    const editing = tpl.isCustom && isCartEditing(cart.id);

                                    return (
                                      <>
                                        {/* ✍️ Direct Live Template Editor (shown when editing) */}
                                        {editing ? (
                                          <div className={styles.directEditorBox}>
                                            <div className={styles.directEditorHeader}>
                                              <div className={styles.directEditorTitle}>
                                                <Edit3 size={14} color="#059669" />
                                                <span>WhatsApp Template Direct Editor</span>
                                              </div>
                                              <span className={styles.directEditorBadge}>
                                                ✍️ Direct Edit Mode
                                              </span>
                                            </div>

                                            {/* The Big Direct Textarea containing the FULL content */}
                                            <div className={styles.textareaWrapper}>
                                              <textarea
                                                className={styles.fullMessageTextarea}
                                                rows={10}
                                                value={currentMsgText}
                                                onChange={(e) => handleUpdateMessageText(cart.id, e.target.value)}
                                                placeholder="Type or customize your WhatsApp template message directly here..."
                                              />
                                            </div>

                                            {/* Footer with Character info, Reset, and Save Button */}
                                            <div className={styles.editorFooterRow}>
                                              <div className={styles.editorStatusGroup}>
                                                <span className={styles.charCountText}>
                                                  {currentMsgText.length} characters
                                                </span>
                                              </div>

                                              <div className={styles.editorActionsGroup}>
                                                <button
                                                  type="button"
                                                  className={styles.btnResetEditor}
                                                  onClick={() => handleResetMessageText(cart, tpl.id)}
                                                  title="Reset back to default template text"
                                                >
                                                  <RotateCcw size={11} /> Reset
                                                </button>

                                                <button
                                                  type="button"
                                                  className={styles.btnSaveEditor}
                                                  onClick={() => handleSaveMessageText(cart.id)}
                                                  title="Save template and view preview"
                                                >
                                                  <Check size={13} /> Save Template
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          /* ✨ WHATSAPP MESSAGE PREVIEW (Image 2) */
                                          <div className={styles.messagePreviewBox}>
                                            <div className={styles.messagePreviewHeader}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Sparkles size={12} />
                                                <span>WHATSAPP MESSAGE PREVIEW</span>
                                              </div>
                                              <button
                                                type="button"
                                                className={styles.editThisTplBtn}
                                                onClick={() => {
                                                  if (!tpl.isCustom) {
                                                    setSelectedTemplates((prev) => ({ ...prev, [cart.id]: 'tpl_custom_offer' }));
                                                    handleUpdateMessageText(cart.id, currentMsgText);
                                                  }
                                                  setIsEditingMessage((prev) => ({ ...prev, [cart.id]: true }));
                                                }}
                                                title="Directly edit all content in this template"
                                              >
                                                <Edit3 size={11} /> Edit Template
                                              </button>
                                            </div>
                                            <div className={styles.messagePreviewText}>
                                              {currentMsgText}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}

                                  {/* Action Buttons */}
                                  <div className={styles.dispatchActionRow}>
                                    <button
                                      type="button"
                                      className={styles.btnSendWhatsAppBig}
                                      onClick={(e) => handleLaunchWhatsApp(cart, e)}
                                    >
                                      <MessageCircle size={15} />
                                      <span>Dispatch WhatsApp Recovery Alert</span>
                                    </button>

                                    {cart.status !== 'recovered' && (
                                      <button
                                        type="button"
                                        className={styles.btnMarkRecovered}
                                        onClick={(e) => handleMarkRecovered(cart.id, e)}
                                      >
                                        <Check size={14} /> Mark as Converted (Won Back Order)
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
    </AdminLayout>
  );
}

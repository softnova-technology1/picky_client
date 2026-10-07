import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Download,
  X,
  Calendar,
  CreditCard,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDateShort } from '../../../utils/formatDate';
import { MOCK_CUSTOMERS, MOCK_SALES_SUMMARY, MOCK_ORDERS_EXTENDED } from '../../../data/adminMockData';

// ─── Customer Tier Classification Constant ──────────────────────────────────
export const CUSTOMER_TIERS = {
  VIP: {
    label: 'VIP',
    color: '#7c3aed',
    bg: '#ede8f8',
    border: '#dcd0fa',
    minOrders: 5,
    minSpent: 8000,
  },
  REPEAT: {
    label: 'Repeat',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
    minOrders: 2,
    minSpent: 3000,
  },
  NEW: {
    label: 'New',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
    minOrders: 0,
    minSpent: 0,
  },
};

export const getCustomerTier = (customer) => {
  if (!customer) return CUSTOMER_TIERS.NEW;
  const orders = Number(customer.totalOrders || customer.ordersCount) || 0;
  const spent = Number(customer.totalSpent) || 0;
  if (orders >= CUSTOMER_TIERS.VIP.minOrders || spent >= CUSTOMER_TIERS.VIP.minSpent) {
    return CUSTOMER_TIERS.VIP;
  }
  if (orders >= CUSTOMER_TIERS.REPEAT.minOrders || spent >= CUSTOMER_TIERS.REPEAT.minSpent) {
    return CUSTOMER_TIERS.REPEAT;
  }
  return CUSTOMER_TIERS.NEW;
};

// ─── Deterministic Mock Orders Generator for Customer Drawer ────────────────
export const getCustomerOrders = (customer) => {
  if (!customer) return [];
  const normalizedPhone = (customer.phone || '').replace(/\D/g, '');
  const normalizedName = (customer.name || '').toLowerCase().trim();

  // Find matches from MOCK_ORDERS_EXTENDED first
  const realMatches = (MOCK_ORDERS_EXTENDED || []).filter((o) => {
    const oPhone = (o.customer?.phone || '').replace(/\D/g, '');
    const oName = (o.customer?.name || '').toLowerCase().trim();
    return (normalizedPhone && oPhone === normalizedPhone) || (normalizedName && oName === normalizedName);
  });

  const totalCount = Number(customer.totalOrders || customer.ordersCount) || realMatches.length || 0;
  if (totalCount === 0) return [];

  if (realMatches.length >= totalCount) {
    return realMatches.slice(0, totalCount);
  }

  // Deterministically generate remaining order history
  const orders = [...realMatches];
  const statuses = ['delivered', 'shipped', 'confirmed'];
  const baseDate = new Date(customer.joinedDate || '2026-06-01');
  const remainingCount = totalCount - realMatches.length;
  const existingSpent = realMatches.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const remainingSpent = Math.max(0, (customer.totalSpent || 3500) - existingSpent);
  const avgRemaining = Math.max(350, Math.round(remainingSpent / Math.max(1, remainingCount)));

  const seed = parseInt(customer._id?.replace(/\D/g, '') || '1', 10);

  for (let i = 0; i < remainingCount; i++) {
    const orderNum = 8800 + seed * 15 + i;
    const orderDate = new Date(baseDate.getTime() + (i + 1) * 14 * 24 * 60 * 60 * 1000);
    const amount =
      i === remainingCount - 1
        ? Math.max(350, remainingSpent - avgRemaining * (remainingCount - 1))
        : avgRemaining;
    orders.push({
      _id: `mock_ord_${customer._id}_${i}`,
      orderNumber: `ORD-2026-${orderNum}`,
      createdAt: orderDate.toISOString(),
      totalAmount: amount,
      status: statuses[(seed + i) % statuses.length],
      itemsCount: 1 + ((seed + i) % 3),
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export default function AdminCustomers() {
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL Query Sync
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
  const urlQ = searchParams.get('q') || '';
  const urlCity = searchParams.get('city') || 'all';
  const urlOrders = searchParams.get('orders') || 'all';
  const urlDate = searchParams.get('date') || 'all';
  const urlStartDate = searchParams.get('startDate') || '';
  const urlEndDate = searchParams.get('endDate') || '';
  const urlCard = searchParams.get('card') || 'all';
  const urlSort = searchParams.get('sort') || null;
  const urlOrder = searchParams.get('order') || null;
  const urlCustomer = searchParams.get('customer') || null;

  // Filter States
  const [searchInput, setSearchInput] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [selectedCity, setSelectedCity] = useState(urlCity);
  const [selectedOrders, setSelectedOrders] = useState(urlOrders);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);
  const [activeCardFilter, setActiveCardFilter] = useState(urlCard);

  // Sort State
  const [sortConfig, setSortConfig] = useState({
    key: urlSort,
    direction: urlOrder === 'desc' ? 'desc' : urlSort ? 'asc' : null,
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(urlPage > 0 ? urlPage : 1);
  const [itemsPerPage, setItemsPerPage] = useState([10, 25, 50].includes(urlLimit) ? urlLimit : 10);

  // Customer Detail Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState(urlCustomer);

  const tableTopRef = useRef(null);
  const drawerRef = useRef(null);

  // Load customer profiles & summary
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sumRes, custRes] = await Promise.all([
          adminService.getSalesSummary().catch(() => null),
          adminService.getCustomers({ limit: 100 }).catch(() => null),
        ]);
        const sumData = sumRes?.data || sumRes;
        if (sumData && sumData.totalCustomers > 0) {
          setSummary(sumData);
        } else {
          setSummary(MOCK_SALES_SUMMARY);
        }

        const custList = Array.isArray(custRes?.data) ? custRes.data : (Array.isArray(custRes?.data?.data) ? custRes.data.data : (Array.isArray(custRes) ? custRes : []));
        if (custList.length > 0) {
          setCustomers(custList);
        } else {
          setCustomers(MOCK_CUSTOMERS);
        }
      } catch (err) {
        console.error('Failed to load customers info:', err);
        setSummary(MOCK_SALES_SUMMARY);
        setCustomers(MOCK_CUSTOMERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCity, selectedOrders, selectedDate, startDate, endDate, activeCardFilter]);

  // Sync state to URL Query Params
  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = String(currentPage);
    if (itemsPerPage !== 10) params.limit = String(itemsPerPage);
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    if (selectedCity !== 'all') params.city = selectedCity;
    if (selectedOrders !== 'all') params.orders = selectedOrders;
    if (selectedDate !== 'all') params.date = selectedDate;
    if (selectedDate === 'custom') {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }
    if (activeCardFilter !== 'all') {
      params.card = activeCardFilter;
    }
    if (sortConfig.key && sortConfig.direction) {
      params.sort = sortConfig.key;
      params.order = sortConfig.direction;
    }
    if (selectedCustomerId) {
      params.customer = selectedCustomerId;
    }
    setSearchParams(params, { replace: true });
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    selectedCity,
    selectedOrders,
    selectedDate,
    startDate,
    endDate,
    activeCardFilter,
    sortConfig,
    selectedCustomerId,
    setSearchParams,
  ]);

  // Sync drawer if URL parameter changes (e.g. browser back/forward)
  useEffect(() => {
    const cParam = searchParams.get('customer');
    if (cParam !== selectedCustomerId) {
      setSelectedCustomerId(cParam);
    }
  }, [searchParams]);

  // Selected customer object for drawer
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c._id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Drawer ESC key listener & body scroll lock
  useEffect(() => {
    if (!selectedCustomer) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCustomerId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus drawer on open
    setTimeout(() => {
      drawerRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedCustomer]);

  // Average Order Value across all customer profiles
  const averageOrderValue = useMemo(() => {
    const totalRev = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
    const totalOrd = customers.reduce((sum, c) => sum + (Number(c.totalOrders || c.ordersCount) || 0), 0);
    return totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;
  }, [customers]);

  // Dynamic Real-time Counts Calculated Directly from Active Customer Records
  const totalUsersCount = customers.length;
  const totalBuyersCount = useMemo(
    () => customers.filter((c) => (Number(c.totalOrders || c.ordersCount) || 0) >= 1).length,
    [customers]
  );
  const repeatBuyersCount = useMemo(
    () => customers.filter((c) => (Number(c.totalOrders || c.ordersCount) || 0) >= 2).length,
    [customers]
  );
  const onceBuyersCount = useMemo(
    () => customers.filter((c) => (Number(c.totalOrders || c.ordersCount) || 0) === 1).length,
    [customers]
  );

  // Dynamic Unique City Options
  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(customers.map((c) => c.city).filter(Boolean))).sort();
    return [{ value: 'all', label: 'All Cities' }, ...cities.map((city) => ({ value: city, label: city }))];
  }, [customers]);

  const ordersRangeOptions = [
    { value: 'all', label: 'All Orders' },
    { value: '1', label: '1 Order' },
    { value: '2-5', label: '2 to 5 Orders' },
    { value: '5+', label: '5+ Orders' },
  ];

  // Date Filter Preset Options
  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range...' },
  ];

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return customers.filter((c) => {
      const matchSearch =
        !term ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term));

      const matchCity =
        selectedCity === 'all' || (c.city && c.city.toLowerCase() === selectedCity.toLowerCase());

      const orderCount = Number(c.totalOrders || c.ordersCount) || 0;
      let matchOrders = true;
      if (selectedOrders === '1') {
        matchOrders = orderCount === 1;
      } else if (selectedOrders === '2-5') {
        matchOrders = orderCount >= 2 && orderCount <= 5;
      } else if (selectedOrders === '5+') {
        matchOrders = orderCount > 5;
      }

      // Date Matching (Joined Date or Created Date)
      let matchDate = true;
      if (selectedDate !== 'all') {
        const rawDate = c.joinedDate || c.createdAt;
        if (!rawDate) {
          matchDate = false;
        } else {
          let itemDate = null;
          if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
            const [y, m, d] = rawDate.trim().split('-').map(Number);
            itemDate = new Date(y, m - 1, d);
          } else {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) itemDate = parsed;
          }

          if (!itemDate) {
            matchDate = false;
          } else {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            if (selectedDate === 'today') {
              matchDate = itemDate >= todayStart && itemDate <= todayEnd;
            } else if (selectedDate === '7d') {
              const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
              matchDate = itemDate >= sevenDaysAgo && itemDate <= todayEnd;
            } else if (selectedDate === '30d') {
              const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
              matchDate = itemDate >= thirtyDaysAgo && itemDate <= todayEnd;
            } else if (selectedDate === 'this_month') {
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
              matchDate = itemDate >= startOfMonth && itemDate <= endOfMonth;
            } else if (selectedDate === 'last_month') {
              const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
              const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
              matchDate = itemDate >= startOfLastMonth && itemDate <= endOfLastMonth;
            } else if (selectedDate === 'this_year') {
              const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
              const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
              matchDate = itemDate >= startOfYear && itemDate <= endOfYear;
            } else if (selectedDate === 'custom') {
              if (startDate) {
                const [sy, sm, sd] = startDate.split('-').map(Number);
                const sDate = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
                if (itemDate < sDate) matchDate = false;
              }
              if (endDate) {
                const [ey, em, ed] = endDate.split('-').map(Number);
                const eDate = new Date(ey, em - 1, ed, 23, 59, 59, 999);
                if (itemDate > eDate) matchDate = false;
              }
            }
          }
        }
      }

      // Card KPI Filter Matching
      let matchCard = true;
      if (activeCardFilter === 'buyers') {
        matchCard = orderCount >= 1;
      } else if (activeCardFilter === 'repeat') {
        matchCard = orderCount >= 2;
      } else if (activeCardFilter === 'once') {
        matchCard = orderCount === 1;
      }

      return matchSearch && matchCity && matchOrders && matchDate && matchCard;
    });
  }, [customers, debouncedSearch, selectedCity, selectedOrders, selectedDate, startDate, endDate, activeCardFilter]);

  // Sort Customers
  const sortedCustomers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredCustomers;

    return [...filteredCustomers].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'customer') {
        comparison = (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
      } else if (sortConfig.key === 'orders') {
        const ordersA = Number(a.totalOrders || a.ordersCount) || 0;
        const ordersB = Number(b.totalOrders || b.ordersCount) || 0;
        comparison = ordersA - ordersB;
      } else if (sortConfig.key === 'spent') {
        const spentA = Number(a.totalSpent) || 0;
        const spentB = Number(b.totalSpent) || 0;
        comparison = spentA - spentB;
      } else if (sortConfig.key === 'joined') {
        const dateA = new Date(a.joinedDate || 0).getTime();
        const dateB = new Date(b.joinedDate || 0).getTime();
        comparison = dateA - dateB;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredCustomers, sortConfig]);

  // Cycle Sort: asc -> desc -> none
  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  // Pagination Calculations
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedCustomers.length);

  const paginatedCustomers = useMemo(() => {
    return sortedCustomers.slice(startIndex, endIndex);
  }, [sortedCustomers, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(targetPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRowsPerPageChange = (newVal) => {
    setItemsPerPage(parseInt(newVal, 10));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCity('all');
    setSelectedOrders('all');
    setSelectedDate('all');
    setStartDate('');
    setEndDate('');
    setActiveCardFilter('all');
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  };

  // Card KPI Click Handler: Filters and sorts the table dynamically
  const handleCardClick = (cardType) => {
    setActiveCardFilter((prev) => {
      const nextFilter = prev === cardType ? 'all' : cardType;
      // Auto-sort to give relevant view
      if (nextFilter === 'buyers' || nextFilter === 'repeat') {
        setSortConfig({ key: 'orders', direction: 'desc' });
      } else if (nextFilter === 'once') {
        setSortConfig({ key: 'joined', direction: 'desc' });
      } else {
        setSortConfig({ key: null, direction: null });
      }
      return nextFilter;
    });
    setSelectedOrders('all');
    setCurrentPage(1);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Export Filtered & Sorted Customers to CSV
  const handleExportCSV = () => {
    if (sortedCustomers.length === 0) return;
    const headers = ['Name', 'Phone', 'Email', 'City', 'Orders', 'Lifetime Value', 'Joined'];
    const rows = sortedCustomers.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      c.totalOrders || c.ordersCount || 0,
      c.totalSpent || 0,
      `"${formatDateShort(c.joinedDate)}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `picky_customers_directory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination Range Helper
  const getPaginationItems = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const rowsPerPageOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
  ];

  const selectedTier = selectedCustomer ? getCustomerTier(selectedCustomer) : null;
  const selectedCustomerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer) : [];
  const selectedAov =
    selectedCustomer && (selectedCustomer.totalOrders || selectedCustomer.ordersCount)
      ? Math.round(
          (selectedCustomer.totalSpent || 0) /
            (selectedCustomer.totalOrders || selectedCustomer.ordersCount || 1)
        )
      : 0;

  return (
    <AdminLayout title="Customers & Directory">
      {/* ── Keyframes for Smooth Drawer & Fade Animations ── */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .customers-kpi-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          padding: 1.25rem 1.4rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .customers-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.08);
          border-color: #cbd5e1;
        }
      `}</style>

      {/* ─── 4 Metric KPI Progress Cards (Clickable Interactive Filters) ────────── */}
      <div className="kpi-progress-grid">
        <AdminStatCard
          title="TOTAL USERS"
          value={totalUsersCount.toLocaleString()}
          icon={<Users size={22} />}
          variant="purple"
          footerLabel="Active CRM Directory"
          showProgress={false}
          progress={false}
          isActive={activeCardFilter === 'all'}
          onClick={() => handleCardClick('all')}
        />
        <AdminStatCard
          title="TOTAL BUYERS"
          value={totalBuyersCount.toLocaleString()}
          icon={<TrendingUp size={22} />}
          variant="green"
          footerLabel="Purchasing Accounts"
          showProgress={false}
          progress={false}
          isActive={activeCardFilter === 'buyers'}
          onClick={() => handleCardClick('buyers')}
        />
        <AdminStatCard
          title="REPEAT BUYERS"
          value={repeatBuyersCount.toLocaleString()}
          icon={<ShoppingBag size={22} />}
          variant="blue"
          footerLabel="Customer Retention"
          showProgress={false}
          progress={false}
          isActive={activeCardFilter === 'repeat'}
          onClick={() => handleCardClick('repeat')}
        />
        <AdminStatCard
          title="ONCE BUYERS"
          value={onceBuyersCount.toLocaleString()}
          icon={<CreditCard size={22} />}
          variant="amber"
          footerLabel="Single Order Only"
          showProgress={false}
          progress={false}
          isActive={activeCardFilter === 'once'}
          onClick={() => handleCardClick('once')}
        />
      </div>

      {/* Customers CRM Table Card */}
      <div className="card" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header Title Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Customer Profiles & Order History
              </h3>
              {activeCardFilter !== 'all' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background:
                      activeCardFilter === 'buyers'
                        ? '#dcfce7'
                        : activeCardFilter === 'repeat'
                        ? '#e0f2fe'
                        : '#fef3c7',
                    color:
                      activeCardFilter === 'buyers'
                        ? '#15803d'
                        : activeCardFilter === 'repeat'
                        ? '#0369a1'
                        : '#b45309',
                    border: `1px solid ${
                      activeCardFilter === 'buyers'
                        ? '#86efac'
                        : activeCardFilter === 'repeat'
                        ? '#bae6fd'
                        : '#fde68a'
                    }`,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {activeCardFilter === 'buyers'
                    ? 'Card Filter: Total Buyers (≥1 orders)'
                    : activeCardFilter === 'repeat'
                    ? 'Card Filter: Repeat Buyers (≥2 orders)'
                    : 'Card Filter: Once Buyers (1 order)'}
                  <button
                    type="button"
                    onClick={() => handleCardClick('all')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      color: 'inherit',
                      marginLeft: '2px',
                    }}
                    title="Reset to all users"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Direct verified WhatsApp contacts for delivery & transactional coordination
            </span>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              height: '40px',
              padding: '0 1.1rem',
              borderRadius: '10px',
              background: '#ede8f8',
              border: '1.5px solid #dcd0fa',
              color: '#5b13df',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
            title="Export filtered customer list to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Controls Bar: Widened Search, City Filter, Orders Range, Clear Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          {/* Widened Search Input (Full Placeholder Visible) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1',
              minWidth: '340px',
              maxWidth: '460px',
            }}
          >
            <Search size={15} style={{ position: 'absolute', left: '1rem', color: '#8a7ca6', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Filter customers by name, phone, city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 1rem 0 2.5rem',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#1e1b4b',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.18s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.03)';
              }}
            />
          </div>

          {/* Filters Group (City + Orders Range + Date Filter + Clear) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* City Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                City:
              </label>
              <Select
                value={selectedCity}
                onChange={(val) => setSelectedCity(val)}
                options={cityOptions}
                minWidth="135px"
                ariaLabel="Filter customers by city"
              />
            </div>

            {/* Orders Range Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                Orders:
              </label>
              <Select
                value={selectedOrders}
                onChange={(val) => {
                  setSelectedOrders(val);
                  setActiveCardFilter('all');
                }}
                options={ordersRangeOptions}
                minWidth="140px"
                ariaLabel="Filter customers by orders count"
              />
            </div>

            {/* Date Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} style={{ color: '#7c3aed' }} />
                <span>Date:</span>
              </label>
              <Select
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                options={dateRangeOptions}
                minWidth="145px"
                ariaLabel="Filter customers by date"
              />
            </div>

            {/* Custom Date Range Pickers (shown when selectedDate === 'custom') */}
            {selectedDate === 'custom' && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#f8fafc',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                }}
              >
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '3px 6px',
                    fontSize: '0.78rem',
                    color: '#1e1b4b',
                    outline: 'none',
                    background: '#ffffff',
                    fontFamily: 'inherit',
                  }}
                  title="Start Date"
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '3px 6px',
                    fontSize: '0.78rem',
                    color: '#1e1b4b',
                    outline: 'none',
                    background: '#ffffff',
                    fontFamily: 'inherit',
                  }}
                  title="End Date"
                />
              </div>
            )}

            {/* Clear Filters Button */}
            {(debouncedSearch || selectedCity !== 'all' || selectedOrders !== 'all' || selectedDate !== 'all' || startDate || endDate || activeCardFilter !== 'all' || sortConfig.key) && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  height: '40px',
                  padding: '0 0.85rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div
          ref={tableTopRef}
          className="table-container"
          style={{
            borderRadius: '16px',
            border: '1px solid #ede8f8',
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '980px' }}>
              <thead>
                <tr style={{ background: '#f5f0fe' }}>
                  {/* S.NO Column */}
                  <th
                    style={{
                      width: '56px',
                      padding: '1rem 0.5rem',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#5b21b6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    S.NO
                  </th>

                  {/* Customer Header (Sortable) */}
                  <th
                    onClick={() => handleSort('customer')}
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: sortConfig.key === 'customer' ? '#7c3aed' : '#5b21b6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    title="Click to sort by Customer name"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Customer</span>
                      {sortConfig.key === 'customer' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} color="#7c3aed" />
                        ) : (
                          <ArrowDown size={14} color="#7c3aed" />
                        )
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                      )}
                    </div>
                  </th>

                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Location</th>

                  {/* Orders Header (Right-Aligned & Sortable) */}
                  <th
                    onClick={() => handleSort('orders')}
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: sortConfig.key === 'orders' ? '#7c3aed' : '#5b21b6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    title="Click to sort by Orders count"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <span>Orders</span>
                      {sortConfig.key === 'orders' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} color="#7c3aed" />
                        ) : (
                          <ArrowDown size={14} color="#7c3aed" />
                        )
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                      )}
                    </div>
                  </th>

                  {/* Lifetime Value Header (Right-Aligned & Sortable) */}
                  <th
                    onClick={() => handleSort('spent')}
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: sortConfig.key === 'spent' ? '#7c3aed' : '#5b21b6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    title="Click to sort by Lifetime Value"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <span>Lifetime Value</span>
                      {sortConfig.key === 'spent' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} color="#7c3aed" />
                        ) : (
                          <ArrowDown size={14} color="#7c3aed" />
                        )
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                      )}
                    </div>
                  </th>

                  {/* Joined Header (Sortable & with Extra Left Padding so it doesn't touch Lifetime Value) */}
                  <th
                    onClick={() => handleSort('joined')}
                    style={{
                      padding: '1rem 1.25rem 1rem 2.2rem',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: sortConfig.key === 'joined' ? '#7c3aed' : '#5b21b6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    title="Click to sort by Joined date"
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Joined</span>
                      {sortConfig.key === 'joined' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} color="#7c3aed" />
                        ) : (
                          <ArrowDown size={14} color="#7c3aed" />
                        )
                      ) : (
                        <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                      )}
                    </div>
                  </th>

                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton Loading Rows */}
                {loading ? (
                  Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} style={{ borderBottom: '1px solid #f1eafa' }}>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ width: '20px', height: '14px', borderRadius: '4px', background: '#ede8f8', margin: '0 auto' }} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ede8f8', flexShrink: 0 }} />
                          <div style={{ width: '130px', height: '14px', borderRadius: '4px', background: '#ede8f8' }} />
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ width: '100px', height: '14px', borderRadius: '4px', background: '#ede8f8' }} />
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ width: '140px', height: '14px', borderRadius: '4px', background: '#ede8f8' }} />
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ width: '80px', height: '22px', borderRadius: '9999px', background: '#ede8f8' }} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ width: '60px', height: '14px', borderRadius: '4px', background: '#ede8f8', marginLeft: 'auto' }} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ width: '70px', height: '14px', borderRadius: '4px', background: '#ede8f8', marginLeft: 'auto' }} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem 1rem 2.2rem' }}>
                        <div style={{ width: '80px', height: '14px', borderRadius: '4px', background: '#ede8f8' }} />
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <div style={{ width: '110px', height: '32px', borderRadius: '8px', background: '#ede8f8', margin: '0 auto' }} />
                      </td>
                    </tr>
                  ))
                ) : sortedCustomers.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '4.5rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '50%',
                            background: '#f5f0fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#7c3aed',
                          }}
                        >
                          <Users size={30} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b' }}>
                          No customers found
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', maxWidth: '340px' }}>
                          We couldn't find any customer accounts matching your search query or active filter selections.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.55rem 1.25rem',
                            borderRadius: '10px',
                            background: '#ede8f8',
                            border: '1.5px solid #dcd0fa',
                            color: '#5b13df',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Clear filters</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Customer Rows (Clickable for Customer Detail Drawer) */
                  paginatedCustomers.map((c, index) => {
                    const rowBaseBg = index % 2 === 0 ? '#ffffff' : '#faf7ff';
                    return (
                      <tr
                        key={c._id}
                        onClick={() => setSelectedCustomerId(c._id)}
                        style={{
                          background: rowBaseBg,
                          borderBottom: '1px solid #f1eafa',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1e9fe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rowBaseBg;
                        }}
                        title="Click row to open customer profile drawer"
                      >
                      {/* S.NO */}
                      <td
                        style={{
                          padding: '0.95rem 0.5rem',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                          {startIndex + index + 1}
                        </span>
                      </td>

                      {/* Customer Name & Unverified Badge (Only when not verified) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="admin-customer-avatar">{c.name ? c.name[0] : 'U'}</div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1e1b4b', display: 'block' }}>
                              {c.name}
                            </strong>
                            {(c.isVerified === false || c.verified === false) && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginTop: '2px',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.02em',
                                }}
                              >
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mobile (tel: link with stopPropagation) */}
                      <td>
                        <a
                          href={`tel:${(c.phone || '').replace(/[^0-9+]/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#16a34a',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            textDecoration: 'none',
                          }}
                          title="Call customer"
                        >
                          <Phone size={12} /> {c.phone}
                        </a>
                      </td>

                      {/* Email (mailto: link with stopPropagation) */}
                      <td>
                        <a
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.84rem' }}
                          title="Send email to customer"
                        >
                          {c.email}
                        </a>
                      </td>

                      {/* Location */}
                      <td>
                        <span
                          style={{
                            background: '#ede8f8',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#5b21b6',
                          }}
                        >
                          {c.city}
                        </span>
                      </td>

                      {/* Orders (Right-Aligned) */}
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#1e1b4b' }}>
                          {c.totalOrders || c.ordersCount || 0}{' '}
                          {(c.totalOrders || c.ordersCount || 0) === 1 ? 'order' : 'orders'}
                        </strong>
                      </td>

                      {/* Lifetime Value (Right-Aligned) */}
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#7c3aed' }}>{formatPrice(c.totalSpent)}</strong>
                      </td>

                      {/* Joined Date (3-letter month with left spacing) */}
                      <td style={{ paddingLeft: '2.2rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          {formatDateShort(c.joinedDate)}
                        </span>
                      </td>

                      {/* Action: Green Outline "Chat WhatsApp" Button (with stopPropagation) */}
                      <td style={{ textAlign: 'center' }}>
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            c.name
                          )},%20from%20Picky%20Store!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.38rem 0.8rem',
                            borderRadius: '8px',
                            border: '1.5px solid #22c55e',
                            background: '#ffffff',
                            color: '#16a34a',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#16a34a';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#22c55e';
                          }}
                          title={`Chat with ${c.name} on WhatsApp`}
                        >
                          <MessageCircle size={14} color="#16a34a" />
                          <span>Chat WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && sortedCustomers.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.9rem 1.4rem',
                borderTop: '1px solid #f1eafa',
                background: '#fcfbfe',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              {/* Pagination Controls (First, Prev, 1 2 3 ... N, Next, Last) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* First Page (Hidden if only 1 page) */}
                {totalPages > 1 && (
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => handlePageChange(1)}
                    title="First Page"
                    aria-label="Go to first page"
                    style={{
                      height: '32px',
                      padding: '0 0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                      color: safeCurrentPage <= 1 ? '#94a3b8' : '#334155',
                      cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronsLeft size={14} />
                    <span>First</span>
                  </button>
                )}

                {/* Previous Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  title="Previous Page"
                  aria-label="Go to previous page"
                  style={{
                    height: '32px',
                    padding: '0 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                    color: safeCurrentPage <= 1 ? '#94a3b8' : '#334155',
                    cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                {/* Numbers with Ellipsis */}
                {getPaginationItems(safeCurrentPage, totalPages).map((pItem, idx) => {
                  if (pItem === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{
                          padding: '0 0.4rem',
                          color: '#94a3b8',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          userSelect: 'none',
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = pItem === safeCurrentPage;
                  return (
                    <button
                      key={pItem}
                      type="button"
                      onClick={() => handlePageChange(pItem)}
                      aria-label={`Go to page ${pItem}`}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isActive ? '#7c3aed' : '#e2e8f0',
                        background: isActive ? '#7c3aed' : '#ffffff',
                        color: isActive ? '#ffffff' : '#334155',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                      }}
                    >
                      {pItem}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  title="Next Page"
                  aria-label="Go to next page"
                  style={{
                    height: '32px',
                    padding: '0 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                    color: safeCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                    cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>

                {/* Last Page (Hidden if only 1 page) */}
                {totalPages > 1 && (
                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    title="Last Page"
                    aria-label="Go to last page"
                    style={{
                      height: '32px',
                      padding: '0 0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                      color: safeCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                      cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Last</span>
                    <ChevronsRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CUSTOMER DETAIL RIGHT-SIDE DRAWER ────────────────────────────── */}
      {selectedCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Customer details for ${selectedCustomer.name}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedCustomerId(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              animation: 'drawerFadeIn 0.2s ease',
            }}
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              height: '100vh',
              background: '#ffffff',
              boxShadow: '-8px 0 36px rgba(124, 58, 237, 0.14), -2px 0 12px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
              animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
            }}
          >
            {/* Drawer Top Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1eafa',
                background: '#faf8fe',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  {selectedCustomer.name ? selectedCustomer.name[0] : 'U'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#1e1b4b' }}>
                      {selectedCustomer.name}
                    </h3>
                    {selectedTier && (
                      <span
                        style={{
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: selectedTier.bg,
                          color: selectedTier.color,
                          border: `1px solid ${selectedTier.border}`,
                        }}
                      >
                        {selectedTier.label}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Joined {formatDateShort(selectedCustomer.joinedDate)}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Close customer drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem' }}>
              {/* Contact Information Box */}
              <div
                style={{
                  background: '#faf8fe',
                  border: '1px solid #ede8f8',
                  borderRadius: '14px',
                  padding: '1.1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#ede8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Mobile Phone</span>
                    <a
                      href={`tel:${(selectedCustomer.phone || '').replace(/[^0-9+]/g, '')}`}
                      style={{ fontSize: '0.86rem', fontWeight: 700, color: '#16a34a', textDecoration: 'none' }}
                    >
                      {selectedCustomer.phone}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#ede8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Email Address</span>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', textDecoration: 'none' }}
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#ede8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Location / City</span>
                    <strong style={{ fontSize: '0.86rem', color: '#1e1b4b' }}>{selectedCustomer.city}</strong>
                  </div>
                </div>

                {/* WhatsApp Chat Button inside Drawer */}
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                    selectedCustomer.name
                  )},%20from%20Picky%20Store!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    width: '100%',
                    padding: '0.55rem',
                    marginTop: '0.4rem',
                    borderRadius: '10px',
                    border: '1.5px solid #22c55e',
                    background: '#ffffff',
                    color: '#16a34a',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0fdf4';
                    e.currentTarget.style.borderColor = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#22c55e';
                  }}
                >
                  <MessageCircle size={15} color="#16a34a" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              {/* 3 Summary Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.65rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.75rem 0.6rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                    Total Orders
                  </span>
                  <strong style={{ fontSize: '1.15rem', color: '#1e1b4b' }}>
                    {selectedCustomer.totalOrders || selectedCustomer.ordersCount || 0}
                  </strong>
                </div>

                <div
                  style={{
                    background: '#faf5ff',
                    border: '1px solid #ede8f8',
                    borderRadius: '12px',
                    padding: '0.75rem 0.6rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                    Lifetime Value
                  </span>
                  <strong style={{ fontSize: '1rem', color: '#7c3aed' }}>
                    {formatPrice(selectedCustomer.totalSpent || 0)}
                  </strong>
                </div>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '12px',
                    padding: '0.75rem 0.6rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                    Avg Order Value
                  </span>
                  <strong style={{ fontSize: '1rem', color: '#15803d' }}>{formatPrice(selectedAov)}</strong>
                </div>
              </div>

              {/* Order History Section */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#1e1b4b' }}>
                    Order History ({selectedCustomerOrders.length})
                  </h4>
                </div>

                {selectedCustomerOrders.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1rem',
                      color: '#94a3b8',
                      background: '#faf8fe',
                      borderRadius: '12px',
                      border: '1px dashed #dcd0fa',
                    }}
                  >
                    <ShoppingBag size={30} style={{ opacity: 0.35, display: 'block', margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.84rem' }}>No recorded orders yet</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedCustomerOrders.map((ord) => {
                      const isDelivered = ord.status === 'delivered';
                      const isShipped = ord.status === 'shipped';
                      const statusBg = isDelivered ? '#dcfce7' : isShipped ? '#e0f2fe' : '#ede8f8';
                      const statusColor = isDelivered ? '#15803d' : isShipped ? '#0284c7' : '#7c3aed';
                      const statusBorder = isDelivered ? '#bbf7d0' : isShipped ? '#bae6fd' : '#dcd0fa';

                      return (
                        <div
                          key={ord._id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #ede8f8',
                            borderRadius: '12px',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                              <strong style={{ fontSize: '0.86rem', color: '#1e1b4b' }}>{ord.orderNumber}</strong>
                              <span
                                style={{
                                  padding: '0.12rem 0.45rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: statusBg,
                                  color: statusColor,
                                  border: `1px solid ${statusBorder}`,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {formatDateShort(ord.createdAt)}
                            </span>
                          </div>

                          <strong style={{ fontSize: '0.92rem', color: '#7c3aed' }}>
                            {formatPrice(ord.totalAmount)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

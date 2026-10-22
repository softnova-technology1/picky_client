import {
  RotateCcw,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Package,
  AlertTriangle,
  RefreshCw,
  CreditCard,
} from 'lucide-react';

export const RETURN_STATUS_TABS = [
  { key: 'all',        label: 'All Returns',      icon: RotateCcw,     color: '#7c3aed' },
  { key: 'pending',    label: 'Pending Review',   icon: Clock,         color: '#d97706' },
  { key: 'approved',   label: 'Pickup Scheduled', icon: Truck,         color: '#2563eb' },
  { key: 'in_transit', label: 'In-Transit',       icon: RefreshCw,     color: '#0891b2' },
  { key: 'inspected',  label: 'Inspected',        icon: ShieldCheck,   color: '#059669' },
  { key: 'refunded',   label: 'Refunded',         icon: CheckCircle2,  color: '#16a34a' },
  { key: 'rejected',   label: 'Rejected',         icon: XCircle,       color: '#dc2626' },
];

export const RETURN_STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a',
  },
  approved: {
    label: 'Pickup Scheduled',
    icon: Truck,
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
  },
  in_transit: {
    label: 'Reverse In-Transit',
    icon: RefreshCw,
    bg: '#ecfeff',
    color: '#0e7490',
    border: '#a5f3fc',
  },
  inspected: {
    label: 'Inspected & Passed',
    icon: ShieldCheck,
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#bbf7d0',
  },
  refunded: {
    label: 'Refund Completed',
    icon: CheckCircle2,
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0',
  },
  rejected: {
    label: 'Return Rejected',
    icon: XCircle,
    bg: '#fef2f2',
    color: '#b91c1c',
    border: '#fecaca',
  },
};

export const RETURN_REASONS = [
  'Wrong Size / Fit Issue',
  'Fabric Defective / Damaged Piece',
  'Different from Product Image',
  'Color Mismatch',
  'Quality Unsatisfactory',
  'Customer Changed Mind',
  'Received Wrong Item',
];

export const REVERSE_COURIERS = [
  'Delhivery Reverse Logistics',
  'Shadowfax Reverse Express',
  'Blue Dart Surface Return',
  'XpressBees Reverse Courier',
  'Ecom Express Reverse',
];

export const REFUND_METHODS = [
  'Original Payment Method (Razorpay Instant)',
  'Store Wallet / Store Credit',
  'Direct Bank Transfer (NEFT/IMPS)',
];

export const INITIAL_RETURNS_DATA = [];


// ─── Picky Centralized Orders & Dispatch Mock Data & Configurations ──────────
// Single source of truth for Order statuses, tabs, progression flow, cancellation reasons, and couriers.

import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  BadgeCheck,
  XCircle,
} from 'lucide-react';

// ─── Status Filter Tabs Configuration ────────────────────────────────────────
export const STATUS_TABS = [
  { key: 'all',       label: 'All Orders',      icon: ShoppingBag, color: '#7c3aed' },
  { key: 'confirmed', label: 'Order Confirmed', icon: Clock,       color: '#d97706' },
  { key: 'packing',   label: 'Order Packing',   icon: Package,     color: '#8b5cf6' },
  { key: 'shipped',   label: 'Order Shipping',  icon: Truck,       color: '#2563eb' },
  { key: 'delivered', label: 'Order Delivered', icon: BadgeCheck,  color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled Order', icon: XCircle,     color: '#dc2626' },
];

// ─── Status Visual & Badge Configuration ─────────────────────────────────────
export const STATUS_CFG = {
  confirmed: { cls: 'adm-status-processing', label: 'Order Confirmed', icon: Clock,      bg: '#fffbeb', color: '#b45309' },
  packing:   { cls: 'adm-status-processing', label: 'Order Packing',   icon: Package,    bg: '#f3e8ff', color: '#7c3aed' },
  shipped:   { cls: 'adm-status-shipped',    label: 'Order Shipping',  icon: Truck,      bg: '#eff6ff', color: '#1d4ed8' },
  delivered: { cls: 'adm-status-delivered',  label: 'Order Delivered', icon: BadgeCheck, bg: '#f0fdf4', color: '#15803d' },
  cancelled: { cls: 'adm-status-cancelled',  label: 'Cancelled Order', icon: XCircle,    bg: '#fef2f2', color: '#b91c1c' },
};

// ─── Order Cancellation Reasons ──────────────────────────────────────────────
export const CANCEL_REASONS = [
  'Out of Stock',
  'Customer Requested Cancellation',
  'Payment Failure / Not Received',
  'Incorrect Order Details',
  'Courier / Logistics Issue',
  'Other',
];

// ─── Status Dropdown Selection Options ────────────────────────────────────────
export const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Order Confirmed', icon: Clock,      color: '#b45309', bg: '#fffbeb' },
  { value: 'packing',   label: 'Order Packing',   icon: Package,    color: '#7c3aed', bg: '#f3e8ff' },
  { value: 'shipped',   label: 'Order Shipping',  icon: Truck,      color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'delivered', label: 'Order Delivered', icon: BadgeCheck, color: '#15803d', bg: '#f0fdf4' },
  { value: 'cancelled', label: 'Cancelled Order', icon: XCircle,    color: '#b91c1c', bg: '#fef2f2' },
];

// ─── Order Progress Steps Flow ───────────────────────────────────────────────
export const ORDER_PROGRESS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: Clock,      color: '#b45309', bg: '#fffbeb' },
  { key: 'packing',   label: 'Packing',   icon: Package,    color: '#7c3aed', bg: '#f3e8ff' },
  { key: 'shipped',   label: 'Shipping',  icon: Truck,      color: '#1d4ed8', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered', icon: BadgeCheck, color: '#15803d', bg: '#f0fdf4' },
];

// ─── Filter Options for Admin Orders ─────────────────────────────────────────
export const DATE_FILTER_OPTIONS = [
  { value: 'all',        label: 'All Dates' },
  { value: 'today',      label: 'Today' },
  { value: 'yesterday',  label: 'Yesterday' },
  { value: '7days',      label: 'Last 7 Days' },
  { value: '30days',     label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
];

export const PRICE_FILTER_OPTIONS = [
  { value: 'all',        label: 'All Prices' },
  { value: 'under1000',  label: 'Under ₹1,000' },
  { value: '1000to2500', label: '₹1,000 – ₹2,500' },
  { value: '2500to5000', label: '₹2,500 – ₹5,000' },
  { value: 'above5000',  label: 'Above ₹5,000' },
];

export const QUANTITY_FILTER_OPTIONS = [
  { value: 'all',   label: 'All Quantities' },
  { value: '1',     label: '1 Item' },
  { value: '2to3',  label: '2 – 3 Items' },
  { value: '4plus', label: '4+ Items' },
];

export const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'amount_high', label: 'Price: High to Low' },
  { value: 'amount_low',  label: 'Price: Low to High' },
];

// ─── Common Logistics & Couriers ─────────────────────────────────────────────
export const COMMON_COURIERS = [
  'DTDC Express',
  'BlueDart Express',
  'Delhivery',
  'India Post Speed Post',
  'Ecom Express',
  'Shadowfax',
  'Xpressbees',
  'Professional Couriers',
];

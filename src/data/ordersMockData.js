// ─── Picky Centralized Orders & Dispatch Mock Data & Configurations ──────────
// Single source of truth for Order statuses, tabs, progression flow, cancellation reasons, and couriers.

import {
  ShoppingBag,
  Clock,
  Package,
  PackageCheck,
  Truck,
  BadgeCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// ─── Status Filter Tabs Configuration ────────────────────────────────────────
// ─── Status Filter Tabs Configuration ────────────────────────────────────────
export const STATUS_TABS = [
  { key: 'all',       label: 'All Orders',      icon: ShoppingBag,   color: '#7c3aed' },
  { key: 'placed',    label: 'Order Placed',    icon: ShoppingBag,   color: '#7c3aed' },
  { key: 'confirmed', label: 'Confirmed',       icon: CheckCircle2,  color: '#d97706' },
  { key: 'shipped',   label: 'Shipped',         icon: Truck,         color: '#2563eb' },
  { key: 'delivered', label: 'Delivered',       icon: PackageCheck,  color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled Order', icon: XCircle,       color: '#dc2626' },
];

// ─── Status Visual & Badge Configuration ─────────────────────────────────────
export const STATUS_CFG = {
  placed:    { cls: 'adm-status-processing', label: 'Order Placed', desc: 'Customer order place செய்துவிட்டார்.', icon: ShoppingBag,   bg: '#f5f3ff', color: '#6d28d9' },
  confirmed: { cls: 'adm-status-processing', label: 'Confirmed',    desc: 'Admin order-ஐ confirm செய்துவிட்டார்.', icon: CheckCircle2,  bg: '#fffbeb', color: '#b45309' },
  packing:   { cls: 'adm-status-processing', label: 'Packing',      desc: 'Packing in warehouse',                  icon: Package,       bg: '#f3e8ff', color: '#7c3aed' },
  shipped:   { cls: 'adm-status-shipped',    label: 'Shipped',      desc: 'Order courier-க்கு அனுப்பப்பட்டுவிட்டது.',  icon: Truck,         bg: '#eff6ff', color: '#1d4ed8' },
  delivered: { cls: 'adm-status-delivered',  label: 'Delivered',    desc: 'Customer-க்கு order கிடைத்துவிட்டது.',    icon: PackageCheck,  bg: '#f0fdf4', color: '#15803d' },
  cancelled: { cls: 'adm-status-cancelled',  label: 'Cancelled',    desc: 'Order cancel செய்யப்பட்டது.',             icon: XCircle,       bg: '#fef2f2', color: '#b91c1c' },
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
  { value: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#b45309', bg: '#fffbeb' },
  { value: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#15803d', bg: '#f0fdf4' },
  { value: 'cancelled', label: 'Cancelled',    icon: XCircle,       color: '#b91c1c', bg: '#fef2f2' },
];

// ─── Order Progress Steps Flow (Customer Placed -> Confirmed -> Shipped -> Delivered) ──
export const ORDER_PROGRESS_STEPS = [
  { key: 'placed',    label: 'Order Placed', desc: 'Customer order place செய்துவிட்டார்.', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'confirmed', label: 'Confirmed',    desc: 'Admin order-ஐ confirm செய்துவிட்டார்.', icon: CheckCircle2,  color: '#d97706', bg: '#fffbeb' },
  { key: 'shipped',   label: 'Shipped',      desc: 'Order courier-க்கு அனுப்பப்பட்டுவிட்டது.',  icon: Truck,         color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered',    desc: 'Customer-க்கு order கிடைத்துவிட்டது.',    icon: PackageCheck,  color: '#16a34a', bg: '#f0fdf4' },
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

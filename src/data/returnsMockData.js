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

export const INITIAL_RETURNS_DATA = [
  {
    id: 'RET-20261012-8812',
    orderNumber: 'PKY-20261012-0A91D4C7',
    createdAt: '2026-10-12T19:40:00Z',
    customer: {
      name: 'Store Administrator',
      phone: '+919876543210',
      email: 'admin@picky.com',
      address: 'Mariyammankovil kottagudi, Pattukkottai, Tamil Nadu - 614602',
    },
    item: {
      name: 'Pure Handloom Madurai Sungudi Saree',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
      sku: 'F-WOM-989',
      variant: 'Maroon & Mustard Yellow',
      quantity: 1,
      price: 561,
      refundAmount: 561,
    },
    reason: 'Wrong Size / Fit Issue',
    customerNote: 'The pallu border pattern does not match my preference. Want to exchange for Navy Blue.',
    proofImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'
    ],
    status: 'pending',
    refundMethod: 'Original Payment Method (Razorpay Instant)',
    refundStatus: 'pending',
    courier: null,
    awbNumber: null,
    scheduledPickupDate: null,
    timeline: [
      { status: 'pending', note: 'Customer requested return online', timestamp: '2026-10-12T19:40:00Z' }
    ]
  },
  {
    id: 'RET-20261011-7429',
    orderNumber: 'PKY-20261010-768A5BC3',
    createdAt: '2026-10-11T14:15:00Z',
    customer: {
      name: 'deepak gopika',
      phone: '+919345047432',
      email: 'thangadeepakdeepak05@gmail.com',
      address: 'Mariyammankovil kottagudi, Pattukkottai, Tamil Nadu - 614602',
    },
    item: {
      name: 'Premium Slim Fit Cotton Linen Shirt',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
      sku: 'F-MEN-904',
      variant: 'Size L / Sky Blue',
      quantity: 1,
      price: 561,
      refundAmount: 561,
    },
    reason: 'Fabric Defective / Damaged Piece',
    customerNote: 'Small thread tear observed near the left pocket seam on unpacking.',
    proofImages: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300'
    ],
    status: 'approved',
    refundMethod: 'Original Payment Method (Razorpay Instant)',
    refundStatus: 'pending',
    courier: 'Delhivery Reverse Logistics',
    awbNumber: 'DEL-REV-982143098',
    scheduledPickupDate: '2026-10-13',
    timeline: [
      { status: 'pending', note: 'Return initiated by customer', timestamp: '2026-10-11T14:15:00Z' },
      { status: 'approved', note: 'Approved by Admin. Reverse pickup scheduled with Delhivery.', timestamp: '2026-10-11T16:00:00Z' }
    ]
  },
  {
    id: 'RET-20261010-6190',
    orderNumber: 'PKY-20261010-F26C295D',
    createdAt: '2026-10-10T12:30:00Z',
    customer: {
      name: 'Priya Ramesh',
      phone: '+919876543219',
      email: 'priya.ramesh@gmail.com',
      address: '42, North Mada Street, Mylapore, Chennai, Tamil Nadu - 600004',
    },
    item: {
      name: 'Traditional Brass Annam Vilakku Lamp',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300',
      sku: 'HK-HOM-860',
      variant: 'Standard / Antique Brass',
      quantity: 1,
      price: 860,
      refundAmount: 860,
    },
    reason: 'Different from Product Image',
    customerNote: 'Ordered the 12-inch version, received the 9-inch model by mistake.',
    proofImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'
    ],
    status: 'refunded',
    refundMethod: 'Original Payment Method (Razorpay Instant)',
    refundStatus: 'completed',
    razorpayRefundId: 'rfnd_PWk891726a',
    courier: 'Shadowfax Reverse Express',
    awbNumber: 'SFX-RET-44102941',
    scheduledPickupDate: '2026-10-10',
    timeline: [
      { status: 'pending', note: 'Return requested', timestamp: '2026-10-10T12:30:00Z' },
      { status: 'approved', note: 'Reverse pickup booked', timestamp: '2026-10-10T13:45:00Z' },
      { status: 'in_transit', note: 'Picked up by Shadowfax reverse agent', timestamp: '2026-10-10T17:10:00Z' },
      { status: 'inspected', note: 'Warehouse inspection passed. Tags and brass polish intact.', timestamp: '2026-10-11T11:00:00Z' },
      { status: 'refunded', note: 'Razorpay Instant Refund processed (Ref: rfnd_PWk891726a)', timestamp: '2026-10-11T11:30:00Z' }
    ]
  },
  {
    id: 'RET-20261009-5102',
    orderNumber: 'PKY-20261008-89B721EF',
    createdAt: '2026-10-09T09:20:00Z',
    customer: {
      name: 'Karthik Subramanian',
      phone: '+919443210987',
      email: 'karthik.subbu@gmail.com',
      address: '15/2, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
    },
    item: {
      name: 'Handcrafted Terracotta Tea Cup Set (6 Pcs)',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300',
      sku: 'HK-HOM-320',
      variant: 'Earthen Brown (Set of 6)',
      quantity: 1,
      price: 499,
      refundAmount: 499,
    },
    reason: 'Customer Changed Mind',
    customerNote: 'Used product for a puja function and now requesting return.',
    proofImages: [],
    status: 'rejected',
    refundMethod: 'Original Payment Method (Razorpay Instant)',
    refundStatus: 'rejected',
    rejectionReason: 'Product policy violation: Items used for domestic events cannot be accepted under 7-day return policy.',
    timeline: [
      { status: 'pending', note: 'Return requested online', timestamp: '2026-10-09T09:20:00Z' },
      { status: 'rejected', note: 'Rejected: Used items do not qualify for return', timestamp: '2026-10-09T11:00:00Z' }
    ]
  }
];

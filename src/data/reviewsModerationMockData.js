import {
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const REVIEW_STATUS_TABS = [
  { key: 'all',       label: 'All Reviews',     icon: MessageSquare, color: '#7c3aed' },
  { key: 'pending',   label: 'Pending Review',  icon: Clock,         color: '#d97706' },
  { key: 'published', label: 'Published',       icon: CheckCircle2,  color: '#16a34a' },
  { key: 'flagged',   label: 'Flagged / Spam',  icon: AlertTriangle, color: '#dc2626' },
  { key: 'photos',    label: 'With Photos',     icon: Camera,        color: '#2563eb' },
];

export const REVIEW_STATUS_CONFIG = {
  published: {
    label: 'Published',
    icon: CheckCircle2,
    bg: '#ecfdf5',
    color: '#059669',
    border: '#a7f3d0',
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
  },
  flagged: {
    label: 'Flagged / Spam',
    icon: AlertTriangle,
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
  },
};

export const INITIAL_REVIEWS_MODERATION_DATA = [];

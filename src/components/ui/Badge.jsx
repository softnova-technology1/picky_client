import React from 'react';

export default function Badge({ status, text, variant }) {
  const normalizedStatus = (status || '').toLowerCase();
  let badgeClass = 'badge-primary';

  if (variant) {
    badgeClass = `badge-${variant}`;
  } else if (normalizedStatus === 'confirmed') {
    badgeClass = 'badge-confirmed';
  } else if (normalizedStatus === 'shipped') {
    badgeClass = 'badge-shipped';
  } else if (normalizedStatus === 'out_for_delivery') {
    badgeClass = 'badge-out_for_delivery';
  } else if (normalizedStatus === 'delivered') {
    badgeClass = 'badge-delivered';
  } else if (normalizedStatus === 'cancelled') {
    badgeClass = 'badge-cancelled';
  }

  const displayText = text || (status === 'out_for_delivery' ? 'Out for Delivery' : status);

  return (
    <span className={`badge ${badgeClass}`}>
      {displayText}
    </span>
  );
}

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
  } else if (normalizedStatus === 'delivered') {
    badgeClass = 'badge-delivered';
  } else if (normalizedStatus === 'cancelled') {
    badgeClass = 'badge-cancelled';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {text || status}
    </span>
  );
}

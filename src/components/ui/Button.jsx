import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const blockClass = block ? 'btn-block' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="spinner-border" style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

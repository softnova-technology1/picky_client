import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label,
  id,
  minWidth = '170px',
  width = 'auto',
  ariaLabel,
  align = 'left', // 'left' | 'right'
  direction = 'down', // 'down' | 'up'
  height = '40px',
  borderRadius = '10px',
  buttonStyle = {},
  containerStyle = {},
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside (support both mousedown and touchstart for mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((opt) => opt.value === value) || 0);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.findIndex((opt) => opt.value === value) || 0);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (isOpen) {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      } else {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: width === '100%' ? 'block' : 'inline-block',
        width,
        minWidth,
        zIndex: isOpen ? 100 : 1,
        ...containerStyle,
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.45rem',
          width: '100%',
          height,
          padding: '0 0.85rem',
          borderRadius,
          border: isOpen ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
          background: '#ffffff',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: '#1e1b4b',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(124, 58, 237, 0.16)'
            : '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.18s ease',
          boxSizing: 'border-box',
          ...buttonStyle,
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.16)';
          }
        }}
        onBlur={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
          }
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'left',
            flex: 1,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: '#7c3aed',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          style={{
            position: 'absolute',
            ...(direction === 'up'
              ? { bottom: 'calc(100% + 6px)', top: 'auto' }
              : { top: 'calc(100% + 6px)', bottom: 'auto' }),
            ...(align === 'right' ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
            width: 'max-content',
            minWidth: '100%',
            maxWidth: 'min(280px, calc(100vw - 2rem))',
            maxHeight: '260px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1.5px solid #ddd6fe',
            boxShadow: '0 12px 30px rgba(124, 58, 237, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06)',
            zIndex: 1050,
            padding: '0.4rem',
            margin: 0,
            listStyle: 'none',
            boxSizing: 'border-box',
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#7c3aed' : '#1e1b4b',
                  background: isSelected
                    ? '#f5f3ff'
                    : isHighlighted
                      ? '#faf5ff'
                      : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                  userSelect: 'none',
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {opt.label}
                </span>
                {isSelected && <Check size={14} color="#7c3aed" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

/**
 * 12-Hour DateTimePicker Component
 * Emits standard ISO string "YYYY-MM-DDTHH:mm" for seamless compatibility.
 * Displays formatted 12-hour datetime (e.g. "20 Oct 2026, 08:30 PM").
 */
export default function DateTimePicker12h({
  value,
  onChange,
  placeholder = 'Select date & time (12h)',
  align = 'left', // 'left' | 'right'
  disabled = false,
  style = {},
}) {
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);

  // Parse initial or fallback state
  const parseStateFromValue = (val) => {
    const now = new Date();
    if (!val) {
      return {
        hasValue: false,
        year: now.getFullYear(),
        month: now.getMonth(), // 0-11
        day: null,
        hour12: 12,
        minute: 0,
        ampm: 'AM',
      };
    }

    const d = new Date(val);
    if (isNaN(d.getTime())) {
      return {
        hasValue: false,
        year: now.getFullYear(),
        month: now.getMonth(),
        day: null,
        hour12: 12,
        minute: 0,
        ampm: 'AM',
      };
    }

    const h24 = d.getHours();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;

    return {
      hasValue: true,
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour12,
      minute: d.getMinutes(),
      ampm,
    };
  };

  const parsed = parseStateFromValue(value);

  // Navigation calendar state (allows browsing other months without changing selected date)
  const [navYear, setNavYear] = useState(parsed.year);
  const [navMonth, setNavMonth] = useState(parsed.month);

  // Working selection state inside popover
  const [selectedDay, setSelectedDay] = useState(parsed.day);
  const [selectedYear, setSelectedYear] = useState(parsed.year);
  const [selectedMonth, setSelectedMonth] = useState(parsed.month);
  const [selectedHour, setSelectedHour] = useState(parsed.hour12);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedAmPm, setSelectedAmPm] = useState(parsed.ampm);

  // Sync internal state when external value changes
  useEffect(() => {
    const p = parseStateFromValue(value);
    setNavYear(p.year);
    setNavMonth(p.month);
    setSelectedYear(p.year);
    setSelectedMonth(p.month);
    setSelectedDay(p.day);
    setSelectedHour(p.hour12);
    setSelectedMinute(p.minute);
    setSelectedAmPm(p.ampm);
  }, [value]);

  // Handle open / close & smart upward positioning
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Popover height ~ 330px
      if (spaceBelow < 340 && spaceAbove > 340) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen(!isOpen);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll selected hour & minute into center view when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourListRef.current) {
          const activeHour = hourListRef.current.querySelector('[data-selected="true"]');
          if (activeHour) {
            activeHour.scrollIntoView({ block: 'center', behavior: 'auto' });
          }
        }
        if (minuteListRef.current) {
          const activeMin = minuteListRef.current.querySelector('[data-selected="true"]');
          if (activeMin) {
            activeMin.scrollIntoView({ block: 'center', behavior: 'auto' });
          }
        }
      }, 50);
    }
  }, [isOpen]);

  // Convert 12-hour components to ISO string and emit
  const emitChange = (y, m, d, h12, min, ap) => {
    if (!d) return;
    let h24;
    if (ap === 'PM') {
      h24 = h12 === 12 ? 12 : h12 + 12;
    } else {
      h24 = h12 === 12 ? 0 : h12;
    }

    const YYYY = String(y).padStart(4, '0');
    const MM = String(m + 1).padStart(2, '0');
    const DD = String(d).padStart(2, '0');
    const HH = String(h24).padStart(2, '0');
    const mm = String(min).padStart(2, '0');

    const isoStr = `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
    onChange(isoStr);
  };

  // Select day handler
  const handleSelectDay = (y, m, d) => {
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(d);
    emitChange(y, m, d, selectedHour, selectedMinute, selectedAmPm);
  };

  // Hour click handler
  const handleSelectHour = (h) => {
    setSelectedHour(h);
    const day = selectedDay || new Date().getDate();
    const y = selectedDay ? selectedYear : new Date().getFullYear();
    const m = selectedDay ? selectedMonth : new Date().getMonth();
    if (!selectedDay) {
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(day);
    }
    emitChange(y, m, day, h, selectedMinute, selectedAmPm);
  };

  // Minute click handler
  const handleSelectMinute = (min) => {
    setSelectedMinute(min);
    const day = selectedDay || new Date().getDate();
    const y = selectedDay ? selectedYear : new Date().getFullYear();
    const m = selectedDay ? selectedMonth : new Date().getMonth();
    if (!selectedDay) {
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(day);
    }
    emitChange(y, m, day, selectedHour, min, selectedAmPm);
  };

  // AM / PM toggle handler
  const handleSelectAmPm = (ap) => {
    setSelectedAmPm(ap);
    const day = selectedDay || new Date().getDate();
    const y = selectedDay ? selectedYear : new Date().getFullYear();
    const m = selectedDay ? selectedMonth : new Date().getMonth();
    if (!selectedDay) {
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(day);
    }
    emitChange(y, m, day, selectedHour, selectedMinute, ap);
  };

  // Quick Action: Today
  const handleToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const h24 = now.getHours();
    const ap = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const min = now.getMinutes();

    setNavYear(y);
    setNavMonth(m);
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(d);
    setSelectedHour(h12);
    setSelectedMinute(min);
    setSelectedAmPm(ap);
    emitChange(y, m, d, h12, min, ap);
  };

  // Quick Action: Clear
  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setSelectedDay(null);
    onChange('');
  };

  // Month navigation
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(navYear - 1);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(navYear + 1);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  // Calendar cells generation (Monday start)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const firstDayOfMonth = new Date(navYear, navMonth, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const firstDayCol = (dayOfWeek + 6) % 7; // 0 for Monday ... 6 for Sunday

  const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(navYear, navMonth, 0).getDate();

  const totalCells = Math.ceil((firstDayCol + daysInMonth) / 7) * 7;
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = 0; i < firstDayCol; i++) {
    const d = daysInPrevMonth - firstDayCol + 1 + i;
    const prevMonthIdx = navMonth === 0 ? 11 : navMonth - 1;
    const prevYear = navMonth === 0 ? navYear - 1 : navYear;
    calendarCells.push({
      day: d,
      month: prevMonthIdx,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      month: navMonth,
      year: navYear,
      isCurrentMonth: true,
    });
  }

  // 3. Next month leading days
  const remaining = totalCells - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = navMonth === 11 ? 0 : navMonth + 1;
    const nextYear = navMonth === 11 ? navYear + 1 : navYear;
    calendarCells.push({
      day: d,
      month: nextMonthIdx,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const isToday = (y, m, d) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const isSelected = (y, m, d) =>
    selectedDay !== null &&
    selectedYear === y &&
    selectedMonth === m &&
    selectedDay === d;

  // Formatted display text (e.g. "20 Oct 2026, 08:30 PM")
  const formatDisplay = () => {
    if (!value || !parsed.hasValue || selectedDay === null) return '';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthShort = monthNames[d.getMonth()].slice(0, 3);
      const yearStr = d.getFullYear();

      const h24 = d.getHours();
      const ap = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const hStr = String(h12).padStart(2, '0');
      const mStr = String(d.getMinutes()).padStart(2, '0');

      return `${dayStr} ${monthShort} ${yearStr}, ${hStr}:${mStr} ${ap}`;
    } catch (_) {
      return '';
    }
  };

  const hoursArray = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  const minutesArray = Array.from({ length: 60 }, (_, i) => i); // 00 to 59

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      <style>{`
        @keyframes dtPickerFadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {/* ── TRIGGER INPUT FIELD ── */}
      <div
        onClick={handleToggle}
        style={{
          width: '100%',
          height: '42px',
          padding: '0 0.85rem',
          borderRadius: '6px',
          border: isOpen ? '1.5px solid #b48348' : '1px solid #e2e8f0',
          background: disabled ? '#f8fafc' : '#fafafa',
          color: parsed.hasValue && selectedDay !== null ? '#1e293b' : '#94a3b8',
          fontSize: '0.84rem',
          fontWeight: parsed.hasValue && selectedDay !== null ? 500 : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(180, 131, 72, 0.12)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
          <CalendarIcon size={15} style={{ color: '#b48348', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {formatDisplay() || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <X size={13} />
            </button>
          )}
          <Clock size={14} style={{ color: '#94a3b8' }} />
        </div>
      </div>

      {/* ── DROPDOWN POPOVER ── */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            ...(openUpward
              ? { bottom: 'calc(100% + 6px)' }
              : { top: 'calc(100% + 6px)' }),
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            width: '390px',
            maxWidth: '92vw',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 18px 40px -8px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(0,0,0,0.06)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'dtPickerFadeIn 0.15s ease-out',
          }}
        >
          {/* Header Banner: 12-Hour Selection Preview */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: '#fcfbfa',
              borderBottom: '1px solid #f1ece4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Date &amp; Time{' '}
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#fef3c7',
                  color: '#b45309',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
              >
                12-HR
              </span>
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#b48348' }}>
              {selectedDay !== null
                ? `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedAmPm}`
                : 'Select Date & Time'}
            </div>
          </div>

          {/* Main Body: Left (Calendar) + Right (12h Time) */}
          <div style={{ display: 'flex', minHeight: '270px' }}>
            {/* ── LEFT PANE: CALENDAR ── */}
            <div
              style={{
                width: '235px',
                padding: '0.85rem 0.9rem',
                borderRight: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Month & Year Navigation Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {monthNames[navMonth]}, {navYear}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekday Names (Mo, Tu, We, Th, Fr, Sa, Su) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    marginBottom: '0.35rem',
                  }}
                >
                  {weekDays.map((w) => (
                    <div key={w} style={{ padding: '2px 0' }}>
                      {w}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    textAlign: 'center',
                  }}
                >
                  {calendarCells.map((cell, idx) => {
                    const sel = isSelected(cell.year, cell.month, cell.day);
                    const tod = isToday(cell.year, cell.month, cell.day);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          border: tod && !sel ? '1.5px solid #b48348' : 'none',
                          background: sel ? '#b48348' : 'transparent',
                          color: sel
                            ? '#ffffff'
                            : cell.isCurrentMonth
                            ? '#1e293b'
                            : '#cbd5e1',
                          fontWeight: sel || tod ? 700 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          padding: 0,
                          margin: 'auto',
                          transition: 'all 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!sel) e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          if (!sel) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Links: Clear / Today (Matches Screenshot) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid #f1f5f9',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleToday}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: '#b48348',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#9e713c')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#b48348')}
                >
                  Today
                </button>
              </div>
            </div>

            {/* ── RIGHT PANE: 12-HOUR TIME SELECTOR ── */}
            <div
              style={{
                flex: 1,
                padding: '0.85rem 0.65rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}
            >
              <div>
                {/* Column Headers: Hour / Min / AM-PM */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 40px 48px',
                    gap: '4px',
                    textAlign: 'center',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  <div>Hr (12)</div>
                  <div>Min</div>
                  <div>Period</div>
                </div>

                {/* 3 Scrollable / Selectable Columns */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 40px 48px',
                    gap: '4px',
                    height: '180px',
                  }}
                >
                  {/* Column 1: Hours (01 - 12) */}
                  <div
                    ref={hourListRef}
                    style={{
                      height: '100%',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      paddingRight: '2px',
                    }}
                  >
                    {hoursArray.map((h) => {
                      const isSel = selectedHour === h;
                      return (
                        <div
                          key={h}
                          data-selected={isSel ? 'true' : 'false'}
                          onClick={() => handleSelectHour(h)}
                          style={{
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '5px',
                            background: isSel ? '#b48348' : 'transparent',
                            color: isSel ? '#ffffff' : '#334155',
                            fontWeight: isSel ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            marginBottom: '2px',
                            transition: 'all 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSel) e.currentTarget.style.background = '#e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {String(h).padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 2: Minutes (00 - 59) */}
                  <div
                    ref={minuteListRef}
                    style={{
                      height: '100%',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      paddingRight: '2px',
                    }}
                  >
                    {minutesArray.map((m) => {
                      const isSel = selectedMinute === m;
                      return (
                        <div
                          key={m}
                          data-selected={isSel ? 'true' : 'false'}
                          onClick={() => handleSelectMinute(m)}
                          style={{
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '5px',
                            background: isSel ? '#b48348' : 'transparent',
                            color: isSel ? '#ffffff' : '#334155',
                            fontWeight: isSel ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            marginBottom: '2px',
                            transition: 'all 0.1s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSel) e.currentTarget.style.background = '#e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {String(m).padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 3: AM / PM Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['AM', 'PM'].map((ap) => {
                      const isSel = selectedAmPm === ap;
                      return (
                        <button
                          key={ap}
                          type="button"
                          onClick={() => handleSelectAmPm(ap)}
                          style={{
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: isSel ? 'none' : '1px solid #cbd5e1',
                            background: isSel ? '#b48348' : '#ffffff',
                            color: isSel ? '#ffffff' : '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 2px 4px rgba(180, 131, 72, 0.25)' : 'none',
                          }}
                        >
                          {ap}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Confirm / Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0',
                  marginTop: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#b48348',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#9e713c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#b48348')}
              >
                <Check size={13} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

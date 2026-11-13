const MONTHS_3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIsoDateParts(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(raw.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const test = new Date(year, month - 1, day);
  if (
    test.getFullYear() !== year ||
    test.getMonth() !== month - 1 ||
    test.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function getLocalTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDobToIso(raw) {
  if (!raw) return '';
  const isoParts = parseIsoDateParts(String(raw));
  if (isoParts) {
    return `${isoParts.year}-${String(isoParts.month).padStart(2, '0')}-${String(isoParts.day).padStart(2, '0')}`;
  }
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_3[date.getMonth()];
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} ${month} ${year}, ${time}`;
}

export function formatDateShort(dateString) {
  if (!dateString) return '—';
  const isoParts = parseIsoDateParts(String(dateString));
  if (isoParts) {
    return `${String(isoParts.day).padStart(2, '0')} ${MONTHS_3[isoParts.month - 1]} ${isoParts.year}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_3[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

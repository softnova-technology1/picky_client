import { authService } from '../services/auth.service';
import { getLocalTodayIso, normalizeDobToIso } from './formatDate';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and persists a single customer profile field (`name`, `email`, or `dob`)
 * to the backend and synchronizes the Zustand auth store.
 */
export async function saveProfileField({ field, value, updateUser, allowEmpty = false }) {
  let cleanValue = typeof value === 'string' ? value.trim() : '';

  if (field === 'name') {
    if (!cleanValue) {
      return { ok: false, error: 'Name cannot be empty' };
    }
  } else if (field === 'email') {
    cleanValue = cleanValue.toLowerCase();
    if (!cleanValue && !allowEmpty) {
      return { ok: false, error: 'Please enter an email address' };
    }
    if (cleanValue && !EMAIL_RE.test(cleanValue)) {
      return { ok: false, error: 'Please enter a valid email address' };
    }
  } else if (field === 'dob') {
    if (!cleanValue) {
      if (!allowEmpty) {
        return { ok: false, error: 'Please select your date of birth' };
      }
      cleanValue = '';
    } else {
      const normalized = normalizeDobToIso(cleanValue);
      const todayIso = getLocalTodayIso();
      if (!normalized || normalized < '1900-01-01' || normalized > todayIso) {
        return { ok: false, error: 'Please choose a valid past date of birth' };
      }
      cleanValue = normalized;
    }
  } else {
    return { ok: false, error: 'Unsupported profile field' };
  }

  try {
    const res = await authService.updateProfile({ [field]: cleanValue });
    const serverUser = res?.data && typeof res.data === 'object' ? res.data : res;
    const syncedVal =
      serverUser?.[field] !== undefined ? serverUser[field] : cleanValue;

    if (typeof updateUser === 'function') {
      updateUser({ [field]: syncedVal });
    }
    return { ok: true, value: syncedVal, user: serverUser };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      `Failed to update ${field}`;
    return { ok: false, error: message };
  }
}

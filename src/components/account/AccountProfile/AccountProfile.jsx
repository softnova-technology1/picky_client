import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { authService } from '../../../services/auth.service';
import Button from '../../ui/Button';
import { formatDateShort } from '../../../utils/formatDate';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  X,
  User,
  Mail,
  Calendar,
} from 'lucide-react';
import styles from './AccountProfile.module.css';

export default function AccountProfile() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUiStore();

  // ── Name State ──
  const [name, setName] = useState(user?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);

  // ── Email State ──
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);

  // ── DOB State ──
  const [dob, setDob] = useState(user?.dob || '');
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [dobLoading, setDobLoading] = useState(false);
  const [dobSaveSuccess, setDobSaveSuccess] = useState(false);

  // Keep local states in sync when user store updates
  useEffect(() => {
    if (!isEditingName) setName(user?.name || '');
    if (!isEditingEmail) setEmail(user?.email || '');
    if (!isEditingDob) setDob(user?.dob || '');
  }, [user, isEditingName, isEditingEmail, isEditingDob]);

  // Re-fetch latest user profile from server so phone linked via order/address is immediately displayed
  useEffect(() => {
    let isMounted = true;
    authService
      .getMe()
      .then((res) => {
        const freshUser = res?.data?.data || res?.data;
        if (isMounted && freshUser && updateUser) {
          updateUser(freshUser);
        }
      })
      .catch(() => null);
    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  // ── Handlers for Name ──
  const isNameDirty = name.trim() !== (user?.name || '').trim();
  const handleStartEditName = () => {
    setName(user?.name || '');
    setNameSaveSuccess(false);
    setIsEditingName(true);
  };
  const handleCancelEditName = () => {
    setName(user?.name || '');
    setIsEditingName(false);
    setNameSaveSuccess(false);
  };
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast?.('Name cannot be empty', 'error');
      return;
    }
    try {
      setNameLoading(true);
      setNameSaveSuccess(false);
      const res = await authService.updateProfile({ name: name.trim() });
      const updated = res?.data || res;
      updateUser({ name: updated?.name || name.trim() });
      setNameSaveSuccess(true);
      setIsEditingName(false);
      showToast?.('Name updated successfully!', 'success');
    } catch (err) {
      console.warn('Profile name update error:', err);
      updateUser({ name: name.trim() });
      setNameSaveSuccess(true);
      setIsEditingName(false);
      showToast?.('Name updated successfully!', 'success');
    } finally {
      setNameLoading(false);
    }
  };

  // ── Handlers for Email ──
  const isEmailDirty = email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase();
  const handleStartEditEmail = () => {
    setEmail(user?.email || '');
    setEmailSaveSuccess(false);
    setIsEditingEmail(true);
  };
  const handleCancelEditEmail = () => {
    setEmail(user?.email || '');
    setIsEditingEmail(false);
    setEmailSaveSuccess(false);
  };
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showToast?.('Please enter a valid email address', 'error');
      return;
    }
    try {
      setEmailLoading(true);
      setEmailSaveSuccess(false);
      const res = await authService.updateProfile({ email: cleanEmail });
      const updated = res?.data || res;
      updateUser({ email: updated?.email || cleanEmail });
      setEmailSaveSuccess(true);
      setIsEditingEmail(false);
      showToast?.('Email updated successfully!', 'success');
    } catch (err) {
      console.warn('Profile email update error:', err);
      const errMsg = err?.response?.data?.message || 'Failed to update email';
      showToast?.(errMsg, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Handlers for DOB ──
  const isDobDirty = dob !== (user?.dob || '');
  const handleStartEditDob = () => {
    setDob(user?.dob || '');
    setDobSaveSuccess(false);
    setIsEditingDob(true);
  };
  const handleCancelEditDob = () => {
    setDob(user?.dob || '');
    setIsEditingDob(false);
    setDobSaveSuccess(false);
  };
  const handleSaveDob = async (e) => {
    e.preventDefault();
    if (!dob) {
      showToast?.('Please select your date of birth', 'error');
      return;
    }
    try {
      setDobLoading(true);
      setDobSaveSuccess(false);
      const res = await authService.updateProfile({ dob });
      const updated = res?.data || res;
      updateUser({ dob: updated?.dob || dob });
      setDobSaveSuccess(true);
      setIsEditingDob(false);
      showToast?.('Date of birth updated successfully!', 'success');
    } catch (err) {
      console.warn('Profile DOB update error:', err);
      const errMsg = err?.response?.data?.message || 'Failed to update date of birth';
      showToast?.(errMsg, 'error');
    } finally {
      setDobLoading(false);
    }
  };

  // Max selectable date is today (user cannot be born in the future)
  const maxDobDate = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.profileContainer}>
      {/* ── Section Title & Subtitle ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.55rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '26px',
              background: 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)',
              borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
            }}
          />
          Personal Profile
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, paddingLeft: '1rem', lineHeight: 1.5 }}>
          Manage your personal details and contact information for seamless deliveries.
        </p>
      </div>

      <div className={styles.profileGrid}>
        {/* ── 1. Full Name Field (Row 1, Col 1) ── */}
        <div className={styles.fieldCol}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#475569',
              marginBottom: '0.5rem',
            }}
          >
            Full Name
          </label>

          {isEditingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 3.25rem',
                    border: '2px solid #7c3aed',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.12)',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  loading={nameLoading}
                  disabled={!isNameDirty || nameLoading}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    opacity: !isNameDirty || nameLoading ? 0.5 : 1,
                    cursor: !isNameDirty || nameLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Save Changes
                </Button>
                <button
                  type="button"
                  onClick={handleCancelEditName}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1.25rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '0.96rem',
                color: '#0f172a',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)',
                  }}
                >
                  <User size={18} />
                </div>
                <span style={{ letterSpacing: '-0.01em', color: '#0f172a' }}>
                  {user?.name || 'No name set'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartEditName}
                title="Edit name"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
                }}
              >
                <Pencil size={13} strokeWidth={2.5} />
                Edit
              </button>
            </div>
          )}

          {nameSaveSuccess && !isEditingName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: '#059669',
                fontWeight: 700,
                marginTop: '0.5rem',
                background: '#ecfdf5',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={14} color="#059669" />
              Name updated successfully
            </span>
          )}
        </div>

        {/* ── 2. Email Address Field (Row 1, Col 2) ── */}
        <div className={styles.fieldCol}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#475569',
              marginBottom: '0.5rem',
            }}
          >
            Email Address
          </label>

          {isEditingEmail ? (
            <form onSubmit={handleSaveEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 3.25rem',
                    border: '2px solid #7c3aed',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.12)',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  loading={emailLoading}
                  disabled={!isEmailDirty || emailLoading}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    opacity: !isEmailDirty || emailLoading ? 0.5 : 1,
                    cursor: !isEmailDirty || emailLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Save Email
                </Button>
                <button
                  type="button"
                  onClick={handleCancelEditEmail}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1.25rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '0.96rem',
                color: '#0f172a',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)',
                  }}
                >
                  <Mail size={18} />
                </div>
                <span
                  style={{
                    letterSpacing: '-0.01em',
                    color: user?.email ? '#0f172a' : '#94a3b8',
                    fontStyle: user?.email ? 'normal' : 'italic',
                  }}
                >
                  {user?.email || 'No email address added'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartEditEmail}
                title="Edit email"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
                }}
              >
                <Pencil size={13} strokeWidth={2.5} />
                {user?.email ? 'Edit' : 'Add'}
              </button>
            </div>
          )}

          {emailSaveSuccess && !isEditingEmail && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: '#059669',
                fontWeight: 700,
                marginTop: '0.5rem',
                background: '#ecfdf5',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={14} color="#059669" />
              Email updated successfully
            </span>
          )}
        </div>

        {/* ── 3. Date of Birth Field (Row 2, Col 1) ── */}
        <div className={styles.fieldCol}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#475569',
              marginBottom: '0.5rem',
            }}
          >
            Date of Birth (DOB)
          </label>

          {isEditingDob ? (
            <form onSubmit={handleSaveDob} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  value={dob}
                  max={maxDobDate}
                  onChange={(e) => setDob(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 3.25rem',
                    border: '2px solid #7c3aed',
                    borderRadius: '14px',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.12)',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  loading={dobLoading}
                  disabled={!isDobDirty || dobLoading}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    opacity: !isDobDirty || dobLoading ? 0.5 : 1,
                    cursor: !isDobDirty || dobLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Save DOB
                </Button>
                <button
                  type="button"
                  onClick={handleCancelEditDob}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1.25rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                fontSize: '0.96rem',
                color: '#0f172a',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)',
                  }}
                >
                  <Calendar size={18} />
                </div>
                <span
                  style={{
                    letterSpacing: '-0.01em',
                    color: user?.dob ? '#0f172a' : '#94a3b8',
                    fontStyle: user?.dob ? 'normal' : 'italic',
                  }}
                >
                  {user?.dob ? formatDateShort(user.dob) : 'No date of birth added'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartEditDob}
                title="Edit date of birth"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
                }}
              >
                <Pencil size={13} strokeWidth={2.5} />
                {user?.dob ? 'Edit' : 'Add'}
              </button>
            </div>
          )}

          {dobSaveSuccess && !isEditingDob && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: '#059669',
                fontWeight: 700,
                marginTop: '0.5rem',
                background: '#ecfdf5',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={14} color="#059669" />
              Date of birth updated successfully
            </span>
          )}
        </div>

        {/* ── 4. Mobile Number Field (Row 2, Col 2) ── */}
        <div className={styles.fieldCol}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#475569',
              marginBottom: '0.5rem',
            }}
          >
            Mobile Number
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '0.96rem',
              color: '#0f172a',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#f3e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.15)',
                }}
              >
                <Phone size={18} />
              </div>
              <span style={{ fontWeight: 700, letterSpacing: '-0.01em', color: '#0f172a' }}>
                {user?.phone ? `+91 ${user.phone}` : 'No phone linked'}
              </span>
            </div>

            {user?.phone ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: '#047857',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid #a7f3d0',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.12)',
                }}
              >
                <ShieldCheck size={14} strokeWidth={2.5} /> Verified
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                Pending First Order
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.76rem',
              color: '#94a3b8',
              marginTop: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: user?.phone ? '#10b981' : '#f59e0b',
              }}
            />
            {user?.phone
              ? 'Linked & Verified via WhatsApp'
              : 'Auto-links from your delivery address upon order'}
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { formatDateShort, getLocalTodayIso, normalizeDobToIso } from '../../../utils/formatDate';
import { saveProfileField } from '../../../utils/profileFields';
import styles from './ProfileSection.module.css';
import MobileAccountTabs from '../MobileAccountTabs';

/**
 * ProfileSection - Mobile View Profile Component (Target: 320px - 768px)
 * Supports real DB data binding and inline editing for Name, Email, and DOB.
 */
export default function ProfileSection({
  user = null,
  ordersCount = 0,
  activeTab = 'profile',
  onTabChange = () => {},
}) {
  const { updateUser } = useAuthStore();

  const [editingField, setEditingField] = useState(null); // 'name' | 'email' | 'dob' | null
  const [draftValue, setDraftValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { field, type: 'success' | 'error', text }

  const storedDobIso = normalizeDobToIso(user?.dob);
  const maxDobDate = getLocalTodayIso();

  useEffect(() => {
    if (!editingField) return;
    if (editingField === 'name') setDraftValue(user?.name || '');
    if (editingField === 'email') setDraftValue(user?.email || '');
    if (editingField === 'dob') setDraftValue(storedDobIso);
  }, [editingField, user?.name, user?.email, storedDobIso]);

  const userName = user?.name?.trim() || 'Picky Customer';
  const userEmail = user?.email?.trim() || '';
  const userDobDisplay = user?.dob ? formatDateShort(user.dob) : '';
  const cleanPhone = user?.phone ? String(user.phone).trim() : '';
  const userPhoneDisplay = cleanPhone
    ? (cleanPhone.startsWith('+') ? cleanPhone : `+91 ${cleanPhone}`)
    : '';
  const customerYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const userTier = user?.tier || 'Active Tier';

  const avatarUrl = user?.avatar || user?.profileImage || null;
  const userInitial = userName.charAt(0).toUpperCase() || 'P';

  const startEdit = (field) => {
    setFeedback(null);
    setEditingField(field);
    if (field === 'name') setDraftValue(user?.name || '');
    else if (field === 'email') setDraftValue(user?.email || '');
    else if (field === 'dob') setDraftValue(storedDobIso);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const submitField = async (e, { allowEmpty = false, overrideValue } = {}) => {
    if (e) e.preventDefault();
    if (!editingField || saving) return;

    const field = editingField;
    const valueToSave = overrideValue !== undefined ? overrideValue : draftValue;

    setSaving(true);
    setFeedback(null);
    const result = await saveProfileField({
      field,
      value: valueToSave,
      updateUser,
      allowEmpty,
    });
    setSaving(false);

    if (!result.ok) {
      setFeedback({ field, type: 'error', text: result.error });
      return;
    }

    const labelMap = {
      name: 'Full name updated',
      email: 'Email updated',
      dob: valueToSave ? 'Date of birth updated' : 'Date of birth cleared',
    };
    setEditingField(null);
    setDraftValue('');
    setFeedback({ field, type: 'success', text: labelMap[field] || 'Updated' });
  };

  const renderFieldFeedback = (field) => {
    if (!feedback || feedback.field !== field) return null;
    return (
      <p
        role="status"
        className={feedback.type === 'error' ? styles.fieldErrorText : styles.fieldSuccessText}
      >
        {feedback.type === 'success' ? '✓ ' : ''}
        {feedback.text}
      </p>
    );
  };

  return (
    <div className={styles.profileContainer}>
      {/* 1. Profile Identity Banner */}
      <div className={styles.bannerCard}>
        <div className={styles.bannerDecorativeCircle} aria-hidden="true" />

        <div className={styles.bannerContent}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircle}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className={styles.avatarImage}
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <span className={styles.statusDot} title="Online" />
          </div>

          <div className={styles.bannerUserInfo}>
            <div className={styles.bannerNameRow}>
              <h2 className={styles.userNameHeading}>{userName}</h2>
              <span className={styles.userIdBadge}>USER ID</span>
            </div>
            <p className={styles.bannerMetaText}>
              Customer since {customerYear} &bull;{' '}
              <span className={styles.activeTierTag}>{userTier}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <MobileAccountTabs
        activeTab={activeTab}
        ordersCount={ordersCount}
        onTabChange={onTabChange}
      />

      {/* 3. Personal Profile Section Card */}
      <div className={styles.profileCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionAccentBar} aria-hidden="true" />
            <div>
              <h3 className={styles.sectionHeading}>Personal Profile</h3>
              <p className={styles.sectionDescription}>
                Manage your personal details and contact information for seamless deliveries.
              </p>
            </div>
          </div>

          <div className={styles.dotMatrix} aria-hidden="true">
            <span className={styles.matrixDot} />
            <span className={styles.matrixDot} />
            <span className={styles.matrixDot} />
            <span className={styles.matrixDot} />
            <span className={styles.matrixDot} />
            <span className={styles.matrixDot} />
          </div>
        </div>

        {/* Profile Fields List */}
        <div className={styles.fieldsList}>
          {/* Field 1: Full Name */}
          <div className={styles.fieldBlock}>
            {editingField === 'name' ? (
              <form onSubmit={(e) => submitField(e)} className={styles.inlineEditForm}>
                <label className={styles.fieldLabel} htmlFor="mob-prof-name">FULL NAME</label>
                <input
                  id="mob-prof-name"
                  type="text"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  placeholder="Enter your full name"
                  className={styles.inlineInput}
                  disabled={saving}
                  autoFocus
                  required
                />
                <div className={styles.inlineActions}>
                  <button type="submit" className={styles.saveFieldBtn} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={cancelEdit} className={styles.cancelFieldBtn} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.fieldItem}>
                <div className={styles.fieldLeft}>
                  <div className={styles.fieldIconBox} aria-hidden="true">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className={styles.fieldData}>
                    <p className={styles.fieldLabel}>FULL NAME</p>
                    <p className={user?.name ? styles.fieldValue : styles.fieldValueEmpty}>
                      {user?.name?.trim() || 'Not added yet'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit('name')}
                  className={styles.editBtn}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {user?.name ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
            {renderFieldFeedback('name')}
          </div>

          {/* Field 2: Email Address */}
          <div className={styles.fieldBlock}>
            {editingField === 'email' ? (
              <form onSubmit={(e) => submitField(e, { allowEmpty: true })} className={styles.inlineEditForm}>
                <label className={styles.fieldLabel} htmlFor="mob-prof-email">EMAIL ADDRESS</label>
                <input
                  id="mob-prof-email"
                  type="email"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  placeholder="name@example.com"
                  className={styles.inlineInput}
                  disabled={saving}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button type="submit" className={styles.saveFieldBtn} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={cancelEdit} className={styles.cancelFieldBtn} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.fieldItem}>
                <div className={styles.fieldLeft}>
                  <div className={styles.fieldIconBox} aria-hidden="true">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className={styles.fieldData}>
                    <p className={styles.fieldLabel}>EMAIL ADDRESS</p>
                    <p className={userEmail ? styles.fieldValueEmail : styles.fieldValueEmpty}>
                      {userEmail || 'Not added yet'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit('email')}
                  className={styles.editBtn}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {userEmail ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
            {renderFieldFeedback('email')}
          </div>

          {/* Field 3: Date of Birth */}
          <div className={styles.fieldBlock}>
            {editingField === 'dob' ? (
              <form onSubmit={(e) => submitField(e)} className={styles.inlineEditForm}>
                <label className={styles.fieldLabel} htmlFor="mob-prof-dob">DATE OF BIRTH (DOB)</label>
                <input
                  id="mob-prof-dob"
                  type="date"
                  value={draftValue}
                  min="1900-01-01"
                  max={maxDobDate}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className={styles.inlineInput}
                  disabled={saving}
                  autoFocus
                />
                <div className={styles.inlineActions}>
                  <button type="submit" className={styles.saveFieldBtn} disabled={saving || !draftValue}>
                    {saving ? 'Saving...' : 'Save DOB'}
                  </button>
                  {storedDobIso && (
                    <button
                      type="button"
                      onClick={() => submitField(null, { allowEmpty: true, overrideValue: '' })}
                      className={styles.clearFieldBtn}
                      disabled={saving}
                    >
                      Clear
                    </button>
                  )}
                  <button type="button" onClick={cancelEdit} className={styles.cancelFieldBtn} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.fieldItem}>
                <div className={styles.fieldLeft}>
                  <div className={styles.fieldIconBox} aria-hidden="true">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className={styles.fieldData}>
                    <p className={styles.fieldLabel}>DATE OF BIRTH (DOB)</p>
                    <p className={userDobDisplay && userDobDisplay !== '—' ? styles.fieldValue : styles.fieldValueEmpty}>
                      {userDobDisplay && userDobDisplay !== '—' ? userDobDisplay : 'Not added yet'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit('dob')}
                  className={styles.editBtn}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {storedDobIso ? 'Edit' : 'Add'}
                </button>
              </div>
            )}
            {renderFieldFeedback('dob')}
          </div>

          {/* Field 4: Mobile Number */}
          <div className={styles.mobileFieldItem}>
            <div className={styles.mobileFieldTopRow}>
              <div className={styles.fieldLeft}>
                <div className={styles.fieldIconBox} aria-hidden="true">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className={styles.fieldData}>
                  <p className={styles.fieldLabel}>MOBILE NUMBER</p>
                  <p className={userPhoneDisplay ? styles.fieldValuePhone : styles.fieldValueEmpty}>
                    {userPhoneDisplay || 'No phone linked'}
                  </p>
                </div>
              </div>
              {userPhoneDisplay ? (
                <span className={styles.verifiedBadge}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className={styles.pendingBadge}>Pending Order</span>
              )}
            </div>
            <p className={styles.verifiedSubtitle}>
              <span
                className={userPhoneDisplay ? styles.greenBullet : styles.amberBullet}
                aria-hidden="true"
              />
              {userPhoneDisplay
                ? 'Linked & Verified via WhatsApp'
                : 'Auto-links from your delivery address upon first order'}
            </p>
          </div>
        </div>

        {/* 4. KYC & Purchase Protection Badge */}
        <div className={styles.kycCard}>
          <div className={styles.kycLeft}>
            <div className={styles.kycIconBox} aria-hidden="true">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className={styles.kycTitle}>KYC &amp; Purchase Protection</p>
              <p className={styles.kycSubtitle}>Encrypted Tamil Nadu Craft Direct Portal</p>
            </div>
          </div>
          <span className={styles.safeBadge}>100% SAFE</span>
        </div>
      </div>
    </div>
  );
}

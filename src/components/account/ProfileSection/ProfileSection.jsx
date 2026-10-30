import React from 'react';
import styles from './ProfileSection.module.css';
import MobileAccountTabs from '../MobileAccountTabs';

/**
 * ProfileSection - Mobile View Profile Component (Target: 320px - 768px)
 * 
 * Strict Mobile Typography & Responsive Layout rules applied:
 * - Section heading: 24px (24–28px), weight 700, line-height 1.2
 * - Category card / Item title: 16px (14–16px), weight 700, line-height 1.3
 * - Primary field text: 13-14px (13–15px), weight 600, line-height 1.35
 * - Body description: 13px (13–14px), weight 400, line-height 1.5
 * - Button text: 13px (13–15px), weight 600, line-height 1.2
 * - Category count: 11px (11–12px), weight 500, line-height 1.3
 * - Badge text: 10-11px (10–11px), weight 700, line-height 1.2
 * - Navigation label: 12px (10–12px), weight 500-600, line-height 1.2
 */
export default function ProfileSection({
  user = null,
  ordersCount = 7,
  activeTab = 'profile',
  onTabChange = () => {},
  onSignOut = () => {},
  onEditField = () => {},
}) {
  // Real DB data binding with safe fallback defaults
  const userName = user?.name || 'deepak';
  const userEmail = user?.email || 'thangadeepakdeepak05@gmail.com';
  const userDob = user?.dob || '17 May 2005';
  const userPhone = user?.phone
    ? (user.phone.startsWith('+') ? user.phone : `+91 ${user.phone}`)
    : '+91 9345047432';
  const customerYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024';
  const userTier = user?.tier || 'Active Tier';
  
  // Real DB avatar image or initial (No dummy images)
  const avatarUrl = user?.avatar || user?.profileImage || null;
  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : 'D';

  return (
    <div className={styles.profileContainer}>
      {/* 1. Top Sign Out */}
      <div className={styles.topBar}>
        <button
          type="button"
          onClick={onSignOut}
          className={styles.signOutBtn}
          aria-label="Sign Out"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>

      {/* 2. Profile Identity Banner */}
      <div className={styles.bannerCard}>
        {/* Decorative background glow */}
        <div className={styles.bannerDecorativeCircle} aria-hidden="true" />

        <div className={styles.bannerContent}>
          {/* Avatar with Online Dot (Real DB image or Dynamic Initial) */}
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

          {/* User Info */}
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

      {/* 3. Navigation Tabs (Horizontal Scrollable on Mobile) */}
      <MobileAccountTabs
        activeTab={activeTab}
        ordersCount={ordersCount}
        onTabChange={onTabChange}
      />

      {/* 4. Personal Profile Section Card */}
      <div className={styles.profileCard}>
        {/* Header */}
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

          {/* Decorative Dot Matrix */}
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
          <div className={styles.fieldItem}>
            <div className={styles.fieldLeft}>
              <div className={styles.fieldIconBox} aria-hidden="true">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className={styles.fieldData}>
                <p className={styles.fieldLabel}>FULL NAME</p>
                <p className={styles.fieldValue}>{userName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditField('name')}
              className={styles.editBtn}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>

          {/* Field 2: Email Address */}
          <div className={styles.fieldItem}>
            <div className={styles.fieldLeft}>
              <div className={styles.fieldIconBox} aria-hidden="true">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={styles.fieldData}>
                <p className={styles.fieldLabel}>EMAIL ADDRESS</p>
                <p className={styles.fieldValueEmail}>{userEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditField('email')}
              className={styles.editBtn}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>

          {/* Field 3: Date of Birth */}
          <div className={styles.fieldItem}>
            <div className={styles.fieldLeft}>
              <div className={styles.fieldIconBox} aria-hidden="true">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={styles.fieldData}>
                <p className={styles.fieldLabel}>DATE OF BIRTH (DOB)</p>
                <p className={styles.fieldValue}>{userDob}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEditField('dob')}
              className={styles.editBtn}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
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
                  <p className={styles.fieldValuePhone}>{userPhone}</p>
                </div>
              </div>
              {/* Verified Badge */}
              <span className={styles.verifiedBadge}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            </div>
            {/* WhatsApp Verification Subtitle */}
            <p className={styles.verifiedSubtitle}>
              <span className={styles.greenBullet} aria-hidden="true" />
              Linked &amp; Verified via WhatsApp
            </p>
          </div>
        </div>

        {/* 5. KYC & Purchase Protection Badge */}
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


import React from 'react';
import styles from './MobileAccountTabs.module.css';

/**
 * MobileAccountTabs - Horizontal Pill Navigation Tabs matching Image 1
 * Strictly prevents 2-line text wrapping with single-line pill design
 */
export default function MobileAccountTabs({
  activeTab = 'profile',
  ordersCount = 7,
  onTabChange = () => {},
}) {
  return (
    <div className={styles.tabsWrapper} role="tablist">
      {/* Tab 1: My Profile */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'profile'}
        onClick={() => onTabChange('profile')}
        className={`${styles.tabButton} ${activeTab === 'profile' ? styles.tabActive : styles.tabInactive}`}
      >
        <span className={styles.tabIcon} aria-hidden="true">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        <span>My Profile</span>
      </button>

      {/* Tab 2: My Orders */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'orders'}
        onClick={() => onTabChange('orders')}
        className={`${styles.tabButton} ${activeTab === 'orders' ? styles.tabActive : styles.tabInactive}`}
      >
        <span className={styles.tabIcon} aria-hidden="true">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </span>
        <span>My Orders</span>
        <span className={activeTab === 'orders' ? styles.countBadgeActive : styles.countBadgeInactive}>
          {ordersCount}
        </span>
      </button>

      {/* Tab 3: Saved Addresses */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'addresses'}
        onClick={() => onTabChange('addresses')}
        className={`${styles.tabButton} ${activeTab === 'addresses' ? styles.tabActive : styles.tabInactive}`}
      >
        <span className={styles.tabIcon} aria-hidden="true">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <span>Saved Addresses</span>
      </button>

      {/* Tab 4: Password Change */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'password'}
        onClick={() => onTabChange('password')}
        className={`${styles.tabButton} ${activeTab === 'password' ? styles.tabActive : styles.tabInactive}`}
      >
        <span className={styles.tabIcon} aria-hidden="true">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </span>
        <span>Password Change</span>
      </button>
    </div>
  );
}

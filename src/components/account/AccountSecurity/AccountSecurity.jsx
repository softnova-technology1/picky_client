import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { useUiStore } from '../../../store/uiStore';
import styles from './AccountSecurity.module.css';

export default function AccountSecurity() {
  const { showToast } = useUiStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: string }

  const handleDiscard = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!newPassword.trim()) {
      const msg = 'Please enter a new password';
      setStatusMsg({ type: 'error', text: msg });
      showToast?.(msg, 'error');
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long';
      setStatusMsg({ type: 'error', text: msg });
      showToast?.(msg, 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'New password and confirm password do not match';
      setStatusMsg({ type: 'error', text: msg });
      showToast?.(msg, 'error');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      const successText = 'Password updated successfully!';
      setStatusMsg({ type: 'success', text: successText });
      showToast?.(successText, 'success');
      handleDiscard();
    } catch (err) {
      console.warn('Password change error:', err);
      const errText =
        err?.response?.data?.message ||
        err?.message ||
        'Could not update password. Please check your current password.';
      setStatusMsg({ type: 'error', text: errText });
      showToast?.(errText, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.securityContainer}>
      {/* ── Header Section ── */}
      <div className={styles.headerSection}>
        <h2 className={styles.sectionTitle}>Security & Login</h2>
        <p className={styles.sectionSubtitle}>
          Manage your passwords and secure credentials settings.
        </p>
      </div>

      {/* ── Subtle Divider Line ── */}
      <div className={styles.sectionDivider} aria-hidden="true" />

      {/* ── Password Change Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          {/* Row 1, Col 1: Current Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="sec-current-password">
              CURRENT PASSWORD
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="sec-current-password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.underlinedInput}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className={styles.eyeBtn}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Row 1, Col 2: New Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="sec-new-password">
              NEW PASSWORD *
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="sec-new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="e.g. Mazhai@2026"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.underlinedInput}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className={styles.eyeBtn}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Row 2, Col 1: Confirm New Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="sec-confirm-password">
              CONFIRM NEW PASSWORD *
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="sec-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.underlinedInput}
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={styles.eyeBtn}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Status Feedback Alert ── */}
        {statusMsg && (
          <div
            className={`${styles.msgAlert} ${
              statusMsg.type === 'success' ? styles.msgSuccess : styles.msgError
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* ── Actions Row ── */}
        <div className={styles.actionRow} style={{ marginTop: statusMsg ? '1.5rem' : '0' }}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            <Lock size={16} />
            <span>{loading ? 'Updating Password...' : 'Save Changes'}</span>
          </button>

          {(currentPassword || newPassword || confirmPassword) && (
            <button
              type="button"
              onClick={handleDiscard}
              className={styles.discardBtn}
              disabled={loading}
            >
              Discard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

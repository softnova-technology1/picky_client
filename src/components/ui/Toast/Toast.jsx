import React, { useEffect } from 'react';
import { useUiStore } from '../../../store/uiStore';
import styles from './Toast.module.css';

export default function Toast() {
  const { toast, hideToast } = useUiStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type || 'info'}`}>
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={hideToast}
          className={styles['toast-close-btn']}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

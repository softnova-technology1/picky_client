import React, { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';

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
          onClick={hideToast}
          style={{ color: 'white', opacity: 0.7, marginLeft: '0.5rem', fontSize: '1.1rem' }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 540 }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div
        className={styles.card}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

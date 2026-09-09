import React from 'react';
import styles from './Spinner.module.css';

export default function Spinner({ size = 32, color = 'var(--color-primary)' }) {
  return (
    <div className={styles['spinner-wrapper']}>
      <div
        className={styles['spinner-circle']}
        style={{
          width: size,
          height: size,
          borderWidth: 3,
          borderColor: color,
        }}
      />
    </div>
  );
}

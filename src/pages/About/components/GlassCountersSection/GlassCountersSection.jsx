import React, { useState, useEffect, useRef } from 'react';
import styles from '../../About.module.css';
import { Check, Users, Clock, Headphones, Leaf, Heart, BarChart3, MessageSquare } from 'lucide-react';

export default function GlassCountersSection() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const countersData = [
    {
      id: 'inspection',
      topIcon: Check,
      target: 100,
      format: (val) => `${Math.floor(val)}%`,
      label: 'PHYSICAL INSPECTION',
      bottomIcon: Leaf,
    },
    {
      id: 'clients',
      topIcon: Users,
      target: 50,
      format: (val) => `${Math.floor(val)}k+`,
      label: 'HAPPY CLIENTS',
      bottomIcon: Heart,
    },
    {
      id: 'updates',
      topIcon: Clock,
      target: 24,
      format: (val) => `${Math.floor(val)}/7`,
      label: 'LIVE WHATSAPP UPDATES',
      bottomIcon: BarChart3,
    },
    {
      id: 'satisfaction',
      topIcon: Headphones,
      target: 4.9,
      format: (val) => `${val.toFixed(1)}★`,
      label: 'SATISFACTION RATING',
      bottomIcon: MessageSquare,
    },
  ];

  return (
    <div className={styles['glass-counters-container']} ref={containerRef}>
      {countersData.map((item) => (
        <CounterDisc key={item.id} item={item} isVisible={isVisible} />
      ))}
    </div>
  );
}

function CounterDisc({ item, isVisible }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp = null;
    const duration = 2000; // 2 seconds animated count up

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic Ease-Out curve for smooth slowing down at the end
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * item.target;

      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isVisible, item.target]);

  const TopIcon = item.topIcon;
  const BottomIcon = item.bottomIcon;
  const formattedText = item.format(displayValue);

  return (
    <div className={styles['glass-counter-disc']}>
      {/* 🌟 Futuristic Ambient Hologram Backlight Aura */}
      <div className={styles['disc-hologram-aura']} />

      {/* Glossy top-light reflection highlight arc */}
      <div className={styles['disc-gloss-highlight']} />

      {/* Top-left small circular icon badge */}
      <div className={styles['disc-top-badge']}>
        <TopIcon size={16} strokeWidth={2.5} />
      </div>

      {/* Center Content */}
      <div className={styles['disc-center-content']}>
        <div className={styles['disc-number']}>{formattedText}</div>
        <div className={styles['disc-label']}>{item.label}</div>
      </div>

      {/* Bottom Purple Wave Backdrop & Mini Icon */}
      <div className={styles['disc-bottom-wave']}>
        <svg viewBox="0 0 200 80" className={styles['disc-wave-svg']} preserveAspectRatio="none">
          <path
            d="M 0 40 Q 60 10, 120 45 T 200 30 L 200 80 L 0 80 Z"
            fill="url(#purpleWaveGrad)"
          />
          <defs>
            <linearGradient id="purpleWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>

        {/* Bottom Right Accent Icon - 100% visible inside disc without clipping */}
        <div className={styles['disc-bottom-icon']}>
          <BottomIcon size={14} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

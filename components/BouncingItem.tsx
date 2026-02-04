
import React, { useRef, useEffect } from 'react';

// A component that bounces an element around the screen
export const BouncingItem: React.FC<{ icon: string; sizeRem: number; speed?: number; zIndex?: number }> = ({ icon, sizeRem, speed = 0.5, zIndex = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 100),
    vx: (Math.random() > 0.5 ? 1 : -1) * speed,
    vy: (Math.random() > 0.5 ? 1 : -1) * speed,
  });

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      const el = ref.current;
      if (!el) return;

      const s = state.current;
      const rect = el.getBoundingClientRect();
      const parentWidth = window.innerWidth;
      const parentHeight = window.innerHeight;

      // Update position
      s.x += s.vx;
      s.y += s.vy;

      // Bounce horizontally
      if (s.x <= 0) {
        s.x = 0;
        s.vx = Math.abs(s.vx);
      } else if (s.x + rect.width >= parentWidth) {
        s.x = parentWidth - rect.width;
        s.vx = -Math.abs(s.vx);
      }

      // Bounce vertically
      if (s.y <= 0) {
        s.y = 0;
        s.vy = Math.abs(s.vy);
      } else if (s.y + rect.height >= parentHeight) {
        s.y = parentHeight - rect.height;
        s.vy = -Math.abs(s.vy);
      }

      // Apply transform directly for performance
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed]);

  return (
    <div 
      ref={ref} 
      className="fixed top-0 left-0 pointer-events-none drop-shadow-xl"
      style={{ fontSize: `${sizeRem}rem`, zIndex }}
    >
      {icon}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const ReadingRuler: React.FC = () => {
  const { preferences, toggleReadingRuler } = useAccessibility();
  const [topPosition, setTopPosition] = useState<number>(200);

  useEffect(() => {
    if (!preferences.reading_ruler) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTopPosition(e.clientY - 26);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        setTopPosition((prev) => Math.min(window.innerHeight - 60, prev + 30));
      } else if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        setTopPosition((prev) => Math.max(10, prev - 30));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [preferences.reading_ruler]);

  if (!preferences.reading_ruler) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="reading-ruler-overlay"
      style={{ top: `${topPosition}px` }}
    />
  );
};

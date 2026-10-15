import React from 'react';
import { Severity } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  severity?: Severity;
  variant?: 'primary' | 'secondary' | 'outline' | 'wcag';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  severity,
  variant = 'secondary',
  className = '',
}) => {
  if (severity) {
    switch (severity) {
      case 'critical':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ${className}`}
          >
            Critical
          </span>
        );
      case 'serious':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800 ${className}`}
          >
            Serious
          </span>
        );
      case 'moderate':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${className}`}
          >
            Moderate
          </span>
        );
      case 'minor':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 ${className}`}
          >
            Minor
          </span>
        );
    }
  }

  if (variant === 'wcag') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 ${className}`}
    >
      {children}
    </span>
  );
};

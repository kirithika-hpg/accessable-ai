import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-brand-700 focus:text-white focus:font-bold focus:shadow-xl focus:rounded-md focus:ring-4 focus:ring-yellow-300"
    >
      Skip to main content (Alt + C)
    </a>
  );
};

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const VisualAlertBanner: React.FC = () => {
  const { visualAlert, clearVisualAlert } = useAccessibility();

  if (!visualAlert) return null;

  const getTheme = () => {
    switch (visualAlert.type) {
      case 'success':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'warning':
        return 'bg-amber-500 text-white border-amber-600';
      case 'alert':
        return 'bg-rose-500 text-white border-rose-600';
      default:
        return 'bg-brand-600 text-white border-brand-700';
    }
  };

  const getIcon = () => {
    switch (visualAlert.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />;
      case 'alert':
        return <Bell className="w-5 h-5 shrink-0 animate-bounce" aria-hidden="true" />;
      default:
        return <Info className="w-5 h-5 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[10001] max-w-lg w-full mx-auto px-4 py-3 rounded-2xl shadow-2xl border flex items-center justify-between space-x-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${getTheme()}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
            Visual Alert Notice
          </span>
          <p className="text-sm font-semibold leading-snug">{visualAlert.message}</p>
        </div>
      </div>

      <button
        onClick={clearVisualAlert}
        className="p-1 rounded-lg hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss visual alert notice"
      >
        <X className="w-5 h-5" />
      </button>
    </aside>
  );
};

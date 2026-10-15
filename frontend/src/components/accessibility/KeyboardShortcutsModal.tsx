import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Tab', desc: 'Navigate forward through interactive elements' },
    { key: 'Shift + Tab', desc: 'Navigate backward through interactive elements' },
    { key: 'Enter / Space', desc: 'Activate selected button, link, or control' },
    { key: 'Alt + S', desc: 'Jump directly to Website Scanner' },
    { key: 'Alt + P', desc: 'Jump to Website Access Portal' },
    { key: 'Alt + D', desc: 'Jump directly to Accessibility Dashboard' },
    { key: 'Alt + H', desc: 'Jump to Home page' },
    { key: 'Alt + R', desc: 'Jump to AI Repair Assistant' },
    { key: 'Alt + K', desc: 'Open / Close this Shortcuts Guide' },
    { key: 'Alt + C', desc: 'Skip directly to main page content' },
    { key: 'Escape', desc: 'Close any active dialog, menu, or modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close Keyboard Shortcuts Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600">
            <Keyboard className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 id="shortcuts-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Keyboard Navigation Shortcuts
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Complete hands-free keyboard navigation without mouse traps
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-brand-700 dark:text-brand-300 shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

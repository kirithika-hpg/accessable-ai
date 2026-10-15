import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-brand-400" aria-hidden="true" />
              <span className="text-xl font-bold text-white tracking-tight">AccessAble AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering individuals with diverse visual, motor, and cognitive abilities to navigate digital platforms,
              while giving developers automated axe-core scanning and AI-guided WCAG remediation.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
              <span className="font-semibold text-amber-400 block mb-1">Accessibility Notice:</span>
              Automated testing covers up to 40–50% of WCAG criteria. AccessAble AI highlights automated findings and explicitly advises manual testing with screen readers (NVDA, JAWS, VoiceOver) and real users.
            </div>
          </div>

          {/* Column 2: Standards & Reference */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">WCAG Guidelines</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center space-x-1"
                >
                  <span>WCAG 2.1 QuickRef</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.deque.com/axe/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center space-x-1"
                >
                  <span>Deque axe-core</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/aria/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center space-x-1"
                >
                  <span>WAI-ARIA 1.2 Specs</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Direct User Assist */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Assistive Features</h3>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li>High-Contrast Modes</li>
              <li>Text-to-Speech Engine</li>
              <li>Voice Navigation Commands</li>
              <li>Dyslexia-Friendly Layouts</li>
              <li>100% Keyboard Operable</li>
              <li>Focus Indicators & Skip Links</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AccessAble AI Platform. Designed with universal accessibility principles.</p>
          <p className="flex items-center space-x-1">
            <span>Built with commitment to inclusion</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
};

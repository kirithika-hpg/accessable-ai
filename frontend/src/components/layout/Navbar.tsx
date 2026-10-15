import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  Wrench,
  History,
  Accessibility,
  Menu,
  X,
  User,
  Sliders,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAccessibilityToolbar: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAccessibilityToolbar,
  onOpenShortcuts,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { activeModes } = useAccessibility();

  const navItems = [
    { id: 'home', label: 'Home', icon: ShieldCheck },
    { id: 'portal', label: 'Web Portal', icon: Globe },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'ai-repair', label: 'AI Repair', icon: Wrench },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'assistant', label: 'Assistant Hub', icon: Accessibility },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2.5 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="AccessAble AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Accessibility className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center">
                  Access<span className="text-brand-600 dark:text-brand-400">Able</span>
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold uppercase">
                    AI
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Universal Inclusion Platform
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Accessibility & User Controls */}
          <div className="flex items-center space-x-2">
            {/* Active Mode Count Pill */}
            {activeModes.length > 0 && (
              <button
                onClick={() => handleNavClick('assistant')}
                className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800"
                title={`${activeModes.length} modes currently active`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeModes.length} Mode{activeModes.length > 1 ? 's' : ''}</span>
              </button>
            )}

            <button
              onClick={onOpenAccessibilityToolbar}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-800 dark:text-brand-200 text-xs sm:text-sm font-semibold hover:bg-brand-100 transition shadow-sm"
              aria-label="Open Accessibility Quick Controls Toolbar"
              title="Accessibility Quick Controls"
            >
              <Sliders className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span className="hidden sm:inline">A11y Toolbar</span>
            </button>

            <button
              onClick={onOpenShortcuts}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Keyboard Shortcuts Guide"
              aria-label="Keyboard Shortcuts Guide"
            >
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[11px]">Alt+K</kbd>
            </button>

            {/* User session indicator */}
            <div className="hidden sm:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                title={user?.email || 'Guest Mode'}
              >
                <User className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span className="max-w-[100px] truncate">{user?.is_guest ? 'Guest' : user?.full_name || 'User'}</span>
              </div>
            </div>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <nav aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

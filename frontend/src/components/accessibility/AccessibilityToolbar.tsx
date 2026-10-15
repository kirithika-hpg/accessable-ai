import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Mic,
  RotateCcw,
  BookOpen,
  ZapOff,
  Camera,
  MousePointer,
  Compass,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AccessibilityToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceModal: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  isOpen,
  onClose,
  onOpenVoiceModal,
}) => {
  const {
    preferences,
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    toggleDyslexiaFont,
    toggleEasyReading,
    toggleReducedMotion,
    toggleCursorEnlarged,
    toggleReadingRuler,
    resetAccessibility,
    isSpeaking,
    speakText,
    stopSpeech,
    updatePreferences,
  } = useAccessibility();

  if (!isOpen) return null;

  const handleReadCurrentPage = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      const mainEl = document.getElementById('main-content');
      const textToRead = mainEl ? mainEl.innerText : document.body.innerText;
      speakText(textToRead.slice(0, 1500));
    }
  };

  const getContrastLabel = () => {
    switch (preferences.theme) {
      case 'dark':
        return 'Dark Slate';
      case 'high-contrast-dark':
        return 'Contrast: Yellow/Black';
      case 'high-contrast-light':
        return 'Contrast: Black/White';
      default:
        return 'Light Mode';
    }
  };

  return (
    <aside
      role="region"
      aria-label="Accessibility Quick Controls Toolbar"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-brand-500 rounded-3xl shadow-2xl p-4 transition-all"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Quick Controls</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md text-sm font-semibold"
          aria-label="Close Accessibility Toolbar"
        >
          ✕ Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 max-h-[60vh] overflow-y-auto pr-1">
        {/* Font Size controls */}
        <div className="flex items-center space-x-1 col-span-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24">Text Size:</span>
          <button
            onClick={decreaseFontSize}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 bg-white dark:bg-slate-700 border rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            aria-label="Decrease Text Size"
          >
            <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Smaller</span>
          </button>
          <span className="text-xs font-bold px-2 text-brand-600 dark:text-brand-400 uppercase">
            {preferences.font_size}
          </span>
          <button
            onClick={increaseFontSize}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 bg-white dark:bg-slate-700 border rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            aria-label="Increase Text Size"
          >
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Larger</span>
          </button>
        </div>

        {/* Contrast Modes */}
        <button
          onClick={toggleContrast}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 text-slate-800 dark:text-slate-200 text-xs font-semibold text-center transition"
          aria-label={`Cycle Contrast Mode, current: ${getContrastLabel()}`}
        >
          {preferences.theme === 'light' ? (
            <Sun className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
          ) : preferences.theme === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-400 mb-1" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5 text-yellow-400 mb-1" aria-hidden="true" />
          )}
          <span>{getContrastLabel()}</span>
        </button>

        {/* Dyslexia Font */}
        <button
          onClick={toggleDyslexiaFont}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.dyslexia_font
              ? 'bg-brand-600 text-white border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.dyslexia_font}
        >
          <Type className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Dyslexia Font</span>
        </button>

        {/* Reading Ruler */}
        <button
          onClick={toggleReadingRuler}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.reading_ruler
              ? 'bg-brand-600 text-white border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.reading_ruler}
        >
          <Compass className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Reading Ruler</span>
        </button>

        {/* Enlarged Cursor */}
        <button
          onClick={toggleCursorEnlarged}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.cursor_enlarged
              ? 'bg-brand-600 text-white border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.cursor_enlarged}
        >
          <MousePointer className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Large Cursor</span>
        </button>

        {/* Head Tracking Toggle */}
        <button
          onClick={() =>
            updatePreferences({ head_tracking_enabled: !preferences.head_tracking_enabled })
          }
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.head_tracking_enabled
              ? 'bg-brand-600 text-white border-brand-700 animate-pulse'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.head_tracking_enabled}
        >
          <Camera className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Head Tracking</span>
        </button>

        {/* Easy Reading Mode */}
        <button
          onClick={toggleEasyReading}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.easy_reading
              ? 'bg-brand-600 text-white border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.easy_reading}
        >
          <BookOpen className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Easy Reading</span>
        </button>

        {/* Reduced Motion */}
        <button
          onClick={toggleReducedMotion}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            preferences.reduced_motion
              ? 'bg-brand-600 text-white border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-pressed={preferences.reduced_motion}
        >
          <ZapOff className="w-5 h-5 mb-1" aria-hidden="true" />
          <span>Reduce Motion</span>
        </button>

        {/* Text To Speech Read Page */}
        <button
          onClick={handleReadCurrentPage}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
            isSpeaking
              ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-50'
          }`}
          aria-label={isSpeaking ? 'Stop speaking current page' : 'Read current page aloud'}
        >
          {isSpeaking ? (
            <VolumeX className="w-5 h-5 mb-1" aria-hidden="true" />
          ) : (
            <Volume2 className="w-5 h-5 mb-1" aria-hidden="true" />
          )}
          <span>{isSpeaking ? 'Stop Audio' : 'Read Screen'}</span>
        </button>

        {/* Voice Commands */}
        <button
          onClick={onOpenVoiceModal}
          className="col-span-2 flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-800 dark:text-brand-200 text-xs font-bold hover:bg-brand-100 transition shadow-sm"
          aria-label="Open Hands-Free Voice Commands"
        >
          <Mic className="w-4 h-4 text-brand-600" aria-hidden="true" />
          <span>Hands-Free Voice Commands</span>
        </button>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <button
          onClick={resetAccessibility}
          className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Defaults</span>
        </button>
        <span className="text-[11px] text-slate-400 font-mono">WCAG 2.1 Ready</span>
      </div>
    </aside>
  );
};

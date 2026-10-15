import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Command,
} from 'lucide-react';
import { speechRecognition, SpeechRecognitionStatus } from '../../services/speechRecognition';
import {
  parseVoiceCommand,
  executeVoiceCommand,
  ParsedVoiceCommand,
} from '../../services/voiceNavigation';
import { useAccessibility } from '../../context/AccessibilityContext';
import { AccessibilityMode } from '../../types';

interface VoiceAssistantWidgetProps {
  onNavigate: (page: string) => void;
  onOpenToolbar: () => void;
  onCloseToolbar: () => void;
  onOpenShortcuts: () => void;
  onOpenVoiceModal: () => void;
  onCloseModals: () => void;
}

export const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({
  onNavigate,
  onOpenToolbar,
  onCloseToolbar,
  onOpenShortcuts,
  onOpenVoiceModal,
  onCloseModals,
}) => {
  const {
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    toggleDyslexiaFont,
    toggleReadingRuler,
    toggleCursorEnlarged,
    toggleReducedMotion,
    toggleMode,
    resetAccessibility,
    speakText,
    stopSpeech,
    triggerVisualAlert,
  } = useAccessibility();

  const [isListening, setIsListening] = useState(speechRecognition.isListening);
  const [status, setStatus] = useState<SpeechRecognitionStatus>(speechRecognition.status);
  const [errorMessage, setErrorMessage] = useState('');
  const [heardText, setHeardText] = useState('');
  const [lastCommand, setLastCommand] = useState<ParsedVoiceCommand | null>(null);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
  const [isExpanded, setIsExpanded] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);

  // Sync state with speech recognition service
  useEffect(() => {
    const unsubState = speechRecognition.subscribeState((listening, curStatus, err) => {
      setIsListening(listening);
      setStatus(curStatus);
      if (err) setErrorMessage(err);
      else if (curStatus === 'listening') setErrorMessage('');
    });

    return () => unsubState();
  }, []);

  // Global command dispatcher across every page
  useEffect(() => {
    const unsubCmd = speechRecognition.onCommand((rawTranscript) => {
      setHeardText(rawTranscript);
      setBlockedUrl(null);

      const parsed = parseVoiceCommand(rawTranscript);
      setLastCommand(parsed);

      const result = executeVoiceCommand(parsed, {
        onNavigate,
        onOpenBlocked: () => {
          if (blockedUrl) {
            window.location.href = blockedUrl;
          }
        },
        onScrollDown: () => window.scrollBy({ top: 450, behavior: 'smooth' }),
        onScrollUp: () => window.scrollBy({ top: -450, behavior: 'smooth' }),
        onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        onScrollBottom: () =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
        onGoBack: () => window.history.back(),
        onReadPage: () => {
          const mainEl = document.getElementById('main-content');
          const text = mainEl ? mainEl.innerText.slice(0, 1500) : document.body.innerText.slice(0, 1500);
          speakText(text || 'Welcome to AccessAble AI.');
        },
        onStopSpeech: () => stopSpeech(),
        onIncreaseText: () => increaseFontSize(),
        onDecreaseText: () => decreaseFontSize(),
        onToggleContrast: () => toggleContrast(),
        onToggleDyslexia: () => toggleDyslexiaFont(),
        onToggleReadingRuler: () => toggleReadingRuler(),
        onToggleCursor: () => toggleCursorEnlarged(),
        onToggleReducedMotion: () => toggleReducedMotion(),
        onToggleMode: (mode: AccessibilityMode) => toggleMode(mode),
        onOpenToolbar,
        onCloseToolbar,
        onOpenShortcuts,
        onOpenVoiceModal,
        onCloseModals,
        onResetAccessibility: () => resetAccessibility(),
        onTriggerScan: () => {
          // Find and click the audit/scan button on the page if present
          const scanBtn = document.querySelector(
            'button[type="submit"], button[aria-label*="scan"], button[aria-label*="audit"]'
          ) as HTMLButtonElement | null;
          if (scanBtn) {
            scanBtn.click();
          } else {
            onNavigate('scanner');
          }
        },
      });

      if (parsed.action === 'open_blocked') {
        setBlockedUrl(null);
      }

      if (result.popupBlocked && parsed.target) {
        setBlockedUrl(parsed.target);
        triggerVisualAlert(result.message, 'warning');
      } else if (parsed.action !== 'unknown') {
        triggerVisualAlert(result.message, 'success');
      } else {
        triggerVisualAlert(result.message, 'alert');
      }
    });

    return () => unsubCmd();
  }, [
    onNavigate,
    onOpenToolbar,
    onCloseToolbar,
    onOpenShortcuts,
    onOpenVoiceModal,
    onCloseModals,
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    toggleDyslexiaFont,
    toggleReadingRuler,
    toggleCursorEnlarged,
    toggleReducedMotion,
    toggleMode,
    resetAccessibility,
    speakText,
    stopSpeech,
    triggerVisualAlert,
  ]);

  // Global Alt+V Keyboard Shortcut to toggle voice listening without mouse
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleToggleMic();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isListening, continuousMode]);

  const handleToggleMic = () => {
    if (isListening) {
      speechRecognition.stop();
      triggerVisualAlert('Hands-Free Voice Assistant paused', 'info');
    } else {
      setErrorMessage('');
      speechRecognition.start(continuousMode);
      triggerVisualAlert(
        'Hands-Free Voice Assistant activated! Speak commands like "go to scanner" or "open YouTube".',
        'success'
      );
    }
  };

  const handleToggleLanguage = (newLang: 'en-US' | 'ta-IN') => {
    setLanguage(newLang);
    speechRecognition.setLanguage(newLang);
    triggerVisualAlert(
      `Voice language set to ${newLang === 'ta-IN' ? 'Tamil (தமிழ்)' : 'English'}`,
      'info'
    );
  };

  return (
    <aside
      aria-label="Hands-Free Voice Assistant Controller"
      role="region"
      className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md w-full transition-all duration-300"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-brand-500/80 p-3.5 space-y-2">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleMic}
              aria-label={isListening ? 'Pause voice assistant' : 'Activate hands-free voice assistant'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 dark:ring-rose-900 animate-pulse'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Voice Assistant
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isListening
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isListening ? 'Listening' : 'Paused (Alt+V)'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isListening ? 'Hands-Free Zero Mouse Active' : 'Press Alt+V or click to start'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Language Toggle */}
            <button
              onClick={() => handleToggleLanguage(language === 'en-US' ? 'ta-IN' : 'en-US')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
              title="Toggle English / Tamil recognition"
              aria-label={`Current voice language: ${language === 'en-US' ? 'English' : 'Tamil'}. Click to switch.`}
            >
              {language === 'en-US' ? 'EN' : 'தமிழ்'}
            </button>

            {/* Help Cheat Sheet */}
            <button
              onClick={onOpenVoiceModal}
              className="p-1 rounded-lg text-slate-400 hover:text-brand-600 transition"
              title="Voice commands cheat sheet"
              aria-label="View voice commands help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              aria-label={isExpanded ? 'Minimize voice assistant dock' : 'Expand voice assistant dock'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Heard Speech & Action Feedback Pill */}
        {heardText && (
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-xs flex items-center justify-between gap-2">
            <div className="truncate flex-1">
              <span className="font-bold text-[10px] uppercase text-brand-600 block">I Heard:</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                "{heardText}"
              </span>
            </div>

            {lastCommand && (
              <span
                className={`text-[11px] font-bold shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-lg ${
                  lastCommand.action !== 'unknown'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {lastCommand.action !== 'unknown' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span className="truncate max-w-[130px]">{lastCommand.feedback}</span>
              </span>
            )}
          </div>
        )}

        {/* Blocked Popup Recovery Pill */}
        {blockedUrl && (
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px]">Browser blocked popup:</span>
              <a
                href={blockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline flex items-center space-x-1 text-brand-700 dark:text-brand-300 shrink-0 text-[11px]"
              >
                <span>Click link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[10px] text-amber-800 dark:text-amber-300">
              🎙️ Hands-free: Say <strong>"proceed"</strong> or <strong>"open now"</strong> to navigate without mouse!
            </p>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Expanded Quick Guide & Actions */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>Continuous Zero-Mouse Listening:</span>
              <button
                onClick={() => setContinuousMode((prev) => !prev)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  continuousMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {continuousMode ? 'ON (Auto-Reconnect)' : 'Single Command'}
              </button>
            </div>

            <div className="text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold block text-slate-800 dark:text-slate-200">
                Spoken Command Examples (Mouse-Free):
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "go to scanner"
                </button>
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "go to portal"
                </button>
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "scroll down" / "scroll up"
                </button>
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "open YouTube" / "open Google"
                </button>
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "read page" / "stop"
                </button>
                <button
                  onClick={() => speechRecognition.start(continuousMode)}
                  className="p-1 rounded bg-slate-50 dark:bg-slate-800 text-left border border-slate-200 dark:border-slate-700 truncate"
                >
                  "YouTube open pannu" (Tamil)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Shortcut: <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-mono">Alt + V</kbd></span>
              <button
                onClick={onOpenVoiceModal}
                className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
              >
                Full Voice Console →
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  X,
  Check,
  AlertCircle,
  Send,
  ExternalLink,
  Languages,
  Sparkles,
} from 'lucide-react';
import { speechRecognition, SpeechRecognitionStatus } from '../../services/speechRecognition';
import {
  parseVoiceCommand,
  executeVoiceCommand,
  ParsedVoiceCommand,
  ALLOWED_WEBSITES,
} from '../../services/voiceNavigation';
import { useAccessibility } from '../../context/AccessibilityContext';

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenSettings?: () => void;
}

export const VoiceCommandsModal: React.FC<VoiceCommandsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSettings,
}) => {
  const {
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    speakText,
    stopSpeech,
    triggerVisualAlert,
  } = useAccessibility();

  const [isListening, setIsListening] = useState(speechRecognition.isListening);
  const [recognitionStatus, setRecognitionStatus] = useState<SpeechRecognitionStatus>(speechRecognition.status);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [heardText, setHeardText] = useState('');
  const [lastCommand, setLastCommand] = useState<ParsedVoiceCommand | null>(null);
  const [blockedPopupUrl, setBlockedPopupUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
  const [manualInput, setManualInput] = useState('');

  const supported = speechRecognition.isSupported();

  useEffect(() => {
    const unsubscribeState = speechRecognition.subscribeState((listening, status, err) => {
      setIsListening(listening);
      setRecognitionStatus(status);
      if (err) setErrorMessage(err);
      else if (status === 'listening') setErrorMessage('');
    });

    return () => unsubscribeState();
  }, []);

  const handleProcessCommand = (rawSpeech: string) => {
    setHeardText(rawSpeech);
    setBlockedPopupUrl(null);

    const parsed = parseVoiceCommand(rawSpeech);
    setLastCommand(parsed);

    const result = executeVoiceCommand(parsed, {
      onNavigate,
      onScrollDown: () => window.scrollBy({ top: 400, behavior: 'smooth' }),
      onScrollUp: () => window.scrollBy({ top: -400, behavior: 'smooth' }),
      onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      onGoBack: () => window.history.back(),
      onReadPage: () => {
        const mainEl = document.getElementById('main-content');
        speakText(mainEl ? mainEl.innerText.slice(0, 1500) : 'Welcome to AccessAble AI.');
      },
      onStopSpeech: () => stopSpeech(),
      onIncreaseText: () => increaseFontSize(),
      onDecreaseText: () => decreaseFontSize(),
      onToggleContrast: () => toggleContrast(),
    });

    if (result.popupBlocked && parsed.target) {
      setBlockedPopupUrl(parsed.target);
      triggerVisualAlert(result.message, 'warning');
    } else if (parsed.action !== 'unknown') {
      triggerVisualAlert(result.message, 'success');
    } else {
      triggerVisualAlert(result.message, 'alert');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribeCmd = speechRecognition.onCommand((command) => {
      handleProcessCommand(command);
    });

    return () => unsubscribeCmd();
  }, [isOpen, onNavigate]);

  const handleToggleMic = () => {
    if (isListening) {
      speechRecognition.stop();
    } else {
      setErrorMessage('');
      speechRecognition.start();
    }
  };

  const handleLanguageChange = (lang: 'en-US' | 'ta-IN') => {
    setSelectedLanguage(lang);
    speechRecognition.setLanguage(lang);
    triggerVisualAlert(`Voice language switched to ${lang === 'ta-IN' ? 'Tamil' : 'English'}`, 'info');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessCommand(manualInput.trim());
    setManualInput('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close Voice Commands Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Microphone Control */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all">
            <button
              onClick={handleToggleMic}
              disabled={!supported}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30 ring-4 ring-rose-200 dark:ring-rose-900'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30'
              }`}
              aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          <h2 id="voice-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
            {isListening
              ? 'Listening for voice commands...'
              : recognitionStatus === 'requesting'
              ? 'Requesting microphone permission...'
              : 'Voice-Controlled Website Navigation'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {supported
              ? isListening
                ? 'Speak a command such as "Open Google", "Open YouTube", or "YouTube open pannu".'
                : 'Click the microphone button to start voice control.'
              : 'Speech recognition is not natively supported in this browser version. Use the text fallback below.'}
          </p>

          {/* Language Switcher */}
          <div className="mt-3 flex items-center justify-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
              <Languages className="w-3.5 h-3.5" />
              <span>Language:</span>
            </span>
            <button
              type="button"
              onClick={() => handleLanguageChange('en-US')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedLanguage === 'en-US'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ta-IN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedLanguage === 'ta-IN'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Live Visual Feedback on Recognized Speech */}
        {heardText && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider text-brand-600 font-bold">
                I heard:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {lastCommand?.language === 'ta' ? 'Tamil' : 'English'}
              </span>
            </div>
            <p className="text-slate-900 dark:text-white font-medium text-sm italic">"{heardText}"</p>

            {lastCommand && (
              <div
                className={`mt-2 flex items-center space-x-1.5 text-xs font-bold ${
                  lastCommand.action !== 'unknown'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {lastCommand.action !== 'unknown' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{lastCommand.feedback}</span>
              </div>
            )}

            {/* Blocked Popup Warning & Safe Direct Click */}
            {blockedPopupUrl && (
              <div className="mt-3 p-2.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>Popup blocked by browser.</span>
                <a
                  href={blockedPopupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center space-x-1 ml-2 text-brand-700 dark:text-brand-300"
                >
                  <span>Click to Open Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Text-Based Command Input Fallback */}
        <form onSubmit={handleManualSubmit} className="mb-6">
          <label htmlFor="manual-voice-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Text Alternative (Type Command)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="manual-voice-input"
              type="text"
              placeholder='e.g., "Open YouTube", "Open Gmail", "Google open pannu", "scroll down"'
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute</span>
            </button>
          </div>
        </form>

        {/* Supported Website Commands & Tamil Examples */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            Supported Website Voice Commands (Click to Test):
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.values(ALLOWED_WEBSITES).map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => handleProcessCommand(`open ${site.name.toLowerCase()}`)}
                className="p-2 rounded-lg bg-white dark:bg-slate-700/80 border text-left hover:border-brand-500 hover:text-brand-600 transition"
              >
                <span className="font-bold block truncate">Open {site.name}</span>
                <span className="text-[10px] text-slate-400 truncate block">{site.url.replace('https://', '')}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleProcessCommand('open my website')}
              className="p-2 rounded-lg bg-white dark:bg-slate-700/80 border text-left hover:border-brand-500 hover:text-brand-600 transition"
            >
              <span className="font-bold block truncate">Open My Website</span>
              <span className="text-[10px] text-slate-400 truncate block">App Home Page</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1">
              Tamil Commands (தமிழ் கட்டளைகள்):
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Google open pannu', 'YouTube open pannu', 'Gmail open pannu', 'kizha po (scroll down)', 'veetuku po (home)'].map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleProcessCommand(cmd.split(' (')[0])}
                  className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleToggleMic}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
              isListening
                ? 'border-rose-500 text-rose-600 hover:bg-rose-50'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

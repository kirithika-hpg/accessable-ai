import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Eye,
  Hand,
  Brain,
  Ear,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Compass,
  MousePointer,
  Trash2,
  Globe,
  ExternalLink,
  Languages,
  Send,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { tts } from '../services/tts';
import { liveTranscription } from '../services/liveTranscription';
import { headTracker } from '../services/headTracker';
import {
  speechRecognition,
  SpeechRecognitionStatus,
} from '../services/speechRecognition';
import {
  parseVoiceCommand,
  executeVoiceCommand,
  ParsedVoiceCommand,
  ALLOWED_WEBSITES,
} from '../services/voiceNavigation';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface AssistantControlsPageProps {
  onNavigate?: (page: string) => void;
  onOpenVoiceModal?: () => void;
}

export const AssistantControlsPage: React.FC<AssistantControlsPageProps> = ({
  onNavigate = () => {},
  onOpenVoiceModal,
}) => {
  const {
    preferences,
    activeModes,
    updatePreferences,
    toggleMode,
    isModeActive,
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    toggleDyslexiaFont,
    toggleEasyReading,
    toggleReducedMotion,
    toggleCursorEnlarged,
    toggleReadingRuler,
    toggleDwellClick,
    toggleSwitchNav,
    resetAccessibility,
    clearStoredPreferences,
    isSpeaking,
    stopSpeech,
    triggerVisualAlert,
  } = useAccessibility();

  // TTS Settings State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(preferences.tts_rate || 1.0);
  const [sampleText, setSampleText] = useState(
    'Welcome to AccessAble AI. We are dedicated to ensuring equal digital access for people of all abilities.'
  );

  // Cognitive Simplifier Sandbox State
  const [cogniInput, setCogniInput] = useState(
    'In order to commence and facilitate optimal digital transformation, organizations must utilize comprehensive WCAG frameworks and endeavor to accommodate diverse user personas.'
  );
  const [cogniOutput, setCogniOutput] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);

  // Hearing Mode Live Captions Sandbox State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState<string[]>([]);

  // Hearing Mode Voice Navigation State
  const [voiceListening, setVoiceListening] = useState(speechRecognition.isListening);
  const [voiceStatus, setVoiceStatus] = useState<SpeechRecognitionStatus>(speechRecognition.status);
  const [voiceError, setVoiceError] = useState<string>('');
  const [voiceHeardText, setVoiceHeardText] = useState<string>('');
  const [lastVoiceCommand, setLastVoiceCommand] = useState<ParsedVoiceCommand | null>(null);
  const [voiceBlockedUrl, setVoiceBlockedUrl] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
  const [manualVoiceInput, setManualVoiceInput] = useState<string>('');

  // Confirmation Modal for Deleting/Resetting
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const updateVoiceList = () => {
      const v = tts.getVoices();
      setVoices(v);
    };
    updateVoiceList();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoiceList;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = liveTranscription.onCaption((cap) => {
      if (cap.isFinal) {
        setLiveCaptions((prev) => [...prev.slice(-4), `[${cap.timestamp}] ${cap.text}`]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProcessVoiceCommand = (rawSpeech: string) => {
    setVoiceHeardText(rawSpeech);
    setVoiceBlockedUrl(null);

    const parsed = parseVoiceCommand(rawSpeech);
    setLastVoiceCommand(parsed);

    const result = executeVoiceCommand(parsed, {
      onNavigate,
      onOpenBlocked: () => {
        if (voiceBlockedUrl) window.location.href = voiceBlockedUrl;
      },
      onScrollDown: () => window.scrollBy({ top: 400, behavior: 'smooth' }),
      onScrollUp: () => window.scrollBy({ top: -400, behavior: 'smooth' }),
      onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      onGoBack: () => window.history.back(),
      onReadPage: () => {
        const mainEl = document.getElementById('main-content');
        tts.speak(mainEl ? mainEl.innerText.slice(0, 1500) : 'Welcome to AccessAble AI.');
      },
      onStopSpeech: () => stopSpeech(),
      onIncreaseText: () => increaseFontSize(),
      onDecreaseText: () => decreaseFontSize(),
      onToggleContrast: () => toggleContrast(),
    });

    if (parsed.action === 'open_blocked') {
      setVoiceBlockedUrl(null);
    }

    if (result.popupBlocked && parsed.target) {
      setVoiceBlockedUrl(parsed.target);
      triggerVisualAlert(result.message, 'warning');
    } else if (parsed.action !== 'unknown') {
      triggerVisualAlert(result.message, 'success');
    } else {
      triggerVisualAlert(result.message, 'alert');
    }
  };

  useEffect(() => {
    const unsubSR = speechRecognition.subscribeState((listening, status, err) => {
      setVoiceListening(listening);
      setVoiceStatus(status);
      if (err) setVoiceError(err);
      else if (status === 'listening') setVoiceError('');
    });

    const unsubCmd = speechRecognition.onCommand((command) => {
      handleProcessVoiceCommand(command);
    });

    return () => {
      unsubSR();
      unsubCmd();
    };
  }, [onNavigate]);

  const handleToggleVoiceMic = () => {
    if (voiceListening) {
      speechRecognition.stop();
    } else {
      setVoiceError('');
      speechRecognition.start();
    }
  };

  const handleVoiceLanguageChange = (lang: 'en-US' | 'ta-IN') => {
    setVoiceLanguage(lang);
    speechRecognition.setLanguage(lang);
    triggerVisualAlert(
      `Voice recognition language switched to ${lang === 'ta-IN' ? 'Tamil' : 'English'}`,
      'info'
    );
  };

  const handleManualVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVoiceInput.trim()) return;
    handleProcessVoiceCommand(manualVoiceInput.trim());
    setManualVoiceInput('');
  };

  const handleTestTTS = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      tts.speak(sampleText, {
        voiceIndex: selectedVoiceIndex,
        rate: speechRate,
      });
      triggerVisualAlert('Playing text-to-speech preview', 'info');
    }
  };

  const handleTestSimplify = async () => {
    if (!cogniInput.trim()) return;
    setIsSimplifying(true);
    try {
      const res = await api.simplifyText(cogniInput);
      setCogniOutput(res.simplified_text);
      triggerVisualAlert('Text simplified into Plain English', 'success');
    } catch (e: any) {
      triggerVisualAlert('Failed to simplify: ' + e.message, 'alert');
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleToggleLiveTranscription = () => {
    if (isTranscribing) {
      liveTranscription.stop();
      setIsTranscribing(false);
      triggerVisualAlert('Live captioning stopped', 'info');
    } else {
      liveTranscription.start();
      setIsTranscribing(true);
      triggerVisualAlert('Listening for live captions...', 'success');
    }
  };

  const handleConfirmReset = () => {
    clearStoredPreferences();
    setShowResetConfirm(false);
    triggerVisualAlert('All accessibility settings have been reset to factory defaults.', 'info');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2">
          <Accessibility className="w-4 h-4 text-brand-600" />
          <span>Universal Accessibility Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Accessibility Settings & Modes
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Customize your sensory, motor, visual, and cognitive preferences. All settings update in real-time, require no diagnosis disclosure, and are saved securely on your device.
        </p>
      </div>

      {/* Grid of Dedicated Mode Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. BLIND MODE CONTROLS */}
        <Card
          title="Blind Mode Controls"
          subtitle="Text-to-Speech audio and screen reader configurations"
          action={
            <Button
              size="sm"
              variant={isModeActive('blind') ? 'danger' : 'primary'}
              onClick={() => toggleMode('blind')}
            >
              {isModeActive('blind') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="voice-select" className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Synthesized Voice
              </label>
              <select
                id="voice-select"
                value={selectedVoiceIndex}
                onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {voices.map((v, idx) => (
                  <option key={idx} value={idx}>
                    {v.name} ({v.lang})
                  </option>
                ))}
                {voices.length === 0 && <option value="0">Default System Voice</option>}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tts-rate-slider" className="font-bold text-slate-700 dark:text-slate-300">
                  Reading Speed
                </label>
                <span className="font-mono font-bold text-brand-600">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                id="tts-rate-slider"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => {
                  const r = parseFloat(e.target.value);
                  setSpeechRate(r);
                  updatePreferences({ tts_rate: r });
                }}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <Button
                variant={isSpeaking ? 'danger' : 'outline'}
                size="sm"
                icon={isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                onClick={handleTestTTS}
                className="w-full"
              >
                {isSpeaking ? 'Stop Audio' : 'Preview Voice Output'}
              </Button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500">
              <p><strong>Screen Reader Notice:</strong> Built-in TTS complements, but does not replace, complete system screen readers (such as NVDA, JAWS, or TalkBack).</p>
            </div>
          </div>
        </Card>

        {/* 2. LOW VISION MODE CONTROLS */}
        <Card
          title="Low Vision Mode Controls"
          subtitle="Contrast palettes, scaling, and enlarged cursors"
          action={
            <Button
              size="sm"
              variant={isModeActive('low_vision') ? 'danger' : 'primary'}
              onClick={() => toggleMode('low_vision')}
            >
              {isModeActive('low_vision') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Color Contrast Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'light', label: 'Standard Light', desc: 'White background' },
                  { id: 'dark', label: 'Dark Slate', desc: 'Low-glare dark' },
                  { id: 'high-contrast-dark', label: 'Yellow on Black', desc: 'AAA Maximum' },
                  { id: 'high-contrast-light', label: 'Black on White', desc: 'Crisp bold' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updatePreferences({ theme: mode.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      preferences.theme === mode.id
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/50 ring-2 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">{mode.label}</span>
                    <span className="text-[10px] text-slate-500">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Text Scaling ({preferences.font_size})
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={decreaseFontSize}>
                    A-
                  </Button>
                  <Button size="sm" variant="outline" onClick={increaseFontSize}>
                    A+
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                <span>Enlarged High-Visibility Cursor</span>
                <input
                  type="checkbox"
                  checked={preferences.cursor_enlarged}
                  onChange={toggleCursorEnlarged}
                  className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                  aria-label="Toggle Enlarged Cursor"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 3. HEAD TRACKING CONTROLS */}
        <Card
          title="Head Tracking Mode Controls"
          subtitle="Webcam optical motion cursor and dwell selection"
          action={
            <Button
              size="sm"
              variant={isModeActive('head_tracking') ? 'danger' : 'primary'}
              onClick={() => toggleMode('head_tracking')}
            >
              {isModeActive('head_tracking') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Camera Tracking Status:</span>
                <span className={`font-bold ${preferences.head_tracking_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {preferences.head_tracking_enabled ? 'Active (Local)' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Processed locally in browser memory. No camera images or video frames are ever recorded or sent over the network.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="sensitivity-tune" className="font-bold text-slate-700 dark:text-slate-300">
                  Pointer Sensitivity
                </label>
                <span className="font-mono text-brand-600">{headTracker.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                id="sensitivity-tune"
                type="range"
                min="0.8"
                max="5.0"
                step="0.2"
                defaultValue={headTracker.sensitivity}
                onChange={(e) => {
                  headTracker.sensitivity = parseFloat(e.target.value);
                }}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="dwell-tune" className="font-bold text-slate-700 dark:text-slate-300">
                  Dwell Activation Time
                </label>
                <span className="font-mono text-brand-600">{headTracker.dwellDelayMs}ms</span>
              </div>
              <input
                id="dwell-tune"
                type="range"
                min="500"
                max="2500"
                step="100"
                defaultValue={headTracker.dwellDelayMs}
                onChange={(e) => {
                  headTracker.dwellDelayMs = parseInt(e.target.value);
                }}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <Button
                size="sm"
                variant={preferences.head_tracking_enabled ? 'danger' : 'primary'}
                icon={preferences.head_tracking_enabled ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                onClick={() =>
                  updatePreferences({ head_tracking_enabled: !preferences.head_tracking_enabled })
                }
                className="w-full"
              >
                {preferences.head_tracking_enabled ? 'Stop Webcam Tracking' : 'Start Webcam Tracking'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. MOTOR ACCESSIBILITY CONTROLS */}
        <Card
          title="Motor Accessibility Mode"
          subtitle="Large targets, switch devices, and keyboard navigation"
          action={
            <Button
              size="sm"
              variant={isModeActive('motor') ? 'danger' : 'primary'}
              onClick={() => toggleMode('motor')}
            >
              {isModeActive('motor') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Dwell Auto-Click</span>
                <span className="text-[11px] text-slate-500">Triggers clicks automatically when hovering for 1000ms.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.dwell_click_enabled}
                onChange={toggleDwellClick}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                aria-label="Toggle Dwell Auto Click"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Switch Navigation Scan</span>
                <span className="text-[11px] text-slate-500">Highlights controls automatically; activate using Space/Enter.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.switch_nav_enabled}
                onChange={toggleSwitchNav}
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                aria-label="Toggle Switch Navigation"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500">
              <p>• Full Tab / Shift+Tab keyboard support</p>
              <p>• Large 48x48px touch targets compliant with WCAG 2.5.5</p>
              <p>• Destructive actions always require confirmation</p>
            </div>
          </div>
        </Card>

        {/* 5. COGNITIVE ACCESSIBILITY CONTROLS */}
        <Card
          title="Cognitive Accessibility Mode"
          subtitle="OpenDyslexic typography, reading rulers, and AI text simplification"
          action={
            <Button
              size="sm"
              variant={isModeActive('cognitive') ? 'danger' : 'primary'}
              onClick={() => toggleMode('cognitive')}
            >
              {isModeActive('cognitive') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleDyslexiaFont}
                className={`p-2.5 rounded-xl border text-center font-bold ${
                  preferences.dyslexia_font ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                OpenDyslexic Font
              </button>

              <button
                onClick={toggleReadingRuler}
                className={`p-2.5 rounded-xl border text-center font-bold ${
                  preferences.reading_ruler ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-600' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Reading Ruler
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="cogni-input" className="font-bold text-slate-700 dark:text-slate-300 block">
                Test Plain English AI Simplification
              </label>
              <textarea
                id="cogni-input"
                rows={2}
                value={cogniInput}
                onChange={(e) => setCogniInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={isSimplifying}
                isLoading={isSimplifying}
                icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                onClick={handleTestSimplify}
              >
                Simplify to Plain English
              </Button>
            </div>

            {cogniOutput && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                <span className="font-bold block mb-1">Simplified Version:</span>
                <p>{cogniOutput}</p>
              </div>
            )}
          </div>
        </Card>

        {/* 6. HEARING ACCESSIBILITY CONTROLS */}
        <Card
          title="Hearing Accessibility Mode"
          subtitle="Visual alerts, live speech captions & voice-controlled website navigation"
          action={
            <Button
              size="sm"
              variant={isModeActive('hearing') ? 'danger' : 'primary'}
              onClick={() => toggleMode('hearing')}
            >
              {isModeActive('hearing') ? 'Disable Mode' : 'Enable Mode'}
            </Button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Visual Flash Alerts Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Visual Flash Alerts</span>
                <span className="text-[11px] text-slate-500">Replaces all audio chimes with high-visibility banner notices.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.visual_alerts_enabled}
                onChange={() =>
                  updatePreferences({ visual_alerts_enabled: !preferences.visual_alerts_enabled })
                }
                className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                aria-label="Toggle Visual Flash Alerts"
              />
            </div>

            {/* Voice-Controlled Website Navigation Console */}
            <div className="p-4 rounded-2xl border-2 border-brand-200 dark:border-brand-900/60 bg-white dark:bg-slate-800/80 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Voice-Controlled Website Navigation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Navigate to allowlisted websites hands-free using speech with real-time visual feedback.
                  </p>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => handleVoiceLanguageChange('en-US')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      voiceLanguage === 'en-US'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVoiceLanguageChange('ta-IN')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      voiceLanguage === 'ta-IN'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Microphone Start/Stop Control & Live Recognition Status */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant={voiceListening ? 'danger' : 'primary'}
                    icon={voiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    onClick={handleToggleVoiceMic}
                    disabled={!speechRecognition.isSupported()}
                    className={voiceListening ? 'animate-pulse' : ''}
                  >
                    {voiceListening ? 'Stop Voice Control' : 'Start Voice Navigation'}
                  </Button>

                  <div className="flex items-center space-x-2">
                    {voiceListening ? (
                      <span className="flex items-center text-xs font-bold text-rose-600 dark:text-rose-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-2 shrink-0" />
                        Listening for commands...
                      </span>
                    ) : voiceStatus === 'requesting' ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Requesting microphone permission...
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">
                        Microphone Inactive (Ready)
                      </span>
                    )}
                  </div>
                </div>

                {onOpenVoiceModal && (
                  <button
                    type="button"
                    onClick={onOpenVoiceModal}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-bold flex items-center space-x-1"
                  >
                    <span>Full Dialog</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Error Notice */}
              {voiceError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{voiceError}</p>
                </div>
              )}

              {/* Live Recognized Speech Display on Screen */}
              {voiceHeardText ? (
                <div className="p-3.5 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      I heard:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {lastVoiceCommand?.language === 'ta' ? 'Tamil' : 'English'}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white italic">
                    "{voiceHeardText}"
                  </p>

                  {lastVoiceCommand && (
                    <div
                      className={`flex items-center space-x-1.5 text-xs font-bold ${
                        lastVoiceCommand.action !== 'unknown'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {lastVoiceCommand.action !== 'unknown' ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{lastVoiceCommand.feedback}</span>
                      {lastVoiceCommand.target && lastVoiceCommand.isExternal && (
                        <span className="font-mono text-[10px] text-slate-500 ml-1">
                          ({lastVoiceCommand.target})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Browser Blocked Popup Notification with direct user link */}
                  {voiceBlockedUrl && (
                    <div className="mt-2 p-2.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>Browser blocked opening new tab.</span>
                        <a
                          href={voiceBlockedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline flex items-center space-x-1 ml-2 text-brand-700 dark:text-brand-300 text-xs"
                        >
                          <span>Open Site</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-[10px] text-amber-800 dark:text-amber-300">
                        🎙️ Hands-free: Say <strong>"proceed"</strong> or <strong>"open now"</strong> to navigate without mouse!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 italic">
                  Visual feedback for spoken voice commands will appear here in real-time.
                </div>
              )}

              {/* Predefined Safe Website Commands (Click to Test) */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] block uppercase tracking-wider">
                  Supported Website Voice Commands (Click to Test):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  {Object.values(ALLOWED_WEBSITES).map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => handleProcessVoiceCommand(`open ${site.name.toLowerCase()}`)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-left hover:border-brand-500 hover:text-brand-600 transition"
                    >
                      <span className="font-bold block truncate">Open {site.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {site.url.replace('https://', '')}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleProcessVoiceCommand('open my website')}
                    className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-300 dark:border-brand-800 text-left hover:border-brand-600 hover:text-brand-700 transition"
                  >
                    <span className="font-bold block truncate text-brand-700 dark:text-brand-300">
                      Open My Website
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">Home Page</span>
                  </button>
                </div>
              </div>

              {/* Tamil Voice Commands Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-purple-700 dark:text-purple-300 text-[11px] block">
                  Tamil Voice Commands (தமிழ் கட்டளைகள்):
                </span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {[
                    'Google open pannu',
                    'YouTube open pannu',
                    'Gmail open pannu',
                    'ChatGPT open pannu',
                    'kizha po',
                    'veetuku po',
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleProcessVoiceCommand(cmd)}
                      className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
                    >
                      "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Page Navigation Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] block">
                  Safe Navigation Commands:
                </span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {[
                    'scroll down',
                    'scroll up',
                    'go back',
                    'go home',
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleProcessVoiceCommand(cmd)}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-200"
                    >
                      "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alternative / Manual Command Fallback */}
              <form onSubmit={handleManualVoiceSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label
                  htmlFor="hearing-manual-voice-input"
                  className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1"
                >
                  Type Command Alternative:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="hearing-manual-voice-input"
                    type="text"
                    placeholder='e.g., "Open YouTube", "Open Google", "scroll down", "go home"'
                    value={manualVoiceInput}
                    onChange={(e) => setManualVoiceInput(e.target.value)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <Button type="submit" size="sm" variant="primary" icon={<Send className="w-3 h-3" />}>
                    Execute
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Captions Stream */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Live Captions Stream:</span>
                <Button
                  size="sm"
                  variant={isTranscribing ? 'danger' : 'outline'}
                  icon={isTranscribing ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  onClick={handleToggleLiveTranscription}
                >
                  {isTranscribing ? 'Stop Captions' : 'Start Mic Captions'}
                </Button>
              </div>

              <div className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-xl min-h-[80px] border border-slate-800">
                {liveCaptions.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">
                    {isTranscribing ? 'Listening for speech...' : 'Click "Start Mic Captions" to test real-time speech-to-text.'}
                  </span>
                ) : (
                  liveCaptions.map((cap, i) => (
                    <p key={i} className="text-xs mb-1">
                      {cap}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset & Preferences Management Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block">
            Reset Preferences & Delete Data
          </span>
          <span className="text-xs text-slate-500">
            Clear all stored accessibility settings and reset to factory defaults.
          </span>
        </div>

        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => setShowResetConfirm(true)}
        >
          Reset All Settings to Default
        </Button>
      </div>

      {/* Confirmation Modal for Resetting Preferences */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 id="confirm-modal-title" className="text-lg font-bold">
                Reset All Accessibility Settings?
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will restore standard contrast, normal font sizing, disable active modes, and clear any saved voice and head-tracking preferences.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleConfirmReset}>
                Yes, Reset All Defaults
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

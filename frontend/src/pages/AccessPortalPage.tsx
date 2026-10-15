import React, { useState, useEffect } from 'react';
import {
  Globe,
  ExternalLink,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Info,
  Type,
  RotateCcw,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { api } from '../services/api';
import { ContentExtractResponse, SimplifyResponse, AccessibilityMode } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface AccessPortalPageProps {
  onNavigate: (page: string) => void;
}

export const AccessPortalPage: React.FC<AccessPortalPageProps> = ({ onNavigate }) => {
  const {
    preferences,
    activeModes,
    toggleMode,
    isModeActive,
    isSpeaking,
    speakText,
    stopSpeech,
    triggerVisualAlert,
  } = useAccessibility();

  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedAccessOption, setSelectedAccessOption] = useState<'A' | 'B'>('B');

  // Supported Integration Mode state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState<ContentExtractResponse | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Cognitive Mode: AI text simplification state
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedData, setSimplifiedData] = useState<SimplifyResponse | null>(null);
  const [showSimplified, setShowSimplified] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('accessable_target_url');
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  const validateUrl = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return 'Please enter a target website URL.';

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'Only http:// and https:// URLs are supported.';
      }
      return null;
    } catch {
      return 'Please enter a valid website address (e.g., https://example.com).';
    }
  };

  const getFullUrl = (input: string): string => {
    const trimmed = input.trim();
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  };

  const handleLaunchAssistMode = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateUrl(url);
    if (err) {
      setValidationError(err);
      return;
    }
    const fullUrl = getFullUrl(url);
    triggerVisualAlert(`Opening external site in new tab: ${fullUrl}`, 'info');
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleExtractSupportedContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setExtractionError(null);

    const err = validateUrl(url);
    if (err) {
      setValidationError(err);
      return;
    }

    const fullUrl = getFullUrl(url);
    setIsExtracting(true);
    setExtractedContent(null);
    setSimplifiedData(null);
    setShowSimplified(false);

    try {
      const data = await api.extractContent(fullUrl);
      setExtractedContent(data);
      triggerVisualAlert('Content successfully extracted for accessible reading view.', 'success');
    } catch (error: any) {
      setExtractionError(
        error.message ||
          'Could not retrieve content. The site may restrict automated readers, require login, or block scraping. You can still use Assist Mode (Option A) to view it directly.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleSimplify = async () => {
    if (!extractedContent) return;

    if (!simplifiedData) {
      setIsSimplifying(true);
      try {
        const res = await api.simplifyText(extractedContent.plain_text.slice(0, 1800));
        setSimplifiedData(res);
        setShowSimplified(true);
        triggerVisualAlert('Text simplified into Plain English (Grade 6-8).', 'success');
      } catch (err: any) {
        triggerVisualAlert('Failed to simplify text: ' + err.message, 'alert');
      } finally {
        setIsSimplifying(false);
      }
    } else {
      setShowSimplified(!showSimplified);
    }
  };

  const handleReadExtractedContent = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (extractedContent) {
      const textToRead = showSimplified && simplifiedData
        ? simplifiedData.simplified_text
        : extractedContent.plain_text.slice(0, 2000);
      speakText(textToRead);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2">
          <Globe className="w-4 h-4 text-brand-600" />
          <span>Universal Web Navigation Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Website URL Access Portal
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
          Enter any public website URL to interact with its content using our assistive tools.
          Select the access mode that matches your technical and accessibility preferences.
        </p>
      </div>

      {/* Step 1 & 2: URL Input & Validation */}
      <Card title="Step 1: Enter & Validate Website URL" subtitle="Target website address">
        <form onSubmit={selectedAccessOption === 'B' ? handleExtractSupportedContent : handleLaunchAssistMode} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-5 h-5" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setValidationError(null);
                setExtractionError(null);
              }}
              aria-label="Target website address"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base focus:border-brand-600 focus:ring-0 placeholder:text-slate-400"
            />
          </div>

          {validationError && (
            <p className="text-xs font-bold text-rose-600 flex items-center space-x-1" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Protected against SSRF and private IP leakage</span>
            </span>

            <div className="flex items-center space-x-2">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => setUrl('http://127.0.0.1:8000/static/test_pages/accessible.html')}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Accessible Demo
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setUrl('http://127.0.0.1:8000/static/test_pages/inaccessible.html')}
                className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                Flawed Demo
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Step 3: Select Accessibility Modes */}
      <Card title="Step 2: Choose Active Accessibility Modes" subtitle="Select the tools you need for this session">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'blind', label: 'Blind Mode' },
            { id: 'low_vision', label: 'Low Vision Mode' },
            { id: 'voice_control', label: 'Voice Control' },
            { id: 'head_tracking', label: 'Head Tracking' },
            { id: 'motor', label: 'Motor Mode' },
            { id: 'cognitive', label: 'Cognitive Mode' },
            { id: 'hearing', label: 'Hearing Mode' },
            { id: 'custom', label: 'Custom Mode' },
          ].map((item) => {
            const active = isModeActive(item.id as AccessibilityMode);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleMode(item.id as AccessibilityMode)}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  active
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
                aria-pressed={active}
              >
                <span>{item.label}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{active ? 'Enabled ✓' : 'Disabled'}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 4: Access Option Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Step 3: Choose Your Access Pathway
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OPTION A: ASSIST MODE */}
          <div
            className={`p-6 rounded-3xl border-2 transition ${
              selectedAccessOption === 'A'
                ? 'border-brand-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase">
                Option A
              </span>
              <input
                type="radio"
                name="access_option"
                checked={selectedAccessOption === 'A'}
                onChange={() => setSelectedAccessOption('A')}
                className="w-4 h-4 text-brand-600"
                aria-label="Select Assist Mode (Option A)"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Assist Mode (Native Browser Context)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Opens the destination website in its normal browser tab. Provides an assistive guidance checklist for using your OS screen reader (NVDA, TalkBack, VoiceOver), browser zoom, and keyboard navigation.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500 space-y-1 mb-5">
              <p><strong>Technical Reality:</strong> Because of browser security (Same-Origin Policy), web applications cannot modify external domains directly.</p>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={handleLaunchAssistMode}
              className="w-full"
            >
              Open Site in Assist Mode
            </Button>
          </div>

          {/* OPTION B: SUPPORTED INTEGRATION MODE */}
          <div
            className={`p-6 rounded-3xl border-2 transition ${
              selectedAccessOption === 'B'
                ? 'border-brand-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-extrabold uppercase">
                Option B
              </span>
              <input
                type="radio"
                name="access_option"
                checked={selectedAccessOption === 'B'}
                onChange={() => setSelectedAccessOption('B')}
                className="w-4 h-4 text-brand-600"
                aria-label="Select Supported Integration Mode (Option B)"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Supported Integration Mode (Reader View)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Extracts accessible text and semantic headings from public web pages. Renders a clean, distraction-free reading interface with live Text-to-Speech audio, contrast controls, and AI simplification.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500 space-y-1 mb-5">
              <p><strong>Features:</strong> Ad removal, high contrast styling, font scaling, audio reading, and Plain English summarizer.</p>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={isExtracting}
              isLoading={isExtracting}
              icon={<BookOpen className="w-4 h-4" />}
              onClick={handleExtractSupportedContent}
              className="w-full"
            >
              {isExtracting ? 'Extracting Content...' : 'Read in Supported Integration'}
            </Button>
          </div>
        </div>
      </div>

      {/* Extraction Error Notice with Fallback to Option A */}
      {extractionError && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Supported Integration Limited for this URL</h4>
              <p className="text-xs mt-1">{extractionError}</p>
            </div>
          </div>
          <div className="pl-8">
            <Button
              size="sm"
              variant="primary"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={handleLaunchAssistMode}
            >
              Launch Site in Assist Mode (Option A) Instead
            </Button>
          </div>
        </div>
      )}

      {/* INTEGRATED READING VIEW (OPTION B RENDERED) */}
      {extractedContent && (
        <section
          aria-labelledby="reader-view-heading"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border-2 border-brand-200 dark:border-brand-900 shadow-xl space-y-6"
        >
          {/* Reader Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-bold block mb-1">
                Supported Reading View
              </span>
              <h2 id="reader-view-heading" className="text-2xl font-black text-slate-900 dark:text-white">
                {extractedContent.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {extractedContent.word_count} words • ~{extractedContent.estimated_read_time_minutes} min read • Source:{' '}
                <span className="font-mono">{extractedContent.url}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={isSpeaking ? 'danger' : 'primary'}
                icon={isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                onClick={handleReadExtractedContent}
              >
                {isSpeaking ? 'Stop Audio' : 'Read Aloud (TTS)'}
              </Button>

              <Button
                size="sm"
                variant={showSimplified ? 'secondary' : 'outline'}
                disabled={isSimplifying}
                isLoading={isSimplifying}
                icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                onClick={handleToggleSimplify}
              >
                {showSimplified ? 'View Full Text' : 'AI Plain English'}
              </Button>

              <button
                onClick={() => window.open(extractedContent.url, '_blank')}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="View original site"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Simplified Cognitive View */}
          {showSimplified && simplifiedData && (
            <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-purple-900 dark:text-purple-200">
                  Cognitive Accessibility Summary (Plain English)
                </h3>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Key Takeaways:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {simplifiedData.key_points.map((pt, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-bold block mb-1">Simplified Explanation:</span>
                <p>{simplifiedData.simplified_text}</p>
              </div>

              <p className="text-[10px] text-slate-500 italic border-t border-purple-200 dark:border-purple-900/60 pt-2">
                {simplifiedData.disclaimer}
              </p>
            </div>
          )}

          {/* Table of Contents for Headings Navigation */}
          {extractedContent.headings.length > 1 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Headings Structure (Quick Jump):
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                {extractedContent.headings.map((h, idx) => (
                  <li key={idx} className="truncate">
                    • {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clean Semantic Article Content */}
          <article
            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: extractedContent.readable_html }}
          />

          {/* Legal Notice */}
          <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic">
            {extractedContent.notice}
          </footer>
        </section>
      )}

      {/* ASSIST MODE GUIDANCE PANEL */}
      <Card
        title="Assist Mode Operational Guidance"
        subtitle="Quick reference for operating external websites with your assistive technology"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Screen Readers (Blind)
            </span>
            <p>• Windows: NVDA (<kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">NVDA+Down</kbd> to read all)</p>
            <p>• macOS: VoiceOver (<kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Cmd+F5</kbd>)</p>
            <p>• Heading Navigation: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">H</kbd> to cycle headings</p>
            <p>• Link Lists: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Insert+F7</kbd> in NVDA</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Zoom & Magnifiers (Low Vision)
            </span>
            <p>• Browser Zoom: <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Ctrl + Plus</kbd> up to 200%</p>
            <p>• Windows Magnifier: <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Win + Plus</kbd></p>
            <p>• Invert Colors: <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Ctrl + Alt + I</kbd></p>
            <p>• High Contrast: <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Left Alt + Left Shift + PrtScn</kbd></p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Keyboard & Switch Access (Motor)
            </span>
            <p>• Forward Focus: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Tab</kbd></p>
            <p>• Backward Focus: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Shift + Tab</kbd></p>
            <p>• Activate Buttons: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Enter</kbd> or <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Space</kbd></p>
            <p>• Close Dialogs: Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded">Escape</kbd></p>
          </div>
        </div>
      </Card>
    </div>
  );
};

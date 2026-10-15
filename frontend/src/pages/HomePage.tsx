import React, { useState } from 'react';
import {
  Eye,
  Volume2,
  Mic,
  Camera,
  Hand,
  Brain,
  Ear,
  Sliders,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Compass,
  FileSearch,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityMode } from '../types';
import { Button } from '../components/common/Button';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenAccessibilityToolbar: () => void;
}

interface ModeCardDef {
  id: AccessibilityMode;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  colorClass: string;
  features: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAccessibilityToolbar,
}) => {
  const { activeModes, toggleMode, isModeActive, resetAccessibility } = useAccessibility();
  const [quickUrl, setQuickUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const modeDefinitions: ModeCardDef[] = [
    {
      id: 'blind',
      title: 'Blind Mode',
      subtitle: 'Audio and Screen Reader First',
      description:
        'Designed for people who cannot see the screen. Features spoken text-to-speech audio, descriptive element names, semantic landmarks, and skip-to-content keyboard shortcuts.',
      icon: Volume2,
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800',
      features: ['Text-to-speech reading', 'Semantic skip links', 'Descriptive ARIA tags', 'Keyboard-only operation'],
    },
    {
      id: 'low_vision',
      title: 'Low Vision Mode',
      subtitle: 'High Contrast & Enlarged Text',
      description:
        'For users with low vision or color sensitivity. Provides AAA high-contrast yellow-on-black or crisp black-on-white themes, up to 145% font scaling, and enlarged cursors.',
      icon: Eye,
      colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800',
      features: ['4 Contrast themes', 'Text scaling up to 145%', 'High-visibility cursor', '200% zoom-friendly layout'],
    },
    {
      id: 'voice_control',
      title: 'Voice Control Mode',
      subtitle: 'Hands-Free Speech Navigation',
      description:
        'Navigate the web hands-free using your voice. Speak simple commands like "scroll down", "go to portal", "read screen", and "increase text" into your microphone.',
      icon: Mic,
      colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800',
      features: ['Spoken navigation commands', 'Microphone status indicator', 'Text command fallback', 'Zero cloud audio storage'],
    },
    {
      id: 'head_tracking',
      title: 'Head Tracking Mode',
      subtitle: 'Hands-Free Webcam Optical Motion',
      description:
        'Move the pointer with your head using your local webcam. Hovering over a button for a calibrated dwell time activates it automatically with zero mouse movement required.',
      icon: Camera,
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800',
      features: ['Local optical head motion', 'Dwell auto-clicking', 'Dead-zone & sensitivity controls', 'Instant camera stop button'],
    },
    {
      id: 'motor',
      title: 'Motor Accessibility Mode',
      subtitle: 'Switch & Large Target Controls',
      description:
        'Built for people who cannot comfortably use a mouse or touchscreen. Offers extra-large 48px touch targets, switch-device compatibility, and dwell activation without clicks.',
      icon: Hand,
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800',
      features: ['Large 48px clickable areas', 'Switch navigation (Space/Enter)', 'Dwell-click timer', 'No keyboard traps'],
    },
    {
      id: 'cognitive',
      title: 'Cognitive Accessibility Mode',
      subtitle: 'Plain English & Reduced Clutter',
      description:
        'Helps individuals with dyslexia, ADHD, or cognitive fatigue. Features OpenDyslexic typography, expanded reading line spacing, reading ruler guides, and AI text simplification.',
      icon: Brain,
      colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/80 border-teal-200 dark:border-teal-800',
      features: ['OpenDyslexic font', 'Reading ruler overlay', 'AI Plain English summary', 'Reduced distraction layout'],
    },
    {
      id: 'hearing',
      title: 'Hearing Accessibility Mode',
      subtitle: 'Visual Alerts, Captions & Voice Navigation',
      description:
        'For deaf and hard-of-hearing users. Replaces audio alerts with high-contrast visual flashes, provides real-time speech captions, and enables voice-controlled website navigation with live visual feedback.',
      icon: Ear,
      colorClass: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/80 border-cyan-200 dark:border-cyan-800',
      features: ['Visual screen flash alerts', 'Real-time live speech captions', 'Voice-controlled website navigation', '100% Visual feedback'],
    },
    {
      id: 'custom',
      title: 'Custom Accessibility Mode',
      subtitle: 'Personalized Assistive Setup',
      description:
        'Mix and match your preferred assistive tools. Save a unique combination of font scaling, contrast, dwell timing, and voice controls tailored specifically to your needs.',
      icon: Sliders,
      colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800',
      features: ['Multi-mode simultaneous active', 'Custom dwell & switch speeds', 'Personal preset storage', 'Full factory reset anytime'],
    },
  ];

  const handleQuickUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const trimmed = quickUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter a website address to proceed.');
      return;
    }
    // Navigate to Access Portal
    localStorage.setItem('accessable_target_url', trimmed);
    onNavigate('portal');
  };

  return (
    <div className="space-y-20 pb-20">
      {/* SECTION 1: WELCOME SECTION */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-brand-50/40 to-purple-50/30 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 border border-slate-200/90 dark:border-slate-800 p-8 sm:p-14 shadow-md"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-bold mb-6 border border-brand-200 dark:border-brand-800">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span>Universal Digital Inclusion Platform</span>
          </div>

          <h1 id="hero-title" className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            AccessAble <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
            "Access the digital world your way."
          </p>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Choose the interaction method that works best for you. AccessAble AI helps you use digital content with tools designed around your accessibility needs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              variant="primary"
              icon={<Globe className="w-5 h-5" />}
              onClick={() => onNavigate('portal')}
              aria-label="Open Website URL Access Portal"
            >
              Open Website Access Portal
            </Button>

            <Button
              size="lg"
              variant="secondary"
              icon={<Search className="w-5 h-5 text-brand-600" />}
              onClick={() => onNavigate('scanner')}
              aria-label="Audit Website for WCAG compliance"
            >
              Scan Website for WCAG Issues
            </Button>

            <Button
              size="lg"
              variant="outline"
              icon={<Sliders className="w-5 h-5 text-purple-600" />}
              onClick={() => onNavigate('assistant')}
              aria-label="Open Accessibility Settings Hub"
            >
              Accessibility Settings
            </Button>
          </div>

          {/* Quick Active Modes Summary Pill */}
          {activeModes.length > 0 && (
            <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {activeModes.length} Active Mode{activeModes.length > 1 ? 's' : ''}:{' '}
                  <span className="capitalize">{activeModes.map((m) => m.replace('_', ' ')).join(', ')}</span>
                </span>
              </div>
              <button
                onClick={resetAccessibility}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: CHOOSE YOUR ACCESSIBILITY MODE */}
      <section aria-labelledby="modes-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 id="modes-heading" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Choose Your Accessibility Mode
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
              Select one or more compatible modes to adapt the platform to your preferred way of interacting.
            </p>
          </div>

          {activeModes.length > 0 && (
            <button
              onClick={resetAccessibility}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
            >
              Disable All Active Modes
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modeDefinitions.map((mode) => {
            const Icon = mode.icon;
            const isActive = isModeActive(mode.id);
            return (
              <div
                key={mode.id}
                className={`relative rounded-3xl p-6 border-2 transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 shadow-lg ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${mode.colorClass}`}>
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isActive ? 'Active ✓' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {mode.title}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">
                    {mode.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {mode.description}
                  </p>

                  <ul className="space-y-1.5 mb-6 text-xs text-slate-500 dark:text-slate-400">
                    {mode.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isActive ? 'danger' : 'primary'}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleMode(mode.id)}
                  aria-pressed={isActive}
                  aria-label={`${isActive ? 'Disable' : 'Enable'} ${mode.title}`}
                >
                  {isActive ? `Disable ${mode.title}` : `Enable ${mode.title}`}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: ENTER A WEBSITE URL ACCESS PORTAL */}
      <section aria-labelledby="portal-preview-heading" className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Globe className="w-4 h-4" />
            <span>Website Access Portal</span>
          </div>
          <h2 id="portal-preview-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Enter Any Website URL to Explore Accessibly
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Choose how you would like to view public websites: through our <strong>Assist Mode</strong> with assistive operating guides, or through our <strong>Supported Integration Mode</strong> with clean distraction-free text extraction.
          </p>

          <form onSubmit={handleQuickUrlSubmit} className="max-w-xl mx-auto mt-6">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                placeholder="https://example.com"
                value={quickUrl}
                onChange={(e) => {
                  setQuickUrl(e.target.value);
                  setUrlError(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:border-brand-600 focus:ring-0"
                aria-label="Website address to access"
              />
              <Button type="submit" variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Continue to Portal
              </Button>
            </div>
            {urlError && <p className="mt-2 text-xs font-bold text-rose-600 text-left">{urlError}</p>}
          </form>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-500">
            <span>Try sample fixtures:</span>
            <button
              onClick={() => {
                localStorage.setItem('accessable_target_url', 'http://127.0.0.1:8000/static/test_pages/accessible.html');
                onNavigate('portal');
              }}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Accessible Demo Page
            </button>
            <span>•</span>
            <button
              onClick={() => {
                localStorage.setItem('accessable_target_url', 'http://127.0.0.1:8000/static/test_pages/inaccessible.html');
                onNavigate('portal');
              }}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Inaccessible Flawed Page
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: ACCESSIBILITY TOOLS */}
      <section aria-labelledby="tools-heading" className="space-y-6">
        <div>
          <h2 id="tools-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built-in Accessibility Tools
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            Every tool is designed to work seamlessly without requiring third-party extensions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Volume2 className="w-8 h-8 text-brand-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Text-to-Speech Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Read any webpage section or extracted article aloud. Full control over speech rate, pitch, and voice selection.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Eye className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Contrast Themes</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Four accessible color palettes including WCAG AAA Yellow on Black and crisp Black on White.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Camera className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Optical Head Tracker</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Hands-free cursor control using client-side webcam movement detection and dwell auto-clicking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Compass className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Dyslexia Reading Ruler</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A shaded horizontal focal bar following mouse or keyboard arrows to eliminate visual crowding.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Mic className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Voice Navigation</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Hands-free voice recognition with built-in text alternatives for users who cannot speak or type.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Brain className="w-8 h-8 text-rose-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">AI Text Simplification</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Converts complex, jargon-heavy paragraphs into clear Plain English (WCAG 3.1.5) with key takeaway points.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: AI ACCESSIBILITY ASSISTANT */}
      <section aria-labelledby="assistant-heading" className="bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Intelligent Accessibility Assistant</span>
          </div>
          <h2 id="assistant-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Learn, Fix, and Understand Accessibility Barriers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed">
            Our AI Assistant breaks down WCAG 2.1 compliance criteria into plain English, explains how barriers affect specific disability groups, and generates side-by-side verified HTML/CSS code corrections.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('ai-repair')}
            >
              Open AI Repair Studio
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white/60 hover:bg-white/10"
              onClick={onOpenAccessibilityToolbar}
            >
              Launch Assistive Toolbar
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 6: RECENT ACCESSIBILITY SCANS */}
      <section aria-labelledby="scans-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="scans-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Recent Accessibility Scans
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Automated WCAG 2.1 audits performed with SSRF protection and axe-core rule evaluation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline"
          >
            View All History →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                Verified Test Page
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                accessible.html (100% WCAG AAA)
              </p>
              <span className="text-xs text-slate-500">0 Critical Violations • 100/100 Score</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('scanner')}
            >
              Scan
            </Button>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">
                Flawed Test Page
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                inaccessible.html (Multiple Violations)
              </p>
              <span className="text-xs text-slate-500">Missing Alt, Low Contrast, Unlabelled Inputs</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('scanner')}
            >
              Scan
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRIVACY AND SAFETY INFORMATION */}
      <section aria-labelledby="privacy-heading" className="bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 shrink-0">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <h2 id="privacy-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Privacy, Safety & Browser Permissions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              AccessAble AI is committed to universal digital inclusion with strict privacy protection:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Medical Disclosure:</strong> We never ask users to disclose personal medical diagnosis.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>100% Local Computer Vision:</strong> Webcam head-tracking frames are processed only inside your browser and never uploaded.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Explicit Microphone Consent:</strong> Audio is only recorded when you explicitly activate Voice Control.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>SSRF Security:</strong> Our scanner and reader endpoints block private IP ranges and internal network exploits.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

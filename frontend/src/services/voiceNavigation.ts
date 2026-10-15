// Voice-Controlled Website Navigation Service
// Strictly maps safe spoken commands to an HTTPS allowlist and internal navigation targets.
// Supports both English and Tamil commands without executing arbitrary code.

export interface AllowedWebsite {
  id: string;
  name: string;
  url: string;
  englishKeywords: string[];
  tamilKeywords: string[];
}

export const ALLOWED_WEBSITES: Record<string, AllowedWebsite> = {
  google: {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com',
    englishKeywords: ['google', 'google search', 'google com'],
    tamilKeywords: ['google open pannu', 'google open pannunga', 'google theratha', 'google thira', 'கூகுள் திற', 'கூகிள் திற'],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    englishKeywords: ['youtube', 'you tube', 'yt', 'youtube com'],
    tamilKeywords: ['youtube open pannu', 'youtube open pannunga', 'youtube theratha', 'youtube thira', 'யூடியூப் திற'],
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    url: 'https://mail.google.com',
    englishKeywords: ['gmail', 'google mail', 'mail google', 'google email', 'gmail com'],
    tamilKeywords: ['gmail open pannu', 'gmail open pannunga', 'gmail theratha', 'gmail thira', 'ஜிமெயில் திற'],
  },
  wikipedia: {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    englishKeywords: ['wikipedia', 'wiki', 'wikipedia org'],
    tamilKeywords: ['wikipedia open pannu', 'wikipedia open pannunga', 'wikipedia theratha', 'wikipedia thira', 'விக்கிப்பீடியா திற'],
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    englishKeywords: ['chatgpt', 'chat gpt', 'openai chatgpt', 'chatgpt com'],
    tamilKeywords: ['chatgpt open pannu', 'chatgpt open pannunga', 'chatgpt theratha', 'chatgpt thira', 'சாட் ஜிபிடி திற'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com',
    englishKeywords: ['facebook', 'fb', 'facebook com'],
    tamilKeywords: ['facebook open pannu', 'facebook open pannunga', 'facebook theratha', 'facebook thira', 'பேஸ்புக் திற'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com',
    englishKeywords: ['instagram', 'insta', 'ig', 'instagram com'],
    tamilKeywords: ['instagram open pannu', 'instagram open pannunga', 'instagram theratha', 'instagram thira', 'இன்ஸ்டாகிராம் திற'],
  },
};

export type VoiceCommandAction =
  | 'open_website'
  | 'open_blocked'
  | 'navigate_internal'
  | 'scroll_down'
  | 'scroll_up'
  | 'scroll_top'
  | 'scroll_bottom'
  | 'go_back'
  | 'read_page'
  | 'stop_speech'
  | 'increase_text'
  | 'decrease_text'
  | 'toggle_contrast'
  | 'toggle_dyslexia'
  | 'toggle_ruler'
  | 'toggle_cursor'
  | 'toggle_motion'
  | 'toggle_mode'
  | 'open_toolbar'
  | 'close_toolbar'
  | 'open_shortcuts'
  | 'open_voice_modal'
  | 'close_modals'
  | 'reset_settings'
  | 'trigger_scan'
  | 'unknown';

export interface ParsedVoiceCommand {
  raw: string;
  normalized: string;
  action: VoiceCommandAction;
  target?: string;
  websiteName?: string;
  isExternal: boolean;
  language: 'en' | 'ta';
  feedback: string;
}

/**
 * Normalizes spoken speech input:
 * Converts to lowercase, strips punctuation, collapses whitespace.
 */
export function normalizeVoiceInput(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses normalized voice input against predefined safe commands and allowlisted websites.
 */
export function parseVoiceCommand(rawInput: string): ParsedVoiceCommand {
  const normalized = normalizeVoiceInput(rawInput);

  if (!normalized) {
    return {
      raw: rawInput,
      normalized: '',
      action: 'unknown',
      isExternal: false,
      language: 'en',
      feedback: 'No command heard. Please speak clearly.',
    };
  }

  // Remove polite/conversational fillers for flexible natural speech
  let cleaned = normalized
    .replace(/^(please|can you|could you|would you|kindly)\s+/, '')
    .replace(/\s+(please|now|immediately)$/, '');

  // 1. Check for Tamil Website Navigation Commands
  for (const site of Object.values(ALLOWED_WEBSITES)) {
    // A. Check predefined Tamil keywords
    for (const kw of site.tamilKeywords) {
      if (
        normalized === kw ||
        normalized.includes(kw) ||
        cleaned === kw ||
        cleaned.includes(kw)
      ) {
        return {
          raw: rawInput,
          normalized,
          action: 'open_website',
          target: site.url,
          websiteName: site.name,
          isExternal: true,
          language: 'ta',
          feedback: `${site.name} திறக்கப்படுகிறது (${site.name} is opening)`,
        };
      }
    }

    // B. Check Tanglish: <site-keyword> open pannu / open pannunga / thira
    const isTamilAction =
      normalized.includes('open pannu') ||
      normalized.includes('open pannunga') ||
      normalized.includes('theratha') ||
      normalized.includes('thira') ||
      cleaned.includes('open pannu') ||
      cleaned.includes('open pannunga');

    if (isTamilAction) {
      for (const kw of site.englishKeywords) {
        if (normalized.includes(kw) || cleaned.includes(kw)) {
          return {
            raw: rawInput,
            normalized,
            action: 'open_website',
            target: site.url,
            websiteName: site.name,
            isExternal: true,
            language: 'ta',
            feedback: `${site.name} திறக்கப்படுகிறது (${site.name} is opening)`,
          };
        }
      }
    }
  }

  // 1b. Google Search Commands (English & Tamil)
  let googleSearchQuery: string | null = null;
  if (normalized.startsWith('search google for ')) {
    googleSearchQuery = normalized.replace(/^search google for\s+/, '').trim();
  } else if (normalized.startsWith('google search ')) {
    googleSearchQuery = normalized.replace(/^google search\s+/, '').trim();
  } else if (normalized.startsWith('search for ') && !normalized.includes('page') && !normalized.includes('scanner') && !normalized.includes('audit')) {
    googleSearchQuery = normalized.replace(/^search for\s+/, '').trim();
  } else if (normalized.includes('search pannu') && normalized.includes('google')) {
    googleSearchQuery = normalized
      .replace(/google\s*(la|il)?/g, '')
      .replace(/search\s*pannu/g, '')
      .trim();
  } else if (normalized.includes('thedu') && normalized.includes('google')) {
    googleSearchQuery = normalized
      .replace(/google\s*(la|il)?/g, '')
      .replace(/thedu/g, '')
      .trim();
  }

  if (googleSearchQuery && googleSearchQuery.length > 0) {
    const encoded = encodeURIComponent(googleSearchQuery);
    return {
      raw: rawInput,
      normalized,
      action: 'open_website',
      target: `https://www.google.com/search?q=${encoded}`,
      websiteName: `Google: "${googleSearchQuery}"`,
      isExternal: true,
      language: normalized.includes('pannu') || normalized.includes('thedu') ? 'ta' : 'en',
      feedback: `Searching Google for ${googleSearchQuery}`,
    };
  }

  // 1c. Hands-free Blocked Link / Proceed Commands (English & Tamil)
  const proceedPhrases = [
    'proceed',
    'open now',
    'open link',
    'open blocked link',
    'open current',
    'open here',
    'thira',
    'ippovae thira',
    'ippo thira',
    'ippo open pannu',
    'po',
    'link open pannu',
    'continue',
  ];
  if (proceedPhrases.includes(normalized) || proceedPhrases.includes(cleaned)) {
    return {
      raw: rawInput,
      normalized,
      action: 'open_blocked',
      isExternal: true,
      language:
        normalized.includes('thira') || normalized.includes('po') || normalized.includes('pannu')
          ? 'ta'
          : 'en',
      feedback: 'Opening pending link directly in browser',
    };
  }

  // 2. Check for English Website Navigation Commands
  // Handles "open <site>", "go to <site>", "launch <site>", "visit <site>", "navigate to <site>"
  const openPrefixes = [
    'open',
    'go to',
    'goto',
    'launch',
    'visit',
    'browse to',
    'navigate to',
    'take me to',
    'show me',
  ];

  for (const site of Object.values(ALLOWED_WEBSITES)) {
    for (const kw of site.englishKeywords) {
      for (const prefix of openPrefixes) {
        const fullCmd = `${prefix} ${kw}`;
        if (
          normalized === fullCmd ||
          normalized.startsWith(`${fullCmd} `) ||
          normalized === kw ||
          cleaned === fullCmd ||
          cleaned.startsWith(`${fullCmd} `)
        ) {
          return {
            raw: rawInput,
            normalized,
            action: 'open_website',
            target: site.url,
            websiteName: site.name,
            isExternal: true,
            language: 'en',
            feedback: `Opening ${site.name}`,
          };
        }
      }
    }
  }

  // 3. "Open my website" or "Go home" -> Configured Application Home
  const homePhrases = [
    'open my website',
    'open website',
    'my website',
    'go to my website',
    'navigate to my website',
    'go home',
    'go to home',
    'home',
    'navigate home',
    'back to home',
    'veetuku po',
    'veettuku po',
    'en website open pannu',
    'namma website open pannu',
  ];

  if (homePhrases.includes(normalized) || homePhrases.includes(cleaned)) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'home',
      websiteName: 'AccessAble AI Home',
      isExternal: false,
      language: normalized.includes('po') || normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Opening AccessAble AI Home',
    };
  }

  // 4. Internal Platform Navigation
  if (normalized.includes('portal') || normalized.includes('access portal')) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'portal',
      isExternal: false,
      language: 'en',
      feedback: 'Opening Website Access Portal',
    };
  }

  if (normalized.includes('scanner') || normalized.includes('audit')) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'scanner',
      isExternal: false,
      language: 'en',
      feedback: 'Opening Website Scanner',
    };
  }

  if (normalized.includes('dashboard')) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'dashboard',
      isExternal: false,
      language: 'en',
      feedback: 'Opening Dashboard',
    };
  }

  if (normalized.includes('repair') || normalized.includes('fix')) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'ai-repair',
      isExternal: false,
      language: 'en',
      feedback: 'Opening AI Repair Studio',
    };
  }

  if (normalized.includes('history')) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'history',
      isExternal: false,
      language: 'en',
      feedback: 'Opening Scan History',
    };
  }

  if (!normalized.includes('reset') && (normalized.includes('settings') || normalized.includes('hub'))) {
    return {
      raw: rawInput,
      normalized,
      action: 'navigate_internal',
      target: 'assistant',
      isExternal: false,
      language: 'en',
      feedback: 'Opening Accessibility Settings Hub',
    };
  }

  // 5. Scroll Commands (English & Tamil)
  if (
    normalized.includes('scroll down') ||
    normalized === 'scroll down' ||
    normalized === 'down' ||
    normalized === 'page down' ||
    cleaned.includes('scroll down') ||
    normalized.includes('kizha po') ||
    normalized.includes('kizhe po') ||
    normalized.includes('kizhe scroll pannu') ||
    normalized.includes('kizha scroll pannu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'scroll_down',
      isExternal: false,
      language: normalized.includes('kizha') || normalized.includes('kizhe') ? 'ta' : 'en',
      feedback: 'Scrolling down',
    };
  }

  if (
    normalized.includes('scroll up') ||
    normalized === 'scroll up' ||
    normalized === 'up' ||
    normalized === 'page up' ||
    cleaned.includes('scroll up') ||
    normalized.includes('mela po') ||
    normalized.includes('mele po') ||
    normalized.includes('mela scroll pannu') ||
    normalized.includes('mele scroll pannu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'scroll_up',
      isExternal: false,
      language: normalized.includes('mela') || normalized.includes('mele') ? 'ta' : 'en',
      feedback: 'Scrolling up',
    };
  }

  if (normalized.includes('go to top') || normalized.includes('top of page') || cleaned === 'go to top') {
    return {
      raw: rawInput,
      normalized,
      action: 'scroll_top',
      isExternal: false,
      language: 'en',
      feedback: 'Scrolled to top of page',
    };
  }

  // 6. Navigation History Back
  if (
    normalized === 'go back' ||
    normalized === 'back' ||
    normalized === 'previous page' ||
    cleaned === 'go back' ||
    normalized === 'pinnadi po' ||
    normalized === 'pinadi po'
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'go_back',
      isExternal: false,
      language: normalized.includes('pinnadi') || normalized.includes('pinadi') ? 'ta' : 'en',
      feedback: 'Going back to previous page',
    };
  }

  // 6b. Scroll Bottom
  if (
    normalized.includes('scroll bottom') ||
    normalized.includes('to bottom') ||
    normalized === 'bottom' ||
    normalized.includes('kizha kadaisi')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'scroll_bottom',
      isExternal: false,
      language: normalized.includes('kizha') ? 'ta' : 'en',
      feedback: 'Scrolled to bottom of page',
    };
  }

  // 7. Text-to-Speech Commands
  if (
    normalized.includes('read page') ||
    normalized.includes('read screen') ||
    normalized.includes('speak') ||
    normalized.includes('padi') ||
    normalized.includes('padichu kaatu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'read_page',
      isExternal: false,
      language: normalized.includes('padi') ? 'ta' : 'en',
      feedback: 'Reading page content aloud',
    };
  }

  if (
    normalized.includes('stop reading') ||
    normalized.includes('stop audio') ||
    normalized.includes('quiet') ||
    normalized.includes('silence') ||
    normalized === 'stop' ||
    normalized === 'stop pannu' ||
    normalized === 'pesatha' ||
    normalized === 'niruthu'
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'stop_speech',
      isExternal: false,
      language: normalized.includes('pannu') || normalized.includes('pesatha') || normalized.includes('niruthu') ? 'ta' : 'en',
      feedback: 'Speech audio stopped',
    };
  }

  // 8. Text Sizing & Contrast
  if (
    normalized.includes('increase text') ||
    normalized.includes('larger text') ||
    normalized.includes('bigger text') ||
    normalized.includes('zoom in') ||
    normalized.includes('perusa aaku') ||
    normalized.includes('perisa aaku')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'increase_text',
      isExternal: false,
      language: normalized.includes('perusa') || normalized.includes('perisa') ? 'ta' : 'en',
      feedback: 'Text size increased',
    };
  }

  if (
    normalized.includes('decrease text') ||
    normalized.includes('smaller text') ||
    normalized.includes('zoom out') ||
    normalized.includes('chinnatha aaku') ||
    normalized.includes('chinatha aaku')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'decrease_text',
      isExternal: false,
      language: normalized.includes('chinnatha') || normalized.includes('chinatha') ? 'ta' : 'en',
      feedback: 'Text size decreased',
    };
  }

  if (
    normalized.includes('contrast') ||
    normalized.includes('high contrast') ||
    normalized.includes('dark mode') ||
    normalized.includes('light mode') ||
    normalized.includes('theme mathu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_contrast',
      isExternal: false,
      language: normalized.includes('mathu') ? 'ta' : 'en',
      feedback: 'Toggled high contrast color theme',
    };
  }

  // 9. Accessibility Modes Activation
  if (normalized.includes('blind mode')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'blind',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Toggled Blind Mode',
    };
  }

  if (normalized.includes('low vision')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'low_vision',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Toggled Low Vision Mode',
    };
  }

  if (normalized.includes('hearing mode')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'hearing',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Toggled Hearing Mode',
    };
  }

  if (normalized.includes('head tracking') || normalized.includes('camera tracking') || (normalized.includes('camera') && !normalized.includes('open'))) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'head_tracking',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Toggled Optical Head Tracking',
    };
  }

  if (normalized.includes('motor mode') || normalized.includes('motor accessibility')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'motor',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled Motor Mode',
    };
  }

  if (normalized.includes('cognitive mode')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_mode',
      target: 'cognitive',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled Cognitive Mode',
    };
  }

  // 10. Display and Assistive Feature Toggles
  if (normalized.includes('dyslexia') || normalized.includes('dyslexic')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_dyslexia',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled OpenDyslexic font',
    };
  }

  if (normalized.includes('ruler') || normalized.includes('reading ruler')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_ruler',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled Reading Ruler',
    };
  }

  if (normalized.includes('large cursor') || normalized.includes('big cursor') || (normalized.includes('cursor') && !normalized.includes('head'))) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_cursor',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled Enlarged Cursor',
    };
  }

  if (normalized.includes('reduce motion') || normalized.includes('reduced motion')) {
    return {
      raw: rawInput,
      normalized,
      action: 'toggle_motion',
      isExternal: false,
      language: 'en',
      feedback: 'Toggled Reduced Motion',
    };
  }

  if (
    normalized.includes('reset settings') ||
    normalized.includes('reset all') ||
    normalized.includes('reset defaults') ||
    normalized.includes('reset accessibility')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'reset_settings',
      isExternal: false,
      language: 'en',
      feedback: 'Reset all accessibility settings to default',
    };
  }

  // 11. Toolbars, Shortcuts & Modals
  if (
    normalized.includes('open quick controls') ||
    normalized.includes('open toolbar') ||
    normalized === 'quick controls' ||
    normalized === 'toolbar' ||
    normalized.includes('toolbar open pannu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'open_toolbar',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Opened Quick Controls Toolbar',
    };
  }

  if (
    normalized.includes('close toolbar') ||
    normalized.includes('hide toolbar') ||
    normalized.includes('toolbar moodu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'close_toolbar',
      isExternal: false,
      language: normalized.includes('moodu') ? 'ta' : 'en',
      feedback: 'Closed Quick Controls Toolbar',
    };
  }

  if (normalized.includes('shortcuts') || normalized.includes('keyboard shortcuts')) {
    return {
      raw: rawInput,
      normalized,
      action: 'open_shortcuts',
      isExternal: false,
      language: 'en',
      feedback: 'Opened Keyboard Shortcuts Modal',
    };
  }

  if (
    normalized === 'help' ||
    normalized.includes('voice help') ||
    normalized.includes('voice commands') ||
    normalized.includes('open voice') ||
    normalized.includes('voice console')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'open_voice_modal',
      isExternal: false,
      language: 'en',
      feedback: 'Opened Hands-Free Voice Commands Console',
    };
  }

  if (
    normalized === 'close' ||
    normalized === 'close dialog' ||
    normalized === 'close modal' ||
    normalized === 'moodu' ||
    normalized === 'escape'
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'close_modals',
      isExternal: false,
      language: normalized.includes('moodu') ? 'ta' : 'en',
      feedback: 'Closed dialog',
    };
  }

  // 12. Interactive Trigger Actions
  if (
    normalized.includes('start scan') ||
    normalized.includes('run scan') ||
    normalized.includes('scan now') ||
    normalized.includes('audit now') ||
    normalized.includes('scan pannu')
  ) {
    return {
      raw: rawInput,
      normalized,
      action: 'trigger_scan',
      isExternal: false,
      language: normalized.includes('pannu') ? 'ta' : 'en',
      feedback: 'Triggered Accessibility Audit Scan',
    };
  }

  // 13. Unrecognized Command
  return {
    raw: rawInput,
    normalized,
    action: 'unknown',
    isExternal: false,
    language: 'en',
    feedback: `Command not recognized: "${rawInput}". Try "go to scanner", "open YouTube", or "help".`,
  };
}

/**
 * Safely executes a parsed command.
 * For external websites: Opens in a new tab via window.open with noopener,noreferrer.
 * Returns true if navigation succeeded, false if popup was blocked.
 */
export function executeVoiceCommand(
  parsed: ParsedVoiceCommand,
  handlers: {
    onNavigate: (page: string) => void;
    onOpenBlocked?: () => void;
    onScrollDown?: () => void;
    onScrollUp?: () => void;
    onScrollTop?: () => void;
    onScrollBottom?: () => void;
    onGoBack?: () => void;
    onReadPage?: () => void;
    onStopSpeech?: () => void;
    onIncreaseText?: () => void;
    onDecreaseText?: () => void;
    onToggleContrast?: () => void;
    onToggleDyslexia?: () => void;
    onToggleReadingRuler?: () => void;
    onToggleCursor?: () => void;
    onToggleReducedMotion?: () => void;
    onToggleMode?: (mode: any) => void;
    onOpenToolbar?: () => void;
    onCloseToolbar?: () => void;
    onOpenShortcuts?: () => void;
    onOpenVoiceModal?: () => void;
    onCloseModals?: () => void;
    onResetAccessibility?: () => void;
    onTriggerScan?: () => void;
  }
): { success: boolean; popupBlocked: boolean; message: string; blockedUrl?: string } {
  if (parsed.action === 'open_blocked') {
    if (handlers.onOpenBlocked) {
      handlers.onOpenBlocked();
      return {
        success: true,
        popupBlocked: false,
        message: 'Opening link directly in browser',
      };
    } else if (typeof window !== 'undefined' && (window as any).__lastBlockedUrl) {
      const targetUrl = (window as any).__lastBlockedUrl;
      window.location.href = targetUrl;
      return {
        success: true,
        popupBlocked: false,
        message: `Navigating directly to ${targetUrl}`,
      };
    }
    return {
      success: false,
      popupBlocked: false,
      message: 'No pending blocked link to open. Say "open Google" first.',
    };
  }

  if (parsed.action === 'open_website' && parsed.target) {
    if (typeof window !== 'undefined') {
      // Check for direct-in-tab navigation preference
      const isDirectMode =
        parsed.normalized.includes('here') ||
        parsed.normalized.includes('this tab') ||
        parsed.normalized.includes('current tab') ||
        parsed.normalized.includes('direct') ||
        parsed.normalized.includes('now') ||
        parsed.normalized.includes('ippovae');

      if (isDirectMode) {
        window.location.href = parsed.target;
        return {
          success: true,
          popupBlocked: false,
          message: `Opening ${parsed.websiteName || parsed.target} directly`,
        };
      }

      try {
        const newWindow = window.open(parsed.target, '_blank', 'noopener,noreferrer');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          (window as any).__lastBlockedUrl = parsed.target;
          return {
            success: false,
            popupBlocked: true,
            blockedUrl: parsed.target,
            message: `Browser blocked popup. Say "proceed" or "open now" to open hands-free, or click the link.`,
          };
        }
        return {
          success: true,
          popupBlocked: false,
          message: `Opened ${parsed.websiteName || parsed.target} in a new tab.`,
        };
      } catch (err: any) {
        (window as any).__lastBlockedUrl = parsed.target;
        return {
          success: false,
          popupBlocked: true,
          blockedUrl: parsed.target,
          message: `Could not open ${parsed.target}: ${err.message}. Say "proceed" to open directly.`,
        };
      }
    }
    return { success: false, popupBlocked: false, message: 'Window object unavailable.' };
  }

  if (parsed.action === 'navigate_internal' && parsed.target) {
    handlers.onNavigate(parsed.target);
    return {
      success: true,
      popupBlocked: false,
      message: parsed.feedback,
    };
  }

  if (parsed.action === 'scroll_down') {
    if (handlers.onScrollDown) {
      handlers.onScrollDown();
    } else if (typeof window !== 'undefined') {
      window.scrollBy({ top: 450, behavior: 'smooth' });
    }
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'scroll_up') {
    if (handlers.onScrollUp) {
      handlers.onScrollUp();
    } else if (typeof window !== 'undefined') {
      window.scrollBy({ top: -450, behavior: 'smooth' });
    }
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'scroll_top') {
    if (handlers.onScrollTop) {
      handlers.onScrollTop();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'scroll_bottom') {
    if (handlers.onScrollBottom) {
      handlers.onScrollBottom();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'go_back') {
    if (handlers.onGoBack) {
      handlers.onGoBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'read_page' && handlers.onReadPage) {
    handlers.onReadPage();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'stop_speech' && handlers.onStopSpeech) {
    handlers.onStopSpeech();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'increase_text' && handlers.onIncreaseText) {
    handlers.onIncreaseText();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'decrease_text' && handlers.onDecreaseText) {
    handlers.onDecreaseText();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_contrast' && handlers.onToggleContrast) {
    handlers.onToggleContrast();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_dyslexia' && handlers.onToggleDyslexia) {
    handlers.onToggleDyslexia();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_ruler' && handlers.onToggleReadingRuler) {
    handlers.onToggleReadingRuler();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_cursor' && handlers.onToggleCursor) {
    handlers.onToggleCursor();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_motion' && handlers.onToggleReducedMotion) {
    handlers.onToggleReducedMotion();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'toggle_mode' && parsed.target && handlers.onToggleMode) {
    handlers.onToggleMode(parsed.target);
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'open_toolbar' && handlers.onOpenToolbar) {
    handlers.onOpenToolbar();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'close_toolbar' && handlers.onCloseToolbar) {
    handlers.onCloseToolbar();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'open_shortcuts' && handlers.onOpenShortcuts) {
    handlers.onOpenShortcuts();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'open_voice_modal' && handlers.onOpenVoiceModal) {
    handlers.onOpenVoiceModal();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'close_modals' && handlers.onCloseModals) {
    handlers.onCloseModals();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'reset_settings' && handlers.onResetAccessibility) {
    handlers.onResetAccessibility();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  if (parsed.action === 'trigger_scan' && handlers.onTriggerScan) {
    handlers.onTriggerScan();
    return { success: true, popupBlocked: false, message: parsed.feedback };
  }

  return {
    success: false,
    popupBlocked: false,
    message: parsed.feedback,
  };
}

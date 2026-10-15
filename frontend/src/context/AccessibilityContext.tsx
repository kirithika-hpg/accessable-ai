import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPreferences, AccessibilityMode } from '../types';
import { tts } from '../services/tts';
import { speechRecognition } from '../services/speechRecognition';
import { headTracker } from '../services/headTracker';

export interface VisualAlertEvent {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: number;
}

interface AccessibilityContextType {
  preferences: UserPreferences;
  activeModes: AccessibilityMode[];
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  toggleMode: (mode: AccessibilityMode) => void;
  enableMode: (mode: AccessibilityMode) => void;
  disableMode: (mode: AccessibilityMode) => void;
  isModeActive: (mode: AccessibilityMode) => boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleContrast: () => void;
  toggleDyslexiaFont: () => void;
  toggleEasyReading: () => void;
  toggleReducedMotion: () => void;
  toggleCursorEnlarged: () => void;
  toggleReadingRuler: () => void;
  toggleDwellClick: () => void;
  toggleSwitchNav: () => void;
  resetAccessibility: () => void;
  clearStoredPreferences: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  speakText: (text: string) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  isListening: boolean;
  toggleVoiceListening: () => void;
  lastVoiceTranscript: string;
  visualAlert: VisualAlertEvent | null;
  triggerVisualAlert: (message: string, type?: VisualAlertEvent['type']) => void;
  clearVisualAlert: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  font_size: 'normal',
  dyslexia_font: false,
  easy_reading: false,
  reduced_motion: false,
  text_to_speech: true,
  tts_rate: 1.0,
  tts_pitch: 1.0,
  voice_commands: false,
  active_modes: [],
  cursor_enlarged: false,
  reading_ruler: false,
  dwell_click_enabled: false,
  dwell_delay_ms: 1000,
  head_tracking_enabled: false,
  head_tracking_sensitivity: 2.4,
  switch_nav_enabled: false,
  switch_scan_speed_ms: 1500,
  visual_alerts_enabled: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    const saved = localStorage.getItem('accessable_preferences');
    if (saved) {
      try {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState('');
  const [visualAlert, setVisualAlert] = useState<VisualAlertEvent | null>(null);

  // Sync TTS and Speech Recognition listeners
  useEffect(() => {
    const unsubscribeTTS = tts.subscribe((speaking, paused) => {
      setIsSpeaking(speaking);
      setIsPaused(paused);
    });
    const unsubscribeSR = speechRecognition.subscribeState((listening) => {
      setIsListening(listening);
    });
    const unsubscribeCmd = speechRecognition.onCommand((cmd) => {
      setLastVoiceTranscript(cmd);
    });
    return () => {
      unsubscribeTTS();
      unsubscribeSR();
      unsubscribeCmd();
    };
  }, []);

  // Sync Head Tracker with preference
  useEffect(() => {
    if (preferences.head_tracking_enabled) {
      headTracker.start();
    } else {
      headTracker.stop();
    }
  }, [preferences.head_tracking_enabled]);

  // Apply visual styling and accessible DOM attributes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessable_preferences', JSON.stringify(preferences));

    const root = document.documentElement;
    const body = document.body;

    // Theme classes
    root.classList.remove('dark', 'theme-high-contrast-dark', 'theme-high-contrast-light');
    body.classList.remove('theme-high-contrast-dark', 'theme-high-contrast-light');

    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'high-contrast-dark') {
      root.classList.add('theme-high-contrast-dark');
      body.classList.add('theme-high-contrast-dark');
    } else if (preferences.theme === 'high-contrast-light') {
      root.classList.add('theme-high-contrast-light');
      body.classList.add('theme-high-contrast-light');
    }

    // Font size scaling
    let scale = '1';
    if (preferences.font_size === 'large') scale = '1.15';
    if (preferences.font_size === 'x-large') scale = '1.30';
    if (preferences.font_size === 'xx-large') scale = '1.45';
    root.style.setProperty('--app-font-scale', scale);
    root.style.fontSize = `${parseFloat(scale) * 100}%`;

    // Easy reading
    if (preferences.easy_reading) {
      body.classList.add('easy-reading-mode');
    } else {
      body.classList.remove('easy-reading-mode');
    }

    // Dyslexia font
    if (preferences.dyslexia_font) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // Reduced motion
    if (preferences.reduced_motion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Cursor enlargement
    if (preferences.cursor_enlarged) {
      body.classList.add('cursor-enlarged');
    } else {
      body.classList.remove('cursor-enlarged');
    }
  }, [preferences]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const activeModes = preferences.active_modes || [];

  const isModeActive = useCallback(
    (mode: AccessibilityMode) => activeModes.includes(mode),
    [activeModes]
  );

  const enableMode = useCallback((mode: AccessibilityMode) => {
    setPreferences((prev) => {
      const current = prev.active_modes || [];
      if (current.includes(mode)) return prev;

      const updatedModes = [...current, mode];
      const updates: Partial<UserPreferences> = { active_modes: updatedModes };

      // Mode-specific presets
      if (mode === 'blind') {
        updates.text_to_speech = true;
      } else if (mode === 'low_vision') {
        if (prev.theme === 'light') updates.theme = 'high-contrast-dark';
        if (prev.font_size === 'normal') updates.font_size = 'large';
        updates.cursor_enlarged = true;
      } else if (mode === 'voice_control') {
        updates.voice_commands = true;
      } else if (mode === 'head_tracking') {
        updates.head_tracking_enabled = true;
        updates.dwell_click_enabled = true;
      } else if (mode === 'motor') {
        updates.dwell_click_enabled = true;
      } else if (mode === 'cognitive') {
        updates.easy_reading = true;
        updates.reading_ruler = true;
      } else if (mode === 'hearing') {
        updates.visual_alerts_enabled = true;
        updates.voice_commands = true;
      }

      return { ...prev, ...updates };
    });
  }, []);

  const disableMode = useCallback((mode: AccessibilityMode) => {
    setPreferences((prev) => {
      const current = prev.active_modes || [];
      const updatedModes = current.filter((m) => m !== mode);
      const updates: Partial<UserPreferences> = { active_modes: updatedModes };

      if (mode === 'head_tracking') {
        updates.head_tracking_enabled = false;
      } else if (mode === 'cognitive') {
        updates.reading_ruler = false;
      }

      return { ...prev, ...updates };
    });
  }, []);

  const toggleMode = useCallback(
    (mode: AccessibilityMode) => {
      if (isModeActive(mode)) {
        disableMode(mode);
      } else {
        enableMode(mode);
      }
    },
    [isModeActive, disableMode, enableMode]
  );

  const increaseFontSize = () => {
    setPreferences((prev) => {
      if (prev.font_size === 'normal') return { ...prev, font_size: 'large' };
      if (prev.font_size === 'large') return { ...prev, font_size: 'x-large' };
      if (prev.font_size === 'x-large') return { ...prev, font_size: 'xx-large' };
      return prev;
    });
  };

  const decreaseFontSize = () => {
    setPreferences((prev) => {
      if (prev.font_size === 'xx-large') return { ...prev, font_size: 'x-large' };
      if (prev.font_size === 'x-large') return { ...prev, font_size: 'large' };
      if (prev.font_size === 'large') return { ...prev, font_size: 'normal' };
      return prev;
    });
  };

  const toggleContrast = () => {
    setPreferences((prev) => {
      const modes: UserPreferences['theme'][] = [
        'light',
        'dark',
        'high-contrast-dark',
        'high-contrast-light',
      ];
      const nextIdx = (modes.indexOf(prev.theme) + 1) % modes.length;
      return { ...prev, theme: modes[nextIdx] };
    });
  };

  const toggleDyslexiaFont = () => {
    setPreferences((prev) => ({ ...prev, dyslexia_font: !prev.dyslexia_font }));
  };

  const toggleEasyReading = () => {
    setPreferences((prev) => ({ ...prev, easy_reading: !prev.easy_reading }));
  };

  const toggleReducedMotion = () => {
    setPreferences((prev) => ({ ...prev, reduced_motion: !prev.reduced_motion }));
  };

  const toggleCursorEnlarged = () => {
    setPreferences((prev) => ({ ...prev, cursor_enlarged: !prev.cursor_enlarged }));
  };

  const toggleReadingRuler = () => {
    setPreferences((prev) => ({ ...prev, reading_ruler: !prev.reading_ruler }));
  };

  const toggleDwellClick = () => {
    setPreferences((prev) => ({ ...prev, dwell_click_enabled: !prev.dwell_click_enabled }));
  };

  const toggleSwitchNav = () => {
    setPreferences((prev) => ({ ...prev, switch_nav_enabled: !prev.switch_nav_enabled }));
  };

  const resetAccessibility = () => {
    tts.stop();
    speechRecognition.stop();
    headTracker.stop();
    setPreferences(defaultPreferences);
    setVisualAlert(null);
  };

  const clearStoredPreferences = () => {
    resetAccessibility();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessable_preferences');
    }
  };

  const speakText = (text: string) => {
    tts.speak(text, {
      rate: preferences.tts_rate,
      pitch: preferences.tts_pitch,
    });
  };

  const pauseSpeech = () => tts.pause();
  const resumeSpeech = () => tts.resume();
  const stopSpeech = () => tts.stop();

  const toggleVoiceListening = () => {
    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
  };

  const triggerVisualAlert = useCallback((message: string, type: VisualAlertEvent['type'] = 'info') => {
    const alert: VisualAlertEvent = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      timestamp: Date.now(),
    };
    setVisualAlert(alert);
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
      setVisualAlert((curr) => (curr?.id === alert.id ? null : curr));
    }, 5000);
  }, []);

  const clearVisualAlert = useCallback(() => {
    setVisualAlert(null);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        activeModes,
        updatePreferences,
        toggleMode,
        enableMode,
        disableMode,
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
        isPaused,
        speakText,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        isListening,
        toggleVoiceListening,
        lastVoiceTranscript,
        visualAlert,
        triggerVisualAlert,
        clearVisualAlert,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

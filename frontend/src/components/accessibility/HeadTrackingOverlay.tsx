import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Pause, Play, Crosshair, X, Sliders } from 'lucide-react';
import { headTracker, HeadTrackerState } from '../../services/headTracker';
import { useAccessibility } from '../../context/AccessibilityContext';

export const HeadTrackingOverlay: React.FC = () => {
  const { preferences, updatePreferences } = useAccessibility();
  const [trackerState, setTrackerState] = useState<HeadTrackerState>({
    isActive: false,
    isPaused: false,
    cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    dwellProgress: 0,
    hoveredElement: null,
    status: 'idle',
  });

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = headTracker.subscribe((state) => {
      setTrackerState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!preferences.head_tracking_enabled && !trackerState.isActive) {
    return null;
  }

  const handleStopCamera = () => {
    headTracker.stop();
    updatePreferences({ head_tracking_enabled: false });
  };

  const handleTogglePause = () => {
    if (trackerState.isPaused) {
      headTracker.resume();
    } else {
      headTracker.pause();
    }
  };

  const handleCalibrate = () => {
    headTracker.calibrate();
  };

  return (
    <>
      {/* On-screen Head Tracking Pointer with Dwell Indicator */}
      {trackerState.isActive && !trackerState.isPaused && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{
            left: `${trackerState.cursorX}px`,
            top: `${trackerState.cursorY}px`,
          }}
        >
          {/* Target Reticle */}
          <div className="relative flex items-center justify-center">
            {/* Outer Dwell Progress Ring */}
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                className="stroke-brand-600 dark:stroke-brand-400 transition-all duration-75"
                strokeWidth="3.5"
                strokeDasharray="113.097"
                strokeDashoffset={113.097 - (113.097 * trackerState.dwellProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Pointer Core */}
            <div
              className={`absolute w-3.5 h-3.5 rounded-full shadow-md ${
                trackerState.hoveredElement
                  ? 'bg-rose-500 ring-2 ring-white scale-125'
                  : 'bg-brand-600 ring-2 ring-white'
              }`}
            />
          </div>
        </div>
      )}

      {/* Floating Head Tracking Control Dock */}
      <aside
        aria-label="Head Tracking Controls"
        className="fixed bottom-20 left-4 z-[9990] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-brand-500 rounded-2xl shadow-2xl p-3 max-w-xs text-xs text-slate-800 dark:text-slate-100"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                trackerState.status === 'tracking'
                  ? trackerState.isPaused
                    ? 'bg-amber-500'
                    : 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-bold">
              {trackerState.isPaused ? 'Tracking Paused' : 'Head Tracking Active'}
            </span>
          </div>

          <button
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            title="Toggle Settings"
            aria-label="Toggle Head Tracking Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <button
            onClick={handleCalibrate}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800 hover:bg-brand-100"
            title="Re-center cursor to current position"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Center</span>
          </button>

          <button
            onClick={handleTogglePause}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
          >
            {trackerState.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{trackerState.isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleStopCamera}
            className="flex items-center space-x-1 py-1.5 px-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
            title="Turn off webcam and stop head tracking"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>
        </div>

        {/* Expanded Tuning Settings */}
        {isSettingsExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="sensitivity-slider" className="text-[11px] font-bold text-slate-500">
                  Sensitivity
                </label>
                <span className="font-mono text-brand-600">{headTracker.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                id="sensitivity-slider"
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
                <label htmlFor="dwell-slider" className="text-[11px] font-bold text-slate-500">
                  Dwell Time
                </label>
                <span className="font-mono text-brand-600">{headTracker.dwellDelayMs}ms</span>
              </div>
              <input
                id="dwell-slider"
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

            <p className="text-[10px] text-slate-400 italic">
              100% Local processing in browser. No webcam video or frames are saved or transmitted.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import {
  Search,
  AlertCircle,
  Globe,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface ScannerPageProps {
  onScanCompleted: (scanId: string) => void;
  onNavigate?: (page: string) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  onScanCompleted,
}) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { startScan, isScanning, scanProgress, scanPhase, scanError } = useScan();

  const handleValidateAndScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a website URL to scan.');
      return;
    }

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setValidationError('Only http:// and https:// websites can be scanned.');
        return;
      }
      const fullUrl = parsed.toString();
      const scanId = await startScan(fullUrl);
      onScanCompleted(scanId);
    } catch {
      setValidationError('Please enter a valid website address (e.g., https://example.com).');
    }
  };

  const handleQuickDemoScan = async (demoUrl: string) => {
    setUrl(demoUrl);
    setValidationError(null);
    try {
      const scanId = await startScan(demoUrl);
      onScanCompleted(scanId);
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Website Accessibility Scanner
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
          Evaluate public websites against WCAG 2.1 AA/AAA accessibility standards using the Deque axe-core testing engine.
        </p>
      </div>

      <Card className="p-6 sm:p-10 shadow-lg border-2 border-brand-200 dark:border-brand-900">
        <form onSubmit={handleValidateAndScan} className="space-y-6">
          <div>
            <label
              htmlFor="website-url-input"
              className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2"
            >
              Enter Public Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                id="website-url-input"
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setValidationError(null);
                }}
                disabled={isScanning}
                aria-required="true"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'url-error-msg' : undefined}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base focus:border-brand-600 focus:ring-0 placeholder:text-slate-400 transition"
              />
            </div>
            {validationError && (
              <p id="url-error-msg" className="mt-2 text-xs font-bold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>SSRF-protected • Timeout & Resource Limited</span>
            </span>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isScanning}
              isLoading={isScanning}
              icon={<Search className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              {isScanning ? 'Auditing Accessibility...' : 'Run Accessibility Scan'}
            </Button>
          </div>
        </form>

        {isScanning && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4" role="status" aria-live="polite">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                <span>{scanPhase || 'Initializing scan...'}</span>
              </span>
              <span className="font-mono font-bold text-brand-600">{scanProgress}%</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-accent-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center">
              Evaluating DOM elements, ARIA landmarks, color contrast ratios, and keyboard navigability.
            </p>
          </div>
        )}

        {scanError && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start space-x-3" role="alert">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Scan Execution Error</p>
              <p className="text-xs mt-0.5">{scanError}</p>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Quick Test Scenarios"
        subtitle="Test AccessAble AI with verified accessibility sample environments"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 transition bg-slate-50 dark:bg-slate-800/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Sample Accessibility Flaws
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Contains missing alt attributes, low contrast (#888 on white), unlabelled inputs, and skipped heading levels.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={isScanning}
              onClick={() => handleQuickDemoScan('http://127.0.0.1:8000/static/test_pages/inaccessible.html')}
            >
              Scan Flawed Test Page
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition bg-slate-50 dark:bg-slate-800/40">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Fully Accessible Reference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Proper ARIA landmarks, WCAG AAA contrast ratios, semantic headings, and descriptive alt attributes.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={isScanning}
              onClick={() => handleQuickDemoScan('http://127.0.0.1:8000/static/test_pages/accessible.html')}
            >
              Scan Accessible Page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

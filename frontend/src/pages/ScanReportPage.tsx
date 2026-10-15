import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Wrench,
  Volume2,
  VolumeX,
  Code,
  Info,
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityFinding } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface ScanReportPageProps {
  onNavigate: (page: string) => void;
  onSelectFindingForRepair: (finding: AccessibilityFinding) => void;
}

export const ScanReportPage: React.FC<ScanReportPageProps> = ({
  onNavigate,
  onSelectFindingForRepair,
}) => {
  const { currentScan } = useScan();
  const { speakText, isSpeaking, stopSpeech } = useAccessibility();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  if (!currentScan) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldAlert className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No Scan Report Selected</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please run a new accessibility scan or select a previous report from your scan history.
        </p>
        <Button onClick={() => onNavigate('scanner')}>Go to Scanner</Button>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFindings = (currentScan.findings || []).filter((f: any) => {
    if (severityFilter === 'all') return true;
    return f.severity === severityFilter;
  });

  const handleReadFindingAloud = (finding: AccessibilityFinding) => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      const speech = `Accessibility issue: ${finding.rule_name}. Severity: ${finding.severity}. Description: ${finding.description}. Recommended fix: ${finding.recommended_fix}`;
      speakText(speech);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => onNavigate('dashboard')}
            aria-label="Back to Dashboard"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Accessibility Audit Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xl">
              Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentScan.target_url}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-brand-600" />}
            onClick={() => {
              if (isSpeaking) stopSpeech();
              else speakText(`Audit Report for ${currentScan.target_url}. Total issues: ${currentScan.total_issues}. Critical issues: ${currentScan.critical_count}. Accessibility score: ${Math.round(currentScan.accessibility_score)} percent.`);
            }}
          >
            {isSpeaking ? 'Stop Reading' : 'Read Summary'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Health Score</span>
          <span className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400 mt-1 block">
            {Math.round(currentScan.accessibility_score)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">WCAG Compliance Index</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Critical</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
            {currentScan.critical_count}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Blocks assistive tech</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">Serious</span>
          <span className="text-2xl sm:text-3xl font-black text-orange-600 mt-1 block">
            {currentScan.serious_count}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Significant barrier</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Moderate</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
            {currentScan.moderate_count}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Impairs usability</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Minor</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 block">
            {currentScan.minor_count}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Subtle flaw</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start space-x-3 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-bold">Automated vs Manual Testing Notice:</p>
          <p className="mt-0.5 leading-relaxed">
            These results are generated by the automated axe-core engine. While automated tools detect syntax, missing tags, and contrast issues, they cannot verify whether text descriptions are genuinely meaningful or test complex keyboard workflows. Supplementary testing with screen readers (NVDA, JAWS, TalkBack) is strongly recommended.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Detected Issues ({filteredFindings.length})
            </h2>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {(['all', 'critical', 'serious', 'moderate', 'minor'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  severityFilter === sev
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No issues matching this filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different severity filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map((finding: any) => {
              const isExpanded = expandedFindings[finding.id] ?? true;

              return (
                <div
                  key={finding.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start space-x-3">
                      <Badge severity={finding.severity} />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                          <span>{finding.rule_name}</span>
                          <span className="text-xs font-mono text-slate-400">({finding.rule_id})</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {finding.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleReadFindingAloud(finding)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Read this issue aloud"
                        aria-label={`Read ${finding.rule_name} aloud`}
                      >
                        <Volume2 className="w-4 h-4 text-brand-600" />
                      </button>

                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Wrench className="w-3.5 h-3.5" />}
                        onClick={() => {
                          onSelectFindingForRepair(finding);
                          onNavigate('ai-repair');
                        }}
                      >
                        AI Repair
                      </Button>

                      <button
                        onClick={() => toggleExpand(finding.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600"
                        aria-label={isExpanded ? 'Collapse issue details' : 'Expand issue details'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-semibold text-slate-500">WCAG Tags:</span>
                        {finding.wcag_tags?.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="wcag">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                          <Code className="w-3.5 h-3.5 text-slate-400" />
                          <span>Affected Element (Selector):</span>
                        </span>
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 break-all border border-slate-200 dark:border-slate-700">
                          {finding.selector}
                        </div>
                      </div>

                      {finding.html_snippet && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Problematic HTML:
                          </span>
                          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto">
                            <code>{finding.html_snippet}</code>
                          </pre>
                        </div>
                      )}

                      <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900">
                        <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider block mb-1">
                          Recommended Remediation:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                          {finding.recommended_fix}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Globe,
  AlertTriangle,
  Flame,
  CheckCircle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onSelectScan: (scanId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectScan,
}) => {
  const { scansList, loadScansList } = useScan();

  const totalScans = scansList.length;
  const totalIssues = scansList.reduce((acc: number, s: any) => acc + (s.total_issues || 0), 0);
  const criticalIssues = scansList.reduce((acc: number, s: any) => acc + (s.critical_count || 0), 0);
  const avgScore =
    totalScans > 0
      ? Math.round(scansList.reduce((acc: number, s: any) => acc + (s.accessibility_score || 0), 0) / totalScans)
      : 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Accessibility Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time compliance overview, severe blockers, and digital inclusion health
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => loadScansList()}
            aria-label="Refresh dashboard statistics"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onNavigate('scanner')}
            aria-label="Start new website accessibility scan"
          >
            New Scan
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Websites Scanned
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {totalScans}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Live audits stored</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <Globe className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total WCAG Issues
            </span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {totalIssues}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Across all scanned pages</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Critical Blockers
            </span>
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {criticalIssues}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Immediate action required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600">
            <Flame className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Avg Health Score
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {totalScans > 0 ? `${avgScore}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Based on WCAG 2.1 rules</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Scans & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Recent Scan History"
            subtitle="Websites audited for accessibility compliance"
            action={
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>View all scans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {scansList.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No websites scanned yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Run your first accessibility audit to detect WCAG compliance issues and get AI-guided fixes.
                </p>
                <div className="mt-4">
                  <Button size="sm" onClick={() => onNavigate('scanner')}>
                    Scan a Website Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" aria-label="Recent Scans List">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                      <th className="pb-3">Target URL</th>
                      <th className="pb-3">Health</th>
                      <th className="pb-3">Issues</th>
                      <th className="pb-3">Critical</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scansList.slice(0, 5).map((scan: any) => (
                      <tr key={scan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                          {scan.target_url}
                        </td>
                        <td className="py-3 font-bold text-slate-700 dark:text-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              scan.accessibility_score >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : scan.accessibility_score >= 50
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {Math.round(scan.accessibility_score)}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 font-semibold">
                          {scan.total_issues}
                        </td>
                        <td className="py-3">
                          {scan.critical_count > 0 ? (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                              {scan.critical_count} critical
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onSelectScan(scan.id)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                            aria-label={`Open scan report for ${scan.target_url}`}
                          >
                            <span>Open Report</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card
            title="Recommended Actions"
            subtitle="Prioritized steps to improve digital accessibility"
          >
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900">
                <div className="flex items-start space-x-2.5">
                  <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Fix Missing Alternative Text
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      Ensure every informative `&lt;img&gt;` has descriptive `alt` text so blind screen reader users understand images.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Improve Contrast Ratios
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Verify regular text meets minimum 4.5:1 contrast against its background for low-vision and elderly users.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900">
                <div className="flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-900 dark:text-brand-200">
                      Use AI Repair Assistant
                    </h4>
                    <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5">
                      Click any issue finding to get automated HTML patches and preview fixes before updating your production codebase.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => onNavigate('scanner')}
              >
                Scan Next Website
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

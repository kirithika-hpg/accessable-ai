import React, { useState } from 'react';
import {
  History,
  Trash2,
  Search,
  Calendar,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface ScanHistoryPageProps {
  onNavigate: (page: string) => void;
  onSelectScan: (scanId: string) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  onNavigate,
  onSelectScan,
}) => {
  const { scansList, deleteScan } = useScan();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredScans = scansList.filter((scan: any) =>
    scan.target_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this scan report?')) {
      setDeletingId(scanId);
      try {
        await deleteScan(scanId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Audit Scan History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access previous WCAG reports, inspect progress, or manage historical records
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate('scanner')}
        >
          New Scan
        </Button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Filter by website URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Filter audit history by website URL"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filteredScans.length === 0 ? (
        <Card className="text-center py-16">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {searchTerm ? 'No scans matched your search' : 'No audit history available'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchTerm ? 'Try a different search keyword' : 'Start scanning websites to build your history log.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScans.map((scan: any) => (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan.id)}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/60 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectScan(scan.id);
                }
              }}
              aria-label={`Open report for ${scan.target_url}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                    {scan.target_url}
                  </h2>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      scan.accessibility_score >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : scan.accessibility_score >= 50
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {Math.round(scan.accessibility_score)}%
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(scan.scanned_at)}</span>
                  <span>•</span>
                  <span>{scan.scan_duration_ms ? `${(scan.scan_duration_ms / 1000).toFixed(1)}s` : 'completed'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-semibold">Total Issues</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {scan.total_issues}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-500 block font-semibold">Critical</span>
                    <span className="text-sm font-bold text-rose-600">
                      {scan.critical_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-500 block font-semibold">Serious</span>
                    <span className="text-sm font-bold text-amber-600">
                      {scan.serious_count}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 inline-flex items-center space-x-1">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>

                <button
                  onClick={(e) => handleDelete(e, scan.id)}
                  disabled={deletingId === scan.id}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  aria-label={`Delete scan report for ${scan.target_url}`}
                  title="Delete scan"
                >
                  {deletingId === scan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

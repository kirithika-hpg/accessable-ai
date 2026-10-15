import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanReport, AccessibilityFinding } from '../types';
import { api } from '../services/api';

interface ScanContextType {
  currentScan: ScanReport | null;
  scansList: ScanReport[];
  isScanning: boolean;
  scanProgress: number;
  scanPhase: string;
  scanError: string | null;
  selectedFinding: AccessibilityFinding | null;
  startScan: (url: string) => Promise<string>;
  loadScan: (scanId: string) => Promise<void>;
  loadScansList: () => Promise<void>;
  deleteScan: (scanId: string) => Promise<void>;
  setSelectedFinding: (finding: AccessibilityFinding | null) => void;
  setCurrentScan: (scan: ScanReport | null) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScan, setCurrentScan] = useState<ScanReport | null>(null);
  const [scansList, setScansList] = useState<ScanReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<AccessibilityFinding | null>(null);

  const loadScansList = async () => {
    try {
      const scans = await api.getScans();
      setScansList(scans);
    } catch (err: any) {
      console.warn('Could not load scans list:', err.message);
    }
  };

  useEffect(() => {
    loadScansList();
  }, []);

  const startScan = async (url: string): Promise<string> => {
    setIsScanning(true);
    setScanProgress(10);
    setScanPhase('Validating website URL and SSRF check...');
    setScanError(null);

    try {
      const response = await api.startScan(url);
      const scanId = response.scan_id;

      setScanProgress(30);
      setScanPhase('Rendering DOM and navigating securely...');

      // Poll scan status until completed
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max

      while (attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 1000));

        if (attempts === 2) {
          setScanProgress(55);
          setScanPhase('Injecting axe-core engine & evaluating WCAG 2.1 rules...');
        } else if (attempts === 5) {
          setScanProgress(80);
          setScanPhase('Analyzing failure summaries and formatting recommendations...');
        }

        try {
          const report = await api.getScan(scanId);
          if (report.status === 'completed') {
            setScanProgress(100);
            setScanPhase('Accessibility scan completed!');
            setCurrentScan(report);
            setIsScanning(false);
            loadScansList();
            return scanId;
          } else if (report.status === 'failed') {
            throw new Error(report.error_message || 'Scan failed.');
          }
        } catch (pollErr: any) {
          if (pollErr.message && !pollErr.message.includes('404')) {
            throw pollErr;
          }
        }
      }

      throw new Error('Scan timed out after 60 seconds.');
    } catch (err: any) {
      setIsScanning(false);
      setScanError(err.message || 'An error occurred during scan.');
      throw err;
    }
  };

  const loadScan = async (scanId: string) => {
    try {
      const report = await api.getScan(scanId);
      setCurrentScan(report);
    } catch (err: any) {
      console.error('Failed to load scan:', err);
      setScanError(err.message);
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      await api.deleteScan(scanId);
      setScansList((prev) => prev.filter((s) => s.id !== scanId));
      if (currentScan?.id === scanId) {
        setCurrentScan(null);
      }
    } catch (err: any) {
      console.error('Failed to delete scan:', err);
      throw err;
    }
  };

  return (
    <ScanContext.Provider
      value={{
        currentScan,
        scansList,
        isScanning,
        scanProgress,
        scanPhase,
        scanError,
        selectedFinding,
        startScan,
        loadScan,
        loadScansList,
        deleteScan,
        setSelectedFinding,
        setCurrentScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

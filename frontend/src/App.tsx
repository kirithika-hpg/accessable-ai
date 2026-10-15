import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ScanProvider, useScan } from './context/ScanContext';
import { SkipLink } from './components/layout/SkipLink';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AccessibilityToolbar } from './components/accessibility/AccessibilityToolbar';
import { VoiceCommandsModal } from './components/accessibility/VoiceCommandsModal';
import { KeyboardShortcutsModal } from './components/accessibility/KeyboardShortcutsModal';
import { HeadTrackingOverlay } from './components/accessibility/HeadTrackingOverlay';
import { ReadingRuler } from './components/accessibility/ReadingRuler';
import { VisualAlertBanner } from './components/accessibility/VisualAlertBanner';
import { VoiceAssistantWidget } from './components/accessibility/VoiceAssistantWidget';

import { HomePage } from './pages/HomePage';
import { AccessPortalPage } from './pages/AccessPortalPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { ScanReportPage } from './pages/ScanReportPage';
import { AiRepairPage } from './pages/AiRepairPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { AssistantControlsPage } from './pages/AssistantControlsPage';
import { AccessibilityFinding } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isToolbarOpen, setIsToolbarOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  const { loadScan, setSelectedFinding } = useScan();

  // Keyboard navigation shortcuts (WCAG compliance)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          setCurrentPage('scanner');
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setCurrentPage('portal');
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setCurrentPage('dashboard');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setCurrentPage('home');
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setCurrentPage('ai-repair');
        } else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
        }
      }

      if (e.key === 'Escape') {
        setIsToolbarOpen(false);
        setIsVoiceModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectScan = async (scanId: string) => {
    await loadScan(scanId);
    setCurrentPage('report');
  };

  const handleSelectFindingForRepair = (finding: AccessibilityFinding) => {
    setSelectedFinding(finding);
    setCurrentPage('ai-repair');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <SkipLink />

      {/* Visual Alert Notice Banner for Hearing Accessibility Mode */}
      <VisualAlertBanner />

      {/* Dyslexia / Cognitive Reading Ruler */}
      <ReadingRuler />

      {/* Optical Head Tracking Pointer and Dock */}
      <HeadTrackingOverlay />

      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenAccessibilityToolbar={() => setIsToolbarOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={setCurrentPage}
            onOpenAccessibilityToolbar={() => setIsToolbarOpen(true)}
          />
        )}
        {currentPage === 'portal' && (
          <AccessPortalPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentPage}
            onSelectScan={handleSelectScan}
          />
        )}
        {currentPage === 'scanner' && (
          <ScannerPage
            onScanCompleted={handleSelectScan}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'report' && (
          <ScanReportPage
            onNavigate={setCurrentPage}
            onSelectFindingForRepair={handleSelectFindingForRepair}
          />
        )}
        {currentPage === 'ai-repair' && (
          <AiRepairPage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'history' && (
          <ScanHistoryPage
            onNavigate={setCurrentPage}
            onSelectScan={handleSelectScan}
          />
        )}
        {currentPage === 'assistant' && (
          <AssistantControlsPage
            onNavigate={setCurrentPage}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Floating Assistive Controls Toolbar */}
      <AccessibilityToolbar
        isOpen={isToolbarOpen}
        onClose={() => setIsToolbarOpen(false)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Voice Commands Assistant Modal */}
      <VoiceCommandsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onNavigate={setCurrentPage}
        onOpenSettings={() => setCurrentPage('assistant')}
      />

      {/* Keyboard Shortcuts Helper Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Global Hands-Free Voice Assistant Controller Dock */}
      <VoiceAssistantWidget
        onNavigate={setCurrentPage}
        onOpenToolbar={() => setIsToolbarOpen(true)}
        onCloseToolbar={() => setIsToolbarOpen(false)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onCloseModals={() => {
          setIsToolbarOpen(false);
          setIsVoiceModalOpen(false);
          setIsShortcutsModalOpen(false);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <ScanProvider>
          <AppContent />
        </ScanProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
};

export default App;

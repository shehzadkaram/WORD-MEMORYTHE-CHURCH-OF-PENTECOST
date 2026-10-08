/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SidebarNav } from './components/layout/SidebarNav';
import { HeaderBar } from './components/layout/HeaderBar';
import { DemoBanner } from './components/common/DemoBanner';
import { SqlSchemaModal } from './components/common/SqlSchemaModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { TodaysVerseView } from './components/views/TodaysVerseView';
import { MemorizeView } from './components/views/MemorizeView';
import { ReviewView } from './components/views/ReviewView';
import { QuizView } from './components/views/QuizView';
import { BibleLibraryView } from './components/views/BibleLibraryView';
import { MyVersesView } from './components/views/MyVersesView';
import { ProgressView } from './components/views/ProgressView';
import { NotesView } from './components/views/NotesView';
import { RemindersView } from './components/views/RemindersView';
import { ChurchChallengesView } from './components/views/ChurchChallengesView';
import { SettingsView } from './components/views/SettingsView';
import { BackupRestoreView } from './components/views/BackupRestoreView';
import { BibleDatabaseManagerView } from './components/views/BibleDatabaseManagerView';
import { CurriculumJourneyView } from './components/views/CurriculumJourneyView';
import { CurriculumBuilderView } from './components/views/CurriculumBuilderView';
import { CurriculumReviewView } from './components/views/CurriculumReviewView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { PastoralOversightView } from './components/views/PastoralOversightView';
import { ContentGovernanceView } from './components/views/ContentGovernanceView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { UserManagementView } from './components/views/UserManagementView';
import { AppSection } from './types/navigation';
import { UserRoleType } from './types/database';
import { dbService } from './database/dbService';
import { AuthService } from './services/authService';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Lock, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRoleType>('MEMBER');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [selectedTargetDayNumber, setSelectedTargetDayNumber] = useState<number | undefined>(undefined);

  // Initialize local persistence on app mount
  useEffect(() => {
    dbService.init();
    dbService.setActiveRole(activeRole);
  }, []);

  const handleRoleChange = (role: UserRoleType) => {
    setActiveRole(role);
    dbService.setActiveRole(role);
  };

  const handleStartDailySession = (dayNumber?: number) => {
    setSelectedTargetDayNumber(dayNumber);
    setCurrentSection('memorize');
  };

  const renderActiveView = () => {
    // Role-based Access Control Check
    if (!AuthService.canAccessSection(activeRole, currentSection)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This section requires Pastoral Leadership or Administrator credentials. As a Church Member, you have access to your personal memorization flow, spaced repetition queue, reflections, and church challenges.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setCurrentSection('dashboard')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Return to Member Dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (currentSection) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(sec) => setCurrentSection(sec)}
            onStartSession={() => handleStartDailySession()}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
          />
        );
      case 'todays-verse':
        return (
          <TodaysVerseView
            onNavigate={(sec) => setCurrentSection(sec)}
            onStartSession={() => handleStartDailySession()}
          />
        );
      case 'memorize':
        return (
          <MemorizeView
            onNavigate={(sec) => setCurrentSection(sec)}
            initialDayNumber={selectedTargetDayNumber}
            onCompleteSession={() => {}}
          />
        );
      case 'review':
        return (
          <ReviewView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'quiz':
        return (
          <QuizView
            onNavigate={(sec) => setCurrentSection(sec)}
            initialDayNumber={selectedTargetDayNumber}
          />
        );
      case 'bible-library':
        return (
          <BibleLibraryView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'my-verses':
        return (
          <MyVersesView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'progress':
        return (
          <ProgressView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'notes':
        return (
          <NotesView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'reminders':
        return (
          <RemindersView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'church-challenges':
        return (
          <ChurchChallengesView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            onNavigate={(sec) => setCurrentSection(sec)}
            activeRole={activeRole}
            onRoleChange={setActiveRole}
          />
        );
      case 'backup-restore':
        return (
          <BackupRestoreView
            onNavigate={(sec) => setCurrentSection(sec)}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
          />
        );
      case 'curriculum-journey':
        return (
          <CurriculumJourneyView
            onNavigate={(sec) => setCurrentSection(sec)}
            onStartSession={handleStartDailySession}
          />
        );
      case 'curriculum-builder':
        return (
          <CurriculumBuilderView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'curriculum-review':
        return (
          <CurriculumReviewView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboardView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'pastoral-oversight':
        return (
          <PastoralOversightView
            onNavigate={(sec) => setCurrentSection(sec)}
          />
        );
      case 'content-governance':
        return (
          <ContentGovernanceView
            activeRole={activeRole}
          />
        );
      case 'audit-logs':
        return (
          <AuditLogsView />
        );
      case 'user-management':
        return (
          <UserManagementView
            activeRole={activeRole}
          />
        );
      case 'bible-manager':
        return (
          <BibleDatabaseManagerView
            currentRole={activeRole}
            onNavigateToBibleLibrary={() => setCurrentSection('bible-library')}
          />
        );
      default:
        return (
          <DashboardView
            onNavigate={(sec) => setCurrentSection(sec)}
            onStartSession={handleStartDailySession}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      
      {/* Top Demo & Phase 1 Scope Notice Banner */}
      <DemoBanner onOpenSchema={() => setIsSchemaModalOpen(true)} />

      <div className="flex-1 flex">
        {/* 13-Section Sidebar Navigation */}
        <SidebarNav
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area (offset by sidebar width on lg screens) */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          
          {/* Header Bar */}
          <HeaderBar
            currentSection={currentSection}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onStartSession={handleStartDailySession}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
            activeRole={activeRole}
          />

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <ErrorBoundary onReset={() => setCurrentSection('dashboard')}>
              {renderActiveView()}
            </ErrorBoundary>
          </main>

          {/* Church Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white px-4 sm:px-6 py-4 text-center space-y-1">
            <div className="text-xs font-black text-[#0B2545] tracking-wider uppercase">
              THE CHURCH OF PENTECOST, DUBAI • PAKISTANI & INDIAN WORSHIP CENTRE
            </div>
            <div className="text-[11px] font-medium text-amber-700">
              “Read • Understand • Memorize • Review • Live the Word”
            </div>
            <div className="text-[10px] text-slate-400">
              Word Memory Platform • Local-First SQLite Database Architecture • Urdu Bible Source: WordPocket
            </div>
          </footer>
        </div>
      </div>

      {/* 20-Table SQL Schema Inspector Modal */}
      <SqlSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

    </div>
  );
}


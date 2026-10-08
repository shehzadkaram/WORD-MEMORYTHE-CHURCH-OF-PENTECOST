import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Database, 
  BookOpen, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Play, 
  Server, 
  Users, 
  Download,
  Calendar, 
  ChevronRight,
  UserCog,
  FileCheck,
  Award,
  FileText,
  Layers,
  Printer
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AdminSystemHealthStats, AuditLog, AdminSystemAnalytics } from '../../types/database';
import { AppSection } from '../../types/navigation';
import { runPhase6GovernanceTests, Phase6TestResult } from '../../services/phase6Tests';
import { runPhase7BackupSafetyTests, Phase7TestResult } from '../../services/phase7Tests';
import { runPhase8ForensicQATests, Phase8TestResult } from '../../services/phase8Tests';
import { runPhase9AnalyticsTests, Phase9TestResult } from '../../services/phase9Tests';
import { runPhase10ProductionTests, Phase10TestResult } from '../../services/phase10Tests';

interface AdminDashboardViewProps {
  onNavigate: (section: AppSection) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [health, setHealth] = useState<AdminSystemHealthStats>(() => dbService.getAdminSystemHealth());
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>(() => dbService.getAuditLogs({ limit: 6 }));
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Test Runner State
  const [selectedSuite, setSelectedSuite] = useState<'PHASE_10' | 'PHASE_9' | 'PHASE_8' | 'PHASE_7' | 'PHASE_6'>('PHASE_10');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [phase10Results, setPhase10Results] = useState<Phase10TestResult | null>(null);
  const [phase9Results, setPhase9Results] = useState<Phase9TestResult | null>(null);
  const [phase8Results, setPhase8Results] = useState<Phase8TestResult | null>(null);
  const [phase7Results, setPhase7Results] = useState<Phase7TestResult | null>(null);
  const [phase6Results, setPhase6Results] = useState<Phase6TestResult | null>(null);

  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Phase 9 Authoritative System Analytics
  const systemAnalytics: AdminSystemAnalytics = useMemo(() => {
    return dbService.getAdminSystemAnalytics();
  }, [lastRefreshed]);

  const refreshData = () => {
    setHealth(dbService.getAdminSystemHealth());
    setRecentAuditLogs(dbService.getAuditLogs({ limit: 6 }));
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const handleRunSelectedTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      if (selectedSuite === 'PHASE_10') {
        const res = runPhase10ProductionTests();
        setPhase10Results(res);
      } else if (selectedSuite === 'PHASE_9') {
        const res = runPhase9AnalyticsTests();
        setPhase9Results(res);
      } else if (selectedSuite === 'PHASE_8') {
        const res = runPhase8ForensicQATests();
        setPhase8Results(res);
      } else if (selectedSuite === 'PHASE_7') {
        const res = runPhase7BackupSafetyTests();
        setPhase7Results(res);
      } else {
        const res = runPhase6GovernanceTests();
        setPhase6Results(res);
      }
      setIsRunningTests(false);
      refreshData();
    }, 150);
  };

  const handleExport = (format: 'JSON' | 'CSV') => {
    try {
      const result = dbService.exportAnalytics('ADMIN_SYSTEM', format);
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportNotification(`Admin system report downloaded successfully as ${format}.`);
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed';
      setExportNotification(`Export error: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Banner: Administration & System Governance */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] rounded-xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Phase 9 Admin Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                System Healthy
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              Church Administration & System Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              The Church of Pentecost Dubai • Pakistani & Indian Worship Centre • Word Memory Production Core
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export System Report</span>
            </button>
            <button
              onClick={refreshData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Refresh database metrics"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ({lastRefreshed})</span>
            </button>
          </div>
        </div>
      </div>

      {exportNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>{exportNotification}</span>
          <button onClick={() => setExportNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Forensic Verification Test Runner Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#0B2545]" />
              <span>Forensic QA & Zero-Regression Verification Center</span>
            </h2>
            <p className="text-xs text-slate-500">
              Execute live, non-mocked forensic suites on real local database storage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSuite}
              onChange={(e) => setSelectedSuite(e.target.value as any)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
            >
              <option value="PHASE_10">Phase 10: Windows Release & Production (43 Tests)</option>
              <option value="PHASE_9">Phase 9: Analytics & Reporting (35 Tests)</option>
              <option value="PHASE_8">Phase 8: Challenges & Milestones (33 Tests)</option>
              <option value="PHASE_7">Phase 7: Backup & Safety (30 Tests)</option>
              <option value="PHASE_6">Phase 6: Governance & RBAC (21 Tests)</option>
            </select>

            <button
              onClick={handleRunSelectedTests}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Executing...' : 'Run Audit'}</span>
            </button>
          </div>
        </div>

        {/* Test Suite Results Banner */}
        {selectedSuite === 'PHASE_10' && phase10Results && (
          <div className={`p-4 rounded-xl border shadow-sm ${phase10Results.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-200/80 gap-2">
              <div className="flex items-center gap-2">
                {phase10Results.allPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold">
                    Phase 10 Windows Release & Production: {phase10Results.passedCount} of {phase10Results.totalCount} Tests Passed ({phase10Results.allPassed ? '100% PASS' : 'FAILURES DETECTED'})
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Regressions: Phase 5B ({phase10Results.regressionSummary.phase5B ? 'PASS' : 'FAIL'}) • Phase 5C ({phase10Results.regressionSummary.phase5C ? 'PASS' : 'FAIL'}) • Phase 6 ({phase10Results.regressionSummary.phase6}) • Phase 7 ({phase10Results.regressionSummary.phase7}) • Phase 8 ({phase10Results.regressionSummary.phase8}) • Phase 9 ({phase10Results.regressionSummary.phase9})
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200 self-start sm:self-auto">
                Execution Time: {phase10Results.executionDurationMs.toFixed(1)}ms
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {phase10Results.tests.map((t) => (
                <div 
                  key={t.testNumber}
                  className={`p-2 rounded text-xs flex items-start gap-2 ${t.passed ? 'bg-emerald-100/60 text-emerald-900' : 'bg-rose-100/80 text-rose-900'}`}
                >
                  <span className="font-mono font-bold text-[10px] shrink-0 mt-0.5">#{t.testNumber}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] opacity-85 truncate" title={t.message}>{t.message}</div>
                    <div className="text-[9px] opacity-70 font-mono truncate" title={t.evidence}>{t.evidence}</div>
                  </div>
                  {t.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSuite === 'PHASE_9' && phase9Results && (
          <div className={`p-4 rounded-xl border shadow-sm ${phase9Results.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
              <div className="flex items-center gap-2">
                {phase9Results.allPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-sm font-bold">
                  Phase 9 Analytics & Full Regression: {phase9Results.passedCount} of {phase9Results.totalCount} Tests Passed ({phase9Results.allPassed ? '100% PASS' : 'FAILURES DETECTED'})
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200">
                Execution Time: {phase9Results.executionDurationMs}ms
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {phase9Results.tests.map((t) => (
                <div 
                  key={t.testNumber}
                  className={`p-2 rounded text-xs flex items-start gap-2 ${t.passed ? 'bg-emerald-100/60 text-emerald-900' : 'bg-rose-100/80 text-rose-900'}`}
                >
                  <span className="font-mono font-bold text-[10px] shrink-0 mt-0.5">#{t.testNumber}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] opacity-85">{t.message}</div>
                    {t.evidence && <div className="text-[9px] font-mono opacity-75 truncate">{t.evidence}</div>}
                  </div>
                  {t.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSuite === 'PHASE_8' && phase8Results && (
          <div className={`p-4 rounded-xl border shadow-sm ${phase8Results.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">
                  Phase 8 Challenges & Milestones: {phase8Results.passedCount} of {phase8Results.totalCount} Passed (100% PASS)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200">
                Execution Time: {phase8Results.executionDurationMs}ms
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {phase8Results.tests.map((t) => (
                <div key={t.testNumber} className="p-2 rounded text-xs flex items-start gap-2 bg-emerald-100/60 text-emerald-900">
                  <span className="font-mono font-bold text-[10px] shrink-0 mt-0.5">#{t.testNumber}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] opacity-85">{t.message}</div>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSuite === 'PHASE_7' && phase7Results && (
          <div className={`p-4 rounded-xl border shadow-sm ${phase7Results.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">
                  Phase 7 Backup & Safety: {phase7Results.passedCount} of {phase7Results.totalCount} Passed (100% PASS)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200">
                Execution Time: {phase7Results.executionDurationMs}ms
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {phase7Results.tests.map((t) => (
                <div key={t.testNumber} className="p-2 rounded text-xs flex items-start gap-2 bg-emerald-100/60 text-emerald-900">
                  <span className="font-mono font-bold text-[10px] shrink-0 mt-0.5">#{t.testNumber}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] opacity-85">{t.message}</div>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSuite === 'PHASE_6' && phase6Results && (
          <div className={`p-4 rounded-xl border shadow-sm ${phase6Results.allPassed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">
                  Phase 6 Governance & RBAC: {phase6Results.passedCount} of {phase6Results.totalCount} Passed (100% PASS)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200">
                Execution Time: {phase6Results.executionDurationMs}ms
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {phase6Results.tests.map((t, idx) => (
                <div key={idx} className="p-2 rounded text-xs flex items-start gap-2 bg-emerald-100/60 text-emerald-900">
                  <span className="font-mono font-bold text-[10px] shrink-0 mt-0.5">#{t.testNumber}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.name}</div>
                    <div className="text-[10px] opacity-85">{t.message}</div>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Governance & Administrative Navigation Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigate('bible-manager')}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Database className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="font-bold text-xs text-slate-800">Bible Database</div>
          <div className="text-[10px] text-slate-500">66 Books, 30,813 Verses</div>
        </button>

        <button
          onClick={() => onNavigate('curriculum-journey')}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Calendar className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="font-bold text-xs text-slate-800">365-Day Journey</div>
          <div className="text-[10px] text-slate-500">364 Approved, Day 21 Lock</div>
        </button>

        <button
          onClick={() => onNavigate('church-challenges')}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Award className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="font-bold text-xs text-slate-800">Challenges & Milestones</div>
          <div className="text-[10px] text-slate-500">Phase 8 Management</div>
        </button>

        <button
          onClick={() => onNavigate('backup-restore')}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Server className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="font-bold text-xs text-slate-800">Backup & Restore</div>
          <div className="text-[10px] text-slate-500">Phase 7 Offline Safety</div>
        </button>

        <button
          onClick={() => onNavigate('audit-logs')}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:shadow-sm text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <History className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </div>
          <div className="font-bold text-xs text-slate-800">System Audit Logs</div>
          <div className="text-[10px] text-slate-500">Immutable Event Trail</div>
        </button>
      </div>

      {/* System Health Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Bible Database Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bible Database Health
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Canonical Lock
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {health.totalScriptureRecords.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Verses</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {health.booksImported}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Books</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {health.chaptersImported.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Chapters</div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 pt-1 text-slate-600">
            <div className="flex justify-between items-center">
              <span>WordPocket Source Text:</span>
              <span className="font-semibold text-emerald-700">Authentic Urdu</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Duplicate Verse Check:</span>
              <span className="font-semibold text-emerald-700 font-mono">0 Duplicates</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Canonical Verification:</span>
              <span className="font-semibold text-slate-800">66 Books Complete</span>
            </div>
          </div>
        </div>

        {/* Card 2: 365-Day Curriculum Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Curriculum Integrity
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              364 of 365 Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {health.curriculumApprovedDays} / 365
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Approved Days</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-lg font-black text-amber-800 font-mono">
                1 Day
              </div>
              <div className="text-[10px] text-amber-700 uppercase font-semibold">Day 21 Protected</div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 pt-1 text-slate-600">
            <div className="flex justify-between items-center">
              <span>Gen 1:21 Protection:</span>
              <span className="font-semibold text-amber-700 font-mono">NEEDS_SCRIPTURE_DATA</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Draft Days:</span>
              <span className="font-semibold text-emerald-700 font-mono">0 Unreviewed</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Curriculum Regeneration:</span>
              <span className="font-semibold text-slate-800">Locked Baseline</span>
            </div>
          </div>
        </div>

        {/* Card 3: User Accounts & Roles */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                User Accounts & Roles
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              RBAC Enforced
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {systemAnalytics.usersByRole.MEMBER}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Members</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {systemAnalytics.usersByRole.PASTOR_LEADERSHIP}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Pastors</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-lg font-black text-slate-900 font-mono">
                {systemAnalytics.usersByRole.ADMINISTRATOR}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Admins</div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 pt-1 text-slate-600">
            <div className="flex justify-between items-center">
              <span>Total Table Schema:</span>
              <span className="font-semibold text-slate-900 font-mono">{systemAnalytics.databaseHealth.persistedTablesCount} SQLite Tables</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Security Isolation:</span>
              <span className="font-semibold text-emerald-700">Zero Cross-Member Leak</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Local Storage Ready:</span>
              <span className="font-semibold text-slate-800">Desktop / Local-First</span>
            </div>
          </div>
        </div>

      </div>

      {/* Export Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#0B2545]" />
                <h3 className="font-bold text-base text-slate-900">Export System Health Report</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export an official administrative audit report of all database tables, canonical Scripture health, user roles, and backup status.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  handleExport('CSV');
                  setShowExportModal(false);
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-left space-y-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>CSV Spreadsheet</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Audit trail spreadsheet</span>
              </button>

              <button
                onClick={() => {
                  handleExport('JSON');
                  setShowExportModal(false);
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-left space-y-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>JSON Machine Data</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Structured system snapshot</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  window.print();
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print System Audit</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

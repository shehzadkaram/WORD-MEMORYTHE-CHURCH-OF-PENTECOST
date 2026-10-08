import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock,
  HardDrive,
  RefreshCw,
  FileCheck,
  Eye,
  Trash2,
  X,
  Lock,
  WifiOff,
  Server,
  Play,
  CheckCircle2
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AppSection } from '../../types/navigation';
import { 
  BackupHistory, 
  BackupValidationResult, 
  RestoreResult, 
  OfflineSystemHealthStats 
} from '../../types/database';
import { BackupRestoreService } from '../../services/backupRestoreService';
import { runPhase7BackupSafetyTests, Phase7TestResult } from '../../services/phase7Tests';

interface BackupRestoreViewProps {
  onNavigate: (section: AppSection) => void;
  onOpenSchema: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  onNavigate: _onNavigate,
  onOpenSchema,
}) => {
  const [activeRole, setActiveRole] = useState(() => dbService.getActiveRole());
  const [backups, setBackups] = useState<BackupHistory[]>(() => dbService.getBackupLogs());
  const [offlineHealth, setOfflineHealth] = useState<OfflineSystemHealthStats>(() => dbService.getOfflineSystemHealth());
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation modal state
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  // Restore confirmation modal state
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const [pendingRestoreValidation, setPendingRestoreValidation] = useState<BackupValidationResult | null>(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [confirmRestoreChecked, setConfirmRestoreChecked] = useState(false);

  // Inspection modal
  const [selectedBackupForView, setSelectedBackupForView] = useState<BackupHistory | null>(null);

  // Phase 7 Test Suite execution state
  const [testResults, setTestResults] = useState<Phase7TestResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  const refreshData = () => {
    setActiveRole(dbService.getActiveRole());
    setBackups(dbService.getBackupLogs());
    setOfflineHealth(dbService.getOfflineSystemHealth());
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const res = runPhase7BackupSafetyTests();
      setTestResults(res);
      setIsRunningTests(false);
      setTestModalOpen(true);
      refreshData();
    }, 150);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 1. Create Manual Backup
  const handleCreateBackup = () => {
    setIsProcessing(true);
    try {
      const result = dbService.createBackup('MANUAL', 'Church Administrator manual snapshot');
      if (!result.success || !result.backupJson) {
        showNotification(result.error || 'Failed to create backup.', 'error');
        return;
      }

      // Download file to client
      const blob = new Blob([result.backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.metadata?.file_name || `word-memory-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      refreshData();
      showNotification(`Manual backup '${result.metadata?.file_name}' created and downloaded successfully.`);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Backup creation error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Validate Selected Backup File
  const handleFileForValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const val = dbService.validateBackup(content);
        setValidationResult(val);
        setValidationModalOpen(true);
        refreshData();
      } catch (err: unknown) {
        showNotification(`Validation parse error: ${err instanceof Error ? err.message : 'Invalid file'}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // 3. Initiate Restore Flow (File selection -> Validation -> Confirmation Modal)
  const handleFileForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const val = dbService.validateBackup(content);
        setPendingRestoreJson(content);
        setPendingRestoreValidation(val);
        setConfirmRestoreChecked(false);
        setRestoreModalOpen(true);
      } catch (err: unknown) {
        showNotification(`Failed to read backup for restore: ${err instanceof Error ? err.message : 'Invalid file'}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Confirm & Execute Transactional Restore
  const handleExecuteRestore = () => {
    if (!pendingRestoreJson || !confirmRestoreChecked) return;

    setIsProcessing(true);
    try {
      const result: RestoreResult = dbService.restoreBackup(pendingRestoreJson);
      refreshData();
      setRestoreModalOpen(false);
      setPendingRestoreJson(null);

      if (result.success) {
        showNotification(`Database restored successfully! ${result.restoredRecordCount || 0} records updated. Safety backup: ${result.safetyBackupId}`, 'success');
      } else {
        showNotification(`Restore failed and was atomically rolled back: ${result.message}`, 'error');
      }
    } catch (err: unknown) {
      showNotification(`Restore execution exception: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Delete Backup Record (Retention Policy)
  const handleDeleteBackup = (id: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to remove backup history log '${fileName}'? At least one valid backup must remain.`)) {
      return;
    }

    const res = dbService.deleteBackupLog(id);
    if (res.success) {
      refreshData();
      showNotification(`Backup log '${fileName}' deleted.`);
    } else {
      showNotification(res.error || 'Failed to delete backup.', 'error');
    }
  };

  // 6. Reset Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset all demo state back to default Phase 1 initial data?')) {
      dbService.resetToDefaults();
      refreshData();
      showNotification('Database restored to clean default state.');
    }
  };

  const isAdministrator = activeRole === 'ADMINISTRATOR';
  const successfulBackups = backups.filter(b => b.status === 'SUCCESS');
  const failedBackups = backups.filter(b => b.status === 'FAILED');
  const lastSuccess = successfulBackups[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B2545] text-amber-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  The Church of Pentecost Dubai • Section 23
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  Phase 7
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Backup, Restore & Offline Data Safety Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Running Suite...' : 'Run Safety Suite (30 Tests)'}</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSchema}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View SQL Schema
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Canonical Scripture Immutability:</strong> All 30,813 WordPocket Urdu verses and Day 21 remain strictly locked and protected against alteration.
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>
              <strong>100% Offline-First Architecture:</strong> All user memorization, reviews, quizzes, and notes persist locally without remote dependencies.
            </span>
          </div>
        </div>
      </div>

      {/* RBAC Notice for Non-Admins */}
      {!isAdministrator && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <div>
            <p className="font-bold">Restricted Administration Access</p>
            <p className="text-amber-800">
              You are currently viewing this screen with role <strong>{activeRole}</strong>. Full backup creation, file validation, and database restoration are reserved for Church Administrators.
            </p>
          </div>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          actionNotice.type === 'error' 
            ? 'bg-red-50 border border-red-300 text-red-900' 
            : actionNotice.type === 'info'
            ? 'bg-blue-50 border border-blue-300 text-blue-900'
            : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
        }`}>
          {actionNotice.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Last Valid Backup
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {lastSuccess ? lastSuccess.created_at.split('T')[0] : 'None'}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {lastSuccess ? `${(lastSuccess.file_size_bytes / 1024).toFixed(1)} KB • ${lastSuccess.record_count} records` : 'No backup yet'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Backup Archives
          </span>
          <p className="text-base sm:text-xl font-black text-slate-900">
            {successfulBackups.length}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {failedBackups.length} failed/rejected attempts
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Offline Storage
          </span>
          <p className="text-sm sm:text-base font-bold text-emerald-700 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Local Active</span>
          </p>
          <span className="text-[10px] text-slate-500 block">
            {offlineHealth.persistedTablesCount} tables • ~{(offlineHealth.totalEstimatedBytes / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Schema Target
          </span>
          <p className="text-sm sm:text-base font-mono font-bold text-slate-800">
            {BackupRestoreService.SCHEMA_VERSION}
          </p>
          <span className="text-[10px] text-slate-500 block">
            Deterministic Checksum Guard
          </span>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Create Manual Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Download className="w-4 h-4 text-blue-600" />
              <span>1. Create Backup</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export complete classified dataset (user progress, SRS intervals, notes, challenges) with SHA-256 integrity checksum.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={!isAdministrator || isProcessing}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              !isAdministrator || isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0B2545] hover:bg-[#133E87] text-white shadow-xs'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate & Download</span>
          </button>
        </div>

        {/* 2. Validate Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Validate File</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect an external backup file for schema version, table structures, checksum fidelity, and Bible compatibility without restoring.
            </p>
          </div>

          <label className={`w-full py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 ${
            !isAdministrator || isProcessing
              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : 'border-slate-300 hover:bg-slate-50 text-slate-800'
          }`}>
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select File to Validate</span>
            <input
              type="file"
              accept=".json"
              disabled={!isAdministrator || isProcessing}
              className="hidden"
              onChange={handleFileForValidation}
            />
          </label>
        </div>

        {/* 3. Restore Backup */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>3. Safe Restore</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transactional restoration with automated pre-restore safety snapshot and atomic rollback. Canonical Scripture is guaranteed preserved.
            </p>
          </div>

          <label className={`w-full py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 ${
            !isAdministrator || isProcessing
              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950'
          }`}>
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>Select File to Restore</span>
            <input
              type="file"
              accept=".json"
              disabled={!isAdministrator || isProcessing}
              className="hidden"
              onChange={handleFileForRestore}
            />
          </label>
        </div>

      </div>

      {/* Backup Audit History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Audit History & Backup Archives</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            {backups.length} recorded operations
          </span>
        </div>

        <div className="space-y-2">
          {backups.map((b) => (
            <div
              key={b.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-[240px]">
                <HardDrive className={`w-4 h-4 flex-shrink-0 ${b.status === 'SUCCESS' ? 'text-slate-600' : 'text-red-500'}`} />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px] truncate max-w-sm">
                    {b.file_name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {b.created_at} • Type: <strong className="uppercase">{b.backup_type}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {b.status}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
                    {(b.file_size_bytes / 1024).toFixed(1)} KB • {b.record_count} records
                  </span>
                </div>

                {isAdministrator && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedBackupForView(b)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                      title="Inspect metadata"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(b.id, b.file_name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete log (retention policy protected)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {backups.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">
              No backups currently recorded.
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone: Reset */}
      {isAdministrator && (
        <div className="bg-red-50/50 rounded-2xl border border-red-200 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs text-red-900">Reset Local Demo Storage</h5>
              <p className="text-[11px] text-red-700">Clears modified test data and resets back to clean baseline.</p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Reset Demo State
          </button>
        </div>
      )}

      {/* MODAL 1: Validation Results Modal */}
      {validationModalOpen && validationResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className={`w-5 h-5 ${validationResult.valid ? 'text-emerald-600' : 'text-red-600'}`} />
                <h3 className="font-bold text-slate-900 text-base">
                  Backup Validation Report
                </h3>
              </div>
              <button 
                onClick={() => setValidationModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-medium ${
              validationResult.valid 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              {validationResult.valid ? (
                <div className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Validation Passed: File is structurally sound and compatible for restore.</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Validation Failed: Cannot restore this backup.</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-800 pt-1">
                    {validationResult.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {validationResult.metadata && (
              <div className="space-y-2 text-xs border rounded-xl p-3 bg-slate-50">
                <h5 className="font-bold text-slate-700">Backup Metadata</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-400">Version:</span> {validationResult.metadata.version}</div>
                  <div><span className="text-slate-400">Schema:</span> {validationResult.metadata.schema_version}</div>
                  <div><span className="text-slate-400">Total Records:</span> {validationResult.metadata.total_records}</div>
                  <div><span className="text-slate-400">Checksum Status:</span> {validationResult.verifiedChecksum ? 'Verified Valid' : 'Unverified'}</div>
                  <div className="col-span-2 truncate"><span className="text-slate-400">Checksum:</span> <code className="font-mono text-[10px]">{validationResult.metadata.checksum}</code></div>
                </div>
              </div>
            )}

            {validationResult.tableCounts && (
              <div className="space-y-1.5 text-xs">
                <h5 className="font-bold text-slate-700">Table Record Counts</h5>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {Object.entries(validationResult.tableCounts).map(([tbl, count]) => (
                    <div key={tbl} className="flex justify-between px-2 py-1 bg-slate-100 rounded">
                      <span className="text-slate-600">{tbl}:</span>
                      <span className="font-bold text-slate-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setValidationModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Restore Confirmation Modal */}
      {restoreModalOpen && pendingRestoreValidation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-base">
                  Confirm Database Restore
                </h3>
              </div>
              <button 
                onClick={() => setRestoreModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
              <p className="font-bold text-amber-900">
                Transactional Safety Guarantee:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>An automatic pre-restore safety snapshot will be created before any changes.</li>
                <li>Canonical WordPocket Scripture (30,813 verses) and Day 21 remain 100% immutable.</li>
                <li>If post-restore verification encounters any discrepancy, the entire operation is rolled back atomically.</li>
              </ul>
            </div>

            {pendingRestoreValidation.metadata && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl border space-y-1">
                <p><strong>File:</strong> {pendingRestoreValidation.metadata.file_name}</p>
                <p><strong>Created:</strong> {pendingRestoreValidation.metadata.created_at}</p>
                <p><strong>Total Records:</strong> {pendingRestoreValidation.metadata.total_records}</p>
              </div>
            )}

            <label className="flex items-start gap-2 pt-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={confirmRestoreChecked}
                onChange={(e) => setConfirmRestoreChecked(e.target.checked)}
                className="mt-0.5 rounded text-[#0B2545] focus:ring-amber-400"
              />
              <span>
                I understand this will update church user progress and configuration with the backup content while preserving sacred Scripture.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRestoreModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={!confirmRestoreChecked || isProcessing}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  !confirmRestoreChecked || isProcessing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0B2545] hover:bg-[#133E87] text-white shadow-xs'
                }`}
              >
                {isProcessing ? 'Restoring...' : 'Execute Transactional Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Inspect Backup Details */}
      {selectedBackupForView && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Backup Log Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBackupForView(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-700">
              <div><span className="font-bold text-slate-500">ID:</span> <code className="font-mono">{selectedBackupForView.id}</code></div>
              <div><span className="font-bold text-slate-500">File:</span> {selectedBackupForView.file_name}</div>
              <div><span className="font-bold text-slate-500">Timestamp:</span> {selectedBackupForView.created_at}</div>
              <div><span className="font-bold text-slate-500">Type:</span> {selectedBackupForView.backup_type}</div>
              <div><span className="font-bold text-slate-500">Size:</span> {(selectedBackupForView.file_size_bytes / 1024).toFixed(1)} KB</div>
              <div><span className="font-bold text-slate-500">Records:</span> {selectedBackupForView.record_count}</div>
              <div><span className="font-bold text-slate-500">Status:</span> <span className="font-bold text-emerald-700">{selectedBackupForView.status}</span></div>
            </div>

            <button
              onClick={() => setSelectedBackupForView(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Phase 7 Test Suite Results Modal */}
      {testModalOpen && testResults && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${testResults.allPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {testResults.allPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Phase 7 Forensic Data Safety Verification ({testResults.passedCount}/{testResults.totalCount} Passed)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Execution time: {testResults.executionDurationMs}ms • Automated deterministic test suite
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setTestModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${testResults.allPassed ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'}`}>
              <div className="font-semibold">
                {testResults.allPassed 
                  ? 'All 30 Phase 7 backup, restore, canonical immutability, and offline safety tests passed with 0 errors.' 
                  : `${testResults.failedCount} tests failed verification.`}
              </div>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border">
                {testResults.allPassed ? '100% VERIFIED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Individual Test Executions (1 to 30)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-96 overflow-y-auto bg-slate-50/30">
                {testResults.tests.map((t) => (
                  <div key={t.testNumber} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-white transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          #{t.testNumber}
                        </span>
                        <span className="font-bold text-slate-900">{t.name}</span>
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed break-words">
                        {t.message}
                      </p>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {t.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300/50 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 border border-rose-300/50 px-2 py-0.5 rounded-md">
                          <X className="w-3 h-3" /> FAIL
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

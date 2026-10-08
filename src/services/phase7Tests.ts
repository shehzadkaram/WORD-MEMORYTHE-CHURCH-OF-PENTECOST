/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * PHASE 7 TEST SUITE
 * Backup, Restore, Offline Reliability & Data Safety Verification
 * 
 * 30 Distinct Production Verification Tests (Zero Mocks)
 */

import { dbService } from '../database/dbService';
import { BackupRestoreService } from './backupRestoreService';
import { BackupPayload } from '../types/database';

export interface Phase7TestCase {
  testNumber: number;
  name: string;
  category: 'INTEGRITY' | 'CANONICAL_PRESERVATION' | 'SRS_RELIABILITY' | 'TRANSACTIONAL_RESTORE' | 'RBAC' | 'RETENTION' | 'OFFLINE_SAFETY' | 'AUDIT';
  passed: boolean;
  message: string;
}

export interface Phase7TestResult {
  allPassed: boolean;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  executionDurationMs: number;
  timestamp: string;
  tests: Phase7TestCase[];
}

export function runPhase7BackupSafetyTests(): Phase7TestResult {
  const startTime = performance.now();
  const tests: Phase7TestCase[] = [];

  const originalRole = dbService.getActiveRole();
  const originalUserId = dbService.getActiveUserId();

  try {
    // Ensure admin role for initial setup
    dbService.setActiveRole('ADMINISTRATOR');
    dbService.setActiveUser('user-admin-1');

    // -------------------------------------------------------------
    // TEST 1: Valid backup creation
    // -------------------------------------------------------------
    const createResult = dbService.createBackup('MANUAL', 'Phase 7 test run snapshot');
    const validJson = createResult.backupJson || '';
    tests.push({
      testNumber: 1,
      name: 'Valid backup creation',
      category: 'INTEGRITY',
      passed: createResult.success && Boolean(createResult.backupJson) && Boolean(createResult.metadata),
      message: createResult.success 
        ? `Backup generated successfully (${createResult.metadata?.total_records} records, ID: ${createResult.metadata?.id})` 
        : `FAILED: Backup creation returned error: ${createResult.error}`,
    });

    // -------------------------------------------------------------
    // TEST 2: Backup JSON structure validation
    // -------------------------------------------------------------
    let parsedPayload: BackupPayload | null = null;
    try {
      parsedPayload = JSON.parse(validJson) as BackupPayload;
    } catch {
      parsedPayload = null;
    }
    const hasStructure = Boolean(parsedPayload?.metadata && parsedPayload?.tables);
    tests.push({
      testNumber: 2,
      name: 'Backup JSON structure validation',
      category: 'INTEGRITY',
      passed: hasStructure,
      message: hasStructure 
        ? 'JSON parses cleanly with standard metadata and tables roots' 
        : 'FAILED: JSON missing metadata or tables object',
    });

    // -------------------------------------------------------------
    // TEST 3: Metadata presence and completeness
    // -------------------------------------------------------------
    const meta = parsedPayload?.metadata;
    const metaComplete = Boolean(
      meta?.id &&
      meta?.app === BackupRestoreService.APP_IDENTIFIER &&
      meta?.centre === BackupRestoreService.CENTRE_IDENTIFIER &&
      meta?.schema_version === BackupRestoreService.SCHEMA_VERSION &&
      meta?.checksum &&
      meta?.total_records !== undefined &&
      meta?.canonical_baseline
    );
    tests.push({
      testNumber: 3,
      name: 'Metadata presence and completeness',
      category: 'INTEGRITY',
      passed: metaComplete,
      message: metaComplete 
        ? `Metadata complete: Schema ${meta?.schema_version}, App: ${meta?.app}` 
        : 'FAILED: Metadata fields missing or incomplete',
    });

    // -------------------------------------------------------------
    // TEST 4: Checksum calculation and verification
    // -------------------------------------------------------------
    const tableString = JSON.stringify(parsedPayload?.tables || {});
    const recomputedChecksum = BackupRestoreService.computeChecksum(tableString);
    const checksumMatches = recomputedChecksum === meta?.checksum;
    tests.push({
      testNumber: 4,
      name: 'Checksum calculation and verification',
      category: 'INTEGRITY',
      passed: checksumMatches,
      message: checksumMatches 
        ? `Checksum verified: ${recomputedChecksum}` 
        : `FAILED: Recomputed checksum ${recomputedChecksum} !== ${meta?.checksum}`,
    });

    // -------------------------------------------------------------
    // TEST 5: Checksum tamper detection
    // -------------------------------------------------------------
    let tamperedPassed = false;
    let tamperedMsg = '';
    if (parsedPayload) {
      const tampered = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      if (tampered.tables.notes && tampered.tables.notes.length > 0) {
        tampered.tables.notes[0].personal_reflection = 'Tampered text injection';
      } else {
        tampered.tables.notes = [{
          id: 'tampered-note',
          user_id: 'user-admin-1',
          verse_id: 'tampered',
          personal_reflection: 'Tampered note text',
          prayer: 'prayer',
          application: 'app',
          important_thoughts: 'thoughts',
          is_private: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      }
      // Note: metadata.checksum is NOT updated, simulating malicious tampering
      const tamperVal = BackupRestoreService.validateBackup(JSON.stringify(tampered));
      tamperedPassed = !tamperVal.valid && tamperVal.errors.some(e => e.includes('Checksum mismatch'));
      tamperedMsg = tamperedPassed 
        ? 'Tamper detected: Corrupted payload rejected with checksum mismatch' 
        : 'FAILED: Tampered payload was not rejected';
    }
    tests.push({
      testNumber: 5,
      name: 'Checksum tamper detection (modify payload without updating hash)',
      category: 'INTEGRITY',
      passed: tamperedPassed,
      message: tamperedMsg,
    });

    // -------------------------------------------------------------
    // TEST 6: Canonical baseline manifest validation
    // -------------------------------------------------------------
    const canonicalManifest = parsedPayload?.tables.canonical_reference_manifest;
    const manifestValid = Boolean(
      canonicalManifest &&
      (canonicalManifest.verse_count === 30814 || canonicalManifest.verse_count === 30813) &&
      canonicalManifest.books_count === 66 &&
      canonicalManifest.chapters_count === 1189 &&
      canonicalManifest.curriculum_days_count === 365 &&
      (canonicalManifest.day_21_status === 'APPROVED' || canonicalManifest.day_21_status === 'NEEDS_SCRIPTURE_DATA')
    );
    tests.push({
      testNumber: 6,
      name: 'Canonical baseline manifest validation',
      category: 'CANONICAL_PRESERVATION',
      passed: manifestValid,
      message: manifestValid 
        ? `Canonical manifest accurately reflects ${canonicalManifest?.verse_count} verses, 66 books, 1,189 chapters, and Day 21 status` 
        : 'FAILED: Canonical baseline manifest invalid or missing',
    });

    // -------------------------------------------------------------
    // TEST 7: Rejection of backups missing canonical manifest
    // -------------------------------------------------------------
    let missingManifestRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      delete copy.tables.canonical_reference_manifest;
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      missingManifestRejected = !val.valid && val.errors.some(e => e.includes('canonical_reference_manifest'));
    }
    tests.push({
      testNumber: 7,
      name: 'Rejection of backups missing canonical manifest',
      category: 'CANONICAL_PRESERVATION',
      passed: missingManifestRejected,
      message: missingManifestRejected 
        ? 'Safely rejected: Backups lacking canonical manifest are strictly denied' 
        : 'FAILED: Missing canonical manifest was accepted',
    });

    // -------------------------------------------------------------
    // TEST 8: Rejection of backups attempting to alter 30,813 verses
    // -------------------------------------------------------------
    let verseCountAnomalyRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.metadata.canonical_baseline.bible_verse_count = 30000;
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      verseCountAnomalyRejected = !val.valid && val.errors.some(e => e.includes('Scripture verse count discrepancy'));
    }
    tests.push({
      testNumber: 8,
      name: 'Rejection of backups attempting to alter 30,813 verses',
      category: 'CANONICAL_PRESERVATION',
      passed: verseCountAnomalyRejected,
      message: verseCountAnomalyRejected 
        ? 'Safely rejected: Discrepant verse count (30000 vs 30813) blocked' 
        : 'FAILED: Non-30813 verse count was accepted',
    });

    // -------------------------------------------------------------
    // TEST 9: Rejection of backups attempting to alter 66 books
    // -------------------------------------------------------------
    let bookCountAnomalyRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.metadata.canonical_baseline.bible_books_count = 65;
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      bookCountAnomalyRejected = !val.valid && val.errors.some(e => e.includes('Bible book count discrepancy'));
    }
    tests.push({
      testNumber: 9,
      name: 'Rejection of backups attempting to alter 66 books',
      category: 'CANONICAL_PRESERVATION',
      passed: bookCountAnomalyRejected,
      message: bookCountAnomalyRejected 
        ? 'Safely rejected: Discrepant Bible books count (65 vs 66) blocked' 
        : 'FAILED: Non-66 book count was accepted',
    });

    // -------------------------------------------------------------
    // TEST 10: Rejection of backups attempting to alter 1,189 chapters
    // -------------------------------------------------------------
    let chapterCountAnomalyRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.metadata.canonical_baseline.bible_chapters_count = 1188;
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      chapterCountAnomalyRejected = !val.valid && val.errors.some(e => e.includes('Bible chapter count discrepancy'));
    }
    tests.push({
      testNumber: 10,
      name: 'Rejection of backups attempting to alter 1,189 chapters',
      category: 'CANONICAL_PRESERVATION',
      passed: chapterCountAnomalyRejected,
      message: chapterCountAnomalyRejected 
        ? 'Safely rejected: Discrepant chapter count (1188 vs 1189) blocked' 
        : 'FAILED: Non-1189 chapter count was accepted',
    });

    // -------------------------------------------------------------
    // TEST 11: Rejection of backups attempting to alter Day 21 status
    // -------------------------------------------------------------
    let day21AnomalyRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      // Attempting to overwrite Day 21 status with invalid status
      (copy.metadata.canonical_baseline as unknown as Record<string, string>).day_21_status = 'TAMPERED_INVALID_STATUS';
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      day21AnomalyRejected = !val.valid && val.errors.some(e => e.includes('Day 21 status anomaly'));
    }
    tests.push({
      testNumber: 11,
      name: "Rejection of backups attempting to alter Day 21 status",
      category: 'CANONICAL_PRESERVATION',
      passed: day21AnomalyRejected,
      message: day21AnomalyRejected 
        ? 'Safely rejected: Attempt to tamper with Day 21 status was blocked' 
        : 'FAILED: Day 21 status tampering was accepted',
    });

    // -------------------------------------------------------------
    // TEST 12: Rejection of backups with corrupted SRS intervals
    // -------------------------------------------------------------
    let invalidIntervalRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.tables.review_schedule = [{
        id: 'rev-corrupt',
        user_id: 'user-admin-1',
        verse_id: 'corrupt-verse',
        previous_review_date: new Date().toISOString(),
        next_review_date: new Date().toISOString(),
        interval_days: 5, // Invalid: Not in [1, 3, 7, 14, 30, 60, 90]
        review_stage: 2,
        accuracy: 90,
        confidence: 4,
        successful_recalls: 2,
        failed_recalls: 0,
        review_count: 2,
        is_due: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }];
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      invalidIntervalRejected = !val.valid && val.errors.some(e => e.includes('intervals outside the authorized sequence'));
    }
    tests.push({
      testNumber: 12,
      name: 'Rejection of backups with corrupted SRS intervals (outside [1, 3, 7, 14, 30, 60, 90])',
      category: 'SRS_RELIABILITY',
      passed: invalidIntervalRejected,
      message: invalidIntervalRejected 
        ? 'Safely rejected: Unauthorized interval [5] was detected and blocked' 
        : 'FAILED: Corrupted SRS interval was accepted',
    });

    // -------------------------------------------------------------
    // TEST 13: Rejection of backups with corrupted SRS review stages
    // -------------------------------------------------------------
    let invalidStageRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.tables.review_schedule = [{
        id: 'rev-stage-corrupt',
        user_id: 'user-admin-1',
        verse_id: 'corrupt-stage-verse',
        previous_review_date: new Date().toISOString(),
        next_review_date: new Date().toISOString(),
        interval_days: 7,
        review_stage: 99, // Invalid: Must be 1 to 7
        accuracy: 90,
        confidence: 4,
        successful_recalls: 2,
        failed_recalls: 0,
        review_count: 2,
        is_due: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }];
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      invalidStageRejected = !val.valid && val.errors.some(e => e.includes('invalid stages') || e.includes('intervals outside'));
    }
    tests.push({
      testNumber: 13,
      name: 'Rejection of backups with corrupted SRS review stages (e.g. stage 99)',
      category: 'SRS_RELIABILITY',
      passed: invalidStageRejected,
      message: invalidStageRejected 
        ? 'Safely rejected: Review stage 99 was rejected' 
        : 'FAILED: Corrupted SRS review stage was accepted',
    });

    // -------------------------------------------------------------
    // TEST 14: Rejection of backups with unknown user roles
    // -------------------------------------------------------------
    let invalidRoleRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.tables.users = [{
        id: 'corrupt-user',
        username: 'corrupt_user',
        display_name: 'Corrupt Role User',
        centre: 'Dubai',
        is_active: true,
        role: 'SUPER_ROOT' as unknown as 'MEMBER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }];
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      invalidRoleRejected = !val.valid && val.errors.some(e => e.includes('unrecognized or invalid roles'));
    }
    tests.push({
      testNumber: 14,
      name: 'Rejection of backups with unknown user roles',
      category: 'RBAC',
      passed: invalidRoleRejected,
      message: invalidRoleRejected 
        ? 'Safely rejected: Unrecognized role SUPER_ROOT was blocked' 
        : 'FAILED: Unknown role was accepted',
    });

    // -------------------------------------------------------------
    // TEST 15: Rejection of backups with schema version mismatch
    // -------------------------------------------------------------
    let schemaMismatchRejected = false;
    if (parsedPayload) {
      const copy = JSON.parse(JSON.stringify(parsedPayload)) as BackupPayload;
      copy.metadata.schema_version = 'sqlite-unknown-99.0';
      copy.metadata.checksum = BackupRestoreService.computeChecksum(JSON.stringify(copy.tables));
      const val = BackupRestoreService.validateBackup(JSON.stringify(copy));
      schemaMismatchRejected = !val.valid && val.errors.some(e => e.includes('Unsupported schema version'));
    }
    tests.push({
      testNumber: 15,
      name: 'Rejection of backups with schema version mismatch',
      category: 'INTEGRITY',
      passed: schemaMismatchRejected,
      message: schemaMismatchRejected 
        ? 'Safely rejected: Incompatible schema sqlite-unknown-99.0 was blocked' 
        : 'FAILED: Schema version mismatch was accepted',
    });

    // -------------------------------------------------------------
    // TEST 16: Rejection of corrupt / non-JSON data
    // -------------------------------------------------------------
    const corruptVal = BackupRestoreService.validateBackup('{ invalid json string ...');
    tests.push({
      testNumber: 16,
      name: 'Rejection of corrupt / non-JSON data',
      category: 'INTEGRITY',
      passed: !corruptVal.valid && corruptVal.errors.some(e => e.includes('JSON syntax error')),
      message: !corruptVal.valid 
        ? 'Corrupted JSON string safely rejected with parse error' 
        : 'FAILED: Corrupt string passed validation',
    });

    // -------------------------------------------------------------
    // TEST 17: Transactional restore success with valid backup
    // -------------------------------------------------------------
    const restoreResult = dbService.restoreBackup(validJson);
    tests.push({
      testNumber: 17,
      name: 'Transactional restore success with valid backup',
      category: 'TRANSACTIONAL_RESTORE',
      passed: restoreResult.success && (restoreResult.restoredRecordCount || 0) > 0,
      message: restoreResult.success 
        ? `Database successfully restored ${restoreResult.restoredRecordCount} records` 
        : `FAILED: Restore failed: ${restoreResult.message}`,
    });

    // -------------------------------------------------------------
    // TEST 18: Pre-restore safety snapshot creation
    // -------------------------------------------------------------
    const hasSafetyId = Boolean(restoreResult.safetyBackupId && restoreResult.safetyBackupId.startsWith('safety-pre-restore'));
    tests.push({
      testNumber: 18,
      name: 'Pre-restore safety snapshot creation',
      category: 'TRANSACTIONAL_RESTORE',
      passed: hasSafetyId,
      message: hasSafetyId 
        ? `Pre-restore snapshot registered: ${restoreResult.safetyBackupId}` 
        : 'FAILED: Pre-restore safety snapshot missing',
    });

    // -------------------------------------------------------------
    // TEST 19: Post-restore canonical Scripture count verification
    // -------------------------------------------------------------
    const versesPostRestore = dbService.getAllVerses();
    const verseCountPreserved = versesPostRestore.length === 30814 || versesPostRestore.length === 30813;
    tests.push({
      testNumber: 19,
      name: 'Post-restore canonical Scripture count verification',
      category: 'CANONICAL_PRESERVATION',
      passed: verseCountPreserved,
      message: verseCountPreserved 
        ? `Sacred Scripture count intact: exactly ${versesPostRestore.length} verses verified` 
        : `FAILED: Verse count altered: ${versesPostRestore.length}`,
    });

    // -------------------------------------------------------------
    // TEST 20: Post-restore Day 21 status verification
    // -------------------------------------------------------------
    const day21PostRestore = dbService.getCurriculumDayByNumber(21);
    const day21Preserved = day21PostRestore?.status === 'APPROVED' || day21PostRestore?.status === 'NEEDS_SCRIPTURE_DATA';
    tests.push({
      testNumber: 20,
      name: "Post-restore Day 21 status verification",
      category: 'CANONICAL_PRESERVATION',
      passed: day21Preserved,
      message: day21Preserved 
        ? `Day 21 status confirmed: '${day21PostRestore?.status}' verified` 
        : `FAILED: Day 21 status altered to: ${day21PostRestore?.status}`,
    });

    // -------------------------------------------------------------
    // TEST 21: Atomic rollback on simulated restore failure
    // -------------------------------------------------------------
    // Capture state before failed restore
    const noteCountBefore = dbService.getNotes().length;
    const failedRestoreResult = dbService.restoreBackup('{ "metadata": { "invalid": true }, "tables": {} }');
    const noteCountAfter = dbService.getNotes().length;
    const rollbackSuccess = !failedRestoreResult.success && noteCountBefore === noteCountAfter;
    tests.push({
      testNumber: 21,
      name: 'Atomic rollback on simulated restore failure',
      category: 'TRANSACTIONAL_RESTORE',
      passed: rollbackSuccess,
      message: rollbackSuccess 
        ? 'Atomic rollback verified: State completely preserved following rejected restore' 
        : 'FAILED: State modified during failed restore',
    });

    // -------------------------------------------------------------
    // TEST 22: Non-admin restore attempt rejected (RBAC enforcement)
    // -------------------------------------------------------------
    dbService.setActiveRole('MEMBER');
    const memberRestore = dbService.restoreBackup(validJson);
    tests.push({
      testNumber: 22,
      name: 'Non-admin restore attempt rejected (RBAC enforcement)',
      category: 'RBAC',
      passed: !memberRestore.success && memberRestore.message.includes('Unauthorized'),
      message: !memberRestore.success 
        ? 'MEMBER blocked from database restoration' 
        : 'FAILED: MEMBER allowed to restore database',
    });

    // -------------------------------------------------------------
    // TEST 23: Non-admin backup creation attempt rejected (RBAC enforcement)
    // -------------------------------------------------------------
    let memberBackupBlocked = false;
    try {
      dbService.createBackup('MANUAL');
      memberBackupBlocked = false;
    } catch {
      memberBackupBlocked = true;
    }
    tests.push({
      testNumber: 23,
      name: 'Non-admin backup creation attempt rejected (RBAC enforcement)',
      category: 'RBAC',
      passed: memberBackupBlocked,
      message: memberBackupBlocked 
        ? 'MEMBER blocked from creating administrative backup snapshot' 
        : 'FAILED: MEMBER allowed to create backup',
    });

    // Switch back to admin for remaining checks
    dbService.setActiveRole('ADMINISTRATOR');

    // -------------------------------------------------------------
    // TEST 24: Retention policy enforcement (cannot delete last remaining backup)
    // -------------------------------------------------------------
    // Temporarily set backup history to single item
    const existingBackups = dbService.getBackupLogs();
    const singleBackup = existingBackups.slice(0, 1);
    (dbService as unknown as { saveTable: (t: string, d: unknown) => void }).saveTable('backup_history', singleBackup);
    const deleteSingleAttempt = dbService.deleteBackupLog(singleBackup[0].id);
    tests.push({
      testNumber: 24,
      name: 'Retention policy enforcement (cannot delete last remaining backup)',
      category: 'RETENTION',
      passed: !deleteSingleAttempt.success,
      message: !deleteSingleAttempt.success 
        ? 'Retention policy preserved: Attempt to delete last remaining backup rejected' 
        : 'FAILED: Last remaining backup was deleted',
    });

    // -------------------------------------------------------------
    // TEST 25: Retention policy allows deletion when multiple backups exist
    // -------------------------------------------------------------
    // Add a second backup so deletion is permitted
    dbService.createBackupRecord('test-redundant-backup.json');
    const logsWithTwo = dbService.getBackupLogs();
    const targetToDelete = logsWithTwo[0].id;
    const deleteAllowedAttempt = dbService.deleteBackupLog(targetToDelete);
    tests.push({
      testNumber: 25,
      name: 'Retention policy allows deletion when multiple backups exist',
      category: 'RETENTION',
      passed: deleteAllowedAttempt.success,
      message: deleteAllowedAttempt.success 
        ? 'Retention policy allows pruning: Secondary backup deleted successfully' 
        : `FAILED: Deletion disallowed despite multiple backups: ${deleteAllowedAttempt.error}`,
    });

    // -------------------------------------------------------------
    // TEST 26: Offline mode health check returns valid stats
    // -------------------------------------------------------------
    const offlineHealth = dbService.getOfflineSystemHealth();
    const offlineHealthValid = Boolean(
      offlineHealth.isOfflineModeActive &&
      offlineHealth.persistedTablesCount > 0 &&
      offlineHealth.totalBackupsCount > 0
    );
    tests.push({
      testNumber: 26,
      name: 'Offline mode health check returns valid stats',
      category: 'OFFLINE_SAFETY',
      passed: offlineHealthValid,
      message: offlineHealthValid 
        ? `Offline health verified: ${offlineHealth.persistedTablesCount} tables, ${(offlineHealth.totalEstimatedBytes / 1024).toFixed(1)} KB` 
        : 'FAILED: Offline health stats invalid',
    });

    // -------------------------------------------------------------
    // TEST 27: Offline write safety check succeeds
    // -------------------------------------------------------------
    tests.push({
      testNumber: 27,
      name: 'Offline write safety check succeeds',
      category: 'OFFLINE_SAFETY',
      passed: offlineHealth.writeSafetyVerified && offlineHealth.localStorageAvailable,
      message: offlineHealth.writeSafetyVerified 
        ? 'Local storage write probe passed without errors' 
        : 'FAILED: Local write safety probe failed',
    });

    // -------------------------------------------------------------
    // TEST 28: Audit logging for BACKUP_CREATED event
    // -------------------------------------------------------------
    const auditLogs = dbService.getAuditLogs();
    const hasBackupCreatedAudit = auditLogs.some(l => l.action === 'BACKUP_CREATED');
    tests.push({
      testNumber: 28,
      name: 'Audit logging for BACKUP_CREATED event',
      category: 'AUDIT',
      passed: hasBackupCreatedAudit,
      message: hasBackupCreatedAudit 
        ? 'Audit trail confirms BACKUP_CREATED action logged' 
        : 'FAILED: BACKUP_CREATED audit log missing',
    });

    // -------------------------------------------------------------
    // TEST 29: Audit logging for RESTORE_STARTED, RESTORE_COMPLETED events
    // -------------------------------------------------------------
    const hasRestoreStartedAudit = auditLogs.some(l => l.action === 'RESTORE_STARTED');
    const hasRestoreCompletedAudit = auditLogs.some(l => l.action === 'RESTORE_COMPLETED');
    const restoreAuditsLogged = hasRestoreStartedAudit && hasRestoreCompletedAudit;
    tests.push({
      testNumber: 29,
      name: 'Audit logging for RESTORE_STARTED, RESTORE_COMPLETED events',
      category: 'AUDIT',
      passed: restoreAuditsLogged,
      message: restoreAuditsLogged 
        ? 'Audit trail records both RESTORE_STARTED and RESTORE_COMPLETED actions' 
        : 'FAILED: Restore lifecycle audit logs missing',
    });

    // -------------------------------------------------------------
    // TEST 30: Audit logging for RESTORE_REJECTED / validation failure events
    // -------------------------------------------------------------
    const hasValidationFailureOrRejectedAudit = auditLogs.some(
      l => l.action === 'RESTORE_REJECTED' || l.action === 'BACKUP_VALIDATION_FAILURE'
    );
    tests.push({
      testNumber: 30,
      name: 'Audit logging for RESTORE_REJECTED / validation failure events',
      category: 'AUDIT',
      passed: hasValidationFailureOrRejectedAudit,
      message: hasValidationFailureOrRejectedAudit 
        ? 'Audit trail properly records rejected restore / validation failure events' 
        : 'FAILED: Failure audit logs missing',
    });

  } finally {
    // Restore original active role and user
    dbService.setActiveRole(originalRole);
    dbService.setActiveUser(originalUserId);
  }

  const duration = performance.now() - startTime;
  const passedCount = tests.filter(t => t.passed).length;

  return {
    allPassed: passedCount === tests.length,
    totalCount: tests.length,
    passedCount,
    failedCount: tests.length - passedCount,
    executionDurationMs: Math.round(duration),
    timestamp: new Date().toISOString(),
    tests,
  };
}

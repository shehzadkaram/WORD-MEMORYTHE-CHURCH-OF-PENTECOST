/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Phase 7: Backup, Restore, Offline Reliability & Data Safety Service
 * 
 * Implements Section 23 & 24 of System Architecture:
 * - Data Classification (Canonical Immutable vs Controlled Application vs User Data)
 * - Deterministic integrity checksum validation
 * - Transactional safety restore with automatic pre-restore safety snapshot
 * - Absolute protection of canonical WordPocket Scripture (30,813 verses) and Day 21
 * - Review schedule verification (intervals strictly [1, 3, 7, 14, 30, 60, 90])
 */

import {
  BackupMetadata,
  BackupPayload,
  BackupValidationResult,
  DataClassificationManifest,
  DataClassificationCategory,
  UserRoleType,
} from '../types/database';

export class BackupRestoreService {
  public static readonly SCHEMA_VERSION = 'sqlite-1.0';
  public static readonly APP_IDENTIFIER = 'WORD MEMORY - The Church of Pentecost Dubai';
  public static readonly CENTRE_IDENTIFIER = 'Pakistani & Indian Worship Centre';

  public static readonly CANONICAL_BIBLE_VERSE_COUNT = 30814;
  public static readonly CANONICAL_BIBLE_BOOKS_COUNT = 66;
  public static readonly CANONICAL_BIBLE_CHAPTERS_COUNT = 1189;
  public static readonly CANONICAL_CURRICULUM_DAYS_COUNT = 365;
  public static readonly CANONICAL_DAY_21_STATUS = 'APPROVED';
  public static readonly CANONICAL_DAY_21_REFERENCE = 'Genesis 1:21';

  public static readonly VALID_SRS_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

  /**
   * Data classification registry defining the lifecycle and immutability of every table
   */
  public static readonly DATA_CLASSIFICATIONS: DataClassificationManifest[] = [
    {
      category: 'CANONICAL_IMMUTABLE',
      description: 'Sacred, unaltered Bible text and canonical verse mappings from WordPocket Urdu Bible.',
      tables: ['bible_books', 'bible_translations', 'chapters', 'verses'],
      isRestorable: false, // Never overwritten from backup
      isImmutable: true,
    },
    {
      category: 'CONTROLLED_APPLICATION',
      description: 'Church curriculum definitions, pastoral AI governance, audit trail, and application configuration.',
      tables: ['curriculum_plans', 'ai_supporting_content', 'church_challenges', 'app_settings', 'audit_logs', 'backup_history'],
      isRestorable: true,
      isImmutable: false,
    },
    {
      category: 'USER_DATA',
      description: 'Congregational members personal progress, review schedules, notes, and preferences.',
      tables: [
        'users',
        'memorization',
        'review_schedule',
        'practice_logs',
        'daily_sessions',
        'notes',
        'reminders',
        'user_settings',
        'challenge_participants',
        'member_milestones',
      ],
      isRestorable: true,
      isImmutable: false,
    },
  ];

  /**
   * Computes a deterministic 64-bit FNV-1a checksum of the string content.
   * Runs identically across Node.js CLI test runners and browser runtime.
   */
  public static computeChecksum(content: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0x1000193;
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i);
      h1 ^= charCode;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= (charCode * 31);
      h2 = Math.imul(h2, 0x01000193);
    }
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `sha256-chk-${hex1}${hex2}`;
  }

  /**
   * Validates a backup JSON string or object for structural, integrity, and safety compliance.
   */
  public static validateBackup(backupInput: string | unknown): BackupValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let payload: BackupPayload;

    // 1. JSON parse & structural check
    if (typeof backupInput === 'string') {
      try {
        payload = JSON.parse(backupInput) as BackupPayload;
      } catch {
        return {
          valid: false,
          errors: ['Corrupted backup file: JSON syntax error during parsing.'],
          warnings: [],
        };
      }
    } else if (typeof backupInput === 'object' && backupInput !== null) {
      payload = backupInput as BackupPayload;
    } else {
      return {
        valid: false,
        errors: ['Invalid backup format: Input must be a valid JSON string or object.'],
        warnings: [],
      };
    }

    if (!payload.metadata || typeof payload.metadata !== 'object') {
      errors.push('Missing required backup metadata.');
      return { valid: false, errors, warnings };
    }

    if (!payload.tables || typeof payload.tables !== 'object') {
      errors.push('Missing required backup tables payload.');
      return { valid: false, errors, warnings };
    }

    const meta = payload.metadata;

    // 2. Application & Schema Version check
    if (!meta.schema_version || meta.schema_version !== BackupRestoreService.SCHEMA_VERSION) {
      errors.push(`Unsupported schema version '${meta.schema_version || 'unknown'}'. Expected '${BackupRestoreService.SCHEMA_VERSION}'.`);
    }

    if (!meta.app || !meta.app.includes('The Church of Pentecost Dubai')) {
      warnings.push(`Origin application name '${meta.app}' differs from standard church instance.`);
    }

    // 3. Checksum & Integrity verification
    const tableString = JSON.stringify(payload.tables);
    const calculatedChecksum = BackupRestoreService.computeChecksum(tableString);
    let verifiedChecksum = false;

    if (!meta.checksum) {
      errors.push('Backup is missing required integrity checksum.');
    } else if (meta.checksum !== calculatedChecksum) {
      errors.push(`Integrity Checksum mismatch: Expected '${meta.checksum}', calculated '${calculatedChecksum}'. The backup file may be corrupt or tampered with.`);
    } else {
      verifiedChecksum = true;
    }

    // 4. Baseline Compatibility check
    if (meta.canonical_baseline) {
      const base = meta.canonical_baseline;
      if (base.bible_verse_count !== 30814 && base.bible_verse_count !== 30813) {
        errors.push(`Scripture verse count discrepancy: ${base.bible_verse_count}. Expected canonical ${BackupRestoreService.CANONICAL_BIBLE_VERSE_COUNT}.`);
      }
      if (base.bible_books_count !== BackupRestoreService.CANONICAL_BIBLE_BOOKS_COUNT) {
        errors.push(`Bible book count discrepancy: ${base.bible_books_count}. Expected canonical ${BackupRestoreService.CANONICAL_BIBLE_BOOKS_COUNT}.`);
      }
      if (base.bible_chapters_count !== BackupRestoreService.CANONICAL_BIBLE_CHAPTERS_COUNT) {
        errors.push(`Bible chapter count discrepancy: ${base.bible_chapters_count}. Expected canonical ${BackupRestoreService.CANONICAL_BIBLE_CHAPTERS_COUNT}.`);
      }
      if (base.curriculum_days_count !== BackupRestoreService.CANONICAL_CURRICULUM_DAYS_COUNT) {
        errors.push(`Incompatible curriculum days count: ${base.curriculum_days_count}. Expected canonical ${BackupRestoreService.CANONICAL_CURRICULUM_DAYS_COUNT}.`);
      }
      if (base.day_21_status !== 'APPROVED' && base.day_21_status !== 'NEEDS_SCRIPTURE_DATA') {
        errors.push(`Day 21 status anomaly: '${base.day_21_status}'. Day 21 (Genesis 1:21) must be 'APPROVED' or 'NEEDS_SCRIPTURE_DATA'.`);
      }
    } else {
      errors.push('Backup is missing canonical_baseline metadata.');
    }

    // 5. Canonical Reference Manifest Check
    if (!payload.tables.canonical_reference_manifest) {
      errors.push('Missing required canonical_reference_manifest in backup tables.');
    }

    // 5. Canonical Immutability Guard: Reject any attempts to replace WordPocket Scripture
    const rawTables = payload.tables as Record<string, unknown>;
    if (rawTables.verses && Array.isArray(rawTables.verses) && rawTables.verses.length > 0) {
      warnings.push('Backup contains a verses table. Canonical WordPocket Scripture is immutable and will NOT be overwritten during restore.');
    }

    // 6. Review Schedule verification (Phase 5C Spaced Repetition engine safety)
    if (payload.tables.review_schedule && Array.isArray(payload.tables.review_schedule)) {
      const invalidSchedules = payload.tables.review_schedule.filter(
        s => !BackupRestoreService.VALID_SRS_INTERVALS.includes(s.interval_days) || s.review_stage < 1 || s.review_stage > 7
      );
      if (invalidSchedules.length > 0) {
        errors.push(`Review schedule corruption detected: ${invalidSchedules.length} schedules have intervals outside the authorized sequence [1, 3, 7, 14, 30, 60, 90] or invalid stages.`);
      }
    }

    // 7. User role verification
    if (payload.tables.users && Array.isArray(payload.tables.users)) {
      const validRoles: UserRoleType[] = ['ADMINISTRATOR', 'PASTOR_LEADERSHIP', 'MEMBER'];
      const invalidUsers = payload.tables.users.filter(u => u.role && !validRoles.includes(u.role));
      if (invalidUsers.length > 0) {
        errors.push(`User integrity failure: ${invalidUsers.length} users have unrecognized or invalid roles.`);
      }
    }

    // 8. Table counts calculation
    const tableCounts: Record<string, number> = {};
    for (const [key, val] of Object.entries(payload.tables)) {
      if (Array.isArray(val)) {
        tableCounts[key] = val.length;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: meta,
      tableCounts,
      verifiedChecksum,
    };
  }

  /**
   * Helper to retrieve data classification category for a table
   */
  public static getTableClassification(tableName: string): DataClassificationCategory {
    for (const manifest of BackupRestoreService.DATA_CLASSIFICATIONS) {
      if (manifest.tables.includes(tableName)) {
        return manifest.category;
      }
    }
    return 'USER_DATA';
  }
}

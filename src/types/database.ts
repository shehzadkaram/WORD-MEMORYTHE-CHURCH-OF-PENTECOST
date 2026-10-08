/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Database Types & SQLite-Compatible Schema Definitions
 * Supporting 20 modular tables for production local-first / Windows desktop deployment.
 */

export type UserRoleType = 'ADMINISTRATOR' | 'PASTOR_LEADERSHIP' | 'MEMBER';

export type MemorizationStatus = 
  | 'NOT_STARTED' 
  | 'LEARNING' 
  | 'REVIEWING' 
  | 'MEMORIZED' 
  | 'MASTERED';

export type QuizQuestionType = 
  | 'MULTIPLE_CHOICE'
  | 'MISSING_WORDS'
  | 'COMPLETE_VERSE'
  | 'BIBLE_REFERENCE'
  | 'BOOK_IDENTIFICATION'
  | 'CHAPTER_IDENTIFICATION'
  | 'MEANING_BASED';

export type ChallengeStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
export type ChallengeType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type ChallengeTargetUnit = 'VERSES' | 'DAYS' | 'REVIEWS' | 'STREAK_DAYS';

// 1. users
export interface User {
  id: string;
  username: string;
  email?: string;
  display_name: string;
  phone?: string;
  centre: string; // e.g. "Pakistani & Indian Worship Centre, Dubai"
  is_active: boolean;
  password_hash?: string; // encrypted, never plain text
  role?: UserRoleType;
  created_at: string;
  updated_at: string;
}

// 2. roles
export interface Role {
  id: string;
  code: UserRoleType;
  name: string;
  description: string;
  created_at: string;
}

// 3. user_roles
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

// 4. bible_books
export interface BibleBook {
  id: string;
  testament: 'OLD' | 'NEW';
  book_number: number;
  english_name: string;
  urdu_name: string;
  folder_code: string; // e.g. "01" for Genesis
  total_chapters: number;
  source_base_url?: string;
}

// 5. bible_translations
export interface BibleTranslation {
  id: string;
  name: string; // e.g. "WordPocket Urdu Bible"
  language: string; // "ur"
  source: string; // "WordPocket"
  source_url: string; // "https://www.wordpocket.com/lang_texts/ur/index.htm"
  is_default: boolean;
  created_at: string;
}

// 6. chapters
export interface Chapter {
  id: string;
  book_id: string;
  book_number: number;
  chapter_number: number;
  total_verses: number;
  source_url: string;
  status: 'NOT_IMPORTED' | 'IMPORTED' | 'FAILED';
  imported_at?: string;
}

// 7. verses (Preserving Urdu WordPocket source fidelity)
export interface Verse {
  id: string;
  book_id: string;
  chapter_id?: string;
  translation_id?: string;
  chapter_number: number;
  verse_number: number;
  book_name_english: string;
  book_name_urdu: string;
  reference: string; // e.g. "Philippians 4:13"
  original_text: string; // Original Urdu text strictly preserved
  english_text?: string; // NKJV / KJV translation
  source_name: string; // "WordPocket Urdu Bible"
  source_url: string; // "https://www.wordpocket.com/lang_texts/ur/index.htm"
  translation: string; // "WordPocket Urdu Bible"
  language: string; // "ur"
  created_at: string;
  updated_at?: string;
}

// Bible Import Log
export type ImportStatusType = 
  | 'PENDING'
  | 'DOWNLOADING'
  | 'PARSING'
  | 'VALIDATED'
  | 'IMPORTED'
  | 'FAILED'
  | 'SKIPPED'
  | 'ALREADY_EXISTS';

export interface BibleImportLog {
  id: string;
  timestamp: string;
  book_number: number;
  book_name: string;
  chapter_number: number;
  source_url: string;
  status: ImportStatusType;
  verse_count: number;
  error_message?: string;
  duration_ms: number;
}

export interface BibleDatabaseHealth {
  totalBooksConfigured: number;
  booksWithVersesCount: number;
  totalChaptersExpected: number;
  chaptersImportedCount: number;
  versesImportedCount: number;
  missingChaptersCount: number;
  failedChaptersCount: number;
  duplicateVersesCount: number;
  emptyVersesCount: number;
  invalidRecordsCount: number;
  wordpocketSourceRecordsCount: number;
  urduRecordsCount: number;
  integrityStatus: 'PASS' | 'WARNING' | 'FAIL';
  lastCheckedAt: string;
  issues: string[];
}

export type CanonicalBookStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'PARTIAL' | 'FAILED';

export interface BookStatusReport {
  bookNumber: number;
  bookName: string;
  bookNameUrdu: string;
  testament: 'OLD' | 'NEW';
  folderCode: string;
  expectedChapters: number;
  importedChapters: number;
  missingChapters: number;
  importedVerses: number;
  failedChapters: number;
  status: CanonicalBookStatus;
}

export interface ChapterStatusRecord {
  id: string; // e.g. "01-1"
  bookNumber: number;
  bookName: string;
  chapterNumber: number;
  sourceUrl: string;
  fetchStatus: 'PENDING' | 'FETCHING' | 'FETCHED' | 'FAILED';
  httpStatus?: number;
  parseStatus: 'PENDING' | 'PARSED' | 'FAILED';
  verseCount: number;
  databaseStatus: 'NOT_IMPORTED' | 'IMPORTED' | 'ALREADY_EXISTS' | 'FAILED';
  errorMessage?: string;
  attemptCount: number;
  lastAttempt?: string;
  importedAt?: string;
}

// 7. verse_metadata (AI/Educational content stored strictly separately from sacred text)
export interface VerseMetadata {
  id: string;
  verse_id: string;
  category: string; // e.g. "Faith & Courage", "Spiritual Warfare", "Praise"
  subcategory?: string;
  topic: string;
  keywords: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  memorization_priority: number; // 1 to 5
  biblical_context: string;
  easy_explanation: string;
  practical_application: string;
  prayer: string;
  supporting_references: string[];
  created_at: string;
  updated_at: string;
}

// 8. memorization
export interface Memorization {
  id: string;
  user_id: string;
  verse_id: string;
  status: MemorizationStatus;
  started_date: string;
  memorized_date?: string;
  mastered_date?: string;
  total_practice_sessions: number;
  accuracy_rate: number; // 0 to 100
  confidence_level: number; // 1 to 5
  last_practiced_at?: string;
  created_at: string;
  updated_at: string;
}

// 9. review_schedule (Spaced Repetition: 1, 3, 7, 14, 30, 60, 90 days)
export interface ReviewSchedule {
  id: string;
  user_id: string;
  verse_id: string;
  curriculum_day_id?: number;
  verse_reference?: string;
  previous_review_date: string;
  next_review_date: string;
  interval_days: number; // 1, 3, 7, 14, 30, 60, 90
  review_stage?: number; // 1 to 7 corresponding to [1, 3, 7, 14, 30, 60, 90]
  accuracy: number; // 0 to 100
  confidence: number; // 1 to 5
  successful_recalls: number;
  failed_recalls: number;
  review_count: number;
  is_due: boolean;
  completion_status?: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  completed_at?: string;
  last_result?: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  created_at: string;
  updated_at: string;
}

// 10. quiz_attempts
export interface QuizAttempt {
  id: string;
  user_id: string;
  verse_id?: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  created_at: string;
}

// 11. quiz_questions
export interface QuizQuestion {
  id: string;
  verse_id: string;
  question_type: QuizQuestionType;
  prompt: string;
  urdu_prompt?: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  created_at: string;
}

// 12. daily_plan
export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string; // YYYY-MM-DD
  target_verse_id: string;
  is_completed: boolean;
  created_at: string;
}

// 13. daily_sessions (9-step daily session flow)
export interface DailySession {
  id: string;
  user_id: string;
  verse_id: string;
  session_date: string;
  current_step: number; // 1 to 9
  step_completed: {
    read_verse: boolean;
    understand_meaning: boolean;
    read_aloud: boolean;
    memorize: boolean;
    hide_words: boolean;
    recall: boolean;
    quiz: boolean;
    mark_progress: boolean;
    schedule_review: boolean;
  };
  duration_minutes: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// 14. reminders
export interface Reminder {
  id: string;
  user_id: string;
  reminder_type: 'DAILY_VERSE' | 'REVIEW_DUE' | 'CHALLENGE_CHECKIN';
  time_of_day: string; // "07:30"
  enabled: boolean;
  snooze_interval_mins: number;
  last_notified_at?: string;
  created_at: string;
  updated_at: string;
}

// 15. notes (Private spiritual reflections)
export interface Note {
  id: string;
  user_id: string;
  verse_id: string;
  personal_reflection: string;
  prayer: string;
  application: string;
  important_thoughts: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// 16. church_challenges
export interface ChurchChallenge {
  id: string;
  title: string;
  description: string;
  tagline: string;
  challenge_type?: ChallengeType;
  target_unit?: ChallengeTargetUnit;
  curriculum_scope?: string; // 'ALL' | 'MONTH_1' | '7_DAYS' | 'TODAY'
  start_date: string;
  end_date: string;
  target_verses_count: number;
  target?: number;
  status: ChallengeStatus;
  created_by?: string;
  completion_criteria?: string;
  created_at: string;
  updated_at?: string;
}

// 17. challenge_participants
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  verses_completed: number;
  current_progress?: number;
  target?: number;
  completion_percentage: number;
  is_completed?: boolean;
  joined_at: string;
  completed_at?: string;
  last_activity_at?: string;
  current_streak?: number;
}

// 17b. member_milestones (Phase 8 Motivation & Milestones)
export interface MemberMilestone {
  id: string;
  user_id: string;
  milestone_key: string;
  title: string;
  urdu_title: string;
  description: string;
  badge_icon: string;
  category: 'STREAK' | 'MEMORIZATION' | 'CHALLENGE' | 'CURRICULUM';
  awarded_at: string;
  qualifying_value: number;
}

// 18. user_settings
export interface UserSettings {
  id: string;
  user_id: string;
  language: 'ur' | 'en' | 'both';
  theme: 'light' | 'dark' | 'system';
  font_size: 'normal' | 'large' | 'extra_large';
  daily_goal_verses: number;
  quiz_difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  notifications_enabled: boolean;
  daily_reminder_time: string;
  review_reminder_time: string;
  auto_backup_enabled: boolean;
  privacy_mode: boolean;
  updated_at: string;
}

// 19. app_settings
export interface AppSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

// 20. backup_history
export interface BackupHistory {
  id: string;
  user_id: string;
  backup_type: 'MANUAL' | 'AUTOMATIC';
  file_name: string;
  file_size_bytes: number;
  record_count: number;
  created_at: string;
  status: 'SUCCESS' | 'FAILED';
}

// ============================================================================
// PHASE 3: 365-DAY CURRICULUM ENGINE TYPES
// ============================================================================

export type CurriculumPlanStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export type CurriculumDayStatus = 'DRAFT' | 'AI_DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'NEEDS_SCRIPTURE_DATA';
export type CurriculumStatus = CurriculumDayStatus;

export type CurriculumContentStatus = 'AI_DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'NEEDS_SCRIPTURE_DATA';

export type CurriculumDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface VerseContextResult {
  previousVerse?: Verse;
  selectedVerse?: Verse;
  nextVerse?: Verse;
  shouldExpand: boolean;
  suggestedRange?: string;
  expansionReason?: string;
}

export interface CurriculumSelectionScore {
  totalScore: number;
  completeThought: number;
  contextIntegrity: number;
  topicRelevance: number;
  spiritualImportance: number;
  memorizationSuitability: number;
  practicalRelevance: number;
  curriculumBalance: number;
}

// 21. curriculum_plans
export interface CurriculumPlan {
  id: string;
  name: string;
  urdu_name?: string;
  description: string;
  language: 'ur' | 'en' | 'both';
  duration_days: number; // 365
  status: CurriculumPlanStatus;
  version: string; // e.g. "1.0", "1.1"
  created_at: string;
  updated_at: string;
}

// 22. curriculum_days
export interface CurriculumDay {
  id: string;
  curriculum_id: string;
  day_number: number; // 1 to 365
  title: string;
  urdu_title?: string;
  theme: string;
  urdu_theme?: string;
  category: string; // e.g. "Month 1: Knowing God"
  month_number: number; // 1 to 12
  difficulty: CurriculumDifficulty;
  scripture_reference: string; // e.g. "Genesis 1:1", "Psalm 23:1-3", "Philippians 4:6-7"
  book_id: string;
  book_name_english: string;
  book_name_urdu: string;
  testament: 'OLD' | 'NEW';
  chapter_number: number;
  verse_start: number;
  verse_end: number;
  verse_ids: string[]; // Linked verse IDs in database
  
  // Authentic Scripture Text (from WordPocket database)
  original_urdu_text: string;
  english_text?: string;
  source_name: string; // "WordPocket Urdu Bible"
  source_url: string;
  
  // Reflection & Discipleship Material
  explanation: string;
  urdu_explanation?: string;
  application: string;
  urdu_application?: string;
  prayer: string;
  urdu_prayer?: string;
  memory_tip: string;
  urdu_memory_tip?: string;
  
  // Context Window
  context_prev_verse?: string;
  context_next_verse?: string;
  
  // Workflow & Governance
  status: CurriculumDayStatus;
  content_status: CurriculumContentStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  selection_score?: CurriculumSelectionScore;
  created_at: string;
  updated_at: string;
}

export interface CurriculumValidationCheck {
  name: string;
  passed: boolean;
  description: string;
  details?: string;
}

export interface CurriculumStats {
  totalDays: number;
  publishedCount: number;
  approvedCount: number;
  underReviewCount: number;
  draftCount: number;
  needsScriptureDataCount?: number;
  otCount: number;
  ntCount: number;
  otPercentage: number;
  ntPercentage: number;
  uniqueBooksCount: number;
  booksDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Record<CurriculumDifficulty, number>;
  duplicateReferencesCount: number;
  overlappingRangesCount: number;
  averageVersesPerDay: number;
  missingDays: number[];
}

export interface CurriculumValidationResult {
  isValid: boolean;
  totalDays: number;
  checks: CurriculumValidationCheck[];
  stats: CurriculumStats;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// PHASE 6: ADMINISTRATION, PASTORAL OVERSIGHT & CONTENT GOVERNANCE TYPES
// ============================================================================

export type AuditActionType =
  | 'CURRICULUM_APPROVE'
  | 'CURRICULUM_REJECT'
  | 'CURRICULUM_PUBLISH'
  | 'CURRICULUM_REVISE'
  | 'CONTENT_APPROVE'
  | 'CONTENT_REJECT'
  | 'CONTENT_PUBLISH'
  | 'CONTENT_REVISE'
  | 'ROLE_CHANGE'
  | 'USER_STATUS_CHANGE'
  | 'BIBLE_IMPORT_INITIATED'
  | 'BIBLE_IMPORT_RESET'
  | 'ADMIN_CONFIG_CHANGE'
  | 'ADMIN_MAINTENANCE'
  | 'BACKUP_CREATED'
  | 'BACKUP_VALIDATION'
  | 'BACKUP_VALIDATION_FAILURE'
  | 'RESTORE_STARTED'
  | 'RESTORE_COMPLETED'
  | 'RESTORE_REJECTED'
  | 'RESTORE_ROLLED_BACK'
  | 'RESTORE_FAILED'
  | 'BACKUP_DELETED'
  | 'CHALLENGE_CREATE'
  | 'CHALLENGE_UPDATE'
  | 'CHALLENGE_ACTIVATE'
  | 'CHALLENGE_PAUSE'
  | 'CHALLENGE_CLOSE'
  | 'CHALLENGE_ARCHIVE'
  | 'CHALLENGE_JOIN'
  | 'CHALLENGE_LEAVE'
  | 'MILESTONE_AWARDED'
  | 'ANALYTICS_EXPORT';

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_name: string;
  actor_role: UserRoleType;
  action: AuditActionType;
  affected_entity: string; // e.g. "curriculum_day:1", "user:demo-user-member"
  details: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export type AISupportingContentType = 
  | 'EXPLANATION'
  | 'APPLICATION'
  | 'REFLECTION_QUESTION'
  | 'PRAYER_PROMPT'
  | 'MEMORY_TIP'
  | 'THEMATIC_SUMMARY';

export type GovernanceApprovalStatus = 
  | 'DRAFT' 
  | 'AI_DRAFT' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'REJECTED';

export interface AISupportingContentItem {
  id: string;
  day_number: number;
  scripture_reference: string;
  content_type: AISupportingContentType;
  content_urdu: string;
  content_english: string;
  status: GovernanceApprovalStatus;
  author_source: string; // e.g. "Theological Curriculum Assistant (Supervised)", "Pastor Reviewed"
  created_at: string;
  reviewer?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface PastoralOversightStats {
  activeMembersCount: number;
  totalMembersCount: number;
  memorizationParticipationPercent: number;
  versesCurrentlyLearning: number;
  versesUnderReview: number;
  versesMemorized: number;
  versesMastered: number;
  aggregateReviewCompletionRate: number;
  totalPracticeSessionsRecorded: number;
  curriculumParticipationPercent: number;
  monthlyProgressDistribution: Record<number, number>; // Month 1-12 active verse count
  challengesMetrics?: PastoralChallengeMetrics;
  lastUpdated: string;
}

export interface PastoralChallengeMetrics {
  totalChallengesCount: number;
  activeChallengesCount: number;
  upcomingChallengesCount: number;
  completedChallengesCount: number;
  totalParticipantsEnrolled: number;
  uniqueParticipantsCount: number;
  totalCompletedParticipations: number;
  overallCompletionRate: number;
  challengesBreakdown: {
    id: string;
    title: string;
    type?: ChallengeType;
    status: ChallengeStatus;
    participantsCount: number;
    completedCount: number;
    completionRate: number;
  }[];
  calculatedAt: string;
}

export interface ReviewEngineOversightStats {
  totalSchedules: number;
  activeSchedules: number;
  dueReviewsCount: number;
  overdueReviewsCount: number;
  upcomingReviewsCount: number;
  completedReviewsCount: number;
  stageDistribution: Record<number, number>; // Stage 1-7 count
  engineHealthStatus: 'HEALTHY' | 'WARNING' | 'NEEDS_ATTENTION';
  averageIntervalDays: number;
  lastCalculatedAt: string;
}

export interface AdminSystemHealthStats {
  bibleHealth: BibleDatabaseHealth;
  totalScriptureRecords: number;
  booksImported: number;
  chaptersImported: number;
  curriculumTotalDays: number;
  curriculumApprovedDays: number;
  curriculumPendingDays: number; // e.g. Day 21
  aiContentAwaitingReviewCount: number;
  aiContentApprovedCount: number;
  aiContentPublishedCount: number;
  recentAuditLogsCount: number;
  reviewEngineHealth: ReviewEngineOversightStats;
  systemHealthStatus: 'HEALTHY' | 'ATTENTION_REQUIRED' | 'DEGRADED';
  activeUserRole: UserRoleType;
}

// ============================================================================
// PHASE 7: BACKUP, RESTORE, OFFLINE RELIABILITY & DATA SAFETY TYPES
// ============================================================================

export type DataClassificationCategory =
  | 'CANONICAL_IMMUTABLE'
  | 'CONTROLLED_APPLICATION'
  | 'USER_DATA';

export interface DataClassificationManifest {
  category: DataClassificationCategory;
  description: string;
  tables: string[];
  isRestorable: boolean;
  isImmutable: boolean;
}

export interface BackupCanonicalBaseline {
  bible_verse_count: number;
  bible_books_count: number;
  bible_chapters_count: number;
  curriculum_days_count: number;
  day_21_status: string;
  source_name: string;
}

export interface BackupMetadata {
  id: string;
  app: string;
  centre: string;
  version: string;
  schema_version: string;
  backup_type: 'MANUAL' | 'AUTOMATIC';
  created_at: string;
  created_by_user_id: string;
  created_by_user_name: string;
  created_by_role: UserRoleType;
  file_name: string;
  file_size_bytes: number;
  total_records: number;
  checksum: string;
  status: 'SUCCESS' | 'FAILED';
  canonical_baseline: BackupCanonicalBaseline;
  table_counts: Record<string, number>;
  notes?: string;
}

export interface BackupPayloadTables {
  // User Data
  memorization?: Memorization[];
  review_schedule?: ReviewSchedule[];
  practice_logs?: Record<string, unknown>[];
  daily_sessions?: DailySession[];
  notes?: Note[];
  reminders?: Reminder[];
  user_settings?: UserSettings[];
  challenge_participants?: ChallengeParticipant[];
  member_milestones?: MemberMilestone[];

  // Controlled Application Data
  users?: User[];
  ai_supporting_content?: AISupportingContentItem[];
  church_challenges?: ChurchChallenge[];
  curriculum_plans?: CurriculumPlan[];
  app_settings?: AppSettings[];
  audit_logs?: AuditLog[];

  // Canonical Reference Manifest (Reference only, never used to overwrite Scripture)
  canonical_reference_manifest?: {
    bible_source: string;
    verse_count: number;
    books_count: number;
    chapters_count: number;
    curriculum_days_count: number;
    day_21_status: string;
    day_21_reference: string;
  };
}

export interface BackupPayload {
  metadata: BackupMetadata;
  tables: BackupPayloadTables;
}

export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: BackupMetadata;
  tableCounts?: Record<string, number>;
  verifiedChecksum?: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredRecordCount?: number;
  safetyBackupId?: string;
  errors?: string[];
  restoredTables?: string[];
  timestamp: string;
}

export interface OfflineSystemHealthStats {
  isOfflineModeActive: boolean;
  localStorageAvailable: boolean;
  persistedTablesCount: number;
  totalEstimatedBytes: number;
  writeSafetyVerified: boolean;
  lastWriteCheckAt: string;
  lastSuccessfulBackupAt?: string;
  totalBackupsCount: number;
}

// ============================================================================
// PHASE 9: ANALYTICS, REPORTING & SPIRITUAL GROWTH INSIGHTS TYPES
// ============================================================================

export type AnalyticsDateRange = '7D' | '30D' | '90D' | 'ALL';

export type ActivityTimelineEventType = 
  | 'CURRICULUM_COMPLETED' 
  | 'VERSE_MEMORIZED' 
  | 'REVIEW_COMPLETED' 
  | 'CHALLENGE_JOINED' 
  | 'CHALLENGE_COMPLETED' 
  | 'MILESTONE_EARNED' 
  | 'PRACTICE_COMPLETED';

export interface ActivityTimelineEvent {
  id: string;
  type: ActivityTimelineEventType;
  title: string;
  urdu_title?: string;
  description: string;
  timestamp: string;
  reference_id?: string;
  category: 'MEMORIZATION' | 'REVIEW' | 'CHALLENGE' | 'MILESTONE' | 'CURRICULUM';
}

export interface PersonalTrendPoint {
  date: string; // YYYY-MM-DD
  sessionsCount: number;
  reviewsCount: number;
  memorizedCount: number;
  hasActivity: boolean;
}

export interface MemberPersonalAnalytics {
  userId: string;
  userName: string;
  userRole: UserRoleType;
  overview: {
    versesMemorized: number;
    versesMastered: number;
    versesLearning: number;
    versesReviewing: number;
    totalMemorizationRecords: number;
    quizAccuracy: number;
  };
  curriculum: {
    totalDays: number; // 365
    approvedDays: number; // 364
    needsScriptureDataDays: number; // 1
    day21Status: 'NEEDS_SCRIPTURE_DATA';
    day21Protected: boolean;
    daysCompleted: number;
    daysRemaining: number;
    completionPercentage: number;
    currentMonth: number;
    currentMonthProgressPercent: number;
  };
  consistency: {
    currentStreak: number;
    longestStreak: number;
    activeToday: boolean;
    totalActiveDays: number;
    qualifyingDates: string[];
  };
  reviews: {
    reviewsDue: number;
    reviewsOverdue: number;
    reviewsUpcoming: number;
    reviewsCompleted: number;
    totalReviewSchedules: number;
    reviewCompletionRate: number;
    stageDistribution: Record<number, number>; // Stages 1 to 7
  };
  challenges: {
    enrolledCount: number;
    completedCount: number;
    activeCount: number;
    participations: {
      challengeId: string;
      title: string;
      currentProgress: number;
      target: number;
      percentage: number;
      isCompleted: boolean;
      status: string;
    }[];
  };
  milestones: {
    totalEarned: number;
    items: MemberMilestone[];
  };
  timeline: ActivityTimelineEvent[];
  trends: {
    dateRange: AnalyticsDateRange;
    dataPoints: PersonalTrendPoint[];
    totalSessionsInRange: number;
    totalReviewsInRange: number;
    hasSufficientData: boolean;
    emptyStateMessage?: string;
  };
  generatedAt: string;
}

export interface PastoralAggregateAnalytics {
  totalRegisteredMembers: number;
  activeMembersLast7Days: number;
  activeMembersLast30Days: number;
  totalVersesMemorized: number;
  totalVersesMastered: number;
  totalVersesCurrentlyLearning: number;
  totalCompletedReviews: number;
  aggregateReviewCompletionRate: number;
  curriculumCompletionsCount: number;
  curriculumAverageProgressPercent: number;
  challenges: {
    totalChallengesCount: number;
    activeChallengesCount: number;
    totalEnrollments: number;
    completedEnrollments: number;
    overallCompletionRate: number;
    breakdown: {
      id: string;
      title: string;
      type: string;
      status: string;
      participantsCount: number;
      completedCount: number;
      completionRate: number;
    }[];
  };
  milestonesTotalAwarded: number;
  aggregateTrends: {
    dailyActiveUsers: { date: string; activeCount: number; sessionsCount: number; reviewsCount: number }[];
    weeklySummary: { weekLabel: string; sessionsCount: number; reviewsCount: number }[];
  };
  privacyGuarantee: {
    noIndividualRankings: true;
    noPrivateNotesExposed: true;
    noPersonalJournalsExposed: true;
    discipleshipCareOnly: true;
  };
  generatedAt: string;
}

export interface AdminSystemAnalytics {
  databaseHealth: {
    isHealthy: boolean;
    storageDriver: string;
    totalEstimatedBytes: number;
    lastWriteSafetyCheck: string;
    persistedTablesCount: number;
  };
  usersByRole: {
    MEMBER: number;
    PASTOR_LEADERSHIP: number;
    ADMINISTRATOR: number;
    total: number;
    activeCount: number;
  };
  canonicalScripture: {
    totalBooks: number; // 66
    oldTestamentBooks: number; // 39
    newTestamentBooks: number; // 27
    totalChapters: number; // 1189
    totalVerses: number; // 30813
    uniqueCanonicalCoordinates: number; // 30813
    duplicateCoordinates: number; // 0
    emptyOrCorruptRecords: number; // 0
    source: string; // 'WordPocket Urdu Bible'
    immutable: boolean;
    aiGeneratedCount: number; // 0
  };
  curriculumHealth: {
    totalDays: number; // 365
    approvedDays: number; // 364
    needsScriptureDataDays: number; // 1
    draftDays: number; // 0
    aiDraftDays: number; // 0
    day21Status: 'NEEDS_SCRIPTURE_DATA';
    day21Reference: string;
    day21Protected: boolean;
    day21CannotBeFalselyCompleted: boolean;
  };
  tableCounts: Record<string, number>;
  auditStats: {
    totalLogs: number;
    recentActionCounts: Record<string, number>;
  };
  backupStats: {
    totalBackups: number;
    lastBackupDate?: string;
    lastBackupStatus?: string;
  };
  generatedAt: string;
}

export interface AnalyticsExportReport {
  reportType: 'MEMBER_PROGRESS' | 'PASTORAL_AGGREGATE' | 'ADMIN_SYSTEM';
  title: string;
  generatedByUserId: string;
  generatedByRole: UserRoleType;
  generatedAt: string;
  dateRange: string;
  churchBranding: {
    church: string;
    centre: string;
    app: string;
  };
  data: MemberPersonalAnalytics | PastoralAggregateAnalytics | AdminSystemAnalytics;
}





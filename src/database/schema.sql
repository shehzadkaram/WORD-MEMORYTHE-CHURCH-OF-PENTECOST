-- ============================================================================
-- WORD MEMORY PLATFORM
-- THE CHURCH OF PENTECOST, DUBAI
-- PAKISTANI & INDIAN WORSHIP CENTRE
--
-- Official SQLite-Compatible Database Schema (Phase 1 Foundation)
-- Compliant with Section 9, 10, 11, 14, 16, 23 & 24 of System Architecture
--
-- Engine Target: SQLite 3.35+ (Local-first, Windows desktop, Tauri/Electron/Node)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    display_name TEXT NOT NULL,
    phone TEXT,
    centre TEXT NOT NULL DEFAULT 'Pakistani & Indian Worship Centre, Dubai',
    is_active INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'ADMINISTRATOR', 'PASTOR_LEADERSHIP', 'MEMBER'
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- 4. BIBLE_BOOKS
CREATE TABLE IF NOT EXISTS bible_books (
    id TEXT PRIMARY KEY,
    testament TEXT NOT NULL CHECK(testament IN ('OLD', 'NEW')),
    book_number INTEGER NOT NULL UNIQUE,
    english_name TEXT NOT NULL,
    urdu_name TEXT NOT NULL,
    folder_code TEXT NOT NULL, -- e.g. '01'
    total_chapters INTEGER NOT NULL DEFAULT 1,
    source_base_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_bible_books_order ON bible_books(book_number);

-- 5. BIBLE_TRANSLATIONS
CREATE TABLE IF NOT EXISTS bible_translations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'ur',
    source TEXT NOT NULL DEFAULT 'WordPocket',
    source_url TEXT NOT NULL DEFAULT 'https://www.wordpocket.com/lang_texts/ur/index.htm',
    is_default INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHAPTERS
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    book_number INTEGER NOT NULL,
    chapter_number INTEGER NOT NULL,
    total_verses INTEGER NOT NULL DEFAULT 0,
    source_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NOT_IMPORTED' CHECK(status IN ('NOT_IMPORTED', 'IMPORTED', 'FAILED')),
    imported_at DATETIME,
    FOREIGN KEY (book_id) REFERENCES bible_books(id) ON DELETE CASCADE,
    UNIQUE(book_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_ch ON chapters(book_id, chapter_number);

-- 7. VERSES
-- CRITICAL: Original Urdu Bible text preserved verbatim from source
-- (https://www.wordpocket.com/lang_texts/ur/index.htm)
CREATE TABLE IF NOT EXISTS verses (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    chapter_id TEXT,
    translation_id TEXT DEFAULT 'trans-wordpocket-ur',
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    book_name_english TEXT NOT NULL,
    book_name_urdu TEXT NOT NULL,
    reference TEXT NOT NULL, -- e.g. 'Genesis 1:1'
    original_text TEXT NOT NULL, -- Original Urdu text strictly preserved
    english_text TEXT,
    source_name TEXT NOT NULL DEFAULT 'WordPocket Urdu Bible',
    source_url TEXT NOT NULL DEFAULT 'https://www.wordpocket.com/lang_texts/ur/index.htm',
    translation TEXT NOT NULL DEFAULT 'WordPocket Urdu Bible',
    language TEXT NOT NULL DEFAULT 'ur',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES bible_books(id) ON DELETE RESTRICT,
    FOREIGN KEY (translation_id) REFERENCES bible_translations(id) ON DELETE SET NULL,
    UNIQUE(translation_id, book_id, chapter_number, verse_number)
);

CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(book_id, chapter_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_verses_reference ON verses(reference);

-- BIBLE IMPORT AUDIT LOG
CREATE TABLE IF NOT EXISTS bible_import_logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    book_number INTEGER NOT NULL,
    book_name TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    source_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('PENDING', 'DOWNLOADING', 'PARSING', 'VALIDATED', 'IMPORTED', 'FAILED', 'SKIPPED', 'ALREADY_EXISTS')),
    verse_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_import_logs_book ON bible_import_logs(book_number, chapter_number);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON bible_import_logs(status);

-- 7. VERSE_METADATA
-- AI-generated/educational content strictly separated from sacred scripture text
CREATE TABLE IF NOT EXISTS verse_metadata (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    subcategory TEXT,
    topic TEXT NOT NULL,
    keywords TEXT NOT NULL, -- JSON array of strings
    difficulty TEXT NOT NULL CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    memorization_priority INTEGER NOT NULL DEFAULT 3 CHECK(memorization_priority BETWEEN 1 AND 5),
    biblical_context TEXT,
    easy_explanation TEXT,
    practical_application TEXT,
    prayer TEXT,
    supporting_references TEXT, -- JSON array of references
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_verse_meta_topic ON verse_metadata(topic);
CREATE INDEX IF NOT EXISTS idx_verse_meta_cat ON verse_metadata(category);
CREATE INDEX IF NOT EXISTS idx_verse_meta_diff ON verse_metadata(difficulty);

-- 8. MEMORIZATION
CREATE TABLE IF NOT EXISTS memorization (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK(status IN ('NOT_STARTED', 'LEARNING', 'REVIEWING', 'MEMORIZED', 'MASTERED')),
    started_date DATE,
    memorized_date DATE,
    mastered_date DATE,
    total_practice_sessions INTEGER NOT NULL DEFAULT 0,
    accuracy_rate REAL NOT NULL DEFAULT 0.0,
    confidence_level INTEGER NOT NULL DEFAULT 1 CHECK(confidence_level BETWEEN 1 AND 5),
    last_practiced_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE,
    UNIQUE(user_id, verse_id)
);

CREATE INDEX IF NOT EXISTS idx_memorization_user_status ON memorization(user_id, status);

-- 9. REVIEW_SCHEDULE (Spaced Repetition: 1, 3, 7, 14, 30, 60, 90 days)
CREATE TABLE IF NOT EXISTS review_schedule (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    previous_review_date DATE NOT NULL,
    next_review_date DATE NOT NULL,
    interval_days INTEGER NOT NULL DEFAULT 1,
    accuracy REAL NOT NULL DEFAULT 0.0,
    confidence INTEGER NOT NULL DEFAULT 1 CHECK(confidence BETWEEN 1 AND 5),
    successful_recalls INTEGER NOT NULL DEFAULT 0,
    failed_recalls INTEGER NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    is_due INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE,
    UNIQUE(user_id, verse_id)
);

CREATE INDEX IF NOT EXISTS idx_review_schedule_next ON review_schedule(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_review_schedule_due ON review_schedule(user_id, is_due);

-- 10. QUIZ_ATTEMPTS
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_id TEXT,
    score REAL NOT NULL DEFAULT 0.0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, completed_at);

-- 11. QUIZ_QUESTIONS
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN (
        'MULTIPLE_CHOICE', 'MISSING_WORDS', 'COMPLETE_VERSE', 
        'BIBLE_REFERENCE', 'BOOK_IDENTIFICATION', 'CHAPTER_IDENTIFICATION', 
        'MEANING_BASED'
    )),
    prompt TEXT NOT NULL,
    urdu_prompt TEXT,
    options TEXT NOT NULL, -- JSON array of strings
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_verse ON quiz_questions(verse_id);

-- 12. DAILY_PLAN
CREATE TABLE IF NOT EXISTS daily_plan (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_date DATE NOT NULL,
    target_verse_id TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_verse_id) REFERENCES verses(id) ON DELETE RESTRICT,
    UNIQUE(user_id, plan_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_plan_lookup ON daily_plan(user_id, plan_date);

-- 13. DAILY_SESSIONS (9-step memorization flow tracking)
CREATE TABLE IF NOT EXISTS daily_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    session_date DATE NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1 CHECK(current_step BETWEEN 1 AND 9),
    steps_json TEXT NOT NULL, -- JSON storing completion flags for all 9 steps
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON daily_sessions(user_id, session_date);

-- 14. REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL CHECK(reminder_type IN ('DAILY_VERSE', 'REVIEW_DUE', 'CHALLENGE_CHECKIN')),
    time_of_day TEXT NOT NULL DEFAULT '07:30',
    enabled INTEGER NOT NULL DEFAULT 1,
    snooze_interval_mins INTEGER NOT NULL DEFAULT 15,
    last_notified_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);

-- 15. NOTES (Private spiritual reflections)
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_id TEXT NOT NULL,
    personal_reflection TEXT,
    prayer TEXT,
    application TEXT,
    important_thoughts TEXT,
    is_private INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_verse ON notes(user_id, verse_id);

-- 16. CHURCH_CHALLENGES
CREATE TABLE IF NOT EXISTS church_challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tagline TEXT,
    challenge_type TEXT NOT NULL DEFAULT 'MONTHLY' CHECK(challenge_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
    target_unit TEXT NOT NULL DEFAULT 'VERSES' CHECK(target_unit IN ('VERSES', 'DAYS', 'REVIEWS', 'STREAK_DAYS')),
    curriculum_scope TEXT DEFAULT 'ALL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_verses_count INTEGER NOT NULL DEFAULT 30,
    target INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK(status IN ('UPCOMING', 'ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED')),
    created_by TEXT,
    completion_criteria TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_church_challenges_status ON church_challenges(status);

-- 17. CHALLENGE_PARTICIPANTS
CREATE TABLE IF NOT EXISTS challenge_participants (
    id TEXT PRIMARY KEY,
    challenge_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    verses_completed INTEGER NOT NULL DEFAULT 0,
    current_progress INTEGER NOT NULL DEFAULT 0,
    target INTEGER NOT NULL DEFAULT 0,
    completion_percentage REAL NOT NULL DEFAULT 0.0,
    is_completed BOOLEAN NOT NULL DEFAULT 0,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    last_activity_at DATETIME,
    current_streak INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (challenge_id) REFERENCES church_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_lookup ON challenge_participants(challenge_id, user_id);

-- 17b. MEMBER_MILESTONES (Phase 8 Motivation & Milestones)
CREATE TABLE IF NOT EXISTS member_milestones (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    milestone_key TEXT NOT NULL,
    title TEXT NOT NULL,
    urdu_title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('STREAK', 'MEMORIZATION', 'CHALLENGE', 'CURRICULUM')),
    awarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    qualifying_value INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_member_milestones_user ON member_milestones(user_id);

-- 18. USER_SETTINGS
CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL DEFAULT 'both' CHECK(language IN ('ur', 'en', 'both')),
    theme TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light', 'dark', 'system')),
    font_size TEXT NOT NULL DEFAULT 'normal' CHECK(font_size IN ('normal', 'large', 'extra_large')),
    daily_goal_verses INTEGER NOT NULL DEFAULT 1,
    quiz_difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(quiz_difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    daily_reminder_time TEXT NOT NULL DEFAULT '07:30',
    review_reminder_time TEXT NOT NULL DEFAULT '19:30',
    auto_backup_enabled INTEGER NOT NULL DEFAULT 1,
    privacy_mode INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 19. APP_SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 20. BACKUP_HISTORY
CREATE TABLE IF NOT EXISTS backup_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    backup_type TEXT NOT NULL CHECK(backup_type IN ('MANUAL', 'AUTOMATIC')),
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL DEFAULT 0,
    record_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK(status IN ('SUCCESS', 'FAILED')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_backup_history_user ON backup_history(user_id, created_at);

-- ============================================================================
-- PHASE 3: 365-DAY CURRICULUM ENGINE EXTENSIONS
-- ============================================================================

-- 21. CURRICULUM_PLANS
CREATE TABLE IF NOT EXISTS curriculum_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    urdu_name TEXT,
    description TEXT,
    language TEXT NOT NULL DEFAULT 'both' CHECK(language IN ('ur', 'en', 'both')),
    duration_days INTEGER NOT NULL DEFAULT 365,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    version TEXT NOT NULL DEFAULT '1.0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_curriculum_plans_status ON curriculum_plans(status);

-- 22. CURRICULUM_DAYS
CREATE TABLE IF NOT EXISTS curriculum_days (
    id TEXT PRIMARY KEY,
    curriculum_id TEXT NOT NULL,
    day_number INTEGER NOT NULL CHECK(day_number BETWEEN 1 AND 365),
    title TEXT NOT NULL,
    urdu_title TEXT,
    theme TEXT NOT NULL,
    urdu_theme TEXT,
    category TEXT NOT NULL,
    month_number INTEGER NOT NULL CHECK(month_number BETWEEN 1 AND 12),
    difficulty TEXT NOT NULL CHECK(difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    scripture_reference TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER NOT NULL,
    verse_ids_json TEXT NOT NULL,
    explanation TEXT,
    urdu_explanation TEXT,
    application TEXT,
    urdu_application TEXT,
    prayer TEXT,
    urdu_prayer TEXT,
    memory_tip TEXT,
    urdu_memory_tip TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'AI_DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED')),
    content_status TEXT NOT NULL DEFAULT 'AI_DRAFT' CHECK(content_status IN ('AI_DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED')),
    selection_score_json TEXT,
    context_prev_verse TEXT,
    context_next_verse TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curriculum_id) REFERENCES curriculum_plans(id) ON DELETE CASCADE,
    UNIQUE(curriculum_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_days_plan_day ON curriculum_days(curriculum_id, day_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_days_ref ON curriculum_days(scripture_reference);


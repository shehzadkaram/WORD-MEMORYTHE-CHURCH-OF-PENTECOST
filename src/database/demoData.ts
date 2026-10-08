/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * DEMO & PLACEHOLDER DATA REPOSITORY
 * 
 * COMPLIANCE MANDATE (Section 26):
 * All data in this file is strictly designated as DEMO/PLACEHOLDER for Phase 1 architectural evaluation.
 * No fake statistics are represented as real church records.
 * The sample verse preserves authentic Scripture from WordPocket Urdu Bible source.
 */

import { 
  User, 
  Role, 
  UserRole,
  Verse, 
  VerseMetadata, 
  Memorization, 
  ReviewSchedule, 
  ChurchChallenge, 
  ChallengeParticipant,
  MemberMilestone,
  Note, 
  Reminder, 
  UserSettings,
  AISupportingContentItem,
  AuditLog
} from '../types/database';
import { GENESIS_1_WORDPOCKET_VERSES } from './genesis1Verses';
import { 
  REPRESENTATIVE_CANONICAL_VERSES, 
  REPRESENTATIVE_CANONICAL_CHAPTERS 
} from './representativeVerses';
import { 
  CLEANED_PSALM_119_VERSE_100, 
  PARSED_PSALM_119_VERSES 
} from './psalm119ParsedVerses';
import { AUTHENTIC_GENESIS_1_21_VERSE } from './authenticGenesis121';

export const IS_DEMO_MODE = true;
export const DEMO_NOTICE = "PHASE 1 PREVIEW: Demonstrating SQLite-compatible schema and UI architecture using sample data. Real church records & complete Bible will be imported in Phase 2.";

// Roles
export const DEMO_ROLES: Role[] = [
  {
    id: 'role-admin',
    code: 'ADMINISTRATOR',
    name: 'Church Administrator',
    description: 'Full administrative rights to church curriculum, backups, and app configurations.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-pastor',
    code: 'PASTOR_LEADERSHIP',
    name: 'Pastor / Church Leadership',
    description: 'Oversees memory challenges, sermon series memory verses, and church discipleship.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'role-member',
    code: 'MEMBER',
    name: 'Church Member',
    description: 'Standard member memorizing Scripture, taking daily sessions, and spiritual growth.',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Demo Users for testing role-based access
export const DEMO_USERS: User[] = [
  {
    id: 'demo-user-member',
    username: 'church_member_demo',
    display_name: 'Member Preview (John)',
    email: 'member.preview@copdubai.org',
    centre: 'Pakistani & Indian Worship Centre, Dubai',
    is_active: true,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'demo-user-pastor',
    username: 'pastor_demo',
    display_name: 'Pastor / Worship Leader',
    email: 'leadership@copdubai.org',
    centre: 'Pakistani & Indian Worship Centre, Dubai',
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'demo-user-admin',
    username: 'admin_demo',
    display_name: 'System Administrator',
    email: 'admin@copdubai.org',
    centre: 'Pakistani & Indian Worship Centre, Dubai',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
];

// Sample Verse: Philippians 4:13 (Authentic source preserved, never rewritten)
export const DEMO_VERSE_PHILIPPIANS: Verse = {
  id: 'verse-phil-4-13',
  book_id: 'book-phil',
  chapter_number: 4,
  verse_number: 13,
  book_name_english: 'Philippians',
  book_name_urdu: 'فلپیوں',
  reference: 'Philippians 4:13',
  // Verbatim from WordPocket Urdu Bible (https://www.wordpocket.com/lang_texts/ur/index.htm)
  original_text: 'جو مجھے طاقت بخشتا ہے اُس میں مَیں سب کچھ کر سکتا ہوں۔',
  english_text: 'I can do all things through Christ who strengthens me.',
  source_name: 'WordPocket Urdu Bible',
  source_url: 'https://www.wordpocket.com/lang_texts/ur/index.htm',
  translation: 'Geo Urdu / Standard Urdu',
  language: 'ur',
  created_at: '2026-01-01T00:00:00Z',
};

// Additional authentic preview verse: John 3:16
export const DEMO_VERSE_JOHN: Verse = {
  id: 'verse-john-3-16',
  book_id: 'book-john',
  chapter_number: 3,
  verse_number: 16,
  book_name_english: 'John',
  book_name_urdu: 'یوحنا',
  reference: 'John 3:16',
  original_text: 'کیونکہ خُدا نے دُنیا سے اَیسی محبت رکھی کہ اُس نے اپنا اِکلوتا بیٹا بخش دیا تاکہ جو کوئی اُس پر اِیمان لائے ہلاک نہ ہو بلکہ ہمیشہ کی زندگی پائے۔',
  english_text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
  source_name: 'WordPocket Urdu Bible',
  source_url: 'https://www.wordpocket.com/lang_texts/ur/index.htm',
  translation: 'Geo Urdu / Standard Urdu',
  language: 'ur',
  created_at: '2026-01-01T00:00:00Z',
};

// Additional authentic preview verse: Psalm 23:1
export const DEMO_VERSE_PSALM: Verse = {
  id: 'verse-psalm-23-1',
  book_id: 'book-psalm',
  chapter_number: 23,
  verse_number: 1,
  book_name_english: 'Psalms',
  book_name_urdu: 'زبور',
  reference: 'Psalm 23:1',
  original_text: 'خُداوند میرا چوپان ہے۔ مجھے کُچھ کمی نہ ہو گی۔',
  english_text: 'The LORD is my shepherd; I shall not want.',
  source_name: 'WordPocket Urdu Bible',
  source_url: 'https://www.wordpocket.com/lang_texts/ur/index.htm',
  translation: 'Geo Urdu / Standard Urdu',
  language: 'ur',
  created_at: '2026-01-01T00:00:00Z',
};

export const INITIAL_CANONICAL_CHAPTERS = REPRESENTATIVE_CANONICAL_CHAPTERS;

export const DEMO_VERSES: Verse[] = [
  ...REPRESENTATIVE_CANONICAL_VERSES.map(v => v.id === 'verse-19-119-100' ? CLEANED_PSALM_119_VERSE_100 : v),
  ...PARSED_PSALM_119_VERSES,
  AUTHENTIC_GENESIS_1_21_VERSE,
];

// Metadata for Philippians 4:13 (Stored separately from Scripture text)
export const DEMO_METADATA_PHILIPPIANS: VerseMetadata = {
  id: 'meta-phil-4-13',
  verse_id: 'verse-50-4-13',
  category: 'Faith & Spiritual Strength',
  subcategory: 'Endurance in Christ',
  topic: 'Divine Empowerment',
  keywords: ['Christ', 'Strength', 'Power', 'Victory', 'Faith', 'Urdu'],
  difficulty: 'EASY',
  memorization_priority: 5,
  biblical_context: 'Written by Apostle Paul from a Roman prison to the church at Philippi. Paul reveals the secret of true Christian contentment and supernatural empowerment in all circumstances.',
  easy_explanation: 'This verse teaches that our capacity to overcome trials, temptations, and daily responsibilities does not rely on human willpower alone, but on the living strength imparted through Jesus Christ.',
  practical_application: 'Whenever you face moments of weakness, anxiety about your future, or workplace stress in Dubai, speak this Scripture out loud. Rely on Christ rather than human pride.',
  prayer: 'خُداوند یسوع، تیرا شکر ہو کہ تُو میری قوت اور چٹان ہے۔ مجھے وہ فضل بخش کہ مَیں ہر آزمایش اور مشکل میں تیری قدرت پر بھروسا رکھوں۔ آمین۔ (Lord Jesus, thank You that You are my strength. Grant me the grace to rely on Your power in every trial. Amen.)',
  supporting_references: ['2 Corinthians 12:9', 'Ephesians 3:16', 'Isaiah 40:29-31'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// Demo Memorization Records
export const DEMO_MEMORIZATION_RECORDS: Memorization[] = [
  {
    id: 'mem-1',
    user_id: 'demo-user-member',
    verse_id: 'verse-50-4-13',
    status: 'LEARNING',
    started_date: '2026-03-01',
    total_practice_sessions: 4,
    accuracy_rate: 88.5,
    confidence_level: 4,
    last_practiced_at: '2026-03-08T18:30:00Z',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-08T18:30:00Z',
  },
  {
    id: 'mem-2',
    user_id: 'demo-user-member',
    verse_id: 'verse-john-3-16',
    status: 'MEMORIZED',
    started_date: '2026-02-15',
    memorized_date: '2026-02-22',
    total_practice_sessions: 9,
    accuracy_rate: 96.0,
    confidence_level: 5,
    last_practiced_at: '2026-03-07T12:00:00Z',
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-03-07T12:00:00Z',
  },
  {
    id: 'mem-3',
    user_id: 'demo-user-member',
    verse_id: 'verse-psalm-23-1',
    status: 'MASTERED',
    started_date: '2026-01-20',
    memorized_date: '2026-01-28',
    mastered_date: '2026-02-28',
    total_practice_sessions: 14,
    accuracy_rate: 99.0,
    confidence_level: 5,
    last_practiced_at: '2026-03-05T09:15:00Z',
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-03-05T09:15:00Z',
  },
];

// Spaced Repetition Due Queue
export const DEMO_REVIEW_SCHEDULES: ReviewSchedule[] = [
  {
    id: 'rev-1',
    user_id: 'demo-user-member',
    verse_id: 'verse-50-4-13',
    previous_review_date: '2026-03-05',
    next_review_date: '2026-03-08',
    interval_days: 3,
    accuracy: 92.0,
    confidence: 4,
    successful_recalls: 3,
    failed_recalls: 1,
    review_count: 4,
    is_due: true,
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-05T08:00:00Z',
  },
  {
    id: 'rev-2',
    user_id: 'demo-user-member',
    verse_id: 'verse-john-3-16',
    previous_review_date: '2026-03-01',
    next_review_date: '2026-03-15',
    interval_days: 14,
    accuracy: 98.0,
    confidence: 5,
    successful_recalls: 6,
    failed_recalls: 0,
    review_count: 6,
    is_due: false,
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-03-01T08:00:00Z',
  },
];

// Church Challenges (Phase 8: Daily, Weekly, Monthly, Custom)
export const DEMO_CHURCH_CHALLENGES: ChurchChallenge[] = [
  {
    id: 'chal-30',
    title: '30 Days — 30 Bible Verses',
    description: 'A foundational month of Scripture memorization focusing on God’s promises, victory, and holy living for all church members.',
    tagline: 'Hide His Word in Your Heart',
    challenge_type: 'MONTHLY',
    target_unit: 'DAYS',
    curriculum_scope: 'MONTH_1',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    target_verses_count: 30,
    target: 30,
    status: 'ACTIVE',
    created_by: 'user-admin-1',
    completion_criteria: 'Complete 30 approved curriculum days',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'chal-90',
    title: '90 Days of Scripture',
    description: 'Quarterly spiritual discipline journey exploring the Gospels, the Psalms, and Paul’s Epistles.',
    tagline: 'Deepening Discipleship & Wisdom',
    challenge_type: 'CUSTOM',
    target_unit: 'VERSES',
    curriculum_scope: 'ALL',
    start_date: '2026-05-01',
    end_date: '2026-07-30',
    target_verses_count: 90,
    target: 90,
    status: 'UPCOMING',
    created_by: 'user-pastor-1',
    completion_criteria: 'Memorize 90 approved Bible verses',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'chal-365',
    title: '365-Day Bible Memory Journey',
    description: 'Annual church-wide commitment to memorize one verse every single day across the congregation.',
    tagline: 'A Year Anchored in the Living Word',
    challenge_type: 'CUSTOM',
    target_unit: 'DAYS',
    curriculum_scope: 'ALL',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    target_verses_count: 365,
    target: 365,
    status: 'ACTIVE',
    created_by: 'user-admin-1',
    completion_criteria: 'Complete 365 curriculum days (Day 21 protected)',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'chal-daily-today',
    title: "Today's Living Word Challenge",
    description: "Daily congregational commitment: Complete today's 9-step Scripture journey and store God's truth in your heart.",
    tagline: 'Thy Word Have I Hid In Mine Heart',
    challenge_type: 'DAILY',
    target_unit: 'VERSES',
    curriculum_scope: 'TODAY',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    target_verses_count: 1,
    target: 1,
    status: 'ACTIVE',
    created_by: 'user-pastor-1',
    completion_criteria: "Complete today's memory verse journey",
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'chal-7day-streak',
    title: '7-Day Faithful Walker Challenge',
    description: 'Build a steady daily habit of Scripture memorization and scheduled spaced reviews for 7 consecutive days.',
    tagline: 'Faithful in the Daily Walk',
    challenge_type: 'WEEKLY',
    target_unit: 'STREAK_DAYS',
    curriculum_scope: 'ALL',
    start_date: '2026-03-01',
    end_date: '2026-12-31',
    target_verses_count: 7,
    target: 7,
    status: 'ACTIVE',
    created_by: 'user-pastor-1',
    completion_criteria: 'Maintain a 7-day activity streak',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'chal-review-fidelity',
    title: 'Spaced Review Fidelity Challenge',
    description: 'Complete scheduled spaced repetition reviews to ensure permanent retention of God’s Word.',
    tagline: 'Guard the Sacred Deposit',
    challenge_type: 'CUSTOM',
    target_unit: 'REVIEWS',
    curriculum_scope: 'ALL',
    start_date: '2026-03-01',
    end_date: '2026-12-31',
    target_verses_count: 10,
    target: 10,
    status: 'ACTIVE',
    created_by: 'user-admin-1',
    completion_criteria: 'Complete 10 scheduled spaced reviews',
    created_at: '2026-03-01T00:00:00Z',
  },
];

// Demo Challenge Participants (Phase 8: Real persisted participant states)
export const DEMO_CHALLENGE_PARTICIPANTS: ChallengeParticipant[] = [
  {
    id: 'part-demo-1',
    challenge_id: 'chal-30',
    user_id: 'demo-user-member',
    verses_completed: 7,
    current_progress: 7,
    target: 30,
    completion_percentage: 23.3,
    is_completed: false,
    joined_at: '2026-04-01T08:00:00Z',
    last_activity_at: '2026-04-07T12:00:00Z',
    current_streak: 7,
  },
  {
    id: 'part-demo-2',
    challenge_id: 'chal-365',
    user_id: 'demo-user-member',
    verses_completed: 7,
    current_progress: 7,
    target: 365,
    completion_percentage: 1.9,
    is_completed: false,
    joined_at: '2026-01-01T00:00:00Z',
    last_activity_at: '2026-03-01T10:00:00Z',
    current_streak: 7,
  },
  {
    id: 'part-demo-3',
    challenge_id: 'chal-7day-streak',
    user_id: 'demo-user-member',
    verses_completed: 7,
    current_progress: 7,
    target: 7,
    completion_percentage: 100,
    is_completed: true,
    joined_at: '2026-03-01T00:00:00Z',
    completed_at: '2026-03-08T00:00:00Z',
    last_activity_at: '2026-03-08T00:00:00Z',
    current_streak: 7,
  },
  {
    id: 'part-demo-4',
    challenge_id: 'chal-30',
    user_id: 'user-pastor-1',
    verses_completed: 15,
    current_progress: 15,
    target: 30,
    completion_percentage: 50,
    is_completed: false,
    joined_at: '2026-04-01T08:00:00Z',
    last_activity_at: '2026-04-15T12:00:00Z',
    current_streak: 15,
  },
];

// Demo Member Milestones (Phase 8: Real persisted spiritual milestones)
export const DEMO_MEMBER_MILESTONES: MemberMilestone[] = [
  {
    id: 'ms-demo-1',
    user_id: 'demo-user-member',
    milestone_key: 'first_verse',
    title: 'First Verse in the Heart',
    urdu_title: 'پہلی آیت دل میں',
    description: 'Committed your first sacred Scripture verse to memory in the Word Memory journey.',
    badge_icon: 'BookmarkCheck',
    category: 'MEMORIZATION',
    awarded_at: '2026-02-15T08:00:00Z',
    qualifying_value: 1,
  },
  {
    id: 'ms-demo-2',
    user_id: 'demo-user-member',
    milestone_key: 'streak_7',
    title: '7-Day Faithful Walker',
    urdu_title: '7 روزہ وفادار پیروکار',
    description: 'Completed 7 consecutive days of daily Scripture meditation and spaced review.',
    badge_icon: 'Flame',
    category: 'STREAK',
    awarded_at: '2026-02-22T08:00:00Z',
    qualifying_value: 7,
  },
];

// Demo Note
export const DEMO_NOTE: Note = {
  id: 'note-1',
  user_id: 'demo-user-member',
  verse_id: 'verse-50-4-13',
  personal_reflection: 'Memorizing Philippians 4:13 in Urdu brings tremendous peace during busy work shifts in Dubai. Paul wrote this while bound in chains, yet spoke of limitless strength through Christ.',
  prayer: 'Heavenly Father, strengthen my family and our worship community in Dubai. Help me live this verse daily.',
  application: 'Instead of complaining about tiredness, declare Christ is my strength before starting each day.',
  important_thoughts: 'The Urdu word طاقت (taqat) signifies divine, supernatural enabling rather than human stamina.',
  is_private: true,
  created_at: '2026-03-04T14:20:00Z',
  updated_at: '2026-03-04T14:20:00Z',
};

// Demo Reminders
export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'rem-daily',
    user_id: 'demo-user-member',
    reminder_type: 'DAILY_VERSE',
    time_of_day: '07:00',
    enabled: true,
    snooze_interval_mins: 15,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rem-review',
    user_id: 'demo-user-member',
    reminder_type: 'REVIEW_DUE',
    time_of_day: '19:30',
    enabled: true,
    snooze_interval_mins: 20,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Demo User Settings
export const DEMO_USER_SETTINGS: UserSettings = {
  id: 'set-1',
  user_id: 'demo-user-member',
  language: 'both',
  theme: 'light',
  font_size: 'normal',
  daily_goal_verses: 1,
  quiz_difficulty: 'MEDIUM',
  notifications_enabled: true,
  daily_reminder_time: '07:00',
  review_reminder_time: '19:30',
  auto_backup_enabled: true,
  privacy_mode: true,
  updated_at: '2026-03-01T00:00:00Z',
};

// Demo Member Stats
export const DEMO_MEMBER_STATS = {
  currentStreak: 12,
  longestStreak: 19,
  versesMemorized: 7,
  versesMastered: 3,
  reviewsDueCount: 1,
  monthlyProgressPercent: 68,
  quizAccuracy: 94,
  totalSessionsCompleted: 26,
};

// ============================================================================
// PHASE 6: GOVERNANCE & AUDIT INITIAL DEMO RECORDS
// ============================================================================

export const DEMO_USER_ROLES: UserRole[] = [
  {
    id: 'ur-member',
    user_id: 'demo-user-member',
    role_id: 'MEMBER',
    assigned_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ur-pastor',
    user_id: 'demo-user-pastor',
    role_id: 'PASTOR_LEADERSHIP',
    assigned_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ur-admin',
    user_id: 'demo-user-admin',
    role_id: 'ADMINISTRATOR',
    assigned_at: '2026-01-01T08:00:00Z',
  },
];

export const DEMO_AI_SUPPORTING_CONTENT: AISupportingContentItem[] = [
  {
    id: 'ais-day-1-exp',
    day_number: 1,
    scripture_reference: 'Genesis 1:1',
    content_type: 'EXPLANATION',
    content_urdu: 'خدا کائنات کا خود مختار خالق ہے۔ ہر چیز کا آغاز اس کے ارادے اور کلام سے ہوا۔',
    content_english: 'God is the sovereign Creator of the cosmos. Everything in existence originated by His deliberate will and voice.',
    status: 'APPROVED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-01T10:00:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-03-02T14:30:00Z',
    review_notes: 'Theologically sound and aligned with Pentecostal doctrine of creation.',
  },
  {
    id: 'ais-day-1-app',
    day_number: 1,
    scripture_reference: 'Genesis 1:1',
    content_type: 'APPLICATION',
    content_urdu: 'جب آپ کے حالات بے ترتیب ہوں تو یاد رکھیں کہ خدا تاریکی میں سے بھی نیا آغاز پیدا کر سکتا ہے۔',
    content_english: 'When your circumstances feel chaotic, remember that God brings new beginnings out of formlessness.',
    status: 'APPROVED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-01T10:05:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-03-02T14:32:00Z',
    review_notes: 'Practical and uplifting for migrant workers in Dubai.',
  },
  {
    id: 'ais-day-2-exp',
    day_number: 2,
    scripture_reference: 'Genesis 1:2',
    content_type: 'THEMATIC_SUMMARY',
    content_urdu: 'روح القدس زندگی، نظم اور روشنی لانے کے لیے پانیوں کی سطح پر جنبش کر رہا تھا۔',
    content_english: 'The Holy Spirit was actively brooding over the waters, preparing to bring life, divine order, and illumination.',
    status: 'PUBLISHED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-10T08:00:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-10-08T07:15:00Z',
    review_notes: 'Pastoral theological sign-off complete. Approved and published for congregation.',
  },
  {
    id: 'ais-day-3-ref',
    day_number: 3,
    scripture_reference: 'Genesis 1:3',
    content_type: 'REFLECTION_QUESTION',
    content_urdu: 'خدا کا کلام اندھیرے پر روشنی لاتا ہے۔ آپ کی زندگی کا کون سا پہلو آج اس کے کلام کی روشنی کا محتاج ہے؟',
    content_english: 'God spoken word brings light into darkness. What area of your life needs the illumination of His Word today?',
    status: 'PUBLISHED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-11T09:15:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-10-08T07:15:00Z',
    review_notes: 'Pastoral reflection approved and published.',
  },
  {
    id: 'ais-day-4-tip',
    day_number: 4,
    scripture_reference: 'Genesis 1:4',
    content_type: 'MEMORY_TIP',
    content_urdu: 'پہلے حصے کو تین بار دہرائیں اور سوچیں کہ خدا نے روشنی کو اچھا کہا۔',
    content_english: 'Recite the first clause three times, emphasizing God affirmative declaration that the light was good.',
    status: 'PUBLISHED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-12T11:00:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-10-08T07:15:00Z',
    review_notes: 'Memory recitation technique approved and published.',
  },
  {
    id: 'ais-day-5-pry',
    day_number: 5,
    scripture_reference: 'Genesis 1:5',
    content_type: 'PRAYER_PROMPT',
    content_urdu: 'اے خداوند، میری صبح اور شام کو اپنی حضوری سے بھر دے اور میرے دل کو اپنے کلام سے منور رکھ۔ آمین۔',
    content_english: 'Lord, fill my mornings and evenings with Your presence, keeping my heart grounded in Your living Word. Amen.',
    status: 'PUBLISHED',
    author_source: 'Theological Curriculum Assistant (Supervised)',
    created_at: '2026-03-12T11:30:00Z',
    reviewer: 'Pastor / Worship Leader',
    reviewed_at: '2026-10-08T07:15:00Z',
    review_notes: 'Pastoral prayer prompt approved and published.',
  }
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actor_user_id: 'demo-user-admin',
    actor_name: 'System Administrator',
    actor_role: 'ADMINISTRATOR',
    action: 'CURRICULUM_PUBLISH',
    affected_entity: 'curriculum-plan:curriculum-365-v1',
    details: 'Verified and locked 365-day curriculum baseline with 365 approved days.',
    metadata: { approvedDays: 365, pendingDays: 0, verifiedRef: 'Genesis 1:21' },
    timestamp: '2026-03-01T08:30:00Z',
  },
  {
    id: 'aud-2',
    actor_user_id: 'demo-user-pastor',
    actor_name: 'Pastor / Worship Leader',
    actor_role: 'PASTOR_LEADERSHIP',
    action: 'CONTENT_APPROVE',
    affected_entity: 'supporting_content:ais-day-1-exp',
    details: 'Approved Day 1 explanation for theological accuracy and authentic Urdu alignment.',
    metadata: { dayNumber: 1, reference: 'Genesis 1:1', type: 'EXPLANATION' },
    timestamp: '2026-03-02T14:30:00Z',
  },
  {
    id: 'aud-3',
    actor_user_id: 'demo-user-admin',
    actor_name: 'System Administrator',
    actor_role: 'ADMINISTRATOR',
    action: 'BIBLE_IMPORT_INITIATED',
    affected_entity: 'bible_database:WordPocket',
    details: 'Automated canonical health check completed: 66 books, 1,189 chapters, 30,813 verses verified.',
    metadata: { versesCount: 30813, booksCount: 66, chaptersCount: 1189 },
    timestamp: '2026-03-05T09:00:00Z',
  }
];


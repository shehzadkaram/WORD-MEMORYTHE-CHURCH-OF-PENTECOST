/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Memorization Engine (Phase 1 Architecture)
 * 
 * Implements Section 12 & 13:
 * 1. 9-Step Daily Session Flow Architecture
 * 2. Word Hiding / Recall Masking Algorithms for both Urdu and English
 * 3. Status Progression: NOT_STARTED -> LEARNING -> REVIEWING -> MEMORIZED -> MASTERED
 */

import { MemorizationStatus } from '../types/database';

export interface DailyStepDefinition {
  stepNumber: number;
  key: string;
  title: string;
  urduTitle: string;
  instruction: string;
  description: string;
}

export const DAILY_SESSION_STEPS: DailyStepDefinition[] = [
  {
    stepNumber: 1,
    key: 'read_verse',
    title: '1. Read Verse',
    urduTitle: 'آیت پڑھیں',
    instruction: 'Read the verse carefully in Urdu and English multiple times with reverent focus.',
    description: 'Anchor the Scripture in your mind and observe every word of the sacred text.',
  },
  {
    stepNumber: 2,
    key: 'understand_meaning',
    title: '2. Understand Meaning',
    urduTitle: 'معنی اور سیاق و سباق سمجھیں',
    instruction: 'Review the biblical context, word explanations, and theological significance.',
    description: 'Ensure comprehension of spiritual truth before attempting memorization.',
  },
  {
    stepNumber: 3,
    key: 'read_aloud',
    title: '3. Read Aloud',
    urduTitle: 'بلند آواز میں دہرائیں',
    instruction: 'Speak the verse out loud 3 to 5 times to engage auditory memory pathways.',
    description: 'Faith comes by hearing, and hearing by the Word of God (Romans 10:17).',
  },
  {
    stepNumber: 4,
    key: 'memorize',
    title: '4. Memorize',
    urduTitle: 'زبانی یاد کریں',
    instruction: 'Break the verse down into smaller phrases and commit each phrase to memory.',
    description: 'Synthesize the clauses together in proper sequence.',
  },
  {
    stepNumber: 5,
    key: 'hide_words',
    title: '5. Hide Words',
    urduTitle: 'الفاظ چھپائیں',
    instruction: 'Progressively mask 25%, 50%, 75%, and 100% of the words to test recall.',
    description: 'Active reconstruction forces neural pathways to strengthen recall.',
  },
  {
    stepNumber: 6,
    key: 'recall',
    title: '6. Recall',
    urduTitle: 'یادداشت سے دہرائیں',
    instruction: 'Recite the full verse and reference without looking at the text.',
    description: 'Verify your memory against the original text word-for-word.',
  },
  {
    stepNumber: 7,
    key: 'quiz',
    title: '7. Quiz',
    urduTitle: 'امتحان دیں',
    instruction: 'Answer a quick test question verifying reference, words, or biblical meaning.',
    description: 'Assess both verbatim precision and doctrinal retention.',
  },
  {
    stepNumber: 8,
    key: 'mark_progress',
    title: '8. Mark Progress',
    urduTitle: 'پیش رفت کا اندراج کریں',
    instruction: 'Rate your recall accuracy and advance your memorization status.',
    description: 'Update your personal streak and church spiritual milestone log.',
  },
  {
    stepNumber: 9,
    key: 'schedule_review',
    title: '9. Schedule Review',
    urduTitle: 'دہرائی کا شیڈول طے کریں',
    instruction: 'Queue the verse into the spaced repetition schedule (1, 3, 7, 14, 30+ days).',
    description: 'Guarantees long-term Scripture retention for life.',
  },
];

/**
 * Word Token Interface for Interactive Hide Words and Recall
 */
export interface ScriptureWordToken {
  index: number;
  word: string;
  cleanWord: string;
  isHidden: boolean;
  isRevealed: boolean;
  isKeyWord: boolean;
}

/**
 * 5-Level Memorization Progressive Steps (Phase 5B)
 */
export interface MemorizeLevelDefinition {
  level: number;
  title: string;
  urduTitle: string;
  instruction: string;
  description: string;
}

export const MEMORIZE_PROGRESSIVE_LEVELS: MemorizeLevelDefinition[] = [
  {
    level: 1,
    title: 'Level 1: Full Verse & Phrase Focus',
    urduTitle: 'سطح ۱: مکمل آیت اور عبارت کا جائزہ',
    instruction: 'Read the complete authentic verse phrase by phrase with reverent focus.',
    description: 'Observe word connections and syntactic cadence.',
  },
  {
    level: 2,
    title: 'Level 2: Key Words Highlighted',
    urduTitle: 'سطح ۲: کلیدی الفاظ کو نمایاں کریں',
    instruction: 'Key theological terms are highlighted in amber. Anchor these foundational anchors.',
    description: 'Key anchor points cement structural recall.',
  },
  {
    level: 3,
    title: 'Level 3: Reduced Visual Assistance',
    urduTitle: 'سطح ۳: کنیکٹر الفاظ کی مدھم بصری معاونت',
    instruction: 'Connecting words fade into light opacity. Let your mind supply the transitions.',
    description: 'Bridges between thoughts become active recall points.',
  },
  {
    level: 4,
    title: 'Level 4: Partial Masking',
    urduTitle: 'سطح ۴: منتخب الفاظ چھپائے گئے',
    instruction: 'Half the words are masked with blank underlines. Speak them aloud from memory.',
    description: 'Strengthens neural retrieval pathways.',
  },
  {
    level: 5,
    title: 'Level 5: Full Blind Recall',
    urduTitle: 'سطح ۵: مکمل زبانی تلاوت',
    instruction: 'The verse is completely hidden. Recite the entire Scripture and reference confidently.',
    description: 'Test verbatim accuracy against the authentic WordPocket text.',
  },
];

/**
 * Parses Scripture text into tokens with punctuation separation
 */
export function tokenizeScripture(text: string): ScriptureWordToken[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.map((w, idx) => {
    const cleanWord = w.replace(/[،۔؛:؟!]/g, '').trim();
    // Deterministically mark certain longer words as key words
    const isKeyWord = cleanWord.length >= 4 && (idx % 2 === 1 || cleanWord.includes('خدا') || cleanWord.includes('مسیح') || cleanWord.includes('روح') || cleanWord.includes('کلام') || cleanWord.includes('ایمان'));
    return {
      index: idx,
      word: w,
      cleanWord,
      isHidden: false,
      isRevealed: false,
      isKeyWord,
    };
  });
}

/**
 * Creates tokenized masked state for Hide Words exercise
 */
export function createMaskedTokens(tokens: ScriptureWordToken[], percent: number): ScriptureWordToken[] {
  if (percent <= 0) {
    return tokens.map(t => ({ ...t, isHidden: false, isRevealed: false }));
  }

  const countToHide = Math.min(tokens.length, Math.ceil((tokens.length * percent) / 100));
  const step = Math.max(1, Math.floor(tokens.length / countToHide));
  let hidden = 0;

  return tokens.map((token, i) => {
    const shouldHide = hidden < countToHide && (i % step === 0 || percent >= 95);
    if (shouldHide) {
      hidden++;
      return { ...token, isHidden: true, isRevealed: false };
    }
    return { ...token, isHidden: false, isRevealed: false };
  });
}

/**
 * Word Hiding Helper:
 * Replaces words with blanks/underscores based on mask level (0% to 100%)
 */
export function maskVerseWords(text: string, levelPercent: number): { maskedText: string; hiddenCount: number } {
  const words = text.split(/\s+/);
  if (words.length === 0) return { maskedText: text, hiddenCount: 0 };
  
  if (levelPercent <= 0) return { maskedText: text, hiddenCount: 0 };

  const countToHide = Math.min(words.length, Math.ceil((words.length * levelPercent) / 100));
  
  // Deterministic or indexed hiding: hide every Nth word
  const step = Math.max(1, Math.floor(words.length / countToHide));
  let hidden = 0;

  const masked = words.map((w, i) => {
    if (hidden < countToHide && (i % step === 0 || levelPercent >= 90)) {
      hidden++;
      return '_______';
    }
    return w;
  });

  return {
    maskedText: masked.join(' '),
    hiddenCount: hidden,
  };
}

export const MEMORIZATION_STATUS_META: Record<MemorizationStatus, { label: string; urduLabel: string; color: string; badgeClass: string }> = {
  NOT_STARTED: {
    label: 'Not Started',
    urduLabel: 'شروع نہیں ہوا',
    color: '#64748B',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  LEARNING: {
    label: 'Learning',
    urduLabel: 'سیکھ رہے ہیں',
    color: '#2563EB',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  REVIEWING: {
    label: 'Reviewing',
    urduLabel: 'دہرائی جاری',
    color: '#D97706',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  MEMORIZED: {
    label: 'Memorized',
    urduLabel: 'یاد کر لیا',
    color: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  MASTERED: {
    label: 'Mastered',
    urduLabel: 'کامل یادداشت',
    color: '#7C3AED',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};


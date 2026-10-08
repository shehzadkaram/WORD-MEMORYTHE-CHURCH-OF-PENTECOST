/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Quiz Engine Architecture (Phase 1 Foundation)
 * 
 * Implements Section 15:
 * 1. Multiple choice
 * 2. Missing words
 * 3. Complete verse
 * 4. Bible reference
 * 5. Book identification
 * 6. Chapter identification
 * 7. Meaning-based questions
 */

import { QuizQuestionType, QuizQuestion } from '../types/database';

export interface QuizQuestionTypeDefinition {
  type: QuizQuestionType;
  title: string;
  urduTitle: string;
  description: string;
  samplePrompt: string;
}

export const QUIZ_QUESTION_TYPES: QuizQuestionTypeDefinition[] = [
  {
    type: 'MULTIPLE_CHOICE',
    title: 'Multiple Choice',
    urduTitle: 'کثیر الانتخابی سوالات',
    description: 'Select the exact matching phrase or theological context for the verse.',
    samplePrompt: 'According to Philippians 4:13, who strengthens the believer to do all things?',
  },
  {
    type: 'MISSING_WORDS',
    title: 'Missing Words (Cloze Test)',
    urduTitle: 'خالی جگہیں پُر کریں',
    description: 'Supply the omitted key terms in the Urdu or English Scripture text.',
    samplePrompt: 'جو مجھے _____ بخشتا ہے اُس میں مَیں سب کچھ کر سکتا ہوں۔',
  },
  {
    type: 'COMPLETE_VERSE',
    title: 'Complete Verse',
    urduTitle: 'آیت کو مکمل کریں',
    description: 'Provide or arrange the remaining half of the sacred verse from memory.',
    samplePrompt: 'Complete: "I can do all things through..."',
  },
  {
    type: 'BIBLE_REFERENCE',
    title: 'Bible Reference Test',
    urduTitle: 'بائبل حوالہ کی شناخت',
    description: 'Identify the exact biblical book, chapter, and verse for given Scripture text.',
    samplePrompt: 'Which reference corresponds to "The LORD is my shepherd; I shall not want"?',
  },
  {
    type: 'BOOK_IDENTIFICATION',
    title: 'Book Identification',
    urduTitle: 'کتاب کی شناخت',
    description: 'Identify which Old or New Testament book contains the verse.',
    samplePrompt: 'In which Epistle does Paul write "I can do all things through Christ"?',
  },
  {
    type: 'CHAPTER_IDENTIFICATION',
    title: 'Chapter Identification',
    urduTitle: 'باب کی شناخت',
    description: 'Pinpoint the precise chapter number of the reference.',
    samplePrompt: 'In which chapter of Philippians does verse 13 appear?',
  },
  {
    type: 'MEANING_BASED',
    title: 'Meaning & Biblical Application',
    urduTitle: 'معنی اور عملی اطلاق',
    description: 'Evaluate comprehension of the verse’s biblical message and personal walk.',
    samplePrompt: 'What is the primary spiritual meaning of Paul declaring Christ as our strength?',
  },
];

export const DEMO_SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-demo-1',
    verse_id: 'verse-50-4-13',
    question_type: 'MISSING_WORDS',
    prompt: 'Fill in the blank: "جو مجھے _____ بخشتا ہے اُس میں مَیں سب کچھ کر سکتا ہوں۔"',
    urdu_prompt: 'خالی جگہ پُر کریں: "جو مجھے _____ بخشتا ہے..."',
    options: ['طاقت (Strength)', 'دولت (Wealth)', 'آرام (Rest)', 'شہرت (Fame)'],
    correct_answer: 'طاقت (Strength)',
    explanation: 'فلپیوں 4:13 میں پولس رسول فرماتے ہیں کہ مسیح اُنہیں روحانی طاقت بخشتا ہے۔',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q-demo-2',
    verse_id: 'verse-50-4-13',
    question_type: 'BIBLE_REFERENCE',
    prompt: 'Which reference matches: "I can do all things through Christ who strengthens me"?',
    urdu_prompt: 'یہ آیت کس حوالہ سے ہے؟',
    options: ['Philippians 4:13', 'Ephesians 2:8', 'Romans 8:28', 'Colossians 3:23'],
    correct_answer: 'Philippians 4:13',
    explanation: 'Philippians 4:13 is Apostle Paul’s confession of Christ-centered victory.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'q-demo-3',
    verse_id: 'verse-50-4-13',
    question_type: 'MEANING_BASED',
    prompt: 'What was the historical circumstance when Paul wrote Philippians 4:13?',
    urdu_prompt: 'پولس نے یہ خط کن حالات میں لکھا؟',
    options: [
      'In a Roman prison, yet overflowing with joy and contentment in Christ',
      'In an earthly palace living in luxury',
      'During a time of worldly military conquest',
      'Before he became an apostle'
    ],
    correct_answer: 'In a Roman prison, yet overflowing with joy and contentment in Christ',
    explanation: 'Paul wrote from prison in Rome, demonstrating that God’s strength transcends physical confinement.',
    created_at: '2026-01-01T00:00:00Z',
  }
];

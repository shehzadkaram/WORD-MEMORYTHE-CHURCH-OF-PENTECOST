/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * MEANINGFULNESS SCORING & CONTEXT-AWARE SELECTION ENGINE (Phase 3)
 * Compliant with Sections 7, 8, 9, 10, 11 & 13 of System Architecture
 * 
 * Evaluates candidate Scripture memory items for:
 * 1. Complete thought
 * 2. Contextual integrity
 * 3. Topic relevance
 * 4. Spiritual formation value
 * 5. Memorization suitability
 * 6. Practical relevance
 * 7. Curriculum balance & repetition penalty
 * 
 * CRITICAL SCRIPTURE RULE:
 * This scoring engine NEVER modifies or alters Bible text.
 * It strictly scores candidate suitability for curriculum placement.
 */

import { CurriculumDifficulty, CurriculumSelectionScore } from '../types/database';

export interface ScoringWeights {
  meaningfulness: number;        // default 0.25 (25%)
  contextIntegrity: number;      // default 0.20 (20%)
  topicRelevance: number;        // default 0.15 (15%)
  spiritualImportance: number;   // default 0.15 (15%)
  memorizationSuitability: number;// default 0.10 (10%)
  practicalRelevance: number;    // default 0.10 (10%)
  curriculumBalance: number;     // default 0.05 (5%)
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  meaningfulness: 0.25,
  contextIntegrity: 0.20,
  topicRelevance: 0.15,
  spiritualImportance: 0.15,
  memorizationSuitability: 0.10,
  practicalRelevance: 0.10,
  curriculumBalance: 0.05,
};

export interface CandidateScriptureInput {
  reference: string;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  urduText: string;
  englishText?: string;
  category: string;
  theme: string;
  dayNumber: number;
  existingPlanReferences?: string[];
  existingBookCounts?: Record<string, number>;
}

export class CurriculumScoringService {
  /**
   * Evaluate a candidate Scripture selection and compute multi-criteria score
   */
  public static scoreCandidate(
    input: CandidateScriptureInput,
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
  ): CurriculumSelectionScore {
    const verseCount = input.verseEnd - input.verseStart + 1;
    const wordCount = (input.englishText || input.urduText).split(/\s+/).filter(Boolean).length;
    
    // 1. Complete Thought (0-100)
    // Decreases if verse starts with coordinating conjunctions like "Therefore", "Wherefore", "For" without context
    let completeThought = 85;
    const textLower = (input.englishText || '').toLowerCase().trim();
    if (textLower.startsWith('therefore') || textLower.startsWith('for ') || textLower.startsWith('and ')) {
      // If single verse, incomplete thought penalty
      completeThought = verseCount > 1 ? 88 : 72;
    }
    if (textLower.endsWith(';') || textLower.endsWith(',')) {
      completeThought = verseCount > 1 ? 82 : 65;
    }
    if (verseCount >= 2 && verseCount <= 3) {
      completeThought = Math.min(100, completeThought + 10); // Verse ranges often provide complete thoughts
    }

    // 2. Context Integrity (0-100)
    let contextIntegrity = 90;
    if (verseCount === 1 && (textLower.includes('in that day') || textLower.includes('likewise') || textLower.includes('now concerning'))) {
      contextIntegrity = 70; // Likely isolated dependent clause
    }

    // 3. Topic Relevance (0-100)
    let topicRelevance = 88;
    const themeKeywords = input.theme.toLowerCase().split(/\s+/);
    const hasMatch = themeKeywords.some(kw => textLower.includes(kw));
    if (hasMatch) topicRelevance = 96;

    // 4. Spiritual Importance (0-100)
    // Foundational core truths have high spiritual formation value
    let spiritualImportance = 90;
    if (
      textLower.includes('god') || 
      textLower.includes('lord') || 
      textLower.includes('christ') || 
      textLower.includes('faith') || 
      textLower.includes('love') ||
      input.urduText.includes('خُدا') ||
      input.urduText.includes('یسوع') ||
      input.urduText.includes('محبت')
    ) {
      spiritualImportance = 95;
    }

    // 5. Memorization Suitability (0-100)
    // Ideal memorization length: 15 to 45 words.
    let memorizationSuitability = 85;
    if (wordCount >= 12 && wordCount <= 35) {
      memorizationSuitability = 96; // Perfect bite-sized memory chunk
    } else if (wordCount > 60) {
      memorizationSuitability = 70; // Hard to memorize in one daily sitting
    } else if (wordCount < 8) {
      memorizationSuitability = 80; // Very short
    }

    // 6. Practical Relevance (0-100)
    let practicalRelevance = 88;
    if (
      textLower.includes('do') || 
      textLower.includes('walk') || 
      textLower.includes('pray') || 
      textLower.includes('peace') || 
      textLower.includes('heart') ||
      textLower.includes('serve') ||
      input.urduText.includes('دُعا') ||
      input.urduText.includes('صُلح')
    ) {
      practicalRelevance = 94;
    }

    // 7. Curriculum Balance & Repetition Penalty (0-100)
    let curriculumBalance = 90;
    if (input.existingBookCounts && input.existingBookCounts[input.bookName]) {
      const occurrences = input.existingBookCounts[input.bookName];
      if (occurrences > 15) {
        curriculumBalance -= Math.min(40, (occurrences - 15) * 4); // Book repetition penalty
      }
    }
    if (input.existingPlanReferences && input.existingPlanReferences.includes(input.reference)) {
      curriculumBalance = 0; // Absolute duplicate penalty
    }

    // Compute Weighted Total Score
    const totalScore = Math.round(
      completeThought * weights.meaningfulness +
      contextIntegrity * weights.contextIntegrity +
      topicRelevance * weights.topicRelevance +
      spiritualImportance * weights.spiritualImportance +
      memorizationSuitability * weights.memorizationSuitability +
      practicalRelevance * weights.practicalRelevance +
      curriculumBalance * weights.curriculumBalance
    );

    return {
      totalScore: Math.max(0, Math.min(100, totalScore)),
      completeThought,
      contextIntegrity,
      topicRelevance,
      spiritualImportance,
      memorizationSuitability,
      practicalRelevance,
      curriculumBalance,
    };
  }

  /**
   * Determine Difficulty Level based on length, complexity, and vocabulary
   */
  public static calculateDifficulty(
    verseCount: number,
    text: string,
    dayNumber: number
  ): CurriculumDifficulty {
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Progression principle (Section 14):
    // Days 1-30 are foundational and generally BEGINNER
    // Days 31-180 are INTERMEDIATE
    // Later days or longer passages are ADVANCED
    if (dayNumber <= 30 && wordCount <= 28 && verseCount <= 2) {
      return 'BEGINNER';
    }

    if (verseCount >= 3 || wordCount >= 45) {
      return 'ADVANCED';
    }

    if (wordCount <= 22 && verseCount === 1) {
      return 'BEGINNER';
    }

    return 'INTERMEDIATE';
  }

  /**
   * Detect whether a verse is part of an incomplete thought and suggests verse range
   */
  public static detectIncompleteThought(
    englishText: string,
    verseStart: number,
    verseEnd: number
  ): { isIncomplete: boolean; reason?: string; suggestedRange?: string } {
    if (verseEnd > verseStart) {
      return { isIncomplete: false }; // Already a range
    }

    const trimmed = englishText.trim();
    const lower = trimmed.toLowerCase();

    // Trailing comma or colon or semicolon indicates incomplete sentence
    if (trimmed.endsWith(',') || trimmed.endsWith(';') || trimmed.endsWith(':')) {
      return {
        isIncomplete: true,
        reason: 'Verse ends with trailing punctuation continuing into the next verse.',
        suggestedRange: `${verseStart}-${verseStart + 1}`,
      };
    }

    // Dependent clause beginning
    if (lower.startsWith('therefore,') || lower.startsWith('wherefore') || lower.startsWith('for which cause')) {
      return {
        isIncomplete: true,
        reason: 'Verse opens with a logical conclusion referencing the previous verse context.',
        suggestedRange: `${Math.max(1, verseStart - 1)}-${verseStart}`,
      };
    }

    return { isIncomplete: false };
  }
}

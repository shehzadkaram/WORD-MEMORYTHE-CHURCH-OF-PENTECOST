/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Spaced Repetition Service (Phase 1 Architecture)
 * 
 * Implements Section 14:
 * - Review intervals: 1 day, 3 days, 7 days, 14 days, 30 days, 60 days, 90 days
 * - Stores: previous_review_date, next_review_date, interval_days, accuracy, confidence,
 *   successful_recalls, failed_recalls, review_count
 */

import { ReviewSchedule } from '../types/database';

export const SPACED_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 90] as const;

export type RecallQuality = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface ReviewFeedback {
  quality: RecallQuality;
  confidence: number; // 1 to 5
  accuracy: number; // 0 to 100
}

export class SpacedRepetitionService {
  /**
   * Maps interval days to 1-7 review stage numbers
   */
  public static getStageForInterval(intervalDays: number): number {
    const idx = SPACED_INTERVALS_DAYS.indexOf(intervalDays as typeof SPACED_INTERVALS_DAYS[number]);
    return idx === -1 ? 1 : idx + 1;
  }

  /**
   * Maps 1-7 review stage numbers to interval days
   */
  public static getIntervalForStage(stage: number): number {
    const clamped = Math.max(1, Math.min(stage, SPACED_INTERVALS_DAYS.length));
    return SPACED_INTERVALS_DAYS[clamped - 1];
  }

  /**
   * Categorizes a review's due date relative to today
   */
  public static categorizeReviewDate(nextReviewDateStr: string): 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'LATER' {
    const today = new Date().toISOString().split('T')[0];
    if (nextReviewDateStr < today) return 'OVERDUE';
    if (nextReviewDateStr === today) return 'TODAY';

    const tDate = new Date(today);
    const rDate = new Date(nextReviewDateStr);
    const diffDays = Math.round((rDate.getTime() - tDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) return 'TOMORROW';
    if (diffDays <= 7) return 'NEXT_7_DAYS';
    return 'LATER';
  }

  /**
   * Calculates the next review date and interval based on user recall feedback
   */
  public static calculateNextReview(
    currentSchedule: ReviewSchedule,
    feedback: ReviewFeedback
  ): Partial<ReviewSchedule> {
    const today = new Date().toISOString().split('T')[0];
    const currentIndex = SPACED_INTERVALS_DAYS.indexOf(
      currentSchedule.interval_days as typeof SPACED_INTERVALS_DAYS[number]
    );

    let nextIntervalDays: number;
    let successfulIncrement = 0;
    let failedIncrement = 0;

    switch (feedback.quality) {
      case 'AGAIN':
        // Reset to initial 1-day interval
        nextIntervalDays = 1;
        failedIncrement = 1;
        break;

      case 'HARD':
        // Keep current interval or advance minimally
        nextIntervalDays = currentSchedule.interval_days;
        successfulIncrement = 1;
        break;

      case 'GOOD':
        // Advance to next interval step
        if (currentIndex === -1 || currentIndex >= SPACED_INTERVALS_DAYS.length - 1) {
          nextIntervalDays = 90;
        } else {
          nextIntervalDays = SPACED_INTERVALS_DAYS[currentIndex + 1];
        }
        successfulIncrement = 1;
        break;

      case 'EASY':
        // Advance by two steps if possible
        if (currentIndex === -1 || currentIndex >= SPACED_INTERVALS_DAYS.length - 2) {
          nextIntervalDays = 90;
        } else {
          nextIntervalDays = SPACED_INTERVALS_DAYS[currentIndex + 2];
        }
        successfulIncrement = 1;
        break;
    }

    const nextDateObj = new Date();
    nextDateObj.setDate(nextDateObj.getDate() + nextIntervalDays);
    const nextDate = nextDateObj.toISOString().split('T')[0];

    return {
      previous_review_date: today,
      next_review_date: nextDate,
      interval_days: nextIntervalDays,
      review_stage: SpacedRepetitionService.getStageForInterval(nextIntervalDays),
      accuracy: feedback.accuracy,
      confidence: feedback.confidence,
      successful_recalls: (currentSchedule.successful_recalls || 0) + successfulIncrement,
      failed_recalls: (currentSchedule.failed_recalls || 0) + failedIncrement,
      review_count: (currentSchedule.review_count || 0) + 1,
      is_due: false,
      completion_status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      last_result: feedback.quality,
      updated_at: new Date().toISOString(),
    };
  }
}

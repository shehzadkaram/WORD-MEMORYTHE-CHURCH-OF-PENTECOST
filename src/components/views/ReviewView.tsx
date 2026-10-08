import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Eye,
  Check,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  AlertCircle,
  History,
  BookOpen
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { 
  SpacedRepetitionService, 
  RecallQuality, 
  SPACED_INTERVALS_DAYS, 
  ReviewFeedback 
} from '../../services/spacedRepetitionService';
import { ReviewSchedule, Verse } from '../../types/database';
import { AppSection } from '../../types/navigation';
import { StatusBadge } from '../common/StatusBadge';

interface ReviewViewProps {
  onNavigate: (section: AppSection) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState<ReviewSchedule[]>(() => dbService.getReviewSchedules());
  const [activeTab, setActiveTab] = useState<'DUE' | 'UPCOMING' | 'HISTORY'>('DUE');
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const refreshSchedules = () => {
    const updated = dbService.getReviewSchedules();
    setSchedules(updated);
  };

  const dueItems = dbService.getDueReviews();
  const upcomingGrouped = dbService.getUpcomingReviewsGrouped();
  const completedItems = dbService.getRecentlyCompletedReviews();
  const stats = dbService.getMemberStats();

  // Guard active review index
  const safeReviewIndex = Math.min(activeReviewIndex, Math.max(0, dueItems.length - 1));
  const currentSchedule = dueItems[safeReviewIndex] || null;

  // Resolve authentic scripture text for the active review
  const resolveVerse = (schedule: ReviewSchedule | null): {
    reference: string;
    book_name_urdu: string;
    original_text: string;
    english_text: string;
  } | null => {
    if (!schedule) return null;

    // Direct verse lookup
    if (schedule.verse_id) {
      const v = dbService.getVerseById(schedule.verse_id);
      if (v) {
        return {
          reference: v.reference,
          book_name_urdu: v.book_name_urdu,
          original_text: v.original_text,
          english_text: v.english_text || '',
        };
      }
    }

    // Curriculum day lookup
    if (schedule.curriculum_day_id) {
      const day = dbService.getCurriculumDayByNumber(schedule.curriculum_day_id);
      if (day) {
        return {
          reference: day.scripture_reference,
          book_name_urdu: day.book_name_urdu,
          original_text: day.original_urdu_text,
          english_text: day.english_text || '',
        };
      }
    }

    // Reference fallback
    return {
      reference: schedule.verse_reference || 'Scripture Verse',
      book_name_urdu: '',
      original_text: '',
      english_text: '',
    };
  };

  const activeVerse = resolveVerse(currentSchedule);

  const handleRateRecall = (quality: RecallQuality) => {
    if (!currentSchedule) return;

    // Day 21 Protection check
    if (currentSchedule.curriculum_day_id === 21 || currentSchedule.verse_id === 'verse-1-1-21') {
      return;
    }

    const confidenceMap: Record<RecallQuality, number> = {
      AGAIN: 1,
      HARD: 2,
      GOOD: 4,
      EASY: 5,
    };

    const accuracyMap: Record<RecallQuality, number> = {
      AGAIN: 40,
      HARD: 75,
      GOOD: 95,
      EASY: 100,
    };

    const feedback: ReviewFeedback = {
      quality,
      confidence: confidenceMap[quality],
      accuracy: accuracyMap[quality],
    };

    // Save and compute next review via database service
    const result = dbService.completeReview(currentSchedule.id, feedback);

    if (result) {
      const { updatedSchedule, memorizationStatus } = result;
      refreshSchedules();
      setShowAnswer(false);
      
      const intervalLabel = `${updatedSchedule.interval_days} ${updatedSchedule.interval_days === 1 ? 'day' : 'days'}`;
      setFeedbackSuccess(
        `Recall recorded (${quality})! Next review scheduled for ${updatedSchedule.next_review_date} (+${intervalLabel}, Stage ${updatedSchedule.review_stage}/7). Memorization status: ${memorizationStatus}.`
      );

      // Keep index in bound
      if (safeReviewIndex >= dueItems.length - 1) {
        setActiveReviewIndex(0);
      }
    }

    setTimeout(() => setFeedbackSuccess(null), 4500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. Header & Official Spaced Repetition Identity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#0B2545] text-amber-400 rounded-xl shadow-xs">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  The Church of Pentecost, Dubai • Section 14
                </span>
                <span className="text-xs font-mono text-slate-400">• Phase 5C</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Scripture Retention & Review Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Pakistani & Indian Worship Centre — 7-Stage Spaced Repetition (+1d, +3d, +7d, +14d, +30d, +60d, +90d)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{dueItems.length} Due for Review Today</span>
            </div>
          </div>
        </div>

        {/* 7-Interval Progression Legend */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Biblical Memory Retention Intervals (7 Stages):</span>
            <span className="text-[11px] text-slate-500 font-mono">1, 3, 7, 14, 30, 60, 90 Days</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {SPACED_INTERVALS_DAYS.map((days, idx) => (
              <div
                key={days}
                className="p-2 rounded-lg text-center border bg-white border-slate-200 shadow-2xs"
              >
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Stage {idx + 1}
                </span>
                <span className="text-xs font-mono font-black text-[#0B2545]">
                  +{days}{days === 1 ? ' day' : ' days'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => { setActiveTab('DUE'); setShowAnswer(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'DUE'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Due for Review</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'DUE' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {dueItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'UPCOMING'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming Queue</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({upcomingGrouped.tomorrow.length + upcomingGrouped.next7Days.length + upcomingGrouped.later.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Review History</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({completedItems.length})
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {feedbackSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-2xs">
          <div className="p-1.5 bg-emerald-200 rounded-lg text-emerald-800 flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="leading-relaxed">{feedbackSuccess}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DUE FOR REVIEW TODAY */}
      {/* ========================================================================= */}
      {activeTab === 'DUE' && (
        <>
          {currentSchedule && activeVerse ? (
            <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Card Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3.5 py-1 bg-[#0B2545] text-amber-400 font-black text-sm rounded-lg shadow-2xs">
                    {activeVerse.reference}
                  </span>
                  <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Interval: {currentSchedule.interval_days} {currentSchedule.interval_days === 1 ? 'Day' : 'Days'}
                  </span>
                  <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                    Stage {currentSchedule.review_stage || SpacedRepetitionService.getStageForInterval(currentSchedule.interval_days)} / 7
                  </span>
                  <StatusBadge status="REVIEWING" size="sm" />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                  <span>Review Item {safeReviewIndex + 1} of {dueItems.length}</span>
                  <span className="text-slate-300">•</span>
                  <span>Recalls: {currentSchedule.successful_recalls || 0}</span>
                </div>
              </div>

              {/* Prompt Section */}
              <div className="text-center py-4 space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                  Spaced Repetition Recall Prompt
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Recite {activeVerse.reference}
                </h2>
                {activeVerse.book_name_urdu && (
                  <p className="font-urdu text-lg text-amber-800">
                    {activeVerse.book_name_urdu}
                  </p>
                )}
                <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed pt-1">
                  Speak or mentally recite the full Urdu and English verse from memory before clicking to reveal the Scripture and grade your recall accuracy.
                </p>
              </div>

              {/* Answer Reveal Panel */}
              {showAnswer ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Authentic Urdu Text */}
                  {activeVerse.original_text && (
                    <div className="bg-amber-50/70 p-6 sm:p-7 rounded-2xl border border-amber-300 text-right space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase font-sans border-b border-amber-200 pb-2">
                        <span>اصل اردو بائبل متن (WordPocket)</span>
                        <span className="font-mono text-xs">{activeVerse.reference}</span>
                      </div>
                      <p className="font-urdu text-2xl sm:text-3xl text-slate-900 leading-loose py-2">
                        {activeVerse.original_text}
                      </p>
                    </div>
                  )}

                  {/* Authentic English Text */}
                  {activeVerse.english_text && (
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        English Translation
                      </span>
                      <p className="font-serif italic text-base sm:text-lg text-slate-800 leading-relaxed">
                        "{activeVerse.english_text}"
                      </p>
                    </div>
                  )}

                  {/* 4 Recall Grading Options */}
                  <div className="pt-2 space-y-3">
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Rate Your Recall Accuracy (Spaced Repetition Feedback)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Select honestly to adjust the next review interval appropriately:
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleRateRecall('AGAIN')}
                        className="p-3.5 rounded-xl border-2 border-red-200 bg-red-50/80 hover:bg-red-100 text-red-900 text-center transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="font-extrabold text-sm block">Again</span>
                        <span className="text-[11px] text-red-700 font-bold block mt-0.5">Reset to 1 Day</span>
                        <span className="text-[10px] text-red-600 font-medium">Stage 1 • Difficult recall</span>
                      </button>

                      <button
                        onClick={() => handleRateRecall('HARD')}
                        className="p-3.5 rounded-xl border-2 border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-center transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="font-extrabold text-sm block">Hard</span>
                        <span className="text-[11px] text-amber-800 font-bold block mt-0.5">Keep {currentSchedule.interval_days} Days</span>
                        <span className="text-[10px] text-amber-700 font-medium">Repeat current interval</span>
                      </button>

                      <button
                        onClick={() => handleRateRecall('GOOD')}
                        className="p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-900 text-center transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="font-extrabold text-sm block">Good</span>
                        <span className="text-[11px] text-blue-800 font-bold block mt-0.5">Advance Interval</span>
                        <span className="text-[10px] text-blue-700 font-medium">+1 interval step</span>
                      </button>

                      <button
                        onClick={() => handleRateRecall('EASY')}
                        className="p-3.5 rounded-xl border-2 border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-center transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="font-extrabold text-sm block">Easy</span>
                        <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">+2 Interval Steps</span>
                        <span className="text-[10px] text-emerald-700 font-medium">Effortless recall</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Reveal Scripture & Check Recall</span>
                  </button>

                  {dueItems.length > 1 && (
                    <button
                      onClick={() => {
                        setActiveReviewIndex((prev) => (prev + 1) % dueItems.length);
                        setShowAnswer(false);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                    >
                      <span>Skip to Next Due Verse</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* All Due Reviews Completed State */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  All Due Reviews are Up to Date!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Praise God! You have reviewed all Scripture verses currently scheduled for today. New review intervals will trigger automatically based on the spaced repetition schedule.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap justify-center items-center gap-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133E87] shadow-sm transition-all"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('UPCOMING')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  View Upcoming Queue
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPCOMING REVIEW SCHEDULE QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-6">
          
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Today</span>
              <div className="text-xl font-black text-amber-700 mt-1">{upcomingGrouped.today.length}</div>
              <span className="text-[10px] text-slate-400">Due for review</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Tomorrow</span>
              <div className="text-xl font-black text-blue-800 mt-1">{upcomingGrouped.tomorrow.length}</div>
              <span className="text-[10px] text-slate-400">+1 day step</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Next 7 Days</span>
              <div className="text-xl font-black text-purple-800 mt-1">{upcomingGrouped.next7Days.length}</div>
              <span className="text-[10px] text-slate-400">+3d / +7d stage</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Later (14–90d)</span>
              <div className="text-xl font-black text-emerald-800 mt-1">{upcomingGrouped.later.length}</div>
              <span className="text-[10px] text-slate-400">Long-term retention</span>
            </div>
          </div>

          {/* Group: Tomorrow */}
          {upcomingGrouped.tomorrow.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Tomorrow
                </span>
                <span className="text-xs font-mono text-slate-400">{upcomingGrouped.tomorrow.length} verses</span>
              </div>
              <div className="space-y-2">
                {upcomingGrouped.tomorrow.map((item) => {
                  const v = resolveVerse(item);
                  return (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{v?.reference}</div>
                        <div className="text-[11px] text-slate-500">Interval: {item.interval_days} days • Stage {item.review_stage || 1}/7</div>
                      </div>
                      <div className="text-right text-xs font-mono text-slate-600">
                        {item.next_review_date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group: Next 7 Days */}
          {upcomingGrouped.next7Days.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due in 2 to 7 Days
                </span>
                <span className="text-xs font-mono text-slate-400">{upcomingGrouped.next7Days.length} verses</span>
              </div>
              <div className="space-y-2">
                {upcomingGrouped.next7Days.map((item) => {
                  const v = resolveVerse(item);
                  return (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{v?.reference}</div>
                        <div className="text-[11px] text-slate-500">Interval: {item.interval_days} days • Stage {item.review_stage || 1}/7</div>
                      </div>
                      <div className="text-right text-xs font-mono text-slate-600">
                        {item.next_review_date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group: Later (14 to 90 Days) */}
          {upcomingGrouped.later.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Long-Term Spaced Retention (14, 30, 60, 90 Days)
                </span>
                <span className="text-xs font-mono text-slate-400">{upcomingGrouped.later.length} verses</span>
              </div>
              <div className="space-y-2">
                {upcomingGrouped.later.map((item) => {
                  const v = resolveVerse(item);
                  return (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{v?.reference}</div>
                        <div className="text-[11px] text-slate-500">Interval: {item.interval_days} days • Stage {item.review_stage || 1}/7</div>
                      </div>
                      <div className="text-right text-xs font-mono text-slate-600">
                        {item.next_review_date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingGrouped.tomorrow.length === 0 && upcomingGrouped.next7Days.length === 0 && upcomingGrouped.later.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No upcoming verses currently in the queue. Memorize new verses from the 365-Day curriculum to add them to your spaced repetition schedule.
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REVIEW HISTORY & COMPLETED LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Spaced Review History & Milestones</span>
              </h3>
              <p className="text-xs text-slate-500">
                Logged recall attempts and interval advancements for your spiritual growth
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#0B2545]">
                {stats.reviewCompletionRate}% Completion Rate
              </span>
            </div>
          </div>

          {completedItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {completedItems.map((item) => {
                const v = resolveVerse(item);
                return (
                  <div key={item.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {v?.reference}
                        </span>
                        {item.last_result && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.last_result === 'EASY' ? 'bg-emerald-100 text-emerald-800' :
                            item.last_result === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                            item.last_result === 'HARD' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.last_result}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          Stage {item.review_stage || SpacedRepetitionService.getStageForInterval(item.interval_days)}/7
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-0.5 flex items-center gap-3">
                        <span>Current Interval: {item.interval_days} Days</span>
                        <span>•</span>
                        <span>Accuracy: {item.accuracy}%</span>
                        <span>•</span>
                        <span>Total Reviews: {item.review_count}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Next: {item.next_review_date}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        Spaced Cycle Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No completed reviews recorded yet. Rate your first recall above to start tracking review history!
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Volume2, 
  Sparkles, 
  Check, 
  RotateCcw,
  Calendar,
  ShieldCheck,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  ThumbsUp,
  Star,
  Layers,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  RefreshCw,
  Share2,
  MessageSquare
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { 
  DAILY_SESSION_STEPS, 
  MEMORIZE_PROGRESSIVE_LEVELS, 
  tokenizeScripture, 
  createMaskedTokens, 
  ScriptureWordToken,
  MEMORIZATION_STATUS_META
} from '../../services/memorizationEngine';
import { QuizGeneratorService, WordOrderToken } from '../../services/quizGenerator';
import { AppSection } from '../../types/navigation';
import { StatusBadge } from '../common/StatusBadge';
import { CurriculumDay, MemorizationStatus, QuizQuestion, AISupportingContentItem } from '../../types/database';

interface MemorizeViewProps {
  onNavigate: (section: AppSection) => void;
  onCompleteSession?: () => void;
  initialDayNumber?: number;
}

export const MemorizeView: React.FC<MemorizeViewProps> = ({
  onNavigate,
  onCompleteSession,
  initialDayNumber,
}) => {
  const allCurriculumDays = useMemo(() => dbService.getAllCurriculumDays(), []);
  
  // Day selection (defaults to initialDayNumber or today's curriculum day)
  const defaultDayNumber = initialDayNumber || dbService.getTodaysCurriculumDay().day.day_number;
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(defaultDayNumber);

  // Sync if initialDayNumber changes from navigation
  useEffect(() => {
    if (initialDayNumber) {
      setSelectedDayNumber(initialDayNumber);
    }
  }, [initialDayNumber]);

  const activeDay: CurriculumDay | undefined = useMemo(() => {
    return allCurriculumDays.find(d => d.day_number === selectedDayNumber) || allCurriculumDays[0];
  }, [allCurriculumDays, selectedDayNumber]);

  const isDay21Pending = activeDay?.status === 'NEEDS_SCRIPTURE_DATA';

  // 9-Step Flow State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [sessionFinished, setSessionFinished] = useState(false);

  // Read Aloud State
  const [readAloudCount, setReadAloudCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Memorize Step State (5 levels)
  const [memorizeLevel, setMemorizeLevel] = useState<number>(1);
  const [practiceSessionCount, setPracticeSessionCount] = useState<number>(1);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Hide Words State (tokens, difficulty, interactive peek)
  const [hideLevelPercent, setHideLevelPercent] = useState<number>(40);
  const [wordTokens, setWordTokens] = useState<ScriptureWordToken[]>([]);

  // Recall Step State
  const [recallTokens, setRecallTokens] = useState<ScriptureWordToken[]>([]);
  const [recallRevealedCount, setRecallRevealedCount] = useState<number>(0);
  const [recallAccuracyRating, setRecallAccuracyRating] = useState<number>(100);

  // Quiz Step State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswerSubmitted, setQuizAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Word Order Quiz State
  const [scrambledTokens, setScrambledTokens] = useState<WordOrderToken[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<WordOrderToken[]>([]);
  const [wordOrderValidated, setWordOrderValidated] = useState<boolean | null>(null);

  // Mark Progress Step State
  const [selectedStatus, setSelectedStatus] = useState<MemorizationStatus>('LEARNING');
  const [confidenceStars, setConfidenceStars] = useState<number>(4);
  const [progressSaved, setProgressSaved] = useState(false);
  const [memberSupportingContent, setMemberSupportingContent] = useState<AISupportingContentItem[]>([]);

  // Load verse tokens when active day changes
  useEffect(() => {
    if (activeDay) {
      setMemberSupportingContent(dbService.getMemberVisibleSupportingContent(activeDay.day_number));
    }
    if (activeDay && !isDay21Pending) {
      const tokens = tokenizeScripture(activeDay.original_urdu_text);
      const masked = createMaskedTokens(tokens, hideLevelPercent);
      setWordTokens(masked);

      // Recall tokens start 100% hidden
      const fullyMasked = createMaskedTokens(tokens, 100);
      setRecallTokens(fullyMasked);
      setRecallRevealedCount(0);

      // Generate quizzes
      const generatedQuizzes = QuizGeneratorService.generateQuizForDay(activeDay, allCurriculumDays);
      setQuizQuestions(generatedQuizzes);
      setCurrentQuizIndex(0);
      setSelectedQuizOption(null);
      setQuizAnswerSubmitted(false);

      // Word order scramble
      const scramble = QuizGeneratorService.generateWordOrderTokens(activeDay.original_urdu_text);
      setScrambledTokens(scramble.tokens);
      setAssembledTokens([]);
      setWordOrderValidated(null);

      // Existing memorization record
      const existingMem = dbService.getMemorizationRecordByDayNumber(activeDay.day_number);
      if (existingMem) {
        setSelectedStatus(existingMem.status);
        setConfidenceStars(existingMem.confidence_level || 4);
      } else {
        setSelectedStatus('LEARNING');
        setConfidenceStars(4);
      }

      // Existing daily session
      const existingSession = dbService.getDailySession(activeDay.id);
      if (existingSession) {
        const completedMap: Record<number, boolean> = {};
        if (existingSession.step_completed.read_verse) completedMap[1] = true;
        if (existingSession.step_completed.understand_meaning) completedMap[2] = true;
        if (existingSession.step_completed.read_aloud) completedMap[3] = true;
        if (existingSession.step_completed.memorize) completedMap[4] = true;
        if (existingSession.step_completed.hide_words) completedMap[5] = true;
        if (existingSession.step_completed.recall) completedMap[6] = true;
        if (existingSession.step_completed.quiz) completedMap[7] = true;
        if (existingSession.step_completed.mark_progress) completedMap[8] = true;
        if (existingSession.step_completed.schedule_review) completedMap[9] = true;
        setCompletedSteps(completedMap);
      }
    }
  }, [activeDay, isDay21Pending, hideLevelPercent, allCurriculumDays]);

  // Practice Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = DAILY_SESSION_STEPS[currentStepIndex];

  // Advance step
  const handleAdvanceStep = () => {
    setCompletedSteps(prev => ({ ...prev, [currentStep.stepNumber]: true }));

    // Save session checkpoint
    if (activeDay) {
      const todayStr = new Date().toISOString().split('T')[0];
      const stepKey = currentStep.key;
      const existing = dbService.getDailySession(activeDay.id, todayStr);

      dbService.saveDailySession({
        id: existing?.id || `session-${activeDay.id}-${todayStr}`,
        user_id: 'demo-user-member',
        verse_id: activeDay.verse_ids[0] || activeDay.id,
        session_date: todayStr,
        current_step: currentStepIndex + 2,
        step_completed: {
          read_verse: currentStepIndex >= 0 || !!existing?.step_completed.read_verse,
          understand_meaning: currentStepIndex >= 1 || !!existing?.step_completed.understand_meaning,
          read_aloud: currentStepIndex >= 2 || !!existing?.step_completed.read_aloud,
          memorize: currentStepIndex >= 3 || !!existing?.step_completed.memorize,
          hide_words: currentStepIndex >= 4 || !!existing?.step_completed.hide_words,
          recall: currentStepIndex >= 5 || !!existing?.step_completed.recall,
          quiz: currentStepIndex >= 6 || !!existing?.step_completed.quiz,
          mark_progress: currentStepIndex >= 7 || !!existing?.step_completed.mark_progress,
          schedule_review: currentStepIndex >= 8 || !!existing?.step_completed.schedule_review,
        },
        duration_minutes: Math.ceil(secondsElapsed / 60),
        completed: currentStepIndex === DAILY_SESSION_STEPS.length - 1,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (currentStepIndex < DAILY_SESSION_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setSessionFinished(true);
      onCompleteSession?.();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Audio simulation
  const handleReadAloudAudio = () => {
    setIsPlayingAudio(true);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeDay?.english_text || '');
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 2500);
      }
    } catch {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  const handleIncrementReadAloud = () => {
    setReadAloudCount(prev => Math.min(5, prev + 1));
  };

  // Interactive Peek in Hide Words
  const handleTogglePeekWord = (index: number) => {
    setWordTokens(prev => prev.map(t => {
      if (t.index === index) {
        return { ...t, isRevealed: !t.isRevealed };
      }
      return t;
    }));
  };

  const handleRevealAllHideWords = () => {
    setWordTokens(prev => prev.map(t => ({ ...t, isRevealed: true })));
  };

  const handleResetHideWords = () => {
    if (activeDay) {
      const tokens = tokenizeScripture(activeDay.original_urdu_text);
      const masked = createMaskedTokens(tokens, hideLevelPercent);
      setWordTokens(masked);
    }
  };

  // Progressive Recall
  const handleRevealOneWord = () => {
    setRecallTokens(prev => {
      const nextHiddenIdx = prev.findIndex(t => t.isHidden && !t.isRevealed);
      if (nextHiddenIdx >= 0) {
        setRecallRevealedCount(c => c + 1);
        return prev.map((t, i) => i === nextHiddenIdx ? { ...t, isRevealed: true } : t);
      }
      return prev;
    });
  };

  const handleRevealPhraseSection = () => {
    setRecallTokens(prev => {
      let revealedInBatch = 0;
      return prev.map(t => {
        if (t.isHidden && !t.isRevealed && revealedInBatch < 3) {
          revealedInBatch++;
          return { ...t, isRevealed: true };
        }
        return t;
      });
    });
    setRecallRevealedCount(c => c + 3);
  };

  const handleRevealAllRecall = () => {
    setRecallTokens(prev => prev.map(t => ({ ...t, isRevealed: true })));
  };

  const handleRestartRecall = () => {
    if (activeDay) {
      const tokens = tokenizeScripture(activeDay.original_urdu_text);
      setRecallTokens(createMaskedTokens(tokens, 100));
      setRecallRevealedCount(0);
    }
  };

  // Word Order Scramble Handlers
  const handleSelectScrambledToken = (token: WordOrderToken) => {
    setScrambledTokens(prev => prev.filter(t => t.id !== token.id));
    setAssembledTokens(prev => [...prev, token]);
  };

  const handleRemoveAssembledToken = (token: WordOrderToken) => {
    setAssembledTokens(prev => prev.filter(t => t.id !== token.id));
    setScrambledTokens(prev => [...prev, token]);
  };

  const handleValidateWordOrder = () => {
    const isCorrect = assembledTokens.every((t, i) => t.originalIndex === i);
    setWordOrderValidated(isCorrect);
  };

  // Quiz Option Selection & Submit
  const currentQuizQ: QuizQuestion | undefined = quizQuestions[currentQuizIndex];

  const handleSelectQuizOption = (opt: string) => {
    if (quizAnswerSubmitted) return;
    setSelectedQuizOption(opt);
  };

  const handleSubmitQuizAnswer = () => {
    if (!selectedQuizOption || !currentQuizQ || !activeDay) return;
    setQuizAnswerSubmitted(true);
    const isCorrect = selectedQuizOption === currentQuizQ.correct_answer;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    // Save attempt
    dbService.saveQuizAttempt({
      user_id: 'demo-user-member',
      verse_id: activeDay.verse_ids[0] || activeDay.id,
      score: isCorrect ? 1 : 0,
      total_questions: 1,
      time_taken_seconds: 15,
      completed_at: new Date().toISOString(),
    });
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedQuizOption(null);
      setQuizAnswerSubmitted(false);
    }
  };

  // Save Progress Handler
  const handleSaveProgress = () => {
    if (!activeDay) return;
    const verseId = activeDay.verse_ids[0] || activeDay.id;
    dbService.updateMemorizationStatus(
      verseId, 
      selectedStatus, 
      selectedStatus === 'MEMORIZED' || selectedStatus === 'MASTERED' ? 98 : 85,
      confidenceStars
    );
    setProgressSaved(true);
    setTimeout(() => setProgressSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header with Day Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B2545] text-amber-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  Day {activeDay?.day_number || selectedDayNumber} of 365
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {activeDay?.theme}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {activeDay?.scripture_reference} • {activeDay?.book_name_urdu} {activeDay?.chapter_number}
              </h2>
            </div>
          </div>

          {/* Prev / Next Day Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedDayNumber > 1) {
                  setSelectedDayNumber(prev => prev - 1);
                  setCurrentStepIndex(0);
                }
              }}
              disabled={selectedDayNumber <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Day {selectedDayNumber - 1}</span>
            </button>

            <select
              value={selectedDayNumber}
              onChange={(e) => {
                setSelectedDayNumber(Number(e.target.value));
                setCurrentStepIndex(0);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B2545]"
            >
              {allCurriculumDays.map(d => (
                <option key={d.day_number} value={d.day_number}>
                  Day {d.day_number}: {d.scripture_reference} {d.status === 'NEEDS_SCRIPTURE_DATA' ? '⚠️ [Pending]' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (selectedDayNumber < 365) {
                  setSelectedDayNumber(prev => prev + 1);
                  setCurrentStepIndex(0);
                }
              }}
              disabled={selectedDayNumber >= 365}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition-colors"
            >
              <span>Day {selectedDayNumber + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Category:</span>
            <span className="font-semibold text-slate-800">{activeDay?.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Testament:</span>
            <span className="font-semibold text-slate-800">{activeDay?.testament}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Difficulty:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              {activeDay?.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Practice Session: #{practiceSessionCount}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono">
              Timer: {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* DAY 21 SPECIAL INTEGRITY SHIELD */}
      {isDay21Pending ? (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-400 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center mx-auto text-amber-900">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-amber-950">
              Day 21 — Genesis 1:21: Scripture Import Pending
            </h3>
            <p className="text-sm text-amber-900 leading-relaxed">
              This specific daily portion is currently awaiting canonical Urdu text verification from the official WordPocket Urdu Bible database.
            </p>
            <p className="text-xs text-amber-800 font-medium">
              In accordance with church scripture integrity protocols, unverified text will never be substituted or generated by AI. Please continue your memorization journey with Day 22.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedDayNumber(22);
                setCurrentStepIndex(0);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-sm font-bold shadow-md transition-all"
            >
              <span>Continue with Day 22 (Genesis 1:27)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      ) : activeDay ? (
        <>
          {/* 9-Step Interactive Stepper Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold text-slate-700">Member Memorization Journey</span>
              <span>Step {currentStep.stepNumber} of 9: {currentStep.title}</span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-center justify-between min-w-[700px] gap-1.5">
                {DAILY_SESSION_STEPS.map((s, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isDone = completedSteps[s.stepNumber];
                  return (
                    <button
                      key={s.stepNumber}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`flex-1 flex flex-col items-center py-2 px-1.5 rounded-xl text-center transition-all border ${
                        isActive
                          ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs ring-2 ring-amber-400'
                          : isDone
                          ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-black" />
                        ) : (
                          <span className="text-[11px] font-mono font-black">{s.stepNumber}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[76px] mt-0.5">
                        {s.title.replace(/^\d+\.\s*/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Step Content Card */}
          <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Step Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-[#0B2545] text-amber-400 font-black text-xs font-mono">
                    STEP {currentStep.stepNumber}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {currentStep.title}
                  </h3>
                  <span className="font-urdu text-base text-amber-700 font-bold">
                    {currentStep.urduTitle}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {currentStep.instruction}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReadAloudAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>{isPlayingAudio ? 'Speaking...' : 'Listen Audio'}</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 1: READ VERSE */}
            {/* ========================================================================= */}
            {currentStepIndex === 0 && (
              <div className="space-y-6">
                {/* Authentic WordPocket Urdu Display Card */}
                <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/30 rounded-2xl p-6 sm:p-8 border border-amber-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 text-xs text-amber-900">
                    <span className="font-sans font-bold uppercase tracking-wider">
                      اردو بائبل کا اصل متن (WordPocket Authentic Urdu Scripture)
                    </span>
                    <span className="font-mono text-[11px] bg-amber-200/60 px-2 py-0.5 rounded">
                      Verified Canonical Text
                    </span>
                  </div>

                  <p 
                    dir="rtl"
                    className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose sm:leading-loose text-right tracking-normal py-4 select-text"
                  >
                    {activeDay.original_urdu_text}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-amber-200/60 text-xs text-amber-900">
                    <span className="font-sans font-medium text-[11px]">
                      Source: {activeDay.source_name}
                    </span>
                    <span className="font-urdu font-bold text-base text-[#0B2545]">
                      {activeDay.book_name_urdu} {activeDay.chapter_number}:{activeDay.verse_start}
                      {activeDay.verse_end > activeDay.verse_start ? `-${activeDay.verse_end}` : ''}
                    </span>
                  </div>
                </div>

                {/* English Translation */}
                {activeDay.english_text && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      English Scripture (KJV / NKJV)
                    </span>
                    <p className="text-base sm:text-lg font-serif italic text-slate-900 leading-relaxed">
                      "{activeDay.english_text}"
                    </p>
                    <span className="text-xs text-slate-500 block pt-1">
                      {activeDay.scripture_reference}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: UNDERSTAND MEANING */}
            {/* ========================================================================= */}
            {currentStepIndex === 1 && (
              <div className="space-y-5">
                {/* Scripture Reference Banner */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 uppercase">Scripture Anchor:</span>
                    <h4 className="text-base font-extrabold text-slate-900">{activeDay.scripture_reference}</h4>
                  </div>
                  <p dir="rtl" className="font-urdu text-lg text-slate-800 max-w-md text-right truncate">
                    {activeDay.original_urdu_text}
                  </p>
                </div>

                {activeDay.explanation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Doctrinal Context */}
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2">
                        <ShieldCheck className="w-4 h-4 text-[#0B2545]" />
                        <span>Biblical Explanation & Theological Truth</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {activeDay.explanation}
                      </p>
                    </div>

                    {/* Practical Life Application */}
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span>Living the Word in Dubai</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {activeDay.application}
                      </p>
                    </div>

                    {/* Dedicated Prayer Guidance */}
                    <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 md:col-span-2">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                        Spiritual Prayer (دعا):
                      </span>
                      <p dir="rtl" className="font-urdu text-lg text-slate-900 text-right leading-loose">
                        {activeDay.prayer}
                      </p>
                      {activeDay.memory_tip && (
                        <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-600">
                          <span className="font-bold text-amber-900">Memorization Tip: </span>
                          <span>{activeDay.memory_tip}</span>
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Approved discipleship explanation is currently under pastoral review for Day {activeDay.day_number}.
                    </p>
                    <p className="text-xs text-slate-500">
                      The sacred Scripture text above remains completely authentic and ready for your memorization.
                    </p>
                  </div>
                )}

                {/* Pastoral Supporting Content (Thematic Summaries, Reflection Questions, Prayer Prompts, Memory Tips) */}
                {memberSupportingContent.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Pastoral Discipleship Insights (Approved & Published)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {memberSupportingContent.map((item) => (
                        <div key={item.id} className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2 text-xs shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                              {item.content_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Pastoral Verified
                            </span>
                          </div>
                          {item.content_urdu && (
                            <p dir="rtl" className="font-urdu text-sm text-slate-900 text-right leading-relaxed font-semibold">
                              {item.content_urdu}
                            </p>
                          )}
                          {item.content_english && (
                            <p className="text-slate-700 leading-relaxed">
                              {item.content_english}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: READ ALOUD */}
            {/* ========================================================================= */}
            {currentStepIndex === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-6 sm:p-8 border border-blue-200 text-center space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 inline-block">
                    Auditory Cognitive Anchor
                  </span>

                  <p 
                    dir="rtl"
                    className="font-urdu text-3xl sm:text-5xl text-slate-900 leading-loose sm:leading-loose text-center py-6"
                  >
                    {activeDay.original_urdu_text}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleReadAloudAudio}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow hover:bg-[#133E87] transition-all"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>{isPlayingAudio ? 'Audio Playing...' : 'Listen Audio Reference'}</span>
                    </button>

                    <button
                      onClick={handleIncrementReadAloud}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow hover:bg-amber-400 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Spoken Aloud: {readAloudCount} / 3 Times</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span>Target: Speak with vocal clarity at least 3 times.</span>
                  <span className={readAloudCount >= 3 ? 'text-emerald-600 font-bold' : 'text-amber-700 font-bold'}>
                    {readAloudCount >= 3 ? '✓ Target Achieved' : 'Auditory exercise in progress'}
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: MEMORIZE (5 Progressive Levels) */}
            {/* ========================================================================= */}
            {currentStepIndex === 3 && (
              <div className="space-y-6">
                {/* 5-Level Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {MEMORIZE_PROGRESSIVE_LEVELS.map(lvl => (
                    <button
                      key={lvl.level}
                      onClick={() => setMemorizeLevel(lvl.level)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        memorizeLevel === lvl.level
                          ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs ring-2 ring-amber-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold block">Level {lvl.level}</span>
                      <span className="text-[10px] font-urdu block opacity-80 truncate">{lvl.urduTitle}</span>
                    </button>
                  ))}
                </div>

                {/* Level Prompt */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <span>{MEMORIZE_PROGRESSIVE_LEVELS[memorizeLevel - 1].instruction}</span>
                  <span className="font-bold">{MEMORIZE_PROGRESSIVE_LEVELS[memorizeLevel - 1].urduTitle}</span>
                </div>

                {/* Progressive Level Display */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 min-h-[160px] flex items-center justify-center">
                  {memorizeLevel === 1 && (
                    <p dir="rtl" className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose text-center">
                      {activeDay.original_urdu_text}
                    </p>
                  )}

                  {memorizeLevel === 2 && (
                    <div dir="rtl" className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose text-center flex flex-wrap justify-center gap-2">
                      {wordTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={t.isKeyWord ? 'text-amber-700 font-extrabold bg-amber-100 px-1 rounded' : ''}
                        >
                          {t.word}
                        </span>
                      ))}
                    </div>
                  )}

                  {memorizeLevel === 3 && (
                    <div dir="rtl" className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose text-center flex flex-wrap justify-center gap-2">
                      {wordTokens.map((t, idx) => (
                        <span 
                          key={idx} 
                          className={t.isKeyWord ? 'text-slate-900 font-bold' : 'text-slate-400 opacity-60'}
                        >
                          {t.word}
                        </span>
                      ))}
                    </div>
                  )}

                  {memorizeLevel === 4 && (
                    <div dir="rtl" className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose text-center flex flex-wrap justify-center gap-2">
                      {wordTokens.map((t, idx) => (
                        <span key={idx}>
                          {idx % 2 === 0 ? t.word : '_______'}
                        </span>
                      ))}
                    </div>
                  )}

                  {memorizeLevel === 5 && (
                    <div className="text-center py-6 space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        [BLIND RECALL ATTEMPT]
                      </span>
                      <p className="text-sm font-semibold text-slate-600">
                        Recite {activeDay.scripture_reference} out loud without looking.
                      </p>
                      <button
                        onClick={() => setMemorizeLevel(1)}
                        className="text-xs font-bold text-[#0B2545] hover:underline"
                      >
                        Peek Verse Text
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Advancing across 5 levels ensures verbatim retention.</span>
                  <button
                    onClick={() => setPracticeSessionCount(c => c + 1)}
                    className="text-amber-800 font-bold hover:underline"
                  >
                    + Record Practice Attempt
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 5: HIDE WORDS */}
            {/* ========================================================================= */}
            {currentStepIndex === 4 && (
              <div className="space-y-6">
                {/* Difficulty Selector (20% to 100%) */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Mask Difficulty:</span>
                    {[20, 40, 60, 80, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setHideLevelPercent(pct)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          hideLevelPercent === pct
                            ? 'bg-[#0B2545] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRevealAllHideWords}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Reveal All
                    </button>
                    <button
                      onClick={handleResetHideWords}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Reset Mask
                    </button>
                  </div>
                </div>

                {/* Interactive Word Chips (Click to Peek) */}
                <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6 sm:p-8 space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-900 border-b border-amber-200/60 pb-2">
                    <span className="font-bold">Click any masked word to peek and test your recall</span>
                    <span className="font-urdu font-bold">{activeDay.scripture_reference}</span>
                  </div>

                  <div 
                    dir="rtl" 
                    className="font-urdu text-3xl sm:text-4xl leading-loose text-right flex flex-wrap gap-2.5 py-4"
                  >
                    {wordTokens.map((t) => {
                      if (t.isHidden && !t.isRevealed) {
                        return (
                          <button
                            key={t.index}
                            onClick={() => handleTogglePeekWord(t.index)}
                            className="px-2.5 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-sans text-lg font-bold border border-amber-300 transition-colors"
                            title="Click to peek word"
                          >
                            _______
                          </button>
                        );
                      }
                      return (
                        <span 
                          key={t.index} 
                          className={t.isRevealed ? 'text-emerald-800 font-bold bg-emerald-100 px-1 rounded' : 'text-slate-900'}
                        >
                          {t.word}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Active cognitive reconstruction forces the brain to retrieve words from long-term memory.
                </p>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 6: RECALL */}
            {/* ========================================================================= */}
            {currentStepIndex === 5 && (
              <div className="space-y-6">
                {/* Progressive Reveal Screen */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                    Progressive Recall Ladder
                  </span>

                  <div 
                    dir="rtl"
                    className="font-urdu text-3xl sm:text-4xl text-slate-900 leading-loose py-4 flex flex-wrap justify-center gap-2"
                  >
                    {recallTokens.map((t) => {
                      if (t.isHidden && !t.isRevealed) {
                        return (
                          <span key={t.index} className="text-slate-300 font-sans text-xl select-none">
                            _______
                          </span>
                        );
                      }
                      return (
                        <span key={t.index} className="text-slate-900 font-bold animate-in fade-in">
                          {t.word}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={handleRevealOneWord}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs"
                    >
                      Reveal One Word
                    </button>
                    <button
                      onClick={handleRevealPhraseSection}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs"
                    >
                      Reveal Phrase (3 Words)
                    </button>
                    <button
                      onClick={handleRevealAllRecall}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-2xs"
                    >
                      Reveal Full Verse
                    </button>
                    <button
                      onClick={handleRestartRecall}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                      Restart Recall
                    </button>
                  </div>
                </div>

                {/* Self-Assessment */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700">Self-Assessment Accuracy:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Perfect (100%)', val: 100 },
                      { label: 'Good (80%)', val: 80 },
                      { label: 'Needs Work (50%)', val: 50 },
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => setRecallAccuracyRating(item.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          recallAccuracyRating === item.val
                            ? 'bg-[#0B2545] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 7: QUIZ */}
            {/* ========================================================================= */}
            {currentStepIndex === 6 && (
              <div className="space-y-6">
                {currentQuizQ ? (
                  <div className="space-y-5">
                    
                    {/* Question Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-xs font-bold">
                          Question {currentQuizIndex + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Type: {currentQuizQ.question_type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        Score: {quizScore} Correct
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-center">
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {currentQuizQ.prompt}
                      </p>
                      {currentQuizQ.urdu_prompt && (
                        <p dir="rtl" className="font-urdu text-lg text-amber-900 text-center pt-1">
                          {currentQuizQ.urdu_prompt}
                        </p>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuizQ.options.map((opt, idx) => {
                        const isSelected = selectedQuizOption === opt;
                        const isCorrect = opt === currentQuizQ.correct_answer;
                        
                        let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';
                        if (quizAnswerSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-50 border-red-500 text-red-950';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(opt)}
                            disabled={quizAnswerSubmitted}
                            className={`p-3.5 rounded-xl border text-left transition-all text-xs sm:text-sm ${btnStyle}`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                            <span className="font-urdu text-sm sm:text-base leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit / Feedback */}
                    <div className="pt-2">
                      {!quizAnswerSubmitted ? (
                        <button
                          onClick={handleSubmitQuizAnswer}
                          disabled={!selectedQuizOption}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                            selectedQuizOption === currentQuizQ.correct_answer
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50 border-amber-200 text-amber-950'
                          }`}>
                            <span className="font-bold block mb-1">
                              {selectedQuizOption === currentQuizQ.correct_answer ? '✓ Correct Answer!' : 'Explanation:'}
                            </span>
                            {currentQuizQ.explanation}
                          </div>

                          {currentQuizIndex < quizQuestions.length - 1 && (
                            <button
                              onClick={handleNextQuizQuestion}
                              className="px-6 py-2.5 rounded-xl bg-[#0B2545] text-white font-bold text-xs shadow-sm"
                            >
                              Next Question →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Generating quiz questions...</p>
                )}

                {/* Additional Word Order Scramble Component */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Interactive Word Order Challenge (ترتیب درست کریں)
                  </span>
                  <p className="text-xs text-slate-600">
                    Tap the scrambled tokens below to arrange them into the correct authentic Scripture sequence:
                  </p>

                  {/* Assembled Tray */}
                  <div 
                    dir="rtl"
                    className="min-h-[50px] p-3 rounded-xl bg-white border-2 border-dashed border-slate-300 flex flex-wrap items-center gap-2"
                  >
                    {assembledTokens.length === 0 ? (
                      <span className="text-xs text-slate-400 font-sans">Tap words below to place here...</span>
                    ) : (
                      assembledTokens.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleRemoveAssembledToken(t)}
                          className="px-3 py-1 rounded-lg bg-[#0B2545] text-amber-300 font-urdu text-base font-bold shadow-xs hover:bg-red-700 hover:text-white transition-colors"
                          title="Click to remove"
                        >
                          {t.word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Pool */}
                  <div dir="rtl" className="flex flex-wrap gap-2 pt-1">
                    {scrambledTokens.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectScrambledToken(t)}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-urdu text-base font-bold hover:bg-amber-100 hover:border-amber-400 transition-colors"
                      >
                        {t.word}
                      </button>
                    ))}
                  </div>

                  {scrambledTokens.length === 0 && assembledTokens.length > 0 && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleValidateWordOrder}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        Validate Word Order
                      </button>
                      {wordOrderValidated !== null && (
                        <span className={`text-xs font-bold ${wordOrderValidated ? 'text-emerald-700' : 'text-red-600'}`}>
                          {wordOrderValidated ? '✓ Authentic Word Order Match!' : 'Sequence is not correct yet. Click tokens to adjust.'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 8: MARK PROGRESS */}
            {/* ========================================================================= */}
            {currentStepIndex === 7 && (
              <div className="space-y-6">
                <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Record Meaningful Spiritual Outcome
                    </span>
                    <span className="text-xs font-mono text-amber-800 font-semibold">
                      Day {activeDay.day_number}: {activeDay.scripture_reference}
                    </span>
                  </div>

                  {/* Status Selection Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(['NOT_STARTED', 'LEARNING', 'REVIEWING', 'MEMORIZED', 'MASTERED'] as MemorizationStatus[]).map(status => {
                      const meta = MEMORIZATION_STATUS_META[status];
                      const isSelected = selectedStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs ring-2 ring-amber-400'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-bold block">{meta.label}</span>
                          <span className="text-[10px] font-urdu block opacity-80 pt-0.5">{meta.urduLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Confidence Rating (1 to 5 stars) */}
                  <div className="p-4 bg-white rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800">Your Spiritual Confidence Level:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setConfidenceStars(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= confidenceStars
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleSaveProgress}
                      className="px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      <span>Save Progress to Spiritual Treasury</span>
                    </button>

                    {progressSaved && (
                      <span className="text-xs font-bold text-emerald-700 animate-in fade-in flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Saved successfully!</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p>
                    Progress markers are saved securely to your local profile. Your personal streak and church milestones will update immediately upon completing the session.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 9: SCHEDULE REVIEW (Review Preview) */}
            {/* ========================================================================= */}
            {currentStepIndex === 8 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-emerald-400 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Session Complete!
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {activeDay.scripture_reference} Queued for Spaced Review
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    To guarantee lifelong memory retention, this Scripture portion will automatically reappear in your review queue according to the proven spaced repetition cycle:
                  </p>

                  {/* Spaced Intervals Legend (1, 3, 7, 14, 30, 60, 90 days) */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Upcoming Spaced Review Intervals:</span>
                      <span className="text-amber-800 font-mono">1, 3, 7, 14, 30, 60, 90 Days</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                      {[1, 3, 7, 14, 30, 60, 90].map((interval, i) => (
                        <div 
                          key={interval}
                          className={`p-2 rounded-lg text-center border text-xs font-mono font-bold ${
                            i === 0 
                              ? 'bg-[#0B2545] text-amber-300 border-[#0B2545]' 
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="block text-[10px] uppercase font-sans opacity-70">
                            {i === 0 ? 'Next' : `R${i + 1}`}
                          </span>
                          <span>+{interval}d</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post-Session Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-6 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold hover:bg-[#133E87] shadow-sm transition-all"
                    >
                      Return to Member Dashboard
                    </button>

                    <button
                      onClick={() => onNavigate('review')}
                      className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                      Review Due Verses
                    </button>

                    {selectedDayNumber < 365 && (
                      <button
                        onClick={() => {
                          setSelectedDayNumber(prev => prev + 1);
                          setCurrentStepIndex(0);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all"
                      >
                        Advance to Day {selectedDayNumber + 1} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons (Prev / Next) */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdvanceStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-md transition-all"
                >
                  <span>
                    {currentStepIndex === DAILY_SESSION_STEPS.length - 1
                      ? 'Finish Session'
                      : `Continue to ${DAILY_SESSION_STEPS[currentStepIndex + 1].title.replace(/^\d+\.\s*/, '')}`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};

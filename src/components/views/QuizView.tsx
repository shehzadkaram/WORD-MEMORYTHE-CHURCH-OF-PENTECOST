import React, { useState, useMemo, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Layers,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { QUIZ_QUESTION_TYPES } from '../../services/quizEngine';
import { QuizGeneratorService, WordOrderToken } from '../../services/quizGenerator';
import { QuizQuestionType, QuizQuestion, CurriculumDay } from '../../types/database';
import { AppSection } from '../../types/navigation';
import { dbService } from '../../database/dbService';

interface QuizViewProps {
  onNavigate: (section: AppSection) => void;
  initialDayNumber?: number;
}

export const QuizView: React.FC<QuizViewProps> = ({ onNavigate, initialDayNumber }) => {
  const allCurriculumDays = useMemo(() => dbService.getAllCurriculumDays(), []);
  
  // Default to today or requested day
  const defaultDay = initialDayNumber || dbService.getTodaysCurriculumDay().day.day_number;
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(defaultDay);
  const [selectedFilterType, setSelectedFilterType] = useState<string>('ALL');

  const activeDay: CurriculumDay | undefined = useMemo(() => {
    return allCurriculumDays.find(d => d.day_number === selectedDayNumber) || allCurriculumDays[0];
  }, [allCurriculumDays, selectedDayNumber]);

  // Questions generated for the active curriculum day
  const questions: QuizQuestion[] = useMemo(() => {
    if (!activeDay || activeDay.status === 'NEEDS_SCRIPTURE_DATA') return [];
    const generated = QuizGeneratorService.generateQuizForDay(activeDay, allCurriculumDays);
    if (selectedFilterType === 'ALL') return generated;
    return generated.filter(q => q.question_type === selectedFilterType);
  }, [activeDay, allCurriculumDays, selectedFilterType]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);

  // Word Order Challenge State
  const [scrambledTokens, setScrambledTokens] = useState<WordOrderToken[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<WordOrderToken[]>([]);
  const [wordOrderValidated, setWordOrderValidated] = useState<boolean | null>(null);

  // Reset question state when active day changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (activeDay && activeDay.status !== 'NEEDS_SCRIPTURE_DATA') {
      const scramble = QuizGeneratorService.generateWordOrderTokens(activeDay.original_urdu_text);
      setScrambledTokens(scramble.tokens);
      setAssembledTokens([]);
      setWordOrderValidated(null);
    }
  }, [activeDay, selectedFilterType]);

  const currentQ: QuizQuestion | undefined = questions[currentQuestionIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ || !activeDay) return;
    setIsAnswerSubmitted(true);
    setQuestionsAttempted(prev => prev + 1);

    const isCorrect = selectedOption === currentQ.correct_answer;
    if (isCorrect) {
      setSessionScore(prev => prev + 1);
    }

    // Persist attempt to database
    dbService.saveQuizAttempt({
      user_id: 'demo-user-member',
      verse_id: activeDay.verse_ids[0] || activeDay.id,
      score: isCorrect ? 1 : 0,
      total_questions: 1,
      time_taken_seconds: 12,
      completed_at: new Date().toISOString(),
    });
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  // Scrambled word order handlers
  const handleSelectScramble = (token: WordOrderToken) => {
    setScrambledTokens(prev => prev.filter(t => t.id !== token.id));
    setAssembledTokens(prev => [...prev, token]);
  };

  const handleRemoveScramble = (token: WordOrderToken) => {
    setAssembledTokens(prev => prev.filter(t => t.id !== token.id));
    setScrambledTokens(prev => [...prev, token]);
  };

  const handleValidateWordOrder = () => {
    const isCorrect = assembledTokens.every((t, i) => t.originalIndex === i);
    setWordOrderValidated(isCorrect);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B2545] text-amber-400 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  Scripture Retention Quiz Engine
                </span>
                <span className="text-xs text-slate-500 font-semibold">• WordPocket Provenance</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Authentic Bible Memorization Quizzes
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Score: {sessionScore} / {questionsAttempted}</span>
            </div>
            {questionsAttempted > 0 && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-300">
                {Math.round((sessionScore / questionsAttempted) * 100)}% Accuracy
              </span>
            )}
          </div>
        </div>

        {/* Day Selector & Type Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Day:</span>
            <button
              onClick={() => {
                if (selectedDayNumber > 1) setSelectedDayNumber(p => p - 1);
              }}
              disabled={selectedDayNumber <= 1}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            <select
              value={selectedDayNumber}
              onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {allCurriculumDays.map(d => (
                <option key={d.day_number} value={d.day_number}>
                  Day {d.day_number}: {d.scripture_reference} {d.status === 'NEEDS_SCRIPTURE_DATA' ? '⚠️ [Pending]' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (selectedDayNumber < 365) setSelectedDayNumber(p => p + 1);
              }}
              disabled={selectedDayNumber >= 365}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Question Filter Types */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Type:</span>
            {['ALL', 'MISSING_WORDS', 'REFERENCE_TO_VERSE', 'VERSE_MEANING'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedFilterType(type)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedFilterType === type
                    ? 'bg-[#0B2545] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DAY 21 NOTICE IF SELECTED */}
      {activeDay?.status === 'NEEDS_SCRIPTURE_DATA' ? (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-8 text-center space-y-3">
          <h3 className="text-lg font-bold text-amber-950">
            Day 21 (Genesis 1:21) Scripture Import Pending
          </h3>
          <p className="text-xs text-amber-900 max-w-md mx-auto">
            This portion is awaiting canonical WordPocket Urdu Bible verification. Please select another day for practice.
          </p>
        </div>
      ) : currentQ ? (
        /* Question Card */
        <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#0B2545] text-amber-400 font-mono text-xs font-black">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {currentQ.question_type.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                Day {activeDay?.day_number}: {activeDay?.scripture_reference}
              </span>
            </div>

            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Scripture Content
            </span>
          </div>

          {/* Prompt */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.prompt}
            </h3>
            {currentQ.urdu_prompt && (
              <p dir="rtl" className="font-urdu text-2xl text-slate-900 text-right leading-loose bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                {currentQ.urdu_prompt}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isChosen = selectedOption === opt;
              const isCorrect = isAnswerSubmitted && opt === currentQ.correct_answer;
              const isWrong = isAnswerSubmitted && isChosen && opt !== currentQ.correct_answer;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : isWrong
                      ? 'bg-red-50 border-red-500 text-red-950'
                      : isChosen
                      ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-urdu text-base sm:text-lg leading-relaxed">{opt}</span>
                  </div>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation on submit */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-xl text-xs space-y-1 animate-in fade-in border ${
              selectedOption === currentQ.correct_answer
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <span className="font-bold block text-sm">
                {selectedOption === currentQ.correct_answer ? '✓ Correct Answer!' : 'Insight & Context:'}
              </span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Exit Quiz to Dashboard
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40"
              >
                <span>Submit Answer</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No questions available for this filter.
        </div>
      )}

      {/* Word Order Scramble Component */}
      {activeDay && activeDay.status !== 'NEEDS_SCRIPTURE_DATA' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Word Order Reconstruction Challenge (الفاظ کی درست ترتیب)
              </h4>
              <p className="text-xs text-slate-500">
                Assemble the scrambled tokens in exact canonical sequence for {activeDay.scripture_reference}:
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0B2545] bg-amber-100 px-2 py-0.5 rounded">
              Day {activeDay.day_number}
            </span>
          </div>

          {/* Assembled Tray */}
          <div 
            dir="rtl"
            className="min-h-[55px] p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap items-center gap-2"
          >
            {assembledTokens.length === 0 ? (
              <span className="text-xs text-slate-400 font-sans">Tap words below to place here...</span>
            ) : (
              assembledTokens.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleRemoveScramble(t)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B2545] text-amber-300 font-urdu text-base font-bold shadow-xs hover:bg-red-700 hover:text-white transition-colors"
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
                onClick={() => handleSelectScramble(t)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-urdu text-base font-bold hover:bg-amber-100 hover:border-amber-400 transition-colors shadow-2xs"
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
      )}

    </div>
  );
};

/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * 365-DAY CHURCH MEMORY JOURNEY (MEMBER EXPERIENCE)
 * Compliant with Section 17 & 31 of System Architecture
 * 
 * Enables church members to:
 * - READ authentic WordPocket Urdu Scripture
 * - UNDERSTAND the biblical context and theological meaning
 * - MEMORIZE using proven spaced recall techniques
 * - REVIEW regularly for long-term retention
 * - LIVE THE WORD in everyday family, work, and community life
 */

import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Share2, 
  Check, 
  Search, 
  BrainCircuit, 
  Heart, 
  Lightbulb, 
  Flame, 
  ShieldCheck,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { CurriculumDay } from '../../types/database';
import { MONTHLY_THEMES } from '../../database/curriculumData';
import { AppSection } from '../../types/navigation';

interface CurriculumJourneyViewProps {
  onNavigate: (section: AppSection) => void;
  onStartSession?: (dayNumber?: number) => void;
}

export const CurriculumJourneyView: React.FC<CurriculumJourneyViewProps> = ({
  onNavigate,
  onStartSession,
}) => {
  const allDays = useMemo(() => dbService.getAllCurriculumDays(), []);
  
  // Calculate today's day of the year (1 - 365)
  const todayDayOfYear = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.min(365, Math.max(1, day));
  }, []);

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(todayDayOfYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStep, setActiveStep] = useState<'READ' | 'UNDERSTAND' | 'MEMORIZE' | 'LIVE'>('READ');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(() => {
    // Read from localStorage or memorization records
    try {
      const saved = localStorage.getItem('cop_curriculum_completed_days');
      if (saved) return new Set<number>(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set<number>([1, 2, 3]);
  });

  // Current selected day
  const currentDay = useMemo(() => {
    return allDays.find(d => d.day_number === selectedDayNumber) || allDays[0];
  }, [allDays, selectedDayNumber]);

  // Filtered days for navigation drawer / list
  const filteredDays = useMemo(() => {
    return allDays.filter(day => {
      if (selectedMonth > 0 && day.month_number !== selectedMonth) return false;
      if (selectedDifficulty !== 'ALL' && day.difficulty !== selectedDifficulty) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchRef = day.scripture_reference.toLowerCase().includes(q);
        const matchTheme = day.theme.toLowerCase().includes(q);
        const matchBook = day.book_name_english.toLowerCase().includes(q);
        const matchUrdu = day.book_name_urdu.includes(q) || day.original_urdu_text.includes(q);
        if (!matchRef && !matchTheme && !matchBook && !matchUrdu) return false;
      }
      return true;
    });
  }, [allDays, selectedMonth, selectedDifficulty, searchQuery]);

  const toggleDayCompleted = (dayNum: number) => {
    setCompletedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      try {
        localStorage.setItem('cop_curriculum_completed_days', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (!currentDay) return;
    const text = `DAY ${currentDay.day_number} — WORD MEMORY\n${currentDay.scripture_reference} (${currentDay.book_name_urdu})\n\n${currentDay.original_urdu_text}\n\n"${currentDay.english_text}"\n\nTheme: ${currentDay.theme}\nSource: WordPocket Urdu Bible\nThe Church of Pentecost Dubai - Pakistani & Indian Worship Centre`;
    navigator.clipboard?.writeText?.(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrevDay = () => {
    setSelectedDayNumber(prev => Math.max(1, prev - 1));
  };

  const handleNextDay = () => {
    setSelectedDayNumber(prev => Math.min(365, prev + 1));
  };

  const progressPercent = Math.round((completedDays.size / 365) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Church Heritage & Progress */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold tracking-wide uppercase border border-amber-500/30 mb-3">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>365-Day Church Memory Journey</span>
              <span className="text-amber-200/60">•</span>
              <span className="font-urdu">365 روزہ کلیسیائی سفر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
              <span>Day {currentDay.day_number} of 365</span>
              {completedDays.has(currentDay.day_number) && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-sans font-normal">
                  <CheckCircle2 className="w-3 h-3" /> Memorized
                </span>
              )}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-sans">
              The Church of Pentecost Dubai — Pakistani & Indian Worship Centre. Systematic, Christ-centered daily discipleship through the Word of God.
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[240px]">
            <div className="flex justify-between items-center text-xs text-slate-200 mb-1.5">
              <span className="font-medium">Journey Progress</span>
              <span className="font-bold text-amber-300">{completedDays.size} / 365 Days ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, progressPercent)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2.5 text-xs text-slate-300">
              <button 
                onClick={() => setSelectedDayNumber(todayDayOfYear)}
                className="hover:text-amber-300 underline transition-colors cursor-pointer"
              >
                Jump to Today (Day {todayDayOfYear})
              </button>
              <button 
                onClick={() => onNavigate('curriculum-builder')}
                className="hover:text-amber-300 underline transition-colors cursor-pointer text-slate-300"
              >
                Curriculum Engine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Days Catalog / Navigation, Right side Full Scripture & Discipleship Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 365 Days Navigator & Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-700" />
                <span>Journey Navigation</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {filteredDays.length} days listed
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search reference, theme, book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-600 focus:bg-white"
              />
            </div>

            {/* Month Filter Selector */}
            <div className="mb-3">
              <label className="text-xs font-medium text-slate-600 block mb-1">Filter by Month Theme:</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary-600"
              >
                <option value={0}>All 12 Months (Days 1 - 365)</option>
                {MONTHLY_THEMES.map(m => (
                  <option key={m.month} value={m.month}>
                    {m.name} ({m.daysRange})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-1.5 mb-3">
              {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 text-[10px] py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedDifficulty === diff 
                      ? 'bg-primary-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Scrollable Day List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {filteredDays.map(d => {
                const isSelected = d.day_number === selectedDayNumber;
                const isDone = completedDays.has(d.day_number);
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDayNumber(d.day_number);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-50 border border-amber-400 text-slate-900 shadow-xs' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isSelected 
                            ? 'bg-primary-900 text-amber-300' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isDone ? <Check className="w-4 h-4 text-emerald-600" /> : d.day_number}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {d.scripture_reference}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {d.theme}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        d.difficulty === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700' :
                        d.difficulty === 'INTERMEDIATE' ? 'bg-blue-50 text-blue-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {d.difficulty.charAt(0)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Full Scripture Display & Discipleship Flow (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Scripture Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header with Navigation & Meta */}
            <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevDay}
                  disabled={selectedDayNumber <= 1}
                  className="p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-slate-700"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 bg-primary-900 text-amber-300 rounded-lg text-xs font-bold font-serif">
                  DAY {currentDay.day_number}
                </div>
                <button 
                  onClick={handleNextDay}
                  disabled={selectedDayNumber >= 365}
                  className="p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-slate-700"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  {currentDay.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  currentDay.difficulty === 'BEGINNER' ? 'bg-emerald-100 text-emerald-800' :
                  currentDay.difficulty === 'INTERMEDIATE' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {currentDay.difficulty}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
                  {currentDay.testament === 'OLD' ? 'Old Testament' : 'New Testament'}
                </span>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Copy Scripture & Discipleship"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Scripture Reference Title */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">
                    {currentDay.scripture_reference}
                  </h2>
                  <p className="text-amber-700 font-semibold text-sm mt-0.5">
                    {currentDay.theme}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-urdu text-xl font-bold text-primary-900" dir="rtl">
                    {currentDay.book_name_urdu} ({currentDay.urdu_theme || currentDay.urdu_title})
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Source: {currentDay.source_name}
                  </div>
                </div>
              </div>

              {/* AUTHENTIC URDU SCRIPTURE DISPLAY (Section 2 - Strict Preservation) */}
              {currentDay.original_urdu_text ? (
                <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-6 sm:p-8 shadow-inner relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>WordPocket Urdu Bible (Authentic Text)</span>
                    </span>
                    <span className="font-urdu text-xs text-amber-800">
                      مُقدّس کلام (اردو)
                    </span>
                  </div>
                  <p 
                    className="font-urdu text-2xl sm:text-3xl text-slate-950 text-right leading-[2.5] sm:leading-[2.6] select-text"
                    dir="rtl"
                  >
                    {currentDay.original_urdu_text}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                  <div className="inline-flex p-2.5 bg-amber-100 rounded-full text-amber-800">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    Scripture Text Pending Database Import
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                    This day is scheduled for <strong className="text-slate-800">{currentDay.scripture_reference}</strong> ({currentDay.theme}). In adherence to our strict Church Data Integrity policy, AI is prohibited from generating or synthesizing Bible verses. The authentic Urdu text will become available when the WordPocket Bible import for <span className="font-medium text-slate-800">{currentDay.book_name_english}</span> is completed in the Bible Database Manager.
                  </p>
                  <div className="inline-block text-[11px] px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full font-medium">
                    Status: Awaiting Canonical Scripture Import
                  </div>
                </div>
              )}

              {/* English Scripture Translation */}
              {currentDay.english_text && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    English Scripture
                  </div>
                  <p className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed">
                    "{currentDay.english_text}"
                  </p>
                </div>
              )}

              {/* 5-Step Discipleship Framework (Section 17: Read -> Understand -> Memorize -> Review -> Live) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 text-xs font-bold divide-x divide-slate-200">
                  <button
                    onClick={() => setActiveStep('READ')}
                    className={`p-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeStep === 'READ' ? 'bg-white text-primary-900 border-b-2 border-primary-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>1. Read</span>
                  </button>
                  <button
                    onClick={() => setActiveStep('UNDERSTAND')}
                    className={`p-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeStep === 'UNDERSTAND' ? 'bg-white text-primary-900 border-b-2 border-primary-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>2. Understand</span>
                  </button>
                  <button
                    onClick={() => setActiveStep('MEMORIZE')}
                    className={`p-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeStep === 'MEMORIZE' ? 'bg-white text-primary-900 border-b-2 border-primary-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>3. Memorize</span>
                  </button>
                  <button
                    onClick={() => setActiveStep('LIVE')}
                    className={`p-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      activeStep === 'LIVE' ? 'bg-white text-primary-900 border-b-2 border-primary-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>4. Live & Pray</span>
                  </button>
                </div>

                <div className="p-6">
                  {activeStep === 'READ' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Step 1: Read & Meditate Verbatim</h4>
                          <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                            Read this passage slowly at least 3 times out loud. Give special focus to the Urdu Nastaliq script to imprint the exact canonical phrasing on your spiritual memory.
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                        <span>Context: {currentDay.context_prev_verse || 'Beginning of passage'} ➔ <strong>{currentDay.scripture_reference}</strong> ➔ {currentDay.context_next_verse || 'Continuation'}</span>
                        <span className="font-semibold text-blue-800">WordPocket Urdu</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 'UNDERSTAND' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">💡 Think About It (Theological Meaning)</h4>
                          <p className="text-slate-700 text-sm mt-1.5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {currentDay.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 'MEMORIZE' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          <BrainCircuit className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-slate-900 text-sm">🧠 Memory Tip & Memorization Discipline</h4>
                          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-sm text-purple-950 mt-1.5">
                            {currentDay.memory_tip || 'Break the verse into two natural rhythmic cadences. Recite the first half three times before joining the second.'}
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => {
                                if (onStartSession) onStartSession(currentDay.day_number);
                                else onNavigate('memorize');
                              }}
                              className="px-4 py-2 bg-primary-900 hover:bg-primary-950 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <BrainCircuit className="w-4 h-4 text-amber-300" />
                              <span>Launch Interactive Memorize Session</span>
                            </button>
                            <button
                              onClick={() => onNavigate('quiz')}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Take Verse Quiz
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 'LIVE' && (
                    <div className="space-y-5">
                      {/* Live It */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-slate-900 text-sm">🌿 Live It (Daily Practical Application)</h4>
                          <p className="text-slate-700 text-sm mt-1.5 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
                            {currentDay.application}
                          </p>
                        </div>
                      </div>

                      {/* Pray */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-slate-900 text-sm">🙏 Pray (Daily Prayer Commitment)</h4>
                          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl text-sm italic text-amber-950 mt-1.5">
                            "{currentDay.prayer}"
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {currentDay.status !== 'NEEDS_SCRIPTURE_DATA' && onStartSession && (
                    <button
                      onClick={() => onStartSession(currentDay.day_number)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Start 9-Step Session (Day {currentDay.day_number})</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleDayCompleted(currentDay.day_number)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      completedDays.has(currentDay.day_number)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-primary-900 hover:bg-primary-950 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>
                      {completedDays.has(currentDay.day_number)
                        ? 'Marked as Memorized'
                        : 'Mark Day as Memorized'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrevDay}
                    disabled={selectedDayNumber <= 1}
                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous Day
                  </button>
                  <button
                    onClick={handleNextDay}
                    disabled={selectedDayNumber >= 365}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next Day</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

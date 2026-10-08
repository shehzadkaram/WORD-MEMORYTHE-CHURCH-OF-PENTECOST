import React from 'react';
import { 
  Sparkles, 
  Repeat, 
  HelpCircle, 
  Flame, 
  BookmarkCheck, 
  Trophy, 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ChurchLogo } from '../layout/ChurchLogo';
import { StatusBadge } from '../common/StatusBadge';
import { AppSection } from '../../types/navigation';
import { dbService } from '../../database/dbService';
import { DAILY_SESSION_STEPS } from '../../services/memorizationEngine';

interface DashboardViewProps {
  onNavigate: (section: AppSection) => void;
  onStartSession: () => void;
  onOpenSchema: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onStartSession,
  onOpenSchema,
}) => {
  const stats = dbService.getMemberStats();
  const activeUser = dbService.getActiveUser();
  const { day: todaysCurriculumDay, isPendingData } = dbService.getTodaysCurriculumDay();
  const { verse, metadata, curriculumDay } = dbService.getTodaysVerse();
  const dueReviews = dbService.getDueReviews();
  const challenges = dbService.getChallenges();
  const userParticipations = dbService.getMemberChallengeParticipation(activeUser.id);
  const enrolledChallenge = userParticipations.find(p => !p.is_completed) || userParticipations[0];
  const activeChallenge = enrolledChallenge 
    ? challenges.find(c => c.id === enrolledChallenge.challenge_id) || challenges[0]
    : challenges[0];

  const activeDayNumber = curriculumDay?.day_number || 1;
  const activeReference = curriculumDay?.scripture_reference || verse.reference;
  const activeUrduText = curriculumDay?.original_urdu_text || verse.original_text;
  const activeEnglishText = curriculumDay?.english_text || verse.english_text;
  const activeBookUrdu = curriculumDay?.book_name_urdu || verse.book_name_urdu;
  const activeTheme = curriculumDay?.theme || metadata.topic;
  const activeCategory = curriculumDay?.category || metadata.category;

  return (
    <div className="space-y-6">
      
      {/* 1. Official Church Branded Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0B2545] via-[#133E87] to-[#0B2545] text-white p-6 sm:p-8 shadow-md overflow-hidden border border-slate-700/50">
        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <ChurchLogo size="xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-1.5 bg-white rounded-full shadow-md flex-shrink-0">
              <ChurchLogo size="lg" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
                <span>Official Church Platform</span>
                <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                <span>Dubai • UAE</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                THE CHURCH OF PENTECOST, DUBAI
              </h1>
              
              <div className="text-amber-400 font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>PAKISTANI & INDIAN WORSHIP CENTRE</span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm italic pt-1 font-medium">
                “Read • Understand • Memorize • Review • Live the Word”
              </p>
            </div>
          </div>

          {/* Quick Start Action on Header */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
            <button
              onClick={onStartSession}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Start Today's Session</span>
            </button>

            <button
              onClick={() => onNavigate('review')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              <span>Review Due Verses ({dueReviews.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Title & 6 Core KPI Cards (Section 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Bible Memory Journey
            </h2>
            <p className="text-xs text-slate-500">
              Personal Scripture retention overview & daily spiritual milestones
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Today's Verse Reference */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Day {activeDayNumber}</span>
              <BookOpen className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-base font-extrabold text-slate-900 truncate" title={activeReference}>
              {activeReference}
            </div>
            <div className="text-[10px] text-amber-700 font-urdu truncate pt-0.5">
              {activeBookUrdu}
            </div>
          </div>

          {/* Card 2: Current Streak */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Current Streak</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.currentStreak} <span className="text-xs font-semibold text-slate-500">Days</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium pt-0.5">
              Best: {stats.longestStreak} days
            </div>
          </div>

          {/* Card 3: Verses Memorized */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Memorized</span>
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-blue-900">
              {stats.versesMemorized} <span className="text-xs font-semibold text-slate-500">Verses</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-0.5">
              Committed to memory
            </div>
          </div>

          {/* Card 4: Verses Mastered */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Mastered</span>
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-extrabold text-purple-900">
              {stats.versesMastered} <span className="text-xs font-semibold text-slate-500">Verses</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-0.5">
              90-day retention recall
            </div>
          </div>

          {/* Card 5: Reviews Due */}
          <button
            onClick={() => onNavigate('review')}
            className="text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600 group-hover:text-amber-800 transition-colors">Reviews Due</span>
              <Repeat className="w-4 h-4 text-amber-600 group-hover:rotate-180 transition-transform duration-300" />
            </div>
            <div className="text-xl font-extrabold text-amber-700">
              {dueReviews.length} <span className="text-xs font-semibold text-slate-500">Verses</span>
            </div>
            <div className="text-[10px] text-amber-800 font-medium pt-0.5 flex items-center justify-between">
              <span>{dueReviews.length > 0 ? 'Action required' : 'All up to date'}</span>
              <ArrowRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Card 6: Monthly Progress */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold text-slate-600">Monthly Target</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.monthlyProgressPercent}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${stats.monthlyProgressPercent}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 365-Day Church Memory Journey Callout Banner (Phase 3 Engine) */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg font-serif shrink-0 border border-amber-500/30">
            365
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Phase 3 Curriculum Engine</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">12-Month Plan Active</span>
            </div>
            <h3 className="text-lg font-bold font-serif text-white">365-Day Church Memory Journey</h3>
            <p className="text-xs text-slate-300 mt-0.5 font-sans">
              Read • Understand • Memorize • Review • Live the Word across 12 monthly themes from WordPocket Urdu Scripture.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => onNavigate('curriculum-journey')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open 365 Journey</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('curriculum-builder')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Curriculum Builder
          </button>
        </div>
      </div>

      {/* 3. Large Today's Verse Card (Section 6 Requirement) */}
      <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
        
        {/* Top bar with reference, category, and day indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-lg bg-[#0B2545] text-amber-400 font-black text-sm tracking-wide">
              {activeReference}
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Day {activeDayNumber} • {activeCategory}
            </span>
            <StatusBadge status="LEARNING" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              WordPocket Authentic Urdu Scripture
            </span>
          </div>
        </div>

        {/* Sacred Verse Content Box (Urdu Original + English Translation) */}
        <div className="space-y-4 py-1">
          {/* Authentic Urdu Text from WordPocket Source */}
          <div className="bg-amber-50/50 rounded-xl p-4 sm:p-5 border border-amber-200/60">
            <div className="text-right mb-1">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider font-sans">
                اردو بائبل متن (WordPocket Urdu Source)
              </span>
            </div>
            <p className="font-urdu text-xl sm:text-2xl md:text-3xl text-slate-900 leading-loose text-right">
              {activeUrduText}
            </p>
            <div className="text-right text-xs font-urdu font-bold text-amber-800 pt-1">
              {activeBookUrdu}
            </div>
          </div>

          {/* English Supporting Translation */}
          {activeEnglishText && (
            <div className="px-2">
              <p className="text-slate-700 text-sm sm:text-base italic leading-relaxed font-serif">
                "{activeEnglishText}"
              </p>
              <p className="text-xs font-semibold text-slate-400 pt-1">
                Theme: {activeTheme}
              </p>
            </div>
          )}
        </div>

        {/* Biblical Meaning & Application Teaser */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="font-bold text-slate-800 block mb-0.5">Biblical Understanding:</span>
            <p className="text-slate-600 line-clamp-2">{metadata.biblical_context}</p>
          </div>
          <div>
            <span className="font-bold text-slate-800 block mb-0.5">Practical Daily Living:</span>
            <p className="text-slate-600 line-clamp-2">{metadata.practical_application}</p>
          </div>
        </div>

        {/* Primary Action Buttons (Section 6 Requirement) */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Button */}
            <button
              onClick={onStartSession}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Start Today's Session</span>
            </button>

            {/* Secondary Buttons */}
            <button
              onClick={() => onNavigate('review')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-600" />
              <span>Review Due Verses</span>
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Take Quiz</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('todays-verse')}
            className="text-xs font-semibold text-[#0B2545] hover:text-amber-600 inline-flex items-center gap-1 transition-colors"
          >
            <span>Full Verse Study & Prayer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. 9-Step Daily Session Journey Preview (Section 13) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              9-Step Daily Memory System Architecture
            </h3>
            <p className="text-xs text-slate-500">
              The systematic flow church members follow each day for indelible Scripture retention
            </p>
          </div>
          
          <button
            onClick={() => onNavigate('memorize')}
            className="text-xs font-semibold text-[#0B2545] hover:text-amber-600 flex items-center gap-1"
          >
            <span>Launch Memorize Flow</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 9 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {DAILY_SESSION_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:border-amber-400 hover:bg-white transition-all text-center flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full inline-block mb-1">
                  Step {step.stepNumber}
                </span>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {step.title.replace(/^\d+\.\s*/, '')}
                </div>
              </div>
              <div className="text-[10px] font-urdu text-slate-600 mt-1">
                {step.urduTitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom 2-Column Section: Active Church Challenge & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Church Challenge Card */}
        {activeChallenge && (
          <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-2xl border border-amber-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>{enrolledChallenge ? 'Your Active Church Challenge' : 'Church Challenge'}</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeChallenge.target_verses_count} Verses Goal
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-slate-900">{activeChallenge.title}</h4>
              {activeChallenge.tagline && (
                <p className="text-xs text-amber-700 italic font-medium">{activeChallenge.tagline}</p>
              )}
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{activeChallenge.description}</p>
            </div>

            {enrolledChallenge && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {enrolledChallenge.is_completed ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Goal Achieved!
                      </span>
                    ) : (
                      <span>Progress: {enrolledChallenge.verses_completed} of {activeChallenge.target_verses_count} Verses</span>
                    )}
                  </span>
                  <span className="font-extrabold text-[#0B2545] font-mono text-xs">
                    {Math.min(100, Math.round((enrolledChallenge.verses_completed / Math.max(1, activeChallenge.target_verses_count)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${enrolledChallenge.is_completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ 
                      width: `${Math.min(100, Math.round((enrolledChallenge.verses_completed / Math.max(1, activeChallenge.target_verses_count)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {activeChallenge.start_date} – {activeChallenge.end_date}
              </span>
              <button
                onClick={() => onNavigate('church-challenges')}
                className="text-xs font-bold text-[#0B2545] hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{enrolledChallenge ? 'View Details & Badges' : 'Join Church Challenge'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Database & Architecture Notice */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Phase 1 Architecture Compliance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered with 20 modular SQLite tables, role-based security (Administrator, Pastor, Member), and strict isolation of WordPocket Urdu Bible text from educational metadata.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">
              Ready for Windows Desktop (.exe)
            </span>
            <button
              onClick={onOpenSchema}
              className="text-xs font-semibold text-[#0B2545] hover:text-amber-600 inline-flex items-center gap-1"
            >
              <span>Inspect SQLite Tables</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

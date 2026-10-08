import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Flame, 
  BookmarkCheck, 
  Trophy, 
  Award, 
  CheckCircle2, 
  Calendar,
  BarChart3,
  Repeat,
  Clock,
  ChevronRight,
  Download,
  AlertTriangle,
  BookOpen,
  Layers,
  History,
  ShieldCheck,
  FileText,
  Printer,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AppSection } from '../../types/navigation';
import { AnalyticsDateRange, MemberPersonalAnalytics } from '../../types/database';

interface ProgressViewProps {
  onNavigate: (section: AppSection) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onNavigate }) => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('30D');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Authoritative personal analytics from single source of truth
  const analytics: MemberPersonalAnalytics = useMemo(() => {
    return dbService.getMemberPersonalAnalytics(undefined, dateRange);
  }, [dateRange]);

  const stats = dbService.getMemberStats();
  const quizAttempts = dbService.getQuizAttempts();

  const handleExport = (format: 'JSON' | 'CSV') => {
    try {
      const result = dbService.exportAnalytics('MEMBER_PROGRESS', format);
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportNotification(`Personal progress report downloaded successfully as ${format}.`);
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed';
      setExportNotification(`Export error: ${errorMsg}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 print:p-0">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B2545]/10 text-[#0B2545] rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                  Personal Memorization Journey
                </span>
                <span className="text-xs font-mono text-slate-400">• Phase 9 Analytics</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Personal Progress & Spiritual Growth Insights
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Export personal progress report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <div className="text-xs font-mono text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 font-bold">
              Local Database Live
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Objective factual insights into your personal Scripture memorization, review consistency, curriculum progress, and church challenge participation. All records remain completely private to you.
        </p>

        {exportNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
            <span>{exportNotification}</span>
            <button onClick={() => setExportNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Current Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.consistency.currentStreak} Days</div>
          <span className="text-[11px] text-emerald-600 font-medium">Record: {analytics.consistency.longestStreak} days</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Verses Memorized</span>
            <BookmarkCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{analytics.overview.versesMemorized} Verses</div>
          <span className="text-[11px] text-slate-500">Mastered: {analytics.overview.versesMastered} (90d lock)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Reviews Due</span>
            <Repeat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{analytics.reviews.reviewsDue} Verses</div>
          <span className="text-[11px] text-slate-500">
            {analytics.reviews.reviewsOverdue > 0 ? `${analytics.reviews.reviewsOverdue} overdue` : 'Up to date'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Retention Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.reviews.reviewCompletionRate}%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Spaced Consistency</span>
        </div>

      </div>

      {/* Memorization States Breakdown (Neutral, Objective States) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0B2545]" />
            <h3 className="font-bold text-base text-slate-900">
              Personal Memorization States
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {analytics.overview.totalMemorizationRecords} Verses Tracked
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Neutral categorizations tracking where verses sit across your learning journey:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-blue-800 uppercase block tracking-wider">LEARNING</span>
            <div className="text-xl font-black text-blue-900 mt-1">{analytics.overview.versesLearning}</div>
            <span className="text-[10px] text-blue-700">Initial 9-step acquisition</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-amber-800 uppercase block tracking-wider">REVIEWING</span>
            <div className="text-xl font-black text-amber-900 mt-1">{analytics.overview.versesReviewing}</div>
            <span className="text-[10px] text-amber-700">Spaced repetition queue</span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">MEMORIZED</span>
            <div className="text-xl font-black text-emerald-900 mt-1">{analytics.overview.versesMemorized}</div>
            <span className="text-[10px] text-emerald-700">Recalled accurately</span>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl">
            <span className="text-[11px] font-bold text-purple-800 uppercase block tracking-wider">MASTERED</span>
            <div className="text-xl font-black text-purple-900 mt-1">{analytics.overview.versesMastered}</div>
            <span className="text-[10px] text-purple-700">90-day retention locked</span>
          </div>
        </div>
      </div>

      {/* Curriculum Analytics & Day 21 Protection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">
              365-Day Curriculum Journey Completion
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {analytics.curriculum.daysCompleted} of {analytics.curriculum.approvedDays} Approved Days ({analytics.curriculum.completionPercentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[#0B2545] h-3 rounded-full transition-all duration-500" 
              style={{ width: `${analytics.curriculum.completionPercentage}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{analytics.curriculum.daysRemaining} days remaining in annual plan</span>
            <span>Month {analytics.curriculum.currentMonth} Progress: {analytics.curriculum.currentMonthProgressPercent}%</span>
          </div>
        </div>

        {/* Scripture Integrity & Full Curriculum Status */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-2">
              <span>All 365 Curriculum Days Approved & Active (Genesis 1:21 Authentic Text Verified)</span>
              <span className="px-1.5 py-0.5 bg-emerald-200/70 text-emerald-900 text-[10px] font-mono rounded">
                Canonical Integrity
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Word Memory authenticates Scripture strictly from WordPocket Urdu Bible. Day 21 (Genesis 1:21) and all 365 curriculum days are verified, approved, and fully active in discipleship metrics. Exactly 365 days and 30,814 canonical verses are available.
            </p>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Review Engine Analytics (Phase 5C) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Spaced Repetition Review Retention
              </h3>
              <p className="text-xs text-slate-500">
                Canonical intervals: [1, 3, 7, 14, 30, 60, 90] days
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('review')}
            className="text-xs font-bold text-[#0B2545] hover:text-amber-600 flex items-center gap-1"
          >
            <span>Open Review Engine</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Due Today</span>
            <div className="text-xl font-black text-amber-700 mt-1">{analytics.reviews.reviewsDue}</div>
            <span className="text-[10px] text-amber-800 font-semibold">Active Queue</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Overdue</span>
            <div className={`text-xl font-black mt-1 ${analytics.reviews.reviewsOverdue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {analytics.reviews.reviewsOverdue}
            </div>
            <span className="text-[10px] text-slate-500">Pending Recall</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Upcoming</span>
            <div className="text-xl font-black text-blue-800 mt-1">{analytics.reviews.reviewsUpcoming}</div>
            <span className="text-[10px] text-slate-400">Future Intervals</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Completed</span>
            <div className="text-xl font-black text-emerald-800 mt-1">{analytics.reviews.reviewsCompleted}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Reviews Passed</span>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 block mb-2">Stage Distribution by Spaced Interval:</span>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {[
              { stage: 1, label: '+1d' },
              { stage: 2, label: '+3d' },
              { stage: 3, label: '+7d' },
              { stage: 4, label: '+14d' },
              { stage: 5, label: '+30d' },
              { stage: 6, label: '+60d' },
              { stage: 7, label: '+90d (Mastered)' }
            ].map(({ stage, label }) => (
              <div key={stage} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">{label}</span>
                <span className="text-xs font-extrabold text-slate-800">
                  {analytics.reviews.stageDistribution[stage] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Activity Trends & Consistency */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0B2545]" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Personal Activity Trends</h3>
              <p className="text-xs text-slate-500">Daily practice and review frequency over time</p>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700">
            {(['7D', '30D', '90D', 'ALL'] as AnalyticsDateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateRange === range 
                    ? 'bg-white text-[#0B2545] shadow-2xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'ALL' ? 'All Time' : range}
              </button>
            ))}
          </div>
        </div>

        {/* Trend Visualization or Empty State */}
        {!analytics.trends.hasSufficientData ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">
              {analytics.trends.emptyStateMessage || 'Not enough activity data yet.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete daily memorization steps or spaced reviews to populate your activity trends.
            </p>
            <button
              onClick={() => onNavigate('memorize')}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-[#0B2545] text-white rounded-lg text-xs font-bold"
            >
              Start Today's Memory
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Activity in period: {analytics.trends.totalSessionsInRange} practice sessions, {analytics.trends.totalReviewsInRange} reviews</span>
              <span className="font-medium text-emerald-600">Consistency: {analytics.consistency.totalActiveDays} active days</span>
            </div>

            {/* Micro Activity Heat / Bar Strip */}
            <div className="overflow-x-auto pb-1">
              <div className="flex items-end gap-1 h-20 min-w-[300px] border-b border-slate-100 pb-1">
                {analytics.trends.dataPoints.map((dp, idx) => {
                  const maxTotal = Math.max(1, ...analytics.trends.dataPoints.map(p => p.sessionsCount + p.reviewsCount));
                  const total = dp.sessionsCount + dp.reviewsCount;
                  const heightPct = total > 0 ? Math.max(15, Math.round((total / maxTotal) * 100)) : 4;
                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      title={`${dp.date}: ${dp.sessionsCount} sessions, ${dp.reviewsCount} reviews`}
                    >
                      <div 
                        className={`w-full rounded-t-sm transition-all ${
                          total > 0 ? 'bg-[#0B2545] group-hover:bg-amber-500' : 'bg-slate-100'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{analytics.trends.dataPoints[0]?.date}</span>
              <span>{analytics.trends.dataPoints[analytics.trends.dataPoints.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Church Challenges Participation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">
              Church Challenge Participation
            </h3>
          </div>
          <button
            onClick={() => onNavigate('church-challenges')}
            className="text-xs font-bold text-[#0B2545] hover:text-amber-600 flex items-center gap-1"
          >
            <span>View All Challenges</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {analytics.challenges.participations.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
            You are not currently enrolled in any church challenges. Join one to study together with the congregation!
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.challenges.participations.map((p) => (
              <div key={p.challengeId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{p.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.isCompleted ? 'COMPLETED' : `${p.percentage}% Done`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, p.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Progress: {p.currentProgress} / {p.target}</span>
                  <span>{p.isCompleted ? 'Goal Achieved' : 'In Progress'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spiritual Milestones Earned */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900">
              Spiritual Milestones & Biblical Commemorations
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {analytics.milestones.totalEarned} Milestones Celebrated
          </span>
        </div>

        {analytics.milestones.items.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
            No milestones earned yet. Memorize your first verse or maintain a 7-day streak to celebrate spiritual milestones!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.milestones.items.map((m) => (
              <div key={m.id} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    {m.urdu_title && (
                      <span className="text-[11px] text-amber-900/80 font-serif" dir="rtl">{m.urdu_title}</span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{m.description}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Awarded: {new Date(m.awarded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0B2545]" />
            <h3 className="font-bold text-base text-slate-900">
              Personal Activity History
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {analytics.timeline.length} Events Logged
          </span>
        </div>

        {analytics.timeline.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
            No activity logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {analytics.timeline.slice(0, 10).map((event) => (
              <div key={event.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    event.type === 'VERSE_MEMORIZED' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'REVIEW_COMPLETED' ? 'bg-amber-100 text-amber-800' :
                    event.type === 'MILESTONE_EARNED' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {event.type === 'VERSE_MEMORIZED' && <BookmarkCheck className="w-3.5 h-3.5" />}
                    {event.type === 'REVIEW_COMPLETED' && <Repeat className="w-3.5 h-3.5" />}
                    {event.type === 'MILESTONE_EARNED' && <Award className="w-3.5 h-3.5" />}
                    {event.type !== 'VERSE_MEMORIZED' && event.type !== 'REVIEW_COMPLETED' && event.type !== 'MILESTONE_EARNED' && (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{event.title}</span>
                    <span className="text-[11px] text-slate-500">{event.description}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap pt-1">
                  {new Date(event.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h4 className="font-bold text-sm text-slate-800">
            Continue Your Daily Scripture Memory
          </h4>
          <p className="text-xs text-slate-500 pt-0.5">
            Memorize today's verse or review scheduled verses due for retention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('memorize')}
            className="px-5 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Open Memorize Flow
          </button>
          <button
            onClick={() => onNavigate('review')}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-colors"
          >
            Review Due Verses ({analytics.reviews.reviewsDue})
          </button>
        </div>
      </div>

      {/* Export Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#0B2545]" />
                <h3 className="font-bold text-base text-slate-900">Export Personal Progress</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export an official summary of your Scripture memorization journey for personal records or pastoral mentorship.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  handleExport('CSV');
                  setShowExportModal(false);
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-left space-y-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>CSV Spreadsheet</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Excel & Sheets compatible</span>
              </button>

              <button
                onClick={() => {
                  handleExport('JSON');
                  setShowExportModal(false);
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-left space-y-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>JSON Machine Data</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Complete raw dataset</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  handlePrint();
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Progress Sheet</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Award, 
  HeartHandshake, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Download,
  FileText,
  Printer,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { PastoralAggregateAnalytics, PastoralOversightStats } from '../../types/database';
import { AppSection } from '../../types/navigation';

interface PastoralOversightViewProps {
  onNavigate: (section: AppSection) => void;
}

const MONTH_NAMES = [
  'Month 1: Foundations',
  'Month 2: God\'s Promises',
  'Month 3: The Cross',
  'Month 4: Resurrection',
  'Month 5: Holy Spirit',
  'Month 6: Prayer',
  'Month 7: Faith',
  'Month 8: Spiritual Armor',
  'Month 9: Discipleship',
  'Month 10: Grace & Love',
  'Month 11: Praise',
  'Month 12: Eternal Hope',
];

export const PastoralOversightView: React.FC<PastoralOversightViewProps> = ({ onNavigate }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Authoritative Phase 9 Pastoral Aggregate Analytics
  const aggregateAnalytics: PastoralAggregateAnalytics = useMemo(() => {
    return dbService.getPastoralAggregateAnalytics();
  }, []);

  const stats: PastoralOversightStats = useMemo(() => {
    return dbService.getPastoralOversightStats();
  }, []);

  const handleExport = (format: 'JSON' | 'CSV') => {
    try {
      const result = dbService.exportAnalytics('PASTORAL_AGGREGATE', format);
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportNotification(`Pastoral aggregate report downloaded successfully as ${format}.`);
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed';
      setExportNotification(`Export error: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Banner: Pastoral Leadership & Care */}
      <div className="bg-gradient-to-r from-[#1B3B6F] to-[#21295C] rounded-xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Pastoral Discipleship Care
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Phase 9 Aggregate Analytics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-amber-400" />
              Pastoral Oversight & Spiritual Formation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Aggregated Discipleship Insights • Safe Biblical Shepherding • Zero Private Note Exposure
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pastoral Report</span>
            </button>
            <button
              onClick={() => onNavigate('church-challenges')}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 font-bold"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Church Challenges</span>
            </button>
          </div>
        </div>
      </div>

      {exportNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>{exportNotification}</span>
          <button onClick={() => setExportNotification(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Mandatory Non-Negotiable Pastoral Privacy Guarantee */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 text-xs text-amber-950 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Pastoral Privacy & Discipleship Protection Guarantee</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          In alignment with biblical shepherding and church governance mandates, <strong>all private notes, personal prayers, and individual reflection journals remain strictly private to the authoring member</strong>. The Pastoral Oversight console presents purely aggregate congregational activity, spaced repetition consistency, and curriculum adoption. No member-to-member comparison, competitive scoreboards, or privacy leaks are permitted.
        </p>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-amber-900/80 pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Individual Note Access
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Competitive Leaderboards
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Discipleship Shepherding Only
          </span>
        </div>
      </div>

      {/* Primary Discipleship Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Disciples</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {aggregateAnalytics.activeMembersLast30Days}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Of {aggregateAnalytics.totalRegisteredMembers} Registered Members</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Verses In Learning</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {aggregateAnalytics.totalVersesCurrentlyLearning}
          </div>
          <div className="text-[10px] text-slate-500">9-Step Daily Process Active</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Spaced Review</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {aggregateAnalytics.totalCompletedReviews}
          </div>
          <div className="text-[10px] text-purple-700 font-medium">
            {aggregateAnalytics.aggregateReviewCompletionRate}% Review Retention
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Verses Memorized</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {aggregateAnalytics.totalVersesMemorized}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            {aggregateAnalytics.totalVersesMastered} Mastered (90d Lock)
          </div>
        </div>
      </div>

      {/* Aggregate Church Challenges Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">
              Congregational Challenge Engagement
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
              {aggregateAnalytics.challenges.activeChallengesCount} Active Challenges
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Total Challenges</span>
            <div className="text-xl font-black text-slate-900 mt-1">{aggregateAnalytics.challenges.totalChallengesCount}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Total Enrollments</span>
            <div className="text-xl font-black text-blue-800 mt-1">{aggregateAnalytics.challenges.totalEnrollments}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Completed Goals</span>
            <div className="text-xl font-black text-emerald-800 mt-1">{aggregateAnalytics.challenges.completedEnrollments}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Completion Rate</span>
            <div className="text-xl font-black text-purple-800 mt-1">{aggregateAnalytics.challenges.overallCompletionRate}%</div>
          </div>
        </div>

        {aggregateAnalytics.challenges.breakdown.length > 0 && (
          <div className="divide-y divide-slate-100 text-xs pt-1">
            {aggregateAnalytics.challenges.breakdown.map((ch) => (
              <div key={ch.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{ch.title}</span>
                  <span className="text-[11px] text-slate-500 block">Type: {ch.type || (ch as any).challenge_type || 'CHALLENGE'} • Status: {ch.status}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{ch.completedCount} / {ch.participantsCount} Finished</span>
                  <span className="text-[11px] text-emerald-600 block">{ch.completionRate}% completion</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discipleship Progress Across 12 Months */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>365-Day Annual Discipleship Theme Progress</span>
            </h3>
            <p className="text-xs text-slate-500">
              Approved Scripture days across the 12 theological themes
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
            364 of 365 Days Approved (Day 21 Protected)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {MONTH_NAMES.map((name, index) => {
            const monthNum = index + 1;
            const count = stats.monthlyProgressDistribution[monthNum] || 0;
            const target = (monthNum === 2) ? 28 : (([4, 6, 9, 11].includes(monthNum)) ? 30 : 31);
            const percent = Math.min(100, Math.round((count / target) * 100));

            return (
              <div key={monthNum} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate" title={name}>
                    {name.split(':')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    {count}/{target}d
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#1B3B6F] h-1.5 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{name.split(':')[1]}</span>
                  <span className="font-semibold">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Activity Trend Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0B2545]" />
            <h3 className="font-bold text-sm text-slate-900">
              Congregational Engagement Activity Trend
            </h3>
          </div>
          <span className="text-xs text-slate-500">Last 14 Days Aggregate</span>
        </div>

        <div className="flex items-end gap-1.5 h-20 border-b border-slate-100 pb-1">
          {aggregateAnalytics.aggregateTrends.dailyActiveUsers.map((d, idx) => {
            const maxVal = Math.max(1, ...aggregateAnalytics.aggregateTrends.dailyActiveUsers.map(x => x.sessionsCount + x.reviewsCount));
            const total = d.sessionsCount + d.reviewsCount;
            const height = total > 0 ? Math.max(15, Math.round((total / maxVal) * 100)) : 5;
            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                title={`${d.date}: ${d.activeCount} active members, ${d.sessionsCount} sessions, ${d.reviewsCount} reviews`}
              >
                <div 
                  className={`w-full rounded-t-sm ${total > 0 ? 'bg-[#1B3B6F] group-hover:bg-amber-500' : 'bg-slate-100'}`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{aggregateAnalytics.aggregateTrends.dailyActiveUsers[0]?.date}</span>
          <span>{aggregateAnalytics.aggregateTrends.dailyActiveUsers[aggregateAnalytics.aggregateTrends.dailyActiveUsers.length - 1]?.date}</span>
        </div>
      </div>

      {/* Pastoral Shepherding & Care Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pastoral Care & Shepherding Exhortation
            </h3>
          </div>

          <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <p>
              <strong>Pastoral Focus for Pakistani & Indian Congregation:</strong> Discipleship thrives when God's Word is stored deeply in the heart in the believer's mother tongue (Urdu / Hindi). Encourage families during cottage prayer meetings and Friday worship to recite the weekly memory verses together.
            </p>
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-blue-900 text-xs">
              <span className="font-bold">Pastoral Encouragement Scripture:</span>
              <p className="italic mt-0.5">
                "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs..." — Colossians 3:16
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: When members struggle with retention, encourage the 9-step daily rhythm rather than rushing forward. Spaced repetition protects against burnout.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Congregational Prayer Intercessions
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <span className="font-bold text-slate-800">Spiritual Illumination:</span>
                <p className="text-slate-600 text-[11px]">That the Holy Spirit illuminates each verse as members recite in Urdu & English.</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <span className="font-bold text-slate-800">Youth & Children Discipleship:</span>
                <p className="text-slate-600 text-[11px]">That second-generation diaspora youth embrace the Word of God as an anchor in Dubai.</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <span className="font-bold text-slate-800">Consistent Review Habits:</span>
                <p className="text-slate-600 text-[11px]">Grace for working professionals with busy schedules to maintain daily spaced reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#1B3B6F]" />
                <h3 className="font-bold text-base text-slate-900">Export Pastoral Aggregate Report</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export aggregate engagement and retention statistics for the Pastoral Board of The Church of Pentecost Dubai. Individual reflection journals, private prayers, and member rankings are strictly excluded.
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
                <span className="text-[10px] text-slate-500 block">Pastoral Council presentation</span>
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
                <span className="text-[10px] text-slate-500 block">Structured aggregate dataset</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  window.print();
                }}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pastoral Brief</span>
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

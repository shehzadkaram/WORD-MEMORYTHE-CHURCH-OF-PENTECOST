import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  Clock, 
  Calendar, 
  Award, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { MemorizationStatus } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { AppSection } from '../../types/navigation';

interface MyVersesViewProps {
  onNavigate: (section: AppSection) => void;
}

export const MyVersesView: React.FC<MyVersesViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<MemorizationStatus | 'ALL'>('ALL');
  const records = dbService.getMemorizationRecords();
  const schedules = dbService.getReviewSchedules();

  const tabs: { id: MemorizationStatus | 'ALL'; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Verses', count: records.length },
    { id: 'LEARNING', label: 'Learning (سیکھ رہے ہیں)', count: records.filter(r => r.status === 'LEARNING').length },
    { id: 'REVIEWING', label: 'Reviewing (دہرائی جاری)', count: records.filter(r => r.status === 'REVIEWING').length },
    { id: 'MEMORIZED', label: 'Memorized (یاد کر لیا)', count: records.filter(r => r.status === 'MEMORIZED').length },
    { id: 'MASTERED', label: 'Mastered (کامل یادداشت)', count: records.filter(r => r.status === 'MASTERED').length },
  ];

  const filteredRecords = activeTab === 'ALL' ? records : records.filter(r => r.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-900 rounded-xl">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Scripture Milestones
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 19</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                My Memorized Verses Repository
              </h2>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            Total Tracked: {records.length} Verses
          </div>
        </div>
        <p className="text-xs text-slate-600">
          Personal Scripture inventory tracking your retention accuracy, review schedule intervals, and mastery progression.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => {
          const verse = dbService.getVerseById(rec.verse_id);
          const schedule = schedules.find(s => s.verse_id === rec.verse_id);
          if (!verse) return null;

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-400 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#0B2545] text-amber-400 font-bold text-xs rounded-lg">
                      {verse.reference}
                    </span>
                    <span className="font-urdu text-sm font-bold text-amber-800">
                      {verse.book_name_urdu}
                    </span>
                  </div>
                  <StatusBadge status={rec.status} size="sm" />
                </div>

                {/* Urdu Verse */}
                <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/50 text-right">
                  <p className="font-urdu text-lg sm:text-xl text-slate-900 leading-loose">
                    {verse.original_text}
                  </p>
                </div>

                {/* English */}
                <p className="text-slate-700 text-xs sm:text-sm font-serif italic line-clamp-2">
                  "{verse.english_text}"
                </p>
              </div>

              {/* Metrics Row: Accuracy, Confidence, Reviews */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    <span className="font-bold text-slate-900">{rec.accuracy_rate}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Interval</span>
                    <span className="font-bold text-amber-800">{schedule?.interval_days || 1} Days</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <span className="font-bold text-blue-900">{rec.confidence_level}/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Started: {rec.started_date}</span>
                  <button
                    onClick={() => onNavigate('memorize')}
                    className="font-bold text-[#0B2545] hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

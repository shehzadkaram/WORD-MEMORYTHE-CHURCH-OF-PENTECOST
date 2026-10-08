/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * PASTOR & LEADERSHIP CURRICULUM REVIEW WORKFLOW (Phase 3)
 * Compliant with Sections 14 & 16 of System Architecture
 * 
 * Governs the pastoral oversight flow:
 * AI_DRAFT ➔ UNDER_REVIEW ➔ APPROVED ➔ PUBLISHED
 * 
 * Guarantees that pastoral leaders verify biblical faithfulness,
 * doctrinal clarity, and cultural relevance for Pakistani and Indian church members.
 */

import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit3, 
  UserCheck, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  MessageSquare,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { CurriculumDay, CurriculumStatus } from '../../types/database';
import { MONTHLY_THEMES } from '../../database/curriculumData';
import { AppSection } from '../../types/navigation';

interface CurriculumReviewViewProps {
  onNavigate: (section: AppSection) => void;
}

export const CurriculumReviewView: React.FC<CurriculumReviewViewProps> = ({
  onNavigate,
}) => {
  const [days, setDays] = useState<CurriculumDay[]>(() => dbService.getAllCurriculumDays());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Reviewer identity
  const [reviewerName, setReviewerName] = useState<string>('Pastor / Elder');
  const [reviewNoteInput, setReviewNoteInput] = useState<Record<string, string>>({});
  
  // Edit modal state
  const [editingDay, setEditingDay] = useState<CurriculumDay | null>(null);
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editApplication, setEditApplication] = useState<string>('');
  const [editPrayer, setEditPrayer] = useState<string>('');
  const [editMemoryTip, setEditMemoryTip] = useState<string>('');

  const refreshData = () => {
    setDays(dbService.getAllCurriculumDays());
  };

  const handleApprove = (dayId: string) => {
    try {
      const day = days.find(d => d.id === dayId);
      if (day && day.day_number === 21) {
        alert("Protected Canonical Record: Day 21 (Genesis 1:21) cannot be approved until authentic WordPocket Scripture text is imported.");
        return;
      }
      const note = reviewNoteInput[dayId] || 'Approved for doctrine, clarity, and authentic Urdu Scripture alignment.';
      dbService.approveCurriculumDay(dayId, reviewerName, note);
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval blocked';
      alert(msg);
    }
  };

  const handleReject = (dayId: string) => {
    const note = reviewNoteInput[dayId] || 'Revision requested: Please refine explanation or theological phrasing.';
    dbService.rejectCurriculumDay(dayId, reviewerName, note);
    refreshData();
  };

  const handleBatchApproveMonth = (monthNum: number) => {
    const monthDays = days.filter(d => d.month_number === monthNum && d.status !== 'APPROVED' && d.day_number !== 21);
    for (const d of monthDays) {
      try {
        dbService.approveCurriculumDay(d.id, reviewerName, `Batch approved by ${reviewerName}`);
      } catch {
        // Skip protected
      }
    }
    refreshData();
  };

  const openEditModal = (day: CurriculumDay) => {
    setEditingDay(day);
    setEditExplanation(day.explanation);
    setEditApplication(day.application);
    setEditPrayer(day.prayer);
    setEditMemoryTip(day.memory_tip || '');
  };

  const saveEditModal = () => {
    if (!editingDay) return;
    const updated: CurriculumDay = {
      ...editingDay,
      explanation: editExplanation,
      application: editApplication,
      prayer: editPrayer,
      memory_tip: editMemoryTip,
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbService.updateCurriculumDay(updated);
    refreshData();
    setEditingDay(null);
  };

  // Filtered view
  const filteredDays = useMemo(() => {
    return days.filter(d => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (monthFilter > 0 && d.month_number !== monthFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchRef = d.scripture_reference.toLowerCase().includes(q);
        const matchTheme = d.theme.toLowerCase().includes(q);
        const matchBook = d.book_name_english.toLowerCase().includes(q);
        if (!matchRef && !matchTheme && !matchBook) return false;
      }
      return true;
    });
  }, [days, statusFilter, monthFilter, searchQuery]);

  const approvedCount = days.filter(d => d.status === 'APPROVED' || d.status === 'PUBLISHED').length;
  const underReviewCount = days.filter(d => d.status === 'UNDER_REVIEW').length;
  const draftCount = days.filter(d => d.status === 'AI_DRAFT').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-950 via-slate-900 to-primary-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold tracking-wide uppercase border border-amber-500/30 mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Pastor & Leadership Oversight Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Curriculum Theological Review
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
              The Church of Pentecost Dubai — Pakistani & Indian Worship Centre.
              Review and approve daily discipleship reflections (Think About It, Live It, Pray) while ensuring authentic WordPocket Urdu Bible text is strictly honored.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
            <div>
              <label className="text-[11px] text-slate-300 block font-medium">Reviewing Leader:</label>
              <input 
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="text-xs bg-black/40 text-amber-300 font-semibold px-2.5 py-1 rounded border border-white/20 focus:outline-none focus:border-amber-400 mt-0.5"
              />
            </div>
            <div className="border-l border-white/20 pl-3">
              <div className="text-[11px] text-slate-300">Reviewed Status:</div>
              <div className="text-sm font-bold text-amber-300 font-serif">
                {approvedCount} / 365 Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search reference, theme, book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select 
            value={monthFilter}
            onChange={(e) => setMonthFilter(Number(e.target.value))}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value={0}>All 12 Months</option>
            {MONTHLY_THEMES.map(m => (
              <option key={m.month} value={m.month}>
                Month {m.month}: {m.name.split(':')[1]}
              </option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="ALL">All Statuses ({days.length})</option>
            <option value="APPROVED">Approved ({approvedCount})</option>
            <option value="UNDER_REVIEW">Under Review ({underReviewCount})</option>
            <option value="AI_DRAFT">Draft ({draftCount})</option>
          </select>

          {monthFilter > 0 && (
            <button
              onClick={() => handleBatchApproveMonth(monthFilter)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Approve All Month {monthFilter}</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {filteredDays.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No items match filter</h3>
            <p className="text-xs text-slate-500 mt-1">All entries in this criteria have been addressed or no entries match your search.</p>
          </div>
        ) : (
          filteredDays.map(day => (
            <div 
              key={day.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4 transition-all hover:border-slate-300"
            >
              {/* Top Row: Day badge, Scripture Ref, Month & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-950 text-amber-300 flex items-center justify-center font-bold text-sm font-serif">
                    D{day.day_number}
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-serif text-slate-900 flex items-center gap-2">
                      <span>{day.scripture_reference}</span>
                      <span className="text-xs font-normal text-slate-500">({day.book_name_urdu})</span>
                    </h3>
                    <p className="text-xs text-amber-800 font-medium">{day.theme} • {day.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    day.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    day.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                    day.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {day.status}
                  </span>
                  <button
                    onClick={() => openEditModal(day)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Phrasing</span>
                  </button>
                </div>
              </div>

              {/* Authentic WordPocket Urdu Bible Text */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Authentic WordPocket Urdu Bible Text</span>
                  <span className="font-urdu text-xs">کلامِ مقدّس</span>
                </div>
                <div className="font-urdu text-xl text-slate-950 text-right leading-[2.4] select-text" dir="rtl">
                  {day.original_urdu_text}
                </div>
                {day.english_text && (
                  <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs italic text-slate-700 font-serif">
                    "{day.english_text}"
                  </div>
                )}
              </div>

              {/* Discipleship Reflection Review Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <span>💡 Think About It (Meaning):</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{day.explanation}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <span>🌿 Live It (Application):</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{day.application}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <span>🙏 Pray (Commitment):</span>
                  </h4>
                  <p className="text-slate-700 italic leading-relaxed">"{day.prayer}"</p>
                </div>
              </div>

              {/* Reviewer Action Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
                  <input 
                    type="text"
                    placeholder="Optional reviewer notes..."
                    value={reviewNoteInput[day.id] || ''}
                    onChange={(e) => setReviewNoteInput({ ...reviewNoteInput, [day.id]: e.target.value })}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                  {day.reviewed_by && (
                    <span className="text-[11px] text-slate-400 shrink-0">
                      Approved by: {day.reviewed_by}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleReject(day.id)}
                    className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Request Revision</span>
                  </button>
                  <button
                    onClick={() => handleApprove(day.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Day {day.day_number}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Phrasing Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  Pastoral Discipleship Fine-Tuning • Day {editingDay.day_number}
                </span>
                <h3 className="font-bold font-serif text-lg text-slate-900">
                  {editingDay.scripture_reference}
                </h3>
              </div>
              <button 
                onClick={() => setEditingDay(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">💡 Think About It (Theological Meaning):</label>
                <textarea 
                  rows={3}
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">🌿 Live It (Daily Practical Application):</label>
                <textarea 
                  rows={3}
                  value={editApplication}
                  onChange={(e) => setEditApplication(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">🙏 Pray (Daily Prayer Commitment):</label>
                <textarea 
                  rows={2}
                  value={editPrayer}
                  onChange={(e) => setEditPrayer(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">🧠 Memory Tip:</label>
                <input 
                  type="text"
                  value={editMemoryTip}
                  onChange={(e) => setEditMemoryTip(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setEditingDay(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                className="px-4 py-2 bg-primary-900 text-white text-xs font-semibold rounded-lg hover:bg-primary-950 cursor-pointer"
              >
                Save & Approve Phrasing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

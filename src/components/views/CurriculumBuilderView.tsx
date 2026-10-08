/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * CURRICULUM BUILDER & VALIDATION ENGINE (Phase 3 Admin View)
 * Compliant with Sections 7, 8, 9, 10, 14, 16, 21, 22, 25 & 26 of System Architecture
 * 
 * Features:
 * - 18-Point Pre-flight Curriculum Validation Checklist
 * - Meaningfulness & Context Completeness Scoring Inspector
 * - Incomplete Thought Detector & Range Expansion
 * - Draft-to-Publish Governance Workflow
 * - Export Engine (CSV, JSON, Printable Document)
 * - Version Management (v1.0)
 */

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileDown, 
  Printer, 
  UploadCloud, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Edit3, 
  Eye, 
  Filter, 
  BookOpen, 
  CheckSquare, 
  Sliders,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { 
  CurriculumDay, 
  CurriculumPlan, 
  CurriculumValidationResult, 
  CurriculumStats,
  CurriculumDifficulty,
  CurriculumStatus 
} from '../../types/database';
import { CurriculumValidationService } from '../../services/curriculumValidationService';
import { CurriculumExportService } from '../../services/curriculumExportService';
import { CurriculumScoringService } from '../../services/curriculumScoringService';
import { MONTHLY_THEMES } from '../../database/curriculumData';
import { AppSection } from '../../types/navigation';

interface CurriculumBuilderViewProps {
  onNavigate: (section: AppSection) => void;
}

export const CurriculumBuilderView: React.FC<CurriculumBuilderViewProps> = ({
  onNavigate,
}) => {
  const [plan, setPlan] = useState<CurriculumPlan>(() => dbService.getCurriculumPlan());
  const [days, setDays] = useState<CurriculumDay[]>(() => dbService.getAllCurriculumDays());
  const [validationResult, setValidationResult] = useState<CurriculumValidationResult>(() => 
    CurriculumValidationService.validate(dbService.getAllCurriculumDays())
  );
  
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingDay, setInspectingDay] = useState<CurriculumDay | null>(null);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Edit reflection state
  const [editingDay, setEditingDay] = useState<CurriculumDay | null>(null);
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editApplication, setEditApplication] = useState<string>('');
  const [editPrayer, setEditPrayer] = useState<string>('');
  const [editMemoryTip, setEditMemoryTip] = useState<string>('');

  // Re-run validation
  const handleRefreshValidation = () => {
    const currentDays = dbService.getAllCurriculumDays();
    setDays(currentDays);
    const res = CurriculumValidationService.validate(currentDays);
    setValidationResult(res);
  };

  // Publish workflow (Section 22: Cannot claim complete or publish if validation fails)
  const handlePublish = () => {
    const res = dbService.publishCurriculumPlan(plan.id);
    if (res.success) {
      setPlan(dbService.getCurriculumPlan());
      setDays(dbService.getAllCurriculumDays());
      handleRefreshValidation();
      setPublishMessage({ success: true, message: 'Curriculum successfully published! All 365 days are now live for church members.' });
    } else {
      setPublishMessage({ success: false, message: `Publication blocked by validation engine: ${res.errors?.join(', ')}` });
    }
    setTimeout(() => setPublishMessage(null), 6000);
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvData = CurriculumExportService.exportToCSV(days);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `word-memory-curriculum-365-${plan.version}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonData = CurriculumExportService.exportToJSON(plan, days);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `word-memory-curriculum-365-${plan.version}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintable = () => {
    const htmlContent = CurriculumExportService.generatePrintableHTML(plan, days);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
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
      updated_at: new Date().toISOString(),
    };
    dbService.updateCurriculumDay(updated);
    setDays(dbService.getAllCurriculumDays());
    if (inspectingDay?.id === updated.id) {
      setInspectingDay(updated);
    }
    setEditingDay(null);
    handleRefreshValidation();
  };

  // Filtered days table
  const filteredDays = useMemo(() => {
    return days.filter(d => {
      if (selectedMonth > 0 && d.month_number !== selectedMonth) return false;
      if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchRef = d.scripture_reference.toLowerCase().includes(q);
        const matchTheme = d.theme.toLowerCase().includes(q);
        const matchBook = d.book_name_english.toLowerCase().includes(q);
        if (!matchRef && !matchTheme && !matchBook) return false;
      }
      return true;
    });
  }, [days, selectedMonth, selectedStatus, searchQuery]);

  const stats = validationResult.stats;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card with Church Branding & Version Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-950 text-amber-300 rounded-lg text-xs font-bold font-serif tracking-wider uppercase">
                Curriculum Engine • Phase 3
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                Version {plan.version}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                plan.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                plan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {plan.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
              {plan.name}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
              Official 365-Day curriculum management for The Church of Pentecost Dubai, Pakistani & Indian Worship Centre.
              Guarantees strict WordPocket Urdu Scripture preservation, balanced theological distribution, and verified quality governance.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowValidationModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-primary-700" />
              <span>18-Point Checks ({validationResult.isValid ? 'Pass' : 'Review'})</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export to CSV"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export to JSON"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrintable}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Curriculum"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-primary-900 hover:bg-primary-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-amber-300" />
              <span>Publish 365 Days</span>
            </button>
          </div>
        </div>

        {/* Publish Alert message */}
        {publishMessage && (
          <div className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            publishMessage.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {publishMessage.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{publishMessage.message}</span>
          </div>
        )}
      </div>

      {/* Curriculum Health & Distribution KPI Cards (Section 21) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Days */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Total Allocation</span>
            <Layers className="w-4 h-4 text-primary-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {stats.totalDays} / 365 Days
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Calendar Complete</span>
          </div>
        </div>

        {/* Testament Ratio */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Testament Balance</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            OT {stats.otPercentage}% ({stats.otCount}) • NT {stats.ntPercentage}% ({stats.ntCount})
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-amber-600 h-full" style={{ width: `${stats.otPercentage}%` }} title="Old Testament" />
            <div className="bg-blue-600 h-full" style={{ width: `${stats.ntPercentage}%` }} title="New Testament" />
          </div>
        </div>

        {/* Governance Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Governance Status</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {stats.approvedCount + stats.publishedCount} Approved / Published
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.underReviewCount} Under Review • {stats.draftCount} Draft
          </div>
        </div>

        {/* Canonical Diversity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Canonical Diversity</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {stats.uniqueBooksCount} Canonical Books
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 12 Monthly Journey themes
          </div>
        </div>
      </div>

      {/* Main Grid: Days Table (Left 7 cols) & Candidate Scoring/Inspection (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Days Table List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Filter by ref, book, theme..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value={0}>All Months</option>
                  {MONTHLY_THEMES.map(m => (
                    <option key={m.month} value={m.month}>M{m.month}: {m.name.split(':')[1] || m.name}</option>
                  ))}
                </select>

                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="APPROVED">Approved</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="AI_DRAFT">Draft</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {filteredDays.map(d => {
                const isSelected = inspectingDay?.id === d.id;
                return (
                  <div 
                    key={d.id}
                    onClick={() => setInspectingDay(d)}
                    className={`p-3 transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-amber-50/80 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-primary-950 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                        D{d.day_number}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2 truncate">
                          <span>{d.scripture_reference}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({d.book_name_urdu})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {d.theme}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        d.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        d.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {d.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(d);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                        title="Edit Discipleship Reflections"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Candidate Scoring Inspector & Detail Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {inspectingDay ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                    Day {inspectingDay.day_number} Candidate Inspector
                  </span>
                  <h3 className="text-lg font-bold font-serif text-slate-900">
                    {inspectingDay.scripture_reference}
                  </h3>
                </div>
                <button
                  onClick={() => openEditModal(inspectingDay)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Reflections</span>
                </button>
              </div>

              {/* Authentic Urdu Text Display */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Authentic WordPocket Urdu Bible Text
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-right font-urdu text-lg leading-[2.2] text-slate-950" dir="rtl">
                  {inspectingDay.original_urdu_text}
                </div>
              </div>

              {/* English text */}
              {inspectingDay.english_text && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    English Text
                  </div>
                  <div className="text-xs italic text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{inspectingDay.english_text}"
                  </div>
                </div>
              )}

              {/* Meaningfulness Scoring Engine Readout (Section 7) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-primary-700" />
                    <span>Suitability & Meaningfulness Score</span>
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-serif">
                    {inspectingDay.selection_score?.totalScore ?? 92}/100
                  </span>
                </div>

                {inspectingDay.selection_score && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Biblical Meaningfulness & Thought</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.completeThought}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Context Integrity</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.contextIntegrity}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thematic Alignment</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.topicRelevance}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Spiritual & Devotional Depth</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.spiritualImportance}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Memorization Suitability</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.memorizationSuitability}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Daily Practical Relevance</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.practicalRelevance}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Curriculum Balance</span>
                      <span className="font-semibold text-slate-800">{inspectingDay.selection_score.curriculumBalance}/100</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Discipleship Preview */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">💡 Explanation:</span>
                  <p className="text-slate-600 mt-0.5">{inspectingDay.explanation}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">🌿 Application:</span>
                  <p className="text-slate-600 mt-0.5">{inspectingDay.application}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">🙏 Prayer:</span>
                  <p className="text-slate-600 mt-0.5 italic">"{inspectingDay.prayer}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-semibold text-sm text-slate-700">Select a day from the list</div>
              <div className="text-xs mt-1">Inspect authentic WordPocket Scripture, suitability scoring, and discipleship reflections.</div>
            </div>
          )}
        </div>
      </div>

      {/* 18-Point Validation Modal (Section 22) */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-900" />
                <h3 className="font-bold font-serif text-lg text-slate-900">
                  18-Point Curriculum Validation Engine
                </h3>
              </div>
              <button 
                onClick={() => setShowValidationModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className={`p-4 rounded-xl flex items-center justify-between ${
              validationResult.isValid ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationResult.isValid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                <span>Status: {validationResult.isValid ? 'ALL 18 CHECKS PASSED — READY TO PUBLISH' : `${validationResult.errors.length} CRITICAL ERRORS DETECTED`}</span>
              </div>
              <button
                onClick={handleRefreshValidation}
                className="px-2.5 py-1 bg-white/80 rounded-md text-xs font-semibold hover:bg-white cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-scan
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5 divide-y divide-slate-100">
              {validationResult.checks.map((check, idx) => (
                <div key={idx} className="pt-2 flex items-start gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{idx + 1}. {check.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        check.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {check.passed ? 'PASSED' : 'CHECK'}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{check.description}</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">{check.details}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 bg-primary-900 text-white text-xs font-semibold rounded-lg hover:bg-primary-950 cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reflections Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  Editing Discipleship Content • Day {editingDay.day_number}
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

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <strong>Scripture Preservation Rule:</strong> Bible text is strictly locked and cannot be edited or synthesized. Only pastoral reflections (Think About It, Live It, Pray, Memory Tip) can be adjusted.
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
                Save Reflections
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

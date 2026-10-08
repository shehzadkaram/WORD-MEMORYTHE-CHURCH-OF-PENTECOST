import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Send, 
  FileText, 
  Filter, 
  BookOpen, 
  Eye, 
  Lock,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { 
  AISupportingContentItem, 
  GovernanceApprovalStatus, 
  AISupportingContentType,
  UserRoleType 
} from '../../types/database';
import { AuthService } from '../../services/authService';

interface ContentGovernanceViewProps {
  activeRole: UserRoleType;
}

export const ContentGovernanceView: React.FC<ContentGovernanceViewProps> = ({ activeRole }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [items, setItems] = useState<AISupportingContentItem[]>(() => dbService.getSupportingContentItems());
  const [selectedItem, setSelectedItem] = useState<AISupportingContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canApprove = AuthService.canApproveContent(activeRole);

  const refreshItems = () => {
    setItems(dbService.getSupportingContentItems());
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && item.content_type !== typeFilter) return false;
    return true;
  });

  const handleApprove = (item: AISupportingContentItem) => {
    if (!canApprove) {
      setNotification({ type: 'error', message: 'Unauthorized: Church Members cannot approve supporting content.' });
      return;
    }
    const reviewerName = activeRole === 'ADMINISTRATOR' ? 'Pastor / Administrator' : 'Pastor / Leadership';
    const result = dbService.approveSupportingContent(item.id, reviewerName, reviewNotes);
    if (result.success) {
      setNotification({ type: 'success', message: `Approved ${item.content_type} for Day ${item.day_number} (${item.scripture_reference}).` });
      setReviewNotes('');
      refreshItems();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to approve item.' });
    }
  };

  const handleReject = (item: AISupportingContentItem) => {
    if (!canApprove) {
      setNotification({ type: 'error', message: 'Unauthorized: Church Members cannot reject supporting content.' });
      return;
    }
    const reviewerName = activeRole === 'ADMINISTRATOR' ? 'Pastor / Administrator' : 'Pastor / Leadership';
    const result = dbService.rejectSupportingContent(item.id, reviewerName, reviewNotes || 'Revision required');
    if (result.success) {
      setNotification({ type: 'success', message: `Rejected ${item.content_type} for Day ${item.day_number}. Revision requested.` });
      setReviewNotes('');
      refreshItems();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to reject item.' });
    }
  };

  const handleRequestRevision = (item: AISupportingContentItem) => {
    if (!canApprove) {
      setNotification({ type: 'error', message: 'Unauthorized.' });
      return;
    }
    const reviewerName = activeRole === 'ADMINISTRATOR' ? 'Pastor / Administrator' : 'Pastor / Leadership';
    const result = dbService.requestRevisionSupportingContent(item.id, reviewerName, reviewNotes || 'Needs theological refinement');
    if (result.success) {
      setNotification({ type: 'success', message: `Requested revision for Day ${item.day_number}.` });
      setReviewNotes('');
      refreshItems();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to request revision.' });
    }
  };

  const handlePublish = (item: AISupportingContentItem) => {
    if (!canApprove) {
      setNotification({ type: 'error', message: 'Unauthorized.' });
      return;
    }
    const reviewerName = activeRole === 'ADMINISTRATOR' ? 'Pastor / Administrator' : 'Pastor / Leadership';
    const result = dbService.publishSupportingContent(item.id, reviewerName);
    if (result.success) {
      setNotification({ type: 'success', message: `Published ${item.content_type} for Day ${item.day_number}. Visible to church members!` });
      refreshItems();
    } else {
      setNotification({ type: 'error', message: result.error || 'Failed to publish item.' });
    }
  };

  const getStatusBadge = (status: GovernanceApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
      case 'PUBLISHED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><Eye className="w-3 h-3" /> PUBLISHED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> UNDER REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#2A0845] to-[#6441A5] rounded-xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Theological Oversight
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                Non-Scripture Content Only
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              AI Supporting Content Governance
            </h1>
            <p className="text-xs sm:text-sm text-purple-100">
              Mandatory Leadership Approval • Scripture Protection • Unapproved Content Remains Quarantined
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Church Governance Policy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 text-xs text-amber-950 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Strict Church Governance Mandate (Prompt Section 4 & 5)</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          AI may assist <strong>only</strong> with non-Scripture supporting material (explanations, applications, reflection questions, prayer prompts, memory tips). <strong>AI is strictly forbidden from generating, translating, or modifying Bible verses.</strong> No AI-generated content is exposed to congregation members until verified and approved by Pastor/Leadership.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-2xs ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Status:
          </span>
          {['ALL', 'UNDER_REVIEW', 'AI_DRAFT', 'APPROVED', 'PUBLISHED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${statusFilter === st ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Content Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-800"
          >
            <option value="ALL">All Supporting Types</option>
            <option value="EXPLANATION">Explanation (Urdu & English)</option>
            <option value="APPLICATION">Practical Application</option>
            <option value="REFLECTION_QUESTION">Reflection Question</option>
            <option value="PRAYER_PROMPT">Prayer Prompt</option>
            <option value="MEMORY_TIP">Memory Tip</option>
          </select>
        </div>
      </div>

      {/* Content Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No supporting content items match the selected filters.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 transition-all"
            >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      Day {item.day_number}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {item.scripture_reference}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {item.content_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.status === 'PUBLISHED' && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Visible to Members
                      </span>
                    )}
                    {item.status !== 'PUBLISHED' && item.status !== 'APPROVED' && (
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Hidden from Members
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Comparison (Urdu and English) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Urdu Supporting Content (اردو مواد)
                    </div>
                    <p className="text-slate-800 leading-relaxed font-serif text-sm" dir="rtl">
                      {item.content_urdu || (item as any).content_ur}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      English Supporting Content
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      {item.content_english || (item as any).content_en}
                    </p>
                  </div>
                </div>

                {/* Review Notes / Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
                  <div>
                    <span>Author / Source: {item.author_source || (item as any).author_type}</span>
                    {item.reviewer && (
                      <span className="ml-3 font-semibold text-slate-700">
                        • Reviewed by: {item.reviewer}
                      </span>
                    )}
                    {item.review_notes && (
                      <span className="ml-2 italic text-slate-600">
                        ("{item.review_notes}")
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px]">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Leadership Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {!canApprove ? (
                    <div className="text-[11px] text-slate-400 italic">
                      View-only mode: Pastoral or Administrator role required to approve or publish content.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Optional pastoral notes..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 w-48 sm:w-64"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {item.status !== 'APPROVED' && item.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleApprove(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-2xs"
                            title="Approve for publication"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Content</span>
                          </button>
                        )}

                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePublish(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish to Members</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRequestRevision(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>

                        <button
                          onClick={() => handleReject(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
};

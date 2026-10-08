import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Trophy, 
  Lock, 
  Sparkles,
  ArrowRight,
  Flame,
  Plus,
  Play,
  Pause,
  Archive,
  Star,
  BookOpen,
  ShieldCheck,
  Check,
  Info,
  Clock
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { ChurchChallenge, ChallengeParticipant, MemberMilestone, ChallengeType } from '../../types/database';
import { AppSection } from '../../types/navigation';

interface ChurchChallengesViewProps {
  onNavigate: (section: AppSection) => void;
}

export const ChurchChallengesView: React.FC<ChurchChallengesViewProps> = ({ onNavigate }) => {
  const activeUser = dbService.getActiveUser();
  const activeRole = dbService.getActiveRole();
  const isPastorOrAdmin = activeRole === 'ADMINISTRATOR' || activeRole === 'PASTOR_LEADERSHIP';

  const [challenges, setChallenges] = useState<ChurchChallenge[]>(() => dbService.getChallenges());
  const [participations, setParticipations] = useState<ChallengeParticipant[]>(() => 
    dbService.getMemberChallengeParticipation(activeUser.id)
  );
  const [milestones, setMilestones] = useState<MemberMilestone[]>(() => {
    // Automatically evaluate milestones on view
    return dbService.evaluateAndAwardMilestones(activeUser.id).allMilestones;
  });
  const [activeTab, setActiveTab] = useState<'challenges' | 'milestones' | 'oversight'>('challenges');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New challenge form state for Pastors/Admins
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newType, setNewType] = useState<ChallengeType>('MONTHLY');
  const [newTargetVerses, setNewTargetVerses] = useState(30);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState('');

  const streakInfo = dbService.calculateUserStreak(activeUser.id);
  const pastoralMetrics = dbService.getPastoralChallengeMetrics();

  const reloadData = () => {
    setChallenges(dbService.getChallenges());
    setParticipations(dbService.getMemberChallengeParticipation(activeUser.id));
    setMilestones(dbService.getMilestones(activeUser.id));
  };

  const handleJoin = (challengeId: string) => {
    const res = dbService.joinChallenge(challengeId, activeUser.id);
    if (res.success) {
      setActionFeedback(res.message);
      reloadData();
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleLeave = (challengeId: string, challengeTitle: string) => {
    if (window.confirm(`Are you sure you want to leave "${challengeTitle}"? Your completed verses will remain safely stored in your personal memorization journal.`)) {
      const res = dbService.leaveChallenge(challengeId, activeUser.id);
      if (res.success) {
        setActionFeedback(`You have stepped back from "${challengeTitle}". You may rejoin at any time.`);
        reloadData();
      }
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleToggleStatus = (challengeId: string, currentStatus: string) => {
    if (!isPastorOrAdmin) return;
    try {
      if (currentStatus === 'ACTIVE') {
        dbService.pauseChallenge(challengeId);
        setActionFeedback('Challenge paused.');
      } else if (currentStatus === 'PAUSED' || currentStatus === 'UPCOMING') {
        dbService.activateChallenge(challengeId);
        setActionFeedback('Challenge activated for congregation.');
      }
      reloadData();
    } catch (e: unknown) {
      setActionFeedback(`Error: ${e instanceof Error ? e.message : 'Action failed'}`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      dbService.createChallenge({
        title: newTitle.trim(),
        tagline: newTagline.trim() || '',
        challenge_type: newType,
        target_unit: 'VERSES',
        curriculum_scope: 'ALL',
        target: Number(newTargetVerses),
        target_verses_count: Number(newTargetVerses),
        start_date: newStartDate,
        end_date: newEndDate,
        description: newDescription.trim(),
        status: 'ACTIVE',
      });

      setActionFeedback(`Challenge "${newTitle}" created and opened for congregational enrollment.`);
      setShowCreateModal(false);
      setNewTitle('');
      setNewTagline('');
      setNewDescription('');
      reloadData();
    } catch (err: unknown) {
      setActionFeedback(`Error: ${err instanceof Error ? err.message : 'Failed to create challenge'}`);
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const filteredChallenges = (challenges || []).filter(c => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ENROLLED') {
      return (participations || []).some(p => p.challenge_id === c.id);
    }
    const cType = c.challenge_type || (c as any).type || '';
    return cType === filterType || cType.includes(filterType);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Phase 8 • Discipleship & Motivation
                </span>
                <span className="text-xs font-mono text-slate-400">• Section 17</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Congregational Challenges & Spiritual Milestones
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              Pakistani & Indian Worship Centre • Dubai
            </div>
            {isPastorOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B2545] hover:bg-[#133E87] text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Challenge</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Church-wide spiritual initiatives encouraging members and families to collectively hide God's Word in their hearts. Run your race with endurance, looking unto Jesus.
        </p>

        {/* Member Streak and Participation Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Daily Streak</div>
              <div className="text-base font-extrabold text-slate-900">
                {streakInfo.currentStreak} <span className="text-[11px] font-normal text-slate-500">Days</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Enrolled</div>
              <div className="text-base font-extrabold text-slate-900">
                {participations.filter(p => !p.is_completed).length} <span className="text-[11px] font-normal text-slate-500">Challenges</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Badges Earned</div>
              <div className="text-base font-extrabold text-slate-900">
                {milestones.length} <span className="text-[11px] font-normal text-slate-500">Milestones</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Completed</div>
              <div className="text-base font-extrabold text-slate-900">
                {participations.filter(p => p.is_completed).length} <span className="text-[11px] font-normal text-slate-500">Finished</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionFeedback}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Church Challenges ({challenges.length})
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Spiritual Milestones & Badges ({milestones.length})
          </button>
          {isPastorOrAdmin && (
            <button
              onClick={() => setActiveTab('oversight')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'oversight'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              Pastoral Oversight ({pastoralMetrics.totalParticipantsEnrolled} enrollments)
            </button>
          )}
        </div>

        {activeTab === 'challenges' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Filter:</span>
            {['ALL', 'ENROLLED', '30_DAY', '365_DAY', 'THEMATIC'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterType === f
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {String(f || '').replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Challenges List */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {filteredChallenges.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No challenges match the selected filter.
            </div>
          ) : (
            filteredChallenges.map((c) => {
              if (!c) return null;
              const participation = (participations || []).find(p => p.challenge_id === c.id);
              const isEnrolled = !!participation;
              const isCompleted = !!participation?.is_completed;
              const progressCount = participation?.verses_completed ?? (participation as any)?.completed_verses_count ?? 0;
              const targetCount = c.target_verses_count || c.target || 30;
              const percent = Math.min(100, Math.round((progressCount / Math.max(1, targetCount)) * 100));
              const challengeTypeLabel = String(c.challenge_type || (c as any).type || 'CHALLENGE').replace(/_/g, ' ');

              let durationDays = (c as any).duration_days;
              if (!durationDays && c.start_date && c.end_date) {
                const diffTime = Math.abs(new Date(c.end_date).getTime() - new Date(c.start_date).getTime());
                durationDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
              }

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border p-6 shadow-2xs transition-all space-y-4 ${
                    isCompleted
                      ? 'border-emerald-300 bg-gradient-to-r from-white via-emerald-50/20 to-white'
                      : isEnrolled
                      ? 'border-amber-400/90'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#0B2545] text-amber-400 font-bold text-xs rounded-lg">
                        {targetCount} Verses Goal
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : c.status === 'PAUSED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {challengeTypeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{c.start_date} to {c.end_date}</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">
                        {durationDays || 30} Days
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">{c.title}</h2>
                    {c.tagline && (
                      <p className="text-xs font-semibold text-amber-700 italic mt-0.5">{c.tagline}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.description}</p>
                  </div>

                  {/* Real Participation Progress Bar */}
                  {isEnrolled && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          {isCompleted ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Challenge Goal Completed! Praise the Lord!
                            </span>
                          ) : (
                            <span>Your Progress: {progressCount} of {c.target_verses_count} Verses</span>
                          )}
                        </div>
                        <span className="font-extrabold text-[#0B2545] font-mono">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Joined on: {participation.joined_at ? new Date(participation.joined_at).toLocaleDateString() : 'Active'}</span>
                        {participation.last_activity_at && (
                          <span>Last Activity: {new Date(participation.last_activity_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>Milestone Badge Inscribed</span>
                        </div>
                      ) : isEnrolled ? (
                        <button
                          onClick={() => onNavigate('memorize')}
                          className="inline-flex items-center gap-1.5 font-bold text-[#0B2545] hover:text-amber-700 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <span>Continue Memorizing Today</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400">Open to all church members in Dubai</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPastorOrAdmin && (
                        <button
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title={c.status === 'ACTIVE' ? 'Pause Challenge' : 'Activate Challenge'}
                        >
                          {c.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        </button>
                      )}

                      {isEnrolled ? (
                        <button
                          onClick={() => handleLeave(c.id, c.title)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                        >
                          Leave Challenge
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(c.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B2545] hover:bg-[#133E87] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                          <span>Join Challenge</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Member Milestones & Badges Showcase */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Biblical Spiritual Milestones</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every milestone reflects steadfast dedication to hiding God's Word in your heart. These honors are private markers of spiritual formation, celebrating consistency, memory depth, and faithful practice before the Lord.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((m) => (
              <div 
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {m.category || 'MILESTONE'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.awarded_at ? new Date(m.awarded_at).toLocaleDateString() : 'Awarded'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{m.title}</h3>
                      {m.urdu_title && (
                        <span className="font-urdu text-xs font-bold text-amber-800">{m.urdu_title}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{m.description}</p>
                  </div>
                </div>

                {Boolean((m as any).scripture_verse_key) && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Reference: <strong>{(m as any).scripture_verse_key}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Potential Upcoming Milestones */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Future Discipleship Milestones in Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">30-Day Word Conqueror</div>
                <div className="text-[11px] text-slate-500">Achieve 30 consecutive days of Scripture memory or spaced review.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">100-Verse Centurion</div>
                <div className="text-[11px] text-slate-500">Commit 100 canonical verses indelibly to memory.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800">Annual 365 Champion</div>
                <div className="text-[11px] text-slate-500">Complete the full 12-month Word Memory curriculum.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pastoral Leadership Oversight (Restricted to Pastors / Admins) */}
      {activeTab === 'oversight' && isPastorOrAdmin && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Pastoral Discipleship Care & Congregational Challenge Health</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Pastoral statistics are aggregated across all church challenges. In alignment with church governance and Christian fellowship, <strong>no individual member notes, private reflections, or member-versus-member scoreboards are shown</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500">Total Church Challenges</div>
              <div className="text-2xl font-black text-slate-900">{pastoralMetrics.totalChallengesCount}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">{pastoralMetrics.activeChallengesCount} Active Now</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500">Total Enrollments</div>
              <div className="text-2xl font-black text-[#0B2545]">{pastoralMetrics.totalParticipantsEnrolled}</div>
              <div className="text-[11px] text-slate-500">Across all church initiatives</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500">Active Participants</div>
              <div className="text-2xl font-black text-amber-600">{pastoralMetrics.uniqueParticipantsCount}</div>
              <div className="text-[11px] text-slate-500">Distinct members active</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500">Congregational Completion</div>
              <div className="text-2xl font-black text-purple-700">{pastoralMetrics.overallCompletionRate}%</div>
              <div className="text-[11px] text-purple-600 font-semibold">{pastoralMetrics.totalCompletedParticipations} Finishers</div>
            </div>
          </div>

          {/* Detailed Challenge Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Congregational Initiative Summary</h3>
            <div className="divide-y divide-slate-100">
              {pastoralMetrics.challengesBreakdown.map(b => {
                const fullChallenge = challenges.find(c => c.id === b.id);

                return (
                  <div key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{b.title}</span>
                      <span className="text-slate-500">
                        {String((b as any)?.challenge_type || b?.type || 'CHALLENGE').replace(/_/g, ' ')} • {fullChallenge?.target_verses_count || 30} Verses • {fullChallenge?.start_date || 'Ongoing'} to {fullChallenge?.end_date || 'Ongoing'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{b.participantsCount} Enrolled</span>
                        <div className="text-[11px] text-emerald-600">{b.completedCount} Completed ({b.completionRate}%)</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pastoral Privacy Safeguard Notice (Prompt Mandate) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-800">Non-Competitive Privacy Protocol:</span>
          <p>
            Member progress is private. Community dashboards present aggregate congregation metrics only. No leaderboards, member-versus-member comparisons, or private scores are displayed.
          </p>
        </div>
      </div>

      {/* Modal: Create Church Challenge (Pastors & Admins) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Create Congregational Challenge</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Challenge Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 30-Day Gospel of John Memory"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Devotional Tagline</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={e => setNewTagline(e.target.value)}
                  placeholder="e.g. Abide in Christ and His Words"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Challenge Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="MONTHLY">Monthly 30-Day</option>
                    <option value="DAILY">Daily Intensive</option>
                    <option value="WEEKLY">Weekly Rhythm</option>
                    <option value="CUSTOM">Custom Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Verses Goal *</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={newTargetVerses}
                    onChange={e => setNewTargetVerses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={e => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Pastoral Direction *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Explain the pastoral vision and spiritual outcome for members participating in this challenge..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133E87] text-white font-bold cursor-pointer"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

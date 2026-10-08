import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  User, 
  Layers,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../database/dbService';
import { AuditLog, AuditActionType } from '../../types/database';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => dbService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.actor_name.toLowerCase().includes(q) ||
        log.affected_entity.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = JSON.stringify(filteredLogs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadgeColor = (action: AuditActionType) => {
    if (action.includes('APPROVE') || action.includes('PUBLISH')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('REJECT') || action.includes('DEACTIVATE')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (action.includes('ROLE') || action.includes('USER')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (action.includes('IMPORT') || action.includes('RESTORE')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1A1F2C] to-[#2E384D] rounded-xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Forensic Audit Trail
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 uppercase tracking-wider font-mono">
                {logs.length} Total Events
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ClipboardList className="w-6 h-6 text-amber-400" />
              Governance Audit Trail & Event Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Immutable historical log of all curriculum approvals, AI content decisions, role changes, and system events
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON!' : 'Copy Audit JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, entity, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-800"
          >
            <option value="ALL">All Event Types</option>
            <option value="CURRICULUM_APPROVE">CURRICULUM_APPROVE</option>
            <option value="CURRICULUM_REJECT">CURRICULUM_REJECT</option>
            <option value="CURRICULUM_PUBLISH">CURRICULUM_PUBLISH</option>
            <option value="CONTENT_APPROVE">CONTENT_APPROVE</option>
            <option value="CONTENT_REJECT">CONTENT_REJECT</option>
            <option value="CONTENT_PUBLISH">CONTENT_PUBLISH</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
            <option value="BIBLE_IMPORT_INITIATED">BIBLE_IMPORT_INITIATED</option>
            <option value="SYSTEM_BACKUP">SYSTEM_BACKUP</option>
          </select>
        </div>
      </div>

      {/* Events Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit records found matching the query.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">{log.details}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px] shrink-0 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      Actor: {log.actor_name} ({log.actor_role})
                    </span>
                    <span>•</span>
                    <span>Entity: <span className="font-mono text-slate-700">{log.affected_entity}</span></span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {log.id}</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-0.5 text-[11px]"
                    >
                      <span>{isExpanded ? 'Hide Metadata' : 'View Metadata'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {isExpanded && log.metadata && (
                  <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[10px] overflow-x-auto">
                    <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Info, Database, ShieldCheck } from 'lucide-react';
import { DEMO_NOTICE } from '../../database/demoData';

interface DemoBannerProps {
  onOpenSchema?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSchema }) => {
  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Phase 1 Foundation
          </span>
          <p className="font-medium text-amber-900 leading-snug">
            {DEMO_NOTICE}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>SQLite Local-First Engine</span>
          </div>

          {onOpenSchema && (
            <button
              onClick={onOpenSchema}
              className="inline-flex items-center gap-1 font-semibold text-amber-950 hover:text-amber-800 bg-amber-200/70 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
            >
              <Database className="w-3 h-3" />
              <span>Inspect 20 Tables (SQL Schema)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

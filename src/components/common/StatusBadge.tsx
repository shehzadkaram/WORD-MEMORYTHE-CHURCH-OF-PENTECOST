import React from 'react';
import { MemorizationStatus } from '../../types/database';
import { MEMORIZATION_STATUS_META } from '../../services/memorizationEngine';

interface StatusBadgeProps {
  status: MemorizationStatus;
  size?: 'sm' | 'md';
  showUrdu?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showUrdu = true 
}) => {
  const meta = MEMORIZATION_STATUS_META[status] || MEMORIZATION_STATUS_META.NOT_STARTED;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${meta.badgeClass} ${padding}`}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: meta.color }} 
      />
      <span>{meta.label}</span>
      {showUrdu && (
        <span className="opacity-75 font-urdu text-[11px] mr-0.5">({meta.urduLabel})</span>
      )}
    </span>
  );
};

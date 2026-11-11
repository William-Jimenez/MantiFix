import React from 'react';
import { WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  pulse?: boolean;
}

const STATUS_STYLES: Record<
  WorkOrderStatus,
  { bg: string; text: string; dot: string }
> = {
  Pendiente: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#92400E]',
    dot: 'bg-[#F59E0B]',
  },
  'En Proceso': {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#3B82F6]',
  },
  Resuelta: {
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#065F46]',
    dot: 'bg-[#10B981]',
  },
  Urgente: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#991B1B]',
    dot: 'bg-[#EF4444]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false }) => {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap ${style.bg} ${style.text}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && status === 'Urgente' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`} />
      </span>
      {status}
    </span>
  );
};

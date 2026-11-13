import React from 'react';
import { WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<
  WorkOrderStatus,
  { border: string; text: string; dot: string; label: string }
> = {
  Urgente: {
    border: 'border-[#ff2936]',
    text: 'text-white',
    dot: 'bg-[#ff2936]',
    label: '[ URGENTE ]',
  },
  'En Proceso': {
    border: 'border-white/40',
    text: 'text-white',
    dot: 'bg-white',
    label: '[ EN PROCESO ]',
  },
  Pendiente: {
    border: 'border-white/20',
    text: 'text-white/75',
    dot: 'bg-white/40',
    label: '[ PENDIENTE ]',
  },
  Resuelta: {
    border: 'border-white/30',
    text: 'text-white/90',
    dot: 'bg-white/70',
    label: '[ RESUELTA ]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['Pendiente'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#000000] border ${config.border} ${config.text} text-[11px] uppercase tracking-wider font-medium whitespace-nowrap`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && status === 'Urgente' && (
          <span className="animate-ping absolute inline-flex h-full w-full bg-[#ff2936] opacity-75" />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};

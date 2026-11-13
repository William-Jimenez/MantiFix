import React, { useState } from 'react';
import { X, Clock, MapPin, Wrench, UserCheck, Send, CheckCircle2 } from 'lucide-react';
import { Technician, WorkOrder, WorkOrderStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface TicketDrawerProps {
  order: WorkOrder | null;
  technicians: Technician[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: WorkOrderStatus) => void;
  onAssignTechnician: (orderId: string, techName: string | null) => void;
  onAddNote: (orderId: string, note: string) => void;
}

const NODE_COLORS = {
  neutral: 'bg-white/40',
  warning: 'bg-white/70',
  info: 'bg-white',
  success: 'bg-white',
  critical: 'bg-[#ff2936]',
};

export const TicketDrawer: React.FC<TicketDrawerProps> = ({
  order,
  technicians,
  onClose,
  onUpdateStatus,
  onAssignTechnician,
  onAddNote,
}) => {
  const [note, setNote] = useState('');

  if (!order) return null;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddNote(order.id, note.trim());
    setNote('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#000000] text-white h-full border-l border-white/20 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-white/15 flex items-start justify-between gap-4 bg-[#000000]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs text-white border border-white/30 px-2 py-0.5 bg-[#101010]">
                [{order.id}]
              </span>
              <StatusBadge status={order.status} pulse={order.priority === 'P1'} />
              <span className="text-[11px] uppercase tracking-wider text-white/60">
                [PRIORIDAD {order.priority}]
              </span>
            </div>
            <h2 className="text-xl font-editorial tracking-tight text-white leading-snug">
              {order.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de detalle"
            className="p-1.5 text-white/60 hover:text-white border border-transparent hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Operational Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#101010] border border-white/15">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-white/60 mb-1.5">
                Estado de la Orden
              </label>
              <select
                value={order.status}
                onChange={(e) =>
                  onUpdateStatus(order.id, e.target.value as WorkOrderStatus)
                }
                className="w-full h-9 px-3 bg-[#000000] border border-white/25 text-[13px] text-white focus:outline-none focus:border-white"
              >
                <option value="Pendiente" className="bg-[#000000] text-white">Pendiente</option>
                <option value="En Proceso" className="bg-[#000000] text-white">En Proceso</option>
                <option value="Urgente" className="bg-[#000000] text-white">Urgente</option>
                <option value="Resuelta" className="bg-[#000000] text-white">Resuelta</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-white/60 mb-1.5">
                Técnico Asignado
              </label>
              <select
                value={order.assignedTo ?? ''}
                onChange={(e) =>
                  onAssignTechnician(
                    order.id,
                    e.target.value ? e.target.value : null
                  )
                }
                className="w-full h-9 px-3 bg-[#000000] border border-white/25 text-[13px] text-white focus:outline-none focus:border-white"
              >
                <option value="" className="bg-[#000000] text-white">Sin asignar</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.name} className="bg-[#000000] text-white">
                    {tech.name} ({tech.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-2">
              [ DESCRIPCIÓN TÉCNICA ]
            </h3>
            <p className="text-[14px] leading-relaxed text-white/90 font-light">
              {order.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/15">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">
                  Ubicación
                </div>
                <div className="text-[13px] text-white font-medium">
                  {order.building}
                </div>
                <div className="text-[12px] text-white/60">{order.zone}</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">
                  Activo Asociado
                </div>
                <div className="text-[13px] text-white font-medium">
                  {order.assetName}
                </div>
                <div className="font-mono text-[12px] text-white/60">
                  [{order.assetSerial}]
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">
                  Ventana SLA
                </div>
                <div className="text-[13px] font-mono font-medium text-white">
                  {order.slaRemaining}
                </div>
                <div className="text-[11px] text-white/50">
                  Creada: {order.createdAt}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-white/50">
                  Solicitante & Costo
                </div>
                <div className="text-[13px] text-white font-medium">
                  {order.requester}
                </div>
                <div className="text-[12px] text-white/60 font-mono">
                  ${order.estimatedCost.toLocaleString('en-US')} USD
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Timeline & Audit Trail */}
          <div className="pt-4 border-t border-white/15">
            <h3 className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-4">
              [ BITÁCORA DE MANTENIMIENTO Y AUDITORÍA ]
            </h3>
            <div className="relative pl-5 space-y-5 before:content-[''] before:absolute before:left-[4px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-white/20">
              {order.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <span
                    className={`absolute -left-5 top-1.5 w-[9px] h-[9px] border border-black ${
                      NODE_COLORS[event.tone]
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-white">
                      {event.action}
                    </span>
                    <span className="font-mono text-[11px] text-white/60 shrink-0">
                      {event.timestamp}
                    </span>
                  </div>
                  <div className="text-[12px] text-white/50 mt-0.5">
                    {event.actor} · [{event.role}]
                  </div>
                  {event.detail && (
                    <p className="mt-1.5 text-[12px] text-white/80 bg-[#101010] border border-white/15 p-2.5 font-light">
                      {event.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer: Add Audit Note & Quick Resolve */}
        <div className="p-4 border-t border-white/15 bg-[#000000] space-y-3">
          <form onSubmit={handleNoteSubmit} className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agregar nota técnica a la bitácora..."
              className="flex-1 h-9 px-3 bg-[#101010] border border-white/20 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              disabled={!note.trim()}
              className="h-9 px-4 bg-white text-black text-[12px] uppercase tracking-wider font-semibold hover:bg-black hover:text-white border border-white disabled:opacity-30 transition-colors inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Registrar</span>
            </button>
          </form>

          {order.status !== 'Resuelta' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'Resuelta')}
              className="w-full h-9 bg-[#101010] hover:bg-white hover:text-black border border-white text-white text-[12px] uppercase tracking-wider font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Orden como Resuelta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

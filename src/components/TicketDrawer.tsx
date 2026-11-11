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
  neutral: 'bg-[#94A3B8]',
  warning: 'bg-[#F59E0B]',
  info: 'bg-[#3B82F6]',
  success: 'bg-[#10B981]',
  critical: 'bg-[#EF4444]',
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
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full border-l border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-4 bg-[#F8FAFC]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono-code text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded">
                {order.id}
              </span>
              <StatusBadge status={order.status} pulse={order.priority === 'P1'} />
              <span className="text-xs font-semibold text-[#64748B] tabular-nums">
                Prioridad {order.priority}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A] leading-snug">
              {order.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de detalle"
            className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Operational Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5">
                Estado de la Orden
              </label>
              <select
                value={order.status}
                onChange={(e) =>
                  onUpdateStatus(order.id, e.target.value as WorkOrderStatus)
                }
                className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Urgente">Urgente</option>
                <option value="Resuelta">Resuelta</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5">
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
                className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="">Sin asignar</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.name}>
                    {tech.name} ({tech.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2">
              Descripción Técnica
            </h3>
            <p className="text-[14px] leading-relaxed text-[#334155]">
              {order.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Ubicación
                </div>
                <div className="text-[13px] font-medium text-[#0F172A]">
                  {order.building}
                </div>
                <div className="text-[12px] text-[#64748B]">{order.zone}</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Activo Asociado
                </div>
                <div className="text-[13px] font-medium text-[#0F172A]">
                  {order.assetName}
                </div>
                <div className="font-mono-code text-[12px] text-[#64748B]">
                  {order.assetSerial}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Ventana SLA
                </div>
                <div className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
                  {order.slaRemaining}
                </div>
                <div className="text-[12px] text-[#64748B] tabular-nums">
                  Creada: {order.createdAt}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-[#64748B] mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Solicitante & Costo Est.
                </div>
                <div className="text-[13px] font-medium text-[#0F172A]">
                  {order.requester}
                </div>
                <div className="text-[12px] text-[#64748B] tabular-nums">
                  ${order.estimatedCost.toLocaleString('en-US')} USD
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Timeline & Audit Trail */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-4">
              Bitácora de Mantenimiento y Auditoría
            </h3>
            <div className="relative pl-5 space-y-5 before:content-[''] before:absolute before:left-[4.5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-[#E2E8F0]">
              {order.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <span
                    className={`absolute -left-5 top-1.5 w-[10px] h-[10px] rounded-full ring-2 ring-white ${
                      NODE_COLORS[event.tone]
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#0F172A]">
                      {event.action}
                    </span>
                    <span className="font-mono-code text-[11px] text-[#64748B] tabular-nums shrink-0">
                      {event.timestamp}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#64748B] mt-0.5">
                    {event.actor} · {event.role}
                  </div>
                  {event.detail && (
                    <p className="mt-1.5 text-[12px] text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2.5 py-1.5">
                      {event.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer: Add Audit Note & Quick Resolve */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
          <form onSubmit={handleNoteSubmit} className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agregar nota técnica a la bitácora..."
              className="flex-1 h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
            <button
              type="submit"
              disabled={!note.trim()}
              className="h-9 px-3.5 rounded-lg bg-[#0F172A] text-white text-[13px] font-medium hover:bg-[#1E293B] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Registrar
            </button>
          </form>

          {order.status !== 'Resuelta' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'Resuelta')}
              className="w-full h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Marcar Orden como Resuelta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

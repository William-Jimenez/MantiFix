import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FacilityAsset, PriorityLevel, Technician, WorkOrder } from '../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: FacilityAsset[];
  technicians: Technician[];
  preselectedAssetSerial?: string;
  onCreate: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'timeline'>) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  assets,
  technicians,
  preselectedAssetSerial,
  onCreate,
}) => {
  const defaultAsset =
    assets.find((a) => a.serial === preselectedAssetSerial) ?? assets[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetSerial, setAssetSerial] = useState(defaultAsset?.serial ?? '');
  const [priority, setPriority] = useState<PriorityLevel>('P2');
  const [assignedTo, setAssignedTo] = useState<string>('');

  if (!isOpen) return null;

  const selectedAsset =
    assets.find((a) => a.serial === assetSerial) ?? assets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedAsset) return;

    onCreate({
      title: title.trim(),
      description:
        description.trim() ||
        'Solicitud operativa generada desde consola central MantiFix.',
      building: selectedAsset.building,
      zone: selectedAsset.zone,
      assetName: selectedAsset.name,
      assetSerial: selectedAsset.serial,
      category: selectedAsset.category,
      status: priority === 'P1' ? 'Urgente' : assignedTo ? 'En Proceso' : 'Pendiente',
      priority,
      assignedTo: assignedTo || null,
      requester: 'Coordinación de Operaciones',
      slaRemaining: priority === 'P1' ? '01h 00m' : priority === 'P2' ? '04h 00m' : '12h 00m',
      estimatedCost: 450,
    });

    setTitle('');
    setDescription('');
    setPriority('P2');
    setAssignedTo('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Nueva Solicitud de Mantenimiento
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Registra una orden de trabajo y asígnala a la cola operativa.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-1">
              Título del Incidente <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Falla en sensor de presión Chiller #2"
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Activo / Equipo <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={assetSerial}
                onChange={(e) => setAssetSerial(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.serial}>
                    {asset.name} ({asset.serial})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Prioridad SLA <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              >
                <option value="P1">P1 — Crítica (1h)</option>
                <option value="P2">P2 — Alta (4h)</option>
                <option value="P3">P3 — Media (12h)</option>
                <option value="P4">P4 — Baja (24h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-1">
              Asignar Técnico (Opcional)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            >
              <option value="">Dejar en cola sin asignar</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.name}>
                  {tech.name} — {tech.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-1">
              Descripción Técnica
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla síntomas, lecturas de sensores o instrucciones de acceso..."
              className="w-full p-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#334155] hover:bg-[#F8FAFC] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition-colors"
            >
              Crear Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

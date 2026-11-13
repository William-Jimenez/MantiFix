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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#000000] border border-white/25 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/15 flex items-center justify-between bg-[#000000]">
          <div>
            <h2 className="text-xl font-editorial tracking-tight text-white">
              Nueva Solicitud de Mantenimiento
            </h2>
            <p className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
              [ REGISTRO Y DESPACHO EN COLA OPERATIVA ]
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-white/60 hover:text-white border border-transparent hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-white/70 mb-1">
              Título del Incidente <span className="text-[#ff2936]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Falla en sensor de presión Chiller #2"
              className="w-full h-9 px-3 bg-[#101010] border border-white/20 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-white/70 mb-1">
                Activo / Equipo <span className="text-[#ff2936]">*</span>
              </label>
              <select
                value={assetSerial}
                onChange={(e) => setAssetSerial(e.target.value)}
                className="w-full h-9 px-3 bg-[#101010] border border-white/20 text-[13px] text-white focus:outline-none focus:border-white"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.serial} className="bg-[#000000] text-white">
                    {asset.name} ({asset.serial})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] text-white/70 mb-1">
                Prioridad SLA <span className="text-[#ff2936]">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full h-9 px-3 bg-[#101010] border border-white/20 text-[13px] text-white focus:outline-none focus:border-white"
              >
                <option value="P1" className="bg-[#000000] text-white">P1 — Crítica (1h)</option>
                <option value="P2" className="bg-[#000000] text-white">P2 — Alta (4h)</option>
                <option value="P3" className="bg-[#000000] text-white">P3 — Media (12h)</option>
                <option value="P4" className="bg-[#000000] text-white">P4 — Baja (24h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-white/70 mb-1">
              Asignar Técnico (Opcional)
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 px-3 bg-[#101010] border border-white/20 text-[13px] text-white focus:outline-none focus:border-white"
            >
              <option value="" className="bg-[#000000] text-white">Dejar en cola sin asignar</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.name} className="bg-[#000000] text-white">
                  {tech.name} — {tech.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-white/70 mb-1">
              Descripción Técnica
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla síntomas, lecturas de sensores o instrucciones de acceso..."
              className="w-full p-3 bg-[#101010] border border-white/20 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 border border-white/25 bg-[#000000] text-white/70 hover:text-white hover:border-white text-[12px] uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-5 bg-white text-black hover:bg-black hover:text-white border border-white text-[12px] uppercase tracking-wider font-semibold transition-colors"
            >
              Crear Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

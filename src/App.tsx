import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  UserPlus,
  Wrench,
} from 'lucide-react';
import {
  FacilityAsset,
  NavView,
  Technician,
  WorkOrder,
  WorkOrderStatus,
} from './types';
import {
  INITIAL_ASSETS,
  INITIAL_TECHNICIANS,
  INITIAL_WORK_ORDERS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { StatusBadge } from './components/StatusBadge';
import { TicketDrawer } from './components/TicketDrawer';
import { CreateTicketModal } from './components/CreateTicketModal';

const STATUS_FILTERS: ('Todas' | WorkOrderStatus)[] = [
  'Todas',
  'Urgente',
  'Pendiente',
  'En Proceso',
  'Resuelta',
];

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [assets] = useState<FacilityAsset[]>(INITIAL_ASSETS);
  const [technicians] = useState<Technician[]>(INITIAL_TECHNICIANS);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | WorkOrderStatus>('Todas');
  const [buildingFilter, setBuildingFilter] = useState<string>('Todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [preselectedAssetSerial, setPreselectedAssetSerial] = useState<string | undefined>(
    undefined
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const openOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== 'Resuelta').length,
    [orders]
  );
  const urgentOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Urgente').length,
    [orders]
  );
  const criticalAssetsCount = useMemo(
    () => assets.filter((a) => a.health === 'Crítico').length,
    [assets]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'Todas' && order.status !== statusFilter) return false;
      if (buildingFilter !== 'Todos' && order.building !== buildingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          order.id.toLowerCase().includes(q) ||
          order.title.toLowerCase().includes(q) ||
          order.assetName.toLowerCase().includes(q) ||
          order.assetSerial.toLowerCase().includes(q) ||
          (order.assignedTo?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, buildingFilter, searchQuery]);

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleOrders: WorkOrder[]) => {
    const visibleIds = visibleOrders.map((o) => o.id);
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: WorkOrderStatus) => {
    const now = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              slaRemaining: newStatus === 'Resuelta' ? 'Completada' : o.slaRemaining,
              timeline: [
                ...o.timeline,
                {
                  id: `ev-${Date.now()}`,
                  timestamp: now,
                  actor: 'Coordinación de Operaciones',
                  role: 'Supervisor',
                  action: `Estado actualizado a ${newStatus}`,
                  tone:
                    newStatus === 'Resuelta'
                      ? 'success'
                      : newStatus === 'Urgente'
                      ? 'critical'
                      : 'info',
                },
              ],
            }
          : o
      )
    );
  };

  const handleAssignTechnician = (orderId: string, techName: string | null) => {
    const now = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assignedTo: techName,
              status: techName && o.status === 'Pendiente' ? 'En Proceso' : o.status,
              timeline: [
                ...o.timeline,
                {
                  id: `ev-${Date.now()}`,
                  timestamp: now,
                  actor: 'Coordinación de Operaciones',
                  role: 'Supervisor',
                  action: techName
                    ? `Asignado a ${techName}`
                    : 'Técnico desasignado',
                  tone: 'info',
                },
              ],
            }
          : o
      )
    );
  };

  const handleAddNote = (orderId: string, note: string) => {
    const now = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              timeline: [
                ...o.timeline,
                {
                  id: `ev-${Date.now()}`,
                  timestamp: now,
                  actor: 'Coordinación de Operaciones',
                  role: 'Nota Técnica',
                  action: 'Actualización de bitácora',
                  detail: note,
                  tone: 'neutral',
                },
              ],
            }
          : o
      )
    );
  };

  const handleBulkStatus = (newStatus: WorkOrderStatus) => {
    selectedIds.forEach((id) => handleUpdateStatus(id, newStatus));
    setSelectedIds([]);
  };

  const handleCreateOrder = (
    newOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'timeline'>
  ) => {
    const nextNum = 4093 + orders.length;
    const now = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const newOrder: WorkOrder = {
      ...newOrderData,
      id: `MNT-${nextNum}`,
      createdAt: `11 Nov 2026, ${now}`,
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: now,
          actor: newOrderData.requester,
          role: 'Operaciones',
          action: 'Solicitud creada',
          tone: newOrderData.priority === 'P1' ? 'critical' : 'neutral',
        },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const openCreateForAsset = (serial?: string) => {
    setPreselectedAssetSerial(serial);
    setCreateModalOpen(true);
  };

  const buildings = useMemo(
    () => ['Todos', ...Array.from(new Set(orders.map((o) => o.building)))],
    [orders]
  );

  const viewTitle: Record<NavView, string> = {
    dashboard: 'Panel Operativo',
    orders: 'Solicitudes y Órdenes de Trabajo',
    assets: 'Activos e Infraestructura',
    technicians: 'Técnicos y Turnos',
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#334155]">
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        openCount={openOrdersCount}
        urgentCount={urgentOrdersCount}
      />

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-[#0F172A]/40 backdrop-blur-[4px]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-[#0F172A] text-white p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <span className="font-semibold text-base">MantiFix Enterprise</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {(
              [
                ['dashboard', 'Panel Operativo'],
                ['orders', 'Solicitudes y Órdenes'],
                ['assets', 'Activos e Infraestructura'],
                ['technicians', 'Técnicos y Turnos'],
              ] as [NavView, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setActiveView(id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activeView === id
                    ? 'bg-[#1E293B] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="md:hidden p-2 rounded-lg text-[#334155] hover:bg-[#F1F5F9]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.01em] text-[#0F172A] truncate">
                {viewTitle[activeView]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ID, activo o técnico..."
                className="w-64 h-9 pl-9 pr-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-colors"
              />
            </div>

            <button
              onClick={() => openCreateForAsset(undefined)}
              className="h-9 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Solicitud</span>
            </button>
          </div>
        </header>

        {/* Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <>
              {/* KPI Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
                    <span>Solicitudes Abiertas</span>
                    <Activity className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[24px] font-semibold text-[#0F172A] tabular-nums">
                      {openOrdersCount}
                    </span>
                    <span className="inline-flex items-center text-[12px] font-medium text-[#10B981] tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      -12% vs. sem. ant.
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
                    <span>Cumplimiento SLA</span>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[24px] font-semibold text-[#0F172A] tabular-nums">
                      96.4%
                    </span>
                    <span className="inline-flex items-center text-[12px] font-medium text-[#10B981] tabular-nums">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      +1.8%
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
                    <span>MTTR Promedio</span>
                    <Clock className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[24px] font-semibold text-[#0F172A] tabular-nums">
                      1h 38m
                    </span>
                    <span className="inline-flex items-center text-[12px] font-medium text-[#10B981] tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      -14m
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
                    <span>Activos Críticos</span>
                    <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[24px] font-semibold text-[#0F172A] tabular-nums">
                      {criticalAssetsCount}
                    </span>
                    <span className="text-[12px] font-medium text-[#991B1B] tabular-nums">
                      {urgentOrdersCount} P1 activa
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Triage Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#0F172A]">
                      Cola Operativa Prioritaria
                    </h2>
                    <p className="text-[12px] text-[#64748B]">
                      Haz clic en cualquier orden para abrir la bitácora y reasignar recursos.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView('orders')}
                    className="h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#334155] hover:bg-[#F8FAFC] transition-colors"
                  >
                    Ver todas las órdenes
                  </button>
                </div>

                <WorkOrdersTable
                  orders={filteredOrders}
                  selectedIds={selectedIds}
                  onToggleRow={toggleSelectRow}
                  onToggleAll={() => toggleSelectAll(filteredOrders)}
                  onSelectOrder={(o) => setSelectedOrderId(o.id)}
                />
              </div>
            </>
          )}

          {/* WORK ORDERS VIEW */}
          {activeView === 'orders' && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] overflow-hidden">
              {/* Filter Bar */}
              <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
                <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] overflow-x-auto">
                  {STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap ${
                        statusFilter === status
                          ? 'bg-white text-[#0F172A] shadow-sm'
                          : 'text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#64748B]" />
                  <select
                    value={buildingFilter}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                  >
                    {buildings.map((b) => (
                      <option key={b} value={b}>
                        {b === 'Todos' ? 'Todos los edificios' : b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <WorkOrdersTable
                orders={filteredOrders}
                selectedIds={selectedIds}
                onToggleRow={toggleSelectRow}
                onToggleAll={() => toggleSelectAll(filteredOrders)}
                onSelectOrder={(o) => setSelectedOrderId(o.id)}
              />
            </div>
          )}

          {/* ASSETS VIEW */}
          {activeView === 'assets' && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#0F172A]">
                    Inventario de Activos Críticos
                  </h2>
                  <p className="text-[12px] text-[#64748B]">
                    Estado de salud operativa, disponibilidad y calendario preventivo.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                      <th className="py-2.5 px-4">Serial</th>
                      <th className="py-2.5 px-4">Activo</th>
                      <th className="py-2.5 px-4">Ubicación</th>
                      <th className="py-2.5 px-4">Salud</th>
                      <th className="py-2.5 px-4">Uptime</th>
                      <th className="py-2.5 px-4">Próx. Mant.</th>
                      <th className="py-2.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-mono-code text-[12px] font-medium text-[#0F172A]">
                          {asset.serial}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#0F172A]">{asset.name}</div>
                          <div className="text-[12px] text-[#64748B]">{asset.category}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[#334155]">{asset.building}</div>
                          <div className="text-[12px] text-[#64748B]">{asset.zone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge
                            status={
                              asset.health === 'Crítico'
                                ? 'Urgente'
                                : asset.health === 'Atención'
                                ? 'Pendiente'
                                : 'Resuelta'
                            }
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0F172A] tabular-nums">
                          {asset.uptime}
                        </td>
                        <td className="py-3 px-4 text-[#64748B] tabular-nums">
                          {asset.nextMaintenance}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openCreateForAsset(asset.serial)}
                            className="h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#334155] hover:bg-[#F8FAFC] inline-flex items-center gap-1.5"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            Crear Orden
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TECHNICIANS VIEW */}
          {activeView === 'technicians' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {technicians.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.05),0_1px_2px_-1px_rgba(15,23,42,0.05)] flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono-code text-[11px] text-[#64748B]">
                        {tech.id} · {tech.specialty}
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#0F172A] mt-0.5">
                        {tech.name}
                      </h3>
                      <p className="text-[13px] text-[#64748B]">{tech.role}</p>
                    </div>
                    <StatusBadge
                      status={
                        tech.status === 'En Campo'
                          ? 'En Proceso'
                          : tech.status === 'Disponible' || tech.status === 'En Turno'
                          ? 'Resuelta'
                          : 'Pendiente'
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E2E8F0] text-center">
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <div className="text-[11px] text-[#64748B]">Activas</div>
                      <div className="text-[16px] font-semibold text-[#0F172A] tabular-nums">
                        {tech.activeOrders}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <div className="text-[11px] text-[#64748B]">Resueltas</div>
                      <div className="text-[16px] font-semibold text-[#0F172A] tabular-nums">
                        {tech.resolvedThisWeek}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <div className="text-[11px] text-[#64748B]">MTTR</div>
                      <div className="text-[16px] font-semibold text-[#0F172A] tabular-nums">
                        {tech.avgMttr}
                      </div>
                    </div>
                  </div>

                  <div className="text-[12px] text-[#64748B] flex items-center justify-between pt-1">
                    <span>Turno: {tech.shift}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-[0_20px_25px_-5px_rgba(15,23,42,0.2)] border border-[#1E293B] flex items-center gap-4">
          <span className="text-[13px] font-medium tabular-nums">
            {selectedIds.length} seleccionada{selectedIds.length === 1 ? '' : 's'}
          </span>
          <div className="h-4 w-[1px] bg-[#334155]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('En Proceso')}
              className="h-8 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[12px] font-medium transition-colors"
            >
              Pasar a En Proceso
            </button>
            <button
              onClick={() => handleBulkStatus('Resuelta')}
              className="h-8 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-[12px] font-medium transition-colors"
            >
              Marcar Resueltas
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="h-8 px-2.5 rounded-lg text-[#94A3B8] hover:text-white text-[12px]"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Ticket Detail Slide-Over Drawer */}
      <TicketDrawer
        order={selectedOrder}
        technicians={technicians}
        onClose={() => setSelectedOrderId(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignTechnician={handleAssignTechnician}
        onAddNote={handleAddNote}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        assets={assets}
        technicians={technicians}
        preselectedAssetSerial={preselectedAssetSerial}
        onCreate={handleCreateOrder}
      />
    </div>
  );
}

interface WorkOrdersTableProps {
  orders: WorkOrder[];
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onSelectOrder: (order: WorkOrder) => void;
}

function WorkOrdersTable({
  orders,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onSelectOrder,
}: WorkOrdersTableProps) {
  const allSelected =
    orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            <th className="py-2.5 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Seleccionar todas las órdenes"
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
            </th>
            <th className="py-2.5 px-3">ID</th>
            <th className="py-2.5 px-3">Solicitud / Activo</th>
            <th className="py-2.5 px-3">Ubicación</th>
            <th className="py-2.5 px-3">Estado</th>
            <th className="py-2.5 px-3">Prioridad</th>
            <th className="py-2.5 px-3">Técnico</th>
            <th className="py-2.5 px-4 text-right">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-[#64748B]">
                No se encontraron órdenes de trabajo con los filtros actuales.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EFF6FF]/60' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <td
                    className="py-2.5 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(order.id)}
                      aria-label={`Seleccionar orden ${order.id}`}
                      className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono-code text-[12px] font-medium text-[#0F172A] whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <div className="font-medium text-[#0F172A] truncate">
                      {order.title}
                    </div>
                    <div className="text-[12px] text-[#64748B] truncate">
                      {order.assetName} ·{' '}
                      <span className="font-mono-code text-[11px]">
                        {order.assetSerial}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-[#334155]">{order.building}</div>
                    <div className="text-[12px] text-[#64748B]">{order.zone}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge
                      status={order.status}
                      pulse={order.priority === 'P1'}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#334155] tabular-nums whitespace-nowrap">
                    {order.priority}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {order.assignedTo ? (
                      <span className="text-[#0F172A] font-medium">
                        {order.assignedTo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-[#64748B]">
                        <UserPlus className="w-3.5 h-3.5" />
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono-code text-[12px] font-medium text-[#0F172A] tabular-nums whitespace-nowrap">
                    {order.slaRemaining}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

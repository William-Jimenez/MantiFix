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
    <div className="min-h-screen flex flex-col bg-[#000000] text-white">
      <div className="flex-1 flex min-h-0">
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
            className="fixed inset-0 z-40 md:hidden bg-black/85"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-[#000000] text-white p-4 space-y-4 border-r border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="font-editorial text-lg tracking-tight">MantiFix Enterprise</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
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
                    className={`w-full text-left px-3 py-2 text-xs uppercase tracking-wider ${
                      activeView === id
                        ? 'bg-[#101010] text-white border-l-2 border-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16">
          {/* Top Header Bar */}
          <header className="h-16 bg-[#000000] border-b border-white/15 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className="md:hidden px-2 py-1 border border-white/25 text-xs uppercase tracking-widest text-white"
              >
                + MENU
              </button>
              <div className="min-w-0">
                <h1 className="text-[20px] sm:text-[24px] font-editorial tracking-[-0.01em] text-white truncate">
                  {viewTitle[activeView]}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center relative">
                <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR ID, ACTIVO O TÉCNICO..."
                  className="w-64 h-8 pl-8 pr-3 bg-[#101010] border border-white/20 text-[11px] uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-white"
                />
              </div>

              <button
                onClick={() => openCreateForAsset(undefined)}
                className="h-8 px-3.5 bg-white text-black hover:bg-black hover:text-white border border-white text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Solicitud</span>
              </button>
            </div>
          </header>

          {/* Workspace Container */}
          <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
            {/* Editorial Tagline Block */}
            <div className="border-b border-white/15 pb-4">
              <div className="text-[13px] text-white/70 max-w-xl font-light">
                Consola central para gestión computarizada de mantenimiento de infraestructura corporativa, control continuo de acuerdos de nivel de servicio (SLA) y despacho técnico en tiempo real.
              </div>
              <div className="text-[14px] font-flourish text-white/90 mt-1">
                [ excelencia operativa y confiabilidad continua de planta física ]
              </div>
            </div>

            {/* DASHBOARD VIEW */}
            {activeView === 'dashboard' && (
              <>
                {/* KPI Metric Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-[#101010] border border-white/20 p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                      <span>[ SOLICITUDES ABIERTAS ]</span>
                      <Activity className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-[36px] font-editorial leading-none text-white tabular-nums">
                        {openOrdersCount}
                      </span>
                      <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                        <ArrowDownRight className="w-3 h-3 mr-0.5 text-white/60" />
                        -12% vs. sem.
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/20 p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                      <span>[ CUMPLIMIENTO SLA ]</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-[36px] font-editorial leading-none text-white tabular-nums">
                        96.4%
                      </span>
                      <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                        <ArrowUpRight className="w-3 h-3 mr-0.5 text-white/60" />
                        +1.8%
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/20 p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                      <span>[ MTTR PROMEDIO ]</span>
                      <Clock className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-[36px] font-editorial leading-none text-white tabular-nums">
                        1h 38m
                      </span>
                      <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                        <ArrowDownRight className="w-3 h-3 mr-0.5 text-white/60" />
                        -14m
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/20 p-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                      <span>[ ACTIVOS CRÍTICOS ]</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff2936]" />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-[36px] font-editorial leading-none text-white tabular-nums">
                        {criticalAssetsCount}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff2936]">
                        {urgentOrdersCount > 0 ? `[ ${urgentOrdersCount} P1 ACTIVA ]` : '[ 0 P1 ]'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Triage Table */}
                <div className="bg-[#000000] border border-white/20">
                  <div className="px-5 py-3.5 border-b border-white/15 flex flex-wrap items-center justify-between gap-3 bg-[#101010]">
                    <div>
                      <h2 className="text-[18px] font-editorial text-white">
                        Cola Operativa Prioritaria
                      </h2>
                      <p className="text-[11px] uppercase tracking-wider text-white/50">
                        [ SELECCIONA UNA ORDEN PARA REVISIÓN DE BITÁCORA Y RECURSOS ]
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView('orders')}
                      className="h-7 px-3 border border-white/30 bg-[#000000] text-[11px] uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
                    >
                      Ver todas las órdenes →
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
              <div className="bg-[#000000] border border-white/20">
                {/* Filter Bar */}
                <div className="p-3 border-b border-white/15 flex flex-wrap items-center justify-between gap-3 bg-[#101010]">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {STATUS_FILTERS.map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap ${
                          statusFilter === status
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/60 hover:text-white border border-transparent hover:border-white/20'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-white/50" />
                    <select
                      value={buildingFilter}
                      onChange={(e) => setBuildingFilter(e.target.value)}
                      className="h-8 px-3 bg-[#000000] border border-white/25 text-[12px] uppercase tracking-wider text-white focus:outline-none focus:border-white"
                    >
                      {buildings.map((b) => (
                        <option key={b} value={b} className="bg-[#000000] text-white">
                          {b === 'Todos' ? '[ TODOS LOS EDIFICIOS ]' : b.toUpperCase()}
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
              <div className="bg-[#000000] border border-white/20">
                <div className="px-5 py-3.5 border-b border-white/15 flex items-center justify-between bg-[#101010]">
                  <div>
                    <h2 className="text-[18px] font-editorial text-white">
                      Inventario de Activos Críticos
                    </h2>
                    <p className="text-[11px] uppercase tracking-wider text-white/50">
                      [ ESTADO DE SALUD OPERATIVA, DISPONIBILIDAD Y CALENDARIO ]
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#000000] border-b border-white/15 text-[10px] uppercase tracking-[0.1em] text-white/60">
                        <th className="py-2.5 px-4">Serial</th>
                        <th className="py-2.5 px-4">Activo</th>
                        <th className="py-2.5 px-4">Ubicación</th>
                        <th className="py-2.5 px-4">Salud</th>
                        <th className="py-2.5 px-4">Uptime</th>
                        <th className="py-2.5 px-4">Próx. Mant.</th>
                        <th className="py-2.5 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-[13px]">
                      {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-[#101010] transition-colors">
                          <td className="py-3 px-4 font-mono text-[12px] text-white">
                            [{asset.serial}]
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{asset.name}</div>
                            <div className="text-[11px] uppercase tracking-wider text-white/50">{asset.category}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white/90">{asset.building}</div>
                            <div className="text-[11px] text-white/50">{asset.zone}</div>
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
                          <td className="py-3 px-4 font-mono font-medium text-white">
                            {asset.uptime}
                          </td>
                          <td className="py-3 px-4 font-mono text-[12px] text-white/60">
                            {asset.nextMaintenance}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openCreateForAsset(asset.serial)}
                              className="h-7 px-3 border border-white/30 bg-[#000000] text-[11px] uppercase tracking-wider text-white hover:bg-white hover:text-black inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Crear Orden</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="bg-[#101010] border border-white/20 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                          [{tech.id}] · {tech.specialty}
                        </div>
                        <h3 className="text-[20px] font-editorial text-white mt-1">
                          {tech.name}
                        </h3>
                        <p className="text-[12px] text-white/60">{tech.role}</p>
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

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15 text-center">
                      <div className="bg-[#000000] border border-white/10 p-2">
                        <div className="text-[9px] uppercase tracking-widest text-white/50">Activas</div>
                        <div className="text-[20px] font-editorial text-white tabular-nums">
                          {tech.activeOrders}
                        </div>
                      </div>
                      <div className="bg-[#000000] border border-white/10 p-2">
                        <div className="text-[9px] uppercase tracking-widest text-white/50">Resueltas</div>
                        <div className="text-[20px] font-editorial text-white tabular-nums">
                          {tech.resolvedThisWeek}
                        </div>
                      </div>
                      <div className="bg-[#000000] border border-white/10 p-2">
                        <div className="text-[9px] uppercase tracking-widest text-white/50">MTTR</div>
                        <div className="text-[20px] font-editorial text-white tabular-nums">
                          {tech.avgMttr}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] uppercase tracking-wider text-white/50 pt-1 border-t border-white/10">
                      [ TURNO: {tech.shift} ]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Sticky Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-30 bg-[#000000] text-white px-5 py-2.5 border border-white/40 flex items-center gap-4">
            <span className="text-[12px] uppercase tracking-wider font-mono text-white">
              [{selectedIds.length}] SELECCIONADA{selectedIds.length === 1 ? '' : 'S'}
            </span>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus('En Proceso')}
                className="h-7 px-3 bg-[#101010] hover:bg-white hover:text-black border border-white/30 text-[11px] uppercase tracking-wider transition-colors"
              >
                Pasar a En Proceso
              </button>
              <button
                onClick={() => handleBulkStatus('Resuelta')}
                className="h-7 px-3 bg-white text-black hover:bg-black hover:text-white border border-white text-[11px] uppercase tracking-wider font-semibold transition-colors"
              >
                Marcar Resueltas
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="h-7 px-2.5 text-white/60 hover:text-white text-[11px] uppercase tracking-wider"
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

      {/* Freshman Persistent Bottom Project Reel Ticker */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 h-10 bg-[#000000] border-t border-white flex items-center px-4 overflow-hidden select-none">
        <div className="flex items-center gap-6 whitespace-nowrap text-[11px] uppercase font-mono tracking-wider text-white w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">+ MANTIFIX</span>
            <span className="text-white/40">/</span>
            <span className="text-white/70">ENTERPRISE CMMS 2026</span>
          </div>
          <div className="h-3 w-[1px] bg-white/25" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">[ABIERTAS]:</span>
            <span className="text-white font-semibold">{openOrdersCount}</span>
          </div>
          <div className="h-3 w-[1px] bg-white/25" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">[CRÍTICAS P1]:</span>
            <span className={urgentOrdersCount > 0 ? "text-[#ff2936] font-bold" : "text-white"}>
              {urgentOrdersCount}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-white/25" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">[SLA]:</span>
            <span className="text-white font-semibold">96.4%</span>
          </div>
          <div className="h-3 w-[1px] bg-white/25" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">[MTTR]:</span>
            <span className="text-white font-semibold">1H 38M</span>
          </div>
          <div className="h-3 w-[1px] bg-white/25" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">[COMPLEJO]:</span>
            <span className="text-white/90">NORTE · 3 TORRES</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-white/50 text-[10px]">
            <span>[ FRESHMAN CINEMA BLACK VELVET SYSTEM ]</span>
          </div>
        </div>
      </footer>
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
          <tr className="bg-[#000000] border-b border-white/15 text-[10px] uppercase tracking-[0.1em] text-white/60">
            <th className="py-2.5 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Seleccionar todas las órdenes"
                className="border border-white/40 bg-[#000000] checked:bg-white"
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
        <tbody className="divide-y divide-white/10 text-[13px]">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-10 text-center text-white/50 font-mono text-xs">
                [ NO SE ENCONTRARON ÓRDENES CON LOS FILTROS ACTUALES ]
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
                    isSelected ? 'bg-[#101010] border-l-2 border-white' : 'hover:bg-[#101010]'
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
                      className="border border-white/40 bg-[#000000] checked:bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-white whitespace-nowrap">
                    [{order.id}]
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <div className="font-medium text-white truncate">
                      {order.title}
                    </div>
                    <div className="text-[11px] text-white/50 truncate">
                      {order.assetName} ·{' '}
                      <span className="font-mono text-[10px]">
                        [{order.assetSerial}]
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-white/90">{order.building}</div>
                    <div className="text-[11px] text-white/50">{order.zone}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge
                      status={order.status}
                      pulse={order.priority === 'P1'}
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-white whitespace-nowrap">
                    {order.priority}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {order.assignedTo ? (
                      <span className="text-white font-medium">
                        {order.assignedTo}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/40 font-mono">
                        <UserPlus className="w-3 h-3" />
                        [SIN ASIGNAR]
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] font-medium text-white whitespace-nowrap">
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

import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  UserPlus,
  Wrench,
  LayoutDashboard,
  ClipboardList,
  ServerCog,
  Users,
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

const NAV_VIEWS: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Panel Operativo', icon: LayoutDashboard },
  { id: 'orders', label: 'Solicitudes y Órdenes', icon: ClipboardList },
  { id: 'assets', label: 'Activos e Infraestructura', icon: ServerCog },
  { id: 'technicians', label: 'Técnicos y Turnos', icon: Users },
];

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');

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

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white selection:bg-white selection:text-black">
      {/* 1. TOP GLOBAL BAR */}
      <header className="h-14 border-b border-white/15 px-4 sm:px-8 flex items-center justify-between bg-[#000000] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Logo Glyph from image */}
          <span className="text-white text-lg leading-none">❋</span>
          <span className="font-semibold text-sm tracking-[0.14em] uppercase text-white">
            MANTIFIX
          </span>
          <span className="text-[10px] tracking-[0.12em] uppercase text-white/50 border border-white/20 px-1.5 py-0.5 ml-2 hidden sm:inline-block">
            ENTERPRISE
          </span>
        </div>

        {/* Global links matching reference image */}
        <nav className="flex items-center gap-3 sm:gap-6 text-[11px] uppercase tracking-wider text-white/70">
          <button
            onClick={() => setActiveView('dashboard')}
            className="hover:text-white transition-colors hidden md:inline-flex items-center gap-1"
          >
            SISTEMA CMMS <span>&gt;</span>
          </button>
          <button
            onClick={() => setActiveView('orders')}
            className="hover:text-white transition-colors hidden lg:inline-flex items-center gap-1"
          >
            ENTERPRISE <span>&gt;</span>
          </button>
          <button
            onClick={() => setActiveView('assets')}
            className="hover:text-white transition-colors hidden xl:inline-block"
          >
            TELEMETRÍA
          </button>
          <a
            href="/docs/SRS_MantiFix_Enterprise.md"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors hidden sm:inline-block"
          >
            DOCS (SRS)
          </a>
          <button
            onClick={() => openCreateForAsset(undefined)}
            className="h-7 px-3 bg-white text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-black hover:text-white border border-white transition-colors"
          >
            LOG IN
          </button>
          <button
            onClick={() => openCreateForAsset(undefined)}
            className="hover:text-white transition-colors text-white/90 hidden sm:inline-block"
          >
            CONTACT SALES
          </button>
        </nav>
      </header>

      {/* 2. HERO PRESENTATION / WELCOME SECTION (Matches reference image) */}
      <section className="border-b border-white/15 bg-[#000000] px-4 sm:px-8 py-10 lg:py-16">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-[-0.02em] text-white leading-[1.08]">
              Build Your Maintenance System
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-md font-light leading-relaxed mt-6">
              Plataforma operativa de alta disponibilidad para la supervisión y resolución de incidentes, control estricto de SLAs dinámicos y monitoreo continuo de activos críticos en plantas físicas y centros corporativos.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={() => openCreateForAsset(undefined)}
                className="h-10 px-5 bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-black hover:text-white border border-white transition-colors inline-flex items-center gap-2"
              >
                <span>DOWNLOAD / INICIAR</span>
              </button>
              <button
                onClick={() => setActiveView('orders')}
                className="text-xs uppercase tracking-widest text-white/90 hover:text-white inline-flex items-center gap-1.5 transition-colors py-2"
              >
                <span>CONTACT SALES / ÓRDENES →</span>
              </button>
            </div>
          </div>

          {/* Right Column: Sleek Live Terminal / Dashboard Window */}
          <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/20 p-4 sm:p-5">
            {/* Window title bar with macOS dots */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="text-[11px] font-mono text-white/50 ml-2">
                  YOUR SOFTWARE FACTORY // MANTIFIX CONSOLE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#101010] border border-[#ff2936] text-[10px] font-mono text-[#ff2936]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2936] animate-pulse" />
                  LIVE
                </span>
                <span className="font-mono text-[10px] text-white/60">24/7</span>
              </div>
            </div>

            {/* Dials & Top Telemetry Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-white/10">
              {/* Radar 1 */}
              <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
                  <span>SIGNAL</span>
                  <span className="text-[#ff2936]">●</span>
                </div>
                <div className="my-2 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/60" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
                    <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    <circle cx="20" cy="20" r="4" fill="none" stroke="#ff2936" strokeWidth="1.5" />
                    <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
                <div className="text-xl font-mono font-bold text-white">198</div>
                <div className="text-[9px] uppercase tracking-wider text-white/40 font-mono">16 INPUT SOURCES</div>
              </div>

              {/* Metric Card: Triaged */}
              <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                <div className="text-[10px] font-mono uppercase text-white/50">
                  TICKETS TRIAGED
                </div>
                <div className="text-2xl font-mono font-bold text-white my-1">
                  84 <span className="text-[11px] font-normal text-white/50">/ 24h</span>
                </div>
                <svg className="w-full h-7 text-[#10B981]" viewBox="0 0 120 28" preserveAspectRatio="none">
                  <path d="M0,24 Q30,22 55,14 T85,4 T120,24" fill="none" stroke="#10b981" strokeWidth="1.5" />
                </svg>
                <div className="text-[9px] font-mono text-[#10b981]">+18% THIS WEEK</div>
              </div>

              {/* Metric Card: Validations */}
              <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                <div className="text-[10px] font-mono uppercase text-white/50">
                  SLA VALIDATIONS
                </div>
                <div className="text-2xl font-mono font-bold text-white my-1">
                  1,277
                </div>
                <svg className="w-full h-7 text-[#ff2936]" viewBox="0 0 120 28" preserveAspectRatio="none">
                  <path d="M0,26 Q25,24 50,16 T80,5 T120,22" fill="none" stroke="#ff2936" strokeWidth="1.5" />
                </svg>
                <div className="text-[9px] font-mono text-white/60">96.4% COMPLIANCE</div>
              </div>

              {/* Radar 2 */}
              <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
                  <span>DEPLOY</span>
                  <span className="text-[#10b981]">●</span>
                </div>
                <div className="my-2 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white/60" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    <circle cx="20" cy="20" r="10" fill="none" stroke="#10b981" strokeWidth="1" />
                    <circle cx="20" cy="20" r="3" fill="#10b981" />
                    <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
                <div className="text-xl font-mono font-bold text-white">147</div>
                <div className="text-[9px] uppercase tracking-wider text-white/40 font-mono">12 APPS MONITORED</div>
              </div>
            </div>

            {/* Bottom Telemetry Mini Row */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-2.5 bg-[#000000] border border-white/10">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span>RESOLUCIONES SEMANALES</span>
                  <span className="text-white">164</span>
                </div>
                <svg className="w-full h-6 text-[#f97316] mt-1" viewBox="0 0 140 24" preserveAspectRatio="none">
                  <path d="M0,20 Q35,18 70,8 T110,18 T140,20" fill="none" stroke="#f97316" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="p-2.5 bg-[#000000] border border-white/10">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span>INCIDENTES P1 CRÍTICOS</span>
                  <span className={urgentOrdersCount > 0 ? "text-[#ff2936] font-bold" : "text-white"}>
                    {urgentOrdersCount}
                  </span>
                </div>
                <svg className="w-full h-6 text-white/70 mt-1" viewBox="0 0 140 24" preserveAspectRatio="none">
                  <path d="M0,18 L15,10 L30,20 L45,8 L60,18 L75,12 L90,20 L105,10 L120,18 L140,12" fill="none" stroke="white" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NAVIGATION OPTIONS IN ROWS (Justo debajo de la presentación en la parte superior) */}
      <section className="border-b border-white/20 bg-[#0a0a0a] sticky top-14 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 space-y-2.5">
          {/* Row 1: Core Navigation Views */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono mr-2 hidden sm:inline-block">
                [ VISTAS DEL SISTEMA ]:
              </span>
              {NAV_VIEWS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`h-9 px-3.5 text-xs uppercase tracking-wider font-medium inline-flex items-center gap-2 border transition-colors ${
                      isActive
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#000000] text-white/70 hover:text-white border-white/20 hover:border-white/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.id === 'orders' && openOrdersCount > 0 && (
                      <span className={`text-[10px] font-mono px-1 py-0.2 ${isActive ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                        [{openOrdersCount}]
                      </span>
                    )}
                    {item.id === 'assets' && criticalAssetsCount > 0 && (
                      <span className={`text-[10px] font-mono px-1 py-0.2 ${isActive ? 'bg-[#ff2936] text-white' : 'bg-[#ff2936]/20 text-[#ff2936]'}`}>
                        [{criticalAssetsCount} P1]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => openCreateForAsset(undefined)}
              className="h-9 px-4 bg-white text-black hover:bg-black hover:text-white border border-white text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Solicitud</span>
            </button>
          </div>

          {/* Row 2: Operational Search, Status Filters & Building Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR ID, ACTIVO O TÉCNICO..."
                className="w-full h-8 pl-8 pr-3 bg-[#000000] border border-white/20 text-[11px] uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-white"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono mr-1.5 hidden md:inline-block">
                ESTADO:
              </span>
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap border ${
                    statusFilter === status
                      ? 'bg-white text-black font-semibold border-white'
                      : 'bg-[#000000] text-white/60 hover:text-white border-white/15'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Building Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-white/50" />
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#000000] border border-white/25 text-[11px] uppercase tracking-wider text-white focus:outline-none focus:border-white"
              >
                {buildings.map((b) => (
                  <option key={b} value={b} className="bg-[#000000] text-white">
                    {b === 'Todos' ? '[ TODOS LOS EDIFICIOS ]' : b.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKSPACE CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto space-y-6 pb-20">
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
            <div className="p-4 border-b border-white/15 flex items-center justify-between bg-[#101010]">
              <div>
                <h2 className="text-[18px] font-editorial text-white">
                  Gestión Integral de Órdenes de Trabajo
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-white/50">
                  [ {filteredOrders.length} ÓRDENES FILTRADAS · CICLO DE VIDA COMPLETO ]
                </p>
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

      {/* Persistent Bottom Project Reel Ticker */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 h-10 bg-[#000000] border-t border-white flex items-center px-4 overflow-hidden select-none">
        <div className="flex items-center gap-6 whitespace-nowrap text-[11px] uppercase font-mono tracking-wider text-white w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">❋ MANTIFIX</span>
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
            <span>[ SYSTEM STATUS: ALL OPERATIONAL ]</span>
          </div>
        </div>
      </footer>

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

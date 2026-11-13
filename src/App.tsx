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
  ChevronDown,
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

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (buildingFilter !== 'Todos' && asset.building !== buildingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          asset.serial.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q) ||
          asset.category.toLowerCase().includes(q) ||
          asset.zone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, buildingFilter, searchQuery]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tech.name.toLowerCase().includes(q) ||
          tech.specialty.toLowerCase().includes(q) ||
          tech.role.toLowerCase().includes(q) ||
          tech.shift.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [technicians, searchQuery]);

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

  const scrollToConsole = (targetView?: NavView) => {
    if (targetView) {
      setActiveView(targetView);
    }
    const targetElement = document.getElementById('consola');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const buildings = useMemo(
    () => ['Todos', ...Array.from(new Set(orders.map((o) => o.building)))],
    [orders]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white selection:bg-white selection:text-black">
      {/* =========================================================================
          1. PANTALLA DE ENTRADA A PANTALLA COMPLETA (PORTADA INDEPENDIENTE 100% VH)
          ========================================================================= */}
      <section className="h-[100dvh] min-h-[100dvh] w-full flex flex-col justify-between bg-[#000000] border-b border-white/20 relative select-none">
        {/* Top Header Bar dentro de la Portada */}
        <header className="h-14 sm:h-16 border-b border-white/15 px-4 sm:px-8 flex items-center justify-between bg-[#000000] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-white text-lg leading-none" aria-hidden="true">❋</span>
            <span className="font-semibold text-sm tracking-[0.14em] uppercase text-white">
              MANTIFIX
            </span>
            <span className="text-[10px] tracking-[0.12em] uppercase text-white/50 border border-white/20 px-1.5 py-0.5 ml-2 hidden sm:inline-block">
              ENTERPRISE
            </span>
          </div>

          {/* Navegación superior con acceso directo a vistas */}
          <nav className="flex items-center gap-3 sm:gap-6 text-[11px] uppercase tracking-wider text-white/70" aria-label="Navegación principal superior">
            <button
              onClick={() => scrollToConsole('dashboard')}
              className="hover:text-white transition-colors hidden md:inline-flex items-center gap-1"
            >
              SISTEMA CMMS <span>&gt;</span>
            </button>
            <button
              onClick={() => scrollToConsole('orders')}
              className="hover:text-white transition-colors hidden lg:inline-flex items-center gap-1"
            >
              ENTERPRISE <span>&gt;</span>
            </button>
            <button
              onClick={() => scrollToConsole('assets')}
              className="hover:text-white transition-colors hidden xl:inline-block"
            >
              TELEMETRÍA
            </button>
            <button
              onClick={() => scrollToConsole('technicians')}
              className="hover:text-white transition-colors hidden sm:inline-block"
            >
              CUADRILLAS
            </button>
            <button
              onClick={() => openCreateForAsset(undefined)}
              className="h-7 px-3 bg-white text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-black hover:text-white border border-white transition-colors"
            >
              LOG IN
            </button>
            <button
              onClick={() => scrollToConsole('orders')}
              className="hover:text-white transition-colors text-white/90 hidden sm:inline-block"
            >
              CONTACT SALES
            </button>
          </nav>
        </header>

        {/* Contenido Central de la Portada: Centrado perfecto en 100% viewport */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 max-w-[1600px] w-full mx-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Columna Izquierda: Presentación y Bienvenida */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-normal tracking-[-0.02em] text-white leading-[1.08]">
                Build Your Maintenance System
              </h1>
              <p className="text-sm sm:text-base text-white/70 max-w-md font-light leading-relaxed mt-5">
                Plataforma operativa de alta disponibilidad para la supervisión y resolución de incidentes, control estricto de SLAs dinámicos y monitoreo continuo de activos críticos en plantas físicas y centros corporativos.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-7">
                <button
                  onClick={() => openCreateForAsset(undefined)}
                  className="h-10 px-5 bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-black hover:text-white border border-white transition-colors inline-flex items-center gap-2"
                >
                  <span>+ Crear Solicitud</span>
                </button>
                <button
                  onClick={() => scrollToConsole('orders')}
                  className="text-xs uppercase tracking-widest text-white/90 hover:text-white inline-flex items-center gap-1.5 transition-colors py-2 border border-transparent hover:border-white/30 px-3"
                >
                  <span>Explorar Órdenes →</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Consola en Vivo con Diales de Telemetría */}
            <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/20 p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" aria-hidden="true" />
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

              {/* Diales de Telemetría */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-white/10">
                <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
                    <span>SIGNAL</span>
                    <span className="text-[#ff2936]">●</span>
                  </div>
                  <div className="my-2 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" viewBox="0 0 40 40" aria-label="Dial de señales de telemetría">
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

                <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-white/50">
                    TICKETS TRIAGED
                  </div>
                  <div className="text-2xl font-mono font-bold text-white my-1">
                    84 <span className="text-[11px] font-normal text-white/50">/ 24h</span>
                  </div>
                  <svg className="w-full h-7 text-[#10B981]" viewBox="0 0 120 28" preserveAspectRatio="none" aria-label="Curva de tickets resueltos">
                    <path d="M0,24 Q30,22 55,14 T85,4 T120,24" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  </svg>
                  <div className="text-[9px] font-mono text-[#10b981]">+18% THIS WEEK</div>
                </div>

                <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-white/50">
                    SLA VALIDATIONS
                  </div>
                  <div className="text-2xl font-mono font-bold text-white my-1">
                    1,277
                  </div>
                  <svg className="w-full h-7 text-[#ff2936]" viewBox="0 0 120 28" preserveAspectRatio="none" aria-label="Curva de cumplimiento SLA">
                    <path d="M0,26 Q25,24 50,16 T80,5 T120,22" fill="none" stroke="#ff2936" strokeWidth="1.5" />
                  </svg>
                  <div className="text-[9px] font-mono text-white/60">96.4% COMPLIANCE</div>
                </div>

                <div className="p-2.5 bg-[#000000] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
                    <span>DEPLOY</span>
                    <span className="text-[#10b981]">●</span>
                  </div>
                  <div className="my-2 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" viewBox="0 0 40 40" aria-label="Dial de monitoreo de despliegues">
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

              {/* Métricas Inferiores */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-2.5 bg-[#000000] border border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>RESOLUCIONES SEMANALES</span>
                    <span className="text-white">164</span>
                  </div>
                  <svg className="w-full h-6 text-[#f97316] mt-1" viewBox="0 0 140 24" preserveAspectRatio="none" aria-label="Tendencia de resoluciones">
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
                  <svg className="w-full h-6 text-white/70 mt-1" viewBox="0 0 140 24" preserveAspectRatio="none" aria-label="Onda de incidentes críticos">
                    <path d="M0,18 L15,10 L30,20 L45,8 L60,18 L75,12 L90,20 L105,10 L120,18 L140,12" fill="none" stroke="white" strokeWidth="1.2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Portada: Indicador de Scroll hacia la Consola */}
        <div className="h-12 border-t border-white/15 px-4 sm:px-8 flex items-center justify-between bg-[#000000] shrink-0">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <span>[ MANTIFIX ENTERPRISE CMMS ]</span>
          </div>

          <button
            onClick={() => scrollToConsole()}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/80 hover:text-white transition-colors group cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
          >
            <span>Explorar Consola Operativa</span>
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <div className="font-mono text-[10px] text-white/40 hidden sm:block">
            <span>[ SCROLL HACIA ABAJO ]</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. NAVEGACIÓN EN FILAS (JUSTO DEBAJO DE LA PORTADA, STICKY AL HACER SCROLL)
          ========================================================================= */}
      <section id="consola" className="border-b border-white/20 bg-[#0a0a0a] sticky top-0 z-30 shadow-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 space-y-2.5">
          {/* Fila 1: Opciones de Navegación Principales */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Vistas del sistema de mantenimiento">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono mr-2 hidden sm:inline-block">
                [ VISTA ACTIVA ]:
              </span>
              {NAV_VIEWS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
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

          {/* Fila 2: Controles Contextuales Específicos (Sin ruido visual: solo muestra lo pertinente a la vista seleccionada) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            {/* Si estamos en Solicitudes y Órdenes: Búsqueda + Filtros de Estado + Filtro de Edificio */}
            {activeView === 'orders' && (
              <>
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="BUSCAR ORDEN POR ID, TÍTULO, ACTIVO O TÉCNICO..."
                    className="w-full h-8 pl-8 pr-3 bg-[#000000] border border-white/20 text-[11px] uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-white"
                  />
                </div>

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
              </>
            )}

            {/* Si estamos en Activos e Infraestructura: Búsqueda de Activos + Edificio */}
            {activeView === 'assets' && (
              <>
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="BUSCAR ACTIVO POR SERIAL, NOMBRE O ZONA..."
                    className="w-full h-8 pl-8 pr-3 bg-[#000000] border border-white/20 text-[11px] uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-white/50" />
                  <select
                    value={buildingFilter}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                    className="h-8 px-2.5 bg-[#000000] border border-white/25 text-[11px] uppercase tracking-wider text-white focus:outline-none focus:border-white"
                  >
                    {buildings.map((b) => (
                      <option key={b} value={b} className="bg-[#000000] text-white">
                        {b === 'Todos' ? '[ FILTRAR POR EDIFICIO ]' : b.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Si estamos en Técnicos y Turnos: Búsqueda de Técnicos */}
            {activeView === 'technicians' && (
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="BUSCAR POR NOMBRE, ESPECIALIDAD O TURNO..."
                  className="w-full h-8 pl-8 pr-3 bg-[#000000] border border-white/20 text-[11px] uppercase tracking-wider text-white placeholder:text-white/40 focus:outline-none focus:border-white"
                />
              </div>
            )}

            {/* Si estamos en Panel Operativo: Resumen de Instalaciones */}
            {activeView === 'dashboard' && (
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/60">
                <span>[ COMPLEJO CORPORATIVO NORTE · 3 TORRES OPERATIVAS ]</span>
                <span className="text-white/90">[ 100% TELEMETRÍA EN LÍNEA ]</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ÁREA DE CONTENIDO: MUESTRA ÚNICA Y EXCLUSIVAMENTE LA OPCIÓN SELECCIONADA
          ========================================================================= */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto space-y-6 pb-20">
        {/* VISTA 1: PANEL OPERATIVO (Muestra solo los indicadores y KPIs de salud operacional) */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="border-b border-white/15 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-editorial tracking-tight text-white">
                  Indicadores de Nivel de Servicio y Confiabilidad
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
                  [ MÉTRICAS CONSOLIDADAS EN TIEMPO REAL ]
                </p>
              </div>
              <button
                onClick={() => setActiveView('orders')}
                className="h-8 px-3 border border-white/30 bg-[#000000] text-[11px] uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
              >
                Ir a Gestión de Órdenes →
              </button>
            </div>

            {/* Cuadrícula de 4 Tarjetas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-[#101010] border border-white/20 p-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                  <span>[ SOLICITUDES ABIERTAS ]</span>
                  <Activity className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[40px] font-editorial leading-none text-white tabular-nums">
                    {openOrdersCount}
                  </span>
                  <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                    <ArrowDownRight className="w-3 h-3 mr-0.5 text-white/60" />
                    -12% vs. sem.
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-3 pt-2 border-t border-white/10 font-mono">
                  {orders.length} órdenes registradas históricamente
                </div>
              </div>

              <div className="bg-[#101010] border border-white/20 p-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                  <span>[ CUMPLIMIENTO SLA ]</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[40px] font-editorial leading-none text-white tabular-nums">
                    96.4%
                  </span>
                  <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                    <ArrowUpRight className="w-3 h-3 mr-0.5 text-white/60" />
                    +1.8%
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-3 pt-2 border-t border-white/10 font-mono">
                  Meta operacional: 95.0% cumplimiento
                </div>
              </div>

              <div className="bg-[#101010] border border-white/20 p-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                  <span>[ MTTR PROMEDIO ]</span>
                  <Clock className="w-3.5 h-3.5 text-white/80" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[40px] font-editorial leading-none text-white tabular-nums">
                    1h 38m
                  </span>
                  <span className="inline-flex items-center text-[11px] font-mono text-white/80">
                    <ArrowDownRight className="w-3 h-3 mr-0.5 text-white/60" />
                    -14m
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-3 pt-2 border-t border-white/10 font-mono">
                  Tiempo medio de resolución en campo
                </div>
              </div>

              <div className="bg-[#101010] border border-white/20 p-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/60">
                  <span>[ ACTIVOS CRÍTICOS ]</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff2936]" />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[40px] font-editorial leading-none text-white tabular-nums">
                    {criticalAssetsCount}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff2936]">
                    {urgentOrdersCount > 0 ? `[ ${urgentOrdersCount} P1 ACTIVA ]` : '[ 0 P1 ]'}
                  </span>
                </div>
                <div className="text-[11px] text-white/50 mt-3 pt-2 border-t border-white/10 font-mono">
                  {assets.length} activos corporativos bajo monitoreo
                </div>
              </div>
            </div>

            {/* Resumen de Estado Operativo */}
            <div className="p-5 bg-[#101010] border border-white/15">
              <div className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                Resumen de Operación y Cuadrillas Activas
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/70 pt-2 border-t border-white/10">
                <div>
                  <span className="text-white/40 block">TURNO EN CURSO:</span>
                  <span className="text-white text-sm">Matutino (06:00 - 14:00)</span>
                </div>
                <div>
                  <span className="text-white/40 block">TÉCNICOS DISPONIBLES:</span>
                  <span className="text-white text-sm">{technicians.filter(t => t.status !== 'Fuera de Turno').length} de {technicians.length} activos</span>
                </div>
                <div>
                  <span className="text-white/40 block">DISPONIBILIDAD DE PLANTA:</span>
                  <span className="text-white text-sm">99.85% de operatividad global</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: SOLICITUDES Y ÓRDENES (Muestra única y exclusivamente la tabla de órdenes de trabajo) */}
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

        {/* VISTA 3: ACTIVOS E INFRAESTRUCTURA (Muestra única y exclusivamente el inventario de activos) */}
        {activeView === 'assets' && (
          <div className="bg-[#000000] border border-white/20">
            <div className="px-5 py-3.5 border-b border-white/15 flex items-center justify-between bg-[#101010]">
              <div>
                <h2 className="text-[18px] font-editorial text-white">
                  Inventario de Activos Críticos
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-white/50">
                  [ {filteredAssets.length} ACTIVOS · SALUD OPERATIVA Y CALENDARIO ]
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
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-white/50 font-mono text-xs">
                        [ NO SE ENCONTRARON ACTIVOS CON LOS CRITERIOS INDICADOS ]
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 4: TÉCNICOS Y TURNOS (Muestra única y exclusivamente la cuadrícula de técnicos) */}
        {activeView === 'technicians' && (
          <div className="space-y-4">
            <div className="border-b border-white/15 pb-3">
              <h2 className="text-xl font-editorial tracking-tight text-white">
                Nómina de Cuadrillas y Turnos Operativos
              </h2>
              <p className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
                [ {filteredTechnicians.length} TÉCNICOS REGISTRADOS EN PLANTA ]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTechnicians.length === 0 ? (
                <div className="col-span-full py-10 text-center text-white/50 font-mono text-xs border border-white/20 p-6">
                  [ NO SE ENCONTRARON TÉCNICOS CON LOS CRITERIOS INDICADOS ]
                </div>
              ) : (
                filteredTechnicians.map((tech) => (
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
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && activeView === 'orders' && (
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

      {/* Ticker Persistente Inferior */}
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

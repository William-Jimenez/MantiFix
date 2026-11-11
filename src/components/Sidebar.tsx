import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  ServerCog,
  Users,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Building2,
} from 'lucide-react';
import { NavView } from '../types';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openCount: number;
  urgentCount: number;
}

const NAV_ITEMS: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Panel Operativo', icon: LayoutDashboard },
  { id: 'orders', label: 'Solicitudes y Órdenes', icon: ClipboardList },
  { id: 'assets', label: 'Activos e Infraestructura', icon: ServerCog },
  { id: 'technicians', label: 'Técnicos y Turnos', icon: Users },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  openCount,
  urgentCount,
}) => {
  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0F172A] text-white border-r border-[#1E293B] transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight truncate">
              <div className="text-[15px] font-semibold tracking-tight text-white">
                MantiFix
              </div>
              <div className="text-[11px] font-medium text-[#94A3B8] tracking-wide uppercase">
                Enterprise
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                isActive
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#3B82F6]' : 'text-[#94A3B8]'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </span>
              {!collapsed && item.id === 'orders' && openCount > 0 && (
                <span className="tabular-nums text-[11px] font-semibold text-[#CBD5E1] bg-[#0F172A] px-1.5 py-0.5 rounded">
                  {openCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Facility Context */}
      {!collapsed && (
        <div className="p-3 m-2.5 rounded-lg bg-[#1E293B] border border-[#334155]/50">
          <div className="flex items-center gap-2 text-xs font-medium text-white mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Complejo Corporativo Norte</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] tabular-nums">
            3 Torres · {urgentCount} incidente{urgentCount === 1 ? '' : 's'} P1 activo{urgentCount === 1 ? '' : 's'}
          </div>
        </div>
      )}
    </aside>
  );
};

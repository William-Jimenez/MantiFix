import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  ServerCog,
  Users,
  ChevronLeft,
  ChevronRight,
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
      className={`hidden md:flex flex-col bg-[#000000] text-white border-r border-white/15 transition-all duration-150 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/15">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Brand Glyph: Hash/Cross symbol in White */}
          <div className="w-6 h-6 border border-white flex items-center justify-center shrink-0 text-white font-mono text-xs">
            +
          </div>
          {!collapsed && (
            <div className="leading-tight truncate">
              <div className="text-[20px] font-editorial tracking-[-0.01em] text-white">
                MantiFix
              </div>
              <div className="text-[10px] tracking-[0.12em] uppercase text-white/60">
                [ ENTERPRISE CMMS ]
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          className="p-1 text-white/60 hover:text-white border border-transparent hover:border-white/30 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 text-[13px] tracking-wide transition-colors ${
                isActive
                  ? 'bg-[#101010] text-white border-l-2 border-white'
                  : 'text-white/60 hover:text-white hover:bg-[#101010]/80 border-l-2 border-transparent'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-white/50'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </span>
              {!collapsed && item.id === 'orders' && openCount > 0 && (
                <span className="text-[11px] font-mono tracking-tight text-white/90 border border-white/20 px-1 py-0.2 bg-[#000000]">
                  [{openCount}]
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Facility Context */}
      {!collapsed && (
        <div className="p-3 m-2 bg-[#101010] border border-white/15">
          <div className="flex items-center gap-2 text-xs font-normal text-white uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5 text-white/80" />
            <span>Complejo Norte</span>
          </div>
          <div className="text-[11px] text-white/60 font-mono tracking-tight">
            3 Torres · {urgentCount > 0 ? (
              <span className="text-[#ff2936] font-semibold">[{urgentCount} P1 ACTIVO]</span>
            ) : (
              <span>0 P1 ACTIVO</span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

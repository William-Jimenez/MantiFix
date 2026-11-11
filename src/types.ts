export type WorkOrderStatus = 'Pendiente' | 'En Proceso' | 'Resuelta' | 'Urgente';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type NavView = 'dashboard' | 'orders' | 'assets' | 'technicians';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  detail?: string;
  tone: 'neutral' | 'warning' | 'info' | 'success' | 'critical';
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  building: string;
  zone: string;
  assetName: string;
  assetSerial: string;
  category: 'HVAC' | 'Eléctrico' | 'Elevadores' | 'Hidráulico' | 'Seguridad' | 'Infraestructura';
  status: WorkOrderStatus;
  priority: PriorityLevel;
  assignedTo: string | null;
  requester: string;
  createdAt: string;
  slaRemaining: string;
  slaBreached?: boolean;
  estimatedCost: number;
  timeline: TimelineEvent[];
}

export interface FacilityAsset {
  id: string;
  serial: string;
  name: string;
  category: WorkOrder['category'];
  building: string;
  zone: string;
  health: 'Óptimo' | 'Atención' | 'Crítico';
  uptime: string;
  lastMaintenance: string;
  nextMaintenance: string;
  openTickets: number;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  specialty: WorkOrder['category'];
  shift: 'Matutino (06:00–14:00)' | 'Vespertino (14:00–22:00)' | 'Nocturno (22:00–06:00)';
  status: 'En Turno' | 'En Campo' | 'Disponible' | 'Fuera de Turno';
  activeOrders: number;
  resolvedThisWeek: number;
  avgMttr: string;
}

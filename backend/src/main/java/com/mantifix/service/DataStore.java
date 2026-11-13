package com.mantifix.service;

import com.mantifix.model.FacilityAsset;
import com.mantifix.model.Technician;
import com.mantifix.model.TimelineEvent;
import com.mantifix.model.WorkOrder;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

public class DataStore {
    private static final DataStore INSTANCE = new DataStore();

    private final Map<String, WorkOrder> orders = new ConcurrentHashMap<>();
    private final List<WorkOrder> orderList = new CopyOnWriteArrayList<>();
    private final List<FacilityAsset> assets = new CopyOnWriteArrayList<>();
    private final List<Technician> technicians = new CopyOnWriteArrayList<>();
    private final AtomicInteger orderCounter = new AtomicInteger(4093);

    private DataStore() {
        initDefaultData();
    }

    public static DataStore getInstance() {
        return INSTANCE;
    }

    public void resetToDefaults() {
        orders.clear();
        orderList.clear();
        assets.clear();
        technicians.clear();
        orderCounter.set(4093);
        initDefaultData();
    }

    private void initDefaultData() {
        // Technicians
        technicians.add(new Technician("TEC-01", "Carlos Mendoza", "Especialista HVAC Senior", "HVAC", "Matutino (06:00–14:00)", "En Campo", 3, 14, "1h 42m"));
        technicians.add(new Technician("TEC-02", "Elena Rostova", "Ingeniera Eléctrica", "Eléctrico", "Matutino (06:00–14:00)", "En Turno", 2, 11, "2h 05m"));
        technicians.add(new Technician("TEC-03", "Marco Silva", "Técnico de Elevadores", "Elevadores", "Vespertino (14:00–22:00)", "En Campo", 2, 9, "1h 18m"));
        technicians.add(new Technician("TEC-04", "Sofía Navarro", "Especialista Hidráulica", "Hidráulico", "Matutino (06:00–14:00)", "Disponible", 1, 16, "54m"));
        technicians.add(new Technician("TEC-05", "Diego Vargas", "Técnico de Seguridad y Acceso", "Seguridad", "Nocturno (22:00–06:00)", "Fuera de Turno", 0, 8, "1h 30m"));

        // Assets
        assets.add(new FacilityAsset("AST-101", "HVAC-CH02-991", "Chiller Centrífugo York 450T", "HVAC", "Torre Corporativa A", "Azotea Norte · Cuarto de Máquinas", "Crítico", "94.2%", "2026-10-14", "2026-11-18", 2));
        assets.add(new FacilityAsset("AST-102", "ELV-OTIS-04B", "Elevador Alta Velocidad #4", "Elevadores", "Torre Corporativa A", "Núcleo Central · Pisos 1–28", "Atención", "98.7%", "2026-10-28", "2026-11-28", 1));
        assets.add(new FacilityAsset("AST-103", "PWR-UPS-772A", "Banco UPS Modular 500kVA", "Eléctrico", "Centro de Datos B", "Sótano 2 · Sala Eléctrica", "Óptimo", "99.98%", "2026-11-02", "2026-12-02", 0));
        assets.add(new FacilityAsset("AST-104", "HYD-PMP-310", "Bomba Presurizadora Principal", "Hidráulico", "Torre Corporativa B", "Sótano 1 · Cisterna", "Atención", "97.4%", "2026-09-30", "2026-11-15", 1));
        assets.add(new FacilityAsset("AST-105", "SEC-ACS-884", "Controlador Biométrico Lobby", "Seguridad", "Torre Corporativa A", "Planta Baja · Acceso Principal", "Óptimo", "99.6%", "2026-10-20", "2026-12-20", 0));
        assets.add(new FacilityAsset("AST-106", "PWR-GEN-009", "Generador Diésel Cummins 1.2MW", "Eléctrico", "Centro de Datos B", "Patio de Maniobras", "Óptimo", "99.9%", "2026-11-05", "2026-12-05", 1));

        // Work Orders
        List<TimelineEvent> t1 = new ArrayList<>();
        t1.add(new TimelineEvent("ev-1", "09:14", "Sistema BMS", "Telemetría", "Incidente P1 generado automáticamente", "Sensor T-04B registró 94.1°C (umbral: 88°C).", "critical"));
        t1.add(new TimelineEvent("ev-2", "09:19", "Ana Morales", "Coordinadora de Operaciones", "Asignado a Carlos Mendoza", "Prioridad escalada a P1 con protocolo de respuesta inmediata.", "info"));
        t1.add(new TimelineEvent("ev-3", "09:35", "Carlos Mendoza", "Especialista HVAC Senior", "En sitio · Inspección de válvula de expansión", "Se detecta obstrucción parcial en filtro deshidratador.", "warning"));
        saveOrder(new WorkOrder("MNT-4092", "Sobrecalentamiento en compresor Chiller #2",
                "Alerta de temperatura de descarga por encima de 92°C en el circuito B del Chiller York. Riesgo de paro térmico automático en pisos ejecutivos.",
                "Torre Corporativa A", "Azotea Norte · Cuarto de Máquinas", "Chiller Centrífugo York 450T", "HVAC-CH02-991",
                "HVAC", "Urgente", "P1", "Carlos Mendoza", "Sistema BMS Automático", "11 Nov 2026, 09:14",
                "00h 42m", false, 2450, t1));

        List<TimelineEvent> t2 = new ArrayList<>();
        t2.add(new TimelineEvent("ev-4", "08:05", "Recepción Ejecutiva", "Solicitante", "Solicitud creada", null, "neutral"));
        t2.add(new TimelineEvent("ev-5", "08:22", "Marco Silva", "Técnico de Elevadores", "Orden aceptada y bloqueo preventivo", "Cabina puesta en modo inspección.", "info"));
        saveOrder(new WorkOrder("MNT-4091", "Vibración anómala en cabina Elevador #4",
                "Usuarios reportan vibración lateral entre pisos 14 y 19 durante ascenso rápido. Requiere calibración de guías y revisión de polea.",
                "Torre Corporativa A", "Núcleo Central · Pisos 1–28", "Elevador Alta Velocidad #4", "ELV-OTIS-04B",
                "Elevadores", "En Proceso", "P2", "Marco Silva", "Recepción Ejecutiva", "11 Nov 2026, 08:05",
                "03h 15m", false, 890, t2));

        List<TimelineEvent> t3 = new ArrayList<>();
        t3.add(new TimelineEvent("ev-6", "06:40", "Ronda Nocturna", "Seguridad Patrimonial", "Reporte registrado con evidencia fotográfica", null, "neutral"));
        saveOrder(new WorkOrder("MNT-4090", "Fuga menor en sello mecánico bomba presurizadora",
                "Goteo continuo en brida de succión de la bomba principal. Presión de red estable en 62 PSI, pero requiere reemplazo de empaque.",
                "Torre Corporativa B", "Sótano 1 · Cisterna", "Bomba Presurizadora Principal", "HYD-PMP-310",
                "Hidráulico", "Pendiente", "P3", null, "Ronda Nocturna", "11 Nov 2026, 06:40",
                "11h 20m", false, 420, t3));

        List<TimelineEvent> t4 = new ArrayList<>();
        t4.add(new TimelineEvent("ev-7", "16:30", "Sistema MantiFix", "Planificador", "Orden preventiva generada", null, "neutral"));
        t4.add(new TimelineEvent("ev-8", "10:00", "Elena Rostova", "Ingeniera Eléctrica", "Inicio de protocolo de pruebas", null, "info"));
        saveOrder(new WorkOrder("MNT-4089", "Prueba semanal de transferencia automática Generador",
                "Mantenimiento preventivo programado: verificación de batería de arranque, nivel de refrigerante y prueba de carga al 40%.",
                "Centro de Datos B", "Patio de Maniobras", "Generador Diésel Cummins 1.2MW", "PWR-GEN-009",
                "Eléctrico", "En Proceso", "P3", "Elena Rostova", "Plan Preventivo Q4", "10 Nov 2026, 16:30",
                "05h 50m", false, 310, t4));

        List<TimelineEvent> t5 = new ArrayList<>();
        t5.add(new TimelineEvent("ev-9", "11:10", "Operaciones Piso 12", "Solicitante", "Solicitud creada", null, "neutral"));
        t5.add(new TimelineEvent("ev-10", "14:45", "Elena Rostova", "Ingeniera Eléctrica", "Orden resuelta y cerrada", "Se reemplazaron 3 drivers Philips 40W. Pruebas OK.", "success"));
        saveOrder(new WorkOrder("MNT-4088", "Reemplazo de luminarias LED en Sala de Juntas 12B",
                "Tres paneles LED presentan parpadeo intermitente. Sustituir drivers y verificar línea neutra.",
                "Torre Corporativa A", "Piso 12 · Ala Sur", "Tablero Iluminación P12", "PWR-LGT-12S",
                "Eléctrico", "Resuelta", "P4", "Elena Rostova", "Operaciones Piso 12", "10 Nov 2026, 11:10",
                "Completada", false, 185, t5));

        List<TimelineEvent> t6 = new ArrayList<>();
        t6.add(new TimelineEvent("ev-11", "15:20", "Seguridad Corporativa", "Solicitante", "Solicitud creada", null, "neutral"));
        t6.add(new TimelineEvent("ev-12", "17:05", "Diego Vargas", "Técnico de Seguridad", "Firmware actualizado y caché reiniciada", null, "success"));
        saveOrder(new WorkOrder("MNT-4087", "Calibración de lector biométrico acceso torniquete 2",
                "Tiempos de respuesta lentos en lectura de credenciales NFC durante hora pico matutina.",
                "Torre Corporativa A", "Planta Baja · Acceso Principal", "Controlador Biométrico Lobby", "SEC-ACS-884",
                "Seguridad", "Resuelta", "P3", "Diego Vargas", "Seguridad Corporativa", "09 Nov 2026, 15:20",
                "Completada", false, 120, t6));
    }

    private void saveOrder(WorkOrder order) {
        orders.put(order.getId(), order);
        orderList.add(order);
    }

    public List<WorkOrder> getOrders() {
        return new ArrayList<>(orderList);
    }

    public Optional<WorkOrder> getOrderById(String id) {
        return Optional.ofNullable(orders.get(id));
    }

    public synchronized WorkOrder createOrder(WorkOrder newOrder) {
        String id = "MNT-" + orderCounter.getAndIncrement();
        newOrder.setId(id);
        if (newOrder.getCreatedAt() == null || newOrder.getCreatedAt().isEmpty()) {
            newOrder.setCreatedAt("11 Nov 2026, " + java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
        }
        if (newOrder.getTimeline() == null || newOrder.getTimeline().isEmpty()) {
            List<TimelineEvent> events = new ArrayList<>();
            events.add(new TimelineEvent(
                    "ev-" + System.currentTimeMillis(),
                    java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
                    newOrder.getRequester() != null ? newOrder.getRequester() : "Operaciones",
                    "Operaciones",
                    "Solicitud creada",
                    null,
                    "P1".equalsIgnoreCase(newOrder.getPriority()) ? "critical" : "neutral"
            ));
            newOrder.setTimeline(events);
        }
        orders.put(id, newOrder);
        orderList.add(0, newOrder); // newest first
        return newOrder;
    }

    public synchronized Optional<WorkOrder> updateOrderStatus(String orderId, String newStatus) {
        WorkOrder order = orders.get(orderId);
        if (order == null) return Optional.empty();

        order.setStatus(newStatus);
        if ("Resuelta".equalsIgnoreCase(newStatus)) {
            order.setSlaRemaining("Completada");
        }
        String tone = "Resuelta".equalsIgnoreCase(newStatus) ? "success"
                : "Urgente".equalsIgnoreCase(newStatus) ? "critical" : "info";

        order.addTimelineEvent(new TimelineEvent(
                "ev-" + System.currentTimeMillis(),
                java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
                "Coordinación de Operaciones",
                "Supervisor",
                "Estado actualizado a " + newStatus,
                null,
                tone
        ));
        return Optional.of(order);
    }

    public synchronized Optional<WorkOrder> assignTechnician(String orderId, String techName) {
        WorkOrder order = orders.get(orderId);
        if (order == null) return Optional.empty();

        order.setAssignedTo(techName != null && !techName.trim().isEmpty() ? techName.trim() : null);
        if (techName != null && !techName.trim().isEmpty() && "Pendiente".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("En Proceso");
        }
        order.addTimelineEvent(new TimelineEvent(
                "ev-" + System.currentTimeMillis(),
                java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
                "Coordinación de Operaciones",
                "Supervisor",
                techName != null && !techName.trim().isEmpty() ? "Asignado a " + techName : "Técnico desasignado",
                null,
                "info"
        ));
        return Optional.of(order);
    }

    public synchronized Optional<WorkOrder> addNote(String orderId, String note) {
        WorkOrder order = orders.get(orderId);
        if (order == null) return Optional.empty();

        order.addTimelineEvent(new TimelineEvent(
                "ev-" + System.currentTimeMillis(),
                java.time.LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")),
                "Coordinación de Operaciones",
                "Nota Técnica",
                "Actualización de bitácora",
                note,
                "neutral"
        ));
        return Optional.of(order);
    }

    public List<FacilityAsset> getAssets() {
        return new ArrayList<>(assets);
    }

    public List<Technician> getTechnicians() {
        return new ArrayList<>(technicians);
    }
}

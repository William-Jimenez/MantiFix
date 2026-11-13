package com.mantifix.service;

import com.mantifix.model.FacilityAsset;
import com.mantifix.model.Technician;
import com.mantifix.model.WorkOrder;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class WorkOrderService {
    private final DataStore dataStore;

    public WorkOrderService() {
        this(DataStore.getInstance());
    }

    public WorkOrderService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<WorkOrder> getOrders(String statusFilter, String buildingFilter, String query) {
        return dataStore.getOrders().stream().filter(order -> {
            if (statusFilter != null && !statusFilter.isEmpty() && !"Todas".equalsIgnoreCase(statusFilter)) {
                if (!order.getStatus().equalsIgnoreCase(statusFilter)) {
                    return false;
                }
            }
            if (buildingFilter != null && !buildingFilter.isEmpty() && !"Todos".equalsIgnoreCase(buildingFilter)) {
                if (!order.getBuilding().equalsIgnoreCase(buildingFilter)) {
                    return false;
                }
            }
            if (query != null && !query.trim().isEmpty()) {
                String q = query.trim().toLowerCase();
                boolean match = (order.getId() != null && order.getId().toLowerCase().contains(q)) ||
                        (order.getTitle() != null && order.getTitle().toLowerCase().contains(q)) ||
                        (order.getAssetName() != null && order.getAssetName().toLowerCase().contains(q)) ||
                        (order.getAssetSerial() != null && order.getAssetSerial().toLowerCase().contains(q)) ||
                        (order.getAssignedTo() != null && order.getAssignedTo().toLowerCase().contains(q));
                if (!match) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    public Optional<WorkOrder> getOrderById(String id) {
        return dataStore.getOrderById(id);
    }

    public WorkOrder createOrder(WorkOrder newOrder) {
        if (newOrder.getTitle() == null || newOrder.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("El título de la orden es obligatorio");
        }
        if (newOrder.getPriority() == null || newOrder.getPriority().isEmpty()) {
            newOrder.setPriority("P2");
        }
        if (newOrder.getStatus() == null || newOrder.getStatus().isEmpty()) {
            if ("P1".equalsIgnoreCase(newOrder.getPriority())) {
                newOrder.setStatus("Urgente");
            } else if (newOrder.getAssignedTo() != null && !newOrder.getAssignedTo().trim().isEmpty()) {
                newOrder.setStatus("En Proceso");
            } else {
                newOrder.setStatus("Pendiente");
            }
        }
        if (newOrder.getSlaRemaining() == null || newOrder.getSlaRemaining().isEmpty()) {
            if ("P1".equalsIgnoreCase(newOrder.getPriority())) {
                newOrder.setSlaRemaining("01h 00m");
            } else if ("P2".equalsIgnoreCase(newOrder.getPriority())) {
                newOrder.setSlaRemaining("04h 00m");
            } else {
                newOrder.setSlaRemaining("12h 00m");
            }
        }
        return dataStore.createOrder(newOrder);
    }

    public Optional<WorkOrder> updateOrderStatus(String orderId, String newStatus) {
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("El nuevo estado no puede ser nulo o vacío");
        }
        return dataStore.updateOrderStatus(orderId, newStatus.trim());
    }

    public Optional<WorkOrder> assignTechnician(String orderId, String techName) {
        return dataStore.assignTechnician(orderId, techName);
    }

    public Optional<WorkOrder> addNote(String orderId, String note) {
        if (note == null || note.trim().isEmpty()) {
            throw new IllegalArgumentException("La nota no puede estar vacía");
        }
        return dataStore.addNote(orderId, note.trim());
    }

    public List<FacilityAsset> getAssets() {
        return dataStore.getAssets();
    }

    public List<Technician> getTechnicians() {
        return dataStore.getTechnicians();
    }
}

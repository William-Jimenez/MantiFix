package com.mantifix.model;

import java.util.ArrayList;
import java.util.List;

public class WorkOrder {
    private String id;
    private String title;
    private String description;
    private String building;
    private String zone;
    private String assetName;
    private String assetSerial;
    private String category; // 'HVAC' | 'Eléctrico' | 'Elevadores' | 'Hidráulico' | 'Seguridad' | 'Infraestructura'
    private String status;   // 'Pendiente' | 'En Proceso' | 'Resuelta' | 'Urgente'
    private String priority; // 'P1' | 'P2' | 'P3' | 'P4'
    private String assignedTo;
    private String requester;
    private String createdAt;
    private String slaRemaining;
    private boolean slaBreached;
    private double estimatedCost;
    private List<TimelineEvent> timeline = new ArrayList<>();

    public WorkOrder() {}

    public WorkOrder(String id, String title, String description, String building, String zone,
                     String assetName, String assetSerial, String category, String status,
                     String priority, String assignedTo, String requester, String createdAt,
                     String slaRemaining, boolean slaBreached, double estimatedCost,
                     List<TimelineEvent> timeline) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.building = building;
        this.zone = zone;
        this.assetName = assetName;
        this.assetSerial = assetSerial;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.assignedTo = assignedTo;
        this.requester = requester;
        this.createdAt = createdAt;
        this.slaRemaining = slaRemaining;
        this.slaBreached = slaBreached;
        this.estimatedCost = estimatedCost;
        if (timeline != null) {
            this.timeline = new ArrayList<>(timeline);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAssetSerial() { return assetSerial; }
    public void setAssetSerial(String assetSerial) { this.assetSerial = assetSerial; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getRequester() { return requester; }
    public void setRequester(String requester) { this.requester = requester; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getSlaRemaining() { return slaRemaining; }
    public void setSlaRemaining(String slaRemaining) { this.slaRemaining = slaRemaining; }

    public boolean isSlaBreached() { return slaBreached; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }

    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }

    public List<TimelineEvent> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEvent> timeline) {
        this.timeline = timeline != null ? new ArrayList<>(timeline) : new ArrayList<>();
    }

    public void addTimelineEvent(TimelineEvent event) {
        this.timeline.add(event);
    }
}

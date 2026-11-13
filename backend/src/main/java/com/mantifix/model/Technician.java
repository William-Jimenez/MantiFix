package com.mantifix.model;

public class Technician {
    private String id;
    private String name;
    private String role;
    private String specialty;
    private String shift;
    private String status; // 'En Turno' | 'En Campo' | 'Disponible' | 'Fuera de Turno'
    private int activeOrders;
    private int resolvedThisWeek;
    private String avgMttr;

    public Technician() {}

    public Technician(String id, String name, String role, String specialty, String shift,
                      String status, int activeOrders, int resolvedThisWeek, String avgMttr) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.specialty = specialty;
        this.shift = shift;
        this.status = status;
        this.activeOrders = activeOrders;
        this.resolvedThisWeek = resolvedThisWeek;
        this.avgMttr = avgMttr;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getActiveOrders() { return activeOrders; }
    public void setActiveOrders(int activeOrders) { this.activeOrders = activeOrders; }

    public int getResolvedThisWeek() { return resolvedThisWeek; }
    public void setResolvedThisWeek(int resolvedThisWeek) { this.resolvedThisWeek = resolvedThisWeek; }

    public String getAvgMttr() { return avgMttr; }
    public void setAvgMttr(String avgMttr) { this.avgMttr = avgMttr; }
}

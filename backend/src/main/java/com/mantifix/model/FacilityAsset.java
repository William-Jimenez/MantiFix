package com.mantifix.model;

public class FacilityAsset {
    private String id;
    private String serial;
    private String name;
    private String category;
    private String building;
    private String zone;
    private String health; // 'Óptimo' | 'Atención' | 'Crítico'
    private String uptime;
    private String lastMaintenance;
    private String nextMaintenance;
    private int openTickets;

    public FacilityAsset() {}

    public FacilityAsset(String id, String serial, String name, String category, String building,
                         String zone, String health, String uptime, String lastMaintenance,
                         String nextMaintenance, int openTickets) {
        this.id = id;
        this.serial = serial;
        this.name = name;
        this.category = category;
        this.building = building;
        this.zone = zone;
        this.health = health;
        this.uptime = uptime;
        this.lastMaintenance = lastMaintenance;
        this.nextMaintenance = nextMaintenance;
        this.openTickets = openTickets;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSerial() { return serial; }
    public void setSerial(String serial) { this.serial = serial; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getHealth() { return health; }
    public void setHealth(String health) { this.health = health; }

    public String getUptime() { return uptime; }
    public void setUptime(String uptime) { this.uptime = uptime; }

    public String getLastMaintenance() { return lastMaintenance; }
    public void setLastMaintenance(String lastMaintenance) { this.lastMaintenance = lastMaintenance; }

    public String getNextMaintenance() { return nextMaintenance; }
    public void setNextMaintenance(String nextMaintenance) { this.nextMaintenance = nextMaintenance; }

    public int getOpenTickets() { return openTickets; }
    public void setOpenTickets(int openTickets) { this.openTickets = openTickets; }
}

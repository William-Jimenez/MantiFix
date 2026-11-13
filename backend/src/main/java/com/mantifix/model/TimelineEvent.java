package com.mantifix.model;

public class TimelineEvent {
    private String id;
    private String timestamp;
    private String actor;
    private String role;
    private String action;
    private String detail;
    private String tone; // 'neutral' | 'warning' | 'info' | 'success' | 'critical'

    public TimelineEvent() {}

    public TimelineEvent(String id, String timestamp, String actor, String role, String action, String detail, String tone) {
        this.id = id;
        this.timestamp = timestamp;
        this.actor = actor;
        this.role = role;
        this.action = action;
        this.detail = detail;
        this.tone = tone;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }
}

package com.mantifix.util;

import com.mantifix.model.FacilityAsset;
import com.mantifix.model.Technician;
import com.mantifix.model.TimelineEvent;
import com.mantifix.model.WorkOrder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JsonUtil {

    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    public static String toJson(TimelineEvent event) {
        if (event == null) return "null";
        return "{" +
                "\"id\":\"" + escape(event.getId()) + "\"," +
                "\"timestamp\":\"" + escape(event.getTimestamp()) + "\"," +
                "\"actor\":\"" + escape(event.getActor()) + "\"," +
                "\"role\":\"" + escape(event.getRole()) + "\"," +
                "\"action\":\"" + escape(event.getAction()) + "\"," +
                "\"detail\":\"" + escape(event.getDetail()) + "\"," +
                "\"tone\":\"" + escape(event.getTone()) + "\"" +
                "}";
    }

    public static String toJson(WorkOrder order) {
        if (order == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":\"").append(escape(order.getId())).append("\",");
        sb.append("\"title\":\"").append(escape(order.getTitle())).append("\",");
        sb.append("\"description\":\"").append(escape(order.getDescription())).append("\",");
        sb.append("\"building\":\"").append(escape(order.getBuilding())).append("\",");
        sb.append("\"zone\":\"").append(escape(order.getZone())).append("\",");
        sb.append("\"assetName\":\"").append(escape(order.getAssetName())).append("\",");
        sb.append("\"assetSerial\":\"").append(escape(order.getAssetSerial())).append("\",");
        sb.append("\"category\":\"").append(escape(order.getCategory())).append("\",");
        sb.append("\"status\":\"").append(escape(order.getStatus())).append("\",");
        sb.append("\"priority\":\"").append(escape(order.getPriority())).append("\",");
        if (order.getAssignedTo() != null) {
            sb.append("\"assignedTo\":\"").append(escape(order.getAssignedTo())).append("\",");
        } else {
            sb.append("\"assignedTo\":null,");
        }
        sb.append("\"requester\":\"").append(escape(order.getRequester())).append("\",");
        sb.append("\"createdAt\":\"").append(escape(order.getCreatedAt())).append("\",");
        sb.append("\"slaRemaining\":\"").append(escape(order.getSlaRemaining())).append("\",");
        sb.append("\"slaBreached\":").append(order.isSlaBreached()).append(",");
        sb.append("\"estimatedCost\":").append(order.getEstimatedCost()).append(",");
        sb.append("\"timeline\":[");
        List<TimelineEvent> tl = order.getTimeline();
        if (tl != null) {
            for (int i = 0; i < tl.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(tl.get(i)));
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String toJson(FacilityAsset asset) {
        if (asset == null) return "null";
        return "{" +
                "\"id\":\"" + escape(asset.getId()) + "\"," +
                "\"serial\":\"" + escape(asset.getSerial()) + "\"," +
                "\"name\":\"" + escape(asset.getName()) + "\"," +
                "\"category\":\"" + escape(asset.getCategory()) + "\"," +
                "\"building\":\"" + escape(asset.getBuilding()) + "\"," +
                "\"zone\":\"" + escape(asset.getZone()) + "\"," +
                "\"health\":\"" + escape(asset.getHealth()) + "\"," +
                "\"uptime\":\"" + escape(asset.getUptime()) + "\"," +
                "\"lastMaintenance\":\"" + escape(asset.getLastMaintenance()) + "\"," +
                "\"nextMaintenance\":\"" + escape(asset.getNextMaintenance()) + "\"," +
                "\"openTickets\":" + asset.getOpenTickets() +
                "}";
    }

    public static String toJson(Technician tech) {
        if (tech == null) return "null";
        return "{" +
                "\"id\":\"" + escape(tech.getId()) + "\"," +
                "\"name\":\"" + escape(tech.getName()) + "\"," +
                "\"role\":\"" + escape(tech.getRole()) + "\"," +
                "\"specialty\":\"" + escape(tech.getSpecialty()) + "\"," +
                "\"shift\":\"" + escape(tech.getShift()) + "\"," +
                "\"status\":\"" + escape(tech.getStatus()) + "\"," +
                "\"activeOrders\":" + tech.getActiveOrders() + "," +
                "\"resolvedThisWeek\":" + tech.getResolvedThisWeek() + "," +
                "\"avgMttr\":\"" + escape(tech.getAvgMttr()) + "\"" +
                "}";
    }

    public static <T> String listToJson(List<T> list, java.util.function.Function<T, String> serializer) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(serializer.apply(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Simple parser for flat JSON objects: e.g. {"key": "val", "num": 123, "bool": true}
     */
    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> result = new HashMap<>();
        if (json == null) return result;
        json = json.trim();
        if (json.startsWith("{")) json = json.substring(1);
        if (json.endsWith("}")) json = json.substring(0, json.length() - 1);

        int i = 0;
        int len = json.length();
        while (i < len) {
            // Find key start
            while (i < len && (Character.isWhitespace(json.charAt(i)) || json.charAt(i) == ',')) i++;
            if (i >= len) break;
            if (json.charAt(i) != '"') {
                i++;
                continue;
            }
            i++; // skip open quote
            int keyStart = i;
            while (i < len && json.charAt(i) != '"') {
                if (json.charAt(i) == '\\') i++;
                i++;
            }
            String key = json.substring(keyStart, i);
            i++; // skip close quote

            // Find colon
            while (i < len && json.charAt(i) != ':') i++;
            if (i >= len) break;
            i++; // skip colon

            // Find value start
            while (i < len && Character.isWhitespace(json.charAt(i))) i++;
            if (i >= len) break;

            if (json.charAt(i) == '"') {
                i++; // skip quote
                int valStart = i;
                StringBuilder sb = new StringBuilder();
                while (i < len && json.charAt(i) != '"') {
                    if (json.charAt(i) == '\\' && i + 1 < len) {
                        i++;
                        char next = json.charAt(i);
                        if (next == 'n') sb.append('\n');
                        else if (next == 'r') sb.append('\r');
                        else if (next == 't') sb.append('\t');
                        else if (next == '"') sb.append('"');
                        else if (next == '\\') sb.append('\\');
                        else sb.append(next);
                    } else {
                        sb.append(json.charAt(i));
                    }
                    i++;
                }
                i++; // skip close quote
                result.put(key, sb.toString());
            } else if (json.charAt(i) == '{' || json.charAt(i) == '[') {
                // Nested object or array: extract balanced chunk
                char open = json.charAt(i);
                char close = open == '{' ? '}' : ']';
                int depth = 1;
                int chunkStart = i;
                i++;
                while (i < len && depth > 0) {
                    if (json.charAt(i) == open) depth++;
                    else if (json.charAt(i) == close) depth--;
                    i++;
                }
                result.put(key, json.substring(chunkStart, i));
            } else {
                // Primitive / boolean / number / null
                int valStart = i;
                while (i < len && json.charAt(i) != ',' && json.charAt(i) != '}') i++;
                String raw = json.substring(valStart, i).trim();
                if ("null".equalsIgnoreCase(raw)) {
                    result.put(key, null);
                } else {
                    result.put(key, raw);
                }
            }
        }
        return result;
    }
}

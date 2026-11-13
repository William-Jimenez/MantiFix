package com.mantifix.handler;

import com.mantifix.model.FacilityAsset;
import com.mantifix.model.Technician;
import com.mantifix.model.WorkOrder;
import com.mantifix.service.GeminiAiService;
import com.mantifix.service.WorkOrderService;
import com.mantifix.util.JsonUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class MantiFixHttpHandler implements HttpHandler {
    private final WorkOrderService service;
    private final GeminiAiService aiService;

    public MantiFixHttpHandler() {
        this(new WorkOrderService(), new GeminiAiService());
    }

    public MantiFixHttpHandler(WorkOrderService service, GeminiAiService aiService) {
        this.service = service;
        this.aiService = aiService;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Set CORS headers
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        String method = exchange.getRequestMethod().toUpperCase();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        URI uri = exchange.getRequestURI();
        String path = uri.getPath();

        try {
            if ("/api/health".equals(path)) {
                handleHealth(exchange);
            } else if ("/api/orders".equals(path)) {
                if ("GET".equals(method)) {
                    handleGetOrders(exchange, uri);
                } else if ("POST".equals(method)) {
                    handleCreateOrder(exchange);
                } else {
                    sendResponse(exchange, 405, "{\"error\":\"Método no permitido\"}");
                }
            } else if (path.startsWith("/api/orders/")) {
                handleOrderOperations(exchange, path, method);
            } else if ("/api/assets".equals(path)) {
                if ("GET".equals(method)) {
                    handleGetAssets(exchange);
                } else {
                    sendResponse(exchange, 405, "{\"error\":\"Método no permitido\"}");
                }
            } else if ("/api/technicians".equals(path)) {
                if ("GET".equals(method)) {
                    handleGetTechnicians(exchange);
                } else {
                    sendResponse(exchange, 405, "{\"error\":\"Método no permitido\"}");
                }
            } else if ("/api/ai/diagnose".equals(path)) {
                if ("POST".equals(method)) {
                    handleAiDiagnose(exchange);
                } else {
                    sendResponse(exchange, 405, "{\"error\":\"Método no permitido\"}");
                }
            } else {
                sendResponse(exchange, 404, "{\"error\":\"Ruta no encontrada\",\"path\":\"" + path + "\"}");
            }
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, "{\"error\":\"" + JsonUtil.escape(e.getMessage()) + "\"}");
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Error interno del servidor: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    private void handleHealth(HttpExchange exchange) throws IOException {
        String json = "{\"status\":\"UP\",\"service\":\"MantiFix-Backend-Java\",\"version\":\"1.0.0\"}";
        sendResponse(exchange, 200, json);
    }

    private void handleGetOrders(HttpExchange exchange, URI uri) throws IOException {
        Map<String, String> queryParams = parseQueryParams(uri.getQuery());
        String status = queryParams.get("status");
        String building = queryParams.get("building");
        String q = queryParams.get("q");

        List<WorkOrder> orders = service.getOrders(status, building, q);
        String json = JsonUtil.listToJson(orders, JsonUtil::toJson);
        sendResponse(exchange, 200, json);
    }

    private void handleCreateOrder(HttpExchange exchange) throws IOException {
        String body = readBody(exchange);
        Map<String, String> map = JsonUtil.parseSimpleJson(body);

        WorkOrder order = new WorkOrder();
        order.setTitle(map.get("title"));
        order.setDescription(map.get("description"));
        order.setBuilding(map.get("building"));
        order.setZone(map.get("zone"));
        order.setAssetName(map.get("assetName"));
        order.setAssetSerial(map.get("assetSerial"));
        order.setCategory(map.get("category"));
        order.setPriority(map.get("priority"));
        order.setStatus(map.get("status"));
        order.setAssignedTo(map.get("assignedTo"));
        order.setRequester(map.get("requester") != null ? map.get("requester") : "Coordinación de Operaciones");
        if (map.get("estimatedCost") != null) {
            try {
                order.setEstimatedCost(Double.parseDouble(map.get("estimatedCost")));
            } catch (NumberFormatException ignored) {}
        }

        WorkOrder created = service.createOrder(order);
        sendResponse(exchange, 201, JsonUtil.toJson(created));
    }

    private void handleOrderOperations(HttpExchange exchange, String path, String method) throws IOException {
        // Path pattern: /api/orders/{id}/(status|assign|notes) or /api/orders/{id}
        String sub = path.substring("/api/orders/".length());
        String[] parts = sub.split("/");
        String orderId = parts[0];

        if (parts.length == 1 && "GET".equals(method)) {
            Optional<WorkOrder> opt = service.getOrderById(orderId);
            if (opt.isPresent()) {
                sendResponse(exchange, 200, JsonUtil.toJson(opt.get()));
            } else {
                sendResponse(exchange, 404, "{\"error\":\"Orden no encontrada: " + JsonUtil.escape(orderId) + "\"}");
            }
            return;
        }

        if (parts.length >= 2) {
            String action = parts[1];
            String body = readBody(exchange);
            Map<String, String> map = JsonUtil.parseSimpleJson(body);

            if ("status".equalsIgnoreCase(action) && ("PUT".equals(method) || "PATCH".equals(method))) {
                String newStatus = map.get("status");
                Optional<WorkOrder> updated = service.updateOrderStatus(orderId, newStatus);
                if (updated.isPresent()) {
                    sendResponse(exchange, 200, JsonUtil.toJson(updated.get()));
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Orden no encontrada: " + JsonUtil.escape(orderId) + "\"}");
                }
                return;
            }

            if ("assign".equalsIgnoreCase(action) && ("PUT".equals(method) || "PATCH".equals(method))) {
                String techName = map.get("assignedTo");
                Optional<WorkOrder> updated = service.assignTechnician(orderId, techName);
                if (updated.isPresent()) {
                    sendResponse(exchange, 200, JsonUtil.toJson(updated.get()));
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Orden no encontrada: " + JsonUtil.escape(orderId) + "\"}");
                }
                return;
            }

            if ("notes".equalsIgnoreCase(action) && "POST".equals(method)) {
                String note = map.get("note");
                Optional<WorkOrder> updated = service.addNote(orderId, note);
                if (updated.isPresent()) {
                    sendResponse(exchange, 200, JsonUtil.toJson(updated.get()));
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Orden no encontrada: " + JsonUtil.escape(orderId) + "\"}");
                }
                return;
            }
        }

        sendResponse(exchange, 405, "{\"error\":\"Operación no soportada para la ruta dada\"}");
    }

    private void handleGetAssets(HttpExchange exchange) throws IOException {
        List<FacilityAsset> assets = service.getAssets();
        String json = JsonUtil.listToJson(assets, JsonUtil::toJson);
        sendResponse(exchange, 200, json);
    }

    private void handleGetTechnicians(HttpExchange exchange) throws IOException {
        List<Technician> technicians = service.getTechnicians();
        String json = JsonUtil.listToJson(technicians, JsonUtil::toJson);
        sendResponse(exchange, 200, json);
    }

    private void handleAiDiagnose(HttpExchange exchange) throws IOException {
        String body = readBody(exchange);
        Map<String, String> map = JsonUtil.parseSimpleJson(body);

        String title = map.get("title");
        String description = map.get("description");
        String category = map.get("category");
        String assetName = map.get("assetName");

        String diagnosisResult = aiService.diagnoseIssue(title, description, category, assetName);
        sendResponse(exchange, 200, diagnosisResult);
    }

    private String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                String key = java.net.URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String value = java.net.URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                map.put(key, value);
            }
        }
        return map;
    }
}

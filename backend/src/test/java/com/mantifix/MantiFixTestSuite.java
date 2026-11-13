package com.mantifix;

import com.mantifix.model.FacilityAsset;
import com.mantifix.model.Technician;
import com.mantifix.model.WorkOrder;
import com.mantifix.service.DataStore;
import com.mantifix.service.GeminiAiService;
import com.mantifix.service.WorkOrderService;
import com.mantifix.util.JsonUtil;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class MantiFixTestSuite {
    private static int testsPassed = 0;
    private static int testsFailed = 0;

    private static void assertTrue(String message, boolean condition) {
        if (condition) {
            System.out.println("  [PASS] " + message);
            testsPassed++;
        } else {
            System.err.println("  [FAIL] " + message);
            testsFailed++;
        }
    }

    private static void assertEquals(String message, Object expected, Object actual) {
        if (expected == null && actual == null) {
            assertTrue(message, true);
        } else if (expected != null && expected.equals(actual)) {
            assertTrue(message + " (expected: " + expected + ", got: " + actual + ")", true);
        } else {
            assertTrue(message + " - FAILURE: expected <" + expected + "> but was <" + actual + ">", false);
        }
    }

    public static void main(String[] args) {
        System.out.println("========================================================");
        System.out.println("   MantiFix Enterprise - Suite de Pruebas Automatizadas");
        System.out.println("========================================================");

        try {
            runDataStoreTests();
            runWorkOrderServiceTests();
            runJsonUtilTests();
            runGeminiAiServiceTests();
            runHttpIntegrationTests();
        } catch (Exception e) {
            System.err.println("Error crítico durante ejecución de pruebas: " + e.getMessage());
            e.printStackTrace();
            testsFailed++;
        }

        System.out.println("========================================================");
        System.out.println("RESUMEN DE PRUEBAS:");
        System.out.println("  Total superadas: " + testsPassed);
        System.out.println("  Total falladas:  " + testsFailed);
        System.out.println("========================================================");

        if (testsFailed > 0) {
            System.exit(1);
        }
    }

    private static void runDataStoreTests() {
        System.out.println("\n[1/5] Ejecutando pruebas de DataStore...");
        DataStore ds = DataStore.getInstance();
        ds.resetToDefaults();

        List<WorkOrder> orders = ds.getOrders();
        assertTrue("DataStore inicializa 6 órdenes predeterminadas", orders.size() == 6);

        List<FacilityAsset> assets = ds.getAssets();
        assertTrue("DataStore inicializa 6 activos predeterminados", assets.size() == 6);

        List<Technician> technicians = ds.getTechnicians();
        assertTrue("DataStore inicializa 5 técnicos predeterminados", technicians.size() == 5);

        Optional<WorkOrder> order = ds.getOrderById("MNT-4092");
        assertTrue("Orden MNT-4092 recuperada correctamente", order.isPresent());
        assertEquals("MNT-4092 tiene categoría HVAC", "HVAC", order.get().getCategory());
        assertEquals("MNT-4092 tiene prioridad P1", "P1", order.get().getPriority());
    }

    private static void runWorkOrderServiceTests() {
        System.out.println("\n[2/5] Ejecutando pruebas de WorkOrderService...");
        DataStore ds = DataStore.getInstance();
        ds.resetToDefaults();
        WorkOrderService service = new WorkOrderService(ds);

        // Filtro por estado
        List<WorkOrder> urgentOrders = service.getOrders("Urgente", null, null);
        assertTrue("Filtro 'Urgente' retorna órdenes con estado Urgente",
                urgentOrders.stream().allMatch(o -> "Urgente".equals(o.getStatus())));

        // Filtro por edificio
        List<WorkOrder> buildingOrders = service.getOrders(null, "Torre Corporativa A", null);
        assertTrue("Filtro por edificio 'Torre Corporativa A' funciona",
                buildingOrders.stream().allMatch(o -> "Torre Corporativa A".equals(o.getBuilding())));

        // Búsqueda por texto
        List<WorkOrder> searched = service.getOrders(null, null, "chiller");
        assertTrue("Búsqueda por palabra clave 'chiller' retorna resultados relevantes", searched.size() > 0);

        // Creación de orden válida
        WorkOrder newOrder = new WorkOrder();
        newOrder.setTitle("Fallo en sensor de presión");
        newOrder.setDescription("Lecturas erráticas en válvula");
        newOrder.setBuilding("Torre Corporativa B");
        newOrder.setZone("Piso 3");
        newOrder.setAssetName("Bomba Hidráulica");
        newOrder.setAssetSerial("HYD-001");
        newOrder.setCategory("Hidráulico");
        newOrder.setPriority("P1");
        newOrder.setRequester("Supervisor de Planta");

        WorkOrder created = service.createOrder(newOrder);
        assertTrue("Creación de orden asigna ID autoincremental MNT-4093+", created.getId().startsWith("MNT-"));
        assertEquals("Prioridad P1 asigna estado Urgente automáticamente", "Urgente", created.getStatus());
        assertEquals("Prioridad P1 asigna SLA de 01h 00m", "01h 00m", created.getSlaRemaining());

        // Actualización de estado
        Optional<WorkOrder> updated = service.updateOrderStatus(created.getId(), "Resuelta");
        assertTrue("Actualización a Resuelta exitosa", updated.isPresent());
        assertEquals("Estado actualizado a Resuelta", "Resuelta", updated.get().getStatus());
        assertEquals("SLA marcado como Completada al resolver", "Completada", updated.get().getSlaRemaining());

        // Asignación de técnico
        Optional<WorkOrder> assigned = service.assignTechnician(created.getId(), "Carlos Mendoza");
        assertTrue("Asignación de técnico exitosa", assigned.isPresent());
        assertEquals("Técnico asignado correctamente", "Carlos Mendoza", assigned.get().getAssignedTo());

        // Adición de nota
        Optional<WorkOrder> noted = service.addNote(created.getId(), "Inspección técnica finalizada");
        assertTrue("Nota agregada correctamente", noted.isPresent());
        assertTrue("Timeline contiene la nueva nota",
                noted.get().getTimeline().stream().anyMatch(e -> "Inspección técnica finalizada".equals(e.getDetail())));
    }

    private static void runJsonUtilTests() {
        System.out.println("\n[3/5] Ejecutando pruebas de JsonUtil...");
        WorkOrder wo = new WorkOrder();
        wo.setId("MNT-TEST");
        wo.setTitle("Prueba con \"comillas\" y \n saltos de línea");
        wo.setStatus("Pendiente");
        wo.setEstimatedCost(150.50);

        String json = JsonUtil.toJson(wo);
        assertTrue("JsonUtil serializa WorkOrder sin excepciones", json.contains("\"id\":\"MNT-TEST\""));
        assertTrue("JsonUtil escapa caracteres especiales", json.contains("\\\"comillas\\\""));

        Map<String, String> parsed = JsonUtil.parseSimpleJson("{\"title\":\"Orden de prueba\",\"priority\":\"P1\",\"num\":100}");
        assertEquals("Parse simple extrae clave title", "Orden de prueba", parsed.get("title"));
        assertEquals("Parse simple extrae clave priority", "P1", parsed.get("priority"));
    }

    private static void runGeminiAiServiceTests() {
        System.out.println("\n[4/5] Ejecutando pruebas de GeminiAiService (Modo heurístico / fallback)...");
        GeminiAiService ai = new GeminiAiService(null); // sin API key para probar heurística interna
        String result = ai.diagnoseIssue("Alarma alta temperatura", "Compresor sobrecalentado", "HVAC", "Chiller York");

        assertTrue("Respuesta de diagnóstico AI no está vacía", result != null && !result.isEmpty());
        assertTrue("Diagnóstico contiene probableCause", result.contains("probableCause"));
        assertTrue("Diagnóstico contiene recommendedAction", result.contains("recommendedAction"));
        assertTrue("Diagnóstico contiene status success", result.contains("\"status\":\"success\""));
    }

    private static void runHttpIntegrationTests() throws Exception {
        System.out.println("\n[5/5] Ejecutando pruebas de Integración HTTP del Servidor Java...");
        int testPort = 8899;
        MantiFixServer server = new MantiFixServer(testPort);
        server.start();

        try {
            // 1. GET /api/health
            String healthResp = httpGet("http://localhost:" + testPort + "/api/health");
            assertTrue("GET /api/health responde 200 con status UP", healthResp.contains("\"status\":\"UP\""));

            // 2. GET /api/orders
            String ordersResp = httpGet("http://localhost:" + testPort + "/api/orders");
            assertTrue("GET /api/orders responde con lista de órdenes", ordersResp.startsWith("[") && ordersResp.contains("MNT-4092"));

            // 3. POST /api/orders
            String createJson = "{\"title\":\"Fallo transformador auxiliar\",\"building\":\"Centro de Datos B\",\"priority\":\"P1\",\"requester\":\"Guardia\"}";
            HttpResponse createResp = httpSend("http://localhost:" + testPort + "/api/orders", "POST", createJson);
            assertEquals("POST /api/orders responde 201 Created", 201, createResp.statusCode);
            assertTrue("Orden creada contiene ID MNT-", createResp.body.contains("\"id\":\"MNT-"));

            // 4. PUT /api/orders/{id}/status
            HttpResponse statusResp = httpSend("http://localhost:" + testPort + "/api/orders/MNT-4092/status", "PUT", "{\"status\":\"Resuelta\"}");
            assertEquals("PUT /api/orders/MNT-4092/status responde 200", 200, statusResp.statusCode);
            assertTrue("Estado de MNT-4092 actualizado a Resuelta", statusResp.body.contains("\"status\":\"Resuelta\""));

            // 5. PUT /api/orders/{id}/assign
            HttpResponse assignResp = httpSend("http://localhost:" + testPort + "/api/orders/MNT-4090/assign", "PUT", "{\"assignedTo\":\"Sofía Navarro\"}");
            assertEquals("PUT /api/orders/MNT-4090/assign responde 200", 200, assignResp.statusCode);
            assertTrue("Técnico asignado a Sofía Navarro", assignResp.body.contains("\"assignedTo\":\"Sofía Navarro\""));

            // 6. POST /api/orders/{id}/notes
            HttpResponse noteResp = httpSend("http://localhost:" + testPort + "/api/orders/MNT-4090/notes", "POST", "{\"note\":\"Prueba hidráulica completada\"}");
            assertEquals("POST /api/orders/MNT-4090/notes responde 200", 200, noteResp.statusCode);
            assertTrue("Nota reflejada en el detalle", noteResp.body.contains("Prueba hidráulica completada"));

            // 7. GET /api/assets
            String assetsResp = httpGet("http://localhost:" + testPort + "/api/assets");
            assertTrue("GET /api/assets responde con lista de activos", assetsResp.contains("Chiller Centrífugo York 450T"));

            // 8. GET /api/technicians
            String techResp = httpGet("http://localhost:" + testPort + "/api/technicians");
            assertTrue("GET /api/technicians responde con lista de técnicos", techResp.contains("Carlos Mendoza"));

            // 9. POST /api/ai/diagnose
            String aiReq = "{\"title\":\"Ruido extraño\",\"description\":\"Chirrido metálico\",\"category\":\"Elevadores\",\"assetName\":\"Elevador 4\"}";
            HttpResponse aiResp = httpSend("http://localhost:" + testPort + "/api/ai/diagnose", "POST", aiReq);
            assertEquals("POST /api/ai/diagnose responde 200", 200, aiResp.statusCode);
            assertTrue("Diagnóstico contiene probableCause", aiResp.body.contains("probableCause"));

            // 10. CORS Pre-flight OPTIONS
            URL url = new URL("http://localhost:" + testPort + "/api/orders");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("OPTIONS");
            conn.connect();
            assertEquals("OPTIONS responde 204 No Content", 204, conn.getResponseCode());
            assertEquals("CORS Access-Control-Allow-Origin presente", "*", conn.getHeaderField("Access-Control-Allow-Origin"));
            conn.disconnect();

            // 11. 404 Not Found
            URL notFoundUrl = new URL("http://localhost:" + testPort + "/api/nonexistent");
            HttpURLConnection nfConn = (HttpURLConnection) notFoundUrl.openConnection();
            nfConn.setRequestMethod("GET");
            assertEquals("Ruta inexistente responde 404", 404, nfConn.getResponseCode());
            nfConn.disconnect();

        } finally {
            server.stop();
        }
    }

    private static String httpGet(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        try (InputStream is = conn.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } finally {
            conn.disconnect();
        }
    }

    private static class HttpResponse {
        int statusCode;
        String body;
        HttpResponse(int statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
        }
    }

    private static HttpResponse httpSend(String urlStr, String method, String jsonBody) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }
        int code = conn.getResponseCode();
        InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String body = is != null ? new String(is.readAllBytes(), StandardCharsets.UTF_8) : "";
        conn.disconnect();
        return new HttpResponse(code, body);
    }
}

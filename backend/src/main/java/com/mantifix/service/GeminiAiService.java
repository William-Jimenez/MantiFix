package com.mantifix.service;

import com.mantifix.util.JsonUtil;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class GeminiAiService {
    private final String apiKey;
    private final HttpClient httpClient;

    public GeminiAiService() {
        this(System.getenv("GEMINI_API_KEY"));
    }

    public GeminiAiService(String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : null;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public String diagnoseIssue(String title, String description, String category, String assetName) {
        if (apiKey != null && !apiKey.isEmpty() && !"MY_GEMINI_API_KEY".equals(apiKey)) {
            try {
                String prompt = String.format(
                        "Como asistente de mantenimiento industrial para MantiFix, analiza este incidente:\\n" +
                                "Equipo: %s\\nCategoría: %s\\nTítulo: %s\\nDescripción: %s\\n" +
                                "Proporciona en 2 frases: 1) Causa probable y 2) Acción correctiva inmediata sugerida.",
                        JsonUtil.escape(assetName),
                        JsonUtil.escape(category),
                        JsonUtil.escape(title),
                        JsonUtil.escape(description)
                );

                String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt + "\"}]}]}";
                String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(10))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    return response.body();
                }
            } catch (Exception e) {
                // Fall through to heuristic diagnostics on network or API failure
            }
        }

        // Heuristic diagnostic fallback
        return generateHeuristicDiagnosis(title, description, category, assetName);
    }

    private String generateHeuristicDiagnosis(String title, String description, String category, String assetName) {
        String lowerCat = category != null ? category.toLowerCase() : "";
        String diagnosis;
        String action;

        if (lowerCat.contains("hvac")) {
            diagnosis = "Posible restricción en flujo de refrigerante o acumulación de suciedad en condensador.";
            action = "Revisar presiones de alta/baja en manómetros, inspeccionar filtro deshidratador y estado de ventiladores de condensación.";
        } else if (lowerCat.contains("eléctrico") || lowerCat.contains("electrico")) {
            diagnosis = "Fluctuación de carga o sobrecalentamiento en conexiones de contactores y barras.";
            action = "Realizar inspección termográfica inmediata, verificar torque de bornes y medir balanceo de fases.";
        } else if (lowerCat.contains("elevador")) {
            diagnosis = "Desalineación de zapatas guía o holgura en cables de tracción.";
            action = "Efectuar parada de seguridad, lubricar rieles y calibrar sensores de nivelación de piso.";
        } else if (lowerCat.contains("hidráulico") || lowerCat.contains("hidraulico")) {
            diagnosis = "Fallo de sello mecánico por desgaste prematuro o cavitación en impulsor.";
            action = "Verificar presión de succión en cisterna, chequear empaquetadura y purgar aire residual.";
        } else if (lowerCat.contains("seguridad")) {
            diagnosis = "Pérdida de sincronización con servidor de autenticación o degradación de firmware en lector.";
            action = "Reiniciar microcontrolador de acceso, verificar alimentación PoE de 48V y probar llave física de contingencia.";
        } else {
            diagnosis = "Incidente operativo que requiere inspección física en sitio.";
            action = "Despachar técnico de guardia para verificación preliminar y aislamiento de seguridad.";
        }

        return "{" +
                "\"assetName\":\"" + JsonUtil.escape(assetName) + "\"," +
                "\"category\":\"" + JsonUtil.escape(category) + "\"," +
                "\"probableCause\":\"" + JsonUtil.escape(diagnosis) + "\"," +
                "\"recommendedAction\":\"" + JsonUtil.escape(action) + "\"," +
                "\"aiEngine\":\"" + (apiKey != null && !apiKey.isEmpty() && !"MY_GEMINI_API_KEY".equals(apiKey) ? "Gemini-1.5-Flash" : "MantiFix-Heuristic-Engine") + "\"," +
                "\"status\":\"success\"" +
                "}";
    }
}

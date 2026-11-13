package com.mantifix;

import com.mantifix.handler.MantiFixHttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class MantiFixServer {
    public static final int DEFAULT_PORT = 8080;
    private HttpServer server;
    private final int port;

    public MantiFixServer() {
        this(getPortFromEnv());
    }

    public MantiFixServer(int port) {
        this.port = port;
    }

    private static int getPortFromEnv() {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                return Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {}
        }
        return DEFAULT_PORT;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api", new MantiFixHttpHandler());
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("=================================================");
        System.out.println("  MantiFix Enterprise - Backend Java Activo");
        System.out.println("  Puerto: " + port);
        System.out.println("  API Health: http://localhost:" + port + "/api/health");
        System.out.println("  API Orders: http://localhost:" + port + "/api/orders");
        System.out.println("=================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("MantiFix Backend Server detenido.");
        }
    }

    public int getPort() {
        return port;
    }

    public static void main(String[] args) {
        try {
            MantiFixServer app = new MantiFixServer();
            app.start();
            Runtime.getRuntime().addShutdownHook(new Thread(app::stop));
        } catch (IOException e) {
            System.err.println("Error iniciando servidor MantiFix: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}

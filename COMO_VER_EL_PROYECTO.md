# Guía de Puesta en Marcha Local — MantiFix Enterprise

Esta guía detalla los pasos exactos para instalar, configurar y levantar el proyecto **MantiFix Enterprise** en tu entorno local (Windows), dejándolo accesible desde cualquier navegador web.

---

## 1. Arquitectura y Tecnologías del Proyecto

El sistema se compone de dos capas desacopladas:

1. **Frontend (Consola Web Operativa):**
   * **Tecnología:** React 19 + TypeScript + Vite 8.
   * **Estilos:** Tailwind CSS 4 + Lucide Icons + Motion.
   * **Puerto por defecto:** `3000` (URL: `http://localhost:3000`).
2. **Backend (Servicio REST y Telemetría):**
   * **Tecnología:** Java 21 (Amazon Corretto / OpenJDK) sin dependencias externas pesadas.
   * **Puerto por defecto:** `8080` (URL: `http://localhost:8080/api/health`).

---

## 2. Requisitos Previos e Instalación en Windows

Para ejecutar el proyecto necesitas tener instaladas las siguientes herramientas:

### A. Node.js (Versión recomendada: 20 LTS o 22 LTS)
* **Descarga oficial:** [https://nodejs.org/](https://nodejs.org/) (instalador `.msi` para Windows x64).
* **Verificación en terminal:**
  ```powershell
  node -v
  npm -v
  ```

### B. Java Development Kit (JDK 21 LTS)
* **Descarga oficial:** [Amazon Corretto 21](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html) o [Adoptium Temurin 21](https://adoptium.net/).
* **Verificación en terminal:**
  ```powershell
  javac -version
  java -version
  ```

### C. Git para Windows
* **Descarga oficial:** [https://git-scm.com/](https://git-scm.com/)

---

## 3. Configuración del Entorno

En la raíz del proyecto existe un archivo `.env.example`. Crea una copia con el nombre `.env`:

```powershell
Copy-Item .env.example .env
```

Contenido de `.env`:
```env
# Clave opcional de Google Gemini para diagnósticos con IA predictiva.
# Si no dispones de una clave, el backend opera automáticamente con su motor heurístico interno.
GEMINI_API_KEY="TU_API_KEY_AQUI"

# URL base del aplicativo
APP_URL="http://localhost:3000"
```

> **Nota sobre credenciales:** La variable `GEMINI_API_KEY` es opcional. El sistema cuenta con fallback heurístico automático para clasificar incidentes y sugerir acciones correctivas incluso sin conexión a la API externa.

---

## 4. Instalación de Dependencias

### Paso 1: Dependencias del Frontend
Abre PowerShell o CMD en la raíz del repositorio (`MantiFix`) y ejecuta:

```powershell
npm install --legacy-peer-deps
npm install @rolldown/binding-win32-x64-msvc --legacy-peer-deps
```

> **¿Por qué `--legacy-peer-deps`?** Permite resolver limpiamente las dependencias de Vite 8 sin conflictos de dependencias entre paquetes satélite.

### Paso 2: Compilación del Backend en Java
Ejecuta el script preconfigurado en la carpeta `backend`:

```powershell
cd backend
.\build.cmd
cd ..
```
*Esto compilará las clases y generará el ejecutable `backend\target\mantifix-backend-1.0.0.jar`.*

---

## 5. Comandos de Arranque

Puedes levantar ambos servicios en dos terminales independientes:

### Terminal 1: Iniciar el Backend Java (Puerto 8080)
```powershell
cd backend
.\run.cmd
```
*O alternativamente con java directo:*
```powershell
java -jar backend\target\mantifix-backend-1.0.0.jar
```
*Salida esperada:*
```text
=================================================
  MantiFix Enterprise - Backend Java Activo
  Puerto: 8080
  API Health: http://localhost:8080/api/health
  API Orders: http://localhost:8080/api/orders
=================================================
```

### Terminal 2: Iniciar la Consola Web Frontend (Puerto 3000)
Desde la raíz del proyecto:
```powershell
npm run dev
```
*Salida esperada:*
```text
  VITE v8.3.8  ready in 319 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

---

## 6. Acceso desde el Navegador

Abre tu navegador web favorito (Chrome, Edge, Firefox, Brave) e ingresa a:

👉 **[http://localhost:3000](http://localhost:3000)**

Para comprobar la salud del backend API:
👉 **[http://localhost:8080/api/health](http://localhost:8080/api/health)**

---

## 7. Preguntas Frecuentes y Solución de Problemas

### 1. Error `Cannot find module '@rolldown/binding-win32-x64-msvc'`
* **Causa:** Vite 8 utiliza Rolldown como empaquetador nativo y en Windows requiere la librería binaria nativa.
* **Solución:** Ejecuta:
  ```powershell
  npm install @rolldown/binding-win32-x64-msvc --legacy-peer-deps
  ```

### 2. Conflicto `ERESOLVE could not resolve` al ejecutar `npm install`
* **Causa:** Diferencia entre versiones de peer dependencies de Vite y plugins de Tailwind.
* **Solución:** Usa siempre la bandera `--legacy-peer-deps`:
  ```powershell
  npm install --legacy-peer-deps
  ```

### 3. Puerto 3000 u 8080 en uso
* **Frontend:** Si el puerto 3000 está ocupado, puedes iniciarlo en otro puerto:
  ```powershell
  npx vite --port 3001
  ```
* **Backend:** Puedes asignar cualquier puerto usando la variable de entorno `PORT`:
  ```powershell
  $env:PORT="8081"; java -jar backend\target\mantifix-backend-1.0.0.jar
  ```

### 4. ¿Cómo ejecutar las pruebas automatizadas del Backend?
Desde la carpeta `backend`:
```powershell
cd backend
.\test.cmd
```
*Ejecutará la suite de 44 pruebas unitarias y de integración HTTP.*

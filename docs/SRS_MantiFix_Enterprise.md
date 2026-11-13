# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)

**Sistema:** MantiFix Enterprise — Plataforma Operativa para Gestión de Mantenimiento Corporativo, Órdenes de Trabajo, Activos e Indicadores SLA  
**Versión:** 1.0.0  
**Fecha:** 13 de noviembre de 2026  
**Estado:** Aprobado para Desarrollo y Validación  

---

## 1. HISTORIAS DE USUARIO

A continuación se presentan las Historias de Usuario organizadas cronológicamente por módulo operativo. Cada historia define el rol solicitante, la necesidad operativa, el valor de negocio y sus criterios de aceptación comprobables y verificables.

---

### HU-01: Autenticación y Control de Acceso por Roles
* **Enunciado:** Como **Supervisor de Operaciones / Técnico**, quiero **iniciar sesión en la plataforma utilizando mis credenciales corporativas**, para **acceder a las vistas y acciones operativas correspondientes a mi perfil con total seguridad**.
* **Prioridad:** Alta (Crítica).
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El sistema debe autenticar al usuario validando correo corporativo y contraseña contra el almacén central de identidades.
  2. En caso de credenciales inválidas, el sistema debe emitir un mensaje de error explícito sin exponer información de seguridad: *"Credenciales de acceso incorrectas o cuenta no autorizada"*.
  3. Tras una autenticación exitosa, el sistema debe generar una sesión segura y redirigir al usuario al panel principal (*Dashboard*) correspondiente a su rol.
  4. Si un usuario inactivo o deshabilitado intenta acceder, el sistema debe denegar el acceso e indicar el estado de la cuenta.
* **Trazabilidad:** RF-01, CU-01.

---

### HU-02: Visualización de Panel de Control (Dashboard) e Indicadores SLA
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **visualizar un panel central con los KPIs operacionales del día (solicitudes abiertas, cumplimiento SLA, MTTR y activos críticos)**, para **conocer el estado del servicio en tiempo real y anticipar desviaciones operativas**.
* **Prioridad:** Alta.
* **Estimación:** 8 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El panel debe mostrar cuatro métricas consolidadas: Total de Órdenes Abiertas, Porcentaje de Cumplimiento SLA, MTTR Promedio y Total de Activos en Estado Crítico.
  2. Cada métrica debe incluir el comparativo porcentual respecto a la semana inmediatamente anterior.
  3. La interfaz debe permitir conmutar entre vistas operativas (*Dashboard*, *Órdenes de Trabajo*, *Activos*, *Técnicos*) sin recargar la página.
  4. Los datos numéricos deben calcularse dinámicamente a partir de las órdenes registradas en el almacén de datos.
* **Trazabilidad:** RF-02, CU-10.

---

### HU-03: Registro y Apertura de Nuevas Órdenes de Trabajo
* **Enunciado:** Como **Supervisor de Operaciones o Solicitante**, quiero **registrar una nueva orden de trabajo especificando título, descripción, activo involucrado, edificio, zona y prioridad**, para **canalizar la atención técnica formal de un incidente en las instalaciones**.
* **Prioridad:** Alta.
* **Estimación:** 8 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El formulario debe exigir como obligatorios los campos: Título, Edificio, Activo y Prioridad (`P1`, `P2`, `P3`, `P4`).
  2. El sistema debe generar un identificador correlativo único autoincremental con el formato `MNT-XXXX` (iniciando en `MNT-4093` para nuevos registros).
  3. Al seleccionar prioridad `P1`, el sistema debe asignar de manera obligatoria y automática el estado inicial en `Urgente` y establecer el tiempo de SLA en `01h 00m`.
  4. Si no se asigna técnico de inmediato, el estado debe quedar en `Pendiente`; si se asigna un técnico, debe pasar a `En Proceso`.
  5. El sistema debe registrar de forma automática el primer evento en la línea de tiempo (*Timeline*) con fecha, hora, solicitante y descripción del alta.
* **Trazabilidad:** RF-03, CU-02.

---

### HU-04: Asignación y Reasignación de Técnicos
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **asignar o reasignar una orden de trabajo a un técnico específico según su especialidad y estado de turno**, para **asegurar la resolución calificada del incidente dentro de la ventana de tiempo pactada**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El selector de técnicos debe desplegar únicamente el personal calificado y reflejar su estado operativo (`En Campo`, `En Turno`, `Disponible`, `Fuera de Turno`).
  2. Al asignar un técnico a una orden en estado `Pendiente`, el sistema debe transicionar automáticamente su estado a `En Proceso`.
  3. Toda asignación o desasignación debe generar un evento de auditoría en la línea de tiempo indicando el supervisor actuante, el técnico asignado y la marca temporal.
  4. El contador de órdenes activas del técnico involucrado debe actualizarse de forma inmediata.
* **Trazabilidad:** RF-04, CU-03.

---

### HU-05: Actualización del Ciclo de Vida y Estado de Órdenes
* **Enunciado:** Como **Supervisor de Operaciones o Técnico Asignado**, quiero **actualizar el estado de una orden (`Pendiente`, `En Proceso`, `Urgente`, `Resuelta`)**, para **reflejar con exactitud la etapa operativa del mantenimiento**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El cambio de estado debe persistirse de forma inmediata en el sistema.
  2. Cuando el estado cambie a `Resuelta`, el campo `slaRemaining` debe fijarse automáticamente en `Completada` y registrarse la hora de cierre para el cálculo de MTTR.
  3. Si la orden se escala a `Urgente`, debe activarse un indicador visual parpadeante (*pulse badge*) en la tabla operativa.
  4. Cada transición debe añadir un registro inmutable en el historial cronológico de la orden.
* **Trazabilidad:** RF-05, CU-04.

---

### HU-06: Gestión de Bitácora Técnica y Eventos Cronológicos (Timeline)
* **Enunciado:** Como **Técnico Asignado o Supervisor**, quiero **registrar notas de avance, evidencias técnicas y detalles de piezas reemplazadas en la orden**, para **mantener una bitácora auditable de los trabajos ejecutados**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El panel de detalle de la orden debe mostrar cronológicamente todos los eventos con hora, actor, rol, acción, detalle y tono visual.
  2. El formulario de notas debe impedir envíos con texto en blanco o solo espacios.
  3. La nueva nota debe agregarse al inicio o final según el orden cronológico y ser visible instantáneamente sin recargar la pantalla.
  4. Las notas registradas deben ser inmutables para garantizar trazabilidad legal y técnica.
* **Trazabilidad:** RF-06, CU-05.

---

### HU-07: Búsqueda y Filtrado Multicriterio de Órdenes
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **filtrar las órdenes de trabajo por estado, edificio y término de búsqueda textual (ID, título, activo, técnico)**, para **localizar incidentes específicos en pocos segundos durante la operación diaria**.
* **Prioridad:** Media.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. La barra de búsqueda debe admitir coincidencias parciales sin distinción de mayúsculas/minúsculas.
  2. Los selectores de estado (`Todas`, `Urgente`, `Pendiente`, `En Proceso`, `Resuelta`) y edificio deben interactuar de forma combinada (*AND* lógico).
  3. Si no existen coincidencias, la grilla debe mostrar un mensaje descriptivo: *"No se encontraron órdenes con los criterios especificados"*.
  4. La respuesta visual del filtro debe ser instantánea (latencia inferior a 150 ms en cliente).
* **Trazabilidad:** RF-07, CU-06.

---

### HU-08: Gestión de Operaciones Masivas sobre Órdenes
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **seleccionar múltiples órdenes de trabajo y actualizar su estado en un solo paso**, para **agilizar la administración de incidentes durante contingencias masivas**.
* **Prioridad:** Media.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. La tabla debe permitir seleccionar filas individuales mediante casillas de verificación y una casilla global para seleccionar todas las filas visibles.
  2. Al tener una o más órdenes seleccionadas, debe emerger una barra de acciones masivas que permita elegir el nuevo estado (`Pendiente`, `En Proceso`, `Urgente`, `Resuelta`).
  3. El sistema debe aplicar el cambio a cada orden seleccionada, registrar el evento correspondiente en cada bitácora y deseleccionar las filas al concluir.
* **Trazabilidad:** RF-08, CU-11.

---

### HU-09: Inventario y Ficha Técnica de Activos de Infraestructura
* **Enunciado:** Como **Supervisor de Mantenimiento**, quiero **consultar el catálogo de activos corporativos con su serial, categoría, ubicación, salud operativa, uptime y fecha del próximo mantenimiento**, para **planificar programas preventivos y prevenir paradas no programadas**.
* **Prioridad:** Alta.
* **Estimación:** 8 Puntos de Historia.
* **Criterios de Aceptación:**
  1. La vista de activos debe listar los equipos clasificados por categorías (`HVAC`, `Eléctrico`, `Elevadores`, `Hidráulico`, `Seguridad`, `Infraestructura`).
  2. Cada ficha debe indicar el estado de salud: `Óptimo` (verde), `Atención` (ámbar), `Crítico` (rojo).
  3. Debe mostrarse la cantidad de tickets abiertos asociados a cada activo en tiempo real.
  4. Debe existir un acceso directo desde cada tarjeta de activo para crear una orden de trabajo preseleccionando el serial del equipo.
* **Trazabilidad:** RF-09, CU-07.

---

### HU-10: Supervisión de Técnicos, Turnos y Capacidad Operativa
* **Enunciado:** Como **Coordinador de Operaciones**, quiero **visualizar el directorio de técnicos con su especialidad, turno laboral, estado de conexión, órdenes activas y promedio MTTR**, para **balancear la carga de trabajo y asegurar cobertura en los tres turnos**.
* **Prioridad:** Media.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El módulo debe agrupar los técnicos y reflejar sus turnos (`Matutino: 06:00–14:00`, `Vespertino: 14:00–22:00`, `Nocturno: 22:00–06:00`).
  2. El estado operativo (`En Campo`, `En Turno`, `Disponible`, `Fuera de Turno`) debe actualizarse dinámicamente según la carga activa.
  3. Deben mostrarse los indicadores individuales de órdenes resueltas en la semana y MTTR histórico.
* **Trazabilidad:** RF-10, CU-08.

---

### HU-11: Diagnóstico Asistido por Inteligencia Artificial y Fallback Heurístico
* **Enunciado:** Como **Supervisor o Técnico**, quiero **solicitar un diagnóstico automático sobre las posibles causas y acciones correctivas de un incidente basándome en los síntomas y el activo**, para **acelerar el triaje y mitigar fallas críticas con mayor precisión**.
* **Prioridad:** Media.
* **Estimación:** 8 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El sistema debe contar con un endpoint `/api/ai/diagnose` que consuma el modelo Google Gemini API cuando la variable `GEMINI_API_KEY` esté configurada.
  2. En ausencia de conectividad o sin clave de API configurada, el sistema debe activar de forma transparente su motor heurístico interno basado en reglas especializadas por categoría (`HVAC`, `Eléctrico`, etc.).
  3. La respuesta debe estructurar siempre: Causa Probable (`probableCause`), Acción Recomendada (`recommendedAction`), Motor Utilizado (`aiEngine`) y Estado de Ejecución.
  4. El tiempo de respuesta del motor heurístico no debe superar los 200 milisegundos.
* **Trazabilidad:** RF-11, CU-09.

---

### HU-12: Integración de Telemetría IoT / BMS para Generación Automática P1
* **Enunciado:** Como **Sistema de Automatización Edilicia (BMS / IoT)**, quiero **enviar alertas de telemetría fuera de umbral al endpoint de órdenes**, para **abrir incidentes críticos P1 de manera automática sin intervención humana inicial**.
* **Prioridad:** Alta.
* **Estimación:** 8 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El endpoint HTTP `POST /api/orders` debe recibir cargas JSON provenientes de sensores BMS con telemetría fuera de norma.
  2. La orden creada automáticamente debe llevar prioridad `P1`, solicitante `Sistema BMS Automático` y evento inicial con tono `critical`.
  3. La orden debe quedar disponible de inmediato en la cola de urgencias del supervisor.
* **Trazabilidad:** RF-12, CU-02.

---

### HU-13: Control de SLA y Alerta de Vencimiento
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **recibir alertas visuales cuando una orden esté a punto de incumplir su tiempo pactado de respuesta o resolución**, para **intervenir y reasignar recursos antes de incurrir en penalidades contractuales**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El sistema debe calcular el tiempo restante de SLA (`slaRemaining`) en base a la prioridad (`P1`: 1h, `P2`: 4h, `P3`/`P4`: 12h).
  2. Cuando el tiempo expire sin resolución, el indicador `slaBreached` debe marcarse como `true` y mostrarse en color rojo en la interfaz.
* **Trazabilidad:** RF-13, CU-10.

---

### HU-14: Estimación y Control de Costos Operativos por Orden
* **Enunciado:** Como **Gerente de Mantenimiento**, quiero **registrar y consultar los costos estimados de mano de obra y repuestos en cada orden de trabajo**, para **mantener control presupuestal sobre las intervenciones en las instalaciones**.
* **Prioridad:** Media.
* **Estimación:** 3 Puntos de Historia.
* **Criterios de Aceptación:**
  1. Toda orden debe permitir el registro de un valor numérico positivo para `estimatedCost`.
  2. La interfaz debe formatear los costos en moneda estándar corporativa.
  3. El costo acumulado debe reflejarse en los reportes ejecutivos.
* **Trazabilidad:** RF-14, CU-02, CU-12.

---

### HU-15: Exportación de Reportes de Cumplimiento y Gestión
* **Enunciado:** Como **Auditor / Gerente de Operaciones**, quiero **exportar la relación de órdenes de trabajo, tiempos de resolución y costos a formatos estándar (PDF/Excel/JSON)**, para **presentar informes ejecutivos y respaldar auditorías de calidad**.
* **Prioridad:** Baja.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. El sistema debe permitir descargar los datos tabulares filtrados.
  2. El archivo generado debe conservar las columnas: ID, Título, Edificio, Activo, Prioridad, Estado, Técnico, Costo y Fecha.
* **Trazabilidad:** RF-15, CU-12.

---

### HU-16: Navegación Responsiva en Dispositivos Móviles
* **Enunciado:** Como **Técnico en Campo**, quiero **utilizar la interfaz del sistema desde mi teléfono celular o tableta mediante un menú lateral colapsable**, para **consultar y reportar incidentes mientras me desplazo físicamente por el edificio**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. En pantallas con ancho menor a 768 píxeles, la barra de navegación lateral fija debe ocultarse y ser reemplazada por un botón de menú hamburguesa.
  2. El panel desplegable (*drawer*) debe permitir la navegación táctil fluida y cerrarse al seleccionar una vista o tocar el fondo oscuro.
  3. La tarjeta de detalle de orden debe adaptarse en ancho completo sin desbordamientos horizontales.
* **Trazabilidad:** RF-16, RNF-06.

---

### HU-17: Cierre Seguro de Sesión
* **Enunciado:** Como **Usuario Autenticado**, quiero **cerrar mi sesión de forma explícita desde cualquier pantalla**, para **evitar que terceros utilicen la estación compartida de operaciones con mi identidad**.
* **Prioridad:** Media.
* **Estimación:** 2 Puntos de Historia.
* **Criterios de Aceptación:**
  1. Debe existir un botón accesible de salida en la esquina de navegación.
  2. Al pulsar el botón, la sesión local debe destruirse y el usuario ser redirigido a la pantalla de ingreso.
* **Trazabilidad:** RF-17, CU-01.

---

### HU-18: Verificación Automática de Salud del Backend (Health Check)
* **Enunciado:** Como **Ingeniero de Infraestructura y DevOps**, quiero **contar con un endpoint HTTP que reporte el estado de operatividad del backend Java**, para **integrar el monitoreo con herramientas automatizadas de orquestación**.
* **Prioridad:** Alta.
* **Estimación:** 2 Puntos de Historia.
* **Criterios de Aceptación:**
  1. La ruta `GET /api/health` debe retornar código de estado `200 OK` y cabecera `Content-Type: application/json`.
  2. El cuerpo de respuesta debe incluir `{ "status": "UP", "service": "MantiFix-Backend-Java", "version": "1.0.0" }`.
* **Trazabilidad:** RF-18, RNF-04.

---

### HU-19: Prevención de Conflictos de Disponibilidad de Activos
* **Enunciado:** Como **Supervisor de Operaciones**, quiero **recibir una alerta si intento abrir una orden correctiva sobre un activo que ya cuenta con órdenes abiertas de alta prioridad**, para **evitar duplicación de solicitudes sobre el mismo equipo**.
* **Prioridad:** Media.
* **Estimación:** 3 Puntos de Historia.
* **Criterios de Aceptación:**
  1. Al seleccionar un activo en el modal de creación, el sistema debe informar la cantidad de órdenes activas asociadas.
  2. Se debe permitir al usuario decidir si continuar con la apertura o vincularse a la orden existente.
* **Trazabilidad:** RF-19, CU-02.

---

### HU-20: Trazabilidad Inmutable de Auditoría Operacional
* **Enunciado:** Como **Oficial de Cumplimiento / Seguridad Operacional**, quiero **que cada acción realizada sobre una orden quede registrada con actor, rol y marca de tiempo**, para **garantizar la rendición de cuentas ante fallas críticas en infraestructura**.
* **Prioridad:** Alta.
* **Estimación:** 5 Puntos de Historia.
* **Criterios de Aceptación:**
  1. Los registros de la lista `timeline` no pueden ser modificados ni eliminados por ningún usuario de la interfaz.
  2. El endpoint de adición de notas solo admite operaciones de agregación (*append-only*).
* **Trazabilidad:** RF-20, CU-05, RNF-08.

---

## 2. CASOS DE USO

A continuación se detallan los 12 Casos de Uso estructurados del sistema MantiFix Enterprise, cubriendo la interacción funcional completa entre actores y componentes de software.

```
+-----------------------------------------------------------------------------------+
|                            MANTIFIX ENTERPRISE CMMS                               |
|                                                                                   |
|   +--------------------------+             +----------------------------------+   |
|   |          ACTORES         |             |          CASOS DE USO            |   |
|   +--------------------------+             +----------------------------------+   |
|   |                          |             |                                  |   |
|   |  [Supervisor Operaciones]|---(Gestion)----> [CU-02: Registrar Orden]      |   |
|   |                          |---(Asigna)-----> [CU-03: Asignar Técnico]      |   |
|   |                          |---(Revisa)-----> [CU-10: Monitorear Dashboard] |   |
|   |                          |---(Masivo)-----> [CU-11: Acción Masiva Órdenes]|   |
|   |                          |                                                |   |
|   |  [Técnico de Campo]      |---(Atiende)----> [CU-04: Actualizar Estado OT] |   |
|   |                          |---(Bitácora)---> [CU-05: Registrar Nota Timeline|   |
|   |                          |---(Disponib)---> [CU-08: Gestión Turno Técnico]|   |
|   |                          |                                                |   |
|   |  [Sistema Telemetría BMS]|---(Dispara)----> [CU-02: Registrar Orden P1]   |   |
|   |                          |                                                |   |
|   |  [Motor IA Gemini]       |<--(Infiere)----  [CU-09: Diagnóstico con IA]   |   |
|   |                          |                                                |   |
|   |  [Auditor / Gerente]     |---(Audita)-----> [CU-12: Exportar Reportes]    |   |
|   |                          |---(Autentica)--> [CU-01: Iniciar/Cerrar Sesión]|   |
|   +--------------------------+             +----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

### CU-01: Autenticación de Usuario en Plataforma
* **Actores:** Supervisor de Operaciones, Técnico de Campo, Administrador (Principal); Sistema de Autenticación (Secundario).
* **Precondiciones:** El usuario debe disponer de una cuenta activa registrada en el sistema.
* **Flujo Principal:**
  1. El actor accede a la URL base del aplicativo (`http://localhost:3000`).
  2. El sistema presenta el formulario de ingreso solicitando correo corporativo y contraseña.
  3. El actor ingresa sus credenciales y presiona *"Iniciar Sesión"*.
  4. El sistema valida la integridad de los campos y comprueba las credenciales contra el almacén de datos.
  5. El sistema confirma la validez de la cuenta, inicializa el token de sesión y redirige al panel de control (*Dashboard*).
* **Flujos Alternativos:**
  * **4a. Credenciales inválidas:** El sistema deniega el acceso, muestra un mensaje de advertencia y mantiene al usuario en el formulario.
  * **4b. Cuenta inactiva o suspendida:** El sistema informa que la cuenta está bloqueada y orienta a contactar a la Coordinación de Operaciones.
* **Postcondiciones:**
  * **Éxito:** Sesión iniciada con permisos cargados en memoria.
  * **Fallo:** Acceso denegado; ningún dato operacional es expuesto.
* **Trazabilidad:** HU-01, HU-17, RF-01, RF-17.

---

### CU-02: Apertura y Registro de Orden de Trabajo
* **Actores:** Supervisor de Operaciones (Principal), Sistema de Telemetría IoT / BMS (Secundario automático).
* **Precondiciones:** El usuario debe contar con permisos de supervisor o la llamada debe provenir del webhook autorizado del BMS.
* **Flujo Principal:**
  1. El actor pulsa el botón *"Crear Solicitud"* desde la barra superior o desde la ficha de un activo.
  2. El sistema despliega el modal interactivo de creación con la lista de activos e infraestructura precargada.
  3. El actor diligencia el título, descripción de la anomalía, selecciona el activo involucrado y determina el nivel de prioridad (`P1`, `P2`, `P3`, `P4`).
  4. Opcionalmente, el actor selecciona un técnico para asignación inmediata.
  5. El actor confirma el envío pulsando *"Generar Orden de Trabajo"*.
  6. El sistema genera un nuevo código `MNT-XXXX`, deduce el estado inicial (`Urgente`, `En Proceso` o `Pendiente`), calcula la ventana SLA y crea el primer evento en la línea de tiempo.
  7. El sistema almacena la orden y actualiza la lista en pantalla en la primera posición.
* **Flujos Alternativos:**
  * **3a. Generación automática por telemetría BMS:** El sensor detecta temperatura sobre 92°C; el sistema BMS dispara un `POST /api/orders` con prioridad `P1`. El sistema asigna automáticamente el estado `Urgente` y ventana SLA de `01h 00m`.
  * **5a. Omisión de campos mandatorios:** El sistema marca los campos vacíos en rojo y bloquea el envío hasta completar la información.
* **Postcondiciones:**
  * **Éxito:** Orden persistida en el sistema, visible en el Dashboard e incluida en el contador de órdenes abiertas.
* **Trazabilidad:** HU-03, HU-12, HU-19, RF-03, RF-12.

---

### CU-03: Asignación de Técnico Especializado
* **Actores:** Supervisor de Operaciones (Principal); Técnico Asignado (Secundario).
* **Precondiciones:** La orden de trabajo debe existir y no estar en estado `Resuelta`.
* **Flujo Principal:**
  1. El supervisor localiza la orden en la tabla y pulsa sobre ella para abrir el panel lateral de detalle (*TicketDrawer*).
  2. El sistema presenta el selector de técnicos mostrando especialidad y turno de cada candidato.
  3. El supervisor selecciona al técnico idóneo para la categoría del problema (ej. Carlos Mendoza para `HVAC`).
  4. El sistema envía la petición `PUT /api/orders/{id}/assign` con el nombre del técnico.
  5. El backend actualiza el campo `assignedTo`. Si la orden estaba `Pendiente`, transiciona a `En Proceso`.
  6. Se añade un evento en el *Timeline*: *"Asignado a [Nombre del Técnico]"*.
  7. El sistema actualiza el estado en pantalla y refresca la carga del técnico.
* **Flujos Alternativos:**
  * **3a. Desasignación de técnico:** El supervisor selecciona *"Sin Asignar"*. El sistema remueve el responsable y añade evento de desasignación.
* **Postcondiciones:**
  * **Éxito:** Orden vinculada formalmente al técnico con trazabilidad inmutable.
* **Trazabilidad:** HU-04, RF-04.

---

### CU-04: Actualización de Estado y Resolución de Orden
* **Actores:** Técnico Asignado, Supervisor de Operaciones (Principales).
* **Precondiciones:** La orden debe estar seleccionada en el panel lateral de detalle.
* **Flujo Principal:**
  1. El actor modifica el desplegable de estado eligiendo un nuevo valor (`En Proceso`, `Urgente`, `Resuelta`).
  2. El sistema envía la petición `PUT /api/orders/{id}/status`.
  3. El backend actualiza el registro. Si el nuevo estado es `Resuelta`, fija `slaRemaining = 'Completada'`.
  4. El backend genera el evento de línea de tiempo correspondiente con el tono visual adecuado (`success` para Resuelta, `critical` para Urgente).
  5. La interfaz gráfica actualiza las insignias (*badges*) y resta la orden del contador de abiertas si fue resuelta.
* **Flujos Alternativos:**
  * **2a. Error de conexión:** El sistema emite una alerta flotante y retiene el estado previo.
* **Postcondiciones:**
  * **Éxito:** Ciclo de vida de la orden actualizado y métricas globales recalculadas.
* **Trazabilidad:** HU-05, RF-05.

---

### CU-05: Registro de Nota Técnica en Bitácora Operativa
* **Actores:** Técnico de Campo, Supervisor de Operaciones (Principales).
* **Precondiciones:** La orden debe existir en la base de datos.
* **Flujo Principal:**
  1. El actor visualiza el panel de detalle de la orden en la sección *"Bitácora y Línea de Tiempo"*.
  2. El actor redacta en el campo de texto el reporte técnico (diagnóstico en sitio, piezas sustituidas o pruebas de calibración).
  3. El actor presiona el botón de envío (*icono enviar*).
  4. El sistema remite `POST /api/orders/{id}/notes` con el contenido del texto.
  5. El backend añade el evento cronológico con actor, hora actual, acción *"Actualización de bitácora"* y tono neutral.
  6. La interfaz limpia el campo de texto y renderiza el nuevo bloque en la línea de tiempo.
* **Flujos Alternativos:**
  * **2a. Intento de envío con texto vacío:** El sistema desactiva el botón de envío o cancela la acción.
* **Postcondiciones:**
  * **Éxito:** Nueva entrada de auditoría anexada permanentemente al historial del ticket.
* **Trazabilidad:** HU-06, HU-20, RF-06, RF-20.

---

### CU-06: Consulta y Filtrado Multicriterio de Órdenes
* **Actores:** Supervisor de Operaciones, Técnico de Campo (Principales).
* **Precondiciones:** Estar ubicado en la vista de *"Solicitudes y Órdenes de Trabajo"* o *"Dashboard"*.
* **Flujo Principal:**
  1. El actor introduce un término de búsqueda en la barra superior o selecciona un filtro de estado o edificio.
  2. El sistema evalúa en memoria o mediante parámetros URL (`/api/orders?status=...&building=...&q=...`) las condiciones.
  3. La grilla se actualiza en tiempo real mostrando únicamente los registros que satisfacen todas las condiciones simultáneamente.
  4. El actor puede hacer clic en cualquier resultado para abrir su detalle.
* **Flujos Alternativos:**
  * **3a. Cero resultados coincidentes:** Se presenta una ilustración y mensaje indicando que no hay órdenes que correspondan al filtro aplicado.
* **Postcondiciones:**
  * **Éxito:** Vista acotada a las órdenes de interés del operador.
* **Trazabilidad:** HU-07, RF-07.

---

### CU-07: Monitoreo de Inventario y Salud de Activos
* **Actores:** Supervisor de Mantenimiento, Coordinador de Planta (Principales).
* **Precondiciones:** Acceso habilitado a la vista de *"Activos e Infraestructura"*.
* **Flujo Principal:**
  1. El actor pulsa en la barra lateral el acceso *"Activos e Infraestructura"*.
  2. El sistema consulta `GET /api/assets` y renderiza el tablero de tarjetas de activos.
  3. Para cada equipo, el sistema muestra: Serial, Nombre, Categoría, Edificio, Zona, Estado de Salud (`Óptimo`, `Atención`, `Crítico`), Disponibilidad (*Uptime*), Fechas de mantenimiento y Tickets Abiertos.
  4. El actor identifica equipos en estado `Atención` o `Crítico`.
  5. El actor pulsa *"Reportar Incidente"* sobre una tarjeta específica; el sistema abre el modal de orden con el serial del activo preseleccionado.
* **Flujos Alternativos:**
  * **3a. Falla de conexión con el backend:** Se muestra indicador de reintento.
* **Postcondiciones:**
  * **Éxito:** Visibilidad completa sobre la salud electromecánica y civil del complejo.
* **Trazabilidad:** HU-09, RF-09.

---

### CU-08: Gestión de Turnos y Capacidad de Técnicos
* **Actores:** Supervisor de Operaciones (Principal).
* **Precondiciones:** Acceso a la vista de *"Técnicos y Turnos"*.
* **Flujo Principal:**
  1. El supervisor selecciona la opción *"Técnicos y Turnos"* en el menú lateral.
  2. El sistema ejecuta `GET /api/technicians` y despliega la grilla de personal técnico clasificado por turno.
  3. El supervisor revisa las órdenes activas asignadas a cada técnico y sus tiempos de respuesta históricos (MTTR).
  4. El supervisor utiliza esta información para balancear turnos o transferir incidentes críticos a técnicos disponibles.
* **Postcondiciones:**
  * **Éxito:** Distribución equilibrada de recursos técnicos en planta.
* **Trazabilidad:** HU-10, RF-10.

---

### CU-09: Generación de Diagnóstico Asistido por Inteligencia Artificial
* **Actores:** Supervisor de Operaciones, Técnico de Campo (Principales); Motor de IA Gemini / Motor Heurístico MantiFix (Secundario).
* **Precondiciones:** La orden de trabajo debe contar con título, descripción y categoría definidos.
* **Flujo Principal:**
  1. El actor abre el detalle de un incidente y solicita asistencia técnica automática.
  2. El sistema envía una petición `POST /api/ai/diagnose` con `assetName`, `category`, `title` y `description`.
  3. El servicio backend verifica la disponibilidad de `GEMINI_API_KEY`:
     * Si la clave es válida, formula un prompt de ingeniería de mantenimiento y consulta la API de Google Gemini.
     * Si no hay clave o la llamada externa supera el tiempo de espera de 5 segundos, invoca el motor heurístico interno.
  4. El sistema retorna la causa más probable y la acción correctiva inmediata.
  5. La interfaz renderiza el recuadro de recomendación técnica destacando la acción sugerida.
* **Flujos Alternativos:**
  * **3a. Fallo de red hacia el proveedor cloud:** El motor heurístico local genera el diagnóstico sin interrumpir la operación del usuario.
* **Postcondiciones:**
  * **Éxito:** Recomendación de diagnóstico incorporada a la vista operativa.
* **Trazabilidad:** HU-11, RF-11.

---

### CU-10: Monitoreo Global de Rendimiento e Indicadores SLA
* **Actores:** Gerente de Operaciones, Supervisor (Principales).
* **Precondiciones:** El sistema debe tener órdenes registradas con diversas prioridades y estados.
* **Flujo Principal:**
  1. El usuario navega al *"Panel Operativo"* (*Dashboard*).
  2. El sistema computa en tiempo real:
     * Cantidad de solicitudes abiertas (`status != 'Resuelta'`).
     * Cantidad de incidentes urgentes (`status == 'Urgente'`).
     * Cantidad de activos en estado crítico (`health == 'Crítico'`).
     * Porcentaje de cumplimiento de acuerdos de servicio SLA.
  3. El sistema actualiza los contadores de la barra lateral (*sidebar badges*).
  4. Los indicadores se refrescan automáticamente ante cada mutación en la base de datos.
* **Postcondiciones:**
  * **Éxito:** Métricas consolidadas expuestas para toma de decisiones ejecutivas.
* **Trazabilidad:** HU-02, HU-13, RF-02, RF-13.

---

### CU-11: Actualización Masiva de Órdenes de Trabajo
* **Actores:** Supervisor de Operaciones (Principal).
* **Precondiciones:** Debe haber al menos dos órdenes visibles en la tabla de trabajo.
* **Flujo Principal:**
  1. El supervisor marca las casillas de verificación de dos o más órdenes en la tabla.
  2. La interfaz revela la barra flotante de acciones masivas con el contador de elementos seleccionados.
  3. El supervisor selecciona el estado destino (ej. *"En Proceso"* o *"Resuelta"*).
  4. El sistema ejecuta secuencialmente la actualización de cada orden vía API, actualizando estados y líneas de tiempo.
  5. La barra masiva se oculta, las casillas se desmarcan y la tabla refleja el nuevo estado unificado.
* **Postcondiciones:**
  * **Éxito:** Órdenes seleccionadas actualizadas de forma consistente en lote.
* **Trazabilidad:** HU-08, RF-08.

---

### CU-12: Exportación de Reportes Operativos de Mantenimiento
* **Actores:** Auditor Técnico, Coordinador de Mantenimiento (Principales).
* **Precondiciones:** Haber aplicado los filtros deseados en la tabla de órdenes.
* **Flujo Principal:**
  1. El usuario pulsa la opción de exportación en la barra de herramientas del módulo.
  2. El sistema recopila el conjunto de datos activo y estructura el informe en formato estándar (CSV/JSON/PDF).
  3. El navegador descarga el archivo con nomenclatura corporativa (ej. `MantiFix_Reporte_20261113.json`).
* **Postcondiciones:**
  * **Éxito:** Documento generado y guardado en el almacenamiento local del usuario.
* **Trazabilidad:** HU-14, HU-15, RF-14, RF-15.

---

## 3. REQUERIMIENTOS FUNCIONALES

A continuación se especifican los 20 Requerimientos Funcionales del sistema MantiFix Enterprise. Cada requerimiento es unívoco, verificable y trazable a sus respectivas historias de usuario y casos de uso.

---

| Identificador: RF-01 | Nombre: Autenticación y Autorización Basada en Roles (RBAC) |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-01, HU-17 \| **CU Relacionado:** CU-01 |
| **Entradas:** Correo electrónico corporativo, contraseña en texto plano, rol solicitado. |
| **Salidas:** Token de sesión, perfil de usuario con permisos asociados, confirmación en pantalla. |
| **Descripción:** El sistema debe verificar la identidad del usuario mediante credenciales corporativas y asignar el contexto de seguridad correspondiente (Supervisor de Operaciones, Técnico de Campo, Auditor). Solo los usuarios con credenciales válidas y cuenta activa podrán acceder a las operaciones del sistema. |
| **Manejo de Situaciones Anormales:**<br>• Si la contraseña no coincide, retornar HTTP 401 con mensaje genérico: *"Credenciales no válidas"*.<br>• Si la cuenta está deshabilitada, denegar acceso con mensaje informativo.<br>• Si se detectan más de 5 intentos fallidos consecutivos, bloquear temporalmente el acceso por 15 minutos. |
| **Criterio de Verificación:** Ejecutar prueba de acceso automatizada verificando código HTTP 200 ante credenciales correctas y HTTP 401 con bloqueo ante credenciales erróneas. |

---

| Identificador: RF-02 | Nombre: Panel Central de Métricas e Indicadores KPI |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-02, HU-13 \| **CU Relacionado:** CU-10 |
| **Entradas:** Solicitud de carga del módulo principal (*Dashboard*). |
| **Salidas:** Agregaciones numéricas: solicitudes abiertas, cumplimiento SLA (%), MTTR promedio y activos críticos. |
| **Descripción:** El sistema debe calcular en tiempo real y presentar en el panel central los cuatro indicadores fundamentales de desempeño operativo, reflejando comparativos respecto al periodo anterior y alimentando los contadores del menú lateral. |
| **Manejo de Situaciones Anormales:**<br>• Si la base de datos no contiene órdenes, desplegar contadores en cero sin arrojar excepciones de división por cero.<br>• Si falla la consulta de agregados, presentar estado de carga fallida con botón de reintento. |
| **Criterio de Verificación:** Crear 3 órdenes de prueba con diferentes estados y verificar que el contador de órdenes abiertas aumente en exactamente 3 unidades en la interfaz. |

---

| Identificador: RF-03 | Nombre: Alta y Registro de Órdenes de Trabajo |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-03, HU-12, HU-19 \| **CU Relacionado:** CU-02 |
| **Entradas:** Título, descripción, edificio, zona, nombre de activo, serial de activo, categoría, prioridad (`P1`-`P4`), técnico inicial (opcional), costo estimado. |
| **Salidas:** Objeto orden de trabajo con identificador `MNT-XXXX` generado, fecha/hora de creación, estado deducido y primer evento de línea de tiempo. |
| **Descripción:** El sistema debe permitir registrar una nueva orden de trabajo, validando que los datos mínimos estén presentes, generando un ID secuencial inmutable y asignando automáticamente el estado y la ventana de SLA según la prioridad seleccionada. |
| **Manejo de Situaciones Anormales:**<br>• Si falta el título o el activo, rechazar la operación con HTTP 400 y mensaje de error específico.<br>• Si la prioridad es `P1` y no se especifica estado, forzar el estado a `Urgente` y SLA a 1 hora. |
| **Criterio de Verificación:** Enviar payload JSON a `POST /api/orders` y validar retorno HTTP 201 conteniendo ID con prefijo `MNT-` y timeline con 1 elemento. |

---

| Identificador: RF-04 | Nombre: Asignación de Técnico Responsable |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-04 \| **CU Relacionado:** CU-03 |
| **Entradas:** Identificador de la orden (`id`), nombre o ID del técnico seleccionado. |
| **Salidas:** Orden actualizada con nuevo `assignedTo`, estado actualizado a `En Proceso` (si estaba `Pendiente`) y nuevo evento en bitácora. |
| **Descripción:** El sistema debe permitir asignar un técnico calificado a una orden abierta. Si la orden se encontraba en estado `Pendiente`, el sistema debe transicionarla de forma automática a `En Proceso` y asentar el evento en la auditoría. |
| **Manejo de Situaciones Anormales:**<br>• Si la orden especificada no existe, retornar HTTP 404.<br>• Si el técnico enviado es nulo o vacío, desasignar al técnico y registrar el evento como *"Técnico desasignado"*. |
| **Criterio de Verificación:** Invocar `PUT /api/orders/{id}/assign` con un técnico válido y corroborar que el campo `assignedTo` cambie y se agregue un evento al timeline. |

---

| Identificador: RF-05 | Nombre: Control del Ciclo de Vida y Transiciones de Estado |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-05 \| **CU Relacionado:** CU-04 |
| **Entradas:** Identificador de la orden (`id`), nuevo estado (`Pendiente`, `En Proceso`, `Urgente`, `Resuelta`). |
| **Salidas:** Orden actualizada, marca de resolución (si aplica) y evento registrado en la línea de tiempo. |
| **Descripción:** El sistema debe controlar las transiciones de estado de una orden. Si el estado final es `Resuelta`, el sistema debe fijar el atributo `slaRemaining` con el valor `'Completada'` y congelar el tiempo para cálculo de métricas. |
| **Manejo de Situaciones Anormales:**<br>• Si el estado enviado no corresponde a uno de los cuatro estados válidos, rechazar con HTTP 400.<br>• Si la orden ya estaba resuelta y se reabre, registrar un evento de reapertura con tono de advertencia. |
| **Criterio de Verificación:** Enviar `PUT /api/orders/{id}/status` con `{"status": "Resuelta"}` y verificar respuesta HTTP 200 con `slaRemaining: "Completada"`. |

---

| Identificador: RF-06 | Nombre: Registro Inmutable de Notas en Línea de Tiempo |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-06, HU-20 \| **CU Relacionado:** CU-05 |
| **Entradas:** Identificador de la orden (`id`), texto de la nota de bitácora. |
| **Salidas:** Objeto de evento cronológico (`TimelineEvent`) anexado a la lista `timeline` de la orden. |
| **Descripción:** El sistema debe permitir anexar entradas de bitácora técnica a cualquier orden de trabajo. Cada entrada debe capturar marca de tiempo del sistema, rol del autor y detalle inmutable. |
| **Manejo de Situaciones Anormales:**<br>• Si el cuerpo de la nota está en blanco o solo contiene espacios en blanco, rechazar con HTTP 400: *"La nota no puede estar vacía"*.<br>• Si el identificador de orden no existe, responder con HTTP 404. |
| **Criterio de Verificación:** Enviar `POST /api/orders/{id}/notes` con texto de prueba y comprobar que el tamaño de la lista `timeline` se incremente en 1. |

---

| Identificador: RF-07 | Nombre: Motor de Búsqueda y Filtrado de Órdenes |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-07 \| **CU Relacionado:** CU-06 |
| **Entradas:** Parámetros opcionales: `status` (estado), `building` (edificio), `q` (consulta textual). |
| **Salidas:** Lista JSON filtrada conteniendo exclusivamente las órdenes que coinciden con los criterios. |
| **Descripción:** El sistema debe implementar filtrado multicriterio combinando estado, edificio y búsqueda de texto por coincidencia parcial en ID, título, activo, serial y técnico. |
| **Manejo de Situaciones Anormales:**<br>• Si ningún registro coincide, retornar una lista vacía `[]` con código HTTP 200 (sin fallos de servidor). |
| **Criterio de Verificación:** Invocar `GET /api/orders?status=Urgente` y validar que el 100% de los elementos retornados tengan el atributo `status == "Urgente"`. |

---

| Identificador: RF-08 | Nombre: Actualización Masiva de Estado en Lote |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-08 \| **CU Relacionado:** CU-11 |
| **Entradas:** Lista de identificadores de órdenes (`ids[]`), nuevo estado común. |
| **Salidas:** Colección de órdenes actualizadas y confirmación de la cantidad de registros modificados. |
| **Descripción:** El sistema debe permitir modificar el estado de múltiples órdenes de forma simultánea desde la tabla operativa, actualizando de forma individual el historial de cada ticket seleccionado. |
| **Manejo de Situaciones Anormales:**<br>• Si la lista de IDs está vacía, no realizar ninguna acción y retornar confirmación con 0 modificados. |
| **Criterio de Verificación:** Seleccionar 2 órdenes mediante la interfaz, cambiar estado a `En Proceso` y verificar que ambas reflejen el nuevo estado en la base de datos. |

---

| Identificador: RF-09 | Nombre: Catálogo y Consulta de Activos de Infraestructura |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-09 \| **CU Relacionado:** CU-07 |
| **Entradas:** Solicitud HTTP `GET /api/assets`. |
| **Salidas:** Colección JSON de activos con atributos: serial, nombre, categoría, edificio, zona, salud operativa, uptime y fecha del próximo mantenimiento. |
| **Descripción:** El sistema debe exponer el catálogo integral de equipos críticos de la infraestructura corporativa con sus indicadores de salud operativa (`Óptimo`, `Atención`, `Crítico`) y contador de tickets activos. |
| **Manejo de Situaciones Anormales:**<br>• Si no se pueden recuperar los activos, presentar mensaje de error y opción de recarga en el cliente. |
| **Criterio de Verificación:** Ejecutar `GET /api/assets` y verificar que el arreglo incluya al menos los activos base del edificio con campos obligatorios validados. |

---

| Identificador: RF-10 | Nombre: Directorio de Técnicos y Control de Carga de Trabajo |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-10 \| **CU Relacionado:** CU-08 |
| **Entradas:** Solicitud HTTP `GET /api/technicians`. |
| **Salidas:** Colección JSON con ID, nombre, especialidad técnica, turno laboral, estado operativo, órdenes activas y MTTR histórico. |
| **Descripción:** El sistema debe suministrar la información del equipo técnico de planta, permitiendo conocer quiénes están en turno y su nivel actual de ocupación para la asignación de incidentes. |
| **Manejo de Situaciones Anormales:**<br>• Si un técnico finaliza turno, su estado debe reflejarse como `Fuera de Turno` automáticamente o por configuración. |
| **Criterio de Verificación:** Validar que la respuesta de `GET /api/technicians` contenga técnicos con especialidades válidas y formatos de turno definidos. |

---

| Identificador: RF-11 | Nombre: Diagnóstico Predictivo Asistido por Inteligencia Artificial |
| :--- | :--- |
| **Tipo:** Opcional / Contingente | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-11 \| **CU Relacionado:** CU-09 |
| **Entradas:** Nombre del equipo, categoría técnica, título de la falla, descripción de síntomas. |
| **Salidas:** Documento JSON con causa probable (`probableCause`), acción correctiva recomendada (`recommendedAction`) e identificación del motor (`aiEngine`). |
| **Descripción:** El sistema debe analizar la descripción y síntomas de una orden para generar una hipótesis diagnóstica. Si la integración con Google Gemini API está configurada, se utilizará el modelo de lenguaje; en su defecto o ante fallos, se ejecutará el motor heurístico determinista interno. |
| **Manejo de Situaciones Anormales:**<br>• Si el servicio de IA externa reporta timeout (> 5 segundos), conmutar de inmediato al motor heurístico sin arrojar error 500 al cliente. |
| **Criterio de Verificación:** Enviar `POST /api/ai/diagnose` con síntomas de Chiller HVAC y comprobar que la respuesta contenga `probableCause` y `recommendedAction` coherentes con HVAC. |

---

| Identificador: RF-12 | Nombre: Ingesta Automatizada de Incidentes por Telemetría IoT |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-12 \| **CU Relacionado:** CU-02 |
| **Entradas:** Payload JSON de sensor o BMS indicando alerta de umbral superado. |
| **Salidas:** Orden de trabajo registrada con prioridad `P1` y estado `Urgente`. |
| **Descripción:** El sistema debe procesar alertas originadas por controladores automáticos de edificio (ej. BMS Honeywell, Johnson Controls o sensores IoT de vibración y temperatura), categorizando el incidente como crítico de forma automática. |
| **Manejo de Situaciones Anormales:**<br>• Si la telemetría no identifica el serial de activo, registrar el ticket bajo la categoría general asignando revisión urgente al supervisor. |
| **Criterio de Verificación:** Enviar orden con solicitante *"Sistema BMS"* y verificar que el ticket se cree con prioridad P1 y SLA de 1 hora. |

---

| Identificador: RF-13 | Nombre: Monitoreo y Marcación de Incumplimiento de SLA |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-13 \| **CU Relacionado:** CU-10 |
| **Entradas:** Hora actual del sistema, fecha de creación de la orden, prioridad asociada. |
| **Salidas:** Bandera `slaBreached: boolean` y cadena descriptiva de tiempo restante. |
| **Descripción:** El sistema debe calcular el tiempo de resolución restante de cada orden abierta. Al sobrepasar el umbral sin pasar a `Resuelta`, el sistema debe marcar `slaBreached = true` para alimentar las alertas operativas. |
| **Manejo de Situaciones Anormales:**<br>• Las órdenes resueltas no deben sufrir incremento en tiempo ni alterar negativamente el SLA una vez cerradas. |
| **Criterio de Verificación:** Verificar que una orden vencida posea `slaBreached: true` y se contabilice en la métrica de penalización del Dashboard. |

---

| Identificador: RF-14 | Nombre: Estimación y Seguimiento de Costos de Reparación |
| :--- | :--- |
| **Tipo:** Opcional | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-14 \| **CU Relacionado:** CU-02, CU-12 |
| **Entradas:** Monto estimado ingresado (`estimatedCost`) en la orden de trabajo. |
| **Salidas:** Valor económico persistido y totalizado en resúmenes operacionales. |
| **Descripción:** El sistema debe admitir el registro de los costos proyectados para repuestos, servicios tercerizados o insumos requeridos en la solución de la orden. |
| **Manejo de Situaciones Anormales:**<br>• Si se ingresan valores negativos o alfanuméricos, asignar 0.0 y notificar formato erróneo. |
| **Criterio de Verificación:** Crear una orden con costo `2450.0` y comprobar que se almacene con precisión de punto flotante en la base de datos. |

---

| Identificador: RF-15 | Nombre: Generación y Descarga de Informes Operativos |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-15 \| **CU Relacionado:** CU-12 |
| **Entradas:** Selección de filtros activos y solicitud de exportación. |
| **Salidas:** Archivo estructurado descargable con el detalle de las órdenes seleccionadas. |
| **Descripción:** El sistema debe permitir generar reportes descargables con los datos tabulares de las órdenes de trabajo para soporte administrativo y auditorías de servicio. |
| **Manejo de Situaciones Anormales:**<br>• Si no hay datos disponibles, generar archivo con cabeceras estándar sin registros. |
| **Criterio de Verificación:** Ejecutar acción de exportación y comprobar que el archivo descargado contenga las columnas obligatorias del sistema. |

---

| Identificador: RF-16 | Nombre: Soporte de Navegación Móvil y Diseño Adaptativo |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-16 \| **CU Relacionado:** Todos |
| **Entradas:** Resolución de pantalla detectada por el navegador web o dispositivo móvil. |
| **Salidas:** Disposición de componentes optimizada (Sidebar fija en desktop, Drawer modal en mobile). |
| **Descripción:** El sistema debe adaptar dinámicamente la disposición de controles, formularios y tablas para pantallas pequeñas (smartphones y tabletas), garantizando operatividad a técnicos en campo. |
| **Manejo de Situaciones Anormales:**<br>• En resoluciones ultra-estrechas (< 360px), permitir scroll horizontal en tablas densas para preservar la legibilidad. |
| **Criterio de Verificación:** Redimensionar la ventana a 375px de ancho y verificar la aparición del botón hamburguesa y el correcto despliegue del menú. |

---

| Identificador: RF-17 | Nombre: Cierre Seguro de Sesión (Logout) |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-17 \| **CU Relacionado:** CU-01 |
| **Entradas:** Solicitud explícita de cierre de sesión por parte del usuario. |
| **Salidas:** Invalidación de credenciales en cliente, redirección a la pantalla de login. |
| **Descripción:** El sistema debe destruir el contexto de autenticación local al presionar el botón de desconexión, impidiendo el uso de botones de retroceso para acceder a datos protegidos. |
| **Manejo de Situaciones Anormales:**<br>• Si la conexión se pierde al momento de cerrar sesión, limpiar el almacenamiento local del cliente de manera forzada. |
| **Criterio de Verificación:** Pulsar desconexión y verificar que intentar acceder a rutas protegidas redirija forzosamente al login. |

---

| Identificador: RF-18 | Nombre: Monitoreo de Disponibilidad de Servicio (Health Check) |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-18 \| **CU Relacionado:** N/A (Mantenimiento del Sistema) |
| **Entradas:** Petición HTTP `GET /api/health`. |
| **Salidas:** Código HTTP 200 con payload JSON `{"status":"UP","service":"MantiFix-Backend-Java","version":"1.0.0"}`. |
| **Descripción:** El backend en Java debe ofrecer un endpoint liviano y sin autenticación para verificación de operatividad y estado de salud por parte de balanceadores o scripts de monitoreo. |
| **Manejo de Situaciones Anormales:**<br>• Si los servicios internos o el almacén colapsan, retornar código HTTP 503 Service Unavailable. |
| **Criterio de Verificación:** Ejecutar `curl -s http://localhost:8080/api/health` y validar código 200 y status "UP". |

---

| Identificador: RF-19 | Nombre: Detección de Tickets Duplicados sobre Activos |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** No |
| **Prioridad:** Media | **HU Relacionada:** HU-19 \| **CU Relacionado:** CU-02 |
| **Entradas:** Selección de activo en el formulario de creación de orden. |
| **Salidas:** Indicador de órdenes activas existentes sobre dicho equipo. |
| **Descripción:** Al crear una orden, el sistema debe informar si el equipo ya tiene tickets abiertos pendientes o en proceso, ofreciendo al usuario la alternativa de adjuntar notas al ticket preexistente. |
| **Manejo de Situaciones Anormales:**<br>• No bloquear la creación si el incidente reportado corresponde a un subsistema diferente del mismo activo. |
| **Criterio de Verificación:** Seleccionar un activo con tickets abiertos y comprobar que el modal muestre la advertencia informativa. |

---

| Identificador: RF-20 | Nombre: Trazabilidad Estricta de Auditoría Operativa |
| :--- | :--- |
| **Tipo:** Necesario | **¿Crítico?:** Sí |
| **Prioridad:** Alta | **HU Relacionada:** HU-20 \| **CU Relacionado:** CU-05 |
| **Entradas:** Cualquier evento de creación, cambio de estado, asignación o adición de nota sobre una orden. |
| **Salidas:** Objeto `TimelineEvent` inmutable persistido cronológicamente. |
| **Descripción:** Toda acción que altere los atributos de una orden debe registrar automáticamente un evento en la colección `timeline`. Dicho registro no podrá ser alterado ni eliminado por ningún rol a través de la interfaz ni de la API REST. |
| **Manejo de Situaciones Anormales:**<br>• Todo intento de enviar peticiones `DELETE` o `PUT` sobre el timeline individual debe ser rechazado con HTTP 405 Method Not Allowed. |
| **Criterio de Verificación:** Consultar la orden tras múltiples operaciones y verificar que el timeline conserve todos los eventos en orden cronológico ascendente. |

---

## 4. REQUERIMIENTOS NO FUNCIONALES

A continuación se especifican los 12 Requerimientos No Funcionales del sistema MantiFix Enterprise, clasificados por atributo de calidad con sus métricas cuantitativas, efectos colaterales y criterios formales de verificación.

---

### RNF-01: Rendimiento y Tiempo de Respuesta de la API
* **Categoría:** Rendimiento (Performance).
* **Grado de Necesidad:** Alta.
* **Descripción:** Tiempos de respuesta reducidos para todas las transacciones de consulta y modificación.
* **Detalle Técnico:** Las solicitudes HTTP a la API REST (`GET /api/orders`, `GET /api/assets`, `GET /api/technicians`) deben ejecutarse y responder en un tiempo inferior a **200 milisegundos** bajo condiciones normales de red local. Las peticiones de creación y actualización no deben superar los **400 milisegundos**.
* **Efectos Colaterales:** Exige estructuras de datos concurrentes en memoria (`ConcurrentHashMap`, `CopyOnWriteArrayList`) e hilos virtuales de Java 21 para evitar bloqueos por I/O.
* **Criterio de Verificación:** Medir mediante pruebas de carga automatizadas el percentil 95 (P95) de 500 solicitudes continuas, constatando que el tiempo medio sea menor a 200 ms.
* **Trazabilidad:** RF-02, RF-07, RF-18.

---

### RNF-02: Usabilidad y Densidad Operativa de Interfaz
* **Categoría:** Usabilidad (Usability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Interfaz densa, clara y accesible para supervisores de mantenimiento corporativo.
* **Detalle Técnico:** La plataforma debe adoptar tokens de diseño consistentes (paleta slate/azul corporativo, tipografía *Inter* para interfaz y *JetBrains Mono* para seriales e identificadores). El panel lateral de detalle debe abrirse en menos de **100 milisegundos** al hacer clic sobre una fila de la tabla.
* **Efectos Colaterales:** Demanda optimización de componentes en React mediante memorización (`useMemo`, `useCallback`) y Tailwind CSS precompilado.
* **Criterio de Verificación:** Realizar pruebas de interacción con usuarios operadores validando que el tiempo para registrar y asignar una orden sea inferior a 45 segundos sin asistencia técnica previa.
* **Trazabilidad:** HU-02, HU-03, HU-04.

---

### RNF-03: Seguridad y Control de Acceso
* **Categoría:** Seguridad (Security).
* **Grado de Necesidad:** Alta (Crítica).
* **Descripción:** Protección de datos operacionales y blindaje frente a accesos indebidos.
* **Detalle Técnico:** La API REST debe implementar cabeceras CORS restrictivas (`Access-Control-Allow-Origin: *` o dominio específico del frontend corporativo) y validar exhaustivamente todas las entradas JSON para mitigar inyecciones de código y desbordamientos. Las contraseñas en reposo deben almacenarse mediante algoritmos de hashing seguro (BCrypt/Argon2).
* **Efectos Colaterales:** Incrementa ligeramente el tiempo de cómputo en el proceso de autenticación.
* **Criterio de Verificación:** Ejecutar escaneo estático de seguridad y análisis dinámico de peticiones comprobando que entradas maliciosas con comillas, caracteres de escape o payloads SQL sean neutralizadas y respondan HTTP 400.
* **Trazabilidad:** RF-01, RF-17, RF-20.

---

### RNF-04: Disponibilidad del Servicio
* **Categoría:** Disponibilidad (Availability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Acceso continuo a la consola y API durante las 24 horas del día.
* **Detalle Técnico:** El sistema debe garantizar una disponibilidad mínima mensual del **99.5%** de tiempo operativo en línea (*uptime*), asegurando recepción ininterrumpida de alertas BMS y órdenes durante turnos rotativos.
* **Efectos Colaterales:** Requiere configuración de reinicio automático del proceso ante fallos imprevistos (*systemd* o servicio de Windows) y monitoreo vía `/api/health`.
* **Criterio de Verificación:** Inspección periódica de logs del servidor demostrando menos de 3.6 horas de indisponibilidad no programada al mes.
* **Trazabilidad:** RF-12, RF-18.

---

### RNF-05: Escalabilidad y Concurrencia
* **Categoría:** Escalabilidad (Scalability).
* **Grado de Necesidad:** Media.
* **Descripción:** Capacidad de soportar crecimiento en volumen de órdenes sin degradación.
* **Detalle Técnico:** El servidor Java debe atender al menos **50 peticiones concurrentes simultáneas** sin generar rechazos de conexión, utilizando el ejecutor multi-hilo virtual (`Executors.newVirtualThreadPerTaskExecutor()`) de Java 21.
* **Efectos Colaterales:** Uso moderado de memoria RAM (alrededor de 150 MB a 300 MB para la máquina virtual Java).
* **Criterio de Verificación:** Someter el endpoint `GET /api/orders` a 50 conexiones paralelas con Apache Bench (`ab -n 500 -c 50`) constatando cero fallos de conexión (0% failed requests).
* **Trazabilidad:** RF-02, RF-03, RF-07.

---

### RNF-06: Compatibilidad Multiplataforma y Soporte de Navegadores
* **Categoría:** Compatibilidad (Compatibility).
* **Grado de Necesidad:** Alta.
* **Descripción:** Visualización consistente en todos los navegadores modernos y dispositivos.
* **Detalle Técnico:** La plataforma debe operar de forma óptima en Google Chrome (v110+), Mozilla Firefox (v110+), Microsoft Edge (v110+) y Brave, tanto en plataformas Windows 10/11, macOS, Linux, como en dispositivos móviles Android e iOS.
* **Efectos Colaterales:** Exige pruebas de regresión visual cruzada entre navegadores.
* **Criterio de Verificación:** Cargar la plataforma en Chrome y Edge en resoluciones de 1920x1080 (escritorio) y 375x667 (móvil) verificando equivalencia visual idéntica y ausencia de errores de consola.
* **Trazabilidad:** RF-16, HU-16.

---

### RNF-07: Fiabilidad y Tolerancia a Fallos de Servicios Externos
* **Categoría:** Fiabilidad (Reliability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Operatividad continua incluso si los servicios de inteligencia artificial externa están caídos.
* **Detalle Técnico:** Si la API externa de Google Gemini no responde, arroja error de cuota o carece de conexión a Internet, el backend debe conmutar automáticamente a su motor heurístico en un lapso menor a **100 milisegundos**, asegurando que el cliente reciba siempre un diagnóstico operativo válido.
* **Efectos Colaterales:** Requiere mantener reglas heurísticas actualizadas según las categorías electromecánicas corporativas.
* **Criterio de Verificación:** Desconectar la conexión a Internet o revocar la clave de API y ejecutar `POST /api/ai/diagnose`, corroborando que el sistema responda con código HTTP 200 y `aiEngine: "MantiFix-Heuristic-Engine"`.
* **Trazabilidad:** RF-11, CU-09.

---

### RNF-08: Mantenibilidad y Modularidad del Código
* **Categoría:** Mantenibilidad (Maintainability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Arquitectura desacoplada y facilidad de extensión funcional.
* **Detalle Técnico:** El backend debe conservar una estricta separación de capas (Modelos, Almacén de Datos, Lógica de Servicio, Controladores HTTP y Utilidades), con cero dependencias externas no estándar para compilar. El frontend debe desacoplar componentes visuales, tipos TypeScript y lógica de estado.
* **Efectos Colaterales:** Demanda estándares estrictos de codificación y documentación técnica interna.
* **Criterio de Verificación:** Compilación exitosa del backend con el compilador estándar `javac` sin requerir bibliotecas `.jar` adicionales de terceros en el classpath de ejecución.
* **Trazabilidad:** RF-03, RF-06, RF-20.

---

### RNF-09: Integridad de Datos y Concurrencia
* **Categoría:** Integridad (Data Integrity).
* **Grado de Necesidad:** Alta.
* **Descripción:** Consistencia matemática y cronológica de los datos operacionales.
* **Detalle Técnico:** Las operaciones de creación de órdenes y asignación de identificadores deben ser atómicas (`AtomicInteger` o secuencias sincronizadas), garantizando que jamás se generen dos órdenes con el mismo número de ticket `MNT-XXXX` ante peticiones concurrentes.
* **Efectos Colaterales:** Breve bloqueo sincronizado a nivel de bloque crítico en memoria al generar el consecutivo.
* **Criterio de Verificación:** Ejecutar 20 peticiones concurrentes de creación y verificar que se generen exactamente 20 números consecutivos únicos sin colisiones.
* **Trazabilidad:** RF-03, RF-20.

---

### RNF-10: Portabilidad y Despliegue Simplificado
* **Categoría:** Portabilidad (Portability).
* **Grado de Necesidad:** Media.
* **Descripción:** Facilidad de empaquetado y arranque en múltiples entornos de servidor.
* **Detalle Técnico:** El backend completo debe compilarse en un único archivo ejecutable `.jar` autosuficiente (`mantifix-backend-1.0.0.jar`), operable con cualquier distribución estándar de Java 21 (Corretto, Temurin, OpenJDK) sin necesidad de contenedores de servlets externos como Tomcat o WildFly.
* **Efectos Colaterales:** La aplicación gestiona internamente su servidor HTTP mediante `com.sun.net.httpserver`.
* **Criterio de Verificación:** Ejecutar `java -jar backend/target/mantifix-backend-1.0.0.jar` en una máquina limpia con Java 21 y verificar arranque en menos de 2 segundos.
* **Trazabilidad:** RF-18, RNF-01.

---

### RNF-11: Trazabilidad e Inmutabilidad de Auditoría
* **Categoría:** Auditoría (Auditability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Registro histórico inalterable de cada evento técnico.
* **Detalle Técnico:** Toda modificación sobre el ciclo de vida de una orden debe registrar un elemento `TimelineEvent` con identificador único, actor, rol, acción, detalle y timestamp con resolución de minutos. El sistema no debe ofrecer ninguna interfaz ni ruta de API para editar o borrar eventos del timeline.
* **Efectos Colaterales:** Incremento lineal predecible del tamaño del objeto orden en memoria.
* **Criterio de Verificación:** Inspección del código fuente y pruebas dinámicas comprobando que no existen métodos de eliminación ni mutación en la colección `timeline`.
* **Trazabilidad:** RF-06, RF-20.

---

### RNF-12: Cobertura y Verificabilidad de Pruebas Automatizadas
* **Categoría:** Verificabilidad (Testability).
* **Grado de Necesidad:** Alta.
* **Descripción:** Existencia de una suite de pruebas unitarias y de integración ejecutable.
* **Detalle Técnico:** El proyecto debe contar con una suite de pruebas automatizadas independiente (`MantiFixTestSuite`) que valide de forma automática el 100% de los endpoints y reglas de negocio, con un umbral de aprobación requerido del **100%** para promocionar cambios a ramas de producción.
* **Efectos Colaterales:** Requiere mantener y actualizar las pruebas a medida que surjan nuevos requerimientos.
* **Criterio de Verificación:** Ejecución de `java -cp target/classes;target/test-classes com.mantifix.MantiFixTestSuite` certificando la ejecución y aprobación exitosa de las 44 pruebas automatizadas con 0 fallos.
* **Trazabilidad:** Todas las HUs y RFs.

---

## 5. SUPUESTOS DEL SISTEMA

Los siguientes supuestos fueron formalizados durante el análisis de ingeniería de requisitos y fundamentan las decisiones arquitectónicas y funcionales del presente documento:

1. **Almacenamiento y Persistencia Inicial:** En su fase operativa actual, el backend opera con un almacén de datos transaccional concurrente en memoria (`DataStore`) precargado con datos base realistas del complejo corporativo. Se asume que en una fase productiva posterior este almacén se conectará a un motor de base de datos relacional (PostgreSQL o MySQL) mediante JDBC.
2. **Conectividad de Red Local:** Se asume que los dispositivos de los técnicos en campo y las estaciones de supervisión comparten conectividad a la red corporativa (vía Wi-Fi interno o VPN) para alcanzar los puertos de la API (`8080`) y frontend (`3000`).
3. **Integración con Sistema BMS:** Se asume que los sistemas de automatización edilicia (BMS) cuentan con capacidad de emitir llamadas HTTP POST en formato JSON ante eventos de alarma en sensores de telemetría.
4. **Identidad de los Técnicos:** Se asume que los técnicos registrados pertenecen a la nómina de planta y sus turnos laborales son asignados semanalmente por la Coordinación de Operaciones.
5. **Acceso a Google Gemini API:** Se asume que el uso de la API de Gemini es complementario; la falta de cuota o conectividad no debe interrumpir la gestión correctiva del personal de mantenimiento.

---

## 6. INFORMACIÓN RECOMENDADA PARA AFINAR EL SRS EN ETAPAS POSTERIORES

Para profundizar y ajustar este documento en futuras iteraciones de ingeniería, se aconseja recopilar los siguientes datos operativos:

1. **Catálogo Real de Activos y Equipos:** Lista oficial de maquinaria electromecánica del complejo corporativo con seriales de placa, marcas, modelos, criticidad oficial y manuales de fabricante.
2. **Estructura Organizacional y Turnos Oficiales:** Matriz formal de turnos de la empresa (horarios de relevo, personal por guardia y protocolos de disponibilidad en días festivos).
3. **Acuerdos de Nivel de Servicio (SLA) Contractuales:** Tiempos contractuales exactos de respuesta y solución acordados con las áreas usuarias o clientes de los edificios para cada nivel de prioridad (`P1`, `P2`, `P3`, `P4`).
4. **Protocolos de Integración BMS:** Documentación técnica de las interfaces de exportación de alarmas del sistema BMS instalado en las instalaciones (BACnet, Modbus, Webhooks REST).
5. **Matriz de Repuestos y Costos Estándar:** Lista de precios base de insumos comunes de mantenimiento (filtros, refrigerantes, contactores, luminarias) para automatizar el cálculo de costos reales frente a estimados.

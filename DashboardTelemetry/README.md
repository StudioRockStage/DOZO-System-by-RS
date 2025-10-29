# 🧩 DOZO Telemetry Dashboard v2.2.0

Dashboard de telemetría visual con monitoreo en tiempo real para el sistema DOZO.

**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions

---

## 🚀 Inicio Rápido

### 1. Iniciar el servidor
```bash
cd ~/Documents/DOZO\ System\ by\ RS/DashboardTelemetry
node telemetry-server.js
```

### 2. Acceder al dashboard
Abre tu navegador en: **http://localhost:9095**

---

## 📦 Archivos del Proyecto

| Archivo | Descripción |
|---------|-------------|
| `telemetry-server.js` | Servidor Express con API REST |
| `index.html` | Interfaz web del dashboard |
| `dashboard.css` | Estilos visuales modernos |
| `dashboard.js` | Lógica del frontend con actualización automática |
| `README.md` | Este archivo |

---

## 🎯 Características

### 📊 Monitoreo en Tiempo Real
- **CPU:** Núcleos, modelo, arquitectura
- **Memoria:** Total, usada, libre, porcentaje de uso
- **Uptime:** Tiempo de actividad del sistema
- **Plataforma:** Sistema operativo, hostname

### 🔍 Integridad del Sistema
- Validación SHA-256 de archivos críticos
- Estado de directorios principales
- Conteo de archivos y tamaños
- Detección de archivos faltantes

### 🧠 Sincronización Multi-IA
- **Cursor AI** - Code generation, validation, telemetry
- **Claude AI** - Deep analysis, optimization, documentation
- **ChatGPT** - Conversational AI, troubleshooting, training

Estados visuales:
- 🟢 ACTIVE - Operando activamente
- 🟡 STANDBY - En espera
- 🔴 OFFLINE - No disponible

### 🏥 Análisis de Salud
- **Estado General:** HEALTHY / NEEDS_ATTENTION
- **Advertencias:** Lista de problemas detectados
- **Recomendaciones:** Sugerencias de mejora automáticas

### 📋 Auditoría de Fases
- Visualización de todas las fases (1-12+)
- Estado de cada fase: ✅ Verificada / ❌ Faltante
- Conteo de reportes generados por fase

### 🔄 Actualización Automática
El dashboard se actualiza automáticamente cada **5 segundos**.

Botón manual de actualización disponible en la sección de integridad.

---

## 🔌 API Endpoints

### GET /api/metrics
Retorna métricas actuales del sistema.

**Respuesta:**
```json
{
  "telemetry": {
    "phase": 11,
    "version": "2.1.0",
    "integrity": {...},
    "metrics": {...},
    "healthAnalysis": {...}
  },
  "system": {
    "cpu": 8,
    "cpuModel": "Apple M1",
    "memTotal": "16.00",
    "memFree": "8.50",
    "uptime": "12.45"
  },
  "reportFile": "reporte-fase-11-2025-10-27T03-00-00-000Z.json"
}
```

### GET /api/reports
Lista todos los reportes disponibles.

**Respuesta:**
```json
{
  "reports": [
    {
      "name": "reporte-fase-11-2025-10-27T03-00-00-000Z.json",
      "path": "/path/to/report",
      "size": 2048,
      "modified": "2025-10-27T03:00:00.000Z"
    }
  ]
}
```

### GET /api/health
Estado de salud del servidor.

**Respuesta:**
```json
{
  "status": "OPERATIONAL",
  "timestamp": "2025-10-27T03:00:00.000Z",
  "server": {
    "port": 9095,
    "uptime": "3600.00s",
    "memory": "45.23 MB"
  },
  "system": {
    "platform": "darwin",
    "release": "24.6.0",
    "arch": "arm64",
    "nodeVersion": "v18.0.0"
  }
}
```

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario:** #E6C185 (Dorado DOZO)
- **Fondo:** #0f0f14 → #1a1a24 (Gradiente oscuro)
- **Tarjetas:** #1b1c20 → #22232a
- **Texto:** #E6C185 (encabezados), #A5A1A2 (secundario), #fff (métricas)

### Tipografía
- **Principal:** Inter, -apple-system, BlinkMacSystemFont, Segoe UI
- **Código:** Monaco, Courier New, monospace

### Efectos Visuales
- Gradientes suaves en tarjetas y fondos
- Sombras con glow dorado
- Transiciones fluidas (0.3s ease)
- Animaciones hover en tarjetas
- Barra de progreso animada para memoria
- Badges de estado con colores semánticos

### Responsive Design
- **Desktop:** Grid de 3 columnas para métricas
- **Tablet:** Grid de 2 columnas
- **Móvil:** Grid de 1 columna
- Breakpoint principal: 768px

---

## ⚙️ Configuración

### Puerto del Servidor
Por defecto: **9095**

Para cambiar el puerto, edita `telemetry-server.js`:
```javascript
const PORT = 9095; // Cambiar a tu puerto preferido
```

### Intervalo de Actualización
Por defecto: **5000ms (5 segundos)**

Para cambiar el intervalo, edita `dashboard.js`:
```javascript
updateInterval = setInterval(updateDashboard, 5000); // Cambiar valor
```

---

## 📋 Requisitos

- **Node.js** v16.0.0 o superior (con soporte ESM)
- **Express** v5.1.0 o superior (ya incluido en el proyecto)
- **Puerto 9095** disponible (o puerto alternativo configurado)
- **Reportes de telemetría** generados por FASE 11

---

## 🔧 Solución de Problemas

### El dashboard muestra "Sin reportes de telemetría"
**Solución:** Ejecuta primero `node dozo-phase-11.js` para generar reportes.

### Error de conexión al servidor
**Solución:** 
1. Verifica que `telemetry-server.js` esté ejecutándose
2. Comprueba que el puerto 9095 no esté ocupado
3. Revisa los logs de consola del servidor

### Las métricas no se actualizan
**Solución:**
1. Verifica la conexión de red (localhost)
2. Abre la consola del navegador para ver errores
3. Presiona el botón "🔄 Actualizar" manualmente

### Puerto 9095 ocupado
**Solución:** Cambia el puerto en `telemetry-server.js` y actualiza el README.

---

## 🚀 Próximas Mejoras (Roadmap)

- [ ] Gráficos históricos de métricas
- [ ] Exportación de reportes en PDF
- [ ] Notificaciones push de alertas
- [ ] Autenticación de usuarios
- [ ] Modo oscuro/claro
- [ ] Widgets personalizables
- [ ] Integración con Slack/Discord
- [ ] Métricas de red en tiempo real

---

## 📄 Licencia

MIT License - RockStage Solutions © 2025

---

## 👨‍💻 Autor

**David Alejandro Pérez Rea**  
RockStage Solutions  
DOZO System v2.2.0

---

## 🔗 Enlaces Relacionados

- [FASE-12-QUICK-START.md](../FASE-12-QUICK-START.md)
- [FASE-12-COMPLETE.md](../FASE-12-COMPLETE.md)
- [Reportes de Telemetría](../DozoCoreReport/TelemetrySystem/)

---

**Última actualización:** 27 de octubre de 2025



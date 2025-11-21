# 🚀 FASE 16.3 – Quick Start Guide

## ⚡ Inicio Rápido – Live WebSocket Event Bridge

**Tiempo estimado:** 3 minutos

---

## 🎯 Objetivo

Iniciar el sistema de transmisión en tiempo real que comunica eventos de telemetría hacia el Dashboard para actualizaciones instantáneas.

---

## 📋 Pre-requisitos

✅ FASE 16.2 completada (AppSync Telemetry Bridge)  
✅ Archivos de telemetría generados  
✅ Node.js instalado  
✅ Dependencia `ws` instalada

---

## 🚀 Ejecución en 2 Pasos

### Paso 1: Iniciar Event Bridge

```bash
npm run phase-16.3
```

**Salida esperada:**

```
═══════════════════════════════════════════════════════
🧩 FASE 16.3 – Live WebSocket Event Bridge v2.6.3
═══════════════════════════════════════════════════════
📡 WebSocket Bridge activo en ws://localhost:9091
🧠 Monitoreando AppSyncTelemetry.json y AppSyncCommits.json...
📨 Enviando eventos a Dashboard en tiempo real
✅ Live WebSocket Event Bridge iniciado correctamente
```

### Paso 2: Abrir Dashboard

1. Abrir navegador web
2. Navegar a: `file:///ruta/Dashboard/public/index.html`
3. Ver actualizaciones en tiempo real

---

## 📊 Verificación del Sistema

### Verificar WebSocket activo

```bash
lsof -i :9091
```

**Salida esperada:**

```
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345 user   20u  IPv4 0x1234567890      0t0  TCP *:9091 (LISTEN)
```

### Verificar archivos monitoreados

```bash
ls -la "Workflow DB/AppSync"*
```

**Salida esperada:**

```
-rw-r--r-- 1 user staff 288 Oct 29 11:09 Workflow DB/AppSyncTelemetry.json
-rw-r--r-- 1 user staff 3.8K Oct 29 11:09 Workflow DB/AppSyncCommits.json
```

---

## 🎮 Dashboard Interactivo

### Estado de Conexión

- **Verde:** Conectado al Event Bridge
- **Rojo:** Desconectado (reconexión automática)
- **Amarillo:** Conectando...

### Cards de Información

- **Telemetría del Sistema:** Datos en tiempo real
- **Actividad Reciente:** Últimos commits
- **Configuración:** Parámetros del sistema

### Indicadores Visuales

- Contador de eventos recibidos
- Timestamp de última actualización
- Estado del monitoreo

---

## 🔧 Comandos Útiles

### Iniciar Event Bridge

```bash
npm run phase-16.3
```

### Verificar puerto

```bash
lsof -i :9091
```

### Probar conexión WebSocket

```bash
wscat -c ws://localhost:9091
```

### Ver reporte generado

```bash
cat "Workflow DB/Phase16.3-Report.md"
```

### Generar telemetría (si no existe)

```bash
npm run phase-16.2
```

---

## 🐛 Resolución de Problemas

### Error: Puerto 9091 en uso

```bash
# Encontrar proceso usando el puerto
lsof -ti:9091

# Terminar proceso
lsof -ti:9091 | xargs kill -9

# Reiniciar Event Bridge
npm run phase-16.3
```

### Error: WebSocket no conecta

1. Verificar que el Event Bridge esté ejecutándose
2. Comprobar que el puerto 9091 esté libre
3. Verificar URL: `ws://localhost:9091`
4. Revisar firewall local

### Error: Archivos no encontrados

```bash
# Generar archivos de telemetría
npm run phase-16.2

# Verificar que se crearon
ls -la "Workflow DB/AppSync"*
```

### Error: Dashboard no actualiza

1. Verificar conexión WebSocket (indicador verde)
2. Abrir consola del navegador (F12)
3. Verificar errores en la consola
4. Recargar la página

---

## 📖 Documentación Completa

Para información detallada, consulta:

- `FASE-16.3-COMPLETE.md` - Documentación técnica completa
- `🎉-FASE-16.3-INSTALLATION-COMPLETE.md` - Estado de instalación

---

## 🎯 Flujo de Trabajo Recomendado

1. **Ejecutar Fase 16.2** para generar telemetría
2. **Iniciar Fase 16.3** para activar Event Bridge
3. **Abrir Dashboard** en navegador
4. **Verificar conexión** (indicador verde)
5. **Monitorear actualizaciones** en tiempo real

---

## 💡 Tips Avanzados

### Monitoreo Continuo

- Ejecutar `npm run phase-16.2` periódicamente
- El Event Bridge detectará cambios automáticamente
- El Dashboard se actualizará sin intervención

### Múltiples Clientes

- Varios navegadores pueden conectarse simultáneamente
- Todos reciben los mismos eventos en tiempo real
- Cada cliente mantiene su propio estado

### Debugging

- Usar `wscat -c ws://localhost:9091` para debug
- Revisar consola del navegador para errores
- Verificar logs del Event Bridge

---

## 🎊 Siguiente Paso

Una vez verificado el sistema, continúa con:

**FASE 16.4** - Dashboard Avanzado con Métricas en Tiempo Real

---

**Última actualización:** 29 de octubre de 2025  
**Versión:** v2.6.3  
**Autor:** RockStage Solutions

---

_¡El sistema de eventos en tiempo real está listo para usar!_ 🚀

# 🚀 FASE 16.5.1 – Quick Start Guide

## ⚡ Inicio Rápido – HealthSync Verify Test

**Tiempo estimado:** 1 minuto

---

## 🎯 Objetivo

Ejecutar un test automatizado que verifica que el sistema HealthSync detecta caídas y ejecuta recuperación automática correctamente.

---

## 📋 Pre-requisitos

✅ HealthSync Monitor instalado (Fase 16.5)  
✅ WebSocket Bridge disponible (Fase 16.3)  
✅ Node.js instalado  
✅ Dependencias instaladas

---

## 🚀 Ejecución en 2 Pasos

### Paso 1: Iniciar HealthSync Monitor

```bash
npm run healthsync
```

**Dejar corriendo en esta terminal**

### Paso 2: Ejecutar Test (nueva terminal)

```bash
npm run healthsync-test
```

---

## 📊 Salida Esperada

```
═══════════════════════════════════════════════════════
🧩 FASE 16.5.1 – HealthSync Verify Test v2.6.5-T
═══════════════════════════════════════════════════════
🧪 Iniciando prueba de verificación de HealthSync...
⚠️ Simulando caída del WebSocket Bridge...
🛑 WebSocket detenido intencionalmente para prueba.
⏱️ Esperando 20 segundos para detección automática...
📊 Analizando logs de HealthSync...
✅ TEST PASADO: HealthSync funcionó correctamente
═══════════════════════════════════════════════════════
✅ HealthSync detectó la caída y ejecutó recuperación automática.
═══════════════════════════════════════════════════════
```

---

## 📂 Archivos Generados

### Ver reporte del test

```bash
cat "Workflow DB/Phase16.5.1-Report.md"
```

### Ver logs actualizados

```bash
cat "Workflow DB/HealthSyncLogs.json" | jq .
```

---

## 🔧 Comandos Útiles

### Ejecutar test

```bash
npm run phase-16.5.1
# o
npm run healthsync-test
```

### Iniciar HealthSync

```bash
npm run healthsync
```

### Ver procesos activos

```bash
ps aux | grep -E "(health-monitor|phase-16)"
```

### Limpiar logs (opcional)

```bash
echo "[]" > "Workflow DB/HealthSyncLogs.json"
```

---

## ✅ Criterios de Éxito

El test pasa cuando:

- ✅ Simulación de caída exitosa
- ✅ Detección en ≤ 20 segundos
- ✅ Recuperación iniciada automáticamente
- ✅ Eventos registrados en logs
- ✅ Reporte generado con "✅ PASADO"

---

## 🐛 Resolución Rápida

### Error: Test falla (❌ FALLIDO)

**Solución 1: HealthSync no está corriendo**

```bash
# Terminal 1: Iniciar HealthSync
npm run healthsync

# Terminal 2: Esperar 30s y ejecutar test
sleep 30 && npm run healthsync-test
```

**Solución 2: WebSocket no está activo**

```bash
# Terminal 1: Iniciar WebSocket
npm run phase-16.3

# Terminal 2: Iniciar HealthSync
npm run healthsync

# Terminal 3: Ejecutar test
npm run healthsync-test
```

---

## 📖 Documentación Completa

Para información detallada, consulta:

- `FASE-16.5.1-COMPLETE.md` - Documentación técnica completa
- `🎉-FASE-16.5.1-INSTALLATION-COMPLETE.md` - Estado de instalación

---

## 💡 Tips

- El test puede ejecutarse múltiples veces
- Cada ejecución genera un nuevo reporte
- Los logs se acumulan (no se sobrescriben)
- El HealthSync debe estar corriendo antes del test
- Espera 30 segundos entre tests repetidos

---

## 🎊 Siguiente Paso

Con el sistema verificado, el ecosistema DOZO está:

- ✅ Completamente operativo
- ✅ Auto-recuperable
- ✅ Monitoreado en tiempo real
- ✅ Verificado y probado

**Sistema listo para producción** 🚀

---

**Última actualización:** 29 de octubre de 2025  
**Versión:** v2.6.5-T  
**Autor:** RockStage Solutions

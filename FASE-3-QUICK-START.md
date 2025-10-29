# 🚀 FASE 3 - Quick Start Guide

## ⚡ Comandos Rápidos

### Inicializar Sistema Completo
```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Diagnostics/dozo-fase3-init.js
```

### Solo Diagnostic Core
```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Diagnostics/Engines/dozo-diagnostic-core.js
```

### Solo AutoRepair Engine
```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Diagnostics/Engines/dozo-autorepair.js
```

---

## 📁 Estructura FASE 3

```
Diagnostics/
├── Engines/
│   ├── dozo-diagnostic-core.js      # Diagnostic scanner
│   └── dozo-autorepair.js           # Auto-repair engine
├── Reports/
│   └── repair-report-*.json         # Repair reports
├── Logs/
│   └── diagnostic.log               # Diagnostic logs
├── Backups/                          # Automatic backups
├── dozo-diagnostic-config.json      # Configuration
└── dozo-fase3-init.js               # Initializer
```

---

## 📊 Ver Reportes

### Diagnostic Log (últimas 50 líneas)
```bash
tail -50 ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Logs/diagnostic.log
```

### Repair Report
```bash
cat ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Reports/repair-report-*.json
```

### FASE 3 Report
```bash
cat ~/Documents/Dozo\ System\ by\ RS/DozoCoreResport/DiagnosticsSystem/reporte-fase-3-*.json
```

### Buscar Errores
```bash
grep "❌" ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Logs/diagnostic.log
```

### Contar Archivos OK
```bash
grep "✅ OK" ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Logs/diagnostic.log | wc -l
```

---

## ✅ Output Esperado

```
🚀 Iniciando FASE 3 – Diagnostic Framework & AutoRepair Engine v2.0.0

1️⃣ Cargando configuración de diagnóstico...
   ✅ AutoRepair: Habilitado
   ✅ Deep Scan: Habilitado
   ✅ Backup Before Fix: Habilitado

2️⃣ Ejecutando escaneo de diagnóstico...
   ✅ Escaneo completado

3️⃣ Ejecutando motor de reparación automática...
   ✅ Reparaciones completadas

4️⃣ Generando reporte de FASE 3...
   ✅ Reporte generado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FASE 3 COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Configuración

### Editar Config
```bash
nano ~/Documents/Dozo\ System\ by\ RS/Diagnostics/dozo-diagnostic-config.json
```

### Opciones Disponibles
```json
{
  "autoRepair": true,
  "deepScan": true,
  "backupBeforeFix": true,
  "logRetention": "30d",
  "notification": {
    "enabled": true,
    "onError": true,
    "onRepair": true
  }
}
```

---

## 🎯 Status

| Componente | Estado |
|------------|--------|
| Diagnostic Core | ✅ OK |
| AutoRepair Engine | ✅ OK |
| Logging System | ✅ OK |
| Backup System | ✅ OK |

---

## 🩺 Verificación de Salud

### Estado General
```bash
# Ver últimas líneas del diagnóstico
tail -20 ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Logs/diagnostic.log
```

### Archivos Problemáticos
```bash
# Buscar archivos con error
grep "❌" ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Logs/diagnostic.log
```

### Reparaciones Realizadas
```bash
# Ver qué se reparó
cat ~/Documents/Dozo\ System\ by\ RS/Diagnostics/Reports/repair-report-*.json | jq
```

---

**Documentación Completa**: `FASE-3-COMPLETE.md`




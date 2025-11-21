# 🚀 FASE 1 - Quick Start Guide

## ⚡ Comandos Rápidos

### Inicializar Sistema Completo

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Core/dozo-fase1-init.js
```

### Solo Diagnóstico

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Scripts/dozo-autodiagnostic.js
```

### Solo Reporte

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Scripts/dozo-report-phase1.js
```

---

## 📁 Estructura FASE 1

```
Core/
├── dozo-core.js         # Motor principal
├── dozo-config.json     # Configuración
└── dozo-fase1-init.js   # Inicializador

Scripts/
├── dozo-autodiagnostic.js    # Diagnóstico
└── dozo-report-phase1.js     # Reportes

Logs/
└── dozo-core.log        # Logs del sistema

Reports/
└── autodiagnostic-*.json     # Reportes diagnóstico

DozoCoreResport/CoreSystem/
├── reporte-fase-1-*.json     # Reporte JSON
└── reporte-fase-1-*.md       # Reporte MD
```

---

## 📊 Ver Reportes

### Último Reporte FASE 1

```bash
cd ~/Documents/Dozo\ System\ by\ RS
cat DozoCoreResport/CoreSystem/reporte-fase-1-*.json | tail -20
```

### Ver Logs

```bash
cat ~/Documents/Dozo\ System\ by\ RS/Logs/dozo-core.log
```

### Estado del Sistema

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node Scripts/dozo-autodiagnostic.js
```

---

## ✅ Output Esperado

```
🚀 Iniciando FASE 1 – Core Rebuild & Structure Autodeploy v2.0.0

1️⃣ Inicializando DOZO Core Engine...
   ✅ Core Engine inicializado

2️⃣ Cargando configuración del sistema...
   ✅ Configuración v2.0.0 cargada

3️⃣ Ejecutando autodiagnóstico del sistema...
   ✅ Autodiagnóstico completado

4️⃣ Generando reporte de FASE 1...
   ✅ Reporte generado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FASE 1 COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Configuración

### Editar Config

```bash
nano ~/Documents/Dozo\ System\ by\ RS/Core/dozo-config.json
```

### Opciones Disponibles

- `systemVersion`: Versión del sistema
- `autoUpdate`: Actualización automática
- `reportingEnabled`: Habilitar reportes
- `defaultProject`: Proyecto por defecto
- `aiSync`: Sincronización con IAs
- `integrations`: Integraciones activas

---

## 🎯 Status

| Componente      | Estado |
| --------------- | ------ |
| Core Engine     | ✅ OK  |
| Autodiagnóstico | ✅ OK  |
| Reportes        | ✅ OK  |
| Estructura      | ✅ OK  |

---

**Documentación Completa**: `FASE-1-COMPLETE.md`

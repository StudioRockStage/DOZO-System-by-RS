# 🚀 FASE 2 - Quick Start Guide

## ⚡ Comandos Rápidos

### Inicializar Sistema Completo

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node AI-Link/dozo-fase2-init.js
```

### Solo Intelligence Core

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node AI-Link/SyncEngine/dozo-intelligence.js
```

### Solo Report Engine

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node AI-Link/SyncEngine/dozo-report-engine.js
```

---

## 📁 Estructura FASE 2

```
AI-Link/
├── SyncEngine/
│   ├── dozo-intelligence.js     # Intelligence Core
│   └── dozo-report-engine.js    # Report compiler
├── Configs/
│   └── dozo-ai-config.json      # AI config
├── Reports/
│   ├── report-*.json            # Sync reports
│   └── summary-*.json           # Summary reports
├── Logs/
│   └── intelligence.log         # Activity logs
└── dozo-fase2-init.js           # Inicializador
```

---

## 📊 Ver Reportes

### Último Sync Report

```bash
cat ~/Documents/Dozo\ System\ by\ RS/AI-Link/Reports/report-*.json
```

### Summary Report

```bash
cat ~/Documents/Dozo\ System\ by\ RS/AI-Link/Reports/summary-*.json
```

### Intelligence Logs

```bash
cat ~/Documents/Dozo\ System\ by\ RS/AI-Link/Logs/intelligence.log
```

### FASE 2 Report

```bash
cat ~/Documents/Dozo\ System\ by\ RS/DozoCoreResport/IntelligenceSystem/reporte-fase-2-*.json
```

---

## ✅ Output Esperado

```
🚀 Iniciando FASE 2 – Intelligence Sync & Report Engine v2.0.0

1️⃣ Cargando configuración AI...
   ✅ AI Sync: Habilitado
   ℹ️  Conexiones: ChatGPT=active, Cursor=active, Claude=active

2️⃣ Inicializando Intelligence Core...
   ✅ Intelligence Core inicializado

3️⃣ Ejecutando Report Engine...
   ✅ Report Engine completado

4️⃣ Generando reporte de FASE 2...
   ✅ Reporte generado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FASE 2 COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Configuración

### Editar Config AI

```bash
nano ~/Documents/Dozo\ System\ by\ RS/AI-Link/Configs/dozo-ai-config.json
```

### Opciones Disponibles

```json
{
  "aiSyncEnabled": true,
  "reportFrequency": "onPhaseCompletion",
  "autoDiagnostics": true,
  "connections": {
    "ChatGPT": "active",
    "Cursor": "active",
    "Claude": "active"
  }
}
```

---

## 🎯 Status

| Componente        | Estado |
| ----------------- | ------ |
| Intelligence Core | ✅ OK  |
| Report Engine     | ✅ OK  |
| AI Sync           | ✅ OK  |
| Reportes          | ✅ OK  |

---

## 🤖 IAs Conectadas

- **ChatGPT**: ✅ Active
- **Cursor AI**: ✅ Active
- **Claude AI**: ✅ Active

---

**Documentación Completa**: `FASE-2-COMPLETE.md`

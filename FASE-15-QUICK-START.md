# 🚀 DOZO FASE 15 – Quick Start

**Versión:** 2.5.0  
**Objetivo:** Dashboard web de administración de releases

---

## ⚡ Ejecutar FASE 15

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-15
```

**Tiempo estimado:** < 1 minuto

---

## 📦 ¿Qué hace?

1. ✅ Escanea releases en `PublicRelease/`
2. ✅ Recopila información de fases 1-14
3. ✅ Genera archivos JSON (versions, hashes, logs, phases)
4. ✅ Crea interfaz HTML del dashboard
5. ✅ Configura servidor backend API
6. ✅ Genera reportes completos

---

## 🚀 Iniciar Dashboard

### Paso 1: Ejecutar FASE 15
```bash
npm run phase-15
```

### Paso 2: Iniciar servidor
```bash
npm run release-dashboard
```

O directamente:
```bash
node server/server.js
```

### Paso 3: Abrir en navegador
```
http://localhost:9090
```

---

## 📊 Funcionalidades del Dashboard

### 1. Gestión de Releases
- Ver todas las versiones disponibles
- Información de tamaño y fecha
- Estado de notarización
- Descargas directas

### 2. Hashes SHA-256
- Verificación de integridad
- Hash de cada release
- Algoritmo de verificación

### 3. Logs del Sistema
- Historial de eventos
- Timestamps detallados
- Detalles de cada release

### 4. Estado de Fases
- Visualización de fases 1-14
- Conteo de reportes
- Estado de completación

---

## 🔌 API REST

### Endpoints Disponibles

```
GET /api/releases  - Lista de releases
GET /api/hashes    - Hashes SHA-256
GET /api/logs      - Logs del sistema
GET /api/phases    - Estado de fases
GET /api/status    - Estado del servidor
```

### Probar API
```bash
# Ver releases
curl http://localhost:9090/api/releases | jq

# Ver status del servidor
curl http://localhost:9090/api/status

# Ver hashes
curl http://localhost:9090/api/hashes
```

---

## 📁 Estructura Creada

```
Dashboard/public/releases/
├── index.html           ← Interfaz web
├── versions.json        ← Datos de versiones
├── hashes.json          ← Hashes SHA-256
├── release-logs.json    ← Logs del sistema
└── phases.json          ← Estado de fases

server/
└── server.js            ← Backend API (puerto 9090)
```

---

## 🔄 Actualización Automática

El dashboard se actualiza automáticamente cada **30 segundos**.

Para actualizar datos:
1. Ejecutar nueva fase (ej: `npm run phase-14`)
2. Re-ejecutar: `npm run phase-15`
3. El dashboard reflejará los cambios automáticamente

---

## 🆘 Solución Rápida

### "No hay releases disponibles"
```bash
# Ejecutar primero las fases de build
npm run phase-13  # Generar DMG
npm run phase-14  # Firmar/notarizar
npm run phase-15  # Actualizar dashboard
```

### "Error al iniciar servidor"
```bash
# Verificar que el puerto 9090 esté libre
lsof -i :9090

# O usar otro puerto editando server/server.js
```

### "No se cargan los datos"
```bash
# Verificar que existan los archivos JSON
ls Dashboard/public/releases/

# Re-ejecutar fase 15
npm run phase-15
```

---

## 📚 Más Información

- **Guía completa:** `RELEASE-DASHBOARD-GUIDE.md`
- **Documentación:** `FASE-15-COMPLETE.md`

---

**RockStage Solutions** © 2025  
**¡Dashboard listo!** 🎉



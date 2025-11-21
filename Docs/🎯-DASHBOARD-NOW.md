# 🎯 DOZO Release Dashboard - START NOW!

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📊 RELEASE DASHBOARD - FASE 15                         ║
║                                                           ║
║        DOZO Public Sync & Release Dashboard v2.5.0       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚡ Dos Comandos

### 1️⃣ Configurar Dashboard

```bash
cd ~/Documents/DOZO\ System\ by\ RS && npm run phase-15
```

### 2️⃣ Iniciar Servidor

```bash
npm run release-dashboard
```

### 3️⃣ Abrir Dashboard

```
http://localhost:9090
```

---

## 📊 ¿Qué verás?

### Releases Disponibles

- Todas las versiones de DOZO Control Center
- Tamaño de cada instalador
- Estado de notarización
- Botones de descarga directa

### Hashes SHA-256

- Verificación de integridad
- Hash completo de cada release
- Información de algoritmo

### Logs del Sistema

- Historial de eventos
- Timestamps de cada acción
- Detalles de releases

### Estado de Fases

- Grid visual de fases 1-14
- Conteo de reportes por fase
- Estado de completación

---

## 🔄 Actualización

El dashboard se actualiza **automáticamente cada 30 segundos**.

Para actualizar datos manualmente:

```bash
npm run phase-15
```

---

## 📡 API REST

Usa los endpoints para integraciones:

```bash
# Ver todas las releases
curl http://localhost:9090/api/releases

# Ver hashes
curl http://localhost:9090/api/hashes

# Ver logs
curl http://localhost:9090/api/logs

# Ver fases
curl http://localhost:9090/api/phases

# Estado del servidor
curl http://localhost:9090/api/status
```

---

## 🎨 Características

- ✅ Interfaz moderna y responsive
- ✅ Paleta de colores DOZO
- ✅ Actualización automática
- ✅ Descargas directas
- ✅ API REST completa
- ✅ Logs en tiempo real

---

## 🚀 Scripts Disponibles

```bash
npm run phase-15          # Configurar dashboard
npm run release-dashboard # Iniciar servidor
```

O directo:

```bash
node dozo-phase-15.js     # Configurar
node server/server.js     # Servidor
```

---

## 🎯 ¡Listo!

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-15
npm run release-dashboard
```

Luego abre: **http://localhost:9090**

---

**RockStage Solutions** © 2025  
**¡A explorar el dashboard!** 📊

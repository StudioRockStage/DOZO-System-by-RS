# 🚀 DOZO System - Quick Start Guide

**Sistema:** DOZO by RockStage Solutions  
**Versión:** 7.9.0  
**Plugin:** Warranty System RS v7.7.7  
**Fecha:** October 2025

---

## ⚡ Deployment en UN COMANDO

```bash
npm run sync:deploy
```

Esto automáticamente:
- ✅ Detecta la versión más reciente
- ✅ Sincroniza Latest Builds
- ✅ Crea update.json
- ✅ Sube al servidor
- ✅ Genera reportes

**Tiempo total:** 2-3 minutos

---

## 📋 Comandos Principales

### Workflow Completo
```bash
# 1. Validar archivos locales
npm run validate

# 2. Sincronizar y deployar
npm run sync:deploy

# 3. Verificar propagación
npm run deploy:verify
```

### Comandos Individuales

**Validación:**
```bash
npm run validate        # Validar archivos locales
npm run ftp:test       # Probar conexión FTP
```

**Deployment:**
```bash
npm run deploy         # Deploy remoto completo
npm run deploy:dryrun  # Simulación sin FTP
npm run deploy:verify  # Verificar caché CDN
```

**Sincronización:**
```bash
npm run sync           # Sincronizar Latest Builds
npm run sync:deploy    # Sincronizar y deployar
```

**Setup:**
```bash
npm run ftp:setup      # Configurar FTP
npm run network-unlock # Configurar red
```

---

## 📦 Versión Actual

**Warranty System v7.7.7**
- Tamaño: 267 KB (optimizado)
- Archivos: 87
- Nueva funcionalidad: `force-update-check.php`
- Optimización: 89% vs v7.7.6

---

## 🌐 URLs

**Update Channel:**
```
https://updates.vapedot.mx/warranty-system/update.json
```

**Package (v7.7.7):**
```
https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.7.zip
```

**Force Trigger:**
```
https://yoursite.com/wp-content/plugins/warranty-system/force-update-check.php
```

---

## 🔧 Configuración FTP

**Archivo:** `Scripts/ftp-config.json`

```json
{
  "host": "82.29.86.182",
  "user": "u461169968",
  "password": "your_password",
  "port": 21,
  "secure": false,
  "remotePath": "/public_html/updates/warranty-system/"
}
```

**Status:** ✅ Configurado y validado

---

## 📊 Estructura del Sistema

```
DOZO System by RS/
├── Empaquetado/Ready/           # Archivos listos para deploy
├── Latest Builds/               # Sincronizado con Ready
├── Plugins/Warranty System/     # Código fuente del plugin
├── Scripts/                     # Configuración FTP
├── to chat gpt/Global/          # Reportes y logs
└── [Scripts de deployment]      # 18+ scripts automatizados
```

---

## 🎯 Workflow de Desarrollo

### Actualizar a Nueva Versión

1. **Edita tu plugin** en `Plugins/Warranty System/`

2. **Actualiza la versión:**
   ```javascript
   // En rockstage-warranty-system.php
   Version: 7.7.8
   ```

3. **Crea el paquete:**
   ```bash
   # Ejecutar script de empaquetado (crear uno nuevo o usar existente)
   node dozo-package-v7.7.8.js
   ```

4. **Deploy automático:**
   ```bash
   npm run sync:deploy
   ```

5. **Verificar:**
   ```bash
   npm run deploy:verify
   ```

**¡Listo!** Tu nueva versión está en el servidor.

---

## 📖 Documentación

### Empieza Aquí
- `README-DEPLOYMENT.md` - Instrucciones finales
- `QUICK-DEPLOY-REFERENCE.md` - Referencia rápida
- Este archivo

### Guías Completas
- `DOZO-PHASE11-DEPLOYMENT-GUIDE.md` - Guía exhaustiva
- `DOZO-PHASE11-FINAL-STATUS.md` - Estado del sistema
- `DEPLOYMENT-SUCCESS-SUMMARY.md` - Resumen de deployment

### Troubleshooting
- `DOZO-FTP-TROUBLESHOOTING.md` - Problemas FTP
- `NEXT-STEPS-SIMPLE.md` - Guía simple de 4 pasos

---

## 🔍 Verificación y Diagnóstico

### Ver archivos en servidor
```bash
node dozo-ftp-list-files.js
```

### Verificar deployment
```bash
npm run deploy:verify
```

### Probar conexión FTP
```bash
npm run ftp:test
```

### Ver reportes
```bash
# Todos los reportes están en:
ls "to chat gpt/Global/"
```

---

## ✨ Características Principales

### ✅ Automatización Completa
- Deployment con un solo comando
- Sincronización automática
- Generación de reportes

### ✅ Seguridad
- Credenciales cifradas
- Permisos 600 en archivos sensibles
- Sin credenciales en logs

### ✅ Validación
- Validación pre-deployment
- Verificación FTP
- Confirmación HTTP

### ✅ Multi-versión
- Soporte para múltiples versiones
- Backups automáticos
- Rollback disponible

---

## 🆘 Ayuda Rápida

### Error: "Credenciales FTP incorrectas"
```bash
# Actualiza Scripts/ftp-config.json
# Prueba de nuevo:
npm run ftp:test
```

### Error: "No se encuentra ZIP"
```bash
# Verifica que el ZIP esté en Empaquetado/Ready/
ls "Empaquetado/Ready/"
```

### Caché CDN no se limpia
```bash
# Espera 5-10 minutos y verifica:
npm run deploy:verify
```

---

## 🎊 Resumen Ejecutivo

**El sistema DOZO está 100% operacional** con:

- ✅ **18 scripts** automatizados
- ✅ **11 documentos** de guías
- ✅ **14 reportes** JSON generados
- ✅ **9 comandos NPM** listos para usar
- ✅ **12 fases** completadas
- ✅ **100% automatización** en deployment

**Próximo deployment:**
```bash
npm run sync:deploy
```

---

**DOZO System by RockStage Solutions**  
*Enterprise-grade WordPress Plugin Deployment System*


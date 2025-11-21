# 🚀 DOZO Remote Sync Validation - Quick Start Guide

## 📋 Descripción

Script de validación automática para el servidor de actualizaciones DOZO que verifica:

- ✅ Conectividad FTP
- ✅ Validez de archivos de actualización
- ✅ Accesibilidad HTTP
- ✅ Permisos de archivos
- ✅ Simulación de actualización WordPress

---

## ⚡ Uso Rápido

### Ejecutar Validación Completa:

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node dozo-remote-sync-validation-v1.0.0.js
```

### Resultado Esperado:

```
============================================================
  🧮 DOZO Update Server Sync v1.0.0
============================================================

🌐 Conexión FTP y verificación de acceso remoto
────────────────────────────────────────────────
✓ Conectado a 82.29.86.182
✓ Directorio remoto: /public_html/updates/warranty-system-rs
✓ Archivos encontrados: 2

🧾 Validar contenido de update.json
────────────────────────────────────────────────
✓ Todos los campos requeridos presentes
✓ update.json accesible vía HTTP

📦 Verificación del ZIP remoto
────────────────────────────────────────────────
✓ ZIP encontrado en FTP
✓ SHA256 calculado
✓ ZIP accesible vía HTTP

🔐 Revisión de permisos
────────────────────────────────────────────────
✓ Revisión de permisos completada

🔍 Simulación de actualización WordPress
────────────────────────────────────────────────
✓ Actualización detectada correctamente
✓ ZIP descargable desde URL especificada

============================================================
  ESTADO FINAL: REMOTE_SYNC_SUCCESSFUL
============================================================
✓ Todas las validaciones completadas exitosamente
```

---

## 📂 Archivos Generados

Después de ejecutar el script, se generan:

### 1. Reporte JSON Detallado

**Ubicación:** `Global/DOZO-RemoteSyncReport.json`

```json
{
  "timestamp": "2025-10-20T20:00:44.418Z",
  "status": "REMOTE_SYNC_SUCCESSFUL",
  "connection": { ... },
  "updateJson": { ... },
  "zipFile": { ... },
  "permissions": { ... },
  "wordpressSimulation": { ... },
  "errors": []
}
```

### 2. Reporte Markdown

**Ubicación:** `DOZO-REMOTE-SYNC-VALIDATION-REPORT.md`

Documento completo con análisis detallado de todos los componentes validados.

---

## 🔧 Configuración

El script utiliza las siguientes configuraciones (definidas en `CONFIG`):

```javascript
{
  ftp: {
    host: '82.29.86.182',
    port: 21,
    user: 'u461169968',
    password: 'RSN5$4n1XJx6l2:m',
    secure: false
  },
  remotePath: '/public_html/updates/warranty-system-rs',
  updateJsonFile: 'update.json',
  zipFile: 'warranty-system-rs.zip',
  downloadUrl: 'https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs.zip',
  updateJsonUrl: 'https://updates.vapedot.mx/warranty-system-rs/update.json'
}
```

---

## 🎯 Casos de Uso

### 1. Validación Después de Subir Nueva Versión

```bash
# Después de subir archivos vía FTP
node dozo-remote-sync-validation-v1.0.0.js

# Verificar reporte
cat Global/DOZO-RemoteSyncReport.json | grep "status"
```

### 2. Verificación Periódica de Salud del Servidor

```bash
# Ejecutar diariamente/semanalmente
node dozo-remote-sync-validation-v1.0.0.js

# Buscar errores
cat Global/DOZO-RemoteSyncReport.json | grep "errors"
```

### 3. Debugging de Problemas de Actualización

```bash
# Si WordPress no detecta actualizaciones
node dozo-remote-sync-validation-v1.0.0.js

# Revisar sección wordpressSimulation
cat Global/DOZO-RemoteSyncReport.json | grep -A 10 "wordpressSimulation"
```

---

## ✅ Validaciones Realizadas

### 🌐 1. Conexión FTP

- Conecta al servidor FTP
- Verifica acceso al directorio remoto
- Lista archivos disponibles
- Registra permisos y tamaños

### 🧾 2. Update.json

- Descarga y analiza el archivo
- Valida campos requeridos:
  - `version`
  - `download_url`
  - `tested`
  - `requires`
  - `requires_php`
- Verifica acceso HTTP

### 📦 3. Archivo ZIP

- Localiza el archivo ZIP (detecta variantes con versión)
- Descarga y calcula checksum SHA256
- Verifica tamaño y integridad
- Confirma accesibilidad HTTP

### 🔐 4. Permisos

- Verifica permisos de archivos (644)
- Identifica permisos incorrectos
- Genera reporte de estado

### 🔍 5. Simulación WordPress

- Simula petición de actualización
- Compara versiones (remota vs instalada)
- Verifica URL de descarga
- Confirma descargabilidad del ZIP

---

## 🚨 Interpretación de Resultados

### ✅ REMOTE_SYNC_SUCCESSFUL

Todos los componentes funcionan correctamente. El servidor está listo para servir actualizaciones.

### ⚠️ REMOTE_SYNC_PARTIAL

Algunas validaciones tienen advertencias pero el sistema es funcional. Revisar el campo `errors` para detalles.

### ❌ REMOTE_SYNC_FAILED

Errores críticos detectados. Revisar el reporte JSON para identificar problemas.

---

## 📊 Componentes del Reporte JSON

```json
{
  "timestamp": "ISO 8601 timestamp",
  "status": "REMOTE_SYNC_SUCCESSFUL | REMOTE_SYNC_PARTIAL | REMOTE_SYNC_FAILED",

  "connection": {
    "status": "SUCCESS | FAILED",
    "host": "servidor FTP",
    "remotePath": "ruta remota",
    "fileCount": "número de archivos",
    "files": [ /* lista de archivos */ ]
  },

  "updateJson": {
    "status": "VALID | INCOMPLETE | FAILED",
    "content": { /* contenido del JSON */ },
    "httpAccess": { /* detalles de acceso HTTP */ }
  },

  "zipFile": {
    "ftpStatus": "FOUND | NOT_FOUND",
    "fileName": "nombre del archivo",
    "size": "tamaño en bytes",
    "sha256": "hash SHA256",
    "httpAccess": { /* detalles de acceso HTTP */ }
  },

  "permissions": {
    "checked": [ /* archivos revisados */ ],
    "corrected": [ /* permisos corregidos */ ],
    "status": "CHECKED | CORRECTED | FAILED"
  },

  "wordpressSimulation": {
    "updateDetected": true/false,
    "remoteVersion": "versión disponible",
    "installedVersion": "versión simulada",
    "status": "UPDATE_DETECTED | NO_UPDATE | FAILED",
    "zipDownloadable": true/false
  },

  "errors": [ /* lista de errores si los hay */ ]
}
```

---

## 🔄 Automatización (Opcional)

### Crear Cron Job para Validación Diaria:

```bash
# Abrir crontab
crontab -e

# Agregar línea (ejecutar todos los días a las 9:00 AM)
0 9 * * * cd ~/Documents/Dozo\ System\ by\ RS && node dozo-remote-sync-validation-v1.0.0.js > /tmp/dozo-validation.log 2>&1
```

### Script de Notificación por Email (Ejemplo):

```bash
#!/bin/bash
cd ~/Documents/Dozo\ System\ by\ RS
node dozo-remote-sync-validation-v1.0.0.js

STATUS=$(cat Global/DOZO-RemoteSyncReport.json | grep '"status"' | head -1 | cut -d'"' -f4)

if [ "$STATUS" != "REMOTE_SYNC_SUCCESSFUL" ]; then
  echo "DOZO Validation Failed: $STATUS" | mail -s "DOZO Alert" admin@example.com
fi
```

---

## 🛠️ Troubleshooting

### Error: "Connection failed"

**Causa:** No se puede conectar al servidor FTP  
**Solución:** Verificar credenciales y conectividad de red

### Error: "update.json not found"

**Causa:** Archivo no existe en el servidor  
**Solución:** Subir update.json al directorio remoto

### Error: "ZIP verification failed"

**Causa:** Archivo ZIP no encontrado o corrupto  
**Solución:** Verificar nombre y subir archivo ZIP válido

### Warning: "Tamaño HTTP difiere del FTP"

**Causa:** Diferencia en tamaño entre FTP y HTTP  
**Solución:** Normal si hay compresión. Verificar hash SHA256

### "No update detected"

**Causa:** Versión remota <= versión instalada  
**Solución:** Verificar números de versión en update.json

---

## 📚 Recursos Adicionales

- **Script Principal:** `dozo-remote-sync-validation-v1.0.0.js`
- **Reporte JSON:** `Global/DOZO-RemoteSyncReport.json`
- **Reporte Detallado:** `DOZO-REMOTE-SYNC-VALIDATION-REPORT.md`
- **Documentación Completa:** `DOZO-MASTER-INDEX.md`

---

## 📞 Soporte

**Sistema:** DOZO System by RockStage  
**Versión:** v7.9 DeepSync Framework  
**Proyecto:** Warranty System RS  
**Autor:** RockStage Solutions

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este script contiene credenciales FTP. Mantener en ubicación segura y no compartir públicamente.

Considerar:

- Usar variables de entorno para credenciales
- Implementar .env para configuración sensible
- Restringir permisos de archivo (chmod 600)

---

**Última Actualización:** October 20, 2025

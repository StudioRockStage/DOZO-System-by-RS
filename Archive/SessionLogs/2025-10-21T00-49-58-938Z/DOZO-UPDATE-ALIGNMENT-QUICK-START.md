# 🚀 DOZO Update Alignment - Quick Start Guide

## 📋 Descripción

Script de alineación y validación completa que verifica:

- ✅ Plugin local (versión, estructura, configuración)
- ✅ URL de actualización configurada
- ✅ Estructura del ZIP
- ✅ Servidor remoto (update.json, ZIP)
- ✅ Comparación de versiones
- ✅ WordPress update detection (con WP-CLI)

---

## ⚡ Uso Rápido

### Ejecutar Validación Completa:

```bash
cd ~/Documents/Dozo\ System\ by\ RS
node dozo-update-alignment-v1.0.0.js
```

### Resultado Esperado:

```
============================================================
  🧩 DOZO Update Alignment v1.0.0
============================================================

🧭 Verificación del entorno base
────────────────────────────────────────────────
✓ Plugin encontrado
✓ Nombre del plugin correcto
✓ Versión coincide: 1.0.0
✓ Estructura de directorios completa

🔗 Validación de la URL de actualización
────────────────────────────────────────────────
✓ URL de actualización correcta
✓ update.json accesible

📦 Validación de estructura ZIP
────────────────────────────────────────────────
✓ Estructura correcta

🧾 Validación remota del update.json
────────────────────────────────────────────────
✓ update.json válido
✓ ZIP remoto accesible

🔁 Comparación de versiones
────────────────────────────────────────────────
✓ Versiones comparadas

⚙️ Ejecución de force-check en WordPress
────────────────────────────────────────────────
✓ WordPress check ejecutado

============================================================
  ESTADO FINAL: UPDATE_ALIGNMENT_SUCCESSFUL
============================================================
```

---

## 📂 Archivos Generados

### 1. Reporte JSON Detallado

**Ubicación:** `Global/DOZO-UpdateAlignmentReport.json`

```json
{
  "timestamp": "2025-10-20T...",
  "status": "UPDATE_ALIGNMENT_...",
  "localPlugin": {
    "status": "FOUND",
    "path": "...",
    "info": { ... },
    "directories": [ ... ]
  },
  "updateUrl": {
    "status": "CORRECT",
    "configured": "...",
    "accessible": true
  },
  "zipStructure": {
    "status": "CORRECT",
    "folderName": "warranty-system-rs"
  },
  "remoteValidation": {
    "status": "VALID",
    "updateJson": { ... },
    "zipSize": "2.73 MB",
    "zipAccessible": true
  },
  "versionComparison": {
    "localVersion": "1.0.0",
    "remoteVersion": "1.0.1",
    "status": "UPDATE_AVAILABLE",
    "updateAvailable": true
  },
  "wordPressCheck": {
    "wpCliAvailable": true,
    "status": "EXECUTED",
    "updateDetected": true
  },
  "errors": [],
  "warnings": []
}
```

---

## 🔧 Configuración

El script busca el plugin en las siguientes ubicaciones (en orden):

```javascript
localPluginPaths: [
  "/Applications/MAMP/htdocs/vapedot/wp-content/plugins/warranty-system-rs",
  "/Users/davidalejandroperezrea/Documents/Dozo System by RS/warranty-system",
  "/Users/davidalejandroperezrea/Documents/Dozo System by RS/Latest Builds/warranty-system-rs",
  "/Users/davidalejandroperezrea/Documents/Dozo System by RS/Latest Builds/Warranty System RS/warranty-system-rs",
];
```

### Personalizar Rutas:

Edita `dozo-update-alignment-v1.0.0.js` y modifica el array `localPluginPaths` en la sección CONFIG.

---

## 🎯 Casos de Uso

### 1. Validar Plugin Antes de Subir al Servidor

```bash
# Verificar configuración local
node dozo-update-alignment-v1.0.0.js

# Revisar reporte
cat Global/DOZO-UpdateAlignmentReport.json
```

### 2. Verificar Alineación Después de Actualizar Servidor

```bash
# Ejecutar validación completa
node dozo-update-alignment-v1.0.0.js

# Verificar que las versiones coincidan
grep "versionComparison" Global/DOZO-UpdateAlignmentReport.json
```

### 3. Debugging de Problemas de Actualización

```bash
# Ejecutar diagnóstico
node dozo-update-alignment-v1.0.0.js

# Buscar errores
cat Global/DOZO-UpdateAlignmentReport.json | grep -A 5 "errors"

# Buscar advertencias
cat Global/DOZO-UpdateAlignmentReport.json | grep -A 5 "warnings"
```

### 4. Verificar Configuración de WordPress

```bash
# Requiere WP-CLI instalado
node dozo-update-alignment-v1.0.0.js

# Ver resultado de WordPress check
cat Global/DOZO-UpdateAlignmentReport.json | grep -A 10 "wordPressCheck"
```

---

## ✅ Validaciones Realizadas

### 🧭 1. Verificación del Entorno Base

- Busca plugin en múltiples ubicaciones
- Extrae información del plugin header:
  - Plugin Name
  - Version
  - Description
  - Author
  - Update URI
- Verifica estructura de directorios esperada:
  - admin/
  - includes/
  - public/
  - templates/
  - assets/
  - tools/

### 🔗 2. Validación de URL de Actualización

- Verifica Update URI en el plugin
- Comprueba accesibilidad de update.json
- Valida formato JSON

### 📦 3. Validación de Estructura ZIP

- Verifica nombre de carpeta del plugin
- Detecta estructura de doble carpeta
- Confirma archivos principales presentes

### 🧾 4. Validación Remota

- Descarga update.json
- Valida campos requeridos:
  - version
  - download_url
  - tested
  - requires
  - requires_php
- Verifica accesibilidad del ZIP
- Obtiene tamaño del archivo

### 🔁 5. Comparación de Versiones

- Compara versión local vs remota
- Determina si hay actualización disponible
- Usa comparación semántica (major.minor.patch)

### ⚙️ 6. WordPress Check

- Verifica disponibilidad de WP-CLI
- Busca instalación WordPress
- Ejecuta comandos:
  - `wp transient delete update_plugins`
  - `wp plugin list`
- Detecta si WordPress ve la actualización

---

## 🚨 Interpretación de Resultados

### ✅ UPDATE_ALIGNMENT_SUCCESSFUL

Todo configurado correctamente. El sistema de actualizaciones está operativo.

**Características:**

- Plugin encontrado y válido
- Update URI configurado
- Servidor remoto accesible
- Versiones comparables
- WordPress detectando updates (si WP-CLI disponible)

**Acción:** Ninguna. Sistema listo para producción.

---

### ⚠️ UPDATE_ALIGNMENT_WITH_WARNINGS

Sistema funcional pero con advertencias que deberían revisarse.

**Características:**

- Plugin encontrado
- Algunas configuraciones faltantes o no estándar
- Servidor remoto operativo
- 0 errores críticos, 1+ advertencias

**Acción:** Revisar advertencias y aplicar mejoras opcionales.

**Advertencias comunes:**

- Update URI no configurado
- Directorios no estándar
- WP-CLI no disponible
- Versiones iguales (sin actualización para probar)

---

### ❌ UPDATE_ALIGNMENT_FAILED

Errores críticos detectados que impiden el funcionamiento.

**Características:**

- Plugin no encontrado, o
- Servidor remoto inaccesible, o
- Errores de configuración críticos

**Acción:** Resolver errores críticos antes de continuar.

---

## 🛠️ Solución de Problemas

### Error: "Plugin no encontrado"

**Causa:** El plugin no existe en ninguna ruta configurada

**Solución:**

1. Verifica que el plugin esté extraído
2. Agrega la ruta correcta al array `localPluginPaths`
3. Asegúrate de que el archivo `warranty-system-rs.php` exista

```bash
# Buscar plugin manualmente
find ~/Documents -name "warranty-system-rs.php" -type f
```

---

### Warning: "Update URI no configurado"

**Causa:** El plugin header no contiene Update URI

**Solución:** Agregar al inicio de `warranty-system-rs.php`:

```php
/**
 * Plugin Name: Warranty System RS
 * Version: 1.0.0
 * Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json
 */
```

---

### Warning: "WP-CLI no encontrado"

**Causa:** WP-CLI no instalado o no en PATH

**Solución:** Instalar WP-CLI:

```bash
# macOS/Linux
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Verificar
wp --info
```

**Alternativa:** Este warning no es crítico. El resto de validaciones funcionan sin WP-CLI.

---

### Warning: "Versiones iguales"

**Causa:** La versión local y remota son idénticas

**Solución:** Esto es normal si el plugin está actualizado. Para probar el sistema de updates:

1. Incrementa la versión en el archivo remoto `update.json`
2. Sube un nuevo ZIP con la versión incrementada
3. Ejecuta el validador nuevamente

---

### Error: "update.json no accesible"

**Causa:** Servidor remoto no responde o URL incorrecta

**Solución:**

1. Verifica conectividad de red
2. Confirma que la URL sea correcta
3. Verifica permisos del servidor
4. Prueba acceso con curl:

```bash
curl -I https://updates.vapedot.mx/warranty-system-rs/update.json
```

---

## 📊 Componentes del Reporte JSON

```json
{
  // Metadata
  "timestamp": "ISO 8601 timestamp",
  "status": "UPDATE_ALIGNMENT_SUCCESSFUL | _WITH_WARNINGS | _FAILED",

  // Plugin local
  "localPlugin": {
    "status": "FOUND | NOT_FOUND | ERROR",
    "path": "ruta absoluta del plugin",
    "info": {
      "name": "nombre del plugin",
      "version": "versión instalada",
      "description": "descripción",
      "author": "autor",
      "updateUri": "URL de actualización"
    },
    "directories": ["lista", "de", "directorios"]
  },

  // URL de actualización
  "updateUrl": {
    "status": "CORRECT | MISMATCH | NOT_CONFIGURED",
    "configured": "URL configurada",
    "expected": "URL esperada",
    "accessible": true/false
  },

  // Estructura ZIP
  "zipStructure": {
    "status": "CORRECT | NON_STANDARD | ERROR",
    "folderName": "nombre de la carpeta"
  },

  // Validación remota
  "remoteValidation": {
    "status": "VALID | ERROR",
    "updateJson": {
      "version": "versión remota",
      "download_url": "URL del ZIP",
      "tested": "WP version probada",
      "requires": "WP version requerida",
      "requires_php": "PHP version requerida"
    },
    "zipSize": "tamaño del ZIP",
    "zipAccessible": true/false
  },

  // Comparación de versiones
  "versionComparison": {
    "localVersion": "versión local",
    "remoteVersion": "versión remota",
    "status": "UPDATE_AVAILABLE | UP_TO_DATE | LOCAL_NEWER",
    "updateAvailable": true/false
  },

  // WordPress check
  "wordPressCheck": {
    "wpCliAvailable": true/false,
    "wpCliPath": "ruta de wp-cli",
    "wpPath": "ruta de WordPress",
    "status": "EXECUTED | WP_CLI_NOT_AVAILABLE | WP_NOT_FOUND",
    "pluginInfo": { /* info del plugin en WP */ },
    "updateDetected": true/false
  },

  // Errores y advertencias
  "errors": ["lista", "de", "errores"],
  "warnings": ["lista", "de", "advertencias"]
}
```

---

## 🔄 Flujo de Trabajo Recomendado

### 1. Desarrollo Local

```bash
# Modificar plugin
# Incrementar versión en warranty-system-rs.php
# Validar antes de empaquetar
node dozo-update-alignment-v1.0.0.js
```

### 2. Empaquetado

```bash
# Crear ZIP
# Validar estructura
node dozo-update-alignment-v1.0.0.js
```

### 3. Despliegue

```bash
# Subir ZIP al servidor
# Actualizar update.json
# Validar servidor remoto
node dozo-remote-sync-validation-v1.0.0.js
```

### 4. Validación Completa

```bash
# Ejecutar alineación completa
node dozo-update-alignment-v1.0.0.js

# Verificar que todo esté sincronizado
cat Global/DOZO-UpdateAlignmentReport.json | grep "status"
```

### 5. Testing en WordPress

```bash
# Si WP-CLI disponible
cd /ruta/wordpress
wp transient delete update_plugins
wp plugin list

# O desde WordPress admin
# Dashboard > Updates > Check Again
```

---

## 📚 Recursos Adicionales

- **Script de Validación Remota:** `dozo-remote-sync-validation-v1.0.0.js`
- **Reporte de Alineación:** `DOZO-UPDATE-ALIGNMENT-REPORT.md`
- **Reporte de Sync Remoto:** `DOZO-REMOTE-SYNC-VALIDATION-REPORT.md`
- **Documentación WP-CLI:** https://wp-cli.org/

---

## 📞 Soporte

**Sistema:** DOZO System by RockStage  
**Versión:** v7.9 DeepSync Framework  
**Proyecto:** Warranty System RS  
**Autor:** RockStage Solutions

---

**Última Actualización:** October 20, 2025

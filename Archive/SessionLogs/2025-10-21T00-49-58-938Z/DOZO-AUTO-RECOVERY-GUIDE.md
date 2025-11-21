# 🔄 DOZO Auto-Recovery System

**Sistema:** DOZO by RockStage Solutions  
**Versión:** 7.9.0  
**Implementado:** Phase 12 Auto-Recovery  
**Fecha:** October 2025

---

## ✨ Sistema de Auto-Recuperación

El sistema DOZO incluye capacidades de **auto-recuperación** que detectan, reconstruyen y ejecutan automáticamente componentes faltantes.

---

## 🚀 Auto-Recovery Phase 12

### ¿Qué hace?

El script `dozo-phase12-recovery.js` automáticamente:

1. ✅ **Detecta** estructura de directorios
2. ✅ **Crea** directorios faltantes (Workflow DB/, etc.)
3. ✅ **Reconstruye** el script `dozo-phase12-sync.js`
4. ✅ **Valida** dependencias npm (basic-ftp)
5. ✅ **Ejecuta** el deployment automáticamente
6. ✅ **Registra** todo el proceso en logs

### Comando

```bash
npm run recover
```

O directamente:

```bash
node dozo-phase12-recovery.js
```

---

## 📋 Proceso de Recuperación

### Paso 1: Estructura de Directorios

```
✅ Workflow DB/              → Scripts de workflow
✅ to chat gpt/Global/       → Reportes y logs
✅ Empaquetado/Ready/        → Archivos para deploy
```

### Paso 2: Script Reconstruido

```javascript
Workflow DB/dozo-phase12-sync.js
```

Funcionalidades incluidas:

- Conexión FTP automática
- Upload de ZIP y update.json
- Manejo de errores
- Logs de progreso

### Paso 3: Validación de Dependencias

```bash
npm install basic-ftp
```

### Paso 4: Ejecución Automática

```bash
node Workflow DB/dozo-phase12-sync.js
```

Resultado:

- ⬆️ ZIP subido al servidor
- 🧾 update.json actualizado
- ✅ Deployment completado

---

## 📊 Logs y Reportes

### Log de Recuperación

**Archivo:** `to chat gpt/Global/DOZO-Phase12-Recovery.json`

Contiene:

```json
[
  {
    "ts": "2025-10-18T02:24:23.999Z",
    "step": "recreate-phase12",
    "ok": true,
    "file": "Workflow DB/dozo-phase12-sync.js"
  },
  {
    "ts": "2025-10-18T02:24:24.890Z",
    "step": "validate-deps",
    "ok": true
  },
  {
    "ts": "2025-10-18T02:24:25.972Z",
    "step": "execute-phase12",
    "ok": true
  }
]
```

---

## 🎯 Casos de Uso

### Escenario 1: Script Phase 12 Faltante

Si `dozo-phase12-sync.js` fue borrado o movido:

```bash
npm run recover
```

Resultado:

- ✅ Script reconstruido
- ✅ Dependencies instaladas
- ✅ Deployment ejecutado
- ✅ Todo funcionando de nuevo

### Escenario 2: Deployment de Emergencia

Si necesitas deployar rápidamente sin validaciones:

```bash
npm run recover
```

El sistema automáticamente:

- Sube el último ZIP de `Empaquetado/Ready/`
- Actualiza `update.json`
- Completa el deployment

### Escenario 3: Validación de Sistema

Para verificar que todo está en orden:

```bash
npm run recover
```

Si todo está bien, simplemente re-deploya la versión actual.

---

## 🔧 Configuración

### Credenciales FTP (Integradas)

El script de recovery tiene las credenciales FTP integradas:

```javascript
const CONFIG = {
  host: '82.29.86.182',
  user: 'u461169968',
  password: '[REDACTED]',
  port: 21,
  remoteDir: '/public_html/updates/warranty-system/',
};
```

---

## 📦 Archivos Generados

### Durante la Recuperación

1. **`Workflow DB/dozo-phase12-sync.js`**
   - Script de deployment
   - Tamaño: ~1.5 KB
   - Incluye: Conexión FTP, upload, error handling

2. **`to chat gpt/Global/DOZO-Phase12-Recovery.json`**
   - Log del proceso de recuperación
   - Timestamps de cada paso
   - Status de cada operación

---

## 🌐 URLs del Sistema

Después de la recuperación, verifica:

**Update Channel:**

```
https://updates.vapedot.mx/warranty-system/update.json
```

**Package (v7.7.7):**

```
https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.7.zip
```

---

## ✅ Verificación Post-Recuperación

### 1. Ver archivos en servidor

```bash
node dozo-ftp-list-files.js
```

Esperado:

- ✅ Warranty_System_v7.7.7.zip (267 KB)
- ✅ update.json
- ✅ Warranty_System_v7.7.6.zip (backup)

### 2. Verificar propagación

```bash
npm run deploy:verify
```

### 3. Revisar logs

```bash
cat "to chat gpt/Global/DOZO-Phase12-Recovery.json"
```

---

## 🚀 Comandos Disponibles

```bash
# Auto-recuperación
npm run recover           # Reconstruir y deployar

# Deployment normal
npm run sync:deploy       # Sincronizar y deployar

# Validación
npm run ftp:test         # Probar FTP
npm run deploy:verify    # Verificar caché
```

---

## 🔍 Troubleshooting

### Error: "basic-ftp no disponible"

El script automáticamente ejecuta:

```bash
npm install basic-ftp
```

Si falla, ejecuta manualmente:

```bash
npm install
```

### Error: "ZIP no encontrado"

Verifica que exista en:

```
Empaquetado/Ready/Warranty_System_v7.7.7.zip
```

Si no existe, ejecuta primero:

```bash
node dozo-package-v7.7.7.js
```

### Error: "Credenciales FTP incorrectas"

Las credenciales están hard-coded en el script de recovery. Si cambian, actualiza:

```javascript
// En dozo-phase12-recovery.js
const CONFIG = {
  host: 'nuevo_host',
  user: 'nuevo_user',
  password: 'nuevo_password',
};
```

---

## 📈 Ventajas del Sistema

### ✅ Auto-Recuperación

- Detecta componentes faltantes
- Reconstruye automáticamente
- Ejecuta deployment
- Sin intervención manual

### ✅ Resiliente

- Maneja errores gracefully
- Logs detallados de cada paso
- Validación automática

### ✅ Documentado

- Cada paso registrado
- Timestamps precisos
- Trazabilidad completa

---

## 🎊 Resumen

El **sistema de auto-recuperación** de DOZO:

1. ✅ Detecta scripts faltantes
2. ✅ Reconstruye automáticamente
3. ✅ Valida dependencias
4. ✅ Ejecuta deployment
5. ✅ Registra todo el proceso

**Un solo comando para recuperar todo el sistema:**

```bash
npm run recover
```

---

## 📚 Documentación Relacionada

- `DOZO-SYSTEM-QUICK-START.md` - Quick start guide
- `DOZO-PHASE11-DEPLOYMENT-GUIDE.md` - Deployment completo
- `README-DEPLOYMENT.md` - Instrucciones de deployment
- `DOZO-FINAL-SUMMARY.txt` - Resumen ejecutivo

---

**DOZO System by RockStage Solutions**  
_Self-Healing Enterprise Deployment System_

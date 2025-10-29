# ⚡ Quick Deploy Reference - DOZO Phase 11 & 11.1

## 🎯 Workflow Completo

```bash
# 1. Probar conexión FTP
npm run ftp:test

# 2. Validar setup local
npm run validate

# 3a. Simular deployment (sin FTP)
npm run deploy:dryrun

# 3b. Deploy REAL (requiere FTP válido)
npm run deploy
```

---

## ⚙️ Configuración FTP

**Archivo:** `Scripts/ftp-config.json`

```json
{
  "host": "ftp.vapedot.mx",
  "user": "TU_USUARIO_FTP_CORRECTO",
  "password": "TU_PASSWORD_FTP_CORRECTO",
  "port": 21,
  "secure": false,
  "remotePath": "/public_html/updates/warranty-system/"
}
```

⚠️ **Credenciales actuales NO válidas** - Actualízalas y prueba con `npm run ftp:test`

---

## 📦 Archivos Listos para Deploy

- **Ubicación:** `Empaquetado/Ready/`
- **Archivos:**
  - ✅ `Warranty_System_v7.7.6.zip` (2.75 MB)
  - ✅ `update.json` (v7.7.6)
  - ✅ `changelog.txt`

**SHA256:** `b1ecd42b36661c8617f26ccc570c2f8748ade10d3cac95ea2a5be7b68e1c860b`

---

## 🌐 URLs de Validación

Después del deploy, verifica:

- ✅ `https://updates.vapedot.mx/warranty-system/update.json`
- ✅ `https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.6.zip`

---

## 📊 Reportes Generados

Ubicación: `to chat gpt/Global/`

1. `DOZO-PreDeploy-Validation.json` - Validación local ✅
2. `DOZO-FTP-Ready.json` - Estado FTP ⚠️
3. `DOZO-FTP-Test-Report.json` - Test detallado ⚠️
4. `DOZO-DryRun-Report.json` - Simulación ✅
5. `DOZO-Network-Report.json` - Red ✅
6. `DOZO-RemoteDeploy-Report.json` - Deploy final (pendiente)

---

## 🔧 Comandos Disponibles

### Testing & Validación
```bash
npm run validate       # Validar archivos locales
npm run ftp:test       # Probar conexión FTP
npm run deploy:dryrun  # Simular deployment
```

### Setup & Deployment
```bash
npm run ftp:setup      # Configurar credenciales FTP
npm run deploy         # Ejecutar deployment REAL
npm run network-unlock # Reconfigurar red
```

---

## 🔍 Estado Actual

- ✅ Scripts instalados y configurados
- ✅ Archivos validados (ZIP + update.json)
- ✅ Servidor FTP alcanzable (ftp.vapedot.mx)
- ⚠️ Credenciales FTP incorrectas

### Próximo Paso

1. Actualiza credenciales en `Scripts/ftp-config.json`
2. Ejecuta `npm run ftp:test` hasta que funcione
3. Ejecuta `npm run deploy`

---

## 📖 Documentación Completa

- **Guía completa:** `DOZO-PHASE11-DEPLOYMENT-GUIDE.md`
- **Status report:** `DOZO-PHASE11-FINAL-STATUS.md`
- **FTP Troubleshooting:** `DOZO-FTP-TROUBLESHOOTING.md`

---

**Sistema:** ✅ LISTO  
**Bloqueador:** ⚠️ Credenciales FTP  
**Tiempo para deployment:** < 15 min (una vez corregidas credenciales)


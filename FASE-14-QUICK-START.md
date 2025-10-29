# 🚀 DOZO FASE 14 – Quick Start

**Versión:** 2.4.0  
**Objetivo:** Firmar, notarizar y publicar instalador DMG

---

## ⚡ Ejecutar FASE 14

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-14
```

**Tiempo estimado:** 5-20 minutos (dependiendo de notarización)

---

## 📋 Pre-requisitos

### Opción A: Con Certificado y Notarización ✅
- [x] Certificado "Developer ID Application" instalado
- [x] Apple ID configurado
- [x] Team ID de Apple Developer
- [x] Contraseña específica de app creada

### Opción B: Sin Certificado (Testing) ⚠️
- [x] DMG generado en FASE 13
- ℹ️ El script continuará sin firma/notarización

---

## 🎯 ¿Qué hace el script?

1. ✅ Localiza el DMG en `DistributionBuild/`
2. ✅ Verifica certificados disponibles
3. ✅ Aplica firma digital (si hay certificado)
4. ✅ Envía a Apple para notarización (si hay credenciales)
5. ✅ Aplica ticket de notarización
6. ✅ Genera hash SHA-256
7. ✅ Publica en `PublicRelease/`
8. ✅ Genera reportes y documentación

---

## 🔐 Configuración de Credenciales (Opcional)

### Si tienes cuenta Apple Developer:

#### 1. Configurar variables de entorno
```bash
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

#### 2. Crear contraseña específica de app
1. Ir a https://appleid.apple.com
2. Iniciar sesión
3. Ir a **Security** > **App-Specific Passwords**
4. Generar nueva contraseña
5. Copiar la contraseña (formato: xxxx-xxxx-xxxx-xxxx)

#### 3. Guardar en keychain
```bash
xcrun notarytool store-credentials AC_PASSWORD \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password xxxx-xxxx-xxxx-xxxx
```

Luego ejecutar:
```bash
npm run phase-14
```

---

## 📦 Resultado

### Con Notarización Exitosa ✅
```
PublicRelease/
├── DOZO-Control-Center-RockStage-v2.3.0-notarized.dmg
├── SHA256-v2.3.0.txt
└── README.md
```

### Sin Notarización ⚠️
```
PublicRelease/
├── DOZO-Control-Center-RockStage-v2.3.0.dmg
├── SHA256-v2.3.0.txt
└── README.md
```

---

## 🔍 Verificar Resultado

```bash
# Ver archivos publicados
ls -lh PublicRelease/

# Ver hash SHA-256
cat PublicRelease/SHA256-*.txt

# Ver reporte
cat DozoCoreReport/DistributionSystem/reporte-fase-14-*.json | jq
```

---

## ⚠️ Solución Rápida de Problemas

### "No se encontró archivo DMG"
```bash
# Ejecutar primero FASE 13
npm run phase-13
```

### "Error al firmar"
- Verificar que el certificado esté instalado en Keychain
- Verificar que sea "Developer ID Application"

### "Error en notarización"
- Verificar credenciales de Apple ID
- Verificar conexión a internet
- Verificar que el DMG esté firmado primero

### Sin certificado/credenciales
✅ **No es problema:**  
El script continuará y generará un DMG funcional sin firma.  
Ideal para testing interno.

---

## 📚 Más Información

- **Guía completa:** `NOTARIZATION-GUIDE.md`
- **Documentación:** `FASE-14-COMPLETE.md`

---

**RockStage Solutions** © 2025  
**¡A notarizar!** 🚀



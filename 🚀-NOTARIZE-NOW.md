# 🚀 DOZO Notarization - START NOW!

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔐 FIRMAR Y NOTARIZAR DMG - FASE 14                    ║
║                                                           ║
║        DOZO Control Center – RockStage v2.4.0            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚡ Comando Único

```bash
cd ~/Documents/DOZO\ System\ by\ RS && npm run phase-14
```

**Tiempo:** 5-20 minutos  
**Resultado:** DMG firmado y notarizado en `PublicRelease/`

---

## 🔐 ¿Tienes Certificado Apple?

### ✅ SÍ - Con Certificado

**Pre-requisitos:**
1. Certificado "Developer ID Application" instalado
2. Variables de entorno configuradas:
```bash
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="XXXXXXXXXX"
```
3. Contraseña guardada en keychain

**Ejecutar:**
```bash
npm run phase-14
```

**Resultado:**
- ✅ DMG firmado
- ✅ Notarizado por Apple
- ✅ Listo para distribución pública

---

### ⚠️ NO - Sin Certificado

**No es problema!**

**Ejecutar:**
```bash
npm run phase-14
```

**Resultado:**
- ✅ DMG funcional para testing
- ⚠️ Sin firma (unsigned)
- ✅ Instalable con clic derecho > Abrir

**Ideal para:**
- Testing interno
- Desarrollo
- Distribución a equipo de QA

---

## 📦 Proceso Automático

El script hará:
1. Localizar DMG en `DistributionBuild/`
2. Verificar certificados disponibles
3. Firmar (si hay certificado)
4. Notarizar (si hay credenciales)
5. Aplicar ticket
6. Calcular hash SHA-256
7. Publicar en `PublicRelease/`
8. Generar reportes

---

## 🎯 Después del Build

### Ver Resultado
```bash
open PublicRelease/
```

### Verificar Hash
```bash
cat PublicRelease/SHA256-*.txt
```

### Ver Reporte
```bash
cat DozoCoreReport/DistributionSystem/reporte-fase-14-*.json
```

---

## 📚 Más Información

| Documento | Descripción |
|-----------|-------------|
| `FASE-14-QUICK-START.md` | Guía rápida |
| `NOTARIZATION-GUIDE.md` | Guía completa de notarización |
| `FASE-14-COMPLETE.md` | Documentación final |

---

## ⏱️ Configuración de Credenciales (5 min)

### Si tienes Apple Developer:

```bash
# 1. Variables de entorno
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="XXXXXXXXXX"

# 2. Guardar contraseña en keychain
xcrun notarytool store-credentials AC_PASSWORD \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password xxxx-xxxx-xxxx-xxxx

# 3. Ejecutar
npm run phase-14
```

**Guía paso a paso:** `NOTARIZATION-GUIDE.md`

---

## 🎯 ¡Listo para Ejecutar!

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-14
```

---

**RockStage Solutions** © 2025  
**¡A firmar y notarizar!** 🔐



# 🚀 DOZO FASE 13 – Quick Start

**Versión:** 2.3.0  
**Objetivo:** Generar DMG instalable firmado para macOS

---

## ⚡ Ejecutar FASE 13

```bash
cd ~/Documents/DOZO\ System\ by\ RS
node dozo-phase-13.js
```

**Tiempo estimado:** 3-5 minutos

---

## 📦 ¿Qué hace?

1. ✅ Verifica electron-builder
2. ✅ Actualiza configuración de build en package.json
3. ✅ Limpia builds anteriores
4. ✅ Genera el DMG instalable
5. ✅ Intenta firmar digitalmente (si hay certificado)
6. ✅ Calcula hash SHA-256
7. ✅ Genera reportes JSON y MD

---

## 📂 Resultado

### Archivos Generados

```
DistributionBuild/
└── DOZO-Control-Center-RockStage-2.3.0.dmg

DozoCoreReport/DistributionSystem/
├── reporte-fase-13-[timestamp].json
├── reporte-fase-13-[timestamp].md
└── DOZO-DMG-SHA256.txt
```

### Documentación

- `FASE-13-COMPLETE.md`
- `🎉-FASE-13-INSTALLATION-COMPLETE.md`

---

## 🔐 Firma Digital

### Si tienes certificado Apple:
✅ El script intentará firmar automáticamente

### Si NO tienes certificado:
⚠️ El DMG se generará sin firmar (unsigned build)

**Para firmar después:**
```bash
codesign --sign "Developer ID Application" --deep --force DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

---

## 🧪 Probar el DMG

```bash
# Abrir carpeta
open DistributionBuild/

# Instalar DMG
# 1. Doble clic en el .dmg
# 2. Arrastrar a Aplicaciones
# 3. Abrir desde Aplicaciones
```

---

## ⚠️ Si la app no abre (DMG sin firmar)

macOS puede bloquearlo por seguridad.

**Solución:**
```bash
# Opción 1: Desde System Preferences
# Security & Privacy > Allow

# Opción 2: Clic derecho > Abrir

# Opción 3: Desde Terminal
xattr -cr "/Applications/DOZO Control Center – RockStage.app"
```

---

## 📊 Verificar Build

```bash
# Ver tamaño del DMG
ls -lh DistributionBuild/*.dmg

# Ver hash SHA-256
cat DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt

# Ver reporte
cat DozoCoreReport/DistributionSystem/reporte-fase-13-*.json | jq
```

---

## 🆘 Solución de Problemas

### Error: "electron-builder no encontrado"
```bash
npm install --save-dev electron-builder
```

### Error: "Archivo no encontrado"
Verifica que existan:
- `AppBuild/main.js`
- `AppBuild/assets/rockstage-icon.icns`
- `Dashboard/public/index.html`

### Build falla
Revisa el reporte en:
`DozoCoreReport/DistributionSystem/reporte-fase-13-*.json`

---

## 🎯 Scripts NPM

Agregar a `package.json`:
```json
"scripts": {
  "phase-13": "node dozo-phase-13.js",
  "build:dmg": "electron-builder --mac"
}
```

Luego:
```bash
npm run phase-13
```

---

**RockStage Solutions** © 2025  
**¡Build exitoso!** 🎉



# 📦 DOZO Control Center - Build Guide

**Versión:** 2.3.0  
**Sistema:** macOS (Intel + ARM64 Universal)

---

## 🎯 Proceso Completo de Build

### Fases del Sistema

```
FASE 11: Telemetría y Validación
   ↓
FASE 12: Dashboard de Telemetría
   ↓
FASE 13: Build & DMG Sign ← ESTÁS AQUÍ
```

---

## 🚀 Build Rápido

### Opción 1: Script Automatizado (Recomendado)

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-13
```

### Opción 2: Comando Directo

```bash
node dozo-phase-13.js
```

### Opción 3: electron-builder Directo

```bash
npx electron-builder --mac
```

---

## 📋 Pre-requisitos

### 1. Software Necesario

- [x] Node.js v16.0.0+
- [x] npm
- [x] Electron ^28.0.0
- [x] electron-builder ^24.0.0

**Verificar:**

```bash
node --version
npm --version
npx electron --version
```

### 2. Archivos Críticos

- [x] `AppBuild/main.js`
- [x] `AppBuild/assets/rockstage-icon.icns`
- [x] `Dashboard/public/index.html`
- [x] `package.json` con configuración de build

**Verificar:**

```bash
npm run env-check
```

### 3. Certificado de Firma (Opcional)

- [ ] Certificado "Developer ID Application" de Apple
- [ ] Instalado en Keychain Access

**Verificar:**

```bash
security find-identity -v -p codesigning
```

---

## 🔧 Configuración de Build

### package.json

```json
{
  "version": "2.3.0",
  "main": "AppBuild/main.js",
  "build": {
    "appId": "com.rockstage.dozo",
    "productName": "DOZO Control Center – RockStage",
    "directories": {
      "output": "DistributionBuild"
    },
    "files": ["AppBuild/**/*", "Dashboard/public/**/*", "Core/**/*"],
    "extraResources": [
      {
        "from": "Dashboard/public",
        "to": "Dashboard/public"
      }
    ],
    "mac": {
      "target": ["dmg"],
      "category": "public.app-category.productivity",
      "icon": "AppBuild/assets/rockstage-icon.icns",
      "artifactName": "DOZO-Control-Center-RockStage-${version}.dmg"
    }
  }
}
```

---

## 📦 Proceso de Build

### Paso 1: Preparación

```bash
cd ~/Documents/DOZO\ System\ by\ RS

# Limpiar builds anteriores (opcional)
rm -rf DistributionBuild/*.dmg
```

### Paso 2: Ejecutar Build

```bash
npm run phase-13
```

**Salida esperada:**

```
═══════════════════════════════════════════════════════
🧩 FASE 13 – Stable Build & DMG Sign v2.3.0
═══════════════════════════════════════════════════════

✅ electron-builder detectado
✅ package.json cargado
✅ Configuración de build actualizada
✅ AppBuild/main.js
✅ AppBuild/assets/rockstage-icon.icns
✅ Dashboard/public/index.html
⏳ Ejecutando electron-builder...
✅ Build completado exitosamente
✅ DMG generado: DOZO-Control-Center-RockStage-2.3.0.dmg
```

### Paso 3: Verificación

```bash
# Ver el DMG generado
ls -lh DistributionBuild/*.dmg

# Ver hash SHA-256
cat DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt

# Ver reporte completo
cat DozoCoreReport/DistributionSystem/reporte-fase-13-*.json
```

---

## 🔐 Firma Digital

### Con Certificado Apple

Si tienes certificado "Developer ID Application", el script **firmará automáticamente**.

**Verificar firma:**

```bash
codesign -dv --verbose=4 DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

### Sin Certificado

El DMG se generará **sin firmar (unsigned)**.

**Firmar después:**

```bash
codesign --sign "Developer ID Application: Tu Nombre (TEAM_ID)" \
  --deep --force --verbose \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

**Notarización (para distribución pública):**

```bash
# 1. Subir a Apple
xcrun notarytool submit DOZO-Control-Center-RockStage-2.3.0.dmg \
  --apple-id tu@email.com \
  --team-id TEAM_ID \
  --password APP_SPECIFIC_PASSWORD \
  --wait

# 2. Staple (adjuntar ticket)
xcrun stapler staple DOZO-Control-Center-RockStage-2.3.0.dmg
```

---

## 📊 Tipos de Build

### Development Build

```bash
npm run build:mac:dev
```

- ✅ Rápido (no comprime)
- ✅ Para testing local
- ❌ No genera DMG

### Production Build

```bash
npm run phase-13
```

- ✅ DMG completo
- ✅ Comprimido y optimizado
- ✅ Listo para distribución

### Universal Build (Intel + ARM64)

```bash
npx electron-builder --mac --universal
```

- ✅ Compatible con todos los Macs
- ⚠️ Tamaño más grande

---

## 🧪 Testing del Build

### 1. Instalación Local

```bash
# Abrir el DMG
open DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg

# Arrastrar a Aplicaciones
# Abrir desde Launchpad
```

### 2. Verificar Funcionalidad

- [ ] La app abre correctamente
- [ ] Dashboard se carga sin pantalla blanca
- [ ] No hay errores en consola
- [ ] Todos los módulos funcionan

### 3. Verificar en Diferentes Macs

- [ ] Mac Intel (x86_64)
- [ ] Mac Apple Silicon (arm64)
- [ ] macOS 10.13+ (High Sierra o superior)

---

## 📁 Estructura de Salida

```
DistributionBuild/
├── DOZO-Control-Center-RockStage-2.3.0.dmg    ← Instalador
├── mac/                                        ← App sin empaquetar
│   └── DOZO Control Center – RockStage.app
└── builder-debug.yml                           ← Log de build

DozoCoreReport/DistributionSystem/
├── reporte-fase-13-[timestamp].json            ← Reporte técnico
├── reporte-fase-13-[timestamp].md              ← Reporte legible
└── DOZO-DMG-SHA256.txt                         ← Hash de verificación
```

---

## 🆘 Solución de Problemas

### Error: "electron-builder not found"

```bash
npm install --save-dev electron-builder@latest
```

### Error: "Icon not found"

```bash
# Verificar que existe
ls -la AppBuild/assets/rockstage-icon.icns

# Si falta, copiar desde backup
cp AppBuild/icon.icns AppBuild/assets/rockstage-icon.icns
```

### Error: "Cannot find module Dashboard/public"

```bash
# Verificar estructura
ls -la Dashboard/public/index.html

# Si falta, verificar que la FASE 12 está completa
```

### Build muy lento

```bash
# Usar build rápido para desarrollo
npm run build:mac:dev
```

### DMG no abre en otro Mac

- Verificar firma digital
- Verificar arquitectura (Intel vs ARM)
- Verificar versión mínima de macOS

---

## 📊 Tamaños Esperados

| Componente     | Tamaño Aproximado |
| -------------- | ----------------- |
| App .app       | ~200-300 MB       |
| DMG comprimido | ~150-250 MB       |
| DMG + firma    | +1 MB             |

---

## 🎯 Checklist de Build

### Pre-Build

- [ ] Node.js instalado
- [ ] electron-builder instalado
- [ ] Archivos críticos verificados
- [ ] package.json configurado
- [ ] Icono disponible

### Durante Build

- [ ] Sin errores de compilación
- [ ] DMG generado exitosamente
- [ ] Hash SHA-256 calculado

### Post-Build

- [ ] DMG instalado y probado
- [ ] App abre correctamente
- [ ] Dashboard funciona
- [ ] Reporte generado

### Distribución

- [ ] DMG firmado (si es necesario)
- [ ] Notarizado por Apple (si es público)
- [ ] Documentación actualizada
- [ ] Hash SHA-256 publicado

---

## 📚 Documentación Relacionada

- `FASE-13-QUICK-START.md` - Inicio rápido
- `FASE-13-COMPLETE.md` - Documentación completa
- `🎉-FASE-13-INSTALLATION-COMPLETE.md` - Confirmación
- `ELECTRON-REPAIR-GUIDE.md` - Troubleshooting Electron
- `README-ELECTRON-FIXES.md` - Fixes aplicados

---

## 🔄 Actualizar Versión

Para nueva versión (ej. 2.4.0):

1. Actualizar `package.json`:

```json
{
  "version": "2.4.0"
}
```

2. Ejecutar build:

```bash
npm run phase-13
```

3. Nuevo DMG se generará como:

```
DOZO-Control-Center-RockStage-2.4.0.dmg
```

---

## 🚀 CI/CD (Futuro)

**FASE 14:** GitHub Actions para builds automáticos

```yaml
# .github/workflows/build.yml
name: Build DMG
on: [push, release]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run phase-13
      - uses: actions/upload-artifact@v3
        with:
          name: dmg
          path: DistributionBuild/*.dmg
```

---

## 📞 Soporte

**Proyecto:** DOZO Control Center  
**Versión:** 2.3.0  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions

**Para problemas de build:**

1. Revisar `DozoCoreReport/DistributionSystem/reporte-fase-13-*.json`
2. Ejecutar `npm run env-check`
3. Verificar logs de electron-builder

---

**RockStage Solutions** © 2025  
**¡Build exitoso!** 🎉

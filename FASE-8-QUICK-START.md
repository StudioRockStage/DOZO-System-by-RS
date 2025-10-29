# 🚀 FASE 8 - Quick Start Guide

## ⚡ Comandos Rápidos

### Ejecutar Validación y Firma
```bash
cd ~/Documents/Dozo\ System\ by\ RS
node dozo-phase-8.js
```

### Ejecutar Init Completo
```bash
node Integration/dozo-fase8-init.js
```

---

## 📁 Estructura FASE 8

```
Root/
├── dozo-phase-8.js              # App signing & validation

Integration/
└── dozo-fase8-init.js           # Initializer

Scripts/
└── dozo-report-phase8.js        # Phase reporter

DozoCoreReport/
└── reporte-fase-8-*.json        # Validation reports
```

---

## 📊 Ver Archivos

### Validation Report
```bash
cat ~/Documents/Dozo\ System\ by\ RS/DozoCoreReport/reporte-fase-8-*.json
```

### Verificar Hash SHA256
```bash
shasum -a 256 ~/Documents/Dozo\ System\ by\ RS/DistributionBuild/*.dmg
```

### Verificar Firma
```bash
codesign -dv --verbose=4 ~/Documents/Dozo\ System\ by\ RS/DistributionBuild/*.dmg
```

---

## ✅ Output Esperado

### Sin Certificado (Desarrollo)
```
🚀 Iniciando FASE 8 – App Signing & Validation v2.0.0
🔐 Hash SHA256 generado correctamente
⚠️ No se encontró certificado válido. Se omitió la firma digital.
✅ FASE 8 completada – reporte generado
```

### Con Certificado (Producción)
```
🚀 Iniciando FASE 8 – App Signing & Validation v2.0.0
🔐 Hash SHA256 generado correctamente
✅ Firma digital completada
✅ FASE 8 completada – reporte generado
```

---

## 🔐 Hash SHA256

**Generated**:
```
12650035fe7dce596d6e1cf4e4fb310b2590564bd06558edb552016756f3eca7
```

**Use**:
- Verificar integridad del DMG
- Comparar antes/después de descarga
- Publicar en release notes

---

## 🎯 Status

| Componente | Estado |
|------------|--------|
| DMG Found | ✅ OK |
| SHA256 Generated | ✅ OK |
| Integridad | ✅ Verificada |
| Firma | ⚠️ Sin certificado |

---

## 🔧 Para Firmar (Producción)

### Requisitos
1. Certificado "Developer ID Application"
2. Instalado en Keychain
3. Ejecutar dozo-phase-8.js

### Verificar Certificado
```bash
security find-identity -v -p codesigning
```

---

**Documentación Completa**: `FASE-8-COMPLETE.md`




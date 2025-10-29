# 🎯 DOZO Build - START NOW!

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📦 GENERAR INSTALADOR DMG - FASE 13                    ║
║                                                           ║
║        DOZO Control Center – RockStage v2.3.0            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## ⚡ Comando Único

```bash
cd ~/Documents/DOZO\ System\ by\ RS && npm run phase-13
```

**Tiempo:** 3-5 minutos  
**Resultado:** DMG instalable en `DistributionBuild/`

---

## 📋 Proceso Automático

El script ejecutará:
1. ✅ Verificar electron-builder
2. ✅ Configurar package.json
3. ✅ Verificar archivos necesarios
4. ✅ Limpiar builds anteriores
5. ✅ Generar DMG
6. ✅ Intentar firma digital
7. ✅ Calcular hash SHA-256
8. ✅ Generar reportes

---

## 📦 Lo Que Obtendrás

```
DistributionBuild/
└── DOZO-Control-Center-RockStage-2.3.0.dmg  ← INSTALADOR

DozoCoreReport/DistributionSystem/
├── reporte-fase-13-[timestamp].json
├── reporte-fase-13-[timestamp].md
└── DOZO-DMG-SHA256.txt
```

Más:
- `FASE-13-COMPLETE.md`
- `🎉-FASE-13-INSTALLATION-COMPLETE.md`

---

## 🔐 Firma Digital

### Si tienes certificado Apple:
✅ Firmará automáticamente

### Si NO tienes certificado:
⚠️ Generará DMG sin firmar (unsigned)

**No es problema:** El DMG funcionará igual, solo mostrará advertencia de seguridad al instalarlo.

---

## 🚀 Después del Build

### 1. Verificar DMG
```bash
open DistributionBuild/
```

### 2. Instalar
- Doble clic en el DMG
- Arrastrar a Aplicaciones
- Abrir desde Launchpad

### 3. Si macOS bloquea (DMG sin firmar)
```bash
# Opción 1: Clic derecho > Abrir

# Opción 2: Terminal
xattr -cr "/Applications/DOZO Control Center – RockStage.app"
```

---

## 📊 Ver Reporte

```bash
# Reporte JSON
cat DozoCoreReport/DistributionSystem/reporte-fase-13-*.json

# Hash SHA-256
cat DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt
```

---

## 🆘 Si Hay Problemas

1. **electron-builder no encontrado:**
   ```bash
   npm install --save-dev electron-builder
   ```

2. **Archivos faltantes:**
   ```bash
   npm run env-check
   ```

3. **Build falla:**
   Ver: `DozoCoreReport/DistributionSystem/reporte-fase-13-*.json`

---

## 📚 Más Información

- **Guía completa:** `BUILD-GUIDE.md`
- **Quick start:** `FASE-13-QUICK-START.md`
- **Troubleshooting:** `ELECTRON-REPAIR-GUIDE.md`

---

## 🎯 ¡Listo para Ejecutar!

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-13
```

---

**RockStage Solutions** © 2025  
**¡A generar el DMG!** 🚀



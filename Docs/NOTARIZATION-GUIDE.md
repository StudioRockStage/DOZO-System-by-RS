# 🔐 DOZO Notarization Guide - Complete Reference

**Versión:** 2.4.0  
**Sistema:** macOS App Notarization with Apple

---

## 📋 Índice

1. [¿Qué es la Notarización?](#qué-es-la-notarización)
2. [¿Por qué Notarizar?](#por-qué-notarizar)
3. [Requisitos](#requisitos)
4. [Configuración Paso a Paso](#configuración-paso-a-paso)
5. [Ejecución](#ejecución)
6. [Verificación](#verificación)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Qué es la Notarización?

La **notarización** es un proceso de Apple que verifica que tu app:

- Está libre de malware
- No contiene código malicioso
- Cumple con las políticas de seguridad de Apple

Una vez notarizada, macOS no mostrará advertencias de seguridad al instalar.

---

## 🏆 ¿Por qué Notarizar?

### Con Notarización ✅

- No hay advertencias de seguridad
- Instalación sin fricción
- Confianza del usuario
- Distribución pública sin problemas
- Compatible con macOS Gatekeeper

### Sin Notarización ⚠️

- macOS muestra advertencia de "desarrollador no identificado"
- Usuario debe hacer clic derecho > Abrir
- Puede generar desconfianza
- No recomendado para distribución pública

---

## 📋 Requisitos

### 1. Apple Developer Program

**Costo:** $99 USD/año

**Incluye:**

- Certificado Developer ID Application
- Capacidad de notarización
- Acceso a Apple Developer Portal

**Registrarse:** https://developer.apple.com/programs/

### 2. Certificado de Firma

**Tipo:** Developer ID Application

**Obtener:**

1. Ir a https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles**
3. **Certificates** > **+** (Create)
4. Seleccionar **Developer ID Application**
5. Descargar e instalar en Keychain

**Verificar:**

```bash
security find-identity -v -p codesigning
```

Debe mostrar:

```
1) XXXXXX "Developer ID Application: Tu Nombre (TEAM_ID)"
```

### 3. Credenciales de Apple ID

- Apple ID (email)
- Team ID (10 caracteres)
- Contraseña específica de app

### 4. Herramientas de Línea de Comandos

```bash
xcode-select --install
```

---

## 🛠️ Configuración Paso a Paso

### Paso 1: Obtener Team ID

**Opción A - Apple Developer Portal:**

1. Ir a https://developer.apple.com/account
2. **Membership** en el sidebar
3. Copiar **Team ID** (ej: "XXXXXXXXXX")

**Opción B - Terminal:**

```bash
xcrun notarytool history --keychain-profile "PROFILE" 2>&1 | grep "Team ID"
```

### Paso 2: Crear Contraseña Específica de App

1. Ir a https://appleid.apple.com
2. Iniciar sesión con tu Apple ID
3. **Security** > **App-Specific Passwords**
4. **Generate Password...**
5. Nombrar: "DOZO Notarization"
6. Copiar contraseña (formato: xxxx-xxxx-xxxx-xxxx)

### Paso 3: Configurar Variables de Entorno

**Temporal (sesión actual):**

```bash
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

**Permanente (agregar a ~/.zshrc o ~/.bash_profile):**

```bash
echo 'export APPLE_ID="tu@email.com"' >> ~/.zshrc
echo 'export APPLE_TEAM_ID="XXXXXXXXXX"' >> ~/.zshrc
source ~/.zshrc
```

### Paso 4: Guardar Contraseña en Keychain

```bash
xcrun notarytool store-credentials AC_PASSWORD \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password xxxx-xxxx-xxxx-xxxx
```

**Resultado esperado:**

```
Credentials saved to Keychain.
To use them, specify `--keychain-profile "AC_PASSWORD"`
```

**Verificar:**

```bash
security find-generic-password -s "AC_PASSWORD"
```

---

## 🚀 Ejecución

### Método 1: Script Automatizado (Recomendado)

```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-14
```

### Método 2: Manual

#### 1. Firmar el DMG

```bash
codesign --sign "Developer ID Application" \
  --timestamp \
  --options runtime \
  --deep \
  --force \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

#### 2. Enviar a Notarización

```bash
xcrun notarytool submit \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password "@keychain:AC_PASSWORD" \
  --wait
```

**Tiempo:** 5-15 minutos típicamente

#### 3. Verificar Estado

```bash
# Obtener Submission ID de la salida anterior
xcrun notarytool info SUBMISSION_ID \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password "@keychain:AC_PASSWORD"
```

#### 4. Aplicar Ticket (Staple)

```bash
xcrun stapler staple \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

---

## ✅ Verificación

### 1. Verificar Firma

```bash
codesign -dv --verbose=4 \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

**Esperado:**

```
Executable=/path/to/dmg
Authority=Developer ID Application: Tu Nombre (TEAM_ID)
Authority=Developer ID Certification Authority
Authority=Apple Root CA
Signed Time=...
```

### 2. Verificar Notarización

```bash
spctl -a -vv -t install \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

**Esperado:**

```
accepted
source=Notarized Developer ID
```

### 3. Verificar Ticket Stapled

```bash
stapler validate \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

**Esperado:**

```
The validate action worked!
```

---

## 🔧 Troubleshooting

### Error: "credentials not found in keychain"

**Causa:** Contraseña no guardada correctamente

**Solución:**

```bash
# Re-guardar credenciales
xcrun notarytool store-credentials AC_PASSWORD \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password xxxx-xxxx-xxxx-xxxx
```

---

### Error: "The binary is not signed"

**Causa:** DMG no firmado antes de notarizar

**Solución:**

```bash
# Firmar primero
codesign --sign "Developer ID Application" \
  --timestamp --options runtime --deep --force \
  DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg

# Luego notarizar
npm run phase-14
```

---

### Error: "The operation couldn't be completed"

**Causa:** Problemas de red o servidor de Apple

**Solución:**

1. Verificar conexión a internet
2. Intentar de nuevo en unos minutos
3. Verificar estado de servicios de Apple: https://developer.apple.com/system-status/

---

### Notarización tarda mucho

**Normal:** 5-15 minutos  
**Puede tardar:** Hasta 1 hora en casos extremos

**Monitorear:**

```bash
xcrun notarytool history \
  --apple-id tu@email.com \
  --team-id XXXXXXXXXX \
  --password "@keychain:AC_PASSWORD"
```

---

### Error: "Invalid credentials"

**Causa:** Apple ID, Team ID o contraseña incorrectos

**Solución:**

1. Verificar Apple ID: debe ser el del Apple Developer Program
2. Verificar Team ID: 10 caracteres exactos
3. Regenerar contraseña específica de app
4. Re-guardar en keychain

---

### macOS sigue mostrando advertencia

**Causa posible:** Ticket no aplicado (stapled)

**Solución:**

```bash
xcrun stapler staple DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

**Verificar:**

```bash
stapler validate DistributionBuild/DOZO-Control-Center-RockStage-2.3.0.dmg
```

---

## 📊 Flujo Completo

```
┌─────────────────────┐
│  Generar DMG        │
│  (FASE 13)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Firmar DMG         │
│  (codesign)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Enviar a Apple     │
│  (notarytool)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Esperar Aprobación │
│  (5-15 min)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Aplicar Ticket     │
│  (stapler)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Verificar          │
│  (spctl/stapler)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ Listo para      │
│  Distribución       │
└─────────────────────┘
```

---

## 📚 Recursos Adicionales

### Documentación Apple

- **Notarization Guide:** https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
- **App-Specific Passwords:** https://support.apple.com/en-us/HT204397
- **Developer ID:** https://developer.apple.com/developer-id/

### Herramientas

- **notarytool:** Nueva herramienta de notarización (Xcode 13+)
- **altool:** Herramienta anterior (deprecated)
- **stapler:** Aplicar tickets de notarización

### Scripts DOZO

- `npm run phase-14` - Proceso completo automatizado
- `dozo-phase-14.js` - Script fuente

---

## 💡 Mejores Prácticas

1. **Firma siempre antes de notarizar**
   - La notarización requiere firma digital

2. **Usa variables de entorno**
   - No incluir credenciales en scripts

3. **Guarda credenciales en keychain**
   - Más seguro que contraseñas en texto plano

4. **Verifica antes de distribuir**
   - Prueba el DMG en un Mac limpio

5. **Mantén certificados actualizados**
   - Renuevan anualmente con Developer Program

6. **Documenta el proceso**
   - Facilita re-ejecución en el futuro

---

## 🆘 Soporte

**Proyecto:** DOZO Control Center  
**Versión:** 2.4.0  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions

**Recursos:**

- `FASE-14-QUICK-START.md` - Guía rápida
- `FASE-14-COMPLETE.md` - Documentación completa
- `DozoCoreReport/DistributionSystem/` - Reportes

---

**RockStage Solutions** © 2025  
**Notarización exitosa!** 🔐

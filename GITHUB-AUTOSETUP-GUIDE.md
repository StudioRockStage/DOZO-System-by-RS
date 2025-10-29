# 🔐 DOZO GitHub AutoSetup - Complete Guide

**Versión:** 2.0.0  
**Sistema:** Extended Secure Edition

---

## 🎯 Objetivo

Automatizar completamente la configuración de GitHub para el sistema DOZO:
- ✅ Instalación/verificación de GitHub CLI
- ✅ Autenticación con GitHub
- ✅ Configuración de identidad Git
- ✅ Configuración de remoto
- ✅ Gestión de tokens personales
- ✅ Validación de conexión con push de prueba
- ✅ Reportes completos

---

## 🚀 Inicio Rápido

### Comando Único
```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run github-setup
```

**Tiempo:** 2-5 minutos (incluye autenticación)

---

## 📋 ¿Qué hace el Script?

### Proceso Completo (9 pasos)

```
PASO 1: Verificar GitHub CLI
   ↓
PASO 2: Autenticar con GitHub
   ↓
PASO 3: Configurar identidad Git
   ↓
PASO 4: Configurar remoto GitHub
   ↓
PASO 5: Gestionar token personal
   ↓
PASO 6: Verificar estado del repositorio
   ↓
PASO 7: Probar conexión (push)
   ↓
PASO 8: Verificar estado final
   ↓
PASO 9: Generar reportes
```

---

## 🔧 Proceso Detallado

### 1. Verificación de GitHub CLI

**Acción:**
- Detecta si `gh` está instalado
- Muestra versión si existe

**Si no está instalado:**
```bash
brew install gh
```

---

### 2. Autenticación con GitHub

**Acción:**
- Verifica si ya estás autenticado
- Si no, inicia proceso de login interactivo

**Proceso:**
1. Ejecuta `gh auth login`
2. Sigue instrucciones en pantalla
3. Selecciona GitHub.com
4. Protocolo preferido: SSH
5. Autenticación vía navegador web

**Resultado:**
```
✓ Authentication complete
✓ Logged in as StudioRockStage
```

---

### 3. Configuración de Identidad Git

**Configura:**
- `user.name`: "StudioRockStage"
- `user.email`: "studiorockstage@gmail.com"

**Verifica con:**
```bash
git config user.name
git config user.email
```

---

### 4. Configuración de Remoto

**URL del repositorio:**
```
git@github.com:StudioRockStage/dozo-control-center.git
```

**Acciones:**
- Verifica si existe remoto 'origin'
- Actualiza URL si es diferente
- Crea remoto si no existe

**Verifica con:**
```bash
git remote -v
```

---

### 5. Gestión de Token Personal

**Ubicación del token:**
- Archivo: `~/.dozo_github_token`
- Keychain: macOS Keychain Access

**Proceso:**
1. Verifica si existe token local
2. Intenta obtener token de GitHub CLI
3. Guarda en archivo local (modo 0600)
4. Intenta guardar en Keychain de macOS

**Token con scopes:**
- `repo` - Control completo de repositorios
- `workflow` - Actualización de GitHub Actions

---

### 6. Verificación de Estado

**Comprueba:**
- Archivos modificados
- Archivos sin trackear
- Estado del working tree

---

### 7. Push de Prueba

**Acciones:**
1. Pull para sincronizar
2. Push para validar escritura
3. Verifica permisos

---

### 8. Estado Final

**Muestra:**
- Branch actual
- Commits pendientes
- Conexión con remoto

---

### 9. Reportes

**Genera:**
- `github-autosetup-report-[timestamp].json`
- `github-autosetup-report-[timestamp].md`

---

## 🎨 Salida Esperada

### Exitosa ✅
```
═══════════════════════════════════════════════════════
🧩 DOZO GitHub AutoSetup Script v2.0.0
═══════════════════════════════════════════════════════

🔍 PASO 1: Verificando instalación de GitHub CLI...
   ✅ GitHub CLI detectado:
      gh version 2.x.x

🔍 PASO 2: Verificando autenticación con GitHub...
   ✅ Ya estás autenticado con GitHub CLI

🔍 PASO 3: Configurando identidad Git...
   ✅ Identidad Git configurada:
      Nombre: StudioRockStage
      Email: studiorockstage@gmail.com

🔍 PASO 4: Verificando remoto de GitHub...
   ✅ Remoto 'origin' ya configurado correctamente

🔍 PASO 5: Gestionando token personal de GitHub...
   ✅ Token personal ya existe

🔍 PASO 6: Verificando estado del repositorio...
   ✅ Working tree limpio

🔍 PASO 7: Probando conexión con GitHub (push)...
   ✅ Push exitoso a GitHub remoto

🔍 PASO 8: Verificando estado final del repositorio...
   On branch main
   Your branch is up to date with 'origin/main'

🔍 PASO 9: Generando reporte de configuración...
   ✅ Reporte JSON generado

═══════════════════════════════════════════════════════
🎉 GITHUB AUTOSETUP COMPLETADO
═══════════════════════════════════════════════════════

✅ Configuración GitHub completada correctamente

🎯 Próximos pasos:
   1. Ejecutar: npm run phase-16
   2. Ejecutar: npm run validate-github
```

---

## 📚 Pre-requisitos

### Antes de Ejecutar

1. **Tener cuenta de GitHub**
   - Registrarse en https://github.com

2. **Instalar Homebrew** (si no está instalado)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Instalar GitHub CLI** (el script lo verificará)
   ```bash
   brew install gh
   ```

4. **Crear repositorio en GitHub** (si no existe)
   - Ir a https://github.com/new
   - Nombre: `dozo-control-center`
   - Público o Privado
   - No inicializar con README
   - Crear repositorio

---

## 🔧 Troubleshooting

### Error: "gh: command not found"

**Solución:**
```bash
brew install gh
npm run github-setup
```

---

### Error: "Failed to authenticate"

**Causas posibles:**
- Navegador no se abrió
- No completaste el proceso en el navegador
- Problemas de conexión a internet

**Solución:**
```bash
# Intentar de nuevo
gh auth login

# O autenticar manualmente
gh auth login --with-token < token.txt
```

---

### Error: "Permission denied (publickey)"

**Causa:** SSH keys no configuradas

**Solución:**
```bash
# Generar nueva llave SSH
ssh-keygen -t ed25519 -C "studiorockstage@gmail.com"

# Agregar al ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar llave pública
cat ~/.ssh/id_ed25519.pub

# Agregar en GitHub > Settings > SSH Keys
```

---

### Error: "Repository not found"

**Causa:** El repositorio no existe en GitHub

**Solución:**
1. Crear repositorio en https://github.com/new
2. Nombre: `dozo-control-center`
3. Owner: StudioRockStage
4. Re-ejecutar: `npm run github-setup`

---

### Push falla

**Solución:**
```bash
# Verificar que el repositorio existe
gh repo view StudioRockStage/dozo-control-center

# Si no existe, crear
gh repo create StudioRockStage/dozo-control-center --private

# Re-ejecutar setup
npm run github-setup
```

---

## 📊 Configuración Aplicada

### Git Config
```bash
user.name = "StudioRockStage"
user.email = "studiorockstage@gmail.com"
```

### Remoto
```bash
origin = git@github.com:StudioRockStage/dozo-control-center.git (fetch)
origin = git@github.com:StudioRockStage/dozo-control-center.git (push)
```

### Token
- **Ubicación:** `~/.dozo_github_token`
- **Keychain:** macOS Keychain Access
- **Scopes:** repo, workflow

---

## 🔄 Re-Ejecución

Si necesitas reconfigurar:

```bash
# Limpiar configuración anterior
git config --unset user.name
git config --unset user.email
git remote remove origin

# Re-ejecutar setup
npm run github-setup
```

---

## ✅ Verificación Post-Setup

### Verificar Autenticación
```bash
gh auth status
```

**Esperado:**
```
✓ Logged in to github.com as StudioRockStage
✓ Git operations for github.com configured to use ssh protocol
```

### Verificar Git Config
```bash
git config user.name
git config user.email
git remote -v
```

### Verificar Token
```bash
ls -la ~/.dozo_github_token
security find-generic-password -s dozo_github_token
```

### Verificar Conexión
```bash
ssh -T git@github.com
```

**Esperado:**
```
Hi StudioRockStage! You've successfully authenticated
```

---

## 🎯 Próximos Pasos

Después de completar el setup:

### 1. Sincronizar con GitHub
```bash
npm run phase-16
```

### 2. Validar Integridad
```bash
npm run validate-github
```

### 3. Verificar en GitHub
```bash
gh repo view StudioRockStage/dozo-control-center --web
```

---

## 📚 Archivos Generados

### Reportes
- `DozoCoreReport/GitHubSyncSystem/github-autosetup-report-[timestamp].json`
- `DozoCoreReport/GitHubSyncSystem/github-autosetup-report-[timestamp].md`

### Token
- `~/.dozo_github_token` - Token personal (0600 permissions)
- Keychain de macOS - Token almacenado de forma segura

---

## 💡 Mejores Prácticas

### 1. Usar GitHub CLI
- Más fácil que configuración manual
- Autenticación segura vía navegador
- Gestión automática de credenciales

### 2. Preferir SSH sobre HTTPS
- No requiere ingresar credenciales cada vez
- Más seguro
- Configuración una sola vez

### 3. Proteger el Token
- Permisos 0600 en archivo local
- Almacenado en Keychain de macOS
- No compartir ni commitear

### 4. Verificar Antes de Usar
- Ejecutar `npm run github-setup` primero
- Luego `npm run phase-16` para sincronizar
- Verificar en GitHub

---

## 🆘 Soporte

**Proyecto:** DOZO Control Center  
**Script:** GitHub AutoSetup v2.0.0  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions

**Recursos:**
- GitHub CLI: https://cli.github.com
- GitHub Docs: https://docs.github.com
- SSH Keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

**RockStage Solutions** © 2025  
**Configuración automática de GitHub!** 🔐



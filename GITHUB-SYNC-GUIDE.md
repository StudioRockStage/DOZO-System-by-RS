# 🔄 DOZO GitHub Sync - Complete Guide

**Versión:** 2.6.0  
**Sistema:** GitHub Live Sync & AppSync Integration

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Pre-requisitos](#pre-requisitos)
3. [Configuración](#configuración)
4. [Ejecución](#ejecución)
5. [Troubleshooting](#troubleshooting)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

La **FASE 16** implementa sincronización automática del sistema DOZO con GitHub, permitiendo:

- ✅ Versionado automático de código
- ✅ Commits automáticos con mensajes descriptivos
- ✅ Push automático a GitHub
- ✅ Changelog automático
- ✅ Metadata de sincronización
- ✅ Historial completo de versiones

---

## 📋 Pre-requisitos

### 1. Git Instalado
```bash
git --version
```

Debe mostrar algo como: `git version 2.x.x`

**Si no está instalado:**
```bash
# macOS
xcode-select --install

# O descargar de git-scm.com
```

### 2. Cuenta de GitHub
- Tener una cuenta en https://github.com
- Repositorio creado (puede ser privado o público)

### 3. Autenticación Configurada

**Opción A - GitHub CLI (Más Fácil):**
```bash
# Instalar
brew install gh

# Autenticar
gh auth login
```

**Opción B - SSH Keys:**
```bash
# Generar llave
ssh-keygen -t ed25519 -C "tu@email.com"

# Agregar a GitHub
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en GitHub > Settings > SSH Keys
```

**Opción C - HTTPS con Token:**
- Crear Personal Access Token en GitHub
- Settings > Developer settings > Personal access tokens
- Scope: repo (full control)

---

## 🛠️ Configuración

### Paso 1: Configurar Usuario Git

```bash
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

**Verificar:**
```bash
git config user.name
git config user.email
```

### Paso 2: Crear/Configurar Repositorio GitHub

**Crear nuevo repositorio:**
1. Ir a https://github.com/new
2. Nombre: `dozo-control-center` (o el que prefieras)
3. Público o Privado según prefieras
4. **No** inicializar con README
5. Click "Create repository"

**Copiar la URL:**
- SSH: `git@github.com:usuario/dozo-control-center.git`
- HTTPS: `https://github.com/usuario/dozo-control-center.git`

### Paso 3: Configurar Remoto

**SSH (Recomendado si tienes llaves configuradas):**
```bash
git remote add origin git@github.com:usuario/dozo-control-center.git
```

**HTTPS (Si usarás token):**
```bash
git remote add origin https://github.com/usuario/dozo-control-center.git
```

**Verificar:**
```bash
git remote -v
```

### Paso 4: Configurar Autenticación

**GitHub CLI:**
```bash
gh auth login
# Seguir las instrucciones en pantalla
```

**SSH:**
```bash
# Agregar llave al ssh-agent
ssh-add ~/.ssh/id_ed25519

# Verificar conexión
ssh -T git@github.com
```

---

## 🚀 Ejecución

### Comando Único
```bash
cd ~/Documents/DOZO\ System\ by\ RS
npm run phase-16
```

**O el alias:**
```bash
npm run sync-github
```

### Proceso Automático

El script ejecutará:

1. **Verificar Git** - Detecta o inicializa repositorio
2. **Verificar Usuario** - Comprueba configuración de Git
3. **Verificar Remoto** - Detecta o configura remoto GitHub
4. **Generar Changelog** - Actualiza CHANGELOG.md con nueva versión
5. **Stage Cambios** - `git add .`
6. **Crear Commit** - Con mensaje automático descriptivo
7. **Push a GitHub** - Sincroniza con repositorio remoto
8. **Generar Metadata** - Crea sync-metadata.json
9. **Reportes** - JSON y MD en GitHubSyncSystem/
10. **Documentación** - Genera archivos de cierre

---

## 📊 Salidas del Script

### Exitosa (con Push) ✅
```
═══════════════════════════════════════════════════════
🧩 FASE 16 – GitHub Live Sync & AppSync Integration v2.6.0
═══════════════════════════════════════════════════════

🔍 PASO 1: Verificando repositorio Git...
   ✅ Repositorio Git detectado
   📍 Branch actual: main

🔍 PASO 2: Verificando configuración de Git...
   ✅ Usuario: Tu Nombre
   ✅ Email: tu@email.com

🔍 PASO 3: Configurando remoto GitHub...
   ✅ Remoto 'origin' ya configurado:
      git@github.com:usuario/dozo-control-center.git

🔍 PASO 4: Preparando información de versión...
   ✅ package.json cargado
   📦 Versión actual: 2.6.0

🔍 PASO 5: Generando CHANGELOG.md...
   ✅ CHANGELOG.md actualizado

🔍 PASO 6: Preparando cambios para commit...
   ✅ Archivos agregados al staging area
   📝 Archivos modificados/nuevos: 42

🔍 PASO 7: Creando commit...
   ✅ Commit creado exitosamente

🔍 PASO 8: Sincronizando con GitHub...
   📤 Enviando cambios a GitHub...
   ✅ Sincronización con GitHub completada

✅ FASE 16 completada – repositorio sincronizado
```

### Con Advertencias ⚠️
```
⚠️ No se pudo realizar push a GitHub

💡 Posibles causas:
   - No hay autenticación SSH configurada
   - Token de GitHub no válido
   ...

🔧 Soluciones:
   1. Configurar SSH: gh auth login
   2. O usar HTTPS con token
```

---

## 🔧 Troubleshooting

### Error: "Repositorio no inicializado"

**Solución:**
```bash
cd ~/Documents/DOZO\ System\ by\ RS
git init
git branch -M main
npm run phase-16
```

### Error: "Usuario Git no configurado"

**Solución:**
```bash
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
npm run phase-16
```

### Error: "Remoto no configurado"

**Solución:**
```bash
git remote add origin git@github.com:usuario/dozo-control-center.git
npm run phase-16
```

### Error: "Permission denied (publickey)"

**Causa:** No tienes SSH keys configuradas

**Solución:**
```bash
# Opción 1: Usar GitHub CLI
gh auth login

# Opción 2: Configurar SSH
ssh-keygen -t ed25519 -C "tu@email.com"
ssh-add ~/.ssh/id_ed25519
# Agregar llave pública en GitHub

# Opción 3: Cambiar a HTTPS
git remote set-url origin https://github.com/usuario/repo.git
```

### Error: "Failed to push"

**Posibles causas:**
- Sin conexión a internet
- Repositorio no existe en GitHub
- Sin permisos de escritura
- Branch protegido

**Solución:**
1. Verificar que el repositorio existe en GitHub
2. Verificar permisos de acceso
3. Verificar conexión a internet

---

## 📚 Archivos Generados

### DozoCoreReport/GitHubSyncSystem/
- `sync-metadata.json` - Metadata de sincronización
- `reporte-fase-16-[timestamp].json` - Reporte técnico
- `reporte-fase-16-[timestamp].md` - Reporte legible

### Raíz del Proyecto
- `CHANGELOG.md` - Changelog actualizado o creado
- `FASE-16-COMPLETE.md` - Documentación completa
- `🎉-FASE-16-INSTALLATION-COMPLETE.md` - Confirmación

---

## 🔄 Workflow Típico

### Primera Vez
```bash
# 1. Configurar Git
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# 2. Crear repositorio en GitHub
# (Hacerlo manualmente en github.com)

# 3. Configurar remoto
git remote add origin git@github.com:usuario/dozo-control-center.git

# 4. Configurar autenticación
gh auth login

# 5. Ejecutar sincronización
npm run phase-16
```

### Siguientes Veces
```bash
# Simplemente ejecutar
npm run sync-github
```

---

## 💡 Mejores Prácticas

### 1. Usar SSH en lugar de HTTPS
- Más seguro
- No requiere ingresar credenciales cada vez
- Configuración una sola vez

### 2. Commits Descriptivos
El script genera commits automáticos con:
- Emoji identificador (🔁)
- Número de fase
- Versión del sistema
- Descripción de cambios

### 3. CHANGELOG Actualizado
Cada sincronización actualiza el changelog con:
- Nueva versión
- Fecha
- Cambios principales
- Información técnica

### 4. Verificación Post-Sync
Siempre verificar en GitHub:
```bash
# Ver último commit
git log -1

# O abrir en navegador
gh repo view --web
```

---

## 🎯 Próximos Pasos

Después de FASE 16:

### FASE 17: GitHub Actions & CI/CD
- Workflows automáticos
- Builds en cada push
- Tests automáticos
- Releases automáticas

### FASE 18: Auto-Update System
- Sistema de actualizaciones automáticas
- Check de nuevas versiones
- Descarga e instalación automática

---

## 📞 Soporte

**Proyecto:** DOZO Control Center  
**Versión:** 2.6.0  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions

**Recursos:**
- GitHub Docs: https://docs.github.com
- GitHub CLI: https://cli.github.com
- SSH Keys Guide: https://docs.github.com/en/authentication

---

**RockStage Solutions** © 2025  
**GitHub sync configurado!** 🔄



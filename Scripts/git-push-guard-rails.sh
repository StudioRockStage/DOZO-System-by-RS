#!/bin/bash

# Script para subir configuración de Guard Rails a GitHub
# DOZO System by RS - Guard Rails Setup

# set -e comentado para permitir que algunos archivos no existan

echo "🚀 Iniciando push de Guard Rails al repositorio..."
echo ""

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: No se encontró un repositorio git en el directorio actual"
    exit 1
fi

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"
echo ""

# Añadir archivos de configuración (solo si existen)
echo "📦 Añadiendo archivos de configuración..."
FILES_ADDED=0

# Verificar y añadir archivos de ESLint si existen
for eslint_file in eslint.config.mts .eslintrc.json .eslintrc.js eslint.config.js; do
    if [ -f "$eslint_file" ]; then
        git add "$eslint_file"
        echo "  ✓ $eslint_file añadido"
        FILES_ADDED=1
    fi
done

# Verificar y añadir archivos de Prettier si existen
for prettier_file in .prettierrc .prettierrc.json prettier.config.js; do
    if [ -f "$prettier_file" ]; then
        git add "$prettier_file"
        echo "  ✓ $prettier_file añadido"
        FILES_ADDED=1
    fi
done

# Añadir package.json si existe
if [ -f "package.json" ]; then
    git add package.json
    echo "  ✓ package.json añadido"
    FILES_ADDED=1
fi

# Añadir package-lock.json si existe
if [ -f "package-lock.json" ]; then
    git add package-lock.json
    echo "  ✓ package-lock.json añadido"
    FILES_ADDED=1
fi

# Añadir carpeta de workflows si existe
if [ -d ".github/workflows" ]; then
    git add .github/workflows/
    echo "  ✓ .github/workflows/ añadido"
    FILES_ADDED=1
fi

if [ $FILES_ADDED -eq 0 ]; then
    echo ""
    echo "⚠️  No se encontraron archivos de configuración para añadir"
    exit 0
fi

echo ""
echo "✅ Archivos añadidos al staging area"
echo ""

# Verificar que hay cambios para commitear
if git diff --staged --quiet; then
    echo ""
    echo "⚠️  No hay cambios para commitear (archivos ya están en el último commit o no hay cambios)"
    exit 0
fi

# Crear commit
echo "💾 Creando commit..."
git commit -m "feat: Configuración inicial de Guard Rails (ESLint, Prettier) y Workflow de CI."
echo "✅ Commit creado exitosamente"
echo ""

# Subir a GitHub
echo "☁️  Subiendo cambios a GitHub (rama: $CURRENT_BRANCH)..."
git push origin "$CURRENT_BRANCH"
echo ""

echo "✅ ¡Guard Rails configurado y subido exitosamente!"
echo "🎉 Los cambios están ahora en GitHub"


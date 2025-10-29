#!/bin/bash
#
# 🔍 DOZO Base Consolidation — Verification Script
# Verifica la integridad del plugin consolidado
#

echo "🔍 DOZO Base Consolidation — Verification Script"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Función para checks
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Verificar ZIP existe
echo "1. Verificando ZIP final..."
ZIP_PATH="$HOME/Documents/DOZO System by RS/Latest Builds/Warranty System RS/warranty-system-rs.zip"
if [ -f "$ZIP_PATH" ]; then
    check 0 "ZIP existe: warranty-system-rs.zip"
    
    # Verificar tamaño
    SIZE=$(stat -f%z "$ZIP_PATH" 2>/dev/null || stat -c%s "$ZIP_PATH" 2>/dev/null)
    if [ $SIZE -gt 150000 ]; then
        check 0 "Tamaño del ZIP: $(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo "$SIZE bytes")"
    else
        warn "Tamaño del ZIP parece pequeño: $SIZE bytes"
    fi
else
    check 1 "ZIP no encontrado"
fi
echo ""

# 2. Verificar estructura del ZIP
echo "2. Verificando estructura del ZIP..."
if command -v unzip &> /dev/null; then
    FIRST_ENTRY=$(unzip -l "$ZIP_PATH" 2>/dev/null | awk 'NR==4 {print $4}')
    if [[ "$FIRST_ENTRY" == warranty-system-rs/* ]]; then
        check 0 "Carpeta raíz correcta: warranty-system-rs/"
    else
        check 1 "Carpeta raíz incorrecta: $FIRST_ENTRY"
    fi
    
    # Verificar archivos clave
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/warranty-system-rs.php"
    check $? "Archivo principal presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/index.php"
    check $? "index.php de seguridad presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/uninstall.php"
    check $? "uninstall.php presente"
else
    warn "unzip no disponible, saltando verificación de estructura"
fi
echo ""

# 3. Verificar código fuente
echo "3. Verificando código fuente..."
SRC_PATH="$HOME/Documents/warranty-system-rs"
if [ -d "$SRC_PATH" ]; then
    check 0 "Carpeta fuente existe"
    
    # Verificar archivo principal
    if [ -f "$SRC_PATH/warranty-system-rs.php" ]; then
        check 0 "Archivo principal existe"
        
        # Verificar ABSPATH guard
        if grep -q "defined.*ABSPATH" "$SRC_PATH/warranty-system-rs.php"; then
            check 0 "ABSPATH guard presente"
        else
            check 1 "ABSPATH guard faltante"
        fi
        
        # Verificar versión
        VERSION=$(grep "Version:" "$SRC_PATH/warranty-system-rs.php" | head -1 | awk '{print $3}')
        if [ "$VERSION" == "1.0.0" ]; then
            check 0 "Versión correcta: $VERSION"
        else
            warn "Versión inesperada: $VERSION"
        fi
    else
        check 1 "Archivo principal no encontrado"
    fi
    
    # Verificar index.php
    if [ -f "$SRC_PATH/index.php" ]; then
        check 0 "index.php existe"
    else
        check 1 "index.php faltante"
    fi
    
    # Verificar directorios requeridos
    for dir in admin assets includes public templates tools; do
        if [ -d "$SRC_PATH/$dir" ]; then
            check 0 "Directorio $dir/ presente"
        else
            check 1 "Directorio $dir/ faltante"
        fi
    done
else
    check 1 "Carpeta fuente no encontrada"
fi
echo ""

# 4. Verificar reportes
echo "4. Verificando reportes..."
REPORT_JSON="$HOME/Documents/DOZO System by RS/to chat gpt/Global/DOZO-Base-Consolidation-Report.json"
if [ -f "$REPORT_JSON" ]; then
    check 0 "Reporte JSON existe"
else
    check 1 "Reporte JSON no encontrado"
fi

REPORT_MD="$HOME/Documents/DOZO System by RS/to chat gpt/Global/DOZO-BASE-CONSOLIDATION-SUCCESS.md"
if [ -f "$REPORT_MD" ]; then
    check 0 "Reporte MD existe"
else
    check 1 "Reporte MD no encontrado"
fi
echo ""

# 5. Verificar integridad SHA-256
echo "5. Verificando integridad SHA-256..."
if command -v shasum &> /dev/null && [ -f "$ZIP_PATH" ]; then
    ACTUAL_SHA=$(shasum -a 256 "$ZIP_PATH" | awk '{print $1}')
    EXPECTED_SHA="a58a74ea5c764faacc1fc3ddce1d3d4c099074a8204d96e352da220f1a365300"
    
    if [ "$ACTUAL_SHA" == "$EXPECTED_SHA" ]; then
        check 0 "SHA-256 coincide"
    else
        warn "SHA-256 diferente (puede ser OK si regeneraste el ZIP)"
        echo "   Esperado: $EXPECTED_SHA"
        echo "   Actual:   $ACTUAL_SHA"
    fi
else
    warn "No se puede verificar SHA-256"
fi
echo ""

# Resumen
echo "================================================"
echo "RESUMEN"
echo "================================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todas las verificaciones pasaron${NC}"
else
    echo -e "${RED}✗ $ERRORS error(es) encontrado(s)${NC}"
fi
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s)${NC}"
fi
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎯 Plugin listo para instalación/deployment${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Revisar errores antes de deployment${NC}"
    exit 1
fi


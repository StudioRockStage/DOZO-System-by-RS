#!/bin/bash
#
# 🔍 DOZO ZIP Verification Script (ZIP Only Mode)
# Verifica únicamente el ZIP sin requerir código fuente
#

echo "🔍 DOZO ZIP Verification Script"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

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

# Verificar ZIP
echo "1. Verificando ZIP final..."
ZIP_PATH="$HOME/Documents/DOZO System by RS/Latest Builds/Warranty System RS/warranty-system-rs.zip"
if [ -f "$ZIP_PATH" ]; then
    check 0 "ZIP existe: warranty-system-rs.zip"
    
    SIZE=$(stat -f%z "$ZIP_PATH" 2>/dev/null || stat -c%s "$ZIP_PATH" 2>/dev/null)
    if [ $SIZE -gt 150000 ]; then
        check 0 "Tamaño del ZIP: $SIZE bytes (~$(($SIZE / 1024)) KB)"
    else
        warn "Tamaño del ZIP parece pequeño: $SIZE bytes"
    fi
else
    check 1 "ZIP no encontrado"
fi
echo ""

# Verificar estructura
echo "2. Verificando estructura del ZIP..."
if command -v unzip &> /dev/null; then
    FIRST_ENTRY=$(unzip -l "$ZIP_PATH" 2>/dev/null | awk 'NR==4 {print $4}')
    if [[ "$FIRST_ENTRY" == warranty-system-rs/* ]]; then
        check 0 "Carpeta raíz correcta: warranty-system-rs/"
    else
        check 1 "Carpeta raíz incorrecta: $FIRST_ENTRY"
    fi
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/warranty-system-rs.php"
    check $? "Archivo principal presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/index.php"
    check $? "index.php presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/uninstall.php"
    check $? "uninstall.php presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/admin/"
    check $? "Directorio admin/ presente"
    
    unzip -l "$ZIP_PATH" 2>/dev/null | grep -q "warranty-system-rs/public/"
    check $? "Directorio public/ presente"
else
    warn "unzip no disponible"
fi
echo ""

# Verificar reportes
echo "3. Verificando reportes..."
REPORT_JSON="$HOME/Documents/DOZO System by RS/to chat gpt/Global/DOZO-WordPressCoreComplianceReport.json"
if [ -f "$REPORT_JSON" ]; then
    check 0 "Reporte WordPress Compliance existe"
else
    warn "Reporte Compliance no encontrado"
fi

REPORT_CH="$HOME/Documents/DOZO System by RS/to chat gpt/Global/DOZO-UpdateChannelRecheck.json"
if [ -f "$REPORT_CH" ]; then
    check 0 "Reporte Update Channel existe"
else
    warn "Reporte Channel no encontrado"
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
    echo -e "${GREEN}🎯 ZIP listo para deployment${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Revisar errores antes de deployment${NC}"
    exit 1
fi


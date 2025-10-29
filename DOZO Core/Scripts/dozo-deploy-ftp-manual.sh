#!/bin/bash
# ============================================================
# 🧩 DOZO Deploy v1.0.1 - Manual FTP Upload Script
# Sistema: DOZO System by RockStage (v7.9)
# Proyecto: Warranty System RS
# Autor: RockStage Solutions
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║          🚀 DOZO Deploy v1.0.1 – Manual FTP Upload 🚀                        ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuración
FTP_HOST="82.29.86.182"
FTP_USER="u461169968"
FTP_PASS="490?v0Lin9>x8?Mz"
REMOTE_PATH="/public_html/updates/warranty-system-rs"

SOURCE_ZIP="$HOME/Documents/DOZO System by RS/Latest Builds/Warranty System RS/warranty-system-rs-v1.0.1.zip"
TEMP_DIR="/tmp/dozo-deploy-$$"

# Crear directorio temporal
mkdir -p "$TEMP_DIR"

# Crear update.json
cat > "$TEMP_DIR/update.json" << 'UPDATEJSON'
{
  "version": "1.0.1",
  "download_url": "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
  "tested": "6.7.1",
  "requires": "6.0",
  "requires_php": "7.4"
}
UPDATEJSON

echo "✅ update.json creado"

# Copiar ZIP al directorio temporal
if [ ! -f "$SOURCE_ZIP" ]; then
    echo "❌ Error: No se encontró el archivo ZIP: $SOURCE_ZIP"
    exit 1
fi

cp "$SOURCE_ZIP" "$TEMP_DIR/warranty-system-rs-v1.0.1.zip"
echo "✅ ZIP copiado al directorio temporal"

# Crear script FTP
cat > "$TEMP_DIR/ftp-commands.txt" << FTPCMD
open $FTP_HOST
user $FTP_USER $FTP_PASS
binary
cd $REMOTE_PATH
mkdir warranty-system-rs 2>/dev/null
cd warranty-system-rs
put $TEMP_DIR/warranty-system-rs-v1.0.1.zip warranty-system-rs-v1.0.1.zip
put $TEMP_DIR/update.json update.json
ls
bye
FTPCMD

echo ""
echo "📤 Subiendo archivos via FTP..."
echo "   Host: $FTP_HOST"
echo "   Destino: $REMOTE_PATH"
echo ""

# Ejecutar FTP
ftp -n < "$TEMP_DIR/ftp-commands.txt"

FTP_RESULT=$?

# Limpiar
rm -rf "$TEMP_DIR"

if [ $FTP_RESULT -eq 0 ]; then
    echo ""
    echo "✅ Deploy completado"
    echo ""
    echo "🌐 Verifica las URLs:"
    echo "   ZIP:  https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip"
    echo "   JSON: https://updates.vapedot.mx/warranty-system-rs/update.json"
    echo ""
else
    echo ""
    echo "⚠️  Error en la subida FTP"
    echo "   Revisa las credenciales o usa un cliente FTP gráfico (FileZilla)"
    echo ""
fi



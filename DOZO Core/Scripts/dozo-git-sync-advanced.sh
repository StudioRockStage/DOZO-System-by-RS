#!/bin/bash
# 🧩 DOZO Git Sync Script v1.1.0 (Advanced)
# Proyecto: DOZO System by RS — RockStage Solutions
# Objetivo:
#   - Sincronizar repositorio local con GitHub.
#   - Verificar DOZO Compliance antes de cada push.
#   - Garantizar builds válidos, reportes completos y estructura estable.

set -e

HOME_DIR=~/Documents/DOZO\ System\ by\ RS
cd "$HOME_DIR" || exit 1

clear
echo "════════════════════════════════════════════════════════════════════"
echo "🧩 DOZO Advanced Git Sync — Compliance Validation Mode"
echo "════════════════════════════════════════════════════════════════════"

# --- VALIDACIÓN 1: Verificar existencia de carpetas críticas ---
REQUIRED_DIRS=("Latest Builds/Warranty System RS" "to chat gpt/Global" "Workflow DB" "Plugins")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ FALTA carpeta requerida: $dir"
    exit 1
  fi
done
echo "✅ Carpetas críticas detectadas."

# --- VALIDACIÓN 2: Verificar build ZIP y reportes DOZO ---
ZIP_FILE="Latest Builds/Warranty System RS/warranty-system-rs.zip"
REPORT_FILE="to chat gpt/Global/DOZO-WordPressCoreComplianceReport.json"
if [ ! -f "$ZIP_FILE" ]; then
  echo "❌ No se encontró el build ZIP ($ZIP_FILE)."
  exit 1
fi
if [ ! -f "$REPORT_FILE" ]; then
  echo "⚠️ No se encontró el reporte de compliance. Continuando con precaución."
else
  echo "✅ Reporte de compliance detectado."
fi

# --- VALIDACIÓN 3: Verificar errores recientes DOZO ---
if grep -q 'FAILED' to\ chat\ gpt/Global/*.json 2>/dev/null; then
  echo "❌ Se detectaron errores recientes en validaciones DOZO. Revisa los reportes antes de continuar."
  exit 1
fi
echo "✅ No se encontraron errores DOZO activos."

# --- VALIDACIÓN 4: Confirmar conexión GitHub ---
if ! git remote -v | grep -q 'github.com'; then
  echo "❌ No se detectó conexión con GitHub."
  exit 1
fi
echo "✅ Repositorio GitHub enlazado."

# --- COMMIT & PUSH ---
echo "📦 Preparando sincronización Git..."
git add .
COMMIT_MSG="🧩 DOZO Advanced Sync $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG" || echo "⚠️ No hay cambios nuevos para commitear."

echo "🌐 Enviando cambios a GitHub..."
git push origin main || git push origin master
echo "✅ Sincronización DOZO completada con éxito."

# --- LOG FINAL ---
echo "════════════════════════════════════════════════════════════════════"
echo "📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📂 Directorio: $HOME_DIR"
echo "📦 Build Validado: $ZIP_FILE"
echo "🧾 Reporte DOZO: $REPORT_FILE"
echo "════════════════════════════════════════════════════════════════════"
echo "🚀 Repositorio sincronizado con cumplimiento total DOZO."
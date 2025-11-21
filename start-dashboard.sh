#!/bin/bash

# DOZO Telemetry Dashboard - Script de inicio
# Autor: David Alejandro Pérez Rea / RockStage Solutions

echo "═══════════════════════════════════════════════════════"
echo "🚀 DOZO Telemetry Dashboard v2.2.0"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verificar que existe el directorio del dashboard
if [ ! -d "DashboardTelemetry" ]; then
  echo "❌ Error: Directorio DashboardTelemetry no encontrado"
  echo "Por favor, ejecuta primero: node dozo-phase-12.js"
  exit 1
fi

# Verificar que existen los archivos necesarios
if [ ! -f "DashboardTelemetry/telemetry-server.js" ]; then
  echo "❌ Error: telemetry-server.js no encontrado"
  echo "Por favor, ejecuta primero: node dozo-phase-12.js"
  exit 1
fi

# Verificar que existen reportes de telemetría
if [ ! -d "DozoCoreReport/TelemetrySystem" ]; then
  echo "⚠️  Advertencia: No se encontraron reportes de telemetría"
  echo "Se recomienda ejecutar primero: node dozo-phase-11.js"
  echo ""
  read -p "¿Continuar de todas formas? (s/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
  fi
fi

echo "✅ Verificaciones completadas"
echo ""
echo "📊 Iniciando servidor de telemetría..."
echo "🌐 Dashboard estará disponible en: http://localhost:9095"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "═══════════════════════════════════════════════════════"
echo ""

# Cambiar al directorio del dashboard e iniciar el servidor
cd DashboardTelemetry
node telemetry-server.js







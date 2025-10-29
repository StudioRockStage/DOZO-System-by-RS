#!/bin/bash
# Iniciar WordPress con Docker
echo "🚀 Iniciando WordPress local..."
cd "/Users/davidalejandroperezrea/Documents/DOZO System by RS"
docker compose up -d
echo ""
echo "✅ WordPress iniciado"
echo "📍 URL: http://localhost:8080"
echo "👤 Usuario: admin"
echo "🔑 Contraseña: admin"
echo ""
echo "Para detener: ./stop-wordpress.sh"

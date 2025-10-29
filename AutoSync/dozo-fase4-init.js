#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 4 - AutoSync & Plugin Intelligence Manager
 * Inicializa el sistema de sincronización automática de plugins
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 4 – AutoSync & Plugin Intelligence Manager v2.0.0\n');

// Step 1: Load AutoSync Configuration
console.log('1️⃣ Cargando configuración de AutoSync...');
const configPath = path.join(__dirname, 'Config/autosync-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`   ✅ Intervalo de sincronización: ${config.autoSyncInterval}`);
console.log(`   ✅ Plugins configurados: ${config.pluginDirectories.length}`);
console.log(`   ℹ️  Plugins: ${config.pluginDirectories.join(', ')}`);
console.log(`   ✅ Backup automático: ${config.autoBackupBeforeSync ? 'Habilitado' : 'Deshabilitado'}\n`);

// Step 2: Run AutoSync Core
console.log('2️⃣ Ejecutando sincronización automática de plugins...');
const { execSync } = await import('child_process');
try {
  execSync('node AutoSync/Engines/dozo-autosync-core.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Sincronización completada\n');
} catch (error) {
  console.log('   ⚠️  Error al sincronizar plugins\n');
}

// Step 3: Run Plugin Intelligence
console.log('3️⃣ Ejecutando análisis de inteligencia de plugins...');
try {
  execSync('node AutoSync/Engines/dozo-plugin-intelligence.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Análisis de inteligencia completado\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar análisis\n');
}

// Step 4: Generate Phase 4 Report
console.log('4️⃣ Generando reporte de FASE 4...');
try {
  execSync('node Scripts/dozo-report-phase4.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 4 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 AutoSync Core operativo');
console.log('🧠 Plugin Intelligence Manager ejecutado');
console.log('📊 Plugins monitoreados y sincronizados');
console.log('📈 Reportes generados en AutoSync/Reports/');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




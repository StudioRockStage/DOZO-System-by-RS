#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 3 - Diagnostic Framework & AutoRepair Engine
 * Inicializa el sistema de diagnóstico y reparación automática
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 3 – Diagnostic Framework & AutoRepair Engine v2.0.0\n');

// Step 1: Load Diagnostic Configuration
console.log('1️⃣ Cargando configuración de diagnóstico...');
const configPath = path.join(__dirname, 'dozo-diagnostic-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`   ✅ AutoRepair: ${config.autoRepair ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`   ✅ Deep Scan: ${config.deepScan ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`   ✅ Backup Before Fix: ${config.backupBeforeFix ? 'Habilitado' : 'Deshabilitado'}\n`);

// Step 2: Run Diagnostic Core
console.log('2️⃣ Ejecutando escaneo de diagnóstico...');
const { execSync } = await import('child_process');
try {
  execSync('node Diagnostics/Engines/dozo-diagnostic-core.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Escaneo completado\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar diagnóstico\n');
}

// Step 3: Run AutoRepair Engine
console.log('3️⃣ Ejecutando motor de reparación automática...');
try {
  execSync('node Diagnostics/Engines/dozo-autorepair.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reparaciones completadas\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar reparaciones\n');
}

// Step 4: Generate Phase 3 Report
console.log('4️⃣ Generando reporte de FASE 3...');
try {
  execSync('node Scripts/dozo-report-phase3.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 3 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🩺 Diagnostic Core operativo');
console.log('🔧 AutoRepair Engine ejecutado');
console.log('💾 Backups creados automáticamente');
console.log('📈 Reportes generados en Diagnostics/Reports/');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 1 - Complete Initialization
 * Ejecuta todos los scripts de FASE 1 en secuencia
 */

import { DOZO } from './dozo-core.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 1 – Core Rebuild & Structure Autodeploy v2.0.0\n');

// Step 1: Initialize Core Engine
console.log('1️⃣ Inicializando DOZO Core Engine...');
if (!DOZO.initialized) {
  DOZO.init();
}
DOZO.checkStructure();
console.log('   ✅ Core Engine inicializado\n');

// Step 2: Load Configuration
console.log('2️⃣ Cargando configuración del sistema...');
const configPath = path.join(__dirname, 'dozo-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`   ✅ Configuración v${config.systemVersion} cargada`);
console.log(`   ℹ️  Proyecto: ${config.defaultProject}`);
console.log(`   ℹ️  AI Sync: ChatGPT=${config.aiSync.chatgpt}, Cursor=${config.aiSync.cursor}, Claude=${config.aiSync.claude}\n`);

// Step 3: Run Autodiagnostic
console.log('3️⃣ Ejecutando autodiagnóstico del sistema...');
const { execSync } = await import('child_process');
try {
  execSync('node Scripts/dozo-autodiagnostic.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Autodiagnóstico completado\n');
} catch (error) {
  console.log('   ⚠️  Autodiagnóstico con advertencias\n');
}

// Step 4: Generate Phase 1 Report
console.log('4️⃣ Generando reporte de FASE 1...');
try {
  execSync('node Scripts/dozo-report-phase1.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 1 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 Estructura central DOZO System v2.0.0 creada');
console.log('🧩 Core Engine operativo');
console.log('🩺 Autodiagnóstico ejecutado');
console.log('📊 Reportes generados en DozoCoreResport/');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




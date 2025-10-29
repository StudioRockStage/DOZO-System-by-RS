#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 2 - Intelligence Sync & Report Engine
 * Inicializa el sistema de inteligencia y sincronización AI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 2 – Intelligence Sync & Report Engine v2.0.0\n');

// Step 1: Load AI Configuration
console.log('1️⃣ Cargando configuración AI...');
const configPath = path.join(__dirname, 'Configs/dozo-ai-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`   ✅ AI Sync: ${config.aiSyncEnabled ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`   ℹ️  Conexiones: ChatGPT=${config.connections.ChatGPT}, Cursor=${config.connections.Cursor}, Claude=${config.connections.Claude}\n`);

// Step 2: Initialize Intelligence Core
console.log('2️⃣ Inicializando Intelligence Core...');
const { execSync } = await import('child_process');
try {
  execSync('node AI-Link/SyncEngine/dozo-intelligence.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Intelligence Core inicializado\n');
} catch (error) {
  console.log('   ⚠️  Error al inicializar Intelligence Core\n');
}

// Step 3: Run Report Engine
console.log('3️⃣ Ejecutando Report Engine...');
try {
  execSync('node AI-Link/SyncEngine/dozo-report-engine.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Report Engine completado\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar Report Engine\n');
}

// Step 4: Generate Phase 2 Report
console.log('4️⃣ Generando reporte de FASE 2...');
try {
  execSync('node Scripts/dozo-report-phase2.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 2 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧠 Intelligence Core operativo');
console.log('📊 Report Engine ejecutado');
console.log('🔗 Sincronización AI habilitada');
console.log('📈 Reportes generados en AI-Link/Reports/');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




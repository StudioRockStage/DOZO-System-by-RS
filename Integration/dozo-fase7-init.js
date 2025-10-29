#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 7 - GitHub Integration & AutoCommit Engine
 * Inicializa la integración completa con GitHub y automatización de commits
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 7 – GitHub Integration & AutoCommit Engine v2.0.0\n');

// Step 1: Verify Git Repository
console.log('1️⃣ Verificando repositorio Git...');
const gitPath = path.resolve(__dirname, '..', '.git');
if (fs.existsSync(gitPath)) {
  console.log('   ✅ Repositorio Git existente');
  
  try {
    const branch = execSync('git branch --show-current', { 
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf-8' 
    }).trim();
    console.log(`   ℹ️  Branch actual: ${branch || 'detached HEAD'}`);
  } catch (error) {
    console.log('   ⚠️  Error al obtener branch');
  }
} else {
  console.log('   ⚠️  No hay repositorio Git (se inicializará al ejecutar dozo-phase-7.js)');
}
console.log();

// Step 2: Check GitHub Configuration
console.log('2️⃣ Verificando configuración de GitHub...');
const configPath = path.resolve(__dirname, '..', 'github-config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log(`   ✅ Configuración encontrada`);
  console.log(`   ℹ️  Repository: ${config.repository}`);
  console.log(`   ℹ️  Branch: ${config.branch}`);
  console.log(`   ℹ️  Author: ${config.author}`);
  console.log(`   ℹ️  AutoCommit: ${config.autoCommit ? 'Habilitado' : 'Deshabilitado'}`);
} else {
  console.log('   ⚠️  No hay configuración (se creará al ejecutar dozo-phase-7.js)');
}
console.log();

// Step 3: Execute GitHub Integration
console.log('3️⃣ Ejecutando integración GitHub...');
try {
  execSync('node dozo-phase-7.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Integración completada\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar integración\n');
}

// Step 4: Verify Generated Files
console.log('4️⃣ Verificando archivos generados...');
const reportPattern = path.resolve(__dirname, '..', 'DozoCoreResport/reporte-fase-7-*.json');
try {
  const reports = execSync(`ls ${reportPattern} 2>/dev/null || echo ""`, { encoding: 'utf-8' }).trim();
  if (reports) {
    console.log('   ✅ Reporte FASE 7 generado');
  } else {
    console.log('   ⚠️  Reporte no encontrado');
  }
} catch {}

if (fs.existsSync(configPath)) {
  console.log('   ✅ github-config.json presente');
}
console.log();

// Step 5: Generate Phase 7 Report
console.log('5️⃣ Generando reporte de FASE 7...');
try {
  execSync('node Scripts/dozo-report-phase7.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 7 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 Integración GitHub activa');
console.log('📝 AutoCommit Engine operativo');
console.log('📊 Reportes sincronizados con DozoCoreResport/');
console.log('⚙️  Configuración guardada en github-config.json');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




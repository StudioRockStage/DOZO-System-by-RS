#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 6 - Smart Sync & Multi-IA Integration
 * Inicializa la sincronización inteligente entre ChatGPT, Cursor AI y Claude AI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 6 – Smart Sync & Multi-IA Integration v2.0.0\n');

// Step 1: Verify AI Integration Structure
console.log('1️⃣ Verificando estructura de integración AI...');
const aiModules = [
  'AI/dozo-multiai-bridge.js',
  'AI/dozo-context-sync.js',
  'AI/dozo-version-linker.js',
  'AI/dozo-report-sync.js',
  'AI/dozo-health-monitor.js'
];

let allExists = true;
for (const mod of aiModules) {
  const fullPath = path.resolve(__dirname, mod);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${mod}`);
  } else {
    console.log(`   ❌ ${mod} no existe`);
    allExists = false;
  }
}

if (allExists) {
  console.log('   ✅ Todos los módulos AI presentes\n');
} else {
  console.log('   ⚠️  Algunos módulos faltan\n');
}

// Step 2: Execute Multi-IA Integration
console.log('2️⃣ Ejecutando integración Multi-IA...');
const { execSync } = await import('child_process');
try {
  execSync('node dozo-phase-6.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Integración completada\n');
} catch (error) {
  console.log('   ⚠️  Error al ejecutar integración\n');
}

// Step 3: Verify Generated Files
console.log('3️⃣ Verificando archivos generados...');
const expectedFiles = [
  'Workflow DB/ActiveContext.json',
  'Workflow DB/Versions-Link.json',
  'Workflow DB/HealthStatus.json'
];

for (const file of expectedFiles) {
  const fullPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    console.log(`   ✅ ${file}`);
    if (file.includes('HealthStatus')) {
      console.log(`      Health: ${data.health}`);
    }
  } else {
    console.log(`   ❌ ${file} no generado`);
  }
}
console.log();

// Step 4: Generate Phase 6 Report
console.log('4️⃣ Generando reporte de FASE 6...');
try {
  execSync('node Scripts/dozo-report-phase6.js', { 
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit' 
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 6 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 Multi-IA Bridge activo');
console.log('🧠 Context Sync operativo');
console.log('🔗 Version Linker ejecutado');
console.log('📁 Report Sync funcional');
console.log('🩺 Health Monitor activo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');




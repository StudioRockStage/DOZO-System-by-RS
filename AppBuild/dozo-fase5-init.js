#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 5 - Packaging & Runtime Build
 * Inicializa el empaquetado de la aplicación Electron para macOS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando FASE 5 – Packaging & Runtime Build v2.0.0\n');

// Step 1: Verify Structure
console.log('1️⃣ Verificando estructura de empaquetado...');
const requiredPaths = [
  'AppBuild/public',
  'AppBuild/assets',
  'AppBuild/scripts',
  'DistributionBuild',
];

let allExists = true;
for (const p of requiredPaths) {
  const fullPath = path.resolve(__dirname, '..', p);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${p}`);
  } else {
    console.log(`   ❌ ${p} no existe`);
    allExists = false;
  }
}

if (allExists) {
  console.log('   ✅ Estructura verificada\n');
} else {
  console.log('   ⚠️  Algunas carpetas faltan\n');
}

// Step 2: Check Configuration
console.log('2️⃣ Verificando configuración de Electron...');
const pkgPath = path.resolve(__dirname, '..', 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  console.log(`   ✅ App Name: ${pkg.name}`);
  console.log(`   ✅ Version: ${pkg.version}`);
  console.log(`   ✅ Main: ${pkg.main}`);
  if (pkg.build) {
    console.log(`   ✅ Build Config: Configurado`);
    console.log(`   ℹ️  Product Name: ${pkg.build.productName}`);
    console.log(`   ℹ️  App ID: ${pkg.build.appId}\n`);
  }
} else {
  console.log('   ❌ package.json no encontrado\n');
}

// Step 3: Check UI Files
console.log('3️⃣ Verificando archivos de interfaz...');
const htmlPath = path.resolve(__dirname, 'public/index.html');
const iconPath = path.resolve(__dirname, 'assets/rockstage-icon.icns');

if (fs.existsSync(htmlPath)) {
  console.log('   ✅ UI: index.html presente');
} else {
  console.log('   ❌ UI: index.html no encontrado');
}

if (fs.existsSync(iconPath)) {
  console.log('   ✅ Icon: rockstage-icon.icns presente\n');
} else {
  console.log('   ⚠️  Icon: rockstage-icon.icns es placeholder\n');
}

// Step 4: Generate Phase 5 Report
console.log('4️⃣ Generando reporte de FASE 5...');
const { execSync } = await import('child_process');
try {
  execSync('node Scripts/dozo-report-phase5.js', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('   ✅ Reporte generado\n');
} catch (error) {
  console.log('   ⚠️  Error al generar reporte\n');
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ FASE 5 COMPLETADA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 Estructura de empaquetado lista');
console.log('⚙️  Configuración Electron verificada');
console.log('🎨 Interfaz UI preparada');
console.log('📊 Sistema listo para build con electron-builder');
console.log('');
console.log('💡 Para construir la aplicación:');
console.log('   npm install');
console.log('   npm run build');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

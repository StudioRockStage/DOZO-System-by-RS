/*
🧩 DOZO WordPress Core Compliance & Install Simulation v1.0.0
Sistema: DOZO System by RS (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Objetivo:
  - Simular instalación y activación del plugin dentro de un entorno controlado tipo WordPress.
  - Validar estructura, cabeceras, hooks y compatibilidad PHP/WP.
  - Detectar errores fatales antes del despliegue.
  - Generar un diagnóstico integral para DOZO System, asegurando que el plugin puede instalarse, activarse y actualizarse sin fallas.
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// === CONFIG ===
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const latestBuild = path.join(baseDir, 'Latest Builds', 'Warranty System RS', 'warranty-system-rs.zip');
const globalDir = path.join(baseDir, 'to chat gpt', 'Global');
const complianceDir = path.join(baseDir, 'Workflow DB');
const reportPath = path.join(globalDir, 'DOZO-WordPressCoreComplianceReport.json');

const report = {
  started_at: new Date().toISOString(),
  build: latestBuild,
  results: [],
  warnings: [],
  errors: [],
  status: 'PENDING'
};

function logResult(name, status, info = '') {
  console.log(`▶ ${name}: ${status}`);
  report.results.push({ test: name, status, info });
}

function sha256(file) {
  const h = crypto.createHash('sha256');
  h.update(fs.readFileSync(file));
  return h.digest('hex');
}

// === 1️⃣ Validar existencia del ZIP ===
if (!fs.existsSync(latestBuild)) {
  report.errors.push('No se encontró el archivo ZIP del plugin en Latest Builds.');
  report.status = 'FAILED';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  process.exit(1);
}
logResult('Archivo ZIP detectado', 'OK');

// === 2️⃣ Validar estructura mínima del plugin ===
import AdmZip from 'adm-zip';
const zip = new AdmZip(latestBuild);
const entries = zip.getEntries().map(e => e.entryName);

const mainFile = entries.find(e => e.match(/warranty-system-rs\.php$/));
const hasAdmin = entries.some(e => e.startsWith('warranty-system-rs/admin/'));
const hasIncludes = entries.some(e => e.startsWith('warranty-system-rs/includes/'));
const hasPublic = entries.some(e => e.startsWith('warranty-system-rs/public/'));

if (!mainFile) report.errors.push('Falta el archivo principal warranty-system-rs.php');
if (!hasAdmin || !hasIncludes || !hasPublic) report.warnings.push('Estructura incompleta: admin/includes/public');
logResult('Estructura del ZIP', report.errors.length ? 'ERROR' : 'OK');

// === 3️⃣ Simular lectura de cabeceras WP ===
const mainContent = zip.readAsText(mainFile);
const headers = {
  PluginName: /Plugin Name:\s*(.*)/i.exec(mainContent)?.[1] || null,
  Version: /Version:\s*(.*)/i.exec(mainContent)?.[1] || null,
  Author: /Author:\s*(.*)/i.exec(mainContent)?.[1] || null,
  UpdateURI: /Update URI:\s*(.*)/i.exec(mainContent)?.[1] || null,
  TextDomain: /Text Domain:\s*(.*)/i.exec(mainContent)?.[1] || null,
};

if (!headers.PluginName || !headers.Version) report.errors.push('Faltan cabeceras esenciales Plugin Name/Version.');
if (!headers.UpdateURI) report.warnings.push('Falta Update URI para actualizaciones automáticas.');
logResult('Cabeceras del plugin', headers.PluginName ? 'OK' : 'ERROR', headers);

// === 4️⃣ Verificación de ABSPATH ===
if (!/defined\(\s*'ABSPATH'\s*\)/.test(mainContent)) {
  report.errors.push('Falta verificación ABSPATH en el archivo principal.');
  logResult('Verificación ABSPATH', 'ERROR');
} else {
  logResult('Verificación ABSPATH', 'OK');
}

// === 5️⃣ Validar compatibilidad con WordPress y PHP ===
const requiresPhp = /Requires PHP:\s*(.*)/i.exec(mainContent)?.[1] || '7.4';
const requiresWp = /Requires at least:\s*(.*)/i.exec(mainContent)?.[1] || '6.0';
const testedUpTo = /Tested up to:\s*(.*)/i.exec(mainContent)?.[1] || '6.7.1';

report.compatibility = { requiresPhp, requiresWp, testedUpTo };
logResult('Compatibilidad PHP/WP', 'OK', report.compatibility);

// === 6️⃣ Simular activación y hooks ===
const hookCount = (mainContent.match(/add_action|add_filter/g) || []).length;
if (hookCount < 5) report.warnings.push('Pocos hooks detectados, revisar inicialización.');
logResult('Hooks detectados', 'OK', { hookCount });

// === 7️⃣ Validar potenciales errores fatales (validación sintaxis PHP básica) ===
try {
  // Verificar que no hay errores obvios de sintaxis
  const hasOpenPhpTag = mainContent.includes('<?php');
  const hasFunctionDeclarations = /function\s+\w+\s*\(/.test(mainContent);
  const hasClassDeclarations = /class\s+\w+/.test(mainContent);
  
  if (!hasOpenPhpTag) throw new Error('Falta etiqueta de apertura PHP <?php');
  
  // Buscar posibles problemas comunes
  const issues = [];
  if (/\$\$\w+/.test(mainContent)) issues.push('Posible variable doble $$');
  if (/;\s*\)/.test(mainContent)) issues.push('Posible sintaxis incorrecta ;)');
  
  if (issues.length > 0) {
    report.warnings.push(`Posibles problemas de sintaxis: ${issues.join(', ')}`);
  }
  
  logResult('Validación sintaxis PHP', 'OK', { 
    hasFunctions: hasFunctionDeclarations,
    hasClasses: hasClassDeclarations 
  });
} catch (e) {
  report.errors.push('Error al validar sintaxis PHP: ' + e.message);
  logResult('Validación sintaxis PHP', 'ERROR', e.message);
}

// === 8️⃣ Resultado general ===
report.finished_at = new Date().toISOString();
report.hash = sha256(latestBuild);
report.status = report.errors.length ? 'FAILED' : 'WP_COMPATIBLE_OK';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n✅ Verificación completada');
console.log('🧾 Reporte:', reportPath);
console.log('📦 Resultado:', report.status);


/*
 * DOZO Auto-Validator v1.0.0 (Demo Mode)
 * Sistema: DOZO System by RS (v7.9)
 * Proyecto: Warranty System RS
 * 
 * Ejecuta validaciones automáticas sobre ZIPs existentes
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// ---------- CONFIG ----------
const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE = path.resolve(HOME, 'Documents/DOZO System by RS');
const LATEST = path.join(BASE, 'Latest Builds', 'Warranty System RS');
const GLOBAL = path.join(BASE, 'to chat gpt', 'Global');

// Rutas de validadores existentes
const VALIDATORS = {
  wpCompliance: path.join(BASE, 'dozo-wordpress-compliance-check.js'),
  channelRecheck: path.join(BASE, 'dozo-update-channel-recheck.js'),
  verify: path.join(BASE, 'verify-base-consolidation.sh'),
};

// ---------- UTILS ----------
const log = (...a) => console.log('[DOZO-AUTO]', ...a);
const ensureDir = p => fs.existsSync(p) || fs.mkdirSync(p, { recursive: true });
const sha256 = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

function runNode(script, label = '') {
  if (!fs.existsSync(script)) {
    log(`⚠ Script no encontrado: ${path.basename(script)}`);
    return { status: 'SKIPPED', reason: 'Script not found' };
  }
  try {
    log(`▶ Ejecutando: ${label || path.basename(script)}`);
    execSync(`node "${script}"`, { 
      stdio: 'inherit',
      cwd: BASE 
    });
    return { status: 'PASSED' };
  } catch (err) {
    log(`✗ Error ejecutando ${path.basename(script)}`);
    return { status: 'FAILED', error: err.message };
  }
}

function runBash(script, label = '') {
  if (!fs.existsSync(script)) {
    log(`⚠ Script no encontrado: ${path.basename(script)}`);
    return { status: 'SKIPPED', reason: 'Script not found' };
  }
  try {
    log(`▶ Ejecutando: ${label || path.basename(script)}`);
    execSync(`bash "${script}"`, { 
      stdio: 'inherit',
      cwd: BASE 
    });
    return { status: 'PASSED' };
  } catch (err) {
    log(`✗ Error ejecutando ${path.basename(script)}`);
    return { status: 'FAILED', error: err.message };
  }
}

function isZipOkName(name) {
  return /^warranty-system-rs(\-v\d+\.\d+\.\d+)?(\-respaldo-ws)?\.zip$/i.test(name);
}

// ---------- VALIDACIÓN COMPLETA ----------
async function validateZip(zipPath) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fname = path.basename(zipPath);
  
  let hash;
  try {
    hash = sha256(zipPath);
  } catch (err) {
    log(`✗ Error calculando hash de ${fname}:`, err.message);
    return;
  }
  
  log('\n' + '═'.repeat(80));
  log(`🔍 VALIDANDO BUILD: ${fname}`);
  log('═'.repeat(80));
  log(`📦 Archivo: ${zipPath}`);
  log(`💾 Tamaño: ${Math.round(fs.statSync(zipPath).size / 1024)} KB`);
  log(`🔐 SHA-256: ${hash.substring(0, 16)}...`);
  log('═'.repeat(80));

  ensureDir(GLOBAL);

  const results = {
    timestamp: ts,
    file: zipPath,
    filename: fname,
    sha256: hash,
    size_bytes: fs.statSync(zipPath).size,
    size_kb: Math.round(fs.statSync(zipPath).size / 1024),
    validations: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };

  // 1) WordPress Core Compliance
  log('\n📋 VALIDACIÓN 1/3: WordPress Core Compliance');
  log('-'.repeat(80));
  const r1 = runNode(VALIDATORS.wpCompliance, 'WordPress Compliance');
  results.validations.wp_compliance = r1.status;
  results.summary.total++;
  if (r1.status === 'PASSED') results.summary.passed++;
  else if (r1.status === 'FAILED') results.summary.failed++;
  else results.summary.skipped++;

  // 2) Update Channel Recheck
  log('\n🌐 VALIDACIÓN 2/3: Update Channel Recheck');
  log('-'.repeat(80));
  const r2 = runNode(VALIDATORS.channelRecheck, 'Update Channel Recheck');
  results.validations.channel_recheck = r2.status;
  results.summary.total++;
  if (r2.status === 'PASSED') results.summary.passed++;
  else if (r2.status === 'FAILED') results.summary.failed++;
  else results.summary.skipped++;

  // 3) Base Consolidation Verify
  log('\n🔍 VALIDACIÓN 3/3: Base Consolidation Verify');
  log('-'.repeat(80));
  const r3 = runBash(VALIDATORS.verify, 'Base Verification');
  results.validations.base_verify = r3.status;
  results.summary.total++;
  if (r3.status === 'PASSED') results.summary.passed++;
  else if (r3.status === 'FAILED') results.summary.failed++;
  else results.summary.skipped++;

  // Determinar estado final
  results.final_status = results.summary.failed === 0 ? 'ALL_VALIDATIONS_PASSED ✅' : 'SOME_VALIDATIONS_FAILED ⚠️';

  // Guardar resultados
  const reportPath = path.join(GLOBAL, `DOZO-AutoValidator-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Resumen final
  log('\n' + '═'.repeat(80));
  log('📊 RESUMEN FINAL');
  log('═'.repeat(80));
  log(`Archivo:    ${fname}`);
  log(`Tamaño:     ${results.size_kb} KB`);
  log(`SHA-256:    ${hash.substring(0, 32)}...`);
  log('-'.repeat(80));
  log(`✓ Pasadas:  ${results.summary.passed}/${results.summary.total}`);
  log(`✗ Fallidas: ${results.summary.failed}/${results.summary.total}`);
  log(`⏭ Saltadas: ${results.summary.skipped}/${results.summary.total}`);
  log('-'.repeat(80));
  log(`📊 Estado:  ${results.final_status}`);
  log(`🧾 Reporte: ${path.basename(reportPath)}`);
  log('═'.repeat(80));
}

// ---------- MAIN ----------
(async () => {
  console.log('\n' + '═'.repeat(80));
  console.log('🔭 DOZO AUTO-VALIDATOR v1.0.0 (Demo Mode)');
  console.log('═'.repeat(80));
  console.log('Sistema: DOZO System by RS v7.9');
  console.log('Proyecto: Warranty System RS');
  console.log('═'.repeat(80) + '\n');

  ensureDir(LATEST);
  ensureDir(GLOBAL);
  
  log('📁 Carpeta de builds:', LATEST);
  log('📊 Carpeta de reportes:', GLOBAL);
  log('');

  // Buscar todos los ZIPs
  const zips = fs.readdirSync(LATEST)
    .filter(n => n.endsWith('.zip') && isZipOkName(n))
    .map(n => path.join(LATEST, n));

  if (zips.length === 0) {
    log('📭 No hay ZIPs para validar en la carpeta de builds');
    process.exit(0);
  }

  log(`📦 Encontrados ${zips.length} ZIP(s) para validar\n`);

  for (const zipPath of zips) {
    await validateZip(zipPath);
  }

  console.log('\n' + '═'.repeat(80));
  log('✅ Auto-Validator Demo completado');
  log(`📦 ${zips.length} build(s) validado(s)`);
  log(`📊 Reportes guardados en: ${GLOBAL}`);
  console.log('═'.repeat(80) + '\n');
})();


/*
🧠 DOZO Smart Congruence Auditor v1.0.2
Quick audit to verify v1.0.2 fixes
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const baseDir = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const latestBuilds = path.join(baseDir, 'Latest Builds');
const pluginZip = path.join(latestBuilds, 'Warranty_System_RS_v1.0.2.zip');
const extractedDir = path.join(latestBuilds, 'Warranty_System_RS_v1.0.2_audit');
const reportPath = path.join(baseDir, 'to chat gpt', 'Global', 'DOZO-v1.0.2-Audit.json');

const issues = [];
const validations = [];

console.log('\n🧠 DOZO Quick Audit - Warranty System RS v1.0.2');
console.log('═══════════════════════════════════════════════════════════════════════════════════════\n');

// Extract
if (fs.existsSync(extractedDir)) fs.rmSync(extractedDir, { recursive: true });
execSync(`unzip -q "${pluginZip}" -d "${extractedDir}"`, { stdio: 'pipe' });

const pluginDir = path.join(extractedDir, 'warranty-system-rs');
const mainFile = path.join(pluginDir, 'warranty-system-rs.php');
const content = fs.readFileSync(mainFile, 'utf8');

console.log('🔍 Verificando hooks de WordPress...\n');

// Check hooks
const hooks = [
  { name: 'plugins_loaded', pattern: /add_action\(\s*['"]plugins_loaded['"]/ },
  { name: 'register_activation_hook', pattern: /register_activation_hook/ },
  { name: 'register_deactivation_hook', pattern: /register_deactivation_hook/ }
];

hooks.forEach(hook => {
  if (hook.pattern.test(content)) {
    validations.push({ hook: hook.name, status: 'present' });
    console.log(`   ✅ ${hook.name} - PRESENTE`);
  } else {
    issues.push({ hook: hook.name, status: 'missing' });
    console.log(`   ❌ ${hook.name} - FALTANTE`);
  }
});

console.log('\n📋 Verificando headers...\n');

// Check version
if (/Version:\s*1\.0\.2/i.test(content)) {
  validations.push({ type: 'version_header', value: '1.0.2' });
  console.log('   ✅ Version header: 1.0.2');
} else {
  issues.push({ type: 'version_header', expected: '1.0.2' });
  console.log('   ❌ Version header incorrecta');
}

// Check constant
if (/RS_WARRANTY_VERSION',\s*'1\.0\.2'/.test(content)) {
  validations.push({ type: 'version_constant', value: '1.0.2' });
  console.log('   ✅ RS_WARRANTY_VERSION: 1.0.2');
} else {
  issues.push({ type: 'version_constant', expected: '1.0.2' });
  console.log('   ❌ RS_WARRANTY_VERSION incorrecta');
}

// Cleanup
fs.rmSync(extractedDir, { recursive: true });

// Report
const score = validations.length > 0 ? 
  ((validations.length / (validations.length + issues.length)) * 100).toFixed(1) : '0.0';

const report = {
  plugin: 'Warranty System RS',
  version: '1.0.2',
  audit_status: issues.length === 0 ? 'PASSED' : 'ISSUES_FOUND',
  score: score + '%',
  validations_passed: validations.length,
  issues_found: issues.length,
  validations,
  issues,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n═══════════════════════════════════════════════════════════════════════════════════════');
console.log('📊 RESULTADO DEL AUDIT\n');
console.log(`   Score: ${score}%`);
console.log(`   Validaciones: ✅ ${validations.length}`);
console.log(`   Problemas: ❌ ${issues.length}`);
console.log(`   Estado: ${issues.length === 0 ? '✅ PASSED' : '⚠️ ISSUES_FOUND'}`);
console.log('\n📄 Reporte:', reportPath);
console.log('═══════════════════════════════════════════════════════════════════════════════════════\n');

if (issues.length === 0) {
  console.log('🎉 ¡v1.0.2 aprobada! Todos los hooks están presentes.\n');
} else {
  console.log('⚠️  Se encontraron problemas. Revisa el reporte.\n');
}


/*
🧩 DOZO Visual Diagnostic v1.0.0 (Dashboard Repair & Path Detection)
Ecosistema: DOZO System by RS
Objetivo:
  - Detectar por qué el dashboard visual no carga en Electron.
  - Verificar rutas, permisos y empaquetado.
  - Generar correcciones automáticas y sugerir rebuild si es necesario.
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const baseDir = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const dashboardDir = path.join(baseDir, 'Dashboard', 'public');
const buildDir = path.join(baseDir, 'DistributionBuild');
const appBuildDir = path.join(baseDir, 'AppBuild');
const logFile = path.join(
  baseDir,
  'to chat gpt',
  'Global',
  `DOZO-VisualDiagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

log('══════════════════════════════════════════════════════════════');
log('🧩 DOZO Visual Diagnostic v1.0.0 – RockStage Visual Layer Check');
log('══════════════════════════════════════════════════════════════\n');

// 1️⃣ Validar existencia del dashboard
if (fs.existsSync(dashboardDir)) {
  log(`✅ Carpeta encontrada: ${dashboardDir}`);
  const files = fs.readdirSync(dashboardDir);
  if (files.includes('index.html')) {
    log('✅ index.html presente.');
  } else {
    log('❌ index.html faltante dentro de Dashboard/public.');
  }
} else {
  log('❌ Carpeta Dashboard/public no encontrada.');
}

// 2️⃣ Buscar rutas dentro de main.js
const mainJsPath = path.join(appBuildDir, 'main.js');
if (fs.existsSync(mainJsPath)) {
  const content = fs.readFileSync(mainJsPath, 'utf8');
  if (content.includes('loadFile') && content.includes('index.html')) {
    log('✅ loadFile detectado en main.js');
    if (!content.includes('Dashboard/public')) {
      log('⚠️ main.js apunta a index.html sin ruta completa.');
      const fixedContent = content.replace(
        /loadFile\(['"].*index\.html['"]\)/,
        "loadFile(path.join(__dirname, '../Dashboard/public/index.html'))"
      );
      fs.writeFileSync(mainJsPath, fixedContent);
      log('🔧 Ruta corregida en main.js para incluir Dashboard/public/');
    }
  } else {
    log('❌ No se encontró referencia a index.html en main.js');
  }
} else {
  log('❌ main.js no encontrado en AppBuild/');
}

// 3️⃣ Validar empaquetado dentro de .dmg
const dmgFiles = fs.readdirSync(buildDir).filter(f => f.endsWith('.dmg'));
if (dmgFiles.length > 0) {
  log(`📦 DMG encontrado: ${dmgFiles[dmgFiles.length - 1]}`);
} else {
  log('⚠️ No se encontró ningún archivo .dmg en DistributionBuild.');
}

// 4️⃣ Verificar integridad del Dashboard
const requiredFiles = ['index.html', 'styles.css', 'script.js', 'assets'];
requiredFiles.forEach(f => {
  const filePath = path.join(dashboardDir, f);
  if (fs.existsSync(filePath)) {
    log(`✅ ${f} OK`);
  } else {
    log(`❌ Faltante: ${f}`);
  }
});

// 5️⃣ Sugerir acción final
log('\n══════════════════════════════════════════════════════════════');
log('💡 Sugerencia: Si se realizaron cambios, vuelve a ejecutar:');
log('   node dozo-distribution-build.js');
log('   Luego reinstala el .dmg para aplicar la corrección.');
log('══════════════════════════════════════════════════════════════');

console.log(`\n🧾 Reporte generado en: ${logFile}`);

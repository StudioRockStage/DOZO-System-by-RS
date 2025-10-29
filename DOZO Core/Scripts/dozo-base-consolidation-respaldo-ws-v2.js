/*
🧩 DOZO Base Consolidation v1.0.0 (Respaldo WS Source v2)
Sistema: DOZO System by RS (v7.9 DeepSync Framework)
Proyecto: Warranty System RS — Reconstrucción Base desde carpeta estable
Objetivo:
  - Usar la carpeta 'Respaldo WS/warranty system/' como fuente única.
  - Detectar y normalizar nombres de archivos principales.
  - Aplicar DeepSync Validation, limpieza, normalización, y empaquetado completo.
  - Asegurar instalación sin errores, nombre correcto y compatibilidad con actualizaciones futuras.
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// === CONFIGURACIÓN DE RUTAS ===
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const srcDirOriginal = path.resolve(HOME, 'Documents/Respaldo WS/warranty system');
const workingDir = path.join(baseDir, 'Plugins', 'Warranty System', 'warranty-system-rs');
const latestBuildsDir = path.join(baseDir, 'Latest Builds', 'Warranty System RS');
const archiveDir = path.join(baseDir, 'Archive', 'SessionLogs');
const recycleDir = path.join(baseDir, 'Backup', 'Workspace_Trash', new Date().toISOString().replace(/[:.]/g, '-'));
const toChatGPT = path.join(baseDir, 'to chat gpt');
const globalDir = path.join(toChatGPT, 'Global');

// Helpers
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
ensureDir(latestBuildsDir); ensureDir(archiveDir); ensureDir(recycleDir); ensureDir(globalDir);

const report = {
  started_at: new Date().toISOString(),
  srcDirOriginal,
  workingDir,
  actions: [],
  warnings: [],
  steps: []
};

function logStep(msg, data={}) { report.steps.push({ msg, ...data }); console.log(`\n▶ ${msg}`); }
function sha256File(file) { const h = crypto.createHash('sha256'); h.update(fs.readFileSync(file)); return h.digest('hex'); }

// === 1️⃣ Verificar carpeta fuente ===
logStep('Verificando carpeta fuente estable...');
if (!fs.existsSync(srcDirOriginal)) throw new Error('No se encontró la carpeta fuente en Respaldo WS.');

// Buscar archivo principal (puede tener nombre diferente)
const possibleMainFiles = [
  'warranty-system-rs.php',
  'rockstage-warranty-system.php',
  'warranty-system.php'
];
let mainFile = null;
for (const fname of possibleMainFiles) {
  if (fs.existsSync(path.join(srcDirOriginal, fname))) {
    mainFile = fname;
    break;
  }
}
if (!mainFile) throw new Error('No se encontró el archivo principal del plugin.');
console.log(`✓ Archivo principal detectado: ${mainFile}`);

// === 2️⃣ Copiar a directorio de trabajo ===
logStep('Copiando archivos a directorio de trabajo...');
if (fs.existsSync(workingDir)) {
  fs.rmSync(workingDir, { recursive: true, force: true });
}
ensureDir(path.dirname(workingDir));

// Copiar todo el contenido
execSync(`cp -R "${srcDirOriginal}" "${workingDir}"`, { stdio: 'inherit' });
report.actions.push({ copied_to_working: true, from: srcDirOriginal, to: workingDir });

// === 3️⃣ Renombrar archivo principal si es necesario ===
if (mainFile !== 'warranty-system-rs.php') {
  logStep(`Renombrando archivo principal: ${mainFile} → warranty-system-rs.php`);
  fs.renameSync(
    path.join(workingDir, mainFile),
    path.join(workingDir, 'warranty-system-rs.php')
  );
  report.actions.push({ renamed_main_file: { from: mainFile, to: 'warranty-system-rs.php' } });
}

// === 4️⃣ DeepSync Validation ===
logStep('Ejecutando DeepSync Validation y normalización de cabeceras');
const requiredDirs = ['admin','public','includes','templates','assets','tools'];
for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(workingDir, dir))) {
    report.warnings.push(`Falta directorio: ${dir}`);
  }
}

const phpFile = path.join(workingDir, 'warranty-system-rs.php');
let php = fs.readFileSync(phpFile, 'utf8');

// Asegurar ABSPATH guard
if (!php.includes("defined( 'ABSPATH' )")) {
  php = php.replace(/<\?php\s*/, match => `${match}\nif ( ! defined( 'ABSPATH' ) ) exit;\n`);
  report.actions.push({ added_ABSPATH: true });
}

// Normalizar cabeceras
const headers = {
  'Plugin Name': 'Warranty System RS',
  'Plugin URI': 'https://rockstage.com',
  'Description': 'Sistema completo de gestión de garantías para RockStage con verificación automática, panel de administración premium y actualizaciones automáticas.',
  'Version': '1.0.0',
  'Author': 'RockStage Solutions',
  'Author URI': 'https://rockstage.com',
  'Text Domain': 'warranty-system-rs',
  'Domain Path': '/languages',
  'Requires at least': '6.0',
  'Requires PHP': '7.4',
  'Tested up to': '6.7.1',
  'Update URI': 'https://updates.vapedot.mx/warranty-system-rs/update.json'
};

// Reemplazar o crear bloque de cabeceras
if (php.match(/\/\*\*[\s\S]*?\*\//)) {
  php = php.replace(/\/\*\*[\s\S]*?\*\//, () => {
    let block = '/**\n';
    for (const [k, v] of Object.entries(headers)) {
      block += ` * ${k}: ${v}\n`;
    }
    block += ' *\n * @package RockStage_Warranty_System\n * @version 1.0.0\n */';
    return block;
  });
} else {
  // Insertar después del <?php
  php = php.replace(/<\?php/, match => {
    let block = match + '\n/**\n';
    for (const [k, v] of Object.entries(headers)) {
      block += ` * ${k}: ${v}\n`;
    }
    block += ' *\n * @package RockStage_Warranty_System\n * @version 1.0.0\n */\n';
    return block;
  });
}

fs.writeFileSync(phpFile, php);
report.actions.push({ normalized_headers: true });

// === 5️⃣ Crear index.php si falta ===
const indexFile = path.join(workingDir, 'index.php');
if (!fs.existsSync(indexFile)) {
  logStep('Creando index.php de seguridad');
  fs.writeFileSync(indexFile, '<?php\n// Silence is golden.\n');
  report.actions.push({ created_index_php: true });
}

// === 6️⃣ Limpieza del ROOT ===
logStep('Limpieza del ROOT del plugin');
const whitelistDirs = new Set(['admin','public','includes','templates','assets','tools','languages','vendor','claude']);
const whitelistFiles = new Set(['warranty-system-rs.php','index.php','uninstall.php','readme.txt','README.txt','README.md']);
const entries = fs.readdirSync(workingDir);
const removed = [];
for (const name of entries) {
  if (name.startsWith('.')) continue; // Skip hidden files
  const fullPath = path.join(workingDir, name);
  const isDir = fs.statSync(fullPath).isDirectory();
  const ok = isDir ? whitelistDirs.has(name) : whitelistFiles.has(name);
  if (!ok) {
    ensureDir(recycleDir);
    fs.renameSync(fullPath, path.join(recycleDir, name));
    removed.push(name);
  }
}
if (removed.length) report.actions.push({ cleaned_root: removed });

// === 7️⃣ Empaquetado ZIP ===
logStep('Empaquetando versión base warranty-system-rs.zip');
const zipPath = path.join(latestBuildsDir, 'warranty-system-rs.zip');
let AdmZip;
try { AdmZip = (await import('adm-zip')).default; }
catch(e){ 
  console.log('Instalando dependencia adm-zip...');
  execSync('npm i adm-zip@0.5.10', { stdio: 'inherit' }); 
  AdmZip = (await import('adm-zip')).default; 
}

const zip = new AdmZip();
zip.addLocalFolder(workingDir, 'warranty-system-rs');
zip.writeZip(zipPath);
report.result_zip = { 
  path: zipPath, 
  size: fs.statSync(zipPath).size,
  size_human: `${Math.round(fs.statSync(zipPath).size / 1024)} KB`,
  sha256: sha256File(zipPath) 
};
console.log(`✓ ZIP creado: ${report.result_zip.size_human}`);

// Validar estructura del ZIP
const entriesZip = new AdmZip(zipPath).getEntries().map(e=>e.entryName);
if (!entriesZip.length || !entriesZip[0].startsWith('warranty-system-rs/')) {
  throw new Error('El ZIP no tiene la carpeta raíz correcta (warranty-system-rs/).');
}
console.log('✓ Estructura del ZIP validada');

// === 8️⃣ Guardar reporte ===
logStep('Guardando reporte final');
report.finished_at = new Date().toISOString();
report.status = 'SUCCESS';
report.ready_for_deployment = true;

const reportPath = path.join(globalDir, 'DOZO-Base-Consolidation-Respaldo-WS-Report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n✅ Consolidación completada con éxito.');
console.log('📦 ZIP final listo para instalación:');
console.log('   ', zipPath);
console.log('📊 Tamaño:', report.result_zip.size_human);
console.log('🔐 SHA-256:', report.result_zip.sha256);
console.log('🧾 Reporte:', reportPath);
console.log('\n🎯 Plugin listo para instalación en WordPress');


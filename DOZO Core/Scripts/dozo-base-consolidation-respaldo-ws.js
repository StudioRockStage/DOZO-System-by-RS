/*
🧩 DOZO Base Consolidation v1.0.0 (Respaldo WS Source)
Sistema: DOZO System by RS (v7.9 DeepSync Framework)
Proyecto: Warranty System RS — Reconstrucción Base desde carpeta estable
Objetivo:
  - Usar la carpeta 'Respaldo WS/warranty system/' como fuente única.
  - Aplicar DeepSync Validation, limpieza, normalización, y empaquetado completo.
  - Asegurar instalación sin errores, nombre correcto y compatibilidad con actualizaciones futuras.
  - Mantener estructura coherente con WordPress y flujo DOZO.
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// === CONFIGURACIÓN DE RUTAS ===
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const srcDir = path.resolve(HOME, 'Documents/Respaldo WS/warranty system');
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
  srcDir,
  actions: [],
  warnings: [],
  steps: []
};

function logStep(msg, data={}) { report.steps.push({ msg, ...data }); console.log(`▶ ${msg}`); }
function sha256File(file) { const h = crypto.createHash('sha256'); h.update(fs.readFileSync(file)); return h.digest('hex'); }

// === 1️⃣ Verificar carpeta fuente ===
logStep('Verificando carpeta fuente estable...');
if (!fs.existsSync(srcDir)) throw new Error('No se encontró la carpeta fuente en Respaldo WS.');
if (!fs.existsSync(path.join(srcDir, 'warranty-system-rs.php'))) throw new Error('Falta el archivo principal warranty-system-rs.php.');

// === 2️⃣ DeepSync Validation ===
logStep('Ejecutando DeepSync Validation y normalización básica');
const requiredDirs = ['admin','public','includes','templates','assets','tools'];
for (const dir of requiredDirs) if (!fs.existsSync(path.join(srcDir, dir))) report.warnings.push(`Falta directorio: ${dir}`);

const phpFile = path.join(srcDir, 'warranty-system-rs.php');
let php = fs.readFileSync(phpFile, 'utf8');
if (!php.includes("if ( ! defined( 'ABSPATH' ) ) exit;")) {
  php = php.replace(/<\?php\s*/, match => `${match}\nif ( ! defined( 'ABSPATH' ) ) exit;\n`);
  report.actions.push({ added_ABSPATH: true });
}
if (!php.includes('Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json')) {
  php = php.replace(/(Text Domain:[^\n]*)/, `$1\n * Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json`);
  report.actions.push({ added_UpdateURI: true });
}
fs.writeFileSync(phpFile, php);

// === 3️⃣ Limpieza del ROOT ===
logStep('Limpieza del ROOT del plugin');
const whitelistDirs = new Set(['admin','public','includes','templates','assets','tools','languages']);
const whitelistFiles = new Set(['warranty-system-rs.php','index.php','uninstall.php','readme.txt','README.txt']);
const entries = fs.readdirSync(srcDir);
for (const name of entries) {
  const fullPath = path.join(srcDir, name);
  const isDir = fs.statSync(fullPath).isDirectory();
  const ok = isDir ? whitelistDirs.has(name) : whitelistFiles.has(name);
  if (!ok) {
    ensureDir(recycleDir);
    fs.renameSync(fullPath, path.join(recycleDir, name));
  }
}
report.actions.push({ cleaned_root: true });

// === 4️⃣ Empaquetado ZIP ===
logStep('Empaquetando versión base warranty-system-rs.zip');
const zipPath = path.join(latestBuildsDir, 'warranty-system-rs.zip');
let AdmZip;
try { AdmZip = (await import('adm-zip')).default; }
catch(e){ execSync('npm i adm-zip@0.5.10', { stdio: 'inherit' }); AdmZip = (await import('adm-zip')).default; }

const zip = new AdmZip();
zip.addLocalFolder(srcDir, 'warranty-system-rs');
zip.writeZip(zipPath);
report.result_zip = { path: zipPath, size: fs.statSync(zipPath).size, sha256: sha256File(zipPath) };

// === 5️⃣ Limpieza general post proceso ===
logStep('Limpieza general de archivos sueltos y rotación segura');
const trashDir = path.join(baseDir, 'Archive', 'Trash');
ensureDir(trashDir);
if (fs.existsSync(toChatGPT)) {
  const items = fs.readdirSync(toChatGPT).filter(n=>n!=='Global');
  for (const n of items) fs.renameSync(path.join(toChatGPT, n), path.join(trashDir, `${Date.now()}_${n}`));
}

// === 6️⃣ Guardar reporte ===
logStep('Guardando reporte final');
const reportPath = path.join(globalDir, 'DOZO-Base-Consolidation-Report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n✅ Consolidación completada con éxito.');
console.log('📦 ZIP final listo para instalación: ', zipPath);
console.log('🧾 Reporte generado en: ', reportPath);


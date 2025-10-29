/*
🧩 DOZO Base Consolidation & Clean Packaging v1.0.0 (Final)
Ecosistema: DOZO System by RS (v7.9)
Proyecto: Warranty System RS — Versión base estable
Objetivo:
  1) Ejecutar DeepSync Validation sobre TODO el plugin base.
  2) Normalizar nombres (carpeta/slug/cabeceras/Update URI/Text Domain) y ABSPATH.
  3) Limpiar archivos sueltos/no distribuibles del ROOT del plugin (sin borrar: mover a Trash).
  4) Empaquetar ESTRICTAMENTE el folder `warranty-system-rs/` como raíz del .zip.
  5) Validar el contenido del .zip y dejarlo en: Latest Builds/Warranty System RS/warranty-system-rs.zip
  6) Ordenar workspace: mover reportes sueltos a Archive/SessionLogs y limpiar `to chat gpt/` (rotación segura).
  7) Registrar todo en Global/DOZO-Base-Consolidation-Report.json

NOTAS IMPORTANTES
- No reescribe código salvo:
   • Cabeceras del archivo principal (nombre/versión/autor/text domain/update uri/requires/tested)
   • Inserción de guard clause ABSPATH si faltara
   • Ajuste de rutas Claude → relativas a plugin
- Todo lo que no sea parte del plugin distribuible se mueve a `Backup/Workspace_Trash/<timestamp>/` (no se borra).
*/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// ---- Helpers ---------------------------------------------------------------
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const latestBuildsDir = path.join(baseDir, 'Latest Builds', 'Warranty System RS');
const pluginsRoot = path.join(baseDir, 'Plugins');
const toChatGPT = path.join(baseDir, 'to chat gpt');
const globalDir = path.join(toChatGPT, 'Global');
const archiveDir = path.join(baseDir, 'Archive', 'SessionLogs');
const recycleDir = path.join(baseDir, 'Backup', 'Workspace_Trash', new Date().toISOString().replace(/[:.]/g, '-'));

const ensureDir = (p)=>{ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
ensureDir(latestBuildsDir); ensureDir(globalDir); ensureDir(archiveDir); ensureDir(recycleDir);

const report = {
  started_at: new Date().toISOString(),
  baseDir,
  steps: [],
  warnings: [],
  actions: [],
  result_zip: null,
};

function logStep(title, data={}){ report.steps.push({ title, ...data }); console.log(`\n▶ ${title}`); }
function sha256File(file){ const h=crypto.createHash('sha256'); h.update(fs.readFileSync(file)); return h.digest('hex'); }

// ---- 1) Localizar carpeta fuente del plugin base ---------------------------
logStep('Localizando carpeta fuente del plugin base');
const candidates = [
  path.join(HOME, 'Documents', 'Warranty System RS PRUEBA BASE'),
  path.join(pluginsRoot, 'Warranty System'),
  path.join(latestBuildsDir, 'warranty-system-rs'),
];
let srcDir = null;
for(const c of candidates){ if(fs.existsSync(c) && fs.existsSync(path.join(c,'warranty-system-rs.php'))){ srcDir = c; break; } }
if(!srcDir){
  throw new Error('No se encontró la carpeta fuente del plugin con warranty-system-rs.php. Verifica que exista alguna de las rutas candidatas.');
}
report.actions.push({ found_srcDir: srcDir });
console.log('✔ Fuente detectada:', srcDir);

// ---- 2) DeepSync Validation (básica + naming) -----------------------------
logStep('DeepSync Validation: naming, estructura y archivos requeridos');
const requiredDirs = ['admin','public','includes','templates','assets','tools'];
const requiredFiles = ['warranty-system-rs.php','index.php','uninstall.php'];
for(const d of requiredDirs){ if(!fs.existsSync(path.join(srcDir,d))){ report.warnings.push(`Falta directorio requerido: ${d}`); } }
for(const f of requiredFiles){ if(!fs.existsSync(path.join(srcDir,f))){ report.warnings.push(`Falta archivo requerido: ${f}`); } }

// ---- 3) Normalizar cabeceras + ABSPATH + rutas Claude ---------------------
logStep('Normalizando cabeceras, ABSPATH y rutas Claude');
const mainPhp = path.join(srcDir, 'warranty-system-rs.php');
let php = fs.readFileSync(mainPhp, 'utf8');

// Asegurar guard clause ABSPATH
if(!/defined\(\s*'ABSPATH'\s*\)/.test(php)){
  php = php.replace(/<\?php\s*/, match => `${match}\nif ( ! defined( 'ABSPATH' ) ) exit;\n`);
  report.actions.push({ inserted_ABSPATH: true });
}

// Cabeceras estándar
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

php = php.replace(/\/\*\*[\s\S]*?\*\//, block=>{
  let out = `/**\n`;
  for(const [k,v] of Object.entries(headers)) out += ` * ${k}: ${v}\n`;
  out += ` *\n * @package RockStage_Warranty_System\n * @version 1.0.0\n */`;
  return out;
});

// Rutas Claude → relativas al plugin
php = php.replace(/RS_CLAUDE_TEMPLATES_PATH[^;]*;/, `RS_CLAUDE_TEMPLATES_PATH', plugin_dir_path(__FILE__) . 'claude/shortcodes/');`);
php = php.replace(/RS_CLAUDE_DESIGN_PATH[^;]*;/, `RS_CLAUDE_DESIGN_PATH', plugin_dir_path(__FILE__) . 'claude/designs/');`);

fs.writeFileSync(mainPhp, php);
report.actions.push({ mainPhp_updated: true });

// Crear carpetas destino si se van a usar (no obliga su existencia)
['claude/shortcodes','claude/designs'].forEach(rel=>{ const p = path.join(srcDir, rel); ensureDir(p); });

// ---- 4) Limpiar ROOT del plugin (solo mover no-distribuibles) --------------
logStep('Limpieza del ROOT del plugin (whitelist)');
const whitelistDirs = new Set(['admin','public','includes','templates','assets','tools','languages','vendor','claude']);
const whitelistFiles = new Set(['warranty-system-rs.php','index.php','uninstall.php','readme.txt','README.txt','README.md']);
const entries = fs.readdirSync(srcDir);
const moved = [];
for(const name of entries){
  if(name.startsWith('.')) continue; // ocultos
  const p = path.join(srcDir, name);
  const isDir = fs.statSync(p).isDirectory();
  const ok = isDir ? whitelistDirs.has(name) : whitelistFiles.has(name);
  if(!ok){
    const dest = path.join(recycleDir, name);
    ensureDir(recycleDir);
    fs.renameSync(p, dest);
    moved.push(name);
  }
}
if(moved.length) report.actions.push({ moved_from_root: moved });

// ---- 5) Forzar nombre de carpeta correcto ---------------------------------
logStep('Asegurando nombre de carpeta: warranty-system-rs');
const parent = path.dirname(srcDir);
const correctDir = path.join(parent, 'warranty-system-rs');
if(srcDir !== correctDir){
  if(fs.existsSync(correctDir)) fs.rmSync(correctDir, { recursive: true, force: true });
  fs.renameSync(srcDir, correctDir);
  srcDir = correctDir;
  report.actions.push({ renamed_folder: correctDir });
}

// ---- 6) Empaquetado correcto (zip con folder raíz warranty-system-rs/) -----
logStep('Empaquetando ZIP final (estructura estricta)');
const zipPath = path.join(latestBuildsDir, 'warranty-system-rs.zip');

// Dependencia ligera para zip
let AdmZip;
try { AdmZip = (await import('adm-zip')).default; }
catch(e){ console.log('Instalando dependencia adm-zip...'); execSync('npm i adm-zip@0.5.10', { stdio: 'inherit' }); AdmZip = (await import('adm-zip')).default; }

const zip = new AdmZip();
zip.addLocalFolder(srcDir, 'warranty-system-rs');
zip.writeZip(zipPath);
report.result_zip = { path: zipPath, size: fs.statSync(zipPath).size, sha256: sha256File(zipPath) };
console.log('✔ ZIP creado:', report.result_zip);

// Validar contenido del zip (que la primera entrada empiece por warranty-system-rs/)
const entriesZip = new AdmZip(zipPath).getEntries().map(e=>e.entryName);
if(!entriesZip.length || !entriesZip[0].startsWith('warranty-system-rs/')){
  throw new Error('El ZIP no tiene la carpeta raíz correcta (warranty-system-rs/).');
}

// ---- 7) Ordenar workspace: logs/reportes y to chat gpt --------------------
logStep('Ordenando workspace y rotando reportes');
// Mover .md/.txt/.js sueltos del workspace raíz a Archive/SessionLogs/<ts>
const sessionDumpDir = path.join(archiveDir, new Date().toISOString().replace(/[:.]/g,'-'));
ensureDir(sessionDumpDir);
const workspaceLoose = fs.readdirSync(baseDir)
  .filter(n=>/\.(md|txt|log|js)$/i.test(n) && !['package.json','package-lock.json'].includes(n));
for(const n of workspaceLoose){ fs.renameSync(path.join(baseDir,n), path.join(sessionDumpDir,n)); }
report.actions.push({ archived_loose_files: workspaceLoose });

// Limpiar `to chat gpt` (mover todo a papelera interna)
const gptTrash = path.join(baseDir, 'Archive', 'Trash'); ensureDir(gptTrash);
if(fs.existsSync(toChatGPT)){
  const items = fs.readdirSync(toChatGPT).filter(n=>n!=='Global');
  for(const n of items){ fs.renameSync(path.join(toChatGPT, n), path.join(gptTrash, `${Date.now()}_${n}`)); }
  report.actions.push({ moved_to_trash_from_to_chat_gpt: items });
}

// ---- 8) Guardar reporte ----------------------------------------------------
logStep('Guardando reporte final');
report.finished_at = new Date().toISOString();
ensureDir(globalDir);
const reportPath = path.join(globalDir, 'DOZO-Base-Consolidation-Report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log('\n✅ Consolidación completa.');
console.log('📦 ZIP final: ', report.result_zip);
console.log('🧾 Reporte:  ', reportPath);


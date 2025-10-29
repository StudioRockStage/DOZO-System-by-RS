/*
🧩 Prompt Maestro – DOZO Phase 12 Auto-Recovery (v7.7.7)
Ecosistema: DOZO System by RS
Plugin: Warranty System RS
Objetivo: Detectar, reconstruir y ejecutar automáticamente el script dozo-phase12-sync.js faltante, restaurando el flujo de deploy completo.
*/

import fs from 'fs';
import path from 'path';
import ftp from 'basic-ftp';
import { execSync } from 'child_process';

const BASE = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const WORKFLOW = path.join(BASE, 'Workflow DB');
const GLOBAL = path.join(BASE, 'to chat gpt/Global');
const READY = path.join(BASE, 'Empaquetado/Ready');
const LOGFILE = path.join(GLOBAL, 'DOZO-Phase12-Recovery.json');

const CONFIG = {
  host: '82.29.86.182',
  user: 'u461169968',
  password: ':oU33+oTQBRWFG:g',
  port: 21,
  remoteDir: '/public_html/updates/warranty-system/',
  zipFile: 'Warranty_System_v7.7.7.zip',
  jsonFile: 'update.json',
};

function log(entry) {
  const prev = fs.existsSync(LOGFILE) ? JSON.parse(fs.readFileSync(LOGFILE, 'utf8')) : [];
  prev.push({ ts: new Date().toISOString(), ...entry });
  fs.writeFileSync(LOGFILE, JSON.stringify(prev, null, 2));
}

function ensureFileStructure() {
  if (!fs.existsSync(WORKFLOW)) fs.mkdirSync(WORKFLOW, { recursive: true });
  if (!fs.existsSync(GLOBAL)) fs.mkdirSync(GLOBAL, { recursive: true });
  if (!fs.existsSync(READY)) fs.mkdirSync(READY, { recursive: true });
}

function recreatePhase12() {
  const target = path.join(WORKFLOW, 'dozo-phase12-sync.js');
  const content = `
import fs from 'fs';
import path from 'path';
import ftp from 'basic-ftp';

const READY = path.resolve(process.env.HOME, 'Documents/DOZO System by RS/Empaquetado/Ready');

const CONFIG = ${JSON.stringify(CONFIG, null, 2)};

async function deploy() {
  console.log('🚀 Ejecutando Phase 12 Sync...');
  const zipPath = path.join(READY, CONFIG.zipFile);
  const jsonPath = path.join(READY, CONFIG.jsonFile);
  const client = new ftp.Client(30000);

  try {
    await client.access({ host: CONFIG.host, user: CONFIG.user, password: CONFIG.password, port: CONFIG.port, secure: false });
    await client.ensureDir(CONFIG.remoteDir);
    await client.cd(CONFIG.remoteDir);

    if (fs.existsSync(zipPath)) {
      await client.uploadFrom(zipPath, CONFIG.zipFile);
      console.log('⬆️ ZIP subido con éxito');
    } else {
      console.warn('⚠️ ZIP no encontrado en Ready/');
    }

    if (fs.existsSync(jsonPath)) {
      await client.uploadFrom(jsonPath, CONFIG.jsonFile);
      console.log('🧾 update.json subido con éxito');
    } else {
      console.warn('⚠️ update.json no encontrado en Ready/');
    }

    console.log('✅ Deploy completado');
  } catch (err) {
    console.error('❌ Error en el deploy:', err.message);
  } finally {
    client.close();
  }
}

deploy();
`;
  fs.writeFileSync(target, content);
  console.log('🧩 Archivo reconstruido:', target);
  log({ step: 'recreate-phase12', ok: true, file: target });
}

function validateDependencies() {
  try {
    execSync('npm install basic-ftp', { stdio: 'inherit' });
    log({ step: 'validate-deps', ok: true });
  } catch (err) {
    log({ step: 'validate-deps', ok: false, error: err.message });
  }
}

(async () => {
  console.log('\n🔍 DOZO Phase 12 Auto-Recovery (v7.7.7)');
  console.log('══════════════════════════════════════════════════════════════════════');

  ensureFileStructure();
  recreatePhase12();
  validateDependencies();

  try {
    console.log('▶️ Ejecutando script de deploy restaurado...');
    execSync('node dozo-phase12-sync.js', { cwd: WORKFLOW, stdio: 'inherit' });
    log({ step: 'execute-phase12', ok: true });
  } catch (err) {
    console.error('❌ Error ejecutando dozo-phase12-sync.js:', err.message);
    log({ step: 'execute-phase12', ok: false, error: err.message });
  }

  console.log('\n✅ Recuperación de Fase 12 completada.');
  console.log('══════════════════════════════════════════════════════════════════════');
})();


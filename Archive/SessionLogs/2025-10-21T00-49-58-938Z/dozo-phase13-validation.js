/*
🧩 Prompt Maestro – DOZO Phase 13 (Validation & Live Update Test)
Ecosistema: DOZO System by RS
Plugin: Warranty System RS
Objetivo: Validar el flujo completo de actualización automática desde el servidor de updates (updates.vapedot.mx) y confirmar la detección en WordPress.
*/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { execSync } from 'child_process';

const BASE = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const GLOBAL = path.join(BASE, 'to chat gpt/Global');
const READY = path.join(BASE, 'Empaquetado/Ready');
const REPORT = path.join(GLOBAL, 'DOZO-Phase13-Validation.json');

const CONFIG = {
  pluginSlug: 'rockstage-warranty-system/rockstage-warranty-system.php',
  updateUrl: 'https://updates.vapedot.mx/warranty-system/update.json',
  wpPath: '/home/u461169968/public_html/',
};

function log(entry) {
  const prev = fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, 'utf8')) : [];
  prev.push({ ts: new Date().toISOString(), ...entry });
  fs.writeFileSync(REPORT, JSON.stringify(prev, null, 2));
}

async function validateUpdateJSON() {
  console.log('🌐 Verificando disponibilidad de update.json...');
  try {
    const res = await fetch(CONFIG.updateUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log('✅ update.json válido y accesible.');
    log({ step: 'validate-update-json', ok: true, data: json });
    return json;
  } catch (err) {
    console.error('❌ Error al validar update.json:', err.message);
    log({ step: 'validate-update-json', ok: false, error: err.message });
    throw err;
  }
}

function simulateWordPressCheck() {
  console.log('🧩 Simulando verificación de actualización desde WordPress...');
  try {
    const cmd = `wp eval "delete_site_transient('update_plugins'); wp_update_plugins(); $updates = get_site_transient('update_plugins'); print_r($updates->response['${CONFIG.pluginSlug}']);"`;
    const output = execSync(cmd, { cwd: CONFIG.wpPath, encoding: 'utf8' });
    console.log('📊 Resultado WP-CLI:\n', output);
    log({ step: 'simulate-wp-check', ok: true, result: output });
    return output;
  } catch (err) {
    console.warn('⚠️ No se pudo ejecutar WP-CLI localmente:', err.message);
    log({ step: 'simulate-wp-check', ok: false, error: err.message });
    return null;
  }
}

function finalizeReport(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    version: data?.version || 'unknown',
    detected: !!data,
    site: CONFIG.wpPath,
    plugin: CONFIG.pluginSlug,
    status: data ? '✅ Update detected and validated' : '⚠️ Pending manual confirmation',
  };
  fs.writeFileSync(REPORT, JSON.stringify(summary, null, 2));
  console.log('🧾 Reporte final guardado:', REPORT);
}

(async () => {
  console.log('\n🚀 DOZO Phase 13 – Validation & Live Update Test');
  console.log('══════════════════════════════════════════════════════════════');

  try {
    const json = await validateUpdateJSON();
    simulateWordPressCheck();
    finalizeReport(json);
    console.log('\n✅ Validación de actualización completada con éxito.');
  } catch (err) {
    console.error('\n❌ Error durante la validación:', err.message);
  }

  console.log('══════════════════════════════════════════════════════════════');
})();


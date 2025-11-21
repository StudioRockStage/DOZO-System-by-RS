/*
🧩 DOZO Base Consolidation & Naming Integrity (Warranty System RS – v1 Base)
Sistema: DOZO System by RockStage
Autor: RockStage Solutions
Fase: Consolidación definitiva de la versión base
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

const HOME = os.homedir();
const BASE = path.join(HOME, 'Documents/DOZO System by RS');
const LATEST = path.join(BASE, 'Latest Builds', 'Warranty System RS');
const READY = path.join(BASE, 'Empaquetado', 'Ready');
const GLOBAL = path.join(BASE, 'to chat gpt', 'Global');

const TARGET_ZIP = 'warranty-system-rs.zip';
const TARGET_FOLDER = 'warranty-system-rs';
const TARGET_MAIN = 'warranty-system-rs.php';

const REPORT = path.join(GLOBAL, 'DOZO-BaseConsolidation-Report.json');

const PLUGIN_NAME = 'Warranty System RS';
const AUTHOR = 'RockStage Solutions';
const VERSION = '1.0.0';
const TEXT_DOMAIN = 'warranty-system-rs';

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function ensureDirs() {
  [LATEST, READY, GLOBAL].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function findBaseCandidate() {
  const zips = fs.readdirSync(LATEST).filter(f => f.endsWith('.zip'));
  const match = zips.find(z => /warranty[-_]system[-_]rs/i.test(z));
  if (!match)
    throw new Error('No se encontró ningún archivo ZIP base en Latest Builds.');
  return path.join(LATEST, match);
}

function unzipToTemp(zipPath) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dozo-basefix-'));
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(tmp, true);
  return tmp;
}

function normalizeRoot(tmpDir) {
  const items = fs.readdirSync(tmpDir);
  const hasRoot =
    items.length === 1 &&
    fs.statSync(path.join(tmpDir, items[0])).isDirectory();
  const root = hasRoot ? path.join(tmpDir, items[0]) : tmpDir;
  const fixed = path.join(tmpDir, TARGET_FOLDER);
  if (path.basename(root) !== TARGET_FOLDER) {
    if (fs.existsSync(fixed))
      fs.rmSync(fixed, { recursive: true, force: true });
    fs.renameSync(root, fixed);
  }
  return fixed;
}

function findMainPhp(root) {
  const phpFiles = fs.readdirSync(root).filter(f => f.endsWith('.php'));
  const main =
    phpFiles.find(f => f.includes('warranty') || f.includes('rockstage')) ||
    phpFiles[0];
  const mainPath = path.join(root, main);
  if (path.basename(mainPath) !== TARGET_MAIN) {
    fs.renameSync(mainPath, path.join(root, TARGET_MAIN));
  }
  return path.join(root, TARGET_MAIN);
}

function patchHeaders(mainPhp) {
  let content = fs.readFileSync(mainPhp, 'utf8');
  const headers = {
    'Plugin Name': PLUGIN_NAME,
    Author: AUTHOR,
    Version: VERSION,
    'Text Domain': TEXT_DOMAIN,
    'Requires at least': '6.0',
    'Requires PHP': '7.4',
  };
  for (const [key, val] of Object.entries(headers)) {
    const regex = new RegExp(`^\\s*\\*\\s*${key}\\s*:.*$`, 'mi');
    if (regex.test(content)) {
      content = content.replace(regex, ` * ${key}: ${val}`);
    } else {
      content = content.replace('/**', `/**\n * ${key}: ${val}`);
    }
  }
  fs.writeFileSync(mainPhp, content, 'utf8');
}

function rezip(root) {
  const zip = new AdmZip();
  const baseDir = path.dirname(root);
  function addRecursive(src, rel = '') {
    const items = fs.readdirSync(src);
    for (const it of items) {
      const full = path.join(src, it);
      const relPath = path.join(rel, it);
      if (fs.statSync(full).isDirectory()) addRecursive(full, relPath);
      else zip.addLocalFile(full, rel);
    }
  }
  addRecursive(root, TARGET_FOLDER);
  const finalZip = path.join(LATEST, TARGET_ZIP);
  zip.writeZip(finalZip);
  return finalZip;
}

function cleanOldVersions() {
  const zips = fs.readdirSync(LATEST).filter(f => f.endsWith('.zip'));
  for (const z of zips) {
    if (z !== TARGET_ZIP) fs.rmSync(path.join(LATEST, z), { force: true });
  }
  if (fs.existsSync(READY)) {
    fs.readdirSync(READY).forEach(f => {
      if (f.endsWith('.zip')) fs.rmSync(path.join(READY, f), { force: true });
    });
  }
}

(async () => {
  ensureDirs();
  const report = {
    timestamp: new Date().toISOString(),
    status: 'pending',
    zipCreated: null,
    checksum: null,
    cleaned: [],
    notes: [],
  };

  try {
    const baseZip = findBaseCandidate();
    const tmp = unzipToTemp(baseZip);
    const root = normalizeRoot(tmp);
    const mainPhp = findMainPhp(root);
    patchHeaders(mainPhp);

    const newZip = rezip(root);
    const hash = sha256(newZip);
    cleanOldVersions();

    report.status = 'success';
    report.zipCreated = newZip;
    report.checksum = hash;
    report.notes.push('Base consolidada correctamente: warranty-system-rs.zip');
    report.notes.push(
      'Se eliminaron versiones antiguas y se corrigieron nomenclaturas.'
    );
  } catch (err) {
    report.status = 'error';
    report.error = err.message;
  } finally {
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log('🧾 Reporte generado:', REPORT);
  }
})();

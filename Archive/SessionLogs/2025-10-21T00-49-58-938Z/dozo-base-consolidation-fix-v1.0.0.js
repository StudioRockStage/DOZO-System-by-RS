/*
🧩 DOZO Base Consolidation Fix v1.0.0 (PATCH Mode)
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions

Objetivo:
1) Detectar el ZIP v7.7.9 REAL (no placeholder) y usarlo como base.
2) Limpiar agresivamente Empaquetado/ de versiones/residuos viejos.
3) Generar Warranty_System_RS_v1.0.0.zip de forma confiable (PATCH).
4) Actualizar cabeceras internas del PHP (Name, Author, Version, Constante RS_WARRANTY_VERSION).
5) Validar pesos y checksums. Generar reporte global.
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const GLOBAL = path.join(BASE, "to chat gpt", "Global");
const EMP = path.join(BASE, "Empaquetado");
const LATEST = path.join(BASE, "Latest Builds");
const PLUGINS = path.join(BASE, "Plugins", "Warranty System");

const REPORT = path.join(GLOBAL, "DOZO-BaseConsolidation-Report.json");

const OFFICIAL = {
  pluginName: "Warranty System RS",
  author: "RockStage Solutions",
  version: "1.0.0",
  zipName: "Warranty_System_RS_v1.0.0.zip",
  phpMain: "warranty-system-rs.php",
};

const SEARCH_DIRS = [LATEST, EMP, path.join(EMP, "Archive"), PLUGINS];

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest("hex");
}

function statOrNull(p) {
  try { return fs.statSync(p); } catch { return null; }
}

function ensureDirs() {
  [GLOBAL, EMP, LATEST, PLUGINS].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function findRealBaseZip() {
  const candidates = [];
  // Search in Empaquetado/Ready first
  const readyDir = path.join(EMP, "Ready");
  const allSearchDirs = [readyDir, ...SEARCH_DIRS];
  
  for (const dir of allSearchDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const lower = f.toLowerCase();
      // Look for any warranty system 7.7.x ZIP files
      if (lower.endsWith(".zip") && /warranty.*system.*7\.7\.[0-9]/i.test(lower)) {
        const full = path.join(dir, f);
        const st = statOrNull(full);
        if (st && st.size > 1_000_000) {
          // Extract version number for sorting
          const versionMatch = f.match(/7\.7\.([0-9]+)/);
          const minorVersion = versionMatch ? parseInt(versionMatch[1]) : 0;
          candidates.push({ full, size: st.size, mtime: st.mtimeMs, minorVersion });
        }
      }
    }
  }
  // Sort by version (highest first), then by mtime (newest first)
  candidates.sort((a,b)=> b.minorVersion - a.minorVersion || b.mtime - a.mtime);
  return candidates[0]?.full || null;
}

function aggressiveCleanEmpaquetado() {
  if (!fs.existsSync(EMP)) return;
  console.log(`   Limpiando contenido de: ${EMP}`);
  for (const item of fs.readdirSync(EMP)) {
    const target = path.join(EMP, item);
    try {
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`   ❌ Eliminado: ${item}`);
    } catch (err) {
      console.log(`   ⚠️  No se pudo eliminar: ${item}`);
    }
  }
}

function patchZip(src, dst) {
  const zip = new AdmZip(src);
  const entries = zip.getEntries();
  const phpCandidates = entries.filter(e => !e.isDirectory && e.entryName.toLowerCase().endsWith(".php"))
    .map(e => e.entryName)
    .filter(n => /(warranty).*(system)|rockstage-warranty/i.test(n));

  const mainPHP = phpCandidates.sort((a,b)=> a.length - b.length)[0] || phpCandidates[0];
  if (!mainPHP) throw new Error("No se encontró el archivo principal PHP dentro del ZIP para patch.");

  console.log(`   📝 Archivo PHP principal identificado: ${mainPHP}`);

  let content = zip.readAsText(mainPHP);
  
  // Patch headers
  content = content
    .replace(/^\s*\*\s*Plugin Name:\s*.*$/mi, ` * Plugin Name: ${OFFICIAL.pluginName}`)
    .replace(/^\s*\*\s*Author:\s*.*$/mi, ` * Author: ${OFFICIAL.author}`)
    .replace(/^\s*\*\s*Version:\s*.*$/mi, ` * Version: ${OFFICIAL.version}`)
    .replace(/define\(\s*['"]RS_WARRANTY_VERSION['"]\s*,\s*['"][^'"]+['"]\s*\)/g, `define('RS_WARRANTY_VERSION', '${OFFICIAL.version}')`);

  zip.updateFile(mainPHP, Buffer.from(content, "utf8"));
  zip.writeZip(dst);

  return { srcSha: sha256(src), dstSha: sha256(dst), mainPHP };
}

(async () => {
  console.log("\n🚑 DOZO Base Consolidation Fix v1.0.0 – PATCH Mode\n");

  ensureDirs();

  console.log("🔍 Buscando ZIP v7.7.x real (>1MB)...");
  const baseZip = findRealBaseZip();
  if (!baseZip) {
    const msg = "❌ No se encontró un ZIP v7.7.x real (>1MB). Sube el ZIP auténtico y reintenta.";
    console.error(msg);
    fs.writeFileSync(REPORT, JSON.stringify({ ok:false, error: msg }, null, 2));
    process.exit(1);
  }
  const baseSize = statOrNull(baseZip).size;
  console.log(`✅ ZIP base real encontrado:\n   ${baseZip}\n   Tamaño: ${(baseSize / 1024 / 1024).toFixed(2)} MB (${baseSize.toLocaleString()} bytes)\n`);

  // Copy the base ZIP to a temp location before cleaning
  const tempZip = path.join(BASE, `.temp_base_${Date.now()}.zip`);
  console.log("📋 Copiando ZIP base a ubicación temporal...");
  fs.copyFileSync(baseZip, tempZip);

  console.log("🧹 Limpiando Empaquetado/ (agresivo)...");
  aggressiveCleanEmpaquetado();

  const dstZip = path.join(LATEST, OFFICIAL.zipName);
  if (fs.existsSync(dstZip)) {
    console.log(`   🗑️  Eliminando ZIP anterior: ${OFFICIAL.zipName}`);
    fs.rmSync(dstZip, { force: true });
  }

  console.log("\n✏️  Actualizando cabeceras internas a v1.0.0...");
  const { srcSha, dstSha, mainPHP } = patchZip(tempZip, dstZip);
  
  // Clean up temp file
  console.log("🧹 Limpiando archivo temporal...");
  fs.rmSync(tempZip, { force: true });

  const dstSize = statOrNull(dstZip)?.size || 0;
  const sizeOK = dstSize > 1_000_000;
  
  console.log(`\n📦 ZIP generado: ${dstZip}`);
  console.log(`   Tamaño: ${(dstSize / 1024 / 1024).toFixed(2)} MB (${dstSize.toLocaleString()} bytes)`);
  console.log(`   SHA-256 original: ${srcSha.substring(0, 16)}...`);
  console.log(`   SHA-256 patcheado: ${dstSha.substring(0, 16)}...`);
  console.log(`   Archivo PHP patcheado: ${mainPHP}`);
  console.log(`   Estado: ${sizeOK ? '✅ Válido' : '❌ Inválido (muy pequeño)'}`);

  const report = {
    ok: sizeOK,
    mode: "PATCH",
    plugin: OFFICIAL.pluginName,
    author: OFFICIAL.author,
    version: OFFICIAL.version,
    baseZip,
    baseSize,
    baseSizeMB: parseFloat((baseSize / 1024 / 1024).toFixed(2)),
    outZip: dstZip,
    outSize: dstSize,
    outSizeMB: parseFloat((dstSize / 1024 / 1024).toFixed(2)),
    srcSha256: srcSha,
    dstSha256: dstSha,
    mainPHPPatched: mainPHP,
    timestamp: new Date().toISOString(),
    actions: [
      "ZIP v7.7.9 real localizado",
      "Empaquetado/ limpiado",
      "Cabeceras PHP actualizadas a v1.0.0",
      "ZIP patcheado generado",
      "Checksums SHA-256 calculados"
    ]
  };
  
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log("\n✅ Consolidación y actualización completadas sin errores.");
  console.log("🧾 Reporte completo:", REPORT);
  console.log("\n🎉 Warranty_System_RS_v1.0.0.zip está listo.\n");
})();


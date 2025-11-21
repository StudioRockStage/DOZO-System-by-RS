/*
 * DOZO Auto-Validator for New Builds v1.0.0 (Watch & Verify)
 * Sistema: DOZO System by RS (v7.9)
 * Proyecto: Warranty System RS
 *
 * Este script observa la carpeta "Latest Builds/Warranty System RS" y ejecuta
 * automáticamente todas las validaciones cuando detecta un nuevo ZIP.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

// ---------- CONFIG ----------
const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE = path.resolve(HOME, "Documents/DOZO System by RS");
const LATEST = path.join(BASE, "Latest Builds", "Warranty System RS");
const GLOBAL = path.join(BASE, "to chat gpt", "Global");

// Rutas de validadores existentes
const VALIDATORS = {
  wpCompliance: path.join(BASE, "dozo-wordpress-compliance-check.js"),
  channelCheck: path.join(BASE, "dozo-update-channel-validation-extended.js"),
  channelRecheck: path.join(BASE, "dozo-update-channel-recheck.js"),
  verify: path.join(BASE, "verify-base-consolidation.sh"),
};

// Estado para evitar validaciones duplicadas
const processedFiles = new Map(); // filepath -> sha256

// ---------- UTILS ----------
const log = (...a) =>
  console.log("[DOZO-WATCH]", new Date().toLocaleTimeString(), ...a);
const ensureDir = (p) =>
  fs.existsSync(p) || fs.mkdirSync(p, { recursive: true });
const sha256 = (f) =>
  crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

function runNode(script, label = "") {
  if (!fs.existsSync(script)) {
    log(`⚠ Script no encontrado: ${path.basename(script)}`);
    return false;
  }
  try {
    log(`▶ Ejecutando: ${label || path.basename(script)}`);
    execSync(`node "${script}"`, {
      stdio: "inherit",
      cwd: BASE,
    });
    return true;
  } catch (err) {
    log(`✗ Error ejecutando ${path.basename(script)}:`, err.message);
    return false;
  }
}

function runBash(script, label = "") {
  if (!fs.existsSync(script)) {
    log(`⚠ Script no encontrado: ${path.basename(script)}`);
    return false;
  }
  try {
    log(`▶ Ejecutando: ${label || path.basename(script)}`);
    execSync(`bash "${script}"`, {
      stdio: "inherit",
      cwd: BASE,
    });
    return true;
  } catch (err) {
    log(`✗ Error ejecutando ${path.basename(script)}:`, err.message);
    return false;
  }
}

function isZipOkName(name) {
  // Acepta: warranty-system-rs.zip o warranty-system-rs-vX.Y.Z.zip
  return /^warranty-system-rs(\-v\d+\.\d+\.\d+)?\.zip$/i.test(name);
}

// ---------- VALIDACIÓN COMPLETA PARA UN ZIP ----------
async function validateZip(zipPath) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const fname = path.basename(zipPath);

  // Calcular hash
  let hash;
  try {
    hash = sha256(zipPath);
  } catch (err) {
    log(`✗ Error calculando hash de ${fname}:`, err.message);
    return;
  }

  // Verificar si ya procesamos este archivo con el mismo hash
  if (processedFiles.has(zipPath) && processedFiles.get(zipPath) === hash) {
    log(`⏭ Saltando ${fname} - ya validado (hash coincide)`);
    return;
  }

  log("\n" + "═".repeat(80));
  log(`🔍 NUEVA BUILD DETECTADA: ${fname}`);
  log("═".repeat(80));
  log(`📦 Archivo: ${zipPath}`);
  log(`💾 Tamaño: ${Math.round(fs.statSync(zipPath).size / 1024)} KB`);
  log(`🔐 SHA-256: ${hash}`);
  log("═".repeat(80));

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
      skipped: 0,
    },
  };

  // 1) WordPress Core Compliance
  log("\n📋 VALIDACIÓN 1/3: WordPress Core Compliance");
  log("-".repeat(80));
  if (runNode(VALIDATORS.wpCompliance, "WordPress Compliance Check")) {
    results.validations.wp_compliance = "PASSED";
    results.summary.passed++;
  } else {
    results.validations.wp_compliance = fs.existsSync(VALIDATORS.wpCompliance)
      ? "FAILED"
      : "SKIPPED";
    if (fs.existsSync(VALIDATORS.wpCompliance)) {
      results.summary.failed++;
    } else {
      results.summary.skipped++;
    }
  }
  results.summary.total++;

  // 2) Update Channel Extended Validation
  log("\n🌐 VALIDACIÓN 2/3: Update Channel Extended");
  log("-".repeat(80));
  if (runNode(VALIDATORS.channelCheck, "Update Channel Extended Validation")) {
    results.validations.channel_extended = "PASSED";
    results.summary.passed++;
  } else {
    results.validations.channel_extended = fs.existsSync(
      VALIDATORS.channelCheck,
    )
      ? "FAILED"
      : "SKIPPED";
    if (fs.existsSync(VALIDATORS.channelCheck)) {
      results.summary.failed++;
    } else {
      results.summary.skipped++;
    }
  }
  results.summary.total++;

  // 3) Update Channel Recheck (Final)
  log("\n✅ VALIDACIÓN 3/3: Update Channel Recheck");
  log("-".repeat(80));
  if (runNode(VALIDATORS.channelRecheck, "Update Channel Final Recheck")) {
    results.validations.channel_recheck = "PASSED";
    results.summary.passed++;
  } else {
    results.validations.channel_recheck = fs.existsSync(
      VALIDATORS.channelRecheck,
    )
      ? "FAILED"
      : "SKIPPED";
    if (fs.existsSync(VALIDATORS.channelRecheck)) {
      results.summary.failed++;
    } else {
      results.summary.skipped++;
    }
  }
  results.summary.total++;

  // Bonus: Verificación con script bash (si existe)
  if (fs.existsSync(VALIDATORS.verify)) {
    log("\n🔍 VALIDACIÓN BONUS: Base Consolidation Verify");
    log("-".repeat(80));
    if (runBash(VALIDATORS.verify, "Base Consolidation Verification")) {
      results.validations.base_verify = "PASSED";
    } else {
      results.validations.base_verify = "FAILED";
    }
  }

  // Guardar resultados
  const reportPath = path.join(GLOBAL, `DOZO-AutoValidator-${ts}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Resumen final
  log("\n" + "═".repeat(80));
  log("📊 RESUMEN DE VALIDACIÓN AUTOMÁTICA");
  log("═".repeat(80));
  log(`✓ Pasadas:  ${results.summary.passed}/${results.summary.total}`);
  log(`✗ Fallidas: ${results.summary.failed}/${results.summary.total}`);
  log(`⏭ Saltadas: ${results.summary.skipped}/${results.summary.total}`);
  log("═".repeat(80));
  log(`🧾 Reporte guardado: ${reportPath}`);
  log("═".repeat(80));

  // Marcar como procesado
  processedFiles.set(zipPath, hash);

  log(`✅ Auto-Validator completado para ${fname}\n`);
}

// ---------- WATCHER ----------
function startWatcher() {
  ensureDir(LATEST);
  ensureDir(GLOBAL);

  console.log("\n" + "═".repeat(80));
  console.log("🔭 DOZO AUTO-VALIDATOR — Iniciado");
  console.log("═".repeat(80));
  log("📁 Observando carpeta:", LATEST);
  log("📊 Reportes se guardarán en:", GLOBAL);
  log("✅ Validadores disponibles:", Object.keys(VALIDATORS).length);
  console.log("═".repeat(80));
  console.log("💡 Para detener: Ctrl+C");
  console.log("═".repeat(80) + "\n");

  // Validar ZIPs ya existentes al iniciar
  log("🔍 Buscando ZIPs existentes...");
  const existing = fs
    .readdirSync(LATEST)
    .filter((n) => n.endsWith(".zip") && isZipOkName(n));
  if (existing.length > 0) {
    log(`📦 Encontrados ${existing.length} ZIP(s) existente(s)`);
    for (const z of existing) {
      validateZip(path.join(LATEST, z)).catch((err) =>
        log("✗ Error validando existente:", err.message),
      );
    }
  } else {
    log("📭 No hay ZIPs existentes para validar");
  }

  log("\n👀 Esperando nuevos builds...\n");

  // Observar cambios en la carpeta
  const watcher = fs.watch(LATEST, { persistent: true }, (event, name) => {
    if (!name || !name.endsWith(".zip")) return;

    if (!isZipOkName(name)) {
      log(`⚠ Se ignoró "${name}" - nomenclatura no permitida`);
      log(`   Use: warranty-system-rs.zip o warranty-system-rs-vX.Y.Z.zip`);
      return;
    }

    const full = path.join(LATEST, name);

    // Esperar a que termine de copiarse (archivo estable)
    setTimeout(() => {
      if (fs.existsSync(full)) {
        log(`\n🆕 Cambio detectado en: ${name}`);
        validateZip(full).catch((err) =>
          log("✗ Error validando nuevo ZIP:", err.message),
        );
      }
    }, 2000); // 2 segundos de espera para que el archivo se estabilice
  });

  // Manejo de señales para cierre limpio
  process.on("SIGINT", () => {
    console.log("\n\n" + "═".repeat(80));
    log("🛑 Deteniendo Auto-Validator...");
    watcher.close();
    log("✅ Auto-Validator detenido correctamente");
    console.log("═".repeat(80) + "\n");
    process.exit(0);
  });
}

// Iniciar el watcher
startWatcher();

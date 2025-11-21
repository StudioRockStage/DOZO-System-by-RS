/*
🧩 DOZO Remote Deploy – Local Validation (Pre-Deploy Check)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Validar archivos locales antes del deploy remoto
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const READY = path.join(BASE, "Empaquetado", "Ready");
const CONFIG_PATH = path.join(BASE, "Scripts", "ftp-config.json");
const REPORT = path.join(
  BASE,
  "to chat gpt",
  "Global",
  "DOZO-PreDeploy-Validation.json",
);

console.log("\n🔍 DOZO Remote Deploy – Validación Local (Fase 11)");
console.log("═══════════════════════════════════════════════════════════");

const checks = {
  timestamp: new Date().toISOString(),
  checks: {},
  status: "pending",
  errors: [],
  warnings: [],
};

// 1. Verificar estructura de directorios
console.log("\n📁 Verificando estructura de directorios...");
checks.checks.directories = {
  readyFolder: fs.existsSync(READY),
  scriptsFolder: fs.existsSync(path.join(BASE, "Scripts")),
  reportsFolder: fs.existsSync(path.join(BASE, "to chat gpt", "Global")),
};

if (!checks.checks.directories.readyFolder) {
  checks.errors.push("Directorio Empaquetado/Ready no existe");
}

// 2. Verificar archivos en Ready/
console.log("📦 Verificando archivos en Ready/...");
const readyFiles = fs.existsSync(READY) ? fs.readdirSync(READY) : [];
const zipFiles = readyFiles.filter((f) => f.endsWith(".zip"));
const hasUpdateJson = readyFiles.includes("update.json");

checks.checks.files = {
  zipCount: zipFiles.length,
  zipFiles: zipFiles,
  updateJsonExists: hasUpdateJson,
  changelogExists: readyFiles.includes("changelog.txt"),
};

if (zipFiles.length === 0) {
  checks.errors.push("No se encontró ningún archivo ZIP en Ready/");
} else {
  const latestZip = zipFiles.sort(
    (a, b) =>
      fs.statSync(path.join(READY, b)).mtimeMs -
      fs.statSync(path.join(READY, a)).mtimeMs,
  )[0];

  const zipPath = path.join(READY, latestZip);
  const stats = fs.statSync(zipPath);

  checks.checks.latestZip = {
    filename: latestZip,
    size: stats.size,
    sizeReadable: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    modified: stats.mtime.toISOString(),
  };

  console.log(
    `  ✅ ZIP encontrado: ${latestZip} (${checks.checks.latestZip.sizeReadable})`,
  );

  // Calcular checksum
  const fileBuffer = fs.readFileSync(zipPath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  checks.checks.latestZip.sha256 = hashSum.digest("hex");
}

if (!hasUpdateJson) {
  checks.errors.push("Falta archivo update.json en Ready/");
} else {
  // 3. Validar contenido de update.json
  console.log("📄 Validando update.json...");
  try {
    const updateJson = JSON.parse(
      fs.readFileSync(path.join(READY, "update.json"), "utf8"),
    );
    checks.checks.updateJson = {
      valid: true,
      version: updateJson.version,
      name: updateJson.name,
      hasDownloadUrl: !!updateJson.download_url,
      hasChangelog: !!updateJson.changelog,
    };

    console.log(`  ✅ update.json válido - Versión: ${updateJson.version}`);

    // Verificar consistencia con ZIP
    if (zipFiles.length > 0 && checks.checks.latestZip) {
      const expectedZip = `Warranty_System_v${updateJson.version}.zip`;
      if (checks.checks.latestZip.filename !== expectedZip) {
        checks.warnings.push(
          `El nombre del ZIP (${checks.checks.latestZip.filename}) no coincide con la versión en update.json (${expectedZip})`,
        );
      }
    }
  } catch (e) {
    checks.errors.push(`Error al parsear update.json: ${e.message}`);
    checks.checks.updateJson = { valid: false, error: e.message };
  }
}

// 4. Verificar configuración FTP
console.log("🔐 Verificando configuración FTP...");
if (!fs.existsSync(CONFIG_PATH)) {
  checks.errors.push("No se encontró ftp-config.json en Scripts/");
  checks.checks.ftpConfig = { exists: false };
} else {
  try {
    const ftpConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    checks.checks.ftpConfig = {
      exists: true,
      host: ftpConfig.host,
      userConfigured:
        ftpConfig.user !== "YOUR_FTP_USERNAME" && ftpConfig.user !== "",
      passwordConfigured:
        ftpConfig.password !== "YOUR_FTP_PASSWORD" && ftpConfig.password !== "",
      port: ftpConfig.port || 21,
    };

    if (
      !checks.checks.ftpConfig.userConfigured ||
      !checks.checks.ftpConfig.passwordConfigured
    ) {
      checks.errors.push(
        "Credenciales FTP no configuradas. Edita Scripts/ftp-config.json",
      );
    } else {
      console.log("  ✅ Credenciales FTP configuradas");
    }
  } catch (e) {
    checks.errors.push(`Error al leer ftp-config.json: ${e.message}`);
    checks.checks.ftpConfig = { exists: true, valid: false, error: e.message };
  }
}

// 5. Resumen final
console.log("\n" + "═".repeat(63));
checks.status = checks.errors.length === 0 ? "ready" : "failed";

if (checks.status === "ready") {
  console.log("✅ VALIDACIÓN EXITOSA - Listo para deploy remoto");
  console.log("\n📋 Resumen:");
  console.log(`   • Archivo a deployar: ${checks.checks.latestZip?.filename}`);
  console.log(`   • Versión: ${checks.checks.updateJson?.version}`);
  console.log(`   • Tamaño: ${checks.checks.latestZip?.sizeReadable}`);
  console.log(`   • Destino: ${checks.checks.ftpConfig.host}`);
  console.log("\n🚀 Para ejecutar el deploy, corre:");
  console.log("   npm run deploy");
  console.log("   o");
  console.log("   node dozo-phase11-remote-deploy.js");
} else {
  console.log("❌ VALIDACIÓN FALLIDA - Corrige los siguientes errores:\n");
  checks.errors.forEach((err, idx) => {
    console.log(`   ${idx + 1}. ${err}`);
  });
}

if (checks.warnings.length > 0) {
  console.log("\n⚠️  ADVERTENCIAS:");
  checks.warnings.forEach((warn, idx) => {
    console.log(`   ${idx + 1}. ${warn}`);
  });
}

// Guardar reporte
fs.writeFileSync(REPORT, JSON.stringify(checks, null, 2));
console.log(`\n🧾 Reporte guardado: ${REPORT}`);
console.log("═".repeat(63) + "\n");

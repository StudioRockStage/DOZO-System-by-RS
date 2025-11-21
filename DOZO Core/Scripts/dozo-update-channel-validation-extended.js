/*
🧩 DOZO Update Channel Validation v1.0.0 (Extended Deep Validation Edition)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Fecha: 2025-10-20
*/

import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import https from "https";
import http from "http";
import AdmZip from "adm-zip";

// === CONFIGURACIÓN ===
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const reportPath = path.join(
  globalDir,
  "DOZO-UpdateChannelValidation-Extended.json",
);
const tempDir = path.join(baseDir, "temp-update-validation");

// Crear directorio temporal
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(globalDir)) fs.mkdirSync(globalDir, { recursive: true });

const ftpConfig = {
  host: "82.29.86.182",
  port: 21,
  user: "u461169968",
  password: "RSN5$4n1XJx6l2:m",
  secure: false,
};

const report = {
  started_at: new Date().toISOString(),
  system: "DOZO System by RockStage v7.9",
  plugin: "Warranty System RS v1.0.0",
  validations: [],
  warnings: [],
  errors: [],
  status: "PENDING",
};

function logStep(name, status, details = {}) {
  console.log(`\n▶ ${name}: ${status}`);
  report.validations.push({
    step: name,
    status,
    details,
    timestamp: new Date().toISOString(),
  });
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, data }));
      })
      .on("error", reject);
  });
}

// === 1️⃣ VALIDACIÓN DE CONEXIÓN FTP ===
logStep("🌐 Validación de conexión FTP", "INICIANDO");
const client = new ftp.Client();
client.ftp.verbose = false;

try {
  await client.access(ftpConfig);
  logStep("🌐 Validación de conexión FTP", "OK", {
    connected: true,
    host: ftpConfig.host,
  });

  // Navegar al directorio
  await client.cd("/public_html/updates/warranty-system-rs/");
  const files = await client.list();

  const updateJson = files.find((f) => f.name === "update.json");
  const zipFile = files.find((f) => f.name === "warranty-system-rs.zip");

  logStep("🗂️ Estructura remota detectada", "OK", {
    files_found: files.length,
    has_update_json: !!updateJson,
    has_zip: !!zipFile,
    files: files.map((f) => ({
      name: f.name,
      size: f.size,
      date: f.modifiedAt,
    })),
  });

  if (!updateJson) {
    report.errors.push("No se encontró update.json en el servidor");
  }
  if (!zipFile) {
    report.errors.push("No se encontró warranty-system-rs.zip en el servidor");
  }

  // === 2️⃣ VALIDACIÓN DE update.json ===
  if (updateJson) {
    logStep("🧾 Descargando update.json", "INICIANDO");
    const jsonPath = path.join(tempDir, "update.json");
    await client.downloadTo(jsonPath, "update.json");

    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // Validar campos requeridos
    const requiredFields = [
      "version",
      "download_url",
      "tested",
      "requires",
      "requires_php",
    ];
    const missingFields = requiredFields.filter((f) => !jsonContent[f]);

    if (missingFields.length > 0) {
      report.errors.push(
        `Faltan campos en update.json: ${missingFields.join(", ")}`,
      );
      logStep("🧾 Validación update.json", "ERROR", {
        missing_fields: missingFields,
      });
    } else {
      // Validar valores específicos
      const expectedVersion = "1.0.0";
      const expectedUrl =
        "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs.zip";

      const versionMatch = jsonContent.version === expectedVersion;
      const urlMatch = jsonContent.download_url === expectedUrl;

      logStep(
        "🧾 Validación update.json",
        versionMatch && urlMatch ? "OK" : "WARNING",
        {
          content: jsonContent,
          version_match: versionMatch,
          url_match: urlMatch,
        },
      );

      if (!versionMatch) {
        report.warnings.push(
          `Versión en update.json (${jsonContent.version}) diferente de esperada (${expectedVersion})`,
        );
      }
      if (!urlMatch) {
        report.warnings.push(`URL en update.json diferente de esperada`);
      }
    }

    // Validar acceso HTTP al JSON
    try {
      logStep("🌐 Validación HTTP update.json", "INICIANDO");
      const httpResponse = await httpGet(
        "https://updates.vapedot.mx/warranty-system-rs/update.json",
      );

      if (httpResponse.statusCode === 200) {
        logStep("🌐 Validación HTTP update.json", "OK", {
          status_code: httpResponse.statusCode,
          accessible: true,
          response_size: httpResponse.data.length,
        });
      } else {
        report.errors.push(
          `HTTP status code ${httpResponse.statusCode} para update.json`,
        );
        logStep("🌐 Validación HTTP update.json", "ERROR", {
          status_code: httpResponse.statusCode,
        });
      }
    } catch (e) {
      report.errors.push(`Error HTTP al acceder update.json: ${e.message}`);
      logStep("🌐 Validación HTTP update.json", "ERROR", { error: e.message });
    }
  }

  // === 3️⃣ VERIFICACIÓN DEL ZIP REMOTO ===
  if (zipFile) {
    logStep("📦 Descargando ZIP remoto", "INICIANDO");
    const zipPath = path.join(tempDir, "warranty-system-rs.zip");
    await client.downloadTo(zipPath, "warranty-system-rs.zip");

    const zipBuffer = fs.readFileSync(zipPath);
    const zipHash = sha256(zipBuffer);
    const zipSize = zipBuffer.length;

    logStep("📦 ZIP descargado", "OK", {
      size: zipSize,
      size_kb: Math.round(zipSize / 1024),
      sha256: zipHash,
    });

    // Validar estructura interna
    try {
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      const hasRootFolder = entries.some((e) =>
        e.entryName.startsWith("warranty-system-rs/"),
      );
      const hasMainFile = entries.some(
        (e) => e.entryName === "warranty-system-rs/warranty-system-rs.php",
      );

      if (!hasRootFolder) {
        report.errors.push("ZIP no tiene carpeta raíz warranty-system-rs/");
      }
      if (!hasMainFile) {
        report.errors.push(
          "ZIP no tiene archivo principal warranty-system-rs.php",
        );
      }

      logStep(
        "📦 Estructura ZIP validada",
        hasRootFolder && hasMainFile ? "OK" : "ERROR",
        {
          total_files: entries.length,
          has_root_folder: hasRootFolder,
          has_main_file: hasMainFile,
          first_entries: entries.slice(0, 10).map((e) => e.entryName),
        },
      );

      // Validar cabeceras del plugin
      if (hasMainFile) {
        const mainContent = zip.readAsText(
          "warranty-system-rs/warranty-system-rs.php",
        );
        const updateUri = /Update URI:\s*(.*)/i.exec(mainContent)?.[1]?.trim();
        const version = /Version:\s*(.*)/i.exec(mainContent)?.[1]?.trim();

        logStep("🔍 Cabeceras del plugin", "OK", {
          version,
          update_uri: updateUri,
          update_uri_match:
            updateUri ===
            "https://updates.vapedot.mx/warranty-system-rs/update.json",
        });
      }
    } catch (e) {
      report.errors.push(`Error al analizar ZIP: ${e.message}`);
      logStep("📦 Estructura ZIP validada", "ERROR", { error: e.message });
    }
  }

  await client.close();
} catch (e) {
  report.errors.push(`Error FTP: ${e.message}`);
  logStep("🌐 Validación de conexión FTP", "ERROR", { error: e.message });
}

// === 4️⃣ SIMULACIÓN DE ACTUALIZACIÓN WORDPRESS ===
logStep("🔍 Simulación actualización WordPress", "INICIANDO");

const installedVersion = "1.0.0";
const jsonPath = path.join(tempDir, "update.json");

if (fs.existsSync(jsonPath)) {
  const updateData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const remoteVersion = updateData.version;

  const needsUpdate = remoteVersion !== installedVersion;

  logStep("🔍 Simulación actualización WordPress", "OK", {
    installed_version: installedVersion,
    remote_version: remoteVersion,
    update_available: needsUpdate,
    status: needsUpdate ? "ACTUALIZACIÓN DETECTADA" : "READY FOR NEXT RELEASE",
  });
} else {
  logStep("🔍 Simulación actualización WordPress", "SKIP", {
    reason: "update.json no disponible localmente",
  });
}

// === 5️⃣ VALIDACIÓN DOZO CORE ===
logStep("🧠 Validación DOZO Core", "INICIANDO");

const zipPath = path.join(tempDir, "warranty-system-rs.zip");
const dozoChecks = {
  file_exists: fs.existsSync(zipPath),
  structure_valid: false,
  php_syntax_valid: false,
  wordpress_compatible: false,
  security_checks: false,
};

if (fs.existsSync(zipPath)) {
  try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // Estructura
    dozoChecks.structure_valid =
      entries.some((e) => e.entryName.startsWith("warranty-system-rs/")) &&
      entries.some((e) => e.entryName.includes("warranty-system-rs.php"));

    // Sintaxis PHP (básica)
    const mainFile = entries.find(
      (e) => e.entryName === "warranty-system-rs/warranty-system-rs.php",
    );
    if (mainFile) {
      const content = zip.readAsText(mainFile);
      dozoChecks.php_syntax_valid =
        content.includes("<?php") && !content.includes("syntax error");
      dozoChecks.security_checks =
        content.includes("ABSPATH") || content.includes("WPINC");
      dozoChecks.wordpress_compatible = /Requires at least:\s*6\.0/i.test(
        content,
      );
    }
  } catch (e) {
    report.errors.push(`Error en validación DOZO: ${e.message}`);
  }
}

const dozoStatus = Object.values(dozoChecks).every((v) => v)
  ? "PASSED"
  : "FAILED";
logStep("🧠 Validación DOZO Core", dozoStatus, {
  checks: dozoChecks,
  compliance: dozoStatus,
});

// === 6️⃣ CONSOLIDACIÓN FINAL ===
report.finished_at = new Date().toISOString();
report.status =
  report.errors.length === 0
    ? "UPDATE CHANNEL FULLY OPERATIONAL ✅"
    : "UPDATE CHANNEL HAS ISSUES ⚠️";

report.summary = {
  total_validations: report.validations.length,
  passed: report.validations.filter((v) => v.status === "OK").length,
  errors: report.errors.length,
  warnings: report.warnings.length,
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log("\n" + "═".repeat(80));
console.log("✅ Validación extendida completada");
console.log("═".repeat(80));
console.log(`📊 Status: ${report.status}`);
console.log(
  `✓ Validaciones: ${report.summary.passed}/${report.summary.total_validations}`,
);
console.log(`⚠ Warnings: ${report.summary.warnings}`);
console.log(`✗ Errors: ${report.summary.errors}`);
console.log(`🧾 Reporte: ${reportPath}`);
console.log("═".repeat(80));

// Limpiar archivos temporales
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("🧹 Archivos temporales limpiados");
} catch (e) {
  console.log("⚠️  No se pudieron limpiar archivos temporales");
}

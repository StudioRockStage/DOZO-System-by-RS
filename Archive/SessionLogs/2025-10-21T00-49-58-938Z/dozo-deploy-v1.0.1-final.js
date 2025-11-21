/*
🧪 DOZO Deploy v1.0.1 (SmartPanel Update – Corrected Build Path)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { Client as FTPClient } from "basic-ftp";
import fetch from "node-fetch";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const SOURCE_ZIP = path.join(
  ROOT,
  "Latest Updates",
  "Warranty System RS",
  "warranty-system-rs-v1.0.1.zip",
);
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");
const DEPLOY_REPORT = path.join(GLOBAL, "DOZO-v1.0.1-DeployReport.json");

// Configuración FTP (probando con usuario completo del config)
const FTP_CONFIG = {
  host: "82.29.86.182",
  user: "u461169968",
  password: "490?v0Lin9>x8?Mz",
  port: 21,
  secure: false,
};

const REMOTE_PATH = "/public_html/updates/warranty-system-rs/";
const DOWNLOAD_URL =
  "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip";
const UPDATE_JSON_URL =
  "https://updates.vapedot.mx/warranty-system-rs/update.json";

// Utilidades
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

function formatBytes(bytes) {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Paso 1: Preparar entorno
async function prepareEnvironment() {
  log("🧠", "Preparando entorno DOZO...");

  if (!fs.existsSync(SOURCE_ZIP)) {
    throw new Error(`Build ZIP no encontrado: ${SOURCE_ZIP}`);
  }

  const size = getFileSize(SOURCE_ZIP);
  const sha256 = calculateSHA256(SOURCE_ZIP);

  log("✅", "Build encontrado");
  log("📊", `Tamaño: ${formatBytes(size)}`);
  log("🔐", `SHA256: ${sha256.substring(0, 32)}...`);

  return { size, sha256 };
}

// Paso 2: Subir ZIP al servidor
async function uploadZipToServer() {
  log("📤", "Subiendo paquete ZIP al servidor remoto...");

  const client = new FTPClient();
  client.ftp.verbose = false;
  client.ftp.timeout = 60000;
  client.ftp.ipFamily = 4;

  try {
    log("🔌", `Conectando a ${FTP_CONFIG.host}...`);
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port,
      secure: FTP_CONFIG.secure,
    });

    log("✅", "Conectado exitosamente");

    // Navegar o crear directorio
    try {
      await client.cd(REMOTE_PATH);
      log("✅", `Navegado a: ${REMOTE_PATH}`);
    } catch (e) {
      log("📁", "Creando directorio remoto...");
      await client.ensureDir(REMOTE_PATH);
      await client.cd(REMOTE_PATH);
    }

    // Subir archivo
    log("⬆️", "Subiendo warranty-system-rs-v1.0.1.zip...");
    await client.uploadFrom(SOURCE_ZIP, "warranty-system-rs-v1.0.1.zip");
    log("✅", "ZIP subido correctamente");

    // Verificar que se subió
    const list = await client.list();
    const uploaded = list.find(
      (f) => f.name === "warranty-system-rs-v1.0.1.zip",
    );

    if (uploaded) {
      log(
        "✅",
        `Archivo verificado en servidor: ${formatBytes(uploaded.size)}`,
      );
    }

    client.close();
    return { success: true };
  } catch (error) {
    client.close();
    throw new Error(`Error FTP: ${error.message}`);
  }
}

// Paso 3: Actualizar update.json
async function updateRemoteJSON() {
  log("🧾", "Actualizando update.json remoto...");

  const updateData = {
    version: "1.0.1",
    download_url: DOWNLOAD_URL,
    tested: "6.7.1",
    requires: "6.0",
    requires_php: "7.4",
  };

  const client = new FTPClient();
  client.ftp.verbose = false;
  client.ftp.timeout = 60000;
  client.ftp.ipFamily = 4;

  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port,
      secure: FTP_CONFIG.secure,
    });

    await client.cd(REMOTE_PATH);

    // Crear archivo temporal
    const tempJSON = path.join(os.tmpdir(), "update.json");
    fs.writeFileSync(tempJSON, JSON.stringify(updateData, null, 2));

    log("⬆️", "Subiendo update.json...");
    await client.uploadFrom(tempJSON, "update.json");
    log("✅", "update.json subido correctamente");

    fs.unlinkSync(tempJSON);
    client.close();

    return updateData;
  } catch (error) {
    client.close();
    throw new Error(`Error actualizando JSON: ${error.message}`);
  }
}

// Paso 4: Validar conexión y estructura
async function validateDeployment(localSize, localSHA256) {
  log("🧪", "Validando conexión y estructura...");

  const validations = {
    zip_accessible: false,
    zip_size_match: false,
    json_accessible: false,
    json_format_correct: false,
    permissions_ok: true,
  };

  // Esperar un poco para propagación
  await sleep(3000);

  try {
    // Validar ZIP
    log("🌐", "Verificando acceso al ZIP...");
    const zipResponse = await fetch(DOWNLOAD_URL, {
      method: "HEAD",
      timeout: 15000,
    });
    validations.zip_accessible = zipResponse.ok;

    if (validations.zip_accessible) {
      log("✅", "ZIP accesible desde navegador");

      const remoteSize = parseInt(
        zipResponse.headers.get("content-length") || "0",
      );
      validations.zip_size_match = Math.abs(remoteSize - localSize) < 2048;

      if (validations.zip_size_match) {
        log("✅", `Tamaño coincide: ${formatBytes(remoteSize)}`);
      } else {
        log(
          "⚠️",
          `Diferencia de tamaño: ${formatBytes(Math.abs(remoteSize - localSize))}`,
        );
      }
    } else {
      log("❌", `ZIP no accesible (HTTP ${zipResponse.status})`);
    }

    // Validar JSON
    log("🌐", "Verificando update.json...");
    const jsonResponse = await fetch(UPDATE_JSON_URL, { timeout: 15000 });
    validations.json_accessible = jsonResponse.ok;

    if (validations.json_accessible) {
      const jsonData = await jsonResponse.json();

      validations.json_format_correct =
        jsonData.version === "1.0.1" &&
        jsonData.download_url === DOWNLOAD_URL &&
        jsonData.tested === "6.7.1" &&
        jsonData.requires === "6.0" &&
        jsonData.requires_php === "7.4";

      if (validations.json_format_correct) {
        log("✅", "update.json formato correcto");
        log("✅", `Versión: ${jsonData.version}`);
      } else {
        log("⚠️", "Formato de JSON incorrecto");
      }
    } else {
      log("❌", `update.json no accesible (HTTP ${jsonResponse.status})`);
    }
  } catch (error) {
    log("⚠️", `Error en validación: ${error.message}`);
  }

  return validations;
}

// Paso 5: Registrar deploy en DOZO
function registerDeploy(prepInfo, validations, updateData) {
  log("🧩", "Registrando estado del deploy en DOZO...");

  const report = {
    action: "Deploy v1.0.1 SmartPanel Update",
    status:
      validations.zip_accessible && validations.json_accessible
        ? "success"
        : "partial",
    timestamp: new Date().toISOString(),
    plugin: {
      name: "Warranty System RS",
      version: "1.0.1",
      author: "RockStage Solutions",
    },
    build: {
      source: SOURCE_ZIP,
      filename: "warranty-system-rs-v1.0.1.zip",
      size: prepInfo.size,
      size_formatted: formatBytes(prepInfo.size),
      sha256: prepInfo.sha256,
    },
    deployment: {
      server: FTP_CONFIG.host,
      remote_path: REMOTE_PATH,
      download_url: DOWNLOAD_URL,
      update_json_url: UPDATE_JSON_URL,
    },
    update_metadata: updateData,
    validations: validations,
    verification: {
      zip_accesible: validations.zip_accessible ? "OK" : "Error",
      json_accesible: validations.json_accessible ? "OK" : "Error",
      formato_correcto: validations.json_format_correct ? "OK" : "Error",
      estado_general:
        validations.zip_accessible && validations.json_accessible
          ? "OK"
          : "Error",
    },
    wordpress: {
      update_available:
        validations.zip_accessible && validations.json_accessible,
      message:
        validations.zip_accessible && validations.json_accessible
          ? "Actualización disponible: Warranty System RS v1.0.1"
          : "Pendiente de verificación",
      cache_clear_command: "wp transient delete --all",
      cron_max_wait: "12 horas",
    },
  };

  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }

  fs.writeFileSync(DEPLOY_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${path.basename(DEPLOY_REPORT)}`);

  return report;
}

// Main execution
(async () => {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "║         🧪 DOZO Deploy v1.0.1 – SmartPanel Update (Final) 🧪                ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Paso 1: Preparar
    const prepInfo = await prepareEnvironment();

    // Paso 2: Subir ZIP
    await uploadZipToServer();

    // Paso 3: Actualizar JSON
    const updateData = await updateRemoteJSON();

    // Paso 4: Validar
    const validations = await validateDeployment(
      prepInfo.size,
      prepInfo.sha256,
    );

    // Paso 5: Registrar
    const report = registerDeploy(prepInfo, validations, updateData);

    // Resultado
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );

    if (validations.zip_accessible && validations.json_accessible) {
      console.log(
        "║                     ✅ DEPLOY EXITOSO COMPLETADO ✅                           ║",
      );
    } else {
      console.log(
        "║                  ⚠️  DEPLOY PARCIAL (Revisar validaciones) ⚠️               ║",
      );
    }

    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", "Build: warranty-system-rs-v1.0.1.zip");
    log("📊", `Tamaño: ${formatBytes(prepInfo.size)}`);
    log("🔐", `SHA256: ${prepInfo.sha256.substring(0, 32)}...`);
    log("🌐", `ZIP URL: ${DOWNLOAD_URL}`);
    log("📄", `JSON URL: ${UPDATE_JSON_URL}`);
    log("📋", `Reporte: ${path.basename(DEPLOY_REPORT)}`);

    console.log("\n📊 Validaciones:");
    console.log(`   ${validations.zip_accessible ? "✅" : "❌"} ZIP accesible`);
    console.log(
      `   ${validations.zip_size_match ? "✅" : "⚠️"} Tamaño coincide`,
    );
    console.log(
      `   ${validations.json_accessible ? "✅" : "❌"} update.json accesible`,
    );
    console.log(
      `   ${validations.json_format_correct ? "✅" : "⚠️"} Formato JSON correcto`,
    );

    if (validations.zip_accessible && validations.json_accessible) {
      console.log("\n✅ WordPress (vapedot.mx) debe mostrar:");
      console.log('   "Actualización disponible: Warranty System RS v1.0.1"\n');
      console.log("💡 Si no aparece inmediatamente:");
      console.log("   • Ejecuta: wp transient delete --all");
      console.log("   • O espera el cron de verificación (máximo 12h)\n");
    } else {
      console.log("\n⚠️  Algunas validaciones fallaron.");
      console.log("   Revisa el reporte para detalles.\n");
    }
  } catch (error) {
    console.error("\n❌ Error en el deploy:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

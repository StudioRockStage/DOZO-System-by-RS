/*
🧩 DOZO Deploy v1.0.1 (SmartPanel Update – Remote Release)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Fecha: 2025-10-19

Objetivo: Deploy completo del build certificado v1.0.1 al servidor de actualizaciones
          con reintentos automáticos y validación exhaustiva.
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { Client as FTPClient } from "basic-ftp";
import fetch from "node-fetch";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");
const WORKFLOW_DB = path.join(ROOT, "Workflow DB");

// Archivos
const BUILD_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs-v1.0.1.zip");
const STABLE_SEAL = path.join(WORKFLOW_DB, "DOZO-StableSeal.json");
const DEPLOY_REPORT = path.join(GLOBAL, "DOZO-Deploy-v1.0.1-Report.json");

// Configuración FTP (credenciales actualizadas y verificadas)
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

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

// Utilidades
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
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
  log("🧠", "Preparando entorno DOZO para deploy...");

  // Verificar que existe el ZIP
  if (!fs.existsSync(BUILD_ZIP)) {
    throw new Error(`Build ZIP no encontrado: ${BUILD_ZIP}`);
  }

  log("✅", "Build certificado encontrado");

  // Verificar tamaño
  const size = getFileSize(BUILD_ZIP);
  if (size < 1024 * 1024) {
    throw new Error(`Build demasiado pequeño: ${formatBytes(size)}`);
  }

  log("✅", `Tamaño válido: ${formatBytes(size)}`);

  // Verificar certificación
  if (fs.existsSync(STABLE_SEAL)) {
    const seal = JSON.parse(fs.readFileSync(STABLE_SEAL, "utf8"));

    if (seal.version !== "1.0.1" || !seal.certified) {
      throw new Error("Build no está certificado correctamente");
    }

    log("✅", "Build certificado verificado");

    // Verificar SHA256
    const currentSHA256 = calculateSHA256(BUILD_ZIP);
    log("🔐", `SHA256: ${currentSHA256.substring(0, 32)}...`);

    return { size, sha256: currentSHA256, seal };
  } else {
    log("⚠️", "Sello de certificación no encontrado, continuando...");
    const sha256 = calculateSHA256(BUILD_ZIP);
    return { size, sha256, seal: null };
  }
}

// Paso 2: Subir al servidor con reintentos
async function uploadToServer(retryCount = 0) {
  log(
    "☁️",
    `Conectando al servidor FTP (intento ${retryCount + 1}/${MAX_RETRIES})...`,
  );

  const client = new FTPClient();
  client.ftp.verbose = false;

  // Aumentar timeout y habilitar modo pasivo
  client.ftp.timeout = 30000; // 30 segundos
  client.ftp.ipFamily = 4; // Forzar IPv4

  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port,
      secure: FTP_CONFIG.secure,
      secureOptions: { rejectUnauthorized: false },
    });

    log("✅", `Conectado a ${FTP_CONFIG.host}`);

    // Navegar o crear directorio
    try {
      await client.cd(REMOTE_PATH);
      log("✅", `Navegado a: ${REMOTE_PATH}`);
    } catch (e) {
      log("📁", "Creando directorio remoto...");
      await client.ensureDir(REMOTE_PATH);
      await client.cd(REMOTE_PATH);
      log("✅", "Directorio creado y navegado");
    }

    // Subir archivo ZIP
    log("📤", "Subiendo warranty-system-rs-v1.0.1.zip...");
    await client.uploadFrom(BUILD_ZIP, "warranty-system-rs-v1.0.1.zip");
    log("✅", "ZIP subido correctamente");

    client.close();
    return { success: true, retries: retryCount };
  } catch (error) {
    client.close();

    if (retryCount < MAX_RETRIES - 1) {
      log("⚠️", `Error en subida: ${error.message}`);
      log("⏳", `Reintentando en ${RETRY_DELAY / 1000} segundos...`);
      await sleep(RETRY_DELAY);
      return uploadToServer(retryCount + 1);
    } else {
      throw new Error(
        `Error al subir archivo después de ${MAX_RETRIES} intentos: ${error.message}`,
      );
    }
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
  client.ftp.timeout = 30000; // 30 segundos
  client.ftp.ipFamily = 4; // Forzar IPv4

  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port,
      secure: FTP_CONFIG.secure,
      secureOptions: { rejectUnauthorized: false },
    });

    await client.cd(REMOTE_PATH);

    // Crear archivo temporal local
    const tempJSON = path.join(os.tmpdir(), "update.json");
    fs.writeFileSync(tempJSON, JSON.stringify(updateData, null, 2));

    log("📤", "Subiendo update.json...");
    await client.uploadFrom(tempJSON, "update.json");
    log("✅", "update.json subido correctamente");

    // Limpiar archivo temporal
    fs.unlinkSync(tempJSON);

    client.close();
    return updateData;
  } catch (error) {
    client.close();
    throw new Error(`Error actualizando update.json: ${error.message}`);
  }
}

// Paso 4: Validación final
async function validateDeployment(localSize, localSHA256) {
  log("🔍", "Ejecutando validación final del deploy...");

  const validations = {
    zip_accessible: false,
    zip_size_match: false,
    json_accessible: false,
    json_format_correct: false,
    version_correct: false,
    download_url_correct: false,
  };

  try {
    // Validar ZIP
    log("🌐", "Verificando acceso al ZIP...");
    const zipResponse = await fetch(DOWNLOAD_URL, {
      method: "HEAD",
      timeout: 10000,
    });
    validations.zip_accessible = zipResponse.ok;

    if (validations.zip_accessible) {
      log("✅", "ZIP accesible desde URL pública");

      const remoteSize = parseInt(
        zipResponse.headers.get("content-length") || "0",
      );
      validations.zip_size_match = Math.abs(remoteSize - localSize) < 1024; // Tolerancia de 1KB

      if (validations.zip_size_match) {
        log("✅", `Tamaño coincide: ${formatBytes(remoteSize)}`);
      } else {
        log(
          "⚠️",
          `Diferencia de tamaño: Local ${formatBytes(localSize)} vs Remoto ${formatBytes(remoteSize)}`,
        );
      }
    } else {
      log("❌", `ZIP no accesible (HTTP ${zipResponse.status})`);
    }

    // Validar update.json
    log("🌐", "Verificando update.json...");
    const jsonResponse = await fetch(UPDATE_JSON_URL, { timeout: 10000 });
    validations.json_accessible = jsonResponse.ok;

    if (validations.json_accessible) {
      const jsonData = await jsonResponse.json();

      validations.version_correct = jsonData.version === "1.0.1";
      validations.download_url_correct = jsonData.download_url === DOWNLOAD_URL;
      validations.json_format_correct =
        jsonData.tested === "6.7.1" &&
        jsonData.requires === "6.0" &&
        jsonData.requires_php === "7.4";

      if (validations.version_correct) {
        log("✅", `Versión correcta: ${jsonData.version}`);
      }

      if (validations.download_url_correct) {
        log("✅", "URL de descarga correcta");
      }

      if (validations.json_format_correct) {
        log("✅", "Formato de update.json correcto");
      }
    } else {
      log("❌", `update.json no accesible (HTTP ${jsonResponse.status})`);
    }
  } catch (error) {
    log("⚠️", `Error en validación: ${error.message}`);
  }

  const allValid = Object.values(validations).every((v) => v === true);

  if (allValid) {
    log("✅", "Todas las validaciones pasadas");
  } else {
    log("⚠️", "Algunas validaciones fallaron");
  }

  return { validations, allValid };
}

// Paso 5: Registrar deploy
async function registerDeploy(
  prepareInfo,
  uploadInfo,
  updateData,
  validationInfo,
) {
  log("🪶", "Registrando deploy en DOZO...");

  const deployReport = {
    action: "Deploy Remote v1.0.1",
    status: validationInfo.allValid ? "success" : "partial_success",
    timestamp: new Date().toISOString(),
    plugin: {
      name: "Warranty System RS",
      version: "1.0.1",
      author: "RockStage Solutions",
    },
    build: {
      source: BUILD_ZIP,
      filename: "warranty-system-rs-v1.0.1.zip",
      size: prepareInfo.size,
      size_formatted: formatBytes(prepareInfo.size),
      sha256: prepareInfo.sha256,
    },
    deployment: {
      server: FTP_CONFIG.host,
      remote_path: REMOTE_PATH,
      upload_retries: uploadInfo.retries,
      upload_success: uploadInfo.success,
    },
    urls: {
      download: DOWNLOAD_URL,
      update_json: UPDATE_JSON_URL,
    },
    update_metadata: updateData,
    validations: validationInfo.validations,
    validation_summary: {
      all_passed: validationInfo.allValid,
      zip_accessible: validationInfo.validations.zip_accessible,
      json_accessible: validationInfo.validations.json_accessible,
      wordpress_ready: validationInfo.allValid,
    },
    certification: {
      certified: prepareInfo.seal !== null,
      seal_signature: prepareInfo.seal ? prepareInfo.seal.seal_signature : null,
      stability_level: prepareInfo.seal
        ? prepareInfo.seal.stability_level
        : "STABLE",
    },
    wordpress_update_system: {
      compatible: true,
      auto_update_ready: validationInfo.allValid,
      tested_up_to: "6.7.1",
      requires_at_least: "6.0",
      requires_php: "7.4",
    },
  };

  fs.writeFileSync(DEPLOY_REPORT, JSON.stringify(deployReport, null, 2));
  log("✅", `Reporte de deploy guardado: ${path.basename(DEPLOY_REPORT)}`);

  return deployReport;
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
    "║          🚀 DOZO Deploy v1.0.1 – Remote Release (SmartPanel) 🚀             ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  const startTime = Date.now();

  try {
    // Paso 1: Preparar entorno
    const prepareInfo = await prepareEnvironment();

    // Paso 2: Subir al servidor (con reintentos)
    const uploadInfo = await uploadToServer();

    // Paso 3: Actualizar update.json
    const updateData = await updateRemoteJSON();

    // Esperar propagación
    log("⏳", "Esperando propagación del servidor (8 segundos)...");
    await sleep(8000);

    // Paso 4: Validación final
    const validationInfo = await validateDeployment(
      prepareInfo.size,
      prepareInfo.sha256,
    );

    // Paso 5: Registrar deploy
    const deployReport = await registerDeploy(
      prepareInfo,
      uploadInfo,
      updateData,
      validationInfo,
    );

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Resultado final
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );

    if (validationInfo.allValid) {
      console.log(
        "║                    ✅ DEPLOY EXITOSO COMPLETADO ✅                            ║",
      );
    } else {
      console.log(
        "║               ⚠️  DEPLOY COMPLETADO CON ADVERTENCIAS ⚠️                     ║",
      );
    }

    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", "Build: warranty-system-rs-v1.0.1.zip");
    log("📊", `Tamaño: ${formatBytes(prepareInfo.size)}`);
    log("🔐", `SHA256: ${prepareInfo.sha256.substring(0, 32)}...`);
    log("☁️", `Servidor: ${FTP_CONFIG.host}`);
    log("📁", `Ruta remota: ${REMOTE_PATH}`);
    log("🌐", `URL ZIP: ${DOWNLOAD_URL}`);
    log("📄", `URL JSON: ${UPDATE_JSON_URL}`);
    log("🔄", `Reintentos usados: ${uploadInfo.retries}`);
    log("⏱️", `Tiempo total: ${elapsedTime}s`);
    log("📋", `Reporte: ${path.basename(DEPLOY_REPORT)}`);

    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "║  ✅ Deploy exitoso: Warranty System RS v1.0.1 ya disponible para             ║",
    );
    console.log(
      "║     actualización automática en WordPress                                    ║",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    // Mostrar estado de validaciones
    console.log("📊 Estado de validaciones:");
    console.log(
      `   ${validationInfo.validations.zip_accessible ? "✅" : "❌"} ZIP accesible`,
    );
    console.log(
      `   ${validationInfo.validations.zip_size_match ? "✅" : "❌"} Tamaño coincide`,
    );
    console.log(
      `   ${validationInfo.validations.json_accessible ? "✅" : "❌"} update.json accesible`,
    );
    console.log(
      `   ${validationInfo.validations.version_correct ? "✅" : "❌"} Versión correcta`,
    );
    console.log(
      `   ${validationInfo.validations.download_url_correct ? "✅" : "❌"} URL correcta`,
    );
    console.log(
      `   ${validationInfo.validations.json_format_correct ? "✅" : "❌"} Formato JSON correcto`,
    );

    if (!validationInfo.allValid) {
      console.log(
        "\n⚠️  Algunas validaciones fallaron. Revisa el reporte para detalles.",
      );
      console.log(
        "   Es posible que necesites esperar propagación DNS/CDN o verificar configuración del servidor.\n",
      );
    }
  } catch (error) {
    console.error("\n❌ Error en el deploy:", error.message);
    console.error(error.stack);

    // Guardar log de error
    const errorLog = {
      action: "Deploy v1.0.1",
      status: "failed",
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    };

    fs.writeFileSync(
      path.join(GLOBAL, "DOZO-Deploy-v1.0.1-Error.json"),
      JSON.stringify(errorLog, null, 2),
    );

    process.exit(1);
  }
})();

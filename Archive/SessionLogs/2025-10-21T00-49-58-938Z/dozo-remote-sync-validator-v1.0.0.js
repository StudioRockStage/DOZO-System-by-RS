#!/usr/bin/env node

// ============================================================
// 🧩 DOZO Update Server Sync v1.0.0
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-19
// ============================================================

const ftp = require("basic-ftp");
const https = require("https");
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const FTP_CONFIG = {
  host: "82.29.86.182",
  port: 21,
  user: "u461169968",
  password: "RSN5$4n1XJx6l2:m",
  secure: false,
};

const REMOTE_PATH = "/public_html/updates/warranty-system-rs/";
const UPDATE_JSON_FILE = "update.json";
const EXPECTED_ZIP = "warranty-system-rs-v1.0.1.zip";
const DOWNLOAD_URL =
  "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip";
const REPORT_PATH = path.join(
  process.env.HOME,
  "Documents/Dozo System by RS/Global/DOZO-RemoteSyncReport.json",
);

// ============================================================
// 🎨 UTILIDADES DE DISPLAY
// ============================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(emoji, message, color = "reset") {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(60) + "\n");
}

// ============================================================
// 🌐 FUNCIONES FTP
// ============================================================

async function connectFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    log("🔌", "Conectando al servidor FTP...", "blue");
    await client.access(FTP_CONFIG);
    log("✅", `Conectado exitosamente a ${FTP_CONFIG.host}`, "green");
    return { client, success: true, error: null };
  } catch (error) {
    log("❌", `Error de conexión: ${error.message}`, "red");
    return { client: null, success: false, error: error.message };
  }
}

async function listRemoteFiles(client, remotePath) {
  try {
    log("📂", `Listando archivos en: ${remotePath}`, "blue");
    const files = await client.list(remotePath);

    console.log("\n📋 Archivos encontrados:");
    files.forEach((file) => {
      const icon = file.isDirectory ? "📁" : "📄";
      const size = file.isDirectory
        ? "-"
        : `${(file.size / 1024).toFixed(2)} KB`;
      console.log(`  ${icon} ${file.name.padEnd(40)} ${size.padStart(15)}`);
    });

    return { success: true, files, error: null };
  } catch (error) {
    log("❌", `Error al listar archivos: ${error.message}`, "red");
    return { success: false, files: [], error: error.message };
  }
}

async function downloadFile(client, remotePath, localPath) {
  try {
    await client.downloadTo(localPath, remotePath);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getFilePermissions(client, remotePath) {
  try {
    const files = await client.list(path.dirname(remotePath));
    const fileName = path.basename(remotePath);
    const file = files.find((f) => f.name === fileName);

    if (file) {
      return {
        success: true,
        permissions: file.permissions || file.rawModifiedAt || "unknown",
        size: file.size,
        isDirectory: file.isDirectory,
      };
    }
    return { success: false, error: "File not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// 🌍 FUNCIONES HTTP
// ============================================================

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            size: Buffer.byteLength(data),
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function httpHead(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: "HEAD",
    };

    const req = protocol.request(options, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        size: parseInt(res.headers["content-length"] || 0),
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

// ============================================================
// 🧾 VALIDACIÓN DE update.json
// ============================================================

async function validateUpdateJson(client, remotePath) {
  logSection("🧾 VALIDACIÓN DE update.json");

  const tempFile = path.join(
    process.env.HOME,
    "Documents/Dozo System by RS/temp-update.json",
  );
  const remoteFile = path.join(remotePath, UPDATE_JSON_FILE);

  try {
    // Descargar archivo
    log("⬇️", "Descargando update.json...", "blue");
    const downloadResult = await downloadFile(client, remoteFile, tempFile);

    if (!downloadResult.success) {
      throw new Error(`No se pudo descargar: ${downloadResult.error}`);
    }

    // Leer y parsear
    const content = fs.readFileSync(tempFile, "utf8");
    const updateData = JSON.parse(content);

    log("✅", "Archivo JSON descargado y parseado correctamente", "green");

    // Validar estructura
    const requiredFields = [
      "version",
      "download_url",
      "tested",
      "requires",
      "requires_php",
    ];
    const missingFields = requiredFields.filter((field) => !updateData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Campos faltantes: ${missingFields.join(", ")}`);
    }

    log("✅", "Todos los campos requeridos están presentes", "green");

    // Mostrar contenido
    console.log("\n📋 Contenido de update.json:");
    console.log(JSON.stringify(updateData, null, 2));

    // Limpiar archivo temporal
    fs.unlinkSync(tempFile);

    return {
      success: true,
      data: updateData,
      missingFields: [],
      error: null,
    };
  } catch (error) {
    log("❌", `Error: ${error.message}`, "red");

    // Limpiar archivo temporal si existe
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    return {
      success: false,
      data: null,
      missingFields: [],
      error: error.message,
    };
  }
}

// ============================================================
// 📦 VERIFICACIÓN DEL ZIP
// ============================================================

async function verifyZipFile(client, remotePath, zipFileName) {
  logSection("📦 VERIFICACIÓN DEL ARCHIVO ZIP");

  const remoteZipPath = path.join(remotePath, zipFileName);

  try {
    // Verificar existencia y obtener info del archivo en FTP
    log("🔍", `Buscando ${zipFileName} en FTP...`, "blue");
    const fileInfo = await getFilePermissions(client, remoteZipPath);

    if (!fileInfo.success) {
      throw new Error("Archivo ZIP no encontrado en FTP");
    }

    log(
      "✅",
      `Archivo encontrado: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`,
      "green",
    );

    // Verificar acceso HTTP
    log("🌍", "Verificando acceso HTTP al ZIP...", "blue");
    const httpInfo = await httpHead(DOWNLOAD_URL);

    if (httpInfo.statusCode === 200) {
      log(
        "✅",
        `HTTP ${httpInfo.statusCode} - Archivo accesible vía web`,
        "green",
      );
      log(
        "📊",
        `Tamaño reportado: ${(httpInfo.size / 1024 / 1024).toFixed(2)} MB`,
        "cyan",
      );
    } else {
      log(
        "⚠️",
        `HTTP ${httpInfo.statusCode} - Problema de acceso web`,
        "yellow",
      );
    }

    return {
      success: true,
      ftpSize: fileInfo.size,
      httpSize: httpInfo.size,
      httpStatus: httpInfo.statusCode,
      accessible: httpInfo.statusCode === 200,
      error: null,
    };
  } catch (error) {
    log("❌", `Error: ${error.message}`, "red");
    return {
      success: false,
      ftpSize: 0,
      httpSize: 0,
      httpStatus: 0,
      accessible: false,
      error: error.message,
    };
  }
}

// ============================================================
// 🔐 REVISIÓN DE PERMISOS
// ============================================================

async function checkPermissions(client, remotePath) {
  logSection("🔐 REVISIÓN DE PERMISOS");

  try {
    log("🔍", "Analizando permisos de archivos...", "blue");

    const files = await client.list(remotePath);
    const permissionsReport = [];

    for (const file of files) {
      const permissions = file.permissions || "unknown";
      const status = file.isDirectory
        ? permissions.includes("rwxr-xr-x") || permissions === "unknown"
          ? "✅"
          : "⚠️"
        : permissions.includes("rw-r--r--") || permissions === "unknown"
          ? "✅"
          : "⚠️";

      permissionsReport.push({
        name: file.name,
        type: file.isDirectory ? "directory" : "file",
        permissions: permissions,
        status: status === "✅" ? "ok" : "needs_correction",
        size: file.size,
      });

      console.log(`  ${status} ${file.name.padEnd(40)} ${permissions}`);
    }

    const needsCorrection = permissionsReport.filter(
      (f) => f.status === "needs_correction",
    );

    if (needsCorrection.length === 0) {
      log("✅", "Todos los permisos están correctos", "green");
    } else {
      log(
        "⚠️",
        `${needsCorrection.length} archivo(s) necesitan corrección`,
        "yellow",
      );
      log(
        "ℹ️",
        "Nota: Corrección automática de permisos requiere acceso SFTP o SSH",
        "cyan",
      );
    }

    return {
      success: true,
      report: permissionsReport,
      needsCorrection: needsCorrection.length,
      error: null,
    };
  } catch (error) {
    log("❌", `Error: ${error.message}`, "red");
    return {
      success: false,
      report: [],
      needsCorrection: 0,
      error: error.message,
    };
  }
}

// ============================================================
// 🔍 SIMULACIÓN DE ACTUALIZACIÓN WORDPRESS
// ============================================================

async function simulateWordPressUpdate(
  updateJsonUrl,
  currentVersion = "1.0.0",
) {
  logSection("🔍 SIMULACIÓN DE ACTUALIZACIÓN WORDPRESS");

  try {
    log("🌐", "Solicitando update.json como lo haría WordPress...", "blue");

    const response = await httpGet(updateJsonUrl);

    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }

    const updateData = JSON.parse(response.data);
    log("✅", `Respuesta recibida (${response.size} bytes)`, "green");

    // Comparar versiones
    const remoteVersion = updateData.version;
    log("📊", `Versión instalada: ${currentVersion}`, "cyan");
    log("📊", `Versión remota: ${remoteVersion}`, "cyan");

    const isUpdateAvailable =
      compareVersions(remoteVersion, currentVersion) > 0;

    if (isUpdateAvailable) {
      log("✅", "¡Actualización detectada correctamente!", "green");
      log(
        "📥",
        `WordPress detectaría actualización de ${currentVersion} → ${remoteVersion}`,
        "cyan",
      );
    } else {
      log(
        "ℹ️",
        "No se detectó actualización (versiones iguales o remota menor)",
        "yellow",
      );
    }

    return {
      success: true,
      updateAvailable: isUpdateAvailable,
      currentVersion,
      remoteVersion,
      downloadUrl: updateData.download_url,
      httpStatus: response.statusCode,
      error: null,
    };
  } catch (error) {
    log("❌", `Error: ${error.message}`, "red");
    return {
      success: false,
      updateAvailable: false,
      currentVersion,
      remoteVersion: null,
      downloadUrl: null,
      httpStatus: 0,
      error: error.message,
    };
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

// ============================================================
// 📝 GENERACIÓN DE REPORTE
// ============================================================

function generateReport(results) {
  logSection("📝 GENERANDO REPORTE DOZO");

  const timestamp = new Date().toISOString();
  const allSuccessful = results.every((r) => r.success !== false);

  const report = {
    dozo_version: "1.0.0",
    system: "DOZO System by RockStage",
    project: "Warranty System RS",
    framework: "v7.9 DeepSync Framework",
    timestamp,
    status: allSuccessful ? "REMOTE SYNC SUCCESSFUL" : "REMOTE SYNC FAILED",
    connection: {
      host: FTP_CONFIG.host,
      port: FTP_CONFIG.port,
      remote_path: REMOTE_PATH,
      ftp_status: results.find((r) => r.id === "ftp_connection")?.success
        ? "connected"
        : "failed",
      ftp_error: results.find((r) => r.id === "ftp_connection")?.error || null,
    },
    update_json: {
      status: results.find((r) => r.id === "update_json")?.success
        ? "valid"
        : "invalid",
      data: results.find((r) => r.id === "update_json")?.data || null,
      missing_fields:
        results.find((r) => r.id === "update_json")?.missingFields || [],
      error: results.find((r) => r.id === "update_json")?.error || null,
    },
    zip_file: {
      name: EXPECTED_ZIP,
      ftp_size_bytes:
        results.find((r) => r.id === "zip_verification")?.ftpSize || 0,
      http_size_bytes:
        results.find((r) => r.id === "zip_verification")?.httpSize || 0,
      http_status:
        results.find((r) => r.id === "zip_verification")?.httpStatus || 0,
      web_accessible:
        results.find((r) => r.id === "zip_verification")?.accessible || false,
      download_url: DOWNLOAD_URL,
      error: results.find((r) => r.id === "zip_verification")?.error || null,
    },
    permissions: {
      status: results.find((r) => r.id === "permissions")?.success
        ? "checked"
        : "failed",
      files_needing_correction:
        results.find((r) => r.id === "permissions")?.needsCorrection || 0,
      report: results.find((r) => r.id === "permissions")?.report || [],
      error: results.find((r) => r.id === "permissions")?.error || null,
    },
    wordpress_simulation: {
      status: results.find((r) => r.id === "wp_simulation")?.success
        ? "successful"
        : "failed",
      update_detected:
        results.find((r) => r.id === "wp_simulation")?.updateAvailable || false,
      current_version:
        results.find((r) => r.id === "wp_simulation")?.currentVersion || null,
      remote_version:
        results.find((r) => r.id === "wp_simulation")?.remoteVersion || null,
      http_status:
        results.find((r) => r.id === "wp_simulation")?.httpStatus || 0,
      error: results.find((r) => r.id === "wp_simulation")?.error || null,
    },
    summary: {
      total_checks: results.length,
      passed: results.filter((r) => r.success !== false).length,
      failed: results.filter((r) => r.success === false).length,
      overall_status: allSuccessful
        ? "✅ ALL CHECKS PASSED"
        : "❌ SOME CHECKS FAILED",
    },
  };

  // Crear directorio si no existe
  const reportDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Guardar reporte
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado en: ${REPORT_PATH}`, "green");

  // Mostrar resumen
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bright}📊 RESUMEN EJECUTIVO${colors.reset}`);
  console.log("=".repeat(60));
  console.log(
    `\n${colors.cyan}Estado General:${colors.reset} ${report.summary.overall_status}`,
  );
  console.log(
    `${colors.cyan}Checks Totales:${colors.reset} ${report.summary.total_checks}`,
  );
  console.log(
    `${colors.green}Exitosos:${colors.reset} ${report.summary.passed}`,
  );
  console.log(`${colors.red}Fallidos:${colors.reset} ${report.summary.failed}`);
  console.log(
    `\n${colors.bright}${colors.magenta}${report.status}${colors.reset}\n`,
  );

  return report;
}

// ============================================================
// 🚀 FUNCIÓN PRINCIPAL
// ============================================================

async function main() {
  console.log("\n");
  console.log("=".repeat(60));
  console.log(
    `${colors.bright}${colors.magenta}🧩 DOZO Update Server Sync v1.0.0${colors.reset}`,
  );
  console.log(`${colors.cyan}Sistema: DOZO System by RockStage${colors.reset}`);
  console.log(`${colors.cyan}Proyecto: Warranty System RS${colors.reset}`);
  console.log("=".repeat(60));
  console.log("\n");

  const results = [];
  let ftpClient = null;

  try {
    // PASO 1: Conexión FTP
    logSection("🌐 PASO 1: CONEXIÓN FTP");
    const ftpConnection = await connectFTP();
    ftpClient = ftpConnection.client;
    results.push({
      id: "ftp_connection",
      ...ftpConnection,
    });

    if (!ftpConnection.success) {
      throw new Error("No se pudo establecer conexión FTP");
    }

    // Listar archivos
    const filesList = await listRemoteFiles(ftpClient, REMOTE_PATH);

    // PASO 2: Validar update.json
    const updateJsonResult = await validateUpdateJson(ftpClient, REMOTE_PATH);
    results.push({
      id: "update_json",
      ...updateJsonResult,
    });

    // PASO 3: Verificar ZIP
    const zipResult = await verifyZipFile(ftpClient, REMOTE_PATH, EXPECTED_ZIP);
    results.push({
      id: "zip_verification",
      ...zipResult,
    });

    // PASO 4: Revisar permisos
    const permissionsResult = await checkPermissions(ftpClient, REMOTE_PATH);
    results.push({
      id: "permissions",
      ...permissionsResult,
    });

    // PASO 5: Simular actualización WordPress
    const updateJsonUrl =
      updateJsonResult.data?.download_url?.replace(
        EXPECTED_ZIP,
        UPDATE_JSON_FILE,
      ) || `https://updates.vapedot.mx/warranty-system-rs/${UPDATE_JSON_FILE}`;
    const wpSimResult = await simulateWordPressUpdate(updateJsonUrl);
    results.push({
      id: "wp_simulation",
      ...wpSimResult,
    });

    // PASO 6: Generar reporte
    const report = generateReport(results);
  } catch (error) {
    log("❌", `Error crítico: ${error.message}`, "red");

    // Generar reporte incluso en caso de error
    if (results.length > 0) {
      generateReport(results);
    }
  } finally {
    // Cerrar conexión FTP
    if (ftpClient) {
      ftpClient.close();
      log("👋", "Conexión FTP cerrada", "cyan");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    `${colors.bright}${colors.green}🎉 PROCESO COMPLETADO${colors.reset}`,
  );
  console.log("=".repeat(60) + "\n");
}

// ============================================================
// 🎬 EJECUCIÓN
// ============================================================

main().catch((error) => {
  console.error(`${colors.red}💥 Error fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});

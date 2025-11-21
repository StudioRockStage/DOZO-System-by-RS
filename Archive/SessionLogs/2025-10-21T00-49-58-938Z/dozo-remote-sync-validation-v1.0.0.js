#!/usr/bin/env node

// ============================================================
// 🧮 DOZO Update Server Sync v1.0.0 (Remote Validation & Access Check)
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-19
// ============================================================

import ftp from "basic-ftp";
import fs from "fs/promises";
import path from "path";
import https from "https";
import http from "http";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  ftp: {
    host: "82.29.86.182",
    port: 21,
    user: "u461169968",
    password: "RSN5$4n1XJx6l2:m",
    secure: false,
  },
  remotePath: "/public_html/updates/warranty-system-rs",
  updateJsonFile: "update.json",
  zipFile: "warranty-system-rs.zip",
  downloadUrl:
    "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs.zip",
  updateJsonUrl: "https://updates.vapedot.mx/warranty-system-rs/update.json",
  expectedVersion: "1.0.0",
  reportPath: path.join(
    process.env.HOME,
    "Documents",
    "Dozo System by RS",
    "Global",
    "DOZO-RemoteSyncReport.json",
  ),
};

// ============================================================
// 🎨 UTILIDADES DE CONSOLA
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

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner(text) {
  const line = "=".repeat(60);
  log(`\n${line}`, "cyan");
  log(`  ${text}`, "bright");
  log(`${line}\n`, "cyan");
}

function step(emoji, text) {
  log(`\n${emoji} ${text}`, "blue");
  log("─".repeat(60), "cyan");
}

// ============================================================
// 🌐 FUNCIONES DE RED
// ============================================================

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function checkHttpAccess(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.request(url, { method: "HEAD" }, (res) => {
      resolve({
        accessible: res.statusCode === 200,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
      });
    });

    req.on("error", (err) => {
      resolve({
        accessible: false,
        error: err.message,
      });
    });

    req.end();
  });
}

function calculateSHA256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ============================================================
// 📁 FTP OPERATIONS
// ============================================================

class FTPValidator {
  constructor(config) {
    this.config = config;
    this.client = new ftp.Client();
    this.client.ftp.verbose = false;
    this.report = {
      timestamp: new Date().toISOString(),
      status: "PENDING",
      connection: {},
      updateJson: {},
      zipFile: {},
      permissions: {},
      wordpressSimulation: {},
      errors: [],
    };
  }

  async connect() {
    step("🌐", "Conexión FTP y verificación de acceso remoto");

    try {
      await this.client.access({
        host: this.config.ftp.host,
        port: this.config.ftp.port,
        user: this.config.ftp.user,
        password: this.config.ftp.password,
        secure: this.config.ftp.secure,
      });

      this.report.connection.status = "SUCCESS";
      this.report.connection.host = this.config.ftp.host;
      this.report.connection.port = this.config.ftp.port;

      log(`✓ Conectado a ${this.config.ftp.host}`, "green");

      // Cambiar al directorio remoto
      await this.client.cd(this.config.remotePath);
      const currentPath = await this.client.pwd();
      this.report.connection.remotePath = currentPath;

      log(`✓ Directorio remoto: ${currentPath}`, "green");

      // Listar contenido
      const files = await this.client.list();
      this.report.connection.fileCount = files.length;
      this.report.connection.files = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type === 1 ? "file" : "directory",
        permissions: f.permissions
          ? f.permissions.user + f.permissions.group + f.permissions.world
          : "unknown",
      }));

      log(`✓ Archivos encontrados: ${files.length}`, "green");
      files.forEach((f) => {
        const icon = f.type === 1 ? "📄" : "📁";
        log(`  ${icon} ${f.name} (${f.size} bytes)`, "cyan");
      });

      return true;
    } catch (error) {
      this.report.connection.status = "FAILED";
      this.report.connection.error = error.message;
      this.report.errors.push(`Connection failed: ${error.message}`);
      log(`✗ Error de conexión: ${error.message}`, "red");
      return false;
    }
  }

  async validateUpdateJson() {
    step("🧾", "Validar contenido de update.json");

    try {
      // Descargar update.json desde FTP
      const tempPath = "/tmp/update.json";
      await this.client.downloadTo(tempPath, this.config.updateJsonFile);

      const content = await fs.readFile(tempPath, "utf8");
      const updateData = JSON.parse(content);

      this.report.updateJson.status = "VALID";
      this.report.updateJson.content = updateData;

      // Validar campos requeridos
      const requiredFields = [
        "version",
        "download_url",
        "tested",
        "requires",
        "requires_php",
      ];
      const missingFields = requiredFields.filter(
        (field) => !updateData[field],
      );

      if (missingFields.length > 0) {
        this.report.updateJson.status = "INCOMPLETE";
        this.report.updateJson.missingFields = missingFields;
        log(`⚠ Campos faltantes: ${missingFields.join(", ")}`, "yellow");
      } else {
        log(`✓ Todos los campos requeridos presentes`, "green");
      }

      // Mostrar contenido
      log(`\nContenido de update.json:`, "cyan");
      Object.entries(updateData).forEach(([key, value]) => {
        log(`  ${key}: ${value}`, "cyan");
      });

      // Validar versión
      if (updateData.version === this.config.expectedVersion) {
        log(`✓ Versión coincide: ${updateData.version}`, "green");
      } else {
        log(
          `⚠ Versión diferente. Esperada: ${this.config.expectedVersion}, Encontrada: ${updateData.version}`,
          "yellow",
        );
      }

      // Verificar acceso HTTP a update.json
      log(`\nVerificando acceso HTTP...`, "cyan");
      const httpCheck = await checkHttpAccess(this.config.updateJsonUrl);
      this.report.updateJson.httpAccess = httpCheck;

      if (httpCheck.accessible) {
        log(
          `✓ update.json accesible vía HTTP (${httpCheck.statusCode})`,
          "green",
        );
      } else {
        log(`✗ update.json no accesible vía HTTP`, "red");
        if (httpCheck.error) {
          log(`  Error: ${httpCheck.error}`, "red");
        }
      }

      await fs.unlink(tempPath);
      return true;
    } catch (error) {
      this.report.updateJson.status = "FAILED";
      this.report.updateJson.error = error.message;
      this.report.errors.push(
        `Update JSON validation failed: ${error.message}`,
      );
      log(`✗ Error validando update.json: ${error.message}`, "red");
      return false;
    }
  }

  async verifyZipFile() {
    step("📦", "Verificación del ZIP remoto");

    try {
      // Obtener información del archivo en FTP
      const files = await this.client.list();

      // Buscar archivo ZIP (puede tener nombre con versión)
      let zipInfo = files.find((f) => f.name === this.config.zipFile);

      // Si no se encuentra, buscar cualquier .zip
      if (!zipInfo) {
        zipInfo = files.find((f) => f.name.endsWith(".zip"));
      }

      if (!zipInfo) {
        throw new Error("Archivo ZIP no encontrado en el servidor FTP");
      }

      // Actualizar nombre del archivo si es diferente
      const zipFileName = zipInfo.name;
      if (zipFileName !== this.config.zipFile) {
        log(`⚠ Archivo ZIP tiene nombre diferente: ${zipFileName}`, "yellow");
      }

      this.report.zipFile.ftpStatus = "FOUND";
      this.report.zipFile.fileName = zipFileName;
      this.report.zipFile.size = zipInfo.size;
      this.report.zipFile.sizeReadable = `${(zipInfo.size / 1024 / 1024).toFixed(2)} MB`;

      log(`✓ ZIP encontrado en FTP: ${zipFileName}`, "green");
      log(`  Tamaño: ${this.report.zipFile.sizeReadable}`, "cyan");

      // Descargar ZIP para calcular checksum
      log(`\nDescargando ZIP para validación...`, "cyan");
      const tempZipPath = "/tmp/warranty-system-rs.zip";
      await this.client.downloadTo(tempZipPath, zipFileName);

      const zipBuffer = await fs.readFile(tempZipPath);
      const sha256 = calculateSHA256(zipBuffer);

      this.report.zipFile.sha256 = sha256;
      log(`✓ SHA256: ${sha256}`, "green");

      // Verificar acceso HTTP
      log(`\nVerificando acceso HTTP al ZIP...`, "cyan");
      const httpCheck = await checkHttpAccess(this.config.downloadUrl);
      this.report.zipFile.httpAccess = httpCheck;

      if (httpCheck.accessible) {
        log(`✓ ZIP accesible vía HTTP (${httpCheck.statusCode})`, "green");
        if (httpCheck.headers["content-length"]) {
          const httpSize = parseInt(httpCheck.headers["content-length"]);
          log(
            `  Tamaño HTTP: ${(httpSize / 1024 / 1024).toFixed(2)} MB`,
            "cyan",
          );

          if (httpSize === zipInfo.size) {
            log(`✓ Tamaño coincide con FTP`, "green");
          } else {
            log(`⚠ Tamaño HTTP difiere del FTP`, "yellow");
          }
        }
      } else {
        log(`✗ ZIP no accesible vía HTTP`, "red");
        if (httpCheck.error) {
          log(`  Error: ${httpCheck.error}`, "red");
        }
      }

      await fs.unlink(tempZipPath);
      return true;
    } catch (error) {
      this.report.zipFile.status = "FAILED";
      this.report.zipFile.error = error.message;
      this.report.errors.push(`ZIP verification failed: ${error.message}`);
      log(`✗ Error verificando ZIP: ${error.message}`, "red");
      return false;
    }
  }

  async checkPermissions() {
    step("🔐", "Revisión y corrección de permisos");

    try {
      const files = await this.client.list();
      this.report.permissions.checked = [];
      this.report.permissions.corrected = [];

      log(`Analizando permisos...`, "cyan");

      for (const file of files) {
        const perms = file.permissions;
        let expectedPerms;

        if (file.type === 1) {
          // archivo
          expectedPerms = "rwrr"; // 644
        } else {
          // directorio
          expectedPerms = "rwxrxrx"; // 755
        }

        const currentPerms = perms
          ? `${perms.user}${perms.group}${perms.world}`
          : "unknown";

        this.report.permissions.checked.push({
          name: file.name,
          type: file.type === 1 ? "file" : "directory",
          current: currentPerms,
          expected: expectedPerms,
        });

        const icon = file.type === 1 ? "📄" : "📁";
        log(`  ${icon} ${file.name}: ${currentPerms}`, "cyan");

        // Nota: La corrección automática de permisos requiere comandos SITE CHMOD
        // que pueden no estar disponibles en todos los servidores FTP
        // Por ahora solo reportamos
      }

      this.report.permissions.status = "CHECKED";
      log(`✓ Revisión de permisos completada`, "green");
      log(
        `  ℹ Nota: La corrección automática de permisos puede requerir acceso shell`,
        "yellow",
      );

      return true;
    } catch (error) {
      this.report.permissions.status = "FAILED";
      this.report.permissions.error = error.message;
      log(`⚠ Error revisando permisos: ${error.message}`, "yellow");
      return true; // No es crítico
    }
  }

  async simulateWordPressUpdate() {
    step("🔍", "Simulación de actualización WordPress");

    try {
      log(`Simulando petición de WordPress...`, "cyan");

      // Descargar update.json como lo haría WordPress
      const updateJsonData = await downloadFile(this.config.updateJsonUrl);
      const updateInfo = JSON.parse(updateJsonData.toString());

      this.report.wordpressSimulation.updateJsonReceived = updateInfo;
      this.report.wordpressSimulation.remoteVersion = updateInfo.version;

      log(`\nInformación de actualización recibida:`, "cyan");
      log(`  Versión remota: ${updateInfo.version}`, "cyan");
      log(`  URL de descarga: ${updateInfo.download_url}`, "cyan");
      log(`  WordPress probado: ${updateInfo.tested}`, "cyan");
      log(`  Requiere WP: ${updateInfo.requires}`, "cyan");
      log(`  Requiere PHP: ${updateInfo.requires_php}`, "cyan");

      // Simular versión instalada
      const installedVersion = "0.9.9"; // Versión anterior para simular detección
      this.report.wordpressSimulation.installedVersion = installedVersion;

      // Comparar versiones
      const remoteVersion = updateInfo.version;
      const updateAvailable =
        this.compareVersions(remoteVersion, installedVersion) > 0;

      this.report.wordpressSimulation.updateDetected = updateAvailable;

      if (updateAvailable) {
        log(`\n✓ Actualización detectada correctamente`, "green");
        log(
          `  Instalada: ${installedVersion} → Disponible: ${remoteVersion}`,
          "green",
        );
        this.report.wordpressSimulation.status = "UPDATE_DETECTED";
      } else {
        log(`\n⚠ No se detectó actualización`, "yellow");
        log(
          `  Instalada: ${installedVersion}, Remota: ${remoteVersion}`,
          "yellow",
        );
        this.report.wordpressSimulation.status = "NO_UPDATE";
      }

      // Verificar que el ZIP sea descargable
      log(`\nVerificando descarga del ZIP...`, "cyan");
      const zipCheck = await checkHttpAccess(updateInfo.download_url);

      if (zipCheck.accessible) {
        log(`✓ ZIP descargable desde URL especificada`, "green");
        this.report.wordpressSimulation.zipDownloadable = true;
      } else {
        log(`✗ ZIP no descargable`, "red");
        this.report.wordpressSimulation.zipDownloadable = false;
      }

      return true;
    } catch (error) {
      this.report.wordpressSimulation.status = "FAILED";
      this.report.wordpressSimulation.error = error.message;
      this.report.errors.push(`WordPress simulation failed: ${error.message}`);
      log(`✗ Error en simulación WordPress: ${error.message}`, "red");
      return false;
    }
  }

  compareVersions(v1, v2) {
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

  async generateReport() {
    step("🩶", "Registro DOZO");

    try {
      // Determinar estado final
      const allSuccessful =
        this.report.connection.status === "SUCCESS" &&
        this.report.updateJson.status === "VALID" &&
        this.report.zipFile.ftpStatus === "FOUND" &&
        (this.report.wordpressSimulation.status === "UPDATE_DETECTED" ||
          this.report.wordpressSimulation.status === "NO_UPDATE");

      if (allSuccessful && this.report.errors.length === 0) {
        this.report.status = "REMOTE_SYNC_SUCCESSFUL";
      } else if (this.report.errors.length > 0) {
        this.report.status = "REMOTE_SYNC_FAILED";
      } else {
        this.report.status = "REMOTE_SYNC_PARTIAL";
      }

      // Asegurar que el directorio existe
      const reportDir = path.dirname(this.config.reportPath);
      await fs.mkdir(reportDir, { recursive: true });

      // Guardar reporte
      await fs.writeFile(
        this.config.reportPath,
        JSON.stringify(this.report, null, 2),
        "utf8",
      );

      log(`\n✓ Reporte guardado en:`, "green");
      log(`  ${this.config.reportPath}`, "cyan");

      // Mostrar resumen
      log(`\n${"=".repeat(60)}`, "cyan");
      log(`  ESTADO FINAL: ${this.report.status}`, "bright");
      log(`${"=".repeat(60)}`, "cyan");

      if (this.report.status === "REMOTE_SYNC_SUCCESSFUL") {
        log(`\n✓ Todas las validaciones completadas exitosamente`, "green");
      } else {
        log(
          `\n⚠ Algunas validaciones fallaron o tienen advertencias`,
          "yellow",
        );
        if (this.report.errors.length > 0) {
          log(`\nErrores encontrados:`, "red");
          this.report.errors.forEach((err) => {
            log(`  • ${err}`, "red");
          });
        }
      }

      return true;
    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, "red");
      return false;
    }
  }

  async disconnect() {
    this.client.close();
    log(`\n✓ Desconectado del servidor FTP`, "cyan");
  }

  async run() {
    banner("🧮 DOZO Update Server Sync v1.0.0");
    log("Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)", "cyan");
    log("Proyecto: Warranty System RS", "cyan");
    log(`Fecha: ${new Date().toLocaleString("es-MX")}`, "cyan");

    try {
      const connected = await this.connect();
      if (!connected) {
        log(`\n✗ No se pudo establecer conexión. Abortando.`, "red");
        await this.generateReport();
        return;
      }

      await this.validateUpdateJson();
      await this.verifyZipFile();
      await this.checkPermissions();
      await this.simulateWordPressUpdate();
      await this.generateReport();

      await this.disconnect();

      log(`\n${"=".repeat(60)}`, "green");
      log(`  ✓ VALIDACIÓN REMOTA COMPLETADA`, "green");
      log(`${"=".repeat(60)}`, "green");
    } catch (error) {
      log(`\n✗ Error fatal: ${error.message}`, "red");
      this.report.status = "FATAL_ERROR";
      this.report.fatalError = error.message;
      await this.generateReport();
    }
  }
}

// ============================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================

async function main() {
  const validator = new FTPValidator(CONFIG);
  await validator.run();
}

// Ejecutar
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});

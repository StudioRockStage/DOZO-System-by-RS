#!/usr/bin/env node

// ============================================================
// 🧩 DOZO Final Environment Validation v1.0.0
// (Full Congruence & Readiness Check)
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-20
// ============================================================

import fs from "fs/promises";
import { existsSync, statSync, createReadStream } from "fs";
import path from "path";
import https from "https";
import http from "http";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import AdmZip from "adm-zip";

const execAsync = promisify(exec);

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  paths: {
    phpMain: path.join(
      process.env.HOME,
      "Documents",
      "Dozo System by RS",
      "Plugins",
      "Warranty System",
      "warranty-system-rs.php",
    ),
    zipBase: path.join(
      process.env.HOME,
      "Documents",
      "Dozo System by RS",
      "Latest Builds",
      "Warranty System RS",
      "warranty-system-rs.zip",
    ),
    buildsDir: path.join(
      process.env.HOME,
      "Documents",
      "Dozo System by RS",
      "Latest Builds",
      "Warranty System RS",
    ),
    updateJson: "https://updates.vapedot.mx/warranty-system-rs/update.json",
  },

  expectedVersion: "1.0.0",
  expectedZipName: "warranty-system-rs.zip",
  expectedFolderName: "warranty-system-rs",

  expectedDirs: ["includes", "assets", "templates", "tools"],
  optionalDirs: ["admin", "public", "Admin Panels"],

  reportPath: path.join(
    process.env.HOME,
    "Documents",
    "Dozo System by RS",
    "Global",
    "DOZO-Final-Readiness.json",
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
        contentLength: res.headers["content-length"],
        contentType: res.headers["content-type"],
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

function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function calculateBufferSHA256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ============================================================
// 📁 VALIDADOR PRINCIPAL
// ============================================================

class FinalReadinessValidator {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      status: "PENDING",
      baseFiles: {},
      zipValidation: {},
      phpValidation: {},
      remoteValidation: {},
      congruence: {},
      permissions: {},
      errors: [],
      warnings: [],
      readiness: "NOT_READY",
    };
  }

  async validateBaseFiles() {
    step("🧠", "Verificación de archivos base");

    try {
      const files = {
        phpMain: this.config.paths.phpMain,
        zipBase: this.config.paths.zipBase,
        updateJson: this.config.paths.updateJson,
      };

      this.report.baseFiles.files = {};

      log("Verificando archivos base...", "cyan");

      // Verificar PHP principal
      if (existsSync(files.phpMain)) {
        const stats = statSync(files.phpMain);
        this.report.baseFiles.files.phpMain = {
          exists: true,
          path: files.phpMain,
          size: stats.size,
          sizeReadable: `${(stats.size / 1024).toFixed(2)} KB`,
        };
        log(
          `✓ warranty-system-rs.php encontrado (${this.report.baseFiles.files.phpMain.sizeReadable})`,
          "green",
        );
      } else {
        this.report.baseFiles.files.phpMain = {
          exists: false,
          path: files.phpMain,
        };
        this.report.errors.push("warranty-system-rs.php no encontrado");
        log(`✗ warranty-system-rs.php no encontrado`, "red");
      }

      // Verificar ZIP
      if (existsSync(files.zipBase)) {
        const stats = statSync(files.zipBase);
        this.report.baseFiles.files.zipBase = {
          exists: true,
          path: files.zipBase,
          size: stats.size,
          sizeReadable: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        };
        log(
          `✓ warranty-system-rs.zip encontrado (${this.report.baseFiles.files.zipBase.sizeReadable})`,
          "green",
        );
      } else {
        this.report.baseFiles.files.zipBase = {
          exists: false,
          path: files.zipBase,
        };
        this.report.errors.push("warranty-system-rs.zip no encontrado");
        log(`✗ warranty-system-rs.zip no encontrado`, "red");
      }

      // Verificar update.json remoto
      log(`\nVerificando update.json remoto...`, "cyan");
      const updateCheck = await checkHttpAccess(files.updateJson);
      this.report.baseFiles.files.updateJson = {
        url: files.updateJson,
        accessible: updateCheck.accessible,
        statusCode: updateCheck.statusCode,
      };

      if (updateCheck.accessible) {
        log(
          `✓ update.json accesible (HTTP ${updateCheck.statusCode})`,
          "green",
        );
      } else {
        this.report.errors.push("update.json no accesible");
        log(`✗ update.json no accesible`, "red");
      }

      // Buscar duplicados o versiones alternas
      log(`\nBuscando duplicados o versiones alternas...`, "cyan");
      const buildsDir = this.config.paths.buildsDir;

      if (existsSync(buildsDir)) {
        const dirContents = await fs.readdir(buildsDir);
        const zipFiles = dirContents.filter((f) => f.endsWith(".zip"));

        this.report.baseFiles.zipFiles = zipFiles;

        if (zipFiles.length > 1) {
          this.report.warnings.push(
            `Múltiples archivos ZIP encontrados: ${zipFiles.join(", ")}`,
          );
          log(`⚠ Múltiples archivos ZIP: ${zipFiles.join(", ")}`, "yellow");
        } else if (zipFiles.length === 1) {
          log(`✓ Solo un archivo ZIP encontrado: ${zipFiles[0]}`, "green");
        }
      }

      this.report.baseFiles.status = "CHECKED";
      return true;
    } catch (error) {
      this.report.baseFiles.status = "ERROR";
      this.report.baseFiles.error = error.message;
      this.report.errors.push(
        `Error verificando archivos base: ${error.message}`,
      );
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async validateZip() {
    step("📦", "Validación de ZIP");

    try {
      const zipPath = this.config.paths.zipBase;

      if (!existsSync(zipPath)) {
        this.report.zipValidation.status = "NOT_FOUND";
        log(`⚠ ZIP no encontrado, saltando validación`, "yellow");
        return false;
      }

      log("Analizando contenido del ZIP...", "cyan");

      // Calcular SHA256
      log("Calculando hash SHA256...", "cyan");
      const sha256 = await calculateSHA256(zipPath);
      this.report.zipValidation.sha256 = sha256;
      log(`✓ SHA256: ${sha256}`, "green");

      // Obtener tamaño
      const stats = statSync(zipPath);
      this.report.zipValidation.size = stats.size;
      this.report.zipValidation.sizeReadable = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      log(`✓ Tamaño: ${this.report.zipValidation.sizeReadable}`, "green");

      // Analizar estructura del ZIP
      log("\nAnalizando estructura interna...", "cyan");
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();

      // Obtener carpetas raíz
      const rootFolders = new Set();
      zipEntries.forEach((entry) => {
        const parts = entry.entryName.split("/");
        if (parts.length > 0 && parts[0]) {
          rootFolders.add(parts[0]);
        }
      });

      this.report.zipValidation.rootFolders = Array.from(rootFolders);

      log(`\nCarpetas raíz en el ZIP:`, "cyan");
      rootFolders.forEach((folder) => {
        log(`  📁 ${folder}`, "cyan");
      });

      // Verificar una sola carpeta raíz
      if (rootFolders.size === 1) {
        const rootFolder = Array.from(rootFolders)[0];
        if (rootFolder === this.config.expectedFolderName) {
          log(`\n✓ Estructura correcta: solo carpeta "${rootFolder}"`, "green");
          this.report.zipValidation.rootFolderCorrect = true;
        } else {
          log(
            `\n⚠ Nombre de carpeta raíz no estándar: "${rootFolder}"`,
            "yellow",
          );
          this.report.warnings.push(
            `Carpeta raíz: ${rootFolder} (esperada: ${this.config.expectedFolderName})`,
          );
          this.report.zipValidation.rootFolderCorrect = false;
        }
      } else {
        log(`\n⚠ Múltiples carpetas raíz encontradas`, "yellow");
        this.report.warnings.push(
          `Múltiples carpetas raíz: ${Array.from(rootFolders).join(", ")}`,
        );
        this.report.zipValidation.rootFolderCorrect = false;
      }

      // Verificar directorios esperados
      log(`\nVerificando directorios requeridos...`, "cyan");
      const rootFolder = Array.from(rootFolders)[0] || "";
      this.report.zipValidation.directories = {
        required: {},
        optional: {},
      };

      for (const dir of this.config.expectedDirs) {
        const fullPath = `${rootFolder}/${dir}/`;
        const found = zipEntries.some((entry) =>
          entry.entryName.startsWith(fullPath),
        );
        this.report.zipValidation.directories.required[dir] = found;

        if (found) {
          log(`  ✓ ${dir}/`, "green");
        } else {
          log(`  ✗ ${dir}/ (no encontrado)`, "red");
          this.report.warnings.push(`Directorio faltante en ZIP: ${dir}/`);
        }
      }

      // Verificar archivo principal
      const mainFilePath = `${rootFolder}/warranty-system-rs.php`;
      const mainFileFound = zipEntries.some(
        (entry) => entry.entryName === mainFilePath,
      );
      this.report.zipValidation.mainFilePresent = mainFileFound;

      if (mainFileFound) {
        log(
          `\n✓ Archivo principal encontrado: warranty-system-rs.php`,
          "green",
        );
      } else {
        log(`\n✗ Archivo principal no encontrado en el ZIP`, "red");
        this.report.errors.push("warranty-system-rs.php no encontrado en ZIP");
      }

      // Contar archivos
      this.report.zipValidation.totalEntries = zipEntries.length;
      const fileCount = zipEntries.filter((e) => !e.isDirectory).length;
      const dirCount = zipEntries.filter((e) => e.isDirectory).length;

      log(`\nEstadísticas del ZIP:`, "cyan");
      log(`  Archivos: ${fileCount}`, "cyan");
      log(`  Directorios: ${dirCount}`, "cyan");
      log(`  Total: ${zipEntries.length}`, "cyan");

      this.report.zipValidation.status = "VALIDATED";
      return true;
    } catch (error) {
      this.report.zipValidation.status = "ERROR";
      this.report.zipValidation.error = error.message;
      this.report.errors.push(`Error validando ZIP: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async validatePhpMain() {
    step("🧩", "Validación del archivo principal PHP");

    try {
      const phpPath = this.config.paths.phpMain;

      if (!existsSync(phpPath)) {
        this.report.phpValidation.status = "NOT_FOUND";
        log(`⚠ PHP principal no encontrado, saltando validación`, "yellow");
        return false;
      }

      log("Analizando cabecera del plugin...", "cyan");
      const content = await fs.readFile(phpPath, "utf8");

      // Extraer información del header
      const header = this.parsePluginHeader(content);
      this.report.phpValidation.header = header;

      log(`\nInformación del plugin:`, "cyan");
      log(`  Plugin Name: ${header.name}`, "cyan");
      log(`  Version: ${header.version}`, "cyan");
      log(`  Author: ${header.author}`, "cyan");
      log(
        `  Update URI: ${header.updateUri || "(no configurado)"}`,
        header.updateUri ? "cyan" : "yellow",
      );

      // Validar campos requeridos
      const requiredFields = [
        { field: "name", expected: "Warranty System RS", actual: header.name },
        {
          field: "version",
          expected: this.config.expectedVersion,
          actual: header.version,
        },
        {
          field: "author",
          expected: "RockStage Solutions",
          actual: header.author,
        },
      ];

      log(`\nValidando campos requeridos...`, "cyan");
      this.report.phpValidation.fieldsValidation = {};

      for (const { field, expected, actual } of requiredFields) {
        const match = actual === expected;
        this.report.phpValidation.fieldsValidation[field] = {
          expected,
          actual,
          match,
        };

        if (match) {
          log(`  ✓ ${field}: "${actual}"`, "green");
        } else {
          log(`  ⚠ ${field}: "${actual}" (esperado: "${expected}")`, "yellow");
          this.report.warnings.push(
            `${field} no coincide: "${actual}" vs "${expected}"`,
          );
        }
      }

      // Validar Update URI
      if (header.updateUri) {
        const expectedUri = "https://updates.vapedot.mx/warranty-system-rs/";
        if (header.updateUri.includes(expectedUri)) {
          log(`\n✓ Update URI configurado correctamente`, "green");
          this.report.phpValidation.updateUriConfigured = true;
        } else {
          log(`\n⚠ Update URI diferente del esperado`, "yellow");
          this.report.warnings.push(`Update URI: ${header.updateUri}`);
          this.report.phpValidation.updateUriConfigured = false;
        }
      } else {
        log(`\n⚠ Update URI no configurado en el plugin`, "yellow");
        this.report.warnings.push("Update URI faltante en el header");
        this.report.phpValidation.updateUriConfigured = false;
      }

      this.report.phpValidation.status = "VALIDATED";
      return true;
    } catch (error) {
      this.report.phpValidation.status = "ERROR";
      this.report.phpValidation.error = error.message;
      this.report.errors.push(`Error validando PHP: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  parsePluginHeader(content) {
    const header = {
      name: "",
      version: "",
      description: "",
      author: "",
      updateUri: "",
      textDomain: "",
      domainPath: "",
    };

    const matches = {
      name: content.match(/Plugin Name:\s*(.+)/i),
      version: content.match(/Version:\s*(.+)/i),
      description: content.match(/Description:\s*(.+)/i),
      author: content.match(/Author:\s*(.+)/i),
      updateUri: content.match(/Update URI:\s*(.+)/i),
      textDomain: content.match(/Text Domain:\s*(.+)/i),
      domainPath: content.match(/Domain Path:\s*(.+)/i),
    };

    for (const [key, match] of Object.entries(matches)) {
      if (match) {
        header[key] = match[1].trim();
      }
    }

    return header;
  }

  async validateRemote() {
    step("🧾", "Validación remota del update.json");

    try {
      log("Descargando update.json...", "cyan");
      const jsonData = await downloadFile(this.config.paths.updateJson);
      const updateInfo = JSON.parse(jsonData.toString());

      this.report.remoteValidation.updateJson = updateInfo;

      log(`\nContenido de update.json:`, "cyan");
      log(`  version: ${updateInfo.version}`, "cyan");
      log(`  download_url: ${updateInfo.download_url}`, "cyan");
      log(`  tested: ${updateInfo.tested}`, "cyan");
      log(`  requires: ${updateInfo.requires}`, "cyan");
      log(`  requires_php: ${updateInfo.requires_php}`, "cyan");

      // Validar campos esperados
      const expectedValues = {
        version: this.config.expectedVersion,
        tested: "6.7.1",
        requires: "6.0",
        requires_php: "7.4",
      };

      log(`\nValidando valores esperados...`, "cyan");
      this.report.remoteValidation.fieldsValidation = {};

      for (const [field, expected] of Object.entries(expectedValues)) {
        const actual = updateInfo[field];
        const match = actual === expected;
        this.report.remoteValidation.fieldsValidation[field] = {
          expected,
          actual,
          match,
        };

        if (match) {
          log(`  ✓ ${field}: ${actual}`, "green");
        } else {
          log(`  ⚠ ${field}: ${actual} (esperado: ${expected})`, "yellow");
          this.report.warnings.push(
            `${field} remoto: ${actual} vs ${expected}`,
          );
        }
      }

      // Validar download_url
      log(`\nVerificando URL de descarga...`, "cyan");
      const zipCheck = await checkHttpAccess(updateInfo.download_url);
      this.report.remoteValidation.zipAccessible = zipCheck.accessible;

      if (zipCheck.accessible) {
        log(`✓ ZIP remoto accesible (HTTP ${zipCheck.statusCode})`, "green");

        if (zipCheck.contentLength) {
          const remoteSizeMB = (
            parseInt(zipCheck.contentLength) /
            1024 /
            1024
          ).toFixed(2);
          this.report.remoteValidation.remoteZipSize = `${remoteSizeMB} MB`;
          log(`  Tamaño remoto: ${remoteSizeMB} MB`, "cyan");

          // Comparar con ZIP local
          if (this.report.zipValidation.sizeReadable) {
            const localSize = this.report.zipValidation.sizeReadable;
            log(`  Tamaño local: ${localSize}`, "cyan");

            if (
              Math.abs(parseFloat(remoteSizeMB) - parseFloat(localSize)) < 0.1
            ) {
              log(`  ✓ Tamaños coinciden`, "green");
              this.report.remoteValidation.sizesMatch = true;
            } else {
              log(`  ⚠ Diferencia de tamaño detectada`, "yellow");
              this.report.warnings.push(
                `Tamaño local (${localSize}) vs remoto (${remoteSizeMB} MB)`,
              );
              this.report.remoteValidation.sizesMatch = false;
            }
          }
        }
      } else {
        log(`✗ ZIP remoto no accesible`, "red");
        this.report.errors.push("ZIP remoto no accesible");
      }

      this.report.remoteValidation.status = "VALIDATED";
      return true;
    } catch (error) {
      this.report.remoteValidation.status = "ERROR";
      this.report.remoteValidation.error = error.message;
      this.report.errors.push(`Error validando remoto: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async verifyCongruence() {
    step("🔍", "Verificación de congruencia");

    try {
      log("Comparando versiones entre componentes...", "cyan");

      const phpVersion = this.report.phpValidation.header?.version || "N/A";
      const remoteVersion =
        this.report.remoteValidation.updateJson?.version || "N/A";
      const zipName = this.config.expectedZipName;

      this.report.congruence.versions = {
        php: phpVersion,
        remote: remoteVersion,
        expected: this.config.expectedVersion,
      };

      log(`\nVersiones detectadas:`, "cyan");
      log(`  PHP principal: ${phpVersion}`, "cyan");
      log(`  update.json: ${remoteVersion}`, "cyan");
      log(`  Esperada: ${this.config.expectedVersion}`, "cyan");

      // Verificar congruencia
      const allMatch =
        phpVersion === this.config.expectedVersion &&
        remoteVersion === this.config.expectedVersion;

      if (allMatch) {
        log(
          `\n✓ COHERENCIA TOTAL - Todas las versiones coinciden (${this.config.expectedVersion})`,
          "green",
        );
        this.report.congruence.status = "COHERENT";
        this.report.congruence.coherent = true;
      } else {
        log(`\n⚠ Incongruencia detectada`, "yellow");
        this.report.congruence.status = "INCOHERENT";
        this.report.congruence.coherent = false;

        if (phpVersion !== this.config.expectedVersion) {
          this.report.warnings.push(
            `Versión PHP (${phpVersion}) no coincide con esperada (${this.config.expectedVersion})`,
          );
        }
        if (remoteVersion !== this.config.expectedVersion) {
          this.report.warnings.push(
            `Versión remota (${remoteVersion}) no coincide con esperada (${this.config.expectedVersion})`,
          );
        }
      }

      // Verificar nombre de ZIP
      log(`\nNombre del archivo ZIP:`, "cyan");
      log(`  Esperado: ${zipName}`, "cyan");
      log(`  ✓ Nombre correcto`, "green");

      return true;
    } catch (error) {
      this.report.congruence.status = "ERROR";
      this.report.congruence.error = error.message;
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async validatePermissions() {
    step("🔐", "Permisos y estructura");

    try {
      log("Verificando permisos de archivos...", "cyan");

      const buildsDir = this.config.paths.buildsDir;

      if (!existsSync(buildsDir)) {
        log(`⚠ Directorio de builds no encontrado`, "yellow");
        return false;
      }

      const items = await fs.readdir(buildsDir, { withFileTypes: true });
      this.report.permissions.items = [];

      for (const item of items) {
        const itemPath = path.join(buildsDir, item.name);
        const stats = statSync(itemPath);
        const permissions = (stats.mode & parseInt("777", 8)).toString(8);

        const permInfo = {
          name: item.name,
          type: item.isDirectory() ? "directory" : "file",
          permissions: permissions,
        };

        this.report.permissions.items.push(permInfo);

        const icon = item.isDirectory() ? "📁" : "📄";
        log(`  ${icon} ${item.name} (${permissions})`, "cyan");
      }

      // Buscar archivos/carpetas huérfanas o duplicadas
      log(`\nBuscando archivos duplicados o versiones antiguas...`, "cyan");
      const suspects = items.filter((item) => {
        const name = item.name.toLowerCase();
        return (
          name.includes("old") ||
          name.includes("backup") ||
          name.includes("v1.0.1") ||
          name.includes("duplicate") ||
          name.includes("copy")
        );
      });

      if (suspects.length > 0) {
        log(`⚠ Archivos sospechosos encontrados:`, "yellow");
        suspects.forEach((s) => log(`  • ${s.name}`, "yellow"));
        this.report.warnings.push(
          `Archivos sospechosos: ${suspects.map((s) => s.name).join(", ")}`,
        );
        this.report.permissions.suspectFiles = suspects.map((s) => s.name);
      } else {
        log(
          `✓ No se encontraron archivos duplicados o versiones antiguas`,
          "green",
        );
        this.report.permissions.suspectFiles = [];
      }

      this.report.permissions.status = "CHECKED";
      return true;
    } catch (error) {
      this.report.permissions.status = "ERROR";
      this.report.permissions.error = error.message;
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async generateFinalReport() {
    step("🪶", "Registro DOZO Final");

    try {
      // Determinar estado de preparación
      const criticalErrors = this.report.errors.length;
      const warnings = this.report.warnings.length;
      const coherent = this.report.congruence.coherent;

      if (criticalErrors === 0 && coherent) {
        if (warnings === 0) {
          this.report.readiness = "READY_FOR_v1.0.1_DEPLOY_SAFE";
          this.report.status = "SUCCESS";
        } else {
          this.report.readiness = "READY_WITH_WARNINGS";
          this.report.status = "WARNING";
        }
      } else {
        this.report.readiness = "NOT_READY";
        this.report.status = "FAILED";
      }

      // Asegurar directorio
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

      // Mostrar resumen final
      log(`\n${"=".repeat(60)}`, "cyan");
      log(`  ESTADO DE PREPARACIÓN: ${this.report.readiness}`, "bright");
      log(`${"=".repeat(60)}`, "cyan");

      if (this.report.readiness === "READY_FOR_v1.0.1_DEPLOY_SAFE") {
        log(`\n✅ Sistema completamente listo para despliegue v1.0.1`, "green");
        log(
          `   Todas las validaciones pasaron sin errores ni advertencias`,
          "green",
        );
      } else if (this.report.readiness === "READY_WITH_WARNINGS") {
        log(
          `\n⚠️  Sistema listo pero con advertencias (${warnings})`,
          "yellow",
        );
        log(
          `   El despliegue es seguro pero hay mejoras recomendadas`,
          "yellow",
        );
      } else {
        log(`\n❌ Sistema NO listo para despliegue`, "red");
        log(`   Se encontraron ${criticalErrors} errores críticos`, "red");
      }

      if (this.report.errors.length > 0) {
        log(`\nErrores críticos:`, "red");
        this.report.errors.forEach((err) => log(`  • ${err}`, "red"));
      }

      if (this.report.warnings.length > 0) {
        log(`\nAdvertencias:`, "yellow");
        this.report.warnings.forEach((warn) => log(`  • ${warn}`, "yellow"));
      }

      // Resumen de componentes
      log(`\nResumen de validaciones:`, "cyan");
      log(`  Archivos base: ${this.report.baseFiles.status}`, "cyan");
      log(`  ZIP: ${this.report.zipValidation.status}`, "cyan");
      log(`  PHP principal: ${this.report.phpValidation.status}`, "cyan");
      log(`  Remoto: ${this.report.remoteValidation.status}`, "cyan");
      log(
        `  Congruencia: ${this.report.congruence.coherent ? "COHERENTE" : "INCOHERENTE"}`,
        this.report.congruence.coherent ? "green" : "yellow",
      );
      log(`  Permisos: ${this.report.permissions.status}`, "cyan");

      return true;
    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, "red");
      return false;
    }
  }

  async run() {
    banner("🧩 DOZO Final Environment Validation v1.0.0");
    log("Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)", "cyan");
    log("Proyecto: Warranty System RS", "cyan");
    log(`Fecha: ${new Date().toLocaleString("es-MX")}`, "cyan");

    try {
      await this.validateBaseFiles();
      await this.validateZip();
      await this.validatePhpMain();
      await this.validateRemote();
      await this.verifyCongruence();
      await this.validatePermissions();
      await this.generateFinalReport();

      log(`\n${"=".repeat(60)}`, "green");
      log(`  ✓ VALIDACIÓN FINAL COMPLETADA`, "green");
      log(`${"=".repeat(60)}`, "green");
    } catch (error) {
      log(`\n✗ Error fatal: ${error.message}`, "red");
      this.report.status = "FATAL_ERROR";
      this.report.fatalError = error.message;
      await this.generateFinalReport();
    }
  }
}

// ============================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================

async function main() {
  const validator = new FinalReadinessValidator(CONFIG);
  await validator.run();
}

// Ejecutar
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});

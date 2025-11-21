#!/usr/bin/env node

// ============================================================
// 🧹 DOZO Base Integrity & ABSPATH AutoFix v1.0.1-Prep
// (Golden Sync)
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-20
// ============================================================

import fs from "fs";
import path from "path";
import { existsSync, statSync, createReadStream } from "fs";
import https from "https";
import AdmZip from "adm-zip";
import crypto from "crypto";

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  paths: {
    mainPhp: path.join(
      process.env.HOME,
      "Documents",
      "DOZO System by RS",
      "Plugins",
      "Warranty System",
      "warranty-system-rs.php",
    ),
    latestBuilds: path.join(
      process.env.HOME,
      "Documents",
      "DOZO System by RS",
      "Latest Builds",
      "Warranty System RS",
    ),
    baseZip: path.join(
      process.env.HOME,
      "Documents",
      "DOZO System by RS",
      "Latest Builds",
      "Warranty System RS",
      "warranty-system-rs.zip",
    ),
    globalReport: path.join(
      process.env.HOME,
      "Documents",
      "DOZO System by RS",
      "Global",
      "DOZO-BaseIntegrity-v1.0.1Prep.json",
    ),
    updateJson: "https://updates.vapedot.mx/warranty-system-rs/update.json",
    pluginSource: path.join(
      process.env.HOME,
      "Documents",
      "DOZO System by RS",
      "Plugins",
      "Warranty System",
    ),
  },

  expectedVersion: "1.0.0",
  expectedStructure: ["includes", "assets", "templates", "tools"],
  abspathCheck: "if ( ! defined( 'ABSPATH' ) ) exit;",
};

// ============================================================
// 🎨 UTILIDADES
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
  log(`\n${"=".repeat(70)}`, "cyan");
  log(`  ${text}`, "bright");
  log(`${"=".repeat(70)}\n`, "cyan");
}

function step(emoji, text) {
  log(`\n${emoji} ${text}`, "blue");
  log("─".repeat(70), "cyan");
}

function removeSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function mkdirpSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copySync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    mkdirpSync(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      copySync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
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

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
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

// ============================================================
// 📁 VALIDADOR PRINCIPAL
// ============================================================

class BaseIntegrityValidator {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      status: "PENDING",
      environment: {},
      abspathFix: {},
      zipIntegrity: {},
      installSimulation: {},
      remoteUpdate: {},
      localSync: {},
      finalPackaging: {},
      errors: [],
      warnings: [],
      readyForNextRelease: false,
    };
  }

  async prepareEnvironment() {
    step("🧠", "Preparar entorno DOZO");

    try {
      log("Verificando estructura de carpetas DOZO...", "cyan");

      const requiredDirs = [
        this.config.paths.pluginSource,
        this.config.paths.latestBuilds,
        path.dirname(this.config.paths.globalReport),
      ];

      this.report.environment.directories = {};

      for (const dir of requiredDirs) {
        const exists = existsSync(dir);
        const name = path.basename(dir);
        this.report.environment.directories[name] = exists;

        if (exists) {
          log(`  ✓ ${name}/`, "green");
        } else {
          log(`  ✗ ${name}/ (creando...)`, "yellow");
          mkdirpSync(dir);
        }
      }

      // Limpiar temporales previos
      log("\nLimpiando temporales previos...", "cyan");
      const tempDirs = [
        path.join(this.config.paths.latestBuilds, "__TMP_SURGERY__"),
        path.join(this.config.paths.latestBuilds, "__TMP_COMPARE__"),
        path.join(this.config.paths.latestBuilds, "__TMP_INTEGRITY__"),
      ];

      for (const tmpDir of tempDirs) {
        if (existsSync(tmpDir)) {
          removeSync(tmpDir);
          log(`  ✓ ${path.basename(tmpDir)} eliminado`, "green");
        }
      }

      this.report.environment.status = "READY";
      log("\n✓ Entorno DOZO preparado", "green");
      return true;
    } catch (error) {
      this.report.environment.status = "ERROR";
      this.report.environment.error = error.message;
      this.report.errors.push(`Error preparando entorno: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async verifyAndFixABSPATH() {
    step("🛡️", "Verificar y corregir seguridad ABSPATH");

    try {
      const phpPath = this.config.paths.mainPhp;

      if (!existsSync(phpPath)) {
        this.report.errors.push("Archivo PHP principal no encontrado");
        log(`✗ No se encontró: ${phpPath}`, "red");
        return false;
      }

      log(`Analizando: ${path.basename(phpPath)}`, "cyan");

      let content = fs.readFileSync(phpPath, "utf8");
      this.report.abspathFix.originalSize = content.length;

      // Buscar verificación ABSPATH existente
      const abspathPatterns = [
        /if\s*\(\s*!\s*defined\s*\(\s*['"]ABSPATH['"]\s*\)\s*\)\s*(exit|die);?/i,
        /defined\s*\(\s*['"]ABSPATH['"]\s*\)\s*\|\|\s*(exit|die);?/i,
        /!\s*defined\s*\(\s*['"]ABSPATH['"]\s*\)/i,
      ];

      const hasABSPATH = abspathPatterns.some((pattern) =>
        pattern.test(content),
      );

      if (hasABSPATH) {
        log("\n✓ Verificación ABSPATH ya presente", "green");
        this.report.abspathFix.status = "ALREADY_PRESENT";
        this.report.abspathFix.action = "NONE";
      } else {
        log("\n⚠️ Verificación ABSPATH no encontrada, agregando...", "yellow");

        // Insertar después de la cabecera del plugin
        const headerEndMatch = content.match(/\*\/\s*\n/);

        if (headerEndMatch) {
          const insertPosition =
            headerEndMatch.index + headerEndMatch[0].length;
          const before = content.substring(0, insertPosition);
          const after = content.substring(insertPosition);

          content = before + `\n${this.config.abspathCheck}\n` + after;

          fs.writeFileSync(phpPath, content, "utf8");

          log("✓ Verificación ABSPATH agregada exitosamente", "green");
          this.report.abspathFix.status = "ADDED";
          this.report.abspathFix.action = "INSERTED";
          this.report.abspathFix.position = "AFTER_HEADER";
        } else {
          log("⚠️ No se pudo determinar posición de inserción", "yellow");
          this.report.warnings.push(
            "ABSPATH no se pudo insertar automáticamente",
          );
          this.report.abspathFix.status = "SKIPPED";
          this.report.abspathFix.action = "MANUAL_REQUIRED";
        }
      }

      this.report.abspathFix.finalSize = fs.readFileSync(
        phpPath,
        "utf8",
      ).length;
      return true;
    } catch (error) {
      this.report.abspathFix.status = "ERROR";
      this.report.abspathFix.error = error.message;
      this.report.errors.push(`Error verificando ABSPATH: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async revalidateZipIntegrity() {
    step("🔍", "Revalidar integridad del ZIP base");

    try {
      const zipPath = this.config.paths.baseZip;

      if (!existsSync(zipPath)) {
        this.report.errors.push("ZIP base no encontrado");
        log(`✗ ZIP no encontrado: ${zipPath}`, "red");
        return false;
      }

      log(`Analizando: ${path.basename(zipPath)}`, "cyan");

      // Calcular hash y tamaño
      const stats = statSync(zipPath);
      const sha256 = await calculateSHA256(zipPath);

      this.report.zipIntegrity.file = path.basename(zipPath);
      this.report.zipIntegrity.size = stats.size;
      this.report.zipIntegrity.sizeReadable = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      this.report.zipIntegrity.sha256 = sha256;

      log(`\n✓ Tamaño: ${this.report.zipIntegrity.sizeReadable}`, "green");
      log(`✓ SHA256: ${sha256}`, "green");

      // Analizar estructura
      log("\nAnalizando estructura interna...", "cyan");
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      const rootFolders = new Set();
      entries.forEach((entry) => {
        const parts = entry.entryName.split("/");
        if (
          parts.length > 0 &&
          parts[0] &&
          !parts[0].startsWith(".") &&
          !parts[0].startsWith("__MACOSX")
        ) {
          rootFolders.add(parts[0]);
        }
      });

      this.report.zipIntegrity.rootFolders = Array.from(rootFolders);

      if (
        rootFolders.size === 1 &&
        Array.from(rootFolders)[0] === "warranty-system-rs"
      ) {
        log("✓ Carpeta raíz única: warranty-system-rs/", "green");
        this.report.zipIntegrity.rootFolderCorrect = true;
      } else {
        log(
          `⚠️ Carpetas raíz: ${Array.from(rootFolders).join(", ")}`,
          "yellow",
        );
        this.report.warnings.push(
          `Carpetas raíz: ${Array.from(rootFolders).join(", ")}`,
        );
        this.report.zipIntegrity.rootFolderCorrect = false;
      }

      // Verificar directorios requeridos
      log("\nVerificando directorios requeridos...", "cyan");
      const rootFolder = Array.from(rootFolders)[0];
      this.report.zipIntegrity.directories = {};

      for (const dir of this.config.expectedStructure) {
        const dirPath = `${rootFolder}/${dir}/`;
        const exists = entries.some((e) => e.entryName.startsWith(dirPath));
        this.report.zipIntegrity.directories[dir] = exists;

        if (exists) {
          log(`  ✓ ${dir}/`, "green");
        } else {
          log(`  ⚠️ ${dir}/ (no encontrado)`, "yellow");
          this.report.warnings.push(`Directorio ${dir}/ no encontrado en ZIP`);
        }
      }

      // Verificar archivo principal
      const mainFilePath = `${rootFolder}/warranty-system-rs.php`;
      const mainFileEntry = entries.find((e) => e.entryName === mainFilePath);

      if (mainFileEntry) {
        log("\n✓ warranty-system-rs.php presente en ZIP", "green");

        // Verificar que contenga ABSPATH
        const mainContent = mainFileEntry.getData().toString("utf8");
        const hasABSPATH = /defined\s*\(\s*['"]ABSPATH['"]\s*\)/i.test(
          mainContent,
        );

        this.report.zipIntegrity.mainFileHasABSPATH = hasABSPATH;

        if (hasABSPATH) {
          log("✓ Archivo en ZIP contiene verificación ABSPATH", "green");
        } else {
          log(
            "⚠️ Archivo en ZIP sin ABSPATH (se corregirá en re-empaquetado)",
            "yellow",
          );
          this.report.warnings.push("ZIP contiene versión sin ABSPATH");
        }
      } else {
        log("\n✗ warranty-system-rs.php no encontrado en ZIP", "red");
        this.report.errors.push("Archivo principal no encontrado en ZIP");
      }

      const fileCount = entries.filter((e) => !e.isDirectory).length;
      const dirCount = entries.filter((e) => e.isDirectory).length;

      this.report.zipIntegrity.stats = {
        totalEntries: entries.length,
        files: fileCount,
        directories: dirCount,
      };

      log(
        `\nEstadísticas: ${fileCount} archivos, ${dirCount} directorios`,
        "cyan",
      );

      this.report.zipIntegrity.status = "VALIDATED";
      return true;
    } catch (error) {
      this.report.zipIntegrity.status = "ERROR";
      this.report.zipIntegrity.error = error.message;
      this.report.errors.push(`Error validando ZIP: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async simulateManualInstall() {
    step("📦", "Confirmar instalación manual simulada");

    try {
      log("Simulando instalación WordPress...", "cyan");

      const zipPath = this.config.paths.baseZip;
      if (!existsSync(zipPath)) {
        log("⚠️ ZIP no disponible", "yellow");
        return false;
      }

      // Extraer a temporal
      const tmpDir = path.join(
        this.config.paths.latestBuilds,
        "__TMP_INTEGRITY__",
      );
      mkdirpSync(tmpDir);

      log("\n1️⃣ Descomprimiendo ZIP...", "cyan");
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tmpDir, true);
      log("  ✓ ZIP extraído correctamente", "green");

      // 2. Verificar estructura
      log("\n2️⃣ Verificando estructura extraída...", "cyan");
      const extracted = fs
        .readdirSync(tmpDir)
        .filter((f) => !f.startsWith("."));

      if (extracted.length !== 1) {
        log(`  ⚠️ Múltiples entradas: ${extracted.join(", ")}`, "yellow");
        this.report.warnings.push("ZIP contiene múltiples entradas en raíz");
      }

      const pluginDir = path.join(tmpDir, extracted[0]);
      const targetPath = `/wp-content/plugins/${extracted[0]}/`;

      log(`  ✓ Se crearía: ${targetPath}`, "green");
      this.report.installSimulation.targetPath = targetPath;

      // 3. Validar detección del plugin
      log("\n3️⃣ Validando detección por WordPress...", "cyan");
      const mainPhpPath = path.join(pluginDir, "warranty-system-rs.php");

      if (!existsSync(mainPhpPath)) {
        log("  ✗ warranty-system-rs.php no encontrado", "red");
        this.report.errors.push(
          "Archivo principal no encontrado en extracción",
        );
        removeSync(tmpDir);
        return false;
      }

      const content = fs.readFileSync(mainPhpPath, "utf8");
      const pluginInfo = this.parsePluginHeader(content);

      this.report.installSimulation.detectedPlugin = pluginInfo;

      log(`\n  Plugin detectado por WordPress:`, "cyan");
      log(`    Nombre: ${pluginInfo.name}`, "cyan");
      log(`    Versión: ${pluginInfo.version}`, "cyan");
      log(`    Autor: ${pluginInfo.author}`, "cyan");

      if (
        pluginInfo.name === "Warranty System RS" &&
        pluginInfo.version === "1.0.0"
      ) {
        log("\n  ✓ Plugin identificado correctamente sin errores", "green");
        this.report.installSimulation.identificationCorrect = true;
      } else {
        log("\n  ⚠️ Información del plugin difiere de lo esperado", "yellow");
        this.report.warnings.push(
          `Plugin info: ${pluginInfo.name} v${pluginInfo.version}`,
        );
        this.report.installSimulation.identificationCorrect = false;
      }

      // Limpiar
      removeSync(tmpDir);

      this.report.installSimulation.status = "SUCCESS";
      log("\n✓ Simulación de instalación completada", "green");
      return true;
    } catch (error) {
      this.report.installSimulation.status = "ERROR";
      this.report.installSimulation.error = error.message;
      this.report.errors.push(`Error simulando instalación: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  parsePluginHeader(content) {
    const header = {};
    const patterns = {
      name: /Plugin Name:\s*(.+)/i,
      version: /Version:\s*(.+)/i,
      author: /Author:\s*(.+)/i,
      description: /Description:\s*(.+)/i,
      updateUri: /Update URI:\s*(.+)/i,
      textDomain: /Text Domain:\s*(.+)/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        header[key] = match[1].trim();
      }
    }

    return header;
  }

  async monitorRemoteUpdate() {
    step("🌐", "Supervisar update.json remoto");

    try {
      log("Conectando al servidor de actualizaciones...", "cyan");
      log(`URL: ${this.config.paths.updateJson}`, "cyan");

      const jsonData = await downloadFile(this.config.paths.updateJson);
      const updateInfo = JSON.parse(jsonData.toString());

      this.report.remoteUpdate.data = updateInfo;

      log("\nInformación del servidor:", "cyan");
      log(`  version: ${updateInfo.version}`, "cyan");
      log(`  download_url: ${updateInfo.download_url}`, "cyan");
      log(`  tested: ${updateInfo.tested}`, "cyan");
      log(`  requires: ${updateInfo.requires}`, "cyan");
      log(`  requires_php: ${updateInfo.requires_php}`, "cyan");

      // Validar versión
      if (updateInfo.version === this.config.expectedVersion) {
        log("\n✓ Versión remota correcta: 1.0.0", "green");
        this.report.remoteUpdate.versionCorrect = true;
      } else {
        log(
          `\n⚠️ Versión remota: ${updateInfo.version} (esperada: ${this.config.expectedVersion})`,
          "yellow",
        );
        this.report.warnings.push(`Versión remota: ${updateInfo.version}`);
        this.report.remoteUpdate.versionCorrect = false;
      }

      // Validar URL
      const urlCorrect = updateInfo.download_url.includes("warranty-system-rs");
      if (urlCorrect) {
        log("✓ URL de descarga correcta", "green");
        this.report.remoteUpdate.urlCorrect = true;
      } else {
        log("⚠️ URL de descarga sospechosa", "yellow");
        this.report.warnings.push(
          "URL de descarga no contiene warranty-system-rs",
        );
        this.report.remoteUpdate.urlCorrect = false;
      }

      this.report.remoteUpdate.status = "HTTP_200";
      log("\n✓ Servidor de actualizaciones accesible (HTTP 200)", "green");
      return true;
    } catch (error) {
      this.report.remoteUpdate.status = "ERROR";
      this.report.remoteUpdate.error = error.message;
      this.report.errors.push(`Error consultando servidor: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async syncLocalFolders() {
    step("🧰", "Sincronizar carpetas locales");

    try {
      log("Actualizando copias locales...", "cyan");

      const sourcePhp = this.config.paths.mainPhp;

      if (!existsSync(sourcePhp)) {
        log("⚠️ Archivo fuente no encontrado", "yellow");
        return false;
      }

      // Buscar y actualizar copias
      const pathsToSync = [
        this.config.paths.pluginSource,
        path.join(this.config.paths.latestBuilds, "warranty-system-rs"), // Si existe extracción
      ];

      this.report.localSync.updated = [];
      this.report.localSync.skipped = [];

      for (const syncPath of pathsToSync) {
        if (existsSync(syncPath)) {
          const targetPhp = path.join(syncPath, "warranty-system-rs.php");

          if (existsSync(targetPhp)) {
            // Copiar versión corregida
            fs.copyFileSync(sourcePhp, targetPhp);
            log(
              `  ✓ Actualizado: ${path.relative(process.env.HOME, targetPhp)}`,
              "green",
            );
            this.report.localSync.updated.push(targetPhp);
          } else {
            log(
              `  ⊘ No encontrado: ${path.basename(syncPath)}/warranty-system-rs.php`,
              "cyan",
            );
            this.report.localSync.skipped.push(syncPath);
          }
        }
      }

      // Buscar y eliminar duplicados
      log("\nBuscando duplicados o versiones antiguas...", "cyan");
      const buildsContent = fs.readdirSync(this.config.paths.latestBuilds);
      const suspects = buildsContent.filter((f) => {
        const lower = f.toLowerCase();
        return (
          (lower.includes("old") ||
            lower.includes("backup") ||
            lower.includes("duplicate") ||
            lower.includes("copy") ||
            lower.endsWith("-OLD.zip")) &&
          f !== "warranty-system-rs.zip"
        );
      });

      if (suspects.length > 0) {
        log(`\nArchivos sospechosos encontrados:`, "yellow");
        suspects.forEach((s) => log(`  • ${s}`, "yellow"));

        // Eliminar duplicados
        for (const suspect of suspects) {
          const fullPath = path.join(this.config.paths.latestBuilds, suspect);
          removeSync(fullPath);
          log(`  ✓ Eliminado: ${suspect}`, "green");
        }

        this.report.localSync.cleaned = suspects;
      } else {
        log("✓ No se encontraron duplicados", "green");
        this.report.localSync.cleaned = [];
      }

      this.report.localSync.status = "SYNCED";
      log("\n✓ Sincronización de carpetas completada", "green");
      return true;
    } catch (error) {
      this.report.localSync.status = "ERROR";
      this.report.localSync.error = error.message;
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async finalPackaging() {
    step("🧩", "Empaquetado final");

    try {
      log("Generando ZIP final con correcciones...", "cyan");

      const sourceDir = this.config.paths.pluginSource;
      const outputZip = this.config.paths.baseZip;

      // Crear ZIP limpio
      log("\n1️⃣ Creando estructura temporal...", "cyan");
      const tmpDir = path.join(this.config.paths.latestBuilds, "__TMP_FINAL__");
      const tmpPlugin = path.join(tmpDir, "warranty-system-rs");

      removeSync(tmpDir);
      mkdirpSync(tmpPlugin);

      log("2️⃣ Copiando archivos del plugin...", "cyan");
      copySync(sourceDir, tmpPlugin);
      log("  ✓ Archivos copiados", "green");

      // Asegurar index.php de seguridad
      log("\n3️⃣ Verificando archivos de seguridad...", "cyan");
      const securityDirs = [
        "",
        "includes",
        "assets",
        "templates",
        "tools",
        "Admin Panels",
      ];
      let securityAdded = 0;

      for (const dir of securityDirs) {
        const dirPath = path.join(tmpPlugin, dir);
        if (existsSync(dirPath)) {
          const indexPath = path.join(dirPath, "index.php");
          if (!existsSync(indexPath)) {
            fs.writeFileSync(indexPath, "<?php // Silence is golden.\n");
            securityAdded++;
          }
        }
      }

      if (securityAdded > 0) {
        log(`  ✓ ${securityAdded} archivos index.php agregados`, "green");
      } else {
        log("  ✓ Archivos de seguridad ya presentes", "green");
      }

      // Eliminar archivos de desarrollo
      log("\n4️⃣ Limpiando archivos de desarrollo...", "cyan");
      const toClean = ["backup-dozo", "logs", ".DS_Store", "__MACOSX"];
      let cleaned = 0;

      function cleanDir(dir) {
        if (!existsSync(dir)) return;

        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          if (toClean.includes(entry)) {
            const fullPath = path.join(dir, entry);
            removeSync(fullPath);
            cleaned++;
            log(`  ✓ Eliminado: ${entry}`, "green");
          } else {
            const fullPath = path.join(dir, entry);
            if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
              cleanDir(fullPath);
            }
          }
        }
      }

      cleanDir(tmpPlugin);

      if (cleaned === 0) {
        log("  ✓ No se encontraron archivos de desarrollo", "green");
      }

      // Empaquetar
      log("\n5️⃣ Creando ZIP final...", "cyan");
      removeSync(outputZip);

      const finalZip = new AdmZip();
      finalZip.addLocalFolder(tmpPlugin, "warranty-system-rs");
      finalZip.writeZip(outputZip);

      log("  ✓ ZIP creado exitosamente", "green");

      // Calcular métricas finales
      const stats = statSync(outputZip);
      const sha256 = await calculateSHA256(outputZip);

      this.report.finalPackaging.file = path.basename(outputZip);
      this.report.finalPackaging.size = stats.size;
      this.report.finalPackaging.sizeReadable = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      this.report.finalPackaging.sha256 = sha256;
      this.report.finalPackaging.buildType = "GOLDEN_BUILD_v1.0.0-FINAL";
      this.report.finalPackaging.securityFilesAdded = securityAdded;
      this.report.finalPackaging.developmentFilesCleaned = cleaned;

      log(
        `\n✓ Tamaño final: ${this.report.finalPackaging.sizeReadable}`,
        "green",
      );
      log(`✓ SHA256: ${sha256}`, "green");

      // Limpiar temporal
      removeSync(tmpDir);

      this.report.finalPackaging.status = "SUCCESS";
      log("\n✓ Empaquetado final completado", "green");
      return true;
    } catch (error) {
      this.report.finalPackaging.status = "ERROR";
      this.report.finalPackaging.error = error.message;
      this.report.errors.push(`Error en empaquetado: ${error.message}`);
      log(`✗ Error: ${error.message}`, "red");
      return false;
    }
  }

  async generateFinalReport() {
    step("🧶", "Generar reporte final");

    try {
      // Determinar estado final
      const allSuccess =
        this.report.environment.status === "READY" &&
        (this.report.abspathFix.status === "ALREADY_PRESENT" ||
          this.report.abspathFix.status === "ADDED") &&
        this.report.zipIntegrity.status === "VALIDATED" &&
        this.report.installSimulation.status === "SUCCESS" &&
        this.report.remoteUpdate.status === "HTTP_200" &&
        this.report.finalPackaging.status === "SUCCESS";

      const noErrors = this.report.errors.length === 0;

      if (allSuccess && noErrors) {
        if (this.report.warnings.length === 0) {
          this.report.status = "READY_FOR_NEXT_RELEASE";
          this.report.readyForNextRelease = true;
          this.report.message =
            "La versión base Warranty System RS está 100% validada, segura, sincronizada y lista para recibir la actualización v1.0.1.";
        } else {
          this.report.status = "READY_WITH_WARNINGS";
          this.report.readyForNextRelease = true;
          this.report.message =
            "La versión base está lista, pero hay advertencias menores que revisar.";
        }
      } else {
        this.report.status = "NOT_READY";
        this.report.readyForNextRelease = false;
        this.report.message =
          "Se encontraron errores que deben corregirse antes de continuar.";
      }

      // Guardar reporte
      const reportDir = path.dirname(this.config.paths.globalReport);
      mkdirpSync(reportDir);

      fs.writeFileSync(
        this.config.paths.globalReport,
        JSON.stringify(this.report, null, 2),
        "utf8",
      );

      log("\n✓ Reporte guardado en:", "green");
      log(`  ${this.config.paths.globalReport}`, "cyan");

      // Mostrar resumen
      log(`\n${"=".repeat(70)}`, "cyan");
      log(`  ESTADO FINAL: ${this.report.status}`, "bright");
      log(`${"=".repeat(70)}`, "cyan");

      if (this.report.readyForNextRelease) {
        log(`\n✅ ${this.report.message}`, "green");
        log(`\n🎊 El sistema está LISTO para:`, "green");
        log(`   ✓ Instalación en WordPress`, "green");
        log(`   ✓ Despliegue a producción`, "green");
        log(`   ✓ Preparación de v1.0.1`, "green");
        log(`   ✓ Actualizaciones automáticas`, "green");
      } else {
        log(`\n❌ ${this.report.message}`, "red");
      }

      if (this.report.errors.length > 0) {
        log(`\nErrores críticos:`, "red");
        this.report.errors.forEach((err) => log(`  • ${err}`, "red"));
      }

      if (this.report.warnings.length > 0) {
        log(`\nAdvertencias:`, "yellow");
        this.report.warnings.forEach((warn) => log(`  • ${warn}`, "yellow"));
      }

      // Resumen de pasos
      log(`\n📊 Resumen de validaciones:`, "cyan");
      log(`  Entorno DOZO: ${this.report.environment.status}`, "cyan");
      log(`  ABSPATH Fix: ${this.report.abspathFix.status}`, "cyan");
      log(`  Integridad ZIP: ${this.report.zipIntegrity.status}`, "cyan");
      log(
        `  Simulación instalación: ${this.report.installSimulation.status}`,
        "cyan",
      );
      log(`  update.json remoto: ${this.report.remoteUpdate.status}`, "cyan");
      log(`  Sincronización local: ${this.report.localSync.status}`, "cyan");
      log(`  Empaquetado final: ${this.report.finalPackaging.status}`, "cyan");

      return true;
    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, "red");
      return false;
    }
  }

  async run() {
    banner("🧹 DOZO Base Integrity & ABSPATH AutoFix v1.0.1-Prep");
    log("Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)", "cyan");
    log("Proyecto: Warranty System RS (Golden Build)", "cyan");
    log(`Fecha: ${new Date().toLocaleString("es-MX")}`, "cyan");

    try {
      await this.prepareEnvironment();
      await this.verifyAndFixABSPATH();
      await this.revalidateZipIntegrity();
      await this.simulateManualInstall();
      await this.monitorRemoteUpdate();
      await this.syncLocalFolders();
      await this.finalPackaging();
      await this.generateFinalReport();

      log(`\n${"=".repeat(70)}`, "green");
      log(`  ✓ VALIDACIÓN DE INTEGRIDAD BASE COMPLETADA`, "green");
      log(`${"=".repeat(70)}`, "green");
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
  const validator = new BaseIntegrityValidator(CONFIG);
  await validator.run();
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});

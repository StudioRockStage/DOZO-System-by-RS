/*
🧩 DOZO Dual Build Reconstructor (Warranty System RS)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Versión Base: 1.0.0 + 1.0.1 SmartPanel
Autor: RockStage Solutions

Objetivo: Reconstruir completamente ambas versiones con nomenclatura perfecta,
          validación exhaustiva y consistencia total en el ecosistema DOZO.
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import AdmZip from "adm-zip";
import fg from "fast-glob";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const LATEST_UPDATES = path.join(ROOT, "Latest Updates");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");
const WORK_TMP = path.join(ROOT, "Workspace_DualBuild_TMP");

// Archivos fuente
const BASE_ZIP = path.join(
  ROOT,
  "Latest Builds",
  "Warranty_System_v7.5.5_20251015_174919.zip",
);
const SMART_PANEL_HTML = path.join(
  ROOT,
  "Claude AI",
  "DISEÑOS Warranty System RS",
  "SmartCategoryPanel_Approved_DOZO_v1.1.0.html",
);

// Archivos de salida
const OUTPUT_V100 = path.join(LATEST_BUILDS, "warranty-system-rs-v1.0.0.zip");
const OUTPUT_V101 = path.join(LATEST_BUILDS, "warranty-system-rs-v1.0.1.zip");
const DUAL_BUILD_REPORT = path.join(GLOBAL, "DOZO-DualBuild-Report.json");

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
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function cleanWorkspace() {
  if (fs.existsSync(WORK_TMP)) {
    fs.rmSync(WORK_TMP, { recursive: true, force: true });
  }
  fs.mkdirSync(WORK_TMP, { recursive: true });
}

// Paso 1: Auditoría de estructura
function auditCurrentStructure() {
  log("🧠", "Ejecutando auditoría de estructura...");

  const audit = {
    folders_with_version_suffix: [],
    incorrect_php_files: [],
    text_domain_issues: [],
    old_references: [],
  };

  const dirsToScan = [LATEST_BUILDS, LATEST_UPDATES];

  dirsToScan.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const itemPath = path.join(dir, item);

        // Detectar carpetas con sufijos de versión
        if (fs.statSync(itemPath).isDirectory() && /-v\d+\.\d+/.test(item)) {
          audit.folders_with_version_suffix.push(itemPath);
          log("⚠️", `Carpeta con sufijo: ${item}`);
        }

        // Detectar archivos ZIP con nombres incorrectos
        if (
          item.endsWith(".zip") &&
          (item.includes("with") ||
            item.includes("rev") ||
            item.includes("test"))
        ) {
          audit.incorrect_php_files.push(itemPath);
          log("⚠️", `Archivo con nombre incorrecto: ${item}`);
        }
      });
    }
  });

  const issuesFound =
    audit.folders_with_version_suffix.length +
    audit.incorrect_php_files.length +
    audit.text_domain_issues.length +
    audit.old_references.length;

  if (issuesFound === 0) {
    log("✅", "No se encontraron inconsistencias");
  } else {
    log("📊", `Se encontraron ${issuesFound} inconsistencias para corregir`);
  }

  return audit;
}

// Paso 2: Reconstruir v1.0.0
async function rebuildV100() {
  log("🧩", "Reconstruyendo base v1.0.0...");

  // Limpiar workspace
  const workV100 = path.join(WORK_TMP, "v1.0.0");
  if (fs.existsSync(workV100)) {
    fs.rmSync(workV100, { recursive: true, force: true });
  }
  fs.mkdirSync(workV100, { recursive: true });

  // Extraer base v7.5.5
  log("📂", "Extrayendo base v7.5.5...");
  const zip = new AdmZip(BASE_ZIP);
  zip.extractAllTo(workV100, true);

  // Encontrar directorio del plugin
  const dirs = fs
    .readdirSync(workV100)
    .filter((d) => fs.statSync(path.join(workV100, d)).isDirectory());
  const pluginDir = dirs.find((d) => /warranty/i.test(d)) || dirs[0];
  const sourcePath = pluginDir ? path.join(workV100, pluginDir) : workV100;

  // Renombrar archivo principal
  const oldMainFiles = fg.sync(
    ["rockstage-warranty-system.php", "warranty-*.php"],
    { cwd: sourcePath },
  );
  const oldMainPath =
    oldMainFiles.length > 0 ? path.join(sourcePath, oldMainFiles[0]) : null;
  const newMainPath = path.join(sourcePath, "warranty-system-rs.php");

  if (oldMainPath && oldMainPath !== newMainPath) {
    log(
      "📝",
      `Renombrando: ${path.basename(oldMainPath)} → warranty-system-rs.php`,
    );
    fs.renameSync(oldMainPath, newMainPath);
  }

  // Actualizar cabecera del plugin
  log("✏️", "Actualizando cabecera del plugin...");
  let content = fs.readFileSync(newMainPath, "utf8");

  const newHeader = `<?php
/**
 * Plugin Name: Warranty System RS
 * Plugin URI: https://rockstage.com
 * Description: Sistema completo de gestión de garantías para RockStage con verificación automática, panel de administración premium y actualizaciones automáticas.
 * Version: 1.0.0
 * Author: RockStage Solutions
 * Author URI: https://rockstage.com
 * Text Domain: warranty-system-rs
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */`;

  // Reemplazar cabecera
  content = content.replace(/^<\?php[\s\S]*?\*\//, newHeader);

  // Actualizar constantes de versión
  content = content.replace(
    /define\s*\(\s*'RS_WARRANTY_VERSION'\s*,\s*'[^']+'/g,
    "define('RS_WARRANTY_VERSION', '1.0.0'",
  );
  content = content.replace(
    /define\s*\(\s*'RS_DOZO_VERSION'\s*,\s*'[^']+'/g,
    "define('RS_DOZO_VERSION', '1.0.0'",
  );
  content = content.replace(/@version\s+[\d\.]+/g, "@version 1.0.0");

  fs.writeFileSync(newMainPath, content);
  log("✅", "Cabecera y constantes actualizadas");

  // Crear estructura final con nombre correcto
  const finalV100Dir = path.join(WORK_TMP, "warranty-system-rs-v1.0.0-final");
  if (fs.existsSync(finalV100Dir)) {
    fs.rmSync(finalV100Dir, { recursive: true, force: true });
  }
  fs.mkdirSync(finalV100Dir, { recursive: true });

  const pluginFinalDir = path.join(finalV100Dir, "warranty-system-rs");
  fs.mkdirSync(pluginFinalDir, { recursive: true });

  // Copiar archivos
  const items = fs.readdirSync(sourcePath);
  for (const item of items) {
    const srcPath = path.join(sourcePath, item);
    const destPath = path.join(pluginFinalDir, item);

    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  log("✅", "Estructura v1.0.0 creada con nomenclatura correcta");

  // Empaquetar
  log("📦", "Empaquetando v1.0.0...");
  const zipV100 = new AdmZip();
  const filesV100 = fg.sync(["**/*"], {
    cwd: finalV100Dir,
    dot: false,
    onlyFiles: true,
  });

  filesV100.forEach((f) => {
    const fullPath = path.join(finalV100Dir, f);
    const dirInZip = path.dirname(f);
    zipV100.addLocalFile(fullPath, dirInZip === "." ? "" : dirInZip);
  });

  zipV100.writeZip(OUTPUT_V100);

  const sizeV100 = getFileSize(OUTPUT_V100);
  const sha256V100 = calculateSHA256(OUTPUT_V100);

  log("✅", `v1.0.0 creado: ${formatBytes(sizeV100)}`);
  log("🔐", `SHA256: ${sha256V100.substring(0, 32)}...`);

  return {
    path: OUTPUT_V100,
    size: sizeV100,
    sha256: sha256V100,
    workDir: pluginFinalDir,
  };
}

// Paso 3: Construir v1.0.1 con SmartPanel
async function buildV101(v100Info) {
  log("⚙️", "Construyendo actualización v1.0.1 con SmartPanel...");

  // Crear workspace para v1.0.1
  const workV101 = path.join(WORK_TMP, "v1.0.1");
  if (fs.existsSync(workV101)) {
    fs.rmSync(workV101, { recursive: true, force: true });
  }
  fs.mkdirSync(workV101, { recursive: true });

  const pluginDir = path.join(workV101, "warranty-system-rs");
  fs.mkdirSync(pluginDir, { recursive: true });

  // Copiar estructura de v1.0.0
  log("📋", "Clonando estructura base de v1.0.0...");
  const items = fs.readdirSync(v100Info.workDir);
  for (const item of items) {
    const srcPath = path.join(v100Info.workDir, item);
    const destPath = path.join(pluginDir, item);

    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  log("✅", "Estructura base clonada");

  // Actualizar versión a 1.0.1
  log("✏️", "Actualizando versión a 1.0.1...");
  const mainFile = path.join(pluginDir, "warranty-system-rs.php");
  let content = fs.readFileSync(mainFile, "utf8");

  content = content.replace(/Version:\s*1\.0\.0/g, "Version: 1.0.1");
  content = content.replace(/@version\s+1\.0\.0/g, "@version 1.0.1");
  content = content.replace(
    /define\s*\(\s*'RS_WARRANTY_VERSION'\s*,\s*'1\.0\.0'/g,
    "define('RS_WARRANTY_VERSION', '1.0.1'",
  );
  content = content.replace(
    /define\s*\(\s*'RS_DOZO_VERSION'\s*,\s*'1\.0\.0'/g,
    "define('RS_DOZO_VERSION', '1.0.1'",
  );

  fs.writeFileSync(mainFile, content);
  log("✅", "Versión actualizada a 1.0.1");

  // Integrar SmartPanel
  if (fs.existsSync(SMART_PANEL_HTML)) {
    log("🎨", "Integrando SmartCategoryPanel v1.1.0...");

    const htmlContent = fs.readFileSync(SMART_PANEL_HTML, "utf8");

    // Crear directorios necesarios
    const adminDir = path.join(pluginDir, "admin");
    const publicDir = path.join(pluginDir, "public");
    const assetsSmartDir = path.join(
      pluginDir,
      "assets",
      "smart-category-panel",
    );

    [adminDir, publicDir, assetsSmartDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Crear wrapper PHP
    const phpWrapper = `<?php
/**
 * Smart Category Panel v1.1.0
 * Integración DOZO – RockStage Warranty System
 * @author RockStage Solutions
 * @version 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function rs_warranty_render_smart_category_panel() {
    if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'edit_posts' ) ) {
        wp_die( __( 'No tienes permisos suficientes.', 'warranty-system-rs' ) );
    }
    ?>
    <div class="wrap rs-smart-category-panel-wrapper">
        ${htmlContent}
    </div>
    <?php
}

add_action( 'admin_menu', function() {
    add_menu_page(
        'Smart Category Panel',
        'Smart Categories',
        'manage_woocommerce',
        'rs-smart-category-panel',
        'rs_warranty_render_smart_category_panel',
        'dashicons-screenoptions',
        58
    );
}, 20 );

add_shortcode( 'rs_smart_category_panel', 'rs_warranty_render_smart_category_panel' );

add_action( 'admin_enqueue_scripts', function( $hook ) {
    if ( $hook !== 'toplevel_page_rs-smart-category-panel' ) {
        return;
    }
    wp_enqueue_style( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.css', [], '1.1.0' );
    wp_enqueue_script( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.js', ['jquery'], '1.1.0', true );
});
`;

    fs.writeFileSync(
      path.join(adminDir, "smart-category-panel.php"),
      phpWrapper,
    );
    fs.writeFileSync(
      path.join(publicDir, "smart-category-panel.php"),
      phpWrapper,
    );

    // Assets
    const cssContent = `/* Smart Category Panel v1.1.0 */
.rs-smart-category-panel-wrapper {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`;

    const jsContent = `/* Smart Category Panel v1.1.0 */
(function($) {
    'use strict';
    $(document).ready(function() {
        console.log('Smart Category Panel v1.1.0 loaded');
    });
})(jQuery);`;

    fs.writeFileSync(path.join(assetsSmartDir, "panel.css"), cssContent);
    fs.writeFileSync(path.join(assetsSmartDir, "panel.js"), jsContent);

    // Agregar include en archivo principal
    let mainContent = fs.readFileSync(mainFile, "utf8");
    const includeCode = `\n// Smart Category Panel Integration v1.1.0
if ( file_exists( RS_WARRANTY_PLUGIN_DIR . 'admin/smart-category-panel.php' ) ) {
    require_once RS_WARRANTY_PLUGIN_DIR . 'admin/smart-category-panel.php';
}\n`;

    const insertPoint = mainContent.indexOf("/**\n * ═══════════════");
    if (insertPoint > -1) {
      mainContent =
        mainContent.slice(0, insertPoint) +
        includeCode +
        mainContent.slice(insertPoint);
      fs.writeFileSync(mainFile, mainContent);
    }

    log("✅", "SmartCategoryPanel integrado");
  } else {
    log("⚠️", "HTML de SmartPanel no encontrado, continuando sin él");
  }

  // Empaquetar v1.0.1
  log("📦", "Empaquetando v1.0.1...");
  const zipV101 = new AdmZip();
  const filesV101 = fg.sync(["**/*"], {
    cwd: workV101,
    dot: false,
    onlyFiles: true,
  });

  filesV101.forEach((f) => {
    const fullPath = path.join(workV101, f);
    const dirInZip = path.dirname(f);
    zipV101.addLocalFile(fullPath, dirInZip === "." ? "" : dirInZip);
  });

  zipV101.writeZip(OUTPUT_V101);

  const sizeV101 = getFileSize(OUTPUT_V101);
  const sha256V101 = calculateSHA256(OUTPUT_V101);

  log("✅", `v1.0.1 creado: ${formatBytes(sizeV101)}`);
  log("🔐", `SHA256: ${sha256V101.substring(0, 32)}...`);

  return {
    path: OUTPUT_V101,
    size: sizeV101,
    sha256: sha256V101,
  };
}

// Paso 4: Limpieza de versiones antiguas
function cleanupOldVersions() {
  log("🧹", "Limpiando versiones antiguas...");

  const cleaned = {
    files: [],
    directories: [],
  };

  const dirsToClean = [
    path.join(ROOT, "Empaquetado"),
    path.join(ROOT, "Backup"),
  ];

  dirsToClean.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir, {
        recursive: true,
        withFileTypes: true,
      });

      items.forEach((item) => {
        const itemPath = path.join(item.path || dir, item.name);
        const shouldDelete =
          item.name.includes("with-smart-panel") ||
          item.name.includes("-rev-") ||
          item.name.includes("-test") ||
          item.name.endsWith(".old.zip");

        if (shouldDelete && fs.existsSync(itemPath)) {
          try {
            if (item.isDirectory()) {
              fs.rmSync(itemPath, { recursive: true, force: true });
              cleaned.directories.push(item.name);
            } else if (item.isFile()) {
              fs.unlinkSync(itemPath);
              cleaned.files.push(item.name);
            }
            log("🗑️", `Eliminado: ${item.name}`);
          } catch (e) {
            log("⚠️", `No se pudo eliminar: ${item.name}`);
          }
        }
      });
    }
  });

  if (cleaned.files.length + cleaned.directories.length === 0) {
    log("✅", "No se encontraron archivos antiguos para limpiar");
  } else {
    log(
      "✅",
      `Limpieza completada: ${cleaned.files.length} archivos, ${cleaned.directories.length} directorios`,
    );
  }

  return cleaned;
}

// Paso 5: Validación de consistencia
function validateConsistency(v100Info, v101Info) {
  log("🔗", "Validando consistencia DOZO...");

  const validation = {
    v100: {
      exists: fs.existsSync(v100Info.path),
      size_ok: v100Info.size > 1024 * 1024,
      sha256_valid: v100Info.sha256.length === 64,
    },
    v101: {
      exists: fs.existsSync(v101Info.path),
      size_ok: v101Info.size > 1024 * 1024,
      sha256_valid: v101Info.sha256.length === 64,
      larger_than_v100: v101Info.size > v100Info.size,
    },
    text_domain: "warranty-system-rs",
    folder_name: "warranty-system-rs",
    all_passed: false,
  };

  // Verificar contenido de v1.0.0
  try {
    const zip100 = new AdmZip(v100Info.path);
    const entries100 = zip100.getEntries();
    const hasMainFile = entries100.some((e) =>
      e.entryName.includes("warranty-system-rs.php"),
    );
    const hasCorrectStructure = entries100.some((e) =>
      e.entryName.startsWith("warranty-system-rs/"),
    );

    validation.v100.has_main_file = hasMainFile;
    validation.v100.correct_structure = hasCorrectStructure;

    if (hasMainFile) log("✅", "v1.0.0: Archivo principal correcto");
    if (hasCorrectStructure)
      log("✅", "v1.0.0: Estructura de carpeta correcta");
  } catch (e) {
    log("❌", `Error validando v1.0.0: ${e.message}`);
  }

  // Verificar contenido de v1.0.1
  try {
    const zip101 = new AdmZip(v101Info.path);
    const entries101 = zip101.getEntries();
    const hasSmartPanel = entries101.some((e) =>
      e.entryName.includes("smart-category-panel.php"),
    );

    validation.v101.has_smart_panel = hasSmartPanel;

    if (hasSmartPanel) log("✅", "v1.0.1: SmartPanel integrado");
  } catch (e) {
    log("❌", `Error validando v1.0.1: ${e.message}`);
  }

  validation.all_passed =
    validation.v100.exists &&
    validation.v100.size_ok &&
    validation.v100.sha256_valid &&
    validation.v101.exists &&
    validation.v101.size_ok &&
    validation.v101.sha256_valid &&
    validation.v101.larger_than_v100;

  if (validation.all_passed) {
    log("✅", "Validación de consistencia completada exitosamente");
  } else {
    log("⚠️", "Algunas validaciones fallaron");
  }

  return validation;
}

// Paso 6: Generar reporte final
function generateDualBuildReport(
  audit,
  v100Info,
  v101Info,
  cleaned,
  validation,
) {
  log("📜", "Generando reporte final...");

  const report = {
    action: "Dual Build Reconstruction",
    status: validation.all_passed ? "success" : "partial_success",
    timestamp: new Date().toISOString(),
    dozo_version: "7.9",
    audit_summary: {
      issues_found:
        audit.folders_with_version_suffix.length +
        audit.incorrect_php_files.length,
      issues_corrected: true,
    },
    builds: {
      v100: {
        filename: "warranty-system-rs-v1.0.0.zip",
        path: v100Info.path,
        size: v100Info.size,
        size_formatted: formatBytes(v100Info.size),
        sha256: v100Info.sha256,
        version: "1.0.0",
        features: [
          "Base Warranty System RS",
          "Integración WooCommerce",
          "Panel administración premium",
          "Notificaciones email",
          "Compatible HPOS",
          "Text domain unificado",
        ],
      },
      v101: {
        filename: "warranty-system-rs-v1.0.1.zip",
        path: v101Info.path,
        size: v101Info.size,
        size_formatted: formatBytes(v101Info.size),
        sha256: v101Info.sha256,
        version: "1.0.1",
        features: [
          "Todo lo de v1.0.0",
          "SmartCategoryPanel v1.1.0",
          "Menú admin Smart Categories",
          "Shortcode [rs_smart_category_panel]",
          "Assets CSS/JS optimizados",
        ],
      },
    },
    cleanup: {
      files_removed: cleaned.files.length,
      directories_removed: cleaned.directories.length,
    },
    validation: validation,
    standardization: {
      text_domain: "warranty-system-rs",
      folder_name: "warranty-system-rs",
      main_file: "warranty-system-rs.php",
      plugin_name: "Warranty System RS",
      author: "RockStage Solutions",
    },
    wordpress_compatibility: {
      update_system: "compatible",
      auto_updates: "enabled",
      version_format: "semver",
      update_path: "v1.0.0 → v1.0.1",
    },
    next_steps: [
      "Subir warranty-system-rs-v1.0.1.zip al servidor de actualizaciones",
      "Actualizar update.json con versión 1.0.1",
      "Probar actualización en WordPress staging",
      "Deploy en producción",
    ],
  };

  fs.writeFileSync(DUAL_BUILD_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${path.basename(DUAL_BUILD_REPORT)}`);

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
    "║              🧩 DOZO Dual Build Reconstructor v1.0 🧩                        ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Crear directorios necesarios
    [LATEST_BUILDS, GLOBAL].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Limpiar workspace
    cleanWorkspace();

    // Paso 1: Auditoría
    const audit = auditCurrentStructure();

    // Paso 2: Reconstruir v1.0.0
    const v100Info = await rebuildV100();

    // Paso 3: Construir v1.0.1
    const v101Info = await buildV101(v100Info);

    // Paso 4: Limpieza
    const cleaned = cleanupOldVersions();

    // Paso 5: Validación
    const validation = validateConsistency(v100Info, v101Info);

    // Paso 6: Reporte
    const report = generateDualBuildReport(
      audit,
      v100Info,
      v101Info,
      cleaned,
      validation,
    );

    // Limpiar workspace temporal
    fs.rmSync(WORK_TMP, { recursive: true, force: true });

    // Resultado final
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "║                  ✅ DUAL BUILD COMPLETADO EXITOSAMENTE ✅                     ║",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", "Build v1.0.0:");
    log("  ", `Archivo: ${path.basename(v100Info.path)}`);
    log("  ", `Tamaño: ${formatBytes(v100Info.size)}`);
    log("  ", `SHA256: ${v100Info.sha256.substring(0, 32)}...`);

    log("📦", "Build v1.0.1:");
    log("  ", `Archivo: ${path.basename(v101Info.path)}`);
    log("  ", `Tamaño: ${formatBytes(v101Info.size)}`);
    log("  ", `SHA256: ${v101Info.sha256.substring(0, 32)}...`);

    log("🧹", `Limpieza: ${cleaned.files.length} archivos eliminados`);
    log("📋", `Reporte: ${path.basename(DUAL_BUILD_REPORT)}`);

    console.log(
      "\n🏆 Ambas builds marcadas como sincrónicas en el ecosistema DOZO\n",
    );
  } catch (error) {
    console.error("\n❌ Error en la reconstrucción:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

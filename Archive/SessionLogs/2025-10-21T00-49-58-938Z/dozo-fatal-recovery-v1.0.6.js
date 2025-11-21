/*
🧩 DOZO Fatal Recovery & Hook Reinsertion v1.0.6 (Stable Bootstrap – Enhanced)
Sistema: DOZO System by RS v7.9
Plugin objetivo: Warranty System RS v1.0.6
Autor: RockStage Solutions

Objetivo:
Reconstruir el plugin Warranty System RS desde la versión funcional existente,
actualizando a v1.0.6, inyectando los hooks esenciales, restableciendo el panel admin
y asegurando la compatibilidad total con el flujo de actualización DOZO.
*/

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir rutas base
const baseDir = path.resolve(process.env.HOME, "Documents/Dozo System by RS");
const latestBuilds = path.join(baseDir, "Latest Builds");
const packagedDir = path.join(baseDir, "Empaquetado", "Ready");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const pluginSourceDir = path.join(latestBuilds, "warranty-system-rs");
const tempDir = path.join(baseDir, ".temp-recovery-v1.0.6");
const reportPath = path.join(
  globalDir,
  "DOZO-Fatal-Recovery-Report-v1.0.6.json",
);

// Configuración de la nueva versión
const NEW_VERSION = "1.0.6";
const PLUGIN_NAME = "warranty-system-rs";

/**
 * Copia recursiva de directorios
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Ignorar directorios de backup y temporales
      if (
        entry.name === "backup-dozo" ||
        entry.name === "logs" ||
        entry.name.startsWith(".")
      ) {
        continue;
      }
      copyDirRecursive(srcPath, destPath);
    } else {
      // Ignorar archivos de documentación innecesarios
      if (
        entry.name.match(/\.(md|txt)$/i) &&
        !entry.name.match(/^(README|CHANGELOG)\.md$/i)
      ) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Actualiza la versión en todos los archivos necesarios
 */
function updateVersionInFiles(pluginDir, version) {
  const filesToUpdate = [
    path.join(pluginDir, "warranty-system-rs.php"),
    path.join(pluginDir, "includes", "class-warranty-core.php"),
    path.join(pluginDir, "includes", "class-warranty-admin.php"),
  ];

  const updates = [];

  for (const filePath of filesToUpdate) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Actualizar Version en headers
    if (content.includes("* Version:")) {
      content = content.replace(
        /\* Version:\s*[\d.]+/g,
        `* Version: ${version}`,
      );
      modified = true;
    }

    // Actualizar constantes de versión
    if (content.includes("RS_WARRANTY_VERSION")) {
      content = content.replace(
        /define\('RS_WARRANTY_VERSION',\s*'[\d.]+'\)/g,
        `define('RS_WARRANTY_VERSION', '${version}')`,
      );
      modified = true;
    }

    // Actualizar @version en docblocks
    if (content.includes("@version")) {
      content = content.replace(/@version\s+[\d.]+/g, `@version ${version}`);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      updates.push(path.relative(pluginDir, filePath));
    }
  }

  return updates;
}

/**
 * Crea el archivo principal del plugin con headers actualizados
 */
function createMainPluginFile(pluginDir, version) {
  const mainFile = path.join(pluginDir, "warranty-system-rs.php");

  const content = `<?php
/**
 * Plugin Name: Warranty System RS
 * Plugin URI: https://rockstage.mx
 * Description: Sistema de gestión de garantías con verificación automática, panel administrativo y flujo DOZO actualizado. Incluye sincronización inteligente, auto-reparación y validación de integridad.
 * Version: ${version}
 * Author: RockStage Solutions
 * Author URI: https://rockstage.mx
 * Text Domain: warranty-system-rs
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * 
 * @package RockStage_Warranty_System
 * @version ${version}
 */

if (!defined('ABSPATH')) {
    die('Acceso directo no permitido.');
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES GLOBALES
// ═══════════════════════════════════════════════════════════════

define('RS_WARRANTY_VERSION', '${version}');
define('RS_WARRANTY_PLUGIN_NAME', 'Warranty System RS');
define('RS_WARRANTY_AUTHOR', 'RockStage Solutions');
define('RS_WARRANTY_FILE', __FILE__);
define('RS_WARRANTY_DIR', plugin_dir_path(__FILE__));
define('RS_WARRANTY_URL', plugin_dir_url(__FILE__));
define('RS_WARRANTY_BASENAME', plugin_basename(__FILE__));

// ═══════════════════════════════════════════════════════════════
// AUTOLOADER
// ═══════════════════════════════════════════════════════════════

spl_autoload_register(function ($class_name) {
    if (strpos($class_name, 'RS_Warranty_') === 0) {
        $class_file = 'class-' . str_replace('_', '-', strtolower(substr($class_name, 12))) . '.php';
        $file_path = RS_WARRANTY_DIR . 'includes/' . $class_file;
        
        if (file_exists($file_path)) {
            require_once $file_path;
        }
    }
});

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN DEL PLUGIN
// ═══════════════════════════════════════════════════════════════

/**
 * Inicialización principal del plugin
 * Hook: plugins_loaded (Prioridad 10)
 */
add_action('plugins_loaded', 'rs_warranty_init', 10);
function rs_warranty_init() {
    // Verificar dependencias básicas
    if (!function_exists('is_admin')) {
        error_log('Warranty System RS: WordPress core functions not available');
        return;
    }

    // Cargar clases principales si no existen
    if (!class_exists('RS_Warranty_Database')) {
        require_once RS_WARRANTY_DIR . 'includes/class-warranty-database.php';
    }
    
    if (!class_exists('RS_Warranty_Core')) {
        require_once RS_WARRANTY_DIR . 'includes/class-warranty-core.php';
    }

    if (!class_exists('RS_Warranty_Admin')) {
        require_once RS_WARRANTY_DIR . 'includes/class-warranty-admin.php';
    }

    if (!class_exists('RS_Warranty_Frontend')) {
        require_once RS_WARRANTY_DIR . 'includes/class-warranty-frontend.php';
    }

    // Inicializar componentes principales
    if (class_exists('RS_Warranty_Core')) {
        RS_Warranty_Core::get_instance();
    }

    if (is_admin() && class_exists('RS_Warranty_Admin')) {
        RS_Warranty_Admin::get_instance();
    }

    if (!is_admin() && class_exists('RS_Warranty_Frontend')) {
        RS_Warranty_Frontend::get_instance();
    }

    // Log de inicialización exitosa
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Warranty System RS v' . RS_WARRANTY_VERSION . ' initialized successfully');
    }
}

// ═══════════════════════════════════════════════════════════════
// HOOKS DE ACTIVACIÓN Y DESACTIVACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Activación del plugin
 */
register_activation_hook(__FILE__, 'rs_warranty_activate');
function rs_warranty_activate() {
    // Verificar versión mínima de WordPress
    if (version_compare(get_bloginfo('version'), '6.0', '<')) {
        wp_die('Este plugin requiere WordPress 6.0 o superior.');
    }

    // Verificar versión mínima de PHP
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        wp_die('Este plugin requiere PHP 7.4 o superior.');
    }

    // Cargar clase de base de datos
    if (!class_exists('RS_Warranty_Database')) {
        require_once RS_WARRANTY_DIR . 'includes/class-warranty-database.php';
    }

    // Crear tablas
    if (class_exists('RS_Warranty_Database')) {
        $db = RS_Warranty_Database::get_instance();
        $db->create_tables();
    }

    // Establecer opciones predeterminadas
    add_option('rs_warranty_version', RS_WARRANTY_VERSION);
    add_option('rs_warranty_activated', current_time('mysql'));

    // Flush rewrite rules
    flush_rewrite_rules();

    // Log de activación
    error_log('Warranty System RS v' . RS_WARRANTY_VERSION . ' activated successfully');
}

/**
 * Desactivación del plugin
 */
register_deactivation_hook(__FILE__, 'rs_warranty_deactivate');
function rs_warranty_deactivate() {
    // Flush rewrite rules
    flush_rewrite_rules();

    // Log de desactivación
    error_log('Warranty System RS v' . RS_WARRANTY_VERSION . ' deactivated');
}

/**
 * Desinstalación del plugin
 * Nota: Para eliminar datos, usar uninstall.php
 */
// Ver archivo uninstall.php para la lógica de desinstalación

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN DE INTEGRIDAD DOZO
// ═══════════════════════════════════════════════════════════════

/**
 * Verificación de integridad al iniciar
 * Hook: init (Prioridad 5 - antes de la inicialización principal)
 */
add_action('init', 'rs_warranty_integrity_check', 5);
function rs_warranty_integrity_check() {
    // Verificar archivos críticos
    $critical_files = [
        'includes/class-warranty-core.php',
        'includes/class-warranty-database.php',
        'includes/class-warranty-admin.php',
        'includes/class-warranty-frontend.php'
    ];

    $missing_files = [];
    foreach ($critical_files as $file) {
        if (!file_exists(RS_WARRANTY_DIR . $file)) {
            $missing_files[] = $file;
        }
    }

    if (!empty($missing_files)) {
        add_action('admin_notices', function() use ($missing_files) {
            echo '<div class="notice notice-error"><p>';
            echo '<strong>Warranty System RS:</strong> Archivos críticos faltantes: ';
            echo implode(', ', $missing_files);
            echo '</p></div>';
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// COMPATIBILIDAD CON WOOCOMMERCE
// ═══════════════════════════════════════════════════════════════

/**
 * Verificar si WooCommerce está activo
 */
function rs_warranty_is_woocommerce_active() {
    return in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')));
}

/**
 * Mostrar aviso si WooCommerce no está activo
 */
add_action('admin_notices', 'rs_warranty_woocommerce_notice');
function rs_warranty_woocommerce_notice() {
    if (!rs_warranty_is_woocommerce_active()) {
        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>Warranty System RS:</strong> Este plugin funciona mejor con WooCommerce activo.</p>';
        echo '</div>';
    }
}

// ═══════════════════════════════════════════════════════════════
// FIN DE ARCHIVO
// ═══════════════════════════════════════════════════════════════
`;

  fs.writeFileSync(mainFile, content, "utf8");
  return true;
}

/**
 * Valida que todos los hooks esenciales estén presentes
 */
function validateHooks(pluginDir) {
  const mainFile = path.join(pluginDir, "warranty-system-rs.php");
  const content = fs.readFileSync(mainFile, "utf8");

  const requiredHooks = [
    "plugins_loaded",
    "register_activation_hook",
    "register_deactivation_hook",
    "init",
  ];

  const foundHooks = [];
  const missingHooks = [];

  for (const hook of requiredHooks) {
    if (content.includes(hook)) {
      foundHooks.push(hook);
    } else {
      missingHooks.push(hook);
    }
  }

  return {
    total: requiredHooks.length,
    found: foundHooks.length,
    hooks: foundHooks,
    missing: missingHooks,
    valid: missingHooks.length === 0,
  };
}

/**
 * Cuenta archivos en un directorio recursivamente
 */
function countFiles(dir, stats = { php: 0, js: 0, css: 0, total: 0 }) {
  if (!fs.existsSync(dir)) return stats;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        !entry.name.startsWith(".") &&
        entry.name !== "backup-dozo" &&
        entry.name !== "logs"
      ) {
        countFiles(fullPath, stats);
      }
    } else {
      stats.total++;
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".php") stats.php++;
      else if (ext === ".js") stats.js++;
      else if (ext === ".css") stats.css++;
    }
  }

  return stats;
}

/**
 * Limpia versiones antiguas
 */
function cleanupOldVersions() {
  const cleaned = [];

  // Limpiar en Empaquetado/Ready
  if (fs.existsSync(packagedDir)) {
    const files = fs.readdirSync(packagedDir);
    for (const file of files) {
      if (
        file.includes("warranty-system") &&
        !file.includes(`v${NEW_VERSION}`)
      ) {
        const filePath = path.join(packagedDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
        cleaned.push(file);
      }
    }
  }

  return cleaned;
}

/**
 * Crea el paquete ZIP final
 */
function createZipPackage(sourceDir, outputPath) {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(sourceDir, PLUGIN_NAME);
    zip.writeZip(outputPath);
    return true;
  } catch (error) {
    console.error("Error al crear ZIP:", error.message);
    return false;
  }
}

/**
 * Función principal de ejecución
 */
async function main() {
  console.log(
    "\n╔═══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║  🧠 DOZO Fatal Recovery & Hook Reinsertion v1.0.6            ║",
  );
  console.log(
    "║  Sistema de Reconstrucción Completa - Warranty System RS     ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════╝\n",
  );

  const startTime = Date.now();
  const report = {
    status: "in_progress",
    plugin: "Warranty System RS",
    version: NEW_VERSION,
    author: "RockStage Solutions",
    timestamp_start: new Date().toISOString(),
    steps: [],
  };

  try {
    // ═══════════════════════════════════════════════════════════════
    // PASO 1: Verificación de requisitos
    // ═══════════════════════════════════════════════════════════════
    console.log("📋 [1/8] Verificando requisitos previos...");

    if (!fs.existsSync(pluginSourceDir)) {
      throw new Error(
        `No se encontró el directorio fuente del plugin: ${pluginSourceDir}`,
      );
    }

    const sourceStats = countFiles(pluginSourceDir);
    console.log(
      `   ✓ Plugin fuente encontrado: ${sourceStats.total} archivos (${sourceStats.php} PHP, ${sourceStats.js} JS, ${sourceStats.css} CSS)`,
    );

    report.steps.push({
      step: 1,
      name: "Verificación de requisitos",
      status: "completed",
      details: { source_files: sourceStats },
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 2: Crear directorios de trabajo
    // ═══════════════════════════════════════════════════════════════
    console.log("\n📁 [2/8] Preparando directorios de trabajo...");

    // Limpiar temporal si existe
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Crear directorio para el plugin
    const workPluginDir = path.join(tempDir, PLUGIN_NAME);
    fs.mkdirSync(workPluginDir, { recursive: true });

    console.log("   ✓ Directorios de trabajo creados");

    report.steps.push({
      step: 2,
      name: "Preparación de directorios",
      status: "completed",
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 3: Copiar estructura del plugin
    // ═══════════════════════════════════════════════════════════════
    console.log("\n📦 [3/8] Copiando estructura del plugin...");

    copyDirRecursive(pluginSourceDir, workPluginDir);

    const copiedStats = countFiles(workPluginDir);
    console.log(`   ✓ ${copiedStats.total} archivos copiados`);

    report.steps.push({
      step: 3,
      name: "Copia de estructura",
      status: "completed",
      details: { files_copied: copiedStats.total },
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 4: Crear archivo principal con hooks actualizados
    // ═══════════════════════════════════════════════════════════════
    console.log(
      "\n🔧 [4/8] Creando archivo principal con hooks actualizados...",
    );

    createMainPluginFile(workPluginDir, NEW_VERSION);
    console.log("   ✓ Archivo principal creado con estructura DOZO completa");

    report.steps.push({
      step: 4,
      name: "Creación de archivo principal",
      status: "completed",
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 5: Actualizar versiones en archivos
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n🔄 [5/8] Actualizando versión a ${NEW_VERSION}...`);

    const updatedFiles = updateVersionInFiles(workPluginDir, NEW_VERSION);
    console.log(
      `   ✓ ${updatedFiles.length} archivos actualizados con nueva versión`,
    );

    report.steps.push({
      step: 5,
      name: "Actualización de versiones",
      status: "completed",
      details: { files_updated: updatedFiles },
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 6: Validar hooks esenciales
    // ═══════════════════════════════════════════════════════════════
    console.log("\n✅ [6/8] Validando hooks de WordPress...");

    const hooksValidation = validateHooks(workPluginDir);

    if (hooksValidation.valid) {
      console.log(
        `   ✓ Todos los hooks esenciales están presentes (${hooksValidation.found}/${hooksValidation.total})`,
      );
      console.log(`   → ${hooksValidation.hooks.join(", ")}`);
    } else {
      console.warn(
        `   ⚠ Faltan ${hooksValidation.missing.length} hooks: ${hooksValidation.missing.join(", ")}`,
      );
    }

    report.steps.push({
      step: 6,
      name: "Validación de hooks",
      status: hooksValidation.valid ? "completed" : "warning",
      details: hooksValidation,
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 7: Crear paquete ZIP
    // ═══════════════════════════════════════════════════════════════
    console.log("\n📦 [7/8] Creando paquete ZIP...");

    // Asegurar que el directorio de salida existe
    if (!fs.existsSync(packagedDir)) {
      fs.mkdirSync(packagedDir, { recursive: true });
    }

    const zipFileName = `warranty-system-rs-v${NEW_VERSION}.zip`;
    const zipPath = path.join(packagedDir, zipFileName);

    const zipCreated = createZipPackage(workPluginDir, zipPath);

    if (zipCreated && fs.existsSync(zipPath)) {
      const zipSize = fs.statSync(zipPath).size;
      console.log(
        `   ✓ ZIP creado: ${zipFileName} (${(zipSize / 1024 / 1024).toFixed(2)} MB)`,
      );

      report.output_zip = zipPath;
      report.zip_size = zipSize;
    } else {
      throw new Error("No se pudo crear el archivo ZIP");
    }

    report.steps.push({
      step: 7,
      name: "Creación de paquete ZIP",
      status: "completed",
      details: {
        output: zipPath,
        size_mb: (report.zip_size / 1024 / 1024).toFixed(2),
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // PASO 8: Limpieza de versiones antiguas
    // ═══════════════════════════════════════════════════════════════
    console.log("\n🧹 [8/8] Limpiando versiones antiguas...");

    const cleaned = cleanupOldVersions();
    if (cleaned.length > 0) {
      console.log(
        `   ✓ ${cleaned.length} versión(es) antigua(s) eliminada(s):`,
      );
      cleaned.forEach((file) => console.log(`     - ${file}`));
    } else {
      console.log("   ℹ No se encontraron versiones antiguas para limpiar");
    }

    report.steps.push({
      step: 8,
      name: "Limpieza de versiones antiguas",
      status: "completed",
      details: { cleaned_files: cleaned },
    });

    // ═══════════════════════════════════════════════════════════════
    // Finalización exitosa
    // ═══════════════════════════════════════════════════════════════
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    report.status = "success";
    report.timestamp_end = new Date().toISOString();
    report.duration_seconds = parseFloat(duration);
    report.validated_hooks = hooksValidation.hooks;
    report.file_stats = copiedStats;

    // Guardar reporte
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

    // Limpiar directorio temporal
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // ═══════════════════════════════════════════════════════════════
    // Resumen final
    // ═══════════════════════════════════════════════════════════════
    console.log(
      "\n╔═══════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                  ✅ RECONSTRUCCIÓN COMPLETADA                 ║",
    );
    console.log(
      "╚═══════════════════════════════════════════════════════════════╝",
    );
    console.log("");
    console.log("📊 RESUMEN DE LA OPERACIÓN:");
    console.log(
      "─────────────────────────────────────────────────────────────────",
    );
    console.log(`   Plugin:              ${report.plugin}`);
    console.log(`   Versión:             ${report.version}`);
    console.log(`   Autor:               ${report.author}`);
    console.log(`   Archivos procesados: ${copiedStats.total}`);
    console.log(`   • PHP:               ${copiedStats.php}`);
    console.log(`   • JavaScript:        ${copiedStats.js}`);
    console.log(`   • CSS:               ${copiedStats.css}`);
    console.log(
      `   Hooks validados:     ${hooksValidation.found}/${hooksValidation.total}`,
    );
    console.log(`   Tiempo de ejecución: ${duration}s`);
    console.log("");
    console.log("📁 ARCHIVOS GENERADOS:");
    console.log(
      "─────────────────────────────────────────────────────────────────",
    );
    console.log(`   📦 ZIP:     ${zipPath}`);
    console.log(`   📄 Reporte: ${reportPath}`);
    console.log("");
    console.log("🔍 PRÓXIMOS PASOS:");
    console.log(
      "─────────────────────────────────────────────────────────────────",
    );
    console.log("   1. Descargar el plugin desde WordPress");
    console.log(`   2. Subir el archivo: ${zipFileName}`);
    console.log("   3. Activar el plugin");
    console.log("   4. Verificar panel de administración en WP Admin");
    console.log("   5. Probar funcionalidad de garantías");
    console.log("");
    console.log(
      "═══════════════════════════════════════════════════════════════",
    );
    console.log(
      "🎉 Plugin Warranty System RS v1.0.6 listo para implementación",
    );
    console.log(
      "═══════════════════════════════════════════════════════════════\n",
    );
  } catch (error) {
    report.status = "failed";
    report.error = error.message;
    report.timestamp_end = new Date().toISOString();

    console.error("\n❌ ERROR EN LA RECONSTRUCCIÓN:");
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error(`   ${error.message}`);
    console.error("");

    if (error.stack) {
      console.error("Stack trace:");
      console.error(error.stack);
    }

    // Guardar reporte de error
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

    // Limpiar directorio temporal en caso de error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    process.exit(1);
  }
}

// Ejecutar
main();

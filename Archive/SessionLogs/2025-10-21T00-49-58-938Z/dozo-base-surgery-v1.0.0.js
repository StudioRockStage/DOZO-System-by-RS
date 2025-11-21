#!/usr/bin/env node

/*
🧩 DOZO Base Surgery & Pack Fix v1.0.0
Sistema: DOZO System by RS
Proyecto: Warranty System RS
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";
import { execSync } from "child_process";

// Helper functions to replace fs-extra
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

function moveSync(src, dest, options = {}) {
  if (fs.existsSync(dest) && options.overwrite) {
    removeSync(dest);
  }
  fs.renameSync(src, dest);
}

const ROOT = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  "Documents/DOZO System by RS",
);
const LATEST = path.join(ROOT, "Latest Builds", "Warranty System RS");
const READY = path.join(ROOT, "Empaquetado", "Ready");
const REPORT = path.join(
  ROOT,
  "to chat gpt",
  "Global",
  "DOZO-BaseSurgery-Report.json",
);

console.log("🧩 DOZO Base Surgery & Pack Fix v1.0.0");
console.log("═".repeat(60));

// 1) Fuente: detecta el ZIP base (prioriza warranty-system-rs.zip)
console.log("\n📦 Buscando ZIP base...");
const candidates = [
  "warranty-system-rs.zip",
  "warranty-system-rs-v1.0.0.zip",
  "warranty-system-rs-complete.zip",
]
  .map((n) => path.join(LATEST, n))
  .filter((p) => fs.existsSync(p));

if (!candidates.length) {
  console.error(
    "❌ No se encontró ZIP base en Latest Builds/Warranty System RS/",
  );
  process.exit(1);
}

const baseZipPath = candidates[0];
console.log(`✓ ZIP encontrado: ${path.basename(baseZipPath)}`);

// 2) Extrae a temp
console.log("\n🔧 Extrayendo a temporal...");
const TMP = path.join(LATEST, "__TMP_SURGERY__");
removeSync(TMP);
mkdirpSync(TMP);
new AdmZip(baseZipPath).extractAllTo(TMP, true);
console.log(`✓ Extraído a: ${TMP}`);

// 3) Detecta carpeta raíz del plugin
console.log("\n🧭 Analizando estructura...");
let entries = fs.readdirSync(TMP).filter((n) => !n.startsWith("."));
console.log(`  Entradas encontradas: ${entries.join(", ")}`);

if (
  entries.length !== 1 ||
  !fs.statSync(path.join(TMP, entries[0])).isDirectory()
) {
  // Caso: venían varias carpetas (admin/, public/, warranty-system-rs/)
  // Forzamos a que la raíz sea warranty-system-rs y movemos lo que corresponda dentro
  console.log("⚠️  Múltiples entradas detectadas, consolidando...");
  const FIXROOT = path.join(TMP, "warranty-system-rs");
  mkdirpSync(FIXROOT);
  for (const e of entries) {
    const full = path.join(TMP, e);
    if (fs.statSync(full).isDirectory()) {
      // Si ya existe warranty-system-rs dentro, mantenlo tal cual; si hay admin/ o public/ sueltos, muévelos dentro
      if (e !== "warranty-system-rs") {
        // Si el main plugin está dentro de alguna subcarpeta, lo reubicamos.
        console.log(`  Moviendo ${e}/ → warranty-system-rs/${e}/`);
        moveSync(full, path.join(FIXROOT, e), { overwrite: true });
      }
    } else {
      // archivos sueltos → a raíz del plugin
      console.log(`  Moviendo ${e} → warranty-system-rs/${e}`);
      moveSync(full, path.join(FIXROOT, e), { overwrite: true });
    }
  }
  entries = ["warranty-system-rs"];
}

const PLUGIN_DIR = path.join(TMP, entries[0]);
if (path.basename(PLUGIN_DIR) !== "warranty-system-rs") {
  const target = path.join(TMP, "warranty-system-rs");
  console.log(
    `🧭 Renombrando ${path.basename(PLUGIN_DIR)} → warranty-system-rs/`,
  );
  moveSync(PLUGIN_DIR, target, { overwrite: true });
}

// 4) Asegura que exista el archivo principal warranty-system-rs.php
console.log("\n🔍 Verificando archivo principal PHP...");
const MAIN_PHP = path.join(TMP, "warranty-system-rs", "warranty-system-rs.php");
if (!fs.existsSync(MAIN_PHP)) {
  console.log(
    "⚠️  warranty-system-rs.php no encontrado, buscando alternativa...",
  );
  // Busca un main alterno y renómbralo
  const candidatesPhp = fs
    .readdirSync(path.join(TMP, "warranty-system-rs"))
    .filter((f) => f.endsWith(".php"));
  const fallback = candidatesPhp.find((f) =>
    /warranty|rockstage|main|plugin/i.test(f),
  );
  if (!fallback) {
    console.error("❌ No se encontró archivo PHP principal del plugin.");
    process.exit(1);
  }
  moveSync(path.join(TMP, "warranty-system-rs", fallback), MAIN_PHP, {
    overwrite: true,
  });
  console.log(`✓ Renombrado ${fallback} → warranty-system-rs.php`);
} else {
  console.log("✓ warranty-system-rs.php encontrado");
}

// 5) Parchea cabeceras + Update URI + text domain + requires/tested
console.log("\n🩹 Parcheando cabeceras del plugin...");
let php = fs.readFileSync(MAIN_PHP, "utf8");

// Garantiza cabecera estándar
php = php.replace(/^<\?php\s*\/\*\*[\s\S]*?\*\/\s*/m, (hdr) => {
  // Reescribe manteniendo descripción si la hubiera
  const desc = /Description:\s*(.*)/i.test(hdr)
    ? RegExp.$1.trim()
    : "Sistema completo de gestión de garantías para RockStage con verificación automática, panel de administración premium y actualizaciones automáticas.";
  return `<?php
/**
 * Plugin Name: Warranty System RS
 * Plugin URI: https://rockstage.com
 * Description: ${desc}
 * Version: 1.0.0
 * Author: RockStage Solutions
 * Author URI: https://rockstage.com
 * Text Domain: warranty-system-rs
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

`;
});

// Asegura constantes y basename dinámico
php = php
  .replace(/define\('RS_WARRANTY_PLUGIN_BASENAME'[\s\S]*?;\s*/g, "")
  .replace(
    /define\('RS_WARRANTY_PLUGIN_FILE'[\s\S]*?;\s*/g,
    "define('RS_WARRANTY_PLUGIN_FILE', __FILE__);\n",
  )
  .replace(
    /define\('RS_WARRANTY_PLUGIN_DIR'[\s\S]*?;\s*/g,
    "define('RS_WARRANTY_PLUGIN_DIR', plugin_dir_path(__FILE__));\n",
  )
  .replace(
    /define\('RS_WARRANTY_PLUGIN_URL'[\s\S]*?;\s*/g,
    "define('RS_WARRANTY_PLUGIN_URL', plugin_dir_url(__FILE__));\n",
  );

// Inserta RS_WARRANTY_PLUGIN_BASENAME correcto si no existe
if (!/RS_WARRANTY_PLUGIN_BASENAME/.test(php)) {
  php = php.replace(
    /define\('RS_WARRANTY_PLUGIN_FILE', __FILE__\);\s*/g,
    "define('RS_WARRANTY_PLUGIN_FILE', __FILE__);\n" +
      "define('RS_WARRANTY_PLUGIN_BASENAME', plugin_basename(__FILE__));\n",
  );
}

// Hook de link "Configuración" atado a basename dinámico
if (!/plugin_action_links_/.test(php)) {
  php += `

/**
 * Enlace de Configuración en la lista de plugins
 */
function rs_warranty_plugin_action_links($links) {
    $settings_link = '<a href="admin.php?page=rockstage-warranty-settings">Configuración</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . RS_WARRANTY_PLUGIN_BASENAME, 'rs_warranty_plugin_action_links');
`;
  console.log("✓ Enlace de configuración añadido");
} else {
  // Asegura que use RS_WARRANTY_PLUGIN_BASENAME
  php = php.replace(
    /plugin_action_links_'\s*\.\s*plugin_basename\(__FILE__\)\s*,/g,
    "plugin_action_links_' . RS_WARRANTY_PLUGIN_BASENAME,",
  );
  console.log("✓ Enlace de configuración actualizado");
}

// Asegura un menú mínimo si el admin no existe
const ADMIN_DIR = path.join(TMP, "warranty-system-rs", "admin");
const ADMIN_CLASS = path.join(
  TMP,
  "warranty-system-rs",
  "includes",
  "class-warranty-admin.php",
);
let ensureAdminMenuSnippet = `
add_action('admin_menu', function() {
    if (!current_user_can('manage_options')) return;
    add_menu_page(
        'Warranty System RS',
        'Warranty System RS',
        'manage_options',
        'rockstage-warranty-settings',
        function() {
            echo '<div class="wrap"><h1>Warranty System RS</h1><p>Panel activo.</p></div>';
        },
        'dashicons-shield',
        56
    );
});
`;

if (!fs.existsSync(ADMIN_DIR) || !fs.existsSync(ADMIN_CLASS)) {
  // Inserta menú mínimo para garantizar visibilidad
  if (!/add_menu_page\(/.test(php)) {
    php += `\n${ensureAdminMenuSnippet}\n`;
    console.log("✓ Menú de administración mínimo añadido");
  }
} else {
  console.log("✓ Clase de administración existente detectada");
}

// Guarda main PHP parcheado
fs.writeFileSync(MAIN_PHP, php, "utf8");
console.log("✓ Archivo principal parcheado y guardado");

// 6) Verifica subcarpetas esperadas
console.log("\n📁 Verificando estructura de directorios...");
const mustHave = ["includes", "assets", "templates", "tools"];
const present = [];
for (const d of mustHave) {
  const p = path.join(TMP, "warranty-system-rs", d);
  if (fs.existsSync(p)) {
    present.push(d);
    console.log(`  ✓ ${d}/`);
  } else {
    console.log(`  ⚠️  ${d}/ (no encontrado)`);
  }
}
const missing = mustHave.filter((d) => !present.includes(d));

// 7) Crea index.php vacíos para seguridad
console.log("\n🔒 Creando index.php de seguridad...");
function touchIndex(dir) {
  const idx = path.join(dir, "index.php");
  if (!fs.existsSync(idx)) {
    fs.writeFileSync(idx, "<?php // Silence is golden.\n");
    console.log(`  ✓ ${path.relative(TMP, idx)}`);
  }
}
touchIndex(path.join(TMP, "warranty-system-rs"));
for (const d of present) touchIndex(path.join(TMP, "warranty-system-rs", d));

// 8) Re-empaqueta correctamente: warranty-system-rs.zip (carpeta raíz: warranty-system-rs/)
console.log("\n📦 Re-empaquetando ZIP...");
mkdirpSync(READY);
const outZip = path.join(READY, "warranty-system-rs.zip");
removeSync(outZip);
const zip = new AdmZip();
zip.addLocalFolder(path.join(TMP, "warranty-system-rs"), "warranty-system-rs");
zip.writeZip(outZip);
console.log(`✓ ZIP creado: ${outZip}`);

// 9) Checksum y reporte
console.log("\n🔐 Calculando checksum...");
const buf = fs.readFileSync(outZip);
const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
const stats = fs.statSync(outZip);

console.log(`✓ SHA256: ${sha256}`);
console.log(`✓ Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

const report = {
  base_zip_used: path.basename(baseZipPath),
  output_zip: outZip,
  size_bytes: stats.size,
  size_readable: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
  sha256,
  fixed: {
    root_folder: "warranty-system-rs",
    main_php: "warranty-system-rs.php",
    headers: [
      "Plugin Name",
      "Version",
      "Text Domain",
      "Update URI",
      "Requires",
      "Requires PHP",
    ],
    basename: "RS_WARRANTY_PLUGIN_BASENAME = plugin_basename(__FILE__)",
    settings_link: true,
    admin_menu_minimum:
      !fs.existsSync(ADMIN_DIR) || !fs.existsSync(ADMIN_CLASS)
        ? "injected"
        : "kept",
    missing_dirs: missing,
    present_dirs: present,
  },
  notes: [
    "ZIP reempaquetado con una única carpeta raíz warranty-system-rs/",
    "Listo para subir manualmente e instalar desde WP",
    "Si ya estaba instalado, desactivar/eliminar e instalar este paquete limpio",
  ],
  timestamp: new Date().toISOString(),
};

mkdirpSync(path.dirname(REPORT));
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

// Limpieza
console.log("\n🧹 Limpiando temporales...");
removeSync(TMP);
console.log("✓ Carpeta temporal eliminada");

console.log("\n" + "═".repeat(60));
console.log("✅ Cirugía completada y ZIP reempaquetado exitosamente");
console.log("═".repeat(60));
console.log(`\n📦 ZIP FINAL: ${outZip}`);
console.log(`🧾 REPORTE: ${REPORT}`);
console.log(`\n🎯 Próximos pasos:`);
console.log(`   1. Validar con: node dozo-final-readiness-v1.0.0.js`);
console.log(`   2. Subir a servidor de actualizaciones`);
console.log(`   3. Instalar en WordPress\n`);

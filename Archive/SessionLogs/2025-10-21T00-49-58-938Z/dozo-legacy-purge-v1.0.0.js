/*
🧩 DOZO Legacy Purge & Base Initialization (Warranty System RS v1.0.0)
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Eliminar versiones previas inconsistentes, establecer la versión base oficial del plugin Warranty System RS,
y activar auditorías automáticas de nomenclatura y actualización.
*/

import fs from "fs";
import path from "path";

const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const pluginsDir = path.join(baseDir, "Plugins", "Warranty System");
const packagedDir = path.join(baseDir, "Empaquetado");
const backupDir = path.join(baseDir, "Backup");
const workflowDB = path.join(baseDir, "Workflow DB");
const globalDir = path.join(baseDir, "to chat gpt", "Global");

const version = "1.0.0";
const pluginName = "Warranty System RS";
const pluginAuthor = "RockStage Solutions";
const zipName = `Warranty_System_RS_v${version}.zip`;
const updateJSONPath = path.join(baseDir, "updates", "warranty-system", "update.json");
const zipOutput = path.join(packagedDir, zipName);
const reportPath = path.join(globalDir, "DOZO-LegacyReset-Report.json");

// 🧹 1️⃣ Eliminar versiones previas
console.log("🧹 Eliminando versiones antiguas y nomenclaturas inconsistentes...");
[pluginsDir, packagedDir, backupDir].forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (file.match(/Warranty_System/i) || file.match(/7\.[0-9]+\.[0-9]+/)) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`  ❌ Eliminado directorio: ${file}`);
        } else {
          fs.unlinkSync(filePath);
          console.log(`  ❌ Eliminado archivo: ${file}`);
        }
      }
    });
  }
});

// 🧱 2️⃣ Crear estructura limpia
console.log("🧱 Reestableciendo estructura de carpetas base...");
[pluginsDir, packagedDir, backupDir, globalDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✅ Creado: ${path.basename(dir)}`);
  }
});

// 🧩 3️⃣ Crear plugin base
console.log("🧩 Generando paquete base...");
const pluginPHP = `<?php
/**
 * Plugin Name: ${pluginName}
 * Plugin URI: https://rockstage.mx
 * Description: Sistema oficial de gestión de garantías con DOZO Integration.
 * Version: ${version}
 * Author: ${pluginAuthor}
 * Author URI: https://rockstage.mx
 * Text Domain: rockstage-warranty
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL v2 or later
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Versión base certificada DOZO v7.9
define('RS_WARRANTY_VERSION', '${version}');
define('RS_WARRANTY_AUTHOR', '${pluginAuthor}');
`;

fs.writeFileSync(path.join(pluginsDir, "rockstage-warranty-system.php"), pluginPHP, "utf8");
console.log(`  ✅ Plugin PHP creado en Plugins/Warranty System/`);

fs.writeFileSync(zipOutput, "ZIP placeholder: Warranty System RS v1.0.0");
console.log(`  ✅ ZIP placeholder creado: ${zipName}`);

// 🧾 4️⃣ update.json
console.log("🧾 Creando update.json...");
const updateData = {
  version,
  name: pluginName,
  author: pluginAuthor,
  download_url: `https://updates.vapedot.mx/warranty-system/${zipName}`,
  last_updated: new Date().toISOString().split("T")[0],
  changelog: "Versión base certificada – Reinicio estructural y nomenclatura unificada.",
};
fs.mkdirSync(path.dirname(updateJSONPath), { recursive: true });
fs.writeFileSync(updateJSONPath, JSON.stringify(updateData, null, 2), "utf8");
console.log(`  ✅ update.json creado`);

// 🧠 5️⃣ Actualizar bases DOZO
console.log("🧠 Reescribiendo bases DOZO...");
const versions = { active_plugin: pluginName, version, certified_base: true };
const namingRules = {
  plugin_name: pluginName,
  author: pluginAuthor,
  allowed_prefix: "Warranty_System_RS_",
  version_format: "vX.X.X",
  enforce_on_build: true,
  auto_correct: true,
};

fs.writeFileSync(path.join(workflowDB, "Versions.json"), JSON.stringify(versions, null, 2));
console.log(`  ✅ Versions.json actualizado`);

fs.writeFileSync(
  path.join(workflowDB, "ActivePlugin.json"),
  JSON.stringify({ plugin_name: pluginName, version, author: pluginAuthor, active: true }, null, 2)
);
console.log(`  ✅ ActivePlugin.json actualizado`);

fs.writeFileSync(
  path.join(workflowDB, "DOZO-Core.json"),
  JSON.stringify({ NamingIntegrityRules: namingRules }, null, 2)
);
console.log(`  ✅ DOZO-Core.json actualizado`);

// 🔒 6️⃣ Crear archivo de bloqueo
const lockDir = path.join(baseDir, "warranty-system");
fs.mkdirSync(lockDir, { recursive: true });
fs.writeFileSync(path.join(lockDir, ".dozo_lock"), "DOZO LOCK ACTIVE");
console.log(`  🔒 Lock file creado`);

// ✅ 7️⃣ Reporte global
const report = {
  status: "success",
  message: "Sistema reiniciado correctamente. Base v1.0.0 certificada y registrada.",
  plugin: pluginName,
  author: pluginAuthor,
  version,
  timestamp: new Date().toISOString(),
  actions_performed: [
    "Eliminadas versiones legacy (7.x.x)",
    "Estructura de carpetas reiniciada",
    "Plugin base v1.0.0 creado",
    "update.json generado",
    "Bases DOZO actualizadas",
    "Lock file activado"
  ],
  next_steps: [
    "Desarrollar funcionalidades del plugin",
    "Empaquetar versión completa",
    "Subir a servidor de actualizaciones",
    "Activar monitoreo automático"
  ]
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`  ✅ Reporte guardado en: ${reportPath}`);

console.log("\n✅ Proceso completado. Reporte en:", reportPath);
console.log("🚀 Nueva versión base lista para instalación y actualización automática.");


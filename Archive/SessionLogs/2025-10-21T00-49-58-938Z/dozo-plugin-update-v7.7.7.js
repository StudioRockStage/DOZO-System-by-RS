/*
🧩 Prompt Maestro – DOZO Plugin Update Integration (Warranty System RS v7.7.7)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Añadir el trigger de actualización automática (force-update-check.php) y vincularlo con el sistema DOZO Update Channel.
*/

import fs from "fs";
import path from "path";

const pluginDir = path.resolve(
  process.env.HOME,
  "Documents/DOZO System by RS/Plugins/Warranty System"
);
const mainFile = path.join(pluginDir, "rockstage-warranty-system.php");
const triggerFile = path.join(pluginDir, "force-update-check.php");
const logFile = path.join(pluginDir, "DOZO-Patch-Log.json");

(async () => {
  console.log("\n🚀 Iniciando actualización del plugin Warranty System RS → v7.7.7");

  // Verificar existencia del archivo principal
  if (!fs.existsSync(mainFile)) {
    console.error("❌ No se encontró el archivo principal del plugin.");
    process.exit(1);
  }

  // Crear el script force-update-check.php
  const triggerCode = `<?php
/**
 * RockStage Warranty System RS - Force Update Trigger
 * DOZO Ecosystem v7.9 – Auto Update Module
 */

if ( ! defined('ABSPATH') ) {
  require_once( dirname(__FILE__, 4 ) . '/wp-load.php' );
}

echo "<h2>🔄 RockStage Warranty System RS – Instant Update Trigger</h2>";

require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/update.php';
require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

wp_clean_plugins_cache();
do_action('wp_update_plugins');

$updates = get_site_transient('update_plugins');
if ( isset($updates->response) && !empty($updates->response) ) {
    foreach ($updates->response as $plugin => $info) {
        if (strpos($plugin, 'rockstage-warranty-system.php') !== false) {
            echo "✅ Actualización detectada: " . esc_html($info->new_version) . "<br>";
            echo "🔗 Descarga: " . esc_url($info->package) . "<br>";
            echo "📘 Detalles: " . esc_url($info->url) . "<br>";
            exit;
        }
    }
    echo "⚠️ No se detectaron actualizaciones pendientes para Warranty System RS.";
} else {
    echo "⚠️ No hay actualizaciones disponibles.";
}

echo "<br><br>🧩 DOZO Trigger completado correctamente.";
?>`;

  fs.writeFileSync(triggerFile, triggerCode);
  console.log("✅ Archivo force-update-check.php creado correctamente.");

  // Actualizar versión en el archivo principal
  let pluginContent = fs.readFileSync(mainFile, "utf8");
  pluginContent = pluginContent.replace(
    /Version:\s*[0-9.]+/,
    "Version: 7.7.7"
  );
  fs.writeFileSync(mainFile, pluginContent);
  console.log("🔢 Versión actualizada a 7.7.7 en rockstage-warranty-system.php");

  // Registrar el cambio en el changelog
  const changelogEntry = {
    version: "7.7.7",
    date: new Date().toISOString().split("T")[0],
    changes: [
      "➕ Añadido trigger force-update-check.php",
      "🔗 Integración directa con DOZO Update Channel",
      "🧩 Validación de ruta y actualización inmediata",
      "✅ Compatible con https://updates.vapedot.mx/warranty-system/update.json"
    ]
  };

  fs.writeFileSync(logFile, JSON.stringify(changelogEntry, null, 2));
  console.log("🧾 Log generado:", logFile);

  console.log("\n🎉 Actualización completada. Plugin preparado para deploy v7.7.7\n");
})();


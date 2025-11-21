/*
🧩 DOZO Force Update Check (Local Mode v7.7.9)
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Verificar manualmente si el servidor remoto de actualizaciones entrega
la versión correcta (7.7.9) del plugin Warranty System RS y generar reporte en /Global.
*/

import fs from "fs";
import path from "path";
import https from "https";

const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const reportPath = path.join(globalDir, "DOZO-ForceUpdate-Report.json");
const localPluginVersion = "7.7.8"; // versión actualmente instalada
const pluginName = "Warranty System RS";
const updateURL = "https://updates.vapedot.mx/warranty-system/update.json";

console.log("\n🔍 Ejecutando DOZO Force Update Check (Local Mode v7.7.9)");
console.log("═══════════════════════════════════════════════════════════");

(async () => {
  try {
    const response = await new Promise((resolve, reject) => {
      https
        .get(updateURL, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              body: data,
            }),
          );
        })
        .on("error", (err) => reject(err));
    });

    let remoteVersion = null;
    let status = "unknown";

    if (response.status === 200 && response.body) {
      const json = JSON.parse(response.body);
      remoteVersion = json?.version || "unknown";

      if (remoteVersion !== "unknown") {
        if (remoteVersion !== localPluginVersion) {
          status = "update_available";
        } else {
          status = "up_to_date";
        }
      } else {
        status = "invalid_response";
      }
    } else {
      status = "fetch_error";
    }

    const report = {
      plugin: pluginName,
      local_version: localPluginVersion,
      remote_version: remoteVersion,
      status,
      remote_status: response.status,
      checked_at: new Date().toISOString(),
    };

    // Asegurar directorio
    fs.mkdirSync(globalDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("✅ Verificación completada.");
    console.log("📄 Reporte generado en:", reportPath);
    console.log("🧩 Resultado:", status);
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );
  } catch (error) {
    console.error("❌ Error en la verificación:", error);
    const errorReport = {
      plugin: pluginName,
      error: error.message,
      checked_at: new Date().toISOString(),
    };
    fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2));
  }
})();

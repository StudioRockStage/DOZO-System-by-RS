/*
🧩 Prompt Maestro – DOZO Phase 14 (Monitoring & Analytics System)
Ecosistema: DOZO System by RS
Versión: v7.9 – Fase 14
Autor: RockStage Solutions

Objetivo:
Activar el sistema de monitoreo continuo del ecosistema DOZO, registrando automáticamente métricas, actividad de plugins, y análisis de integridad.
Crea y mantiene el archivo central `/to chat gpt/Global/DOZO-Monitoring.json` con los datos más recientes de desempeño y salud del sistema.
*/

import fs from "fs";
import path from "path";

const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const monitoringFile = path.join(
  baseDir,
  "to chat gpt/Global/DOZO-Monitoring.json",
);
const pluginsDir = path.join(baseDir, "Plugins");
const reportsDir = path.join(baseDir, "to chat gpt/Global");

function gatherPluginStats(pluginPath) {
  const stats = fs.statSync(pluginPath);
  return {
    name: path.basename(pluginPath),
    sizeKB: (stats.size / 1024).toFixed(2),
    modified: stats.mtime.toISOString(),
  };
}

function scanPlugins() {
  const pluginFolders = fs.readdirSync(pluginsDir);
  const results = [];

  for (const folder of pluginFolders) {
    const folderPath = path.join(pluginsDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs
        .readdirSync(folderPath)
        .filter((f) => f.endsWith(".zip"));
      files.forEach((file) => {
        results.push(gatherPluginStats(path.join(folderPath, file)));
      });
    }
  }
  return results;
}

function collectSystemHealth() {
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(0) + "s",
    memory: {
      rssMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      heapMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    },
    nodeVersion: process.version,
    platform: process.platform,
  };
}

function main() {
  console.log("\n📡 Iniciando DOZO Monitoring & Analytics System...");

  const data = {
    generatedAt: new Date().toISOString(),
    systemHealth: collectSystemHealth(),
    plugins: scanPlugins(),
  };

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(monitoringFile, JSON.stringify(data, null, 2));
  console.log(`✅ Monitoreo actualizado en: ${monitoringFile}`);
  console.log(`📊 Plugins registrados: ${data.plugins.length}`);

  console.log(
    "\n✅ Fase 14 completada. El sistema está listo para el monitoreo continuo.",
  );
}

main();

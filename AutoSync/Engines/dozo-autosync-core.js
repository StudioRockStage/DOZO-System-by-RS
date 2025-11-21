/**
 * 🔄 DOZO AutoSync Core v2.0.0
 * Escanea, sincroniza y valida automáticamente todos los plugins del ecosistema DOZO.
 */
import fs from "fs";
import path from "path";

const basePath = path.resolve("./Plugins");
const logPath = path.resolve("./AutoSync/Logs/sync.log");
const reportDir = path.resolve("./AutoSync/Reports");
fs.mkdirSync(reportDir, { recursive: true });

function log(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${message}\n`);
  console.log(message);
}

function listPlugins() {
  return fs.existsSync(basePath)
    ? fs
        .readdirSync(basePath)
        .filter((f) => fs.lstatSync(path.join(basePath, f)).isDirectory())
    : [];
}

function syncPlugin(pluginName) {
  const pluginPath = path.join(basePath, pluginName);
  const configPath = path.join(pluginPath, "plugin.json");
  if (!fs.existsSync(configPath)) {
    log(`⚠️ ${pluginName} no tiene archivo de configuración.`);
    return;
  }

  const pluginData = JSON.parse(fs.readFileSync(configPath, "utf8"));
  log(`🔍 Verificando ${pluginData.name || pluginName} v${pluginData.version}`);

  // Validación básica
  if (!pluginData.version || !pluginData.author) {
    log(`❌ Configuración incompleta en ${pluginName}`);
    return;
  }

  // Actualización simulada
  pluginData.lastSync = new Date().toISOString();
  fs.writeFileSync(configPath, JSON.stringify(pluginData, null, 2));
  log(`✅ ${pluginName} sincronizado correctamente.`);
}

function runAutoSync() {
  log("🚀 Iniciando sincronización automática...");
  const plugins = listPlugins();
  if (plugins.length === 0) {
    log("⚠️ No se encontraron plugins para sincronizar.");
    return;
  }

  plugins.forEach(syncPlugin);

  const reportPath = path.join(
    reportDir,
    "autosync-report-" +
      new Date().toISOString().replace(/[:.]/g, "-") +
      ".json",
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ plugins, timestamp: new Date() }, null, 2),
  );
  log(`🧾 Reporte generado: ${reportPath}`);
}

runAutoSync();

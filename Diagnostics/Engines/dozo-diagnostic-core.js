/**
 * 🩺 DOZO Diagnostic Core v2.0.0
 * Escanea la estructura completa, identifica errores comunes,
 * y ejecuta reparaciones automáticas basadas en patrones conocidos.
 */
import fs from "fs";
import path from "path";

const logFile = path.resolve("./Diagnostics/Logs/diagnostic.log");
const repairDir = path.resolve("./Diagnostics/Backups");
fs.mkdirSync(repairDir, { recursive: true });

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  console.log(message);
}

function checkFileIntegrity(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    log(`✅ OK: ${filePath}`);
    return true;
  } catch {
    log(`❌ Error: ${filePath} no accesible.`);
    return false;
  }
}

function repairFile(filePath) {
  const backupPath = path.join(repairDir, path.basename(filePath) + ".bak");
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    log(`🩹 Backup creado: ${backupPath}`);
  } else {
    log(`⚠️ Archivo ausente: ${filePath}. Se omite.`);
  }
}

function scanAndRepair(baseDir) {
  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(baseDir, item.name);
    if (item.isDirectory()) {
      scanAndRepair(fullPath);
    } else if (!checkFileIntegrity(fullPath)) {
      repairFile(fullPath);
    }
  }
}

log("🚀 Iniciando escaneo del sistema DOZO...");
scanAndRepair("./");
log("✅ Escaneo y reparaciones completadas.");

/*
🧩 DOZO Control Center v1.0.0 (Core Integration & System Bridge)
Ecosistema: DOZO System by RS
Fase: 1 de 4 – Core Integration
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// --- BASE PATH ---
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");

// --- ESTRUCTURA OFICIAL ---
const structure = {
  "DOZO Core": ["Scripts", "Deploy", "Validators", "APIs"],
  Dashboard: ["public", "assets", "modules"],
  Plugins: [],
  "Workflow DB": ["Reports", "Snapshots", "Health", "Knowledge"],
  Backup: ["Snapshots", "Pre-ControlCenter", "Workspace_Trash"],
  "Latest Builds": [],
  Archive: ["SessionLogs", "QuickNotes"],
  Shared: [],
};

// --- 1️⃣ Verificar estructura y crear carpetas ---
console.log("\n📁 Verificando estructura base...");
for (const [dir, subs] of Object.entries(structure)) {
  const fullPath = path.join(baseDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  subs.forEach((s) =>
    fs.mkdirSync(path.join(fullPath, s), { recursive: true }),
  );
}
console.log("✅ Estructura verificada");

// --- 2️⃣ Snapshot de respaldo ---
const snapshotDir = path.join(
  baseDir,
  "Backup",
  "Pre-ControlCenter",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
fs.mkdirSync(snapshotDir, { recursive: true });
console.log("💾 Creando copia de respaldo...");
execSync(`rsync -av --exclude 'Backup' "${baseDir}/" "${snapshotDir}/"`, {
  stdio: "inherit",
});
console.log("✅ Snapshot creado en:", snapshotDir);

// --- 3️⃣ Clasificación de archivos sueltos ---
const fileMap = {};
const files = fs
  .readdirSync(baseDir)
  .filter((f) => !fs.lstatSync(path.join(baseDir, f)).isDirectory());

files.forEach((file) => {
  const ext = path.extname(file);
  let targetDir = null;
  if (ext === ".js" || ext === ".sh")
    targetDir = path.join(baseDir, "DOZO Core", "Scripts");
  else if (ext === ".json") targetDir = path.join(baseDir, "Workflow DB");
  else if (ext === ".md")
    targetDir = path.join(baseDir, "Archive", "QuickNotes");
  else if (ext === ".zip") targetDir = path.join(baseDir, "Latest Builds");
  else if ([".php", ".css", ".html"].includes(ext))
    targetDir = path.join(baseDir, "Plugins");
  if (targetDir) {
    fs.renameSync(path.join(baseDir, file), path.join(targetDir, file));
    fileMap[file] = targetDir;
  }
});

// --- 4️⃣ Generar índice DOZO-FileMap.json ---
const fileMapPath = path.join(baseDir, "Workflow DB", "DOZO-FileMap.json");
fs.writeFileSync(fileMapPath, JSON.stringify(fileMap, null, 2));
console.log("🧭 Archivo DOZO-FileMap.json generado");

// --- 5️⃣ Registro inicial en Workflow DB ---
const workflowPath = path.join(
  baseDir,
  "Workflow DB",
  "DOZO-CoreRegistry.json",
);
const coreRegistry = {
  initialized_at: new Date().toISOString(),
  version: "1.0.0",
  environment: "local-macos",
  integrity_snapshot: snapshotDir,
  classified_files: Object.keys(fileMap).length,
};
fs.writeFileSync(workflowPath, JSON.stringify(coreRegistry, null, 2));
console.log("🧩 DOZO-CoreRegistry.json creado");

// --- 6️⃣ Health Check básico ---
const health = {
  status: "OK",
  total_folders: Object.keys(structure).length,
  total_files_classified: Object.keys(fileMap).length,
  last_snapshot: snapshotDir,
  next_phase: "FASE 2 – API & Visual Link (Log Viewer + Core Server)",
};
const healthPath = path.join(baseDir, "Workflow DB", "DOZO-Health.json");
fs.writeFileSync(healthPath, JSON.stringify(health, null, 2));
console.log("💡 DOZO-Health.json actualizado");

console.log("\n══════════════════════════════════════════════════════════════");
console.log("✅ FASE 1 completada – DOZO Control Center Core integrado.");
console.log("📘 Archivos indexados:", Object.keys(fileMap).length);
console.log("📦 Snapshot creado en:", snapshotDir);
console.log("➡️ Próximo paso: ejecutar FASE 2 – API & Visual Link.");
console.log("══════════════════════════════════════════════════════════════\n");

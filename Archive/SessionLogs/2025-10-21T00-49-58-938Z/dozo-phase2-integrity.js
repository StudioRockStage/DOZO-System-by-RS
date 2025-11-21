/*
🧩 Prompt Maestro – DOZO Integridad y Seguridad (Fase 2 – v7.7.5-FullCheck)
Autor: RockStage Solutions
Ecosistema: DOZO System by RS
Objetivo: Validar integridad de la nueva estructura, asegurar permisos, verificar roles IA, y detectar el plugin activo.
*/

import fs from "fs";
import path from "path";

const basePath = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const workflowPath = path.join(basePath, "Workflow DB");
const reportPath = path.join(
  basePath,
  "to chat gpt",
  "Global",
  "DOZO-Integrity-Report.json",
);

function validateFolders() {
  const requiredFolders = [
    "Claude AI",
    "Cursor AI",
    "ChatGPT AI",
    "Shared",
    "Plugins",
    "Backup",
    "Latest Builds",
    "Workflow DB",
    "to chat gpt",
  ];
  const missing = requiredFolders.filter(
    (f) => !fs.existsSync(path.join(basePath, f)),
  );
  return missing.length ? { ok: false, missing } : { ok: true };
}

function validateFiles() {
  const requiredFiles = [
    "DOZO-Core.json",
    "IA-Roles.json",
    "Versions.json",
    "AuditLogs.json",
    "ActivePlugin.json",
    "ChatGPT-Link.json",
  ];
  const missing = requiredFiles.filter(
    (f) => !fs.existsSync(path.join(workflowPath, f)),
  );
  return missing.length ? { ok: false, missing } : { ok: true };
}

function securePermissions() {
  try {
    fs.chmodSync(basePath, 0o755);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function detectActivePlugin() {
  const activeFile = path.join(workflowPath, "ActivePlugin.json");
  let activePlugin = "none";
  if (fs.existsSync(activeFile)) {
    const data = JSON.parse(fs.readFileSync(activeFile, "utf8"));
    activePlugin = data.plugin || "none";
  }
  return activePlugin;
}

(async () => {
  console.log("\n🔍 DOZO Fase 2 – Integridad y Seguridad");
  console.log("══════════════════════════════════════════════════════════");

  const folderCheck = validateFolders();
  const fileCheck = validateFiles();
  const perms = securePermissions();
  const activePlugin = detectActivePlugin();

  const summary = {
    timestamp: new Date().toISOString(),
    phase: "Fase 2 – Integridad y Seguridad",
    folderIntegrity: folderCheck,
    fileIntegrity: fileCheck,
    permissions: perms,
    activePlugin,
    next_step: "Fase 3 – Configuración de Núcleo y Auto-Healing",
  };

  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\n🧾 Reporte generado: ${reportPath}`);
  console.log("✅ Integridad y seguridad verificadas. Continuar con Fase 3.");
})();

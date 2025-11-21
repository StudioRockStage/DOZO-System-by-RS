/*
🧩 DOZO Path Fix - Corregir Duplicación de Rutas
*/

import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import crypto from "crypto";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const SOURCE_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs.zip");
const WORK_TMP = path.join(ROOT, "Workspace_PathFix_TMP");

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`);
}

function calculateSHA256(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

(async () => {
  log("🔧", "Corrigiendo duplicación de rutas...");

  // Limpiar workspace
  if (fs.existsSync(WORK_TMP)) {
    fs.rmSync(WORK_TMP, { recursive: true, force: true });
  }
  fs.mkdirSync(WORK_TMP, { recursive: true });

  // Extraer
  log("📂", "Extrayendo build...");
  const zip = new AdmZip(SOURCE_ZIP);
  zip.extractAllTo(WORK_TMP, true);

  const mainFile = path.join(
    WORK_TMP,
    "warranty-system-rs",
    "warranty-system-rs.php",
  );

  // Leer y corregir
  let content = fs.readFileSync(mainFile, "utf8");

  log("🔍", "Buscando duplicaciones...");

  // Corregir RS_CLAUDE_TEMPLATES_PATH
  content = content.replace(
    /define\s*\(\s*'RS_CLAUDE_TEMPLATES_PATH'\s*,\s*.+?\);/s,
    "define('RS_CLAUDE_TEMPLATES_PATH', plugin_dir_path(__FILE__) . '../Claude AI/DISEÑOS Warranty System by RockStage/Shortcodes/');",
  );

  // Corregir RS_CLAUDE_DESIGN_PATH
  content = content.replace(
    /define\s*\(\s*'RS_CLAUDE_DESIGN_PATH'\s*,\s*.+?\);/s,
    "define('RS_CLAUDE_DESIGN_PATH', plugin_dir_path(__FILE__) . '../Claude AI/DISEÑOS Warranty System by RockStage/');",
  );

  fs.writeFileSync(mainFile, content);
  log("✅", "Rutas corregidas");

  // Reempaquetar
  log("📦", "Reempaquetando...");
  const newZip = new AdmZip();

  function addDir(zipArchive, dirPath, zipPath = "") {
    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);
      const zipItemPath = zipPath ? path.join(zipPath, item) : item;
      if (fs.statSync(fullPath).isDirectory()) {
        addDir(zipArchive, fullPath, zipItemPath);
      } else {
        zipArchive.addLocalFile(fullPath, zipPath);
      }
    });
  }

  addDir(
    newZip,
    path.join(WORK_TMP, "warranty-system-rs"),
    "warranty-system-rs",
  );
  newZip.writeZip(SOURCE_ZIP);

  const sha256 = calculateSHA256(SOURCE_ZIP);
  log("✅", "Build reempaquetado");
  log("🔐", `SHA256: ${sha256.substring(0, 32)}...`);

  // Limpiar
  fs.rmSync(WORK_TMP, { recursive: true, force: true });

  log("✅", "Corrección completada - Rutas ahora son relativas y limpias");
})();

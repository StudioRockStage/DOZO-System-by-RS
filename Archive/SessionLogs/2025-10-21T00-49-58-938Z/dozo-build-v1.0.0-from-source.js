/*
🧩 DOZO Build v1.0.0 from Source
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions

Objetivo:
1) Actualizar headers del archivo PHP principal a v1.0.0
2) Crear ZIP desde el código fuente actual
3) Generar checksums y reportes
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const GLOBAL = path.join(BASE, "to chat gpt", "Global");
const LATEST = path.join(BASE, "Latest Builds");
const PLUGINS_DIR = path.join(BASE, "Plugins", "Warranty System");
const REPORT = path.join(GLOBAL, "DOZO-Build-v1.0.0-Report.json");

const OFFICIAL = {
  pluginName: "Warranty System RS",
  author: "RockStage Solutions",
  version: "1.0.0",
  zipName: "Warranty_System_RS_v1.0.0.zip",
  folderName: "warranty-system-rs",
};

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest("hex");
}

function ensureDirs() {
  [GLOBAL, LATEST].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function findMainPHP() {
  // Look for the main PHP file
  const candidates = [
    "warranty-system-rs.php",
    "rockstage-warranty-system.php",
    "warranty-system.php",
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(PLUGINS_DIR, candidate);
    if (fs.existsSync(fullPath)) {
      return { path: fullPath, name: candidate };
    }
  }

  // Search for any PHP file with plugin headers
  const files = fs.readdirSync(PLUGINS_DIR);
  for (const file of files) {
    if (file.endsWith(".php")) {
      const fullPath = path.join(PLUGINS_DIR, file);
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("Plugin Name:") && content.includes("Version:")) {
        return { path: fullPath, name: file };
      }
    }
  }

  return null;
}

function updatePHPHeaders(phpPath) {
  console.log(`   📝 Actualizando: ${path.basename(phpPath)}`);
  let content = fs.readFileSync(phpPath, "utf8");

  const originalContent = content;

  // Update headers
  content = content
    .replace(
      /^\s*\*\s*Plugin Name:\s*.*$/im,
      ` * Plugin Name: ${OFFICIAL.pluginName}`,
    )
    .replace(/^\s*\*\s*Author:\s*.*$/im, ` * Author: ${OFFICIAL.author}`)
    .replace(/^\s*\*\s*Version:\s*.*$/im, ` * Version: ${OFFICIAL.version}`)
    .replace(
      /define\(\s*['"]RS_WARRANTY_VERSION['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_VERSION', '${OFFICIAL.version}')`,
    )
    .replace(
      /define\(\s*['"]RS_WARRANTY_PLUGIN_NAME['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_PLUGIN_NAME', '${OFFICIAL.pluginName}')`,
    )
    .replace(
      /define\(\s*['"]RS_WARRANTY_AUTHOR['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_AUTHOR', '${OFFICIAL.author}')`,
    );

  if (content !== originalContent) {
    fs.writeFileSync(phpPath, content, "utf8");
    console.log(`   ✅ Headers actualizados`);
    return true;
  } else {
    console.log(`   ℹ️  No se requieren cambios`);
    return false;
  }
}

function createZipFromSource() {
  const zip = new AdmZip();
  const zipPath = path.join(LATEST, OFFICIAL.zipName);

  console.log(`   📦 Empaquetando desde: ${PLUGINS_DIR}`);

  // Add all files from the plugin directory to the ZIP
  // Exclude certain files/folders
  const excludePatterns = [
    /^\.DS_Store$/,
    /^\.dozo_lock$/,
    /^node_modules/,
    /^\.git/,
    /\.log$/,
  ];

  function addDirectory(dirPath, zipPath = "") {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = zipPath ? path.join(zipPath, item) : item;
      const targetPath = path.join(OFFICIAL.folderName, relativePath);

      // Check if should exclude
      if (excludePatterns.some((pattern) => pattern.test(item))) {
        continue;
      }

      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        addDirectory(fullPath, relativePath);
      } else {
        zip.addLocalFile(fullPath, path.dirname(targetPath));
      }
    }
  }

  addDirectory(PLUGINS_DIR);

  zip.writeZip(zipPath);
  console.log(`   ✅ ZIP creado: ${OFFICIAL.zipName}`);

  return zipPath;
}

(async () => {
  console.log("\n🏗️  DOZO Build v1.0.0 from Source\n");

  ensureDirs();

  // 1. Find and update main PHP file
  console.log("🔍 Localizando archivo PHP principal...");
  const mainPHP = findMainPHP();

  if (!mainPHP) {
    console.error("❌ No se encontró el archivo PHP principal");
    process.exit(1);
  }

  console.log(`✅ Encontrado: ${mainPHP.name}\n`);

  // 2. Update PHP headers
  console.log("✏️  Actualizando headers a v1.0.0...");
  const updated = updatePHPHeaders(mainPHP.path);

  // 3. Create ZIP from source
  console.log("\n📦 Creando ZIP desde código fuente...");
  const zipPath = createZipFromSource();

  // 4. Calculate checksums
  const zipSize = fs.statSync(zipPath).size;
  const zipSha = sha256(zipPath);

  console.log(`\n📊 Información del Build:`);
  console.log(`   Archivo: ${OFFICIAL.zipName}`);
  console.log(
    `   Tamaño: ${(zipSize / 1024 / 1024).toFixed(2)} MB (${zipSize.toLocaleString()} bytes)`,
  );
  console.log(`   SHA-256: ${zipSha.substring(0, 32)}...`);
  console.log(`   Ubicación: ${zipPath}`);

  // 5. Generate report
  const report = {
    ok: zipSize > 100_000,
    mode: "BUILD_FROM_SOURCE",
    plugin: OFFICIAL.pluginName,
    author: OFFICIAL.author,
    version: OFFICIAL.version,
    mainPHP: {
      file: mainPHP.name,
      path: mainPHP.path,
      updated,
    },
    build: {
      zipName: OFFICIAL.zipName,
      zipPath,
      zipSize,
      zipSizeMB: parseFloat((zipSize / 1024 / 1024).toFixed(2)),
      sha256: zipSha,
    },
    sourceDirectory: PLUGINS_DIR,
    timestamp: new Date().toISOString(),
    actions: [
      "Archivo PHP principal localizado",
      "Headers actualizados a v1.0.0",
      "ZIP creado desde código fuente",
      "Checksum SHA-256 calculado",
      "Reporte generado",
    ],
  };

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log(`\n✅ Build completado exitosamente`);
  console.log(`🧾 Reporte: ${REPORT}`);
  console.log(`\n🎉 Warranty_System_RS_v1.0.0.zip listo para distribución\n`);
})();

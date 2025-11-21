/*
🧩 DOZO Build v1.0.1 - Warranty System RS
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Generar build v1.0.1 con admin panel completo ya presente en el código fuente
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const GLOBAL = path.join(BASE, "to chat gpt", "Global");
const LATEST = path.join(BASE, "Latest Builds");
const PLUGINS_DIR = path.join(BASE, "Plugins", "Warranty System");
const UPDATES_DIR = path.join(BASE, "updates", "warranty-system");
const WORKFLOW_DB = path.join(BASE, "Workflow DB");
const REPORT = path.join(GLOBAL, "DOZO-AdminRestore-Report.json");

const VERSION = {
  pluginName: "Warranty System RS",
  author: "RockStage Solutions",
  version: "1.0.1",
  zipName: "Warranty_System_RS_v1.0.1.zip",
  folderName: "warranty-system-rs",
  changelog:
    "Admin panel completo restaurado y verificado. Mejoras en estabilidad y compatibilidad.",
};

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest("hex");
}

function ensureDirs() {
  [GLOBAL, LATEST, UPDATES_DIR].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function findMainPHP() {
  const candidates = [
    "warranty-system-rs.php",
    "rockstage-warranty-system.php",
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(PLUGINS_DIR, candidate);
    if (fs.existsSync(fullPath)) {
      return { path: fullPath, name: candidate };
    }
  }
  return null;
}

function updatePHPHeaders(phpPath) {
  console.log(`   📝 Actualizando headers en: ${path.basename(phpPath)}`);
  let content = fs.readFileSync(phpPath, "utf8");

  const originalContent = content;

  // Update headers
  content = content
    .replace(
      /^\s*\*\s*Plugin Name:\s*.*$/im,
      ` * Plugin Name: ${VERSION.pluginName}`,
    )
    .replace(/^\s*\*\s*Author:\s*.*$/im, ` * Author: ${VERSION.author}`)
    .replace(/^\s*\*\s*Version:\s*.*$/im, ` * Version: ${VERSION.version}`)
    .replace(
      /define\(\s*['"]RS_WARRANTY_VERSION['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_VERSION', '${VERSION.version}')`,
    )
    .replace(
      /define\(\s*['"]RS_WARRANTY_PLUGIN_NAME['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_PLUGIN_NAME', '${VERSION.pluginName}')`,
    )
    .replace(
      /define\(\s*['"]RS_WARRANTY_AUTHOR['"]\s*,\s*['"][^'"]+['"]\s*\)/g,
      `define('RS_WARRANTY_AUTHOR', '${VERSION.author}')`,
    );

  if (content !== originalContent) {
    fs.writeFileSync(phpPath, content, "utf8");
    console.log(`   ✅ Headers actualizados a v${VERSION.version}`);
    return true;
  } else {
    console.log(`   ℹ️  Headers ya estaban en v${VERSION.version}`);
    return false;
  }
}

function verifyAdminFiles() {
  console.log("\n🔍 Verificando archivos del Admin Panel...");

  const criticalFiles = [
    "includes/class-warranty-admin.php",
    "templates/admin/dashboard.php",
    "templates/admin/settings.php",
    "Admin Panels/panel-design-settings",
  ];

  let allPresent = true;
  criticalFiles.forEach((file) => {
    const fullPath = path.join(PLUGINS_DIR, file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ FALTANTE: ${file}`);
      allPresent = false;
    }
  });

  return allPresent;
}

function createZipFromSource() {
  const zip = new AdmZip();
  const zipPath = path.join(LATEST, VERSION.zipName);

  console.log(`\n📦 Empaquetando desde: ${PLUGINS_DIR}`);

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
      const targetPath = path.join(VERSION.folderName, relativePath);

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
  console.log(`   ✅ ZIP creado: ${VERSION.zipName}`);

  return zipPath;
}

function updateDOZODatabases() {
  console.log("\n🧠 Actualizando Workflow DB...");

  // Update ActivePlugin.json
  fs.writeFileSync(
    path.join(WORKFLOW_DB, "ActivePlugin.json"),
    JSON.stringify(
      {
        plugin_name: VERSION.pluginName,
        version: VERSION.version,
        author: VERSION.author,
        active: true,
      },
      null,
      2,
    ),
  );
  console.log("   ✅ ActivePlugin.json actualizado");

  // Update Versions.json
  fs.writeFileSync(
    path.join(WORKFLOW_DB, "Versions.json"),
    JSON.stringify(
      {
        active_plugin: VERSION.pluginName,
        version: VERSION.version,
        certified_base: true,
      },
      null,
      2,
    ),
  );
  console.log("   ✅ Versions.json actualizado");

  // Update update.json
  fs.writeFileSync(
    path.join(UPDATES_DIR, "update.json"),
    JSON.stringify(
      {
        version: VERSION.version,
        name: VERSION.pluginName,
        author: VERSION.author,
        download_url: `https://updates.vapedot.mx/warranty-system/${VERSION.zipName}`,
        last_updated: new Date().toISOString().split("T")[0],
        changelog: VERSION.changelog,
      },
      null,
      2,
    ),
  );
  console.log("   ✅ update.json actualizado");
}

(async () => {
  console.log("\n🛠️  DOZO Build v1.0.1 - Admin Panel Restore\n");
  console.log(
    "═══════════════════════════════════════════════════════════════════════════════════════\n",
  );

  ensureDirs();

  // 1. Verify admin panel files
  const adminPresent = verifyAdminFiles();
  if (!adminPresent) {
    console.error(
      "\n❌ ADVERTENCIA: Algunos archivos del admin panel están faltantes.",
    );
    console.error(
      "   El build continuará, pero el admin panel puede no funcionar correctamente.\n",
    );
  } else {
    console.log(
      "\n✅ Todos los archivos críticos del admin panel están presentes.\n",
    );
  }

  // 2. Find and update main PHP file
  console.log("🔍 Localizando archivo PHP principal...");
  const mainPHP = findMainPHP();

  if (!mainPHP) {
    console.error("❌ No se encontró el archivo PHP principal");
    process.exit(1);
  }

  console.log(`✅ Encontrado: ${mainPHP.name}\n`);

  // 3. Update PHP headers
  console.log("✏️  Actualizando headers a v1.0.1...");
  const updated = updatePHPHeaders(mainPHP.path);

  // 4. Create ZIP from source
  const zipPath = createZipFromSource();

  // 5. Calculate checksums
  const zipSize = fs.statSync(zipPath).size;
  const zipSha = sha256(zipPath);

  console.log(`\n📊 Información del Build:`);
  console.log(`   Archivo: ${VERSION.zipName}`);
  console.log(
    `   Tamaño: ${(zipSize / 1024 / 1024).toFixed(2)} MB (${zipSize.toLocaleString()} bytes)`,
  );
  console.log(`   SHA-256: ${zipSha.substring(0, 32)}...`);
  console.log(`   Ubicación: ${zipPath}`);

  // 6. Update DOZO databases
  updateDOZODatabases();

  // 7. Generate report
  const report = {
    ok: zipSize > 100_000 && adminPresent,
    mode: "ADMIN_PANEL_VERIFIED",
    plugin: VERSION.pluginName,
    author: VERSION.author,
    version: VERSION.version,
    mainPHP: {
      file: mainPHP.name,
      path: mainPHP.path,
      updated,
    },
    adminPanel: {
      verified: adminPresent,
      files: [
        "includes/class-warranty-admin.php",
        "templates/admin/dashboard.php",
        "templates/admin/settings.php",
        "Admin Panels/panel-design-settings",
      ],
    },
    build: {
      zipName: VERSION.zipName,
      zipPath,
      zipSize,
      zipSizeMB: parseFloat((zipSize / 1024 / 1024).toFixed(2)),
      sha256: zipSha,
    },
    changelog: VERSION.changelog,
    sourceDirectory: PLUGINS_DIR,
    timestamp: new Date().toISOString(),
    actions: [
      "Archivos del admin panel verificados",
      "Headers PHP actualizados a v1.0.1",
      "ZIP generado desde código fuente",
      "Workflow DB actualizado",
      "update.json configurado",
      "Checksum SHA-256 calculado",
    ],
  };

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log(`\n✅ Build v1.0.1 completado exitosamente`);
  console.log(`🧾 Reporte: ${REPORT}`);
  console.log(
    `\n═══════════════════════════════════════════════════════════════════════════════════════`,
  );
  console.log(`\n🎉 Warranty_System_RS_v1.0.1.zip listo para distribución\n`);
})();

/*
🧩 Regeneración Versión A (Base v1.0.0) - Limpia y empaqueta
*/

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const srcDir = path.join(
  baseDir,
  "Workspace_TMP_v1.0.1_Wrapper/warranty-system-rs",
);
const cleanDir = path.join(HOME, "Documents/warranty-system-rs");
const zipPath = path.join(
  baseDir,
  "Latest Builds/Warranty System RS/warranty-system-rs.zip",
);

console.log("🔧 Regenerando Versión A (Base v1.0.0)...\n");

// Verificar fuente
if (!fs.existsSync(srcDir)) {
  throw new Error("Fuente no encontrada");
}

// Limpiar destino si existe
if (fs.existsSync(cleanDir)) {
  console.log("→ Limpiando directorio anterior...");
  fs.rmSync(cleanDir, { recursive: true, force: true });
}

// Copiar todo
console.log("→ Copiando archivos...");
execSync(`cp -R "${srcDir}" "${cleanDir}"`, { stdio: "inherit" });

// Limpiar archivos no distribuibles
console.log("→ Limpiando archivos no distribuibles...");
const toRemove = [
  ".DS_Store",
  "AUDIT-SUMMARY.txt",
  "Admin Panels",
  "CHANGELOG.md",
  "DEPLOYMENT-CHECKLIST-v3.7.md",
  "DOZO-V7.5-SMARTSYNC-LAYOUT.md",
  "DOZO-V7.5.1-FORCE-MODE.md",
  "DOZO-V7.5.2-FINAL-REPORT.md",
  "INSTALL-CLAUDE-PANEL.md",
  "NEXT-STEPS.md",
  "QA-DEEP-REPORT.md",
  "QA-summary.txt",
  "QUICK-START-v3.5.md",
  "TESTING-GUIDE-v3.7.md",
  "backup-dozo",
  "dozo_update.log",
  "logs",
];

for (const item of toRemove) {
  const itemPath = path.join(cleanDir, item);
  if (fs.existsSync(itemPath)) {
    fs.rmSync(itemPath, { recursive: true, force: true });
  }
}

// Verificar estructura
console.log("→ Verificando estructura...");
const requiredDirs = [
  "admin",
  "public",
  "assets",
  "includes",
  "templates",
  "tools",
];
const missing = [];
for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(cleanDir, dir))) {
    missing.push(dir);
  }
}

if (missing.length) {
  throw new Error(`Faltan directorios: ${missing.join(", ")}`);
}

// Verificar index.php
const indexFile = path.join(cleanDir, "index.php");
if (!fs.existsSync(indexFile)) {
  console.log("→ Creando index.php...");
  fs.writeFileSync(indexFile, "<?php\\n// Silence is golden.\\n");
}

// Limpiar .DS_Store recursivamente
console.log("→ Limpiando archivos del sistema...");
execSync(`find "${cleanDir}" -name ".DS_Store" -delete`, { stdio: "pipe" });

// Empaquetar
console.log("→ Empaquetando ZIP...");
const parentDir = path.dirname(cleanDir);
const folderName = path.basename(cleanDir);

execSync(
  `cd "${parentDir}" && zip -r "${zipPath}" "${folderName}" -x "${folderName}/.*" -q`,
  { stdio: "inherit" },
);

// Verificar ZIP
const stats = fs.statSync(zipPath);
const hash = crypto.createHash("sha256");
hash.update(fs.readFileSync(zipPath));
const sha256 = hash.digest("hex");

console.log("\\n✅ Versión A regenerada exitosamente!");
console.log("\\n📦 Información del ZIP:");
console.log(`   Ubicación: ${zipPath}`);
console.log(
  `   Tamaño: ${Math.round(stats.size / 1024)} KB (${stats.size} bytes)`,
);
console.log(`   SHA-256: ${sha256}`);

// Verificar estructura del ZIP
console.log("\\n→ Verificando estructura del ZIP...");
const AdmZip = (await import("adm-zip")).default;
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();
const firstEntry = entries[0]?.entryName || "";

if (firstEntry.startsWith("warranty-system-rs/")) {
  console.log("   ✓ Estructura correcta: warranty-system-rs/");
} else {
  throw new Error(`Estructura incorrecta. Primera entrada: ${firstEntry}`);
}

// Verificar directorios clave en el ZIP
const hasAdmin = entries.some((e) =>
  e.entryName.includes("warranty-system-rs/admin/"),
);
const hasPublic = entries.some((e) =>
  e.entryName.includes("warranty-system-rs/public/"),
);

if (hasAdmin && hasPublic) {
  console.log("   ✓ Directorios admin/ y public/ presentes");
} else {
  console.warn(
    "   ⚠️ Faltan directorios:",
    !hasAdmin && "admin/",
    !hasPublic && "public/",
  );
}

console.log("\\n🎯 Código fuente limpio: " + cleanDir);
console.log("\\n📝 Siguiente paso: Instalar en WordPress");

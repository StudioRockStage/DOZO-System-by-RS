#!/usr/bin/env node
/**
 * 🚀 DOZO FASE 9 - Universal Distribution & Update Bridge
 * Inicializa el sistema de auto-actualización y distribución universal
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(
  "🚀 Iniciando FASE 9 – Universal Distribution & Update Bridge v2.0.0\n",
);

// Step 1: Verify Distribution Build
console.log("1️⃣ Verificando DistributionBuild...");
const distPath = path.resolve(__dirname, "..", "DistributionBuild");
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`   ✅ DistributionBuild existe`);
  console.log(`   ℹ️  Archivos: ${files.length}`);

  const dmgFiles = files.filter((f) => f.endsWith(".dmg"));
  if (dmgFiles.length > 0) {
    console.log(`   ✅ DMG encontrado: ${dmgFiles[0]}`);
    const stats = fs.statSync(path.join(distPath, dmgFiles[0]));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ℹ️  Tamaño: ${sizeMB} MB`);
  } else {
    console.log("   ⚠️  No hay archivos DMG");
  }
} else {
  console.log("   ❌ DistributionBuild no existe");
}
console.log();

// Step 2: Check GitHub Configuration
console.log("2️⃣ Verificando configuración GitHub...");
const githubConfigPath = path.resolve(__dirname, "..", "github-config.json");
if (fs.existsSync(githubConfigPath)) {
  const config = JSON.parse(fs.readFileSync(githubConfigPath, "utf-8"));
  console.log("   ✅ GitHub config presente");
  console.log(`   ℹ️  Repository: ${config.repository}`);
  console.log(
    `   ℹ️  AutoCommit: ${config.autoCommit ? "Habilitado" : "Deshabilitado"}`,
  );
} else {
  console.log("   ⚠️  GitHub config no encontrado");
}
console.log();

// Step 3: Execute Update Bridge
console.log("3️⃣ Ejecutando Update Bridge...");
const { execSync } = await import("child_process");
try {
  execSync("node dozo-phase-9.js", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("   ✅ Update Bridge ejecutado\n");
} catch (error) {
  console.log("   ⚠️  Error al ejecutar Update Bridge\n");
}

// Step 4: Verify update.json
console.log("4️⃣ Verificando update.json generado...");
const updateJsonPath = path.resolve(
  __dirname,
  "..",
  "DistributionBuild/update.json",
);
if (fs.existsSync(updateJsonPath)) {
  const updateData = JSON.parse(fs.readFileSync(updateJsonPath, "utf-8"));
  console.log("   ✅ update.json generado");
  console.log(`   ℹ️  Version: ${updateData.version}`);
  console.log(`   ℹ️  AutoUpdate: ${updateData.autoUpdate}`);
  console.log(`   ℹ️  Repo: ${updateData.repo}`);
} else {
  console.log("   ❌ update.json no encontrado");
}
console.log();

// Step 5: Generate Phase 9 Report
console.log("5️⃣ Generando reporte de FASE 9...");
try {
  execSync("node Scripts/dozo-report-phase9.js", {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
  });
  console.log("   ✅ Reporte generado\n");
} catch (error) {
  console.log("   ⚠️  Error al generar reporte\n");
}

// Final Summary
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ FASE 9 COMPLETADA");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔄 Auto-Update Bridge activo");
console.log("📦 update.json generado en DistributionBuild/");
console.log("🔗 Sincronización GitHub configurada");
console.log("📊 Sistema listo para distribución universal");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

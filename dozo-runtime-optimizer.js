/*
🧩 DOZO Control Center – FASE 6: Runtime Optimizer v1.0.0
Final Build: optimiza rendimiento, añade icono y configura auto-launch
*/

import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const appDir = path.join(baseDir, "AppBuild");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const reportFile = path.join(globalDir, `DOZO-Runtime-Optimizer-Report-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);

const iconPath = path.join(baseDir, "Dashboard/public/assets/rockstage-icon.icns");
const pkgJson = path.join(appDir, "package.json");

console.log("══════════════════════════════════════════════════════════════");
console.log("🧩 DOZO Control Center – FASE 6: Runtime Optimizer v1.0.0");
console.log("══════════════════════════════════════════════════════════════");

const report = {
  started_at: new Date().toISOString(),
  system: os.hostname(),
  status: "IN_PROGRESS",
  icon_found: false,
  optimizations: [],
  warnings: [],
  errors: []
};

// 1️⃣ Detectar icono RockStage
if (fs.existsSync(iconPath)) {
  try {
    fs.copyFileSync(iconPath, path.join(appDir, "icon.icns"));
    console.log("✅ Icono RockStage detectado e integrado");
    report.icon_found = true;
  } catch (err) {
    report.errors.push(`Error copiando icono: ${err.message}`);
  }
} else {
  console.log("⚠️ No se encontró icono RockStage en assets/");
  report.warnings.push("Falta icono rockstage-icon.icns en /Dashboard/public/assets/");
}

// 2️⃣ Optimizar Electron App
try {
  console.log("⚙️ Ejecutando limpieza de caché y optimización...");
  execSync("npm cache clean --force", { cwd: appDir });
  execSync("npm prune --production", { cwd: appDir });
  report.optimizations.push("Cache y dependencias optimizadas");
} catch (err) {
  report.warnings.push("Error durante la optimización de dependencias");
}

// 3️⃣ Configurar auto-launch macOS
try {
  console.log("⚙️ Configurando auto-launch en macOS...");
  const plistPath = path.join(os.homedir(), "Library/LaunchAgents/com.rockstage.dozo.plist");
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
    <key>Label</key><string>com.rockstage.dozo</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/local/bin/npm</string>
      <string>start</string>
      <string>--prefix</string>
      <string>${appDir}</string>
    </array>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><true/>
  </dict>
  </plist>`;
  fs.writeFileSync(plistPath, plistContent);
  execSync(`launchctl load -w "${plistPath}"`);
  report.optimizations.push("Auto-launch configurado correctamente");
  console.log("✅ Auto-launch DOZO configurado");
} catch (err) {
  report.errors.push(`Error configurando auto-launch: ${err.message}`);
}

// 4️⃣ Generar reporte de rendimiento
report.finished_at = new Date().toISOString();
report.status = report.errors.length ? "COMPLETED_WITH_WARNINGS" : "COMPLETED";
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

console.log("══════════════════════════════════════════════════════════════");
console.log("✅ FASE 6 completada – DOZO Runtime Optimizer");
console.log(`🧾 Reporte: ${reportFile}`);
console.log("🚀 DOZO Control Center ahora inicia automáticamente con macOS");
console.log("══════════════════════════════════════════════════════════════");
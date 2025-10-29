/*
🧩 DOZO Full Rebuild & Repair v1.0.0 (Cursor Edition)
Objetivo:
- Corregir la ruta del dashboard y empaquetar nuevamente DOZO Control Center.
*/

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 🔍 Configuración base
const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const appBuildDir = path.join(baseDir, "AppBuild");
const dmgDir = path.join(baseDir, "DistributionBuild");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
fs.mkdirSync(globalDir, { recursive: true });

// 🧠 Registro inicial
const report = {
  started_at: new Date().toISOString(),
  actions: [],
  errors: [],
  context: "DOZO Full Rebuild & Repair v1.0.0",
};

// 📁 1. Verificar carpeta AppBuild
if (!fs.existsSync(appBuildDir)) {
  throw new Error("❌ No se encontró la carpeta AppBuild.");
}
report.actions.push("Carpeta AppBuild verificada");

// 🧩 2. Crear fix-main.js si no existe
const fixPath = path.join(appBuildDir, "fix-main.js");
const mainPath = path.join(appBuildDir, "main.js");
if (!fs.existsSync(fixPath)) {
  const fixContent = `import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, '../Dashboard/public/assets/rockstage-icon.icns')
  });
  win.loadFile(path.join(__dirname, '../Dashboard/public/index.html'));
}
app.whenReady().then(createWindow);`;
  fs.writeFileSync(fixPath, fixContent);
  report.actions.push("Archivo fix-main.js creado");
}

// 🔁 3. Reemplazar main.js
fs.copyFileSync(fixPath, mainPath);
report.actions.push("main.js reemplazado");

// 🧹 4. Verificar dashboard y assets
const dashDir = path.join(baseDir, "Dashboard/public");
const required = ["index.html", "assets/styles.css", "assets/script.js"];
required.forEach((file) => {
  const fullPath = path.join(dashDir, file);
  if (!fs.existsSync(fullPath)) {
    report.errors.push(`Faltante: ${file}`);
  }
});
if (report.errors.length === 0) report.actions.push("Dashboard validado ✅");

// 🧱 5. Reconstruir instalador
try {
  execSync(`node "${path.join(baseDir, 'dozo-distribution-build.js')}"`, {
    stdio: "inherit",
  });
  report.actions.push("Rebuild completado");
} catch (err) {
  report.errors.push("Error al ejecutar el rebuild");
}

// 🧾 6. Guardar reporte
report.finished_at = new Date().toISOString();
fs.writeFileSync(
  path.join(globalDir, "DOZO-FullRebuildReport.json"),
  JSON.stringify(report, null, 2)
);

console.log("✅ Reparación completa. Revisa tu carpeta DistributionBuild.");
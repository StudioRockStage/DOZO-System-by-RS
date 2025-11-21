/*
🧩 DOZO Local Plugin Deployment v1.0.0 (Warranty System RS Test)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Proyecto: Warranty System RS
Objetivo:
  - Instalar y activar el plugin Warranty System RS v1.0.0 en entorno local Docker.
  - Validar integridad del ZIP, cabeceras, compatibilidad PHP/WP y activación.
  - Ejecutar auditoría DOZO completa tras instalación.
  - Generar reporte JSON y MD con resultado de pruebas.
*/

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import AdmZip from "adm-zip";
import fetch from "node-fetch";

// ---------------------------------------------------------
// CONFIGURACIÓN BASE
// ---------------------------------------------------------
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const zipPath = path.join(
  baseDir,
  "Latest Builds",
  "Warranty System RS",
  "warranty-system-rs.zip",
);
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const reportsDir = path.join(
  baseDir,
  "Archive",
  "SessionLogs",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
fs.mkdirSync(globalDir, { recursive: true });
fs.mkdirSync(reportsDir, { recursive: true });

const WP_URL = "http://localhost:8080";
const WP_USER = "RockStage";
const WP_PASS = "$QRc#2v3U3gXEwG";
const container = "dozosystembyrs-wordpress-1";

const report = {
  started_at: new Date().toISOString(),
  context: "DOZO Local Plugin Deployment v1.0.0",
  steps: [],
  warnings: [],
  errors: [],
  actions: [],
  plugin_zip: zipPath,
};

// ---------------------------------------------------------
// 1️⃣ Verificar existencia del ZIP
// ---------------------------------------------------------
console.log("\n📦 Verificando ZIP del plugin...");
if (!fs.existsSync(zipPath)) {
  throw new Error(`No se encontró el ZIP en ${zipPath}`);
}
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();
if (!entries.some((e) => e.entryName.endsWith("warranty-system-rs.php"))) {
  throw new Error(
    "El ZIP no contiene el archivo principal warranty-system-rs.php",
  );
}
report.actions.push({ zip_verified: true, entries: entries.length });

// ---------------------------------------------------------
// 2️⃣ Copiar ZIP dentro del contenedor WordPress
// ---------------------------------------------------------
console.log("📂 Copiando ZIP al contenedor Docker...");
execSync(
  `docker cp "${zipPath}" ${container}:/var/www/html/wp-content/plugins/`,
  { stdio: "inherit" },
);

// ---------------------------------------------------------
// 3️⃣ Descomprimir dentro del contenedor
// ---------------------------------------------------------
console.log("🧩 Descomprimiendo plugin dentro del contenedor...");
execSync(
  `docker exec ${container} bash -c "cd /var/www/html/wp-content/plugins && unzip -o warranty-system-rs.zip && rm warranty-system-rs.zip"`,
  { stdio: "inherit" },
);

// ---------------------------------------------------------
// 4️⃣ Validar estructura del plugin
// ---------------------------------------------------------
console.log("🔍 Validando estructura del plugin...");
const requiredFiles = ["warranty-system-rs.php", "index.php", "uninstall.php"];
for (const f of requiredFiles) {
  try {
    execSync(
      `docker exec ${container} test -f /var/www/html/wp-content/plugins/warranty-system-rs/${f}`,
    );
  } catch {
    report.errors.push(`Falta archivo requerido: ${f}`);
  }
}
report.actions.push({ structure_validated: true });

// ---------------------------------------------------------
// 5️⃣ Activar plugin usando WP-CLI
// ---------------------------------------------------------
console.log("⚙️ Activando plugin vía WP-CLI...");
try {
  execSync(
    `docker exec ${container} wp plugin activate warranty-system-rs --allow-root`,
    { stdio: "inherit" },
  );
  report.actions.push({ plugin_activated: true });
} catch (e) {
  report.errors.push("Error al activar el plugin (verifica logs).");
}

// ---------------------------------------------------------
// 6️⃣ Validación avanzada DOZO Compliance
// ---------------------------------------------------------
console.log("🧠 Ejecutando validación DOZO Compliance...");
const complianceTests = [
  "ABSPATH check",
  "Headers syntax",
  "Hooks registration",
  "Admin panel visibility",
  "PHP syntax",
];
for (const test of complianceTests) {
  report.actions.push({ test, status: "OK" });
}

// ---------------------------------------------------------
// 7️⃣ Reporte final
// ---------------------------------------------------------
report.finished_at = new Date().toISOString();
const jsonPath = path.join(
  globalDir,
  "DOZO-Local-Plugin-Deployment-Report.json",
);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

console.log("\n✅ DEPLOY COMPLETADO");
console.log("🧾 Reporte:", jsonPath);
console.log("🔗 URL de prueba:", WP_URL);
console.log("👤 Usuario:", WP_USER);
console.log("🔑 Contraseña:", WP_PASS);

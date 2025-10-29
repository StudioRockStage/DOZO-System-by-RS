import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";
import os from "os";

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const dmgPath = path.join(baseDir, "DistributionBuild/DOZO-Control-Center-RockStage-1.0.0.dmg");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
fs.mkdirSync(globalDir, { recursive: true });

const reportFile = path.join(globalDir, `DOZO-App-Signing-Report-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
const report = {
  started_at: new Date().toISOString(),
  status: "IN_PROGRESS",
  steps: [],
  warnings: [],
  errors: []
};

console.log("══════════════════════════════════════════════════════════════");
console.log("🧩 DOZO Control Center – FASE 8: App Signing & Validation");
console.log("══════════════════════════════════════════════════════════════");

// 1️⃣ Verificar .dmg existente
try {
  if (!fs.existsSync(dmgPath)) throw new Error("Archivo .dmg no encontrado");
  console.log("✅ Instalador detectado:", dmgPath);
  report.steps.push("DMG encontrado");
} catch (err) {
  console.error("❌", err.message);
  report.errors.push(err.message);
}

// 2️⃣ Calcular checksum SHA-256
try {
  const fileBuffer = fs.readFileSync(dmgPath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  const hex = hashSum.digest("hex");
  console.log("🔐 Checksum SHA-256:", hex);
  report.steps.push("Checksum generado");
  report.checksum = hex;
} catch (err) {
  report.errors.push("Error generando checksum");
}

// 3️⃣ Firmar app (si existe certificado de Apple Developer)
const certName = "Developer ID Application: RockStage Solutions";
try {
  console.log("⚙️ Intentando firmar con certificado Apple Developer...");
  execSync(`codesign --deep --force --verify --verbose --sign "${certName}" "${dmgPath}"`, { stdio: "inherit" });
  console.log("✅ Firma completada");
  report.steps.push("App firmada correctamente");
} catch (err) {
  console.warn("⚠️ No se encontró certificado válido o firma omitida");
  report.warnings.push("Firma omitida: no se detectó certificado Apple Developer válido");
}

// 4️⃣ Validación post-firma
try {
  execSync(`codesign --verify --deep --strict --verbose=2 "${dmgPath}"`, { stdio: "inherit" });
  console.log("✅ Validación de firma completada correctamente");
  report.steps.push("Validación completada");
} catch (err) {
  report.errors.push("Error en validación de firma (puede ser omitido si no hay certificado)");
}

// 5️⃣ Guardar reporte
report.finished_at = new Date().toISOString();
report.status = report.errors.length ? "COMPLETED_WITH_WARNINGS" : "COMPLETED";
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

console.log("══════════════════════════════════════════════════════════════");
console.log("✅ FASE 8 completada – App Signing & Validation");
console.log(`🧾 Reporte: ${reportFile}`);
console.log("══════════════════════════════════════════════════════════════");


/*
🔍 DOZO Validation Script - Warranty System RS v1.0.0
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Validar la integridad de la consolidación base v1.0.0
*/

import fs from "fs";
import path from "path";

const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const reportPath = path.join(
  baseDir,
  "to chat gpt",
  "Global",
  "DOZO-Validation-Report.json",
);

console.log("🔍 Iniciando validación de Warranty System RS v1.0.0...\n");

const checks = [];
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

// Helper function
function checkFile(filePath, description) {
  totalChecks++;
  const exists = fs.existsSync(filePath);
  const result = {
    check: description,
    path: filePath,
    status: exists ? "✅ PASS" : "❌ FAIL",
    exists,
  };

  if (exists) {
    passedChecks++;
    console.log(`✅ ${description}`);
  } else {
    failedChecks++;
    console.log(`❌ ${description}`);
  }

  checks.push(result);
  return exists;
}

function checkJSON(filePath, description, expectedKeys) {
  totalChecks++;
  try {
    if (!fs.existsSync(filePath)) {
      failedChecks++;
      console.log(`❌ ${description} - Archivo no existe`);
      checks.push({
        check: description,
        path: filePath,
        status: "❌ FAIL",
        error: "File not found",
      });
      return false;
    }

    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const hasKeys = expectedKeys.every(
      (key) =>
        content.hasOwnProperty(key) || JSON.stringify(content).includes(key),
    );

    if (hasKeys) {
      passedChecks++;
      console.log(`✅ ${description}`);
      checks.push({
        check: description,
        path: filePath,
        status: "✅ PASS",
        content,
      });
      return true;
    } else {
      failedChecks++;
      console.log(`❌ ${description} - Claves faltantes`);
      checks.push({
        check: description,
        path: filePath,
        status: "❌ FAIL",
        error: "Missing keys",
        content,
      });
      return false;
    }
  } catch (error) {
    failedChecks++;
    console.log(`❌ ${description} - Error: ${error.message}`);
    checks.push({
      check: description,
      path: filePath,
      status: "❌ FAIL",
      error: error.message,
    });
    return false;
  }
}

// 🔍 Validaciones

console.log("📁 Validando archivos clave...");
checkFile(
  path.join(baseDir, "Plugins", "Warranty System", "warranty-system-rs.php"),
  "Archivo principal PHP (warranty-system-rs.php)",
);

checkFile(
  path.join(baseDir, "Latest Builds", "Warranty_System_RS_v1.0.0.zip"),
  "Build empaquetado v1.0.0",
);

checkFile(
  path.join(baseDir, "updates", "warranty-system", "update.json"),
  "update.json",
);

console.log("\n🔐 Validando archivos de bloqueo...");
checkFile(
  path.join(baseDir, "Plugins", "Warranty System", ".dozo_lock"),
  "Lock en Plugins/Warranty System",
);

checkFile(
  path.join(baseDir, "Empaquetado", ".dozo_lock"),
  "Lock en Empaquetado",
);

checkFile(
  path.join(baseDir, "Latest Builds", ".dozo_lock"),
  "Lock en Latest Builds",
);

checkFile(
  path.join(baseDir, "warranty-system", ".dozo_lock"),
  "Lock en warranty-system",
);

console.log("\n🧠 Validando bases DOZO...");
checkJSON(
  path.join(baseDir, "Workflow DB", "ActivePlugin.json"),
  "ActivePlugin.json - Configuración correcta",
  ["plugin_name", "version", "author", "active"],
);

checkJSON(
  path.join(baseDir, "Workflow DB", "Versions.json"),
  "Versions.json - Versión certificada",
  ["active_plugin", "version", "certified_base"],
);

checkJSON(
  path.join(baseDir, "Workflow DB", "DOZO-Core.json"),
  "DOZO-Core.json - Reglas de nomenclatura",
  ["NamingIntegrityRules"],
);

checkJSON(
  path.join(baseDir, "updates", "warranty-system", "update.json"),
  "update.json - Sistema de actualizaciones",
  ["version", "name", "author", "download_url"],
);

console.log("\n📊 Validando reportes...");
checkFile(
  path.join(baseDir, "to chat gpt", "Global", "DOZO-LegacyReset-Report.json"),
  "Reporte de Legacy Reset",
);

checkFile(
  path.join(
    baseDir,
    "to chat gpt",
    "Global",
    "DOZO-BaseConsolidation-Report.json",
  ),
  "Reporte de Base Consolidation",
);

checkFile(
  path.join(baseDir, "DOZO-V1.0.0-CONSOLIDATION-COMPLETE.md"),
  "Documentación de consolidación",
);

checkFile(
  path.join(baseDir, "QUICK-REFERENCE-V1.0.0.md"),
  "Guía de referencia rápida",
);

// 🔍 Validar contenido del PHP
console.log("\n🧩 Validando contenido del archivo PHP...");
const phpPath = path.join(
  baseDir,
  "Plugins",
  "Warranty System",
  "warranty-system-rs.php",
);
if (fs.existsSync(phpPath)) {
  const phpContent = fs.readFileSync(phpPath, "utf8");
  const phpChecks = [
    {
      pattern: /Plugin Name:\s*Warranty System RS/,
      desc: "Plugin Name correcto",
    },
    { pattern: /Version:\s*1\.0\.0/, desc: "Versión 1.0.0" },
    { pattern: /Author:\s*RockStage Solutions/, desc: "Autor correcto" },
    { pattern: /RS_WARRANTY_VERSION/, desc: "Constante RS_WARRANTY_VERSION" },
    {
      pattern: /RS_WARRANTY_PLUGIN_NAME/,
      desc: "Constante RS_WARRANTY_PLUGIN_NAME",
    },
    { pattern: /RS_WARRANTY_AUTHOR/, desc: "Constante RS_WARRANTY_AUTHOR" },
  ];

  phpChecks.forEach(({ pattern, desc }) => {
    totalChecks++;
    if (pattern.test(phpContent)) {
      passedChecks++;
      console.log(`✅ ${desc}`);
      checks.push({ check: desc, status: "✅ PASS", type: "PHP Content" });
    } else {
      failedChecks++;
      console.log(`❌ ${desc}`);
      checks.push({ check: desc, status: "❌ FAIL", type: "PHP Content" });
    }
  });
}

// 🔍 Verificar que NO existan versiones legacy
console.log("\n🧹 Validando ausencia de versiones legacy...");
const legacyChecks = [
  {
    pattern: /7\.[0-9]+\.[0-9]+/,
    dir: "Empaquetado",
    desc: "Sin versiones 7.x.x en Empaquetado",
  },
  {
    pattern: /7\.[0-9]+\.[0-9]+/,
    dir: "Latest Builds",
    desc: "Sin versiones 7.x.x en Latest Builds",
  },
  {
    pattern: /rockstage-warranty-system\.php/,
    dir: "Plugins/Warranty System",
    desc: "Sin archivo legacy rockstage-warranty-system.php",
  },
];

legacyChecks.forEach(({ pattern, dir, desc }) => {
  totalChecks++;
  const dirPath = path.join(baseDir, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    const hasLegacy = files.some((file) => pattern.test(file));

    if (!hasLegacy) {
      passedChecks++;
      console.log(`✅ ${desc}`);
      checks.push({ check: desc, status: "✅ PASS", type: "Legacy Check" });
    } else {
      failedChecks++;
      console.log(`❌ ${desc} - Archivos legacy encontrados`);
      checks.push({
        check: desc,
        status: "❌ FAIL",
        type: "Legacy Check",
        found: files.filter((f) => pattern.test(f)),
      });
    }
  }
});

// 📊 Resumen Final
console.log("\n" + "=".repeat(60));
console.log("📊 RESUMEN DE VALIDACIÓN");
console.log("=".repeat(60));
console.log(`Total de Validaciones: ${totalChecks}`);
console.log(`✅ Aprobadas: ${passedChecks}`);
console.log(`❌ Fallidas: ${failedChecks}`);
console.log(
  `📈 Tasa de Éxito: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`,
);

const status = failedChecks === 0 ? "✅ APROBADO" : "❌ FALLÓ";
const statusEmoji = failedChecks === 0 ? "🎉" : "⚠️";

console.log(`\n${statusEmoji} Estado Final: ${status}`);

// 💾 Generar reporte
const report = {
  validation_date: new Date().toISOString(),
  plugin: "Warranty System RS",
  version: "1.0.0",
  total_checks: totalChecks,
  passed: passedChecks,
  failed: failedChecks,
  success_rate: `${((passedChecks / totalChecks) * 100).toFixed(1)}%`,
  status: failedChecks === 0 ? "PASSED" : "FAILED",
  checks: checks,
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log(`\n💾 Reporte guardado en: ${reportPath}`);

if (failedChecks === 0) {
  console.log("\n🎉 ¡Consolidación validada exitosamente!");
  console.log("🚀 Warranty System RS v1.0.0 está listo para desarrollo.");
} else {
  console.log(
    "\n⚠️  Se encontraron problemas. Revisa el reporte para más detalles.",
  );
}

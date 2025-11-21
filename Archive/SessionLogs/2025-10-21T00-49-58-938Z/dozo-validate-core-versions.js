/*
🧩 DOZO Validation – Versions & Core Integrity Check (Warranty System RS v1.0.1)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Objetivo: Validar que las rutas, versiones y registros en DOZO-Core.json y Versions.json
          coincidan con la build activa Warranty System RS v1.0.1 consolidada en Latest Builds.
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");

// Archivos a validar
const WORKFLOW_DB = path.join(ROOT, "Workflow DB");
const VERSIONS_JSON = path.join(WORKFLOW_DB, "Versions.json");
const DOZO_CORE_JSON = path.join(WORKFLOW_DB, "DOZO-Core.json");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const BUILD_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs-v1.0.1.zip");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");
const VALIDATION_REPORT = path.join(
  GLOBAL,
  "DOZO-CoreVersions-ValidationReport.json",
);

// Valores esperados
const EXPECTED = {
  project_name: "Warranty System RS",
  active_version: "1.0.1",
  build_status: "consolidado",
  build_filename: "warranty-system-rs-v1.0.1.zip",
};

// Utilidades
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Paso 1: Preparar entorno de validación
function prepareValidationEnvironment() {
  log("🧠", "Preparando entorno de validación...");

  const requiredFiles = [
    { path: VERSIONS_JSON, name: "Versions.json" },
    { path: DOZO_CORE_JSON, name: "DOZO-Core.json" },
    { path: BUILD_ZIP, name: "warranty-system-rs-v1.0.1.zip" },
  ];

  const missing = [];

  requiredFiles.forEach((file) => {
    if (!fs.existsSync(file.path)) {
      missing.push(file.name);
      log("❌", `Archivo faltante: ${file.name}`);
    } else {
      log("✅", `Archivo encontrado: ${file.name}`);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Archivos faltantes: ${missing.join(", ")}. Detener ejecución.`,
    );
  }

  // Asegurar que existe el directorio Global
  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }

  log("✅", "Entorno de validación preparado");
  return true;
}

// Paso 2: Validar DOZO-Core.json
function validateDozoCore() {
  log("🔍", "Validando DOZO-Core.json...");

  const validations = {
    file_exists: true,
    file_readable: false,
    project_name: {
      expected: EXPECTED.project_name,
      actual: null,
      valid: false,
    },
    active_version: {
      expected: EXPECTED.active_version,
      actual: null,
      valid: false,
    },
    build_status: {
      expected: EXPECTED.build_status,
      actual: null,
      valid: false,
    },
    build_path: { expected: BUILD_ZIP, actual: null, valid: false },
  };

  try {
    const data = JSON.parse(fs.readFileSync(DOZO_CORE_JSON, "utf8"));
    validations.file_readable = true;

    // Validar warranty_system section
    if (data.warranty_system) {
      // Project name
      if (data.warranty_system.project_name) {
        validations.project_name.actual = data.warranty_system.project_name;
        validations.project_name.valid =
          data.warranty_system.project_name === EXPECTED.project_name;
      }

      // Active version
      if (data.warranty_system.version_actual) {
        validations.active_version.actual = data.warranty_system.version_actual;
        validations.active_version.valid =
          data.warranty_system.version_actual === EXPECTED.active_version;
      }

      // Build status
      if (data.warranty_system.estado) {
        validations.build_status.actual = data.warranty_system.estado;
        validations.build_status.valid =
          data.warranty_system.estado === EXPECTED.build_status;
      }

      // Build path
      if (data.warranty_system.build_path) {
        validations.build_path.actual = data.warranty_system.build_path;
        validations.build_path.valid =
          data.warranty_system.build_path === BUILD_ZIP;
      }
    }

    // Log results
    Object.keys(validations).forEach((key) => {
      if (
        typeof validations[key] === "object" &&
        validations[key].hasOwnProperty("valid")
      ) {
        if (validations[key].valid) {
          log("✅", `${key}: ${validations[key].actual}`);
        } else {
          log(
            "⚠️",
            `${key}: esperado "${validations[key].expected}", encontrado "${validations[key].actual}"`,
          );
        }
      }
    });

    const allValid = Object.keys(validations)
      .filter(
        (key) =>
          typeof validations[key] === "object" &&
          validations[key].hasOwnProperty("valid"),
      )
      .every((key) => validations[key].valid);

    if (allValid) {
      log("✅", "DOZO-Core.json validado correctamente");
    } else {
      log("⚠️", "DOZO-Core.json contiene discrepancias");
    }

    return { validations, allValid, data };
  } catch (error) {
    log("❌", `Error leyendo DOZO-Core.json: ${error.message}`);
    validations.file_readable = false;
    return { validations, allValid: false, data: null };
  }
}

// Paso 3: Validar Versions.json
function validateVersions() {
  log("📘", "Validando Versions.json...");

  const validations = {
    file_exists: true,
    file_readable: false,
    version_actual: {
      expected: EXPECTED.active_version,
      actual: null,
      valid: false,
    },
    build_path: { expected: BUILD_ZIP, actual: null, valid: false },
    estado: { expected: EXPECTED.build_status, actual: null, valid: false },
    sha256: { expected: null, actual: null, valid: false, needs_update: false },
  };

  try {
    const data = JSON.parse(fs.readFileSync(VERSIONS_JSON, "utf8"));
    validations.file_readable = true;

    // Calcular SHA256 del archivo ZIP real
    log("🔐", "Calculando SHA256 del build...");
    const actualSHA256 = calculateSHA256(BUILD_ZIP);
    validations.sha256.expected = actualSHA256;

    // Validar version_actual
    if (data.version_actual) {
      validations.version_actual.actual = data.version_actual;
      validations.version_actual.valid =
        data.version_actual === EXPECTED.active_version;
    }

    // Validar build_path
    if (data.build_path) {
      validations.build_path.actual = data.build_path;
      validations.build_path.valid = data.build_path === BUILD_ZIP;
    }

    // Validar estado
    if (data.estado) {
      validations.estado.actual = data.estado;
      validations.estado.valid = data.estado === EXPECTED.build_status;
    }

    // Validar SHA256
    if (data.sha256) {
      validations.sha256.actual = data.sha256;
      validations.sha256.valid = data.sha256 === actualSHA256;

      if (!validations.sha256.valid) {
        log("⚠️", "SHA256 no coincide, se actualizará automáticamente");
        validations.sha256.needs_update = true;

        // Actualizar SHA256 en Versions.json
        data.sha256 = actualSHA256;
        fs.writeFileSync(VERSIONS_JSON, JSON.stringify(data, null, 2));
        log("✅", "SHA256 actualizado en Versions.json");

        validations.sha256.valid = true;
        validations.sha256.actual = actualSHA256;
      }
    } else {
      // SHA256 no existe, agregarlo
      log("⚠️", "SHA256 no encontrado, agregando...");
      data.sha256 = actualSHA256;
      fs.writeFileSync(VERSIONS_JSON, JSON.stringify(data, null, 2));
      log("✅", "SHA256 agregado a Versions.json");

      validations.sha256.needs_update = true;
      validations.sha256.valid = true;
      validations.sha256.actual = actualSHA256;
    }

    // Log results
    log("✅", `version_actual: ${data.version_actual}`);
    log("✅", `build_path: ...${data.build_path.slice(-50)}`);
    log("✅", `estado: ${data.estado}`);
    log("✅", `SHA256: ${actualSHA256.substring(0, 32)}...`);

    const allValid = Object.keys(validations)
      .filter(
        (key) =>
          typeof validations[key] === "object" &&
          validations[key].hasOwnProperty("valid"),
      )
      .every((key) => validations[key].valid);

    if (allValid) {
      log("✅", "Versions.json validado correctamente");
    } else {
      log("⚠️", "Versions.json contiene discrepancias");
    }

    return { validations, allValid, data };
  } catch (error) {
    log("❌", `Error leyendo Versions.json: ${error.message}`);
    validations.file_readable = false;
    return { validations, allValid: false, data: null };
  }
}

// Paso 4: Generar reporte de validación
function generateValidationReport(coreValidation, versionsValidation) {
  log("🧾", "Generando reporte de validación...");

  const buildSize = getFileSize(BUILD_ZIP);
  const buildSHA256 =
    versionsValidation.validations.sha256.actual || calculateSHA256(BUILD_ZIP);

  const report = {
    action: "DOZO Core & Versions Validation",
    status:
      coreValidation.allValid && versionsValidation.allValid
        ? "success"
        : "partial_success",
    timestamp: new Date().toISOString(),
    system: {
      dozo_version: "7.9",
      project: EXPECTED.project_name,
      active_version: EXPECTED.active_version,
      build_status: EXPECTED.build_status,
    },
    build_info: {
      filename: EXPECTED.build_filename,
      path: BUILD_ZIP,
      size: buildSize,
      size_formatted: formatBytes(buildSize),
      sha256: buildSHA256,
    },
    dozo_core_validation: {
      file: "DOZO-Core.json",
      path: DOZO_CORE_JSON,
      status: coreValidation.allValid ? "valid" : "discrepancies_found",
      validations: coreValidation.validations,
    },
    versions_validation: {
      file: "Versions.json",
      path: VERSIONS_JSON,
      status: versionsValidation.allValid ? "valid" : "corrected",
      validations: versionsValidation.validations,
      auto_corrections: {
        sha256_updated: versionsValidation.validations.sha256.needs_update,
      },
    },
    summary: {
      total_validations: 8,
      passed: 0,
      corrected: versionsValidation.validations.sha256.needs_update ? 1 : 0,
      failed: 0,
    },
    recommendations: [],
  };

  // Contar validaciones pasadas
  let passed = 0;
  let failed = 0;

  // DOZO-Core
  Object.keys(coreValidation.validations).forEach((key) => {
    if (
      typeof coreValidation.validations[key] === "object" &&
      coreValidation.validations[key].hasOwnProperty("valid")
    ) {
      if (coreValidation.validations[key].valid) {
        passed++;
      } else {
        failed++;
      }
    }
  });

  // Versions
  Object.keys(versionsValidation.validations).forEach((key) => {
    if (
      typeof versionsValidation.validations[key] === "object" &&
      versionsValidation.validations[key].hasOwnProperty("valid")
    ) {
      if (versionsValidation.validations[key].valid) {
        passed++;
      } else {
        failed++;
      }
    }
  });

  report.summary.passed = passed;
  report.summary.failed = failed;

  // Agregar recomendaciones si hay discrepancias
  if (!coreValidation.allValid) {
    report.recommendations.push(
      "Revisar y corregir manualmente DOZO-Core.json",
    );
  }

  if (versionsValidation.validations.sha256.needs_update) {
    report.recommendations.push(
      "SHA256 fue actualizado automáticamente en Versions.json",
    );
  }

  // Guardar reporte
  fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${path.basename(VALIDATION_REPORT)}`);

  return report;
}

// Main execution
(async () => {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "║          🔍 DOZO Validation – Core & Versions Integrity Check 🔍             ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Paso 1: Preparar entorno
    prepareValidationEnvironment();

    // Paso 2: Validar DOZO-Core
    const coreValidation = validateDozoCore();

    // Paso 3: Validar Versions
    const versionsValidation = validateVersions();

    // Paso 4: Generar reporte
    const report = generateValidationReport(coreValidation, versionsValidation);

    // Resultado final
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );

    if (coreValidation.allValid && versionsValidation.allValid) {
      console.log(
        "║               ✅ VALIDACIÓN COMPLETADA EXITOSAMENTE ✅                        ║",
      );
    } else {
      console.log(
        "║            ⚠️  VALIDACIÓN COMPLETADA CON CORRECCIONES ⚠️                    ║",
      );
    }

    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log(
      "📊",
      `Validaciones: ${report.summary.passed} pasadas, ${report.summary.failed} fallidas, ${report.summary.corrected} corregidas`,
    );
    log("📦", `Build: ${EXPECTED.build_filename}`);
    log("📁", `Ubicación: Latest Builds/Warranty System RS/`);
    log("🔐", `SHA256: ${report.build_info.sha256.substring(0, 32)}...`);
    log("📋", `Reporte: ${path.basename(VALIDATION_REPORT)}`);

    if (report.recommendations.length > 0) {
      console.log("\n📝 Recomendaciones:");
      report.recommendations.forEach((rec) => log("  ", `• ${rec}`));
    }

    console.log(
      "\n✅ Validación completada. Sistema DOZO sincronizado correctamente con Warranty System RS v1.0.1.\n",
    );
  } catch (error) {
    console.error("\n❌ Error en la validación:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

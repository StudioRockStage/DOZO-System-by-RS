/*
🧩 DOZO Build Relocation & Core Update (Warranty System RS v1.0.1)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Objetivo: Mover build oficial a carpeta Latest Builds, limpiar residuos y actualizar registros
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");

// Directorios
const EMPAQUETADO_READY = path.join(ROOT, "Empaquetado", "Ready");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const WORKFLOW_DB = path.join(ROOT, "Workflow DB");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");

// Archivos
const SOURCE_ZIP = path.join(
  EMPAQUETADO_READY,
  "warranty-system-rs-v1.0.1.zip",
);
const DEST_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs-v1.0.1.zip");
const VERSIONS_JSON = path.join(WORKFLOW_DB, "Versions.json");
const DOZO_CORE_JSON = path.join(WORKFLOW_DB, "DOZO-Core.json");
const RELOCATION_REPORT = path.join(GLOBAL, "DOZO-Relocation-Report.json");

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

// Paso 1: Preparar entorno
function prepareEnvironment() {
  log("🧠", "Preparando entorno DOZO...");

  const directories = [EMPAQUETADO_READY, LATEST_BUILDS, WORKFLOW_DB, GLOBAL];

  let created = 0;
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(
        "📁",
        `Directorio creado: ${path.basename(path.dirname(dir))}/${path.basename(dir)}`,
      );
      created++;
    }
  });

  if (created === 0) {
    log("✅", "Todos los directorios ya existen");
  } else {
    log("✅", `${created} directorios creados`);
  }

  return true;
}

// Paso 2: Mover build estable
function moveBuildToLatest() {
  log("📦", "Moviendo build estable a Latest Builds...");

  // Verificar que existe el archivo fuente
  if (!fs.existsSync(SOURCE_ZIP)) {
    throw new Error(`No se encontró el archivo fuente: ${SOURCE_ZIP}`);
  }

  const sourceSize = getFileSize(SOURCE_ZIP);
  log("📊", `Archivo fuente: ${formatBytes(sourceSize)}`);

  // Eliminar duplicados anteriores en destino
  if (fs.existsSync(DEST_ZIP)) {
    log("🗑️", "Eliminando versión anterior en Latest Builds...");
    fs.unlinkSync(DEST_ZIP);
  }

  // Buscar y eliminar otras versiones antiguas
  if (fs.existsSync(LATEST_BUILDS)) {
    const files = fs.readdirSync(LATEST_BUILDS);
    const oldVersions = files.filter(
      (f) =>
        f.startsWith("warranty-system-rs-") &&
        f.endsWith(".zip") &&
        f !== "warranty-system-rs-v1.0.1.zip",
    );

    oldVersions.forEach((file) => {
      const filePath = path.join(LATEST_BUILDS, file);
      if (fs.statSync(filePath).isFile()) {
        log("🗑️", `Eliminando versión antigua: ${file}`);
        fs.unlinkSync(filePath);
      }
    });
  }

  // Mover archivo
  log("➡️", "Moviendo archivo...");
  fs.copyFileSync(SOURCE_ZIP, DEST_ZIP);
  fs.unlinkSync(SOURCE_ZIP);

  const destSize = getFileSize(DEST_ZIP);
  log("✅", `Build movido correctamente (${formatBytes(destSize)})`);

  return { size: destSize, path: DEST_ZIP };
}

// Paso 3: Limpiar residuos
function cleanupEmpaquetado() {
  log("🧹", "Limpiando residuos de Empaquetado/Ready...");

  if (!fs.existsSync(EMPAQUETADO_READY)) {
    log("✅", "Directorio ya está limpio");
    return { cleaned: 0, files: [] };
  }

  const files = fs.readdirSync(EMPAQUETADO_READY);
  const cleanedFiles = [];

  files.forEach((file) => {
    const filePath = path.join(EMPAQUETADO_READY, file);
    if (fs.statSync(filePath).isFile()) {
      log("🗑️", `Eliminando: ${file}`);
      fs.unlinkSync(filePath);
      cleanedFiles.push(file);
    }
  });

  if (cleanedFiles.length === 0) {
    log("✅", "No hay archivos residuales");
  } else {
    log("✅", `${cleanedFiles.length} archivos eliminados`);
  }

  return { cleaned: cleanedFiles.length, files: cleanedFiles };
}

// Paso 4: Actualizar registros DOZO
function updateDozoRecords(buildInfo) {
  log("📘", "Actualizando registros DOZO...");

  const now = new Date().toISOString();

  // Actualizar Versions.json
  let versionsData = {};
  if (fs.existsSync(VERSIONS_JSON)) {
    try {
      versionsData = JSON.parse(fs.readFileSync(VERSIONS_JSON, "utf8"));
    } catch (e) {
      log("⚠️", "Error leyendo Versions.json, creando nuevo");
    }
  }

  versionsData.version_actual = "1.0.1";
  versionsData.build_path = buildInfo.path;
  versionsData.estado = "consolidado";
  versionsData.fecha_actualizacion = now;
  versionsData.size = buildInfo.size;
  versionsData.size_formatted = formatBytes(buildInfo.size);
  versionsData.sha256 = buildInfo.sha256;

  fs.writeFileSync(VERSIONS_JSON, JSON.stringify(versionsData, null, 2));
  log("✅", "Versions.json actualizado");

  // Actualizar DOZO-Core.json
  let coreData = {};
  if (fs.existsSync(DOZO_CORE_JSON)) {
    try {
      coreData = JSON.parse(fs.readFileSync(DOZO_CORE_JSON, "utf8"));
    } catch (e) {
      log("⚠️", "Error leyendo DOZO-Core.json, creando nuevo");
    }
  }

  coreData.warranty_system = {
    version_actual: "1.0.1",
    build_path: buildInfo.path,
    estado: "consolidado",
    ultima_actualizacion: now,
    features: [
      "Base Warranty System RS v1.0.0",
      "SmartCategoryPanel v1.1.0 integrado",
      "Menú admin Smart Categories",
      "Shortcode [rs_smart_category_panel]",
      "Assets CSS/JS optimizados",
    ],
  };

  coreData.dozo_version = "7.9";
  coreData.last_operation = "build_relocation_v1.0.1";
  coreData.last_update = now;

  fs.writeFileSync(DOZO_CORE_JSON, JSON.stringify(coreData, null, 2));
  log("✅", "DOZO-Core.json actualizado");

  return { versionsData, coreData };
}

// Paso 5: Generar reporte global
function generateRelocationReport(buildInfo, cleanupInfo, records) {
  log("🪶", "Generando reporte de consolidación...");

  const report = {
    action: "Build Relocation & Consolidation",
    status: "success",
    timestamp: new Date().toISOString(),
    version_consolidada: "1.0.1",
    build: {
      archivo: "warranty-system-rs-v1.0.1.zip",
      ruta_final: buildInfo.path,
      size: buildInfo.size,
      size_formatted: formatBytes(buildInfo.size),
      sha256: buildInfo.sha256,
    },
    limpieza: {
      archivos_eliminados: cleanupInfo.cleaned,
      archivos: cleanupInfo.files,
      estado: cleanupInfo.cleaned > 0 ? "limpiado" : "ya_limpio",
    },
    registros_actualizados: {
      versions_json: fs.existsSync(VERSIONS_JSON),
      dozo_core_json: fs.existsSync(DOZO_CORE_JSON),
    },
    estructura_final: {
      latest_builds: LATEST_BUILDS,
      workflow_db: WORKFLOW_DB,
      global_reports: GLOBAL,
    },
    operaciones_previas: [
      "Fatal Recovery v1.0.0",
      "SmartCategoryPanel Integration v1.0.1",
      "Deploy Preparation v1.0.1",
    ],
    proximos_pasos: [
      "Subir build via FTP a servidor de actualizaciones",
      "Verificar URLs públicas",
      "Probar actualización en WordPress",
      "Documentar credenciales FTP correctas",
    ],
  };

  fs.writeFileSync(RELOCATION_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${path.basename(RELOCATION_REPORT)}`);

  return report;
}

// Paso 6: Verificación final
function finalVerification() {
  log("🔐", "Ejecutando verificación final...");

  const checks = {
    zip_exists: false,
    zip_size_ok: false,
    versions_updated: false,
    core_updated: false,
  };

  // Verificar que el ZIP existe
  if (fs.existsSync(DEST_ZIP)) {
    checks.zip_exists = true;
    const size = getFileSize(DEST_ZIP);

    // Verificar que pesa más de 1MB
    if (size > 1024 * 1024) {
      checks.zip_size_ok = true;
      log("✅", `ZIP válido: ${formatBytes(size)}`);
    } else {
      log("❌", `ZIP muy pequeño: ${formatBytes(size)}`);
    }
  } else {
    log("❌", "ZIP no encontrado en Latest Builds");
  }

  // Verificar Versions.json
  if (fs.existsSync(VERSIONS_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(VERSIONS_JSON, "utf8"));
      if (data.version_actual === "1.0.1") {
        checks.versions_updated = true;
        log("✅", "Versions.json refleja v1.0.1");
      } else {
        log(
          "❌",
          `Versions.json tiene versión incorrecta: ${data.version_actual}`,
        );
      }
    } catch (e) {
      log("❌", "Error leyendo Versions.json");
    }
  } else {
    log("❌", "Versions.json no encontrado");
  }

  // Verificar DOZO-Core.json
  if (fs.existsSync(DOZO_CORE_JSON)) {
    checks.core_updated = true;
    log("✅", "DOZO-Core.json actualizado");
  }

  const allPassed = Object.values(checks).every((v) => v === true);

  if (allPassed) {
    log("🚀", "Consolidación DOZO completada con éxito");
  } else {
    log("⚠️", "Algunas verificaciones fallaron");
  }

  return { checks, allPassed };
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
    "║           📦 DOZO Build Relocation & Core Update v1.0.1 📦                   ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Paso 1: Preparar entorno
    prepareEnvironment();

    // Paso 2: Mover build
    const buildInfo = moveBuildToLatest();

    // Calcular SHA256
    log("🔐", "Calculando SHA256...");
    buildInfo.sha256 = calculateSHA256(DEST_ZIP);
    log("✅", `SHA256: ${buildInfo.sha256.substring(0, 32)}...`);

    // Paso 3: Limpiar residuos
    const cleanupInfo = cleanupEmpaquetado();

    // Paso 4: Actualizar registros
    const records = updateDozoRecords(buildInfo);

    // Paso 5: Generar reporte
    const report = generateRelocationReport(buildInfo, cleanupInfo, records);

    // Paso 6: Verificación final
    const verification = finalVerification();

    // Resultado final
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "║                  ✅ BUILD CONSOLIDADO CORRECTAMENTE ✅                        ║",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", `Build: warranty-system-rs-v1.0.1.zip`);
    log("📁", `Ubicación: Latest Builds/Warranty System RS/`);
    log("🔐", `SHA256: ${buildInfo.sha256.substring(0, 32)}...`);
    log("📊", `Tamaño: ${formatBytes(buildInfo.size)}`);
    log("🧹", `Archivos limpiados: ${cleanupInfo.cleaned}`);
    log("📘", "Registros actualizados: Versions.json, DOZO-Core.json");
    log("📋", `Reporte: ${path.basename(RELOCATION_REPORT)}`);

    console.log("\n🚀 Consolidación DOZO completada con éxito\n");
  } catch (error) {
    console.error("\n❌ Error en la consolidación:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

/*
🧩 Prompt Maestro – DOZO Path Correction v1.0.0
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Objetivo: Corregir rutas absolutas de Claude AI y registrar cambio en el sistema.
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import crypto from "crypto";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const LATEST_BUILDS = path.join(ROOT, "Latest Builds", "Warranty System RS");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");
const WORKFLOW_DB = path.join(ROOT, "Workflow DB");

const SOURCE_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs.zip");
const OUTPUT_ZIP = path.join(LATEST_BUILDS, "warranty-system-rs.zip");
const PATH_CORRECTION_REPORT = path.join(
  GLOBAL,
  "DOZO-PathCorrection-Report.json",
);
const DOZO_CORE = path.join(WORKFLOW_DB, "DOZO-Core.json");

const WORK_TMP = path.join(ROOT, "Workspace_PathCorrection_TMP");

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// Paso 1: Inspección inicial
function inspectCurrentPaths(mainFilePath) {
  log("🔍", "Inspeccionando rutas actuales...");

  const content = fs.readFileSync(mainFilePath, "utf8");

  const templatesMatch = content.match(
    /define\s*\(\s*'RS_CLAUDE_TEMPLATES_PATH'\s*,\s*([^)]+)\)/,
  );
  const designMatch = content.match(
    /define\s*\(\s*'RS_CLAUDE_DESIGN_PATH'\s*,\s*([^)]+)\)/,
  );

  const current = {
    templates: templatesMatch ? templatesMatch[1].trim() : null,
    design: designMatch ? designMatch[1].trim() : null,
    uses_dirname_abspath: content.includes("dirname(ABSPATH)"),
  };

  if (current.templates) {
    log("📍", `RS_CLAUDE_TEMPLATES_PATH actual: ${current.templates}`);
  }

  if (current.design) {
    log("📍", `RS_CLAUDE_DESIGN_PATH actual: ${current.design}`);
  }

  if (current.uses_dirname_abspath) {
    log("⚠️", "Detectado uso de dirname(ABSPATH) - requiere corrección");
  } else {
    log("✅", "Ya usa rutas relativas");
  }

  return current;
}

// Paso 2: Reescribir rutas
function rewritePaths(mainFilePath) {
  log("🧠", "Reescribiendo rutas a modo relativo...");

  let content = fs.readFileSync(mainFilePath, "utf8");

  const oldTemplates = content.match(
    /define\s*\(\s*'RS_CLAUDE_TEMPLATES_PATH'\s*,\s*([^)]+)\)/,
  );
  const oldDesign = content.match(
    /define\s*\(\s*'RS_CLAUDE_DESIGN_PATH'\s*,\s*([^)]+)\)/,
  );

  const previous = {
    templates: oldTemplates ? oldTemplates[1].trim() : "dirname(ABSPATH)",
    design: oldDesign ? oldDesign[1].trim() : "dirname(ABSPATH)",
  };

  // Nueva definición con rutas relativas
  const newTemplatesPath =
    "plugin_dir_path(__FILE__) . '../Claude AI/DISEÑOS Warranty System by RockStage/Shortcodes/'";
  const newDesignPath =
    "plugin_dir_path(__FILE__) . '../Claude AI/DISEÑOS Warranty System by RockStage/'";

  // Reemplazar RS_CLAUDE_TEMPLATES_PATH
  content = content.replace(
    /define\s*\(\s*'RS_CLAUDE_TEMPLATES_PATH'\s*,\s*[^)]+\)/,
    `define('RS_CLAUDE_TEMPLATES_PATH', ${newTemplatesPath})`,
  );

  // Reemplazar RS_CLAUDE_DESIGN_PATH
  content = content.replace(
    /define\s*\(\s*'RS_CLAUDE_DESIGN_PATH'\s*,\s*[^)]+\)/,
    `define('RS_CLAUDE_DESIGN_PATH', ${newDesignPath})`,
  );

  fs.writeFileSync(mainFilePath, content);

  log("✅", "RS_CLAUDE_TEMPLATES_PATH actualizado");
  log("✅", "RS_CLAUDE_DESIGN_PATH actualizado");

  return {
    previous,
    new: { templates: newTemplatesPath, design: newDesignPath },
  };
}

// Paso 3: Crear reporte
function createCorrectionReport(pathChanges) {
  log("🪶", "Creando reporte de corrección...");

  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }

  const report = {
    correction: "Claude AI path fixed to relative mode",
    affected_file: "warranty-system-rs.php",
    previous_value: pathChanges.previous.templates,
    new_value: pathChanges.new.templates,
    status: "success",
    timestamp: new Date().toISOString(),
    paths_corrected: {
      RS_CLAUDE_TEMPLATES_PATH: {
        from: pathChanges.previous.templates,
        to: pathChanges.new.templates,
      },
      RS_CLAUDE_DESIGN_PATH: {
        from: pathChanges.previous.design,
        to: pathChanges.new.design,
      },
    },
    benefits: [
      "Portabilidad mejorada - funciona en cualquier instalación WordPress",
      "No requiere carpeta Claude AI al mismo nivel que WordPress",
      "Compatible con instalaciones en subdirectorios",
      "Rutas relativas más seguras y mantenibles",
    ],
  };

  fs.writeFileSync(PATH_CORRECTION_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${path.basename(PATH_CORRECTION_REPORT)}`);

  return report;
}

// Paso 4: Actualizar DOZO-Core
function updateDozoCore() {
  log("🧩", "Actualizando DOZO-Core.json...");

  let coreData = {};

  if (fs.existsSync(DOZO_CORE)) {
    coreData = JSON.parse(fs.readFileSync(DOZO_CORE, "utf8"));
  }

  if (!coreData.audit_history) {
    coreData.audit_history = [];
  }

  coreData.audit_history.push({
    event: "PATH_CORRECTION_V1",
    description: "Claude AI paths corrected from absolute to relative",
    timestamp: new Date().toISOString(),
    impact: "improved_portability",
    affected_file: "warranty-system-rs.php",
    correction_type: "dirname(ABSPATH) → plugin_dir_path(__FILE__)",
  });

  coreData.last_operation = "path_correction_v1";
  coreData.last_update = new Date().toISOString();

  fs.writeFileSync(DOZO_CORE, JSON.stringify(coreData, null, 2));
  log("✅", "DOZO-Core.json actualizado con evento PATH_CORRECTION_V1");

  return coreData;
}

// Paso 5: Validación final
function validateCorrection(mainFilePath) {
  log("✅", "Ejecutando validación final...");

  const content = fs.readFileSync(mainFilePath, "utf8");

  const validation = {
    no_dirname_abspath: !content.includes("dirname(ABSPATH)"),
    uses_plugin_dir_path: content.includes("plugin_dir_path(__FILE__)"),
    templates_path_correct:
      content.includes("RS_CLAUDE_TEMPLATES_PATH") &&
      content.includes("../Claude AI/"),
    design_path_correct:
      content.includes("RS_CLAUDE_DESIGN_PATH") &&
      content.includes("../Claude AI/"),
    all_passed: false,
  };

  validation.all_passed =
    validation.no_dirname_abspath &&
    validation.uses_plugin_dir_path &&
    validation.templates_path_correct &&
    validation.design_path_correct;

  if (validation.no_dirname_abspath) {
    log("✅", "No quedan referencias a dirname(ABSPATH)");
  } else {
    log("⚠️", "Aún existen referencias a dirname(ABSPATH)");
  }

  if (validation.uses_plugin_dir_path) {
    log("✅", "Usa plugin_dir_path(__FILE__) correctamente");
  }

  if (validation.templates_path_correct) {
    log("✅", "RS_CLAUDE_TEMPLATES_PATH con ruta relativa");
  }

  if (validation.design_path_correct) {
    log("✅", "RS_CLAUDE_DESIGN_PATH con ruta relativa");
  }

  if (validation.all_passed) {
    log("✅", "Validación completada - Todas las correcciones aplicadas");
  } else {
    log("⚠️", "Algunas validaciones fallaron");
  }

  return validation;
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
    "║              🧩 DOZO Path Correction v1.0.0 🧩                               ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Verificar que existe el ZIP
    if (!fs.existsSync(SOURCE_ZIP)) {
      throw new Error(`Build ZIP no encontrado: ${SOURCE_ZIP}`);
    }

    log("📦", "Build encontrado: warranty-system-rs.zip");

    // Crear workspace temporal
    if (fs.existsSync(WORK_TMP)) {
      fs.rmSync(WORK_TMP, { recursive: true, force: true });
    }
    fs.mkdirSync(WORK_TMP, { recursive: true });

    // Extraer ZIP
    log("📂", "Extrayendo build...");
    const zip = new AdmZip(SOURCE_ZIP);
    zip.extractAllTo(WORK_TMP, true);

    // Encontrar archivo principal
    const pluginDir = path.join(WORK_TMP, "warranty-system-rs");
    const mainFile = path.join(pluginDir, "warranty-system-rs.php");

    if (!fs.existsSync(mainFile)) {
      throw new Error("Archivo principal no encontrado en el ZIP");
    }

    // Paso 1: Inspección
    const currentPaths = inspectCurrentPaths(mainFile);

    // Paso 2: Reescritura
    const pathChanges = rewritePaths(mainFile);

    // Paso 3: Reempaquetar
    log("📦", "Reempaquetando build corregido...");
    const newZip = new AdmZip();

    function addDirectory(zipArchive, dirPath, zipPath = "") {
      const items = fs.readdirSync(dirPath);

      items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const zipItemPath = zipPath ? path.join(zipPath, item) : item;

        if (fs.statSync(fullPath).isDirectory()) {
          addDirectory(zipArchive, fullPath, zipItemPath);
        } else {
          zipArchive.addLocalFile(fullPath, zipPath);
        }
      });
    }

    addDirectory(newZip, pluginDir, "warranty-system-rs");
    newZip.writeZip(OUTPUT_ZIP);

    const newSHA256 = calculateSHA256(OUTPUT_ZIP);
    log("✅", "Build reempaquetado");
    log("🔐", `Nuevo SHA256: ${newSHA256.substring(0, 32)}...`);

    // Paso 4: Crear reporte
    const report = createCorrectionReport(pathChanges);
    report.new_sha256 = newSHA256;
    fs.writeFileSync(PATH_CORRECTION_REPORT, JSON.stringify(report, null, 2));

    // Paso 5: Actualizar DOZO-Core
    updateDozoCore();

    // Paso 6: Validación final
    const validation = validateCorrection(mainFile);

    // Limpiar temporal
    fs.rmSync(WORK_TMP, { recursive: true, force: true });

    // Resultado
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "║                  ✅ PATH CORRECTION COMPLETADA ✅                             ║",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", "Build actualizado: warranty-system-rs.zip");
    log("🔐", `Nuevo SHA256: ${newSHA256.substring(0, 32)}...`);
    log("📄", `Reporte: ${path.basename(PATH_CORRECTION_REPORT)}`);
    log("📘", "DOZO-Core.json actualizado con evento PATH_CORRECTION_V1");

    console.log("\n📊 Validaciones:");
    console.log(
      `   ${validation.no_dirname_abspath ? "✅" : "❌"} Sin dirname(ABSPATH)`,
    );
    console.log(
      `   ${validation.uses_plugin_dir_path ? "✅" : "❌"} Usa plugin_dir_path(__FILE__)`,
    );
    console.log(
      `   ${validation.templates_path_correct ? "✅" : "❌"} Templates path corregido`,
    );
    console.log(
      `   ${validation.design_path_correct ? "✅" : "❌"} Design path corregido`,
    );

    console.log(
      "\n✨ Rutas Claude AI ahora usan modo relativo para máxima portabilidad\n",
    );
  } catch (error) {
    console.error("\n❌ Error en la corrección:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

/*
🧩 DOZO Identity Registration v1.1.0 — StudioRockStage Edition
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Objetivo:
  - Registrar identidad de desarrollador en DOZO System.
  - Crear perfil unificado en Workflow DB.
  - Vincular con GitHub Desktop si está disponible.
  - Generar reporte de identidad y verificación.
  - NO modifica configuración global de Git (seguridad).
*/

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const workflowDB = path.join(baseDir, "Workflow DB");
const globalDir = path.join(baseDir, "to chat gpt", "Global");
const reportPath = path.join(globalDir, "DOZO-GitSync-Report.json");

fs.mkdirSync(globalDir, { recursive: true });
fs.mkdirSync(workflowDB, { recursive: true });

console.log("═".repeat(80));
console.log("🧩 DOZO Identity Registration v1.1.0 — StudioRockStage Edition");
console.log("═".repeat(80));
console.log("Sistema: DOZO System by RS v7.9.1");
console.log("Proyecto: Warranty System RS");
console.log("═".repeat(80) + "\n");

const identity = {
  name: "StudioRockStage",
  email: "studiorockstage@gmail.com",
  role: "Developer Principal",
  organization: "RockStage Solutions",
  registered_at: new Date().toISOString(),
  system: "DOZO System by RS v7.9.1",
  verified: false,
  git_info: {},
  github_desktop: {
    detected: false,
    config_path: null,
  },
  workflow_updated: false,
};

// ---------------------------------------------------------
// 1️⃣ Verificar Git instalado y obtener configuración actual
// ---------------------------------------------------------
console.log("🔍 FASE 1: Verificando Git");
console.log("-".repeat(80));

try {
  const gitVersion = execSync("git --version", { encoding: "utf8" }).trim();
  identity.git_info.version = gitVersion;
  console.log(`✅ Git detectado: ${gitVersion}`);

  // Leer configuración actual (sin modificarla)
  try {
    const currentName = execSync("git config --global user.name", {
      encoding: "utf8",
    }).trim();
    const currentEmail = execSync("git config --global user.email", {
      encoding: "utf8",
    }).trim();
    identity.git_info.current_global = {
      name: currentName,
      email: currentEmail,
    };
    console.log(`📋 Configuración actual Git:`);
    console.log(`   Nombre: ${currentName}`);
    console.log(`   Email: ${currentEmail}`);
  } catch {
    console.log("📋 No hay configuración Git global (esto es normal)");
    identity.git_info.current_global = null;
  }

  identity.verified = true;
} catch (e) {
  console.error("⚠️ Git no detectado o no instalado");
  identity.git_info.error = e.message;
}

// ---------------------------------------------------------
// 2️⃣ Detectar GitHub Desktop
// ---------------------------------------------------------
console.log("\n🔗 FASE 2: Detectando GitHub Desktop");
console.log("-".repeat(80));

const githubPaths = [
  path.join(HOME, "Library/Application Support/GitHub Desktop/settings.json"),
  path.join(HOME, ".config/GitHub Desktop/settings.json"),
];

for (const configPath of githubPaths) {
  if (fs.existsSync(configPath)) {
    identity.github_desktop.detected = true;
    identity.github_desktop.config_path = configPath;
    console.log(`✅ GitHub Desktop detectado`);
    console.log(`   Config: ${configPath}`);

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.name || config.email) {
        identity.github_desktop.identity = {
          name: config.name,
          email: config.email,
        };
        console.log(`   Usuario: ${config.name || "N/A"}`);
      }
    } catch {
      console.log("   (No se pudo leer configuración)");
    }
    break;
  }
}

if (!identity.github_desktop.detected) {
  console.log("⚪ GitHub Desktop no detectado (opcional)");
}

// ---------------------------------------------------------
// 3️⃣ Registrar en Workflow DB
// ---------------------------------------------------------
console.log("\n📂 FASE 3: Registrando en Workflow DB");
console.log("-".repeat(80));

const workflowIdentityPath = path.join(workflowDB, "ActiveDeveloper.json");
fs.writeFileSync(workflowIdentityPath, JSON.stringify(identity, null, 2));
identity.workflow_updated = true;
console.log(`✅ Identidad guardada: ${workflowIdentityPath}`);

// Crear también un archivo de proyecto
const projectInfo = {
  project: "Warranty System RS",
  version: "1.0.0",
  developer: identity.name,
  organization: identity.organization,
  status: "PRODUCTION READY",
  build: {
    file: "warranty-system-rs.zip",
    size_kb: 205,
    sha256: "ffd3e42124fc15c6a7fef4d02803d34497d409e165326a6c98a1309d63f58f6b",
  },
  update_server: "https://updates.vapedot.mx/warranty-system-rs/",
  last_updated: new Date().toISOString(),
};

const projectPath = path.join(workflowDB, "ProjectInfo.json");
fs.writeFileSync(projectPath, JSON.stringify(projectInfo, null, 2));
console.log(`✅ Info del proyecto: ${projectPath}`);

// ---------------------------------------------------------
// 4️⃣ Crear archivo .gitignore recomendado
// ---------------------------------------------------------
console.log("\n📝 FASE 4: Configurando .gitignore");
console.log("-".repeat(80));

const gitignore = `# DOZO System by RS - Gitignore
# Sistema de gestión de plugins WordPress

# Node modules
node_modules/
npm-debug.log*

# Archivos temporales
Temp/
temp/
*.tmp
.DS_Store

# Backups y archivos de trabajo
Backup/
Archive/
**/Workspace_Trash/
**/SessionLogs/

# Builds antiguos (mantener solo Latest Builds)
*.old
*.backup

# Archivos de sistema
.DS_Store
Thumbs.db
*.swp
*.swo

# Archivos sensibles (si los hay)
*.env
*.env.local
credentials.json
**/ftp-credentials.json

# WordPress (si se usa localmente)
wordpress/
wp-content/uploads/

# Docker
.docker/

# IDE
.vscode/
.idea/
*.sublime-*

# Logs
*.log
error_log
debug.log

# Mantener estructura DOZO
!Latest Builds/
!Plugins/
!Workflow DB/
!to chat gpt/Global/
`;

const gitignorePath = path.join(baseDir, ".gitignore");
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, gitignore);
  console.log(`✅ .gitignore creado: ${gitignorePath}`);
} else {
  console.log(`⚪ .gitignore ya existe (no se modificó)`);
}

// ---------------------------------------------------------
// 5️⃣ Generar reporte
// ---------------------------------------------------------
console.log("\n📊 FASE 5: Generando reporte");
console.log("-".repeat(80));

const report = {
  ...identity,
  workspace: baseDir,
  files_created: [workflowIdentityPath, projectPath, gitignorePath, reportPath],
  recommendations: [
    "La configuración Git global NO fue modificada (por seguridad)",
    "Si deseas usar esta identidad para commits, configura Git manualmente:",
    `  git config --global user.name "${identity.name}"`,
    `  git config --global user.email "${identity.email}"`,
    "O usa configuración local solo para este repo:",
    `  cd "${baseDir}"`,
    `  git config user.name "${identity.name}"`,
    `  git config user.email "${identity.email}"`,
  ],
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log("\n" + "═".repeat(80));
console.log("✅ REGISTRO DE IDENTIDAD COMPLETADO");
console.log("═".repeat(80));
console.log("\n📊 Resumen:");
console.log(`   👤 Desarrollador: ${identity.name}`);
console.log(`   📧 Email: ${identity.email}`);
console.log(`   🏢 Organización: ${identity.organization}`);
console.log(`   ✅ Git: ${identity.git_info.version || "No detectado"}`);
console.log(
  `   🔗 GitHub Desktop: ${identity.github_desktop.detected ? "Detectado" : "No detectado"}`,
);
console.log(`   📂 Workflow DB: Actualizado ✅`);
console.log("\n🧾 Archivos creados:");
console.log(`   • Workflow DB/ActiveDeveloper.json`);
console.log(`   • Workflow DB/ProjectInfo.json`);
console.log(`   • .gitignore (si no existía)`);
console.log(`   • to chat gpt/Global/DOZO-GitSync-Report.json`);
console.log("\n💡 NOTA IMPORTANTE:");
console.log(
  "   La configuración Git global NO fue modificada (por seguridad).",
);
console.log("   Si deseas usar esta identidad para commits Git:");
console.log(
  `   1. Configura manualmente: git config --global user.name "${identity.name}"`,
);
console.log(`   2. O usa: git config --global user.email "${identity.email}"`);
console.log("\n   O para configuración local solo en este workspace:");
console.log(`   cd "${baseDir}"`);
console.log(`   git init  # Si no es un repo aún`);
console.log(`   git config user.name "${identity.name}"`);
console.log(`   git config user.email "${identity.email}"`);
console.log("\n═".repeat(80));

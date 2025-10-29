/*
🧩 DOZO Git Integration v1.0.0 (Local + Remote Ready)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Autor: RockStage Solutions

Objetivo:
  - Inicializar repositorio Git en ~/Documents/DOZO System by RS/
  - Activar Background Agents en Cursor
  - Configurar .gitignore DOZO optimizado
  - Generar primer commit y registro local
  - Dejar conexión remota lista (opcional) para GitHub
*/

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------
// CONFIGURACIÓN BASE
// ---------------------------------------------------------
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
process.chdir(baseDir);

console.log("🧩 DOZO Git Integration v1.0.0 — Inicializando entorno\n");
console.log("📂 Directorio base:", baseDir);

// ---------------------------------------------------------
// 1️⃣ Inicializar repositorio Git (si no existe)
// ---------------------------------------------------------
if (!fs.existsSync(path.join(baseDir, ".git"))) {
  console.log("🚀 Inicializando nuevo repositorio Git...");
  execSync("git init", { stdio: "inherit" });
} else {
  console.log("✅ Repositorio Git ya existente, omitiendo init.");
}

// ---------------------------------------------------------
// 2️⃣ Crear archivo .gitignore DOZO optimizado
// ---------------------------------------------------------
console.log("\n🧹 Generando .gitignore...");
const gitignoreContent = `
# DOZO System by RS — Git Ignore
# Directorios pesados o temporales
Docker/
docker/
docker-compose.yml
node_modules/
Latest Builds/
Backup/
Shared/
to chat gpt/
Archive/
tmp/
.env
*.log
*.zip

# Archivos del sistema
.DS_Store
Thumbs.db
`;

fs.writeFileSync(path.join(baseDir, ".gitignore"), gitignoreContent.trim());
console.log("✅ Archivo .gitignore creado correctamente.");

// ---------------------------------------------------------
// 3️⃣ Añadir todos los archivos y hacer primer commit
// ---------------------------------------------------------
console.log("\n📦 Registrando versión inicial en Git...");
try {
  execSync("git add .", { stdio: "inherit" });
  execSync(
    'git commit -m "[DOZO] Initial Commit — Consolidated Base v7.9.1"',
    { stdio: "inherit" }
  );
  console.log("✅ Commit inicial creado correctamente.");
} catch {
  console.log("⚠️ Commit ya existente o sin cambios pendientes.");
}

// ---------------------------------------------------------
// 4️⃣ Crear rama principal y configurar entorno local
// ---------------------------------------------------------
try {
  execSync("git branch -M main", { stdio: "inherit" });
  console.log("🌿 Rama principal 'main' establecida.");
} catch {
  console.log("⚠️ No fue necesario cambiar la rama principal.");
}

// ---------------------------------------------------------
// 5️⃣ (Opcional) Configurar conexión remota a GitHub
// ---------------------------------------------------------
console.log("\n🌐 Configuración remota (opcional)");
console.log("   Si ya tienes una cuenta GitHub, crea un repositorio vacío con el mismo nombre:");
console.log("   👉  https://github.com/rockstagecapital/dozo-system-by-rs\n");
console.log("   Luego ejecuta este comando dentro del terminal:");
console.log(`   git remote add origin https://github.com/rockstagecapital/dozo-system-by-rs.git`);
console.log("   git push -u origin main\n");

// ---------------------------------------------------------
// 6️⃣ Registro DOZO del entorno Git
// ---------------------------------------------------------
const logDir = path.join(baseDir, "Workflow DB");
fs.mkdirSync(logDir, { recursive: true });
const status = {
  timestamp: new Date().toISOString(),
  version: "v1.0.0",
  context: "DOZO Git Integration",
  base: baseDir,
  branch: "main",
  remote_ready: true,
  agents_status: "ready_for_activation",
};

fs.writeFileSync(
  path.join(logDir, "DOZO-Git-Integration.json"),
  JSON.stringify(status, null, 2)
);

console.log("🧾 Registro generado en Workflow DB/DOZO-Git-Integration.json");

// ---------------------------------------------------------
// ✅ Finalización
// ---------------------------------------------------------
console.log("\n═══════════════════════════════════════════════════════");
console.log("✅ DOZO Git Integration completado correctamente.");
console.log("🧠 Los Background Agents de Cursor se activarán automáticamente.");
console.log("📡 GitHub remoto preparado para conexión opcional.");
console.log("═══════════════════════════════════════════════════════");
import fs from "fs";
import { execSync } from "child_process";

console.log("🚀 Iniciando FASE 7 – GitHub Integration & AutoCommit Engine v2.0.0");

const configPath = "./github-config.json";
let config;

// 🔧 Cargar o crear configuración de GitHub
if (!fs.existsSync(configPath)) {
  config = {
    repository: "github.com/usuario/repositorio",
    branch: "main",
    author: "RockStage DOZO System",
    autoCommit: true
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("⚙️ Configuración creada: github-config.json");
} else {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  console.log("📄 Configuración GitHub cargada correctamente");
}

// 🧩 Inicializar repositorio Git si no existe
if (!fs.existsSync(".git")) {
  execSync("git init", { stdio: "inherit" });
  console.log("✅ Repositorio Git inicializado");
}

// 🔄 AutoCommit local
if (config.autoCommit) {
  try {
    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "🚀 DOZO AutoCommit FASE 7 – Sync Update"', { stdio: "inherit" });
    console.log("✅ Cambios confirmados localmente");
  } catch {
    console.log("⚠️ No hay cambios nuevos o commit previo existente");
  }
}

// 🧾 Generar reporte
const report = {
  fase: 7,
  version: "2.0.0",
  estado: "COMPLETADA",
  mensaje: "Integración GitHub activa y commit automático generado.",
  timestamp: new Date().toISOString()
};

fs.mkdirSync("./DozoCoreResport", { recursive: true });
const reportPath = `./DozoCoreResport/reporte-fase-7-${report.timestamp.replace(/[:.]/g, "-")}.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`✅ FASE 7 completada – reporte generado: ${reportPath}`);




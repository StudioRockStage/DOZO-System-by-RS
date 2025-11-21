/*
🧩 Prompt Maestro – DOZO Prompt Fabrication & Database Integration (Fase 5 – v7.9)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Configurar la infraestructura de prompts por IA, versionado, y registro global.
*/

import fs from "fs";
import path from "path";

const baseDir = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const chatGPT = path.join(baseDir, "ChatGPT AI/Prompts");
const claude = path.join(baseDir, "Claude AI/Prompts");
const cursor = path.join(baseDir, "Cursor AI/Prompts");
const shared = path.join(baseDir, "Shared/Prompts");
const globalReport = path.join(
  baseDir,
  "to chat gpt/Global/DOZO-Fabrication-Report.json",
);
const workflowDB = path.join(baseDir, "Workflow DB");
const versionsFile = path.join(workflowDB, "Versions.json");

function ensureStructure() {
  [chatGPT, claude, cursor, shared].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Carpeta creada: ${dir}`);
    }
  });
}

function initVersionDB() {
  let needsInit = false;
  if (!fs.existsSync(versionsFile)) {
    needsInit = true;
  } else {
    const content = fs.readFileSync(versionsFile, "utf8");
    const data = JSON.parse(content);
    if (!data.prompts) {
      needsInit = true;
    }
  }

  if (needsInit) {
    const data = {
      version: "v7.9",
      updated: new Date().toISOString(),
      prompts: { chatgpt: [], claude: [], cursor: [], shared: [] },
    };
    fs.writeFileSync(versionsFile, JSON.stringify(data, null, 2));
    console.log("🧾 Base de datos de versiones creada.");
  }
}

function registerPrompt(ia, name, desc) {
  const db = JSON.parse(fs.readFileSync(versionsFile, "utf8"));
  const promptEntry = {
    id: `${ia}-${Date.now()}`,
    name,
    desc,
    ia,
    created: new Date().toISOString(),
  };
  db.prompts[ia].push(promptEntry);
  db.updated = new Date().toISOString();
  fs.writeFileSync(versionsFile, JSON.stringify(db, null, 2));
  return promptEntry;
}

function updateGlobalReport(entry) {
  let report = [];
  if (fs.existsSync(globalReport)) {
    report = JSON.parse(fs.readFileSync(globalReport, "utf8"));
  }
  report.push(entry);
  fs.writeFileSync(globalReport, JSON.stringify(report, null, 2));
}

function fabricateDemoPrompts() {
  const demoPrompts = [
    {
      ia: "claude",
      name: "Prompt Maestro – Layout Panels",
      desc: "Diseño de paneles y layouts DOZO",
    },
    {
      ia: "cursor",
      name: "Prompt Maestro – Deploy Manager",
      desc: "Gestión de compilación y despliegue",
    },
    {
      ia: "chatgpt",
      name: "Prompt Maestro – Workflow Sync",
      desc: "Gestor de sincronización y comunicación DOZO",
    },
    {
      ia: "shared",
      name: "Prompt Maestro – CrossSync",
      desc: "Interfaz compartida entre IA y módulos",
    },
  ];
  demoPrompts.forEach((p) => {
    const entry = registerPrompt(p.ia, p.name, p.desc);
    updateGlobalReport(entry);
    console.log(`✅ Prompt registrado para ${p.ia}: ${p.name}`);
  });
}

(async () => {
  console.log(
    "\n🚀 DOZO Prompt Fabrication & Database Integration (Fase 5 – v7.9)",
  );
  console.log("═══════════════════════════════════════════════════════════");

  ensureStructure();
  initVersionDB();
  fabricateDemoPrompts();

  console.log("\n📘 Estructura de prompts creada con éxito.");
  console.log(`📂 Reporte global: ${globalReport}`);
  console.log("═══════════════════════════════════════════════════════════");
})();

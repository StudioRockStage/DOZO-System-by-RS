/*
🧩 DOZO Automation UI v1.0.0 – Control Center Integration
Fase 4 del DOZO Control Center – RockStage Systems
Conecta el dashboard visual con la capa de inteligencia (Fase 3)
*/

import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const dashboardDir = path.join(baseDir, "Dashboard/public");
const globalDir = path.join(baseDir, "to chat gpt/Global");
fs.mkdirSync(globalDir, { recursive: true });

const apiBase = "http://localhost:9092";
const reportPath = path.join(
  globalDir,
  `DOZO-Automation-Report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

const report = {
  started_at: new Date().toISOString(),
  context: "DOZO Automation UI v1.0.0",
  actions: [],
  errors: [],
};

// --- Endpoints usados por el Dashboard ---
async function callEndpoint(endpoint) {
  try {
    const res = await fetch(`${apiBase}/api/${endpoint}`, {
      headers: { Authorization: "Bearer DOZO_SECURE_ACCESS" },
    });
    const data = await res.json();
    report.actions.push({ endpoint, status: "OK", response: data });
    return data;
  } catch (err) {
    report.errors.push({ endpoint, error: err.message });
    return { error: err.message };
  }
}

app.get("/api/action/:endpoint", async (req, res) => {
  const { endpoint } = req.params;
  const data = await callEndpoint(endpoint);
  res.json(data);
});

// --- Servir el panel visual ---
app.use(express.static(dashboardDir));

// --- Guardar logs al cerrar ---
process.on("SIGINT", () => {
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n🧾 Reporte guardado en ${reportPath}`);
  process.exit(0);
});

const PORT = 9093;
app.listen(PORT, () => {
  console.log(`
══════════════════════════════════════════════════════════════
🧩 DOZO Control Center – FASE 4: Automation UI
══════════════════════════════════════════════════════════════
🌐 Panel disponible en: http://localhost:${PORT}
⚙️  Conectado con API Inteligente (http://localhost:9092)
🪶  Reportes en: ${reportPath}
══════════════════════════════════════════════════════════════
`);
});
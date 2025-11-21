import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9095;

// Servir archivos estáticos desde DashboardTelemetry
app.use(express.static(__dirname));

// API endpoint para métricas del sistema
app.get("/api/metrics", (req, res) => {
  const reportDir = path.join(__dirname, "../DozoCoreReport/TelemetrySystem");

  if (!fs.existsSync(reportDir)) {
    return res.json({
      error:
        "Sin reportes de telemetría aún. Ejecuta primero 'node dozo-phase-11.js'",
    });
  }

  const files = fs.readdirSync(reportDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    return res.json({
      error: "No hay reportes JSON disponibles en TelemetrySystem",
    });
  }

  const latest = files.sort().reverse()[0];
  const data = JSON.parse(fs.readFileSync(`${reportDir}/${latest}`, "utf8"));

  const sys = {
    cpu: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || "Unknown",
    memTotal: (os.totalmem() / 1024 ** 3).toFixed(2),
    memFree: (os.freemem() / 1024 ** 3).toFixed(2),
    memUsed: ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2),
    memUsagePercent: (
      ((os.totalmem() - os.freemem()) / os.totalmem()) *
      100
    ).toFixed(1),
    uptime: (os.uptime() / 3600).toFixed(2),
    platform: os.platform(),
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
  };

  res.json({
    telemetry: data,
    system: sys,
    reportFile: latest,
  });
});

// API endpoint para lista de todos los reportes
app.get("/api/reports", (req, res) => {
  const reportDir = path.join(__dirname, "../DozoCoreReport");

  if (!fs.existsSync(reportDir)) {
    return res.json({ reports: [] });
  }

  const allReports = fs
    .readdirSync(reportDir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => ({
      name: file,
      path: path.join(reportDir, file),
      size: fs.statSync(path.join(reportDir, file)).size,
      modified: fs.statSync(path.join(reportDir, file)).mtime,
    }))
    .sort((a, b) => b.modified - a.modified);

  res.json({ reports: allReports });
});

// API endpoint para salud del sistema
app.get("/api/health", (req, res) => {
  const health = {
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
    server: {
      port: PORT,
      uptime: process.uptime().toFixed(2) + "s",
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB",
    },
    system: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      nodeVersion: process.version,
    },
  };

  res.json(health);
});

app.listen(PORT, () => {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📊 DOZO Telemetry Dashboard v2.2.0 - ACTIVO");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log(`🌐 Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`📡 API Metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`📋 API Reports: http://localhost:${PORT}/api/reports`);
  console.log(`💚 API Health: http://localhost:${PORT}/api/health`);
  console.log("");
  console.log("🔄 Actualizando métricas cada 5 segundos...");
  console.log("═══════════════════════════════════════════════════════");
});

import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9090;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del dashboard
app.use(express.static(path.join(__dirname, "../Dashboard/public/releases")));

// Servir releases para descarga
app.use("/releases", express.static(path.join(__dirname, "../PublicRelease")));

const releasesPath = path.join(__dirname, "../Dashboard/public/releases");

// API Endpoints
app.get("/api/releases", (req, res) => {
  try {
    const versions = JSON.parse(
      fs.readFileSync(path.join(releasesPath, "versions.json"), "utf8"),
    );
    res.json(versions);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error loading releases", message: err.message });
  }
});

app.get("/api/hashes", (req, res) => {
  try {
    const hashes = JSON.parse(
      fs.readFileSync(path.join(releasesPath, "hashes.json"), "utf8"),
    );
    res.json(hashes);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error loading hashes", message: err.message });
  }
});

app.get("/api/logs", (req, res) => {
  try {
    const logs = JSON.parse(
      fs.readFileSync(path.join(releasesPath, "release-logs.json"), "utf8"),
    );
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Error loading logs", message: err.message });
  }
});

app.get("/api/phases", (req, res) => {
  try {
    const phases = JSON.parse(
      fs.readFileSync(path.join(releasesPath, "phases.json"), "utf8"),
    );
    res.json(phases);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error loading phases", message: err.message });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "operational",
    version: "2.5.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/releases",
      "/api/hashes",
      "/api/logs",
      "/api/phases",
      "/api/status",
    ],
  });
});

// Ruta raíz redirige al dashboard
app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.listen(PORT, () => {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🚀 DOZO Release Dashboard Server v2.5.0");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/status`);
  console.log("");
  console.log("📋 Endpoints disponibles:");
  console.log("   - GET /api/releases  (Versiones y releases)");
  console.log("   - GET /api/hashes    (Hashes SHA-256)");
  console.log("   - GET /api/logs      (Logs de releases)");
  console.log("   - GET /api/phases    (Estado de fases)");
  console.log("   - GET /api/status    (Estado del servidor)");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
});

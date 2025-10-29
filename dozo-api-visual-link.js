/*
🧩 DOZO Control Center – FASE 2: API & Visual Link v1.0.0
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Objetivo:
  1️⃣ Conectar el panel DOZO Dashboard (HTML generado por Claude) con la API local Node.js.
  2️⃣ Exponer endpoints seguros: /api/logs, /api/health, /api/plugins, /api/snapshots.
  3️⃣ Permitir que el Dashboard muestre datos en tiempo real (builds, reportes, validaciones).
  4️⃣ Validar acceso, rutas y sincronización entre carpetas:
      - to chat gpt/Global/
      - Archive/SessionLogs/
      - Workflow DB/
  5️⃣ Generar DOZO-APILink-Report.json con estado, logs y resultados de la fase.

📂 Ruta recomendada: ~/Documents/DOZO System by RS/dozo-api-visual-link.js
📡 Ejecución: node dozo-api-visual-link.js
*/

import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 9091;

// ─────────────────────────────────────────────────────────────
// 🔧 Configuración base
// ─────────────────────────────────────────────────────────────
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const globalDir = path.join(baseDir, 'to chat gpt', 'Global');
const sessionDir = path.join(baseDir, 'Archive', 'SessionLogs');
const workflowDir = path.join(baseDir, 'Workflow DB');
const dashboardDir = path.join(baseDir, 'Dashboard', 'public');
const reportPath = path.join(globalDir, `DOZO-APILink-Report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

app.use(cors());
app.use(express.static(dashboardDir));
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// 🧩 Funciones auxiliares
// ─────────────────────────────────────────────────────────────
function listFilesRecursively(dir, ext = '.json') {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files.push(...listFilesRecursively(full, ext));
    else if (full.endsWith(ext)) files.push(full);
  }
  return files;
}

// ─────────────────────────────────────────────────────────────
// 🌐 Endpoints API
// ─────────────────────────────────────────────────────────────

// 1️⃣ Reportes DOZO (Consolidation, Compliance, etc.)
app.get('/api/logs', (req, res) => {
  const globalReports = listFilesRecursively(globalDir);
  const sessionReports = listFilesRecursively(sessionDir);
  const allReports = [...globalReports, ...sessionReports].map(f => ({
    name: path.basename(f),
    path: f,
    modified: fs.statSync(f).mtime,
  }));
  res.json({ count: allReports.length, reports: allReports });
});

// 2️⃣ Estado del sistema y salud
app.get('/api/health', (req, res) => {
  const healthFile = path.join(workflowDir, 'DOZO-Health.json');
  let status = {};
  if (fs.existsSync(healthFile)) {
    try {
      status = JSON.parse(fs.readFileSync(healthFile, 'utf8'));
    } catch {
      status = { status: 'corrupt', message: 'No se pudo leer DOZO-Health.json' };
    }
  }
  res.json({
    status: status.status || 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 3️⃣ Plugins activos
app.get('/api/plugins', (req, res) => {
  const pluginsDir = path.join(baseDir, 'Plugins');
  const plugins = fs.existsSync(pluginsDir)
    ? fs.readdirSync(pluginsDir).filter(n => !n.startsWith('.'))
    : [];
  res.json({ plugins });
});

// 4️⃣ Snapshots y backups
app.get('/api/snapshots', (req, res) => {
  const backupDir = path.join(baseDir, 'Backup', 'Pre-ControlCenter');
  const snapshots = fs.existsSync(backupDir)
    ? fs.readdirSync(backupDir).map(f => ({
        name: f,
        created: fs.statSync(path.join(backupDir, f)).mtime,
      }))
    : [];
  res.json({ count: snapshots.length, snapshots });
});

// ─────────────────────────────────────────────────────────────
// 🧠 Reporte de instalación y vinculación
// ─────────────────────────────────────────────────────────────
const report = {
  started_at: new Date().toISOString(),
  context: 'DOZO Control Center – FASE 2: API & Visual Link',
  status: 'in_progress',
  endpoints: {
    logs: '/api/logs',
    health: '/api/health',
    plugins: '/api/plugins',
    snapshots: '/api/snapshots',
  },
  dashboard: 'http://localhost:9091',
  verified_folders: {
    globalDir: fs.existsSync(globalDir),
    sessionDir: fs.existsSync(sessionDir),
    workflowDir: fs.existsSync(workflowDir),
  },
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// ─────────────────────────────────────────────────────────────
// 🚀 Iniciar servidor
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('🧩 DOZO Control Center – FASE 2: API & Visual Link');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`🌐 Dashboard disponible en: http://localhost:${PORT}`);
  console.log('📊 API Endpoints:');
  console.log(`   • Logs → http://localhost:${PORT}/api/logs`);
  console.log(`   • Health → http://localhost:${PORT}/api/health`);
  console.log(`   • Plugins → http://localhost:${PORT}/api/plugins`);
  console.log(`   • Snapshots → http://localhost:${PORT}/api/snapshots`);
  console.log('📁 Serviendo archivos desde:', dashboardDir);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('💾 Reporte generado en:', reportPath);
  console.log('══════════════════════════════════════════════════════════════');
});
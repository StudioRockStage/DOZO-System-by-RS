/*
🧩 DOZO Control Center – FASE 3: Intelligence Layer v1.0.0 (Smart Automation)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Objetivo:
  1️⃣ Añadir capa de inteligencia y automatización al Control Center.
  2️⃣ Permitir que el Dashboard ejecute acciones: rollback, validation, deploy, cleanup.
  3️⃣ Integrar lógica de seguridad (autorización básica + validación DOZO).
  4️⃣ Generar DOZO-Intelligence-Report.json con resultados de ejecución.
  5️⃣ Preparar endpoints para futuras fases (plugins externos, autosync, GitOps).
📂 Ruta recomendada: ~/Documents/DOZO System by RS/dozo-intelligence-layer.js
📡 Ejecución: node dozo-intelligence-layer.js
*/

import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = 9092;

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const globalDir = path.join(baseDir, 'to chat gpt', 'Global');
const workflowDir = path.join(baseDir, 'Workflow DB');
const reportsDir = path.join(baseDir, 'Archive', 'SessionLogs');
const latestBuildsDir = path.join(
  baseDir,
  'Latest Builds',
  'Warranty System RS'
);
const reportPath = path.join(
  globalDir,
  `DOZO-Intelligence-Report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
);

app.use(cors());
app.use(express.json());

const AUTH_TOKEN = 'DOZO_SECURE_ACCESS';

// 🧠 Helper para escribir reportes
function writeReport(entry) {
  const log = { timestamp: new Date().toISOString(), ...entry };
  fs.writeFileSync(reportPath, JSON.stringify(log, null, 2));
  console.log('🧩 Registro:', log);
  return log;
}

// 🔒 Middleware de autenticación simple
app.use((req, res, next) => {
  const token = req.headers['x-dozo-token'];
  if (token !== AUTH_TOKEN)
    return res.status(403).json({ error: 'Acceso no autorizado' });
  next();
});

// ────────────────────────────────────────────────
// ⚙️ ENDPOINT: Ejecutar validación
// ────────────────────────────────────────────────
app.post('/api/validate', (req, res) => {
  try {
    const { target } = req.body;
    const zip = path.join(latestBuildsDir, 'warranty-system-rs.zip');
    if (!fs.existsSync(zip))
      throw new Error('No se encontró ZIP para validar.');

    execSync(`unzip -t "${zip}"`);
    writeReport({ action: 'validate', status: 'OK', target });
    res.json({ result: 'Validación exitosa', target });
  } catch (e) {
    writeReport({ action: 'validate', status: 'ERROR', message: e.message });
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────
// 🔁 ENDPOINT: Rollback seguro
// ────────────────────────────────────────────────
app.post('/api/rollback', (req, res) => {
  try {
    const backupsDir = path.join(baseDir, 'Backup', 'Pre-ControlCenter');
    const folders = fs.readdirSync(backupsDir);
    const lastBackup = folders.sort().reverse()[0];
    if (!lastBackup) throw new Error('No hay snapshots disponibles.');
    const src = path.join(backupsDir, lastBackup);
    execSync(`cp -R "${src}/." "${baseDir}/"`);
    writeReport({ action: 'rollback', status: 'OK', backup: lastBackup });
    res.json({ result: 'Rollback completado', backup: lastBackup });
  } catch (e) {
    writeReport({ action: 'rollback', status: 'ERROR', message: e.message });
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────
// 🚀 ENDPOINT: Deploy local
// ────────────────────────────────────────────────
app.post('/api/deploy', (req, res) => {
  try {
    const zip = path.join(latestBuildsDir, 'warranty-system-rs.zip');
    if (!fs.existsSync(zip)) throw new Error('ZIP no encontrado.');
    execSync(`echo "Simulando instalación desde ${zip}"`);
    writeReport({ action: 'deploy', status: 'OK' });
    res.json({ result: 'Deploy simulado correctamente' });
  } catch (e) {
    writeReport({ action: 'deploy', status: 'ERROR', message: e.message });
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────
// 🧹 ENDPOINT: Limpieza del entorno
// ────────────────────────────────────────────────
app.post('/api/cleanup', (req, res) => {
  try {
    const tempDirs = ['TEMP', 'TMP', 'Cache', 'to chat gpt'];
    for (const dir of tempDirs) {
      const full = path.join(baseDir, dir);
      if (fs.existsSync(full)) execSync(`rm -rf "${full}"`);
    }
    writeReport({ action: 'cleanup', status: 'OK' });
    res.json({ result: 'Limpieza completada' });
  } catch (e) {
    writeReport({ action: 'cleanup', status: 'ERROR', message: e.message });
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────
// 🧭 ENDPOINT: Estado del sistema
// ────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ACTIVE',
    uptime: process.uptime(),
    version: '1.0.0',
    endpoints: [
      '/api/validate',
      '/api/rollback',
      '/api/deploy',
      '/api/cleanup',
    ],
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('🧩 DOZO Control Center – FASE 3: Intelligence Layer v1.0.0');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`🌐 API activa en: http://localhost:${PORT}`);
  console.log('🔐 Token requerido: DOZO_SECURE_ACCESS');
  console.log('📦 Endpoints: validate, rollback, deploy, cleanup, status');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('💾 Reporte generado en:', reportPath);
  console.log('══════════════════════════════════════════════════════════════');
});

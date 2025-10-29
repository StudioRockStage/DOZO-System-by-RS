/*
🧩 DOZO GitHub Bridge v1.0.0 (Repository Sync & Remote Push)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Proyecto: DOZO System — StudioRockStage Sync Edition
Objetivo:
  - Inicializar repositorio Git local dentro de DOZO System by RS.
  - Conectar con GitHub (privado o público).
  - Realizar commit inicial y push remoto.
  - Registrar la URL remota en Workflow DB.
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ---------------------------------------------------------
// CONFIGURACIÓN BASE
// ---------------------------------------------------------
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const workflowDB = path.join(baseDir, 'Workflow DB');
const reportPath = path.join(baseDir, 'to chat gpt', 'Global', `DOZO-GitHubBridge-Report-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const report = {
  started_at: new Date().toISOString(),
  context: 'DOZO GitHub Bridge v1.0.0',
  actions: [],
  warnings: [],
  errors: []
};

function step(title, fn) {
  console.log(`\n▶ ${title}`);
  try {
    fn();
    report.actions.push({ step: title, status: 'OK' });
  } catch (e) {
    console.error(`✗ Error en ${title}:`, e.message);
    report.errors.push({ step: title, error: e.message });
  }
}

// ---------------------------------------------------------
// 1️⃣ Inicializar repositorio local
// ---------------------------------------------------------
step('Inicializando repositorio Git local', () => {
  if (!fs.existsSync(path.join(baseDir, '.git'))) {
    execSync('git init', { cwd: baseDir, stdio: 'inherit' });
    execSync('git checkout -b main', { cwd: baseDir, stdio: 'inherit' });
  }
});

// ---------------------------------------------------------
// 2️⃣ Configurar identidad local
// ---------------------------------------------------------
step('Configurando identidad local Git', () => {
  execSync('git config user.name "StudioRockStage"', { cwd: baseDir });
  execSync('git config user.email "dev@studiorockstage.com"', { cwd: baseDir });
});

// ---------------------------------------------------------
// 3️⃣ Crear archivos base si faltan
// ---------------------------------------------------------
step('Creando archivos base (.gitignore, README.md)', () => {
  const gitignore = path.join(baseDir, '.gitignore');
  const readme = path.join(baseDir, 'README.md');
  if (!fs.existsSync(gitignore)) fs.writeFileSync(gitignore, 'node_modules/\n.DS_Store\nBackup/\nLatest Builds/\nto chat gpt/\n');
  if (!fs.existsSync(readme)) fs.writeFileSync(readme, '# DOZO System by RockStage\nAutomated Plugin Development Ecosystem');
});

// ---------------------------------------------------------
// 4️⃣ Añadir y hacer commit inicial
// ---------------------------------------------------------
step('Realizando commit inicial', () => {
  execSync('git add .', { cwd: baseDir });
  execSync('git commit -m "Initial Commit — DOZO GitHub Bridge v1.0.0 (StudioRockStage)"', { cwd: baseDir, stdio: 'inherit' });
});

// ---------------------------------------------------------
// 5️⃣ Configurar remoto y subir a GitHub
// ---------------------------------------------------------
step('Configurando conexión remota', () => {
  const remoteURL = 'https://github.com/StudioRockStage/dozo-system.git';
  try {
    execSync('git remote remove origin', { cwd: baseDir, stdio: 'ignore' });
  } catch {}
  execSync(`git remote add origin ${remoteURL}`, { cwd: baseDir });
  execSync('git push -u origin main', { cwd: baseDir, stdio: 'inherit' });
  report.actions.push({ remote_connected: true, remote_url: remoteURL });
});

// ---------------------------------------------------------
// 6️⃣ Registrar enlace remoto en Workflow DB
// ---------------------------------------------------------
step('Registrando URL remota en Workflow DB', () => {
  fs.mkdirSync(workflowDB, { recursive: true });
  const remoteLink = { repository: 'StudioRockStage/dozo-system', url: 'https://github.com/StudioRockStage/dozo-system', synced_at: new Date().toISOString() };
  fs.writeFileSync(path.join(workflowDB, 'RemoteLink.json'), JSON.stringify(remoteLink, null, 2));
});

// ---------------------------------------------------------
// ✅ Guardar reporte final
// ---------------------------------------------------------
report.finished_at = new Date().toISOString();
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Sincronización completada.`);
console.log(`🧾 Reporte: ${reportPath}`);
console.log(`🔗 Repositorio remoto: https://github.com/StudioRockStage/dozo-system`);
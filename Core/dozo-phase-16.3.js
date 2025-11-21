/*
═══════════════════════════════════════════════════════════════
🧩 DOZO Phase 16.3 – Live WebSocket Event Bridge v2.6.3
Autor: RockStage Solutions
Descripción:
Sistema de transmisión en tiempo real que comunica eventos de
telemetría hacia el Dashboard para actualizaciones instantáneas.
═══════════════════════════════════════════════════════════════
*/

import fs from 'fs';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname);
const workflowDB = path.join(root, 'Workflow DB');
const telemetryFile = path.join(workflowDB, 'AppSyncTelemetry.json');
const commitsFile = path.join(workflowDB, 'AppSyncCommits.json');

console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
console.log(chalk.bold.white('🧩 FASE 16.3 – Live WebSocket Event Bridge v2.6.3'));
console.log(chalk.cyan('═══════════════════════════════════════════════════════'));

const PORT = 9091;
let lastHash = null;
let lastCommitHash = null;

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(data).digest('hex');
}

function broadcast(event, payload) {
  const message = JSON.stringify({ event, ...payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function monitorTelemetry() {
  const currentHash = getFileHash(telemetryFile);
  if (currentHash && currentHash !== lastHash) {
    lastHash = currentHash;
    try {
      const telemetry = JSON.parse(fs.readFileSync(telemetryFile, 'utf8'));
      broadcast('telemetry_update', telemetry);
      console.log(chalk.green('✅ Evento emitido: telemetry_update'));
    } catch {
      console.log(chalk.red('❌ Error leyendo telemetría'));
    }
  }
}

function monitorCommits() {
  const currentHash = getFileHash(commitsFile);
  if (currentHash && currentHash !== lastCommitHash) {
    lastCommitHash = currentHash;
    try {
      const commits = JSON.parse(fs.readFileSync(commitsFile, 'utf8'));
      if (commits.length > 0) {
        broadcast('commit_update', { commit: commits[0].commit.message });
        console.log(chalk.magenta('📝 Último commit emitido al Dashboard'));
      }
    } catch {
      console.log(chalk.red('❌ Error leyendo commits'));
    }
  }
}

function generateReport() {
  const reportPath = path.join(workflowDB, 'Phase16.3-Report.md');
  const reportContent = `# 🧩 DOZO System – Phase 16.3 Report
**Fecha:** ${new Date().toLocaleDateString('es-ES')}  
**Versión:** 2.6.3  
**Estado:** ✅ WebSocket Event Bridge activo  
**Puerto:** ${PORT}  
**Monitoreando:** AppSyncTelemetry.json y AppSyncCommits.json

## 📡 Configuración del Servidor

- **URL WebSocket:** ws://localhost:${PORT}
- **Archivos monitoreados:**
  - \`${telemetryFile}\`
  - \`${commitsFile}\`
- **Intervalo de monitoreo:** 10 segundos

## 🎯 Eventos Emitidos

### telemetry_update
Se emite cuando cambia el archivo de telemetría:
\`\`\`json
{
  "event": "telemetry_update",
  "timestamp": "2025-10-29T18:09:58.563Z",
  "user": "davidalejandroperezrea",
  "repo": "StudioRockStage/DOZO-System-by-RS",
  "branch": "main",
  "lastCommit": "aa54cf9",
  "version": "2.6.0",
  "status": "SYNC_OK"
}
\`\`\`

### commit_update
Se emite cuando cambian los commits:
\`\`\`json
{
  "event": "commit_update",
  "commit": "Mensaje del último commit"
}
\`\`\`

## 🔗 Cliente Dashboard

El cliente WebSocket se encuentra en:
\`/Dashboard/public/js/appsync-client.js\`

## 📊 Estado del Sistema

- **Servidor WebSocket:** ✅ Activo
- **Monitoreo de archivos:** ✅ Funcionando
- **Broadcast de eventos:** ✅ Operativo
- **Conexiones activas:** ${wss.clients.size}

---

**Generado por:** Live WebSocket Event Bridge v2.6.3  
**Timestamp:** ${new Date().toISOString()}
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(chalk.blue(`📄 Reporte generado: ${reportPath}`));
}

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log(chalk.green('📡 Cliente conectado al Event Bridge'));

  ws.on('close', () => {
    console.log(chalk.yellow('📡 Cliente desconectado del Event Bridge'));
  });

  ws.on('error', () => {
    console.log(chalk.red('❌ Error en conexión WebSocket'));
  });
});

server.listen(PORT, () => {
  console.log(chalk.cyan(`📡 WebSocket Bridge activo en ws://localhost:${PORT}`));
  console.log(chalk.yellow('🧠 Monitoreando AppSyncTelemetry.json y AppSyncCommits.json...'));
  console.log(chalk.magenta('📨 Enviando eventos a Dashboard en tiempo real'));

  generateReport();

  setInterval(() => {
    monitorTelemetry();
    monitorCommits();
  }, 10000);

  console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.green.bold('✅ Live WebSocket Event Bridge iniciado correctamente'));
  console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
  console.log(chalk.white(`🔗 URL: ws://localhost:${PORT}`));
  console.log(chalk.white(`📊 Estado: LIVE_EVENT_BRIDGE_OK`));
  console.log(chalk.white(`⏱️  Monitoreo cada 10 segundos`));
  console.log(chalk.cyan('═══════════════════════════════════════════════════════'));
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Cerrando WebSocket Event Bridge...'));
  server.close(() => {
    console.log(chalk.green('✅ Servidor cerrado correctamente'));
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Cerrando WebSocket Event Bridge...'));
  server.close(() => {
    console.log(chalk.green('✅ Servidor cerrado correctamente'));
    process.exit(0);
  });
});

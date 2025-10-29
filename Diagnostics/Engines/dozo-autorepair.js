/**
 * 🔧 DOZO AutoRepair Engine v2.0.0
 * Aplica correcciones inteligentes y reorganiza archivos dañados o duplicados.
 */
import fs from 'fs';
import path from 'path';

const reportPath = path.resolve('./Diagnostics/Reports/repair-report-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
const summary = [];

function moveToBackup(filePath) {
  const backupDir = './Diagnostics/Backups';
  fs.mkdirSync(backupDir, { recursive: true });
  const newPath = path.join(backupDir, path.basename(filePath));
  fs.renameSync(filePath, newPath);
  summary.push({ file: filePath, action: 'moved', newPath });
}

function cleanDuplicates(dir) {
  const seen = new Set();
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (seen.has(file)) {
      moveToBackup(fullPath);
    } else {
      seen.add(file);
    }
  }
}

function autoRepair(rootDir) {
  const dirs = fs.readdirSync(rootDir);
  for (const dir of dirs) {
    const full = path.join(rootDir, dir);
    if (fs.lstatSync(full).isDirectory()) {
      cleanDuplicates(full);
    }
  }
}

autoRepair('./');
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
console.log('🧾 Reporte de reparación creado en', reportPath);




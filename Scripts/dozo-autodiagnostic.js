/**
 * 🧠 DOZO Autodiagnostic v2.0.0
 * Escanea, analiza e identifica inconsistencias en la estructura del sistema.
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve('.');
const requiredDirs = ['Core', 'Modules', 'Scripts', 'Logs', 'Dashboard/public', 'Reports'];
const missing = requiredDirs.filter(d => !fs.existsSync(path.join(root, d)));

const report = {
  timestamp: new Date().toISOString(),
  status: missing.length === 0 ? 'OK' : 'INCOMPLETO',
  missing,
};

const logPath = path.join(root, 'Reports', `autodiagnostic-${Date.now()}.json`);
fs.writeFileSync(logPath, JSON.stringify(report, null, 2));
console.log('🩺 DOZO Autodiagnostic completado:', report);

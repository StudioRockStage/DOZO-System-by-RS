/**
 * 🧩 DOZO Core Engine v2.0.0
 * Núcleo del sistema que gestiona las fases, IA conectadas y estructura.
 */
import fs from 'fs';
import path from 'path';

export const DOZO = {
  version: '2.0.0',
  initialized: false,
  logFile: path.resolve('./Logs/dozo-core.log'),

  init() {
    this.initialized = true;
    const msg = `[${new Date().toISOString()}] ✅ DOZO Core Engine iniciado (v${this.version})\n`;
    fs.appendFileSync(this.logFile, msg);
    console.log(msg);
  },

  checkStructure() {
    const dirs = [
      'Core', 'Modules', 'Scripts', 'Backups', 'Logs',
      'Reports', 'Dashboard/public', 'DozoCoreResport', 'Integration', 'AI-Link'
    ];
    for (const d of dirs) {
      const p = path.resolve(d);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    }
    fs.appendFileSync(this.logFile, `[${new Date().toISOString()}] 🧱 Estructura verificada y/o creada\n`);
  }
};

DOZO.init();
DOZO.checkStructure();




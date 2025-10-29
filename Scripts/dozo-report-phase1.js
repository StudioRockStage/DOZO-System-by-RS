import fs from 'fs';
import path from 'path';

const reportRoot = path.resolve('DozoCoreResport/CoreSystem');
fs.mkdirSync(reportRoot, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const reportJson = path.join(reportRoot, `reporte-fase-1-${ts}.json`);
const reportMd   = path.join(reportRoot, `reporte-fase-1-${ts}.md`);

const report = {
  fase: '1',
  version: '2.0.0',
  estado: 'COMPLETADA',
  resumen: 'Estructura base creada, módulos inicializados y DOZO Core listo.',
  timestamp: ts
};

fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
fs.writeFileSync(reportMd, `# Reporte Fase 1 — DOZO Core v2.0.0\nEstado: ✅ COMPLETADA\nFecha: ${ts}`);
console.log('🧾 Reporte de fase 1 guardado en', reportRoot);




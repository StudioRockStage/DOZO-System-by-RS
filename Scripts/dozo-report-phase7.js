import fs from 'fs';
import path from 'path';

const reportRoot = path.resolve('DozoCoreResport/GitHubSystem');
fs.mkdirSync(reportRoot, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const reportJson = path.join(reportRoot, `reporte-fase-7-${ts}.json`);
const reportMd = path.join(reportRoot, `reporte-fase-7-${ts}.md`);

const report = {
  fase: '7',
  version: '2.0.0',
  estado: 'COMPLETADA',
  resumen: 'GitHub Integration y AutoCommit Engine implementados exitosamente.',
  timestamp: ts,
};

fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
fs.writeFileSync(
  reportMd,
  `# Reporte Fase 7 — GitHub Integration & AutoCommit Engine\nEstado: ✅ COMPLETADA\nFecha: ${ts}`
);
console.log('🧾 Reporte de fase 7 guardado en', reportRoot);

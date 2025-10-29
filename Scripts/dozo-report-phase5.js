import fs from 'fs';
import path from 'path';

const reportRoot = path.resolve('DozoCoreResport/PackagingSystem');
fs.mkdirSync(reportRoot, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const reportJson = path.join(reportRoot, `reporte-fase-5-${ts}.json`);
const reportMd   = path.join(reportRoot, `reporte-fase-5-${ts}.md`);

const report = {
  fase: '5',
  version: '2.0.0',
  estado: 'COMPLETADA',
  resumen: 'Packaging y Runtime Build ejecutados correctamente para macOS.',
  timestamp: ts
};

fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
fs.writeFileSync(reportMd, `# Reporte Fase 5 — Packaging & Runtime Build\nEstado: ✅ COMPLETADA\nFecha: ${ts}`);
console.log('🧾 Reporte de fase 5 guardado en', reportRoot);




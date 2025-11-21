import fs from 'fs';
import path from 'path';

const reportRoot = path.resolve('DozoCoreResport/SigningSystem');
fs.mkdirSync(reportRoot, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const reportJson = path.join(reportRoot, `reporte-fase-8-${ts}.json`);
const reportMd = path.join(reportRoot, `reporte-fase-8-${ts}.md`);

const report = {
  fase: '8',
  version: '2.0.0',
  estado: 'COMPLETADA',
  resumen: 'App Signing y Validation System implementado exitosamente.',
  timestamp: ts,
};

fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
fs.writeFileSync(
  reportMd,
  `# Reporte Fase 8 — App Signing & Validation\nEstado: ✅ COMPLETADA\nFecha: ${ts}`
);
console.log('🧾 Reporte de fase 8 guardado en', reportRoot);

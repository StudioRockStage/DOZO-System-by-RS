/**
 * 📊 DOZO Report Engine v2.0.0
 * Compila y analiza los reportes generados por las distintas fases.
 */
import fs from 'fs';
import path from 'path';

const reportsRoot = path.resolve('./DozoCoreResport');
const output = [];

function collectReports(dir) {
  if (!fs.existsSync(dir)) {
    console.log('⚠️  Directorio de reportes no encontrado:', dir);
    return;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      collectReports(fullPath);
    } else if (item.name.endsWith('.json')) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        output.push(data);
      } catch (error) {
        console.log('⚠️  Error leyendo reporte:', item.name);
      }
    }
  }
}

collectReports(reportsRoot);

const summary = {
  generated: new Date().toISOString(),
  totalReports: output.length,
  okReports: output.filter(r => r.estado === 'COMPLETADA').length,
  details: output
};

const outputPath = path.join('./AI-Link/Reports', `summary-${Date.now()}.json`);
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
console.log('📈 Report Engine completado. Resumen guardado en', outputPath);




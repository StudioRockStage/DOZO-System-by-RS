import fs from 'fs';
import https from 'https';
import { execSync } from 'child_process';

console.log(
  '🚀 Iniciando FASE 9 – Universal Distribution & Update Bridge v2.0.0'
);

const versionFile = './DistributionBuild/update.json';
const repo = 'RockStageSolutions/DOZO-Control-Center';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportDir = './DozoCoreReport';
fs.mkdirSync(reportDir, { recursive: true });

const reportPath = `${reportDir}/reporte-fase-9-${timestamp}.json`;

const updateData = {
  version: '2.0.0',
  date: timestamp,
  repo,
  autoUpdate: true,
  changelog: 'FASE 9 completada – Auto Update Bridge inicializado',
};

fs.writeFileSync(versionFile, JSON.stringify(updateData, null, 2));
console.log('✅ update.json generado correctamente.');

// Intentar sincronizar con GitHub
try {
  execSync(
    `git add . && git commit -m "🚀 DOZO AutoUpdate FASE 9 – Sync" && git push`,
    {
      stdio: 'inherit',
    }
  );
  console.log('✅ Sincronización GitHub completada.');
} catch {
  console.warn(
    '⚠️ No se pudo conectar o realizar push a GitHub. Requiere token configurado.'
  );
}

// Verificar última versión en GitHub Releases
const options = {
  hostname: 'api.github.com',
  path: `/repos/${repo}/releases/latest`,
  method: 'GET',
  headers: { 'User-Agent': 'DOZO-System' },
};

https
  .get(options, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(
          `📦 Última versión publicada: ${json.tag_name || 'No disponible'}`
        );
        const report = {
          fase: 9,
          version: '2.0.0',
          estado: 'COMPLETADA',
          ultima_version: json.tag_name || 'N/A',
          fecha: timestamp,
        };
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`✅ Reporte FASE 9 generado: ${reportPath}`);
      } catch (e) {
        console.error('❌ Error al analizar respuesta de GitHub:', e);
      }
    });
  })
  .on('error', err => console.error('❌ Error de conexión con GitHub:', err));

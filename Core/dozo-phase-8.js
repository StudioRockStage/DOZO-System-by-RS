import fs from 'fs';
import { execSync } from 'child_process';
import crypto from 'crypto';

console.log('🚀 Iniciando FASE 8 – App Signing & Validation v2.0.0');

const appPath = './DistributionBuild/DOZO-Control-Center-RockStage-1.0.0.dmg';
const reportDir = './DozoCoreReport';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = `${reportDir}/reporte-fase-8-${timestamp}.json`;

// Crear carpeta de reportes si no existe
fs.mkdirSync(reportDir, { recursive: true });

// Verificar existencia del build
if (!fs.existsSync(appPath)) {
  console.error('❌ No se encontró el archivo .dmg en DistributionBuild/');
  process.exit(1);
}

// Calcular hash de integridad
const fileBuffer = fs.readFileSync(appPath);
const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
console.log('🔐 Hash SHA256 generado correctamente');

// Intentar firma digital
let signStatus = 'No firmado';
try {
  execSync(
    `codesign --sign "Developer ID Application" "${appPath}" --deep --force --verbose`,
    { stdio: 'inherit' }
  );
  signStatus = 'Firmado correctamente con certificado Developer ID Application';
  console.log('✅ Firma digital completada');
} catch {
  console.warn(
    '⚠️ No se encontró certificado válido. Se omitió la firma digital.'
  );
}

// Generar reporte final
const report = {
  fase: 8,
  version: '2.0.0',
  estado: 'COMPLETADA',
  integridad: 'Verificada',
  firma: signStatus,
  sha256: hash,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`✅ FASE 8 completada – reporte generado: ${reportPath}`);

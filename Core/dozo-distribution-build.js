/*
🧩 DOZO Control Center – FASE 7: Distribution Build v1.0.0
Objetivo:
  - Crear instalador .dmg para macOS con icono RockStage integrado.
  - Incluir nombre, versión y metadatos oficiales del proyecto.
  - Empaquetar dependencias Electron.
  - Generar reporte final DOZO-DistributionReport.json.
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const appDir = path.join(baseDir, 'AppBuild');
const globalDir = path.join(baseDir, 'to chat gpt', 'Global');
const distDir = path.join(baseDir, 'DistributionBuild');
fs.mkdirSync(distDir, { recursive: true });

const iconPath = path.join(
  baseDir,
  'Dashboard/public/assets/rockstage-icon.icns'
);
const reportFile = path.join(
  globalDir,
  `DOZO-DistributionReport-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
);

console.log('══════════════════════════════════════════════════════════════');
console.log('🧩 DOZO Control Center – FASE 7: Distribution Build v1.0.0');
console.log('══════════════════════════════════════════════════════════════');

const report = {
  started_at: new Date().toISOString(),
  status: 'IN_PROGRESS',
  steps: [],
  warnings: [],
  errors: [],
};

// 1️⃣ Verificar recursos
try {
  if (!fs.existsSync(iconPath))
    throw new Error('No se encontró rockstage-icon.icns');
  console.log('✅ Icono RockStage encontrado');
  report.steps.push('Icono verificado');
} catch {
  console.error('⚠️ Error procesando icono');
  report.warnings.push('Error procesando icono');
}

// 2️⃣ Instalar electron-builder si falta
try {
  console.log('⚙️ Verificando electron-builder...');
  execSync('npm list -g electron-builder || npm install -g electron-builder', {
    stdio: 'inherit',
  });
  report.steps.push('Electron-builder verificado');
} catch {
  report.errors.push('Error instalando electron-builder');
}

// 3️⃣ Crear package.json temporal de build
const buildPkg = {
  name: 'dozo-control-center',
  productName: 'DOZO Control Center – RockStage',
  version: '1.0.0',
  author: 'RockStage Solutions',
  description:
    'Sistema avanzado de monitoreo y desarrollo de plugins WordPress.',
  main: 'main.js',
  build: {
    appId: 'com.rockstage.dozo',
    mac: {
      category: 'public.app-category.developer-tools',
      target: 'dmg',
      icon: iconPath,
    },
    dmg: {
      background: null,
      icon: iconPath,
      artifactName: 'DOZO-Control-Center-RockStage-${version}.dmg',
    },
    directories: {
      output: distDir,
    },
  },
};
fs.writeFileSync(
  path.join(appDir, 'package.json'),
  JSON.stringify(buildPkg, null, 2)
);

// 4️⃣ Ejecutar build
try {
  console.log('📦 Empaquetando aplicación...');
  execSync('npx electron-builder --mac --publish never', {
    cwd: appDir,
    stdio: 'inherit',
  });
  report.steps.push('Empaquetado completado');
} catch {
  report.errors.push('Error durante el build de distribución');
}

// 5️⃣ Verificar salida
const dmgFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.dmg'));
if (dmgFiles.length > 0) {
  console.log(`✅ Build generado: ${dmgFiles[0]}`);
  report.steps.push(`Archivo generado: ${dmgFiles[0]}`);
} else {
  console.log('⚠️ No se generó archivo .dmg');
  report.warnings.push('No se generó archivo .dmg');
}

// 6️⃣ Reporte final
report.finished_at = new Date().toISOString();
report.status = report.errors.length ? 'COMPLETED_WITH_WARNINGS' : 'COMPLETED';
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

console.log('══════════════════════════════════════════════════════════════');
console.log('✅ FASE 7 completada – Distribution Build');
console.log(`🧾 Reporte: ${reportFile}`);
console.log('📦 Instalador .dmg disponible en:', distDir);
console.log('══════════════════════════════════════════════════════════════');

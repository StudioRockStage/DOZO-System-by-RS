// DOZO Env Check - Diagnóstico de entorno
// RockStage Solutions - v2.3.0

console.log('═══════════════════════════════════════════════════════');
console.log('🌐 DOZO Environment Check v2.3.0');
console.log('═══════════════════════════════════════════════════════');
console.log('');

console.log('📋 Información del Sistema:');
console.log('  - Platform:', process.platform);
console.log('  - Architecture:', process.arch);
console.log('  - Node version:', process.version);
console.log('  - Electron version:', process.versions.electron || 'N/A');
console.log('');

console.log('📂 Rutas del Sistema:');
console.log('  - process.cwd():', process.cwd());
console.log('  - __dirname:', __dirname);
console.log('  - process.resourcesPath:', process.resourcesPath);
console.log('  - process.execPath:', process.execPath);
console.log('');

console.log('🔧 Variables de Entorno:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  - HOME:', process.env.HOME || 'undefined');
console.log('  - PWD:', process.env.PWD || 'undefined');
console.log('');

const fs = require('fs');
const path = require('path');

console.log('📁 Verificación de Archivos Críticos:');

const criticalFiles = [
  '../Dashboard/public/index.html',
  'public/index.html',
  'assets/rockstage-icon.icns',
  'main.js',
  'electron-main.js'
];

criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`      Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('Diagnóstico completado');
console.log('═══════════════════════════════════════════════════════');

module.exports = {
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  cwd: process.cwd(),
  dirname: __dirname,
  resourcesPath: process.resourcesPath
};



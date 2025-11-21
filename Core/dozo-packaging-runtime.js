/*
🧩 DOZO Control Center – FASE 5: Packaging & Runtime Build v1.0.0
Convierte el ecosistema DOZO en una aplicación macOS (Electron App)
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const appDir = path.join(baseDir, 'AppBuild');
fs.mkdirSync(appDir, { recursive: true });

console.log('══════════════════════════════════════════════════════════════');
console.log('🧩 DOZO Control Center – FASE 5: Packaging & Runtime Build');
console.log('══════════════════════════════════════════════════════════════');

// 1️⃣ Verificar dependencias
console.log('📦 Verificando dependencias Electron...');
try {
  execSync('npm list -g electron', { stdio: 'ignore' });
} catch {
  execSync('npm install -g electron@28', { stdio: 'inherit' });
}

// 2️⃣ Estructura básica Electron
console.log('🧱 Creando estructura base Electron...');
const pkg = {
  name: 'dozo-control-center',
  version: '1.0.0',
  main: 'main.js',
  type: 'module',
  scripts: { start: 'electron .' },
};
fs.writeFileSync(
  path.join(appDir, 'package.json'),
  JSON.stringify(pkg, null, 2)
);

// 3️⃣ main.js
const mainJS = `
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { exec } from 'child_process';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    backgroundColor: '#080B0E',
    title: 'DOZO Control Center – RockStage',
    icon: path.join(process.resourcesPath, 'icon.icns'),
    webPreferences: { nodeIntegration: true }
  });

  // Lanzar servicios backend automáticamente
  exec('node "${baseDir}/dozo-api-visual-link.js"');
  exec('node "${baseDir}/dozo-intelligence-layer.js"');
  exec('node "${baseDir}/dozo-automation-ui.js"');

  win.loadURL('http://localhost:9093');
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
`;
fs.writeFileSync(path.join(appDir, 'main.js'), mainJS);

// 4️⃣ Icono
const iconSrc = path.join(
  baseDir,
  'Dashboard/public/assets/rockstage-icon.icns'
);
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(appDir, 'icon.icns'));
  console.log('✅ Icono RockStage añadido');
} else {
  console.log('⚠️ No se encontró icon.icns en assets/');
}

// 5️⃣ Instalación local Electron
console.log('⚙️ Instalando Electron en AppBuild...');
execSync('npm install', { cwd: appDir, stdio: 'inherit' });

// 6️⃣ Ejecución de prueba
console.log('🚀 Iniciando aplicación DOZO local...');
execSync('npm start', { cwd: appDir, stdio: 'inherit' });

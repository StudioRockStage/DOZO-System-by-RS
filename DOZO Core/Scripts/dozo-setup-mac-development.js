// ============================================================
// 🧩 DOZO Setup for Mac Development v1.0.0 (Professional WordPress Stack)
// Sistema: DOZO System by RS (v7.9.1 Consolidated Base)
// Objetivo: Instalar y configurar entorno completo de desarrollo
//           para plugins WordPress profesionales con validación DOZO.
// ============================================================

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const HOME = os.homedir();
const baseDir = path.join(HOME, 'Documents', 'DOZO System by RS');
const logFile = path.join(baseDir, 'to chat gpt', 'Global', 'DOZO-Environment-Validation.json');

const report = {
  started_at: new Date().toISOString(),
  system: os.platform() + ' ' + os.release(),
  steps: [],
  installed: {},
  validation: {},
  status: 'IN_PROGRESS'
};

function log(msg) {
  console.log(msg);
  report.steps.push({ timestamp: new Date().toISOString(), message: msg });
}

function run(cmd, options = {}) {
  console.log(`\n▶ Ejecutando: ${cmd}`);
  try {
    const output = execSync(cmd, { stdio: options.silent ? 'pipe' : 'inherit', encoding: 'utf8' });
    return { success: true, output };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function checkCommand(cmd, name) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 1️⃣ Crear estructura DOZO System by RS
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('🔧 FASE 1: Creando estructura DOZO System');
console.log('═'.repeat(80));

const dirs = [
  baseDir,
  path.join(baseDir, 'Plugins'),
  path.join(baseDir, 'Plugins', 'Warranty System'),
  path.join(baseDir, 'Latest Builds'),
  path.join(baseDir, 'Latest Builds', 'Warranty System RS'),
  path.join(baseDir, 'Workflow DB'),
  path.join(baseDir, 'to chat gpt'),
  path.join(baseDir, 'to chat gpt', 'Global'),
  path.join(baseDir, 'Backup'),
  path.join(baseDir, 'Archive'),
  path.join(baseDir, 'Archive', 'SessionLogs'),
  path.join(baseDir, 'Archive', 'Trash'),
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✓ Creado: ${dir}`);
  } else {
    log(`✓ Ya existe: ${dir}`);
  }
});

// ============================================================
// 2️⃣ Verificar herramientas esenciales
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('🔍 FASE 2: Verificando herramientas instaladas');
console.log('═'.repeat(80));

// Homebrew
const hasHomebrew = checkCommand('brew -v', 'Homebrew');
if (hasHomebrew) {
  log('✅ Homebrew detectado');
  const brewVersion = execSync('brew -v', { encoding: 'utf8' }).split('\n')[0];
  report.installed.homebrew = brewVersion;
} else {
  log('⚠️  Homebrew NO detectado');
  log('   Para instalar: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
  report.validation.homebrew = 'NOT_INSTALLED';
}

// PHP
if (checkCommand('php -v', 'PHP')) {
  const phpVersion = execSync('php -v', { encoding: 'utf8' }).split('\n')[0];
  log(`✅ PHP detectado: ${phpVersion}`);
  report.installed.php = phpVersion;
} else {
  log('⚠️  PHP NO detectado - Instalar con: brew install php');
  report.validation.php = 'NOT_INSTALLED';
}

// Composer
if (checkCommand('composer -V', 'Composer')) {
  const composerVersion = execSync('composer -V', { encoding: 'utf8' }).split('\n')[0];
  log(`✅ Composer detectado: ${composerVersion}`);
  report.installed.composer = composerVersion;
} else {
  log('⚠️  Composer NO detectado - Instalar con: brew install composer');
  report.validation.composer = 'NOT_INSTALLED';
}

// Node.js
if (checkCommand('node -v', 'Node')) {
  const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
  log(`✅ Node.js detectado: ${nodeVersion}`);
  report.installed.node = nodeVersion;
} else {
  log('⚠️  Node.js NO detectado - Instalar con: brew install node');
  report.validation.node = 'NOT_INSTALLED';
}

// NPM
if (checkCommand('npm -v', 'NPM')) {
  const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
  log(`✅ npm detectado: ${npmVersion}`);
  report.installed.npm = npmVersion;
} else {
  log('⚠️  npm NO detectado');
  report.validation.npm = 'NOT_INSTALLED';
}

// Git
if (checkCommand('git --version', 'Git')) {
  const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
  log(`✅ Git detectado: ${gitVersion}`);
  report.installed.git = gitVersion;
} else {
  log('⚠️  Git NO detectado - Instalar con: brew install git');
  report.validation.git = 'NOT_INSTALLED';
}

// WP-CLI
if (checkCommand('wp --version', 'WP-CLI')) {
  const wpVersion = execSync('wp --version', { encoding: 'utf8' }).trim();
  log(`✅ WP-CLI detectado: ${wpVersion}`);
  report.installed.wpcli = wpVersion;
} else {
  log('⚠️  WP-CLI NO detectado - Instalar con: brew install wp-cli');
  report.validation.wpcli = 'NOT_INSTALLED';
}

// Docker
if (checkCommand('docker -v', 'Docker')) {
  const dockerVersion = execSync('docker -v', { encoding: 'utf8' }).trim();
  log(`✅ Docker detectado: ${dockerVersion}`);
  report.installed.docker = dockerVersion;
} else {
  log('⚠️  Docker NO detectado - Descargar de: https://www.docker.com/products/docker-desktop');
  report.validation.docker = 'NOT_INSTALLED';
}

// ============================================================
// 3️⃣ Verificar/instalar módulos Node requeridos para DOZO
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('📦 FASE 3: Verificando módulos Node.js');
console.log('═'.repeat(80));

const requiredModules = ['adm-zip', 'basic-ftp'];
const packageJsonPath = path.join(baseDir, 'package.json');

// Verificar si existe package.json
if (!fs.existsSync(packageJsonPath)) {
  log('⚠️  package.json no encontrado en DOZO System by RS');
  log('   Los módulos están instalados en el workspace root');
} else {
  log('✅ package.json encontrado');
}

// Verificar módulos en node_modules
const nodeModulesPath = path.join(baseDir, 'node_modules');
requiredModules.forEach(mod => {
  const modPath = path.join(nodeModulesPath, mod);
  if (fs.existsSync(modPath)) {
    log(`✅ ${mod} instalado`);
    report.installed[mod] = 'INSTALLED';
  } else {
    log(`⚠️  ${mod} NO instalado`);
    report.validation[mod] = 'NOT_INSTALLED';
  }
});

// ============================================================
// 4️⃣ Configurar entorno WordPress con Docker
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('🐳 FASE 4: Configurando Docker Compose para WordPress');
console.log('═'.repeat(80));

const dockerCompose = `version: '3.9'

services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:latest
    depends_on:
      - db
    ports:
      - '8080:80'
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./Plugins:/var/www/html/wp-content/plugins
      - ./wordpress:/var/www/html

volumes:
  db_data:
`;

const dockerPath = path.join(baseDir, 'docker-compose.yml');
fs.writeFileSync(dockerPath, dockerCompose);
log(`✅ docker-compose.yml creado en: ${dockerPath}`);

// ============================================================
// 5️⃣ Crear scripts de ayuda
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('🔧 FASE 5: Creando scripts de ayuda');
console.log('═'.repeat(80));

// Script para iniciar WordPress
const startScript = `#!/bin/bash
# Iniciar WordPress con Docker
echo "🚀 Iniciando WordPress local..."
cd "${baseDir}"
docker compose up -d
echo ""
echo "✅ WordPress iniciado"
echo "📍 URL: http://localhost:8080"
echo "👤 Usuario: admin"
echo "🔑 Contraseña: admin"
echo ""
echo "Para detener: ./stop-wordpress.sh"
`;

fs.writeFileSync(path.join(baseDir, 'start-wordpress.sh'), startScript);
fs.chmodSync(path.join(baseDir, 'start-wordpress.sh'), '755');
log('✅ start-wordpress.sh creado');

// Script para detener WordPress
const stopScript = `#!/bin/bash
# Detener WordPress
echo "🛑 Deteniendo WordPress local..."
cd "${baseDir}"
docker compose down
echo "✅ WordPress detenido"
`;

fs.writeFileSync(path.join(baseDir, 'stop-wordpress.sh'), stopScript);
fs.chmodSync(path.join(baseDir, 'stop-wordpress.sh'), '755');
log('✅ stop-wordpress.sh creado');

// ============================================================
// 6️⃣ Generar reporte final
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('📊 FASE 6: Generando reporte final');
console.log('═'.repeat(80));

report.finished_at = new Date().toISOString();
report.status = 'COMPLETED';

// Crear directorio para el reporte si no existe
const reportDir = path.dirname(logFile);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

fs.writeFileSync(logFile, JSON.stringify(report, null, 2));

console.log('\n' + '═'.repeat(80));
console.log('✅ CONFIGURACIÓN COMPLETADA');
console.log('═'.repeat(80));
console.log('\n📊 Resumen:');
console.log('   • Estructura DOZO:', dirs.length, 'directorios');
console.log('   • Herramientas detectadas:', Object.keys(report.installed).length);
console.log('   • Docker Compose configurado: ✅');
console.log('   • Scripts de ayuda creados: 2');
console.log('\n🧾 Reporte completo:', logFile);
console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('   1. Iniciar WordPress: ./start-wordpress.sh');
console.log('   2. Acceder a: http://localhost:8080');
console.log('   3. Instalar WordPress (usuario: admin, password: admin)');
console.log('   4. Copiar plugin a: Plugins/');
console.log('   5. Activar desde WordPress Admin');
console.log('\n📖 Ver: EXECUTIVE-SUMMARY.md para información del plugin');
console.log('═'.repeat(80));


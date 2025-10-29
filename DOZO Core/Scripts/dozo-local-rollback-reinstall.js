/*
🧩 DOZO Local Rollback & Reinstall v1.0.0 (Safe Cleanup & Redeploy)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Proyecto: Warranty System RS
Objetivo:
  - Desactivar y eliminar el plugin del entorno Docker.
  - Limpiar base de datos y archivos residuales.
  - Verificar y reinstalar WP-CLI y unzip si faltan.
  - Reinstalar la versión base del plugin desde Latest Builds.
  - Generar reporte JSON y MD.
  - Limpiar archivos temporales conservando estructura DOZO.
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, 'Documents/DOZO System by RS');
const latestBuilds = path.join(baseDir, 'Latest Builds', 'Warranty System RS');
const zipPath = path.join(latestBuilds, 'warranty-system-rs.zip');
const globalDir = path.join(baseDir, 'to chat gpt', 'Global');
const container = 'dozosystembyrs-wordpress-1';
const reportPath = path.join(globalDir, `DOZO-Rollback-Reinstall-Report-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);

fs.mkdirSync(globalDir, { recursive: true });

const report = {
  started_at: new Date().toISOString(),
  context: 'DOZO Local Rollback & Reinstall v1.0.0',
  actions: [],
  warnings: [],
  errors: [],
  status: 'IN_PROGRESS'
};

function step(title, fn) {
  console.log(`\n▶ ${title}`);
  try {
    fn();
    report.actions.push({ step: title, status: 'OK', timestamp: new Date().toISOString() });
    console.log(`✓ ${title} completado`);
  } catch (e) {
    console.error(`✗ Error en ${title}:`, e.message);
    report.errors.push({ step: title, error: e.message, timestamp: new Date().toISOString() });
  }
}

console.log('═'.repeat(80));
console.log('🧩 DOZO Local Rollback & Reinstall v1.0.0');
console.log('═'.repeat(80));
console.log('Proyecto: Warranty System RS');
console.log('Sistema: DOZO System by RS v7.9.1');
console.log('═'.repeat(80));

// 0️⃣ Verificar que Docker esté corriendo
step('Verificando estado de Docker', () => {
  try {
    execSync('docker ps', { stdio: 'pipe' });
    console.log('  → Docker está corriendo');
  } catch (e) {
    throw new Error('Docker no está corriendo. Inicia Docker Desktop primero.');
  }
  
  // Verificar si el contenedor existe
  try {
    execSync(`docker ps -a --filter name=${container} --format "{{.Names}}"`, { stdio: 'pipe' });
    console.log(`  → Contenedor ${container} detectado`);
  } catch (e) {
    report.warnings.push('Contenedor WordPress no encontrado. Ejecutar: ./start-wordpress.sh');
    throw new Error('Contenedor WordPress no encontrado. Ejecutar primero: ./start-wordpress.sh');
  }
});

// 1️⃣ Desactivar y eliminar el plugin existente
step('Desactivando y eliminando plugin del contenedor', () => {
  // Intentar desactivar con WP-CLI (puede fallar si no está instalado)
  try {
    execSync(`docker exec ${container} bash -c "if command -v wp > /dev/null 2>&1; then wp plugin deactivate warranty-system-rs --allow-root 2>/dev/null || true; fi"`, { stdio: 'pipe' });
    console.log('  → Plugin desactivado');
  } catch (e) {
    console.log('  → WP-CLI no disponible, saltando desactivación');
  }
  
  // Eliminar archivos del plugin
  execSync(`docker exec ${container} bash -c "rm -rf /var/www/html/wp-content/plugins/warranty-system-rs"`, { stdio: 'pipe' });
  console.log('  → Archivos del plugin eliminados');
});

// 2️⃣ Limpiar base de datos y cachés residuales
step('Limpiando base de datos y cachés', () => {
  try {
    execSync(`docker exec ${container} bash -c "if command -v wp > /dev/null 2>&1; then wp transient delete --all --allow-root 2>/dev/null; wp cache flush --allow-root 2>/dev/null; fi"`, { stdio: 'pipe' });
    console.log('  → Transients y cachés limpiados');
  } catch (e) {
    console.log('  → Limpieza con WP-CLI no disponible (opcional)');
  }
});

// 3️⃣ Reinstalar WP-CLI y unzip si no existen
step('Verificando WP-CLI y unzip en contenedor', () => {
  // Verificar WP-CLI
  try {
    execSync(`docker exec ${container} bash -c "command -v wp"`, { stdio: 'pipe' });
    console.log('  → WP-CLI ya instalado');
  } catch {
    console.log('  → Instalando WP-CLI...');
    execSync(`docker exec ${container} bash -c "curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp"`, { stdio: 'inherit' });
  }
  
  // Verificar unzip
  try {
    execSync(`docker exec ${container} bash -c "command -v unzip"`, { stdio: 'pipe' });
    console.log('  → unzip ya instalado');
  } catch {
    console.log('  → Instalando unzip...');
    execSync(`docker exec ${container} bash -c "apt update && apt install -y unzip"`, { stdio: 'inherit' });
  }
});

// 4️⃣ Reinstalar versión base desde Latest Builds
step('Reinstalando plugin base desde ZIP', () => {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`No se encontró el ZIP base en: ${zipPath}`);
  }
  
  const zipStats = fs.statSync(zipPath);
  console.log(`  → ZIP encontrado: ${Math.round(zipStats.size / 1024)} KB`);
  
  // Copiar ZIP al contenedor
  console.log('  → Copiando ZIP al contenedor...');
  execSync(`docker cp "${zipPath}" ${container}:/tmp/warranty-system-rs.zip`, { stdio: 'pipe' });
  
  // Descomprimir en plugins
  console.log('  → Descomprimiendo plugin...');
  execSync(`docker exec ${container} bash -c "cd /var/www/html/wp-content/plugins && unzip -o /tmp/warranty-system-rs.zip && rm /tmp/warranty-system-rs.zip"`, { stdio: 'pipe' });
  
  // Activar plugin
  console.log('  → Activando plugin...');
  try {
    execSync(`docker exec ${container} bash -c "wp plugin activate warranty-system-rs --allow-root"`, { stdio: 'pipe' });
    console.log('  → Plugin activado exitosamente');
  } catch (e) {
    report.warnings.push('No se pudo activar con WP-CLI. Activar manualmente desde WordPress Admin.');
    console.log('  ⚠ Activar manualmente desde WordPress Admin');
  }
});

// 5️⃣ Validar reinstalación
step('Validando reinstalación y estructura', () => {
  const requiredFiles = ['warranty-system-rs.php','index.php','uninstall.php'];
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    try {
      execSync(`docker exec ${container} test -f /var/www/html/wp-content/plugins/warranty-system-rs/${file}`, { stdio: 'pipe' });
      console.log(`  ✓ ${file}`);
    } catch {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    throw new Error(`Faltan archivos: ${missingFiles.join(', ')}`);
  }
  
  // Verificar directorios principales
  const requiredDirs = ['admin', 'public', 'includes', 'assets'];
  for (const dir of requiredDirs) {
    try {
      execSync(`docker exec ${container} test -d /var/www/html/wp-content/plugins/warranty-system-rs/${dir}`, { stdio: 'pipe' });
      console.log(`  ✓ ${dir}/`);
    } catch {
      report.warnings.push(`Directorio faltante: ${dir}/`);
    }
  }
});

// 6️⃣ Limpieza de archivos temporales del workspace
step('Limpieza del workspace DOZO', () => {
  const tempPatterns = [/temp/i, /tmp/i, /cache/i, /test.*\.zip$/i];
  const files = fs.readdirSync(baseDir);
  const tempFiles = files.filter(f => {
    return tempPatterns.some(pattern => pattern.test(f));
  });
  
  if (tempFiles.length > 0) {
    const recycleDir = path.join(baseDir, 'Backup', 'Workspace_Trash', new Date().toISOString().replace(/[:.]/g,'-'));
    fs.mkdirSync(recycleDir, { recursive: true });
    
    for (const file of tempFiles) {
      const fullPath = path.join(baseDir, file);
      if (fs.existsSync(fullPath)) {
        fs.renameSync(fullPath, path.join(recycleDir, file));
        console.log(`  → Movido: ${file}`);
      }
    }
    report.actions.push({ cleaned_files: tempFiles.length });
  } else {
    console.log('  → No hay archivos temporales para limpiar');
  }
});

// ✅ Guardar reporte final
report.finished_at = new Date().toISOString();
report.status = report.errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS';

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Crear reporte Markdown
const mdPath = path.join(globalDir, `DOZO-Rollback-Reinstall-Success.md`);
const mdContent = `# ✅ DOZO Local Rollback & Reinstall — Completado

**Fecha:** ${new Date().toISOString()}  
**Status:** ${report.status}

## Acciones Realizadas

${report.actions.map((a, i) => `${i+1}. ✓ ${a.step}`).join('\n')}

## Warnings

${report.warnings.length > 0 ? report.warnings.map(w => `⚠️ ${w}`).join('\n') : 'Ninguno'}

## Errors

${report.errors.length > 0 ? report.errors.map(e => `❌ ${e.step}: ${e.error}`).join('\n') : 'Ninguno'}

## Resultado

Plugin reinstalado desde: \`${zipPath}\`

Acceder a WordPress: http://localhost:8080/wp-admin/

**Status:** ${report.status}
`;

fs.writeFileSync(mdPath, mdContent);

console.log('\n' + '═'.repeat(80));
console.log('✅ Rollback y reinstalación completados');
console.log('═'.repeat(80));
console.log(`📊 Acciones exitosas: ${report.actions.length}`);
console.log(`⚠️  Warnings: ${report.warnings.length}`);
console.log(`❌ Errors: ${report.errors.length}`);
console.log(`📊 Status: ${report.status}`);
console.log('\n🧾 Reportes:');
console.log(`   JSON: ${reportPath}`);
console.log(`   MD:   ${mdPath}`);
console.log('\n🔗 Acceder a WordPress:');
console.log('   URL: http://localhost:8080/wp-admin/');
console.log('   Plugin: http://localhost:8080/wp-admin/plugins.php');
console.log('═'.repeat(80));


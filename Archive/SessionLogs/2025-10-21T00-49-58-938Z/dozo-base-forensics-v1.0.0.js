#!/usr/bin/env node

/*
🧩 DOZO Base Forensics & Rebuild v1.0.0 (Golden Merge & Repair)
Sistema: DOZO System by RS
Proyecto: Warranty System RS
Autor: RockStage Solutions
Fecha: 2025-10-20
-------------------------------------------------------------
Objetivo:
1️⃣ Analizar y comparar los dos ZIPs provistos:
    • Base funcional: Documents/Warranty System RS PRUEBA BASE.zip
    • Base con errores: Latest Builds/Warranty System RS/warranty-system-rs.zip
2️⃣ Detectar diferencias de estructura, cabeceras, rutas y nomenclatura.
3️⃣ Fusionar los elementos correctos del ZIP funcional con las definiciones del flujo DOZO actual.
4️⃣ Reempaquetar el resultado definitivo como warranty-system-rs.zip
5️⃣ Generar un reporte detallado DOZO-BaseForensics-Report.json.
-------------------------------------------------------------
*/

import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

// Helper functions to replace fs-extra
function removeSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function mkdirpSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copySync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    mkdirpSync(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copySync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Configuración
const ROOT = path.resolve(process.env.HOME || process.env.USERPROFILE, 'Documents/DOZO System by RS');
const LATEST = path.join(ROOT, 'Latest Builds', 'Warranty System RS');
const REPORT = path.join(ROOT, 'to chat gpt', 'Global', 'DOZO-BaseForensics-Report.json');
const DOCS = path.resolve(process.env.HOME || process.env.USERPROFILE, 'Documents');
const GOOD = path.join(DOCS, 'Warranty System RS PRUEBA BASE.zip');
const BAD = path.join(LATEST, 'warranty-system-rs.zip');
const OUTPUT = path.join(LATEST, 'warranty-system-rs-FINAL.zip');

console.log('🧩 DOZO Base Forensics & Rebuild v1.0.0');
console.log('═'.repeat(70));

// Verificar que ambos ZIPs existan
console.log('\n📦 Verificando archivos base...');
console.log(`  Base funcional: ${GOOD}`);
console.log(`  Base actual: ${BAD}`);

if (!fs.existsSync(GOOD)) {
  console.error(`\n❌ No se encontró el ZIP funcional: ${GOOD}`);
  console.log('\n💡 Buscando archivos similares...');
  
  // Buscar archivos ZIP en Documents
  const docsFiles = fs.readdirSync(DOCS).filter(f => f.toLowerCase().includes('warranty') && f.endsWith('.zip'));
  if (docsFiles.length > 0) {
    console.log('\n📁 Archivos encontrados en Documents/:');
    docsFiles.forEach(f => console.log(`   - ${f}`));
  }
  
  process.exit(1);
}

if (!fs.existsSync(BAD)) {
  console.error(`\n❌ No se encontró el ZIP actual: ${BAD}`);
  process.exit(1);
}

console.log('✓ Ambos archivos encontrados');

// Crear directorio temporal
const TMP = path.join(LATEST, '__TMP_COMPARE__');
console.log('\n🔧 Creando entorno temporal...');
removeSync(TMP);
mkdirpSync(TMP);

const GOOD_DIR = path.join(TMP, 'GOOD');
const BAD_DIR = path.join(TMP, 'BAD');

console.log('  Extrayendo ZIP funcional...');
new AdmZip(GOOD).extractAllTo(GOOD_DIR, true);
console.log('  Extrayendo ZIP actual...');
new AdmZip(BAD).extractAllTo(BAD_DIR, true);
console.log('✓ Extracción completada');

// Detectar carpeta raíz en ambos
function detectRoot(dir) {
  const entries = fs.readdirSync(dir).filter(f => !f.startsWith('.') && !f.startsWith('__MACOSX'));
  if (entries.length === 1 && fs.statSync(path.join(dir, entries[0])).isDirectory()) {
    return path.join(dir, entries[0]);
  }
  return dir;
}

console.log('\n🧭 Analizando estructura...');
const GOOD_ROOT = detectRoot(GOOD_DIR);
const BAD_ROOT = detectRoot(BAD_DIR);

const goodName = path.basename(GOOD_ROOT);
const badName = path.basename(BAD_ROOT);

console.log(`  Base funcional: carpeta raíz = "${goodName}"`);
console.log(`  Base actual: carpeta raíz = "${badName}"`);

// Analizar diferencias estructurales
console.log('\n🔍 Comparando archivos y detectando diferencias...');
const diff = { 
  missing: [],      // Archivos que están en GOOD pero no en BAD
  extra: [],        // Archivos que están en BAD pero no en GOOD
  mismatched: [],   // Archivos que existen en ambos pero son diferentes
  identical: 0      // Contador de archivos idénticos
};

function compareDirs(dir1, dir2, base = '') {
  const list1 = fs.readdirSync(dir1);
  const list2 = fs.readdirSync(dir2);
  
  for (const file of list1) {
    if (file.startsWith('.')) continue; // Ignorar archivos ocultos
    
    const p1 = path.join(dir1, file);
    const p2 = path.join(dir2, file);
    const rel = path.join(base, file);
    
    if (!fs.existsSync(p2)) {
      diff.missing.push(rel);
      console.log(`  ⚠️  Falta en actual: ${rel}`);
    } else {
      const stat1 = fs.statSync(p1);
      const stat2 = fs.statSync(p2);
      
      if (stat1.isDirectory() && stat2.isDirectory()) {
        compareDirs(p1, p2, rel);
      } else if (stat1.isFile() && stat2.isFile()) {
        const hash1 = crypto.createHash('sha256').update(fs.readFileSync(p1)).digest('hex');
        const hash2 = crypto.createHash('sha256').update(fs.readFileSync(p2)).digest('hex');
        
        if (hash1 !== hash2) {
          diff.mismatched.push(rel);
          console.log(`  🔄 Diferente: ${rel}`);
        } else {
          diff.identical++;
        }
      }
    }
  }
  
  for (const file of list2) {
    if (file.startsWith('.')) continue;
    
    const rel = path.join(base, file);
    if (!fs.existsSync(path.join(dir1, file))) {
      diff.extra.push(rel);
      console.log(`  ➕ Extra en actual: ${rel}`);
    }
  }
}

compareDirs(GOOD_ROOT, BAD_ROOT);

console.log('\n📊 Resumen de diferencias:');
console.log(`  Archivos idénticos: ${diff.identical}`);
console.log(`  Faltantes en actual: ${diff.missing.length}`);
console.log(`  Extras en actual: ${diff.extra.length}`);
console.log(`  Archivos modificados: ${diff.mismatched.length}`);

// Fusionar: usar GOOD_ROOT como base
console.log('\n🔧 Fusionando y reconstruyendo...');
const FINAL_DIR = path.join(TMP, 'FINAL', 'warranty-system-rs');
mkdirpSync(path.dirname(FINAL_DIR));

console.log('  Copiando estructura funcional...');
copySync(GOOD_ROOT, FINAL_DIR);

// Analizar y parchear el archivo principal PHP
console.log('\n🩹 Analizando archivo principal PHP...');
const MAIN_PHP = path.join(FINAL_DIR, 'warranty-system-rs.php');
const possibleMainFiles = [
  'warranty-system-rs.php',
  'rockstage-warranty-system.php',
  'warranty-system.php'
];

let mainPhpPath = null;
for (const fname of possibleMainFiles) {
  const testPath = path.join(FINAL_DIR, fname);
  if (fs.existsSync(testPath)) {
    mainPhpPath = testPath;
    console.log(`  ✓ Archivo principal encontrado: ${fname}`);
    break;
  }
}

if (!mainPhpPath) {
  console.log('  ⚠️  No se encontró archivo PHP principal, buscando...');
  const phpFiles = fs.readdirSync(FINAL_DIR).filter(f => f.endsWith('.php'));
  if (phpFiles.length > 0) {
    mainPhpPath = path.join(FINAL_DIR, phpFiles[0]);
    console.log(`  ✓ Usando: ${phpFiles[0]}`);
  }
}

let phpPatched = false;
if (mainPhpPath) {
  console.log('  Parcheando cabeceras...');
  let content = fs.readFileSync(mainPhpPath, 'utf8');
  
  // Asegurar Update URI
  if (!/Update URI:/i.test(content)) {
    content = content.replace(
      /(Version:\s*[\d.]+\s*\n)/i,
      '$1 * Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json\n'
    );
    console.log('  ✓ Update URI agregado');
    phpPatched = true;
  } else {
    content = content.replace(
      /Update URI:\s*.*/i,
      'Update URI: https://updates.vapedot.mx/warranty-system-rs/update.json'
    );
    console.log('  ✓ Update URI actualizado');
    phpPatched = true;
  }
  
  // Asegurar Text Domain correcto
  if (!/Text Domain:\s*warranty-system-rs/i.test(content)) {
    if (/Text Domain:/i.test(content)) {
      content = content.replace(/Text Domain:\s*\S+/i, 'Text Domain: warranty-system-rs');
    } else {
      content = content.replace(
        /(Version:\s*[\d.]+\s*\n)/i,
        '$1 * Text Domain: warranty-system-rs\n'
      );
    }
    console.log('  ✓ Text Domain corregido');
    phpPatched = true;
  }
  
  // Guardar si hubo cambios
  if (phpPatched) {
    fs.writeFileSync(mainPhpPath, content, 'utf8');
  }
  
  // Si el archivo no se llama warranty-system-rs.php, renombrarlo
  if (path.basename(mainPhpPath) !== 'warranty-system-rs.php') {
    const newPath = path.join(FINAL_DIR, 'warranty-system-rs.php');
    fs.renameSync(mainPhpPath, newPath);
    console.log(`  ✓ Renombrado a: warranty-system-rs.php`);
  }
}

// Añadir index.php de seguridad si faltan
console.log('\n🔒 Verificando archivos de seguridad...');
const dirsToSecure = ['', 'includes', 'assets', 'templates', 'tools', 'admin', 'public'];
let securityAdded = 0;

for (const dir of dirsToSecure) {
  const dirPath = path.join(FINAL_DIR, dir);
  if (fs.existsSync(dirPath)) {
    const indexPath = path.join(dirPath, 'index.php');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, "<?php // Silence is golden.\n");
      securityAdded++;
    }
  }
}

if (securityAdded > 0) {
  console.log(`  ✓ ${securityAdded} archivos index.php de seguridad agregados`);
} else {
  console.log(`  ✓ Archivos de seguridad ya presentes`);
}

// Reempaquetar
console.log('\n📦 Reempaquetando ZIP final...');
removeSync(OUTPUT);
const zip = new AdmZip();
zip.addLocalFolder(FINAL_DIR, 'warranty-system-rs');
zip.writeZip(OUTPUT);
console.log(`  ✓ ZIP creado: ${path.basename(OUTPUT)}`);

// Calcular métricas
const stats = fs.statSync(OUTPUT);
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(OUTPUT)).digest('hex');

console.log('\n🔐 Calculando checksums...');
console.log(`  SHA256: ${sha256}`);
console.log(`  Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// Generar reporte
const report = {
  analysis: {
    good_zip: GOOD,
    good_zip_root: goodName,
    bad_zip: BAD,
    bad_zip_root: badName,
    comparison: {
      identical_files: diff.identical,
      missing_in_bad: diff.missing.length,
      extra_in_bad: diff.extra.length,
      mismatched_files: diff.mismatched.length
    }
  },
  differences: {
    missing: diff.missing.slice(0, 50), // Limitar a 50 para el reporte
    extra: diff.extra.slice(0, 50),
    mismatched: diff.mismatched.slice(0, 50)
  },
  output: {
    file: OUTPUT,
    size_bytes: stats.size,
    size_readable: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    sha256: sha256,
    root_folder: 'warranty-system-rs',
    php_patched: phpPatched,
    security_files_added: securityAdded
  },
  notes: [
    'El paquete final usa la estructura funcional de la base que sí instala correctamente.',
    'Se normalizaron cabeceras DOZO (Update URI, Text Domain).',
    'Se agregaron archivos de seguridad index.php donde faltaban.',
    'La carpeta raíz se estandarizó como warranty-system-rs/',
    'Listo para pruebas e instalación en WordPress.'
  ],
  recommendations: [
    'Probar instalación en WordPress limpio',
    'Verificar que aparezca en el panel de plugins',
    'Confirmar que el enlace de Configuración funcione',
    'Validar detección de actualizaciones'
  ],
  timestamp: new Date().toISOString()
};

mkdirpSync(path.dirname(REPORT));
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf8');

// Limpieza
console.log('\n🧹 Limpiando temporales...');
removeSync(TMP);
console.log('  ✓ Directorio temporal eliminado');

// Resumen final
console.log('\n' + '═'.repeat(70));
console.log('✅ Análisis forense y reconstrucción completados exitosamente');
console.log('═'.repeat(70));
console.log(`\n📦 ZIP FINAL: ${OUTPUT}`);
console.log(`📊 REPORTE: ${REPORT}`);
console.log(`\n🎯 Próximos pasos:`);
console.log(`   1. Renombrar: warranty-system-rs-FINAL.zip → warranty-system-rs.zip`);
console.log(`   2. Validar con: node dozo-final-readiness-v1.0.0.js`);
console.log(`   3. Probar instalación en WordPress`);
console.log(`   4. Verificar panel de administración\n`);


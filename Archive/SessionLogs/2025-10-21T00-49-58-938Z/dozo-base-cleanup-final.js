/*
🧩 DOZO Base Cleanup & Renaming v1.0.0 (Final Edition)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Fecha: 2025-10-19

Objetivo: Limpieza final total, dejando solo build base consolidado con nomenclatura perfecta
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const TARGET_DIR = path.join(ROOT, 'Latest Builds', 'Warranty System RS');
const CLEANUP_REPORT = path.join(TARGET_DIR, 'DOZO-CleanupReport.json');
const FILE_MAP = path.join(TARGET_DIR, 'DOZO-FileMap.json');

const KEEP_ZIP = 'warranty-system-rs.zip';
const KEEP_FOLDER = 'warranty-system-rs';
const MAIN_FILE = 'warranty-system-rs.php';

const REQUIRED_DIRS = ['admin', 'includes', 'public', 'tools', 'templates', 'assets'];

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function formatBytes(bytes) {
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Paso 1: Preparar entorno e inventariar
function prepareAndInventory() {
  log('🧠', 'Preparando entorno y creando inventario...');
  
  if (!fs.existsSync(TARGET_DIR)) {
    throw new Error(`Directorio no encontrado: ${TARGET_DIR}`);
  }
  
  const items = fs.readdirSync(TARGET_DIR);
  
  const inventory = {
    timestamp: new Date().toISOString(),
    location: TARGET_DIR,
    items_before: [],
    folders: [],
    zip_files: [],
    other_files: []
  };
  
  items.forEach(item => {
    const itemPath = path.join(TARGET_DIR, item);
    const stats = fs.statSync(itemPath);
    
    const itemInfo = {
      name: item,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size
    };
    
    inventory.items_before.push(itemInfo);
    
    if (stats.isDirectory()) {
      inventory.folders.push(item);
      log('📁', `Carpeta: ${item}`);
    } else if (item.endsWith('.zip')) {
      inventory.zip_files.push(item);
      log('📦', `ZIP: ${item} (${formatBytes(stats.size)})`);
    } else {
      inventory.other_files.push(item);
      log('📄', `Archivo: ${item}`);
    }
  });
  
  log('📊', `Inventario: ${inventory.folders.length} carpetas, ${inventory.zip_files.length} ZIPs, ${inventory.other_files.length} otros`);
  
  fs.writeFileSync(FILE_MAP, JSON.stringify(inventory, null, 2));
  log('✅', 'Inventario guardado en DOZO-FileMap.json');
  
  return inventory;
}

// Paso 2: Limpieza total
function totalCleanup(inventory) {
  log('🧹', 'Ejecutando limpieza total...');
  
  const deleted = {
    zip_files: [],
    folders: [],
    other_files: []
  };
  
  // Eliminar ZIPs que no sean el principal
  inventory.zip_files.forEach(zipFile => {
    if (zipFile !== KEEP_ZIP) {
      const zipPath = path.join(TARGET_DIR, zipFile);
      log('🗑️', `Eliminando ZIP: ${zipFile}`);
      fs.unlinkSync(zipPath);
      deleted.zip_files.push(zipFile);
    } else {
      log('✅', `Conservando: ${zipFile}`);
    }
  });
  
  // Eliminar carpetas que no sean la principal
  inventory.folders.forEach(folder => {
    if (folder !== KEEP_FOLDER) {
      const folderPath = path.join(TARGET_DIR, folder);
      log('🗑️', `Eliminando carpeta: ${folder}`);
      fs.rmSync(folderPath, { recursive: true, force: true });
      deleted.folders.push(folder);
    } else {
      log('✅', `Conservando carpeta: ${folder}`);
    }
  });
  
  // Conservar archivos de reporte DOZO
  inventory.other_files.forEach(file => {
    if (!file.startsWith('DOZO-')) {
      const filePath = path.join(TARGET_DIR, file);
      log('🗑️', `Eliminando archivo: ${file}`);
      fs.unlinkSync(filePath);
      deleted.other_files.push(file);
    } else {
      log('✅', `Conservando reporte: ${file}`);
    }
  });
  
  const totalDeleted = deleted.zip_files.length + deleted.folders.length + deleted.other_files.length;
  log('✅', `Limpieza completada: ${totalDeleted} items eliminados`);
  
  return deleted;
}

// Paso 3: Renombrado y normalización
function renameAndNormalize() {
  log('🧩', 'Ejecutando renombrado y normalización final...');
  
  const zipPath = path.join(TARGET_DIR, KEEP_ZIP);
  const folderPath = path.join(TARGET_DIR, KEEP_FOLDER);
  
  const normalization = {
    zip_exists: fs.existsSync(zipPath),
    zip_name_correct: true,
    folder_exists: fs.existsSync(folderPath),
    folder_name_correct: true,
    main_file_exists: false,
    main_file_name_correct: false
  };
  
  // Verificar que existe el ZIP
  if (normalization.zip_exists) {
    log('✅', `ZIP encontrado: ${KEEP_ZIP}`);
  } else {
    log('❌', `ZIP no encontrado: ${KEEP_ZIP}`);
  }
  
  // Verificar carpeta
  if (normalization.folder_exists) {
    log('✅', `Carpeta encontrada: ${KEEP_FOLDER}/`);
    
    // Verificar archivo principal
    const mainPath = path.join(folderPath, MAIN_FILE);
    normalization.main_file_exists = fs.existsSync(mainPath);
    normalization.main_file_name_correct = normalization.main_file_exists;
    
    if (normalization.main_file_exists) {
      log('✅', `Archivo principal: ${MAIN_FILE}`);
    } else {
      log('⚠️', `Archivo principal no encontrado: ${MAIN_FILE}`);
    }
  }
  
  log('✅', 'Normalización verificada');
  
  return normalization;
}

// Paso 4: Verificar estructura y consistencia
function verifyStructureAndConsistency() {
  log('🔍', 'Verificando estructura y consistencia...');
  
  const folderPath = path.join(TARGET_DIR, KEEP_FOLDER);
  const mainPath = path.join(folderPath, MAIN_FILE);
  
  const verification = {
    required_dirs: {},
    missing_dirs: [],
    main_file_headers: {},
    paths_portable: false
  };
  
  // Verificar directorios requeridos
  REQUIRED_DIRS.forEach(dir => {
    const dirPath = path.join(folderPath, dir);
    const exists = fs.existsSync(dirPath);
    verification.required_dirs[dir] = exists;
    
    if (exists) {
      log('✅', `Directorio presente: ${dir}/`);
    } else {
      log('⚠️', `Directorio faltante: ${dir}/`);
      verification.missing_dirs.push(dir);
    }
  });
  
  // Verificar headers del archivo principal
  if (fs.existsSync(mainPath)) {
    const content = fs.readFileSync(mainPath, 'utf8');
    
    // Extraer headers
    const headers = {
      'Plugin Name': null,
      'Version': null,
      'Author': null,
      'Text Domain': null
    };
    
    Object.keys(headers).forEach(key => {
      const regex = new RegExp(`^\\s*\\*\\s*${key}\\s*:\\s*(.+)$`, 'mi');
      const match = content.match(regex);
      if (match) {
        headers[key] = match[1].trim();
        log('✅', `${key}: ${headers[key]}`);
      }
    });
    
    verification.main_file_headers = headers;
    
    // Verificar rutas portables
    verification.paths_portable = 
      content.includes('plugin_dir_path(__FILE__)') &&
      !content.includes('dirname(ABSPATH)');
    
    if (verification.paths_portable) {
      log('✅', 'Rutas portables verificadas');
    } else {
      log('⚠️', 'Rutas no son completamente portables');
    }
  }
  
  const structureValid = verification.missing_dirs.length === 0;
  
  if (structureValid) {
    log('✅', 'Estructura completa y consistente');
  } else {
    log('⚠️', `Faltan ${verification.missing_dirs.length} directorios`);
  }
  
  return verification;
}

// Paso 5: Generar reporte de limpieza
function generateCleanupReport(inventory, deleted, normalization, verification) {
  log('🧾', 'Generando registro DOZO de limpieza...');
  
  const zipPath = path.join(TARGET_DIR, KEEP_ZIP);
  const sha256 = fs.existsSync(zipPath) ? calculateSHA256(zipPath) : null;
  const size = fs.existsSync(zipPath) ? fs.statSync(zipPath).size : 0;
  
  const report = {
    action: 'Base Cleanup & Renaming Final',
    status: 'pending',
    timestamp: new Date().toISOString(),
    dozo_version: '7.9',
    inventory_before: {
      total_items: inventory.items_before.length,
      folders: inventory.folders.length,
      zip_files: inventory.zip_files.length,
      other_files: inventory.other_files.length
    },
    cleanup_executed: {
      zip_files_deleted: deleted.zip_files,
      folders_deleted: deleted.folders,
      other_files_deleted: deleted.other_files,
      total_deleted: deleted.zip_files.length + deleted.folders.length + deleted.other_files.length
    },
    final_state: {
      zip_file: KEEP_ZIP,
      zip_exists: normalization.zip_exists,
      zip_sha256: sha256,
      zip_size: size,
      zip_size_formatted: formatBytes(size),
      plugin_folder: KEEP_FOLDER,
      folder_exists: normalization.folder_exists,
      main_file: MAIN_FILE,
      main_file_exists: normalization.main_file_exists
    },
    structure_validation: {
      required_dirs_present: REQUIRED_DIRS.length - verification.missing_dirs.length,
      required_dirs_total: REQUIRED_DIRS.length,
      missing_dirs: verification.missing_dirs,
      all_dirs_present: verification.missing_dirs.length === 0
    },
    nomenclature_verification: {
      zip_name: KEEP_ZIP,
      folder_name: KEEP_FOLDER,
      main_file_name: MAIN_FILE,
      text_domain: verification.main_file_headers['Text Domain'],
      all_consistent: true
    },
    headers_verification: verification.main_file_headers,
    paths_portable: verification.paths_portable,
    result: 'pending'
  };
  
  // Determinar resultado final
  const allChecks = [
    normalization.zip_exists,
    normalization.folder_exists,
    normalization.main_file_exists,
    verification.missing_dirs.length === 0,
    verification.main_file_headers['Plugin Name'] === 'Warranty System RS',
    verification.main_file_headers['Version'] === '1.0.0',
    verification.main_file_headers['Text Domain'] === 'warranty-system-rs',
    verification.paths_portable
  ];
  
  const passed = allChecks.filter(c => c === true).length;
  const total = allChecks.length;
  
  if (passed === total) {
    report.result = 'SUCCESS';
    report.status = '✅ SUCCESS';
  } else if (passed >= total - 2) {
    report.result = 'SUCCESS_WITH_WARNINGS';
    report.status = '⚠️ SUCCESS WITH WARNINGS';
  } else {
    report.result = 'ERROR';
    report.status = '❌ ERROR';
  }
  
  report.summary = {
    checks_total: total,
    checks_passed: passed,
    checks_failed: total - passed
  };
  
  fs.writeFileSync(CLEANUP_REPORT, JSON.stringify(report, null, 2));
  log('✅', `Reporte guardado: DOZO-CleanupReport.json`);
  
  return report;
}

// Main execution
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║         🧹 DOZO Base Cleanup & Renaming v1.0.0 (Final) 🧹                   ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Paso 1: Preparar e inventariar
    const inventory = prepareAndInventory();
    
    // Paso 2: Limpieza total
    const deleted = totalCleanup(inventory);
    
    // Paso 3: Normalización
    const normalization = renameAndNormalize();
    
    // Paso 4: Verificación de estructura
    const verification = verifyStructureAndConsistency();
    
    // Paso 5: Generar reporte
    const report = generateCleanupReport(inventory, deleted, normalization, verification);
    
    // Resultado final
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    
    if (report.result === 'SUCCESS') {
      console.log('║                  ✅ LIMPIEZA COMPLETADA EXITOSAMENTE ✅                       ║');
    } else if (report.result === 'SUCCESS_WITH_WARNINGS') {
      console.log('║              ⚠️  LIMPIEZA COMPLETADA CON ADVERTENCIAS ⚠️                    ║');
    } else {
      console.log('║                      ❌ LIMPIEZA FALLIDA ❌                                  ║');
    }
    
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    log('📊', `Verificaciones: ${report.summary.checks_passed}/${report.summary.checks_total} pasadas`);
    log('🧹', `Items eliminados: ${report.cleanup_executed.total_deleted}`);
    log('📦', `Build final: ${KEEP_ZIP}`);
    
    if (report.final_state.zip_sha256) {
      log('🔐', `SHA256: ${report.final_state.zip_sha256.substring(0, 32)}...`);
    }
    
    log('📋', 'Reporte: DOZO-CleanupReport.json');
    log('🎯', `Resultado: ${report.result}`);
    
    console.log('\n📦 Entorno final:');
    console.log(`   ${normalization.folder_exists ? '✅' : '❌'} ${KEEP_FOLDER}/`);
    console.log(`   ${normalization.zip_exists ? '✅' : '❌'} ${KEEP_ZIP}`);
    console.log('   ✅ DOZO-CleanupReport.json');
    console.log('   ✅ DOZO-FileMap.json');
    
    if (report.result === 'SUCCESS') {
      console.log('\n✅ El entorno está limpio y listo para instalación manual y actualizaciones.\n');
    } else {
      console.log('\n⚠️  Revisa el reporte para detalles de las advertencias.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la limpieza:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();



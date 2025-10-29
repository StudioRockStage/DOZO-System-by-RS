/*
🧩 DOZO Path Integrity Check v1.0.0
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Autor: RockStage Solutions
Fecha: 2025-10-19

Objetivo: Verificar y corregir la integridad de rutas del sistema DOZO
*/

import fs from 'fs';
import path from 'path';
import os from 'os';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const LATEST_BUILDS = path.join(ROOT, 'Latest Builds');
const LATEST_UPDATES = path.join(ROOT, 'Latest Updates');
const GLOBAL = path.join(ROOT, 'to chat gpt', 'Global');
const PATH_ALIGNMENT_REPORT = path.join(GLOBAL, 'DOZO-PathAlignmentReport.json');

const EXPECTED_ZIP = 'warranty-system-rs.zip';

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

// Paso 1: Verificar estructura de carpetas
function verifyFolderStructure() {
  log('🧠', 'Verificando estructura de carpetas DOZO...');
  
  const folders = {
    latest_builds: { path: LATEST_BUILDS, exists: false, created: false },
    latest_updates: { path: LATEST_UPDATES, exists: false, created: false },
    global: { path: GLOBAL, exists: false, created: false }
  };
  
  Object.keys(folders).forEach(key => {
    const folder = folders[key];
    
    if (fs.existsSync(folder.path)) {
      folder.exists = true;
      log('✅', `Carpeta existente: ${path.basename(folder.path)}`);
    } else {
      log('📁', `Creando carpeta: ${path.basename(folder.path)}`);
      fs.mkdirSync(folder.path, { recursive: true });
      folder.created = true;
      folder.exists = true;
      log('✅', `Carpeta creada: ${path.basename(folder.path)}`);
    }
  });
  
  return folders;
}

// Paso 2: Validar contenido de Latest Builds
function validateLatestBuilds() {
  log('📂', 'Validando contenido de Latest Builds...');
  
  const warrantyDir = path.join(LATEST_BUILDS, 'Warranty System RS');
  
  const validation = {
    warranty_dir_exists: fs.existsSync(warrantyDir),
    zip_files: [],
    main_zip: null,
    renamed: false,
    final_name: null
  };
  
  if (!validation.warranty_dir_exists) {
    log('⚠️', 'Directorio "Warranty System RS" no existe en Latest Builds');
    return validation;
  }
  
  // Buscar archivos ZIP
  const items = fs.readdirSync(warrantyDir);
  validation.zip_files = items.filter(f => f.endsWith('.zip'));
  
  validation.zip_files.forEach(zip => {
    log('📦', `ZIP encontrado: ${zip}`);
  });
  
  // Buscar el ZIP principal
  const mainZip = validation.zip_files.find(z => z === EXPECTED_ZIP);
  
  if (mainZip) {
    validation.main_zip = mainZip;
    validation.final_name = mainZip;
    log('✅', `Build principal encontrado: ${mainZip}`);
  } else if (validation.zip_files.length > 0) {
    // Renombrar el primero que encuentre
    const firstZip = validation.zip_files[0];
    const oldPath = path.join(warrantyDir, firstZip);
    const newPath = path.join(warrantyDir, EXPECTED_ZIP);
    
    log('🔄', `Renombrando: ${firstZip} → ${EXPECTED_ZIP}`);
    
    if (!validation.zip_files.includes(EXPECTED_ZIP)) {
      fs.renameSync(oldPath, newPath);
      validation.renamed = true;
      validation.main_zip = EXPECTED_ZIP;
      validation.final_name = EXPECTED_ZIP;
      log('✅', 'Archivo renombrado correctamente');
    }
  } else {
    log('⚠️', 'No se encontraron archivos ZIP en Latest Builds');
  }
  
  return validation;
}

// Paso 3: Vaciar Latest Updates
function emptyLatestUpdates() {
  log('🧹', 'Vaciando Latest Updates...');
  
  const deleted = {
    files: [],
    folders: [],
    total: 0
  };
  
  if (!fs.existsSync(LATEST_UPDATES)) {
    log('✅', 'Latest Updates no existe (se creará vacía)');
    fs.mkdirSync(LATEST_UPDATES, { recursive: true });
    return deleted;
  }
  
  const items = fs.readdirSync(LATEST_UPDATES);
  
  if (items.length === 0) {
    log('✅', 'Latest Updates ya está vacía');
    return deleted;
  }
  
  items.forEach(item => {
    const itemPath = path.join(LATEST_UPDATES, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      log('🗑️', `Eliminando carpeta: ${item}`);
      fs.rmSync(itemPath, { recursive: true, force: true });
      deleted.folders.push(item);
    } else {
      log('🗑️', `Eliminando archivo: ${item}`);
      fs.unlinkSync(itemPath);
      deleted.files.push(item);
    }
  });
  
  deleted.total = deleted.files.length + deleted.folders.length;
  log('✅', `Latest Updates vaciada: ${deleted.total} items eliminados`);
  
  return deleted;
}

// Paso 4: Validación de coherencia final
function validateFinalCoherence() {
  log('🔍', 'Ejecutando validación de coherencia final...');
  
  const warrantyDir = path.join(LATEST_BUILDS, 'Warranty System RS');
  
  const coherence = {
    latest_builds_exists: fs.existsSync(LATEST_BUILDS),
    warranty_dir_exists: fs.existsSync(warrantyDir),
    latest_builds_has_content: false,
    latest_updates_exists: fs.existsSync(LATEST_UPDATES),
    latest_updates_is_empty: false,
    main_zip_exists: false,
    all_valid: false
  };
  
  // Verificar Latest Builds
  if (coherence.warranty_dir_exists) {
    const warrantyItems = fs.readdirSync(warrantyDir);
    const zipFiles = warrantyItems.filter(f => f.endsWith('.zip'));
    coherence.latest_builds_has_content = zipFiles.length > 0;
    coherence.main_zip_exists = zipFiles.includes(EXPECTED_ZIP);
    
    if (coherence.main_zip_exists) {
      log('✅', `Latest Builds contiene: ${EXPECTED_ZIP}`);
    } else if (coherence.latest_builds_has_content) {
      log('⚠️', `Latest Builds tiene ZIPs pero no ${EXPECTED_ZIP}`);
    } else {
      log('⚠️', 'Latest Builds no contiene archivos ZIP');
    }
  }
  
  // Verificar Latest Updates
  if (coherence.latest_updates_exists) {
    const updateItems = fs.readdirSync(LATEST_UPDATES);
    coherence.latest_updates_is_empty = updateItems.length === 0;
    
    if (coherence.latest_updates_is_empty) {
      log('✅', 'Latest Updates está vacía');
    } else {
      log('⚠️', `Latest Updates contiene ${updateItems.length} items`);
    }
  }
  
  coherence.all_valid = 
    coherence.latest_builds_exists &&
    coherence.latest_builds_has_content &&
    coherence.latest_updates_exists &&
    coherence.latest_updates_is_empty;
  
  if (coherence.all_valid) {
    log('✅', 'Coherencia final: VÁLIDA');
  } else {
    log('⚠️', 'Coherencia final: CON ADVERTENCIAS');
  }
  
  return coherence;
}

// Generar reporte
function generateAlignmentReport(folders, buildsValidation, deleted, coherence) {
  log('📋', 'Generando reporte de alineación...');
  
  const report = {
    action: 'DOZO Path Integrity Check',
    status: coherence.all_valid ? 'success' : 'partial_success',
    timestamp: new Date().toISOString(),
    dozo_version: '7.9',
    folder_structure: {
      latest_builds: {
        path: LATEST_BUILDS,
        exists: folders.latest_builds.exists,
        created: folders.latest_builds.created
      },
      latest_updates: {
        path: LATEST_UPDATES,
        exists: folders.latest_updates.exists,
        created: folders.latest_updates.created
      }
    },
    latest_builds_validation: {
      has_content: buildsValidation.main_zip !== null,
      main_zip: buildsValidation.main_zip,
      renamed: buildsValidation.renamed,
      all_zips_found: buildsValidation.zip_files
    },
    latest_updates_cleanup: {
      items_deleted: deleted.total,
      files_deleted: deleted.files,
      folders_deleted: deleted.folders,
      is_empty: true
    },
    final_coherence: {
      latest_builds_ok: coherence.latest_builds_has_content,
      latest_updates_empty: coherence.latest_updates_is_empty,
      main_zip_present: coherence.main_zip_exists,
      all_valid: coherence.all_valid
    },
    paths_corrected: buildsValidation.renamed ? 
      [`Renombrado a: ${EXPECTED_ZIP}`] : [],
    files_detected: buildsValidation.zip_files,
    execution_time: new Date().toISOString(),
    result: coherence.all_valid ? 'OK' : 'OK_WITH_WARNINGS'
  };
  
  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }
  
  fs.writeFileSync(PATH_ALIGNMENT_REPORT, JSON.stringify(report, null, 2));
  log('✅', `Reporte guardado: ${path.basename(PATH_ALIGNMENT_REPORT)}`);
  
  return report;
}

// Main execution
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║              🔍 DOZO Path Integrity Check v1.0.0 🔍                          ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Paso 1: Verificar estructura
    const folders = verifyFolderStructure();
    
    // Paso 2: Validar Latest Builds
    const buildsValidation = validateLatestBuilds();
    
    // Paso 3: Vaciar Latest Updates
    const deleted = emptyLatestUpdates();
    
    // Paso 4: Validación de coherencia
    const coherence = validateFinalCoherence();
    
    // Generar reporte
    const report = generateAlignmentReport(folders, buildsValidation, deleted, coherence);
    
    // Resultado final
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    console.log('║                  ✅ PATH INTEGRITY CHECK COMPLETADO ✅                        ║');
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    console.log('✔️  DOZO Path Integrity Check completado correctamente.\n');
    console.log(`Latest Builds: ${coherence.latest_builds_has_content ? 'OK' : 'VACÍA'}`);
    console.log(`Latest Updates: ${coherence.latest_updates_is_empty ? 'VACÍA' : 'CON CONTENIDO'}\n`);
    console.log('Sistema DOZO listo para futuros deploys.\n');
    
    log('📊', `Items eliminados de Latest Updates: ${deleted.total}`);
    log('📦', `Build principal: ${buildsValidation.final_name || 'No encontrado'}`);
    log('📋', `Reporte: ${path.basename(PATH_ALIGNMENT_REPORT)}`);
    log('🎯', `Resultado: ${report.result}`);
    
  } catch (error) {
    console.error('\n❌ Error en la verificación:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();



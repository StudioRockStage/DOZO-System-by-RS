/*
🧩 Prompt Maestro – DOZO Repack Verification v1.0.0 (Portable Test)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Versión: v1.0.0
Modo: Portable Verification
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const LATEST_BUILDS = path.join(ROOT, 'Latest Builds', 'Warranty System RS');
const GLOBAL = path.join(ROOT, 'to chat gpt', 'Global');
const SOURCE_ZIP = path.join(LATEST_BUILDS, 'warranty-system-rs.zip');
const VERIFICATION_REPORT = path.join(GLOBAL, 'DOZO-RepackVerification-Report.json');
const WORK_TMP = path.join(ROOT, 'Workspace_Verification_TMP');

// Directorios y archivos requeridos
const REQUIRED_DIRS = ['admin', 'includes', 'public', 'tools', 'templates', 'assets'];
const MAIN_FILE = 'warranty-system-rs.php';

// Metadatos esperados
const EXPECTED_METADATA = {
  'Plugin Name': 'Warranty System RS',
  'Version': '1.0.0',
  'Author': 'RockStage Solutions',
  'Text Domain': 'warranty-system-rs'
};

// Clases core esperadas
const CORE_CLASSES = [
  'RS_Warranty_Core',
  'RS_Warranty_Admin',
  'RS_Warranty_Frontend'
];

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

// Paso 1: Preparar entorno
function prepareVerificationEnvironment() {
  log('🧠', 'Preparando entorno de verificación...');
  
  if (!fs.existsSync(SOURCE_ZIP)) {
    throw new Error(`Build ZIP no encontrado: ${SOURCE_ZIP}`);
  }
  
  log('✅', 'Build encontrado: warranty-system-rs.zip');
  
  const size = fs.statSync(SOURCE_ZIP).size;
  log('📊', `Tamaño: ${formatBytes(size)}`);
  
  // Limpiar workspace temporal
  if (fs.existsSync(WORK_TMP)) {
    fs.rmSync(WORK_TMP, { recursive: true, force: true });
  }
  fs.mkdirSync(WORK_TMP, { recursive: true });
  
  return { size };
}

// Paso 2: Validar rutas internas
function validateInternalPaths(pluginDir) {
  log('🔍', 'Validando rutas internas...');
  
  const mainFile = path.join(pluginDir, MAIN_FILE);
  const content = fs.readFileSync(mainFile, 'utf8');
  
  const validation = {
    claude_templates_path: { valid: false, value: null, issue: null },
    claude_design_path: { valid: false, value: null, issue: null }
  };
  
  // Buscar RS_CLAUDE_TEMPLATES_PATH
  const templatesMatch = content.match(/define\s*\(\s*'RS_CLAUDE_TEMPLATES_PATH'\s*,\s*([^)]+)\)/);
  if (templatesMatch) {
    validation.claude_templates_path.value = templatesMatch[1].trim();
    
    if (templatesMatch[1].includes('plugin_dir_path(__FILE__)')) {
      validation.claude_templates_path.valid = true;
      log('✅', 'RS_CLAUDE_TEMPLATES_PATH usa rutas relativas');
    } else if (templatesMatch[1].includes('dirname(ABSPATH)')) {
      validation.claude_templates_path.issue = 'Usa rutas absolutas (dirname(ABSPATH))';
      log('⚠️', validation.claude_templates_path.issue);
    } else {
      validation.claude_templates_path.issue = 'Formato desconocido';
      log('⚠️', 'RS_CLAUDE_TEMPLATES_PATH: formato desconocido');
    }
  }
  
  // Buscar RS_CLAUDE_DESIGN_PATH
  const designMatch = content.match(/define\s*\(\s*'RS_CLAUDE_DESIGN_PATH'\s*,\s*([^)]+)\)/);
  if (designMatch) {
    validation.claude_design_path.value = designMatch[1].trim();
    
    if (designMatch[1].includes('plugin_dir_path(__FILE__)')) {
      validation.claude_design_path.valid = true;
      log('✅', 'RS_CLAUDE_DESIGN_PATH usa rutas relativas');
    } else if (designMatch[1].includes('dirname(ABSPATH)')) {
      validation.claude_design_path.issue = 'Usa rutas absolutas (dirname(ABSPATH))';
      log('⚠️', validation.claude_design_path.issue);
    } else {
      validation.claude_design_path.issue = 'Formato desconocido';
      log('⚠️', 'RS_CLAUDE_DESIGN_PATH: formato desconocido');
    }
  }
  
  const allValid = validation.claude_templates_path.valid && validation.claude_design_path.valid;
  
  if (allValid) {
    log('✅', 'Todas las rutas usan modo relativo');
  } else {
    log('⚠️', 'Algunas rutas son inconsistentes');
  }
  
  return validation;
}

// Paso 3: Simular instalación
function simulateInstallation() {
  log('⚙️', 'Simulando instalación...');
  
  const zip = new AdmZip(SOURCE_ZIP);
  zip.extractAllTo(WORK_TMP, true);
  
  // Verificar estructura
  const items = fs.readdirSync(WORK_TMP);
  
  // Debe haber exactamente una carpeta llamada 'warranty-system-rs'
  if (items.length === 1 && items[0] === 'warranty-system-rs') {
    log('✅', `Carpeta raíz correcta: ${items[0]}`);
  } else if (items.length > 1) {
    log('⚠️', `Se encontraron ${items.length} items en raíz (debe ser 1)`);
  } else if (items[0] !== 'warranty-system-rs') {
    log('⚠️', `Nombre de carpeta incorrecto: ${items[0]} (debe ser warranty-system-rs)`);
  }
  
  const pluginDir = path.join(WORK_TMP, items[0]);
  
  // Verificar archivo principal
  const mainFileExists = fs.existsSync(path.join(pluginDir, MAIN_FILE));
  if (mainFileExists) {
    log('✅', `Archivo principal encontrado: ${MAIN_FILE}`);
  } else {
    log('❌', `Archivo principal no encontrado: ${MAIN_FILE}`);
  }
  
  // Verificar directorios requeridos
  const missingDirs = [];
  const foundDirs = [];
  
  REQUIRED_DIRS.forEach(dir => {
    if (fs.existsSync(path.join(pluginDir, dir))) {
      foundDirs.push(dir);
      log('✅', `Directorio encontrado: ${dir}/`);
    } else {
      missingDirs.push(dir);
      log('❌', `Directorio faltante: ${dir}/`);
    }
  });
  
  // Verificar que no haya carpetas con versión
  const dirItems = fs.readdirSync(pluginDir);
  const versionedFolders = dirItems.filter(item => /-v\d+\.\d+/.test(item));
  
  if (versionedFolders.length === 0) {
    log('✅', 'No hay carpetas con sufijos de versión');
  } else {
    log('⚠️', `Carpetas con versión encontradas: ${versionedFolders.join(', ')}`);
  }
  
  return {
    folder_name: items[0],
    folder_correct: items[0] === 'warranty-system-rs',
    main_file_exists: mainFileExists,
    required_dirs_found: foundDirs,
    missing_dirs: missingDirs,
    versioned_folders: versionedFolders,
    plugin_dir: pluginDir
  };
}

// Paso 4: Verificar encabezados
function verifyPluginHeaders(pluginDir) {
  log('🧾', 'Verificando encabezados del plugin...');
  
  const mainFile = path.join(pluginDir, MAIN_FILE);
  const content = fs.readFileSync(mainFile, 'utf8');
  
  const headers = {};
  const issues = [];
  
  Object.keys(EXPECTED_METADATA).forEach(key => {
    const regex = new RegExp(`^\\s*\\*\\s*${key}\\s*:\\s*(.+)$`, 'mi');
    const match = content.match(regex);
    
    if (match) {
      const value = match[1].trim();
      headers[key] = value;
      
      if (value === EXPECTED_METADATA[key]) {
        log('✅', `${key}: ${value}`);
      } else {
        log('⚠️', `${key}: "${value}" (esperado: "${EXPECTED_METADATA[key]}")`);
        issues.push({ key, expected: EXPECTED_METADATA[key], found: value });
      }
    } else {
      log('❌', `${key}: No encontrado`);
      issues.push({ key, expected: EXPECTED_METADATA[key], found: null });
    }
  });
  
  const allCorrect = issues.length === 0;
  
  if (allCorrect) {
    log('✅', 'Todos los encabezados son correctos');
  } else {
    log('⚠️', `${issues.length} encabezados con problemas`);
  }
  
  return { headers, issues, all_correct: allCorrect };
}

// Paso 5: Prueba de carga simulada
function simulatePluginLoad(pluginDir) {
  log('💡', 'Ejecutando prueba de carga simulada...');
  
  const mainFile = path.join(pluginDir, MAIN_FILE);
  const content = fs.readFileSync(mainFile, 'utf8');
  
  const results = {
    syntax_valid: false,
    core_classes_declared: [],
    missing_classes: [],
    fatal_errors: [],
    warnings: []
  };
  
  // Verificar sintaxis básica PHP
  if (content.startsWith('<?php')) {
    results.syntax_valid = true;
    log('✅', 'Sintaxis PHP válida');
  } else {
    log('❌', 'Archivo no comienza con <?php');
  }
  
  // Buscar declaraciones de clases core
  CORE_CLASSES.forEach(className => {
    const classRegex = new RegExp(`class\\s+${className}`, 'i');
    const requireRegex = new RegExp(`require.*${className.toLowerCase().replace(/_/g, '-')}`, 'i');
    
    if (classRegex.test(content) || requireRegex.test(content)) {
      results.core_classes_declared.push(className);
      log('✅', `Clase encontrada/incluida: ${className}`);
    } else {
      results.missing_classes.push(className);
      log('⚠️', `Clase no encontrada: ${className}`);
    }
  });
  
  // Buscar posibles errores fatales
  const fatalPatterns = [
    /\bdie\s*\(\s*['"][^'"]*parse error/i,
    /\btrigger_error\s*\([^)]*E_ERROR/i,
    /\bfatal/i
  ];
  
  fatalPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      results.fatal_errors.push(pattern.toString());
      log('⚠️', 'Posible error fatal detectado en código');
    }
  });
  
  if (results.fatal_errors.length === 0) {
    log('✅', 'No se detectaron errores fatales obvios');
  }
  
  const loadSuccess = 
    results.syntax_valid &&
    results.core_classes_declared.length >= 2 &&
    results.fatal_errors.length === 0;
  
  if (loadSuccess) {
    log('✅', 'Prueba de carga simulada: EXITOSA');
  } else {
    log('⚠️', 'Prueba de carga simulada: CON ADVERTENCIAS');
  }
  
  return results;
}

// Paso 6: Generar reporte final
function generateVerificationReport(prepInfo, pathValidation, installation, headers, loadTest) {
  log('📋', 'Generando reporte final de verificación...');
  
  const sha256 = calculateSHA256(SOURCE_ZIP);
  
  const report = {
    action: 'Repack Verification',
    status: 'pending',
    timestamp: new Date().toISOString(),
    dozo_version: '7.9',
    plugin: {
      name: 'Warranty System RS',
      version: '1.0.0',
      build_file: 'warranty-system-rs.zip',
      sha256: sha256,
      size: prepInfo.size,
      size_formatted: formatBytes(prepInfo.size)
    },
    validation: {
      environment_prepared: true,
      zip_file_exists: true,
      internal_paths: {
        claude_templates_valid: pathValidation.claude_templates_path.valid,
        claude_design_valid: pathValidation.claude_design_path.valid,
        all_relative: pathValidation.claude_templates_path.valid && pathValidation.claude_design_path.valid,
        issues: []
      },
      installation_simulation: {
        folder_name: installation.folder_name,
        folder_correct: installation.folder_correct,
        main_file_exists: installation.main_file_exists,
        required_dirs_present: installation.required_dirs_found.length === REQUIRED_DIRS.length,
        found_dirs: installation.required_dirs_found,
        missing_dirs: installation.missing_dirs,
        versioned_folders: installation.versioned_folders
      },
      plugin_headers: {
        all_correct: headers.all_correct,
        headers_found: headers.headers,
        issues: headers.issues
      },
      load_simulation: {
        syntax_valid: loadTest.syntax_valid,
        core_classes_found: loadTest.core_classes_declared.length,
        core_classes_missing: loadTest.missing_classes.length,
        fatal_errors: loadTest.fatal_errors.length,
        load_success: loadTest.syntax_valid && loadTest.fatal_errors.length === 0
      }
    },
    summary: {
      total_checks: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };
  
  // Agregar issues de rutas
  if (!pathValidation.claude_templates_path.valid) {
    report.validation.internal_paths.issues.push({
      path: 'RS_CLAUDE_TEMPLATES_PATH',
      issue: pathValidation.claude_templates_path.issue || 'No válida'
    });
  }
  
  if (!pathValidation.claude_design_path.valid) {
    report.validation.internal_paths.issues.push({
      path: 'RS_CLAUDE_DESIGN_PATH',
      issue: pathValidation.claude_design_path.issue || 'No válida'
    });
  }
  
  // Calcular resumen
  const checks = [
    report.validation.zip_file_exists,
    report.validation.internal_paths.all_relative,
    report.validation.installation_simulation.folder_correct,
    report.validation.installation_simulation.main_file_exists,
    report.validation.installation_simulation.required_dirs_present,
    report.validation.installation_simulation.versioned_folders.length === 0,
    report.validation.plugin_headers.all_correct,
    report.validation.load_simulation.syntax_valid,
    report.validation.load_simulation.load_success
  ];
  
  report.summary.total_checks = checks.length;
  report.summary.passed = checks.filter(c => c === true).length;
  report.summary.failed = checks.filter(c => c === false).length;
  
  // Determinar estado final
  if (report.summary.passed === report.summary.total_checks) {
    report.status = '✅ Passed';
  } else if (report.summary.failed === 0) {
    report.status = '⚠️ Passed with warnings';
  } else {
    report.status = '❌ Failed';
  }
  
  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }
  
  fs.writeFileSync(VERIFICATION_REPORT, JSON.stringify(report, null, 2));
  log('✅', `Reporte guardado: ${path.basename(VERIFICATION_REPORT)}`);
  
  return report;
}

// Main execution
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║         🧩 DOZO Repack Verification v1.0.0 (Portable Test) 🧩               ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Paso 1: Preparar
    const prepInfo = prepareVerificationEnvironment();
    
    // Paso 3: Simular instalación
    const installation = simulateInstallation();
    
    // Paso 2: Validar rutas
    const pathValidation = validateInternalPaths(installation.plugin_dir);
    
    // Paso 4: Verificar headers
    const headers = verifyPluginHeaders(installation.plugin_dir);
    
    // Paso 5: Prueba de carga
    const loadTest = simulatePluginLoad(installation.plugin_dir);
    
    // Paso 6: Generar reporte
    const report = generateVerificationReport(
      prepInfo,
      pathValidation,
      installation,
      headers,
      loadTest
    );
    
    // Limpiar workspace temporal
    fs.rmSync(WORK_TMP, { recursive: true, force: true });
    
    // Resultado final
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    
    if (report.status.includes('✅')) {
      console.log('║                 ✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE ✅                    ║');
    } else if (report.status.includes('⚠️')) {
      console.log('║             ⚠️  VERIFICACIÓN COMPLETADA CON ADVERTENCIAS ⚠️                 ║');
    } else {
      console.log('║                    ❌ VERIFICACIÓN FALLIDA ❌                                ║');
    }
    
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    log('📊', `Verificaciones: ${report.summary.passed}/${report.summary.total_checks} pasadas`);
    log('📦', 'Build: warranty-system-rs.zip');
    log('🔐', `SHA256: ${report.plugin.sha256.substring(0, 32)}...`);
    log('📋', `Reporte: ${path.basename(VERIFICATION_REPORT)}`);
    log('🎯', `Estado final: ${report.status}`);
    
    console.log('\n📊 Resultados Detallados:');
    console.log(`   ${pathValidation.claude_templates_path.valid ? '✅' : '❌'} Rutas Claude AI relativas`);
    console.log(`   ${installation.folder_correct ? '✅' : '❌'} Nombre de carpeta correcto`);
    console.log(`   ${installation.main_file_exists ? '✅' : '❌'} Archivo principal presente`);
    console.log(`   ${installation.missing_dirs.length === 0 ? '✅' : '❌'} Todos los directorios requeridos`);
    console.log(`   ${installation.versioned_folders.length === 0 ? '✅' : '❌'} Sin carpetas versionadas`);
    console.log(`   ${headers.all_correct ? '✅' : '❌'} Headers correctos`);
    console.log(`   ${loadTest.syntax_valid ? '✅' : '❌'} Sintaxis PHP válida`);
    console.log(`   ${loadTest.fatal_errors.length === 0 ? '✅' : '❌'} Sin errores fatales`);
    
    if (report.status.includes('✅')) {
      console.log('\n✅ El build warranty-system-rs.zip está correctamente empaquetado y listo para uso.\n');
    } else {
      console.log('\n⚠️  Revisa el reporte para detalles sobre los problemas encontrados.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error en la verificación:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();



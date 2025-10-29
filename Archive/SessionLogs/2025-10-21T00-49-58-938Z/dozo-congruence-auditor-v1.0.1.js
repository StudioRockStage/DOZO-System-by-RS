/*
🧠 DOZO Smart Congruence Auditor (Warranty System RS v1.0.1)
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Analizar y garantizar la congruencia total de la estructura, nombres, versiones y dependencias del plugin Warranty System RS v1.0.1.
*/

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const baseDir = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const latestBuilds = path.join(baseDir, 'Latest Builds');
const pluginZip = path.join(latestBuilds, 'Warranty_System_RS_v1.0.1.zip');
const extractedDir = path.join(latestBuilds, 'Warranty_System_RS_v1.0.1_extracted');
const reportPath = path.join(baseDir, 'to chat gpt', 'Global', 'DOZO-Congruence-Audit.json');

const issues = [];
const warnings = [];
const validations = [];

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    issues.push({ type: 'missing_file', file: path.relative(extractedDir, filePath), description });
    console.log(`   ❌ FALTA: ${description}`);
  } else {
    validations.push({ type: 'file_exists', file: path.relative(extractedDir, filePath), description });
    console.log(`   ✅ ${description}`);
  }
  return exists;
}

function validateHeader(content, filePath) {
  console.log('\n📋 Validando headers del plugin...');
  const expected = [
    { key: 'Plugin Name', value: 'Warranty System RS' },
    { key: 'Author', value: 'RockStage Solutions' },
    { key: 'Version', value: '1.0.1' },
    { key: 'Requires PHP', value: '7.4' },
    { key: 'Text Domain', value: 'rockstage-warranty' }
  ];

  expected.forEach(field => {
    const regex = new RegExp(`\\*\\s*${field.key}:\\s*(.*)`, 'i');
    const match = content.match(regex);
    if (!match || match[1].trim() !== field.value) {
      issues.push({ 
        type: 'header_mismatch', 
        field: field.key, 
        expected: field.value, 
        found: match ? match[1].trim() : 'undefined',
        file: path.relative(extractedDir, filePath)
      });
      console.log(`   ❌ ${field.key}: esperado "${field.value}", encontrado "${match ? match[1].trim() : 'undefined'}"`);
    } else {
      validations.push({ type: 'header_valid', field: field.key, value: field.value });
      console.log(`   ✅ ${field.key}: ${field.value}`);
    }
  });
}

function validateConstants(content, filePath) {
  console.log('\n🔧 Validando constantes PHP...');
  const constants = [
    { name: 'RS_WARRANTY_VERSION', expectedValue: '1.0.1' },
    { name: 'RS_WARRANTY_PLUGIN_NAME', expectedValue: 'Warranty System RS' },
    { name: 'RS_WARRANTY_AUTHOR', expectedValue: 'RockStage Solutions' }
  ];
  
  constants.forEach(constant => {
    const regex = new RegExp(`define\\(\\s*['"]${constant.name}['"]\\s*,\\s*['"]([^'"]+)['"]\\s*\\)`, 'i');
    const match = content.match(regex);
    
    if (!match) {
      issues.push({ type: 'missing_constant', constant: constant.name, file: path.relative(extractedDir, filePath) });
      console.log(`   ❌ Constante faltante: ${constant.name}`);
    } else if (match[1] !== constant.expectedValue) {
      issues.push({ 
        type: 'constant_value_mismatch', 
        constant: constant.name, 
        expected: constant.expectedValue,
        found: match[1],
        file: path.relative(extractedDir, filePath)
      });
      console.log(`   ❌ ${constant.name}: esperado "${constant.expectedValue}", encontrado "${match[1]}"`);
    } else {
      validations.push({ type: 'constant_valid', constant: constant.name, value: match[1] });
      console.log(`   ✅ ${constant.name} = '${match[1]}'`);
    }
  });
}

function validateHooks(content, filePath) {
  console.log('\n🔗 Validando hooks de WordPress...');
  const hooks = [
    { name: 'plugins_loaded', optional: false },
    { name: 'register_activation_hook', optional: true },
    { name: 'register_deactivation_hook', optional: true }
  ];
  
  hooks.forEach(hook => {
    if (content.includes(hook.name)) {
      validations.push({ type: 'hook_found', hook: hook.name });
      console.log(`   ✅ Hook encontrado: ${hook.name}`);
    } else if (!hook.optional) {
      issues.push({ type: 'missing_hook', hook: hook.name, file: path.relative(extractedDir, filePath) });
      console.log(`   ❌ Hook faltante: ${hook.name}`);
    } else {
      warnings.push({ type: 'optional_hook_missing', hook: hook.name });
      console.log(`   ⚠️  Hook opcional no encontrado: ${hook.name}`);
    }
  });
}

function validateDirectoryStructure(baseDir) {
  console.log('\n📁 Validando estructura de directorios...');
  
  // Expected directories - adjusted to actual structure
  const expectedDirs = [
    { path: 'includes', required: true, description: 'Clases y funciones core' },
    { path: 'templates', required: true, description: 'Templates del plugin' },
    { path: 'assets', required: true, description: 'CSS, JS y recursos' },
    { path: 'Admin Panels', required: false, description: 'Paneles de administración' },
    { path: 'tools', required: false, description: 'Herramientas adicionales' }
  ];
  
  expectedDirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir.path);
    if (!fs.existsSync(dirPath)) {
      if (dir.required) {
        issues.push({ type: 'missing_directory', dir: dir.path, description: dir.description });
        console.log(`   ❌ Directorio faltante (requerido): ${dir.path} - ${dir.description}`);
      } else {
        warnings.push({ type: 'missing_optional_directory', dir: dir.path, description: dir.description });
        console.log(`   ⚠️  Directorio opcional no encontrado: ${dir.path}`);
      }
    } else {
      validations.push({ type: 'directory_exists', dir: dir.path, description: dir.description });
      console.log(`   ✅ ${dir.path} - ${dir.description}`);
    }
  });
}

function validateAdminPanel(baseDir) {
  console.log('\n🎨 Validando archivos del Admin Panel...');
  
  const adminFiles = [
    { path: 'includes/class-warranty-admin.php', description: 'Core Admin Class' },
    { path: 'templates/admin/dashboard.php', description: 'Admin Dashboard' },
    { path: 'templates/admin/settings.php', description: 'Admin Settings' },
    { path: 'templates/admin/create-warranty.php', description: 'Create Warranty Form' },
    { path: 'assets/css/admin-style.css', description: 'Admin CSS' },
    { path: 'assets/js/admin-script.js', description: 'Admin JavaScript' }
  ];
  
  adminFiles.forEach(file => {
    checkFileExists(path.join(baseDir, file.path), file.description);
  });
}

function validateNaming(baseDir) {
  console.log('\n📝 Validando nomenclatura de archivos y carpetas...');
  
  const files = fs.readdirSync(baseDir, { withFileTypes: true });
  let namingIssues = 0;
  
  files.forEach(file => {
    // Check for naming patterns that should match plugin standards
    if (file.isFile() && file.name.endsWith('.php')) {
      // PHP files should follow naming conventions
      if (!file.name.match(/^(warranty|class-|index|functions|template)/i) && 
          file.name !== 'warranty-system-rs.php') {
        warnings.push({ 
          type: 'naming_convention_warning', 
          file: file.name, 
          message: 'Archivo PHP con nomenclatura no estándar' 
        });
        namingIssues++;
      }
    }
  });
  
  if (namingIssues === 0) {
    console.log('   ✅ Nomenclatura de archivos correcta');
    validations.push({ type: 'naming_valid', message: 'Todos los archivos siguen convenciones' });
  } else {
    console.log(`   ⚠️  ${namingIssues} archivos con nomenclatura no estándar (ver reporte)`);
  }
}

function validateVersionConsistency() {
  console.log('\n🔄 Validando consistencia de versiones...');
  
  // Check version in different files
  const workflowDB = path.join(baseDir, 'Workflow DB');
  const files = [
    { path: path.join(workflowDB, 'ActivePlugin.json'), key: 'version' },
    { path: path.join(workflowDB, 'Versions.json'), key: 'version' },
    { path: path.join(baseDir, 'updates', 'warranty-system', 'update.json'), key: 'version' }
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      try {
        const content = JSON.parse(fs.readFileSync(file.path, 'utf8'));
        const version = content[file.key];
        if (version === '1.0.1') {
          validations.push({ type: 'version_consistent', file: path.basename(file.path), version });
          console.log(`   ✅ ${path.basename(file.path)}: v${version}`);
        } else {
          issues.push({ 
            type: 'version_mismatch', 
            file: path.basename(file.path), 
            expected: '1.0.1', 
            found: version 
          });
          console.log(`   ❌ ${path.basename(file.path)}: esperado v1.0.1, encontrado v${version}`);
        }
      } catch (err) {
        warnings.push({ type: 'file_parse_error', file: path.basename(file.path), error: err.message });
        console.log(`   ⚠️  Error al leer ${path.basename(file.path)}: ${err.message}`);
      }
    }
  });
}

(async () => {
  console.log('\n🧠 DOZO Smart Congruence Auditor - Warranty System RS v1.0.1');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(pluginZip)) {
    console.error('❌ No se encontró el archivo .zip del plugin:', pluginZip);
    process.exit(1);
  }

  console.log('📦 Archivo ZIP encontrado:', path.basename(pluginZip));
  console.log('📊 Tamaño:', (fs.statSync(pluginZip).size / 1024 / 1024).toFixed(2), 'MB\n');

  // 1️⃣ Extraer ZIP
  console.log('📂 Extrayendo ZIP para análisis...');
  if (fs.existsSync(extractedDir)) {
    fs.rmSync(extractedDir, { recursive: true });
  }
  
  try {
    execSync(`unzip -q "${pluginZip}" -d "${extractedDir}"`, { stdio: 'pipe' });
    console.log('   ✅ Extracción completada\n');
  } catch (err) {
    console.error('   ❌ Error al extraer ZIP:', err.message);
    process.exit(1);
  }

  // Find the actual plugin directory (it's inside warranty-system-rs/)
  const pluginDir = path.join(extractedDir, 'warranty-system-rs');
  
  if (!fs.existsSync(pluginDir)) {
    console.error('   ❌ No se encontró el directorio del plugin dentro del ZIP');
    process.exit(1);
  }

  // 2️⃣ Validar estructura de directorios
  validateDirectoryStructure(pluginDir);

  // 3️⃣ Analizar archivo principal
  console.log('\n📄 Analizando archivo principal del plugin...');
  const mainFile = path.join(pluginDir, 'warranty-system-rs.php');
  
  if (!checkFileExists(mainFile, 'Archivo principal (warranty-system-rs.php)')) {
    issues.push({ type: 'critical', message: 'Archivo principal no encontrado: warranty-system-rs.php' });
  } else {
    const content = fs.readFileSync(mainFile, 'utf8');
    validateHeader(content, mainFile);
    validateConstants(content, mainFile);
    validateHooks(content, mainFile);
  }

  // 4️⃣ Validar Admin Panel
  validateAdminPanel(pluginDir);

  // 5️⃣ Validar nomenclatura
  validateNaming(pluginDir);

  // 6️⃣ Validar consistencia de versiones
  validateVersionConsistency();

  // 7️⃣ Generar estadísticas
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE AUDITORÍA\n');
  console.log(`   ✅ Validaciones exitosas: ${validations.length}`);
  console.log(`   ⚠️  Advertencias: ${warnings.length}`);
  console.log(`   ❌ Problemas encontrados: ${issues.length}`);
  
  const status = issues.length === 0 ? 'PASSED' : 'ISSUES_FOUND';
  const statusEmoji = issues.length === 0 ? '✅' : '⚠️';
  
  console.log(`\n   ${statusEmoji} Estado: ${status}`);

  // 8️⃣ Generar reporte
  const report = {
    plugin: 'Warranty System RS',
    version: '1.0.1',
    author: 'RockStage Solutions',
    audit_status: status,
    summary: {
      total_validations: validations.length,
      total_warnings: warnings.length,
      total_issues: issues.length,
      congruence_score: validations.length > 0 ? 
        ((validations.length / (validations.length + issues.length)) * 100).toFixed(1) + '%' : '0%'
    },
    validations,
    warnings,
    issues,
    timestamp: new Date().toISOString(),
    audited_zip: path.basename(pluginZip),
    extracted_to: extractedDir
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n✅ Auditoría completada.');
  console.log(`📄 Reporte detallado: ${reportPath}`);
  console.log(`🎯 Score de congruencia: ${report.summary.congruence_score}`);
  
  // Cleanup
  console.log('\n🧹 Limpiando archivos temporales...');
  fs.rmSync(extractedDir, { recursive: true });
  console.log('   ✅ Limpieza completada');
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════\n');
  
  if (issues.length > 0) {
    console.log('⚠️  Se encontraron problemas. Revisa el reporte para más detalles.\n');
  } else {
    console.log('🎉 ¡Plugin completamente congruente y validado!\n');
  }
})();


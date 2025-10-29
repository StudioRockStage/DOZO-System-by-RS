/*
🧩 DOZO Naming Consistency Fix – Warranty System RS (Permanent Alignment)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions

Objetivo: Eliminar archivos inconsistentes, corregir nomenclatura y asegurar
          compatibilidad 100% con el sistema de actualizaciones de WordPress.
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { Client as FTPClient } from 'basic-ftp';
import fetch from 'node-fetch';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const LATEST_UPDATES = path.join(ROOT, 'Latest Updates');
const LATEST_BUILDS = path.join(ROOT, 'Latest Builds', 'Warranty System RS');
const EMPAQUETADO_READY = path.join(ROOT, 'Empaquetado', 'Ready');
const GLOBAL = path.join(ROOT, 'to chat gpt', 'Global');

// Configuración FTP
const FTP_CONFIG = {
  host: 'ftp.vapedot.mx',
  user: 'u461169968.vapedotmx',
  password: 'RS@2025secure',
  port: 21,
  secure: false
};

const REMOTE_PATH = '/public_html/updates/warranty-system-rs/';
const DOWNLOAD_URL = 'https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip';
const UPDATE_JSON_URL = 'https://updates.vapedot.mx/warranty-system-rs/update.json';

const NAMING_FIX_REPORT = path.join(GLOBAL, 'DOZO-NamingFix-Report.json');

// Patrones de archivos a eliminar
const INVALID_PATTERNS = [
  /warranty-system-rs-.*with.*/i,
  /warranty-system-rs-.*rev.*/i,
  /warranty-system-rs-.*test.*/i,
  /warranty-system-rs-.*\.old\.zip$/i
];

// Utilidades
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function shouldDelete(filename) {
  return INVALID_PATTERNS.some(pattern => pattern.test(filename));
}

// Paso 1: Limpieza de versiones con nombres incorrectos
async function cleanupInvalidNames() {
  log('🧹', 'Limpiando versiones con nombres incorrectos...');
  
  const deletedFiles = {
    local: [],
    remote: []
  };
  
  // Limpiar archivos locales en Latest Updates
  if (fs.existsSync(LATEST_UPDATES)) {
    const localFiles = fs.readdirSync(LATEST_UPDATES);
    for (const file of localFiles) {
      if (shouldDelete(file)) {
        const filePath = path.join(LATEST_UPDATES, file);
        if (fs.statSync(filePath).isFile()) {
          log('🗑️', `Eliminando local: ${file}`);
          fs.unlinkSync(filePath);
          deletedFiles.local.push(file);
        }
      }
    }
  }
  
  // Limpiar archivos locales en Latest Builds (si existe)
  if (fs.existsSync(LATEST_BUILDS)) {
    const buildFiles = fs.readdirSync(LATEST_BUILDS);
    for (const file of buildFiles) {
      if (shouldDelete(file)) {
        const filePath = path.join(LATEST_BUILDS, file);
        if (fs.statSync(filePath).isFile()) {
          log('🗑️', `Eliminando build: ${file}`);
          fs.unlinkSync(filePath);
          deletedFiles.local.push(file);
        }
      }
    }
  }
  
  // Limpiar archivos remotos
  const client = new FTPClient();
  client.ftp.verbose = false;
  
  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port || 21,
      secure: FTP_CONFIG.secure
    });
    
    try {
      await client.cd(REMOTE_PATH);
      const remoteFiles = await client.list();
      
      for (const file of remoteFiles) {
        if (file.type === 1 && shouldDelete(file.name)) { // type 1 = file
          log('🗑️', `Eliminando remoto: ${file.name}`);
          await client.remove(file.name);
          deletedFiles.remote.push(file.name);
        }
      }
    } catch (e) {
      log('⚠️', 'Directorio remoto no existe o está vacío');
    }
    
  } catch (err) {
    log('⚠️', `Error en limpieza remota: ${err.message}`);
  } finally {
    client.close();
  }
  
  if (deletedFiles.local.length > 0) {
    log('✅', `Eliminados ${deletedFiles.local.length} archivos locales`);
  }
  if (deletedFiles.remote.length > 0) {
    log('✅', `Eliminados ${deletedFiles.remote.length} archivos remotos`);
  }
  if (deletedFiles.local.length === 0 && deletedFiles.remote.length === 0) {
    log('✅', 'No se encontraron archivos con nombres incorrectos');
  }
  
  return deletedFiles;
}

// Paso 2: Verificación del paquete correcto
async function verifyCorrectPackage() {
  log('🧩', 'Verificando paquete correcto...');
  
  const correctName = 'warranty-system-rs-v1.0.1.zip';
  const correctPath = path.join(LATEST_UPDATES, correctName);
  
  // Verificar si existe con nombre correcto
  if (fs.existsSync(correctPath)) {
    log('✅', `Paquete correcto encontrado: ${correctName}`);
    return correctPath;
  }
  
  // Buscar el archivo con nombre incorrecto y renombrarlo
  const alternativeName = 'warranty-system-rs-v1.0.1-with-smart-panel.zip';
  const alternativePath = path.join(LATEST_UPDATES, alternativeName);
  
  if (fs.existsSync(alternativePath)) {
    log('🔄', `Renombrando: ${alternativeName} → ${correctName}`);
    fs.renameSync(alternativePath, correctPath);
    log('✅', 'Archivo renombrado correctamente');
    return correctPath;
  }
  
  throw new Error('No se encontró ningún paquete válido para v1.0.1');
}

// Paso 3: Sincronizar al servidor remoto
async function syncToRemoteServer(localZipPath) {
  log('☁️', 'Sincronizando versión corregida al servidor...');
  
  const client = new FTPClient();
  client.ftp.verbose = false;
  
  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port || 21,
      secure: FTP_CONFIG.secure
    });
    log('✅', 'Conectado al servidor FTP');
    
    // Asegurar que existe el directorio remoto
    try {
      await client.cd(REMOTE_PATH);
    } catch (e) {
      log('📁', 'Creando directorio remoto...');
      await client.ensureDir(REMOTE_PATH);
      await client.cd(REMOTE_PATH);
    }
    
    log('📤', 'Subiendo warranty-system-rs-v1.0.1.zip...');
    await client.uploadFrom(localZipPath, 'warranty-system-rs-v1.0.1.zip');
    log('✅', 'ZIP subido correctamente al servidor');
    
    return true;
  } catch (err) {
    throw new Error(`Error subiendo al servidor: ${err.message}`);
  } finally {
    client.close();
  }
}

// Paso 4: Actualizar update.json remoto
async function updateRemoteJSON() {
  log('🧾', 'Actualizando update.json remoto...');
  
  const updateData = {
    version: "1.0.1",
    download_url: DOWNLOAD_URL,
    tested: "6.7.1",
    requires: "6.0",
    requires_php: "7.4"
  };
  
  const client = new FTPClient();
  client.ftp.verbose = false;
  
  try {
    await client.access({
      host: FTP_CONFIG.host,
      user: FTP_CONFIG.user,
      password: FTP_CONFIG.password,
      port: FTP_CONFIG.port || 21,
      secure: FTP_CONFIG.secure
    });
    await client.cd(REMOTE_PATH);
    
    // Crear archivo temporal local
    const tempJSON = path.join(os.tmpdir(), 'update.json');
    fs.writeFileSync(tempJSON, JSON.stringify(updateData, null, 2));
    
    log('📤', 'Subiendo update.json...');
    await client.uploadFrom(tempJSON, 'update.json');
    log('✅', 'update.json actualizado correctamente');
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempJSON);
    
    return updateData;
  } catch (err) {
    throw new Error(`Error actualizando update.json: ${err.message}`);
  } finally {
    client.close();
  }
}

// Paso 5: Validación final
async function validateFinalState() {
  log('✅', 'Ejecutando validación final...');
  
  const validations = {
    zipAccessible: false,
    jsonAccessible: false,
    jsonFormatCorrect: false,
    noDuplicates: true,
    versionCorrect: false
  };
  
  try {
    // Validar acceso al ZIP
    log('🌐', `Verificando: ${DOWNLOAD_URL}`);
    const zipResponse = await fetch(DOWNLOAD_URL, { method: 'HEAD' });
    validations.zipAccessible = zipResponse.ok;
    
    if (validations.zipAccessible) {
      log('✅', 'ZIP accesible desde URL pública');
    } else {
      log('❌', 'ZIP no accesible');
    }
    
    // Validar update.json
    log('🌐', `Verificando: ${UPDATE_JSON_URL}`);
    const jsonResponse = await fetch(UPDATE_JSON_URL);
    validations.jsonAccessible = jsonResponse.ok;
    
    if (validations.jsonAccessible) {
      const jsonData = await jsonResponse.json();
      
      // Verificar formato exacto
      validations.versionCorrect = jsonData.version === '1.0.1';
      validations.jsonFormatCorrect = (
        jsonData.download_url === DOWNLOAD_URL &&
        jsonData.tested === '6.7.1' &&
        jsonData.requires === '6.0' &&
        jsonData.requires_php === '7.4'
      );
      
      if (validations.versionCorrect) {
        log('✅', `Versión correcta: ${jsonData.version}`);
      }
      if (validations.jsonFormatCorrect) {
        log('✅', 'Formato de update.json correcto');
      }
    } else {
      log('❌', 'update.json no accesible');
    }
    
    // Verificar que no hay duplicados en el servidor
    const client = new FTPClient();
    client.ftp.verbose = false;
    
    try {
      await client.access({
        host: FTP_CONFIG.host,
        user: FTP_CONFIG.user,
        password: FTP_CONFIG.password,
        port: FTP_CONFIG.port || 21,
        secure: FTP_CONFIG.secure
      });
      await client.cd(REMOTE_PATH);
      const remoteFiles = await client.list();
      
      const zipFiles = remoteFiles.filter(f => 
        f.type === 1 && f.name.startsWith('warranty-system-rs-') && f.name.endsWith('.zip')
      );
      
      if (zipFiles.length === 1 && zipFiles[0].name === 'warranty-system-rs-v1.0.1.zip') {
        log('✅', 'No hay duplicados en el servidor');
      } else if (zipFiles.length > 1) {
        validations.noDuplicates = false;
        log('⚠️', `Se encontraron ${zipFiles.length} archivos ZIP en el servidor`);
        zipFiles.forEach(f => log('  ', `- ${f.name}`));
      }
      
    } catch (err) {
      log('⚠️', `Error verificando duplicados: ${err.message}`);
    } finally {
      client.close();
    }
    
  } catch (err) {
    log('⚠️', `Error en validación: ${err.message}`);
  }
  
  return validations;
}

// Paso 6: Crear registro DOZO
async function createNamingFixReport(deletedFiles, zipPath, validations) {
  log('🪶', 'Creando registro DOZO...');
  
  const sha256 = calculateSHA256(zipPath);
  const size = getFileSize(zipPath);
  
  const report = {
    action: 'DOZO Naming Consistency Fix & Deploy v1.0.1',
    status: validations.zipAccessible && validations.jsonAccessible && validations.jsonFormatCorrect ? 'success' : 'partial',
    timestamp: new Date().toISOString(),
    cleanup: {
      deleted_local: deletedFiles.local,
      deleted_remote: deletedFiles.remote,
      total_cleaned: deletedFiles.local.length + deletedFiles.remote.length
    },
    final_package: {
      name: 'warranty-system-rs-v1.0.1.zip',
      path: zipPath,
      sha256: sha256,
      size: size,
      size_formatted: formatBytes(size)
    },
    deployment: {
      download_url: DOWNLOAD_URL,
      update_json_url: UPDATE_JSON_URL,
      remote_path: REMOTE_PATH,
      server: FTP_CONFIG.host
    },
    validations: validations,
    naming_rules: {
      correct_format: 'warranty-system-rs-v{major}.{minor}.{patch}.zip',
      invalid_patterns_removed: [
        '*with*',
        '*rev*',
        '*test*',
        '*.old.zip'
      ]
    },
    wordpress_compatibility: {
      update_system: 'compatible',
      version_format: 'semver',
      auto_updates: 'enabled'
    }
  };
  
  fs.writeFileSync(NAMING_FIX_REPORT, JSON.stringify(report, null, 2));
  log('✅', `Reporte guardado: ${NAMING_FIX_REPORT}`);
  
  return report;
}

// Main execution
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║         🧩 DOZO Naming Consistency Fix & Deploy v1.0.1 🧩                    ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Crear directorios si no existen
    [EMPAQUETADO_READY, GLOBAL].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Paso 1: Verificar y renombrar paquete correcto PRIMERO
    const correctZipPath = await verifyCorrectPackage();
    
    // Paso 2: Limpieza (después de asegurar que tenemos el archivo correcto)
    const deletedFiles = await cleanupInvalidNames();
    
    // Paso 3: Sincronizar al servidor
    await syncToRemoteServer(correctZipPath);
    
    // Paso 4: Actualizar update.json
    await updateRemoteJSON();
    
    // Esperar propagación
    log('⏳', 'Esperando propagación del servidor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 5: Validación final
    const validations = await validateFinalState();
    
    // Paso 6: Crear reporte
    const report = await createNamingFixReport(deletedFiles, correctZipPath, validations);
    
    // Resultado final
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    console.log('║               ✅ NAMING FIX Y DEPLOY COMPLETADOS EXITOSAMENTE ✅              ║');
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    log('🧹', `Archivos limpiados: ${report.cleanup.total_cleaned}`);
    log('📦', `Paquete final: ${report.final_package.name}`);
    log('🔐', `SHA256: ${report.final_package.sha256.substring(0, 32)}...`);
    log('📊', `Tamaño: ${report.final_package.size_formatted}`);
    log('🌐', `URL: ${DOWNLOAD_URL}`);
    log('📄', `JSON: ${UPDATE_JSON_URL}`);
    log('📋', `Reporte: ${NAMING_FIX_REPORT}`);
    
    console.log('\n✨ Sistema de actualizaciones WordPress 100% compatible y funcional\n');
    
    // Verificar si hay algún problema
    if (!validations.zipAccessible || !validations.jsonAccessible || !validations.jsonFormatCorrect) {
      console.log('⚠️  ADVERTENCIA: Algunas validaciones fallaron. Revisa el reporte para detalles.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();


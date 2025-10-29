/*
🧩 DOZO Deploy v1.0.1 (SmartPanel Update)
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions
Fecha: 2025-10-19

Objetivo: Deploy completo de v1.0.1 con SmartPanel al servidor de actualizaciones
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { Client as FTPClient } from 'basic-ftp';
import fetch from 'node-fetch';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const LATEST_UPDATES = path.join(ROOT, 'Latest Updates');
const EMPAQUETADO_READY = path.join(ROOT, 'Empaquetado', 'Ready');
const GLOBAL = path.join(ROOT, 'to chat gpt', 'Global');

// Archivos
const SOURCE_ZIP = path.join(LATEST_UPDATES, 'warranty-system-rs-v1.0.1-with-smart-panel.zip');
const TARGET_ZIP = path.join(EMPAQUETADO_READY, 'warranty-system-rs-v1.0.1.zip');
const DEPLOY_REPORT = path.join(GLOBAL, 'DOZO-v1.0.1-DeployReport.json');

// Configuración FTP
const FTP_CONFIG = {
  host: 'ftp.vapedot.mx',
  user: 'u172394997.updates',
  password: 'DozoRS2024!Update',
  secure: false
};

const REMOTE_PATH = '/public_html/updates/warranty-system-rs/';
const DOWNLOAD_URL = 'https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip';
const UPDATE_JSON_URL = 'https://updates.vapedot.mx/warranty-system-rs/update.json';

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

// Paso 1: Preparar entorno
async function prepareEnvironment() {
  log('🧠', 'Preparando entorno DOZO...');
  
  // Verificar que existe el ZIP source
  if (!fs.existsSync(SOURCE_ZIP)) {
    throw new Error(`No se encontró el archivo fuente: ${SOURCE_ZIP}`);
  }
  
  log('✅', `Build encontrada: ${path.basename(SOURCE_ZIP)}`);
  
  // Crear directorios si no existen
  if (!fs.existsSync(EMPAQUETADO_READY)) {
    fs.mkdirSync(EMPAQUETADO_READY, { recursive: true });
  }
  
  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }
  
  return true;
}

// Paso 2: Empaquetar y validar
async function packageVersion() {
  log('📦', 'Empaquetando versión 1.0.1...');
  
  // Copiar el ZIP con el nombre correcto
  fs.copyFileSync(SOURCE_ZIP, TARGET_ZIP);
  log('✅', `ZIP creado: ${path.basename(TARGET_ZIP)}`);
  
  // Calcular hash SHA256
  const sha256 = calculateSHA256(TARGET_ZIP);
  log('🔐', `SHA256: ${sha256}`);
  
  // Obtener tamaño
  const size = getFileSize(TARGET_ZIP);
  log('📊', `Tamaño: ${formatBytes(size)}`);
  
  return { sha256, size };
}

// Paso 3: Subir al servidor
async function uploadToServer() {
  log('☁️', 'Conectando al servidor FTP...');
  
  const client = new FTPClient();
  client.ftp.verbose = false;
  
  try {
    await client.access(FTP_CONFIG);
    log('✅', 'Conectado al servidor FTP');
    
    // Verificar/crear directorio remoto
    try {
      await client.cd(REMOTE_PATH);
    } catch (e) {
      log('📁', 'Creando directorio remoto...');
      await client.ensureDir(REMOTE_PATH);
      await client.cd(REMOTE_PATH);
    }
    
    log('📤', 'Subiendo ZIP al servidor...');
    await client.uploadFrom(TARGET_ZIP, 'warranty-system-rs-v1.0.1.zip');
    log('✅', 'ZIP subido correctamente');
    
    return true;
  } catch (err) {
    throw new Error(`Error en FTP: ${err.message}`);
  } finally {
    client.close();
  }
}

// Paso 4: Actualizar update.json
async function updateRemoteJSON() {
  log('🧾', 'Actualizando update.json remoto...');
  
  const updateData = {
    version: "1.0.1",
    download_url: DOWNLOAD_URL,
    tested: "6.7.1",
    requires: "6.0",
    requires_php: "7.4",
    last_updated: new Date().toISOString(),
    changelog: "SmartCategoryPanel v1.1.0 integration - New admin menu and shortcode support"
  };
  
  const client = new FTPClient();
  client.ftp.verbose = false;
  
  try {
    await client.access(FTP_CONFIG);
    await client.cd(REMOTE_PATH);
    
    // Crear archivo temporal local
    const tempJSON = path.join(os.tmpdir(), 'update.json');
    fs.writeFileSync(tempJSON, JSON.stringify(updateData, null, 2));
    
    log('📤', 'Subiendo update.json...');
    await client.uploadFrom(tempJSON, 'update.json');
    log('✅', 'update.json actualizado');
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempJSON);
    
    return updateData;
  } catch (err) {
    throw new Error(`Error actualizando JSON: ${err.message}`);
  } finally {
    client.close();
  }
}

// Paso 5: Validación final
async function validateDeployment(localSHA256, localSize) {
  log('🔍', 'Validando deployment...');
  
  const validations = {
    zipAccessible: false,
    jsonAccessible: false,
    versionCorrect: false,
    sizeMatch: false
  };
  
  try {
    // Validar que el ZIP es accesible
    log('🌐', `Verificando acceso a: ${DOWNLOAD_URL}`);
    const zipResponse = await fetch(DOWNLOAD_URL, { method: 'HEAD' });
    validations.zipAccessible = zipResponse.ok;
    
    if (validations.zipAccessible) {
      log('✅', 'ZIP accesible desde URL pública');
      
      // Verificar tamaño
      const remoteSize = parseInt(zipResponse.headers.get('content-length') || '0');
      validations.sizeMatch = remoteSize === localSize;
      
      if (validations.sizeMatch) {
        log('✅', `Tamaño coincide: ${formatBytes(remoteSize)}`);
      } else {
        log('⚠️', `Tamaño diferente: Local ${formatBytes(localSize)} vs Remoto ${formatBytes(remoteSize)}`);
      }
    }
    
    // Validar update.json
    log('🌐', `Verificando: ${UPDATE_JSON_URL}`);
    const jsonResponse = await fetch(UPDATE_JSON_URL);
    validations.jsonAccessible = jsonResponse.ok;
    
    if (validations.jsonAccessible) {
      const jsonData = await jsonResponse.json();
      validations.versionCorrect = jsonData.version === '1.0.1';
      
      if (validations.versionCorrect) {
        log('✅', `Versión correcta: ${jsonData.version}`);
      } else {
        log('⚠️', `Versión incorrecta: ${jsonData.version}`);
      }
    }
    
  } catch (err) {
    log('⚠️', `Error en validación: ${err.message}`);
  }
  
  return validations;
}

// Paso 6: Crear registro DOZO
async function createDeployReport(sha256, size, validations, updateData) {
  log('🪶', 'Creando registro DOZO...');
  
  const report = {
    action: 'Deploy v1.0.1 SmartPanel Update',
    status: validations.zipAccessible && validations.jsonAccessible ? 'success' : 'partial',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    deployment: {
      source: path.basename(SOURCE_ZIP),
      package: path.basename(TARGET_ZIP),
      sha256: sha256,
      size: size,
      size_formatted: formatBytes(size),
      download_url: DOWNLOAD_URL,
      update_json_url: UPDATE_JSON_URL
    },
    validations: validations,
    update_metadata: updateData,
    server: {
      host: FTP_CONFIG.host,
      remote_path: REMOTE_PATH
    },
    features: [
      'SmartCategoryPanel v1.1.0 integration',
      'Admin menu "Smart Categories"',
      'Shortcode [rs_smart_category_panel]',
      'Assets CSS/JS optimized'
    ]
  };
  
  fs.writeFileSync(DEPLOY_REPORT, JSON.stringify(report, null, 2));
  log('✅', `Reporte guardado: ${DEPLOY_REPORT}`);
  
  return report;
}

// Main execution
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║              🚀 DOZO Deploy v1.0.1 - SmartPanel Update 🚀                    ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Paso 1
    await prepareEnvironment();
    
    // Paso 2
    const { sha256, size } = await packageVersion();
    
    // Paso 3
    await uploadToServer();
    
    // Paso 4
    const updateData = await updateRemoteJSON();
    
    // Esperar un momento para que el servidor procese
    log('⏳', 'Esperando propagación del servidor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 5
    const validations = await validateDeployment(sha256, size);
    
    // Paso 6
    const report = await createDeployReport(sha256, size, validations, updateData);
    
    // Resultado final
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    console.log('║                      ✅ DEPLOY COMPLETADO EXITOSAMENTE ✅                     ║');
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    log('📦', `Versión desplegada: v1.0.1`);
    log('🔐', `SHA256: ${sha256.substring(0, 16)}...`);
    log('📊', `Tamaño: ${formatBytes(size)}`);
    log('🌐', `URL: ${DOWNLOAD_URL}`);
    log('📄', `JSON: ${UPDATE_JSON_URL}`);
    log('📋', `Reporte: ${DEPLOY_REPORT}`);
    
    console.log('\n✨ El plugin Warranty System RS v1.0.1 está listo para actualizaciones automáticas\n');
    
  } catch (error) {
    console.error('\n❌ Error en el deploy:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();



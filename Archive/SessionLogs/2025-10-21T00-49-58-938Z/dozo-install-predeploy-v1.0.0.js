#!/usr/bin/env node

// ============================================================
// 🧩 DOZO Installability & Pre-Deploy Validation v1.0.0
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS (Golden Build)
// Autor: RockStage Solutions
// Fecha: 2025-10-20
// ============================================================

import fs from 'fs';
import path from 'path';
import { existsSync, statSync, createReadStream } from 'fs';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  paths: {
    zipLocal: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Latest Builds', 'Warranty System RS', 'warranty-system-rs.zip'),
    phpMain: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Plugins', 'Warranty System', 'warranty-system-rs.php'),
    updateJson: 'https://updates.vapedot.mx/warranty-system-rs/update.json'
  },
  
  expectedVersion: '1.0.0',
  expectedPluginName: 'Warranty System RS',
  expectedRootFolder: 'warranty-system-rs',
  expectedMainFile: 'warranty-system-rs.php',
  expectedDirs: ['includes', 'assets', 'templates', 'tools'],
  
  reportPath: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Global', 'DOZO-InstallPreDeployReport.json')
};

// ============================================================
// 🎨 UTILIDADES DE CONSOLA
// ============================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner(text) {
  const line = '='.repeat(60);
  log(`\n${line}`, 'cyan');
  log(`  ${text}`, 'bright');
  log(`${line}\n`, 'cyan');
}

function step(emoji, text) {
  log(`\n${emoji} ${text}`, 'blue');
  log('─'.repeat(60), 'cyan');
}

// ============================================================
// 🌐 FUNCIONES DE RED
// ============================================================

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// ============================================================
// 📁 VALIDADOR PRINCIPAL
// ============================================================

class InstallPreDeployValidator {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      zipIntegrity: {},
      installSimulation: {},
      updateValidation: {},
      finalState: {},
      errors: [],
      warnings: []
    };
  }

  async validateZipIntegrity() {
    step('🧠', 'Validación de integridad ZIP');

    try {
      const zipPath = this.config.paths.zipLocal;

      if (!existsSync(zipPath)) {
        this.report.errors.push('ZIP no encontrado');
        log(`✗ ZIP no encontrado: ${zipPath}`, 'red');
        return false;
      }

      log(`Analizando: ${path.basename(zipPath)}`, 'cyan');

      // Calcular hash y tamaño
      const stats = statSync(zipPath);
      const sha256 = await calculateSHA256(zipPath);

      this.report.zipIntegrity.file = path.basename(zipPath);
      this.report.zipIntegrity.path = zipPath;
      this.report.zipIntegrity.size = stats.size;
      this.report.zipIntegrity.sizeReadable = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      this.report.zipIntegrity.sha256 = sha256;

      log(`\n✓ Tamaño: ${this.report.zipIntegrity.sizeReadable}`, 'green');
      log(`✓ SHA256: ${sha256}`, 'green');

      // Analizar estructura interna
      log(`\nAnalizando estructura interna del ZIP...`, 'cyan');
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      // Obtener carpetas raíz
      const rootFolders = new Set();
      entries.forEach(entry => {
        const parts = entry.entryName.split('/');
        if (parts.length > 0 && parts[0] && !parts[0].startsWith('.')) {
          rootFolders.add(parts[0]);
        }
      });

      this.report.zipIntegrity.rootFolders = Array.from(rootFolders);

      log(`\nCarpetas raíz detectadas:`, 'cyan');
      rootFolders.forEach(folder => {
        log(`  📁 ${folder}`, 'cyan');
      });

      // Verificar carpeta raíz única
      if (rootFolders.size !== 1) {
        this.report.errors.push(`Múltiples carpetas raíz: ${Array.from(rootFolders).join(', ')}`);
        log(`\n✗ Se esperaba una sola carpeta raíz`, 'red');
        return false;
      }

      const rootFolder = Array.from(rootFolders)[0];
      if (rootFolder !== this.config.expectedRootFolder) {
        this.report.warnings.push(`Carpeta raíz: ${rootFolder} (esperada: ${this.config.expectedRootFolder})`);
        log(`\n⚠ Nombre de carpeta raíz: "${rootFolder}"`, 'yellow');
      } else {
        log(`\n✓ Carpeta raíz correcta: "${rootFolder}"`, 'green');
      }

      // Verificar archivo principal
      const mainFilePath = `${rootFolder}/${this.config.expectedMainFile}`;
      const mainFileExists = entries.some(e => e.entryName === mainFilePath);

      this.report.zipIntegrity.mainFilePresent = mainFileExists;

      if (mainFileExists) {
        log(`✓ Archivo principal encontrado: ${this.config.expectedMainFile}`, 'green');
      } else {
        this.report.errors.push('warranty-system-rs.php no encontrado en la raíz del ZIP');
        log(`✗ Archivo principal no encontrado`, 'red');
        return false;
      }

      // Verificar directorios requeridos
      log(`\nVerificando directorios requeridos...`, 'cyan');
      this.report.zipIntegrity.directories = {};

      for (const dir of this.config.expectedDirs) {
        const dirPath = `${rootFolder}/${dir}/`;
        const exists = entries.some(e => e.entryName.startsWith(dirPath));
        this.report.zipIntegrity.directories[dir] = exists;

        if (exists) {
          log(`  ✓ ${dir}/`, 'green');
        } else {
          log(`  ⚠ ${dir}/ (no encontrado)`, 'yellow');
          this.report.warnings.push(`Directorio ${dir}/ no encontrado`);
        }
      }

      // Estadísticas
      const fileCount = entries.filter(e => !e.isDirectory).length;
      const dirCount = entries.filter(e => e.isDirectory).length;

      this.report.zipIntegrity.stats = {
        totalEntries: entries.length,
        files: fileCount,
        directories: dirCount
      };

      log(`\nEstadísticas del ZIP:`, 'cyan');
      log(`  Archivos: ${fileCount}`, 'cyan');
      log(`  Directorios: ${dirCount}`, 'cyan');
      log(`  Total: ${entries.length}`, 'cyan');

      this.report.zipIntegrity.status = 'VALID';
      log(`\n✓ Integridad del ZIP validada`, 'green');
      return true;

    } catch (error) {
      this.report.zipIntegrity.status = 'ERROR';
      this.report.zipIntegrity.error = error.message;
      this.report.errors.push(`Error validando ZIP: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async simulateWordPressInstall() {
    step('📦', 'Simulación de instalación WordPress');

    try {
      const zipPath = this.config.paths.zipLocal;

      if (!existsSync(zipPath)) {
        log(`⚠ ZIP no disponible para simulación`, 'yellow');
        return false;
      }

      log('Simulando flujo de instalación...', 'cyan');

      // 1. Descomprimir ZIP (simulado)
      log(`\n1️⃣ Extracción del ZIP...`, 'cyan');
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();
      
      log(`  ✓ ZIP descomprimible`, 'green');
      log(`  ✓ ${entries.length} entradas detectadas`, 'green');

      // 2. Verificar que se crearía la carpeta correcta
      log(`\n2️⃣ Verificación de estructura de destino...`, 'cyan');
      const rootFolders = new Set();
      entries.forEach(entry => {
        const parts = entry.entryName.split('/');
        if (parts.length > 0 && parts[0] && !parts[0].startsWith('.')) {
          rootFolders.add(parts[0]);
        }
      });

      const rootFolder = Array.from(rootFolders)[0];
      const targetPath = `/wp-content/plugins/${rootFolder}/`;
      
      log(`  ✓ Se crearía: ${targetPath}`, 'green');
      this.report.installSimulation.targetPath = targetPath;

      // 3. Detectar plugin por headers
      log(`\n3️⃣ Detección del plugin por WordPress...`, 'cyan');
      const mainFilePath = `${rootFolder}/${this.config.expectedMainFile}`;
      const mainFileEntry = entries.find(e => e.entryName === mainFilePath);

      if (!mainFileEntry) {
        this.report.errors.push('Archivo principal no encontrado en ZIP');
        log(`  ✗ No se puede detectar el plugin`, 'red');
        return false;
      }

      // Leer headers del archivo principal
      const mainFileContent = mainFileEntry.getData().toString('utf8');
      const pluginInfo = this.parsePluginHeader(mainFileContent);

      this.report.installSimulation.pluginInfo = pluginInfo;

      log(`\n  Información detectada por WordPress:`, 'cyan');
      log(`    Plugin Name: ${pluginInfo.name}`, 'cyan');
      log(`    Version: ${pluginInfo.version}`, 'cyan');
      log(`    Author: ${pluginInfo.author}`, 'cyan');
      log(`    Text Domain: ${pluginInfo.textDomain}`, 'cyan');

      // Validar nombre y versión
      if (pluginInfo.name === this.config.expectedPluginName) {
        log(`\n  ✓ Nombre del plugin correcto`, 'green');
        this.report.installSimulation.nameCorrect = true;
      } else {
        log(`\n  ⚠ Nombre del plugin: "${pluginInfo.name}"`, 'yellow');
        this.report.warnings.push(`Nombre: ${pluginInfo.name} vs ${this.config.expectedPluginName}`);
        this.report.installSimulation.nameCorrect = false;
      }

      if (pluginInfo.version === this.config.expectedVersion) {
        log(`  ✓ Versión correcta: ${pluginInfo.version}`, 'green');
        this.report.installSimulation.versionCorrect = true;
      } else {
        log(`  ⚠ Versión: ${pluginInfo.version} (esperada: ${this.config.expectedVersion})`, 'yellow');
        this.report.warnings.push(`Versión: ${pluginInfo.version} vs ${this.config.expectedVersion}`);
        this.report.installSimulation.versionCorrect = false;
      }

      // 4. Verificar que sería activable
      log(`\n4️⃣ Verificación de activación...`, 'cyan');
      
      // Verificar estructura básica de PHP (<?php al inicio, cierre correcto)
      const hasPhpOpen = /^<\?php/i.test(mainFileContent);
      const hasAbsdefCheck = /defined\s*\(\s*['"]ABSPATH['"]\s*\)/i.test(mainFileContent);
      
      if (!hasPhpOpen) {
        this.report.errors.push('Archivo PHP no comienza con <?php');
        log(`  ✗ Archivo PHP mal formado`, 'red');
        this.report.installSimulation.activatable = false;
      } else if (!hasAbsdefCheck) {
        this.report.warnings.push('No se encontró verificación de ABSPATH');
        log(`  ⚠ Sin verificación de ABSPATH (recomendado)`, 'yellow');
        this.report.installSimulation.activatable = true;
      } else {
        log(`  ✓ Estructura PHP correcta`, 'green');
        log(`  ✓ Verificación de seguridad ABSPATH presente`, 'green');
        this.report.installSimulation.activatable = true;
      }

      // Verificar que tenga las funciones básicas de WordPress
      const hasWPHooks = /add_action|add_filter|register_activation_hook/i.test(mainFileContent);
      
      if (hasWPHooks) {
        log(`  ✓ Hooks de WordPress detectados`, 'green');
        this.report.installSimulation.hasWPHooks = true;
      } else {
        log(`  ⚠ No se detectaron hooks de WordPress`, 'yellow');
        this.report.warnings.push('Sin hooks de WordPress detectados');
        this.report.installSimulation.hasWPHooks = false;
      }

      this.report.installSimulation.status = 'SIMULATED';
      log(`\n✓ Simulación de instalación completada`, 'green');
      return true;

    } catch (error) {
      this.report.installSimulation.status = 'ERROR';
      this.report.installSimulation.error = error.message;
      this.report.errors.push(`Error simulando instalación: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  parsePluginHeader(content) {
    const header = {
      name: '',
      version: '',
      description: '',
      author: '',
      updateUri: '',
      textDomain: ''
    };

    const matches = {
      name: content.match(/Plugin Name:\s*(.+)/i),
      version: content.match(/Version:\s*(.+)/i),
      description: content.match(/Description:\s*(.+)/i),
      author: content.match(/Author:\s*(.+)/i),
      updateUri: content.match(/Update URI:\s*(.+)/i),
      textDomain: content.match(/Text Domain:\s*(.+)/i)
    };

    for (const [key, match] of Object.entries(matches)) {
      if (match) {
        header[key] = match[1].trim();
      }
    }

    return header;
  }

  async validateAutoUpdate() {
    step('🔍', 'Validación de actualización automática');

    try {
      log('Consultando servidor de actualizaciones...', 'cyan');
      
      // Descargar update.json
      const jsonData = await downloadFile(this.config.paths.updateJson);
      const updateInfo = JSON.parse(jsonData.toString());

      this.report.updateValidation.updateJson = updateInfo;

      log(`\nInformación de actualización:`, 'cyan');
      log(`  version: ${updateInfo.version}`, 'cyan');
      log(`  download_url: ${updateInfo.download_url}`, 'cyan');
      log(`  tested: ${updateInfo.tested}`, 'cyan');
      log(`  requires: ${updateInfo.requires}`, 'cyan');
      log(`  requires_php: ${updateInfo.requires_php}`, 'cyan');

      // Validar versión
      if (updateInfo.version === this.config.expectedVersion) {
        log(`\n✓ Versión en update.json correcta: ${updateInfo.version}`, 'green');
        this.report.updateValidation.versionCorrect = true;
      } else {
        log(`\n⚠ Versión en update.json: ${updateInfo.version} (esperada: ${this.config.expectedVersion})`, 'yellow');
        this.report.warnings.push(`Versión remota: ${updateInfo.version} vs ${this.config.expectedVersion}`);
        this.report.updateValidation.versionCorrect = false;
      }

      // Simular petición de WordPress
      log(`\nSimulando petición de actualización de WordPress...`, 'cyan');

      // WordPress compara versiones
      const installedVersion = this.report.installSimulation.pluginInfo?.version || '0.9.9';
      const remoteVersion = updateInfo.version;

      log(`  Versión instalada (simulada): ${installedVersion}`, 'cyan');
      log(`  Versión disponible: ${remoteVersion}`, 'cyan');

      const updateAvailable = this.compareVersions(remoteVersion, installedVersion);

      if (updateAvailable > 0) {
        log(`\n✓ WordPress detectaría actualización disponible`, 'green');
        log(`  ${installedVersion} → ${remoteVersion}`, 'green');
        this.report.updateValidation.updateDetectable = true;
      } else if (updateAvailable === 0) {
        log(`\n⚠ Versiones iguales (no hay actualización que detectar)`, 'yellow');
        this.report.updateValidation.updateDetectable = false;
        this.report.warnings.push('Versiones iguales - update testing limitado');
      } else {
        log(`\n⚠ Versión instalada es superior a la remota`, 'yellow');
        this.report.updateValidation.updateDetectable = false;
      }

      // Verificar URL de descarga
      log(`\nVerificando URL de descarga...`, 'cyan');
      const downloadUrl = updateInfo.download_url;
      
      try {
        const response = await this.checkUrl(downloadUrl);
        if (response.accessible) {
          log(`✓ ZIP descargable desde: ${downloadUrl}`, 'green');
          this.report.updateValidation.zipDownloadable = true;
          
          if (response.contentLength) {
            const sizeMB = (parseInt(response.contentLength) / 1024 / 1024).toFixed(2);
            log(`  Tamaño remoto: ${sizeMB} MB`, 'cyan');
            this.report.updateValidation.remoteZipSize = sizeMB + ' MB';
          }
        } else {
          log(`✗ ZIP no accesible en la URL especificada`, 'red');
          this.report.errors.push('ZIP remoto no accesible');
          this.report.updateValidation.zipDownloadable = false;
        }
      } catch (error) {
        log(`⚠ Error verificando URL: ${error.message}`, 'yellow');
        this.report.warnings.push(`Error verificando URL: ${error.message}`);
      }

      this.report.updateValidation.status = 'VALIDATED';
      log(`\n✓ Validación de actualización automática completada`, 'green');
      return true;

    } catch (error) {
      this.report.updateValidation.status = 'ERROR';
      this.report.updateValidation.error = error.message;
      this.report.errors.push(`Error validando actualización: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  checkUrl(url) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.request(url, { method: 'HEAD' }, (res) => {
        resolve({
          accessible: res.statusCode === 200,
          statusCode: res.statusCode,
          contentLength: res.headers['content-length']
        });
      });

      req.on('error', (err) => {
        resolve({
          accessible: false,
          error: err.message
        });
      });

      req.end();
    });
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  async generateFinalReport() {
    step('🧾', 'Registro DOZO');

    try {
      // Determinar estado final
      const criticalErrors = this.report.errors.length;
      const warnings = this.report.warnings.length;

      const zipValid = this.report.zipIntegrity.status === 'VALID';
      const installOk = this.report.installSimulation.status === 'SIMULATED';
      const updateOk = this.report.updateValidation.status === 'VALIDATED';

      if (criticalErrors === 0 && zipValid && installOk && updateOk) {
        if (warnings === 0) {
          this.report.status = 'INSTALLABLE_AND_UPDATE_READY';
          this.report.finalState.message = 'La versión base está lista para instalación manual y futuras actualizaciones automáticas.';
          this.report.finalState.deploymentReady = true;
        } else {
          this.report.status = 'INSTALLABLE_WITH_WARNINGS';
          this.report.finalState.message = 'El plugin es instalable y funcional, pero hay advertencias menores.';
          this.report.finalState.deploymentReady = true;
        }
      } else {
        this.report.status = 'NOT_READY';
        this.report.finalState.message = 'Se encontraron errores críticos que deben corregirse.';
        this.report.finalState.deploymentReady = false;
      }

      // Agregar resumen de validaciones
      this.report.finalState.summary = {
        zipIntegrity: this.report.zipIntegrity.status,
        installSimulation: this.report.installSimulation.status,
        updateValidation: this.report.updateValidation.status,
        criticalErrors: criticalErrors,
        warnings: warnings
      };

      // Guardar reporte
      const reportDir = path.dirname(this.config.reportPath);
      if (!existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.reportPath,
        JSON.stringify(this.report, null, 2),
        'utf8'
      );

      log(`\n✓ Reporte guardado en:`, 'green');
      log(`  ${this.config.reportPath}`, 'cyan');

      // Mostrar resumen final
      log(`\n${'='.repeat(60)}`, 'cyan');
      log(`  ESTADO FINAL: ${this.report.status}`, 'bright');
      log(`${'='.repeat(60)}`, 'cyan');

      if (this.report.status === 'INSTALLABLE_AND_UPDATE_READY') {
        log(`\n✅ ${this.report.finalState.message}`, 'green');
        log(`\n🎊 El plugin está LISTO para:`, 'green');
        log(`   ✓ Instalación manual en WordPress`, 'green');
        log(`   ✓ Activación inmediata`, 'green');
        log(`   ✓ Detección de actualizaciones automáticas`, 'green');
        log(`   ✓ Despliegue a producción`, 'green');
      } else if (this.report.status === 'INSTALLABLE_WITH_WARNINGS') {
        log(`\n⚠️  ${this.report.finalState.message}`, 'yellow');
        log(`\n✓ El plugin ES instalable y funcional`, 'green');
        log(`⚠️  Hay ${warnings} advertencias menores`, 'yellow');
      } else {
        log(`\n❌ ${this.report.finalState.message}`, 'red');
        log(`\n✗ Se encontraron ${criticalErrors} errores críticos`, 'red');
      }

      if (this.report.errors.length > 0) {
        log(`\nErrores críticos:`, 'red');
        this.report.errors.forEach(err => log(`  • ${err}`, 'red'));
      }

      if (this.report.warnings.length > 0) {
        log(`\nAdvertencias:`, 'yellow');
        this.report.warnings.forEach(warn => log(`  • ${warn}`, 'yellow'));
      }

      // Resumen de componentes
      log(`\n📊 Resumen de validaciones:`, 'cyan');
      log(`  Integridad ZIP: ${this.report.zipIntegrity.status}`, 'cyan');
      log(`  Simulación instalación: ${this.report.installSimulation.status}`, 'cyan');
      log(`  Validación actualización: ${this.report.updateValidation.status}`, 'cyan');
      log(`  Errores críticos: ${criticalErrors}`, criticalErrors === 0 ? 'green' : 'red');
      log(`  Advertencias: ${warnings}`, warnings === 0 ? 'green' : 'yellow');

      return true;
    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, 'red');
      return false;
    }
  }

  async run() {
    banner('🧩 DOZO Installability & Pre-Deploy Validation v1.0.0');
    log('Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)', 'cyan');
    log('Proyecto: Warranty System RS (Golden Build)', 'cyan');
    log(`Fecha: ${new Date().toLocaleString('es-MX')}`, 'cyan');

    try {
      await this.validateZipIntegrity();
      await this.simulateWordPressInstall();
      await this.validateAutoUpdate();
      await this.generateFinalReport();

      log(`\n${'='.repeat(60)}`, 'green');
      log(`  ✓ VALIDACIÓN PRE-DESPLIEGUE COMPLETADA`, 'green');
      log(`${'='.repeat(60)}`, 'green');

    } catch (error) {
      log(`\n✗ Error fatal: ${error.message}`, 'red');
      this.report.status = 'FATAL_ERROR';
      this.report.fatalError = error.message;
      await this.generateFinalReport();
    }
  }
}

// ============================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================

async function main() {
  const validator = new InstallPreDeployValidator(CONFIG);
  await validator.run();
}

// Ejecutar
main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});


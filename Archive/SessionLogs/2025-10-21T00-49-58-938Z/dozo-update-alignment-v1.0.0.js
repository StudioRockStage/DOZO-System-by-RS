#!/usr/bin/env node

// ============================================================
// 🧩 DOZO Update Alignment v1.0.0 (Full Sync & Recognition)
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-20
// ============================================================

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  // Rutas locales del plugin (ajustar según instalación WordPress)
  localPluginPaths: [
    '/Applications/MAMP/htdocs/vapedot/wp-content/plugins/warranty-system-rs',
    '/Users/davidalejandroperezrea/Documents/Dozo System by RS/warranty-system',
    '/Users/davidalejandroperezrea/Documents/Dozo System by RS/Latest Builds/warranty-system-rs',
    '/Users/davidalejandroperezrea/Documents/Dozo System by RS/Latest Builds/Warranty System RS/warranty-system-rs'
  ],
  
  pluginSlug: 'warranty-system-rs',
  pluginMainFile: 'warranty-system-rs.php',
  expectedVersion: '1.0.0',
  
  // Configuración remota
  updateUrl: 'https://updates.vapedot.mx/warranty-system-rs/update.json',
  remoteZipUrl: 'https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip',
  expectedRemoteVersion: '1.0.1',
  
  // Estructura esperada del plugin
  expectedDirs: ['admin', 'includes', 'public', 'templates', 'assets', 'tools'],
  
  // Ruta de reporte
  reportPath: path.join(process.env.HOME, 'Documents', 'Dozo System by RS', 'Global', 'DOZO-UpdateAlignmentReport.json')
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

async function checkHttpAccess(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        accessible: res.statusCode === 200,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        contentLength: res.headers['content-length'],
        contentType: res.headers['content-type']
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

function calculateSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ============================================================
// 📁 FUNCIONES DE VALIDACIÓN LOCAL
// ============================================================

class UpdateAlignmentValidator {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      localPlugin: {},
      updateUrl: {},
      zipStructure: {},
      remoteValidation: {},
      versionComparison: {},
      wordPressCheck: {},
      errors: [],
      warnings: []
    };
  }

  async findPluginPath() {
    log('Buscando instalación del plugin...', 'cyan');
    
    for (const pluginPath of this.config.localPluginPaths) {
      if (existsSync(pluginPath)) {
        const mainFile = path.join(pluginPath, this.config.pluginMainFile);
        if (existsSync(mainFile)) {
          log(`✓ Plugin encontrado en: ${pluginPath}`, 'green');
          return pluginPath;
        }
      }
    }
    
    return null;
  }

  async validateLocalPlugin() {
    step('🧭', 'Verificación del entorno base');

    try {
      const pluginPath = await this.findPluginPath();
      
      if (!pluginPath) {
        this.report.localPlugin.status = 'NOT_FOUND';
        this.report.errors.push('Plugin no encontrado en ninguna de las rutas especificadas');
        log('✗ Plugin no encontrado', 'red');
        log('\nRutas verificadas:', 'yellow');
        this.config.localPluginPaths.forEach(p => log(`  - ${p}`, 'yellow'));
        return false;
      }

      this.report.localPlugin.path = pluginPath;
      this.report.localPlugin.status = 'FOUND';

      // Leer archivo principal
      const mainFile = path.join(pluginPath, this.config.pluginMainFile);
      const content = await fs.readFile(mainFile, 'utf8');

      // Extraer información del plugin header
      const pluginInfo = this.parsePluginHeader(content);
      this.report.localPlugin.info = pluginInfo;

      log(`\nInformación del plugin:`, 'cyan');
      log(`  Nombre: ${pluginInfo.name}`, 'cyan');
      log(`  Versión: ${pluginInfo.version}`, 'cyan');
      log(`  Archivo principal: ${this.config.pluginMainFile}`, 'cyan');

      // Validar nombre y versión
      if (pluginInfo.name !== 'Warranty System RS') {
        this.report.warnings.push(`Nombre del plugin no coincide: ${pluginInfo.name}`);
        log(`⚠ Nombre no coincide (esperado: "Warranty System RS")`, 'yellow');
      } else {
        log(`✓ Nombre del plugin correcto`, 'green');
      }

      if (pluginInfo.version !== this.config.expectedVersion) {
        this.report.warnings.push(`Versión no coincide. Esperada: ${this.config.expectedVersion}, Encontrada: ${pluginInfo.version}`);
        log(`⚠ Versión no coincide (esperada: ${this.config.expectedVersion})`, 'yellow');
      } else {
        log(`✓ Versión coincide: ${pluginInfo.version}`, 'green');
      }

      // Verificar estructura de directorios
      log(`\nVerificando estructura de directorios...`, 'cyan');
      const dirs = await fs.readdir(pluginPath);
      const foundDirs = dirs.filter(d => {
        try {
          const stat = existsSync(path.join(pluginPath, d));
          return stat;
        } catch {
          return false;
        }
      });

      this.report.localPlugin.directories = foundDirs;

      let missingDirs = [];
      for (const expectedDir of this.config.expectedDirs) {
        if (foundDirs.includes(expectedDir)) {
          log(`  ✓ ${expectedDir}/`, 'green');
        } else {
          log(`  ✗ ${expectedDir}/ (no encontrado)`, 'red');
          missingDirs.push(expectedDir);
        }
      }

      if (missingDirs.length > 0) {
        this.report.warnings.push(`Directorios faltantes: ${missingDirs.join(', ')}`);
      } else {
        log(`\n✓ Estructura de directorios completa`, 'green');
      }

      return true;
    } catch (error) {
      this.report.localPlugin.status = 'ERROR';
      this.report.localPlugin.error = error.message;
      this.report.errors.push(`Error validando plugin local: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  parsePluginHeader(content) {
    const info = {
      name: '',
      version: '',
      description: '',
      author: '',
      updateUri: ''
    };

    // Extraer Plugin Name
    const nameMatch = content.match(/Plugin Name:\s*(.+)/i);
    if (nameMatch) info.name = nameMatch[1].trim();

    // Extraer Version
    const versionMatch = content.match(/Version:\s*(.+)/i);
    if (versionMatch) info.version = versionMatch[1].trim();

    // Extraer Description
    const descMatch = content.match(/Description:\s*(.+)/i);
    if (descMatch) info.description = descMatch[1].trim();

    // Extraer Author
    const authorMatch = content.match(/Author:\s*(.+)/i);
    if (authorMatch) info.author = authorMatch[1].trim();

    // Extraer Update URI
    const updateUriMatch = content.match(/Update URI:\s*(.+)/i);
    if (updateUriMatch) info.updateUri = updateUriMatch[1].trim();

    return info;
  }

  async validateUpdateUrl() {
    step('🔗', 'Validación de la URL de actualización');

    try {
      const pluginInfo = this.report.localPlugin.info;
      
      if (!pluginInfo || !pluginInfo.updateUri) {
        log(`⚠ No se encontró Update URI en el plugin`, 'yellow');
        this.report.updateUrl.status = 'NOT_CONFIGURED';
        this.report.warnings.push('Update URI no configurado en el plugin');
        return false;
      }

      log(`URL configurada: ${pluginInfo.updateUri}`, 'cyan');
      log(`URL esperada: ${this.config.updateUrl}`, 'cyan');

      if (pluginInfo.updateUri === this.config.updateUrl) {
        log(`✓ URL de actualización correcta`, 'green');
        this.report.updateUrl.status = 'CORRECT';
        this.report.updateUrl.configured = pluginInfo.updateUri;
      } else {
        log(`⚠ URL no coincide`, 'yellow');
        this.report.updateUrl.status = 'MISMATCH';
        this.report.updateUrl.configured = pluginInfo.updateUri;
        this.report.updateUrl.expected = this.config.updateUrl;
        this.report.warnings.push(`Update URI no coincide. Esperada: ${this.config.updateUrl}`);
      }

      // Verificar accesibilidad
      log(`\nVerificando accesibilidad de update.json...`, 'cyan');
      const httpCheck = await checkHttpAccess(this.config.updateUrl);
      
      if (httpCheck.accessible) {
        log(`✓ update.json accesible (${httpCheck.statusCode})`, 'green');
        this.report.updateUrl.accessible = true;
      } else {
        log(`✗ update.json no accesible`, 'red');
        this.report.updateUrl.accessible = false;
        this.report.errors.push('update.json no accesible');
      }

      return true;
    } catch (error) {
      this.report.updateUrl.status = 'ERROR';
      this.report.updateUrl.error = error.message;
      this.report.errors.push(`Error validando URL: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async validateZipStructure() {
    step('📦', 'Validación de estructura ZIP instalada');

    try {
      if (!this.report.localPlugin.path) {
        log(`⚠ No hay ruta de plugin para validar estructura`, 'yellow');
        return false;
      }

      const pluginPath = this.report.localPlugin.path;
      log(`Validando estructura en: ${pluginPath}`, 'cyan');

      // Verificar que no haya doble carpeta
      const parentName = path.basename(path.dirname(pluginPath));
      const currentName = path.basename(pluginPath);

      log(`\nEstructura de carpetas:`, 'cyan');
      log(`  Parent: ${parentName}`, 'cyan');
      log(`  Current: ${currentName}`, 'cyan');

      if (currentName === this.config.pluginSlug) {
        log(`✓ Estructura correcta (carpeta: ${currentName})`, 'green');
        this.report.zipStructure.status = 'CORRECT';
        this.report.zipStructure.folderName = currentName;
      } else {
        log(`⚠ Nombre de carpeta no estándar: ${currentName}`, 'yellow');
        this.report.zipStructure.status = 'NON_STANDARD';
        this.report.zipStructure.folderName = currentName;
        this.report.warnings.push(`Nombre de carpeta no estándar: ${currentName}`);
      }

      // Verificar archivos principales
      const mainFiles = [
        this.config.pluginMainFile,
        'readme.txt',
        'LICENSE'
      ];

      log(`\nArchivos principales:`, 'cyan');
      for (const file of mainFiles) {
        const filePath = path.join(pluginPath, file);
        if (existsSync(filePath)) {
          log(`  ✓ ${file}`, 'green');
        } else {
          log(`  ⚠ ${file} (opcional)`, 'yellow');
        }
      }

      return true;
    } catch (error) {
      this.report.zipStructure.status = 'ERROR';
      this.report.zipStructure.error = error.message;
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async validateRemoteUpdate() {
    step('🧾', 'Validación remota del update.json (v1.0.1)');

    try {
      log(`Descargando update.json...`, 'cyan');
      const jsonData = await downloadFile(this.config.updateUrl);
      const updateInfo = JSON.parse(jsonData.toString());

      this.report.remoteValidation.updateJson = updateInfo;
      this.report.remoteValidation.status = 'VALID';

      log(`\nInformación remota:`, 'cyan');
      log(`  Versión: ${updateInfo.version}`, 'cyan');
      log(`  URL descarga: ${updateInfo.download_url}`, 'cyan');
      log(`  WordPress probado: ${updateInfo.tested}`, 'cyan');
      log(`  Requiere WP: ${updateInfo.requires}`, 'cyan');
      log(`  Requiere PHP: ${updateInfo.requires_php}`, 'cyan');

      // Validar versión remota
      if (updateInfo.version === this.config.expectedRemoteVersion) {
        log(`\n✓ Versión remota correcta: ${updateInfo.version}`, 'green');
      } else {
        log(`\n⚠ Versión remota diferente (esperada: ${this.config.expectedRemoteVersion})`, 'yellow');
        this.report.warnings.push(`Versión remota: ${updateInfo.version} (esperada: ${this.config.expectedRemoteVersion})`);
      }

      // Verificar ZIP remoto
      log(`\nVerificando ZIP remoto...`, 'cyan');
      const zipCheck = await checkHttpAccess(updateInfo.download_url);

      if (zipCheck.accessible) {
        log(`✓ ZIP remoto accesible`, 'green');
        if (zipCheck.contentLength) {
          const sizeMB = (parseInt(zipCheck.contentLength) / 1024 / 1024).toFixed(2);
          log(`  Tamaño: ${sizeMB} MB`, 'cyan');
          this.report.remoteValidation.zipSize = sizeMB + ' MB';
        }
        this.report.remoteValidation.zipAccessible = true;
      } else {
        log(`✗ ZIP remoto no accesible`, 'red');
        this.report.remoteValidation.zipAccessible = false;
        this.report.errors.push('ZIP remoto no accesible');
      }

      return true;
    } catch (error) {
      this.report.remoteValidation.status = 'ERROR';
      this.report.remoteValidation.error = error.message;
      this.report.errors.push(`Error validando update remoto: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
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

  async compareLocalVsRemote() {
    step('🔁', 'Comparación de versiones local vs remota');

    try {
      const localVersion = this.report.localPlugin.info?.version || '0.0.0';
      const remoteVersion = this.report.remoteValidation.updateJson?.version || '0.0.0';

      this.report.versionComparison.localVersion = localVersion;
      this.report.versionComparison.remoteVersion = remoteVersion;

      log(`Versión instalada: ${localVersion}`, 'cyan');
      log(`Versión remota: ${remoteVersion}`, 'cyan');

      const comparison = this.compareVersions(remoteVersion, localVersion);

      if (comparison > 0) {
        log(`\n✓ Actualización disponible: ${localVersion} → ${remoteVersion}`, 'green');
        this.report.versionComparison.status = 'UPDATE_AVAILABLE';
        this.report.versionComparison.updateAvailable = true;
      } else if (comparison === 0) {
        log(`\n⚠ Versiones iguales (no hay actualización)`, 'yellow');
        this.report.versionComparison.status = 'UP_TO_DATE';
        this.report.versionComparison.updateAvailable = false;
      } else {
        log(`\n⚠ Versión local es superior a la remota`, 'yellow');
        this.report.versionComparison.status = 'LOCAL_NEWER';
        this.report.versionComparison.updateAvailable = false;
      }

      return true;
    } catch (error) {
      this.report.versionComparison.status = 'ERROR';
      this.report.versionComparison.error = error.message;
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async executeWordPressCheck() {
    step('⚙️', 'Ejecución de force-check en WordPress');

    try {
      // Verificar si WP-CLI está disponible
      log(`Verificando disponibilidad de WP-CLI...`, 'cyan');
      
      try {
        const { stdout } = await execAsync('which wp');
        const wpCliPath = stdout.trim();
        log(`✓ WP-CLI encontrado: ${wpCliPath}`, 'green');
        this.report.wordPressCheck.wpCliAvailable = true;
        this.report.wordPressCheck.wpCliPath = wpCliPath;
      } catch {
        log(`⚠ WP-CLI no encontrado`, 'yellow');
        log(`  Para ejecutar el force-check, instala WP-CLI:`, 'cyan');
        log(`  https://wp-cli.org/`, 'cyan');
        this.report.wordPressCheck.wpCliAvailable = false;
        this.report.wordPressCheck.status = 'WP_CLI_NOT_AVAILABLE';
        this.report.warnings.push('WP-CLI no disponible para ejecutar force-check');
        return false;
      }

      // Si WP-CLI está disponible, intentar ejecutar comandos
      log(`\nEjecutando comandos WordPress...`, 'cyan');
      
      // Buscar instalación WordPress
      const wpPaths = [
        '/Applications/MAMP/htdocs/vapedot',
        '/var/www/html',
        '/usr/local/var/www'
      ];

      let wpPath = null;
      for (const testPath of wpPaths) {
        if (existsSync(path.join(testPath, 'wp-config.php'))) {
          wpPath = testPath;
          break;
        }
      }

      if (!wpPath) {
        log(`⚠ No se encontró instalación WordPress`, 'yellow');
        this.report.wordPressCheck.status = 'WP_NOT_FOUND';
        this.report.warnings.push('Instalación WordPress no encontrada');
        return false;
      }

      log(`✓ WordPress encontrado: ${wpPath}`, 'green');
      this.report.wordPressCheck.wpPath = wpPath;

      // Limpiar transients
      log(`\nLimpiando transients de actualización...`, 'cyan');
      try {
        await execAsync(`cd ${wpPath} && wp transient delete update_plugins`);
        log(`✓ Transient update_plugins eliminado`, 'green');
      } catch (error) {
        log(`⚠ No se pudo eliminar transient: ${error.message}`, 'yellow');
      }

      // Forzar verificación de actualizaciones
      log(`\nForzando verificación de actualizaciones...`, 'cyan');
      try {
        const { stdout } = await execAsync(`cd ${wpPath} && wp plugin list --format=json`);
        const plugins = JSON.parse(stdout);
        const ourPlugin = plugins.find(p => p.name === this.config.pluginSlug || p.name === 'warranty-system-rs');

        if (ourPlugin) {
          log(`\nInformación del plugin en WordPress:`, 'cyan');
          log(`  Nombre: ${ourPlugin.name}`, 'cyan');
          log(`  Estado: ${ourPlugin.status}`, 'cyan');
          log(`  Versión: ${ourPlugin.version}`, 'cyan');
          log(`  Actualización: ${ourPlugin.update}`, 'cyan');

          this.report.wordPressCheck.pluginInfo = ourPlugin;
          
          if (ourPlugin.update === 'available') {
            log(`\n✓ WordPress detectó actualización disponible`, 'green');
            this.report.wordPressCheck.updateDetected = true;
          } else {
            log(`\n⚠ WordPress no detectó actualización`, 'yellow');
            this.report.wordPressCheck.updateDetected = false;
          }
        } else {
          log(`⚠ Plugin no encontrado en listado WordPress`, 'yellow');
          this.report.wordPressCheck.pluginFound = false;
        }

        this.report.wordPressCheck.status = 'EXECUTED';
      } catch (error) {
        log(`⚠ Error ejecutando comandos WP-CLI: ${error.message}`, 'yellow');
        this.report.wordPressCheck.status = 'ERROR';
        this.report.wordPressCheck.error = error.message;
      }

      return true;
    } catch (error) {
      this.report.wordPressCheck.status = 'ERROR';
      this.report.wordPressCheck.error = error.message;
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async generateReport() {
    step('🪶', 'Registro DOZO');

    try {
      // Determinar estado final
      const criticalErrors = this.report.errors.length;
      const warnings = this.report.warnings.length;

      if (criticalErrors === 0 && warnings === 0) {
        this.report.status = 'UPDATE_ALIGNMENT_SUCCESSFUL';
      } else if (criticalErrors === 0 && warnings > 0) {
        this.report.status = 'UPDATE_ALIGNMENT_WITH_WARNINGS';
      } else {
        this.report.status = 'UPDATE_ALIGNMENT_FAILED';
      }

      // Asegurar directorio
      const reportDir = path.dirname(this.config.reportPath);
      await fs.mkdir(reportDir, { recursive: true });

      // Guardar reporte
      await fs.writeFile(
        this.config.reportPath,
        JSON.stringify(this.report, null, 2),
        'utf8'
      );

      log(`\n✓ Reporte guardado en:`, 'green');
      log(`  ${this.config.reportPath}`, 'cyan');

      // Mostrar resumen
      log(`\n${'='.repeat(60)}`, 'cyan');
      log(`  ESTADO FINAL: ${this.report.status}`, 'bright');
      log(`${'='.repeat(60)}`, 'cyan');

      if (this.report.status === 'UPDATE_ALIGNMENT_SUCCESSFUL') {
        log(`\n✓ Alineación completada sin errores`, 'green');
      } else if (this.report.status === 'UPDATE_ALIGNMENT_WITH_WARNINGS') {
        log(`\n⚠ Alineación completada con advertencias (${warnings})`, 'yellow');
      } else {
        log(`\n✗ Alineación con errores (${criticalErrors})`, 'red');
      }

      if (this.report.errors.length > 0) {
        log(`\nErrores:`, 'red');
        this.report.errors.forEach(err => log(`  • ${err}`, 'red'));
      }

      if (this.report.warnings.length > 0) {
        log(`\nAdvertencias:`, 'yellow');
        this.report.warnings.forEach(warn => log(`  • ${warn}`, 'yellow'));
      }

      return true;
    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, 'red');
      return false;
    }
  }

  async run() {
    banner('🧩 DOZO Update Alignment v1.0.0');
    log('Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)', 'cyan');
    log('Proyecto: Warranty System RS', 'cyan');
    log(`Fecha: ${new Date().toLocaleString('es-MX')}`, 'cyan');

    try {
      await this.validateLocalPlugin();
      await this.validateUpdateUrl();
      await this.validateZipStructure();
      await this.validateRemoteUpdate();
      await this.compareLocalVsRemote();
      await this.executeWordPressCheck();
      await this.generateReport();

      log(`\n${'='.repeat(60)}`, 'green');
      log(`  ✓ ALINEACIÓN DE ACTUALIZACIONES COMPLETADA`, 'green');
      log(`${'='.repeat(60)}`, 'green');

    } catch (error) {
      log(`\n✗ Error fatal: ${error.message}`, 'red');
      this.report.status = 'FATAL_ERROR';
      this.report.fatalError = error.message;
      await this.generateReport();
    }
  }
}

// ============================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ============================================================

async function main() {
  const validator = new UpdateAlignmentValidator(CONFIG);
  await validator.run();
}

// Ejecutar
main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});


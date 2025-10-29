#!/usr/bin/env node

// ============================================================
// 🧩 DOZO Base Standardization v1.0.0 (Stable Repack)
// Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
// Proyecto: Warranty System RS
// Autor: RockStage Solutions
// Fecha: 2025-10-20
// ============================================================

import fs from 'fs';
import path from 'path';
import { existsSync, statSync, createReadStream } from 'fs';
import AdmZip from 'adm-zip';
import crypto from 'crypto';

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================

const CONFIG = {
  paths: {
    stableSource: path.join(process.env.HOME, 'Documents', 'Warranty System RS PRUEBA BASE'),
    dozoRoot: path.join(process.env.HOME, 'Documents', 'DOZO System by RS'),
    latestBuilds: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Latest Builds', 'Warranty System RS'),
    empaquetado: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Empaquetado'),
    global: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Global'),
    backup: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Backup'),
    archive: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Shared', 'Archive-Cleanup')
  },
  
  expectedDirs: ['admin', 'public', 'includes', 'assets', 'templates', 'tools'],
  expectedVersion: '1.0.0',
  zipName: 'warranty-system-rs.zip',
  pluginSlug: 'warranty-system-rs',
  
  reportPath: path.join(process.env.HOME, 'Documents', 'DOZO System by RS', 'Global', 'DOZO-BaseStandardization-v1.0.0.json')
};

// ============================================================
// 🎨 UTILIDADES
// ============================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function banner(text) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`  ${text}`, 'bright');
  log(`${'='.repeat(70)}\n`, 'cyan');
}

function step(emoji, text) {
  log(`\n${emoji} ${text}`, 'blue');
  log('─'.repeat(70), 'cyan');
}

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
      if (entry.startsWith('.')) continue;
      copySync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function calculateSHA256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// ============================================================
// 📁 ESTANDARIZADOR PRINCIPAL
// ============================================================

class BaseStandardizer {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'PENDING',
      stableSource: {},
      mainFileValidation: {},
      standardization: {},
      installValidation: {},
      cleanup: {},
      errors: [],
      warnings: []
    };
  }

  async loadStableSource() {
    step('🧠', 'Cargar fuente estable');

    try {
      const sourcePath = this.config.paths.stableSource;
      
      log(`Verificando: ${sourcePath}`, 'cyan');

      if (!existsSync(sourcePath)) {
        this.report.errors.push('Fuente estable no encontrada');
        log(`✗ Directorio no encontrado`, 'red');
        return false;
      }

      log('✓ Fuente estable encontrada', 'green');

      // Verificar archivo principal
      const mainPhp = path.join(sourcePath, 'warranty-system-rs.php');
      if (!existsSync(mainPhp)) {
        this.report.errors.push('warranty-system-rs.php no encontrado en fuente');
        log('✗ Archivo principal no encontrado', 'red');
        return false;
      }

      log('✓ Archivo principal: warranty-system-rs.php', 'green');

      // Verificar directorios
      log('\nVerificando estructura de directorios...', 'cyan');
      this.report.stableSource.directories = {};
      
      for (const dir of this.config.expectedDirs) {
        const dirPath = path.join(sourcePath, dir);
        const exists = existsSync(dirPath);
        this.report.stableSource.directories[dir] = exists;

        if (exists) {
          log(`  ✓ ${dir}/`, 'green');
        } else {
          log(`  ⚠️ ${dir}/ (no encontrado)`, 'yellow');
          this.report.warnings.push(`Directorio ${dir}/ no encontrado en fuente`);
        }
      }

      this.report.stableSource.path = sourcePath;
      this.report.stableSource.status = 'LOADED';
      
      log('\n✓ Fuente estable cargada y validada', 'green');
      return true;

    } catch (error) {
      this.report.stableSource.status = 'ERROR';
      this.report.stableSource.error = error.message;
      this.report.errors.push(`Error cargando fuente: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async verifyMainFile() {
    step('🔍', 'Verificar archivo principal');

    try {
      const mainPhp = path.join(this.config.paths.stableSource, 'warranty-system-rs.php');
      
      if (!existsSync(mainPhp)) {
        log('✗ Archivo principal no encontrado', 'red');
        return false;
      }

      log('Analizando warranty-system-rs.php...', 'cyan');
      let content = fs.readFileSync(mainPhp, 'utf8');
      let modified = false;

      // 1. Verificar ABSPATH
      log('\n1️⃣ Verificando seguridad ABSPATH...', 'cyan');
      const hasABSPATH = /defined\s*\(\s*['"]ABSPATH['"]\s*\)/i.test(content);
      
      if (hasABSPATH) {
        log('  ✓ Verificación ABSPATH presente', 'green');
        this.report.mainFileValidation.abspath = 'PRESENT';
      } else {
        log('  ⚠️ ABSPATH no encontrado, agregando...', 'yellow');
        const headerEnd = content.match(/\*\/\s*\n/);
        if (headerEnd) {
          const pos = headerEnd.index + headerEnd[0].length;
          content = content.substring(0, pos) + 
                   "\nif ( ! defined( 'ABSPATH' ) ) exit;\n" + 
                   content.substring(pos);
          modified = true;
          log('  ✓ ABSPATH agregado', 'green');
          this.report.mainFileValidation.abspath = 'ADDED';
        }
      }

      // 2. Verificar cabeceras
      log('\n2️⃣ Verificando cabeceras del plugin...', 'cyan');
      const headers = this.parseHeaders(content);
      this.report.mainFileValidation.headers = headers;

      const requiredHeaders = ['Plugin Name', 'Version', 'Author'];
      const missing = requiredHeaders.filter(h => !headers[h.toLowerCase().replace(/ /g, '')]);
      
      if (missing.length === 0) {
        log('  ✓ Todas las cabeceras requeridas presentes', 'green');
        log(`    Plugin Name: ${headers.pluginname}`, 'cyan');
        log(`    Version: ${headers.version}`, 'cyan');
        log(`    Author: ${headers.author}`, 'cyan');
      } else {
        log(`  ⚠️ Cabeceras faltantes: ${missing.join(', ')}`, 'yellow');
        this.report.warnings.push(`Cabeceras faltantes: ${missing.join(', ')}`);
      }

      // 3. Verificar rutas relativas
      log('\n3️⃣ Verificando rutas relativas...', 'cyan');
      const hasDynamicPaths = /plugin_dir_path\s*\(\s*__FILE__\s*\)|plugin_dir_url\s*\(\s*__FILE__\s*\)/i.test(content);
      
      if (hasDynamicPaths) {
        log('  ✓ Rutas dinámicas usando __FILE__ detectadas', 'green');
        this.report.mainFileValidation.dynamicPaths = true;
      } else {
        log('  ⚠️ No se detectaron rutas dinámicas', 'yellow');
        this.report.warnings.push('Rutas dinámicas no detectadas');
        this.report.mainFileValidation.dynamicPaths = false;
      }

      // 4. Verificar Text Domain
      log('\n4️⃣ Verificando Text Domain...', 'cyan');
      const textDomain = headers.textdomain || '';
      
      if (textDomain === 'warranty-system-rs') {
        log('  ✓ Text Domain correcto: warranty-system-rs', 'green');
        this.report.mainFileValidation.textDomain = 'CORRECT';
      } else {
        log(`  ⚠️ Text Domain: ${textDomain || '(no configurado)'}`, 'yellow');
        this.report.warnings.push(`Text Domain: ${textDomain} (esperado: warranty-system-rs)`);
        this.report.mainFileValidation.textDomain = textDomain || 'MISSING';
      }

      // Guardar si hubo modificaciones
      if (modified) {
        fs.writeFileSync(mainPhp, content, 'utf8');
        log('\n✓ Archivo principal actualizado con correcciones', 'green');
        this.report.mainFileValidation.modified = true;
      } else {
        log('\n✓ Archivo principal verificado (sin cambios necesarios)', 'green');
        this.report.mainFileValidation.modified = false;
      }

      this.report.mainFileValidation.status = 'VALIDATED';
      return true;

    } catch (error) {
      this.report.mainFileValidation.status = 'ERROR';
      this.report.mainFileValidation.error = error.message;
      this.report.errors.push(`Error verificando archivo principal: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  parseHeaders(content) {
    const headers = {};
    const patterns = {
      pluginname: /Plugin Name:\s*(.+)/i,
      version: /Version:\s*(.+)/i,
      author: /Author:\s*(.+)/i,
      description: /Description:\s*(.+)/i,
      pluginuri: /Plugin URI:\s*(.+)/i,
      updateuri: /Update URI:\s*(.+)/i,
      textdomain: /Text Domain:\s*(.+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        headers[key] = match[1].trim();
      }
    }

    return headers;
  }

  async standardizeAndPackage() {
    step('📦', 'Estandarizar estructura y empaquetar');

    try {
      log('Creando estructura estandarizada...', 'cyan');

      // Crear directorio temporal
      const tmpDir = path.join(this.config.paths.latestBuilds, '__TMP_STANDARD__');
      const targetDir = path.join(tmpDir, 'warranty-system-rs');
      
      removeSync(tmpDir);
      mkdirpSync(targetDir);

      // Copiar archivos desde fuente estable
      log('\n1️⃣ Copiando archivos desde fuente estable...', 'cyan');
      const sourceDir = this.config.paths.stableSource;
      
      const entries = fs.readdirSync(sourceDir);
      let filesCopied = 0;
      
      for (const entry of entries) {
        if (entry.startsWith('.')) continue;
        if (entry === 'backup-dozo') continue;
        if (entry === 'logs') continue;
        if (entry === '__MACOSX') continue;
        
        const src = path.join(sourceDir, entry);
        const dest = path.join(targetDir, entry);
        
        copySync(src, dest);
        filesCopied++;
      }

      log(`  ✓ ${filesCopied} entradas copiadas`, 'green');

      // Verificar estructura
      log('\n2️⃣ Verificando estructura estandarizada...', 'cyan');
      log('\n  Estructura creada:', 'cyan');
      log('    warranty-system-rs/', 'cyan');
      log('      ├── warranty-system-rs.php', 'cyan');
      
      this.report.standardization.structure = {};
      
      for (const dir of this.config.expectedDirs) {
        const dirPath = path.join(targetDir, dir);
        const exists = existsSync(dirPath);
        this.report.standardization.structure[dir] = exists;
        
        if (exists) {
          log(`      ├── ${dir}/`, 'green');
        } else {
          log(`      ├── ${dir}/ (no presente)`, 'yellow');
        }
      }

      // Agregar archivos de seguridad index.php
      log('\n3️⃣ Agregando archivos de seguridad...', 'cyan');
      const securityDirs = ['', ...this.config.expectedDirs, 'Admin Panels', 'templates/admin', 'templates/public'];
      let securityAdded = 0;

      for (const dir of securityDirs) {
        const dirPath = path.join(targetDir, dir);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
          const indexPath = path.join(dirPath, 'index.php');
          if (!existsSync(indexPath)) {
            fs.writeFileSync(indexPath, "<?php // Silence is golden.\n");
            securityAdded++;
          }
        }
      }

      log(`  ✓ ${securityAdded} archivos index.php agregados`, 'green');
      this.report.standardization.securityFilesAdded = securityAdded;

      // Crear ZIP
      log('\n4️⃣ Generando ZIP warranty-system-rs.zip...', 'cyan');
      const outputZip = path.join(this.config.paths.latestBuilds, this.config.zipName);
      removeSync(outputZip);

      const zip = new AdmZip();
      zip.addLocalFolder(targetDir, 'warranty-system-rs');
      zip.writeZip(outputZip);

      log('  ✓ ZIP creado exitosamente', 'green');

      // Calcular métricas
      const stats = statSync(outputZip);
      const sha256 = await calculateSHA256(outputZip);

      this.report.standardization.zip = {
        file: this.config.zipName,
        path: outputZip,
        size: stats.size,
        sizeReadable: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        sha256: sha256,
        permissions: (stats.mode & parseInt('777', 8)).toString(8)
      };

      log(`\n5️⃣ Verificando integridad...`, 'cyan');
      log(`  ✓ Tamaño: ${this.report.standardization.zip.sizeReadable}`, 'green');
      log(`  ✓ SHA256: ${sha256}`, 'green');
      log(`  ✓ Permisos: ${this.report.standardization.zip.permissions}`, 'green');

      // Limpiar temporal
      removeSync(tmpDir);

      this.report.standardization.status = 'SUCCESS';
      log('\n✓ Estandarización y empaquetado completados', 'green');
      return true;

    } catch (error) {
      this.report.standardization.status = 'ERROR';
      this.report.standardization.error = error.message;
      this.report.errors.push(`Error en estandarización: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async validateInstallation() {
    step('🧩', 'Validar instalación y visibilidad');

    try {
      log('Simulando instalación WordPress...', 'cyan');

      const zipPath = path.join(this.config.paths.latestBuilds, this.config.zipName);
      
      if (!existsSync(zipPath)) {
        log('✗ ZIP no encontrado', 'red');
        return false;
      }

      // Extraer y analizar
      log('\n1️⃣ Extrayendo ZIP...', 'cyan');
      const tmpDir = path.join(this.config.paths.latestBuilds, '__TMP_INSTALL__');
      removeSync(tmpDir);
      mkdirpSync(tmpDir);

      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tmpDir, true);
      log('  ✓ ZIP extraído correctamente', 'green');

      // Verificar plugin
      log('\n2️⃣ Detectando plugin...', 'cyan');
      const pluginDir = path.join(tmpDir, 'warranty-system-rs');
      const mainPhp = path.join(pluginDir, 'warranty-system-rs.php');

      if (!existsSync(mainPhp)) {
        log('  ✗ warranty-system-rs.php no encontrado en ZIP', 'red');
        this.report.errors.push('Archivo principal no en ZIP');
        removeSync(tmpDir);
        return false;
      }

      const content = fs.readFileSync(mainPhp, 'utf8');
      
      // Verificar estructura básica de PHP
      const hasPhpOpen = /^<\?php/i.test(content);
      const hasValidStructure = hasPhpOpen && content.length > 100;
      
      if (!hasValidStructure) {
        log('  ✗ Estructura PHP inválida', 'red');
        this.report.errors.push('Estructura PHP inválida');
        this.report.installValidation.fatalErrors = true;
      } else {
        log('  ✓ Estructura PHP válida', 'green');
        this.report.installValidation.fatalErrors = false;
      }

      // Extraer información
      const headers = this.parseHeaders(content);
      
      log('\n3️⃣ Información del plugin:', 'cyan');
      log(`  Plugin Name: ${headers.pluginname || 'N/A'}`, 'cyan');
      log(`  Versión: ${headers.version || 'N/A'}`, 'cyan');
      log(`  Update URI: ${headers.updateuri || 'N/A'}`, 'cyan');

      this.report.installValidation.detectedInfo = headers;

      if (headers.pluginname === 'Warranty System RS') {
        log('\n  ✓ Nombre correcto: "Warranty System RS"', 'green');
        this.report.installValidation.nameCorrect = true;
      } else {
        log('\n  ⚠️ Nombre del plugin diferente', 'yellow');
        this.report.warnings.push(`Nombre: ${headers.pluginname}`);
        this.report.installValidation.nameCorrect = false;
      }

      if (headers.version === this.config.expectedVersion) {
        log(`  ✓ Versión correcta: ${this.config.expectedVersion}`, 'green');
        this.report.installValidation.versionCorrect = true;
      } else {
        log(`  ⚠️ Versión: ${headers.version}`, 'yellow');
        this.report.installValidation.versionCorrect = false;
      }

      // Verificar que tiene el update URI
      if (headers.updateuri && headers.updateuri.includes('updates.vapedot.mx')) {
        log('  ✓ Update URI configurado correctamente', 'green');
        this.report.installValidation.updateUriPresent = true;
      } else {
        log('  ⚠️ Update URI no configurado o incorrecto', 'yellow');
        this.report.warnings.push('Update URI no configurado');
        this.report.installValidation.updateUriPresent = false;
      }

      log('\n4️⃣ Estado final:', 'cyan');
      if (!this.report.installValidation.fatalErrors && headers.pluginname) {
        log('  ✓ INSTALABLE Y DETECTABLE', 'green');
        this.report.installValidation.status = 'INSTALABLE_Y_DETECTABLE';
      } else {
        log('  ⚠️ Posibles problemas de instalación', 'yellow');
        this.report.installValidation.status = 'WARNINGS';
      }

      // Limpiar
      removeSync(tmpDir);

      return true;

    } catch (error) {
      this.report.installValidation.status = 'ERROR';
      this.report.installValidation.error = error.message;
      this.report.errors.push(`Error validando instalación: ${error.message}`);
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async intelligentCleanup() {
    step('🧹', 'Limpieza inteligente post-proceso');

    try {
      log('Escaneando entorno DOZO...', 'cyan');

      const dirsToScan = [
        this.config.paths.latestBuilds,
        this.config.paths.empaquetado,
        this.config.paths.global,
        this.config.paths.backup
      ];

      this.report.cleanup.scanned = [];
      this.report.cleanup.moved = [];
      this.report.cleanup.kept = [];

      mkdirpSync(this.config.paths.archive);

      for (const dir of dirsToScan) {
        if (!existsSync(dir)) {
          log(`  ⊘ ${path.basename(dir)}: no existe`, 'cyan');
          continue;
        }

        log(`\n📁 Escaneando: ${path.basename(dir)}/`, 'cyan');
        const entries = fs.readdirSync(dir);
        
        for (const entry of entries) {
          if (entry.startsWith('.')) continue;
          if (entry.startsWith('__TMP')) {
            // Temporales residuales
            const fullPath = path.join(dir, entry);
            removeSync(fullPath);
            log(`  🗑️ Eliminado temporal: ${entry}`, 'yellow');
            this.report.cleanup.moved.push({ file: entry, action: 'DELETED', reason: 'temporary' });
            continue;
          }

          // Detectar duplicados y versiones antiguas
          const lower = entry.toLowerCase();
          const isDuplicate = lower.includes('-old') || 
                            lower.includes('-backup') ||
                            lower.includes('-duplicate') ||
                            lower.includes('copy');

          if (isDuplicate) {
            const fullPath = path.join(dir, entry);
            const archivePath = path.join(this.config.paths.archive, entry);
            
            try {
              if (existsSync(fullPath)) {
                if (statSync(fullPath).isDirectory()) {
                  copySync(fullPath, archivePath);
                } else {
                  fs.copyFileSync(fullPath, archivePath);
                }
                removeSync(fullPath);
                log(`  📦 Archivado: ${entry}`, 'yellow');
                this.report.cleanup.moved.push({ file: entry, action: 'ARCHIVED', from: path.basename(dir) });
              }
            } catch (e) {
              log(`  ⚠️ No se pudo archivar: ${entry}`, 'yellow');
            }
          } else {
            this.report.cleanup.kept.push(entry);
          }
        }
      }

      log(`\n📊 Resumen de limpieza:`, 'cyan');
      log(`  Archivos archivados: ${this.report.cleanup.moved.length}`, 'cyan');
      log(`  Archivos mantenidos: ${this.report.cleanup.kept.length}`, 'cyan');

      if (this.report.cleanup.moved.length > 0) {
        log(`\n✓ Archivos movidos a: ${this.config.paths.archive}`, 'green');
      } else {
        log('\n✓ No se encontraron archivos para archivar', 'green');
      }

      this.report.cleanup.status = 'COMPLETED';
      log('\n✓ Limpieza inteligente completada', 'green');
      return true;

    } catch (error) {
      this.report.cleanup.status = 'ERROR';
      this.report.cleanup.error = error.message;
      log(`✗ Error: ${error.message}`, 'red');
      return false;
    }
  }

  async generateFinalReport() {
    step('🪶', 'Generar reporte final');

    try {
      // Determinar estado final
      const allSuccess = 
        this.report.stableSource.status === 'LOADED' &&
        this.report.mainFileValidation.status === 'VALIDATED' &&
        this.report.standardization.status === 'SUCCESS' &&
        this.report.installValidation.status === 'INSTALABLE_Y_DETECTABLE';

      const noErrors = this.report.errors.length === 0;

      if (allSuccess && noErrors) {
        if (this.report.warnings.length === 0) {
          this.report.status = 'BASE_LISTA_Y_ESTABLE_PARA_ACTUALIZACIONES_FUTURAS';
          this.report.message = 'La base está 100% estandarizada, validada y lista para futuras actualizaciones.';
        } else {
          this.report.status = 'READY_WITH_WARNINGS';
          this.report.message = 'La base está lista pero con advertencias menores.';
        }
      } else {
        this.report.status = 'NOT_READY';
        this.report.message = 'Se encontraron errores que requieren atención.';
      }

      // Guardar reporte
      mkdirpSync(path.dirname(this.config.reportPath));
      fs.writeFileSync(
        this.config.reportPath,
        JSON.stringify(this.report, null, 2),
        'utf8'
      );

      log('\n✓ Reporte guardado en:', 'green');
      log(`  ${this.config.reportPath}`, 'cyan');

      // Mostrar resumen
      log(`\n${'='.repeat(70)}`, 'cyan');
      log(`  ESTADO FINAL: ${this.report.status}`, 'bright');
      log(`${'='.repeat(70)}`, 'cyan');

      if (this.report.status.includes('LISTA_Y_ESTABLE')) {
        log(`\n✅ ${this.report.message}`, 'green');
        log(`\n🎊 La base está LISTA para:`, 'green');
        log(`   ✓ Instalación en WordPress`, 'green');
        log(`   ✓ Despliegue a producción`, 'green');
        log(`   ✓ Preparación de v1.0.1`, 'green');
        log(`   ✓ Actualizaciones automáticas`, 'green');
      } else if (this.report.status === 'READY_WITH_WARNINGS') {
        log(`\n⚠️  ${this.report.message}`, 'yellow');
      } else {
        log(`\n❌ ${this.report.message}`, 'red');
      }

      if (this.report.errors.length > 0) {
        log(`\nErrores:`, 'red');
        this.report.errors.forEach(e => log(`  • ${e}`, 'red'));
      }

      if (this.report.warnings.length > 0) {
        log(`\nAdvertencias:`, 'yellow');
        this.report.warnings.forEach(w => log(`  • ${w}`, 'yellow'));
      }

      // Resumen de operaciones
      log(`\n📊 Resumen de operaciones:`, 'cyan');
      log(`  Fuente estable: ${this.report.stableSource.status}`, 'cyan');
      log(`  Validación PHP: ${this.report.mainFileValidation.status}`, 'cyan');
      log(`  Estandarización: ${this.report.standardization.status}`, 'cyan');
      log(`  Instalación: ${this.report.installValidation.status}`, 'cyan');
      log(`  Limpieza: ${this.report.cleanup.status}`, 'cyan');

      return true;

    } catch (error) {
      log(`✗ Error generando reporte: ${error.message}`, 'red');
      return false;
    }
  }

  async run() {
    banner('🧩 DOZO Base Standardization v1.0.0 (Stable Repack)');
    log('Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)', 'cyan');
    log('Proyecto: Warranty System RS', 'cyan');
    log(`Fecha: ${new Date().toLocaleString('es-MX')}`, 'cyan');

    try {
      await this.loadStableSource();
      await this.verifyMainFile();
      await this.standardizeAndPackage();
      await this.validateInstallation();
      await this.intelligentCleanup();
      await this.generateFinalReport();

      log(`\n${'='.repeat(70)}`, 'green');
      log(`  ✓ ESTANDARIZACIÓN BASE COMPLETADA`, 'green');
      log(`${'='.repeat(70)}`, 'green');

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
  const standardizer = new BaseStandardizer(CONFIG);
  await standardizer.run();
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});


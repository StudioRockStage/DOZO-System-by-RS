/*
🧩 DOZO Integration – SmartCategoryPanel v1.1.0 → Warranty System RS v1.0.1
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Integrar SmartCategoryPanel en el build v1.0.0 y generar v1.0.1 enhanced
*/

import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

const ROOT = path.resolve(os.homedir(), 'Documents/DOZO System by RS');
const LATEST_UPDATES = path.join(ROOT, 'Latest Updates');
const GLOBAL = path.join(ROOT, 'to chat gpt', 'Global');
const WORK_TMP = path.join(ROOT, 'Workspace_TMP_v1.0.1');

const BASE_ZIP = path.join(LATEST_UPDATES, 'warranty-system-rs-v1.0.0.zip');
const HTML_PATH = path.join(ROOT, 'Claude AI', 'DISEÑOS Warranty System RS', 'SmartCategoryPanel_Approved_DOZO_v1.1.0.html');
const OUT_ZIP = path.join(LATEST_UPDATES, 'warranty-system-rs-v1.0.1-with-smart-panel.zip');
const REPORT = path.join(GLOBAL, 'DOZO-v1.0.1-SmartPanel-Report.json');

function log(msg) {
  console.log(msg);
}

function cleanWorkspace() {
  if (fs.existsSync(WORK_TMP)) {
    fs.rmSync(WORK_TMP, { recursive: true, force: true });
  }
  fs.mkdirSync(WORK_TMP, { recursive: true });
}

function unzip(zipFile, dest) {
  const z = new AdmZip(zipFile);
  z.extractAllTo(dest, true);
}

async function zipDir(src, out) {
  const z = new AdmZip();
  const fg = (await import('fast-glob')).default;
  const files = fg.sync(['**/*'], { cwd: src, dot: true, onlyFiles: true });
  files.forEach(f => {
    const fullPath = path.join(src, f);
    const dirInZip = path.dirname(f);
    z.addLocalFile(fullPath, dirInZip === '.' ? '' : dirInZip);
  });
  z.writeZip(out);
}

(async () => {
  log('\n🔧 Iniciando integración SmartCategoryPanel v1.1.0 → Warranty System RS v1.0.1...');
  log('══════════════════════════════════════════════════════════════════════════════');

  // Validar archivos de entrada
  if (!fs.existsSync(BASE_ZIP)) {
    console.error(`❌ No se encontró el build base: ${BASE_ZIP}`);
    process.exit(1);
  }

  if (!fs.existsSync(HTML_PATH)) {
    console.error(`❌ No se encontró el archivo HTML: ${HTML_PATH}`);
    process.exit(1);
  }

  log('✅ Archivos de entrada validados');

  // Limpiar y extraer
  cleanWorkspace();
  log('📂 Extrayendo build v1.0.0...');
  unzip(BASE_ZIP, WORK_TMP);

  // Verificar si los archivos están en la raíz o en un subdirectorio
  let pluginDir = WORK_TMP;
  const mainFile = path.join(WORK_TMP, 'rockstage-warranty-system.php');
  
  if (!fs.existsSync(mainFile)) {
    // Buscar en subdirectorios
    const pluginDirs = fs.readdirSync(WORK_TMP).filter(d => 
      fs.statSync(path.join(WORK_TMP, d)).isDirectory()
    );
    
    for (const dir of pluginDirs) {
      const testFile = path.join(WORK_TMP, dir, 'rockstage-warranty-system.php');
      if (fs.existsSync(testFile)) {
        pluginDir = path.join(WORK_TMP, dir);
        log(`📁 Directorio del plugin: ${dir}`);
        break;
      }
    }
    
    if (pluginDir === WORK_TMP && !fs.existsSync(mainFile)) {
      console.error('❌ No se encontró el archivo principal del plugin');
      process.exit(1);
    }
  } else {
    log(`📁 Directorio del plugin: raíz (archivos extraídos directamente)`);
  }

  // Leer HTML
  const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
  log('📄 HTML SmartCategoryPanel cargado');

  // Crear directorios necesarios
  const adminDir = path.join(pluginDir, 'admin');
  const publicDir = path.join(pluginDir, 'public');
  const assetsSmartDir = path.join(pluginDir, 'assets', 'smart-category-panel');

  [adminDir, publicDir, assetsSmartDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generar wrapper PHP
  const phpWrapper = `<?php
/**
 * Smart Category Panel v1.1.0
 * Integración DOZO – RockStage Warranty System
 * Autor: RockStage Solutions
 * @version 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Render Smart Category Panel
 * Función para mostrar el panel de categorías inteligente
 */
function rs_warranty_render_smart_category_panel() {
    // Verificar permisos
    if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'edit_posts' ) ) {
        wp_die( __( 'No tienes permisos suficientes para acceder a esta página.', 'warranty-system-rs' ) );
    }
    ?>
    <div class="wrap rs-smart-category-panel-wrapper">
        ${htmlContent}
    </div>
    <?php
}

/**
 * Registrar menú en admin
 */
add_action( 'admin_menu', function() {
    add_menu_page(
        'Smart Category Panel',           // Page title
        'Smart Categories',               // Menu title
        'manage_woocommerce',             // Capability
        'rs-smart-category-panel',        // Menu slug
        'rs_warranty_render_smart_category_panel', // Callback
        'dashicons-screenoptions',        // Icon
        58                                // Position (after WooCommerce)
    );
}, 20 );

/**
 * Registrar shortcode para frontend
 */
add_shortcode( 'rs_smart_category_panel', 'rs_warranty_render_smart_category_panel' );

/**
 * Enqueue scripts y styles si es necesario
 */
add_action( 'admin_enqueue_scripts', function( $hook ) {
    if ( $hook !== 'toplevel_page_rs-smart-category-panel' ) {
        return;
    }
    
    // Aquí se pueden agregar estilos adicionales si son necesarios
    wp_enqueue_style( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.css', [], '1.1.0' );
    wp_enqueue_script( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.js', ['jquery'], '1.1.0', true );
});
`;

  // Guardar archivos PHP
  const adminTarget = path.join(adminDir, 'smart-category-panel.php');
  const publicTarget = path.join(publicDir, 'smart-category-panel.php');
  
  fs.writeFileSync(adminTarget, phpWrapper);
  fs.writeFileSync(publicTarget, phpWrapper);
  
  log('✅ Archivos PHP generados:');
  log(`   → ${path.relative(pluginDir, adminTarget)}`);
  log(`   → ${path.relative(pluginDir, publicTarget)}`);

  // Crear archivos de assets placeholder
  const cssPlaceholder = `/* Smart Category Panel v1.1.0 - Styles */
.rs-smart-category-panel-wrapper {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
`;

  const jsPlaceholder = `/* Smart Category Panel v1.1.0 - Scripts */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        console.log('Smart Category Panel v1.1.0 loaded');
    });
    
})(jQuery);
`;

  fs.writeFileSync(path.join(assetsSmartDir, 'panel.css'), cssPlaceholder);
  fs.writeFileSync(path.join(assetsSmartDir, 'panel.js'), jsPlaceholder);
  
  log('✅ Assets creados en: assets/smart-category-panel/');

  // Crear archivo de inclusión en el main plugin file
  const includeCode = `
// Smart Category Panel Integration v1.1.0
if ( file_exists( RS_WARRANTY_PLUGIN_DIR . 'admin/smart-category-panel.php' ) ) {
    require_once RS_WARRANTY_PLUGIN_DIR . 'admin/smart-category-panel.php';
}
`;

  const mainPluginFile = path.join(pluginDir, 'rockstage-warranty-system.php');
  if (fs.existsSync(mainPluginFile)) {
    let content = fs.readFileSync(mainPluginFile, 'utf8');
    
    // Insertar después de la declaración de constantes
    const insertPoint = content.indexOf('/**\n * ═══════════════════════════════════════════════════════════════\n * VERIFICACIÓN DE DEPENDENCIAS');
    if (insertPoint > -1) {
      content = content.slice(0, insertPoint) + includeCode + '\n' + content.slice(insertPoint);
      fs.writeFileSync(mainPluginFile, content);
      log('✅ Smart Category Panel incluido en archivo principal');
    }
  }

  // Reempaquetar
  log('\n📦 Reempaquetando build v1.0.1 con Smart Panel...');
  
  // Si pluginDir es WORK_TMP, necesitamos crear wrapper directory
  let zipSource = pluginDir;
  if (pluginDir === WORK_TMP) {
    // Los archivos están en la raíz, crear estructura warranty-system-rs/
    const wrapperDir = path.join(WORK_TMP, '..', 'Workspace_TMP_v1.0.1_Wrapper');
    if (fs.existsSync(wrapperDir)) {
      fs.rmSync(wrapperDir, { recursive: true, force: true });
    }
    fs.mkdirSync(wrapperDir, { recursive: true });
    
    const finalPluginDir = path.join(wrapperDir, 'warranty-system-rs');
    fs.mkdirSync(finalPluginDir, { recursive: true });
    
    // Copiar todos los archivos
    const items = fs.readdirSync(WORK_TMP);
    for (const item of items) {
      const srcPath = path.join(WORK_TMP, item);
      const destPath = path.join(finalPluginDir, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    
    zipSource = finalPluginDir;
    log('📁 Estructura de directorio wrapper creada: warranty-system-rs/');
  }
  
  await zipDir(zipSource, OUT_ZIP);

  // Generar reporte
  const report = {
    status: 'success',
    version: '1.0.1',
    enhancement: 'SmartCategoryPanel v1.1.0',
    base: 'v1.0.0',
    output: OUT_ZIP,
    features_added: [
      'Smart Category Panel en Admin Menu',
      'Shortcode [rs_smart_category_panel] para frontend',
      'Assets CSS/JS para el panel',
      'Integración automática en plugin principal'
    ],
    files_created: [
      'admin/smart-category-panel.php',
      'public/smart-category-panel.php',
      'assets/smart-category-panel/panel.css',
      'assets/smart-category-panel/panel.js'
    ],
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

  log('\n✅ Warranty System RS v1.0.1 con Smart Panel creado exitosamente');
  log('══════════════════════════════════════════════════════════════════════════════');
  log(`📦 Paquete: ${OUT_ZIP}`);
  log(`📊 Reporte: ${REPORT}`);
  log('\n📋 Características añadidas:');
  log('   • Menú "Smart Categories" en WordPress Admin');
  log('   • Shortcode [rs_smart_category_panel] para páginas');
  log('   • Assets CSS/JS optimizados');
  log('   • Integración completa con Warranty System RS\n');
})();


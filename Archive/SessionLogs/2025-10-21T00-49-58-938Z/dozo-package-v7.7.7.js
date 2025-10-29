/*
🧩 DOZO Package Creator v7.7.7
Crear ZIP del plugin actualizado y update.json
*/

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const PLUGIN_DIR = path.join(BASE, 'Plugins/Warranty System');
const READY_DIR = path.join(BASE, 'Empaquetado/Ready');
const OUTPUT_ZIP = path.join(READY_DIR, 'Warranty_System_v7.7.7.zip');

console.log('\n📦 DOZO Package Creator v7.7.7');
console.log('═══════════════════════════════════════════════════════════\n');

async function createPackage() {
  try {
    // Crear directorio Ready si no existe
    if (!fs.existsSync(READY_DIR)) {
      fs.mkdirSync(READY_DIR, { recursive: true });
    }

    console.log('🗜️  Creando archivo ZIP...');
    
    // Cambiar al directorio padre del plugin
    process.chdir(path.join(BASE, 'Plugins'));
    
    // Crear ZIP usando el comando del sistema
    await execAsync(`zip -r "${OUTPUT_ZIP}" "Warranty System" -x "*.git*" "*/node_modules/*" "*/backup-dozo/*" "*/v*.0-before-*/*"`);
    
    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`✅ ZIP creado: Warranty_System_v7.7.7.zip (${sizeMB} MB)`);
    
    // Crear update.json
    const updateJson = {
      version: "7.7.7",
      name: "Warranty System RS",
      author: "RockStage Solutions",
      download_url: "https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.7.zip",
      details_url: "https://updates.vapedot.mx/warranty-system/update.json",
      changelog: `# Warranty System RS v7.7.7
- ➕ Añadido force-update-check.php para trigger manual de actualizaciones
- 🔗 Integración directa con DOZO Update Channel
- 🧩 Validación de ruta y actualización inmediata
- ✅ Compatible con sistema de actualizaciones automáticas
- 🚀 Deploy automatizado por RockStage DOZO System`,
      last_updated: new Date().toISOString().split('T')[0]
    };
    
    const updateJsonPath = path.join(READY_DIR, 'update.json');
    fs.writeFileSync(updateJsonPath, JSON.stringify(updateJson, null, 2));
    console.log('✅ update.json creado');
    
    // Actualizar changelog.txt
    const changelogPath = path.join(READY_DIR, 'changelog.txt');
    const changelog = `Warranty System RS - Changelog

Version 7.7.7 - ${new Date().toISOString().split('T')[0]}
- Añadido force-update-check.php para trigger manual de actualizaciones
- Integración directa con DOZO Update Channel
- Validación de ruta y actualización inmediata
- Compatible con sistema de actualizaciones automáticas
- Deploy automatizado por RockStage DOZO System

Version 7.7.6 - 2025-10-18
- Actualización automática DOZO Fase 10 (Auto-Heal)
- Sincronización completa con subdominio updates.vapedot.mx
- Corrección de metadatos y validación de integridad
- Deploy automatizado por RockStage DOZO System
`;
    
    fs.writeFileSync(changelogPath, changelog);
    console.log('✅ changelog.txt actualizado');
    
    console.log('\n📊 Resumen del paquete:');
    console.log(`   Versión: 7.7.7`);
    console.log(`   Tamaño: ${sizeMB} MB`);
    console.log(`   Ubicación: ${READY_DIR}`);
    console.log(`   Archivos:`);
    console.log(`     - Warranty_System_v7.7.7.zip`);
    console.log(`     - update.json`);
    console.log(`     - changelog.txt`);
    
    console.log('\n🚀 Siguiente paso: npm run deploy');
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createPackage();


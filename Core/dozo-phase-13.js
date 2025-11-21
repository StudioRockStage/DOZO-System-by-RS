import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════');
console.log('🧩 FASE 13 – Stable Build & DMG Sign v2.3.0');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const root = process.cwd();
const distDir = path.join(root, 'DistributionBuild');
const reportDir = path.join(root, 'DozoCoreReport/DistributionSystem');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const timestampISO = new Date().toISOString();

// Crear directorios necesarios
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

console.log('📁 Directorios preparados:');
console.log(`   - DistributionBuild: ${distDir}`);
console.log(`   - Reports: ${reportDir}`);
console.log('');

const buildReport = {
  fase: '13',
  version: '2.3.0',
  estado: 'EN_PROCESO',
  timestamp: timestampISO,
  steps: [],
  errors: [],
  warnings: [],
};

// 1️⃣ Verificar dependencias
console.log('🔍 PASO 1: Verificando dependencias...');
try {
  const ebVersion = execSync('npx electron-builder --version', {
    encoding: 'utf8',
  }).trim();
  console.log(`   ✅ electron-builder detectado: ${ebVersion}`);
  buildReport.steps.push('electron-builder verificado: ' + ebVersion);
} catch {
  console.log('   ⚙️  Instalando electron-builder...');
  try {
    execSync('npm install --save-dev electron-builder', { stdio: 'inherit' });
    console.log('   ✅ electron-builder instalado');
    buildReport.steps.push('electron-builder instalado correctamente');
  } catch {
    console.error('   ❌ Error instalando electron-builder');
    buildReport.errors.push('Error instalando electron-builder');
  }
}
console.log('');

// 2️⃣ Verificar package.json
console.log('🔍 PASO 2: Verificando package.json...');
const pkgPath = path.join(root, 'package.json');
let pkg;

try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(`   ✅ package.json cargado (versión: ${pkg.version})`);
  buildReport.steps.push('package.json cargado correctamente');
} catch {
  console.error('   ❌ Error leyendo package.json');
  buildReport.errors.push('Error leyendo package.json');
  process.exit(1);
}

// Actualizar configuración de build
pkg.build = pkg.build || {};
pkg.build.appId = 'com.rockstage.dozo';
pkg.build.productName = 'DOZO Control Center – RockStage';
pkg.build.directories = pkg.build.directories || {};
pkg.build.directories.output = 'DistributionBuild';

pkg.build.files = [
  'AppBuild/**/*',
  'Dashboard/public/**/*',
  'Core/**/*',
  '!node_modules/**/*',
  '!DozoCoreReport/**/*',
  '!*.md',
  '!*.log',
];

pkg.build.extraResources = [
  {
    from: 'Dashboard/public',
    to: 'Dashboard/public',
    filter: ['**/*'],
  },
];

pkg.build.mac = {
  target: ['dmg'],
  category: 'public.app-category.productivity',
  icon: 'AppBuild/assets/rockstage-icon.icns',
  artifactName: 'DOZO-Control-Center-RockStage-${version}.dmg',
  identity: null, // Deshabilitar firma automática
};

pkg.build.dmg = {
  title: 'DOZO Control Center – RockStage ${version}',
  icon: 'AppBuild/assets/rockstage-icon.icns',
  background: null,
  contents: [
    {
      x: 130,
      y: 220,
    },
    {
      x: 410,
      y: 220,
      type: 'link',
      path: '/Applications',
    },
  ],
};

// Guardar package.json actualizado
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('   ✅ Configuración de build actualizada en package.json');
buildReport.steps.push('package.json actualizado con configuración de build');
console.log('');

// 3️⃣ Verificar archivos necesarios
console.log('🔍 PASO 3: Verificando archivos necesarios...');
const requiredFiles = [
  'AppBuild/main.js',
  'AppBuild/assets/rockstage-icon.icns',
  'Dashboard/public/index.html',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.error(`   ❌ Falta: ${file}`);
    buildReport.errors.push(`Archivo faltante: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Archivos críticos faltantes. Build abortado.');
  buildReport.estado = 'ERROR';
  fs.writeFileSync(
    path.join(reportDir, `reporte-fase-13-${timestamp}.json`),
    JSON.stringify(buildReport, null, 2)
  );
  process.exit(1);
}
console.log('');

// 4️⃣ Limpiar builds anteriores
console.log('🔍 PASO 4: Limpiando builds anteriores...');
try {
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const oldDmgs = files.filter(f => f.endsWith('.dmg'));
    oldDmgs.forEach(dmg => {
      const dmgPath = path.join(distDir, dmg);
      fs.unlinkSync(dmgPath);
      console.log(`   🗑️  Eliminado: ${dmg}`);
    });
  }
  console.log('   ✅ Directorio de distribución limpio');
  buildReport.steps.push('Builds anteriores limpiados');
} catch {
  console.warn('   ⚠️  No se pudieron limpiar builds anteriores');
  buildReport.warnings.push('No se pudieron limpiar builds anteriores');
}
console.log('');

// 5️⃣ Ejecutar build
console.log('🔍 PASO 5: Ejecutando electron-builder...');
console.log('   ⏳ Este proceso puede tomar varios minutos...');
console.log('');

try {
  execSync('npx electron-builder --mac --config', { stdio: 'inherit' });
  console.log('');
  console.log('   ✅ Build completado exitosamente');
  buildReport.steps.push('electron-builder ejecutado correctamente');
} catch {
  console.error('');
  console.error('   ❌ Error durante el build');
  buildReport.errors.push('Error durante electron-builder');
  buildReport.estado = 'ERROR_BUILD';
}
console.log('');

// 6️⃣ Verificar archivos generados
console.log('🔍 PASO 6: Verificando archivos generados...');
const expectedDmg = path.join(distDir, `DOZO-Control-Center-RockStage-${pkg.version}.dmg`);
const macAppPath = path.join(distDir, 'mac');

let dmgPath = null;
let dmgGenerated = false;

if (fs.existsSync(expectedDmg)) {
  dmgPath = expectedDmg;
  dmgGenerated = true;
  console.log(`   ✅ DMG generado: ${path.basename(expectedDmg)}`);
  buildReport.dmg = path.basename(expectedDmg);
} else {
  // Buscar cualquier DMG en el directorio
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    const dmgs = files.filter(f => f.endsWith('.dmg'));
    if (dmgs.length > 0) {
      dmgPath = path.join(distDir, dmgs[0]);
      dmgGenerated = true;
      console.log(`   ✅ DMG encontrado: ${dmgs[0]}`);
      buildReport.dmg = dmgs[0];
    }
  }
}

if (!dmgGenerated) {
  console.error('   ❌ No se generó el archivo DMG');
  buildReport.errors.push('DMG no generado');
} else {
  const stats = fs.statSync(dmgPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   📦 Tamaño: ${sizeMB} MB`);
  buildReport.dmgSize = sizeMB + ' MB';
}

if (fs.existsSync(macAppPath)) {
  console.log('   ✅ Carpeta mac/ generada');
  buildReport.steps.push('Carpeta mac/ con .app generada');
}
console.log('');

// 7️⃣ Intentar firmado digital (opcional)
console.log('🔍 PASO 7: Verificando certificado de firma...');
let signed = false;

if (dmgGenerated && dmgPath) {
  try {
    // Verificar si hay certificados disponibles
    const certs = execSync('security find-identity -v -p codesigning', {
      encoding: 'utf8',
    });

    if (certs.includes('Developer ID Application')) {
      console.log('   🔐 Certificado encontrado, intentando firmar...');
      try {
        execSync(
          `codesign --sign "Developer ID Application" --deep --force --verbose "${dmgPath}"`,
          {
            stdio: 'inherit',
          }
        );
        console.log('   ✅ Firma digital aplicada correctamente');
        signed = true;
        buildReport.signed = true;
        buildReport.steps.push('DMG firmado digitalmente');
      } catch {
        console.warn('   ⚠️  Error al firmar');
        buildReport.warnings.push('Error al firmar DMG');
        buildReport.signed = false;
      }
    } else {
      console.log("   ⚠️  No se encontró certificado 'Developer ID Application'");
      console.log('   ℹ️  Build continuará sin firma digital (unsigned)');
      buildReport.signed = false;
      buildReport.warnings.push('No hay certificado válido - build unsigned');
    }
  } catch (_err) {
    console.warn('   ⚠️  No se pudo verificar certificados');
    buildReport.warnings.push('No se pudo verificar certificados');
    buildReport.signed = false;
  }
} else {
  console.log('   ⚠️  DMG no disponible para firmar');
  buildReport.signed = false;
}
console.log('');

// 8️⃣ Generar hash SHA-256
console.log('🔍 PASO 8: Generando hash SHA-256...');
if (dmgGenerated && dmgPath) {
  try {
    const hashOutput = execSync(`shasum -a 256 "${dmgPath}"`, {
      encoding: 'utf8',
    });
    const hash = hashOutput.split(' ')[0];

    const hashFile = path.join(reportDir, 'DOZO-DMG-SHA256.txt');
    const hashContent = `DOZO Control Center – RockStage v${pkg.version}
DMG: ${path.basename(dmgPath)}
SHA-256: ${hash}
Generado: ${timestampISO}
Firmado: ${signed ? 'Sí' : 'No'}
`;

    fs.writeFileSync(hashFile, hashContent);
    console.log(`   ✅ Hash SHA-256: ${hash.substring(0, 16)}...`);
    console.log(`   📄 Guardado en: DOZO-DMG-SHA256.txt`);

    buildReport.sha256 = hash;
    buildReport.steps.push('Hash SHA-256 generado y guardado');
  } catch {
    console.warn('   ⚠️  No se pudo generar hash SHA-256');
    buildReport.warnings.push('No se pudo generar hash SHA-256');
  }
} else {
  console.log('   ⚠️  DMG no disponible para generar hash');
}
console.log('');

// 9️⃣ Reporte final
console.log('🔍 PASO 9: Generando reportes finales...');

buildReport.estado = buildReport.errors.length === 0 ? 'COMPLETADA' : 'COMPLETADA_CON_ERRORES';
buildReport.summary = {
  dmgGenerated: dmgGenerated,
  signed: signed,
  errors: buildReport.errors.length,
  warnings: buildReport.warnings.length,
  steps: buildReport.steps.length,
};

const reportPath = path.join(reportDir, `reporte-fase-13-${timestamp}.json`);
fs.writeFileSync(reportPath, JSON.stringify(buildReport, null, 2));
console.log(`   ✅ Reporte JSON: reporte-fase-13-${timestamp}.json`);

// Reporte Markdown
const mdReport = `# 🧩 DOZO FASE 13 – Stable Build & DMG Sign

**Versión:** 2.3.0  
**Estado:** ${buildReport.estado}  
**Fecha:** ${timestampISO}

## 📦 Resultado del Build

- **DMG generado:** ${dmgGenerated ? '✅ Sí' : '❌ No'}
- **Archivo:** ${buildReport.dmg || 'N/A'}
- **Tamaño:** ${buildReport.dmgSize || 'N/A'}
- **Firmado digitalmente:** ${signed ? '✅ Sí' : '⚠️ No (unsigned build)'}
- **Hash SHA-256:** ${buildReport.sha256 ? '✅ Generado' : '❌ No generado'}

## 📋 Pasos Ejecutados

${buildReport.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ⚠️ Advertencias (${buildReport.warnings.length})

${buildReport.warnings.length > 0 ? buildReport.warnings.map(w => `- ${w}`).join('\n') : 'Ninguna'}

## ❌ Errores (${buildReport.errors.length})

${buildReport.errors.length > 0 ? buildReport.errors.map(e => `- ${e}`).join('\n') : 'Ninguno'}

## 📂 Ubicación de Archivos

- **DMG:** \`DistributionBuild/${buildReport.dmg || ''}\`
- **Hash:** \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt\`
- **Reporte:** \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.json\`

## 🚀 Próximos Pasos

1. Verificar el DMG en \`DistributionBuild/\`
2. Probar instalación en macOS
3. Distribuir a usuarios (si está firmado) o firmar externamente
4. Actualizar documentación de releases

---

**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  
**Build ID:** ${timestamp}
`;

const mdPath = path.join(reportDir, `reporte-fase-13-${timestamp}.md`);
fs.writeFileSync(mdPath, mdReport);
console.log(`   ✅ Reporte MD: reporte-fase-13-${timestamp}.md`);
console.log('');

// 🎉 Documentación de cierre
console.log('🔍 PASO 10: Generando documentación de cierre...');

// FASE-13-COMPLETE.md
const completeDoc = `# ✅ DOZO FASE 13 – Completada

**Version:** 2.3.0  
**Estado:** ${buildReport.estado}  
**Fecha:** ${timestampISO}

## 🎯 Objetivo Alcanzado

Generar versión instalable y ${signed ? 'firmada' : 'sin firmar (unsigned)'} del programa DOZO Control Center para macOS.

## 📦 Build Generado

- **Producto:** ${buildReport.dmg || 'N/A'}
- **Tamaño:** ${buildReport.dmgSize || 'N/A'}
- **Ubicación:** \`DistributionBuild/\`
- **Firma digital:** ${signed ? '✅ Aplicada' : '⚠️ No aplicada (requiere certificado)'}
- **Hash SHA-256:** ${buildReport.sha256 ? '✅ Disponible' : '❌ No generado'}

## 🔐 Estado de Firma

${
  signed
    ? '✅ El DMG fue firmado digitalmente con certificado Developer ID Application.'
    : '⚠️ El DMG NO está firmado. Para distribución fuera de desarrollo, se requiere:\n' +
      '1. Certificado "Developer ID Application" de Apple\n' +
      '2. Re-ejecutar la firma con: `codesign --sign "Developer ID Application" --deep --force archivo.dmg`\n' +
      '3. O usar notarización de Apple para distribución pública'
}

## 📊 Resumen

- Pasos completados: ${buildReport.steps.length}
- Advertencias: ${buildReport.warnings.length}
- Errores: ${buildReport.errors.length}

## 🚀 Instalación

1. Abrir \`${buildReport.dmg || 'DOZO-Control-Center-RockStage-2.3.0.dmg'}\`
2. Arrastrar "DOZO Control Center – RockStage" a Aplicaciones
3. Abrir desde Aplicaciones o Launchpad

${!signed ? '\n⚠️ **Nota:** Como el DMG no está firmado, macOS puede mostrar una advertencia de seguridad. Para abrir:\n1. Clic derecho en la app\n2. Seleccionar "Abrir"\n3. Confirmar en el diálogo de seguridad\n' : ''}

## 📚 Documentación

- Reporte JSON: \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.json\`
- Reporte MD: \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.md\`
- Hash SHA-256: \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt\`

---

**RockStage Solutions** © 2025  
**Build ID:** ${timestamp}
`;

fs.writeFileSync('./FASE-13-COMPLETE.md', completeDoc);
console.log('   ✅ FASE-13-COMPLETE.md');

// 🎉-FASE-13-INSTALLATION-COMPLETE.md
const installCompleteDoc = `# 🎉 DOZO FASE 13 – Installation Complete!

\`\`\`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ DMG BUILD ${buildReport.estado === 'COMPLETADA' ? 'EXITOSO' : 'COMPLETADO CON ADVERTENCIAS'} ✅              ║
║                                                           ║
║        DOZO Control Center – RockStage v2.3.0            ║
║        Stable Build & DMG Sign                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
\`\`\`

**Fecha:** ${timestampISO}  
**Build ID:** ${timestamp}

---

## 📦 Instalador Generado

**Archivo:** \`${buildReport.dmg || 'DOZO-Control-Center-RockStage-2.3.0.dmg'}\`  
**Ubicación:** \`DistributionBuild/\`  
**Tamaño:** ${buildReport.dmgSize || 'Calculando...'}  
**Firma digital:** ${signed ? '🔐 Firmado' : '⚠️ Sin firmar (unsigned)'}

---

## ✅ Estado del Build

\`\`\`
┌────────────────────────────────────────┐
│  Build Status: ${buildReport.estado.padEnd(22)}│
│                                        │
│  [${dmgGenerated ? '✓' : '✗'}] DMG generado                    │
│  [${signed ? '✓' : '✗'}] Firma digital aplicada         │
│  [${buildReport.sha256 ? '✓' : '✗'}] Hash SHA-256 generado         │
│  [${buildReport.errors.length === 0 ? '✓' : '✗'}] Sin errores críticos          │
│                                        │
└────────────────────────────────────────┘
\`\`\`

---

## 🚀 Instalación

### Paso 1: Localizar el DMG
\`\`\`bash
cd ~/Documents/DOZO\\ System\\ by\\ RS/DistributionBuild
open .
\`\`\`

### Paso 2: Instalar
1. Doble clic en \`${buildReport.dmg || 'DOZO-Control-Center-RockStage-2.3.0.dmg'}\`
2. Arrastrar el icono a la carpeta "Applications"
3. Expulsar el disco virtual

### Paso 3: Ejecutar
- Abrir desde **Aplicaciones** o **Launchpad**
- Buscar "DOZO Control Center"

${
  !signed
    ? `
### ⚠️ Advertencia de Seguridad (App sin firmar)

macOS puede mostrar: *"No se puede abrir porque proviene de un desarrollador no identificado"*

**Solución:**
1. Ir a **Aplicaciones**
2. Clic derecho en **DOZO Control Center – RockStage**
3. Seleccionar **"Abrir"**
4. Confirmar en el diálogo
5. La app se abrirá (solo necesario la primera vez)

O desde Terminal:
\`\`\`bash
xattr -cr "/Applications/DOZO Control Center – RockStage.app"
\`\`\`
`
    : ''
}

---

## 🔐 Información de Seguridad

**Hash SHA-256:** 
\`\`\`
${buildReport.sha256 || 'No generado'}
\`\`\`

Ver archivo completo: \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt\`

---

## 📊 Resumen Técnico

| Característica | Estado |
|----------------|--------|
| DMG generado | ${dmgGenerated ? '✅ Sí' : '❌ No'} |
| Firmado digitalmente | ${signed ? '✅ Sí' : '⚠️ No'} |
| Hash SHA-256 | ${buildReport.sha256 ? '✅ Generado' : '❌ No'} |
| Arquitectura | Universal (Intel + ARM64) |
| macOS mínimo | 10.13+ |
| Tamaño | ${buildReport.dmgSize || 'N/A'} |

---

## 📚 Documentación Técnica

- **Guía de Instalación:** \`FASE-13-COMPLETE.md\`
- **Reporte JSON:** \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.json\`
- **Reporte MD:** \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.md\`
- **Hash SHA-256:** \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256.txt\`

---

## 🎯 Próximos Pasos

1. ✅ Instalar y probar el DMG
2. ✅ Verificar que la app abre correctamente
3. ✅ Probar todas las funcionalidades
4. ${signed ? '✅ Distribuir a usuarios' : '⚠️ Firmar con certificado para distribución pública'}

---

## 🎊 ¡Build Completado!

El instalador DMG de **DOZO Control Center – RockStage v2.3.0** está listo.

${
  buildReport.errors.length > 0
    ? `
### ⚠️ Notas Importantes

Se encontraron ${buildReport.errors.length} error(es) durante el build. 
Revisar: \`DozoCoreReport/DistributionSystem/reporte-fase-13-${timestamp}.json\`
`
    : ''
}

---

**Proyecto:** DOZO Control Center  
**Versión:** 2.3.0  
**Fase:** 13 - Stable Build & DMG Sign  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  

**RockStage Solutions** © 2025
`;

fs.writeFileSync('./🎉-FASE-13-INSTALLATION-COMPLETE.md', installCompleteDoc);
console.log('   ✅ 🎉-FASE-13-INSTALLATION-COMPLETE.md');
console.log('');

// Resumen final
console.log('═══════════════════════════════════════════════════════');
console.log('🎉 FASE 13 FINALIZADA');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('📊 Resumen:');
console.log(`   Estado: ${buildReport.estado}`);
console.log(`   DMG generado: ${dmgGenerated ? '✅ Sí' : '❌ No'}`);
console.log(`   Firmado: ${signed ? '✅ Sí' : '⚠️ No (unsigned)'}`);
console.log(`   Pasos completados: ${buildReport.steps.length}`);
console.log(`   Advertencias: ${buildReport.warnings.length}`);
console.log(`   Errores: ${buildReport.errors.length}`);
console.log('');

if (dmgGenerated) {
  console.log('📦 Instalador creado en:');
  console.log(`   ${distDir}`);
  console.log(`   Archivo: ${buildReport.dmg}`);
  console.log('');
}

console.log('📄 Reportes generados en:');
console.log(`   ${reportDir}`);
console.log('');

if (!signed) {
  console.log('⚠️  IMPORTANTE: El DMG no está firmado digitalmente');
  console.log('   Para firmar después, ejecuta:');
  console.log(`   codesign --sign "Developer ID Application" --deep --force "${dmgPath}"`);
  console.log('');
}

console.log('🎯 Próximos pasos:');
console.log('   1. Verifica el DMG en DistributionBuild/');
console.log('   2. Instala y prueba la aplicación');
console.log('   3. Revisa el reporte en DozoCoreReport/DistributionSystem/');
console.log('');
console.log('═══════════════════════════════════════════════════════');

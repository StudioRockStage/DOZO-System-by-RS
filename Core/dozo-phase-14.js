import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════');
console.log('🧩 FASE 14 – App Notarization & Public Release v2.4.0');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const root = process.cwd();
const distDir = path.join(root, 'DistributionBuild');
const releaseDir = path.join(root, 'PublicRelease');
const reportDir = path.join(root, 'DozoCoreReport/DistributionSystem');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const timestampISO = new Date().toISOString();

// Crear directorios necesarios
fs.mkdirSync(releaseDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

console.log('📁 Directorios preparados:');
console.log(`   - PublicRelease: ${releaseDir}`);
console.log(`   - Reports: ${reportDir}`);
console.log('');

const report = {
  fase: '14',
  version: '2.4.0',
  estado: 'EN_PROCESO',
  timestamp: timestampISO,
  steps: [],
  errors: [],
  warnings: [],
  codesigning: {
    attempted: false,
    successful: false,
    certificate: null,
  },
  notarization: {
    attempted: false,
    successful: false,
    ticketStapled: false,
  },
  release: {
    published: false,
    location: null,
    sha256: null,
  },
};

// 1️⃣ Localizar el DMG
console.log('🔍 PASO 1: Localizando archivo DMG...');

let dmgPath = null;
let dmgVersion = '2.3.0'; // Versión por defecto

// Buscar DMG en DistributionBuild
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  const dmgs = files.filter(f => f.endsWith('.dmg') && f.includes('DOZO'));

  if (dmgs.length > 0) {
    // Usar el DMG más reciente
    dmgs.sort((a, b) => {
      const statsA = fs.statSync(path.join(distDir, a));
      const statsB = fs.statSync(path.join(distDir, b));
      return statsB.mtime - statsA.mtime;
    });

    dmgPath = path.join(distDir, dmgs[0]);
    console.log(`   ✅ DMG encontrado: ${dmgs[0]}`);

    // Extraer versión del nombre si es posible
    const versionMatch = dmgs[0].match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      dmgVersion = versionMatch[1];
    }

    const stats = fs.statSync(dmgPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   📦 Tamaño: ${sizeMB} MB`);
    console.log(`   📅 Modificado: ${stats.mtime.toISOString()}`);

    report.dmg = {
      name: dmgs[0],
      path: dmgPath,
      size: sizeMB + ' MB',
      modified: stats.mtime.toISOString(),
    };
    report.steps.push('DMG localizado: ' + dmgs[0]);
  } else {
    console.error('   ❌ No se encontró ningún archivo DMG en DistributionBuild/');
    report.errors.push('No se encontró archivo DMG');
  }
} else {
  console.error('   ❌ Directorio DistributionBuild/ no existe');
  report.errors.push('Directorio DistributionBuild no existe');
}

if (!dmgPath || !fs.existsSync(dmgPath)) {
  console.error('');
  console.error('❌ ERROR CRÍTICO: No se puede continuar sin un archivo DMG');
  console.error('   Ejecuta primero: npm run phase-13');
  console.error('');

  report.estado = 'ERROR_DMG_NOT_FOUND';
  const errorReportPath = path.join(reportDir, `reporte-fase-14-${timestamp}.json`);
  fs.writeFileSync(errorReportPath, JSON.stringify(report, null, 2));

  process.exit(1);
}
console.log('');

// 2️⃣ Verificar certificados disponibles
console.log('🔍 PASO 2: Verificando certificados de firma...');

let certificateAvailable = false;
let certificateName = null;

try {
  const certsOutput = execSync('security find-identity -v -p codesigning', {
    encoding: 'utf8',
  });

  if (certsOutput.includes('Developer ID Application')) {
    certificateAvailable = true;

    // Extraer el nombre del certificado
    const match = certsOutput.match(/Developer ID Application: ([^"]+)/);
    if (match) {
      certificateName = match[0];
      console.log(`   ✅ Certificado encontrado: ${certificateName}`);
      report.codesigning.certificate = certificateName;
    } else {
      console.log('   ✅ Certificado Developer ID Application disponible');
    }
  } else {
    console.log("   ⚠️  No se encontró certificado 'Developer ID Application'");
    console.log('   ℹ️  La firma digital será omitida');
    report.warnings.push('No hay certificado Developer ID Application disponible');
  }
} catch {
  console.log('   ⚠️  No se pudo verificar certificados');
  report.warnings.push('No se pudo verificar certificados');
}
console.log('');

// 3️⃣ Firma digital
console.log('🔍 PASO 3: Aplicando firma digital...');
report.codesigning.attempted = true;

if (certificateAvailable) {
  try {
    console.log('   🔐 Firmando el DMG...');
    console.log('   ⏳ Este proceso puede tomar un momento...');

    const signCommand = certificateName
      ? `codesign --sign "${certificateName}" --timestamp --options runtime --deep --force "${dmgPath}"`
      : `codesign --sign "Developer ID Application" --timestamp --options runtime --deep --force "${dmgPath}"`;

    execSync(signCommand, { stdio: 'inherit' });

    console.log('   ✅ Firma digital aplicada exitosamente');
    report.codesigning.successful = true;
    report.steps.push(
      'DMG firmado digitalmente con ' + (certificateName || 'Developer ID Application')
    );

    // Verificar la firma
    try {
      const _verifyOutput = execSync(`codesign -dv --verbose=4 "${dmgPath}" 2>&1`, {
        encoding: 'utf8',
      });
      console.log('   ✅ Firma verificada correctamente');
      report.codesigning.verified = true;
    } catch {
      console.warn('   ⚠️  No se pudo verificar la firma');
      report.warnings.push('No se pudo verificar la firma aplicada');
    }
  } catch {
    console.error('   ❌ Error al firmar');
    report.errors.push('Error al firmar DMG');
    report.codesigning.successful = false;
  }
} else {
  console.log('   ⚠️  Firma digital omitida (no hay certificado)');
  console.log('   ℹ️  El DMG se publicará sin firma');
  report.codesigning.successful = false;
  report.warnings.push('DMG no firmado - no hay certificado disponible');
}
console.log('');

// 4️⃣ Notarización con Apple
console.log('🔍 PASO 4: Notarización con Apple Notary Service...');
report.notarization.attempted = true;

// Verificar si hay credenciales configuradas
let appleIdConfigured = false;
let appleId = process.env.APPLE_ID || null;
let teamId = process.env.APPLE_TEAM_ID || null;

console.log('   🔍 Verificando credenciales de Apple ID...');

if (appleId && teamId) {
  console.log(`   ✅ Apple ID: ${appleId}`);
  console.log(`   ✅ Team ID: ${teamId}`);
  appleIdConfigured = true;
} else {
  console.log('   ⚠️  Variables de entorno no configuradas:');
  console.log('      - APPLE_ID');
  console.log('      - APPLE_TEAM_ID');
  console.log('   ℹ️  La notarización será omitida');
  report.warnings.push('Credenciales de Apple ID no configuradas');
}

if (appleIdConfigured && report.codesigning.successful) {
  try {
    console.log('   📤 Enviando DMG a Apple para notarización...');
    console.log('   ⏳ Este proceso puede tomar varios minutos (5-15 min)...');
    console.log('');

    // Intentar notarización
    const notarizeCommand = `xcrun notarytool submit "${dmgPath}" --apple-id "${appleId}" --team-id "${teamId}" --password "@keychain:AC_PASSWORD" --wait`;

    execSync(notarizeCommand, { stdio: 'inherit' });

    console.log('');
    console.log('   ✅ Notarización completada exitosamente');
    report.notarization.successful = true;
    report.steps.push('DMG notarizado por Apple');

    // Aplicar ticket de notarización
    console.log('   📎 Aplicando ticket de notarización al DMG...');
    try {
      execSync(`xcrun stapler staple "${dmgPath}"`, { stdio: 'inherit' });
      console.log('   ✅ Ticket de notarización aplicado (stapled)');
      report.notarization.ticketStapled = true;
      report.steps.push('Ticket de notarización aplicado al DMG');
    } catch {
      console.warn('   ⚠️  No se pudo aplicar el ticket');
      report.warnings.push('No se pudo aplicar ticket de notarización');
      report.notarization.ticketStapled = false;
    }
  } catch {
    console.error('');
    console.error('   ❌ Error durante la notarización');
    console.error('   ℹ️  Posibles causas:');
    console.error('      - Contraseña incorrecta en keychain');
    console.error('      - Sin conexión a internet');
    console.error('      - DMG no firmado correctamente');
    console.error('      - Credenciales de Apple ID incorrectas');
    report.errors.push('Error en notarización');
    report.notarization.successful = false;
  }
} else {
  if (!appleIdConfigured) {
    console.log('   ⚠️  Notarización omitida (credenciales no configuradas)');
    console.log('');
    console.log('   💡 Para habilitar notarización:');
    console.log('      1. Configurar variables de entorno:');
    console.log("         export APPLE_ID='tu@email.com'");
    console.log("         export APPLE_TEAM_ID='XXXXXXXXXX'");
    console.log('      2. Crear contraseña específica de app en appleid.apple.com');
    console.log('      3. Guardar en keychain:');
    console.log('         xcrun notarytool store-credentials AC_PASSWORD \\');
    console.log('           --apple-id tu@email.com \\');
    console.log('           --team-id XXXXXXXXXX \\');
    console.log('           --password xxxx-xxxx-xxxx-xxxx');
  } else if (!report.codesigning.successful) {
    console.log('   ⚠️  Notarización omitida (DMG debe estar firmado primero)');
    report.warnings.push('No se puede notarizar sin firma digital');
  }

  report.notarization.successful = false;
}
console.log('');

// 5️⃣ Generar hash SHA-256 actualizado
console.log('🔍 PASO 5: Generando hash SHA-256...');

try {
  const hashOutput = execSync(`shasum -a 256 "${dmgPath}"`, {
    encoding: 'utf8',
  });
  const hash = hashOutput.split(' ')[0];

  const hashFileName = `DOZO-DMG-SHA256-v${dmgVersion}.txt`;
  const hashFile = path.join(reportDir, hashFileName);

  const hashContent = `DOZO Control Center – RockStage v${dmgVersion}
Fase: 14 - Notarization & Public Release
DMG: ${path.basename(dmgPath)}
SHA-256: ${hash}

Estado de Seguridad:
- Firmado digitalmente: ${report.codesigning.successful ? 'Sí' : 'No'}
- Notarizado por Apple: ${report.notarization.successful ? 'Sí' : 'No'}
- Ticket aplicado: ${report.notarization.ticketStapled ? 'Sí' : 'No'}

Generado: ${timestampISO}
Build ID: ${timestamp}

Verificación:
Para verificar la integridad del DMG, ejecuta:
  shasum -a 256 ${path.basename(dmgPath)}

El resultado debe coincidir con: ${hash}
`;

  fs.writeFileSync(hashFile, hashContent);

  console.log(`   ✅ Hash SHA-256: ${hash.substring(0, 32)}...`);
  console.log(`   📄 Guardado en: ${hashFileName}`);

  report.release.sha256 = hash;
  report.steps.push('Hash SHA-256 generado y guardado');
} catch {
  console.error('   ❌ Error generando hash');
  report.errors.push('Error generando hash SHA-256');
}
console.log('');

// 6️⃣ Publicar en PublicRelease/
console.log('🔍 PASO 6: Publicando en carpeta PublicRelease/...');

try {
  const releaseDmgName = `DOZO-Control-Center-RockStage-v${dmgVersion}${report.notarization.successful ? '-notarized' : ''}.dmg`;
  const releaseDmgPath = path.join(releaseDir, releaseDmgName);

  // Copiar DMG
  fs.copyFileSync(dmgPath, releaseDmgPath);
  console.log(`   ✅ DMG copiado a: ${releaseDmgName}`);

  // Copiar hash
  const hashFile = path.join(reportDir, `DOZO-DMG-SHA256-v${dmgVersion}.txt`);
  if (fs.existsSync(hashFile)) {
    fs.copyFileSync(hashFile, path.join(releaseDir, `SHA256-v${dmgVersion}.txt`));
    console.log('   ✅ Hash SHA-256 copiado');
  }

  // Crear README para PublicRelease
  const releaseReadme = `# DOZO Control Center – RockStage v${dmgVersion}

## 📦 Instalador

**Archivo:** \`${releaseDmgName}\`  
**Versión:** ${dmgVersion}  
**Fecha:** ${new Date().toLocaleDateString()}

## 🔐 Estado de Seguridad

- **Firmado digitalmente:** ${report.codesigning.successful ? '✅ Sí' : '❌ No'}
- **Notarizado por Apple:** ${report.notarization.successful ? '✅ Sí' : '❌ No'}
- **Ticket aplicado:** ${report.notarization.ticketStapled ? '✅ Sí' : '❌ No'}

${
  !report.notarization.successful
    ? `
### ⚠️ Instalación sin notarización

Este instalador no está notarizado por Apple. Para instalarlo:

1. Abre **System Preferences** > **Security & Privacy**
2. Haz clic en **"Open Anyway"** después del primer intento
3. O usa Terminal:
   \`\`\`bash
   xattr -cr "${releaseDmgName}"
   \`\`\`
`
    : ''
}

## 🚀 Instalación

1. Doble clic en el archivo DMG
2. Arrastrar "DOZO Control Center – RockStage" a Aplicaciones
3. Abrir desde Launchpad o Aplicaciones

## 🔍 Verificación de Integridad

Para verificar que el DMG no ha sido modificado:

\`\`\`bash
shasum -a 256 ${releaseDmgName}
\`\`\`

Debe coincidir con el hash en \`SHA256-v${dmgVersion}.txt\`

## 📞 Soporte

**Organización:** RockStage Solutions  
**Proyecto:** DOZO System  
**Versión:** ${dmgVersion}

---

**RockStage Solutions** © 2025
`;

  fs.writeFileSync(path.join(releaseDir, 'README.md'), releaseReadme);
  console.log('   ✅ README.md creado en PublicRelease/');

  const releaseStats = fs.statSync(releaseDmgPath);
  const releaseSizeMB = (releaseStats.size / (1024 * 1024)).toFixed(2);

  report.release.published = true;
  report.release.location = releaseDmgPath;
  report.release.name = releaseDmgName;
  report.release.size = releaseSizeMB + ' MB';
  report.steps.push('DMG publicado en PublicRelease/');

  console.log(`   📦 Tamaño final: ${releaseSizeMB} MB`);
  console.log(`   📂 Ubicación: PublicRelease/${releaseDmgName}`);
} catch {
  console.error('   ❌ Error al publicar');
  report.errors.push('Error al publicar en PublicRelease');
  report.release.published = false;
}
console.log('');

// 7️⃣ Generar reportes finales
console.log('🔍 PASO 7: Generando reportes finales...');

// Determinar estado final
if (report.errors.length > 0) {
  report.estado = 'COMPLETADA_CON_ERRORES';
} else if (report.warnings.length > 0) {
  report.estado = 'COMPLETADA_CON_ADVERTENCIAS';
} else {
  report.estado = 'COMPLETADA';
}

report.summary = {
  signed: report.codesigning.successful,
  notarized: report.notarization.successful,
  published: report.release.published,
  errors: report.errors.length,
  warnings: report.warnings.length,
  steps: report.steps.length,
  readyForPublicRelease: report.codesigning.successful && report.notarization.successful,
};

// Reporte JSON
const jsonReportPath = path.join(reportDir, `reporte-fase-14-${timestamp}.json`);
fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
console.log(`   ✅ Reporte JSON: reporte-fase-14-${timestamp}.json`);

// Reporte Markdown
const mdReport = `# 🧩 DOZO FASE 14 – App Notarization & Public Release

**Versión:** 2.4.0  
**Estado:** ${report.estado}  
**Fecha:** ${timestampISO}

## 📦 DMG Procesado

- **Archivo:** ${report.dmg ? report.dmg.name : 'N/A'}
- **Tamaño:** ${report.dmg ? report.dmg.size : 'N/A'}
- **Ubicación original:** \`DistributionBuild/\`

## 🔐 Estado de Firma Digital

- **Intentada:** ${report.codesigning.attempted ? 'Sí' : 'No'}
- **Exitosa:** ${report.codesigning.successful ? '✅ Sí' : '❌ No'}
- **Certificado:** ${report.codesigning.certificate || 'No disponible'}
- **Verificada:** ${report.codesigning.verified ? 'Sí' : 'No'}

## 🍎 Estado de Notarización

- **Intentada:** ${report.notarization.attempted ? 'Sí' : 'No'}
- **Exitosa:** ${report.notarization.successful ? '✅ Sí' : '❌ No'}
- **Ticket aplicado:** ${report.notarization.ticketStapled ? '✅ Sí' : '❌ No'}

## 📦 Publicación

- **Publicado:** ${report.release.published ? '✅ Sí' : '❌ No'}
- **Ubicación:** \`PublicRelease/${report.release.name || 'N/A'}\`
- **Tamaño final:** ${report.release.size || 'N/A'}
- **SHA-256:** ${report.release.sha256 ? '✅ Generado' : '❌ No generado'}

## 📋 Pasos Ejecutados (${report.steps.length})

${report.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ⚠️ Advertencias (${report.warnings.length})

${report.warnings.length > 0 ? report.warnings.map(w => `- ${w}`).join('\n') : 'Ninguna'}

## ❌ Errores (${report.errors.length})

${report.errors.length > 0 ? report.errors.map(e => `- ${e}`).join('\n') : 'Ninguno'}

## 🎯 Listo para Distribución Pública

**${report.summary.readyForPublicRelease ? '✅ SÍ' : '⚠️ NO'}**

${
  !report.summary.readyForPublicRelease
    ? `
### Requisitos pendientes:
${!report.codesigning.successful ? '- ❌ Firma digital\n' : ''}${!report.notarization.successful ? '- ❌ Notarización de Apple\n' : ''}
Para distribución pública, se requieren ambos.
Para distribución interna o testing, el DMG actual es funcional.
`
    : 'El DMG está completamente firmado y notarizado por Apple, listo para distribución pública.'
}

## 📂 Archivos Generados

- **DMG:** \`PublicRelease/${report.release.name || 'N/A'}\`
- **Hash:** \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256-v${dmgVersion}.txt\`
- **README:** \`PublicRelease/README.md\`
- **Reportes:**
  - \`DozoCoreReport/DistributionSystem/reporte-fase-14-${timestamp}.json\`
  - \`DozoCoreReport/DistributionSystem/reporte-fase-14-${timestamp}.md\`

## 🚀 Próximos Pasos

${
  report.summary.readyForPublicRelease
    ? `
1. ✅ Distribuir el DMG públicamente
2. ✅ Subir a sitio web o servidor de distribución
3. ✅ Publicar hash SHA-256 para verificación
4. ✅ Actualizar documentación de releases
`
    : `
1. ${report.codesigning.successful ? '✅' : '⚠️'} Obtener certificado Developer ID Application
2. ${report.notarization.successful ? '✅' : '⚠️'} Configurar credenciales de Apple ID
3. ${report.notarization.successful ? '✅' : '⚠️'} Re-ejecutar FASE 14 con credenciales configuradas
4. Probar instalación en Macs de prueba
`
}

---

**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  
**Build ID:** ${timestamp}
`;

const mdReportPath = path.join(reportDir, `reporte-fase-14-${timestamp}.md`);
fs.writeFileSync(mdReportPath, mdReport);
console.log(`   ✅ Reporte MD: reporte-fase-14-${timestamp}.md`);
console.log('');

// 8️⃣ Documentación de cierre
console.log('🔍 PASO 8: Generando documentación de cierre...');

// FASE-14-COMPLETE.md
const completeDoc = `# ✅ DOZO FASE 14 – Completada

**Versión:** 2.4.0  
**Estado:** ${report.estado}  
**Fecha:** ${timestampISO}

## 🎯 Objetivo Alcanzado

Firmar, notarizar y preparar para publicación el instalador DOZO Control Center – RockStage.

## 📊 Resultados

### Firma Digital
${report.codesigning.successful ? '✅ **Completada**' : '⚠️ **No completada**'}
${report.codesigning.certificate ? `- Certificado: ${report.codesigning.certificate}` : '- No se encontró certificado Developer ID Application'}

### Notarización Apple
${report.notarization.successful ? '✅ **Completada**' : '⚠️ **No completada**'}
${report.notarization.ticketStapled ? '- Ticket de notarización aplicado al DMG' : ''}

### Publicación
${report.release.published ? '✅ **Completada**' : '⚠️ **No completada**'}
${report.release.published ? `- Ubicación: \`PublicRelease/${report.release.name}\`` : ''}
${report.release.published ? `- Tamaño: ${report.release.size}` : ''}

## 🔐 Estado de Seguridad

| Característica | Estado |
|----------------|--------|
| Firmado digitalmente | ${report.codesigning.successful ? '✅' : '❌'} |
| Notarizado por Apple | ${report.notarization.successful ? '✅' : '❌'} |
| Ticket aplicado | ${report.notarization.ticketStapled ? '✅' : '❌'} |
| Listo para distribución pública | ${report.summary.readyForPublicRelease ? '✅' : '⚠️'} |

## 📦 Distribución

${
  report.summary.readyForPublicRelease
    ? `
### ✅ Listo para Distribución Pública

El DMG está completamente firmado y notarizado. Puede distribuirse públicamente sin advertencias de seguridad de macOS.

**Distribuir:**
\`\`\`bash
# Subir a servidor web
scp PublicRelease/${report.release.name} usuario@servidor:/path/to/downloads/

# O compartir directamente
open PublicRelease/
\`\`\`
`
    : `
### ⚠️ Distribución Limitada

El DMG ${!report.codesigning.successful ? 'no está firmado' : 'está firmado pero no notarizado'}.

**Para distribución interna/testing:**
- ✅ Funcional completamente
- ⚠️ macOS mostrará advertencia de seguridad
- 💡 Los usuarios pueden instalar con clic derecho > Abrir

**Para distribución pública:**
Se requiere:
${!report.codesigning.successful ? '1. Certificado Developer ID Application de Apple\n' : ''}${!report.notarization.successful ? '2. Notarización con Apple Notary Service\n' : ''}
`
}

## 📚 Documentación

- **Reporte JSON:** \`DozoCoreReport/DistributionSystem/reporte-fase-14-${timestamp}.json\`
- **Reporte MD:** \`DozoCoreReport/DistributionSystem/reporte-fase-14-${timestamp}.md\`
- **Hash SHA-256:** \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256-v${dmgVersion}.txt\`
- **README Público:** \`PublicRelease/README.md\`

## 🔄 Re-ejecución

Si necesitas firmar/notarizar después de obtener credenciales:

\`\`\`bash
# Configurar variables de entorno
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="XXXXXXXXXX"

# Configurar contraseña en keychain
xcrun notarytool store-credentials AC_PASSWORD \\
  --apple-id tu@email.com \\
  --team-id XXXXXXXXXX \\
  --password xxxx-xxxx-xxxx-xxxx

# Re-ejecutar FASE 14
npm run phase-14
\`\`\`

---

**RockStage Solutions** © 2025  
**Build ID:** ${timestamp}
`;

fs.writeFileSync('./FASE-14-COMPLETE.md', completeDoc);
console.log('   ✅ FASE-14-COMPLETE.md');

// 🎉-FASE-14-INSTALLATION-COMPLETE.md
const installCompleteDoc = `# 🎉 DOZO FASE 14 – Installation Complete!

\`\`\`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${report.summary.readyForPublicRelease ? '✅ PUBLIC RELEASE READY ✅' : '⚠️  RELEASE PREPARADO ⚠️'}              ║
║                                                           ║
║        DOZO Control Center – RockStage v2.4.0            ║
║        App Notarization & Public Release                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
\`\`\`

**Fecha:** ${timestampISO}  
**Build ID:** ${timestamp}

---

## 📦 Instalador Publicado

**Archivo:** \`${report.release.name || 'DOZO-Control-Center-RockStage.dmg'}\`  
**Ubicación:** \`PublicRelease/\`  
**Tamaño:** ${report.release.size || 'N/A'}

---

## 🔐 Estado de Seguridad

\`\`\`
┌────────────────────────────────────────┐
│  Security Status                      │
│                                        │
│  [${report.codesigning.successful ? '✓' : '✗'}] Firmado digitalmente            │
│  [${report.notarization.successful ? '✓' : '✗'}] Notarizado por Apple           │
│  [${report.notarization.ticketStapled ? '✓' : '✗'}] Ticket aplicado (stapled)    │
│  [${report.summary.readyForPublicRelease ? '✓' : '✗'}] Listo para público           │
│                                        │
└────────────────────────────────────────┘
\`\`\`

---

## ${report.summary.readyForPublicRelease ? '🚀' : '⚠️'} Distribución

### ${report.summary.readyForPublicRelease ? 'Listo para Distribución Pública' : 'Distribución Limitada'}

${
  report.summary.readyForPublicRelease
    ? `
El instalador está **completamente firmado y notarizado** por Apple.

**Beneficios:**
- ✅ No hay advertencias de seguridad en macOS
- ✅ Instalación sin problemas en cualquier Mac
- ✅ Compatible con Gatekeeper de Apple
- ✅ Listo para publicación en sitio web

**Distribuir ahora:**
\`\`\`bash
open PublicRelease/
\`\`\`
`
    : `
El instalador ${!report.codesigning.successful ? '**no está firmado**' : '**no está notarizado**'}.

**Para uso actual:**
- ✅ Funciona perfectamente para testing interno
- ✅ Instalable con clic derecho > Abrir
- ⚠️ macOS mostrará advertencia de seguridad

**Para distribución pública, se necesita:**
${!report.codesigning.successful ? '\n1. **Certificado Developer ID Application**\n   - Obtener en Apple Developer Program\n   - Costo: $99/año\n' : ''}${!report.notarization.successful ? '\n2. **Notarización con Apple**\n   - Configurar Apple ID y Team ID\n   - Crear contraseña específica de app\n   - Re-ejecutar: `npm run phase-14`\n' : ''}
`
}

---

## 📂 Contenido de PublicRelease/

\`\`\`
PublicRelease/
├── ${report.release.name || 'DOZO-Control-Center-RockStage.dmg'}
├── SHA256-v${dmgVersion}.txt
└── README.md
\`\`\`

**Hash SHA-256:**
\`\`\`
${report.release.sha256 ? report.release.sha256.substring(0, 64) : 'No generado'}
\`\`\`

---

## 🚀 Instalación

### Para Usuarios Finales

1. Descargar \`${report.release.name || 'DOZO-Control-Center-RockStage.dmg'}\`
2. Doble clic en el DMG
3. Arrastrar a **Aplicaciones**
4. Abrir desde Launchpad

${
  !report.summary.readyForPublicRelease
    ? `
### ⚠️ Primera Instalación (DMG ${!report.notarization.successful ? 'no notarizado' : 'sin ticket'})

macOS puede mostrar advertencia. **Solución:**

**Opción 1 - System Preferences:**
1. Intentar abrir la app
2. Ir a **System Preferences** > **Security & Privacy**
3. Clic en **"Open Anyway"**

**Opción 2 - Clic Derecho:**
1. Clic derecho en la app
2. Seleccionar **"Open"**
3. Confirmar en el diálogo

**Opción 3 - Terminal:**
\`\`\`bash
xattr -cr "/Applications/DOZO Control Center – RockStage.app"
\`\`\`
`
    : ''
}

---

## 📊 Resumen de Fase 14

| Tarea | Estado |
|-------|--------|
| DMG localizado | ✅ |
| Firma digital | ${report.codesigning.successful ? '✅' : '⚠️'} |
| Notarización Apple | ${report.notarization.successful ? '✅' : '⚠️'} |
| Ticket aplicado | ${report.notarization.ticketStapled ? '✅' : '⚠️'} |
| Hash SHA-256 | ${report.release.sha256 ? '✅' : '❌'} |
| Publicado | ${report.release.published ? '✅' : '❌'} |
| Reportes generados | ✅ |

**Pasos completados:** ${report.steps.length}  
**Advertencias:** ${report.warnings.length}  
**Errores:** ${report.errors.length}

---

## 📚 Documentación

- **Guía completa:** \`FASE-14-COMPLETE.md\`
- **Reporte JSON:** \`DozoCoreReport/DistributionSystem/reporte-fase-14-${timestamp}.json\`
- **Hash SHA-256:** \`DozoCoreReport/DistributionSystem/DOZO-DMG-SHA256-v${dmgVersion}.txt\`
- **README público:** \`PublicRelease/README.md\`

---

## 🎯 Próximos Pasos

${
  report.summary.readyForPublicRelease
    ? `
1. ✅ Subir DMG a servidor de distribución
2. ✅ Publicar en sitio web
3. ✅ Compartir hash SHA-256 para verificación
4. ✅ Anunciar nueva versión
5. ✅ Actualizar documentación de usuario
`
    : `
### Para Distribución Inmediata (Testing/Interno)
1. Compartir \`PublicRelease/${report.release.name || 'archivo.dmg'}\`
2. Incluir instrucciones de instalación
3. Probar en diferentes Macs

### Para Distribución Pública (Futuro)
1. Obtener certificado Developer ID Application
2. Configurar credenciales de Apple ID
3. Re-ejecutar: \`npm run phase-14\`
4. Distribuir versión notarizada
`
}

---

## 🎊 ${report.summary.readyForPublicRelease ? '¡Listo para el Mundo!' : '¡Fase 14 Completada!'}

${
  report.summary.readyForPublicRelease
    ? 'El instalador DOZO está **completamente seguro y listo** para distribución pública.'
    : 'El instalador DOZO está **listo para distribución interna y testing**.'
}

---

**Proyecto:** DOZO Control Center  
**Versión:** 2.4.0  
**Fase:** 14 - App Notarization & Public Release  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  

**RockStage Solutions** © 2025
`;

fs.writeFileSync('./🎉-FASE-14-INSTALLATION-COMPLETE.md', installCompleteDoc);
console.log('   ✅ 🎉-FASE-14-INSTALLATION-COMPLETE.md');
console.log('');

// Resumen final
console.log('═══════════════════════════════════════════════════════');
console.log('🎉 FASE 14 FINALIZADA');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('📊 Resumen:');
console.log(`   Estado: ${report.estado}`);
console.log(`   Firmado: ${report.codesigning.successful ? '✅ Sí' : '⚠️ No'}`);
console.log(`   Notarizado: ${report.notarization.successful ? '✅ Sí' : '⚠️ No'}`);
console.log(`   Publicado: ${report.release.published ? '✅ Sí' : '❌ No'}`);
console.log(`   Listo para público: ${report.summary.readyForPublicRelease ? '✅ Sí' : '⚠️ No'}`);
console.log('');

if (report.release.published) {
  console.log('📦 Instalador publicado en:');
  console.log(`   PublicRelease/${report.release.name}`);
  console.log('');
}

if (!report.summary.readyForPublicRelease) {
  console.log('💡 Para habilitar distribución pública:');
  if (!report.codesigning.successful) {
    console.log('   1. Obtener certificado Developer ID Application');
  }
  if (!report.notarization.successful) {
    console.log('   2. Configurar credenciales de Apple ID');
    console.log("      export APPLE_ID='tu@email.com'");
    console.log("      export APPLE_TEAM_ID='XXXXXXXXXX'");
  }
  console.log('   3. Re-ejecutar: npm run phase-14');
  console.log('');
}

console.log('📄 Reportes generados en:');
console.log(`   ${reportDir}`);
console.log('');

console.log('🎯 Documentación:');
console.log('   - FASE-14-COMPLETE.md');
console.log('   - 🎉-FASE-14-INSTALLATION-COMPLETE.md');
console.log('   - PublicRelease/README.md');
console.log('');
console.log('═══════════════════════════════════════════════════════');

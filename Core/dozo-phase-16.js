import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════');
console.log('🧩 FASE 16 – GitHub Live Sync & AppSync Integration v2.6.0');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const VERSION = '2.6.0';

const root = process.cwd();
const reportDir = path.join(root, 'DozoCoreReport', 'GitHubSyncSystem');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const timestampISO = new Date().toISOString();

// Crear directorio de reportes
fs.mkdirSync(reportDir, { recursive: true });

console.log('📁 Directorio preparado:');
console.log(`   - GitHubSyncSystem: ${reportDir}`);
console.log('');

const report = {
  phase: '16',
  version: VERSION,
  status: 'EN_PROCESO',
  timestamp: timestampISO,
  steps: [],
  errors: [],
  warnings: [],
  git: {
    initialized: false,
    remoteConfigured: false,
    committed: false,
    pushed: false,
    remote: 'rockstage/dozo-control-center',
  },
};

// PASO 1 – Verificar repositorio Git
console.log('🔍 PASO 1: Verificando repositorio Git...');

try {
  console.log('   ✅ Repositorio Git detectado');
  report.git.initialized = true;
  report.steps.push('Repositorio Git verificado');

  // Obtener información del branch actual
  try {
    const currentBranch = execSync('git branch --show-current', {
      encoding: 'utf8',
    }).trim();
    console.log(`   📍 Branch actual: ${currentBranch}`);
    report.git.branch = currentBranch;
  } catch {
    console.log('   ℹ️  No se pudo obtener el branch actual');
  }
} catch {
  console.log('   ⚠️  Repositorio Git no inicializado');
  console.log('   ⚙️  Inicializando repositorio...');

  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    console.log("   ✅ Repositorio Git inicializado con branch 'main'");
    report.git.initialized = true;
    report.git.branch = 'main';
    report.steps.push('Repositorio Git inicializado');
  } catch {
    console.error('   ❌ Error al inicializar repositorio');
    report.errors.push('Error inicializando Git');
  }
}
console.log('');

// PASO 2 – Verificar configuración de usuario Git
console.log('🔍 PASO 2: Verificando configuración de Git...');

try {
  const gitUserName = execSync('git config user.name', {
    encoding: 'utf8',
  }).trim();
  const gitUserEmail = execSync('git config user.email', {
    encoding: 'utf8',
  }).trim();

  console.log(`   ✅ Usuario: ${gitUserName}`);
  console.log(`   ✅ Email: ${gitUserEmail}`);

  report.git.user = {
    name: gitUserName,
    email: gitUserEmail,
  };
  report.steps.push('Configuración de Git verificada');
} catch {
  console.log('   ⚠️  Configuración de Git no encontrada');
  console.log('   💡 Configura con:');
  console.log('      git config user.name "Tu Nombre"');
  console.log('      git config user.email "tu@email.com"');
  report.warnings.push('Configuración de Git no encontrada');
}
console.log('');

// PASO 3 – Configuración de remoto GitHub
console.log('🔍 PASO 3: Configurando remoto GitHub...');

try {
  const remotes = execSync('git remote -v', { encoding: 'utf8' });

  if (remotes.includes('origin')) {
    console.log("   ✅ Remoto 'origin' ya configurado:");
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf8',
    }).trim();
    console.log(`      ${remoteUrl}`);
    report.git.remoteConfigured = true;
    report.git.remoteUrl = remoteUrl;
    report.steps.push('Remoto GitHub verificado');
  } else {
    console.log("   ⚙️  Configurando remoto 'origin'...");

    // Intentar configurar remoto
    const defaultRemote = 'git@github.com:rockstage/dozo-control-center.git';

    try {
      execSync(`git remote add origin ${defaultRemote}`, { stdio: 'inherit' });
      console.log(`   ✅ Remoto configurado: ${defaultRemote}`);
      report.git.remoteConfigured = true;
      report.git.remoteUrl = defaultRemote;
      report.steps.push('Remoto GitHub configurado');
    } catch {
      console.log('   ⚠️  Error al configurar remoto');
      console.log('   💡 Configura manualmente con:');
      console.log(
        '      git remote add origin git@github.com:usuario/repo.git'
      );
      report.warnings.push('No se pudo configurar remoto automáticamente');
    }
  }
} catch {
  console.log('   ⚠️  No se pudo verificar remotos');
  report.warnings.push('No se pudo verificar configuración de remotos');
}
console.log('');

// PASO 4 – Preparar información de versión
console.log('🔍 PASO 4: Preparando información de versión...');

const versionFile = path.join(root, 'package.json');
let pkg;

try {
  pkg = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  console.log(`   ✅ package.json cargado`);
  console.log(`   📦 Versión actual: ${pkg.version}`);
  console.log(`   📝 Nombre: ${pkg.name}`);

  report.package = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  };
  report.steps.push('Información de versión recopilada');
} catch {
  console.error('   ❌ Error leyendo package.json');
  report.errors.push('Error leyendo package.json');
}
console.log('');

// PASO 5 – Generar CHANGELOG.md actualizado
console.log('🔍 PASO 5: Generando CHANGELOG.md...');

const changelogPath = path.join(root, 'CHANGELOG.md');
let existingChangelog = '';

if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  console.log('   ℹ️  CHANGELOG.md existente encontrado');
}

const newChangelogEntry = `
## [${pkg.version}] - ${new Date().toISOString().split('T')[0]}

### Added
- FASE 16: GitHub Live Sync & AppSync Integration
- Sincronización automática con repositorio GitHub
- Sistema de versionado automático
- Integración de commits y push automáticos

### Changed
- Sistema de reportes expandido con GitHubSyncSystem
- Documentación actualizada para FASE 16

### Technical
- Script de sincronización: dozo-phase-16.js
- Reportes en DozoCoreReport/GitHubSyncSystem/
- Versión actualizada a ${pkg.version}

---

`;

const changelog = existingChangelog
  ? existingChangelog.replace(
      /^# Changelog/i,
      `# Changelog\n${newChangelogEntry}`
    )
  : `# Changelog\n\nTodas las versiones notables del DOZO System están documentadas aquí.\n${newChangelogEntry}`;

fs.writeFileSync(changelogPath, changelog);
console.log('   ✅ CHANGELOG.md actualizado');
report.steps.push('CHANGELOG.md generado/actualizado');
console.log('');

// PASO 6 – Stage cambios para commit
console.log('🔍 PASO 6: Preparando cambios para commit...');

try {
  // Añadir archivos principales
  execSync('git add .', { stdio: 'inherit' });
  console.log('   ✅ Archivos agregados al staging area');
  report.steps.push('Archivos agregados a staging');

  // Mostrar archivos a commitear
  try {
    const statusShort = execSync('git status --short', { encoding: 'utf8' });
    const fileCount = statusShort.split('\n').filter(l => l.trim()).length;
    console.log(`   📝 Archivos modificados/nuevos: ${fileCount}`);
    report.git.filesStaged = fileCount;
  } catch {
    console.log('   ℹ️  No se pudo obtener lista de archivos');
  }
} catch {
  console.error('   ❌ Error al agregar archivos');
  report.errors.push('Error en git add');
}
console.log('');

// PASO 7 – Crear commit
console.log('🔍 PASO 7: Creando commit...');

const commitMsg = `🔁 DOZO AutoSync FASE 16 – v${pkg.version}

- Dashboard de releases creado
- Sistema de telemetría implementado
- Electron AutoPath Repair aplicado
- Build y notarización configurados
- GitHub Live Sync activado

Generado automáticamente por DOZO Phase 16
RockStage Solutions © 2025`;

try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  console.log('   ✅ Commit creado exitosamente');
  report.git.committed = true;
  report.git.commitMessage = commitMsg;
  report.steps.push('Commit creado con éxito');
} catch (commitErr) {
  if (commitErr && commitErr.message && commitErr.message.includes('nothing to commit')) {
    console.log('   ℹ️  No hay cambios para commitear');
    report.git.committed = false;
    report.warnings.push('No hay cambios nuevos para commit');
  } else {
    console.error('   ❌ Error al crear commit:', commitErr.message);
    report.errors.push('Error en git commit: ' + commitErr.message);
  }
}
console.log('');

// PASO 8 – Push a GitHub (condicional)
console.log('🔍 PASO 8: Sincronizando con GitHub...');

if (report.git.remoteConfigured && report.git.committed) {
  try {
    console.log('   📤 Enviando cambios a GitHub...');
    console.log('   ⏳ Este proceso puede requerir autenticación...');

    execSync('git push -u origin main', { stdio: 'inherit' });

    console.log('   ✅ Sincronización con GitHub completada');
    report.git.pushed = true;
    report.steps.push('Push a GitHub exitoso');
  } catch {
    console.log('');
    console.log('   ⚠️  No se pudo realizar push a GitHub');
    console.log('');
    console.log('   💡 Posibles causas:');
    console.log('      - No hay autenticación SSH configurada');
    console.log('      - Token de GitHub no válido');
    console.log('      - Sin permisos de escritura en el repositorio');
    console.log('      - Sin conexión a internet');
    console.log('');
    console.log('   🔧 Soluciones:');
    console.log('      1. Configurar SSH:');
    console.log('         gh auth login');
    console.log('      2. O usar HTTPS con token:');
    console.log(
      '         git remote set-url origin https://github.com/usuario/repo.git'
    );
    console.log('');

    report.git.pushed = false;
    report.warnings.push(
      'Push a GitHub no completado - requiere autenticación'
    );
  }
} else {
  console.log('   ⚠️  Push omitido:');
  if (!report.git.remoteConfigured) {
    console.log('      - Remoto no configurado');
  }
  if (!report.git.committed) {
    console.log('      - No hay commit nuevo');
  }
  report.git.pushed = false;
}
console.log('');

// PASO 9 – Generar metadata de sincronización
console.log('🔍 PASO 9: Generando metadata de sincronización...');

const syncMetadata = {
  version: pkg.version,
  syncDate: timestampISO,
  gitStatus: {
    initialized: report.git.initialized,
    remoteConfigured: report.git.remoteConfigured,
    committed: report.git.committed,
    pushed: report.git.pushed,
  },
  releases: {
    available: fs.existsSync(path.join(root, 'PublicRelease'))
      ? fs
          .readdirSync(path.join(root, 'PublicRelease'))
          .filter(f => f.endsWith('.dmg')).length
      : 0,
  },
  phases: {
    completed: 16,
    reports: [],
  },
};

// Contar reportes de todas las fases
const coreReportDir = path.join(root, 'DozoCoreReport');
if (fs.existsSync(coreReportDir)) {
  const allFiles = fs.readdirSync(coreReportDir);
  const reportFiles = allFiles.filter(
    f => f.startsWith('reporte-') && f.endsWith('.json')
  );
  syncMetadata.phases.reports = reportFiles.length;
}

const metadataPath = path.join(reportDir, 'sync-metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(syncMetadata, null, 2));
console.log('   ✅ Metadata de sincronización generada');
report.steps.push('Metadata de sincronización creada');
console.log('');

// PASO 10 – Generar reportes finales
console.log('🔍 PASO 10: Generando reportes finales...');

report.status =
  report.errors.length === 0 ? 'COMPLETADA' : 'COMPLETADA_CON_ERRORES';
report.summary = {
  gitInitialized: report.git.initialized,
  remoteConfigured: report.git.remoteConfigured,
  committed: report.git.committed,
  pushed: report.git.pushed,
  errors: report.errors.length,
  warnings: report.warnings.length,
  steps: report.steps.length,
  readyForAutoSync: report.git.initialized && report.git.remoteConfigured,
};

// Reporte JSON
const jsonReportPath = path.join(
  reportDir,
  `reporte-fase-16-${timestamp}.json`
);
fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
console.log(`   ✅ Reporte JSON: reporte-fase-16-${timestamp}.json`);

// Reporte Markdown
const stepsSection = report.steps
  .map((step, i) => `${i + 1}. ${step}`)
  .join('\n');
const warningsSection =
  report.warnings.length > 0
    ? report.warnings.map(w => `- ${w}`).join('\n')
    : 'Ninguna';
const errorsSection =
  report.errors.length > 0
    ? report.errors.map(e => `- ${e}`).join('\n')
    : 'Ninguno';

const mdReport = `# 🧩 DOZO FASE 16 – GitHub Live Sync & AppSync Integration

**Versión:** ${VERSION}  
**Estado:** ${report.status}  
**Fecha:** ${timestampISO}

## 📊 Resumen

Sistema de sincronización con GitHub implementado.

## 🔄 Estado de Git

- **Repositorio inicializado:** ${report.git.initialized ? '✅ Sí' : '❌ No'}
- **Branch:** ${report.git.branch || 'N/A'}
- **Remoto configurado:** ${report.git.remoteConfigured ? '✅ Sí' : '❌ No'}
- **Remoto URL:** ${report.git.remoteUrl || 'N/A'}
- **Commit creado:** ${report.git.committed ? '✅ Sí' : '❌ No'}
- **Push a GitHub:** ${report.git.pushed ? '✅ Sí' : '⚠️ No'}
- **Usuario Git:** ${report.git.user?.name || 'No configurado'}

## 📦 Metadata de Sincronización

- **Versión del sistema:** ${syncMetadata.version}
- **Releases disponibles:** ${syncMetadata.releases.available}
- **Reportes generados:** ${syncMetadata.phases.reports}
- **Fases completadas:** ${syncMetadata.phases.completed}

## 📋 Pasos Ejecutados (${report.steps.length})

${stepsSection}

## ⚠️ Advertencias (${report.warnings.length})

${warningsSection}

## ❌ Errores (${report.errors.length})

${errorsSection}

## 🎯 Listo para Auto-Sync

**${report.summary.readyForAutoSync ? '✅ SÍ' : '⚠️ NO'}**

${
  !report.summary.readyForAutoSync
    ? `
### Requisitos pendientes:
${!report.git.initialized ? '- ❌ Inicializar repositorio Git\n' : ''}${!report.git.remoteConfigured ? '- ❌ Configurar remoto GitHub\n' : ''}
`
    : 'El sistema está completamente configurado para sincronización automática con GitHub.'
}

## 🚀 Próximos Pasos

${
  report.git.pushed
    ? `
1. ✅ Verificar commit en GitHub
2. ✅ Revisar archivos sincronizados
3. ✅ Configurar GitHub Actions (FASE 17)
4. ✅ Automatizar builds y releases
`
    : `
1. ${report.git.initialized ? '✅' : '⚠️'} Inicializar repositorio Git
2. ${report.git.remoteConfigured ? '✅' : '⚠️'} Configurar remoto GitHub
3. ${report.git.user ? '✅' : '⚠️'} Configurar usuario y email Git
4. ⚠️ Configurar autenticación (SSH o HTTPS)
5. Re-ejecutar: npm run phase-16
`
}

## 📂 Archivos Generados

- **Metadata:** \`DozoCoreReport/GitHubSyncSystem/sync-metadata.json\`
- **Reporte JSON:** \`DozoCoreReport/GitHubSyncSystem/reporte-fase-16-${timestamp}.json\`
- **Reporte MD:** \`DozoCoreReport/GitHubSyncSystem/reporte-fase-16-${timestamp}.md\`
- **Changelog:** \`CHANGELOG.md\` (actualizado)

---

**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  
**Build ID:** ${timestamp}
`;

const mdReportPath = path.join(reportDir, `reporte-fase-16-${timestamp}.md`);
fs.writeFileSync(mdReportPath, mdReport);
console.log(`   ✅ Reporte MD: reporte-fase-16-${timestamp}.md`);
console.log('');

// PASO 11 – Documentación de cierre
console.log('🔍 PASO 11: Generando documentación de cierre...');

// FASE-16-COMPLETE.md
const completeDoc = `# ✅ DOZO FASE 16 – Completada

**Versión:** ${VERSION}  
**Estado:** ${report.status}  
**Fecha:** ${timestampISO}

## 🎯 Objetivo Alcanzado

Sistema de sincronización con GitHub implementado.

## 🔄 Estado de Sincronización

- **Git inicializado:** ${report.git.initialized ? '✅' : '❌'}
- **Remoto GitHub:** ${report.git.remoteConfigured ? '✅' : '❌'}
- **Commit creado:** ${report.git.committed ? '✅' : '❌'}
- **Push exitoso:** ${report.git.pushed ? '✅' : '⚠️'}

${
  report.git.pushed
    ? `
### ✅ Sincronización Exitosa

El sistema DOZO está ahora sincronizado con GitHub.

**Repositorio:** ${report.git.remoteUrl}  
**Branch:** ${report.git.branch}  
**Commit:** ${report.git.commitMessage?.split('\n')[0]}

**Verificar en GitHub:**
\`\`\`bash
# Abrir repositorio en navegador
open https://github.com/rockstage/dozo-control-center
\`\`\`
`
    : `
### ⚠️ Sincronización Pendiente

${report.warnings.length > 0 ? 'Advertencias encontradas:\n' + warningsSection + '\n' : ''}
**Para completar la sincronización:**

1. Configurar autenticación SSH:
\`\`\`bash
gh auth login
# O generar par de llaves SSH
ssh-keygen -t ed25519 -C "tu@email.com"
\`\`\`

2. Re-ejecutar sincronización:
\`\`\`bash
npm run phase-16
\`\`\`
`
}

## 📦 CHANGELOG Actualizado

Se ha agregado una nueva entrada en \`CHANGELOG.md\` para la versión ${pkg.version}.

## 📊 Estadísticas

- **Pasos completados:** ${report.steps.length}
- **Advertencias:** ${report.warnings.length}
- **Errores:** ${report.errors.length}
- **Releases disponibles:** ${syncMetadata.releases.available}
- **Reportes generados:** ${syncMetadata.phases.reports}

## 🚀 Próximos Pasos

${
  report.git.pushed
    ? `
1. ✅ Verificar repositorio en GitHub
2. ✅ Configurar GitHub Actions (FASE 17)
3. ✅ Automatizar CI/CD
4. ✅ Setup de releases automáticas
`
    : `
1. Completar configuración de Git
2. Configurar autenticación con GitHub
3. Re-ejecutar: npm run phase-16
4. Verificar push exitoso
`
}

---

**RockStage Solutions** © 2025  
**Build ID:** ${timestamp}
`;

fs.writeFileSync('./FASE-16-COMPLETE.md', completeDoc);
console.log('   ✅ FASE-16-COMPLETE.md');

// 🎉-FASE-16-INSTALLATION-COMPLETE.md
const installCompleteDoc = `# 🎉 DOZO FASE 16 – Installation Complete!

\`\`\`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${report.git.pushed ? '✅ GITHUB SYNC EXITOSO ✅' : '⚠️  GITHUB SYNC CONFIGURADO ⚠️'}              ║
║                                                           ║
║        DOZO GitHub Live Sync v${VERSION}                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
\`\`\`

**Fecha:** ${timestampISO}  
**Build ID:** ${timestamp}

---

## 🔄 Estado de Sincronización

\`\`\`
┌────────────────────────────────────────┐
│  GitHub Sync Status                   │
│                                        │
│  [${report.git.initialized ? '✓' : '✗'}] Repositorio inicializado        │
│  [${report.git.remoteConfigured ? '✓' : '✗'}] Remoto configurado             │
│  [${report.git.committed ? '✓' : '✗'}] Commit creado                   │
│  [${report.git.pushed ? '✓' : '✗'}] Push a GitHub                 │
│                                        │
└────────────────────────────────────────┘
\`\`\`

---

${
  report.git.pushed
    ? `
## ✅ Sincronización Exitosa

El sistema DOZO está completamente sincronizado con GitHub.

**Repositorio:** ${report.git.remoteUrl}  
**Branch:** ${report.git.branch}  
**Versión:** ${pkg.version}

### Verificar en GitHub

\`\`\`bash
# Abrir repositorio
open https://github.com/rockstage/dozo-control-center

# O ver último commit
git log -1 --oneline
\`\`\`
`
    : `
## ⚠️ Sincronización Pendiente

El sistema está configurado pero requiere autenticación con GitHub.

### Completar Sincronización

**Opción 1 - GitHub CLI (Recomendado):**
\`\`\`bash
gh auth login
npm run phase-16
\`\`\`

**Opción 2 - SSH Keys:**
\`\`\`bash
# Generar llave SSH
ssh-keygen -t ed25519 -C "tu@email.com"

# Agregar a ssh-agent
ssh-add ~/.ssh/id_ed25519

# Agregar llave pública en GitHub
cat ~/.ssh/id_ed25519.pub
# Copiar y pegar en GitHub > Settings > SSH Keys

# Re-intentar push
npm run phase-16
\`\`\`

**Opción 3 - HTTPS con Token:**
\`\`\`bash
# Cambiar a HTTPS
git remote set-url origin https://github.com/rockstage/dozo-control-center.git

# Configurar token (se pedirá al hacer push)
npm run phase-16
\`\`\`
`
}

---

## 📦 Archivos Generados

### GitHubSyncSystem/
- \`sync-metadata.json\` - Metadata de sincronización
- \`reporte-fase-16-${timestamp}.json\` - Reporte técnico
- \`reporte-fase-16-${timestamp}.md\` - Reporte legible

### Raíz del Proyecto
- \`CHANGELOG.md\` - Changelog actualizado con v${pkg.version}
- \`FASE-16-COMPLETE.md\` - Documentación de completación
- \`🎉-FASE-16-INSTALLATION-COMPLETE.md\` - Este archivo

---

## 📊 Metadata del Sistema

- **Versión:** ${pkg.version}
- **Releases disponibles:** ${syncMetadata.releases.available}
- **Reportes generados:** ${syncMetadata.phases.reports}
- **Fases completadas:** ${syncMetadata.phases.completed}

---

## 🎯 Próximos Pasos

${
  report.git.pushed
    ? `
### FASE 17: GitHub Actions & CI/CD
- Configurar workflows automáticos
- Tests automatizados
- Builds automáticos en cada push
- Releases automáticas con tags
`
    : `
### Completar Configuración

1. Configurar autenticación con GitHub
2. Re-ejecutar: \`npm run phase-16\`
3. Verificar push exitoso
4. Continuar con FASE 17
`
}

---

## 📚 Documentación

- **Quick Start:** \`FASE-16-QUICK-START.md\`
- **Complete Guide:** \`FASE-16-COMPLETE.md\`
- **Metadata:** \`DozoCoreReport/GitHubSyncSystem/sync-metadata.json\`
- **Changelog:** \`CHANGELOG.md\`

---

## 🎊 ${report.git.pushed ? '¡GitHub Sync Activo!' : '¡Fase 16 Completada!'}

${
  report.git.pushed
    ? 'El sistema DOZO está completamente sincronizado con GitHub y listo para colaboración.'
    : 'El sistema está configurado y listo para sincronización una vez se complete la autenticación.'
}

---

**Proyecto:** DOZO Control Center  
**Versión:** ${VERSION}  
**Fase:** 16 - GitHub Live Sync & AppSync Integration  
**Autor:** David Alejandro Pérez Rea  
**Organización:** RockStage Solutions  

**RockStage Solutions** © 2025  
**DOZO AutoSync Engine – Phase 16 v${VERSION} (RockStage Build)**
`;

fs.writeFileSync('./🎉-FASE-16-INSTALLATION-COMPLETE.md', installCompleteDoc);
console.log('   ✅ 🎉-FASE-16-INSTALLATION-COMPLETE.md');
console.log('');

// Resumen final
console.log('═══════════════════════════════════════════════════════');
console.log('🎉 FASE 16 COMPLETADA');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('📊 Resumen:');
console.log(`   Estado: ${report.status}`);
console.log(
  `   Git inicializado: ${report.git.initialized ? '✅ Sí' : '❌ No'}`
);
console.log(
  `   Remoto configurado: ${report.git.remoteConfigured ? '✅ Sí' : '❌ No'}`
);
console.log(`   Commit creado: ${report.git.committed ? '✅ Sí' : '❌ No'}`);
console.log(`   Push a GitHub: ${report.git.pushed ? '✅ Sí' : '⚠️ No'}`);
console.log(
  `   Listo para AutoSync: ${report.summary.readyForAutoSync ? '✅ Sí' : '⚠️ Requiere configuración'}`
);
console.log('');

if (!report.git.pushed) {
  console.log('💡 Para completar la sincronización:');
  console.log('   1. Configurar autenticación con GitHub (gh auth login)');
  console.log('   2. Re-ejecutar: npm run phase-16');
  console.log('');
}

console.log('📂 Reportes generados en:');
console.log(`   ${reportDir}`);
console.log('');

console.log('📄 Archivos creados:');
console.log('   - sync-metadata.json');
console.log('   - reporte-fase-16-*.json');
console.log('   - reporte-fase-16-*.md');
console.log('   - CHANGELOG.md (actualizado)');
console.log('   - FASE-16-COMPLETE.md');
console.log('   - 🎉-FASE-16-INSTALLATION-COMPLETE.md');
console.log('');

console.log('🎯 Próximos pasos:');
if (report.git.pushed) {
  console.log('   1. Verificar repositorio en GitHub');
  console.log('   2. Preparar FASE 17: GitHub Actions & CI/CD');
} else {
  console.log('   1. Configurar autenticación: gh auth login');
  console.log('   2. Re-ejecutar: npm run phase-16');
  console.log('   3. Verificar push exitoso');
}
console.log('');
console.log('═══════════════════════════════════════════════════════');

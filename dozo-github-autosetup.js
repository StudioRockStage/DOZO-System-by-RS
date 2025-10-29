import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline";

console.log("═══════════════════════════════════════════════════════");
console.log("🧩 DOZO GitHub AutoSetup Script v2.0.0 – Extended Secure Edition");
console.log("═══════════════════════════════════════════════════════");
console.log("");

const root = process.cwd();
const reportDir = path.join(root, "DozoCoreReport", "GitHubSyncSystem");
fs.mkdirSync(reportDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const timestampISO = new Date().toISOString();

const report = {
  script: "GitHub AutoSetup",
  version: "2.0.0",
  timestamp: timestampISO,
  status: "EN_PROCESO",
  steps: [],
  errors: [],
  warnings: [],
  configuration: {
    user: "StudioRockStage",
    email: "studiorockstage@gmail.com",
    remote: "git@github.com:StudioRockStage/dozo-control-center.git",
    repository: "StudioRockStage/dozo-control-center"
  },
  validation: {
    ghCliInstalled: false,
    authenticated: false,
    gitConfigured: false,
    remoteConfigured: false,
    tokenStored: false,
    pushSuccessful: false
  }
};

// PASO 1: Verificar GitHub CLI
console.log("🔍 PASO 1: Verificando instalación de GitHub CLI...");

try {
  const ghVersion = execSync("gh --version", { encoding: "utf8" });
  console.log(`   ✅ GitHub CLI detectado:`);
  console.log(`      ${ghVersion.split('\n')[0]}`);
  report.validation.ghCliInstalled = true;
  report.steps.push("GitHub CLI verificado");
} catch (ghErr) {
  console.log("   ⚠️  GitHub CLI no encontrado");
  console.log("");
  console.log("   💡 Para instalar GitHub CLI:");
  console.log("      brew install gh");
  console.log("");
  console.log("   O descarga desde: https://cli.github.com");
  console.log("");
  report.errors.push("GitHub CLI no instalado");
  report.validation.ghCliInstalled = false;
}
console.log("");

// PASO 2: Autenticación con GitHub
console.log("🔍 PASO 2: Verificando autenticación con GitHub...");

if (report.validation.ghCliInstalled) {
  try {
    // Verificar si ya está autenticado
    const authStatus = execSync("gh auth status", { encoding: "utf8", stdio: "pipe" });
    
    if (authStatus.includes("Logged in")) {
      console.log("   ✅ Ya estás autenticado con GitHub CLI");
      report.validation.authenticated = true;
      report.steps.push("GitHub CLI ya autenticado");
    }
  } catch (authCheckErr) {
    console.log("   ⚠️  No estás autenticado con GitHub CLI");
    console.log("   🔐 Iniciando proceso de autenticación...");
    console.log("");
    
    try {
      execSync("gh auth login", { stdio: "inherit" });
      console.log("");
      console.log("   ✅ Autenticación completada correctamente");
      report.validation.authenticated = true;
      report.steps.push("Autenticación con GitHub completada");
    } catch (authErr) {
      console.error("   ❌ Error durante la autenticación:", authErr.message);
      report.errors.push("Error en autenticación: " + authErr.message);
      report.validation.authenticated = false;
    }
  }
} else {
  console.log("   ⚠️  GitHub CLI no disponible, omitiendo autenticación");
  report.warnings.push("GitHub CLI no disponible para autenticación");
}
console.log("");

// PASO 3: Configurar identidad Git
console.log("🔍 PASO 3: Configurando identidad Git...");

try {
  // Verificar configuración actual
  let currentName = null;
  let currentEmail = null;
  
  try {
    currentName = execSync("git config user.name", { encoding: "utf8" }).trim();
    currentEmail = execSync("git config user.email", { encoding: "utf8" }).trim();
  } catch (checkErr) {
    // No hay configuración, se configurará
  }
  
  if (currentName && currentEmail) {
    console.log(`   ℹ️  Configuración Git actual:`);
    console.log(`      Nombre: ${currentName}`);
    console.log(`      Email: ${currentEmail}`);
    console.log("");
    console.log("   🔄 Actualizando a configuración DOZO...");
  }
  
  // Configurar identidad DOZO
  execSync(`git config user.name "${report.configuration.user}"`, { stdio: "inherit" });
  execSync(`git config user.email "${report.configuration.email}"`, { stdio: "inherit" });
  
  console.log("   ✅ Identidad Git configurada:");
  console.log(`      Nombre: ${report.configuration.user}`);
  console.log(`      Email: ${report.configuration.email}`);
  
  report.validation.gitConfigured = true;
  report.steps.push("Identidad Git configurada");
} catch (configErr) {
  console.error("   ❌ Error al configurar Git:", configErr.message);
  report.errors.push("Error configurando Git: " + configErr.message);
  report.validation.gitConfigured = false;
}
console.log("");

// PASO 4: Verificar/Configurar remoto
console.log("🔍 PASO 4: Verificando remoto de GitHub...");

try {
  const remotes = execSync("git remote -v", { encoding: "utf8" });
  
  if (remotes.includes("origin")) {
    const currentRemote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
    console.log("   ℹ️  Remoto 'origin' actual:");
    console.log(`      ${currentRemote}`);
    
    if (currentRemote !== report.configuration.remote) {
      console.log("");
      console.log("   🔄 Actualizando a remoto DOZO...");
      execSync(`git remote set-url origin ${report.configuration.remote}`, { stdio: "inherit" });
      console.log(`   ✅ Remoto actualizado a: ${report.configuration.remote}`);
    } else {
      console.log("   ✅ Remoto ya configurado correctamente");
    }
    
    report.validation.remoteConfigured = true;
    report.steps.push("Remoto GitHub verificado/configurado");
  } else {
    console.log("   ⚙️  Configurando remoto 'origin'...");
    execSync(`git remote add origin ${report.configuration.remote}`, { stdio: "inherit" });
    console.log(`   ✅ Remoto configurado: ${report.configuration.remote}`);
    report.validation.remoteConfigured = true;
    report.steps.push("Remoto GitHub configurado");
  }
} catch (remoteErr) {
  console.error("   ❌ Error con el remoto:", remoteErr.message);
  report.errors.push("Error configurando remoto: " + remoteErr.message);
  report.validation.remoteConfigured = false;
}
console.log("");

// PASO 5: Gestión de Token Personal
console.log("🔍 PASO 5: Gestionando token personal de GitHub...");

const tokenPath = path.join(os.homedir(), ".dozo_github_token");
let tokenStored = false;

if (fs.existsSync(tokenPath)) {
  console.log("   ✅ Token personal ya existe en:");
  console.log(`      ${tokenPath}`);
  tokenStored = true;
  report.validation.tokenStored = true;
  report.steps.push("Token personal verificado");
} else {
  console.log("   ⚠️  Token personal no encontrado");
  console.log("");
  console.log("   💡 Para crear un token personal:");
  console.log("      1. Abre: https://github.com/settings/tokens/new?scopes=repo,workflow");
  console.log("      2. Genera un token con scopes: repo, workflow");
  console.log("      3. Copia el token generado");
  console.log("");
  console.log("   ℹ️  El script intentará obtener el token vía GitHub CLI...");
  
  try {
    // Intentar obtener token vía gh CLI
    const ghToken = execSync("gh auth token", { encoding: "utf8" }).trim();
    
    if (ghToken && ghToken.startsWith("gh")) {
      fs.writeFileSync(tokenPath, ghToken, { mode: 0o600 });
      console.log("   ✅ Token obtenido de GitHub CLI y guardado");
      
      // Intentar guardar en keychain de macOS
      try {
        execSync(`security add-generic-password -a "${report.configuration.user}" -s dozo_github_token -w "${ghToken}" -U`, {
          stdio: "pipe"
        });
        console.log("   ✅ Token guardado en Keychain de macOS");
      } catch (keychainErr) {
        console.log("   ⚠️  No se pudo guardar en Keychain (puede ya existir)");
      }
      
      tokenStored = true;
      report.validation.tokenStored = true;
      report.steps.push("Token personal creado y guardado");
    }
  } catch (tokenErr) {
    console.log("   ⚠️  No se pudo obtener token automáticamente");
    console.log("   💡 Puedes crearlo manualmente después");
    report.warnings.push("Token personal no creado automáticamente");
    report.validation.tokenStored = false;
  }
}
console.log("");

// PASO 6: Verificar estado del repositorio
console.log("🔍 PASO 6: Verificando estado del repositorio...");

try {
  const status = execSync("git status -s", { encoding: "utf8" });
  
  if (status.trim()) {
    console.log("   ℹ️  Hay cambios pendientes en el repositorio:");
    console.log(status);
    
    const fileCount = status.split('\n').filter(l => l.trim()).length;
    report.repositoryStatus = {
      clean: false,
      modifiedFiles: fileCount
    };
  } else {
    console.log("   ✅ Working tree limpio (no hay cambios pendientes)");
    report.repositoryStatus = {
      clean: true,
      modifiedFiles: 0
    };
  }
  
  report.steps.push("Estado del repositorio verificado");
} catch (statusErr) {
  console.log("   ⚠️  No se pudo verificar estado del repositorio");
  report.warnings.push("No se pudo verificar git status");
}
console.log("");

// PASO 7: Intentar push de prueba
console.log("🔍 PASO 7: Probando conexión con GitHub (push)...");

if (report.validation.remoteConfigured && report.validation.gitConfigured) {
  try {
    console.log("   📤 Intentando push al repositorio remoto...");
    console.log("   ⏳ Este proceso puede requerir autenticación...");
    
    // Primero hacer pull para evitar conflictos
    try {
      execSync("git pull origin main --rebase", { encoding: "utf8", stdio: "pipe" });
      console.log("   ✅ Pull ejecutado (sincronización con remoto)");
    } catch (pullErr) {
      // Si falla el pull, puede ser porque el repo está vacío o no hay branch main
      console.log("   ℹ️  Pull omitido (posible repositorio nuevo)");
    }
    
    // Intentar push
    execSync("git push -u origin main", { stdio: "inherit" });
    
    console.log("");
    console.log("   ✅ Push exitoso a GitHub remoto");
    report.validation.pushSuccessful = true;
    report.steps.push("Push a GitHub exitoso");
  } catch (pushErr) {
    console.log("");
    console.log("   ⚠️  No se pudo hacer push automático");
    console.log("");
    console.log("   💡 Posibles causas:");
    console.log("      - No hay commits nuevos para pushear");
    console.log("      - Requiere configuración SSH adicional");
    console.log("      - El repositorio remoto no existe");
    console.log("      - Sin permisos de escritura");
    console.log("");
    console.log("   🔧 Para verificar:");
    console.log("      gh repo view StudioRockStage/dozo-control-center");
    console.log("");
    
    report.validation.pushSuccessful = false;
    report.warnings.push("Push a GitHub no completado - puede requerir configuración adicional");
  }
} else {
  console.log("   ⚠️  Push omitido (configuración incompleta)");
  report.validation.pushSuccessful = false;
}
console.log("");

// PASO 8: Verificar estado final
console.log("🔍 PASO 8: Verificando estado final del repositorio...");

try {
  console.log("   📋 Git status:");
  const finalStatus = execSync("git status", { encoding: "utf8" });
  console.log(finalStatus);
  
  report.finalStatus = finalStatus;
  report.steps.push("Estado final verificado");
} catch (statusErr) {
  console.log("   ⚠️  No se pudo obtener git status");
}
console.log("");

// PASO 9: Generar reporte
console.log("🔍 PASO 9: Generando reporte de configuración...");

report.status = report.errors.length === 0 ? "COMPLETADO" : "COMPLETADO_CON_ERRORES";
report.summary = {
  allChecksComplete: Object.values(report.validation).every(v => v === true),
  checksCompleted: Object.values(report.validation).filter(v => v === true).length,
  totalChecks: Object.keys(report.validation).length,
  errors: report.errors.length,
  warnings: report.warnings.length,
  readyForSync: report.validation.authenticated && report.validation.remoteConfigured
};

const reportPath = path.join(reportDir, `github-autosetup-report-${timestamp}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`   ✅ Reporte JSON generado:`);
console.log(`      ${reportPath}`);

// Reporte Markdown
const mdReport = `# 🔐 DOZO GitHub AutoSetup Report

**Versión:** 2.0.0  
**Estado:** ${report.status}  
**Fecha:** ${timestampISO}

## 🎯 Configuración

- **Usuario Git:** ${report.configuration.user}
- **Email Git:** ${report.configuration.email}
- **Repositorio:** ${report.configuration.repository}
- **Remoto:** ${report.configuration.remote}

## ✅ Validaciones

| Check | Estado |
|-------|--------|
| GitHub CLI instalado | ${report.validation.ghCliInstalled ? '✅' : '❌'} |
| Autenticación GitHub | ${report.validation.authenticated ? '✅' : '❌'} |
| Git configurado | ${report.validation.gitConfigured ? '✅' : '❌'} |
| Remoto configurado | ${report.validation.remoteConfigured ? '✅' : '❌'} |
| Token almacenado | ${report.validation.tokenStored ? '✅' : '❌'} |
| Push exitoso | ${report.validation.pushSuccessful ? '✅' : '⚠️'} |

**Completadas:** ${report.summary.checksCompleted}/${report.summary.totalChecks}

## 📋 Pasos Ejecutados (${report.steps.length})

${report.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## ⚠️ Advertencias (${report.warnings.length})

${report.warnings.length > 0 ? report.warnings.map(w => `- ${w}`).join('\n') : 'Ninguna'}

## ❌ Errores (${report.errors.length})

${report.errors.length > 0 ? report.errors.map(e => `- ${e}`).join('\n') : 'Ninguno'}

## 🎯 Estado de Sincronización

**Listo para GitHub Sync:** ${report.summary.readyForSync ? '✅ SÍ' : '⚠️ NO'}

${!report.summary.readyForSync ? `
### Pasos Pendientes:
${!report.validation.ghCliInstalled ? '- Instalar GitHub CLI: \`brew install gh\`\n' : ''}${!report.validation.authenticated ? '- Autenticar con GitHub: \`gh auth login\`\n' : ''}${!report.validation.gitConfigured ? '- Configurar Git user y email\n' : ''}${!report.validation.remoteConfigured ? '- Configurar remoto de GitHub\n' : ''}
` : 'El sistema está completamente configurado para sincronización con GitHub.'}

## 🚀 Próximos Pasos

${report.summary.readyForSync ? `
1. ✅ Ejecutar sincronización: \`npm run phase-16\`
2. ✅ Validar integridad: \`npm run validate-github\`
3. ✅ Verificar en GitHub: https://github.com/${report.configuration.repository}
` : `
1. Completar configuración pendiente
2. Re-ejecutar: \`npm run github-setup\`
3. Ejecutar: \`npm run phase-16\`
`}

---

**Generado:** ${timestampISO}  
**Build ID:** ${timestamp}
`;

const mdReportPath = path.join(reportDir, `github-autosetup-report-${timestamp}.md`);
fs.writeFileSync(mdReportPath, mdReport);
console.log(`   ✅ Reporte MD generado:`);
console.log(`      ${mdReportPath}`);
console.log("");

// Resumen final
console.log("═══════════════════════════════════════════════════════");
console.log("🎉 GITHUB AUTOSETUP COMPLETADO");
console.log("═══════════════════════════════════════════════════════");
console.log("");
console.log("📊 Resumen:");
console.log(`   Estado: ${report.status}`);
console.log(`   Checks completados: ${report.summary.checksCompleted}/${report.summary.totalChecks}`);
console.log(`   GitHub CLI: ${report.validation.ghCliInstalled ? '✅' : '❌'}`);
console.log(`   Autenticado: ${report.validation.authenticated ? '✅' : '❌'}`);
console.log(`   Git configurado: ${report.validation.gitConfigured ? '✅' : '❌'}`);
console.log(`   Remoto configurado: ${report.validation.remoteConfigured ? '✅' : '❌'}`);
console.log(`   Push exitoso: ${report.validation.pushSuccessful ? '✅' : '⚠️'}`);
console.log(`   Listo para sync: ${report.summary.readyForSync ? '✅ Sí' : '⚠️ Requiere configuración'}`);
console.log("");

if (report.summary.readyForSync) {
  console.log("✅ Configuración GitHub completada correctamente");
  console.log("");
  console.log("🎯 Próximos pasos:");
  console.log("   1. Ejecutar: npm run phase-16");
  console.log("   2. Ejecutar: npm run validate-github");
  console.log("   3. Verificar en: https://github.com/StudioRockStage/dozo-control-center");
} else {
  console.log("⚠️  Configuración incompleta");
  console.log("");
  console.log("💡 Pasos pendientes:");
  if (!report.validation.ghCliInstalled) {
    console.log("   - Instalar GitHub CLI: brew install gh");
  }
  if (!report.validation.authenticated) {
    console.log("   - Autenticar: gh auth login");
  }
  if (!report.validation.gitConfigured) {
    console.log("   - Configurar Git user/email");
  }
  if (!report.validation.remoteConfigured) {
    console.log("   - Configurar remoto GitHub");
  }
  console.log("");
  console.log("   Luego re-ejecutar: npm run github-setup");
}

console.log("");
console.log("📄 Reportes generados en:");
console.log(`   ${reportDir}`);
console.log("");
console.log("═══════════════════════════════════════════════════════");



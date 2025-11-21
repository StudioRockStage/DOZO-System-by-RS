/*
🧩 DOZO Local Prepare & Deploy Instructions v1.0.1
Sistema: DOZO System by RockStage (v7.9 DeepSync Framework)
Proyecto: Warranty System RS
Autor: RockStage Solutions

Objetivo: Preparar todos los archivos localmente y generar instrucciones
          para deploy manual o verificación de credenciales FTP
*/

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const ROOT = path.resolve(os.homedir(), "Documents/DOZO System by RS");
const LATEST_UPDATES = path.join(ROOT, "Latest Updates");
const EMPAQUETADO_READY = path.join(ROOT, "Empaquetado", "Ready");
const GLOBAL = path.join(ROOT, "to chat gpt", "Global");

const DEPLOY_INSTRUCTIONS = path.join(
  ROOT,
  "DOZO-v1.0.1-DEPLOY-INSTRUCTIONS.md",
);
const DEPLOY_REPORT = path.join(GLOBAL, "DOZO-v1.0.1-LocalPrepare-Report.json");

// Utilidades
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Preparar archivos localmente
function prepareLocalFiles() {
  log("📦", "Preparando archivos localmente...");

  // Crear directorios
  if (!fs.existsSync(EMPAQUETADO_READY)) {
    fs.mkdirSync(EMPAQUETADO_READY, { recursive: true });
  }
  if (!fs.existsSync(GLOBAL)) {
    fs.mkdirSync(GLOBAL, { recursive: true });
  }

  // Buscar el archivo correcto
  const correctName = "warranty-system-rs-v1.0.1.zip";
  let correctPath = path.join(LATEST_UPDATES, correctName);

  if (!fs.existsSync(correctPath)) {
    // Buscar alternativo
    const altName = "warranty-system-rs-v1.0.1-with-smart-panel.zip";
    const altPath = path.join(LATEST_UPDATES, altName);

    if (fs.existsSync(altPath)) {
      log("🔄", `Renombrando: ${altName} → ${correctName}`);
      fs.copyFileSync(altPath, correctPath);
      log("✅", "Archivo renombrado");
    } else {
      throw new Error("No se encontró ningún paquete v1.0.1");
    }
  }

  // Copiar a Empaquetado/Ready
  const readyPath = path.join(EMPAQUETADO_READY, correctName);
  fs.copyFileSync(correctPath, readyPath);
  log("✅", `Copiado a: Empaquetado/Ready/${correctName}`);

  return {
    correctPath,
    readyPath,
  };
}

// Generar update.json local
function generateUpdateJSON() {
  log("📄", "Generando update.json...");

  const updateData = {
    version: "1.0.1",
    download_url:
      "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
    tested: "6.7.1",
    requires: "6.0",
    requires_php: "7.4",
  };

  const updateJSONPath = path.join(EMPAQUETADO_READY, "update.json");
  fs.writeFileSync(updateJSONPath, JSON.stringify(updateData, null, 2));
  log("✅", "update.json creado en: Empaquetado/Ready/update.json");

  return { updateData, updateJSONPath };
}

// Generar instrucciones de deploy
function generateDeployInstructions(sha256, size) {
  log("📝", "Generando instrucciones de deploy...");

  const instructions = `# 🚀 Instrucciones de Deploy - Warranty System RS v1.0.1

**Generado:** ${new Date().toISOString()}  
**Sistema:** DOZO v7.9 by RockStage Solutions

---

## ✅ Archivos Preparados

Todos los archivos necesarios para el deploy están listos en:

\`\`\`
~/Documents/DOZO System by RS/Empaquetado/Ready/
├── warranty-system-rs-v1.0.1.zip  (${formatBytes(size)})
└── update.json
\`\`\`

---

## 🔐 Información del Paquete

- **SHA256:** \`${sha256}\`
- **Tamaño:** ${formatBytes(size)}
- **Versión:** 1.0.1
- **Características:** SmartCategoryPanel v1.1.0 integrado

---

## 📡 Opción 1: Deploy Manual via FTP

### Paso 1: Conectar al servidor FTP

**Opciones de cliente FTP:**
- FileZilla (recomendado)
- Cyberduck
- Transmit (macOS)
- Terminal: \`ftp ftp.vapedot.mx\`

**Credenciales sugeridas:**
\`\`\`
Host: ftp.vapedot.mx
Port: 21
Usuario: u461169968.vapedotmx
Password: RS@2025secure
\`\`\`

**⚠️ IMPORTANTE:** Si las credenciales anteriores no funcionan:
1. Verifica con tu proveedor de hosting
2. Revisa el panel de control (cPanel/Plesk)
3. Genera nuevas credenciales FTP si es necesario

### Paso 2: Navegar al directorio correcto

\`\`\`
/public_html/updates/warranty-system-rs/
\`\`\`

**Si el directorio no existe, créalo.**

### Paso 3: Subir archivos

Arrastra o sube los siguientes archivos:
1. \`warranty-system-rs-v1.0.1.zip\`
2. \`update.json\`

**Modo de transferencia:** Binary (importante para ZIPs)

### Paso 4: Verificar permisos

Asegúrate de que los archivos tengan permisos:
- \`warranty-system-rs-v1.0.1.zip\` → 644 (rw-r--r--)
- \`update.json\` → 644 (rw-r--r--)

---

## 🌐 Opción 2: Verificar URLs después de subir

Una vez subidos los archivos, verifica que sean accesibles:

### ZIP del Plugin
\`\`\`
https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip
\`\`\`

Debe descargar el archivo (${formatBytes(size)})

### update.json
\`\`\`
https://updates.vapedot.mx/warranty-system-rs/update.json
\`\`\`

Debe mostrar:
\`\`\`json
{
  "version": "1.0.1",
  "download_url": "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
  "tested": "6.7.1",
  "requires": "6.0",
  "requires_php": "7.4"
}
\`\`\`

---

## 🔧 Opción 3: Troubleshooting Credenciales FTP

Si las credenciales no funcionan, sigue estos pasos:

### A. Verificar en cPanel

1. Accede a cPanel: \`https://vapedot.mx:2083\`
2. Ve a "FTP Accounts"
3. Busca la cuenta para \`updates.vapedot.mx\`
4. Verifica usuario y password
5. Si es necesario, cambia el password o crea nueva cuenta

### B. Probar conexión FTP desde Terminal

\`\`\`bash
ftp ftp.vapedot.mx
# Ingresa usuario y password cuando se solicite
# Si conecta: cd /public_html/updates/warranty-system-rs/
# Si falla: verifica credenciales
\`\`\`

### C. Usar FileZilla para debug

1. Abre FileZilla
2. Ingresa credenciales
3. Activa "Show debug info" en settings
4. Intenta conectar
5. Lee los mensajes de error para diagnosticar

### D. Contactar con hosting

Si nada funciona:
- Soporte de hosting: support@tu-proveedor.com
- Solicita: "Verificar acceso FTP al subdominio updates.vapedot.mx"
- Pide credenciales válidas o ayuda para crear cuenta FTP

---

## ✅ Checklist Post-Deploy

Después de subir los archivos, verifica:

- [ ] ZIP accesible via URL pública
- [ ] update.json accesible y con formato correcto
- [ ] Tamaño del ZIP remoto coincide con local (${formatBytes(size)})
- [ ] No hay archivos duplicados en el directorio
- [ ] Permisos correctos (644)
- [ ] Sin errores 404 o 403

---

## 🧪 Probar Actualización en WordPress

Una vez confirmado el deploy:

1. Instala Warranty System RS v1.0.0 en un WordPress de prueba
2. Ve a \`Plugins → Actualizaciones\`
3. Debe aparecer update disponible a v1.0.1
4. Haz clic en "Actualizar"
5. Verifica que actualice correctamente

---

## 📊 Próximos Pasos

Después del deploy exitoso:

1. Documentar las credenciales FTP correctas
2. Actualizar scripts con credenciales verificadas
3. Crear backup de los archivos subidos
4. Monitorear logs de actualizaciones

---

## 📞 Soporte

**Desarrollado por:** RockStage Solutions  
**Sistema DOZO:** v7.9  
**Fecha:** ${new Date().toISOString().split("T")[0]}

---

*Generado automáticamente por DOZO Local Prepare System*
`;

  fs.writeFileSync(DEPLOY_INSTRUCTIONS, instructions);
  log("✅", `Instrucciones creadas: DOZO-v1.0.1-DEPLOY-INSTRUCTIONS.md`);

  return instructions;
}

// Generar reporte
function generateReport(paths, sha256, size) {
  log("📋", "Generando reporte...");

  const report = {
    action: "Local Prepare for Deploy v1.0.1",
    status: "ready_for_manual_deploy",
    timestamp: new Date().toISOString(),
    files_prepared: {
      zip: {
        name: "warranty-system-rs-v1.0.1.zip",
        path: paths.readyPath,
        sha256: sha256,
        size: size,
        size_formatted: formatBytes(size),
      },
      update_json: {
        name: "update.json",
        path: paths.updateJSONPath,
      },
    },
    deploy_target: {
      method: "manual_ftp_required",
      server: "ftp.vapedot.mx",
      remote_path: "/public_html/updates/warranty-system-rs/",
      urls: {
        zip: "https://updates.vapedot.mx/warranty-system-rs/warranty-system-rs-v1.0.1.zip",
        json: "https://updates.vapedot.mx/warranty-system-rs/update.json",
      },
    },
    next_steps: [
      "Leer DOZO-v1.0.1-DEPLOY-INSTRUCTIONS.md",
      "Verificar credenciales FTP",
      "Subir archivos manualmente",
      "Validar URLs públicas",
      "Probar actualización en WordPress",
    ],
    ftp_troubleshooting: {
      reason: "Login incorrect (530)",
      suggested_credentials: {
        host: "ftp.vapedot.mx",
        port: 21,
        user: "u461169968.vapedotmx",
        note: "Verificar password en cPanel",
      },
    },
  };

  fs.writeFileSync(DEPLOY_REPORT, JSON.stringify(report, null, 2));
  log("✅", `Reporte guardado: ${DEPLOY_REPORT}`);

  return report;
}

// Main execution
(async () => {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "║           📦 DOZO Local Prepare - Deploy v1.0.1 📦                           ║",
  );
  console.log(
    "║                                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Preparar archivos
    const paths = prepareLocalFiles();

    // Generar update.json
    const { updateData, updateJSONPath } = generateUpdateJSON();
    paths.updateJSONPath = updateJSONPath;

    // Calcular hash y tamaño
    const sha256 = calculateSHA256(paths.readyPath);
    const size = getFileSize(paths.readyPath);

    log("🔐", `SHA256: ${sha256.substring(0, 32)}...`);
    log("📊", `Tamaño: ${formatBytes(size)}`);

    // Generar instrucciones
    generateDeployInstructions(sha256, size);

    // Generar reporte
    const report = generateReport(paths, sha256, size);

    // Resultado
    console.log(
      "\n╔══════════════════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "║               ✅ ARCHIVOS PREPARADOS PARA DEPLOY MANUAL ✅                    ║",
    );
    console.log(
      "║                                                                              ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════════════════╝\n",
    );

    log("📦", "Archivos listos en: Empaquetado/Ready/");
    log("📝", "Instrucciones: DOZO-v1.0.1-DEPLOY-INSTRUCTIONS.md");
    log("📋", `Reporte: ${path.basename(DEPLOY_REPORT)}`);
    log("🔐", `SHA256: ${sha256.substring(0, 32)}...`);
    log("📊", `Tamaño: ${formatBytes(size)}`);

    console.log("\n📖 PRÓXIMOS PASOS:\n");
    console.log("1. Lee: DOZO-v1.0.1-DEPLOY-INSTRUCTIONS.md");
    console.log("2. Verifica credenciales FTP en cPanel");
    console.log("3. Sube archivos a: /public_html/updates/warranty-system-rs/");
    console.log("4. Valida URLs públicas");
    console.log("5. Prueba actualización en WordPress\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

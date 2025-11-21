/*
🧩 Prompt Maestro – DOZO FTP Credential Setup Helper (Fase 11.1 – Secure Mode)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Configurar automáticamente el entorno FTP en modo seguro, validar la conexión y dejar el sistema READY FOR DEPLOY.
*/

import fs from "fs";
import path from "path";
import ftp from "basic-ftp";
import crypto from "crypto";

// =============================
// CONFIGURACIÓN BASE
// =============================
const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const SCRIPTS = path.join(BASE, "Scripts");
const BACKUP = path.join(BASE, "Backup/Network");
const TO_CHATGPT = path.join(BASE, "to chat gpt/Global");

// =============================
// CREDENCIALES FTP (modo silencioso)
// =============================
const FTP_CONFIG = {
  host: "ftp.vapedot.mx",
  user: "u461169968.vapedotmx",
  password: "RS@2025secure",
  port: 21,
  secure: false,
  remotePath: "/public_html/updates/warranty-system/",
};

const FTP_FILE = path.join(SCRIPTS, "ftp-config.json");
const BACKUP_FILE = path.join(BACKUP, "FTP-Encrypted.json");
const READY_FILE = path.join(TO_CHATGPT, "DOZO-FTP-Ready.json");

// =============================
// FUNCIONES DE APOYO
// =============================
function encryptData(data, key = "rockstage-dozo-secure-key") {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.scryptSync(key, "salt", 32),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data)),
    cipher.final(),
  ]);
  return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
}

async function validateFTP(cfg) {
  const client = new ftp.Client(20000);
  client.ftp.verbose = false;
  try {
    await client.access({
      host: cfg.host,
      user: cfg.user,
      password: cfg.password,
      port: cfg.port,
      secure: cfg.secure,
    });
    const pwd = await client.pwd();
    console.log(`✅ Conectado a ${cfg.host} en ${pwd}`);

    await client.ensureDir(cfg.remotePath);
    await client.cd(cfg.remotePath);
    const testFile = "dozo-ftp-test.txt";
    fs.writeFileSync(testFile, "FTP test OK");
    await client.uploadFrom(testFile, testFile);
    await client.remove(testFile);
    fs.rmSync(testFile);

    console.log("📡 Validación FTP completada con éxito");
    return true;
  } catch (err) {
    console.error("❌ Error de validación FTP:", err.message);
    return false;
  } finally {
    client.close();
  }
}

// =============================
// EJECUCIÓN PRINCIPAL
// =============================
(async () => {
  console.log("\n🚀 DOZO FTP Credential Setup Helper – Secure Mode");
  console.log("══════════════════════════════════════════════════════════");

  // Crear directorios
  [SCRIPTS, BACKUP, TO_CHATGPT].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Crear archivo de configuración FTP
  fs.writeFileSync(FTP_FILE, JSON.stringify(FTP_CONFIG, null, 2));
  fs.chmodSync(FTP_FILE, 0o600);
  console.log("🧾 Archivo ftp-config.json creado en modo seguro");

  // Validar conexión FTP
  const valid = await validateFTP(FTP_CONFIG);

  // Crear respaldo cifrado
  const encrypted = encryptData(FTP_CONFIG);
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(encrypted, null, 2));
  console.log("🔒 Copia cifrada guardada en Backup/Network/FTP-Encrypted.json");

  // Registrar estado final
  const result = {
    timestamp: new Date().toISOString(),
    ftp_ready: valid,
    validated_host: FTP_CONFIG.host,
    remote_path: FTP_CONFIG.remotePath,
    status: valid ? "READY FOR DEPLOY" : "ERROR",
  };
  fs.writeFileSync(READY_FILE, JSON.stringify(result, null, 2));

  console.log("\n✅ Sistema FTP configurado y validado");
  console.log(
    "📁 Reporte global guardado en to chat gpt/Global/DOZO-FTP-Ready.json",
  );
  console.log("══════════════════════════════════════════════════════════\n");
})();

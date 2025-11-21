/*
🧩 Prompt Maestro – DOZO Remote Deploy Sync & Validation (Fase 11 – v7.9)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Ejecutar deploy remoto completo (update.json + ZIP) al subdominio de actualizaciones y validar integridad final
*/

import fs from "fs";
import path from "path";
import ftp from "basic-ftp";
import fetch from "node-fetch";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const READY = path.join(BASE, "Empaquetado", "Ready");
const REPORT = path.join(
  BASE,
  "to chat gpt",
  "Global",
  "DOZO-RemoteDeploy-Report.json",
);
const CONFIG_PATH = path.join(BASE, "Scripts", "ftp-config.json");

async function main() {
  console.log("\n🚀 DOZO Remote Deploy Sync & Validation – Fase 11");
  console.log("═══════════════════════════════════════════════════════════");

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      "No se encontró ftp-config.json. Verifica tus credenciales FTP en /Scripts/",
    );
  }

  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const client = new ftp.Client(30000);
  client.ftp.verbose = false;

  const files = fs.readdirSync(READY).filter((f) => f.endsWith(".zip"));
  if (!files.length) throw new Error("No se encontró ningún ZIP en Ready/");
  const latestZip = files.sort(
    (a, b) =>
      fs.statSync(path.join(READY, b)).mtimeMs -
      fs.statSync(path.join(READY, a)).mtimeMs,
  )[0];

  const localZipPath = path.join(READY, latestZip);
  const localJsonPath = path.join(READY, "update.json");

  if (!fs.existsSync(localJsonPath))
    throw new Error("Falta update.json en Ready/");

  const remoteDir = "/public_html/updates/warranty-system/";
  const publicBase = "https://updates.vapedot.mx/warranty-system";

  await client.access({
    host: cfg.host,
    user: cfg.user,
    password: cfg.password,
    port: cfg.port || 21,
    secure: cfg.secure || false,
  });

  await client.ensureDir(remoteDir);
  await client.cd(remoteDir);

  console.log(`⬆️ Subiendo archivos a ${remoteDir}`);
  await client.uploadFrom(localZipPath, latestZip);
  await client.uploadFrom(localJsonPath, "update.json");

  client.close();

  console.log("✅ Archivos subidos exitosamente");
  console.log("🔎 Validando accesibilidad HTTP...");

  const updateURL = `${publicBase}/update.json`;
  const zipURL = `${publicBase}/${latestZip}`;

  const check = async (url) => {
    try {
      const res = await fetch(url);
      return res.ok ? "✅ Disponible" : `⚠️ Error HTTP ${res.status}`;
    } catch (e) {
      return `❌ ${e.message}`;
    }
  };

  const result = {
    timestamp: new Date().toISOString(),
    deployedZip: latestZip,
    urls: { updateURL, zipURL },
    validation: {
      updateJson: await check(updateURL),
      zipFile: await check(zipURL),
    },
  };

  fs.writeFileSync(REPORT, JSON.stringify(result, null, 2));
  console.log("🧾 Reporte generado:", REPORT);
  console.log("\n🎯 Deploy remoto completado con éxito");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
});

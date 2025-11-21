/*
🧩 Prompt Maestro — Phase 12 Fix: Latest Builds Sync (v7.7.7)
Ecosistema: DOZO System by RS
Objetivo: Alinear automáticamente Empaquetado/Ready ↔ Latest Builds, actualizar metadatos y preparar update.json con la última versión.

Qué hace:
1) Detecta el ZIP más nuevo en Empaquetado/Ready/ (Warranty_System_v*.zip)
2) Limpia Latest Builds/<plugin>/ y copia ese ZIP como único artefacto vigente
3) Genera/actualiza DOZO-LATEST.json y DOZO-Phase12-Report.json
4) Regenera update.json con URL del subdominio (updates.vapedot.mx)
5) (Opcional) Flag --deploy para subir update.json + ZIP por FTP

Uso:
node dozo-phase12-sync.js            # Solo sincroniza y escribe metadatos
node dozo-phase12-sync.js --deploy   # Además sube a updates.vapedot.mx
*/

import fs from "fs";
import path from "path";

// ====== CONFIG BÁSICA ======
const HOME = process.env.HOME;
const ROOT = path.resolve(HOME, "Documents/DOZO System by RS");
const PKG = "Warranty System"; // carpeta de plugin (humana)
const SLUG = "warranty-system"; // slug técnico
const READY = path.join(ROOT, "Empaquetado", "Ready");
const LATEST_DIR = path.join(ROOT, "Latest Builds", PKG);
const GLOBAL_DIR = path.join(ROOT, "to chat gpt", "Global");
const REPORT = path.join(GLOBAL_DIR, "DOZO-Phase12-Report.json");
const LATEST_META = path.join(ROOT, "Latest Builds", "DOZO-LATEST.json");
const UPDATE_JSON_LOCAL = path.join(READY, "update.json");
const SUBDOMAIN_BASE = "https://updates.vapedot.mx";
const REMOTE_PATH = `/warranty-system/`;

// ====== FTP opcional (si se llama con --deploy) ======
const WANT_DEPLOY = process.argv.includes("--deploy");
let ftp = null;
if (WANT_DEPLOY) {
  try {
    ftp = (await import("basic-ftp")).default;
  } catch {}
}
const SCRIPTS_DIR = path.join(ROOT, "Scripts");
const ENV_FILE = path.join(SCRIPTS_DIR, ".env");
const FTP_JSON = path.join(SCRIPTS_DIR, "ftp-config.json");

function loadFTPConfig() {
  const out = {};
  if (fs.existsSync(ENV_FILE)) {
    for (const line of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  }
  if (fs.existsSync(FTP_JSON))
    Object.assign(out, JSON.parse(fs.readFileSync(FTP_JSON, "utf8")));
  return {
    host: out.FTP_HOST || out.host,
    user: out.FTP_USER || out.user,
    password: out.FTP_PASS || out.password,
    port: Number(out.FTP_PORT || out.port || 21),
    secure: String(out.FTP_SECURE || out.secure || "false") === "true",
    remotePath:
      out.FTP_PATH || out.remotePath || "/public_html/updates/warranty-system/",
  };
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function findLatestZip() {
  if (!fs.existsSync(READY)) throw new Error("No existe Empaquetado/Ready");
  const zips = fs
    .readdirSync(READY)
    .filter((f) => /Warranty_System_v\d+\.\d+\.\d+\.zip$/i.test(f));
  if (!zips.length) throw new Error("No hay ZIP en Ready/");
  const sorted = zips
    .map((f) => ({ f, t: fs.statSync(path.join(READY, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  const file = sorted[0].f;
  const verMatch = file.match(/v(\d+\.\d+\.\d+)/i);
  const version = verMatch ? verMatch[1] : "0.0.0";
  return { file, version };
}

function writeJSON(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function maybeDeploy(zipName) {
  if (!WANT_DEPLOY) return { deployed: false };
  if (!ftp) throw new Error("basic-ftp no disponible");
  const cfg = loadFTPConfig();
  if (!cfg.host || !cfg.user || !cfg.password)
    throw new Error("Credenciales FTP incompletas");
  const client = new ftp.Client(30000);
  try {
    await client.access({
      host: cfg.host,
      user: cfg.user,
      password: cfg.password,
      port: cfg.port,
      secure: cfg.secure,
    });
    const startDir = await client.pwd();
    // normalizar ruta
    let remote = cfg.remotePath;
    if (startDir.includes("/public_html") && remote.startsWith("/public_html/"))
      remote = remote.replace("/public_html", "");
    if (!remote.startsWith("/")) remote = "/" + remote;
    if (!remote.endsWith("/")) remote += "/";

    await client.ensureDir(remote);
    await client.cd(remote);
    // subir ZIP y update.json
    await client.uploadFrom(path.join(READY, zipName), zipName);
    await client.uploadFrom(UPDATE_JSON_LOCAL, "update.json");
    return { deployed: true, remote: remote + zipName };
  } finally {
    client.close();
  }
}

(async () => {
  console.log("\n🔧 Phase 12 — Latest Builds Sync Fix");
  ensureDir(LATEST_DIR);
  ensureDir(GLOBAL_DIR);

  const { file: latestZip, version } = findLatestZip();
  console.log("✅ Detectado ZIP vigente:", latestZip, "versión", version);

  // 1) Limpiar Latest Builds/<plugin>/ y copiar ZIP
  for (const f of fs.readdirSync(LATEST_DIR))
    fs.rmSync(path.join(LATEST_DIR, f), { force: true, recursive: false });
  fs.copyFileSync(
    path.join(READY, latestZip),
    path.join(LATEST_DIR, latestZip),
  );

  // 2) update.json apuntando al subdominio
  const download_url = `${SUBDOMAIN_BASE}${REMOTE_PATH}${latestZip}`;
  const details_url = `${SUBDOMAIN_BASE}${REMOTE_PATH}update.json`;
  const updateJSON = {
    version,
    name: "Warranty System RS",
    author: "RockStage Solutions",
    slug: "rockstage-warranty-system",
    download_url,
    details_url,
    tested: "6.6.2",
    requires: "5.9",
    requires_php: "7.4",
    last_updated: new Date().toISOString().slice(0, 10),
    sections: {
      description: "Sistema de gestión post‑compra (garantías, tickets, etc.)",
      changelog: `v${version} — Build sincronizado (Phase 12).`,
    },
  };
  writeJSON(UPDATE_JSON_LOCAL, updateJSON);

  // 3) Metadatos DOZO-LATEST.json
  const latestMeta = {
    plugin: PKG,
    slug: SLUG,
    version,
    filename: latestZip,
    readyPath: path.join(READY, latestZip),
    latestBuildPath: path.join(LATEST_DIR, latestZip),
    download_url,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(LATEST_META, latestMeta);

  // 4) Reporte global
  writeJSON(REPORT, {
    phase: 12,
    status: "ok",
    actions: ["sync-latest-build", "write-update.json", "write-metadata"],
    latestMeta,
  });

  // 5) Deploy opcional
  const deployRes = await maybeDeploy(latestZip);
  if (deployRes.deployed) {
    const rep = JSON.parse(fs.readFileSync(REPORT, "utf8"));
    rep.deploy = deployRes;
    writeJSON(REPORT, rep);
    console.log("🚀 Deploy completado en:", deployRes.remote);
  }

  console.log("\n🎉 Phase 12 finalizada sin errores.");
})();

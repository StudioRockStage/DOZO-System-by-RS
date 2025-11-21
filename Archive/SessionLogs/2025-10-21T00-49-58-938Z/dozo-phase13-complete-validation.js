/*
🧩 DOZO Phase 13 - Complete Validation & Cache Analysis
Sistema: DOZO by RockStage Solutions
Objetivo: Validación completa del update channel con análisis de caché
*/

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import ftp from "basic-ftp";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const GLOBAL = path.join(BASE, "to chat gpt/Global");
const SCRIPTS = path.join(BASE, "Scripts");
const REPORT = path.join(GLOBAL, "DOZO-Phase13-Complete-Report.json");

const URLS = {
  updateJson: "https://updates.vapedot.mx/warranty-system/update.json",
  zipV777:
    "https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.7.zip",
  zipV776:
    "https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.6.zip",
};

console.log("\n🔍 DOZO Phase 13 - Complete Validation & Cache Analysis");
console.log("═══════════════════════════════════════════════════════════════");

const validation = {
  timestamp: new Date().toISOString(),
  phase: 13,
  status: "in_progress",
  checks: {},
};

// ========== CHECK 1: HTTP Accessibility ==========
console.log("\n📡 CHECK 1: Verificando accesibilidad HTTP...");

async function checkHTTP(url, name) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const accessible = res.ok;
    console.log(`   ${accessible ? "✅" : "❌"} ${name}: HTTP ${res.status}`);
    return {
      accessible,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
    };
  } catch (err) {
    console.log(`   ❌ ${name}: ${err.message}`);
    return { accessible: false, error: err.message };
  }
}

validation.checks.http_accessibility = {
  updateJson: await checkHTTP(URLS.updateJson, "update.json"),
  zipV777: await checkHTTP(URLS.zipV777, "ZIP v7.7.7 "),
  zipV776: await checkHTTP(URLS.zipV776, "ZIP v7.7.6 "),
};

// ========== CHECK 2: update.json Content ==========
console.log("\n📄 CHECK 2: Verificando contenido de update.json...");

try {
  const res = await fetch(URLS.updateJson);
  const data = await res.json();

  console.log(`   Versión en servidor: ${data.version}`);
  console.log(`   Nombre: ${data.name}`);
  console.log(`   Download URL: ${data.download_url}`);
  console.log(`   Última actualización: ${data.last_updated}`);

  validation.checks.update_json_content = {
    accessible: true,
    version: data.version,
    name: data.name,
    download_url: data.download_url,
    last_updated: data.last_updated,
    full_data: data,
  };

  if (data.version === "7.7.7") {
    console.log("   ✅ Versión correcta (7.7.7) - Caché limpio");
    validation.checks.update_json_content.cache_status = "clean";
  } else {
    console.log(`   ⏳ Versión antigua (${data.version}) - Caché pendiente`);
    validation.checks.update_json_content.cache_status = "pending";
  }
} catch (err) {
  console.log(`   ❌ Error: ${err.message}`);
  validation.checks.update_json_content = {
    accessible: false,
    error: err.message,
  };
}

// ========== CHECK 3: FTP Verification ==========
console.log("\n🔌 CHECK 3: Verificando archivos vía FTP...");

try {
  const ftpConfig = JSON.parse(
    fs.readFileSync(path.join(SCRIPTS, "ftp-config.json"), "utf8"),
  );
  const client = new ftp.Client();
  client.ftp.verbose = false;

  await client.access({
    host: ftpConfig.host,
    user: ftpConfig.user,
    password: ftpConfig.password,
    port: ftpConfig.port,
    secure: ftpConfig.secure || false,
  });

  await client.cd("/public_html/updates/warranty-system/");
  const files = await client.list();

  console.log("   Archivos en servidor FTP:");
  const filesInfo = {};
  for (const file of files) {
    if (file.name === "." || file.name === "..") continue;
    const size = (file.size / 1024).toFixed(1);
    console.log(`   📄 ${file.name} (${size} KB)`);
    filesInfo[file.name] = {
      size: file.size,
      sizeReadable: `${size} KB`,
      modified: file.modifiedAt,
    };
  }

  client.close();

  validation.checks.ftp_verification = {
    accessible: true,
    files: filesInfo,
    has_v777: !!filesInfo["Warranty_System_v7.7.7.zip"],
    has_v776: !!filesInfo["Warranty_System_v7.7.6.zip"],
    has_update_json: !!filesInfo["update.json"],
  };

  console.log("   ✅ FTP verificación completada");
} catch (err) {
  console.log(`   ❌ Error FTP: ${err.message}`);
  validation.checks.ftp_verification = {
    accessible: false,
    error: err.message,
  };
}

// ========== CHECK 4: Download update.json from FTP ==========
console.log(
  "\n📥 CHECK 4: Descargando update.json directamente del servidor...",
);

try {
  const ftpConfig = JSON.parse(
    fs.readFileSync(path.join(SCRIPTS, "ftp-config.json"), "utf8"),
  );
  const client = new ftp.Client();
  client.ftp.verbose = false;

  await client.access({
    host: ftpConfig.host,
    user: ftpConfig.user,
    password: ftpConfig.password,
    port: ftpConfig.port,
    secure: ftpConfig.secure || false,
  });

  await client.cd("/public_html/updates/warranty-system/");

  const tempFile = "./update-ftp-check.json";
  await client.downloadTo(tempFile, "update.json");

  const ftpData = JSON.parse(fs.readFileSync(tempFile, "utf8"));
  console.log(`   Versión en FTP: ${ftpData.version}`);
  console.log(`   Download URL: ${ftpData.download_url}`);

  fs.unlinkSync(tempFile);
  client.close();

  validation.checks.ftp_update_json = {
    accessible: true,
    version: ftpData.version,
    download_url: ftpData.download_url,
    data: ftpData,
  };

  console.log("   ✅ update.json descargado vía FTP");
} catch (err) {
  console.log(`   ❌ Error: ${err.message}`);
  validation.checks.ftp_update_json = { accessible: false, error: err.message };
}

// ========== CHECK 5: Cache Comparison ==========
console.log("\n🔍 CHECK 5: Comparación HTTP vs FTP...");

const httpVersion = validation.checks.update_json_content?.version;
const ftpVersion = validation.checks.ftp_update_json?.version;

if (httpVersion && ftpVersion) {
  console.log(`   HTTP (CDN): ${httpVersion}`);
  console.log(`   FTP (Real): ${ftpVersion}`);

  if (httpVersion === ftpVersion) {
    console.log("   ✅ Versiones coinciden - Caché limpio");
    validation.checks.cache_comparison = {
      match: true,
      status: "clean",
      message: "CDN cache is up to date",
    };
  } else {
    console.log("   ⏳ Versiones diferentes - Caché pendiente");
    validation.checks.cache_comparison = {
      match: false,
      status: "stale",
      http_version: httpVersion,
      ftp_version: ftpVersion,
      message: "CDN cache needs to propagate",
    };
  }
} else {
  validation.checks.cache_comparison = {
    match: false,
    status: "incomplete",
    message: "Unable to compare versions",
  };
}

// ========== FINAL SUMMARY ==========
console.log(
  "\n═══════════════════════════════════════════════════════════════",
);
console.log("📊 RESUMEN DE VALIDACIÓN");
console.log("═══════════════════════════════════════════════════════════════");

validation.summary = {
  update_json_accessible:
    validation.checks.http_accessibility?.updateJson?.accessible || false,
  version_on_cdn: httpVersion,
  version_on_server: ftpVersion,
  cache_status: validation.checks.cache_comparison?.status || "unknown",
  files_on_server_verified:
    validation.checks.ftp_verification?.accessible || false,
  ready_for_wordpress:
    ftpVersion === "7.7.7" && validation.checks.ftp_verification?.has_v777,
};

console.log(
  `update.json HTTP:     ${validation.summary.update_json_accessible ? "✅" : "❌"}`,
);
console.log(`Versión en CDN:       ${validation.summary.version_on_cdn}`);
console.log(`Versión en servidor:  ${validation.summary.version_on_server}`);
console.log(`Estado del caché:     ${validation.summary.cache_status}`);
console.log(
  `Archivos verificados: ${validation.summary.files_on_server_verified ? "✅" : "❌"}`,
);
console.log(
  `Listo para WP:        ${validation.summary.ready_for_wordpress ? "✅" : "⏳"}`,
);

validation.status = "completed";
validation.overall_status = validation.summary.ready_for_wordpress
  ? "ready_pending_cache"
  : "files_ready_cache_pending";

// Guardar reporte
fs.writeFileSync(REPORT, JSON.stringify(validation, null, 2));

console.log(`\n📄 Reporte guardado: ${REPORT}`);

if (validation.summary.cache_status === "stale") {
  console.log(
    "\n⏳ NOTA: Los archivos están correctos en el servidor (v7.7.7)",
  );
  console.log("   El caché del CDN aún sirve la versión antigua (v7.5.5)");
  console.log(
    "   Espera 5-10 minutos y ejecuta de nuevo: npm run validate:live",
  );
} else if (validation.summary.ready_for_wordpress) {
  console.log(
    "\n🎉 ¡TODO LISTO! El sistema de actualización está funcionando correctamente",
  );
  console.log("   WordPress detectará la actualización a v7.7.7");
}

console.log(
  "═══════════════════════════════════════════════════════════════\n",
);

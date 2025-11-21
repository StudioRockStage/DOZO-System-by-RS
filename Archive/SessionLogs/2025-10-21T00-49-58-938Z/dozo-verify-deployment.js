/*
🧩 DOZO Deployment Verifier - Verificar propagación de caché
Autor: RockStage Solutions
Ejecuta: node dozo-verify-deployment.js
*/

import fetch from "node-fetch";

const urls = {
  updateJson: "https://updates.vapedot.mx/warranty-system/update.json",
  zipFile:
    "https://updates.vapedot.mx/warranty-system/Warranty_System_v7.7.6.zip",
};

const expectedVersion = "7.7.6";

console.log("\n🔍 DOZO Deployment Verifier");
console.log("═══════════════════════════════════════════════════════════\n");

async function checkURL(url, type) {
  try {
    const res = await fetch(url, { method: "HEAD" });

    if (res.ok) {
      console.log(`✅ ${type}: Accesible (HTTP ${res.status})`);
      return true;
    } else {
      console.log(`❌ ${type}: Error HTTP ${res.status}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${type}: ${e.message}`);
    return false;
  }
}

async function checkVersion() {
  try {
    const res = await fetch(urls.updateJson);
    const data = await res.json();

    const version = data.version;
    const isCorrect = version === expectedVersion;

    console.log(`\n📄 update.json:`);
    console.log(`   Versión actual: ${version}`);
    console.log(`   Versión esperada: ${expectedVersion}`);
    console.log(`   Estado: ${isCorrect ? "✅ CORRECTO" : "⏳ Aún en caché"}`);

    if (!isCorrect) {
      console.log(`\n⏳ El caché aún no se ha propagado`);
      console.log(`   Versión antigua: ${version}`);
      console.log(`   Espera unos minutos más y vuelve a ejecutar este script`);
    } else {
      console.log(`\n🎉 ¡DEPLOYMENT COMPLETO!`);
      console.log(`   El caché se ha propagado correctamente`);
      console.log(
        `   La versión ${expectedVersion} está disponible públicamente`,
      );
    }

    return isCorrect;
  } catch (e) {
    console.log(`❌ Error al verificar versión: ${e.message}`);
    return false;
  }
}

(async () => {
  console.log("📡 Verificando accesibilidad HTTP...\n");

  const updateJsonOK = await checkURL(urls.updateJson, "update.json");
  const zipFileOK = await checkURL(urls.zipFile, "ZIP file   ");

  const versionOK = await checkVersion();

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("📊 RESUMEN");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`update.json accesible:  ${updateJsonOK ? "✅" : "❌"}`);
  console.log(`ZIP file accesible:     ${zipFileOK ? "✅" : "❌"}`);
  console.log(`Versión correcta:       ${versionOK ? "✅" : "⏳"}`);

  if (updateJsonOK && zipFileOK && versionOK) {
    console.log("\n🎊 ¡DEPLOYMENT 100% COMPLETO Y VERIFICADO!");
    console.log("\n🚀 Próximo paso:");
    console.log("   Prueba el auto-update en WordPress");
  } else if (updateJsonOK && zipFileOK && !versionOK) {
    console.log("\n⏳ Archivos accesibles pero caché no propagado");
    console.log("   Ejecuta este script nuevamente en unos minutos");
  } else {
    console.log("\n⚠️  Hay problemas de accesibilidad");
    console.log("   Revisa los logs arriba para más detalles");
  }

  console.log("═══════════════════════════════════════════════════════════\n");
})();

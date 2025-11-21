/*
🧩 DOZO FTP Credential Update & Test Helper
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Actualizar y probar credenciales FTP de forma interactiva
*/

import fs from "fs";
import path from "path";
import ftp from "basic-ftp";

const BASE = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const FTP_FILE = path.join(BASE, "Scripts", "ftp-config.json");
const REPORT = path.join(
  BASE,
  "to chat gpt/Global",
  "DOZO-FTP-Test-Report.json",
);

async function testFTPConnection(config) {
  const client = new ftp.Client(15000);
  client.ftp.verbose = true; // Enable verbose for debugging

  const results = {
    timestamp: new Date().toISOString(),
    host: config.host,
    user: config.user,
    port: config.port,
    connection_test: {},
    directory_test: {},
    upload_test: {},
  };

  console.log("\n🔍 Probando conexión FTP...");
  console.log(`📡 Host: ${config.host}:${config.port}`);
  console.log(`👤 Usuario: ${config.user}`);
  console.log(`🔒 Password: ${"*".repeat(config.password.length)}\n`);

  try {
    // Test 1: Connection
    console.log("📌 Paso 1: Conectando al servidor...");
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure || false,
    });

    const pwd = await client.pwd();
    results.connection_test = {
      success: true,
      current_directory: pwd,
      message: "✅ Conexión exitosa",
    };
    console.log(`   ✅ Conectado exitosamente`);
    console.log(`   📁 Directorio actual: ${pwd}`);

    // Test 2: Directory access
    console.log("\n📌 Paso 2: Verificando acceso al directorio destino...");
    try {
      await client.ensureDir(config.remotePath);
      await client.cd(config.remotePath);
      const targetPwd = await client.pwd();
      results.directory_test = {
        success: true,
        directory: targetPwd,
        message: "✅ Directorio accesible",
      };
      console.log(`   ✅ Acceso al directorio confirmado: ${targetPwd}`);

      // Test 3: Upload test
      console.log("\n📌 Paso 3: Probando permisos de escritura...");
      const testFileName = `dozo-test-${Date.now()}.txt`;
      const testContent = `DOZO FTP Test - ${new Date().toISOString()}`;

      fs.writeFileSync(testFileName, testContent);
      await client.uploadFrom(testFileName, testFileName);
      console.log(`   ✅ Archivo de prueba subido: ${testFileName}`);

      // Clean up
      await client.remove(testFileName);
      fs.unlinkSync(testFileName);
      console.log(`   ✅ Archivo de prueba eliminado`);

      results.upload_test = {
        success: true,
        message: "✅ Permisos de escritura confirmados",
      };
    } catch (dirErr) {
      results.directory_test = {
        success: false,
        error: dirErr.message,
        message: `⚠️ Error de acceso al directorio: ${dirErr.message}`,
      };
      console.log(`   ⚠️ Error: ${dirErr.message}`);
    }
  } catch (err) {
    results.connection_test = {
      success: false,
      error: err.message,
      error_code: err.code,
      message: `❌ Error de conexión: ${err.message}`,
    };
    console.log(`   ❌ Error: ${err.message}`);

    if (err.message.includes("530")) {
      console.log("\n💡 Sugerencias:");
      console.log("   - Verifica que el usuario y contraseña sean correctos");
      console.log(
        "   - Asegúrate de usar el usuario completo (ej: u461169968.vapedotmx)",
      );
      console.log(
        "   - Prueba acceder vía cliente FTP (FileZilla) para confirmar credenciales",
      );
    }
  } finally {
    client.close();
  }

  // Save report
  results.overall_status =
    results.connection_test.success &&
    results.directory_test?.success &&
    results.upload_test?.success
      ? "READY"
      : "FAILED";

  fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));

  console.log("\n" + "═".repeat(70));
  console.log("📊 RESUMEN DE PRUEBAS");
  console.log("═".repeat(70));
  console.log(
    `🔌 Conexión: ${results.connection_test.message || results.connection_test.error}`,
  );
  if (results.directory_test) {
    console.log(
      `📁 Directorio: ${results.directory_test.message || results.directory_test.error}`,
    );
  }
  if (results.upload_test) {
    console.log(
      `📤 Upload: ${results.upload_test.message || results.upload_test.error}`,
    );
  }
  console.log(`\n🎯 Estado Final: ${results.overall_status}`);
  console.log(`📄 Reporte guardado: ${REPORT}`);
  console.log("═".repeat(70) + "\n");

  return results.overall_status === "READY";
}

// =============================
// MAIN
// =============================
(async () => {
  console.log("\n🧪 DOZO FTP Connection Tester");
  console.log("═".repeat(70));

  if (!fs.existsSync(FTP_FILE)) {
    console.log("❌ No se encontró ftp-config.json");
    console.log(`📍 Se esperaba en: ${FTP_FILE}`);
    console.log("\n💡 Ejecuta primero: node dozo-phase11.1-ftp-setup.js");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(FTP_FILE, "utf8"));
  const success = await testFTPConnection(config);

  if (success) {
    console.log("🎉 ¡Todo listo! El sistema está READY FOR DEPLOY");
    console.log("\n🚀 Siguiente paso:");
    console.log("   npm run deploy");
    console.log("   o");
    console.log("   node dozo-phase11-remote-deploy.js");
  } else {
    console.log("⚠️  Hay problemas con la configuración FTP");
    console.log("\n🔧 Para actualizar credenciales:");
    console.log(`   1. Edita: ${FTP_FILE}`);
    console.log(
      `   2. Vuelve a ejecutar: node dozo-phase11.1-update-credentials.js`,
    );
  }

  console.log("\n");
})();

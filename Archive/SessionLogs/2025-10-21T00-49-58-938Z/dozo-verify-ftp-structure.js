/*
🔍 DOZO FTP Structure Verification
Verificar qué archivos están en el servidor y su ubicación exacta
*/

import { Client as FTPClient } from "basic-ftp";

const FTP_CONFIG = {
  host: "82.29.86.182",
  user: "u461169968",
  password: "490?v0Lin9>x8?Mz",
  port: 21,
  secure: false,
};

(async () => {
  const client = new FTPClient();
  client.ftp.verbose = true; // Activar modo verbose para debug
  client.ftp.timeout = 60000;

  try {
    console.log("🔌 Conectando al servidor FTP...\n");
    await client.access(FTP_CONFIG);

    console.log("\n✅ Conectado. Explorando estructura...\n");

    // Listar raíz
    console.log("📁 Directorio raíz:");
    const rootList = await client.list();
    rootList.forEach((f) =>
      console.log(`   ${f.type === 2 ? "📁" : "📄"} ${f.name}`),
    );

    // Navegar a public_html
    console.log("\n📁 Navegando a /public_html...");
    await client.cd("/public_html");
    const publicList = await client.list();
    publicList.forEach((f) =>
      console.log(`   ${f.type === 2 ? "📁" : "📄"} ${f.name}`),
    );

    // Navegar a updates
    console.log("\n📁 Navegando a /public_html/updates...");
    await client.cd("updates");
    const updatesList = await client.list();
    updatesList.forEach((f) =>
      console.log(`   ${f.type === 2 ? "📁" : "📄"} ${f.name}`),
    );

    // Navegar a warranty-system-rs
    console.log("\n📁 Navegando a /public_html/updates/warranty-system-rs...");
    await client.cd("warranty-system-rs");
    const warrantyList = await client.list();
    warrantyList.forEach((f) =>
      console.log(
        `   ${f.type === 2 ? "📁" : "📄"} ${f.name} (${f.size} bytes)`,
      ),
    );

    const pwd = await client.pwd();
    console.log(`\n✅ Ruta actual: ${pwd}`);

    client.close();
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    client.close();
  }
})();

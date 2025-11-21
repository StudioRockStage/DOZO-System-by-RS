/*
🧩 DOZO FTP Download Check - Verificar contenido de update.json
*/

import fs from "fs";
import ftp from "basic-ftp";

const configPath = "./Scripts/ftp-config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

async function downloadAndCheck() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log("\n📥 Descargando update.json del servidor...");
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure,
    });

    await client.cd("/public_html/updates/warranty-system/");

    const tempFile = "./update-server.json";
    await client.downloadTo(tempFile, "update.json");

    console.log("✅ Archivo descargado\n");

    const content = JSON.parse(fs.readFileSync(tempFile, "utf8"));

    console.log("📄 Contenido del update.json en servidor:");
    console.log("   Versión:", content.version);
    console.log("   Nombre:", content.name || content.slug);
    console.log("   Download URL:", content.download_url);
    console.log("   Última actualización:", content.last_updated);

    console.log("\n📄 Contenido esperado (local):");
    const local = JSON.parse(
      fs.readFileSync("./Empaquetado/Ready/update.json", "utf8"),
    );
    console.log("   Versión:", local.version);
    console.log("   Nombre:", local.name);
    console.log("   Download URL:", local.download_url);
    console.log("   Última actualización:", local.last_updated);

    if (content.version === local.version) {
      console.log("\n✅ Las versiones coinciden - El archivo es correcto");
      console.log("\n⚠️  Posible causa del problema:");
      console.log("   • Caché del CDN/Servidor");
      console.log("   • Caché del navegador");
      console.log("   • Necesita propagación (espera 5-10 min)");
    } else {
      console.log("\n⚠️  Las versiones NO coinciden");
      console.log("   El archivo en el servidor es diferente al local");
    }

    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

downloadAndCheck();

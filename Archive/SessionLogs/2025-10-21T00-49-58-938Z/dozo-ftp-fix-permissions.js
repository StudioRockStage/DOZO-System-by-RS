/*
🧩 DOZO FTP Permission Fixer
Objetivo: Asegurar que los archivos tengan permisos correctos (644)
*/

import fs from "fs";
import ftp from "basic-ftp";

const configPath = "./Scripts/ftp-config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

async function fixPermissions() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log("\n🔧 Corrigiendo permisos de archivos...");
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure,
    });

    await client.cd(config.remotePath);

    const filesToFix = ["update.json", "Warranty_System_v7.7.6.zip"];

    for (const file of filesToFix) {
      try {
        // CHMOD 644 (lectura para todos, escritura solo para owner)
        await client.send(`SITE CHMOD 644 ${file}`);
        console.log(`✅ Permisos actualizados: ${file} -> 644`);
      } catch (e) {
        console.log(`⚠️  No se pudo cambiar permisos de ${file}: ${e.message}`);
      }
    }

    console.log("\n✅ Proceso de corrección completado");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

fixPermissions();

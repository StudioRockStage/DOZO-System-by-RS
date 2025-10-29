/*
🧩 DOZO FTP File Lister - Ver archivos en directorio remoto
*/

import fs from "fs";
import ftp from "basic-ftp";

const configPath = "./Scripts/ftp-config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

async function listFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log("\n🔍 Conectando al servidor FTP...");
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure
    });

    console.log(`\n📁 Navegando a: ${config.remotePath}`);
    await client.cd(config.remotePath);
    
    console.log("\n📋 Archivos en el directorio remoto:\n");
    const list = await client.list();
    
    list.forEach(file => {
      const size = (file.size / 1024 / 1024).toFixed(2);
      const type = file.type === 1 ? "📄" : "📁";
      console.log(`${type} ${file.name.padEnd(40)} ${size.padStart(8)} MB  ${file.modifiedAt || ''}`);
    });
    
    console.log(`\n✅ Total de archivos: ${list.length}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

listFiles();


/*
🧩 DOZO FTP Explorer - Encontrar el directorio correcto
*/

import fs from "fs";
import ftp from "basic-ftp";

const configPath = "./Scripts/ftp-config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

async function explore(client, dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return;
  
  const indent = "  ".repeat(depth);
  
  try {
    await client.cd(dir);
    const list = await client.list();
    
    for (const item of list) {
      if (item.name === '.' || item.name === '..') continue;
      
      if (item.type === 2) { // Directory
        console.log(`${indent}📁 ${item.name}/`);
        
        // Buscar directorios relevantes
        if (item.name.includes('update') || item.name.includes('warranty') || 
            item.name.includes('vapedot') || item.name === 'public_html') {
          try {
            await explore(client, `${dir}/${item.name}`, depth + 1, maxDepth);
            await client.cd(dir);
          } catch (e) {
            console.log(`${indent}  ⚠️ No se puede acceder`);
          }
        }
      } else {
        // Buscar archivos update.json
        if (item.name === 'update.json' || item.name.includes('warranty') || item.name.includes('.zip')) {
          const size = (item.size / 1024).toFixed(1);
          console.log(`${indent}📄 ${item.name} (${size} KB)`);
        }
      }
    }
  } catch (e) {
    console.log(`${indent}❌ Error explorando ${dir}: ${e.message}`);
  }
}

async function findUpdateJson() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log("\n🔍 Explorando estructura FTP...\n");
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: config.secure
    });

    const pwd = await client.pwd();
    console.log(`📍 Directorio inicial: ${pwd}\n`);
    
    await explore(client, pwd, 0, 2);
    
    console.log("\n✅ Exploración completada");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

findUpdateJson();


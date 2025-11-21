/*
🧩 Prompt Maestro – DOZO Network Unlock & Verification
Ecosistema: DOZO System by RS
Objetivo: Crear configuración para habilitar conexiones externas (FTP/SFTP/HTTP) en Cursor AI
Autor: RockStage Solutions
*/

import fs from "fs";
import path from "path";
import net from "net";

const basePath = path.resolve(process.env.HOME, "Documents/DOZO System by RS");
const cursorDir = path.join(basePath, ".cursor");
const configFile = path.join(cursorDir, "config.json");
const logFile = path.join(
  basePath,
  "to chat gpt",
  "Global",
  "DOZO-Network-Report.json",
);

// Crear carpeta .cursor si no existe
if (!fs.existsSync(cursorDir)) fs.mkdirSync(cursorDir, { recursive: true });

// Crear archivo de configuración con permisos
const config = {
  network: {
    allowOutbound: true,
    enabledProtocols: ["http", "https", "ftp", "sftp"],
  },
};
fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

// Verificación de acceso FTP rápido (opcional)
const host = "ftp.vapedot.mx";
const port = 21;

function checkFTPConnection() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(4000);

    socket.on("connect", () => {
      resolve({ success: true, message: "✅ Conexión FTP alcanzable" });
      socket.destroy();
    });

    socket.on("timeout", () => {
      resolve({
        success: false,
        message: "⚠️ Timeout al intentar conectar con FTP",
      });
      socket.destroy();
    });

    socket.on("error", (err) => {
      resolve({
        success: false,
        message: `❌ Error de conexión: ${err.message}`,
      });
    });

    socket.connect(port, host);
  });
}

(async () => {
  console.log("\n🚀 DOZO Network Unlock & Verification");
  console.log("═════════════════════════════════════════════");

  const ftpCheck = await checkFTPConnection();

  const report = {
    timestamp: new Date().toISOString(),
    configFile,
    ftpCheck,
  };

  fs.writeFileSync(logFile, JSON.stringify(report, null, 2));
  console.log("✅ Archivo de configuración creado:", configFile);
  console.log("📡 Resultado FTP:", ftpCheck.message);
  console.log("🧾 Reporte guardado en:", logFile);
  console.log("\n🎉 Configuración de red completada.");
})();

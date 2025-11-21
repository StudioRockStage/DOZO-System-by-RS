/*
🧩 Prompt Maestro – DOZO FTP Validator & Fix (v7.9 Secure Edition)
Autor: RockStage Solutions
Sistema: DOZO System by RS
Objetivo:
Validar y corregir la conexión FTP para despliegues automáticos del Warranty System RS.
Guarda resultados en: /to chat gpt/Global/DOZO-FTP-Validator.json
*/

import fs from "fs";
import ftp from "basic-ftp";

const configPath = "./Scripts/ftp-config.json";
const logPath = "./to chat gpt/Global/DOZO-FTP-Validator.json";

const newConfig = {
  host: "82.29.86.182",
  user: "u461169968",
  password: ":oU33+oTQBRWFG:g",
  port: 21,
  secure: false,
  remotePath: "/public_html/updates/warranty-system/",
};

async function validateFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  const log = {
    timestamp: new Date().toISOString(),
    host: newConfig.host,
    status: "starting",
    details: [],
  };

  try {
    log.details.push("🔄 Iniciando validación de conexión FTP...");
    await client.access({
      host: newConfig.host,
      user: newConfig.user,
      password: newConfig.password,
      port: newConfig.port,
      secure: newConfig.secure,
    });

    log.details.push("✅ Conexión establecida correctamente.");
    log.details.push(`📁 Cambiando directorio a ${newConfig.remotePath} ...`);

    await client.cd(newConfig.remotePath);
    log.details.push("✅ Directorio remoto accesible.");

    const testFile = "dozo-test.txt";
    const testFilePath = `./${testFile}`;
    fs.writeFileSync(
      testFilePath,
      "DOZO FTP TEST FILE - " + new Date().toISOString(),
    );

    await client.uploadFrom(testFilePath, testFile);
    log.details.push("✅ Archivo de prueba subido correctamente.");

    await client.remove(testFile);
    log.details.push("✅ Archivo de prueba eliminado correctamente.");

    fs.unlinkSync(testFilePath);
    log.details.push("✅ Archivo temporal local eliminado.");

    log.status = "success";
    log.summary = "FTP verificado con éxito. Credenciales y permisos válidos.";
  } catch (error) {
    log.status = "error";
    log.summary = "❌ Error en la conexión FTP.";
    log.details.push(error.message);
  } finally {
    client.close();
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    console.log("📄 Log generado en:", logPath);
    console.log("🔧 Configuración FTP actualizada en:", configPath);
  }
}

validateFTP();

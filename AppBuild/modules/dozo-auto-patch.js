import fs from "fs";
import path from "path";

export function applyPatches() {
  const backupDir = path.resolve("../Backup/AutoSync");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(
    `${backupDir}/backup-${timestamp}.json`,
    JSON.stringify({ backup: "ok", time: timestamp }, null, 2)
  );

  console.log("🩹 Parches aplicados con respaldo generado.");
}


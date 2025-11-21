import { execSync } from "child_process";
import fs from "fs";

export async function buildArtifacts() {
  console.log("🏗️ Empacando plugins WordPress...");
  const wpPath = `${process.cwd()}/release/wp`;
  if (!fs.existsSync(wpPath)) fs.mkdirSync(wpPath, { recursive: true });

  // Aquí se agregarán rutas reales después
  console.log("✅ Build placeholder listo");
}

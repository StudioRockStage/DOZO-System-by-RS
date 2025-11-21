import fs from "fs";
import { hashFile } from "./dozo-hash.js";

export function generateManifest(files, version) {
  const manifest = files.map((file) => ({
    file,
    sha256: hashFile(`release/wp/${file}`),
  }));

  const final = {
    version,
    date: new Date().toISOString(),
    files: manifest,
  };

  fs.writeFileSync("release/update.json", JSON.stringify(final, null, 2));
  console.log("✅ Manifest creado");
}

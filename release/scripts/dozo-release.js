#!/usr/bin/env node
import { buildArtifacts } from "./dozo-build.js";
import { generateManifest } from "./dozo-manifest.js";
import { uploadToR2 } from "./dozo-upload.js";
import fs from "fs";

const version = process.argv[2];
if (!version) throw new Error("❌ Debes indicar versión: dozo release v1.0.0");
console.log(`🚀 Publicando versión ${version}`);

await buildArtifacts();
const wpFiles = fs.readdirSync("release/wp");

generateManifest(wpFiles, version);
await uploadToR2(wpFiles, version);

const log = JSON.parse(
  fs.readFileSync("release/ReleaseLogs.json", "utf8") || "[]",
);
log.push({ version, date: new Date().toISOString(), files: wpFiles });
fs.writeFileSync("release/ReleaseLogs.json", JSON.stringify(log, null, 2));

console.log(`🎉 Release ${version} publicado!`);
console.log(`📦 Archivos: ${wpFiles.length}`);
console.log("📍 CDN:", `https://updates.rockstage.mx/releases/${version}/`);

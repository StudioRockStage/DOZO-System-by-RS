import crypto from "crypto";
import fs from "fs";

export function hashFile(path) {
  const fileData = fs.readFileSync(path);
  return crypto.createHash("sha256").update(fileData).digest("hex");
}

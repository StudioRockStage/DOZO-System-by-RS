import fs from "fs";
import axios from "axios";

export async function uploadToR2(files, version) {
  console.log("☁️ Subiendo a Cloudflare R2...");

  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_R2_TOKEN;
  const bucket = "dozo-updates";

  for (const file of files) {
    const data = fs.readFileSync(`release/wp/${file}`);
    await axios.put(
      `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects/releases/${version}/${file}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
      },
    );
    console.log(`✅ Subido: ${file}`);
  }
}

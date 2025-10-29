import fs from "fs";

export function linkVersions() {
  const versions = {
    cursor: "2.0.0",
    claude: "2.0.0",
    chatgpt: "2.0.0",
  };
  fs.writeFileSync("./Workflow DB/Versions-Link.json", JSON.stringify(versions, null, 2));
  console.log("🔗 Versiones sincronizadas entre IA");
}




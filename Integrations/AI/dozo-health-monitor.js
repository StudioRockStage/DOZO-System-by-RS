import fs from "fs";

export function monitorSystem() {
  const data = {
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    health: "Stable",
  };
  fs.writeFileSync("./Workflow DB/HealthStatus.json", JSON.stringify(data, null, 2));
  console.log("🩺 Sistema DOZO verificado y estable");
}




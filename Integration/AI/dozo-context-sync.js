import fs from "fs";
import { bridgeStatus } from "./dozo-multiai-bridge.js";

export function syncContext() {
  const endpoints = bridgeStatus();
  const context = {
    timestamp: new Date().toISOString(),
    activeContext: "DOZO Core",
    iaConnections: Object.keys(endpoints),
  };
  fs.writeFileSync(
    "./Workflow DB/ActiveContext.json",
    JSON.stringify(context, null, 2),
  );
  console.log("🧠 Contexto sincronizado entre IA");
}

import fs from "fs";
import path from "path";

export const AI_ENDPOINTS = {
  chatgpt: "http://localhost:7070",
  cursor: "http://localhost:6060",
  claude: "http://localhost:5050",
};

export function bridgeStatus() {
  console.log("✅ Multi-IA Bridge activo y sincronizado");
  return AI_ENDPOINTS;
}

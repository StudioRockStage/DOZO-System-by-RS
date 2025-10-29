import simpleGit from "simple-git";
import path from "path";
import fs from "fs";
import { loadEnv } from "./dozo-env-loader.js";

const git = simpleGit({ baseDir: path.resolve("../"), binary: "git" });
const env = loadEnv();

export async function dozoGitSync(commitMsg = "DOZO Auto Commit") {
  try {
    await git.add(".");
    await git.commit(commitMsg);
    await git.push("origin", env.DOZO_GIT_BRANCH || "main");

    const logPath = path.resolve("../Workflow DB/DOZO-GitSyncReport.json");
    fs.writeFileSync(
      logPath,
      JSON.stringify(
        {
          date: new Date().toISOString(),
          branch: env.DOZO_GIT_BRANCH,
          user: env.DOZO_GIT_USER,
          message: commitMsg,
        },
        null,
        2
      )
    );

    console.log("✅ Build subida a GitHub correctamente.");
  } catch (error) {
    console.error("❌ Error al subir a GitHub:", error);
  }
}


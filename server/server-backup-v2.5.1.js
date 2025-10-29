import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const root = process.cwd();
const releasesPath = path.join(root, "Dashboard", "public", "releases");

// Rutas del panel
app.get("/api/releases", (req, res) => {
  const file = path.join(releasesPath, "versions.json");
  res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []);
});

app.get("/api/hashes", (req, res) => {
  const file = path.join(releasesPath, "hashes.json");
  res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {});
});

app.get("/api/logs", (req, res) => {
  const file = path.join(releasesPath, "release-logs.json");
  res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []);
});

app.use(express.static(path.join(root, "Dashboard", "public")));

const PORT = 9090;
app.listen(PORT, () => {
  console.log(`🚀 DOZO Release Dashboard corriendo en http://localhost:${PORT}`);
});



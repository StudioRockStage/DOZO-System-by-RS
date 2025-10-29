/*
🧩 DOZO Log Viewer v1.1.0 (RockStage Base Build)
Ecosistema: DOZO System by RS (v7.9.1 – Consolidated Base)
Fase: 1 de 4 – Implementación técnica base
Objetivo:
  - Crear servidor Express local para visualizar reportes DOZO.
  - Integrar búsqueda, filtros y soporte JSON/MD.
  - Dejar listo para el diseño visual (fase Claude).
*/

import fs from "fs";
import path from "path";
import express from "express";
import { marked } from "marked";

const app = express();
const PORT = 9090;

// -------- CONFIG --------
const HOME = process.env.HOME || process.env.USERPROFILE;
const baseDir = path.resolve(HOME, "Documents/DOZO System by RS");
const logsDirs = [
  path.join(baseDir, "to chat gpt", "Global"),
  path.join(baseDir, "Archive", "SessionLogs"),
  path.join(baseDir, "Workflow DB"),
];
const publicDir = path.join(baseDir, "Dashboard", "public");
fs.mkdirSync(publicDir, { recursive: true });

// -------- HTML TEMPLATE --------
const htmlTemplate = (logs) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DOZO Log Viewer – Base</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background:#f5f5f5; }
    header { 
      background: linear-gradient(135deg, #78413F 0%, #5a2f2d 100%); 
      color:#fff; 
      padding:20px 30px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    header h1 { font-size:24px; font-weight:700; margin-bottom:5px; }
    header p { font-size:14px; opacity:0.9; }
    .controls { 
      background:#fff; 
      padding:15px 30px; 
      border-bottom:1px solid #e0e0e0;
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }
    input, select { 
      padding:8px 12px; 
      border:1px solid #ccc; 
      border-radius:6px; 
      font-size:14px;
      min-width:200px;
    }
    input:focus, select:focus {
      outline:none;
      border-color:#78413F;
    }
    .stats {
      background:#fff;
      padding:15px 30px;
      border-bottom:1px solid #e0e0e0;
      display:flex;
      gap:20px;
      font-size:14px;
    }
    .stat { display:flex; align-items:center; gap:5px; }
    .stat strong { color:#78413F; }
    .grid { 
      display:grid; 
      grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); 
      gap:15px; 
      padding:20px 30px; 
    }
    .card { 
      border:1px solid #e0e0e0; 
      border-radius:10px; 
      padding:16px; 
      background:#fff; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    .card h3 { 
      font-size:15px; 
      margin-bottom:10px; 
      color:#333;
      word-break: break-word;
    }
    .card p { 
      font-size:13px; 
      margin:5px 0; 
      color:#666; 
    }
    .card a { 
      color:#78413F; 
      text-decoration:none; 
      font-weight:500;
    }
    .card a:hover { 
      text-decoration:underline; 
    }
    .badge {
      display:inline-block;
      padding:4px 10px;
      border-radius:4px;
      font-size:11px;
      font-weight:600;
      margin-top:8px;
    }
    .ok { background:#d4edda; color:#155724; }
    .warn { background:#fff3cd; color:#856404; }
    .err { background:#f8d7da; color:#721c24; }
    .json-badge { background:#e3f2fd; color:#0d47a1; }
    .md-badge { background:#f3e5f5; color:#4a148c; }
    footer {
      background:#fff;
      border-top:1px solid #e0e0e0;
      padding:15px 30px;
      text-align:center;
      font-size:13px;
      color:#666;
      margin-top:20px;
    }
  </style>
</head>
<body>
  <header>
    <h1>🧩 DOZO Log Viewer</h1>
    <p>Sistema de Visualización de Reportes – DOZO System by RockStage v7.9.1</p>
  </header>
  
  <div class="stats">
    <div class="stat">
      <strong>Total Reportes:</strong>
      <span id="totalCount">${logs.length}</span>
    </div>
    <div class="stat">
      <strong>JSON:</strong>
      <span>${logs.filter(l => l.type === 'JSON').length}</span>
    </div>
    <div class="stat">
      <strong>Markdown:</strong>
      <span>${logs.filter(l => l.type === 'Markdown').length}</span>
    </div>
    <div class="stat">
      <strong>Proyecto:</strong>
      <span>Warranty System RS v1.0.0</span>
    </div>
  </div>

  <section class="controls">
    <input 
      id="search" 
      type="text"
      placeholder="🔍 Buscar archivo o palabra clave..." 
      oninput="filterLogs()" 
    />
    <select id="typeFilter" onchange="filterLogs()">
      <option value="">Todos los tipos</option>
      <option value="JSON">JSON</option>
      <option value="Markdown">Markdown</option>
    </select>
    <select id="sortOrder" onchange="filterLogs()">
      <option value="newest">Más recientes primero</option>
      <option value="oldest">Más antiguos primero</option>
      <option value="name">Por nombre (A-Z)</option>
    </select>
  </section>
  
  <div class="grid" id="logGrid">
    ${logs.map(
      (log) => `
      <div class="card" data-type="${log.type}" data-name="${log.title.toLowerCase()}" data-date="${log.dateRaw}">
        <h3>${log.title}</h3>
        <p><strong>📅 Fecha:</strong> ${log.date}</p>
        <p><strong>📂 Ubicación:</strong> ${log.location}</p>
        <p>
          <a href="/view?file=${encodeURIComponent(log.path)}" target="_blank">
            📄 Ver contenido
          </a>
        </p>
        <span class="badge ${log.type === 'JSON' ? 'json-badge' : 'md-badge'}">${log.type}</span>
        <span class="badge ${log.status.toLowerCase()}">${log.status}</span>
      </div>`
    ).join("")}
  </div>
  
  <footer>
    <strong>DOZO System by RockStage v7.9.1</strong> – 
    Developer: StudioRockStage – 
    Proyecto: Warranty System RS – 
    Sesión: 2025-10-21/22
  </footer>
  
  <script>
    function filterLogs() {
      const term = document.getElementById('search').value.toLowerCase();
      const type = document.getElementById('typeFilter').value;
      const sort = document.getElementById('sortOrder').value;
      const cards = Array.from(document.querySelectorAll('.card'));
      
      // Filter
      cards.forEach(card => {
        const name = card.dataset.name;
        const show = (!term || name.includes(term)) && (!type || card.dataset.type === type);
        card.style.display = show ? '' : 'none';
      });
      
      // Sort
      const grid = document.getElementById('logGrid');
      const visible = cards.filter(c => c.style.display !== 'none');
      
      if (sort === 'newest') {
        visible.sort((a, b) => b.dataset.date.localeCompare(a.dataset.date));
      } else if (sort === 'oldest') {
        visible.sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
      } else if (sort === 'name') {
        visible.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
      }
      
      visible.forEach(card => grid.appendChild(card));
      
      // Update count
      document.getElementById('totalCount').textContent = visible.length;
    }
  </script>
</body>
</html>
`;

// -------- READ LOGS --------
function readLogs() {
  const logs = [];
  for (const dir of logsDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.match(/\.(json|md)$/i)) continue;
      const fullPath = path.join(dir, file);
      try {
        const stats = fs.statSync(fullPath);
        const type = file.endsWith(".json") ? "JSON" : "Markdown";
        const location = path.relative(baseDir, dir);
        logs.push({
          title: file,
          date: stats.mtime.toLocaleString('es-ES'),
          dateRaw: stats.mtime.toISOString(),
          path: fullPath,
          type,
          status: "OK",
          location
        });
      } catch (e) {
        console.error(`Error leyendo ${file}:`, e.message);
      }
    }
  }
  return logs.sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));
}

// -------- ROUTES --------
app.get("/", (req, res) => res.redirect("/logs"));

app.get("/logs", (req, res) => {
  try {
    res.send(htmlTemplate(readLogs()));
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

app.get("/view", (req, res) => {
  const file = req.query.file;
  if (!file || !fs.existsSync(file)) {
    return res.status(404).send("Archivo no encontrado");
  }
  
  try {
    const ext = path.extname(file);
    const content = fs.readFileSync(file, "utf8");
    
    if (ext === ".md") {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${path.basename(file)}</title>
  <style>
    body { 
      font-family: -apple-system, sans-serif; 
      max-width: 900px; 
      margin: 20px auto; 
      padding: 20px;
      background: #fff;
      line-height: 1.6;
    }
    h1, h2, h3 { color: #78413F; margin-top: 20px; }
    code { 
      background: #f5f5f5; 
      padding: 2px 6px; 
      border-radius: 3px; 
      font-size: 0.9em;
    }
    pre { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 6px; 
      overflow-x: auto;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 15px 0;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 10px; 
      text-align: left;
    }
    th { background: #78413F; color: #fff; }
  </style>
</head>
<body>
  ${marked.parse(content)}
  <hr style="margin-top:40px;">
  <p style="text-align:center; color:#666; font-size:13px;">
    <a href="/logs" style="color:#78413F;">← Volver a reportes</a>
  </p>
</body>
</html>`;
      res.send(html);
    } else if (ext === ".json") {
      const json = JSON.parse(content);
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${path.basename(file)}</title>
  <style>
    body { 
      font-family: 'Monaco', monospace; 
      background: #1e1e1e; 
      color: #d4d4d4;
      padding: 20px;
    }
    pre { 
      background: #252526; 
      padding: 20px; 
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    a {
      color: #E6C185;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <pre>${JSON.stringify(json, null, 2)}</pre>
  <a href="/logs">← Volver a reportes</a>
</body>
</html>`);
    } else {
      res.send(`<pre>${content}</pre>`);
    }
  } catch (e) {
    res.status(500).send(`Error leyendo archivo: ${e.message}`);
  }
});

// API endpoint para obtener logs en JSON
app.get("/api/logs", (req, res) => {
  try {
    res.json(readLogs());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -------- START SERVER --------
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(80));
  console.log('🧩 DOZO Log Viewer v1.1.0 – RockStage Base Build');
  console.log('═'.repeat(80));
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}/logs`);
  console.log(`📊 API disponible en: http://localhost:${PORT}/api/logs`);
  console.log('\n📁 Directorios monitoreados:');
  logsDirs.forEach(dir => {
    const exists = fs.existsSync(dir);
    console.log(`   ${exists ? '✓' : '✗'} ${path.relative(baseDir, dir)}`);
  });
  console.log('\n✅ Base técnica lista para diseño RockStage (fase 2).');
  console.log('💡 Presiona Ctrl+C para detener el servidor');
  console.log('═'.repeat(80) + '\n');
});


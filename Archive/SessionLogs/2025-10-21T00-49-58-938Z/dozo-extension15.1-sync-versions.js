/*
🧩 Prompt Maestro – DOZO Extension 15.1 (Changelog ⇄ Versions Sync)
Ecosistema: DOZO System by RS v7.9
Autor: RockStage Solutions
Objetivo: Sincronizar automáticamente el changelog con Versions.json para mantener un historial exacto de builds, fechas y estabilidad.
*/

import fs from 'fs';
import path from 'path';

const baseDir = path.resolve(process.env.HOME, 'Documents/DOZO System by RS/Workflow DB');
const changelogPath = path.join(path.dirname(baseDir), 'DOZO-CHANGELOG.md');
const versionsPath = path.join(baseDir, 'Versions.json');
const outputReport = path.join(path.dirname(baseDir), 'to chat gpt/Global/DOZO-VersionSync-Report.json');

(async () => {
  console.log('\n🔄 DOZO Extension 15.1 – Changelog ⇄ Versions.json Sync');
  console.log('══════════════════════════════════════════════════════════════════════════');

  if (!fs.existsSync(changelogPath)) {
    console.error('❌ No se encontró DOZO-CHANGELOG.md');
    process.exit(1);
  }

  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const versionMatch = changelog.match(/v(\d+\.\d+\.\d+)/);
  const dateMatch = changelog.match(/Fecha:\s*(\d{4}-\d{2}-\d{2})/);

  const version = versionMatch ? versionMatch[1] : '7.9';
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);

  let versionsData = { version: 'v7.9', history: [] };
  if (fs.existsSync(versionsPath)) {
    versionsData = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
    if (!versionsData.history) versionsData.history = [];
  }

  const existing = versionsData.history.find(v => v.version === version);
  if (!existing) {
    versionsData.history.push({
      version,
      date,
      status: 'certified',
      source: 'DOZO-FinalAudit-Phase15',
      synced_at: new Date().toISOString()
    });
  } else {
    existing.synced_at = new Date().toISOString();
    existing.status = 'certified';
  }

  versionsData.version = 'v' + version;
  versionsData.lastSync = new Date().toISOString();

  fs.writeFileSync(versionsPath, JSON.stringify(versionsData, null, 2));
  console.log(`✅ Versions.json actualizado con la versión ${version}`);

  const report = {
    timestamp: new Date().toISOString(),
    version,
    date,
    result: 'success',
    synced_to: versionsPath,
    changelog_found: !!changelogPath
  };

  const outDir = path.dirname(outputReport);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputReport, JSON.stringify(report, null, 2));

  console.log(`🧾 Reporte guardado en: ${outputReport}`);
  console.log('\n🎉 Sincronización completada exitosamente.');
  console.log('══════════════════════════════════════════════════════════════════════════\n');
})();


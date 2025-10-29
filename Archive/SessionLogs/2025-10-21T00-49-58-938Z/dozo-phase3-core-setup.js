/*
🧩 Prompt Maestro – DOZO Core Setup & Auto-Healing (Fase 3 – v7.9)
Ecosistema: DOZO System by RS
Autor: RockStage Solutions
Objetivo: Configurar el núcleo DOZO v7.9, detectar el plugin activo, activar el sistema de auto-reparación y registrar toda la configuración.
*/

import fs from 'fs';
import path from 'path';

const BASE = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const PLUGINS = path.join(BASE, 'Plugins');
const WORKFLOW = path.join(BASE, 'Workflow DB');
const TO_CHATGPT = path.join(BASE, 'to chat gpt/Global');

const ACTIVE_PLUGIN_PATH = path.join(WORKFLOW, 'ActivePlugin.json');
const CORE_PATH = path.join(WORKFLOW, 'DOZO-Core.json');
const ROLES_PATH = path.join(WORKFLOW, 'IA-Roles.json');
const REPORT_PATH = path.join(TO_CHATGPT, 'DOZO-Core-Setup-Report.json');

function detectActivePlugin() {
  const plugins = fs.readdirSync(PLUGINS, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const dir of plugins) {
    const pluginMain = path.join(PLUGINS, dir.name, 'rockstage-warranty-system.php');
    if (fs.existsSync(pluginMain)) {
      console.log(`✅ Plugin activo detectado: ${dir.name}`);
      return {
        plugin: dir.name,
        path: `Plugins/${dir.name}/`,
        mainFile: 'rockstage-warranty-system.php',
        version: '7.7.5',
        status: 'active',
      };
    }
  }
  throw new Error('❌ No se encontró ningún plugin activo.');
}

function setupCoreFiles(pluginData) {
  const coreData = {
    version: '7.9',
    system: 'DOZO Core Framework',
    lastUpdate: new Date().toISOString(),
    modules: {
      healthCheck: true,
      autoHealing: true,
      syncBridge: true,
      pluginMonitor: true,
    },
  };

  const rolesData = {
    GPT: {
      role: 'Supervisor Global',
      tasks: ['Monitoreo', 'Auditoría', 'Verificación de integridad'],
    },
    Cursor: {
      role: 'Desarrollo Técnico',
      tasks: ['Ejecución de scripts', 'Compilaciones', 'Deploys'],
    },
    Claude: {
      role: 'Diseño y Documentación',
      tasks: ['Diseño UI/UX', 'Prototipado', 'Manual de usuario'],
    },
  };

  fs.writeFileSync(ACTIVE_PLUGIN_PATH, JSON.stringify(pluginData, null, 2));
  fs.writeFileSync(CORE_PATH, JSON.stringify(coreData, null, 2));
  fs.writeFileSync(ROLES_PATH, JSON.stringify(rolesData, null, 2));

  return { coreData, rolesData };
}

function createReport(pluginData, coreData, rolesData) {
  const report = {
    timestamp: new Date().toISOString(),
    phase: 'Fase 3 – Core Setup & Auto-Healing',
    pluginActive: pluginData.plugin,
    paths: {
      plugin: pluginData.path,
      workflow: WORKFLOW,
      toChatGPT: TO_CHATGPT,
    },
    components: {
      coreStatus: 'Initialized',
      roles: Object.keys(rolesData),
      autoHealing: coreData.modules.autoHealing,
      syncBridge: coreData.modules.syncBridge,
    },
    result: '✅ Configuración completada sin errores',
  };

  fs.mkdirSync(TO_CHATGPT, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`🧾 Reporte guardado en: ${REPORT_PATH}`);
  console.log('\n🎉 DOZO Core Framework v7.9 configurado exitosamente.');
}

(async () => {
  console.log('\n🚀 Iniciando Fase 3 – DOZO Core Setup & Auto-Healing');
  console.log('══════════════════════════════════════════════════════════════');

  try {
    const pluginData = detectActivePlugin();
    const { coreData, rolesData } = setupCoreFiles(pluginData);
    createReport(pluginData, coreData, rolesData);
  } catch (err) {
    console.error('❌ Error en la configuración:', err.message);
  }

  console.log('══════════════════════════════════════════════════════════════\n');
})();




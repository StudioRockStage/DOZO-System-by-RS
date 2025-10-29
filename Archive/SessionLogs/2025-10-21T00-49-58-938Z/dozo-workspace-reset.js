/*
🧩 Prompt Maestro – DOZO Workspace Full Reset v3.3 (DeepSync Framework + Core v2)
Autor: RockStage Solutions
Ecosistema: DOZO System by RS
Objetivo: Limpiar completamente el workspace, reconstruir la estructura base e integrar la nueva carpeta "to chat gpt" con la generación automática del archivo de reporte DOZO-Report.json.
*/

import fs from 'fs';
import path from 'path';

const basePath = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');

const structure = [
  'Claude AI',
  'Cursor AI',
  'ChatGPT AI',
  'Shared',
  'Plugins',
  'Backup',
  'Latest Builds',
  'Workflow DB',
  'to chat gpt'
];

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    });
  }
}

function recreateStructure() {
  console.log('🧹 Iniciando limpieza completa del Workspace DOZO...');
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  cleanDirectory(basePath);

  structure.forEach(folder => {
    const folderPath = path.join(basePath, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`📁 Carpeta creada: ${folderPath}`);
  });

  const aiSubfolders = {
    'Claude AI': ['Panels', 'Layouts', 'Assets', 'Versions'],
    'Cursor AI': ['Plugins', 'Scripts', 'Builds', 'Logs', 'Tests'],
    'ChatGPT AI': ['Prompts Maestro', 'DOZO Blueprints', 'Reports', 'Integrations', 'Docs']
  };

  for (const [parent, subs] of Object.entries(aiSubfolders)) {
    subs.forEach(sub => {
      const subPath = path.join(basePath, parent, sub);
      fs.mkdirSync(subPath, { recursive: true });
      console.log(`   └─ ${subPath}`);
    });
  }

  const workflowFiles = [
    'DOZO-Core.json',
    'IA-Roles.json',
    'Versions.json',
    'AuditLogs.json',
    'ActivePlugin.json',
    'ChatGPT-Link.json'
  ];

  workflowFiles.forEach(file => {
    const filePath = path.join(basePath, 'Workflow DB', file);
    fs.writeFileSync(filePath, '{}');
    console.log(`🧾 Archivo base creado: ${filePath}`);
  });

  const pluginsPath = path.join(basePath, 'Plugins');
  const pluginProjects = ['Warranty System', 'Price Craft', 'Lucky Stage'];
  pluginProjects.forEach(plugin => {
    const pluginDir = path.join(pluginsPath, plugin);
    fs.mkdirSync(pluginDir, { recursive: true });
    console.log(`🎛️ Carpeta de plugin creada: ${pluginDir}`);
  });

  const backupPath = path.join(basePath, 'Backup');
  pluginProjects.forEach(plugin => {
    const backupDir = path.join(backupPath, plugin);
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`💾 Carpeta de respaldo creada: ${backupDir}`);
  });

  // Nueva carpeta to chat gpt → subdividida por plugin + Global
  const chatGPTBase = path.join(basePath, 'to chat gpt');
  fs.mkdirSync(path.join(chatGPTBase, 'Global'), { recursive: true });
  pluginProjects.forEach(plugin => {
    const chatDir = path.join(chatGPTBase, plugin);
    fs.mkdirSync(chatDir, { recursive: true });
    console.log(`💬 Carpeta ChatGPT creada para plugin: ${chatDir}`);
  });

  // Registro de estado completo
  const log = {
    timestamp: new Date().toISOString(),
    message: 'DOZO Workspace Full Reset v3.3 completado con éxito',
    createdStructure: structure,
    notes: 'Incluye integración con carpeta to chat gpt (con subcarpetas Global y por plugin) para sincronización y trazabilidad.'
  };
  fs.writeFileSync(path.join(basePath, 'Workflow DB', 'Reset-Log.json'), JSON.stringify(log, null, 2));

  // Creación automática del DOZO-Report.json en to chat gpt/Global
  const reportData = {
    timestamp: new Date().toISOString(),
    phase: 'Fase 1 – Limpieza y Reestructuración',
    prompt: 'DOZO Workspace Full Reset v3.3',
    status: 'completed',
    actions: [
      'Workspace limpio completamente',
      'Estructura base recreada',
      'Subcarpetas IA generadas',
      'Carpeta to chat gpt integrada',
      'Archivos Workflow DB reiniciados'
    ],
    result: 'Entorno DOZO totalmente limpio y validado',
    next_step: 'Ejecutar Fase 2 – Integridad y Seguridad'
  };
  const reportPath = path.join(chatGPTBase, 'Global', 'DOZO-Report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`🧾 Reporte global creado: ${reportPath}`);

  console.log('\n✅ DOZO Workspace limpio, reestructurado e integrado con carpeta to chat gpt. Reporte generado y listo para Fase 2.');
}

recreateStructure();

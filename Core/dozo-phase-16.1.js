/*
═══════════════════════════════════════════════════════════════
🧩 DOZO Phase 16.1 – GitHub Live Sync Deployment v2.6.1
Autor: RockStage Solutions
Descripción:
Sincroniza automáticamente el proyecto DOZO System by RS con el
repositorio remoto de GitHub (StudioRockStage) y configura la rama principal.
═══════════════════════════════════════════════════════════════
*/

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('═══════════════════════════════════════════════════════');
console.log('🧩 FASE 16.1 – GitHub Live Sync Deployment v2.6.1');
console.log('═══════════════════════════════════════════════════════');

const repoName = 'DOZO-System-by-RS';
const repoUrl = `https://github.com/StudioRockStage/${repoName}.git`;
const root = process.cwd();

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...options });
  } catch {
    console.error(`❌ Error al ejecutar: ${cmd}`);
    process.exit(1);
  }
}

try {
  console.log('🔍 Verificando autenticación con GitHub CLI...');
  const ghStatus = run('gh auth status');
  console.log('✅ Autenticación confirmada:\n' + ghStatus);

  console.log('🔍 Comprobando existencia del repositorio remoto...');
  const repos = run('gh repo list StudioRockStage --json name');
  const repoExists = repos.includes(repoName);

  if (!repoExists) {
    console.log(`🆕 Repositorio ${repoName} no existe. Creando...`);
    run(`gh repo create StudioRockStage/${repoName} --public --source=. --remote=origin --push`);
    console.log(`✅ Repositorio ${repoName} creado exitosamente.`);
  } else {
    console.log(`✅ Repositorio ${repoName} ya existe. Continuando...`);
  }

  console.log('🔧 Inicializando repositorio Git local...');
  if (!fs.existsSync(path.join(root, '.git'))) {
    run('git init');
  }

  console.log('🔄 Añadiendo archivos al repositorio...');
  run('git add .');
  run(`git commit -m "🚀 DOZO Phase 16.1 – Initial GitHub Live Sync"`);

  console.log('🔁 Configurando rama principal y remoto...');
  try {
    run('git branch -M main');
  } catch {
    // Ignorar si la rama ya es main
  }
  try {
    run('git remote remove origin');
  } catch {
    // Ignorar si el remoto no existe
  }
  run(`git remote add origin ${repoUrl}`);

  console.log('📡 Subiendo al repositorio remoto...');
  run('git push -u origin main');

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ FASE 16.1 COMPLETADA – Repositorio sincronizado con GitHub');
  console.log(`📂 Repositorio: ${repoUrl}`);
  console.log('═══════════════════════════════════════════════════════');
} catch {
  console.error('❌ Error general durante la sincronización');
  process.exit(1);
}

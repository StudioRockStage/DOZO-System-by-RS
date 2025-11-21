/*
═══════════════════════════════════════════════════════════════
🧩 DOZO Phase 16.2 – AppSync Telemetry Bridge v2.6.2
Autor: RockStage Solutions
Descripción:
Conecta el ecosistema DOZO con GitHub para emitir telemetría en
tiempo real sobre builds, pushes, releases y estados de las fases.
═══════════════════════════════════════════════════════════════
*/

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = process.cwd();

console.log(
  chalk.cyan('═══════════════════════════════════════════════════════')
);
console.log(chalk.bold.white('🧩 FASE 16.2 – AppSync Telemetry Bridge v2.6.2'));
console.log(
  chalk.cyan('═══════════════════════════════════════════════════════')
);

const workflowDir = path.join(root, 'Workflow DB');
if (!fs.existsSync(workflowDir)) {
  fs.mkdirSync(workflowDir, { recursive: true });
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    return null;
  }
}

async function main() {
  const spinner = ora(
    chalk.yellow('🔍 Obteniendo información del repositorio...')
  ).start();

  const pkgPath = path.join(root, 'package.json');
  let pkg = {
    name: 'dozo-system',
    version: '2.6.2',
    author: 'RockStage Solutions',
  };

  if (fs.existsSync(pkgPath)) {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  }

  const user = process.env.USER || run('whoami') || 'unknown';
  const lastCommit = run('git rev-parse --short HEAD') || 'N/A';
  const branch = run('git rev-parse --abbrev-ref HEAD') || 'main';
  const timestamp = new Date().toISOString();

  spinner.succeed(chalk.green('✅ Información del repositorio obtenida'));

  const telemetryData = {
    timestamp,
    user,
    repo: 'StudioRockStage/DOZO-System-by-RS',
    branch,
    lastCommit,
    version: pkg.version,
    status: 'SYNC_OK',
    notes: 'Phase 16.2 – Telemetry Bridge executed successfully',
  };

  const telemetryPath = path.join(workflowDir, 'AppSyncTelemetry.json');
  fs.writeFileSync(telemetryPath, JSON.stringify(telemetryData, null, 2));
  console.log(chalk.blue(`📁 Telemetría guardada en: ${telemetryPath}`));

  const spinner2 = ora(
    chalk.yellow('📡 Sincronizando con GitHub API...')
  ).start();

  try {
    const response = await fetch(
      'https://api.github.com/repos/StudioRockStage/DOZO-System-by-RS/commits?per_page=3',
      {
        headers: {
          'User-Agent': 'DOZO-AppSync-Telemetry',
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.ok) {
      const commits = await response.json();
      const commitsPath = path.join(workflowDir, 'AppSyncCommits.json');
      fs.writeFileSync(commitsPath, JSON.stringify(commits, null, 2));
      spinner2.succeed(chalk.green('✅ Sincronización con GitHub completada'));
      console.log(chalk.blue(`📁 Commits guardados en: ${commitsPath}`));

      const reportPath = path.join(workflowDir, 'Phase16.2-Report.md');
      const commitMessages = commits
        .map(c => `- ${c.commit.message.split('\n')[0]}`)
        .join('\n');

      const reportContent = `# 🧩 DOZO System – Phase 16.2 Report
**Fecha:** ${new Date().toLocaleDateString('es-ES')}  
**Versión:** ${pkg.version}  
**Repositorio:** StudioRockStage/DOZO-System-by-RS  
**Último commit:** ${lastCommit}  
**Estado:** ✅ Sincronización completada  

### Últimos commits:
${commitMessages}

---

**Generado por:** AppSync Telemetry Bridge v2.6.2  
**Usuario:** ${user}  
**Timestamp:** ${timestamp}
`;

      fs.writeFileSync(reportPath, reportContent);
      console.log(chalk.blue(`📄 Reporte generado: ${reportPath}`));
    } else {
      spinner2.warn(
        chalk.yellow(`⚠️  GitHub API respondió con status ${response.status}`)
      );
      console.log(chalk.gray('   Continuando sin datos de commits remotos...'));
    }
  } catch (err) {
    spinner2.fail(chalk.red('❌ Error al conectar con GitHub API'));
    console.log(chalk.gray(`   Motivo: ${err.message}`));
  }

  console.log(
    chalk.cyan('═══════════════════════════════════════════════════════')
  );
  console.log(chalk.green.bold('✅ AppSync Telemetry Bridge completado'));
  console.log(
    chalk.cyan('═══════════════════════════════════════════════════════')
  );
  console.log(chalk.white(`📊 Telemetría: ${telemetryPath}`));
  console.log(chalk.white(`📡 Estado: ${telemetryData.status}`));
  console.log(
    chalk.white(`🔗 Repositorio: https://github.com/${telemetryData.repo}`)
  );
  console.log(
    chalk.cyan('═══════════════════════════════════════════════════════')
  );
}

main().catch(err => {
  console.error(chalk.red('❌ Error fatal en AppSync Telemetry:'), err.message);
  process.exit(1);
});

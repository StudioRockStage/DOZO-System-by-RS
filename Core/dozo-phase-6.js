import { syncContext } from './Integrations/AI/dozo-context-sync.js';
import { linkVersions } from './Integrations/AI/dozo-version-linker.js';
import { syncReports } from './Integrations/AI/dozo-report-sync.js';
import { monitorSystem } from './Integrations/AI/dozo-health-monitor.js';

console.log('🚀 Iniciando FASE 6 – Smart Sync & Multi-IA Integration');
syncContext();
linkVersions();
syncReports();
monitorSystem();
console.log('✅ FASE 6 completada correctamente');

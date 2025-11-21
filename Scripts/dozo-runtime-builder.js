import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('⚙️  Iniciando Runtime Build v2.0.0');

try {
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🔨 Construyendo aplicación Electron...');
  execSync('npm run build', { stdio: 'inherit' });

  const distPath = path.resolve('./DistributionBuild');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build generado correctamente en DistributionBuild/');

    // List generated files
    const files = fs.readdirSync(distPath);
    console.log('\n📁 Archivos generados:');
    files.forEach(file => {
      const stats = fs.statSync(path.join(distPath, file));
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${file} (${sizeMB} MB)`);
    });
  } else {
    console.error('❌ Error: no se generó la carpeta DistributionBuild.');
  }
} catch {
  console.error('❌ Error en el proceso de build');
}

/*
🧩 DOZO Integration – SmartCategoryPanel v1.1.0 (Warranty System RS)
Ecosistema: DOZO System v7.9
Autor: RockStage Solutions
Objetivo: Convertir el archivo SmartCategoryPanel_Approved_DOZO_v1.1.0.html en un panel funcional mixto (admin + frontend) dentro del plugin Warranty System RS.
*/

import fs from 'fs';
import path from 'path';

const baseDir = path.resolve(process.env.HOME, 'Documents/DOZO System by RS');
const pluginDir = path.join(baseDir, 'Plugins', 'Warranty System');
const htmlPath = path.join(baseDir, 'Claude AI', 'DISEÑOS Warranty System RS', 'SmartCategoryPanel_Approved_DOZO_v1.1.0.html');
const adminTarget = path.join(pluginDir, 'admin', 'smart-category-panel.php');
const publicTarget = path.join(pluginDir, 'public', 'smart-category-panel.php');
const assetsDir = path.join(pluginDir, 'assets', 'smart-category-panel');
const logPath = path.join(baseDir, 'to chat gpt', 'Global', 'DOZO-PanelIntegration-Report.json');

(async () => {
  console.log('\n🔧 Iniciando integración del SmartCategoryPanel v1.1.0 en Warranty System RS...');
  console.log('══════════════════════════════════════════════════════════════════════');

  // Validar existencia del archivo HTML aprobado
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ No se encontró el archivo HTML aprobado en: ${htmlPath}`);
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Generar estructura base de archivos
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const phpWrapper = `<?php
/**
 * Smart Category Panel v1.1.0
 * Integración DOZO – RockStage Warranty System
 * Autor: RockStage Solutions
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function rs_warranty_render_smart_category_panel() { ?>
${htmlContent}
<?php }
add_action('admin_menu', function() {
  add_menu_page('Smart Category Panel', 'Smart Category Panel', 'manage_woocommerce', 'rs-smart-category', 'rs_warranty_render_smart_category_panel', 'dashicons-screenoptions', 6);
});
add_shortcode('rs_smart_category_panel', 'rs_warranty_render_smart_category_panel');
?>`;

  // Guardar versión admin y frontend
  fs.writeFileSync(adminTarget, phpWrapper);
  fs.writeFileSync(publicTarget, phpWrapper);

  // Registrar integración en el log DOZO
  const log = {
    action: 'Panel Integration',
    status: 'success',
    panel: 'SmartCategoryPanel v1.1.0',
    targets: { admin: adminTarget, public: publicTarget },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  console.log('✅ SmartCategoryPanel integrado correctamente.');
  console.log('📁 Archivos creados en:');
  console.log('   →', adminTarget);
  console.log('   →', publicTarget);
  console.log('🧾 Log global guardado en:', logPath);
  console.log('══════════════════════════════════════════════════════════════════════\n');
})();


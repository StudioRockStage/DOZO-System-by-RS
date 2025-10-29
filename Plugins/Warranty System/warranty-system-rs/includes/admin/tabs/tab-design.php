<?php
/**
 * Design Tab
 * DOZO v7.2.2 - Design Panel Integration
 */

if (!defined('ABSPATH')) exit;

// DOZO v7.2.2: Include design panel from Admin Panels directory
$panel_path = plugin_dir_path(__FILE__) . '../../../Admin Panels/panel-design-settings/panel-design-settings.html';

if (file_exists($panel_path)) {
    include $panel_path;
    error_log('✅ DOZO v7.2.2: Design panel loaded from Admin Panels/');
} else {
    // Fallback to templates directory
    $fallback_path = plugin_dir_path(__FILE__) . '../../../templates/admin/panels/design/panel-design-settings.html';
    
    if (file_exists($fallback_path)) {
        include $fallback_path;
        error_log('✅ DOZO v7.2.2: Design panel loaded from templates/ (fallback)');
    } else {
        ?>
        <div class="rs-settings-card">
            <div style="text-align: center; padding: 60px 20px;">
                <p style="color: #6b7280;">⚠️ Panel de diseño no encontrado. Ejecuta DOZO Sync.</p>
            </div>
        </div>
        <?php
        error_log('⚠️ DOZO v7.2.2: Design panel not found in any location');
    }
}


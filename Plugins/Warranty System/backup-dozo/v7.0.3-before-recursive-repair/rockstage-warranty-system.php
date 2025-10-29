<?php
/**
 * Plugin Name: RockStage Warranty System
 * Plugin URI: https://rockstage.com
 * Description: Sistema completo de gestión de garantías para RockStage con verificación automática, panel de administración premium y notificaciones por email.
 * Version: 7.0.3
 * Author: RockStage
 * Author URI: https://rockstage.com
 * Text Domain: rockstage-warranty
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * 
 * @package RockStage_Warranty_System
 * @version 7.0.3
 */

// Si este archivo es llamado directamente, abortar.
if (!defined('WPINC')) {
    die('Acceso directo no permitido.');
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CONSTANTES DEL PLUGIN
 * ═══════════════════════════════════════════════════════════════
 */
define('RS_WARRANTY_VERSION', '7.0.3');
define('RS_DOZO_VERSION', '7.0.3'); // DOZO Deep Audit version - Core Structure Repair & Class Integrity
define('RS_DOZO_COMPATIBLE_SINCE', '4.1.0'); // Backward compatibility
define('RS_CLAUDE_TEMPLATES_PATH', dirname(ABSPATH) . '/Claude AI/DISEÑOS Warranty System by RockStage/Shortcodes/');
define('RS_CLAUDE_DESIGN_PATH', dirname(ABSPATH) . '/Claude AI/DISEÑOS Warranty System by RockStage/');
define('RS_WARRANTY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RS_WARRANTY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RS_WARRANTY_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('RS_WARRANTY_PLUGIN_FILE', __FILE__);

// Rutas de directorios
define('RS_WARRANTY_INCLUDES_DIR', RS_WARRANTY_PLUGIN_DIR . 'includes/');
define('RS_WARRANTY_ADMIN_DIR', RS_WARRANTY_PLUGIN_DIR . 'admin/');
define('RS_WARRANTY_PUBLIC_DIR', RS_WARRANTY_PLUGIN_DIR . 'public/');
define('RS_WARRANTY_TEMPLATES_DIR', RS_WARRANTY_PLUGIN_DIR . 'templates/');
define('RS_WARRANTY_ASSETS_DIR', RS_WARRANTY_PLUGIN_DIR . 'assets/');

// URLs de directorios
define('RS_WARRANTY_ADMIN_URL', RS_WARRANTY_PLUGIN_URL . 'admin/');
define('RS_WARRANTY_PUBLIC_URL', RS_WARRANTY_PLUGIN_URL . 'public/');
define('RS_WARRANTY_ASSETS_URL', RS_WARRANTY_PLUGIN_URL . 'assets/');

/**
 * ═══════════════════════════════════════════════════════════════
 * VERIFICACIÓN DE DEPENDENCIAS
 * ═══════════════════════════════════════════════════════════════
 */
function rs_warranty_check_dependencies() {
    // Verificar si WooCommerce está activo
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', 'rs_warranty_woocommerce_missing_notice');
        deactivate_plugins(plugin_basename(__FILE__));
        return false;
    }
    
    // Verificar versión de PHP
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        add_action('admin_notices', 'rs_warranty_php_version_notice');
        deactivate_plugins(plugin_basename(__FILE__));
        return false;
    }
    
    return true;
}

/**
 * Aviso: WooCommerce no está instalado
 */
function rs_warranty_woocommerce_missing_notice() {
    ?>
    <div class="notice notice-error">
        <p><strong>RockStage Warranty System</strong> requiere que WooCommerce esté instalado y activado.</p>
    </div>
    <?php
}

/**
 * Aviso: Versión de PHP insuficiente
 */
function rs_warranty_php_version_notice() {
    ?>
    <div class="notice notice-error">
        <p><strong>RockStage Warranty System</strong> requiere PHP 7.4 o superior. Tu versión actual es <?php echo esc_html(PHP_VERSION); ?>.</p>
    </div>
    <?php
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DECLARAR COMPATIBILIDAD CON WOOCOMMERCE HPOS
 * ═══════════════════════════════════════════════════════════════
 */
add_action('before_woocommerce_init', function() {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
});

/**
 * ═══════════════════════════════════════════════════════════════
 * DOZO v7.0.3: SYNTAX SHIELD, STRUCTURE CHECK & CORE REPAIR
 * ═══════════════════════════════════════════════════════════════
 */
require_once RS_WARRANTY_PLUGIN_DIR . 'tools/dozo-syntax-shield.php';
require_once RS_WARRANTY_PLUGIN_DIR . 'tools/dozo-core-repair.php';

/**
 * DOZO v7.0.2: Safe translation loading (init-safe)
 */
add_action('init', function() {
    load_plugin_textdomain(
        'rockstage-warranty',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}, 5);

/**
 * ═══════════════════════════════════════════════════════════════
 * CARGAR ARCHIVOS DEL PLUGIN
 * ═══════════════════════════════════════════════════════════════
 */
function rs_warranty_load_plugin() {
    // DOZO v7.0.2: Skip loading if safe mode is active due to syntax errors
    if (defined('DOZO_SAFE_MODE') && DOZO_SAFE_MODE === true) {
        error_log('DOZO v7.0.2: Plugin loading skipped - Safe mode active');
        return;
    }
    
    // Verificar dependencias
    if (!rs_warranty_check_dependencies()) {
        return;
    }
    
    // Cargar clases principales
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-database.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-settings.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-email.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-rma.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-core.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-admin.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-frontend.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-product-linker.php'; // DOZO v3.6
    
    // Inicializar el plugin
    RS_Warranty_Core::get_instance();
    RS_Warranty_Admin::get_instance();
    RS_Warranty_Frontend::get_instance();
    RS_Warranty_Product_Linker::get_instance(); // DOZO v3.6
    
    // Cargar herramientas de diagnóstico (solo en admin)
    if (is_admin()) {
        require_once RS_WARRANTY_PLUGIN_DIR . 'tools/diagnostics.php';
        require_once RS_WARRANTY_PLUGIN_DIR . 'tools/nonce-validator.php'; // DOZO v3.9
        require_once RS_WARRANTY_PLUGIN_DIR . 'includes/class-dozo-reaper-cleaner.php'; // DOZO v7.0
        require_once RS_WARRANTY_PLUGIN_DIR . 'includes/class-dozo-knowledge-base.php'; // DOZO v7.0
    }
    
    // DOZO v5.3: Claude Style Manager (frontend)
    require_once RS_WARRANTY_PLUGIN_DIR . 'includes/class-claude-style-manager.php';
    
    // DOZO v6.1: Claude HTML Integration (shortcode templates)
    require_once RS_WARRANTY_PLUGIN_DIR . 'includes/class-claude-html-integration.php';
}
add_action('plugins_loaded', 'rs_warranty_load_plugin');

/**
 * ═══════════════════════════════════════════════════════════════
 * ACTIVACIÓN DEL PLUGIN
 * ═══════════════════════════════════════════════════════════════
 */
function rs_warranty_activate() {
    // Verificar dependencias antes de activar
    if (!rs_warranty_check_dependencies()) {
        return;
    }
    
    // Cargar clase de base de datos
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-database.php';
    require_once RS_WARRANTY_INCLUDES_DIR . 'class-warranty-settings.php';
    
    // Crear tablas
    $db = RS_Warranty_Database::get_instance();
    $db->create_tables();
    
    // Configurar opciones por defecto
    $settings = RS_Warranty_Settings::get_instance();
    $settings->set_default_options();
    
    // Crear directorio de uploads
    $upload_dir = wp_upload_dir();
    $warranty_dir = $upload_dir['basedir'] . '/rockstage-warranties';
    
    if (!file_exists($warranty_dir)) {
        wp_mkdir_p($warranty_dir);
        
        // Crear archivo .htaccess para proteger archivos
        $htaccess_content = "Options -Indexes\n<Files ~ \"\\.(jpg|jpeg|png|gif|mp4|mov|avi)$\">\n    Order allow,deny\n    Allow from all\n</Files>";
        file_put_contents($warranty_dir . '/.htaccess', $htaccess_content);
    }
    
    // Programar cron para actualizar días restantes
    if (!wp_next_scheduled('rs_warranty_daily_update')) {
        wp_schedule_event(time(), 'daily', 'rs_warranty_daily_update');
    }
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Marcar como activado
    add_option('rs_warranty_activated', time());
}
register_activation_hook(__FILE__, 'rs_warranty_activate');

/**
 * ═══════════════════════════════════════════════════════════════
 * DESACTIVACIÓN DEL PLUGIN
 * ═══════════════════════════════════════════════════════════════
 */
function rs_warranty_deactivate() {
    // Limpiar cron jobs
    $timestamp = wp_next_scheduled('rs_warranty_daily_update');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'rs_warranty_daily_update');
    }
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'rs_warranty_deactivate');

/**
 * ═══════════════════════════════════════════════════════════════
 * LINKS EN LA PÁGINA DE PLUGINS
 * ═══════════════════════════════════════════════════════════════
 */
function rs_warranty_plugin_action_links($links) {
    $settings_link = '<a href="admin.php?page=rockstage-warranty-settings">Configuración</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'rs_warranty_plugin_action_links');

/**
 * ═══════════════════════════════════════════════════════════════
 * FUNCIONES HELPER GLOBALES
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Obtener configuración del plugin
 */
function rs_get_warranty_option($key, $default = '') {
    return get_option('rs_warranty_' . $key, $default);
}

/**
 * Guardar configuración del plugin
 */
function rs_update_warranty_option($key, $value) {
    return update_option('rs_warranty_' . $key, $value);
}

/**
 * Formatear fecha para mostrar
 */
function rs_format_warranty_date($date) {
    return date_i18n(get_option('date_format'), strtotime($date));
}

/**
 * Formatear precio con símbolo de moneda
 */
function rs_format_warranty_price($price) {
    return wc_price($price);
}

/**
 * Obtener estado en español
 */
function rs_get_warranty_status_label($status) {
    $statuses = array(
        'pending' => 'Pendiente',
        'processing' => 'En Proceso',
        'approved' => 'Aprobada',
        'rejected' => 'Rechazada',
        'completed' => 'Completada'
    );
    
    return isset($statuses[$status]) ? $statuses[$status] : $status;
}

/**
 * Obtener color del estado
 */
function rs_get_warranty_status_color($status) {
    $colors = array(
        'pending' => '#f59e0b',
        'processing' => '#3b82f6',
        'approved' => '#10b981',
        'rejected' => '#ef4444',
        'completed' => '#6b7280'
    );
    
    return isset($colors[$status]) ? $colors[$status] : '#6b7280';
}

/**
 * Obtener prioridad en español
 */
function rs_get_warranty_priority_label($priority) {
    $priorities = array(
        'low' => 'Baja',
        'normal' => 'Normal',
        'high' => 'Alta',
        'urgent' => 'Urgente'
    );
    
    return isset($priorities[$priority]) ? $priorities[$priority] : $priority;
}

/**
 * Sanitizar número de pedido
 */
function rs_sanitize_order_number($order_number) {
    return absint(str_replace('#', '', $order_number));
}


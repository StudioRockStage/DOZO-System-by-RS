<?php
/**
 * Warranty System - Autodiagnóstico DOZO
 * 
 * Sistema de verificación que inspecciona la arquitectura, hooks, nonces,
 * paridad UI con HTML, accesibilidad y cron, generando un reporte completo
 * de cumplimiento DOZO.
 */

defined('ABSPATH') || exit;

class RS_Warranty_Diagnostics {
    
    private $results = array();
    private $total_tests = 0;
    private $passed_tests = 0;
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_diagnostics_menu'), 99);
    }
    
    public function add_diagnostics_menu() {
        add_submenu_page(
            'rs-warranty',
            'Autodiagnóstico DOZO',
            '<span style="color:#10b981;">⚡ Diagnóstico</span>',
            'manage_woocommerce',
            'rs-warranty-diagnostics',
            array($this, 'render_diagnostics_page')
        );
    }
    
    public function render_diagnostics_page() {
        ?>
        <div class="wrap rs-diagnostics">
            <h1>🔍 Autodiagnóstico DOZO - Warranty System</h1>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 32px;">
                Sistema de verificación automática de cumplimiento DOZO (Visual + Funcional)
            </p>
            
            <div class="rs-diag-actions" style="margin-bottom: 24px;">
                <button type="button" class="rs-btn rs-btn-primary" onclick="rsRunDiagnostics()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/>
                        <path d="M9 12l2 2 4-4" stroke-width="2"/>
                    </svg>
                    Ejecutar Diagnóstico Completo
                </button>
            </div>
            
            <div id="diagnosticsResults"></div>
        </div>
        
        <script>
        function rsRunDiagnostics() {
            const resultsDiv = document.getElementById('diagnosticsResults');
            resultsDiv.innerHTML = '<div class="rs-loading">Ejecutando tests...</div>';
            
            jQuery.ajax({
                url: rsWarrantyAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_run_diagnostics',
                    nonce: rsWarrantyAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        resultsDiv.innerHTML = response.data.html;
                    } else {
                        resultsDiv.innerHTML = '<div class="rs-error">Error al ejecutar diagnóstico</div>';
                    }
                }
            });
        }
        </script>
        
        <style>
        .rs-diagnostics {
            max-width: 1200px;
        }
        
        .rs-diag-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            border-left: 4px solid #e5e7eb;
        }
        
        .rs-diag-section.pass {
            border-left-color: #10b981;
        }
        
        .rs-diag-section.fail {
            border-left-color: #ef4444;
        }
        
        .rs-diag-section h3 {
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .rs-diag-test {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .rs-diag-test:last-child {
            border-bottom: none;
        }
        
        .rs-diag-pass {
            color: #10b981;
            font-weight: 700;
        }
        
        .rs-diag-fail {
            color: #ef4444;
            font-weight: 700;
        }
        
        .rs-diag-summary {
            background: linear-gradient(135deg, rgba(255, 140, 0, 0.1), rgba(255, 140, 0, 0.05));
            border: 2px solid rgba(255, 140, 0, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
        }
        
        .rs-diag-score {
            font-size: 48px;
            font-weight: 800;
            color: var(--rs-orange);
            text-align: center;
            margin: 20px 0;
        }
        </style>
        <?php
    }
    
    /**
     * Run all diagnostics
     */
    public function run_all_tests() {
        $this->results = array();
        $this->total_tests = 0;
        $this->passed_tests = 0;
        
        $this->test_architecture();
        $this->test_hooks();
        $this->test_ajax_endpoints();
        $this->test_nonces();
        $this->test_ui_parity();
        $this->test_category_config();
        $this->test_semantic_integration(); // DOZO Semantic Layer
        $this->test_shortcode_execution(); // DOZO Shortcode Execution Layer v3.1
        $this->test_warranty_verifier(); // DOZO Warranty Verifier v3.2
        $this->test_woocommerce();
        $this->test_cron();
        
        return array(
            'score' => $this->total_tests > 0 ? round(($this->passed_tests / $this->total_tests) * 100) : 0,
            'total' => $this->total_tests,
            'passed' => $this->passed_tests,
            'results' => $this->results
        );
    }
    
    private function add_test($section, $test_name, $passed, $message = '') {
        if (!isset($this->results[$section])) {
            $this->results[$section] = array('tests' => array(), 'passed' => 0, 'total' => 0);
        }
        
        $this->results[$section]['tests'][] = array(
            'name' => $test_name,
            'passed' => $passed,
            'message' => $message
        );
        
        $this->results[$section]['total']++;
        $this->total_tests++;
        
        if ($passed) {
            $this->results[$section]['passed']++;
            $this->passed_tests++;
        }
    }
    
    private function test_architecture() {
        // Test constants
        $this->add_test('Arquitectura', 'RS_WARRANTY_VERSION definida', defined('RS_WARRANTY_VERSION'));
        $this->add_test('Arquitectura', 'RS_WARRANTY_PLUGIN_DIR definida', defined('RS_WARRANTY_PLUGIN_DIR'));
        $this->add_test('Arquitectura', 'RS_WARRANTY_ASSETS_URL definida', defined('RS_WARRANTY_ASSETS_URL'));
        
        // Test classes
        $this->add_test('Arquitectura', 'RS_Warranty_Core existe', class_exists('RS_Warranty_Core'));
        $this->add_test('Arquitectura', 'RS_Warranty_Database existe', class_exists('RS_Warranty_Database'));
        $this->add_test('Arquitectura', 'RS_Warranty_Admin existe', class_exists('RS_Warranty_Admin'));
        $this->add_test('Arquitectura', 'RS_Warranty_Frontend existe', class_exists('RS_Warranty_Frontend'));
        $this->add_test('Arquitectura', 'RS_Warranty_Email existe', class_exists('RS_Warranty_Email'));
        $this->add_test('Arquitectura', 'RS_Warranty_RMA existe', class_exists('RS_Warranty_RMA'));
        
        // Test tables
        global $wpdb;
        $tables = array('rs_warranties', 'rs_warranty_files', 'rs_warranty_notes', 'rs_warranty_rma');
        foreach ($tables as $table) {
            $exists = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}{$table}'") === $wpdb->prefix . $table;
            $this->add_test('Arquitectura', "Tabla {$table} existe", $exists);
        }
    }
    
    private function test_hooks() {
        // Test HPOS compatibility
        $hpos_declared = has_action('before_woocommerce_init');
        $this->add_test('Hooks', 'HPOS compatibility declarada', $hpos_declared);
        
        // Test cron
        $cron_scheduled = wp_next_scheduled('rs_warranty_daily_update') !== false;
        $this->add_test('Hooks', 'Cron diario programado', $cron_scheduled);
        
        // Test actions
        $this->add_test('Hooks', 'plugins_loaded registrado', has_action('plugins_loaded'));
    }
    
    private function test_ajax_endpoints() {
        // Frontend endpoints
        $this->add_test('AJAX', 'rs_verify_warranty registrado', has_action('wp_ajax_nopriv_rs_verify_warranty'));
        $this->add_test('AJAX', 'rs_submit_warranty registrado', has_action('wp_ajax_nopriv_rs_submit_warranty'));
        
        // Admin endpoints
        $this->add_test('AJAX', 'rs_update_warranty_status registrado', has_action('wp_ajax_rs_update_warranty_status'));
        $this->add_test('AJAX', 'rs_add_warranty_note registrado', has_action('wp_ajax_rs_add_warranty_note'));
        $this->add_test('AJAX', 'rs_get_warranties registrado', has_action('wp_ajax_rs_get_warranties'));
        
        // Category endpoints (DOZO requirement)
        $this->add_test('AJAX', 'rs_sync_categories registrado', has_action('wp_ajax_rs_sync_categories'));
        $this->add_test('AJAX', 'rs_save_category registrado', has_action('wp_ajax_rs_save_category'));
        $this->add_test('AJAX', 'rs_delete_category registrado', has_action('wp_ajax_rs_delete_category'));
        $this->add_test('AJAX', 'rs_restore_default_categories registrado', has_action('wp_ajax_rs_restore_default_categories'));
        $this->add_test('AJAX', 'rs_save_all_categories registrado', has_action('wp_ajax_rs_save_all_categories'));
    }
    
    private function test_nonces() {
        // Check if nonces are created (can't fully test without request context)
        $this->add_test('Seguridad', 'Función wp_create_nonce disponible', function_exists('wp_create_nonce'));
        $this->add_test('Seguridad', 'Función check_ajax_referer disponible', function_exists('check_ajax_referer'));
        
        // Verify code contains nonce verifications (basic check)
        $core_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-core.php');
        $nonce_count = substr_count($core_file, 'check_ajax_referer');
        $this->add_test('Seguridad', 'Verificaciones de nonce encontradas (15+)', $nonce_count >= 15, "Encontradas: {$nonce_count}");
        
        // Sanitization functions
        $sanitize_count = substr_count($core_file, 'sanitize_text_field') + 
                         substr_count($core_file, 'sanitize_email') + 
                         substr_count($core_file, 'absint');
        $this->add_test('Seguridad', 'Funciones de sanitización usadas (30+)', $sanitize_count >= 30, "Encontradas: {$sanitize_count}");
    }
    
    private function test_ui_parity() {
        // Test templates exist
        $templates = array('dashboard.php', 'detail-view.php', 'create-warranty.php', 'settings.php');
        foreach ($templates as $template) {
            $exists = file_exists(RS_WARRANTY_TEMPLATES_DIR . 'admin/' . $template);
            $this->add_test('UI Paridad', "Template {$template} existe", $exists);
        }
        
        // Test public template
        $exists = file_exists(RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-form.php');
        $this->add_test('UI Paridad', 'Template public/warranty-form.php existe', $exists);
        
        // Test CSS files
        $css_files = array('admin-style.css', 'public-style.css');
        foreach ($css_files as $css) {
            $exists = file_exists(RS_WARRANTY_ASSETS_DIR . 'css/' . $css);
            $this->add_test('UI Paridad', "CSS {$css} existe", $exists);
            
            if ($exists) {
                $content = file_get_contents(RS_WARRANTY_ASSETS_DIR . 'css/' . $css);
                $has_vars = strpos($content, '--rs-orange') !== false;
                $this->add_test('UI Paridad', "{$css} contiene variables CSS", $has_vars);
            }
        }
        
        // Test JS files
        $js_files = array('admin-script.js', 'public-script.js');
        foreach ($js_files as $js) {
            $exists = file_exists(RS_WARRANTY_ASSETS_DIR . 'js/' . $js);
            $this->add_test('UI Paridad', "JS {$js} existe", $exists);
        }
    }
    
    private function test_category_config() {
        // Test settings.php contains category config
        $settings_file = file_get_contents(RS_WARRANTY_TEMPLATES_DIR . 'admin/settings.php');
        
        $this->add_test('Config Categorías', 'Tab categories existe', strpos($settings_file, 'tab-categories') !== false);
        $this->add_test('Config Categorías', 'Formulario de configuración existe', strpos($settings_file, 'settings-card') !== false);
        $this->add_test('Config Categorías', 'Selector de categoría existe', strpos($settings_file, 'categorySelect') !== false);
        $this->add_test('Config Categorías', 'Input días existe', strpos($settings_file, 'warrantyDays') !== false);
        $this->add_test('Config Categorías', 'Input horas existe', strpos($settings_file, 'warrantyHours') !== false);
        $this->add_test('Config Categorías', 'Warranty preview existe', strpos($settings_file, 'totalWarrantyPreview') !== false);
        $this->add_test('Config Categorías', 'Tabla de configuraciones existe', strpos($settings_file, 'categories-table') !== false);
        $this->add_test('Config Categorías', 'Action bar existe', strpos($settings_file, 'action-bar') !== false);
        
        // Test JavaScript functions
        $this->add_test('Config Categorías', 'Función updateWarrantyPreview existe', strpos($settings_file, 'updateWarrantyPreview') !== false);
        $this->add_test('Config Categorías', 'Función rsEditCategory existe', strpos($settings_file, 'rsEditCategory') !== false);
        $this->add_test('Config Categorías', 'Función rsDeleteCategory existe', strpos($settings_file, 'rsDeleteCategory') !== false);
        $this->add_test('Config Categorías', 'Función rsSaveAllCategories existe', strpos($settings_file, 'rsSaveAllCategories') !== false);
        
        // Test CSS
        $css_file = file_get_contents(RS_WARRANTY_ASSETS_DIR . 'css/admin-style.css');
        $this->add_test('Config Categorías CSS', '.settings-card existe', strpos($css_file, '.settings-card') !== false);
        $this->add_test('Config Categorías CSS', '.warranty-config-grid existe', strpos($css_file, '.warranty-config-grid') !== false);
        $this->add_test('Config Categorías CSS', '.toggle-switch existe', strpos($css_file, '.toggle-switch') !== false);
        $this->add_test('Config Categorías CSS', '.warranty-preview existe', strpos($css_file, '.warranty-preview') !== false);
        $this->add_test('Config Categorías CSS', '.categories-table existe', strpos($css_file, '.categories-table') !== false);
        $this->add_test('Config Categorías CSS', '.action-bar existe', strpos($css_file, '.action-bar') !== false);
        
        // Test AJAX endpoints
        $core_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-core.php');
        $this->add_test('Config Categorías AJAX', 'ajax_sync_categories método existe', strpos($core_file, 'ajax_sync_categories') !== false);
        $this->add_test('Config Categorías AJAX', 'ajax_save_category método existe', strpos($core_file, 'ajax_save_category') !== false);
        $this->add_test('Config Categorías AJAX', 'ajax_delete_category método existe', strpos($core_file, 'ajax_delete_category') !== false);
    }
    
    private function test_semantic_integration() {
        // Test semantic CSS files exist
        $semantic_css = file_exists(RS_WARRANTY_ASSETS_DIR . 'css/rs-semantic-components.css');
        $this->add_test('Semántica DOZO', 'rs-semantic-components.css existe', $semantic_css);
        
        $icons_css = file_exists(RS_WARRANTY_ASSETS_DIR . 'css/rs-icons.css');
        $this->add_test('Semántica DOZO', 'rs-icons.css existe', $icons_css);
        
        // Test semantic classes in settings.php
        $settings_file = file_get_contents(RS_WARRANTY_TEMPLATES_DIR . 'admin/settings.php');
        
        $this->add_test('Semántica DOZO', '.rs-card clase usada', strpos($settings_file, 'class="rs-card') !== false);
        $this->add_test('Semántica DOZO', '.rs-field clase usada', strpos($settings_file, 'class="rs-field') !== false);
        $this->add_test('Semántica DOZO', '.rs-btn clase usada', strpos($settings_file, 'class="rs-btn') !== false);
        $this->add_test('Semántica DOZO', '.rs-icon usada', strpos($settings_file, 'class="rs-icon"') !== false);
        $this->add_test('Semántica DOZO', '.rs-toggle clase usada', strpos($settings_file, 'class="rs-toggle') !== false);
        $this->add_test('Semántica DOZO', '.rs-preview clase usada', strpos($settings_file, 'class="rs-preview') !== false);
        $this->add_test('Semántica DOZO', '.rs-table clase usada', strpos($settings_file, 'class="rs-table') !== false);
        $this->add_test('Semántica DOZO', '.rs-action-bar clase usada', strpos($settings_file, 'class="rs-action-bar') !== false);
        
        // Test data-icon attributes present
        $icon_count = substr_count($settings_file, 'data-icon="');
        $this->add_test('Semántica DOZO', 'Iconos semánticos (10+ data-icon)', $icon_count >= 10, "Encontrados: {$icon_count}");
        
        // Test data-action attributes present
        $action_count = substr_count($settings_file, 'data-action="');
        $this->add_test('Semántica DOZO', 'Atributos data-action (5+)', $action_count >= 5, "Encontrados: {$action_count}");
        
        // Test ARIA attributes
        $aria_count = substr_count($settings_file, 'aria-');
        $this->add_test('Semántica DOZO', 'ARIA attributes (3+)', $aria_count >= 3, "Encontrados: {$aria_count}");
        
        // Test CSS variables in semantic components
        if ($semantic_css) {
            $css_content = file_get_contents(RS_WARRANTY_ASSETS_DIR . 'css/rs-semantic-components.css');
            $this->add_test('Semántica DOZO', 'Variables CSS RockStage definidas', strpos($css_content, '--rs-orange:') !== false);
            $this->add_test('Semántica DOZO', 'Font UI variable presente', strpos($css_content, '--rs-font-ui:') !== false);
            $this->add_test('Semántica DOZO', 'Font Mono variable presente', strpos($css_content, '--rs-font-mono:') !== false);
        }
    }
    
    private function test_shortcode_execution() {
        // Test shortcode registration
        global $shortcode_tags;
        
        $this->add_test('Shortcodes', '[rockstage_warranty_form] registrado', isset($shortcode_tags['rockstage_warranty_form']));
        $this->add_test('Shortcodes', '[rs_warranty_form] alias registrado', isset($shortcode_tags['rs_warranty_form']));
        $this->add_test('Shortcodes', '[warranty_form] alias registrado', isset($shortcode_tags['warranty_form']));
        
        // Test shortcode handler exists
        if (class_exists('RS_Warranty_Frontend')) {
            $frontend = RS_Warranty_Frontend::get_instance();
            $this->add_test('Shortcodes', 'Método render_warranty_form() existe', method_exists($frontend, 'render_warranty_form'));
            $this->add_test('Shortcodes', 'Método force_shortcode_execution() existe', method_exists($frontend, 'force_shortcode_execution'));
        }
        
        // Test template exists
        $template_exists = file_exists(RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-form.php');
        $this->add_test('Shortcodes', 'Template public/warranty-form.php existe', $template_exists);
        
        // Test filters for shortcode execution
        $this->add_test('Shortcodes', 'Filtro the_content do_shortcode activo', has_filter('the_content', 'do_shortcode') !== false);
        $this->add_test('Shortcodes', 'Filtro widget_text do_shortcode activo', has_filter('widget_text', 'do_shortcode') !== false);
        
        // Test enqueue hook
        $this->add_test('Shortcodes', 'Hook wp_enqueue_scripts registrado', has_action('wp_enqueue_scripts'));
        
        // Test ob_start usage in render method
        if ($template_exists) {
            $frontend_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-frontend.php');
            $uses_ob_start = strpos($frontend_file, 'ob_start()') !== false && strpos($frontend_file, 'ob_get_clean()') !== false;
            $this->add_test('Shortcodes', 'Usa ob_start/ob_get_clean (buffering)', $uses_ob_start);
        }
        
        // Test public CSS exists
        $public_css = file_exists(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css');
        $this->add_test('Shortcodes', 'CSS público existe', $public_css);
        
        // Test public JS exists
        $public_js = file_exists(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js');
        $this->add_test('Shortcodes', 'JS público existe', $public_js);
        
        // Test wp_localize_script data
        if ($public_js) {
            $frontend_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-frontend.php');
            $this->add_test('Shortcodes', 'wp_localize_script configurado', strpos($frontend_file, 'wp_localize_script') !== false);
        }
    }
    
    /**
     * Test DOZO v3.2 - Warranty Verifier Layer
     * 
     * Verifica la integración completa del flujo de verificación inteligente:
     * - Template warranty-verifier.php existe
     * - JavaScript warranty-verifier.js existe
     * - Componentes semánticos (.rs-product-card, .rs-progress, etc.)
     * - AJAX endpoints para verificación
     * - Lógica de cálculo de garantía
     */
    private function test_warranty_verifier() {
        // Test template exists
        $verifier_template = file_exists(RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-verifier.php');
        $this->add_test('Warranty Verifier v3.2', 'Template warranty-verifier.php existe', $verifier_template);
        
        // Test JavaScript exists
        $verifier_js = file_exists(RS_WARRANTY_ASSETS_DIR . 'js/warranty-verifier.js');
        $this->add_test('Warranty Verifier v3.2', 'warranty-verifier.js existe', $verifier_js);
        
        if ($verifier_template) {
            $template_content = file_get_contents(RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-verifier.php');
            
            // Test key HTML elements exist
            $this->add_test('Warranty Verifier v3.2', 'Formulario de verificación (#rs-verify-form)', strpos($template_content, 'id="rs-verify-form"') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Step: Order Status (#rs-step-status)', strpos($template_content, 'id="rs-step-status"') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Step: Claim Form (#rs-step-claim)', strpos($template_content, 'id="rs-step-claim"') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Step: Success (#rs-step-success)', strpos($template_content, 'id="rs-step-success"') !== false);
            
            // Test semantic components
            $this->add_test('Warranty Verifier v3.2', 'Componente .rs-product-card existe', strpos($template_content, 'rs-product-card') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Componente .rs-progress existe', strpos($template_content, 'rs-progress') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Componente .rs-progress-bar existe', strpos($template_content, 'rs-progress-bar') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Template de producto (#rs-product-template)', strpos($template_content, 'id="rs-product-template"') !== false);
            
            // Test upload functionality
            $this->add_test('Warranty Verifier v3.2', 'Upload zone (#rs-upload-zone)', strpos($template_content, 'id="rs-upload-zone"') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Upload preview (#rs-upload-preview)', strpos($template_content, 'id="rs-upload-preview"') !== false);
            
            // Test ARIA attributes
            $this->add_test('Warranty Verifier v3.2', 'ARIA labels presentes (3+)', substr_count($template_content, 'aria-') >= 3);
            
            // Test inline styles (CSS in template)
            $this->add_test('Warranty Verifier v3.2', 'CSS inline presente', strpos($template_content, '.rs-warranty-verifier') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Estilos de progress bar', strpos($template_content, '.rs-progress-bar') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Estilos de upload zone', strpos($template_content, '.rs-upload-zone') !== false);
        }
        
        if ($verifier_js) {
            $js_content = file_get_contents(RS_WARRANTY_ASSETS_DIR . 'js/warranty-verifier.js');
            
            // Test key functions exist
            $this->add_test('Warranty Verifier v3.2', 'Función initVerifyForm()', strpos($js_content, 'function initVerifyForm()') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Función showWarrantyStatus()', strpos($js_content, 'function showWarrantyStatus(') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Función createProductCard()', strpos($js_content, 'function createProductCard(') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Función showClaimForm()', strpos($js_content, 'function showClaimForm(') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Función initFileUpload()', strpos($js_content, 'function initFileUpload()') !== false);
            $this->add_test('Warranty Verifier v3.2', 'Función handleFiles()', strpos($js_content, 'function handleFiles(') !== false);
            
            // Test AJAX calls
            $this->add_test('Warranty Verifier v3.2', 'AJAX: rs_verify_warranty', strpos($js_content, "action: 'rs_verify_warranty'") !== false);
            $this->add_test('Warranty Verifier v3.2', 'AJAX: rs_submit_warranty', strpos($js_content, "action: 'rs_submit_warranty'") !== false);
            
            // Test navigation
            $this->add_test('Warranty Verifier v3.2', 'Función goToStep()', strpos($js_content, 'function goToStep(') !== false);
        }
        
        // Test Frontend class integration
        $frontend_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-frontend.php');
        $this->add_test('Warranty Verifier v3.2', 'Frontend: warranty-verifier.js enqueued', strpos($frontend_file, 'warranty-verifier.js') !== false);
        $this->add_test('Warranty Verifier v3.2', 'Frontend: mode parameter soportado', strpos($frontend_file, "'mode' =>") !== false);
        $this->add_test('Warranty Verifier v3.2', 'Frontend: warranty-verifier.php incluido', strpos($frontend_file, 'warranty-verifier.php') !== false);
        
        // Test Core class warranty calculation methods exist
        $core_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-core.php');
        $this->add_test('Warranty Verifier v3.2', 'Core: get_order_products_with_warranty()', strpos($core_file, 'get_order_products_with_warranty') !== false);
        $this->add_test('Warranty Verifier v3.2', 'Core: Cálculo warranty_percentage', strpos($core_file, 'warranty_percentage') !== false);
        $this->add_test('Warranty Verifier v3.2', 'Core: Cálculo is_expired', strpos($core_file, 'is_expired') !== false);
    }
    
    private function test_woocommerce() {
        $this->add_test('WooCommerce', 'WooCommerce activo', class_exists('WooCommerce'));
        $this->add_test('WooCommerce', 'HPOS FeaturesUtil disponible', class_exists('Automattic\WooCommerce\Utilities\FeaturesUtil'));
        $this->add_test('WooCommerce', 'wc_get_order disponible', function_exists('wc_get_order'));
        $this->add_test('WooCommerce', 'wc_get_product disponible', function_exists('wc_get_product'));
        $this->add_test('WooCommerce', 'get_terms disponible', function_exists('get_terms'));
        
        // Test if product categories exist
        $categories = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => false));
        $this->add_test('WooCommerce', 'Categorías de productos disponibles', !is_wp_error($categories) && count($categories) > 0, 'Total: ' . count($categories));
    }
    
    private function test_cron() {
        $next_run = wp_next_scheduled('rs_warranty_daily_update');
        $this->add_test('Cron', 'Daily update programado', $next_run !== false, $next_run ? 'Próxima ejecución: ' . date('Y-m-d H:i:s', $next_run) : '');
    }
    
    /**
     * Generate HTML report
     */
    public function generate_html_report($results_data) {
        $html = '<div class="rs-diag-summary">';
        $html .= '<h2 style="text-align: center; margin-bottom: 10px;">Puntuación DOZO</h2>';
        $html .= '<div class="rs-diag-score">' . $results_data['score'] . '/100</div>';
        $html .= '<p style="text-align: center; font-weight: 600; color: #6b7280;">';
        $html .= $results_data['passed'] . ' de ' . $results_data['total'] . ' tests pasados';
        $html .= '</p>';
        $html .= '</div>';
        
        foreach ($results_data['results'] as $section => $data) {
            $section_class = ($data['passed'] === $data['total']) ? 'pass' : 'fail';
            $html .= '<div class="rs-diag-section ' . $section_class . '">';
            $html .= '<h3>';
            $html .= ($data['passed'] === $data['total']) ? '✅ ' : '⚠️ ';
            $html .= esc_html($section) . ' (' . $data['passed'] . '/' . $data['total'] . ')';
            $html .= '</h3>';
            
            foreach ($data['tests'] as $test) {
                $html .= '<div class="rs-diag-test">';
                $html .= '<span>' . esc_html($test['name']) . '</span>';
                $html .= '<span class="' . ($test['passed'] ? 'rs-diag-pass' : 'rs-diag-fail') . '">';
                $html .= $test['passed'] ? '✅ PASS' : '❌ FAIL';
                if (!empty($test['message'])) {
                    $html .= ' <small>(' . esc_html($test['message']) . ')</small>';
                }
                $html .= '</span>';
                $html .= '</div>';
            }
            
            $html .= '</div>';
        }
        
        return $html;
    }
}

// AJAX Handler
add_action('wp_ajax_rs_run_diagnostics', function() {
    check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
    
    if (!current_user_can('manage_woocommerce')) {
        wp_send_json_error(array('message' => 'Permisos insuficientes'));
    }
    
    $diagnostics = new RS_Warranty_Diagnostics();
    $results = $diagnostics->run_all_tests();
    $html = $diagnostics->generate_html_report($results);
    
    wp_send_json_success(array(
        'html' => $html,
        'score' => $results['score'],
        'data' => $results
    ));
});

// Initialize
new RS_Warranty_Diagnostics();


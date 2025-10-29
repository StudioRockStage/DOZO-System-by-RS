<?php
/**
 * Design Panel Integration
 * DOZO Deep Audit v7.2 - Design Panel Integration & Validation
 * 
 * Handles automatic integration of Claude AI design panels into WordPress admin.
 * Detects, validates, and activates design configuration panels.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.2
 * @since 7.2.0
 */

defined('ABSPATH') || exit;

class RS_Design_Panel_Integration {
    private static $instance = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_design_menu'), 100);
        
        // Enqueue assets for design panel
        add_action('admin_enqueue_scripts', array($this, 'enqueue_design_assets'));
        
        // AJAX endpoints
        add_action('wp_ajax_rs_validate_design_panel', array($this, 'ajax_validate_panel'));
        add_action('wp_ajax_rs_save_design_settings', array($this, 'ajax_save_settings'));
        
        error_log('✅ DOZO v7.2: Design Panel Integration initialized');
    }
    
    /**
     * Add design menu to WordPress admin
     */
    public function add_design_menu() {
        // Check if design panel is registered
        $panels = get_option('dozo_registered_panels', array());
        
        $has_design_panel = false;
        foreach ($panels as $panel) {
            if (isset($panel['type']) && $panel['type'] === 'design') {
                $has_design_panel = true;
                break;
            }
        }
        
        if (!$has_design_panel) {
            // Check if panel file exists directly
            $panel_path = RS_WARRANTY_PLUGIN_DIR . 'templates/admin/panels/design/panel-design-settings.html';
            if (file_exists($panel_path)) {
                $has_design_panel = true;
            }
        }
        
        // Add submenu if panel exists
        if ($has_design_panel) {
            add_submenu_page(
                'rockstage-warranty',
                __('Diseño', 'rockstage-warranty'),
                '🎨 ' . __('Diseño', 'rockstage-warranty'),
                'manage_options',
                'rs-design-settings',
                array($this, 'render_design_panel')
            );
            
            error_log('✅ DOZO v7.2: Design menu added to admin');
        } else {
            error_log('ℹ️ DOZO v7.2: No design panel detected, menu not added');
        }
    }
    
    /**
     * Render design panel
     */
    public function render_design_panel() {
        // Check for panel file
        $panel_path = RS_WARRANTY_PLUGIN_DIR . 'templates/admin/panels/design/panel-design-settings.html';
        
        if (!file_exists($panel_path)) {
            echo '<div class="wrap">';
            echo '<h1>🎨 Diseño</h1>';
            echo '<div class="notice notice-warning">';
            echo '<p><strong>⚠️ DOZO:</strong> Panel de diseño no encontrado. Ejecuta DOZO Sync para sincronizar el panel desde Claude AI.</p>';
            echo '</div>';
            echo '</div>';
            return;
        }
        
        // Render the panel
        include $panel_path;
        
        error_log('✅ DOZO v7.2: Design panel rendered successfully');
    }
    
    /**
     * Enqueue design panel assets
     */
    public function enqueue_design_assets($hook) {
        // Only load on warranty settings page
        if (strpos($hook, 'warranty') === false && strpos($hook, 'rockstage') === false) {
            return;
        }
        
        // DOZO v7.2.2: Try multiple paths for CSS
        $css_locations = array(
            'Admin Panels/panel-design-settings/panel-design-settings.css',
            'templates/admin/panels/design/panel-design-settings.css'
        );
        
        foreach ($css_locations as $css_rel_path) {
            $css_path = RS_WARRANTY_PLUGIN_DIR . $css_rel_path;
            if (file_exists($css_path)) {
                wp_enqueue_style(
                    'rs-design-panel',
                    RS_WARRANTY_PLUGIN_URL . $css_rel_path,
                    array(),
                    RS_WARRANTY_VERSION
                );
                error_log('✅ DOZO v7.2.2: Design panel CSS enqueued from ' . $css_rel_path);
                break;
            }
        }
        
        // DOZO v7.2.2: Try multiple paths for JS
        $js_locations = array(
            'Admin Panels/panel-design-settings/panel-design-settings.js',
            'templates/admin/panels/design/panel-design-settings.js'
        );
        
        foreach ($js_locations as $js_rel_path) {
            $js_path = RS_WARRANTY_PLUGIN_DIR . $js_rel_path;
            if (file_exists($js_path)) {
                wp_enqueue_script(
                    'rs-design-panel',
                    RS_WARRANTY_PLUGIN_URL . $js_rel_path,
                    array('jquery'),
                    RS_WARRANTY_VERSION,
                    true
                );
                
                // Localize script
                wp_localize_script('rs-design-panel', 'rsDesign', array(
                    'ajaxurl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('rs_design_panel'),
                    'version' => RS_WARRANTY_VERSION,
                    'current_theme' => get_option('rs_design_theme', 'rockstage-orange')
                ));
                
                error_log('✅ DOZO v7.2.2: Design panel JS enqueued from ' . $js_rel_path);
                break;
            }
        }
    }
    
    /**
     * AJAX: Validate design panel
     */
    public function ajax_validate_panel() {
        check_ajax_referer('rs_design_panel', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }
        
        $validation = $this->validate_design_panel();
        
        wp_send_json_success($validation);
    }
    
    /**
     * Validate design panel
     */
    public function validate_design_panel() {
        $validation = array(
            'panel_exists' => false,
            'css_exists' => false,
            'js_exists' => false,
            'panel_registered' => false,
            'menu_active' => false,
            'status' => 'incomplete'
        );
        
        // Check panel HTML
        $panel_path = RS_WARRANTY_PLUGIN_DIR . 'templates/admin/panels/design/panel-design-settings.html';
        $validation['panel_exists'] = file_exists($panel_path);
        
        // Check CSS
        $css_path = RS_WARRANTY_PLUGIN_DIR . 'templates/admin/panels/design/panel-design-settings.css';
        $validation['css_exists'] = file_exists($css_path);
        
        // Check JS
        $js_path = RS_WARRANTY_PLUGIN_DIR . 'templates/admin/panels/design/panel-design-settings.js';
        $validation['js_exists'] = file_exists($js_path);
        
        // Check if panel is registered
        $panels = get_option('dozo_registered_panels', array());
        foreach ($panels as $panel) {
            if (isset($panel['type']) && $panel['type'] === 'design') {
                $validation['panel_registered'] = true;
                break;
            }
        }
        
        // Check if menu item exists
        global $submenu;
        if (isset($submenu['rockstage-warranty'])) {
            foreach ($submenu['rockstage-warranty'] as $item) {
                if ($item[2] === 'rs-design-settings') {
                    $validation['menu_active'] = true;
                    break;
                }
            }
        }
        
        // Determine overall status
        if ($validation['panel_exists'] && $validation['css_exists'] && $validation['js_exists']) {
            $validation['status'] = 'active';
        } elseif ($validation['panel_exists']) {
            $validation['status'] = 'partial';
        } else {
            $validation['status'] = 'missing';
        }
        
        return $validation;
    }
    
    /**
     * AJAX: Save design settings
     */
    public function ajax_save_settings() {
        check_ajax_referer('rs_design_panel', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
        }
        
        $theme = isset($_POST['theme']) ? sanitize_text_field($_POST['theme']) : 'default';
        $settings = isset($_POST['settings']) ? $_POST['settings'] : array();
        
        // Save settings
        update_option('rs_design_theme', $theme);
        update_option('rs_design_settings', $settings);
        
        // Log to Knowledge Base
        $kb = RS_DOZO_Knowledge_Base::get_instance();
        $kb->log_event('design_update', array(
            'theme' => $theme,
            'settings_count' => count($settings)
        ));
        
        error_log('✅ DOZO v7.2: Design settings saved - Theme: ' . $theme);
        
        wp_send_json_success(array(
            'message' => 'Configuración guardada exitosamente',
            'theme' => $theme
        ));
    }
    
    /**
     * Get current design theme
     */
    public function get_current_theme() {
        return get_option('rs_design_theme', 'default');
    }
    
    /**
     * Get design settings
     */
    public function get_design_settings() {
        return get_option('rs_design_settings', array());
    }
}

// Initialize
RS_Design_Panel_Integration::get_instance();


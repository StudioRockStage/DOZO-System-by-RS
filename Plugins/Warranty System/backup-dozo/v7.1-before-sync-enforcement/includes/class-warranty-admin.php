<?php
/**
 * RockStage Warranty System - Admin Class
 * 
 * Gestión del panel de administración:
 * - Menús en WordPress
 * - Dashboard de garantías
 * - Vista detallada
 * - Configuración
 * - Enqueue de assets (CSS/JS)
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase para gestionar el panel de administración
 */
class RS_Warranty_Admin {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Admin
     */
    private static $instance = null;
    
    /**
     * Instancia de la base de datos
     * 
     * @var RS_Warranty_Database
     */
    private $db;
    
    /**
     * Instancia de configuración
     * 
     * @var RS_Warranty_Settings
     */
    private $settings;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->db = RS_Warranty_Database::get_instance();
        $this->settings = RS_Warranty_Settings::get_instance();
        $this->init_hooks();
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Admin
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * INICIALIZACIÓN
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Inicializar hooks
     */
    private function init_hooks() {
        // Menús de administración
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue de assets
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // Columna de garantía en pedidos de WooCommerce
        add_filter('manage_shop_order_posts_columns', array($this, 'add_order_warranty_column'));
        add_action('manage_shop_order_posts_custom_column', array($this, 'render_order_warranty_column'), 10, 2);
        
        // Guardar configuración
        add_action('admin_post_rs_save_settings', array($this, 'save_settings'));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * MENÚS DE WORDPRESS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Agregar menús al admin de WordPress
     */
    public function add_admin_menu() {
        // Menú principal
        add_menu_page(
            'Garantías RockStage',
            'Garantías',
            'manage_woocommerce',
            'rockstage-warranty',
            array($this, 'render_dashboard_page'),
            'dashicons-shield',
            56
        );
        
        // Submenú: Dashboard
        add_submenu_page(
            'rockstage-warranty',
            'Dashboard de Garantías',
            'Dashboard',
            'manage_woocommerce',
            'rockstage-warranty',
            array($this, 'render_dashboard_page')
        );
        
        // Submenú: Configuración
        add_submenu_page(
            'rockstage-warranty',
            'Configuración de Garantías',
            'Configuración',
            'manage_woocommerce',
            'rockstage-warranty-settings',
            array($this, 'render_settings_page')
        );
        
        // DOZO v5.1: Dual AI Integration
        // Claude AI Developer Panel (v5.0) is registered in class-claude-developer-panel.php
        // Cursor AI Developer Panel (v5.1) is registered in class-cursor-developer-panel.php
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PÁGINAS DEL ADMIN
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Renderizar página principal (Dashboard)
     */
    public function render_dashboard_page() {
        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_die('No tienes permisos para acceder a esta página');
        }
        
        // Determinar qué vista mostrar
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'list';
        
        if ($action === 'view' && isset($_GET['id'])) {
            // Vista detallada de una garantía
            $warranty_id = absint($_GET['id']);
            include RS_WARRANTY_TEMPLATES_DIR . 'admin/detail-view.php';
        } elseif ($action === 'create' || ($action === 'edit' && isset($_GET['id']))) {
            // Crear o editar garantía
            include RS_WARRANTY_TEMPLATES_DIR . 'admin/create-warranty.php';
        } else {
            // Listado de garantías (dashboard)
            include RS_WARRANTY_TEMPLATES_DIR . 'admin/dashboard.php';
        }
    }
    
    /**
     * Renderizar página de configuración
     */
    public function render_settings_page() {
        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_die('No tienes permisos para acceder a esta página');
        }
        
        include RS_WARRANTY_TEMPLATES_DIR . 'admin/settings.php';
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * ENQUEUE DE ASSETS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Cargar CSS y JavaScript del admin
     */
    public function enqueue_admin_assets($hook) {
        // Solo cargar en páginas del plugin
        if (strpos($hook, 'rockstage-warranty') === false) {
            return;
        }
        
        // Google Fonts
        wp_enqueue_style(
            'rs-warranty-google-fonts',
            'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap',
            array(),
            null
        );
        
        // CSS del admin
        wp_enqueue_style(
            'rs-warranty-admin-css',
            RS_WARRANTY_ASSETS_URL . 'css/admin-style.css',
            array(),
            RS_WARRANTY_VERSION
        );
        
        // CSS - Semantic Components (DOZO Integration Layer)
        wp_enqueue_style(
            'rs-semantic-components',
            RS_WARRANTY_ASSETS_URL . 'css/rs-semantic-components.css',
            array('rs-warranty-admin-css'),
            RS_WARRANTY_VERSION
        );
        
        // CSS - Icon System (DOZO Semantic)
        wp_enqueue_style(
            'rs-icons',
            RS_WARRANTY_ASSETS_URL . 'css/rs-icons.css',
            array('rs-semantic-components'),
            RS_WARRANTY_VERSION
        );
        
        // JavaScript del admin
        wp_enqueue_script(
            'rs-warranty-admin-js',
            RS_WARRANTY_ASSETS_URL . 'js/admin-script.js',
            array('jquery'),
            RS_WARRANTY_VERSION,
            true
        );
        
        // JavaScript - Categories Management (DOZO v3.5)
        wp_enqueue_script(
            'rs-warranty-admin-categories-js',
            RS_WARRANTY_ASSETS_URL . 'js/admin-categories.js',
            array('jquery', 'rs-warranty-admin-js'),
            RS_WARRANTY_VERSION,
            true
        );
        
        // JavaScript - DOZO Diagnostic System (DOZO v4.8)
        wp_enqueue_script(
            'rs-warranty-dozo-diagnostic',
            RS_WARRANTY_ASSETS_URL . 'js/dozo-diagnostic.js',
            array('jquery'),
            RS_WARRANTY_VERSION,
            true
        );
        
        // Localizar script con datos de WordPress
        wp_localize_script('rs-warranty-admin-js', 'rsWarrantyAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rs_warranty_admin_nonce'),
            'strings' => array(
                'confirmDelete' => '¿Estás seguro de eliminar esta garantía?',
                'confirmStatusChange' => '¿Cambiar el estado de esta garantía?',
                'processing' => 'Procesando...',
                'error' => 'Error al procesar la solicitud',
                'success' => 'Operación exitosa'
            )
        ));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * INTEGRACIÓN CON WOOCOMMERCE
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Agregar columna de garantía en listado de pedidos
     */
    public function add_order_warranty_column($columns) {
        $new_columns = array();
        
        foreach ($columns as $key => $column) {
            $new_columns[$key] = $column;
            
            // Insertar después de la columna de estado
            if ($key === 'order_status') {
                $new_columns['warranty_status'] = 'Garantía';
            }
        }
        
        return $new_columns;
    }
    
    /**
     * Renderizar contenido de la columna de garantía
     */
    public function render_order_warranty_column($column, $post_id) {
        if ($column !== 'warranty_status') {
            return;
        }
        
        // Buscar garantías para este pedido
        $warranties = $this->db->get_warranties(array(
            'order_id' => $post_id,
            'limit' => 10
        ));
        
        if (empty($warranties)) {
            echo '<span style="color: #999;">—</span>';
            return;
        }
        
        foreach ($warranties as $warranty) {
            $status = $warranty['status'];
            $status_label = rs_get_warranty_status_label($status);
            $status_color = rs_get_warranty_status_color($status);
            
            $url = admin_url('admin.php?page=rockstage-warranty&action=view&id=' . $warranty['id']);
            
            echo '<a href="' . esc_url($url) . '" style="display: inline-block; padding: 4px 8px; background: ' . esc_attr($status_color) . '; color: #fff; border-radius: 4px; font-size: 11px; text-decoration: none; margin: 2px 0;">';
            echo esc_html($status_label);
            echo '</a><br>';
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * GUARDAR CONFIGURACIÓN
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Guardar configuración del plugin
     */
    public function save_settings() {
        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_die('No tienes permisos para realizar esta acción');
        }
        
        // Determinar qué sección se está guardando
        $section = isset($_POST['section']) ? sanitize_text_field($_POST['section']) : 'general';
        
        // DOZO v4.1: Verificar nonce según la sección (IDs únicos)
        $nonce_field = 'rs_warranty_settings_nonce_' . $section;
        $nonce_action = 'rs_warranty_save_settings';
        
        if (!isset($_POST[$nonce_field]) || !wp_verify_nonce($_POST[$nonce_field], $nonce_action)) {
            error_log(sprintf(
                '⚠️ DOZO v4.1: Nonce validation failed - Section: %s, Field: %s, Action: %s',
                $section,
                $nonce_field,
                $nonce_action
            ));
            wp_die('Verificación de seguridad falló. Por favor recarga la página e intenta de nuevo.');
        }
        
        error_log(sprintf('✅ DOZO v4.1: Nonce válido para sección: %s', $section));
        
        switch ($section) {
            case 'general':
                $this->save_general_settings();
                break;
            
            case 'categories':
                $this->save_categories_settings();
                break;
            
            case 'templates':
                $this->save_templates_settings();
                break;
            
            case 'advanced':
                $this->save_advanced_settings();
                break;
        }
        
        // Redireccionar con mensaje de éxito
        $redirect_url = add_query_arg(array(
            'page' => 'rockstage-warranty-settings',
            'tab' => $section,
            'updated' => 'true'
        ), admin_url('admin.php'));
        
        wp_redirect($redirect_url);
        exit;
    }
    
    /**
     * Guardar configuración general
     */
    private function save_general_settings() {
        // Email de garantías
        if (isset($_POST['warranty_email'])) {
            update_option('rs_warranty_email', sanitize_email($_POST['warranty_email']));
        }
        
        // CC adicionales
        if (isset($_POST['warranty_email_cc'])) {
            update_option('rs_warranty_email_cc', sanitize_text_field($_POST['warranty_email_cc']));
        }
        
        // Configuración SMTP
        update_option('rs_warranty_smtp_enabled', isset($_POST['smtp_enabled']) ? 'yes' : 'no');
        
        if (isset($_POST['smtp_host'])) {
            update_option('rs_warranty_smtp_host', sanitize_text_field($_POST['smtp_host']));
        }
        
        if (isset($_POST['smtp_port'])) {
            update_option('rs_warranty_smtp_port', absint($_POST['smtp_port']));
        }
        
        if (isset($_POST['smtp_username'])) {
            update_option('rs_warranty_smtp_username', sanitize_text_field($_POST['smtp_username']));
        }
        
        if (isset($_POST['smtp_password'])) {
            update_option('rs_warranty_smtp_password', sanitize_text_field($_POST['smtp_password']));
        }
        
        if (isset($_POST['smtp_encryption'])) {
            update_option('rs_warranty_smtp_encryption', sanitize_text_field($_POST['smtp_encryption']));
        }
    }
    
    /**
     * Guardar configuración de categorías
     */
    private function save_categories_settings() {
        if (!isset($_POST['categories']) || !is_array($_POST['categories'])) {
            return;
        }
        
        $categories_config = array();
        
        foreach ($_POST['categories'] as $cat_id => $data) {
            if (!is_array($data)) {
                continue;
            }
            
            $categories_config[absint($cat_id)] = array(
                'name' => isset($data['name']) ? sanitize_text_field($data['name']) : '',
                'slug' => isset($data['slug']) ? sanitize_text_field($data['slug']) : '',
                'days' => isset($data['days']) ? absint($data['days']) : 0,
                'custom_text' => isset($data['custom_text']) ? sanitize_text_field($data['custom_text']) : '',
                'enabled' => isset($data['enabled'])
            );
        }
        
        update_option('rs_warranty_categories', $categories_config);
    }
    
    /**
     * Guardar plantillas de respuesta
     */
    private function save_templates_settings() {
        if (!isset($_POST['templates']) || !is_array($_POST['templates'])) {
            return;
        }
        
        $templates = array();
        
        foreach ($_POST['templates'] as $template_id => $data) {
            if (!is_array($data)) {
                continue;
            }
            
            $templates[sanitize_key($template_id)] = array(
                'name' => isset($data['name']) ? sanitize_text_field($data['name']) : '',
                'subject' => isset($data['subject']) ? sanitize_text_field($data['subject']) : '',
                'message' => isset($data['message']) ? sanitize_textarea_field($data['message']) : ''
            );
        }
        
        update_option('rs_warranty_templates', $templates);
    }
    
    /**
     * Guardar configuración avanzada
     */
    private function save_advanced_settings() {
        // Sistema RMA
        update_option('rs_warranty_rma_enabled', isset($_POST['rma_enabled']) ? 'yes' : 'no');
        
        if (isset($_POST['rma_prefix'])) {
            update_option('rs_warranty_rma_prefix', sanitize_text_field($_POST['rma_prefix']));
        }
        
        update_option('rs_warranty_rma_tracking_enabled', isset($_POST['rma_tracking_enabled']) ? 'yes' : 'no');
        
        if (isset($_POST['rma_return_address'])) {
            update_option('rs_warranty_rma_return_address', sanitize_textarea_field($_POST['rma_return_address']));
        }
        
        // Prioridad automática
        if (isset($_POST['vip_min_orders'])) {
            update_option('rs_warranty_vip_min_orders', absint($_POST['vip_min_orders']));
        }
        
        if (isset($_POST['high_value_min'])) {
            update_option('rs_warranty_high_value_min', absint($_POST['high_value_min']));
        }
        
        if (isset($_POST['expiring_percentage'])) {
            update_option('rs_warranty_expiring_percentage', absint($_POST['expiring_percentage']));
        }
        
        if (isset($_POST['urgent_keywords'])) {
            update_option('rs_warranty_urgent_keywords', sanitize_text_field($_POST['urgent_keywords']));
        }
        
        // WhatsApp
        update_option('rs_warranty_whatsapp_enabled', isset($_POST['whatsapp_enabled']) ? 'yes' : 'no');
        
        if (isset($_POST['whatsapp_number'])) {
            update_option('rs_warranty_whatsapp_number', sanitize_text_field($_POST['whatsapp_number']));
        }
        
        if (isset($_POST['whatsapp_message'])) {
            update_option('rs_warranty_whatsapp_message', sanitize_text_field($_POST['whatsapp_message']));
        }
        
        // Límites de archivos
        if (isset($_POST['max_photos'])) {
            update_option('rs_warranty_max_photos', absint($_POST['max_photos']));
        }
        
        if (isset($_POST['max_photo_size'])) {
            update_option('rs_warranty_max_photo_size', absint($_POST['max_photo_size']));
        }
        
        update_option('rs_warranty_require_photo', isset($_POST['require_photo']) ? 'yes' : 'no');
        
        if (isset($_POST['max_video_size'])) {
            update_option('rs_warranty_max_video_size', absint($_POST['max_video_size']));
        }
        
        if (isset($_POST['max_video_duration'])) {
            update_option('rs_warranty_max_video_duration', absint($_POST['max_video_duration']));
        }
        
        update_option('rs_warranty_allow_video', isset($_POST['allow_video']) ? 'yes' : 'no');
        
        // Términos y condiciones
        if (isset($_POST['warranty_terms'])) {
            update_option('rs_warranty_terms', wp_kses_post($_POST['warranty_terms']));
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * UTILIDADES
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener estadísticas del dashboard
     */
    public function get_dashboard_stats() {
        return $this->db->get_stats();
    }
    
    /**
     * Obtener garantías con paginación
     */
    public function get_warranties_paginated($page = 1, $per_page = 20, $filters = array()) {
        $offset = ($page - 1) * $per_page;
        
        $args = array_merge($filters, array(
            'limit' => $per_page,
            'offset' => $offset
        ));
        
        return $this->db->get_warranties($args);
    }
}


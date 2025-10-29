<?php
/**
 * RockStage Warranty System - Core Class
 * 
 * Clase principal que coordina toda la funcionalidad del plugin:
 * - Verificación de pedidos y garantías
 * - Procesamiento de solicitudes
 * - Cálculo de días restantes
 * - Sistema de prioridad automática
 * - Integración con WooCommerce
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase singleton principal del core
 */
class RS_Warranty_Core {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Core
     */
    private static $instance = null;
    
    /**
     * Instancias de otras clases
     */
    private $db;
    private $settings;
    private $email;
    private $rma;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->db = RS_Warranty_Database::get_instance();
        $this->settings = RS_Warranty_Settings::get_instance();
        $this->email = RS_Warranty_Email::get_instance();
        $this->rma = RS_Warranty_RMA::get_instance();
        
        $this->init_hooks();
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Core
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
     * Inicializar hooks de WordPress
     */
    private function init_hooks() {
        // AJAX para el frontend
        add_action('wp_ajax_rs_verify_warranty', array($this, 'ajax_verify_warranty'));
        add_action('wp_ajax_nopriv_rs_verify_warranty', array($this, 'ajax_verify_warranty'));
        
        add_action('wp_ajax_rs_submit_warranty', array($this, 'ajax_submit_warranty'));
        add_action('wp_ajax_nopriv_rs_submit_warranty', array($this, 'ajax_submit_warranty'));
        
        // AJAX para el admin
        add_action('wp_ajax_rs_update_warranty_status', array($this, 'ajax_update_warranty_status'));
        add_action('wp_ajax_rs_add_warranty_note', array($this, 'ajax_add_warranty_note'));
        add_action('wp_ajax_rs_send_warranty_response', array($this, 'ajax_send_warranty_response'));
        add_action('wp_ajax_rs_update_rma_status', array($this, 'ajax_update_rma_status'));
        add_action('wp_ajax_rs_delete_warranty', array($this, 'ajax_delete_warranty'));
        add_action('wp_ajax_rs_get_warranties', array($this, 'ajax_get_warranties'));
        add_action('wp_ajax_rs_search_customers', array($this, 'ajax_search_customers'));
        add_action('wp_ajax_rs_save_warranty', array($this, 'ajax_save_warranty'));
        
        // AJAX for category config (DOZO requirement)
        add_action('wp_ajax_rs_sync_categories', array($this, 'ajax_sync_categories'));
        add_action('wp_ajax_rs_save_category', array($this, 'ajax_save_category'));
        add_action('wp_ajax_rs_delete_category', array($this, 'ajax_delete_category'));
        add_action('wp_ajax_rs_restore_default_categories', array($this, 'ajax_restore_default_categories'));
        add_action('wp_ajax_rs_save_all_categories', array($this, 'ajax_save_all_categories'));
        add_action('wp_ajax_rs_get_categories_table', array($this, 'ajax_get_categories_table')); // DOZO v3.5
        add_action('wp_ajax_rs_get_category_stats', array($this, 'ajax_get_category_stats')); // DOZO v3.7
        add_action('wp_ajax_rs_save_dozo_audit', array($this, 'ajax_save_dozo_audit')); // DOZO v4.8
        add_action('wp_ajax_rs_diagnostic_ping', array($this, 'ajax_diagnostic_ping')); // DOZO v4.9
        add_action('wp_ajax_rs_run_dozo_diagnostic', array($this, 'ajax_run_dozo_diagnostic')); // DOZO v4.9
        add_action('wp_ajax_rs_dozo_get_health', array($this, 'ajax_get_health_score')); // DOZO v7.0
        
        // Cron para actualizar días restantes
        add_action('rs_warranty_daily_update', array($this, 'update_warranty_days'));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * VERIFICACIÓN DE PEDIDOS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * AJAX: Verificar si un pedido tiene garantía válida
     */
    public function ajax_verify_warranty() {
        check_ajax_referer('rs_warranty_nonce', 'nonce');
        
        $order_number = isset($_POST['order_number']) ? rs_sanitize_order_number($_POST['order_number']) : 0;
        
        if (!$order_number) {
            wp_send_json_error(array('message' => 'Número de pedido inválido'));
        }
        
        // Obtener pedido de WooCommerce
        $order = wc_get_order($order_number);
        
        if (!$order) {
            wp_send_json_error(array('message' => 'Pedido no encontrado'));
        }
        
        // Verificar productos con garantía válida
        $products_with_warranty = $this->get_order_products_with_warranty($order);
        
        if (empty($products_with_warranty)) {
            wp_send_json_error(array('message' => 'Este pedido no tiene productos con garantía válida'));
        }
        
        // Preparar respuesta
        $response = array(
            'order_id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'customer_email' => $order->get_billing_email(),
            'customer_phone' => $order->get_billing_phone(),
            'order_date' => $order->get_date_created()->date('Y-m-d H:i:s'),
            'products' => $products_with_warranty
        );
        
        wp_send_json_success($response);
    }
    
    /**
     * Obtener productos del pedido con garantía válida
     */
    private function get_order_products_with_warranty($order) {
        $products = array();
        $categories_config = $this->settings->get_categories();
        
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            
            if (!$product) {
                continue;
            }
            
            // DOZO v3.6: Intentar obtener garantía de meta del producto primero
            $warranty_days = get_post_meta($product->get_id(), '_rs_warranty_days', true);
            $warranty_hours = get_post_meta($product->get_id(), '_rs_warranty_hours', true);
            $warranty_text = get_post_meta($product->get_id(), '_rs_warranty_text', true);
            $warranty_active = get_post_meta($product->get_id(), '_rs_warranty_active', true);
            
            // Si no tiene meta, buscar en categorías
            if (!$warranty_days || $warranty_days <= 0) {
                // Obtener categorías del producto
                $product_categories = wp_get_post_terms($product->get_id(), 'product_cat', array('fields' => 'ids'));
                
                // Buscar si alguna categoría tiene garantía
                foreach ($product_categories as $cat_id) {
                    // DOZO v3.6: Fixed key 'enabled' -> 'active'
                    if (isset($categories_config[$cat_id]) && !empty($categories_config[$cat_id]['active'])) {
                        $warranty_days = isset($categories_config[$cat_id]['days']) ? $categories_config[$cat_id]['days'] : 0;
                        $warranty_hours = isset($categories_config[$cat_id]['hours']) ? $categories_config[$cat_id]['hours'] : 0;
                        $warranty_text = isset($categories_config[$cat_id]['text']) ? $categories_config[$cat_id]['text'] : '';
                        $warranty_active = true;
                        break;
                    }
                }
            }
            
            // Verificar si está activa
            if ($warranty_active === '0' || $warranty_active === false || empty($warranty_active)) {
                continue;
            }
            
            // Si no tiene garantía, saltar
            if ($warranty_days <= 0) {
                continue;
            }
            
            // Calcular fecha de expiración
            $purchase_date = $order->get_date_created();
            $expiration_date = clone $purchase_date;
            $expiration_date->modify("+{$warranty_days} days");
            
            // Calcular días restantes
            $now = new DateTime();
            $days_remaining = $now->diff($expiration_date)->days;
            $is_expired = $now > $expiration_date;
            
            if ($is_expired) {
                $days_remaining = 0;
            }
            
            // Calcular porcentaje de garantía restante
            $warranty_percentage = $warranty_days > 0 ? round(($days_remaining / $warranty_days) * 100) : 0;
            
            $products[] = array(
                'product_id' => $product->get_id(),
                'product_name' => $product->get_name(),
                'product_image' => wp_get_attachment_url($product->get_image_id()),
                'warranty_days' => $warranty_days,
                'warranty_text' => $warranty_text,
                'purchase_date' => $purchase_date->date('Y-m-d H:i:s'),
                'expiration_date' => $expiration_date->format('Y-m-d H:i:s'),
                'days_remaining' => $days_remaining,
                'warranty_percentage' => $warranty_percentage,
                'is_expired' => $is_expired
            );
        }
        
        return $products;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PROCESAMIENTO DE SOLICITUDES
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * AJAX: Enviar solicitud de garantía
     */
    public function ajax_submit_warranty() {
        check_ajax_referer('rs_warranty_nonce', 'nonce');
        
        // Validar datos requeridos
        $required_fields = array('order_id', 'product_id', 'customer_name', 'customer_email', 'description');
        
        foreach ($required_fields as $field) {
            if (empty($_POST[$field])) {
                wp_send_json_error(array('message' => 'Todos los campos son obligatorios'));
            }
        }
        
        // Sanitizar datos
        $order_id = absint($_POST['order_id']);
        $product_id = absint($_POST['product_id']);
        $customer_name = sanitize_text_field($_POST['customer_name']);
        $customer_email = sanitize_email($_POST['customer_email']);
        $customer_phone = sanitize_text_field($_POST['customer_phone']);
        $description = sanitize_textarea_field($_POST['description']);
        
        // Obtener pedido
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => 'Pedido no válido'));
        }
        
        // Obtener producto
        $product = wc_get_product($product_id);
        if (!$product) {
            wp_send_json_error(array('message' => 'Producto no válido'));
        }
        
        // Calcular fecha de expiración y días restantes
        $purchase_date = $order->get_date_created()->date('Y-m-d H:i:s');
        $warranty_days = $this->get_product_warranty_days($product_id);
        
        $expiration_date = date('Y-m-d H:i:s', strtotime($purchase_date . ' + ' . $warranty_days . ' days'));
        $days_until_expiration = $this->calculate_days_until_expiration($expiration_date);
        
        // Calcular prioridad automática
        $priority = $this->calculate_priority($order, $product, $description, $days_until_expiration);
        
        // Crear garantía en la base de datos
        $warranty_data = array(
            'order_id' => $order_id,
            'product_id' => $product_id,
            'customer_id' => $order->get_customer_id(),
            'customer_name' => $customer_name,
            'customer_email' => $customer_email,
            'customer_phone' => $customer_phone,
            'description' => $description,
            'status' => 'pending',
            'priority' => $priority,
            'purchase_date' => $purchase_date,
            'warranty_expiration' => $expiration_date,
            'days_until_expiration' => $days_until_expiration
        );
        
        $warranty_id = $this->db->create_warranty($warranty_data);
        
        if (!$warranty_id) {
            wp_send_json_error(array('message' => 'Error al crear la solicitud'));
        }
        
        // Procesar archivos subidos
        $files_uploaded = $this->process_uploaded_files($warranty_id);
        
        // Crear RMA si está habilitado
        if (get_option('rs_warranty_rma_enabled') === 'yes') {
            $this->rma->create_rma($warranty_id);
        }
        
        // Obtener garantía completa para emails
        $warranty = $this->db->get_warranty($warranty_id);
        $warranty['product_name'] = $product->get_name();
        
        // Enviar email de confirmación al cliente
        $this->email->send_confirmation_to_customer($warranty);
        
        // Enviar email de notificación al equipo
        $this->email->send_new_warranty_to_team($warranty);
        
        // Respuesta exitosa
        wp_send_json_success(array(
            'message' => 'Solicitud enviada exitosamente',
            'warranty_id' => $warranty_id,
            'warranty_number' => $warranty['warranty_number'],
            'files_uploaded' => $files_uploaded
        ));
    }
    
    /**
     * Procesar archivos subidos
     */
    private function process_uploaded_files($warranty_id) {
        $files_uploaded = 0;
        
        // Tipos de archivo permitidos
        $file_types = array(
            'foto_frontal',
            'foto_posterior',
            'foto_defecto',
            'foto_etiqueta',
            'foto_extra',
            'video_demostracion'
        );
        
        // Verificar si hay archivos
        if (empty($_FILES)) {
            return $files_uploaded;
        }
        
        // Directorio de uploads
        $upload_dir = wp_upload_dir();
        $warranty_dir = $upload_dir['basedir'] . '/rockstage-warranties/' . $warranty_id;
        
        // Crear directorio si no existe
        if (!file_exists($warranty_dir)) {
            wp_mkdir_p($warranty_dir);
        }
        
        // Procesar cada tipo de archivo
        foreach ($file_types as $file_type) {
            if (isset($_FILES[$file_type]) && $_FILES[$file_type]['error'] === UPLOAD_ERR_OK) {
                $file = $_FILES[$file_type];
                
                // Validar tipo MIME
                $allowed_mimes = $this->get_allowed_mimes($file_type);
                $file_mime = mime_content_type($file['tmp_name']);
                
                if (!in_array($file_mime, $allowed_mimes)) {
                    continue;
                }
                
                // Generar nombre único
                $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $file_name = $file_type . '_' . time() . '_' . uniqid() . '.' . $file_extension;
                $file_path = $warranty_dir . '/' . $file_name;
                
                // Mover archivo
                if (move_uploaded_file($file['tmp_name'], $file_path)) {
                    // Guardar en base de datos
                    $this->db->save_file(array(
                        'warranty_id' => $warranty_id,
                        'file_type' => $file_type,
                        'file_name' => $file_name,
                        'file_path' => $file_path,
                        'file_url' => $upload_dir['baseurl'] . '/rockstage-warranties/' . $warranty_id . '/' . $file_name,
                        'file_size' => $file['size'],
                        'mime_type' => $file_mime
                    ));
                    
                    $files_uploaded++;
                }
            }
        }
        
        return $files_uploaded;
    }
    
    /**
     * Obtener tipos MIME permitidos
     */
    private function get_allowed_mimes($file_type) {
        if ($file_type === 'video_demostracion') {
            return array('video/mp4', 'video/quicktime', 'video/x-msvideo');
        }
        
        return array('image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp');
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * ACTUALIZACIÓN DE GARANTÍAS (ADMIN)
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * AJAX: Actualizar estado de garantía
     */
    public function ajax_update_warranty_status() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $warranty_id = isset($_POST['warranty_id']) ? absint($_POST['warranty_id']) : 0;
        
        if (!$warranty_id) {
            wp_send_json_error(array('message' => 'ID inválido'));
        }
        
        $update_data = array();
        $note_text = '';
        
        // Check if updating status
        if (isset($_POST['status']) && !empty($_POST['status'])) {
            $new_status = sanitize_text_field($_POST['status']);
            $update_data['status'] = $new_status;
            $note_text = 'Estado cambiado a: ' . $new_status;
        }
        
        // Check if updating priority
        if (isset($_POST['priority']) && !empty($_POST['priority'])) {
            $new_priority = sanitize_text_field($_POST['priority']);
            $update_data['priority'] = $new_priority;
            $note_text = !empty($note_text) ? $note_text . ' | Prioridad: ' . $new_priority : 'Prioridad cambiada a: ' . $new_priority;
        }
        
        if (empty($update_data)) {
            wp_send_json_error(array('message' => 'Sin datos para actualizar'));
        }
        
        // Actualizar garantía
        $result = $this->db->update_warranty($warranty_id, $update_data);
        
        if ($result) {
            // Agregar nota
            $this->db->add_note($warranty_id, $note_text);
            
            // Enviar email al cliente si es aprobado o rechazado
            if (isset($update_data['status']) && in_array($update_data['status'], array('approved', 'rejected', 'completed'))) {
                $warranty = $this->db->get_warranty($warranty_id);
                $product = wc_get_product($warranty['product_id']);
                $warranty['product_name'] = $product ? $product->get_name() : 'Producto';
                
                $this->email->send_status_update_to_customer($warranty, $update_data['status']);
            }
            
            wp_send_json_success(array('message' => 'Actualizado correctamente'));
        }
        
        wp_send_json_error(array('message' => 'Error al actualizar'));
    }
    
    /**
     * AJAX: Agregar nota a garantía
     */
    public function ajax_add_warranty_note() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $warranty_id = isset($_POST['warranty_id']) ? absint($_POST['warranty_id']) : 0;
        $note = isset($_POST['note']) ? sanitize_textarea_field($_POST['note']) : '';
        
        if (!$warranty_id || !$note) {
            wp_send_json_error(array('message' => 'Datos inválidos'));
        }
        
        $result = $this->db->add_note($warranty_id, $note);
        
        if ($result) {
            wp_send_json_success(array('message' => 'Nota agregada'));
        }
        
        wp_send_json_error(array('message' => 'Error al agregar nota'));
    }
    
    /**
     * AJAX: Enviar respuesta personalizada al cliente
     */
    public function ajax_send_warranty_response() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $warranty_id = isset($_POST['warranty_id']) ? absint($_POST['warranty_id']) : 0;
        $subject = isset($_POST['subject']) ? sanitize_text_field($_POST['subject']) : '';
        $message = isset($_POST['message']) ? sanitize_textarea_field($_POST['message']) : '';
        
        if (!$warranty_id || !$subject || !$message) {
            wp_send_json_error(array('message' => 'Datos inválidos'));
        }
        
        // Obtener garantía
        $warranty = $this->db->get_warranty($warranty_id);
        $product = wc_get_product($warranty['product_id']);
        $warranty['product_name'] = $product ? $product->get_name() : 'Producto';
        
        // Enviar email
        $result = $this->email->send_custom_response_to_customer($warranty, $subject, $message);
        
        if ($result) {
            // Agregar nota
            $this->db->add_note($warranty_id, 'Email enviado: ' . $subject);
            
            wp_send_json_success(array('message' => 'Email enviado correctamente'));
        }
        
        wp_send_json_error(array('message' => 'Error al enviar email'));
    }
    
    /**
     * AJAX: Actualizar estado RMA
     */
    public function ajax_update_rma_status() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $rma_id = isset($_POST['rma_id']) ? absint($_POST['rma_id']) : 0;
        $new_status = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '';
        
        if (!$rma_id || !$new_status) {
            wp_send_json_error(array('message' => 'Datos inválidos'));
        }
        
        $result = $this->rma->update_rma_status($rma_id, $new_status);
        
        if ($result) {
            wp_send_json_success(array('message' => 'Estado RMA actualizado'));
        }
        
        wp_send_json_error(array('message' => 'Error al actualizar RMA'));
    }
    
    /**
     * AJAX: Eliminar garantía
     */
    public function ajax_delete_warranty() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $warranty_id = isset($_POST['warranty_id']) ? absint($_POST['warranty_id']) : 0;
        
        if (!$warranty_id) {
            wp_send_json_error(array('message' => 'ID inválido'));
        }
        
        $result = $this->db->delete_warranty($warranty_id);
        
        if ($result) {
            wp_send_json_success(array('message' => 'Garantía eliminada'));
        }
        
        wp_send_json_error(array('message' => 'Error al eliminar'));
    }
    
    /**
     * AJAX: Obtener garantías (para dashboard)
     */
    public function ajax_get_warranties() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $page = isset($_POST['page']) ? absint($_POST['page']) : 1;
        $status = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '';
        $search = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        
        $args = array(
            'limit' => 20,
            'offset' => ($page - 1) * 20
        );
        
        if (!empty($status)) {
            $args['status'] = $status;
        }
        
        if (!empty($search)) {
            $args['search'] = $search;
        }
        
        $warranties = $this->db->get_warranties($args);
        $total = $this->db->count_warranties($args);
        
        wp_send_json_success(array(
            'warranties' => $warranties,
            'total' => $total,
            'pages' => ceil($total / 20)
        ));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS Y CÁLCULOS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener días de garantía de un producto
     */
    private function get_product_warranty_days($product_id) {
        $categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));
        $categories_config = $this->settings->get_categories();
        
        foreach ($categories as $cat_id) {
            if (isset($categories_config[$cat_id]) && $categories_config[$cat_id]['enabled']) {
                return $categories_config[$cat_id]['days'];
            }
        }
        
        return 0;
    }
    
    /**
     * Calcular días hasta expiración
     */
    private function calculate_days_until_expiration($expiration_date) {
        $now = new DateTime();
        $expiration = new DateTime($expiration_date);
        
        if ($now > $expiration) {
            return 0;
        }
        
        return $now->diff($expiration)->days;
    }
    
    /**
     * Calcular prioridad automática
     */
    private function calculate_priority($order, $product, $description, $days_remaining) {
        $priority_config = $this->settings->get_priority_config();
        
        // Por defecto: normal
        $priority = 'normal';
        
        // Cliente VIP (muchos pedidos)
        $customer_id = $order->get_customer_id();
        if ($customer_id) {
            $customer_orders = wc_get_orders(array(
                'customer_id' => $customer_id,
                'status' => 'completed',
                'limit' => -1
            ));
            
            if (count($customer_orders) >= $priority_config['vip_min_orders']) {
                $priority = 'high';
            }
        }
        
        // Producto de alto valor
        if ($product->get_price() >= $priority_config['high_value_min']) {
            $priority = 'high';
        }
        
        // Garantía por vencer
        $warranty_days = $this->get_product_warranty_days($product->get_id());
        if ($warranty_days > 0) {
            $percentage_remaining = ($days_remaining / $warranty_days) * 100;
            if ($percentage_remaining <= $priority_config['expiring_percentage']) {
                $priority = 'high';
            }
        }
        
        // Palabras clave urgentes en descripción
        $urgent_keywords = explode(',', $priority_config['urgent_keywords']);
        $description_lower = strtolower($description);
        
        foreach ($urgent_keywords as $keyword) {
            if (strpos($description_lower, trim(strtolower($keyword))) !== false) {
                $priority = 'urgent';
                break;
            }
        }
        
        return $priority;
    }
    
    /**
     * AJAX: Buscar clientes y pedidos
     */
    public function ajax_search_customers() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $query = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
        
        if (strlen($query) < 3) {
            wp_send_json_error(array('message' => 'Consulta muy corta'));
        }
        
        // Search orders
        $orders = wc_get_orders(array(
            'limit' => 10,
            'orderby' => 'date',
            'order' => 'DESC',
            'status' => array('completed', 'processing'),
            'search' => $query
        ));
        
        $customers = array();
        
        foreach ($orders as $order) {
            $customers[] = array(
                'id' => $order->get_id(),
                'name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
                'order' => $order->get_order_number(),
                'date' => $order->get_date_created()->date('Y-m-d'),
                'purchaseDate' => $order->get_date_created()->date('Y-m-d')
            );
        }
        
        wp_send_json_success(array('customers' => $customers));
    }
    
    /**
     * AJAX: Guardar garantía desde admin (crear/editar)
     */
    public function ajax_save_warranty() {
        check_ajax_referer('rs_warranty_create', 'rs_warranty_create_nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $warranty_id = isset($_POST['warranty_id']) ? absint($_POST['warranty_id']) : 0;
        
        // Validate required fields
        $required = array('customer_name', 'customer_email', 'order_number', 'product_id', 'description');
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                wp_send_json_error(array('message' => 'Campos requeridos faltantes'));
            }
        }
        
        // Sanitize data
        $order_number = rs_sanitize_order_number($_POST['order_number']);
        $order = wc_get_order($order_number);
        
        if (!$order) {
            wp_send_json_error(array('message' => 'Pedido no encontrado'));
        }
        
        $product_id = absint($_POST['product_id']);
        $product = wc_get_product($product_id);
        
        if (!$product) {
            wp_send_json_error(array('message' => 'Producto no válido'));
        }
        
        // Calculate warranty dates
        $purchase_date = isset($_POST['purchase_date']) ? sanitize_text_field($_POST['purchase_date']) : $order->get_date_created()->date('Y-m-d H:i:s');
        $warranty_days = isset($_POST['warranty_period']) ? absint($_POST['warranty_period']) : 365;
        $expiration_date = date('Y-m-d H:i:s', strtotime($purchase_date . ' + ' . $warranty_days . ' days'));
        
        $warranty_data = array(
            'order_id' => $order->get_id(),
            'product_id' => $product_id,
            'customer_id' => $order->get_customer_id(),
            'customer_name' => sanitize_text_field($_POST['customer_name']),
            'customer_email' => sanitize_email($_POST['customer_email']),
            'customer_phone' => sanitize_text_field($_POST['customer_phone']),
            'description' => sanitize_textarea_field($_POST['description']),
            'status' => isset($_POST['status']) ? sanitize_text_field($_POST['status']) : 'pending',
            'priority' => isset($_POST['priority']) ? sanitize_text_field($_POST['priority']) : 'normal',
            'purchase_date' => $purchase_date,
            'warranty_expiration' => $expiration_date,
            'days_until_expiration' => $this->calculate_days_until_expiration($expiration_date)
        );
        
        if ($warranty_id) {
            // Update existing
            $result = $this->db->update_warranty($warranty_id, $warranty_data);
            $message = 'Garantía actualizada';
        } else {
            // Create new
            $warranty_id = $this->db->create_warranty($warranty_data);
            $result = $warranty_id ? true : false;
            $message = 'Garantía creada';
            
            // Process files if new warranty
            if ($warranty_id) {
                $this->process_uploaded_files($warranty_id);
                
                // Create RMA if enabled
                if (isset($_POST['generate_rma']) && get_option('rs_warranty_rma_enabled') === 'yes') {
                    $this->rma->create_rma($warranty_id);
                }
                
                // Send notifications
                if (isset($_POST['notify_customer'])) {
                    $warranty = $this->db->get_warranty($warranty_id);
                    $warranty['product_name'] = $product->get_name();
                    $this->email->send_confirmation_to_customer($warranty);
                }
                
                if (isset($_POST['notify_admin'])) {
                    $warranty = $this->db->get_warranty($warranty_id);
                    $warranty['product_name'] = $product->get_name();
                    $this->email->send_new_warranty_to_team($warranty);
                }
            }
        }
        
        if ($result) {
            wp_send_json_success(array(
                'message' => $message,
                'warranty_id' => $warranty_id
            ));
        }
        
        wp_send_json_error(array('message' => 'Error al guardar'));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CATEGORY CONFIG ENDPOINTS (DOZO REQUIREMENT)
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * AJAX: Sync categories from WooCommerce
     */
    public function ajax_sync_categories() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        // Get all WooCommerce product categories
        $wc_categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false
        ));
        
        if (is_wp_error($wc_categories)) {
            wp_send_json_error(array('message' => 'Error al obtener categorías de WooCommerce'));
        }
        
        $saved_categories = get_option('rs_warranty_categories', array());
        $synced_count = 0;
        
        foreach ($wc_categories as $wc_cat) {
            if (!isset($saved_categories[$wc_cat->term_id])) {
                $saved_categories[$wc_cat->term_id] = array(
                    'name' => $wc_cat->name,
                    'slug' => $wc_cat->slug,
                    'days' => 365,
                    'hours' => 0,
                    'text' => '1 año de garantía',
                    'active' => true
                );
                $synced_count++;
            } else {
                // Update name/slug if changed
                $saved_categories[$wc_cat->term_id]['name'] = $wc_cat->name;
                $saved_categories[$wc_cat->term_id]['slug'] = $wc_cat->slug;
            }
        }
        
        update_option('rs_warranty_categories', $saved_categories);
        
        // DOZO v3.6: Trigger hook for bulk update
        do_action('rs_after_categories_sync', $saved_categories);
        
        wp_send_json_success(array(
            'message' => "Sincronizadas {$synced_count} categorías nuevas",
            'total' => count($wc_categories)
        ));
    }
    
    /**
     * AJAX: Save single category configuration
     */
    public function ajax_save_category() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        // DOZO v4.0: Prevenir requests duplicados con transient
        $transient_key = 'rs_saving_cat_' . get_current_user_id();
        if (get_transient($transient_key)) {
            wp_send_json_error(array('message' => 'Proceso duplicado detectado. Espera un momento.'), 429);
        }
        set_transient($transient_key, true, 3); // Bloqueo de 3 segundos
        
        $category_id = isset($_POST['category_id']) ? absint($_POST['category_id']) : 0;
        $category_name = isset($_POST['category_name']) ? sanitize_text_field($_POST['category_name']) : '';
        $days = isset($_POST['days']) ? absint($_POST['days']) : 0;
        $hours = isset($_POST['hours']) ? absint($_POST['hours']) : 0;
        $text = isset($_POST['text']) ? sanitize_text_field($_POST['text']) : '';
        $active = isset($_POST['active']) ? (bool)$_POST['active'] : false;
        
        if (!$category_id) {
            wp_send_json_error(array('message' => 'ID de categoría inválido'));
        }
        
        // Get category term to get slug
        $term = get_term($category_id, 'product_cat');
        if (is_wp_error($term) || !$term) {
            wp_send_json_error(array('message' => 'Categoría no encontrada'));
        }
        
        // DOZO v3.7: Incremental merge (preserva otras categorías)
        $saved_categories = get_option('rs_warranty_categories', array());
        
        // Log estado previo (debugging)
        $prev_count = count($saved_categories);
        $prev_active = array_filter($saved_categories, function($cat) { return !empty($cat['active']); });
        
        // Actualizar SOLO esta categoría (merge incremental, NO overwrite)
        $saved_categories[$category_id] = array(
            'name' => $category_name,
            'slug' => $term->slug,
            'days' => $days,
            'hours' => $hours,
            'text' => $text,
            'active' => $active
        );
        
        update_option('rs_warranty_categories', $saved_categories);
        
        // Log estado posterior (debugging)
        $new_count = count($saved_categories);
        $new_active = array_filter($saved_categories, function($cat) { return !empty($cat['active']); });
        error_log(sprintf(
            'DOZO v3.7: Guardado incremental - Categoría ID:%d | Total: %d→%d | Activas: %d→%d',
            $category_id,
            $prev_count,
            $new_count,
            count($prev_active),
            count($new_active)
        ));
        
        // DOZO v3.6: Trigger hook for product linking
        do_action('rs_after_category_save', $category_id, $saved_categories[$category_id]);
        
        // DOZO v4.0: Limpiar transient antes de responder
        delete_transient($transient_key);
        
        // DOZO v5.2: Calculate and return updated counters
        $active_count = 0;
        $inactive_count = 0;
        foreach ($saved_categories as $cat) {
            if (!empty($cat['active'])) {
                $active_count++;
            } else {
                $inactive_count++;
            }
        }
        
        wp_send_json_success(array(
            'message' => 'Configuración guardada correctamente',
            'category' => $saved_categories[$category_id],
            'active_count' => $active_count,
            'inactive_count' => $inactive_count
        ));
    }
    
    /**
     * AJAX: Delete category configuration
     */
    public function ajax_delete_category() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $category_id = isset($_POST['category_id']) ? absint($_POST['category_id']) : 0;
        
        if (!$category_id) {
            wp_send_json_error(array('message' => 'ID de categoría inválido'));
        }
        
        $saved_categories = get_option('rs_warranty_categories', array());
        
        if (isset($saved_categories[$category_id])) {
            unset($saved_categories[$category_id]);
            update_option('rs_warranty_categories', $saved_categories);
            
            // DOZO v5.2: Calculate and return updated counters
            $active_count = 0;
            $inactive_count = 0;
            foreach ($saved_categories as $cat) {
                if (!empty($cat['active'])) {
                    $active_count++;
                } else {
                    $inactive_count++;
                }
            }
            
            wp_send_json_success(array(
                'message' => 'Configuración eliminada',
                'active_count' => $active_count,
                'inactive_count' => $inactive_count
            ));
        } else {
            wp_send_json_error(array('message' => 'Configuración no encontrada'));
        }
    }
    
    /**
     * AJAX: Restore default categories
     */
    public function ajax_restore_default_categories() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        // Get all WooCommerce categories and set defaults
        $wc_categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false
        ));
        
        if (is_wp_error($wc_categories)) {
            wp_send_json_error(array('message' => 'Error al obtener categorías'));
        }
        
        $default_categories = array();
        
        foreach ($wc_categories as $wc_cat) {
            $default_categories[$wc_cat->term_id] = array(
                'name' => $wc_cat->name,
                'slug' => $wc_cat->slug,
                'days' => 365,
                'hours' => 0,
                'text' => '1 año de garantía',
                'active' => true
            );
        }
        
        update_option('rs_warranty_categories', $default_categories);
        
        // DOZO v3.6: Trigger hook for bulk update
        do_action('rs_after_categories_sync', $default_categories);
        
        wp_send_json_success(array(
            'message' => 'Configuraciones restauradas a predeterminadas',
            'count' => count($default_categories)
        ));
    }
    
    /**
     * AJAX: Save all categories (batch update)
     */
    public function ajax_save_all_categories() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $categories = isset($_POST['categories']) ? $_POST['categories'] : array();
        
        if (!is_array($categories) || empty($categories)) {
            wp_send_json_error(array('message' => 'Sin datos para guardar'));
        }
        
        // Sanitize all categories
        $sanitized = array();
        foreach ($categories as $cat_id => $config) {
            $cat_id = absint($cat_id);
            if ($cat_id > 0 && is_array($config)) {
                $term = get_term($cat_id, 'product_cat');
                if (!is_wp_error($term) && $term) {
                    $sanitized[$cat_id] = array(
                        'name' => isset($config['name']) ? sanitize_text_field($config['name']) : '',
                        'slug' => $term->slug,
                        'days' => isset($config['days']) ? absint($config['days']) : 0,
                        'hours' => isset($config['hours']) ? absint($config['hours']) : 0,
                        'text' => isset($config['text']) ? sanitize_text_field($config['text']) : '',
                        'active' => isset($config['active']) ? (bool)$config['active'] : false
                    );
                }
            }
        }
        
        if (empty($sanitized)) {
            wp_send_json_error(array('message' => 'Sin datos válidos'));
        }
        
        update_option('rs_warranty_categories', $sanitized);
        
        // DOZO v3.6: Trigger hook for bulk update
        do_action('rs_after_categories_sync', $sanitized);
        
        wp_send_json_success(array(
            'message' => 'Todas las configuraciones guardadas correctamente',
            'count' => count($sanitized)
        ));
    }
    
    /**
     * AJAX: Get categories table HTML (DOZO v3.5)
     * Returns updated table HTML and statistics without page reload
     */
    public function ajax_get_categories_table() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $saved_categories = get_option('rs_warranty_categories', array());
        $active_count = 0;
        $inactive_count = 0;
        
        ob_start();
        
        if (!empty($saved_categories)) {
            foreach ($saved_categories as $cat_id => $config) {
                $is_active = isset($config['active']) && $config['active'];
                $active_count += $is_active ? 1 : 0;
                $inactive_count += !$is_active ? 1 : 0;
                
                $days = isset($config['days']) ? $config['days'] : 0;
                $hours = isset($config['hours']) ? $config['hours'] : 0;
                $text = isset($config['text']) ? $config['text'] : '';
                $name = isset($config['name']) ? $config['name'] : 'Categoría';
                
                $total_text = $days . ' días';
                if ($hours > 0) {
                    $total_text .= ' ' . $hours . 'h';
                }
                ?>
                <tr class="category-row <?php echo $is_active ? 'active' : 'inactive'; ?>" data-category-id="<?php echo esc_attr($cat_id); ?>">
                    <td>
                        <span class="rs-badge rs-badge--<?php echo $is_active ? 'success' : 'error'; ?>">
                            <i class="rs-icon rs-icon--xs" data-icon="<?php echo $is_active ? 'check-circle' : 'x-circle'; ?>"></i>
                            <?php echo $is_active ? 'Activa' : 'Inactiva'; ?>
                        </span>
                    </td>
                    <td>
                        <div class="category-name-cell">
                            <i class="rs-icon rs-icon--sm" data-icon="folder"></i>
                            <strong><?php echo esc_html($name); ?></strong>
                        </div>
                    </td>
                    <td><span class="time-value"><?php echo esc_html($days); ?></span></td>
                    <td><span class="time-value"><?php echo esc_html($hours); ?></span></td>
                    <td><strong><?php echo esc_html($total_text); ?></strong></td>
                    <td><span class="friendly-text"><?php echo esc_html($text); ?></span></td>
                    <td>
                        <div class="rs-actions rs-actions--compact">
                            <button type="button" class="rs-icon-button rs-icon-button--edit" onclick="rsEditCategory(<?php echo esc_attr($cat_id); ?>)" title="Editar">
                                <i class="rs-icon rs-icon--sm" data-icon="edit"></i>
                            </button>
                            <button type="button" class="rs-icon-button rs-icon-button--delete" onclick="rsDeleteCategory(<?php echo esc_attr($cat_id); ?>)" title="Eliminar">
                                <i class="rs-icon rs-icon--sm" data-icon="trash-2"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php
            }
        } else {
            ?>
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="rs-icon" data-icon="inbox" style="font-size: 48px; opacity: 0.3;"></i>
                    <p style="margin: 16px 0 0; color: #6B7280;">No hay configuraciones guardadas</p>
                    <p style="margin: 8px 0 0; color: #9CA3AF; font-size: 14px;">Haz clic en "Sincronizar con WooCommerce" para comenzar</p>
                </td>
            </tr>
            <?php
        }
        
        $table_html = ob_get_clean();
        
        wp_send_json_success(array(
            'html' => $table_html,
            'active_count' => $active_count,
            'inactive_count' => $inactive_count,
            'total_count' => count($saved_categories)
        ));
    }
    
    /**
     * Get category statistics (DOZO v3.5)
     * Returns counts of active/inactive categories
     */
    public function get_category_stats() {
        $saved_categories = get_option('rs_warranty_categories', array());
        $active_count = 0;
        $inactive_count = 0;
        
        foreach ($saved_categories as $cat_id => $config) {
            $is_active = isset($config['active']) && $config['active'];
            $active_count += $is_active ? 1 : 0;
            $inactive_count += !$is_active ? 1 : 0;
        }
        
        return array(
            'active' => $active_count,
            'inactive' => $inactive_count,
            'total' => count($saved_categories)
        );
    }
    
    /**
     * AJAX: Get category statistics (DOZO v3.7)
     * Returns real-time counts for dynamic counter refresh
     */
    public function ajax_get_category_stats() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $stats = $this->get_category_stats();
        
        wp_send_json_success($stats);
    }
    
    /**
     * DOZO v4.8: Save audit log to JSON file
     */
    public function ajax_save_dozo_audit() {
        // Permitir sin nonce para diagnósticos automáticos
        // Solo requiere capacidad de admin
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $audit_data = isset($_POST['audit_data']) ? $_POST['audit_data'] : '';
        
        if (empty($audit_data)) {
            wp_send_json_error(array('message' => 'Datos de auditoría vacíos'));
        }
        
        // Decodificar JSON
        $data = json_decode(stripslashes($audit_data), true);
        
        if (!$data) {
            wp_send_json_error(array('message' => 'JSON inválido'));
        }
        
        // Ruta del archivo
        $upload_dir = wp_upload_dir();
        $dozo_dir = $upload_dir['basedir'] . '/dozo-audits';
        
        // Crear directorio si no existe
        if (!file_exists($dozo_dir)) {
            wp_mkdir_p($dozo_dir);
            
            // Proteger con .htaccess
            $htaccess = $dozo_dir . '/.htaccess';
            if (!file_exists($htaccess)) {
                file_put_contents($htaccess, 'Deny from all');
            }
        }
        
        // Archivo de auditoría
        $audit_file = $dozo_dir . '/dozo_audit_history.json';
        
        // Cargar historial existente
        $history = array();
        if (file_exists($audit_file)) {
            $content = file_get_contents($audit_file);
            $history = json_decode($content, true) ?: array();
        }
        
        // Agregar nuevo registro
        $history[] = $data;
        
        // Mantener solo últimos 100 registros
        if (count($history) > 100) {
            $history = array_slice($history, -100);
        }
        
        // Guardar
        $saved = file_put_contents($audit_file, json_encode($history, JSON_PRETTY_PRINT));
        
        if ($saved === false) {
            wp_send_json_error(array('message' => 'Error al guardar audit log'));
        }
        
        wp_send_json_success(array(
            'message' => 'Audit log guardado exitosamente',
            'file' => $audit_file,
            'total_audits' => count($history)
        ));
    }
    
    /**
     * DOZO v4.9: Diagnostic ping endpoint (backend validation)
     */
    public function ajax_diagnostic_ping() {
        // Permitir sin nonce para diagnósticos automáticos
        
        wp_send_json_success(array(
            'status' => 'ok',
            'timestamp' => current_time('timestamp'),
            'version' => RS_WARRANTY_VERSION,
            'php_version' => phpversion(),
            'wp_version' => get_bloginfo('version'),
            'woocommerce_active' => class_exists('WooCommerce')
        ));
    }
    
    /**
     * DOZO v4.9: Run full diagnostic with cleanup (Reaper Layer)
     */
    public function ajax_run_dozo_diagnostic() {
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $results = array(
            'timestamp' => current_time('mysql'),
            'version' => RS_WARRANTY_VERSION,
            'cleanup' => array(),
            'validation' => array(),
            'healing' => array(),
            'backup' => array()
        );
        
        // 1. REAPER LAYER: Limpiar archivos obsoletos
        $cleanup_result = $this->cleanup_obsolete_files();
        $results['cleanup'] = $cleanup_result;
        
        // 2. VALIDATION: Verificar integridad de archivos críticos
        $validation_result = $this->validate_critical_files();
        $results['validation'] = $validation_result;
        
        // 3. HEALING: Auto-corrección si es necesario
        $healing_result = $this->self_healing_check();
        $results['healing'] = $healing_result;
        
        // 4. Generar mensaje de resumen
        $message = sprintf(
            "✅ DOZO Diagnostic completado\n\n" .
            "🧹 Archivos obsoletos movidos: %d\n" .
            "✅ Archivos críticos válidos: %d/%d\n" .
            "🔧 Fixes aplicados: %d\n" .
            "📦 Backup directory: %s",
            count($cleanup_result['moved']),
            $validation_result['valid'],
            $validation_result['total'],
            count($healing_result['fixed']),
            $cleanup_result['backup_dir']
        );
        
        wp_send_json_success(array(
            'message' => $message,
            'results' => $results
        ));
    }
    
    /**
     * DOZO v4.9: Cleanup obsolete files (Reaper Layer)
     */
    private function cleanup_obsolete_files() {
        $plugin_dir = RS_WARRANTY_PLUGIN_DIR;
        $backup_dir = $plugin_dir . 'backup-dozo/obsolete/';
        $moved = array();
        
        // Patrones de archivos obsoletos
        $patterns = array('*.bak', '*.old', '*.tmp', '*.obsolete', '*~');
        
        foreach ($patterns as $pattern) {
            $files = glob($plugin_dir . $pattern);
            
            foreach ($files as $file) {
                if (file_exists($file) && is_file($file)) {
                    // Crear backup dir si no existe
                    if (!file_exists($backup_dir)) {
                        wp_mkdir_p($backup_dir);
                    }
                    
                    $basename = basename($file);
                    $destination = $backup_dir . $basename;
                    
                    // Mover archivo (no eliminar)
                    if (rename($file, $destination)) {
                        $moved[] = $basename;
                        error_log('🧹 DOZO v4.9: Archivo obsoleto movido - ' . $basename);
                    }
                }
            }
        }
        
        return array(
            'moved' => $moved,
            'backup_dir' => $backup_dir,
            'count' => count($moved)
        );
    }
    
    /**
     * DOZO v4.9: Validate critical files exist and are readable
     */
    private function validate_critical_files() {
        $critical_files = array(
            'rockstage-warranty-system.php',
            'includes/class-warranty-core.php',
            'includes/class-warranty-database.php',
            'includes/class-warranty-admin.php',
            'includes/class-warranty-frontend.php',
            'assets/js/admin-categories.js',
            'assets/js/dozo-diagnostic.js',
            'assets/css/public-style.css'
        );
        
        $valid = 0;
        $invalid = array();
        
        foreach ($critical_files as $file) {
            $full_path = RS_WARRANTY_PLUGIN_DIR . $file;
            
            if (file_exists($full_path) && is_readable($full_path)) {
                $valid++;
            } else {
                $invalid[] = $file;
            }
        }
        
        return array(
            'valid' => $valid,
            'total' => count($critical_files),
            'invalid' => $invalid,
            'percentage' => ($valid / count($critical_files)) * 100
        );
    }
    
    /**
     * DOZO v4.9: Self-healing check (auto-repair)
     */
    private function self_healing_check() {
        $fixed = array();
        
        // Check 1: Verify nonce-validator exists
        $nonce_validator = RS_WARRANTY_PLUGIN_DIR . 'tools/nonce-validator.php';
        if (!file_exists($nonce_validator)) {
            error_log('⚠️ DOZO v4.9: nonce-validator.php faltante');
            // Aquí podríamos recrearlo si tuviéramos el template
        }
        
        // Check 2: Verify backup-dozo directory exists
        $backup_dir = RS_WARRANTY_PLUGIN_DIR . 'backup-dozo/';
        if (!file_exists($backup_dir)) {
            wp_mkdir_p($backup_dir);
            $fixed[] = 'backup-dozo directory created';
        }
        
        // Check 3: Verify dozo-audits directory in uploads
        $upload_dir = wp_upload_dir();
        $dozo_audits = $upload_dir['basedir'] . '/dozo-audits';
        if (!file_exists($dozo_audits)) {
            wp_mkdir_p($dozo_audits);
            file_put_contents($dozo_audits . '/.htaccess', 'Deny from all');
            $fixed[] = 'dozo-audits directory created';
        }
        
        return array(
            'fixed' => $fixed,
            'count' => count($fixed)
        );
    }
    
    /**
     * Actualizar días restantes de todas las garantías (Cron diario)
     */
    public function update_warranty_days() {
        global $wpdb;
        $table = $wpdb->prefix . 'rs_warranties';
        
        // Actualizar solo garantías no completadas
        $wpdb->query("
            UPDATE {$table}
            SET days_until_expiration = GREATEST(0, DATEDIFF(warranty_expiration, NOW()))
            WHERE status NOT IN ('completed', 'rejected')
        ");
    }
    
    /**
     * DOZO v7.0: Get system health score
     */
    public function ajax_get_health_score() {
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        // Get health score from Reaper Cleaner
        $reaper = RS_DOZO_Reaper_Cleaner::get_instance();
        $score = $reaper->get_health_score();
        
        wp_send_json_success(array(
            'score' => $score,
            'timestamp' => current_time('mysql'),
            'version' => RS_DOZO_VERSION
        ));
    }
}

<?php
/**
 * Claude HTML Integration
 * DOZO Deep Audit v6.1 - Smart State Integration
 * 
 * Integrates Claude-designed HTML templates directly into WordPress shortcodes
 * with dynamic PHP variable support, AJAX compatibility, and fallback system.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v6.1
 * @since 6.1.0
 */

defined('ABSPATH') || exit;

class RS_Claude_HTML_Integration {
    private static $instance = null;
    
    /**
     * Claude templates path
     */
    private $claude_path;
    
    /**
     * Fallback to plugin templates
     */
    private $use_fallback = false;
    
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
        $this->claude_path = defined('RS_CLAUDE_TEMPLATES_PATH') ? RS_CLAUDE_TEMPLATES_PATH : '';
        
        // Verify Claude templates availability
        add_action('init', array($this, 'verify_claude_templates'), 1);
        
        // Override default shortcodes with Claude templates
        add_action('init', array($this, 'register_claude_shortcodes'), 20);
        
        // Enqueue Claude-specific scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_claude_scripts'), 10);
        
        // AJAX handlers (if needed)
        add_action('wp_ajax_nopriv_rs_verify_order', array($this, 'ajax_verify_order'));
        add_action('wp_ajax_rs_verify_order', array($this, 'ajax_verify_order'));
    }
    
    /**
     * Verify Claude templates are available
     */
    public function verify_claude_templates() {
        if (empty($this->claude_path) || !file_exists($this->claude_path)) {
            $this->use_fallback = true;
            error_log('DOZO v6.1: Claude templates path not found, using plugin fallback');
            return;
        }
        
        $required_files = array(
            'warranty-verifier-preview.html',
            'warranty-verifier-all-states.html'
        );
        
        $missing_files = array();
        foreach ($required_files as $file) {
            if (!file_exists($this->claude_path . $file)) {
                $missing_files[] = $file;
            }
        }
        
        if (!empty($missing_files)) {
            $this->use_fallback = true;
            error_log('DOZO v6.1: Missing Claude templates: ' . implode(', ', $missing_files) . ' - using fallback');
        } else {
            error_log('DOZO v6.1: Claude templates verified and ready');
        }
    }
    
    /**
     * Register Claude-powered shortcodes
     */
    public function register_claude_shortcodes() {
        // Remove default shortcodes if they exist
        remove_shortcode('rs_warranty_form');
        remove_shortcode('rs_warranty_check');
        
        // Register Claude-powered shortcodes
        add_shortcode('rs_warranty_form', array($this, 'render_warranty_form'));
        add_shortcode('rs_warranty_check', array($this, 'render_warranty_check'));
        
        error_log('DOZO v6.1: Claude shortcodes registered');
    }
    
    /**
     * Render warranty form shortcode
     */
    public function render_warranty_form($atts) {
        $atts = shortcode_atts(array(
            'theme' => 'default'
        ), $atts, 'rs_warranty_form');
        
        // Use Claude template if available
        if (!$this->use_fallback && file_exists($this->claude_path . 'warranty-verifier-preview.html')) {
            return $this->render_claude_template('warranty-verifier-preview.html');
        }
        
        // Fallback to plugin template
        ob_start();
        include RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-form.php';
        return ob_get_clean();
    }
    
    /**
     * Render warranty check shortcode (all states)
     */
    public function render_warranty_check($atts) {
        $atts = shortcode_atts(array(
            'order_id' => ''
        ), $atts, 'rs_warranty_check');
        
        // Use Claude template if available
        if (!$this->use_fallback && file_exists($this->claude_path . 'warranty-verifier-all-states.html')) {
            return $this->render_claude_template('warranty-verifier-all-states.html');
        }
        
        // Fallback to plugin template
        ob_start();
        include RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-verifier.php';
        return ob_get_clean();
    }
    
    /**
     * Render Claude HTML template with PHP variable support
     */
    private function render_claude_template($filename) {
        $template_path = $this->claude_path . $filename;
        
        if (!file_exists($template_path)) {
            error_log('DOZO v6.1: Claude template not found: ' . $filename);
            return '<p>Error: Template not found</p>';
        }
        
        // Read template content
        $content = file_get_contents($template_path);
        
        // Extract inline CSS and JS (they're embedded in the HTML)
        // Note: Claude templates have <style> and <script> tags inline
        // We'll keep them as-is since they're self-contained
        
        // Wrap in div with Claude marker
        $output = '<div class="rs-claude-template" data-claude-version="6.1" data-template="' . esc_attr($filename) . '">';
        
        // Extract only the body content (remove <!DOCTYPE>, <html>, <head>, etc.)
        if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $content, $matches)) {
            $output .= $matches[1];
        } else {
            // If no body tag, use entire content
            $output .= $content;
        }
        
        $output .= '</div>';
        
        // Log successful render
        error_log('DOZO v6.1: Claude template rendered: ' . $filename);
        
        return $output;
    }
    
    /**
     * Enqueue Claude-specific scripts
     */
    public function enqueue_claude_scripts() {
        // Only on pages with warranty shortcodes
        global $post;
        if (!is_a($post, 'WP_Post')) {
            return;
        }
        
        if (!has_shortcode($post->post_content, 'rs_warranty_form') && 
            !has_shortcode($post->post_content, 'rs_warranty_check')) {
            return;
        }
        
        // Localize script with AJAX variables
        wp_localize_script('rs-warranty-public-claude', 'rsWarranty', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rs_warranty_nonce'),
            'strings' => array(
                'order_required' => 'Por favor ingresa tu número de pedido',
                'checking' => 'Verificando...',
                'error' => 'Error al verificar el pedido'
            )
        ));
        
        error_log('DOZO v6.1: Claude AJAX variables localized');
    }
    
    /**
     * AJAX: Verify order (for Claude templates)
     */
    public function ajax_verify_order() {
        // Verify nonce
        if (!isset($_POST['_ajax_nonce']) || !wp_verify_nonce($_POST['_ajax_nonce'], 'rs_warranty_nonce')) {
            wp_send_json_error(array('message' => 'Verificación de seguridad falló'));
        }
        
        $order_number = isset($_POST['order_number']) ? absint($_POST['order_number']) : 0;
        
        if (!$order_number) {
            wp_send_json_error(array('message' => 'Número de pedido inválido'));
        }
        
        // Get order
        $order = wc_get_order($order_number);
        
        if (!$order) {
            wp_send_json_error(array(
                'message' => 'Pedido no encontrado',
                'state' => 'notfound'
            ));
        }
        
        // Get warranty categories
        $saved_categories = get_option('rs_warranty_categories', array());
        
        // Get order items
        $items = $order->get_items();
        $products_html = '';
        
        foreach ($items as $item) {
            $product = $item->get_product();
            if (!$product) continue;
            
            // Get product categories
            $product_cats = wp_get_post_terms($product->get_id(), 'product_cat', array('fields' => 'ids'));
            
            // Check warranty configuration
            $warranty_info = null;
            foreach ($product_cats as $cat_id) {
                if (isset($saved_categories[$cat_id]) && !empty($saved_categories[$cat_id]['active'])) {
                    $warranty_info = $saved_categories[$cat_id];
                    break;
                }
            }
            
            if ($warranty_info) {
                $warranty_days = isset($warranty_info['days']) ? $warranty_info['days'] : 0;
                $order_date = $order->get_date_created();
                $expiry_date = clone $order_date;
                $expiry_date->modify('+' . $warranty_days . ' days');
                
                $today = new DateTime();
                $days_remaining = $today->diff($expiry_date)->days;
                $is_expired = $today > $expiry_date;
                
                // Build product HTML
                $products_html .= '<div class="product-item">';
                $products_html .= '<div class="product-info">';
                $products_html .= '<div class="product-name">' . esc_html($product->get_name()) . '</div>';
                $products_html .= '<div class="product-meta">';
                $products_html .= '<span>Comprado: ' . esc_html($order_date->date_i18n('d/m/Y')) . '</span>';
                $products_html .= '<span class="warranty-badge ' . ($is_expired ? 'expired' : '') . '">';
                $products_html .= $is_expired ? '⏰ Garantía expirada' : '✓ ' . $days_remaining . ' días restantes';
                $products_html .= '</span>';
                $products_html .= '</div>';
                $products_html .= '</div>';
                $products_html .= '</div>';
            }
        }
        
        if (empty($products_html)) {
            wp_send_json_error(array(
                'message' => 'No se encontraron productos con garantía',
                'state' => 'nowarranty'
            ));
        }
        
        wp_send_json_success(array(
            'html' => $products_html,
            'state' => 'found',
            'order_date' => $order->get_date_created()->date_i18n('d/m/Y')
        ));
    }
    
    /**
     * Get integration status
     */
    public function get_status() {
        return array(
            'claude_path' => $this->claude_path,
            'claude_path_exists' => file_exists($this->claude_path),
            'use_fallback' => $this->use_fallback,
            'templates_available' => !$this->use_fallback,
            'files' => $this->check_template_files()
        );
    }
    
    /**
     * Check template files
     */
    private function check_template_files() {
        if (empty($this->claude_path) || !file_exists($this->claude_path)) {
            return array();
        }
        
        $files = array(
            'warranty-verifier-preview.html' => file_exists($this->claude_path . 'warranty-verifier-preview.html'),
            'warranty-verifier-all-states.html' => file_exists($this->claude_path . 'warranty-verifier-all-states.html')
        );
        
        return $files;
    }
}

// Initialize
RS_Claude_HTML_Integration::get_instance();


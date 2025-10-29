<?php
/**
 * RockStage Warranty System - Frontend Class
 * 
 * Gestión del formulario público de garantías:
 * - Shortcode [rockstage_warranty_form]
 * - Interfaz de 4 pasos
 * - Verificación de pedido
 * - Formulario de solicitud
 * - Enqueue de assets
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase para gestionar el frontend público
 */
class RS_Warranty_Frontend {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Frontend
     */
    private static $instance = null;
    
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
        $this->settings = RS_Warranty_Settings::get_instance();
        $this->init_hooks();
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Frontend
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
        // Registrar shortcode
        add_shortcode('rockstage_warranty_form', array($this, 'render_warranty_form'));
        
        // Shortcode aliases para compatibilidad
        add_shortcode('rs_warranty_form', array($this, 'render_warranty_form'));
        add_shortcode('warranty_form', array($this, 'render_warranty_form'));
        
        // Enqueue scripts y estilos
        add_action('wp_enqueue_scripts', array($this, 'enqueue_public_assets'));
        
        // DOZO Shortcode Execution Layer - Filtros universales
        add_filter('the_content', 'do_shortcode', 11);
        add_filter('widget_text', 'do_shortcode');
        add_filter('widget_block_content', 'do_shortcode');
        
        // Compatibilidad con constructores de páginas
        add_filter('elementor/widget/render_content', 'do_shortcode');
        add_filter('fl_builder_before_render_shortcodes', 'do_shortcode');
        
        // Forzar ejecución si tema no lo hace
        add_filter('the_content', array($this, 'force_shortcode_execution'), 12);
    }
    
    /**
     * Forzar ejecución de shortcodes (DOZO Execution Layer)
     * Asegura que shortcodes se ejecuten incluso si tema no aplica do_shortcode
     */
    public function force_shortcode_execution($content) {
        if (strpos($content, '[') !== false && strpos($content, 'rs_warranty') !== false) {
            return do_shortcode($content);
        }
        return $content;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * ENQUEUE DE ASSETS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Cargar CSS y JavaScript público
     */
    public function enqueue_public_assets() {
        // Detectar si hay shortcode en la página (compatible con bloques)
        global $post;
        
        $should_enqueue = false;
        
        if (is_a($post, 'WP_Post')) {
            // Verificar shortcodes estándar
            if (has_shortcode($post->post_content, 'rockstage_warranty_form') ||
                has_shortcode($post->post_content, 'rs_warranty_form') ||
                has_shortcode($post->post_content, 'warranty_form')) {
                $should_enqueue = true;
            }
            
            // Verificar bloques de Gutenberg
            if (function_exists('has_block') && has_block('shortcode', $post)) {
                if (strpos($post->post_content, 'rockstage_warranty_form') !== false ||
                    strpos($post->post_content, 'rs_warranty_form') !== false) {
                    $should_enqueue = true;
                }
            }
        }
        
        // Forzar carga en páginas con query param (testing)
        if (isset($_GET['warranty_debug'])) {
            $should_enqueue = true;
        }
        
        if (!$should_enqueue) {
            return;
        }
        
        // Google Fonts
        wp_enqueue_style(
            'rs-warranty-google-fonts',
            'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap',
            array(),
            null
        );
        
        // CSS público
        wp_enqueue_style(
            'rs-warranty-public-css',
            RS_WARRANTY_ASSETS_URL . 'css/public-style.css',
            array(),
            RS_WARRANTY_VERSION
        );
        
        // JavaScript público
        wp_enqueue_script(
            'rs-warranty-public-js',
            RS_WARRANTY_ASSETS_URL . 'js/public-script.js',
            array('jquery'),
            RS_WARRANTY_VERSION,
            true
        );
        
        // JavaScript para warranty verifier (DOZO v3.2)
        wp_enqueue_script(
            'rs-warranty-verifier-js',
            RS_WARRANTY_ASSETS_URL . 'js/warranty-verifier.js',
            array('jquery', 'rs-warranty-public-js'),
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
        
        // Obtener configuración
        $file_limits = $this->settings->get_file_limits();
        $whatsapp_config = $this->settings->get_whatsapp_config();
        
        // Localizar script con datos
        wp_localize_script('rs-warranty-public-js', 'rsWarranty', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rs_warranty_nonce'),
            'fileLimits' => array(
                'maxPhotos' => $file_limits['max_photos'],
                'maxPhotoSize' => $file_limits['max_photo_size'] * 1024 * 1024, // Convertir a bytes
                'requirePhoto' => $file_limits['require_photo'] === 'yes',
                'maxVideoSize' => $file_limits['max_video_size'] * 1024 * 1024, // Convertir a bytes
                'maxVideoDuration' => $file_limits['max_video_duration'],
                'allowVideo' => $file_limits['allow_video'] === 'yes'
            ),
            'whatsapp' => array(
                'enabled' => $whatsapp_config['enabled'] === 'yes',
                'number' => $whatsapp_config['number'],
                'message' => $whatsapp_config['message']
            ),
            'strings' => array(
                'verifying' => 'Verificando pedido...',
                'submitting' => 'Enviando solicitud...',
                'error' => 'Error al procesar la solicitud',
                'invalidOrder' => 'Número de pedido inválido',
                'noWarranty' => 'Este pedido no tiene productos con garantía válida',
                'fillRequired' => 'Por favor completa todos los campos requeridos',
                'acceptTerms' => 'Debes aceptar los términos y condiciones',
                'photoRequired' => 'Debes subir al menos una foto del defecto',
                'fileTooLarge' => 'El archivo es demasiado grande',
                'invalidFileType' => 'Tipo de archivo no permitido',
                'success' => '¡Solicitud enviada exitosamente!',
                'warrantyNumber' => 'Número de garantía:'
            )
        ));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * SHORTCODE
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Renderizar formulario de garantía
     * 
     * @param array $atts Atributos del shortcode
     * @return string HTML del formulario
     */
    public function render_warranty_form($atts) {
        // Atributos por defecto
        $atts = shortcode_atts(array(
            'title' => 'Verificar Garantía',
            'subtitle' => 'Ingresa tu número de pedido para verificar el estado de tu garantía',
            'theme' => 'rockstage', // rockstage, neutral, vapedot
            'mode' => 'verifier' // verifier (nuevo) o classic (antiguo)
        ), $atts, 'rockstage_warranty_form');
        
        // Iniciar buffer
        ob_start();
        
        // Seleccionar template según el modo (DOZO v3.2)
        if ($atts['mode'] === 'classic') {
            // Template clásico de 4 pasos
            include RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-form.php';
        } else {
            // Nuevo template de verificación inteligente (DOZO v3.2)
            include RS_WARRANTY_TEMPLATES_DIR . 'public/warranty-verifier.php';
        }
        
        // Retornar contenido
        return ob_get_clean();
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener términos y condiciones
     */
    public function get_terms() {
        return $this->settings->get_terms();
    }
    
    /**
     * Verificar si WhatsApp está habilitado
     */
    public function is_whatsapp_enabled() {
        $config = $this->settings->get_whatsapp_config();
        return $config['enabled'] === 'yes';
    }
    
    /**
     * Obtener número de WhatsApp
     */
    public function get_whatsapp_number() {
        $config = $this->settings->get_whatsapp_config();
        return $config['number'];
    }
    
    /**
     * Obtener mensaje predeterminado de WhatsApp
     */
    public function get_whatsapp_message() {
        $config = $this->settings->get_whatsapp_config();
        return $config['message'];
    }
    
    /**
     * Generar URL de WhatsApp
     */
    public function generate_whatsapp_url($warranty_number = '') {
        $config = $this->settings->get_whatsapp_config();
        
        if ($config['enabled'] !== 'yes' || empty($config['number'])) {
            return '';
        }
        
        $number = preg_replace('/[^0-9]/', '', $config['number']);
        $message = $config['message'];
        
        // Reemplazar variable {garantia_id}
        if (!empty($warranty_number)) {
            $message = str_replace('{garantia_id}', $warranty_number, $message);
        }
        
        $encoded_message = urlencode($message);
        
        return "https://wa.me/{$number}?text={$encoded_message}";
    }
    
    /**
     * Verificar si se permite video
     */
    public function is_video_allowed() {
        $limits = $this->settings->get_file_limits();
        return $limits['allow_video'] === 'yes';
    }
    
    /**
     * Obtener límites de archivos para mostrar en el formulario
     */
    public function get_file_limits_display() {
        $limits = $this->settings->get_file_limits();
        
        return array(
            'max_photos' => $limits['max_photos'],
            'max_photo_size_mb' => $limits['max_photo_size'],
            'max_video_size_mb' => $limits['max_video_size'],
            'max_video_duration_minutes' => floor($limits['max_video_duration'] / 60),
            'photo_required' => $limits['require_photo'] === 'yes',
            'video_allowed' => $limits['allow_video'] === 'yes'
        );
    }
    
    /**
     * Formatear días restantes de garantía
     */
    public function format_warranty_days($days) {
        if ($days <= 0) {
            return '<span style="color: #ef4444;">Garantía expirada</span>';
        }
        
        if ($days === 1) {
            return '<span style="color: #f59e0b;">1 día restante</span>';
        }
        
        if ($days <= 7) {
            return '<span style="color: #f59e0b;">' . $days . ' días restantes</span>';
        }
        
        if ($days <= 30) {
            return '<span style="color: #FF8C00;">' . $days . ' días restantes</span>';
        }
        
        return '<span style="color: #10b981;">' . $days . ' días restantes</span>';
    }
}


<?php
/**
 * RockStage Warranty System - Settings Class
 * 
 * Gestiona toda la configuración del plugin:
 * - Opciones generales
 * - Categorías de productos con garantía
 * - Plantillas de respuesta
 * - Sistema RMA
 * - Límites de archivos
 * - Términos y condiciones
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase singleton para gestionar configuración
 */
class RS_Warranty_Settings {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Settings
     */
    private static $instance = null;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        // Inicialización
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Settings
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CONFIGURACIÓN POR DEFECTO
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Establecer opciones por defecto al activar el plugin
     */
    public function set_default_options() {
        // Email de garantías
        if (!get_option('rs_warranty_email')) {
            update_option('rs_warranty_email', 'garantias@rockstage.com');
        }
        
        // Categorías con días de garantía por defecto
        $this->set_default_categories();
        
        // Plantillas de respuesta por defecto
        $this->set_default_templates();
        
        // Sistema RMA
        if (!get_option('rs_warranty_rma_enabled')) {
            update_option('rs_warranty_rma_enabled', 'yes');
        }
        
        if (!get_option('rs_warranty_rma_prefix')) {
            update_option('rs_warranty_rma_prefix', 'RMA-RS');
        }
        
        if (!get_option('rs_warranty_rma_tracking_enabled')) {
            update_option('rs_warranty_rma_tracking_enabled', 'yes');
        }
        
        // Dirección de devolución
        if (!get_option('rs_warranty_rma_return_address')) {
            $default_address = "RockStage\nDepartamento de Garantías\nCalle Ejemplo #123\nColonia Centro\nCiudad de México, CP 12345\nMéxico";
            update_option('rs_warranty_rma_return_address', $default_address);
        }
        
        // Prioridad automática
        update_option('rs_warranty_vip_min_orders', 3);
        update_option('rs_warranty_high_value_min', 2000);
        update_option('rs_warranty_expiring_percentage', 10);
        update_option('rs_warranty_urgent_keywords', 'urgente,grave,peligro,humo,explosión');
        
        // WhatsApp
        if (!get_option('rs_warranty_whatsapp_enabled')) {
            update_option('rs_warranty_whatsapp_enabled', 'yes');
        }
        
        if (!get_option('rs_warranty_whatsapp_number')) {
            update_option('rs_warranty_whatsapp_number', '+5255123456789');
        }
        
        if (!get_option('rs_warranty_whatsapp_message')) {
            $default_message = "Hola, mi número de garantía es {garantia_id}";
            update_option('rs_warranty_whatsapp_message', $default_message);
        }
        
        // Límites de archivos
        update_option('rs_warranty_max_photos', 5);
        update_option('rs_warranty_max_photo_size', 10); // MB
        update_option('rs_warranty_require_photo', 'yes');
        update_option('rs_warranty_max_video_size', 50); // MB
        update_option('rs_warranty_max_video_duration', 120); // segundos
        update_option('rs_warranty_allow_video', 'yes');
        
        // Términos y condiciones por defecto
        if (!get_option('rs_warranty_terms')) {
            $default_terms = $this->get_default_terms();
            update_option('rs_warranty_terms', $default_terms);
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CATEGORÍAS DE PRODUCTOS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Establecer categorías por defecto con días de garantía
     */
    private function set_default_categories() {
        // Obtener todas las categorías de WooCommerce
        $wc_categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false
        ));
        
        $categories_config = array();
        
        // Configuración predefinida según slug
        $predefined = array(
            'electronics' => array('days' => 365, 'text' => '1 año', 'enabled' => true),
            'computers' => array('days' => 365, 'text' => '1 año', 'enabled' => true),
            'accessories' => array('days' => 180, 'text' => '6 meses', 'enabled' => true),
            'cables' => array('days' => 90, 'text' => '3 meses', 'enabled' => true)
        );
        
        foreach ($wc_categories as $category) {
            $slug = $category->slug;
            
            // Si hay configuración predefinida, usarla
            if (isset($predefined[$slug])) {
                $categories_config[$category->term_id] = array(
                    'name' => $category->name,
                    'slug' => $slug,
                    'days' => $predefined[$slug]['days'],
                    'custom_text' => $predefined[$slug]['text'],
                    'enabled' => $predefined[$slug]['enabled']
                );
            } else {
                // Configuración neutral para categorías no predefinidas
                $categories_config[$category->term_id] = array(
                    'name' => $category->name,
                    'slug' => $slug,
                    'days' => 0,
                    'custom_text' => '',
                    'enabled' => false
                );
            }
        }
        
        update_option('rs_warranty_categories', $categories_config);
    }
    
    /**
     * Obtener configuración de categorías
     */
    public function get_categories() {
        $categories = get_option('rs_warranty_categories', array());
        
        // Si está vacío, establecer por defecto
        if (empty($categories)) {
            $this->set_default_categories();
            $categories = get_option('rs_warranty_categories', array());
        }
        
        return $categories;
    }
    
    /**
     * Sincronizar categorías con WooCommerce
     */
    public function sync_categories() {
        $current_config = $this->get_categories();
        
        // Obtener categorías actuales de WooCommerce
        $wc_categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false
        ));
        
        $new_config = array();
        
        foreach ($wc_categories as $category) {
            $term_id = $category->term_id;
            
            // Si ya existe configuración, mantenerla
            if (isset($current_config[$term_id])) {
                $new_config[$term_id] = $current_config[$term_id];
                // Actualizar nombre por si cambió
                $new_config[$term_id]['name'] = $category->name;
            } else {
                // Nueva categoría, agregar con valores neutrales
                $new_config[$term_id] = array(
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'days' => 0,
                    'custom_text' => '',
                    'enabled' => false
                );
            }
        }
        
        update_option('rs_warranty_categories', $new_config);
        
        return $new_config;
    }
    
    /**
     * Obtener días de garantía para una categoría
     */
    public function get_warranty_days_for_category($category_id) {
        $categories = $this->get_categories();
        
        if (isset($categories[$category_id]) && $categories[$category_id]['enabled']) {
            return $categories[$category_id]['days'];
        }
        
        return 0;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PLANTILLAS DE RESPUESTA
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Establecer plantillas por defecto
     */
    private function set_default_templates() {
        $templates = array(
            'approved_shipping' => array(
                'name' => 'Garantía Aprobada - Envío de Producto',
                'subject' => 'Garantía Aprobada - {garantia_id}',
                'message' => "Hola {nombre},\n\nTenemos excelentes noticias. Tu solicitud de garantía ha sido APROBADA.\n\nTe enviaremos un producto de reemplazo a la dirección registrada en tu pedido.\n\nNúmero de RMA: {rma_number}\n\nEstimaremos el envío dentro de las próximas 24-48 horas.\n\nSaludos,\nEquipo RockStage"
            ),
            'request_more_info' => array(
                'name' => 'Solicitar Más Información',
                'subject' => 'Necesitamos más información - {garantia_id}',
                'message' => "Hola {nombre},\n\nHemos revisado tu solicitud de garantía y necesitamos información adicional para poder procesarla.\n\nPor favor, envíanos:\n- Foto adicional del defecto\n- Descripción más detallada del problema\n\nPuedes responder a este email o contactarnos por WhatsApp.\n\nSaludos,\nEquipo RockStage"
            ),
            'warranty_expired' => array(
                'name' => 'Garantía Expirada - Alternativas',
                'subject' => 'Garantía Expirada - Alternativas Disponibles',
                'message' => "Hola {nombre},\n\nLamentamos informarte que tu producto ya no cuenta con garantía vigente.\n\nFecha de compra: Tu pedido fue realizado hace {dias_expirada} días.\nPeríodo de garantía: El producto tenía garantía de X días.\n\nSin embargo, podemos ofrecerte:\n- Descuento del 20% en la compra de un producto similar\n- Revisión técnica con costo reducido\n\nContáctanos si te interesa alguna de estas opciones.\n\nSaludos,\nEquipo RockStage"
            ),
            'rejected_misuse' => array(
                'name' => 'Garantía Rechazada - Mal Uso',
                'subject' => 'Garantía Rechazada - {garantia_id}',
                'message' => "Hola {nombre},\n\nDespués de revisar tu caso, lamentamos informarte que no podemos proceder con esta garantía.\n\nMotivo: El daño reportado es resultado de mal uso del producto, lo cual no está cubierto por nuestra garantía.\n\nLa garantía cubre únicamente defectos de fabricación.\n\nSi tienes dudas sobre esta decisión, puedes contactarnos para mayor información.\n\nSaludos,\nEquipo RockStage"
            )
        );
        
        update_option('rs_warranty_templates', $templates);
    }
    
    /**
     * Obtener todas las plantillas
     */
    public function get_templates() {
        $templates = get_option('rs_warranty_templates', array());
        
        // Si está vacío, establecer por defecto
        if (empty($templates)) {
            $this->set_default_templates();
            $templates = get_option('rs_warranty_templates', array());
        }
        
        return $templates;
    }
    
    /**
     * Obtener una plantilla específica
     */
    public function get_template($template_id) {
        $templates = $this->get_templates();
        
        if (isset($templates[$template_id])) {
            return $templates[$template_id];
        }
        
        return null;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * TÉRMINOS Y CONDICIONES
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener términos y condiciones por defecto
     */
    private function get_default_terms() {
        $terms = "<h3>Términos y Condiciones de Garantía - RockStage</h3>\n\n";
        $terms .= "<h4>1. Cobertura de la Garantía</h4>\n";
        $terms .= "<p>Nuestra garantía cubre únicamente defectos de fabricación y fallos del producto bajo uso normal.</p>\n\n";
        
        $terms .= "<h4>2. Período de Garantía</h4>\n";
        $terms .= "<p>El período de garantía varía según la categoría del producto y será especificado en la factura de compra.</p>\n\n";
        
        $terms .= "<h4>3. Exclusiones</h4>\n";
        $terms .= "<p>La garantía NO cubre:</p>\n";
        $terms .= "<ul>\n";
        $terms .= "<li>Daños por mal uso o modificaciones no autorizadas</li>\n";
        $terms .= "<li>Daños por caídas o golpes</li>\n";
        $terms .= "<li>Desgaste normal del producto</li>\n";
        $terms .= "<li>Daños por líquidos derramados</li>\n";
        $terms .= "</ul>\n\n";
        
        $terms .= "<h4>4. Proceso de Garantía</h4>\n";
        $terms .= "<p>Para hacer válida tu garantía debes:</p>\n";
        $terms .= "<ul>\n";
        $terms .= "<li>Proporcionar el número de pedido original</li>\n";
        $terms .= "<li>Enviar fotos claras del defecto</li>\n";
        $terms .= "<li>Describir detalladamente el problema</li>\n";
        $terms .= "<li>Mantener el producto en su estado original</li>\n";
        $terms .= "</ul>\n\n";
        
        $terms .= "<h4>5. Resolución</h4>\n";
        $terms .= "<p>Si tu garantía es aprobada, ofreceremos:</p>\n";
        $terms .= "<ul>\n";
        $terms .= "<li>Reemplazo del producto defectuoso</li>\n";
        $terms .= "<li>Reparación (si es posible)</li>\n";
        $terms .= "<li>Crédito en tienda (en casos específicos)</li>\n";
        $terms .= "</ul>\n\n";
        
        $terms .= "<h4>6. Tiempo de Respuesta</h4>\n";
        $terms .= "<p>Nos comprometemos a revisar tu solicitud en un plazo de 24-48 horas hábiles.</p>\n\n";
        
        $terms .= "<h4>7. Contacto</h4>\n";
        $terms .= "<p>Para dudas sobre tu garantía:</p>\n";
        $terms .= "<ul>\n";
        $terms .= "<li>Email: garantias@rockstage.com</li>\n";
        $terms .= "<li>WhatsApp: +52 55 1234 5678</li>\n";
        $terms .= "</ul>\n\n";
        
        $terms .= "<p><strong>Al enviar esta solicitud, confirmo que he leído y acepto estos términos y condiciones.</strong></p>";
        
        return $terms;
    }
    
    /**
     * Obtener términos y condiciones
     */
    public function get_terms() {
        $terms = get_option('rs_warranty_terms', '');
        
        if (empty($terms)) {
            $terms = $this->get_default_terms();
            update_option('rs_warranty_terms', $terms);
        }
        
        return $terms;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener límites de archivos
     */
    public function get_file_limits() {
        return array(
            'max_photos' => get_option('rs_warranty_max_photos', 5),
            'max_photo_size' => get_option('rs_warranty_max_photo_size', 10),
            'require_photo' => get_option('rs_warranty_require_photo', 'yes'),
            'max_video_size' => get_option('rs_warranty_max_video_size', 50),
            'max_video_duration' => get_option('rs_warranty_max_video_duration', 120),
            'allow_video' => get_option('rs_warranty_allow_video', 'yes')
        );
    }
    
    /**
     * Obtener configuración de prioridad automática
     */
    public function get_priority_config() {
        return array(
            'vip_min_orders' => get_option('rs_warranty_vip_min_orders', 3),
            'high_value_min' => get_option('rs_warranty_high_value_min', 2000),
            'expiring_percentage' => get_option('rs_warranty_expiring_percentage', 10),
            'urgent_keywords' => get_option('rs_warranty_urgent_keywords', 'urgente,grave,peligro')
        );
    }
    
    /**
     * Obtener configuración de WhatsApp
     */
    public function get_whatsapp_config() {
        return array(
            'enabled' => get_option('rs_warranty_whatsapp_enabled', 'yes'),
            'number' => get_option('rs_warranty_whatsapp_number', ''),
            'message' => get_option('rs_warranty_whatsapp_message', '')
        );
    }
}




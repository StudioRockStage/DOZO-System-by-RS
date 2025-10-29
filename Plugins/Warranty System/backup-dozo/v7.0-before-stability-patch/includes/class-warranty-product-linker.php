<?php
/**
 * RockStage Warranty System - Product Linker (DOZO v3.6)
 * 
 * Maneja la vinculación automática entre categorías y productos:
 * - Actualiza meta de productos cuando se guarda una categoría
 * - Recalcula estadísticas de categorías activas/inactivas
 * - Autodiagnóstico de vínculos
 * 
 * @package RockStage_Warranty_System
 * @version 3.6.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase para vincular garantías con productos
 */
class RS_Warranty_Product_Linker {
    
    /**
     * Instancia única de la clase (Singleton)
     */
    private static $instance = null;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Obtener instancia única (Singleton)
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Inicializar hooks
     */
    private function init_hooks() {
        // DOZO v3.6: Hooks para sincronización automática
        add_action('rs_after_category_save', array($this, 'link_products_to_category'), 10, 2);
        add_action('rs_after_categories_sync', array($this, 'link_all_products_to_categories'), 10, 1);
        
        // Autodiagnóstico (solo en admin)
        if (is_admin()) {
            add_action('admin_init', array($this, 'warranty_selfcheck'), 999);
        }
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PRODUCT LINKING
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Vincular productos de una categoría específica
     * 
     * Se ejecuta cuando se guarda UNA categoría individual
     * 
     * @param int $category_id ID de la categoría
     * @param array $category_config Configuración de la categoría
     */
    public function link_products_to_category($category_id, $category_config) {
        if (!$category_id || !is_array($category_config)) {
            return;
        }
        
        // Obtener término de WooCommerce
        $term = get_term($category_id, 'product_cat');
        if (is_wp_error($term) || !$term) {
            error_log('DOZO v3.6: Categoría no encontrada - ID: ' . $category_id);
            return;
        }
        
        // Obtener productos de esta categoría
        $products = wc_get_products(array(
            'status' => 'publish',
            'limit' => -1,
            'category' => array($term->slug)
        ));
        
        $updated_count = 0;
        
        foreach ($products as $product) {
            // Actualizar meta de garantía en el producto
            update_post_meta($product->get_id(), '_rs_warranty_days', absint($category_config['days']));
            update_post_meta($product->get_id(), '_rs_warranty_hours', absint($category_config['hours']));
            update_post_meta($product->get_id(), '_rs_warranty_text', sanitize_text_field($category_config['text']));
            update_post_meta($product->get_id(), '_rs_warranty_active', $category_config['active'] ? '1' : '0');
            update_post_meta($product->get_id(), '_rs_warranty_category_id', $category_id);
            
            $updated_count++;
        }
        
        error_log(sprintf(
            'DOZO v3.6: Vinculados %d productos a categoría "%s" (ID: %d) con %d días de garantía',
            $updated_count,
            $term->name,
            $category_id,
            $category_config['days']
        ));
    }
    
    /**
     * Vincular TODOS los productos con sus categorías
     * 
     * Se ejecuta cuando se sincronizan o restauran TODAS las categorías
     * 
     * @param array $all_categories Array de todas las configuraciones
     */
    public function link_all_products_to_categories($all_categories) {
        if (!is_array($all_categories) || empty($all_categories)) {
            return;
        }
        
        $total_products_updated = 0;
        
        foreach ($all_categories as $category_id => $category_config) {
            // Obtener término
            $term = get_term($category_id, 'product_cat');
            if (is_wp_error($term) || !$term) {
                continue;
            }
            
            // Obtener productos
            $products = wc_get_products(array(
                'status' => 'publish',
                'limit' => -1,
                'category' => array($term->slug)
            ));
            
            foreach ($products as $product) {
                update_post_meta($product->get_id(), '_rs_warranty_days', absint($category_config['days']));
                update_post_meta($product->get_id(), '_rs_warranty_hours', absint($category_config['hours']));
                update_post_meta($product->get_id(), '_rs_warranty_text', sanitize_text_field($category_config['text']));
                update_post_meta($product->get_id(), '_rs_warranty_active', $category_config['active'] ? '1' : '0');
                update_post_meta($product->get_id(), '_rs_warranty_category_id', $category_id);
                
                $total_products_updated++;
            }
        }
        
        error_log(sprintf(
            'DOZO v3.6: Vinculados %d productos totales con %d categorías configuradas',
            $total_products_updated,
            count($all_categories)
        ));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * AUTODIAGNÓSTICO (DOZO v3.6)
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Verificar vínculos entre categorías y productos
     * 
     * Se ejecuta en admin_init para detectar configuraciones huérfanas
     */
    public function warranty_selfcheck() {
        // Solo ejecutar una vez por sesión
        static $checked = false;
        if ($checked) {
            return;
        }
        $checked = true;
        
        // Obtener configuraciones guardadas
        $categories = get_option('rs_warranty_categories', array());
        
        if (empty($categories)) {
            error_log('⚠️ DOZO v3.6: No hay categorías de garantía configuradas');
            return;
        }
        
        // Verificar cada categoría
        $orphaned_categories = array();
        $active_count = 0;
        $inactive_count = 0;
        
        foreach ($categories as $cat_id => $config) {
            // Contar activas/inactivas
            if (!empty($config['active'])) {
                $active_count++;
            } else {
                $inactive_count++;
            }
            
            // Verificar que la categoría existe en WooCommerce
            $term = get_term($cat_id, 'product_cat');
            if (is_wp_error($term) || !$term) {
                $orphaned_categories[] = $cat_id;
            }
        }
        
        // Log de estadísticas
        error_log(sprintf(
            'DOZO v3.6: Categorías configuradas: %d total, %d activas, %d inactivas',
            count($categories),
            $active_count,
            $inactive_count
        ));
        
        // Log de categorías huérfanas
        if (!empty($orphaned_categories)) {
            error_log('⚠️ DOZO v3.6: Categorías huérfanas (no existen en WooCommerce): ' . implode(', ', $orphaned_categories));
        }
        
        // Verificar productos vinculados
        $this->verify_product_links();
    }
    
    /**
     * Verificar cuántos productos tienen garantía vinculada
     */
    private function verify_product_links() {
        $args = array(
            'status' => 'publish',
            'limit' => -1
        );
        
        $all_products = wc_get_products($args);
        $products_with_warranty = 0;
        $products_without_warranty = 0;
        
        foreach ($all_products as $product) {
            $warranty_days = get_post_meta($product->get_id(), '_rs_warranty_days', true);
            
            if ($warranty_days && $warranty_days > 0) {
                $products_with_warranty++;
            } else {
                $products_without_warranty++;
            }
        }
        
        error_log(sprintf(
            'DOZO v3.6: Productos: %d con garantía, %d sin garantía (de %d totales)',
            $products_with_warranty,
            $products_without_warranty,
            count($all_products)
        ));
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener estadísticas de vinculación
     * 
     * @return array Estadísticas
     */
    public function get_linking_stats() {
        $categories = get_option('rs_warranty_categories', array());
        $all_products = wc_get_products(array('status' => 'publish', 'limit' => -1));
        
        $stats = array(
            'total_categories' => count($categories),
            'active_categories' => 0,
            'inactive_categories' => 0,
            'total_products' => count($all_products),
            'linked_products' => 0,
            'unlinked_products' => 0
        );
        
        // Contar categorías
        foreach ($categories as $cat_id => $config) {
            if (!empty($config['active'])) {
                $stats['active_categories']++;
            } else {
                $stats['inactive_categories']++;
            }
        }
        
        // Contar productos vinculados
        foreach ($all_products as $product) {
            $warranty_days = get_post_meta($product->get_id(), '_rs_warranty_days', true);
            if ($warranty_days && $warranty_days > 0) {
                $stats['linked_products']++;
            } else {
                $stats['unlinked_products']++;
            }
        }
        
        return $stats;
    }
}




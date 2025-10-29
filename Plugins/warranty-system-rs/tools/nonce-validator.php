<?php
/**
 * DOZO v3.9 - Nonce Validation Auto-Check
 * 
 * Verifica que todos los nonces estén correctamente configurados
 * y que no haya IDs duplicados en el DOM
 * 
 * @package RockStage_Warranty_System
 * @version 3.9.0
 */

defined('ABSPATH') || exit;

class RS_Nonce_Validator {
    
    public static function run_validation() {
        $results = array();
        
        // Test 1: Verificar nonces JavaScript
        $results['js_nonce_localized'] = self::test_js_nonce_localized();
        
        // Test 2: Verificar endpoints AJAX usan nonce correcto
        $results['ajax_endpoints_secure'] = self::test_ajax_endpoints();
        
        // Test 3: Verificar no hay IDs duplicados en settings.php
        $results['no_duplicate_ids'] = self::test_no_duplicate_ids();
        
        // Test 4: Validar creación y verificación de nonce
        $results['nonce_creation'] = self::test_nonce_creation();
        
        return $results;
    }
    
    private static function test_js_nonce_localized() {
        // Verificar que rsWarrantyAdmin.nonce esté disponible
        // (Esto se puede verificar en browser console)
        return array(
            'test' => 'JavaScript Nonce Localized',
            'status' => 'info',
            'message' => 'Ejecutar en console: typeof rsWarrantyAdmin !== "undefined" && rsWarrantyAdmin.nonce',
            'expected' => 'true'
        );
    }
    
    private static function test_ajax_endpoints() {
        $core_file = file_get_contents(RS_WARRANTY_INCLUDES_DIR . 'class-warranty-core.php');
        
        // Verificar que ajax_get_categories_table use check_ajax_referer
        $has_nonce_check = strpos($core_file, "check_ajax_referer('rs_warranty_admin_nonce'") !== false;
        
        return array(
            'test' => 'AJAX Endpoints Secure',
            'status' => $has_nonce_check ? 'pass' : 'fail',
            'message' => $has_nonce_check 
                ? '✅ Endpoints AJAX usan check_ajax_referer correctamente'
                : '❌ Falta validación de nonce en endpoints',
            'details' => "check_ajax_referer('rs_warranty_admin_nonce', 'nonce')"
        );
    }
    
    private static function test_no_duplicate_ids() {
        $settings_file = file_get_contents(RS_WARRANTY_TEMPLATES_DIR . 'admin/settings.php');
        
        // Buscar ocurrencias de wp_nonce_field
        $nonce_count = substr_count($settings_file, 'wp_nonce_field');
        
        // Buscar IDs únicos
        preg_match_all('/_nonce_([a-z]+)/', $settings_file, $matches);
        $unique_ids = array_unique($matches[1]);
        
        $is_unique = count($unique_ids) === $nonce_count;
        
        return array(
            'test' => 'No Duplicate Nonce IDs',
            'status' => $is_unique ? 'pass' : 'fail',
            'message' => $is_unique 
                ? '✅ Todos los nonce IDs son únicos (' . count($unique_ids) . ')' 
                : '❌ IDs duplicados detectados',
            'details' => 'IDs encontrados: ' . implode(', ', $unique_ids)
        );
    }
    
    private static function test_nonce_creation() {
        // Crear y verificar nonce de prueba
        $test_nonce = wp_create_nonce('rs_warranty_admin_nonce');
        $is_valid = wp_verify_nonce($test_nonce, 'rs_warranty_admin_nonce');
        
        return array(
            'test' => 'Nonce Creation & Verification',
            'status' => $is_valid ? 'pass' : 'fail',
            'message' => $is_valid 
                ? '✅ Nonces se crean y verifican correctamente' 
                : '❌ Error en creación/verificación de nonce',
            'details' => 'Test nonce: ' . substr($test_nonce, 0, 10) . '...'
        );
    }
    
    public static function display_results() {
        $results = self::run_validation();
        
        echo '<div class="rs-nonce-validation">';
        echo '<h2>🔒 DOZO v3.9 - Nonce Validation Report</h2>';
        
        foreach ($results as $key => $result) {
            $icon = $result['status'] === 'pass' ? '✅' : ($result['status'] === 'fail' ? '❌' : 'ℹ️');
            $class = 'rs-validation-' . $result['status'];
            
            echo '<div class="' . esc_attr($class) . '" style="padding: 12px; margin: 8px 0; border-left: 4px solid ' . ($result['status'] === 'pass' ? '#10b981' : ($result['status'] === 'fail' ? '#ef4444' : '#3b82f6')) . '; background: white;">';
            echo '<strong>' . $icon . ' ' . esc_html($result['test']) . '</strong><br>';
            echo '<span>' . esc_html($result['message']) . '</span><br>';
            if (!empty($result['details'])) {
                echo '<small style="color: #6b7280;">' . esc_html($result['details']) . '</small>';
            }
            echo '</div>';
        }
        
        echo '</div>';
    }
}

// Auto-ejecutar en admin si se solicita
add_action('admin_init', function() {
    if (isset($_GET['dozo_nonce_check']) && current_user_can('manage_woocommerce')) {
        echo '<div class="wrap">';
        RS_Nonce_Validator::display_results();
        echo '</div>';
        exit;
    }
});

// DOZO v4.1: Auto-check JavaScript para duplicados (ejecuta en browser)
add_action('admin_footer', function() {
    global $pagenow;
    if ($pagenow === 'admin.php' && isset($_GET['page']) && strpos($_GET['page'], 'rockstage-warranty') !== false) {
        ?>
        <script>
        (function() {
            console.log('🧩 DOZO v4.1: Validación histórica de nonces iniciada');
            
            const duplicates = new Set();
            const nonces = document.querySelectorAll('input[name*="nonce"]');
            const seen = new Map();
            let hasDuplicates = false;
            
            nonces.forEach(el => {
                const value = el.value;
                if (value && value.length > 0) {
                    if (seen.has(value)) {
                        console.warn('⚠️ DOZO v4.1: Nonce duplicado detectado:', el.name, '=', value.substring(0, 10) + '...');
                        hasDuplicates = true;
                    }
                    seen.set(value, el.name);
                }
            });
            
            if (!hasDuplicates) {
                console.log('✅ DOZO v4.1: Validación completada - No se detectaron nonces duplicados (' + nonces.length + ' nonces únicos)');
            } else {
                console.error('❌ DOZO v4.1: Se detectaron nonces duplicados. Recarga la página.');
            }
            
            // Verificar IDs únicos
            const ids = {};
            nonces.forEach(el => {
                if (el.id) {
                    if (ids[el.id]) {
                        console.error('❌ DOZO v4.1: ID duplicado detectado:', el.id);
                    } else {
                        ids[el.id] = true;
                    }
                }
            });
            
            console.log('✅ DOZO v4.1: Verificación de IDs completada');
        })();
        </script>
        <?php
    }
});


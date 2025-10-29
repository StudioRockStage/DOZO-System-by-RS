<?php
/**
 * DOZO Core Repair Script
 * DOZO Deep Audit v7.0.3 - Core Structure Repair & Class Integrity Module
 * 
 * This script provides diagnostic tools to identify structural issues
 * in core plugin files without modifying them.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.0.3
 * @since 7.0.3
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.0.3: Diagnostic report for class structure
 */
function dozo_core_diagnostic_report() {
    $target_files = array(
        'class-warranty-core.php',
        'class-warranty-admin.php',
        'class-warranty-database.php',
    );
    
    $report = array(
        'timestamp' => current_time('mysql'),
        'version' => RS_DOZO_VERSION,
        'files' => array()
    );
    
    foreach ($target_files as $filename) {
        $file = RS_WARRANTY_PLUGIN_DIR . 'includes/' . $filename;
        
        if (!file_exists($file)) {
            $report['files'][$filename] = array(
                'status' => 'missing',
                'message' => 'File not found'
            );
            continue;
        }
        
        $content = file_get_contents($file);
        $lines = explode("\n", $content);
        
        // Count braces
        $open_braces = substr_count($content, '{');
        $close_braces = substr_count($content, '}');
        
        // Count parentheses
        $open_parens = substr_count($content, '(');
        $close_parens = substr_count($content, ')');
        
        // Count brackets
        $open_brackets = substr_count($content, '[');
        $close_brackets = substr_count($content, ']');
        
        // Find class declarations
        preg_match_all('/^(abstract\s+)?class\s+(\w+)/m', $content, $classes);
        
        // Detect methods outside classes
        $methods_outside_class = array();
        $inside_class = false;
        $brace_depth = 0;
        $class_brace_level = 0;
        
        for ($i = 0; $i < count($lines); $i++) {
            $line = trim($lines[$i]);
            
            if (preg_match('/^(abstract\s+)?class\s+\w+/', $line)) {
                $inside_class = true;
                $class_brace_level = $brace_depth;
            }
            
            $brace_depth += substr_count($line, '{');
            $brace_depth -= substr_count($line, '}');
            
            if ($inside_class && $brace_depth <= $class_brace_level && strpos($line, '}') !== false) {
                $inside_class = false;
            }
            
            if (!$inside_class && preg_match('/^\s*(public|private|protected)\s+function\s+(\w+)/', $line, $matches)) {
                $methods_outside_class[] = array(
                    'line' => $i + 1,
                    'method' => $matches[2],
                    'visibility' => $matches[1]
                );
            }
        }
        
        $file_report = array(
            'status' => 'ok',
            'line_count' => count($lines),
            'braces' => array(
                'open' => $open_braces,
                'close' => $close_braces,
                'balanced' => $open_braces === $close_braces
            ),
            'parentheses' => array(
                'open' => $open_parens,
                'close' => $close_parens,
                'balanced' => $open_parens === $close_parens
            ),
            'brackets' => array(
                'open' => $open_brackets,
                'close' => $close_brackets,
                'balanced' => $open_brackets === $close_brackets
            ),
            'classes' => count($classes[0]),
            'methods_outside_class' => $methods_outside_class
        );
        
        // Determine overall status
        if (!$file_report['braces']['balanced']) {
            $file_report['status'] = 'error';
            $file_report['message'] = 'Brace imbalance: ' . $open_braces . ' open, ' . $close_braces . ' close';
        } elseif (!empty($methods_outside_class)) {
            $file_report['status'] = 'error';
            $file_report['message'] = count($methods_outside_class) . ' method(s) declared outside of class';
        } else {
            $file_report['message'] = 'All structural checks passed';
        }
        
        $report['files'][$filename] = $file_report;
        
        // Log the report
        if ($file_report['status'] === 'error') {
            error_log('⚠️ DOZO Repair: ' . $filename . ' - ' . $file_report['message']);
            if (!empty($methods_outside_class)) {
                foreach ($methods_outside_class as $method) {
                    error_log('   → Line ' . $method['line'] . ': ' . $method['visibility'] . ' function ' . $method['method']);
                }
            }
        } else {
            error_log('✅ DOZO Repair: ' . $filename . ' - ' . $file_report['message']);
        }
    }
    
    return $report;
}

/**
 * DOZO v7.0.3: AJAX endpoint for diagnostic report
 */
add_action('wp_ajax_dozo_core_diagnostic', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $report = dozo_core_diagnostic_report();
    
    wp_send_json_success($report);
});

/**
 * DOZO v7.0.3: Run diagnostic on init (for logging only)
 */
add_action('init', function() {
    // Only run if debug mode is enabled
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        // Check if we should run (once per day)
        $last_run = get_option('dozo_core_diagnostic_last_run', 0);
        $time_since_last = time() - $last_run;
        
        // Run once per day (86400 seconds)
        if ($time_since_last > 86400) {
            dozo_core_diagnostic_report();
            update_option('dozo_core_diagnostic_last_run', time());
        }
    }
}, 20);

/**
 * DOZO v7.0.3: Admin notice for structure issues
 */
add_action('admin_notices', function() {
    // Only show on plugin pages
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'warranty') === false) {
        return;
    }
    
    // Quick check for critical files
    $has_issues = false;
    $critical_files = array(
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-core.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-admin.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-database.php',
    );
    
    foreach ($critical_files as $file) {
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $open = substr_count($content, '{');
            $close = substr_count($content, '}');
            
            if ($open !== $close) {
                $has_issues = true;
                break;
            }
        }
    }
    
    if ($has_issues && (!defined('DOZO_SAFE_MODE') || DOZO_SAFE_MODE !== true)) {
        ?>
        <div class="notice notice-warning">
            <p><strong>⚠️ DOZO Core Repair:</strong> Se detectaron posibles problemas estructurales en archivos del núcleo. 
            Revisa <code>wp-content/debug.log</code> para más detalles o ejecuta el diagnóstico DOZO desde Configuración Avanzada.</p>
        </div>
        <?php
    }
});

/**
 * DOZO v7.0.3: Console command for manual diagnostic
 * 
 * Usage: Add this to your theme's functions.php temporarily:
 * add_action('init', 'dozo_manual_diagnostic');
 * 
 * Then visit any page to trigger the diagnostic.
 */
function dozo_manual_diagnostic() {
    if (current_user_can('manage_options')) {
        $report = dozo_core_diagnostic_report();
        error_log('DOZO Manual Diagnostic Report: ' . print_r($report, true));
    }
}


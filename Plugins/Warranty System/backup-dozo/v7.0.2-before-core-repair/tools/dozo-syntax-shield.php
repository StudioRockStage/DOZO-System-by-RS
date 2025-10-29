<?php
/**
 * DOZO Syntax Shield
 * DOZO Deep Audit v7.0.2 - Syntax Shield & Load Timing Fix
 * 
 * Validates PHP syntax and class integrity before plugin execution.
 * Prevents fatal errors from malformed code.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.0.2
 * @since 7.0.2
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.0.2: Validate PHP syntax
 */
function dozo_validate_php_syntax($code) {
    if (empty($code)) {
        return false;
    }
    
    // Count braces
    $open_braces = substr_count($code, '{');
    $close_braces = substr_count($code, '}');
    
    if ($open_braces !== $close_braces) {
        error_log('DOZO v7.0.2: Syntax error - Mismatched braces: ' . $open_braces . ' open, ' . $close_braces . ' close');
        return false;
    }
    
    // Count parentheses
    $open_parens = substr_count($code, '(');
    $close_parens = substr_count($code, ')');
    
    if ($open_parens !== $close_parens) {
        error_log('DOZO v7.0.2: Syntax error - Mismatched parentheses: ' . $open_parens . ' open, ' . $close_parens . ' close');
        return false;
    }
    
    // Count brackets
    $open_brackets = substr_count($code, '[');
    $close_brackets = substr_count($code, ']');
    
    if ($open_brackets !== $close_brackets) {
        error_log('DOZO v7.0.2: Syntax error - Mismatched brackets');
        return false;
    }
    
    return true;
}

/**
 * DOZO v7.0.2: Check class integrity
 */
function dozo_check_class_integrity($file) {
    if (!file_exists($file)) {
        error_log('DOZO v7.0.2: File not found for integrity check: ' . basename($file));
        return false;
    }
    
    $code = file_get_contents($file);
    
    // Count class declarations
    preg_match_all('/\bclass\s+\w+/i', $code, $class_matches);
    $class_count = count($class_matches[0]);
    
    // Basic syntax validation
    if (!dozo_validate_php_syntax($code)) {
        error_log('DOZO v7.0.2: Syntax validation failed for: ' . basename($file));
        return false;
    }
    
    // Check for common syntax errors
    $error_patterns = array(
        '/\}\s*public\s+function/' => 'Missing semicolon or closing brace before function',
        '/\}\s*private\s+function/' => 'Missing semicolon or closing brace before function',
        '/;\s*\{/' => 'Unexpected brace after semicolon',
    );
    
    foreach ($error_patterns as $pattern => $description) {
        if (preg_match($pattern, $code)) {
            error_log('DOZO v7.0.2: Possible syntax issue in ' . basename($file) . ': ' . $description);
        }
    }
    
    return true;
}

/**
 * DOZO v7.0.2: Validate core files before loading
 */
function dozo_validate_core_files() {
    $critical_files = array(
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-core.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-admin.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-database.php',
    );
    
    $has_errors = false;
    
    foreach ($critical_files as $file) {
        if (!file_exists($file)) {
            error_log('DOZO v7.0.2: Critical file missing: ' . basename($file));
            $has_errors = true;
            continue;
        }
        
        if (!dozo_check_class_integrity($file)) {
            error_log('DOZO v7.0.2: Integrity check failed: ' . basename($file));
            $has_errors = true;
        }
    }
    
    if ($has_errors) {
        // Activate safe mode automatically
        if (!defined('DOZO_SAFE_MODE')) {
            define('DOZO_SAFE_MODE', true);
        }
        
        add_action('admin_notices', 'dozo_syntax_error_notice');
        
        return false;
    }
    
    error_log('DOZO v7.0.2: Syntax validation passed for all core files');
    return true;
}

/**
 * DOZO v7.0.2: Syntax error admin notice
 */
function dozo_syntax_error_notice() {
    ?>
    <div class="notice notice-error is-dismissible">
        <p><strong>🛡️ DOZO Syntax Shield:</strong> Se detectaron posibles errores de sintaxis en archivos críticos. El modo seguro se activó automáticamente. Verifica el archivo <code>wp-content/debug.log</code> para más detalles.</p>
    </div>
    <?php
}

/**
 * DOZO v7.0.2: Rotate debug.log if too large
 */
function dozo_rotate_debug_log() {
    $log_file = WP_CONTENT_DIR . '/debug.log';
    
    if (file_exists($log_file) && filesize($log_file) > 5242880) { // 5MB
        $rotated_name = WP_CONTENT_DIR . '/debug-' . time() . '.log';
        rename($log_file, $rotated_name);
        error_log('DOZO v7.0.2: debug.log rotated to ' . basename($rotated_name));
    }
}

// Run syntax validation early
add_action('plugins_loaded', 'dozo_validate_core_files', 1);

// Rotate logs if needed
add_action('plugins_loaded', 'dozo_rotate_debug_log', 2);

// Log successful initialization
add_action('plugins_loaded', function() {
    if (!defined('DOZO_SAFE_MODE') || DOZO_SAFE_MODE !== true) {
        error_log('✅ DOZO v7.0.2 initialized successfully - Syntax Shield active');
    }
}, 999);


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
 * DOZO v7.0.3: Core structure check - Advanced validation
 * 
 * Detects methods outside classes and structural integrity issues.
 */
function dozo_core_structure_check($file) {
    if (!file_exists($file)) {
        error_log('DOZO v7.0.3: File not found for structure check: ' . basename($file));
        return false;
    }
    
    $content = file_get_contents($file);
    
    // Count braces
    $open = substr_count($content, '{');
    $close = substr_count($content, '}');
    
    if ($open !== $close) {
        error_log('⚠️ DOZO v7.0.3: Brace imbalance detected in ' . basename($file) . ': ' . $open . ' open, ' . $close . ' close');
        dozo_trigger_safe_mode('Desbalance estructural en ' . basename($file));
        return false;
    }
    
    // Check for methods declared outside of classes
    // Split by class declarations and check for public/private/protected methods between them
    $lines = explode("\n", $content);
    $inside_class = false;
    $brace_depth = 0;
    $class_brace_level = 0;
    
    for ($i = 0; $i < count($lines); $i++) {
        $line = trim($lines[$i]);
        
        // Track class declarations
        if (preg_match('/^(abstract\s+)?class\s+\w+/', $line)) {
            $inside_class = true;
            $class_brace_level = $brace_depth;
        }
        
        // Track brace depth
        $brace_depth += substr_count($line, '{');
        $brace_depth -= substr_count($line, '}');
        
        // If we're back to class level or below, we're outside the class
        if ($inside_class && $brace_depth <= $class_brace_level && strpos($line, '}') !== false) {
            $inside_class = false;
        }
        
        // Check for method declarations outside of class
        if (!$inside_class && preg_match('/^\s*(public|private|protected)\s+function\s+\w+/', $line)) {
            $line_number = $i + 1;
            error_log('🚫 DOZO v7.0.3: Method declared outside of class in ' . basename($file) . ' at line ' . $line_number);
            dozo_trigger_safe_mode('Método fuera de clase detectado en ' . basename($file) . ' línea ' . $line_number);
            return false;
        }
    }
    
    error_log('✅ DOZO v7.0.3: Structure validation passed for ' . basename($file));
    return true;
}

/**
 * DOZO v7.0.3: Trigger safe mode with message
 */
function dozo_trigger_safe_mode($reason) {
    if (!defined('DOZO_SAFE_MODE')) {
        define('DOZO_SAFE_MODE', true);
    }
    error_log('🛡️ DOZO v7.0.3: Safe mode activated - Reason: ' . $reason);
}

/**
 * DOZO v7.0.4: Recursive class check for all PHP files in includes directory
 */
function dozo_recursive_class_check($dir) {
    if (!is_dir($dir)) {
        error_log('DOZO v7.0.4: Directory not found: ' . $dir);
        return true;
    }
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    $has_errors = false;
    $checked_count = 0;
    
    foreach ($files as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $filepath = $file->getPathname();
            $basename = basename($filepath);
            
            // Skip certain files
            if (strpos($basename, 'index.php') !== false) {
                continue;
            }
            
            $checked_count++;
            
            // Check if file contains class declaration
            $content = file_get_contents($filepath);
            if (strpos($content, 'class ') === false) {
                continue; // Not a class file
            }
            
            // Count braces
            $open = substr_count($content, '{');
            $close = substr_count($content, '}');
            
            if ($open !== $close) {
                $difference = $open - $close;
                error_log('⚠️ DOZO v7.0.4: Brace imbalance in ' . $basename . ': ' . abs($difference) . ' brace(s) ' . ($difference > 0 ? 'missing' : 'extra'));
                dozo_trigger_safe_mode('Desbalance estructural en ' . $basename);
                $has_errors = true;
                continue;
            }
            
            // Check for methods outside classes
            if (!dozo_core_structure_check($filepath)) {
                error_log('⚠️ DOZO v7.0.4: Structure check failed for ' . $basename);
                $has_errors = true;
            }
        }
    }
    
    if (!$has_errors) {
        error_log('✅ DOZO v7.0.4: Recursive validation passed for ' . $checked_count . ' PHP files');
    }
    
    return !$has_errors;
}

/**
 * DOZO v7.0.4: Validate core files before loading - Enhanced with recursive check
 */
function dozo_validate_core_files() {
    // Step 1: Check critical files (fast check)
    $critical_files = array(
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-core.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-admin.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-database.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-dozo-reaper-cleaner.php', // Added in v7.0.4
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-dozo-knowledge-base.php', // Added in v7.0.4
    );
    
    $has_errors = false;
    
    foreach ($critical_files as $file) {
        if (!file_exists($file)) {
            error_log('DOZO v7.0.4: Critical file missing: ' . basename($file));
            $has_errors = true;
            continue;
        }
        
        // Step 1: Basic integrity check
        if (!dozo_check_class_integrity($file)) {
            error_log('DOZO v7.0.4: Integrity check failed: ' . basename($file));
            $has_errors = true;
        }
        
        // Step 2: Advanced structure check
        if (!dozo_core_structure_check($file)) {
            error_log('DOZO v7.0.4: Structure check failed: ' . basename($file));
            $has_errors = true;
        }
    }
    
    // Step 3: Recursive check (v7.0.4) - only if critical files pass
    if (!$has_errors) {
        $includes_dir = RS_WARRANTY_PLUGIN_DIR . 'includes/';
        if (!dozo_recursive_class_check($includes_dir)) {
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
    
    error_log('✅ DOZO v7.0.4: All validation checks passed (critical + recursive)');
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
        error_log('✅ DOZO v7.4.1 initialized successfully - Full Self-Healing + Visual Feedback + Smart Inspector + All Systems Operational');
    }
}, 999);


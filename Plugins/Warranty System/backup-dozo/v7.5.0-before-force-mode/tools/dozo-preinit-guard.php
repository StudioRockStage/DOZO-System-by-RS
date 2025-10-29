<?php
/**
 * DOZO Pre-Init Guard
 * DOZO Deep Audit v7.4.1 - Full Self-Healing Engine + Visual Feedback Layer
 * 
 * Pre-initialization validation to prevent fatal errors before WordPress loads plugin.
 * Checks versions, permissions, critical files.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.4.1
 * @since 7.4.1
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.4.1: Pre-Init Guard - Main validation
 */
function dozo_preinit_guard() {
    $checks = array(
        'php_version' => false,
        'wp_version' => false,
        'wc_active' => false,
        'permissions' => false,
        'critical_files' => false
    );
    
    $errors = array();
    
    // Check 1: PHP Version
    if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
        $checks['php_version'] = true;
    } else {
        $errors[] = 'PHP version ' . PHP_VERSION . ' is below minimum 7.4.0';
    }
    
    // Check 2: WordPress Version
    global $wp_version;
    if (version_compare($wp_version, '6.0', '>=')) {
        $checks['wp_version'] = true;
    } else {
        $errors[] = 'WordPress version ' . $wp_version . ' is below minimum 6.0';
    }
    
    // Check 3: WooCommerce Active
    if (class_exists('WooCommerce')) {
        $checks['wc_active'] = true;
    } else {
        $errors[] = 'WooCommerce is not active';
    }
    
    // Check 4: Directory Permissions
    $dirs_to_check = array(
        RS_WARRANTY_PLUGIN_DIR . 'includes/',
        wp_upload_dir()['basedir'] . '/dozo-logs/',
        wp_upload_dir()['basedir'] . '/dozo-knowledge-base/'
    );
    
    $permission_ok = true;
    foreach ($dirs_to_check as $dir) {
        if (file_exists($dir) && !is_writable($dir)) {
            $errors[] = 'Directory not writable: ' . basename($dir);
            $permission_ok = false;
        }
    }
    $checks['permissions'] = $permission_ok;
    
    // Check 5: Critical Files
    $critical_files = array(
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-core.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-admin.php',
        RS_WARRANTY_PLUGIN_DIR . 'includes/class-warranty-database.php'
    );
    
    $files_ok = true;
    foreach ($critical_files as $file) {
        if (!file_exists($file)) {
            $errors[] = 'Critical file missing: ' . basename($file);
            $files_ok = false;
        }
    }
    $checks['critical_files'] = $files_ok;
    
    // Log results
    if (empty($errors)) {
        error_log('✅ DOZO v7.4.1: Pre-Init Guard - All checks passed');
        return array('status' => 'pass', 'checks' => $checks);
    } else {
        error_log('⚠️ DOZO v7.4.1: Pre-Init Guard - ' . count($errors) . ' issue(s) detected');
        foreach ($errors as $error) {
            error_log('   → ' . $error);
        }
        
        // Activate safe mode if critical issues
        if (!$checks['php_version'] || !$checks['critical_files']) {
            define('DOZO_SAFE_MODE', true);
        }
        
        return array('status' => 'fail', 'checks' => $checks, 'errors' => $errors);
    }
}

// Run pre-init guard early
add_action('plugins_loaded', 'dozo_preinit_guard', 0);


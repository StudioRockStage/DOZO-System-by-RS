<?php
/**
 * DOZO Sync Engine
 * DOZO Deep Audit v7.1.1 - Sync & Execution Enforcement
 * 
 * Automatic synchronization system for Claude AI designs into the plugin.
 * Scans, validates, and integrates external design files.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.1.1
 * @since 7.1.1
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.1.1: Main sync execution
 */
function dozo_sync_execute() {
    error_log('🧩 DOZO Sync v7.1.1: Execution started');
    
    // Check if Claude AI design path exists
    if (!defined('RS_CLAUDE_DESIGN_PATH') || !is_dir(RS_CLAUDE_DESIGN_PATH)) {
        error_log('⚠️ DOZO Sync: Claude AI design path not found: ' . (defined('RS_CLAUDE_DESIGN_PATH') ? RS_CLAUDE_DESIGN_PATH : 'undefined'));
        return array(
            'status' => 'error',
            'message' => 'Claude AI design path not found',
            'synced_files' => 0
        );
    }
    
    $sync_log = array(
        'version' => RS_DOZO_VERSION,
        'timestamp' => current_time('mysql'),
        'source_path' => RS_CLAUDE_DESIGN_PATH,
        'synced_files' => 0,
        'errors' => 0,
        'skipped' => 0,
        'files' => array()
    );
    
    // Scan for design files
    $design_files = dozo_scan_design_files(RS_CLAUDE_DESIGN_PATH);
    
    if (empty($design_files)) {
        error_log('ℹ️ DOZO Sync: No design files found for sync');
        $sync_log['status'] = 'no_files';
        dozo_save_sync_log($sync_log);
        return $sync_log;
    }
    
    error_log('📁 DOZO Sync: Found ' . count($design_files) . ' design files');
    
    // Process each file
    foreach ($design_files as $file_info) {
        $file = is_array($file_info) ? $file_info['path'] : $file_info;
        $result = dozo_process_design_file($file, $file_info);
        
        $sync_log['files'][] = array(
            'file' => basename($file),
            'path' => $file,
            'result' => $result['status'],
            'message' => isset($result['message']) ? $result['message'] : ''
        );
        
        if ($result['status'] === 'synced') {
            $sync_log['synced_files']++;
        } elseif ($result['status'] === 'error') {
            $sync_log['errors']++;
        } elseif ($result['status'] === 'skipped') {
            $sync_log['skipped']++;
        }
    }
    
    $sync_log['status'] = $sync_log['errors'] > 0 ? 'completed_with_errors' : 'success';
    
    // Save sync log
    dozo_save_sync_log($sync_log);
    
    // Log to Knowledge Base
    $kb = RS_DOZO_Knowledge_Base::get_instance();
    $kb->log_event('sync', array(
        'synced_files' => $sync_log['synced_files'],
        'errors' => $sync_log['errors'],
        'status' => $sync_log['status']
    ));
    
    error_log('✅ DOZO Sync: Completed - ' . $sync_log['synced_files'] . ' synced, ' . 
        $sync_log['errors'] . ' errors, ' . $sync_log['skipped'] . ' skipped');
    
    return $sync_log;
}

/**
 * DOZO v7.2: Scan design files recursively (enhanced for panels)
 */
function dozo_scan_design_files($path) {
    $files = array();
    
    if (!is_dir($path)) {
        return $files;
    }
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile() && in_array($file->getExtension(), array('html', 'css', 'js'))) {
            // Check if file has @dozo:sync tag
            $content = file_get_contents($file->getPathname());
            if (strpos($content, '@dozo:sync') !== false) {
                $file_info = array(
                    'path' => $file->getPathname(),
                    'is_panel' => strpos($content, '@dozo:panel') !== false,
                    'panel_type' => null
                );
                
                // Extract panel type if it's a panel
                if ($file_info['is_panel']) {
                    if (preg_match('/@dozo:panel\s+type=["\']([^"\']+)["\']/', $content, $matches)) {
                        $file_info['panel_type'] = $matches[1];
                    }
                }
                
                $files[] = $file_info;
            }
        }
    }
    
    return $files;
}

/**
 * DOZO v7.2: Process individual design file (enhanced for panels)
 */
function dozo_process_design_file($file, $file_info = null) {
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    $basename = basename($file);
    
    // Check if this is a panel file
    $is_panel = is_array($file_info) && isset($file_info['is_panel']) && $file_info['is_panel'];
    $panel_type = is_array($file_info) && isset($file_info['panel_type']) ? $file_info['panel_type'] : null;
    
    // Validate file structure
    $validation = dozo_validate_design_file($file, $extension);
    
    if (!$validation['valid']) {
        error_log('⚠️ DOZO Sync: Validation failed for ' . $basename . ': ' . $validation['message']);
        return array(
            'status' => 'error',
            'message' => 'Validation failed: ' . $validation['message']
        );
    }
    
    // Determine destination based on file path
    $destination = dozo_get_destination_path($file);
    
    if (!$destination) {
        return array(
            'status' => 'skipped',
            'message' => 'No destination mapping found'
        );
    }
    
    // Create destination directory if needed
    $dest_dir = dirname($destination);
    if (!file_exists($dest_dir)) {
        wp_mkdir_p($dest_dir);
    }
    
    // Copy file
    if (copy($file, $destination)) {
        error_log('✅ DOZO Sync: Synced ' . $basename . ' → ' . str_replace(RS_WARRANTY_PLUGIN_DIR, '', $destination));
        
        // If it's a panel, register it for integration
        if ($is_panel && $panel_type) {
            dozo_register_panel($basename, $panel_type, $destination);
        }
        
        return array(
            'status' => 'synced',
            'message' => 'Successfully synced to ' . basename($destination),
            'is_panel' => $is_panel,
            'panel_type' => $panel_type
        );
    } else {
        return array(
            'status' => 'error',
            'message' => 'Failed to copy file'
        );
    }
}

/**
 * DOZO v7.2: Register panel for integration
 */
function dozo_register_panel($filename, $panel_type, $destination) {
    $panels = get_option('dozo_registered_panels', array());
    
    $panel_id = sanitize_title($filename);
    
    $panels[$panel_id] = array(
        'filename' => $filename,
        'type' => $panel_type,
        'destination' => $destination,
        'registered_at' => current_time('mysql'),
        'active' => true
    );
    
    update_option('dozo_registered_panels', $panels);
    
    error_log('📋 DOZO Sync: Registered panel "' . $panel_type . '" from ' . $filename);
}

/**
 * DOZO v7.1.1: Validate design file structure
 */
function dozo_validate_design_file($file, $extension) {
    $content = file_get_contents($file);
    
    switch ($extension) {
        case 'html':
            // Check for basic HTML structure
            if (strpos($content, '<html') === false && strpos($content, '<!DOCTYPE') === false) {
                // Fragment is OK if it's a component
                if (strpos($file, 'components') === false && strpos($file, 'widgets') === false) {
                    return array('valid' => false, 'message' => 'Missing HTML structure');
                }
            }
            break;
            
        case 'css':
            // Check for valid CSS (basic check)
            if (substr_count($content, '{') !== substr_count($content, '}')) {
                return array('valid' => false, 'message' => 'Unbalanced CSS braces');
            }
            break;
            
        case 'js':
            // Check for valid JS (basic check)
            if (substr_count($content, '{') !== substr_count($content, '}')) {
                return array('valid' => false, 'message' => 'Unbalanced JS braces');
            }
            break;
    }
    
    return array('valid' => true);
}

/**
 * DOZO v7.1.1: Get destination path for design file
 */
function dozo_get_destination_path($file) {
    $relative_path = str_replace(RS_CLAUDE_DESIGN_PATH, '', $file);
    $relative_path = ltrim($relative_path, '/\\');
    
    // Map directories
    $mappings = array(
        'Shortcodes/' => 'public/shortcodes/',
        'Admin Panels/' => 'templates/admin/panels/',
        'Themes/' => 'assets/themes/',
        'UI Components/' => 'templates/components/',
        'Widgets/' => 'templates/widgets/',
        'Scripts/' => 'assets/js/claude/',
        'Assets/' => 'assets/claude/',
        'Documentation/' => 'docs/claude/'
    );
    
    foreach ($mappings as $source => $dest) {
        if (strpos($relative_path, $source) === 0) {
            $dest_path = str_replace($source, $dest, $relative_path);
            return RS_WARRANTY_PLUGIN_DIR . $dest_path;
        }
    }
    
    return null;
}

/**
 * DOZO v7.1.1: Save sync log
 */
function dozo_save_sync_log($log) {
    $upload_dir = wp_upload_dir();
    $log_dir = $upload_dir['basedir'] . '/dozo-sync-logs/';
    
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
        file_put_contents($log_dir . '.htaccess', "Deny from all\n");
    }
    
    $log_file = $log_dir . 'dozo_sync_log.json';
    
    // Backup existing log
    if (file_exists($log_file)) {
        $backup_file = $log_dir . 'dozo_sync_log_' . time() . '.json';
        copy($log_file, $backup_file);
    }
    
    file_put_contents($log_file, wp_json_encode($log, JSON_PRETTY_PRINT));
}

/**
 * DOZO v7.1.1: Get latest sync log
 */
function dozo_get_sync_log() {
    $upload_dir = wp_upload_dir();
    $log_file = $upload_dir['basedir'] . '/dozo-sync-logs/dozo_sync_log.json';
    
    if (!file_exists($log_file)) {
        return null;
    }
    
    return json_decode(file_get_contents($log_file), true);
}

/**
 * DOZO v7.1.1: AJAX endpoint for manual sync
 */
add_action('wp_ajax_dozo_sync_execute', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $result = dozo_sync_execute();
    
    wp_send_json_success($result);
});

/**
 * DOZO v7.1.1: AJAX endpoint for sync log
 */
add_action('wp_ajax_dozo_sync_get_log', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $log = dozo_get_sync_log();
    
    if ($log) {
        wp_send_json_success($log);
    } else {
        wp_send_json_error(array('message' => 'No sync log found'));
    }
});

/**
 * DOZO v7.1.1: Daily automated sync (when WP_DEBUG enabled)
 */
add_action('init', function() {
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        $last_run = get_option('dozo_sync_last_run', 0);
        $time_since_last = time() - $last_run;
        
        // Run once per day (86400 seconds)
        if ($time_since_last > 86400) {
            dozo_sync_execute();
            update_option('dozo_sync_last_run', time());
            error_log('🔄 DOZO Sync: Daily automated sync completed');
        }
    }
}, 50);

/**
 * DOZO v7.1.1: Admin notice for sync status
 */
add_action('admin_notices', function() {
    // Only show on plugin pages
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'warranty') === false) {
        return;
    }
    
    $log = dozo_get_sync_log();
    
    if (!$log) {
        return;
    }
    
    // Show notice if recent sync
    $log_time = isset($log['timestamp']) ? strtotime($log['timestamp']) : 0;
    $time_since = time() - $log_time;
    
    // Only show if synced in last hour
    if ($time_since < 3600 && isset($log['synced_files']) && $log['synced_files'] > 0) {
        ?>
        <div class="notice notice-success is-dismissible">
            <p><strong>🧩 DOZO Sync:</strong> <?php echo $log['synced_files']; ?> design file(s) 
            synchronized successfully from Claude AI.</p>
        </div>
        <?php
    } elseif ($time_since < 3600 && isset($log['errors']) && $log['errors'] > 0) {
        ?>
        <div class="notice notice-warning">
            <p><strong>⚠️ DOZO Sync:</strong> Sync completed with <?php echo $log['errors']; ?> error(s). 
            Check debug.log for details.</p>
        </div>
        <?php
    }
});

/**
 * DOZO v7.1.1: Manual sync trigger (for debugging)
 * 
 * Usage: Add to functions.php temporarily:
 * add_action('init', 'dozo_manual_sync', 5);
 */
function dozo_manual_sync() {
    if (current_user_can('manage_options')) {
        $result = dozo_sync_execute();
        error_log('DOZO Manual Sync Result: ' . print_r($result, true));
    }
}

// Log initialization
error_log('✅ DOZO Sync Engine v7.1.1 loaded successfully');


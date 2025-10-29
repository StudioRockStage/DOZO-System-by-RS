<?php
/**
 * DOZO Repair Engine
 * DOZO Deep Audit v7.0.4 - Recursive Class Repair & Module Integrity Fix
 * 
 * Provides automated diagnostic and logging capabilities for structural issues.
 * NON-DESTRUCTIVE: Does not auto-fix files, only reports and logs issues.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.0.4
 * @since 7.0.4
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.0.4: Comprehensive repair engine diagnostic
 */
function dozo_repair_engine_scan() {
    $includes_dir = RS_WARRANTY_PLUGIN_DIR . 'includes/';
    
    if (!is_dir($includes_dir)) {
        error_log('DOZO v7.0.4 Repair Engine: Includes directory not found');
        return array('status' => 'error', 'message' => 'Directory not found');
    }
    
    $report = array(
        'timestamp' => current_time('mysql'),
        'version' => RS_DOZO_VERSION,
        'scan_results' => array(),
        'total_files' => 0,
        'files_with_issues' => 0,
        'total_issues' => 0
    );
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($includes_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($files as $file) {
        if (!$file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }
        
        $filepath = $file->getPathname();
        $basename = basename($filepath);
        
        // Skip index files
        if ($basename === 'index.php') {
            continue;
        }
        
        $report['total_files']++;
        
        $content = file_get_contents($filepath);
        
        // Skip files without classes
        if (strpos($content, 'class ') === false) {
            continue;
        }
        
        $file_issues = array();
        
        // Check 1: Brace balance
        $open_braces = substr_count($content, '{');
        $close_braces = substr_count($content, '}');
        
        if ($open_braces !== $close_braces) {
            $difference = $open_braces - $close_braces;
            $file_issues[] = array(
                'type' => 'brace_imbalance',
                'severity' => 'critical',
                'message' => abs($difference) . ' brace(s) ' . ($difference > 0 ? 'missing' : 'extra'),
                'open' => $open_braces,
                'close' => $close_braces
            );
        }
        
        // Check 2: Parenthesis balance
        $open_parens = substr_count($content, '(');
        $close_parens = substr_count($content, ')');
        
        if ($open_parens !== $close_parens) {
            $file_issues[] = array(
                'type' => 'parenthesis_imbalance',
                'severity' => 'high',
                'message' => 'Parentheses not balanced',
                'open' => $open_parens,
                'close' => $close_parens
            );
        }
        
        // Check 3: Bracket balance
        $open_brackets = substr_count($content, '[');
        $close_brackets = substr_count($content, ']');
        
        if ($open_brackets !== $close_brackets) {
            $file_issues[] = array(
                'type' => 'bracket_imbalance',
                'severity' => 'medium',
                'message' => 'Brackets not balanced',
                'open' => $open_brackets,
                'close' => $close_brackets
            );
        }
        
        // Check 4: Methods outside classes
        $lines = explode("\n", $content);
        $inside_class = false;
        $brace_depth = 0;
        $class_brace_level = 0;
        $methods_outside = array();
        
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
                $methods_outside[] = array(
                    'line' => $i + 1,
                    'method' => $matches[2],
                    'visibility' => $matches[1]
                );
            }
        }
        
        if (!empty($methods_outside)) {
            $file_issues[] = array(
                'type' => 'methods_outside_class',
                'severity' => 'critical',
                'message' => count($methods_outside) . ' method(s) declared outside of class',
                'methods' => $methods_outside
            );
        }
        
        // Add to report if issues found
        if (!empty($file_issues)) {
            $report['files_with_issues']++;
            $report['total_issues'] += count($file_issues);
            $report['scan_results'][$basename] = array(
                'file' => $basename,
                'path' => str_replace(RS_WARRANTY_PLUGIN_DIR, '', $filepath),
                'issues' => $file_issues,
                'issue_count' => count($file_issues)
            );
            
            // Log issues
            error_log('🔧 DOZO Repair Engine: Issues in ' . $basename);
            foreach ($file_issues as $issue) {
                error_log('   → ' . $issue['severity'] . ': ' . $issue['message']);
                if ($issue['type'] === 'methods_outside_class') {
                    foreach ($issue['methods'] as $method) {
                        error_log('      Line ' . $method['line'] . ': ' . $method['visibility'] . ' function ' . $method['method']);
                    }
                }
            }
        }
    }
    
    // Summary logging
    if ($report['files_with_issues'] === 0) {
        error_log('✅ DOZO Repair Engine: All ' . $report['total_files'] . ' files passed structural validation');
    } else {
        error_log('⚠️ DOZO Repair Engine: ' . $report['files_with_issues'] . ' of ' . $report['total_files'] . ' files have issues (' . $report['total_issues'] . ' total issues)');
    }
    
    return $report;
}

/**
 * DOZO v7.0.4: Quick health check for all includes files
 */
function dozo_repair_engine_health_check() {
    $includes_dir = RS_WARRANTY_PLUGIN_DIR . 'includes/';
    
    if (!is_dir($includes_dir)) {
        return array('status' => 'error', 'health_score' => 0);
    }
    
    $total_files = 0;
    $healthy_files = 0;
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($includes_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($files as $file) {
        if (!$file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }
        
        $basename = basename($file->getPathname());
        if ($basename === 'index.php') {
            continue;
        }
        
        $content = file_get_contents($file->getPathname());
        
        if (strpos($content, 'class ') === false) {
            continue;
        }
        
        $total_files++;
        
        // Quick check: braces balanced?
        $open = substr_count($content, '{');
        $close = substr_count($content, '}');
        
        if ($open === $close) {
            $healthy_files++;
        }
    }
    
    $health_score = $total_files > 0 ? round(($healthy_files / $total_files) * 100) : 100;
    
    return array(
        'status' => 'ok',
        'health_score' => $health_score,
        'total_files' => $total_files,
        'healthy_files' => $healthy_files,
        'unhealthy_files' => $total_files - $healthy_files
    );
}

/**
 * DOZO v7.0.4: AJAX endpoint for repair engine scan
 */
add_action('wp_ajax_dozo_repair_engine_scan', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $report = dozo_repair_engine_scan();
    
    wp_send_json_success($report);
});

/**
 * DOZO v7.0.4: AJAX endpoint for health check
 */
add_action('wp_ajax_dozo_repair_engine_health', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $health = dozo_repair_engine_health_check();
    
    wp_send_json_success($health);
});

/**
 * DOZO v7.0.4: Daily automated scan (when WP_DEBUG enabled)
 */
add_action('init', function() {
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        $last_run = get_option('dozo_repair_engine_last_run', 0);
        $time_since_last = time() - $last_run;
        
        // Run once per day (86400 seconds)
        if ($time_since_last > 86400) {
            dozo_repair_engine_scan();
            update_option('dozo_repair_engine_last_run', time());
        }
    }
}, 30);

/**
 * DOZO v7.0.4: Admin notice for structural issues
 */
add_action('admin_notices', function() {
    // Only show on plugin pages
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'warranty') === false) {
        return;
    }
    
    // Quick check
    $health = dozo_repair_engine_health_check();
    
    if ($health['health_score'] < 100 && (!defined('DOZO_SAFE_MODE') || DOZO_SAFE_MODE !== true)) {
        $unhealthy_count = $health['unhealthy_files'];
        ?>
        <div class="notice notice-warning">
            <p><strong>⚠️ DOZO Repair Engine:</strong> Se detectaron <?php echo $unhealthy_count; ?> archivo(s) 
            con problemas estructurales. Puntuación de salud: <?php echo $health['health_score']; ?>%. 
            Revisa <code>wp-content/debug.log</code> para más detalles.</p>
        </div>
        <?php
    }
});

/**
 * DOZO v7.0.4: Manual scan trigger (for debugging)
 * 
 * Usage: Add to functions.php temporarily:
 * add_action('init', 'dozo_manual_repair_scan', 5);
 */
function dozo_manual_repair_scan() {
    if (current_user_can('manage_options')) {
        $report = dozo_repair_engine_scan();
        error_log('DOZO Manual Repair Scan Complete: ' . print_r($report, true));
    }
}


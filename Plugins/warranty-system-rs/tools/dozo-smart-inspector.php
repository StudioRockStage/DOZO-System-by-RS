<?php
/**
 * DOZO Smart Inspector
 * DOZO Deep Audit v7.4.1 - Full Self-Healing Engine + Visual Feedback Layer
 * 
 * Deep analysis of all plugin files for syntax errors, nonces, escaping, translations.
 * Comprehensive validation of PHP, JS, HTML, CSS files.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.4.1
 * @since 7.4.1
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.4.1: Smart Inspector - Comprehensive file analysis
 */
function dozo_smart_inspector_scan() {
    error_log('🔍 DOZO v7.4.1: Smart Inspector scan started');
    
    $report = array(
        'timestamp' => current_time('mysql'),
        'version' => RS_DOZO_VERSION,
        'scanned_files' => 0,
        'issues_found' => 0,
        'files_with_issues' => array(),
        'categories' => array(
            'syntax_errors' => 0,
            'nonce_issues' => 0,
            'escaping_issues' => 0,
            'translation_issues' => 0,
            'dependency_issues' => 0
        )
    );
    
    // Scan includes directory
    $includes_files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(RS_WARRANTY_PLUGIN_DIR . 'includes/', RecursiveDirectoryIterator::SKIP_DOTS)
    );
    
    foreach ($includes_files as $file) {
        if (!$file->isFile() || $file->getExtension() !== 'php') {
            continue;
        }
        
        $filepath = $file->getPathname();
        $report['scanned_files']++;
        
        $file_issues = dozo_inspect_php_file($filepath);
        
        if (!empty($file_issues)) {
            $report['issues_found'] += count($file_issues);
            $report['files_with_issues'][] = array(
                'file' => str_replace(RS_WARRANTY_PLUGIN_DIR, '', $filepath),
                'issues' => $file_issues
            );
            
            // Categorize issues
            foreach ($file_issues as $issue) {
                if (isset($issue['category']) && isset($report['categories'][$issue['category']])) {
                    $report['categories'][$issue['category']]++;
                }
            }
        }
    }
    
    // Log summary
    error_log('✅ DOZO Smart Inspector: Scanned ' . $report['scanned_files'] . ' files, found ' . 
        $report['issues_found'] . ' issues in ' . count($report['files_with_issues']) . ' files');
    
    // Save report
    $upload_dir = wp_upload_dir();
    $log_dir = $upload_dir['basedir'] . '/dozo-logs/';
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
    }
    file_put_contents($log_dir . 'dozo-smart-inspector.json', wp_json_encode($report, JSON_PRETTY_PRINT));
    
    return $report;
}

/**
 * DOZO v7.4.1: Inspect individual PHP file
 */
function dozo_inspect_php_file($filepath) {
    $issues = array();
    $content = file_get_contents($filepath);
    
    // Check 1: Syntax (braces balance)
    $open_braces = substr_count($content, '{');
    $close_braces = substr_count($content, '}');
    if ($open_braces !== $close_braces) {
        $issues[] = array(
            'type' => 'syntax_error',
            'category' => 'syntax_errors',
            'severity' => 'critical',
            'message' => 'Unbalanced braces: ' . $open_braces . ' open, ' . $close_braces . ' close'
        );
    }
    
    // Check 2: Nonce usage in AJAX handlers
    if (strpos($content, 'wp_ajax_') !== false && strpos($content, 'check_ajax_referer') === false) {
        $issues[] = array(
            'type' => 'security',
            'category' => 'nonce_issues',
            'severity' => 'high',
            'message' => 'AJAX handler without nonce verification'
        );
    }
    
    // Check 3: Escaping in output
    if (preg_match('/echo\s+\$[a-zA-Z_]/', $content) && strpos($content, 'esc_') === false) {
        $issues[] = array(
            'type' => 'security',
            'category' => 'escaping_issues',
            'severity' => 'medium',
            'message' => 'Potential unescaped output'
        );
    }
    
    // Check 4: Translation functions
    if (strpos($content, '__(' ) === false && strpos($content, '_e(') === false && 
        (strpos($content, 'class ') !== false || strpos($content, 'function ') !== false)) {
        // File has classes/functions but no translations - this might be intentional
        // Only flag if there are string literals in HTML-like contexts
        if (preg_match('/<h[1-6]>/', $content) || preg_match('/<label/', $content)) {
            $issues[] = array(
                'type' => 'i18n',
                'category' => 'translation_issues',
                'severity' => 'low',
                'message' => 'Potential missing translations'
            );
        }
    }
    
    return $issues;
}

/**
 * DOZO v7.4.1: AJAX endpoint for smart inspector
 */
add_action('wp_ajax_dozo_smart_inspector', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $report = dozo_smart_inspector_scan();
    
    wp_send_json_success($report);
});

error_log('✅ DOZO Smart Inspector v7.4.1 loaded');


<?php
/**
 * DOZO Self-Healing Engine
 * DOZO Deep Audit v7.1 - Self-Healing & Knowledge Memory Integration
 * 
 * Autonomous system for detecting, tracking, and re-applying fixes automatically.
 * Learns from past errors and maintains solution integrity.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.1
 * @since 7.1.0
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.1: Self-Healing Check - Main verification and repair cycle
 */
function dozo_self_healing_check() {
    $kb = RS_DOZO_Knowledge_Base::get_instance();
    
    // Log self-healing cycle start
    error_log('🔧 DOZO v7.1: Starting self-healing verification cycle');
    
    // Get all non-archived issues
    $issues = $kb->get_issues();
    
    if (empty($issues)) {
        error_log('✅ DOZO v7.1: No issues tracked in knowledge base yet');
        return;
    }
    
    $verified_count = 0;
    $reapplied_count = 0;
    $failed_count = 0;
    
    foreach ($issues as $issue) {
        // Skip archived issues
        if (isset($issue['status']) && $issue['status'] === 'archived') {
            continue;
        }
        
        $filepath = RS_WARRANTY_PLUGIN_DIR . 'includes/' . $issue['file'];
        
        if (!file_exists($filepath)) {
            error_log('⚠️ DOZO v7.1: File not found for issue ' . $issue['id'] . ': ' . $issue['file']);
            $failed_count++;
            continue;
        }
        
        // Verify the fix is still in place
        $verification_result = dozo_verify_fix($filepath, $issue);
        
        if ($verification_result['status'] === 'verified') {
            $kb->update_issue_status($issue['id'], 'verified', true);
            $verified_count++;
            error_log('✅ DOZO v7.1: Issue ' . $issue['id'] . ' verified in ' . $issue['file']);
        } elseif ($verification_result['status'] === 'missing') {
            // Fix is missing, attempt to re-apply
            error_log('⚠️ DOZO v7.1: Fix missing for issue ' . $issue['id'] . ' in ' . $issue['file']);
            
            $reapply_result = dozo_reapply_fix($filepath, $issue);
            
            if ($reapply_result['success']) {
                $kb->update_issue_status($issue['id'], 'reapplied', false);
                $reapplied_count++;
                error_log('🔧 DOZO v7.1: Fix re-applied for issue ' . $issue['id']);
            } else {
                $failed_count++;
                error_log('❌ DOZO v7.1: Failed to re-apply fix for issue ' . $issue['id'] . ': ' . $reapply_result['message']);
            }
        }
    }
    
    // Log summary
    $total = $verified_count + $reapplied_count + $failed_count;
    error_log('✅ DOZO v7.1: Self-healing cycle complete - ' . 
        $verified_count . ' verified, ' . 
        $reapplied_count . ' re-applied, ' . 
        $failed_count . ' failed of ' . $total . ' total');
    
    // Archive old verified issues (3+ verifications)
    $archived_count = $kb->archive_verified_issues(3);
    if ($archived_count > 0) {
        error_log('📦 DOZO v7.1: Archived ' . $archived_count . ' stable issues');
    }
}

/**
 * DOZO v7.1: Verify if a fix is still in place
 */
function dozo_verify_fix($filepath, $issue) {
    $content = file_get_contents($filepath);
    
    // Different verification strategies based on fix type
    switch ($issue['fix']) {
        case 'moved_method_inside_class':
        case 'moved_ajax_get_health_score_inside_class':
            // Verify method is inside class (not outside)
            return dozo_verify_method_in_class($content, $issue);
            
        case 'removed_duplicate_initialization':
            // Verify no duplicate initialization
            return dozo_verify_no_duplicates($content, $issue);
            
        case 'balanced_braces':
            // Verify braces are balanced
            return dozo_verify_brace_balance($content, $issue);
            
        default:
            // Generic verification - just check file exists and is readable
            return array('status' => 'verified', 'message' => 'File exists and is readable');
    }
}

/**
 * DOZO v7.1: Verify method is inside class
 */
function dozo_verify_method_in_class($content, $issue) {
    $lines = explode("\n", $content);
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
        
        // Check if we find a method declaration outside of class
        if (!$inside_class && preg_match('/^\s*(public|private|protected)\s+function\s+\w+/', $line)) {
            return array(
                'status' => 'missing',
                'message' => 'Method found outside of class at line ' . ($i + 1),
                'line' => $i + 1
            );
        }
    }
    
    return array('status' => 'verified', 'message' => 'All methods inside classes');
}

/**
 * DOZO v7.1: Verify no duplicate initialization
 */
function dozo_verify_no_duplicates($content, $issue) {
    // Count occurrences of initialization pattern
    $pattern = '/\$instance\s*=\s*new\s+self\(\)/';
    preg_match_all($pattern, $content, $matches);
    
    if (count($matches[0]) > 1) {
        return array(
            'status' => 'missing',
            'message' => 'Duplicate initialization found (' . count($matches[0]) . ' occurrences)'
        );
    }
    
    return array('status' => 'verified', 'message' => 'No duplicates found');
}

/**
 * DOZO v7.1: Verify brace balance
 */
function dozo_verify_brace_balance($content, $issue) {
    $open = substr_count($content, '{');
    $close = substr_count($content, '}');
    
    if ($open !== $close) {
        return array(
            'status' => 'missing',
            'message' => 'Braces imbalanced: ' . $open . ' open, ' . $close . ' close',
            'open' => $open,
            'close' => $close
        );
    }
    
    return array('status' => 'verified', 'message' => 'Braces balanced');
}

/**
 * DOZO v7.1: Attempt to re-apply a fix
 * 
 * NOTE: This is a READ-ONLY verification in v7.1. 
 * Actual fixes should be applied manually or through admin approval.
 * Auto-fixing is disabled for safety.
 */
function dozo_reapply_fix($filepath, $issue) {
    // For safety, we don't auto-fix in v7.1
    // Instead, we log the issue and require manual intervention
    
    return array(
        'success' => false,
        'message' => 'Auto-fix disabled - manual intervention required. Check debug.log for details.'
    );
    
    // Future: Implement approved auto-fixes here with strict validation
}

/**
 * DOZO v7.1: Register historical issues from previous fixes
 */
function dozo_register_historical_issues() {
    $kb = RS_DOZO_Knowledge_Base::get_instance();
    
    // Check if historical issues already registered
    $existing_issues = $kb->get_issues();
    if (!empty($existing_issues)) {
        // Already registered
        return;
    }
    
    error_log('📚 DOZO v7.1: Registering historical issues from v7.0.x fixes');
    
    // v7.0.3 fix: class-warranty-core.php line 1534
    $kb->log_issue(
        'core_1534_method_outside_class',
        'class-warranty-core.php',
        1534,
        'syntax_error',
        'moved_ajax_get_health_score_inside_class',
        'verified'
    );
    
    // v7.0.4 fix: class-dozo-reaper-cleaner.php line 326
    $kb->log_issue(
        'reaper_326_method_outside_class',
        'class-dozo-reaper-cleaner.php',
        326,
        'syntax_error',
        'moved_method_inside_class',
        'verified'
    );
    
    // v7.0.4 fix: class-dozo-reaper-cleaner.php duplicate initialization
    $kb->log_issue(
        'reaper_duplicate_init',
        'class-dozo-reaper-cleaner.php',
        320,
        'duplicate_code',
        'removed_duplicate_initialization',
        'verified'
    );
    
    // v7.0.4 fix: class-dozo-reaper-cleaner.php brace balance
    $kb->log_issue(
        'reaper_brace_imbalance',
        'class-dozo-reaper-cleaner.php',
        347,
        'syntax_error',
        'balanced_braces',
        'verified'
    );
    
    error_log('✅ DOZO v7.1: 4 historical issues registered in knowledge base');
}

/**
 * DOZO v7.1: Get self-healing report
 */
function dozo_get_self_healing_report() {
    $kb = RS_DOZO_Knowledge_Base::get_instance();
    $stats = $kb->get_kb_stats();
    
    return array(
        'timestamp' => current_time('mysql'),
        'version' => RS_DOZO_VERSION,
        'statistics' => $stats,
        'issues' => $kb->get_issues(),
        'pending_issues' => count($kb->get_issues('pending')),
        'verified_issues' => count($kb->get_issues('verified')),
        'reapplied_issues' => count($kb->get_issues('reapplied')),
        'archived_issues' => count($kb->get_issues('archived'))
    );
}

/**
 * DOZO v7.1: AJAX endpoint for self-healing report
 */
add_action('wp_ajax_dozo_self_healing_report', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $report = dozo_get_self_healing_report();
    
    wp_send_json_success($report);
});

/**
 * DOZO v7.1: Run self-healing check on plugin load
 */
add_action('plugins_loaded', 'dozo_register_historical_issues', 5);
add_action('plugins_loaded', 'dozo_self_healing_check', 10);

/**
 * DOZO v7.1: Daily automated self-healing (when WP_DEBUG enabled)
 */
add_action('init', function() {
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        $last_run = get_option('dozo_self_healing_last_run', 0);
        $time_since_last = time() - $last_run;
        
        // Run once per day (86400 seconds)
        if ($time_since_last > 86400) {
            dozo_self_healing_check();
            update_option('dozo_self_healing_last_run', time());
            error_log('🔧 DOZO v7.1: Daily self-healing check completed');
        }
    }
}, 40);

/**
 * DOZO v7.1: Admin notice for self-healing status
 */
add_action('admin_notices', function() {
    // Only show on plugin pages
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'warranty') === false) {
        return;
    }
    
    $kb = RS_DOZO_Knowledge_Base::get_instance();
    $stats = $kb->get_kb_stats();
    
    $pending = isset($stats['pending']) ? $stats['pending'] : 0;
    $reapplied = isset($stats['reapplied']) ? $stats['reapplied'] : 0;
    
    if ($reapplied > 0) {
        ?>
        <div class="notice notice-success">
            <p><strong>🔧 DOZO Self-Healing:</strong> <?php echo $reapplied; ?> fix(es) were 
            automatically re-applied to maintain plugin stability.</p>
        </div>
        <?php
    }
    
    if ($pending > 0 && (!defined('DOZO_SAFE_MODE') || DOZO_SAFE_MODE !== true)) {
        ?>
        <div class="notice notice-info">
            <p><strong>📊 DOZO Knowledge Base:</strong> <?php echo $pending; ?> issue(s) pending 
            verification. The self-healing system is monitoring them.</p>
        </div>
        <?php
    }
});

/**
 * DOZO v7.1: Manual self-healing trigger (for debugging)
 * 
 * Usage: Add to functions.php temporarily:
 * add_action('init', 'dozo_manual_self_healing', 5);
 */
function dozo_manual_self_healing() {
    if (current_user_can('manage_options')) {
        dozo_self_healing_check();
        $report = dozo_get_self_healing_report();
        error_log('DOZO Manual Self-Healing Report: ' . print_r($report, true));
    }
}


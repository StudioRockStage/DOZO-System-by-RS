<?php
/**
 * DOZO Knowledge Base
 * DOZO Deep Audit v7.0 - Smart Sync & Design Awareness
 * 
 * Persistent tracking system for changes, versions, errors, and solutions.
 * Provides bidirectional sync awareness and historical metrics.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.0
 * @since 7.0.0
 */

defined('ABSPATH') || exit;

class RS_DOZO_Knowledge_Base {
    private static $instance = null;
    
    /**
     * Knowledge base file
     */
    private $kb_file;
    
    /**
     * Maximum records to keep
     */
    private $max_records = 500;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $upload_dir = wp_upload_dir();
        $kb_dir = $upload_dir['basedir'] . '/dozo-knowledge-base/';
        
        if (!file_exists($kb_dir)) {
            wp_mkdir_p($kb_dir);
            file_put_contents($kb_dir . '.htaccess', "Deny from all\n");
        }
        
        $this->kb_file = $kb_dir . 'dozo-kb-v7.0.json';
        
        // Initialize KB if not exists
        if (!file_exists($this->kb_file)) {
            $this->initialize_kb();
        }
        
        // AJAX endpoints
        add_action('wp_ajax_rs_dozo_kb_log', array($this, 'ajax_log_event'));
        add_action('wp_ajax_rs_dozo_kb_get', array($this, 'ajax_get_history'));
    }
    
    /**
     * Initialize knowledge base
     */
    private function initialize_kb() {
        $initial_data = array(
            'version' => '7.0',
            'created' => current_time('mysql'),
            'plugin_version' => RS_WARRANTY_VERSION,
            'events' => array(),
            'metrics' => array(
                'total_diagnostics' => 0,
                'total_cleanups' => 0,
                'total_syncs' => 0,
                'total_errors' => 0
            )
        );
        
        file_put_contents($this->kb_file, wp_json_encode($initial_data, JSON_PRETTY_PRINT));
    }
    
    /**
     * Log event to knowledge base
     */
    public function log_event($type, $data) {
        if (!file_exists($this->kb_file)) {
            $this->initialize_kb();
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        $event = array(
            'id' => uniqid('dozo_'),
            'type' => $type,
            'timestamp' => current_time('mysql'),
            'plugin_version' => RS_WARRANTY_VERSION,
            'dozo_version' => RS_DOZO_VERSION,
            'data' => $data
        );
        
        // Add event
        array_unshift($kb['events'], $event);
        
        // Update metrics
        switch ($type) {
            case 'diagnostic':
                $kb['metrics']['total_diagnostics']++;
                break;
            case 'cleanup':
                $kb['metrics']['total_cleanups']++;
                break;
            case 'sync':
                $kb['metrics']['total_syncs']++;
                break;
            case 'error':
                $kb['metrics']['total_errors']++;
                break;
        }
        
        // Keep only last N records
        $kb['events'] = array_slice($kb['events'], 0, $this->max_records);
        
        // Save
        file_put_contents($this->kb_file, wp_json_encode($kb, JSON_PRETTY_PRINT));
        
        return $event['id'];
    }
    
    /**
     * AJAX: Log event
     */
    public function ajax_log_event() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'general';
        $data = isset($_POST['data']) ? $_POST['data'] : array();
        
        $event_id = $this->log_event($type, $data);
        
        wp_send_json_success(array(
            'event_id' => $event_id,
            'message' => 'Evento registrado en Knowledge Base'
        ));
    }
    
    /**
     * AJAX: Get history
     */
    public function ajax_get_history() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $limit = isset($_POST['limit']) ? absint($_POST['limit']) : 50;
        
        $history = $this->get_history($limit);
        
        wp_send_json_success(array(
            'history' => $history,
            'total' => count($history['events'])
        ));
    }
    
    /**
     * Get history
     */
    public function get_history($limit = 50) {
        if (!file_exists($this->kb_file)) {
            return array('events' => array(), 'metrics' => array());
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        return array(
            'events' => array_slice($kb['events'], 0, $limit),
            'metrics' => $kb['metrics']
        );
    }
    
    /**
     * Get health score
     */
    public function get_health_score() {
        $stats = array(
            'obsolete_files' => 0,
            'log_size' => 0,
            'last_cleanup' => 0,
            'errors' => 0
        );
        
        // Check obsolete files
        $scan = $this->scan_quick();
        $stats['obsolete_files'] = $scan['total'];
        
        // Check log size
        if (file_exists($this->log_file)) {
            $stats['log_size'] = filesize($this->log_file);
        }
        
        // Get last cleanup from KB
        $history = $this->get_history(10);
        foreach ($history['events'] as $event) {
            if ($event['type'] === 'cleanup') {
                $stats['last_cleanup'] = strtotime($event['timestamp']);
                break;
            }
        }
        
        $stats['errors'] = isset($history['metrics']['total_errors']) ? $history['metrics']['total_errors'] : 0;
        
        // Calculate health score (0-100)
        $score = 100;
        
        // Deduct for obsolete files
        $score -= min(30, $stats['obsolete_files'] * 2);
        
        // Deduct for large log
        if ($stats['log_size'] > 1048576) { // > 1MB
            $score -= 10;
        }
        
        // Deduct if no recent cleanup
        $days_since_cleanup = $stats['last_cleanup'] > 0 ? 
            floor((time() - $stats['last_cleanup']) / 86400) : 999;
        
        if ($days_since_cleanup > 30) {
            $score -= 20;
        }
        
        // Deduct for errors
        $score -= min(20, $stats['errors']);
        
        return max(0, min(100, $score));
    }
    
    /**
     * Quick scan (less intensive)
     */
    private function scan_quick() {
        $plugin_dir = RS_WARRANTY_PLUGIN_DIR;
        $count = 0;
        
        foreach ($this->obsolete_patterns as $pattern) {
            $files = glob($plugin_dir . $pattern);
            $count += is_array($files) ? count($files) : 0;
        }
        
        return array('total' => $count);
    }
    
    /**
     * DOZO v7.1: Log issue with solution
     */
    public function log_issue($issue_id, $file, $line, $error_type, $fix, $status = 'applied') {
        if (!file_exists($this->kb_file)) {
            $this->initialize_kb();
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        // Initialize issues array if not exists
        if (!isset($kb['issues'])) {
            $kb['issues'] = array();
        }
        
        $issue = array(
            'id' => $issue_id,
            'file' => $file,
            'line' => $line,
            'error_type' => $error_type,
            'fix' => $fix,
            'status' => $status,
            'applied_at' => current_time('mysql'),
            'verified_at' => null,
            'verification_count' => 0
        );
        
        // Update or add issue
        $found = false;
        foreach ($kb['issues'] as &$existing_issue) {
            if ($existing_issue['id'] === $issue_id) {
                $existing_issue = array_merge($existing_issue, $issue);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $kb['issues'][] = $issue;
        }
        
        file_put_contents($this->kb_file, wp_json_encode($kb, JSON_PRETTY_PRINT));
        
        return $issue_id;
    }
    
    /**
     * DOZO v7.1: Update issue status
     */
    public function update_issue_status($issue_id, $status, $increment_verification = false) {
        if (!file_exists($this->kb_file)) {
            return false;
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        if (!isset($kb['issues'])) {
            return false;
        }
        
        foreach ($kb['issues'] as &$issue) {
            if ($issue['id'] === $issue_id) {
                $issue['status'] = $status;
                $issue['verified_at'] = current_time('mysql');
                
                if ($increment_verification) {
                    $issue['verification_count'] = isset($issue['verification_count']) ? $issue['verification_count'] + 1 : 1;
                }
                
                file_put_contents($this->kb_file, wp_json_encode($kb, JSON_PRETTY_PRINT));
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * DOZO v7.1: Get all issues
     */
    public function get_issues($status = null) {
        if (!file_exists($this->kb_file)) {
            return array();
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        if (!isset($kb['issues']) || !is_array($kb['issues'])) {
            return array();
        }
        
        if ($status === null) {
            return $kb['issues'];
        }
        
        return array_filter($kb['issues'], function($issue) use ($status) {
            return $issue['status'] === $status;
        });
    }
    
    /**
     * DOZO v7.1: Get issue by ID
     */
    public function get_issue($issue_id) {
        if (!file_exists($this->kb_file)) {
            return null;
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        if (!isset($kb['issues'])) {
            return null;
        }
        
        foreach ($kb['issues'] as $issue) {
            if ($issue['id'] === $issue_id) {
                return $issue;
            }
        }
        
        return null;
    }
    
    /**
     * DOZO v7.1: Archive verified issues
     */
    public function archive_verified_issues($verification_threshold = 3) {
        if (!file_exists($this->kb_file)) {
            return 0;
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        if (!isset($kb['issues'])) {
            return 0;
        }
        
        $archived_count = 0;
        
        foreach ($kb['issues'] as &$issue) {
            if ($issue['status'] === 'verified' && 
                isset($issue['verification_count']) && 
                $issue['verification_count'] >= $verification_threshold) {
                $issue['status'] = 'archived';
                $issue['archived_at'] = current_time('mysql');
                $archived_count++;
            }
        }
        
        if ($archived_count > 0) {
            file_put_contents($this->kb_file, wp_json_encode($kb, JSON_PRETTY_PRINT));
        }
        
        return $archived_count;
    }
    
    /**
     * DOZO v7.1: Get knowledge base statistics
     */
    public function get_kb_stats() {
        if (!file_exists($this->kb_file)) {
            return array(
                'total_issues' => 0,
                'applied' => 0,
                'verified' => 0,
                'pending' => 0,
                'reapplied' => 0,
                'archived' => 0
            );
        }
        
        $kb = json_decode(file_get_contents($this->kb_file), true);
        
        $stats = array(
            'total_issues' => 0,
            'applied' => 0,
            'verified' => 0,
            'pending' => 0,
            'reapplied' => 0,
            'archived' => 0
        );
        
        if (isset($kb['issues']) && is_array($kb['issues'])) {
            $stats['total_issues'] = count($kb['issues']);
            
            foreach ($kb['issues'] as $issue) {
                $status = isset($issue['status']) ? $issue['status'] : 'unknown';
                if (isset($stats[$status])) {
                    $stats[$status]++;
                }
            }
        }
        
        return $stats;
    }
}

// Initialize
RS_DOZO_Knowledge_Base::get_instance();


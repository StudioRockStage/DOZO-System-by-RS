<?php
/**
 * DOZO Reaper Cleaner
 * DOZO Deep Audit v7.0 - Smart Sync & Design Awareness
 * 
 * Safe and intelligent file cleanup system with automatic backup,
 * MD5 verification, and detailed logging.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.0
 * @since 7.0.0
 */

defined('ABSPATH') || exit;

class RS_DOZO_Reaper_Cleaner {
    private static $instance = null;
    
    /**
     * Backup directory
     */
    private $backup_dir;
    
    /**
     * Log file
     */
    private $log_file;
    
    /**
     * Patterns for obsolete files
     */
    private $obsolete_patterns = array(
        '*.bak',
        '*.old',
        '*.tmp',
        '*.obsolete',
        '*~',
        '*.backup',
        '*.swp'
    );
    
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
        $this->backup_dir = $upload_dir['basedir'] . '/dozo-backups/reaper/';
        $this->log_file = $upload_dir['basedir'] . '/dozo-logs/dozo-cleaner.log';
        
        // Initialize directories
        $this->ensure_directories();
        
        // AJAX endpoints
        add_action('wp_ajax_rs_dozo_reaper_scan', array($this, 'ajax_scan'));
        add_action('wp_ajax_rs_dozo_reaper_clean', array($this, 'ajax_clean'));
    }
    
    /**
     * Ensure required directories exist
     */
    private function ensure_directories() {
        if (!file_exists($this->backup_dir)) {
            wp_mkdir_p($this->backup_dir);
            file_put_contents($this->backup_dir . '.htaccess', "Deny from all\n");
        }
        
        $log_dir = dirname($this->log_file);
        if (!file_exists($log_dir)) {
            wp_mkdir_p($log_dir);
            file_put_contents($log_dir . '/.htaccess', "Deny from all\n");
        }
    }
    
    /**
     * AJAX: Scan for obsolete files
     */
    public function ajax_scan() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $mode = isset($_POST['mode']) ? sanitize_text_field($_POST['mode']) : 'quick';
        
        $scan_results = $this->scan_obsolete_files($mode);
        
        wp_send_json_success(array(
            'scan_results' => $scan_results,
            'mode' => $mode,
            'timestamp' => current_time('mysql')
        ));
    }
    
    /**
     * AJAX: Clean obsolete files
     */
    public function ajax_clean() {
        check_ajax_referer('rs_warranty_admin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }
        
        $mode = isset($_POST['mode']) ? sanitize_text_field($_POST['mode']) : 'quick';
        
        $clean_results = $this->clean_obsolete_files($mode);
        
        wp_send_json_success(array(
            'clean_results' => $clean_results,
            'mode' => $mode,
            'timestamp' => current_time('mysql')
        ));
    }
    
    /**
     * Scan for obsolete files
     */
    private function scan_obsolete_files($mode = 'quick') {
        $plugin_dir = RS_WARRANTY_PLUGIN_DIR;
        $obsolete_files = array();
        
        foreach ($this->obsolete_patterns as $pattern) {
            $files = glob($plugin_dir . '**/' . $pattern, GLOB_BRACE);
            
            if ($files) {
                foreach ($files as $file) {
                    if (is_file($file)) {
                        $obsolete_files[] = array(
                            'path' => $file,
                            'name' => basename($file),
                            'size' => filesize($file),
                            'modified' => filemtime($file),
                            'age_days' => floor((time() - filemtime($file)) / 86400)
                        );
                    }
                }
            }
        }
        
        return array(
            'total' => count($obsolete_files),
            'files' => $obsolete_files,
            'mode' => $mode
        );
    }
    
    /**
     * Clean obsolete files with backup
     */
    private function clean_obsolete_files($mode = 'quick') {
        $scan = $this->scan_obsolete_files($mode);
        $results = array(
            'scanned' => $scan['total'],
            'backed_up' => 0,
            'deleted' => 0,
            'errors' => 0,
            'log' => array()
        );
        
        foreach ($scan['files'] as $file_info) {
            $file = $file_info['path'];
            
            // Skip files newer than 7 days in quick mode
            if ($mode === 'quick' && $file_info['age_days'] < 7) {
                $results['log'][] = 'Skipped (too new): ' . basename($file);
                continue;
            }
            
            // Create backup
            $backup_name = basename($file) . '.md5-' . md5_file($file) . '.' . time();
            $backup_path = $this->backup_dir . $backup_name;
            
            if (copy($file, $backup_path)) {
                $results['backed_up']++;
                $results['log'][] = 'Backed up: ' . basename($file);
                
                // Delete original
                if (unlink($file)) {
                    $results['deleted']++;
                    $results['log'][] = 'Deleted: ' . basename($file);
                    $this->log_operation('DELETE', $file, $backup_path);
                } else {
                    $results['errors']++;
                    $results['log'][] = 'Error deleting: ' . basename($file);
                }
            } else {
                $results['errors']++;
                $results['log'][] = 'Error backing up: ' . basename($file);
            }
        }
        
        return $results;
    }
    
    /**
     * Log cleanup operation
     */
    private function log_operation($action, $file, $backup = '') {
        $log_entry = sprintf(
            "[%s] %s: %s%s\n",
            current_time('Y-m-d H:i:s'),
            $action,
            $file,
            $backup ? ' → ' . $backup : ''
        );
        
        file_put_contents($this->log_file, $log_entry, FILE_APPEND);
    }
    
    /**
     * Get cleanup statistics
     */
    public function get_statistics() {
        $scan = $this->scan_obsolete_files('complete');
        
        return array(
            'obsolete_count' => $scan['total'],
            'total_size' => array_sum(array_column($scan['files'], 'size')),
            'oldest_file' => !empty($scan['files']) ? min(array_column($scan['files'], 'modified')) : 0,
            'log_exists' => file_exists($this->log_file),
            'log_size' => file_exists($this->log_file) ? filesize($this->log_file) : 0
        );
    }
}

// Initialize
RS_DOZO_Reaper_Cleaner::get_instance();


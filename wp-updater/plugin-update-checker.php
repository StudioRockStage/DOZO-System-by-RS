<?php
/**
 * DOZO System - WordPress Plugin Update Checker
 * Phase 16.7 - Client-side update checker for WordPress plugins
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class DOZO_Plugin_Update_Checker {
    
    private $plugin_slug;
    private $plugin_file;
    private $version;
    private $update_url;
    
    /**
     * Constructor
     */
    public function __construct($plugin_file, $update_url = '') {
        $this->plugin_file = $plugin_file;
        $this->plugin_slug = dirname(plugin_basename($plugin_file));
        $this->update_url = $update_url ?: 'https://updates.rockstage.mx/manifest.json';
        
        // Get current version
        if (!function_exists('get_plugin_data')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $plugin_data = get_plugin_data($plugin_file);
        $this->version = $plugin_data['Version'];
        
        // Hook into WordPress update system
        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_for_updates']);
        add_filter('plugins_api', [$this, 'plugin_info'], 10, 3);
    }
    
    /**
     * Check for plugin updates
     */
    public function check_for_updates($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }
        
        try {
            $remote = $this->request_update_info();
            
            if (!$remote || !isset($remote['update_available'])) {
                return $transient;
            }
            
            if ($remote['update_available'] === true) {
                $plugin_path = plugin_basename($this->plugin_file);
                
                $transient->response[$plugin_path] = (object) [
                    'slug' => $this->plugin_slug,
                    'plugin' => $plugin_path,
                    'new_version' => $remote['version'],
                    'package' => $remote['download_url'],
                    'tested' => $remote['tested'] ?? '6.4',
                    'requires' => $remote['requires'] ?? '6.0',
                    'requires_php' => $remote['requires_php'] ?? '7.4',
                    'url' => $remote['homepage'] ?? 'https://rockstage.mx'
                ];
            }
            
        } catch (Exception $e) {
            error_log('DOZO Update Check Failed: ' . $e->getMessage());
        }
        
        return $transient;
    }
    
    /**
     * Provide plugin information for update details
     */
    public function plugin_info($result, $action, $args) {
        if ($action !== 'plugin_information') {
            return $result;
        }
        
        if ($args->slug !== $this->plugin_slug) {
            return $result;
        }
        
        try {
            $remote = $this->request_update_info();
            
            if (!$remote || !isset($remote['version'])) {
                return $result;
            }
            
            return (object) [
                'name' => 'DOZO System',
                'slug' => $this->plugin_slug,
                'version' => $remote['version'],
                'tested' => $remote['tested'] ?? '6.4',
                'requires' => $remote['requires'] ?? '6.0',
                'requires_php' => $remote['requires_php'] ?? '7.4',
                'author' => 'RockStage Solutions',
                'homepage' => 'https://rockstage.mx',
                'download_link' => $remote['download_url'],
                'sections' => [
                    'description' => 'DOZO System by RockStage Solutions',
                    'changelog' => 'Version ' . $remote['version']
                ]
            ];
            
        } catch (Exception $e) {
            error_log('DOZO Plugin Info Failed: ' . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Request update information from server
     */
    private function request_update_info() {
        $cache_key = 'dozo_update_check_' . $this->plugin_slug;
        $cached = get_transient($cache_key);
        
        if ($cached !== false) {
            return $cached;
        }
        
        $response = wp_remote_get($this->update_url, [
            'timeout' => 10,
            'sslverify' => true
        ]);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response');
        }
        
        // Format response
        $result = [
            'update_available' => version_compare($data['version'], $this->version, '>'),
            'version' => $data['version'],
            'download_url' => $data['wordpress']['url'] ?? '',
            'tested' => '6.4',
            'requires' => '6.0',
            'requires_php' => '7.4'
        ];
        
        // Cache for 12 hours
        set_transient($cache_key, $result, 12 * HOUR_IN_SECONDS);
        
        return $result;
    }
}





<?php
/**
 * DOZO System - WordPress Plugin Update Endpoint
 * Phase 16.7 - Serve plugin update information
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class DOZO_Update_Endpoint {
    
    const MANIFEST_URL = 'https://updates.rockstage.mx/manifest.json';
    const CACHE_KEY = 'dozo_update_manifest';
    const CACHE_DURATION = 3600; // 1 hour
    
    /**
     * Initialize endpoint
     */
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }
    
    /**
     * Register REST API routes
     */
    public static function register_routes() {
        register_rest_route('dozo/v1', '/check-update', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'check_update'],
            'permission_callback' => '__return_true'
        ]);
    }
    
    /**
     * Check for plugin updates
     */
    public static function check_update($request) {
        $current_version = $request->get_param('version');
        $plugin_slug = $request->get_param('slug');
        
        if (!$current_version || !$plugin_slug) {
            return new WP_Error('missing_params', 'Version and slug required', ['status' => 400]);
        }
        
        try {
            $manifest = self::fetch_manifest();
            
            if (!$manifest || !isset($manifest['wordpress'])) {
                return new WP_Error('invalid_manifest', 'Unable to fetch update manifest', ['status' => 500]);
            }
            
            $latest_version = $manifest['version'];
            
            // Compare versions
            if (version_compare($latest_version, $current_version, '>')) {
                return [
                    'update_available' => true,
                    'version' => $latest_version,
                    'package' => $manifest['wordpress']['url'],
                    'sha256' => $manifest['wordpress']['sha256'],
                    'tested' => '6.4',
                    'requires' => '6.0',
                    'requires_php' => '7.4',
                    'download_url' => $manifest['wordpress']['url']
                ];
            }
            
            return [
                'update_available' => false,
                'current_version' => $current_version,
                'latest_version' => $latest_version
            ];
            
        } catch (Exception $e) {
            return new WP_Error('check_failed', $e->getMessage(), ['status' => 500]);
        }
    }
    
    /**
     * Fetch manifest from CDN
     */
    private static function fetch_manifest() {
        // Check cache first
        $cached = get_transient(self::CACHE_KEY);
        if ($cached !== false) {
            return $cached;
        }
        
        // Fetch from CDN
        $response = wp_remote_get(self::MANIFEST_URL, [
            'timeout' => 10,
            'sslverify' => true
        ]);
        
        if (is_wp_error($response)) {
            throw new Exception('Failed to fetch manifest: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $manifest = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON in manifest');
        }
        
        // Cache the result
        set_transient(self::CACHE_KEY, $manifest, self::CACHE_DURATION);
        
        return $manifest;
    }
    
    /**
     * Clear manifest cache
     */
    public static function clear_cache() {
        delete_transient(self::CACHE_KEY);
    }
}

// Initialize
DOZO_Update_Endpoint::init();





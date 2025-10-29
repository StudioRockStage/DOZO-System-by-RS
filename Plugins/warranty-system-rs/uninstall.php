<?php
/**
 * RockStage Warranty System - Uninstall Script
 * 
 * This file is executed when the plugin is uninstalled.
 * It removes all database tables, options, and uploaded files.
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

/**
 * ═══════════════════════════════════════════════════════════════
 * DELETE DATABASE TABLES
 * ═══════════════════════════════════════════════════════════════
 */

$tables = array(
    $wpdb->prefix . 'rs_warranties',
    $wpdb->prefix . 'rs_warranty_files',
    $wpdb->prefix . 'rs_warranty_notes',
    $wpdb->prefix . 'rs_warranty_rma'
);

foreach ($tables as $table) {
    $wpdb->query("DROP TABLE IF EXISTS {$table}");
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DELETE OPTIONS
 * ═══════════════════════════════════════════════════════════════
 */

$options = array(
    // General
    'rs_warranty_email',
    'rs_warranty_email_cc',
    'rs_warranty_activated',
    'rs_warranty_db_version',
    
    // SMTP
    'rs_warranty_smtp_enabled',
    'rs_warranty_smtp_host',
    'rs_warranty_smtp_port',
    'rs_warranty_smtp_username',
    'rs_warranty_smtp_password',
    'rs_warranty_smtp_encryption',
    
    // Categories
    'rs_warranty_categories',
    
    // Templates
    'rs_warranty_templates',
    
    // RMA
    'rs_warranty_rma_enabled',
    'rs_warranty_rma_prefix',
    'rs_warranty_rma_tracking_enabled',
    'rs_warranty_rma_return_address',
    'rs_warranty_rma_statuses',
    
    // Priority
    'rs_warranty_vip_min_orders',
    'rs_warranty_high_value_min',
    'rs_warranty_expiring_percentage',
    'rs_warranty_urgent_keywords',
    
    // WhatsApp
    'rs_warranty_whatsapp_enabled',
    'rs_warranty_whatsapp_number',
    'rs_warranty_whatsapp_message',
    
    // File Limits
    'rs_warranty_max_photos',
    'rs_warranty_max_photo_size',
    'rs_warranty_require_photo',
    'rs_warranty_max_video_size',
    'rs_warranty_max_video_duration',
    'rs_warranty_allow_video',
    
    // Terms
    'rs_warranty_terms'
);

foreach ($options as $option) {
    delete_option($option);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DELETE UPLOADED FILES
 * ═══════════════════════════════════════════════════════════════
 */

$upload_dir = wp_upload_dir();
$warranty_dir = $upload_dir['basedir'] . '/rockstage-warranties';

if (file_exists($warranty_dir)) {
    // Delete all files recursively
    function rs_delete_directory($dir) {
        if (!file_exists($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), array('.', '..'));
        
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            
            if (is_dir($path)) {
                rs_delete_directory($path);
            } else {
                unlink($path);
            }
        }
        
        rmdir($dir);
    }
    
    rs_delete_directory($warranty_dir);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CLEAR SCHEDULED EVENTS
 * ═══════════════════════════════════════════════════════════════
 */

wp_clear_scheduled_hook('rs_warranty_daily_update');

/**
 * ═══════════════════════════════════════════════════════════════
 * LOG UNINSTALL
 * ═══════════════════════════════════════════════════════════════
 */

error_log('RockStage Warranty System has been uninstalled and all data has been removed.');




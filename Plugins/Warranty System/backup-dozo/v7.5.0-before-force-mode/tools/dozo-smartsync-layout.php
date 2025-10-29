<?php
/**
 * DOZO SmartSync Layout Validation
 * DOZO Deep Audit v7.5.0 - Full Self-Healing Engine + SmartSync Layout Validation v2
 * 
 * Validates and enforces proper folder structure for Claude AI designs.
 * Automatically creates missing folders, injects DOZO tags, and organizes files.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.5.0
 * @since 7.5.0
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.5: Official folder structure schema
 */
function dozo_get_folder_schema() {
    return array(
        'Admin Panels' => array(
            'subdirs' => array(
                'panel-dozo-dashboard',
                'panel-field-builder',
                'panel-layout-builder',
                'panel-preset-manager',
                'panel-shortcode-manager',
                'panel-design-settings'
            ),
            'files' => array('README-ADMIN-PANELS.md'),
            'required_files_per_panel' => array('html', 'css', 'js')
        ),
        'Shortcodes' => array(
            'files' => array(
                'warranty-verifier-all-states.html',
                'warranty-verifier-preview.html'
            )
        ),
        'Themes' => array(
            'files' => array(
                'rockstage-dark.css',
                'rockstage-light.css',
                'warranty-dashboard.css'
            )
        ),
        'Scripts' => array(
            'files' => array(
                'dashboard.js',
                'warranty-form.js',
                'panel-layout-builder.js',
                'panel-design-settings.js'
            )
        ),
        'UI Components' => array(
            'subdirs' => array('cards', 'forms', 'modal', 'tables')
        ),
        'Assets' => array(
            'subdirs' => array('icons', 'images', 'logos')
        ),
        'Documentation' => array(
            'files' => array('README-DESIGNS.md')
        )
    );
}

/**
 * DOZO v7.5: SmartSync Layout Validation
 */
function dozo_smartsync_validate_layout() {
    error_log('🔍 DOZO v7.5: SmartSync Layout Validation started');
    
    $base_path = RS_CLAUDE_DESIGN_PATH;
    
    if (!is_dir($base_path)) {
        error_log('⚠️ DOZO SmartSync: Claude AI design path not found: ' . $base_path);
        return array(
            'status' => 'error',
            'message' => 'Claude AI design path not found',
            'actions_taken' => 0
        );
    }
    
    $schema = dozo_get_folder_schema();
    $report = array(
        'timestamp' => current_time('mysql'),
        'version' => RS_DOZO_VERSION,
        'base_path' => $base_path,
        'folders_created' => 0,
        'files_created' => 0,
        'tags_injected' => 0,
        'files_moved' => 0,
        'actions' => array()
    );
    
    // Validate and create folders
    foreach ($schema as $folder => $config) {
        $folder_path = $base_path . $folder . '/';
        
        // Create main folder if missing
        if (!file_exists($folder_path)) {
            wp_mkdir_p($folder_path);
            $report['folders_created']++;
            $report['actions'][] = 'Created folder: ' . $folder;
            error_log('📁 DOZO SmartSync: Created folder - ' . $folder);
        }
        
        // Create subdirectories if specified
        if (isset($config['subdirs'])) {
            foreach ($config['subdirs'] as $subdir) {
                $subdir_path = $folder_path . $subdir . '/';
                if (!file_exists($subdir_path)) {
                    wp_mkdir_p($subdir_path);
                    $report['folders_created']++;
                    $report['actions'][] = 'Created subfolder: ' . $folder . '/' . $subdir;
                    error_log('📁 DOZO SmartSync: Created subfolder - ' . $folder . '/' . $subdir);
                    
                    // Create panel files if it's a panel folder
                    if (strpos($subdir, 'panel-') === 0 && isset($config['required_files_per_panel'])) {
                        foreach ($config['required_files_per_panel'] as $ext) {
                            $file_path = $subdir_path . $subdir . '.' . $ext;
                            if (!file_exists($file_path)) {
                                dozo_create_template_file($file_path, $ext, $subdir);
                                $report['files_created']++;
                                $report['actions'][] = 'Created file: ' . $subdir . '.' . $ext;
                            }
                        }
                    }
                }
            }
        }
        
        // Create required files if specified
        if (isset($config['files'])) {
            foreach ($config['files'] as $file) {
                $file_path = $folder_path . $file;
                if (!file_exists($file_path)) {
                    dozo_create_template_file($file_path, pathinfo($file, PATHINFO_EXTENSION), $file);
                    $report['files_created']++;
                    $report['actions'][] = 'Created file: ' . $folder . '/' . $file;
                    error_log('📄 DOZO SmartSync: Created file - ' . $folder . '/' . $file);
                }
            }
        }
    }
    
    // Inject DOZO tags in existing files
    $tags_injected = dozo_inject_missing_tags($base_path);
    $report['tags_injected'] = $tags_injected;
    
    if ($tags_injected > 0) {
        $report['actions'][] = 'Injected DOZO tags in ' . $tags_injected . ' files';
        error_log('🏷️ DOZO SmartSync: Injected tags in ' . $tags_injected . ' files');
    }
    
    // Save report
    dozo_save_layout_report($report);
    
    $total_actions = $report['folders_created'] + $report['files_created'] + $report['tags_injected'] + $report['files_moved'];
    error_log('✅ DOZO SmartSync: Layout validation complete - ' . $total_actions . ' actions taken');
    
    return $report;
}

/**
 * DOZO v7.5: Create template file
 */
function dozo_create_template_file($filepath, $extension, $name) {
    $content = '';
    
    switch ($extension) {
        case 'html':
            $content = "<!-- @dozo:sync auto -->\n";
            $content .= "<!-- @dozo:panel type=\"" . sanitize_title($name) . "\" -->\n";
            $content .= "<!-- DOZO v7.5: Auto-generated template -->\n\n";
            $content .= "<div class=\"rs-admin-panel\">\n";
            $content .= "    <h2>" . ucwords(str_replace('-', ' ', $name)) . "</h2>\n";
            $content .= "    <p>Panel placeholder - customize this content.</p>\n";
            $content .= "</div>\n";
            break;
            
        case 'css':
            $content = "/* @dozo:sync auto */\n";
            $content .= "/* DOZO v7.5: Auto-generated styles */\n\n";
            $content .= ":root {\n";
            $content .= "    --rs-primary: #FF8C00;\n";
            $content .= "}\n\n";
            $content .= ".rs-admin-panel {\n";
            $content .= "    padding: 20px;\n";
            $content .= "}\n";
            break;
            
        case 'js':
            $content = "// @dozo:sync auto\n";
            $content .= "// @dozo:module " . sanitize_title($name) . "\n";
            $content .= "// DOZO v7.5: Auto-generated script\n\n";
            $content .= "(function($) {\n";
            $content .= "    'use strict';\n";
            $content .= "    console.log('Module loaded: " . $name . "');\n";
            $content .= "})(jQuery);\n";
            break;
            
        case 'md':
            $content = "# " . ucwords(str_replace('-', ' ', basename($name, '.md'))) . "\n\n";
            $content .= "Auto-generated by DOZO v7.5 SmartSync Layout Validation.\n\n";
            $content .= "**Created:** " . current_time('mysql') . "\n";
            break;
            
        default:
            $content = "/* DOZO v7.5: Auto-generated file */\n";
    }
    
    file_put_contents($filepath, $content);
}

/**
 * DOZO v7.5: Inject missing DOZO tags
 */
function dozo_inject_missing_tags($base_path) {
    $injected_count = 0;
    
    $extensions = array('html', 'css', 'js');
    
    foreach ($extensions as $ext) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($base_path, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($files as $file) {
            if ($file->isFile() && $file->getExtension() === $ext) {
                $filepath = $file->getPathname();
                $content = file_get_contents($filepath);
                
                // Check if @dozo:sync tag exists
                if (strpos($content, '@dozo:sync') === false) {
                    $tag = '';
                    switch ($ext) {
                        case 'html':
                            $tag = "<!-- @dozo:sync auto -->\n";
                            break;
                        case 'css':
                            $tag = "/* @dozo:sync auto */\n";
                            break;
                        case 'js':
                            $tag = "// @dozo:sync auto\n";
                            break;
                    }
                    
                    // Inject tag at the beginning
                    $new_content = $tag . $content;
                    file_put_contents($filepath, $new_content);
                    $injected_count++;
                    
                    error_log('🏷️ DOZO SmartSync: Injected tag in ' . basename($filepath));
                }
            }
        }
    }
    
    return $injected_count;
}

/**
 * DOZO v7.5: Save layout report
 */
function dozo_save_layout_report($report) {
    $upload_dir = wp_upload_dir();
    $log_dir = $upload_dir['basedir'] . '/dozo-logs/';
    
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
    }
    
    $log_file = $log_dir . 'dozo-folder-sync.log';
    
    // Append to log file
    $log_entry = date('Y-m-d H:i:s') . ' - SmartSync Layout Validation' . PHP_EOL;
    $log_entry .= '  Folders created: ' . $report['folders_created'] . PHP_EOL;
    $log_entry .= '  Files created: ' . $report['files_created'] . PHP_EOL;
    $log_entry .= '  Tags injected: ' . $report['tags_injected'] . PHP_EOL;
    $log_entry .= '  Actions: ' . implode(', ', $report['actions']) . PHP_EOL;
    $log_entry .= '  Status: ✅ Complete' . PHP_EOL . PHP_EOL;
    
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    
    // Also save JSON report
    file_put_contents(
        $log_dir . 'dozo-smartsync-layout.json',
        wp_json_encode($report, JSON_PRETTY_PRINT)
    );
}

/**
 * DOZO v7.5: AJAX endpoint for SmartSync validation
 */
add_action('wp_ajax_dozo_smartsync_validate', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $report = dozo_smartsync_validate_layout();
    
    wp_send_json_success($report);
});

/**
 * DOZO v7.5: Run SmartSync on init (once per day when WP_DEBUG enabled)
 */
add_action('init', function() {
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        $last_run = get_option('dozo_smartsync_last_run', 0);
        $time_since_last = time() - $last_run;
        
        // Run once per day (86400 seconds)
        if ($time_since_last > 86400) {
            dozo_smartsync_validate_layout();
            update_option('dozo_smartsync_last_run', time());
            error_log('✅ DOZO SmartSync: Daily layout validation completed');
        }
    }
}, 60);

error_log('✅ DOZO SmartSync Layout Validation v7.5 loaded');


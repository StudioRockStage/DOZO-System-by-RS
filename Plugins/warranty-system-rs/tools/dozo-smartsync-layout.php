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
 * DOZO v7.5.1: SmartSync Layout Validation (with Force Mode)
 */
function dozo_smartsync_validate_layout($force_mode = false) {
    error_log('🔍 DOZO v7.5.1: SmartSync Layout Validation started' . ($force_mode ? ' (FORCE MODE)' : ''));
    
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
        'force_mode' => $force_mode,
        'folders_created' => 0,
        'files_created' => 0,
        'tags_injected' => 0,
        'files_moved' => 0,
        'files_classified' => 0,
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
    
    // DOZO v7.5.1: Force Mode - Organize loose files from Objetos/
    if ($force_mode) {
        $organize_result = dozo_organize_loose_files($base_path);
        $report['files_moved'] = $organize_result['moved'];
        $report['files_classified'] = $organize_result['classified'];
        
        foreach ($organize_result['actions'] as $action) {
            $report['actions'][] = $action;
        }
        
        error_log('📦 DOZO SmartSync (Force Mode): Organized ' . $organize_result['classified'] . ' files, moved ' . $organize_result['moved']);
    }
    
    // Generate DOZO-INDEX.json
    dozo_generate_index($base_path);
    
    // Save report
    dozo_save_layout_report($report);
    
    $total_actions = $report['folders_created'] + $report['files_created'] + $report['tags_injected'] + $report['files_moved'];
    error_log('✅ DOZO SmartSync: Layout validation complete - ' . $total_actions . ' actions taken');
    
    return $report;
}

/**
 * DOZO v7.5.1: Organize loose files from Objetos folder (Force Mode)
 */
function dozo_organize_loose_files($base_path) {
    $objetos_path = dirname($base_path) . '/Objetos/';
    
    $result = array(
        'scanned' => 0,
        'classified' => 0,
        'moved' => 0,
        'actions' => array()
    );
    
    if (!is_dir($objetos_path)) {
        return $result;
    }
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($objetos_path, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    
    foreach ($files as $file) {
        if (!$file->isFile()) {
            continue;
        }
        
        $result['scanned']++;
        $filepath = $file->getPathname();
        $filename = $file->getFilename();
        $extension = $file->getExtension();
        
        // Classify file
        $destination_folder = dozo_classify_file($filename, $extension);
        
        if ($destination_folder) {
            $result['classified']++;
            
            // Determine destination path
            $dest_path = dozo_get_organized_destination($base_path, $destination_folder, $filename);
            
            if ($dest_path) {
                // Create destination directory if needed
                $dest_dir = dirname($dest_path);
                if (!file_exists($dest_dir)) {
                    wp_mkdir_p($dest_dir);
                }
                
                // Move file
                if (rename($filepath, $dest_path)) {
                    $result['moved']++;
                    $result['actions'][] = 'Moved: ' . $filename . ' → ' . $destination_folder;
                    error_log('📦 DOZO Force Mode: Moved ' . $filename . ' to ' . $destination_folder);
                    
                    // Inject DOZO tags if it's a design file
                    if (in_array($extension, array('html', 'css', 'js'))) {
                        dozo_inject_tag_in_file($dest_path, $extension);
                    }
                }
            }
        }
    }
    
    return $result;
}

/**
 * DOZO v7.5.1: Classify file based on name and type
 */
function dozo_classify_file($filename, $extension) {
    $name_lower = strtolower($filename);
    
    // Classification rules
    if (strpos($name_lower, 'panel-') === 0) {
        return 'Admin Panels/' . pathinfo($filename, PATHINFO_FILENAME);
    }
    
    if (strpos($name_lower, 'warranty-') === 0 && $extension === 'html') {
        return 'Shortcodes';
    }
    
    if ((strpos($name_lower, 'rockstage-') === 0 || strpos($name_lower, 'theme') !== false) && $extension === 'css') {
        return 'Themes';
    }
    
    if (in_array($name_lower, array('dashboard.js', 'form.js', 'warranty-form.js', 'panel-layout-builder.js', 'panel-design-settings.js'))) {
        return 'Scripts';
    }
    
    if (strpos($name_lower, 'card') !== false || strpos($name_lower, 'modal') !== false || strpos($name_lower, 'form') !== false) {
        // Determine UI component type
        if (strpos($name_lower, 'card') !== false) {
            return 'UI Components/cards';
        } elseif (strpos($name_lower, 'modal') !== false) {
            return 'UI Components/modal';
        } elseif (strpos($name_lower, 'form') !== false) {
            return 'UI Components/forms';
        }
    }
    
    if (in_array($extension, array('png', 'jpg', 'jpeg', 'svg', 'gif'))) {
        if (strpos($name_lower, 'icon') !== false) {
            return 'Assets/icons';
        } elseif (strpos($name_lower, 'logo') !== false) {
            return 'Assets/logos';
        } else {
            return 'Assets/images';
        }
    }
    
    if ($extension === 'md') {
        return 'Documentation';
    }
    
    return null; // Unable to classify
}

/**
 * DOZO v7.5.1: Get organized destination path
 */
function dozo_get_organized_destination($base_path, $destination_folder, $filename) {
    return $base_path . $destination_folder . '/' . $filename;
}

/**
 * DOZO v7.5.1: Inject DOZO tag in single file
 */
function dozo_inject_tag_in_file($filepath, $extension) {
    $content = file_get_contents($filepath);
    
    if (strpos($content, '@dozo:sync') !== false) {
        return false; // Already has tag
    }
    
    $tag = '';
    switch ($extension) {
        case 'html':
            $tag = "<!-- @dozo:sync auto -->\n";
            break;
        case 'css':
            $tag = "/* @dozo:sync auto */\n";
            break;
        case 'js':
            $tag = "// @dozo:sync auto\n";
            $tag .= "// @dozo:validate-integrity\n";
            break;
    }
    
    if ($tag) {
        file_put_contents($filepath, $tag . $content);
        return true;
    }
    
    return false;
}

/**
 * DOZO v7.5.1: Generate DOZO-INDEX.json
 */
function dozo_generate_index($base_path) {
    $index = array(
        'version' => RS_DOZO_VERSION,
        'generated_at' => current_time('mysql'),
        'base_path' => $base_path,
        'structure' => array()
    );
    
    $schema = dozo_get_folder_schema();
    
    foreach ($schema as $folder => $config) {
        $folder_path = $base_path . $folder . '/';
        
        if (!is_dir($folder_path)) {
            continue;
        }
        
        $folder_info = array(
            'exists' => true,
            'files' => array(),
            'subdirs' => array()
        );
        
        // List files
        $files = scandir($folder_path);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $file_path = $folder_path . $file;
            if (is_file($file_path)) {
                $folder_info['files'][] = $file;
            } elseif (is_dir($file_path)) {
                $folder_info['subdirs'][] = $file;
            }
        }
        
        $index['structure'][$folder] = $folder_info;
    }
    
    // Save index
    $index_file = $base_path . 'DOZO-INDEX.json';
    file_put_contents($index_file, wp_json_encode($index, JSON_PRETTY_PRINT));
    
    error_log('📋 DOZO SmartSync: Generated DOZO-INDEX.json');
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
 * DOZO v7.5.1: AJAX endpoint for SmartSync validation (with Force Mode support)
 */
add_action('wp_ajax_dozo_smartsync_validate', function() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $force_mode = isset($_POST['force_mode']) && $_POST['force_mode'] === 'true';
    
    $report = dozo_smartsync_validate_layout($force_mode);
    
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

error_log('✅ DOZO SmartSync Layout Validation v7.5.1 (Force Mode) loaded');


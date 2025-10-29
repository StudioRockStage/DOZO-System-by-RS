<?php
/**
 * Claude Style Manager
 * DOZO Deep Audit v5.4 - Claude Style Injection & AutoSync
 * 
 * Ensures Claude-designed styles are properly loaded, synced, and verified
 * for the warranty form shortcode. Now includes automatic backup and
 * forced style injection.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v5.4
 * @since 5.3.0
 * @updated 5.4.0
 */

defined('ABSPATH') || exit;

class RS_Claude_Style_Manager {
    private static $instance = null;
    
    /**
     * External Claude files path (if available)
     */
    private $external_claude_path;
    
    /**
     * Backup directory for original assets
     */
    private $backup_dir;
    
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
        // Set external Claude path (Documents folder)
        $this->external_claude_path = dirname(ABSPATH) . '/Claude AI/DISEÑOS Warranty System by RockStage/Shortcodes/';
        
        // Set backup directory
        $upload_dir = wp_upload_dir();
        $this->backup_dir = $upload_dir['basedir'] . '/rockstage-backups/original-assets/';
        
        // DOZO v5.4: Auto-sync and backup on init
        add_action('init', array($this, 'auto_backup_original_assets'), 5);
        
        // Add hooks
        add_action('wp_enqueue_scripts', array($this, 'force_enqueue_claude_styles'), 999); // DOZO v5.4: Increased priority
        add_action('wp_footer', array($this, 'add_style_verification_script'), 999);
        add_filter('rs_warranty_form_classes', array($this, 'add_claude_marker_class'));
        
        // AJAX endpoint for style verification
        add_action('wp_ajax_nopriv_rs_verify_claude_styles', array($this, 'ajax_verify_styles'));
        add_action('wp_ajax_rs_verify_claude_styles', array($this, 'ajax_verify_styles'));
    }
    
    /**
     * DOZO v5.4: Auto-backup original assets before any modifications
     */
    public function auto_backup_original_assets() {
        // Only run once per day to avoid performance impact
        $last_backup = get_transient('rs_claude_last_backup');
        if ($last_backup) {
            return;
        }
        
        // Create backup directory
        if (!file_exists($this->backup_dir)) {
            wp_mkdir_p($this->backup_dir);
            
            // Protect with .htaccess
            $htaccess = $this->backup_dir . '.htaccess';
            if (!file_exists($htaccess)) {
                file_put_contents($htaccess, "Deny from all\n");
            }
        }
        
        // Backup public CSS and JS (Claude designs from v4.4)
        $files_to_backup = array(
            'css/public-style.css',
            'js/public-script.js'
        );
        
        foreach ($files_to_backup as $file) {
            $source = RS_WARRANTY_ASSETS_DIR . $file;
            $dest = $this->backup_dir . basename($file) . '.bak.' . time();
            
            if (file_exists($source)) {
                copy($source, $dest);
                error_log('DOZO v5.4: Backup created - ' . basename($file));
            }
        }
        
        // Set transient for 24 hours
        set_transient('rs_claude_last_backup', time(), DAY_IN_SECONDS);
    }
    
    /**
     * DOZO v5.4: Force enqueue Claude styles (replaces old method)
     */
    public function force_enqueue_claude_styles() {
        // Only load on pages with warranty shortcode
        if (!$this->is_warranty_page()) {
            return;
        }
        
        // DOZO v5.4: Dequeue any potentially conflicting styles
        wp_dequeue_style('rs-warranty-style');
        wp_dequeue_style('rs-old-warranty-style');
        wp_deregister_style('rs-warranty-style');
        
        // DOZO v5.4: Force enqueue Claude design (priority 999)
        wp_enqueue_style(
            'rs-warranty-public-claude',
            RS_WARRANTY_ASSETS_URL . 'css/public-style.css',
            array(),
            RS_WARRANTY_VERSION . '-claude-v5.4',
            'all'
        );
        
        // DOZO v5.4: Dequeue any potentially conflicting scripts
        wp_dequeue_script('rs-warranty-script');
        wp_dequeue_script('rs-old-warranty-script');
        wp_deregister_script('rs-warranty-script');
        
        // DOZO v5.4: Force enqueue Claude script (priority 999)
        wp_enqueue_script(
            'rs-warranty-public-claude',
            RS_WARRANTY_ASSETS_URL . 'js/public-script.js',
            array('jquery'),
            RS_WARRANTY_VERSION . '-claude-v5.4',
            true
        );
        
        // Add inline style marker for DOZO verification
        wp_add_inline_style('rs-warranty-public-claude', '/* DOZO v5.4: Claude Styles Active - Force Injection */');
        
        // Log for debugging
        error_log('DOZO v5.4: Claude styles FORCE-INJECTED for warranty form (priority 999)');
    }
    
    /**
     * Add verification script to footer
     */
    public function add_style_verification_script() {
        if (!$this->is_warranty_page()) {
            return;
        }
        ?>
        <script>
        // DOZO v5.4: Claude Style Verification & Force Injection Check
        (function() {
            console.group('🎨 DOZO v5.4: Claude Style AutoSync Verification');
            
            const verifyClaudeStyles = function() {
                // Check if Claude CSS is loaded
                const cssLoaded = [...document.styleSheets].some(sheet => {
                    try {
                        return sheet.href && sheet.href.includes('public-style.css');
                    } catch(e) {
                        return false;
                    }
                });
                
                // Check if Claude JS is loaded
                const jsLoaded = [...document.scripts].some(script => {
                    try {
                        return script.src && script.src.includes('public-script.js');
                    } catch(e) {
                        return false;
                    }
                });
                
                // Check if warranty form exists
                const formExists = document.querySelector('.rs-warranty-form, [class*="warranty"]') !== null;
                
                // Check for Claude design markers
                const hasClaudeMarkers = document.querySelector('[data-claude-version], .rs-claude-design') !== null;
                
                // Check for force injection marker
                const forceInjected = [...document.styleSheets].some(sheet => {
                    try {
                        if (!sheet.ownerNode) return false;
                        const inlineStyles = sheet.ownerNode.textContent || '';
                        return inlineStyles.includes('DOZO v5.4: Claude Styles Active - Force Injection');
                    } catch(e) {
                        return false;
                    }
                });
                
                // Results
                console.log('📋 AutoSync Verification Results:');
                console.log('  CSS Loaded:', cssLoaded ? '✅' : '❌');
                console.log('  JS Loaded:', jsLoaded ? '✅' : '❌');
                console.log('  Form Present:', formExists ? '✅' : '⚠️ (no shortcode on page)');
                console.log('  Claude Markers:', hasClaudeMarkers ? '✅' : '⚠️ (optional)');
                console.log('  Force Injected:', forceInjected ? '✅ (priority 999)' : '⚠️');
                
                if (cssLoaded && jsLoaded) {
                    console.log('✅ Claude styles & scripts successfully force-injected');
                } else {
                    console.warn('⚠️ Claude assets may not be fully applied');
                    console.log('💡 Tip: Verify shortcode [rs_warranty_form] is present on page');
                }
                
                // Store verification result
                window.rsClaudeStylesVerified = cssLoaded && jsLoaded;
                window.rsClaudeForceInjected = forceInjected;
                
                return window.rsClaudeStylesVerified;
            };
            
            // Run verification after DOM load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', verifyClaudeStyles);
            } else {
                verifyClaudeStyles();
            }
            
            console.groupEnd();
            
            // Expose global verification function
            window.rsVerifyClaudeStyles = verifyClaudeStyles;
        })();
        </script>
        <?php
    }
    
    /**
     * Add Claude marker class to form
     */
    public function add_claude_marker_class($classes) {
        $classes[] = 'rs-claude-design';
        return $classes;
    }
    
    /**
     * Check if current page has warranty shortcode
     */
    private function is_warranty_page() {
        global $post;
        
        if (!is_a($post, 'WP_Post')) {
            return false;
        }
        
        // Check if shortcode is present
        return has_shortcode($post->post_content, 'rs_warranty_form') ||
               has_shortcode($post->post_content, 'rs_warranty_verifier');
    }
    
    /**
     * AJAX: Verify Claude styles
     */
    public function ajax_verify_styles() {
        $verification = array(
            'plugin_version' => RS_WARRANTY_VERSION,
            'dozo_version' => RS_DOZO_VERSION,
            'public_css_exists' => file_exists(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css'),
            'public_js_exists' => file_exists(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js'),
            'external_claude_path' => $this->external_claude_path,
            'external_files_exist' => $this->check_external_claude_files(),
            'timestamp' => current_time('mysql')
        );
        
        wp_send_json_success($verification);
    }
    
    /**
     * Check if external Claude files exist
     */
    private function check_external_claude_files() {
        if (!file_exists($this->external_claude_path)) {
            return array('available' => false, 'reason' => 'Path does not exist');
        }
        
        $files = array(
            'warranty-verifier-all-states.html' => file_exists($this->external_claude_path . 'warranty-verifier-all-states.html'),
            'warranty-verifier-preview.html' => file_exists($this->external_claude_path . 'warranty-verifier-preview.html')
        );
        
        return array(
            'available' => true,
            'path' => $this->external_claude_path,
            'files' => $files,
            'all_present' => !in_array(false, $files, true)
        );
    }
    
    /**
     * Get Claude style integrity status
     */
    public function get_integrity_status() {
        return array(
            'public_css' => array(
                'path' => RS_WARRANTY_ASSETS_DIR . 'css/public-style.css',
                'exists' => file_exists(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css'),
                'size' => file_exists(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css') ? 
                    filesize(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css') : 0,
                'modified' => file_exists(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css') ? 
                    filemtime(RS_WARRANTY_ASSETS_DIR . 'css/public-style.css') : 0
            ),
            'public_js' => array(
                'path' => RS_WARRANTY_ASSETS_DIR . 'js/public-script.js',
                'exists' => file_exists(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js'),
                'size' => file_exists(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js') ? 
                    filesize(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js') : 0,
                'modified' => file_exists(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js') ? 
                    filemtime(RS_WARRANTY_ASSETS_DIR . 'js/public-script.js') : 0
            ),
            'external_claude' => $this->check_external_claude_files(),
            'verification_endpoint' => admin_url('admin-ajax.php?action=rs_verify_claude_styles')
        );
    }
}

// Initialize
RS_Claude_Style_Manager::get_instance();


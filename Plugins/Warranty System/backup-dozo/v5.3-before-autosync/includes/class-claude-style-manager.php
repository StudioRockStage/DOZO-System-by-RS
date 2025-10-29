<?php
/**
 * Claude Style Manager
 * DOZO Deep Audit v5.3 - Claude Style Sync & Verification
 * 
 * Ensures Claude-designed styles are properly loaded and verified
 * for the warranty form shortcode.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v5.3
 * @since 5.3.0
 */

defined('ABSPATH') || exit;

class RS_Claude_Style_Manager {
    private static $instance = null;
    
    /**
     * External Claude files path (if available)
     */
    private $external_claude_path;
    
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
        
        // Add hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_claude_styles'), 100);
        add_action('wp_footer', array($this, 'add_style_verification_script'), 999);
        add_filter('rs_warranty_form_classes', array($this, 'add_claude_marker_class'));
        
        // AJAX endpoint for style verification
        add_action('wp_ajax_nopriv_rs_verify_claude_styles', array($this, 'ajax_verify_styles'));
        add_action('wp_ajax_rs_verify_claude_styles', array($this, 'ajax_verify_styles'));
    }
    
    /**
     * Enqueue Claude styles with high priority
     */
    public function enqueue_claude_styles() {
        // Only load on pages with warranty shortcode
        if (!$this->is_warranty_page()) {
            return;
        }
        
        // Enqueue main public styles (already contain Claude design from v4.4)
        wp_enqueue_style(
            'rs-warranty-public-claude',
            RS_WARRANTY_ASSETS_URL . 'css/public-style.css',
            array(),
            RS_WARRANTY_VERSION . '-claude',
            'all'
        );
        
        // Enqueue public script
        wp_enqueue_script(
            'rs-warranty-public-claude',
            RS_WARRANTY_ASSETS_URL . 'js/public-script.js',
            array('jquery'),
            RS_WARRANTY_VERSION . '-claude',
            true
        );
        
        // Add inline style marker for DOZO verification
        wp_add_inline_style('rs-warranty-public-claude', '/* DOZO v5.3: Claude Styles Active */');
        
        // Log for debugging
        error_log('DOZO v5.3: Claude styles enqueued for warranty form');
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
        // DOZO v5.3: Claude Style Verification
        (function() {
            console.group('🎨 DOZO v5.3: Claude Style Verification');
            
            const verifyClaudeStyles = function() {
                // Check if Claude CSS is loaded
                const cssLoaded = [...document.styleSheets].some(sheet => {
                    try {
                        return sheet.href && sheet.href.includes('public-style.css');
                    } catch(e) {
                        return false;
                    }
                });
                
                // Check if warranty form exists
                const formExists = document.querySelector('.rs-warranty-form, [class*="warranty"]') !== null;
                
                // Check for Claude design markers
                const hasClaudeMarkers = document.querySelector('[data-claude-version], .rs-claude-design') !== null;
                
                // Results
                console.log('📋 Verification Results:');
                console.log('  CSS Loaded:', cssLoaded ? '✅' : '❌');
                console.log('  Form Present:', formExists ? '✅' : '❌');
                console.log('  Claude Markers:', hasClaudeMarkers ? '✅' : '⚠️ (optional)');
                
                if (cssLoaded && formExists) {
                    console.log('✅ Claude styles successfully applied');
                } else {
                    console.warn('⚠️ Claude styles may not be fully applied');
                    console.log('💡 Tip: Check if shortcode [rs_warranty_form] is present');
                }
                
                // Store verification result
                window.rsClaudeStylesVerified = cssLoaded && formExists;
                
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


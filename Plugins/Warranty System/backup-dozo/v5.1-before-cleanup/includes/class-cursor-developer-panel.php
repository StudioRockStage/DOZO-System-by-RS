<?php
/**
 * Cursor AI Developer Panel
 * DOZO Deep Audit v5.1 - Dual AI Integration
 * 
 * Provides integration with Cursor AI (local or remote endpoint)
 * for code generation, testing, and fix application.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v5.1
 * @since 5.1.0
 */

defined('ABSPATH') || exit;

class RS_Cursor_Developer_Panel {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
        
        // AJAX endpoints
        add_action('wp_ajax_rs_cursor_query', array($this, 'handle_query'));
        add_action('wp_ajax_rs_cursor_test_connection', array($this, 'test_connection'));
        add_action('wp_ajax_rs_cursor_apply_fix', array($this, 'apply_fix'));
        add_action('wp_ajax_rs_cursor_save_endpoint', array($this, 'save_endpoint_config'));
    }

    /**
     * Add Cursor AI submenu to RockStage Warranty
     */
    public function add_admin_menu() {
        add_submenu_page(
            'rockstage-warranty',
            'Cursor AI Developer',
            '💻 Cursor AI',
            'manage_options',
            'rs-cursor-developer',
            array($this, 'render_developer_panel')
        );
    }

    /**
     * Enqueue CSS and JS for Cursor panel
     */
    public function enqueue_assets($hook) {
        if ('rockstage-warranty_page_rs-cursor-developer' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'rs-cursor-developer',
            RS_WARRANTY_ASSETS_URL . 'css/cursor-developer.css',
            array(),
            RS_WARRANTY_VERSION
        );

        wp_enqueue_script(
            'rs-cursor-developer',
            RS_WARRANTY_ASSETS_URL . 'js/cursor-developer.js',
            array('jquery'),
            RS_WARRANTY_VERSION,
            true
        );

        // Get endpoint configuration
        $endpoint_url = get_option('rs_cursor_endpoint_url', 'http://localhost:5173/api/cursor');
        $access_token = get_option('rs_cursor_access_token', '');
        $has_config = !empty($endpoint_url);

        wp_localize_script('rs-cursor-developer', 'rsCursorDev', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rs_cursor_dev_nonce'),
            'hasConfig' => $has_config,
            'endpointUrl' => $endpoint_url,
            'siteUrl' => site_url(),
            'pluginVersion' => RS_WARRANTY_VERSION,
            'dozoVersion' => defined('RS_DOZO_VERSION') ? RS_DOZO_VERSION : '5.1.0',
        ));
    }

    /**
     * Render the Cursor AI Developer Panel
     */
    public function render_developer_panel() {
        if (!current_user_can('manage_options')) {
            wp_die(__('No tienes permisos suficientes para acceder a esta página.'));
        }

        $endpoint_url = get_option('rs_cursor_endpoint_url', 'http://localhost:5173/api/cursor');
        $access_token = get_option('rs_cursor_access_token', '');
        $has_config = !empty($endpoint_url);
        ?>
        <div class="wrap rs-cursor-developer">
            <div class="rs-cursor-header">
                <div class="rs-cursor-header-content">
                    <div class="rs-cursor-logo">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div>
                        <h1>💻 Cursor AI Developer</h1>
                        <p class="rs-cursor-subtitle">Desarrollo asistido por IA con endpoint local o remoto</p>
                    </div>
                </div>
                <div class="rs-cursor-version">
                    <span class="rs-version-badge">DOZO v5.1</span>
                    <span class="rs-status-badge <?php echo $has_config ? 'connected' : 'disconnected'; ?>">
                        <?php echo $has_config ? '🟢 Configurado' : '🔴 Sin configurar'; ?>
                    </span>
                </div>
            </div>

            <div class="rs-cursor-layout">
                <!-- Sidebar -->
                <div class="rs-cursor-sidebar">
                    <!-- Endpoint Configuration -->
                    <div class="rs-cursor-card">
                        <h3>⚙️ Configuración de Endpoint</h3>
                        <form id="cursorEndpointForm">
                            <div class="rs-form-group">
                                <label for="cursorEndpointUrl">Endpoint URL</label>
                                <input 
                                    type="text" 
                                    id="cursorEndpointUrl" 
                                    name="endpoint_url"
                                    value="<?php echo esc_attr($endpoint_url); ?>"
                                    placeholder="http://localhost:5173/api/cursor"
                                    class="rs-input"
                                />
                                <span class="rs-help-text">URL del servidor Cursor AI (local o remoto)</span>
                            </div>

                            <div class="rs-form-group">
                                <label for="cursorAccessToken">Token de Acceso (Opcional)</label>
                                <input 
                                    type="password" 
                                    id="cursorAccessToken" 
                                    name="access_token"
                                    value="<?php echo esc_attr(str_repeat('•', min(strlen($access_token), 20))); ?>"
                                    placeholder="dev-xxxxxx"
                                    class="rs-input"
                                />
                                <span class="rs-help-text">Token para autenticación (si es requerido)</span>
                            </div>

                            <div class="rs-button-group">
                                <button type="submit" class="rs-btn rs-btn-primary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                        <polyline points="17 21 17 13 7 13 7 21"/>
                                        <polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    Guardar
                                </button>
                                <button type="button" id="testCursorConnection" class="rs-btn rs-btn-secondary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                    </svg>
                                    Probar
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Quick Actions -->
                    <div class="rs-cursor-card">
                        <h3>⚡ Acciones Rápidas</h3>
                        <div class="rs-quick-actions">
                            <button class="rs-quick-action" data-action="audit">
                                <span class="rs-action-icon">🔍</span>
                                <span class="rs-action-text">Auditar Código</span>
                            </button>
                            <button class="rs-quick-action" data-action="optimize">
                                <span class="rs-action-icon">⚡</span>
                                <span class="rs-action-text">Optimizar JS</span>
                            </button>
                            <button class="rs-quick-action" data-action="security">
                                <span class="rs-action-icon">🔒</span>
                                <span class="rs-action-text">Check Seguridad</span>
                            </button>
                            <button class="rs-quick-action" data-action="debug">
                                <span class="rs-action-icon">🐛</span>
                                <span class="rs-action-text">Debug Error</span>
                            </button>
                            <button class="rs-quick-action" data-action="refactor">
                                <span class="rs-action-icon">🔧</span>
                                <span class="rs-action-text">Refactorizar</span>
                            </button>
                            <button class="rs-quick-action" data-action="test">
                                <span class="rs-action-icon">🧪</span>
                                <span class="rs-action-text">Generar Tests</span>
                            </button>
                        </div>
                    </div>

                    <!-- System Context -->
                    <div class="rs-cursor-card">
                        <h3>📊 Contexto del Sistema</h3>
                        <div class="rs-context-info">
                            <div class="rs-context-item">
                                <span class="rs-context-label">Plugin:</span>
                                <span class="rs-context-value">RockStage Warranty v<?php echo RS_WARRANTY_VERSION; ?></span>
                            </div>
                            <div class="rs-context-item">
                                <span class="rs-context-label">DOZO:</span>
                                <span class="rs-context-value">v<?php echo defined('RS_DOZO_VERSION') ? RS_DOZO_VERSION : '5.1.0'; ?></span>
                            </div>
                            <div class="rs-context-item">
                                <span class="rs-context-label">WordPress:</span>
                                <span class="rs-context-value"><?php echo get_bloginfo('version'); ?></span>
                            </div>
                            <div class="rs-context-item">
                                <span class="rs-context-label">PHP:</span>
                                <span class="rs-context-value"><?php echo phpversion(); ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Console Area -->
                <div class="rs-cursor-main">
                    <div class="rs-cursor-console">
                        <div class="rs-console-tabs">
                            <button class="rs-console-tab active" data-tab="prompt">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="4 17 10 11 4 5"/>
                                    <line x1="12" y1="19" x2="20" y2="19"/>
                                </svg>
                                Prompt
                            </button>
                            <button class="rs-console-tab" data-tab="preview">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Preview
                            </button>
                            <button class="rs-console-tab" data-tab="response">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                Response
                            </button>
                            <button class="rs-console-tab" data-tab="logs">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                                Logs
                            </button>
                        </div>

                        <div class="rs-console-content">
                            <!-- Prompt Tab -->
                            <div class="rs-console-pane active" data-pane="prompt">
                                <textarea 
                                    id="cursorPrompt" 
                                    placeholder="Escribe tu consulta o solicitud para Cursor AI...&#10;&#10;Ejemplos:&#10;- Audita el archivo admin-categories.js&#10;- Optimiza la función saveCategory()&#10;- Genera tests para class-warranty-core.php"
                                    class="rs-console-textarea"
                                ></textarea>
                                <div class="rs-console-actions">
                                    <button id="executeCursorQuery" class="rs-btn rs-btn-primary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="5 3 19 12 5 21 5 3"/>
                                        </svg>
                                        Ejecutar Query
                                    </button>
                                    <button id="clearCursorPrompt" class="rs-btn rs-btn-secondary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Limpiar
                                    </button>
                                </div>
                            </div>

                            <!-- Preview Tab -->
                            <div class="rs-console-pane" data-pane="preview">
                                <div id="cursorPreview" class="rs-console-output">
                                    <div class="rs-console-empty">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        <p>Vista previa del código generado</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Response Tab -->
                            <div class="rs-console-pane" data-pane="response">
                                <div id="cursorResponse" class="rs-console-output">
                                    <div class="rs-console-empty">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <p>Las respuestas de Cursor AI aparecerán aquí</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Logs Tab -->
                            <div class="rs-console-pane" data-pane="logs">
                                <div id="cursorLogs" class="rs-console-output rs-console-logs">
                                    <div class="rs-log-entry">
                                        <span class="rs-log-time"><?php echo current_time('H:i:s'); ?></span>
                                        <span class="rs-log-level info">INFO</span>
                                        <span class="rs-log-message">Panel Cursor AI inicializado</span>
                                    </div>
                                    <div class="rs-log-entry">
                                        <span class="rs-log-time"><?php echo current_time('H:i:s'); ?></span>
                                        <span class="rs-log-level info">INFO</span>
                                        <span class="rs-log-message">Endpoint: <?php echo esc_html($endpoint_url); ?></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Handle Cursor AI query
     */
    public function handle_query() {
        check_ajax_referer('rs_cursor_dev_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }

        $query = isset($_POST['query']) ? sanitize_textarea_field($_POST['query']) : '';
        
        if (empty($query)) {
            wp_send_json_error(array('message' => 'Query vacío'));
        }

        $endpoint_url = get_option('rs_cursor_endpoint_url', '');
        $access_token = get_option('rs_cursor_access_token', '');

        if (empty($endpoint_url)) {
            wp_send_json_error(array('message' => 'Endpoint no configurado'));
        }

        // Prepare request
        $request_body = array(
            'query' => $query,
            'context' => $this->get_system_context(),
            'timestamp' => current_time('mysql'),
            'user' => wp_get_current_user()->user_login,
        );

        $headers = array(
            'Content-Type' => 'application/json',
        );

        if (!empty($access_token)) {
            $headers['Authorization'] = 'Bearer ' . $access_token;
        }

        // Make request to Cursor endpoint
        $response = wp_remote_post($endpoint_url, array(
            'headers' => $headers,
            'body' => wp_json_encode($request_body),
            'timeout' => 30,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Error de conexión: ' . $response->get_error_message()
            ));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        if ($response_code !== 200) {
            wp_send_json_error(array(
                'message' => 'Error del servidor: HTTP ' . $response_code,
                'details' => $response_body
            ));
        }

        $data = json_decode($response_body, true);

        wp_send_json_success(array(
            'response' => $data,
            'timestamp' => current_time('mysql')
        ));
    }

    /**
     * Test connection to Cursor endpoint
     */
    public function test_connection() {
        check_ajax_referer('rs_cursor_dev_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }

        $endpoint_url = get_option('rs_cursor_endpoint_url', '');
        
        if (empty($endpoint_url)) {
            wp_send_json_error(array('message' => 'Endpoint no configurado'));
        }

        $access_token = get_option('rs_cursor_access_token', '');

        $headers = array('Content-Type' => 'application/json');
        if (!empty($access_token)) {
            $headers['Authorization'] = 'Bearer ' . $access_token;
        }

        $response = wp_remote_post($endpoint_url, array(
            'headers' => $headers,
            'body' => wp_json_encode(array(
                'query' => 'ping',
                'test' => true
            )),
            'timeout' => 10,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error(array(
                'message' => 'Error de conexión: ' . $response->get_error_message()
            ));
        }

        $response_code = wp_remote_retrieve_response_code($response);

        if ($response_code === 200) {
            wp_send_json_success(array(
                'message' => 'Conexión exitosa con Cursor AI',
                'endpoint' => $endpoint_url
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Conexión fallida: HTTP ' . $response_code
            ));
        }
    }

    /**
     * Apply generated fix to plugin
     */
    public function apply_fix() {
        check_ajax_referer('rs_cursor_dev_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }

        $code = isset($_POST['code']) ? $_POST['code'] : '';
        $file_path = isset($_POST['file_path']) ? sanitize_text_field($_POST['file_path']) : '';

        if (empty($code) || empty($file_path)) {
            wp_send_json_error(array('message' => 'Datos incompletos'));
        }

        // Security: only allow files within plugin directory
        $plugin_dir = RS_WARRANTY_PLUGIN_DIR;
        $full_path = realpath($plugin_dir . $file_path);

        if (strpos($full_path, $plugin_dir) !== 0) {
            wp_send_json_error(array('message' => 'Ruta no permitida'));
        }

        // Create backup before applying
        $backup_dir = $plugin_dir . 'backup-dozo/cursor-fixes/';
        wp_mkdir_p($backup_dir);

        $backup_file = $backup_dir . basename($file_path) . '.bak.' . time();
        if (file_exists($full_path)) {
            copy($full_path, $backup_file);
        }

        // Apply fix (save as draft for review)
        $draft_file = $plugin_dir . 'backup-dozo/cursor-fixes/' . basename($file_path) . '.draft.' . time();
        file_put_contents($draft_file, $code);

        wp_send_json_success(array(
            'message' => 'Fix guardado como draft para revisión',
            'draft_path' => $draft_file,
            'backup_path' => $backup_file
        ));
    }

    /**
     * Save endpoint configuration
     */
    public function save_endpoint_config() {
        check_ajax_referer('rs_cursor_dev_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permisos insuficientes'));
        }

        $endpoint_url = isset($_POST['endpoint_url']) ? esc_url_raw($_POST['endpoint_url']) : '';
        $access_token = isset($_POST['access_token']) ? sanitize_text_field($_POST['access_token']) : '';

        // Don't save if token is masked
        if (strpos($access_token, '•') === false) {
            update_option('rs_cursor_access_token', $access_token);
        }

        update_option('rs_cursor_endpoint_url', $endpoint_url);

        wp_send_json_success(array(
            'message' => 'Configuración guardada exitosamente'
        ));
    }

    /**
     * Get system context for Cursor AI
     */
    private function get_system_context() {
        return array(
            'plugin' => array(
                'name' => 'RockStage Warranty System',
                'version' => RS_WARRANTY_VERSION,
                'dozo_version' => defined('RS_DOZO_VERSION') ? RS_DOZO_VERSION : '5.1.0',
            ),
            'environment' => array(
                'wordpress' => get_bloginfo('version'),
                'php' => phpversion(),
                'woocommerce' => class_exists('WooCommerce'),
            ),
            'structure' => array(
                'includes' => ['class-warranty-core.php', 'class-warranty-admin.php', 'class-warranty-database.php'],
                'assets' => ['css' => ['admin-style.css', 'public-style.css'], 'js' => ['admin-categories.js', 'public-script.js', 'dozo-diagnostic.js']],
                'templates' => ['admin/settings.php', 'public/warranty-form.php'],
            ),
        );
    }
}

// Initialize
RS_Cursor_Developer_Panel::get_instance();


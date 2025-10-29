<?php
/**
 * RockStage Warranty - Claude AI Developer Panel
 * Panel de desarrollador con chat directo a Claude AI
 * 
 * @package RockStage_Warranty_System
 * @version 3.0.0
 */

defined('ABSPATH') || exit;

class RS_Claude_Developer_Panel {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('wp_ajax_rs_claude_chat', array($this, 'handle_chat'));
        add_action('wp_ajax_rs_claude_apply_code', array($this, 'apply_code'));
        add_action('wp_ajax_rs_claude_save_api_key', array($this, 'save_api_key'));
    }
    
    /**
     * Agregar menú de desarrollador
     */
    public function add_admin_menu() {
        add_submenu_page(
            'rockstage-warranty',
            'Desarrollador AI',
            '<span class="dashicons dashicons-admin-generic" style="font-size: 17px;"></span> Desarrollador AI',
            'manage_options',
            'rs-claude-developer',
            array($this, 'render_developer_panel')
        );
    }
    
    /**
     * Cargar assets
     */
    public function enqueue_assets($hook) {
        if ('rockstage-warranty_page_rs-claude-developer' !== $hook) {
            return;
        }
        
        wp_enqueue_style(
            'rs-claude-dev-css',
            plugins_url('assets/css/claude-developer.css', dirname(__FILE__)),
            array(),
            '3.0.0'
        );
        
        wp_enqueue_script(
            'rs-claude-dev-js',
            plugins_url('assets/js/claude-developer.js', dirname(__FILE__)),
            array('jquery'),
            '3.0.0',
            true
        );
        
        wp_localize_script('rs-claude-dev-js', 'rsClaudeDev', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rs_claude_dev_nonce'),
            'hasApiKey' => !empty(get_option('rs_claude_api_key')),
            'siteUrl' => get_site_url()
        ));
    }
    
    /**
     * Renderizar panel de desarrollador
     */
    public function render_developer_panel() {
        $api_key = get_option('rs_claude_api_key', '');
        $has_key = !empty($api_key);
        ?>
        <div class="wrap rs-claude-developer-wrap">
            <h1>
                <span class="dashicons dashicons-admin-generic"></span>
                Panel de Desarrollador AI
            </h1>
            
            <div class="rs-claude-container">
                
                <!-- Sidebar -->
                <div class="rs-claude-sidebar">
                    
                    <!-- API Key Configuration -->
                    <div class="rs-claude-card">
                        <h3>
                            <span class="dashicons dashicons-admin-network"></span>
                            Configuración API
                        </h3>
                        
                        <?php if (!$has_key): ?>
                            <div class="rs-notice rs-notice-warning">
                                <span class="dashicons dashicons-warning"></span>
                                <p>Necesitas configurar tu API Key de Anthropic para usar esta función.</p>
                            </div>
                        <?php else: ?>
                            <div class="rs-notice rs-notice-success">
                                <span class="dashicons dashicons-yes-alt"></span>
                                <p>API Key configurada correctamente</p>
                            </div>
                        <?php endif; ?>
                        
                        <form id="rs-api-key-form">
                            <div class="rs-form-group">
                                <label for="claude_api_key">
                                    <strong>Anthropic API Key</strong>
                                </label>
                                <input 
                                    type="password" 
                                    id="claude_api_key" 
                                    name="claude_api_key" 
                                    class="regular-text"
                                    value="<?php echo esc_attr($api_key ? str_repeat('•', 20) : ''); ?>"
                                    placeholder="sk-ant-api03-..."
                                >
                                <p class="description">
                                    Obtén tu API Key en: 
                                    <a href="https://console.anthropic.com/" target="_blank">
                                        console.anthropic.com
                                    </a>
                                </p>
                            </div>
                            
                            <button type="submit" class="button button-primary">
                                <span class="dashicons dashicons-saved"></span>
                                Guardar API Key
                            </button>
                            
                            <?php if ($has_key): ?>
                            <button type="button" class="button" id="test-api-key">
                                <span class="dashicons dashicons-yes"></span>
                                Probar Conexión
                            </button>
                            <?php endif; ?>
                        </form>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="rs-claude-card">
                        <h3>
                            <span class="dashicons dashicons-lightbulb"></span>
                            Acciones Rápidas
                        </h3>
                        
                        <div class="rs-quick-actions">
                            <button class="rs-quick-btn" data-prompt="Crea un nuevo diseño moderno en escala de grises para el verificador de garantía. Usa CSS variables para fácil personalización.">
                                <span class="dashicons dashicons-art"></span>
                                Nuevo Diseño
                            </button>
                            
                            <button class="rs-quick-btn" data-prompt="Modifica el formulario actual para que tenga un estilo más minimalista con más espaciado y tipografía grande.">
                                <span class="dashicons dashicons-edit"></span>
                                Modificar Estilo
                            </button>
                            
                            <button class="rs-quick-btn" data-prompt="Agrega una nueva funcionalidad: un chatbot de soporte en el formulario que responda preguntas sobre garantías.">
                                <span class="dashicons dashicons-format-chat"></span>
                                Agregar Chatbot
                            </button>
                            
                            <button class="rs-quick-btn" data-prompt="Crea un shortcode nuevo que muestre un contador de garantías activas con animación.">
                                <span class="dashicons dashicons-dashboard"></span>
                                Nuevo Shortcode
                            </button>
                            
                            <button class="rs-quick-btn" data-prompt="Optimiza el código JavaScript del formulario para mejor performance y menos peso.">
                                <span class="dashicons dashicons-performance"></span>
                                Optimizar JS
                            </button>
                            
                            <button class="rs-quick-btn" data-prompt="Dame 5 ideas de mejoras UX para el formulario de garantía con ejemplos de código.">
                                <span class="dashicons dashicons-star-filled"></span>
                                Ideas UX
                            </button>
                        </div>
                    </div>
                    
                    <!-- Context Info -->
                    <div class="rs-claude-card">
                        <h3>
                            <span class="dashicons dashicons-info"></span>
                            Información del Plugin
                        </h3>
                        <div class="rs-context-info">
                            <p><strong>Shortcodes Disponibles:</strong></p>
                            <ul>
                                <li><code>[rockstage_warranty_form]</code></li>
                                <li><code>[rockstage_warranty_verifier]</code></li>
                            </ul>
                            
                            <p><strong>Archivos Principales:</strong></p>
                            <ul>
                                <li>public-style.css</li>
                                <li>public-script.js</li>
                                <li>warranty-form.php</li>
                            </ul>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Main Chat Area -->
                <div class="rs-claude-main">
                    
                    <div class="rs-claude-chat-container">
                        
                        <!-- Chat Header -->
                        <div class="rs-chat-header">
                            <div class="rs-chat-header-info">
                                <h2>
                                    <span class="rs-claude-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17 8C17 5.24 14.76 3 12 3S7 5.24 7 8s2.24 5 5 5 5-2.24 5-5zm-5 7c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
                                        </svg>
                                    </span>
                                    Claude AI - Asistente de Desarrollo
                                </h2>
                                <p class="rs-chat-status">
                                    <?php if ($has_key): ?>
                                        <span class="rs-status-online"></span> Conectado
                                    <?php else: ?>
                                        <span class="rs-status-offline"></span> Configura tu API Key
                                    <?php endif; ?>
                                </p>
                            </div>
                            
                            <div class="rs-chat-actions">
                                <button id="rs-clear-chat" class="button" title="Limpiar conversación">
                                    <span class="dashicons dashicons-trash"></span>
                                </button>
                                <button id="rs-export-chat" class="button" title="Exportar conversación">
                                    <span class="dashicons dashicons-download"></span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Chat Messages -->
                        <div class="rs-chat-messages" id="rs-chat-messages">
                            
                            <!-- Welcome Message -->
                            <div class="rs-message rs-message-assistant">
                                <div class="rs-message-avatar">
                                    <span class="dashicons dashicons-admin-generic"></span>
                                </div>
                                <div class="rs-message-content">
                                    <div class="rs-message-header">
                                        <strong>Claude AI</strong>
                                        <span class="rs-message-time">Ahora</span>
                                    </div>
                                    <div class="rs-message-text">
                                        <p>👋 ¡Hola! Soy Claude, tu asistente de desarrollo AI.</p>
                                        <p>Puedo ayudarte a:</p>
                                        <ul>
                                            <li>🎨 Crear nuevos diseños para tus shortcodes</li>
                                            <li>⚡ Generar código CSS, JavaScript y PHP</li>
                                            <li>🔧 Modificar funcionalidades existentes</li>
                                            <li>💡 Sugerir mejoras de UX y performance</li>
                                            <li>🐛 Debugear y optimizar código</li>
                                        </ul>
                                        <p><strong>¿En qué puedo ayudarte hoy?</strong></p>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        
                        <!-- Chat Input -->
                        <div class="rs-chat-input-container">
                            <form id="rs-chat-form">
                                <div class="rs-chat-input-wrapper">
                                    <textarea 
                                        id="rs-chat-input" 
                                        name="message" 
                                        placeholder="Escribe tu solicitud... Ej: 'Crea un nuevo diseño minimalista para el verificador'" 
                                        rows="3"
                                        <?php echo !$has_key ? 'disabled' : ''; ?>
                                    ></textarea>
                                    
                                    <div class="rs-chat-input-actions">
                                        <div class="rs-input-hints">
                                            <span class="rs-hint">
                                                <span class="dashicons dashicons-info"></span>
                                                Presiona Enter para nueva línea, Ctrl+Enter para enviar
                                            </span>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            class="button button-primary button-large"
                                            id="rs-send-btn"
                                            <?php echo !$has_key ? 'disabled' : ''; ?>
                                        >
                                            <span class="rs-send-text">
                                                <span class="dashicons dashicons-controls-play"></span>
                                                Enviar
                                            </span>
                                            <span class="rs-loading-text" style="display:none;">
                                                <span class="spinner is-active"></span>
                                                Claude está pensando...
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                    </div>
                    
                </div>
                
            </div>
            
        </div>
        <?php
    }
    
    /**
     * Manejar chat con Claude
     */
    public function handle_chat() {
        check_ajax_referer('rs_claude_dev_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permisos insuficientes');
        }
        
        $message = sanitize_textarea_field($_POST['message']);
        $conversation_history = isset($_POST['history']) ? json_decode(stripslashes($_POST['history']), true) : array();
        
        // Obtener API Key
        $api_key = get_option('rs_claude_api_key');
        
        if (empty($api_key)) {
            wp_send_json_error('API Key no configurada');
        }
        
        // Contexto del sistema
        $system_context = $this->get_system_context();
        
        // Preparar mensajes para Claude
        $messages = array();
        
        // Agregar historial
        foreach ($conversation_history as $msg) {
            $messages[] = array(
                'role' => $msg['role'],
                'content' => $msg['content']
            );
        }
        
        // Agregar mensaje nuevo
        $messages[] = array(
            'role' => 'user',
            'content' => $message
        );
        
        // Llamar a Claude API
        $response = wp_remote_post('https://api.anthropic.com/v1/messages', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => $api_key,
                'anthropic-version' => '2023-06-01'
            ),
            'body' => json_encode(array(
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 4096,
                'system' => $system_context,
                'messages' => $messages
            )),
            'timeout' => 60
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Error de conexión: ' . $response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['content'][0]['text'])) {
            wp_send_json_success(array(
                'response' => $body['content'][0]['text'],
                'usage' => $body['usage']
            ));
        } else {
            wp_send_json_error('Error en respuesta de Claude: ' . print_r($body, true));
        }
    }
    
    /**
     * Obtener contexto del sistema para Claude
     */
    private function get_system_context() {
        $plugin_path = plugin_dir_path(dirname(__FILE__));
        
        return "Eres un asistente de desarrollo experto en WordPress, PHP, JavaScript, CSS y HTML.

Estás ayudando a desarrollar el plugin 'RockStage Warranty System' que gestiona garantías de productos WooCommerce.

ESTRUCTURA ACTUAL DEL PLUGIN:
- Shortcode principal: [rockstage_warranty_form] (formulario de 4 pasos)
- Archivos CSS: public-style.css
- Archivos JS: public-script.js
- Templates PHP: warranty-form.php

CLASES CSS ACTUALES:
- .rs-warranty-form-container (contenedor principal)
- .rs-form-card (tarjeta del formulario)
- .rs-step-content (contenido de cada paso)
- .rs-form-input, .rs-form-select, .rs-form-textarea (campos)
- .rs-btn (botones)

CUANDO GENERES CÓDIGO:
1. Usa las clases existentes del plugin cuando sea posible
2. Proporciona código completo y funcional
3. Incluye comentarios explicativos
4. Marca claramente las secciones de código con ```php, ```css, ```javascript
5. Si generas código largo, divídelo en archivos separados
6. Incluye instrucciones de instalación paso a paso
7. Menciona qué archivos modificar y dónde
8. Usa variables CSS para personalización fácil

TONO:
- Profesional pero amigable
- Explica de forma clara y concisa
- Da ejemplos prácticos
- Sugiere mejores prácticas

El desarrollador puede pedirte:
- Nuevos diseños
- Modificar estilos
- Agregar funcionalidades
- Optimizar código
- Crear nuevos shortcodes
- Debugear problemas

Responde SIEMPRE en español y con código listo para copiar y pegar.";
    }
    
    /**
     * Aplicar código generado
     */
    public function apply_code() {
        check_ajax_referer('rs_claude_dev_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permisos insuficientes');
        }
        
        $code = stripslashes($_POST['code']);
        $file_type = sanitize_text_field($_POST['file_type']); // css, js, php
        $action = sanitize_text_field($_POST['action_type']); // create, replace, append
        
        // Aquí implementarías la lógica para aplicar el código
        // Por seguridad, podrías guardarlo como "draft" primero
        
        $draft_id = uniqid('draft_');
        update_option('rs_code_draft_' . $draft_id, array(
            'code' => $code,
            'type' => $file_type,
            'action' => $action,
            'created' => current_time('mysql')
        ));
        
        wp_send_json_success(array(
            'draft_id' => $draft_id,
            'preview_url' => add_query_arg('rs_preview_draft', $draft_id, home_url())
        ));
    }
    
    /**
     * Guardar API Key
     */
    public function save_api_key() {
        check_ajax_referer('rs_claude_dev_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permisos insuficientes');
        }
        
        $api_key = sanitize_text_field($_POST['api_key']);
        
        if (empty($api_key)) {
            wp_send_json_error('API Key vacía');
        }
        
        // Validar formato básico
        if (!preg_match('/^sk-ant-api03-/', $api_key)) {
            wp_send_json_error('Formato de API Key inválido');
        }
        
        update_option('rs_claude_api_key', $api_key);
        
        wp_send_json_success('API Key guardada correctamente');
    }
    
}

// Inicializar
RS_Claude_Developer_Panel::get_instance();

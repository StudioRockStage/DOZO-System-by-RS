/**
 * RockStage Warranty - Claude Developer Panel JS
 * Manejo del chat y funcionalidades del panel
 */

(function($) {
    'use strict';
    
    const ClaudeDeveloper = {
        conversationHistory: [],
        isProcessing: false,
        
        init() {
            this.setupEventListeners();
            this.loadConversationHistory();
        },
        
        setupEventListeners() {
            // Guardar API Key
            $('#rs-api-key-form').on('submit', (e) => {
                e.preventDefault();
                this.saveApiKey();
            });
            
            // Probar API Key
            $('#test-api-key').on('click', () => {
                this.testApiKey();
            });
            
            // Enviar mensaje
            $('#rs-chat-form').on('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
            
            // Ctrl+Enter para enviar
            $('#rs-chat-input').on('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Botones de acción rápida
            $('.rs-quick-btn').on('click', function() {
                const prompt = $(this).data('prompt');
                $('#rs-chat-input').val(prompt);
                $('#rs-chat-input').focus();
            });
            
            // Limpiar chat
            $('#rs-clear-chat').on('click', () => {
                this.clearChat();
            });
            
            // Exportar chat
            $('#rs-export-chat').on('click', () => {
                this.exportChat();
            });
            
            // Scroll automático
            this.setupAutoScroll();
        },
        
        /**
         * Guardar API Key
         */
        saveApiKey() {
            const apiKey = $('#claude_api_key').val();
            
            if (!apiKey || apiKey === '••••••••••••••••••••') {
                this.showNotice('Por favor ingresa una API Key válida', 'error');
                return;
            }
            
            $.ajax({
                url: rsClaudeDev.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_claude_save_api_key',
                    nonce: rsClaudeDev.nonce,
                    api_key: apiKey
                },
                success: (response) => {
                    if (response.success) {
                        this.showNotice('API Key guardada correctamente', 'success');
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        this.showNotice(response.data, 'error');
                    }
                },
                error: () => {
                    this.showNotice('Error al guardar API Key', 'error');
                }
            });
        },
        
        /**
         * Probar API Key
         */
        testApiKey() {
            const $btn = $('#test-api-key');
            $btn.prop('disabled', true);
            $btn.html('<span class="spinner is-active"></span> Probando...');
            
            this.sendTestMessage('Hola Claude, esto es una prueba de conexión. Responde solo con "Conexión exitosa ✅"');
        },
        
        sendTestMessage(message) {
            $.ajax({
                url: rsClaudeDev.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_claude_chat',
                    nonce: rsClaudeDev.nonce,
                    message: message,
                    history: JSON.stringify([])
                },
                success: (response) => {
                    const $btn = $('#test-api-key');
                    $btn.prop('disabled', false);
                    $btn.html('<span class="dashicons dashicons-yes"></span> Probar Conexión');
                    
                    if (response.success) {
                        this.showNotice('✅ Conexión exitosa con Claude AI', 'success');
                    } else {
                        this.showNotice('❌ Error: ' + response.data, 'error');
                    }
                },
                error: () => {
                    const $btn = $('#test-api-key');
                    $btn.prop('disabled', false);
                    $btn.html('<span class="dashicons dashicons-yes"></span> Probar Conexión');
                    this.showNotice('Error de conexión', 'error');
                }
            });
        },
        
        /**
         * Enviar mensaje a Claude
         */
        sendMessage() {
            if (this.isProcessing) return;
            
            const message = $('#rs-chat-input').val().trim();
            
            if (!message) {
                this.showNotice('Escribe un mensaje primero', 'warning');
                return;
            }
            
            this.isProcessing = true;
            
            // Agregar mensaje del usuario al chat
            this.addMessage(message, 'user');
            
            // Limpiar input
            $('#rs-chat-input').val('');
            
            // Mostrar estado de carga
            this.setLoadingState(true);
            
            // Enviar a Claude
            $.ajax({
                url: rsClaudeDev.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_claude_chat',
                    nonce: rsClaudeDev.nonce,
                    message: message,
                    history: JSON.stringify(this.conversationHistory)
                },
                success: (response) => {
                    if (response.success) {
                        // Agregar respuesta de Claude
                        this.addMessage(response.data.response, 'assistant');
                        
                        // Actualizar historial
                        this.conversationHistory.push({ role: 'user', content: message });
                        this.conversationHistory.push({ role: 'assistant', content: response.data.response });
                        
                        // Guardar en localStorage
                        this.saveConversationHistory();
                        
                        // Mostrar uso de tokens si está disponible
                        if (response.data.usage) {
                            console.log('Tokens usados:', response.data.usage);
                        }
                    } else {
                        this.showNotice('Error: ' + response.data, 'error');
                    }
                    
                    this.setLoadingState(false);
                    this.isProcessing = false;
                },
                error: (xhr) => {
                    this.showNotice('Error de conexión con Claude', 'error');
                    console.error('AJAX Error:', xhr);
                    this.setLoadingState(false);
                    this.isProcessing = false;
                }
            });
        },
        
        /**
         * Agregar mensaje al chat
         */
        addMessage(text, role) {
            const $messages = $('#rs-chat-messages');
            const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            
            const avatar = role === 'user' 
                ? '<span class="dashicons dashicons-admin-users"></span>'
                : '<span class="dashicons dashicons-admin-generic"></span>';
            
            const name = role === 'user' ? 'Tú' : 'Claude AI';
            
            // Procesar texto (convertir markdown básico)
            let processedText = this.processMarkdown(text);
            
            // Detectar código y agregar botones de acción
            const hasCode = text.includes('```');
            
            const messageHtml = `
                <div class="rs-message rs-message-${role}">
                    <div class="rs-message-avatar">${avatar}</div>
                    <div class="rs-message-content">
                        <div class="rs-message-header">
                            <strong>${name}</strong>
                            <span class="rs-message-time">${time}</span>
                        </div>
                        <div class="rs-message-text">
                            ${processedText}
                            ${hasCode ? this.getCodeActions() : ''}
                        </div>
                    </div>
                </div>
            `;
            
            $messages.append(messageHtml);
            
            // Scroll al final
            this.scrollToBottom();
        },
        
        /**
         * Procesar Markdown básico
         */
        processMarkdown(text) {
            // Convertir bloques de código
            text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'code';
                return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
            });
            
            // Convertir código inline
            text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Convertir negritas
            text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Convertir itálicas
            text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            // Convertir listas
            text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            
            // Convertir párrafos
            const paragraphs = text.split('\n\n');
            text = paragraphs.map(p => {
                if (p.startsWith('<')) return p; // Ya es HTML
                return `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }).join('');
            
            return text;
        },
        
        /**
         * Escapar HTML
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * Obtener botones de acción para código
         */
        getCodeActions() {
            return `
                <div class="rs-code-actions">
                    <button class="rs-code-btn rs-code-btn-primary" onclick="ClaudeDeveloper.copyCode(this)">
                        <span class="dashicons dashicons-clipboard"></span>
                        Copiar Código
                    </button>
                    <button class="rs-code-btn rs-code-btn-secondary" onclick="ClaudeDeveloper.previewCode(this)">
                        <span class="dashicons dashicons-visibility"></span>
                        Vista Previa
                    </button>
                    <button class="rs-code-btn rs-code-btn-secondary" onclick="ClaudeDeveloper.applyCode(this)">
                        <span class="dashicons dashicons-download"></span>
                        Aplicar al Plugin
                    </button>
                </div>
            `;
        },
        
        /**
         * Copiar código
         */
        copyCode(button) {
            const $message = $(button).closest('.rs-message-text');
            const code = $message.find('pre code').text();
            
            if (!code) {
                this.showNotice('No se encontró código para copiar', 'warning');
                return;
            }
            
            navigator.clipboard.writeText(code).then(() => {
                this.showNotice('✅ Código copiado al portapapeles', 'success');
                
                // Cambiar texto del botón temporalmente
                const $btn = $(button);
                const originalHtml = $btn.html();
                $btn.html('<span class="dashicons dashicons-yes"></span> ¡Copiado!');
                
                setTimeout(() => {
                    $btn.html(originalHtml);
                }, 2000);
            });
        },
        
        /**
         * Vista previa de código
         */
        previewCode(button) {
            const $message = $(button).closest('.rs-message-text');
            const code = $message.find('pre code').text();
            
            if (!code) {
                this.showNotice('No se encontró código para previsualizar', 'warning');
                return;
            }
            
            // Abrir modal con preview (puedes implementar esto)
            alert('Función de preview - Por implementar\n\nCódigo:\n' + code.substring(0, 200) + '...');
        },
        
        /**
         * Aplicar código al plugin
         */
        applyCode(button) {
            const $message = $(button).closest('.rs-message-text');
            const code = $message.find('pre code').text();
            
            if (!code) {
                this.showNotice('No se encontró código para aplicar', 'warning');
                return;
            }
            
            if (!confirm('¿Estás seguro de que quieres aplicar este código al plugin?\n\nSe guardará como borrador primero para que puedas revisarlo.')) {
                return;
            }
            
            // Detectar tipo de archivo
            let fileType = 'php';
            if (code.includes('{') && code.includes('color:')) fileType = 'css';
            if (code.includes('function') && code.includes('const')) fileType = 'js';
            
            $.ajax({
                url: rsClaudeDev.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_claude_apply_code',
                    nonce: rsClaudeDev.nonce,
                    code: code,
                    file_type: fileType,
                    action_type: 'create'
                },
                success: (response) => {
                    if (response.success) {
                        this.showNotice('✅ Código guardado como borrador', 'success');
                        
                        // Mostrar opción de previsualizar
                        if (response.data.preview_url) {
                            const preview = confirm('¿Quieres ver una vista previa?');
                            if (preview) {
                                window.open(response.data.preview_url, '_blank');
                            }
                        }
                    } else {
                        this.showNotice('Error al guardar código', 'error');
                    }
                }
            });
        },
        
        /**
         * Estado de carga
         */
        setLoadingState(loading) {
            const $btn = $('#rs-send-btn');
            const $input = $('#rs-chat-input');
            
            if (loading) {
                $btn.find('.rs-send-text').hide();
                $btn.find('.rs-loading-text').show();
                $btn.prop('disabled', true);
                $input.prop('disabled', true);
                
                // Agregar indicador visual en el chat
                $('#rs-chat-messages').append(`
                    <div class="rs-message rs-message-assistant rs-typing-indicator">
                        <div class="rs-message-avatar">
                            <span class="dashicons dashicons-admin-generic"></span>
                        </div>
                        <div class="rs-message-content">
                            <div class="rs-message-text" style="padding: 12px 16px;">
                                <span class="spinner is-active" style="float: none; margin: 0;"></span>
                                Claude está pensando...
                            </div>
                        </div>
                    </div>
                `);
                
                this.scrollToBottom();
            } else {
                $btn.find('.rs-send-text').show();
                $btn.find('.rs-loading-text').hide();
                $btn.prop('disabled', false);
                $input.prop('disabled', false);
                $input.focus();
                
                // Remover indicador
                $('.rs-typing-indicator').remove();
            }
        },
        
        /**
         * Scroll automático
         */
        setupAutoScroll() {
            const observer = new MutationObserver(() => {
                this.scrollToBottom();
            });
            
            const $messages = document.getElementById('rs-chat-messages');
            if ($messages) {
                observer.observe($messages, { childList: true });
            }
        },
        
        scrollToBottom() {
            const $messages = $('#rs-chat-messages');
            $messages.animate({ scrollTop: $messages[0].scrollHeight }, 300);
        },
        
        /**
         * Limpiar chat
         */
        clearChat() {
            if (!confirm('¿Estás seguro de que quieres limpiar toda la conversación?')) {
                return;
            }
            
            this.conversationHistory = [];
            localStorage.removeItem('rs_claude_conversation');
            
            $('#rs-chat-messages').empty();
            
            // Agregar mensaje de bienvenida de nuevo
            this.addMessage(
                '👋 ¡Hola de nuevo! Conversación limpiada. ¿En qué puedo ayudarte?',
                'assistant'
            );
        },
        
        /**
         * Exportar chat
         */
        exportChat() {
            if (this.conversationHistory.length === 0) {
                this.showNotice('No hay conversación para exportar', 'warning');
                return;
            }
            
            const text = this.conversationHistory.map(msg => {
                return `${msg.role.toUpperCase()}:\n${msg.content}\n\n---\n\n`;
            }).join('');
            
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `claude-conversation-${Date.now()}.txt`;
            a.click();
            
            this.showNotice('✅ Conversación exportada', 'success');
        },
        
        /**
         * Guardar historial en localStorage
         */
        saveConversationHistory() {
            localStorage.setItem('rs_claude_conversation', JSON.stringify(this.conversationHistory));
        },
        
        /**
         * Cargar historial desde localStorage
         */
        loadConversationHistory() {
            const saved = localStorage.getItem('rs_claude_conversation');
            if (saved) {
                try {
                    this.conversationHistory = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading conversation history:', e);
                }
            }
        },
        
        /**
         * Mostrar notificación
         */
        showNotice(message, type = 'info') {
            // Crear notificación de WordPress
            const $notice = $(`
                <div class="notice notice-${type} is-dismissible" style="margin: 16px 0;">
                    <p>${message}</p>
                </div>
            `);
            
            $('.rs-claude-developer-wrap > h1').after($notice);
            
            // Auto-cerrar después de 5 segundos
            setTimeout(() => {
                $notice.fadeOut(() => $notice.remove());
            }, 5000);
            
            // Hacer scroll arriba para ver la notificación
            $('html, body').animate({ scrollTop: 0 }, 300);
        }
    };
    
    // Inicializar cuando el documento esté listo
    $(document).ready(() => {
        ClaudeDeveloper.init();
    });
    
    // Exponer globalmente para uso en onclick
    window.ClaudeDeveloper = ClaudeDeveloper;
    
})(jQuery);

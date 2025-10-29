<?php
/**
 * DOZO Visual Feedback Layer
 * DOZO Deep Audit v7.4.1 - Full Self-Healing Engine + Visual Feedback Layer
 * 
 * Provides real-time visual feedback during DOZO operations.
 * Progress bars, status messages, and animated indicators for all maintenance tasks.
 * 
 * @package RockStage_Warranty_System
 * @subpackage DOZO_v7.4.1
 * @since 7.4.1
 */

defined('ABSPATH') || exit;

/**
 * DOZO v7.4.1: Initialize visual feedback system
 */
function dozo_visual_feedback_init() {
    // Enqueue feedback assets on admin pages
    add_action('admin_enqueue_scripts', 'dozo_enqueue_visual_feedback');
    
    // AJAX endpoints for feedback
    add_action('wp_ajax_dozo_get_operation_status', 'dozo_ajax_get_operation_status');
    add_action('wp_ajax_dozo_start_operation', 'dozo_ajax_start_operation');
    
    error_log('✅ DOZO Visual Feedback Layer v7.4.1 initialized');
}

/**
 * DOZO v7.4.1: Enqueue visual feedback assets
 */
function dozo_enqueue_visual_feedback($hook) {
    // Only on warranty pages
    if (strpos($hook, 'warranty') === false && strpos($hook, 'rockstage') === false) {
        return;
    }
    
    // Enqueue inline CSS for feedback
    $css = "
    <style>
    #dozo-feedback-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
    }
    
    #dozo-feedback-modal {
        background: white;
        border-radius: 16px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: dozoFadeIn 0.3s ease;
    }
    
    @keyframes dozoFadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .dozo-feedback-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
    }
    
    .dozo-feedback-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF8C00, #FFA500);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: dozoPulse 2s ease infinite;
    }
    
    @keyframes dozoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .dozo-feedback-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
    }
    
    .dozo-progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 16px;
    }
    
    .dozo-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #FF8C00, #FFA500);
        transition: width 0.5s ease;
        width: 0%;
    }
    
    .dozo-status-message {
        color: #6b7280;
        font-size: 14px;
        text-align: center;
        min-height: 20px;
    }
    
    .dozo-complete-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        border-radius: 50%;
        background: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: dozoCheckmark 0.5s ease;
    }
    
    @keyframes dozoCheckmark {
        from { transform: scale(0); }
        to { transform: scale(1); }
    }
    </style>
    ";
    
    echo $css;
    
    // Enqueue inline JS for feedback
    wp_add_inline_script('jquery', "
    var DOZO_Feedback = {
        overlay: null,
        modal: null,
        progressBar: null,
        statusMessage: null,
        
        init: function() {
            if (jQuery('#dozo-feedback-overlay').length) return;
            
            var html = '<div id=\"dozo-feedback-overlay\">' +
                '<div id=\"dozo-feedback-modal\">' +
                '<div class=\"dozo-feedback-header\">' +
                '<div class=\"dozo-feedback-icon\">🧩</div>' +
                '<h3 class=\"dozo-feedback-title\">DOZO en Operación</h3>' +
                '</div>' +
                '<div class=\"dozo-progress-bar\"><div class=\"dozo-progress-fill\"></div></div>' +
                '<div class=\"dozo-status-message\">Preparando entorno...</div>' +
                '</div>' +
                '</div>';
            
            jQuery('body').append(html);
            
            this.overlay = jQuery('#dozo-feedback-overlay');
            this.modal = jQuery('#dozo-feedback-modal');
            this.progressBar = jQuery('.dozo-progress-fill');
            this.statusMessage = jQuery('.dozo-status-message');
        },
        
        show: function(title, message) {
            this.init();
            jQuery('.dozo-feedback-title').text(title || 'DOZO en Operación');
            this.statusMessage.text(message || 'Preparando entorno...');
            this.progressBar.css('width', '0%');
            this.overlay.css('display', 'flex');
        },
        
        updateProgress: function(percent, message) {
            this.progressBar.css('width', percent + '%');
            if (message) {
                this.statusMessage.text(message);
            }
        },
        
        complete: function(message) {
            this.progressBar.css('width', '100%');
            
            var completeHTML = '<div class=\"dozo-complete-icon\">✅</div>' +
                '<p style=\"text-align: center; color: #10b981; font-weight: 600; margin: 0;\">' +
                (message || 'Operación completada exitosamente') +
                '</p>';
            
            jQuery('#dozo-feedback-modal').html(completeHTML);
            
            setTimeout(function() {
                DOZO_Feedback.hide();
            }, 2000);
        },
        
        error: function(message) {
            this.progressBar.css('width', '100%').css('background', '#ef4444');
            this.statusMessage.html('❌ ' + (message || 'Error en la operación'));
            
            setTimeout(function() {
                DOZO_Feedback.hide();
            }, 3000);
        },
        
        hide: function() {
            this.overlay.fadeOut(300);
        }
    };
    
    // Make globally available
    window.DOZO_Feedback = DOZO_Feedback;
    ");
}

/**
 * DOZO v7.4.1: Get operation status
 */
function dozo_ajax_get_operation_status() {
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    $operation = isset($_POST['operation']) ? sanitize_text_field($_POST['operation']) : '';
    $status = get_transient('dozo_operation_' . $operation);
    
    if ($status) {
        wp_send_json_success($status);
    } else {
        wp_send_json_error(array('message' => 'No operation running'));
    }
}

/**
 * DOZO v7.4.1: Start operation with visual feedback
 */
function dozo_ajax_start_operation() {
    check_ajax_referer('dozo_diagnostic', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
    }
    
    $operation = isset($_POST['operation']) ? sanitize_text_field($_POST['operation']) : '';
    
    // Set initial status
    set_transient('dozo_operation_' . $operation, array(
        'status' => 'running',
        'progress' => 0,
        'message' => 'Iniciando operación...'
    ), 300);
    
    wp_send_json_success(array('operation' => $operation));
}

/**
 * DOZO v7.4.1: Update operation progress
 */
function dozo_update_operation_progress($operation, $progress, $message) {
    set_transient('dozo_operation_' . $operation, array(
        'status' => 'running',
        'progress' => $progress,
        'message' => $message
    ), 300);
    
    error_log('🔄 DOZO Visual Feedback: ' . $operation . ' - ' . $progress . '% - ' . $message);
}

/**
 * DOZO v7.4.1: Complete operation
 */
function dozo_complete_operation($operation, $message = 'Operación completada') {
    set_transient('dozo_operation_' . $operation, array(
        'status' => 'complete',
        'progress' => 100,
        'message' => $message
    ), 300);
    
    error_log('✅ DOZO Visual Feedback: ' . $operation . ' - ' . $message);
}

// Initialize
dozo_visual_feedback_init();


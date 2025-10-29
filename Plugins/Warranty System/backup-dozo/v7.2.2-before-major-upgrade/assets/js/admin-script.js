/**
 * RockStage Warranty System - Admin JavaScript
 * All clickable elements are functional
 */

(function($) {
    'use strict';

    // Initialize
    $(document).ready(function() {
        console.log('✅ RockStage Warranty Admin - Initialized');
        
        // Setup SMTP toggle
        setupSMTPToggle();
        
        // Setup category toggles
        setupCategoryToggles();
    });

    /**
     * Setup SMTP Fields Toggle
     */
    function setupSMTPToggle() {
        const smtpCheckbox = $('input[name="smtp_enabled"]');
        const smtpFields = $('#smtp-fields');
        
        if (smtpCheckbox.length) {
            // Initial state
            toggleSMTPFields();
            
            // On change
            smtpCheckbox.on('change', toggleSMTPFields);
        }
        
        function toggleSMTPFields() {
            if (smtpCheckbox.is(':checked')) {
                smtpFields.slideDown();
            } else {
                smtpFields.slideUp();
            }
        }
    }

    /**
     * Setup Category Toggles
     */
    function setupCategoryToggles() {
        $('.rs-category-toggle').on('change', function() {
            const row = $(this).closest('.rs-category-row');
            if ($(this).is(':checked')) {
                row.addClass('active');
            } else {
                row.removeClass('active');
            }
        });
    }

    /**
     * Show Status Change Modal
     */
    window.rsShowStatusModal = function(warrantyId) {
        const newStatus = prompt('Cambiar estado a (pending/processing/approved/rejected/completed):');
        
        if (!newStatus) return;
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_update_warranty_status',
                nonce: rsWarrantyAdmin.nonce,
                warranty_id: warrantyId,
                status: newStatus
            },
            beforeSend: function() {
                showNotification('Actualizando...', 'info');
            },
            success: function(response) {
                if (response.success) {
                    showNotification('Estado actualizado correctamente', 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(response.data.message || 'Error al actualizar', 'error');
                }
            },
            error: function() {
                showNotification('Error de conexión', 'error');
            }
        });
    };

    /**
     * Send Custom Email
     */
    window.rsSendCustomEmail = function(warrantyId) {
        const subject = prompt('Asunto del email:');
        if (!subject) return;
        
        const message = prompt('Mensaje:');
        if (!message) return;
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_send_warranty_response',
                nonce: rsWarrantyAdmin.nonce,
                warranty_id: warrantyId,
                subject: subject,
                message: message
            },
            beforeSend: function() {
                showNotification('Enviando email...', 'info');
            },
            success: function(response) {
                if (response.success) {
                    showNotification('Email enviado correctamente', 'success');
                } else {
                    showNotification(response.data.message || 'Error al enviar', 'error');
                }
            },
            error: function() {
                showNotification('Error de conexión', 'error');
            }
        });
    };

    /**
     * Notification System
     */
    function showNotification(message, type) {
        // Remove existing
        $('.rs-admin-notification').remove();
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const notification = $('<div class="rs-admin-notification"></div>');
        notification.css({
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '16px 24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            borderLeft: '4px solid ' + (colors[type] || colors.info),
            zIndex: 10000,
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827'
        });
        
        notification.text(message);
        $('body').append(notification);
        
        setTimeout(() => {
            notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, 4000);
    }

    // Expose to global scope
    window.rsShowNotification = showNotification;

})(jQuery);




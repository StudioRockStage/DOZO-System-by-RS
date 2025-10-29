<?php
/**
 * RockStage Warranty Verifier Template (DOZO v3.2)
 * 
 * Flujo inteligente de verificación de garantías:
 * 1. Ingreso de número de pedido
 * 2. Verificación automática con WooCommerce
 * 3. Visualización de productos y estado de garantía
 * 4. Formulario de reclamo (si garantía vigente)
 * 5. Mensaje de éxito/error
 * 
 * @package RockStage_Warranty_System
 * @version 3.2.0
 */

defined('ABSPATH') || exit;

$frontend = RS_Warranty_Frontend::get_instance();
?>

<noscript>
    <div class="rs-alert rs-alert--warning" role="alert" style="margin: 20px 0;">
        <strong>JavaScript Requerido</strong>
        <p>Este formulario requiere JavaScript para funcionar. Por favor, habilítalo o contacta a <strong>garantias@rockstage.com</strong></p>
    </div>
</noscript>

<div class="rs-warranty-verifier" role="main" aria-label="Verificador de garantías">
    
    <!-- ═══════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════ -->
    <div class="rs-verifier-header">
        <div class="rs-icon-wrapper rs-icon-wrapper--primary" aria-hidden="true">
            <i class="rs-icon rs-icon--lg" data-icon="shield-check"></i>
        </div>
        <h1 class="rs-verifier-title"><?php echo esc_html($atts['title'] ?? 'Verificar Garantía'); ?></h1>
        <p class="rs-verifier-subtitle"><?php echo esc_html($atts['subtitle'] ?? 'Ingresa tu número de pedido para verificar el estado de tu garantía'); ?></p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         STEP 1: ORDER NUMBER INPUT
         ═══════════════════════════════════════════════════════════════ -->
    <div id="rs-step-verify" class="rs-verifier-step rs-verifier-step--active">
        <div class="rs-card">
            <div class="rs-card-header">
                <div class="rs-icon-wrapper rs-icon-wrapper--secondary">
                    <i class="rs-icon" data-icon="package"></i>
                </div>
                <div class="rs-card-header-content">
                    <h2 class="rs-card-title">Verificar Pedido</h2>
                    <p class="rs-card-description">Ingresa tu número de pedido de WooCommerce</p>
                </div>
            </div>

            <div class="rs-card-body">
                <form id="rs-verify-form" class="rs-form" novalidate>
                    <?php wp_nonce_field('rs_warranty_nonce', 'rs_warranty_nonce'); ?>
                    
                    <div class="rs-field">
                        <label for="order_number" class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="hash"></i>
                            <span>Número de Pedido</span>
                        </label>
                        <input 
                            type="text" 
                            id="order_number" 
                            name="order_number" 
                            class="rs-field-input" 
                            placeholder="Ejemplo: 12345, #0001, WC-12345"
                            aria-required="true"
                            aria-describedby="order-help"
                            required
                        >
                        <p class="rs-field-description" id="order-help">
                            <i class="rs-icon rs-icon--xs" data-icon="info"></i>
                            Puedes encontrar tu número de pedido en el email de confirmación de compra
                        </p>
                    </div>

                    <div class="rs-action-bar">
                        <button type="submit" class="rs-btn rs-btn--primary rs-btn--lg" id="rs-btn-verify">
                            <i class="rs-icon" data-icon="search"></i>
                            <span>Verificar Garantía</span>
                        </button>
                    </div>
                </form>

                <div id="rs-verify-message" class="rs-message" style="display: none;" role="alert"></div>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         STEP 2: WARRANTY STATUS DISPLAY
         ═══════════════════════════════════════════════════════════════ -->
    <div id="rs-step-status" class="rs-verifier-step" style="display: none;">
        <div class="rs-card">
            <div class="rs-card-header">
                <div class="rs-icon-wrapper rs-icon-wrapper--success">
                    <i class="rs-icon" data-icon="check-circle"></i>
                </div>
                <div class="rs-card-header-content">
                    <h2 class="rs-card-title">Pedido Verificado</h2>
                    <p class="rs-card-description" id="rs-order-info">Pedido #<span id="rs-order-number-display"></span> - <span id="rs-customer-name-display"></span></p>
                </div>
            </div>

            <div class="rs-card-body">
                <h3 class="rs-section-title">Productos con Garantía</h3>
                <div id="rs-products-list" class="rs-product-list"></div>

                <div id="rs-warranty-action" style="margin-top: 24px;"></div>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         STEP 3: CLAIM FORM
         ═══════════════════════════════════════════════════════════════ -->
    <div id="rs-step-claim" class="rs-verifier-step" style="display: none;">
        <div class="rs-card">
            <div class="rs-card-header">
                <div class="rs-icon-wrapper rs-icon-wrapper--warning">
                    <i class="rs-icon" data-icon="file-text"></i>
                </div>
                <div class="rs-card-header-content">
                    <h2 class="rs-card-title">Solicitud de Garantía</h2>
                    <p class="rs-card-description">Describe el problema y adjunta evidencia</p>
                </div>
            </div>

            <div class="rs-card-body">
                <form id="rs-claim-form" class="rs-form" enctype="multipart/form-data" novalidate>
                    <?php wp_nonce_field('rs_warranty_nonce', 'rs_claim_nonce'); ?>
                    <input type="hidden" id="claim_order_id" name="order_id">
                    <input type="hidden" id="claim_product_id" name="product_id">

                    <div class="rs-field">
                        <label for="claim_customer_name" class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="user"></i>
                            <span>Nombre Completo</span>
                            <span class="rs-field-required">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="claim_customer_name" 
                            name="customer_name" 
                            class="rs-field-input"
                            placeholder="Tu nombre completo"
                            aria-required="true"
                            required
                        >
                    </div>

                    <div class="rs-field">
                        <label for="claim_customer_email" class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="mail"></i>
                            <span>Email</span>
                            <span class="rs-field-required">*</span>
                        </label>
                        <input 
                            type="email" 
                            id="claim_customer_email" 
                            name="customer_email" 
                            class="rs-field-input"
                            placeholder="tu@email.com"
                            aria-required="true"
                            required
                        >
                    </div>

                    <div class="rs-field">
                        <label for="claim_customer_phone" class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="phone"></i>
                            <span>Teléfono</span>
                        </label>
                        <input 
                            type="tel" 
                            id="claim_customer_phone" 
                            name="customer_phone" 
                            class="rs-field-input"
                            placeholder="+52 55 1234 5678"
                        >
                    </div>

                    <div class="rs-field">
                        <label for="claim_description" class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="message-square"></i>
                            <span>Descripción del Problema</span>
                            <span class="rs-field-required">*</span>
                        </label>
                        <textarea 
                            id="claim_description" 
                            name="description" 
                            class="rs-field-textarea"
                            rows="6"
                            placeholder="Describe detalladamente el problema o falla del producto..."
                            aria-required="true"
                            required
                        ></textarea>
                        <p class="rs-field-description">
                            <i class="rs-icon rs-icon--xs" data-icon="info"></i>
                            Proporciona todos los detalles posibles para agilizar tu solicitud
                        </p>
                    </div>

                    <div class="rs-field">
                        <label class="rs-field-label">
                            <i class="rs-icon rs-icon--sm" data-icon="image"></i>
                            <span>Fotos y Videos</span>
                        </label>
                        <div class="rs-upload-zone" id="rs-upload-zone">
                            <input 
                                type="file" 
                                id="claim_files" 
                                name="files[]" 
                                multiple 
                                accept="image/*,video/*"
                                class="rs-upload-input"
                                aria-describedby="upload-help"
                            >
                            <div class="rs-upload-content">
                                <i class="rs-icon rs-icon--xl" data-icon="upload-cloud"></i>
                                <p class="rs-upload-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                                <p class="rs-upload-hint">Máximo 5 archivos, 10MB cada uno</p>
                            </div>
                        </div>
                        <div id="rs-upload-preview" class="rs-upload-preview"></div>
                    </div>

                    <div class="rs-action-bar">
                        <button type="button" class="rs-btn rs-btn--secondary" id="rs-btn-back">
                            <i class="rs-icon" data-icon="arrow-left"></i>
                            <span>Volver</span>
                        </button>
                        <button type="submit" class="rs-btn rs-btn--primary rs-btn--lg" id="rs-btn-submit-claim">
                            <i class="rs-icon" data-icon="send"></i>
                            <span>Enviar Solicitud</span>
                        </button>
                    </div>
                </form>

                <div id="rs-claim-message" class="rs-message" style="display: none;" role="alert"></div>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         STEP 4: SUCCESS MESSAGE
         ═══════════════════════════════════════════════════════════════ -->
    <div id="rs-step-success" class="rs-verifier-step" style="display: none;">
        <div class="rs-card rs-card--success">
            <div class="rs-success-icon">
                <i class="rs-icon rs-icon--xxl" data-icon="check-circle"></i>
            </div>
            <h2 class="rs-success-title">¡Solicitud Enviada!</h2>
            <p class="rs-success-message">Hemos recibido tu solicitud de garantía correctamente.</p>
            <div class="rs-success-details">
                <p><strong>Número de Ticket:</strong> <span id="rs-ticket-number"></span></p>
                <p><strong>Email de Confirmación:</strong> Enviado a <span id="rs-confirmation-email"></span></p>
                <p>Te responderemos en un plazo máximo de 24-48 horas hábiles.</p>
            </div>
            <div class="rs-action-bar">
                <button type="button" class="rs-btn rs-btn--primary" onclick="location.reload();">
                    <i class="rs-icon" data-icon="refresh-cw"></i>
                    <span>Nueva Verificación</span>
                </button>
            </div>
        </div>
    </div>

</div>

<!-- ═══════════════════════════════════════════════════════════════
     PRODUCT CARD TEMPLATE (Used by JS)
     ═══════════════════════════════════════════════════════════════ -->
<template id="rs-product-template">
    <div class="rs-product-card" data-product-id="">
        <div class="rs-product-image">
            <img src="" alt="" loading="lazy">
        </div>
        <div class="rs-product-info">
            <h4 class="rs-product-name"></h4>
            <p class="rs-product-warranty-text"></p>
            <div class="rs-warranty-progress">
                <div class="rs-progress-header">
                    <span class="rs-progress-label"></span>
                    <span class="rs-progress-value"></span>
                </div>
                <div class="rs-progress">
                    <div class="rs-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <p class="rs-progress-expiry"></p>
            </div>
            <button type="button" class="rs-btn rs-btn--primary rs-btn--sm rs-btn-claim" data-product-id="" style="display: none;">
                <i class="rs-icon" data-icon="file-text"></i>
                <span>Solicitar Garantía</span>
            </button>
        </div>
    </div>
</template>

<style>
/* ═══════════════════════════════════════════════════════════════
   DOZO v3.2 - Warranty Verifier Specific Styles
   ═══════════════════════════════════════════════════════════════ */

.rs-warranty-verifier {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
}

.rs-verifier-header {
    text-align: center;
    margin-bottom: 40px;
}

.rs-verifier-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--rs-text-primary, #212529);
    margin: 16px 0 8px;
}

.rs-verifier-subtitle {
    font-size: 16px;
    color: var(--rs-text-secondary, #6B7280);
    margin: 0;
}

.rs-verifier-step {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Product List */
.rs-product-list {
    display: grid;
    gap: 20px;
}

.rs-product-card {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: var(--rs-bg-primary, #F8F9FA);
    border: 1px solid var(--rs-border, #E5E7EB);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.rs-product-card:hover {
    box-shadow: var(--rs-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
    border-color: var(--rs-orange, #FF8C00);
}

.rs-product-image {
    flex-shrink: 0;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
}

.rs-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.rs-product-info {
    flex: 1;
    min-width: 0;
}

.rs-product-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--rs-text-primary, #212529);
    margin: 0 0 4px;
}

.rs-product-warranty-text {
    font-size: 14px;
    color: var(--rs-text-secondary, #6B7280);
    margin: 0 0 16px;
}

/* Warranty Progress Bar */
.rs-warranty-progress {
    margin-bottom: 12px;
}

.rs-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.rs-progress-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--rs-text-primary, #212529);
}

.rs-progress-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--rs-orange, #FF8C00);
}

.rs-progress {
    height: 12px;
    background: #E5E7EB;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 4px;
}

.rs-progress-bar {
    height: 100%;
    transition: width 0.6s ease, background-color 0.3s ease;
    border-radius: 6px;
}

.rs-progress-bar.rs-progress--valid {
    background: linear-gradient(90deg, #10B981, #059669);
}

.rs-progress-bar.rs-progress--warning {
    background: linear-gradient(90deg, #F59E0B, #D97706);
}

.rs-progress-bar.rs-progress--expired {
    background: linear-gradient(90deg, #EF4444, #DC2626);
}

.rs-progress-expiry {
    font-size: 12px;
    color: var(--rs-text-secondary, #6B7280);
    margin: 4px 0 0;
}

/* Upload Zone */
.rs-upload-zone {
    position: relative;
    border: 2px dashed var(--rs-border, #E5E7EB);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.rs-upload-zone:hover {
    border-color: var(--rs-orange, #FF8C00);
    background: var(--rs-bg-primary, #F8F9FA);
}

.rs-upload-zone.dragover {
    border-color: var(--rs-orange, #FF8C00);
    background: rgba(255, 140, 0, 0.05);
}

.rs-upload-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.rs-upload-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--rs-text-primary, #212529);
    margin: 12px 0 4px;
}

.rs-upload-hint {
    font-size: 14px;
    color: var(--rs-text-secondary, #6B7280);
    margin: 0;
}

.rs-upload-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 16px;
}

.rs-preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: var(--rs-bg-primary, #F8F9FA);
    border: 1px solid var(--rs-border, #E5E7EB);
}

.rs-preview-item img,
.rs-preview-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.rs-preview-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: rgba(239, 68, 68, 0.9);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.rs-preview-remove:hover {
    background: #DC2626;
    transform: scale(1.1);
}

/* Success Card */
.rs-card--success {
    text-align: center;
    padding: 60px 40px;
}

.rs-success-icon {
    color: #10B981;
    margin-bottom: 24px;
}

.rs-success-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--rs-text-primary, #212529);
    margin: 0 0 12px;
}

.rs-success-message {
    font-size: 16px;
    color: var(--rs-text-secondary, #6B7280);
    margin: 0 0 32px;
}

.rs-success-details {
    background: var(--rs-bg-primary, #F8F9FA);
    border: 1px solid var(--rs-border, #E5E7EB);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    text-align: left;
}

.rs-success-details p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.6;
}

/* Message Alerts */
.rs-message {
    margin-top: 16px;
    padding: 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
}

.rs-message.rs-message--error {
    background: #FEE2E2;
    border: 1px solid #FCA5A5;
    color: #991B1B;
}

.rs-message.rs-message--success {
    background: #D1FAE5;
    border: 1px solid #6EE7B7;
    color: #065F46;
}

/* Responsive */
@media (max-width: 640px) {
    .rs-product-card {
        flex-direction: column;
    }
    
    .rs-product-image {
        width: 100%;
        height: 200px;
    }
    
    .rs-action-bar {
        flex-direction: column;
        gap: 12px;
    }
    
    .rs-btn {
        width: 100%;
    }
}
</style>




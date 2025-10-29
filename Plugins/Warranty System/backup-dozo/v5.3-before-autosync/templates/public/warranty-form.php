<?php
/**
 * Public Warranty Form Template - RockStage Redesign
 * Modern, fluid, dark-mode compatible design
 */

defined('ABSPATH') || exit;

$frontend = RS_Warranty_Frontend::get_instance();
$file_limits = $frontend->get_file_limits_display();
$terms = $frontend->get_terms();
?>

<noscript>
    <div class="rs-noscript-warning">
        <div class="rs-noscript-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
            </svg>
        </div>
        <h2>JavaScript Requerido</h2>
        <p>Este formulario requiere JavaScript para funcionar correctamente. Por favor, habilita JavaScript en tu navegador.</p>
        <p>Si necesitas ayuda, contacta a: <strong>garantias@rockstage.com</strong></p>
    </div>
</noscript>

<div class="rs-warranty-form-container" role="main" aria-label="Formulario de solicitud de garantía">
    
    <!-- Animated Background Elements -->
    <div class="rs-bg-decoration" aria-hidden="true">
        <div class="rs-bg-circle rs-bg-circle-1"></div>
        <div class="rs-bg-circle rs-bg-circle-2"></div>
        <div class="rs-bg-circle rs-bg-circle-3"></div>
    </div>

    <!-- Header con animación de entrada -->
    <div class="rs-form-header">
        <div class="rs-logo-container">
            <div class="rs-logo-badge">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v4"/>
                    <path d="M12 16h.01"/>
                </svg>
            </div>
        </div>
        <h1 class="rs-header-title"><?php echo esc_html($atts['title']); ?></h1>
        <p class="rs-header-subtitle"><?php echo esc_html($atts['subtitle']); ?></p>
    </div>

    <!-- Main Form Card con glassmorphism -->
    <div class="rs-form-card">
        
        <!-- Progress Steps mejorado -->
        <div class="rs-progress-container" role="progressbar" aria-label="Progreso del formulario" aria-valuenow="1" aria-valuemin="1" aria-valuemax="4">
            <div class="rs-progress-track">
                <div class="rs-progress-fill" id="progressLine"></div>
            </div>
            <div class="rs-progress-steps">
                <div class="rs-step active" data-step="1" aria-current="step">
                    <div class="rs-step-circle">
                        <span class="rs-step-number">1</span>
                        <svg class="rs-step-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="rs-step-label">Información</div>
                </div>
                <div class="rs-step" data-step="2">
                    <div class="rs-step-circle">
                        <span class="rs-step-number">2</span>
                        <svg class="rs-step-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="rs-step-label">Producto</div>
                </div>
                <div class="rs-step" data-step="3">
                    <div class="rs-step-circle">
                        <span class="rs-step-number">3</span>
                        <svg class="rs-step-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="rs-step-label">Problema</div>
                </div>
                <div class="rs-step" data-step="4">
                    <div class="rs-step-circle">
                        <span class="rs-step-number">4</span>
                        <svg class="rs-step-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div class="rs-step-label">Confirmar</div>
                </div>
            </div>
        </div>

        <!-- Step 1: Customer Info -->
        <div id="step1" class="rs-step-content active">
            <div class="rs-step-header">
                <h2 class="rs-step-title">Información del Cliente</h2>
                <p class="rs-step-description">Proporciona tus datos para validar tu pedido</p>
            </div>
            
            <div class="rs-form-grid">
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label required" for="customer_name">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Nombre Completo
                    </label>
                    <input type="text" class="rs-form-input" id="customer_name" name="customer_name" placeholder="Ej: Juan Pérez García" aria-required="true" required>
                    <div class="rs-input-focus-line"></div>
                </div>
                
                <div class="rs-form-group">
                    <label class="rs-form-label required" for="customer_email">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Email
                    </label>
                    <input type="email" class="rs-form-input" id="customer_email" name="customer_email" placeholder="correo@ejemplo.com" aria-required="true" required>
                    <div class="rs-input-focus-line"></div>
                </div>
                
                <div class="rs-form-group">
                    <label class="rs-form-label required" for="customer_phone">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Teléfono
                    </label>
                    <input type="tel" class="rs-form-input" id="customer_phone" name="customer_phone" placeholder="+52 55 1234 5678" aria-required="true" required>
                    <div class="rs-input-focus-line"></div>
                </div>
                
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label required" for="order_number">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        Número de Pedido
                    </label>
                    <input type="text" class="rs-form-input" id="order_number" name="order_number" placeholder="Ej: 12345" aria-required="true" aria-describedby="order-help" required>
                    <div class="rs-input-focus-line"></div>
                    <p class="rs-form-help" id="order-help">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Encuentra tu número de pedido en el email de confirmación de compra
                    </p>
                </div>
            </div>
            
            <div class="rs-form-actions">
                <button type="button" class="rs-btn rs-btn-primary" onclick="nextStep(2)">
                    <span>Continuar</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Step 2: Product -->
        <div id="step2" class="rs-step-content">
            <div class="rs-step-header">
                <h2 class="rs-step-title">Selecciona el Producto</h2>
                <p class="rs-step-description">Indica cuál producto presenta el defecto</p>
            </div>
            
            <div class="rs-form-grid">
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label required" for="product_id">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="9"/>
                            <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                        Producto con Defecto
                    </label>
                    <div class="rs-select-wrapper">
                        <select class="rs-form-select" id="product_id" name="product_id" aria-required="true" required>
                            <option value="">Selecciona un producto...</option>
                        </select>
                        <svg class="rs-select-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </div>
                </div>
                
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label" for="purchase_date">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Fecha de Compra
                    </label>
                    <input type="date" class="rs-form-input" id="purchase_date" name="purchase_date" aria-label="Fecha de compra del producto">
                    <div class="rs-input-focus-line"></div>
                </div>
            </div>
            
            <div class="rs-form-actions">
                <button type="button" class="rs-btn rs-btn-secondary" onclick="prevStep(1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Anterior</span>
                </button>
                <button type="button" class="rs-btn rs-btn-primary" onclick="nextStep(3)">
                    <span>Continuar</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Step 3: Problem Description -->
        <div id="step3" class="rs-step-content">
            <div class="rs-step-header">
                <h2 class="rs-step-title">Describe el Problema</h2>
                <p class="rs-step-description">Proporciona detalles y evidencias del defecto</p>
            </div>
            
            <div class="rs-form-grid">
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label required" for="description">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        Descripción del Problema
                    </label>
                    <textarea class="rs-form-textarea" id="description" name="description" rows="5" placeholder="Describe detalladamente qué falla presenta el producto, cuándo comenzó el problema, y cualquier otra información relevante..." aria-required="true" aria-describedby="desc-help" minlength="20" required></textarea>
                    <div class="rs-textarea-counter">
                        <span id="charCount">0</span> / 20 caracteres mínimo
                    </div>
                    <p class="rs-form-help" id="desc-help">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Una descripción detallada nos ayuda a resolver tu caso más rápido
                    </p>
                </div>
                
                <div class="rs-form-group rs-form-group-full">
                    <label class="rs-form-label required">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Fotos y Videos del Defecto
                    </label>
                    <div class="rs-file-upload-area" id="fileUploadArea" role="button" tabindex="0" aria-label="Área de carga de archivos" aria-describedby="file-help">
                        <div class="rs-upload-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                        </div>
                        <div class="rs-upload-text">
                            <p class="rs-upload-title">Arrastra archivos aquí o haz clic para seleccionar</p>
                            <p class="rs-upload-subtitle" id="file-help">
                                Máximo <?php echo absint($file_limits['max_photos']); ?> fotos (<?php echo absint($file_limits['max_photo_size_mb']); ?>MB c/u)
                                <?php if ($file_limits['video_allowed']): ?>
                                    y 1 video (<?php echo absint($file_limits['max_video_size_mb']); ?>MB)
                                <?php endif; ?>
                            </p>
                        </div>
                        <input type="file" id="fileInput" name="fileInput" multiple accept="image/*,video/*" aria-label="Seleccionar archivos" style="display: none;">
                    </div>
                    <div id="fileList" class="rs-file-list" role="list" aria-live="polite"></div>
                </div>
            </div>
            
            <div class="rs-form-actions">
                <button type="button" class="rs-btn rs-btn-secondary" onclick="prevStep(2)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Anterior</span>
                </button>
                <button type="button" class="rs-btn rs-btn-primary" onclick="nextStep(4)">
                    <span>Continuar</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Step 4: Confirm -->
        <div id="step4" class="rs-step-content">
            <div class="rs-step-header">
                <h2 class="rs-step-title">Confirmar y Enviar</h2>
                <p class="rs-step-description">Revisa los términos antes de enviar tu solicitud</p>
            </div>
            
            <div class="rs-terms-container">
                <div class="rs-terms-box" role="region" aria-label="Términos y condiciones de garantía" tabindex="0">
                    <?php echo wp_kses_post($terms); ?>
                </div>
            </div>
            
            <div class="rs-form-group">
                <label class="rs-checkbox-container">
                    <input type="checkbox" id="termsCheckbox" name="termsCheckbox" aria-required="true" aria-describedby="terms-requirement" required>
                    <span class="rs-checkbox-checkmark">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </span>
                    <span class="rs-checkbox-label" id="terms-requirement">
                        He leído y acepto los términos y condiciones de garantía
                    </span>
                </label>
            </div>
            
            <div class="rs-form-actions">
                <button type="button" class="rs-btn rs-btn-secondary" onclick="prevStep(3)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Anterior</span>
                </button>
                <button type="button" class="rs-btn rs-btn-primary rs-btn-submit" onclick="submitForm()">
                    <span class="rs-btn-text">Enviar Solicitud</span>
                    <span class="rs-btn-loader">
                        <svg class="rs-spinner" width="20" height="20" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <svg class="rs-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Success Screen -->
        <div id="successScreen" class="rs-step-content rs-success-screen">
            <div class="rs-success-animation">
                <div class="rs-success-circle">
                    <div class="rs-success-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <h2 class="rs-success-title">¡Solicitud Enviada Exitosamente!</h2>
            <p class="rs-success-message">Tu garantía ha sido registrada en nuestro sistema</p>
            
            <div class="rs-warranty-card">
                <div class="rs-warranty-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <div class="rs-warranty-info">
                    <span class="rs-warranty-label">Número de Garantía</span>
                    <span class="rs-warranty-number warranty-number">GAR-RS-XXXXX</span>
                </div>
            </div>
            
            <div class="rs-success-details">
                <div class="rs-success-detail-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>Recibirás un email de confirmación</span>
                </div>
                <div class="rs-success-detail-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Te contactaremos en 24-48 horas</span>
                </div>
            </div>
            
            <?php if ($frontend->is_whatsapp_enabled()): ?>
            <button type="button" class="rs-btn rs-btn-whatsapp" onclick="openWhatsApp()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Contactar por WhatsApp</span>
            </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- WhatsApp Floating Button -->
    <?php if ($frontend->is_whatsapp_enabled()): ?>
    <button class="rs-whatsapp-float" onclick="openWhatsApp()" aria-label="Contactar por WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span class="rs-whatsapp-pulse"></span>
    </button>
    <?php endif; ?>
</div>

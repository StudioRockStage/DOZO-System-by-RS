/**
 * RockStage Warranty Verifier - JavaScript (DOZO v3.2)
 * 
 * Flujo inteligente de verificación de garantías con WooCommerce:
 * 1. Verificación de pedido
 * 2. Visualización de productos y estado de garantía
 * 3. Formulario de reclamo si garantía vigente
 * 4. Mensaje de éxito
 * 
 * @package RockStage_Warranty_System
 * @version 3.2.0
 */

(function($) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // VARIABLES GLOBALES
    // ═══════════════════════════════════════════════════════════════
    
    let currentOrderData = null;
    let selectedProduct = null;
    let uploadedFiles = [];

    // ═══════════════════════════════════════════════════════════════
    // INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    $(document).ready(function() {
        initVerifyForm();
        initClaimForm();
        initFileUpload();
    });

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: VERIFICACIÓN DE PEDIDO
    // ═══════════════════════════════════════════════════════════════
    
    function initVerifyForm() {
        const $form = $('#rs-verify-form');
        const $btn = $('#rs-btn-verify');
        const $message = $('#rs-verify-message');

        $form.on('submit', function(e) {
            e.preventDefault();

            const orderNumber = $('#order_number').val().trim();

            if (!orderNumber) {
                showMessage($message, 'error', 'Por favor ingresa un número de pedido válido');
                return;
            }

            // Cambiar estado del botón
            $btn.prop('disabled', true).html(
                '<i class="rs-icon" data-icon="loader"></i><span>Verificando...</span>'
            );

            // AJAX: Verificar pedido
            $.ajax({
                url: rsWarranty.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rs_verify_warranty',
                    nonce: rsWarranty.nonce,
                    order_number: orderNumber
                },
                success: function(response) {
                    if (response.success) {
                        currentOrderData = response.data;
                        showWarrantyStatus(response.data);
                        goToStep('status');
                    } else {
                        showMessage($message, 'error', response.data.message || 'Error al verificar el pedido');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error AJAX:', error);
                    showMessage($message, 'error', 'Error de conexión. Por favor intenta de nuevo.');
                },
                complete: function() {
                    // Restaurar botón
                    $btn.prop('disabled', false).html(
                        '<i class="rs-icon" data-icon="search"></i><span>Verificar Garantía</span>'
                    );
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: MOSTRAR ESTADO DE GARANTÍA
    // ═══════════════════════════════════════════════════════════════
    
    function showWarrantyStatus(data) {
        // Actualizar información del pedido
        $('#rs-order-number-display').text(data.order_number);
        $('#rs-customer-name-display').text(data.customer_name);

        // Limpiar lista de productos
        const $productsList = $('#rs-products-list');
        $productsList.empty();

        // Verificar si hay productos
        if (!data.products || data.products.length === 0) {
            $productsList.html(`
                <div class="rs-alert rs-alert--warning">
                    <i class="rs-icon" data-icon="alert-circle"></i>
                    <p>Este pedido no tiene productos con garantía activa.</p>
                </div>
            `);
            return;
        }

        // Renderizar cada producto
        data.products.forEach(function(product) {
            const $productCard = createProductCard(product);
            $productsList.append($productCard);
        });

        // Verificar si hay productos válidos
        const hasValidWarranty = data.products.some(p => !p.is_expired);
        
        const $warrantyAction = $('#rs-warranty-action');
        if (!hasValidWarranty) {
            $warrantyAction.html(`
                <div class="rs-alert rs-alert--error">
                    <i class="rs-icon" data-icon="x-circle"></i>
                    <div>
                        <strong>Garantía Expirada</strong>
                        <p>Lo sentimos, todos los productos de este pedido tienen la garantía expirada.</p>
                    </div>
                </div>
            `);
        }
    }

    function createProductCard(product) {
        // Determinar color y estado de la barra de progreso
        let progressClass = 'rs-progress--expired';
        let statusText = 'Garantía Expirada';
        
        if (!product.is_expired) {
            if (product.warranty_percentage > 50) {
                progressClass = 'rs-progress--valid';
                statusText = 'Garantía Vigente';
            } else if (product.warranty_percentage > 20) {
                progressClass = 'rs-progress--warning';
                statusText = 'Garantía por Vencer';
            } else {
                progressClass = 'rs-progress--warning';
                statusText = 'Garantía Próxima a Vencer';
            }
        }

        // Crear card desde template
        const $card = $(`
            <div class="rs-product-card" data-product-id="${product.product_id}">
                <div class="rs-product-image">
                    <img src="${product.product_image || rsWarranty.placeholderImage || 'https://via.placeholder.com/100'}" alt="${escapeHtml(product.product_name)}" loading="lazy">
                </div>
                <div class="rs-product-info">
                    <h4 class="rs-product-name">${escapeHtml(product.product_name)}</h4>
                    <p class="rs-product-warranty-text">${escapeHtml(product.warranty_text)}</p>
                    
                    <div class="rs-warranty-progress">
                        <div class="rs-progress-header">
                            <span class="rs-progress-label">${statusText}</span>
                            <span class="rs-progress-value">${product.days_remaining} días</span>
                        </div>
                        <div class="rs-progress">
                            <div class="rs-progress-bar ${progressClass}" 
                                 role="progressbar" 
                                 aria-valuenow="${product.warranty_percentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100"
                                 style="width: ${product.warranty_percentage}%"></div>
                        </div>
                        <p class="rs-progress-expiry">
                            ${product.is_expired 
                                ? 'Garantía expirada el ' + formatDate(product.expiration_date)
                                : 'Válida hasta el ' + formatDate(product.expiration_date)}
                        </p>
                    </div>
                    
                    ${!product.is_expired ? `
                        <button type="button" 
                                class="rs-btn rs-btn--primary rs-btn--sm rs-btn-claim" 
                                data-product-id="${product.product_id}">
                            <i class="rs-icon" data-icon="file-text"></i>
                            <span>Solicitar Garantía</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `);

        // Event listener para botón de claim
        if (!product.is_expired) {
            $card.find('.rs-btn-claim').on('click', function() {
                selectedProduct = product;
                showClaimForm(product);
            });
        }

        return $card;
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: FORMULARIO DE RECLAMO
    // ═══════════════════════════════════════════════════════════════
    
    function showClaimForm(product) {
        // Pre-llenar datos del cliente
        if (currentOrderData) {
            $('#claim_customer_name').val(currentOrderData.customer_name);
            $('#claim_customer_email').val(currentOrderData.customer_email);
            $('#claim_customer_phone').val(currentOrderData.customer_phone || '');
            $('#claim_order_id').val(currentOrderData.order_id);
            $('#claim_product_id').val(product.product_id);
        }

        // Ir al paso de reclamo
        goToStep('claim');
    }

    function initClaimForm() {
        const $form = $('#rs-claim-form');
        const $btn = $('#rs-btn-submit-claim');
        const $btnBack = $('#rs-btn-back');
        const $message = $('#rs-claim-message');

        // Botón volver
        $btnBack.on('click', function() {
            goToStep('status');
        });

        // Enviar formulario
        $form.on('submit', function(e) {
            e.preventDefault();

            // Validar campos requeridos
            if (!validateClaimForm()) {
                showMessage($message, 'error', 'Por favor completa todos los campos requeridos');
                return;
            }

            // Preparar FormData para archivos
            const formData = new FormData();
            formData.append('action', 'rs_submit_warranty');
            formData.append('nonce', rsWarranty.nonce);
            formData.append('order_id', $('#claim_order_id').val());
            formData.append('product_id', $('#claim_product_id').val());
            formData.append('customer_name', $('#claim_customer_name').val());
            formData.append('customer_email', $('#claim_customer_email').val());
            formData.append('customer_phone', $('#claim_customer_phone').val());
            formData.append('description', $('#claim_description').val());

            // Agregar archivos
            uploadedFiles.forEach(function(file, index) {
                formData.append('files[]', file);
            });

            // Cambiar estado del botón
            $btn.prop('disabled', true).html(
                '<i class="rs-icon" data-icon="loader"></i><span>Enviando...</span>'
            );

            // AJAX: Enviar reclamo
            $.ajax({
                url: rsWarranty.ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        showSuccessMessage(response.data);
                    } else {
                        showMessage($message, 'error', response.data.message || 'Error al enviar la solicitud');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error AJAX:', error);
                    showMessage($message, 'error', 'Error de conexión. Por favor intenta de nuevo.');
                },
                complete: function() {
                    // Restaurar botón
                    $btn.prop('disabled', false).html(
                        '<i class="rs-icon" data-icon="send"></i><span>Enviar Solicitud</span>'
                    );
                }
            });
        });
    }

    function validateClaimForm() {
        const name = $('#claim_customer_name').val().trim();
        const email = $('#claim_customer_email').val().trim();
        const description = $('#claim_description').val().trim();

        if (!name || !email || !description) {
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // FILE UPLOAD
    // ═══════════════════════════════════════════════════════════════
    
    function initFileUpload() {
        const $uploadZone = $('#rs-upload-zone');
        const $fileInput = $('#claim_files');
        const $preview = $('#rs-upload-preview');

        // Click en zona de upload
        $uploadZone.on('click', function(e) {
            if (e.target === this || $(e.target).closest('.rs-upload-content').length) {
                $fileInput.click();
            }
        });

        // Cambio de archivos
        $fileInput.on('change', function() {
            handleFiles(this.files);
        });

        // Drag & Drop
        $uploadZone.on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('dragover');
        });

        $uploadZone.on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');
        });

        $uploadZone.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
        });
    }

    function handleFiles(files) {
        const $preview = $('#rs-upload-preview');
        
        Array.from(files).forEach(function(file) {
            // Validar tipo de archivo
            if (!file.type.match('image.*') && !file.type.match('video.*')) {
                alert('Solo se permiten imágenes y videos');
                return;
            }

            // Validar tamaño
            const maxSize = rsWarranty.fileLimits.maxPhotoSize || (10 * 1024 * 1024);
            if (file.size > maxSize) {
                alert(`El archivo ${file.name} excede el tamaño máximo permitido`);
                return;
            }

            // Agregar a lista de archivos
            uploadedFiles.push(file);

            // Crear preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const $previewItem = $(`
                    <div class="rs-preview-item" data-file-name="${escapeHtml(file.name)}">
                        ${file.type.match('image.*') 
                            ? `<img src="${e.target.result}" alt="${escapeHtml(file.name)}">` 
                            : `<video src="${e.target.result}"></video>`
                        }
                        <button type="button" class="rs-preview-remove" aria-label="Eliminar archivo">
                            <i class="rs-icon rs-icon--xs" data-icon="x"></i>
                        </button>
                    </div>
                `);

                // Botón eliminar
                $previewItem.find('.rs-preview-remove').on('click', function() {
                    const fileName = $previewItem.data('file-name');
                    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
                    $previewItem.remove();
                });

                $preview.append($previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: MENSAJE DE ÉXITO
    // ═══════════════════════════════════════════════════════════════
    
    function showSuccessMessage(data) {
        $('#rs-ticket-number').text(data.warranty_number || 'N/A');
        $('#rs-confirmation-email').text(data.customer_email || currentOrderData.customer_email);
        
        goToStep('success');
    }

    // ═══════════════════════════════════════════════════════════════
    // NAVEGACIÓN ENTRE PASOS
    // ═══════════════════════════════════════════════════════════════
    
    function goToStep(step) {
        // Ocultar todos los pasos
        $('.rs-verifier-step').hide().removeClass('rs-verifier-step--active');
        
        // Mostrar paso solicitado
        $(`#rs-step-${step}`).fadeIn(300).addClass('rs-verifier-step--active');
        
        // Scroll suave al inicio
        $('html, body').animate({
            scrollTop: $('.rs-warranty-verifier').offset().top - 100
        }, 300);
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════
    
    function showMessage($container, type, message) {
        $container
            .removeClass('rs-message--error rs-message--success')
            .addClass(`rs-message--${type}`)
            .html(`<p>${message}</p>`)
            .fadeIn(300);

        // Auto-ocultar después de 5 segundos
        setTimeout(function() {
            $container.fadeOut(300);
        }, 5000);
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }

})(jQuery);




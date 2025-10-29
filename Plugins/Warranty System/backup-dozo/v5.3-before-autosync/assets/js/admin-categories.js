/**
 * RockStage Warranty System - Categories Management (DOZO v3.5)
 * 
 * Data Persistence & Category Sync Fix:
 * - Toggle checkbox state management
 * - Auto-reload table without page refresh
 * - Real-time statistics update
 * - Enhanced error handling
 * 
 * @package RockStage_Warranty_System
 * @version 3.5.0
 */

(function($) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL FLAGS (DOZO v4.0 - Race Condition Prevention)
    // ═══════════════════════════════════════════════════════════════
    
    window.rsIsSaving = false;
    window.rsReloadTimer = null;
    window.rsAjaxMonitor = []; // Monitor de llamadas AJAX

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════
    
    $(document).ready(function() {
        initCategoryManagement();
        initAjaxMonitor(); // DOZO v4.0
    });

    function initCategoryManagement() {
        // Toggle checkbox functionality (DOZO v3.5 fix)
        initToggle();
        
        // Preview update
        $('#warrantyDays, #warrantyHours').on('input', updateWarrantyPreview);
        updateWarrantyPreview();
        
        // Button handlers
        $('#syncCategoriesBtn').on('click', syncCategories);
        $('#addCategoryBtn').on('click', saveCategory);
        
        // Make sure functions are globally available
        window.rsClearCategoryFields = clearCategoryFields;
        window.rsEditCategory = editCategory;
        window.rsDeleteCategory = deleteCategory;
        window.rsRestoreDefaults = restoreDefaults;
        window.rsSaveAllCategories = saveAllCategories;
        window.rsReloadCategoryTable = reloadCategoryTable;
        window.rsReloadCategoryTableDebounced = reloadCategoryTableDebounced; // DOZO v4.0
        window.rsReloadCategoryStats = reloadCategoryStats; // DOZO v3.7
    }
    
    // ═══════════════════════════════════════════════════════════════
    // AJAX MONITOR (DOZO v4.0 - Race Condition Debugging)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Monitor de llamadas AJAX para detectar duplicados
     * Intercepta XMLHttpRequest para logging
     */
    function initAjaxMonitor() {
        const originalOpen = XMLHttpRequest.prototype.open;
        
        XMLHttpRequest.prototype.open = function() {
            const url = arguments[1];
            
            // Solo monitorear llamadas a admin-ajax.php
            if (url && url.indexOf('admin-ajax.php') !== -1) {
                const timestamp = new Date().getTime();
                const callInfo = {
                    url: url,
                    timestamp: timestamp,
                    time: new Date().toLocaleTimeString()
                };
                
                window.rsAjaxMonitor.push(callInfo);
                console.log('📡 DOZO v4.0: AJAX detected →', url, '@', callInfo.time);
                
                // Detectar llamadas duplicadas (< 100ms)
                const recent = window.rsAjaxMonitor.filter(c => 
                    (timestamp - c.timestamp) < 100 && c.url === url
                );
                
                if (recent.length > 1) {
                    console.warn('⚠️ DOZO v4.0: RACE CONDITION DETECTED! Llamadas duplicadas en < 100ms:', recent.length);
                }
            }
            
            return originalOpen.apply(this, arguments);
        };
        
        console.log('🔍 DOZO v4.0: AJAX Monitor activado');
    }

    // ═══════════════════════════════════════════════════════════════
    // TOGGLE CHECKBOX FIX (DOZO v3.5)
    // ═══════════════════════════════════════════════════════════════
    
    function initToggle() {
        const $toggle = $('.rs-toggle input[type="checkbox"]');
        
        // Set initial state
        if ($toggle.is(':checked')) {
            $toggle.closest('.rs-toggle').addClass('active');
        }
        
        // Handle changes
        $toggle.on('change', function() {
            const $wrapper = $(this).closest('.rs-toggle');
            if (this.checked) {
                $wrapper.addClass('active');
            } else {
                $wrapper.removeClass('active');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // WARRANTY PREVIEW
    // ═══════════════════════════════════════════════════════════════
    
    function updateWarrantyPreview() {
        const days = parseInt($('#warrantyDays').val()) || 0;
        const hours = parseInt($('#warrantyHours').val()) || 0;
        
        let text = '';
        
        if (days > 0) {
            text += days + ' día' + (days !== 1 ? 's' : '');
            
            if (days === 365) {
                text += ' (1 año)';
            } else if (days === 730) {
                text += ' (2 años)';
            } else if (days === 1095) {
                text += ' (3 años)';
            } else if (days >= 30) {
                const months = Math.floor(days / 30);
                text += ' (~' + months + ' mes' + (months !== 1 ? 'es' : '') + ')';
            }
        }
        
        if (hours > 0) {
            text += (text ? ' + ' : '') + hours + ' hora' + (hours !== 1 ? 's' : '');
        }
        
        if (!text) {
            text = 'Sin garantía';
        }
        
        $('#totalWarrantyPreview').text(text);
    }

    // ═══════════════════════════════════════════════════════════════
    // SYNC CATEGORIES
    // ═══════════════════════════════════════════════════════════════
    
    function syncCategories() {
        const $btn = $('#syncCategoriesBtn');
        $btn.prop('disabled', true).html('<i class="rs-icon" data-icon="loader"></i><span>Sincronizando...</span>');
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_sync_categories',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    rsShowNotification('✅ Categorías sincronizadas: ' + response.data.total, 'success');
                    reloadCategoryTable();
                    reloadCategoryStats(); // DOZO v3.7: Explicit counter refresh
                } else {
                    rsShowNotification('❌ ' + (response.data.message || 'Error al sincronizar'), 'error');
                }
            },
            error: function() {
                rsShowNotification('❌ Error de conexión', 'error');
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i class="rs-icon" data-icon="refresh-cw"></i><span>Sincronizar con WooCommerce</span>');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SAVE CATEGORY (DOZO v4.0 - Race Condition Prevention)
    // ═══════════════════════════════════════════════════════════════
    
    function saveCategory() {
        // DOZO v4.0: Prevenir guardados concurrentes
        if (window.rsIsSaving) {
            console.warn('⚠️ DOZO v4.0: Guardado ignorado - proceso anterior aún activo');
            rsShowNotification('⚠️ Espera a que termine el proceso anterior', 'warning');
            return;
        }
        
        const categoryId = $('#categorySelect').val();
        const categoryName = $('#categorySelect option:selected').text();
        const days = parseInt($('#warrantyDays').val()) || 0;
        const hours = parseInt($('#warrantyHours').val()) || 0;
        const text = $('#warrantyText').val() || '';
        const active = $('#categoryActiveToggle').is(':checked'); // FIXED!
        
        if (!categoryId) {
            rsShowNotification('⚠️ Por favor selecciona una categoría', 'error');
            return;
        }
        
        // DOZO v4.0: Activar flag global
        window.rsIsSaving = true;
        
        const $btn = $('#addCategoryBtn');
        $btn.prop('disabled', true).html('<i class="rs-icon" data-icon="loader"></i><span>Guardando...</span>');
        
        console.log('📡 DOZO v4.0: Iniciando guardado de categoría ID:', categoryId);
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_save_category',
                nonce: rsWarrantyAdmin.nonce,
                category_id: categoryId,
                category_name: categoryName,
                days: days,
                hours: hours,
                text: text,
                active: active ? 1 : 0
            },
            success: function(response) {
                if (response.success) {
                    console.log('✅ DOZO v4.0: Guardado exitoso');
                    rsShowNotification('✅ Configuración guardada correctamente', 'success');
                    reloadCategoryTableDebounced(); // DOZO v4.0: Debounced reload!
                    clearCategoryFields();
                } else {
                    console.error('❌ DOZO v4.0: Error en guardado:', response);
                    rsShowNotification('❌ ' + (response.data.message || 'Error al guardar'), 'error');
                }
            },
            error: function() {
                console.error('❌ DOZO v4.0: Error de conexión');
                rsShowNotification('❌ Error de conexión', 'error');
            },
            complete: function() {
                $btn.prop('disabled', false).html('<i class="rs-icon" data-icon="check"></i><span>Guardar Configuración</span>');
                // DOZO v4.0: Liberar flag después de completar
                window.rsIsSaving = false;
                console.log('🔓 DOZO v4.0: Flag rsIsSaving liberado');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // RELOAD TABLE (DOZO v4.0 - Debounced & Race-Safe)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Recarga tabla con debounce para evitar llamadas múltiples
     * DOZO v4.0: Implementa control de race condition
     */
    function reloadCategoryTableDebounced() {
        // Cancelar timer previo si existe
        if (window.rsReloadTimer) {
            clearTimeout(window.rsReloadTimer);
            console.log('⏱️ DOZO v4.0: Timer previo cancelado');
        }
        
        // Nuevo timer con delay de 500ms
        window.rsReloadTimer = setTimeout(function() {
            console.log('🔄 DOZO v4.0: Ejecutando reload con debounce');
            reloadCategoryTable();
        }, 500);
    }
    
    /**
     * Recarga tabla sin debounce (llamada directa)
     * Usado internamente por reloadCategoryTableDebounced()
     */
    function reloadCategoryTable() {
        console.log('📡 DOZO v4.0: Solicitando actualización de tabla');
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_get_categories_table',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    console.log('✅ DOZO v4.0: Respuesta recibida, actualizando DOM');
                    
                    // Update table HTML
                    $('#categoriesTableBody').html(response.data.html);
                    
                    // Update statistics (all instances)
                    $('#activeCount, #activeCount2').text(response.data.active_count);
                    $('#inactiveCount, #inactiveCount2').text(response.data.inactive_count);
                    
                    console.log('✅ DOZO v3.5: Table reloaded. Active: ' + response.data.active_count + ', Inactive: ' + response.data.inactive_count);
                    
                    // DOZO v3.7: Additional stats refresh (NO debounced, ejecuta inmediato)
                    reloadCategoryStats();
                } else {
                    console.error('❌ DOZO v4.0: Respuesta inválida:', response);
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ DOZO v4.0: Error reloading table:', status, error);
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // RELOAD CATEGORY STATS (DOZO v3.7 - Dynamic Counter Refresh)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Actualiza SOLO los contadores de activas/inactivas
     * Útil para refresh sin recargar toda la tabla
     */
    function reloadCategoryStats() {
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_get_category_stats',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    const active = response.data.active || 0;
                    const inactive = response.data.inactive || 0;
                    const total = response.data.total || 0;
                    
                    // Update all counter instances
                    $('#activeCount, #activeCount2').text(active);
                    $('#inactiveCount, #inactiveCount2').text(inactive);
                    
                    console.log('✅ DOZO v3.7: Contadores actualizados → ' + active + ' activas | ' + inactive + ' inactivas (Total: ' + total + ')');
                } else {
                    console.warn('⚠️ DOZO v3.7: No se pudieron obtener estadísticas');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ DOZO v3.7: Error al actualizar contadores:', error);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // CLEAR FIELDS
    // ═══════════════════════════════════════════════════════════════
    
    function clearCategoryFields() {
        $('#categorySelect').val('');
        $('#warrantyDays').val('365');
        $('#warrantyHours').val('0');
        $('#warrantyText').val('1 año de garantía');
        $('#categoryActiveToggle').prop('checked', true).closest('.rs-toggle').addClass('active');
        updateWarrantyPreview();
    }

    // ═══════════════════════════════════════════════════════════════
    // EDIT CATEGORY
    // ═══════════════════════════════════════════════════════════════
    
    function editCategory(categoryId) {
        const $row = $(`tr[data-category-id="${categoryId}"]`);
        if (!$row.length) return;
        
        const name = $row.find('.category-name-cell strong').text();
        const days = parseInt($row.find('.time-value').eq(0).text()) || 0;
        const hours = parseInt($row.find('.time-value').eq(1).text()) || 0;
        const text = $row.find('.friendly-text').text() || '';
        const active = $row.hasClass('active');
        
        // Populate form
        $('#categorySelect').val(categoryId);
        $('#warrantyDays').val(days);
        $('#warrantyHours').val(hours);
        $('#warrantyText').val(text);
        $('#categoryActiveToggle').prop('checked', active);
        
        // Update toggle visual state
        if (active) {
            $('#categoryActiveToggle').closest('.rs-toggle').addClass('active');
        } else {
            $('#categoryActiveToggle').closest('.rs-toggle').removeClass('active');
        }
        
        updateWarrantyPreview();
        
        // Scroll to form
        $('html, body').animate({
            scrollTop: $('.rs-card--config').offset().top - 100
        }, 500);
        
        rsShowNotification('📝 Editando: ' + name, 'info');
    }

    // ═══════════════════════════════════════════════════════════════
    // DELETE CATEGORY
    // ═══════════════════════════════════════════════════════════════
    
    function deleteCategory(categoryId) {
        if (!confirm('¿Estás seguro de eliminar esta configuración de garantía?')) {
            return;
        }
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_delete_category',
                nonce: rsWarrantyAdmin.nonce,
                category_id: categoryId
            },
            success: function(response) {
                if (response.success) {
                    rsShowNotification('✅ Configuración eliminada', 'success');
                    reloadCategoryTable();
                    reloadCategoryStats(); // DOZO v3.7: Explicit counter refresh
                } else {
                    rsShowNotification('❌ ' + (response.data.message || 'Error al eliminar'), 'error');
                }
            },
            error: function() {
                rsShowNotification('❌ Error de conexión', 'error');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // RESTORE DEFAULTS
    // ═══════════════════════════════════════════════════════════════
    
    function restoreDefaults() {
        if (!confirm('¿Restaurar todas las categorías a sus valores predeterminados?')) {
            return;
        }
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_restore_default_categories',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    rsShowNotification('✅ Configuraciones restauradas (' + response.data.count + ' categorías)', 'success');
                    reloadCategoryTable();
                    reloadCategoryStats(); // DOZO v3.7: Explicit counter refresh
                } else {
                    rsShowNotification('❌ ' + (response.data.message || 'Error al restaurar'), 'error');
                }
            },
            error: function() {
                rsShowNotification('❌ Error de conexión', 'error');
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SAVE ALL CATEGORIES
    // ═══════════════════════════════════════════════════════════════
    
    function saveAllCategories() {
        // Collect all categories from table
        const categories = {};
        
        $('#categoriesTableBody tr[data-category-id]').each(function() {
            const $row = $(this);
            const catId = $row.data('category-id');
            const name = $row.find('.category-name-cell strong').text();
            const days = parseInt($row.find('.time-value').eq(0).text()) || 0;
            const hours = parseInt($row.find('.time-value').eq(1).text()) || 0;
            const text = $row.find('.friendly-text').text() || '';
            const active = $row.hasClass('active');
            
            categories[catId] = {
                name: name,
                days: days,
                hours: hours,
                text: text,
                active: active
            };
        });
        
        if (Object.keys(categories).length === 0) {
            rsShowNotification('⚠️ No hay categorías para guardar', 'error');
            return;
        }
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_save_all_categories',
                nonce: rsWarrantyAdmin.nonce,
                categories: categories
            },
            success: function(response) {
                if (response.success) {
                    rsShowNotification('✅ Todas las configuraciones guardadas (' + response.data.count + ' categorías)', 'success');
                    reloadCategoryTable();
                    reloadCategoryStats(); // DOZO v3.7: Explicit counter refresh
                } else {
                    rsShowNotification('❌ ' + (response.data.message || 'Error al guardar'), 'error');
                }
            },
            error: function() {
                rsShowNotification('❌ Error de conexión', 'error');
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // DOZO AUTO-TEST (v3.7)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Test automático de contadores dinámicos
     * Ejecutar en console: rsTestDynamicCounters()
     */
    window.rsTestDynamicCounters = function() {
        console.log('🧪 DOZO v3.7: Iniciando test de contadores dinámicos...');
        
        // Test 1: Verificar elementos existen
        const $activeCount = $('#activeCount');
        const $inactiveCount = $('#inactiveCount');
        
        if ($activeCount.length === 0) {
            console.error('❌ Elemento #activeCount no encontrado');
            return false;
        }
        if ($inactiveCount.length === 0) {
            console.error('❌ Elemento #inactiveCount no encontrado');
            return false;
        }
        console.log('✅ Test 1: Elementos existen');
        
        // Test 2: Verificar función rsReloadCategoryStats existe
        if (typeof window.rsReloadCategoryStats !== 'function') {
            console.error('❌ Función rsReloadCategoryStats no está definida');
            return false;
        }
        console.log('✅ Test 2: Función rsReloadCategoryStats existe');
        
        // Test 3: Verificar rsWarrantyAdmin está definido
        if (typeof rsWarrantyAdmin === 'undefined') {
            console.error('❌ Variable rsWarrantyAdmin no está definida');
            return false;
        }
        console.log('✅ Test 3: rsWarrantyAdmin está definido');
        
        // Test 4: Ejecutar refresh
        console.log('🔄 Test 4: Ejecutando rsReloadCategoryStats()...');
        window.rsReloadCategoryStats();
        
        console.log('✅ DOZO v3.7: Todos los tests pasados. Verifica console log en 1 segundo.');
        return true;
    };

})(jQuery);


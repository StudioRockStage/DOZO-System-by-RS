<?php
/**
 * Create/Edit Warranty Form Template - Admin
 * Based on "Formulario Crear:Editar Garantía Manual.html"
 */

defined('ABSPATH') || exit;

$warranty_id = isset($_GET['id']) ? absint($_GET['id']) : 0;
$db = RS_Warranty_Database::get_instance();
$settings = RS_Warranty_Settings::get_instance();

// Load existing warranty if editing
$warranty = null;
$product = null;
$order = null;
if ($warranty_id) {
    $warranty = $db->get_warranty($warranty_id);
    if ($warranty) {
        $product = wc_get_product($warranty['product_id']);
        $order = wc_get_order($warranty['order_id']);
    }
}

$categories = $settings->get_categories();
$is_edit = !empty($warranty);
?>

<div class="wrap rs-create-warranty">
    <!-- Header -->
    <div class="rs-page-header">
        <div class="rs-header-left">
            <a href="<?php echo admin_url('admin.php?page=rockstage-warranty'); ?>" class="rs-back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2"/>
                </svg>
                Volver al Dashboard
            </a>
            <div class="rs-page-title-group">
                <h1><?php echo $is_edit ? 'Editar Garantía' : 'Crear Nueva Garantía'; ?></h1>
                <p><?php echo $is_edit ? 'Actualiza la información de la garantía' : 'Registra una garantía manualmente desde el admin'; ?></p>
            </div>
        </div>
        <div class="rs-header-actions">
            <button type="button" class="rs-btn rs-btn-secondary" onclick="rsWarrantyCancelForm()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6L18 18" stroke-width="2"/>
                </svg>
                Cancelar
            </button>
            <button type="button" class="rs-btn rs-btn-ghost" onclick="rsWarrantySaveDraft()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-width="2"/>
                    <polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/>
                </svg>
                Guardar Borrador
            </button>
            <button type="submit" form="warranty-form" class="rs-btn rs-btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-width="2"/>
                    <polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/>
                </svg>
                <?php echo $is_edit ? 'Actualizar Garantía' : 'Crear Garantía'; ?>
            </button>
        </div>
    </div>

    <form id="warranty-form" method="post" enctype="multipart/form-data">
        <?php wp_nonce_field('rs_warranty_create', 'rs_warranty_create_nonce'); ?>
        <input type="hidden" name="action" value="rs_save_warranty">
        <input type="hidden" name="warranty_id" value="<?php echo $warranty_id; ?>">

        <div class="rs-form-layout">
            <!-- Left Column -->
            <div class="rs-form-main">
                
                <!-- Customer Info Card -->
                <div class="rs-card">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke-width="2"/>
                            <circle cx="12" cy="7" r="4" stroke-width="2"/>
                        </svg>
                        Información del Cliente
                    </h2>
                    
                    <div class="rs-form-group">
                        <label class="rs-form-label" for="customerSearch">Buscar Cliente/Pedido</label>
                        <div class="rs-search-wrapper">
                            <input type="text" id="customerSearch" class="rs-form-input" placeholder="Nombre, email o número de pedido..." autocomplete="off">
                            <div id="searchResults" class="rs-search-results"></div>
                        </div>
                    </div>

                    <div class="rs-form-grid">
                        <div class="rs-form-group">
                            <label class="rs-form-label required" for="customer_name">Nombre Completo</label>
                            <input type="text" id="customer_name" name="customer_name" class="rs-form-input" value="<?php echo $warranty ? esc_attr($warranty['customer_name']) : ''; ?>" required>
                        </div>

                        <div class="rs-form-group">
                            <label class="rs-form-label required" for="customer_email">Email</label>
                            <input type="email" id="customer_email" name="customer_email" class="rs-form-input" value="<?php echo $warranty ? esc_attr($warranty['customer_email']) : ''; ?>" required>
                        </div>

                        <div class="rs-form-group">
                            <label class="rs-form-label" for="customer_phone">Teléfono</label>
                            <input type="tel" id="customer_phone" name="customer_phone" class="rs-form-input" value="<?php echo $warranty ? esc_attr($warranty['customer_phone']) : ''; ?>">
                        </div>

                        <div class="rs-form-group">
                            <label class="rs-form-label required" for="order_number">Número de Pedido</label>
                            <input type="text" id="order_number" name="order_number" class="rs-form-input" value="<?php echo $warranty ? '#' . esc_attr($warranty['order_id']) : ''; ?>" required>
                        </div>

                        <div class="rs-form-group">
                            <label class="rs-form-label required" for="product_id">Producto</label>
                            <select id="product_id" name="product_id" class="rs-form-select" required>
                                <option value="">Selecciona un producto...</option>
                                <?php
                                // Get recent products from WooCommerce
                                $products = wc_get_products(array('limit' => 50, 'orderby' => 'date', 'order' => 'DESC'));
                                foreach ($products as $prod) {
                                    $selected = ($warranty && $warranty['product_id'] == $prod->get_id()) ? 'selected' : '';
                                    echo '<option value="' . esc_attr($prod->get_id()) . '" ' . $selected . '>' . esc_html($prod->get_name()) . '</option>';
                                }
                                ?>
                            </select>
                        </div>

                        <div class="rs-form-group">
                            <label class="rs-form-label" for="purchase_date">Fecha de Compra</label>
                            <input type="date" id="purchase_date" name="purchase_date" class="rs-form-input" value="<?php echo $warranty ? esc_attr(date('Y-m-d', strtotime($warranty['purchase_date']))) : ''; ?>">
                        </div>
                    </div>
                </div>

                <!-- Problem Description -->
                <div class="rs-card">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke-width="2"/>
                            <line x1="12" y1="9" x2="12" y2="13" stroke-width="2"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"/>
                        </svg>
                        Descripción del Problema
                    </h2>
                    
                    <div class="rs-form-group">
                        <label class="rs-form-label required" for="description">Describe el defecto o problema</label>
                        <textarea id="description" name="description" class="rs-form-textarea" rows="6" required><?php echo $warranty ? esc_textarea($warranty['description']) : ''; ?></textarea>
                        <p class="rs-form-help">Mínimo 20 caracteres para una descripción completa</p>
                    </div>

                    <div class="rs-form-group">
                        <label class="rs-form-label">Archivos Adjuntos</label>
                        <div class="rs-file-upload-area" id="fileUploadArea">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-width="2"/>
                            </svg>
                            <p>Haz clic o arrastra archivos aquí</p>
                            <span>Máximo 5 fotos (5MB cada una) y 1 video (50MB)</span>
                        </div>
                        <input type="file" id="fileInput" name="files[]" multiple accept="image/*,video/*" style="display: none;">
                        <div id="fileList" class="rs-file-list"></div>
                    </div>
                </div>

                <!-- Internal Notes -->
                <div class="rs-card">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                        </svg>
                        Notas Internas (Opcional)
                    </h2>
                    <textarea id="internal_notes" name="internal_notes" class="rs-form-textarea" rows="4" placeholder="Notas para el equipo..."><?php echo $warranty && !empty($warranty['resolution']) ? esc_textarea($warranty['resolution']) : ''; ?></textarea>
                </div>
            </div>

            <!-- Right Sidebar -->
            <div class="rs-form-sidebar">
                <!-- Warranty Settings -->
                <div class="rs-card">
                    <h3>Configuración de la Garantía</h3>
                    
                    <div class="rs-form-group">
                        <label class="rs-form-label" for="warranty_status">Estado</label>
                        <select id="warranty_status" name="status" class="rs-form-select">
                            <option value="pending" <?php echo ($warranty && $warranty['status'] === 'pending') ? 'selected' : ''; ?>>Pendiente</option>
                            <option value="processing" <?php echo ($warranty && $warranty['status'] === 'processing') ? 'selected' : ''; ?>>En Proceso</option>
                            <option value="approved" <?php echo ($warranty && $warranty['status'] === 'approved') ? 'selected' : ''; ?>>Aprobada</option>
                            <option value="rejected" <?php echo ($warranty && $warranty['status'] === 'rejected') ? 'selected' : ''; ?>>Rechazada</option>
                            <option value="completed" <?php echo ($warranty && $warranty['status'] === 'completed') ? 'selected' : ''; ?>>Completada</option>
                        </select>
                    </div>

                    <div class="rs-form-group">
                        <label class="rs-form-label" for="warranty_priority">Prioridad</label>
                        <select id="warranty_priority" name="priority" class="rs-form-select">
                            <option value="low" <?php echo ($warranty && $warranty['priority'] === 'low') ? 'selected' : ''; ?>>Baja</option>
                            <option value="normal" <?php echo ($warranty && $warranty['priority'] === 'normal') ? 'selected' : 'selected'; ?>>Normal</option>
                            <option value="high" <?php echo ($warranty && $warranty['priority'] === 'high') ? 'selected' : ''; ?>>Alta</option>
                            <option value="urgent" <?php echo ($warranty && $warranty['priority'] === 'urgent') ? 'selected' : ''; ?>>Urgente</option>
                        </select>
                    </div>

                    <div class="rs-form-group">
                        <label class="rs-form-label" for="warranty_period">Período de Garantía</label>
                        <select id="warranty_period" name="warranty_period" class="rs-form-select">
                            <option value="30">30 días</option>
                            <option value="90">90 días (3 meses)</option>
                            <option value="180">180 días (6 meses)</option>
                            <option value="365" selected>365 días (1 año)</option>
                            <option value="730">730 días (2 años)</option>
                        </select>
                    </div>

                    <div class="rs-form-group">
                        <label class="rs-form-label" for="warranty_expiration">Fecha de Expiración</label>
                        <input type="date" id="warranty_expiration" name="warranty_expiration" class="rs-form-input" value="<?php echo $warranty ? esc_attr(date('Y-m-d', strtotime($warranty['warranty_expiration']))) : ''; ?>" readonly>
                        <p class="rs-form-help">Se calcula automáticamente</p>
                    </div>
                </div>

                <!-- Warranty Preview -->
                <div class="rs-card rs-preview-card">
                    <h3>Vista Previa de Garantía</h3>
                    <div class="rs-preview-item">
                        <span class="rs-preview-label">Período Total:</span>
                        <span class="rs-preview-value" id="preview-total">365 días</span>
                    </div>
                    <div class="rs-preview-item">
                        <span class="rs-preview-label">Días Restantes:</span>
                        <span class="rs-preview-value" id="preview-remaining">--</span>
                    </div>
                    <div class="rs-preview-item">
                        <span class="rs-preview-label">Estado:</span>
                        <span class="rs-preview-value" id="preview-status">Activa</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="rs-card">
                    <h3>Acciones Automáticas</h3>
                    
                    <label class="rs-toggle-label">
                        <input type="checkbox" name="generate_rma" value="1" <?php echo (get_option('rs_warranty_rma_enabled') === 'yes') ? 'checked' : ''; ?>>
                        <div class="rs-toggle-switch"></div>
                        <span>Generar RMA automáticamente</span>
                    </label>

                    <label class="rs-toggle-label">
                        <input type="checkbox" name="notify_customer" value="1" checked>
                        <div class="rs-toggle-switch"></div>
                        <span>Notificar al cliente por email</span>
                    </label>

                    <label class="rs-toggle-label">
                        <input type="checkbox" name="notify_admin" value="1" checked>
                        <div class="rs-toggle-switch"></div>
                        <span>Notificar al equipo</span>
                    </label>
                </div>
            </div>
        </div>
    </form>
</div>

<style>
/* Additional styles for create-warranty */
.rs-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #e5e7eb;
}

.rs-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.rs-back-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #374151;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.rs-back-link:hover {
    border-color: var(--rs-orange);
    transform: translateX(-4px);
}

.rs-page-title-group h1 {
    font-size: 32px;
    font-weight: 800;
    color: #111827;
    margin-bottom: 4px;
}

.rs-page-title-group p {
    font-size: 14px;
    color: #6b7280;
}

.rs-form-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
}

.rs-card h2 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.rs-card h3 {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
}

.rs-search-wrapper {
    position: relative;
}

.rs-search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    display: none;
}

.rs-search-results.active {
    display: block;
}

.rs-search-result-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid #f3f4f6;
}

.rs-search-result-item:hover {
    background: #f9fafb;
}

.rs-result-name {
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
}

.rs-result-email {
    font-size: 13px;
    color: #6b7280;
}

.rs-result-order {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
}

.rs-toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    cursor: pointer;
}

.rs-toggle-label input[type="checkbox"] {
    display: none;
}

.rs-toggle-switch {
    width: 44px;
    height: 24px;
    background: #d1d5db;
    border-radius: 12px;
    position: relative;
    transition: all 0.3s ease;
}

.rs-toggle-switch::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
}

.rs-toggle-label input:checked + .rs-toggle-switch {
    background: var(--rs-orange);
}

.rs-toggle-label input:checked + .rs-toggle-switch::after {
    transform: translateX(20px);
}

.rs-preview-card {
    background: linear-gradient(135deg, rgba(255, 140, 0, 0.05), rgba(255, 140, 0, 0.02));
    border: 1px solid rgba(255, 140, 0, 0.2);
}

.rs-preview-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 140, 0, 0.1);
}

.rs-preview-item:last-child {
    border-bottom: none;
}

.rs-preview-label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 600;
}

.rs-preview-value {
    font-size: 14px;
    color: #111827;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
}
</style>

<script>
// Customer search functionality
let searchTimeout;
const customerSearchInput = document.getElementById('customerSearch');
const searchResults = document.getElementById('searchResults');

if (customerSearchInput) {
    customerSearchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 3) {
            searchResults.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(() => {
            rsWarrantySearchCustomers(query);
        }, 300);
    });
}

function rsWarrantySearchCustomers(query) {
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_search_customers',
            nonce: rsWarrantyAdmin.nonce,
            query: query
        },
        success: function(response) {
            if (response.success && response.data.customers) {
                displaySearchResults(response.data.customers);
                searchResults.classList.add('active');
            }
        }
    });
}

function displaySearchResults(customers) {
    searchResults.innerHTML = '';
    
    if (customers.length === 0) {
        searchResults.innerHTML = '<div style="padding: 12px; text-align: center; color: #9ca3af; font-size: 13px;">No se encontraron resultados</div>';
        return;
    }
    
    customers.forEach(customer => {
        const item = document.createElement('div');
        item.className = 'rs-search-result-item';
        item.innerHTML = `
            <div class="rs-result-name">${customer.name}</div>
            <div class="rs-result-email">${customer.email}</div>
            <div class="rs-result-order">#${customer.order} - ${customer.date}</div>
        `;
        item.addEventListener('click', () => selectCustomer(customer));
        searchResults.appendChild(item);
    });
}

function selectCustomer(customer) {
    document.getElementById('customer_name').value = customer.name;
    document.getElementById('customer_email').value = customer.email;
    document.getElementById('customer_phone').value = customer.phone || '';
    document.getElementById('order_number').value = '#' + customer.order;
    
    if (customer.purchaseDate) {
        document.getElementById('purchase_date').value = customer.purchaseDate;
    }
    
    searchResults.classList.remove('active');
    customerSearchInput.value = customer.name;
    
    updateWarrantyExpiration();
    rsShowNotification('Cliente seleccionado: ' + customer.name, 'success');
}

// Warranty calculation
function updateWarrantyExpiration() {
    const purchaseDateInput = document.getElementById('purchase_date');
    const warrantyPeriodSelect = document.getElementById('warranty_period');
    const expirationInput = document.getElementById('warranty_expiration');
    
    if (!purchaseDateInput.value || !warrantyPeriodSelect.value) return;
    
    const purchaseDate = new Date(purchaseDateInput.value);
    const warrantyDays = parseInt(warrantyPeriodSelect.value);
    
    const expirationDate = new Date(purchaseDate);
    expirationDate.setDate(expirationDate.getDate() + warrantyDays);
    
    expirationInput.value = expirationDate.toISOString().split('T')[0];
    
    // Update preview
    const today = new Date();
    const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    document.getElementById('preview-total').textContent = warrantyDays + ' días';
    document.getElementById('preview-remaining').textContent = Math.max(0, daysRemaining) + ' días';
    document.getElementById('preview-status').textContent = daysRemaining > 0 ? 'Activa' : 'Vencida';
}

document.addEventListener('DOMContentLoaded', function() {
    const purchaseDateInput = document.getElementById('purchase_date');
    const warrantyPeriodSelect = document.getElementById('warranty_period');
    
    if (purchaseDateInput) {
        purchaseDateInput.addEventListener('change', updateWarrantyExpiration);
    }
    
    if (warrantyPeriodSelect) {
        warrantyPeriodSelect.addEventListener('change', updateWarrantyExpiration);
    }
    
    // Initial calculation
    if (purchaseDateInput.value) {
        updateWarrantyExpiration();
    }
});

// Form actions
function rsWarrantySaveDraft() {
    const formData = new FormData(document.getElementById('warranty-form'));
    formData.set('status', 'draft');
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.success) {
                rsShowNotification('Borrador guardado correctamente', 'success');
            } else {
                rsShowNotification(response.data.message || 'Error al guardar', 'error');
            }
        }
    });
}

function rsWarrantyCancelForm() {
    if (confirm('¿Estás seguro de cancelar? Se perderán todos los cambios.')) {
        window.location.href = '<?php echo admin_url('admin.php?page=rockstage-warranty'); ?>';
    }
}

// File upload (reuse from public script)
function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!fileUploadArea || !fileInput) return;
    
    fileUploadArea.addEventListener('click', () => fileInput.click());
    
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
}

let uploadedFiles = [];

function handleFiles(files) {
    Array.from(files).forEach(file => {
        uploadedFiles.push(file);
        addFileToList(file);
    });
}

function addFileToList(file) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    const isVideo = file.type.startsWith('video/');
    const fileItem = document.createElement('div');
    fileItem.className = 'rs-file-item';
    fileItem.dataset.filename = file.name;
    
    const iconSvg = isVideo ? 
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2"/>
            <path d="M9 9L15 12L9 15V9Z" fill="currentColor"/>
        </svg>` :
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15L16 10L5 21" stroke-width="2"/>
        </svg>`;
    
    fileItem.innerHTML = `
        <div class="rs-file-icon">${iconSvg}</div>
        <div class="rs-file-info">
            <div class="rs-file-name">${file.name}</div>
            <div class="rs-file-size">${formatFileSize(file.size)}</div>
        </div>
        <button type="button" class="rs-file-remove" onclick="removeFile('${file.name}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6L18 18" stroke-width="2"/>
            </svg>
        </button>
    `;
    
    fileList.appendChild(fileItem);
}

function removeFile(filename) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== filename);
    const fileItem = document.querySelector(`.rs-file-item[data-filename="${filename}"]`);
    if (fileItem) {
        fileItem.remove();
    }
    rsShowNotification('Archivo eliminado', 'info');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();
    console.log('✅ Create Warranty Form - Initialized');
});

// Form submission
document.getElementById('warranty-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    // Add uploaded files
    uploadedFiles.forEach((file, index) => {
        formData.append('files[]', file);
    });
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function() {
            rsShowNotification('Guardando garantía...', 'info');
        },
        success: function(response) {
            if (response.success) {
                rsShowNotification('Garantía creada exitosamente', 'success');
                setTimeout(() => {
                    window.location.href = '<?php echo admin_url('admin.php?page=rockstage-warranty&action=view&id='); ?>' + response.data.warranty_id;
                }, 1500);
            } else {
                rsShowNotification(response.data.message || 'Error al crear la garantía', 'error');
            }
        },
        error: function() {
            rsShowNotification('Error de conexión', 'error');
        }
    });
});
</script>




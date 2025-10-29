<?php
/**
 * Warranty Detail View Template
 */

defined('ABSPATH') || exit;

$db = RS_Warranty_Database::get_instance();
$warranty = $db->get_warranty($warranty_id);

if (!$warranty) {
    echo '<div class="rs-error">Garantía no encontrada</div>';
    return;
}

$product = wc_get_product($warranty['product_id']);
$order = wc_get_order($warranty['order_id']);
$files = $db->get_warranty_files($warranty_id);
$notes = $db->get_warranty_notes($warranty_id);
$rma = $db->get_rma_by_warranty($warranty_id);
?>

<div class="wrap rs-warranty-detail">
    <!-- Header Glass -->
    <div class="rs-header-glass">
        <a href="<?php echo admin_url('admin.php?page=rockstage-warranty'); ?>" class="rs-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2"/>
            </svg>
            Volver
        </a>
        <div class="rs-header-info">
            <div class="rs-warranty-number"><?php echo esc_html($warranty['warranty_number']); ?></div>
            <div class="rs-warranty-date">Creada el <?php echo esc_html(date('d/m/Y H:i', strtotime($warranty['created_at']))); ?></div>
        </div>
        <div class="rs-header-actions">
            <button class="rs-btn rs-btn-ghost" onclick="rsWarrantyEdit(<?php echo $warranty_id; ?>)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/>
                </svg>
                Editar
            </button>
            <button class="rs-btn rs-btn-primary" onclick="rsWarrantySendEmail(<?php echo $warranty_id; ?>)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2"/>
                    <path d="M22 6l-10 7L2 6" stroke-width="2"/>
                </svg>
                Enviar Email
            </button>
        </div>
    </div>

    <!-- Status Bar -->
    <div class="rs-status-bar">
        <div class="rs-status-group">
            <label class="rs-status-label">Estado:</label>
            <select class="rs-status-select" onchange="rsWarrantyUpdateStatus(<?php echo $warranty_id; ?>, this.value)">
                <option value="pending" <?php selected($warranty['status'], 'pending'); ?>>Pendiente</option>
                <option value="processing" <?php selected($warranty['status'], 'processing'); ?>>En Proceso</option>
                <option value="approved" <?php selected($warranty['status'], 'approved'); ?>>Aprobada</option>
                <option value="rejected" <?php selected($warranty['status'], 'rejected'); ?>>Rechazada</option>
                <option value="completed" <?php selected($warranty['status'], 'completed'); ?>>Completada</option>
            </select>
        </div>
        <div class="rs-status-group">
            <label class="rs-status-label">Prioridad:</label>
            <select class="rs-priority-select" onchange="rsWarrantyUpdatePriority(<?php echo $warranty_id; ?>, this.value)">
                <option value="low" <?php selected($warranty['priority'], 'low'); ?>>Baja</option>
                <option value="normal" <?php selected($warranty['priority'], 'normal'); ?>>Normal</option>
                <option value="high" <?php selected($warranty['priority'], 'high'); ?>>Alta</option>
                <option value="urgent" <?php selected($warranty['priority'], 'urgent'); ?>>Urgente</option>
            </select>
        </div>
    </div>

    <!-- Main Info -->
    <div class="rs-detail-grid">
        <div class="rs-detail-main">
            <div class="rs-card">
                <h2>Información del Cliente</h2>
                <div class="rs-info-row">
                    <strong>Nombre:</strong> <?php echo esc_html($warranty['customer_name']); ?>
                </div>
                <div class="rs-info-row">
                    <strong>Email:</strong> <?php echo esc_html($warranty['customer_email']); ?>
                </div>
                <div class="rs-info-row">
                    <strong>Teléfono:</strong> <?php echo esc_html($warranty['customer_phone']); ?>
                </div>
            </div>

            <div class="rs-card">
                <h2>Descripción del Problema</h2>
                <p><?php echo nl2br(esc_html($warranty['description'])); ?></p>
            </div>

            <?php if (!empty($files)): ?>
            <div class="rs-card">
                <h2>Archivos Adjuntos</h2>
                <div class="rs-files-grid">
                    <?php foreach ($files as $file): ?>
                        <a href="<?php echo esc_url($file['file_url']); ?>" target="_blank" class="rs-file-item">
                            <?php if (strpos($file['mime_type'], 'image') !== false): ?>
                                <img src="<?php echo esc_url($file['file_url']); ?>" alt="<?php echo esc_attr($file['file_name']); ?>">
                            <?php else: ?>
                                <div class="rs-file-icon">📹</div>
                            <?php endif; ?>
                            <span><?php echo esc_html($file['file_name']); ?></span>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="rs-card">
                <h2>Notas Internas</h2>
                <div class="rs-notes-list">
                    <?php foreach ($notes as $note): 
                        $user = get_userdata($note['user_id']);
                        ?>
                        <div class="rs-note-item">
                            <div class="rs-note-header">
                                <strong><?php echo $user ? $user->display_name : 'Sistema'; ?></strong>
                                <span><?php echo date('d/m/Y H:i', strtotime($note['created_at'])); ?></span>
                            </div>
                            <p><?php echo nl2br(esc_html($note['note'])); ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
                <form class="rs-note-form" onsubmit="return rsWarrantyAddNote(<?php echo $warranty_id; ?>, this)">
                    <textarea name="note" placeholder="Agregar nota interna..." rows="3" required></textarea>
                    <button type="submit" class="rs-btn rs-btn-primary">Agregar Nota</button>
                </form>
            </div>
        </div>

        <div class="rs-detail-sidebar">
            <div class="rs-card">
                <h3>Estado</h3>
                <span class="rs-status-badge rs-status-<?php echo esc_attr($warranty['status']); ?>">
                    <?php echo esc_html(rs_get_warranty_status_label($warranty['status'])); ?>
                </span>
            </div>

            <div class="rs-card">
                <h3>Prioridad</h3>
                <span class="rs-priority-badge rs-priority-<?php echo esc_attr($warranty['priority']); ?>">
                    <?php echo esc_html(rs_get_warranty_priority_label($warranty['priority'])); ?>
                </span>
            </div>

            <div class="rs-card">
                <h3>Información</h3>
                <div class="rs-info-row">
                    <strong>Pedido:</strong> #<?php echo esc_html($warranty['order_id']); ?>
                </div>
                <div class="rs-info-row">
                    <strong>Producto:</strong> <?php echo esc_html($product ? $product->get_name() : 'N/A'); ?>
                </div>
                <div class="rs-info-row">
                    <strong>Días restantes:</strong> <?php echo absint($warranty['days_until_expiration']); ?>
                </div>
            </div>

            <?php if ($rma): ?>
            <div class="rs-card">
                <h3>RMA</h3>
                <div class="rs-info-row">
                    <strong>Número:</strong> <?php echo esc_html($rma['rma_number']); ?>
                </div>
                <div class="rs-info-row">
                    <strong>Estado:</strong> <?php echo esc_html($rma['status']); ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
/* Additional styles for detail-view */
.rs-header-glass {
    background: #1a1a26;
    border: 1px solid rgba(255, 140, 0, 0.2);
    border-radius: 24px;
    padding: 24px 32px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 24px;
}

.rs-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
}

.rs-back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-4px);
}

.rs-header-info {
    flex: 1;
}

.rs-warranty-number {
    font-size: 28px;
    font-weight: 800;
    color: var(--rs-orange);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 4px;
}

.rs-warranty-date {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
}

.rs-status-bar {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    gap: 24px;
}

.rs-status-group {
    display: flex;
    align-items: center;
    gap: 12px;
}

.rs-status-label {
    font-size: 14px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.rs-status-select,
.rs-priority-select {
    padding: 10px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    background: white;
    transition: all 0.3s ease;
    min-width: 150px;
}

.rs-status-select:focus,
.rs-priority-select:focus {
    outline: none;
    border-color: var(--rs-orange);
    box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.rs-detail-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
}

.rs-card {
    background: white;
    border-radius: 20px;
    padding: 28px;
    border: 1px solid #e5e7eb;
    margin-bottom: 24px;
}

.rs-card h2,
.rs-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 20px;
}

.rs-info-row {
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
}

.rs-info-row:last-child {
    border-bottom: none;
}

.rs-info-row strong {
    color: #6b7280;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.rs-files-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.rs-file-item {
    display: block;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
}

.rs-file-item:hover {
    border-color: var(--rs-orange);
    transform: scale(1.05);
}

.rs-file-item img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.rs-file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    font-size: 48px;
    background: rgba(255, 140, 0, 0.1);
}

.rs-notes-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.rs-note-item {
    padding: 16px;
    background: #f9fafb;
    border-radius: 10px;
    margin-bottom: 12px;
    border-left: 3px solid var(--rs-orange);
}

.rs-note-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
}

.rs-note-header strong {
    color: #111827;
}

.rs-note-header span {
    color: #9ca3af;
}

.rs-note-item p {
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
}

.rs-note-form textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-family: inherit;
    font-size: 14px;
    margin-bottom: 12px;
}
</style>

<script>
function rsWarrantyEdit(id) {
    window.location.href = '<?php echo admin_url('admin.php?page=rockstage-warranty&action=edit&id='); ?>' + id;
}

function rsWarrantySendEmail(id) {
    if (typeof rsShowStatusModal === 'function') {
        rsSendCustomEmail(id);
    }
}

function rsWarrantyUpdateStatus(id, status) {
    if (!confirm('¿Cambiar el estado de esta garantía?')) {
        location.reload();
        return;
    }
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_update_warranty_status',
            nonce: rsWarrantyAdmin.nonce,
            warranty_id: id,
            status: status
        },
        beforeSend: function() {
            if (typeof rsShowNotification === 'function') {
                rsShowNotification('Actualizando estado...', 'info');
            }
        },
        success: function(response) {
            if (response.success) {
                if (typeof rsShowNotification === 'function') {
                    rsShowNotification('Estado actualizado correctamente', 'success');
                }
                setTimeout(() => location.reload(), 1000);
            } else {
                alert(response.data.message || 'Error');
            }
        }
    });
}

function rsWarrantyUpdatePriority(id, priority) {
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_update_warranty_status',
            nonce: rsWarrantyAdmin.nonce,
            warranty_id: id,
            priority: priority
        },
        success: function(response) {
            if (response.success) {
                if (typeof rsShowNotification === 'function') {
                    rsShowNotification('Prioridad actualizada', 'success');
                }
            }
        }
    });
}

function rsWarrantyAddNote(id, form) {
    const note = form.note.value;
    
    if (!note || note.trim() === '') {
        alert('Por favor escribe una nota');
        return false;
    }
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_add_warranty_note',
            nonce: rsWarrantyAdmin.nonce,
            warranty_id: id,
            note: note
        },
        beforeSend: function() {
            if (typeof rsShowNotification === 'function') {
                rsShowNotification('Agregando nota...', 'info');
            }
        },
        success: function(response) {
            if (response.success) {
                if (typeof rsShowNotification === 'function') {
                    rsShowNotification('Nota agregada correctamente', 'success');
                }
                setTimeout(() => location.reload(), 1000);
            } else {
                alert(response.data.message || 'Error');
            }
        }
    });
    
    return false;
}
</script>


<?php
/**
 * Admin Dashboard Template
 * Displays warranty list with stats and filters
 */

defined('ABSPATH') || exit;

// Get admin instance
$admin = RS_Warranty_Admin::get_instance();

// Get statistics
$stats = $admin->get_dashboard_stats();

// Get filters from URL
$status_filter = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
$search = isset($_GET['s']) ? sanitize_text_field($_GET['s']) : '';
$page = isset($_GET['paged']) ? absint($_GET['paged']) : 1;

// Get warranties with filters
$filters = array();
if ($status_filter) $filters['status'] = $status_filter;
if ($search) $filters['search'] = $search;

$warranties = $admin->get_warranties_paginated($page, 20, $filters);
$total_warranties = RS_Warranty_Database::get_instance()->count_warranties($filters);
$total_pages = ceil($total_warranties / 20);
?>

<div class="wrap rs-warranty-dashboard">
    
    <!-- Header -->
    <div class="rs-header-glass">
        <div class="rs-header-content">
            <div class="rs-title-group">
                <h1>
                    <svg class="rs-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
                    </svg>
                    Dashboard de Garantías
                </h1>
                <p>Sistema de gestión completo para RockStage</p>
            </div>
            <div class="rs-header-actions">
                <button class="rs-btn rs-btn-ghost" onclick="location.reload()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M23 4v6h-6M1 20v-6h6" stroke-width="2"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke-width="2"/></svg>
                    Actualizar
                </button>
                <button class="rs-btn rs-btn-primary" onclick="rsWarrantyCreateNew()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/></svg>
                    Nueva Garantía
                </button>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="rs-stats-grid">
        <div class="rs-stat-card" onclick="rsWarrantyFilterByStatus('')">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo number_format($stats['total']); ?></div>
            <div class="rs-stat-label">Total de Garantías</div>
            <div class="rs-stat-trend">
                <span class="rs-trend-positive">↑ Sistema activo</span>
            </div>
        </div>

        <div class="rs-stat-card" onclick="rsWarrantyFilterByStatus('pending')">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-amber">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><path d="M12 8v4l3 3" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo number_format($stats['pending']); ?></div>
            <div class="rs-stat-label">Pendientes de Revisión</div>
            <div class="rs-stat-trend">
                <span class="rs-trend-neutral">Requieren atención</span>
            </div>
        </div>

        <div class="rs-stat-card" onclick="rsWarrantyFilterByStatus('processing')">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 7H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo number_format($stats['processing']); ?></div>
            <div class="rs-stat-label">En Proceso</div>
            <div class="rs-stat-trend">
                <span class="rs-trend-positive">↑ En progreso</span>
            </div>
        </div>

        <div class="rs-stat-card" onclick="rsWarrantyFilterByStatus('approved')">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-width="2"/><polyline points="22 4 12 14.01 9 11.01" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo number_format($stats['approved']); ?></div>
            <div class="rs-stat-label">Aprobadas</div>
            <div class="rs-stat-trend">
                <span class="rs-trend-positive">✓ Completadas</span>
            </div>
        </div>

        <div class="rs-stat-card" onclick="rsWarrantyFilterByStatus('rejected')">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-red">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo number_format($stats['rejected']); ?></div>
            <div class="rs-stat-label">Rechazadas</div>
            <div class="rs-stat-trend">
                <span class="rs-trend-negative">No procedieron</span>
            </div>
        </div>

        <div class="rs-stat-card">
            <div class="rs-stat-header">
                <div class="rs-stat-icon-wrapper rs-purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke-width="2"/><circle cx="8.5" cy="7" r="4" stroke-width="2"/><polyline points="17 11 19 13 23 9" stroke-width="2"/></svg>
                </div>
            </div>
            <div class="rs-stat-value"><?php echo esc_html($stats['approval_rate']); ?>%</div>
            <div class="rs-stat-label">Tasa de Aprobación</div>
            <div class="rs-stat-trend">
                <span class="<?php echo absint($stats['approval_rate']) >= 70 ? 'rs-trend-positive' : 'rs-trend-negative'; ?>">
                    <?php echo absint($stats['approval_rate']) >= 70 ? '↑ Excelente' : '↓ Revisar'; ?>
                </span>
            </div>
        </div>
    </div>

    <!-- Filters and Search -->
    <div class="rs-filters-section">
        <div class="rs-filters-left">
            <button class="rs-filter-btn <?php echo empty($status_filter) ? 'active' : ''; ?>" onclick="rsWarrantyFilterByStatus('')">
                Todas
            </button>
            <button class="rs-filter-btn <?php echo $status_filter === 'pending' ? 'active' : ''; ?>" onclick="rsWarrantyFilterByStatus('pending')">
                Pendientes
            </button>
            <button class="rs-filter-btn <?php echo $status_filter === 'processing' ? 'active' : ''; ?>" onclick="rsWarrantyFilterByStatus('processing')">
                En Proceso
            </button>
            <button class="rs-filter-btn <?php echo $status_filter === 'approved' ? 'active' : ''; ?>" onclick="rsWarrantyFilterByStatus('approved')">
                Aprobadas
            </button>
            <button class="rs-filter-btn <?php echo $status_filter === 'rejected' ? 'active' : ''; ?>" onclick="rsWarrantyFilterByStatus('rejected')">
                Rechazadas
            </button>
        </div>
        <div class="rs-filters-right">
            <form method="get" action="" class="rs-search-form">
                <input type="hidden" name="page" value="rockstage-warranty">
                <?php if ($status_filter): ?>
                    <input type="hidden" name="status" value="<?php echo esc_attr($status_filter); ?>">
                <?php endif; ?>
                <input type="text" name="s" value="<?php echo esc_attr($search); ?>" placeholder="Buscar garantías..." class="rs-search-input">
                <button type="submit" class="rs-search-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke-width="2"/></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Warranties Table -->
    <div class="rs-table-card">
        <table class="rs-warranties-table" role="table" aria-label="Lista de garantías">
            <thead>
                <tr>
                    <th scope="col">Garantía</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Prioridad</th>
                    <th scope="col">Días Restantes</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($warranties)): ?>
                    <?php foreach ($warranties as $warranty): ?>
                        <?php
                        $product = wc_get_product($warranty['product_id']);
                        $product_name = $product ? $product->get_name() : 'Producto eliminado';
                        ?>
                        <tr class="rs-warranty-row" data-id="<?php echo esc_attr($warranty['id']); ?>">
                            <td>
                                <div class="rs-warranty-number"><?php echo esc_html($warranty['warranty_number']); ?></div>
                                <div class="rs-warranty-order">#<?php echo esc_html($warranty['order_id']); ?></div>
                            </td>
                            <td>
                                <div class="rs-customer-name"><?php echo esc_html($warranty['customer_name']); ?></div>
                                <div class="rs-customer-email"><?php echo esc_html($warranty['customer_email']); ?></div>
                            </td>
                            <td>
                                <div class="rs-product-name"><?php echo esc_html($product_name); ?></div>
                            </td>
                            <td>
                                <span class="rs-status-badge rs-status-<?php echo esc_attr($warranty['status']); ?>">
                                    <?php echo esc_html(rs_get_warranty_status_label($warranty['status'])); ?>
                                </span>
                            </td>
                            <td>
                                <span class="rs-priority-badge rs-priority-<?php echo esc_attr($warranty['priority']); ?>">
                                    <?php echo esc_html(rs_get_warranty_priority_label($warranty['priority'])); ?>
                                </span>
                            </td>
                            <td>
                                <div class="rs-days-remaining">
                                    <?php echo absint($warranty['days_until_expiration']); ?> días
                                </div>
                            </td>
                            <td>
                                <div class="rs-warranty-date">
                                    <?php echo esc_html(date('d/m/Y', strtotime($warranty['created_at']))); ?>
                                </div>
                            </td>
                            <td>
                                <div class="rs-actions-group">
                                    <button class="rs-action-btn" onclick="rsWarrantyView(<?php echo absint($warranty['id']); ?>)" title="Ver detalles">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                                    </button>
                                    <button class="rs-action-btn" onclick="rsWarrantyChangeStatus(<?php echo absint($warranty['id']); ?>)" title="Cambiar estado">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/></svg>
                                    </button>
                                    <button class="rs-action-btn rs-action-delete" onclick="rsWarrantyDelete(<?php echo absint($warranty['id']); ?>)" title="Eliminar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6" stroke-width="2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="8" class="rs-no-warranties">
                            <div class="rs-empty-state">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/></svg>
                                <p>No se encontraron garantías</p>
                            </div>
                        </td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($total_pages > 1): ?>
        <div class="rs-pagination">
            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                <a href="<?php echo admin_url('admin.php?page=rockstage-warranty&paged=' . $i . ($status_filter ? '&status=' . $status_filter : '') . ($search ? '&s=' . $search : '')); ?>" 
                   class="rs-page-btn <?php echo $i === $page ? 'active' : ''; ?>">
                    <?php echo $i; ?>
                </a>
            <?php endfor; ?>
        </div>
    <?php endif; ?>

</div>

<script>
// Dashboard functions
function rsWarrantyFilterByStatus(status) {
    const url = new URL(window.location.href);
    if (status) {
        url.searchParams.set('status', status);
    } else {
        url.searchParams.delete('status');
    }
    url.searchParams.delete('paged');
    window.location.href = url.toString();
}

function rsWarrantyView(id) {
    window.location.href = '<?php echo admin_url('admin.php?page=rockstage-warranty&action=view&id='); ?>' + id;
}

function rsWarrantyChangeStatus(id) {
    // This will be handled by admin-script.js
    if (typeof window.rsShowStatusModal === 'function') {
        window.rsShowStatusModal(id);
    }
}

function rsWarrantyDelete(id) {
    if (!confirm('¿Estás seguro de eliminar esta garantía?')) {
        return;
    }
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_delete_warranty',
            nonce: rsWarrantyAdmin.nonce,
            warranty_id: id
        },
        success: function(response) {
            if (response.success) {
                location.reload();
            } else {
                alert(response.data.message || 'Error al eliminar');
            }
        }
    });
}

function rsWarrantyCreateNew() {
    window.location.href = '<?php echo admin_url('admin.php?page=rockstage-warranty&action=create'); ?>';
}
</script>

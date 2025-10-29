<?php
/**
 * Admin Settings Template
 * Configuration page with 4 tabs
 */

defined('ABSPATH') || exit;

$settings = RS_Warranty_Settings::get_instance();
$current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'general';
$updated = isset($_GET['updated']) && $_GET['updated'] === 'true';

// Get settings
$categories = $settings->get_categories();
$templates = $settings->get_templates();
$file_limits = $settings->get_file_limits();
$priority_config = $settings->get_priority_config();
$whatsapp_config = $settings->get_whatsapp_config();
?>

<div class="wrap rs-warranty-settings">
    
    <!-- Header -->
    <div class="rs-header-glass">
        <div class="rs-header-content">
            <div class="rs-title-group">
                <h1>
                    <svg class="rs-shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
                        <path d="M12 8v4M12 16h.01" stroke-width="2"/>
                    </svg>
                    Configuración del Sistema
                </h1>
                <p>Gestiona todos los aspectos del sistema de garantías</p>
            </div>
            <div class="rs-header-actions">
                <a href="<?php echo admin_url('admin.php?page=rockstage-warranty'); ?>" class="rs-btn rs-btn-ghost">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2"/></svg>
                    Volver al Dashboard
                </a>
            </div>
        </div>
    </div>

    <!-- Success Message -->
    <?php if ($updated): ?>
        <div class="rs-success-message">
            <div class="rs-success-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" stroke-width="2"/>
                </svg>
            </div>
            <div class="rs-success-text">
                <div class="rs-success-title">¡Configuración guardada!</div>
                <div class="rs-success-description">Los cambios se han aplicado correctamente.</div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Tabs Navigation -->
    <div class="rs-tabs-wrapper">
        <button class="rs-tab-btn <?php echo $current_tab === 'general' ? 'active' : ''; ?>" onclick="rsWarrantySwitchTab('general')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m-2.828 2.828l-4.243 4.243m16.97.728l-6 .001m-6 0l-6-.001m13.657-5.657l-4.243-4.243m-2.828-2.828l-4.243-4.243" stroke-width="2"/></svg>
            General
        </button>
        <button class="rs-tab-btn <?php echo $current_tab === 'categories' ? 'active' : ''; ?>" onclick="rsWarrantySwitchTab('categories')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h16" stroke-width="2"/></svg>
            Categorías
        </button>
        <button class="rs-tab-btn <?php echo $current_tab === 'templates' ? 'active' : ''; ?>" onclick="rsWarrantySwitchTab('templates')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"/></svg>
            Plantillas
        </button>
        <button class="rs-tab-btn <?php echo $current_tab === 'advanced' ? 'active' : ''; ?>" onclick="rsWarrantySwitchTab('advanced')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke-width="2"/></svg>
            Avanzado
        </button>
    </div>

    <!-- Tab: General -->
    <div id="tab-general" class="rs-tab-content <?php echo $current_tab === 'general' ? 'active' : ''; ?>">
        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
            <?php wp_nonce_field('rs_warranty_save_settings', 'rs_warranty_settings_nonce_general'); ?>
            <input type="hidden" name="action" value="rs_save_settings">
            <input type="hidden" name="section" value="general">

            <div class="rs-settings-card">
                <h2>Configuración de Email</h2>
                <div class="rs-form-grid">
                    <div class="rs-form-group">
                        <label class="rs-form-label">Email de Garantías</label>
                        <input type="email" name="warranty_email" value="<?php echo esc_attr(get_option('rs_warranty_email', 'garantias@rockstage.com')); ?>" class="rs-form-input" required>
                        <p class="rs-form-help">Email principal donde llegarán las notificaciones de nuevas garantías</p>
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">CC Adicionales</label>
                        <input type="text" name="warranty_email_cc" value="<?php echo esc_attr(get_option('rs_warranty_email_cc', '')); ?>" class="rs-form-input" placeholder="email1@domain.com, email2@domain.com">
                        <p class="rs-form-help">Emails adicionales separados por comas (opcional)</p>
                    </div>
                </div>
            </div>

            <div class="rs-settings-card">
                <h2>Configuración SMTP (Opcional)</h2>
                <div class="rs-form-group">
                    <label class="rs-checkbox-label">
                        <input type="checkbox" name="smtp_enabled" value="yes" <?php checked(get_option('rs_warranty_smtp_enabled'), 'yes'); ?>>
                        <span>Habilitar SMTP personalizado</span>
                    </label>
                </div>
                <div class="rs-form-grid" id="smtp-fields">
                    <div class="rs-form-group">
                        <label class="rs-form-label">Host SMTP</label>
                        <input type="text" name="smtp_host" value="<?php echo esc_attr(get_option('rs_warranty_smtp_host', '')); ?>" class="rs-form-input" placeholder="smtp.gmail.com">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">Puerto SMTP</label>
                        <input type="number" name="smtp_port" value="<?php echo esc_attr(get_option('rs_warranty_smtp_port', 587)); ?>" class="rs-form-input" placeholder="587">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">Usuario SMTP</label>
                        <input type="text" name="smtp_username" value="<?php echo esc_attr(get_option('rs_warranty_smtp_username', '')); ?>" class="rs-form-input">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">Contraseña SMTP</label>
                        <input type="password" name="smtp_password" value="<?php echo esc_attr(get_option('rs_warranty_smtp_password', '')); ?>" class="rs-form-input">
                    </div>
                </div>
            </div>

            <div class="rs-settings-actions">
                <button type="submit" class="rs-btn rs-btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-width="2"/><polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/><polyline points="7 3 7 8 15 8" stroke-width="2"/></svg>
                    Guardar Cambios
                </button>
            </div>
        </form>
    </div>

    <!-- Tab: Categories - DOZO SEMANTIC VERSION -->
    <div id="tab-categories" class="rs-tab-content <?php echo $current_tab === 'categories' ? 'active' : ''; ?>" role="tabpanel" aria-labelledby="tab-btn-categories">
        <!-- Card 1: Formulario de Configuración -->
        <div class="rs-card rs-card--config">
            <div class="rs-card-header">
                <div class="rs-icon-wrapper rs-icon-wrapper--primary">
                    <i class="rs-icon" data-icon="folder-cog"></i>
                </div>
                <div class="rs-card-header-content">
                    <h2 class="rs-card-title">Configurar Garantía por Categoría</h2>
                    <p class="rs-card-description">Asigna períodos de garantía específicos para cada categoría de producto</p>
                </div>
                <button type="button" class="rs-btn rs-btn--secondary rs-btn--icon" id="syncCategoriesBtn" data-action="sync-categories">
                    <i class="rs-icon" data-icon="refresh-cw"></i>
                    <span>Sincronizar con WooCommerce</span>
                </button>
            </div>

            <!-- Selector de Categoría -->
            <div class="rs-field">
                <label class="rs-field-label" for="categorySelect">
                    <i class="rs-icon rs-icon--sm" data-icon="folder"></i>
                    <span>Seleccionar Categoría</span>
                </label>
                <select id="categorySelect" class="rs-select" name="category_id">
                    <option value="">-- Selecciona una categoría --</option>
                    <?php
                    $wc_categories = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => false));
                    if (!is_wp_error($wc_categories)) {
                        foreach ($wc_categories as $wc_cat) {
                            echo '<option value="' . esc_attr($wc_cat->term_id) . '">' . esc_html($wc_cat->name) . '</option>';
                        }
                    }
                    ?>
                </select>
                <p class="rs-field-help">Elige la categoría de WooCommerce que deseas configurar</p>
            </div>

            <!-- Grid de Configuración Semántico -->
            <div class="rs-grid rs-grid--2col">
                <!-- Días -->
                <div class="rs-field">
                    <label class="rs-field-label" for="warrantyDays">
                        <i class="rs-icon rs-icon--sm" data-icon="calendar"></i>
                        <span>Días de Garantía</span>
                    </label>
                    <input type="number" id="warrantyDays" name="warranty_days" class="rs-input" value="365" min="0" max="3650" placeholder="365" aria-describedby="days-help">
                    <p class="rs-field-help" id="days-help">Cantidad de días de cobertura</p>
                </div>

                <!-- Horas -->
                <div class="rs-field">
                    <label class="rs-field-label" for="warrantyHours">
                        <i class="rs-icon rs-icon--sm" data-icon="clock"></i>
                        <span>Horas Adicionales</span>
                    </label>
                    <input type="number" id="warrantyHours" name="warranty_hours" class="rs-input" value="0" min="0" max="23" placeholder="0" aria-describedby="hours-help">
                    <p class="rs-field-help" id="hours-help">Horas extras (0-23)</p>
                </div>

                <!-- Texto personalizado -->
                <div class="rs-field">
                    <label class="rs-field-label" for="warrantyText">
                        <i class="rs-icon rs-icon--sm" data-icon="type"></i>
                        <span>Texto Amigable</span>
                    </label>
                    <input type="text" id="warrantyText" name="warranty_text" class="rs-input" value="" placeholder="Ej: 1 año de garantía" aria-describedby="text-help">
                    <p class="rs-field-help" id="text-help">Texto mostrado al cliente</p>
                </div>

                <!-- Estado -->
                <div class="rs-field">
                    <label class="rs-field-label">
                        <i class="rs-icon rs-icon--sm" data-icon="zap"></i>
                        <span>Estado</span>
                    </label>
                    <div class="rs-toggle-wrapper">
                        <div class="rs-toggle-info">
                            <div class="rs-toggle-label">Garantía Activa</div>
                            <div class="rs-toggle-description">Habilitar para esta categoría</div>
                        </div>
                        <label class="rs-toggle">
                            <input type="checkbox" id="categoryActiveToggle" checked>
                            <span class="rs-toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Preview del tiempo total (DOZO Semantic) -->
            <div class="rs-preview rs-preview--warranty">
                <div class="rs-preview-icon">
                    <i class="rs-icon" data-icon="clock"></i>
                </div>
                <div class="rs-preview-content">
                    <div class="rs-preview-label">Período Total de Garantía:</div>
                    <div class="rs-preview-value" id="totalWarrantyPreview">365 días (1 año)</div>
                </div>
            </div>

            <!-- Botones de acción semánticos -->
            <div class="rs-actions rs-actions--end">
                <button type="button" class="rs-btn rs-btn--ghost" onclick="rsClearCategoryFields()" data-action="clear">
                    <i class="rs-icon" data-icon="rotate-ccw"></i>
                    <span>Limpiar Campos</span>
                </button>
                <button type="button" class="rs-btn rs-btn--primary" id="addCategoryBtn" data-action="save-category">
                    <i class="rs-icon" data-icon="check"></i>
                    <span>Guardar Configuración</span>
                </button>
            </div>
        </div>

        <!-- Card 2: Tabla de Configuraciones (DOZO Semantic) -->
        <div class="rs-card rs-card--table">
            <div class="rs-card-header">
                <div class="rs-icon-wrapper rs-icon-wrapper--secondary">
                    <i class="rs-icon" data-icon="table"></i>
                </div>
                <div class="rs-card-header-content">
                    <h2 class="rs-card-title">Configuraciones por Categoría</h2>
                    <p class="rs-card-description">Resumen de todas las garantías configuradas</p>
                </div>
                <div class="rs-stats-inline">
                    <span class="rs-badge rs-badge--success">
                        <i class="rs-icon rs-icon--xs" data-icon="check-circle"></i>
                        <span id="activeCount">0</span> Activas
                    </span>
                    <span class="rs-badge rs-badge--error">
                        <i class="rs-icon rs-icon--xs" data-icon="x-circle"></i>
                        <span id="inactiveCount">0</span> Inactivas
                    </span>
                </div>
            </div>

            <!-- Tabla Semántica -->
            <div class="rs-table-wrapper">
                <table class="rs-table rs-table--categories" id="categoriesConfigTable">
                    <thead>
                        <tr>
                            <th>Estado</th>
                            <th>Categoría</th>
                            <th>Días</th>
                            <th>Horas</th>
                            <th>Período Total</th>
                            <th>Texto Mostrado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
                        <?php
                        $saved_categories = get_option('rs_warranty_categories', array());
                        $active_count = 0;
                        $inactive_count = 0;
                        
                        if (!empty($saved_categories)) {
                            foreach ($saved_categories as $cat_id => $config) {
                                $is_active = isset($config['active']) && $config['active'];
                                $active_count += $is_active ? 1 : 0;
                                $inactive_count += !$is_active ? 1 : 0;
                                
                                $days = isset($config['days']) ? $config['days'] : 0;
                                $hours = isset($config['hours']) ? $config['hours'] : 0;
                                $text = isset($config['text']) ? $config['text'] : '';
                                $name = isset($config['name']) ? $config['name'] : 'Categoría';
                                
                                $total_text = $days . ' días';
                                if ($hours > 0) {
                                    $total_text .= ' ' . $hours . 'h';
                                }
                                ?>
                                <tr class="category-row <?php echo $is_active ? 'active' : 'inactive'; ?>" data-category-id="<?php echo esc_attr($cat_id); ?>">
                                    <td>
                                        <span class="status-indicator <?php echo $is_active ? 'status-active' : 'status-inactive'; ?>">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <?php if ($is_active): ?>
                                                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                                    <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                <?php else: ?>
                                                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                                    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                <?php endif; ?>
                                            </svg>
                                            <?php echo $is_active ? 'Activa' : 'Inactiva'; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="category-name-cell">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="currentColor" stroke-width="2"/>
                                            </svg>
                                            <strong><?php echo esc_html($name); ?></strong>
                                        </div>
                                    </td>
                                    <td><span class="time-value"><?php echo esc_html($days); ?></span></td>
                                    <td><span class="time-value"><?php echo esc_html($hours); ?></span></td>
                                    <td>
                                        <span class="total-period">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            </svg>
                                            <?php echo esc_html($total_text); ?>
                                        </span>
                                    </td>
                                    <td><span class="friendly-text"><?php echo esc_html($text); ?></span></td>
                                    <td>
                                        <div class="rs-actions rs-actions--inline">
                                            <button type="button" class="rs-icon-button rs-icon-button--edit" title="Editar" onclick="rsEditCategory(<?php echo esc_js($cat_id); ?>)" data-action="edit" aria-label="Editar categoría">
                                                <i class="rs-icon" data-icon="edit-2"></i>
                                            </button>
                                            <button type="button" class="rs-icon-button rs-icon-button--delete" title="Eliminar" onclick="rsDeleteCategory(<?php echo esc_js($cat_id); ?>)" data-action="delete" aria-label="Eliminar categoría">
                                                <i class="rs-icon" data-icon="trash-2"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php
                            }
                        } else {
                            echo '<tr><td colspan="7" style="text-align:center; padding:40px;">No hay configuraciones. Usa el formulario arriba para agregar categorías.</td></tr>';
                        }
                        ?>
                    </tbody>
                </table>

                <!-- Footer Info Semántico -->
                <div class="rs-table-footer">
                    <div class="rs-info-item">
                        <i class="rs-icon rs-icon--sm" data-icon="info"></i>
                        <span>Las categorías inactivas no aparecerán en el formulario de garantías</span>
                    </div>
                    <div class="rs-info-item">
                        <i class="rs-icon rs-icon--sm" data-icon="zap"></i>
                        <span>El período se calcula automáticamente: (días × 24h) + horas adicionales</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Bar Semántico -->
        <div class="rs-action-bar">
            <div class="rs-action-bar-info">
                <div class="rs-icon-wrapper rs-icon-wrapper--success">
                    <i class="rs-icon" data-icon="check-circle-2"></i>
                </div>
                <div class="rs-action-bar-text">
                    <strong id="totalConfigCount"><?php echo count($saved_categories); ?> configuraciones</strong> 
                    <span class="rs-text-muted">· <span id="activeCount2"><?php echo $active_count; ?></span> activas, <span id="inactiveCount2"><?php echo $inactive_count; ?></span> inactivas</span>
                </div>
            </div>
            <div class="rs-actions rs-actions--gap">
                <button type="button" class="rs-btn rs-btn--secondary" onclick="rsRestoreDefaults()" data-action="restore">
                    <i class="rs-icon" data-icon="rotate-ccw"></i>
                    <span>Restaurar Predeterminadas</span>
                </button>
                <button type="button" class="rs-btn rs-btn--primary" onclick="rsSaveAllCategories()" data-action="save-all">
                    <i class="rs-icon" data-icon="save"></i>
                    <span>Guardar Todas las Categorías</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Tab: Templates -->
    <div id="tab-templates" class="rs-tab-content <?php echo $current_tab === 'templates' ? 'active' : ''; ?>">
        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
            <?php wp_nonce_field('rs_warranty_save_settings', 'rs_warranty_settings_nonce_templates'); ?>
            <input type="hidden" name="action" value="rs_save_settings">
            <input type="hidden" name="section" value="templates">

            <div class="rs-settings-card">
                <h2>Plantillas de Respuesta</h2>
                <p class="rs-card-description">Configure plantillas predefinidas para responder rápidamente a los clientes. Usa variables como {nombre}, {garantia_id}, {producto}.</p>
                
                <?php if (!empty($templates)): ?>
                    <?php foreach ($templates as $template_id => $template): ?>
                        <div class="rs-template-section">
                            <h3><?php echo esc_html($template['name']); ?></h3>
                            <input type="hidden" name="templates[<?php echo $template_id; ?>][name]" value="<?php echo esc_attr($template['name']); ?>">
                            <div class="rs-form-group">
                                <label class="rs-form-label">Asunto del Email</label>
                                <input type="text" name="templates[<?php echo $template_id; ?>][subject]" value="<?php echo esc_attr($template['subject']); ?>" class="rs-form-input">
                            </div>
                            <div class="rs-form-group">
                                <label class="rs-form-label">Mensaje</label>
                                <textarea name="templates[<?php echo $template_id; ?>][message]" rows="6" class="rs-form-textarea"><?php echo esc_textarea($template['message']); ?></textarea>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <div class="rs-settings-actions">
                <button type="submit" class="rs-btn rs-btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-width="2"/><polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/><polyline points="7 3 7 8 15 8" stroke-width="2"/></svg>
                    Guardar Plantillas
                </button>
            </div>
        </form>
    </div>

    <!-- Tab: Advanced -->
    <div id="tab-advanced" class="rs-tab-content <?php echo $current_tab === 'advanced' ? 'active' : ''; ?>">
        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
            <?php wp_nonce_field('rs_warranty_save_settings', 'rs_warranty_settings_nonce_advanced'); ?>
            <input type="hidden" name="action" value="rs_save_settings">
            <input type="hidden" name="section" value="advanced">

            <div class="rs-settings-card">
                <h2>Sistema RMA</h2>
                <div class="rs-form-group">
                    <label class="rs-checkbox-label">
                        <input type="checkbox" name="rma_enabled" value="yes" <?php checked(get_option('rs_warranty_rma_enabled'), 'yes'); ?>>
                        <span>Habilitar sistema RMA automático</span>
                    </label>
                </div>
                <div class="rs-form-grid">
                    <div class="rs-form-group">
                        <label class="rs-form-label">Prefijo RMA</label>
                        <input type="text" name="rma_prefix" value="<?php echo esc_attr(get_option('rs_warranty_rma_prefix', 'RMA-RS')); ?>" class="rs-form-input">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-checkbox-label">
                            <input type="checkbox" name="rma_tracking_enabled" value="yes" <?php checked(get_option('rs_warranty_rma_tracking_enabled'), 'yes'); ?>>
                            <span>Habilitar tracking de envíos</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="rs-settings-card">
                <h2>WhatsApp</h2>
                <div class="rs-form-group">
                    <label class="rs-checkbox-label">
                        <input type="checkbox" name="whatsapp_enabled" value="yes" <?php checked($whatsapp_config['enabled'], 'yes'); ?>>
                        <span>Mostrar botón de WhatsApp en el formulario</span>
                    </label>
                </div>
                <div class="rs-form-grid">
                    <div class="rs-form-group">
                        <label class="rs-form-label">Número de WhatsApp</label>
                        <input type="text" name="whatsapp_number" value="<?php echo esc_attr($whatsapp_config['number']); ?>" class="rs-form-input" placeholder="+5255123456789">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">Mensaje predeterminado</label>
                        <input type="text" name="whatsapp_message" value="<?php echo esc_attr($whatsapp_config['message']); ?>" class="rs-form-input" placeholder="Hola, mi número de garantía es {garantia_id}">
                    </div>
                </div>
            </div>

            <div class="rs-settings-card">
                <h2>Límites de Archivos</h2>
                <div class="rs-form-grid">
                    <div class="rs-form-group">
                        <label class="rs-form-label">Máximo de fotos</label>
                        <input type="number" name="max_photos" value="<?php echo esc_attr($file_limits['max_photos']); ?>" class="rs-form-input" min="1" max="10">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-form-label">Tamaño máximo de foto (MB)</label>
                        <input type="number" name="max_photo_size" value="<?php echo esc_attr($file_limits['max_photo_size']); ?>" class="rs-form-input" min="1" max="50">
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-checkbox-label">
                            <input type="checkbox" name="require_photo" value="yes" <?php checked($file_limits['require_photo'], 'yes'); ?>>
                            <span>Requerir al menos una foto</span>
                        </label>
                    </div>
                    <div class="rs-form-group">
                        <label class="rs-checkbox-label">
                            <input type="checkbox" name="allow_video" value="yes" <?php checked($file_limits['allow_video'], 'yes'); ?>>
                            <span>Permitir videos</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- DOZO v4.9: Diagnostic Panel -->
            <div class="rs-settings-card" style="background: linear-gradient(135deg, rgba(255,140,0,0.05), rgba(255,140,0,0.1)); border-color: #FF8C00;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FF8C00, #cc7000); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                    </div>
                    <div>
                        <h2 style="margin: 0;">🧠 Autodiagnóstico DOZO</h2>
                        <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Sistema inteligente de verificación y reparación automática</p>
                    </div>
                </div>
                
                <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                    Ejecuta una verificación completa del sistema, limpia archivos obsoletos (.bak, .old, .tmp), 
                    valida la integridad del backend PHP, y repara automáticamente inconsistencias menores.
                </p>
                
                <div style="display: grid; gap: 12px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 8px; border-left: 3px solid #10b981;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span style="color: #374151; font-size: 14px;"><strong>Validación:</strong> Nonces, AJAX, contadores, race conditions</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 8px; border-left: 3px solid #3b82f6;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span style="color: #374151; font-size: 14px;"><strong>Reaper:</strong> Limpieza de archivos obsoletos con backup</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-radius: 8px; border-left: 3px solid #f59e0b;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="M12 8v4"/>
                            <path d="M12 16h.01"/>
                        </svg>
                        <span style="color: #374151; font-size: 14px;"><strong>Self-Healing:</strong> Reinyección automática de fixes perdidos</span>
                    </div>
                </div>
                
                <button type="button" id="runDozoDiagnostic" class="rs-btn rs-btn-primary" style="width: 100%;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    Ejecutar Autodiagnóstico Completo
                </button>
                
                <pre id="dozoDiagnosticOutput" class="rs-console" style="display: none; margin-top: 20px; padding: 20px; background: #1e293b; color: #e2e8f0; border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6; max-height: 400px; overflow-y: auto; white-space: pre-wrap;"></pre>
            </div>

            <div class="rs-settings-actions">
                <button type="submit" class="rs-btn rs-btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-width="2"/><polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/><polyline points="7 3 7 8 15 8" stroke-width="2"/></svg>
                    Guardar Configuración Avanzada
                </button>
            </div>
        </form>
    </div>

</div>

<script>
function rsWarrantySwitchTab(tab) {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.location.href = url.toString();
}

// ==========================================
// CATEGORY CONFIG JAVASCRIPT (DOZO Compliant)
// ==========================================

jQuery(document).ready(function($) {
    // DOZO v4.9: Diagnostic button handler
    $('#runDozoDiagnostic').on('click', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const $output = $('#dozoDiagnosticOutput');
        
        $btn.prop('disabled', true).html('<svg class="rs-spinner" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg> Ejecutando...');
        $output.show().text('🧩 DOZO v4.9 - Iniciando diagnóstico completo...\n');
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'rs_run_dozo_diagnostic',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    $output.append('\n' + response.data.message + '\n\n✅ Diagnóstico completado exitosamente');
                    
                    // También ejecutar diagnóstico JavaScript
                    setTimeout(function() {
                        $output.append('\n\n📡 Ejecutando diagnóstico JavaScript...\n');
                        if (typeof window.dozoTest === 'function') {
                            window.dozoTest();
                            $output.append('✅ Revisa la consola (F12) para ver resultados detallados');
                        }
                    }, 500);
                } else {
                    $output.append('\n❌ Error: ' + (response.data.message || 'Error desconocido'));
                }
            },
            error: function(xhr, status, error) {
                $output.append('\n❌ Error de conexión: ' + error);
            },
            complete: function() {
                $btn.prop('disabled', false).html('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Ejecutar Autodiagnóstico Completo');
            }
        });
    });
    
    // Update preview del tiempo total
    $('#warrantyDays, #warrantyHours').on('input', updateWarrantyPreview);
    
    function updateWarrantyPreview() {
        const days = parseInt($('#warrantyDays').val()) || 0;
        const hours = parseInt($('#warrantyHours').val()) || 0;
        
        let text = '';
        if (days > 0) text += `${days} día${days !== 1 ? 's' : ''}`;
        if (hours > 0) text += ` ${hours}h`;
        
        // Agregar conversión amigable
        if (days >= 365) {
            const years = Math.floor(days / 365);
            text += ` (${years} año${years !== 1 ? 's' : ''})`;
        } else if (days >= 30) {
            const months = Math.floor(days / 30);
            text += ` (${months} mes${months !== 1 ? 'es' : ''})`;
        }
        
        $('#totalWarrantyPreview').text(text || '0 días');
    }
    
    // Toggle switch functionality
    $('.toggle-switch').on('click', function() {
        $(this).toggleClass('active');
    });
    
    // Sync Categories Button
    $('#syncCategoriesBtn').on('click', function() {
        const btn = $(this);
        btn.prop('disabled', true).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg> Sincronizando...');
        
        $.ajax({
            url: rsWarrantyAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rs_sync_categories',
                nonce: rsWarrantyAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    rsShowNotification('Categorías sincronizadas correctamente', 'success');
                    location.reload();
                } else {
                    rsShowNotification(response.data.message || 'Error al sincronizar', 'error');
                }
            },
            error: function() {
                rsShowNotification('Error de conexión', 'error');
            },
            complete: function() {
                btn.prop('disabled', false).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C13.6569 21 15 16.9706 15 12C15 7.02944 13.6569 3 12 3M12 21C10.3431 21 9 16.9706 9 12C9 7.02944 10.3431 3 12 3M3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" stroke-width="2"/></svg> Sincronizar con WooCommerce');
            }
        });
    });
    
    // Add Category Button
    $('#addCategoryBtn').on('click', function() {
        const categoryId = $('#categorySelect').val();
        const categoryName = $('#categorySelect option:selected').text();
        const days = parseInt($('#warrantyDays').val()) || 0;
        const hours = parseInt($('#warrantyHours').val()) || 0;
        const text = $('#warrantyText').val() || '';
        const active = $('#categoryActiveToggle').hasClass('active');
        
        if (!categoryId) {
            rsShowNotification('Por favor selecciona una categoría', 'error');
            return;
        }
        
        const btn = $(this);
        btn.prop('disabled', true).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg> Guardando...');
        
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
                    rsShowNotification('Configuración guardada correctamente', 'success');
                    location.reload();
                } else {
                    rsShowNotification(response.data.message || 'Error al guardar', 'error');
                }
            },
            error: function() {
                rsShowNotification('Error de conexión', 'error');
            },
            complete: function() {
                btn.prop('disabled', false).html('<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Guardar Configuración');
            }
        });
    });
    
    // Initial preview update
    updateWarrantyPreview();
});

// Clear Category Fields
function rsClearCategoryFields() {
    jQuery('#categorySelect').val('');
    jQuery('#warrantyDays').val('365');
    jQuery('#warrantyHours').val('0');
    jQuery('#warrantyText').val('');
    jQuery('#categoryActiveToggle').addClass('active');
    jQuery('#totalWarrantyPreview').text('365 días (1 año)');
}

// Edit Category
function rsEditCategory(categoryId) {
    // Load category data into form
    const row = jQuery(`tr[data-category-id="${categoryId}"]`);
    if (!row.length) return;
    
    const name = row.find('.category-name-cell strong').text();
    const days = parseInt(row.find('.time-value').eq(0).text()) || 0;
    const hours = parseInt(row.find('.time-value').eq(1).text()) || 0;
    const text = row.find('.friendly-text').text() || '';
    const active = row.hasClass('active');
    
    // Populate form
    jQuery('#categorySelect').val(categoryId);
    jQuery('#warrantyDays').val(days);
    jQuery('#warrantyHours').val(hours);
    jQuery('#warrantyText').val(text);
    if (active) {
        jQuery('#categoryActiveToggle').addClass('active');
    } else {
        jQuery('#categoryActiveToggle').removeClass('active');
    }
    
    // Scroll to form
    jQuery('html, body').animate({
        scrollTop: jQuery('.settings-card').first().offset().top - 100
    }, 500);
    
    rsShowNotification('Editando categoría: ' + name, 'info');
}

// Delete Category
function rsDeleteCategory(categoryId) {
    if (!confirm('¿Estás seguro de eliminar esta configuración de garantía?')) {
        return;
    }
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_delete_category',
            nonce: rsWarrantyAdmin.nonce,
            category_id: categoryId
        },
        success: function(response) {
            if (response.success) {
                rsShowNotification('Configuración eliminada', 'success');
                location.reload();
            } else {
                rsShowNotification(response.data.message || 'Error al eliminar', 'error');
            }
        },
        error: function() {
            rsShowNotification('Error de conexión', 'error');
        }
    });
}

// Restore Defaults
function rsRestoreDefaults() {
    if (!confirm('¿Restaurar configuraciones predeterminadas? Se perderán todas las personalizaciones.')) {
        return;
    }
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_restore_default_categories',
            nonce: rsWarrantyAdmin.nonce
        },
        success: function(response) {
            if (response.success) {
                rsShowNotification('Configuraciones restauradas', 'success');
                location.reload();
            } else {
                rsShowNotification(response.data.message || 'Error al restaurar', 'error');
            }
        },
        error: function() {
            rsShowNotification('Error de conexión', 'error');
        }
    });
}

// Save All Categories (batch update)
function rsSaveAllCategories() {
    rsShowNotification('Guardando todas las configuraciones...', 'info');
    
    const categories = {};
    jQuery('#categoriesConfigTable tbody tr').each(function() {
        const row = jQuery(this);
        const catId = row.data('category-id');
        if (catId) {
            categories[catId] = {
                name: row.find('.category-name-cell strong').text(),
                days: parseInt(row.find('.time-value').eq(0).text()) || 0,
                hours: parseInt(row.find('.time-value').eq(1).text()) || 0,
                text: row.find('.friendly-text').text() || '',
                active: row.hasClass('active')
            };
        }
    });
    
    jQuery.ajax({
        url: rsWarrantyAdmin.ajaxUrl,
        type: 'POST',
        data: {
            action: 'rs_save_all_categories',
            nonce: rsWarrantyAdmin.nonce,
            categories: categories
        },
        success: function(response) {
            if (response.success) {
                rsShowNotification('Todas las configuraciones guardadas', 'success');
            } else {
                rsShowNotification(response.data.message || 'Error al guardar', 'error');
            }
        },
        error: function() {
            rsShowNotification('Error de conexión', 'error');
        }
    });
}
</script>


<?php
/**
 * RockStage Warranty System - Database Class
 * 
 * Gestiona las 4 tablas de la base de datos:
 * 1. wp_rs_warranties - Garantías principales
 * 2. wp_rs_warranty_files - Archivos (fotos/videos)
 * 3. wp_rs_warranty_notes - Notas internas
 * 4. wp_rs_warranty_rma - Sistema RMA
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase singleton para gestionar la base de datos
 */
class RS_Warranty_Database {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Database
     */
    private static $instance = null;
    
    /**
     * Objeto global de WordPress Database
     * 
     * @var wpdb
     */
    private $wpdb;
    
    /**
     * Nombres de las tablas
     * 
     * @var array
     */
    private $tables;
    
    /**
     * Versión de la base de datos
     * 
     * @var string
     */
    private $db_version = '1.0.0';
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        
        // Definir nombres de tablas
        $this->tables = array(
            'warranties' => $wpdb->prefix . 'rs_warranties',
            'files' => $wpdb->prefix . 'rs_warranty_files',
            'notes' => $wpdb->prefix . 'rs_warranty_notes',
            'rma' => $wpdb->prefix . 'rs_warranty_rma'
        );
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Database
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CREAR TABLAS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Crear todas las tablas del plugin
     */
    public function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $charset_collate = $this->wpdb->get_charset_collate();
        
        // Tabla 1: Garantías principales
        $sql_warranties = "CREATE TABLE {$this->tables['warranties']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            order_id bigint(20) unsigned NOT NULL,
            product_id bigint(20) unsigned NOT NULL,
            customer_id bigint(20) unsigned NOT NULL,
            customer_name varchar(255) NOT NULL,
            customer_email varchar(255) NOT NULL,
            customer_phone varchar(50) DEFAULT NULL,
            warranty_number varchar(50) NOT NULL,
            description text NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'pending',
            priority varchar(50) NOT NULL DEFAULT 'normal',
            purchase_date datetime NOT NULL,
            warranty_expiration datetime NOT NULL,
            days_until_expiration int(11) DEFAULT 0,
            resolution text DEFAULT NULL,
            resolved_by bigint(20) unsigned DEFAULT NULL,
            resolved_at datetime DEFAULT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY product_id (product_id),
            KEY customer_id (customer_id),
            KEY status (status),
            KEY priority (priority),
            KEY warranty_number (warranty_number),
            KEY warranty_expiration (warranty_expiration)
        ) $charset_collate;";
        
        // Tabla 2: Archivos (fotos y videos)
        $sql_files = "CREATE TABLE {$this->tables['files']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            warranty_id bigint(20) unsigned NOT NULL,
            file_type varchar(50) NOT NULL,
            file_name varchar(255) NOT NULL,
            file_path varchar(500) NOT NULL,
            file_url varchar(500) NOT NULL,
            file_size bigint(20) unsigned NOT NULL,
            mime_type varchar(100) NOT NULL,
            uploaded_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY warranty_id (warranty_id),
            KEY file_type (file_type)
        ) $charset_collate;";
        
        // Tabla 3: Notas internas
        $sql_notes = "CREATE TABLE {$this->tables['notes']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            warranty_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            note text NOT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY warranty_id (warranty_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        // Tabla 4: Sistema RMA
        $sql_rma = "CREATE TABLE {$this->tables['rma']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            warranty_id bigint(20) unsigned NOT NULL,
            rma_number varchar(50) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'generated',
            tracking_number varchar(100) DEFAULT NULL,
            shipped_at datetime DEFAULT NULL,
            received_at datetime DEFAULT NULL,
            completed_at datetime DEFAULT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY (id),
            KEY warranty_id (warranty_id),
            KEY rma_number (rma_number),
            KEY status (status)
        ) $charset_collate;";
        
        // Ejecutar creación de tablas
        dbDelta($sql_warranties);
        dbDelta($sql_files);
        dbDelta($sql_notes);
        dbDelta($sql_rma);
        
        // Guardar versión de la base de datos
        update_option('rs_warranty_db_version', $this->db_version);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CRUD GARANTÍAS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Crear nueva garantía
     */
    public function create_warranty($data) {
        $current_time = current_time('mysql');
        
        $defaults = array(
            'order_id' => 0,
            'product_id' => 0,
            'customer_id' => 0,
            'customer_name' => '',
            'customer_email' => '',
            'customer_phone' => '',
            'warranty_number' => $this->generate_warranty_number(),
            'description' => '',
            'status' => 'pending',
            'priority' => 'normal',
            'purchase_date' => $current_time,
            'warranty_expiration' => $current_time,
            'days_until_expiration' => 0,
            'created_at' => $current_time,
            'updated_at' => $current_time
        );
        
        $data = wp_parse_args($data, $defaults);
        
        $result = $this->wpdb->insert(
            $this->tables['warranties'],
            $data,
            array(
                '%d', '%d', '%d', '%s', '%s', '%s', '%s',
                '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s'
            )
        );
        
        if ($result) {
            return $this->wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Obtener garantía por ID
     */
    public function get_warranty($id) {
        return $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->tables['warranties']} WHERE id = %d",
                $id
            ),
            ARRAY_A
        );
    }
    
    /**
     * Obtener garantía por número
     */
    public function get_warranty_by_number($warranty_number) {
        return $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->tables['warranties']} WHERE warranty_number = %s",
                $warranty_number
            ),
            ARRAY_A
        );
    }
    
    /**
     * Listar garantías con filtros y paginación
     */
    public function get_warranties($args = array()) {
        $defaults = array(
            'status' => '',
            'priority' => '',
            'customer_email' => '',
            'order_id' => 0,
            'search' => '',
            'orderby' => 'created_at',
            'order' => 'DESC',
            'limit' => 20,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $where = array('1=1');
        $params = array();
        
        if (!empty($args['status'])) {
            $where[] = 'status = %s';
            $params[] = $args['status'];
        }
        
        if (!empty($args['priority'])) {
            $where[] = 'priority = %s';
            $params[] = $args['priority'];
        }
        
        if (!empty($args['customer_email'])) {
            $where[] = 'customer_email = %s';
            $params[] = $args['customer_email'];
        }
        
        if (!empty($args['order_id'])) {
            $where[] = 'order_id = %d';
            $params[] = $args['order_id'];
        }
        
        if (!empty($args['search'])) {
            $where[] = '(warranty_number LIKE %s OR customer_name LIKE %s OR customer_email LIKE %s OR description LIKE %s)';
            $search_term = '%' . $this->wpdb->esc_like($args['search']) . '%';
            $params[] = $search_term;
            $params[] = $search_term;
            $params[] = $search_term;
            $params[] = $search_term;
        }
        
        $where_clause = implode(' AND ', $where);
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        if (!$orderby) {
            $orderby = 'created_at DESC';
        }
        
        $query = "SELECT * FROM {$this->tables['warranties']} 
                  WHERE {$where_clause} 
                  ORDER BY {$orderby} 
                  LIMIT %d OFFSET %d";
        
        $params[] = $args['limit'];
        $params[] = $args['offset'];
        
        if (!empty($params)) {
            $query = $this->wpdb->prepare($query, $params);
        }
        
        return $this->wpdb->get_results($query, ARRAY_A);
    }
    
    /**
     * Actualizar garantía
     */
    public function update_warranty($id, $data) {
        $data['updated_at'] = current_time('mysql');
        
        $result = $this->wpdb->update(
            $this->tables['warranties'],
            $data,
            array('id' => $id),
            null,
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Eliminar garantía
     */
    public function delete_warranty($id) {
        // Eliminar archivos asociados
        $this->delete_warranty_files($id);
        
        // Eliminar notas asociadas
        $this->wpdb->delete(
            $this->tables['notes'],
            array('warranty_id' => $id),
            array('%d')
        );
        
        // Eliminar RMA asociado
        $this->wpdb->delete(
            $this->tables['rma'],
            array('warranty_id' => $id),
            array('%d')
        );
        
        // Eliminar garantía
        return $this->wpdb->delete(
            $this->tables['warranties'],
            array('id' => $id),
            array('%d')
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * ARCHIVOS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Guardar archivo
     */
    public function save_file($data) {
        $defaults = array(
            'warranty_id' => 0,
            'file_type' => '',
            'file_name' => '',
            'file_path' => '',
            'file_url' => '',
            'file_size' => 0,
            'mime_type' => '',
            'uploaded_at' => current_time('mysql')
        );
        
        $data = wp_parse_args($data, $defaults);
        
        $result = $this->wpdb->insert(
            $this->tables['files'],
            $data,
            array('%d', '%s', '%s', '%s', '%s', '%d', '%s', '%s')
        );
        
        if ($result) {
            return $this->wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Obtener archivos de una garantía
     */
    public function get_warranty_files($warranty_id) {
        return $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->tables['files']} WHERE warranty_id = %d ORDER BY uploaded_at ASC",
                $warranty_id
            ),
            ARRAY_A
        );
    }
    
    /**
     * Eliminar archivos de una garantía
     */
    public function delete_warranty_files($warranty_id) {
        // Obtener archivos para eliminarlos físicamente
        $files = $this->get_warranty_files($warranty_id);
        
        foreach ($files as $file) {
            if (file_exists($file['file_path'])) {
                unlink($file['file_path']);
            }
        }
        
        // Eliminar registros de la base de datos
        return $this->wpdb->delete(
            $this->tables['files'],
            array('warranty_id' => $warranty_id),
            array('%d')
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * NOTAS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Agregar nota
     */
    public function add_note($warranty_id, $note, $user_id = 0) {
        if (empty($user_id)) {
            $user_id = get_current_user_id();
        }
        
        return $this->wpdb->insert(
            $this->tables['notes'],
            array(
                'warranty_id' => $warranty_id,
                'user_id' => $user_id,
                'note' => $note,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%d', '%s', '%s')
        );
    }
    
    /**
     * Obtener notas de una garantía
     */
    public function get_warranty_notes($warranty_id) {
        return $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->tables['notes']} WHERE warranty_id = %d ORDER BY created_at DESC",
                $warranty_id
            ),
            ARRAY_A
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * RMA
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Crear RMA
     */
    public function create_rma($warranty_id, $rma_number = '') {
        if (empty($rma_number)) {
            $rma_number = $this->generate_rma_number();
        }
        
        $current_time = current_time('mysql');
        
        $result = $this->wpdb->insert(
            $this->tables['rma'],
            array(
                'warranty_id' => $warranty_id,
                'rma_number' => $rma_number,
                'status' => 'generated',
                'created_at' => $current_time,
                'updated_at' => $current_time
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );
        
        if ($result) {
            return $this->wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Obtener RMA por warranty_id
     */
    public function get_rma_by_warranty($warranty_id) {
        return $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->tables['rma']} WHERE warranty_id = %d",
                $warranty_id
            ),
            ARRAY_A
        );
    }
    
    /**
     * Actualizar RMA
     */
    public function update_rma($id, $data) {
        $data['updated_at'] = current_time('mysql');
        
        return $this->wpdb->update(
            $this->tables['rma'],
            $data,
            array('id' => $id),
            null,
            array('%d')
        );
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Generar número de garantía único
     */
    private function generate_warranty_number() {
        $prefix = 'GAR-RS';
        $number = date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        return $prefix . '-' . $number;
    }
    
    /**
     * Generar número RMA único
     */
    private function generate_rma_number() {
        $prefix = get_option('rs_warranty_rma_prefix', 'RMA-RS');
        $number = date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        return $prefix . '-' . $number;
    }
    
    /**
     * Obtener estadísticas del dashboard
     */
    public function get_stats() {
        $stats = array();
        
        $stats['total'] = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->tables['warranties']}"
        );
        
        $stats['pending'] = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->tables['warranties']} WHERE status = 'pending'"
        );
        
        $stats['processing'] = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->tables['warranties']} WHERE status = 'processing'"
        );
        
        $stats['approved'] = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->tables['warranties']} WHERE status = 'approved'"
        );
        
        $stats['rejected'] = $this->wpdb->get_var(
            "SELECT COUNT(*) FROM {$this->tables['warranties']} WHERE status = 'rejected'"
        );
        
        // Tasa de aprobación
        if ($stats['total'] > 0) {
            $stats['approval_rate'] = round(($stats['approved'] / $stats['total']) * 100, 1);
        } else {
            $stats['approval_rate'] = 0;
        }
        
        return $stats;
    }
    
    /**
     * Contar garantías
     */
    public function count_warranties($args = array()) {
        $where = array('1=1');
        $params = array();
        
        if (!empty($args['status'])) {
            $where[] = 'status = %s';
            $params[] = $args['status'];
        }
        
        if (!empty($args['priority'])) {
            $where[] = 'priority = %s';
            $params[] = $args['priority'];
        }
        
        $where_clause = implode(' AND ', $where);
        
        $query = "SELECT COUNT(*) FROM {$this->tables['warranties']} WHERE {$where_clause}";
        
        if (!empty($params)) {
            $query = $this->wpdb->prepare($query, $params);
        }
        
        return (int) $this->wpdb->get_var($query);
    }
}


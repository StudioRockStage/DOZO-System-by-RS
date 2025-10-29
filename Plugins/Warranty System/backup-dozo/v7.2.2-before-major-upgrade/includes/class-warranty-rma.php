<?php
/**
 * RockStage Warranty System - RMA Class
 * 
 * Gestiona el sistema RMA (Return Merchandise Authorization):
 * - Generación automática de números RMA
 * - Estados del proceso RMA
 * - Tracking de envíos
 * - Historial completo
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase singleton para gestionar RMA
 */
class RS_Warranty_RMA {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_RMA
     */
    private static $instance = null;
    
    /**
     * Instancia de la base de datos
     * 
     * @var RS_Warranty_Database
     */
    private $db;
    
    /**
     * Prefijo para números RMA
     * 
     * @var string
     */
    private $rma_prefix;
    
    /**
     * Estados RMA disponibles
     * 
     * @var array
     */
    private $rma_statuses;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->db = RS_Warranty_Database::get_instance();
        $this->rma_prefix = get_option('rs_warranty_rma_prefix', 'RMA-RS');
        $this->load_rma_statuses();
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_RMA
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CARGAR CONFIGURACIÓN
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Cargar estados RMA desde configuración
     */
    private function load_rma_statuses() {
        $default_statuses = array(
            'generated' => array(
                'label' => 'RMA Generado',
                'description' => 'El número RMA ha sido generado',
                'color' => '#3b82f6',
                'order' => 1
            ),
            'product_received' => array(
                'label' => 'Producto Recibido',
                'description' => 'Hemos recibido tu producto',
                'color' => '#8b5cf6',
                'order' => 2
            ),
            'under_review' => array(
                'label' => 'En Revisión',
                'description' => 'Estamos revisando tu producto',
                'color' => '#f59e0b',
                'order' => 3
            ),
            'in_repair' => array(
                'label' => 'En Reparación',
                'description' => 'Tu producto está siendo reparado',
                'color' => '#06b6d4',
                'order' => 4
            ),
            'shipped_back' => array(
                'label' => 'Enviado de Regreso',
                'description' => 'Tu producto ha sido enviado de vuelta',
                'color' => '#10b981',
                'order' => 5
            ),
            'completed' => array(
                'label' => 'Completado',
                'description' => 'Proceso RMA completado',
                'color' => '#6b7280',
                'order' => 6
            )
        );
        
        $this->rma_statuses = get_option('rs_warranty_rma_statuses', $default_statuses);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CREAR Y GESTIONAR RMA
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Crear RMA automáticamente para una garantía
     */
    public function create_rma($warranty_id) {
        // Verificar si RMA está habilitado
        if (get_option('rs_warranty_rma_enabled') !== 'yes') {
            return false;
        }
        
        // Verificar si ya existe RMA para esta garantía
        $existing_rma = $this->db->get_rma_by_warranty($warranty_id);
        if ($existing_rma) {
            return $existing_rma['id'];
        }
        
        // Generar número RMA
        $rma_number = $this->generate_rma_number();
        
        // Crear RMA en la base de datos
        $rma_id = $this->db->create_rma($warranty_id, $rma_number);
        
        if ($rma_id) {
            // Agregar nota a la garantía
            $this->db->add_note(
                $warranty_id,
                'RMA generado automáticamente: ' . $rma_number,
                0
            );
            
            // Hook para extensiones
            do_action('rs_warranty_rma_created', $rma_id, $warranty_id, $rma_number);
            
            return $rma_id;
        }
        
        return false;
    }
    
    /**
     * Actualizar estado de RMA
     */
    public function update_rma_status($rma_id, $new_status, $notes = '') {
        // Verificar que el estado existe
        if (!isset($this->rma_statuses[$new_status])) {
            return false;
        }
        
        $data = array(
            'status' => $new_status
        );
        
        // Actualizar fechas específicas según el estado
        switch ($new_status) {
            case 'product_received':
                $data['received_at'] = current_time('mysql');
                break;
            case 'shipped_back':
                $data['shipped_at'] = current_time('mysql');
                break;
            case 'completed':
                $data['completed_at'] = current_time('mysql');
                break;
        }
        
        $result = $this->db->update_rma($rma_id, $data);
        
        if ($result) {
            // Obtener RMA actualizado
            $rma = $this->get_rma($rma_id);
            
            // Agregar nota a la garantía
            $status_label = $this->rma_statuses[$new_status]['label'];
            $note_text = 'Estado RMA actualizado a: ' . $status_label;
            
            if (!empty($notes)) {
                $note_text .= ' - ' . $notes;
            }
            
            $this->db->add_note($rma['warranty_id'], $note_text, get_current_user_id());
            
            // Hook para extensiones
            do_action('rs_warranty_rma_status_updated', $rma_id, $new_status, $rma);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Agregar número de tracking al RMA
     */
    public function add_tracking_number($rma_id, $tracking_number) {
        $data = array(
            'tracking_number' => sanitize_text_field($tracking_number)
        );
        
        $result = $this->db->update_rma($rma_id, $data);
        
        if ($result) {
            // Obtener RMA
            $rma = $this->get_rma($rma_id);
            
            // Agregar nota
            $this->db->add_note(
                $rma['warranty_id'],
                'Número de tracking agregado: ' . $tracking_number,
                get_current_user_id()
            );
            
            // Hook para extensiones
            do_action('rs_warranty_rma_tracking_added', $rma_id, $tracking_number, $rma);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * OBTENER INFORMACIÓN RMA
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Obtener RMA por ID
     */
    public function get_rma($rma_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'rs_warranty_rma';
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $rma_id),
            ARRAY_A
        );
    }
    
    /**
     * Obtener RMA por warranty_id
     */
    public function get_rma_by_warranty($warranty_id) {
        return $this->db->get_rma_by_warranty($warranty_id);
    }
    
    /**
     * Obtener RMA por número
     */
    public function get_rma_by_number($rma_number) {
        global $wpdb;
        $table = $wpdb->prefix . 'rs_warranty_rma';
        
        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table} WHERE rma_number = %s", $rma_number),
            ARRAY_A
        );
    }
    
    /**
     * Obtener historial completo del RMA
     */
    public function get_rma_history($rma_id) {
        $rma = $this->get_rma($rma_id);
        
        if (!$rma) {
            return array();
        }
        
        $history = array();
        
        // Estado 1: Generado
        if (!empty($rma['created_at'])) {
            $history[] = array(
                'status' => 'generated',
                'label' => $this->rma_statuses['generated']['label'],
                'date' => $rma['created_at'],
                'completed' => true
            );
        }
        
        // Estado 2: Producto Recibido
        $history[] = array(
            'status' => 'product_received',
            'label' => $this->rma_statuses['product_received']['label'],
            'date' => $rma['received_at'],
            'completed' => !empty($rma['received_at'])
        );
        
        // Estado 3: En Revisión
        $history[] = array(
            'status' => 'under_review',
            'label' => $this->rma_statuses['under_review']['label'],
            'date' => null,
            'completed' => in_array($rma['status'], array('under_review', 'in_repair', 'shipped_back', 'completed'))
        );
        
        // Estado 4: En Reparación
        $history[] = array(
            'status' => 'in_repair',
            'label' => $this->rma_statuses['in_repair']['label'],
            'date' => null,
            'completed' => in_array($rma['status'], array('in_repair', 'shipped_back', 'completed'))
        );
        
        // Estado 5: Enviado de Regreso
        $history[] = array(
            'status' => 'shipped_back',
            'label' => $this->rma_statuses['shipped_back']['label'],
            'date' => $rma['shipped_at'],
            'completed' => !empty($rma['shipped_at'])
        );
        
        // Estado 6: Completado
        $history[] = array(
            'status' => 'completed',
            'label' => $this->rma_statuses['completed']['label'],
            'date' => $rma['completed_at'],
            'completed' => !empty($rma['completed_at'])
        );
        
        return $history;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Generar número RMA único
     */
    private function generate_rma_number() {
        $prefix = $this->rma_prefix;
        $date = date('Ymd');
        $random = strtoupper(substr(uniqid(), -6));
        
        return $prefix . '-' . $date . '-' . $random;
    }
    
    /**
     * Obtener label de un estado
     */
    public function get_status_label($status) {
        if (isset($this->rma_statuses[$status])) {
            return $this->rma_statuses[$status]['label'];
        }
        return $status;
    }
    
    /**
     * Obtener color de un estado
     */
    public function get_status_color($status) {
        if (isset($this->rma_statuses[$status])) {
            return $this->rma_statuses[$status]['color'];
        }
        return '#6b7280';
    }
    
    /**
     * Obtener todos los estados disponibles
     */
    public function get_all_statuses() {
        return $this->rma_statuses;
    }
    
    /**
     * Verificar si el tracking está habilitado
     */
    public function is_tracking_enabled() {
        return get_option('rs_warranty_rma_tracking_enabled') === 'yes';
    }
    
    /**
     * Obtener dirección de devolución
     */
    public function get_return_address() {
        $default_address = "RockStage\nDepartamento de Garantías\nCalle Ejemplo #123\nColonia Centro\nCiudad de México, CP 12345\nMéxico";
        
        return get_option('rs_warranty_rma_return_address', $default_address);
    }
}




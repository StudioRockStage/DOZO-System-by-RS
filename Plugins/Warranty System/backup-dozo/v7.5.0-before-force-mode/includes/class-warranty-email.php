<?php
/**
 * RockStage Warranty System - Email Class
 * 
 * Gestiona todas las notificaciones por email:
 * - Email al cliente (confirmación, actualizaciones, respuestas)
 * - Email al equipo (nueva solicitud, alertas)
 * - Plantillas personalizables
 * - Variables dinámicas
 * 
 * @package RockStage_Warranty_System
 * @version 1.0.0
 */

// Si este archivo es llamado directamente, abortar
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase singleton para gestionar emails
 */
class RS_Warranty_Email {
    
    /**
     * Instancia única de la clase (Singleton)
     * 
     * @var RS_Warranty_Email
     */
    private static $instance = null;
    
    /**
     * Email de garantías
     * 
     * @var string
     */
    private $warranty_email;
    
    /**
     * CC adicionales
     * 
     * @var array
     */
    private $cc_emails;
    
    /**
     * Constructor privado (Singleton)
     */
    private function __construct() {
        $this->warranty_email = get_option('rs_warranty_email', get_option('admin_email'));
        $cc_string = get_option('rs_warranty_email_cc', '');
        $this->cc_emails = !empty($cc_string) ? array_map('trim', explode(',', $cc_string)) : array();
        
        // Configurar SMTP si está habilitado
        $this->setup_smtp();
    }
    
    /**
     * Obtener instancia única (Singleton)
     * 
     * @return RS_Warranty_Email
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * CONFIGURACIÓN SMTP
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Configurar SMTP si está habilitado
     */
    private function setup_smtp() {
        if (get_option('rs_warranty_smtp_enabled') === 'yes') {
            add_action('phpmailer_init', array($this, 'configure_smtp'));
        }
    }
    
    /**
     * Configurar PHPMailer con SMTP
     */
    public function configure_smtp($phpmailer) {
        $phpmailer->isSMTP();
        $phpmailer->Host = get_option('rs_warranty_smtp_host', '');
        $phpmailer->Port = get_option('rs_warranty_smtp_port', 587);
        $phpmailer->SMTPAuth = true;
        $phpmailer->Username = get_option('rs_warranty_smtp_username', '');
        $phpmailer->Password = get_option('rs_warranty_smtp_password', '');
        $phpmailer->SMTPSecure = get_option('rs_warranty_smtp_encryption', 'tls');
        $phpmailer->From = $this->warranty_email;
        $phpmailer->FromName = get_bloginfo('name') . ' - Garantías';
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * EMAILS AL CLIENTE
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Email de confirmación al cliente
     */
    public function send_confirmation_to_customer($warranty_data) {
        $to = $warranty_data['customer_email'];
        $subject = 'Solicitud de Garantía Recibida - ' . $warranty_data['warranty_number'];
        
        $message = $this->get_email_header();
        $message .= '<h2 style="color: #FF8C00; margin-bottom: 20px;">¡Hemos recibido tu solicitud!</h2>';
        $message .= '<p>Hola <strong>' . esc_html($warranty_data['customer_name']) . '</strong>,</p>';
        $message .= '<p>Tu solicitud de garantía ha sido recibida exitosamente y está siendo revisada por nuestro equipo.</p>';
        
        $message .= '<div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Detalles de tu Solicitud</h3>';
        $message .= '<p><strong>Número de Garantía:</strong> ' . esc_html($warranty_data['warranty_number']) . '</p>';
        $message .= '<p><strong>Número de Pedido:</strong> #' . esc_html($warranty_data['order_id']) . '</p>';
        $message .= '<p><strong>Producto:</strong> ' . esc_html($warranty_data['product_name']) . '</p>';
        $message .= '<p><strong>Fecha de Solicitud:</strong> ' . date('d/m/Y H:i', strtotime($warranty_data['created_at'])) . '</p>';
        $message .= '</div>';
        
        $message .= '<h3 style="color: #FF8C00;">¿Qué sigue?</h3>';
        $message .= '<ol style="line-height: 1.8;">';
        $message .= '<li>Nuestro equipo revisará tu solicitud en las próximas <strong>24-48 horas</strong>.</li>';
        $message .= '<li>Te notificaremos por email cuando tengamos una respuesta.</li>';
        $message .= '<li>Si aprobamos tu garantía, te enviaremos las instrucciones para el siguiente paso.</li>';
        $message .= '</ol>';
        
        $message .= '<div style="background: #FF8C00; color: #0a0a0a; padding: 15px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<p style="margin: 0;"><strong>💡 Consejo:</strong> Guarda este email con tu número de garantía para futuras consultas.</p>';
        $message .= '</div>';
        
        $message .= '<p>Si tienes alguna pregunta, no dudes en contactarnos.</p>';
        $message .= '<p style="margin-top: 30px;">Saludos,<br><strong>Equipo RockStage</strong></p>';
        $message .= $this->get_email_footer();
        
        return $this->send_email($to, $subject, $message);
    }
    
    /**
     * Email de actualización de estado al cliente
     */
    public function send_status_update_to_customer($warranty_data, $new_status, $custom_message = '') {
        $to = $warranty_data['customer_email'];
        
        $status_labels = array(
            'pending' => 'Pendiente de Revisión',
            'processing' => 'En Proceso',
            'approved' => 'Aprobada',
            'rejected' => 'Rechazada',
            'completed' => 'Completada'
        );
        
        $status_label = isset($status_labels[$new_status]) ? $status_labels[$new_status] : $new_status;
        $subject = 'Actualización de Garantía - ' . $warranty_data['warranty_number'];
        
        $message = $this->get_email_header();
        $message .= '<h2 style="color: #FF8C00; margin-bottom: 20px;">Actualización de tu Garantía</h2>';
        $message .= '<p>Hola <strong>' . esc_html($warranty_data['customer_name']) . '</strong>,</p>';
        
        $message .= '<div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Estado Actual</h3>';
        $message .= '<p style="font-size: 24px; color: #FF8C00; font-weight: bold; margin: 10px 0;">' . esc_html($status_label) . '</p>';
        $message .= '<p><strong>Número de Garantía:</strong> ' . esc_html($warranty_data['warranty_number']) . '</p>';
        $message .= '</div>';
        
        if (!empty($custom_message)) {
            $message .= '<div style="background: #1f1f1f; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF8C00;">';
            $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Mensaje del Equipo</h3>';
            $message .= '<p>' . nl2br(esc_html($custom_message)) . '</p>';
            $message .= '</div>';
        }
        
        // Mensajes específicos por estado
        if ($new_status === 'approved') {
            $message .= '<h3 style="color: #10b981;">¡Buenas noticias! ✅</h3>';
            $message .= '<p>Tu solicitud de garantía ha sido <strong>aprobada</strong>. Recibirás un email adicional con las instrucciones para proceder.</p>';
        } elseif ($new_status === 'rejected') {
            $message .= '<h3 style="color: #ef4444;">Lamentamos informarte</h3>';
            $message .= '<p>Después de revisar tu caso, no podemos proceder con esta garantía. Si tienes dudas, contáctanos para más información.</p>';
        } elseif ($new_status === 'processing') {
            $message .= '<p>Tu garantía está siendo procesada. Te mantendremos informado de cualquier avance.</p>';
        }
        
        $message .= '<p style="margin-top: 30px;">Saludos,<br><strong>Equipo RockStage</strong></p>';
        $message .= $this->get_email_footer();
        
        return $this->send_email($to, $subject, $message);
    }
    
    /**
     * Email con respuesta personalizada al cliente
     */
    public function send_custom_response_to_customer($warranty_data, $response_subject, $response_message) {
        $to = $warranty_data['customer_email'];
        
        // Reemplazar variables en el asunto y mensaje
        $response_subject = $this->replace_variables($response_subject, $warranty_data);
        $response_message = $this->replace_variables($response_message, $warranty_data);
        
        $message = $this->get_email_header();
        $message .= '<h2 style="color: #FF8C00; margin-bottom: 20px;">' . esc_html($response_subject) . '</h2>';
        $message .= '<p>Hola <strong>' . esc_html($warranty_data['customer_name']) . '</strong>,</p>';
        
        $message .= '<div style="background: #1f1f1f; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= nl2br(esc_html($response_message));
        $message .= '</div>';
        
        $message .= '<div style="background: #1a1a1a; padding: 15px; border-radius: 10px; margin: 20px 0; font-size: 14px;">';
        $message .= '<p style="margin: 0;"><strong>Número de Garantía:</strong> ' . esc_html($warranty_data['warranty_number']) . '</p>';
        $message .= '</div>';
        
        $message .= '<p style="margin-top: 30px;">Saludos,<br><strong>Equipo RockStage</strong></p>';
        $message .= $this->get_email_footer();
        
        return $this->send_email($to, $response_subject, $message);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * EMAILS AL EQUIPO
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Email de nueva solicitud al equipo
     */
    public function send_new_warranty_to_team($warranty_data) {
        $to = $this->warranty_email;
        $subject = '[Nueva Garantía] ' . $warranty_data['warranty_number'] . ' - ' . $warranty_data['customer_name'];
        
        $message = $this->get_email_header();
        $message .= '<h2 style="color: #FF8C00; margin-bottom: 20px;">🔔 Nueva Solicitud de Garantía</h2>';
        
        $message .= '<div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Información del Cliente</h3>';
        $message .= '<p><strong>Nombre:</strong> ' . esc_html($warranty_data['customer_name']) . '</p>';
        $message .= '<p><strong>Email:</strong> ' . esc_html($warranty_data['customer_email']) . '</p>';
        $message .= '<p><strong>Teléfono:</strong> ' . esc_html($warranty_data['customer_phone']) . '</p>';
        $message .= '</div>';
        
        $message .= '<div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Detalles de la Garantía</h3>';
        $message .= '<p><strong>Número:</strong> ' . esc_html($warranty_data['warranty_number']) . '</p>';
        $message .= '<p><strong>Pedido:</strong> #' . esc_html($warranty_data['order_id']) . '</p>';
        $message .= '<p><strong>Producto:</strong> ' . esc_html($warranty_data['product_name']) . '</p>';
        $message .= '<p><strong>Prioridad:</strong> ' . esc_html($warranty_data['priority']) . '</p>';
        $message .= '<p><strong>Días restantes:</strong> ' . esc_html($warranty_data['days_until_expiration']) . ' días</p>';
        $message .= '</div>';
        
        $message .= '<div style="background: #1f1f1f; padding: 20px; border-radius: 10px; margin: 20px 0;">';
        $message .= '<h3 style="color: #FF8C00; margin-top: 0;">Descripción del Problema</h3>';
        $message .= '<p>' . nl2br(esc_html($warranty_data['description'])) . '</p>';
        $message .= '</div>';
        
        // Enlace al panel de administración
        $admin_url = admin_url('admin.php?page=rockstage-warranty&action=view&id=' . $warranty_data['id']);
        $message .= '<div style="text-align: center; margin: 30px 0;">';
        $message .= '<a href="' . esc_url($admin_url) . '" style="display: inline-block; background: #FF8C00; color: #0a0a0a; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold;">Ver en el Panel</a>';
        $message .= '</div>';
        
        $message .= $this->get_email_footer();
        
        // Enviar al email principal y CCs
        $headers = array('Content-Type: text/html; charset=UTF-8');
        
        if (!empty($this->cc_emails)) {
            foreach ($this->cc_emails as $cc) {
                $headers[] = 'Cc: ' . $cc;
            }
        }
        
        return wp_mail($to, $subject, $message, $headers);
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * PLANTILLAS HTML
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Header del email
     */
    private function get_email_header() {
        $header = '<!DOCTYPE html>';
        $header .= '<html lang="es">';
        $header .= '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>';
        $header .= '<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; background: #0a0a0a; color: #ffffff;">';
        $header .= '<div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 20px; overflow: hidden;">';
        
        // Header con logo
        $header .= '<div style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); padding: 40px 20px; text-align: center;">';
        $header .= '<h1 style="margin: 0; color: #0a0a0a; font-size: 28px;">RockStage</h1>';
        $header .= '<p style="margin: 10px 0 0 0; color: #0a0a0a; font-size: 14px;">Sistema de Garantías</p>';
        $header .= '</div>';
        
        // Contenido
        $header .= '<div style="padding: 40px 30px;">';
        
        return $header;
    }
    
    /**
     * Footer del email
     */
    private function get_email_footer() {
        $footer = '</div>'; // Cierre del contenido
        
        // Footer
        $footer .= '<div style="background: #0a0a0a; padding: 30px 20px; text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6);">';
        $footer .= '<p style="margin: 0 0 10px 0;">RockStage - Tu tienda de confianza</p>';
        $footer .= '<p style="margin: 0;">Email: garantias@rockstage.com | WhatsApp: +52 55 1234 5678</p>';
        $footer .= '<p style="margin: 15px 0 0 0; font-size: 12px;">Este email fue enviado automáticamente, por favor no responder.</p>';
        $footer .= '</div>';
        
        $footer .= '</div>'; // Cierre del contenedor principal
        $footer .= '</body></html>';
        
        return $footer;
    }
    
    /**
     * ═══════════════════════════════════════════════════════════════
     * HELPERS
     * ═══════════════════════════════════════════════════════════════
     */
    
    /**
     * Enviar email con configuración HTML
     */
    private function send_email($to, $subject, $message) {
        $headers = array('Content-Type: text/html; charset=UTF-8');
        
        return wp_mail($to, $subject, $message, $headers);
    }
    
    /**
     * Reemplazar variables en plantillas
     */
    private function replace_variables($text, $warranty_data) {
        $variables = array(
            '{nombre}' => $warranty_data['customer_name'],
            '{email}' => $warranty_data['customer_email'],
            '{telefono}' => $warranty_data['customer_phone'],
            '{garantia_id}' => $warranty_data['warranty_number'],
            '{pedido_id}' => '#' . $warranty_data['order_id'],
            '{producto}' => isset($warranty_data['product_name']) ? $warranty_data['product_name'] : '',
            '{dias_restantes}' => $warranty_data['days_until_expiration'],
            '{rma_number}' => isset($warranty_data['rma_number']) ? $warranty_data['rma_number'] : '',
        );
        
        return str_replace(array_keys($variables), array_values($variables), $text);
    }
}




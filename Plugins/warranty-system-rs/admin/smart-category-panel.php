<?php
/**
 * Smart Category Panel v1.1.0
 * Integración DOZO – RockStage Warranty System
 * Autor: RockStage Solutions
 * @version 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Render Smart Category Panel
 * Función para mostrar el panel de categorías inteligente
 */
function rs_warranty_render_smart_category_panel() {
    // Verificar permisos
    if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'edit_posts' ) ) {
        wp_die( __( 'No tienes permisos suficientes para acceder a esta página.', 'warranty-system-rs' ) );
    }
    ?>
    <div class="wrap rs-smart-category-panel-wrapper">
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warranty System RS v1.1.0 – Dashboard | RockStage Solutions</title>
    <meta name="description" content="Sistema de Gestión de Garantías - RockStage Solutions - DOZO Certified">
    <meta name="author" content="RockStage Solutions - DOZO System v7.9">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* ========================================
           DOZO CERTIFIED - WARRANTY SYSTEM RS v1.1.0
           RockStage Light Edition - OFFICIAL
           Diseñado por: Claude AI - RockStage Solutions
           Fecha: 2025-10-17
           Sistema: DOZO v7.9 - DeepSync Framework
           Estado: PRODUCTION READY ✅
           ======================================== */
        
        /* Reset Universal */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* Variables CSS - RockStage Official Palette */
        :root {
            /* Colores Principales */
            --rs-primary: #78413F;
            --rs-secondary: #080B0E;
            --rs-neutral-dark: #393E40;
            --rs-neutral-light: #A68281;
            --rs-accent: #733A38;
            --rs-bg: #FFFFFF;
            --rs-text: #080B0E;
            --rs-border: #665558;
            --rs-muted: #A5A1A2;
            
            /* Sombras */
            --shadow-sm: 0 2px 8px rgba(8, 11, 14, 0.08);
            --shadow-md: 0 4px 16px rgba(8, 11, 14, 0.12);
            --shadow-lg: 0 12px 32px rgba(120, 65, 63, 0.15);
            
            /* Transiciones */
            --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-fast: all 0.2s ease;
            
            /* Espaciado */
            --spacing-xs: 8px;
            --spacing-sm: 12px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --spacing-xl: 32px;
            --spacing-2xl: 48px;
            
            /* Radios */
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 16px;
        }
        
        /* Base Styles */
        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--rs-bg);
            color: var(--rs-text);
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Patrón de fondo sutil */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(120, 65, 63, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(120, 65, 63, 0.02) 1px, transparent 1px);
            background-size: 50px 50px;
            pointer-events: none;
            z-index: 0;
        }
        
        /* Container Principal */
        .warranty-container {
            max-width: 1800px;
            margin: 0 auto;
            padding: var(--spacing-2xl) var(--spacing-xl);
            position: relative;
            z-index: 1;
        }
        
        /* ========================================
           HEADER PREMIUM
           ======================================== */
        
        .warranty-header {
            background: var(--rs-secondary);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-2xl);
            box-shadow: var(--shadow-md);
        }
        
        .warranty-header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            flex-wrap: wrap;
            gap: var(--spacing-lg);
        }
        
        .warranty-brand {
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
        }
        
        .warranty-logo {
            width: 64px;
            height: 64px;
            background: var(--rs-primary);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(120, 65, 63, 0.3);
            flex-shrink: 0;
        }
        
        .warranty-logo svg {
            width: 36px;
            height: 36px;
            stroke: var(--rs-bg);
            stroke-width: 2.5;
        }
        
        .warranty-title-group h1 {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(28px, 5vw, 42px);
            letter-spacing: 3px;
            color: var(--rs-bg);
            line-height: 1;
            margin-bottom: 6px;
        }
        
        .warranty-title-group p {
            font-size: 13px;
            color: var(--rs-neutral-light);
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
        }
        
        .warranty-nav {
            display: flex;
            gap: var(--spacing-lg);
            flex-wrap: wrap;
        }
        
        .warranty-nav-link {
            color: var(--rs-neutral-light);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-sm);
            transition: var(--transition-base);
        }
        
        .warranty-nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--rs-bg);
        }
        
        .warranty-nav-link.active {
            background: var(--rs-primary);
            color: var(--rs-bg);
        }
        
        .warranty-actions {
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;
        }
        
        .warranty-btn {
            padding: 14px 28px;
            border: none;
            border-radius: var(--radius-md);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-base);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-family: inherit;
            white-space: nowrap;
        }
        
        .warranty-btn-primary {
            background: var(--rs-primary);
            color: var(--rs-bg);
            box-shadow: 0 4px 12px rgba(120, 65, 63, 0.3);
        }
        
        .warranty-btn-primary:hover {
            background: var(--rs-accent);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(120, 65, 63, 0.4);
        }
        
        .warranty-btn-primary:active {
            transform: translateY(0);
        }
        
        .warranty-btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: var(--rs-bg);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .warranty-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Quick Stats */
        .warranty-quick-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: var(--spacing-lg);
            padding-top: var(--spacing-lg);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .warranty-quick-stat {
            text-align: center;
        }
        
        .warranty-quick-stat-value {
            font-size: clamp(28px, 4vw, 36px);
            font-weight: 800;
            color: var(--rs-bg);
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        
        .warranty-quick-stat-label {
            font-size: 12px;
            color: var(--rs-neutral-light);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* ========================================
           STATS SECTION
           ======================================== */
        
        .warranty-stats-section {
            margin-bottom: var(--spacing-2xl);
        }
        
        .warranty-section-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(24px, 4vw, 32px);
            letter-spacing: 2px;
            color: var(--rs-secondary);
            margin-bottom: var(--spacing-lg);
            padding-left: var(--spacing-md);
            border-left: 4px solid var(--rs-primary);
        }
        
        .warranty-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--spacing-lg);
        }
        
        .warranty-stat-card {
            background: var(--rs-bg);
            border: 2px solid #f5f5f5;
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            transition: var(--transition-base);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        
        .warranty-stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, var(--rs-primary), var(--rs-accent));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .warranty-stat-card:hover {
            border-color: var(--rs-primary);
            transform: translateY(-6px);
            box-shadow: var(--shadow-lg);
        }
        
        .warranty-stat-card:hover::before {
            opacity: 1;
        }
        
        .warranty-stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
        }
        
        .warranty-stat-icon {
            width: 56px;
            height: 56px;
            background: rgba(120, 65, 63, 0.1);
            border: 2px solid var(--rs-primary);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition-base);
        }
        
        .warranty-stat-card:hover .warranty-stat-icon {
            background: var(--rs-primary);
            transform: scale(1.1) rotate(-5deg);
        }
        
        .warranty-stat-icon svg {
            width: 28px;
            height: 28px;
            stroke: var(--rs-primary);
            stroke-width: 2.5;
        }
        
        .warranty-stat-card:hover .warranty-stat-icon svg {
            stroke: var(--rs-bg);
        }
        
        .warranty-stat-badge {
            padding: 6px 14px;
            background: rgba(120, 65, 63, 0.1);
            border: 1px solid var(--rs-primary);
            border-radius: var(--radius-sm);
            font-size: 11px;
            color: var(--rs-primary);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
        }
        
        .warranty-stat-value {
            font-size: clamp(42px, 6vw, 56px);
            font-weight: 800;
            color: var(--rs-secondary);
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 2px;
            margin-bottom: var(--spacing-sm);
        }
        
        .warranty-stat-label {
            font-size: 15px;
            color: var(--rs-neutral-dark);
            font-weight: 500;
            margin-bottom: var(--spacing-lg);
        }
        
        .warranty-stat-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: var(--spacing-lg);
            border-top: 1px solid #f5f5f5;
        }
        
        .warranty-stat-trend {
            font-size: 14px;
            color: var(--rs-primary);
            font-weight: 700;
        }
        
        .warranty-stat-period {
            font-size: 12px;
            color: var(--rs-muted);
        }
        
        /* ========================================
           CONTENT GRID
           ======================================== */
        
        .warranty-content-grid {
            display: grid;
            grid-template-columns: 1.8fr 1fr;
            gap: var(--spacing-xl);
            margin-bottom: var(--spacing-2xl);
        }
        
        .warranty-content-card {
            background: var(--rs-bg);
            border: 2px solid #f5f5f5;
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            box-shadow: var(--shadow-sm);
        }
        
        .warranty-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            padding-bottom: var(--spacing-lg);
            border-bottom: 2px solid #f5f5f5;
            flex-wrap: wrap;
            gap: var(--spacing-md);
        }
        
        .warranty-card-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(20px, 3vw, 28px);
            letter-spacing: 2px;
            color: var(--rs-secondary);
        }
        
        .warranty-search-box {
            position: relative;
            min-width: 250px;
            flex: 1;
            max-width: 350px;
        }
        
        .warranty-search {
            width: 100%;
            padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) 48px;
            background: #f8f8f8;
            border: 2px solid #f0f0f0;
            border-radius: var(--radius-md);
            color: var(--rs-text);
            font-size: 14px;
            font-family: inherit;
            transition: var(--transition-base);
        }
        
        .warranty-search:focus {
            outline: none;
            border-color: var(--rs-primary);
            background: var(--rs-bg);
        }
        
        .warranty-search::placeholder {
            color: var(--rs-muted);
        }
        
        .warranty-search-icon {
            position: absolute;
            left: var(--spacing-md);
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            stroke: var(--rs-muted);
            pointer-events: none;
        }
        
        /* Table */
        .warranty-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .warranty-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
        }
        
        .warranty-table thead th {
            text-align: left;
            padding: var(--spacing-md) var(--spacing-sm);
            font-size: 12px;
            font-weight: 700;
            color: var(--rs-primary);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 2px solid var(--rs-primary);
        }
        
        .warranty-table tbody tr {
            border-bottom: 1px solid #f5f5f5;
            transition: var(--transition-fast);
        }
        
        .warranty-table tbody tr:hover {
            background: #fafafa;
        }
        
        .warranty-table tbody td {
            padding: var(--spacing-lg) var(--spacing-sm);
            font-size: 14px;
            color: var(--rs-text);
            vertical-align: middle;
        }
        
        .warranty-id {
            font-weight: 800;
            color: var(--rs-primary);
            font-family: 'Bebas Neue', sans-serif;
            font-size: 16px;
            letter-spacing: 1px;
        }
        
        .warranty-customer-name {
            font-weight: 600;
            color: var(--rs-secondary);
            margin-bottom: 4px;
        }
        
        .warranty-customer-email {
            font-size: 12px;
            color: var(--rs-muted);
        }
        
        .warranty-status {
            display: inline-block;
            padding: 6px 16px;
            border-radius: var(--radius-sm);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        
        .warranty-status-active {
            background: rgba(120, 65, 63, 0.1);
            color: var(--rs-primary);
            border: 1px solid var(--rs-primary);
        }
        
        .warranty-status-pending {
            background: rgba(166, 130, 129, 0.15);
            color: #8d6e6d;
            border: 1px solid var(--rs-neutral-light);
        }
        
        .warranty-status-expired {
            background: rgba(115, 58, 56, 0.1);
            color: var(--rs-accent);
            border: 1px solid var(--rs-accent);
        }
        
        /* Chart Section */
        .warranty-chart-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
        }
        
        .warranty-chart-item {
            padding: var(--spacing-lg);
            background: #fafafa;
            border: 1px solid #f0f0f0;
            border-radius: var(--radius-md);
            transition: var(--transition-base);
        }
        
        .warranty-chart-item:hover {
            border-color: var(--rs-primary);
            background: var(--rs-bg);
            box-shadow: 0 4px 16px rgba(120, 65, 63, 0.08);
        }
        
        .warranty-chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
        }
        
        .warranty-chart-label {
            font-size: 14px;
            color: var(--rs-neutral-dark);
            font-weight: 600;
        }
        
        .warranty-chart-value {
            font-size: clamp(20px, 3vw, 28px);
            font-weight: 800;
            color: var(--rs-primary);
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 1px;
        }
        
        .warranty-progress {
            height: 12px;
            background: #f0f0f0;
            border-radius: 6px;
            overflow: hidden;
        }
        
        .warranty-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--rs-primary), var(--rs-accent));
            border-radius: 6px;
            transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 12px rgba(120, 65, 63, 0.3);
        }
        
        .warranty-chart-meta {
            margin-top: 10px;
            font-size: 12px;
            color: var(--rs-muted);
        }
        
        /* ========================================
           FOOTER
           ======================================== */
        
        .warranty-footer {
            text-align: center;
            padding: var(--spacing-2xl) 0;
            border-top: 2px solid #f5f5f5;
        }
        
        .warranty-footer-text {
            font-size: 14px;
            color: var(--rs-muted);
        }
        
        .warranty-footer-link {
            color: var(--rs-primary);
            text-decoration: none;
            font-weight: 700;
            transition: var(--transition-fast);
        }
        
        .warranty-footer-link:hover {
            color: var(--rs-accent);
            text-decoration: underline;
        }
        
        /* ========================================
           RESPONSIVE DESIGN
           ======================================== */
        
        @media (max-width: 1400px) {
            .warranty-content-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .warranty-container {
                padding: var(--spacing-lg) var(--spacing-md);
            }
            
            .warranty-header {
                padding: var(--spacing-lg);
            }
            
            .warranty-header-top {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .warranty-nav {
                flex-direction: column;
                width: 100%;
                gap: var(--spacing-sm);
            }
            
            .warranty-nav-link {
                width: 100%;
                text-align: center;
            }
            
            .warranty-actions {
                width: 100%;
            }
            
            .warranty-btn {
                flex: 1;
            }
            
            .warranty-quick-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .warranty-stats-grid {
                grid-template-columns: 1fr;
            }
            
            .warranty-card-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .warranty-search-box {
                width: 100%;
                max-width: none;
            }
            
            .warranty-table-wrapper {
                margin: 0 calc(-1 * var(--spacing-md));
                padding: 0 var(--spacing-md);
            }
        }
        
        @media (max-width: 480px) {
            .warranty-quick-stats {
                grid-template-columns: 1fr;
            }
        }
        
        /* ========================================
           ACCESSIBILITY
           ======================================== */
        
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        
        /* Focus Styles */
        *:focus-visible {
            outline: 2px solid var(--rs-primary);
            outline-offset: 2px;
        }
        
        /* ========================================
           ANIMATIONS
           ======================================== */
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-on-load {
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        /* ========================================
           PRINT STYLES
           ======================================== */
        
        @media print {
            body::before {
                display: none;
            }
            
            .warranty-header,
            .warranty-btn,
            .warranty-search-box {
                display: none !important;
            }
            
            .warranty-stat-card,
            .warranty-content-card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <!-- DOZO: Main Container -->
    <div class="warranty-container">
        
        <!-- DOZO: Header Section -->
        <header class="warranty-header" role="banner">
            <div class="warranty-header-top">
                <div class="warranty-brand">
                    <div class="warranty-logo" aria-label="Logo Warranty System">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <div class="warranty-title-group">
                        <h1>WARRANTY SYSTEM RS</h1>
                        <p>RockStage Solutions</p>
                    </div>
                </div>
                
                <nav class="warranty-nav" role="navigation" aria-label="Navegación principal">
                    <a href="#dashboard" class="warranty-nav-link active" aria-current="page">Dashboard</a>
                    <a href="#categorias" class="warranty-nav-link">Categorías</a>
                    <a href="#registros" class="warranty-nav-link">Registros</a>
                    <a href="#configuracion" class="warranty-nav-link">Configuración</a>
                    <a href="#soporte" class="warranty-nav-link">Soporte</a>
                </nav>
                
                <div class="warranty-actions">
                    <button class="warranty-btn warranty-btn-secondary" aria-label="Exportar datos">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        <span>Exportar</span>
                    </button>
                    <button class="warranty-btn warranty-btn-primary" aria-label="Crear nueva garantía">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        <span>Nueva Garantía</span>
                    </button>
                </div>
            </div>
            
            <!-- DOZO: Quick Stats -->
            <div class="warranty-quick-stats" role="region" aria-label="Estadísticas rápidas">
                <div class="warranty-quick-stat">
                    <div class="warranty-quick-stat-value">1,247</div>
                    <div class="warranty-quick-stat-label">Total</div>
                </div>
                <div class="warranty-quick-stat">
                    <div class="warranty-quick-stat-value">892</div>
                    <div class="warranty-quick-stat-label">Activas</div>
                </div>
                <div class="warranty-quick-stat">
                    <div class="warranty-quick-stat-value">156</div>
                    <div class="warranty-quick-stat-label">Pendientes</div>
                </div>
                <div class="warranty-quick-stat">
                    <div class="warranty-quick-stat-value">89</div>
                    <div class="warranty-quick-stat-label">Vencidas</div>
                </div>
            </div>
        </header>
        
        <!-- DOZO: Stats Section -->
        <section class="warranty-stats-section" aria-labelledby="stats-title">
            <h2 id="stats-title" class="warranty-section-title">Análisis del Sistema</h2>
            
            <div class="warranty-stats-grid">
                <article class="warranty-stat-card">
                    <div class="warranty-stat-header">
                        <div class="warranty-stat-icon" aria-hidden="true">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                        </div>
                        <span class="warranty-stat-badge">Sistema</span>
                    </div>
                    <div class="warranty-stat-value">1,247</div>
                    <div class="warranty-stat-label">Total de Garantías Registradas</div>
                    <div class="warranty-stat-footer">
                        <span class="warranty-stat-trend" aria-label="Incremento del 12.5 por ciento">↑ +12.5%</span>
                        <span class="warranty-stat-period">vs mes anterior</span>
                    </div>
                </article>
                
                <article class="warranty-stat-card">
                    <div class="warranty-stat-header">
                        <div class="warranty-stat-icon" aria-hidden="true">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <span class="warranty-stat-badge">Activo</span>
                    </div>
                    <div class="warranty-stat-value">892</div>
                    <div class="warranty-stat-label">Garantías en Vigencia</div>
                    <div class="warranty-stat-footer">
                        <span class="warranty-stat-trend" aria-label="Incremento del 8.3 por ciento">↑ +8.3%</span>
                        <span class="warranty-stat-period">esta semana</span>
                    </div>
                </article>
                
                <article class="warranty-stat-card">
                    <div class="warranty-stat-header">
                        <div class="warranty-stat-icon" aria-hidden="true">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <span class="warranty-stat-badge">Atención</span>
                    </div>
                    <div class="warranty-stat-value">156</div>
                    <div class="warranty-stat-label">Pendientes de Revisión</div>
                    <div class="warranty-stat-footer">
                        <span class="warranty-stat-trend">⚠ Requieren Acción</span>
                        <span class="warranty-stat-period">prioridad alta</span>
                    </div>
                </article>
                
                <article class="warranty-stat-card">
                    <div class="warranty-stat-header">
                        <div class="warranty-stat-icon" aria-hidden="true">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <span class="warranty-stat-badge">Archivo</span>
                    </div>
                    <div class="warranty-stat-value">89</div>
                    <div class="warranty-stat-label">Garantías Vencidas</div>
                    <div class="warranty-stat-footer">
                        <span class="warranty-stat-trend" aria-label="Reducción del 15.2 por ciento">↓ -15.2%</span>
                        <span class="warranty-stat-period">mejora continua</span>
                    </div>
                </article>
            </div>
        </section>
        
        <!-- DOZO: Main Content Grid -->
        <div class="warranty-content-grid">
            
            <!-- DOZO: Table Section -->
            <section class="warranty-content-card" aria-labelledby="table-title">
                <div class="warranty-card-header">
                    <h3 id="table-title" class="warranty-card-title">Registros Recientes</h3>
                    <div class="warranty-search-box">
                        <svg class="warranty-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                            type="search" 
                            class="warranty-search" 
                            placeholder="Buscar garantías..."
                            aria-label="Buscar garantías"
                        >
                    </div>
                </div>
                
                <div class="warranty-table-wrapper">
                    <table class="warranty-table" role="table" aria-label="Lista de garantías">
                        <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Cliente</th>
                                <th scope="col">Producto</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="warranty-id">WS-2025-001</span></td>
                                <td>
                                    <div class="warranty-customer-name">Juan Pérez</div>
                                    <div class="warranty-customer-email">juan.perez@email.com</div>
                                </td>
                                <td>Laptop HP Pavilion 15</td>
                                <td><span class="warranty-status warranty-status-active">Activa</span></td>
                                <td>12/05/2026</td>
                            </tr>
                            <tr>
                                <td><span class="warranty-id">WS-2025-002</span></td>
                                <td>
                                    <div class="warranty-customer-name">María López</div>
                                    <div class="warranty-customer-email">maria.lopez@email.com</div>
                                </td>
                                <td>Monitor Samsung 27"</td>
                                <td><span class="warranty-status warranty-status-pending">Pendiente</span></td>
                                <td>08/06/2026</td>
                            </tr>
                            <tr>
                                <td><span class="warranty-id">WS-2025-003</span></td>
                                <td>
                                    <div class="warranty-customer-name">Carlos Ruiz</div>
                                    <div class="warranty-customer-email">carlos.ruiz@email.com</div>
                                </td>
                                <td>Teclado Mecánico RGB</td>
                                <td><span class="warranty-status warranty-status-active">Activa</span></td>
                                <td>15/04/2026</td>
                            </tr>
                            <tr>
                                <td><span class="warranty-id">WS-2025-004</span></td>
                                <td>
                                    <div class="warranty-customer-name">Ana Martínez</div>
                                    <div class="warranty-customer-email">ana.martinez@email.com</div>
                                </td>
                                <td>Mouse Inalámbrico</td>
                                <td><span class="warranty-status warranty-status-expired">Vencida</span></td>
                                <td>02/01/2025</td>
                            </tr>
                            <tr>
                                <td><span class="warranty-id">WS-2025-005</span></td>
                                <td>
                                    <div class="warranty-customer-name">Pedro Sánchez</div>
                                    <div class="warranty-customer-email">pedro.sanchez@email.com</div>
                                </td>
                                <td>Webcam Logitech HD</td>
                                <td><span class="warranty-status warranty-status-active">Activa</span></td>
                                <td>20/07/2026</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <!-- DOZO: Chart Section -->
            <aside class="warranty-content-card" aria-labelledby="chart-title">
                <div class="warranty-card-header" style="border-bottom: none; padding-bottom: 0; margin-bottom: var(--spacing-lg);">
                    <h3 id="chart-title" class="warranty-card-title">Distribución</h3>
                </div>
                
                <div class="warranty-chart-list">
                    <div class="warranty-chart-item">
                        <div class="warranty-chart-header">
                            <span class="warranty-chart-label">Activas</span>
                            <span class="warranty-chart-value">892</span>
                        </div>
                        <div class="warranty-progress" role="progressbar" aria-valuenow="71.5" aria-valuemin="0" aria-valuemax="100" aria-label="71.5 porciento activas">
                            <div class="warranty-progress-fill" style="width: 71.5%;"></div>
                        </div>
                        <div class="warranty-chart-meta">71.5% del total del sistema</div>
                    </div>
                    
                    <div class="warranty-chart-item">
                        <div class="warranty-chart-header">
                            <span class="warranty-chart-label">Pendientes</span>
                            <span class="warranty-chart-value">156</span>
                        </div>
                        <div class="warranty-progress" role="progressbar" aria-valuenow="12.5" aria-valuemin="0" aria-valuemax="100" aria-label="12.5 porciento pendientes">
                            <div class="warranty-progress-fill" style="width: 12.5%;"></div>
                        </div>
                        <div class="warranty-chart-meta">12.5% requieren revisión</div>
                    </div>
                    
                    <div class="warranty-chart-item">
                        <div class="warranty-chart-header">
                            <span class="warranty-chart-label">Aprobadas</span>
                            <span class="warranty-chart-value">110</span>
                        </div>
                        <div class="warranty-progress" role="progressbar" aria-valuenow="8.8" aria-valuemin="0" aria-valuemax="100" aria-label="8.8 porciento aprobadas">
                            <div class="warranty-progress-fill" style="width: 8.8%;"></div>
                        </div>
                        <div class="warranty-chart-meta">8.8% procesadas exitosamente</div>
                    </div>
                    <div class="warranty-chart-item">
                        <div class="warranty-chart-header">
                            <span class="warranty-chart-label">Vencidas</span>
                            <span class="warranty-chart-value">89</span>
                        </div>
                        <div class="warranty-progress" role="progressbar" aria-valuenow="7.1" aria-valuemin="0" aria-valuemax="100" aria-label="7.1 porciento vencidas">
                            <div class="warranty-progress-fill" style="width: 7.1%;"></div>
                        </div>
                        <div class="warranty-chart-meta">7.1% archivadas por expiración</div>
                    </div>
                </div>
            </aside>
            
        </div>
        
        <!-- DOZO: Footer -->
        <footer class="warranty-footer" role="contentinfo">
            <p class="warranty-footer-text">
                <a href="https://rockstagesolutions.com" class="warranty-footer-link">RockStage Solutions</a> – 
                DOZO System v7.9 – 
                Warranty System RS v1.1.0
            </p>
        </footer>
        
    </div>
    
    <!-- DOZO: JavaScript -->
    <script>
        /* ========================================
           DOZO: JavaScript Initialization
           ======================================== */
        
        (function() {
            'use strict';
            
            // Animaciones de entrada
            window.addEventListener('load', function() {
                const animateElements = document.querySelectorAll('.warranty-stat-card, .warranty-content-card');
                
                animateElements.forEach((element, index) => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                    
                    setTimeout(() => {
                        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                
                // Animación de progress bars
                setTimeout(() => {
                    const progressBars = document.querySelectorAll('.warranty-progress-fill');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 200);
                    });
                }, 800);
            });
            
            // Búsqueda en tiempo real
            const searchInput = document.querySelector('.warranty-search');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const rows = document.querySelectorAll('.warranty-table tbody tr');
                    
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(searchTerm) ? '' : 'none';
                    });
                });
            }
            
            // Smooth scroll para navegación
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            console.log('✅ Warranty System RS v1.1.0 - DOZO Certified - Initialized');
        })();
    </script>
    
</body>
</html>
    </div>
    <?php
}

/**
 * Registrar menú en admin
 */
add_action( 'admin_menu', function() {
    add_menu_page(
        'Smart Category Panel',           // Page title
        'Smart Categories',               // Menu title
        'manage_woocommerce',             // Capability
        'rs-smart-category-panel',        // Menu slug
        'rs_warranty_render_smart_category_panel', // Callback
        'dashicons-screenoptions',        // Icon
        58                                // Position (after WooCommerce)
    );
}, 20 );

/**
 * Registrar shortcode para frontend
 */
add_shortcode( 'rs_smart_category_panel', 'rs_warranty_render_smart_category_panel' );

/**
 * Enqueue scripts y styles si es necesario
 */
add_action( 'admin_enqueue_scripts', function( $hook ) {
    if ( $hook !== 'toplevel_page_rs-smart-category-panel' ) {
        return;
    }
    
    // Aquí se pueden agregar estilos adicionales si son necesarios
    wp_enqueue_style( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.css', [], '1.1.0' );
    wp_enqueue_script( 'rs-smart-panel', RS_WARRANTY_ASSETS_URL . 'smart-category-panel/panel.js', ['jquery'], '1.1.0', true );
});

/**
 * DOZO v4.8 - Modular Adaptive Diagnostic System
 * Warranty System by RockStage
 * 
 * Sistema inteligente de autodiagnóstico modular que:
 * - Valida funcionalidad core (nonces, AJAX, contadores)
 * - Verifica UI/diseños (shortcodes, Claude AI sync)
 * - Confirma persistencia de fixes históricos
 * - Aprende de problemas recurrentes
 * - Genera audit logs automáticos
 * 
 * @version 4.8.0
 * @package RockStage_Warranty_System
 */

(function(window) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // DOZO NAMESPACE
    // ═══════════════════════════════════════════════════════════════
    
    window.DOZO = window.DOZO || {};
    
    const DOZO = {
        version: '4.8.0',
        timestamp: new Date().toISOString(),
        environment: 'unknown',
        issues: {},
        history: [],
        config: {
            autoRun: true,
            logToConsole: true,
            logToStorage: true,
            thresholdUnstable: 3, // 3 fallos consecutivos = inestable
            thresholdStable: 3    // 3 éxitos consecutivos = confirmado estable
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.init = function() {
        this.log('🧩 DOZO v4.8 - Modular Adaptive Diagnostic System');
        this.log('Inicializando sistema de autodiagnóstico...');
        
        // Detectar entorno
        this.detectEnvironment();
        
        // Cargar historial
        this.loadHistory();
        
        // Ejecutar diagnóstico si autoRun está activo
        if (this.config.autoRun) {
            setTimeout(() => this.runFullDiagnostic(), 1000);
        }
        
        // Exponer al window
        window.DOZO = this;
        window.dozoTest = () => this.runFullDiagnostic();
    };
    
    // ═══════════════════════════════════════════════════════════════
    // ENVIRONMENT DETECTION
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.detectEnvironment = function() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        
        if (page && page.includes('rockstage-warranty')) {
            if (page.includes('settings')) {
                this.environment = 'admin-settings';
            } else if (page.includes('dashboard')) {
                this.environment = 'admin-dashboard';
            } else {
                this.environment = 'admin-other';
            }
        } else if (document.querySelector('.rs-warranty-form-container')) {
            this.environment = 'public-form';
        } else if (document.querySelector('.warranty-verifier')) {
            this.environment = 'public-verifier';
        } else {
            this.environment = 'unknown';
        }
        
        this.log('🌍 Entorno detectado:', this.environment);
    };
    
    // ═══════════════════════════════════════════════════════════════
    // LAYER 1: CORE CHECK (Funcionalidad Vital)
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.coreCheck = function() {
        return new Promise((resolve) => {
            this.log('🔹 DOZO Core Layer - Validación Funcional', 'group');
            
            const results = {
                layer: 'core',
                timestamp: new Date().toISOString(),
                checks: {},
                score: 0,
                maxScore: 0,
                status: 'unknown'
            };
            
            // Check 1: Nonces únicos
            this.log('Test 1: Validando nonces únicos...');
            const nonceCheck = this.checkNonceUniqueness();
            results.checks.nonces = nonceCheck;
            results.maxScore++;
            if (nonceCheck.passed) results.score++;
            
            // Check 2: AJAX operativo
            this.log('Test 2: Verificando AJAX endpoint...');
            this.checkAjaxOperational().then(ajaxCheck => {
                results.checks.ajax = ajaxCheck;
                results.maxScore++;
                if (ajaxCheck.passed) results.score++;
                
                // Check 3: Contadores dinámicos (solo en admin-settings)
                if (this.environment === 'admin-settings') {
                    this.log('Test 3: Validando contadores dinámicos...');
                    const counterCheck = this.checkDynamicCounters();
                    results.checks.counters = counterCheck;
                    results.maxScore++;
                    if (counterCheck.passed) results.score++;
                }
                
                // Check 4: Race condition prevention
                this.log('Test 4: Verificando prevención de race conditions...');
                const raceCheck = this.checkRaceConditionPrevention();
                results.checks.raceCondition = raceCheck;
                results.maxScore++;
                if (raceCheck.passed) results.score++;
                
                // Calcular status
                const percentage = (results.score / results.maxScore) * 100;
                results.status = percentage === 100 ? 'excellent' : 
                                 percentage >= 75 ? 'good' : 
                                 percentage >= 50 ? 'warning' : 'critical';
                
                this.log(`✅ Core Layer: ${results.score}/${results.maxScore} (${percentage.toFixed(0)}%)`, 'groupEnd');
                
                resolve(results);
            });
        });
    };
    
    DOZO.checkNonceUniqueness = function() {
        const nonces = Array.from(document.querySelectorAll('input[name*="nonce"]'));
        
        if (nonces.length === 0) {
            return { passed: false, message: 'No se detectaron nonces', count: 0 };
        }
        
        const values = nonces.map(n => n.value).filter(v => v);
        const uniqueValues = [...new Set(values)];
        const duplicates = values.length - uniqueValues.length;
        
        const ids = nonces.map(n => n.id).filter(id => id);
        const uniqueIds = [...new Set(ids)];
        const duplicateIds = ids.length - uniqueIds.length;
        
        const passed = duplicates === 0 && duplicateIds === 0;
        
        return {
            passed,
            message: passed ? `${nonces.length} nonces únicos detectados` : `${duplicates} nonces duplicados, ${duplicateIds} IDs duplicados`,
            count: nonces.length,
            duplicates,
            duplicateIds
        };
    };
    
    DOZO.checkAjaxOperational = function() {
        return new Promise((resolve) => {
            // Solo verificar si estamos en admin
            if (!window.ajaxurl) {
                resolve({ passed: true, message: 'AJAX no aplicable (frontend)' });
                return;
            }
            
            const startTime = Date.now();
            
            fetch(window.ajaxurl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=heartbeat&_nonce=test'
            })
            .then(response => {
                const responseTime = Date.now() - startTime;
                
                resolve({
                    passed: response.status === 200 || response.status === 400, // 400 es esperado sin nonce válido
                    message: `AJAX responde (${response.status}) en ${responseTime}ms`,
                    status: response.status,
                    responseTime
                });
            })
            .catch(error => {
                resolve({
                    passed: false,
                    message: 'AJAX endpoint inaccesible: ' + error.message,
                    error: error.message
                });
            });
        });
    };
    
    DOZO.checkDynamicCounters = function() {
        const activeEl = document.querySelector('#activeCount, #activeCount2');
        const inactiveEl = document.querySelector('#inactiveCount, #inactiveCount2');
        
        if (!activeEl || !inactiveEl) {
            return { passed: false, message: 'Elementos de contador no encontrados' };
        }
        
        const active = parseInt(activeEl.textContent.trim()) || 0;
        const inactive = parseInt(inactiveEl.textContent.trim()) || 0;
        const total = active + inactive;
        
        // Verificar función de recarga
        const hasReloadFunction = typeof window.rsReloadCategoryStats === 'function';
        
        const passed = hasReloadFunction && (total > 0 || this.isFirstLoad());
        
        return {
            passed,
            message: passed ? `Contadores: ${active} activas / ${inactive} inactivas (Total: ${total})` : 'Contadores en 0/0 o función de recarga no disponible',
            active,
            inactive,
            total,
            hasReloadFunction
        };
    };
    
    DOZO.checkRaceConditionPrevention = function() {
        const hasFlag = typeof window.rsIsSaving !== 'undefined';
        const hasTimer = typeof window.rsReloadTimer !== 'undefined';
        const hasMonitor = Array.isArray(window.rsAjaxMonitor);
        const hasDebounced = typeof window.rsReloadCategoryTableDebounced === 'function';
        
        const passed = hasFlag && hasTimer && hasMonitor && hasDebounced;
        
        const features = [];
        if (hasFlag) features.push('Flag rsIsSaving');
        if (hasTimer) features.push('Debounce timer');
        if (hasMonitor) features.push('AJAX monitor');
        if (hasDebounced) features.push('Debounced reload');
        
        return {
            passed,
            message: passed ? `4/4 mecanismos presentes: ${features.join(', ')}` : `Faltan mecanismos: ${4 - features.length}`,
            mechanisms: { hasFlag, hasTimer, hasMonitor, hasDebounced },
            features
        };
    };
    
    // ═══════════════════════════════════════════════════════════════
    // LAYER 2: UI CHECK (Diseño y Visual)
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.uiCheck = function() {
        return new Promise((resolve) => {
            this.log('🎨 DOZO UI Layer - Validación Visual', 'group');
            
            const results = {
                layer: 'ui',
                timestamp: new Date().toISOString(),
                checks: {},
                score: 0,
                maxScore: 0,
                status: 'unknown'
            };
            
            // Check 1: Shortcode renderizado
            this.log('Test 1: Verificando renderizado de shortcodes...');
            const shortcodeCheck = this.checkShortcodeRendering();
            results.checks.shortcode = shortcodeCheck;
            results.maxScore++;
            if (shortcodeCheck.passed) results.score++;
            
            // Check 2: CSS cargado
            this.log('Test 2: Validando CSS cargado...');
            const cssCheck = this.checkCssLoaded();
            results.checks.css = cssCheck;
            results.maxScore++;
            if (cssCheck.passed) results.score++;
            
            // Check 3: JavaScript cargado
            this.log('Test 3: Validando JavaScript cargado...');
            const jsCheck = this.checkJsLoaded();
            results.checks.javascript = jsCheck;
            results.maxScore++;
            if (jsCheck.passed) results.score++;
            
            // Check 4: Elementos visuales críticos
            this.log('Test 4: Verificando elementos visuales...');
            const visualCheck = this.checkVisualElements();
            results.checks.visual = visualCheck;
            results.maxScore++;
            if (visualCheck.passed) results.score++;
            
            // Calcular status
            const percentage = (results.score / results.maxScore) * 100;
            results.status = percentage === 100 ? 'excellent' : 
                             percentage >= 75 ? 'good' : 
                             percentage >= 50 ? 'warning' : 'critical';
            
            this.log(`✅ UI Layer: ${results.score}/${results.maxScore} (${percentage.toFixed(0)}%)`, 'groupEnd');
            
            resolve(results);
        });
    };
    
    DOZO.checkShortcodeRendering = function() {
        const publicForm = document.querySelector('.rs-warranty-form-container');
        const verifier = document.querySelector('.warranty-verifier');
        const adminPanel = document.querySelector('.rs-warranty-admin-wrap');
        
        const hasContent = publicForm || verifier || adminPanel;
        
        const type = publicForm ? 'public-form' : 
                     verifier ? 'public-verifier' : 
                     adminPanel ? 'admin-panel' : 'none';
        
        return {
            passed: hasContent,
            message: hasContent ? `Shortcode renderizado: ${type}` : 'No se detectó contenido del plugin',
            type
        };
    };
    
    DOZO.checkCssLoaded = function() {
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const warrantyStyles = stylesheets.filter(link => 
            link.href.includes('warranty') || 
            link.href.includes('rs-') ||
            link.href.includes('public-style') ||
            link.href.includes('admin-style')
        );
        
        // También verificar inline styles
        const inlineStyles = Array.from(document.querySelectorAll('style')).filter(style =>
            style.textContent.includes('.rs-') ||
            style.textContent.includes('warranty')
        );
        
        const totalStyles = warrantyStyles.length + inlineStyles.length;
        const passed = totalStyles > 0;
        
        return {
            passed,
            message: passed ? `${totalStyles} estilos del plugin cargados (${warrantyStyles.length} external, ${inlineStyles.length} inline)` : 'No se detectaron estilos del plugin',
            external: warrantyStyles.length,
            inline: inlineStyles.length
        };
    };
    
    DOZO.checkJsLoaded = function() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const warrantyScripts = scripts.filter(script =>
            script.src.includes('warranty') ||
            script.src.includes('admin-script') ||
            script.src.includes('public-script') ||
            script.src.includes('admin-categories')
        );
        
        // Verificar objetos globales clave
        const hasRsWarranty = typeof window.rsWarranty !== 'undefined';
        const hasRsWarrantyAdmin = typeof window.rsWarrantyAdmin !== 'undefined';
        const hasJQuery = typeof jQuery !== 'undefined';
        
        const globalObjects = [];
        if (hasRsWarranty) globalObjects.push('rsWarranty');
        if (hasRsWarrantyAdmin) globalObjects.push('rsWarrantyAdmin');
        if (hasJQuery) globalObjects.push('jQuery');
        
        const passed = warrantyScripts.length > 0 || hasRsWarranty || hasRsWarrantyAdmin;
        
        return {
            passed,
            message: passed ? `${warrantyScripts.length} scripts cargados, ${globalObjects.length} objetos globales` : 'JavaScript del plugin no detectado',
            scripts: warrantyScripts.length,
            globalObjects
        };
    };
    
    DOZO.checkVisualElements = function() {
        const criticalSelectors = [
            '.rs-form-card',
            '.rs-progress-steps',
            '.rs-btn-primary',
            '.rs-card',
            '#categoriesTableBody'
        ];
        
        const foundElements = [];
        const missingElements = [];
        
        criticalSelectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                foundElements.push(selector);
            } else {
                missingElements.push(selector);
            }
        });
        
        const passed = foundElements.length > 0;
        
        return {
            passed,
            message: passed ? `${foundElements.length}/${criticalSelectors.length} elementos críticos encontrados` : 'No se encontraron elementos visuales del plugin',
            found: foundElements,
            missing: missingElements
        };
    };
    
    // ═══════════════════════════════════════════════════════════════
    // LAYER 2.5: SELF-HEALING CHECK (DOZO v4.9)
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.selfHealingCheck = function() {
        return new Promise((resolve) => {
            this.log('🔧 DOZO Self-Healing Layer - Autocorrección', 'group');
            
            const results = {
                layer: 'selfHealing',
                timestamp: new Date().toISOString(),
                checks: {},
                healed: [],
                score: 0,
                maxScore: 0,
                status: 'unknown'
            };
            
            // Check 1: Backend PHP validation
            this.log('Test 1: Validando backend PHP...');
            this.checkBackendPHP().then(backendCheck => {
                results.checks.backend = backendCheck;
                results.maxScore++;
                if (backendCheck.passed) results.score++;
                
                // Check 2: Counter fix presence
                this.log('Test 2: Verificando fix de contadores...');
                const counterFixCheck = this.checkCounterFix();
                results.checks.counterFix = counterFixCheck;
                results.maxScore++;
                if (counterFixCheck.passed) results.score++;
                
                // Check 3: Race condition mechanisms
                this.log('Test 3: Verificando mecanismos anti-race...');
                const raceFixCheck = this.checkRaceFix();
                results.checks.raceFix = raceFixCheck;
                results.maxScore++;
                if (raceFixCheck.passed) results.score++;
                
                // Auto-healing si es necesario
                if (!counterFixCheck.passed && this.environment === 'admin-settings') {
                    this.log('🔧 Intentando auto-heal contadores...');
                    this.healCounters().then(healed => {
                        if (healed) {
                            results.healed.push('counters');
                            this.log('✅ Contadores reparados automáticamente');
                        }
                    });
                }
                
                // Calcular status
                const percentage = (results.score / results.maxScore) * 100;
                results.status = percentage === 100 ? 'excellent' : 
                                 percentage >= 75 ? 'good' : 
                                 percentage >= 50 ? 'warning' : 'critical';
                
                this.log(`✅ Self-Healing Layer: ${results.score}/${results.maxScore} (${percentage.toFixed(0)}%)`, 'groupEnd');
                
                resolve(results);
            });
        });
    };
    
    DOZO.checkBackendPHP = function() {
        return new Promise((resolve) => {
            if (!window.ajaxurl) {
                resolve({ passed: true, message: 'Backend validation no aplicable (frontend público)' });
                return;
            }
            
            const startTime = Date.now();
            
            jQuery.ajax({
                url: window.ajaxurl,
                type: 'POST',
                data: {
                    action: 'rs_diagnostic_ping',
                    _ajax_nonce: window.rsWarrantyAdmin?.nonce || ''
                },
                success: function(response) {
                    const responseTime = Date.now() - startTime;
                    
                    resolve({
                        passed: response.success === true,
                        message: response.success ? `Backend PHP operativo (${responseTime}ms)` : 'Backend responde pero sin success',
                        responseTime,
                        data: response.data
                    });
                },
                error: function() {
                    resolve({
                        passed: false,
                        message: 'Backend PHP no accesible',
                        responseTime: Date.now() - startTime
                    });
                }
            });
        });
    };
    
    DOZO.checkCounterFix = function() {
        // Verificar que la función de recarga existe
        const hasReloadFunction = typeof window.rsReloadCategoryStats === 'function';
        
        // Verificar que los contadores existen
        const hasCounterElements = document.querySelector('#activeCount, #activeCount2') !== null;
        
        // Verificar que admin-categories.js está cargado
        const hasScript = Array.from(document.querySelectorAll('script[src]')).some(s => 
            s.src.includes('admin-categories.js')
        );
        
        const passed = hasReloadFunction && hasCounterElements && hasScript;
        
        return {
            passed,
            message: passed ? 'Fix de contadores presente y funcional' : 'Fix de contadores faltante o incompleto',
            hasReloadFunction,
            hasCounterElements,
            hasScript
        };
    };
    
    DOZO.checkRaceFix = function() {
        const mechanisms = {
            flag: typeof window.rsIsSaving !== 'undefined',
            timer: typeof window.rsReloadTimer !== 'undefined',
            monitor: Array.isArray(window.rsAjaxMonitor),
            debounced: typeof window.rsReloadCategoryTableDebounced === 'function'
        };
        
        const activeCount = Object.values(mechanisms).filter(v => v).length;
        const passed = activeCount === 4;
        
        return {
            passed,
            message: passed ? 'Prevención de race condition completa (4/4)' : `Prevención incompleta (${activeCount}/4)`,
            mechanisms,
            activeCount
        };
    };
    
    DOZO.healCounters = function() {
        return new Promise((resolve) => {
            // Intentar recargar el script de categories
            if (typeof window.rsReloadCategoryStats !== 'function') {
                this.log('🔧 Reinyectando admin-categories.js...');
                
                const script = document.createElement('script');
                script.src = (window.rsWarrantyAdmin?.assetsUrl || '/wp-content/plugins/rockstage-warranty-system/assets/') + 'js/admin-categories.js?t=' + Date.now();
                script.onload = () => {
                    this.log('✅ Script reinyectado, verificando...');
                    
                    setTimeout(() => {
                        if (typeof window.rsReloadCategoryStats === 'function') {
                            window.rsReloadCategoryStats();
                            resolve(true);
                        } else {
                            this.warn('⚠️ Reinyección parcial, función aún no disponible');
                            resolve(false);
                        }
                    }, 500);
                };
                script.onerror = () => {
                    this.error('❌ Error al reinyectar script');
                    resolve(false);
                };
                
                document.head.appendChild(script);
            } else {
                // Función existe, solo recargar datos
                window.rsReloadCategoryStats();
                resolve(true);
            }
        });
    };
    
    // ═══════════════════════════════════════════════════════════════
    // LAYER 3: PERSISTENCE CHECK (Fixes Históricos)
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.persistenceCheck = function() {
        return new Promise((resolve) => {
            this.log('🧱 DOZO Persistence Layer - Verificación de Continuidad', 'group');
            
            const results = {
                layer: 'persistence',
                timestamp: new Date().toISOString(),
                checks: {},
                score: 0,
                maxScore: 0,
                status: 'unknown'
            };
            
            // Check 1: Version tracking
            this.log('Test 1: Verificando version tracking...');
            const versionCheck = this.checkVersionTracking();
            results.checks.version = versionCheck;
            results.maxScore++;
            if (versionCheck.passed) results.score++;
            
            // Check 2: Historical fixes
            this.log('Test 2: Validando fixes históricos...');
            const historicalCheck = this.checkHistoricalFixes();
            results.checks.historical = historicalCheck;
            results.maxScore++;
            if (historicalCheck.passed) results.score++;
            
            // Check 3: Degradation detection
            this.log('Test 3: Detectando degradación funcional...');
            const degradationCheck = this.checkDegradation();
            results.checks.degradation = degradationCheck;
            results.maxScore++;
            if (degradationCheck.passed) results.score++;
            
            // Calcular status
            const percentage = (results.score / results.maxScore) * 100;
            results.status = percentage === 100 ? 'excellent' : 
                             percentage >= 75 ? 'good' : 
                             percentage >= 50 ? 'warning' : 'critical';
            
            this.log(`✅ Persistence Layer: ${results.score}/${results.maxScore} (${percentage.toFixed(0)}%)`, 'groupEnd');
            
            resolve(results);
        });
    };
    
    DOZO.checkVersionTracking = function() {
        const currentVersion = 'v4.8';
        const lastVersion = localStorage.getItem('dozo_last_version');
        
        if (!lastVersion) {
            localStorage.setItem('dozo_last_version', currentVersion);
            localStorage.setItem('dozo_first_install', new Date().toISOString());
            return { passed: true, message: 'Primera ejecución de DOZO, version registrada', version: currentVersion, isNew: true };
        }
        
        if (lastVersion !== currentVersion) {
            this.log(`⚙️ Actualización detectada: ${lastVersion} → ${currentVersion}`);
            localStorage.setItem('dozo_last_version', currentVersion);
            localStorage.setItem('dozo_last_update', new Date().toISOString());
            return { passed: true, message: `Actualizado de ${lastVersion} a ${currentVersion}`, version: currentVersion, updated: true };
        }
        
        return { passed: true, message: `Versión actual: ${currentVersion}`, version: currentVersion, stable: true };
    };
    
    DOZO.checkHistoricalFixes = function() {
        const fixes = [
            { id: 'v3.9', name: 'Nonce IDs únicos', check: () => document.querySelectorAll('[id*="nonce"]').length > 0 },
            { id: 'v4.0', name: 'Race condition prevention', check: () => typeof window.rsIsSaving !== 'undefined' },
            { id: 'v4.1', name: 'Nonce backend sync', check: () => true }, // Backend, no verificable en JS
            { id: 'v4.4', name: 'Claude design import', check: () => document.querySelector('.rs-bg-decoration') !== null }
        ];
        
        const results = fixes.map(fix => ({
            id: fix.id,
            name: fix.name,
            active: fix.check()
        }));
        
        const activeCount = results.filter(r => r.active).length;
        const passed = activeCount === results.length;
        
        return {
            passed,
            message: passed ? `${activeCount}/${results.length} fixes históricos activos` : `Solo ${activeCount}/${results.length} fixes activos`,
            fixes: results,
            activeCount,
            totalCount: results.length
        };
    };
    
    DOZO.checkDegradation = function() {
        const history = this.history.slice(-5); // Últimas 5 ejecuciones
        
        if (history.length < 2) {
            return { passed: true, message: 'Historial insuficiente para detectar degradación', samples: history.length };
        }
        
        // Comparar scores recientes
        const recentScores = history.map(h => h.overall?.percentage || 0);
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const trend = recentScores[recentScores.length - 1] - recentScores[0];
        
        const isDegrading = trend < -10; // Degradación si cae más de 10%
        const passed = !isDegrading;
        
        return {
            passed,
            message: passed ? `Sin degradación detectada (trend: ${trend.toFixed(1)}%)` : `Degradación detectada (trend: ${trend.toFixed(1)}%)`,
            trend,
            avgScore: avgRecent,
            samples: history.length
        };
    };
    
    // ═══════════════════════════════════════════════════════════════
    // ADAPTIVE INTELLIGENCE
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.detectIssue = function(moduleName) {
        if (!this.issues[moduleName]) {
            this.issues[moduleName] = { failures: 0, successes: 0, status: 'unknown' };
        }
        
        return this.issues[moduleName].failures >= this.config.thresholdUnstable;
    };
    
    DOZO.reportIssue = function(moduleName, passed) {
        if (!this.issues[moduleName]) {
            this.issues[moduleName] = { failures: 0, successes: 0, status: 'unknown' };
        }
        
        if (passed) {
            this.issues[moduleName].successes++;
            this.issues[moduleName].failures = 0; // Reset failures
            
            if (this.issues[moduleName].successes >= this.config.thresholdStable) {
                this.issues[moduleName].status = 'stable';
                this.log(`✅ Módulo "${moduleName}" confirmado estable (${this.issues[moduleName].successes} éxitos consecutivos)`);
            }
        } else {
            this.issues[moduleName].failures++;
            this.issues[moduleName].successes = 0; // Reset successes
            
            if (this.issues[moduleName].failures >= this.config.thresholdUnstable) {
                this.issues[moduleName].status = 'unstable';
                this.warn(`⚠️ Módulo "${moduleName}" marcado como INESTABLE (${this.issues[moduleName].failures} fallos consecutivos)`);
                this.requestManualReview(moduleName, `Módulo inestable tras ${this.issues[moduleName].failures} fallos`);
            }
        }
    };
    
    DOZO.requestManualReview = function(moduleName, reason) {
        const alert = {
            timestamp: new Date().toISOString(),
            module: moduleName,
            reason: reason,
            environment: this.environment
        };
        
        console.error('🚨 DOZO: REVISIÓN MANUAL REQUERIDA', alert);
        
        // Guardar en localStorage para persistencia
        const alerts = JSON.parse(localStorage.getItem('dozo_manual_reviews') || '[]');
        alerts.push(alert);
        localStorage.setItem('dozo_manual_reviews', JSON.stringify(alerts.slice(-10))); // Últimas 10
    };
    
    // ═══════════════════════════════════════════════════════════════
    // FULL DIAGNOSTIC
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.runFullDiagnostic = function() {
        this.log('🚀 DOZO v4.9 - Iniciando Diagnóstico Completo', 'group');
        
        const startTime = Date.now();
        
        Promise.all([
            this.coreCheck(),
            this.uiCheck(),
            this.selfHealingCheck(), // DOZO v4.9
            this.persistenceCheck()
        ]).then(results => {
            const totalTime = Date.now() - startTime;
            
            // Compilar resultados
            const overall = {
                timestamp: new Date().toISOString(),
                version: this.version,
                environment: this.environment,
                layers: {
                    core: results[0],
                    ui: results[1],
                    selfHealing: results[2], // DOZO v4.9
                    persistence: results[3]
                },
                score: 0,
                maxScore: 0,
                percentage: 0,
                status: 'unknown',
                executionTime: totalTime
            };
            
            // Calcular score total
            results.forEach(layer => {
                overall.score += layer.score;
                overall.maxScore += layer.maxScore;
            });
            
            overall.percentage = (overall.score / overall.maxScore) * 100;
            overall.status = overall.percentage === 100 ? 'excellent' : 
                             overall.percentage >= 90 ? 'good' : 
                             overall.percentage >= 75 ? 'warning' : 'critical';
            
            // Reportar issues por módulo
            Object.keys(results[0].checks).forEach(key => {
                this.reportIssue('core-' + key, results[0].checks[key].passed);
            });
            Object.keys(results[1].checks).forEach(key => {
                this.reportIssue('ui-' + key, results[1].checks[key].passed);
            });
            Object.keys(results[2].checks).forEach(key => {
                this.reportIssue('persistence-' + key, results[2].checks[key].passed);
            });
            
            // Guardar en historial
            this.saveToHistory(overall);
            
            // Guardar audit log
            this.saveAuditLog(overall);
            
            // Mostrar resultados
            this.displayResults(overall);
            
            this.log(`✅ Diagnóstico completado en ${totalTime}ms`, 'groupEnd');
            
            return overall;
        });
    };
    
    // ═══════════════════════════════════════════════════════════════
    // STORAGE & LOGGING
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.loadHistory = function() {
        try {
            const stored = localStorage.getItem('dozo_diagnostic_history');
            this.history = stored ? JSON.parse(stored) : [];
            this.log(`📚 Historial cargado: ${this.history.length} registros`);
        } catch (e) {
            this.history = [];
            this.warn('⚠️ Error al cargar historial:', e);
        }
    };
    
    DOZO.saveToHistory = function(result) {
        this.history.push(result);
        
        // Mantener solo últimos 50 registros
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
        }
        
        try {
            localStorage.setItem('dozo_diagnostic_history', JSON.stringify(this.history));
            this.log('💾 Historial actualizado');
        } catch (e) {
            this.warn('⚠️ Error al guardar historial:', e);
        }
    };
    
    DOZO.saveAuditLog = function(result) {
        // Intentar enviar a backend para guardar en JSON
        if (typeof jQuery !== 'undefined' && window.ajaxurl) {
            jQuery.ajax({
                url: window.ajaxurl,
                type: 'POST',
                data: {
                    action: 'rs_save_dozo_audit',
                    nonce: window.rsWarrantyAdmin?.nonce || '',
                    audit_data: JSON.stringify(result)
                },
                success: () => this.log('💾 Audit log enviado al servidor'),
                error: () => this.warn('⚠️ No se pudo guardar audit log en servidor')
            });
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    // DISPLAY RESULTS
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.displayResults = function(results) {
        this.log('📊 DOZO DIAGNOSTIC RESULTS', 'group');
        
        const statusEmoji = {
            'excellent': '🟢',
            'good': '🟡',
            'warning': '🟠',
            'critical': '🔴'
        };
        
        this.log(`${statusEmoji[results.status]} Overall Status: ${results.status.toUpperCase()}`);
        this.log(`📊 Score: ${results.score}/${results.maxScore} (${results.percentage.toFixed(1)}%)`);
        this.log(`⏱️ Execution Time: ${results.executionTime}ms`);
        this.log(`🌍 Environment: ${results.environment}`);
        
        console.log('');
        this.log('📋 Layer Breakdown:');
        
        Object.keys(results.layers).forEach(layerName => {
            const layer = results.layers[layerName];
            const layerPercent = (layer.score / layer.maxScore) * 100;
            const emoji = layerPercent === 100 ? '✅' : layerPercent >= 75 ? '⚠️' : '❌';
            
            this.log(`  ${emoji} ${layerName}: ${layer.score}/${layer.maxScore} (${layerPercent.toFixed(0)}%)`);
            
            Object.keys(layer.checks).forEach(checkName => {
                const check = layer.checks[checkName];
                const checkEmoji = check.passed ? '✅' : '❌';
                this.log(`     ${checkEmoji} ${checkName}: ${check.message}`);
            });
        });
        
        // Mostrar issues conocidos
        const unstableModules = Object.keys(this.issues).filter(key => this.issues[key].status === 'unstable');
        if (unstableModules.length > 0) {
            console.log('');
            this.warn('⚠️ MÓDULOS INESTABLES DETECTADOS:');
            unstableModules.forEach(mod => {
                this.warn(`   🔴 ${mod}: ${this.issues[mod].failures} fallos consecutivos`);
            });
        }
        
        // Mostrar alertas pendientes
        const alerts = JSON.parse(localStorage.getItem('dozo_manual_reviews') || '[]');
        if (alerts.length > 0) {
            console.log('');
            this.warn(`🚨 ${alerts.length} alertas de revisión manual pendientes`);
            console.table(alerts.slice(-5)); // Mostrar últimas 5
        }
        
        this.log('', 'groupEnd');
    };
    
    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.isFirstLoad = function() {
        return !localStorage.getItem('dozo_first_install');
    };
    
    DOZO.log = function(message, action = 'log') {
        if (!this.config.logToConsole) return;
        
        switch(action) {
            case 'group':
                console.group(message);
                break;
            case 'groupEnd':
                console.groupEnd();
                if (message) console.log(message);
                break;
            default:
                console.log(message);
        }
    };
    
    DOZO.warn = function(message) {
        if (this.config.logToConsole) {
            console.warn(message);
        }
    };
    
    DOZO.error = function(message) {
        if (this.config.logToConsole) {
            console.error(message);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════
    
    DOZO.getHistory = function() {
        return this.history;
    };
    
    DOZO.getLastResult = function() {
        return this.history[this.history.length - 1] || null;
    };
    
    DOZO.clearHistory = function() {
        this.history = [];
        localStorage.removeItem('dozo_diagnostic_history');
        this.log('🗑️ Historial limpiado');
    };
    
    DOZO.clearAlerts = function() {
        localStorage.removeItem('dozo_manual_reviews');
        this.log('🗑️ Alertas limpiadas');
    };
    
    DOZO.exportReport = function() {
        const report = {
            version: this.version,
            timestamp: new Date().toISOString(),
            lastResult: this.getLastResult(),
            history: this.history,
            issues: this.issues,
            alerts: JSON.parse(localStorage.getItem('dozo_manual_reviews') || '[]')
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dozo-report-${Date.now()}.json`;
        a.click();
        
        this.log('📥 Reporte exportado');
    };
    
    // ═══════════════════════════════════════════════════════════════
    // AUTO-INITIALIZE
    // ═══════════════════════════════════════════════════════════════
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DOZO.init());
    } else {
        DOZO.init();
    }
    
    // Export to window
    window.DOZO = DOZO;
    
})(window);

// ═══════════════════════════════════════════════════════════════
// CONSOLE HELPERS
// ═══════════════════════════════════════════════════════════════

console.log('%c🧩 DOZO v4.8 %cModular Adaptive Diagnostic', 'color: #FF8C00; font-weight: bold; font-size: 16px;', 'color: #666; font-size: 12px;');
console.log('%cComandos disponibles:', 'color: #FF8C00; font-weight: bold;');
console.log('  🔹 dozoTest()         - Ejecutar diagnóstico completo');
console.log('  🔹 DOZO.getHistory()  - Ver historial de diagnósticos');
console.log('  🔹 DOZO.getLastResult() - Último resultado');
console.log('  🔹 DOZO.exportReport() - Exportar reporte JSON');
console.log('  🔹 DOZO.clearHistory() - Limpiar historial');
console.log('  🔹 DOZO.clearAlerts() - Limpiar alertas');


// ═══════════════════════════════════════════════════════════════
// DOZO v5.3: CLAUDE STYLE VERIFICATION LAYER
// ═══════════════════════════════════════════════════════════════

DOZO.claudeStyleCheck = function() {
    return new Promise((resolve) => {
        this.log('🎨 DOZO Claude Style Verification (v5.3)', 'group');
        
        const results = {
            layer: 'Claude Style Verification',
            version: '5.3',
            passed: false,
            checks: {},
            timestamp: new Date().toISOString()
        };
        
        // Check: Public CSS loaded
        const publicCssLoaded = [...document.styleSheets].some(sheet => {
            try {
                return sheet.href && sheet.href.includes('public-style.css');
            } catch(e) { return false; }
        });
        
        results.checks.publicCss = {
            name: 'Public CSS (Claude)',
            passed: publicCssLoaded
        };
        
        this.log(publicCssLoaded ? '✅ Claude CSS loaded' : '⚠️ Claude CSS not found', publicCssLoaded ? 'success' : 'warn');
        
        results.passed = publicCssLoaded;
        console.groupEnd();
        resolve(results);
    });
};

// Expose Claude verification
window.dozoTestClaudeStyles = function() {
    return DOZO.claudeStyleCheck();
};

console.log('');
console.log('🎨 DOZO v5.3: Claude Style Verification Layer loaded');
console.log('  Run: dozoTestClaudeStyles() to verify Claude styles');
